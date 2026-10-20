/* =====================================================================
   NEUTRALINO DE MENTIRA — só para testar a tela do launcher no navegador.
   NÃO entra no pacote do launcher (fica fora de launcher/resources/).
   Guarda um "disco" de mentira no localStorage e anota os programas que o
   launcher mandou abrir (para o teste conferir o caminho exato).
   ===================================================================== */
(function () {
  'use strict';
  var CHAVE = 'ng-fs';
  var EXEC = 'ng-exec';

  function disco() {
    try { return JSON.parse(localStorage.getItem(CHAVE) || '{}'); } catch (e) { return {}; }
  }
  function salvar(d) { localStorage.setItem(CHAVE, JSON.stringify(d)); }

  if (!localStorage.getItem(CHAVE)) salvar(window.NG_FS_SEED || {});
  if (!localStorage.getItem(EXEC)) localStorage.setItem(EXEC, '[]');

  function naoTem(p) { var e = new Error('NE_FS_FILRDER: ' + p); e.code = 'NE_FS_FILRDER'; return e; }

  function texto(ab) {                 // guarda binário como texto (arquivos de teste são pequenos)
    var u = new Uint8Array(ab), s = '';
    for (var i = 0; i < u.length; i++) s += String.fromCharCode(u[i]);
    return s;
  }
  function bytes(s) {
    var u = new Uint8Array(s.length);
    for (var i = 0; i < s.length; i++) u[i] = s.charCodeAt(i) & 0xff;
    return u.buffer;
  }

  window.NL_PATH = 'C:\\Program Files\\NightGetaway';

  window.Neutralino = {
    init: function () { },
    os: {
      getEnv: async function () { return 'C:\\Users\\Richard\\AppData\\Local'; },
      execCommand: async function (cmd, opts) {
        var l = JSON.parse(localStorage.getItem(EXEC) || '[]');
        l.push({ cmd: cmd, background: !!(opts && opts.background) });
        localStorage.setItem(EXEC, JSON.stringify(l));
        if (window.NG_EXEC_FALHA) throw new Error('NE_OS_UNLTOUP: nao deu');
        return { exitCode: 0, stdOut: '', stdErr: '' };
      },
    },
    window: { setTitle: async function () { } },
    filesystem: {
      createDirectory: async function (p) { var d = disco(); d['dir:' + p] = 1; salvar(d); },
      readFile: async function (p) { var d = disco(); if (!(p in d)) throw naoTem(p); return d[p]; },
      writeFile: async function (p, txt) { var d = disco(); d[p] = String(txt); salvar(d); },
      readBinaryFile: async function (p) { var d = disco(); if (!(p in d)) throw naoTem(p); return bytes(d[p]); },
      writeBinaryFile: async function (p, ab) { var d = disco(); d[p] = texto(ab); salvar(d); },
      copy: async function (a, b) { var d = disco(); if (!(a in d)) throw naoTem(a); d[b] = d[a]; salvar(d); },
      remove: async function (p) { var d = disco(); if (!(p in d)) throw naoTem(p); delete d[p]; salvar(d); },
      move: async function (a, b) {
        var d = disco(); if (!(a in d)) throw naoTem(a);
        d[b] = d[a]; delete d[a]; salvar(d);
      },
      getStats: async function (p) { var d = disco(); if (!(p in d)) throw naoTem(p); return { size: d[p].length }; },
    },
  };
  window.NG_DEV = {
    catalogo: window.NG_CAT || 'http://127.0.0.1:8792/catalogo.json',
    pasta_app: window.NL_PATH,
  };
  window.NG_VER_DISCO = function () { return disco(); };
  window.NG_VER_EXEC = function () { return JSON.parse(localStorage.getItem(EXEC) || '[]'); };
})();
