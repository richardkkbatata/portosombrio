var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// worker/salas.js
var ALFABETO = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
var MAX_SALA = 5;
var MAX_MSG = 64 * 1024;
var MAX_SALAS = 2e3;
var TAXA = 120;
var RAJADA = 240;
var SILENCIO_MS = 70 * 1e3;
var SALA_VAZIA_MS = 30 * 60 * 1e3;
var SALA_MAX_MS = 6 * 60 * 60 * 1e3;
var Salas = class {
  static {
    __name(this, "Salas");
  }
  constructor(state, env) {
    this.salas = /* @__PURE__ */ new Map();
    this.info = /* @__PURE__ */ new Map();
    this.tique = null;
  }
  async fetch(request) {
    if ((request.headers.get("upgrade") || "").toLowerCase() !== "websocket")
      return new Response("use WebSocket", { status: 426 });
    const par = new WebSocketPair(), cli = par[0], ws = par[1];
    ws.accept();
    const agora = Date.now();
    this.info.set(ws, { sala: null, id: null, fichas: RAJADA, ultima: agora, visto: agora, caiu: false });
    ws.addEventListener("message", (e) => this.mensagem(ws, e.data));
    ws.addEventListener("close", () => this.fim(ws));
    ws.addEventListener("error", () => this.fim(ws));
    if (!this.tique) this.tique = setInterval(() => this.limpeza(), 25e3);
    return new Response(null, { status: 101, webSocket: cli });
  }
  enviar(ws, o) {
    try {
      ws.send(typeof o === "string" ? o : JSON.stringify(o));
    } catch (e) {
    }
  }
  derruba(ws, cod, txt) {
    const i = this.info.get(ws);
    if (i) i.caiu = true;
    try {
      ws.close(cod, txt);
    } catch (e) {
    }
    this.fim(ws);
  }
  novoCodigo() {
    for (let n = 0; n < 200; n++) {
      let c = "";
      for (let i = 0; i < 4; i++) c += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
      if (!this.salas.has(c)) return c;
    }
    return null;
  }
  fecharSala(sala) {
    if (!this.salas.has(sala.code)) return;
    this.salas.delete(sala.code);
    for (const g of sala.guests.values()) {
      const i = this.info.get(g);
      if (i) {
        i.sala = null;
        i.id = null;
      }
      this.enviar(g, { t: "room-closed" });
      try {
        g.close(1e3, "sala fechada");
      } catch (e) {
      }
    }
    sala.guests.clear();
  }
  sair(ws) {
    const i = this.info.get(ws);
    if (!i || !i.sala) return;
    const sala = i.sala;
    i.sala = null;
    if (i.id === "0") {
      this.fecharSala(sala);
      i.id = null;
      return;
    }
    if (sala.guests.get(i.id) === ws) {
      sala.guests.delete(i.id);
      this.enviar(sala.host, { t: "peer-close", id: i.id });
    }
    i.id = null;
  }
  fim(ws) {
    if (!this.info.has(ws)) return;
    this.sair(ws);
    this.info.delete(ws);
    if (!this.info.size && this.tique) {
      clearInterval(this.tique);
      this.tique = null;
    }
  }
  mensagem(ws, raw) {
    const i = this.info.get(ws);
    if (!i || i.caiu) return;
    const agora = Date.now();
    i.visto = agora;
    i.fichas = Math.min(RAJADA, i.fichas + (agora - i.ultima) * TAXA / 1e3);
    i.ultima = agora;
    if (--i.fichas < 0) return this.derruba(ws, 1008, "mensagens demais");
    if (typeof raw !== "string") return this.derruba(ws, 1003, "s\xF3 texto");
    if (raw.length > MAX_MSG + 512) return this.derruba(ws, 1009, "mensagem grande demais");
    let m;
    try {
      m = JSON.parse(raw);
    } catch (e) {
      return this.enviar(ws, { t: "err", msg: "invalida" });
    }
    if (!m || typeof m !== "object" || typeof m.t !== "string") return this.enviar(ws, { t: "err", msg: "invalida" });
    switch (m.t) {
      case "host": {
        if (i.sala) return this.enviar(ws, { t: "err", msg: "ja-na-sala" });
        const code = this.salas.size < MAX_SALAS && this.novoCodigo();
        if (!code) return this.enviar(ws, { t: "err", msg: "lotado" });
        const sala = { code, host: ws, guests: /* @__PURE__ */ new Map(), criada: agora, vazia: agora };
        this.salas.set(code, sala);
        i.sala = sala;
        i.id = "0";
        return this.enviar(ws, { t: "room", code, id: "0" });
      }
      case "join": {
        if (i.sala) return this.enviar(ws, { t: "err", msg: "ja-na-sala" });
        const code = typeof m.code === "string" ? m.code.toUpperCase().replace(/[^A-Z0-9]/g, "") : "";
        const sala = code.length === 4 && this.salas.get(code);
        if (!sala) return this.enviar(ws, { t: "err", msg: "nao-encontrada" });
        let id = null;
        for (let k = 1; k < MAX_SALA; k++) if (!sala.guests.has(String(k))) {
          id = String(k);
          break;
        }
        if (!id) return this.enviar(ws, { t: "err", msg: "cheia" });
        sala.guests.set(id, ws);
        sala.vazia = 0;
        i.sala = sala;
        i.id = id;
        this.enviar(ws, { t: "joined", id });
        return this.enviar(sala.host, { t: "peer-open", id });
      }
      case "relay": {
        const sala = i.sala;
        if (!sala) return this.enviar(ws, { t: "err", msg: "sem-sala" });
        if (typeof m.m !== "string" || m.m.length > MAX_MSG) return this.enviar(ws, { t: "err", msg: "invalida" });
        const to = m.to;
        if (typeof to !== "string" || !/^(\*|[0-4])$/.test(to)) return this.enviar(ws, { t: "err", msg: "invalida" });
        const s = JSON.stringify({ t: "msg", from: i.id, m: m.m });
        const manda = /* @__PURE__ */ __name((alvo) => {
          if (alvo && alvo !== ws) this.enviar(alvo, s);
        }, "manda");
        if (to === "*") {
          manda(sala.host);
          for (const g of sala.guests.values()) manda(g);
        } else if (i.id === "0") manda(to === "0" ? null : sala.guests.get(to));
        else if (to === "0") manda(sala.host);
        return;
      }
      case "leave":
        return this.sair(ws);
      case "ping":
        return this.enviar(ws, { t: "pong", n: typeof m.n === "number" ? m.n : 0 });
      default:
        return this.enviar(ws, { t: "err", msg: "invalida" });
    }
  }
  limpeza() {
    const agora = Date.now();
    for (const [ws, i] of this.info) if (agora - i.visto > SILENCIO_MS) this.derruba(ws, 1001, "sem resposta");
    for (const sala of this.salas.values()) {
      if (sala.guests.size > 0) sala.vazia = 0;
      else if (!sala.vazia) sala.vazia = agora;
      const expira = agora - sala.criada > SALA_MAX_MS || sala.vazia && agora - sala.vazia > SALA_VAZIA_MS;
      if (expira) {
        const h = sala.host;
        this.enviar(h, { t: "room-closed" });
        const ih = this.info.get(h);
        if (ih) ih.sala = null;
        this.fecharSala(sala);
      }
    }
  }
};

// worker/index.js
var CORS = { "access-control-allow-origin": "*", "access-control-allow-methods": "GET,POST,OPTIONS", "access-control-allow-headers": "content-type" };
var json = /* @__PURE__ */ __name((o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...CORS } }), "json");
var limpa = /* @__PURE__ */ __name((s) => String(s || "").replace(/[<>&"'`\u0000-\u001f]/g, "").trim().slice(0, 60), "limpa");
var modoOk = /* @__PURE__ */ __name((m) => m === "equipe" ? "equipe" : "solo", "modoOk");
async function opcoes() {
  return new Response(null, { status: 204, headers: CORS });
}
__name(opcoes, "opcoes");
async function ler({ request, env }) {
  const modo = modoOk(new URL(request.url).searchParams.get("modo"));
  if (!env.RANKING) return json({ top: [], aviso: "ranking ainda n\xE3o ligado" });
  const top = await env.RANKING.get("top:" + modo, "json") || [];
  return json({ top: top.slice(0, 10) });
}
__name(ler, "ler");
async function gravar({ request, env }) {
  if (!env.RANKING) return json({ ok: false, motivo: "sem-kv" }, 503);
  let b;
  try {
    b = await request.json();
  } catch (e) {
    return json({ ok: false, motivo: "json" }, 400);
  }
  const onda = b.onda | 0, kills = b.kills | 0, modo = modoOk(b.modo);
  const jog = (Array.isArray(b.jogadores) ? b.jogadores : []).slice(0, 5).map(limpa).filter(Boolean);
  const equipe = limpa(b.equipe) || jog.join(" + ");
  if (!equipe || onda < 1 || onda > 300 || kills < 0 || kills > onda * 400) return json({ ok: false, motivo: "dados" }, 400);
  const ip = request.headers.get("cf-connecting-ip") || "x";
  if (await env.RANKING.get("ip:" + ip)) return json({ ok: false, motivo: "devagar" }, 429);
  await env.RANKING.put("ip:" + ip, "1", { expirationTtl: 60 });
  const k = "top:" + modo, top = await env.RANKING.get(k, "json") || [];
  const i = top.findIndex((r) => r.equipe.toLowerCase() === equipe.toLowerCase());
  const novo = { equipe, onda, kills, data: (/* @__PURE__ */ new Date()).toISOString().slice(0, 10) };
  if (i >= 0) {
    if (top[i].onda > onda || top[i].onda === onda && top[i].kills >= kills) return json({ ok: true, recorde: false });
    top.splice(i, 1);
  }
  top.push(novo);
  top.sort((a, b2) => b2.onda - a.onda || b2.kills - a.kills);
  await env.RANKING.put(k, JSON.stringify(top.slice(0, 50)));
  return json({ ok: true, recorde: true, pos: top.indexOf(novo) + 1 });
}
__name(gravar, "gravar");
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/ws") {
      if (!env.SALAS) return new Response("multiplayer desligado", { status: 503 });
      const id = env.SALAS.idFromName("central");
      return env.SALAS.get(id, { locationHint: "sam" }).fetch(request);
    }
    if (url.pathname === "/health")
      return new Response("ok", { headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store", ...CORS } });
    if (url.pathname === "/api/ranking" || url.pathname === "/api/ranking/") {
      const c = { request, env, ctx };
      if (request.method === "OPTIONS") return opcoes(c);
      if (request.method === "POST") return gravar(c);
      if (request.method === "GET" || request.method === "HEAD") return ler(c);
      return new Response("m\xE9todo n\xE3o permitido", { status: 405 });
    }
    return env.ASSETS.fetch(request);
  }
};

// ../../../tmp/claude-0/-home-user-portosombrio/8f311d9a-768e-5703-8d38-182c64cb6b7d/scratchpad/wr/node_modules/wrangler/templates/middleware/middleware-ensure-req-body-drained.ts
var drainBody = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } finally {
    try {
      if (request.body !== null && !request.bodyUsed) {
        const reader = request.body.getReader();
        while (!(await reader.read()).done) {
        }
      }
    } catch (e) {
      console.error("Failed to drain the unused request body.", e);
    }
  }
}, "drainBody");
var middleware_ensure_req_body_drained_default = drainBody;

// ../../../tmp/claude-0/-home-user-portosombrio/8f311d9a-768e-5703-8d38-182c64cb6b7d/scratchpad/wr/node_modules/wrangler/templates/middleware/middleware-miniflare3-json-error.ts
function reduceError(e) {
  return {
    name: e?.name,
    message: e?.message ?? String(e),
    stack: e?.stack,
    cause: e?.cause === void 0 ? void 0 : reduceError(e.cause)
  };
}
__name(reduceError, "reduceError");
var jsonError = /* @__PURE__ */ __name(async (request, env, _ctx, middlewareCtx) => {
  try {
    return await middlewareCtx.next(request, env);
  } catch (e) {
    const error = reduceError(e);
    const body = JSON.stringify(error);
    const headers = {
      "Content-Type": "application/json",
      "MF-Experimental-Error-Stack": "true"
    };
    const encoded = encodeURIComponent(body);
    if (encoded.length <= 8192) {
      headers["MF-Experimental-Error-Stack-Payload"] = encoded;
    }
    return new Response(body, { status: 500, headers });
  }
}, "jsonError");
var middleware_miniflare3_json_error_default = jsonError;

// .wrangler/tmp/bundle-adBQUj/middleware-insertion-facade.js
var __INTERNAL_WRANGLER_MIDDLEWARE__ = [
  middleware_ensure_req_body_drained_default,
  middleware_miniflare3_json_error_default
];
var middleware_insertion_facade_default = worker_default;

// ../../../tmp/claude-0/-home-user-portosombrio/8f311d9a-768e-5703-8d38-182c64cb6b7d/scratchpad/wr/node_modules/wrangler/templates/middleware/common.ts
var __facade_middleware__ = [];
function __facade_register__(...args) {
  __facade_middleware__.push(...args.flat());
}
__name(__facade_register__, "__facade_register__");
function __facade_invokeChain__(request, env, ctx, dispatch, middlewareChain) {
  const [head, ...tail] = middlewareChain;
  const middlewareCtx = {
    dispatch,
    next(newRequest, newEnv) {
      return __facade_invokeChain__(newRequest, newEnv, ctx, dispatch, tail);
    }
  };
  return head(request, env, ctx, middlewareCtx);
}
__name(__facade_invokeChain__, "__facade_invokeChain__");
function __facade_invoke__(request, env, ctx, dispatch, finalMiddleware) {
  return __facade_invokeChain__(request, env, ctx, dispatch, [
    ...__facade_middleware__,
    finalMiddleware
  ]);
}
__name(__facade_invoke__, "__facade_invoke__");

// .wrangler/tmp/bundle-adBQUj/middleware-loader.entry.ts
var __Facade_ScheduledController__ = class ___Facade_ScheduledController__ {
  constructor(scheduledTime, cron, noRetry) {
    this.scheduledTime = scheduledTime;
    this.cron = cron;
    this.#noRetry = noRetry;
  }
  scheduledTime;
  cron;
  static {
    __name(this, "__Facade_ScheduledController__");
  }
  #noRetry;
  noRetry() {
    if (!(this instanceof ___Facade_ScheduledController__)) {
      throw new TypeError("Illegal invocation");
    }
    this.#noRetry();
  }
};
function wrapExportedHandler(worker) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return worker;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  const fetchDispatcher = /* @__PURE__ */ __name(function(request, env, ctx) {
    if (worker.fetch === void 0) {
      throw new Error("Handler does not export a fetch() function.");
    }
    return worker.fetch(request, env, ctx);
  }, "fetchDispatcher");
  return {
    ...worker,
    fetch(request, env, ctx) {
      const dispatcher = /* @__PURE__ */ __name(function(type, init) {
        if (type === "scheduled" && worker.scheduled !== void 0) {
          const controller = new __Facade_ScheduledController__(
            Date.now(),
            init.cron ?? "",
            () => {
            }
          );
          return worker.scheduled(controller, env, ctx);
        }
      }, "dispatcher");
      return __facade_invoke__(request, env, ctx, dispatcher, fetchDispatcher);
    }
  };
}
__name(wrapExportedHandler, "wrapExportedHandler");
function wrapWorkerEntrypoint(klass) {
  if (__INTERNAL_WRANGLER_MIDDLEWARE__ === void 0 || __INTERNAL_WRANGLER_MIDDLEWARE__.length === 0) {
    return klass;
  }
  for (const middleware of __INTERNAL_WRANGLER_MIDDLEWARE__) {
    __facade_register__(middleware);
  }
  return class extends klass {
    #fetchDispatcher = /* @__PURE__ */ __name((request, env, ctx) => {
      this.env = env;
      this.ctx = ctx;
      if (super.fetch === void 0) {
        throw new Error("Entrypoint class does not define a fetch() function.");
      }
      return super.fetch(request);
    }, "#fetchDispatcher");
    #dispatcher = /* @__PURE__ */ __name((type, init) => {
      if (type === "scheduled" && super.scheduled !== void 0) {
        const controller = new __Facade_ScheduledController__(
          Date.now(),
          init.cron ?? "",
          () => {
          }
        );
        return super.scheduled(controller);
      }
    }, "#dispatcher");
    fetch(request) {
      return __facade_invoke__(
        request,
        this.env,
        this.ctx,
        this.#dispatcher,
        this.#fetchDispatcher
      );
    }
  };
}
__name(wrapWorkerEntrypoint, "wrapWorkerEntrypoint");
var WRAPPED_ENTRY;
if (typeof middleware_insertion_facade_default === "object") {
  WRAPPED_ENTRY = wrapExportedHandler(middleware_insertion_facade_default);
} else if (typeof middleware_insertion_facade_default === "function") {
  WRAPPED_ENTRY = wrapWorkerEntrypoint(middleware_insertion_facade_default);
}
var middleware_loader_entry_default = WRAPPED_ENTRY;
export {
  Salas,
  __INTERNAL_WRANGLER_MIDDLEWARE__,
  middleware_loader_entry_default as default
};
//# sourceMappingURL=index.js.map
