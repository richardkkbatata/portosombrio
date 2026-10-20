/* =====================================================================
   NIGHTGETAWAY — tela do launcher no celular.

   IMPORTANTE (save do jogador): esta página NÃO usa localStorage, nem
   sessionStorage, nem nada que grave no navegador. Tudo o que ela mostra vem
   do aplicativo (window.PSLauncher) e quem guarda as coisas é o Android.
   O save do jogo fica no armazenamento do jogo e esta tela nunca encosta nele.
   ===================================================================== */
(function () {
  'use strict';

  var P = window.PSLauncher || null;     // ponte com o Android (não existe no teste do PC)
  var estado = {};
  var pedindoDados = false;              // mostrando a pergunta dos dados móveis

  function $(id) { return document.getElementById(id); }

  function ler() {
    try {
      if (P) return JSON.parse(P.estado());
      if (window.PS_ESTADO_TESTE) return JSON.parse(JSON.stringify(window.PS_ESTADO_TESTE));
    } catch (e) { }
    return {};
  }

  function mb(n) {
    n = +n || 0;
    if (n <= 0) return '';
    return (n / 1048576).toFixed(1).replace('.', ',') + ' MB';
  }

  /* ------------------------------------------------------------ desenhar */

  function desenhar() {
    var e = estado;
    var nova = e.nova || '', pronta = e.pronta || '', baixando = !!e.baixando;

    $('nome').textContent = e.jogo || 'Porto Sombrio';
    $('versao').textContent = e.versao || '—';
    $('versao-app').textContent = e.app || '—';
    $('estado-linha').textContent =
      e.rede === 'wifi' ? 'Wi-Fi' : e.rede === 'movel' ? 'dados móveis' : 'sem conexão';

    // versão disponível
    var temNova = !!(nova || pronta);
    $('linha-nova').hidden = !temNova;
    $('versao-nova').textContent = pronta || nova || '—';
    $('carimbo').hidden = !temNova;
    $('carimbo').textContent = pronta ? 'Baixada' : 'Versão nova';

    // novidades desta versão
    var notas = e.notas || [];
    var ul = $('notas');
    ul.textContent = '';
    for (var i = 0; i < notas.length; i++) {
      var li = document.createElement('li');
      li.textContent = notas[i];
      ul.appendChild(li);
    }
    $('bloco-notas').hidden = notas.length === 0;

    // barra de progresso
    $('progresso').hidden = !baixando;
    if (baixando) {
      var pct = Math.max(0, Math.min(100, +e.pct || 0));
      $('barra-cheia').style.width = pct + '%';
      $('barra-texto').textContent = 'Baixando a versão ' + (nova || pronta || '') + ' — ' + pct + '%';
    }

    // botões
    var bt = $('bt-atualizar');
    bt.hidden = baixando || !temNova;
    bt.textContent = pronta ? 'Usar a versão nova' : 'Atualizar';
    $('bt-jogar').disabled = false;

    avisos();
  }

  function avisos() {
    var e = estado, caixa = $('avisos');
    caixa.textContent = '';

    if (e.msg) caixa.appendChild(aviso(e.msg_titulo || 'Aviso', e.msg, e.msg_ruim));

    if (pedindoDados) {
      var a = aviso('Você não está no Wi-Fi',
        'Baixar agora vai gastar a sua internet de celular' +
        (e.tamanho ? ' (mais ou menos ' + mb(e.tamanho) + ')' : '') + '. Quer baixar assim mesmo?');
      var acoes = document.createElement('div');
      acoes.className = 'acoes';
      acoes.appendChild(botao('Baixar assim mesmo', 'bt vazio', function () {
        pedindoDados = false; baixar(true);
      }));
      acoes.appendChild(botao('Agora não', 'bt vazio', function () { pedindoDados = false; desenhar(); }));
      a.appendChild(acoes);
      caixa.appendChild(a);
      return;
    }

    if (e.rede === 'sem') {
      caixa.appendChild(aviso('Sem conexão',
        'Não deu para falar com a internet agora. Você pode jogar normalmente: ' +
        'o jogo está guardado no aparelho.'));
    } else if (e.pronta) {
      caixa.appendChild(aviso('Atualização baixada',
        'A versão ' + e.pronta + ' já está no aparelho. Toque em "Usar a versão nova" ' +
        'ou ela entra sozinha da próxima vez que você abrir.'));
    }
  }

  function aviso(titulo, texto, ruim) {
    var d = document.createElement('div');
    d.className = 'aviso' + (ruim ? ' ruim' : '');
    var b = document.createElement('b');
    b.textContent = titulo;
    d.appendChild(b);
    d.appendChild(document.createTextNode(texto));
    return d;
  }

  function botao(texto, classe, aoTocar) {
    var b = document.createElement('button');
    b.type = 'button';
    b.className = classe;
    b.textContent = texto;
    b.addEventListener('click', aoTocar);
    return b;
  }

  /* ------------------------------------------------------------- ações */

  function baixar(aceitaDados) {
    estado.baixando = true;
    estado.pct = 0;
    desenhar();
    if (P) P.atualizar(!!aceitaDados);
  }

  function aoAtualizar() {
    if (estado.pronta) { if (P) P.usarBaixada(); return; }
    if (estado.rede === 'movel') { pedindoDados = true; avisos(); return; }
    baixar(false);
  }

  /* o Android avisa quando algo muda (progresso, versão achada, erro) */
  window.psEvento = function (json) {
    try {
      var novo = typeof json === 'string' ? JSON.parse(json) : json;
      for (var k in novo) if (Object.prototype.hasOwnProperty.call(novo, k)) estado[k] = novo[k];
      if (estado.baixando) pedindoDados = false;
      desenhar();
    } catch (e) { }
  };

  /* --------------------------------------------------------- relógio */

  function relogio() {
    // hora de Brasília (UTC-3), igual ao site
    var d = new Date(Date.now() - 3 * 3600000);
    var p = function (n) { return (n < 10 ? '0' : '') + n; };
    $('relogio').textContent = p(d.getUTCHours()) + ':' + p(d.getUTCMinutes()) + ':' + p(d.getUTCSeconds());
  }

  /* ---------------------------------------------------------- começo */

  $('bt-jogar').addEventListener('click', function () {
    $('bt-jogar').disabled = true;
    if (P) P.jogar();
  });
  $('bt-atualizar').addEventListener('click', aoAtualizar);

  estado = ler();
  desenhar();
  relogio();
  setInterval(relogio, 1000);
  if (P) try { P.telaPronta(); } catch (e) { }
})();
