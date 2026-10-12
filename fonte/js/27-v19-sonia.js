// ===================== 1.9: CAPÍTULO EXTRA · SONIA EM NAVEGANTES =====================
// A mesma noite, do outro lado do rio. A Sonia está na casa da tia, em Navegantes, sem arma nenhuma:
// só dá pra fugir, se esconder e jogar garrafa. O Balseiro (o homem do ferry-boat, de capa amarela)
// anda atrás dela a noite inteira.
// O bairro fica em linhas novas abaixo do mapa (HZO..HT-1). Durante a geração do mundo essas linhas
// ficam vazias (BORDER) e o bairro só é desenhado quando o capítulo começa, com RNG próprio:
// o mundo principal continua idêntico. Joga-se pelo título ("Capítulos extras"); não salva nada.

// ---------- registro compartilhado dos capítulos extras (o do Rese usa o mesmo) ----------
globalThis.CAPS=globalThis.CAPS||[];
if(!UI.caps){
  UI.caps=function(){
    const L=globalThis.CAPS||[];
    this.open(`<div class="sheet narrow"><p class="kick">Capítulos extras</p><h2>Outras noites</h2>
      <p class="lede">Histórias de quem estava no litoral antes do Richard chegar. Não mexem no seu registro.</p>
      <div class="diffs">${L.map((c,i)=>`<button class="card" data-a="cap" data-k="${c.id}" ${i===0?'data-focus':''}><b>${c.n}</b><span>${c.d}</span></button>`).join('')}</div>
      <div class="row"><button class="btn ghost" data-a="title">Voltar</button></div></div>`,'','caps');
  };
}
if(!globalThis.CAPS_UI){
  globalThis.CAPS_UI=true;
  {const tt=UI.title.bind(UI); UI.title=function(){tt();try{const m=OV.querySelector('.menu');if(!m||m.querySelector('[data-a=caps]'))return;
    const b=document.createElement('button');b.className='btn';b.dataset.a='caps';b.textContent='Capítulos extras';
    const ref=m.querySelector('[data-a=controls]');m.insertBefore(b,ref||null);}catch(e){}};}
  {const ua=UI.act.bind(UI); UI.act=function(a,ds){
    if(a==='caps')return this.caps();
    if(a==='cap'){const c=(globalThis.CAPS||[]).find(c=>c.id===(ds&&ds.k));if(c){this.close();try{c.start();}catch(e){console.error(e);this.title();}}return;}
    return ua(a,ds);};}
  {const ub=UI.back.bind(UI); UI.back=function(){if(this.cur==='caps')return this.title();return ub();};}
}

// ---------- o bairro: linhas novas abaixo do mapa ----------
const NY=HZO;                                   // primeira linha de Navegantes
const NAV_D={name:'Navegantes · Rua das Gaivotas',short:'Navegantes',mx:90,y0:NY,y1:HT-1,cap:0,count:0,spawn:{zumbi:1},loot:{garrafa:1}};
(function(){const gw=genWorld;genWorld=function(){const i=DISTRICTS.indexOf(NAV_D);if(i>=0)DISTRICTS.splice(i,1);try{gw();}finally{DISTRICTS.push(NAV_D);}};})();
DISTRICTS.push(NAV_D);
// no mundo principal as linhas novas são parede (nada é sorteado aqui: o RNG do mundo não muda)
(function(){const g=genV12;genV12=function(){g();for(let y=NY;y<HT;y++)for(let x=0;x<W;x++){const k=idx(x,y);map[k]=T.BORDER;under[k]=T.BORDER;bmap[k]=-1;safeMask[k]=0;meta[k]=0;}};})();

const SN={on:false,st:0};
const SNN=['sonia','rafa','nvRadio','balseiro'];
const SNST=['radio','sinal','esconder','garrafas','avenida','predio','cristo','ferry','fuga','fim'];
const snT=(x,y)=>({x:tc(x),y:tc(y)});
// lugares (tiles); y relativo a NY
const SNP={quarto:[20,6],radio:[10,4],cozinhaG:[13,4],porta:[11,11],bar:[56,7],barG:[[52,5],[59,5],[61,8]],sinal:[108,25],caixa:[109,22],
  bHome:[100,44],casaTia:[14,14],praca:[108,28],bloq:[121,45],passou:[126,45],predioPorta:[134,42],predioDentro:[134,36],janela:[139,37],
  terminal:[161,51],cabo:[164,59],cabine:[170,50],rampa:[160,56],trapiche:[61,59],heli:[91,69],cristo:[172,71],lab:[118,67]};
const snP=(k)=>{const p=SNP[k];return [p[0],NY+p[1]];};
const snA=(k)=>{const p=SNP[k];return snT(p[0],NY+p[1]);};

ETYPES.balseiro={n:'O Balseiro',hp:99999,spd:84,dmg:26,r:16,col:'#b8962a',skin:'#8f9682',sight:340};
PCH.nvRadio={name:'Rádio da Defesa Civil',skin:'#c8a888',shade:'#90705a',hair:'#3a3a3a',iris:'#2a2a2a',bg:['#1a1a1a','#050505'],glow:'200,200,200',voice:140};
PCH.balseiro={name:'O Balseiro',skin:'#8f9682',shade:'#5a6050',hair:'#2a2a24',iris:'#e8e0c0',bg:['#2a2410','#080602'],glow:'220,180,60',voice:70};
LOOKS.sonia={coat:'#6a3a52',skin:'#e8bfa2',hair:'#2a1810',pants:'#23242a',look:'sonia'};
LOOKX.sonia=function(o){ctx.fillStyle=o.hair;ctx.beginPath();ctx.ellipse(-1.8,0,6.4,6.6,0,0,6.283);ctx.fill();
  ctx.beginPath();ctx.ellipse(-8.5,0,4.6,2.6,0,0,6.283);ctx.fill();ctx.beginPath();ctx.ellipse(-12,.5,3,1.8,.2,0,6.283);ctx.fill();
  ctx.fillStyle=o.skin;ctx.beginPath();ctx.arc(2.4,0,3.9,-1.15,1.15);ctx.fill();};
Object.assign(INT_LABEL,{snRadio:'Rádio de pilha da tia',snJanela:'Olhar pela janela',snCabo:'Soltar o cabo da balsa'});
if(typeof ACH!=='undefined')ACH.push({id:'capSonia',n:'Do outro lado do rio',d:'Termine o capítulo extra da Sonia em Navegantes.'});

function snRect(x,y,w,h,t){rect(x,NY+y,w,h,t);}
function snHouse(x,y,w,h,side,o={}){const b=building(x,NY+y,w,h,{floor:o.floor??T.WOOD,roof:o.roof||pick(ROOFS),doors:[[side,o.off,o.wd||2]],name:o.name||'',kind:o.kind||'casa'});
  b.lit=false; b.noZ=true; if(!o.empty)furnish(b,.25,[1,2,3,12,14]); if(o.locker)autoLocker(b); return b;}

function genNav(){
  const old=rnd; rnd=mulberry32(19011);
  for(let y=NY;y<HT;y++)for(let x=0;x<W;x++){const k=idx(x,y);map[k]=T.GRASS;under[k]=T.GRASS;meta[k]=0;bmap[k]=-1;safeMask[k]=0;mark[k]=0;rdir[k]=0;reach[k]=0;explored[k]=0;tvar[k]=R();}
  for(let x=0;x<W;x++){setT(x,NY,T.BORDER);setT(x,HT-1,T.BORDER);}
  for(let y=NY;y<HT;y++){setT(0,y,T.BORDER);for(let x=184;x<W;x++)setT(x,y,x===184?T.FOREST:T.BORDER);}
  snRect(1,1,183,2,T.FOREST);
  // ruas
  hroad(2,118,NY+12); snRect(2,11,117,1,T.SIDE); snRect(2,16,117,1,T.SIDE);
  vroad(34,NY+16,NY+43); vroad(96,NY+16,NY+43);
  hroad(2,182,NY+44); snRect(2,43,181,1,T.SIDE); snRect(2,48,181,1,T.SIDE);
  // beira-rio, rio e a outra margem (Itajaí)
  snRect(1,49,183,4,T.CONC); snRect(1,53,183,1,T.SAND); snRect(1,54,183,10,T.WATER); snRect(1,64,183,16,T.CONC);
  for(let x=1;x<184;x++)if((x*7)%11<3)setT(x,NY+53,T.ROCK);
  snRect(60,53,3,8,T.PIER); for(const y of [55,58])for(const x of [60,62])prop(x,NY+y,7);
  // tapume e prédios que fecham o lado leste: só se passa pela avenida
  snRect(119,3,2,40,T.FENCE); snRect(119,49,2,4,T.FENCE);
  // casas do lado norte da Rua das Gaivotas
  const tia=snHouse(8,3,16,8,'S',{off:3,name:'Casa da tia Neusa',empty:true});
  iwall(tia,16,NY+4,16,NY+9,[[NY+6,2]]);
  for(const [x,y,m] of [[9,4,3],[11,4,9],[12,8,1],[13,8,1],[9,8,2],[21,4,1],[22,4,1],[21,9,14]])prop(x,NY+y,m);
  addHide(22,NY+8,'armario');
  SN.bTia=tia.id;
  snHouse(26,3,10,8,'S',{locker:true}); snHouse(38,4,10,7,'S');
  const bar=snHouse(50,3,14,8,'S',{off:5,name:'Bar do Gringo',empty:true,floor:T.TILEF});
  for(let x=52;x<=61;x++)if(x!==56)prop(x,NY+6,13); prop(54,NY+9,2); prop(60,NY+9,2); SN.bBar=bar.id;
  snHouse(66,3,10,8,'S',{locker:true}); snHouse(78,4,12,7,'S'); snHouse(102,3,9,8,'S'); snHouse(112,4,6,7,'S',{empty:true});
  // lado sul: casas, mercadinho e a praça da caixa d'água
  snHouse(4,19,12,8,'N',{locker:true}); snHouse(18,19,12,8,'N'); snHouse(4,31,12,9,'S'); snHouse(18,31,12,9,'S',{locker:true});
  snHouse(40,19,14,8,'N'); snHouse(58,19,12,8,'N',{locker:true}); snHouse(74,19,18,9,'N');
  snHouse(40,31,16,10,'S',{name:'Mercadinho Boa Maré',floor:T.TILEF}); snHouse(60,31,12,10,'S'); snHouse(76,32,16,9,'S',{locker:true});
  snRect(100,17,18,24,T.GRASS); snRect(100,24,18,2,T.CONC); snRect(107,17,3,24,T.CONC);
  for(const [x,y] of [[109,21],[110,21],[109,22],[110,22]])prop(x,NY+y,15);
  for(const [x,y] of [[102,19],[115,19],[102,33],[115,36],[103,38]])setT(x,NY+y,T.TREE);
  for(const [x,y] of [[104,27],[113,27],[104,22],[113,22]])prop(x,NY+y,17);
  // leste: Edifício Maré Mansa, armazém da colônia e o terminal do ferry
  const ed=building(126,NY+22,18,19,{floor:T.TILEF,roof:'#3a3c40',name:'Edifício Maré Mansa',doors:[['S',8,2]],kind:'predio'}); ed.lit=false; ed.noZ=true; SN.bPred=ed.id;
  iwall(ed,127,NY+31,142,NY+31,[[134,2]]); iwall(ed,131,NY+23,131,NY+30,[[NY+27,2]]);
  for(const [x,y,m] of [[127,23,3],[128,23,9],[140,23,1],[141,23,1],[137,29,2],[127,39,4],[142,39,4],[127,33,14],[141,33,12]])prop(x,NY+y,m);
  snRect(134,41,2,2,T.SIDE); snRect(122,3,62,19,T.FOREST); snRect(121,22,4,21,T.FOREST); snRect(145,22,2,21,T.FOREST);
  const arm=building(148,NY+24,20,17,{floor:T.CONC,roof:'#2e3236',name:'Armazém da Colônia de Pescadores',doors:[['S',9,3]],kind:'armazem'}); arm.lit=false; arm.noZ=true;
  for(let x=151;x<=164;x+=4)for(let y=27;y<=36;y+=4)prop(x,NY+y,4);
  snRect(168,22,16,21,T.FOREST); snRect(147,22,21,2,T.FOREST);
  const term=building(152,NY+49,20,6,{floor:T.CONC,roof:'#4a4038',name:'Terminal do Ferry-Boat',doors:[['N',8,3],['S',8,2]],kind:'terminal'}); term.lit=false; term.noZ=true; SN.bTerm=term.id;
  for(const x of [154,156,165,167])prop(x,NY+51,13);
  addHide(170,NY+50,'armario').cabine=true;
  snRect(159,55,4,2,T.PIER); snRect(154,57,14,6,T.PIER);
  for(let x=153;x<=168;x++){if(x<159||x>162)setT(x,NY+56,T.FENCE);setT(x,NY+63,T.FENCE);} for(let y=56;y<=63;y++){setT(153,NY+y,T.FENCE);setT(168,NY+y,T.FENCE);}
  for(const [x,y] of [[155,58],[166,58]])prop(x,NY+y,7);
  // barricada na avenida: ônibus, carros e entulho, com uma fresta de dois tiles
  for(let y=43;y<=48;y++)if(y!==45&&y!==46){setT(119,NY+y,T.FENCE);setT(120,NY+y,T.FENCE);}
  for(const [x,y] of [[121,43],[122,43],[121,48],[118,48],[118,43],[121,44],[121,47]])prop(x,NY+y,4);
  // carros e caçambas (esconderijos)
  const cars0=cars.length;
  for(const [x,y,h,b] of [[20,13,true,false],[44,14,true,false],[70,13,true,true],[88,14,true,false],[104,13,true,false],[35,26,false,false],[97,33,false,true],[30,45,true,false],[64,46,true,true],[86,45,true,false],[140,46,true,false],[176,45,true,true]])addCar(x,NY+y,h,b);
  for(const c of cars.slice(cars0))if(!c.burn){const it={tx:c.x,ty:c.y,x:(c.x+c.w/2)*TILE,y:(c.y+c.h/2)*TILE,type:'hide',kind:'carro'};interacts.push(it);}
  for(const [x,y] of [[25,16],[48,16],[101,16],[116,18],[33,43],[94,48],[146,43],[150,48]])if(!SOLID[getT(x,NY+y)])addHide(x,NY+y,'cacamba');
  // luzes: quase nada (a luz caiu); fogo dos carros, velas e o gerador do terminal
  for(const [x,y,c,r] of [[10,4,'candle',70],[56,7,'candle',80],[109,25,'lamp',110],[161,51,'siren',90],[134,36,'candle',70],[160,59,'lamp',120],[61,58,'lamp',90]])lights.push({x:tc(x),y:tc(NY+y),r,c,f:1});
  // a outra margem: Itajaí (porto, laboratório, heliponto)
  for(let x=4;x<180;x+=9)lights.push({x:tc(x),y:tc(NY+66),r:90,c:x%2?'flood':'lamp',f:0});
  lights.push({x:tc(SNP.lab[0]),y:tc(NY+SNP.lab[1]),r:140,c:'flood',f:1});
  // restos
  for(const [x,y,r] of [[46,13,1.2],[66,45,.4],[124,45,2.6],[126,46,1.9],[90,50,.2],[150,45,4]])GORE.push({k:'corpse',x:tc(x),y:tc(NY+y),rot:r,type:'zumbi',col:'#3a3e3a',skin:'#a89880',r:11});
  for(const [x,y] of [[46,14],[124,46],[125,45],[110,26],[160,52],[57,9]])GORE.push({k:'blood',x:tc(x),y:tc(NY+y),r:24,rot:0,seed:.4});
  graf(60,NY+15,'NÃO SAIA DE CASA',{rot:-.05}); graf(162,NY+47,'TRAVESSIA SUSPENSA',{rot:0,c:'#d8d4c8'}); graf(126,NY+42,'TEM GENTE NO 4º',{rot:.04});
  graf(108,NY+30,'ELE VOLTOU DO RIO',{rot:-.08});
  // itens: garrafas e pilha
  addPick(SNP.cozinhaG[0],NY+SNP.cozinhaG[1],'garrafa',1); for(const [x,y] of SNP.barG)addPick(x,NY+y,'garrafa',1);
  addPick(43,NY+36,'garrafa',1); addPick(63,NY+36,'pilha',1); addPick(158,NY+31,'garrafa',2); addPick(140,NY+25,'ervaV',1); addPick(26,NY+23,'ervaV',1);
  // árvores no canteiro da avenida e nos quintais
  for(let x=4;x<118;x+=7)if(getT(x,NY+17)===T.GRASS)setT(x,NY+17,T.TREE);
  rnd=old;
  // alcance a partir do quarto
  const q=[],s=idx(SNP.quarto[0],NY+SNP.quarto[1]); reach[s]=1; q.push(s);
  while(q.length){const k=q.pop(),x=k%W,y=(k/W)|0;for(const [dx,dy] of DIRS4){const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;const nk=idx(nx,ny);if(reach[nk])continue;if(SOLID[map[nk]])continue;reach[nk]=1;q.push(nk);}}
  if(typeof STATIC!=='undefined'&&STATIC&&STATIC.trees){for(let y=NY;y<HT;y++)for(let x=0;x<W;x++){const k=idx(x,y);if(map[k]===T.TREE)STATIC.trees.push(k);}}
  staticMapImg=null; if(typeof clearChunks==='function')clearChunks(); MAPV++; flowTile=-1;
}

// ---------- utilidades ----------
function snCut(steps,end){playCut([{npc:P,id:'sonia'},...steps],end);}
function snSay(m,t,o){bark('sonia',m,t,o||{});}
function snThink(t,dur){bark('sonia','s',t,{dur:dur||Math.max(2.6,t.length*.05+1.4)});}
function snRich(m,t,dur){bark('rafa',m,t,{radio:true,dur:dur||Math.max(3,t.length*.055+1.6)});}
function snZ(type,tx,ty,o){const [x,y]=freeTileNear(tx|0,ty|0,true);const e=makeEnemy(type,tc(x),tc(y),null);e.sn=1;if(o&&o.col)e.col=o.col;if(o&&o.feed){e.state='feed';e.feedA=rr(0,6.28);}
  if(o&&o.dorm)e.state='dorm'; if(o&&o.chase){e.state='chase';e.lx=P.x;e.ly=P.y;} enemies.push(e);return e;}
function snGo(tx,ty){if(P.inCar)exitCar(true);if(P.hidden)exitHide();const [x,y]=freeTileNear(tx|0,ty|0,true);P.x=tc(x);P.y=tc(y);snapCamera();flowTile=-1;}
function snBal(){return enemies.find(e=>e.alive&&e.type==='balseiro');}
function snBalseiro(tx,ty,st){let b=snBal();const [x,y]=freeTileNear(tx|0,ty|0,true);
  if(!b){b=makeEnemy('balseiro',tc(x),tc(y),null);b.sn=1;b.hunt=false;enemies.push(b);}else{b.x=tc(x);b.y=tc(y);}
  b.state=st||'wander';b.lx=P.x;b.ly=P.y;b.lost=0;b.sawHide=false;b.stun=0;b.nx=P.x;b.ny=P.y;b.it=10;SN.bd=8;return b;}
function snSend(b,x,y,t){if(!b)return;b.state='investigate';b.nx=x;b.ny=y;b.it=t||12;b.stk=0;if(typeof buildNoiseFlow==='function')buildNoiseFlow(x,y);}
function snInt(type,tx,ty,m){const it=m!=null?addInteract(tx,ty,type,m):{tx,ty,x:tc(tx),y:tc(ty),type};if(m==null)interacts.push(it);if(m!=null&&typeof invalidateRect==='function')invalidateRect(tx,ty,1,1);return it;}
function snUnInt(type){for(let i=interacts.length-1;i>=0;i--)if(interacts[i].type===type)interacts.splice(i,1);}
function snLater(ms,fn){const t=SN.tok;later(ms,()=>{if(SN.on&&SN.tok===t)fn();});}
function finishCutSn(){for(let k=0;k<160&&CUT.on;k++){if(CUT.choice)cutChoose(0);else cutSkip();}}

// ---------- começo ----------
function soniaStart(st){
  if(typeof MP!=='undefined'&&MP.on)return;
  newGame('normal');
  for(const k of Object.keys(SN))if(k!=='bTia'&&k!=='bBar'&&k!=='bPred'&&k!=='bTerm')delete SN[k];
  genNav();
  Object.assign(SN,{tok:Math.random(),on:true,st:0,t:0,t0:G.time,deaths:0,scT:rr(22,32),bd:8,hidT:0,awayT:0,hold:0,fuga:null,heartT:0,vul:null,cp:SNP.quarto,radioOk:0,cristo:0,heli:0,ferry:0});
  const F=G.flags; F.tutDone=true; G.tut=null; F.cap='sonia'; F.snCap=true;
  G.mode='play'; G.clock=23*60+48; G.wx='chuva'; G.wxSight=1; enemies=[]; projs=[]; G.comps=[]; G.qte=null; G.struggle=null; P.grab=null; G.lastD=-1;
  for(let i=0;i<P.owned.length;i++){P.owned[i]=false;P.mags[i]=0;} P.owned[8]=true; P.w=8; P.hp=P.max=100; P.bat=100; P.lamp=true; P.lookO=LOOKS.sonia; P.thr='garrafa';
  G.inv=new Array(G.slots).fill(null); G.box=[]; invAdd('pilha',1); if(typeof BARK!=='undefined'&&BARK.q)BARK.q.length=0;
  snGo(SNP.quarto[0],NY+SNP.quarto[1]); P.ang=Math.PI; markExplored&&markExplored();
  // a rua ainda "calma": um vizinho deitado na calçada e um vulto lá longe
  snZ('zumbi',46,NY+14,{dorm:true}); snZ('zumbi',84,NY+36);
  // os que comem na barricada da avenida
  for(const [x,y] of [[125,45],[126,46],[127,44],[128,46],[126,47]])snZ('zumbi',x,NY+y,{feed:true});
  // o leste
  for(const [x,y] of [[132,46],[146,46],[172,47]])snZ('zumbi',x,NY+y); for(const [x,y] of [[152,29],[163,35]])snZ('zumbi',x,NY+y,{dorm:true});
  if(st)return snJump(st);
  snCut([{fx:'blackout',v:2.2},{sfx:'creak',v:.4},
    {say:'sonia',m:'s',t:'A luz caiu de novo. A TV apagou bem no meio do plantão.',dur:2.6},
    {say:'sonia',m:'n',t:'A tia Neusa saiu pra ver o barco do tio no trapiche. Faz uma hora. O celular dela dá fora de área.',dur:3},
    {sfx:'scream',v:.25},
    {say:'sonia',m:'s',t:'Tia? ...Tia Neusa?'},
    {say:'sonia',m:'n',t:'O rádio de pilha. Fica na cozinha, em cima da geladeira. Pelo menos ele não precisa de luz.',dur:2.8}],
    ()=>{G.banner={t:'Navegantes · Rua das Gaivotas · 23h48 · a mesma noite',life:4.5};});
}
globalThis.CAPS.push({id:'sonia',n:'Capítulo da Sonia',d:'Navegantes, 23h48. Do outro lado do rio, sem arma nenhuma. Só correr, se esconder e não fazer barulho.',start:()=>soniaStart()});

// ---------- objetivos ----------
function snObjective(){
  const s=SN.st, A=snA;
  if(s===0)return {t:'(Sonia) Ache o rádio de pilha da tia, na cozinha',at:A('radio')};
  if(s===1)return {t:'(Sonia) O celular não pega dentro de casa. Procure sinal perto da caixa d\'água da praça',at:A('sinal')};
  if(s===2)return {t:'(Sonia) Tem alguém vindo. Esconda-se: carro, caçamba ou armário',at:null};
  if(s===3){const n=invCount('garrafa');return {t:`(Sonia) A avenida tá cheia deles. Pegue garrafas no Bar do Gringo (${Math.min(n,2)}/2)`,at:n>=2?null:A('bar')};}
  if(s===4)return {t:'(Sonia) Passe pela fresta da barricada. Jogue uma garrafa por cima do tapume, pra beira do rio (G)',at:A('bloq')};
  if(s===5)return {t:'(Sonia) CORRE! Para o Edifício Maré Mansa!',at:A('predioPorta')};
  if(s===6)return {t:'(Sonia) Olhe pela janela do apartamento',at:A('janela')};
  if(s===7)return {t:'(Sonia) Saia do prédio sem ser vista e chegue ao terminal do ferry-boat',at:A('terminal')};
  if(s===8){if(SN.fuga==='balsa')return {t:'(Sonia) Solte o cabo da balsa',at:A('cabo')};
    if(P.hidden&&P.hidden.cabine)return {t:`(Sonia) Não respira. Espere o dia clarear: ${Math.max(0,Math.ceil(SN.hold))} s`,at:null};
    return {t:`(Sonia) Esconda-se na cabine do bilheteiro e espere o dia (${Math.max(0,Math.ceil(SN.hold))} s)`,at:A('cabine')};}
  return {t:'(Sonia) ...',at:null};
}

// ---------- o capítulo, passo a passo ----------
function snTick(dt){
  if(!SN.on||G.mode!=='play')return;
  if(P.owned[0]||P.w!==8){for(let i=0;i<8;i++)P.owned[i]=false;P.w=8;}
  if(CUT.on)return;
  SN.t+=dt; const s=SN.st, b=snBal(), near=(k,r)=>{const a=snA(k);return hyp(P.x-a.x,P.y-a.y)<r;};
  if(s<5)G.clock=Math.min(G.clock,23*60+59); else if(s<8)G.clock=clamp(G.clock,3*60+10,4*60+40); else G.clock=Math.min(G.clock,5*60+10);
  snScares(dt); snBalTick(b,dt);
  if(s===0){/* o rádio é pelo interagir */}
  else if(s===1){if(near('sinal',70))snLigacao();}
  else if(s===2){
    if(!b){snBalseiro(SNP.bHome[0],NY+SNP.bHome[1]);}
    const bb=snBal(), d=bb?hyp(bb.x-P.x,bb.y-P.y):9999;
    if(P.hidden&&d<760&&!bb.sawHide)SN.hidT+=dt; if(d>1100)SN.awayT+=dt; else SN.awayT=0;
    if(P.hidden&&d<170&&!SN.closeB){SN.closeB=1;AU.breath&&AU.breath(1);G.shake+=2;snThink('Não respira. Não respira. Não respira.',2.2);}
    if(SN.hidT>7||SN.awayT>4){SN.st=3;SN.cp=SNP.casaTia;snSend(bb,tc(SNP.casaTia[0]),tc(NY+SNP.casaTia[1]),20);
      snLater(500,()=>{AU.drag&&AU.drag(.6);snThink('Ele foi... pro lado da casa da tia. Arrastando aquele gancho no asfalto.',3);});
      snLater(4200,()=>snThink('Se a saída é por Itajaí, eu atravesso. O ferry fica no fim da avenida.',3));}}
  else if(s===3){if(invCount('garrafa')>=2){SN.st=4;SN.cp=[96,44];snThink('Duas garrafas. A vovó dizia que barulho chama bicho. Hoje eu quero chamar.',3);}}
  else if(s===4){if(P.x>tc(123)&&P.y>tc(NY+42)&&P.y<tc(NY+53))snPassou();}
  else if(s===5){if(G.inB===SN.bPred)snPredio();}
  else if(s===7){if(G.inB===SN.bTerm&&P.y>tc(NY+49))snTerminal();}
  else if(s===8){
    if(SN.fuga==='cabine'){if(P.hidden&&P.hidden.cabine){SN.hold-=dt;
        SN.srT=(SN.srT||3)-dt; if(SN.srT<=0&&b){SN.srT=rr(6,9);const c=snA('cabine');snSend(b,c.x+rr(-90,40),c.y+rr(-20,40),8);AU.drag&&AU.drag(.5);}
        if(b&&hyp(b.x-P.x,b.y-P.y)<90&&!SN.closeC){SN.closeC=1;AU.breath&&AU.breath(1);G.shake+=3;snThink('Ele tá do outro lado da porta. Eu ouço ele respirando pela fresta.',2.6);}
        if(SN.hold<=0)snFinal('cabine');}}
    if(P.hp<20)P.hp=20;
  }
}
// o Balseiro: sem perseguir pelo mapa todo, mas sempre rondando por perto
function snBalTick(b,dt){
  if(!b)return; const d=hyp(b.x-P.x,b.y-P.y);
  if(b.state==='chase'||b.state==='search'){b.c2=Math.max(b.c2,0);}
  SN.bd-=dt;
  if(SN.bd<=0&&b.state!=='chase'&&SN.st>=3&&SN.st!==6){
    SN.bd=SN.st===8?rr(6,9):rr(9,15);
    if(d>620){const a=Math.random()*6.283,r=rr(140,280);const [x,y]=freeTileNear(((P.x+Math.cos(a)*r)/TILE)|0,((P.y+Math.sin(a)*r)/TILE)|0,true);snSend(b,tc(x),tc(y),10);}
  }
  if(d>1900&&SN.st>=3&&b.state!=='chase'){const a=Math.random()*6.283;const [x,y]=freeTileNear(((P.x+Math.cos(a)*900)/TILE)|0,((P.y+Math.sin(a)*900)/TILE)|0,true);if(hyp(tc(x)-P.x,tc(y)-P.y)>700){b.x=tc(x);b.y=tc(y);}}
  // passos pesados, coração
  SN.stepT=(SN.stepT||0)-dt; if(d<560&&SN.stepT<=0){SN.stepT=b.state==='chase'?.42:.7;AU.thud&&AU.thud(clamp(.5-d/1300,.06,.4));if(Math.random()<.18&&AU.drag)AU.drag(clamp(.5-d/1300,.08,.4));}
  SN.heartT-=dt; if(d<480&&SN.heartT<=0){SN.heartT=clamp(d/600,.38,.85);AU.heart(clamp(1.1-d/480,.25,1));}
  G.fear=Math.max(G.fear||0,clamp(1-d/560,0,1)*(b.state==='chase'?1:.7));
  if(b.state==='chase'&&!SN.saw){SN.saw=1;AU.roar();G.shake+=5;if(SN.st<5)snLater(300,()=>snThink(pick2(['Ele me viu. CORRE.','Não olha pra trás. Corre, Sonia!','A capa amarela. Ele tá vindo!']),1.8));}
  if(b.state!=='chase')SN.saw=0;
}
function snLigacao(){
  SN.st=2; SN.cp=SNP.praca;
  snCut([{sfx:'blip',v:1},{say:'sonia',m:'n',t:'Duas barrinhas. Pega, pega, pega...',dur:1.8},
    {sfx:'phone',v:1},{wait:.6},
    {say:'sonia',m:'s',t:'Richard?! Graças a Deus... eu tô ligando faz uma hora. Tô na casa da minha tia, em Navegantes. Aqui ainda tá calmo.'},
    {say:'rafa',m:'n',radio:true,t:'Tô na Dona Cida, na Avenida Brasil. Amor, tá todo mundo virando. Todo mundo.'},
    {say:'sonia',m:'n',t:'Escuta: a TV diz que o Exército fechou tudo. Se tem saída, é por Itajaí, pelo porto. Eu vou ficar no telefone contigo enquanto der.'},
    {say:'sonia',m:'h',t:'Se tu se perder, eu te ajudo. Tô com o mapa da cidade aberto aqui. Te amo. Volta pra mim.'},
    {sfx:'static',v:.8},
    {say:'sonia',m:'s',t:'Calmo. Eu disse que aqui tava calmo.',dur:2},
    {fx:'shake',v:4},{sfx:'creak',v:1},
    {do:()=>{const b=snBalseiro(SNP.bHome[0],NY+SNP.bHome[1]);snSend(b,P.x+rr(-60,60),P.y+rr(40,90),14);CUT.actors.balseiro=b;}},
    {cam:'balseiro',t:1.6},
    {say:'sonia',m:'s',t:'Uma capa amarela. É o seu Darci, do ferry. Ele arrasta o gancho de amarrar a balsa... e a cabeça dele tá torta pro lado.',dur:3.4},
    {camFree:1},{say:'sonia',m:'s',t:'Esconde. Agora.',dur:1.4}],
    ()=>{toast('Esconderijos: carro, caçamba ou armário (E). Lá dentro ele não te vê.');for(const [x,y] of [[78,14],[30,26]])snZ('zumbi',x,NY+y);});
}
function snRadio(o){
  if(SN.radioOk)return toast('Só chiado. E a mesma gravação, de novo e de novo.');
  SN.radioOk=1; AU.static(1,.8);
  snCut([{sfx:'static',v:1},
    {say:'nvRadio',m:'n',radio:true,t:'...Defesa Civil de Santa Catarina. Atenção, moradores do litoral: o Exército interditou a BR-101 e as pontes de Balneário Camboriú.'},
    {say:'nvRadio',m:'t',radio:true,t:'Moradores de Navegantes: permaneçam em casa. A travessia do ferry-boat para Itajaí está suspensa por tempo indeterminado.'},
    {say:'nvRadio',m:'s',radio:true,t:'Não abram a porta para pessoas feridas. Repetindo: não abram a porta para...'},
    {sfx:'static',v:1},{say:'sonia',m:'s',t:'Para pessoas feridas? Que tipo de aviso é esse?'},
    {sfx:'knock',v:1},{fx:'shake',v:4},
    {say:'sonia',m:'s',t:'Bateram na porta. Três vezes. Devagar.',dur:2.2},
    {wait:1.2},{sfx:'knock',v:1},
    {say:'sonia',m:'s',t:'A tia tem a chave. A tia nunca bate.',dur:2.2},
    {say:'sonia',m:'n',t:'O celular não pega aqui dentro. Na praça da caixa d\'água sempre tem sinal. E a garrafa do tio, em cima do balcão... leva.',dur:3.2}],
    ()=>{SN.st=1;SN.cp=SNP.porta;
      snLater(9000,()=>{if(SN.on&&SN.st<=2)snVulto(snA('porta').x+260,snA('porta').y+30);});});
}
function snPassou(){
  SN.st=5; SN.cp=SNP.passou;
  const b=snBalseiro(108,NY+45,'chase'); b.hunt=true; b.huntT=99;
  AU.roar(); G.shake+=8; buzz([60,40,90]);
  snLater(200,()=>{snThink('Passei... AI MEU DEUS, ELE TAVA ATRÁS DE MIM O TEMPO TODO!',2.2);});
  snLater(2600,()=>{snThink('O prédio da esquina! A porta do Maré Mansa tá aberta!',2.2);});
}
function snPredio(){
  SN.st=6; SN.cp=SNP.predioDentro; const b=snBal();
  snCut([{fx:'slam'},{say:'sonia',m:'s',t:'Fecha, fecha, FECHA!'},
    {do:()=>{if(b){b.hunt=false;b.state='wander';const [x,y]=freeTileNear(134,NY+46,true);b.x=tc(x);b.y=tc(y);}for(const e of enemies)if(e.alive&&e.sn&&e!==b&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<500)killEnemy(e);}},
    {sfx:'knock',v:1},{fx:'shake',v:10},{sfx:'thud',v:1},
    {say:'sonia',m:'s',t:'O gancho bateu na porta de vidro. Uma vez. Duas. E parou.',dur:2.4},
    {say:'sonia',m:'s',t:'Quarto andar. Apartamento 41. A porta tava aberta. Tem um sofá e uma janela pro rio.',dur:2.8},
    {fx:'blackout',v:3},
    {do:()=>{G.clock=3*60+12;G.banner={t:'Edifício Maré Mansa · 4º andar · 03h12',life:4};snGo(SNP.predioDentro[0],NY+SNP.predioDentro[1]);P.ang=0;
      if(b){const [x,y]=freeTileNear(160,NY+46,true);b.x=tc(x);b.y=tc(y);b.state='wander';}
      snInt('snJanela',SNP.janela[0],NY+SNP.janela[1],24);}},
    {say:'sonia',m:'s',t:'Três horas no escuro. A bateria do celular em dezenove por cento. Ninguém subiu a escada.',dur:3},
    {say:'sonia',m:'n',t:'Lá fora, uma luz. Do lado de Balneário.',dur:2}]);
}
function snJanela(o){
  if(SN.cristo)return toast('O Cristo continua aceso. E o porto de Itajaí, todo apagado, menos uma luz.');
  SN.cristo=1; snUnInt('snJanela'); setT(o.tx,o.ty,T.TILEF); if(typeof invalidateRect==='function')invalidateRect(o.tx,o.ty,1,1);
  const c=snA('cristo'), h=snA('heli');
  snCut([{cam:{x:c.x-180,y:c.y-60},t:1.8},{do:()=>{AU.thud(.5);G.light=Math.max(G.light,.35);}},
    {say:'sonia',m:'s',t:'O Cristo... o Cristo Luz acendeu. Lá em Balneário.'},
    {sfx:'phone',v:1},
    {say:'sonia',m:'h',t:'Richard?! O Cristo acendeu! Eu tô vendo daqui do prédio! Foi tu? ...Foi tu, né. Eu sabia.'},
    {wait:.6},{sfx:'static',v:.8},{fx:'blackout',v:1.4},
    {do:()=>{G.clock=Math.max(G.clock,4*60+5);G.banner={t:'04h05',life:2.4};}},
    {cam:{x:h.x,y:h.y-200},t:1.6},
    {say:'sonia',m:'h',t:'Tu tá em Itajaí? Eu tô do outro lado do rio, em Navegantes! Dá pra ver o porto daqui.'},
    {say:'sonia',m:'n',t:'Tem uma luz piscando lá em cima, no heliponto. Vai pra lá. Eu te espero.'},
    {sfx:'beep',v:1},{say:'sonia',m:'s',t:'Bateria fraca. Desligou. Não. Não, não, não.',dur:2.2},
    {say:'sonia',m:'t',t:'Se ele vai pro heliponto, eu vou pro ferry. O mais perto que eu conseguir dele.',dur:2.8},
    {camFree:1}],
    ()=>{SN.st=7;SN.cp=SNP.predioDentro;const b=snBal()||snBalseiro(150,NY+46);snSend(b,tc(134.5),tc(NY+45),14);
      for(const [x,y] of [[140,47],[156,46],[128,50]])snZ(Math.random()<.3?'corr':'zumbi',x,NY+y);
      snLater(2500,()=>{AU.drag&&AU.drag(.7);snThink('Ele tá lá embaixo. Na frente da porta. Esperando.',2.4);});});
}
function snTerminal(){
  SN.st=8; SN.cp=SNP.terminal; const h=snA('heli');
  snCut([{say:'sonia',m:'s',t:'O terminal. Vazio. A balsa amarrada na rampa, balançando.',dur:2.4},
    {sfx:'heli',v:1},{cam:{x:h.x,y:h.y-140},t:1.2},
    {do:()=>{SN.heli=G.time;AU.heli();}},{wait:3},
    {say:'sonia',m:'s',t:'Um helicóptero. Subindo do porto. No meio da fumaça.'},
    {say:'sonia',m:'t',t:'Ele conseguiu. Eu sei que ele conseguiu. Eu sei.',dur:2.4},
    {camFree:1},{sfx:'roar',v:1},{fx:'shake',v:8},
    {say:'sonia',m:'s',t:'E o Balseiro ouviu também. Ele tá vindo pela avenida.',dur:2.2},
    {choice:[
      {t:'Soltar a balsa e deixar o rio levar',do:()=>{SN.fuga='balsa';snInt('snCabo',SNP.cabo[0],NY+SNP.cabo[1],7);}},
      {t:'Se trancar na cabine e esperar o dia',do:()=>{SN.fuga='cabine';SN.hold=45;}}]}],
    ()=>{const b=snBal()||snBalseiro(161,NY+42);const [x,y]=freeTileNear(161,NY+43,true);if(hyp(b.x-P.x,b.y-P.y)<400){b.x=tc(x);b.y=tc(y-4);}snSend(b,tc(161),tc(NY+50),12);SN.bd=8;
      toast(SN.fuga==='balsa'?'O cabo fica no cais da balsa. Puxar faz barulho.':'A cabine do bilheteiro fica no canto do terminal. Entre e não saia.');});
}
function snCabo(o){
  if(G.struggle)return;
  startStruggle({label:'Soltando o cabo da balsa',need:100,pump:9,hold:14,noise:520,sfx:'creak',x:o.x,y:o.y,
    quit:'A Sonia largou o cabo. Ainda tá preso.',
    onDone:()=>{snUnInt('snCabo');snFinal('balsa');}});
  const b=snBal(); if(b)snSend(b,o.x,o.y,10);
}
function snFinal(kind){
  if(SN.st>=9)return; SN.st=9; G.struggle=null; const b=snBal();
  if(P.hidden)exitHide();
  const r=snA('rampa');
  const steps=kind==='balsa'?[
    {fx:'slam'},{do:()=>{SN.ferry=G.time;AU.creak(1);AU.splash&&AU.splash(1);if(b){b.state='wander';b.x=r.x;b.y=r.y-40;b.stun=99;}}},
    {say:'sonia',m:'s',t:'Soltou! Soltou!'},
    {sfx:'roar',v:1},{cam:r,t:1.2},
    {say:'sonia',m:'s',t:'Ele chegou na rampa. Parou na beirada. Ficou olhando a balsa ir embora, com o gancho pendurado.',dur:3},
    {say:'sonia',m:'t',t:'Eles não entram na água. O seu Darci nunca soube nadar.',dur:2.4},
    {fx:'blackout',v:3},
    {say:'sonia',m:'n',t:'A correnteza levou a balsa pro meio do rio. Do meio do rio, dá pra ver as duas margens.',dur:3},
    {say:'sonia',m:'h',t:'Eu vi o helicóptero subir. E soube.',dur:2.4}]
   :[{fx:'blackout',v:3},{do:()=>{G.clock=5*60+40;if(b){b.state='wander';b.stun=99;}}},
    {say:'sonia',m:'s',t:'Quarenta e cinco minutos. Ou quatro horas. Ele arranhou a porta da cabine até parar.',dur:3},
    {say:'sonia',m:'n',t:'Quando o céu ficou cinza, eu ouvi passos indo embora. Arrastando o gancho. Pro lado do rio.',dur:3},
    {say:'sonia',m:'h',t:'Eu tinha visto o helicóptero subir. E soube.',dur:2.4}];
  snCut(steps,()=>snEnd(true,kind));
}
function snEnd(won,kind){
  const mins=Math.max(1,Math.round((G.time-(SN.t0||0))/60)), dt=SN.deaths||0;
  SN.on=false; P.lookO=null; G.struggle=null; enemies=[]; projs=[]; if(G.flags)delete G.flags.cap;
  if(won&&typeof ach==='function')ach('capSonia');
  G.mode='title'; document.getElementById('tc').hidden=true;
  if(!won)return UI.title();
  const fim=kind==='balsa'?'A balsa desceu o rio no escuro, sem motor e sem ninguém no leme. A Sonia ficou na proa, olhando o porto de Itajaí sumir na fumaça.'
    :'De manhã, a Sonia saiu da cabine do bilheteiro. O terminal estava vazio. Na rampa, só um gancho de ferro, largado no concreto.';
  UI.open(`<div class="paper intro"><p class="stamp">Capítulo extra · concluído</p>
    <p>${fim}</p>
    <p>Do outro lado do rio, em Navegantes, a Sonia viu o helicóptero subir no meio da fumaça, e soube. O resto da história você já conhece. Ou vai conhecer.</p>
    <p>Tempo: ${mins} min · Quedas: ${dt}</p>
    <div class="row"><button class="btn primary" data-a="title" data-focus>Voltar ao título</button></div></div>`,'','capfim');
}

// ---------- sustos aleatórios ----------
function snVulto(x,y){SN.vul={x,y,vx:rr(-1,1)<0?-340:340,t:1.1};AU.sting();}
function snScares(dt){
  if(SN.vul){const v=SN.vul;v.x+=v.vx*dt;v.t-=dt;if(v.t<=0)SN.vul=null;}
  SN.scT-=dt; if(SN.scT>0||SN.st===6||SN.st>=9)return; SN.scT=rr(24,42);
  const b=snBal(), bd=b?hyp(b.x-P.x,b.y-P.y):9999; if(bd<380)return;
  const k=ri(0,8);
  if(k===0){G.flick=.6;AU.static(.6,.4);snThink(pick2(['A lanterna piscou. Pilha da tia, comprada no camelô.','Não apaga. Por favor, não apaga agora.']));}
  else if(k===1){AU.knock();snThink(pick2(['Batidas... de dentro daquela casa. Tem alguém trancado ali.','Alguém batendo numa janela. Devagar. Com a testa.']));}
  else if(k===2){AU.scream(.35);snThink(pick2(['Um grito, lá pro lado da Meia Praia. E depois mais nada.','Era voz de criança. Não para, Sonia. Não para.']));}
  else if(k===3){AU.shipHorn();snThink('O apito da balsa. Mas a balsa tá amarrada. Quem tá apitando?',2.6);}
  else if(k===4){AU.phone(.4);toast('Chamada perdida: Tia Neusa');snThink('A tia. Ligou e desligou. Tia, onde tu tá?',2.4);}
  else if(k===5){snVulto(P.x+rr(-60,60)+(Math.random()<.5?-220:220),P.y+rr(-180,-120));snThink('Passou alguém correndo ali na frente. Sem fazer barulho nenhum.',2.4);}
  else if(k===6&&b){AU.drag&&AU.drag(.5);snThink(pick2(['Esse barulho de ferro arrastando... é ele. Tá longe. Eu acho.','O gancho no asfalto. Ele nunca para de andar.']));}
  else if(k===7){const a=Math.random()*6.283;const e=snZ('rast',((P.x+Math.cos(a)*260)/TILE)|0,((P.y+Math.sin(a)*260)/TILE)|0,{dorm:true});if(e){e.state='chase';e.rising=.9;e.lx=P.x;e.ly=P.y;AU.groan(e,1);}snThink('O corpo da calçada... mexeu. Tá se arrastando pra cá!',2);}
  else {AU.tn&&(AU.tn(520,380,.25,'sawtooth',.05),AU.tn(480,300,.3,'sawtooth',.04,.4),AU.tn(900,200,.4,'square',.03,1.2));snThink('O cachorro do vizinho latiu. E ganiu. E parou.',2.4);}
}

// ---------- desenho ----------
function snDraw(){
  if(!SN.on)return;
  for(const it of interacts){
    if(it.type==='snRadio'&&!SN.radioOk||it.type==='snRadio'){if(!inV(it.x,it.y,30))continue;ctx.fillStyle='#3a2a1e';ctx.fillRect(it.x-10,it.y-6,20,12);ctx.fillStyle='#c8b070';ctx.fillRect(it.x-7,it.y-3,7,6);ctx.fillStyle='#8a8a8a';ctx.fillRect(it.x+2,it.y-3,6,1.5);ctx.fillRect(it.x+2,it.y,6,1.5);
      ctx.strokeStyle='#8a8a8a';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(it.x+8,it.y-6);ctx.lineTo(it.x+14,it.y-16);ctx.stroke();}
    if(it.type==='snJanela'){ctx.fillStyle=`rgba(120,150,190,${.35+Math.sin(G.time*2)*.1})`;ctx.fillRect(it.x-14,it.y+8,28,6);}
    if(it.type==='snCabo'){ctx.strokeStyle='#a8946a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(it.x,it.y);ctx.quadraticCurveTo(it.x-40,it.y-30,it.x-60,it.y-92);ctx.stroke();
      ctx.strokeStyle=`rgba(212,154,60,${.4+Math.sin(G.time*4)*.25})`;ctx.lineWidth=2;ctx.strokeRect(it.x-12,it.y-12,24,24);}
  }
  // a balsa (casco por baixo do convés)
  const fx=tc(153)-16,fy=tc(NY+56)-16, off=0;
  if(inV(fx+240,fy+120,400)){ctx.save();ctx.translate(off*.15,off);
    ctx.strokeStyle='#d8d4c8';ctx.lineWidth=3;ctx.strokeRect(fx+4,fy+36,TILE*16-8,TILE*7-8);
    ctx.fillStyle='rgba(30,40,46,.85)';ctx.fillRect(fx+TILE*13,fy+TILE*2,TILE*2,TILE*4);ctx.fillStyle='#c8b84a';ctx.fillRect(fx+TILE*13+4,fy+TILE*2+6,TILE*2-8,10);
    ctx.fillStyle='#d8d4c8';ctx.font='700 13px sans-serif';ctx.textAlign='center';ctx.fillText('NAVEGANTES · ITAJAÍ',fx+TILE*7,fy+TILE*7+2);
    ctx.restore();}
  // a outra margem: cais de Itajaí, guindastes, prédios e o morro lá no fundo (Balneário)
  const y0=tc(NY+64)-16;
  if(cam.y+view.h/view.z>y0-40){
    ctx.fillStyle='#07090c';ctx.fillRect(0,y0,W*TILE,(HT-NY-64)*TILE);
    ctx.fillStyle='#1c1f22';ctx.fillRect(0,y0,W*TILE,10);
    ctx.fillStyle='#0d1014';for(let x=4;x<182;x+=6){const X=tc(x),hh=50+((x*37)%110);ctx.fillRect(X,y0+70,TILE*4+((x*13)%40),hh);}
    ctx.fillStyle='#0a0c10';ctx.beginPath();ctx.moveTo(tc(120),HT*TILE);ctx.quadraticCurveTo(tc(150),tc(NY+68),tc(172),tc(NY+70));ctx.quadraticCurveTo(tc(184),tc(NY+71),tc(190),HT*TILE);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#22262b';ctx.lineWidth=6;for(const x of [28,50,72,140]){const X=tc(x);ctx.beginPath();ctx.moveTo(X,y0+180);ctx.lineTo(X,y0+14);ctx.lineTo(X+170,y0+14);ctx.moveTo(X,y0+14);ctx.lineTo(X-60,y0+44);ctx.moveTo(X+120,y0+14);ctx.lineTo(X+120,y0+60);ctx.stroke();}
    ctx.fillStyle='#16191d';ctx.fillRect(tc(88),tc(NY+68),TILE*6,TILE*3);ctx.strokeStyle='#3a3e44';ctx.lineWidth=2;ctx.beginPath();ctx.arc(tc(SNP.heli[0]),tc(NY+SNP.heli[1]),20,0,6.283);ctx.stroke();
    ctx.fillStyle='#3a3e44';ctx.font='700 11px sans-serif';ctx.textAlign='center';ctx.fillText('H',tc(SNP.heli[0]),tc(NY+SNP.heli[1])+4);}
  // o vulto
  if(SN.vul){const v=SN.vul;ctx.globalAlpha=clamp(v.t*1.4,0,.85);drawHuman(v.x,v.y,v.vx>0?0:Math.PI,{coat:'#050506',skin:'#0a0a0a',hair:'#050505',pants:'#050505',walk:G.time*20,moving:true,legAng:v.vx>0?0:Math.PI});ctx.globalAlpha=1;}
}
function snGlow(){
  if(!SN.on)return;
  const blink=(G.time*1.6%1)<.25;
  const h=snA('heli'), l=snA('lab'), c=snA('cristo');
  if(inV(h.x,h.y,300)){const hy=SN.heli?h.y-Math.min(900,(G.time-SN.heli)*55):h.y;
    if(blink||SN.heli){ctx.fillStyle='rgba(255,50,40,.9)';ctx.beginPath();ctx.arc(h.x,hy,SN.heli?4:5,0,6.283);ctx.fill();ctx.fillStyle='rgba(255,50,40,.2)';ctx.beginPath();ctx.arc(h.x,hy,22,0,6.283);ctx.fill();}
    if(SN.heli){ctx.fillStyle='rgba(230,240,255,.12)';ctx.beginPath();ctx.moveTo(h.x-4,hy);ctx.lineTo(h.x-70,hy+260);ctx.lineTo(h.x+70,hy+260);ctx.closePath();ctx.fill();
      ctx.fillStyle='#0a0c0e';ctx.fillRect(h.x-14,hy-5,28,10);ctx.strokeStyle='rgba(180,190,200,.5)';ctx.lineWidth=1.5;const ra=G.time*30;ctx.beginPath();ctx.moveTo(h.x+Math.cos(ra)*24,hy+Math.sin(ra)*6);ctx.lineTo(h.x-Math.cos(ra)*24,hy-Math.sin(ra)*6);ctx.stroke();}}
  if(inV(l.x,l.y,200)){ctx.fillStyle=`rgba(120,230,200,${.25+Math.sin(G.time*3)*.1})`;for(let i=0;i<5;i++)ctx.fillRect(l.x-60+i*26,l.y-20,8,5);}
  if(SN.cristo&&inV(c.x,c.y,300)){const g=ctx.createRadialGradient(c.x,c.y,4,c.x,c.y,120);g.addColorStop(0,'rgba(255,240,200,.55)');g.addColorStop(1,'rgba(255,240,200,0)');ctx.fillStyle=g;ctx.fillRect(c.x-120,c.y-120,240,240);
    ctx.fillStyle='rgba(255,248,225,.95)';ctx.beginPath();ctx.moveTo(c.x-2,c.y-20);ctx.lineTo(c.x+2,c.y-20);ctx.lineTo(c.x+5,c.y+12);ctx.lineTo(c.x-5,c.y+12);ctx.closePath();ctx.fill();ctx.fillRect(c.x-18,c.y-18,36,3);ctx.beginPath();ctx.arc(c.x,c.y-24,3.2,0,6.283);ctx.fill();ctx.fillStyle='rgba(255,248,225,.5)';ctx.fillRect(c.x-6,c.y+12,12,5);}
  // luzes miúdas da cidade do outro lado
  const y0=tc(NY+64); if(cam.y+view.h/view.z>y0-20){for(let x=8;x<180;x+=5){if(((x*13)%7)>2)continue;const X=tc(x),Y=y0+60+((x*29)%90);if(!inV(X,Y,20))continue;ctx.fillStyle=`rgba(255,200,130,${.35+((x*7+(G.time|0))%5===0?.3:0)})`;ctx.fillRect(X,Y,3,3);}}
}
function snDrawBalseiro(e){
  const a=e.face, wk=e.anim*(e.state==='chase'?7:3)*1.5;
  drawHuman(e.x,e.y,a,{coat:'#b8962a',skin:'#8f9682',hair:'#2a2a24',pants:'#232830',walk:wk,moving:true,zombie:true,attack:e.hitAnim>0,s:1.45,noHair:true});
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(a);ctx.scale(1.45,1.45);
  ctx.fillStyle='#8a6e1c';ctx.beginPath();ctx.arc(-.5,1.5,6.6,0,6.283);ctx.fill();ctx.fillStyle='#6a5414';ctx.beginPath();ctx.arc(-2,1.5,4.6,0,6.283);ctx.fill();
  ctx.strokeStyle='#5a5e62';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14,7);ctx.lineTo(28,9);ctx.arc(28,14,5,-1.57,1.2);ctx.stroke();
  ctx.restore();
  if(e.state==='chase'){ctx.fillStyle='rgba(232,224,192,.85)';const ex=e.x+Math.cos(a)*9,ey=e.y+Math.sin(a)*9;ctx.beginPath();ctx.arc(ex+Math.cos(a+1.57)*3,ey+Math.sin(a+1.57)*3,1.3,0,6.283);ctx.arc(ex-Math.cos(a+1.57)*3,ey-Math.sin(a+1.57)*3,1.3,0,6.283);ctx.fill();}
}

// ---------- pulos (menu de teste e testes) ----------
function snJump(k){
  const st=typeof k==='number'?k:SNST.indexOf(k); if(!SN.on)return soniaStart(st>0?st:null); if(CUT.on)finishCutSn();
  if(st>=1){const r=interacts.find(o=>o.type==='snRadio');if(r)snRadio(r);finishCutSn();}
  if(st>=2){snGo(SNP.sinal[0],NY+SNP.sinal[1]);snLigacao();finishCutSn();}
  if(st>=3){SN.hidT=99;snTick(.016);finishCutSn();}
  if(st>=4){invAdd('garrafa',2);snTick(.016);}
  if(st>=5){snGo(SNP.passou[0],NY+SNP.passou[1]);for(const e of enemies)if(e.alive&&e.sn&&e.type!=='balseiro'&&hyp(e.x-P.x,e.y-P.y)<300)killEnemy(e);snTick(.016);}
  if(st>=6){snGo(SNP.predioDentro[0],NY+SNP.predioDentro[1]);if(SN.st===5)snPredio();finishCutSn();}
  if(st>=7){const j=interacts.find(o=>o.type==='snJanela');if(j)snJanela(j);finishCutSn();}
  if(st>=8){snGo(SNP.terminal[0],NY+SNP.terminal[1]);if(SN.st===7)snTerminal();finishCutSn();}
  if(st>=9){snFinal(SN.fuga||'balsa');finishCutSn();}
  SN.tok=Math.random(); if(typeof BARK!=='undefined'&&BARK.q)BARK.q.length=0;
  const b=snBal(); if(b&&st>=3&&st<9&&hyp(b.x-P.x,b.y-P.y)<500){const [x,y]=freeTileNear(((P.x/TILE)|0)-24,(P.y/TILE)|0,true);b.x=tc(x);b.y=tc(y);b.state='wander';b.hunt=false;}
}

// ---------- ganchos: durante o capítulo o resto do jogo fica quieto e não tem arma ----------
(function(){
  const off=fn=>typeof fn==='function'?function(){if(SN.on)return;return fn.apply(this,arguments);}:fn;
  if(typeof syncComps==='function'){const sc=syncComps; syncComps=function(){if(SN.on){G.comps=[];return;}return sc.apply(this,arguments);};}
  if(typeof updSpawner==='function'){const us=updSpawner; updSpawner=function(dt){if(SN.on){G.spawnT=4;return;}return us(dt);};}
  if(typeof updEvents==='function')updEvents=off(updEvents); if(typeof updPlot==='function')updPlot=off(updPlot); if(typeof updTriggers==='function')updTriggers=off(updTriggers);
  if(typeof updScares==='function')updScares=off(updScares); if(typeof updPers==='function')updPers=off(updPers); if(typeof updAfog==='function')updAfog=off(updAfog);
  if(typeof cryTick==='function')cryTick=off(cryTick); if(typeof trapTick==='function')trapTick=off(trapTick); if(typeof psyTick==='function')psyTick=off(psyTick);
  if(typeof soniaTick==='function')soniaTick=off(soniaTick); if(typeof zoeiraTick==='function')zoeiraTick=off(zoeiraTick); if(typeof terrorTick==='function')terrorTick=off(terrorTick);
  if(typeof wxTick==='function')wxTick=off(wxTick);
  STORY.onDistrict=off(STORY.onDistrict);
  if(typeof mascates==='function'){const ms=mascates;mascates=function(){if(SN.on)return [];return ms.apply(this,arguments);};}
  const b=bark; bark=function(who){if(SN.on&&!SNN.includes(who))return;return b.apply(this,arguments);};
  const ob=objective; objective=function(){if(SN.on)return snObjective();return ob.apply(this,arguments);};
  const ws=writeSave; writeSave=function(){if(SN.on)return false;return ws.apply(this,arguments);};
  const sv=UI.save.bind(UI); UI.save=function(){if(SN.on){toast('Não tem máquina de escrever aqui. Só o rio.');return;}return sv();};
  // sem arma: não ataca, não troca de arma, só joga garrafa
  const fi=fire; fire=function(){if(SN.on){P.firing=false;return;}return fi.apply(this,arguments);};
  const sw=switchWeapon; switchWeapon=function(i){if(SN.on)return;return sw.apply(this,arguments);};
  const cw=cycleWeapon; cycleWeapon=function(d){if(SN.on)return;return cw.apply(this,arguments);};
  const ct=curThrow; curThrow=function(){if(SN.on)return 'garrafa';return ct.apply(this,arguments);};
  const tg=throwGrenade; throwGrenade=function(){if(SN.on){P.thr='garrafa';if(invCount('garrafa')<=0){toast('Sem garrafa. Procure no bar ou nas casas.');return;}}return tg.apply(this,arguments);};
  const ke=killEnemy; killEnemy=function(e){if(SN.on&&e&&e.type==='balseiro')return;return ke.apply(this,arguments);};
  const di=die; die=function(){if(SN.on){SN.deaths=(SN.deaths||0)+1;P.hp=P.max;G.struggle=null;P.grab=null;if(P.hidden)exitHide();
      const bb=snBal(); if(bb){bb.state='wander';bb.hunt=false;bb.sawHide=false;const a=Math.random()*6.283;const [x,y]=freeTileNear(((P.x+Math.cos(a)*1000)/TILE)|0,((P.y+Math.sin(a)*600)/TILE)|0,true);bb.x=tc(x);bb.y=tc(y);SN.bd=14;}
      for(const e of enemies)if(e.alive&&e!==bb&&hyp(e.x-P.x,e.y-P.y)<220){const a=Math.atan2(e.y-P.y,e.x-P.x);e.x+=Math.cos(a)*140;e.y+=Math.sin(a)*140;e.stun=2;e.state='wander';}
      if(SN.cp)snGo(SN.cp[0],NY+SN.cp[1]);
      G.blackout=Math.max(G.blackout,1.8);toast('A Sonia acordou no chão, com gosto de sangue na boca. Ainda não. Ainda não.');return;}
    return di.apply(this,arguments);};
  const vi=v12Interact; v12Interact=function(o){if(SN.on){if(o.type==='snRadio')return snRadio(o);if(o.type==='snJanela')return snJanela(o);if(o.type==='snCabo')return snCabo(o);}return vi(o);};
  const vt=v16Tick; v16Tick=function(dt){vt(dt);try{snTick(dt);}catch(e){console.error(e);}};
  const dp=drawParts; drawParts=function(){dp();try{snDraw();}catch(e){console.error(e);}};
  const pl=drawPostLight; drawPostLight=function(){pl();try{snGlow();}catch(e){console.error(e);}};
  const de=drawEnemy; drawEnemy=function(e){if(e&&e.type==='balseiro'){if((e.va??1)<.02)return;ctx.save();ctx.globalAlpha=Math.max(.0,Math.min(1,e.va??1));snDrawBalseiro(e);ctx.restore();return;}return de.apply(this,arguments);};
  const rs=resetState; resetState=function(d){rs(d);SN.on=false;};
  const ua=UI.act.bind(UI); UI.act=function(a,ds){if(SN.on&&(a==='quit'||a==='title')){SN.on=false;P.lookO=null;if(G.flags)delete G.flags.cap;}return ua(a,ds);};
  // celular: sem botão de arma nem de recarga; o de arremesso só com garrafa
  if(typeof updTouchUI==='function'){const ut=updTouchUI; updTouchUI=function(){ut();if(!SN.on)return;
    for(const id of ['tb-wpn','tb-rel']){const el=document.getElementById(id);if(el&&el.classList)el.classList.add('gone');}
    const g=document.getElementById('tb-gren');if(g&&g.classList)g.classList.toggle('gone',invCount('garrafa')<=0);};}
})();
// o rádio da cozinha
(function(){const sg=genNav;genNav=function(){sg();interacts.push({tx:SNP.radio[0],ty:NY+SNP.radio[1],x:tc(SNP.radio[0]),y:tc(NY+SNP.radio[1]),type:'snRadio'});};})();

// ---------- menu de teste ----------
dbgExtra('1.9 · Capítulo da Sonia',[['v19s:start','Começar'],['v19s:sinal','Pular: sinal na praça'],['v19s:esconder','Pular: o Balseiro aparece'],['v19s:garrafas','Pular: garrafas'],
  ['v19s:avenida','Pular: barricada'],['v19s:predio','Pular: correr pro prédio'],['v19s:cristo','Pular: a janela (Cristo)'],['v19s:ferry','Pular: ir pro ferry'],['v19s:fuga','Pular: no terminal'],
  ['v19s:bal','Chamar o Balseiro aqui perto'],['v19s:susto','Susto agora'],['v19s:fim','Ir pro final']],
  (k)=>{UI.close&&UI.close();G.mode='play';const a=k.split(':')[1];
    if(a==='start')return soniaStart();
    if(a==='bal'){if(!SN.on)soniaStart(3);const b=snBalseiro(((P.x/TILE)|0)+8,(P.y/TILE)|0);snSend(b,P.x,P.y,10);return;}
    if(a==='susto'){if(!SN.on)return toast('Comece o capítulo da Sonia antes.');SN.scT=0;return;}
    if(a==='fim'){if(!SN.on)soniaStart(8);else snJump(8);finishCutSn();return snFinal('balsa');}
    if(SN.on)soniaStart(SNST.indexOf(a));else soniaStart(SNST.indexOf(a));});
