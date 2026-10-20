// TESTE DA TELA DO LAUNCHER (android/extra/launcher.html) — roda no computador.
//
// Como rodar (do raiz do projeto, com o Chromium do Playwright em /opt/pw-browsers):
//   env -u HTTPS_PROXY -u https_proxy node android/teste/tela.js
//
// Abre a tela em tamanho de celular (em pé, grande e deitado), em todos os estados
// (em dia, versão nova, baixando, baixada, sem internet) e confere: nada passando da
// tela, sem erro no console, botões e textos certos. Tira as fotos em SAIDA.
// Tem que terminar com TUDO OK.
const { chromium } = require(process.env.PS_PLAYWRIGHT || 'playwright');
const path = require('path');

const RAIZ = path.resolve(__dirname, '..', '..');
const SAIDA = process.env.PS_FOTOS || require('os').tmpdir();
const URL = 'file://' + path.join(RAIZ, 'android/extra/launcher.html');

const TAMANHOS = [
  { nome: '360x640', width: 360, height: 640 },
  { nome: '390x844', width: 390, height: 844 },
  { nome: '844x390', width: 844, height: 390 },
];

const ESTADOS = {
  'em-dia': {
    jogo: 'Porto Sombrio', versao: '1.15', nova: '', pronta: '', tamanho: 0, rede: 'wifi',
    app: '1.15 (115014)', baixando: false,
    notas: ['Conta na nuvem (opcional): o seu registro fica guardado também na internet e você continua a partida em outro aparelho.',
      'Celular: o aplicativo se atualiza sozinho pelo Wi-Fi. Não precisa mais baixar o APK a cada versão.'],
  },
  'versao-nova': {
    jogo: 'Porto Sombrio', versao: '1.15', nova: '1.16', pronta: '', tamanho: 5400000, rede: 'wifi',
    app: '1.15 (115014)', baixando: false,
    notas: ['Capítulo novo no porto velho.', 'Correções no multiplayer e no som.'],
  },
  'sem-internet': {
    jogo: 'Porto Sombrio', versao: '1.15', nova: '', pronta: '', tamanho: 0, rede: 'sem',
    app: '1.15 (115014)', baixando: false, notas: [],
  },
  'baixando': {
    jogo: 'Porto Sombrio', versao: '1.15', nova: '1.16', pronta: '', tamanho: 5400000, rede: 'wifi',
    app: '1.15 (115014)', baixando: true, pct: 42,
    notas: ['Capítulo novo no porto velho.', 'Correções no multiplayer e no som.'],
  },
  'baixada': {
    jogo: 'Porto Sombrio', versao: '1.15', nova: '', pronta: '1.16', tamanho: 5400000, rede: 'movel',
    app: '1.15 (115014)', baixando: false,
    notas: ['Capítulo novo no porto velho.'],
  },
};

let erros = 0;
function ok(nome, cond, extra) {
  if (cond) console.log('ok   ' + nome);
  else { erros++; console.log('ERRO ' + nome + (extra ? ' — ' + extra : '')); }
}

(async () => {
  const navegador = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  for (const tam of TAMANHOS) {
    for (const [nome, estado] of Object.entries(ESTADOS)) {
      const ctx = await navegador.newContext({ viewport: { width: tam.width, height: tam.height }, deviceScaleFactor: 2 });
      const pag = await ctx.newPage();
      const problemas = [];
      pag.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') problemas.push(m.text()); });
      pag.on('pageerror', e => problemas.push('pageerror: ' + e.message));
      await pag.addInitScript(e => { window.PS_ESTADO_TESTE = e; }, estado);
      await pag.goto(URL);
      await pag.waitForTimeout(350);

      const caso = `${nome} @ ${tam.nome}`;
      ok('sem erro no console: ' + caso, problemas.length === 0, problemas.join(' | '));

      // nada passando da largura da tela
      const estoura = await pag.evaluate(() => {
        const larg = document.documentElement.clientWidth;
        const fora = [];
        document.querySelectorAll('body *').forEach(el => {
          const r = el.getBoundingClientRect();
          if (r.width === 0 && r.height === 0) return;
          if (r.right > larg + 1.5 || r.left < -1.5) fora.push(el.tagName + '.' + el.className + ' ' + Math.round(r.left) + '..' + Math.round(r.right));
        });
        return { fora, rolaX: document.documentElement.scrollWidth > larg + 1 };
      });
      ok('nada passa da largura: ' + caso, estoura.fora.length === 0, estoura.fora.join(' | '));
      ok('sem rolagem lateral: ' + caso, !estoura.rolaX);

      // estados
      const v = await pag.evaluate(() => ({
        versao: document.getElementById('versao').textContent,
        nova: document.getElementById('linha-nova').hidden ? '' : document.getElementById('versao-nova').textContent,
        jogar: !document.getElementById('bt-jogar').hidden && !document.getElementById('bt-jogar').disabled,
        atualizar: document.getElementById('bt-atualizar').hidden ? '' : document.getElementById('bt-atualizar').textContent,
        progresso: document.getElementById('progresso').hidden ? '' : document.getElementById('barra-cheia').style.width,
        notas: document.querySelectorAll('#notas li').length,
        avisos: document.getElementById('avisos').textContent,
        app: document.getElementById('versao-app').textContent,
        linha: document.getElementById('estado-linha').textContent,
      }));
      ok('mostra a versão instalada: ' + caso, v.versao === '1.15');
      ok('mostra a versão do app: ' + caso, v.app === '1.15 (115014)');
      ok('JOGAR sempre disponível: ' + caso, v.jogar);
      if (nome === 'em-dia') {
        ok('em dia: sem botão atualizar', v.atualizar === '');
        ok('em dia: mostra as novidades', v.notas === 2);
        ok('em dia: sem aviso de erro', !v.avisos.includes('Sem conexão'));
      }
      if (nome === 'versao-nova') {
        ok('versão nova: botão atualizar', v.atualizar.toLowerCase() === 'atualizar');
        ok('versão nova: mostra 1.16', v.nova.includes('1.16'));
      }
      if (nome === 'sem-internet') {
        ok('sem internet: aviso', v.avisos.includes('Sem conexão'));
        ok('sem internet: sem botão atualizar', v.atualizar === '');
        ok('sem internet: linha diz sem conexão', v.linha === 'sem conexão');
      }
      if (nome === 'baixando') {
        ok('baixando: barra em 42%', v.progresso === '42%');
        ok('baixando: botão atualizar some', v.atualizar === '');
      }
      if (nome === 'baixada') {
        ok('baixada: botão usar a versão nova', v.atualizar.toLowerCase().includes('usar'));
        ok('baixada: aviso de atualização baixada', v.avisos.includes('Atualização baixada'));
      }

      // pergunta dos dados móveis (só no caso de rede móvel com versão nova)
      if (nome === 'versao-nova' && tam.nome === '390x844') {
        await pag.evaluate(() => window.psEvento({ rede: 'movel' }));
        await pag.click('#bt-atualizar');
        const texto = await pag.evaluate(() => document.getElementById('avisos').textContent);
        ok('dados móveis: avisa que gasta internet', texto.includes('gastar a sua internet'));
        ok('dados móveis: mostra o tamanho', texto.includes('5,1 MB'));
        await pag.screenshot({ path: `${SAIDA}/android-launcher-dados-moveis-390x844.png`, fullPage: true });
        await pag.evaluate(() => window.psEvento({ rede: 'wifi' }));
      }

      if (['360x640', '844x390'].includes(tam.nome) || nome === 'em-dia' || nome === 'versao-nova') {
        await pag.screenshot({ path: `${SAIDA}/android-launcher-${nome}-${tam.nome}.png`, fullPage: true });
      }
      await ctx.close();
    }
  }
  await navegador.close();
  console.log(erros === 0 ? 'TUDO OK' : erros + ' ERRO(S)');
  process.exit(erros ? 1 : 0);
})();
