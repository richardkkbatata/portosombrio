/* =====================================================================
   NIGHTGETAWAY — LAUNCHER (Windows, Neutralino) — versão 2
   ---------------------------------------------------------------------
   O que este arquivo faz, em português:
     1. lê o catálogo da internet (https://nightgetaway.net.br/launcher/catalogo.json);
     2. compara com o que está instalado em %LOCALAPPDATA%\NightGetaway\jogos\<id>\;
     3. se tiver versão nova: baixa o pacote (.zip com o resources.neu do jogo),
        confere o sha256, grava num .tmp e só então troca o arquivo
        (o resources.neu antigo fica guardado como "anterior.neu", de reserva);
     4. no botão JOGAR, o launcher ABRE O PROGRAMA DO JOGO
        (%LOCALAPPDATA%\NightGetaway\jogos\<id>\Porto Sombrio.exe).
        O jogo roda no processo dele, exatamente como o zip de hoje, e o save
        continua no lugar que o jogador já conhece;
     5. sem internet: abre o que já está instalado;
     6. se a versão nova não abrir, volta sozinho para a anterior.

   O LAUNCHER NÃO MOSTRA O JOGO DENTRO DELE. Ele tem UMA única página (esta),
   que nunca recarrega e nunca navega para outra: é isso que faz o token de
   segurança do Neutralino (tokenSecurity "one-time") continuar valendo.

   SEGURANÇA: só baixa de https://nightgetaway.net.br e sempre confere o
   sha256. O único programa que ele pode executar é o "Porto Sombrio.exe" de
   dentro da pasta de jogos — caminho montado aqui, nunca vindo do catálogo.
   ===================================================================== */
'use strict';

const LAUNCHER_VERSAO = '2.0.0';
const CATALOGO_OFICIAL = 'https://nightgetaway.net.br/launcher/catalogo.json';
const ORIGEM_PERMITIDA = /^https:\/\/nightgetaway\.net\.br\//i;
const EXE_JOGO = 'Porto Sombrio.exe';          // o programa do jogo (runtime do Neutralino)
// NG_DEV só existe no teste (launcher/teste). O conteúdo baixado nunca pode
// ligar isso: ele é gravado em arquivo, não executado aqui.
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

/** Tira UM arquivo de um zip de um arquivo só (deflate ou sem compressão). */
async function abrirZip(bytes, nomeEsperado) {
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  if (d.byteLength < 30 || d.getUint32(0, true) !== 0x04034b50) throw new Error('pacote não é um zip');
  const metodo = d.getUint16(8, true);
  const tamComp = d.getUint32(18, true);
  const nomeLen = d.getUint16(26, true);
  const extraLen = d.getUint16(28, true);
  const ini = 30 + nomeLen + extraLen;
  const nome = new TextDecoder().decode(bytes.subarray(30, 30 + nomeLen));
  const alvo = nomeEsperado || 'resources.neu';
  if (nome !== alvo && !new RegExp('(^|/)' + alvo.replace('.', '\\.') + '$', 'i').test(nome)) {
    throw new Error('o pacote não tem ' + alvo);
  }
  let dados = bytes.subarray(ini, tamComp ? ini + tamComp : undefined);
  if (metodo === 8) {
    const fluxo = new Blob([dados]).stream().pipeThrough(new DecompressionStream('deflate-raw'));
    dados = new Uint8Array(await new Response(fluxo).arrayBuffer());
  } else if (metodo !== 0) {
    throw new Error('compressão do zip não suportada');
  }
  return dados;
}

/**
 * Confere que o que veio é mesmo um resources.neu do jogo (formato asar):
 * tem que ter o neutralino.config.json e o resources/index.html dentro.
 * Devolve a versão que está escrita no config.
 */
function conferirNeu(bytes) {
  if (!bytes || bytes.length < 100000) throw new Error('o arquivo do jogo veio pequeno demais');
  const d = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tamCab = d.getUint32(12, true);
  if (tamCab < 10 || tamCab > 1048576 || 16 + tamCab > bytes.length) {
    throw new Error('o arquivo do jogo não está no formato certo');
  }
  let cab;
  try { cab = JSON.parse(new TextDecoder().decode(bytes.subarray(16, 16 + tamCab))); }
  catch (e) { throw new Error('o arquivo do jogo não está no formato certo'); }
  const f = cab && cab.files;
  if (!f || !f['neutralino.config.json']) throw new Error('falta a configuração dentro do arquivo do jogo');
  if (!f.resources || !f.resources.files || !f.resources.files['index.html']) {
    throw new Error('falta a página do jogo dentro do arquivo');
  }
  const base = 8 + d.getUint32(4, true);
  const c = f['neutralino.config.json'];
  let cfg = {};
  try {
    cfg = JSON.parse(new TextDecoder().decode(
      bytes.subarray(base + Number(c.offset), base + Number(c.offset) + c.size)));
  } catch (e) { /* a configuração é só informação extra */ }
  return cfg.version || '';
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
  async gravarBin(p, bytes) {
    const ab = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength);
    await N().filesystem.writeBinaryFile(p, ab);
  },
  async apagar(p) { try { await N().filesystem.remove(p); } catch (e) { } },
  async mover(a, b) { await N().filesystem.move(a, b); },
  async existe(p) { try { await N().filesystem.getStats(p); return true; } catch (e) { return false; } },
  /** Copia um arquivo grande (o .exe). Usa filesystem.copy; se não tiver, lê e grava. */
  async copiar(a, b) {
    if (N().filesystem.copy) { await N().filesystem.copy(a, b); return; }
    const ab = await N().filesystem.readBinaryFile(a);
    await N().filesystem.writeBinaryFile(b, ab);
  },
  pastaJogo(id) { return this.base + '\\jogos\\' + id; },
  exeJogo(id) { return this.pastaJogo(id) + '\\' + EXE_JOGO; },
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

/** Pasta onde o launcher está instalado (onde fica o NightGetaway.exe). */
function pastaDoLauncher() {
  if (DEV && DEV.pasta_app) return DEV.pasta_app;
  const p = typeof window !== 'undefined' ? window.NL_PATH : '';
  return (p || '.').replace(/[\\/]+$/, '');
}

/**
 * Garante que o programa do jogo está na pasta de jogos.
 * Na primeira vez, copia o "Porto Sombrio.exe" que veio junto com o launcher
 * (pasta runtime\ do lado do NightGetaway.exe). Esse programa nunca vem da
 * internet: é o mesmo que foi instalado com o launcher.
 */
async function garantirExe(id) {
  const destino = Disco.exeJogo(id);
  if (await Disco.existe(destino)) return destino;
  await Disco.pasta(Disco.pastaJogo(id));
  const origem = pastaDoLauncher() + '\\runtime\\' + EXE_JOGO;
  if (!(await Disco.existe(origem))) {
    throw new Error('não achei o programa do jogo junto do launcher (' + origem + ')');
  }
  const tmp = destino + '.tmp';
  await Disco.apagar(tmp);
  await Disco.copiar(origem, tmp);
  await Disco.mover(tmp, destino);
  return destino;
}

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
 * Baixa o pacote, confere o sha256 e devolve os bytes do resources.neu.
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
  const neu = await abrirZip(bytes, 'resources.neu');
  conferirNeu(neu);
  return neu;
}

/** Troca o resources.neu do jogo de forma atômica, guardando o anterior. */
async function instalar(jogo, neu, versao, notas) {
  const pasta = Disco.pastaJogo(jogo.id);
  await Disco.pasta(pasta);
  await garantirExe(jogo.id);                          // 0. o programa do jogo tem que estar lá
  const alvo = pasta + '\\resources.neu';
  const tmp = pasta + '\\resources.neu.tmp';
  const velho = pasta + '\\anterior.neu';
  const antes = await Disco.estado(jogo.id);

  await Disco.gravarBin(tmp, neu);                     // 1. grava fora do caminho
  if (await Disco.existe(alvo)) {                      // 2. guarda a reserva
    await Disco.apagar(velho);
    await Disco.mover(alvo, velho);
  }
  await Disco.mover(tmp, alvo);                        // 3. troca (rename)
  await Disco.salvarEstado(jogo.id, {
    id: jogo.id, nome: jogo.nome, versao: versao, notas: notas || [],
    versao_anterior: antes ? antes.versao : null,
    instalado: new Date().toISOString(),
    tentativa: versao,   // marca que ainda não foi confirmada como boa
    lancou: false,       // o jogador ainda não abriu esta versão
  });
}

/** Põe de volta a versão anterior (reserva). Devolve null se não tiver reserva. */
async function voltarReserva(id) {
  const est = await Disco.estado(id);
  const pasta = Disco.pastaJogo(id);
  if (!est || !est.versao_anterior || !(await Disco.existe(pasta + '\\anterior.neu'))) {
    if (est) { est.tentativa = null; await Disco.salvarEstado(id, est); }
    return null;
  }
  await Disco.apagar(pasta + '\\resources.neu');
  await Disco.mover(pasta + '\\anterior.neu', pasta + '\\resources.neu');
  const caiu = est.versao;
  est.versao = est.versao_anterior; est.versao_anterior = null;
  est.tentativa = null; est.lancou = false;
  await Disco.salvarEstado(id, est);
  return { caiu: caiu, voltou: est.versao };
}

/**
 * Abriu o launcher e a versão nova ficou marcada como "tentativa" mesmo depois
 * de o jogador ter mandado abrir o jogo? Então ela não funcionou: volta na reserva.
 */
async function conferirReserva(id) {
  const est = await Disco.estado(id);
  if (!est || !est.tentativa || est.tentativa !== est.versao || !est.lancou) return null;
  return voltarReserva(id);
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
      '</div>' +
      '<div class="confirma" data-confirma hidden>' +
        '<p data-confirma-txt></p>' +
        '<div class="acoes">' +
          '<button class="bt vazio" data-abriu>Abriu, está funcionando</button>' +
          '<button class="bt vazio" data-nao-abriu>Não abriu — voltar para a versão anterior</button>' +
        '</div>' +
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
   O SAVE DO JOGADOR (decisão desta versão):
   o launcher NÃO roda o jogo dentro dele. Ele abre o programa do jogo
   ("Porto Sombrio.exe"), o mesmo do zip que o jogador já usa hoje. Assim o
   jogo guarda o save no lugar de sempre (a pasta de dados do WebView2 do
   próprio jogo) e uma atualização não muda nada disso: o launcher só troca o
   resources.neu do lado do programa.
*/
async function jogar(id) {
  await garantirExe(id);
  const caminho = Disco.exeJogo(id);
  // trava de segurança: só pode ser EXATAMENTE o exe de dentro da pasta de jogos
  const esperado = Disco.base + '\\jogos\\' + id + '\\' + EXE_JOGO;
  if (caminho !== esperado || /\.\.|["|&<>^]/.test(caminho) || !/^[A-Za-z]:\\/.test(caminho)) {
    throw new Error('caminho do jogo inválido');
  }
  if (!(await Disco.existe(Disco.pastaJogo(id) + '\\resources.neu'))) {
    throw new Error('o arquivo do jogo (resources.neu) não está instalado');
  }
  await N().os.execCommand('"' + caminho + '"', { background: true });
  const est = await Disco.estado(id);
  if (est) { est.lancou = true; est.aberto = new Date().toISOString(); await Disco.salvarEstado(id, est); }
  return caminho;
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

    /* ----- botão JOGAR: abre o programa do jogo ----- */
    const btJogar = el.querySelector('[data-jogar]');
    btJogar.addEventListener('click', async () => {
      btJogar.disabled = true;
      const falha = el.querySelector('.aviso-erro');
      if (falha) falha.remove();
      try {
        await jogar(j.id);
        const box = el.querySelector('[data-prog]');
        box.hidden = false;
        box.querySelector('i').style.width = '100%';
        el.querySelector('[data-prog-txt]').textContent =
          'Jogo aberto numa janela só dele. Pode deixar o launcher fechado se quiser.';
        const e2 = await Disco.estado(j.id);
        if (e2 && e2.tentativa) perguntarSeAbriu(el, j, e2.versao);
      } catch (e) {
        const d = document.createElement('p');
        d.className = 'aviso ruim aviso-erro';
        d.innerHTML = '<b>Não consegui abrir o jogo.</b> ' + (e && e.message ? e.message : e) + '.';
        el.querySelector('.corpo').insertBefore(d, el.querySelector('.acoes'));
      }
      btJogar.disabled = false;
    });

    /* ----- confirmação de uma versão recém-instalada ----- */
    if (est && est.tentativa && est.tentativa === est.versao && est.lancou) {
      perguntarSeAbriu(el, j, est.versao);
    }

    /* ----- botão ATUALIZAR ----- */
    const btAtu = el.querySelector('[data-atualizar]');
    btAtu.addEventListener('click', async () => {
      btAtu.disabled = true;
      btJogar.disabled = true;
      const falha = el.querySelector('.aviso-erro');
      if (falha) falha.remove();
      try {
        const neu = await baixarPacote(pac, (l, t) => progresso(el, l, t));
        el.querySelector('[data-prog-txt]').textContent = 'Conferido. Trocando o arquivo do jogo...';
        await instalar(j, neu, j.versao, j.notas);
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
        btJogar.disabled = !instalada;
      }
    });
  }
}

/** Pergunta se a versão nova abriu. É assim que a reserva deixa de ser necessária. */
function perguntarSeAbriu(el, j, versao) {
  const box = el.querySelector('[data-confirma]');
  if (!box || box.dataset.pronto) return;
  box.dataset.pronto = '1';
  box.hidden = false;
  el.querySelector('[data-confirma-txt]').textContent =
    'A versão ' + versao + ' é nova aqui. O jogo abriu direito?';
  el.querySelector('[data-abriu]').addEventListener('click', async () => {
    const est = await Disco.estado(j.id);
    if (est) { est.tentativa = null; await Disco.salvarEstado(j.id, est); }
    box.hidden = true;
    aviso('Anotado: a versão ' + versao + ' está funcionando.');
  });
  el.querySelector('[data-nao-abriu]').addEventListener('click', async () => {
    const r = await voltarReserva(j.id);
    box.hidden = true;
    if (r) {
      pintarFicha(el, { instalada: r.voltou, disponivel: j.versao, notas: j.notas, baixavel: !!j.pacote_windows, carimbo: 'versão anterior' });
      aviso('<b>Voltei para a versão ' + r.voltou + '.</b> A ' + r.caiu +
            ' ficou de lado. Tente atualizar de novo mais tarde.', true);
    } else {
      aviso('<b>Não tenho uma versão anterior guardada.</b> Tente atualizar de novo ou baixe o jogo ' +
            'no site nightgetaway.net.br.', true);
    }
  });
}

if (typeof window !== 'undefined') {
  window.NGLauncher = { cmpVersao, abrirZip, conferirNeu, baixarPacote, instalar, jogar,
                        garantirExe, voltarReserva, conferirReserva, Disco, LAUNCHER_VERSAO };
  window.addEventListener('DOMContentLoaded', () => {
    principal().catch(e => {
      aviso('<b>Erro inesperado no launcher.</b> ' + (e && e.message ? e.message : e), true);
    });
  });
}
