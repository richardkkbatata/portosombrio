// ===================== 1.6.1 · MALETA: SEGURAR E ARRASTAR =====================
// Segure um item da maleta e arraste. Verde = cabe, vermelho = não cabe. R, roda do mouse ou um segundo dedo gira.
(function(){
  let D=null, supp=false;
  // a grade de verdade começa na primeira casinha (a maleta tem borda e respiro em volta)
  const geom=m=>{const mw=G.mw||8,mh=G.mh||6,bg=m.querySelectorAll('.mbg'),a=bg[0].getBoundingClientRect(),z=bg[bg.length-1].getBoundingClientRect(),M=m.getBoundingClientRect();
    return {r:{left:a.left,top:a.top},cw:(z.right-a.left)/mw,ch:(z.bottom-a.top)/mh,ox:a.left-M.left-m.clientLeft,oy:a.top-M.top-m.clientTop};};
  const base=k=>k[0]==='w'?WSZ[+k.slice(1)]:isz((G.inv.find(s=>s&&'i'+s.u===k)||{}).id);
  function start(){
    if(!D||D.on)return; D.on=true; const g=geom(D.m);
    D.gh=D.c.cloneNode(true); Object.assign(D.gh.style,{position:'fixed',zIndex:99,pointerEvents:'none',opacity:.9,margin:0,width:D.w*g.cw+'px',height:D.h*g.ch+'px',boxShadow:'0 8px 24px rgba(0,0,0,.6)'});
    document.body.appendChild(D.gh); D.fp=document.createElement('div'); D.fp.className='mfp'; D.m.appendChild(D.fp);
    D.c.style.opacity=.25; try{navigator.vibrate&&navigator.vibrate(12);}catch(e){} AU.click(); move();
  }
  function move(){
    if(!D||!D.on)return; const g=geom(D.m);
    const gx=D.lx-D.px*D.w*g.cw, gy=D.ly-D.py*D.h*g.ch;
    D.gh.style.left=gx+'px'; D.gh.style.top=gy+'px'; D.gh.style.width=D.w*g.cw+'px'; D.gh.style.height=D.h*g.ch+'px';
    D.tx=Math.round((gx-g.r.left)/g.cw); D.ty=Math.round((gy-g.r.top)/g.ch);
    D.ok=mFree(mGrid(D.k),D.tx,D.ty,D.w,D.h);
    Object.assign(D.fp.style,{left:g.ox+D.tx*g.cw+'px',top:g.oy+D.ty*g.ch+'px',width:D.w*g.cw+'px',height:D.h*g.ch+'px'}); D.fp.classList.toggle('bad',!D.ok);
  }
  function rotate(){if(!D||!D.on)return;const b=base(D.k);if(!b||b[0]===b[1])return;[D.w,D.h]=[D.h,D.w];[D.px,D.py]=[D.py,D.px];AU.click();move();}
  function end(drop){
    if(!D)return; clearTimeout(D.t); const d=D; D=null;
    if(!d.on)return; supp=true; setTimeout(()=>supp=false,60);
    d.gh.remove(); d.fp.remove();
    if(drop&&d.ok){G.mpos[d.k]={x:d.tx,y:d.ty,w:d.w,h:d.h};AU.click();} else if(drop){AU.locked();toast('Não cabe aí.');}
    UI.inv('itens');
  }
  OV.addEventListener('pointerdown',e=>{
    if(D&&D.on&&e.pointerId!==D.id){rotate();e.preventDefault();return;}
    const c=e.target.closest&&e.target.closest('.maleta .mcell[data-mk]'); if(!c||UI.cur!=='inv'||e.button>0)return;
    const k=c.dataset.mk,p=G.mpos[k]; if(!p)return; const r=c.getBoundingClientRect();
    D={k,c,m:c.parentNode,id:e.pointerId,sx:e.clientX,sy:e.clientY,lx:e.clientX,ly:e.clientY,w:p.w,h:p.h,px:clamp((e.clientX-r.left)/r.width,0,.99),py:clamp((e.clientY-r.top)/r.height,0,.99),on:false};
    D.t=setTimeout(start,200);
  });
  document.addEventListener('pointermove',e=>{if(!D||e.pointerId!==D.id)return;D.lx=e.clientX;D.ly=e.clientY;if(!D.on&&hyp(D.lx-D.sx,D.ly-D.sy)>8)start();if(D.on){move();e.preventDefault();}},{passive:false});
  document.addEventListener('pointerup',e=>{if(D&&e.pointerId===D.id)end(true);});
  document.addEventListener('pointercancel',e=>{if(D&&e.pointerId===D.id)end(false);});
  document.addEventListener('keydown',e=>{if(!D||!D.on)return;if(e.code==='KeyR'){rotate();e.preventDefault();e.stopPropagation();}else if(e.code==='Escape'){end(false);e.stopPropagation();}},true);
  OV.addEventListener('wheel',e=>{if(D&&D.on){rotate();e.preventDefault();}},{passive:false});
  OV.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('.maleta')){e.preventDefault();if(D&&D.on)rotate();}});
  OV.addEventListener('click',e=>{if(supp){supp=false;e.stopPropagation();e.preventDefault();}},true);
  try{const st=document.createElement('style');st.textContent=`.maleta .mcell{touch-action:none;user-select:none;-webkit-user-select:none;-webkit-touch-callout:none;cursor:grab}
    .mfp{position:absolute;z-index:2;pointer-events:none;border:2px solid #6ac07a;background:rgba(106,192,122,.25)}.mfp.bad{border-color:#d24a3a;background:rgba(210,74,58,.25)}`;document.head.appendChild(st);}catch(e){}
})();
