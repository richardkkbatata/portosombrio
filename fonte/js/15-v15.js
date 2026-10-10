// ===================== 1.5: A BR-101 · A UNIVALI · OS AMIGOS · LUTAS DO BRANDT =====================
// A região da BR fica fora da cidade gerada (linhas abaixo da galeria) e se liga a Balneário por um túnel
// no fim da Avenida do Estado, no oeste do Centro. O Matheus agora começa na Universidade de BC, junto com o Marlon.

const ZY=H+82;                       // primeira linha da região oeste
function zoneB(){return -1;}
function inZone(){return ((P.y/TILE)|0)>=ZY;}
function inZonePx(x,y){return ((y/TILE)|0)>=ZY;}
const OESTE_D={name:'BR-101 · Universidade de BC',short:'Universidade de BC',mx:100,y0:ZY,y1:HT-1,cap:13,count:0,spawn:{zumbi:8,corr:2,cao:1,rast:1},loot:{m9:1,ervaV:3,pilha:3,polv:2}};
(function(){const gw=genWorld;genWorld=function(){const i=DISTRICTS.indexOf(OESTE_D);if(i>=0)DISTRICTS.splice(i,1);try{gw();}finally{DISTRICTS.push(OESTE_D);}};})();
DISTRICTS.push(OESTE_D);
const UNI_COL='#2a5a3a';            // camiseta verde de estudante

// ---------- itens e documentos ----------
Object.assign(ITEMS,{
  chaveUni:{n:'Chave mestra da Universidade de BC',s:'CHAVE',c:'#4a8a5a',st:1,k:'key',d:'Molho de chaves do Seu Ademir, segurança da Universidade de BC. Abre a biblioteca do Bloco 6A.'},
  pastaZero:{n:'Pasta do Paciente Zero',s:'PASTA',c:'#c8b070',st:1,k:'key',d:'Prontuário do primeiro infectado, com o carimbo da Vértice. Prova de tudo.'},
});
const DOC15=DOCS.length;
DOCS.push(
  {t:'Quadro do Bloco 2, sala 102',b:`Escrito em giz, letra do professor Rese:\n\nPROVA DE RECUPERAÇÃO\nquinta, 19h — sala 102\n\nRICHARD: NÃO ADIANTA FALTAR DE NOVO.\n\nEmbaixo, com outra letra, alguém escreveu:\n"prof, acho que vai ser adiada"`},
  {t:'Aviso da Caçulinha do Marlon',b:`CAÇULINHA DO MARLON\nmercado · bebidas · gelo · carvão\n\n— FIADO SÓ AMANHÃ —\n— NÃO ACEITAMOS PIX DE ZUMBI —\n\nNo verso, a caneta:\n"Matheus, tu ainda deve duas cocas e um salgado. Eu anotei. — M."`},
  {t:'Rádio do Exército · BR-101',b:`[transcrição do Cabo J. Ramos, posto km 132]\n\n02h50 — A BR caiu nos dois sentidos. Viaduto de Itapema no chão. Ninguém entra, ninguém sai.\n03h15 — Pedi reforço três vezes. Respondem "aguarde Maré Limpa".\n03h40 — Maré Limpa não é resgate. Maré Limpa é queimar o litoral inteiro.\n\nSe alguém achar isto: o heliponto do porto de Itajaí é a única saída que ainda voa.`},
  {t:'Prontuário do Paciente Zero',b:`HOSPITAL SANTA CLARA · ISOLAMENTO · CONFIDENCIAL\nPaciente: não identificado ("Zero"). Trazido pela Vértice às 19h40, do porto.\n\n20h10 — Temperatura 27 °C. Sem pulso. Responde a som.\n21h05 — Mordeu o enfermeiro Paulo.\n21h30 — Paulo apresenta os mesmos sinais.\n22h16 — Ordem do Dr. Arantes: "Ninguém sai do prédio. Ninguém liga para ninguém."\n\nCarimbo vermelho: PROPRIEDADE DA VÉRTICE S.A.`}
);

// ---------- a passagem e a região oeste ----------
function genOeste(){
  const old=rnd; rnd=mulberry32(15151);
  const Y=ZY;
  for(let y=Y;y<HT-1;y++)for(let x=1;x<W-1;x++){const k=idx(x,y);map[k]=T.GRASS;bmap[k]=-1;}
  for(let x=0;x<W;x++){setT(x,Y,T.BORDER);setT(x,HT-1,T.BORDER);} for(let y=Y;y<HT;y++){setT(0,y,T.BORDER);setT(W-1,y,T.BORDER);}
  rect(1,Y+1,W-2,8,T.FOREST); rect(1,HT-8,W-2,6,T.FOREST);
  // ruas
  hroad(4,156,Y+10,4); hroad(4,156,Y+112,4); vroad(4,Y+10,Y+138,4); vroad(152,Y+10,Y+115,4);
  hroad(140,205,Y+60,4);
  // a BR-101: duas pistas e o canteiro
  vroad(160,Y+9,HT-9,6); vroad(170,Y+9,HT-9,6);
  for(let y=Y+9;y<HT-9;y++)for(let x=166;x<170;x++)if(getT(x,y)===T.GRASS)setT(x,y,T.GRASS);
  rect(158,Y+8,20,2,T.RUBBLE); rect(158,HT-10,20,2,T.RUBBLE);
  for(let i=0;i<26;i++){const x=ri(160,175),y=ri(Y+12,HT-14);if(getT(x,y)===T.ROAD&&getT(x+1,y)===T.ROAD&&y!==Y+60&&y!==Y+61&&y!==Y+62&&y!==Y+63)addCar(x,y,true,R()<.4);}
  for(let i=0;i<10;i++){const x=ri(160,175),y=ri(Y+14,HT-14);if(Math.abs(y-(Y+61))<4)continue;for(let j=0;j<2;j++)for(let k=0;k<2;k++)if(getT(x+k,y+j)===T.ROAD)setT(x+k,y+j,T.RUBBLE);GORE.push({k:'scorch',x:tc(x),y:tc(y),r:46,rot:0,seed:R()});}
  graf(167,Y+11,'BR-101 INTERDITADA',{rot:0,c:'#d8d4c8'}); graf(167,HT-12,'VIADUTO CAIU',{rot:0});
  // posto do Exército abandonado (norte da BR)
  {const b=building(178,Y+12,10,7,{floor:T.CONC,roof:'#4a5232',name:'Posto do Exército · km 132',kind:'tenda',doors:[['W',3,2]],loot:true});addPick(183,Y+15,DOC15+2,1,'file');addPick(185,Y+16,'m9',12);addPick(181,Y+17,'gran',1);
    npcs.push({id:'juliana',name:'Cabo Juliana',look:null,x:tc(181),y:tc(Y+14),col:'#3d4a2f',hair:'#1a120c',skin:'#b07a5a',ang:Math.PI,cond:()=>!G.flags.julianaGone});}
  // o túnel (chegada) e o bairro do lado de cá da BR
  rect(206,Y+59,2,6,T.WALL); addInteract(205,Y+61,'tunelVolta',62); LM.zoneIn={x:tc(202),y:tc(Y+61.5)}; LM.tunelZ={x:tc(203),y:tc(Y+61.5)};
  vroad(180,Y+22,Y+110,3);
  bigHouse(185,Y+20,11,10,'S'); bigHouse(197,Y+20,10,10,'S'); bigHouse(185,Y+86,11,10,'N'); bigHouse(197,Y+86,10,10,'N');
  {const c=building(184,Y+66,14,13,{floor:T.TILEF,roof:'#b8402a',name:'Caçulinha do Marlon',kind:'mercado',doors:[['W',5,2]],loot:true});
    for(let x=187;x<=195;x+=3)for(let y=Y+68;y<=Y+75;y++)prop(x,y,12); prop(196,Y+67,1); addPick(189,Y+77,DOC15+1,1,'file'); addPick(186,Y+68,'garrafa',3); addPick(193,Y+77,'ervaV',1); addPick(196,Y+76,'pilha',2);
    LM.caculinha={x:tc(185),y:tc(Y+72)}; graf(186,Y+65,'CAÇULINHA DO MARLON',{rot:0,c:'#e8d8a0'});}
  bigHouse(199,Y+68,8,11,'W');
  // ---------- Universidade de BC, campus Balneário Camboriú ----------
  const CX=12, CY=Y+18;  LM.uni={x:tc(CX+60),y:tc(CY+50)};
  rect(CX,CY,128,90,T.SIDE);
  rect(CX+30,CY+0,64,40,T.GRASS); rect(CX+96,CY+0,30,22,T.GRASS); rect(CX+0,CY+86,128,3,T.GRASS);
  // estacionamento sul
  rect(CX+10,CY+58,30,26,T.CONC); rect(CX+54,CY+58,52,26,T.CONC);
  for(const y of [CY+60,CY+66,CY+72,CY+78])for(let x=CX+12;x<CX+104;x+=3){if(x>CX+38&&x<CX+56)continue;if(R()<.62)addCar(x,y,false,R()<.06);}
  for(const [x,y] of [[CX+24,CY+64],[CX+24,CY+76],[CX+70,CY+64],[CX+88,CY+70],[CX+70,CY+76]])setT(x,y,T.TREE);
  // salas em fileira (corredor no meio)
  const classes=(b,x0,x1,y0,y1,step)=>{const mid=((y0+y1)>>1);for(let x=x0+step;x<x1;x+=step)iwall(b,x,y0,x,y1,[[mid,2]]);for(let x=x0+2;x<x1-1;x+=step)for(const y of [y0,y1])if(R()<.7)prop(x,y,13);};
  {const b=building(CX+4,CY+44,34,11,{floor:T.TILEF,roof:'#c8c4b8',name:'Bloco 4 · Gastronomia',doors:[['S',16,2],['N',6,2],['E',4,2]],loot:true,kind:'escola'});classes(b,CX+4,CX+37,CY+45,CY+53,6);}
  {const b=building(CX+40,CY+42,14,14,{floor:T.TILEF,roof:'#d8d4cc',name:'Bloco 3 · Secretaria Acadêmica',doors:[['N',5,3],['S',5,3],['W',5,3],['E',5,3]],loot:true,kind:'escola'});
    for(const [x,y] of [[CX+40,CY+42],[CX+53,CY+42],[CX+40,CY+55],[CX+53,CY+55]])setT(x,y,T.GRASS);
    for(let x=CX+43;x<=CX+50;x+=2)prop(x,CY+45,35); prop(CX+46,CY+50,1); prop(CX+47,CY+50,1); LM.bloco3={x:tc(CX+47),y:tc(CY+49)};}
  {const b=building(CX+56,CY+44,34,11,{floor:T.TILEF,roof:'#c8c4b8',name:'Bloco 2 · Arquitetura e Design',doors:[['S',14,2],['N',22,2],['W',4,2]],loot:true,kind:'escola'});classes(b,CX+56,CX+89,CY+45,CY+53,6);
    addPick(CX+60,CY+46,DOC15,1,'file'); LM.sala102={x:tc(CX+60),y:tc(CY+46)}; prop(CX+59,CY+45,34);}
  safeRoom(CX+43,CY+58,9,12,[['N',3,2]],'Bloco 1 · Sala dos Professores'); LM.uniSafe={x:tc(CX+47),y:tc(CY+62)};
  {const b=building(CX+0,CY+58,9,27,{floor:T.TILEF,roof:'#c8c4b8',name:'Bloco 5 · Laboratórios',doors:[['E',4,2],['E',18,2]],loot:true,kind:'escola'});iwall(b,CX+1,CY+71,CX+7,CY+71,[[CX+3,2]]);for(let y=CY+60;y<CY+84;y+=3)prop(CX+2,y,36);}
  building(CX+0,CY+30,9,12,{floor:T.TILEF,roof:'#7a7e82',name:'Bloco 10 · ETAU',doors:[['E',5,2]],loot:true,kind:'escola'});
  {const b=building(CX+11,CY+28,14,14,{floor:T.TILEF,roof:'#d8d4cc',name:'Bloco 7 · Cozinha Pedagógica II',doors:[['S',6,2],['E',5,2]],loot:true,kind:'restaurante'});for(let x=CX+13;x<CX+24;x+=3)prop(x,CY+31,15);}
  {const b=building(CX+11,CY+13,16,13,{floor:T.CARPET,roof:'#e0dcd0',name:'Foyer e Auditório II',doors:[['S',7,2]],kind:'auditorio'});b.dark=true;for(let y=CY+15;y<CY+22;y+=2)for(let x=CX+13;x<CX+26;x++)if(x!==CX+19&&x!==CX+20)prop(x,y,13);addPick(CX+19,CY+15,'spray',1);LM.foyer={x:tc(CX+19),y:tc(CY+23)};}
  building(CX+0,CY+13,10,13,{floor:T.TILEF,roof:'#c8c4b8',name:'Bloco 8 · Design de Interiores',doors:[['E',5,2]],loot:true,kind:'escola'});
  building(CX+0,CY+0,12,12,{floor:T.TILEF,roof:'#c8c4b8',name:'Bloco 9 · Estúdio de Fotografia',doors:[['S',5,2]],loot:true,kind:'escola'});
  {const b=building(CX+34,CY+5,26,17,{floor:T.WOOD,roof:'#e4e0d6',name:'Quadra de Esportes',doors:[['S',11,3],['E',7,2]],kind:'ginasio'});for(let x=CX+36;x<CX+58;x++){prop(x,CY+6,13);}addPick(CX+46,CY+14,'cart',4);addPick(CX+56,CY+19,'ervaV',1);LM.quadra={x:tc(CX+47),y:tc(CY+14)};
    for(const [x,y] of [[CX+40,CY+12],[CX+52,CY+16],[CX+44,CY+18],[CX+50,CY+10]])initEnemies.push({uid:'uq'+x+'_'+y,type:'zumbi',x:tc(x),y:tc(y),col:'#c8402a',dorm:R()<.4});}
  // praça de convivência
  {const cx=CX+70,cy=CY+28;for(let j=-6;j<=6;j++)for(let i=-6;i<=6;i++)if(i*i+j*j<=36)setT(cx+i,cy+j,T.CONC);setT(cx,cy,T.TREE);LM.praca={x:tc(cx+3),y:tc(cy+3)};}
  {const b=building(CX+42,CY+34,10,7,{floor:T.TILEF,roof:'#c87a3a',name:'Cantina da Dona Neusa',doors:[['S',4,2]],kind:'restaurante'});prop(CX+44,CY+36,9);prop(CX+45,CY+36,9);prop(CX+46,CY+36,9);
    npcs.push({id:'neusa',name:'Dona Neusa',look:null,x:tc(CX+48),y:tc(CY+38),col:'#e8e0d0',hair:'#8a8a86',skin:'#d8a888',ang:Math.PI/2});LM.neusa={x:tc(CX+48),y:tc(CY+38)};}
  building(CX+78,CY+36,8,7,{floor:T.TILEF,roof:'#c87a3a',name:'Cantina do Bloco 6',doors:[['S',3,2]],loot:true,kind:'restaurante'});
  // Bloco 6B e 6A (biblioteca)
  building(CX+94,CY+24,28,9,{floor:T.TILEF,roof:'#c8c4b8',name:'Bloco 6B · Direito',doors:[['S',6,2],['W',3,2]],loot:true,kind:'escola'});
  {const b=building(CX+94,CY+34,28,20,{floor:T.WOOD,roof:'#d8d4cc',name:'Bloco 6A · Biblioteca',doors:[['S',12,3]],kind:'biblioteca'});b.dark=true;
    for(let y=CY+37;y<CY+50;y+=3)for(let x=CX+97;x<CX+119;x++)if((x-CX)%8!==3&&(x-CX)%8!==4)prop(x,y,12);
    addGate('bibUni',CX+106,CY+53,3,1,'chaveUni','#5a6a5a','Porta da biblioteca','Trancada por dentro e por fora. Tem uma barricada de mesas atrás do vidro.',T.WOOD);
    npcs.push({id:'marlonU',name:'Marlon',look:'marlon',x:tc(CX+104),y:tc(CY+50),col:'#1c1e21',hair:'#1c120a',skin:'#e0b090',ang:Math.PI/2,cond:()=>!G.flags.uniDone});
    npcs.push({id:'matU',name:'Matheus',look:'math',x:tc(CX+110),y:tc(CY+50),col:'#e8e6e0',hair:'#140f0c',skin:'#d9aa8c',ang:Math.PI/2,cond:()=>!G.flags.matheusJoin});
    LM.uniBib={x:tc(CX+107.5),y:tc(CY+55.5)}; LM.uniBibIn={x:tc(CX+107.5),y:tc(CY+50)};}
  // torres
  for(const [cx,cy] of [[CX+124,CY+18],[CX+62,CY+66]]){for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)setT(cx+i,cy+j,T.WALL);}
  LM.torre={x:tc(CX+124),y:tc(CY+18)}; LM.torre2={x:tc(CX+62),y:tc(CY+66)};
  // guarita, cerca e entradas
  {const g=building(CX+32,CY+86,7,5,{floor:T.TILEF,roof:'#4a8a5a',name:'Guarita · Entrada de pedestres',doors:[['S',2,2],['N',2,2]],kind:'guarita'});LM.uniGuarita={x:tc(CX+35),y:tc(CY+88)};
    npcs.push({id:'ademir',name:'Seu Ademir',look:null,x:tc(CX+35),y:tc(CY+88),col:'#2a3a5a',hair:'#3a3a38',skin:'#c89878',ang:Math.PI/2,cond:()=>!G.flags.ademirGone});}
  for(let x=CX;x<CX+128;x++){const open=(x>=CX+2&&x<CX+8)||(x>=CX+31&&x<CX+40)||(x>=CX+110&&x<CX+116);if(!open&&getT(x,CY+90)===T.GRASS)setT(x,CY+90,T.FENCE);}
  trees(CX+30,CY+0,CX+94,CY+40,.05); trees(CX+96,CY+0,CX+126,CY+22,.06);
  graf(CX+64,CY+57,'UNIV. DE BC',{rot:0,c:'#d8d4c8',s:1.4}); graf(CX+100,CY+57,'SOCORRO 6A',{rot:.02});
  // estudantes que viraram
  for(let i=0;i<40;i++){const x=ri(CX+2,CX+124),y=ri(CY+2,CY+88),k=idx(x,y);if(SOLID[map[k]])continue;if(hyp(x-(CX+107),y-(CY+44))<14)continue;initEnemies.push({uid:'uz'+i,type:R()<.15?'corr':'zumbi',x:tc(x),y:tc(y),col:R()<.6?UNI_COL:null,dorm:bmap[k]>=0&&R()<.5});}
  for(let i=0;i<14;i++){const x=ri(150,205),y=ri(Y+14,HT-14),k=idx(x,y);if(SOLID[map[k]])continue;initEnemies.push({uid:'uzb'+i,type:R()<.2?'cao':'zumbi',x:tc(x),y:tc(y)});}
  // casas do bairro a sudoeste
  bigHouse(12,Y+120,12,10,'N'); bigHouse(26,Y+120,12,10,'N'); bigHouse(40,Y+120,14,10,'N'); bigHouse(58,Y+120,12,10,'N'); bigHouse(74,Y+120,12,10,'N'); bigHouse(92,Y+120,14,10,'N');
  trees(8,Y+118,150,HT-10,.04);
  for(const [x,y,c] of [[60,Y+12,'lamp'],[100,Y+12,'lamp'],[168,Y+40,'fire'],[164,Y+90,'fire'],[172,Y+120,'fire'],[190,Y+62,'lamp'],[CX+70,CY+28,'lamp']])lights.push({x:tc(x),y:tc(y),r:c==='fire'?160:130,c,f:1});
  for(const [x,y] of [[168,Y+40],[164,Y+90],[172,Y+120]])ZFIRES.push({x:tc(x),y:tc(y)});
  rnd=old;
}
const ZFIRES=[];
// o túnel do lado de Balneário
function genTunel(){
  for(let x=6;x<12;x++)for(let y=272;y<276;y++)setT(x,y,T.ROAD);
  for(let y=271;y<277;y++){setT(4,y,T.WALL);setT(5,y,T.WALL);}
  addInteract(6,273,'tunelBR',62); LM.tunel={x:tc(7.5),y:tc(273.5)};
  if(typeof invalidateRect==='function')invalidateRect(3,270,10,8);
}
function zoneReach(){
  const q=[],s=idx((LM.zoneIn.x/TILE)|0,(LM.zoneIn.y/TILE)|0); reach[s]=1; q.push(s);
  while(q.length){const k=q.pop(),x=k%W,y=(k/W)|0;for(const [dx,dy] of DIRS4){const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;const nk=idx(nx,ny);if(reach[nk])continue;const t=map[nk];if(SOLID[t]&&t!==T.GATE&&t!==T.SHUTTER)continue;reach[nk]=1;q.push(nk);}}
}
(function(){
  const g=genV12;
  genV12=function(){g();ZFIRES.length=0;genOeste();genTunel();zoneReach();
    // o tile do túnel em Balneário fica alcançável a partir da rua
    {const k=idx(7,273);reach[k]=1;}
  };
})();
function goZone(toZone){
  if(P.inCar){toast('O túnel está entupido de carros batidos. Só passa a pé.');return;}
  if(G.ev.chase)return;
  const to=toZone?LM.zoneIn:{x:tc(9),y:tc(273.5)};
  playCut([{fx:'blackout',v:1.2},{sfx:'creak',v:.5},{do:()=>{P.x=to.x;P.y=to.y;for(const c of (G.comps||[])){c.x=P.x-20;c.y=P.y+12;}snapCamera();flowTile=-1;}},{wait:.5},
    ...(toZone&&!G.flags.zoneSeen?[{do:()=>{G.flags.zoneSeen=true;}},{say:'rafa',m:'s',t:'A BR... olha isso. Os dois sentidos parados. Tem caminhão pegando fogo até onde dá pra ver.'},
      ...(G.flags.eduFollow?[{say:'edu',m:'n',t:'Pelo menos não tem trânsito.'}]:[]),
      {say:'rafa',m:'t',think:true,t:'A Universidade de BC fica do outro lado da pista. Três minutos a pé, num dia normal.',dur:2.2}]:[])]);
}

// ---------- a missão da Universidade de BC (capítulo 2, obrigatória) ----------
STORY.uniCall=function(){
  const F=G.flags; if(F.uniDone!=null)return; F.uniDone=false;
  AU.radio();
  playCut([{sfx:'static',v:1},
    {say:'marlon',m:'s',radio:true,t:'...canal sete... alguém no canal sete? Richard? Mano, se tu tiver ouvindo, responde!'},
    {say:'rafa',m:'s',t:'MARLON?! Tô aqui! Tu tá onde?'},
    {say:'marlon',m:'t',radio:true,t:'Na Universidade de BC. Na biblioteca do 6A. Eu vim buscar o Matheus, ele tava virando a noite no laboratório.'},
    {say:'matheus',m:'s',radio:true,t:'Richard? Sou eu. A gente trancou a porta com mesa. Tem uns cinquenta do lado de fora. Estudante, mano. Gente da nossa turma.'},
    {say:'marlon',m:'n',radio:true,t:'O túnel no fim da Avenida do Estado passa por baixo da BR. Do outro lado é a faculdade. O Seu Ademir da guarita tem a chave da biblioteca.'},
    ...(F.eduFollow?[{say:'edu',m:'n',t:'O Matheus tá vivo. ...Ok. Vamos buscar o nerd.'}]:[]),
    {say:'rafa',m:'a',t:'Segura aí. A gente tá indo.'}],
    ()=>{G.banner={t:'Universidade de BC',life:2.6};});
};
STORY.ademir=function(n){
  const F=G.flags; if(F.ademirTalk){if(!F.uniDone)return bark('ademir','t',pick2(['Vai... a biblioteca é no 6A, atrás da praça.','Não deixa eles pegarem os meninos.','Tá esfriando, filho. Tá esfriando muito.']));return;}
  F.ademirTalk=true;
  playCut([{npc:n,id:'ademir'},
    {say:'ademir',m:'s',t:'Para! ...Tu é aluno? Tá vivo? Graças a Deus.'},
    {say:'ademir',m:'t',t:'Vinte e dois anos de Universidade de BC. Nunca deixei ninguém entrar sem crachá. Hoje eles entraram sem crachá nenhum.'},
    {say:'rafa',m:'s',t:'O senhor tá sangrando, Seu Ademir.'},
    {say:'ademir',m:'t',t:'Uma menina do Bloco 4 me pegou no braço. Eu sei o que isso quer dizer. Eu vi a TV.'},
    {say:'ademir',m:'n',t:'Os dois guris tão na biblioteca, no 6A. Toma a chave mestra. Abre e tira eles de lá.'},
    {do:()=>{invAdd('chaveUni',1);AU.pickup();toast('Você recebeu a chave mestra da Universidade de BC.');}},
    {choice:[
      {t:'Vem com a gente, Seu Ademir.',then:[{say:'ademir',m:'h',t:'Não, filho. Eu fico na minha guarita. Se eu virar, viro onde eu trabalhei.'}]},
      {t:'Quer que eu fique com o senhor um pouco?',then:[{say:'ademir',m:'h',t:'Tu é um bom menino. Mas vai. Eu não quero que tu me veja daqui a pouco.'},{do:()=>{F.ademirKind=true;}}]},
    ]},
    {say:'ademir',m:'t',t:'E fecha a porta da guarita quando sair.'}]);
};
STORY.neusa=function(n){
  const F=G.flags;
  if(F.neusaTalk)return bark('neusa','h',pick2(['Come alguma coisa, menino, tu tá branco.','O salgado de hoje é de ontem. O de ontem é de anteontem.','Fiado? Fiado só pro Marlon. Ele paga em coca.']));
  F.neusaTalk=true;
  playCut([{npc:n,id:'neusa'},
    {say:'neusa',m:'s',t:'Ai, Jesus! ...Ah, é tu, menino do bloco 2. Tu não tinha prova hoje?'},
    {say:'rafa',m:'s',t:'Dona Neusa?! A senhora tá aqui sozinha?'},
    {say:'neusa',m:'n',t:'Tranquei a cantina às dez. Eles batem no vidro, mas o vidro é bom, foi o reitor que pagou.'},
    {say:'neusa',m:'h',t:'Leva isso. Coxinha não posso dar, tá tudo estragado. Mas erva do meu canteiro eu tenho.'},
    {do:()=>{for(const [id,q] of [['ervaV',2],['ervaR',1]]){const l=invAdd(id,q);if(l)boxAdd(id,l);}AU.pickup();toast('A Dona Neusa te deu duas ervas verdes e uma vermelha.');}},
    {say:'neusa',m:'n',t:'E diz pro Matheus que ele ainda me deve o pão de queijo de terça.'}]);
};
STORY.juliana=function(n){
  const F=G.flags;
  if(F.julianaTalk)return bark('juliana','n',pick2(['Maré Limpa às 05h40. Se ainda tiver aqui, morre queimado.','Eu fico. Alguém tem que avisar quem vier pela BR.','O porto. É o único que ainda voa.']));
  F.julianaTalk=true;
  playCut([{npc:n,id:'juliana'},
    {say:'juliana',m:'a',t:'Mão pra cima! ...Civil. Tá. Abaixa. Abaixa, eu não vou atirar.'},
    {say:'juliana',m:'s',t:'Cabo Ramos, 23º. O meu pelotão foi pra Itapema às duas da manhã. Só voltou o rádio.'},
    {say:'juliana',m:'t',t:'Escuta: "Maré Limpa" não é resgate. Às cinco e quarenta eles vão queimar a costa inteira. De Itajaí a Itapema.'},
    {say:'rafa',m:'s',t:'Então como a gente sai?'},
    {say:'juliana',m:'n',t:'O heliponto do porto de Itajaí. É o único que ainda responde. Toma, isso aqui eu não vou usar sozinha.'},
    {do:()=>{for(const [id,q] of [['m9',18],['sinal',2]]){const l=invAdd(id,q);if(l)boxAdd(id,l);}AU.pickup();toast('A Cabo Juliana te deu munição 9mm e dois sinalizadores.');}}]);
};
function uniMeet(){
  const F=G.flags; if(F.uniMeet)return; F.uniMeet=true;
  const m=npcs.find(x=>x.id==='marlonU'), t=npcs.find(x=>x.id==='matU'), ed=F.eduFollow, mm=F.marlonMet;
  playCut([{npc:m,id:'marlon'},{npc:t,id:'matheus'},{startle:'matheus'},
    {say:'matheus',m:'s',t:'RICHARD!'},
    {walk:'matheus',to:'rafa',ox:0,oy:-30,spd:120},
    {say:'rafa',m:'h',t:'Matheus! Tu tá inteiro, nerd. Até o óculos.'},
    {say:'matheus',m:'a',t:'Eu não uso óculos, Richard. Faz cinco anos que tu fala isso.'},
    {say:'rafa',m:'h',t:'Exatamente. Tu devia usar.'},
    ...(ed?[{say:'edu',m:'n',t:'Oi, Matheus.'},{say:'matheus',m:'h',t:'EDU! Tu tá vivo, mano!'},{say:'edu',m:'n',t:'Tô. Por enquanto.'}]:[]),
    {say:'marlon',m:mm?'h':'a',t:mm?'Eu falei que ia te encontrar, Richard. Só não falei que ia ser na faculdade.':'Richard. Que bom que tu veio, mano. Que bom.'},
    ...(mm?[]:[{say:'marlon',m:'t',t:'Eu tava no terraço do Yacht com a carabina do meu vô. Vi caminhão branco da Vértice botando gente VIVA em contêiner. Aí o Matheus mandou áudio chorando.'}]),
    {say:'marlon',m:'n',t:'Se a gente sair dessa, a Caçulinha reabre. Fiado pra vocês três. Só pra vocês.'},
    {say:'matheus',m:'t',t:'Tu nunca deu fiado pra ninguém, Marlon.'},
    {say:'marlon',m:'h',t:'Por isso que é especial.'},
    {sfx:'knock',v:1},{fx:'shake',v:8},{sfx:'roar',v:.8},
    {say:'matheus',m:'s',t:'A porta! Eles ouviram a gente! A barricada não vai aguentar!'},
    {say:'marlon',m:'a',t:'Eu fico na janela com a carabina. Matheus, pega a escopeta do segurança. Richard, segura a porta da frente!'},
    {do:()=>{F.matheusJoin=true;F.matFollow=true;F.uniMat=true;syncComps();const c=compOf('matheus');if(c&&t){c.x=t.x;c.y=t.y;}}}],
    ()=>{G.ev.uniWave={t:48,sp:1.5};AU.alarm();toast('SEGURE A BIBLIOTECA! O Marlon cobre da janela.');});
}
function uniWaveTick(dt){
  const w=G.ev.uniWave; if(!w)return; w.t-=dt; w.sp-=dt; G.fear=Math.max(G.fear||0,.5);
  const door=LM.uniBib;
  if(w.sp<=0&&w.t>4){w.sp=rr(1.6,2.6);for(let i=0;i<(w.t<20?3:2);i++){const a=Math.PI/2+rr(-.9,.9),d=rr(280,420),x=door.x+Math.cos(a)*d,y=door.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;
    if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]])continue;const e=makeEnemy(Math.random()<.3?'corr':'zumbi',tc(tx),tc(ty),null);e.col=Math.random()<.7?UNI_COL:null;e.state='chase';e.hunt=true;e.huntT=40;e.lx=P.x;e.ly=P.y;enemies.push(e);}}
  // o Marlon atira da janela
  w.mt=(w.mt||0)-dt; const m=npcs.find(x=>x.id==='marlonU');
  if(m&&w.mt<=0){const tg=enemies.filter(e=>e.alive&&!e.t.boss&&hyp(e.x-m.x,e.y-m.y)<520&&los(m.x,m.y,e.x,e.y)).sort((a,b)=>hyp(a.x-P.x,a.y-P.y)-hyp(b.x-P.x,b.y-P.y))[0];
    if(tg){w.mt=rr(.9,1.4);m.ang=Math.atan2(tg.y-m.y,tg.x-m.x);AU.shot('magnum');BR.tracers.push({x0:m.x,y0:m.y,x1:tg.x,y1:tg.y,life:.08});hurtEnemy(tg,70,Math.cos(m.ang)*200,Math.sin(m.ang)*200,{});}else w.mt=.4;}
  if(w.t<=0){G.ev.uniWave=null;uniAfter();}
}
function uniAfter(){
  const F=G.flags; const m=npcs.find(x=>x.id==='marlonU');
  for(const e of enemies)if(e.alive&&!e.t.boss&&!e.stalker&&hyp(e.x-P.x,e.y-P.y)<700){e.state='search';e.hunt=false;}
  const steps=[{npc:m,id:'marlon'},{wait:.4},
    {say:'marlon',m:'s',t:'Pararam... pararam de bater. Acho que acabou a fila.'},
    {say:'matheus',m:'t',t:'Era a turma da Gastronomia. Eu conhecia aquela menina de cabelo rosa.'},
    {say:'rafa',m:'t',t:'Eu sei. Eu também.'}];
  if(!F.marlonMet){F.marlonMet=true;steps.push({say:'marlon',m:'n',t:'Eu não vou com vocês. Alguém tem que fazer alguma coisa aqui em Balneário. Fala tu, Richard: o que eu faço?'},
    {choice:[{t:'Busca a Dona Cida no prédio dela.',then:[{say:'marlon',m:'n',t:'A senhora do Edifício Atlântida? Fechou. Eu levo ela pro barco do Saco da Fazenda.'},{do:()=>{F.marlon='cida';}}]},
      {t:'Vai pro porto e cobre o heliponto.',then:[{say:'marlon',m:'a',t:'Fechou. Eu subo num guindaste e fico de olho. Quando a merda começar, olha pra cima.'},{do:()=>{F.marlon='arm';}}]}]});}
  else steps.push({say:'marlon',m:'n',t:'Eu volto pro que a gente combinou. Te vejo no porto, Richard. Cuida desses dois.'});
  steps.push({say:'edu',m:'n',t:F.eduFollow?'Tchau, Marlon. Não morre.':'...'},{do:()=>{F.uniDone=true;const mu=npcs.find(x=>x.id==='marlonU');if(mu)mu.cond=()=>false;}});
  if(!F.eduFollow)steps.splice(steps.length-2,1);
  playCut(steps,()=>{G.banner={t:'O Matheus está com você',life:3};ach('univali');});
}
(function(){const sn=STORY.npc;STORY.npc=function(n){
  if(n&&n.id==='ademir')return STORY.ademir(n);
  if(n&&n.id==='neusa')return STORY.neusa(n);
  if(n&&n.id==='juliana')return STORY.juliana(n);
  if(n&&(n.id==='marlonU'||n.id==='matU'))return G.flags.uniMeet?bark(n.id==='marlonU'?'marlon':'matheus','n','Segura a porta!'):uniMeet();
  return sn(n);};})();
Object.assign(PCH,{
  ademir:{name:'Seu Ademir',skin:'#c89878',shade:'#9a6a50',hair:'#5a5a56',iris:'#3a2a1a',bg:['#1a2030','#060810'],glow:'120,160,220',voice:105},
  neusa:{name:'Dona Neusa',skin:'#d8a888',shade:'#a87a5e',hair:'#9a9690',iris:'#3a2618',bg:['#3a2410','#120a04'],glow:'240,170,90',voice:215},
  juliana:{name:'Cabo Juliana',skin:'#b07a5a',shade:'#7a4e38',hair:'#1a120c',iris:'#2a1a10',bg:['#1e2414','#070904'],glow:'150,180,90',voice:185},
});
Object.assign(PXH,{
  ademir:{hw:58,hh:70,body:['#2a3a5a','#101828'],clothes(c,cx,H2){c.fillStyle='#d8d4c8';c.beginPath();c.moveTo(cx-14,212);c.lineTo(cx,240);c.lineTo(cx+14,212);c.closePath();c.fill();c.fillStyle='#1a1a1a';c.fillRect(cx-3,222,6,30);c.fillStyle='#c8a040';c.fillRect(cx+30,236,22,8);},
    hair(c,cx,cy,hw,hh,p){c.fillStyle=p.hair;c.beginPath();c.moveTo(cx-hw,cy-14);c.bezierCurveTo(cx-hw,cy-hh-6,cx+hw,cy-hh-6,cx+hw,cy-14);c.quadraticCurveTo(cx,cy-40,cx-hw,cy-14);c.fill();},
    details(c,cx,cy,my){c.fillStyle='#6a6a66';c.beginPath();c.moveTo(cx-22,my-4);c.quadraticCurveTo(cx,my-12,cx+22,my-4);c.quadraticCurveTo(cx,my-6,cx-22,my-4);c.fill();c.fillStyle='rgba(120,20,16,.5)';c.beginPath();c.ellipse(cx+40,cy+70,10,6,.4,0,6.283);c.fill();}},
  neusa:{hw:56,hh:66,body:['#e8e0d0','#a8a090'],clothes(c,cx){c.fillStyle='#c84a3a';c.fillRect(cx-40,226,80,60);c.fillStyle='#e8e0d0';c.fillRect(cx-36,232,72,6);},
    hair(c,cx,cy,hw,hh,p){c.fillStyle=p.hair;c.beginPath();c.ellipse(cx,cy-hh+4,hw+6,30,0,0,6.283);c.fill();c.fillStyle='#e8e0d0';c.beginPath();c.ellipse(cx,cy-hh-6,hw-4,16,0,0,6.283);c.fill();},
    details(c,cx,cy,my,mood){if(mood==='h'){c.strokeStyle='#8a4a3a';c.lineWidth=3;c.beginPath();c.arc(cx,my-4,12,.2,Math.PI-.2);c.stroke();}c.fillStyle='rgba(230,120,110,.18)';for(const s of [-1,1]){c.beginPath();c.ellipse(cx+s*30,cy+18,13,9,0,0,6.283);c.fill();}}},
  juliana:{hw:52,hh:68,body:['#3d4a2f','#1a2010'],clothes(c,cx,H2){c.fillStyle='#4a5a38';c.fillRect(70,224,140,H2-224);c.fillStyle='#2e3824';for(const x of [92,170])c.fillRect(x,246,20,26);c.fillStyle='#d8d4c8';c.fillRect(cx+26,232,20,6);},
    hair(c,cx,cy,hw,hh,p){c.fillStyle=p.hair;c.beginPath();c.moveTo(cx-hw-4,cy+10);c.bezierCurveTo(cx-hw-10,cy-hh-20,cx+hw+10,cy-hh-20,cx+hw+4,cy+10);c.quadraticCurveTo(cx+hw-4,cy-34,cx,cy-40);c.quadraticCurveTo(cx-hw+4,cy-34,cx-hw-4,cy+10);c.fill();c.beginPath();c.ellipse(cx,cy-hh-14,20,14,0,0,6.283);c.fill();},
    details(c,cx,cy,my){c.strokeStyle='rgba(60,30,20,.4)';c.lineWidth=2;c.beginPath();c.moveTo(cx-34,cy+30);c.lineTo(cx-24,cy+40);c.stroke();}},
});

// ---------- Santa Clara: no lugar do Matheus, a pasta do Paciente Zero ----------
(function(){
  const g=genV12; genV12=function(){g();if(LM.isol){const [x,y]=freeTileNear((LM.isol.x/TILE)|0,(LM.isol.y/TILE)|0,false);pickups.push({uid:'pastaZ',tx:x,ty:y,x:tc(x),y:tc(y),id:'pastaZero',q:1,kind:'item'});pickOcc.add(idx(x,y));LM.pasta={x:tc(x),y:tc(y)};}};
  const mr=STORY.matRadio;
  STORY.matRadio=function(){
    const F=G.flags; if(!F.uniMat)return mr();
    if(F.matRadio)return; F.matRadio=true;
    playCut([{say:'matheus',m:'s',t:'Richard. Espera. O Santa Clara. Aquele hospital ali na frente.'},
      {say:'matheus',m:'t',t:'Meu primo é enfermeiro lá. Ele mandou áudio às nove: a Vértice trouxe um paciente do porto pro isolamento. O primeiro. O Paciente Zero.'},
      {say:'matheus',m:'n',t:'Se a gente pegar o prontuário, a gente prova o que eles fizeram. Pra polícia, pra TV, pra quem sobrar.'},
      ...(G.flags.eduFollow||compOf('edu')?[{say:'edu',m:'n',t:'Ou a gente morre lá dentro com a prova na mão.'}]:[]),
      {say:'rafa',m:'a',t:'Ala norte, isolamento. Entra devagar, sai rápido.'}]);
  };
  const ob=objective;
  objective=function(){
    const F=G.flags, has=id=>invCount(id)>0;
    if(G.ev.uniWave)return {t:`Segure a biblioteca: ${Math.ceil(G.ev.uniWave.t)} s`,at:null};
    if(F.uniDone===false&&!F.inibidorDone){
      if(!inZone())return {t:'Vá até a Universidade de BC: o túnel sob a BR-101 fica no fim da Avenida do Estado, a oeste do Centro',at:LM.tunel};
      if(!F.ademirTalk&&!has('chaveUni'))return {t:'Ache o Seu Ademir na guarita da entrada de pedestres da Universidade de BC',at:LM.uniGuarita};
      if(!F.uniMeet)return {t:'Abra a biblioteca do Bloco 6A com a chave mestra',at:LM.uniBib};
    }
    if(F.hospLock&&!F.hospOut&&F.uniMat&&!F.pastaGot&&!has('pastaZero'))return {t:'Trancado no Santa Clara. Pegue a pasta do Paciente Zero no isolamento. Ande devagar: ela escuta.',at:LM.pasta||LM.isol};
    return ob();
  };
  const ug=useGate; useGate=function(g){
    if(g&&g.id==='hospOut'&&!g.open&&G.flags.uniMat&&!G.flags.pastaGot&&invCount('pastaZero')<=0){toast('Sem a pasta do Paciente Zero a gente não sai daqui.');AU.locked();return;}
    const r=ug(g); if(g&&g.id==='bibUni'&&g.open&&!G.flags.uniMeet)later(400,()=>uniMeet()); return r;};
  const op=STORY.onPickup; STORY.onPickup=function(id){if(op)op(id);if(id==='pastaZero'){G.flags.pastaGot=true;G.files.add(DOC15+3);AU.paper();later(500,()=>bark('matheus','s','É isso. Paciente Zero. Bora sair daqui antes que ela escute a gente respirando.'));}};
  // o Edu falava que o Matheus estava no porto
  const ea=STORY.eduArrive; STORY.eduArrive=function(){const s=ea();for(const st of s)if(st.choice)for(const c of st.choice)for(const t of (c.then||[]))if(t.say==='edu'&&/turno no porto/.test(t.t||''))t.t='Ele tava na Universidade de BC, virando a noite no laboratório. Não atende. O último áudio dele era só uma sirene.';return s;};
})();
// a armadilha do shopping (capítulo 2) só depois da Universidade de BC
(function(){const se=STORY.shopEvent;STORY.shopEvent=function(){if(G.flags.uniDone===false){if(!G.ev.uniWarn||G.time-G.ev.uniWarn>8){G.ev.uniWarn=G.time;bark('rafa','s','O Marlon e o Matheus primeiro. A Universidade de BC.');}return;}return se();};})();

// ---------- desenho: túnel, BR, torre, cone do bloco 3 ----------
function drawZoneDeco(){
  const T0=LM.tunel; if(T0&&inV(T0.x,T0.y,120)){ctx.fillStyle='#1a1b1d';ctx.fillRect(tc(4)-16,tc(271)-16,64,192);ctx.fillStyle='#050506';ctx.beginPath();ctx.ellipse(tc(5.5),tc(273.5),20,56,0,0,6.283);ctx.fill();
    ctx.fillStyle='#c8a040';ctx.fillRect(tc(6)-6,tc(270)-10,128,14);ctx.fillStyle='#121110';ctx.font='700 9px sans-serif';ctx.textAlign='left';ctx.fillText('BR-101 · UNIV. DE BC ←',tc(6)-2,tc(270)+1);}
  const Tz=LM.tunelZ; if(Tz&&inV(Tz.x,Tz.y,120)){ctx.fillStyle='#050506';ctx.beginPath();ctx.ellipse(tc(206.5),tc(ZY+61.5),20,56,0,0,6.283);ctx.fill();}
  for(const f of ZFIRES)if(inV(f.x,f.y,80)){for(let i=0;i<3;i++){const a=renderT*7+i*2;ctx.fillStyle=i%2?'rgba(255,140,40,.7)':'rgba(255,200,80,.6)';ctx.beginPath();ctx.ellipse(f.x+Math.sin(a)*4,f.y-6-i*5,12-i*3,16-i*3,0,0,6.283);ctx.fill();}}
}
function drawZoneTop(){
  const t=LM.torre; if(t&&inV(t.x,t.y,200)){ctx.fillStyle='#c8c4bc';ctx.beginPath();ctx.arc(t.x,t.y,46,0,6.283);ctx.fill();ctx.fillStyle='#a8a49c';ctx.beginPath();ctx.arc(t.x,t.y,40,0,6.283);ctx.fill();
    ctx.fillStyle='#1a1a1a';ctx.font='700 12px sans-serif';ctx.textAlign='center';ctx.fillText('UNIV. DE BC',t.x,t.y+4);ctx.fillStyle='#2a5aa0';ctx.fillRect(t.x-10,t.y-20,20,10);}
  const t2=LM.torre2; if(t2&&inV(t2.x,t2.y,200)){ctx.fillStyle='#c8c4bc';ctx.beginPath();ctx.arc(t2.x,t2.y,44,0,6.283);ctx.fill();ctx.fillStyle='#b4b0a8';ctx.beginPath();ctx.arc(t2.x,t2.y,36,0,6.283);ctx.fill();}
  const b3=LM.bloco3; if(b3&&inV(b3.x,b3.y,300)){const bi=bmap[idx((b3.x/TILE)|0,(b3.y/TILE)|0)];const b=buildings[bi];if(b&&b.roofA>.05){ctx.globalAlpha=b.roofA;const cx=(b.x+b.w/2)*TILE,cy=(b.y+b.h/2)*TILE;
    ctx.fillStyle='#bfbab0';ctx.beginPath();ctx.arc(cx,cy,b.w*TILE*.52,0,6.283);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.18)';ctx.lineWidth=2;for(let i=0;i<16;i++){const a=i/16*6.283;ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(a)*b.w*TILE*.52,cy+Math.sin(a)*b.w*TILE*.52);ctx.stroke();}
    ctx.fillStyle='#8a8478';ctx.beginPath();ctx.arc(cx,cy,14,0,6.283);ctx.fill();ctx.globalAlpha=1;}}
}

// ---------- mapa (tecla M) da região oeste ----------
function drawZoneMapTo(c){
  const cx=c.getContext('2d'), w=W, h=HT-ZY, img=cx.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=idx(x,ZY+y),t=map[k],o=(y*w+x)*4;let col=[34,44,30];
    if(t===T.ROAD)col=[70,70,74];else if(t===T.SIDE||t===T.CONC)col=[110,110,106];else if(t===T.WALL)col=[28,28,30];else if(t===T.FOREST||t===T.TREE)col=[16,40,18];else if(t===T.CAR)col=[120,50,40];else if(t===T.RUBBLE)col=[80,64,54];else if(bmap[k]>=0)col=[150,146,136];else if(t===T.SAFE)col=[60,160,90];
    if(!explored[k])col=col.map(v=>v*.35);img.data[o]=col[0];img.data[o+1]=col[1];img.data[o+2]=col[2];img.data[o+3]=255;}
  const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;tmp.getContext('2d').putImageData(img,0,0);
  const s=Math.min(c.width/w,c.height/h),ox=(c.width-w*s)/2,oy=(c.height-h*s)/2; cx.fillStyle='#050606';cx.fillRect(0,0,c.width,c.height);cx.imageSmoothingEnabled=false;cx.drawImage(tmp,ox,oy,w*s,h*s);
  const pt=(L,col,r=4)=>{if(!L)return;cx.fillStyle=col;cx.beginPath();cx.arc(ox+L.x/TILE*s,oy+(L.y/TILE-ZY)*s,r,0,6.283);cx.fill();};
  pt(LM.uniSafe,'#5ac07a');pt(LM.uniBib,'#e8d84a');pt(LM.uniGuarita,'#e8d84a');pt(LM.caculinha,'#7ab8e8');pt(LM.tunelZ,'#d9a33c');
  const o=objective(); if(o&&o.at&&inZonePx(o.at.x,o.at.y))pt(o.at,'#d9a33c',6);
  pt({x:P.x,y:P.y},'#ffffff',5);
  cx.fillStyle='#ddd6c6';cx.font='700 13px sans-serif';cx.textAlign='left';cx.fillText('BR-101 · UNIVERSIDADE DE BC',ox+8,oy+18);cx.fillText('UNIV. DE BC',ox+60*s,oy+50*s);cx.fillText('BR',ox+164*s,oy+40*s);
}
(function(){const pm=UI.paintMap.bind(UI);UI.paintMap=function(){if(!inZone()&&!inSew())return pm();const c=document.getElementById('mapc');if(!c)return pm();
  if(inSew())return pm();
  const wrap=(c.parentElement||c).getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1),cssW=Math.max(200,Math.min(wrap.width-14,560)),cssH=cssW*(HT-ZY)/W;
  c.style.width=cssW+'px';c.style.height=cssH+'px';c.width=Math.round(cssW*d);c.height=Math.round(cssH*d);drawZoneMapTo(c);};})();

// ===================== BRANDT: LUTAS NO QUICK TIME =====================
const BR_COMBOS=[
  {n:'faca',steps:['DESVIA DA FACA!','AGARRA O PULSO!','TORCE O BRAÇO!'],poses:['dodge','grab','twist'],fin:'stab',finT:'CRAVA A FACA DELE NELE MESMO',dmg:.15},
  {n:'desarme',steps:['EMPURRA A ARMA!','COTOVELADA!','ARRANCA A PISTOLA!'],poses:['push','elbow','disarm'],fin:'shoot',finT:'TIRO À QUEIMA-ROUPA',dmg:.17},
  {n:'parede',steps:['BLOQUEIA O SOCO!','JOELHADA!','JOGA ELE NA PAREDE!'],poses:['block','knee','grab'],fin:'slam',finT:'CONTRA A PAREDE',dmg:.14},
  {n:'judo',steps:['PASSA POR BAIXO!','CHAVE DE BRAÇO!','PROJETA ELE NO CHÃO!'],poses:['dodge','twist','grab'],fin:'flip',finT:'QUEDA DE JUDÔ',dmg:.16},
];
const BR_FAIL=[['Ele te deu uma cabeçada.',18],['Ele te derrubou com uma rasteira.',16],['A faca pegou no teu braço.',24],['Ele te jogou contra a parede.',20]];
const QFX={pose:null,fin:null,bars:0};
brandtGrapple=function(e,force){
  AU.roar(); G.shake+=10; buzz([60,30,60]);
  const pool=e.ph===3?BR_COMBOS:e.ph===2?BR_COMBOS.slice(0,3):BR_COMBOS.slice(0,2);
  const c=(force&&BR_COMBOS.find(x=>x.n===force))||pick2(pool.filter(x=>x.n!==e.lastCombo))||pool[0]; e.lastCombo=c.n;
  const steps=c.steps.slice(); if(e.ph===3)steps.splice(1,0,'SEGURA FIRME!');
  later(10,()=>{if(!e.alive||G.flags.brandtDone)return;
    qteStart({label:'',steps,foe:e,kind:'faca',multi:true,ph:e.ph||1,dur:.9,
      onStep:i=>{const pz=c.poses[Math.min(i,c.poses.length-1)];QFX.pose={k:pz,t:0,e};G.hs=Math.max(G.hs||0,.22);AU.hit();if(pz==='elbow'||pz==='knee'){AU.thud(.8);bloodBurst(e.x,e.y,5,Math.atan2(e.y-P.y,e.x-P.x));}},
      onOk:()=>brandtFinisher(e,c),
      onFail:()=>{const f=pick2(BR_FAIL),a=Math.atan2(P.y-e.y,P.x-e.x);P.inv=0;hurtPlayer(f[1],e.x,e.y);move(P,Math.cos(a)*34,Math.sin(a)*34,false);bloodBurst(P.x,P.y,10,a);toast(f[0]);e.rushCd=4;e.smokeCd=Math.min(e.smokeCd,1);
        later(300,()=>{if(!G.flags.brandtDone)brSay(pick2(['Devagar demais.','Na próxima é no pescoço.','Achou que ia ser fácil?','Eu treinei vinte anos pra isso, garoto.']),'a');});}});});
};
function brandtFinisher(e,c){
  const a=Math.atan2(e.y-P.y,e.x-P.x); QFX.fin={k:c.fin,t:0,dur:.7,e,sx:e.x,sy:e.y,a,txt:c.finT};
  G.hs=Math.max(G.hs||0,.5); QFX.bars=1;
  floaters.push({x:P.x,y:P.y-30,t:c.finT,life:1.4});
  if(c.fin==='shoot'){AU.shot('magnum');G.muzzle={x:P.x+Math.cos(a)*14,y:P.y+Math.sin(a)*14,t:.08,c:'shot'};}
  later(380,()=>{if(!e.alive)return;brandtHurt(e,e.max*c.dmg,true);bloodBurst(e.x,e.y,18,a);AU.splat();AU.thud(1);G.shake+=14;e.stun=2.8;
    if(!G.flags.brandtDone)later(400,()=>{if(!G.flags.brandtDone)brSay(pick2(BR_TAUNT.hurt),'a');});
    if(!G.flags.brKickTip){G.flags.brKickTip=true;later(900,()=>toast(IN.touch?'Ele tá tonto! Chegue perto e toque em USAR para chutar.':'Ele tá tonto! Chegue perto e aperte E para chutar.'));}});
}
function qfxTick(dt){
  if(QFX.pose){QFX.pose.t+=dt;const p=QFX.pose,e=p.e;if(e&&p.t<.25){const a=Math.atan2(e.y-P.y,e.x-P.x),k=Math.sin(p.t/.25*Math.PI);const push=p.k==='push'||p.k==='knee'||p.k==='elbow'?6:p.k==='dodge'?-4:2;e.x+=Math.cos(a)*push*k*dt*20;e.y+=Math.sin(a)*push*k*dt*20;}if(p.t>.4)QFX.pose=null;}
  const f=QFX.fin; if(f){f.t+=dt;const e=f.e,k=clamp(f.t/f.dur,0,1);
    if(f.k==='flip'){const r=34,ang=f.a+Math.PI*k;e.x=P.x+Math.cos(ang)*r;e.y=P.y+Math.sin(ang)*r;e.face=ang+Math.PI;}
    else if(f.k==='slam'){const d=castRay(P.x,P.y,f.a,180,BULLET_BLOCK,false)-14;e.x=P.x+Math.cos(f.a)*lerp(30,Math.max(30,d),k*k);e.y=P.y+Math.sin(f.a)*lerp(30,Math.max(30,d),k*k);}
    else if(f.k==='stab'||f.k==='shoot'){e.x=f.sx+Math.cos(f.a)*30*k;e.y=f.sy+Math.sin(f.a)*30*k;}
    const tx=(e.x/TILE)|0,ty=(e.y/TILE)|0; if(SOLID[getT(tx,ty)]){e.x=f.sx;e.y=f.sy;}
    if(f.t>=f.dur)QFX.fin=null;}
  if(G.qte||QFX.fin)QFX.bars=Math.min(1,QFX.bars+dt*4);else QFX.bars=Math.max(0,QFX.bars-dt*3);
}
function drawQFX(){
  if(QFX.bars>0&&G.mode==='play'){ctx.setTransform(dpr,0,0,dpr,0,0);const h=view.h*.08*QFX.bars;ctx.fillStyle='#000';ctx.fillRect(0,0,view.w,h);ctx.fillRect(0,view.h-h,view.w,h);}
  const p=QFX.pose,f=QFX.fin; if(!p&&!f)return; const z=view.z;
  ctx.setTransform(dpr*z,0,0,dpr*z,-cam.x*z*dpr,-cam.y*z*dpr);
  if(p&&p.e){const e=p.e,a=Math.atan2(e.y-P.y,e.x-P.x),k=clamp(p.t/.25,0,1);
    ctx.strokeStyle=`rgba(255,240,200,${(1-k)*.9})`;ctx.lineWidth=3;ctx.lineCap='round';
    if(p.k==='knee'||p.k==='elbow'||p.k==='push'){ctx.beginPath();ctx.moveTo(P.x+Math.cos(a)*8,P.y+Math.sin(a)*8);ctx.lineTo(P.x+Math.cos(a)*(14+k*16),P.y+Math.sin(a)*(14+k*16));ctx.stroke();
      ctx.fillStyle=`rgba(255,230,160,${1-k})`;for(let i=0;i<6;i++){const b=i/6*6.283;ctx.beginPath();ctx.moveTo(e.x,e.y);ctx.lineTo(e.x+Math.cos(b)*(6+k*14),e.y+Math.sin(b)*(6+k*14));ctx.lineTo(e.x+Math.cos(b+.3)*4,e.y+Math.sin(b+.3)*4);ctx.fill();}}
    else{ctx.beginPath();ctx.arc(P.x,P.y,22,a-1.2+k*1.6,a-.4+k*1.6);ctx.stroke();}}
  if(f&&f.e){const e=f.e;if(f.k==='stab'){ctx.strokeStyle='#e8ecec';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(e.x,e.y);ctx.stroke();}
    if(f.k==='flip'){ctx.strokeStyle='rgba(255,240,200,.5)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(P.x,P.y,34,f.a,f.a+Math.PI*clamp(f.t/f.dur,0,1));ctx.stroke();}
    if(f.k==='slam'&&f.t>f.dur*.8){ctx.fillStyle='rgba(255,230,160,.6)';ctx.beginPath();ctx.arc(e.x,e.y,18,0,6.283);ctx.fill();}}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(f){ctx.font=`700 ${Math.round(22*(1+.1*Math.sin(f.t*20)))}px ${FONT_UI}`;ctx.textAlign='center';ctx.fillStyle='#d9a33c';ctx.fillText(f.txt,view.w/2,view.h*.2);}
}
// retrato novo do Brandt: capacete, óculos de visão noturna levantado, balaclava, cicatriz, fone
PXH.brandt={hw:58,hh:72,body:['#1a1c1f','#08090a'],
  clothes(c,cx,H2){c.fillStyle='#24272b';c.fillRect(64,222,152,H2-222);c.fillStyle='#2e3236';for(const x of [84,124,164])c.fillRect(x,244,28,34);c.fillStyle='#3a3e44';for(const x of [84,124,164])c.fillRect(x,244,28,5);
    c.fillStyle='#d8d4c8';c.beginPath();c.moveTo(196,236);c.lineTo(206,254);c.lineTo(216,236);c.lineTo(211,236);c.lineTo(206,246);c.lineTo(201,236);c.closePath();c.fill();
    c.strokeStyle='#3a3e44';c.lineWidth=6;c.beginPath();c.moveTo(66,230);c.lineTo(214,300);c.stroke();c.fillStyle='#4a4e52';c.fillRect(74,262,8,40);c.fillStyle='#8a8e92';c.fillRect(76,252,4,12);},
  back(c,cx,cy,hw){c.fillStyle='#2a2d31';c.beginPath();c.ellipse(cx,cy-24,hw+20,hw+14,0,Math.PI,0);c.fill();},
  hair(c,cx,cy,hw,hh){ // capacete
    c.fillStyle='#2a2e32';c.beginPath();c.moveTo(cx-hw-12,cy-6);c.bezierCurveTo(cx-hw-16,cy-hh-34,cx+hw+16,cy-hh-34,cx+hw+12,cy-6);c.lineTo(cx+hw+6,cy-16);c.quadraticCurveTo(cx,cy-38,cx-hw-6,cy-16);c.closePath();c.fill();
    c.fillStyle='#363b40';c.fillRect(cx-hw-10,cy-30,hw*2+20,8);c.strokeStyle='rgba(255,255,255,.06)';c.lineWidth=2;c.beginPath();c.arc(cx,cy-30,hw+6,Math.PI*1.15,Math.PI*1.85);c.stroke();
    // óculos de visão noturna levantados
    c.fillStyle='#16181a';c.fillRect(cx-26,cy-hh-26,52,18);c.fillStyle='#0a0b0c';for(const s of [-1,1]){c.beginPath();c.arc(cx+s*13,cy-hh-17,9,0,6.283);c.fill();}c.fillStyle='rgba(80,200,90,.5)';for(const s of [-1,1]){c.beginPath();c.arc(cx+s*13,cy-hh-17,3,0,6.283);c.fill();}
    c.fillStyle='#1a1c1f';c.fillRect(cx+hw+4,cy-14,12,30);c.fillStyle='#3a3e44';c.fillRect(cx+hw+2,cy+14,8,18);},
  over(c,cx,cy,ey,ex){ // balaclava até o nariz
    c.fillStyle='#1a1c1f';c.beginPath();c.moveTo(cx-66,ey+16);c.lineTo(cx+66,ey+16);c.lineTo(cx+60,ey+110);c.quadraticCurveTo(cx,ey+130,cx-60,ey+110);c.closePath();c.fill();
    c.strokeStyle='rgba(255,255,255,.05)';c.lineWidth=2;for(let y=ey+22;y<ey+110;y+=7){c.beginPath();c.moveTo(cx-58,y);c.lineTo(cx+58,y);c.stroke();}
    c.strokeStyle='#8a4a3a';c.lineWidth=2.5;c.beginPath();c.moveTo(cx-ex-22,ey-20);c.lineTo(cx-ex-6,ey+10);c.stroke();c.beginPath();c.moveTo(cx-ex-18,ey-12);c.lineTo(cx-ex-12,ey-14);c.stroke();}};
// boneco visto de cima, mais detalhado
drawBrandt=function(e){
  const va=(e.va??1)*(e.fade??1); if(va<=.02)return; const a=e.face, wk=e.anim*(e.moving?9:2);
  ctx.save(); ctx.globalAlpha=va; ctx.translate(e.x,e.y); ctx.rotate(a);
  ctx.fillStyle='rgba(0,0,0,.42)';ctx.beginPath();ctx.ellipse(1,3,15,11,0,0,6.283);ctx.fill();
  const l=Math.sin(wk)*4;ctx.fillStyle='#0c0d0f';ctx.fillRect(-7+l,-9,10,5);ctx.fillRect(-7-l,4,10,5);
  ctx.fillStyle=e.flash>0?'#fff':'#1b1e22';ctx.beginPath();ctx.ellipse(0,0,10.5,12.5,0,0,6.283);ctx.fill();
  ctx.fillStyle='#2b2f34';ctx.fillRect(-7,-9.5,11,19);ctx.fillStyle='#3a3f45';for(const y of [-7,-2,3])ctx.fillRect(-5,y,7,3.4);
  ctx.fillStyle='#d8d4c8';ctx.fillRect(-2,-11.5,4,2.2);   // o "V" da Vértice no ombro
  ctx.fillStyle='#4a4e52';ctx.fillRect(-9,6,6,2.2);         // bainha da faca
  const aim=e.mode==='aim'||e.mode==='burst', melee=e.mode==='rush'||(G.qte&&G.qte.foe===e);
  ctx.fillStyle='#1b1e22';ctx.fillRect(4,aim?-3.5:4,12,4.2);ctx.fillRect(4,aim?.8:-8,9,4.2);
  if(melee){ctx.strokeStyle='#e0e4e4';ctx.lineWidth=2.2;ctx.beginPath();ctx.moveTo(14,-4);ctx.lineTo(25,-7);ctx.stroke();}
  else{ctx.fillStyle='#08090a';ctx.fillRect(12,-2.2,14,4.4);ctx.fillRect(14,1.5,3,4.5);ctx.fillStyle='#2a2d31';ctx.fillRect(22,-1.4,4,2.8);}
  // capacete com o óculos de visão noturna
  ctx.fillStyle='#24282c';ctx.beginPath();ctx.arc(2,0,6.8,0,6.283);ctx.fill();ctx.fillStyle='#363b40';ctx.beginPath();ctx.arc(2,0,6.8,-1.1,1.1);ctx.lineTo(2,0);ctx.fill();
  ctx.fillStyle='#0e1012';ctx.fillRect(5,-3.2,4,6.4);ctx.fillStyle=e.light?'rgba(255,240,200,.9)':'rgba(80,220,100,.85)';ctx.fillRect(8,-2.4,1.6,1.8);ctx.fillRect(8,.6,1.6,1.8);
  ctx.restore();
};

// ===================== AMIGOS: JEITO DE CADA UM =====================
(function(){
  const cc=compChat;
  compChat=function(id){
    const F=G.flags;
    if(id==='edu')return rpick(F.matFollow?['Matheus, para de falar.','Hm.','Ótimo. Mais escuro ainda.','Se o Richard pegar no teu pé de novo, eu deixo.','...','Bela noite pra morrer.']
      :['Hm.','Fala baixo.','Ótimo. Mais zumbi.','...','Lindo. Muito lindo.','Eu tô bem. Não pergunta de novo.']);
    if(id==='matheus'&&F.uniMat&&!F.hospLock)return rpick(['Richard, se tu falar dos óculos de novo eu te largo aqui.','Eu não tô com medo. Eu tô... atento.','O Marlon me deve uma coca. Eu sei que não é hora.','Mano, eu tava estudando. ESTUDANDO. Numa sexta.','Para de rir, Richard.']);
    return cc(id);
  };
})();
const ZOEIRA=[
  [['rafa','h','Matheus, tu tá tremendo ou é o frio?'],['matheus','a','É o frio, Richard. Tá 28 graus.']],
  [['rafa','h','Matheus, se tu virar zumbi, posso ficar com teu fone?'],['matheus','a','NÃO.'],['edu','n','Eu fico com o fone.']],
  [['rafa','h','Ô Matheus, tu ainda deve pastel pra Dona Neusa, né?'],['matheus','a','Todo mundo sabe da minha vida nessa faculdade?']],
  [['rafa','h','Matheus, anda mais rápido. Os zumbi tão passando tu.'],['matheus','a','Richard, eu juro por Deus.']],
  [['rafa','h','Matheus, tu é o único que corre igual pinguim.'],['matheus','a','Eu tô de chinelo, Richard!'],['edu','n','Ele tá de chinelo mesmo.']],
];
function zoeiraTick(dt){
  const F=G.flags; if(!F.matFollow||CUT.on||BARK.cur||BARK.q.length)return; if(enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<500))return;
  G.ev.zoeT=(G.ev.zoeT??60)-dt; if(G.ev.zoeT>0)return; G.ev.zoeT=rr(90,150);
  const z=ZOEIRA[(F.zoeI=(F.zoeI||0)+1)%ZOEIRA.length]; for(const [w,m,t] of z){if(w==='edu'&&!F.eduFollow)continue;bark(w,m,t,{dur:2.4});}
}
// o Nicolas, pelo rádio (ele é de esquerda e não deixa ninguém esquecer)
const NICO_R=['Isso aí tem nome, Richard: uma empresa privada soltou uma praga numa cidade inteira e o Estado chamou de "gripe". É o capitalismo de desastre ao vivo.',
  'A Vértice recebe isenção fiscal desde 2019. Eu tenho os PDFs. Se a gente sobreviver, eu mando pra todo mundo.',
  'Repara que o helicóptero da Vértice vai buscar a amostra antes das pessoas. Sempre foi assim, só que agora com zumbi.',
  'Eu sei que é hora errada pra falar de reforma agrária. Mas a fazenda da Vértice em Navegantes é do tamanho de um bairro.'];
function nicoRadioTick(dt){
  const F=G.flags; if(!F.nicoMet||F.inibidorDone&&F.hospOut||CUT.on||BARK.cur)return;
  G.ev.nicoT=(G.ev.nicoT??200)-dt; if(G.ev.nicoT>0)return; G.ev.nicoT=rr(240,360);
  const i=(F.nicoR=(F.nicoR||0))%NICO_R.length; F.nicoR=i+1; AU.radio(); bark('nico','n',NICO_R[i],{radio:true});
  if(F.eduFollow)later(5200,()=>bark('edu','n','Ele não desliga nunca, né.'));
}

// ===================== MAIS TERROR =====================
function forceFall(){
  if(EV.fall)return false;
  for(let i=0;i<60;i++){const a=Math.random()*6.283,d=rr(110,220),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;
    if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]]||bmap[idx(tx,ty)]>=0)continue;let wall=false;for(const [dx,dy] of DIRS4)if(map[idx(tx+dx,ty+dy)]===T.WALL)wall=true;if(!wall)continue;
    EV.fall={x:tc(tx),y:tc(ty),t:1.1,rise:rr(5,8),landed:false};AU.scream(clamp(1-d/500,.4,1));return true;}
  return false;
}
const DRAG=[];
function evDragged(){
  const sp=evSpot(260,420,null,true); if(!sp)return false;
  const p=spawnSurvivor(sp,0,{st:'flee'}); p.drag={t:0,a:Math.random()*6.283}; DRAG.push(p);
  AU.scream(1); bark('rafa','s','Tem alguém ali! Ele tá correndo pra cá—');
  return true;
}
function dragTick(dt){
  for(let i=DRAG.length-1;i>=0;i--){const p=DRAG[i];if(!p.alive||!p.drag){DRAG.splice(i,1);continue;}p.drag.t+=dt;
    if(p.drag.t>1.6&&!p.drag.g){p.drag.g=true;p.st='cutcrawl';p.prone=true;p.moving=false;AU.roar();AU.scream(1);G.shake+=4;psyFloat(p.x,p.y,'NÃÃÃO! ME SOLTA!',{life:2,c:'#e8a0a0',size:14});}
    if(p.drag.g){const a=p.drag.a;p.x+=Math.cos(a)*90*dt;p.y+=Math.sin(a)*90*dt;if(Math.random()<dt*20)addDecal({k:'blood',x:p.x,y:p.y,r:rr(6,12),rot:0,seed:Math.random()});
      const tx=(p.x/TILE)|0,ty=(p.y/TILE)|0;if(p.drag.t>3.4||SOLID[getT(tx,ty)]){p.alive=false;p.gone=true;AU.splat();AU.scream(.5);DRAG.splice(i,1);later(800,()=>bark('rafa','t',pick2(['Puxaram ele pra dentro do escuro. Eu não vi o que era.','Sumiu. Só ficou o rastro de sangue.','Eu não consegui fazer nada. Nada.'])));}}}
}
// gente presa embaixo de carro: dá pra tentar tirar
const PINNED=[];
function evPinned(){
  const sp=evSpot(260,420,null,true); if(!sp)return false; const tx=(sp.x/TILE)|0,ty=(sp.y/TILE)|0; if(getT(tx,ty)!==T.ROAD&&getT(tx,ty)!==T.SIDE)return false;
  const it={tx,ty,x:tc(tx),y:tc(ty),type:'presoCarro',t:0,life:55,col:pick2(CAR_COLS)}; interacts.push(it); PINNED.push(it);
  AU.scream(.8); psyFloat(it.x,it.y,'SOCORRO! MINHA PERNA! TEM ALGUÉM AÍ?',{life:3,c:'#e8c0a0',size:13});
  later(1200,()=>bark('rafa','s','Tem alguém preso embaixo daquele carro... gritando.'));
  return true;
}
Object.assign(INT_LABEL,{presoCarro:'Levantar o carro',tunelBR:'Túnel sob a BR-101 (Universidade de BC)',tunelVolta:'Túnel de volta para Balneário',fogueira:'Fogueira dos surfistas',painelRoda:'Painel da roda-gigante',luzCristo:'Quadro de luz do Cristo'});
function pinnedTick(dt){
  for(let i=PINNED.length-1;i>=0;i--){const it=PINNED[i];it.t+=dt;
    if(it.t>it.life&&!it.saved){const k=interacts.indexOf(it);if(k>=0)interacts.splice(k,1);PINNED.splice(i,1);if(G.struggle&&G.struggle.keep==='pin'+it.tx+'_'+it.ty)G.struggle=null;if(hyp(it.x-P.x,it.y-P.y)<700){AU.scream(.7);bark('rafa','t','Os gritos pararam.');}addDecal({k:'blood',x:it.x,y:it.y,r:28,rot:0,seed:.5});continue;}
    if(Math.random()<dt*.25&&hyp(it.x-P.x,it.y-P.y)<600)psyFloat(it.x,it.y,pick2(['Por favor... eu tenho filha...','Tá vindo! TÁ VINDO!','Não me deixa aqui!','Eu ouvi teu passo, eu sei que tu tá aí!']),{life:2.4,c:'#e8c0a0',size:12});
    if(it.t>it.life*.45&&!it.horde){it.horde=true;spawnRing(3,'zumbi',300,460,true);}}
}
function drawPinned(){for(const it of PINNED){if(!inV(it.x,it.y,60))continue;ctx.save();ctx.translate(it.x,it.y);ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(-26,-12,56,30);ctx.fillStyle=it.col;ctx.fillRect(-28,-14,56,28);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-14,-12,28,24);
  ctx.fillStyle='#c8a890';ctx.beginPath();ctx.arc(-34,6+Math.sin(renderT*9)*1.5,5,0,6.283);ctx.fill();ctx.strokeStyle='#c8a890';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-34,6);ctx.lineTo(-44,0+Math.sin(renderT*7)*4);ctx.stroke();ctx.restore();}}
function pinnedUse(it){
  if(it.saved)return;
  startStruggle({label:'Levantando o carro',need:100,pump:9,hold:13,noise:420,sfx:'creak',x:P.x,y:P.y,keep:'pin'+it.tx+'_'+it.ty,onDone:()=>{if(!PINNED.includes(it))return;it.saved=true;const k=interacts.indexOf(it);if(k>=0)interacts.splice(k,1);PINNED.splice(PINNED.indexOf(it),1);
    const p=spawnSurvivor({x:it.x-30,y:it.y},0,{st:'flee'});p.saved=true;bark('rafa','h','Saiu! Corre, corre pro abrigo!');later(900,()=>psyFloat(p.x,p.y,'Obrigado... obrigado!',{life:2,c:'#c8e0c0',size:13}));
    const id=pick2(['m9','ervaV','gran','pecas','pilha']);const l=invAdd(id,id==='m9'?10:1);if(l)boxAdd(id,l);toast(`Ele te deu ${ITEMS[id].n.toLowerCase()} antes de fugir.`);ach('preso');}});
}
function terrorTick(dt){
  const F=G.flags; if(CUT.on||inSew()||P.inCar||G.wave>0||G.heli)return;
  const pd=dAt((P.x/TILE)|0,(P.y/TILE)|0), urban=(pd>=5&&pd<=7)||pd===1||pd===10;
  // a primeira queda de prédio é garantida no caos de Balneário
  if(F.caos>=1&&pd>=5&&pd<=7&&!F.fallSeen&&isNight()&&evOK(30)){G.ev.ff=(G.ev.ff||0)+dt;if(G.ev.ff>25&&forceFall()){F.fallSeen=true;evMark();}}
  G.ev.terT=(G.ev.terT??rr(80,120))-dt; if(G.ev.terT>0||!urban)return; G.ev.terT=rr(110,170);
  if(!evOK(50)||enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<420))return;
  const r=Math.random(); let ok=false;
  if(r<.4)ok=evPinned(); else if(r<.75)ok=evDragged(); else ok=forceFall();
  if(ok)evMark();
}

// ===================== BRAVA: O ACAMPAMENTO DOS SURFISTAS =====================
(function(){
  const g=genV12; genV12=function(){g();
    let sp=null; for(let y=104;y<126&&!sp;y++)for(let x=178;x<200;x++){if(getT(x,y)===T.SAND&&getT(x+1,y)===T.SAND&&getT(x,y+1)===T.SAND&&getT(x-1,y)===T.SAND){sp=[x,y];break;}}
    if(!sp)return; const [x,y]=sp; addInteract(x,y,'fogueira',27); LM.surfCamp={x:tc(x),y:tc(y)};
    lights.push({x:tc(x),y:tc(y),r:170,c:'fire',f:1});
    for(const [id,nm,dx,col,hair] of [['kadu','Kadu',-2,'#2a8aa0','#c8a060'],['bia','Bia',2,'#e8a040','#2a1a10']]){const [nx,ny]=freeTileNear(x+dx,y+1,false);npcs.push({id,name:nm,look:null,x:tc(nx),y:tc(ny),col,hair,skin:'#c8906a',ang:-Math.PI/2,cond:()=>!G.flags.surfGone});}
  };
})();
Object.assign(PCH,{
  kadu:{name:'Kadu',skin:'#c8906a',shade:'#9a6a4a',hair:'#c8a060',iris:'#3a2a18',bg:['#0e2a32','#03090c'],glow:'90,190,210',voice:160},
  bia:{name:'Bia',skin:'#c8906a',shade:'#9a6a4a',hair:'#2a1a10',iris:'#3a2a18',bg:['#3a2410','#120a04'],glow:'240,170,80',voice:225},
});
STORY.surf=function(n){
  const F=G.flags;
  if(F.surfGone)return;
  if(F.surfTalk)return bark(n.id,'h',pick2(['Senta aí, mano. Ninguém sobe a Brava de noite.','O mar tá parado... mas a onda das seis vai vir. Sempre vem.','A gente toca mais uma e depois dorme.']));
  F.surfTalk=true;
  playCut([{npc:n,id:n.id},
    {say:'kadu',m:'h',t:'Opa, opa. Calma, guerreiro. Aqui é paz. Senta, a fogueira é de todo mundo.'},
    {say:'bia',m:'n',t:'A gente tá na areia desde o pôr do sol. Eles não gostam da água. Nem de fogo.'},
    {say:'rafa',m:'s',t:'Vocês tão tocando violão. No meio disso.'},
    {say:'kadu',m:'h',t:'Mano, se o mundo vai acabar, que acabe com um Charlie Brown Jr.'},
    ...(F.eduFollow?[{say:'edu',m:'n',t:'...Justo.'}]:[]),
    {say:'bia',m:'n',t:'Leva isso. A gente pegou no quiosque antes de tudo virar.'},
    {do:()=>{for(const [id,q] of [['calmante',1],['ervaV',1],['virote',4]]){const l=invAdd(id,q);if(l)boxAdd(id,l);}AU.pickup();toast('Os surfistas te deram um calmante, uma erva e virotes.');}}],
    ()=>{toast('Perto da fogueira o medo baixa.');});
};
(function(){const sn=STORY.npc;STORY.npc=function(n){if(n&&(n.id==='kadu'||n.id==='bia'))return STORY.surf(n);return sn(n);};})();
function surfTick(dt){
  const F=G.flags, c=LM.surfCamp; if(!c)return;
  // na volta, o acampamento caiu
  if(F.inibidorDone&&!F.surfGone){F.surfGone=true;GORE.push({k:'corpse',x:c.x-40,y:c.y+30,rot:1,type:'zumbi',col:'#2a8aa0',skin:'#c8906a',r:11});GORE.push({k:'blood',x:c.x-30,y:c.y+28,r:30,rot:0,seed:.3});GORE.push({k:'scorch',x:c.x,y:c.y,r:50,rot:0,seed:.6});}
  if(!F.surfGone&&hyp(P.x-c.x,P.y-c.y)<220){G.fear=Math.max(0,(G.fear||0)-dt*.25);G.ev.guitT=(G.ev.guitT||0)-dt;if(G.ev.guitT<=0){G.ev.guitT=.42;const n=[196,247,294,247,220,262,330,262][((G.time*2.4)|0)%8];AU.tn(n,n*.99,.5,'triangle',.025*clamp(1-hyp(P.x-c.x,P.y-c.y)/220,0,1));}}
}

// ===================== RODA-GIGANTE E CRISTO LUZ =====================
(function(){
  const g=genV12; genV12=function(){g();
    if(LM.roda){const [x,y]=freeTileNear(((LM.roda.x/TILE)|0)-6,((LM.roda.y/TILE)|0)+5,false);addInteract(x,y,'painelRoda',37);LM.painelRoda={x:tc(x),y:tc(y)};}
    const cap=buildings.find(b=>b.name==='Capela do Cristo Luz'); if(cap){const [x,y]=freeTileNear(cap.x+cap.w-2,cap.y+1,false);addInteract(x,y,'luzCristo',37);LM.luzCristo={x:tc(x),y:tc(y)};}
  };
})();
function rodaTick(dt){
  const F=G.flags; if(!LM.roda||F.rodaDone)return; if(!(F.caos>=1))return;
  if(hyp(P.x-LM.roda.x,P.y-LM.roda.y)<700&&Math.random()<dt*.15){psyFloat(LM.roda.x,LM.roda.y-160,pick2(['SOCORRO! AQUI EM CIMA!','A RODA PAROU! ME TIRA DAQUI!','Tem alguém aí embaixo?!']),{life:2.6,c:'#e8c0a0',size:13});if(!F.rodaHeard){F.rodaHeard=true;later(600,()=>bark('rafa','s','Tem alguém preso lá em cima da roda-gigante... na cabine do topo.'));}}
}
function rodaUse(){
  const F=G.flags; if(F.rodaDone)return toast('A roda está parada. A cabine de baixo está aberta e vazia.');
  if(!(F.caos>=1))return toast('O painel da roda-gigante. Ninguém para pedir ajuda. Ainda.');
  startStruggle({label:'Religando a roda-gigante',need:100,pump:12,hold:18,noise:900,sfx:'creak',x:P.x,y:P.y,keep:'rodaP',onDone:()=>{
    F.rodaDone=true;AU.alarm();AU.creak(1);spawnRing(4,'corr',380,560,true);
    playCut([{cam:{x:LM.roda.x,y:LM.roda.y},t:1.2},{sfx:'creak',v:1},{wait:1},
      {say:'rafa',m:'s',t:'Tá descendo... tá descendo! Vem, vem!'},
      {say:'lauro',m:'s',t:'Seis horas lá em cima, rapaz. Seis horas vendo a cidade pegar fogo.'},
      {say:'lauro',m:'n',t:'Eu sou o operador. Fiquei preso na cabine de manutenção. Toma, era pra segurança do parque.'},
      {do:()=>{const l=invAdd('m357',6);if(l)boxAdd('m357',l);AU.pickup();toast('O Seu Lauro te deu munição .357.');ach('roda');}},
      {say:'lauro',m:'t',t:'E corre. O barulho da roda chamou a avenida inteira.'},{camFree:1}]);}});
}
PCH.lauro={name:'Seu Lauro',skin:'#d0a080',shade:'#9a7050',hair:'#d8d4cc',iris:'#3a2a18',bg:['#2a1420','#0c0508'],glow:'240,120,160',voice:110};
function cristoUse(){
  const F=G.flags; if(F.cristoLuz)return toast('O Cristo está aceso. Dá pra ver de Itajaí.');
  F.cristoLuz=true; AU.thud(1); AU.unlock(); G.light=Math.max(G.light,.4); G.shake+=4;
  bark('rafa','s','Acendeu! O Cristo Luz tá aceso... dá pra ver de qualquer lugar da cidade.');
  later(5000,()=>{sonia('Richard?! O Cristo acendeu! Eu tô vendo daqui do prédio! Foi tu? ...Foi tu, né. Eu sabia.','h');});
  later(13000,()=>{const l=invAdd('sinal',2);if(l)boxAdd('sinal',l);toast('Encontrou dois sinalizadores no quadro.');ach('cristo');});
}
function drawCristoGlow(){if(!G.flags.cristoLuz||!LM.cristo||!inV(LM.cristo.x,LM.cristo.y,500))return;const g=ctx.createRadialGradient(LM.cristo.x,LM.cristo.y,10,LM.cristo.x,LM.cristo.y,260);g.addColorStop(0,`rgba(255,240,200,${.35+.05*Math.sin(renderT*2)})`);g.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(LM.cristo.x,LM.cristo.y,260,0,6.283);ctx.fill();}
(function(){
  const vi=v12Interact; v12Interact=function(o){
    switch(o.type){
      case 'tunelBR':return goZone(true);
      case 'tunelVolta':return goZone(false);
      case 'presoCarro':return pinnedUse(o);
      case 'fogueira':return toast(G.flags.surfGone?'A fogueira apagou. A areia está revirada.':'A fogueira estala. Por um minuto, parece uma noite normal.');
      case 'painelRoda':return rodaUse();
      case 'luzCristo':return cristoUse();
    }
    return vi(o);};
})();
if(typeof ACH!=='undefined')ACH.push({id:'univali',n:'Turma reunida',d:'Encontre o Marlon e o Matheus na Universidade de BC.'},{id:'preso',n:'Mão amiga',d:'Tire alguém de baixo de um carro.'},{id:'roda',n:'Volta completa',d:'Desça o Seu Lauro da roda-gigante.'},{id:'cristo',n:'Luz no morro',d:'Acenda o Cristo Luz.'});

// ===================== GANCHOS =====================
(function(){
  const vt=v16Tick;
  v16Tick=function(dt){
    vt(dt); qfxTick(G.mode==='play'?dt:0);
    if(G.mode!=='play'||CUT.on)return;
    const F=G.flags, pd=dAt((P.x/TILE)|0,(P.y/TILE)|0);
    if(F.v7&&!F.inibidorDone&&F.uniDone==null&&pd>=5&&pd<=7&&!G.qte)STORY.uniCall();
    if(F.uniMeet&&!F.uniDone&&!G.ev.uniWave&&!CUT.on)uniAfter();
    uniWaveTick(dt); zoeiraTick(dt); nicoRadioTick(dt); terrorTick(dt); dragTick(dt); pinnedTick(dt); surfTick(dt); rodaTick(dt);
    if(F.uniDone&&!F.ademirGone&&inZone()&&LM.uniGuarita&&hyp(P.x-LM.uniGuarita.x,P.y-LM.uniGuarita.y)>500){F.ademirGone=true;const e=makeEnemy('zumbi',LM.uniGuarita.x,LM.uniGuarita.y,'ademirZ');e.col='#2a3a5a';enemies.push(e);}
  };
  const dp=drawParts; drawParts=function(){drawZoneDeco();drawPinned();dp();};
  const dl=drawLandmarks; drawLandmarks=function(){dl();drawZoneTop();drawCristoGlow();};
  const ds=drawPsy; drawPsy=function(){ds();drawQFX();};
  const rs=resetState; resetState=function(d){rs(d);DRAG.length=0;PINNED.length=0;QFX.pose=QFX.fin=null;QFX.bars=0;};
  const aws=applyWorldState; applyWorldState=function(){aws();const F=G.flags;if(F.uniDone){const mu=npcs.find(x=>x.id==='marlonU');if(mu)mu.cond=()=>false;}if(G.ev)G.ev.uniWave=null;if(F.uniMeet&&!F.uniDone){F.uniDone=true;F.matheusJoin=true;F.matFollow=true;F.uniMat=true;F.marlonMet=true;}
    const g=gates.find(x=>x.id==='bibUni');if(g&&F.uniMeet&&!g.open)openGate(g);};
  // pular na história: depois da Universidade de BC, o Matheus já está junto
  const dj=dbgJump; dbgJump=function(k){
    if(k==='univali'){dj('bc2');const F=G.flags;F.uniDone=false;F.zoneSeen=true;P.x=LM.zoneIn.x;P.y=LM.zoneIn.y;for(const c of (G.comps||[])){c.x=P.x-20;c.y=P.y;}snapCamera();flowTile=-1;return;}
    if(k==='uniBib'){dbgJump('univali');invAdd('chaveUni',1);G.flags.ademirTalk=true;const b=LM.uniBib;P.x=b.x;P.y=b.y+40;snapCamera();flowTile=-1;return;}
    dj(k);
    const steps=['posto','caos','laranj','brava','gerador','bc2','shop','itajai','hosp','porto','navio'],n=steps.indexOf(k);
    if(n>=6||k==='hospIn'||k==='hospSaida'||k==='final'){const F=G.flags;F.uniDone=true;F.uniMeet=true;F.uniMat=true;F.marlonMet=true;F.matheusJoin=true;if(n>=7||k==='hospIn'||k==='hospSaida'||k==='final'){F.matFollow=true;}if(n>=9||k==='hospSaida'||k==='final')F.pastaGot=true;syncComps();const g=gates.find(x=>x.id==='bibUni');if(g&&!g.open)openGate(g);}
  };
})();
