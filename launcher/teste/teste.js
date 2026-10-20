/* =====================================================================
   TESTE DA TELA DO LAUNCHER (Playwright + Neutralino de mentira)

   Como rodar (na raiz do projeto):
     env -u HTTPS_PROXY -u https_proxy node launcher/teste/teste.js

   O teste:
     - monta uma pasta de mentira com o launcher + catálogos + pacotes .zip;
     - sobe um servidor na porta 8792;
     - abre o launcher no Chromium e testa:
         1. sem internet                 5. clique em JOGAR (e o save continua)
         2. tem versão nova              6. nada instalado
         3. sha256 errado                7. launcher velho (launcher_min)
         4. download interrompido        8. versão que não abriu -> volta na reserva
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

let falhas = [];
const ok = (t) => console.log('   ok  ' + t);
function conferir(cond, t) { if (cond) ok(t); else { falhas.push(t); console.log('  ERRO ' + t); } }

/* ------------------------------------------------- jogo de mentira e zips */
function jogoFalso(versao) {
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">' +
    `<title>Porto Sombrio ${versao}</title></head><body>` +
    `<h1 id="marca-jogo">JOGO ${versao} RODANDO</h1>` +
    '<!-- ' + 'x'.repeat(8000) + ' -->' +
    '<script>document.title="Porto Sombrio ' + versao + '";</scr' + 'ipt></body></html>';
}

function zipar(nome, conteudo) {
  const dados = Buffer.from(conteudo, 'utf8');
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
  for (const f of ['index.html', 'jogo.html']) {
    let s = fs.readFileSync(path.join(SERVE, f), 'utf8');
    s = s.replace('<script src="__neutralino_globals.js"></script>', '<script src="mock.js"></script>')
         .replace('<script src="neutralino.js"></script>', '');
    fs.writeFileSync(path.join(SERVE, f), s);
  }
  // pacote da 1.14 (bom) e um pedaço dele (download cortado)
  const z = zipar('index.html', jogoFalso('1.14'));
  fs.writeFileSync(path.join(SERVE, '1.14-windows.zip'), z);
  fs.writeFileSync(path.join(SERVE, 'curto.zip'), z.subarray(0, Math.floor(z.length / 2)));

  const notas = ['Camboriú maior: Tiro de Guerra, frigorífico, cemitério e as casas das oferendas.',
    'Sargento Valença entra na luta final com você.',
    'Furtividade: mate em silêncio e esconda o corpo.'];
  const jogo = (extra) => Object.assign({
    id: 'porto-sombrio', nome: 'Porto Sombrio', versao: '1.14',
    capa: '', site: BASE + '/', notas: notas,
    pacote_windows: { url: BASE + '/1.14-windows.zip', tamanho: z.length, sha256: sha(z) },
  }, extra || {});
  const cat = (nome, c) => fs.writeFileSync(path.join(SERVE, nome), JSON.stringify(c, null, 2));
  cat('catalogo.json', { distribuidora: 'NightGetaway', launcher_min: '1.0.0', jogos: [jogo()] });
  cat('catalogo-sha.json', {
    launcher_min: '1.0.0', jogos: [jogo({
      pacote_windows: { url: BASE + '/1.14-windows.zip', tamanho: z.length, sha256: 'f'.repeat(64) },
    })],
  });
  cat('catalogo-curto.json', {
    launcher_min: '1.0.0', jogos: [jogo({
      pacote_windows: { url: BASE + '/curto.zip', tamanho: z.length, sha256: sha(z) },
    })],
  });
  cat('catalogo-min.json', { launcher_min: '2.0.0', jogos: [jogo()] });
  return z;
}

/* ------------------------------------------------- discos de mentira */
function discoInstalado(versao, extra) {
  const d = {};
  d[PASTA + '\\index.html'] = jogoFalso(versao);
  d[PASTA + '\\estado.json'] = JSON.stringify(Object.assign({
    id: 'porto-sombrio', nome: 'Porto Sombrio', versao: versao,
    notas: ['Versão instalada no computador.'], versao_anterior: null, tentativa: null,
  }, extra || {}));
  return d;
}

/* ------------------------------------------------- ajuda */
async function abrir(ctx, cat, seed, query) {
  const page = await ctx.newPage();
  const erros = [];
  page.on('console', m => { if (m.type() === 'error') erros.push(m.text()); });
  page.on('pageerror', e => erros.push(String(e)));
  await page.addInitScript(({ c, s }) => { window.NG_CAT = c; window.NG_FS_SEED = s; },
    { c: BASE + '/' + cat, s: seed || {} });
  await page.goto(BASE + '/index.html' + (query || ''), { waitUntil: 'load' });
  await page.waitForSelector('#lista .jogo, #avisos .aviso', { timeout: 8000 }).catch(() => { });
  await page.waitForTimeout(350);
  page.erros = erros;
  return page;
}
const txt = (p) => p.textContent('body');

async function main() {
  const zbom = montar();
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
    conferir(/Sem internet agora/.test(t), 'mostra o aviso de sem internet');
    conferir(/1\.13\.1/.test(t), 'mostra a versão instalada (1.13.1)');
    conferir(!(await p.isDisabled('[data-jogar]')), 'o botão JOGAR continua funcionando');
    conferir(await p.isHidden('[data-atualizar]'), 'não oferece atualizar sem catálogo');
    // o 404 do catálogo é de propósito neste teste; o resto do console tem que estar limpo
    const sobrou = p.erros.filter(e => !/404|Failed to fetch|ERR_/.test(e));
    conferir(sobrou.length === 0, 'sem erros de verdade no console (' + sobrou.join(' | ') + ')');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher-sem-internet.png'), fullPage: true });
    tiros.push('launcher-sem-internet.png');
    await ctx.close();

    /* ---------- 2. versão nova: baixa, confere e troca ---------- */
    console.log('\n2) Tem versão nova (1.13.1 -> 1.14)');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    p = await abrir(ctx, 'catalogo.json', discoInstalado('1.13.1'));
    t = await txt(p);
    conferir(/nova no servidor/.test(t) && /1\.14/.test(t), 'avisa que tem versão nova');
    conferir(/VERSÃO NOVA|versão nova/i.test(await p.textContent('.carimbo')), 'carimbo "versão nova"');
    conferir(/Sargento Valença/.test(t), 'mostra as Novidades (notas do catálogo)');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher-versao-nova.png'), fullPage: true });
    tiros.push('launcher-versao-nova.png');
    await p.click('[data-atualizar]');
    await p.waitForFunction(() => /Pronto: versão|Não deu para atualizar/.test(document.body.textContent), null, { timeout: 15000 });
    t = await txt(p);
    conferir(/Pronto: versão 1\.14 instalada/.test(t), 'baixou, conferiu o sha256 e instalou');
    let disco = await p.evaluate(() => window.NG_VER_DISCO());
    conferir(/JOGO 1\.14 RODANDO/.test(disco[PASTA + '\\index.html'] || ''), 'o index.html no disco agora é a 1.14');
    conferir(/JOGO 1\.13\.1 RODANDO/.test(disco[PASTA + '\\anterior.html'] || ''), 'a 1.13.1 ficou guardada em anterior.html');
    conferir(!(PASTA + '\\index.html.tmp' in disco), 'o .tmp não sobrou (troca atômica)');
    let est = JSON.parse(disco[PASTA + '\\estado.json']);
    conferir(est.versao === '1.14' && est.versao_anterior === '1.13.1' && est.tentativa === '1.14',
      'estado.json: versão 1.14, anterior 1.13.1, marcada como tentativa');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher-instalado.png'), fullPage: true });
    tiros.push('launcher-instalado.png');

    /* ---------- 5. clicar em JOGAR (na mesma aba, save mantido) ---------- */
    console.log('\n5) Clique em JOGAR (mesma origem, save do jogador mantido)');
    await p.evaluate(() => localStorage.setItem('ps-save-1', 'MEU SAVE'));
    await p.click('[data-jogar]');
    await p.waitForFunction(() => /JOGO 1\.14 RODANDO|Não consegui abrir/.test(document.body.textContent), null, { timeout: 8000 });
    t = await txt(p);
    conferir(/JOGO 1\.14 RODANDO/.test(t), 'o jogo abriu (HTML do disco injetado em jogo.html)');
    conferir(await p.evaluate(() => localStorage.getItem('ps-save-1')) === 'MEU SAVE',
      'o save do jogador (localStorage) continua lá depois da troca de versão');
    disco = await p.evaluate(() => window.NG_VER_DISCO());
    est = JSON.parse(disco[PASTA + '\\estado.json']);
    conferir(est.tentativa === null, 'abriu de verdade: a marca de tentativa saiu do estado.json');
    conferir(p.erros.length === 0, 'sem erros no console (' + p.erros.join(' | ') + ')');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher-jogo-aberto.png') });
    tiros.push('launcher-jogo-aberto.png');
    await ctx.close();

    /* ---------- 3. sha256 errado ---------- */
    console.log('\n3) sha256 errado');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    p = await abrir(ctx, 'catalogo-sha.json', discoInstalado('1.13.1'));
    await p.click('[data-atualizar]');
    await p.waitForFunction(() => /Não deu para atualizar|Pronto: versão/.test(document.body.textContent), null, { timeout: 15000 });
    t = await txt(p);
    conferir(/Não deu para atualizar/.test(t) && /sha256/.test(t), 'recusa o pacote e explica o motivo');
    conferir(/continua com a versão 1\.13\.1/.test(t), 'avisa que nada foi trocado');
    disco = await p.evaluate(() => window.NG_VER_DISCO());
    conferir(/JOGO 1\.13\.1 RODANDO/.test(disco[PASTA + '\\index.html'] || ''), 'o jogo no disco continua a 1.13.1');
    conferir(!(PASTA + '\\index.html.tmp' in disco), 'não deixou lixo .tmp no disco');
    conferir(JSON.parse(disco[PASTA + '\\estado.json']).versao === '1.13.1', 'estado.json intacto');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher-sha-errado.png'), fullPage: true });
    tiros.push('launcher-sha-errado.png');
    await ctx.close();

    /* ---------- 4. download interrompido ---------- */
    console.log('\n4) Download interrompido (veio menos do que o combinado)');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    p = await abrir(ctx, 'catalogo-curto.json', discoInstalado('1.13.1'));
    await p.click('[data-atualizar]');
    await p.waitForFunction(() => /Não deu para atualizar|Pronto: versão/.test(document.body.textContent), null, { timeout: 15000 });
    t = await txt(p);
    conferir(/Não deu para atualizar/.test(t) && /interrompido/.test(t), 'percebe o download cortado');
    disco = await p.evaluate(() => window.NG_VER_DISCO());
    conferir(/JOGO 1\.13\.1 RODANDO/.test(disco[PASTA + '\\index.html'] || ''), 'o jogo no disco continua a 1.13.1');
    await ctx.close();

    /* ---------- 6. nada instalado ---------- */
    console.log('\n6) Primeira vez (nada instalado)');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    p = await abrir(ctx, 'catalogo.json', {});
    t = await txt(p);
    conferir(/nenhuma/.test(t), 'diz que não tem versão instalada');
    conferir(await p.isDisabled('[data-jogar]'), 'JOGAR fica desligado até baixar');
    conferir(/Baixar e instalar/.test(await p.textContent('[data-atualizar]')), 'botão "Baixar e instalar"');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher-primeira-vez.png'), fullPage: true });
    tiros.push('launcher-primeira-vez.png');
    await p.click('[data-atualizar]');
    await p.waitForFunction(() => /Pronto: versão|Não deu/.test(document.body.textContent), null, { timeout: 15000 });
    conferir(/Pronto: versão 1\.14 instalada/.test(await txt(p)), 'instala do zero');
    await ctx.close();

    /* ---------- 7. launcher velho ---------- */
    console.log('\n7) Launcher velho (launcher_min 2.0.0)');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    p = await abrir(ctx, 'catalogo-min.json', discoInstalado('1.13.1'));
    t = await txt(p);
    conferir(/Tem um launcher novo/.test(t), 'avisa que o launcher está velho');
    conferir(!(await p.isDisabled('[data-jogar]')), 'mesmo assim deixa jogar');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher-min.png'), fullPage: true });
    tiros.push('launcher-min.png');
    await ctx.close();

    /* ---------- 8. versão que não abriu -> volta na reserva ---------- */
    console.log('\n8) A versão nova não abriu -> volta para a reserva');
    ctx = await navegador.newContext({ viewport: { width: 1080, height: 760 } });
    const d = discoInstalado('1.14', { versao_anterior: '1.13.1', tentativa: '1.14' });
    d[PASTA + '\\anterior.html'] = jogoFalso('1.13.1');
    p = await abrir(ctx, 'catalogo.json', d);
    t = await txt(p);
    conferir(/A versão 1\.14 não abriu/.test(t) && /1\.13\.1/.test(t), 'avisa que voltou para a anterior');
    disco = await p.evaluate(() => window.NG_VER_DISCO());
    conferir(/JOGO 1\.13\.1 RODANDO/.test(disco[PASTA + '\\index.html'] || ''), 'o disco voltou para a 1.13.1');
    conferir(JSON.parse(disco[PASTA + '\\estado.json']).versao === '1.13.1', 'estado.json voltou para a 1.13.1');
    await p.screenshot({ path: path.join(SCRATCH, 'launcher-reserva.png'), fullPage: true });
    tiros.push('launcher-reserva.png');
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
