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
