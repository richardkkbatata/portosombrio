// ===================== v13: HISTÓRIA EM TEMPO REAL =====================
// Eventos que acontecem na hora certa (posto explodindo, cidade em caos, navio no cais),
// amigos que andam com você (Edu e Matheus), fogo que fica queimando, e o estado do mundo ao carregar.

function inV(x,y,m=60){const z=view.z||1;return x>cam.x-m&&x<cam.x+view.w/z+m&&y>cam.y-m&&y<cam.y+view.h/z+m;}
// ---------- prédios-chave ----------
function bOf(x,y){return inb(x,y)?bmap[idx(x,y)]:-1;}
function clinicB(){return bOf(144,93);}
function shopB(){const b=buildings.find(b=>b.kind==='shop');return b?b.id:-1;}
function hosp2B(){const b=buildings.find(b=>b.kind==='hospital2');return b?b.id:-1;}

// ---------- fogo que fica ----------
let FIRES=[];
function addFire(x,y,r=34,save=false){
  const tx=(x/TILE)|0,ty=(y/TILE)|0; if(!inb(tx,ty))return null;
  if(FIRES.some(f=>hyp(f.x-x,f.y-y)<24))return null;
  const f={x,y,r,ph:Math.random()*6};FIRES.push(f);
  lights.push({x,y,r:150+r*1.5,c:'fire',f:1,fire:true});
  if(save){const F=G.flags;F.fl=F.fl||[];if(F.fl.length<26)F.fl.push([Math.round(x),Math.round(y),r]);}
  return f;
}
function updFires(dt){
  for(const f of FIRES){
    const d=hyp(f.x-P.x,f.y-P.y); if(d>1000)continue;
    if(Math.random()<dt*(10+f.r*.2))parts.push({k:'fire',x:f.x+rr(-f.r*.5,f.r*.5),y:f.y+rr(-f.r*.4,f.r*.4),vx:rr(-12,12),vy:rr(-55,-20),life:rr(.3,.65),max:.65,s:rr(4,9),c:Math.random()<.5?'#ffb347':'#ff6a2a'});
    if(Math.random()<dt*4)parts.push({k:'smoke',x:f.x+rr(-10,10),y:f.y,vx:rr(-10,10),vy:rr(-45,-25),life:rr(1.2,2.4),max:2.4,s:rr(10,18),c:'#2a2826'});
    if(d<f.r*.8&&!P.inCar&&!DBG.god){P.hp-=14*G.D.dmg*dt;G.hurt=Math.max(G.hurt,.35);if(P.hp<=0&&G.mode==='play'){P.hp=0;die();}}
    for(const e of enemies)if(e.alive&&!e.t.boss&&e.type!=='ouvinte'&&Math.abs(e.x-f.x)<f.r&&Math.abs(e.y-f.y)<f.r)e.burn=Math.max(e.burn,2.5);
  }
}

// ---------- amigos ----------
const COMPDEF={
  edu:{name:'Edu',col:'#18191c',hair:'#2a1c12',skin:'#e2b79a',pants:'#2a2c34',gun:'pistola',dmg:14,rate:.75,pel:1,spread:.06,look:'edu'},
  matheus:{name:'Matheus',col:'#e8e6e0',hair:'#140f0c',skin:'#d9aa8c',pants:'#1c2230',gun:'escopeta',dmg:9,rate:1.1,pel:5,spread:.3,look:'math'},
};
function compOf(id){return (G.comps||[]).find(c=>c.id===id)||null;}
function spawnComp(id,x,y){
  let c=compOf(id); if(c){c.x=x;c.y=y;return c;}
  const D=COMPDEF[id]; c={id,x,y,r:10,ang:Math.atan2(P.y-y,P.x-x),walk:0,moving:false,cool:1,stuck:0,inCar:false,fireT:0,...D};
  (G.comps=G.comps||[]).push(c); return c;
}
function dropComp(id){G.comps=(G.comps||[]).filter(c=>c.id!==id);}
function syncComps(){
  const F=G.flags, want=[]; if(F.eduFollow)want.push('edu'); if(F.matFollow)want.push('matheus');
  G.comps=(G.comps||[]).filter(c=>want.includes(c.id));
  for(const id of want)if(!compOf(id)){const [x,y]=freeTileNear(((P.x-Math.cos(P.ang)*40)/TILE)|0,((P.y-Math.sin(P.ang)*40)/TILE)|0,false);spawnComp(id,tc(x),tc(y));}
}
function compTarget(ox,oy,range){
  let best=null,bd=range;
  for(const e of enemies){
    if(!e.alive||e.type==='ouvinte'||e.type==='manequim'||e.state==='dorm'||(e.stalker&&e.down>0)||e.cut)continue;
    const dp=hyp(e.x-P.x,e.y-P.y), d=hyp(e.x-ox,e.y-oy);
    // em silêncio eles não atiram: só se você já fez barulho, ou se a coisa está em cima de alguém
    const loud=G.time-(G.lastLoud??-99)<5, threat=e.state==='chase'&&(e.sees||dp<150)&&(dp<170||d<110);
    if(!loud&&!threat)continue;
    if(!loud&&(P.crouch||!lampOn())&&dp>120&&d>100)continue;
    if(d<bd&&los(ox,oy,e.x,e.y)){bd=d;best=e;}
  }
  return best;
}
function compShoot(c,ox,oy,e){
  const a=Math.atan2(e.y-oy,e.x-ox)+rr(-.04,.04);
  for(let i=0;i<c.pel;i++){const aa=a+(Math.random()-.5)*c.spread,sp=rr(900,1000);projs.push({k:'b',x:ox+Math.cos(a)*16,y:oy+Math.sin(a)*16,vx:Math.cos(aa)*sp,vy:Math.sin(aa)*sp,dmg:c.dmg,life:c.pel>1?.36:.6,pierce:0,knock:c.pel>1?90:50,crit:.04,hit:null,ally:1});}
  G.muzzle={x:ox+Math.cos(a)*18,y:oy+Math.sin(a)*18,t:.05,c:'shot'}; AU.shot(c.gun); alertNoise(ox,oy,c.pel>1?520:380);
  c.ang=a; c.fireT=.12; c.cool=c.rate*rr(.85,1.2);
  if(Math.random()<.06)bark(c.id,'a',c.id==='edu'?rpick(['Toma, desgraçado!','Mano, eles não param!','Recarregando... vai, vai!','Atrás de ti, Richard!']):rpick(['Chega mais, chega!','Segura essa!','Eu cuido da esquerda!','Porra, esse era o seu Zé...']));
}
function updComps(dt){
  syncComps(); if(!G.comps.length)return;
  const hb=hosp2B();
  for(const c of G.comps){
    c.cool-=dt; c.fireT=Math.max(0,c.fireT-dt);
    c.quiet=(G.inB>=0&&G.inB===hb&&!G.flags.hospOut)||P.hidden||CUT.on;
    if(P.inCar){c.inCar=true;c.x=V.x;c.y=V.y;
      if(c.id==='edu'&&c.cool<=0){const e=compTarget(V.x,V.y,380);if(e)compShoot(c,V.x,V.y,e);}
      continue;}
    if(c.inCar){c.inCar=false;const a=V.ang+Math.PI/2*(c.id==='edu'?1:-1);const [x,y]=freeTileNear(((V.x+Math.cos(a)*30)/TILE)|0,((V.y+Math.sin(a)*30)/TILE)|0,false);c.x=tc(x);c.y=tc(y);}
    if(P.hidden){c.moving=false;c.crouch=true;continue;}
    c.crouch=P.crouch;
    const dx=P.x-c.x,dy=P.y-c.y,d=hyp(dx,dy);
    if(d>820){const a=P.ang+Math.PI+rr(-.6,.6);const [x,y]=freeTileNear(((P.x+Math.cos(a)*60)/TILE)|0,((P.y+Math.sin(a)*60)/TILE)|0,false);c.x=tc(x);c.y=tc(y);continue;}
    let tx=0,ty=0,spd=0;
    const keep=c.id==='edu'?52:64;
    if(d>keep){
      spd=d>220?150:d>110?100:Math.max(P.crouch?44:60,P.running?130:P.crouch?48:80);
      if(d>110&&!los(c.x,c.y,P.x,P.y)){const f=flowDir(c);if(f){const l=hyp(f[0],f[1])||1;tx=f[0]/l;ty=f[1]/l;}else{tx=dx/d;ty=dy/d;}}
      else{tx=dx/d;ty=dy/d;}
    } else if(d<26){tx=-dx/(d||1);ty=-dy/(d||1);spd=40;}
    const ox=c.x,oy=c.y; if(spd>0)move(c,tx*spd*dt,ty*spd*dt,false);
    const mv=hyp(c.x-ox,c.y-oy); c.moving=mv>spd*dt*.3&&spd>0; if(c.moving){c.walk+=dt*12;c.ang+=angDiff(c.ang,Math.atan2(ty,tx))*Math.min(1,dt*10);}
    if(spd>0&&mv<spd*dt*.2){c.stuck+=dt;if(c.stuck>2.5){c.stuck=0;const [x,y]=freeTileNear((P.x/TILE)|0,(P.y/TILE)|0,false);c.x=tc(x);c.y=tc(y);}}else c.stuck=0;
    if(!c.quiet&&c.cool<=0){const e=compTarget(c.x,c.y,c.pel>1?260:340);if(e)compShoot(c,c.x,c.y,e);}
    if(!c.moving&&c.fireT<=0){const e=enemies.find(e=>e.alive&&e.vis&&hyp(e.x-c.x,e.y-c.y)<300);c.ang+=angDiff(c.ang,e?Math.atan2(e.y-c.y,e.x-c.x):P.ang)*Math.min(1,dt*3);}
  }
  // conversa de canto, quando tudo está quieto
  G.compTalkT=(G.compTalkT??rr(50,80))-dt;
  if(G.compTalkT<=0){G.compTalkT=rr(60,110);const c=rpick(G.comps);if(c&&!c.inCar&&!enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<500))bark(c.id,'t',compChat(c.id));}
}
function compChat(id){
  const F=G.flags;
  if(id==='edu')return rpick(F.matFollow?['Matheus, tu ainda tem aquele fone? Tu é muito nerd, mano.','Quando isso acabar a gente volta pro Gui... não. Não volta.','Richard, tu tá sangrando de novo, véi.']:
    F.inibidorDone?['Tu acha que a doutora vai virar?','Se eu virar, tu atira. Promete.','O Matheus não atende, Richard. Desde a meia-noite.']:
    ['Eu ainda ouço o barulho... deles comendo o Gui.','Fala baixo, mano. Eu tô ouvindo passo.','Eu nunca tinha pegado numa arma. Agora não solto mais.','Se tu morrer, eu te mato.']);
  return rpick(F.hospOut?['Esse porto eu conheço de olho fechado.','O guindaste da ala B ainda tem energia, eu acho.','Valeu por voltar por mim, Richard. Sério.','Se esse helicóptero não vier, a gente rouba um barco.']:
    ['Shh... ela tá perto. Eu sinto.','Pisa onde eu piso.','Não corre. Pelo amor de Deus, não corre.']);
}
function drawComps(){
  ctx.globalAlpha=1;
  for(const c of (G.comps||[])){
    if(P.ride||c.inCar||!inV(c.x,c.y))continue;
    drawHuman(c.x,c.y,c.ang,{crouch:c.crouch,coat:c.col,skin:c.skin,hair:c.hair,pants:c.pants,walk:c.walk,moving:c.moving,legAng:c.ang,wid:c.gun,loaded:true,firing:c.fireT>0,look:c.look});
  }
}

// ---------- falas com os amigos e NPCs novos ----------
function talkWith(n,id,lines,post){playCut([{npc:n,id},...linesToSteps(lines),...(post||[])]);}
STORY.compTalk=function(c){bark(c.id,'n',compChat(c.id));};
STORY.npc2=function(n){
  const F=G.flags;
  if(n.id==='eduC'){
    if(F.metHelena&&!F.clinicPower)return STORY.chat(L_('edu','t',rpick(['O resort é aqui do lado. O diesel tá na casa de máquinas, a doutora disse.','Eu fico com ela, mano. Se ela começar a ficar estranha... sei lá.','Tu viu o cara de sobretudo? Ele passou na frente da clínica. Devagar.'])));
    if(F.inibidorDone)return STORY.chat(L_('edu','t',rpick(['Vai, Richard. Acha o Matheus. Eu cuido dela.','Se o helicóptero vier, eu levo ela até o porto. Prometo.','Ela tá dormindo. A cor tá voltando... acho.'])));
    return STORY.chat(L_('edu','n','Bora, Richard?'));
  }
  if(n.id==='eduV'){
    if(!F.detGot)return STORY.detector(n);
    if(F.boss_especime||F.shopOpen)return STORY.eduRejoin(n);
    return STORY.chat(L_('edu','s',rpick(['Eu tô aqui na van. Qualquer coisa eu buzino.','Liga o detector lá dentro, mano. Ele apita quando tem coisa se mexendo.','O shopping tá muito quieto. Quieto demais.'])));
  }
  if(n.id==='matH')return STORY.matheusFound(n);
};

// ---------- ATO 1: o posto ----------
STORY.postoLeak=function(){
  const F=G.flags; if(F.postoLeak)return; F.postoLeak=true;
  G.ev.posto={t:18,beep:0};
  AU.alarm(); G.shake+=4;
  const g=enemies.find(e=>e.alive&&e.type==='gordo'); if(g){g.state='chase';g.lx=P.x;g.ly=P.y;g.hunt=true;g.huntT=30;}
  toast('VAZAMENTO DE GASOLINA! Saia do posto!');
  bark('rafa','s','Que cheiro... GASOLINA! A bomba tá vazando, isso vai explodir! Corre, corre!');
  for(let i=0;i<10;i++)parts.push({k:'acid',x:LM.bombas.x+rr(-60,60),y:LM.bombas.y+rr(-50,50),vx:rr(-30,30),vy:rr(-30,30),life:1.2,max:1.2,s:rr(2,4),c:'#c8b85a'});
};
function wreckPosto(live){
  const B=LM.bombas||{x:tc(31),y:tc(257)};
  for(const [x,y] of [[29,254],[33,254],[29,260],[33,260]]){setT(x,y,T.RUBBLE);if(typeof invalidateRect==='function')invalidateRect(x,y,1,1);GORE.push({k:'scorch',x:tc(x),y:tc(y),r:42,rot:Math.random()*6,seed:Math.random()});}
  GORE.push({k:'scorch',x:B.x,y:B.y,r:120,rot:0,seed:.3});
  for(const [x,y,r] of [[29,255,40],[33,255,40],[29,261,44],[33,261,40],[31,258,52],[24,250,30],[28,267,30]])addFire(tc(x),tc(y),r,false);
  for(const c of cars)if(c.x>=18&&c.x<=36&&c.y>=255&&c.y<=270&&!c.burn){c.burn=true;lights.push({x:(c.x+c.w/2)*TILE,y:(c.y+c.h/2)*TILE,r:190,c:'fire',f:1});}
  for(const l of lights)if(l.c==='neon'&&hyp(l.x-B.x,l.y-B.y)<260){l.offAt=0;l.offUntil=1e9;}
  if(live){
    explodeBig(B.x,B.y,{r:380,heavy:220,dmg:75});
    const g=enemies.find(e=>e.alive&&e.type==='gordo'); if(g&&hyp(g.x-B.x,g.y-B.y)<420){g.burn=6;hurtEnemy(g,99999,0,0,{burn:true});}
    for(const e of enemies)if(e.alive&&e.type!=='gordo'&&hyp(e.x-B.x,e.y-B.y)<420&&!e.t.boss)e.burn=6;
    for(let i=0;i<4;i++){const a=Math.random()*6.28,d=rr(80,200);const z=makeEnemy('zumbi',B.x+Math.cos(a)*d,B.y+Math.sin(a)*d,null);z.burn=8;z.state='chase';z.lx=P.x;z.ly=P.y;const tx=(z.x/TILE)|0,ty=(z.y/TILE)|0;if(inb(tx,ty)&&!SOLID[map[idx(tx,ty)]])enemies.push(z);}
  }
}
// explosão grande: dano por distância, clarão, pedaços, barulho na cidade inteira
function explodeBig(x,y,o){
  const dp=hyp(P.x-x,P.y-y);
  if(!P.inCar||dp<o.heavy){if(dp<o.heavy)hurtPlayer(o.dmg,x,y);else if(dp<o.r)hurtPlayer(o.dmg*.45,x,y);}
  if(dp<o.r*1.3){const a=Math.atan2(P.y-y,P.x-x);move(P,Math.cos(a)*40*(1-dp/(o.r*1.3)),Math.sin(a)*40*(1-dp/(o.r*1.3)),false);}
  for(const e of enemies){if(!e.alive)continue;const d=hyp(e.x-x,e.y-y);if(d<o.r*.8)hurtEnemy(e,e.t.boss?120:400*(1-d/o.r),Math.cos(Math.atan2(e.y-y,e.x-x))*300,Math.sin(Math.atan2(e.y-y,e.x-x))*300,{burn:true});}
  for(let i=0;i<80;i++){const a=Math.random()*6.28,s=rr(80,520);parts.push({k:'fire',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.3,.9),max:.9,s:rr(7,16),c:Math.random()<.5?'#ffb347':'#ff6a2a'});}
  for(let i=0;i<40;i++){const a=Math.random()*6.28,s=rr(30,160);parts.push({k:'smoke',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(1.5,3),max:3,s:rr(16,30),c:'#2a2724'});}
  for(let i=0;i<30;i++){const a=Math.random()*6.28,s=rr(150,420);parts.push({k:'debris',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.5,1),max:1,s:rr(2,5),c:'#4a4640'});}
  G.shake+=34; G.light=1; G.boom={x,y,t:.6}; G.hs=Math.max(G.hs||0,.12); buzz([120,60,200]); AU.bigBoom(); alertNoise(x,y,1700);
}
STORY.postoBoom=function(){
  const F=G.flags; if(F.postoBoom)return; F.postoBoom=true; F.caos=Math.max(F.caos||0,1); G.ev.posto=null;
  wreckPosto(true);
  later(1200,()=>{bark('rafa','s',F.boss_gordo?'O posto inteiro voou... e o Gordo junto. Tem gente pegando fogo correndo na rua.':'O posto inteiro voou... a rua tá pegando fogo.');});
  later(5200,()=>{AU.scream(.6);bark('rafa','t','Isso vai chamar a cidade inteira pra cá. Volta pro Tião. Agora.');});
};

// ---------- ATO 1: o Edu chega e a cidade vira caos ----------
STORY.eduArrive=function(){
  const of=LM.oficina||{x:P.x,y:P.y}, spot={x:of.x+tc(9)-tc(0),y:of.y-16};
  return [
    {wait:.5},{sfx:'bigBoom',v:.5},{fx:'shake',v:10},{fx:'flash',v:.4},
    {say:'tiao',m:'s',t:'Isso foi lá pra Avenida do Estado... Balneário tá queimando, garoto.'},
    {do:()=>{const c=spawnComp('edu',spot.x+120,spot.y);c.ang=Math.PI;CUT.actors.edu=c;G.flags.eduFollow=true;G.flags.eduSeen=true;}},
    {sfx:'knock',v:1},{say:'edu',m:'s',t:'RICHARD! RICHARD, É TU?!'},
    {cam:{x:spot.x+80,y:spot.y},t:.6},
    {walk:'edu',to:'rafa',ox:34,spd:170},
    {startle:'rafa'},{face:'rafa',at:'edu'},
    {say:'rafa',m:'s',t:'EDU?! Caramba, Edu! Como tu me achou?'},
    {say:'edu',m:'s',t:'A luz verde da oficina... dá pra ver da Quarta Avenida. Eu vim correndo, mano. Tinha uns vinte atrás de mim.'},
    {say:'rafa',m:'t',t:'Tu tava onde? Tá todo sujo de sangue.'},
    {say:'edu',m:'t',t:'Na casa do Gui. A gente tava jogando, normal. Aí o Lucas chegou mordido no braço. Disse que foi um mendigo na Atlântica.'},
    {say:'edu',m:'k',t:'Uma hora depois ele tava em cima do Gui. Arrancou um pedaço do pescoço dele com o dente, Richard. Eu vi o osso.'},
    {say:'edu',m:'k',t:'Eu tranquei a porta do banheiro e fiquei ouvindo... eles comendo. Duas horas. Depois eu saí pela janela.'},
    {say:'rafa',m:'t',t:'...Sinto muito, Edu.'},
    {choice:[
      {t:'Vem comigo. A gente vai pra Brava.',then:[{say:'edu',m:'h',t:'Óbvio que eu vou. Tu acha que eu fico aqui sozinho?'}]},
      {t:'E o Matheus? Tu falou com ele?',then:[{say:'edu',m:'t',t:'Ele tava de turno no porto, em Itajaí. Não atende. O último áudio dele era só uma sirene.'},{say:'rafa',m:'a',t:'Então a gente vai até lá também.'}]},
    ]},
    {say:'tiao',m:'n',t:'Mais um? O jipe aguenta dois. Toma, rapaz. Era do meu cunhado.'},
    {do:()=>{AU.reload();toast('O Tião deu um revólver velho pro Edu. Ele atira nos que vêm atrás de vocês, e do jipe também.');}},
    {say:'edu',m:'s',t:'Eu nunca atirei na vida, seu Tião.'},
    {say:'tiao',m:'a',t:'Hoje tu aprende.'},
    {say:'edu',m:'n',t:'Tu dirige, Richard. Eu vou atrás atirando.'},
    {say:'tiao',m:'s',t:'Espera. Escutei no rádio do Exército agora há pouco: atravessaram um caminhão-tanque na barricada. Jipe nenhum passa mais.'},
    {say:'rafa',m:'s',t:'E agora?'},
    {say:'tiao',m:'t',t:'O Ivo, lá das Laranjeiras, pesca com dinamite. Safado. A Interpraias desabou ontem... só se chega lá de bondinho.'},
    {say:'tiao',m:'n',t:'A estação é aqui do lado. Ainda tem energia. Vai e volta, garoto. Eu cuido do jipe.'},
    {say:'edu',m:'s',t:'Bondinho. De noite. Com essas coisas soltas. Perfeito.'},
    {do:()=>{G.flags.eduJoin=true;G.flags.needDina=true;G.flags.caos=2;G.ev.caosT=4;caosGore();}},
  ];
};
// a cidade desmoronando: explosões longe, fogo, sirenes, gente queimando
function caosTick(dt){
  const F=G.flags; if(!F.caos)return; const pd=dAt((P.x/TILE)|0,(P.y/TILE)|0); if(pd<5||pd>7||G.wave>0)return;
  G.ev.caosT=(G.ev.caosT??20)-dt; if(G.ev.caosT>0)return;
  G.ev.caosT=F.caos>=2?rr(14,26):rr(32,55);
  if(Math.random()<(F.caos>=2?.5:.3))return caosExtra();
  const r=Math.random();
  if(r<.55){
    // explosão longe, deixa fogo no lugar
    for(let i=0;i<20;i++){const a=Math.random()*6.283,d=rr(520,950),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;
      if(!inb(tx,ty)||dAt(tx,ty)<5)continue;const k=idx(tx,ty);if(SOLID[map[k]]||safeMask[k])continue;
      const v=clamp(1-d/1300,.2,.8);AU.boom(v);G.shake+=4*v;G.light=Math.max(G.light,.25*v);
      addFire(tc(tx),tc(ty),rr(28,44),true); for(let j=0;j<20;j++){const an=Math.random()*6.28,s=rr(40,260);parts.push({k:'fire',x:tc(tx),y:tc(ty),vx:Math.cos(an)*s,vy:Math.sin(an)*s,life:rr(.3,.7),max:.7,s:rr(6,12),c:'#ff8a3a'});}
      alertNoise(tc(tx),tc(ty),900);
      if(Math.random()<.35&&map[k]===T.ROAD)placeWreck(tc(tx),tc(ty),Math.random()<.5?0:Math.PI/2,pick2(CAR_COLS),null,true);
      if(!F.caosBark){F.caosBark=true;later(900,()=>{bark(G.flags.eduFollow?'edu':'rafa','s',G.flags.eduFollow?'Mano... a cidade tá explodindo inteira.':'Mais uma explosão... Balneário tá desmoronando.');});}
      break;}
  } else if(r<.75){
    // alguém pegando fogo correndo
    const sp=evSpot(300,460,null,false); if(sp){const e=makeEnemy(Math.random()<.5?'corr':'zumbi',sp.x,sp.y,null);e.burn=9;e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);AU.scream(.7);}
  } else if(r<.9){AU.tn(620,880,1.4,'sine',.03);AU.tn(880,620,1.4,'sine',.03,1.4);AU.tn(620,880,1.4,'sine',.03,2.8);spawnRing(2,'corr',620,820,true);}
  else {AU.tn(180,60,2.2,'sawtooth',.06);AU.nz(2.4,300,.5,.25);G.shake+=3;bark('rafa','s','Caças... passando baixo. Eles vão bombardear isso aqui.');}
}
// o helicóptero do Exército que cai na Barra Norte
function heliCrashStart(){
  const F=G.flags; if(F.heliCrash||G.ev.hc)return;
  const a=(P.inCar?V.ang:P.ang), d=P.inCar?620:420;
  let tx=((P.x+Math.cos(a)*d)/TILE)|0,ty=((P.y+Math.sin(a)*d)/TILE)|0;
  const t=freeTileNear(clamp(tx,16,180),clamp(ty,162,240),true); const X=tc(t[0]),Y=tc(t[1]);
  G.ev.hc={x:X+900,y:Y-700,tx:X,ty:Y,t:0,spin:0};
  AU.heli(); later(700,()=>{{bark('rafa','s','Aquele helicóptero... tá rodando... TÁ CAINDO!');AU.alarm();}});
}
function updHeliCrash(dt){
  const h=G.ev.hc; if(!h)return; h.t+=dt; h.spin+=dt*(6+h.t*4);
  const k=Math.min(1,h.t/3.2); h.cx=lerp(h.x,h.tx,k*k); h.cy=lerp(h.y,h.ty,k*k);
  if(Math.random()<dt*30)parts.push({k:'smoke',x:h.cx,y:h.cy,vx:rr(-20,20),vy:rr(-20,20),life:2,max:2,s:rr(12,20),c:'#1e1c1a'});
  if(k>=1){
    G.ev.hc=null; const F=G.flags; F.heliCrash=true; F.hcx=Math.round(h.tx); F.hcy=Math.round(h.ty);
    explodeBig(h.tx,h.ty,{r:300,heavy:130,dmg:60});
    heliWreck(h.tx,h.ty,true);
    later(1000,()=>{bark(G.flags.eduFollow?'edu':'rafa','s',G.flags.eduFollow?'CARALHO! Caiu bem na nossa frente! Tem soldado saindo dos destroços... eles tão pegando fogo, Richard!':'Caiu... os soldados estão saindo do fogo. Eles não deviam estar se mexendo.');});
  }
}
function heliWreck(x,y,live){
  GORE.push({k:'scorch',x,y,r:110,rot:0,seed:.7});
  addFire(x,y,52,false); addFire(x+40,y+20,34,false); addFire(x-36,y-14,30,false);
  GORE.push({k:'wreckHeli',x,y,r:40,rot:.6,seed:.2});
  for(let i=0;i<3;i++)GORE.push({k:'corpse',x:x+rr(-70,70),y:y+rr(-70,70),rot:Math.random()*6.28,type:'soldado',col:'#3d4a2f',skin:'#86907a',r:12});
  {let k=0;for(const [id,q,dx,dy] of [['m9',18,-50,30],['gran',2,40,-40],['spray',1,10,60]]){const uid='hc'+(k++);if(G.taken.has(uid)||pickups.some(p=>p.uid===uid))continue;const [tx,ty]=freeTileNear(((x+dx)/TILE)|0,((y+dy)/TILE)|0,true);pickups.push({uid,tx,ty,x:tc(tx),y:tc(ty),id,q,kind:'item'});if(typeof pickOcc!=='undefined')pickOcc.add(idx(tx,ty));}}
  if(live){
    for(let i=0;i<4;i++){const a=Math.random()*6.28,d=rr(50,110);const [tx,ty]=freeTileNear(((x+Math.cos(a)*d)/TILE)|0,((y+Math.sin(a)*d)/TILE)|0,true);const e=makeEnemy('soldado',tc(tx),tc(ty),null);e.burn=4;e.rising=1;e.stun=1;e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);}
  }
}

// ---------- ATO 2: a Brava ----------
STORY.onBrava=function(){
  const F=G.flags; if(F.persOn)return; F.persOn=true; G.persT=Math.max(G.persT,45);
  later(9000,()=>{bark(F.eduFollow?'edu':'rafa','s',F.eduFollow?'Richard... tem alguém parado lá no fim da rua. De sobretudo. Ele não se mexe.':'Tem alguém parado lá no fim da rua. De sobretudo. Ele não se mexe.');AU.thud(.6);});
};
STORY.dieselAmbush=function(){
  const F=G.flags; if(F.ambush)return; F.ambush=true; F.persOn=true;
  let p=enemies.find(e=>e.type==='pers');
  const sp=spawnPoint(260,380,false,true)||spawnPoint(200,500,false,false);
  if(!sp)return;
  if(!p){p=makeEnemy('pers',sp.x,sp.y,null);p.state='chase';p.hunt=true;enemies.push(p);}
  else{p.x=sp.x;p.y=sp.y;p.state='chase';}
  G.blackout=1.4; AU.roar(); G.shake+=10; buzz([80,40,120]);
  if(!F.persSeen){F.persSeen=true;STORY.introPers(p);}
  else bark('rafa','s','A porta... ELE TÁ AQUI. Ele me seguiu até o resort!');
};
STORY.gerador=function(){
  const F=G.flags;
  if(F.clinicPower)return toast('O gerador ronca baixinho. A clínica tem luz.');
  if(!F.metHelena)return toast('Gerador a diesel. Seco. Alguém tosse lá dentro da clínica.');
  if(invCount('diesel')<=0){AU.locked();return toast('O tanque do gerador está seco. Precisa de diesel.');}
  invRemove('diesel',1);
  const h=npcs.find(n=>n.id==='helena');
  playCut([
    {sfx:'click'},{wait:.4},{sfx:'creak',v:.6},{fx:'shake',v:3},{wait:.5},{sfx:'thud',v:.5},
    {do:()=>{F.clinicPower=true;G.flags['pw'+clinicB()]=true;G.flick=.4;AU.unlock();const b=buildings[clinicB()];if(b&&typeof invalidateRect==='function')invalidateRect(b.x,b.y,b.w,b.h);}},
    {say:'rafa',m:'h',t:'Pegou! Pegou!'},
    ...(h?[{npc:h,id:'helena'},{walk:'rafa',to:'helena',ox:-34,oy:14,spd:90},{face:'rafa',at:'helena'}]:[]),
    {say:'helena',m:'k',t:'Luz... graças a Deus. Me dá dois minutos com a centrífuga.'},
    {wait:1.2},{sfx:'click'},{wait:.8},
    {say:'helena',m:'t',t:'É o que eu pensava. A cepa já tá no sangue. Eu tenho uma hora, talvez menos, antes de virar uma deles.'},
    {choice:[
      {t:'O que eu faço?',then:[{say:'helena',m:'n',t:'O último lote do inibidor V-7 foi para o Hospital Ruth Cardoso, em Balneário. Geladeira da farmácia, ala leste.'}]},
      {t:'Foi a Vértice que fez tudo isso?',then:[{say:'helena',m:'a',t:'Foi a gente. Eu assinei os relatórios.'},{say:'helena',m:'t',t:'E agora eu sou o relatório.'},{say:'helena',m:'n',t:'O último lote do V-7 foi para o Hospital Ruth Cardoso, em Balneário. Geladeira da farmácia, ala leste.'}]},
    ]},
    ...(F.transfer?[{say:'rafa',m:'n',t:'O Ruth Cardoso? Eu já passei lá. A Vértice levou tudo pro Shopping Atlântico.'},{say:'helena',m:'s',t:'Então é lá. Eles usam o shopping como ponto de coleta. Cuidado com quem estiver de branco.'}]:[]),
    {say:'rafa',m:'s',t:'Balneário? A cidade tá pegando fogo, doutora.'},
    {say:'helena',m:'n',t:'Eu sei. Desculpa. Mas o cartão que abre Cabeçudas está comigo, e eu não vou conseguir te entregar se virar uma deles.'},
    {say:'helena',m:'s',t:'E Richard... a cidade não vai estar como você deixou. Se ficar quieto demais, corre.'},
    ...(F.eduJoin?[{say:'edu',m:'a',t:'Eu vou contigo, Richard. O tornozelo aguenta. Tu não volta pra Balneário sozinho.'},{do:()=>{F.eduClinic=false;F.eduFollow=true;}}]:[]),
    {do:()=>{F.v7=true;}},
  ]);
};

// ---------- ATO 2: Balneário em chamas, o detector, o shopping ----------
STORY.eduToVan=function(){
  const F=G.flags; if(F.eduVan||!F.eduFollow)return; F.eduFollow=false; F.eduVan=true; dropComp('edu');
  bark('edu','s',F.detGot?'Eu fico na van de olho, Richard. Vai.':'Richard! Uma van da Vértice na doca do shopping, do lado da Avenida Brasil! Vem ver isso!');
};
STORY.detector=function(n){
  const F=G.flags;
  talkWith(n,'edu',[
    L_('edu','s','Olha isso. A van tava aberta, mano. Tem sangue no banco e uma caixa da Vértice cheia de coisa.'),
    L_('edu','n','"Detector de presença — Vértice". Pega movimento. Funciona com pilha.'),
    {do:()=>{F.detGot=true;const l=invAdd('detector',1);if(l)boxAdd('detector',l);const l2=invAdd('pilha',2);if(l2)boxAdd('pilha',l2);AU.pickup();}},
    L_('rafa','n','Movimento? Tipo... eles?'),
    L_('edu','t','Tudo que se mexe. Se tá parado, ele não vê. Então se apitar e tu não tá vendo nada... corre.'),
    L_('edu','n','Eu fico aqui na van. Se a Vértice voltar pra buscar alguma coisa, eu te chamo.'),
    {do:()=>toast(IN.touch?'Você ganhou o Detector de presença. Toque no botão do radar no topo para ligar. Gasta pilha.':'Você ganhou o Detector de presença. Aperte T para ligar. Gasta pilha.')},
  ]);
};
STORY.eduRejoin=function(n){
  const F=G.flags;
  talkWith(n,'edu',[
    L_('edu','s','Tu saiu vivo daí?! Eu ouvi um grito que não era de gente lá dentro.'),
    L_('rafa','t','Não era. Bora. A Helena tá esperando.'),
    {do:()=>{F.eduVan=false;F.eduClinic=false;F.eduFollow=true;syncComps();const c=compOf('edu');if(c){c.x=n.x;c.y=n.y;}}},
  ]);
};
STORY.shopTrapped=function(){
  const F=G.flags; const sb=shopB(); if(sb>=0){F['pw'+sb]=false;const b=buildings[sb];if(typeof invalidateRect==='function')invalidateRect(b.x,b.y,b.w,b.h);}
  later(4200,()=>{bark('rafa','s','A luz caiu... o shopping inteiro apagou. A segurança devia ter um jeito de destravar essas portas.');});
};
STORY.painelShop=function(){
  const F=G.flags;
  if(!F.shopEv)return toast('Painel das portas de enrolar. Tudo destravado... por enquanto.');
  if(F.shopOpen||F.boss_especime)return toast('As portas já estão destravadas.');
  playCut([{sfx:'click'},{fx:'sparks',at:LM.painelShop},{wait:.4},{sfx:'creak',v:1},{fx:'shake',v:8},
    {do:()=>{F.shopOpen=true;const sb=shopB();if(sb>=0)F['pw'+sb]=true;G.flick=.4;for(const id of ['shopN','shopS','shopW','shopE','grade']){const g=gates.find(x=>x.id===id);if(g&&!g.open)openGate(g);}AU.unlock();AU.alarm();}},
    {say:'rafa',m:'s',t:'As portas tão subindo... e a grade da drogaria também. A ampola. Pega e some daqui.'},
    {sfx:'roar',v:1},{fx:'shake',v:6},{say:'rafa',m:'s',think:true,t:'Ele ouviu o alarme. Ele tá vindo.',dur:1.6}],
    ()=>{const b=enemies.find(e=>e.alive&&e.type==='especime');if(b){b.state='chase';b.hunt=true;b.huntT=60;b.lx=P.x;b.ly=P.y;}});
};
// boate: liga o som e todos vão pra pista; o segurança sai do escritório
STORY.som=function(o){
  const F=G.flags; if(G.ev.som&&G.ev.som.t>0)return toast('O som já está no talo.');
  G.ev.som={t:28,beat:0,doorT:2.6}; AU.click();
  if(!F.somTip){F.somTip=true;bark('rafa','s','Tá muito alto... muito alto! Todo mundo vai pra pista. Agora é dar a volta pela parede.');}
};
function updSom(dt){
  const s=G.ev.som; if(!s||s.t<=0)return; s.t-=dt; s.beat-=dt;
  if(s.doorT>0){s.doorT-=dt;if(s.doorT<=0){const g=gates.find(x=>x.id==='escritorioB');if(g&&!g.open){openGate(g);AU.thud(1);G.shake+=6;bark('rafa','s','A porta do escritório... o segurança saiu de lá! Ele tá indo pra pista.');const b=enemies.find(e=>e.uid==='segur'&&e.alive);if(b){b.state='investigate';b.nx=tc(52.5);b.ny=tc(261);b.it=20;}}}}
  if(s.beat<=0){s.beat=.47;const d=hyp((LM.som?LM.som.x:0)-P.x,(LM.som?LM.som.y:0)-P.y),v=clamp(1-d/1200,.08,1);
    AU.tn(55,40,.18,'sine',.5*v);AU.nz(.05,6000,1,.06*v,'highpass',.24);if(((s.t*2)|0)%2)AU.tn(220,220,.12,'square',.03*v,.1);
    const cx=tc(52.5),cy=tc(261);alertNoise(cx+rr(-60,60),cy+rr(-60,60),900);
    for(const e of enemies)if(e.alive&&e.state==='dorm'&&hyp(e.x-cx,e.y-cy)<260)riseEnemy(e,cx,cy);
    for(const e of enemies)if(e.alive&&e.state!=='chase'&&hyp(e.x-cx,e.y-cy)<120){e.state='investigate';e.nx=cx+rr(-80,80);e.ny=cy+rr(-80,80);e.it=3;}
    G.flick=Math.max(G.flick||0,.05);}
  if(s.t<=0)bark('rafa','t','O som parou. Eles vão voltar a procurar.');
}

// ---------- ATO 3: Itajaí, o Matheus, o Santa Clara ----------
STORY.matRadio=function(){
  const F=G.flags; if(F.matRadio)return; F.matRadio=true;
  UI.talk([
    L_('rafa','s','O rádio tá chiando... tem alguém no canal.',{think:true}),
    L_('matheus','s','...alguém... alguém no canal sete? Por favor...',{radio:true}),
    L_('rafa','s','MATHEUS?! É o Richard!'),
    L_('matheus','s','Richard? Caralho, mano... tu tá vivo. Tu tá onde?',{radio:true}),
    L_('rafa','n','Itajaí. Acabei de passar Cabeçudas. O Edu tá com a gente, ficou na Brava.'),
    L_('matheus','t','O Edu tá vivo... graças a Deus. Eu tô no Hospital Santa Clara, no isolamento. Me trouxeram do porto com a mão aberta num contêiner... aí tudo virou.',{radio:true}),
    L_('matheus','s','Fala baixo. Tem uma coisa aqui dentro. Uma mulher alta... ela não tem olho, Richard. Costuraram a boca dela. Ela ESCUTA.',{radio:true}),
    L_('matheus','s','Ela pegou o enfermeiro pelo barulho do sapato. Arrastou ele pelo corredor. Eu ouvi tudo.',{radio:true}),
    L_('matheus','t','Se tu vier, entra devagar. Não corre. E não atira, mano, que bala não faz nada nela.',{radio:true}),
    L_('rafa','a','Aguenta aí. Eu tô indo te buscar.'),
  ]);
};
function hospLockTick(){
  const F=G.flags; if(F.hospLock||!F.matRadio)return; const hb=hosp2B(); if(hb<0||G.inB!==hb||!LM.hospIn)return;
  if(hyp(P.x-LM.hospIn.x,P.y-LM.hospIn.y)<90||P.inCar)return;
  F.hospLock=true; const g=gates.find(x=>x.id==='hospIn'); if(g)closeGate(g);
  if(F.eduFollow){F.eduFollow=false;F.eduClinic=true;dropComp('edu');}
  playCut([{fx:'slam'},{fx:'blackout',v:1.6},{sfx:'thud',v:1},{wait:.5},
    {say:'rafa',m:'s',t:'A porta! Travou sozinha... não abre por dentro.'},
    {wait:.4},{sfx:'click2',v:.6},{wait:.6},{sfx:'click2',v:.8},
    {say:'rafa',m:'s',think:true,t:'Esse barulho... tipo um estalo. Vem do fundo do corredor.',dur:2},
    {say:'matheus',m:'s',radio:true,t:'Richard... ouvi a porta. É tu? Não responde alto. Isolamento, ala norte. Vem devagar.'}]);
}
STORY.matheusFound=function(n){
  const F=G.flags; if(F.matheusJoin)return;
  playCut([{npc:n,id:'matheus'},{startle:'matheus'},
    {say:'matheus',m:'s',t:'Shhh! ...Richard? É tu mesmo?'},
    {say:'rafa',m:'h',t:'Sou eu, mano. Bora sair daqui.'},
    {say:'matheus',m:'t',t:'A porta da frente travou quando tu entrou, né? Eu ouvi. A dos fundos tem corrente. Na manutenção tem alicate de corte, eu vi o seu Zé usando.'},
    {say:'matheus',m:'s',t:'Ela fica rondando os corredores. Ela não enxerga. Mas se tu bater o pé, ela vem. Joga garrafa longe que ela vai atrás do barulho.'},
    {say:'matheus',m:'n',t:'Eu vou atrás de ti. Bem colado. Eu não faço barulho, eu juro.'},
    {do:()=>{F.matheusJoin=true;F.matFollow=true;syncComps();const c=compOf('matheus');if(c){c.x=n.x;c.y=n.y;}const l=invAdd('garrafa',2);if(l)boxAdd('garrafa',l);toast('O Matheus está com você. Ele te deu duas garrafas vazias.');}},
  ]);
};
STORY.hospExit=function(){
  const F=G.flags; F.hospOut=true;
  later(600,()=>{bark('matheus','h','Ar de verdade, mano... nunca achei que ia ficar feliz com cheiro de rio.');});
  later(5200,()=>{bark('matheus','n','O helicóptero sai do porto. Eu trabalho lá, conheço cada contêiner. Bora.');});
};
STORY.guindaste=function(){
  const F=G.flags;
  if(F.conteiner)return toast('O guindaste está parado. O caminho do heliponto está livre.');
  if(!F.matheusJoin)return toast('Painel do guindaste: alavancas, um joystick, um monte de botão. Você não faz ideia de como mexe nisso.');
  const c=compOf('matheus'); if(c)CUT.actors.matheus=c;
  const gc=gateCenter('conteiner')||{x:P.x,y:P.y};
  playCut([...(c?[{npc:c,id:'matheus'}]:[]),
    {say:'rafa',m:'n',t:'Contêiner tombado no caminho do heliponto. Tu sabe mexer nisso?'},
    {say:'matheus',m:'h',t:'Sei se eu sei. Doze anos de porto, mano. Deixa comigo.'},
    {sfx:'click'},{wait:.4},{sfx:'creak',v:1},{cam:gc,t:1},{fx:'shake',v:6},{sfx:'creak',v:1},{wait:.6},
    {do:()=>{const g=gates.find(x=>x.id==='conteiner');if(g&&!g.open)openGate(g);F.conteiner=true;AU.thud(1);G.shake+=10;for(let i=0;i<40;i++)parts.push({k:'debris',x:gc.x+rr(-150,150),y:gc.y+rr(-60,60),vx:rr(-180,180),vy:rr(-180,180),life:.7,max:.7,s:rr(2,5),c:'#6e3529'});alertNoise(gc.x,gc.y,1100);}},
    {wait:.6},{say:'matheus',m:'h',t:'Hehe. Liberado.'},
    {say:'matheus',m:'s',t:'...Isso fez um barulho do caralho. Prepara.'},
    {cam:{x:P.x,y:P.y},t:.4}]);
};

// ---------- ATO 3: o navio ----------
STORY.shipStart=function(){
  const F=G.flags; if(F.shipCrash||G.ev.ship)return;
  G.ev.ship={t0:G.time};
  const at={x:tc(140),y:tc(6)};
  playCut([{cam:{x:tc(182),y:tc(6)},t:1.1},{sfx:'shipHorn'},{wait:.6},
    {say:F.matFollow?'matheus':'rafa',m:'s',t:F.matFollow?'Aquele cargueiro... ele tá vindo direto pro cais. Não tem ninguém no leme!':'Um navio... vindo direto pro cais. Não tem ninguém no leme.'},
    {cam:at,t:2.6},{sfx:'shipHorn'},{wait:2.2},
    {do:()=>shipCrash(true)},
    {wait:1.2},
    {say:'rafa',m:'s',t:'Tem gente saindo do navio... não. Não é gente.'},
    {wait:.5},{sfx:'roar',v:1},{fx:'shake',v:14},
    {say:F.matFollow?'matheus':'rafa',m:'s',t:F.matFollow?'Tem uma coisa ENORME no porão. Richard... atira em tudo.':'Tem uma coisa enorme no porão do navio...'},
    {cam:{x:P.x,y:P.y},t:.5}]);
};
function shipCrash(live){
  const F=G.flags; F.shipCrash=true; G.ev.ship=G.ev.ship||{t0:G.time-99}; G.ev.ship.crashed=true;
  for(let x=126;x<=154;x++)for(let y=9;y<=12;y++){const t=getT(x,y);if(t===T.WATER&&y>=9)continue;if(t===T.PIER||t===T.CONC||t===T.ROAD||t===T.SIDE){setT(x,y,R2()<.55?T.RUBBLE:T.CONC);}}
  for(let x=128;x<=152;x++){setT(x,8,T.WALL);}  // casco encostado no cais
  if(typeof invalidateRect==='function')invalidateRect(124,0,32,16);
  flowTile=-1;
  if(!live)return;
  explodeBig(tc(140),tc(10),{r:340,heavy:150,dmg:50});
  addFire(tc(134),tc(10),46); addFire(tc(146),tc(11),40); addFire(tc(140),tc(9),56);
  for(let i=0;i<12;i++){const [tx,ty]=freeTileNear(ri(128,152),ri(12,15),true);const e=makeEnemy(i%4===0?'corr':'afog',tc(tx),tc(ty),null);e.col=rpick(['#2a3a5a','#d8721e','#3a3a3a']);e.rising=.6;e.state='chase';e.hunt=true;e.huntT=60;enemies.push(e);}
  if(!F.bossDead&&!enemies.some(e=>e.type==='boss')){const [tx,ty]=freeTileNear(140,13,true);const b=makeEnemy('boss',tc(tx),tc(ty),null);b.state='chase';b.hunt=true;b.c2=4;b.c3=6;b.rising=1;enemies.push(b);later(2500,()=>{STORY.wave();});}
}
function R2(){return Math.random();}
function shipPos(){const s=G.ev&&G.ev.ship;let x=tc(140);if(s&&!s.crashed){const k=clamp((G.time-s.t0)/6.6,0,1);x=lerp(tc(215),tc(140),1-Math.pow(1-k,2));}return {x,y:tc(4.5)};}
function plotLights(){
  if((G.ev&&G.ev.ship)||G.flags.shipCrash){const p=shipPos();punch(p.x,p.y,260,.55);punch(p.x-230,p.y,90,.8);for(let i=-2;i<=2;i++)punch(p.x+i*90,p.y-60,50,.5);}
  const h=G.ev&&G.ev.hc;if(h&&h.cx!=null)punch(h.cx,h.cy,120,.8);
}
function drawShip(){
  const s=G.ev&&G.ev.ship; if(!s&&!G.flags.shipCrash)return;
  const sp=shipPos(),x=sp.x,y=sp.y;
  if(!inV(x,y,700))return;
  ctx.save();ctx.translate(x,y);ctx.rotate(s&&s.crashed||G.flags.shipCrash?.05:0);
  const L=560,Wd=150;
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(10,16,L/2,Wd/2,0,0,6.283);ctx.fill();
  ctx.fillStyle='#3a1e1a';ctx.beginPath();ctx.moveTo(-L/2,-Wd/2+10);ctx.lineTo(L/2-60,-Wd/2);ctx.quadraticCurveTo(L/2+20,0,L/2-60,Wd/2);ctx.lineTo(-L/2,Wd/2-10);ctx.closePath();ctx.fill();
  ctx.fillStyle='#54504a';ctx.fillRect(-L/2+10,-Wd/2+18,L-90,Wd-36);
  const cols=['#7a2a22','#2a4a7a','#c8a02a','#3a6a3a','#8a8a86'];
  for(let i=0;i<7;i++)for(let j=0;j<3;j++){ctx.fillStyle=cols[(i*3+j*2)%5];ctx.fillRect(-L/2+60+i*56,-Wd/2+26+j*34,50,30);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(-L/2+60+i*56,-Wd/2+26+j*34+26,50,4);}
  ctx.fillStyle='#d8d4c8';ctx.fillRect(-L/2+12,-34,44,68);ctx.fillStyle='#1a2026';ctx.fillRect(-L/2+46,-26,8,52);
  if(s&&s.crashed||G.flags.shipCrash){ctx.fillStyle='#120e0c';ctx.beginPath();ctx.ellipse(40,Wd/2-14,70,22,0,0,6.283);ctx.fill();}
  ctx.restore();
}
STORY.eduFixJeep=function(){
  const F=G.flags;F.jeepFixedEdu=(F.jeepFixedEdu||0)+1;
  playCut([{say:F.eduFollow?'edu':'rafa',m:'t',t:F.eduFollow?'O Tião me mostrou o depósito de peças antes... deixa comigo. Vai demorar.':'O depósito do Tião ainda tem peças. Vai demorar.'},{fx:'blackout',v:1.4},{sfx:'thud',v:.6},{wait:.8},{sfx:'rev',v:1},
    {do:()=>{const j=LM.jipe||{x:V.x,y:V.y};Object.assign(V,{x:j.x,y:j.y,ang:-Math.PI/2,spd:0,hp:V.max*.6,ok:true,dead:false});G.clock+=40;toast('O jipe voltou a funcionar. Quarenta minutos se passaram.');}}]);
};
function drawHeliCrash(){
  const h=G.ev&&G.ev.hc; if(!h||h.cx==null)return;
  ctx.save();ctx.translate(h.cx,h.cy);ctx.rotate(h.spin*.3);
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(30,40,44,18,0,0,6.283);ctx.fill();
  ctx.fillStyle='#2c3326';ctx.beginPath();ctx.ellipse(0,0,36,15,0,0,6.283);ctx.fill();ctx.fillRect(-64,-3,32,6);
  ctx.strokeStyle='rgba(20,20,20,.6)';ctx.lineWidth=4;for(let i=0;i<2;i++){const a=h.spin+i*1.57;ctx.beginPath();ctx.moveTo(Math.cos(a)*60,Math.sin(a)*60);ctx.lineTo(-Math.cos(a)*60,-Math.sin(a)*60);ctx.stroke();}
  ctx.fillStyle=`rgba(255,${120+Math.random()*80|0},40,.9)`;ctx.beginPath();ctx.arc(-20,0,8+Math.random()*4,0,6.283);ctx.fill();
  ctx.restore();
}

// ---------- os amigos no heliponto ----------
function friendsTick(){
  const F=G.flags; if(!F.radio||F.friendsCame||G.wave>58||G.wave<=0)return;
  F.friendsCame=true;
  if(F.eduJoin){const g=gateCenter('heli')||LM.pad;const c=spawnComp('edu',g.x-60,g.y);F.eduFollow=true;F.eduCame=true;c.ang=0;
    AU.horn();bark('edu','a',F.helena==='levar'?'CHEGUEI, PORRA! Trouxe a doutora! Segura eles que o helicóptero tá vindo!':'CHEGUEI! Ninguém morre hoje, ouviu?! NINGUÉM!');}
}

// ---------- disparos de cena por lugar ----------
function plotTriggers(){
  const F=G.flags, near=(id,r)=>{const n=npcs.find(n=>n.id===id);return n&&(!n.cond||n.cond())&&hyp(n.x-P.x,n.y-P.y)<r?n:null;};
  let n;
  // o Edu vê a van da Vértice
  if(F.eduFollow&&F.v7&&!F.eduVan&&!F.detGot&&LM.van){const sb=shopB();if(hyp(P.x-LM.van.x,P.y-LM.van.y)<900||G.inB===sb)STORY.eduToVan();}
  if(!F.ivoMet&&(n=near('ivo',150)))return STORY.ivo(n);
  if(F.bloqWeak&&!F.bloqueio){const g=gates.find(x=>x.id==='bloqueio');const py=P.inCar?V.y:P.y;if(g&&py<tc(g.y-1)){F.bloqueio=true;F.persOn=true;G.persT=Math.min(G.persT,30);ach('bloqueio');STORY.bloqueio();}}
  if(V.dead&&F.tiaoMorto&&!F.bloqueio&&!CUT.on&&G.inB===bOf(142,368))return STORY.eduFixJeep();
  if((n=near('eduV',110))&&(!F.detGot||F.boss_especime||F.shopOpen))return STORY.npc2(n);
  if(!F.matheusJoin&&F.hospLock&&(n=near('matH',120)))return STORY.npc2(n);
  if(F.caos>=2&&!F.heliCrash&&!G.ev.hc&&dAt((P.x/TILE)|0,(P.y/TILE)|0)===5&&((P.y/TILE)|0)<232)heliCrashStart();
  if(F.hospOut&&!F.sino&&!F.sinoHint&&dAt((P.x/TILE)|0,(P.y/TILE)|0)===0){F.sinoHint=true;bark(F.matFollow?'matheus':'rafa','s',F.matFollow?'O porto tá lotado deles, mano. Se a gente tocar o sino da Matriz, eles vão todos pra igreja. Barulho chama.':'O porto está lotado. Precisava de um barulho bem longe daqui pra tirar eles.');}
  if(!F.matRadio&&F.vertice&&dAt((P.x/TILE)|0,(P.y/TILE)|0)===1){G.ev.mrT=(G.ev.mrT||0)+(lastDt||1/60);if(G.ev.mrT>2.5)return STORY.matRadio();}
  hospLockTick();
}
// ---------- laço principal da história ----------
// ---------- medo: escuro, coisa perto que você não vê, perseguidor, pouca vida ----------
function fearTick(dt){
  let t=0; const dark=!lampOn()||P.bat<20; if(dark&&!(G.pLit))t+=.18;
  for(const e of enemies){if(!e.alive||e.state==='dorm')continue;const d=hyp(e.x-P.x,e.y-P.y);if(d>700)continue;
    if(e.stalker&&e.down<=0)t+=.45*(1-d/700);else if(e.type==='ouvinte')t+=.5*(1-d/700);else if(d<320&&!e.vis)t+=e.state==='chase'?.16:.06;else if(d<200&&e.state==='chase')t+=.08;}
  if(P.hp<P.max*.35)t+=.2; if(daylight()>.6&&G.inB<0)t*=.5; if(G.pSafe||CUT.on)t=0;
  t=clamp(t,0,1); if(DBG.fearMax){G.fear=1;t=1;} G.fear=lerp(G.fear||0,t,Math.min(1,dt*(t>(G.fear||0)?.6:.25)));
  if((G.fear||0)>.6&&!CUT.on&&!G.pSafe){G.ev.hallT=(G.ev.hallT??rr(8,14))-dt;if(G.ev.hallT<=0){G.ev.hallT=rr(10,20);const r=Math.random();
    if(r<.35&&!G.vulto){for(let i=0;i<20;i++){const a=P.ang+rr(-.4,.4),dd=rr(180,300),x=P.x+Math.cos(a)*dd,y=P.y+Math.sin(a)*dd,tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]]||!los(P.x,P.y,x,y))continue;G.vulto={x,y,life:3,seen:0,face:Math.atan2(P.y-y,P.x-x)};break;}}
    else if(r<.6)AU.steps();
    else if(r<.8)bark('rafa','s',pick2(['Tem alguém respirando... atrás de mim.','Para. Para de olhar pra mim.','Eu ouvi meu nome. Eu ouvi meu nome.','Não é nada. Não é nada. Não é nada.']),{dur:2.2});
    else{AU.knock();G.flick=.2;}}}
}
function updPlot(dt){
  const F=G.flags; fearTick(dt);
  updComps(dt); updFires(dt); updSom(dt); updHeliCrash(dt); fuseTick(dt); hospPurge(); cidaTick();
  if(G.ev.genL){G.ev.genL.t-=dt;if(G.ev.genL.t<=0){G.ev.genL.t=2.2;const d=hyp(G.ev.genL.x-P.x,G.ev.genL.y-P.y);alertNoise(G.ev.genL.x,G.ev.genL.y,900);AU.tn(55,50,.5,'sawtooth',.06*clamp(1-d/900,.05,1));}} silenceTick(dt); if(!G.ev.silent)caosTick(dt); friendsTick();
  if(G.ev.shipT>0){G.ev.shipT-=dt;if(G.ev.shipT<=0&&!CUT.on)STORY.shipStart();else if(G.ev.shipT<=0)G.ev.shipT=.5;}
  const ps=G.ev.posto;
  if(ps){ps.t-=dt;ps.beep-=dt;if(ps.beep<=0){ps.beep=ps.t<6?.35:.8;AU.beep(1,ps.t<6?1800:1200);}
    if(Math.random()<dt*8&&LM.bombas)parts.push({k:'smoke',x:LM.bombas.x+rr(-50,50),y:LM.bombas.y+rr(-40,40),vx:rr(-10,10),vy:rr(-30,-10),life:1.6,max:1.6,s:rr(8,14),c:'#6a6450'});
    if(ps.t<=0)STORY.postoBoom();}
  if(!CUT.on&&G.mode==='play')plotTriggers();
}
// ---------- ao carregar: o mundo continua como você deixou ----------
function applyWorldState(){
  const F=G.flags; FIRES=[];
  for(const it of interacts.slice())if(it.type==='janela'&&F['jan'+it.tx+'_'+it.ty]){it.broken=true;{const bb=buildings[bmap[idx(it.tx,it.ty)]];const w=bb&&bb.wins&&bb.wins.find(w=>w.x===it.tx&&w.y===it.ty);if(w)w.broken=true;}setT(it.tx,it.ty,(buildings[bmap[idx(it.tx,it.ty)]]||{}).floor||T.TILEF);interacts.splice(interacts.indexOf(it),1);}
  if(F.postoLeak&&!F.postoBoom){F.postoBoom=true;F.caos=Math.max(F.caos||0,1);}
  if(F.postoBoom)wreckPosto(false);
  for(const [x,y,r] of (F.fl||[]))addFire(x,y,r,false);
  if(F.caos>=2)caosGore();
  if(F.tiaoMorto&&!G.taken.has('tiaoG')&&!pickups.some(p=>p.uid==='tiaoG')){const [px,py]=freeTileNear(156,376,true);pickups.push(P.owned[2]?{uid:'tiaoG',tx:px,ty:py,x:tc(px),y:tc(py),id:'cart',q:10,kind:'item'}:{uid:'tiaoG',tx:px,ty:py,x:tc(px),y:tc(py),id:2,q:6,kind:'weapon'});}
  if(F.heliCrash&&F.hcx)heliWreck(F.hcx,F.hcy,false);
  if(F.hospLock&&!F.hospOut){const g=gates.find(x=>x.id==='hospIn');if(g)closeGate(g);}
  if(F.shopEv&&!F.shopOpen&&!F.boss_especime){delete F['pw'+shopB()];}
  if(F.metHelena&&!F.clinicPower)F['pw'+clinicB()]=false;
  if(F.cidaTurned)cidaFall(false);
  if(F.bloqWeak){const g=gates.find(x=>x.id==='bloqueio');if(g&&!g.open)openGate(g);}
  G.comps=[]; syncComps();
}

// ---------- menu de teste: pular para um ponto da história ----------
function dbgJump(k){
  const F=G.flags, give=(id,q)=>{const l=invAdd(id,q);if(l)boxAdd(id,l);};
  const goTo=pt=>{if(!pt)return;if(P.inCar)exitCar(true);const [x,y]=freeTileNear((pt.x/TILE)|0,(pt.y/TILE)|0,true);P.x=tc(x);P.y=tc(y);snapCamera();flowTile=-1;};
  const open=id=>{const g=gates.find(x=>x.id===id);if(g&&!g.open)openGate(g);F[id]=true;};
  const arm=()=>{F.armed=true;P.owned[0]=true;P.dur=30;P.owned[1]=true;P.mags[1]=12;give('m9',24);P.w=1;};
  const steps=['posto','caos','laranj','brava','gerador','bc2','shop','itajai','hosp','porto','navio'], n=steps.indexOf(k);
  if(n>=0){arm();F.metTiao=true;F.fuse=true;open('arsenal');}
  if(n>=1){F.deposito=true;open('deposito');F.postoLeak=true;if(!F.postoBoom){F.postoBoom=true;wreckPosto(false);}F.caos=2;F.batDone=true;F.jipe=true;F.mapAll=true;explored.fill(1);V.ok=true;V.dead=false;F.eduJoin=true;F.eduFollow=true;F.eduSeen=true;}
  if(n>=1)F.needDina=true;
  if(n>=2){F.bondRide=1;}
  if(n>=3){F.bloqueio=true;open('bloqueio');F.ivoMet=true;F.ivoMorto=true;F.laranjGone=true;F.tiaoMorto=true;F.bloqWeak=true;F.geradorL=true;}
  if(n>=4){F.metHelena=true;F.eduFollow=false;F.eduClinic=true;F['pw'+clinicB()]=false;F.ambush=true;F.persOn=true;give('diesel',1);}
  if(n>=5){invRemove('diesel',1);F.clinicPower=true;F['pw'+clinicB()]=true;F.v7=true;F.eduClinic=false;F.eduFollow=true;}
  if(n>=6){F.transfer=true;F.eduFollow=false;F.eduVan=true;F.detGot=true;give('detector',1);give('pilha',2);}
  if(n>=7){F.shopEv=true;F.shopOpen=true;F.inibidorDone=true;F.helena='levar';F.helenaGone=true;F.eduVan=false;F.eduClinic=true;give('cartao',1);open('vertice');F.vertice=true;P.max=120;P.hp=120;}
  if(n>=8){F.matRadio=true;}
  if(n>=9){F.hospLock=true;F.matheusJoin=true;F.matFollow=true;F.hospOut=true;open('hospOut');give('heliKey',1);}
  if(n>=10){F.conteiner=true;open('conteiner');open('heli');}
  syncComps();
  const where={posto:LM.posto,caos:LM.oficina,laranj:LM.bondMA,brava:LM.clinica,gerador:LM.gerador,bc2:LM.farmacia,shop:LM.grade,itajai:LM.itajai,hosp:LM.hospIt,porto:LM.lab,navio:LM.radio}[k];
  goTo(where);
  if(k==='caos'||k==='bc2'){const [x,y]=freeTileNear(((P.x+70)/TILE)|0,(P.y/TILE)|0,true);Object.assign(V,{x:tc(x),y:tc(y),ok:true,dead:false,hp:V.max});}
  if(k==='shop'){STORY.shopEvent();}
  if(k==='navio'){startWave();}
  G.comps.forEach(c=>{c.x=P.x-30;c.y=P.y;});
  toast('Pulou para: '+k);
}

// ---------- a Abominação arrebenta o porto ----------
const SMASH=new Set([T.PROP,T.CAR,T.FENCE,T.TREE,T.GATE,T.WINDOW,T.SHUTTER,T.WALL,T.RUBBLE]);
function bossSmash(e){
  const cx=(e.x/TILE)|0,cy=(e.y/TILE)|0,R0=Math.ceil((e.r+14)/TILE); let hit=0;
  for(let j=-R0;j<=R0;j++)for(let i=-R0;i<=R0;i++){
    const x=cx+i,y=cy+j; if(!inb(x,y)||x<2||y<10||x>W-3)continue;
    const t=getT(x,y); if(!SMASH.has(t))continue;
    const px=tc(x)-e.x,py=tc(y)-e.y; if(hyp(px,py)>e.r+14||px*e.cdx+py*e.cdy<-12)continue;
    if(dAt(x,y)!==0)continue;
    if(t===T.CAR){const c=cars.find(c=>x>=c.x&&x<c.x+c.w&&y>=c.y&&y<c.y+c.h);if(c&&!c.smashed){c.smashed=true;for(let q=interacts.length-1;q>=0;q--){const o=interacts[q];if(o.type==='hide'&&o.kind==='carro'&&o.tx===c.x&&o.ty===c.y){if(P.hidden===o)exitHide(true);interacts.splice(q,1);}}{const lx0=(c.x+c.w/2)*TILE,ly0=(c.y+c.h/2)*TILE;for(let q=lights.length-1;q>=0;q--){const l=lights[q];if(l.c==='fire'&&Math.abs(l.x-lx0)<2&&Math.abs(l.y-ly0)<2)lights.splice(q,1);}}for(let jj=0;jj<c.h;jj++)for(let ii=0;ii<c.w;ii++)setT(c.x+ii,c.y+jj,T.GRAVEL);cars.splice(cars.indexOf(c),1);explode(tc(c.x)+c.w*8,tc(c.y)+c.h*8,90,50);GORE.push({k:'scorch',x:tc(c.x),y:tc(c.y),r:40,rot:0,seed:.2});}continue;}
    if(t===T.GATE||t===T.SHUTTER){const g=gates.find(g=>x>=g.x&&x<g.x+g.w&&y>=g.y&&y<g.y+g.h);if(g&&!g.open){openGate(g);G.flags[g.id]=true;}}
    const w=t===T.WINDOW&&interacts.find(o=>o.type==='janela'&&o.tx===x&&o.ty===y); if(w){breakWindow(w,false);}
    setT(x,y,T.GRAVEL); hit++;
    if(Math.random()<.5)GORE.push({k:'glass',x:tc(x),y:tc(y),r:10,rot:Math.random()*6,seed:Math.random()});
    for(let k=0;k<5;k++)parts.push({k:'debris',x:tc(x),y:tc(y),vx:rr(-220,220)+e.cdx*120,vy:rr(-220,220)+e.cdy*120,life:rr(.4,.8),max:.8,s:rr(2,5),c:t===T.WALL?'#4a4640':t===T.PROP?'#6e3529':'#5a5650'});
  }
  if(hit){if(typeof invalidateRect==='function')invalidateRect(cx-R0-1,cy-R0-1,R0*2+3,R0*2+3);flowTile=-1;AU.thud(1);G.shake+=Math.min(6,hit);if(!G.flags.smashBark){G.flags.smashBark=true;later(400,()=>bark(G.flags.matFollow?'matheus':'rafa','s',G.flags.matFollow?'ELA TÁ DERRUBANDO OS CONTÊINERES! Não fica atrás de nada!':'Ela atravessa tudo... não adianta se esconder atrás de nada!'));}}
}
function bossThrow(e,rage){
  const n=rage?3:1, a0=Math.atan2(P.y-e.y,P.x-e.x);
  for(let k=0;k<n;k++){const a=a0+(k-(n-1)/2)*.28;projs.push({k:'s',rock:true,col:rpick(['#7a2a22','#2a4a7a','#c8a02a','#3a6a3a']),x:e.x+Math.cos(a)*e.r,y:e.y+Math.sin(a)*e.r,vx:Math.cos(a)*330,vy:Math.sin(a)*330,dmg:24,life:2.2,spin:0});}
  e.hitAnim=.5; AU.roar(); G.shake+=4;
}

// ---------- Balneário: o caos piora ----------
const HELP_CAOS=['ME AJUDA! PELO AMOR DE DEUS!','Minha filha ficou lá dentro!','Eles tão me comendo! SOCORRO!','Não me deixa aqui!','Tá queimando! Tá queimando!'];
function caosExtra(){
  const r=Math.random(), F=G.flags;
  if(r<.34){const sp=evSpot(260,420,null);if(sp){const p=spawnSurvivor(sp,ri(2,4),{help:HELP_CAOS});p.say={t:pick2(HELP_CAOS),life:2.2};AU.scream(.5);}}
  else if(r<.52){const sp=evSpot(240,380,1.4,false);if(sp){const p=spawnSurvivor(sp,0,{st:'sit',look:pick2(PED_LOOK)});p.ang=Math.random()*6.28;p.moving=false;p.dying=true;}}
  else if(r<.66){for(let i=0;i<ri(4,7);i++)later(i*rr(120,260),()=>{AU.nz(.12,1500,.7,.09,'lowpass');AU.tn(130,50,.08,'square',.04);});
    const sp=evSpot(320,480,null);if(sp){const p=spawnSurvivor(sp,ri(3,4),{look:['#1d2a4a','#151515','#b88a6a'],help:['Recuando! Recuando!','Tô sem munição!','Corre, civil! Corre!'],item:'m9'});p.say={t:'Tô sem munição!',life:2};}
    later(900,()=>bark('rafa','s','Tiros... é a polícia. Eles ainda estão lutando.'));}
  else if(r<.8){// alguém grita numa janela e um deles arrebenta o vidro
    const ws=interacts.filter(o=>o.type==='janela'&&hyp(o.x-P.x,o.y-P.y)<520&&hyp(o.x-P.x,o.y-P.y)>160);if(ws.length){const w=pick2(ws);AU.scream(clamp(1-hyp(w.x-P.x,w.y-P.y)/700,.3,1));later(1300,()=>{if(interacts.includes(w)){breakWindow(w,false);addDecal({k:'blood',x:w.x,y:w.y,r:22,rot:0,seed:.3});const e=makeEnemy('corr',w.x,w.y,null);const t=freeTileNear(w.tx,w.ty,true);e.x=tc(t[0]);e.y=tc(t[1]);e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);}});}}
  else{// carro desgovernado que bate e pega fogo
    if(evCarStart()){EV.car.crashIn=rr(1.2,2.2);}}
}
function caosGore(){
  // corpos pela rua quando a cidade cai (refeito ao carregar; são só manchas)
  let n=0;for(let i=0;i<500&&n<70;i++){const x=ri(14,183),y=ri(162,386),k=idx(x,y);if(map[k]!==T.ROAD&&map[k]!==T.SIDE)continue;
    GORE.push({k:'corpse',x:tc(x)+R2()*16-8,y:tc(y)+R2()*16-8,rot:R2()*6.28,type:'zumbi',col:pick2(PED_LOOK)[0],skin:'#c8a890',r:11});GORE.push({k:R2()<.5?'blood':'drag',x:tc(x),y:tc(y),r:rr(14,26),rot:R2()*6,seed:R2()});n++;}
}

// ---------- Balneário em silêncio: só o Bombeiro ----------
function silentBC(){const F=G.flags;return !!(F.metHelena&&F.bloqueio&&!F.inibidorDone);}
function inBC(){return dAt((P.x/TILE)|0,(P.y/TILE)|0)>=5;}
function silenceTick(dt){
  const F=G.flags, on=silentBC()&&inBC();
  let b=enemies.find(e=>e.type==='bombeiro'&&e.alive);
  if(!on){G.ev.silent=false;if(b&&b.down<=0&&(!silentBC()||hyp(b.x-P.x,b.y-P.y)>600))b.alive=false;return;}
  if(!G.ev.silent){
    G.ev.silent=true;
    for(const e of enemies){if(!e.alive||e.stalker||e.t.boss||e.type==='manequim')continue;const tx=(e.x/TILE)|0,ty=(e.y/TILE)|0;if(dAt(tx,ty)>=5&&bmap[idx(tx,ty)]<0)e.alive=false;}
    G.ev.bombT=F.bcSilentSeen?6:16; if(!F.cidaTurned&&(F.catDone||!F.askedCat)&&F.marlon!=='cida')cidaFall(true);
    if(!F.bcSilentSeen){F.bcSilentSeen=true;later(2200,()=>bark(F.eduFollow?'edu':'rafa','s',F.eduFollow?'Richard... cadê todo mundo? Cadê ELES? Tá tudo quieto.':'Silêncio. Nenhum grito, nenhum tiro. Cadê eles?'));
      later(8000,()=>bark('rafa','t','As fogueiras apagaram. Só fumaça... e esse cheiro.'));}
  }
  for(const e of enemies){if(!e.alive||e.stalker||e.t.boss||e.type==='manequim'||e.uid==='cidaZ'||e.cut)continue;const d=dAt((e.x/TILE)|0,(e.y/TILE)|0);if(d>=5&&d<=7)e.alive=false;}
  if(!b){G.ev.bombT-=dt;if(G.ev.bombT<=0&&!CUT.on&&!G.pSafe&&(F.bombMet||G.ev.bombLate)){const sp=spawnPoint(520,720,false,true);if(sp){b=makeEnemy('bombeiro',sp.x,sp.y,null);b.state='chase';b.hunt=true;b.lx=P.x;b.ly=P.y;enemies.push(b);if(!F.bombMet){F.bombMet=true;STORY.introBombeiro(b);}else AU.roar();}else G.ev.bombT=2;}}
  else{
    const d=hyp(b.x-P.x,b.y-P.y);
    // durante a armadilha do shopping ele fica do lado de fora, esperando
    if(F.shopEv&&!F.shopOpen&&!F.boss_especime){const sb=shopB();if(sb>=0&&bmap[idx((b.x/TILE)|0,(b.y/TILE)|0)]===sb){b.x=tc(125.5);b.y=tc(272.5);b.state='search';b.st=99;}if(G.inB===sb){b.state='search';b.st=1;}}
    if(d>1300&&b.down<=0&&!P.inCar){G.ev.bombTp=(G.ev.bombTp??5)-dt;if(G.ev.bombTp<=0){G.ev.bombTp=6;const sp=spawnPoint(720,900,false,true);if(sp){b.x=sp.x;b.y=sp.y;b.state='chase';}}}
    G.ev.dragT=(G.ev.dragT||0)-dt;if(G.ev.dragT<=0&&b.down<=0){G.ev.dragT=d<300?.7:1.2;if(d<950)AU.drag(clamp(1-d/950,.08,1));}
    if(d<240&&b.down<=0)G.flick=Math.max(G.flick||0,Math.random()<.02?.15:0);
  }
  // o que ainda faz barulho numa cidade morta
  G.ev.silAmb=(G.ev.silAmb??12)-dt;
  if(G.ev.silAmb<=0){G.ev.silAmb=rr(20,36);const r=Math.random();
    if(r<.3&&!G.phone){const sp=evSpot(260,420,null,false);if(sp){G.phone={x:sp.x,y:sp.y,t:.2,n:5};later(1200,()=>bark('rafa','s','Um orelhão... tocando. Isso vai chamar ele.'));}}
    else if(r<.55)bark('piloto','n',pick2(['...Defesa Civil de Balneário Camboriú... a evacuação foi encerrada... permaneçam em casa...','...repetindo: não há mais resgate terrestre... não há mais...','...se você ouve esta mensagem... não abra a porta para ninguém...']),{radio:true,dur:4});
    else if(r<.75){AU.tn(196,196,3,'sine',.05);AU.tn(247,247,3,'sine',.04,.05);later(400,()=>bark('rafa','t','Uma música... vindo de algum apartamento. Uma caixinha de música.'));}
    else{AU.scream(.12);AU.knock();}}
}
STORY.introBombeiro=function(b){
  const F=G.flags;
  playCut([{npc:b,id:'bomb'},{fx:'blackout',v:.8},{wait:.4},{cam:{x:b.x,y:b.y},t:1.3},{sfx:'drag',v:1},{wait:.5},{sfx:'drag',v:1},
    {walk:'bomb',to:{x:b.x+(P.x-b.x)*.15,y:b.y+(P.y-b.y)*.15},spd:34},{sfx:'thud',v:1},{fx:'shake',v:6},
    {say:'rafa',m:'s',t:'Um bombeiro... o rosto dele derreteu no capacete. Ele tá arrastando um machado.'},
    ...(F.eduFollow?[{say:'edu',m:'s',t:'Ele tava no posto quando explodiu, Richard. Ele veio atrás da gente. Ele VEIO ATRÁS DA GENTE.'}]:[]),
    {say:'rafa',m:'a',think:true,t:'Não dá pra matar isso. Só correr. E não parar.',dur:1.8},
    {cam:{x:P.x,y:P.y},t:.4}],()=>{G.banner={t:'O Bombeiro',life:3};});
};

// ---------- missão: o ônibus 22 da rodoviária ----------
STORY.onibus=function(o){
  const F=G.flags; if(F.onibus)return toast('O ônibus está vazio. Só sangue no corredor.');
  if(invCount('chaveOnibus')<=0){AU.knock();G.shake+=2;return toast('Tem gente batendo no vidro lá dentro, gritando sem som. A porta precisa da chave do motorista. O guichê fica na rodoviária.');}
  invRemove('chaveOnibus',1); F.onibus=true;
  const bx=o.x,by=o.y;
  playCut([{sfx:'click'},{wait:.3},{sfx:'creak',v:1},{fx:'shake',v:4},
    {say:'rafa',m:'s',t:'Abriu! Sai, sai, sai!'},
    {do:()=>{for(let i=0;i<3;i++){const p=spawnSurvivor({x:bx+rr(-30,30),y:by+40+i*14},0,{st:'calm',item:pick2(['m9','spray','cart','ervaR'])});p.saved=false;p.say={t:pick2(['Obrigado! Obrigado!','Três dias... três dias lá dentro!','Deus te pague, moço!']),life:2.4};}}},
    {wait:1.2},
    {say:'rafa',m:'s',t:'Tem mais um lá no fundo... ele não se mexe.'},
    {wait:.6},{sfx:'roar',v:.6},{fx:'shake',v:8},
    {do:()=>{const e=makeEnemy('corr',bx,by+20,null);e.state='chase';e.lx=P.x;e.ly=P.y;e.rising=.4;enemies.push(e);bloodBurst(bx,by+20,18,Math.PI/2);AU.scream(1);
      for(const p of peds)if(p.alive&&hyp(p.x-bx,p.y-by)<200&&Math.random()<.4){p.st='flee';}}},
    {say:'rafa',m:'s',t:'ELE VIROU LÁ DENTRO! Corre todo mundo!'}],
    ()=>{ach('onibus');stat('saved',3,3,'heroi');});
};
// ---------- missão: as câmeras do condomínio na Brava ----------
STORY.cctv=function(o){
  const F=G.flags;
  if(F.cctv)return toast('Câmera 3 mostra a guarita. Você, de costas. Mais ninguém. Por enquanto.');
  F.cctv=true; ach('cctv');
  const door=LM.cctv||{x:P.x,y:P.y-80};
  playCut([{sfx:'click'},{fx:'flash',v:.2},
    {say:'rafa',m:'n',think:true,t:'Câmera 1... a piscina. Câmera 2... a rua de cima. Câmera 3... a guarita. Eu.',dur:2.4},
    {wait:.8},{sfx:'sting',v:1},
    {say:'rafa',m:'s',think:true,t:'Tem alguém parado atrás de mim na câmera 3.',dur:1.8},
    {do:()=>{
      const sp=spawnPoint(150,240,false,false)||{x:door.x,y:door.y};
      if(F.persOn&&!enemies.some(e=>e.type==='pers'&&e.alive)){const p=makeEnemy('pers',sp.x,sp.y,null);p.state='chase';p.hunt=true;enemies.push(p);if(!F.persSeen){F.persSeen=true;F.persMet=true;}}
      else{for(let i=0;i<3;i++){const e=makeEnemy('zumbi',sp.x+rr(-30,30),sp.y+rr(-30,30),null);e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);}}
      AU.roar();G.blackout=.8;G.shake+=8;
      const l=invAdd('chaveCasa',1);if(l)boxAdd('chaveCasa',l);
      for(let y=82;y<=139;y++)for(let x=14;x<=60;x++)explored[idx(x,y)]=1;}},
    {say:'rafa',m:'s',t:'Peguei as chaves do condomínio. AGORA SAI DAQUI.'}]);
};
// ---------- missão: o sino da Matriz tira a horda do porto ----------
STORY.sino=function(o){
  const F=G.flags; if(F.sino)return toast('A corda arrebentou. O sino já fez o trabalho dele.');
  F.sino=true; ach('sino'); const cx=LM.matriz?LM.matriz.x:P.x, cy=LM.matriz?LM.matriz.y:P.y;
  let gone=0;for(const e of enemies){if(!e.alive||e.t.boss||e.type==='boss'||e.stalker||e.type==='ouvinte')continue;const tx=(e.x/TILE)|0,ty=(e.y/TILE)|0;if(dAt(tx,ty)===0&&bmap[idx(tx,ty)]<0&&Math.random()<.75){e.alive=false;gone++;}}
  F.portoLimpo=true;
  playCut([{sfx:'bell',v:1},{fx:'shake',v:4},{wait:1.2},{sfx:'bell',v:1},{wait:1.2},{sfx:'bell',v:1},
    {say:'rafa',m:'s',t:'O porto inteiro vai ouvir isso.'},
    {do:()=>{alertNoise(cx,cy,2400);for(let i=0;i<8;i++){const a=Math.random()*6.28,d=rr(500,800);const x=cx+Math.cos(a)*d,y=cy+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]])continue;const e=makeEnemy(Math.random()<.3?'corr':'zumbi',x,y,null);e.state='investigate';e.nx=cx;e.ny=cy;e.it=40;enemies.push(e);}}},
    {wait:.8},{sfx:'roar',v:.6},
    {say:F.matFollow?'matheus':'rafa',m:'s',t:F.matFollow?'Tão vindo todos pra cá, mano! Do porto inteiro! Agora o caminho tá livre... se a gente sair vivo daqui.':'Estão vindo todos pra cá. Do porto inteiro. Agora é sair daqui vivo.'}],
    ()=>{G.ev.bellT=0;});
  G.ev.bells=6;
};
// ---------- susto: rosto na janela ----------
function windowFace(){
  const ws=[];for(const b of buildings){if(!b.wins||b.id===G.inB)continue;for(const w of b.wins){const x=tc(w.x),y=tc(w.y),d=hyp(x-P.x,y-P.y);if(d>110&&d<300&&!w.broken&&fovSees(x,y,10))ws.push(w);}}
  if(!ws.length)return false; G.winFace={w:pick2(ws),t:.7}; AU.sting(); G.shake+=2; buzz(30);
  later(500,()=>bark('rafa','s',pick2(['Tinha alguém na janela. Olhando pra mim.','Um rosto... na janela. Sumiu.','Ela tava sorrindo. Por que ela tava sorrindo?'])));
  return true;
}

// =============== v15: o bondinho para as Laranjeiras ===============
const CABLE=[[168,371],[102,409],[134,431]]; // Barra Sul → Mata Atlântica → Laranjeiras
function gondPos(){const g=G.ev&&G.ev.gond;if(!g)return null;const k=clamp((G.time-g.t0)/g.dur,0,g.stopAt||1),pts=g.pts;let tot=0;const L=[];for(let i=0;i<pts.length-1;i++){const l=hyp(pts[i+1][0]-pts[i][0],pts[i+1][1]-pts[i][1]);L.push(l);tot+=l;}
  let d=k*tot;for(let i=0;i<L.length;i++){if(d<=L[i]||i===L.length-1){const t=L[i]?Math.min(1,d/L[i]):0;return {x:lerp(pts[i][0],pts[i+1][0],t),y:lerp(pts[i][1],pts[i+1][1],t)};}d-=L[i];}return null;}
function drawCable(){
  const F=G.flags; const P0=CABLE.map(([x,y])=>[tc(x),tc(y)]);
  if(!inV((P0[0][0]+P0[1][0])/2,(P0[0][1]+P0[1][1])/2,1600)&&!inV(P0[2][0],P0[2][1],600))return;
  ctx.strokeStyle='rgba(20,20,22,.85)';ctx.lineWidth=2.4;
  if(F.laranjGone){ctx.beginPath();ctx.moveTo(P0[0][0],P0[0][1]);ctx.quadraticCurveTo(P0[0][0]-60,P0[0][1]+160,P0[0][0]-110,P0[0][1]+210);ctx.stroke();}
  else{ctx.beginPath();ctx.moveTo(P0[0][0],P0[0][1]);ctx.lineTo(P0[1][0],P0[1][1]);ctx.lineTo(P0[2][0],P0[2][1]);ctx.stroke();
    ctx.strokeStyle='rgba(60,60,64,.5)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(P0[0][0]+6,P0[0][1]+6);ctx.lineTo(P0[1][0]+6,P0[1][1]+6);ctx.lineTo(P0[2][0]+6,P0[2][1]+6);ctx.stroke();}
  for(let i=1;i<=3;i++){const t=i/4,x=lerp(P0[0][0],P0[1][0],t),y=lerp(P0[0][1],P0[1][1],t);ctx.fillStyle='#2a2c2e';ctx.fillRect(x-5,y-5,10,10);}
  // cabines paradas na linha desde a meia-noite, com gente dentro
  if(!F.laranjGone)for(const t of [.36,.68]){const x=lerp(P0[0][0],P0[1][0],t),y=lerp(P0[0][1],P0[1][1],t);drawGondola(x,y,true);}
  const g=gondPos(); if(g)drawGondola(g.x,g.y,false);
}
function drawGondola(x,y,stuck){
  ctx.save();ctx.translate(x,y+18);ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(-12,4,26,20);
  ctx.fillStyle=stuck?'#8a3a2a':'#c8402a';ctx.fillRect(-13,-12,26,22);ctx.fillStyle='#10161c';ctx.fillRect(-10,-9,20,9);
  if(stuck&&Math.sin(renderT*2+x)>.6){ctx.fillStyle='rgba(200,180,160,.6)';ctx.beginPath();ctx.arc(-4,-5,2.4,0,6.283);ctx.fill();ctx.fillStyle='rgba(140,30,20,.7)';ctx.fillRect(2,-8,6,3);}
  ctx.strokeStyle='#1a1a1c';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-12);ctx.lineTo(0,-18);ctx.stroke();ctx.restore();
}
function rideStart(pts,dur,stopAt){G.ev.gond={pts:pts.map(([x,y])=>[tc(x),tc(y)]),t0:G.time,dur,stopAt};P.ride=true;}
function placeParty(pt){
  const [x,y]=freeTileNear((pt.x/TILE)|0,(pt.y/TILE)|0,false);P.x=tc(x);P.y=tc(y);P.ride=false;snapCamera();flowTile=-1;
  for(const c of (G.comps||[])){const [cx,cy]=freeTileNear(x-1,y+1,false);c.x=tc(cx);c.y=tc(cy);c.inCar=false;}
}
STORY.bondinho=function(){
  const F=G.flags;
  if(F.laranjGone)return toast('A linha está morta. O cabo arrebentou lá em cima e uma cabine balança no vento, vazia.');
  if(!F.needDina)return toast('O bondinho do Parque Unipraias. As luzes do painel ainda acendem. Ninguém sobe numa noite dessas.');
  if(F.bondRide)return toast('A linha parou na estação Mata Atlântica. Sem energia lá embaixo, não sobe nem desce.');
  const mid=[(CABLE[0][0]+CABLE[1][0])/2,(CABLE[0][1]+CABLE[1][1])/2];
  playCut([{sfx:'click'},{sfx:'creak',v:.8},{do:()=>rideStart([CABLE[0],CABLE[1]],9,.92)},
    {cam:{x:tc(CABLE[0][0]),y:tc(CABLE[0][1])},t:1.4},
    {say:G.flags.eduFollow?'edu':'rafa',m:'s',t:G.flags.eduFollow?'Mano, eu nunca gostei dessa porra de bondinho. Nunca.':'Eu nunca gostei desse bondinho.'},
    {cam:{x:tc(mid[0]),y:tc(mid[1])},t:2.2},
    {say:'rafa',m:'s',t:'Aquela cabine parada ali... tem gente dentro. Batendo no vidro.'},
    {say:'rafa',m:'s',think:true,t:'Não é gente. Não mais.',dur:1.4},
    {cam:{x:tc(CABLE[1][0]),y:tc(CABLE[1][1])},t:2.6},
    {sfx:'thud',v:1},{fx:'blackout',v:2},{fx:'shake',v:8},{sfx:'creak',v:1},
    {say:'rafa',m:'s',t:'A energia caiu! ...Paramos na estação do meio. Na Mata Atlântica.'},
    {do:()=>{G.ev.gond=null;F.bondRide=1;placeParty(LM.bondMA);}},
    {say:G.flags.eduFollow?'edu':'rafa',m:'t',t:G.flags.eduFollow?'Daqui até a praia é trilha. No meio do mato. No escuro. Que maravilha.':'Daqui até a praia, só pela trilha. No escuro.'}],
    ()=>{G.banner={t:'Praia das Laranjeiras',life:3.2};});
};
STORY.bondMA=function(){const F=G.flags;toast(F.geradorL?'O painel acendeu. A linha voltou: a cabine sobe da estação Laranjeiras, lá embaixo.':'Painel da estação: SEM ENERGIA. Um adesivo diz: "Gerador auxiliar: Rancho das Laranjeiras".');};
// Seu Ivo e a Rosa
STORY.ivo=function(n){
  const F=G.flags; if(F.ivoMet)return; F.ivoMet=true;
  const rosaGate=gates.find(g=>g.id==='rosa');
  playCut([{npc:n,id:'ivo'},{startle:'ivo'},{face:'ivo',at:'rafa'},
    {say:'ivo',m:'s',t:'Quem tá aí?! ...Garoto, abaixa isso. Abaixa.'},
    {say:'rafa',m:'n',t:'Seu Ivo? Foi o Tião que mandou a gente. Ele disse que o senhor tem dinamite.'},
    {say:'ivo',m:'t',t:'O Tião... aquele velho teimoso ainda tá vivo? Tenho. Pesca proibida, mas tenho.'},
    {say:'ivo',m:'n',t:'Os meninos saíram com os dois barcos às dez. Prometeram voltar pra buscar a gente quando clarear.'},
    ...(F.eduFollow?[{say:'edu',m:'s',t:'E se eles não voltarem, seu Ivo?'}]:[]),
    {say:'ivo',m:'t',t:'Voltam. Têm que voltar. A Rosa não aguenta andar até lugar nenhum.'},
    {do:()=>{const l=invAdd('dinamite',1);if(l)boxAdd('dinamite',l);AU.pickup();toast(l?'Mochila cheia: a dinamite do Seu Ivo foi pro baú dos abrigos. Pegue lá antes da barricada.':'Você recebeu a dinamite de pesca do Seu Ivo.');}},
    {say:'ivo',m:'n',t:'Toma. Três bananas e pavio curto. Acende e corre, que ela não espera ninguém.'},
    {say:'rafa',m:'n',t:'Vem com a gente, seu Ivo. Por favor.'},
    {say:'ivo',m:'h',t:'Eu não saio daqui sem a minha velha. Deixa eu ver se ela acordou...'},
    {walk:'ivo',to:{x:tc(135),y:tc(410.5)},spd:40},
    {do:()=>{if(rosaGate&&!rosaGate.open)openGate(rosaGate);AU.creak(.6);}},{wait:.7},
    {cam:'ivo',t:.6},{fx:'zoom',v:1.4},
    {say:'ivo',m:'h',t:'Rosa? Rosinha, acorda, a gente tem visita...'},
    {wait:.9},{sfx:'creak',v:.5},{wait:.6},
    {say:'ivo',m:'s',t:'Rosa...? Que cheiro é esse, mulher...',dur:1.6},
    {wait:.5},{sfx:'roar',v:.8},{fx:'shake',v:10},{fx:'slow',v:.7},
    {do:()=>{const r=enemies.find(e=>e.uid==='rosa'&&e.alive);const iv=npcs.find(x=>x.id==='ivo');
      if(iv){bloodBurst(iv.x,iv.y,40,Math.PI);for(let i=0;i<3;i++)addDecal({k:'gib',x:iv.x+rr(-16,16),y:iv.y+rr(-16,16),r:4,rot:Math.random()*6,c:'#8a2a20'});addDecal({k:'blood',x:iv.x,y:iv.y,r:30,rot:0,seed:.4});GORE.push({k:'corpse',x:iv.x,y:iv.y,rot:1.2,type:'zumbi',col:'#5a6a3a',skin:'#b0805e',r:11});
        if(r){r.x=iv.x+18;r.y=iv.y;r.state='chase';r.lx=P.x;r.ly=P.y;r.hunt=true;r.huntT=30;r.face=Math.PI;}}
      F.ivoMorto=true;AU.scream(1);G.shake+=12;buzz([100,40,160]);}},
    {wait:.8},{fx:'zoom',v:1.15},{say:'rafa',m:'s',t:'SEU IVO!'},{camFree:1},
    {say:G.flags.eduFollow?'edu':'rafa',m:'s',t:G.flags.eduFollow?'Ela arrancou a garganta dele com o dente! A própria mulher! SAI, SAI!':'Ela arrancou a garganta dele. A própria mulher dele.'},
    {say:'rafa',m:'a',think:true,t:'O bondinho. O gerador do restaurante religa a linha. Agora.',dur:1.8}]);
};
STORY.geradorL=function(){
  const F=G.flags; if(F.geradorL)return toast('O gerador está ligado. E fazendo barulho demais.');
  if(!F.ivoMet&&invCount('dinamite')<=0)return toast('Um gerador a diesel. Ainda tem combustível. Melhor achar o Seu Ivo antes.');
  F.geradorL=true; G.ev.genL={x:LM.geradorL.x,y:LM.geradorL.y,t:0};
  AU.creak(1);AU.thud(1);G.shake+=6;
  later(500,()=>bark(F.eduFollow?'edu':'rafa','s',F.eduFollow?'PEGOU! ...e tá fazendo um barulho do caralho. Todo mundo da praia vai vir. PRO BONDINHO!':'Pegou... e a praia inteira vai ouvir isso. Pro bondinho, já.'));
  spawnRing(3,'corr',380,560,true);
};
STORY.bondinho2=function(){
  const F=G.flags;
  if(F.laranjGone)return toast('A linha está morta.');
  if(!F.geradorL)return toast('Painel: SEM ENERGIA. "Gerador auxiliar: cozinha do Rancho das Laranjeiras."');
  const mid=[(CABLE[1][0]+CABLE[0][0])/2,(CABLE[1][1]+CABLE[0][1])/2];
  playCut([{sfx:'click'},{sfx:'creak',v:1},
    {do:()=>{rideStart([CABLE[2],CABLE[1],CABLE[0]],14,1);P.x=LM.bondBS.x;P.y=LM.bondBS.y;for(const c of (G.comps||[])){c.x=P.x;c.y=P.y;}}},
    {cam:{x:tc(CABLE[2][0]),y:tc(CABLE[2][1])},t:1.6},
    {say:'rafa',m:'s',t:'Sobe... sobe, sobe, sobe...'},
    {cam:{x:LM.geradorL.x,y:LM.geradorL.y},t:1.4},
    {say:G.flags.eduFollow?'edu':'rafa',m:'s',t:G.flags.eduFollow?'Olha o restaurante! Tem dezenas deles em volta do gerador! O botijão, Richard, os botijões!':'Eles cercaram o gerador... e os botijões de gás do lado.'},
    {do:()=>laranjBoom()},{sfx:'bigBoom',v:1},{fx:'shake',v:22},{fx:'flash',v:1},{wait:1.4},
    {do:()=>{const c=LM.colonia;explodeFx(c.x,c.y+40,1.2);}},{sfx:'boom',v:1},{wait:.9},
    {cam:{x:tc(CABLE[1][0]),y:tc(CABLE[1][1])},t:2.4},
    {sfx:'creak',v:1},{fx:'shake',v:10},
    {say:'rafa',m:'s',t:'A torre... o fogo pegou na torre! O cabo vai arrebentar!'},
    {cam:{x:tc(mid[0]),y:tc(mid[1])},t:2.2},{sfx:'thud',v:1},{fx:'shake',v:14},
    {do:()=>{F.laranjGone=true;}},
    {say:G.flags.eduFollow?'edu':'rafa',m:'s',t:G.flags.eduFollow?'ARREBENTOU ATRÁS DA GENTE! Segura, segura!':'Arrebentou atrás de nós...'},
    {cam:{x:tc(CABLE[0][0]),y:tc(CABLE[0][1])},t:2.6},
    {do:()=>{G.ev.gond=null;placeParty(LM.bondBS);}},
    {say:'rafa',m:'t',t:'Barra Sul. A gente voltou. As Laranjeiras... não existem mais.'}],
    ()=>{G.ev.genL=null;STORY.tiaoDeath();});
};
function explodeFx(x,y,s=1){
  for(let i=0;i<60*s;i++){const a=Math.random()*6.28,sp=rr(80,480);parts.push({k:'fire',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rr(.4,1),max:1,s:rr(8,18),c:Math.random()<.5?'#ffb347':'#ff6a2a'});}
  for(let i=0;i<30*s;i++){const a=Math.random()*6.28,sp=rr(30,160);parts.push({k:'smoke',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rr(1.5,3),max:3,s:rr(16,30),c:'#2a2724'});}
  GORE.push({k:'scorch',x,y,r:130*s,rot:0,seed:.4}); addFire(x+rr(-40,40),y+rr(-40,40),50,false); addFire(x+rr(-60,60),y+rr(-60,60),40,false);
  G.light=1; G.boom={x,y,t:.6}; G.shake+=16;
}
function laranjBoom(){
  const g=LM.geradorL; explodeFx(g.x,g.y,1.6);
  for(const e of enemies){if(!e.alive)continue;const tx=(e.x/TILE)|0,ty=(e.y/TILE)|0;if(dAt(tx,ty)===8&&hyp(e.x-g.x,e.y-g.y)<520){e.burn=8;if(Math.random()<.6)e.alive=false;}}
  for(let y=414;y<=434;y++)for(let x=142;x<=162;x++){const t=getT(x,y);if((t===T.WALL||t===T.PROP)&&Math.random()<.5)setT(x,y,T.RUBBLE);}
  if(typeof invalidateRect==='function')invalidateRect(140,412,24,24);
}
// a morte do Tião
STORY.tiaoDeath=function(){
  const F=G.flags; if(F.tiaoMorto)return;
  const t=npcs.find(n=>n.id==='tiao'); const st=LM.bondBS;
  if(t){t.x=tc(152);t.y=tc(368);}
  const horde=[];for(let i=0;i<10;i++){const a=Math.random()*6.28,d=rr(220,360);const x=st.x+Math.cos(a)*d,y=st.y+Math.sin(a)*d+60,tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]])continue;const e=makeEnemy(i%3?'zumbi':'corr',x,y,null);e.state='investigate';e.nx=st.x;e.ny=st.y+40;e.it=30;enemies.push(e);horde.push(e);}
  playCut([...(t?[{npc:t,id:'tiao'}]:[]),{sfx:'shot',v:'escopeta'},{fx:'shake',v:4},
    {cam:{x:(st.x+tc(152))/2,y:st.y},t:1},
    {say:'tiao',m:'a',t:'RICHARD! Eles arrombaram o depósito! Vai pro jipe, eu seguro aqui!'},
    {say:'rafa',m:'s',t:'Seu Tião, vem com a gente! VEM!'},
    {say:'tiao',m:'t',t:'Eu tô mordido, garoto. Desde a hora que vocês subiram. Olha o meu braço.'},
    {say:'tiao',m:'h',t:'Diz pra Cida que a luz verde ficou acesa. Ela vai entender.'},
    ...(t?[{walk:'tiao',to:{x:tc(156),y:tc(377)},spd:70}]:[]),
    ...(t?[{cam:'tiao',t:.8},{fx:'zoom',v:1.3}]:[]),
    {sfx:'shot',v:'escopeta'},{wait:.4},{sfx:'shot',v:'escopeta'},{wait:.5},{sfx:'shot',v:'escopeta'},
    {do:()=>{for(const e of horde)if(e.alive){e.state='investigate';e.nx=tc(156);e.ny=tc(377);}}},
    {wait:1.2},{sfx:'scream',v:1},{fx:'shake',v:8},{fx:'slow',v:.6},
    {do:()=>{F.tiaoMorto=true;const x=tc(156),y=tc(377);bloodBurst(x,y,40,0);addDecal({k:'blood',x,y,r:34,rot:0,seed:.2});GORE.push({k:'corpse',x,y,rot:.4,type:'zumbi',col:'#2f3d55',skin:'#6e4a32',r:12});
      const [px,py]=freeTileNear(156,376,true);if(!P.owned[2])pickups.push({uid:'tiaoG',tx:px,ty:py,x:tc(px),y:tc(py),id:2,q:6,kind:'weapon'});else pickups.push({uid:'tiaoG',tx:px,ty:py,x:tc(px),y:tc(py),id:'cart',q:10,kind:'item'});
      for(const e of horde)if(e.alive){e.state='chase';e.lx=P.x;e.ly=P.y;}}},
    {wait:1},{camFree:1},{fx:'zoom',v:1.14},
    {say:G.flags.eduFollow?'edu':'rafa',m:'k',t:G.flags.eduFollow?'...Ele parou de atirar. Richard. Ele parou de atirar.':'Os tiros pararam.'},
    {say:'rafa',m:'a',think:true,t:'A escopeta dele ficou no chão. A dinamite na mochila. A barricada. Agora.',dur:2}],
    ()=>{ach('tiao');});
};
// dinamite na barricada
STORY.plantDina=function(g){
  const F=G.flags; if(G.ev.fuse)return;
  invRemove('dinamite',1); F.dinaPlanted=true;
  G.ev.fuse={t:6,x:(g.x+g.w/2)*TILE,y:(g.y+g.h)*TILE+8,beep:0};
  AU.click();toast('Pavio aceso! CORRE!');bark('rafa','s','Acendeu! Acendeu! CORRE!');
};
function fuseTick(dt){
  const f=G.ev.fuse; if(!f)return; f.t-=dt; f.beep-=dt;
  if(f.beep<=0){f.beep=.25;parts.push({k:'spark',x:f.x+rr(-3,3),y:f.y,vx:rr(-60,60),vy:rr(-90,-20),life:.3,max:.3,s:2,c:'#ffd27a'});AU.nz(.2,4000,2,.03,'highpass');}
  if(f.t<=0){G.ev.fuse=null;const F=G.flags,g=gates.find(x=>x.id==='bloqueio');
    explodeBig(f.x,f.y-30,{r:360,heavy:170,dmg:70});
    if(g&&!g.open)openGate(g);F.bloqWeak=true;F.bloqueio_g=true;
    for(const [dx,dy] of [[-2,1],[3,1],[0,3]])addFire(f.x+dx*TILE,f.y+dy*TILE,44,true);
    placeWreck(f.x-TILE*3,f.y+TILE*2,0,'#3d4a2f','army',true);
    later(900,()=>bark(F.eduFollow?'edu':'rafa','a',F.eduFollow?'ABRIU! O caminhão-tanque virou uma bola de fogo! Pro jipe!':'Abriu. Agora o jipe passa.'));}
}

// =============== Dona Cida virou ===============
function cidaB(){return bOf(108,253);}
function cidaFall(live){
  const F=G.flags; F.cidaTurned=true; const b=buildings[cidaB()]; if(!b)return;
  b.safe=false; for(let j=b.y;j<b.y+b.h;j++)for(let i=b.x;i<b.x+b.w;i++)safeMask[idx(i,j)]=0;
  for(let q=interacts.length-1;q>=0;q--){const o=interacts[q];if(o.type==='typewriter'&&o.tx>=b.x&&o.tx<b.x+b.w&&o.ty>=b.y&&o.ty<b.y+b.h)interacts.splice(q,1);}
  for(const l of lights)if(l.c==='safe'&&l.x>tc(b.x)-16&&l.x<tc(b.x+b.w)&&l.y>tc(b.y)-16&&l.y<tc(b.y+b.h))l.off=true;
  GORE.push({k:'blood',x:tc(106),y:tc(251),r:26,rot:0,seed:.6},{k:'drag',x:tc(105),y:tc(250),rot:-1.6,seed:.3});
  if(!G.killed.has('cidaZ')&&!enemies.some(e=>e.uid==='cidaZ')){const e=makeEnemy('zumbi',tc(111),tc(254),'cidaZ');e.col='#6a4a6a';e.state='wander';e.idle=true;e.wt=99;enemies.push(e);}
  flowTile=-1;
}
function cidaTick(){
  const F=G.flags; if(!F.cidaTurned||F.cidaSeen||CUT.on)return; if(G.inB!==cidaB())return;
  const z=enemies.find(e=>e.uid==='cidaZ'&&e.alive); F.cidaSeen=true; if(!z)return;
  playCut([{npc:z,id:'cz'},{fx:'blackout',v:.6},{say:'rafa',m:'s',t:'A luz verde apagou... Dona Cida? A porta tava aberta...'},{wait:.6},{sfx:'roar',v:.4},
    {cam:{x:z.x,y:z.y},t:1},{say:'rafa',m:'s',t:'...Não. Não, não, não. Dona Cida...'},
    ...(F.catDone?[{say:'rafa',m:'t',think:true,t:'O Mingau tá embaixo da cama. Ele não sai de lá.',dur:1.6}]:[]),
    ...(F.eduFollow?[{say:'edu',m:'s',t:'Richard... ela não é mais ela. Faz o que tem que fazer.'}]:[]),
    {do:()=>{z.state='chase';z.lx=P.x;z.ly=P.y;z.rising=.3;AU.roar();}}]);
}

// =============== Santa Clara: só ela ===============
function hospPurge(){const hb=hosp2B();if(hb<0)return;for(const e of enemies){if(!e.alive||e.type==='ouvinte'||e.cut)continue;if(bmap[idx((e.x/TILE)|0,(e.y/TILE)|0)]===hb)e.alive=false;}}
