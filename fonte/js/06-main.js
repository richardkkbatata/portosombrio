// ===================== LAÇO PRINCIPAL =====================
const RM = (()=>{try{return matchMedia('(prefers-reduced-motion: reduce)').matches;}catch(e){return false;}})();
let attractT=0, lastFrame=0;
function attract(dt){
  attractT+=dt;
  const cx=tc(140)+Math.cos(attractT*.035)*560, cy=tc(280)+Math.sin(attractT*.03)*1700;
  cam.x=cx-view.w/view.z/2; cam.y=cy-view.h/view.z/2;
  updParts(dt);
}
// qualidade automática: se o aparelho não aguenta, baixa a resolução sozinho (só se o jogador não escolheu na mão)
const PERF={acc:0,n:0,t:0,cool:0,slow:0,fast:0};
function perfWatch(raw){
  if(G.mode!=='play'||CUT.on||raw>.25)return; PERF.acc+=raw;PERF.n++;PERF.t+=raw;PERF.cool-=raw;
  if(PERF.t<3)return; const avg=PERF.acc/PERF.n; PERF.acc=0;PERF.n=0;PERF.t=0;
  let manual=false;try{manual=localStorage.getItem('ps-gfx-manual')==='1';}catch(e){}
  if(manual||PERF.cool>0)return;
  const order=['alto','medio','baixo','minimo'],i=order.indexOf(QKEY);
  PERF.slow=avg>1/26?PERF.slow+1:0; PERF.fast=avg<1/50?PERF.fast+1:0;
  if(PERF.slow>=2&&i>=0&&i<order.length-1){PERF.slow=0;setQuality(order[i+1],true);PERF.cool=8;toast('Gráficos ajustados para rodar mais liso ('+QUAL[QKEY].n+').');}
  else if(PERF.fast>=4&&i>1){PERF.fast=0;setQuality(order[i-1],true);PERF.cool=12;}
}
function frame(t){
  const now=t/1000; let dt=lastFrame?now-lastFrame:.016; lastFrame=now; perfWatch(dt); dt=clamp(dt,0,.034);
  lastDt=dt; renderT+=dt;
  if(view.bz)view.z=view.bz*(G.mode==='play'||G.mode==='menu'?(G.zm||1)*(G.camF||1):1);
  if(G.hs>0&&G.mode==='play'){G.hs-=dt;dt*=.12;}
  if(G.mode!=='play'&&typeof v16Tick==='function')v16Tick(0);
  if(G.mode==='play')update(dt);
  else if(G.mode==='title')attract(dt);
  else if(G.mode==='dead'||G.mode==='win'){updParts(dt);G.shake=Math.max(0,(G.shake||0)-dt*30);}
  if(RM)G.shake=Math.min(G.shake||0,2);
  AU.mix(G.mode==='play'&&inSafe(),G.mode==='play'&&G.inB>=0);
  if(!(G.mode==='play'&&P.inCar))AU.engine(0);
  const tb=document.getElementById('tb-use'); if(tb)tb.classList.toggle('hot',(!!G.prompt||!!G.struggle)&&G.mode==='play');
  try{renderWorld();drawHUD();if(typeof drawPsy==='function')drawPsy();updTouchUI();}catch(err){console.error(err);}
  requestAnimationFrame(frame);
}
function boot(data){
  loadQuality(); loadOpts(); resize(); genWorld(); resetState('normal'); G.mode='title';
  bindTouchButtons(); layoutTouch();
  {const sk=document.getElementById('cutskip');if(sk&&sk.addEventListener){sk.addEventListener('click',e=>{e.stopPropagation();cutSkip();});sk.addEventListener('touchstart',e=>{e.stopPropagation();e.preventDefault();cutSkip();},{passive:false});}}
  try{if((navigator.maxTouchPoints>0||'ontouchstart' in window)&&matchMedia('(pointer: coarse)').matches)setTouchMode(true);}catch(e){}
  if(data&&data.save){
    try{loadState(data.save);G.mode='play';UI.close();document.getElementById('tc').hidden=!IN.touch;}
    catch(e){G.mode='title';UI.title();}
  } else UI.title();
  requestAnimationFrame(frame);
}
try{ if(window.claude&&window.claude.hot&&window.claude.hot.snapshot) window.claude.hot.snapshot(()=>({save:(G.mode==='play'||G.mode==='menu')?serialize():null})); }catch(e){}
(()=>{
  const hot=window.claude&&window.claude.hot;
  if(hot&&hot.ready)hot.ready(boot); else boot((hot&&hot.data)||{});
})();
