'use strict';
/*
  Porto Sombrio — servidor dedicado do multiplayer.

  O jogo continua host-autoritativo: o servidor NÃO roda o jogo. Ele só
  cria salas com um código de 4 letras e repassa as mensagens entre o
  anfitrião (id '0') e os convidados ('1'..'4').

  HTTP:  GET /        -> o jogo (jogo-original/porto-sombrio.html)
         GET /health  -> "ok"
  WS:    /ws          -> protocolo JSON:
    {t:'host'}                 -> {t:'room',code,id:'0'}
    {t:'join',code}            -> {t:'joined',id,tk}  (e o anfitrião recebe {t:'peer-open',id})
    {t:'join',code,id,tk}      -> quem caiu e volta com a chave tk ganha a mesma vaga (a conexão velha fecha sem peer-close)
                                  erros: {t:'err',msg:'nao-encontrada'|'cheia'}
    {t:'relay',to,m:"string"}  -> {t:'msg',from,m}  (to: '0', '1'..'4' ou '*' = todos menos quem mandou;
                                  m é repassado como está, sem reparsear)
    {t:'ping',n}               -> {t:'pong',n}
    convidado caiu -> anfitrião recebe {t:'peer-close',id}
    anfitrião saiu ({t:'leave'}) -> todos recebem {t:'room-closed'} e a sala é apagada
    anfitrião caiu sem querer -> convidados {t:'host-away'}; ele volta com {t:'host',code,tk} em até 60 s
      -> {t:'room',code,id:'0',tk,ids:[convidados]} e os convidados {t:'host-back'}; senão -> {t:'room-closed'}
*/
const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { WebSocketServer } = require('ws');

const PORT = Number(process.env.PORT) || 8080;
const JOGO = process.env.PS_JOGO || path.join(__dirname, '..', 'jogo-original', 'porto-sombrio.html');
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_SALA = 5;                 // anfitrião + 4
const MAX_MSG = 64 * 1024;          // 64 KB por mensagem
const MAX_SALAS = 2000;
const TAXA = 120;                   // mensagens por segundo (média) por conexão
const RAJADA = 1200;               // folga para picos: a rajada que chega junta depois de um travamento da internet
const PING_MS = 25000;
const SALA_VAZIA_MS = 30 * 60 * 1000;  // anfitrião sozinho na sala por 30 min: a sala expira
const SALA_MAX_MS = 6 * 60 * 60 * 1000;
const VOLTA_MS = 60 * 1000;         // anfitrião que cai sem querer tem 60 s pra voltar com a chave

const salas = new Map();            // código -> {code, host, guests: Map(id->ws), criada, vazia}

function log(...a) { console.log(new Date().toISOString(), ...a); }

// ---------- HTTP ----------
let cache = { mtime: 0, buf: null };
function lerJogo() {
  try {
    const st = fs.statSync(JOGO);
    if (st.mtimeMs !== cache.mtime) cache = { mtime: st.mtimeMs, buf: fs.readFileSync(JOGO) };
    return cache.buf;
  } catch (e) { return null; }
}

const server = http.createServer((req, res) => {
  const url = (req.url || '/').split('?')[0];
  const base = { 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'no-referrer' };
  if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, base); return res.end(); }
  if (url === '/health') {
    res.writeHead(200, { ...base, 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store', 'Access-Control-Allow-Origin': '*' });
    return res.end('ok');
  }
  if (url === '/' || url === '/index.html') {
    const b = lerJogo();
    if (!b) { res.writeHead(503, { ...base, 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('jogo indisponível'); }
    res.writeHead(200, { ...base, 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-cache' });
    return res.end(req.method === 'HEAD' ? undefined : b);
  }
  res.writeHead(404, { ...base, 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('não encontrado');
});

// ---------- WebSocket ----------
const wss = new WebSocketServer({ noServer: true, maxPayload: MAX_MSG + 1024, perMessageDeflate: false });

server.on('upgrade', (req, sock, head) => {
  if ((req.url || '').split('?')[0] !== '/ws') { sock.destroy(); return; }
  wss.handleUpgrade(req, sock, head, ws => wss.emit('connection', ws, req));
});

function enviar(ws, o) { if (ws && ws.readyState === 1) { try { ws.send(JSON.stringify(o)); } catch (e) { } } }

function novoCodigo() {
  for (let n = 0; n < 200; n++) {
    let c = '';
    for (let i = 0; i < 4; i++) c += ALFABETO[Math.floor(Math.random() * ALFABETO.length)];
    if (!salas.has(c)) return c;
  }
  return null;
}

function fecharSala(sala, motivo) {
  if (!salas.has(sala.code)) return;
  salas.delete(sala.code);
  for (const g of sala.guests.values()) { enviar(g, { t: 'room-closed' }); g.sala = null; g.id = null; try { g.close(1000, 'sala fechada'); } catch (e) { } }
  sala.guests.clear();
  log('sala fechada', sala.code, motivo || '');
}

function sair(ws, querSair) {
  const sala = ws.sala;
  if (!sala) return;
  ws.sala = null;
  if (ws.id === '0') {
    ws.id = null; if (sala.host !== ws) return;
    if (querSair || !sala.guests.size) return fecharSala(sala, 'anfitrião saiu');
    sala.host = null; sala.fora = Date.now();
    for (const g of sala.guests.values()) enviar(g, { t: 'host-away' });
    return log('anfitrião caiu, esperando ele voltar', sala.code);
  }
  if (sala.guests.get(ws.id) === ws) {
    sala.guests.delete(ws.id);
    enviar(sala.host, { t: 'peer-close', id: ws.id });
    if (!sala.host && !sala.guests.size) fecharSala(sala, 'ninguém ficou');
  }
  ws.id = null;
}

function membro(sala, id) { return id === '0' ? sala.host : sala.guests.get(id); }

function aoMensagem(ws, raw, binario) {
  // limite de mensagens por segundo (balde de fichas): quem abusar cai
  const agora = Date.now();
  ws.fichas = Math.min(RAJADA, ws.fichas + (agora - ws.ultima) * TAXA / 1000);
  ws.ultima = agora;
  if (ws.derrubado) return;
  if (--ws.fichas < 0) { ws.derrubado = true; log('derrubado por excesso de mensagens'); return ws.terminate(); }
  if (binario || raw.length > MAX_MSG + 512) return ws.close(1009, 'mensagem grande demais');

  let m;
  try { m = JSON.parse(raw.toString('utf8')); } catch (e) { return enviar(ws, { t: 'err', msg: 'invalida' }); }
  if (!m || typeof m !== 'object' || typeof m.t !== 'string') return enviar(ws, { t: 'err', msg: 'invalida' });

  switch (m.t) {
    case 'host': {
      if (ws.sala) return enviar(ws, { t: 'err', msg: 'ja-na-sala' });
      if (typeof m.code === 'string' && typeof m.tk === 'string') {   // anfitrião voltando pra sala dele
        const sala = salas.get(m.code.toUpperCase());
        if (!sala || sala.chave !== m.tk) return enviar(ws, { t: 'err', msg: 'nao-encontrada' });
        const velho = sala.host;
        if (velho && velho !== ws) { velho.sala = null; velho.id = null; try { velho.close(1000, 'voltou'); } catch (e) { } }
        sala.host = ws; sala.fora = 0; sala.chave = crypto.randomUUID(); ws.sala = sala; ws.id = '0';
        enviar(ws, { t: 'room', code: sala.code, id: '0', tk: sala.chave, ids: [...sala.guests.keys()] });
        for (const g of sala.guests.values()) enviar(g, { t: 'host-back' });
        return log('anfitrião voltou', sala.code);
      }
      if (salas.size >= MAX_SALAS) return enviar(ws, { t: 'err', msg: 'lotado' });
      const code = novoCodigo();
      if (!code) return enviar(ws, { t: 'err', msg: 'lotado' });
      const sala = { code, host: ws, guests: new Map(), chaves: new Map(), chave: crypto.randomUUID(), fora: 0, criada: agora, vazia: agora };
      salas.set(code, sala);
      ws.sala = sala; ws.id = '0';
      log('sala criada', code);
      return enviar(ws, { t: 'room', code, id: '0', tk: sala.chave });
    }
    case 'join': {
      if (ws.sala) return enviar(ws, { t: 'err', msg: 'ja-na-sala' });
      const code = typeof m.code === 'string' ? m.code.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
      const sala = code.length === 4 && salas.get(code);
      if (!sala) return enviar(ws, { t: 'err', msg: 'nao-encontrada' });
      let id = null;
      // quem caiu e volta com a chave (tk) recebe a mesma vaga, mesmo que a conexão velha ainda não tenha caído aqui
      const volta = typeof m.id === 'string' && /^[1-4]$/.test(m.id) && typeof m.tk === 'string' && sala.chaves.get(m.id) === m.tk ? m.id : null;
      if (volta) {
        const velho = sala.guests.get(volta);
        if (velho && velho !== ws) { velho.sala = null; velho.id = null; try { velho.close(1000, 'voltou'); } catch (e) { } }
        id = volta;
      } else for (let i = 1; i < MAX_SALA; i++) if (!sala.guests.has(String(i))) { id = String(i); break; }
      if (!id) return enviar(ws, { t: 'err', msg: 'cheia' });
      const tk = crypto.randomUUID(); sala.chaves.set(id, tk);
      sala.guests.set(id, ws); sala.vazia = 0;
      ws.sala = sala; ws.id = id;
      enviar(ws, { t: 'joined', id, tk });
      return enviar(sala.host, { t: 'peer-open', id });
    }
    case 'relay': {
      const sala = ws.sala;
      if (!sala) return enviar(ws, { t: 'err', msg: 'sem-sala' });
      if (typeof m.m !== 'string' || m.m.length > MAX_MSG) return enviar(ws, { t: 'err', msg: 'invalida' });
      const to = m.to;
      if (typeof to !== 'string' || !/^(\*|[0-4])$/.test(to)) return enviar(ws, { t: 'err', msg: 'invalida' });
      // convidado só fala com o anfitrião (ou '*' = todos); o anfitrião fala com qualquer um
      const s = JSON.stringify({ t: 'msg', from: ws.id, m: m.m });
      const manda = alvo => { if (alvo && alvo !== ws && alvo.readyState === 1) try { alvo.send(s); } catch (e) { } };
      if (to === '*') { manda(sala.host); for (const g of sala.guests.values()) manda(g); }
      else if (ws.id === '0' || to === '0') manda(membro(sala, to));
      return;
    }
    case 'leave': return sair(ws, true);
    case 'ping': return enviar(ws, { t: 'pong', n: typeof m.n === 'number' ? m.n : 0 });
    default: return enviar(ws, { t: 'err', msg: 'invalida' });
  }
}

wss.on('connection', ws => {
  ws.vivo = true; ws.sala = null; ws.id = null;
  ws.fichas = RAJADA; ws.ultima = Date.now();
  ws.on('pong', () => { ws.vivo = true; });
  ws.on('message', (raw, bin) => aoMensagem(ws, raw, bin));
  ws.on('close', () => sair(ws));
  ws.on('error', () => { });
});

// ping a cada 25 s; quem não responder cai. Salas vazias ou antigas expiram.
const tique = setInterval(() => {
  for (const ws of wss.clients) {
    if (!ws.vivo) { ws.terminate(); continue; }
    ws.vivo = false; try { ws.ping(); } catch (e) { }
  }
  const agora = Date.now();
  for (const sala of salas.values()) {
    if (sala.guests.size > 0) sala.vazia = 0; else if (!sala.vazia) sala.vazia = agora;
    const expira = sala.fora ? (agora - sala.fora > VOLTA_MS ? 'anfitrião não voltou' : '')
      : agora - sala.criada > SALA_MAX_MS ? 'tempo máximo'
      : sala.vazia && agora - sala.vazia > SALA_VAZIA_MS ? 'vazia' : '';
    if (expira) { if (sala.host) { enviar(sala.host, { t: 'room-closed' }); sala.host.sala = null; } fecharSala(sala, expira); }
  }
}, PING_MS);
wss.on('close', () => clearInterval(tique));

if (require.main === module) {
  server.listen(PORT, () => log(`Porto Sombrio servidor na porta ${PORT}`));
}
module.exports = { server, wss, salas };
