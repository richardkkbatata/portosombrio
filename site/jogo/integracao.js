/* Porto Sombrio — integração do jogo com o site (não altera o jogo em si).
   Anúncio premiado OPCIONAL: depois de morrer, "assistir um anúncio e continuar daqui".
   Usa o H5 Games Ads do Google (adBreak/adConfig). Se o anúncio não existir, não carregar,
   ou o ID ainda for placeholder, o botão simplesmente não aparece e o jogo segue igual. */
(function () {
  'use strict';
  var C = window.PS_CONFIG || {};
  var PUB = String(C.ADSENSE_CLIENT || '');
  if (!/^ca-pub-\d{16}$/.test(PUB)) return;
  if (typeof UI === 'undefined' || typeof G === 'undefined' || typeof P === 'undefined') return;

  // ---- H5 Games Ads ----
  window.adsbygoogle = window.adsbygoogle || [];
  window.adBreak = window.adConfig = function (o) { window.adsbygoogle.push(o); };
  var s = document.createElement('script');
  s.async = true; s.crossOrigin = 'anonymous';
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(PUB);
  s.setAttribute('data-ad-frequency-hint', '30s');
  if (C.ANUNCIO_TESTE) s.setAttribute('data-adbreak-test', 'on');
  var pronto = false;
  s.onerror = function () { pronto = false; };
  document.head.appendChild(s);
  try {
    window.adConfig({ preloadAdBreaks: 'on', sound: 'on', onReady: function () { pronto = true; } });
  } catch (e) {}

  var ultimo = 0, INTERVALO = 3 * 60 * 1000; // no máximo um "continuar" a cada 3 minutos

  function somDoJogo(liga) {
    try { if (typeof AU !== 'undefined' && AU.ctx) { if (liga) AU.ctx.resume(); else AU.ctx.suspend(); } } catch (e) {}
  }

  function reviver() {
    try {
      P.hp = Math.max(1, Math.ceil(P.max * 0.5));
      P.inv = 3; G.hurt = 0;
      if (typeof enemies !== 'undefined') {
        for (var i = 0; i < enemies.length; i++) {
          var e = enemies[i];
          if (e && e.alive && Math.hypot(e.x - P.x, e.y - P.y) < 220) e.stun = Math.max(e.stun || 0, 2.5);
        }
      }
      UI.close(); G.mode = 'play';
      var tc = document.getElementById('tc'); if (tc && typeof IN !== 'undefined') tc.hidden = !IN.touch;
      if (typeof toast === 'function') toast('Você levantou. Metade da vida. Sai daí.');
      ultimo = Date.now();
    } catch (e) {}
  }

  function msg(btn, t) { btn.textContent = t; btn.disabled = true; }

  function tentar(btn) {
    btn.disabled = true; btn.textContent = 'Carregando anúncio...';
    var acabou = false;
    var fim = setTimeout(function () { if (!acabou) { acabou = true; somDoJogo(true); msg(btn, 'Nenhum anúncio disponível agora.'); } }, 10000);
    try {
      window.adBreak({
        type: 'reward',
        name: 'continuar-depois-de-morrer',
        beforeAd: function () { somDoJogo(false); },
        afterAd: function () { somDoJogo(true); },
        beforeReward: function (mostrar) { clearTimeout(fim); mostrar(); },
        adDismissed: function () { acabou = true; msg(btn, 'Anúncio fechado antes do fim.'); },
        adViewed: function () { acabou = true; reviver(); },
        adBreakDone: function (info) {
          clearTimeout(fim); somDoJogo(true);
          if (!acabou && (!info || info.breakStatus !== 'viewed')) { acabou = true; msg(btn, 'Nenhum anúncio disponível agora.'); }
        }
      });
    } catch (e) { clearTimeout(fim); acabou = true; msg(btn, 'Nenhum anúncio disponível agora.'); }
  }

  var deadOriginal = UI.dead;
  UI.dead = function () {
    var r = deadOriginal.apply(this, arguments);
    try {
      if (!pronto || Date.now() - ultimo < INTERVALO) return r;
      var menu = document.querySelector('#ov .dead .menu'); if (!menu) return r;
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'btn'; b.textContent = 'Assistir um anúncio e continuar daqui';
      b.addEventListener('click', function (ev) { ev.stopPropagation(); tentar(b); });
      menu.insertBefore(b, menu.firstChild);
    } catch (e) {}
    return r;
  };
})();
