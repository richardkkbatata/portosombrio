// ===================== 1.8.1 · VOLUME DO SOM E DA MÚSICA · SANGUE NA TELA DOS AMIGOS =====================

// ---------- volume: efeitos e música separados, com barra ----------
const VOL={sfx:1,mus:1};
try{const v=JSON.parse(localStorage.getItem('ps-vol')||'{}');if(v&&typeof v==='object'){if(v.sfx!=null)VOL.sfx=clamp(+v.sfx,0,1);if(v.mus!=null)VOL.mus=clamp(+v.mus,0,1);}}catch(e){}
function volSave(){try{localStorage.setItem('ps-vol',JSON.stringify(VOL));}catch(e){}}
function volApply(){
  const c=AU.ctx; if(!c)return;
  // a música sai por um canal próprio (antes passava pelo volume dos efeitos)
  if(MUS.g&&!MUS.out){MUS.out=c.createGain();try{MUS.g.disconnect();}catch(e){}MUS.g.connect(MUS.out);MUS.out.connect(c.destination);}
  if(AU.master)AU.master.gain.setTargetAtTime(AU.on?.7*VOL.sfx:0,c.currentTime,.05);
  if(MUS.out)MUS.out.gain.setTargetAtTime(AU.on?.7*VOL.mus:0,c.currentTime,.05);
}
{const so=AU.setOn.bind(AU); AU.setOn=function(v){so(v);volApply();};}
{const mt=AU.musicTick; AU.musicTick=function(m){const had=!!MUS.g;const r=mt.call(this,m);if(!had&&MUS.g||(MUS.g&&!MUS.out))volApply();return r;};}
{const ini=AU.init.bind(AU); AU.init=function(){const had=!!this.ctx;const r=ini();if(!had&&this.ctx)volApply();return r;};}
function volHTML(){
  const bar=(k,n)=>`<label class="vol"><span>${n}</span><input type="range" min="0" max="100" step="5" value="${Math.round(VOL[k]*100)}" data-vol="${k}" aria-label="${n}"><b data-voln="${k}">${Math.round(VOL[k]*100)}%</b></label>`;
  return `<div class="opt volbox"><h3>Volume</h3>${bar('sfx','Efeitos')}${bar('mus','Música')}</div>`;
}
(function(){
  if(typeof OV==='undefined'||!OV.addEventListener)return;
  OV.addEventListener('input',e=>{const t=e.target;if(!t||!t.dataset||!t.dataset.vol)return;const k=t.dataset.vol;VOL[k]=clamp((+t.value||0)/100,0,1);volSave();
    if(!AU.on&&VOL[k]>0)AU.setOn(true); AU.init(); volApply();
    const n=OV.querySelector(`[data-voln="${k}"]`);if(n)n.textContent=Math.round(VOL[k]*100)+'%';
    if(k==='sfx'){clearTimeout(volHTML.t);volHTML.t=setTimeout(()=>{try{AU.click();}catch(x){}},120);}});
  // nas opções e na pausa
  const op=UI.opts.bind(UI); UI.opts=function(from){const r=op(from);try{const box=OV.querySelector('.opts');if(box&&!box.querySelector('.volbox')){const d=document.createElement('div');d.innerHTML=volHTML();box.insertBefore(d.firstChild,box.firstChild);}}catch(e){}return r;};
  const pz=UI.pause.bind(UI); UI.pause=function(){const r=pz();try{if(UI.cur==='pause'){const m=OV.querySelector('.menu');if(m&&!OV.querySelector('.volbox')){const d=document.createElement('div');d.innerHTML=volHTML();m.parentNode.insertBefore(d.firstChild,m.nextSibling);}}}catch(e){}return r;};
  try{const st=document.createElement('style');st.textContent=`.vol{display:grid;grid-template-columns:76px 1fr 46px;align-items:center;gap:10px;margin:6px 0}.vol span{font-weight:700}.vol b{text-align:right;color:var(--dim);font-size:13px}
    .vol input[type=range]{width:100%;accent-color:var(--amber);height:28px}.volbox{margin-top:10px}`;document.head.appendChild(st);}catch(e){}
})();

// ---------- sangue e corpos também na tela de quem não é o anfitrião ----------
{const he=hurtEnemy; hurtEnemy=function(e,d,kx,ky){
  // tiro "de mentira" (de outro jogador) acertando um zumbi: só o efeito
  if(MP.on&&MP.role==='guest'&&e&&e.ghost&&e.alive&&!(d>0)){e.flash=.1;bloodBurst(e.x,e.y,4,Math.atan2(ky||0,kx||1));return;}
  return he.apply(this,arguments);};}
{const ap=mpApplySnap; mpApplySnap=function(m){
  // o zumbi piscou no anfitrião = levou tiro: espirra sangue aqui também
  const before=new Map();for(const r of m.e||[]){const g=MP.ghosts.get(r[0]);if(g)before.set(r[0],g.flash>0);}
  const out=ap(m);
  for(const r of m.e||[]){if(!r[7])continue;const g=MP.ghosts.get(r[0]);if(g&&!before.get(r[0])&&(g._bt||0)<G.time-.12){g._bt=G.time;bloodBurst(g.x,g.y,3,Math.random()*6.283);}}
  return out;};}
{const gg=mpGhostGone; mpGhostGone=function(g,dead){const r=gg(g,dead);
  if(dead){bloodBurst(g.x,g.y,10,Math.random()*6.283);addDecal({k:'blood',x:g.x+rr(-6,6),y:g.y+rr(-6,6),r:g.r*rr(1.1,1.7),rot:Math.random()*6.28,seed:Math.random()});
    for(let i=0;i<2;i++)addDecal({k:'blood',x:g.x+rr(-26,26),y:g.y+rr(-26,26),r:rr(8,16),rot:Math.random()*6,seed:Math.random()});try{AU.hit&&AU.hit();}catch(e){}}
  return r;};}
