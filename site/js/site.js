/* Porto Sombrio · arquivo PS-0417 — comportamento comum a todas as páginas.
   Sem bibliotecas. Tudo aqui é opcional: sem JavaScript o site continua legível. */
(function () {
  'use strict';
  var doc = document, raiz = doc.documentElement;
  var reduz = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var guarda = {
    ler: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    por: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} },
    lerS: function (k) { try { return sessionStorage.getItem(k); } catch (e) { return null; } },
    porS: function (k, v) { try { sessionStorage.setItem(k, v); } catch (e) {} }
  };

  /* ------------------------------------------------------------------
     SOM (desligado por padrão). Tudo sintetizado, nenhum arquivo de áudio.
     ------------------------------------------------------------------ */
  var Som = {
    ligado: guarda.ler('ps-som') === '1', ctx: null,
    abre: function () {
      if (!this.ligado) return null;
      if (!this.ctx) { var A = window.AudioContext || window.webkitAudioContext; if (!A) return null; this.ctx = new A(); }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    ruido: function (dur, vol, freq) {
      var c = this.abre(); if (!c) return;
      var n = Math.floor(c.sampleRate * dur), b = c.createBuffer(1, n, c.sampleRate), d = b.getChannelData(0);
      for (var i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
      var s = c.createBufferSource(); s.buffer = b;
      var f = c.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = freq || 1800; f.Q.value = .8;
      var g = c.createGain(); g.gain.value = vol || .12;
      s.connect(f); f.connect(g); g.connect(c.destination); s.start();
    },
    tecla: function () { this.ruido(.035, .22, 2600 + Math.random() * 900); },
    carimbo: function () {
      var c = this.abre(); if (!c) return;
      var o = c.createOscillator(), g = c.createGain(), t = c.currentTime;
      o.type = 'sine'; o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(48, t + .14);
      g.gain.setValueAtTime(.5, t); g.gain.exponentialRampToValueAtTime(.001, t + .18);
      o.connect(g); g.connect(c.destination); o.start(t); o.stop(t + .2); this.ruido(.06, .25, 900);
    },
    chiado: function () { this.ruido(.32, .07, 3200); }
  };
  window.PS_SOM = Som;
  var bs = doc.getElementById('botao-som');
  function rotuloSom() { if (!bs) return; bs.setAttribute('aria-pressed', Som.ligado ? 'true' : 'false'); bs.textContent = Som.ligado ? 'Som: ligado' : 'Som: desligado'; }
  if (bs) {
    rotuloSom();
    bs.addEventListener('click', function () { Som.ligado = !Som.ligado; guarda.por('ps-som', Som.ligado ? '1' : '0'); rotuloSom(); Som.tecla(); });
  }

  /* ------------------------------------------------------------------
     CORTE DE SINAL ao entrar e ao sair da página
     ------------------------------------------------------------------ */
  var sinal = doc.getElementById('sinal');
  var cv = sinal && sinal.querySelector('canvas'), cx = cv && cv.getContext && cv.getContext('2d'), animando = 0;
  function estatica() {
    if (!cx) return;
    var img = cx.createImageData(cv.width, cv.height), d = img.data;
    for (var i = 0; i < d.length; i += 4) { var v = Math.random() * 255 | 0; d[i] = v * .55; d[i + 1] = v; d[i + 2] = v * .62; d[i + 3] = 255; }
    cx.putImageData(img, 0, 0);
  }
  function rodaEstatica(ms) {
    var fim = Date.now() + ms; cancelAnimationFrame(animando);
    (function q() { estatica(); if (Date.now() < fim) animando = requestAnimationFrame(q); })();
  }
  function entra() {
    if (!sinal) return;
    if (reduz) { sinal.classList.remove('on'); return; }
    rodaEstatica(220);
    setTimeout(function () { sinal.classList.add('saindo'); sinal.classList.remove('on'); }, 120);
    setTimeout(function () { sinal.classList.remove('saindo'); }, 560);
  }
  entra();
  window.addEventListener('pageshow', function (e) { if (e.persisted && sinal) { sinal.classList.remove('on', 'saindo'); } });
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== '_self') return;
    var url; try { url = new URL(a.href, location.href); } catch (er) { return; }
    if (url.origin !== location.origin || a.hasAttribute('download')) return;
    if (url.pathname === location.pathname && url.hash) return;
    if (/\.(zip|exe|pdf|txt|xml|json)$/i.test(url.pathname)) return;
    if (reduz || !sinal) return;
    e.preventDefault();
    Som.chiado();
    sinal.classList.remove('saindo'); sinal.classList.add('on'); rodaEstatica(400);
    setTimeout(function () { location.href = url.href; }, 170);
  });

  /* ------------------------------------------------------------------
     RELÓGIO DA CÂMERA (hora de Brasília)
     ------------------------------------------------------------------ */
  var rel = doc.getElementById('relogio');
  var DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
  function dd(n) { return (n < 10 ? '0' : '') + n; }
  function horaBR() {
    // hora oficial de Brasília (UTC-3, sem horário de verão)
    var d = new Date(Date.now() - 3 * 3600 * 1000);
    return DIAS[d.getUTCDay()] + ' ' + dd(d.getUTCHours()) + ':' + dd(d.getUTCMinutes()) + ':' + dd(d.getUTCSeconds());
  }
  function tique() { if (rel) rel.textContent = horaBR(); }
  tique(); setInterval(tique, 1000);

  /* ------------------------------------------------------------------
     SPOILERS: tarja preta (clica para ler) e portão geral
     ------------------------------------------------------------------ */
  function abreTarja(el) { if (el.classList.contains('aberta')) return; el.classList.add('aberta'); el.removeAttribute('tabindex'); el.removeAttribute('role'); el.removeAttribute('aria-label'); Som.tecla(); }
  doc.querySelectorAll('.tarja').forEach(function (el) {
    el.setAttribute('role', 'button'); el.setAttribute('tabindex', '0');
    el.setAttribute('aria-label', 'Spoiler escondido. Ative para ler.');
    el.addEventListener('click', function () { abreTarja(el); });
    el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); abreTarja(el); } });
  });
  doc.querySelectorAll('[data-revelar-tudo]').forEach(function (b) {
    b.addEventListener('click', function () {
      var alvo = doc.querySelector(b.getAttribute('data-revelar-tudo')) || doc;
      alvo.querySelectorAll('.tarja').forEach(abreTarja); Som.carimbo();
    });
  });

  // página Baixar: marca a caixa do aparelho de quem está vendo
  (function () {
    var ua = navigator.userAgent || '', so = /android/i.test(ua) ? 'android'
      : (/iphone|ipad|ipod/i.test(ua) || (/macintosh/i.test(ua) && navigator.maxTouchPoints > 1)) ? 'ios'
      : /windows/i.test(ua) ? 'windows' : '';
    var c = so && doc.querySelector('.caixa[data-so="' + so + '"]');
    if (!c) return;
    c.classList.add('sua');
    var s = doc.createElement('span'); s.className = 'carimbo seu'; s.textContent = 'Seu aparelho'; c.appendChild(s);
  })();

  // fichas lacradas (personagens e bestiário): cada uma abre separada
  function abreLacre(card, sem) {
    if (!card.classList.contains('lacrado')) return;
    card.classList.remove('lacrado');
    var c = card.querySelector('.capa-lacre'); if (c) c.remove();
    if (!sem) Som.carimbo();
  }
  doc.querySelectorAll('[data-spoiler]').forEach(function (card) {
    card.classList.add('lacrado');
    var b = doc.createElement('button');
    b.type = 'button'; b.className = 'capa-lacre';
    b.innerHTML = '<span class="carimbo pequeno">Lacrado</span><span>contém spoiler</span><span class="mao">toque para abrir</span>';
    b.setAttribute('aria-label', 'Ficha lacrada com spoiler. Ative para abrir.');
    b.addEventListener('click', function () { abreLacre(card); });
    card.appendChild(b);
  });
  doc.querySelectorAll('[data-abrir-lacres]').forEach(function (b) {
    b.addEventListener('click', function () {
      var alvo = doc.querySelector(b.getAttribute('data-abrir-lacres')) || doc;
      alvo.querySelectorAll('.lacrado').forEach(function (c) { abreLacre(c, true); }); Som.carimbo();
    });
  });

  // portão de spoiler (documentário): nada aparece até a pessoa pedir
  doc.querySelectorAll('[data-portao]').forEach(function (b) {
    var alvo = doc.querySelector(b.getAttribute('data-portao')), lacre = b.closest('.lacre');
    function abre(sem) {
      if (alvo) alvo.classList.remove('escondido');
      if (lacre) lacre.classList.add('escondido');
      if (!sem) { Som.carimbo(); guarda.porS('ps-portao', '1'); if (alvo) { var h = alvo.querySelector('h2,h3'); alvo.setAttribute('tabindex', '-1'); alvo.focus({ preventScroll: true }); alvo.scrollIntoView({ behavior: reduz ? 'auto' : 'smooth', block: 'start' }); } }
      observaRevela();
    }
    b.addEventListener('click', function () { abre(false); });
    if (guarda.lerS('ps-portao') === '1') abre(true);
  });

  // capítulos que abrem um por um
  doc.querySelectorAll('[data-abrir]').forEach(function (b) {
    var alvo = doc.getElementById(b.getAttribute('data-abrir'));
    if (!alvo) return;
    b.setAttribute('aria-controls', alvo.id); b.setAttribute('aria-expanded', 'false');
    b.addEventListener('click', function () {
      var abrir = alvo.hidden;
      alvo.hidden = !abrir; b.setAttribute('aria-expanded', abrir ? 'true' : 'false');
      b.textContent = abrir ? 'Fechar capítulo' : b.getAttribute('data-rotulo') || 'Abrir capítulo';
      if (abrir) {
        Som.carimbo();
        var c = alvo.querySelector('.carimbo.solto'); if (c) { c.classList.remove('batendo'); void c.offsetWidth; c.classList.add('batendo'); }
      }
    });
    b.setAttribute('data-rotulo', b.textContent);
  });

  /* ------------------------------------------------------------------
     ENTRADA AO ROLAR
     ------------------------------------------------------------------ */
  var io = 'IntersectionObserver' in window ? new IntersectionObserver(function (en) {
    en.forEach(function (x) { if (x.isIntersecting) { x.target.classList.add('visto'); io.unobserve(x.target); } });
  }, { rootMargin: '0px 0px -8% 0px' }) : null;
  function observaRevela() {
    doc.querySelectorAll('.revela:not(.visto)').forEach(function (el) { if (io && !reduz) io.observe(el); else el.classList.add('visto'); });
  }
  observaRevela();

  /* ------------------------------------------------------------------
     VERSÃO E NOVIDADES (lidas de /dados/updates.json)
     ------------------------------------------------------------------ */
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function dataBR(d) { if (!d) return ''; var p = String(d).split('-'); return p.length === 3 ? p[2] + '/' + p[1] + '/' + p[0] : esc(d); }
  var querDados = doc.querySelector('[data-novidades],[data-registro],[data-versao]');
  if (querDados && window.fetch) {
    fetch('/dados/updates.json', { cache: 'no-cache' }).then(function (r) { return r.json(); }).then(function (u) {
      var vs = u.versoes || [], atual = u.versao_atual || (vs[0] && vs[0].versao);
      doc.querySelectorAll('[data-versao]').forEach(function (el) { el.textContent = atual; });
      doc.querySelectorAll('[data-novidades]').forEach(function (el) {
        var n = +el.getAttribute('data-novidades') || 3;
        el.innerHTML = vs.slice(0, n).map(function (v) {
          return '<article><time>' + (v.data ? dataBR(v.data) + ' · ' : '') + 'versão ' + esc(v.versao) + '</time><h3>' + esc(v.titulo) + '</h3><p style="margin:0">' + esc(v.resumo) + '</p></article>';
        }).join('');
      });
      doc.querySelectorAll('[data-registro]').forEach(function (el) {
        el.innerHTML = vs.map(function (v, i) {
          return '<article class="revela">' + (i === 0 ? '<span class="carimbo pequeno verde atual">Em uso</span>' : '') +
            '<div class="v">' + esc(v.versao) + (v.data ? '<small>' + dataBR(v.data) + '</small>' : '') + '</div>' +
            '<div><h2>' + esc(v.titulo) + '</h2><p>' + esc(v.resumo) + '</p><ul>' + (v.mudancas || []).map(function (m) { return '<li>' + esc(m) + '</li>'; }).join('') + '</ul></div></article>';
        }).join('');
        observaRevela();
      });
    }).catch(function () {});
  }

  /* ------------------------------------------------------------------
     CONTATO: e-mail montado aqui (robôs de spam não leem fácil)
     ------------------------------------------------------------------ */
  doc.querySelectorAll('[data-email]').forEach(function (el) {
    var C = window.PS_CONFIG || {}, em = C.EMAIL || '';
    if (!em || /SEUDOMINIO/i.test(em)) { el.textContent = 'e-mail ainda não configurado'; return; }
    el.textContent = em; el.setAttribute('href', 'mailto:' + em + '?subject=' + encodeURIComponent('Porto Sombrio'));
  });

  /* ------------------------------------------------------------------
     EASTER EGGS
     ------------------------------------------------------------------ */
  function bilhete(html, ms) {
    var v = doc.querySelector('.bilhete'); if (v) v.remove();
    var b = doc.createElement('div'); b.className = 'bilhete'; b.setAttribute('role', 'status');
    b.innerHTML = '<button class="fechar" type="button" aria-label="Fechar">×</button>' + html;
    doc.body.appendChild(b); Som.carimbo();
    b.querySelector('.fechar').addEventListener('click', function () { b.remove(); });
    setTimeout(function () { if (b.parentNode) b.remove(); }, ms || 12000);
  }
  window.PS_BILHETE = bilhete;

  // digitar 4072 em qualquer lugar: o cofre do Banco Popular
  var buf = '', konami = [38, 38, 40, 40, 37, 39, 37, 39, 66, 65], kpos = 0;
  doc.addEventListener('keydown', function (e) {
    var t = e.target; if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
    if (/^[0-9]$/.test(e.key)) { buf = (buf + e.key).slice(-4); Som.tecla(); if (buf === '4072') { buf = ''; bilhete('<p class="datilo-titulo">Banco Popular · Terceira Avenida</p><p>O cofre abriu com um estalo. Dentro: um revólver Magnum, munição .357 e um bilhete do Valdir.</p><p class="mao">"Eu sei, eu sei. Não era pra anotar."</p>'); } }
    kpos = (e.keyCode === konami[kpos]) ? kpos + 1 : (e.keyCode === konami[0] ? 1 : 0);
    if (kpos === konami.length) { kpos = 0; mingau(); }
  });
  function mingau() {
    var g = doc.createElement('img'); g.className = 'mingau'; g.alt = '';
    g.src = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 60"><path d="M10 40c0-12 14-20 32-20 10 0 18 2 24 6l8-10 3 12c4 3 6 8 6 12 0 8-8 12-20 12H22C14 52 10 47 10 40z" fill="#e0a860"/><path d="M14 36c-8-2-12-10-9-16" stroke="#e0a860" stroke-width="5" fill="none" stroke-linecap="round"/><circle cx="70" cy="34" r="2" fill="#222"/><circle cx="78" cy="34" r="2" fill="#222"/><path d="M30 26l4 10M40 24l2 12M50 24l0 12" stroke="#b97a3a" stroke-width="3"/><path d="M22 52v6M34 52v6M58 52v6M68 52v6" stroke="#e0a860" stroke-width="5" stroke-linecap="round"/></svg>');
    doc.body.appendChild(g); setTimeout(function () { g.remove(); }, 9500);
    bilhete('<p class="datilo-titulo">Praça Tamandaré · coreto</p><p>Um gato laranja muito irritado passou correndo.</p><p class="mao">É o Mingau da Dona Cida. Ele arranha.</p>', 8000);
  }

  // rádio do rodapé: sintonize no canal sete
  var dial = doc.getElementById('dial'), dOut = doc.getElementById('dial-out'), dMsg = doc.getElementById('dial-msg');
  var CANAIS = {
    1: 'só chiado.', 2: '"...Águia Seis... pouso em trinta..." (some)', 3: 'uma música tocando baixinho. Caixinha de música?',
    4: 'alguém respirando devagar do outro lado.', 5: '"...Maré Limpa... zero cinco e quarenta..."',
    6: 'um orelhão tocando, tocando, tocando.', 7: '"Alguém... alguém no canal sete? Por favor..."',
    8: 'chiado. E, no meio, alguém diz "Richard".', 9: 'nada. Silêncio demais.', 10: '"Tô do outro lado do rio, em Navegantes. Dá pra ver o porto daqui."',
    11: 'um sino de igreja, longe.', 12: '"...civis: negativo. Repito: civis, negativo."'
  };
  if (dial && dOut && dMsg) {
    var dt = 0;
    dial.addEventListener('input', function () {
      var c = +dial.value; dOut.textContent = 'canal ' + c; dMsg.textContent = ''; Som.chiado();
      clearTimeout(dt); dt = setTimeout(function () { dMsg.textContent = CANAIS[c] || ''; }, 380);
    });
  }

  // 404: televisão sem sinal
  var tv = doc.querySelector('#tv404 canvas');
  if (tv && tv.getContext) {
    var tx = tv.getContext('2d');
    (function chuvisco() {
      var im = tx.createImageData(tv.width, tv.height), d = im.data;
      for (var i = 0; i < d.length; i += 4) { var v = Math.random() * 255 | 0; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
      tx.putImageData(im, 0, 0); if (!reduz) setTimeout(function () { requestAnimationFrame(chuvisco); }, 60);
    })();
  }

  // para quem abre o console
  try {
    console.log('%cSE VOCÊ ESTÁ LENDO ISSO, PRESTA ATENÇÃO.', 'font:700 16px monospace;color:#a8231b');
    console.log('As coisas sem pele não enxergam. Ouvem tudo. Se correr, elas vêm.\nPorto Sombrio, feito por richardkkbatata (https://github.com/richardkkbatata) e caf3ziin (https://github.com/caf3ziin)');
  } catch (e) {}
})();
