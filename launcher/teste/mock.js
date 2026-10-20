/* =====================================================================
   NEUTRALINO DE MENTIRA — só para testar a tela do launcher no navegador.
   NÃO entra no pacote do launcher (fica fora de launcher/resources/).
   Guarda um "disco" de mentira no localStorage, para sobreviver quando a
   página troca (launcher -> jogo.html).
   ===================================================================== */
(function () {
  'use strict';
  var CHAVE = 'ng-fs';

  function disco() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || '{}'); } catch (e) { return {}; }
  }
  function salvar(d) { localStorage.setItem(CHAVE, JSON.stringify(d)); }

  if (!localStorage.getItem(CHAVE)) salvar(window.NG_FS_SEED || {});

  function naoTem(p) { var e = new Error('NE_FS_FILRDER: ' + p); e.code = 'NE_FS_FILRDER'; return e; }

  window.Neutralino = {
    init: function () { },
    os: { getEnv: async function () { return 'C:\\Users\\Richard\\AppData\\Local'; } },
    window: { setTitle: async function () { }, setFullScreen: async function () { } },
    filesystem: {
      createDirectory: async function (p) { var d = disco(); d['dir:' + p] = 1; salvar(d); },
      readFile: async function (p) { var d = disco(); if (!(p in d)) throw naoTem(p); return d[p]; },
      writeFile: async function (p, txt) { var d = disco(); d[p] = String(txt); salvar(d); },
      remove: async function (p) { var d = disco(); if (!(p in d)) throw naoTem(p); delete d[p]; salvar(d); },
      move: async function (a, b) {
        var d = disco(); if (!(a in d)) throw naoTem(a);
        d[b] = d[a]; delete d[a]; salvar(d);
      },
      getStats: async function (p) { var d = disco(); if (!(p in d)) throw naoTem(p); return { size: d[p].length }; },
    },
  };
  window.NG_DEV = { catalogo: window.NG_CAT || 'http://127.0.0.1:8792/catalogo.json' };
  window.NG_VER_DISCO = function () { return disco(); };
})();
