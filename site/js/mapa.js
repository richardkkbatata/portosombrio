/* Porto Sombrio — mapa: liga as áreas do desenho às fichas. Sem JS, todas as fichas aparecem em lista. */
(function () {
  'use strict';
  var papel = document.getElementById('mapa-papel'); if (!papel) return;
  var regioes = papel.querySelectorAll('.regiao'), fichas = document.querySelectorAll('.ficha-regiao');
  function mostra(id, rolar) {
    var achou = false;
    fichas.forEach(function (f) { var on = f.getAttribute('data-regiao') === id; f.hidden = !on; if (on) achou = true; });
    if (!achou) return;
    regioes.forEach(function (r) { r.classList.toggle('ativa', r.getAttribute('data-r') === id); r.setAttribute('aria-pressed', r.getAttribute('data-r') === id ? 'true' : 'false'); });
    if (window.PS_SOM) window.PS_SOM.tecla();
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    if (rolar && window.innerWidth < 860) document.getElementById('ficha-local').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  regioes.forEach(function (r) {
    r.addEventListener('click', function () { mostra(r.getAttribute('data-r'), true); });
    r.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); mostra(r.getAttribute('data-r'), true); } });
  });
  var ini = (location.hash || '').slice(1);
  mostra(document.querySelector('.ficha-regiao[data-regiao="' + ini + '"]') ? ini : 'centro', false);

  var br = document.getElementById('mostrar-rota');
  if (br) br.addEventListener('click', function () {
    var on = papel.classList.toggle('com-rota');
    br.setAttribute('aria-pressed', on ? 'true' : 'false');
    br.textContent = on ? 'Esconder a rota' : 'Mostrar a rota do Richard (spoiler)';
  });
})();
