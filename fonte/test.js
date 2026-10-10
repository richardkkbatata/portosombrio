// Harness: roda o jogo num DOM falso e simula partidas para achar erros de execução.
const fs=require('fs'), vm=require('vm');
const code=fs.readFileSync(require('path').join(__dirname,'.all.js'),'utf8');
function fakeCtx(){
  const grad={addColorStop(){}};
  const target={measureText:t=>({width:String(t).length*7}),createRadialGradient:()=>grad,createLinearGradient:()=>grad,
    createImageData:(w,h)=>({data:new Uint8ClampedArray(w*h*4)}),getImageData:(x,y,w,h)=>({data:new Uint8ClampedArray(w*h*4)})};
  return new Proxy(target,{get(t,k){if(k in t)return t[k];return ()=>{};},set(t,k,v){t[k]=v;return true;}});
}
function el(id){
  return {id,hidden:false,className:'',innerHTML:'',textContent:'',style:{},dataset:{},width:300,height:150,
    classList:{toggle(){},add(){},remove(){}},addEventListener(){},focus(){},
    querySelector(){return el('q');},querySelectorAll(){return [];},getBoundingClientRect(){return {width:600,height:400,left:0,top:0};},
    getContext(){return fakeCtx();},closest(){return null;}};
}
const els={};
const document={addEventListener(){},body:{appendChild(){}},getElementById:id=>els[id]||(els[id]=el(id)),createElement:()=>el('c'),fonts:{load(){return Promise.resolve();}}};
const store={};
const ctx={console,document,Math,Date,JSON,Set,Map,Proxy,Uint8Array,Int16Array,Int32Array,Float32Array,Uint8ClampedArray,Array,Object,String,Number,Boolean,RegExp,Promise,
  window:null,innerWidth:1280,innerHeight:720,devicePixelRatio:1,
  getComputedStyle:()=>({paddingTop:'0',paddingRight:'0',paddingBottom:'0',paddingLeft:'0'}),
  matchMedia:()=>({matches:false}),
  localStorage:{getItem:k=>store[k]??null,setItem:(k,v)=>{store[k]=String(v);}},
  requestAnimationFrame:()=>0,setInterval:(f)=>{ctx.__iv.push(f);return ctx.__iv.length;},clearInterval:()=>{},__iv:[],setTimeout:(f)=>{ctx.__timeouts.push(f);return 0;},clearTimeout:()=>{},__timeouts:[],
  btoa:s=>Buffer.from(s,'binary').toString('base64'),atob:s=>Buffer.from(s,'base64').toString('binary'),
  addEventListener(){},
};
ctx.window=ctx;
vm.createContext(ctx);
vm.runInContext(code+`
;globalThis.__api={G,P,get enemies(){return enemies},set enemies(v){enemies=v},get pickups(){return pickups},get projs(){return projs},interacts,get gates(){return gates},get npcs(){return npcs},LM,V,exitCar,enterCar,los,alertNoise,DBG,dodge,hurtPlayer,ACHS,OPT,melee,exitHide,spawnBoss,lampOn,CUT,cutSkip,cutChoose,cutTap,get peds(){return peds},EV,spawnSurvivor,evCarStart,evHeliStart,updEvents,mashGrab,enemyHit,map,reach,idx,tc,T,SOLID,TILE,W,H,
 newGame,update,renderWorld,drawHUD,UI,IN,KEYS,TOUCH,fire,throwGrenade,switchWeapon,reload,doInteract,takePickup,findInteract,serialize,loadState,writeSave,readSave,
 invAdd,invCount,craft,RECIPES,quickHeal,startWave,objective,buildings,get buildingsL(){return buildings},makeEnemy,explode,resetState,genWorld,initEnemies,dAt,
 drawMapTo,useGate,closeGate,DLG,isNight,daylight,hourNow,evConvoy,evTrapped,dlgSkip,dlgChoose,dlgAdvance,STORY,updBark,noInput:()=>{readInput=function(){};},openGate,frame:(t)=>frame(t),START,getLM:()=>LM,getStart:()=>START,getPickups:()=>pickups,getInteracts:()=>interacts,getGates:()=>gates,getNpcs:()=>npcs,getBuildings:()=>buildings,getInit:()=>initEnemies,getFires:()=>FIRES,attachSil,toggleCrouch,hosp2B,cidaB,DOCS,toggleFS,bossSmash,silentBC,get FIRESL(){return FIRES},compOf,syncComps,toggleDetector,shopB,hosp2B,clinicB,hurtEnemy,killEnemy,dbgJump};`,ctx);
const A=ctx.__api;
let fails=0; const ok=(c,m)=>{if(!c){fails++;console.log('FALHOU:',m);}};
const finS=()=>{let n=0;while(n++<6){const s=vm.runInContext('G.struggle',ctx);if(!s)break;s.prog=s.need+1;vm.runInContext("(()=>{const m=G.mode,c=CUT.on;G.mode='play';CUT.on=false;struggleTick(.016);G.mode=m;CUT.on=c;})()",ctx);}};

// 1) alcance dos itens-chave e interações
A.newGame('normal');
const LMv=A.getLM(), pk=A.getPickups();
console.log('prédios',A.getBuildings().length,'itens',pk.length,'inimigos iniciais',A.getInit().length,'interações',A.getInteracts().length);
const R=(x,y)=>A.reach[A.idx(x,y)];
{const w=pk.find(p=>p.kind==='walkie');ok(w&&R(w.tx,w.ty),'rádio do arsenal');}
for(const id of ['fusivel','heliKey','bateria','gato']){
  const p=pk.find(p=>p.id===id&&p.kind==='item'); ok(p,'item ausente '+id); if(p)ok(R(p.tx,p.ty),'item inalcançável '+id+' '+p.tx+','+p.ty);
}
for(const p of pk){ok(R(p.tx,p.ty)&&!A.SOLID[A.map[A.idx(p.tx,p.ty)]],`pickup em tile ruim ${p.kind}:${p.id} ${p.tx},${p.ty}`);}
for(const it of A.getInteracts()){
  let adj=false; for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=it.tx+dx,y=it.ty+dy;if(R(x,y)&&!A.SOLID[A.map[A.idx(x,y)]])adj=true;}
  ok(adj,'interação sem acesso '+it.type+' '+it.tx+','+it.ty);
}
for(const n of A.getNpcs()){ok(R((n.x/32)|0,(n.y/32)|0),'npc inalcançável '+n.id);}
for(const g of A.getGates()){
  let sides=0; for(let j=g.y-1;j<=g.y+g.h;j++)for(let i=g.x-1;i<=g.x+g.w;i++){if(i>=g.x&&i<g.x+g.w&&j>=g.y&&j<g.y+g.h)continue;if(R(i,j)&&!A.SOLID[A.map[A.idx(i,j)]])sides++;}
  ok(sides>=2,'portão sem acesso '+g.id);
}
for(const k of ['church','mercado','fusebox','arsenal','heliKey','radio','pad','coreto','posto','cofre','oficina','jipe','clinica','lab','vertice','bloqueio','mirante','itajai','armazem','besta','surf','guarda','roda','cristo','bondinho'])ok(LMv[k],'LM ausente '+k);
for(const k of ['oficina','jipe','clinica','lab','vertice','bloqueio','mirante','itajai','armazem','besta','surf','guarda','posto','coreto','church'])if(LMv[k])ok(R((LMv[k].x/32)|0,(LMv[k].y/32)|0),'LM inalcançável '+k);
// todos os pisos de prédio com loot alcançáveis? (contagem de bolsões)
let pockets=0; const pl=[]; for(let i=0;i<A.W*A.H;i++){const t=A.map[i];if((t===A.T.WOOD||t===A.T.TILEF||t===A.T.SAFE)&&!A.reach[i]){pockets++;pl.push([i%A.W,(i/A.W)|0]);}} console.log(JSON.stringify(pl));
console.log('tiles de piso inalcançáveis:',pockets);

// 2) simulação jogando
function step(n,inp){for(let i=0;i<n;i++){if(A.CUT.on)finishTalk();Object.assign(A.IN,inp||{});A.update(1/60);if(i%6===0){A.renderWorld();A.drawHUD();}}}
const G=A.G,P=A.P; A.noInput();
function finishTalk(){for(let k=0;k<80;k++){if(!A.CUT.on)break;if(A.CUT.choice)A.cutChoose(0);else A.cutSkip();}}
G.mode='play';A.STORY.intro();ok(A.CUT.on,'intro não virou cena');for(let i=0;i<90;i++){A.update(1/60);if(i%10===0){A.renderWorld();A.drawHUD();}if(A.CUT.st&&A.CUT.st.say&&i%20===0)A.cutTap();}finishTalk();ok(!A.CUT.on,'intro não terminou');ok(A.SOLID!=null&&A.P.y>A.getLM().cidaDoor.y+20,'Rafa não entrou no apartamento '+(A.P.y/32|0));ok(G.mode==='play','modo após intro '+G.mode);
G.mode='play';
step(120,{mx:1,my:0,fire:false});
// teleporta pelos bairros e luta
const spots=[[LMv.church],[LMv.mercado],[LMv.oficina],[LMv.posto],[LMv.coreto],[LMv.clinica],[LMv.lab],[LMv.radio],[LMv.mirante],[LMv.besta]];
P.owned=[true,true,true,true,true,true,true,true]; P.mags=[0,12,6,30,6,100,4,1];
A.invAdd('virote',10);A.invAdd('pilha',2);A.invAdd('m9',60);A.invAdd('cart',20);A.invAdd('gran',3);A.invAdd('comb',100);A.invAdd('g40',6);A.invAdd('m357',8);
for(const [s] of spots){
  P.x=s.x;P.y=s.y+40; if(A.SOLID[A.map[A.idx((P.x/32)|0,(P.y/32)|0)]]){P.y=s.y;}
  for(let w=0;w<8;w++){A.switchWeapon(w);G.mode='play';step(40,{fire:true,aimAng:Math.random()*6.28,mx:Math.random()-.5,my:Math.random()-.5});}
  A.throwGrenade(); step(120,{fire:false,mx:0,my:0});
  if(G.mode!=='play'){console.log('modo',G.mode,'hp',P.hp);P.hp=100;G.mode='play';}
}
// força inimigos de todos os tipos perto
for(const t of ['zumbi','corr','incha','cusp','cao','brut','rast','pers','esfol','boss']){const e=A.makeEnemy(t,P.x+120,P.y);e.state='chase';A.enemies.push(e);}
P.hp=1000;P.max=1000;
step(600,{fire:true,aimAng:0});
ok(true,'');
console.log('inimigos vivos',A.enemies.length,'kills',G.kills,'hp',P.hp|0);
// interações
P.hp=100;P.max=100;
for(const it of A.getInteracts()){P.x=it.x;P.y=it.y+36;G.mode='play';A.G.prompt=A.findInteract();A.doInteract();if(G.mode==='menu')A.UI.close();}
P.grab=null;A.exitHide();G.inv[6]=null;G.inv[7]=null;A.invAdd('inibidor',1);G.flags.clinicPower=true;
for(const n of A.getNpcs()){for(let r=0;r<3;r++){P.x=n.x+30;P.y=n.y;G.mode='play';G.prompt=A.findInteract();A.doInteract();finishTalk();if(G.mode==='menu')A.UI.close();}}
ok(G.flags.metHelena&&G.flags.helena==='levar','Helena: '+G.flags.helena);ok(A.invCount('cartao')>0||G.box.some(b=>b.id==='cartao'),'Helena não deu o cartão');
A.STORY.radioFirst();finishTalk();ok(G.flags.walkie,'rádio');
A.STORY.onDistrict(2);A.STORY.persSeen();A.STORY.wave();for(let i=0;i<400;i++)A.updBark(.05);
// pega todos os itens-chave e entrega
G.inv=G.inv.map(()=>null);for(const id of ['gato','bateria']){const p=A.getPickups().find(p=>p.id===id);if(p){A.takePickup(p);}}
for(const id of ['cida','tiao']){const n=A.getNpcs().find(n=>n.id===id);P.x=n.x+30;P.y=n.y;G.mode='play';G.prompt=A.findInteract();A.doInteract();finishTalk();}
ok(G.flags.catDone&&G.flags.batDone&&G.flags.jipe&&A.V.ok,'pedidos não concluídos');
// percepção: de costas não vê; tiro faz investigar; parede bloqueia
{G.mode='play';A.enemies=[];P.x=A.tc(60);P.y=A.tc(245.5);P.lamp=true;P.ang=Math.PI;
 const e=A.makeEnemy('zumbi',P.x+170,P.y,null);e.face=0;e.dir=0;e.idle=true;e.wt=99;A.enemies.push(e);step(40,{mx:0,my:0,fire:false,aimAng:null});
 ok(e.state!=='chase','zumbi de costas viu o jogador ('+e.state+')');
 A.switchWeapon(1);P.cool=0;P.mags[1]=12;P.ang=Math.PI;step(2,{fire:true,aimAng:Math.PI});step(1,{fire:false,aimAng:null});
 ok(e.state==='investigate'||e.state==='chase','tiro não chamou atenção ('+e.state+')');
 step(160,{fire:false,aimAng:null});ok(e.state==='chase','não achou o jogador depois de investigar ('+e.state+')');}
{const bs=A.getBuildings().filter(b=>b.loot&&!b.safe&&b.w>=7&&b.h>=7);let tested=0;
 for(const b of bs){let doorN=false;for(let x=b.x;x<b.x+b.w;x++)if(!A.SOLID[A.map[A.idx(x,b.y)]])doorN=true;if(doorN)continue;
  const ty=b.y-2,tx=b.x+(b.w>>1);if(A.SOLID[A.map[A.idx(tx,ty)]])continue;
  A.enemies=[];P.x=A.tc(b.x+(b.w>>1));P.y=A.tc(b.y+2);if(A.SOLID[A.map[A.idx((P.x/32)|0,(P.y/32)|0)]])continue;
  const e=A.makeEnemy('corr',A.tc(tx),A.tc(ty),null);e.face=Math.PI/2;e.idle=true;e.wt=99;A.enemies.push(e);step(30,{mx:0,my:0,fire:false});
  ok(e.state!=='chase','viu através da parede '+b.x+','+b.y);tested++;if(tested>=3)break;}
 ok(tested>0,'sem prédio para testar parede');}
// esquiva, Afogados, opções, conquistas
{G.mode='play';A.enemies=[];P.inCar=false;P.x=A.tc(60);P.y=A.tc(245.5);P.st=100;P.hp=100;P.inv=0;A.dodge();step(3,{mx:1,my:0});ok(P.dodge>0,'esquiva não começou');
 const hp=P.hp;A.hurtPlayer(20,P.x+10,P.y);ok(P.hp===hp,'esquiva não protegeu');step(30,{mx:0,my:0});ok(P.dodge<=0,'esquiva não terminou');
 P.x=A.tc(186);P.y=A.tc(112);G.afogT=0;step(2,{});ok(A.enemies.some(e=>e.type==='afog'),'Afogados não saíram do mar');
 A.UI.opts('pause');A.UI.act('setzoom',{k:'longe'});A.UI.act('setbri',{k:'claro'});A.UI.act('sethud',{k:'grande'});A.UI.act('vib',{});ok(A.OPT.zoom==='longe'&&A.OPT.bri==='claro'&&A.OPT.hud==='grande','opções');
 A.UI.act('optback',{});A.UI.close();A.UI.act('achs',{from:'pause'});A.UI.act('achback',{});A.UI.close();
 ok(A.ACHS.has('jipe')&&A.ACHS.has('mingau'),'conquistas: '+[...A.ACHS].join(','));
 A.IN.touch=true;G.banner={t:'Teste',life:2};G.toasts.push({t:'aviso de teste comprido para quebrar linha no celular',life:3});step(13,{});G.achPop={n:'X',life:2};step(7,{});A.IN.touch=false;
 A.enemies=[];G.mode='play';}
// jipe: entrar, dirigir, arrebentar a barricada, sair
{A.enemies=[];G.mode='play';P.x=A.V.x+30;P.y=A.V.y;G.prompt=A.findInteract();A.doInteract();ok(P.inCar,'não entrou no jipe');
 const y0=A.V.y;step(120,{mx:0,my:-1});ok(A.V.y<y0-200,'jipe não andou '+(y0-A.V.y|0));
 const g=A.getGates().find(g=>g.id==='bloqueio');A.V.x=(g.x+g.w/2)*32;A.V.y=(g.y+g.h)*32+260;A.V.ang=-Math.PI/2;A.V.spd=320;
 for(let i=0;i<60;i++)step(1,{mx:0,my:-1});ok(!g.open,'barricada abriu sem dinamite');
 {const pi=P.inCar;if(pi){A.exitCar(true);}P.x=(g.x+g.w/2)*32;P.y=(g.y+g.h)*32+20;A.invAdd('dinamite',1);A.useGate(g);finS();ok(A.G.ev.fuse,'dinamite não acendeu');P.hp=9999;P.max=9999;P.y+=500;step(60*7,{mx:0,my:0});ok(g.open&&G.flags.bloqWeak,'dinamite não abriu a barricada');P.hp=100;P.max=100;A.V.dead=false;A.V.ok=true;A.V.hp=A.V.max;P.x=A.V.x+30;P.y=A.V.y;G.prompt=A.findInteract();A.doInteract();}
 A.V.x=(g.x+g.w/2)*32;A.V.y=(g.y+g.h)*32+260;A.V.ang=-Math.PI/2;A.V.spd=320;
 for(let i=0;i<200&&!G.flags.bloqueio;i++)step(1,{mx:0,my:-1});ok(G.flags.bloqueio&&g.open,'não arrebentou a barricada');
 A.IN.touch=true;step(13,{mx:0,my:-1});A.IN.touch=false;
 step(60,{mx:0,my:0});A.V.spd=0;step(30,{mx:0,my:0});G.prompt=A.findInteract();A.doInteract();ok(!P.inCar,'não saiu do jipe');}
// UI
G.mode='play';A.UI.inv('itens');A.UI.act('slot',{i:'0'});A.UI.act('craft',{r:'0'});A.UI.act('tab',{t:'mapa'});A.UI.act('tab',{t:'arquivos'});A.UI.close();
G.mode='play';A.UI.box();A.UI.act('tobox',{i:'0'});A.UI.act('frombox',{i:'0'});A.UI.close();
G.mode='play';A.UI.keypad();for(const k of ['4','0','7','2','ok'])A.UI.act('kp',{k});ok(G.flags.cofre,'cofre não abriu');
G.mode='play';A.UI.pause();A.UI.act('controls2',{});A.UI.back();A.UI.close();
// menu de teste
G.mode='play';A.UI.debug();for(const k of ['t:god','t:ammo','t:noclip','speed','heal','bat','slots','weapons','keys','ammokit','healkit','files','t:bright','gates','map','t:freeze','t:ai','t:fps']){A.UI.act('dbg',{k});}
for(const k of ['spawn:esfol','spawn:boss','spawn:zumbi']){G.mode='play';A.UI.act('dbg',{k});}
G.mode='play';step(120,{fire:true,aimAng:0});
for(const k of ['t:god','t:ammo','t:noclip','t:bright','t:freeze','t:ai','t:fps']){G.mode='play';A.UI.debug();A.UI.act('dbg',{k});}
G.mode='play';A.UI.debug();A.UI.act('dbg',{k:'kill'});A.UI.close();
for(const k of ['tp:church','tp:lab','tp:radio','tp:clinica','car','light','blackout','pers']){G.mode='play';A.UI.debug();A.UI.act('dbg',{k});}
G.mode='play';ok(A.P.x>0,'tp');
// dormentes e esfolado
{const e=A.makeEnemy('zumbi',P.x+300,P.y,null,true);A.enemies.push(e);step(10,{});ok(e.state==='dorm','dormente não ficou parado');P.x=e.x-50;P.y=e.y;step(30,{});ok(e.state!=='dorm','dormente não levantou');}
{const e=A.makeEnemy('esfol',P.x+250,P.y,null);A.enemies.push(e);step(30,{});console.log('esfol estado',e.state);}
// save/load
G.mode='play';A.UI.save();A.UI.act('dosave',{});
const s=A.readSave();ok(s&&s.P,'save vazio');
A.loadState(s);G.mode='play';step(60,{});
ok(A.G.flags.catDone,'load perdeu flags');
// portões e objetivo até o fim
for(const g of A.getGates()){if(!g.open&&g.key){A.invAdd(g.key,1);P.x=(g.x+g.w/2)*32;P.y=(g.y+g.h/2)*32+50;A.useGate(g);finS();}}
console.log('objetivo:',A.objective().t);
A.UI.close();G.mode='play';A.startWave(); P.x=LMv.pad.x;P.y=LMv.pad.y;P.hp=5000;P.max=5000;
step(60*95,{fire:true,aimAng:1});
console.log('heli',!!G.heli,'modo',G.mode);
step(60*9,{});P.x=LMv.pad.x;P.y=LMv.pad.y;step(10,{});
console.log('modo final',G.mode); ok(G.mode==='win','não venceu');
ctx.__timeouts.forEach(f=>f());
// eventos da cidade, agarrão
{A.enemies=[];G.mode='play';P.inCar=false;P.hidden=null;P.x=A.tc(60);P.y=A.tc(245.5);P.hp=500;P.max=500;
 const p=A.spawnSurvivor({x:P.x+200,y:P.y},2);ok(A.enemies.filter(e=>e.prey===p).length>0,'sobrevivente sem perseguidores');step(240,{mx:0,my:0,aimAng:null,fire:false});console.log('sobrevivente',p.st,p.alive,'hp',p.hp|0);
 A.evHeliStart();step(120,{});ok(A.EV.heli,'heli sumiu cedo');
 let car=false;for(let i=0;i<5&&!car;i++)car=A.evCarStart();ok(car,'carro do evento não achou rua');step(300,{});
 A.EV.t=0;for(let i=0;i<8;i++){A.EV.t=0;A.updEvents(.016);}A.renderWorld();A.drawHUD();
 A.enemies=[];const z=A.makeEnemy('zumbi',P.x+20,P.y,null);A.enemies.push(z);P.grab=null;P.dodge=0;P.inv=0;
 G.st=G.st||{};for(let i=0;i<30&&!P.grab;i++){z.grabbing=false;P.inv=0;A.enemyHit(z);}ok(P.grab,'não agarrou');
 for(let i=0;i<10;i++)A.mashGrab();ok(!P.grab,'não se soltou');P.hp=100;P.max=100;A.enemies=[];}
// começo sem arma, faca quebra, lanterna apagada, esconderijo, chefes
{A.newGame('normal');G.mode='play';ok(!P.owned.slice(0,8).some(x=>x)&&P.w===8,'começou armado');ok(/defender/.test(A.objective().t),'objetivo inicial: '+A.objective().t);
 ok(A.getInit().some(e=>e.type==='gordo'),'Frentista ausente no posto');
 const kn=A.getPickups().find(p=>p.kind==='weapon'&&p.id===0);ok(kn,'faca ausente');A.takePickup(kn);ok(P.owned[0]&&P.w===0&&P.dur>0,'faca não equipou');
 A.enemies=[];P.x=A.tc(60);P.y=A.tc(245.5);P.ang=0;P.cool=0;const d0=P.dur;
 for(let i=0;i<d0+2;i++){const z=A.makeEnemy('zumbi',P.x+30,P.y,null);z.hp=9999;A.enemies=[z];P.ang=0;A.melee();}
 ok(!P.owned[0]&&P.w===8,'faca não quebrou');
 // lanterna apagada: zumbi olhando de frente a 120px não vê
 A.enemies=[];P.lamp=false;G.pLit=false;const z=A.makeEnemy('zumbi',P.x+120,P.y,null);z.face=Math.PI;z.idle=true;z.wt=99;A.enemies.push(z);
 step(30,{mx:0,my:0,aimAng:null,fire:false});ok(z.state!=='chase'||G.pLit,'viu no escuro ('+z.state+')');
 P.lamp=true;P.bat=100;P.ang=0;step(30,{mx:0,my:0,aimAng:null,fire:false});ok(z.state==='chase','não viu com a lanterna na cara ('+z.state+')');
 // esconderijo
 const hs=A.getInteracts().filter(i=>i.type==='hide');ok(hs.length>40,'poucos esconderijos '+hs.length);
 const lk=hs.find(i=>i.kind==='armario');A.enemies=[];P.x=lk.x;P.y=lk.y+40;G.prompt={k:'int',o:lk};A.doInteract();ok(P.hidden===lk,'não escondeu');
 const z2=A.makeEnemy('corr',P.x+90,P.y,null);z2.state='chase';A.enemies=[z2];step(60,{mx:0,my:0,aimAng:null});ok(z2.state!=='chase'||z2.sawHide,'achou escondido ('+z2.state+')');
 step(5,{mx:1,my:0});ok(!P.hidden,'não saiu do esconderijo');
 // chefes
 const b=A.spawnBoss('enferm',P.x+400,P.y,'b_t',true);ok(b&&b.r>=28,'chefe');P.hp=9999;P.max=9999;step(120,{fire:true,aimAng:0});A.enemies=[];P.hp=100;P.max=100;
 const cnt=A.getInteracts().filter(i=>i.type==='hide').length;console.log('esconderijos',cnt);}
// morte
// v12: campo de visão, dia e noite, manequins, shopping, descanso, eventos novos
{A.newGame('normal');G.mode='play';const L=A.getLM();ok(A.G.clock===23*60+40,'relógio inicial');ok(A.isNight(),'começa de noite');
 P.x=A.tc(60);P.y=A.tc(245.5);P.ang=0;A.enemies=[];
 const front=A.makeEnemy('zumbi',P.x+200,P.y,null),back=A.makeEnemy('zumbi',P.x-200,P.y,null);front.idle=back.idle=true;front.wt=back.wt=99;A.enemies.push(front,back);
 step(10,{mx:0,my:0,aimAng:null,fire:false});ok(front.vis&&!back.vis,'campo de visão: frente '+front.vis+' costas '+back.vis);
 // parede bloqueia a visão: do lado de fora do Edifício Moacir não se vê quem está lá dentro
 const mo=A.getBuildings().find(b=>b.name==='Edifício Moacir');const inside=A.makeEnemy('zumbi',A.tc(mo.x+3),A.tc(mo.y+3),null);inside.idle=true;inside.wt=99;A.enemies=[inside];
 P.x=A.tc(mo.x+3);P.y=A.tc(mo.y-3);P.ang=Math.PI/2;step(8,{mx:0,my:0,aimAng:null});ok(!inside.vis,'viu através da parede do prédio');
 // de dia, sem lanterna, eles te veem de mais longe na rua
 A.enemies=[];P.x=A.tc(60);P.y=A.tc(245.5);P.lamp=false;G.pLit=false;G.clock=12*60;step(2,{});ok(A.daylight()===1,'meio-dia');
 const dz=A.makeEnemy('zumbi',P.x+140,P.y,null);dz.face=Math.PI;dz.idle=true;dz.wt=99;A.enemies.push(dz);step(30,{mx:0,my:0,aimAng:null});ok(dz.state==='chase','de dia não viu a 140px ('+dz.state+')');
 G.clock=23*60;A.enemies=[];
 // manequim: parado quando você olha com a lanterna, anda quando você vira as costas
 const sh=A.getBuildings().find(b=>b.kind==='shop');P.x=A.tc(sh.x+25);P.y=A.tc(sh.y+10);P.lamp=true;P.bat=100;P.ang=0;G.flags.shopEv=true;
 const m=A.makeEnemy('manequim',P.x+220,P.y,null);m.homeB=sh.id;A.enemies=[m];const mx0=m.x;Object.assign(A.IN,{mx:0,my:0,aimAng:0,fire:false});for(let i=0;i<40;i++){G.flick=0;A.update(1/60);}ok(Math.abs(m.x-mx0)<4,'manequim andou enquanto olhava '+(m.x-mx0|0));
 P.ang=Math.PI;step(30,{mx:0,my:0,aimAng:Math.PI});ok(Math.abs(m.x-mx0)>20,'manequim não andou de costas');A.enemies=[];G.flags.shopEv=false;
 {const m2=A.makeEnemy('manequim',P.x+220,P.y,null);m2.homeB=sh.id;A.enemies=[m2];const x2=m2.x;P.lamp=false;step(30,{mx:0,my:0,aimAng:Math.PI});ok(Math.abs(m2.x-x2)<2,'manequim andou fora da armadilha');P.ang=0;G.flags.shopEv=true;step(10,{mx:0,my:0,aimAng:0});const x3=m2.x;step(20,{mx:0,my:0,aimAng:0});ok(Math.abs(m2.x-x3)<4,'manequim andou sendo olhado sem lanterna');G.flags.shopEv=false;A.enemies=[];}
 // hospital: a guia de transferência acorda a Enfermeira
 const gd=A.getPickups().find(p=>p.kind==='file'&&p.id===16);ok(gd,'guia de transferência ausente');ok(!A.getPickups().some(p=>p.id==='inibidor'),'inibidor ainda no hospital');
 A.takePickup(gd);A.UI.close();ctx.__timeouts.forEach(f=>f());ctx.__timeouts.length=0;finishTalk();ok(G.flags.transfer,'guia não marcou transferência');ok(!A.enemies.some(e=>e.type==='enferm'),'Enfermeira ainda aparece');
 A.enemies=[];G.mode='play';
 // shopping: cena da Vértice, portas descem, Espécime no átrio
 G.flags.metHelena=true;P.x=L.grade.x;P.y=L.grade.y+20;P.ang=-Math.PI/2;step(3,{mx:0,my:0});ok(G.flags.shopEv,'cena do shopping não disparou');finishTalk();
 const esp=A.enemies.find(e=>e.type==='especime');ok(esp,'Espécime não apareceu');ok(A.getGates().filter(g=>g.id.startsWith('shop')).every(g=>!g.open),'portas do shopping não fecharam');
 P.hp=5000;P.max=5000;step(240,{fire:true,aimAng:0});
 if(esp&&esp.alive){esp.hp=1;A.P.w=1;P.mags[1]=12;P.cool=0;P.ang=Math.atan2(esp.y-P.y,esp.x-P.x);P.x=esp.x-60;P.y=esp.y;step(30,{fire:true,aimAng:0});}
 ok(esp&&!esp.alive,'Espécime não morreu');ok(A.getGates().find(g=>g.id==='grade').open,'grade não abriu');ok(A.getGates().filter(g=>g.id.startsWith('shop')).every(g=>g.open),'portas não reabriram');
 const amp=A.getPickups().find(p=>p.id==='inibidor');ok(amp&&R(amp.tx,amp.ty),'ampola inalcançável');if(amp)A.takePickup(amp);ok(A.invCount('inibidor')>0,'não pegou a ampola');
 Object.assign(G.flags,{armed:true,jipe:true,bloqueio:true,metHelena:true,clinicPower:true,v7:true});ok(/Helena/.test(A.objective().t),'objetivo depois do shopping: '+A.objective().t);
 P.hp=100;P.max=100;A.enemies=[];
 // descanso no abrigo
 G.clock=2*60;G.mode='play';A.UI.save();A.UI.act('rest',{h:'6'});ok(Math.abs(A.hourNow()-6)<.05,'descanso não chegou às 6h: '+A.hourNow());ok(P.st===100,'descanso não recuperou');
 // armário ocupado de noite
 G.clock=23*60;G.flags.hideTip=true;const lk=A.getInteracts().filter(i=>i.kind==='armario'&&A.dAt(i.tx,i.ty)>=5);let occ=false;
 for(const l of lk.slice(0,60)){P.grab=null;if(P.hidden)A.exitHide();P.x=l.x;P.y=l.y+30;A.enemies=[];G.prompt={k:'int',o:l};A.doInteract();if(P.grab){occ=true;break;}}
 ok(occ,'nenhum armário ocupado em 60 tentativas');for(let i=0;i<10;i++)A.mashGrab();P.grab=null;if(P.hidden)A.exitHide();
 // eventos novos
 A.enemies=[];P.x=A.tc(60);P.y=A.tc(245.5);P.ang=0;G.flags.metTiao=true;G.flags.bloqueio=true;G.flags.metHelena=false;
 ok(A.evConvoy()||A.evConvoy()||A.evConvoy(),'comboio não montou');{let tr=false;for(let i=0;i<8&&!tr;i++){P.ang=Math.random()*6.28;tr=A.evTrapped();}ok(tr,'sobrevivente preso não montou');}step(60,{});
 if(A.EV.trap){for(const z of A.EV.trap.zs)z.alive=false;step(30,{});ok(!A.EV.trap,'preso não saiu do carro');}
 const fer=A.spawnSurvivor({x:P.x+120,y:P.y},0,{st:'sit'});step(20,{});ok(fer.met,'soldado ferido não falou');for(let i=0;i<60*17;i++){A.update(1/60);}ok(!fer.alive,'ferido não virou');
 for(const k of ['sci','alarme','grita','van','ferido','comboio','preso']){A.EV.t=0;}
 for(let i=0;i<20;i++){A.EV.t=0;A.updEvents(.016);}A.renderWorld();A.drawHUD();
 const g=A.makeEnemy('grita',P.x+150,P.y,null);g.state='chase';A.enemies.push(g);P.lamp=true;step(30,{mx:0,my:0,aimAng:0});ok(g.mode==='scream'||g.c3>0,'gritadeira não gritou');
 // noite → dia → noite pelo relógio
 G.clock=18*60+29;step(60*2,{});G.clock=5*60+59;step(60*2,{});A.renderWorld();A.drawHUD();
 const ss=A.serialize();ok(ss.clock!=null,'relógio não salvo');A.loadState(ss);ok(Math.abs(A.G.clock-ss.clock)<1,'relógio não carregou');G.mode='play';step(30,{});}
// correções da revisão: jipe queimado, porta de aço, registro no meio do evento, descanso, manequim colado nas costas
{A.newGame('normal');G.mode='play';const L=A.getLM();Object.assign(G.flags,{metTiao:true,batDone:true,jipe:true,armed:true});A.V.ok=true;A.V.dead=true;
 ok(/oficina/.test(A.objective().t),'objetivo com jipe queimado: '+A.objective().t);
 const ti=A.getNpcs().find(n=>n.id==='tiao');P.x=ti.x+30;P.y=ti.y;G.prompt=A.findInteract();A.doInteract();finishTalk();ok(!A.V.dead&&A.V.ok,'Tião não consertou o jipe');
 const sg=A.getGates().find(g=>g.id==='shopN');A.closeGate(sg);const gx=(sg.x+2)*32,gy=sg.y*32;ok(!A.los(gx,gy-60,gx,gy+60),'porta de aço não bloqueia a visão');A.openGate(sg);
 G.flags.shopEv=true;G.flags.transfer=true;const sv=A.serialize();A.loadState(sv);ok(!A.G.flags.shopEv,'registro no meio do evento travou o shopping');ok(!A.enemies.some(e=>e.type==='enferm'),'Enfermeira voltou depois de carregar');
 G.mode='play';G.clock=16*60;A.UI.save();A.UI.act('rest',{h:'+3'});ok(Math.abs(A.hourNow()-19)<.05,'descanso 3h');
 G.clock=23*60;A.enemies=[];P.x=A.tc(60);P.y=A.tc(245.5);P.ang=0;P.lamp=true;G.flags.shopEv=true;const mq=A.makeEnemy('manequim',P.x-70,P.y,null);A.enemies=[mq];const mx1=mq.x;Object.assign(A.IN,{mx:0,my:0,aimAng:0,fire:false});for(let i=0;i<20;i++){G.flick=0;A.update(1/60);}ok(mq.x-mx1>5||!mq.alive||P.hp<100,'manequim nas costas ficou parado');A.enemies=[];G.flags.shopEv=false;}
// ===== v13: a história em ordem =====
{A.newGame('normal');G.mode='play';const L=A.getLM();ctx.__timeouts.length=0;
 Object.assign(G.flags,{armed:true,metTiao:true,fuse:true});P.owned[1]=true;P.mags[1]=12;
 ok(/cadeado/.test(A.objective().t),'objetivo do cadeado: '+A.objective().t);
 const dg=A.getGates().find(g=>g.id==='deposito');ok(dg&&!dg.open,'depósito sem cadeado');
 G.mode='play';A.UI.keypad('deposito');for(const k of ['1','2','3','ok'])A.UI.act('kp',{k});ok(!dg.open,'cadeado abriu com código errado');A.UI.close();
 G.mode='play';A.UI.keypad('deposito');for(const k of ['3','3','3','ok'])A.UI.act('kp',{k});ok(dg.open&&G.flags.deposito,'cadeado não abriu com 333');A.UI.close();G.mode='play';
 const bat=A.getPickups().find(p=>p.id==='bateria');ok(bat&&R(bat.tx,bat.ty),'bateria inalcançável');P.x=bat.x+20;P.y=bat.y;A.takePickup(bat);ok(G.flags.postoLeak&&G.ev.posto,'vazamento não começou');ok(/VAZAMENTO/.test(A.objective().t),'objetivo do vazamento');
 P.x=L.oficina.x;P.y=L.oficina.y;P.hp=500;P.max=500;step(60*19,{});ok(G.flags.postoBoom,'posto não explodiu');ok(A.getFires().length>=5,'posto sem fogo '+A.getFires().length);ok(G.flags.caos>=1,'caos não começou');
 ok(G.flags.boss_gordo,'Frentista sobreviveu à explosão');ctx.__timeouts.length=0;
 P.max=100;P.hp=100;A.enemies=[];const ti=A.getNpcs().find(n=>n.id==='tiao');P.x=ti.x+30;P.y=ti.y;G.prompt=A.findInteract();A.doInteract();finishTalk();
 ok(G.flags.batDone&&G.flags.eduJoin&&G.flags.eduFollow&&G.flags.caos===2,'Edu não chegou / caos 2');
 step(30,{});const edu=A.compOf('edu');ok(edu,'Edu não está seguindo');
 if(edu){P.x=A.tc(60);P.y=A.tc(245.5);A.enemies=[];step(10,{});step(120,{mx:1,my:0});ok(Math.hypot(edu.x-P.x,edu.y-P.y)<260,'Edu ficou pra trás '+(Math.hypot(edu.x-P.x,edu.y-P.y)|0));
  A.enemies=[];const z=A.makeEnemy('zumbi',P.x+150,P.y,null);z.state='chase';z.hp=999;A.enemies.push(z);edu.cool=0;edu.x=P.x-30;edu.y=P.y;step(20,{mx:0,my:0});ok(z.hp<999||A.projs.length>0,'Edu não atirou');}
 for(let i=0;i<60*40;i++){A.update(1/60);if(i%30===0){A.renderWorld();A.drawHUD();}if(A.CUT.on)finishTalk();if(G.mode!=='play'){P.hp=100;G.mode='play';}}
 A.enemies=[];G.flags.persOn=false;A.STORY.onBrava();ok(!G.flags.persOn,'Perseguidor apareceu antes da Helena');G.flags.persCine=true;G.flags.persOn=true;
 G.persT=0;P.x=A.tc(60);P.y=A.tc(245.5);step(30,{});ok(!A.enemies.some(e=>e.type==='pers'),'Perseguidor apareceu em Balneário');
 G.flags.bloqueio=true;const he=A.getNpcs().find(n=>n.id==='helena');P.x=he.x+30;P.y=he.y;A.enemies=[];G.prompt=A.findInteract();A.doInteract();finishTalk();
 ok(G.flags.metHelena&&G.flags.eduClinic&&!G.flags.eduFollow,'Edu não ficou na clínica');ok(/resort|Resort/.test(A.objective().t),'objetivo do diesel: '+A.objective().t);
 ok(G.flags['pw'+A.clinicB()]===false,'clínica não ficou sem luz');
 const ds=A.getPickups().find(p=>p.id==='diesel');ok(ds&&R(ds.tx,ds.ty),'diesel inalcançável');
 const cm=A.getPickups().find(p=>p.id==='cartaoMestre');ok(cm&&R(cm.tx,cm.ty),'cartão mestre inalcançável');
 A.takePickup(cm);const mg=A.getGates().find(g=>g.id==='maqResort');A.useGate(mg);ok(mg.open,'casa de máquinas do resort não abriu');
 P.x=ds.x;P.y=ds.y;A.enemies=[];A.takePickup(ds);ok(G.flags.ambush&&A.enemies.some(e=>e.type==='pers'),'emboscada do Perseguidor');finishTalk();A.enemies=[];ctx.__timeouts.length=0;
 const gi=A.getInteracts().find(i=>i.type==='gerador');P.x=gi.x;P.y=gi.y+30;G.prompt={k:'int',o:gi};A.doInteract();finishTalk();ok(G.flags.clinicPower&&G.flags.v7&&G.flags.eduFollow,'gerador / V-7 / Edu');
 G.flags.transfer=true;G.flags.uniDone=true;for(let i=0;i<90&&!G.flags.eduVan;i++){P.x=L.van.x+400;P.y=L.van.y;step(1,{});}ok(G.flags.eduVan,'Edu não foi pra van');
 const ev=A.getNpcs().find(n=>n.id==='eduV');ok(ev&&R((ev.x/32)|0,(ev.y/32)|0),'Edu da van inalcançável');P.x=ev.x+40;P.y=ev.y;for(let i=0;i<120&&!G.flags.detGot;i++){step(1,{});finishTalk();P.x=ev.x+40;P.y=ev.y;}ok(G.flags.detGot&&A.invCount('detector')>0,'detector não entregue');
 const _mh=G.flags.metHelena;G.flags.metHelena=false;A.toggleDetector();ok(G.detOn,'detector não ligou');A.enemies=[];P.x=A.tc(60);P.y=A.tc(245.5);const mz=A.makeEnemy('zumbi',P.x+200,P.y,null);mz.state='chase';mz.hp=mz.max=1e7;A.enemies.push(mz);let bl=0;for(let i=0;i<90;i++){G.mode='play';if(A.CUT.on)finishTalk();G.detOn=true;mz.x+=1.5;mz.y+=1;step(1,{});mz.state='chase';if(G.blips.length>0)bl=1;}ok(bl,'detector não mostrou movimento '+JSON.stringify({a:mz.alive,d:Math.hypot(mz.x-P.x,mz.y-P.y)|0,on:G.detOn,inv:A.invCount('detector'),det:P.det|0,n:A.enemies.length,st:mz.state,m:G.mode,sil:!!G.ev.silent,cut:A.CUT.on}));const b0=P.det;for(let i=0;i<60;i++){G.mode='play';G.detOn=true;step(1,{});}ok(P.det<b0,'detector não gastou');G.flags.metHelena=_mh;
 P.det=0.01;A.invAdd('pilha',1);const pc=A.invCount('pilha');step(3,{});ok(A.invCount('pilha')===pc-1&&P.det>90,'detector não trocou a pilha');A.IN.touch=true;step(7,{});A.IN.touch=false;
 G.flags.uniDone=true;A.enemies=[];G.mode='play';P.x=L.grade.x;P.y=L.grade.y+20;P.ang=-Math.PI/2;step(3,{});ok(G.flags.shopEv,'shopping não disparou');finishTalk();
 ok(A.getGates().filter(g=>g.id.startsWith('shop')).every(g=>!g.open),'portas não desceram');ok(G.flags['pw'+A.shopB()]===false,'shopping não apagou');
 ok(/segurança/.test(A.objective().t),'objetivo da chave: '+A.objective().t);
 const ck=A.getPickups().find(p=>p.id==='chaveMaq');ok(ck&&R(ck.tx,ck.ty),'chave da casa de máquinas inalcançável');A.takePickup(ck);
 const cg=A.getGates().find(g=>g.id==='casaMaq');A.useGate(cg);ok(cg.open,'casa de máquinas não abriu');
 const pn=A.getInteracts().find(i=>i.type==='painelShop');
 {const seen=new Set(),q=[[(L.grade.x/32)|0,((L.grade.y/32)|0)+1]];let hit=false;while(q.length){const [x,y]=q.pop();const k=A.idx(x,y);if(seen.has(k))continue;seen.add(k);if(Math.abs(x-pn.tx)<=1&&Math.abs(y-pn.ty)<=1){hit=true;break;}if(A.SOLID[A.map[k]])continue;for(const [dx,dy] of [[1,0],[-1,0],[0,1],[0,-1]])q.push([x+dx,y+dy]);}
  ok(hit,'painel da casa de máquinas inalcançável de dentro do shopping trancado');}
 G.prompt={k:'int',o:pn};A.doInteract();finishTalk();
 ok(G.flags.shopOpen&&A.getGates().filter(g=>g.id.startsWith('shop')||g.id==='grade').every(g=>g.open),'painel não destravou');
 {const s2=A.serialize();A.loadState(s2);G.mode='play';ok(A.getPickups().some(p=>p.id==='inibidor'),'ampola sumiu depois de salvar com o painel aberto');}
 const amp=A.getPickups().find(p=>p.id==='inibidor');ok(amp&&R(amp.tx,amp.ty),'ampola inalcançável');if(amp)A.takePickup(amp);
 A.enemies=[];P.x=ev.x+40;P.y=ev.y;step(5,{});finishTalk();ok(G.flags.eduFollow&&!G.flags.eduVan,'Edu não voltou da van');
 const sv=A.serialize();A.loadState(sv);G.mode='play';ok(A.getFires().length>=5,'fogo sumiu ao carregar');ok(A.map[A.idx(29,254)]===A.T.RUBBLE,'bomba do posto voltou');step(3,{});ok(A.compOf('edu'),'Edu sumiu ao carregar');ok(G.flags.shopOpen,'shopping trancou de novo');
 Object.assign(G.flags,{inibidorDone:true,vertice:true,eduFollow:false,eduClinic:true,helena:'levar'});A.syncComps();
 A.STORY.matRadio();finishTalk();ok(G.flags.matRadio,'rádio do Matheus');
 P.x=A.tc(116);P.y=A.tc(65);A.enemies=[];step(5,{});finishTalk();ok(G.flags.hospLock&&!A.getGates().find(g=>g.id==='hospIn').open,'hospital não trancou');
 P.hp=5000;P.max=5000;const ou=A.makeEnemy('ouvinte',P.x-120,P.y,null);ou.homeB=A.hosp2B();A.enemies=[ou];A.hurtEnemy(ou,500,0,0,{});ok(ou.alive&&ou.hp===ou.max,'Ouvinte tomou dano');
 ou.heard=0;step(4,{mx:0,my:0,run:false});ok(ou.heard<=0,'Ouvinte ouviu parado');step(12,{mx:1,my:0,run:true});ok(ou.heard>0,'Ouvinte não ouviu correr');
 const hp0={x:P.x,y:P.y};P.x=A.tc(60);P.y=A.tc(245.5);ou.homeB=-1;ou.x=P.x-140;ou.y=P.y;ou.heard=0;A.invAdd('garrafa',3);P.thr='garrafa';P.ang=0;A.IN.run=false;A.IN.fire=false;A.throwGrenade();step(50,{mx:0,my:0,run:false,fire:false});ok(ou.heard>0&&ou.nx>P.x+150,'Ouvinte não foi atrás da garrafa '+ou.heard+' '+(ou.nx-P.x|0)+' '+G.mode);P.hp=100;P.max=100;P.x=hp0.x;P.y=hp0.y;A.enemies=[];
 const mh=A.getNpcs().find(n=>n.id==='matH');ok(mh&&R((mh.x/32)|0,(mh.y/32)|0),'Matheus inalcançável');P.x=mh.x+40;P.y=mh.y;A.enemies=[];step(5,{});finishTalk();ok(G.flags.matheusJoin&&A.compOf('matheus'),'Matheus não entrou');
 const mt=A.compOf('matheus');A.enemies=[];const z2=A.makeEnemy('zumbi',P.x+100,P.y,null);z2.state='chase';z2.hp=999;A.enemies.push(z2);if(mt)mt.cool=0;step(10,{});ok(z2.hp===999,'Matheus atirou dentro do Santa Clara');A.enemies=[];
 const al=A.getPickups().find(p=>p.id==='alicate');ok(al&&R(al.tx,al.ty),'alicate inalcançável');if(al)A.takePickup(al);const ho=A.getGates().find(g=>g.id==='hospOut');A.useGate(ho);finS();ok(ho.open&&G.flags.hospOut,'saída dos fundos');ctx.__timeouts.length=0;
 A.invAdd('heliKey',1);const gq=A.getInteracts().find(i=>i.type==='guindaste');P.x=gq.x;P.y=gq.y+30;G.prompt={k:'int',o:gq};A.doInteract();finishTalk();ok(G.flags.conteiner&&A.getGates().find(g=>g.id==='conteiner').open,'guindaste não tirou o contêiner');
 ok(/heliponto/.test(A.objective().t),'objetivo do heliponto: '+A.objective().t);const hg=A.getGates().find(g=>g.id==='heli');A.useGate(hg);
 A.enemies=[];P.x=L.pad.x;P.y=L.pad.y;A.UI.close();G.mode='play';A.startWave();G.ev.shipT=.01;step(3,{});ctx.__timeouts.forEach(f=>f());ctx.__timeouts.length=0;finishTalk();ok(G.flags.shipCrash&&A.enemies.some(e=>e.type==='boss'),'navio não bateu no cais');
 P.hp=5000;P.max=5000;for(let i=0;i<60*36;i++){Object.assign(A.IN,{fire:true,aimAng:1});A.update(1/60);if(i%20===0){A.renderWorld();A.drawHUD();}if(A.CUT.on)finishTalk();}ok(G.flags.friendsCame&&A.compOf('edu'),'Edu não chegou no heliponto');
 const en=A.STORY.ending();ok(/Matheus/.test(en.b)&&/Edu/.test(en.b),'final sem os amigos: '+en.t);ctx.__timeouts.length=0;P.hp=100;P.max=100;}
{A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;
 const js=A.getInteracts().filter(i=>i.type==='janela');ok(js.length>10,'poucas janelas '+js.length);
 const j=js[0];P.x=j.x;P.y=j.y+40;G.prompt={k:'int',o:j};A.doInteract();ok(A.map[A.idx(j.tx,j.ty)]!==A.T.WINDOW,'janela não quebrou');
 const sv=A.serialize();A.loadState(sv);ok(A.map[A.idx(j.tx,j.ty)]!==A.T.WINDOW,'janela voltou inteira');G.mode='play';
 const so=A.getInteracts().find(i=>i.type==='som');ok(so,'mesa de som');P.x=so.x;P.y=so.y+30;G.prompt={k:'int',o:so};A.doInteract();step(200,{});ok(A.getGates().find(g=>g.id==='escritorioB').open,'escritório da boate não abriu');
 const ze=A.enemies.find(e=>e.uid==='zelador');ok(ze&&ze.state==='feed','zelador não está comendo');if(ze){A.killEnemy(ze);ok(A.getPickups().some(p=>p.id==='chaveDir'),'zelador não largou a chave');}
 ok(A.enemies.some(e=>e.state==='feed'),'ninguém comendo');
 P.x=A.tc(60);P.y=A.tc(245.5);A.enemies=[];for(let i=0;i<30;i++){A.EV.t=0;A.updEvents(.016);}A.renderWorld();A.drawHUD();step(400,{});
 for(const k of ['posto','caos','brava','gerador','bc2','shop','itajai','hosp','porto','navio']){A.newGame('normal');G.mode='play';A.dbgJump(k);finishTalk();ctx.__timeouts.forEach(f=>{try{f()}catch(e){console.log('timeout',k,e.message)}});ctx.__timeouts.length=0;finishTalk();G.mode='play';P.hp=9999;step(60,{});A.renderWorld();A.drawHUD();ok(G.mode==='play','pulo '+k+' modo '+G.mode);}
 P.hp=100;P.max=100;}
// ===== v14 =====
{A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;const L=A.getLM();
 // arquivos no lugar certo
 const docAt=(lm,title)=>{const p=A.getPickups().filter(p=>p.kind==='file').sort((a,b)=>Math.hypot(a.x-lm.x,a.y-lm.y)-Math.hypot(b.x-lm.x,b.y-lm.y))[0];ok(p&&A.DOCS[p.id].t===title,'arquivo errado perto de '+title+': '+(p&&A.DOCS[p.id].t));};
 ok(A.DOCS.every(d=>d&&d.t),'buraco na lista de arquivos');docAt(L.vitrine,'Ficha do acervo');docAt(L.colegio,'Recado na lousa');docAt(L.som,'Flyer da Ressaca');docAt(L.casa4,'Diário da casa 4');
 // chefe não fica preso: o Frentista anda pelo hospital até você
 {A.enemies=[];const hb=A.getBuildings().find(b=>b.name==='Hospital Ruth Cardoso');P.x=A.tc(hb.x+3);P.y=A.tc(hb.y+hb.h-3);P.hp=99999;P.max=99999;const g=A.makeEnemy('gordo',A.tc(hb.x+hb.w-4),A.tc(hb.y+3),null);g.state='chase';g.hunt=true;A.enemies.push(g);
  const d0=Math.hypot(g.x-P.x,g.y-P.y);for(let i=0;i<60*25;i++){Object.assign(A.IN,{mx:0,my:0,fire:false,aimAng:null});A.update(1/60);if(Math.hypot(g.x-P.x,g.y-P.y)<90)break;}ok(Math.hypot(g.x-P.x,g.y-P.y)<d0*.4,'Frentista preso no hospital '+(d0|0)+' -> '+(Math.hypot(g.x-P.x,g.y-P.y)|0));A.enemies=[];P.hp=100;P.max=100;}
 // Balneário em silêncio e o Bombeiro
 A.dbgJump('bc2');finishTalk();ctx.__timeouts.length=0;G.mode='play';P.hp=99999;P.max=99999;step(30,{});ok(G.ev.silent,'Balneário não ficou em silêncio');
 ok(!A.enemies.some(e=>e.alive&&!e.stalker&&A.dAt((e.x/32)|0,(e.y/32)|0)>=5&&A.getBuildings().every(b=>!((e.x/32)>=b.x&&(e.x/32)<b.x+b.w&&(e.y/32)>=b.y&&(e.y/32)<b.y+b.h))),'tem zumbi na rua no silêncio');
 for(let i=0;i<60*20&&!A.enemies.some(e=>e.type==='bombeiro');i++){A.update(1/60);if(A.CUT.on)finishTalk();if(G.flags.bombCall&&!G.flags.bombMet){const B=A.getLM().bombas;P.x=B.x+120;P.y=B.y;}}ok(G.flags.bombMet&&!A.CUT.on,'cena do Bombeiro no posto');const bo=A.enemies.find(e=>e.type==='bombeiro');ok(bo,'Bombeiro não apareceu');
 if(bo){A.hurtEnemy(bo,99999,0,0,{});ok(bo.alive&&bo.down>0,'Bombeiro morreu de vez');for(let i=0;i<60*16;i++)A.update(1/60);ok(bo.down<=0&&bo.hp>0,'Bombeiro não levantou');}
 // ônibus 22
 {const it=A.getInteracts().find(i=>i.type==='onibus');ok(it,'porta do ônibus');const k=A.getPickups().find(p=>p.id==='chaveOnibus');ok(k&&R(k.tx,k.ty),'chave do ônibus inalcançável');A.takePickup(k);P.x=it.x;P.y=it.y+30;G.prompt={k:'int',o:it};A.doInteract();finishTalk();ok(G.flags.onibus,'ônibus não abriu');}
 P.hp=100;P.max=100;
 // condomínio: câmeras e casa 4
 {A.newGame('normal');G.mode='play';G.flags.persOn=true;const it=A.getInteracts().find(i=>i.type==='cctv');P.x=it.x;P.y=it.y+30;G.prompt={k:'int',o:it};A.doInteract();finishTalk();ok(A.invCount('chaveCasa')>0,'guarita não deu a chave');const g=A.getGates().find(g=>g.id==='casa4');A.useGate(g);ok(g.open,'casa 4 não abriu');
  const loot=A.getPickups().find(p=>p.id==='g40'&&Math.abs(p.tx-47)<3);ok(loot&&R(loot.tx,loot.ty),'munição da casa 4 inalcançável');}
 // sino tira a horda do porto
 {A.enemies=[];for(let i=0;i<20;i++)A.enemies.push(A.makeEnemy('zumbi',A.tc(60+i*4),A.tc(27),null));const it=A.getInteracts().find(i=>i.type==='sino');P.x=it.x;P.y=it.y+30;G.prompt={k:'int',o:it};A.doInteract();finishTalk();ok(G.flags.sino,'sino');ok(A.enemies.filter(e=>e.alive&&A.dAt((e.x/32)|0,(e.y/32)|0)===0).length<12,'sino não esvaziou o porto');}
 // a Abominação destrói o porto
 {A.enemies=[];const b=A.makeEnemy('boss',A.tc(60),A.tc(20),null);A.enemies.push(b);let walls=0;for(let y=12;y<30;y++)for(let x=14;x<197;x++)if(A.SOLID[A.map[A.idx(x,y)]])walls++;
  for(let k=0;k<20;k++){b.mode='rampage';b.cdx=Math.cos(k);b.cdy=Math.sin(k);b.x=A.tc(40+k*6);b.y=A.tc(20);A.bossSmash(b);}let w2=0;for(let y=12;y<30;y++)for(let x=14;x<197;x++)if(A.SOLID[A.map[A.idx(x,y)]])w2++;ok(w2<walls,'Abominação não destruiu nada '+walls+' '+w2);step(30,{});A.enemies=[];}
 A.toggleFS();ok(true,'');
}
// ===== v15: Laranjeiras, mortes, silenciador, agachar, amigos em silêncio =====
{A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;const L=A.getLM();
 for(const k of ['bondMA','colonia','geradorL','bondL','taquarinhas','bondBS'])ok(L[k]&&R((L[k].x/32)|0,(L[k].y/32)|0),'Laranjeiras inalcançável '+k);
 A.dbgJump('caos');finishTalk();ctx.__timeouts.length=0;G.mode='play';P.hp=99999;P.max=99999;
 ok(/Shopping|galeria/.test(A.objective().t),'objetivo da galeria: '+A.objective().t);G.flags.sewOut=true;
 ok(/bondinho/.test(A.objective().t),'objetivo do bondinho: '+A.objective().t);
 A.STORY.bondinho();finishTalk();ok(G.flags.bondRide&&A.dAt((P.x/32)|0,(P.y/32)|0)===8,'bondinho não levou pras Laranjeiras');step(10,{});
 const ivo=A.getNpcs().find(n=>n.id==='ivo');P.x=ivo.x+40;P.y=ivo.y;A.enemies=A.enemies.filter(e=>e.uid==='rosa');step(5,{});finishTalk();ok(G.flags.ivoMorto&&A.invCount('dinamite')>0,'Seu Ivo / dinamite');
 A.enemies=[];ok(/gerador/.test(A.objective().t),'objetivo do gerador: '+A.objective().t);A.STORY.geradorL();finS();ok(G.flags.geradorL,'gerador');step(30,{});
 A.STORY.bondinho2();finishTalk();ctx.__timeouts.length=0;finishTalk();ok(G.flags.laranjGone&&G.flags.tiaoMorto,'volta do bondinho / Tião');ok(A.dAt((P.x/32)|0,(P.y/32)|0)===7,'não voltou pra Barra Sul');
 ok(!A.getNpcs().find(n=>n.id==='tiao').cond(),'Tião ainda aparece');A.STORY.bondinho();ok(true,'');
 ok(/dinamite/.test(A.objective().t),'objetivo da barricada: '+A.objective().t);
 // silenciador e agachar
 A.enemies=[];P.x=A.tc(60);P.y=A.tc(245.5);P.owned[1]=true;P.w=1;P.mags[1]=12;A.invAdd('silenciador',1);A.attachSil();ok(P.sil===40,'silenciador não encaixou');
 const z=A.makeEnemy('zumbi',P.x-300,P.y,null);z.face=Math.PI;z.idle=true;z.wt=99;A.enemies.push(z);P.cool=0;P.ang=0;step(2,{fire:true,aimAng:0});step(1,{fire:false,aimAng:null});ok(P.sil<40&&z.state!=='investigate'&&z.state!=='chase','tiro com silenciador chamou atenção ('+z.state+')');
 A.DBG.speed=1;A.toggleCrouch();ok(P.crouch,'não agachou');const x0=P.x;step(60,{mx:1,my:0});ok(P.x-x0<60,'agachado andou rápido demais '+(P.x-x0|0)+' '+P.crouch+' '+A.IN.run+' '+P.dodge);A.toggleCrouch();
 // amigos em silêncio
 {const c=A.compOf('edu');if(c){A.enemies=[];const e=A.makeEnemy('zumbi',P.x+260,P.y,null);e.state='wander';e.hp=999;A.enemies.push(e);G.lastLoud=-99;P.lamp=false;c.cool=0;c.x=P.x-20;c.y=P.y;step(30,{mx:0,my:0,fire:false});ok(e.hp===999,'Edu quebrou o silêncio atirando');P.lamp=true;}}
 // Santa Clara só tem ela
 {const hb=A.getBuildings()[A.hosp2B()];const z2=A.makeEnemy('zumbi',A.tc(hb.x+3),A.tc(hb.y+30),null);A.enemies=[z2];step(3,{});ok(!z2.alive,'zumbi dentro do Santa Clara');}
 // Dona Cida
 A.dbgJump('bc2');finishTalk();ctx.__timeouts.length=0;G.mode='play';step(5,{});ok(G.flags.cidaTurned&&!A.getNpcs().find(n=>n.id==='cida').cond(),'Dona Cida não virou');ok(A.enemies.some(e=>e.uid==='cidaZ'),'Dona Cida zumbi não apareceu');
 P.x=A.tc(108);P.y=A.tc(254);step(5,{});finishTalk();ok(G.flags.cidaSeen,'cena da Dona Cida');
 const sv=A.serialize();A.loadState(sv);G.mode='play';step(5,{});ok(A.getBuildings()[A.cidaB()].safe===false,'apartamento voltou a ser seguro');
 const en=A.STORY.ending();ok(/Tião/.test(en.b),'final sem o Tião');P.hp=100;P.max=100;}
// ===== v1.1: esforço, cega esperta, vozes, bugs =====
{const X=s=>vm.runInContext(s,ctx);
 A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;
 // P.ride não sobra depois de carregar no meio do bondinho
 P.ride=true;const sv0=A.serialize();A.loadState(sv0);ok(!P.ride,'P.ride sobrou depois de carregar');
 // Santa Clara: saída com corrente + porta emperrada; andar larga; dano larga
 X("dbgJump('hospSaida')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
 ok(G.flags.hospLock&&G.flags.matheusJoin&&A.invCount('alicate')>0,'pulo hospSaida');
 const ho=A.getGates().find(g=>g.id==='hospOut');A.useGate(ho);ok(X('!!G.struggle')&&!ho.open,'corrente não pediu esforço');
 X("KEYS.KeyW=true");step(20,{});X("KEYS.KeyW=false");ok(!X('G.struggle'),'andar não largou o esforço');
 A.useGate(ho);for(let i=0;i<40&&!G.flags.chainCut;i++){A.doInteract();step(8,{});}step(2,{});ok(G.flags.chainCut&&X('G.struggle&&/porta/.test(G.struggle.label)'),'corrente cortada não virou porta emperrada');
 const o=A.enemies.find(e=>e.type==='ouvinte');o.x=P.x+300;o.y=P.y;{const q=ctx.__timeouts.splice(0);q.forEach(f=>f());}ok(o&&o.heard>0,'a cega não ouviu a corrente');
 X("G.struggle=null");A.useGate(ho);ok(X("G.struggle&&/porta/.test(G.struggle.label)"),'corrente cortada voltou do começo');finS();ok(ho.open&&G.flags.hospOut,'porta dos fundos não abriu');
 // porta da frente: força e falha
 A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;X("dbgJump('hospIn')");finishTalk();ctx.__timeouts.length=0;G.mode='play';step(3,{});finishTalk();
 ok(G.flags.hospLock,'não trancou no Santa Clara');const hi=A.getGates().find(g=>g.id==='hospIn');A.useGate(hi);ok(X('!!G.struggle&&G.struggle.fake'),'porta da frente sem esforço falso');finS();ok(!hi.open&&G.flags.hospTry,'porta da frente abriu');
 // cega: faro de perto, mesmo parado
 {const oo=A.enemies.find(e=>e.type==='ouvinte');oo.heard=0;oo.listen=0;oo.x=P.x+40;oo.y=P.y;const [tx,ty]=[(P.x/32)|0,(P.y/32)|0];P.moving=false;P.crouch=false;P.hidden=null;
  let got=false;for(let i=0;i<120&&!got;i++){step(1,{mx:0,my:0});if(oo.heard>0||P.hp<P.max)got=true;}ok(got,'a cega não sentiu o cheiro de perto');
  // ronda puxa pro lado do jogador
  oo.press=200;let near=0;for(let i=0;i<20;i++){X("ouvRandomTarget(enemies.find(e=>e.type==='ouvinte'))");if(Math.hypot(oo.nx-P.x,oo.ny-P.y)<32*9)near++;}ok(near>=10,'ronda não puxa pro jogador: '+near);}
 ok(A.getPickups().filter(p=>p.id==='garrafa'&&A.getBuildings()[A.hosp2B()]&&A.bAt&&true).length>=0,'');
 {const hb=A.getBuildings()[A.hosp2B()];const n=A.getPickups().filter(p=>p.id==='garrafa'&&p.tx>=hb.x&&p.tx<hb.x+hb.w&&p.ty>=hb.y&&p.ty<hb.y+hb.h).length;ok(n<=9,'garrafas demais no Santa Clara: '+n);}
 // gerador e pavio pedem esforço
 A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;X("dbgJump('ivo')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
 G.flags.ivoMet=true;A.STORY.geradorL();ok(!G.flags.geradorL&&X('!!G.struggle'),'gerador sem esforço');finS();ok(G.flags.geradorL,'gerador não ligou depois do esforço');
 // gente presa / gritos / medo: roda sem erro
 A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;X("dbgJump('caos')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
 X("trapForce()");ok(X('!!G.ev.trap'),'evento de gente presa não começou');X("DBG.fearMax=true");
 for(let i=0;i<60*20;i++){A.update(1/60);if(i%120===0){A.renderWorld();A.drawHUD();X('drawPsy()');}finishTalk();}
 ok(!X('G.ev.trap'),'evento de gente presa não terminou');X("DBG.fearMax=false");
 // Pescador volta ao carregar; escopeta do Tião volta
 G.flags.pescOn=true;G.flags.tiaoMorto=true;const sv=A.serialize();A.loadState(sv);G.mode='play';
 ok(A.enemies.some(e=>e.uid==='b_pescador'),'Pescador sumiu ao carregar');ok(A.getPickups().some(p=>p.uid==='tiaoG'),'escopeta do Tião sumiu ao carregar');
 // dinamite plantada e salvo no meio do pavio
 G.flags.dinaPlanted=true;G.flags.bloqWeak=false;A.loadState(A.serialize());ok(G.flags.bloqWeak,'pavio salvo travou a barricada');
 // cutscene com NPC dentro: o Richard entra
 A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;X("dbgJump('ivo')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
 {const iv=A.getNpcs().find(n=>n.id==='ivo');P.x=A.tc(133.5);P.y=A.tc(416.5);A.enemies=A.enemies.filter(e=>e.uid==='rosa');A.STORY.ivo(iv);
  for(let i=0;i<200&&X('CUT.on&&!(CUT.st&&CUT.st.say)');i++)A.update(1/60);for(let i=0;i<240;i++)A.update(1/60);
  const bP=X('bmap[idx((P.x/TILE)|0,(P.y/TILE)|0)]'),bI=X("bmap[idx((npcs.find(n=>n.id==='ivo').x/TILE)|0,(npcs.find(n=>n.id==='ivo').y/TILE)|0)]");ok(bP===bI,'Richard ficou fora da casa do Seu Ivo');finishTalk();}
}
// ===== v1.2: Marlon, Nicolas, Alex Rese, final, esquiva, exploração =====
{const X=s=>vm.runInContext(s,ctx);
 A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;
 const L=A.getLM();for(const k of ['marlon','nico','alex','marlonA'])ok(L[k]&&R((L[k].x/32)|0,(L[k].y/32)|0),'personagem inalcançável '+k);
 ok(X("interacts.filter(o=>o.type==='mochila').length")>=20,'poucas mochilas');ok(X("interacts.filter(o=>o.type==='cooler').length")>=6,'poucas caixas térmicas');
 ok(A.getPickups().filter(p=>p.kind==='file'&&p.id>=X('FOTO0')&&p.id<X('FOTO0')+12).length===12,'fotos faltando');
 // Marlon: aparece no caos, escolha "Dona Cida", a Dona Cida não vira
 X("dbgJump('marlon')");finishTalk();ctx.__timeouts.length=0;G.mode='play';step(5,{});
 ok(G.flags.marlonMet,'Marlon não apareceu');
 for(let i=0;i<200&&X('CUT.on');i++){if(X('!!CUT.choice'))X('cutChoose(0)');else X('cutSkip()');}
 ok(G.flags.marlon==='cida','escolha do Marlon');
 X("dbgJump('bc2')");finishTalk();ctx.__timeouts.length=0;G.mode='play';step(30,{});ok(!G.flags.cidaTurned,'Dona Cida virou mesmo com o Marlon');
 ok(A.getNpcs().find(n=>n.id==='marlonC').cond(),'Marlon não está com a Dona Cida');
 // Nicolas: o drone e a conversa
 A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;X("dbgJump('nico')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
 for(let i=0;i<60*9;i++)A.update(1/60);finishTalk();ok(G.flags.droneSeen,'drone do Nicolas não apareceu');
 A.STORY.nicoTalk(A.getNpcs().find(n=>n.id==='nico'));finishTalk();ok(G.flags.nicoMet&&A.invCount('rojao')>0,'Nicolas / rojões');
 // rojão e sinalizador
 P.thr='rojao';const r0=A.invCount('rojao');A.throwGrenade();ok(A.invCount('rojao')===r0-1,'rojão não saiu');A.invAdd('sinal',1);P.thr='sinal';A.throwGrenade();for(let i=0;i<60;i++)A.update(1/60);ok(X('FLARES.length')===1,'sinalizador não acendeu');
 // Alex: entra no Mercado, escolha "junto"
 A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;X("dbgJump('alex')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
 P.x=L.alex.x;P.y=L.alex.y+40;for(let i=0;i<5;i++)A.update(1/60);ok(G.flags.alexMet,'Alex não apareceu');
 for(let i=0;i<200&&X('CUT.on');i++){if(X('!!CUT.choice'))X('cutChoose(1)');else X('cutSkip()');}ok(G.flags.alex==='junto'&&G.flags.alexGone,'escolha do Alex');
 // final: os três ajudam, o Alex se sacrifica, o chefe apanha
 X("dbgJump('final')");finishTalk();ctx.__timeouts.length=0;G.mode='play';P.hp=P.max=99999;
 let boss=null;for(let i=0;i<60*20;i++){A.update(1/60);if(X('CUT.on'))X('cutSkip()');boss=A.enemies.find(e=>e.type==='boss');}
 ok(X('ALLY.list.length')===2,'Marlon e Nicolas não chegaram');ok(boss,'chefe não apareceu');
 const h0=boss?boss.hp:0;for(let i=0;i<60*25;i++){A.update(1/60);if(X('CUT.on'))X('cutSkip()');}
 ok(G.flags.alexMorto,'o professor não se sacrificou');for(let i=0;i<60*50;i++){A.update(1/60);if(X('CUT.on'))X('cutSkip()');}ok(boss&&boss.alive,'os aliados mataram o chefe sozinhos '+(boss&&[boss.alive,boss.hp|0,G.wave|0,G.mode]));ok(!boss||!boss.alive||boss.hp<h0-600,'os três não machucaram o chefe '+(boss&&boss.hp|0));
 const en=A.STORY.ending();ok(/Rese/.test(en.b)&&/Marlon/.test(en.b),'final sem os três');
 // esquiva: abusar cansa
 A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;A.enemies=[];P.st=100;const sts=[];for(let i=0;i<4;i++){P.dodgeCd=0;P.dodge=0;A.dodge?A.dodge():X('dodge()');sts.push(P.st|0);}
 ok(sts[0]-sts[1]<sts[1]-sts[2]||sts[2]===sts[1],'esquiva seguida não cansa mais: '+sts);
 // câmera: perto dentro de prédio fechado, longe na rua aberta
 P.x=A.tc(60);P.y=A.tc(245.5);for(let i=0;i<120;i++)A.update(1/60);const fOut=X('G.camF');const sb=A.getBuildings()[A.hosp2B()];P.x=A.tc(sb.x+30);P.y=A.tc(sb.y+28);A.enemies=[];for(let i=0;i<180;i++)A.update(1/60);ok(X('G.camF')>fOut,'câmera não aproximou no hospital '+fOut+' '+X('G.camF'));
 // mochila: abre uma vez
 const mo=X("interacts.find(o=>o.type==='mochila')");const cnt=()=>X("G.inv.reduce((n,s)=>n+(s?s.q:0),0)+G.box.reduce((n,s)=>n+s.q,0)");const n0=cnt();X("v12Interact(interacts.find(o=>o.type==='mochila'))");ok(cnt()>n0,'mochila vazia');const n1=cnt();X("v12Interact(interacts.find(o=>o.type==='mochila'))");ok(cnt()===n1,'mochila deu item duas vezes');
}
// ===== 1.2.1: limite de armas, fuzil =====
{const X=s=>vm.runInContext(s,ctx);A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;
 ok(X("WEAPONS[9].id")==='fuzil'&&P.owned.length===X('WEAPONS.length'),'fuzil fora da lista');
 ok(A.getPickups().some(p=>p.kind==='weapon'&&p.id===9),'fuzil não está no mapa');
 for(const id of [1,2,3]){P.owned[id]=true;P.mags[id]=5;}P.w=2;
 const fp={uid:'tst',tx:(P.x/32)|0,ty:(P.y/32)|0,x:P.x,y:P.y,id:9,q:20,kind:'weapon'};A.getPickups().push(fp);A.takePickup(fp);
 ok(P.owned[9],'fuzil não entrou na maleta');
 // maleta cheia: arma não cabe
 for(let i=0;i<20;i++)A.invAdd('m9',60);const before=P.owned[4];const mp={uid:'tst2',tx:(P.x/32)|0,ty:(P.y/32)|0,x:P.x,y:P.y,id:4,q:6,kind:'weapon'};A.getPickups().push(mp);A.takePickup(mp);ok(!P.owned[4]&&!before,'maleta cheia aceitou arma');
 ok(X('maletaFits([])'),'maleta não empacotou');
 A.UI.inv('itens');A.UI.act('wdrop',{w:'2'});ok(!P.owned[2]&&A.getPickups().some(p=>p.kind==='weapon'&&p.id===2),'arma largada não ficou no chão');
 const sv=A.serialize();A.loadState(sv);G.mode='play';ok(A.getPickups().some(p=>p.kind==='weapon'&&p.id===2&&String(p.uid).startsWith('wd')),'arma largada sumiu ao carregar');
 A.UI.box();A.UI.act('wtobox',{w:'9'});ok(!P.owned[9]&&G.box.some(b=>b.id==='_w'&&b.w===9),'arma não foi pro baú');const bi=G.box.findIndex(b=>b.id==='_w');for(let i=0;i<64;i++)G.inv[i]=null;A.UI.act('frombox',{i:String(bi)});ok(P.owned[9],'arma não voltou do baú');A.UI.close();
}
// ===== 1.2.4: Balneário silenciosa só com o Bombeiro e o Espécime =====
{const X=s=>vm.runInContext(s,ctx);A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;X("dbgJump('bc2')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
 for(const t of ['zumbi','corr','cao']){const e=A.makeEnemy(t,P.x+200,P.y,null);A.enemies.push(e);}step(5,{});
 ok(!A.enemies.some(e=>e.alive&&['zumbi','corr','cao','enferm'].includes(e.type)&&A.dAt((e.x/32)|0,(e.y/32)|0)>=5&&A.dAt((e.x/32)|0,(e.y/32)|0)<=7&&e.uid!=='cidaZ'),'ainda tem zumbi em Balneário silenciosa');}
{const X=s=>vm.runInContext(s,ctx);A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;X("dbgJump('hospIn')");finishTalk();ctx.__timeouts.length=0;G.mode='play';step(3,{});finishTalk();
 const hb=A.getBuildings()[A.hosp2B()];const p=A.makeEnemy('pers',P.x,P.y-200,null);p.outPos={x:A.tc(hb.x+30),y:A.tc(hb.y+hb.h+4)};p.x=P.x+60;p.y=P.y;A.enemies.push(p);for(let i=0;i<10;i++)A.update(1/60);
 ok(X(`bmap[idx((enemies.find(e=>e.type==='pers').x/TILE)|0,(enemies.find(e=>e.type==='pers').y/TILE)|0)]`)!==A.hosp2B(),'Perseguidor entrou no Santa Clara');}
// ===== 1.3: bancada, tutorial, Sonia =====
{const X=s=>vm.runInContext(s,ctx);A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;
 ok(X("interacts.filter(o=>o.type==='bancada').length")>=4,'faltam bancadas nos abrigos');
 ok(A.getPickups().some(p=>p.id==='pecas'),'sem peças de arma no mapa');
 const m0=X('WEAPONS[1].mag');P.owned[1]=true;A.invAdd('pecas',8);X("UI.act('upg',{w:'1',u:'m'})");ok(X('WEAPONS[1].mag')===Math.round(m0*1.5)&&A.invCount('pecas')===5,'pente estendido não aplicou');
 X("UI.act('upg',{w:'1',u:'m'})");ok(A.invCount('pecas')===5,'cobrou duas vezes a mesma melhoria');
 const sv=A.serialize();A.newGame('normal');G.mode='play';A.update(1/60);ok(X('WEAPONS[1].mag')===m0,'melhoria vazou pra outro jogo');
 A.loadState(sv);G.mode='play';A.update(1/60);ok(X('WEAPONS[1].mag')===Math.round(m0*1.5),'melhoria sumiu ao carregar');
 // tutorial começa no apartamento e termina ao sair
 A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;G.flags.armed=false;const st=A.getStart();P.x=st.x;P.y=st.y;A.update(1/60);A.update(1/60);ok(X('!!G.tut'),'tutorial não começou na Dona Cida');
 P.x=st.x;P.y=st.y+A.tc(12);for(let i=0;i<60;i++)A.update(1/60);ok(G.flags.tutDone&&!X('G.tut'),'tutorial não terminou ao sair');ctx.__timeouts.forEach(f=>f());ctx.__timeouts.length=0;ok(G.flags.soniaMet,'Sonia não ligou');
 // dica da Sonia quando fica parado no mesmo objetivo
 G.objT=200;G.ev.shT=0;const bq=X('BARK.q.length');A.update(1/60);ok(X('BARK.q.length')>bq||X('!!BARK.cur'),'Sonia não deu dica');
 // agachado desenha sem erro
 P.crouch=true;A.renderWorld();A.drawHUD();P.crouch=false;
}
// ===== 1.3.2: apresentação do Perseguidor na saída da clínica =====
{const X=s=>vm.runInContext(s,ctx);A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;X("dbgJump('brava')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
 ok(!A.enemies.some(e=>e.type==='pers'),'Perseguidor antes da Helena');G.flags.metHelena=true;const cb=A.getBuildings()[A.clinicB()];P.x=A.tc(cb.x+cb.w/2);P.y=A.tc(cb.y+cb.h/2);A.update(1/60);A.update(1/60);
 P.x=A.tc(cb.x+cb.w/2);P.y=A.tc(cb.y+cb.h+3);for(let i=0;i<10;i++)A.update(1/60);ok(G.flags.persCine&&A.CUT.on,'cena do Perseguidor não começou ao sair da clínica');
 for(let i=0;i<60*30&&A.CUT.on;i++){A.update(1/60);if(A.CUT.bub&&A.CUT.bub.shown>=A.CUT.bub.t.length)X('cutTap()');}finishTalk();
 const pe=A.enemies.find(e=>e.type==='pers');ok(pe&&pe.state==='chase'&&G.flags.persOn,'Perseguidor não começou a caçar');ok(!X("peds.some(p=>p.st==='cutcrawl')"),'vítima ficou no mapa');}
ctx.__timeouts.length=0;A.newGame('dificil');G.mode='play';P.hp=1;P.y+=200;const z=A.makeEnemy('zumbi',P.x+15,P.y);z.state='chase';A.enemies.push(z);step(400,{fire:false,mx:0,my:0,aimAng:null});
ok(G.mode==='dead','não morreu');ctx.__timeouts.forEach(f=>f());

// ===== 1.6: clima, flashback, missões, multiplayer =====
{ const R=c=>vm.runInContext(c,ctx);
  A.newGame('normal');G.mode='play';G.flags.tutDone=true;G.tut=null;
  for(const k of ['chuva','tempestade','neblina','apagao']){R(`wxSet('${k}')`);step(120,{mx:0,my:0});ok(R('G.wx')===k||R('G.wx&&G.wx.k')===k,'clima '+k);}
  R(`wxSet(null)`);
  // flashback
  A.newGame('normal');G.mode='play';G.flags.tutDone=true;G.tut=null;G.flags.uniDone=true;G.flags.uniMat=true;const px=P.x;
  R('STORY.flashStart()');for(let i=0;i<30;i++){finishTalk();step(20,{mx:0,my:0});}
  ok(R('FB.on'),'flashback não começou');ok(R('P.lookO')===R('LOOKS.matheus'),'flashback sem visual do Matheus');
  R('flashEnd()');for(let i=0;i<20;i++){finishTalk();step(10,{mx:0,my:0});}
  ok(!R('FB.on'),'flashback não terminou');ok(!R('P.lookO'),'visual não voltou');ok(Math.abs(P.x-px)<200,'não voltou pro save');ok(G.flags.flashDone,'flag do flashback');
  // multiplayer (anfitrião simulado com um amigo remoto)
  A.newGame('normal');
  R(`MP.role='host';MP.myId='0';MP.me={nome:'Richard',apelido:'rk',cor:'#d9a33c',char:'richard'};MP.players={'1':{c:{nome:'Edu',apelido:'edu',cor:'#4a9ad8',char:'edu'},peer:{open:false},x:0,y:0,ang:0,hp:100,w:1}};mpBegin(mpStartInfo());`);
  ok(R('MP.on&&G.mode')==='play','mp não começou');ok(A.objective().t.includes('onda'),'objetivo mp '+A.objective().t);
  const goto=(L)=>{P.x=L.x;P.y=L.y+20;R(`MP.players['1'].x=${L.x};MP.players['1'].y=${L.y+20};`);};
  R(`MP.players['1'].x=P.x+40;MP.players['1'].y=P.y;`);let guard=0,maxE=0,bosses=0;
  while(R('MP.stage')<R('MPST.length')&&guard++<80){for(let i=0;i<6;i++){P.hp=100;R(`MP.players['1'].hp=100`);step(30,{mx:0,my:0});finishTalk();}
    maxE=Math.max(maxE,R('enemies.filter(e=>e.alive&&e.mpw).length'));if(R('!!(MP.boss&&MP.boss.alive)'))bosses++;
    R(`for(const e of enemies)if(e.alive&&e.mpw&&hyp(e.x-P.x,e.y-P.y)<900)killEnemy(e);if(MPST[MP.stage]&&MPST[MP.stage].hold)MP.prog+=20;`);}
  ok(maxE>=4,'poucos zumbis no mp '+maxE);ok(bosses>=3,'chefões do mp '+bosses);
  ok(R('MP.stage')>=R('MPST.length'),'história mp parou no estágio '+R('MP.stage'));
  const snap=R('JSON.stringify(mpSnap())');ok(snap.length>50,'snapshot');
  step(200,{mx:0,my:0});ok(!R('MP.on'),'mp não terminou');ok(R('contaGet()')!==undefined,'conta stats');
  // convidado aplicando o snapshot
  A.newGame('normal');R(`MP.role='guest';MP.myId='1';MP.lobby=[];mpBegin({pl:{'0':{apelido:'rk',char:'richard',cor:'#fff'},'1':{apelido:'edu',char:'edu',cor:'#4a9ad8'}}});mpApplySnap(${snap});`);
  step(120,{mx:0,my:0});ok(R('enemies.every(e=>e.ghost||!e.alive)'),'convidado com zumbis locais');ok(R('MP.remote[0]&&MP.remote[0].x')>0,'convidado sem anfitrião');
  R(`UI.act('mp-leave',{})`);ok(!R('MP.on')&&!R('G.mp'),'sair do mp');
  // conta
  R(`UI.conta('title');contaSave({nome:'Richard',apelido:'rk',cor:'#fff',fav:'edu'});`);ok(R('contaGet().apelido')==='rk','conta');
}
// ===== correções: registro, maleta e menu de teste =====
{ const R=c=>vm.runInContext(c,ctx);
  // carregar com a maleta quase cheia não pode duplicar itens no baú
  const ids=Object.keys(R('ITEMS')).filter(id=>R(`!!isz('${id}')`));let dup=0;
  const tot=()=>{const m={};for(const s of G.inv)if(s)m[s.id]=(m[s.id]||0)+s.q;for(const s of G.box)if(s.id!=='_w')m[s.id]=(m[s.id]||0)+s.q;return JSON.stringify(Object.keys(m).sort().map(k=>[k,m[k]]));};
  for(let t=0;t<120&&!dup;t++){A.newGame('normal');for(const w of [1,2,3,5,6])P.owned[w]=Math.random()<.4;
    for(let i=0;i<120;i++)A.invAdd(ids[(Math.random()*ids.length)|0],1+((Math.random()*3)|0));
    if(t%2)R('mOrganize()');for(let i=0;i<G.inv.length;i++)if(G.inv[i]&&Math.random()<.15)G.inv[i]=null;R('mSync()');
    const a=tot();A.loadState(JSON.parse(JSON.stringify(A.serialize())));if(tot()!==a)dup++;}
  ok(!dup,'itens duplicados ao carregar com a maleta cheia');
  // pilha pega pela metade (maleta cheia) continua com o que sobrou depois de carregar
  A.newGame('normal');G.mode='play';const p=A.getPickups().find(p=>p.kind==='item'&&p.id==='m9'&&p.q>=6);
  A.invAdd('m9',R('ITEMS.m9.st')-3);for(let i=0;i<120;i++)A.invAdd(['comb','garrafa','gran','spray','pilha'][i%5],1);
  A.takePickup(p);const left=p.q;A.loadState(JSON.parse(JSON.stringify(A.serialize())));const p2=A.getPickups().find(x=>x.uid===p.uid);
  ok(p2&&p2.q===left,'pilha pela metade voltou cheia depois de carregar');
  // menu de teste: "Tempo limpo" tira a tempestade
  A.newGame('normal');G.mode='play';R(`wxSet('tempestade',true)`);A.UI.act('dbg',{k:'v16:wx:off'});ok(R('G.wx')==='chuva','tempo limpo no menu de teste');A.UI.close();
}

// ===== 1.8: dinheiro, Mascate, Horda, levantar, frases, placar =====
{ const R=c=>vm.runInContext(c,ctx);
  A.newGame('normal');G.mode='play';G.flags.tutDone=true;G.tut=null;
  // dinheiro cai e é pego
  R(`for(let i=0;i<40;i++){const z=makeEnemy('zumbi',P.x+60,P.y);enemies.push(z);killEnemy(z);}`);
  const gp=R(`pickups.filter(p=>p.id==='grana')`); ok(gp.length>0,'zumbi não deixou dinheiro');
  const g0=R('grana()'); R(`takePickup(pickups.find(p=>p.id==='grana'))`); ok(R('grana()')>g0,'pegar dinheiro');
  // loja: comprar munição e arma, vender
  R(`{G.flags.grana=5000;globalThis.__n0=invCount('m9');lojaComprar('0:0');}`); ok(R(`invCount('m9')`)>=R('__n0')+15,'comprar munição'); ok(R('grana()')===5000-90,'preço da munição');
  R(`P.owned[2]=false;lojaComprar('3:0');`); ok(R('P.owned[2]')||R('grana()')===4910,'comprar escopeta (ou sem espaço)');
  R(`{invAdd('joia',2);globalThis.__g=grana();lojaVender('joia',2);}`); ok(R('grana()')===R('__g')+1000,'vender joia');
  R(`UI.loja('c');UI.loja('v');UI.close();`);
  ok(R('mascates().length')>=2,'mascates no mapa '+R('mascates().length'));
  // salvar guarda o dinheiro
  R(`{G.flags.grana=777;const s=JSON.parse(JSON.stringify(serialize()));G.flags.grana=0;loadState(s);}`); ok(R('grana()')===777,'dinheiro salvo');
  // Horda solo: passa onda, intervalo e chega no chefão da onda 5
  R(`contaSave({nome:'Teste',apelido:'teste',cor:'#fff',fav:'richard'});hordaSolo();`);
  ok(R('MP.on&&MP.modo')==='horda','horda não começou');
  let guard=0,sawBoss=false,sawPause=false;
  while(R('MP.onda||0')<6&&guard++<120){for(let i=0;i<4;i++){P.hp=100;step(30,{mx:0,my:0});finishTalk();}
    if(R('!!(MP.boss&&MP.boss.alive)'))sawBoss=true; if(R('!!G.mascTmp'))sawPause=true;
    R(`{for(const e of enemies)if(e.alive&&e.mpw)killEnemy(e);const s=mpStage(MP.stage);if(s&&s.pausa)MP.prog+=20;}`);}
  ok(R('MP.onda')>=6,'horda parou na onda '+R('MP.onda')); ok(sawBoss,'horda sem chefão'); ok(sawPause,'horda sem intervalo/mascate');
  ok(R('MP.stats["0"].k')>0,'placar sem abates');
  // cair, levantar e acabar
  R(`P.hp=0;die();`); ok(R('P.mpDown')===30,'caído 30s'); R(`mpRevived('0');`); ok(R('P.mpDown')===0&&R('P.hp')===50,'levantar');
  R(`mpSay(0);`); ok(R('!!MP.says["0"]'),'frase');
  R(`renderWorld();drawHUD();drawMini();`);
  R(`mpEnd(false);`); ok(R('UI.cur')==='win'&&!R('MP.on'),'fim da horda'); ok(R('contaGet().hordaMax')>=6,'recorde salvo');
  R(`UI.act('mp-leave',{})`);
}
// frame loop
A.newGame('facil');G.mode='title';for(let i=0;i<30;i++)A.frame(i*16);
console.log(fails?`${fails} falhas`:'TUDO OK');
