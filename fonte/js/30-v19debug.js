// ===================== 1.9 · MENU DE TESTE ORGANIZADO POR ASSUNTO =====================
// Tudo que é novo (1.9) e o que antes só existia na aba "Novidades" (1.4 a 1.7.1) agora
// aparece também na aba certa. '@x' = teleporte, '#x' = liga/desliga.
(function(){
  if(typeof dbgTab!=='function')return;
  const T=dbgTab;

  // ---------- Jogador ----------
  T('jog','Novo Jogo+ e nota (1.9)',[['jm:nota','Tela final com nota (dados falsos)'],['jm:ngp','Começar Novo Jogo+ agora'],['jm:tudo','Liberar tudo (Jogo+, Pesadelo, prêmios, roupas)'],
    ['jm:pes','Mudar esta partida para Pesadelo'],['jm:pf','Prêmio: faca infinita'],['jm:pl','Prêmio: lanterna infinita'],['jm:pm','Prêmio: munição infinita'],['jm:zera','Apagar Jogo+ e roupas']]);
  T('jog','Celular (1.7.1)',[['v16:hudEd','Editar controles do celular'],['v16:hudReset','Controles no lugar padrão'],['v16:run','Ligar/desligar corrida'],['v18:mira','Ligar/desligar mira assistida']]);

  // ---------- Itens e maleta ----------
  T('itens','Dinheiro, roupas e fita (1.8 e 1.9)',[['v18:grana','Ganhar R$ 5.000'],['v18:joia','Ganhar 3 joias'],['v18:loja','Abrir a loja do Mascate'],['v18:masc','Ir até o Mascate mais perto'],
    ['jm:roupa','Trocar as roupas de todos'],['v19d:fita','Ganhar 3 fitas de tinta (Pesadelo)']]);
  T('itens','Itens de missão (1.6)',[['v16:prova','Ganhar as 3 folhas da prova'],['v16:fone','Ganhar o fone do Matheus']]);

  // ---------- História ----------
  T('hist','Capítulos extras (1.9)',[['v19d:caps','Abrir a tela de Capítulos extras'],['v19s:start','Capítulo da Sonia · começar'],['v19r:start','Capítulo do Rese · começar']]);
  T('hist','Capítulo da Sonia · etapas (1.9)',[['v19s:sinal','Sinal na praça'],['v19s:esconder','O Balseiro aparece'],['v19s:garrafas','Garrafas no bar'],['v19s:avenida','Barricada da avenida'],
    ['v19s:predio','Correr pro prédio'],['v19s:cristo','A janela (Cristo Luz)'],['v19s:ferry','Ir pro terminal'],['v19s:fuga','No terminal'],['v19s:fim','Final']]);
  T('hist','Capítulo do Rese · etapas (1.9)',[['v19r:igreja','Sino da Matriz'],['v19r:rua','Rua até o mercado'],['v19r:feira','Feirantes'],['v19r:barricar','Barricar as portas'],
    ['v19r:radio','Rádio e extintor'],['v19r:defesa','Defesa do mercado'],['v19r:chefe','O Fiscal'],['v19r:fim','Final (chega o Richard)']]);
  T('hist','Universidade de BC · missão (1.5)',[['v15:uniWave','Começar a defesa da biblioteca'],['v15:uniDone','Terminar a missão da Universidade de BC']]);
  T('hist','Galeria pluvial · puzzles (1.4)',[['v14:fuses','Ganhar os três fusíveis'],['v14:pump','Ligar a bomba'],['v14:exit','Sair nas Laranjeiras']]);
  T('hist','Flashback do Matheus (1.6)',[['v16:flash','Começar o flashback'],['v16:flashEnd','Terminar o flashback']]);

  // ---------- Missões ----------
  T('hist','Missões secundárias (1.9)',[['v19m:list','Ver a lista de missões'],['v19m:all','Começar todas'],['v19m:done','Completar todas'],['v19m:reset','Zerar missões']]);

  // ---------- Chefes e lutas ----------
  T('lutas','Chefes dos capítulos (1.9)',[['v19s:bal','O Balseiro (Sonia) aqui perto'],['v19r:chefe','O Fiscal do Mercado (Rese)']]);

  // ---------- Personagens ----------
  T('pers','Sonia e Prof. Rese (1.9)',[['v19s:start','Jogar como a Sonia'],['v19r:start','Jogar como o Prof. Rese'],['jm:roupa','Trocar as roupas de todos'],['v19d:roupas','Abrir a tela de Roupas']]);
  T('pers','Mascate e conta (1.8)',[['v18:masc','Ir até o Mascate'],['v18:loja','Abrir a loja'],['v16:conta','Editar conta']]);

  // ---------- Lugares ----------
  T('lug','Capítulos extras (1.9)',[['v19s:start','Navegantes (Capítulo da Sonia)'],['v19r:start','Mercado Público, 22h31 (Capítulo do Rese)']]);
  T('lug','Lugares da 1.6',[['@foyerIn','Foyer (formatura)'],['@binoculo','Binóculo do mirante (Brava)'],['@barco','Barco encalhado (Brava)']]);

  // ---------- Medo ----------
  T('medo','Sustos e eventos novos (1.9)',[['v19e:pisca','Luzes piscando'],['v19e:telefone','Telefone tocando'],['v19e:amarrado','Zumbi amarrado'],['v19e:fita','Fita da câmera'],['v19e:cinza','Chuva de cinza']]);

  // ---------- Mundo ----------
  T('mundo','Eventos aleatórios (1.9)',[['v19e:caixa','Caixa de suprimentos'],['v19e:radio','Transmissão da Rádio Maré'],['v19e:musica','Caixa de som ligada'],['v19e:saqueador','Saqueador']]);
  T('mundo','Cristo Luz e rádio (1.5)',[['v15:cristo','Acender o Cristo Luz']]);

  // ---------- Final ----------
  T('fim','Nota e Novo Jogo+ (1.9)',[['jm:nota','Tela final com nota (dados falsos)'],['jm:ngp','Começar Novo Jogo+'],['v19d:epi','Ver o epílogo do Novo Jogo+']]);

  // ---------- Multiplayer (fica na aba Novidades, junto da 1.8) ----------
  // ações próprias desta organização
  const fn=function(k){
    switch(k){
      case 'v19d:fita':{const l=invAdd('fita',3);if(l&&typeof boxAdd==='function')boxAdd('fita',l);this.close();return toast('3 fitas de tinta na maleta.');}
      case 'v19d:caps':return UI.caps?UI.caps():toast('Capítulos extras indisponíveis.');
      case 'v19d:roupas':return UI.roupas?UI.roupas('debug'):toast('Tela de Roupas indisponível.');
      case 'v19d:epi':{this.close();if(typeof UI.jmEpi==='function')return UI.jmEpi();return toast('Epílogo indisponível.');}
    }
  };
  for(const k of ['v19d:fita','v19d:caps','v19d:roupas','v19d:epi'])DBG_EXTRA_FN[k]=fn;
})();
