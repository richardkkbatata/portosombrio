// ===================== 1.7.1 · CELULAR: CORRIDA, TELA LIMPA, EDITOR DE CONTROLES =====================
// - Botão de correr (liga/desliga). O direcional não corre mais sozinho quando vai até a borda.
// - Tela mais limpa: botões só com ícone (os nomes aparecem só no começo) e cada botão só aparece quando serve pra algo.
// - Editor de controles: arraste qualquer botão ou direcional, aumente ou diminua. Fica salvo no aparelho, separado em pé e deitado.

const HUDL_KEY='ps-hud-layout';
let HUDL={};
try{HUDL=JSON.parse(localStorage.getItem(HUDL_KEY)||'{}')||{};}catch(e){HUDL={};}
const hudOri=()=>view.h>view.w?'port':'land';
const hudGet=id=>(HUDL[hudOri()]||{})[id];
function hudSave(){try{localStorage.setItem(HUDL_KEY,JSON.stringify(HUDL));}catch(e){}}
TOUCH.runOn=false;

// botão de correr (criado aqui pra não mexer no HTML base)
(function(){
  try{const tc=document.getElementById('tc');if(tc&&document.createElement){
    const b=document.createElement('button');b.className='tb tfix act';b.id='tb-run';b.setAttribute('aria-label','Correr');
    b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="14.5" cy="4.5" r="2.2"/><path d="M8 21l3-6 3 2v5M11 15l1.5-6.5L9 10l-2 3M12.5 8.5l3 3h3.5"/></svg><span>Correr</span>';
    tc.appendChild(b);
    b.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();AU.init();lastTouchT=Date.now();buzz(8);if(G.mode!=='play')return;TOUCH.runOn=!TOUCH.runOn;if(TOUCH.runOn&&P.crouch)toggleCrouch();tcState='';},{passive:false});
    b.addEventListener('click',()=>{if(Date.now()-lastTouchT<600||G.mode!=='play')return;TOUCH.runOn=!TOUCH.runOn;tcState='';});
  }}catch(e){}
})();

// correr só com o botão ligado (teclado continua com Shift)
{const ri=readInput; readInput=function(){ri();if(TOUCH.move.id!==null)IN.run=!!TOUCH.runOn&&hyp(IN.mx,IN.my)>.15;};}

// posições: o padrão de antes + o que o jogador arrumou no editor
{const sc=stickCenters; stickCenters=function(){const C=sc();
  const s=hudGet('sticks'); if(s&&s.s)STICK.r=50*hudF()*s.s;
  for(const k of ['move','aim']){const o=hudGet(k);if(o&&o.x!=null){C[k]={x:o.x*view.w,y:o.y*view.h};}}
  return C;};}
const HUD_BTNS=['tb-heal','tb-crouch','tb-run','tb-gren','tb-wpn','tb-rel','tb-dodge','tb-use'];
{const lt=layoutTouch; layoutTouch=function(){lt();
  const C=stickCenters(),M=C.move,f=hudF();
  // padrão do botão de correr: logo acima do direcional de andar
  const run=document.getElementById('tb-run');
  if(run&&run.style){const p=C.portrait?[M.x+STICK.r+30*f,M.y-STICK.r-10*f]:[M.x+STICK.r+34*f,M.y+STICK.r*.15];run.style.left=p[0]+'px';run.style.top=p[1]+'px';}
  for(const id of HUD_BTNS){const el=document.getElementById(id);if(!el||!el.style)continue;const o=hudGet(id);
    if(o&&o.x!=null){el.style.left=o.x*view.w+'px';el.style.top=o.y*view.h+'px';}
    if(el.style.setProperty)el.style.setProperty('--bs',String((o&&o.s)||1));}
};}

// só mostra o botão quando ele serve pra alguma coisa
{const ut=updTouchUI; updTouchUI=function(){
  if(!IN.touch)return ut();
  const tc=document.getElementById('tc'); if(!tc||tc.hidden)return ut();
  const w=WEAPONS[P.w], heal=['ervaV','misVV','misVR','spray'].some(id=>invCount(id)>0), owned=P.owned.filter(Boolean).length;
  const canRel=!w.melee&&P.mags[P.w]<w.mag&&(invCount(w.ammo)>0||DBG.ammo), gn=invCount(curThrow());
  const lbl=G.time<45&&!G.flags.mpMode, k=[heal,owned,canRel,gn>0,TOUCH.runOn,P.running,lbl,!!G.mp].join('|');
  if(k!==UI._tcK){UI._tcK=k;tcState='';}
  ut();
  const set=(id,show)=>{const el=document.getElementById(id);if(el&&el.classList)el.classList.toggle('gone',!show);};
  set('tb-heal',heal); set('tb-wpn',owned>1); set('tb-rel',canRel); set('tb-gren',gn>0);
  const r=document.getElementById('tb-run'); if(r&&r.classList){r.classList.toggle('on',!!TOUCH.runOn);r.classList.toggle('dim',!!P.tired);}
  if(tc.classList)tc.classList.toggle('lbl',lbl);
};}

// ---------- editor de controles ----------
const HUD_ED=[['move','Andar',1],['aim','Mirar',1],['tb-run','Correr'],['tb-crouch','Agachar'],['tb-heal','Curar'],['tb-dodge','Esquiva'],['tb-rel','Recarga'],['tb-wpn','Arma'],['tb-gren','Jogar'],['tb-use','Usar']];
function hudCur(id){
  const C=stickCenters();
  if(id==='move'||id==='aim')return {x:C[id].x,y:C[id].y,r:STICK.r,s:(hudGet('sticks')||{}).s||1};
  const el=document.getElementById(id),o=hudGet(id)||{};
  let x=parseFloat(el&&el.style&&el.style.left),y=parseFloat(el&&el.style&&el.style.top);
  if(!isFinite(x)){x=view.w/2;y=view.h/2;}
  return {x,y,r:23*hudF()*(o.s||1),s:o.s||1};
}
UI.hudEdit=function(from){
  this.hudFrom=from||'opts'; this.hudSel=this.hudSel||'move'; layoutTouch();
  const items=HUD_ED.map(([id,n,st])=>{const c=hudCur(id);const d=c.r*2;
    return `<div class="hed${this.hudSel===id?' sel':''}${st?' stick':''}" data-hid="${id}" style="left:${c.x}px;top:${c.y}px;width:${d}px;height:${d}px"><b>${n}</b></div>`;}).join('');
  const sel=HUD_ED.find(x=>x[0]===this.hudSel), cs=hudCur(this.hudSel);
  this.open(`<div class="hedwrap">${items}
    <div class="hedbar"><span class="hint">Arraste os controles. <b>${sel?sel[1]:''}</b>: ${Math.round(cs.s*100)}%</span>
      <button class="btn ghost mini" data-a="hed-s" data-k="-1">Menor</button><button class="btn ghost mini" data-a="hed-s" data-k="1">Maior</button>
      <button class="btn ghost mini" data-a="hed-reset">Restaurar</button><button class="btn primary mini" data-a="hed-ok">Pronto</button></div></div>`,'','hudedit');
};
(function(){
  let D=null;
  const ov=typeof OV!=='undefined'?OV:null; if(!ov||!ov.addEventListener)return;
  const pos=e=>{const t=e.touches?e.touches[0]||e.changedTouches[0]:e;return {x:t.clientX,y:t.clientY};};
  const down=e=>{if(UI.cur!=='hudedit')return;const h=e.target.closest&&e.target.closest('.hed');if(!h)return;e.preventDefault();
    const id=h.dataset.hid,p=pos(e),c=hudCur(id);D={id,h,dx:p.x-c.x,dy:p.y-c.y};UI.hudSel=id;
    ov.querySelectorAll('.hed').forEach(x=>x.classList.toggle('sel',x===h));};
  const move=e=>{if(!D)return;e.preventDefault();const p=pos(e),x=clamp(p.x-D.dx,20,view.w-20),y=clamp(p.y-D.dy,20,view.h-20);D.h.style.left=x+'px';D.h.style.top=y+'px';D.x=x;D.y=y;};
  const up=()=>{if(!D)return;const d=D;D=null;if(d.x==null)return UI.hudEdit(UI.hudFrom);
    const o=HUDL[hudOri()]||(HUDL[hudOri()]={});o[d.id]=Object.assign(o[d.id]||{},{x:d.x/view.w,y:d.y/view.h});hudSave();layoutTouch();UI.hudEdit(UI.hudFrom);};
  ov.addEventListener('touchstart',down,{passive:false});ov.addEventListener('mousedown',down);
  document.addEventListener('touchmove',move,{passive:false});document.addEventListener('mousemove',move);
  document.addEventListener('touchend',up);document.addEventListener('mouseup',up);
  const act=UI.act.bind(UI);
  UI.act=function(a,ds){
    switch(a){
      case 'hudedit':return this.hudEdit(ds.from||'opts');
      case 'hed-s':{const id=this.hudSel,st=id==='move'||id==='aim',key=st?'sticks':id,o=HUDL[hudOri()]||(HUDL[hudOri()]={});
        const cur=(o[key]&&o[key].s)||1;o[key]=Object.assign(o[key]||{},{s:clamp(Math.round((cur+(+ds.k)*.1)*10)/10,.6,1.8)});hudSave();layoutTouch();return this.hudEdit(this.hudFrom);}
      case 'hed-reset':delete HUDL[hudOri()];hudSave();layoutTouch();toast('Controles no lugar padrão.');return this.hudEdit(this.hudFrom);
      case 'hed-ok':layoutTouch();tcState='';return this.opts(this.hudFrom==='pause'?'pause':'title');
    }
    return act(a,ds);
  };
  // botão nas opções (só no celular)
  const op=UI.opts.bind(UI);
  UI.opts=function(from){op(from);try{if(!IN.touch)return;const box=OV.querySelector('.opts');if(!box||!document.createElement)return;
    const d=document.createElement('div');d.className='opt';d.innerHTML=`<h3>Controles na tela</h3><button class="btn" data-a="hudedit" data-from="${from==='pause'?'pause':'opts'}">Editar controles (mover e mudar tamanho)</button>`;box.appendChild(d);}catch(e){}};
  try{const st=document.createElement('style');st.textContent=`
    .tfix{transform:translate(-50%,-50%) scale(var(--bs,1))}.tfix:active,.tfix.down{transform:translate(-50%,-50%) scale(calc(var(--bs,1)*.92))}
    .tuse{transform:translate(-50%,-50%) scale(var(--bs,1))}.tuse:active{transform:translate(-50%,-50%) scale(calc(var(--bs,1)*.95))}
    .tfix.gone{display:none}#tc:not(.lbl) .tfix span{display:none}#tc:not(.lbl) .tfix{width:calc(42px*var(--hs));height:calc(42px*var(--hs))}
    #tb-run.on{background:rgba(212,154,60,.4);border-color:rgba(212,154,60,.75);color:#f2e6c8;opacity:.95}
    .ov.hudedit-on{background:rgba(0,0,0,.25)}.hedwrap{position:fixed;inset:0;z-index:20}
    .hed{position:absolute;transform:translate(-50%,-50%);border-radius:50%;border:2px dashed rgba(221,214,198,.55);background:rgba(10,12,11,.55);display:flex;align-items:center;justify-content:center;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab}
    .hed b{font:700 9px var(--f-ui);letter-spacing:.04em;text-transform:uppercase;color:#ddd6c6;pointer-events:none}
    .hed.sel{border-color:var(--amber);border-style:solid;background:rgba(212,154,60,.25)}
    .hedbar{position:absolute;left:50%;top:calc(10px + env(safe-area-inset-top,0px));transform:translateX(-50%);display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;background:rgba(9,11,10,.88);border:1px solid var(--line);padding:8px 10px;max-width:calc(100vw - 24px)}
    .hedbar .hint{margin:0 6px 0 0}`;document.head.appendChild(st);}catch(e){}
})();
// o editor precisa da tela inteira, sem o painel do menu por cima
{const op=UI.open.bind(UI);UI.open=function(html,cls,cur){const r=op(html,cls,cur);try{if(OV.classList)OV.classList.toggle('hudedit-on',cur==='hudedit');}catch(e){}return r;};}
