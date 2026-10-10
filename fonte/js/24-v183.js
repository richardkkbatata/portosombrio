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
  const y=(IN.touch?(view.h>view.w?91:52)+SAFE.t:view.h*.3-8),x=view.w-10-SAFE.r; ctx.font=`700 10px ${FONT_UI}`;ctx.textAlign='right';
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
    if(m.t==='hit'&&MP.role==='guest'){const o=MP.hq.get(m.u);if(o){o[1]+=+m.d||0;o[2]=m.kx;o[3]=m.ky;if(m.b)o[4]=1;}else MP.hq.set(m.u,[m.u,+m.d||0,m.kx,m.ky,m.b?1:0]);return;}
    if(m.t==='fx'&&MP.role==='host'){for(const b of m.b||[])MP.fxq.push([b[0],b[1],b[2],b[3],b[4],'0']);return;}}
  return ms.apply(this,arguments);};
 MP.flush=function(){
  if(MP.hq.size){const h=[...MP.hq.values()];MP.hq.clear();
    if(MP.hostV>=183)ms({t:'hits',h}); else for(const [u,d,kx,ky,b] of h)ms(b?{t:'hit',u,d,kx,ky,b:1}:{t:'hit',u,d,kx,ky});}
  if(MP.fxq.length){const b=MP.fxq.slice(-60);MP.fxq.length=0;ms({t:'fx',b});}};}
{const vt=v16Tick; v16Tick=function(dt){vt.apply(this,arguments);
  if(!MP.on){MP.hq.clear();MP.fxq.length=0;return;}
  if((MP.qT-=dt)<=0){MP.qT=1/30;MP.flush();}};}
{const rv=mpRecv; mpRecv=function(m,p){const H=MP.role==='host';
  if(m&&m.t==='hits'){if(H&&Array.isArray(m.h))for(const x of m.h.slice(0,80))if(Array.isArray(x))mpRecv(x[4]?{t:'hit',u:x[0],d:x[1],kx:x[2],ky:x[3],b:1}:{t:'hit',u:x[0],d:x[1],kx:x[2],ky:x[3]},p);return;}
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


// ---------- jogo minimizado (anfitrião): o mundo continua pros amigos ----------
// Com a janela escondida o navegador para de desenhar; um relógio de reserva roda o mundo em passos
// curtos (sem ler os controles, igual ao menu aberto; ver "menu aberto NÃO congela a partida" abaixo).
setInterval(()=>{
  const vivo=MP.on&&MP.role==='host'&&Object.keys(MP.players).length>0;
  if(!document.hidden||!vivo||(G.mode!=='play'&&G.mode!=='menu')||(typeof CUT!=='undefined'&&CUT.on)){MP.bgT=null;return;}
  const now=Date.now()/1000; let el=MP.bgT==null?0:Math.min(1.5,now-MP.bgT); MP.bgT=now;
  while(el>0.001&&MP.on){const d=Math.min(.034,el);el-=d;const m=G.mode;MP.bg=true;G.mode='play';
    try{update(d);}catch(e){console.error(e);}finally{MP.bg=false;if(G.mode==='play')G.mode=m;}}
},250);

// menu de teste: cair agora (pra conferir que caído não atira nem se cura)
{const da=UI.dbgAct.bind(UI); UI.dbgAct=function(k,ds){
  if(k==='v183:down'){this.close();if(!MP.on)return toast('Só funciona numa partida do multiplayer.');P.inv=0;die();return;}
  return da(k,ds);};}

// ===================== 1.8.3 · sincronia do multiplayer (o que acontece tem que bater em todas as telas) =====================
const mpComOutros=()=>MP.on&&(MP.role==='guest'||Object.keys(MP.players).length>0);

// ---------- menu aberto (pausa, maleta, Mascate, opções) NÃO congela a partida ----------
// Antes: o anfitrião abria a pausa e o mundo parava pra todo mundo (os zumbis sumiam da tela dos amigos);
// o convidado abria a pausa e ficava imortal (o dano chegava e era jogado fora) e parado na tela dos outros.
// Agora o jogo continua por baixo do menu, sem ler os controles. Na Horda sozinho a pausa continua pausando.
{const ri=readInput; readInput=function(){ri.apply(this,arguments); if(MP.bg){IN.mx=0;IN.my=0;IN.fire=false;IN.run=false;P.firing=false;}};}
{const fr=frame; frame=function(t){
  if(G.mode==='menu'&&mpComOutros()&&!(typeof CUT!=='undefined'&&CUT.on)){
    const dt=clamp(lastFrame?t/1000-lastFrame:.016,0,.034);
    MP.bg=true; G.mode='play';
    try{update(dt);}catch(e){console.error(e);}finally{MP.bg=false;if(G.mode==='play')G.mode='menu';}}
  return fr(t);};}
// dano que chega com o menu aberto também conta
{const rv=mpRecv; mpRecv=function(m,p){
  if(m&&m.t==='hurt'&&G.mode==='menu'&&mpComOutros()){G.mode='play';try{return rv.apply(this,arguments);}finally{if(G.mode==='play')G.mode='menu';}}
  return rv.apply(this,arguments);};}

// ---------- item/dinheiro disputado: só um leva ----------
// Cada aparelho pega na hora (sem atraso), mas quem decide é o anfitrião: se o item já tinha dono,
// ele responde 'untake' e o convidado devolve o que pegou.
const mpPegos=new Map();
{const tp=takePickup; takePickup=function(p){
  if(!MP.on||!p||p.uid==null)return tp.apply(this,arguments);
  const b={id:p.id,kind:p.kind,q:p.q,grana:grana(),cnt:p.kind==='item'?invCount(p.id):0,owned:P.owned[p.id],mag:P.mags[p.id],dur:P.dur,w:P.w,slots:G.slots};
  const r=tp.apply(this,arguments);
  if(!pickups.includes(p)){b.t=Date.now();mpPegos.set(p.uid,b);for(const [u,x] of mpPegos)if(b.t-x.t>8000)mpPegos.delete(u);}
  else if(p.q!==b.q)mpSend({t:'pq',u:p.uid,q:p.q}); // pegou só uma parte: o resto fica igual pra todos
  return r;};}
function mpDevolver(u){const b=mpPegos.get(u);if(!b)return;mpPegos.delete(u);
  if(b.id==='grana')G.flags.grana=Math.max(0,grana()-b.q);
  else if(b.kind==='item'){const n=invCount(b.id)-b.cnt;if(n>0){invRemove(b.id,n);if(typeof mSync==='function')mSync();}}
  else if(b.kind==='weapon'){if(!b.owned){P.owned[b.id]=false;if(P.w===b.id)P.w=b.w;}P.mags[b.id]=b.mag;if(b.id===0)P.dur=b.dur;if(typeof mSync==='function')mSync();}
  else if(b.kind==='bag'){G.slots=b.slots;G.inv.length=Math.max(G.slots,G.inv.length);}
  toast('Um amigo pegou primeiro.');}
{const rv=mpRecv; mpRecv=function(m,p){
  if(m&&m.t==='take'&&MP.role==='host'&&p&&G.taken.has(m.u)){mpSend({t:'untake',u:m.u},p);return;}
  if(m&&m.t==='untake'){mpDevolver(m.u);return;}
  if(m&&m.t==='pq'){const q=pickups.find(x=>x.uid===m.u);if(q&&m.q>0)q.q=Math.min(q.q,m.q);if(MP.role==='host')mpSend(m,null,p);return;}
  if(m&&m.t==='tk'){for(const u of m.u||[])mpTake(u);return;}
  return rv.apply(this,arguments);};}

// ---------- fogo do convidado (lança-chamas, explosão grande) acende o zumbi de verdade ----------
{const he=hurtEnemy; hurtEnemy=function(e,d,kx,ky,o){
  if(MP.on&&MP.role==='guest'&&e&&e.ghost&&e.alive&&d>0&&o&&o.burn){mpSend({t:'hit',u:e.mpid,d,kx:kx|0,ky:ky|0,b:1});e.flash=.1;return;}
  if(MP.hitBurn&&e&&!e.ghost)o=Object.assign({},o,{burn:true});
  return he.call(this,e,d,kx,ky,o);};}
{const rv=mpRecv; mpRecv=function(m,p){
  // tiro num zumbi que já morreu (dois mataram ao mesmo tempo): não soma dano no placar
  if(m&&m.t==='hit'&&MP.role==='host'&&!enemies.some(e=>e.alive&&e.mpid===m.u))return;
  if(m&&m.t==='hit'&&m.b&&MP.role==='host'){MP.hitBurn=true;try{return rv.apply(this,arguments);}finally{MP.hitBurn=false;}}
  return rv.apply(this,arguments);};}

// ---------- quem entra com a partida já rolando ----------
// Antes: entrava sempre na Noite Zero (mesmo na Horda), longe da turma, via itens que já tinham sido pegos e não aparecia no placar.
{const ms=mpSend; mpSend=function(m,to,ex){if(m&&m.t==='start'&&MP.role==='host'&&!m.modo)m=Object.assign({},m,{modo:MP.modo||'zero'});return ms.call(this,m,to,ex);};}
{const rv=mpRecv; mpRecv=function(m,p){const tarde=m&&m.t==='hello'&&MP.role==='host'&&MP.on;
  const r=rv.apply(this,arguments);
  if(tarde&&p&&MP.players[p.id]){mpStat(p.id);if(MP.downPrev)MP.downPrev[p.id]=1;
    mpSend({t:'tk',u:[...G.taken]},p);
    const ch=pickups.filter(q=>String(q.uid)[0]==='d');if(ch.length)mpSend({t:'drop',p:ch},p);
    if(G.mascTmp)mpSend({t:'masc',x:G.mascTmp.x,y:G.mascTmp.y},p);
    const c=P.hp>0?P:Object.values(MP.players).find(q=>q!==MP.players[p.id]&&q.hp>0)||P;mpSend({t:'tp',x:c.x|0,y:c.y|0},p);}
  return r;};}

// ---------- explosões e lança-chamas aparecem pra todos ----------
// Antes: a granada/lança-granadas/rojão de um jogador matava os zumbis, mas na tela dos outros eles morriam "do nada".
// Só o desenho e o som: o dano continua indo pelo anfitrião como sempre.
function mpBoomFx(x,y,r){
  for(let i=0;i<34;i++){const a=Math.random()*6.28,s=rr(60,320);parts.push({k:'fire',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.25,.55),max:.55,s:rr(5,11),c:Math.random()<.5?'#ffb347':'#ff6a2a'});}
  for(let i=0;i<18;i++){const a=Math.random()*6.28,s=rr(20,120);parts.push({k:'smoke',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.8,1.6),max:1.6,s:rr(10,20),c:'#3a3734'});}
  addDecal({k:'scorch',x,y,r:(r||110)*.55,rot:Math.random()*6,seed:Math.random()});
  const dp=hyp(P.x-x,P.y-y); G.shake+=dp<500?8:3; G.boom={x,y,t:.3}; AU.boom(clamp(1-dp/1200,.15,1));}
{const ex=explode; explode=function(x,y,r){if(MP.on&&!MP.rxBoom&&mpComOutros())mpSend({t:'boom',x:x|0,y:y|0,r:r|0});return ex.apply(this,arguments);};}
{const rv=mpRecv; mpRecv=function(m,p){
  if(m&&m.t==='boom'){if(G.mode==='play'||G.mode==='menu')mpBoomFx(m.x,m.y,m.r);if(MP.role==='host')mpSend(m,null,p);return;}
  return rv.apply(this,arguments);};}
// chamas do lança-chamas: vão junto com os tiros (6º número = 1); quem recebe desenha sem dano
{const fr=fire; fire=function(){const n=projs.length,r=fr.apply(this,arguments);
  if(MP.on&&mpComOutros()){const f=projs.slice(n).filter(p=>p.k==='f').map(p=>[p.x|0,p.y|0,+Math.atan2(p.vy,p.vx).toFixed(3),hyp(p.vx,p.vy)|0,+p.life.toFixed(2),1]);if(f.length)mpSend({t:'fx',b:f});}
  return r;};}
{const mf=mpFx; mpFx=function(b){const fl=(b||[]).filter(x=>x[5]===1);mf((b||[]).filter(x=>x[5]!==1));
  for(const [x,y,a,sp,life] of fl)projs.push({k:'f',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dmg:0,life,r:5,hit:new Set()});};}

// ---------- cuspe e pedras dos zumbis aparecem na tela do convidado ----------
// Antes: o Cuspidor/O Frentista cuspiam no convidado e a vida caía "do nada" (o cuspe só existia no anfitrião).
// O convidado desenha uma cópia sem dano; o dano continua vindo do anfitrião ('hurt').
{const vt=v16Tick; v16Tick=function(dt){vt(dt);
  if(!MP.on||MP.role!=='host'||G.mode!=='play'||!mpComOutros())return;
  let b=null;for(const p of projs)if(p.k==='s'&&!p._mp&&!p.dead){p._mp=1;(b||(b=[])).push([p.x|0,p.y|0,p.vx|0,p.vy|0,+(p.life||1).toFixed(2),p.rock?1:0,p.col||0]);}
  if(b)mpSend({t:'sp',b});};}
{const rv=mpRecv; mpRecv=function(m,p){
  if(m&&m.t==='sp'){if(MP.role!=='host')for(const [x,y,vx,vy,life,rock,col] of m.b||[]){const q={k:'s',x,y,vx,vy,dmg:0,life,mpVis:1};if(rock){q.rock=true;q.col=col||undefined;}projs.push(q);}return;}
  return rv.apply(this,arguments);};}
// tiro/cuspe "de mentira" (dano 0) não machuca nem faz tremer a tela
{const hp=hurtPlayer; hurtPlayer=function(d){if(MP.on&&!(d>0))return;return hp.apply(this,arguments);};}

// ---------- quem sai da partida some da tela de todo mundo ----------
// Antes: só o anfitrião apagava; nos outros convidados o boneco ficava parado no mapa, na lista e no minimapa.
{const as=mpApplySnap; mpApplySnap=function(m){const r=as.apply(this,arguments);
  if(m&&m.p)for(const id of Object.keys(MP.remote))if(!(id in m.p)&&id!==MP.myId){delete MP.remote[id];if(MP.says)delete MP.says[id];}
  return r;};}
