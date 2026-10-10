// ===================== MENU DE TESTE ORGANIZADO (1.5) =====================
// Abas por assunto. Cada versão nova acrescenta os botões dela na aba certa e na aba "Novidades".
const DBG_TABS=[['nov','Novidades'],['jog','Jogador'],['itens','Itens e maleta'],['hist','História'],['lutas','Chefes e lutas'],['pers','Personagens'],['lug','Lugares'],['inim','Inimigos'],['medo','Medo e eventos'],['mundo','Mundo'],['fim','Final']];
UI.debug=function(){
  if(!DBG_OK){this.code='';return this.keypad('dbg');}
  if(G.mode==='play')G.mode='menu';
  const tab=this.dtab||'nov';
  const tg=(k,l)=>`<button class="dbgt${DBG[k]?' on':''}" data-a="dbg" data-k="t:${k}" aria-pressed="${!!DBG[k]}">${l}<span>${DBG[k]?'ligado':'desligado'}</span></button>`;
  const bt=(k,l)=>`<button class="dbgb" data-a="dbg" data-k="${k}">${l}</button>`;
  const sec=(t,html)=>`<section><h3>${t}</h3><div class="dbg-list">${html}</div></section>`;
  const tp=(k,l)=>LM[k]||k==='start'?bt('tp:'+k,l):'';
  let body='';
  switch(tab){
    case 'nov':body=
      sec('1.8 · Mascate e dinheiro',bt('v18:grana','Ganhar R$ 5.000')+bt('v18:joia','Ganhar 3 joias')+bt('v18:loja','Abrir a loja do Mascate')+bt('v18:masc','Ir até o Mascate mais perto'))+
      sec('1.8 · Horda e multiplayer',bt('v18:horda','Começar a Horda sozinho')+bt('v18:onda','Pular onda (Horda/Noite Zero)')+bt('v18:chefe','Ir pra próxima onda de chefão (Horda)')+bt('v18:cair','Cair (multiplayer)')+bt('v18:levantar','Levantar (multiplayer)')+bt('v18:frase','Mandar frase "Socorro!"')+bt('v18:rank','Ver o ranking da Horda')+bt('v18:mira','Ligar/desligar mira assistida'))+
      sec('1.7.1 · Celular e Noite Zero',bt('v16:hudEd','Editar controles do celular')+bt('v16:hudReset','Controles no lugar padrão')+bt('v16:run','Ligar/desligar corrida (celular)')+bt('v16:mpSolo','Testar a Noite Zero sozinho')+bt('v16:mpNext','Pular etapa da Noite Zero')+bt('v16:mpWave','Chamar horda (Noite Zero)')+bt('v16:mpBoss','Chamar chefão (Noite Zero)'))+
      sec('1.8.2 · Servidor no Brasil',bt('v17:srv','Testar servidores (Cloudflare e Render)')+bt('v16:mp','Abrir o multiplayer'))+
      sec('1.6 · Clima',bt('v16:wx:chuva','Chuva')+bt('v16:wx:tempestade','Tempestade')+bt('v16:wx:neblina','Neblina')+bt('v16:wx:apagao','Apagão geral')+bt('v16:wx:off','Tempo limpo'))+
      sec('1.6 · Flashback e missões',bt('v16:flash','Começar o flashback do Matheus')+bt('v16:flashEnd','Terminar o flashback')+bt('v16:prova','Ganhar as 3 folhas da prova')+bt('v16:fone','Ganhar o fone do Matheus')+tp('sala102','Sala 102 (entregar a prova)')+tp('foyerIn','Foyer (formatura)')+tp('binoculo','Binóculo do mirante (Brava)')+tp('barco','Barco encalhado (Brava)'))+
      sec('1.6 · Multiplayer beta',bt('v16:mp','Abrir o multiplayer')+bt('v16:mpSolo','Testar a Noite Zero sozinho')+bt('v16:mpNext','Pular etapa da Noite Zero')+bt('v16:conta','Editar conta'))+
      sec('1.5.1',bt('v151:org','Organizar a maleta')+bt('v15:combo:desarme','Quick time difícil do Brandt')+bt('v14:maleta','Maleta grande')+bt('j:galeria2','Galeria · comportas (testar a escada)')+bt('v14:drain','Resolver as comportas'))+
      sec('Brandt (1.5)',bt('v14:brandtNow','Começar a luta agora')+bt('v15:combo:faca','Quick time · faca')+bt('v15:combo:desarme','Quick time · desarme')+bt('v15:combo:parede','Quick time · parede')+bt('v15:combo:judo','Quick time · judô')+bt('v14:brandtLow','Deixar com pouca vida')+bt('v14:brandtWin','Vencer o Brandt'))+
      sec('Universidade de BC e BR-101 (1.5)',bt('j:univali','Pular · chegando pelo túnel')+bt('j:uniBib','Pular · porta da biblioteca (com a chave)')+bt('v15:uniWave','Começar a defesa da biblioteca')+bt('v15:uniDone','Terminar a missão da Universidade de BC')+tp('tunel','Túnel em Balneário')+tp('caculinha','Caçulinha do Marlon')+tp('neusa','Cantina da Dona Neusa')+tp('sala102','Sala 102 (prova do Rese)'))+
      sec('Eventos novos (1.5)',bt('v15:pinned','Alguém preso embaixo de carro')+bt('v15:drag','Alguém arrastado pro escuro')+bt('v15:fall','Alguém caindo do prédio')+bt('v15:zoeira','Zoeira com o Matheus')+bt('v15:nico','Nicolas no rádio')+bt('v15:roda','Pessoa presa na roda-gigante')+bt('v15:cristo','Acender o Cristo Luz')+tp('surfCamp','Acampamento dos surfistas (Brava)'))+
      sec('Galeria (1.4)',bt('j:galeria','Pular · entrada')+bt('v14:fuses','Ganhar os três fusíveis')+bt('v14:pump','Ligar a bomba')+bt('j:galeria2','Pular · sala das comportas')+bt('v14:drain','Resolver as comportas')+bt('v14:exit','Sair nas Laranjeiras'));break;
    case 'jog':body=sec('Jogador',tg('god','Invencível')+tg('ammo','Munição infinita')+tg('noclip','Atravessar paredes')+`<button class="dbgt" data-a="dbg" data-k="speed">Velocidade<span>${DBG.speed}x</span></button>`+bt('heal','Curar tudo')+bt('bat','Carregar lanterna')+bt('v14:qte','Testar quick time')+bt('v15:combo:desarme','Testar quick time difícil (Brandt)')+bt('qte','Testar esforço (barra)'));break;
    case 'itens':body=sec('Itens',bt('weapons','Todas as armas')+bt('keys','Todas as chaves e itens-chave')+bt('ammokit','Kit de munição')+bt('healkit','Kit de cura')+bt('throws','Rojões e sinalizadores')+bt('v15:keys15','Chaves novas (Universidade de BC, manobra, pasta)'))+
      sec('Documentos',bt('files','Todos os arquivos')+bt('photos','Todas as fotos'))+
      sec('Maleta',bt('v151:org','Organizar a maleta')+bt('slots','Aumentar a maleta')+bt('v14:maleta','Maleta no tamanho máximo')+bt('v14:maletaMin','Maleta no tamanho inicial'));break;
    case 'hist':body=
      sec('Capítulo 1 · Balneário',bt('j:posto','Posto (bateria)')+bt('j:caos','Jipe pronto, Edu, caos')+bt('j:brandt','Shopping, antes do Brandt')+bt('j:galeria','Galeria, entrada')+bt('j:galeria2','Galeria, comportas')+bt('j:laranj','Laranjeiras')+bt('j:ivo','Seu Ivo vivo (colônia)'))+
      sec('Capítulo 2 · Brava e a volta',bt('j:brava','Chegada na Brava')+bt('j:gerador','Diesel na mão')+bt('j:bc2','Balneário em silêncio')+bt('j:univali','Universidade de BC (túnel)')+bt('j:uniBib','Universidade de BC (biblioteca)')+bt('j:shop','Armadilha do shopping')+bt('j:cida','Prédio da Dona Cida'))+
      sec('Capítulo 3 · Itajaí',bt('j:itajai','Itajaí')+bt('j:hosp','Santa Clara')+bt('j:hospIn','Santa Clara · porta tranca')+bt('j:hospSaida','Santa Clara · saída com alicate')+bt('j:porto','Porto')+bt('j:navio','Navio no cais')+bt('j:final','Batalha final com os três'));break;
    case 'lutas':body=
      sec('Sargento Brandt',bt('j:brandt','Pular · shopping')+bt('v14:brandtNow','Começar a luta')+bt('v15:combo:faca','Quick time · faca')+bt('v15:combo:desarme','Quick time · desarme')+bt('v15:combo:parede','Quick time · parede')+bt('v15:combo:judo','Quick time · judô')+bt('v14:brandtLow','Pouca vida')+bt('v14:brandtWin','Vencer')+bt('v14:smoke','Granada de fumaça aqui'))+
      sec('T-11, o Coletor',bt('v14:chase','Soltar aqui (fuga)')+bt('v14:chaseStop','Parar a fuga')+bt('v14:drain','Começar a fuga do jeito certo'))+
      sec('Outros chefes',bt('j:shop','Espécime (shopping)')+bt('v14:pesc','Pescador (litoral de Itajaí)')+bt('pers','Chamar o Perseguidor')+bt('ouvHere','Chamar a cega até você')+tg('ouv','Ver faro e escuta da cega')+bt('j:final','Abominação (final)')+bt('allyNow','Chamar os três (na batalha)'));break;
    case 'pers':body=sec('Amigos',bt('j:uniBib','Marlon e Matheus · Universidade de BC')+bt('j:marlon','Marlon · Edifício Yacht')+bt('j:nico','Nicolas · surf shop')+bt('j:alex','Prof. Alex Rese · Mercado Público')+bt('v15:zoeira','Zoeira com o Matheus')+bt('v15:nico','Nicolas no rádio'))+
      sec('Gente pelo caminho',tp('uniGuarita','Seu Ademir · guarita')+tp('neusa','Dona Neusa · cantina')+tp('surfCamp','Kadu e Bia · fogueira')+tp('painelRoda','Seu Lauro · roda-gigante')+bt('v15:juliana','Cabo Juliana · BR-101'));break;
    case 'lug':{
      const grp={};const add=(g,k,l)=>{(grp[g]=grp[g]||[]).push(tp(k,l));};
      for(const [k,l] of [['start','Apartamento da Dona Cida'],['oficina','Oficina do Tião'],['posto','Posto da Av. do Estado'],['delegacia','Delegacia'],['mercado','Supermercado'],['cofre','Banco (cofre)'],['church','Paróquia Santa Inês'],['coreto','Praça'],['shop','Shopping Atlântico'],['grade','Drogaria do shopping'],['painelShop','Casa de máquinas do shopping'],['sewHatch','Tampa da galeria'],['van','Van da Vértice'],['farmacia','Hospital Ruth Cardoso'],['roda','Roda-gigante'],['capela','Cristo Luz'],['bondinho','Bondinho · Barra Sul'],['bloqueio','Barricada da Estrada'],['tunel','Túnel da BR-101']])add('Balneário Camboriú',k,l);
      for(const [k,l] of [['bondMA','Estação Mata Atlântica'],['colonia','Colônia (Seu Ivo)'],['geradorL','Rancho das Laranjeiras'],['bondL','Estação Laranjeiras'],['taquarinhas','Taquarinhas']])add('Laranjeiras',k,l);
      for(const [k,l] of [['mirante','Morro do Careca'],['clinica','Clínica da Brava'],['surf','Surf shop'],['surfCamp','Fogueira dos surfistas'],['resort','Resort Brava Mar'],['maqResort','Casa de máquinas do resort'],['vertice','Bloqueio de Cabeçudas']])add('Brava e Cabeçudas',k,l);
      for(const [k,l] of [['itajai','Mercado Público'],['matriz','Igreja Matriz'],['hospIt','Santa Clara'],['isol','Isolamento (pasta)'],['alicate','Manutenção (alicate)'],['bombeiros','Bombeiros'],['lab','Laboratório Vértice'],['armazem','Armazém'],['guindaste','Guindaste'],['radio','Heliponto']])add('Itajaí e porto',k,l);
      for(const [k,l] of [['zoneIn','Saída do túnel'],['uniGuarita','Guarita'],['uniBib','Biblioteca 6A'],['bloco3','Bloco 3'],['sala102','Sala 102'],['quadra','Quadra'],['foyer','Foyer e Auditório'],['uniSafe','Sala dos Professores (abrigo)'],['caculinha','Caçulinha do Marlon']])add('BR-101 e Universidade de BC',k,l);
      for(const [k,l] of [['sewIn','Entrada'],['quadroBomba','Estação de bombeamento'],['mapaDren','Sala das comportas'],['sewOut','Poço de saída']])add('Galeria pluvial',k,l);
      body=Object.entries(grp).map(([g,a])=>sec(g,a.join(''))).join('');break;}
    case 'inim':{const boss=k=>ETYPES[k].boss||['pers','bombeiro','boss','ouvinte','coletor','manequim'].includes(k);
      body=sec('Comuns',Object.keys(ETYPES).filter(k=>!boss(k)).map(k=>bt('spawn:'+k,ETYPES[k].n)).join(''))+sec('Chefes e especiais',Object.keys(ETYPES).filter(boss).map(k=>bt('spawn:'+k,ETYPES[k].n)).join(''))+
        sec('Controle',bt('kill','Matar todos por perto')+tg('freeze','Congelar inimigos')+tg('ai','Mostrar estado da IA'));break;}
    case 'medo':body=sec('Medo',tg('fearMax','Medo no máximo')+bt('name','Sussurrar o nome')+bt('echo','Passos que param depois')+bt('glitch','Objetivo falhando')+bt('ghost','Rádio do Tião (morto)')+bt('amb','Som da noite'))+
      sec('Gente pedindo ajuda',bt('cry','Grito de socorro')+bt('trap','Alguém preso num prédio')+bt('v15:pinned','Preso embaixo de carro')+bt('v15:drag','Arrastado pro escuro')+bt('v15:fall','Caindo do prédio')+bt('v15:roda','Preso na roda-gigante'));break;
    case 'mundo':body=sec('Mundo',`<button class="dbgt" data-a="dbg" data-k="clock">Hora<span>${clockStr()}</span></button>`+tg('bright','Luz total')+bt('light','Raio agora')+bt('blackout','Apagão')+bt('v14:smoke','Fumaça aqui')+bt('gates','Abrir todos os portões')+bt('map','Revelar o mapa')+bt('car','Jipe consertado aqui')+tg('fps','Mostrar FPS'))+sec('Clima (1.6)',bt('v16:wx:chuva','Chuva')+bt('v16:wx:tempestade','Tempestade')+bt('v16:wx:neblina','Neblina')+bt('v16:wx:apagao','Apagão geral')+bt('v16:wx:off','Tempo limpo'))+
      sec('Interface',bt('v14:notas','Mostrar "Novidades" de novo no título'));break;
    case 'fim':body=sec('Final',bt('end','Pular para o heliponto')+bt('wave','Chamar o resgate (15 s)')+bt('j:final','Batalha final com os três')+bt('win','Vencer agora')+bt('die','Morrer agora'));break;
  }
  this.open(`<div class="sheet wide dbg"><div class="tabs"><p class="kick">Ferramentas · ${GAME_VER}</p><h2 style="margin-right:auto">Menu de teste</h2><button class="btn ghost" data-a="close">Fechar</button></div>
    <div class="row dbgtabs">${DBG_TABS.map(([k,l])=>`<button class="btn${k===tab?' primary':''}" data-a="dbgtab" data-k="${k}">${l}</button>`).join('')}</div>
    <p class="hint">O que você liga aqui vale só para esta partida e não vai para o registro salvo.</p>
    <div class="dbg-grid">${body}</div></div>`,'','debug');
};
(function(){
  try{const st=document.createElement('style');st.textContent='.dbgtabs{flex-wrap:wrap;gap:6px}.dbgtabs .btn{font-size:13px;padding:6px 10px;min-height:34px}';document.head.appendChild(st);}catch(e){}
  const act=UI.act.bind(UI);
  UI.act=function(a,ds){if(a==='dbgtab'){this.dtab=ds.k;return this.debug();}return act(a,ds);};
  const da=UI.dbgAct.bind(UI);
  UI.dbgAct=function(k,ds){
    if(k==='v17:srv')return mpSrvTest();
    if(k==='v151:org'){this.close();mOrganize();return toast('Maleta organizada.');}
    if(k.startsWith('v16:')){const c=k.slice(4),F=G.flags;
      if(c==='mp')return this.mp(); if(c==='conta')return this.conta('title');
      this.close();
      if(c.startsWith('wx:')){const w=c.slice(3);if(w==='off')wxSet('chuva',true);else wxSet(w);return toast(w==='off'?'Tempo limpo.':'Clima: '+WX[w].n);}
      switch(c){
        case 'flash':if(FB.on)return toast('O flashback já está rolando.');F.uniDone=true;F.uniMat=true;return STORY.flashStart();
        case 'flashEnd':if(!FB.on)return toast('Nenhum flashback rolando.');return flashEnd();
        case 'prova':{const l=invAdd('folhaProva',3-invCount('folhaProva'));if(l)boxAdd('folhaProva',l);return toast('Folhas da prova na maleta.');}
        case 'fone':{const l=invAdd('foneMat',1);if(l)boxAdd('foneMat',l);return toast('Fone do Matheus na maleta.');}
        case 'mpSolo':{if(MP.on)return toast('Já está numa partida.');MP.role='host';MP.myId='0';MP.players={};MP.peers={};const c2=contaGet()||{};MP.me={nome:c2.nome||'Teste',apelido:c2.apelido||'teste',cor:c2.cor||'#d9a33c',char:c2.fav||'richard'};return mpBegin(mpStartInfo());}
        case 'mpNext':{if(!MP.on||MP.role!=='host')return toast('Só funciona como anfitrião da Noite Zero.');const s=MPST[MP.stage];if(s){for(const e of enemies)if(e.alive&&e.mpw)killEnemy(e);if(s.hold)MP.prog=s.hold;if(s.kills)MP.kills=999;}return;}
        case 'mpBoss':{if(!MP.on||MP.role!=='host')return toast('Só funciona como anfitrião da Noite Zero.');mpSpawnAt(rpick(['gordo','especime']),300,500);return toast('Chefão chamado.');}
        case 'mpWave':{if(!MP.on||MP.role!=='host')return toast('Só funciona como anfitrião da Noite Zero.');mpWave('pesada',14);return toast('Horda chamada.');}
        case 'hudEd':return UI.hudEdit('opts');
        case 'hudReset':delete HUDL[hudOri()];hudSave();layoutTouch();return toast('Controles no lugar padrão.');
        case 'run':TOUCH.runOn=!TOUCH.runOn;tcState='';return toast(TOUCH.runOn?'Corrida ligada.':'Corrida desligada.');
      }
      return;}
    if(!k.startsWith('v15:'))return da(k,ds);
    const c=k.slice(4),F=G.flags; this.close();
    if(c.startsWith('combo:')){const n=c.slice(6);let e=enemies.find(x=>x.alive&&x.type==='brandt');if(!e){F.brFight=true;e=spawnBrandt(P.x+40,P.y);}e.x=P.x+30;e.y=P.y;e.mode='stalk';e.lastCombo=null;
      brandtGrapple(e,n);return;}
    switch(c){
      case 'uniWave':{if(!F.uniMeet){dbgJump('uniBib');}F.uniMeet=true;F.matheusJoin=true;F.matFollow=true;F.uniMat=true;syncComps();const b=LM.uniBibIn;P.x=b.x;P.y=b.y+60;snapCamera();flowTile=-1;G.ev.uniWave={t:48,sp:1};return;}
      case 'uniDone':{F.uniMeet=true;F.matheusJoin=true;F.matFollow=true;F.uniMat=true;F.uniDone=true;F.marlonMet=true;G.ev.uniWave=null;syncComps();{const g=gates.find(x=>x.id==='bibUni');if(g&&!g.open)openGate(g);}return toast('Missão da Universidade de BC concluída. O Matheus está com você.');}
      case 'pinned':if(!evPinned())toast('Não achei um lugar livre na rua perto. Tente em outra rua.');return;
      case 'drag':if(!evDragged())toast('Não achei lugar perto. Tente numa rua aberta.');return;
      case 'fall':if(!forceFall())toast('Precisa estar perto de um prédio, na rua.');return;
      case 'zoeira':{if(!F.matFollow){F.matheusJoin=true;F.matFollow=true;syncComps();}G.ev.zoeT=0;BARK.cur=null;BARK.q=[];return;}
      case 'nico':F.nicoMet=true;G.ev.nicoT=0;return;
      case 'roda':{F.caos=Math.max(F.caos||0,1);F.rodaDone=false;const p=LM.painelRoda;if(p){P.x=p.x;P.y=p.y+40;snapCamera();flowTile=-1;}return;}
      case 'cristo':F.cristoLuz=false;return cristoUse();
      case 'juliana':{const n=npcs.find(x=>x.id==='juliana');if(n){P.x=n.x+40;P.y=n.y;snapCamera();flowTile=-1;}return;}
      case 'keys15':for(const id of ['chaveUni','manobra','pastaZero','fus10','fus20','fus30'])if(invCount(id)<=0)invAdd(id,1);return toast('Chaves novas na maleta.');
    }
  };
})();
