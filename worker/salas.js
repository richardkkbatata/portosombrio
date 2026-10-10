// Servidor do multiplayer na Cloudflare (Durable Object). Mesmas regras de server/server.js (Render):
// salas com código de 4 letras e repasse de mensagens. Quem manda no mundo continua sendo o anfitrião.
//   {t:'host'} -> {t:'room',code,id:'0'}            {t:'join',code} -> {t:'joined',id} (+ anfitrião: {t:'peer-open',id})
//   {t:'relay',to:'0'|'1'..'4'|'*',m:"texto"} -> {t:'msg',from,m}   {t:'ping',n} -> {t:'pong',n}
//   convidado caiu -> anfitrião recebe {t:'peer-close',id}; anfitrião caiu -> todos {t:'room-closed'}
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_SALA = 5, MAX_MSG = 64 * 1024, MAX_SALAS = 2000;
const TAXA = 120, RAJADA = 240;              // mensagens por segundo por conexão (balde de fichas)
const SILENCIO_MS = 70 * 1000;                // o jogo manda ping a cada 20 s; quem some por 70 s cai
const SALA_VAZIA_MS = 30 * 60 * 1000, SALA_MAX_MS = 6 * 60 * 60 * 1000;

export class Salas {
  constructor(state, env) {
    this.salas = new Map();   // código -> {code, host, guests: Map(id->ws), criada, vazia}
    this.info = new Map();    // ws -> {sala, id, fichas, ultima, visto, caiu}
    this.tique = null;
  }

  async fetch(request) {
    if ((request.headers.get('upgrade') || '').toLowerCase() !== 'websocket')
      return new Response('use WebSocket', { status: 426 });
    const par = new WebSocketPair(), cli = par[0], ws = par[1];
    ws.accept();
    const agora = Date.now();
    this.info.set(ws, { sala: null, id: null, fichas: RAJADA, ultima: agora, visto: agora, caiu: false });
    ws.addEventListener('message', e => this.mensagem(ws, e.data));
    ws.addEventListener('close', () => this.fim(ws));
    ws.addEventListener('error', () => this.fim(ws));
    if (!this.tique) this.tique = setInterval(() => this.limpeza(), 25000);
    return new Response(null, { status: 101, webSocket: cli });
  }

  enviar(ws, o) { try { ws.send(typeof o === 'string' ? o : JSON.stringify(o)); } catch (e) { } }
  derruba(ws, cod, txt) { const i = this.info.get(ws); if (i) i.caiu = true; try { ws.close(cod, txt); } catch (e) { } this.fim(ws); }

  novoCodigo() {
    for (let n = 0; n < 200; n++) {
      let c = ''; for (let i = 0; i < 4; i++) c += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
      if (!this.salas.has(c)) return c;
    }
    return null;
  }

  fecharSala(sala) {
    if (!this.salas.has(sala.code)) return;
    this.salas.delete(sala.code);
    for (const g of sala.guests.values()) {
      const i = this.info.get(g); if (i) { i.sala = null; i.id = null; }
      this.enviar(g, { t: 'room-closed' }); try { g.close(1000, 'sala fechada'); } catch (e) { }
    }
    sala.guests.clear();
  }

  sair(ws) {
    const i = this.info.get(ws); if (!i || !i.sala) return;
    const sala = i.sala; i.sala = null;
    if (i.id === '0') { this.fecharSala(sala); i.id = null; return; }
    if (sala.guests.get(i.id) === ws) { sala.guests.delete(i.id); this.enviar(sala.host, { t: 'peer-close', id: i.id }); }
    i.id = null;
  }

  fim(ws) {
    if (!this.info.has(ws)) return;
    this.sair(ws); this.info.delete(ws);
    if (!this.info.size && this.tique) { clearInterval(this.tique); this.tique = null; }
  }

  mensagem(ws, raw) {
    const i = this.info.get(ws); if (!i || i.caiu) return;
    const agora = Date.now();
    i.visto = agora;
    i.fichas = Math.min(RAJADA, i.fichas + (agora - i.ultima) * TAXA / 1000); i.ultima = agora;
    if (--i.fichas < 0) return this.derruba(ws, 1008, 'mensagens demais');
    if (typeof raw !== 'string') return this.derruba(ws, 1003, 'só texto');
    if (raw.length > MAX_MSG + 512) return this.derruba(ws, 1009, 'mensagem grande demais');
    let m; try { m = JSON.parse(raw); } catch (e) { return this.enviar(ws, { t: 'err', msg: 'invalida' }); }
    if (!m || typeof m !== 'object' || typeof m.t !== 'string') return this.enviar(ws, { t: 'err', msg: 'invalida' });

    switch (m.t) {
      case 'host': {
        if (i.sala) return this.enviar(ws, { t: 'err', msg: 'ja-na-sala' });
        const code = this.salas.size < MAX_SALAS && this.novoCodigo();
        if (!code) return this.enviar(ws, { t: 'err', msg: 'lotado' });
        const sala = { code, host: ws, guests: new Map(), criada: agora, vazia: agora };
        this.salas.set(code, sala); i.sala = sala; i.id = '0';
        return this.enviar(ws, { t: 'room', code, id: '0' });
      }
      case 'join': {
        if (i.sala) return this.enviar(ws, { t: 'err', msg: 'ja-na-sala' });
        const code = typeof m.code === 'string' ? m.code.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
        const sala = code.length === 4 && this.salas.get(code);
        if (!sala) return this.enviar(ws, { t: 'err', msg: 'nao-encontrada' });
        let id = null;
        for (let k = 1; k < MAX_SALA; k++) if (!sala.guests.has(String(k))) { id = String(k); break; }
        if (!id) return this.enviar(ws, { t: 'err', msg: 'cheia' });
        sala.guests.set(id, ws); sala.vazia = 0; i.sala = sala; i.id = id;
        this.enviar(ws, { t: 'joined', id });
        return this.enviar(sala.host, { t: 'peer-open', id });
      }
      case 'relay': {
        const sala = i.sala;
        if (!sala) return this.enviar(ws, { t: 'err', msg: 'sem-sala' });
        if (typeof m.m !== 'string' || m.m.length > MAX_MSG) return this.enviar(ws, { t: 'err', msg: 'invalida' });
        const to = m.to;
        if (typeof to !== 'string' || !/^(\*|[0-4])$/.test(to)) return this.enviar(ws, { t: 'err', msg: 'invalida' });
        const s = JSON.stringify({ t: 'msg', from: i.id, m: m.m });
        const manda = alvo => { if (alvo && alvo !== ws) this.enviar(alvo, s); };
        if (to === '*') { manda(sala.host); for (const g of sala.guests.values()) manda(g); }
        else if (i.id === '0') manda(to === '0' ? null : sala.guests.get(to));
        else if (to === '0') manda(sala.host);
        return;
      }
      case 'leave': return this.sair(ws);
      case 'ping': return this.enviar(ws, { t: 'pong', n: typeof m.n === 'number' ? m.n : 0 });
      default: return this.enviar(ws, { t: 'err', msg: 'invalida' });
    }
  }

  limpeza() {
    const agora = Date.now();
    for (const [ws, i] of this.info) if (agora - i.visto > SILENCIO_MS) this.derruba(ws, 1001, 'sem resposta');
    for (const sala of this.salas.values()) {
      if (sala.guests.size > 0) sala.vazia = 0; else if (!sala.vazia) sala.vazia = agora;
      const expira = agora - sala.criada > SALA_MAX_MS || (sala.vazia && agora - sala.vazia > SALA_VAZIA_MS);
      if (expira) { const h = sala.host; this.enviar(h, { t: 'room-closed' }); const ih = this.info.get(h); if (ih) ih.sala = null; this.fecharSala(sala); }
    }
  }
}
