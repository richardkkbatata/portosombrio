// Ranking do Modo Horda (Cloudflare Pages Function).
// Precisa de um KV ligado ao projeto com o nome RANKING (Configurações > Vinculações > KV).
// Sem o KV, responde ranking vazio e não quebra nada.
//   GET  /api/ranking?modo=solo|equipe  -> {top:[{equipe,onda,kills,data}]}
//   POST /api/ranking  {modo, equipe, jogadores[], onda, kills, v}
const CORS = { 'access-control-allow-origin': '*', 'access-control-allow-methods': 'GET,POST,OPTIONS', 'access-control-allow-headers': 'content-type' };
const json = (o, st = 200) => new Response(JSON.stringify(o), { status: st, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store', ...CORS } });
const limpa = s => String(s || '').replace(/[<>&"'`\u0000-\u001f]/g, '').trim().slice(0, 60);
const modoOk = m => (m === 'equipe' ? 'equipe' : 'solo');

export async function onRequestOptions() { return new Response(null, { status: 204, headers: CORS }); }

export async function onRequestGet({ request, env }) {
  const modo = modoOk(new URL(request.url).searchParams.get('modo'));
  if (!env.RANKING) return json({ top: [], aviso: 'ranking ainda não ligado' });
  const top = (await env.RANKING.get('top:' + modo, 'json')) || [];
  return json({ top: top.slice(0, 10) });
}

export async function onRequestPost({ request, env }) {
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
