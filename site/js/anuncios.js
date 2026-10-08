/* Porto Sombrio — Google AdSense.
   Lê o ID em /js/config.js. Enquanto for placeholder, nada do Google é carregado
   e os espaços de anúncio continuam invisíveis (display:none). */
(function () {
  'use strict';
  var C = window.PS_CONFIG || {};
  var PUB = String(C.ADSENSE_CLIENT || ''), SLOT = String(C.ADSENSE_SLOT || '');
  var pubOk = /^ca-pub-\d{16}$/.test(PUB), slotOk = /^\d{6,}$/.test(SLOT);
  if (!pubOk) return;

  function ler() { try { return localStorage.getItem('ps-cookies'); } catch (e) { return null; } }
  function por(v) { try { localStorage.setItem('ps-cookies', v); } catch (e) {} }
  var escolha = ler(); // 'todos' | 'basico' | null

  // Sem escolha ainda: anúncios NÃO personalizados (o mais cuidadoso pela LGPD).
  window.adsbygoogle = window.adsbygoogle || [];
  if (escolha !== 'todos') window.adsbygoogle.requestNonPersonalizedAds = 1;

  var s = document.createElement('script');
  s.async = true; s.crossOrigin = 'anonymous';
  s.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=' + encodeURIComponent(PUB);
  document.head.appendChild(s);

  if (slotOk) {
    document.querySelectorAll('.anuncio').forEach(function (box) {
      var ins = document.createElement('ins');
      ins.className = 'adsbygoogle';
      ins.style.display = 'block';
      ins.setAttribute('data-ad-client', PUB);
      ins.setAttribute('data-ad-slot', SLOT);
      ins.setAttribute('data-ad-format', box.getAttribute('data-formato') || 'auto');
      ins.setAttribute('data-full-width-responsive', 'true');
      box.innerHTML = '<span class="rotulo-anuncio">Publicidade</span>';
      box.appendChild(ins); box.classList.add('ativo');
      try { (window.adsbygoogle = window.adsbygoogle || []).push({}); } catch (e) {}
    });
  }

  // Aviso de cookies (aparece uma vez)
  if (!escolha) {
    var a = document.createElement('div');
    a.className = 'aviso-cookies'; a.setAttribute('role', 'dialog'); a.setAttribute('aria-label', 'Aviso de cookies');
    a.innerHTML = '<p class="datilo-titulo">Aviso · cookies e anúncios</p>' +
      '<p>Este site mostra anúncios do Google AdSense, que usam cookies. Você escolhe se eles podem ser personalizados. Detalhes na <a href="/privacidade/">política de privacidade</a>.</p>' +
      '<div class="botoes"><button class="botao" type="button" data-c="todos">Aceitar</button>' +
      '<button class="botao claro" type="button" data-c="basico">Só não personalizados</button></div>';
    document.body.appendChild(a);
    a.addEventListener('click', function (e) {
      var b = e.target.closest('[data-c]'); if (!b) return;
      por(b.getAttribute('data-c')); a.remove();
    });
  }
  // permite mudar de ideia pela página de privacidade
  document.querySelectorAll('[data-rever-cookies]').forEach(function (b) {
    b.addEventListener('click', function () { try { localStorage.removeItem('ps-cookies'); } catch (e) {} location.reload(); });
  });
})();
