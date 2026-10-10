// ===================== RENDERIZAÇÃO =====================
const cv=document.getElementById('cv'); let ctx=cv.getContext('2d');
const lc=document.createElement('canvas'), lx=lc.getContext('2d'), fc=document.createElement('canvas'), fx=fc.getContext('2d');
const view={w:960,h:600,z:1}; let dpr=1; let LS=.5;
// ---------- qualidade gráfica ----------
const QUAL={
  minimo:{n:'Mínimo',ls:.3,dpr:.8,chunk:.7,fog:false,grain:false,rain:.2,ripples:false,windows:false,fovRays:24},
  baixo:{n:'Baixo',ls:.34,dpr:1,chunk:.8,fog:false,grain:false,rain:.4,ripples:false,windows:false,fovRays:30},
  medio:{n:'Médio',ls:.42,dpr:1.35,chunk:1,fog:true,grain:false,rain:.7,ripples:true,windows:true,fovRays:44},
  alto:{n:'Alto',ls:.55,dpr:2,chunk:1.1,fog:true,grain:true,rain:1,ripples:true,windows:true,fovRays:60},
};
let QKEY='alto', Q=QUAL.alto;
function loadQuality(){
  let k=null; try{k=localStorage.getItem('ps-gfx-manual')==='1'?localStorage.getItem('ps-gfx'):(localStorage.getItem('ps-gfx-auto')||localStorage.getItem('ps-gfx'));}catch(e){}
  const touchDev=(typeof window!=='undefined'&&'ontouchstart' in window)||(typeof navigator!=='undefined'&&navigator.maxTouchPoints>0);
  QKEY=k&&QUAL[k]?k:(touchDev?'medio':'alto'); Q=QUAL[QKEY];
}
// ---------- opções do jogador ----------
const OPT={zoom:'normal',hud:'normal',vib:true,bri:'normal'};
const BRIS={escuro:{n:'Escuro',f:1.04},normal:{n:'Normal',f:.93},claro:{n:'Claro',f:.8}};
const ZOOMS={perto:{n:'Perto',f:1.25},normal:{n:'Normal',f:1},longe:{n:'Longe',f:.8}};
const HUDS={pequena:{n:'Pequena',f:.86},normal:{n:'Normal',f:1},grande:{n:'Grande',f:1.16}};
function loadOpts(){try{const o=JSON.parse(localStorage.getItem('ps-opt')||'{}');if(ZOOMS[o.zoom])OPT.zoom=o.zoom;if(HUDS[o.hud])OPT.hud=o.hud;if(typeof o.vib==='boolean')OPT.vib=o.vib;if(BRIS[o.bri])OPT.bri=o.bri;}catch(e){}applyHudVar();}
function saveOpts(){try{localStorage.setItem('ps-opt',JSON.stringify(OPT));}catch(e){}applyHudVar();resize();if(typeof layoutTouch==='function')layoutTouch();}
function applyHudVar(){try{document.documentElement.style.setProperty('--hs',String(HUDS[OPT.hud].f));}catch(e){}}
function buzz(ms){if(!OPT.vib)return;try{if(navigator.vibrate)navigator.vibrate(ms);}catch(e){}}
function setQuality(k,auto){if(!QUAL[k])return;QKEY=k;Q=QUAL[k];try{localStorage.setItem(auto?'ps-gfx-auto':'ps-gfx',k);}catch(e){}resize();}
// ---------- cenário em blocos pré-desenhados ----------
const CHT=16, CHPX=CHT*TILE, chunks=new Map(); let CS=1, CHUNKING=false;
function clearChunks(){chunks.clear();}
function invalidateRect(x,y,w,h){
  for(let cy=Math.floor((y-1)/CHT);cy<=Math.floor((y+h)/CHT);cy++)for(let cx=Math.floor((x-1)/CHT);cx<=Math.floor((x+w)/CHT);cx++)chunks.delete(cx+','+cy);
}
function renderChunk(cx,cy){
  const c=document.createElement('canvas'); c.width=Math.ceil(CHPX*CS); c.height=Math.ceil(CHPX*CS);
  const cc=c.getContext('2d'); const saved=ctx; ctx=cc; CHUNKING=true;
  try{
    cc.setTransform(CS,0,0,CS,-cx*CHPX*CS,-cy*CHPX*CS);
    const x0=Math.max(0,cx*CHT-1), y0=Math.max(0,cy*CHT-1), x1=Math.min(W-1,cx*CHT+CHT), y1=Math.min(HT-1,cy*CHT+CHT);
    drawTiles(x0,y0,x1,y1);
    const px0=x0*TILE-40,py0=y0*TILE-40,px1=(x1+1)*TILE+40,py1=(y1+1)*TILE+40;
    for(const p of puddles){if(p.x<px0||p.x>px1||p.y<py0||p.y>py1)continue;drawPuddleBase(p);}
    if(LM.pad&&LM.pad.x>px0-140&&LM.pad.x<px1+140&&LM.pad.y>py0-140&&LM.pad.y<py1+140)drawHelipad();
    for(const g of gates)if(g.x<=x1+1&&g.x+g.w>=x0-1&&g.y<=y1+1&&g.y+g.h>=y0-1)drawGate(g);
    for(const car of cars)if(car.x<=x1+2&&car.x+car.w>=x0-2&&car.y<=y1+2&&car.y+car.h>=y0-2)drawCar(car);
    for(const l of lamps)if(l.x>px0&&l.x<px1&&l.y>py0&&l.y<py1){cc.fillStyle='#1a1a1a';cc.beginPath();cc.arc(l.x,l.y,4,0,6.283);cc.fill();cc.fillStyle=l.broken?'#333':'#d8cfa0';cc.beginPath();cc.arc(l.x,l.y,2,0,6.283);cc.fill();}
  }finally{ctx=saved;CHUNKING=false;}
  return c;
}
function drawChunks(){
  const z=view.z, cx0=Math.max(0,Math.floor(cam.x/CHPX)), cy0=Math.max(0,Math.floor(cam.y/CHPX));
  const cx1=Math.min(Math.ceil(W/CHT)-1,Math.floor((cam.x+view.w/z)/CHPX)), cy1=Math.min(Math.ceil(HT/CHT)-1,Math.floor((cam.y+view.h/z)/CHPX));
  for(let cy=cy0;cy<=cy1;cy++)for(let cx=cx0;cx<=cx1;cx++){
    const k=cx+','+cy; let c=chunks.get(k);
    if(c){chunks.delete(k);chunks.set(k,c);} else {c=renderChunk(cx,cy);chunks.set(k,c);if(chunks.size>48)chunks.delete(chunks.keys().next().value);}
    ctx.drawImage(c,cx*CHPX,cy*CHPX,CHPX,CHPX);
  }
}
// listas estáticas (árvores e janelas acesas) calculadas uma vez por mundo
let STATIC={trees:[],wins:[]};
function computeStatic(){
  const trees=[],wins=[];
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const k=idx(x,y);if(map[k]===T.TREE)trees.push(k);}
  for(const b of buildings){if(!b.lit||b.dark||!b.wins)continue;for(const w of b.wins)wins.push({x:w.x*TILE,y:w.y*TILE,dir:w.dir,b});}
  STATIC={trees,wins}; clearChunks();
}
// sprites de luz (evita criar gradientes a cada quadro)
let LSPR=null; const GSPR={};
function makeLightSprites(){
  const mk=(stops)=>{const c=document.createElement('canvas');c.width=128;c.height=128;const g=c.getContext('2d');const gr=g.createRadialGradient(64,64,0,64,64,64);for(const [o,col] of stops)gr.addColorStop(o,col);g.fillStyle=gr;g.fillRect(0,0,128,128);return c;};
  LSPR=mk([[0,'rgba(0,0,0,1)'],[.55,'rgba(0,0,0,.6)'],[1,'rgba(0,0,0,0)']]);
  for(const k in LIGHT_COL)GSPR[k]=mk([[0,`rgba(${LIGHT_COL[k]},1)`],[1,`rgba(${LIGHT_COL[k]},0)`]]);
  GSPR.win=mk([[0,'rgba(255,190,110,1)'],[1,'rgba(255,170,90,0)']]);
  GSPR.white=mk([[0,'rgba(255,225,160,1)'],[1,'rgba(255,200,120,0)']]);
  GSPR.red=mk([[0,'rgba(255,40,30,1)'],[1,'rgba(255,40,30,0)']]);
  GSPR.blue=mk([[0,'rgba(60,110,255,1)'],[1,'rgba(60,110,255,0)']]);
}
function glow(spr,x,y,r,a){if(!LSPR)makeLightSprites();ctx.globalAlpha=clamp(a,0,1);ctx.drawImage(GSPR[spr]||GSPR.white,x-r,y-r,r*2,r*2);ctx.globalAlpha=1;}
let lastDt=.016, vignette=null, renderT=0;
const SAFE={t:0,r:0,b:0,l:0};
function readSafe(){
  const p=document.getElementById('safeprobe'); if(!p)return;
  const cs=getComputedStyle(p);
  SAFE.t=parseFloat(cs.paddingTop)||0; SAFE.r=parseFloat(cs.paddingRight)||0; SAFE.b=parseFloat(cs.paddingBottom)||0; SAFE.l=parseFloat(cs.paddingLeft)||0;
}
function resize(){
  LS=Q.ls; dpr=Math.min(Q.dpr,window.devicePixelRatio||1);
  view.w=Math.max(320,window.innerWidth); view.h=Math.max(240,window.innerHeight);
  cv.width=Math.round(view.w*dpr); cv.height=Math.round(view.h*dpr);
  view.bz=clamp(Math.min(view.w/880,view.h/560),.6,1.6); view.z=view.bz*((G&&G.zm)||1);
  lc.width=Math.ceil(view.w*LS); lc.height=Math.ceil(view.h*LS);
  const ncs=clamp(Math.round(view.bz*dpr*Q.chunk*4)/4,.5,2); if(ncs!==CS){CS=ncs;clearChunks();}
  vignette=null; readSafe();
}
function rrect(c,x,y,w,h,r){c.beginPath();c.moveTo(x+r,y);c.arcTo(x+w,y,x+w,y+h,r);c.arcTo(x+w,y+h,x,y+h,r);c.arcTo(x,y+h,x,y,r);c.arcTo(x,y,x+w,y,r);c.closePath();}
const C={
  grass:['#25321e','#28351f','#222e1c','#2a3721'],road:['#212226','#232428','#1f2023'],side:['#3a3835','#3d3b38','#383633'],
  wood:['#3c2d20','#3f2f21','#39291d'],tileA:'#484c4d',tileB:'#424647',dirt:['#3a3022','#3d3324','#362d1f'],
  gravel:['#35332d','#38362f','#32302a'],sand:['#7d6d50','#80704f','#7a6a4d','#84744f'],conc:['#454542','#484845','#42423f'],pier:'#4a3a28',safe:['#1f3229','#21352b'],
};
const shade=(a,v)=>a[Math.floor(v*a.length)%a.length];
function drawGround(t,X,Y,v,x,y){
  switch(t){
    case T.GRASS: ctx.fillStyle=shade(C.grass,v);ctx.fillRect(X,Y,TILE,TILE);
      if(v>.78){ctx.fillStyle='#33442a';ctx.fillRect(X+((v*997)%26|0),Y+((v*577)%26|0),3,2);ctx.fillRect(X+((v*331)%26|0),Y+((v*733)%26|0),2,3);} break;
    case T.ROAD: ctx.fillStyle=shade(C.road,v);ctx.fillRect(X,Y,TILE,TILE);{
        const m=mark[idx(x,y)];
        if(m===1&&!(x&1)){ctx.fillStyle='#8d7d45';ctx.fillRect(X+4,Y+TILE-2,22,3);}
        else if(m===2&&!(y&1)){ctx.fillStyle='#8d7d45';ctx.fillRect(X+TILE-2,Y+4,3,22);}
        if(v<.04){ctx.strokeStyle='#18191b';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(X+4,Y+8);ctx.lineTo(X+14,Y+16);ctx.lineTo(X+12,Y+27);ctx.stroke();}
      } break;
    case T.SIDE: ctx.fillStyle=shade(C.side,v);ctx.fillRect(X,Y,TILE,TILE);ctx.fillStyle='#45433f';ctx.fillRect(X,Y,TILE,1);ctx.fillRect(X,Y,1,TILE); break;
    case T.WOOD: ctx.fillStyle=shade(C.wood,v);ctx.fillRect(X,Y,TILE,TILE);ctx.fillStyle='rgba(0,0,0,.18)';for(let k=8;k<TILE;k+=8)ctx.fillRect(X,Y+k,TILE,1);ctx.fillRect(X+((v*20)|0)+4,Y,1,8); break;
    case T.TILEF: ctx.fillStyle=((x+y)&1)?C.tileA:C.tileB;ctx.fillRect(X,Y,TILE,TILE);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(X,Y,TILE,1);ctx.fillRect(X,Y,1,TILE); break;
    case T.SAFE: ctx.fillStyle=shade(C.safe,v);ctx.fillRect(X,Y,TILE,TILE);ctx.fillStyle='rgba(120,200,150,.06)';ctx.fillRect(X+14,Y+14,4,4); break;
    case T.WATER:{ctx.fillStyle='#0b2130';ctx.fillRect(X,Y,TILE,TILE);if(!CHUNKING){const w=Math.sin(renderT*1.4+x*.9+y*1.7);ctx.fillStyle='#14364a';ctx.fillRect(X+5+w*3,Y+11+w*3,15,2);ctx.fillRect(X+16-w*3,Y+24-w*2,10,2);}} break;
    case T.DIRT: ctx.fillStyle=shade(C.dirt,v);ctx.fillRect(X,Y,TILE,TILE);if(v>.6){ctx.fillStyle='#463a29';ctx.fillRect(X+((v*311)%28|0),Y+((v*977)%28|0),3,3);} break;
    case T.GRAVEL: ctx.fillStyle=shade(C.gravel,v);ctx.fillRect(X,Y,TILE,TILE);ctx.fillStyle='#423f37';ctx.fillRect(X+((v*331)%28|0),Y+((v*127)%28|0),2,2);ctx.fillRect(X+((v*713)%28|0),Y+((v*459)%28|0),2,2); break;
    case T.CONC: ctx.fillStyle=shade(C.conc,v);ctx.fillRect(X,Y,TILE,TILE);if(!(x%3)&&!(y%3)){ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(X,Y,TILE,1);ctx.fillRect(X,Y,1,TILE);} break;
    case T.PIER: ctx.fillStyle=C.pier;ctx.fillRect(X,Y,TILE,TILE);ctx.fillStyle='rgba(0,0,0,.28)';for(let k=6;k<TILE;k+=7)ctx.fillRect(X+k,Y,1,TILE); break;
    case T.CARPET: ctx.fillStyle='#432526';ctx.fillRect(X,Y,TILE,TILE); break;
    case T.SAND: ctx.fillStyle=shade(C.sand,v);ctx.fillRect(X,Y,TILE,TILE);
      ctx.fillStyle='rgba(0,0,0,.08)';ctx.fillRect(X+((v*311)%26|0),Y+((v*977)%26|0),3,2);ctx.fillRect(X+((v*733)%28|0),Y+((v*157)%28|0),2,2);
      if(getT(x+1,y)===T.WATER){ctx.fillStyle='rgba(20,30,34,.35)';ctx.fillRect(X+TILE-9,Y,9,TILE);} break;
    case T.ROCK: ctx.fillStyle='#2c2b29';ctx.fillRect(X,Y,TILE,TILE);
      ctx.fillStyle=v>.5?'#3a3835':'#363431';ctx.beginPath();ctx.ellipse(X+10+v*8,Y+12,10+v*4,8,v*3,0,6.283);ctx.fill();
      ctx.fillStyle='#423f3b';ctx.beginPath();ctx.ellipse(X+22-v*6,Y+22,8,6+v*3,v*2,0,6.283);ctx.fill();
      ctx.fillStyle='rgba(255,255,255,.05)';ctx.fillRect(X+6+v*10,Y+7,6,2); break;
    case T.FOREST:{ctx.fillStyle='#0f1e11';ctx.fillRect(X,Y,TILE,TILE);
      const a=v*6.283;ctx.fillStyle=v>.5?'#16301a':'#183419';
      ctx.beginPath();ctx.arc(X+8+Math.cos(a)*4,Y+9+Math.sin(a)*3,13,0,6.283);ctx.fill();
      ctx.beginPath();ctx.arc(X+24-Math.sin(a)*3,Y+22+Math.cos(a)*3,14,0,6.283);ctx.fill();
      ctx.fillStyle='rgba(60,110,60,.12)';ctx.beginPath();ctx.arc(X+12,Y+12,6,0,6.283);ctx.fill();
      if(v>.85){ctx.fillStyle='#1d3d20';ctx.beginPath();ctx.arc(X+16,Y+16,9,0,6.283);ctx.fill();}} break;
    case T.BORDER: ctx.fillStyle='#4f4d48';ctx.fillRect(X,Y,TILE,TILE);ctx.fillStyle=((x+y)&1)?'#9a7424':'#1c1b19';ctx.fillRect(X,Y+12,TILE,8);ctx.fillStyle='rgba(255,255,255,.06)';ctx.fillRect(X,Y,TILE,2); break;
    default: ctx.fillStyle='#222';ctx.fillRect(X,Y,TILE,TILE);
  }
}
function drawProp(m,X,Y,v){
  const c=ctx;
  switch(m){
    case 1: c.fillStyle='#4f3f2c';c.fillRect(X+2,Y+3,28,26);c.fillStyle='#3a2e20';c.fillRect(X+2,Y+15,28,2);
      for(let i=0;i<5;i++){c.fillStyle=['#8a3a2a','#3a6a8a','#c9a24a','#5a7a3a','#8a8a86'][(i+((v*10)|0))%5];c.fillRect(X+4+i*5,Y+6,4,7);c.fillRect(X+5+i*5,Y+19,3,7);} break;
    case 2: c.fillStyle='#5a4430';c.fillRect(X+3,Y+5,26,22);c.fillStyle='#c4bda8';c.fillRect(X+8,Y+9,9,7);c.fillStyle='#2a2a2c';c.fillRect(X+19,Y+10,6,5); break;
    case 3: c.fillStyle='#3a3f4a';c.fillRect(X+3,Y+2,26,28);c.fillStyle='#8a8d96';c.fillRect(X+5,Y+11,22,17);c.fillStyle='#d4cfc4';c.fillRect(X+7,Y+4,18,6); break;
    case 4: c.fillStyle='#6b5433';c.fillRect(X+3,Y+3,26,26);c.strokeStyle='#4a3a22';c.lineWidth=2;c.strokeRect(X+4,Y+4,24,24);c.beginPath();c.moveTo(X+4,Y+4);c.lineTo(X+28,Y+28);c.moveTo(X+28,Y+4);c.lineTo(X+4,Y+28);c.stroke(); break;
    case 5: c.fillStyle='#5e3424';c.beginPath();c.arc(X+16,Y+16,12,0,6.283);c.fill();c.strokeStyle='#3c2016';c.lineWidth=2;c.beginPath();c.arc(X+16,Y+16,8,0,6.283);c.stroke(); break;
    case 6:{const cc=['#34505f','#6e3529','#465f34','#6a5a2a'][((X*7+Y*3)/32|0)%4];c.fillStyle=cc;c.fillRect(X,Y,TILE,TILE);c.fillStyle='rgba(0,0,0,.25)';for(let k=3;k<TILE;k+=5)c.fillRect(X+k,Y,1.5,TILE);} break;
    case 7: c.fillStyle='#4a3826';c.fillRect(X+2,Y+9,28,4);c.fillRect(X+2,Y+15,28,4);c.fillStyle='#2a2a2a';c.fillRect(X+4,Y+21,3,4);c.fillRect(X+25,Y+21,3,4); break;
    case 8: c.fillStyle='#29453a';c.fillRect(X+2,Y+4,28,24);c.fillStyle='#1d3229';c.fillRect(X+2,Y+14,28,2); break;
    case 9: c.fillStyle='#5f5140';c.fillRect(X,Y+6,TILE,20);c.fillStyle='#6f6150';c.fillRect(X,Y+6,TILE,3); break;
    case 11: c.fillStyle='#7f888c';c.fillRect(X+4,Y+2,24,28);c.fillStyle='#d6d8d3';c.fillRect(X+6,Y+9,20,19);c.fillStyle='#ecebe6';c.fillRect(X+8,Y+3,16,5); break;
    case 12: c.fillStyle='#3e2c1d';c.fillRect(X+2,Y+2,28,28);for(let i=0;i<6;i++){c.fillStyle=['#6a2a2a','#2a4a6a','#7a6a3a','#3a5a3a'][(i+((v*7)|0))%4];c.fillRect(X+4+i*4,Y+4,3,10);c.fillRect(X+4+i*4,Y+17,3,10);} break;
    case 13: c.fillStyle='#4d3824';c.fillRect(X,Y+8,TILE,13);c.fillStyle='#3a2a1a';c.fillRect(X,Y+18,TILE,3); break;
    case 14: c.fillStyle='#5a3032';rrect(c,X+2,Y+4,28,24,5);c.fill();c.fillStyle='#6d3c3e';c.fillRect(X+5,Y+10,22,14); break;
    case 15: c.fillStyle='#454b51';c.fillRect(X+1,Y+1,30,30);c.fillStyle='#5d6870';c.fillRect(X+4,Y+4,24,24);c.fillStyle='#2a2e32';c.beginPath();c.arc(X+16,Y+16,6,0,6.283);c.fill();c.fillStyle='#8a6a2a';c.fillRect(X+3,Y+3,3,3); break;
    case 16: c.fillStyle='#7a2b25';c.fillRect(X+8,Y+4,16,24);c.fillStyle='#d8d4c8';c.fillRect(X+10,Y+7,12,6);c.fillStyle='#222';c.fillRect(X+22,Y+14,5,2); break;
    case 17: c.fillStyle='#6d6045';for(let i=0;i<3;i++){c.beginPath();c.ellipse(X+6+i*10,Y+12,6,4,0,0,6.283);c.fill();c.beginPath();c.ellipse(X+11+i*9,Y+21,6,4,0,0,6.283);c.fill();} break;
    case 20: c.fillStyle='#4a3826';c.fillRect(X+2,Y+6,28,22);c.fillStyle='#1d1d20';c.fillRect(X+7,Y+11,18,12);c.fillStyle='#e8e2d0';c.fillRect(X+10,Y+5,12,8);c.fillStyle='#55555a';c.fillRect(X+8,Y+19,16,2); break;
    case 21: c.fillStyle='#5b3d24';c.fillRect(X+2,Y+6,28,22);c.fillStyle='#6d4a2c';c.fillRect(X+2,Y+6,28,6);c.fillStyle='#b08a3a';c.fillRect(X+14,Y+12,4,5);c.fillRect(X+2,Y+12,28,1.5); break;
    case 22: c.fillStyle='#43473f';c.fillRect(X+5,Y+3,22,26);c.fillStyle=G.flags&&G.flags.fuse?'#4ad06a':'#d04a3a';c.fillRect(X+9,Y+7,4,4);c.fillStyle='#b8952e';c.fillRect(X+5,Y+24,22,3); break;
    case 23: c.fillStyle='#3a3f44';c.fillRect(X+3,Y+3,26,26);c.fillStyle='#596066';c.beginPath();c.arc(X+16,Y+16,7,0,6.283);c.fill();c.fillStyle='#22262a';c.fillRect(X+15,Y+10,2,6); break;
    case 24: c.fillStyle='#3a3f35';c.fillRect(X+4,Y+8,24,18);c.fillStyle='#22251f';c.fillRect(X+7,Y+11,10,8);c.strokeStyle='#888';c.lineWidth=1.5;c.beginPath();c.moveTo(X+24,Y+8);c.lineTo(X+28,Y-6);c.stroke();c.fillStyle=(renderT*2|0)%2?'#e04a3a':'#5a1a14';c.fillRect(X+20,Y+12,4,4); break;
    case 25: c.fillStyle='#3a3c3e';c.fillRect(X+8,Y+18,16,10);c.strokeStyle=G.flags&&G.flags.atalho?'#4ad06a':'#d0a03a';c.lineWidth=4;c.beginPath();c.moveTo(X+16,Y+22);c.lineTo(G.flags&&G.flags.atalho?X+26:X+8,Y+6);c.stroke(); break;
    case 28: c.fillStyle='#2e3438';c.fillRect(X+4,Y+1,24,30);c.fillStyle='#454d52';c.fillRect(X+6,Y+3,9,26);c.fillRect(X+17,Y+3,9,26);c.fillStyle='#1c2023';for(let i=0;i<3;i++){c.fillRect(X+8,Y+6+i*3,5,1.2);c.fillRect(X+19,Y+6+i*3,5,1.2);}c.fillStyle='#8a8d90';c.fillRect(X+14,Y+15,1.5,4);c.fillRect(X+16.5,Y+15,1.5,4); break;
    case 29: c.fillStyle='#1f3a2a';c.fillRect(X+1,Y+5,30,23);c.fillStyle='#2b4d38';c.fillRect(X+1,Y+5,30,6);c.fillStyle='#16291e';c.fillRect(X+3,Y+12,26,1.5);c.fillStyle='#111';c.fillRect(X+3,Y+27,4,3);c.fillRect(X+25,Y+27,4,3);c.fillStyle='rgba(200,200,180,.25)';c.fillRect(X+6,Y+16,8,2); break;
    case 30: c.fillStyle='rgba(0,0,0,.3)';c.fillRect(X+9,Y+20,16,6);c.fillStyle=v>.5?'#6a6a66':'#5a5a58';rrect(c,X+8,Y+6,16,18,6);c.fill();c.fillStyle='#4a4a48';c.fillRect(X+8,Y+20,16,4);
      if(v>.7){c.fillStyle='#7a7a74';c.fillRect(X+15,Y+8,2,10);c.fillRect(X+11,Y+11,10,2);}else{c.fillStyle='rgba(0,0,0,.25)';c.fillRect(X+11,Y+11,10,1.5);c.fillRect(X+11,Y+15,8,1.5);} break;
    case 31: case 33: break;
    case 32: c.fillStyle='#3a3d42';c.fillRect(X,Y,TILE,TILE);c.fillStyle='#55595f';for(let k=2;k<TILE;k+=5)c.fillRect(X+3,Y+k,26,2);c.fillStyle='#1c1e20';c.fillRect(X,Y,3,TILE);c.fillRect(X+29,Y,3,TILE); break;
    case 34: c.fillStyle='#c8c6be';c.fillRect(X,Y+6,TILE,10);c.fillStyle='rgba(255,255,255,.25)';c.fillRect(X,Y+6,TILE,2); break;
    case 36: c.fillStyle='#7f888c';c.fillRect(X+3,Y+3,26,26);c.fillStyle='#c8c6be';c.fillRect(X+5,Y+5,22,22);c.fillStyle='#8a2a22';c.beginPath();c.ellipse(X+16,Y+17,9,7,.4,0,6.283);c.fill();
      c.fillStyle='#b8b0a0';c.beginPath();c.arc(X+16,Y+9,4,0,6.283);c.fill();c.fillStyle='rgba(110,16,12,.75)';c.beginPath();c.ellipse(X+20,Y+24,7,3,0,0,6.283);c.fill(); break;
    case 37: c.fillStyle='#3a3e36';c.fillRect(X+6,Y+3,20,26);c.fillStyle='#55594e';c.fillRect(X+8,Y+5,16,10);c.fillStyle='#d8cc50';c.fillRect(X+9,Y+19,6,7);c.fillStyle='#1a1c1a';c.fillRect(X+17,Y+19,6,7);c.fillStyle='#d8261e';c.fillRect(X+10,Y+7,3,3); break;
    case 38: c.fillStyle='#3a2a1a';c.fillRect(X+2,Y+8,28,18);c.fillStyle=G.flags&&G.flags.vitrine?'rgba(120,150,170,.25)':'rgba(150,190,210,.45)';c.fillRect(X+4,Y+10,24,12);if(!(G.flags&&G.flags.vitrine)){c.fillStyle='#2a2a2a';c.fillRect(X+9,Y+14,12,3);c.fillRect(X+9,Y+14,3,6);}c.fillStyle='#d04a3a';c.fillRect(X+26,Y+11,2,2); break;
    case 35: c.fillStyle='#22262a';c.fillRect(X+1,Y+4,30,22);c.fillStyle='#2a4a6a';c.fillRect(X+4,Y+7,11,8);c.fillRect(X+17,Y+7,11,8);c.fillStyle='#1a2a3a';c.fillRect(X+4,Y+17,11,6);c.fillRect(X+17,Y+17,11,6); break;
    case 60: c.fillStyle='#1a1c1e';c.beginPath();c.arc(X+16,Y+16,14,0,6.283);c.fill();c.fillStyle='#4a4e52';c.beginPath();c.arc(X+16,Y+16,12,0,6.283);c.fill();c.fillStyle='#2a2c2e';for(let k=-8;k<=8;k+=4)c.fillRect(X+7,Y+16+k,18,1.5); break;
    case 61: c.fillStyle='#3a3e42';c.fillRect(X+12,Y+2,8,14);c.strokeStyle='#a83a2a';c.lineWidth=3;c.beginPath();c.arc(X+16,Y+18,10,0,6.283);c.stroke();c.beginPath();c.moveTo(X+6,Y+18);c.lineTo(X+26,Y+18);c.moveTo(X+16,Y+8);c.lineTo(X+16,Y+28);c.stroke(); break;
    case 62: c.fillStyle='#2a2c2e';c.fillRect(X+2,Y,28,TILE);c.strokeStyle='#7a7e82';c.lineWidth=2.5;c.beginPath();c.moveTo(X+8,Y);c.lineTo(X+8,Y+TILE);c.moveTo(X+24,Y);c.lineTo(X+24,Y+TILE);for(let k=4;k<TILE;k+=7){c.moveTo(X+8,Y+k);c.lineTo(X+24,Y+k);}c.stroke(); break;
    case 27: c.fillStyle='#6a5a46';c.fillRect(X,Y+6,TILE,20);c.fillStyle='#d8d0b8';c.fillRect(X,Y+6,TILE,3);c.fillStyle='#f0d070';c.fillRect(X+8,Y+10,3,6);c.fillRect(X+21,Y+10,3,6); break;
    default: c.fillStyle='#4a3a2a';c.fillRect(X+4,Y+4,24,24);
  }
}
function drawTiles(x0,y0,x1,y1){
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    const k=idx(x,y),t=map[k],X=x*TILE,Y=y*TILE,v=tvar[k];
    if(t===T.WALL){
      ctx.fillStyle='#19191b';ctx.fillRect(X,Y,TILE,TILE);
      ctx.fillStyle='#2b2a2e';ctx.fillRect(X,Y,TILE,3);
      if(getT(x,y+1)!==T.WALL){ctx.fillStyle='#242327';ctx.fillRect(X,Y+TILE-7,TILE,7);}
      const wd=winAt.get(k);
      if(wd!=null){
        ctx.fillStyle='#3a4e5e';
        if(wd===0||wd===2){ctx.fillRect(X+4,Y+11,24,10);ctx.fillStyle='#16202a';ctx.fillRect(X+15,Y+11,2,10);ctx.fillStyle='rgba(200,230,255,.18)';ctx.fillRect(X+6,Y+12,7,3);}
        else{ctx.fillRect(X+11,Y+4,10,24);ctx.fillStyle='#16202a';ctx.fillRect(X+11,Y+15,10,2);ctx.fillStyle='rgba(200,230,255,.18)';ctx.fillRect(X+12,Y+6,3,7);}
      }
      continue;
    }
    if(t===T.WINDOW){
      // janela que dá pra quebrar: moldura de madeira clara e vidro inteiro
      ctx.fillStyle='#19191b';ctx.fillRect(X,Y,TILE,TILE);const wd=winAt.get(k)??0, hz=wd===0||wd===2;
      ctx.fillStyle='#8a6a42';if(hz)ctx.fillRect(X+1,Y+8,30,16);else ctx.fillRect(X+8,Y+1,16,30);
      ctx.fillStyle='#4e6e84';if(hz)ctx.fillRect(X+3,Y+10,26,12);else ctx.fillRect(X+10,Y+3,12,26);
      ctx.fillStyle='rgba(220,240,255,.35)';if(hz){ctx.fillRect(X+5,Y+11,8,3);ctx.fillRect(X+15,Y+10,1.5,12);}else{ctx.fillRect(X+11,Y+5,3,8);ctx.fillRect(X+10,Y+15,12,1.5);}
      continue;
    }
    if(SOLID[t]&&t!==T.WATER){drawGround(under[k],X,Y,v,x,y);}else drawGround(t,X,Y,v,x,y);
    switch(t){
      case T.PROP: drawProp(meta[k],X,Y,v); break;
      case T.TREE: ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(X+18,Y+19,15,12,0,0,6.283);ctx.fill();ctx.fillStyle='#3a2a1c';ctx.beginPath();ctx.arc(X+16,Y+16,5,0,6.283);ctx.fill(); break;
      case T.FENCE:{ctx.strokeStyle='#5f625e';ctx.lineWidth=1;ctx.beginPath();const hz=getT(x-1,y)===T.FENCE||getT(x+1,y)===T.FENCE;
        if(hz){ctx.moveTo(X,Y+14);ctx.lineTo(X+TILE,Y+14);ctx.moveTo(X,Y+18);ctx.lineTo(X+TILE,Y+18);}else{ctx.moveTo(X+14,Y);ctx.lineTo(X+14,Y+TILE);ctx.moveTo(X+18,Y);ctx.lineTo(X+18,Y+TILE);}
        ctx.stroke();ctx.fillStyle='#777b76';ctx.fillRect(X+13,Y+13,6,6);} break;
      case T.RUBBLE: ctx.fillStyle='#3a3632';ctx.fillRect(X+2,Y+3,13,11);ctx.fillStyle='#55504a';ctx.fillRect(X+14,Y+12,15,14);ctx.fillStyle='#2e2b28';ctx.fillRect(X+5,Y+17,9,10);ctx.fillStyle='#6a3a2a';ctx.fillRect(X+18,Y+3,10,7); break;
    }
  }
}
function drawTreeCanopies(){
  const cf=CUT.on?cutFocus():null;
  const z=view.z,x0=cam.x-60,y0=cam.y-60,x1=cam.x+view.w/z+60,y1=cam.y+view.h/z+60;
  for(const k of STATIC.trees){const tx=(k%W)*TILE,ty=((k/W)|0)*TILE;if(tx<x0||tx>x1||ty<y0||ty>y1)continue;
    const x=k%W,y=(k/W)|0,X=x*TILE+16,Y=y*TILE+16,v=tvar[k];
    let al=1; const pd=hyp(X-P.x,Y-P.y); if(pd<64)al=.22+.78*clamp((pd-34)/30,0,1);
    for(const c of (G.comps||[])){const d=hyp(X-c.x,Y-c.y);if(d<52)al=Math.min(al,.4);}
    if(cf&&hyp(X-cf.x,Y-cf.y)<90)al=Math.min(al,.3);
    ctx.globalAlpha=al;
    ctx.fillStyle=v>.5?'#1d3a1e':'#213f22';ctx.beginPath();ctx.arc(X,Y,19+v*4,0,6.283);ctx.fill();
    ctx.fillStyle=v>.5?'#25482a':'#2a4d2a';ctx.beginPath();ctx.arc(X-4,Y-5,12,0,6.283);ctx.fill();
    ctx.fillStyle='rgba(255,255,255,.04)';ctx.beginPath();ctx.arc(X-7,Y-8,6,0,6.283);ctx.fill();
  }
  ctx.globalAlpha=1;
}
function drawBus(c){
  const X=c.x*TILE,Y=c.y*TILE,w=c.w*TILE,h=c.h*TILE;ctx.save();ctx.translate(X+w/2,Y+h/2);if(c.flip)ctx.rotate(Math.PI);
  const L=w-4,Wd=30;ctx.fillStyle='rgba(0,0,0,.45)';rrect(ctx,-L/2+4,-Wd/2+5,L,Wd,6);ctx.fill();
  ctx.fillStyle=c.col;rrect(ctx,-L/2,-Wd/2,L,Wd,6);ctx.fill();ctx.fillStyle='rgba(0,0,0,.18)';ctx.fillRect(-L/2,-2,L,4);
  ctx.fillStyle='#141a20';for(let k=-L/2+10;k<L/2-14;k+=14)ctx.fillRect(k,-Wd/2+3,10,Wd-6);ctx.fillRect(L/2-12,-Wd/2+3,8,Wd-6);
  ctx.fillStyle='rgba(150,30,24,.55)';ctx.fillRect(-L/2+24,-Wd/2+5,6,4);ctx.fillRect(4,Wd/2-9,5,3);
  ctx.fillStyle='rgba(220,230,240,.12)';ctx.fillRect(-L/2+40,-Wd/2+4,4,Wd-8);
  ctx.restore();
}
function drawCar(c){
  if(c.bus)return drawBus(c);
  const X=c.x*TILE,Y=c.y*TILE,w=c.w*TILE,h=c.h*TILE;
  ctx.save();ctx.translate(X+w/2,Y+h/2);if(!c.horiz)ctx.rotate(Math.PI/2);if(c.flip)ctx.rotate(Math.PI);
  const L=58,Wd=27;
  ctx.fillStyle='rgba(0,0,0,.4)';rrect(ctx,-L/2+3,-Wd/2+4,L,Wd,7);ctx.fill();
  ctx.fillStyle=c.burn?'#1e1a18':c.col;rrect(ctx,-L/2,-Wd/2,L,Wd,7);ctx.fill();
  ctx.fillStyle=c.burn?'#141210':'rgba(255,255,255,.08)';ctx.fillRect(-13,-Wd/2+4,19,Wd-8);
  ctx.fillStyle='#101418';ctx.fillRect(6,-Wd/2+3,9,Wd-6);ctx.fillRect(-22,-Wd/2+4,6,Wd-8);
  if(!c.burn){ctx.fillStyle='#cfc79a';ctx.fillRect(L/2-3,-Wd/2+3,3,5);ctx.fillRect(L/2-3,Wd/2-8,3,5);ctx.fillStyle='#7a1a14';ctx.fillRect(-L/2,-Wd/2+3,2,5);ctx.fillRect(-L/2,Wd/2-8,2,5);}
  if(c.col==='#d8d6cc'){ctx.fillStyle='#b8261e';ctx.fillRect(-4,-3,10,6);ctx.fillRect(-1,-6,4,12);}
  if(c.kind==='police'){ctx.fillStyle='#1d2a4a';ctx.fillRect(-L/2+8,-Wd/2,L-16,4);ctx.fillRect(-L/2+8,Wd/2-4,L-16,4);ctx.fillStyle='#d8261e';ctx.fillRect(-4,-Wd/2+4,4,Wd-8);ctx.fillStyle='#2a5ad8';ctx.fillRect(0,-Wd/2+4,4,Wd-8);}
  if(c.kind==='amb'){ctx.fillStyle='#d8261e';ctx.fillRect(-12,-Wd/2+4,4,Wd-8);ctx.fillStyle='#2a5ad8';ctx.fillRect(-8,-Wd/2+4,4,Wd-8);}
  if(c.kind==='army'&&!c.burn){ctx.fillStyle='#4a5634';ctx.fillRect(-L/2+2,-Wd/2+2,L*.55,Wd-4);ctx.strokeStyle='rgba(0,0,0,.3)';ctx.lineWidth=1;for(let k=-L/2+6;k<0;k+=6){ctx.beginPath();ctx.moveTo(k,-Wd/2+2);ctx.lineTo(k,Wd/2-2);ctx.stroke();}}
  if(c.kind==='vertice'){ctx.fillStyle='#2e8a78';ctx.fillRect(-L/2+4,-2,L-8,4);ctx.fillStyle='#1d2a30';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('V',-8,1);}
  ctx.restore();
}
const GATE_GLYPH={vertice:'V',heli:'H',arsenal:'!'};
function drawGate(g){
  if(g.open)return;
  const X=g.x*TILE,Y=g.y*TILE,w=g.w*TILE,h=g.h*TILE,hz=w>=h;
  if(g.id==='atalho'||g.id==='bloqueio'){
    ctx.fillStyle='#2a2522';ctx.fillRect(X,Y,w,h);
    ctx.strokeStyle='#8a8478';ctx.lineWidth=1.2;for(let i=0;i<w;i+=10){ctx.beginPath();ctx.moveTo(X+i,Y);ctx.lineTo(X+i+10,Y+h);ctx.moveTo(X+i+10,Y);ctx.lineTo(X+i,Y+h);ctx.stroke();}
    for(let i=0;i<2;i++){ctx.save();ctx.translate(X+w*(.3+i*.42),Y+h/2);ctx.rotate(i?.4:-.3);ctx.fillStyle=i?'#5a2a24':'#2d3c55';rrect(ctx,-30,-13,60,26,6);ctx.fill();ctx.fillStyle='#101418';ctx.fillRect(5,-10,9,20);ctx.restore();}
    return;
  }
  if(g.id==='grade'){ctx.fillStyle='rgba(20,22,24,.35)';ctx.fillRect(X,Y,w,h);ctx.fillStyle='#8a8d90';for(let i=3;i<w;i+=7)ctx.fillRect(X+i,Y+2,2.2,h-4);ctx.fillRect(X,Y+3,w,3);ctx.fillRect(X,Y+h-6,w,3);return;}
  if(g.shut||g.id==='servico'){ctx.fillStyle='#3a3d40';ctx.fillRect(X,Y,w,h);ctx.fillStyle='#55595c';if(hz){for(let i=2;i<h;i+=5)ctx.fillRect(X,Y+i,w,2);}else{for(let i=2;i<w;i+=5)ctx.fillRect(X+i,Y,2,h);}ctx.fillStyle='#c9a24a';ctx.fillRect(X+w/2-3,Y+h/2-3,6,6);return;}
  ctx.fillStyle='#1c1e20';ctx.fillRect(X,Y,w,h);ctx.fillStyle='#6a6e70';
  if(hz){for(let i=3;i<w;i+=8)ctx.fillRect(X+i,Y+3,3,h-6);ctx.fillRect(X,Y+h/2-2,w,4);ctx.fillRect(X,Y+2,w,3);ctx.fillRect(X,Y+h-5,w,3);}
  else{for(let i=3;i<h;i+=8)ctx.fillRect(X+3,Y+i,w-6,3);ctx.fillRect(X+w/2-2,Y,4,h);ctx.fillRect(X+2,Y,3,h);ctx.fillRect(X+w-5,Y,3,h);}
  const cx=X+w/2,cy=Y+h/2;
  ctx.fillStyle='#141516';ctx.beginPath();ctx.arc(cx,cy,13,0,6.283);ctx.fill();
  ctx.fillStyle=g.col;ctx.beginPath();ctx.arc(cx,cy,10,0,6.283);ctx.fill();
  ctx.fillStyle='#141516';ctx.font='bold 13px "Barlow Condensed",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(GATE_GLYPH[g.id]||'?',cx,cy+1);
}
function drawJeep(){
  const c=ctx; c.save(); c.translate(V.x,V.y); c.rotate(V.ang);
  const L=48,Wd=28, dead=V.dead;
  c.fillStyle='rgba(0,0,0,.45)';rrect(c,-L/2+3,-Wd/2+4,L,Wd,6);c.fill();
  c.fillStyle='#111';for(const [x,y] of [[-15,-Wd/2-1],[11,-Wd/2-1],[-15,Wd/2-4],[11,Wd/2-4]])c.fillRect(x,y,10,5);
  c.fillStyle=dead?'#1c1a18':'#4a5634';rrect(c,-L/2,-Wd/2,L,Wd,5);c.fill();
  c.fillStyle=dead?'#141210':'#56633c';c.fillRect(8,-Wd/2+2,L/2-10,Wd-4);
  c.fillStyle='rgba(0,0,0,.25)';c.fillRect(8,-1,L/2-10,2);
  c.fillStyle=dead?'#0c0c0c':'#1a2226';c.fillRect(2,-Wd/2+3,5,Wd-6);
  c.fillStyle=dead?'#161412':'#2e3424';c.fillRect(-19,-Wd/2+3,20,Wd-6);
  c.strokeStyle=dead?'#222':'#2a2a2a';c.lineWidth=2.5;c.strokeRect(-14,-Wd/2+2,14,Wd-4);
  c.fillStyle='#1a1a1a';c.beginPath();c.arc(-L/2-3,0,6,0,6.283);c.fill();c.fillStyle='#333';c.beginPath();c.arc(-L/2-3,0,2.5,0,6.283);c.fill();
  if(!dead){c.fillStyle=P.inCar?'#fff4c8':'#9a9478';c.fillRect(L/2-3,-Wd/2+2,3,6);c.fillRect(L/2-3,Wd/2-8,3,6);
    c.fillStyle=P.inCar&&V.spd<-5?'#ff3a2a':'#6a1a14';c.fillRect(-L/2,-Wd/2+2,2,5);c.fillRect(-L/2,Wd/2-7,2,5);
    c.fillStyle='rgba(255,255,255,.08)';c.fillRect(-L/2+2,-Wd/2+1,L-4,3);}
  if(P.inCar){c.fillStyle='#2a2420';c.beginPath();c.arc(-6,-5,5.5,0,6.283);c.fill();c.fillStyle='#a8734f';c.fillRect(-2,-9,3,3);}
  c.restore();
  if(!V.ok&&!V.dead&&G.flags&&G.flags.metTiao&&!P.inCar){const a=.4+Math.sin(renderT*4)*.25;c.strokeStyle=`rgba(212,154,60,${a})`;c.lineWidth=2;c.beginPath();c.arc(V.x,V.y,34,0,6.283);c.stroke();}
}
// praia: corpos na areia, pranchas largadas e gente parada dentro do mar
function drawBeach(inView){
  for(const b of beachDeco){if(!inView(b.x,b.y,40))continue;
    ctx.save();ctx.translate(b.x,b.y);ctx.rotate(b.rot);
    if(b.k==='corpo'){ctx.fillStyle='rgba(70,10,8,.45)';ctx.beginPath();ctx.ellipse(4,2,16,9,0,0,6.283);ctx.fill();ctx.fillStyle=b.seed>.5?'#4a5560':'#5a4a3a';ctx.beginPath();ctx.ellipse(0,0,11,6,0,0,6.283);ctx.fill();ctx.fillStyle='#8a8a7a';ctx.beginPath();ctx.arc(12,0,4.5,0,6.283);ctx.fill();ctx.strokeStyle='#8a8a7a';ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(2,-5);ctx.lineTo(8,-12);ctx.moveTo(-8,4);ctx.lineTo(-16,6);ctx.stroke();}
    else{ctx.fillStyle=b.seed>.5?'#c8b070':'#5a8ab0';ctx.beginPath();ctx.ellipse(0,0,22,5.5,0,0,6.283);ctx.fill();ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-18,-.5,36,1);}
    ctx.restore();}
  for(const f of seaFigs){if(!inView(f.x,f.y,40))continue;
    const sink=(Math.sin(renderT*.25+f.ph)+1)*.5, bob=Math.sin(renderT*1.3+f.ph)*1.5;
    ctx.globalAlpha=.55+(G.light||0)*.45;ctx.fillStyle='#06080a';
    ctx.beginPath();ctx.ellipse(f.x,f.y+bob,7*f.s,5*f.s,0,0,6.283);ctx.fill();
    ctx.beginPath();ctx.arc(f.x+1,f.y-2*f.s+bob,4.5*f.s*(1-sink*.3),0,6.283);ctx.fill();
    ctx.strokeStyle='rgba(150,170,180,.18)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(f.x,f.y+3+bob,10*f.s,3,0,0,6.283);ctx.stroke();
    ctx.globalAlpha=1;}
}
function drawVulto(){
  const v=G.vulto; if(!v)return; if(!fovSees(v.x,v.y,10))return; const a=Math.min(1,(9-v.life)*1.5)*(v.life<1?v.life:1);
  ctx.save();ctx.translate(v.x,v.y);ctx.rotate(v.face);ctx.globalAlpha=a;
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.beginPath();ctx.ellipse(3,4,14,9,0,0,6.283);ctx.fill();
  ctx.fillStyle=v.beach?'#0b1416':'#07080a';ctx.beginPath();ctx.ellipse(0,0,9,13,0,0,6.283);ctx.fill();
  ctx.beginPath();ctx.arc(3,0,7,0,6.283);ctx.fill();
  ctx.strokeStyle=ctx.fillStyle;ctx.lineWidth=3.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-11);ctx.lineTo(2,-20);ctx.moveTo(0,11);ctx.lineTo(2,20);ctx.stroke();
  ctx.fillStyle='rgba(235,230,220,.85)';ctx.beginPath();ctx.arc(8,-2.4,1.1,0,6.283);ctx.arc(8,2.4,1.1,0,6.283);ctx.fill();
  ctx.restore();
}
// cenário alto: roda-gigante, Cristo Luz e o bondinho
function drawLandmarks(){
  const z=view.z, inV=(x,y,m)=>x>cam.x-m&&x<cam.x+view.w/z+m&&y>cam.y-m&&y<cam.y+view.h/z+m, c=ctx;
  if(LM.roda&&inV(LM.roda.x,LM.roda.y,300)){
    const cx=LM.roda.x,cy=LM.roda.y,R=190,rot=renderT*.05;
    c.fillStyle='rgba(0,0,0,.3)';c.beginPath();c.arc(cx+24,cy+28,R,0,6.283);c.fill();
    c.strokeStyle='#8a8d92';c.lineWidth=5;c.beginPath();c.arc(cx,cy,R,0,6.283);c.stroke();
    c.lineWidth=2;c.beginPath();c.arc(cx,cy,R-14,0,6.283);c.stroke();
    c.strokeStyle='rgba(160,165,170,.7)';c.lineWidth=1.5;
    for(let i=0;i<16;i++){const a=rot+i*Math.PI/8;c.beginPath();c.moveTo(cx,cy);c.lineTo(cx+Math.cos(a)*R,cy+Math.sin(a)*R);c.stroke();}
    for(let i=0;i<16;i++){const a=rot+i*Math.PI/8,x=cx+Math.cos(a)*R,y=cy+Math.sin(a)*R;c.fillStyle=i%3?'#5a6670':'#7a3a2a';rrect(c,x-9,y-7,18,14,3);c.fill();
      if(i%4===0&&Math.sin(renderT*2+i)>-.2){c.fillStyle='rgba(255,90,160,.75)';c.fillRect(x-2,y-2,4,4);}}
    c.fillStyle='#4a4d52';c.beginPath();c.arc(cx,cy,16,0,6.283);c.fill();c.fillStyle='#2a2d30';c.beginPath();c.arc(cx,cy,7,0,6.283);c.fill();
  }
  if(LM.cristo&&inV(LM.cristo.x,LM.cristo.y,160)){
    const x=LM.cristo.x,y=LM.cristo.y;
    c.fillStyle='rgba(0,0,0,.35)';c.fillRect(x-38+10,y-8+12,76,16);c.fillRect(x-9+10,y-28+12,18,58);
    c.fillStyle='#d8d4c8';rrect(c,x-40,y-7,80,14,6);c.fill();rrect(c,x-10,y-28,20,58,8);c.fill();
    c.fillStyle='#ece8dc';c.beginPath();c.arc(x,y-16,8,0,6.283);c.fill();
    const hue=(renderT*20)%360;c.fillStyle=`hsla(${hue},70%,60%,.18)`;c.beginPath();c.arc(x,y,70,0,6.283);c.fill();
  }
}
function drawShopProps(inV){
  if(LM.atrio){const fx0=tc(119)-16,fy0=tc(295)-16; if(inV(fx0,fy0,80)){
    ctx.fillStyle='#5a5c5e';ctx.beginPath();ctx.arc(fx0,fy0,30,0,6.283);ctx.fill();ctx.fillStyle='#16303e';ctx.beginPath();ctx.arc(fx0,fy0,24,0,6.283);ctx.fill();
    for(let k=0;k<2;k++){const t=(renderT*.6+k*.5)%1;ctx.strokeStyle=`rgba(150,180,200,${.3*(1-t)})`;ctx.lineWidth=1;ctx.beginPath();ctx.arc(fx0,fy0,6+t*16,0,6.283);ctx.stroke();}
    ctx.fillStyle='#6a6c6e';ctx.beginPath();ctx.arc(fx0,fy0,6,0,6.283);ctx.fill();}}
  if(LM.cont&&inV(LM.cont.x,LM.cont.y,90)){
    const x=LM.cont.x,y=LM.cont.y,open=G.flags&&G.flags.shopEv;
    ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(x-44,y-42,96,96);
    ctx.fillStyle=open?'#2a2e30':'#d8d8d2';ctx.fillRect(x-48,y-48,96,96);
    ctx.fillStyle=open?'#1a1c1e':'#bdbdb6';for(let k=-40;k<48;k+=12)ctx.fillRect(x+k,y-48,3,96);
    if(open){ctx.fillStyle='#0b0c0d';ctx.beginPath();ctx.moveTo(x-30,y-48);ctx.lineTo(x+34,y-48);ctx.lineTo(x+22,y-8);ctx.lineTo(x-12,y-20);ctx.closePath();ctx.fill();
      ctx.strokeStyle='#8a8680';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-30,y-48);ctx.lineTo(x-44,y-70);ctx.moveTo(x+34,y-48);ctx.lineTo(x+52,y-66);ctx.stroke();
      ctx.fillStyle='rgba(120,20,16,.6)';ctx.beginPath();ctx.ellipse(x,y-30,22,10,0,0,6.283);ctx.fill();}
    else{ctx.fillStyle='#2e8a78';ctx.fillRect(x-48,y-6,96,12);ctx.fillStyle='#14201c';ctx.font='bold 13px "Barlow Condensed",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('VÉRTICE · T-07 · NÃO ABRIR',x,y+1);
      if(Math.sin(renderT*2)>.6){ctx.fillStyle='rgba(255,60,40,.9)';ctx.fillRect(x+38,y-44,5,5);}}
  }
}
function drawGraf(inV){
  ctx.textAlign='center';ctx.textBaseline='middle';
  for(const g of GRAF){if(!inV(g.x,g.y,260))continue;if(g.cond&&!g.cond())continue;
    ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.rot);ctx.font=`${Math.round(30*g.s)}px ${'"Special Elite","Courier New",monospace'}`;
    ctx.globalAlpha=.5;ctx.fillStyle=g.c;ctx.fillText(g.t,0,0);ctx.globalAlpha=.25;ctx.fillText(g.t,1.5,1.5);ctx.restore();}
  ctx.globalAlpha=1;
}
function drawPuddleBase(p){
  ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
  ctx.fillStyle='rgba(8,12,18,.5)';ctx.beginPath();ctx.ellipse(0,0,p.rx,p.ry,0,0,6.283);ctx.fill();
  ctx.strokeStyle='rgba(150,170,200,.12)';ctx.lineWidth=1;ctx.beginPath();ctx.ellipse(-p.rx*.2,-p.ry*.25,p.rx*.55,p.ry*.35,0,Math.PI*1.1,Math.PI*1.8);ctx.stroke();
  ctx.restore();
}
function drawWaterAnim(){
  const z=view.z, x0=Math.max(0,Math.floor(cam.x/TILE)-1), x1=Math.min(W-1,Math.ceil((cam.x+view.w/z)/TILE)+1);
  const y0=Math.max(0,Math.floor(cam.y/TILE)-1), y1=Math.min(HT-1,Math.ceil((cam.y+view.h/z)/TILE)+1);
  ctx.fillStyle='#14364a';
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(map[idx(x,y)]!==T.WATER)continue;const X=x*TILE,Y=y*TILE,w=Math.sin(renderT*1.4+x*.9+y*1.7);ctx.fillRect(X+5+w*3,Y+11+w*3,15,2);ctx.fillRect(X+16-w*3,Y+24-w*2,10,2);}
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(map[idx(x,y)]!==T.WATER)continue;const wt=getT(x-1,y);if(wt!==T.SAND&&wt!==T.ROCK)continue;
    const X=x*TILE,Y=y*TILE,f=(Math.sin(renderT*.9+y*.45)+1)*.5;ctx.fillStyle=`rgba(200,210,215,${.10+f*.14})`;ctx.fillRect(X-2,Y,4+f*12,TILE);ctx.fillStyle='rgba(200,210,215,.06)';ctx.fillRect(X+8+f*12,Y+4,3,TILE-8);}
}
function drawPuddles(){
  if(!Q.ripples)return;
  const z=view.z, x0=cam.x-60,y0=cam.y-60,x1=cam.x+view.w/z+60,y1=cam.y+view.h/z+60;
  for(const p of puddles){
    if(p.x<x0||p.x>x1||p.y<y0||p.y>y1)continue;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot);
    for(let k=0;k<2;k++){const t=(renderT*1.1+p.ph+k*.5)%1;const rx=(p.rx*.15)+t*p.rx*.35;ctx.strokeStyle=`rgba(170,190,215,${.22*(1-t)})`;ctx.beginPath();ctx.ellipse(Math.sin(p.ph*7+k*3)*p.rx*.4,Math.cos(p.ph*5+k)*p.ry*.3,rx,rx*.5,0,0,6.283);ctx.stroke();}
    ctx.restore();
  }
}
let fogC=null, grainP=null;
function makeFog(){
  fogC=document.createElement('canvas');fogC.width=512;fogC.height=512;const c=fogC.getContext('2d');
  for(let i=0;i<34;i++){const x=Math.random()*512,y=Math.random()*512,r=50+Math.random()*110;
    for(const [ox,oy] of [[0,0],[512,0],[-512,0],[0,512],[0,-512]]){const g=c.createRadialGradient(x+ox,y+oy,0,x+ox,y+oy,r);g.addColorStop(0,'rgba(140,155,180,.045)');g.addColorStop(1,'rgba(140,155,180,0)');c.fillStyle=g;c.fillRect(x+ox-r,y+oy-r,r*2,r*2);}}
  const gc=document.createElement('canvas');gc.width=160;gc.height=160;const g2=gc.getContext('2d');
  const img=g2.createImageData?g2.createImageData(160,160):null;
  if(img){for(let i=0;i<img.data.length;i+=4){const v=Math.random()*255;img.data[i]=v;img.data[i+1]=v;img.data[i+2]=v;img.data[i+3]=Math.random()<.5?18:0;}g2.putImageData(img,0,0);}
  try{grainP=ctx.createPattern(gc,'repeat');}catch(e){grainP=null;}
}
function drawFog(){
  if(!Q.fog)return;
  if(!fogC)makeFog();
  const z=view.z, ox=(renderT*14)%512, oy=(renderT*5)%512;
  const sx=Math.floor((cam.x-ox)/512)*512+ox, sy=Math.floor((cam.y-oy)/512)*512+oy;
  for(let y=sy;y<cam.y+view.h/z;y+=512)for(let x=sx;x<cam.x+view.w/z;x+=512)ctx.drawImage(fogC,x,y);
  if((G.coast||0)>.25){const ox2=(renderT*24)%512,sx2=Math.floor((cam.x-ox2)/512)*512+ox2;ctx.globalAlpha=Math.min(1,G.coast*1.2);for(let y=sy;y<cam.y+view.h/z;y+=512)for(let x=sx2;x<cam.x+view.w/z;x+=512)ctx.drawImage(fogC,x+256,y+128);ctx.globalAlpha=1;}
}
function drawGrain(){
  if(!Q.grain||!grainP||RM)return;
  ctx.save();ctx.translate((Math.random()*160)|0,(Math.random()*160)|0);ctx.fillStyle=grainP;ctx.fillRect(-160,-160,view.w+320,view.h+320);ctx.restore();
}
function drawHelipad(){
  const {x,y}=LM.pad;
  ctx.strokeStyle='#bdb7a2';ctx.lineWidth=6;ctx.beginPath();ctx.arc(x,y,104,0,6.283);ctx.stroke();
  ctx.fillStyle='#bdb7a2';ctx.fillRect(x-36,y-46,16,92);ctx.fillRect(x+20,y-46,16,92);ctx.fillRect(x-20,y-8,40,16);
}
function drawDecal(d){
  switch(d.k){
    case 'wreckHeli':{ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);ctx.fillStyle='#16180f';ctx.beginPath();ctx.ellipse(0,0,40,18,0,0,6.283);ctx.fill();ctx.fillRect(-74,-4,38,8);ctx.fillStyle='#0c0d0a';ctx.fillRect(-80,-14,10,28);
      ctx.strokeStyle='#22241c';ctx.lineWidth=5;ctx.beginPath();ctx.moveTo(-10,-50);ctx.lineTo(20,40);ctx.moveTo(-60,10);ctx.lineTo(50,-14);ctx.stroke();ctx.fillStyle='rgba(60,50,40,.8)';ctx.fillRect(14,-8,14,16);ctx.restore();} break;
    case 'blood':{ctx.fillStyle='rgba(84,12,10,.72)';ctx.beginPath();ctx.ellipse(d.x,d.y,d.r,d.r*.75,d.rot,0,6.283);ctx.fill();
      for(let i=0;i<4;i++){const a=d.rot+i*1.7+d.seed*3,rr2=d.r*(1+((d.seed*(i+3)*13)%1)*.6);ctx.beginPath();ctx.arc(d.x+Math.cos(a)*rr2,d.y+Math.sin(a)*rr2,d.r*.22,0,6.283);ctx.fill();}} break;
    case 'drop': ctx.fillStyle='rgba(84,12,10,.6)';ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,6.283);ctx.fill(); break;
    case 'drag':{ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);ctx.fillStyle='rgba(84,12,10,.6)';
      for(let i=0;i<7;i++){const w=10-i*.8;ctx.beginPath();ctx.ellipse(i*11,Math.sin(i+d.seed*6)*3,7,w*.6,0,0,6.283);ctx.fill();}
      ctx.fillStyle='rgba(60,8,6,.7)';for(const s of [-1,1]){ctx.fillRect(70,s*4-1,8,2);}ctx.restore();} break;
    case 'glass':{ctx.fillStyle='rgba(190,220,235,.5)';for(let i=0;i<9;i++){const a=d.rot+i*.7,r=d.r*(.3+((d.seed*(i+2)*7)%1)*.8);ctx.fillRect(d.x+Math.cos(a)*r,d.y+Math.sin(a)*r,2.5,1.5);}} break;
    case 'gib':{ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);ctx.fillStyle='rgba(84,12,10,.7)';ctx.beginPath();ctx.ellipse(0,0,d.r*1.4,d.r,0,0,6.283);ctx.fill();
      ctx.fillStyle=d.c||'#7a5a4a';ctx.beginPath();ctx.ellipse(0,0,d.r*.7,d.r*.38,0,0,6.283);ctx.fill();ctx.fillStyle='#d8cfc0';ctx.fillRect(d.r*.5,-1,d.r*.6,2);ctx.restore();} break;
    case 'hand':{ctx.fillStyle='rgba(110,14,10,.6)';ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);ctx.beginPath();ctx.ellipse(0,0,4,5,0,0,6.283);ctx.fill();for(let i=-2;i<=2;i++){ctx.fillRect(i*2.2-.8,-11,1.6,6);}ctx.restore();} break;
    case 'scorch':{const g=ctx.createRadialGradient(d.x,d.y,2,d.x,d.y,d.r);g.addColorStop(0,'rgba(0,0,0,.7)');g.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(d.x,d.y,d.r,0,6.283);ctx.fill();} break;
    case 'corpse':{ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);const s=d.r/12;ctx.scale(s,s);
      if(d.type==='cao'){ctx.fillStyle='#3a2e26';ctx.beginPath();ctx.ellipse(0,0,14,6,0,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(13,2,5,0,6.283);ctx.fill();}
      else{ctx.globalAlpha=.85;ctx.fillStyle=d.col;ctx.beginPath();ctx.ellipse(0,0,12,8,0,0,6.283);ctx.fill();ctx.fillStyle=d.skin;ctx.beginPath();ctx.arc(14,1,5.5,0,6.283);ctx.fill();
        ctx.strokeStyle=d.skin;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(4,-7);ctx.lineTo(10,-14);ctx.moveTo(-2,7);ctx.lineTo(4,14);ctx.stroke();
        ctx.strokeStyle='#2a2622';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-10,-3);ctx.lineTo(-20,-6);ctx.moveTo(-10,3);ctx.lineTo(-19,8);ctx.stroke();ctx.globalAlpha=1;}
      ctx.restore();} break;
  }
}
function drawPickup(p){
  const bob=Math.sin(renderT*3+p.x*.1)*1.5, x=p.x, y=p.y+bob;
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(p.x+2,p.y+6,9,4,0,0,6.283);ctx.fill();
  if(p.kind==='item'){
    const it=ITEMS[p.id];
    if(p.id==='garrafa'){ctx.save();ctx.translate(x,y);ctx.rotate(.6);ctx.fillStyle='#3e6a52';ctx.fillRect(-7,-3,11,6);ctx.fillRect(4,-1.5,5,3);ctx.fillStyle='rgba(220,255,230,.45)';ctx.fillRect(-6,-2,7,1.4);ctx.restore();return;}
    if(p.id==='gato'){ctx.fillStyle='#e0a860';ctx.beginPath();ctx.ellipse(x,y,9,6,0,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(x+8,y-3,5,0,6.283);ctx.fill();ctx.fillStyle='#b07840';ctx.fillRect(x+6,y-9,2,4);ctx.fillRect(x+10,y-9,2,4);ctx.strokeStyle='#e0a860';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(x-8,y);ctx.quadraticCurveTo(x-14,y-8,x-10,y-12);ctx.stroke();return;}
    if(it.k==='heal'||it.k==='mix'){ctx.fillStyle='#6a4a30';ctx.fillRect(x-6,y-1,12,8);ctx.fillStyle=it.c;ctx.beginPath();ctx.arc(x-3,y-3,4,0,6.283);ctx.arc(x+3,y-4,4,0,6.283);ctx.arc(x,y-7,4,0,6.283);ctx.fill();if(p.id==='spray'){ctx.fillStyle='#e6e2d6';ctx.fillRect(x-4,y-10,8,16);ctx.fillStyle='#b8261e';ctx.fillRect(x-3,y-3,6,2);ctx.fillRect(x-1,y-5,2,6);}return;}
    if(it.k==='key'){ctx.fillStyle=it.c;ctx.beginPath();ctx.arc(x-4,y,5,0,6.283);ctx.fill();ctx.fillRect(x,y-1.5,10,3);ctx.fillRect(x+7,y,2,4);ctx.fillStyle='#141516';ctx.beginPath();ctx.arc(x-4,y,2,0,6.283);ctx.fill();return;}
    ctx.fillStyle='#2a2a26';ctx.fillRect(x-8,y-6,16,12);ctx.fillStyle=it.c;ctx.fillRect(x-7,y-5,14,4);ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(x-7,y+1,14,1);
  } else if(p.kind==='weapon'){
    const id=WEAPONS[p.id].id,M=WMODEL[id];ctx.save();ctx.translate(x,y);ctx.rotate(-.35);ctx.scale(1.15,1.15);ctx.translate(-(M.len-8)/2,0);drawWeaponModel(ctx,id,true,false);ctx.restore();
  } else if(p.kind==='file'){
    ctx.save();ctx.translate(x,y);ctx.rotate(.2);ctx.fillStyle='#d8cfb8';ctx.fillRect(-7,-9,14,18);ctx.fillStyle='#7a7466';for(let i=0;i<4;i++)ctx.fillRect(-5,-6+i*4,10,1);ctx.restore();
  } else if(p.kind==='walkie'){
    ctx.fillStyle='#22262a';rrect(ctx,x-5,y-8,10,16,2);ctx.fill();ctx.fillStyle='#3a3f44';ctx.fillRect(x-3,y-5,6,5);ctx.fillStyle='#111';ctx.fillRect(x+2,y-14,2,7);
    ctx.fillStyle=(renderT*3|0)%2?'#e04a3a':'#5a1a14';ctx.fillRect(x-3,y+2,2,2);
  } else if(p.kind==='bag'){
    ctx.fillStyle='#6a4428';rrect(ctx,x-8,y-6,16,13,4);ctx.fill();ctx.fillStyle='#8a5a34';ctx.fillRect(x-8,y-6,16,4);ctx.fillStyle='#c9a24a';ctx.fillRect(x-1,y-3,3,3);
  }
}
function drawHuman(x,y,a,o){
  ctx.save();ctx.translate(x,y);ctx.rotate(a);const s=(o.s||1)*(o.crouch?.84:1);ctx.scale(s,s);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(2,3,12,11,0,0,6.283);ctx.fill();
  if(o.crouch){
    // agachado: joelhos dobrados pra frente, pés pra trás, corpo curvado e cabeça baixa
    const sw=Math.sin(o.walk||0)*(o.moving?2.5:0);
    ctx.fillStyle=o.pants;ctx.beginPath();ctx.ellipse(6+sw,-6,5,3.6,.35,0,6.283);ctx.ellipse(6-sw,6,5,3.6,-.35,0,6.283);ctx.fill();
    ctx.fillStyle='#121214';ctx.beginPath();ctx.ellipse(-7,-7,3.4,2.6,0,0,6.283);ctx.ellipse(-7,7,3.4,2.6,0,0,6.283);ctx.fill();
    ctx.fillStyle=o.pants;ctx.beginPath();ctx.ellipse(-2,-6.5,5,3,0,0,6.283);ctx.ellipse(-2,6.5,5,3,0,0,6.283);ctx.fill();
  } else if(o.legAng!=null){
    const sw=Math.sin(o.walk||0)*(o.moving?6.5:0);
    ctx.save();ctx.rotate(o.legAng-a);
    ctx.fillStyle=o.pants;
    ctx.beginPath();ctx.ellipse(sw*.5,-4.5,6,3.4,0,0,6.283);ctx.ellipse(-sw*.5,4.5,6,3.4,0,0,6.283);ctx.fill();
    ctx.fillStyle='#121214';ctx.beginPath();ctx.ellipse(sw+3,-4.5,3.6,2.8,0,0,6.283);ctx.ellipse(-sw+3,4.5,3.6,2.8,0,0,6.283);ctx.fill();
    ctx.fillStyle=o.pants;ctx.beginPath();ctx.ellipse(0,0,4.5,8,0,0,6.283);ctx.fill();
    ctx.restore();
  } else {
    const sw=Math.sin(o.walk||0)*(o.moving?5:0);
    ctx.fillStyle=o.pants;ctx.beginPath();ctx.ellipse(sw,-5,4,3,0,0,6.283);ctx.ellipse(-sw,5,4,3,0,0,6.283);ctx.fill();
  }
  if(o.zombie){
    const reach=o.attack?6:0, wob=Math.sin((o.walk||0)*.7)*2;
    ctx.strokeStyle=o.skin;ctx.lineWidth=3.5;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(2,-7);ctx.lineTo(15+reach,-6+wob);ctx.moveTo(2,7);ctx.lineTo(14+reach,6-wob);ctx.stroke();
  } else if(o.wid&&o.wid!=='faca'){
    const rec=-(o.recoil||0)*.6, M=WMODEL[o.wid]||{fore:0}, gx=11+rec, gy=1.5;
    const fx=M.fore?gx+M.fore:gx+1.5, fy=M.fore?0:-1;
    ctx.strokeStyle=o.coat;ctx.lineWidth=4;ctx.lineCap='round';
    ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(gx,gy+1);ctx.moveTo(0,-8);ctx.lineTo(fx,fy-1);ctx.stroke();
    ctx.save();ctx.translate(gx,gy);drawWeaponModel(ctx,o.wid,o.loaded!==false,o.firing);ctx.restore();
    ctx.fillStyle=o.skin;ctx.beginPath();ctx.arc(gx,gy+1,2.4,0,6.283);ctx.fill();ctx.beginPath();ctx.arc(fx,fy,2.4,0,6.283);ctx.fill();
  } else if(o.knife){
    const sl=o.slash>0?(1-o.slash/.16):0, ka=-1.1+sl*2.2;
    ctx.strokeStyle=o.coat;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,8);ctx.lineTo(9+Math.cos(ka)*4,8+Math.sin(ka)*6);ctx.moveTo(0,-8);ctx.lineTo(5,-10);ctx.stroke();
    ctx.save();ctx.translate(9,6);ctx.rotate(ka);ctx.fillStyle='#c8ccd0';ctx.fillRect(2,-1,12,2.5);ctx.fillStyle='#2a2a2a';ctx.fillRect(-2,-1.5,5,3.5);ctx.restore();
  } else {
    ctx.strokeStyle=o.coat;ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(0,-8);ctx.lineTo(5,-10);ctx.moveTo(0,8);ctx.lineTo(5,10);ctx.stroke();
  }
  if(o.pack&&o.wid!=='chamas'){ctx.fillStyle='#a8322b';rrect(ctx,-15,-7.5,9,15,2);ctx.fill();ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(-15,-1,9,2);ctx.fillStyle='#6a1e18';ctx.fillRect(-15,-7.5,2,15);}
  ctx.fillStyle=o.coat;ctx.beginPath();if(o.crouch)ctx.ellipse(-1.5,0,9,10,0,0,6.283);else ctx.ellipse(0,0,7,10.5,0,0,6.283);ctx.fill();
  if(o.crouch){ctx.fillStyle='rgba(0,0,0,.28)';ctx.beginPath();ctx.ellipse(-4,0,4,8.5,0,0,6.283);ctx.fill();ctx.translate(2.6,0);}
  ctx.fillStyle='rgba(255,255,255,.06)';ctx.beginPath();ctx.ellipse(-1,-2,4,7,0,0,6.283);ctx.fill();
  if(o.richard){ctx.strokeStyle='#c8344a';ctx.lineWidth=1.3;ctx.beginPath();ctx.arc(0,0,8.6,-1.7,-1.0);ctx.stroke();ctx.beginPath();ctx.arc(0,0,8.6,1.0,1.7);ctx.stroke();
}
  if(o.hazmat){
    ctx.fillStyle=o.coat;ctx.beginPath();ctx.arc(1,0,7.4,0,6.283);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.25)';ctx.lineWidth=1;ctx.stroke();
    ctx.fillStyle=o.mask?'#15181a':'rgba(24,34,44,.92)';ctx.beginPath();ctx.ellipse(4.4,0,3.1,4.8,0,0,6.283);ctx.fill();
    ctx.fillStyle='rgba(190,225,255,.4)';ctx.fillRect(4.6,-3.4,1.2,2.6);
    if(o.mask){ctx.fillStyle='#2a2e30';ctx.beginPath();ctx.arc(7,0,2.2,0,6.283);ctx.fill();}
    ctx.restore();return;
  }
  ctx.fillStyle=o.skin;ctx.beginPath();ctx.arc(1,0,6,0,6.283);ctx.fill();
  if(o.look==='math'){ctx.strokeStyle='#8ac4ea';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(1,0,7.6,-.9,.9);ctx.stroke();ctx.fillStyle='#16181c';ctx.fillRect(-3,-10.4,5,3);ctx.fillRect(-3,7.4,5,3);
    ctx.strokeStyle='#121316';ctx.lineWidth=1.8;ctx.beginPath();ctx.arc(-1.5,0,7.4,Math.PI*.6,Math.PI*1.4);ctx.stroke();ctx.fillStyle='#1c1d22';ctx.beginPath();ctx.arc(-1,-7.4,2.4,0,6.283);ctx.arc(-1,7.4,2.4,0,6.283);ctx.fill();}
  if(typeof LOOKX!=='undefined'&&LOOKX[o.look]){LOOKX[o.look](o);}
  else if(o.look==='edu'){ctx.fillStyle=o.hair;ctx.beginPath();ctx.ellipse(-2.2,0,5.6,7.4,0,0,6.283);ctx.fill();ctx.beginPath();ctx.ellipse(-.5,-6.4,3.4,2.2,.3,0,6.283);ctx.ellipse(-.5,6.4,3.4,2.2,-.3,0,6.283);ctx.fill();
    ctx.fillStyle=o.skin;ctx.beginPath();ctx.arc(1.4,0,4.6,-1.1,1.1);ctx.fill();ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(-6.5,0);ctx.lineTo(-.5,0);ctx.stroke();}
  else if(!o.noHair){ctx.fillStyle=o.hair;ctx.beginPath();ctx.arc(-.5,0,5.6,Math.PI*.55,Math.PI*1.45);ctx.lineTo(-.5,0);ctx.fill();ctx.beginPath();ctx.arc(-1,0,4.5,0,6.283);ctx.fill();}
  if(o.richard){for(const [cx2,cy2,cr] of [[-2.5,-3.5,2.3],[-2.5,3.5,2.3],[.5,-3.6,2.1],[.5,3.6,2.1],[3,-1.8,1.8],[3.2,1.2,1.7],[-4.2,0,2.4]]){ctx.beginPath();ctx.arc(cx2,cy2,cr,0,6.283);ctx.fill();}
    ctx.fillStyle='rgba(160,120,80,.35)';for(const [cx2,cy2] of [[-2,-3],[1,2],[-3.5,1.5],[2,-1]]){ctx.beginPath();ctx.arc(cx2,cy2,.9,0,6.283);ctx.fill();}}
  ctx.restore();
}
function drawEnemy(e){
  const a=e.face, wk=e.anim*(e.state==='chase'?7:3)*(e.t.spd/50);
  // corpos deitados sempre aparecem (senão daria pra saber quem vai levantar)
  if(e.state==='dorm'){const tw=Math.sin(renderT*13+e.x)>.97&&e.va>.5?Math.sin(renderT*60)*1.5:0;drawDecal({k:'corpse',x:e.x+tw,y:e.y,rot:e.face,type:e.type,col:e.t.col,skin:e.t.skin,r:e.r});return;}
  const va=e.va??1; if(va<=.01)return;
  ctx.save();
  ctx.globalAlpha=va*(e.rising>0?clamp(1-e.rising/.8*.5,0,1):1);
  switch(e.type){
    case 'cao':{ctx.translate(e.x,e.y);ctx.rotate(a);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(1,3,15,7,0,0,6.283);ctx.fill();
      const l=Math.sin(wk*1.4)*4;ctx.fillStyle='#2c231c';for(const [lx,ly] of [[7,-5],[7,5],[-7,-5],[-7,5]]){ctx.fillRect(lx+(lx>0?l:-l)-2,ly+(ly>0?0:-2),4,3);}
      ctx.fillStyle=e.t.col;ctx.beginPath();ctx.ellipse(0,0,13,6,0,0,6.283);ctx.fill();ctx.fillStyle=e.t.skin;ctx.beginPath();ctx.ellipse(12,0,6,4.5,0,0,6.283);ctx.fill();
      ctx.fillStyle='#7a1a14';ctx.beginPath();ctx.ellipse(-3,-2,4,2,0,0,6.283);ctx.fill();
      ctx.strokeStyle=e.t.col;ctx.lineWidth=2.5;ctx.beginPath();ctx.moveTo(-12,0);ctx.lineTo(-18,Math.sin(wk)*4);ctx.stroke();} break;
    case 'gordo':case 'incha':{ctx.translate(e.x,e.y);ctx.rotate(a);if(e.type==='gordo')ctx.scale(2.05,2.05);ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.arc(3,4,18,0,6.283);ctx.fill();
      ctx.strokeStyle=e.t.skin;ctx.lineWidth=5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(4,-14);ctx.lineTo(17,-12);ctx.moveTo(4,14);ctx.lineTo(17,12);ctx.stroke();
      const pul=1+Math.sin(e.anim*5)*.04;ctx.fillStyle=e.t.col;ctx.beginPath();ctx.arc(0,0,16*pul,0,6.283);ctx.fill();
      ctx.fillStyle=e.t.skin;ctx.beginPath();ctx.arc(-1,0,13*pul,0,6.283);ctx.fill();
      ctx.fillStyle='#c4d45a';for(const [px,py,pr] of [[-5,-6,3],[3,5,4],[-6,6,2.5],[4,-4,2]]){ctx.beginPath();ctx.arc(px,py,pr,0,6.283);ctx.fill();}
      ctx.fillStyle='#6a7a3a';ctx.beginPath();ctx.arc(10,0,5,0,6.283);ctx.fill();} break;
    case 'rast':{ctx.translate(e.x,e.y);ctx.rotate(a);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(-2,2,16,8,0,0,6.283);ctx.fill();
      ctx.strokeStyle='#2a2620';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-8,-3);ctx.lineTo(-20,-4+Math.sin(wk)*2);ctx.moveTo(-8,3);ctx.lineTo(-19,5-Math.sin(wk)*2);ctx.stroke();
      ctx.fillStyle=e.t.col;ctx.beginPath();ctx.ellipse(-2,0,11,7,0,0,6.283);ctx.fill();
      const rc=Math.sin(wk)*5;ctx.strokeStyle=e.t.skin;ctx.lineWidth=3.5;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(4,-6);ctx.lineTo(14+rc,-11);ctx.moveTo(4,6);ctx.lineTo(14-rc,11);ctx.stroke();
      ctx.fillStyle=e.t.skin;ctx.beginPath();ctx.arc(9,0,5.5,0,6.283);ctx.fill();} break;
    case 'esfol':{ctx.translate(e.x,e.y);ctx.rotate(a);const sc=1.05;ctx.scale(sc,sc);
      ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(0,3,18,10,0,0,6.283);ctx.fill();
      const l=Math.sin(wk*1.3)*5;ctx.strokeStyle='#7a2a26';ctx.lineWidth=3.5;ctx.lineCap='round';
      for(const [sx,sy,dir] of [[8,-6,-1],[8,6,1],[-8,-6,-1],[-8,6,1]]){ctx.beginPath();ctx.moveTo(sx,sy);ctx.lineTo(sx+(sx>0?l:-l)+4,sy+dir*9);ctx.stroke();}
      ctx.strokeStyle='#e8d8c0';ctx.lineWidth=1.5;for(const sy of [-15,15]){ctx.beginPath();ctx.moveTo(12+(sy<0?l:-l)+4,sy*1);ctx.lineTo(18+(sy<0?l:-l),sy*1.15);ctx.stroke();}
      ctx.fillStyle=e.t.col;ctx.beginPath();ctx.ellipse(-1,0,14,8,0,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(30,0,0,.45)';ctx.lineWidth=1;for(let i=-8;i<=6;i+=4){ctx.beginPath();ctx.moveTo(i,-6);ctx.lineTo(i+2,6);ctx.stroke();}
      ctx.fillStyle=e.t.skin;ctx.beginPath();ctx.ellipse(12,0,7,6,0,0,6.283);ctx.fill();
      ctx.fillStyle='#e0a0a0';for(const [bx,by] of [[11,-2],[13,2],[10,2]]){ctx.beginPath();ctx.arc(bx,by,2.2,0,6.283);ctx.fill();}
      const tg=Math.sin(renderT*9+e.x)*4;ctx.strokeStyle='#c8506a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(18,0);ctx.quadraticCurveTo(26,tg,32+(e.mode==='leap'?8:0),-tg*.5);ctx.stroke();
      if(e.state==='chase'&&e.heard>0){ctx.strokeStyle='rgba(255,90,70,.25)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,22+Math.sin(renderT*8)*2,0,6.283);ctx.stroke();}
      } break;
    case 'boss':{ctx.translate(e.x,e.y);ctx.rotate(a);ctx.scale(e.r/32,e.r/32);
      ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(4,6,40,34,0,0,6.283);ctx.fill();
      const pul=1+Math.sin(e.anim*3)*.03, sw=Math.sin(wk*.6)*6;
      ctx.fillStyle='#2a1c20';ctx.beginPath();ctx.ellipse(-4+sw*.3,-22,10,8,0,0,6.283);ctx.ellipse(-4-sw*.3,22,10,8,0,0,6.283);ctx.fill();
      const arm=e.mode==='slamT'?12-e.mt*10:0;
      ctx.strokeStyle='#5a3438';ctx.lineWidth=13;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(4,-22);ctx.quadraticCurveTo(24,-34,40+arm,-18);ctx.stroke();
      ctx.fillStyle='#c8b8a8';for(let i=0;i<3;i++){ctx.beginPath();ctx.moveTo(38+arm,-24+i*5);ctx.lineTo(52+arm,-26+i*6);ctx.lineTo(40+arm,-20+i*5);ctx.fill();}
      ctx.strokeStyle='#4a2c30';ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(4,20);ctx.lineTo(26,26+sw);ctx.stroke();
      ctx.fillStyle=e.t.col;ctx.beginPath();ctx.ellipse(0,0,28*pul,30*pul,0,0,6.283);ctx.fill();
      ctx.fillStyle=e.t.skin;ctx.beginPath();ctx.ellipse(2,-4,20*pul,22*pul,0,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(120,20,30,.55)';ctx.lineWidth=2;for(let i=0;i<5;i++){ctx.beginPath();ctx.moveTo(-14+i*6,-18);ctx.quadraticCurveTo(-10+i*6,0,-16+i*7,16);ctx.stroke();}
      ctx.fillStyle='#d8c04a';ctx.beginPath();ctx.arc(16,-2,7,0,6.283);ctx.fill();ctx.fillStyle='#1a1008';ctx.beginPath();ctx.arc(18,-2,3,0,6.283);ctx.fill();
      ctx.fillStyle='#3a1a1c';ctx.beginPath();ctx.arc(20,12,5,0,6.283);ctx.fill();
      if(e.mode==='slamT'){ctx.strokeStyle=`rgba(255,80,50,${.5+Math.sin(renderT*30)*.3})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,175,0,6.283);ctx.stroke();}
      } break;
    case 'brut':drawHuman(e.x,e.y,a,{coat:e.t.col,skin:e.t.skin,hair:'#5a4038',pants:'#2a2420',walk:wk,moving:true,zombie:true,attack:e.hitAnim>0||e.mode==='charge',s:1.65});
      if(e.mode==='tele'){ctx.strokeStyle='rgba(220,60,40,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(e.x,e.y,e.r+6+Math.sin(renderT*30)*2,0,6.283);ctx.stroke();} break;
    case 'pers':{const down=e.down>0;
      if(down){ctx.translate(e.x,e.y);ctx.rotate(a);ctx.fillStyle='#1b1e20';ctx.beginPath();ctx.ellipse(0,0,22,13,0,0,6.283);ctx.fill();ctx.fillStyle='#121314';ctx.beginPath();ctx.arc(22,4,11,0,6.283);ctx.fill();break;}
      drawHuman(e.x,e.y,a,{coat:'#1b1e20',skin:'#5a5550',hair:'#121314',pants:'#121314',walk:wk*.8,moving:true,zombie:false,s:1.75});
      ctx.translate(e.x,e.y);ctx.rotate(a);ctx.scale(1.75,1.75);
      ctx.strokeStyle='#1b1e20';ctx.lineWidth=4.5;ctx.lineCap='round';const p=e.hitAnim>0?5:0;ctx.beginPath();ctx.moveTo(0,-9);ctx.lineTo(8+p,-11);ctx.moveTo(0,9);ctx.lineTo(8+p,11);ctx.stroke();
      ctx.fillStyle='#4a4540';ctx.beginPath();ctx.arc(9+p,-11,3.2,0,6.283);ctx.arc(9+p,11,3.2,0,6.283);ctx.fill();
      ctx.fillStyle='#101112';ctx.beginPath();ctx.arc(1,0,9.5,0,6.283);ctx.fill();ctx.fillStyle='#1e2124';ctx.beginPath();ctx.arc(1,0,6,0,6.283);ctx.fill();ctx.fillStyle='#2a2e32';ctx.fillRect(-4.5,-1,11,2);} break;
    case 'enferm':{drawHuman(e.x,e.y,a,{coat:e.t.col,skin:e.t.skin,hair:'#2a2420',pants:'#b8b2a4',walk:wk*.7,moving:true,zombie:true,attack:e.hitAnim>0||e.mode==='charge',s:2.45});
      ctx.translate(e.x,e.y);ctx.rotate(a);ctx.fillStyle='rgba(130,20,16,.55)';for(const [bx,by,br] of [[-6,-8,7],[4,10,6],[-10,6,5]]){ctx.beginPath();ctx.arc(bx,by,br,0,6.283);ctx.fill();}
      ctx.fillStyle='#e8e4da';ctx.fillRect(-4,-4,8,8);ctx.fillStyle='#b8261e';ctx.fillRect(-1,-3.5,2,7);ctx.fillRect(-3.5,-1,7,2);
      if(e.mode==='tele'){ctx.strokeStyle='rgba(220,60,40,.85)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,e.r+10+Math.sin(renderT*30)*3,0,6.283);ctx.stroke();}} break;
    case 'pescador':{drawHuman(e.x,e.y,a,{coat:e.t.col,skin:e.t.skin,hair:'#1a2a24',pants:'#1a2426',walk:wk*.6,moving:true,zombie:true,attack:e.hitAnim>0,s:2.6});
      ctx.translate(e.x,e.y);ctx.rotate(a);ctx.strokeStyle='rgba(150,140,110,.55)';ctx.lineWidth=1;for(let i=-3;i<=3;i++){ctx.beginPath();ctx.moveTo(-26,i*7);ctx.lineTo(-6,i*7+3);ctx.stroke();ctx.beginPath();ctx.moveTo(-24+i*3,-22);ctx.lineTo(-20+i*3,22);ctx.stroke();}
      ctx.strokeStyle='rgba(60,110,70,.9)';ctx.lineWidth=2.2;for(const [sx,sy,k] of [[-10,-16,1],[-6,14,-1],[4,-20,1],[0,18,-1]]){ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(sx-10,sy+k*6+Math.sin(renderT*2+sx)*3,sx-22,sy+k*3);ctx.stroke();}
      ctx.strokeStyle='#5a4a3a';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(12,14);ctx.lineTo(52,22);ctx.stroke();ctx.fillStyle='#9a9a96';ctx.beginPath();ctx.moveTo(52,22);ctx.lineTo(60,20);ctx.lineTo(54,26);ctx.fill();
      if(Math.random()<.2)parts.push({k:'acid',x:e.x+rr(-20,20),y:e.y+rr(-20,20),vx:0,vy:0,life:.5,max:.5,s:2,c:'#7aa8b8'});} break;
    case 'afog':drawHuman(e.x,e.y,a,{coat:e.t.col,skin:e.t.skin,hair:'#1e2e26',pants:'#1c2628',walk:wk*.8,moving:e.state==='chase'||!e.idle,zombie:true,attack:e.hitAnim>0,s:1.08});
      ctx.translate(e.x,e.y);ctx.rotate(a);ctx.strokeStyle='rgba(60,110,70,.85)';ctx.lineWidth=1.6;
      for(const [sx,sy,k] of [[-6,-8,1],[-3,8,-1],[2,-10,1]]){ctx.beginPath();ctx.moveTo(sx,sy);ctx.quadraticCurveTo(sx-6,sy+k*4+Math.sin(renderT*3+sx)*2,sx-12,sy+k*2);ctx.stroke();}
      if(Math.random()<.12)parts.push({k:'acid',x:e.x+rr(-6,6),y:e.y+rr(-6,6),vx:0,vy:0,life:.4,max:.4,s:1.6,c:'#7aa8b8'}); break;
    case 'manequim':{const ps=((e.uid||'m').charCodeAt(e.uid?e.uid.length-1:0)||3)%3;
      drawHuman(e.x,e.y,a,{coat:'#cdc3b0',skin:'#ddd3c1',hair:'#ddd3c1',pants:'#c2b8a4',walk:0,moving:false,noHair:true,s:1.06});
      ctx.translate(e.x,e.y);ctx.rotate(a);ctx.scale(1.06,1.06);ctx.strokeStyle='#d8cebb';ctx.lineWidth=3.2;ctx.lineCap='round';ctx.beginPath();
      if(ps===0){ctx.moveTo(1,-8);ctx.lineTo(12,-12);ctx.moveTo(1,8);ctx.lineTo(-4,15);}
      else if(ps===1){ctx.moveTo(1,-8);ctx.lineTo(14,-5);ctx.moveTo(1,8);ctx.lineTo(14,5);}
      else {ctx.moveTo(1,-8);ctx.lineTo(-2,-16);ctx.moveTo(1,8);ctx.lineTo(11,13);}
      ctx.stroke();ctx.fillStyle='rgba(60,50,40,.35)';ctx.beginPath();ctx.arc(1,-8,1.4,0,6.283);ctx.arc(1,8,1.4,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(90,80,70,.55)';ctx.lineWidth=.8;ctx.beginPath();ctx.moveTo(1,-5.5);ctx.lineTo(1,5.5);ctx.stroke();} break;
    case 'grita':drawHuman(e.x,e.y,a,{coat:e.t.col,skin:e.t.skin,hair:'#141012',pants:'#2a2226',walk:wk,moving:e.state==='chase'||!e.idle,zombie:true,attack:e.mode==='scream',s:.96});
      ctx.translate(e.x,e.y);ctx.rotate(a);ctx.strokeStyle='#141012';ctx.lineWidth=1.8;
      for(let i=-2;i<=2;i++){ctx.beginPath();ctx.moveTo(-2,i*2);ctx.quadraticCurveTo(-9,i*3+Math.sin(renderT*3+i)*1.5,-15,i*3.6);ctx.stroke();}
      if(e.mode==='scream'){const k=(renderT*3)%1;ctx.strokeStyle=`rgba(235,225,210,${.65*(1-k)})`;ctx.lineWidth=2;for(const rr2 of [14+k*34,30+k*34]){ctx.beginPath();ctx.arc(6,0,rr2,-.8,.8);ctx.stroke();}
        ctx.fillStyle='#120606';ctx.beginPath();ctx.ellipse(6.5,0,2.2,3.2,0,0,6.283);ctx.fill();} break;
    case 'soldado':drawHuman(e.x,e.y,a,{coat:e.t.col,skin:e.t.skin,hair:'#2f3a26',pants:'#2e3624',walk:wk,moving:e.state==='chase'||!e.idle,zombie:true,attack:e.hitAnim>0,s:1.04});
      ctx.translate(e.x,e.y);ctx.rotate(a);ctx.scale(1.04,1.04);ctx.strokeStyle='#262c1c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-5,-8);ctx.lineTo(5,8);ctx.moveTo(-5,8);ctx.lineTo(5,-8);ctx.stroke();
      ctx.fillStyle='#3a4530';ctx.beginPath();ctx.arc(.5,0,6.8,0,6.283);ctx.fill();ctx.fillStyle='rgba(255,255,255,.07)';ctx.beginPath();ctx.arc(-1,-2,3.4,0,6.283);ctx.fill(); break;
    case 'bombeiro':{const down=e.down>0;
      if(down){ctx.translate(e.x,e.y);ctx.rotate(a);ctx.fillStyle='#2a2016';ctx.beginPath();ctx.ellipse(0,0,24,14,0,0,6.283);ctx.fill();ctx.fillStyle='#6a5a1e';ctx.beginPath();ctx.arc(22,3,10,0,6.283);ctx.fill();if(Math.random()<.3)parts.push({k:'smoke',x:e.x+rr(-10,10),y:e.y,vx:rr(-8,8),vy:-30,life:1.4,max:1.4,s:rr(8,12),c:'#2a2826'});break;}
      drawHuman(e.x,e.y,a,{coat:'#2e2418',skin:'#4a2c22',hair:'#140e0a',pants:'#1e1a14',walk:wk*.8,moving:true,zombie:false,s:1.55});
      ctx.translate(e.x,e.y);ctx.rotate(a);ctx.scale(1.55,1.55);
      ctx.fillStyle='rgba(200,180,60,.55)';ctx.fillRect(-6,-8,3,16);ctx.fillRect(2,-8,3,16);
      const sw=e.hitAnim>0?Math.sin(e.hitAnim*12)*10:0;
      ctx.strokeStyle='#3a2a1a';ctx.lineWidth=2.6;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(2,8);ctx.lineTo(16+sw*.3,14+sw);ctx.stroke();
      ctx.save();ctx.translate(16+sw*.3,14+sw);ctx.rotate(.3+sw*.05);ctx.fillStyle='#8a8a86';ctx.beginPath();ctx.moveTo(0,-2);ctx.lineTo(9,-5);ctx.lineTo(9,4);ctx.lineTo(0,2);ctx.fill();ctx.fillStyle='rgba(140,20,14,.8)';ctx.fillRect(5,-4,4,7);ctx.restore();
      ctx.fillStyle='#5a4a16';ctx.beginPath();ctx.ellipse(1,0,7.5,7,0,0,6.283);ctx.fill();ctx.fillStyle='#3a300e';ctx.beginPath();ctx.ellipse(-3,0,3,8.5,0,0,6.283);ctx.fill();
      ctx.fillStyle='rgba(255,120,40,.7)';ctx.beginPath();ctx.arc(6,-2,1.3,0,6.283);ctx.arc(6,2,1.3,0,6.283);ctx.fill();
      if(Math.random()<.18)parts.push({k:'smoke',x:e.x+rr(-8,8),y:e.y+rr(-8,8),vx:rr(-10,10),vy:rr(-30,-15),life:1.2,max:1.2,s:rr(6,10),c:'#2a2826'});
      if(Math.random()<.05)parts.push({k:'fire',x:e.x+rr(-8,8),y:e.y+rr(-8,8),vx:0,vy:-30,life:.35,max:.35,s:3,c:'#ff8a2a'});} break;
    case 'ouvinte':{ctx.translate(e.x,e.y);ctx.rotate(a);const s=e.r/14;ctx.scale(s,s);
      // alta, magra, braços compridos arrastando, cabeça sem olhos virada pra ouvir
      const sw=Math.sin(wk*.7)*5, hot=e.state==='investigate', sn=e.sniff>0&&hot?Math.sin(renderT*14)*1.2:0, tilt=Math.sin(renderT*1.3+e.x)*.25;
      ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(1,4,22,15,0,0,6.283);ctx.fill();
      ctx.strokeStyle='#4a3e38';ctx.lineWidth=3.4;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(-4,-6);ctx.lineTo(-14+sw,-8);ctx.moveTo(-4,6);ctx.lineTo(-14-sw,8);ctx.stroke();
      ctx.strokeStyle=e.t.skin;ctx.lineWidth=2.6;
      const ar=e.hitAnim>0?10:0;
      ctx.beginPath();ctx.moveTo(2,-9);ctx.quadraticCurveTo(14,-20,28+ar,-16-sw*.4);ctx.moveTo(2,9);ctx.quadraticCurveTo(14,20,28+ar,16+sw*.4);ctx.stroke();
      ctx.strokeStyle='#e8dccb';ctx.lineWidth=1.2;for(const sg of [-1,1])for(let k=0;k<4;k++){ctx.beginPath();ctx.moveTo(28+ar,sg*(16+sw*.4*sg));ctx.lineTo(35+ar+k,sg*(12+k*2.5));ctx.stroke();}
      ctx.fillStyle=e.t.col;ctx.beginPath();ctx.ellipse(0,0,9,11,0,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(40,20,20,.5)';ctx.lineWidth=1;for(let i=-7;i<=7;i+=3.5){ctx.beginPath();ctx.moveTo(-6,i);ctx.lineTo(5,i+.8);ctx.stroke();}
      ctx.save();ctx.translate(9+sn,0);ctx.rotate(tilt);
      ctx.fillStyle=e.t.skin;ctx.beginPath();ctx.ellipse(0,0,6.4,7.4,0,0,6.283);ctx.fill();
      ctx.fillStyle='#b49a88';ctx.beginPath();ctx.ellipse(-2,-8.5,3.6,2.2,-.4,0,6.283);ctx.ellipse(-2,8.5,3.6,2.2,.4,0,6.283);ctx.fill();
      ctx.fillStyle='#3a1a18';ctx.beginPath();ctx.ellipse(-2,-8.5,1.6,1,-.4,0,6.283);ctx.ellipse(-2,8.5,1.6,1,.4,0,6.283);ctx.fill();
      ctx.strokeStyle='#5a2a24';ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(2,-3.5);ctx.lineTo(2.6,3.5);ctx.stroke();
      for(let k=-2;k<=2;k++){ctx.beginPath();ctx.moveTo(1,k*1.4);ctx.lineTo(4,k*1.4);ctx.stroke();}
      ctx.restore();
      if(hot&&e.hot){const k=(renderT*1.6)%1;ctx.strokeStyle=`rgba(230,220,200,${.18*(1-k)})`;ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(9,0,12+k*30,-1.2,1.2);ctx.stroke();}
      } break;
    case 'especime':{ctx.translate(e.x,e.y);ctx.rotate(a);const s=e.r/15;ctx.scale(s,s);
      const tele=e.mode==='tele', sw=Math.sin(wk*.8)*5, reach=e.mode==='leap'?8:e.hitAnim>0?6:0, cr=tele?.82:1;
      ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(2,4,22,14,0,0,6.283);ctx.fill();
      ctx.strokeStyle='#8a8276';ctx.lineWidth=3.2;ctx.lineCap='round';
      ctx.beginPath();ctx.moveTo(-6,-5);ctx.lineTo(-15+sw,-11);ctx.lineTo(-22+sw,-8);ctx.moveTo(-6,5);ctx.lineTo(-15-sw,11);ctx.lineTo(-22-sw,8);ctx.stroke();
      ctx.strokeStyle='#cfc6b8';ctx.lineWidth=2.6;ctx.beginPath();ctx.moveTo(3,-7);ctx.quadraticCurveTo(12,-16,22+reach,-13+sw*.3);ctx.moveTo(3,7);ctx.quadraticCurveTo(12,16,22+reach,13-sw*.3);ctx.stroke();
      ctx.fillStyle='#ece4d4';for(const sg of [-1,1]){ctx.beginPath();ctx.moveTo(21+reach,sg*13);ctx.lineTo(33+reach,sg*10);ctx.lineTo(22+reach,sg*15.5);ctx.fill();}
      ctx.fillStyle=e.t.col;ctx.beginPath();ctx.ellipse(0,0,12*cr,6.6,0,0,6.283);ctx.fill();
      ctx.strokeStyle='rgba(90,60,60,.45)';ctx.lineWidth=1;for(let i=-6;i<=6;i+=3){ctx.beginPath();ctx.moveTo(i,-5.5);ctx.quadraticCurveTo(i+1.5,0,i,5.5);ctx.stroke();}
      ctx.fillStyle='#9a9286';for(let i=-9;i<=5;i+=3.5){ctx.beginPath();ctx.arc(i,0,1.6,0,6.283);ctx.fill();}
      ctx.fillStyle=e.t.skin;ctx.beginPath();ctx.ellipse(13*cr,0,6,4,0,0,6.283);ctx.fill();
      ctx.fillStyle=tele?`rgba(255,60,40,${.7+Math.sin(renderT*30)*.3})`:'#3a1414';ctx.beginPath();ctx.ellipse(16.5*cr,0,1.6,2.8,0,0,6.283);ctx.fill();
      if(tele){ctx.strokeStyle='rgba(220,60,40,.8)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,26+Math.sin(renderT*30)*2,0,6.283);ctx.stroke();}} break;
    case 'cusp':drawHuman(e.x,e.y,a,{coat:e.t.col,skin:e.t.skin,hair:'#2f3a30',pants:'#22261f',walk:wk,moving:e.state==='chase'||!e.idle,zombie:true,attack:e.c2>1.8,s:1});
      ctx.translate(e.x,e.y);ctx.rotate(a);ctx.fillStyle='#b4e04a';ctx.beginPath();ctx.arc(6,0,2.5+Math.max(0,1.2-e.c2)*1.5,0,6.283);ctx.fill(); break;
    default:if(e.state==='feed'){const ch=Math.sin(renderT*7+e.x)>.2;drawHuman(e.x,e.y,a,{coat:e.col||e.t.col,skin:e.t.skin,hair:'#3a3a2c',pants:'#26241f',walk:0,moving:false,zombie:true,attack:ch,crouch:true,s:1});
      ctx.translate(e.x,e.y);ctx.rotate(a);ctx.fillStyle='rgba(120,16,12,.8)';ctx.beginPath();ctx.ellipse(8,0,3.5,4.5,0,0,6.283);ctx.fill();break;}
      drawHuman(e.x,e.y,a,{coat:e.col||e.t.col,skin:e.t.skin,hair:e.type==='corr'?'#3a2a22':'#3a3a2c',pants:'#26241f',walk:wk,moving:e.state==='chase'||!e.idle,zombie:true,attack:e.hitAnim>0,s:e.type==='corr'?.95:1});
  }
  ctx.restore();
  if(e.mode==='slamT'&&e.type!=='boss'){ctx.strokeStyle=`rgba(255,80,50,${.45+Math.sin(renderT*30)*.3})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(e.x,e.y,175,0,6.283);ctx.stroke();}
  if(e.flash>0){ctx.globalCompositeOperation='lighter';ctx.fillStyle=`rgba(255,240,220,${.35*va})`;ctx.beginPath();ctx.arc(e.x,e.y,e.r+2,0,6.283);ctx.fill();ctx.globalCompositeOperation='source-over';}
  if(e.burn>0){ctx.globalCompositeOperation='lighter';ctx.fillStyle='rgba(255,120,40,.18)';ctx.beginPath();ctx.arc(e.x,e.y,e.r+6,0,6.283);ctx.fill();ctx.globalCompositeOperation='source-over';}
}
function drawPlayer(){
  ctx.globalAlpha=1; ctx.globalCompositeOperation='source-over';
  if(P.inCar||P.hidden||P.ride)return;
  if(P.dodge>0){for(let k=1;k<=2;k++){ctx.fillStyle=`rgba(160,46,38,${.22/k})`;ctx.beginPath();ctx.arc(P.x-P.dvx*.035*k,P.y-P.dvy*.035*k,10,0,6.283);ctx.fill();}}
  const wid=WEAPONS[P.w].id;
  if(P.inv>0&&((renderT*20)|0)%2)ctx.globalAlpha=.55;
  if(wid==='chamas'){ctx.save();ctx.translate(P.x,P.y);ctx.rotate(P.ang);ctx.fillStyle='#3e432c';for(const s of [-4,4]){rrect(ctx,-15,s-3.2,9,6.4,3);ctx.fill();}ctx.fillStyle='#d07a24';ctx.fillRect(-12,-7,1.6,14);ctx.restore();}
  drawHuman(P.x,P.y,P.ang,{...(P.lookO||{richard:true,coat:'#1f2b4e',skin:'#d29d7c',hair:'#3a2415',pants:'#24262c'}),crouch:P.crouch,legAng:P.legAng??P.ang,walk:P.walk,moving:P.moving,wid:wid==='maos'?null:wid,knife:wid==='faca',loaded:P.mags[P.w]>0,firing:P.firing&&P.cool>0,slash:P.slash,recoil:P.recoil,pack:true});
  ctx.globalAlpha=1;
  if(P.crouch&&!P.inCar){ctx.save();ctx.setLineDash([3,4]);ctx.lineDashOffset=-renderT*6;ctx.strokeStyle='rgba(150,190,230,.45)';ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(P.x,P.y,17,0,6.283);ctx.stroke();ctx.restore();}
  if(P.slash>0){const k=1-P.slash/.16;ctx.strokeStyle=`rgba(230,230,220,${.5*(1-k)})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(P.x,P.y,36,P.ang-.8,P.ang-.8+1.6*k);ctx.stroke();}
}
function drawNPC(n){
  const a=Math.atan2(P.y-n.y,P.x-n.x), near=hyp(P.x-n.x,P.y-n.y)<200&&!CUT.on&&!n.busy, ang=near?a:n.ang;
  const jy=n.startle>0?-Math.sin(n.startle/.55*Math.PI)*5:0;
  drawHuman(n.x,n.y+jy,ang,{coat:n.col,skin:n.skin||'#c49a7a',hair:n.hair,pants:'#2a2626',walk:n.walk||0,moving:!!n.moving,legAng:ang,crouch:n.crouch,look:n.look});
}
function drawProjs(){
  for(const p of projs){
    if(p.k==='b'){const sp=hyp(p.vx,p.vy)||1;ctx.strokeStyle='rgba(255,226,150,.9)';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x-p.vx/sp*14,p.y-p.vy/sp*14);ctx.stroke();}
    else if(p.k==='s'&&p.rock){p.spin=(p.spin||0)+lastDt*7;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.spin);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-9,-4,22,14);ctx.fillStyle=p.col||'#6e3529';ctx.fillRect(-11,-7,22,14);ctx.strokeStyle='rgba(0,0,0,.35)';ctx.lineWidth=1;for(let k=-8;k<10;k+=4){ctx.beginPath();ctx.moveTo(k,-7);ctx.lineTo(k,7);ctx.stroke();}ctx.restore();}
    else if(p.k==='s'){ctx.fillStyle='#9cc23a';ctx.beginPath();ctx.arc(p.x,p.y,5,0,6.283);ctx.fill();ctx.fillStyle='#d8f07a';ctx.beginPath();ctx.arc(p.x-1,p.y-1,2,0,6.283);ctx.fill();}
    else if(p.k==='bt'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.spin);ctx.fillStyle='#3e6a52';ctx.fillRect(-6,-2.5,9,5);ctx.fillRect(3,-1.3,4,2.6);ctx.fillStyle='rgba(220,255,230,.4)';ctx.fillRect(-5,-2,6,1.2);ctx.restore();}
    else if(p.k==='g'||p.k==='h'){ctx.fillStyle='#2e3524';ctx.beginPath();ctx.arc(p.x,p.y,5,0,6.283);ctx.fill();ctx.fillStyle='#6d7a3e';ctx.fillRect(p.x-2,p.y-6,4,3);if(p.k==='h'&&((p.fuse*8)|0)%2){ctx.fillStyle='#e04a3a';ctx.beginPath();ctx.arc(p.x,p.y,2,0,6.283);ctx.fill();}}
  }
}
function drawParts(){
  for(const p of parts){
    const a=clamp(p.life/p.max,0,1);
    if(p.k==='fire'||p.k==='smoke')continue;
    ctx.globalAlpha=p.k==='shell'?1:a;ctx.fillStyle=p.c;
    if(p.k==='shell'){ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.rot+p.life*20);ctx.fillRect(-2,-1,4,2);ctx.restore();}
    else{ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,6.283);ctx.fill();}
  }
  ctx.globalAlpha=1;
  for(const p of parts){if(p.k!=='smoke')continue;ctx.globalAlpha=clamp(p.life/p.max,0,1)*.5;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s,0,6.283);ctx.fill();}
  ctx.globalAlpha=1;
}
function drawFlames(){
  ctx.globalCompositeOperation='lighter';
  for(const p of projs){if(p.k!=='f')continue;const a=clamp(p.life/.55,0,1);ctx.fillStyle=`rgba(255,${(120+a*90)|0},40,${.35*a+.1})`;ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,6.283);ctx.fill();}
  for(const p of parts){if(p.k!=='fire')continue;const a=clamp(p.life/p.max,0,1);ctx.globalAlpha=a*.85;ctx.fillStyle=p.c;ctx.beginPath();ctx.arc(p.x,p.y,p.s*(.6+a*.4),0,6.283);ctx.fill();}
  ctx.globalAlpha=1;ctx.globalCompositeOperation='source-over';
}
function drawHazards(){
  for(const h of hazards){const a=clamp(h.life/h.max,0,1),r=h.r*(a*.4+.6);
    const g=ctx.createRadialGradient(h.x,h.y,4,h.x,h.y,r);g.addColorStop(0,`rgba(150,190,50,${.55*a})`);g.addColorStop(1,'rgba(150,190,50,0)');
    ctx.fillStyle=g;ctx.beginPath();ctx.arc(h.x,h.y,r,0,6.283);ctx.fill();
    ctx.fillStyle=`rgba(200,230,90,${.5*a})`;for(let i=0;i<3;i++){const b=(renderT*1.3+i*.33)%1;ctx.beginPath();ctx.arc(h.x+Math.cos(i*2.1)*r*.4,h.y+Math.sin(i*2.1)*r*.4,2+b*3,0,6.283);ctx.fill();}}
}
// janela vista de fora: moldura saindo da parede, vidro com cruzeta; as que quebram têm moldura de madeira e vidro rachado
function drawWin(wn,lit){
  const WX=wn.x*TILE,WY=wn.y*TILE,h=wn.dir===0||wn.dir===2;
  let fx,fy,fw,fh;
  if(wn.dir===0){fx=WX+3;fy=WY-5;fw=26;fh=13;}else if(wn.dir===2){fx=WX+3;fy=WY+TILE-8;fw=26;fh=13;}
  else if(wn.dir===3){fx=WX-5;fy=WY+3;fw=13;fh=26;}else{fx=WX+TILE-8;fy=WY+3;fw=13;fh=26;}
  ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(fx+2,fy+2,fw,fh);
  ctx.fillStyle=wn.brk||wn.broken?'#7a4e26':'#cfc8b8';ctx.fillRect(fx,fy,fw,fh);
  const gx=fx+2.5,gy=fy+2.5,gw=fw-5,gh=fh-5;
  if(wn.broken){ctx.fillStyle='#07080a';ctx.fillRect(gx,gy,gw,gh);ctx.fillStyle='rgba(180,210,225,.55)';ctx.beginPath();
    if(h){ctx.moveTo(gx,gy);ctx.lineTo(gx+5,gy+gh*.6);ctx.lineTo(gx+8,gy);ctx.moveTo(gx+gw,gy+gh);ctx.lineTo(gx+gw-6,gy+gh*.3);ctx.lineTo(gx+gw-9,gy+gh);}
    else{ctx.moveTo(gx,gy);ctx.lineTo(gx+gw*.6,gy+5);ctx.lineTo(gx,gy+8);ctx.moveTo(gx+gw,gy+gh);ctx.lineTo(gx+gw*.3,gy+gh-6);ctx.lineTo(gx+gw,gy+gh-9);}
    ctx.fill();return;}
  ctx.fillStyle=lit?'#f2c070':wn.brk?'#4f7c86':'#33475a';ctx.fillRect(gx,gy,gw,gh);
  if(G.winFace&&G.winFace.w===wn){const fxc=gx+gw/2,fyc=gy+gh/2;ctx.fillStyle='#d8d2c6';ctx.beginPath();ctx.ellipse(fxc,fyc,h?5:3.5,h?3.5:5,0,0,6.283);ctx.fill();ctx.fillStyle='#000';ctx.beginPath();ctx.arc(fxc-1.6,fyc-.6,1,0,6.283);ctx.arc(fxc+1.6,fyc-.6,1,0,6.283);ctx.fill();ctx.fillRect(fxc-1.5,fyc+1.4,3,.8);}
  ctx.fillStyle='rgba(255,255,255,.28)';if(h)ctx.fillRect(gx+1,gy+1,gw*.35,2);else ctx.fillRect(gx+1,gy+1,2,gh*.35);
  ctx.strokeStyle=wn.brk||wn.broken?'#7a4e26':'#cfc8b8';ctx.lineWidth=1.6;ctx.beginPath();
  if(h){ctx.moveTo(gx+gw/2,gy);ctx.lineTo(gx+gw/2,gy+gh);}else{ctx.moveTo(gx,gy+gh/2);ctx.lineTo(gx+gw,gy+gh/2);}ctx.stroke();
  if(wn.brk){ctx.strokeStyle='rgba(230,245,255,.7)';ctx.lineWidth=.9;ctx.beginPath();ctx.moveTo(gx+2,gy+gh-1);ctx.lineTo(gx+gw*.45,gy+gh*.35);ctx.lineTo(gx+gw*.7,gy+gh*.8);ctx.moveTo(gx+gw*.45,gy+gh*.35);ctx.lineTo(gx+gw-1,gy+1);ctx.stroke();
    const d=hyp(P.x-WX-16,P.y-WY-16);if(d<170&&G.mode==='play'){const a=(1-d/170)*(.55+.45*Math.sin(renderT*5));ctx.strokeStyle=`rgba(230,170,70,${a})`;ctx.lineWidth=2.4;ctx.strokeRect(fx-2,fy-2,fw+4,fh+4);}}
}
function drawRoofs(x0,y0,x1,y1){
  const k=Math.min(1,lastDt*9);
  const open=new Set(); if(G.mode!=='title'&&G.inB>=0)open.add(G.inB);
  if(CUT.on){const add=o=>{if(!o||o.x==null)return;const tx=(o.x/TILE)|0,ty=(o.y/TILE)|0;if(inb(tx,ty)){const b=bmap[idx(tx,ty)];if(b>=0)open.add(b);}};
    add(cutFocus()); if(CUT.bub)add(CUT.bub.a); for(const a of Object.values(CUT.actors))add(a);}
  for(const b of buildings){
    const target=open.has(b.id)?0:1; b.roofA+=(target-b.roofA)*k;
    if(b.roofA<.02)continue;
    if(b.x>x1||b.y>y1||b.x+b.w<x0||b.y+b.h<y0)continue;
    const X=b.x*TILE,Y=b.y*TILE,w=b.w*TILE,h=b.h*TILE;
    ctx.globalAlpha=b.roofA;
    ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(X+6,Y+6,w,h);
    ctx.fillStyle=b.roof;ctx.fillRect(X,Y,w,h);
    ctx.fillStyle='rgba(255,255,255,.05)';
    if(w>=h){ctx.fillRect(X,Y,w,h/2);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(X,Y+h/2-1,w,2);}
    else{ctx.fillRect(X,Y,w/2,h);ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(X+w/2-1,Y,2,h);}
    ctx.strokeStyle='rgba(0,0,0,.4)';ctx.lineWidth=3;ctx.strokeRect(X+1.5,Y+1.5,w-3,h-3);
    if(b.tall){ctx.fillStyle='rgba(0,0,0,.3)';ctx.fillRect(X+w,Y+12,18,h);ctx.fillRect(X+12,Y+h,w-12,18);
      ctx.strokeStyle='rgba(255,255,255,.07)';ctx.lineWidth=1;ctx.strokeRect(X+14,Y+14,w-28,h-28);
      ctx.fillStyle='#55585c';ctx.fillRect(X+20,Y+20,22,16);ctx.fillRect(X+w-44,Y+h-38,24,18);
      if((b.id%3)===0){ctx.strokeStyle='rgba(220,200,90,.45)';ctx.lineWidth=3;ctx.beginPath();ctx.arc(X+w/2,Y+h/2,30,0,6.283);ctx.stroke();ctx.fillStyle='rgba(220,200,90,.45)';ctx.font='bold 34px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('H',X+w/2,Y+h/2+2);}
      if(Math.sin(renderT*1.5+b.id)>.2){ctx.fillStyle='rgba(255,40,30,.8)';ctx.fillRect(X+w-10,Y+6,4,4);}}
    // de fora dá pra ver onde ficam as portas e as janelas
    if(b.doorT)for(const d of b.doorT){const DX=d.x*TILE,DY=d.y*TILE,hz=d.side==='S'||d.side==='N';
      // porta: vão escuro com a folha de madeira e um degrau claro do lado de fora
      let x=DX,y=DY,w2=TILE,h2=TILE;if(d.side==='S'){y=DY+TILE-10;h2=10;}else if(d.side==='N'){h2=10;}else if(d.side==='W'){w2=10;}else{x=DX+TILE-10;w2=10;}
      ctx.fillStyle='#120c08';ctx.fillRect(x,y,w2,h2);ctx.fillStyle='#6a4426';if(hz)ctx.fillRect(x+1,y+2,w2-2,h2-4);else ctx.fillRect(x+2,y+1,w2-4,h2-2);
      ctx.fillStyle='rgba(0,0,0,.35)';if(hz)ctx.fillRect(x+w2/2-.5,y+2,1,h2-4);else ctx.fillRect(x+2,y+h2/2-.5,w2-4,1);
      ctx.fillStyle='#8a8478';if(d.side==='S')ctx.fillRect(DX,DY+TILE,TILE,3);else if(d.side==='N')ctx.fillRect(DX,DY-3,TILE,3);else if(d.side==='W')ctx.fillRect(DX-3,DY,3,TILE);else ctx.fillRect(DX+TILE,DY,3,TILE);}
    if(b.wins){const lit=b.lit&&!b.dark&&daylight()<.5&&powerOn(b.id);for(const wn of b.wins)drawWin(wn,lit);}
    if(b.kind==='hospital'||b.kind==='hospital2'){ctx.fillStyle='rgba(180,40,30,.8)';ctx.fillRect(X+w/2-30,Y+h/2-9,60,18);ctx.fillRect(X+w/2-9,Y+h/2-30,18,60);}
    if(b.safe){ctx.fillStyle='rgba(90,200,120,.5)';ctx.fillRect(X+w/2-5,Y+h/2-5,10,10);}
  }
  ctx.globalAlpha=1;
}
// --------- iluminação ---------
const LIGHT_COL={lamp:'255,214,150',fire:'255,140,60',safe:'110,230,150',candle:'255,190,110',flood:'220,230,255',siren:'255,60,50',neon:'255,60,140'};
function lightIntensity(l){
  if(l.c==='neon')return Math.sin(renderT*9+l.x)>.95?.2:1;
  if(l.c==='siren')return .9;
  if(l.c==='fire')return .85+Math.sin(renderT*13+l.x)*.1+Math.sin(renderT*7.3+l.y)*.05;
  if(l.f){const n=Math.sin(renderT*3.1+l.x*.01)+Math.sin(renderT*17.7+l.y*.02);return n>1.55?.15:.9;}
  return 1;
}
function punch(x,y,r,a){
  if(!LSPR)makeLightSprites(); if(a<=0)return;
  lx.globalAlpha=Math.min(1,a); lx.drawImage(LSPR,x-r,y-r,r*2,r*2); lx.globalAlpha=1;
}
// leque de raios em cache: parado, não recalcula a lanterna nem o campo de visão
const FANC={};
function rayFan(key,ox,oy,a0,half,n,range){
  const c=FANC[key];
  if(c&&c.v===MAPV&&Math.abs(c.ox-ox)<.35&&Math.abs(c.oy-oy)<.35&&Math.abs(c.a-a0)<.0015&&c.half===half&&c.range===range&&c.n===n)return c.pts;
  const pts=[];for(let i=0;i<=n;i++){const a=a0-half+half*2*i/n,d=castRay(ox,oy,a,range,LIGHT_BLOCK,false);pts.push(ox+Math.cos(a)*d,oy+Math.sin(a)*d);}
  FANC[key]={v:MAPV,ox,oy,a:a0,half,n,range,pts};return pts;
}
function renderLighting(sx,sy,showPlayer){
  const z=view.z*LS;
  lx.setTransform(1,0,0,1,0,0);lx.globalCompositeOperation='source-over';
  lx.clearRect(0,0,lc.width,lc.height);
  // noite fechada, amanhecer, dia nublado e entardecer; dentro dos prédios é sempre mais escuro
  const dl=G.mode==='title'?0:daylight(), bf=BRIS[OPT.bri].f/.93, inside=G.mode!=='title'&&G.inB>=0&&buildings[G.inB]&&!buildings[G.inB].safe;
  let dk=G.mode==='title'?.74:lerp(Math.min(.95,.9*bf),(inside?.62:.24)*bf,dl); if(G._dkSew&&G.mode!=='title')dk=Math.max(dk,G._dkSew*bf); if(G._dkZone&&G.mode!=='title')dk*=G._dkZone; if(G._dkWx&&G.mode!=='title')dk=Math.min(.97,dk+G._dkWx); if(G.blackout>0)dk=Math.min(.96,dk+.05); dk*=1-clamp(G.light||0,0,1)*.75*(typeof flsF==='function'?flsF():1); if(DBG.bright)dk=.12;
  lx.fillStyle=`rgba(3,5,9,${dk})`;lx.fillRect(0,0,lc.width,lc.height);
  lx.globalCompositeOperation='destination-out';
  lx.setTransform(z,0,0,z,(-cam.x*view.z+sx)*LS,(-cam.y*view.z+sy)*LS);
  const vx0=cam.x-200,vy0=cam.y-200,vx1=cam.x+view.w/view.z+200,vy1=cam.y+view.h/view.z+200;
  const dayOff=dl>.6;
  for(const l of lights){if(l.x<vx0-l.r||l.x>vx1+l.r||l.y<vy0-l.r||l.y>vy1+l.r)continue;if((G.blackout>0||dayOff)&&(l.c==='lamp'||l.c==='flood'||l.c==='neon'))continue;if(!lightOn(l))continue;punch(l.x,l.y,l.r,.85*lightIntensity(l));}
  if(showPlayer&&P.inCar){
    const ox=V.x+Math.cos(V.ang)*16,oy=V.y+Math.sin(V.ang)*16,range=600,half=.5,n=40;
    punch(V.x,V.y,90,.6);
    const pts=rayFan('car',ox,oy,V.ang,half,n,range);
    const g=lx.createRadialGradient(ox,oy,10,ox,oy,range);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.55,'rgba(0,0,0,.85)');g.addColorStop(1,'rgba(0,0,0,0)');
    lx.fillStyle=g;lx.beginPath();lx.moveTo(ox,oy);for(let i=0;i<pts.length;i+=2)lx.lineTo(pts[i],pts[i+1]);lx.closePath();lx.fill();
    punch(V.x-Math.cos(V.ang)*22,V.y-Math.sin(V.ang)*22,46,.4);
  } else if(showPlayer&&P.hidden){
    punch(P.x,P.y,44,.3);
  } else if(showPlayer){
    punch(P.x,P.y,P.lamp&&P.bat>0?90:66,P.lamp&&P.bat>0?.74:.58);
    if(Math.random()<.004)G.flick=.12+Math.random()*.15;
    if(G.flick>0)G.flick-=lastDt;
    const lowBat=P.bat<20&&Math.sin(renderT*23)+Math.sin(renderT*7.7)>1.2;
    const lampOn=P.lamp&&P.bat>0&&!(G.flick>0)&&!lowBat;
    const range=lampOn?270+Math.round(Math.min(P.bat,100)/8)*8*1.2:0,half=.4,n=44;
    if(lampOn){
    const pts=rayFan('lamp',P.x,P.y,P.ang,half,n,range);
    const g=lx.createRadialGradient(P.x,P.y,10,P.x,P.y,range);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.6,'rgba(0,0,0,.85)');g.addColorStop(1,'rgba(0,0,0,0)');
    lx.fillStyle=g;lx.beginPath();lx.moveTo(P.x,P.y);for(let i=0;i<pts.length;i+=2)lx.lineTo(pts[i],pts[i+1]);lx.closePath();lx.fill();
    }
  }
  const wz=view.z,wx0=cam.x-120,wy0=cam.y-120,wx1=cam.x+view.w/wz+120,wy1=cam.y+view.h/wz+120;
  if(Q.windows&&dl<.5)for(const w of STATIC.wins)if(w.x>wx0&&w.x<wx1&&w.y>wy0&&w.y<wy1&&powerOn(w.b.id))punch(w.x+16+(w.dir===1?24:w.dir===3?-24:0),w.y+16+(w.dir===2?24:w.dir===0?-24:0),70,.35);
  if(G.muzzle)punch(G.muzzle.x,G.muzzle.y,G.muzzle.c==='fire'?230:260,.9);
  if(G.boom)punch(G.boom.x,G.boom.y,420,G.boom.t/.3);
  for(const p of projs)if(p.k==='f'&&Math.random()<.25)punch(p.x,p.y,90,.5);
  for(const c of cars){if(!c.burn)continue;}
  if(G.heli&&LM.pad){const hp=heliPos();punch(hp.x,hp.y+40,260,.9);}
  for(const h of hazards)punch(h.x,h.y,h.r*1.2,.35*(h.life/h.max));
  evLights();
  if(CUT.on){const f=cutFocus();for(const a of [...npcs,...Object.values(CUT.actors)])if(a&&a.x!=null&&(hyp(a.x-P.x,a.y-P.y)<500||hyp(a.x-f.x,a.y-f.y)<420))punch(a.x,a.y,80,.5);punch(f.x,f.y,150,.35);}
  lx.globalCompositeOperation='source-over';
  ctx.setTransform(1,0,0,1,0,0);
  ctx.drawImage(lc,0,0,cv.width,cv.height);
}
// --------- campo de visão: fora do cone, só a lembrança escura do lugar ---------
function renderFOV(sx,sy){
  const tgt=(CUT.on||G.mode==='title'||DBG.bright)?0:1; G.fovA=lerp(G.fovA??0,tgt,Math.min(1,lastDt*4)); if(G.fovA<.02)return;
  if(fc.width!==lc.width||fc.height!==lc.height){fc.width=lc.width;fc.height=lc.height;}
  const z=view.z*LS, p=fovParams(), ox=P.inCar?V.x:P.x, oy=P.inCar?V.y:P.y, a=P.inCar?V.ang:P.ang, dl=daylight();
  fx.setTransform(1,0,0,1,0,0); fx.globalCompositeOperation='source-over'; fx.globalAlpha=1; fx.clearRect(0,0,fc.width,fc.height);
  fx.fillStyle=`rgba(2,3,6,${(.48-.08*dl)*G.fovA})`; fx.fillRect(0,0,fc.width,fc.height);
  fx.globalCompositeOperation='destination-out';
  fx.setTransform(z,0,0,z,(-cam.x*view.z+sx)*LS,(-cam.y*view.z+sy)*LS);
  const n=Q.fovRays||44, ext=.09, h=p.half+ext, pts=rayFan('fov',ox,oy,a,h,n,p.range), inner=[];
  for(let i=0;i<=n;i++){if(Math.abs(-h+2*h*i/n)<=p.half+1e-6)inner.push(pts[i*2],pts[i*2+1]);}
  const g=fx.createRadialGradient(ox,oy,8,ox,oy,p.range);g.addColorStop(0,'rgba(0,0,0,1)');g.addColorStop(.78,'rgba(0,0,0,1)');g.addColorStop(1,'rgba(0,0,0,0)');
  fx.fillStyle=g;
  for(const [arr,al] of [[pts,.45],[inner,1]]){fx.globalAlpha=al;fx.beginPath();fx.moveTo(ox,oy);for(let i=0;i<arr.length;i+=2)fx.lineTo(arr[i],arr[i+1]);fx.closePath();fx.fill();}
  fx.globalAlpha=1; if(!LSPR)makeLightSprites(); const pr=p.peri*1.7; fx.drawImage(LSPR,ox-pr,oy-pr,pr*2,pr*2); fx.drawImage(LSPR,ox-pr*.7,oy-pr*.7,pr*1.4,pr*1.4);
  fx.globalCompositeOperation='source-over';
  ctx.setTransform(1,0,0,1,0,0); ctx.drawImage(fc,0,0,cv.width,cv.height);
}
// passos que você ouve mas não vê: marcas em volta do Richard apontando de onde vem
function drawSenses(){
  if(P.inCar||G.mode!=='play'&&G.mode!=='menu'||!G.detOn)return;
  for(const e of enemies){
    if(!e.alive||e.va>.6||e.state==='dorm'||e.type==='manequim')continue;
    const d=hyp(e.x-P.x,e.y-P.y); if(d>360)continue;
    const mv=e.state==='chase'||e.state==='investigate'||hyp(e.vx,e.vy)>14; if(!mv)continue;
    const a=Math.atan2(e.y-P.y,e.x-P.x), k=1-d/360, pulse=.55+.45*Math.sin(renderT*9+e.anim*3), ch=e.state==='chase';
    ctx.strokeStyle=ch?`rgba(225,70,50,${.7*k*pulse})`:`rgba(215,205,185,${.5*k*pulse})`; ctx.lineWidth=ch?3:2;
    ctx.beginPath();ctx.arc(P.x,P.y,28+(1-k)*16,a-.2-k*.12,a+.2+k*.12);ctx.stroke();
  }
}
function drawGlows(){
  const dlG=G.mode==='title'?0:daylight();
  ctx.globalCompositeOperation='lighter';
  const vx0=cam.x-300,vy0=cam.y-300,vx1=cam.x+view.w/view.z+300,vy1=cam.y+view.h/view.z+300;
  for(const l of lights){
    if(l.x<vx0||l.x>vx1||l.y<vy0||l.y>vy1)continue;
    if((G.blackout>0||dlG>.6)&&(l.c==='lamp'||l.c==='flood'||l.c==='neon'))continue; if(!lightOn(l))continue;
    const a=(l.c==='fire'?.22:l.c==='safe'?.13:l.c==='candle'?.14:.07)*lightIntensity(l), r=l.r*(l.c==='fire'?.9:.75);
    if(l.c==='siren'){const ph=(renderT*2.2+l.x*.01)%1;glow(ph<.5?'red':'blue',l.x,l.y,l.r*.8,.22*Math.abs(Math.sin(ph*Math.PI*2)));continue;}
    glow(l.c,l.x,l.y,r,a*1.6);
  }
  if(G.muzzle)glow('white',G.muzzle.x,G.muzzle.y,70,.55);
  if(G.boom)glow('fire',G.boom.x,G.boom.y,180,G.boom.t*2);
  if(Q.windows&&dlG<.5)for(const w of STATIC.wins){
    if(w.x<vx0||w.x>vx1||w.y<vy0||w.y>vy1||!powerOn(w.b.id))continue;
    const cx=w.x+16,cy=w.y+16,ox=w.dir===1?1:w.dir===3?-1:0,oy=w.dir===2?1:w.dir===0?-1:0;
    glow('win',cx+ox*20,cy+oy*20,46,.2);
  }
  if(G.slam){const k=1-G.slam.t/.5;ctx.strokeStyle=`rgba(255,180,120,${.6*(1-k)})`;ctx.lineWidth=8*(1-k)+2;ctx.beginPath();ctx.arc(G.slam.x,G.slam.y,40+k*150,0,6.283);ctx.stroke();}
  ctx.globalCompositeOperation='source-over';
  drawFlames();
}
function heliPos(){
  const t=G.heli?G.heli.t:0, k=clamp(t/7,0,1), e=1-Math.pow(1-k,3);
  return {x:LM.pad.x+(1-e)*600,y:LM.pad.y-(1-e)*500,s:1.7-e*.7};
}
function drawHeli(){
  if(!G.heli)return;
  const h=heliPos();
  ctx.save();ctx.translate(h.x,h.y);ctx.scale(h.s,h.s);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(30/h.s,40/h.s,46,22,0,0,6.283);ctx.fill();
  ctx.fillStyle='#37402e';ctx.beginPath();ctx.ellipse(0,0,40,19,0,0,6.283);ctx.fill();
  ctx.fillRect(-90,-4,60,8);ctx.fillRect(-96,-14,10,28);
  ctx.fillStyle='#1c2430';ctx.beginPath();ctx.ellipse(22,0,14,13,0,0,6.283);ctx.fill();
  ctx.fillStyle='#2a3022';ctx.fillRect(-20,-24,34,5);ctx.fillRect(-20,19,34,5);
  ctx.strokeStyle='rgba(30,30,30,.75)';ctx.lineWidth=6;const ra=renderT*28;
  for(let i=0;i<4;i++){const a=ra+i*Math.PI/2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*78,Math.sin(a)*78);ctx.stroke();}
  ctx.fillStyle=((renderT*3)|0)%2?'#ff3a2a':'#5a1a14';ctx.beginPath();ctx.arc(-94,0,3,0,6.283);ctx.fill();
  ctx.restore();
}
function drawPostLight(){
  // laser
  if(G.mode==='play'&&!WEAPONS[P.w].melee&&!P.hidden&&!P.inCar){
    const a=P.ang,ox=P.x+Math.cos(a)*24,oy=P.y+Math.sin(a)*24,d=castRay(ox,oy,a,620,BULLET_BLOCK,true);
    const ex=ox+Math.cos(a)*d,ey=oy+Math.sin(a)*d;
    ctx.strokeStyle='rgba(255,40,30,.28)';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ex,ey);ctx.stroke();
    ctx.fillStyle='rgba(255,60,40,.95)';ctx.beginPath();ctx.arc(ex,ey,2.4,0,6.283);ctx.fill();
  }
  drawSenses();
  // olhos
  for(const e of enemies){
    if(!e.alive||(e.stalker&&e.down>0)||e.state==='dorm'||e.type==='esfol'||e.type==='boss'||e.type==='manequim'||e.type==='especime'||e.type==='ouvinte'||(e.va??1)<.05)continue;
    const d=hyp(e.x-P.x,e.y-P.y); if(d>560)continue;
    const b=bmap[idx((e.x/TILE)|0,(e.y/TILE)|0)]; if(b>=0&&buildings[b].roofA>.5)continue;
    const s=e.type==='brut'?1.65:e.type==='pers'?1.6:1, hx=e.x+Math.cos(e.face)*(e.type==='cao'?13:(e.type==='rast'?9:3))*s, hy=e.y+Math.sin(e.face)*(e.type==='cao'?13:(e.type==='rast'?9:3))*s;
    const px=-Math.sin(e.face)*2.4*s,py=Math.cos(e.face)*2.4*s, al=(1-d/560)*.85*(e.va??1);
    ctx.fillStyle=e.type==='pers'?`rgba(255,250,240,${al})`:`rgba(255,70,40,${al})`;
    ctx.beginPath();ctx.arc(hx+px+Math.cos(e.face)*3,hy+py+Math.sin(e.face)*3,1.4*s,0,6.283);ctx.arc(hx-px+Math.cos(e.face)*3,hy-py+Math.sin(e.face)*3,1.4*s,0,6.283);ctx.fill();
  }
  // brilho dos itens
  for(const p of pickups){
    const d=hyp(p.x-P.x,p.y-P.y); if(d>320)continue;
    const b=bmap[idx(p.tx,p.ty)]; if(b>=0&&buildings[b].roofA>.5)continue;
    const t=(renderT*1.6+p.x*.013)%1.6; if(t>1)continue;
    const a=Math.sin(t*Math.PI)*.8*(1-d/320), s=3+t*5;
    ctx.strokeStyle=`rgba(255,226,140,${a})`;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(p.x-s,p.y-8);ctx.lineTo(p.x+s,p.y-8);ctx.moveTo(p.x,p.y-8-s);ctx.lineTo(p.x,p.y-8+s);ctx.stroke();
  }
  // nomes de prédios
  ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='16px "Special Elite","Courier New",monospace';
  for(const b of buildings){
    if(!b.name||b.roofA<.4)continue; const X=(b.x+b.w/2)*TILE,Y=(b.y+b.h/2)*TILE;
    const bd=hyp(X-P.x,Y-P.y); if(bd>340)continue;
    ctx.fillStyle=`rgba(220,210,190,${.26*b.roofA*clamp((340-bd)/120,0,1)})`;ctx.fillText(b.name.toUpperCase(),X,Y+(b.kind==='hospital'?44:0));
  }
  // NPC nomes
  ctx.font='600 13px "Barlow Condensed",sans-serif';
  for(const n of npcs){if(n.cond&&!n.cond())continue;if(hyp(n.x-P.x,n.y-P.y)<160){ctx.fillStyle='rgba(230,220,200,.85)';ctx.fillText(n.name,n.x,n.y-22);}}
  for(const f of floaters){ctx.fillStyle=`rgba(255,230,160,${clamp(f.life/.8,0,1)})`;ctx.font='700 13px "Barlow Condensed",sans-serif';ctx.fillText(f.t,f.x,f.y);}
  if(DBG.ai){ctx.font='600 11px "Barlow Condensed",sans-serif';ctx.textAlign='center';for(const e of enemies){if(!e.alive||hyp(e.x-P.x,e.y-P.y)>700)continue;ctx.fillStyle='rgba(120,230,255,.9)';ctx.fillText(`${e.type} · ${e.state}${e.mode?' · '+e.mode:''} · ${Math.ceil(e.hp)}`,e.x,e.y-e.r-10);}}
  drawHeli();
  drawEmotes();
}
// --------- chuva ---------
const rain=[];
function drawRain(){
  const n=Math.round(view.w*view.h/9000*Q.rain); if(rain.length>n)rain.length=n;
  while(rain.length<n)rain.push({x:Math.random()*view.w,y:Math.random()*view.h,s:rr(500,800),l:rr(8,16)});
  const inside=G.inB>=0&&G.mode!=='title';
  ctx.strokeStyle=`rgba(160,180,200,${inside?.06:.18})`;ctx.lineWidth=1;ctx.beginPath();
  for(const d of rain){d.y+=d.s*lastDt;d.x-=d.s*.18*lastDt;if(d.y>view.h){d.y=-20;d.x=Math.random()*(view.w+100);}if(d.x<-20)d.x+=view.w+40;ctx.moveTo(d.x,d.y);ctx.lineTo(d.x+d.l*.18,d.y-d.l);}
  ctx.stroke();
}
// --------- quadro principal ---------
function renderWorld(){
  const z=view.z;
  const sh=Math.min(G.shake||0,18)*(typeof shkF==='function'?shkF():1), sx=(Math.random()-.5)*sh, sy=(Math.random()-.5)*sh;
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.fillStyle='#050606'; ctx.fillRect(0,0,view.w,view.h);
  ctx.setTransform(dpr*z,0,0,dpr*z,(-cam.x*z+sx)*dpr,(-cam.y*z+sy)*dpr);
  const x0=Math.max(0,Math.floor(cam.x/TILE)-2), y0=Math.max(0,Math.floor(cam.y/TILE)-2);
  const x1=Math.min(W-1,Math.ceil((cam.x+view.w/z)/TILE)+2), y1=Math.min(HT-1,Math.ceil((cam.y+view.h/z)/TILE)+2);
  drawChunks();
  drawWaterAnim();
  drawPuddles();
  if(LM.radio){const X=LM.radio.x-16,Y=LM.radio.y-16;if(X>cam.x-40&&X<cam.x+view.w/z&&Y>cam.y-40&&Y<cam.y+view.h/z){ctx.fillStyle=(renderT*2|0)%2?'#e04a3a':'#5a1a14';ctx.fillRect(X+20,Y+12,4,4);}}
  const inView=(x,y,m=60)=>x>cam.x-m&&x<cam.x+view.w/z+m&&y>cam.y-m&&y<cam.y+view.h/z+m;
  drawBeach(inView);
  drawGraf(inView);
  for(const d of GORE)if(inView(d.x,d.y,90))drawDecal(d);
  for(const d of decals)if(inView(d.x,d.y))drawDecal(d);
  drawShopProps(inView);
  drawHazards();
  for(const p of pickups)if(inView(p.x,p.y))drawPickup(p);
  for(const e of enemies)if(e.stalker&&e.down>0&&inView(e.x,e.y))drawEnemy(e);
  for(const e of enemies)if(e.alive&&!(e.stalker&&e.down>0)&&inView(e.x,e.y))drawEnemy(e);
  for(const n of npcs)if(inView(n.x,n.y)&&!(n.cond&&!n.cond()))drawNPC(n);
  for(const n of cutNpcs)if(inView(n.x,n.y))drawCutNpc(n);
  if(G.mode!=='title'){drawComps();drawShip();}
  drawPeds(inView);
  drawVulto();
  if(inView(V.x,V.y,80))drawJeep();
  if(G.mode!=='title')drawPlayer();
  drawProjs(); drawParts();
  drawTreeCanopies();
  drawRoofs(x0,y0,x1,y1);
  drawLandmarks();
  drawEvTop(); if(G.mode!=='title'){drawHeliCrash();drawCable();}
  renderLighting(sx,sy,G.mode!=='title');
  ctx.setTransform(dpr*z,0,0,dpr*z,(-cam.x*z+sx)*dpr,(-cam.y*z+sy)*dpr);
  drawGlows();
  drawFog();
  if(G.mode!=='title'){renderFOV(sx,sy);ctx.setTransform(dpr*z,0,0,dpr*z,(-cam.x*z+sx)*dpr,(-cam.y*z+sy)*dpr);drawPostLight();}
  ctx.setTransform(dpr,0,0,dpr,0,0);
  drawRain();
  if(G.light>0){ctx.fillStyle=`rgba(190,205,255,${G.light*.18*(typeof flsF==='function'?flsF():1)})`;ctx.fillRect(0,0,view.w,view.h);}
  if(G.mode!=='title'){const dl=daylight(), tw=dl>0&&dl<1?Math.sin(dl*Math.PI):0;
    if(tw>0){ctx.fillStyle=`rgba(255,120,60,${.08*tw})`;ctx.fillRect(0,0,view.w,view.h);}
    if(dl>0){ctx.fillStyle=`rgba(150,160,170,${.07*dl})`;ctx.fillRect(0,0,view.w,view.h);}}
  // vinheta pré-desenhada num canvas pequeno (bem mais barato que um gradiente na tela inteira)
  if(!vignette){vignette=document.createElement('canvas');const vw=160,vh=Math.max(60,Math.round(160*view.h/view.w));vignette.width=vw;vignette.height=vh;const vg=vignette.getContext('2d');
    const g=vg.createRadialGradient(vw/2,vh/2,Math.min(vw,vh)*.3,vw/2,vh/2,Math.max(vw,vh)*.75);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.65)');vg.fillStyle=g;vg.fillRect(0,0,vw,vh);}
  ctx.drawImage(vignette,0,0,view.w,view.h);
  if(G.mode==='play'&&(G.fear||0)>.2){const fr=G.fear,pl=.75+.25*Math.sin(renderT*(4+fr*5));ctx.globalAlpha=Math.min(1,(fr-.2)*1.1*pl);ctx.drawImage(vignette,-view.w*.08,-view.h*.08,view.w*1.16,view.h*1.16);ctx.globalAlpha=1;ctx.fillStyle=`rgba(50,0,0,${fr*.09*pl})`;ctx.fillRect(0,0,view.w,view.h);}
  if(P.hidden&&G.mode!=='title'){
    const k=P.hidden.kind; ctx.fillStyle='rgba(0,0,0,.82)';
    if(k==='armario'){const gap=view.h*.16;ctx.fillRect(0,0,view.w,view.h/2-gap);ctx.fillRect(0,view.h/2+gap,view.w,view.h/2-gap);ctx.fillStyle='rgba(0,0,0,.55)';for(let i=-2;i<=2;i++)ctx.fillRect(0,view.h/2+i*gap*.4-2,view.w,4);}
    else if(k==='cacamba'){ctx.fillRect(0,0,view.w,view.h*.38);ctx.fillRect(0,view.h*.62,view.w,view.h*.38);}
    else{ctx.fillRect(0,0,view.w,view.h*.18);ctx.fillRect(0,view.h*.82,view.w,view.h*.18);ctx.fillStyle='rgba(120,140,160,.06)';ctx.fillRect(0,0,view.w,view.h);}
    ctx.fillStyle='rgba(225,218,200,.6)';ctx.font=`600 12px ${FONT_UI}`;ctx.textAlign='center';ctx.fillText('ESCONDIDO · prenda a respiração',view.w/2,view.h*.24);
  }
  if(G.mode==='play'||G.mode==='menu'||G.mode==='dead'){
    const low=P.hp<P.max*.3?(.18+Math.sin(renderT*5)*.08):0, hv=Math.max(G.hurt*.45,low);
    if(hv>0){const g=ctx.createRadialGradient(view.w/2,view.h/2,Math.min(view.w,view.h)*.25,view.w/2,view.h/2,Math.max(view.w,view.h)*.7);g.addColorStop(0,'rgba(120,0,0,0)');g.addColorStop(1,`rgba(130,6,4,${hv})`);ctx.fillStyle=g;ctx.fillRect(0,0,view.w,view.h);}
    for(const h of (G.hitDirs||[])){const a=clamp(h.life/.9,0,1),r=Math.min(view.w,view.h)*.36;ctx.strokeStyle=`rgba(200,30,20,${.75*a})`;ctx.lineWidth=7;ctx.beginPath();ctx.arc(view.w/2,view.h/2,r,h.a-.32,h.a+.32);ctx.stroke();}
  }
  drawGrain();
}

// ===================== HUD =====================
const FONT_UI='"Barlow Condensed","Arial Narrow",sans-serif', FONT_TW='"Special Elite","Courier New",monospace';
function panel(x,y,w,h){ctx.fillStyle='rgba(9,11,10,.74)';ctx.fillRect(x,y,w,h);ctx.strokeStyle='rgba(221,214,198,.12)';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,w-1,h-1);}
function ecgY(ph){
  if(ph<.08)return Math.sin(ph/.08*Math.PI)*-.12;
  if(ph>.14&&ph<.17)return (ph-.14)/.03*.25;
  if(ph>=.17&&ph<.2)return .25-(ph-.17)/.03*1.25;
  if(ph>=.2&&ph<.24)return -1+(ph-.2)/.04*1.3;
  if(ph>=.24&&ph<.27)return .3-(ph-.24)/.03*.3;
  if(ph>.38&&ph<.5)return Math.sin((ph-.38)/.12*Math.PI)*-.22;
  return 0;
}
function drawECG(x,y){
  const w=view.w<720?188:206,h=64; panel(x,y,w,h);
  const r=P.hp/P.max, st=r>=.6?['BEM','#62c06c']:r>=.3?['CUIDADO','#d9a33c']:['PERIGO','#d24a3a'];
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='rgba(221,214,198,.55)';ctx.font=`600 11px ${FONT_UI}`;ctx.fillText('CONDIÇÃO',x+10,y+18);
  ctx.fillStyle=st[1];ctx.font=`700 22px ${FONT_UI}`;ctx.fillText(st[0],x+10,y+44);
  const gx=x+(w-94),gw=86,gy=y+34,amp=17, speed=r>=.6?.9:r>=.3?1.4:2.1;
  ctx.save();ctx.beginPath();ctx.rect(gx,y+4,gw,h-8);ctx.clip();
  ctx.strokeStyle='rgba(98,192,108,.12)';ctx.lineWidth=1;for(let i=0;i<gw;i+=12){ctx.beginPath();ctx.moveTo(gx+i,y+6);ctx.lineTo(gx+i,y+h-6);ctx.stroke();}
  ctx.strokeStyle=st[1];ctx.lineWidth=2;ctx.shadowColor=st[1];ctx.shadowBlur=6;ctx.beginPath();
  for(let i=0;i<=gw;i+=2){const ph=(((i/gw)*1.4-renderT*speed)%1+1)%1;const yy=gy+ecgY(ph)*amp;if(i===0)ctx.moveTo(gx+i,yy);else ctx.lineTo(gx+i,yy);}
  ctx.stroke();ctx.restore();
  ctx.fillStyle='rgba(221,214,198,.1)';ctx.fillRect(x,y+h+3,w,3);
  ctx.fillStyle=P.tired?'#b0493a':'rgba(221,214,198,.55)';ctx.fillRect(x,y+h+3,w*P.st/100,3);
  const by=y+h+12, on=P.lamp&&P.bat>0;
  ctx.font=`700 10px ${FONT_UI}`;ctx.textAlign='left';ctx.fillStyle=on?'rgba(221,214,198,.6)':'#c2433a';
  ctx.fillText(on?'LANTERNA':(P.bat<=0?'SEM CARGA':'LANTERNA DESLIGADA'),x,by+8);
  const bw2=w-70;ctx.fillStyle='rgba(221,214,198,.1)';ctx.fillRect(x+66,by+3,bw2,4);
  ctx.fillStyle=P.bat<20?'#c2433a':'#8fb0d0';ctx.fillRect(x+66,by+3,bw2*P.bat/100,4);
}
function drawCarBox(x,y){
  panel(x,y,196,52); const r=clamp(V.hp/V.max,0,1);
  ctx.textAlign='left';ctx.fillStyle='rgba(221,214,198,.55)';ctx.font=`600 11px ${FONT_UI}`;ctx.fillText('JIPE DO TIÃO',x+10,y+17);
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(x+10,y+26,176,8);ctx.fillStyle=r>.5?'#8aa060':r>.25?'#d9a33c':'#d24a3a';ctx.fillRect(x+10,y+26,176*r,8);
  ctx.fillStyle='#ddd6c6';ctx.font=`700 13px ${FONT_UI}`;ctx.textAlign='right';ctx.fillText(Math.round(Math.abs(V.spd)*.36)+' km/h',x+186,y+17);
  ctx.textAlign='left';ctx.fillStyle='rgba(221,214,198,.45)';ctx.font=`500 11px ${FONT_UI}`;ctx.fillText(IN.touch?'ATIRAR = buzina':'H ou clique = buzina',x+10,y+47);
}
function drawWeaponBox(x,y){
  if(P.inCar)return drawCarBox(x,y+12);
  const w=WEAPONS[P.w], bw=196, bh=64; panel(x,y,bw,bh);
  {const M=WMODEL[w.id],s=Math.min(2.6,84/(M.len+16));ctx.save();ctx.beginPath();ctx.rect(x+1,y+1,bw-2,bh-2);ctx.clip();ctx.globalAlpha=.85;ctx.translate(x+bw-14-(M.len)*s,y+40);ctx.scale(s,s);drawWeaponModel(ctx,w.id,P.mags[P.w]>0,false);ctx.restore();}
  ctx.textAlign='left';ctx.textBaseline='alphabetic';
  ctx.fillStyle='rgba(221,214,198,.6)';ctx.font=`600 12px ${FONT_UI}`;ctx.fillText(w.n.toUpperCase(),x+10,y+18);
  if(w.melee){ctx.fillStyle='#ddd6c6';ctx.font=`700 26px ${FONT_UI}`;ctx.fillText('∞',x+10,y+50);}
  else{
    const mag=P.mags[P.w],res=invCount(w.ammo);
    ctx.fillStyle=mag===0?'#d24a3a':'#ddd6c6';ctx.font=`700 32px ${FONT_UI}`;ctx.fillText(String(mag),x+10,y+52);
    const mw=ctx.measureText(String(mag)).width;
    ctx.fillStyle='rgba(221,214,198,.55)';ctx.font=`600 18px ${FONT_UI}`;ctx.fillText('/ '+res,x+16+mw,y+52);
    if(P.reloading>0){ctx.fillStyle='#d49a3c';ctx.fillRect(x,y+bh-3,bw*(1-P.reloading/w.reload),3);ctx.font=`600 12px ${FONT_UI}`;ctx.fillText('RECARREGANDO',x+108,y+52);}
  }
  const gn=invCount('gran'); if(gn>0){ctx.fillStyle='rgba(221,214,198,.6)';ctx.font=`600 12px ${FONT_UI}`;ctx.textAlign='right';ctx.fillText(`GRANADAS ${gn}`,x+bw-10,y+18);ctx.textAlign='left';}
}
function wrapText(t,maxW){const words=t.split(' ');const lines=[];let cur='';for(const w of words){const test=cur?cur+' '+w:w;if(ctx.measureText(test).width>maxW&&cur){lines.push(cur);cur=w;}else cur=test;}if(cur)lines.push(cur);return lines;}
function drawBarkBubble(){
  const b=BARK.cur; if(!b||G.mode!=='play')return;
  const a=(!b.radio&&b.w!=='rafa'&&actorOf(b.w))||P, near=a===P||hyp(a.x-P.x,a.y-P.y)<500;
  const al=clamp(Math.min(BARK.t*5,(b.dur-BARK.t)*3),0,1);
  drawBubble(near?a:P,b.w,b.m,b.t,BARK.shown,b.radio,false,al,2);
}
function drawGrab(){
  const g=P.grab, z=view.z, sx=(P.x-cam.x)*z, sy=(P.y-cam.y)*z, r=40;
  ctx.strokeStyle='rgba(0,0,0,.5)';ctx.lineWidth=6;ctx.beginPath();ctx.arc(sx,sy,r,0,6.283);ctx.stroke();
  ctx.strokeStyle='#d49a3c';ctx.beginPath();ctx.arc(sx,sy,r,-Math.PI/2,-Math.PI/2+6.283*clamp(g.n/g.need,0,1));ctx.stroke();
  ctx.strokeStyle='rgba(210,60,40,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(sx,sy,r+7,-Math.PI/2,-Math.PI/2+6.283*clamp(g.t/1.9,0,1));ctx.stroke();
  const t=P.owned[0]&&P.dur>0?'FACA! ':'';
  ctx.font=`700 ${Math.round(16+Math.sin(renderT*20)*1.5)}px ${FONT_UI}`;ctx.textAlign='center';ctx.fillStyle='#fff';ctx.fillText(t+(IN.touch?'TOQUE! TOQUE!':'APERTE! APERTE!'),sx,sy-r-14);
}
function fitText(t,maxW){if(ctx.measureText(t).width<=maxW)return t;let s=t;while(s.length>4&&ctx.measureText(s+'…').width>maxW)s=s.slice(0,-1);return s+'…';}
function drawAchPop(y){
  const a=G.achPop; if(!a)return; const t=clamp(Math.min(a.life,4-a.life)*3,0,1), f=IN.touch?HUDS[OPT.hud].f:1;
  ctx.font=`700 ${Math.round(13*f)}px ${FONT_UI}`; const w=Math.max(ctx.measureText(a.n).width,ctx.measureText('CONQUISTA DESBLOQUEADA').width)+58*f, h=40*f, x=view.w/2-w/2, yy=y-(1-t)*16;
  ctx.globalAlpha=t; panel(x,yy,w,h); ctx.fillStyle='#d49a3c'; ctx.fillRect(x,yy,w,2);
  ctx.beginPath();ctx.arc(x+20*f,yy+h/2,11*f,0,6.283);ctx.fill(); ctx.fillStyle='#16120c';ctx.font=`700 ${Math.round(13*f)}px ${FONT_UI}`;ctx.textAlign='center';ctx.fillText('✓',x+20*f,yy+h/2+5*f);
  ctx.textAlign='left';ctx.fillStyle='#d49a3c';ctx.font=`700 ${Math.round(9.5*f)}px ${FONT_UI}`;ctx.fillText('CONQUISTA DESBLOQUEADA',x+38*f,yy+15*f);
  ctx.fillStyle='#ddd6c6';ctx.font=`700 ${Math.round(14*f)}px ${FONT_UI}`;ctx.fillText(a.n,x+38*f,yy+32*f); ctx.globalAlpha=1;
}
// HUD do celular: pequeno, nos cantos, sem tampar o centro da tela
function drawHUDTouch(){
  const f=HUDS[OPT.hud].f, L=10+SAFE.l, Tp=8+SAFE.t, Rt=view.w-10-SAFE.r, portrait=view.h>view.w, C=stickCenters();
  // condição: coração + barras
  const r=clamp(P.hp/P.max,0,1), col=r>=.6?'#62c06c':r>=.3?'#d9a33c':'#d24a3a', lab=r>=.6?'BEM':r>=.3?'CUIDADO':'PERIGO';
  const sw=Math.round(142*f), sh=Math.round(38*f);
  const calm=r>=.6&&P.bat>=25&&!(G.heartT>0&&G.heartT<1)&&!P.hidden; ctx.globalAlpha=calm?.5:1;
  panel(L,Tp,sw,sh);
  const beat=r>=.6?1.1:r>=.3?1.6:2.4, ph=(renderT*beat)%1, pulse=1+(ph<.12?Math.sin(ph/.12*Math.PI)*.25:0);
  ctx.save();ctx.translate(L+15*f,Tp+15*f);ctx.scale(pulse*f,pulse*f);ctx.fillStyle=col;ctx.beginPath();ctx.moveTo(0,5);ctx.bezierCurveTo(-9,-1,-6,-9,0,-4);ctx.bezierCurveTo(6,-9,9,-1,0,5);ctx.fill();ctx.restore();
  ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle=col;ctx.font=`700 ${Math.round(14*f)}px ${FONT_UI}`;ctx.fillText(lab,L+28*f,Tp+19*f);
  // traço de ECG pequeno
  {const gx=L+sw-50*f,gw=44*f,gy=Tp+13*f;ctx.save();ctx.beginPath();ctx.rect(gx,Tp+2,gw,22*f);ctx.clip();ctx.strokeStyle=col;ctx.lineWidth=1.5;ctx.beginPath();
   for(let i=0;i<=gw;i+=2){const p2=(((i/gw)*1.2-renderT*beat*.8)%1+1)%1;const yy=gy+ecgY(p2)*8*f;if(i===0)ctx.moveTo(gx+i,yy);else ctx.lineTo(gx+i,yy);}ctx.stroke();ctx.restore();}
  const bx=L+7*f,bw=sw-14*f;
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(bx,Tp+24*f,bw,4*f);ctx.fillStyle=col;ctx.fillRect(bx,Tp+24*f,bw*r,4*f);
  const on=P.lamp&&P.bat>0;ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(bx,Tp+30*f,bw*.62,3*f);ctx.fillStyle=P.bat<20?'#c2433a':on?'#8fb0d0':'#55606a';ctx.fillRect(bx,Tp+30*f,bw*.62*P.bat/100,3*f);
  ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(bx+bw*.66,Tp+30*f,bw*.34,3*f);ctx.fillStyle=P.tired?'#b0493a':'rgba(221,214,198,.6)';ctx.fillRect(bx+bw*.66,Tp+30*f,bw*.34*P.st/100,3*f);
  ctx.globalAlpha=1;
  // relógio: hora do jogo, lua de noite e sol de dia
  const cw=Math.round(80*f), chh=Math.round(22*f), cx0=L+sw+6;
  {const night=isNight(), dl=daylight(); ctx.globalAlpha=calm?.6:.9; panel(cx0,Tp,cw,chh);
   const ix=cx0+11*f, iy=Tp+chh/2;
   if(dl>.3){ctx.fillStyle='#d9b45a';ctx.beginPath();ctx.arc(ix,iy,4*f,0,6.283);ctx.fill();ctx.strokeStyle='#d9b45a';ctx.lineWidth=1.2;for(let k=0;k<8;k++){const an=k*Math.PI/4;ctx.beginPath();ctx.moveTo(ix+Math.cos(an)*5.6*f,iy+Math.sin(an)*5.6*f);ctx.lineTo(ix+Math.cos(an)*7.4*f,iy+Math.sin(an)*7.4*f);ctx.stroke();}}
   else{ctx.fillStyle='#c8cfdc';ctx.beginPath();ctx.arc(ix,iy,5*f,0,6.283);ctx.fill();ctx.fillStyle='#14161a';ctx.beginPath();ctx.arc(ix+2.4*f,iy-1.4*f,4.4*f,0,6.283);ctx.fill();}
   ctx.fillStyle=night?'#c8cfdc':'#ddd6c6';ctx.font=`700 ${Math.round(12.5*f)}px ${FONT_UI}`;ctx.textAlign='left';ctx.fillText(clockStr(),cx0+21*f,Tp+chh/2+4.5*f);
   ctx.fillStyle='rgba(221,214,198,.45)';ctx.font=`600 ${Math.round(8.5*f)}px ${FONT_UI}`;ctx.textAlign='right';ctx.fillText('D'+dayNo(),cx0+cw-5*f,Tp+chh/2+4*f);ctx.globalAlpha=1;}
  // objetivo numa linha só
  const ob=objective();
  ctx.font=`600 ${Math.round(13*f)}px ${FONT_UI}`;
  let ox,oy,ow; const nb=3+(invCount('detector')>0?1:0)+(canFS()&&!isFS()&&!standalone()&&IN.touch?1:0), btnW=(38*nb+6*(nb-1))*f+16;
  if(portrait){ox=L;oy=Tp+sh+6;ow=view.w-L-10-SAFE.r;}
  else{ow=Math.min(440*f,view.w-2*Math.max(cx0+cw+10,btnW+SAFE.r+10));ox=view.w/2-ow/2;oy=Tp;}
  const oh=Math.round(26*f);
  if(ob.t!==G.objTxt){G.objTxt=ob.t;G.objT=0;} G.objT=(G.objT||0)+(G.mode==='play'?lastDt:0);
  const gl=(G.objGl||0)>0&&G.mode==='play', oa=G.mode!=='play'||gl?1:clamp(10-G.objT,0,1);
  if(ow>120&&oa>0){ctx.globalAlpha=oa;panel(ox,oy,ow,oh);ctx.fillStyle=gl?'#c8402a':'#d49a3c';ctx.fillRect(ox,oy,3,oh);ctx.fillStyle=gl?'#e86a5a':'#ddd6c6';ctx.textAlign='left';ctx.fillText(fitText(gl?G.objGlT:ob.t,ow-16),ox+10+(gl?rr(-2,2):0),oy+oh/2+5*f);ctx.globalAlpha=1;}
  if(ob.at)drawCompass(ob.at);
  // arma ou jipe: pílula no centro de baixo
  const pw=Math.round((portrait?124:150)*f),phh=Math.round(34*f),px=view.w/2-pw/2,py=portrait?C.move.y-STICK.r-50*f:view.h-SAFE.b-8-phh;
  const idle=G.time-(G.lastAct||0)>4&&P.reloading<=0&&!P.inCar;
  if((G.mode==='play'||G.mode==='menu')&&!P.hidden){
    ctx.globalAlpha=idle?.45:1;
    panel(px,py,pw,phh);
    if(P.inCar){const vr=clamp(V.hp/V.max,0,1);ctx.fillStyle='rgba(221,214,198,.6)';ctx.font=`600 ${Math.round(10*f)}px ${FONT_UI}`;ctx.textAlign='left';ctx.fillText('JIPE',px+8,py+13*f);
      ctx.textAlign='right';ctx.fillStyle='#ddd6c6';ctx.font=`700 ${Math.round(13*f)}px ${FONT_UI}`;ctx.fillText(Math.round(Math.abs(V.spd)*.36)+' km/h',px+pw-8,py+14*f);
      ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(px+8,py+20*f,pw-16,6*f);ctx.fillStyle=vr>.5?'#8aa060':vr>.25?'#d9a33c':'#d24a3a';ctx.fillRect(px+8,py+20*f,(pw-16)*vr,6*f);}
    else{
      const w=WEAPONS[P.w],M=WMODEL[w.id],s=Math.min(1.6*f,52*f/(M.len+10));
      ctx.save();ctx.beginPath();ctx.rect(px+1,py+1,pw-2,phh-2);ctx.clip();ctx.translate(px+pw-12-M.len*s,py+phh/2+2);ctx.scale(s,s);drawWeaponModel(ctx,w.id,P.mags[P.w]>0,false);ctx.restore();
      ctx.textAlign='left';
      if(w.id==='faca'){ctx.fillStyle='#ddd6c6';ctx.font=`700 ${Math.round(12*f)}px ${FONT_UI}`;ctx.fillText('FACA',px+10,py+14*f);const dr=clamp(P.dur/30,0,1);ctx.fillStyle='rgba(0,0,0,.5)';ctx.fillRect(px+10,py+20*f,62*f,5*f);ctx.fillStyle=P.dur<=5?'#d24a3a':'#c8ccd0';ctx.fillRect(px+10,py+20*f,62*f*dr,5*f);}
      else if(w.melee){ctx.fillStyle='rgba(221,214,198,.7)';ctx.font=`700 ${Math.round(12*f)}px ${FONT_UI}`;ctx.fillText('MÃOS VAZIAS',px+10,py+phh/2+5*f);}
      else{const mag=P.mags[P.w],res=invCount(w.ammo);if(w.id==='pistola'&&P.sil>0){ctx.fillStyle='#8fb0d0';ctx.font=`700 ${Math.round(9*f)}px ${FONT_UI}`;ctx.textAlign='right';ctx.fillText('SIL '+P.sil,px+pw-8,py+11*f);ctx.textAlign='left';}ctx.fillStyle=mag===0?'#d24a3a':'#ddd6c6';ctx.font=`700 ${Math.round(19*f)}px ${FONT_UI}`;ctx.fillText(String(mag),px+10,py+phh/2+7*f);
        const mw=ctx.measureText(String(mag)).width;ctx.fillStyle='rgba(221,214,198,.55)';ctx.font=`600 ${Math.round(12*f)}px ${FONT_UI}`;ctx.fillText('/ '+res,px+14+mw,py+phh/2+6*f);
        if(P.reloading>0){ctx.fillStyle='#d49a3c';ctx.fillRect(px,py+phh-3,pw*(1-P.reloading/w.reload),3);}}
    }
    ctx.globalAlpha=1;
  }
  // PC: aviso do que dá pra usar logo acima da arma
  if(!IN.touch&&G.prompt&&G.mode==='play'){
    const t=promptText(G.prompt);ctx.font=`600 ${Math.round(14*f)}px ${FONT_UI}`;const tw=ctx.measureText(t).width+44,qx=view.w/2-tw/2,qy=py-38*f;
    panel(qx,qy,tw,28*f);ctx.fillStyle='#d49a3c';ctx.fillRect(qx+6,qy+5*f,20,18*f);ctx.fillStyle='#141210';ctx.font=`700 ${Math.round(12*f)}px ${FONT_UI}`;ctx.textAlign='center';ctx.fillText('E',qx+16,qy+18*f);
    ctx.textAlign='left';ctx.fillStyle='#ddd6c6';ctx.font=`600 ${Math.round(14*f)}px ${FONT_UI}`;ctx.fillText(t,qx+34,qy+19*f);
  }
  // avisos: canto superior direito, abaixo dos botões
  ctx.font=`500 ${Math.round(12.5*f)}px ${FONT_UI}`;ctx.textAlign='right';
  let ty=portrait?view.h*.56:Tp+54*f; const tmax=portrait?view.w-40:Math.min(300*f,view.w*.36);
  if(portrait)ctx.textAlign='center';
  const shown=G.toasts.slice(-2);
  for(let i=shown.length-1;i>=0;i--){const t=shown[i],a=clamp(t.life,0,1),tl=wrapText(t.t,tmax);
    for(const line of tl){const w2=ctx.measureText(line).width+14,tx2=portrait?view.w/2+w2/2:Rt;ctx.fillStyle=`rgba(0,0,0,${.6*a})`;ctx.fillRect(tx2-w2,ty-13*f,w2,18*f);ctx.fillStyle=`rgba(225,218,200,${a})`;ctx.fillText(line,portrait?view.w/2:Rt-7,ty);ty+=19*f;}ty+=3;}
  ctx.textAlign='center';
  if(G.banner){const a=clamp(Math.min(G.banner.life,3.2-G.banner.life)*2,0,1);ctx.fillStyle=`rgba(225,218,200,${a*.92})`;ctx.font=`${Math.round((portrait?20:24)*f)}px ${FONT_TW}`;ctx.fillText(G.banner.t,view.w/2,view.h*(portrait?.62:.64));
    ctx.fillStyle=`rgba(212,154,60,${a})`;ctx.fillRect(view.w/2-30,view.h*(portrait?.62:.64)+10,60,2);}
  let cy=oy+oh+(portrait?44:20)*f;
  if(G.wave>0){ctx.fillStyle='#ddd6c6';ctx.font=`700 ${Math.round(30*f)}px ${FONT_UI}`;ctx.fillText(String(Math.ceil(G.wave)),view.w/2,cy+18*f);ctx.font=`600 ${Math.round(10*f)}px ${FONT_UI}`;ctx.fillStyle='#d49a3c';ctx.fillText('SEGUNDOS ATÉ O RESGATE',view.w/2,cy+30*f);cy+=40*f;}
  const seen=e=>G.time-(e.seenT??-99)<5;
  const pers=enemies.find(e=>(e.type==='boss'||e.t.boss&&e.state==='chase')&&e.alive&&seen(e)&&hyp(e.x-P.x,e.y-P.y)<900)||enemies.find(e=>e.stalker&&e.down<=0&&seen(e));
  if(pers&&hyp(pers.x-P.x,pers.y-P.y)<(pers.stalker?640:900)){
    const bw=Math.min(240*f,view.w*.5),bx2=view.w/2-bw/2,by=cy+6;
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(bx2,by,bw,5);ctx.fillStyle='#a8322b';ctx.fillRect(bx2,by,bw*clamp(pers.hp/pers.max,0,1),5);
    ctx.fillStyle='rgba(225,218,200,.8)';ctx.font=`${Math.round(12*f)}px ${FONT_TW}`;ctx.fillText(pers.t.n,view.w/2,by-4);
  }
  drawAchPop(portrait?view.h*.44:oy+oh+8);
  if(invCount('detector')>0&&(G.mode==='play'||G.mode==='menu')&&!P.inCar)drawRadar(L,portrait?oy+oh+8:Tp+sh+8,f);
  if(IN.touch)drawSticks();
  else if(IN.mouseOn&&G.mode==='play'){const mx=IN.mouseX,my=IN.mouseY;ctx.strokeStyle='rgba(212,154,60,.85)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mx,my,7,0,6.283);ctx.stroke();
    ctx.beginPath();ctx.moveTo(mx-14,my);ctx.lineTo(mx-9,my);ctx.moveTo(mx+9,my);ctx.lineTo(mx+14,my);ctx.moveTo(mx,my-14);ctx.lineTo(mx,my-9);ctx.moveTo(mx,my+9);ctx.lineTo(mx,my+14);ctx.stroke();}
  if(DBG.fps){ctx.font=`700 12px ${FONT_UI}`;ctx.textAlign='left';ctx.fillStyle='#7ae0ff';ctx.fillText(`${FPS.v|0} FPS · ${enemies.length} inimigos`,L,Tp+sh+(portrait?44:16));}
}
function drawHUD(){
  if(G.mode==='title')return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(CUT.on||CUT.lb>0){drawPedBubbles();drawCutOverlay();if(CUT.on)return;}
  drawPedBubbles(); drawBarkBubble();
  if(P.grab)drawGrab();
  return drawHUDTouch();
  const L=16+SAFE.l,Tp=16+SAFE.t,Rt=view.w-16-SAFE.r,Bt=view.h-16-SAFE.b, narrow=view.w<720, touch=IN.touch;
  drawECG(L,Tp);
  const ob=objective();
  ctx.font=`600 15px ${FONT_UI}`;
  const ow=narrow?Math.min(view.w-32-SAFE.l-SAFE.r,360):Math.min(460,view.w-480);
  const lines=wrapText(ob.t,ow-20);
  const ox=narrow?L:view.w/2-ow/2, oy=narrow?Tp+92:Tp, oh=26+lines.length*19;
  panel(ox,oy,ow,oh);
  ctx.textAlign='left';ctx.fillStyle='#d49a3c';ctx.font=`700 11px ${FONT_UI}`;ctx.fillText('OBJETIVO',ox+10,oy+16);
  ctx.fillStyle='#ddd6c6';ctx.font=`600 15px ${FONT_UI}`;lines.forEach((l,i)=>ctx.fillText(l,ox+10,oy+34+i*19));
  const C=touch?stickCenters():null, land=view.w>view.h;
  if(touch){if(land)drawWeaponBox(view.w/2-98,Bt-64);else drawWeaponBox(Rt-196,narrow?oy+oh+8:Tp+56);} else drawWeaponBox(Rt-196,Bt-64);
  if(ob.at)drawCompass(ob.at);
  if(G.prompt&&G.mode==='play'){
    const t=promptText(G.prompt);ctx.font=`600 17px ${FONT_UI}`;
    const key=touch?'USAR':'E', kw=touch?44:24, tw=ctx.measureText(t).width+kw+30;
    let px=view.w/2-tw/2, py=Bt-88;
    if(touch){px=view.w/2-tw/2;py=land?Bt-112:C.aim.y-212;}
    panel(px,py,tw,34);ctx.fillStyle='#d49a3c';ctx.fillRect(px+8,py+7,kw,20);ctx.fillStyle='#141210';ctx.font=`700 13px ${FONT_UI}`;ctx.textAlign='center';ctx.fillText(key,px+8+kw/2,py+22);
    ctx.textAlign='left';ctx.fillStyle='#ddd6c6';ctx.font=`600 17px ${FONT_UI}`;ctx.fillText(t,px+kw+18,py+23);
  }
  ctx.font=`500 16px ${FONT_UI}`;ctx.textAlign='center';
  let ty=Bt-134; let tcx=view.w/2;
  if(touch)ty=land?Bt-130:C.aim.y-232;
  for(let i=G.toasts.length-1;i>=0;i--){const t=G.toasts[i];const a=clamp(t.life,0,1);const tl=wrapText(t.t,Math.min(560,view.w-60,touch&&land?view.w-560:9999));
    for(let j=tl.length-1;j>=0;j--){ctx.fillStyle=`rgba(0,0,0,${.55*a})`;const w2=ctx.measureText(tl[j]).width+20;ctx.fillRect(tcx-w2/2,ty-17,w2,23);ctx.fillStyle=`rgba(225,218,200,${a})`;ctx.fillText(tl[j],tcx,ty);ty-=24;}ty-=4;}
  if(G.banner){const a=clamp(Math.min(G.banner.life,3.2-G.banner.life)*2,0,1);ctx.fillStyle=`rgba(225,218,200,${a})`;ctx.font=`${narrow?28:40}px ${FONT_TW}`;ctx.fillText(G.banner.t,view.w/2,view.h*.32);
    ctx.fillStyle=`rgba(212,154,60,${a})`;ctx.fillRect(view.w/2-40,view.h*.32+16,80,2);}
  if(G.wave>0){ctx.fillStyle='#ddd6c6';ctx.font=`700 46px ${FONT_UI}`;ctx.fillText(String(Math.ceil(G.wave)),view.w/2,narrow?Tp+170:Tp+92);ctx.font=`600 12px ${FONT_UI}`;ctx.fillStyle='#d49a3c';ctx.fillText('SEGUNDOS ATÉ O RESGATE',view.w/2,narrow?Tp+188:Tp+110);}
  const pers=enemies.find(e=>e.type==='boss'&&e.alive&&hyp(e.x-P.x,e.y-P.y)<900)||enemies.find(e=>e.type==='pers'&&e.down<=0);
  if(pers&&hyp(pers.x-P.x,pers.y-P.y)<(pers.type==='boss'?900:640)){
    const bw=Math.min(300,view.w-80),bx=view.w/2-bw/2,by=touch?(land?Tp+96:C.aim.y-290):Bt-44;
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(bx,by,bw,7);ctx.fillStyle='#a8322b';ctx.fillRect(bx,by,bw*clamp(pers.hp/pers.max,0,1),7);
    ctx.fillStyle='rgba(225,218,200,.85)';ctx.font=`15px ${FONT_TW}`;ctx.fillText(pers.t.n,view.w/2,by-6);
  }
  if(IN.mouseOn&&!touch&&G.mode==='play'){
    const mx=IN.mouseX,my=IN.mouseY;ctx.strokeStyle='rgba(212,154,60,.9)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(mx,my,7,0,6.283);ctx.stroke();
    ctx.beginPath();ctx.moveTo(mx-14,my);ctx.lineTo(mx-9,my);ctx.moveTo(mx+9,my);ctx.lineTo(mx+14,my);ctx.moveTo(mx,my-14);ctx.lineTo(mx,my-9);ctx.moveTo(mx,my+9);ctx.lineTo(mx,my+14);ctx.stroke();
  }
  drawAchPop(Tp+(narrow?150:96));
  if(DBG.fps){ctx.font=`700 13px ${FONT_UI}`;ctx.textAlign='right';ctx.fillStyle='#7ae0ff';ctx.fillText(`${FPS.v|0} FPS · ${enemies.length} inimigos · ${parts.length} partículas`,Rt,Bt-(touch?240:80));}
  if(DBG.god||DBG.ammo||DBG.noclip||DBG.freeze){ctx.font=`700 11px ${FONT_UI}`;ctx.textAlign='left';ctx.fillStyle='#7ae0ff';ctx.fillText('MODO DE TESTE',L,Tp+(view.w<720?180:108));}
}
// detector de presença: disco no canto, norte para cima, só mostra o que se mexe
function drawRadar(x,y,f){
  const R=Math.round(38*f), cx=x+R, cy=y+R, on=G.detOn;
  ctx.save(); ctx.globalAlpha=on?.92:.4;
  ctx.fillStyle='rgba(8,14,10,.78)';ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.fill();
  ctx.strokeStyle=on?'rgba(110,200,120,.55)':'rgba(160,160,150,.35)';ctx.lineWidth=1.2;
  ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.stroke();ctx.beginPath();ctx.arc(cx,cy,R*.5,0,6.283);ctx.stroke();
  ctx.beginPath();ctx.moveTo(cx-R,cy);ctx.lineTo(cx+R,cy);ctx.moveTo(cx,cy-R);ctx.lineTo(cx,cy+R);ctx.globalAlpha*=.4;ctx.stroke();ctx.globalAlpha=on?.92:.4;
  if(on){
    const sa=renderT*4.2; const g=ctx.createConicGradient?ctx.createConicGradient(sa-.9,cx,cy):null;
    if(g){g.addColorStop(0,'rgba(110,220,130,0)');g.addColorStop(.14,'rgba(110,220,130,.28)');g.addColorStop(.15,'rgba(110,220,130,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(cx,cy,R,0,6.283);ctx.fill();}
    else{ctx.strokeStyle='rgba(110,220,130,.5)';ctx.beginPath();ctx.moveTo(cx,cy);ctx.lineTo(cx+Math.cos(sa)*R,cy+Math.sin(sa)*R);ctx.stroke();}
    for(const b of G.blips){const dx=(b.x-P.x)/DET_R,dy=(b.y-P.y)/DET_R,l=hyp(dx,dy);if(l>1)continue;
      ctx.fillStyle=`rgba(235,70,50,${b.a})`;ctx.beginPath();ctx.arc(cx+dx*R,cy+dy*R,(b.big?3.6:2.4)*f,0,6.283);ctx.fill();
      ctx.strokeStyle=`rgba(235,70,50,${b.a*.4})`;ctx.beginPath();ctx.arc(cx+dx*R,cy+dy*R,(1-b.a)*9*f+3,0,6.283);ctx.stroke();}
  }
  ctx.fillStyle='#ddd6c6';ctx.save();ctx.translate(cx,cy);ctx.rotate(P.ang);ctx.beginPath();ctx.moveTo(4*f,0);ctx.lineTo(-3*f,-2.6*f);ctx.lineTo(-3*f,2.6*f);ctx.closePath();ctx.fill();ctx.restore();
  // pilha
  const bw=R*2-8;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x+4,y+R*2+4,bw,3*f);ctx.fillStyle=P.det<20?'#c2433a':'#6ec07a';ctx.fillRect(x+4,y+R*2+4,bw*clamp(P.det/100,0,1),3*f);
  ctx.font=`700 ${Math.round(8*f)}px ${FONT_UI}`;ctx.textAlign='center';ctx.fillStyle=on?'rgba(150,220,160,.8)':'rgba(200,200,190,.6)';ctx.fillText(on?'PRESENÇA':IN.touch?'DESLIGADO':'T · LIGAR',cx,y+R*2+16*f);
  ctx.restore();
}
const FPS={v:60,n:0,t:0};
function drawCompass(at){
  const z=view.z, sx=(at.x-cam.x)*z, sy=(at.y-cam.y)*z, m=46+Math.max(SAFE.l,SAFE.r,SAFE.t,SAFE.b);
  const d=hyp(at.x-P.x,at.y-P.y), meters=Math.round(d/TILE*1.5);
  ctx.textAlign='center';ctx.font=`700 12px ${FONT_UI}`;
  if(sx>m&&sx<view.w-m&&sy>m&&sy<view.h-m){
    const bob=Math.sin(renderT*4)*3;ctx.fillStyle='rgba(212,154,60,.9)';ctx.beginPath();ctx.moveTo(sx,sy-18+bob);ctx.lineTo(sx+7,sy-28+bob);ctx.lineTo(sx,sy-38+bob);ctx.lineTo(sx-7,sy-28+bob);ctx.closePath();ctx.fill();
    return;
  }
  const cx=(P.x-cam.x)*z,cy=(P.y-cam.y)*z,a=Math.atan2(sy-cy,sx-cx);
  const k=IN.touch?clamp(Math.min(view.w,view.h)*.26,70,130):clamp(Math.min(view.w,view.h)*.3,90,170);
  const ex=cx+Math.cos(a)*k,ey=cy+Math.sin(a)*k;
  ctx.save();ctx.translate(ex,ey);ctx.rotate(a);ctx.fillStyle='rgba(212,154,60,.95)';ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-6,-9);ctx.lineTo(-2,0);ctx.lineTo(-6,9);ctx.closePath();ctx.fill();ctx.restore();
  ctx.fillStyle='rgba(225,218,200,.85)';ctx.fillText(meters+' m',ex-Math.cos(a)*24,ey-Math.sin(a)*24+4);
}
function drawSticks(){
  if(G.mode!=='play')return;
  const C=stickCenters(),Rr=STICK.r;
  for(const [s,c,isAim] of [[TOUCH.move,C.move,false],[TOUCH.aim,C.aim,true]]){
    const active=s.id!==null;
    ctx.fillStyle=active?'rgba(10,12,11,.32)':'rgba(10,12,11,.18)';ctx.beginPath();ctx.arc(c.x,c.y,Rr,0,6.283);ctx.fill();
    ctx.strokeStyle=active?'rgba(221,214,198,.4)':'rgba(221,214,198,.14)';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(c.x,c.y,Rr,0,6.283);ctx.stroke();
    if(isAim){ctx.strokeStyle='rgba(212,154,60,.35)';ctx.lineWidth=1.5;ctx.setLineDash([4,5]);ctx.beginPath();ctx.arc(c.x,c.y,Rr*.38,0,6.283);ctx.stroke();ctx.setLineDash([]);}
    let kx=c.x,ky=c.y,d=0;
    if(active){const dx=s.x-c.x,dy=s.y-c.y;d=hyp(dx,dy);const a=Math.atan2(dy,dx),dd=Math.min(Rr,d);kx=c.x+Math.cos(a)*dd;ky=c.y+Math.sin(a)*dd;}
    const firing=isAim&&active&&d>Rr*.38;
    ctx.fillStyle=firing?'rgba(212,154,60,.7)':active?'rgba(221,214,198,.38)':'rgba(221,214,198,.12)';ctx.beginPath();ctx.arc(kx,ky,Rr*.42,0,6.283);ctx.fill();
    if(!active&&G.time<40){ctx.fillStyle=`rgba(221,214,198,${.5*clamp((40-G.time)/8,0,1)})`;ctx.font=`700 10px ${FONT_UI}`;ctx.textAlign='center';ctx.fillText(isAim?(P.inCar?'BUZINA':'MIRAR'):(P.inCar?'DIRIGIR':'ANDAR'),c.x,c.y+4);}
  }
}

// ===================== MAPA =====================
const MAPC={};
MAPC[T.GRASS]=[38,52,34];MAPC[T.ROAD]=[58,59,62];MAPC[T.SIDE]=[84,81,76];MAPC[T.WOOD]=[92,74,56];MAPC[T.TILEF]=[96,98,98];MAPC[T.WALL]=[18,18,20];
MAPC[T.WATER]=[22,56,76];MAPC[T.DIRT]=[74,62,44];MAPC[T.PIER]=[90,72,50];MAPC[T.BORDER]=[120,116,108];MAPC[T.PROP]=[70,64,56];MAPC[T.TREE]=[28,56,30];
MAPC[T.FENCE]=[100,104,100];MAPC[T.GATE]=[201,161,74];MAPC[T.CAR]=[74,60,58];MAPC[T.CONC]=[80,80,76];MAPC[T.SAFE]=[60,140,90];MAPC[T.GRAVEL]=[66,64,56];MAPC[T.RUBBLE]=[90,80,70];MAPC[T.CARPET]=[80,40,40];MAPC[T.SAND]=[150,134,98];MAPC[T.ROCK]=[70,66,62];MAPC[T.FOREST]=[20,40,24];MAPC[T.SHUTTER]=[90,92,96];
function drawMapTo(c){
  const cx=c.getContext('2d');
  const img=cx.createImageData(W,H);
  for(let i=0;i<W*H;i++){
    let col=MAPC[map[i]]||[40,40,40];
    if(bmap[i]>=0&&!SOLID[map[i]]&&map[i]!==T.SAFE)col=[col[0]+18,col[1]+14,col[2]+10];
    const e=explored[i]; const o=i*4;
    if(e){img.data[o]=col[0];img.data[o+1]=col[1];img.data[o+2]=col[2];img.data[o+3]=255;}
    else{img.data[o]=12;img.data[o+1]=14;img.data[o+2]=13;img.data[o+3]=255;}
  }
  const tmp=document.createElement('canvas');tmp.width=W;tmp.height=H;tmp.getContext('2d').putImageData(img,0,0);
  const s=Math.min(c.width/W,c.height/H), ox=(c.width-W*s)/2, oy=(c.height-H*s)/2;
  cx.fillStyle='#0b0d0c';cx.fillRect(0,0,c.width,c.height);
  cx.imageSmoothingEnabled=false;cx.drawImage(tmp,ox,oy,W*s,H*s);
  const px=v=>ox+v/TILE*s, py=v=>oy+v/TILE*s;
  cx.textAlign='center';cx.textBaseline='middle';
  cx.font=`${Math.max(11,s*3.2)}px ${FONT_TW}`;
  cx.save();cx.shadowColor='#000';cx.shadowBlur=4;
  DISTRICTS.forEach((D,d)=>{cx.fillStyle='rgba(235,228,210,.85)';cx.fillText(D.short.toUpperCase(),ox+(D.mx||96)*s,oy+((D.y0+D.y1)/2+(D.my||0))*s);});
  cx.font=`${Math.max(9,s*2.4)}px ${FONT_TW}`;cx.fillStyle='rgba(140,180,210,.7)';
  cx.fillText('OCEANO ATLÂNTICO',ox+184*s,oy+96*s);cx.fillText('RIO ITAJAÍ-AÇU',ox+85*s,oy+6*s);cx.fillText('RIO CAMBORIÚ',ox+100*s,oy+391*s);cx.fillText('PRAIA DAS LARANJEIRAS',ox+150*s,oy+446*s);
  cx.restore();
  for(const b of buildings){if(!b.safe)continue;const k=idx(b.x,b.y);if(!explored[k]&&!G.flags.mapAll)continue;cx.fillStyle='#4ad06a';cx.fillRect(ox+(b.x+b.w/2)*s-4,oy+(b.y+b.h/2)*s-4,8,8);}
  for(const g of gates){if(g.open)continue;const k=idx(g.x,g.y);if(!explored[k])continue;cx.fillStyle=g.col;cx.beginPath();cx.arc(ox+(g.x+g.w/2)*s,oy+(g.y+g.h/2)*s,Math.max(4,s*1.6),0,6.283);cx.fill();}
  if(!V.dead&&(explored[idx((V.x/TILE)|0,(V.y/TILE)|0)]||G.flags.mapAll)){cx.fillStyle='#8aa060';cx.fillRect(px(V.x)-5,py(V.y)-3,10,6);}
  const ob=objective();
  if(ob.at){const x=px(ob.at.x),y=py(ob.at.y),r=Math.max(6,s*2)+Math.sin(renderT*5)*1.5;cx.strokeStyle='#d49a3c';cx.lineWidth=2;cx.beginPath();cx.moveTo(x,y-r);cx.lineTo(x+r,y);cx.lineTo(x,y+r);cx.lineTo(x-r,y);cx.closePath();cx.stroke();}
  cx.save();cx.translate(px(P.x),py(P.y));cx.rotate(P.ang);cx.fillStyle='#ddd6c6';cx.beginPath();cx.moveTo(8,0);cx.lineTo(-5,-5);cx.lineTo(-3,0);cx.lineTo(-5,5);cx.closePath();cx.fill();cx.restore();
}
