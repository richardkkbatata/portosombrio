/* Porto Sombrio · app Android: ponte com o aparelho (window.PSNativo). Roda antes do jogo. */
(function () {
  'use strict';
  var N = window.PSNativo;
  // vibração de verdade (a WebView não vibra sozinha)
  if (N) try {
    navigator.vibrate = function (p) {
      var ms = Array.isArray(p) ? p.reduce(function (a, b, i) { return i % 2 ? a : a + (+b || 0); }, 0) : (+p || 0);
      if (ms > 0) N.vibrar(ms);
      return true;
    };
  } catch (e) { }
  // som: quando o app vai pro fundo, o som do jogo para; quando volta, continua
  var ctxs = [], A = window.AudioContext || window.webkitAudioContext;
  if (A) try {
    var W = function (o) { var c = o ? new A(o) : new A(); ctxs.push(c); return c; };
    W.prototype = A.prototype;
    window.AudioContext = W; window.webkitAudioContext = W;
  } catch (e) { }
  var tocando = [];
  window.PSApp = {
    fundo: function (f) {
      try {
        if (f) { tocando = ctxs.filter(function (c) { return c.state === 'running'; }); tocando.forEach(function (c) { c.suspend(); }); }
        else { tocando.forEach(function (c) { c.resume(); }); tocando = []; }
      } catch (e) { }
    }
  };
  // sem menu de segurar, sem seleção de texto, sem arrastar imagem, sem zoom de pinça
  function campo(t) { return t && t.closest && t.closest('input,textarea,[contenteditable]'); }
  document.addEventListener('contextmenu', function (e) { if (!campo(e.target)) e.preventDefault(); }, true);
  document.addEventListener('selectstart', function (e) { if (!campo(e.target)) e.preventDefault(); }, true);
  document.addEventListener('dragstart', function (e) { e.preventDefault(); }, true);
  document.addEventListener('touchmove', function (e) { if (e.touches && e.touches.length > 1) e.preventDefault(); }, { passive: false, capture: true });
  // avisa o app que o jogo desenhou a primeira tela (tira a abertura)
  window.addEventListener('load', function () {
    requestAnimationFrame(function () { requestAnimationFrame(function () { try { if (N) N.pronto(); } catch (e) { } }); });
  });
})();
