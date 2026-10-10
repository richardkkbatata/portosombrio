// Servidor do multiplayer na Cloudflare (Durable Object). Mesmas regras de server/server.js (Render):
// salas com código de 4 letras e repasse de mensagens. Quem manda no mundo continua sendo o anfitrião.
//   {t:'host'} -> {t:'room',code,id:'0'}            {t:'join',code} -> {t:'joined',id,tk} (+ anfitrião: {t:'peer-open',id})
//   {t:'join',code,id,tk} (quem caiu voltando com a chave tk) -> a mesma vaga id; a conexão velha é fechada sem peer-close
//   {t:'relay',to:'0'|'1'..'4'|'*',m:"texto"} -> {t:'msg',from,m}   {t:'ping',n} -> {t:'pong',n}
//   convidado caiu -> anfitrião recebe {t:'peer-close',id}; anfitrião saiu ({t:'leave'}) -> todos {t:'room-closed'}
//   anfitrião caiu sem querer -> convidados {t:'host-away'}; volta com {t:'host',code,tk} em até 60 s
//     -> {t:'room',code,id:'0',tk,ids:[convidados]} e os convidados {t:'host-back'}; senão -> {t:'room-closed'}
const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const MAX_SALA = 5, MAX_MSG = 64 * 1024, MAX_SALAS = 2000;
// mensagens por segundo por conexão (balde de fichas). A folga grande é pra rajada que chega junta depois de um
// travamento da internet (o jogo manda ~60/s; 10 s de 4G travado viram 600 de uma vez) não derrubar jogador de verdade.
const TAXA = 120, RAJADA = 1200;
// o jogo manda ping a cada 5 s; com a aba em segundo plano o Chrome pode segurar os timers até 1 vez por minuto,
// então só cai quem fica 90 s calado (o Render usa o ping do próprio WebSocket, que o navegador responde sozinho)
const SILENCIO_MS = 90 * 1000;
const SALA_VAZIA_MS = 30 * 60 * 1000, SALA_MAX_MS = 6 * 60 * 60 * 1000;
// anfitrião que cai sem querer (internet, celular bloqueado) tem 60 s pra voltar com a chave antes da sala fechar
const VOLTA_MS = 60 * 1000;

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

  sair(ws, querSair) {
    const i = this.info.get(ws); if (!i || !i.sala) return;
    const sala = i.sala; i.sala = null;
    if (i.id === '0') {
      i.id = null; if (sala.host !== ws) return;
      if (querSair || !sala.guests.size) return this.fecharSala(sala);
      sala.host = null; sala.fora = Date.now();
      for (const g of sala.guests.values()) this.enviar(g, { t: 'host-away' });
      return;
    }
    if (sala.guests.get(i.id) === ws) {
      sala.guests.delete(i.id); this.enviar(sala.host, { t: 'peer-close', id: i.id });
      if (!sala.host && !sala.guests.size) this.salas.delete(sala.code);
    }
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
        if (typeof m.code === 'string' && typeof m.tk === 'string') {   // anfitrião voltando pra sala dele
          const sala = this.salas.get(m.code.toUpperCase());
          if (!sala || sala.chave !== m.tk) return this.enviar(ws, { t: 'err', msg: 'nao-encontrada' });
          const velho = sala.host;
          if (velho && velho !== ws) { const iv = this.info.get(velho); if (iv) { iv.sala = null; iv.id = null; } try { velho.close(1000, 'voltou'); } catch (e) { } }
          sala.host = ws; sala.fora = 0; sala.chave = crypto.randomUUID(); i.sala = sala; i.id = '0';
          this.enviar(ws, { t: 'room', code: sala.code, id: '0', tk: sala.chave, ids: [...sala.guests.keys()] });
          for (const g of sala.guests.values()) this.enviar(g, { t: 'host-back' });
          return;
        }
        const code = this.salas.size < MAX_SALAS && this.novoCodigo();
        if (!code) return this.enviar(ws, { t: 'err', msg: 'lotado' });
        const sala = { code, host: ws, guests: new Map(), chaves: new Map(), chave: crypto.randomUUID(), fora: 0, criada: agora, vazia: agora };
        this.salas.set(code, sala); i.sala = sala; i.id = '0';
        return this.enviar(ws, { t: 'room', code, id: '0', tk: sala.chave });
      }
      case 'join': {
        if (i.sala) return this.enviar(ws, { t: 'err', msg: 'ja-na-sala' });
        const code = typeof m.code === 'string' ? m.code.toUpperCase().replace(/[^A-Z0-9]/g, '') : '';
        const sala = code.length === 4 && this.salas.get(code);
        if (!sala) return this.enviar(ws, { t: 'err', msg: 'nao-encontrada' });
        let id = null;
        // quem caiu e volta com a chave (tk) recebe a mesma vaga, mesmo que a conexão velha ainda não tenha caído aqui
        const volta = typeof m.id === 'string' && /^[1-4]$/.test(m.id) && typeof m.tk === 'string' && sala.chaves.get(m.id) === m.tk ? m.id : null;
        if (volta) {
          const velho = sala.guests.get(volta);
          if (velho && velho !== ws) { const iv = this.info.get(velho); if (iv) { iv.sala = null; iv.id = null; } try { velho.close(1000, 'voltou'); } catch (e) { } }
          id = volta;
        } else for (let k = 1; k < MAX_SALA; k++) if (!sala.guests.has(String(k))) { id = String(k); break; }
        if (!id) return this.enviar(ws, { t: 'err', msg: 'cheia' });
        const tk = crypto.randomUUID(); sala.chaves.set(id, tk);
        sala.guests.set(id, ws); sala.vazia = 0; i.sala = sala; i.id = id;
        this.enviar(ws, { t: 'joined', id, tk });
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
      case 'leave': return this.sair(ws, true);
      case 'ping': return this.enviar(ws, { t: 'pong', n: typeof m.n === 'number' ? m.n : 0 });
      default: return this.enviar(ws, { t: 'err', msg: 'invalida' });
    }
  }

  limpeza() {
    const agora = Date.now();
    for (const [ws, i] of this.info) if (agora - i.visto > SILENCIO_MS) this.derruba(ws, 1001, 'sem resposta');
    for (const sala of this.salas.values()) {
      if (sala.guests.size > 0) sala.vazia = 0; else if (!sala.vazia) sala.vazia = agora;
      const expira = agora - sala.criada > SALA_MAX_MS || (sala.vazia && agora - sala.vazia > SALA_VAZIA_MS) || (sala.fora && agora - sala.fora > VOLTA_MS);
      if (expira) { const h = sala.host; this.enviar(h, { t: 'room-closed' }); const ih = this.info.get(h); if (ih) ih.sala = null; this.fecharSala(sala); }
    }
  }
}
