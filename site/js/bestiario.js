/* Porto Sombrio — filtro do bestiário. */
(function () {
  'use strict';
  var bs = document.querySelectorAll('.filtros [data-f]'), fichas = document.querySelectorAll('.especime');
  bs.forEach(function (b) {
    b.addEventListener('click', function () {
      var f = b.getAttribute('data-f');
      bs.forEach(function (x) { x.setAttribute('aria-pressed', x === b ? 'true' : 'false'); });
      fichas.forEach(function (el) { el.hidden = !(f === 'todos' || el.getAttribute('data-tipo') === f); });
      if (window.PS_SOM) window.PS_SOM.tecla();
    });
  });
})();
