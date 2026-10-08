/* Porto Sombrio — página Jogar: liga a fita, tela cheia, aviso de girar o celular. */
(function () {
  'use strict';
  var JOGO = '/jogo/porto-sombrio.html';
  var monitor = document.getElementById('monitor'), tela = document.getElementById('tela');
  var antes = document.getElementById('antes'), botao = document.getElementById('iniciar');
  var bFs = document.getElementById('tela-cheia'), gire = document.getElementById('gire');
  if (!monitor || !tela) return;
  var frame = null;

  function liga() {
    if (frame) { frame.focus(); return; }
    frame = document.createElement('iframe');
    frame.src = JOGO;
    frame.title = 'Porto Sombrio — o jogo';
    frame.setAttribute('allow', 'fullscreen; autoplay; gamepad');
    tela.appendChild(frame);
    if (antes) antes.remove();
    monitor.classList.add('ligado');
    if (window.PS_SOM) window.PS_SOM.chiado();
    frame.addEventListener('load', function () { try { frame.focus(); } catch (e) {} });
    if (window.innerHeight < 560) monitor.scrollIntoView({ block: 'start' });
    if (history.replaceState) history.replaceState(null, '', '#jogando');
  }
  if (botao) botao.addEventListener('click', liga);
  if (/^#(jogar|jogando)$/.test(location.hash) || /[?&]jogar=1/.test(location.search)) liga();

  function emTelaCheia() { return document.fullscreenElement || document.webkitFullscreenElement; }
  function podeTelaCheia() { return !!(monitor.requestFullscreen || monitor.webkitRequestFullscreen); }
  if (bFs) bFs.addEventListener('click', function () {
    if (!frame) liga();
    if (emTelaCheia()) { (document.exitFullscreen || document.webkitExitFullscreen).call(document); return; }
    if (!podeTelaCheia()) { location.href = JOGO; return; } // iPhone: abre o jogo sozinho na tela
    var p = (monitor.requestFullscreen || monitor.webkitRequestFullscreen).call(monitor);
    var depois = function () {
      try { if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(function () {}); } catch (e) {}
      if (frame) frame.focus();
    };
    if (p && p.then) p.then(depois).catch(function () { location.href = JOGO; }); else depois();
  });
  function rotuloFs() { if (bFs) bFs.textContent = emTelaCheia() ? 'Sair da tela cheia' : 'Tela cheia'; }
  document.addEventListener('fullscreenchange', rotuloFs);
  document.addEventListener('webkitfullscreenchange', rotuloFs);

  if (gire) gire.querySelector('button').addEventListener('click', function () { gire.classList.add('dispensado'); if (frame) frame.focus(); });
})();
