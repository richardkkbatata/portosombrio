'use strict';
// Teste do protocolo do servidor. Uso: node test.js  (termina com "TUDO OK")
// Pra testar outro servidor já ligado (ex.: o da Cloudflare no wrangler dev):  PS_URL=http://127.0.0.1:8787 node test.js
const assert = require('assert');
const WebSocket = require('ws');
const EXTERNO = process.env.PS_URL || '';
process.env.PORT = '0';
const { server, salas } = EXTERNO ? { server: null, salas: null } : require('./server.js');

const sleep = ms => new Promise(r => setTimeout(r, ms));
let URL_WS, URL_HTTP;

function cliente() {
  return new Promise((ok, no) => {
    const ws = new WebSocket(URL_WS), fila = [], esperas = [];
    ws.on('message', d => { const m = JSON.parse(d); const w = esperas.findIndex(e => e.f(m)); if (w >= 0) esperas.splice(w, 1)[0].r(m); else fila.push(m); });
    ws.on('open', () => ok(c)); ws.on('error', no);
    const c = {
      ws, fila,
      send: o => ws.send(typeof o === 'string' ? o : JSON.stringify(o)),
      espera: (f, ms = 2000) => new Promise((r, n) => {
        const i = fila.findIndex(f); if (i >= 0) return r(fila.splice(i, 1)[0]);
        const e = { f, r }; esperas.push(e);
        setTimeout(() => { const k = esperas.indexOf(e); if (k >= 0) { esperas.splice(k, 1); n(new Error('timeout esperando mensagem')); } }, ms);
      }),
      nada: async (f, ms = 300) => { await sleep(ms); assert(!fila.some(f), 'chegou mensagem que não devia'); },
      fecha: () => new Promise(r => { ws.once('close', r); ws.close(); }),
    };
  });
}
const T = t => m => m.t === t;

(async () => {
  if (EXTERNO) { URL_HTTP = EXTERNO.replace(/\/+$/, ''); URL_WS = URL_HTTP.replace(/^http/, 'ws') + '/ws'; }
  else {
    await new Promise(r => server.listen(0, r));
    const port = server.address().port;
    URL_WS = `ws://127.0.0.1:${port}/ws`; URL_HTTP = `http://127.0.0.1:${port}`;
  }

  // HTTP
  let r = await fetch(URL_HTTP + '/health'); assert.strictEqual(await r.text(), 'ok'); assert.strictEqual(r.headers.get('access-control-allow-origin'), '*');
  r = await fetch(URL_HTTP + '/'); assert.strictEqual(r.status, 200); assert((await r.text()).includes('Porto Sombrio'));
  r = await fetch(URL_HTTP + '/../server.js'); assert.strictEqual(r.status, 404);
  console.log('ok  HTTP / e /health');

  // criar sala
  let H = await cliente(); H.send({ t: 'host' });
  const room = await H.espera(T('room')); assert(typeof room.tk === 'string' && room.tk.length >= 16);
  assert(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(room.code)); assert.strictEqual(room.id, '0');
  console.log('ok  sala criada', room.code);

  // entrar
  const g = [], tks = [];
  for (let i = 1; i <= 4; i++) {
    const c = await cliente(); c.send({ t: 'join', code: room.code.toLowerCase() });
    const j = await c.espera(T('joined')); assert.strictEqual(j.id, String(i)); assert(typeof j.tk === 'string' && j.tk.length >= 16); tks.push(j.tk);
    assert.strictEqual((await H.espera(T('peer-open'))).id, String(i));
    g.push(c);
  }
  console.log('ok  4 convidados com ids 1..4');
  const extra = await cliente(); extra.send({ t: 'join', code: room.code });
  assert.strictEqual((await extra.espera(T('err'))).msg, 'cheia');
  const perdido = await cliente(); perdido.send({ t: 'join', code: 'ZZZZ' === room.code ? 'YYYY' : 'ZZZZ' });
  assert.strictEqual((await perdido.espera(T('err'))).msg, 'nao-encontrada');
  console.log('ok  sala cheia e sala inexistente');

  // relay: m vai como string, sem reparsear
  const jogo = JSON.stringify({ t: 'hello', c: { apelido: 'edu' } });
  g[0].send({ t: 'relay', to: '0', m: jogo });
  const mh = await H.espera(T('msg')); assert.strictEqual(mh.from, '1'); assert.strictEqual(mh.m, jogo);
  H.send({ t: 'relay', to: '2', m: '{"t":"you"}' });
  assert.strictEqual((await g[1].espera(T('msg'))).m, '{"t":"you"}'); await g[0].nada(T('msg'));
  H.send({ t: 'relay', to: '*', m: 'x' });
  for (const c of g) assert.strictEqual((await c.espera(T('msg'))).from, '0');
  await H.nada(T('msg'));
  g[2].send({ t: 'relay', to: '2', m: 'conv->conv' }); await g[1].nada(T('msg'));
  console.log('ok  relay pra um, pra todos, sem eco');

  // validação
  g[0].send('nao é json'); assert.strictEqual((await g[0].espera(T('err'))).msg, 'invalida');
  g[0].send({ t: 'relay', to: '0', m: { obj: 1 } }); assert.strictEqual((await g[0].espera(T('err'))).msg, 'invalida');
  g[0].send({ t: 'relay', to: '9', m: 'x' }); assert.strictEqual((await g[0].espera(T('err'))).msg, 'invalida');
  g[0].send({ t: 'ping', n: 7 }); assert.strictEqual((await g[0].espera(T('pong'))).n, 7);
  console.log('ok  entradas inválidas recusadas, ping');

  // mensagem gigante derruba
  const big = await cliente(); const fechou = new Promise(r => big.ws.once('close', r));
  big.send({ t: 'relay', to: '0', m: 'a'.repeat(70 * 1024) }); await fechou;
  console.log('ok  mensagem > 64 KB derruba');

  // flood derruba
  const fl = await cliente(); const caiu = new Promise(r => fl.ws.once('close', r));
  for (let i = 0; i < 3000; i++) fl.send({ t: 'ping', n: i });
  await Promise.race([caiu, sleep(2000).then(() => { throw new Error('flood não derrubou'); })]);
  console.log('ok  excesso de mensagens derruba');

  // convidado sai
  await g[3].fecha(); assert.strictEqual((await H.espera(T('peer-close'))).id, '4');
  const novo = await cliente(); novo.send({ t: 'join', code: room.code }); assert.strictEqual((await novo.espera(T('joined'))).id, '4');
  console.log('ok  convidado saiu, vaga reaproveitada');

  // convidado caiu sem aviso e volta com a chave: mesma vaga, a conexão velha fecha, o anfitrião não recebe peer-close
  const velhoFechou = new Promise(r => g[1].ws.once('close', r));
  const volta = await cliente(); volta.send({ t: 'join', code: room.code, id: '2', tk: tks[1] });
  const jv = await volta.espera(T('joined')); assert.strictEqual(jv.id, '2'); assert.notStrictEqual(jv.tk, tks[1]);
  await velhoFechou; await H.nada(m => m.t === 'peer-close');
  volta.send({ t: 'relay', to: '0', m: 'voltei' }); assert.strictEqual((await H.espera(T('msg'))).from, '2');
  H.send({ t: 'relay', to: '2', m: 'oi' }); assert.strictEqual((await volta.espera(T('msg'))).m, 'oi');
  // chave errada ou já usada: não toma a vaga de ninguém (sala cheia)
  const intruso = await cliente(); intruso.send({ t: 'join', code: room.code, id: '1', tk: tks[1] });
  assert.strictEqual((await intruso.espera(T('err'))).msg, 'cheia');
  g[1] = volta;
  console.log('ok  convidado voltou pra mesma vaga com a chave; chave errada não entra');

  // anfitrião cai sem querer: a sala espera; ele volta com a chave e continua com os mesmos convidados
  await H.fecha();
  for (const c of [g[0], g[1], g[2], novo]) await c.espera(T('host-away'));
  const errado = await cliente(); errado.send({ t: 'host', code: room.code, tk: 'chave-errada' });
  assert.strictEqual((await errado.espera(T('err'))).msg, 'nao-encontrada');
  H = await cliente(); H.send({ t: 'host', code: room.code, tk: room.tk });
  const rv = await H.espera(T('room')); assert.strictEqual(rv.code, room.code); assert.strictEqual(rv.id, '0');
  assert.deepStrictEqual([...rv.ids].sort(), ['1', '2', '3', '4']); assert.notStrictEqual(rv.tk, room.tk);
  for (const c of [g[0], g[1], g[2], novo]) await c.espera(T('host-back'));
  g[0].send({ t: 'relay', to: '0', m: 'de volta' }); assert.strictEqual((await H.espera(T('msg'))).m, 'de volta');
  const velhaChave = await cliente(); velhaChave.send({ t: 'host', code: room.code, tk: room.tk });
  assert.strictEqual((await velhaChave.espera(T('err'))).msg, 'nao-encontrada');
  console.log('ok  anfitrião caiu: convidados avisados (host-away); voltou com a chave pra mesma sala (host-back)');

  // anfitrião sai de propósito
  H.send({ t: 'leave' }); await H.fecha();
  for (const c of [g[0], g[1], g[2], novo]) await c.espera(T('room-closed'));
  await sleep(50); if (salas) assert(!salas.has(room.code));
  console.log('ok  anfitrião saiu: room-closed e sala apagada');

  for (const c of [g[0], g[1], g[2], novo, extra, perdido, intruso, errado, velhaChave]) try { c.ws.close(); } catch (e) { }
  if (server) server.close();
  console.log('TUDO OK');
  process.exit(0);
})().catch(e => { console.error('FALHOU:', e); process.exit(1); });
