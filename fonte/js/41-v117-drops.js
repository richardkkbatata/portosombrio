// ===================== 1.17 · O JOGO SABE DO QUE VOCÊ PRECISA (DROPS QUE OLHAM A MALETA) =====================
// - Drops inteligentes: quando um inimigo morre, o jogo olha a sua maleta. Munição só das armas que você
//   tem, e mais da que está acabando; cura se a vida está baixa e você não tem com o que curar; pilha se
//   a lanterna está morrendo. Se você está bem servido de tudo, não cai nada.
// - Nas lutas de chefe, se você está apertado, de tempos em tempos aparece suprimento perto de você
//   (em Camboriú quem joga é o Sargento Valença ou o Nicolas). Se você está bem, não aparece nada.
// - Caixas de madeira espalhadas pela cidade: quebre com E (ou USAR). Dentro, o mesmo cálculo.
// - Item que caiu brilha no chão e some depois de um tempo se ninguém pegar.
// No online (multiplayer) os drops continuam como eram, para não descasar anfitrião e convidado.

const DROP_AMMO={m9:[6,10],cart:[3,5],m357:[2,4],virote:[2,3],comb:[20,35],g40:[1,2],r308:[2,3],m38:[4,6]};
const DROP_HEAL=['ervaV','ervaR','misVV','misVR','spray'];
function dropHealPool(){let n=0;for(const id of DROP_HEAL)if(ITEMS[id])n+=invCount(id)*Math.min(100,ITEMS[id].h||30);return n;}
// o que falta, com peso (quanto maior, mais você precisa)
function dropNeeds(){
  const out=[], seen={};
  for(let i=0;i<WEAPONS.length;i++){const w=WEAPONS[i];if(!P.owned[i]||w.melee||!w.ammo||!DROP_AMMO[w.ammo])continue;
    const have=invCount(w.ammo)+(P.mags[i]||0), want=Math.max(4,w.mag*2), lack=clamp(1-have/want,0,1);
    if(lack<=0)continue; const wt=lack*(i===P.w?1.35:1)*(w.id==='pistola'?1.1:1);
    if(!seen[w.ammo]||seen[w.ammo].w<wt){seen[w.ammo]={id:w.ammo,w:wt};}}
  for(const k in seen)out.push(seen[k]);
  const hpF=P.hp/P.max, pool=dropHealPool();
  if(hpF<.6&&pool<70){let w=(.6-hpF)*2.2+(pool<30?.5:0);out.push({id:hpF<.25&&pool===0&&Math.random()<.35?'spray':'ervaV',w});}
  if(P.bat<25&&invCount('pilha')<=0)out.push({id:'pilha',w:.7});
  if(dropBoss()&&invCount('gran')<=0&&Math.random()<.5)out.push({id:'gran',w:.35});
  return out;
}
function dropNeedSum(L){return clamp((L||dropNeeds()).reduce((a,n)=>a+n.w,0),0,2.4);}
function dropPick(L){let s=L.reduce((a,n)=>a+n.w,0)*Math.random();for(const n of L){s-=n.w;if(s<=0)return n.id;}return L[L.length-1].id;}
function dropQty(id){const r=DROP_AMMO[id];if(r)return ri(r[0],r[1]);return 1;}
function dropBoss(){return enemies.find(e=>e.alive&&e.t&&e.t.boss&&e.type!=='ouvinte'&&e.type!=='carniceiro'&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<1100);}
function dropLootMul(){return (G.D&&G.D.loot)||1;}
// cai um item "do jogo" no chão (brilha e some se ninguém pegar)
function dropSpawn(x,y,id,q,o={}){
  const p=dropAt(x,y,id,q); p.dyn=G.time; p.life=o.life||75;
  if(o.say)floaters.push({x:p.x,y:p.y-18,t:o.say,life:1.2});
  return p;
}
// a decisão quando alguém morre
function dropRoll(e,o={}){
  const L=dropNeeds(), N=dropNeedSum(L), act=typeof gameAct==='function'?gameAct():2, big=e&&(e.max>=200||e.type==='brut');
  let ch=(o.base!=null?o.base:[.04,.06,.08][act-1])+N*(o.k||.2);
  if(big)ch+=.15; ch*=dropLootMul(); ch=Math.min(o.max||.6,ch);
  if(!L.length||N<.12){   // bem servido: às vezes um troco, nunca munição de graça
    return null;}
  if(Math.random()>ch)return null;
  const id=dropPick(L); return dropSpawn(e.x+rr(-6,6),e.y+rr(-6,6),id,dropQty(id));
}
// o drop aleatório antigo sai (no solo); no online ele continua igual
{const di=dropItem; dropItem=function(x,y){if(typeof MP!=='undefined'&&MP.on)return di.apply(this,arguments);};}
{const ke=killEnemy; killEnemy=function(e,...a){
  const was=e&&e.alive; const r=ke.call(this,e,...a);
  try{if(was&&e&&!e.alive&&!(typeof MP!=='undefined'&&MP.on)&&!e.cut&&!e.t.boss&&e.type!=='boss'&&e.type!=='manequim'&&!e.victim&&!e.cbProc&&!e.stalker)dropRoll(e);}catch(err){console.error(err);}
  return r;};}

// ---------- suprimento nas lutas de chefe ----------
const DSUP={t:12,said:0};
function dropSupplyTick(dt){
  if(typeof MP!=='undefined'&&MP.on)return;
  const b=dropBoss(); if(!b||CUT.on){DSUP.t=Math.max(DSUP.t,10);return;}
  DSUP.t-=dt; if(DSUP.t>0)return;
  const L=dropNeeds(), N=dropNeedSum(L);
  DSUP.t=N>1.2?rr(14,20):N>.6?rr(20,28):rr(26,34);
  if(N<.45||!L.length)return;
  // longe do chefe, perto de você, num lugar que dá pra pegar
  let spot=null;
  for(let i=0;i<40&&!spot;i++){const a=Math.atan2(P.y-b.y,P.x-b.x)+rr(-1.4,1.4),d=rr(110,230),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;
    if(!inb(tx,ty))continue;const k=idx(tx,ty);if(SOLID[map[k]]||!reach[k]||pickOcc.has(k))continue;if(!los(P.x,P.y,tc(tx),tc(ty)))continue;spot={x:tc(tx),y:tc(ty)};}
  if(!spot)return;
  const n=N>1.2?2:1;
  for(let i=0;i<n;i++){const id=dropPick(L);dropSpawn(spot.x+i*28,spot.y,id,dropQty(id)+(DROP_AMMO[id]?1:0),{life:60,say:i?null:'SUPRIMENTO'});}
  AU.pickup&&AU.pickup();
  const cb=typeof cb2Fight==='function'&&cb2Fight();
  if(cb&&typeof CB2!=='undefined'&&CB2.val)bark('valenca','a',pick2(['Munição! Joguei do teu lado, garoto!','Pega! Tá no chão perto de ti!','Toma, eu tenho mais que tu!']),{dur:1.8});
  else if(cb)bark('nico','a','Larguei munição do drone perto de ti! Pega!',{radio:true,dur:1.8});
  else if(DSUP.said<2){DSUP.said++;toast('Tem suprimento no chão perto de você.');}
}

// ---------- caixas de madeira ----------
const CRATES=[];
function crateGen(){
  CRATES.length=0; const old=rnd; rnd=mulberry32(11717);
  const ok=(x,y)=>{if(!inb(x,y)||y>=H-1)return false;const k=idx(x,y);if(SOLID[map[k]]||!reach[k]||pickOcc.has(k)||safeMask[k])return false;const t=map[k];if(t===T.ROAD)return false;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){if(!i&&!j)continue;const t2=getT(x+i,y+j);if(t2===T.PROP||t2===T.GATE||t2===T.SHUTTER)return false;}
    let wall=0,free=0;for(const [dx,dy] of DIRS4){const t2=getT(x+dx,y+dy);if(t2===T.WALL)wall++;else if(!SOLID[t2])free++;}
    if(wall!==1||free<3)return false;
    if(interacts.some(o=>Math.abs(o.tx-x)+Math.abs(o.ty-y)<3)||npcs.some(n=>hyp(n.x-tc(x),n.y-tc(y))<90))return false;
    return true;};
  for(let t=0;t<9000&&CRATES.length<48;t++){const x=1+((R()*(W-2))|0),y=1+((R()*(H-2))|0);if(!ok(x,y))continue;
    if(CRATES.some(c=>Math.abs(c.tx-x)+Math.abs(c.ty-y)<26))continue;crateAdd(x,y,'cx'+CRATES.length);}
  rnd=old;
}
function crateAdd(x,y,id){prop(x,y,4);const it={tx:x,ty:y,x:tc(x),y:tc(y),type:'caixa',crate:id};interacts.push(it);CRATES.push({id,tx:x,ty:y,it});if(typeof invalidateRect==='function')invalidateRect(x,y,1,1);return it;}
function crateBreak(c,quiet){
  const k=idx(c.tx,c.ty); const u=under[k]&&!SOLID[under[k]]?under[k]:T.SIDE; setT(c.tx,c.ty,u); if(typeof invalidateRect==='function')invalidateRect(c.tx,c.ty,1,1);
  const i=interacts.indexOf(c.it);if(i>=0)interacts.splice(i,1); const j=CRATES.indexOf(c);if(j>=0)CRATES.splice(j,1);
  if(quiet)return;
  (G.flags.cx||(G.flags.cx=[])).push(c.id);
  for(let n=0;n<14;n++)parts.push({k:'debris',x:tc(c.tx),y:tc(c.ty),vx:rr(-140,140),vy:rr(-140,140),life:.5,max:.5,s:rr(2,4),c:Math.random()<.5?'#6b5433':'#4a3a22'});
  AU.thud&&AU.thud(.6); AU.swish&&AU.swish(); P.slash=.16; alertNoise(P.x,P.y,160);
  const fake={x:tc(c.tx),y:tc(c.ty),max:0,type:'caixa'};
  const p=dropRoll(fake,{base:.25,k:.32,max:.85,rich:.25});
  if(!p)toast(pick2(['Vazia.','Só farpa e jornal velho.','Nada aqui.']));
}
Object.assign(INT_LABEL,{caixa:'Quebrar a caixa'});
{const vi=v12Interact; v12Interact=function(o){if(o&&o.type==='caixa'){const c=CRATES.find(x=>x.it===o);if(c)crateBreak(c);return;}return vi(o);};}
{const g=genV12; genV12=function(){g();try{crateGen();}catch(e){console.error('caixas',e);}};}
{const aws=applyWorldState; applyWorldState=function(){aws();const L=G.flags.cx||[];for(const id of L){const c=CRATES.find(x=>x.id===id);if(c)crateBreak(c,true);}
  for(let i=interacts.length-1;i>=0;i--)if(interacts[i].type==='caixa'&&!CRATES.some(c=>c.it===interacts[i]))interacts.splice(i,1);
  DSUP.t=12;DSUP.said=0;};}
// caixas extras perto do chefe quando a luta começa (uma vez por chefe)
function crateBossTick(){
  const b=dropBoss(); if(!b||b.crates||CUT.on)return; b.crates=1;
  let n=0;for(let i=0;i<60&&n<3;i++){const a=Math.random()*6.283,d=rr(220,420),x=b.x+Math.cos(a)*d,y=b.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;
    if(!inb(tx,ty))continue;const k=idx(tx,ty);if(SOLID[map[k]]||!reach[k]||pickOcc.has(k)||map[k]===T.ROAD&&Math.random()<.5)continue;
    let free=0;for(const [dx,dy] of DIRS4)if(!SOLID[getT(tx+dx,ty+dy)])free++;if(free<4)continue;
    crateAdd(tx,ty,'cxb'+G.time.toFixed(2)+n);n++;}
}

// ---------- brilho no chão, sumir depois de um tempo ----------
{const vt=v16Tick; v16Tick=function(dt){vt(dt);if(G.mode!=='play')return;
  try{dropSupplyTick(dt);crateBossTick();}catch(e){console.error(e);}
  if(((G.time*4)|0)%4===0){for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];if(p.dyn==null)continue;if(G.time-p.dyn>p.life&&hyp(p.x-P.x,p.y-P.y)>260){pickOcc.delete(idx(p.tx,p.ty));pickups.splice(i,1);}}}};}
function dropDrawGlint(){
  for(const p of pickups){if(p.dyn==null)continue;const x=p.x,y=p.y;if(x<cam.x-40||y<cam.y-40||x>cam.x+view.w/view.z+40||y>cam.y+view.h/view.z+40)continue;
    const left=p.life-(G.time-p.dyn), blink=left<10?(((renderT*6)|0)%2):1; if(!blink)continue;
    const k=.5+.5*Math.sin(renderT*5+p.x);ctx.save();ctx.globalCompositeOperation='lighter';
    const g=ctx.createRadialGradient(x,y,1,x,y,18);g.addColorStop(0,`rgba(255,230,160,${.35+.25*k})`);g.addColorStop(1,'rgba(255,200,120,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,18,0,6.283);ctx.fill();
    ctx.strokeStyle=`rgba(255,240,200,${.4+.4*k})`;ctx.lineWidth=1.2;const s=5+k*3;ctx.beginPath();ctx.moveTo(x-s,y-12);ctx.lineTo(x+s,y-12);ctx.moveTo(x,y-12-s);ctx.lineTo(x,y-12+s);ctx.stroke();ctx.restore();}
}
{const dp=drawParts; drawParts=function(){dp();try{dropDrawGlint();}catch(e){}};}

// ---------- menu de teste ----------
dbgExtra('1.17 · Drops e caixas',[['drop:vazio','Ficar sem munição e com pouca vida (testar drops)'],['drop:cheio','Encher munição e cura (não deve cair nada)'],['drop:ver','Mostrar o que o jogo acha que você precisa'],['drop:caixa','Pôr uma caixa na sua frente'],['drop:sup','Suprimento de chefe agora']],function(k){
  const close=()=>{if(UI.close)UI.close();G.mode='play';};
  if(k==='drop:vazio'){for(let i=0;i<WEAPONS.length;i++)if(P.owned[i]&&WEAPONS[i].ammo){P.mags[i]=0;const a=WEAPONS[i].ammo;invRemove(a,invCount(a));}for(const id of DROP_HEAL)invRemove(id,invCount(id));P.hp=Math.round(P.max*.2);close();return toast('Sem munição e com 20% de vida.');}
  if(k==='drop:cheio'){for(let i=0;i<WEAPONS.length;i++)if(P.owned[i]&&WEAPONS[i].ammo){const w=WEAPONS[i];P.mags[i]=w.mag;const l=invAdd(w.ammo,w.mag*3);if(l)boxAdd(w.ammo,l);}invAdd('misVV',2);P.hp=P.max;close();return toast('Maleta cheia.');}
  if(k==='drop:ver'){const L=dropNeeds();close();return toast(L.length?'Precisa: '+L.map(n=>ITEMS[n.id].n+' ('+n.w.toFixed(2)+')').join(', '):'Você está bem servido: quase nada vai cair.');}
  if(k==='drop:caixa'){close();const x=((P.x+Math.cos(P.ang)*40)/TILE)|0,y=((P.y+Math.sin(P.ang)*40)/TILE)|0;if(SOLID[getT(x,y)])return toast('Sem espaço.');return crateAdd(x,y,'cxd'+G.time.toFixed(2));}
  if(k==='drop:sup'){close();DSUP.t=0;return toast(dropBoss()?'Suprimento chegando (se você precisar).':'Só funciona perto de um chefe.');}
});

// ---------- chute no tonto (estilo survival horror clássico): inimigo atordoado perto de você leva um chute ----------
Object.assign(INT_LABEL,{chute:'Chutar'});
function chuteAlvo(){
  if(P.inCar||P.hidden||CUT.on||G.mode!=='play'||(typeof MP!=='undefined'&&MP.on&&MP.role==='guest'))return null;
  let best=null,bd=56;
  for(const e of enemies){if(!e.alive||e.cut||!(e.stun>.05)||e.t.boss||e.type==='boss'||e.stalker||e.type==='manequim'||e.type==='ouvinte')continue;
    const d=hyp(e.x-P.x,e.y-P.y);if(d<bd&&los(P.x,P.y,e.x,e.y)){bd=d;best=e;}}
  return best;
}
function chute(e){
  if(!e||!e.alive)return;
  const a=Math.atan2(e.y-P.y,e.x-P.x); P.ang=a; P.slash=.2; G.shake+=4; AU.thud&&AU.thud(.9); AU.hit&&AU.hit(); buzz&&buzz(40);
  if(P.st<15){toast('Sem fôlego pra chutar.');return;}
  P.st=Math.max(0,P.st-15);
  for(const o of enemies){if(!o.alive||o.cut||o.t.boss||o.stalker)continue;const d=hyp(o.x-e.x,o.y-e.y);if(o!==e&&d>70)continue;
    const b=Math.atan2(o.y-P.y,o.x-P.x),big=o.type==='brut'||o.max>=200;hurtEnemy(o,o===e?(big?45:70):30,Math.cos(b)*(big?120:520),Math.sin(b)*(big?120:520),{});if(o.alive)o.stun=Math.max(o.stun||0,big?.6:1.3);}
  floaters.push({x:e.x,y:e.y-e.r-8,t:'CHUTE',life:.7});
  alertNoise(P.x,P.y,200);
  if(!G.flags.chuteTip){G.flags.chuteTip=true;toast('Inimigo atordoado (depois de um golpe ou tiro forte): chegue perto e chute. Derruba quem estiver do lado também.');}
}
{const fi=findInteract; findInteract=function(){const r=fi();try{if(r&&r.k==='int'&&r.o&&(r.o.type==='cbExec'))return r;const e=chuteAlvo();if(e)return {k:'int',o:{type:'chute',e,x:e.x,y:e.y,tx:(e.x/TILE)|0,ty:(e.y/TILE)|0}};}catch(err){}return r;};}
{const vi=v12Interact; v12Interact=function(o){if(o&&o.type==='chute')return chute(o.e);return vi(o);};}
// tiro de escopeta de perto e tiro crítico também deixam tonto (um instante), pra dar chance do chute
{const he=hurtEnemy; hurtEnemy=function(e,dmg,kx,ky,o){const r=he.apply(this,arguments);
  try{if(e&&e.alive&&!e.t.boss&&!e.stalker&&e.type!=='boss'&&!(o&&o.ally)){const w=WEAPONS[P.w];const close=hyp(e.x-P.x,e.y-P.y)<120;
    if(w&&(w.id==='escopeta'||w.id==='cano')&&close&&Math.random()<.35)e.stun=Math.max(e.stun||0,.9);
    if(e.headshot&&Math.random()<.5)e.stun=Math.max(e.stun||0,.8);}}catch(err){}
  return r;};}
