'use strict';
// Teste do protocolo do servidor. Uso: node test.js  (termina com "TUDO OK")
const assert = require('assert');
const WebSocket = require('ws');
process.env.PORT = '0';
const { server, salas } = require('./server.js');

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
  await new Promise(r => server.listen(0, r));
  const port = server.address().port;
  URL_WS = `ws://127.0.0.1:${port}/ws`; URL_HTTP = `http://127.0.0.1:${port}`;

  // HTTP
  let r = await fetch(URL_HTTP + '/health'); assert.strictEqual(await r.text(), 'ok'); assert.strictEqual(r.headers.get('access-control-allow-origin'), '*');
  r = await fetch(URL_HTTP + '/'); assert.strictEqual(r.status, 200); assert((await r.text()).includes('Porto Sombrio'));
  r = await fetch(URL_HTTP + '/../server.js'); assert.strictEqual(r.status, 404);
  console.log('ok  HTTP / e /health');

  // criar sala
  const H = await cliente(); H.send({ t: 'host' });
  const room = await H.espera(T('room'));
  assert(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{4}$/.test(room.code)); assert.strictEqual(room.id, '0');
  console.log('ok  sala criada', room.code);

  // entrar
  const g = [];
  for (let i = 1; i <= 4; i++) {
    const c = await cliente(); c.send({ t: 'join', code: room.code.toLowerCase() });
    assert.strictEqual((await c.espera(T('joined'))).id, String(i));
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
  for (let i = 0; i < 1500; i++) fl.send({ t: 'ping', n: i });
  await Promise.race([caiu, sleep(2000).then(() => { throw new Error('flood não derrubou'); })]);
  console.log('ok  excesso de mensagens derruba');

  // convidado sai
  await g[3].fecha(); assert.strictEqual((await H.espera(T('peer-close'))).id, '4');
  const novo = await cliente(); novo.send({ t: 'join', code: room.code }); assert.strictEqual((await novo.espera(T('joined'))).id, '4');
  console.log('ok  convidado saiu, vaga reaproveitada');

  // anfitrião sai
  await H.fecha();
  for (const c of [g[0], g[1], g[2], novo]) await c.espera(T('room-closed'));
  await sleep(50); assert(!salas.has(room.code));
  console.log('ok  anfitrião saiu: room-closed e sala apagada');

  for (const c of [g[0], g[1], g[2], novo, extra, perdido]) try { c.ws.close(); } catch (e) { }
  server.close();
  console.log('TUDO OK');
  process.exit(0);
})().catch(e => { console.error('FALHOU:', e); process.exit(1); });
