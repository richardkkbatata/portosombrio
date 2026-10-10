// ===================== 1.8.3 · multiplayer: caído de verdade e menos atraso =====================
// (só mexe no multiplayer; o jogo solo não muda)

// ---------- caído não atira, não anda, não cura, não joga granada ----------
// O updPlayer lê os controles de novo (readInput) depois da trava antiga, então a trava fica aqui.
const mpCaido=()=>MP.on&&P.mpDown>0;
{const ri=readInput; readInput=function(){ri.apply(this,arguments); if(mpCaido()){IN.mx=0;IN.my=0;IN.fire=false;IN.run=false;}};}
{const f=reload;reload=function(){if(mpCaido())return;return f.apply(this,arguments);};}
{const f=quickHeal;quickHeal=function(){if(mpCaido())return;return f.apply(this,arguments);};}
{const f=healWith;healWith=function(){if(mpCaido())return;return f.apply(this,arguments);};}
{const f=throwGrenade;throwGrenade=function(){if(mpCaido())return;return f.apply(this,arguments);};}
{const f=melee;melee=function(){if(mpCaido())return;return f.apply(this,arguments);};}
{const f=toggleCrouch;toggleCrouch=function(){if(mpCaido())return;return f.apply(this,arguments);};}
{const f=cycleWeapon;cycleWeapon=function(){if(mpCaido())return;return f.apply(this,arguments);};}
{const f=doInteract;doInteract=function(){if(mpCaido())return;return f.apply(this,arguments);};}
// enquanto caído a vida fica em 0 (os amigos veem que você caiu e podem te levantar)
{const vt=v16Tick; v16Tick=function(dt){vt(dt); if(mpCaido()){P.hp=0;P.firing=false;}};}

// ---------- menos atraso: prever onde cada um está ----------
// Cada posição que chega já é "do passado" (metade do ping + o intervalo entre atualizações).
// Com a velocidade das últimas atualizações, o alvo é empurrado pra onde a coisa deve estar AGORA.
const mpRttS=()=>clamp((MP.srvRtt||100)/1000,0.02,0.6);
function mpPrevVel(o,x,y,maxV){const t=Date.now()/1000;
  if(o._pt!=null){const dt=t-o._pt;if(dt>0.01){let vx=(x-o._px)/dt,vy=(y-o._py)/dt;if(hyp(vx,vy)>maxV){vx=0;vy=0;}
    o._vx=(o._vx||0)*.4+vx*.6;o._vy=(o._vy||0)*.4+vy*.6;}}
  else{o._vx=0;o._vy=0;}
  o._pt=t;o._px=x;o._py=y;}
{const as=mpApplySnap; mpApplySnap=function(m){as.apply(this,arguments);
  const lz=Math.min(.25,mpRttS()/2+.03), lp=Math.min(.3,mpRttS()+.03);
  for(const g of MP.ghosts.values())if(g.tx!=null&&g.seen===G.time){mpPrevVel(g,g.tx,g.ty,320);g.tx+=g._vx*lz;g.ty+=g._vy*lz;}
  for(const [id,q] of Object.entries(m.p||{})){const r=MP.remote[id];if(!r||id===MP.myId)continue;mpPrevVel(r,q.x,q.y,420);r.tx=q.x+r._vx*lp;r.ty=q.y+r._vy*lp;}};}
// anfitrião: posição prevista de cada convidado (usada pelos zumbis pra perseguir e acertar)
{const rv=mpRecv; mpRecv=function(m,p){const r=rv.apply(this,arguments);
  if(m&&m.t==='st'&&MP.role==='host'&&p&&MP.players[p.id]){const q=MP.players[p.id],l=Math.min(.15,mpRttS()/2+.03);mpPrevVel(q,q.x,q.y,420);q.px=q.x+q._vx*l;q.py=q.y+q._vy*l;}
  return r;};}
// ping medido mais vezes (a cada 5 s) e suavizado
setInterval(()=>{if(MP.srv&&MP.srv.readyState===1)mpSrvTx({t:'ping',n:Date.now()});},5000);
{const sr=mpSrvRecv; mpSrvRecv=function(m){const old=MP.srvRtt;sr.apply(this,arguments);if(m&&m.t==='pong'&&old)MP.srvRtt=Math.round(old*.6+MP.srvRtt*.4);};}
// mostra o ping no canto durante a partida
{const dh=mpDrawHud; mpDrawHud=function(){dh.apply(this,arguments);
  if(!MP.on||G.mode!=='play'||!MP.srv||!MP.srvRtt)return;ctx.setTransform(dpr,0,0,dpr,0,0);
  const v=MP.srvRtt,c=v<80?'#7ad38a':v<160?'#e0c060':'#e07060';ctx.font=`700 10px ${FONT_UI}`;ctx.textAlign='right';ctx.fillStyle=c;
  ctx.fillText(`ping ${v} ms`,view.w-10-SAFE.r,(IN.touch?(view.h>view.w?91:52)+SAFE.t:view.h*.3-8));};}

// ---------- anfitrião com menu aberto ou janela escondida: o mundo continua pros amigos ----------
// Antes, pausa/maleta/opções/Mascate do anfitrião (ou trocar de janela, que abre a pausa) congelava a partida
// de todo mundo: os zumbis sumiam da tela dos convidados. Agora o mundo segue (com o anfitrião parado e sem
// levar dano enquanto o menu está aberto, igual ao convidado). Com o jogo minimizado o navegador para de
// desenhar; um relógio de reserva continua mandando a foto do mundo. Jogando sozinho (Horda solo) a pausa pausa.
const mpHostVivo=()=>MP.on&&MP.role==='host'&&mpN()>1;
function mpFundoTick(dt){const m=G.mode;MP.fundoTick=true;G.mode='play';
  try{update(dt);}catch(e){console.error(e);}finally{MP.fundoTick=false;if(G.mode==='play')G.mode=m;}}
{const ri=readInput; readInput=function(){ri.apply(this,arguments); if(MP.fundoTick){IN.mx=0;IN.my=0;IN.fire=false;IN.run=false;IN.aimAng=null;}};}
{const hp=hurtPlayer; hurtPlayer=function(){if(MP.fundoTick&&!G.mpTgt)return;return hp.apply(this,arguments);};}
{const fr=frame; frame=function(t){
  if(G.mode==='menu'&&mpHostVivo()&&!CUT.on&&!document.hidden){const now=t/1000;mpFundoTick(clamp(lastFrame?now-lastFrame:.016,0,.034));}
  return fr(t);};}
setInterval(()=>{
  if(!document.hidden||!mpHostVivo()||(G.mode!=='play'&&G.mode!=='menu')||CUT.on){MP.bgT=null;return;}
  const now=performance.now()/1000; let el=MP.bgT==null?0:Math.min(1.5,now-MP.bgT); MP.bgT=now;
  while(el>0.001&&MP.on){const d=Math.min(.034,el);el-=d;mpFundoTick(d);}
},250);

// menu de teste: cair agora (pra conferir que caído não atira nem se cura)
{const da=UI.dbgAct.bind(UI); UI.dbgAct=function(k,ds){
  if(k==='v183:down'){this.close();if(!MP.on)return toast('Só funciona numa partida do multiplayer.');P.inv=0;die();return;}
  return da(k,ds);};}
