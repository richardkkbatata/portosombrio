// ===================== 1.10 · ARMAS NOVAS · AMIGOS COM ESTRATÉGIA · MAIS MEDO · CORREÇÕES =====================
const capOn=()=>(typeof SN!=='undefined'&&SN.on)||(typeof RC!=='undefined'&&RC.on)||!!(G.flags&&G.flags.cap);
const fbOn=()=>typeof FB!=='undefined'&&FB.on;
const mpOn=()=>typeof MP!=='undefined'&&MP.on;

// ---------- 1) camadas de tela que não acabavam ----------
// A chuva de cinza só contava o tempo fora do flashback/online/cena: se começasse antes, a tela ficava cinza pra sempre.
{const vt=v16Tick; v16Tick=function(dt){vt(dt);
  if(!G.ev)return; if(G.ev.v19cinza>70)G.ev.v19cinza=70;
  if(G.ev.v19cinza>0&&(fbOn()||mpOn()||CUT.on||G.mode!=='play'))G.ev.v19cinza-=dt||0;
  if(typeof BR!=='undefined'&&BR.smokes)for(const s of BR.smokes)if(s.t>12)s.t=12;};}
function limparTela(){if(G.ev)G.ev.v19cinza=0;if(typeof BR!=='undefined'){BR.smokes=[];}G.flick=0;}
{const ng=newGame; newGame=function(){const r=ng.apply(this,arguments);try{limparTela();}catch(e){}return r;};}
{const ls=loadState; loadState=function(){const r=ls.apply(this,arguments);try{limparTela();}catch(e){}return r;};}

// ---------- 2) o Perseguidor não aparece onde não faz sentido ----------
// Ele caçava o Matheus no flashback do porto (antes do surto, o Richard nem estava lá) e podia surgir nos capítulos extras e na Universidade.
{const up=updPers; updPers=function(dt){
  const fora=fbOn()||capOn()||(typeof inZone==='function'&&inZone())||(typeof inSew==='function'&&inSew());
  if(fora){for(const e of enemies)if(e.alive&&e.type==='pers')e.alive=false;G.persT=Math.max(G.persT||0,20);return;}
  return up(dt);};}

// ---------- 3) Universidade: a seta leva até a saída (e até o .38) ----------
{const ob=objective; objective=function(){const o=ob();
  try{if(!o||capOn()||fbOn()||mpOn()||typeof inZone!=='function'||!inZone())return o;const F=G.flags,i38=WI('rev38');
    if(F.uniDone&&i38>=0&&!P.owned[i38]&&pickups.some(p=>p.uid==='w110rev'))return {t:'O Marlon falou: pegue o revólver .38 e a munição na guarita do Seu Ademir',at:{x:pickups.find(p=>p.uid==='w110rev').x,y:pickups.find(p=>p.uid==='w110rev').y}};
    if(o.at&&!inZonePx(o.at.x,o.at.y)&&LM.tunelZ)return Object.assign({},o,{t:'Saia da Universidade pelo túnel, no leste · '+o.t,at:LM.tunelZ});
  }catch(e){}return o;};}

// ---------- 4) o Mascate não existe no modo história (só no online) ----------
{const ms=mascates; mascates=function(){if(!mpOn())return G.mascTmp?[G.mascTmp]:[];return ms();};}

// ---------- 5) NPC empurrado volta pro lugar dele ----------
{const vt=v16Tick; v16Tick=function(dt){vt(dt);if(G.mode!=='play'||!dt)return;
  for(const n of npcs){if(n.hx==null)continue;if(CUT.on){n.hx=null;continue;}
    if(G.time-(n.pushT||0)<1.5||hyp(P.x-n.x,P.y-n.y)<70)continue;
    const dx=n.hx-n.x,dy=n.hy-n.y,d=hyp(dx,dy);if(d<2){n.x=n.hx;n.y=n.hy;n.hx=null;continue;}
    const s=Math.min(d,60*dt);n.x+=dx/d*s;n.y+=dy/d*s;}};}

// ---------- 6) Sargento Brandt chama reforço ----------
{const ub=updBrandt; updBrandt=function(e,dt){const ph0=e.ph||1;const r=ub(e,dt);
  if(e.ph>ph0&&!G.flags.brandtDone){spawnRing(e.ph===2?2:3,'corr',300,480,true);
    brSay(e.ph===2?'Equipe dois, entra. ...Ah, é. Vocês morreram. Pelo menos ainda andam.':'Chega. Agora é sério.','s');}
  return r;};}

// ---------- 7) Marlon e Nicolas se mexem no heliponto ----------
{const at=allyTick; allyTick=function(dt){const r=at(dt);
  try{if(!G.flags.radio||G.heli||CUT.on||G.mode!=='play')return r;
    for(const a of ALLY.list){if(a.boarded)continue;a.moving=false;
      const perto=enemies.filter(e=>e.alive&&!e.t.boss&&hyp(e.x-a.x,e.y-a.y)<380).sort((p,q)=>hyp(p.x-a.x,p.y-a.y)-hyp(q.x-a.x,q.y-a.y));
      let vx=0,vy=0;const c=perto[0];
      if(c&&hyp(c.x-a.x,c.y-a.y)<110){const d=hyp(c.x-a.x,c.y-a.y)||1;vx=(a.x-c.x)/d;vy=(a.y-c.y)/d;}
      else{a.st=(a.st||0)-dt;if(a.st<=0){a.st=rr(1.2,2.8);a.sd=Math.random()<.5?1:-1;}
        const tg=c||enemies.find(e=>e.alive&&e.t.boss);if(tg){const ang=Math.atan2(tg.y-a.y,tg.x-a.x)+a.sd*Math.PI/2;vx=Math.cos(ang)*.7;vy=Math.sin(ang)*.7;}
        const dp=hyp(P.x-a.x,P.y-a.y);if(dp>360){vx+=(P.x-a.x)/dp;vy+=(P.y-a.y)/dp;}}
      if(LM.pad){const dd=hyp(LM.pad.x-a.x,LM.pad.y-a.y);if(dd>520){vx+=(LM.pad.x-a.x)/dd;vy+=(LM.pad.y-a.y)/dd;}}
      const l=hyp(vx,vy);if(l>.05){const s=(a.id==='nico'?105:125)*dt,ox=a.x,oy=a.y;move(a,vx/l*s,vy/l*s,false);a.moving=hyp(a.x-ox,a.y-oy)>s*.3;if(a.moving)a.walk=(a.walk||0)+dt*12;}}
  }catch(e){}return r;};}

// ---------- 8) companheiros com estratégia própria ----------
// Edu flanqueia (chega pelo lado do zumbi); Matheus dá cobertura de trás e de lado.
// Os dois chamam a atenção do zumbi que está em cima do Richard quando ele está machucado.
{const uc=updComps; updComps=function(dt){
  const lst=G.comps||[];
  for(const c of lst){c.cpos=null;
    if(P.inCar||P.hidden||c.inCar||CUT.on||G.mode!=='play')continue;
    const hb=typeof hosp2B==='function'?hosp2B():-1; if(G.inB>=0&&G.inB===hb&&!G.flags.hospOut)continue;
    const e=compTarget(c.x,c.y,340); if(!e)continue;
    if(hyp(P.x-c.x,P.y-c.y)>300)continue;
    const a0=Math.atan2(e.y-P.y,e.x-P.x);
    if(!c.side)c.side=Math.random()<.5?1:-1; c.sideT=(c.sideT||0)-dt; if(c.sideT<=0){c.sideT=rr(3,6);if(Math.random()<.35)c.side*=-1;}
    const de=hyp(e.x-c.x,e.y-c.y); let tx,ty;
    if(c.id==='edu'){const ang=a0+c.side*1.15,R=c.pel>1?115:150;tx=e.x-Math.cos(ang)*R;ty=e.y-Math.sin(ang)*R;}
    else{tx=P.x-Math.cos(a0)*60+Math.cos(a0+Math.PI/2*c.side)*55;ty=P.y-Math.sin(a0)*60+Math.sin(a0+Math.PI/2*c.side)*55;}
    if(de<70){const d=de||1;tx=c.x+(c.x-e.x)/d*80;ty=c.y+(c.y-e.y)/d*80;}
    const dl=hyp(tx-P.x,ty-P.y); if(dl>240){tx=P.x+(tx-P.x)/dl*240;ty=P.y+(ty-P.y)/dl*240;}
    const ix=(tx/TILE)|0,iy=(ty/TILE)|0; if(!inb(ix,iy)||SOLID[map[idx(ix,iy)]])continue;
    c.cpos={x:tx,y:ty};
    c.tauntCd=(c.tauntCd??rr(4,7))-dt;
    if(c.tauntCd<=0){const z=enemies.find(z=>z.alive&&!z.t.boss&&!z.stalker&&z.state==='chase'&&hyp(z.x-P.x,z.y-P.y)<95&&hyp(z.x-c.x,z.y-c.y)<260);
      if(z&&P.hp<P.max*.75){c.tauntCd=rr(9,14);z.state='investigate';z.nx=c.x;z.ny=c.y;z.it=2.6;alertNoise(c.x,c.y,220);
        bark(c.id,'a',c.id==='edu'?rpick(['Ei! AQUI, seu feio!','Vem cá, vem! Larga ele!','Olha pra mim, desgraçado!']):rpick(['Aqui! AQUI!','Larga ele! Vem pra cá!','Richard, sai daí que eu distraio!']));}
      else c.tauntCd=1.5;}}
  const r=uc(dt);
  for(const c of lst){if(!c.cpos||c.inCar||P.hidden)continue;const dx=c.cpos.x-c.x,dy=c.cpos.y-c.y,d=hyp(dx,dy);if(d<12)continue;
    const s=Math.min(d,(d>120?150:105)*dt),ox=c.x,oy=c.y;move(c,dx/d*s,dy/d*s,false);
    if(hyp(c.x-ox,c.y-oy)>s*.3){c.moving=true;c.walk+=dt*12;if(c.fireT<=0)c.ang+=angDiff(c.ang,Math.atan2(dy,dx))*Math.min(1,dt*8);}}
  return r;};}

// ---------- 9) quatro armas novas ----------
const W110=[
  {id:'sniper',n:'Rifle de precisão',ammo:'r308',mag:5,dmg:240,rate:1.25,spread:.002,speed:2300,reload:2.8,pellets:1,crit:.35,pierce:4,noise:1000,kick:11,knock:280,life:1.1,len:34},
  {id:'cano',n:'Espingarda de cano duplo',ammo:'cart',mag:2,dmg:15,rate:.28,spread:.3,speed:820,reload:1.7,pellets:10,crit:0,noise:700,kick:9,knock:230,life:.34,len:26},
  {id:'machado',n:'Machado de incêndio',melee:true,dmg:58,rate:.72,range:58},
  {id:'rev38',n:'Revólver .38',ammo:'m38',mag:6,dmg:46,rate:.42,spread:.02,speed:1200,reload:1.9,pellets:1,crit:.18,pierce:1,noise:560,kick:5,knock:120,life:.75,len:16},
];
for(const w of W110)if(!WEAPONS.some(x=>x.id===w.id))WEAPONS.push(w);
function WI(id){return WEAPONS.findIndex(w=>w.id===id);}
ITEMS.r308={n:'Munição .308',s:'.308',c:'#a8945a',st:20,k:'ammo',d:'Cartucho de rifle de precisão. Atravessa tudo o que estiver na frente.'};
ITEMS.m38={n:'Munição .38',s:'.38',c:'#b49a6a',st:36,k:'ammo',d:'Balas de revólver .38, numa caixa de papelão da guarita.'};
if(typeof MSZ!=='undefined'){MSZ.r308=[2,1];MSZ.m38=[1,1];}
if(typeof WSZ!=='undefined'){WSZ[WI('sniper')]=[7,2];WSZ[WI('cano')]=[5,2];WSZ[WI('rev38')]=[3,2];}
Object.assign(WMODEL,{sniper:{len:34,fore:20},cano:{len:26,fore:14},machado:{len:20,fore:0},rev38:{len:16,fore:0}});
// corpo a corpo não conta no limite de 3 armas de fogo
{const fa=firearms; firearms=function(){return fa().filter(i=>!WEAPONS[i].melee);};}
{const dw=drawWeaponModel; drawWeaponModel=function(c,id,loaded=true,firing=false){
  const R2=(x,y,w,h,r,f)=>{rrect(c,x,y,w,h,r);c.fillStyle=f;c.fill();}, hl=(x,y,w)=>{c.fillStyle='rgba(255,255,255,.15)';c.fillRect(x,y,w,.8);};
  switch(id){
    case 'sniper':
      c.fillStyle='#4a3a26';c.beginPath();c.moveTo(-17,-3);c.lineTo(-3,-2.2);c.lineTo(-3,2.6);c.lineTo(-17,3.4);c.closePath();c.fill();
      R2(-3,-2.4,14,4.8,1.2,'#2b2d30');c.fillStyle='#17181a';c.fillRect(10,-1.2,24,2.4);hl(10,-1.1,24);
      R2(0,-5.6,13,3,1.4,'#1c1d20');c.fillStyle='#3a6a8a';c.fillRect(12.4,-5.2,.8,2.2);
      c.fillStyle='#2a2b2e';c.fillRect(4,2.4,2.6,4);if(firing){c.fillStyle='rgba(255,210,120,.9)';c.beginPath();c.moveTo(34,0);c.lineTo(44,-3);c.lineTo(42,0);c.lineTo(44,3);c.closePath();c.fill();}return;
    case 'cano':
      c.fillStyle='#5a3a20';c.beginPath();c.moveTo(-14,-3);c.lineTo(-2,-2.2);c.lineTo(-2,2.2);c.lineTo(-14,3);c.closePath();c.fill();
      R2(-3,-2.8,8,5.6,1.4,'#2a2b2e');c.fillStyle='#141517';c.fillRect(5,-2.4,21,2);c.fillRect(5,.4,21,2);hl(5,-2.3,21);
      R2(8,-3,7,6,1.4,'#6a4426');return;
    case 'machado':
      c.fillStyle='#7a4e2a';c.fillRect(-6,-1.3,22,2.6);c.fillStyle='rgba(0,0,0,.25)';c.fillRect(-6,.4,22,.6);
      c.fillStyle='#b8262a';c.beginPath();c.moveTo(12,-1.4);c.lineTo(20,-7);c.lineTo(22,-1.4);c.closePath();c.fill();
      c.fillStyle='#d8d8d0';c.beginPath();c.moveTo(19.4,-7.2);c.lineTo(22.4,-1.4);c.lineTo(21,-1.4);c.lineTo(18.6,-6.4);c.closePath();c.fill();
      c.fillStyle='#2a2a2a';c.beginPath();c.moveTo(13,1.4);c.lineTo(18,4.6);c.lineTo(18.6,1.4);c.closePath();c.fill();return;
    case 'rev38':
      R2(-4,-1,2,2,.5,'#3a3a3a');R2(-3,-2.4,7,4.8,1.2,'#3a3c40');c.fillStyle='#4a4c50';c.beginPath();c.arc(4,0,3.2,0,6.283);c.fill();
      R2(6.5,-1.4,9,2.8,.8,'#45474b');c.fillStyle='#0b0b0c';c.fillRect(15.2,-.7,.8,1.4);c.fillStyle='#6a4426';c.fillRect(-3,1.2,3,3.4);return;
  }
  return dw(c,id,loaded,firing);};}
{const sh=AU.shot.bind(AU); AU.shot=function(id){
  if(id==='sniper'){this.nz(.45,1500,.6,1);this.tn(110,38,.26,'square',.28);this.nz(1.1,320,.8,.32,'lowpass',.06);return;}
  if(id==='cano'){sh('escopeta');this.nz(.25,900,.6,.4,'lowpass',.02);return;}
  if(id==='rev38'){this.nz(.2,2100,.7,.6);this.tn(150,50,.14,'square',.16);return;}
  return sh(id);};}
// mira a laser do rifle de precisão
{const dp=drawParts; drawParts=function(){dp();
  try{if(G.mode!=='play'||P.inCar||P.hidden||WEAPONS[P.w].id!=='sniper')return;
    const d=castRay(P.x,P.y,P.ang,1200,BULLET_BLOCK,false),x1=P.x+Math.cos(P.ang)*d,y1=P.y+Math.sin(P.ang)*d;
    ctx.strokeStyle='rgba(255,60,50,.32)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(P.x+Math.cos(P.ang)*20,P.y+Math.sin(P.ang)*20);ctx.lineTo(x1,y1);ctx.stroke();
    ctx.fillStyle='rgba(255,70,60,.85)';ctx.beginPath();ctx.arc(x1,y1,2,0,6.283);ctx.fill();}catch(e){}};}
// onde ficam: .38 na guarita da Universidade, cano duplo na casa do Seu Ivo, machado nos Bombeiros de Itajaí, rifle no bloqueio da Vértice
function w110Pick(uid,tx,ty,id,q,kind){const [x,y]=freeTileNear(tx,ty,true);pickups.push({uid,tx:x,ty:y,x:tc(x),y:tc(y),id,q,kind:kind||'item'});pickOcc.add(idx(x,y));}
{const g=genV12; genV12=function(){g();
  try{const T=L=>[(L.x/TILE)|0,(L.y/TILE)|0];
    if(LM.uniGuarita){const [x,y]=T(LM.uniGuarita);w110Pick('w110rev',x+1,y-1,WI('rev38'),6,'weapon');w110Pick('w110m38a',x+2,y-1,'m38',18);}
    if(LM.uniBib){const [x,y]=T(LM.uniBib);w110Pick('w110m38b',x-3,y-4,'m38',12);}
    if(LM.colonia){w110Pick('w110cano',137,412,WI('cano'),2,'weapon');w110Pick('w110cart',138,412,'cart',6);}
    if(LM.bombeiros){const [x,y]=T(LM.bombeiros);w110Pick('w110mach',x,y-3,WI('machado'),1,'weapon');}
    if(LM.vertice){const [x,y]=T(LM.vertice);w110Pick('w110r308a',x+3,y+2,'r308',10);}
    if(LM.lab){const [x,y]=T(LM.lab);w110Pick('w110r308b',x-2,y+3,'r308',8);}
  }catch(e){console.error(e);}};}
// o Marlon avisa do .38 no fim da Universidade
{const vt=v16Tick; v16Tick=function(dt){vt(dt);if(G.mode!=='play'||CUT.on||capOn()||fbOn()||mpOn())return;const F=G.flags,i=WI('rev38');
  if(F.uniDone&&!F.r38tip&&typeof inZone==='function'&&inZone()&&i>=0&&!P.owned[i]){F.r38tip=true;later(1800,()=>bark('marlon','a','Richard! O Seu Ademir guardava um .38 na guarita, com uma caixa de bala. Pega. Pro bicho do shopping tu vai precisar.',{dur:3.4}));}};}
{const tp=takePickup; takePickup=function(p){const r=tp.apply(this,arguments);try{if(p&&p.uid==='w110rev'&&!mpOn())later(600,()=>bark('rafa','s','Seis tiros. Tem que bastar.',{dur:2}));
  if(p&&p.uid==='w110snip'&&!mpOn())later(600,()=>bark('rafa','s','O atirador da Vértice deixou isso aqui. Tem mira e tudo.',{dur:2.4}));
  if(p&&p.uid==='w110cano'&&!mpOn())later(600,()=>bark('rafa','t','A espingarda do Seu Ivo. Ele ia gostar que ela servisse pra alguma coisa.',{dur:2.6}));}catch(e){}return r;};}
// munição nova também no loot e na lojinha do online
try{for(const D of DISTRICTS){if(!D.loot)continue;if(/Porto|Itajaí|Cabeçudas/.test(D.name)){D.loot.r308=(D.loot.r308||0)+.6;D.loot.m38=(D.loot.m38||0)+1;}else if(/Centro|Barra|Brava/.test(D.name))D.loot.m38=(D.loot.m38||0)+.8;}
  if(typeof LOOTQ!=='undefined'){LOOTQ.r308=LOOTQ.r308||[2,4];LOOTQ.m38=LOOTQ.m38||[4,8];}
  if(typeof LOJA!=='undefined'){LOJA[0].it.push({id:'m38',q:6,p:150},{id:'r308',q:3,p:260});LOJA[3].it.push({w:WI('rev38'),p:1100},{w:WI('cano'),p:1600},{w:WI('sniper'),p:4200});
    for(const e of LOJA[0].it)if(e.id&&VENDA[e.id]==null)VENDA[e.id]=Math.max(1,Math.floor(e.p/e.q*.5));}}catch(e){}

// ---------- 10) mais medo (inspirado em Darkwood) ----------
// a) visão em cone: o que está atrás do Richard fica no escuro. Liga/desliga nas Opções.
OPT.fov=true; try{const v=localStorage.getItem('ps-fov');if(v!=null)OPT.fov=v==='1';}catch(e){}
let FOVC=null;
function fovAtivo(){return OPT.fov&&G.mode==='play'&&!CUT.on&&!P.inCar&&!mpOn()&&!(typeof inSew==='function'&&false);}
function drawFov(){
  if(!fovAtivo())return; const z=view.z,W=view.w,H=view.h; if(!W||!H)return;
  if(!FOVC){FOVC=document.createElement('canvas');}
  if(FOVC.width!==Math.ceil(W)||FOVC.height!==Math.ceil(H)){FOVC.width=Math.ceil(W);FOVC.height=Math.ceil(H);}
  const g=FOVC.getContext('2d'); if(!g)return;
  const px=(P.x-cam.x)*z,py=(P.y-cam.y)*z,a=P.ang,R=Math.max(W,H)*1.3,near=74*z,half=P.lamp===false?.62:.8;
  g.globalCompositeOperation='source-over';g.clearRect(0,0,W,H);
  g.fillStyle=G.inB>=0?'rgba(6,7,9,.72)':'rgba(6,7,9,.6)';g.fillRect(0,0,W,H);
  g.globalCompositeOperation='destination-out';
  for(const [k,al] of [[1.18,.35],[1.08,.55],[1,1]]){g.globalAlpha=al;g.beginPath();g.moveTo(px,py);g.arc(px,py,R,a-half*k,a+half*k);g.closePath();g.fill();}
  g.globalAlpha=1;const rg=g.createRadialGradient(px,py,near*.4,px,py,near);rg.addColorStop(0,'rgba(0,0,0,1)');rg.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=rg;g.beginPath();g.arc(px,py,near,0,6.283);g.fill();
  g.globalCompositeOperation='source-over';
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.drawImage(FOVC,0,0,W,H);
}
{const dh=drawHUD; drawHUD=function(){try{drawFov();}catch(e){}return dh.apply(this,arguments);};}
{const op=UI.opts.bind(UI); UI.opts=function(from){const r=op(from);try{const box=OV.querySelector('.opts');if(box&&!box.querySelector('.fovbox')){const d=document.createElement('div');d.className='opt fovbox';
  d.innerHTML=`<h3>Visão</h3><div class="seg"><button data-a="fov110" class="${OPT.fov?'on':''}">Visão em cone ${OPT.fov?'ligada':'desligada'}</button></div><p class="hint">Ligada: o que está atrás de você fica no escuro. Mais medo. No online fica sempre desligada.</p>`;box.appendChild(d);}}catch(e){}return r;};}
{const ua=UI.act.bind(UI); UI.act=function(a,ds){if(a==='fov110'){OPT.fov=!OPT.fov;try{localStorage.setItem('ps-fov',OPT.fov?'1':'0');}catch(e){}return this.opts();}return ua(a,ds);};}
// b) falso morto: um corpo no chão levanta quando você passa do lado
// c) medo treme a mão e faz a lanterna falhar
// d) passos e respiração fora da tela, quando você está sozinho no escuro
{const vt=v16Tick; v16Tick=function(dt){vt(dt);if(G.mode!=='play'||CUT.on||!dt||mpOn()||fbOn())return;const F=G.flags,fear=G.fear||0;
  G.ev.fkT=(G.ev.fkT??20)-dt;
  if(G.ev.fkT<=0&&!capOn()&&F.armed&&!P.inCar&&!P.hidden&&!inSafe()){G.ev.fkT=.4;
    for(let i=GORE.length-1;i>=0;i--){const c=GORE[i];if(c.k!=='corpse'||c.fk||c.type==='soldado')continue;const d=hyp(c.x-P.x,c.y-P.y);if(d>70||d<20)continue;c.fk=1;
      if(Math.random()<.2){GORE.splice(i,1);const e=makeEnemy(c.type==='corr'?'corr':'zumbi',c.x,c.y,null);e.state='chase';e.lx=P.x;e.ly=P.y;e.rising=.45;e.hunt=true;enemies.push(e);
        AU.roar();G.shake+=6;G.fear=Math.max(fear,.75);buzz&&buzz([60,30,90]);G.ev.fkT=rr(45,80);
        if(!F.fkTip){F.fkTip=true;later(900,()=>bark('rafa','s','Ele... tava morto. Eu juro que tava morto.',{dur:2.2}));}break;}}}
  if(fear>.6&&!P.inCar&&!G.scope&&Math.random()<dt*(fear-.5)*.25){G.flick=Math.max(G.flick||0,rr(.06,.14));if(Math.random()<.08)AU.static(.15,.12);}
  G.ev.ofT=(G.ev.ofT??rr(30,50))-dt;
  if(G.ev.ofT<=0){G.ev.ofT=rr(35,70);if(!capOn()&&!inSafe()&&!G.pSafe&&(isNight()||G.inB>=0)&&!(G.comps&&G.comps.length)&&!enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<500)){
    const pan=-Math.cos(P.ang)*.7;AU.stepAt(pan,.55,0);AU.stepAt(pan,.5,.42);if(Math.random()<.4)AU.stepAt(-pan,.45,1.1);G.fear=Math.max(fear,.4);}}};}
{const fi=fire; fire=function(){const f=G.fear||0;if(f<=.5||mpOn())return fi.apply(this,arguments);const a=P.ang;P.ang+=rr(-1,1)*(f-.5)*.14;try{return fi.apply(this,arguments);}finally{P.ang=a;}};}

// ---------- 11) online: a pausa e o intervalo ----------
// O intervalo da Horda agora é intervalo de verdade: os zumbis da onda caem e não nasce mais nenhum até acabar.
{const ss=mpStageStart; mpStageStart=function(){const r=ss.apply(this,arguments);
  try{const s=mpStage(MP.stage);if(s&&s.pausa&&MP.role==='host'){MP.creditId='-';for(const e of enemies)if(e.alive&&e.mpw)killEnemy(e);MP.creditId=null;}}catch(e){}return r;};}
{const us=updSpawner; updSpawner=function(dt){if(mpOn()&&MP.role==='host'){try{const s=mpStage(MP.stage);if(s&&s.pausa)return;}catch(e){}}return us(dt);};}
{const hs=mpHostStage; mpHostStage=function(dt){try{const s=mpStage(MP.stage);if(s&&s.pausa){for(const e of enemies)if(e.alive&&e.mpw&&!e.t.boss){e.alive=false;}}}catch(e){}return hs(dt);};}
// quem não manda sinal há 15 s não conta como "jogando junto" (sozinho, a pausa pausa)
{const rv=mpRecv; mpRecv=function(m,p){try{if(p&&MP.players&&MP.players[p.id])MP.players[p.id]._t=Date.now();}catch(e){}return rv.apply(this,arguments);};}

// ---------- menu de teste ----------
if(typeof dbgExtra==='function')dbgExtra('1.10 · Armas, amigos e medo',[
  ['h110:armas','Pegar as 4 armas novas'],['h110:mun','Munição das armas novas'],['h110:fov','Visão em cone (liga/desliga)'],
  ['h110:morto','Falso morto do meu lado'],['h110:limpa','Limpar cinza e fumaça da tela'],['h110:aliados','Marlon e Nicolas aqui'],
  ['h110:uni','Ir pra guarita (revólver .38)'],['h110:brandt','Luta do Brandt agora']],function(k){
  const F=G.flags;
  switch(k){
    case 'h110:armas':for(const w of W110){const i=WI(w.id);P.owned[i]=true;if(!w.melee)P.mags[i]=w.mag;}this.close();toast('Rifle, cano duplo, machado e .38 na mão.');return;
    case 'h110:mun':invAdd('r308',20);invAdd('m38',36);invAdd('cart',12);this.close();toast('Munição nova na mochila.');return;
    case 'h110:fov':OPT.fov=!OPT.fov;try{localStorage.setItem('ps-fov',OPT.fov?'1':'0');}catch(e){}this.close();toast('Visão em cone '+(OPT.fov?'ligada':'desligada'));return;
    case 'h110:morto':{const a=P.ang+Math.PI/2;GORE.push({k:'corpse',x:P.x+Math.cos(a)*44,y:P.y+Math.sin(a)*44,rot:1,type:'zumbi',col:'#4f5a46',skin:'#8a9474',r:12});G.ev.fkT=0;F.armed=true;this.close();toast('Passa do lado do corpo.');return;}
    case 'h110:limpa':limparTela();this.close();toast('Tela limpa.');return;
    case 'h110:aliados':F.radio=true;G.wave=Math.min(G.wave||80,80);if(typeof allyArrive==='function'){G.ev.allyIn=false;allyArrive();for(const a of ALLY.list){a.x=P.x+rr(-90,90);a.y=P.y+rr(60,120);}}this.close();return;
    case 'h110:uni':if(LM.uniGuarita){P.x=LM.uniGuarita.x;P.y=LM.uniGuarita.y+50;snapCamera();}this.close();return;
    case 'h110:brandt':this.close();dbgJump('brandt');return;
  }},'nov');
