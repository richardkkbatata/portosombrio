// ===================== 1.12 · CAMBORIÚ: A CONGREGAÇÃO DO CERVO =====================
// Capítulo da história principal, depois da Universidade de BC. O Richard vai SOZINHO (Edu e Matheus
// ficam na Caçulinha do Marlon). Em Camboriú não tem zumbi: tem um culto, a Congregação do Cervo,
// que adora o Espécime T-03 da Vértice ("o Cervo"). O Nicolas aparece aqui pela primeira vez (o encontro
// na Brava saiu): ele está no morro com o rifle de precisão do irmão, que os cultistas levaram.
// Vai e volta de itens no estilo Resident Evil clássico: 3 selos abrem a Igreja Matriz.
// O mapa usa as linhas NY..HT-1 (as mesmas do capítulo da Sonia, que redesenha tudo quando começa).
// Tudo que é daqui tem uid/id começando com "cb" (pickups, portões, NPCs, inimigos).

const CBY=NY;
const cbY=y=>CBY+y;
function cbOn(){return !(typeof SN!=='undefined'&&SN.on)&&!(typeof RC!=='undefined'&&RC.on);}
function inCbTile(ty){return ty>=CBY&&cbOn();}
function inCb(){return inCbTile((P.y/TILE)|0);}
function inCbPx(x,y){return inCbTile((y/TILE)|0);}
// a "zona" da Universidade vai só até antes de Camboriú
{const iz=inZone,izp=inZonePx;inZone=function(){return iz()&&!inCb();};inZonePx=function(x,y){return izp(x,y)&&!inCbPx(x,y);};}
// o distrito de baixo se chama Camboriú no jogo principal (Navegantes só no capítulo da Sonia)
function cbDistName(){if(typeof NAV_D==='undefined')return;if(cbOn()){NAV_D.name='Camboriú · Centro';NAV_D.short='Camboriú';}else{NAV_D.name='Navegantes · Rua das Gaivotas';NAV_D.short='Navegantes';}}

// ---------- itens, documentos ----------
Object.assign(ITEMS,{
  cbChaveSac:{n:'Chave da sacristia',s:'CHAVE',c:'#b8964a',st:1,k:'key',d:'Chave de ferro com uma fita roxa. Estava no bolso de um cultista, no vestiário do estádio. Abre a casa paroquial.'},
  cbChaveTorre:{n:'Chave da torre do sino',s:'CHAVE',c:'#8a7a5a',st:1,k:'key',d:'Chave comprida, enferrujada. Abre a porta da torre da Igreja Matriz.'},
  cbSeloSino:{n:'Selo do Sino',s:'SELO',c:'#c8a050',st:1,k:'key',d:'Disco de bronze com um sino gravado. Encaixa numa das três fechaduras do portal da Matriz.'},
  cbSeloVela:{n:'Selo da Vela',s:'SELO',c:'#d8d0b8',st:1,k:'key',d:'Disco de cera endurecida com um pavio no meio. Encaixa numa das três fechaduras do portal da Matriz.'},
  cbSeloCervo:{n:'Selo do Cervo',s:'SELO',c:'#a83a2a',st:1,k:'key',d:'Disco de osso com uma cabeça de cervo entalhada. Ainda está quente.'},
});
const DOC112=DOCS.length;
DOCS.push(
  {t:'Folheto da Congregação do Cervo',b:`A CONGREGAÇÃO DO CERVO\n\nOs mortos andam lá embaixo, em Balneário.\nAqui em cima, ninguém morre sem permissão.\n\nO Cervo desceu do morro e nos guarda.\nOs mortos têm medo dele. Você também deveria ter.\n\nVENHA À MATRIZ. VENHA SOZINHO.\n\nNo verso, a lápis: "eles contam as cabeças. grupo eles veem de longe."`},
  {t:'Caderno do açougueiro',b:`Terça.\nO Cervo desceu às 23h17. Todo mundo viu. Os cachorros pararam de latir na mesma hora, todos de uma vez.\n\nQuarta.\nO Pregador mandou guardar a hora. Disse que a hora é a chave da casa dele. Eu anotei pra não esquecer: 23 17.\n\nQuinta.\nHoje eu limpei a câmara fria pela última vez. Ele disse que vai precisar dos ganchos.\nEu não perguntei pra quê.`},
  {t:'Bilhete do Pregador',b:`Irmão Valdir,\n\nA torre fica fechada. A chave fica aqui, na gaveta, e não sai daqui. Quem tocar o sino sem ordem minha vai ser oferecido.\n\nO porão da minha casa abre com a hora em que Ele desceu. Quem esquecer, que pergunte ao açougueiro.\n\nOs homens de branco da Vértice deixaram Ele na mata do Rio Pequeno em julho. Disseram que era "teste de campo". Depois foram embora correndo.\nEles não entenderam. Ele não foi deixado. Ele ficou. E nos escolheu.\n\n— P.`},
  {t:'Ficha da Vértice · Espécime T-03',b:`VÉRTICE BIOTECNOLOGIA · CONFIDENCIAL\nEspécime T-03 ("CERVO")\n\nLiberado em área controlada (Camboriú, mata do Rio Pequeno) para teste de comportamento.\nAltura: 2,6 m. Alimentação: não observada.\n\nNota de campo: os infectados EVITAM o T-03 num raio aproximado de 2 km. Hipótese: frequência emitida pelo espécime. Potencial uso como barreira.\n\nNota 2: moradores locais passaram a deixar oferendas na mata. Recomendo recolhimento imediato.\n\nRECOLHIMENTO: CANCELADO.\nResponsável: Dr. R. Arantes`},
  {t:'Lista dos oferecidos',b:`Papel pregado na porta do vestiário, com fita crepe:\n\nOFERECIDOS — 1ª NOITE\nSeu Hélio (padaria) ✝\nA filha da Rosângela ✝\nDois soldados da BR ✝\nRapaz de moto, jaqueta amarela, "de Balneário" — GUARDADO PARA O CERVO\n\nEmbaixo, outra letra: "o de jaqueta amarela vai receber a coroa."`},
  {t:'Sermão (transcrição do alto-falante)',b:`"...e os mortos lá embaixo comem uns aos outros porque não têm pastor. Nós temos.\n\nO Cervo não pede muito. Pede uma vela acesa em cada janela. Pede silêncio depois da meia-noite. Pede, de vez em quando, um de nós.\n\nE quem vem de fora... quem vem de fora sozinho, com uma lanterna na mão... esse foi chamado. Esse a gente recebe."`},
);

// ---------- inimigos novos ----------
Object.assign(ETYPES,{
  cult:{n:'Cultista',hp:58,spd:56,dmg:14,r:12,col:'#2e2620',skin:'#c8a888',sight:300},
  vig:{n:'Vigia',hp:40,spd:0,dmg:8,r:12,col:'#24201a',skin:'#b8987a',sight:400},
  marc:{n:'Marcado',hp:95,spd:108,dmg:17,r:12,col:'#3a2a22',skin:'#7a5a48',sight:340},
  chifrudo:{n:'O Cervo',hp:2200,spd:66,dmg:32,r:26,col:'#0e0c0a',skin:'#d8ccb0',sight:99999,boss:true},
});
PCH.pregador={name:'O Pregador',skin:'#d8b898',shade:'#a07c60',hair:'#cfc8bc',iris:'#2a2a2a',bg:['#2a1a10','#0a0604'],glow:'230,170,80',voice:96};
LOOKS.pregador={coat:'#e0dace',skin:'#d8b898',hair:'#cfc8bc',pants:'#d0cabe',look:'pregador'};
if(typeof LOOKX!=='undefined')LOOKX.pregador=function(o){ctx.fillStyle='#d8d2c6';ctx.beginPath();ctx.ellipse(-1,0,7,7.2,0,0,6.283);ctx.fill();ctx.fillStyle='rgba(0,0,0,.65)';ctx.beginPath();ctx.ellipse(2.5,0,3.6,4.2,0,0,6.283);ctx.fill();
  ctx.strokeStyle='#8a1a14';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(-6,-3);ctx.lineTo(-6,3);ctx.lineTo(-1,0);ctx.closePath();ctx.stroke();};
Object.assign(INT_LABEL,{cbIr:'Estrada para Camboriú',cbVolta:'Voltar para a BR-101',cbSino:'Tocar o sino da Matriz',cbVela:'Vela acesa'});
if(typeof ACH!=='undefined')ACH.push({id:'cbCervo',n:'Coroa de chifres',d:'Derrube o Cervo na Igreja Matriz de Camboriú.'},{id:'cbSilencio',n:'Ninguém viu',d:'Passe pela praça de Camboriú sem que nenhum vigia toque o sino.'});

// ---------- o mapa ----------
const CBL={};             // lugares (pixels)
const CBD=[];             // decoração: velas, totens, enforcados, círculos de ritual
const CB_LIGHTS=[];       // postes da cidade (apagam na noite do ritual)
function cbPick(uid,tx,ty,id,q,kind){if(pickups.some(p=>p.uid===uid))return;const [x,y]=freeTileNear(tx,ty,false);pickups.push({uid,tx:x,ty:y,x:tc(x),y:tc(y),id,q:q||1,kind:kind||'item'});pickOcc.add(idx(x,y));}
function cbZ(uid,type,x,y,o={}){initEnemies.push(Object.assign({uid,type,x:tc(x),y:tc(y)},o));}
function cbLamp(x,y,r){const l={x:tc(x),y:tc(y),r:r||130,c:'lamp',f:1,cb:1};lights.push(l);CB_LIGHTS.push(l);return l;}
function cbFire(x,y,r){lights.push({x:tc(x),y:tc(y),r:r||150,c:'fire',f:1,cb:1});}
function cbHouse(x,y,w,h,side,o={}){const b=bigHouse(x,cbY(y),w,h,side,o);b.lit=false;return b;}
function genCamb(){
  const old=rnd; rnd=mulberry32(11212);
  CBD.length=0; CB_LIGHTS.length=0;
  for(let y=CBY;y<HT;y++)for(let x=0;x<W;x++){const k=idx(x,y);map[k]=T.GRASS;under[k]=T.GRASS;meta[k]=0;bmap[k]=-1;safeMask[k]=0;mark[k]=0;rdir[k]=0;reach[k]=0;}
  for(let x=0;x<W;x++){setT(x,CBY,T.BORDER);setT(x,HT-1,T.BORDER);} for(let y=CBY;y<HT;y++){setT(0,y,T.BORDER);setT(W-1,y,T.BORDER);}
  // Rio Camboriú no norte, o parque linear na margem e o Rio Pequeno descendo do morro
  rect(1,cbY(1),W-2,2,T.FOREST); rect(1,cbY(3),W-2,4,T.WATER); rect(1,cbY(7),W-2,1,T.SAND);
  rect(150,cbY(7),3,HT-1-cbY(7),T.WATER);
  // ruas
  hroad(1,207,cbY(38),4);                 // avenida que vem da BR e atravessa a ponte do Rio Pequeno
  hroad(8,148,cbY(22),3); hroad(8,148,cbY(56),3);
  vroad(56,cbY(9),cbY(78),3); vroad(114,cbY(9),cbY(78),3); vroad(28,cbY(22),cbY(78),3);
  rect(1,cbY(8),148,1,T.SIDE);            // calçadão do parque linear
  // ---- a praça (figueiras, postes verdes, coreto) ----
  rect(64,cbY(26),48,11,T.SIDE);
  for(const [x,y,w,h] of [[66,27,9,4],[78,27,8,3],[92,27,8,3],[103,27,7,4],[66,32,9,4],[103,32,7,4],[78,34,8,2],[92,34,8,2]])rect(x,cbY(y),w,h,T.GRASS);
  for(const [x,y] of [[69,28],[72,34],[81,28],[95,28],[106,29],[107,34],[83,35],[97,35],[68,33]])setT(x,cbY(y),T.TREE);
  for(let i=-2;i<=2;i++)for(let j=-2;j<=2;j++)if(Math.abs(i)===2||Math.abs(j)===2)prop(88+i,cbY(31)+j,13);   // bancos em volta do coreto
  CBL.coreto={x:tc(88),y:tc(cbY(31))};
  for(const [x,y] of [[65,26],[76,26],[100,26],[111,26],[65,36],[76,36],[100,36],[111,36],[88,26],[88,36]])cbLamp(x,y,120);
  graf(80,cbY(30),'O CERVO NOS GUARDA',{rot:0,c:'#8a1a14'});
  // ---- Igreja Matriz (gigante) e a torre ----
  {const b=building(72,cbY(9),32,13,{floor:T.WOOD,roof:'#d8d0c0',name:'Igreja Matriz',kind:'igreja',doors:[['S',14,4]]});b.dark=true;b.noZ=true;CBL.igB=b.id;
    for(let y=cbY(13);y<=cbY(19);y+=2)for(let x=75;x<=101;x++)if(x<84||x>91)prop(x,y,13);
    for(let x=82;x<=93;x++)if(x<86||x>89)prop(x,cbY(10),9);
    addGate('cbPortal',86,cbY(21),4,1,null,'#8a6a3a','Portal da Matriz','O portal tem três fechaduras redondas: um sino, uma vela e uma cabeça de cervo.',T.WOOD);
    CBL.portal={x:tc(88),y:tc(cbY(23))}; CBL.altar={x:tc(88),y:tc(cbY(11.5))}; CBL.nave={x:tc(88),y:tc(cbY(17))}; CBL.pulpito={x:tc(78),y:tc(cbY(11))};
    for(const [x,y] of [[76,10],[100,10],[80,20],[96,20],[88,12]])lights.push({x:tc(x),y:tc(cbY(y)),r:90,c:'fire',f:1,cb:1,ig:1});
    for(const [x,y] of [[83,11],[93,11],[85,10],[91,10],[86,12],[90,12]])CBD.push({k:'vela',x:tc(x)+8,y:tc(cbY(y))+8,n:3});}
  {const b=building(104,cbY(9),7,9,{floor:T.WOOD,roof:'#c8c0b0',name:'Torre do sino',kind:'igreja',doors:[['S',2,2]]});b.dark=true;
    addGate('cbTorre',106,cbY(17),2,1,'cbChaveTorre','#6a5a3a','Porta da torre','Trancada. Pela fresta dá pra ver a corda do sino.',T.WOOD);
    const it=addInteract(107,cbY(11),'cbSino',34);it.cb=1;CBL.sino={x:tc(107),y:tc(cbY(12))};CBL.torre={x:tc(107),y:tc(cbY(18.5))};}
  graf(88,cbY(24),'VENHA SOZINHO',{rot:0,c:'#a8241c',s:1.2});
  // ---- casa paroquial ----
  {const b=building(61,cbY(10),11,10,{floor:T.WOOD,roof:'#6a4a3a',name:'Casa paroquial',kind:'casa',doors:[['S',4,2]]});b.dark=true;
    addGate('cbParoq',65,cbY(19),2,1,'cbChaveSac','#7a5a3a','Porta da casa paroquial','Trancada. Tem uma fita roxa amarrada na maçaneta.',T.WOOD);
    prop(63,cbY(12),1);prop(64,cbY(12),1);prop(69,cbY(11),12);prop(70,cbY(11),12);iwall(b,61,cbY(15),71,cbY(15),[[66,2]]);
    cbPick('cbChaveTorreP',63,cbY(13),'cbChaveTorre',1);cbPick('cbDocPreg',69,cbY(12),DOC112+2,1,'file');cbPick('cbParoqH',68,cbY(17),'ervaV',1);
    CBL.paroq={x:tc(66),y:tc(cbY(20.5))};CBL.chaveTorre={x:tc(63),y:tc(cbY(13))};
    addHide(70,cbY(17),'armario');}
  // ---- açougue (câmara fria) ----
  {const b=building(118,cbY(26),14,9,{floor:T.TILEF,roof:'#7a2a24',name:'Açougue',kind:'mercado',doors:[['W',4,2]]});b.dark=true;
    iwall(b,125,cbY(26),125,cbY(34),[[cbY(29),2]]);
    for(let x=127;x<=130;x++)for(const y of [27,29,31,33])CBD.push({k:'gancho',x:tc(x)+16,y:tc(cbY(y))+8,body:((x+y)%3)!==0});
    prop(120,cbY(27),12);prop(121,cbY(27),12);prop(119,cbY(31),1);
    cbPick('cbDocAcou',120,cbY(32),DOC112+1,1,'file');cbPick('cbAcouM',122,cbY(28),'m9',8);
    CBL.acougue={x:tc(117),y:tc(cbY(30.5))};CBL.camara={x:tc(128),y:tc(cbY(30))};
    for(let i=0;i<5;i++)GORE.push({k:'blood',x:tc(126+i*1.2),y:tc(cbY(28+i%3*2)),r:16,rot:i,seed:R(),cb:1});
    graf(131,cbY(35),'OFERECIDOS',{rot:0});}
  // ---- padaria: o abrigo ----
  safeRoom(120,cbY(44),10,8,[['N',4,2]],'Padaria · abrigo'); CBL.safe={x:tc(125),y:tc(cbY(48))};
  graf(124,cbY(43),'AQUI É SEGURO',{rot:0,c:'#d8d4c8'});
  // ---- supermercado ----
  {const b=building(34,cbY(26),20,10,{floor:T.TILEF,roof:'#8a8478',name:'Supermercado',kind:'mercado',loot:true,doors:[['S',8,3]]});
    for(let x=37;x<=50;x+=3)for(let y=cbY(28);y<=cbY(32);y++)prop(x,y,12);cbPick('cbSupA',36,cbY(33),'pilha',2);cbPick('cbSupB',52,cbY(28),'garrafa',2);addHide(52,cbY(33),'armario');}
  // ---- a casa da mesa posta (bairro norte) ----
  {const b=building(34,cbY(11),16,9,{floor:T.WOOD,roof:'#5a3b32',name:'Casa da família Werner',kind:'casa',doors:[['S',7,2]]});b.dark=true;
    for(let x=38;x<=45;x++)prop(x,cbY(15),1);CBL.mesa={x:tc(41.5),y:tc(cbY(15))};
    for(const [x,y] of [[37,15],[46,15],[40,14],[43,16]])cbZ('cbman'+x+y,'manequim',x,cbY(y));
    for(const [x,y] of [[39,13],[44,13]])CBD.push({k:'vela',x:tc(x)+16,y:tc(cbY(y))+16,n:2});}
  cbHouse(10,11,12,9,'S');cbHouse(16,26,10,9,'E');cbHouse(4,26,10,9,'S');
  // ---- estádio ----
  {for(let x=64;x<=112;x++){if(x<86||x>91)setT(x,cbY(60),T.FENCE);setT(x,cbY(78),T.FENCE);}for(let y=cbY(60);y<=cbY(78);y++){setT(64,y,T.FENCE);setT(112,y,T.FENCE);}
    for(let y=cbY(63);y<=cbY(76);y+=2){prop(66,y,13);prop(110,y,13);}
    rect(70,cbY(66),38,10,T.GRASS);for(let x=72;x<=106;x+=17)for(let y=cbY(66);y<=cbY(75);y++)if(y===cbY(66)||y===cbY(75))setT(x,y,T.SIDE);
    const v=building(67,cbY(61),9,6,{floor:T.TILEF,roof:'#4a5250',name:'Vestiário do estádio',kind:'ginasio',doors:[['E',2,2]]});v.dark=true;
    cbPick('cbChaveSacP',69,cbY(63),'cbChaveSac',1);cbPick('cbDocLista',72,cbY(64),DOC112+4,1,'file');cbPick('cbVestC',70,cbY(65),'cart',4);
    CBL.vest={x:tc(77),y:tc(cbY(62.5))};CBL.chaveSac={x:tc(69),y:tc(cbY(63))};
    CBL.fogueira={x:tc(89),y:tc(cbY(70))};cbFire(89,cbY(70),200);CBD.push({k:'fogueira',x:tc(89)+16,y:tc(cbY(70))+16});
    CBD.push({k:'circulo',x:tc(89)+16,y:tc(cbY(70))+16,r:92});
    for(let i=0;i<8;i++){const a=i/8*6.283;CBD.push({k:'totem',x:tc(89)+16+Math.cos(a)*120,y:tc(cbY(70))+16+Math.sin(a)*80});}
    CBL.estadio={x:tc(88.5),y:tc(cbY(61.5))};graf(88,cbY(59),'ESTÁDIO MUNICIPAL',{rot:0,c:'#d8d4c8'});}
  // ---- bairro das Areias (oeste) e a casa do Pregador ----
  {const b=building(6,cbY(62),17,12,{floor:T.WOOD,roof:'#3a2a24',name:'Casa do Pregador',kind:'casa',doors:[['N',8,2]]});b.dark=true;CBL.pregB=b.id;
    iwall(b,6,cbY(68),22,cbY(68),[[14,2]]); addGate('cbPorao',14,cbY(68),2,1,null,'#4a3a2a','Porta do porão','Cadeado com quatro números.',T.WOOD);
    prop(9,cbY(64),1);prop(10,cbY(64),1);prop(19,cbY(63),12);prop(20,cbY(63),12);addHide(8,cbY(66),'armario');
    cbPick('cbSeloVelaP',11,cbY(71),'cbSeloVela',1);cbPick('cbDocT03',18,cbY(71),DOC112+3,1,'file');cbPick('cbPregS',8,cbY(70),'spray',1);
    for(let i=0;i<6;i++){const a=i/6*6.283;CBD.push({k:'vela',x:tc(15)+Math.cos(a)*54,y:tc(cbY(71))+Math.sin(a)*36,n:2});}
    CBD.push({k:'circulo',x:tc(15),y:tc(cbY(71))+8,r:48});CBD.push({k:'altarOsso',x:tc(15),y:tc(cbY(71))+8});
    lights.push({x:tc(15),y:tc(cbY(71)),r:80,c:'fire',f:1,cb:1});
    CBL.porao={x:tc(15),y:tc(cbY(67))};CBL.pregador={x:tc(14.5),y:tc(cbY(61))};CBL.seloVela={x:tc(11),y:tc(cbY(71))};}
  for(const [x,y,w,h,s] of [[4,44,10,9,'N'],[16,44,10,9,'N'],[34,44,10,9,'N'],[44,44,10,8,'N'],[34,62,9,9,'N'],[44,62,10,9,'N'],[34,72,10,6,'N'],[4,76,12,3,'N'],[44,72,10,6,'N']])cbHouse(x,y,w,h,s);
  // ---- do outro lado do Rio Pequeno: casas e o morro ----
  for(const [x,y,w,h,s] of [[156,10,12,9,'S'],[171,10,12,9,'S'],[186,11,12,9,'S'],[160,25,11,9,'S'],[176,25,12,9,'S'],[192,25,12,9,'S']])cbHouse(x,y,w,h,s);
  vroad(168,cbY(9),cbY(37),2);
  rect(154,cbY(44),53,35,T.FOREST);
  {const pts=[[156,cbY(42)],[160,cbY(48)],[170,cbY(52)],[181,cbY(57)],[188,cbY(63)],[195,cbY(69)]];for(let i=0;i<pts.length-1;i++){const [ax,ay]=pts[i],[bx,by]=pts[i+1],n=Math.ceil(hyp(bx-ax,by-ay)*3);for(let k=0;k<=n;k++){const x=ax+(bx-ax)*k/n,y=ay+(by-ay)*k/n;for(let j=-1;j<=1;j++)for(let q=-1;q<=1;q++)if(q*q+j*j<=2)setT(Math.round(x)+q,Math.round(y)+j,T.DIRT);}}}
  for(let j=-4;j<=4;j++)for(let i=-6;i<=6;i++)if(i*i/36+j*j/16<=1)setT(196+i,cbY(70)+j,i*i+j*j>20?T.ROCK:T.GRASS);
  for(let j=cbY(66);j<=cbY(74);j++)if(getT(202,j)===T.GRASS)setT(202,j,T.ROCK);
  trees(154,cbY(44),206,cbY(78),.05);
  CBL.morroPe={x:tc(157),y:tc(cbY(43))};CBL.mirante={x:tc(195),y:tc(cbY(70))};
  npcs.push({id:'cbNico',name:'Nicolas',x:tc(197),y:tc(cbY(69)),ang:Math.PI,...LOOK12.nico,cond:()=>{const F=G.flags;return cbOn()&&F.cbSt>=2&&!F.cbBoss;}});
  // ---- a entrada pela BR (leste): velas na beira da estrada ----
  rect(204,cbY(38),3,4,T.ROAD);
  {const it=addInteract(206,cbY(39),'cbVolta',62);it.cb=1;} CBL.entrada={x:tc(201),y:tc(cbY(39.5))};
  for(let x=158;x<=200;x+=3){CBD.push({k:'vela',x:tc(x)+16,y:tc(cbY(37))+20,n:1});CBD.push({k:'vela',x:tc(x+1)+16,y:tc(cbY(42))+10,n:1});}
  for(const [x,y] of [[178,36],[192,43],[163,43]])CBD.push({k:'totem',x:tc(x),y:tc(cbY(y))});
  for(let i=0;i<5;i++){const x=ri(160,200);addCar(x,cbY(39)+(i%2)*2,true,false);}
  graf(186,cbY(36),'CAMBORIÚ',{rot:0,c:'#d8d4c8',s:1.5});
  // ---- a congregação ----
  // vigias da praça (o Nicolas derruba quando você chega no morro)
  for(const [u,x,y] of [['cbv1',66,27],['cbv2',110,27],['cbv3',88,37]])cbZ(u,'vig',x,cbY(y));
  for(const [u,x,y] of [['cbv4',88,23],['cbv5',89,61],['cbv6',31,43],['cbv7',117,36]])cbZ(u,'vig',x,cbY(y));
  const pts=[[70,40],[100,40],[130,40],[46,40],[20,40],[58,30],[58,48],[116,20],[116,50],[90,24],[40,24],[20,24],[30,50],[30,66],[58,66],[80,58],[100,58],[124,58],[140,40],[140,24],[90,64],[96,72],[80,74],[10,58]];
  pts.forEach(([x,y],i)=>cbZ('cbc'+i,'cult',x,cbY(y)));
  cbZ('cbm1','marc',20,cbY(56)); cbZ('cbm2','marc',104,cbY(64)); cbZ('cbm3','marc',176,cbY(54));
  // lojas, casas: alguns itens (pouca munição: aqui é mais esconder do que atirar)
  for(const [u,x,y,id,q] of [['cbi1',12,48,'ervaV',1],['cbi2',38,48,'pilha',1],['cbi3',48,66,'m9',6],['cbi4',160,14,'ervaV',1],['cbi5',180,28,'polv',1],['cbi6',196,28,'garrafa',2],['cbi7',38,66,'cart',3]])cbPick(u,x,cbY(y),id,q);
  cbPick('cbDocFolh',196,cbY(40),DOC112,1,'file');
  rnd=old;
}
function cbReach(){
  const s=idx((CBL.entrada.x/TILE)|0,(CBL.entrada.y/TILE)|0),q=[s];reach[s]=1;
  while(q.length){const k=q.pop(),x=k%W,y=(k/W)|0;for(const [dx,dy] of DIRS4){const nx=x+dx,ny=y+dy;if(!inb(nx,ny)||ny<CBY)continue;const nk=idx(nx,ny);if(reach[nk])continue;const t=map[nk];if(SOLID[t]&&t!==T.GATE&&t!==T.SHUTTER)continue;reach[nk]=1;q.push(nk);}}
}
// a saída para Camboriú: no fim da estrada oeste da região da Universidade
function genCbIr(){for(let y=ZY+60;y<ZY+64;y++)for(let x=1;x<4;x++)setT(x,y,T.ROAD);const it=addInteract(1,ZY+61,'cbIr',62);it.cb=1;LM.cbIr={x:tc(3),y:tc(ZY+61.5)};LM.cbIrV={x:tc(6),y:tc(ZY+61.5)};
  graf(9,ZY+59,'CAMBORIÚ →',{rot:0,c:'#d8d4c8'});{const k=idx(1,ZY+61);reach[k]=1;}}
(function(){
  const g=genV12;
  genV12=function(){g();cbDistName();try{genCamb();cbReach();genCbIr();}catch(e){console.error('camboriu',e);}};
  // o capítulo da Sonia redesenha as mesmas linhas: tira tudo que era de Camboriú antes
  if(typeof genNav==='function'){const gn=genNav;genNav=function(){
    for(let i=pickups.length-1;i>=0;i--)if(String(pickups[i].uid).startsWith('cb'))pickups.splice(i,1);
    for(let i=interacts.length-1;i>=0;i--)if(interacts[i].cb||interacts[i].ty>=CBY&&['typewriter','box','hide'].includes(interacts[i].type))interacts.splice(i,1);
    for(let i=gates.length-1;i>=0;i--)if(String(gates[i].id).startsWith('cb'))gates.splice(i,1);
    for(let i=npcs.length-1;i>=0;i--)if(String(npcs[i].id).startsWith('cb'))npcs.splice(i,1);
    for(let i=lights.length-1;i>=0;i--)if(lights[i].cb||lights[i].y>=CBY*TILE)lights.splice(i,1);
    for(let i=GRAF.length-1;i>=0;i--)if(GRAF[i].y>=CBY*TILE)GRAF.splice(i,1);
    for(let i=GORE.length-1;i>=0;i--)if(GORE[i].cb)GORE.splice(i,1);
    for(let i=initEnemies.length-1;i>=0;i--)if(String(initEnemies[i].uid).startsWith('cb'))initEnemies.splice(i,1);
    CBD.length=0;CB_LIGHTS.length=0;
    const r=gn.apply(this,arguments);cbDistName();return r;};}
})();

// ===================== SONS DO CAPÍTULO =====================
(SND.extra=SND.extra||[]).push(
  ['cb_ali',()=>{const D=SND.dsp;return D.voice({dur:.55,f0:u=>160+90*Math.sin(Math.PI*Math.min(1,u*1.4)),v:['a','e','i'],rough:.25,br:.2,jit:.03,env:(u,t)=>Math.min(1,t/.02)*Math.pow(1-u,.8),sat:2.2});},2],
  ['cb_hum',()=>{const D=SND.dsp,n=D.len(4.5),x=new Float32Array(n);for(const [f,v] of [[98,'u'],[98.6,'o'],[146.8,'u'],[73.4,'o']])D.add(x,D.voice({dur:4.5,f0:()=>f,v:[v,v,v==='u'?'o':'u'],rough:.05,br:.05,jit:.01,q:[8,10,12],env:u=>Math.pow(Math.sin(Math.PI*u),.5),sat:1.2}),0,.3);return D.fadeOut(D.norm(x));},1],
  ['cb_bell',()=>{const D=SND.dsp,d=7,n=D.len(d),x=new Float32Array(n);for(const [r,a,k] of [[.5,1,.35],[1,.8,.5],[1.19,.55,.7],[1.5,.4,.8],[2,.35,1.1],[2.51,.25,1.4],[3.01,.18,1.8]]){const f=196*r;for(let i=0;i<n;i++){const t=i/44100;x[i]+=Math.sin(6.283*f*t+r)*a*Math.exp(-t*k);}}
    D.add(x,D.ex(D.F(D.N(D.len(.05)),'bp',2500,2),80),0,.4);return D.fadeOut(D.norm(D.sat(x,1.3)),.5);},1],
  ['cb_breath',()=>{const D=SND.dsp,n=D.len(2.4),x=D.F(D.N(n),'bp',380,1.2);const g=D.voice({dur:2.4,f0:u=>48+8*Math.sin(Math.PI*u),v:['h','o','h'],rough:1,br:.5,jit:.05,q:[3,4,5],fs:.7,sat:2.4});
    for(let i=0;i<n;i++){const u=i/n,e=Math.pow(Math.sin(Math.PI*Math.min(1,u*2)),2)*(u<.5?1:.6);x[i]=x[i]*e*.8+g[i]*.5;}return D.fadeOut(D.norm(x));},2],
  ['cb_victim',()=>{const D=SND.dsp;return D.voice({dur:1.6,f0:(u,t)=>(380+260*(1-Math.exp(-t*5)))*(1+.04*Math.sin(t*40)),v:['a','o','u'],rough:.25,br:.25,jit:.06,q:[7,9,10],env:(u,t)=>Math.min(1,t/.03)*Math.pow(1-u,.6),sat:2.6});},2],
);
(function(){
  const has=n=>SND.b[n]&&SND.b[n].length;
  AU.cbAli=function(e){if(!this.ctx)return;if(has('cb_ali'))this.pbAt('cb_ali',e.x,e.y,{vol:.24,wet:.35,maxD:800,rate:.9+Math.random()*.2});else this.vox&&this.vox([{v:'a',d:.12,p:200},{c:'r',v:'i',d:.3,p:240,p2:180}],.1,0,.2);};
  AU.cbHum=function(x,y,v=1){if(has('cb_hum'))this.pbAt('cb_hum',x,y,{vol:.2*v,wet:.6,maxD:1000,jit:.02});};
  AU.cbBell=function(x,y,v=1){if(has('cb_bell'))this.pbAt('cb_bell',x,y,{vol:.5*v,wet:.7,maxD:2600,jit:.01,must:true});else this.bell(v);};
  AU.cbBreath=function(x,y,v=1){if(has('cb_breath'))this.pbAt('cb_breath',x,y,{vol:.35*v,wet:.4,maxD:900});};
  AU.cbVictim=function(x,y,v=1){if(has('cb_victim'))this.pbAt('cb_victim',x,y,{vol:.3*v,wet:.6,maxD:1400});else this.scream(.4);};
})();

// ===================== HISTÓRIA =====================
const CB={tok:0,evT:40,nicoCd:20,vultos:[],rits:[],proc:null,kills:0,lastSay:0,trail:[]};
function cbF(){return G.flags;}
function cbHas(id){return invCount(id)>0||(G.box||[]).some(b=>b.id===id);}
function cbAllSeals(){return ['cbSeloSino','cbSeloVela','cbSeloCervo'].every(cbHas);}
function cbGo(pt){if(P.inCar)exitCar(true);const [x,y]=freeTileNear((pt.x/TILE)|0,(pt.y/TILE)|0,true);P.x=tc(x);P.y=tc(y);snapCamera();flowTile=-1;}
function cbSay(l){if(!CUT.on)bark('pregador','n',l,{radio:true});AU.static&&AU.static(.35,.4);}
// a chamada: depois da Universidade e do flashback, alguém no rádio
STORY.cbCall=function(){
  const F=cbF(); if(F.cbCall)return; F.cbCall=true; F.cbSt=0;
  playCut([{sfx:'static',v:1},
    {say:'nico',m:'s',radio:true,t:'...alguém na BR? Moço da mochila, perto da Universidade. Tô te vendo pelo drone.'},
    {say:'rafa',m:'s',t:'Quem tá falando?'},
    {say:'nico',m:'t',radio:true,t:'Tô em Camboriú. Do lado de lá da BR, seguindo a estrada oeste. Aqui não tem zumbi. Nenhum.'},
    {say:'nico',m:'t',radio:true,t:'Tem coisa pior. Uma igreja inteira de gente maluca. Eles levaram meu irmão hoje à noite.'},
    {say:'nico',m:'s',radio:true,t:'Vem sozinho. Eles contam as cabeças. Se chegar três, eles tocam o sino e a cidade inteira acorda.'},
    ...(compOf('edu')||F.eduFollow?[{say:'edu',m:'n',t:'Sozinho? Tu tá maluco.'}]:[]),
    ...(compOf('matheus')||F.matFollow?[{say:'matheus',m:'t',t:'Minha perna não aguenta mais uma corrida dessas, Richard. A gente fica na Caçulinha do Marlon e segura lá.'}]:[]),
    {say:'rafa',m:'n',t:'Eu vou. Se ele tiver visto o que a Vértice fez lá, eu preciso saber.'},
    {do:()=>{F.cbSolo=true;syncComps();}}],
    ()=>{G.banner={t:'Novo capítulo · Camboriú',life:4};});
};
function cbTravel(toCb){
  const F=cbF(); if(G.ev&&G.ev.chase)return;
  if(toCb&&!F.cbCall){toast('A estrada para Camboriú. Não tem motivo para ir agora.');return;}
  if(!toCb&&F.cbSt>=1&&F.cbSt<5&&!F.cbBoss){
    playCut([{say:'rafa',m:'t',think:true,t:'Não. O irmão do Nicolas ainda tá lá dentro. Eu não volto sem acabar com isso.',dur:2.4}]);return;}
  playCut([{fx:'blackout',v:1.4},{sfx:'creak',v:.4},{do:()=>{cbGo(toCb?CBL.entrada:LM.cbIrV);if(!toCb){F.cbDone=true;F.cbSolo=false;syncComps();}}},{wait:.6},
    ...(toCb&&!F.cbSeen?[{do:()=>{F.cbSeen=true;F.cbSt=Math.max(F.cbSt||0,1);}},
      {say:'rafa',m:'s',t:'Velas. A estrada inteira cheia de velas acesas. Quem acendeu isso tudo?'},
      {say:'rafa',m:'t',think:true,t:'Nenhum corpo. Nenhum carro queimando. Nenhum gemido. É o lugar mais quieto que eu vi a noite toda.',dur:2.8},
      {sfx:'cbBellFar',v:1},
      {say:'rafa',m:'t',think:true,t:'Um sino. Vem do centro.',dur:2}]:[]),
    ...(!toCb?[{say:'rafa',m:'t',think:true,t:'A BR de novo. Os zumbis de volta. Nunca achei que ia sentir alívio de ver eles.',dur:2.6}]:[])],
    ()=>{G.banner={t:toCb?'Camboriú · Centro':'BR-101 · Universidade de BC',life:3.5};});
}
AU.cbBellFar=function(){if(CBL.coreto)AU.cbBell(CBL.coreto.x,CBL.coreto.y-200,.6);};
// a procissão na praça (primeira vez que chega perto)
function cbProcession(){
  const F=cbF(); if(F.cbProc)return; F.cbProc=true;
  const c=CBL.coreto, ps=[];
  playCut([{cam:{x:c.x,y:c.y-120},t:1.2},
    {do:()=>{for(let i=0;i<5;i++){const e=makeEnemy('cult',c.x-60+i*30,c.y+40+(i%2)*14,null);e.cut=true;e.cbProc=1;e.state='wander';ps.push(e);enemies.push(e);CUT.actors['p'+i]=e;}
      const v=makeEnemy('cult',c.x+15,c.y+60,null);v.cut=true;v.victim=1;v.col='#c8b07a';enemies.push(v);CUT.actors.vit=v;AU.cbHum(c.x,c.y,1.2);}},
    {wait:.8},{say:'pregador',m:'n',radio:true,t:'"Irmãos. Mais um veio de Balneário. Mais um para o Cervo."'},
    {do:()=>{for(const [k,e] of Object.entries(CUT.actors))if(e&&e.t)e.walkTo={x:CBL.portal.x+(Math.random()-.5)*40,y:CBL.portal.y,spd:42};}},
    {wait:2.6},{do:()=>AU.cbVictim(c.x,c.y-100,1)},{say:'rafa',m:'s',t:'Eles tão carregando alguém pra igreja...',dur:2},
    {wait:1.2},{fx:'slam'},
    {do:()=>{for(const e of ps)e.alive=false;const v=CUT.actors.vit;if(v)v.alive=false;}},
    {camFree:true},{sfx:'static',v:.8},
    {say:'nico',m:'s',radio:true,t:'Não grita. Não corre. Eu te vi entrar pelo drone.'},
    {say:'nico',m:'t',radio:true,t:'Eu tô no morro, do outro lado do Rio Pequeno. Atravessa a ponte e sobe a trilha atrás das casas. Devagar.'}],
    ()=>{F.cbSt=Math.max(F.cbSt,2);});
}
// o Nicolas no morro
STORY.cbNicoTalk=function(n){
  const F=cbF();
  if(F.cbSt>=3)return bark('nico','n',pick2(F.cbIrmaoQuest&&!F.cbIrmao?['O estádio, Richard. A fogueira. Ele tá lá.','Eu não consigo. Eu tentei mirar e não consigo.']:['Eu cubro daqui. Se um deles grudar em ti na rua, eu derrubo.','A Matriz tem três fechaduras. Sino, vela, cervo. Eu vi eles abrindo uma vez.','Não toca aquele sino se não precisar. Quando ele toca, todo mundo sai de casa.']));
  F.cbSt=3; F.nicoMet=true; F.droneSeen=true;
  const vig=enemies.filter(e=>e.alive&&e.type==='vig'&&['cbv1','cbv2','cbv3'].includes(e.uid));
  const steps=[{npc:n,id:'nico'},{startle:'nico'},
    {say:'nico',m:'s',t:'Ei, ei! Calma! Sou eu do rádio! Nicolas!'},
    {say:'rafa',m:'n',t:'Richard. Tu tá aqui sozinho com um rifle?'},
    {say:'nico',m:'t',t:'É do meu irmão. Ele caçava javali. Saiu às onze pra buscar gasolina no posto da entrada da cidade. Disse que voltava em dez minutos.'},
    {wait:.6},{say:'nico',m:'t',t:'Faz cinco horas. Eu segui ele com o drone até aqui. Vi eles pegando ele no posto.'},
    {say:'nico',m:'n',t:'E tem mais: eu fico no scanner. O Exército falou em "Maré Limpa". Saturação do litoral às cinco e quarenta.'},
    {say:'nico',m:'s',t:'E o helicóptero do porto é da Vértice. Num canal deles: "prioridade: amostras e a Dra. Helena. Civis: negativo".'},
    {say:'rafa',m:'a',t:F.metHelena?'Eles querem a Helena. Ela é a prova do que eles fizeram.':'Dra. Helena... eu preciso achar ela.'},
    {say:'nico',m:'n',t:'Olha a praça. Tá vendo os de capuz parados? São os vigias. Se um te vê, toca o sino.'}];
  const rest=[{say:'nico',m:'n',t:'Toma: sobrou do réveillon. Barulho e luz, eles vão atrás.'},
    {do:()=>{const l=invAdd('rojao',3);if(l)boxAdd('rojao',l);AU.pickup();toast('O Nicolas te deu 3 rojões. Arremesse como granada (escolha na mochila).');}},
    {say:'nico',m:'n',t:'Eu fico aqui em cima. Quando eu tiver mira, eu derrubo quem grudar em ti na rua. Dentro das casas eu não vejo nada.'},
    {say:'nico',m:'s',t:'Acha meu irmão, Richard. Por favor.'}];
  const fim=()=>playCut(rest,()=>{G.banner={t:'O Nicolas te cobre do morro',life:3};});
  if(vig.length){steps.push({say:'nico',m:'t',t:'Só que eu não consigo. Minha mão não para de tremer desde que eu vi eles levando meu irmão.'},
      {say:'nico',m:'a',t:'Toma o rifle. Tem silenciador. Tu atira, eu marco eles com o drone.'},
      {say:'rafa',m:'n',t:'Eu nunca atirei com um desses.'},
      {say:'nico',m:'n',t:'Segura a respiração antes de apertar. E começa pelo que enxerga os outros dois: se um vê o amigo caindo, ele toca o sino.'});
    playCut(steps,()=>cbScopeStart(vig,res=>{
      const after=res==='ok'?[{say:'nico',m:'h',t:'Três. Limpo. Tu nasceu pra isso, hein.'}]:res==='sino'?[{say:'nico',m:'s',t:'Ele tocou o sino! Eles tão acordando lá embaixo... A praça vai ficar cheia. Vai pelas beiradas.'}]:[{say:'nico',m:'t',t:'Acabou a bala. Sobrou vigia lá embaixo. Vai com cuidado, desvia do olhar deles.'}];
      playCut([{say:'nico',m:'n',t:'Me devolve. Daqui eu te cubro.'},...after],fim);}));}
  else{steps.push({say:'nico',m:'h',t:'...Tu já derrubou os vigias da praça? Respeito.'});playCut(steps,fim);}
};
// o tiro do Nicolas// o tiro do Nicolas (rastro vindo do morro, sem barulho)
function cbSnipe(e,cut){
  if(!e||!e.alive)return;
  const ox=CBL.mirante?CBL.mirante.x:e.x+600, oy=CBL.mirante?CBL.mirante.y:e.y+400, a=Math.atan2(e.y-oy,e.x-ox);
  (G.tracers||(G.tracers=[])); if(typeof BR!=='undefined'&&BR.tracers)BR.tracers.push({x0:e.x-Math.cos(a)*700,y0:e.y-Math.sin(a)*700,x1:e.x,y1:e.y,life:.12});
  AU.pb&&AU.pb('shot_sil',{vol:.18,far:.6,wet:.5});bloodBurst(e.x,e.y,10,a);e.headshot=true;
  if(e.cut){e.cut=false;}hurtEnemy(e,9999,Math.cos(a)*120,Math.sin(a)*120,{});
}
function cbNicoSupport(dt){
  const F=cbF(); if(F.cbSt<3||F.cbBoss||F.cbBossOn||CUT.on||G.inB>=0)return;
  CB.nicoCd-=dt; if(CB.nicoCd>0)return;
  const t=enemies.find(e=>e.alive&&(e.type==='cult'||e.type==='marc'||e.type==='vig')&&!e.irmao&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<330&&bmap[idx((e.x/TILE)|0,(e.y/TILE)|0)]<0);
  if(!t)return; CB.nicoCd=F.cbNoite?20:28;
  bark('nico','a',pick2(['Peguei ele.','Abaixa. ...Pronto.','Esse não incomoda mais.','Tô contigo, Richard.']),{radio:true,dur:1.6});
  later(500,()=>cbSnipe(t,false));
}
// o portal, o porão, a torre
LOCKS.cbPorao={n:4,code:'2317',kick:'Casa do Pregador',t:'Cadeado do porão',hint:'Quatro números. "A hora em que Ele desceu."',open(){const g=gates.find(x=>x.id==='cbPorao');if(g&&!g.open){openGate(g);G.flags.cbPorao=true;AU.creak(.8);toast('O cadeado abriu. Tem cheiro de cera queimada lá embaixo.');later(700,()=>{AU.cbBreath(P.x,P.y+200,.5);});}}};
(function(){
  const ug=useGate; useGate=function(g){
    if(g&&g.id==='cbPorao'&&!g.open){UI.code='';return UI.keypad('cbPorao');}
    if(g&&g.id==='cbPortal'&&!g.open){
      const F=cbF(); F.cbPortalSeen=true;
      const miss=[['cbSeloSino','do Sino'],['cbSeloVela','da Vela'],['cbSeloCervo','do Cervo']].filter(([id])=>invCount(id)<=0);
      if(miss.length){toast(`Três fechaduras. Falta${miss.length>1?'m':''} o selo ${miss.map(m=>m[1]).join(', o ')}.${(G.box||[]).some(b=>/^cbSelo/.test(b.id))?' (Tem selo guardado no baú.)':''}`);AU.locked();
        if(!F.cbPortalTalk){F.cbPortalTalk=true;later(600,()=>bark('nico','n','Sino, vela e cervo. O do sino fica na torre. O da vela, com o Pregador, na casa dele nas Areias. O do cervo... eu não sei.',{radio:true}));}return;}
      for(const [id] of [['cbSeloSino'],['cbSeloVela'],['cbSeloCervo']])invRemove(id,1);
      openGate(g);F.cbPortal=true;G.flags[g.id]=true;AU.unlock();AU.creak(1);G.shake+=6;toast('Os três selos giraram juntos. O portal da Matriz abriu.');
      later(900,()=>{AU.cbHum(CBL.altar.x,CBL.altar.y,1.3);});return;}
    const r=ug(g);
    if(g&&g.id==='cbParoq'&&g.open)later(300,()=>bark('rafa','t','Casa do padre. Ou do que sobrou dele.'));
    if(g&&g.id==='cbTorre'&&g.open)later(300,()=>bark('rafa','s','A corda do sino. Se eu puxar, a cidade inteira escuta.'));
    return r;};
  const vi=v12Interact; v12Interact=function(o){
    if(o.type==='cbIr')return cbTravel(true);
    if(o.type==='cbVolta')return cbTravel(false);
    if(o.type==='cbSino')return cbRingBell();
    return vi(o);};
  const sn=STORY.npc; STORY.npc=function(n){if(n&&n.id==='cbNico')return STORY.cbNicoTalk(n);return sn.call(STORY,n);};
  const op=STORY.onPickup; STORY.onPickup=function(id){if(op)op(id);cbOnPickup(id);};
})();
function cbOnPickup(id){
  const F=cbF();
  if(id==='cbChaveSac')later(400,()=>bark('rafa','t','Fita roxa. A mesma da casa paroquial, do lado da igreja.'));
  if(id==='cbChaveTorre')later(400,()=>bark('rafa','t','A chave da torre.'));
  if(id==='cbSeloVela'){later(500,()=>{AU.cbBreath(P.x+180,P.y-120,.7);bark('rafa','s','Tem alguma coisa respirando aqui embaixo. Grande.');});later(3500,()=>cbVulto(true));}
  if(id==='cbSeloCervo'){later(600,()=>bark('nico','h','...Leva ele pra Matriz, Richard. Acaba com isso.',{radio:true}));}
  if(cbHas('cbSeloSino')&&cbHas('cbSeloVela')&&!F.cbIrmaoQuest){F.cbIrmaoQuest=true;later(2500,()=>cbIrmaoCall());}
}
function cbRingBell(){
  const F=cbF(); if(F.cbSino){toast('O sino ainda está balançando. Melhor não.');return;}
  playCut([{say:'rafa',m:'s',t:'Se eu puxar, todo mundo vem.'},
    {choice:[{t:'Puxar a corda',then:[{do:()=>{F.cbSino=true;AU.cbBell(P.x,P.y,1.2);G.shake+=8;buzz([80,60,120]);}},{wait:1},{do:()=>AU.cbBell(P.x,P.y,1)},
      {say:'rafa',m:'a',t:'O selo! Tava preso no badalo!'},
      {do:()=>{const l=invAdd('cbSeloSino',1);if(l)boxAdd('cbSeloSino',l);AU.pickup();cbOnPickup('cbSeloSino');toast('Você pegou o Selo do Sino.');cbNightStart();}},
      {say:'nico',m:'s',radio:true,t:'O QUE TU FEZ?! As casas tão acendendo! Todas! Sai daí, Richard!'}]},
     {t:'Ainda não',then:[]}]}]);
}
// a noite do ritual: o sino tocou, os postes apagam, eles saem com lanterna
function cbNightStart(){
  const F=cbF(); F.cbNoite=true; cbApplyNight();
  for(const e of enemies)if(e.alive&&(e.type==='cult'||e.type==='marc')&&hyp(e.x-P.x,e.y-P.y)<1600){e.state='investigate';e.nx=P.x+rr(-80,80);e.ny=P.y+rr(-80,80);e.it=14;}
  later(1500,()=>cbSay('"O forasteiro tocou o sino. Então é hoje. Apaguem as luzes, irmãos. Acendam as velas. Tragam ele pra Matriz."'));
}
function cbApplyNight(){for(const l of CB_LIGHTS)l.off=!!cbF().cbNoite;}
// o irmão do Nicolas
function cbIrmaoCall(){
  if(cbF().cbIrmao)return;
  playCut([{sfx:'static',v:1},
    {say:'nico',m:'s',radio:true,t:'Richard... o drone passou por cima do estádio.'},
    {say:'nico',m:'t',radio:true,t:'Tem um deles na fogueira. De quatro, com chifre saindo da cabeça. E de jaqueta amarela.'},
    {wait:.8},{say:'nico',m:'t',radio:true,t:'É a jaqueta do meu irmão.'},
    {say:'nico',m:'s',radio:true,t:'Ele tá com um osso pendurado no pescoço. Um disco. O terceiro selo.'},
    {say:'nico',m:'t',radio:true,t:'Eu tentei mirar. Eu não consigo. Vai tu.'}]);
}
function cbIrmaoTick(){
  const F=cbF(); if(!F.cbIrmaoQuest||F.cbIrmao||!CBL.fogueira)return;
  const f=CBL.fogueira; let e=enemies.find(x=>x.alive&&x.irmao);
  if(!e&&hyp(P.x-f.x,P.y-f.y)<900){e=makeEnemy('marc',f.x,f.y-30,null);e.irmao=1;e.hp=e.max=360;e.state='wander';e.cb=1;enemies.push(e);}
  if(e&&!F.cbIrmaoSeen&&hyp(P.x-e.x,P.y-e.y)<300&&!CUT.on){F.cbIrmaoSeen=true;e.state='chase';e.lx=P.x;e.ly=P.y;
    playCut([{cam:{x:e.x,y:e.y},t:.8},{startle:'rafa'},{say:'rafa',m:'s',t:'A jaqueta amarela...'},
      {sfx:'cbBreathAt',v:1},{say:'rafa',m:'t',think:true,t:'Isso já foi uma pessoa. Já foi o irmão de alguém.',dur:2.2},{camFree:true}]);}
}
AU.cbBreathAt=function(){AU.cbBreath(P.x+100,P.y-60,1);};
// o chefe: o Cervo, dentro da Matriz
function cbBossTick(dt){
  const F=cbF(); if(!F.cbPortal||F.cbBoss)return;
  const inChurch=G.inB===CBL.igB&&P.y<CBL.portal.y-tc(3);
  if(!F.cbBossOn&&inChurch&&!CUT.on){F.cbBossOn=true;cbBossStart();}
  if(F.cbBossOn&&!enemies.some(e=>e.alive&&e.type==='chifrudo')&&!CUT.on&&!F.cbBoss){const e=makeEnemy('chifrudo',CBL.altar.x,CBL.altar.y+40,null);e.cb=1;e.mode='stalk';e.mt=2;e.ph=1;enemies.push(e);}
}
function cbBossStart(){
  const g=gates.find(x=>x.id==='cbPortal'); if(g)closeGate(g);
  const pr={id:'cbPreg',name:'O Pregador',x:CBL.pulpito.x,y:CBL.pulpito.y,ang:0,...LOOKS.pregador,col:'#e0dace',cond:()=>cbF().cbBossOn&&!cbF().cbPregDead};
  if(!npcs.some(n=>n.id==='cbPreg'))npcs.push(pr);
  playCut([{fx:'slam'},{say:'rafa',m:'s',t:'A porta!'},
    {npc:pr,id:'pregador'},{cam:pr,t:1},
    {say:'pregador',m:'n',t:'Sozinho. Com uma lanterna na mão. Exatamente como Ele pediu.'},
    {say:'rafa',m:'a',t:'Cadê o irmão do Nicolas?'},
    {say:'pregador',m:'n',t:'Recebeu a coroa. Você viu. Ele está mais perto de Deus do que você vai estar.'},
    {say:'pregador',m:'h',t:'Os homens da Vértice fugiram Dele. Os mortos fogem Dele. Você vai ficar.'},
    {do:()=>{for(const l of lights)if(l.ig)l.off=true;G.flick=.6;AU.cbBreath(CBL.altar.x,CBL.altar.y,1.3);}},
    {cam:{x:CBL.altar.x,y:CBL.altar.y},t:1.2},
    {spawn:'chifrudo',x:CBL.altar.x,y:CBL.altar.y,id:'cervo'},
    {do:()=>{const e=CUT.actors.cervo;if(e){e.cb=1;e.mode='stalk';e.mt=2;e.ph=1;e.face=Math.PI/2;}AU.roar();G.shake+=10;}},
    {say:'pregador',m:'s',t:'DE JOELHOS!'},{camFree:true},
    {do:()=>{for(const l of lights)if(l.ig)l.off=false;}}]);
}
function cbChifrudoAI(e,dt){
  const dx=P.x-e.x,dy=P.y-e.y,d=hyp(dx,dy)||1; e.anim+=dt; e.flash=Math.max(0,e.flash-dt); e.atk-=dt; e.hitAnim=Math.max(0,e.hitAnim-dt);
  if(e.cut)return;
  e.state='chase';e.sees=true;
  const hpF=e.hp/e.max;
  if(e.ph===1&&hpF<.6){e.ph=2;AU.roar();G.flick=.8;G.shake+=8;cbSay('"Irmãos! Ajudem o Cervo!"');for(let i=0;i<2;i++){const m=makeEnemy('marc',CBL.altar.x+(i?60:-60),CBL.altar.y+20,null);m.cb=1;m.state='chase';m.lx=P.x;m.ly=P.y;enemies.push(m);}for(const l of lights)if(l.ig&&Math.random()<.6)l.off=true;}
  if(e.ph===2&&hpF<.3){e.ph=3;AU.cbBreath(e.x,e.y,1.4);AU.roar();G.shake+=10;toast('Ele está furioso. Não fica parado.');}
  const spd=e.t.spd*(e.ph===3?1.35:1);
  // a luz da lanterna incomoda: ele desvia de lado
  const lit=lampOn()&&d<340&&Math.abs(angDiff(P.ang,Math.atan2(-dy,-dx)))<.42;
  e.mt-=dt;
  switch(e.mode){
    case 'stalk':{let tx=dx/d,ty=dy/d,s=spd;if(lit){const k=e.side||(e.side=Math.random()<.5?1:-1);tx=-dy/d*k*.9+dx/d*.25;ty=dx/d*k*.9+dy/d*.25;s*=.75;}
      if(move(e,tx*s*dt,ty*s*dt,true))e.stk=(e.stk||0)+dt;e.face=Math.atan2(dy,dx);
      if(d<e.r+P.r+16&&e.atk<=0){e.atk=1.25;e.hitAnim=.35;hurtPlayer(e.t.dmg,e.x,e.y);G.shake+=6;}
      if(e.mt<=0&&d<520&&d>90){e.mode='tele';e.mt=.75;e.cdx=dx/d;e.cdy=dy/d;AU.cbBreath(e.x,e.y,1);}
      break;}
    case 'tele':e.face=Math.atan2(e.cdy,e.cdx);if(e.mt<=0){e.mode='charge';e.mt=.65;AU.roar();}break;
    case 'charge':{const hit=move(e,e.cdx*spd*3.4*dt,e.cdy*spd*3.4*dt,true);
      if(d<e.r+P.r+10&&e.atk<=0){e.atk=1;hurtPlayer(e.t.dmg*1.3,e.x,e.y);G.shake+=9;e.mode='stalk';e.mt=rr(4,6);}
      if(hit){e.mode='stun';e.mt=1.6;G.shake+=7;AU.thud(1);toast('Ele bateu na parede. AGORA!');}
      else if(e.mt<=0){e.mode='stalk';e.mt=e.ph===3?rr(2.5,4):rr(5,7);}break;}
    case 'stun':if(e.mt<=0){e.mode='stalk';e.mt=e.ph===3?rr(2.5,4):rr(4.5,6.5);}break;
  }
  if(Math.random()<dt*.15)AU.cbBreath(e.x,e.y,.8);
}
function cbBossDead(e){
  const F=cbF(); F.cbBoss=true; F.cbSt=5; ach&&ach('cbCervo');
  const pr=npcs.find(n=>n.id==='cbPreg');
  for(const x of enemies)if(x.alive&&x.cb&&x.type==='marc')x.alive=false;
  playCut([{fx:'slow',v:.8},{wait:.8},{fx:'shake',v:12},
    {say:'rafa',m:'s',t:'Caiu... caiu.'},
    ...(pr?[{npc:pr,id:'pregador'},{say:'pregador',m:'s',t:'Não. NÃO. Você não entende o que você fez. Agora os mortos sobem o morro. Agora eles vêm pra cá também.'},
      {do:()=>{AU.glass(1);}},{wait:.3},
      {do:()=>{F.cbPregDead=true;bloodBurst(pr.x,pr.y,16,0);AU.pb&&AU.pb('shot_sil',{vol:.2,far:.5});GORE.push({k:'corpse',x:pr.x,y:pr.y,rot:1,type:'cult',col:'#e0dace',skin:'#d8b898',r:12,cb:1});}},
      {sfx:'static',v:.8},{say:'nico',m:'t',radio:true,t:'Pelo vitral. Desculpa, Richard. Eu precisava fazer isso.'}]:[]),
    {say:'rafa',m:'t',t:'Tá tudo bem, Nicolas. Desce. A gente vai embora daqui.'},
    {say:'nico',m:'n',radio:true,t:'Eu vou pra Balneário, pro alto de um prédio, com o drone. De lá eu te cubro pelo rádio até o fim, tá? Até o porto.'},
    {say:'nico',m:'h',radio:true,t:'E deixei uma coisa pra ti na porta da igreja. Era do meu irmão. Ele ia querer que alguém usasse.'},
    {do:()=>{const g=gates.find(x=>x.id==='cbPortal');if(g)openGate(g);const i=WI('sniper');if(i>=0&&!P.owned[i])cbPick('cbSnipeR',88,cbY(24),i,5,'weapon');cbPick('cbSnipeA',90,cbY(24),'r308',12);}}],
    ()=>{G.banner={t:'O Cervo caiu · volte para a BR-101 pela estrada do leste',life:5};});
}
// ---------- objetivos ----------
(function(){
  const ob=objective;
  objective=function(){
    const F=cbF();
    try{
      if(F.cbCall&&!F.cbDone&&cbOn()&&!(typeof FB!=='undefined'&&FB.on)){
        const has=id=>invCount(id)>0;
        if(!inCb()){
          if(!inZone())return {t:'Camboriú: volte para a BR-101 pelo túnel no fim da Avenida do Estado (sozinho)',at:LM.tunel};
          return {t:'Vá sozinho para Camboriú: a estrada fica no fim da rua oeste da região da Universidade',at:LM.cbIr};}
        if(F.cbBoss)return {t:'Pegue o que o Nicolas deixou na porta da Matriz e volte para a BR-101 pela estrada do leste',at:pickups.some(p=>p.uid==='cbSnipeR'||p.uid==='cbSnipeA')?{x:tc(89),y:tc(cbY(24))}:CBL.entrada};
        if(F.cbBossOn)return {t:'Derrube o Cervo. Ele odeia a luz da lanterna. Desvie da investida e bata quando ele trombar na parede',at:null};
        if((F.cbSt||0)<2)return {t:'Siga para o centro de Camboriú pela avenida. Não faça barulho',at:CBL.coreto};
        if(F.cbSt<3)return {t:'Atravesse a ponte do Rio Pequeno e suba a trilha do morro até o Nicolas',at:CBL.mirante};
        if(cbAllSeals())return {t:'Os três selos. Abra o portal da Igreja Matriz',at:CBL.portal};
        if(!F.cbPortalSeen)return {t:'Entre na Igreja Matriz, de frente para a praça',at:CBL.portal};
        // selo do sino: estádio -> casa paroquial -> torre
        const sinoOk=cbHas('cbSeloSino')||F.cbPortal, velaOk=cbHas('cbSeloVela')||F.cbPortal;
        if(!sinoOk){
          if(!F.cbTorre&&!cbHas('cbChaveTorre')){
            if(!F.cbParoq&&!cbHas('cbChaveSac'))return {t:'Selo do Sino: a torre e a casa paroquial estão trancadas. O Nicolas viu um cultista com um molho de chaves no vestiário do estádio',at:pickups.some(p=>p.uid==='cbChaveSacP')?CBL.chaveSac:CBL.vest};
            if(!F.cbParoq)return {t:'Selo do Sino: abra a casa paroquial, do lado esquerdo da Matriz, com a chave da sacristia',at:CBL.paroq};
            return {t:'Selo do Sino: a chave da torre está na casa paroquial',at:CBL.chaveTorre};}
          if(!F.cbTorre)return {t:'Selo do Sino: abra a torre do sino, do lado direito da Matriz',at:CBL.torre};
          return {t:'Selo do Sino: suba na torre e toque o sino (todo mundo vai escutar)',at:CBL.sino};}
        if(!velaOk){
          if(!F.cbPorao)return {t:G.files.has(DOC112+1)?'Selo da Vela: o porão da Casa do Pregador, nas Areias. A senha é a hora em que o Cervo desceu':'Selo da Vela: o porão da Casa do Pregador, nas Areias, tem um cadeado de 4 números. Alguém na cidade anotou a senha',at:F.cbPoraoTry||G.files.has(DOC112+1)?CBL.porao:(pickups.some(p=>p.uid==='cbDocAcou')?CBL.acougue:CBL.porao)};
          return {t:'Selo da Vela: pegue o selo no altar do porão',at:CBL.seloVela};}
        if(!cbHas('cbSeloCervo'))return {t:'Selo do Cervo: está com o irmão do Nicolas, na fogueira do estádio',at:CBL.fogueira};
        return {t:'Abra o portal da Igreja Matriz',at:CBL.portal};
      }
    }catch(err){console.error(err);}
    return ob();
  };
})();

// ===================== TERROR: EVENTOS ALEATÓRIOS =====================
function cbSpot(minD,maxD,outside=true){for(let i=0;i<50;i++){const a=Math.random()*6.283,d=rr(minD,maxD),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty)||ty<=CBY+8||ty>=HT-2)continue;const k=idx(tx,ty);if(SOLID[map[k]]||!reach[k])continue;if(outside&&bmap[k]>=0)continue;return {x:tc(tx),y:tc(ty)};}return null;}
// o Cervo aparece longe, no escuro, e some
function cbVulto(near){
  const s=cbSpot(near?260:380,near?380:620); if(!s)return false;
  CB.vultos.push({x:s.x,y:s.y,t:0,life:near?2.6:4.2,a:0}); AU.cbBreath(s.x,s.y,near?1:.6);
  if(!near&&Math.random()<.5)later(900,()=>bark('rafa','s',pick2(['Tinha alguém ali. Alto demais pra ser gente.','...Chifre. Aquilo era chifre?','Não olha. Não olha. Continua andando.'])));
  return true;
}
function cbVultoTick(dt){
  for(const v of CB.vultos){v.t+=dt;v.a=Math.min(1,v.t*1.4)*Math.min(1,(v.life-v.t)*1.5);
    const d=hyp(v.x-P.x,v.y-P.y),lit=lampOn()&&d<380&&Math.abs(angDiff(P.ang,Math.atan2(v.y-P.y,v.x-P.x)))<.4;
    if(lit||d<200){v.life=Math.min(v.life,v.t+.25);}}
  CB.vultos=CB.vultos.filter(v=>v.t<v.life);
}
// um ritual na rua: quatro em volta de alguém ajoelhado
function cbRitual(){
  const s=cbSpot(300,520); if(!s)return false;
  const r={x:s.x,y:s.y,t:0,cults:[],done:false,saved:false};
  for(let i=0;i<4;i++){const a=i/4*6.283,e=makeEnemy('cult',s.x+Math.cos(a)*42,s.y+Math.sin(a)*42,null);e.cb=1;e.state='wander';e.rit=r;e.face=a+Math.PI;e.cbHold=8;enemies.push(e);r.cults.push(e);}
  CB.rits.push(r); AU.cbHum(s.x,s.y,1);
  CBD.push({k:'circulo',x:s.x,y:s.y,r:46,tmp:1});for(let i=0;i<5;i++){const a=i/5*6.283;CBD.push({k:'vela',x:s.x+Math.cos(a)*30,y:s.y+Math.sin(a)*30,n:1,tmp:1});}
  return true;
}
function cbRitualTick(dt){
  for(const r of CB.rits){if(r.done)continue;r.t+=dt;
    const alive=r.cults.filter(e=>e.alive);
    if(!alive.length&&r.t<8){r.done=true;r.saved=true;cbF().cbSalvos=(cbF().cbSalvos||0)+1;psyFloat(r.x,r.y-20,'"Obrigado... obrigado..."',{life:3,c:'#e8d8c8'});toast('Você salvou alguém do ritual. Ele fugiu para o mato.');continue;}
    if(r.t>2.5&&!r.s1){r.s1=1;AU.cbVictim(r.x,r.y,1);}
    if(r.t>8&&!r.done){r.done=true;AU.splat();AU.cbVictim(r.x,r.y,.7);bloodBurst(r.x,r.y,24,0);GORE.push({k:'corpse',x:r.x,y:r.y,rot:Math.random()*6,type:'cult',col:'#6a5a4a',skin:'#c8a888',r:12,cb:1});GORE.push({k:'blood',x:r.x,y:r.y,r:30,rot:0,seed:Math.random(),cb:1});
      for(const e of alive){e.cbHold=0;e.state='wander';}
      if(hyp(r.x-P.x,r.y-P.y)<700)later(800,()=>bark('rafa','s',pick2(['Eles... eles mataram ele. Na rua. Na frente de todo mundo.','Eu não cheguei a tempo.','Isso não é culto. Isso é açougue.'])));}
  }
  CB.rits=CB.rits.filter(r=>!r.done||r.t<60);
}
// a procissão: cinco de capuz, cantando, atravessando a rua
function cbProcissao(){
  const s=cbSpot(380,560); if(!s)return false;
  const a=Math.atan2(P.y-s.y,P.x-s.x)+Math.PI/2, dx=Math.cos(a),dy=Math.sin(a);
  for(let i=0;i<5;i++){const e=makeEnemy('cult',s.x-dx*i*28,s.y-dy*i*28,null);e.cb=1;e.state='wander';e.cbWalk={dx,dy,t:14};e.face=a;enemies.push(e);}
  AU.cbHum(s.x,s.y,1.2); later(5000,()=>AU.cbHum(s.x+dx*120,s.y+dy*120,1));
  if(!cbF().cbProcTip){cbF().cbProcTip=true;later(1200,()=>bark('nico','n','Procissão. Se esconde e deixa passar.',{radio:true}));}
  return true;
}
const CB_SERMAO=['"Uma vela em cada janela, irmãos. Quem apagar a sua, apaga a si mesmo."','"Os mortos lá embaixo comem uns aos outros porque não têm pastor. Nós temos."','"O Cervo vê no escuro. Não adianta se esconder Dele."','"A filha da Rosângela foi oferecida ontem. Ela não chorou. Sejam como ela."','"Silêncio depois da meia-noite. Quem fala alto, fala com Ele."'];
const CB_SERMAO_R=['"O forasteiro tem nome. Richard. Ele já matou irmãos nossos. Tragam ele vivo."','"Richard. Eu sei que você está ouvindo. Venha à Matriz. Ele está esperando."','"Richard de Balneário. Seus amigos ficaram na BR, não foi? Que pena. Ninguém vem te buscar."'];
const CB_EVT=[
  {w:3,f:()=>cbVulto(false)},
  {w:2,f:()=>cbRitual()},
  {w:2,f:()=>cbProcissao()},
  {w:3,f:()=>{const F=cbF(),L=(F.cbKills||0)>=6?CB_SERMAO_R:CB_SERMAO;cbSay(L[(Math.random()*L.length)|0]);return true;}},
  {w:2,f:()=>{const t=cbSpot(200,420);if(!t)return false;CBD.push({k:'enforcado',x:t.x,y:t.y,tmp:1});AU.creak(.6);later(1200,()=>psyFloat(t.x,t.y-30,'Isso não estava aqui.',{life:3,c:'#c8b8a8',whisper:true}));return true;}},
  {w:2,f:()=>{const t=CB.trail[0];if(!t)return false;CBD.push({k:'simbolo',x:t.x,y:t.y,tmp:1,rot:Math.random()*6});later(400,()=>AU.cry&&AU.cry('sussurro',t.x,t.y,1));later(1800,()=>bark('rafa','t','Eu passei aqui agora há pouco. Não tinha esse desenho no chão.'));return true;}},
  {w:2,f:()=>{const t=cbSpot(140,260,false);if(!t)return false;AU.knock();later(1400,()=>AU.cry&&AU.cry('sussurro',t.x,t.y,1));later(1500,()=>psyFloat(t.x,t.y,'"...Richard..."',{life:2.6,c:'#c8b8a8',whisper:true}));return true;}},
  {w:2,f:()=>{if(!CBL.coreto)return false;AU.cbBell(CBL.coreto.x,CBL.coreto.y-200,.5);for(const l of CB_LIGHTS)if(!l.off){l.offAt=0;}G.flick=.5;return true;}},
  {w:2,f:()=>{const t=cbSpot(160,300);if(!t)return false;AU.drag(1);for(let i=0;i<6;i++)GORE.push({k:'drag',x:t.x+i*14,y:t.y+Math.sin(i)*6,r:10,rot:0,seed:Math.random(),cb:1});later(900,()=>bark('rafa','s','Arrastaram alguém por aqui. Agora.'));return true;}},
  {w:2,f:()=>{const t=CB.trail[0]||cbSpot(200,300);if(!t)return false;CBD.push({k:'totem',x:t.x,y:t.y,tmp:1});AU.cbBreath(t.x,t.y,.4);return true;}},
];
function cbEvTick(dt){
  const F=cbF(); if(CUT.on||F.cbBossOn||F.cbBoss||P.hidden&&Math.random()<.5)return;
  if((G.time|0)%3===0&&(!CB.trail.length||hyp(CB.trail[CB.trail.length-1].x-P.x,CB.trail[CB.trail.length-1].y-P.y)>200)){CB.trail.push({x:P.x,y:P.y});if(CB.trail.length>6)CB.trail.shift();}
  CB.evT-=dt*(F.cbNoite?1.5:1)*(1+(G.fear||0)*.6); if(CB.evT>0)return;
  CB.evT=rr(32,60);
  const L=CB_EVT.filter(e=>G.inB<0||e.w<3); let s=L.reduce((a,e)=>a+e.w,0)*Math.random();
  for(const e of L){s-=e.w;if(s<=0){if(!e.f())CB.evT=6;return;}}
}

// ===================== TICK PRINCIPAL =====================
(function(){
  const vt=v16Tick;
  v16Tick=function(dt){
    vt(dt);
    if(G.mode!=='play'||!cbOn())return;
    const F=cbF();
    // a chamada do Nicolas: depois da Universidade e do flashback do Matheus
    if(!F.cbCall&&!F.cbDone&&F.uniDone&&F.flashDone&&!F.shopEv&&!F.inibidorDone&&!(typeof FB!=='undefined'&&FB.on)&&!CUT.on&&!(typeof MP!=='undefined'&&MP.on)&&!G.qte){
      G.ev.cbT=(G.ev.cbT||0)+dt; if(G.ev.cbT>14&&!enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<500))STORY.cbCall();}
    if(!inCb())return;
    // em Camboriú não tem zumbi: o que vier de fora some
    for(const e of enemies)if(e.alive&&!e.cb&&!String(e.uid||'').startsWith('cb')&&e.y>=CBY*TILE&&!['cult','vig','marc','chifrudo'].includes(e.type)){e.alive=false;}
    if(CUT.on)return;
    const c=CBL.coreto;
    if((F.cbSt||0)<2&&c&&hyp(P.x-c.x,P.y-c.y)<560)cbProcession();
    cbNicoSupport(dt); cbVultoTick(dt); cbRitualTick(dt); cbEvTick(dt); cbIrmaoTick(); cbBossTick(dt);
    // as lanternas dos cultistas iluminam (e quem está na luz é visto de longe)
    for(const e of enemies){if(e.type!=='cult'&&e.type!=='vig')continue;
      if(!e._l&&e.alive&&(e.type==='cult'?((e.uid||e.x)+'').length%2===0||F.cbNoite:true)){e._l={x:e.x,y:e.y,r:e.type==='vig'?120:95,c:'fire',f:1,cb:1};lights.push(e._l);}
      if(e._l){if(!e.alive){e._l.off=true;e._l=null;continue;}const a=e.face||0;e._l.x=e.x+Math.cos(a+.6)*12;e._l.y=e.y+Math.sin(a+.6)*12;}}
    // noite do ritual: sempre tem gente procurando
    if(F.cbNoite&&!F.cbBoss&&!F.cbBossOn){G.ev.cbPat=(G.ev.cbPat||0)-dt;if(G.ev.cbPat<=0){G.ev.cbPat=9;const n=enemies.filter(e=>e.alive&&e.cbNight).length;
      if(n<6){const s=cbSpot(420,640);if(s){const e=makeEnemy('cult',s.x,s.y,null);e.cb=1;e.cbNight=1;e.state='investigate';e.nx=P.x+rr(-120,120);e.ny=P.y+rr(-120,120);e.it=20;enemies.push(e);}}}}
    // o silêncio da praça
    if(F.cbSt>=3&&!F.cbSino&&!F.cbBell&&c&&hyp(P.x-c.x,P.y-c.y)<120&&!F.cbAchSil){F.cbAchSil=true;ach&&ach('cbSilencio');}
  };
})();

// ===================== IA: CULTISTAS, VIGIAS, O CERVO =====================
(function(){
  const ue=updEnemy;
  updEnemy=function(e,dt){
    if(e.type==='chifrudo')return cbChifrudoAI(e,dt);
    if(e.cbHold>0&&e.state!=='chase'){e.cbHold-=dt;e.anim+=dt;const r=e.rit;if(r){e.face=Math.atan2(r.y-e.y,r.x-e.x);}
      if(e.flash>0||hyp(P.x-e.x,P.y-e.y)<120){e.cbHold=0;}else return;}
    if(e.cbWalk&&e.state!=='chase'){e.cbWalk.t-=dt;e.anim+=dt;move(e,e.cbWalk.dx*34*dt,e.cbWalk.dy*34*dt,true);e.face=Math.atan2(e.cbWalk.dy,e.cbWalk.dx);
      if(e.cbWalk.t<=0){e.alive=false;return;}
      const d=hyp(P.x-e.x,P.y-e.y);if(!(d<(lampOn()?240:110)&&!P.hidden&&los(e.x,e.y,P.x,P.y))&&e.flash<=0)return;e.cbWalk=null;e.state='chase';e.lx=P.x;e.ly=P.y;}
    const was=e.state; const r=ue(e,dt);
    if(e.alive&&(e.type==='cult'||e.type==='vig'||e.type==='marc')&&e.state==='chase'&&was!=='chase'){
      if(e.type!=='marc')AU.cbAli(e);
      const R2=e.type==='vig'?1100:620;
      for(const o of enemies)if(o!==e&&o.alive&&(o.type==='cult'||o.type==='marc')&&o.state!=='chase'&&hyp(o.x-e.x,o.y-e.y)<R2){o.state='investigate';o.nx=P.x+rr(-60,60);o.ny=P.y+rr(-60,60);o.it=12;o.cbHold=0;o.cbWalk=null;}
      if(e.type==='vig'){e.bellT=0;G.flags.cbBell=true;}
    }
    if(e.type==='vig'&&e.alive&&e.state==='chase'&&e.sees){e.bellT=(e.bellT||0)-dt;if(e.bellT<=0){e.bellT=5;AU.cbBell(e.x,e.y,.7);alertNoise(e.x,e.y,900);}}
    return r;
  };
  // os humanos não gemem como zumbi
  const gr=AU.groan.bind(AU); AU.groan=function(e,v){if(e&&(e.type==='cult'||e.type==='vig'))return;if(e&&e.type==='chifrudo')return AU.cbBreath(e.x,e.y,v||1);return gr(e,v);};
  const ke=killEnemy; killEnemy=function(e,...a){
    const out=ke(e,...a);
    try{if(e&&!e.alive){
      if(e.type==='cult'||e.type==='vig'||e.type==='marc'){G.flags.cbKills=(G.flags.cbKills||0)+1;if(e._l){e._l.off=true;e._l=null;}if(AU.pb)AU.pb('p_hurt',{vol:.14,rate:.8,far:clamp(hyp(e.x-P.x,e.y-P.y)/900,0,1)});}
      if(e.irmao){G.flags.cbIrmao=true;const [x,y]=freeTileNear((e.x/TILE)|0,(e.y/TILE)|0,true);pickups.push({uid:'cbSeloCervoP',tx:x,ty:y,x:tc(x),y:tc(y),id:'cbSeloCervo',q:1,kind:'item'});pickOcc.add(idx(x,y));
        later(900,()=>playCut([{sfx:'static',v:.8},{say:'nico',m:'t',radio:true,t:'...'},{say:'nico',m:'t',radio:true,t:'Obrigado, Richard. Ele ia odiar ficar daquele jeito.'}]));}
      if(e.type==='chifrudo')later(300,()=>cbBossDead(e));
    }}catch(err){console.error(err);}
    return out;};
})();

// ===================== DESENHO =====================
function cbAntler(c,x,y,a,len,w,side){c.lineCap='round';let px=x,py=y,ang=a;for(let i=0;i<4;i++){const l=len/4;const nx=px+Math.cos(ang)*l,ny=py+Math.sin(ang)*l;c.lineWidth=w*(1-i*.18);c.beginPath();c.moveTo(px,py);c.lineTo(nx,ny);c.stroke();
  if(i>0){const ta=ang+side*1.1;c.lineWidth=w*.5;c.beginPath();c.moveTo(nx,ny);c.lineTo(nx+Math.cos(ta)*l*.8,ny+Math.sin(ta)*l*.8);c.stroke();}px=nx;py=ny;ang+=side*.22;}}
function cbDrawCult(e,vig){
  const a=e.face, wk=e.anim*(e.state==='chase'?7:3);
  drawHuman(e.x,e.y,a,{coat:vig?'#201c17':(e.col||'#2e2620'),skin:'#b89878',hair:'#1a1612',pants:'#15120f',walk:wk,moving:e.state!=='wander'||!!e.cbWalk,zombie:false,s:1.05,noHair:true});
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(a);ctx.scale(1.05,1.05);
  ctx.fillStyle=vig?'#1a1612':'#2a221c';ctx.beginPath();ctx.ellipse(-.5,0,7.4,7,0,0,6.283);ctx.fill();ctx.fillStyle='#050403';ctx.beginPath();ctx.ellipse(3,0,3.6,4.2,0,0,6.283);ctx.fill();
  ctx.fillStyle='rgba(230,220,190,.85)';ctx.fillRect(4.6,-2,1,1);ctx.fillRect(4.6,1,1,1);
  ctx.strokeStyle='#8a1a14';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-4,-3);ctx.lineTo(-4,3);ctx.lineTo(0,0);ctx.closePath();ctx.stroke();
  if(vig){ctx.fillStyle='#a8904a';ctx.beginPath();ctx.moveTo(10,8);ctx.lineTo(16,8);ctx.lineTo(17,14);ctx.lineTo(9,14);ctx.closePath();ctx.fill();}
  else{ctx.strokeStyle='#7a7468';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(4,-9);ctx.lineTo(20+(e.hitAnim>0?6:0),-11);ctx.stroke();ctx.beginPath();ctx.moveTo(20+(e.hitAnim>0?6:0),-11);ctx.quadraticCurveTo(24,-4,18,-2);ctx.stroke();
    if(e._l){const g=ctx.createRadialGradient(6,10,0,6,10,14);g.addColorStop(0,'rgba(255,220,140,.9)');g.addColorStop(1,'rgba(255,180,90,0)');ctx.fillStyle=g;ctx.fillRect(-8,-4,28,28);ctx.fillStyle='#5a4a30';ctx.fillRect(4,8,4,5);}}
  if(e.victim){ctx.fillStyle='#c8b07a';ctx.fillRect(-6,-8,12,4);}
  ctx.restore();
}
function cbDrawMarc(e){
  const a=e.face, wk=e.anim*(e.state==='chase'?9:3), l=Math.sin(wk)*5;
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(a);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,3,19,10,0,0,6.283);ctx.fill();
  ctx.strokeStyle='#2a1e18';ctx.lineWidth=3.5;ctx.lineCap='round';
  for(const [sx,sy,dir] of [[9,-5,-1],[9,5,1],[-9,-5,-1],[-9,5,1]]){ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(sx>0?l:-l)+(sx>0?6:-6),sy+dir*10);ctx.stroke();}
  ctx.fillStyle=e.irmao?'#c8b02a':'#3a2a22';ctx.beginPath();ctx.ellipse(-2,0,15,7.5,0,0,6.283);ctx.fill();
  ctx.fillStyle='rgba(200,190,160,.5)';for(let i=-10;i<=6;i+=4){ctx.beginPath();ctx.arc(i,0,1.2,0,6.283);ctx.fill();}
  ctx.fillStyle='#7a5a48';ctx.beginPath();ctx.ellipse(13,0,6.5,5,0,0,6.283);ctx.fill();
  ctx.strokeStyle='#d8c8a8';cbAntler(ctx,11,-3,-2.3,16,2,1);cbAntler(ctx,11,3,2.3,16,2,-1);
  ctx.fillStyle='#ff3a20';ctx.fillRect(16,-2.5,2,1.6);ctx.fillRect(16,1,2,1.6);
  ctx.restore();
}
function cbDrawCervo(e){
  const a=e.face, wk=e.anim*(e.mode==='charge'?10:3.2), sw=Math.sin(wk)*7, arm=e.hitAnim>0?10:0;
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(a);const s=e.r/26;ctx.scale(s,s);
  ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(2,5,34,26,0,0,6.283);ctx.fill();
  // pernas compridas
  ctx.strokeStyle='#0c0a08';ctx.lineWidth=7;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-6,-10);ctx.lineTo(-22+sw,-16);ctx.moveTo(-6,10);ctx.lineTo(-22-sw,16);ctx.stroke();
  // braços até o chão, garras
  ctx.lineWidth=6;ctx.strokeStyle='#14110d';ctx.beginPath();ctx.moveTo(4,-14);ctx.quadraticCurveTo(22,-30,40+arm,-24-sw*.4);ctx.moveTo(4,14);ctx.quadraticCurveTo(22,30,40+arm,24+sw*.4);ctx.stroke();
  ctx.strokeStyle='#c8bca0';ctx.lineWidth=1.6;for(const sy of [-1,1])for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(40+arm,sy*(24+sw*.4*sy)+i*2-3);ctx.lineTo(50+arm,sy*(26+sw*.4*sy)+i*3-4);ctx.stroke();}
  // tronco magro com costelas
  ctx.fillStyle='#14110d';ctx.beginPath();ctx.ellipse(0,0,16,15,0,0,6.283);ctx.fill();
  ctx.strokeStyle='rgba(190,180,160,.35)';ctx.lineWidth=1.4;for(let i=-8;i<=8;i+=4){ctx.beginPath();ctx.moveTo(i,-11);ctx.quadraticCurveTo(i+3,0,i,11);ctx.stroke();}
  ctx.fillStyle='#2a1e16';for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-14,-12+i*6);ctx.lineTo(-24-((i*7)%5),-10+i*6);ctx.lineTo(-14,-9+i*6);ctx.fill();}
  // crânio de cervo e a galhada
  ctx.fillStyle='#d8ccb0';ctx.beginPath();ctx.moveTo(10,-7);ctx.quadraticCurveTo(14,-9,28,-3);ctx.lineTo(30,0);ctx.lineTo(28,3);ctx.quadraticCurveTo(14,9,10,7);ctx.closePath();ctx.fill();
  ctx.fillStyle='#050403';ctx.beginPath();ctx.ellipse(15,-3.6,2.6,2,0,0,6.283);ctx.ellipse(15,3.6,2.6,2,0,0,6.283);ctx.fill();
  const glow=e.mode==='tele'||e.mode==='charge';ctx.fillStyle=glow?'rgba(255,90,40,.95)':'rgba(255,190,90,.85)';ctx.beginPath();ctx.arc(15,-3.6,1.2,0,6.283);ctx.arc(15,3.6,1.2,0,6.283);ctx.fill();
  ctx.strokeStyle='#4a3a26';cbAntler(ctx,12,-5,-2.0,34,3.4,1);cbAntler(ctx,12,5,2.0,34,3.4,-1);
  ctx.strokeStyle='rgba(220,210,190,.35)';cbAntler(ctx,12,-5,-2.0,34,1.2,1);cbAntler(ctx,12,5,2.0,34,1.2,-1);
  if(e.mode==='tele'){ctx.strokeStyle=`rgba(255,80,50,${.5+Math.sin(renderT*30)*.3})`;ctx.lineWidth=2.5;ctx.beginPath();ctx.arc(0,0,40,0,6.283);ctx.stroke();}
  if(e.mode==='stun'){ctx.fillStyle='#ffd27a';for(let i=0;i<3;i++){const aa=renderT*5+i*2.1;ctx.beginPath();ctx.arc(14+Math.cos(aa)*12,Math.sin(aa)*12,1.8,0,6.283);ctx.fill();}}
  ctx.restore();
}
function cbDrawDeco(){
  if(!cbOn()||P.y<(CBY-30)*TILE)return;
  const vx0=cam.x-80,vy0=cam.y-80,vx1=cam.x+view.w/view.z+80,vy1=cam.y+view.h/view.z+80;
  for(const d of CBD){if(d.x<vx0||d.x>vx1||d.y<vy0||d.y>vy1)continue;ctx.save();ctx.translate(d.x,d.y);
    switch(d.k){
      case 'vela':for(let i=0;i<(d.n||1);i++){const ox=(i-((d.n||1)-1)/2)*5,h=6+((i*7+d.x)%5);ctx.fillStyle='#d8ccb0';ctx.fillRect(ox-1.5,-h,3,h);const f=Math.sin(renderT*12+d.x+i)*.6;
        ctx.fillStyle='rgba(255,200,110,.25)';ctx.beginPath();ctx.arc(ox,-h-2,7,0,6.283);ctx.fill();ctx.fillStyle='#ffe0a0';ctx.beginPath();ctx.ellipse(ox+f*.4,-h-2.5,1.4,2.6,0,0,6.283);ctx.fill();}break;
      case 'totem':ctx.strokeStyle='#3a2a1a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(0,-10);ctx.stroke();ctx.fillStyle='#d8ccb0';ctx.beginPath();ctx.ellipse(0,-12,4,6,0,0,6.283);ctx.fill();
        ctx.fillStyle='#050403';ctx.fillRect(-2.4,-14,1.6,1.6);ctx.fillRect(.8,-14,1.6,1.6);ctx.strokeStyle='#6a5a44';cbAntler(ctx,-2,-16,-2.2,12,1.4,1);cbAntler(ctx,2,-16,-.9,12,1.4,-1);break;
      case 'gancho':ctx.strokeStyle='#6a6a68';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-14);ctx.lineTo(0,-4);ctx.stroke();if(d.body){const sw=Math.sin(renderT*1.3+d.x)*.08;ctx.rotate(sw);ctx.fillStyle='#6a2a24';ctx.beginPath();ctx.ellipse(0,4,5,10,0,0,6.283);ctx.fill();ctx.fillStyle='rgba(120,20,16,.7)';ctx.fillRect(-2,10,4,6);}break;
      case 'enforcado':{const sw=Math.sin(renderT*.9+d.x)*.12;ctx.strokeStyle='#8a7a5a';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-30);ctx.lineTo(0,-8);ctx.stroke();ctx.rotate(sw);
        ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(3,10,7,4,0,0,6.283);ctx.fill();ctx.fillStyle='#4a4a46';ctx.beginPath();ctx.ellipse(0,0,6,9,0,0,6.283);ctx.fill();ctx.fillStyle='#b8a088';ctx.beginPath();ctx.arc(0,-9,4.2,0,6.283);ctx.fill();break;}
      case 'circulo':ctx.strokeStyle='rgba(140,20,16,.7)';ctx.lineWidth=2.5;ctx.beginPath();ctx.ellipse(0,0,d.r,d.r*.7,0,0,6.283);ctx.stroke();ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-d.r*.5,-d.r*.3);ctx.lineTo(d.r*.5,-d.r*.3);ctx.lineTo(0,d.r*.4);ctx.closePath();ctx.stroke();break;
      case 'simbolo':ctx.rotate(d.rot||0);ctx.strokeStyle='rgba(150,24,18,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-12,-8);ctx.lineTo(12,-8);ctx.lineTo(0,12);ctx.closePath();ctx.moveTo(-5,-1);ctx.quadraticCurveTo(0,-6,5,-1);ctx.quadraticCurveTo(0,4,-5,-1);ctx.stroke();break;
      case 'fogueira':for(let i=0;i<6;i++){const a=renderT*3+i;ctx.fillStyle=`rgba(255,${120+i*20},40,${.5+.3*Math.sin(a*2)})`;ctx.beginPath();ctx.ellipse(Math.sin(a)*4,-i*3,9-i,12-i*1.4,0,0,6.283);ctx.fill();}ctx.fillStyle='#2a1a0c';ctx.fillRect(-12,4,24,4);break;
      case 'altarOsso':ctx.fillStyle='#3a2a1a';ctx.fillRect(-14,-6,28,12);ctx.fillStyle='#d8ccb0';for(let i=-2;i<=2;i++){ctx.beginPath();ctx.ellipse(i*5,-8,2.2,3.4,0,0,6.283);ctx.fill();}ctx.strokeStyle='#6a5a44';cbAntler(ctx,-3,-10,-2.2,14,1.6,1);cbAntler(ctx,3,-10,-.9,14,1.6,-1);break;
    }ctx.restore();}
  // o Cervo de longe
  for(const v of CB.vultos){ctx.save();ctx.globalAlpha=v.a*.92;ctx.translate(v.x,v.y);const a=Math.atan2(P.y-v.y,P.x-v.x);ctx.rotate(a);
    ctx.fillStyle='#050404';ctx.beginPath();ctx.ellipse(0,0,14,12,0,0,6.283);ctx.fill();ctx.strokeStyle='#0a0806';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(4,-10);ctx.lineTo(30,-18);ctx.moveTo(4,10);ctx.lineTo(30,18);ctx.stroke();
    ctx.strokeStyle='#14100c';cbAntler(ctx,10,-4,-2,30,3,1);cbAntler(ctx,10,4,2,30,3,-1);ctx.fillStyle='rgba(255,180,80,.9)';ctx.fillRect(14,-3,1.6,1.6);ctx.fillRect(14,1.6,1.6,1.6);ctx.restore();}
}
(function(){
  const de=drawEnemy; drawEnemy=function(e){
    if(e&&(e.type==='cult'||e.type==='vig'||e.type==='marc'||e.type==='chifrudo')&&e.state!=='dorm'){
      const va=e.va??1;if(va<=.01)return;ctx.save();ctx.globalAlpha=va;
      if(e.type==='marc')cbDrawMarc(e);else if(e.type==='chifrudo')cbDrawCervo(e);else cbDrawCult(e,e.type==='vig');
      if(e.flash>0){ctx.globalAlpha=.5;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,6.283);ctx.fill();}
      ctx.restore();return;}
    return de(e);};
  const dp=drawParts; drawParts=function(){try{cbDrawDeco();}catch(err){}dp();};
})();
// ---------- mapa (tecla M) de Camboriú ----------
function cbMapTo(c){
  const cx=c.getContext('2d'), w=W, h=HT-CBY, img=cx.createImageData(w,h);
  for(let y=0;y<h;y++)for(let x=0;x<w;x++){const k=idx(x,CBY+y),t=map[k],o=(y*w+x)*4;let col=[34,44,30];
    if(t===T.ROAD)col=[70,70,74];else if(t===T.SIDE||t===T.CONC)col=[110,110,106];else if(t===T.WALL)col=[28,28,30];else if(t===T.FOREST||t===T.TREE)col=[16,40,18];else if(t===T.WATER)col=[22,56,76];else if(t===T.DIRT)col=[90,74,50];else if(t===T.FENCE)col=[60,60,58];else if(t===T.SAFE)col=[60,160,90];else if(bmap[k]>=0)col=[150,146,136];
    if(!explored[k])col=col.map(v=>v*.35);img.data[o]=col[0];img.data[o+1]=col[1];img.data[o+2]=col[2];img.data[o+3]=255;}
  const tmp=document.createElement('canvas');tmp.width=w;tmp.height=h;tmp.getContext('2d').putImageData(img,0,0);
  const s=Math.min(c.width/w,c.height/h),ox=(c.width-w*s)/2,oy=(c.height-h*s)/2;cx.fillStyle='#050606';cx.fillRect(0,0,c.width,c.height);cx.imageSmoothingEnabled=false;cx.drawImage(tmp,ox,oy,w*s,h*s);
  const pt=(L,col,r=4)=>{if(!L)return;cx.fillStyle=col;cx.beginPath();cx.arc(ox+L.x/TILE*s,oy+(L.y/TILE-CBY)*s,r,0,6.283);cx.fill();};
  pt(CBL.safe,'#5ac07a');pt(CBL.portal,'#e8d84a');pt(CBL.mirante,'#e8d84a');pt(CBL.entrada,'#d9a33c');
  const o=objective();if(o&&o.at&&inCbPx(o.at.x,o.at.y))pt(o.at,'#d9a33c',6);pt({x:P.x,y:P.y},'#ffffff',5);
  cx.fillStyle='#ddd6c6';cx.font='700 13px sans-serif';cx.textAlign='left';cx.fillText('CAMBORIÚ · CENTRO',ox+8,oy+18);cx.fillText('MATRIZ',ox+82*s,oy+8*s);cx.fillText('ESTÁDIO',ox+80*s,oy+64*s);cx.fillText('AREIAS',ox+8*s,oy+58*s);cx.fillText('MORRO',ox+180*s,oy+60*s);
}
(function(){const pm=UI.paintMap.bind(UI);UI.paintMap=function(){if(!inCb())return pm();const c=document.getElementById('mapc');if(!c)return pm();
  const wrap=(c.parentElement||c).getBoundingClientRect(),d=Math.min(2,window.devicePixelRatio||1),cssW=Math.max(200,Math.min(wrap.width-14,560)),cssH=cssW*(HT-CBY)/W;
  c.style.width=cssW+'px';c.style.height=cssH+'px';c.width=Math.round(cssW*d);c.height=Math.round(cssH*d);cbMapTo(c);};})();

// ===================== LIGAÇÕES COM O RESTO DA HISTÓRIA =====================
(function(){
  // sozinho: Edu e Matheus ficam esperando na Caçulinha
  const sc=syncComps; syncComps=function(){const F=G.flags;if(F&&F.cbSolo&&!F.cbDone){G.comps=[];return;}return sc();};
  // o shopping (e o V-7) só depois de Camboriú
  const se=STORY.shopEvent; STORY.shopEvent=function(){const F=G.flags;if(F.cbCall&&!F.cbDone){if(!G.ev.cbWarn||G.time-G.ev.cbWarn>8){G.ev.cbWarn=G.time;bark('rafa','s','Camboriú primeiro. O Nicolas tá esperando.');}return;}return se();};
  // o Nicolas não aparece mais na Brava: a primeira vez é em Camboriú
  const ds=droneStart; droneStart=function(){if(!G.flags.nicoMet&&!G.flags.droneSeen)return;return ds();};
  // carregar o jogo no meio do capítulo
  const aws=applyWorldState; applyWorldState=function(){aws();const F=G.flags;CB.vultos=[];CB.rits=[];CB.evT=40;CB.nicoCd=20;
    for(let i=CBD.length-1;i>=0;i--)if(CBD[i].tmp)CBD.splice(i,1);
    if(F.cbBossOn&&!F.cbBoss){F.cbBossOn=false;}
    if(F.cbPortal&&!F.cbBossOn){const g=gates.find(x=>x.id==='cbPortal');if(g&&!g.open)openGate(g);}
    for(const id of ['cbParoq','cbTorre','cbPorao'])if(F[id]){const g=gates.find(x=>x.id===id);if(g&&!g.open)openGate(g);}
    cbApplyNight();if(F.cbSolo&&!F.cbDone)G.comps=[];};
  const rs=resetState; resetState=function(d){rs(d);CB.vultos=[];CB.rits=[];CB.evT=40;CB.nicoCd=20;CB.trail=[];for(let i=CBD.length-1;i>=0;i--)if(CBD[i].tmp)CBD.splice(i,1);for(const l of CB_LIGHTS)l.off=false;};
  // pular no menu de teste
  const dj=dbgJump; dbgJump=function(k){
    const F=G.flags;
    if(k==='cbBase'){dj('bc2');F.uniDone=true;F.uniMeet=true;F.uniMat=true;F.marlonMet=true;F.matheusJoin=true;F.matFollow=true;F.flashDone=true;F.zoneSeen=true;G.ev.uniWave=null;{const g=gates.find(x=>x.id==='bibUni');if(g&&!g.open)openGate(g);}syncComps();return;}
    return dj(k);};
})();
dbgExtra('1.12 · Camboriú (capítulo novo)',[['cb:call','Receber a chamada do Nicolas (depois da Universidade)'],['cb:ir','Ir para Camboriú (entrada)'],['cb:praca','Ir para a praça (procissão)'],['cb:nico','Ir até o Nicolas no morro'],
  ['cb:chaves','Ganhar as chaves (sacristia e torre)'],['cb:sino','Pegar o Selo do Sino (começa a noite)'],['cb:vela','Pegar o Selo da Vela'],['cb:irmao','Ir para o irmão do Nicolas (estádio)'],['cb:selos','Ganhar os 3 selos e ir pro portal'],
  ['cb:chefe','Começar a luta do Cervo'],['cb:fim','Terminar o capítulo (Cervo derrotado)'],['cb:volta','Voltar para a BR-101 (capítulo concluído)'],['cb:vulto','Evento: o Cervo de longe'],['cb:ritual','Evento: ritual na rua'],['cb:procissao','Evento: procissão'],['cb:sermao','Evento: sermão no alto-falante'],['cb:evento','Evento de terror sorteado']],
  function(k){
    const F=G.flags, give=(id,q=1)=>{const l=invAdd(id,q);if(l)boxAdd(id,l);}, close=()=>{if(UI.close)UI.close();G.mode='play';};
    const base=()=>{if(!F.uniDone||!F.flashDone)dbgJump('cbBase');if(!F.cbCall){F.cbCall=true;F.cbSolo=true;F.cbSt=0;syncComps();}};
    const enter=()=>{base();F.cbSeen=true;F.cbSt=Math.max(F.cbSt||0,1);cbGo(CBL.entrada);};
    const nico=()=>{enter();F.cbProc=true;F.cbSt=Math.max(F.cbSt,3);F.nicoMet=true;F.droneSeen=true;for(const e of enemies)if(e.alive&&['cbv1','cbv2','cbv3'].includes(e.uid))killEnemy(e);};
    switch(k){
      case 'cb:call':base();close();F.cbCall=false;G.ev.cbT=99;return STORY.cbCall();
      case 'cb:ir':enter();close();return toast('Camboriú, entrada.');
      case 'cb:praca':enter();close();return cbGo({x:CBL.coreto.x+tc(14),y:CBL.coreto.y+tc(8)});
      case 'cb:nico':enter();F.cbProc=true;F.cbSt=Math.max(F.cbSt,2);close();return cbGo({x:CBL.mirante.x-tc(3),y:CBL.mirante.y});
      case 'cb:chaves':nico();give('cbChaveSac');give('cbChaveTorre');close();return cbGo(CBL.paroq);
      case 'cb:sino':nico();F.cbParoq=F.cbTorre=true;for(const id of ['cbParoq','cbTorre']){const g=gates.find(x=>x.id===id);if(g&&!g.open)openGate(g);}close();cbGo(CBL.sino);return cbRingBell();
      case 'cb:vela':nico();F.cbPorao=true;{const g=gates.find(x=>x.id==='cbPorao');if(g&&!g.open)openGate(g);}close();return cbGo(CBL.seloVela);
      case 'cb:irmao':nico();if(!cbHas('cbSeloSino'))give('cbSeloSino');if(!cbHas('cbSeloVela'))give('cbSeloVela');F.cbIrmaoQuest=true;close();return cbGo({x:CBL.fogueira.x,y:CBL.fogueira.y-tc(12)});
      case 'cb:selos':nico();for(const id of ['cbSeloSino','cbSeloVela','cbSeloCervo'])if(!cbHas(id))give(id);F.cbIrmaoQuest=F.cbIrmao=true;close();return cbGo(CBL.portal);
      case 'cb:chefe':nico();F.cbIrmaoQuest=F.cbIrmao=true;F.cbPortal=true;{const g=gates.find(x=>x.id==='cbPortal');if(g&&!g.open)openGate(g);}close();return cbGo(CBL.nave);
      case 'cb:fim':nico();F.cbPortal=true;F.cbBossOn=true;close();cbGo(CBL.nave);return cbBossDead(null);
      case 'cb:volta':nico();F.cbPortal=F.cbBoss=true;F.cbSt=5;close();return cbTravel(false);
      case 'cb:vulto':if(!inCb())enter();close();return cbVulto(false)||toast('Sem lugar pro vulto aqui.');
      case 'cb:ritual':if(!inCb())enter();close();return cbRitual()||toast('Sem espaço aqui.');
      case 'cb:procissao':if(!inCb())enter();close();return cbProcissao()||toast('Sem espaço aqui.');
      case 'cb:sermao':if(!inCb())enter();close();return CB_EVT[3].f();
      case 'cb:evento':if(!inCb())enter();close();CB.evT=0;return;
    }
  });

// ===================== A LUNETA: O RICHARD COM O RIFLE DO NICOLAS NO MORRO =====================
// A câmera abre bem (visão ampla da praça inteira), o drone do Nicolas marca os vigias, uma lupa no
// canto mostra o alvo de perto. A mira balança com a respiração: segure Shift (ou solte o direcional,
// no celular) para prender o ar. Se um vigia vê o outro cair, ou se a bala erra perto dele, ele procura
// e, se não for derrubado logo, toca o sino.
function cbScopeStart(vig,done){
  const c=CBL.coreto;
  G.scope={x:c.x,y:c.y-40,cx:c.x,cy:c.y-30,t:0,ammo:5,breath:3,hold:false,tg:vig.map(v=>v),alarm:null,done,res:null,shots:[],down:false,prevAim:false,kick:0,hint:0,zoom:1};
  P.ang=Math.atan2(c.y-P.y,c.x-P.x); mouseDown=false;
  G.banner={t:IN.touch?'Arraste para mirar · solte para atirar':'Mouse mira · clique atira · Shift segura a respiração',life:4.5};
  later(1200,()=>bark('nico','n',vig.length>=3?'Começa pelo do meio, perto do coreto. Ele vê os dois.':'Devagar. Um de cada vez.',{radio:true,dur:2.6}));
}
function cbScopeEnd(res){const S=G.scope;if(!S||S.res)return;S.res=res;later(900,()=>{const d=S.done;G.scope=null;if(d)d(res);});}
function cbScopeSway(S){const t=S.t,f=S.hold?.12:1,fear=1+(G.fear||0)*.8;return [(Math.sin(t*1.3)*11+Math.sin(t*3.1+1)*5)*f*fear,(Math.cos(t*1.1)*9+Math.sin(t*2.6)*5)*f*fear];}
function cbScopeTick(dt){
  const S=G.scope; if(!S||S.res&&S.t>99)return; S.t+=dt; S.kick=Math.max(0,S.kick-dt*3); S.hint+=dt;
  // respiração
  const want=!!(KEYS.ShiftLeft||KEYS.ShiftRight)||(IN.touch&&TOUCH.aim.id===null&&S.relT>0);
  if(want&&S.breath>0){S.hold=true;S.breath=Math.max(0,S.breath-dt);if(S.breath<=0){S.hold=false;S.gasp=1.2;AU.breath&&AU.breath(1,false);}}
  else{S.hold=false;S.breath=Math.min(3,S.breath+dt*(S.gasp>0?.25:.6));}
  S.gasp=Math.max(0,(S.gasp||0)-dt); S.relT=Math.max(0,(S.relT||0)-dt);
  // mira: mouse (posição na tela), teclado e direcional do celular (velocidade)
  const z=view.z;
  if(IN.mouseOn&&!IN.touch){S.x=cam.x+IN.mouseX/z;S.y=cam.y+IN.mouseY/z;}
  let mx=0,my=0;if(KEYS.KeyA||KEYS.ArrowLeft)mx--;if(KEYS.KeyD||KEYS.ArrowRight)mx++;if(KEYS.KeyW||KEYS.ArrowUp)my--;if(KEYS.KeyS||KEYS.ArrowDown)my++;
  if(TOUCH.aim.id!==null){const C=stickCenters();const dx=TOUCH.aim.x-C.aim.x,dy=TOUCH.aim.y-C.aim.y,d=hyp(dx,dy);if(d>6){mx=dx/STICK.r;my=dy/STICK.r;}S.aiming=true;}
  if(TOUCH.move.id!==null){const C=stickCenters();const dx=TOUCH.move.x-C.move.x,dy=TOUCH.move.y-C.move.y,d=hyp(dx,dy);if(d>6){mx=dx/STICK.r;my=dy/STICK.r;}S.aiming=true;}
  if(mx||my){S.x+=mx*420*dt;S.y+=my*420*dt;}
  const vw=view.w/z,vh=view.h/z;S.x=clamp(S.x,S.cx-vw/2+20,S.cx+vw/2-20);S.y=clamp(S.y,S.cy-vh/2+20,S.cy+vh/2-20);
  // atirar: clique, F/Enter, ou soltar o direcional no celular
  let fire=false;
  if(mouseDown&&!S.down)fire=true; S.down=mouseDown;
  if((KEYS.KeyF||KEYS.Enter)&&!S.kd)fire=true; S.kd=!!(KEYS.KeyF||KEYS.Enter);
  const touching=TOUCH.aim.id!==null||TOUCH.move.id!==null; if(S.prevAim&&!touching&&S.aiming){fire=true;S.aiming=false;S.relT=2.2;} S.prevAim=touching;
  if(fire&&!S.res&&S.ammo>0&&S.t>.6)cbScopeFire(S);
  // o vigia desconfiado
  if(S.alarm&&!S.res){const a=S.alarm;a.t-=dt;if(!a.e.alive){S.alarm=null;}else{a.e.face+=Math.sin(S.t*4)*dt*2;if(a.t<=0){S.alarm=null;AU.cbBell(a.e.x,a.e.y,1);G.flags.cbBell=true;
      for(const o of enemies)if(o.alive&&(o.type==='cult'||o.type==='marc')&&hyp(o.x-a.e.x,o.y-a.e.y)<1200){o.state='investigate';o.nx=a.e.x+rr(-90,90);o.ny=a.e.y+rr(-90,90);o.it=18;}
      bark('nico','s','O SINO! Ele tocou!',{radio:true,dur:1.6});cbScopeEnd('sino');}}}
  if(!S.res){if(S.tg.every(v=>!v.alive))cbScopeEnd('ok');else if(S.ammo<=0)cbScopeEnd('bala');}
  if(S.hint>14&&!S.res){S.hint=0;bark('nico','n',pick2(['Prende o ar antes. Shift.','Ele tá virando. Espera ele parar.','A cabeça, Richard. Só a cabeça.']),{radio:true,dur:2});}
  // câmera aberta, fixa na praça
  G.camF=lerp(G.camF||1,.5,Math.min(1,dt*2.2)); G.camTgt=.5;
  cam.x=lerp(cam.x,S.cx-vw/2,Math.min(1,dt*6)); cam.y=lerp(cam.y,S.cy-vh/2,Math.min(1,dt*6));
}
function cbScopeFire(S){
  const [sx,sy]=cbScopeSway(S),px=S.x+sx,py=S.y+sy; S.ammo--; S.kick=1; G.shake+=2;
  AU.pb&&AU.pb('shot_sil',{vol:.35,wet:.2,must:true}); AU.pb&&later(350,()=>AU.pb('shell',{vol:.08}));
  if(typeof BR!=='undefined'&&BR.tracers)BR.tracers.push({x0:px+340,y0:py+620,x1:px,y1:py,life:.1});
  let hit=null,hd=1e9;
  for(const e of enemies){if(!e.alive||!['vig','cult','marc'].includes(e.type))continue;const d=hyp(e.x-px,e.y-py);if(d<(e.r+7)&&d<hd){hd=d;hit=e;}}
  S.shots.push({x:px,y:py,t:0,hit:!!hit});
  if(hit){const head=hd<6;bloodBurst(hit.x,hit.y,14,Math.atan2(-620,-340));hurtEnemy(hit,9999,0,0,{});if(head)floaters.push({x:hit.x,y:hit.y-20,t:'NA CABEÇA',life:.9});
    // quem viu o amigo cair?
    for(const v of S.tg)if(v.alive&&v!==hit&&!S.alarm&&hyp(v.x-hit.x,v.y-hit.y)<1000&&los(v.x,v.y,hit.x,hit.y)&&Math.abs(angDiff(v.face||0,Math.atan2(hit.y-v.y,hit.x-v.x)))<1.4){
      S.alarm={e:v,t:2.6};v.face=Math.atan2(hit.y-v.y,hit.x-v.x);bark('nico','s','O outro viu! Rápido, antes do sino!',{radio:true,dur:1.6});break;}
    if(!S.alarm&&Math.random()<.5)later(400,()=>bark('nico','h',pick2(['Caiu.','Boa.','Nem gemeu.']),{radio:true,dur:1.2}));}
  else{for(let i=0;i<8;i++)parts.push({k:'spark',x:px,y:py,vx:rr(-90,90),vy:rr(-90,90),life:.25,max:.25,s:2,c:'#ffd27a'});AU.click&&AU.click();
    const near=S.tg.filter(v=>v.alive).sort((a,b)=>hyp(a.x-px,a.y-py)-hyp(b.x-px,b.y-py))[0];
    if(near&&hyp(near.x-px,near.y-py)<260&&!S.alarm){S.alarm={e:near,t:3.2};near.face=Math.atan2(py-near.y,px-near.x);bark('nico','s','Errou perto dele! Ele tá procurando!',{radio:true,dur:1.6});}}
}
function cbScopeDraw(){
  const S=G.scope; if(!S)return; const z=view.z, w=view.w, h=view.h;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const [sx,sy]=cbScopeSway(S), ax=(S.x+sx-cam.x)*z, ay=(S.y+sy-cam.y)*z-S.kick*14;
  // lupa: o canto superior direito mostra o alvo ampliado (copia da própria tela)
  try{const R0=Math.min(105,w*.13),cxs=w-R0-22,cys=h-R0-50,mag=3.2,src=R0/mag;
    ctx.save();ctx.beginPath();ctx.arc(cxs,cys,R0,0,6.283);ctx.clip();
    ctx.drawImage(cv,(ax-src)*dpr,(ay-src)*dpr,src*2*dpr,src*2*dpr,cxs-R0,cys-R0,R0*2,R0*2);
    ctx.fillStyle='rgba(60,90,70,.18)';ctx.fillRect(cxs-R0,cys-R0,R0*2,R0*2);
    for(let y=cys-R0;y<cys+R0;y+=3){ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(cxs-R0,y,R0*2,1);}
    ctx.strokeStyle='rgba(10,10,10,.9)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(cxs-R0,cys);ctx.lineTo(cxs-8,cys);ctx.moveTo(cxs+8,cys);ctx.lineTo(cxs+R0,cys);ctx.moveTo(cxs,cys-R0);ctx.lineTo(cxs,cys-8);ctx.moveTo(cxs,cys+8);ctx.lineTo(cxs,cys+R0);ctx.stroke();
    ctx.fillStyle='#d83a2a';ctx.beginPath();ctx.arc(cxs,cys,1.8,0,6.283);ctx.fill();
    ctx.restore();ctx.strokeStyle='#0a0a0a';ctx.lineWidth=8;ctx.beginPath();ctx.arc(cxs,cys,R0,0,6.283);ctx.stroke();ctx.strokeStyle='#5a5a52';ctx.lineWidth=2;ctx.beginPath();ctx.arc(cxs,cys,R0+4,0,6.283);ctx.stroke();
    ctx.fillStyle='#e8e0c8';ctx.font=`700 12px ${FONT_UI}`;ctx.textAlign='center';ctx.fillText('LUNETA ×'+mag.toFixed(1),cxs,cys-R0-10);}catch(e){}
  // marcas do drone nos vigias
  ctx.textAlign='center';
  for(const v of S.tg){if(!v.alive)continue;const x=(v.x-cam.x)*z,y=(v.y-cam.y)*z,r=16,al=S.alarm&&S.alarm.e===v;
    ctx.strokeStyle=al?`rgba(255,60,40,${.6+Math.sin(S.t*20)*.4})`:'rgba(232,216,74,.85)';ctx.lineWidth=2;
    for(const [qx,qy] of [[-1,-1],[1,-1],[-1,1],[1,1]]){ctx.beginPath();ctx.moveTo(x+qx*r,y+qy*(r-7));ctx.lineTo(x+qx*r,y+qy*r);ctx.lineTo(x+qx*(r-7),y+qy*r);ctx.stroke();}
    ctx.fillStyle=al?'#ff5a40':'#e8d84a';ctx.font=`700 11px ${FONT_UI}`;ctx.fillText(al?`PROCURANDO ${Math.max(0,S.alarm.t).toFixed(1)}s`:'VIGIA',x,y-r-6);}
  // tiros que já foram
  for(const s of S.shots){s.t+=lastDt||.016;if(s.t>1.2||s.hit)continue;const x=(s.x-cam.x)*z,y=(s.y-cam.y)*z;ctx.strokeStyle=`rgba(255,210,120,${1-s.t})`;ctx.beginPath();ctx.arc(x,y,4+s.t*16,0,6.283);ctx.stroke();}
  // retícula
  const ok=S.hold, col=ok?'rgba(120,230,140,.95)':'rgba(240,230,210,.9)';
  ctx.strokeStyle='rgba(0,0,0,.6)';ctx.lineWidth=4;ctx.beginPath();ctx.arc(ax,ay,22,0,6.283);ctx.stroke();
  ctx.strokeStyle=col;ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(ax,ay,22,0,6.283);ctx.moveTo(ax-40,ay);ctx.lineTo(ax-8,ay);ctx.moveTo(ax+8,ay);ctx.lineTo(ax+40,ay);ctx.moveTo(ax,ay-40);ctx.lineTo(ax,ay-8);ctx.moveTo(ax,ay+8);ctx.lineTo(ax,ay+40);ctx.stroke();
  for(let i=1;i<=3;i++){ctx.beginPath();ctx.moveTo(ax-3,ay+8+i*7);ctx.lineTo(ax+3,ay+8+i*7);ctx.stroke();}
  ctx.fillStyle='#d83a2a';ctx.beginPath();ctx.arc(ax,ay,1.6,0,6.283);ctx.fill();
  // bordas escuras, faixas de VHS e o painel
  const g=ctx.createRadialGradient(w/2,h/2,Math.min(w,h)*.35,w/2,h/2,Math.max(w,h)*.72);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.72)');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.fillRect(0,0,w,34);ctx.fillRect(0,h-34,w,34);
  ctx.textAlign='left';ctx.fillStyle='#e8e0c8';ctx.font=`700 13px ${FONT_UI}`;
  const dist=Math.round(hyp(S.x-P.x,S.y-P.y)/TILE*1.6);
  ctx.fillText(`RIFLE .308 · SILENCIADOR · ${S.ammo}/5`,16,22);ctx.textAlign='right';ctx.fillText(`DIST ${dist} m · VENTO 2 km/h · DRONE: ${S.tg.filter(v=>v.alive).length} VIGIA(S)`,w-16,22);
  ctx.textAlign='left';ctx.fillText(IN.touch?'Arraste para mirar · solte para atirar · solte e espere para prender o ar':'Clique atira · Shift segura a respiração · F também atira',16,h-12);
  // respiração
  const bw=140;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(w/2-bw/2,h-26,bw,8);ctx.fillStyle=S.gasp>0?'#d84a3a':ok?'#78e68c':'#c8c0a8';ctx.fillRect(w/2-bw/2,h-26,bw*S.breath/3,8);
  ctx.textAlign='center';ctx.fillStyle='#e8e0c8';ctx.font=`700 11px ${FONT_UI}`;ctx.fillText(S.gasp>0?'SEM AR':ok?'PRENDENDO O AR':'RESPIRAÇÃO',w/2,h-32);
}
(function(){
  // durante a luneta o Richard não anda nem atira do jeito normal
  const ri=readInput; readInput=function(){ri.apply(this,arguments);if(G.scope){IN.mx=0;IN.my=0;IN.fire=false;IN.run=false;IN.aimAng=null;}};
  const uc=updCamera; updCamera=function(dt){if(G.scope&&G.mode==='play'&&!CUT.on){cbScopeTick(dt);G._dkZone=.45;return;}uc(dt);};
  // quem está na lente aparece (mesmo longe e fora do cone de visão)
  const uv=updVis; updVis=function(dt){uv(dt);if(!G.scope)return;const z=view.z,vw=view.w/z,vh=view.h/z;
    for(const e of enemies){if(!e.alive)continue;if(e.x>cam.x-40&&e.x<cam.x+vw+40&&e.y>cam.y-40&&e.y<cam.y+vh+40){e.vis=true;e.va=Math.min(1,(e.va||0)+dt*7);}}};
  if(typeof fovAtivo==='function'){const fa=fovAtivo;fovAtivo=function(){return !G.scope&&fa();};}
  const dps=drawPsy; drawPsy=function(){dps();try{cbScopeDraw();}catch(e){console.error(e);}};
  const dh=drawHUD; drawHUD=function(){if(G.scope&&G.mode==='play'&&!CUT.on)return;return dh.apply(this,arguments);};
  const vt=v16Tick; v16Tick=function(dt){vt(dt);
    if(G.scope){G._dkZone=.5;return;}
    // com o rifle na mão a câmera abre um pouco (dá pra ver longe)
    if(G.mode==='play'&&!CUT.on&&!P.inCar&&WEAPONS[P.w]&&WEAPONS[P.w].id==='sniper'&&G.inB<0){G.camF=lerp(G.camF||1,.72,Math.min(1,dt*1.6));}
  };
  const rs=resetState; resetState=function(d){rs(d);G.scope=null;};
})();
