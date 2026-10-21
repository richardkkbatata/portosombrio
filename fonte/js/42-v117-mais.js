// ===================== 1.17 · CHUTE ANIMADO E COISINHAS NOVAS =====================
// - Chute com animação: o Richard dá um passo, a perna estica, rastro no ar, impacto com poeira e uma
//   paradinha de meio quadro (hit-stop) quando acerta.
// - Botijões de gás espalhados pela cidade (e alguns perto dos chefes): um tiro e eles explodem,
//   levando quem estiver perto. Corrente: um botijão explode o outro.
// - Ao pegar munição/cura aparece "+6 9mm" em cima do Richard.
// - "ÚLTIMO PENTE" quando você recarrega a última munição da arma.

// ---------- o chute animado ----------
{const ch=chute; chute=function(e){
  if(e&&e.alive&&P.st>=15){const a=Math.atan2(e.y-P.y,e.x-P.x);P.kick={t:0,dur:.34,a,ex:e.x,ey:e.y,hit:false};
    // um passinho pra frente
    move(P,Math.cos(a)*8,Math.sin(a)*8,false);}
  const r=ch.apply(this,arguments);
  if(P.kick&&!P.kick.hit){P.kick.hit=true;G.hs=Math.max(G.hs||0,.07);
    for(let i=0;i<16;i++){const b=P.kick.a+rr(-.9,.9),s=rr(60,220);parts.push({k:'debris',x:P.kick.ex,y:P.kick.ey,vx:Math.cos(b)*s,vy:Math.sin(b)*s,life:.45,max:.45,s:rr(1.5,3),c:Math.random()<.5?'#b8ae98':'#6a6456'});}
    for(let i=0;i<8;i++)parts.push({k:'spark',x:P.kick.ex,y:P.kick.ey,vx:rr(-120,120),vy:rr(-120,120),life:.18,max:.18,s:2,c:'#f0e8d0'});}
  return r;};}
{const vt=v16Tick; v16Tick=function(dt){vt(dt);if(P.kick){P.kick.t+=dt;if(P.kick.t>=P.kick.dur)P.kick=null;}};}
function kickDraw(){
  const K=P.kick; if(!K||P.inCar||P.hidden)return;
  const u=K.t/K.dur, ext=Math.sin(Math.min(1,u*1.6)*Math.PI)*22, a=K.a;
  ctx.save();ctx.translate(P.x,P.y);ctx.rotate(a);
  // rastro do pé
  if(u<.7){ctx.strokeStyle=`rgba(240,232,208,${.45*(1-u/.7)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,20+ext*.6,-.9,.5);ctx.stroke();
    ctx.strokeStyle=`rgba(240,232,208,${.25*(1-u/.7)})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,26+ext*.7,-.7,.4);ctx.stroke();}
  // a perna: coxa e canela esticando pra frente, o tênis na ponta
  const pc=(P.lookO&&P.lookO.pants)||'#24262c';
  ctx.strokeStyle=pc;ctx.lineCap='round';ctx.lineWidth=6.5;ctx.beginPath();ctx.moveTo(-2,4);ctx.lineTo(6+ext*.45,4.5);ctx.lineTo(10+ext,3);ctx.stroke();
  ctx.fillStyle='#e8e4da';ctx.beginPath();ctx.ellipse(13+ext,3,5,3.4,0,0,6.283);ctx.fill();ctx.fillStyle='#2a2a2e';ctx.fillRect(10+ext,4.2,7,1.4);
  // impacto
  if(u>.25&&u<.6){const k=(u-.25)/.35;ctx.strokeStyle=`rgba(255,250,235,${1-k})`;ctx.lineWidth=2;for(let i=0;i<6;i++){const b=i/6*6.283;ctx.beginPath();ctx.moveTo(18+ext+Math.cos(b)*(4+k*6),3+Math.sin(b)*(4+k*6));ctx.lineTo(18+ext+Math.cos(b)*(9+k*12),3+Math.sin(b)*(9+k*12));ctx.stroke();}}
  ctx.restore();
}
{const dpl=drawPlayer; drawPlayer=function(){const r=dpl.apply(this,arguments);try{kickDraw();}catch(e){}return r;};}

// ---------- botijões de gás ----------
const BOTIJ=[];
function botijAdd(x,y,id){prop(x,y,31);const b={id,tx:x,ty:y,x:tc(x),y:tc(y),hp:1,f:0};BOTIJ.push(b);if(typeof invalidateRect==='function')invalidateRect(x,y,1,1);return b;}
function botijGen(){
  BOTIJ.length=0; const old=rnd; rnd=mulberry32(11718);
  const ok=(x,y)=>{if(!inb(x,y)||y>=H-1)return false;const k=idx(x,y);if(SOLID[map[k]]||!reach[k]||pickOcc.has(k)||safeMask[k]||bmap[k]>=0)return false;
    if(map[k]===T.ROAD)return false;let wall=0,free=0;for(const [dx,dy] of DIRS4){const t=getT(x+dx,y+dy);if(t===T.WALL)wall++;else if(!SOLID[t])free++;}
    if(wall<1||free<3)return false;
    for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const t=getT(x+i,y+j);if((i||j)&&(t===T.PROP||t===T.GATE))return false;}
    if(interacts.some(o=>Math.abs(o.tx-x)+Math.abs(o.ty-y)<3)||npcs.some(n=>hyp(n.x-tc(x),n.y-tc(y))<120))return false;
    // longe do começo do jogo
    if(typeof START!=='undefined'&&hyp(tc(x)-START.x,tc(y)-START.y)<600)return false;
    return true;};
  for(let t=0;t<9000&&BOTIJ.length<30;t++){const x=1+((R()*(W-2))|0),y=1+((R()*(H-2))|0);if(!ok(x,y))continue;if(BOTIJ.some(b=>Math.abs(b.tx-x)+Math.abs(b.ty-y)<22))continue;botijAdd(x,y,'bj'+BOTIJ.length);}
  rnd=old;
}
function botijBoom(b,quiet){
  const i=BOTIJ.indexOf(b); if(i<0)return; BOTIJ.splice(i,1);
  const k=idx(b.tx,b.ty); setT(b.tx,b.ty,under[k]&&!SOLID[under[k]]?under[k]:T.SIDE); if(typeof invalidateRect==='function')invalidateRect(b.tx,b.ty,1,1);
  if(quiet)return;
  (G.flags.bx||(G.flags.bx=[])).push(b.id);
  if(typeof explodeFx==='function')explodeFx(b.x,b.y,1.1);
  AU.boom&&AU.boom(.8); G.shake+=9; buzz&&buzz(90);
  explode(b.x,b.y,120,170);
  GORE.push({k:'scorch',x:b.x,y:b.y,r:52,rot:0,seed:Math.random()});
  alertNoise(b.x,b.y,720);
  // corrente
  for(const o of BOTIJ.slice())if(hyp(o.x-b.x,o.y-b.y)<150)later(220,()=>botijBoom(o));
  if(!G.flags.bjTip){G.flags.bjTip=true;later(600,()=>toast('Botijão de gás: um tiro e ele explode. Atraia eles pra perto antes.'));}
}
function botijTick(dt){
  if(!BOTIJ.length)return;
  for(const p of projs){if(p.dead||(p.k!=='b'&&p.k!=='f'))continue;for(const b of BOTIJ){if(Math.abs(p.x-b.x)>16||Math.abs(p.y-b.y)>16)continue;
    if(p.k==='f'){b.f+=dt;if(b.f<.6)continue;}p.dead=true;b.hp=0;break;}}
  for(const b of BOTIJ.slice())if(b.hp<=0)botijBoom(b);
}
// explosão de granada/foguete perto também detona
{const ex=explode; explode=function(x,y,r,dmg){const out=ex.apply(this,arguments);for(const b of BOTIJ)if(b.hp>0&&hyp(b.x-x,b.y-y)<r*.9){b.hp=0;}return out;};}
function botijDraw(){
  for(const b of BOTIJ){if(b.x<cam.x-40||b.y<cam.y-40||b.x>cam.x+view.w/view.z+40||b.y>cam.y+view.h/view.z+40)continue;
    ctx.save();ctx.translate(b.x,b.y);
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(3,4,11,9,0,0,6.283);ctx.fill();
    ctx.fillStyle='#b8302a';ctx.beginPath();ctx.arc(0,0,10,0,6.283);ctx.fill();
    ctx.strokeStyle='#7a1a16';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,7,0,6.283);ctx.stroke();
    ctx.fillStyle='#8a8a86';ctx.fillRect(-3,-3,6,6);ctx.fillStyle='#d8d4c8';ctx.fillRect(-1.5,-1.5,3,3);
    ctx.fillStyle='rgba(255,255,255,.25)';ctx.beginPath();ctx.arc(-4,-4,3,0,6.283);ctx.fill();
    ctx.restore();}
}
{const dp=drawParts; drawParts=function(){dp();try{botijDraw();}catch(e){}};}
{const g=genV12; genV12=function(){g();try{botijGen();}catch(e){console.error('botijões',e);}};}
{const aws=applyWorldState; applyWorldState=function(){aws();for(const id of (G.flags.bx||[])){const b=BOTIJ.find(x=>x.id===id);if(b)botijBoom(b,true);}};}
{const vt=v16Tick; v16Tick=function(dt){vt(dt);if(G.mode==='play')try{botijTick(dt);}catch(e){console.error(e);}};}
// dois botijões perto do chefe quando a luta começa
{const cbt=crateBossTick; crateBossTick=function(){const b=dropBoss();const first=b&&!b.crates&&!CUT.on;cbt();
  if(first){let n=0;for(let i=0;i<60&&n<2;i++){const a=Math.random()*6.283,d=rr(200,380),x=b.x+Math.cos(a)*d,y=b.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;
    if(!inb(tx,ty))continue;const k=idx(tx,ty);if(SOLID[map[k]]||!reach[k]||pickOcc.has(k))continue;let free=0;for(const [dx,dy] of DIRS4)if(!SOLID[getT(tx+dx,ty+dy)])free++;if(free<4)continue;
    if(hyp(tc(tx)-P.x,tc(ty)-P.y)<150)continue;botijAdd(tx,ty,'bjb'+G.time.toFixed(2)+n);n++;}}};}

// ---------- "+6 9mm" ao pegar ----------
{const tp=takePickup; takePickup=function(p){
  const id=p&&p.kind==='item'?p.id:null, before=id&&ITEMS[id]?invCount(id):0;
  const r=tp.apply(this,arguments);
  try{if(id&&ITEMS[id]&&id!=='grana'){const got=invCount(id)-before;if(got>0)floaters.push({x:P.x,y:P.y-26,t:'+'+got+' '+(ITEMS[id].s||ITEMS[id].n),life:1});}}catch(e){}
  return r;};}
// ---------- "ÚLTIMO PENTE" ----------
{const rl=reload; reload=function(){const w=WEAPONS[P.w],had=w&&w.ammo?invCount(w.ammo):0;const r=rl.apply(this,arguments);
  try{if(w&&w.ammo&&had>0&&invCount(w.ammo)===0&&!DBG.ammo)later(450,()=>{floaters.push({x:P.x,y:P.y-28,t:'ÚLTIMO PENTE',life:1.4});AU.click&&AU.click();});}catch(e){}
  return r;};}

dbgExtra('1.17 · Botijões',[['bj:frente','Pôr um botijão na sua frente'],['bj:todos','Mostrar quantos botijões tem no mapa']],function(k){
  const close=()=>{if(UI.close)UI.close();G.mode='play';};
  if(k==='bj:frente'){close();const x=((P.x+Math.cos(P.ang)*96)/TILE)|0,y=((P.y+Math.sin(P.ang)*96)/TILE)|0;if(SOLID[getT(x,y)])return toast('Sem espaço.');return botijAdd(x,y,'bjd'+G.time.toFixed(2));}
  if(k==='bj:todos'){close();return toast(BOTIJ.length+' botijões no mapa.');}
});
