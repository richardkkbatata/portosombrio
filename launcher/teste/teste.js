/* =====================================================================
   TESTE DA TELA DO LAUNCHER (Playwright + Neutralino de mentira)

   Como rodar (na raiz do projeto):
     env -u HTTPS_PROXY -u https_proxy node launcher/teste/teste.js

   Arquitetura testada (launcher 2.0): o launcher NÃO roda o jogo dentro dele.
   Ele troca o resources.neu da pasta de jogos e ABRE o "Porto Sombrio.exe".

   O teste:
     - monta uma pasta de mentira com o launcher + catálogos + pacotes .zip
       (cada pacote tem um resources.neu de verdade, no formato asar);
     - sobe um servidor na porta 8792;
     - abre o launcher no Chromium (UMA única página, sem navegar) e testa:
         1. sem internet                 6. primeira instalação (copia o .exe)
         2. tem versão nova              7. launcher velho (launcher_min)
         3. sha256 errado                8. versão que não abriu -> volta na reserva
         4. download interrompido        9. pacote que não é um resources.neu
         5. clique em JOGAR (confere o comando e o caminho exatos)
     - tira os screenshots e termina com TUDO OK (ou lista os erros).
   ===================================================================== */
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const crypto = require('crypto');
const { spawn, execSync } = require('child_process');
const { chromium } = require('/opt/node-tools/node_modules/playwright');

const RAIZ = path.resolve(__dirname, '..', '..');
const SCRATCH = '/tmp/claude-0/-home-user-portosombrio/8f311d9a-768e-5703-8d38-182c64cb6b7d/scratchpad';
const SERVE = path.join(SCRATCH, 'launcher-teste');
const PORTA = 8792;
const BASE = `http://127.0.0.1:${PORTA}`;
const LOCAL = 'C:\\Users\\Richard\\AppData\\Local';
const PASTA = LOCAL + '\\NightGetaway\\jogos\\porto-sombrio';
const EXE = PASTA + '\\Porto Sombrio.exe';
const EXE_LAUNCHER = 'C:\\Program Files\\NightGetaway\\runtime\\Porto Sombrio.exe';
const CMD_ESPERADO = '"' + EXE + '"';

let falhas = [];
const ok = (t) => console.log('   ok  ' + t);
function conferir(cond, t) { if (cond) ok(t); else { falhas.push(t); console.log('  ERRO ' + t); } }

/* ------------------------------------------------- resources.neu de mentira */
function jogoFalso(versao) {
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
    `<title>Porto Sombrio ${versao}</title></head><body>` +
    `<h1 id="marca-jogo">JOGO ${versao} RODANDO</h1>` +
    '<!-- ' + 'x'.repeat(150000) + ' -->' +
    '</body></html>';
}

/** Monta um .neu (formato asar), igual ao que o gerar_catalogo.py publica. */
function neuFalso(versao) {
  const cfg = Buffer.from(JSON.stringify({
    applicationId: 'js.richard.portosombrio', version: versao, port: 0,
    enableNativeAPI: false, tokenSecurity: 'one-time',
  }, null, 2), 'utf8');
  const html = Buffer.from(jogoFalso(versao), 'utf8');
  const hdr = {
    files: {
      'neutralino.config.json': { offset: '0', size: cfg.length },
      resources: { files: { 'index.html': { offset: String(cfg.length), size: html.length } } },
    },
  };
  const js = Buffer.from(JSON.stringify(hdr), 'utf8');
  const pad = (4 - (js.length % 4)) % 4;
  const js2 = Buffer.concat([js, Buffer.alloc(pad)]);
  const cab = Buffer.alloc(16);
  cab.writeUInt32LE(4, 0); cab.writeUInt32LE(js2.length + 8, 4);
  cab.writeUInt32LE(js2.length + 4, 8); cab.writeUInt32LE(js.length, 12);
  return Buffer.concat([cab, js2, cfg, html]);
}
/** O texto como o Neutralino de mentira guarda o binário no "disco". */
const comoNoDisco = (buf) => buf.toString('latin1');

function zipar(nome, conteudo) {
  const dados = Buffer.isBuffer(conteudo) ? conteudo : Buffer.from(conteudo, 'utf8');
  const comp = zlib.deflateRawSync(dados, { level: 9 });
  const crc = (function (b) { // crc32
    let c, t = [];
    for (let n = 0; n < 256; n++) { c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
    let r = 0xFFFFFFFF;
    for (const x of b) r = t[(r ^ x) & 0xFF] ^ (r >>> 8);
    return (r ^ 0xFFFFFFFF) >>> 0;
  })(dados);
  const n = Buffer.from(nome, 'utf8');
  const lh = Buffer.alloc(30);
  lh.writeUInt32LE(0x04034b50, 0); lh.writeUInt16LE(20, 4); lh.writeUInt16LE(8, 8);
  lh.writeUInt32LE(crc, 14); lh.writeUInt32LE(comp.length, 18); lh.writeUInt32LE(dados.length, 22);
  lh.writeUInt16LE(n.length, 26);
  const cd = Buffer.alloc(46);
  cd.writeUInt32LE(0x02014b50, 0); cd.writeUInt16LE(20, 4); cd.writeUInt16LE(20, 6);
  cd.writeUInt16LE(8, 10); cd.writeUInt32LE(crc, 16); cd.writeUInt32LE(comp.length, 20);
  cd.writeUInt32LE(dados.length, 24); cd.writeUInt16LE(n.length, 28);
  const corpo = Buffer.concat([lh, n, comp]);
  const central = Buffer.concat([cd, n]);
  const eo = Buffer.alloc(22);
  eo.writeUInt32LE(0x06054b50, 0); eo.writeUInt16LE(1, 8); eo.writeUInt16LE(1, 10);
  eo.writeUInt32LE(central.length, 12); eo.writeUInt32LE(corpo.length, 16);
  return Buffer.concat([corpo, central, eo]);
}

const sha = (b) => crypto.createHash('sha256').update(b).digest('hex');

/* ------------------------------------------------- monta a pasta servida */
function montar() {
  fs.rmSync(SERVE, { recursive: true, force: true });
  fs.mkdirSync(SERVE, { recursive: true });
  const res = path.join(RAIZ, 'launcher', 'resources');
  for (const f of fs.readdirSync(res)) {
    const p = path.join(res, f);
    if (fs.statSync(p).isDirectory()) fs.cpSync(p, path.join(SERVE, f), { recursive: true });
    else fs.copyFileSync(p, path.join(SERVE, f));
  }
  fs.copyFileSync(path.join(__dirname, 'mock.js'), path.join(SERVE, 'mock.js'));
  // troca os scripts do Neutralino pelo de mentira
  let s = fs.readFileSync(path.join(SERVE, 'index.html'), 'utf8');
  s = s.replace('<script src="__neutralino_globals.js"></script>', '<script src="mock.js"></script>')
       .replace('<script src="neutralino.js"></script>', '');
  fs.writeFileSync(path.join(SERVE, 'index.html'), s);
  if (fs.existsSync(path.join(SERVE, 'jogo.html'))) {
    throw new Error('launcher/resources/jogo.html não deveria mais existir (arquitetura nova)');
  }

  // pacote da 1.14 (bom), um pedaço dele (download cortado) e um pacote errado
  const neu = neuFalso('1.14');
  const z = zipar('resources.neu', neu);
  fs.writeFileSync(path.join(SERVE, '1.14-windows.zip'), z);
  fs.writeFileSync(path.join(SERVE, 'curto.zip'), z.subarray(0, Math.floor(z.length / 2)));
  const zruim = zipar('resources.neu', Buffer.from('nao sou um asar '.repeat(10000), 'utf8'));
  fs.writeFileSync(path.join(SERVE, 'ruim.zip'), zruim);

  const notas = ['Camboriú maior: Tiro de Guerra, frigorífico, cemitério e as casas das oferendas.',
    'Sargento Valença entra na luta final com você.',
    'Furtividade: mate em silêncio e esconda o corpo.'];
  const jogo = (extra) => Object.assign({
    id: 'porto-sombrio', nome: 'Porto Sombrio', versao: '1.14',
    capa: '', site: BASE + '/', notas: notas,
    pacote_windows: { url: BASE + '/1.14-windows.zip', tamanho: z.length, sha256: sha(z), arquivo: 'resources.neu' },
  }, extra || {});
  const cat = (nome, c) => fs.writeFileSync(path.join(SERVE, nome), JSON.stringify(c, null, 2));
  cat('catalogo.json', { distribuidora: 'NightGetaway', launcher_min: '2.0.0', jogos: [jogo()] });
  cat('catalogo-sha.json', {
    launcher_min: '2.0.0', jogos: [jogo({
      pacote_windows: { url: BASE + '/1.14-windows.zip', tamanho: z.length, sha256: 'f'.repeat(64) },
    })],
  });
  cat('catalogo-curto.json', {
    launcher_min: '2.0.0', jogos: [jogo({
      pacote_windows: { url: BASE + '/curto.zip', tamanho: z.length, sha256: sha(z) },
    })],
  });
  cat('catalogo-ruim.json', {
    launcher_min: '2.0.0', jogos: [jogo({
      pacote_windows: { url: BASE + '/ruim.zip', tamanho: zruim.length, sha256: sha(zruim) },
    })],
  });
  cat('catalogo-min.json', { launcher_min: '9.0.0', jogos: [jogo()] });
  return neu;
}

/* ------------------------------------------------- discos de mentira */
/** O launcher instalado (com o runtime do jogo junto) e nada na pasta de jogos. */
function discoVazio() {
  const d = {};
  d[EXE_LAUNCHER] = 'MZ PROGRAMA DO JOGO (runtime)';
  return d;
}
function discoInstalado(versao, extra) {
  const d = discoVazio();
  d[EXE] = 'MZ PROGRAMA DO JOGO (runtime)';
  d[PASTA + '\\resources.neu'] = comoNoDisco(neuFalso(versao));
  d[PASTA + '\\estado.json'] = JSON.stringify(Object.assign({
    id: 'porto-sombrio', nome: 'Porto Sombrio', versao: versao,
    notas: ['Versão instalada no computador.'], versao_anterior: null,
    tentativa: null, lancou: true,
  }, extra || {}));
  return d;
}
/** O resources.neu gravado no disco é da versão X? */
function discoTemVersao(disco, arquivo, versao) {
  const s = disco[arquivo] || '';
  return s.indexOf('JOGO ' + versao + ' RODANDO') >= 0;
}

/* ------------------------------------------------- ajuda */
async function abrir(ctx, cat, seed) {
  const page = await ctx.newPage();
  const erros = [];
  page.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  page.on('pageerror', e => erros.push(String(e)));
  await page.addInitScript(({ c, s }) => { window.NG_CAT = c; window.NG_FS_SEED = s; },
    { c: BASE + '/' + cat, s: seed || {} });
  await page.goto(BASE + '/index.html', { waitUntil: 'load' });
  await page.waitForSelector('#lista .jogo, #avisos .aviso', { timeout: 8000 }).catch(() => { });
  await page.waitForTimeout(350);
  page.erros = erros;
  return page;
}
const txt = (p) => p.textContent('body');

async function main() {
  montar();
  const srv = spawn('python3', ['-m', 'http.server', String(PORTA), '--bind', '127.0.0.1'],
    { cwd: SERVE, stdio: 'ignore' });
  await new Promise(r => setTimeout(r, 900));
  const navegador = await chromium.launch({
    executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome',
    args: ['--no-sandbox'],
  });
  const tiros = [];
  try {
    /* ---------- 1. sem internet ---------- */
    console.log('\n1) Sem internet (catálogo não responde)');
    let ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    let p = await abrir(ctx, 'nao-existe.json', discoInstalado('1.13.1'));
    let t = await txt(p);
    conferir(/Não consegui falar com o site/.test(t), 'mostra o aviso de sem internet');
    conferir(/1\.13\.1/.test(t), 'mostra a versão instalada (1.13.1)');
    conferir(!(await p.isDisabled('[data-jogar]')), 'o botão JOGAR continua funcionando');
    conferir(await p.isHidden('[data-atualizar]'), 'não oferece atualizar sem catálogo');
    const sobrou = p.erros.filter(e => !/404|Failed to fetch|ERR_/.test(e));
    conferir(sobrou.length === 0, 'sem erros de verdade no console (' + sobrou.join(' | ') + ')');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher2-sem-internet.png'), fullPage: true });
    tiros.push('launcher2-sem-internet.png');
    // JOGAR sem internet: abre o programa do jogo que já está instalado
    await p.click('[data-jogar]');
    await p.waitForFunction(() => /Jogo aberto|Não consegui abrir/.test(document.body.textContent), null, { timeout: 8000 });
    let exec = await p.evaluate(() => window.NG_VER_EXEC());
    conferir(exec.length === 1 && exec[0].cmd === CMD_ESPERADO,
      'sem internet, JOGAR abre o exe da pasta de jogos (' + JSON.stringify(exec) + ')');
    await ctx.close();

    /* ---------- 2. versão nova: baixa, confere e troca ---------- */
    console.log('\n2) Tem versão nova (1.13.1 -> 1.14)');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    p = await abrir(ctx, 'catalogo.json', discoInstalado('1.13.1'));
    t = await txt(p);
    conferir(/nova no servidor/.test(t) && /1\.14/.test(t), 'avisa que tem versão nova');
    conferir(/versão nova/i.test(await p.textContent('.carimbo')), 'carimbo "versão nova"');
    conferir(/Sargento Valença/.test(t), 'mostra as Novidades (notas do catálogo)');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher2-versao-nova.png'), fullPage: true });
    tiros.push('launcher2-versao-nova.png');
    await p.click('[data-atualizar]');
    await p.waitForFunction(() => /Pronto: versão|Não deu para atualizar/.test(document.body.textContent), null, { timeout: 20000 });
    t = await txt(p);
    conferir(/Pronto: versão 1\.14 instalada/.test(t), 'baixou, conferiu o sha256 e instalou');
    let disco = await p.evaluate(() => window.NG_VER_DISCO());
    conferir(discoTemVersao(disco, PASTA + '\\resources.neu', '1.14'), 'o resources.neu no disco agora é a 1.14');
    conferir(discoTemVersao(disco, PASTA + '\\anterior.neu', '1.13.1'), 'a 1.13.1 ficou guardada em anterior.neu');
    conferir(!(PASTA + '\\resources.neu.tmp' in disco), 'o .tmp não sobrou (troca atômica)');
    let est = JSON.parse(disco[PASTA + '\\estado.json']);
    conferir(est.versao === '1.14' && est.versao_anterior === '1.13.1' && est.tentativa === '1.14' && est.lancou === false,
      'estado.json: versão 1.14, anterior 1.13.1, marcada como tentativa e ainda não aberta');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher2-instalado.png'), fullPage: true });
    tiros.push('launcher2-instalado.png');

    /* ---------- 5. clicar em JOGAR ---------- */
    console.log('\n5) Clique em JOGAR (abre o programa do jogo)');
    await p.click('[data-jogar]');
    await p.waitForFunction(() => /Jogo aberto|Não consegui abrir/.test(document.body.textContent), null, { timeout: 8000 });
    t = await txt(p);
    conferir(/Jogo aberto numa janela só dele/.test(t), 'avisa que o jogo abriu em janela própria');
    exec = await p.evaluate(() => window.NG_VER_EXEC());
    conferir(exec.length === 1, 'mandou abrir um programa só (' + exec.length + ')');
    conferir(exec[0] && exec[0].cmd === CMD_ESPERADO,
      'o comando é exatamente o exe da pasta de jogos: ' + (exec[0] ? exec[0].cmd : '—'));
    conferir(exec[0] && exec[0].background === true, 'abre em segundo plano (não trava o launcher)');
    conferir(!/catalogo|http|\.zip/.test(exec[0] ? exec[0].cmd : ''), 'o comando não vem do catálogo nem da internet');
    conferir(/A versão 1\.14 é nova aqui/.test(t), 'pergunta se a versão nova abriu direito');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher2-jogo-aberto.png'), fullPage: true });
    tiros.push('launcher2-jogo-aberto.png');
    await p.click('[data-abriu]');
    await p.waitForFunction(() => /está funcionando/.test(document.body.textContent), null, { timeout: 5000 });
    disco = await p.evaluate(() => window.NG_VER_DISCO());
    est = JSON.parse(disco[PASTA + '\\estado.json']);
    conferir(est.tentativa === null, '"abriu, está funcionando" tira a marca de tentativa');
    conferir(p.erros.length === 0, 'sem erros no console (' + p.erros.join(' | ') + ')');
    await ctx.close();

    /* ---------- 3. sha256 errado ---------- */
    console.log('\n3) sha256 errado');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    p = await abrir(ctx, 'catalogo-sha.json', discoInstalado('1.13.1'));
    await p.click('[data-atualizar]');
    await p.waitForFunction(() => /Não deu para atualizar|Pronto: versão/.test(document.body.textContent), null, { timeout: 20000 });
    t = await txt(p);
    conferir(/Não deu para atualizar/.test(t) && /sha256/.test(t), 'recusa o pacote e explica o motivo');
    conferir(/continua com a versão 1\.13\.1/.test(t), 'avisa que nada foi trocado');
    disco = await p.evaluate(() => window.NG_VER_DISCO());
    conferir(discoTemVersao(disco, PASTA + '\\resources.neu', '1.13.1'), 'o jogo no disco continua a 1.13.1');
    conferir(!(PASTA + '\\resources.neu.tmp' in disco), 'não deixou lixo .tmp no disco');
    conferir(JSON.parse(disco[PASTA + '\\estado.json']).versao === '1.13.1', 'estado.json intacto');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher2-sha-errado.png'), fullPage: true });
    tiros.push('launcher2-sha-errado.png');
    await ctx.close();

    /* ---------- 4. download interrompido ---------- */
    console.log('\n4) Download interrompido (veio menos do que o combinado)');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    p = await abrir(ctx, 'catalogo-curto.json', discoInstalado('1.13.1'));
    await p.click('[data-atualizar]');
    await p.waitForFunction(() => /Não deu para atualizar|Pronto: versão/.test(document.body.textContent), null, { timeout: 20000 });
    t = await txt(p);
    conferir(/Não deu para atualizar/.test(t) && /interrompido/.test(t), 'percebe o download cortado');
    disco = await p.evaluate(() => window.NG_VER_DISCO());
    conferir(discoTemVersao(disco, PASTA + '\\resources.neu', '1.13.1'), 'o jogo no disco continua a 1.13.1');
    await ctx.close();

    /* ---------- 9. pacote que não é um resources.neu ---------- */
    console.log('\n9) Pacote com sha256 certo mas conteúdo errado');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    p = await abrir(ctx, 'catalogo-ruim.json', discoInstalado('1.13.1'));
    await p.click('[data-atualizar]');
    await p.waitForFunction(() => /Não deu para atualizar|Pronto: versão/.test(document.body.textContent), null, { timeout: 20000 });
    t = await txt(p);
    conferir(/Não deu para atualizar/.test(t) && /formato certo|pequeno demais|configuração/.test(t),
      'recusa um pacote que não é o arquivo do jogo');
    disco = await p.evaluate(() => window.NG_VER_DISCO());
    conferir(discoTemVersao(disco, PASTA + '\\resources.neu', '1.13.1'), 'o jogo no disco continua a 1.13.1');
    await ctx.close();

    /* ---------- 6. primeira instalação (copia o .exe) ---------- */
    console.log('\n6) Primeira vez (nada instalado: tem que copiar o programa do jogo)');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    p = await abrir(ctx, 'catalogo.json', discoVazio());
    t = await txt(p);
    conferir(/nenhuma/.test(t), 'diz que não tem versão instalada');
    conferir(await p.isDisabled('[data-jogar]'), 'JOGAR fica desligado até baixar');
    conferir(/Baixar e instalar/.test(await p.textContent('[data-atualizar]')), 'botão "Baixar e instalar"');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher2-primeira-vez.png'), fullPage: true });
    tiros.push('launcher2-primeira-vez.png');
    await p.click('[data-atualizar]');
    await p.waitForFunction(() => /Pronto: versão|Não deu/.test(document.body.textContent), null, { timeout: 20000 });
    conferir(/Pronto: versão 1\.14 instalada/.test(await txt(p)), 'instala do zero');
    disco = await p.evaluate(() => window.NG_VER_DISCO());
    conferir(/MZ PROGRAMA DO JOGO/.test(disco[EXE] || ''), 'copiou o "Porto Sombrio.exe" para a pasta de jogos');
    conferir(!(EXE + '.tmp' in disco), 'não sobrou .exe.tmp');
    conferir(discoTemVersao(disco, PASTA + '\\resources.neu', '1.14'), 'gravou o resources.neu da 1.14');
    conferir(!(PASTA + '\\anterior.neu' in disco), 'na primeira vez não existe reserva');
    await p.click('[data-jogar]');
    await p.waitForFunction(() => /Jogo aberto|Não consegui abrir/.test(document.body.textContent), null, { timeout: 8000 });
    exec = await p.evaluate(() => window.NG_VER_EXEC());
    conferir(exec.length === 1 && exec[0].cmd === CMD_ESPERADO, 'depois de instalar, JOGAR abre o exe certo');
    await ctx.close();

    /* ---------- 7. launcher velho ---------- */
    console.log('\n7) Launcher velho (launcher_min 9.0.0)');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    p = await abrir(ctx, 'catalogo-min.json', discoInstalado('1.13.1'));
    t = await txt(p);
    conferir(/Tem um launcher novo/.test(t), 'avisa que o launcher está velho');
    conferir(!(await p.isDisabled('[data-jogar]')), 'mesmo assim deixa jogar');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher2-min.png'), fullPage: true });
    tiros.push('launcher2-min.png');
    await ctx.close();

    /* ---------- 8. versão que não abriu -> volta na reserva ---------- */
    console.log('\n8) A versão nova não abriu -> volta para a reserva');
    // 8a. automático: ficou marcada como tentativa, o jogador já tinha mandado abrir
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    let d = discoInstalado('1.14', { versao_anterior: '1.13.1', tentativa: '1.14', lancou: true });
    d[PASTA + '\\anterior.neu'] = comoNoDisco(neuFalso('1.13.1'));
    p = await abrir(ctx, 'catalogo.json', d);
    t = await txt(p);
    conferir(/A versão 1\.14 não abriu/.test(t) && /1\.13\.1/.test(t), 'avisa que voltou para a anterior');
    disco = await p.evaluate(() => window.NG_VER_DISCO());
    conferir(discoTemVersao(disco, PASTA + '\\resources.neu', '1.13.1'), 'o disco voltou para a 1.13.1');
    conferir(JSON.parse(disco[PASTA + '\\estado.json']).versao === '1.13.1', 'estado.json voltou para a 1.13.1');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher2-reserva.png'), fullPage: true });
    tiros.push('launcher2-reserva.png');
    await ctx.close();

    // 8b. na mão: o jogador clica em "não abriu"
    console.log('   (e no botão "não abriu")');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    d = discoInstalado('1.14', { versao_anterior: '1.13.1', tentativa: '1.14', lancou: false });
    d[PASTA + '\\anterior.neu'] = comoNoDisco(neuFalso('1.13.1'));
    p = await abrir(ctx, 'catalogo.json', d);
    await p.click('[data-jogar]');
    await p.waitForFunction(() => /é nova aqui/.test(document.body.textContent), null, { timeout: 8000 });
    await p.click('[data-nao-abriu]');
    await p.waitForFunction(() => /Voltei para a versão/.test(document.body.textContent), null, { timeout: 5000 });
    disco = await p.evaluate(() => window.NG_VER_DISCO());
    conferir(discoTemVersao(disco, PASTA + '\\resources.neu', '1.13.1'), 'o botão "não abriu" devolve a 1.13.1');
    conferir(JSON.parse(disco[PASTA + '\\estado.json']).tentativa === null, 'e limpa a marca de tentativa');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher2-nao-abriu.png'), fullPage: true });
    tiros.push('launcher2-nao-abriu.png');
    await ctx.close();
  } finally {
    await navegador.close();
    srv.kill();
    try { execSync('fuser -k ' + PORTA + '/tcp', { stdio: 'ignore' }); } catch (e) { }
  }

  console.log('\nScreenshots em ' + SCRATCH + ':');
  tiros.forEach(f => console.log('   ' + f));
  if (falhas.length) {
    console.log('\n' + falhas.length + ' FALHA(S):');
    falhas.forEach(f => console.log(' - ' + f));
    process.exit(1);
  }
  console.log('\nTUDO OK');
}

main().catch(e => { console.error(e); try { execSync('fuser -k ' + PORTA + '/tcp'); } catch (_) { } process.exit(1); });
