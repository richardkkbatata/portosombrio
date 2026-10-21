// ===================== 1.16 · ADRENALINA E O SOM DAS LUTAS =====================
// - Injeção de adrenalina: poucas espalhadas pelo mapa. Por 25 segundos o Richard corre um pouco mais
//   rápido e não cansa (fôlego infinito). Indicador no canto da tela com o tempo que falta.
// - Som nas lutas de chefe: a música de chefe ligava e desligava toda vez que o chefe passava da
//   distância de 760 (o Cervo desperto, as investidas), recomeçando do zero e "engasgando".
//   Agora ela fica ligada enquanto a luta dura. E se o jogo travar um instante, a música não
//   despeja de uma vez todas as notas atrasadas (dava um estouro).

// ---------- a injeção ----------
ITEMS.adren={n:'Injeção de adrenalina',s:'ADRENA',c:'#d8483a',st:2,k:'heal',h:0,d:'Seringa de adrenalina de uma ambulância. Por 25 segundos você corre mais rápido e não cansa. Depois, o corpo cobra.'};
const ADR={dur:25,mul:1.18};
function adrOn(){return (P.adren||0)>0;}
function adrUse(){
  if(adrOn()){toast('Você já está com adrenalina no sangue.');return false;}
  if(!invRemove('adren',1))return false;
  P.adren=ADR.dur; P.adrBase=DBG.speed; DBG.speed=P.adrBase*ADR.mul; P.st=100; P.tired=false;
  AU.heal&&AU.heal(); G.shake+=2; buzz&&buzz([30,40,30]); G.fear=Math.max(0,(G.fear||0)-.3);
  toast('Adrenalina! Por 25 segundos você corre mais e não cansa.');
  if(!G.flags.adrTip){G.flags.adrTip=true;later(500,()=>bark('rafa','a','Meu coração... tá na boca. Eu consigo correr pra sempre.',{dur:2.2}));}
  return true;
}
function adrEnd(quiet){
  if(P.adrBase!=null)DBG.speed=P.adrBase; const was=P.adrBase!=null||adrOn(); P.adrBase=null; P.adren=0;
  if(was&&!quiet){P.st=0;P.tired=true;toast('A adrenalina passou. Você está sem fôlego.');}
}
{const hw=healWith; healWith=function(id){if(id==='adren')return adrUse();return hw.apply(this,arguments);};}
{const vt=v16Tick; v16Tick=function(dt){vt(dt);
  if(!adrOn()||G.mode!=='play')return;
  P.adren-=dt; P.st=100; P.tired=false;
  if(P.adrBase!=null&&DBG.speed!==P.adrBase*ADR.mul)DBG.speed=P.adrBase*ADR.mul;   // o menu de teste pode ter mexido
  G.ev.adrHb=(G.ev.adrHb||0)-dt; if(G.ev.adrHb<=0){G.ev.adrHb=.5;const danger=P.hp<P.max*.35||(G.fear||0)>.55||(typeof musicMode==='function'&&musicMode()==='boss');if(!danger)AU.cbHeart&&AU.cbHeart(.5,1.25);}
  if(P.adren<=0)adrEnd(false);};}
{const rs=resetState; resetState=function(d){if(P&&P.adrBase!=null)DBG.speed=P.adrBase;rs(d);P.adren=0;P.adrBase=null;};}
{const ls=loadState; loadState=function(){adrEnd(true);return ls.apply(this,arguments);};}
// o indicador: logo embaixo do painel de saúde
function adrDraw(){
  if(!adrOn()||G.mode!=='play'||CUT.on)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const f=typeof hudF==='function'?hudF():1, x=(SAFE.l||0)+10, y=(SAFE.t||0)+(IN.touch?(view.h>view.w?86:56):56)*f, w=140*f, h=20*f, k=clamp(P.adren/ADR.dur,0,1);
  const pul=.75+.25*Math.sin(renderT*9);
  ctx.fillStyle='rgba(8,8,8,.78)';ctx.fillRect(x,y,w,h);ctx.fillStyle=`rgba(216,72,58,${pul})`;ctx.fillRect(x,y,3*f,h);
  ctx.fillStyle='rgba(216,72,58,.35)';ctx.fillRect(x+3*f,y+h-4*f,(w-3*f)*k,4*f);
  ctx.fillStyle='#e9e1cc';ctx.font=`700 ${11*f}px ${FONT_UI}`;ctx.textAlign='left';ctx.textBaseline='middle';
  ctx.fillText(`ADRENALINA · ${Math.ceil(P.adren)}s`,x+9*f,y+h/2-1*f);ctx.textBaseline='alphabetic';
  // as bordas da tela pulsam de leve
  const g=ctx.createRadialGradient(view.w/2,view.h/2,Math.min(view.w,view.h)*.42,view.w/2,view.h/2,Math.max(view.w,view.h)*.75);g.addColorStop(0,'rgba(140,20,14,0)');g.addColorStop(1,`rgba(140,20,14,${.12*pul*(k<.2?.5:1)})`);ctx.fillStyle=g;ctx.fillRect(0,0,view.w,view.h);
}
{const dh=drawHUD; drawHUD=function(){const r=dh.apply(this,arguments);try{adrDraw();}catch(e){}return r;};}
// poucas no mapa: dentro de prédios com saque, longe umas das outras (e uma em Camboriú)
function adrSpread(){
  const old=rnd; rnd=mulberry32(11616); const got=[];
  const okTile=(x,y)=>{if(!inb(x,y))return false;const k=idx(x,y);return !SOLID[map[k]]&&reach[k]&&!pickOcc.has(k)&&!safeMask[k];};
  const cand=buildings.filter(b=>b.loot&&!b.safe&&b.y<H-2&&b.w>=6&&b.h>=6);
  for(let t=0;t<400&&got.length<6&&cand.length;t++){const b=cand[(R()*cand.length)|0],x=b.x+1+((R()*(b.w-2))|0),y=b.y+1+((R()*(b.h-2))|0);
    if(!okTile(x,y)||got.some(p=>Math.abs(p[0]-x)+Math.abs(p[1]-y)<45))continue;got.push([x,y]);}
  got.forEach(([x,y],i)=>{pickups.push({uid:'adr'+i,tx:x,ty:y,x:tc(x),y:tc(y),id:'adren',q:1,kind:'item'});pickOcc.add(idx(x,y));});
  if(typeof CBL!=='undefined'&&CBL.tgB!=null){const [x,y]=freeTileNear(77,cbY(51),true);if(okTile(x,y)){pickups.push({uid:'cbAdr',tx:x,ty:y,x:tc(x),y:tc(y),id:'adren',q:1,kind:'item'});pickOcc.add(idx(x,y));}}
  rnd=old;
}
{const g=genV12; genV12=function(){g();try{adrSpread();}catch(e){console.error('adrenalina',e);}};}
// o capítulo da Sonia redesenha a parte de baixo do mapa: a de Camboriú sai junto
if(typeof genNav==='function'){const gn=genNav;genNav=function(){for(let i=pickups.length-1;i>=0;i--)if(pickups[i].uid==='cbAdr')pickups.splice(i,1);return gn.apply(this,arguments);};}

// ---------- música de chefe estável ----------
{const mm=musicMode; musicMode=function(){
  const m=mm();
  if(G.mode!=='play'){return m;}
  const boss=enemies.find(e=>e.alive&&e.t&&e.t.boss&&e.type!=='ouvinte'&&hyp(e.x-P.x,e.y-P.y)<1800);
  if(m==='boss'){MUS.bossT=G.time;return m;}
  // a luta continua enquanto o chefe estiver perto, ou por alguns segundos depois de sumir da vista
  if(m==null&&boss&&MUS.bossT!=null&&(G.time-MUS.bossT<10||(boss.state==='chase'&&hyp(boss.x-P.x,boss.y-P.y)<1400))){if(boss.state==='chase')MUS.bossT=G.time;return 'boss';}
  return m;};}
{const mt=AU.musicTick; AU.musicTick=function(mode){
  try{const c=this.ctx;if(c&&MUS.mode===mode&&MUS.t<c.currentTime-.1)MUS.t=c.currentTime+.05;}catch(e){}
  return mt.apply(this,arguments);};}

// ---------- menu de teste ----------
dbgExtra('1.16 · Adrenalina',[['adr:dar','Ganhar 2 injeções de adrenalina'],['adr:usar','Usar uma injeção agora'],['adr:fim','Acabar o efeito']],function(k){
  const close=()=>{if(UI.close)UI.close();G.mode='play';};
  if(k==='adr:dar'){const l=invAdd('adren',2);if(l)boxAdd('adren',l);return toast('2 injeções de adrenalina.');}
  if(k==='adr:usar'){close();if(invCount('adren')<=0)invAdd('adren',1);return adrUse();}
  if(k==='adr:fim'){close();return adrEnd(false);}
});

// ---------- Camboriú: lanterna de quem sumiu não fica acesa boiando ----------
// (só a morte por tiro/golpe apagava a luz; quem sumia na procissão, na missa ou na volta deixava a luz no chão)
{const vt=v16Tick; v16Tick=function(dt){vt(dt);
  if(G.mode!=='play'||typeof cbOn!=='function'||!cbOn())return;
  for(const e of enemies)if(e._l&&e.alive)e._l.dono=e;
  for(let i=lights.length-1;i>=0;i--){const l=lights[i];if(l.dono&&!l.dono.alive){if(l.dono._l===l)l.dono._l=null;lights.splice(i,1);}}};}
