// Contas NightGetaway: criar conta, entrar e guardar o save na nuvem (Cloudflare D1).
// Tudo opcional: quem não tem conta joga igual a hoje, com o save só no aparelho.
// Segurança: senha nunca é guardada; fica só o hash PBKDF2-SHA256 com sal por conta.
// No banco fica só o hash do token da sessão, nunca o token em si.

const CORS = {
  'access-control-allow-origin': '*',
  'access-control-allow-methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'access-control-allow-headers': 'content-type,authorization',
  'access-control-max-age': '86400',
};
const json = (o, st = 200) => new Response(JSON.stringify(o), {
  status: st, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...CORS },
});
const erro = (motivo, st = 400) => json({ ok: false, erro: motivo }, st);

const ITER = 120000;                 // voltas do PBKDF2
const DIAS = 90;                     // validade da sessão
const MAX_SAVE = 200 * 1024;         // 200 KB por slot
const MAX_EXTRAS = 64 * 1024;
const SLOTS = 5;
const TENTATIVAS = 10, JANELA = 15 * 60;   // 10 tentativas a cada 15 min

const agora = () => Math.floor(Date.now() / 1000);
const hex = b => [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join('');
const bytes = n => crypto.getRandomValues(new Uint8Array(n));
const txt = new TextEncoder();

async function hashSenha(senha, sal) {
  const k = await crypto.subtle.importKey('raw', txt.encode(senha), 'PBKDF2', false, ['deriveBits']);
  const b = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: txt.encode(sal), iterations: ITER, hash: 'SHA-256' }, k, 256);
  return hex(b);
}
async function hashToken(t) { return hex(await crypto.subtle.digest('SHA-256', txt.encode(t))); }
function igual(a, b) {                      // comparação de tempo constante
  if (a.length !== b.length) return false;
  let d = 0;
  for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return d === 0;
}

const usuarioOk = u => typeof u === 'string' && /^[a-z0-9_.-]{3,20}$/.test(u.toLowerCase());
const senhaOk = s => typeof s === 'string' && s.length >= 8 && s.length <= 200;
const emailOk = e => !e || (typeof e === 'string' && e.length <= 120 && /^[^@\s]+@[^@\s.]+\.[^@\s]+$/.test(e));
const jogoOk = j => typeof j === 'string' && /^[a-z0-9-]{3,40}$/.test(j);
const limpa = s => String(s ?? '').replace(/[<>&"'`\u0000-\u001f]/g, '').trim().slice(0, 30);

async function corpo(request, max = MAX_SAVE + 4096) {
  const t = await request.text();
  if (t.length > max) return { _erro: 'grande' };
  try { return JSON.parse(t || '{}'); } catch { return { _erro: 'json' }; }
}

// ---------- limite de tentativas (usa o KV do ranking, se existir) ----------
async function barrado(env, chave) {
  if (!env.RANKING) return false;
  const n = parseInt(await env.RANKING.get('tent:' + chave) || '0', 10);
  return n >= TENTATIVAS;
}
async function contar(env, chave) {
  if (!env.RANKING) return;
  const n = parseInt(await env.RANKING.get('tent:' + chave) || '0', 10) + 1;
  await env.RANKING.put('tent:' + chave, String(n), { expirationTtl: JANELA });
}
async function zerar(env, chave) { if (env.RANKING) await env.RANKING.delete('tent:' + chave); }

// ---------- sessão ----------
async function novaSessao(env, conta, aparelho) {
  const token = hex(bytes(32));
  await env.DB.prepare('INSERT INTO sessoes (token_hash, conta, expira, aparelho) VALUES (?,?,?,?)')
    .bind(await hashToken(token), conta, agora() + DIAS * 86400, limpa(aparelho)).run();
  return token;
}
async function deToken(env, request) {
  const h = request.headers.get('authorization') || '';
  const m = /^Bearer\s+([0-9a-f]{64})$/i.exec(h.trim());
  if (!m) return null;
  const s = await env.DB.prepare('SELECT conta, expira FROM sessoes WHERE token_hash=?').bind(await hashToken(m[1])).first();
  if (!s) return null;
  if (s.expira < agora()) { await env.DB.prepare('DELETE FROM sessoes WHERE token_hash=?').bind(await hashToken(m[1])).run(); return null; }
  return { conta: s.conta, tokenHash: await hashToken(m[1]) };
}

// ---------- rotas ----------
async function criar({ request, env }) {
  const b = await corpo(request, 8192);
  if (b._erro) return erro(b._erro);
  const usuario = String(b.usuario || '').toLowerCase().trim();
  if (!usuarioOk(usuario)) return erro('usuario-invalido');
  if (!senhaOk(b.senha)) return erro('senha-curta');
  if (!emailOk(b.email)) return erro('email-invalido');
  const existe = await env.DB.prepare('SELECT id FROM contas WHERE usuario=?').bind(usuario).first();
  if (existe) return erro('usuario-existe', 409);
  const sal = hex(bytes(16));
  const id = crypto.randomUUID();
  try {
    await env.DB.prepare('INSERT INTO contas (id,usuario,email,senha_hash,senha_sal,apelido,criado,ultimo_login) VALUES (?,?,?,?,?,?,?,?)')
      .bind(id, usuario, b.email ? String(b.email).toLowerCase().trim() : null, await hashSenha(b.senha, sal), sal,
        limpa(b.apelido) || usuario, agora(), agora()).run();
  } catch (e) {
    return erro(String(e.message || '').includes('UNIQUE') ? 'usuario-existe' : 'banco', 409);
  }
  return json({ ok: true, token: await novaSessao(env, id, b.aparelho), usuario, apelido: limpa(b.apelido) || usuario });
}

async function entrar({ request, env }) {
  const b = await corpo(request, 8192);
  if (b._erro) return erro(b._erro);
  const usuario = String(b.usuario || '').toLowerCase().trim();
  const ip = request.headers.get('cf-connecting-ip') || 'x';
  if (await barrado(env, ip) || await barrado(env, 'u:' + usuario)) return erro('muitas-tentativas', 429);
  const c = await env.DB.prepare('SELECT id,senha_hash,senha_sal,apelido FROM contas WHERE usuario=?').bind(usuario).first();
  const sal = c ? c.senha_sal : 'x'.repeat(32);                 // calcula mesmo sem conta: não denuncia se o usuário existe
  const h = await hashSenha(String(b.senha || ''), sal);
  if (!c || !igual(h, c.senha_hash)) {
    await contar(env, ip); await contar(env, 'u:' + usuario);
    return erro('usuario-ou-senha', 401);
  }
  await zerar(env, ip); await zerar(env, 'u:' + usuario);
  await env.DB.prepare('UPDATE contas SET ultimo_login=? WHERE id=?').bind(agora(), c.id).run();
  return json({ ok: true, token: await novaSessao(env, c.id, b.aparelho), usuario, apelido: c.apelido || usuario });
}

async function sair({ env, sess }) {
  await env.DB.prepare('DELETE FROM sessoes WHERE token_hash=?').bind(sess.tokenHash).run();
  return json({ ok: true });
}

async function eu({ env, sess }) {
  const c = await env.DB.prepare('SELECT usuario,email,apelido,criado,ultimo_login FROM contas WHERE id=?').bind(sess.conta).first();
  if (!c) return erro('sem-conta', 404);
  return json({ ok: true, ...c });
}

async function apelidar({ request, env, sess }) {
  const b = await corpo(request, 4096);
  if (b._erro) return erro(b._erro);
  const ap = limpa(b.apelido);
  if (!ap) return erro('apelido-vazio');
  await env.DB.prepare('UPDATE contas SET apelido=? WHERE id=?').bind(ap, sess.conta).run();
  return json({ ok: true, apelido: ap });
}

async function apagarConta({ env, sess }) {
  await env.DB.batch([
    env.DB.prepare('DELETE FROM saves WHERE conta=?').bind(sess.conta),
    env.DB.prepare('DELETE FROM extras WHERE conta=?').bind(sess.conta),
    env.DB.prepare('DELETE FROM sessoes WHERE conta=?').bind(sess.conta),
    env.DB.prepare('DELETE FROM contas WHERE id=?').bind(sess.conta),
  ]);
  return json({ ok: true });
}

async function listarSaves({ request, env, sess }) {
  const jogo = new URL(request.url).searchParams.get('jogo') || 'porto-sombrio';
  if (!jogoOk(jogo)) return erro('jogo-invalido');
  const r = await env.DB.prepare('SELECT slot,versao_jogo,atualizado,resumo,length(dados) AS bytes FROM saves WHERE conta=? AND jogo=? ORDER BY slot')
    .bind(sess.conta, jogo).all();
  return json({ ok: true, slots: r.results || [] });
}

async function lerSave({ env, sess, jogo, slot }) {
  const r = await env.DB.prepare('SELECT dados,versao_jogo,atualizado,resumo FROM saves WHERE conta=? AND jogo=? AND slot=?')
    .bind(sess.conta, jogo, slot).first();
  if (!r) return erro('sem-save', 404);
  return json({ ok: true, ...r });
}

async function gravarSave({ request, env, sess, jogo, slot }) {
  const b = await corpo(request);
  if (b._erro) return erro(b._erro === 'grande' ? 'save-grande' : b._erro, b._erro === 'grande' ? 413 : 400);
  const dados = typeof b.dados === 'string' ? b.dados : JSON.stringify(b.dados ?? null);
  if (!dados || dados === 'null') return erro('sem-dados');
  if (dados.length > MAX_SAVE) return erro('save-grande', 413);
  await env.DB.prepare(
    'INSERT INTO saves (conta,jogo,slot,dados,versao_jogo,atualizado,resumo) VALUES (?,?,?,?,?,?,?) ' +
    'ON CONFLICT(conta,jogo,slot) DO UPDATE SET dados=excluded.dados, versao_jogo=excluded.versao_jogo, atualizado=excluded.atualizado, resumo=excluded.resumo')
    .bind(sess.conta, jogo, slot, dados, limpa(b.versao_jogo), agora(), limpa(b.resumo)).run();
  return json({ ok: true, atualizado: agora() });
}

async function apagarSave({ env, sess, jogo, slot }) {
  await env.DB.prepare('DELETE FROM saves WHERE conta=? AND jogo=? AND slot=?').bind(sess.conta, jogo, slot).run();
  return json({ ok: true });
}

async function lerExtras({ env, sess, jogo }) {
  const r = await env.DB.prepare('SELECT chave,valor FROM extras WHERE conta=? AND jogo=?').bind(sess.conta, jogo).all();
  const o = {};
  for (const l of r.results || []) o[l.chave] = l.valor;
  return json({ ok: true, extras: o });
}

async function gravarExtras({ request, env, sess, jogo }) {
  const b = await corpo(request, MAX_EXTRAS + 2048);
  if (b._erro) return erro(b._erro);
  const e = b.extras && typeof b.extras === 'object' ? b.extras : null;
  if (!e) return erro('sem-extras');
  const chaves = Object.keys(e).slice(0, 60);
  if (JSON.stringify(e).length > MAX_EXTRAS) return erro('extras-grande', 413);
  await env.DB.batch(chaves.map(k => env.DB.prepare(
    'INSERT INTO extras (conta,jogo,chave,valor) VALUES (?,?,?,?) ON CONFLICT(conta,jogo,chave) DO UPDATE SET valor=excluded.valor')
    .bind(sess.conta, jogo, String(k).slice(0, 40), String(e[k] ?? '').slice(0, 2000))));
  return json({ ok: true });
}

// ---------- entrada ----------
export async function contas(url, request, env) {
  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: CORS });
  if (!env.DB) return json({ ok: false, erro: 'contas ainda não ligadas' }, 503);
  const p = url.pathname.replace(/\/+$/, '');
  const met = request.method;
  const ctx = { request, env };

  if (p === '/api/conta/criar' && met === 'POST') return criar(ctx);
  if (p === '/api/conta/entrar' && met === 'POST') return entrar(ctx);

  const sess = await deToken(env, request);
  if (!sess) return erro('entre na sua conta', 401);
  ctx.sess = sess;

  if (p === '/api/conta/sair' && met === 'POST') return sair(ctx);
  if (p === '/api/conta/eu' && met === 'GET') return eu(ctx);
  if (p === '/api/conta/apelido' && met === 'PUT') return apelidar(ctx);
  if (p === '/api/conta' && met === 'DELETE') return apagarConta(ctx);
  if (p === '/api/saves' && met === 'GET') return listarSaves(ctx);

  let m = /^\/api\/saves\/([a-z0-9-]{3,40})\/([1-9])$/.exec(p);
  if (m) {
    const jogo = m[1], slot = parseInt(m[2], 10);
    if (slot < 1 || slot > SLOTS) return erro('slot-invalido');
    Object.assign(ctx, { jogo, slot });
    if (met === 'GET') return lerSave(ctx);
    if (met === 'PUT') return gravarSave(ctx);
    if (met === 'DELETE') return apagarSave(ctx);
    return erro('método', 405);
  }
  m = /^\/api\/extras\/([a-z0-9-]{3,40})$/.exec(p);
  if (m) {
    ctx.jogo = m[1];
    if (met === 'GET') return lerExtras(ctx);
    if (met === 'PUT') return gravarExtras(ctx);
    return erro('método', 405);
  }
  return erro('rota', 404);
}
