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
// Cada posição que chega já é "do passado": a viagem até o servidor e de lá até aqui (metade do ping de cada lado),
// a espera pela próxima atualização e a suavização da tela. Com a velocidade medida, o alvo vai pra onde a coisa deve estar AGORA.
// A velocidade usa a hora em que o dono MANDOU a posição (ts), não a hora em que chegou: assim o "tremido" da internet
// (pacotes que chegam juntos ou atrasados) não vira zumbi pulando. Quem está parado (mv=0) não é empurrado pra frente.
const mpRttS=()=>clamp((MP.srvRtt||100)/1000,0.02,0.6);
const mpRtt2=r=>clamp((r==null?MP.srvRtt||100:r)/1000,0.02,0.6);
const mpNow=()=>Date.now()%1e8;
function mpPrevVel(o,x,y,maxV,ts){const t=(ts!=null?ts:Date.now())/1000;
  if(o._pt==null||t<o._pt||t-o._pt>1.5){o._vx=0;o._vy=0;o._pt=t;o._px=x;o._py=y;return;}
  const dt=t-o._pt; if(dt<0.015)return;
  let vx=(x-o._px)/dt,vy=(y-o._py)/dt; if(hyp(vx,vy)>maxV){vx=0;vy=0;}
  o._vx=(o._vx||0)*.55+vx*.45;o._vy=(o._vy||0)*.55+vy*.45; o._pt=t;o._px=x;o._py=y;}
// o convidado manda a hora e o ping dele junto da posição; o anfitrião repassa na foto do mundo
{const ms=mpSend; mpSend=function(m){if(m&&m.t==='st'&&m.s){m.s.ts=mpNow();m.s.r=MP.srvRtt|0;}return ms.apply(this,arguments);};}
{const sn=mpSnap; mpSnap=function(){const o=sn.apply(this,arguments);o.ts=mpNow();o.hr=MP.srvRtt|0;
  if(o.p['0']){o.p['0'].ts=o.ts;o.p['0'].r=o.hr;}
  for(const [id,q] of Object.entries(MP.players))if(o.p[id]){if(q.ts!=null)o.p[id].ts=q.ts;if(q.r!=null)o.p[id].r=q.r;}
  return o;};}
// +0,05 s: a suavização da tela (dt*16) anda mais ou menos isso atrás do alvo
{const as=mpApplySnap; mpApplySnap=function(m){as.apply(this,arguments);
  MP.snapRx=Date.now(); if(m.hr!=null)MP.hostRtt=m.hr;
  const hr=mpRtt2(m.hr), eu=mpRttS(), lz=Math.min(.35,(hr+eu)/2+.025+.05);
  // só os zumbis DESTA foto (duas fotos no mesmo quadro, depois de um travamento, empurravam o mesmo zumbi duas vezes)
  for(const e of m.e||[]){const g=MP.ghosts.get(e[0]);if(!g||g.tx!==e[2]||g.ty!==e[3])continue;
    if(g.state==='dorm'){g._pt=null;continue;}
    mpPrevVel(g,g.tx,g.ty,320,m.ts);g.tx+=g._vx*lz;g.ty+=g._vy*lz;}
  for(const [id,q] of Object.entries(m.p||{})){const r=MP.remote[id];if(!r||id===MP.myId)continue;
    mpPrevVel(r,q.x,q.y,420,q.ts); if(!q.mv||q.hp<=0){r._vx=0;r._vy=0;}
    const lp=Math.min(.35,(mpRtt2(q.r)+hr)/2+(hr+eu)/2+.05+.05); r.tx=q.x+r._vx*lp;r.ty=q.y+r._vy*lp;}
  // quem não está mais na foto saiu da equipe: some da tela (antes ficava parado no mapa e na lista pra sempre)
  for(const id of Object.keys(MP.remote))if(!(m.p&&m.p[id])){delete MP.remote[id];if(MP.says)delete MP.says[id];}};}
// anfitrião: posição prevista de cada convidado (usada pelos zumbis pra perseguir e acertar, e no desenho)
{const rv=mpRecv; mpRecv=function(m,p){const r=rv.apply(this,arguments);
  if(m&&m.t==='st'&&MP.role==='host'&&p&&MP.players[p.id]){const q=MP.players[p.id],l=Math.min(.3,(mpRtt2(q.r)+mpRttS())/2+.025);
    mpPrevVel(q,q.x,q.y,420,q.ts); if(!q.mv||q.hp<=0){q._vx=0;q._vy=0;} q.px=q.x+q._vx*l;q.py=q.y+q._vy*l;}
  return r;};}
{const vt=v16Tick; v16Tick=function(dt){vt.apply(this,arguments);
  if(MP.on&&MP.role==='host'&&G.mode==='play')for(const [id,q] of Object.entries(MP.players)){const r=MP.remote[id];if(r&&q.px!=null){r.tx=q.px+(q._vx||0)*.05;r.ty=q.py+(q._vy||0)*.05;}}};}
// ping medido mais vezes (a cada 5 s) e suavizado. Só vale o pong de um ping nosso (n = hora em que mandamos).
setInterval(()=>{if(MP.srv&&MP.srv.readyState===1)mpSrvTx({t:'ping',n:Date.now()});},5000);
{const sr=mpSrvRecv; mpSrvRecv=function(m){
  if(m&&m.t==='pong'){const d=Date.now()-m.n;if(!(d>=0&&d<60000))return;const old=MP.srvRtt;MP.srvRtt=old?Math.round(old*.6+d*.4):d;return;}
  return sr.apply(this,arguments);};}
// mostra o ping no canto durante a partida (convidado: o dele e o do anfitrião, que também entra no atraso)
{const dh=mpDrawHud; mpDrawHud=function(){dh.apply(this,arguments);
  if(!MP.on||G.mode!=='play')return;ctx.setTransform(dpr,0,0,dpr,0,0);
  const y=(IN.touch?52+SAFE.t:view.h*.3-8),x=view.w-10-SAFE.r; ctx.font=`700 10px ${FONT_UI}`;ctx.textAlign='right';
  if(MP.reconn){ctx.fillStyle='#e07060';ctx.fillText('Reconectando ao servidor...',x,y);return;}
  if(MP.role==='guest'&&MP.snapRx&&Date.now()-MP.snapRx>4000){ctx.fillStyle='#e07060';ctx.fillText(MP.hostAway?'O anfitrião caiu. Esperando ele voltar...':`Sem sinal do anfitrião há ${Math.round((Date.now()-MP.snapRx)/1000)} s`,x,y);return;}
  if(!MP.srv||!MP.srvRtt)return;
  const v=MP.srvRtt,h=MP.role==='guest'?MP.hostRtt||0:0,tot=v+h,c=tot<80?'#7ad38a':tot<160?'#e0c060':'#e07060';ctx.fillStyle=c;
  ctx.fillText(h?`ping ${v} ms · anfitrião ${h} ms`:`ping ${v} ms`,x,y);};}

// ---------- menos mensagens (o servidor derruba quem passa de 120 por segundo) ----------
// Lança-chamas e escopeta geram dezenas de acertos por segundo (o convidado caía com "mensagens demais"):
// agora o convidado junta os acertos e manda no máximo 30 vezes por segundo.
// Os tiros que o anfitrião repassa também vão juntos, numa mensagem só pra todo mundo (antes era uma por amigo,
// por tiro: 4 convidados de submetralhadora derrubavam o anfitrião). Cada tiro leva o id de quem atirou e ninguém
// desenha o próprio tiro de volta.
MP.hq=new Map(); MP.fxq=[]; MP.qT=0;
{const ms=mpSend; mpSend=function(m,to,except){
  if(MP.on&&m&&!to&&!except){
    if(m.t==='hit'&&MP.role==='guest'){const o=MP.hq.get(m.u);if(o){o[1]+=+m.d||0;o[2]=m.kx;o[3]=m.ky;}else MP.hq.set(m.u,[m.u,+m.d||0,m.kx,m.ky]);return;}
    if(m.t==='fx'&&MP.role==='host'){for(const b of m.b||[])MP.fxq.push([b[0],b[1],b[2],b[3],b[4],'0']);return;}}
  return ms.apply(this,arguments);};
 MP.flush=function(){
  if(MP.hq.size){const h=[...MP.hq.values()];MP.hq.clear();
    if(MP.hostV>=183)ms({t:'hits',h}); else for(const [u,d,kx,ky] of h)ms({t:'hit',u,d,kx,ky});}
  if(MP.fxq.length){const b=MP.fxq.slice(-60);MP.fxq.length=0;ms({t:'fx',b});}};}
{const vt=v16Tick; v16Tick=function(dt){vt.apply(this,arguments);
  if(!MP.on){MP.hq.clear();MP.fxq.length=0;return;}
  if((MP.qT-=dt)<=0){MP.qT=1/30;MP.flush();}};}
{const rv=mpRecv; mpRecv=function(m,p){const H=MP.role==='host';
  if(m&&m.t==='hits'){if(H&&Array.isArray(m.h))for(const x of m.h.slice(0,80))if(Array.isArray(x))mpRecv({t:'hit',u:x[0],d:x[1],kx:x[2],ky:x[3]},p);return;}
  if(m&&m.t==='fx'&&Array.isArray(m.b)){
    if(H){mpFx(m.b);if(m.b[0])alertNoise(m.b[0][0],m.b[0][1],380);if(p){for(const b of m.b.slice(0,30))MP.fxq.push([b[0],b[1],b[2],b[3],b[4],p.id]);if(MP.fxq.length>120)MP.fxq.splice(0,MP.fxq.length-120);}return;}
    m.b=m.b.filter(b=>b[5]!==MP.myId); if(!m.b.length)return;}
  if(m&&m.t==='you'&&!H)MP.hostV=+m.v||0;
  return rv.apply(this,arguments);};}
// o anfitrião avisa que entende os acertos juntos ('hits'); com anfitrião de versão antiga o convidado manda 'hit' um por um
{const ms=mpSend; mpSend=function(m){if(m&&m.t==='you'&&MP.role==='host')m.v=183;return ms.apply(this,arguments);};}

// ---------- quedas de rede ----------
// O navegador não percebe sozinho quando a internet some sem "fechar" a conexão (wi-fi caiu, 4G sem sinal):
// a partida ficava congelada pra sempre. Agora, se nada chega do servidor por 12 s (o ping vai a cada 5 s),
// a conexão é dada como caída. Se os timers ficaram parados (aba em segundo plano, celular bloqueado), não conta.
MP.rxT=0; MP.wdT=0;
{const sr=mpSrvRecv; mpSrvRecv=function(m){MP.rxT=Date.now();
  if(m&&(m.t==='joined'||m.t==='room')&&m.tk)MP.srvTk=m.tk;
  if(m&&m.t==='room-closed'&&MP.role==='host')MP.srvTk=null;  // a sala acabou de verdade: não adianta tentar voltar
  // anfitrião caiu: o servidor segura a sala por até 60 s esperando ele voltar
  if(m&&m.t==='host-away'){MP.hostAway=true;toast('O anfitrião caiu. Esperando ele voltar...');if(!MP.on){MP.status='O anfitrião caiu. Esperando ele voltar...';mpRefresh();}return;}
  if(m&&m.t==='host-back'){MP.hostAway=false;toast('O anfitrião voltou.');if(!MP.on){MP.status='';mpRefresh();}if(MP.role==='guest'&&MP.peers['0'])mpSend({t:'hello',c:MP.me,de:MP.myId});return;}
  return sr.apply(this,arguments);};}
setInterval(()=>{const now=Date.now(),gap=now-(MP.wdT||now);MP.wdT=now;const ws=MP.srv;
  if(!ws||ws.readyState!==1||!MP.srvRoom||gap>3000||!MP.rxT){MP.rxT=Math.max(MP.rxT||0,now-2000);return;}
  if(now-MP.rxT>12000){MP.rxT=now;ws.onclose=null;ws.onmessage=null;try{ws.close();}catch(e){}if(MP.srv===ws){MP.srv=null;mpSrvLost();}}},1000);
// convidado que cai no meio da partida volta sozinho pra mesma equipe (com a mesma vaga, se o servidor deixar),
// sem perder arma, maleta e vida. Só desiste se a equipe não existir mais ou depois de 30 s.
async function mpVolta(){if(MP.voltando)return;MP.voltando=true;MP.reconn=true;
  const code=MP.code,u=MP.srvUrl,old=MP.myId,tk=MP.srvTk,fim=Date.now()+30000; let ok=false,acabou=false;
  const still=()=>MP.on&&MP.role==='guest'&&MP.reconn&&MP.code===code;
  toast('A conexão caiu. Reconectando...');
  try{while(still()&&Date.now()<fim){
    const ws=await mpSrvConnect(still,u);
    if(ws&&still()){mpSrvTx({t:'join',code,id:old,tk});const r=await mpSrvAsk(['joined','err'],8000);
      if(r&&r.t==='joined'&&still()){MP.myId=r.id;MP.srvRoom=true;MP.srvUrl=u;MP.peers={'0':mpSrvPeer('0')};delete MP.remote[r.id];
        MP.status='';MP.rxT=Date.now();mpSend({t:'hello',c:MP.me,de:old});ok=true;break;}
      mpSrvClose(); if(r&&r.t==='err'&&r.msg==='nao-encontrada'){acabou=true;break;}}
    if(still())await mpWait(1500);}}
  finally{MP.voltando=false;}
  if(ok){MP.reconn=false;toast('Voltou pra partida.');return;}
  if(MP.on&&MP.role==='guest'&&MP.reconn){MP.reconn=false;mpSrvClose();mpEnd(false,acabou?'O anfitrião saiu ou a equipe fechou.':'A conexão com o servidor caiu e não voltou.');}}
// anfitrião que cai volta pra MESMA sala com a chave (o servidor espera 60 s); os convidados nem saem da partida
async function mpVoltaHost(){if(MP.voltando)return false;MP.voltando=true;MP.reconn=true;
  const code=MP.code,u=MP.srvUrl,fim=Date.now()+45000; let ok=false;
  const still=()=>MP.role==='host'&&MP.reconn&&MP.code===code;
  toast('A conexão caiu. Reconectando...');
  try{while(still()&&Date.now()<fim){
    const ws=await mpSrvConnect(still,u);
    if(ws&&still()){mpSrvTx({t:'host',code,tk:MP.srvTk});const r=await mpSrvAsk(['room','err'],8000);
      if(r&&r.t==='room'&&still()){
        if(r.code!==code){mpSrvClose();break;}   // servidor sem essa função: abriu outra sala, não serve
        MP.srvRoom=true;MP.srvUrl=u;MP.rxT=Date.now();MP.status='';
        const ids=new Set(r.ids||[]);
        for(const id of ids)if(!MP.peers[id])MP.peers[id]=mpSrvPeer(id);
        for(const p of Object.values(MP.peers))if(p.srv&&!ids.has(p.id))mpPeerGone(p);
        ok=true;break;}
      mpSrvClose(); if(r&&r.t==='err'&&r.msg==='nao-encontrada')break;}
    if(still())await mpWait(1500);}}
  finally{MP.voltando=false;MP.reconn=false;}
  if(ok){toast('Conexão de volta. A equipe continua.');mpRefresh();}
  return ok;}
{const sl=mpSrvLost; mpSrvLost=function(){
  if(MP.role==='guest'&&MP.on&&MP.srvUrl&&MP.code&&!MP.manual&&MP.peers['0']&&MP.peers['0'].srv&&!MP.peers['0'].gone){mpSrvClose();mpVolta();return;}
  if(MP.role==='host'&&MP.code&&MP.srvTk&&MP.srvUrl&&!MP.manual&&!MP.voltando){mpSrvClose();mpVoltaHost().then(ok=>{if(!ok&&MP.role==='host')sl();});return;}
  if(MP.voltando)return;
  return sl.apply(this,arguments);};}
{const rv=mpRecv; mpRecv=function(m,p){const H=MP.role==='host';
  // quem voltou já está jogando: não recomeça a partida dele
  if(m&&m.t==='start'&&!H&&MP.on){if(m.pl)MP.roster=m.pl;return;}
  // anfitrião: o mesmo jogador voltou com outra vaga -> some o boneco antigo e o placar passa pra vaga nova
  if(m&&m.t==='hello'&&H&&p&&m.de!=null&&String(m.de)!==p.id){const o=MP.players[m.de];
    if(o&&o.c&&m.c&&o.c.apelido===m.c.apelido){const st=MP.stats&&MP.stats[m.de];mpPeerGone(o.peer,true);if(st)MP.stats[p.id]=st;}}
  // voltou pra mesma vaga: mantém onde ele estava e a vida (o 'hello' zerava)
  const q=m&&m.t==='hello'&&H&&p&&MP.players[p.id], sv=q&&q.c&&m.c&&q.c.apelido===m.c.apelido?{x:q.x,y:q.y,hp:q.hp}:null;
  let r; if(sv){const t=toast;toast=()=>{};try{r=rv.apply(this,arguments);}finally{toast=t;}} else r=rv.apply(this,arguments);
  if(sv&&MP.players[p.id])Object.assign(MP.players[p.id],sv);
  return r;};}
// sair de propósito não reconecta
{const lv=mpLeave; mpLeave=function(){MP.reconn=false;MP.srvTk=null;MP.hostRtt=0;MP.snapRx=0;MP.hostV=0;MP.hostAway=false;return lv.apply(this,arguments);};}


// menu de teste: cair agora (pra conferir que caído não atira nem se cura)
{const da=UI.dbgAct.bind(UI); UI.dbgAct=function(k,ds){
  if(k==='v183:down'){this.close();if(!MP.on)return toast('Só funciona numa partida do multiplayer.');P.inv=0;die();return;}
  return da(k,ds);};}
