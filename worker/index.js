// Worker do site: entrega os arquivos de site/ (ativos estáticos), responde /api/ranking
// e é o servidor do multiplayer (/ws, salas num Durable Object perto do Brasil; /health).
import { Salas } from './salas.js';
export { Salas };
// O ranking guarda no KV ligado como RANKING (ver wrangler.jsonc). Sem KV, responde lista vazia.
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' };
const json = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...CORS } });
const limpa = s => String(s || '').replace(/[<>&"'`\u0000-\u001f]/g, '').trim().slice(0, 60);
const modoOk = m => (m === 'equipe' ? 'equipe' : 'solo');

async function opcoes() { return new Response(null, { status: 204, headers: CORS }); }

async function ler({ request, env }) {
  const modo = modoOk(new URL(request.url).searchParams.get('modo'));
  if (!env.RANKING) return json({ top: [], aviso: 'ranking ainda não ligado' });
  const top = (await env.RANKING.get('top:' + modo, 'json')) || [];
  return json({ top: top.slice(0, 10) });
}

async function gravar({ request, env }) {
  if (!env.RANKING) return json({ ok: false, motivo: 'sem-kv' }, 503);
  let b; try { b = await request.json(); } catch (e) { return json({ ok: false, motivo: 'json' }, 400); }
  const onda = b.onda | 0, kills = b.kills | 0, modo = modoOk(b.modo);
  const jog = (Array.isArray(b.jogadores) ? b.jogadores : []).slice(0, 5).map(limpa).filter(Boolean);
  const equipe = limpa(b.equipe) || jog.join(' + ');
  // conferências básicas (não é à prova de trapaça, mas segura os números absurdos)
  if (!equipe || onda < 1 || onda > 300 || kills < 0 || kills > onda * 400) return json({ ok: false, motivo: 'dados' }, 400);
  const ip = request.headers.get('cf-connecting-ip') || 'x';
  if (await env.RANKING.get('ip:' + ip)) return json({ ok: false, motivo: 'devagar' }, 429);
  await env.RANKING.put('ip:' + ip, '1', { expirationTtl: 60 });
  const k = 'top:' + modo, top = (await env.RANKING.get(k, 'json')) || [];
  const i = top.findIndex(r => r.equipe.toLowerCase() === equipe.toLowerCase());
  const novo = { equipe, onda, kills, data: new Date().toISOString().slice(0, 10) };
  if (i >= 0) { if (top[i].onda > onda || (top[i].onda === onda && top[i].kills >= kills)) return json({ ok: true, recorde: false }); top.splice(i, 1); }
  top.push(novo); top.sort((a, b) => b.onda - a.onda || b.kills - a.kills);
  await env.RANKING.put(k, JSON.stringify(top.slice(0, 50)));
  return json({ ok: true, recorde: true, pos: top.indexOf(novo) + 1 });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === '/ws') {
      if (!env.SALAS) return new Response('multiplayer desligado', { status: 503 });
      // uma "central" só, criada na América do Sul (sam): é ela que guarda todas as salas
      const id = env.SALAS.idFromName('central');
      return env.SALAS.get(id, { locationHint: 'sam' }).fetch(request);
    }
    if (url.pathname === '/health')
      return new Response('ok', { headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', ...CORS } });
    if (url.pathname === '/api/ranking' || url.pathname === '/api/ranking/') {
      const c = { request, env, ctx };
      if (request.method === 'OPTIONS') return opcoes(c);
      if (request.method === 'POST') return gravar(c);
      if (request.method === 'GET' || request.method === 'HEAD') return ler(c);
      return new Response('método não permitido', { status: 405 });
    }
    return env.ASSETS.fetch(request);
  }
};
