/* Ranking do Modo Horda: lê /api/ranking (Cloudflare Pages Function) e preenche as duas listas. */
(function () {
  'use strict';
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  document.querySelectorAll('[data-ranking]').forEach(function (ol) {
    var modo = ol.getAttribute('data-ranking');
    fetch('/api/ranking?modo=' + modo, { cache: 'no-store' }).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d || !Array.isArray(d.top)) throw 0;
      if (!d.top.length) { ol.innerHTML = '<li class="vazio">Ninguém ainda. A primeira linha é sua.</li>'; return; }
      ol.innerHTML = d.top.map(function (r) {
        return '<li><b>' + esc(r.equipe) + '</b><span>onda ' + (r.onda | 0) + ' · ' + (r.kills | 0) + ' zumbis · ' + esc(r.data || '') + '</span></li>';
      }).join('');
    }).catch(function () { ol.innerHTML = '<li class="vazio">O quadro não abriu agora. Tente de novo daqui a pouco.</li>'; });
  });
})();
