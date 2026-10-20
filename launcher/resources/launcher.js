/* =====================================================================
   NIGHTGETAWAY — LAUNCHER (Windows, Neutralino)
   ---------------------------------------------------------------------
   O que este arquivo faz, em português:
     1. lê o catálogo da internet (https://nightgetaway.net.br/launcher/catalogo.json);
     2. compara com o que está instalado em %LOCALAPPDATA%\NightGetaway\jogos\<id>\;
     3. se tiver versão nova: baixa o pacote (.zip), confere o sha256,
        descompacta, grava num .tmp e só então troca o arquivo do jogo
        (a versão antiga fica guardada como "anterior.html", de reserva);
     4. sem internet: abre o que já está instalado;
     5. se a versão nova não abrir, volta sozinho para a anterior.

   SEGURANÇA: só baixa de https://nightgetaway.net.br. Nunca executa nada
   do que baixou: o único arquivo gravado é o HTML do jogo.
   ===================================================================== */
'use strict';

const LAUNCHER_VERSAO = '1.0.0';
const CATALOGO_OFICIAL = 'https://nightgetaway.net.br/launcher/catalogo.json';
const ORIGEM_PERMITIDA = /^https:\/\/nightgetaway\.net\.br\//i;
// NG_DEV só existe na página de teste (teste/index-teste.html). O conteúdo
// baixado nunca pode ligar isso: ele é gravado em arquivo, não executado aqui.
const DEV = typeof window !== 'undefined' && window.NG_DEV ? window.NG_DEV : null;
const CATALOGO_URL = (DEV && DEV.catalogo) || CATALOGO_OFICIAL;
const SO_HTTPS = !DEV;

/* ---------------------------------------------------------------- utilidades */
function N() { return window.Neutralino; }

function cmpVersao(a, b) {           // '1.14' vs '1.13.1'  ->  1 / 0 / -1
  const pa = String(a || '0').split(/[.\-]/).map(n => parseInt(n, 10) || 0);
  const pb = String(b || '0').split(/[.\-]/).map(n => parseInt(n, 10) || 0);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const x = pa[i] || 0, y = pb[i] || 0;
    if (x !== y) return x > y ? 1 : -1;
  }
  return 0;
}

function kb(n) {
  if (!n) return '';
  return n >= 1048576 ? (n / 1048576).toFixed(1) + ' MB' : Math.round(n / 1024) + ' KB';
}

async function sha256Hex(buf) {
  const h = await crypto.subtle.digest('SHA-256', buf);
  return [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('');
}

/** Tira o index.html de um zip com um arquivo só (deflate ou sem compressão). */
async function abrirZip(bytes) {
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (d.byteLength < 30 || d.getUint32(0, true) !== 0x04034b50) throw new Error('pacote não é um zip');
  const metodo = d.getUint16(8, true);
  const tamComp = d.getUint32(18, true);
  const nomeLen = d.getUint16(26, true);
  const extraLen = d.getUint16(28, true);
  const ini = 30 + nomeLen + extraLen;
  const nome = new TextDecoder().decode(bytes.subarray(30, 30 + nomeLen));
  if (!/(^|\/)index\.html$/i.test(nome)) throw new Error('o pacote não tem index.html');
  let dados = bytes.subarray(ini, tamComp ? ini + tamComp : undefined);
  if (metodo === 8) {
    const fluxo = new Blob([dados]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    dados = new Uint8Array(await new Response(fluxo).arrayBuffer());
  } else if (metodo !== 0) {
    throw new Error('compressão do zip não suportada');
  }
  const html = new TextDecoder('utf-8').decode(dados);
  if (html.length < 5000 || !/<html/i.test(html)) throw new Error('o HTML do jogo veio quebrado');
  return html;
}

/* ---------------------------------------------------------------- disco */
const Disco = {
  base: '',
  async preparar() {
    const local = await N().os.getEnv('LOCALAPPDATA');
    this.base = (local || 'C:\\NightGetaway') + '\\NightGetaway';
    await this.pasta(this.base);
    await this.pasta(this.base + '\\jogos');
    return this.base;
  },
  async pasta(p) { try { await N().filesystem.createDirectory(p); } catch (e) { /* já existe */ } },
  async ler(p) { try { return await N().filesystem.readFile(p); } catch (e) { return null; } },
  async gravar(p, txt) { await N().filesystem.writeFile(p, txt); },
  async apagar(p) { try { await N().filesystem.remove(p); } catch (e) { } },
  async mover(a, b) { await N().filesystem.move(a, b); },
  async existe(p) { try { await N().filesystem.getStats(p); return true; } catch (e) { return false; } },
  pastaJogo(id) { return this.base + '\\jogos\\' + id; },
  async estado(id) {
    const txt = await this.ler(this.pastaJogo(id) + '\\estado.json');
    if (!txt) return null;
    try { return JSON.parse(txt); } catch (e) { return null; }
  },
  async salvarEstado(id, est) {
    await this.pasta(this.pastaJogo(id));
    await this.gravar(this.pastaJogo(id) + '\\estado.json', JSON.stringify(est, null, 2));
  },
};

/* ---------------------------------------------------------------- catálogo */
async function pegarCatalogo() {
  const r = await fetch(CATALOGO_URL, { cache: 'no-store' });
  if (!r.ok) throw new Error('catálogo respondeu ' + r.status);
  const c = await r.json();
  if (!c || !Array.isArray(c.jogos)) throw new Error('catálogo fora do formato');
  return c;
}

/* ---------------------------------------------------------------- download */
/**
 * Baixa o pacote, confere o sha256 e devolve o HTML do jogo.
 * Qualquer problema (origem errada, download cortado, sha256 diferente)
 * joga erro e NADA é gravado no disco.
 */
async function baixarPacote(pac, aoAndar) {
  if (!pac || !pac.url) throw new Error('o catálogo não trouxe o pacote');
  if (SO_HTTPS && !ORIGEM_PERMITIDA.test(pac.url)) throw new Error('o pacote não vem de nightgetaway.net.br');
  const r = await fetch(pac.url, { cache: 'no-store' });
  if (!r.ok) throw new Error('o servidor respondeu ' + r.status);
  const total = pac.tamanho || Number(r.headers.get('content-length')) || 0;
  let lidos = 0;
  const partes = [];
  const leitor = r.body && r.body.getReader ? r.body.getReader() : null;
  if (leitor) {
    for (;;) {
      const { done, value } = await leitor.read();
      if (done) break;
      partes.push(value);
      lidos += value.length;
      if (aoAndar) aoAndar(lidos, total);
    }
  } else {
    const b = new Uint8Array(await r.arrayBuffer());
    partes.push(b); lidos = b.length;
    if (aoAndar) aoAndar(lidos, total);
  }
  const bytes = new Uint8Array(lidos);
  let o = 0;
  for (const p of partes) { bytes.set(p, o); o += p.length; }
  if (total && lidos !== total) throw new Error('o download foi interrompido (' + kb(lidos) + ' de ' + kb(total) + ')');
  const hash = await sha256Hex(bytes);
  if (!pac.sha256 || hash !== String(pac.sha256).toLowerCase()) throw new Error('a confirmação de segurança (sha256) não bateu');
  return abrirZip(bytes);
}

/** Troca o arquivo do jogo de forma atômica, guardando a versão anterior. */
async function instalar(jogo, html, versao, notas) {
  const pasta = Disco.pastaJogo(jogo.id);
  await Disco.pasta(pasta);
  const alvo = pasta + '\\index.html';
  const tmp = pasta + '\\index.html.tmp';
  const velho = pasta + '\\anterior.html';
  const antes = await Disco.estado(jogo.id);

  await Disco.gravar(tmp, html);                       // 1. grava fora do caminho
  if (await Disco.existe(alvo)) {                      // 2. guarda a reserva
    await Disco.apagar(velho);
    await Disco.mover(alvo, velho);
  }
  await Disco.mover(tmp, alvo);                        // 3. troca (rename)
  await Disco.salvarEstado(jogo.id, {
    id: jogo.id, nome: jogo.nome, versao: versao, notas: notas || [],
    versao_anterior: antes ? antes.versao : null,
    instalado: new Date().toISOString(),
    tentativa: versao,        // só sai quando o jogo abrir de verdade
  });
}

/** Se a última versão instalada não abriu, volta para a reserva. */
async function conferirReserva(id) {
  const est = await Disco.estado(id);
  if (!est || !est.tentativa || est.tentativa !== est.versao) return null;
  const pasta = Disco.pastaJogo(id);
  if (!(await Disco.existe(pasta + '\\anterior.html')) || !est.versao_anterior) {
    est.tentativa = null; await Disco.salvarEstado(id, est); return null;
  }
  await Disco.apagar(pasta + '\\index.html');
  await Disco.mover(pasta + '\\anterior.html', pasta + '\\index.html');
  const caiu = est.versao;
  est.versao = est.versao_anterior; est.versao_anterior = null; est.tentativa = null;
  await Disco.salvarEstado(id, est);
  return { caiu: caiu, voltou: est.versao };
}

/* ---------------------------------------------------------------- tela */
const tela = {
  avisos: () => document.getElementById('avisos'),
  lista: () => document.getElementById('lista'),
};

function aviso(txt, ruim) {
  const d = document.createElement('div');
  d.className = 'aviso' + (ruim ? ' ruim' : '');
  d.innerHTML = txt;
  tela.avisos().appendChild(d);
  return d;
}

function relogio() {
  const f = () => {
    const d = new Date(Date.now() - 3 * 3600000);
    const e = document.getElementById('relogio');
    if (e) e.textContent = d.toISOString().slice(11, 19);
  };
  f(); setInterval(f, 1000);
}

function fichaJogo(j) {
  const el = document.createElement('article');
  el.className = 'jogo';
  el.dataset.jogo = j.id;
  const capa = j.capa && /^https:\/\//.test(j.capa)
    ? '<img src="' + j.capa + '" alt="" referrerpolicy="no-referrer">' : '';
  el.innerHTML =
    '<div class="capa">' + capa + '</div>' +
    '<div class="corpo">' +
      '<h2>' + (j.nome || j.id) + '</h2>' +
      '<p class="linha-ver" data-ver></p>' +
      '<div class="progresso" data-prog hidden>' +
        '<div class="barra"><i></i></div><div class="barra-texto" data-prog-txt></div>' +
      '</div>' +
      '<p class="notas-titulo">Novidades desta versão</p>' +
      '<ul class="notas" data-notas></ul>' +
      '<div class="acoes">' +
        '<button class="bt" data-jogar>Jogar</button>' +
        '<button class="bt vermelho" data-atualizar hidden>Atualizar</button>' +
        '<button class="bt vazio" data-reserva hidden>Voltar para a versão anterior</button>' +
      '</div>' +
    '</div>';
  tela.lista().appendChild(el);
  return el;
}

function pintarFicha(el, dados) {
  const { instalada, disponivel, notas, baixavel, carimbo } = dados;
  el.querySelector('[data-ver]').innerHTML =
    'Versão instalada: <b>' + (instalada || 'nenhuma') + '</b>' +
    (disponivel && instalada && cmpVersao(disponivel, instalada) > 0
      ? ' &middot; nova no servidor: <b>' + disponivel + '</b>' : '');
  const ul = el.querySelector('[data-notas]');
  ul.innerHTML = '';
  (notas && notas.length ? notas : ['Sem anotações nesta versão.']).forEach(n => {
    const li = document.createElement('li'); li.textContent = n; ul.appendChild(li);
  });
  el.querySelector('[data-jogar]').disabled = !instalada;
  el.querySelector('[data-atualizar]').hidden = !baixavel;
  el.querySelector('[data-atualizar]').textContent = instalada ? 'Atualizar' : 'Baixar e instalar';
  const c = el.querySelector('.carimbo');
  if (c) c.remove();
  if (carimbo) {
    const s = document.createElement('span');
    s.className = 'carimbo'; s.textContent = carimbo;
    el.appendChild(s);
  }
}

function progresso(el, lidos, total) {
  const box = el.querySelector('[data-prog]');
  box.hidden = false;
  const pct = total ? Math.min(100, Math.round(lidos * 100 / total)) : 0;
  box.querySelector('i').style.width = pct + '%';
  box.querySelector('[data-prog-txt]').textContent =
    'Baixando ' + kb(lidos) + (total ? ' de ' + kb(total) + ' (' + pct + '%)' : '');
}

/* ---------------------------------------------------------------- abrir o jogo */
/*
   O SAVE DO JOGADOR (decisão importante):
   o jogo guarda tudo em localStorage, e localStorage é por ORIGEM
   (http://localhost:<porta>). Por isso:
     - o launcher fixa a porta no neutralino.config.json ("port": 42071);
     - o jogo abre SEMPRE na MESMA janela/processo, pela página jogo.html do
       launcher, que injeta no documento o HTML instalado.
   Resultado: a origem é sempre http://localhost:42071, em qualquer versão do
   jogo e do launcher, então os slots de save, o recorde da Horda e as opções
   nunca se perdem numa atualização. (Abrir uma segunda janela criaria um
   segundo processo, que não conseguiria usar a mesma porta.)
*/
async function abrirJogo(id) {
  location.href = 'jogo.html?id=' + encodeURIComponent(id);
}

/* ---------------------------------------------------------------- principal */
async function principal() {
  document.getElementById('versao-launcher').textContent = LAUNCHER_VERSAO;
  relogio();
  if (N().init) { try { N().init(); } catch (e) { } }

  const base = await Disco.preparar();
  document.getElementById('pasta-jogos').textContent = 'Jogos em: ' + base + '\\jogos';

  let catalogo = null, erroRede = null;
  try { catalogo = await pegarCatalogo(); }
  catch (e) { erroRede = e; }

  document.getElementById('estado-linha').textContent = catalogo ? 'conectado' : 'sem internet';

  if (erroRede) {
    aviso('<b>Sem internet agora.</b> Abrindo a versão que já está instalada no computador. ' +
          'Quando a internet voltar, abra o launcher de novo para conferir se tem versão nova.');
  }
  if (catalogo && catalogo.launcher_min && cmpVersao(catalogo.launcher_min, LAUNCHER_VERSAO) > 0) {
    aviso('<b>Tem um launcher novo.</b> Este é o ' + LAUNCHER_VERSAO + ' e os jogos já pedem o ' +
          catalogo.launcher_min + '. Baixe o launcher novo em nightgetaway.net.br — os jogos ' +
          'instalados continuam funcionando.', true);
  }

  // jogos: os do catálogo + os que estão instalados e não vieram no catálogo
  const doCat = catalogo ? catalogo.jogos : [];
  const ids = doCat.map(j => j.id);
  const extras = [];
  for (const id of ['porto-sombrio']) {
    if (!ids.includes(id) && (await Disco.estado(id))) {
      const e = await Disco.estado(id);
      extras.push({ id: id, nome: e.nome || id });
    }
  }

  const jogos = doCat.concat(extras);
  if (!jogos.length) {
    aviso('<b>Nada para mostrar.</b> Não achei nenhum jogo instalado e não consegui falar com o servidor.', true);
    return;
  }

  for (const j of jogos) {
    const el = fichaJogo(j);
    const volta = await conferirReserva(j.id);
    if (volta) {
      aviso('<b>A versão ' + volta.caiu + ' não abriu.</b> Voltei sozinho para a ' + volta.voltou +
            ', que estava guardada de reserva. Você pode tentar atualizar de novo.', true);
    }
    const est = await Disco.estado(j.id);
    const pac = j.pacote_windows;
    const instalada = est ? est.versao : null;
    const temNova = j.versao && (!instalada || cmpVersao(j.versao, instalada) > 0);

    pintarFicha(el, {
      instalada: instalada,
      disponivel: j.versao,
      notas: temNova || !est ? j.notas : (est.notas || j.notas),
      baixavel: !!(pac && temNova),
      carimbo: !instalada ? 'não instalado' : (temNova ? 'versão nova' : 'em dia'),
    });

    el.querySelector('[data-jogar]').addEventListener('click', () => abrirJogo(j.id));

    const btAtu = el.querySelector('[data-atualizar]');
    btAtu.addEventListener('click', async () => {
      btAtu.disabled = true;
      el.querySelector('[data-jogar]').disabled = true;
      const falha = el.querySelector('.aviso-erro');
      if (falha) falha.remove();
      try {
        const html = await baixarPacote(pac, (l, t) => progresso(el, l, t));
        el.querySelector('[data-prog-txt]').textContent = 'Conferido. Trocando o arquivo do jogo...';
        await instalar(j, html, j.versao, j.notas);
        el.querySelector('[data-prog-txt]').textContent = 'Pronto: versão ' + j.versao + ' instalada.';
        pintarFicha(el, {
          instalada: j.versao, disponivel: j.versao, notas: j.notas,
          baixavel: false, carimbo: 'em dia',
        });
      } catch (e) {
        el.querySelector('[data-prog]').hidden = true;
        const d = document.createElement('p');
        d.className = 'aviso ruim aviso-erro';
        d.innerHTML = '<b>Não deu para atualizar.</b> ' + (e && e.message ? e.message : e) +
          '. Nada foi trocado: você continua com a versão ' + (instalada || 'nenhuma') + '.';
        el.querySelector('.corpo').insertBefore(d, el.querySelector('.acoes'));
        btAtu.disabled = false;
        el.querySelector('[data-jogar]').disabled = !instalada;
      }
    });
  }
}

if (typeof window !== 'undefined') {
  window.NGLauncher = { cmpVersao, abrirZip, baixarPacote, instalar, conferirReserva, Disco, LAUNCHER_VERSAO };
  window.addEventListener('DOMContentLoaded', () => {
    principal().catch(e => {
      aviso('<b>Erro inesperado no launcher.</b> ' + (e && e.message ? e.message : e), true);
    });
  });
}
