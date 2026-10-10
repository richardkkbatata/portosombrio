// ===================== CUTSCENES EM TEMPO REAL =====================
// As conversas acontecem no próprio mapa: balões em cima dos personagens, câmera que anda,
// sustos, gente andando. Passos: say, walk, face, startle, emote, cam, wait, fx, sfx, spawn, choice, do.
const CUT={on:false,q:[],i:0,st:null,t:0,bub:null,choice:null,cam:null,onEnd:null,pending:[],actors:{},lb:0};
const PCAN={};
function portraitCanvas(who,mood,radio){
  const k=who+'|'+mood+'|'+(radio?1:0); if(k in PCAN)return PCAN[k];
  let c=null; try{if(PCH[who]){c=document.createElement('canvas');c.width=140;c.height=160;const g=c.getContext('2d');g.scale(.5,.5);drawPortrait(g,who,mood,radio);}}catch(e){c=null;}
  PCAN[k]=c; return c;
}
function bOfXY(x,y){const tx=(x/TILE)|0,ty=(y/TILE)|0;return inb(tx,ty)?bmap[idx(tx,ty)]:-1;}
function setAng(a,v){a.ang=v;if(a===P)P.legAng=v;if(a.t)a.face=v;}
function actorOf(w){if(!w||w==='rafa')return P;if(CUT.actors[w])return CUT.actors[w];return npcs.find(n=>n.id===w)||(G.comps||[]).find(c=>c.id===w)||(w==='edu'?npcs.find(n=>(n.id==='eduC'||n.id==='eduV')&&(!n.cond||n.cond())):w==='matheus'?npcs.find(n=>n.id==='matH'&&(!n.cond||n.cond())):null)||null;}
function linesToSteps(lines){
  const out=[];
  for(const L of lines){
    if(L.choice)out.push({choice:L.choice.map(o=>({t:o.t,do:o.do,then:linesToSteps(o.then||[])}))});
    else if(L.do&&!L.w)out.push({do:L.do});
    else if(L.w)out.push({say:L.w,m:L.m,t:L.t,radio:!!L.radio,think:!!L.think});
    else out.push(L);
  }
  return out;
}
function playCut(steps,onEnd){
  if(CUT.on){CUT.pending.push([steps,onEnd]);return;}
  Object.assign(CUT,{on:true,q:steps.slice(),i:-1,st:null,t:0,bub:null,choice:null,cam:null,zm:null,onEnd:onEnd||null});
  mouseDown=false;for(const k in KEYS)KEYS[k]=false;resetTouch();
  if(P.hidden)exitHide();
  const sk=document.getElementById('cutskip');if(sk)sk.hidden=false;
  const tc=document.getElementById('tc');if(tc)tc.hidden=true;
  BARK.cur=null;
  cutNext();
}
UI.talk=function(lines,onEnd){playCut(linesToSteps(lines),onEnd);};
function cutNext(){
  CUT.i++; CUT.t=0; CUT.bub=null;
  if(CUT.i>=CUT.q.length){cutEnd();return;}
  const s=CUT.st=CUT.q[CUT.i];
  if(s.do){try{s.do();}catch(e){console.error(e);}return cutNext();}
  if(s.say){
    const sp=actorOf(s.radio||s.think?'rafa':s.say)||P;
    CUT.bub={who:s.say,a:sp,m:s.m||'n',t:s.t,shown:0,radio:s.radio,think:s.think,typed:false,hold:0};
    // quem fala olha para quem escuta
    const other=s.say==='rafa'?(Object.values(CUT.actors).find(a=>a&&a.x!=null&&!a.t)||npcs.find(n=>(!n.cond||n.cond())&&hyp(n.x-P.x,n.y-P.y)<260)):P;
    if(other&&other!==sp&&!s.radio&&!s.think&&!CUT.noFace){const a1=Math.atan2(other.y-sp.y,other.x-sp.x);setAng(sp,a1);setAng(other,a1+Math.PI);}
    return;
  }
  if(s.startle){const a=actorOf(s.startle);if(a){a.startle=.55;a.emote={k:'!',t:1.1};}AU.sting();G.shake+=3;buzz(25);return;}
  if(s.emote){const a=actorOf(s.emote);if(a)a.emote={k:s.k||'?',t:s.dur||1.2};return cutNext();}
  if(s.walk){const a=actorOf(s.walk);if(a){const to=typeof s.to==='string'?actorOf(s.to):s.to;a.walkTo={x:to.x+(s.ox||0),y:to.y+(s.oy||0),spd:s.spd||70};}if(s.wait===false)return cutNext();return;}
  if(s.face){const a=actorOf(s.face),b=typeof s.at==='string'?actorOf(s.at):s.at;if(a&&b){a.ang=Math.atan2(b.y-a.y,b.x-a.x);if(a===P)P.legAng=P.ang;}else if(a&&s.ang!=null)a.ang=s.ang;return cutNext();}
  if(s.camFree){CUT.cam=null;return cutNext();}
  if(s.cam){const c=typeof s.cam==='string'?actorOf(s.cam):s.cam;CUT.cam=c?{x:c.x,y:c.y}:null;if(s.t===0)return cutNext();return;}
  if(s.fx){cutFx(s);return cutNext();}
  if(s.sfx){try{AU[s.sfx](s.v??1);}catch(e){}return cutNext();}
  if(s.spawn){const e=makeEnemy(s.spawn,s.x,s.y,s.uid||null);e.cut=true;if(s.ang!=null)e.face=s.ang;enemies.push(e);CUT.actors[s.id||s.spawn]=e;return cutNext();}
  if(s.npc){CUT.actors[s.id]=s.npc;
    // conversa com alguém dentro de outro prédio: o Richard entra antes (não fica do lado de fora sem ver nada)
    const n=s.npc,bn=bOfXY(n.x,n.y),bp=bOfXY(P.x,P.y);
    if(!P.inCar&&n.x!=null&&bn>=0&&bn!==bp&&hyp(n.x-P.x,n.y-P.y)<420){const a=Math.atan2(P.y-n.y,P.x-n.x);let tx=n.x+Math.cos(a)*36,ty=n.y+Math.sin(a)*36;
      if(bOfXY(tx,ty)!==bn){tx=n.x;ty=n.y+34;if(bOfXY(tx,ty)!==bn){tx=n.x+34;ty=n.y;}}
      CUT.q.splice(CUT.i+1,0,{walk:'rafa',to:{x:tx,y:ty},spd:120,tmax:2.5});}
    return cutNext();}
  if(s.choice){CUT.choice=s.choice;showCutChoice();return;}
  if(s.wait!=null)return;
  return cutNext();
}
function cutFx(s){
  switch(s.fx){
    case 'shake':G.shake+=s.v||8;buzz(60);break;
    case 'flash':G.light=Math.max(G.light,s.v||.6);break;
    case 'blackout':G.blackout=Math.max(G.blackout,s.v||1.5);break;
    case 'slam':G.shake+=10;AU.thud(1);AU.knock();buzz(80);break;
    case 'sparks':{const a=typeof s.at==='string'?actorOf(s.at):s.at;for(let i=0;i<24;i++)parts.push({k:'spark',x:a.x+rr(-8,8),y:a.y+rr(-8,8),vx:rr(-160,160),vy:rr(-160,160),life:.3,max:.3,s:2,c:'#ffd27a'});AU.click();break;}
    case 'splash':{const a=s.at;for(let i=0;i<40;i++){const an=Math.random()*6.28,sp=rr(40,240);parts.push({k:'acid',x:a.x+rr(-30,30),y:a.y+rr(-20,20),vx:Math.cos(an)*sp,vy:Math.sin(an)*sp,life:.7,max:.7,s:rr(2,4),c:'#9ab8c8'});}AU.splash(1);break;}
    case 'zoom':CUT.zm=s.v||1.15;break;
    case 'slow':G.hs=Math.max(G.hs||0,s.v||.6);break;
  }
}
function showCutChoice(){
  const el=document.getElementById('cutch'); if(!el)return;
  el.innerHTML=CUT.choice.map((o,k)=>`<button class="cutc" data-k="${k}"><span>${k+1}</span>${esc(o.t)}</button>`).join(''); el.hidden=false;
  if(el.querySelectorAll)el.querySelectorAll('button').forEach(b=>{b.addEventListener('click',ev=>{ev.stopPropagation();cutChoose(+b.dataset.k);});b.addEventListener('touchstart',ev=>{ev.stopPropagation();ev.preventDefault();cutChoose(+b.dataset.k);},{passive:false});});
}
function cutChoose(k){
  if(!CUT.on||!CUT.choice)return; const o=CUT.choice[k]; if(!o)return;
  AU.ui(); CUT.choice=null; const el=document.getElementById('cutch'); if(el){el.hidden=true;el.innerHTML='';}
  if(o.do)try{o.do();}catch(e){}
  CUT.q.splice(CUT.i+1,0,...(o.then||[])); cutNext();
}
function cutTap(){
  if(!CUT.on||CUT.choice)return;
  const s=CUT.st; if(!s)return;
  if(s.say){const b=CUT.bub;if(!b)return;if(b.shown<b.t.length){b.shown=b.t.length;b.typed=true;}else cutNext();return;}
  if(s.wait!=null||s.cam||s.startle)CUT.t=999;
}
function cutSkip(){
  if(!CUT.on)return;
  const land=()=>{for(const a of [P,...npcs,...(G.comps||[]),...Object.values(CUT.actors)])if(a&&a.walkTo){a.x=a.walkTo.x;a.y=a.walkTo.y;a.walkTo=null;a.moving=false;}};
  while(CUT.on){
    const s=CUT.st;
    if(s&&s.walk){const a=actorOf(s.walk);if(a&&a.walkTo){a.x=a.walkTo.x;a.y=a.walkTo.y;a.walkTo=null;}}
    if(CUT.choice){land();return;}
    land(); cutNext();
  }
}
function cutEnd(){
  CUT.on=false; CUT.st=null; CUT.bub=null; CUT.cam=null; CUT.zm=null;
  for(const k in CUT.actors){const a=CUT.actors[k];if(a&&a.t){a.cut=false;}if(a)a.walkTo=null;}
  for(const n of npcs)n.walkTo=null;
  CUT.actors={};
  const sk=document.getElementById('cutskip');if(sk)sk.hidden=true;
  const el=document.getElementById('cutch');if(el){el.hidden=true;el.innerHTML='';}
  const tc=document.getElementById('tc');if(tc)tc.hidden=!(IN.touch&&G.mode==='play');
  G.objT=0;
  const cb=CUT.onEnd;CUT.onEnd=null;if(cb)try{cb();}catch(e){console.error(e);}
  if(CUT.pending.length){const [s,c]=CUT.pending.shift();playCut(s,c);}
}
function walkActor(a,dt){
  if(!a.walkTo)return false;
  const dx=a.walkTo.x-a.x,dy=a.walkTo.y-a.y,d=hyp(dx,dy);
  if(d<4){a.walkTo=null;a.moving=false;return false;}
  const st=Math.min(d,a.walkTo.spd*dt), ux=dx/d, uy=dy/d;
  if(a===P){move(P,ux*st,uy*st,false);P.legAng=Math.atan2(uy,ux);P.ang=P.legAng;P.walk+=dt*10;P.moving=true;}
  else{a.x+=ux*st;a.y+=uy*st;a.ang=Math.atan2(uy,ux);if(a.t)a.face=a.ang;a.walk=(a.walk||0)+dt*10;a.moving=true;if(a.anim!=null)a.anim+=dt;}
  return true;
}
function updCut(dt){
  CUT.lb=Math.min(1,CUT.lb+dt*3);
  CUT.t+=dt;
  for(const a of [P,...npcs,...Object.values(CUT.actors)]){
    if(!a)continue; walkActor(a,dt);
    if(a.startle>0)a.startle-=dt; if(a.emote){a.emote.t-=dt;if(a.emote.t<=0)a.emote=null;}
  }
  const s=CUT.st; if(!s)return;
  if(s.say){const b=CUT.bub;if(!b)return;
    if(b.shown<b.t.length){const n=Math.min(b.t.length,b.shown+dt*42);if(Math.floor(n/3)>Math.floor(b.shown/3))AU.blip((PCH[b.who]||{voice:200}).voice,b.radio);b.shown=n;}
    else{b.hold+=dt;if(b.hold>(s.dur||2.2+b.t.length*.045))cutNext();}
    return;}
  if(s.walk){const a=actorOf(s.walk);if(!a||!a.walkTo||CUT.t>(s.tmax||6)){if(a&&a.walkTo){if(a===P&&s.tmax){P.x=a.walkTo.x;P.y=a.walkTo.y;}a.walkTo=null;a.moving=false;}cutNext();}return;}
  if(s.startle){if(CUT.t>.55)cutNext();return;}
  if(s.cam){if(CUT.t>(s.t||1))cutNext();return;}
  if(s.wait!=null){if(CUT.t>s.wait)cutNext();return;}
}
function cutFocus(){
  if(CUT.cam)return CUT.cam;
  const b=CUT.bub; if(b&&b.a&&b.a!==P&&!b.radio&&!b.think){const d=hyp(b.a.x-P.x,b.a.y-P.y);if(d<400)return {x:(b.a.x+P.x)/2,y:(b.a.y+P.y)/2};if(d<1600)return {x:b.a.x,y:b.a.y};}
  const any=Object.values(CUT.actors)[0]; if(any&&hyp(any.x-P.x,any.y-P.y)<360)return {x:(any.x+P.x)/2,y:(any.y+P.y)/2};
  return {x:P.x,y:P.y};
}
// ---------- desenho dos balões (cutscene e falas curtas durante o jogo) ----------
function drawBubble(a,who,m,text,shown,radio,think,alpha,small){
  if(!a)return; const cmp=small===2; if(cmp)small=false; const z=view.z, f=(IN.touch?HUDS[OPT.hud].f:1)*(cmp?.8:1);
  const sx=(a.x-cam.x)*z, sy=(a.y-cam.y)*z-(a.r||11)*z-14;
  const maxW=Math.min(small?200:cmp?280:300,view.w*(cmp?.46:.62))*f, name=think?'Richard (pensando)':radio?speakerName(who,true)+' · rádio':speakerName(who,false);
  ctx.font=`${Math.round((small?13:14.5)*f)}px ${FONT_TW}`;
  const lines=wrapText(text,maxW-(small?16:62*f)); const shownTxt=text.slice(0,Math.floor(shown));
  const lh=Math.round((small?16:18)*f), bw=Math.min(maxW,Math.max(...lines.map(l=>ctx.measureText(l).width))+(small?18:66*f)), bh=lines.length*lh+(small?12:30*f);
  // fala curta do Richard olhando pra cima: o balão vai pra baixo dele, pra não tampar o caminho
  const below=cmp&&a===P&&Math.sin(P.inCar?V.ang:P.ang)<-.35;
  let bx=clamp(sx-bw/2,8+SAFE.l,view.w-bw-8-SAFE.r), by=clamp(below?sy+(a.r||11)*z*2+36:sy-bh-10,8+SAFE.t+view.h*.1*CUT.lb,view.h-bh-8-view.h*.1*CUT.lb);
  ctx.globalAlpha=alpha;
  ctx.fillStyle=think?'rgba(18,20,24,.82)':'rgba(10,12,11,.9)';rrect(ctx,bx,by,bw,bh,8*f);ctx.fill();
  ctx.strokeStyle=radio?'rgba(90,208,160,.7)':think?'rgba(221,214,198,.25)':'rgba(212,154,60,.65)';ctx.lineWidth=1.5;ctx.setLineDash(think?[4,4]:[]);rrect(ctx,bx,by,bw,bh,8*f);ctx.stroke();ctx.setLineDash([]);
  if(!radio&&sy>by+bh){ctx.fillStyle=think?'rgba(18,20,24,.82)':'rgba(10,12,11,.9)';const tx=clamp(sx,bx+12,bx+bw-12);ctx.beginPath();ctx.moveTo(tx-7,by+bh);ctx.lineTo(tx+7,by+bh);ctx.lineTo(clamp(sx,tx-14,tx+14),Math.min(sy-2,by+bh+12));ctx.fill();}
  let tx0=bx+9;
  if(!small){const pc=portraitCanvas(who,m||'n',radio);if(pc){ctx.drawImage(pc,bx+7,by+7,44*f,50*f*.92);}tx0=bx+58*f;
    ctx.fillStyle=radio?'#5ad0a0':'#d49a3c';ctx.font=`700 ${Math.round(10.5*f)}px ${FONT_UI}`;ctx.textAlign='left';ctx.fillText(name.toUpperCase(),tx0,by+15*f);}
  ctx.font=`${Math.round((small?13:14.5)*f)}px ${FONT_TW}`;ctx.fillStyle=think?'#b8b2a2':'#e6dfcf';ctx.textAlign='left';
  let left=shownTxt.length,y=by+(small?lh:28*f+lh*.7);
  for(const l of lines){if(left<=0)break;ctx.fillText(l.slice(0,left),tx0,y);left-=l.length+1;y+=lh;}
  ctx.globalAlpha=1;
}
function drawCutOverlay(){
  if(!CUT.on&&CUT.lb<=0)return;
  if(!CUT.on)CUT.lb=Math.max(0,CUT.lb-lastDt*3);
  const h=view.h*.1*CUT.lb; ctx.fillStyle='#000';ctx.fillRect(0,0,view.w,h);ctx.fillRect(0,view.h-h,view.w,h);
  if(!CUT.on)return;
  const b=CUT.bub; if(b)drawBubble(b.a,b.who,b.m,b.t,b.shown,b.radio,b.think,1,false);
  if(b&&b.shown>=b.t.length&&!CUT.choice){ctx.fillStyle=`rgba(212,154,60,${.5+Math.sin(renderT*5)*.3})`;ctx.font=`600 11px ${FONT_UI}`;ctx.textAlign='center';ctx.fillText(IN.touch?'TOQUE PARA CONTINUAR':'ESPAÇO PARA CONTINUAR',view.w/2,view.h-h/2+4);}
}
function drawEmotes(){
  for(const a of [P,...npcs,...peds,...Object.values(CUT.actors)]){
    if(!a||!a.emote)continue; const t=a.emote.t, y=a.y-(a.r||11)-22-Math.min(1,(1.2-t)*6)*6;
    ctx.fillStyle='rgba(10,12,11,.85)';ctx.beginPath();ctx.arc(a.x,y,9,0,6.283);ctx.fill();
    ctx.fillStyle=a.emote.k==='!'?'#e04a3a':'#ddd6c6';ctx.font='700 14px "Barlow Condensed",sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(a.emote.k,a.x,y+1);ctx.textBaseline='alphabetic';
  }
}

// ===================== EVENTOS ALEATÓRIOS NA CIDADE =====================
let peds=[], cutNpcs=[]; const EV={t:40,car:null,heli:null,cars:[],conv:0,trap:null,seen:[]};
const PED_LOOK=[['#3a5a7a','#2a2420','#c49a7a'],['#7a3a3a','#d0c0a0','#e2bca2'],['#4a6a3a','#1a1410','#8a5a3a'],['#6a5a7a','#5a3a20','#c99a7a'],['#c8b070','#2a2a2a','#a8734f'],['#2f3d55','#8a5030','#e2bca2']];
const PED_HELP=['SOCORRO!','Alguém! Por favor!','Eles tão vindo!','Não deixa eles me pegarem!','AJUDA!'];
const PED_THANKS=['Valeu... toma, é tudo que eu tenho.','Eu achei que ia morrer. Pega isso.','Obrigado. Eu vou pro abrigo da praia. Toma.'];
const SCI_HELP=['Socorro! Eu sou da Vértice, eu sei como parar isso!','Me tira daqui! Eu tenho acesso ao laboratório!','Eles não deviam estar soltos! Socorro!'];
const SCI_THANKS=['Você não viu ninguém da Vértice aqui. Toma, e esquece minha cara.','A empresa vai negar tudo. Pega isso, era da nossa equipe.','O Arantes deixou a gente pra trás. Leva, eu não vou precisar.'];
function resetEvents(){peds=[];cutNpcs=[];EV.t=rr(70,110);EV.car=null;EV.heli=null;EV.cars=[];EV.conv=0;EV.trap=null;EV.seen=[];EV.fall=null;}
function drawCutNpc(n){drawHuman(n.x,n.y,n.ang||0,{coat:n.col,skin:n.skin||'#c49a7a',hair:n.hair||'#222',pants:n.pants||'#bdb9ac',walk:n.walk||0,moving:!!n.moving,legAng:n.ang||0,hazmat:n.hazmat,mask:n.mask,wid:n.gun||null,loaded:true});}
function evSpot(minD,maxD,cone,needLos=true){
  for(let i=0;i<40;i++){
    const a=cone!=null?P.ang+rr(-cone,cone):Math.random()*6.283, d=rr(minD,maxD), x=P.x+Math.cos(a)*d, y=P.y+Math.sin(a)*d, tx=(x/TILE)|0, ty=(y/TILE)|0;
    if(!inb(tx,ty))continue; const k=idx(tx,ty); if(SOLID[map[k]]||!reach[k]||safeMask[k]||bmap[k]>=0)continue;
    if(needLos&&!los(P.x,P.y,x,y))continue; return {x:tc(tx),y:tc(ty),a};
  }
  return null;
}
function spawnSurvivor(sp,nChase,o={}){
  const look=o.look||pick2(PED_LOOK), ped={x:sp.x,y:sp.y,r:11,hp:45,alive:true,st:o.st||'flee',col:look[0],hair:look[1],skin:look[2],ang:0,walk:0,moving:true,t:0,say:null,shoutT:.2,saved:false,item:o.item||pick2(['m9','ervaV','pilha','pilha','cart','polv','ervaR']),hazmat:!!o.hazmat,help:o.help||PED_HELP,thanks:o.thanks||PED_THANKS,va:0};
  peds.push(ped);
  const away=Math.atan2(sp.y-P.y,sp.x-P.x);
  for(let i=0;i<nChase;i++){const a=away+rr(-.6,.6),d=rr(110,190),x=sp.x+Math.cos(a)*d,y=sp.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;
    if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]])continue;const e=makeEnemy(i===0&&Math.random()<.6?'corr':'zumbi',tc(tx),tc(ty),null);e.prey=ped;e.state='investigate';e.nx=sp.x;e.ny=sp.y;e.it=30;enemies.push(e);}
  return ped;
}
function pick2(a){return a[Math.floor(Math.random()*a.length)];}
function updPeds(dt){
  for(const p of peds){
    p.t+=dt; if(p.say){p.say.life-=dt;if(p.say.life<=0)p.say=null;}
    if(!p.alive){p.dt=(p.dt||0)+dt;if(p.dt>(p.prone?(p.quiet?9:4):2.6)&&!p.turned){p.turned=true;if(p.prone&&p.quiet&&Math.random()<.5){p.dt=99;continue;}
        if(p.corpseD){const i=decals.indexOf(p.corpseD);if(i>=0)decals.splice(i,1);}
        const e=makeEnemy(p.prone?'rast':'corr',p.x,p.y,null);e.rising=1;e.stun=1;e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);AU.groan(e,1);
        if(p.prone&&hyp(p.x-P.x,p.y-P.y)<500)bark('rafa','s','Ela tá se mexendo de novo... mas não é mais ela.',{dur:2});}continue;}
    if(p.hurt>0)p.hurt-=dt;
    const chasers=enemies.filter(e=>e.alive&&e.prey===p);
    let near=null,nd=9999; for(const e of chasers){const d=hyp(e.x-p.x,e.y-p.y);if(d<nd){nd=d;near=e;}}
    if(p.hp<=0){p.alive=false;p.say={t:p.prone?'NÃO! NÃO! SAI DE MIM!':'AAAAH!',life:1.4};AU.scream(1);bloodBurst(p.x,p.y,p.prone?30:14,Math.random()*6);addDecal(p.corpseD={k:'corpse',x:p.x,y:p.y,rot:p.ang,type:'zumbi',col:p.col,skin:p.skin,r:11});for(const e of chasers)e.prey=null;
      if(p.prone&&hyp(p.x-P.x,p.y-P.y)<600)laterF(()=>bark('rafa','s',pick2(['Eles pegaram ela. Eu ouvi... tudo.','Eu podia ter ficado. Eu podia ter ficado.']),{dur:2.2}),900);continue;}
    let spd=0,dir=p.ang;
    if(p.st==='flee'){
      if(!near||nd>520){p.st='calm';}
      else{spd=nd<160?110:92;let base=Math.atan2(p.y-near.y,p.x-near.x),best=base,bs=-1;
        for(const off of [0,.5,-.5,1,-1,1.6,-1.6]){const a=base+off,x=p.x+Math.cos(a)*36,y=p.y+Math.sin(a)*36;const t=getT((x/TILE)|0,(y/TILE)|0);if(!SOLID[t]){const sc=3-Math.abs(off);if(sc>bs){bs=sc;best=a;}}}
        dir=best; p.shoutT-=dt; if(p.shoutT<=0){p.shoutT=rr(2.2,3.6);p.say={t:pick2(p.help),life:1.8};alertNoise(p.x,p.y,260);}}
    }
    if(p.st==='calm'){
      const dp=hyp(P.x-p.x,P.y-p.y);
      if(!p.saved&&dp<200&&los(P.x,P.y,p.x,p.y)){p.saved=true;p.st='thank';p.tt=0;dir=Math.atan2(P.y-p.y,P.x-p.x);p.say={t:pick2(p.thanks),life:3.2};
        const [x,y]=freeTileNear((p.x/TILE)|0,(p.y/TILE)|0,true);pickups.push({uid:'d'+(G.dropN++),tx:x,ty:y,x:tc(x),y:tc(y),id:p.item,q:ri(...(LOOTQ[p.item]||[1,1])),kind:'item'});pickOcc.add(idx(x,y));stat('saved',1,3,'heroi');}
      else if(!p.saved){p.calmT=(p.calmT||0)+dt;if(p.calmT>6){p.st='leave';}}
    }
    if(p.st==='thank'){p.tt+=dt;dir=Math.atan2(P.y-p.y,P.x-p.x);if(p.tt>3.4)p.st='leave';}
    if(p.st==='sit'){
      const dp=hyp(P.x-p.x,P.y-p.y); dir=p.ang; p.moving=false;
      if(!p.met&&dp<170&&los(P.x,P.y,p.x,p.y)){p.met=true;p.turnT=16;p.say={t:p.dying?pick2(['Me ajuda... tô sangrando... não sinto as pernas...','Leva... leva isso. Não deixa eu virar.','Tem alguém aí? Eu não enxergo mais...']):'Ei... civil. Chega mais. Eu não vou conseguir usar isso.',life:3.4};
        const [x,y]=freeTileNear((p.x/TILE)|0,(p.y/TILE)|0,true);pickups.push({uid:'d'+(G.dropN++),tx:x,ty:y,x:tc(x),y:tc(y),id:'m9',q:ri(6,10),kind:'item'});pickOcc.add(idx(x,y));
        if(Math.random()<.5){const [x2,y2]=freeTileNear(x,y+1,true);pickups.push({uid:'d'+(G.dropN++),tx:x2,ty:y2,x:tc(x2),y:tc(y2),id:Math.random()<.5?'gran':'ervaV',q:1,kind:'item'});pickOcc.add(idx(x2,y2));}}
      if(p.met){p.turnT-=dt;
        if(p.turnT<9&&!p.w2){p.w2=true;p.say={t:p.dying?'Tá frio... tá tão frio... VAI EMBORA!':'A mordida... tá subindo. Vai embora. Vai!',life:3};}
        if(p.turnT<=0){p.alive=false;p.turned=true;p.dt=99;const e=makeEnemy(p.dying?'zumbi':'soldado',p.x,p.y,null);e.rising=1.2;e.stun=1.2;e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);AU.groan(e,1);if(dp<400)bark('rafa','s','Ele virou... na minha frente.');}}
      continue;
    }
    if(p.st==='trapped'){p.moving=false;p.hurt=0;continue;}
    if(p.st==='crawl'){
      const dp=hyp(P.x-p.x,P.y-p.y); p.crawlT+=dt; p.bleed-=dt;
      if(dp<520&&dp>34){const a=Math.atan2(P.y-p.y,P.x-p.x);p.ang+=angDiff(p.ang,a)*Math.min(1,dt*2);const pull=Math.sin(p.crawlT*3.2)>0?16:3;move(p,Math.cos(p.ang)*pull*dt,Math.sin(p.ang)*pull*dt,true);p.walk+=dt*5;p.moving=true;
        p.trailT=(p.trailT||0)-dt;if(p.trailT<=0){p.trailT=.7;addDecal({k:'drag',x:p.x,y:p.y,r:10,rot:p.ang,seed:Math.random()});}}
      else p.moving=false;
      p.shoutT-=dt; if(p.shoutT<=0){p.shoutT=rr(2.6,3.8);p.say={t:pick2(p.help),life:2.4};alertNoise(p.x,p.y,420);if(typeof AU.cry==='function')AU.cry(Math.random()<.5?'socorro':'meajuda',p.x,p.y,.9);
        for(const e of enemies)if(e.alive&&!e.prey&&!e.t.boss&&!e.stalker&&e.type!=='ouvinte'&&hyp(e.x-p.x,e.y-p.y)<460&&Math.random()<.6){e.prey=p;e.state='investigate';e.nx=p.x;e.ny=p.y;e.it=20;}}
      if(!p.gave&&dp<60){p.gave=true;p.say={t:'Pega... na minha bolsa... e não deixa eu virar uma deles.',life:3.4};const [x,y]=freeTileNear((p.x/TILE)|0,(p.y/TILE)|0,true);pickups.push({uid:'d'+(G.dropN++),tx:x,ty:y,x:tc(x),y:tc(y),id:p.item,q:ri(...(LOOTQ[p.item]||[1,1])),kind:'item'});pickOcc.add(idx(x,y));}
      if(p.bleed<=0){p.alive=false;p.quiet=true;p.say={t:'...',life:2};addDecal(p.corpseD={k:'corpse',x:p.x,y:p.y,rot:p.ang,type:'zumbi',col:p.col,skin:p.skin,r:11});if(dp<500)laterF(()=>bark('rafa','t','Ela parou de chamar. Sangrou até o fim.',{dur:2}),600);}
      continue;}
    if(p.st==='leave'){spd=80;dir=Math.atan2(p.y-P.y,p.x-P.x)+Math.sin(p.t)*.4;p.fade=(p.fade||0)+dt;if(p.fade>5)p.gone=true;}
    p.ang=dir; p.moving=spd>0;
    if(spd>0){const ox=p.x,oy=p.y;move(p,Math.cos(dir)*spd*dt,Math.sin(dir)*spd*dt,true);p.walk+=dt*12;if(hyp(p.x-ox,p.y-oy)<spd*dt*.2)p.ang+=1.2;}
  }
  peds=peds.filter(p=>!p.gone&&hyp(p.x-P.x,p.y-P.y)<2400&&!(p.turned&&p.dt>4));
}
function drawPeds(inView){
  for(const p of peds){if(!inView(p.x,p.y))continue;if(!p.alive||p.st==='trapped')continue;
    const pa=(p.fade?clamp(1-(p.fade-3)/2,0,1):1)*(p.va??1); if(pa<=.01)continue; ctx.globalAlpha=pa;
    if(p.prone){drawCrawler(p);ctx.globalAlpha=1;continue;}
    drawHuman(p.x,p.y,p.ang,{coat:p.col,skin:p.skin,hair:p.hair,pants:p.hazmat?'#bdb9ac':'#26241f',walk:p.walk,moving:p.moving,legAng:p.ang,hazmat:p.hazmat});
    if(p.hurt>0){ctx.fillStyle='rgba(200,30,20,.3)';ctx.beginPath();ctx.arc(p.x,p.y,13,0,6.283);ctx.fill();}
    ctx.globalAlpha=1;}
}
function drawCrawler(p){
  const s=Math.sin(p.walk*2.2);ctx.save();ctx.translate(p.x,p.y);ctx.rotate(p.ang);
  ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(1,3,15,8,0,0,6.283);ctx.fill();
  ctx.strokeStyle='#26241f';ctx.lineWidth=4;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-6,-3);ctx.lineTo(-17,-7);ctx.lineTo(-22,-2);ctx.moveTo(-6,3);ctx.lineTo(-18,6);ctx.lineTo(-20,12);ctx.stroke();
  ctx.fillStyle=p.col;ctx.beginPath();ctx.ellipse(0,0,10,7,0,0,6.283);ctx.fill();
  ctx.strokeStyle=p.skin;ctx.lineWidth=3.2;ctx.beginPath();ctx.moveTo(4,-5);ctx.lineTo(13+s*4,-9);ctx.moveTo(4,5);ctx.lineTo(13-s*4,9);ctx.stroke();
  ctx.fillStyle=p.skin;ctx.beginPath();ctx.arc(10,0,5,0,6.283);ctx.fill();ctx.fillStyle=p.hair;ctx.beginPath();ctx.arc(8.5,0,4.2,Math.PI*.5,Math.PI*1.5);ctx.fill();
  ctx.fillStyle='rgba(130,20,16,.75)';ctx.beginPath();ctx.ellipse(-12,0,6,4,0,0,6.283);ctx.fill();
  ctx.restore();
  if(p.hurt>0){ctx.fillStyle='rgba(200,30,20,.3)';ctx.beginPath();ctx.arc(p.x,p.y,13,0,6.283);ctx.fill();}
}
function drawPedBubbles(){
  for(const p of peds){if(!p.say||(p.va??1)<.3&&hyp(p.x-P.x,p.y-P.y)>260)continue;const a=clamp(p.say.life*2,0,1);drawBubble(p,'x','n',p.say.t,p.say.t.length,false,false,a,true);}
}
// carro em fuga que passa (e às vezes bate)
function evCarStart(){
  for(let i=0;i<40;i++){
    const a=Math.random()*6.283,d=rr(520,700),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;
    if(!inb(tx,ty))continue;const k=idx(tx,ty);if(map[k]!==T.ROAD)continue;const rd=rdir[k];if(rd!==1&&rd!==2)continue;
    let ang=rd===1?(P.x>tc(tx)?0:Math.PI):(P.y>tc(ty)?Math.PI/2:-Math.PI/2);
    EV.car={x:tc(tx),y:tc(ty),ang,spd:rr(280,340),crashIn:Math.random()<.6?rr(1.4,2.6):99,state:'drive',t:0,col:pick2(CAR_COLS),alarmT:0,honk:0};
    AU.engine(0); return true;
  }
  return false;
}
function updEvCar(dt){
  const c=EV.car; if(!c)return; c.t+=dt;
  if(c.state==='drive'){
    const nx=c.x+Math.cos(c.ang)*c.spd*dt, ny=c.y+Math.sin(c.ang)*c.spd*dt, ax=nx+Math.cos(c.ang)*24, ay=ny+Math.sin(c.ang)*24, t=getT((ax/TILE)|0,(ay/TILE)|0);
    c.crashIn-=dt;
    if(SOLID[t]||c.crashIn<=0){
      c.state='crash';c.alarmT=11;G.shake+=hyp(c.x-P.x,c.y-P.y)<700?6:2;AU.boom(.4);AU.thud(1);
      if(c.crashIn<=0)c.ang+=rr(-.6,.6);
      for(let i=0;i<20;i++)parts.push({k:'debris',x:c.x+Math.cos(c.ang)*24,y:c.y+Math.sin(c.ang)*24,vx:rr(-160,160),vy:rr(-160,160),life:.6,max:.6,s:3,c:'#6a6660'});
      setTimeout(()=>{if(EV.car===c&&G.mode==='play'){const sp={x:c.x-Math.sin(c.ang)*30,y:c.y+Math.cos(c.ang)*30};const tt=getT((sp.x/TILE)|0,(sp.y/TILE)|0);if(!SOLID[tt]){const p=spawnSurvivor(sp,2);p.say={t:'Socorro! Me ajuda!',life:2};}}},700);
    } else {c.x=nx;c.y=ny;
      for(const e of enemies){if(e.alive&&!e.t.boss&&e.type!=='boss'&&!e.stalker&&hyp(e.x-c.x,e.y-c.y)<e.r+20){hurtEnemy(e,120,Math.cos(c.ang)*300,Math.sin(c.ang)*300,{});}}
      if(!P.inCar&&!P.hidden&&hyp(P.x-c.x,P.y-c.y)<P.r+20&&P.inv<=0){hurtPlayer(28,c.x,c.y);move(P,Math.cos(c.ang)*40,Math.sin(c.ang)*40,false);}
      c.honk-=dt;if(c.honk<=0&&hyp(c.x-P.x,c.y-P.y)<700){c.honk=rr(.6,1.4);AU.horn();}
      alertNoise(c.x,c.y,320);
      if(c.t>9||hyp(c.x-P.x,c.y-P.y)>1600)EV.car=null;}
  } else {
    c.alarmT-=dt; c.al=(c.al||0)-dt;
    if(c.alarmT>0&&c.al<=0){c.al=.55;AU.horn();alertNoise(c.x,c.y,620);}
    if(c.alarmT<=0){EV.cars.push({x:c.x,y:c.y,ang:c.ang,col:c.col});if(EV.cars.length>6)EV.cars.shift();EV.car=null;}
  }
}
function drawEvCar(c,live){
  ctx.save();ctx.translate(c.x,c.y);ctx.rotate(c.ang);const L=52,Wd=26;
  ctx.fillStyle='rgba(0,0,0,.4)';rrect(ctx,-L/2+3,-Wd/2+4,L,Wd,7);ctx.fill();
  ctx.fillStyle=live&&c.state==='drive'?c.col:'#2a2624';rrect(ctx,-L/2,-Wd/2,L,Wd,7);ctx.fill();
  ctx.fillStyle='#101418';ctx.fillRect(4,-Wd/2+3,9,Wd-6);ctx.fillRect(-20,-Wd/2+4,6,Wd-8);
  ctx.fillStyle=live&&c.state==='drive'?'#fff4c8':'#5a5444';ctx.fillRect(L/2-3,-Wd/2+3,3,5);ctx.fillRect(L/2-3,Wd/2-8,3,5);
  if(live&&c.state==='crash'&&c.alarmT>0&&((renderT*4)|0)%2){ctx.fillStyle='#ffb020';ctx.fillRect(-L/2,-Wd/2+2,3,5);ctx.fillRect(-L/2,Wd/2-7,3,5);ctx.fillRect(L/2-3,-Wd/2+3,3,5);ctx.fillRect(L/2-3,Wd/2-8,3,5);}
  ctx.restore();
}
// helicóptero militar com holofote que passa varrendo a rua
function evHeliStart(){
  const side=Math.random()*6.283, ox=Math.cos(side), oy=Math.sin(side), px=-oy, py=ox, off=rr(-140,140);
  EV.heli={x:P.x+ox*1100+px*off,y:P.y+oy*1100+py*off,vx:-ox*175,vy:-oy*175,t:0,life:13,spotted:false,beat:0};
}
function heliSpot(h){const a=h.t*1.7;return {x:h.x+Math.cos(a)*70+h.vx*.5,y:h.y+Math.sin(a*1.3)*60+h.vy*.5};}
function updEvHeli(dt){
  const h=EV.heli; if(!h)return; h.t+=dt; h.x+=h.vx*dt; h.y+=h.vy*dt; h.life-=dt;
  const d=hyp(h.x-P.x,h.y-P.y); h.beat-=dt; if(h.beat<=0){h.beat=.13;const v=clamp(1-d/1100,0,1);if(v>0){AU.tn(46,40,.1,'sawtooth',.18*v);AU.nz(.08,240,1,.08*v);}if(v>.6)G.shake+=.25;}
  const s=heliSpot(h);
  if(Math.random()<dt*3)alertNoise(s.x,s.y,220);
  if(!h.spotted&&!P.hidden&&G.inB<0&&hyp(s.x-P.x,s.y-P.y)<105){h.spotted=true;alertNoise(P.x,P.y,700);bark('piloto','n',pick2(['Civil avistado na rua. Negativo, sem espaço a bordo. Seguindo.','Tem um vivo lá embaixo... Esquece, Águia Seis segue pro porto.']),{radio:true});}
  if(h.life<=0)EV.heli=null;
}
function evLights(){
  for(const p of peds)if(p.alive&&!p.gone&&hyp(p.x-P.x,p.y-P.y)<900){punch(p.x,p.y,48,.4);for(let i=1;i<=3;i++)punch(p.x+Math.cos(p.ang)*i*34,p.y+Math.sin(p.ang)*i*34,22+i*10,.45);}
  if(V.lightsT>0){V.lightsT-=lastDt;for(let i=1;i<=4;i++)punch(V.x+Math.cos(V.ang)*(24+i*40),V.y+Math.sin(V.ang)*(24+i*40),36+i*14,.6);}
  const h=EV.heli; if(h){const s=heliSpot(h);punch(s.x,s.y,130,.9);punch(h.x,h.y,40,.3);}
  if(EV.trap)punch(EV.trap.cx,EV.trap.cy,60,.35);
  if(typeof plotLights==='function')plotLights();
  const c=EV.car; if(c){if(c.state==='drive'){for(let i=1;i<=4;i++)punch(c.x+Math.cos(c.ang)*(30+i*45),c.y+Math.sin(c.ang)*(30+i*45),40+i*16,.55);}else if(c.alarmT>0&&((renderT*4)|0)%2)punch(c.x,c.y,90,.6);}
}
function drawEvTop(){
  if(EV.trap){const t=EV.trap;ctx.fillStyle=`rgba(255,220,150,${.35+Math.sin(renderT*9)*.15})`;ctx.beginPath();ctx.arc(t.cx,t.cy,7,0,6.283);ctx.fill();
    if(t.ped&&t.ped.alive&&(renderT*2|0)%2){ctx.fillStyle='rgba(200,180,160,.8)';ctx.beginPath();ctx.arc(t.cx+3,t.cy-2,3,0,6.283);ctx.fill();}}
  for(const c of EV.cars)drawEvCar(c,false);
  if(EV.car)drawEvCar(EV.car,true);
  const h=EV.heli; if(h){const s=heliSpot(h);
    ctx.fillStyle='rgba(230,240,255,.07)';ctx.beginPath();ctx.moveTo(h.x,h.y);ctx.lineTo(s.x-90,s.y);ctx.lineTo(s.x+90,s.y);ctx.fill();
    ctx.save();ctx.translate(h.x,h.y);ctx.rotate(Math.atan2(h.vy,h.vx));ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(30,30,40,16,0,0,6.283);ctx.fill();
    ctx.fillStyle='#2c3326';ctx.beginPath();ctx.ellipse(0,0,34,14,0,0,6.283);ctx.fill();ctx.fillRect(-60,-3,30,6);ctx.fillStyle='#1a1f17';ctx.fillRect(14,-8,14,16);
    ctx.strokeStyle='rgba(20,20,20,.55)';ctx.lineWidth=4;const r=renderT*40;for(let i=0;i<2;i++){ctx.beginPath();ctx.moveTo(Math.cos(r+i*1.57)*58,Math.sin(r+i*1.57)*58);ctx.lineTo(-Math.cos(r+i*1.57)*58,-Math.sin(r+i*1.57)*58);ctx.stroke();}
    ctx.fillStyle=((renderT*2)|0)%2?'#e04a3a':'#5a1a14';ctx.fillRect(-58,-2,4,4);ctx.restore();}
}
// carro/caminhão de verdade largado na rua (vira obstáculo e esconderijo do mapa)
function placeWreck(x,y,ang,col,kind,burn){
  const tx=(x/TILE)|0,ty=(y/TILE)|0,horiz=Math.abs(Math.cos(ang))>.7,w=horiz?2:1,h=horiz?1:2;
  for(let j=-1;j<=h;j++)for(let i=-1;i<=w;i++){const t=getT(tx+i,ty+j);if(j>=0&&j<h&&i>=0&&i<w){if(t!==T.ROAD)return null;}else if(t===T.CAR)return null;}
  if(hyp(tc(tx)-P.x,tc(ty)-P.y)<70)return null;
  if(!V.dead&&hyp((tx+w/2)*TILE-V.x,(ty+h/2)*TILE-V.y)<V.r+70)return null;
  const c=addCar(tx,ty,horiz,!!burn,col); c.kind=kind||null; c.ev=true; if(typeof invalidateRect==='function')invalidateRect(tx,ty,w,h);
  if(burn){lights[lights.length-1].ev=true;}
  return c;
}
function offscreen(x,y,m=70){const z=view.z||1;return x<cam.x-m||x>cam.x+view.w/z+m||y<cam.y-m||y>cam.y+view.h/z+m;}
function roadSpot(minD,maxD,cone){
  for(let i=0;i<60;i++){
    const a=cone!=null?P.ang+Math.PI+rr(-cone,cone):Math.random()*6.283,d=rr(minD,maxD),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;
    if(!inb(tx,ty))continue;const k=idx(tx,ty);if(map[k]!==T.ROAD||!reach[k])continue;const rd=rdir[k];if(rd!==1&&rd!==2)continue;
    if(!offscreen(tc(tx),tc(ty)))continue;
    return {x:tc(tx),y:tc(ty),ang:rd===1?0:Math.PI/2,tx,ty};
  }
  return null;
}
// comboio do Exército destruído: caminhões, soldados que viraram e alguma munição
function evConvoy(){
  const sp=roadSpot(560,780,1.6); if(!sp)return false;
  const ox=Math.cos(sp.ang),oy=Math.sin(sp.ang); let made=0;
  for(let i=0;i<2;i++){if(placeWreck(sp.x+ox*i*96,sp.y+oy*i*96,sp.ang,'#3d4a2f','army',i===0))made++;}
  if(!made)return false;
  EV.conv++;
  for(let i=0;i<3;i++){const x=sp.x+ox*rr(-60,150)+oy*rr(-50,50),y=sp.y+oy*rr(-60,150)+ox*rr(-50,50),tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]])continue;const e=makeEnemy('soldado',tc(tx),tc(ty),null,Math.random()<.4);enemies.push(e);}
  for(let i=0;i<3;i++)addDecal({k:'corpse',x:sp.x+rr(-60,120)*ox+rr(-40,40),y:sp.y+rr(-60,120)*oy+rr(-40,40),rot:Math.random()*6.28,type:'soldado',col:'#3d4a2f',skin:'#86907a',r:12});
  const [x,y]=freeTileNear(sp.tx+(oy?2:0),sp.ty+(ox?2:0),true);pickups.push({uid:'d'+(G.dropN++),tx:x,ty:y,x:tc(x),y:tc(y),id:Math.random()<.6?'m9':'cart',q:ri(5,9),kind:'item'});pickOcc.add(idx(x,y));
  EV.seen.push({x:sp.x,y:sp.y,t:'Um comboio do Exército... virado. O que foi que pegou eles?'});
  return true;
}
// sobrevivente trancado dentro de um carro, com eles batendo no vidro
function evTrapped(){
  const sp=roadSpot(460,640,1.6); if(!sp)return false;
  const c=placeWreck(sp.x,sp.y,sp.ang,pick2(CAR_COLS),'trap',false); if(!c)return false;
  const cx=(c.x+c.w/2)*TILE,cy=(c.y+c.h/2)*TILE, ped=spawnSurvivor({x:cx,y:cy},0,{st:'trapped'});
  const zs=[];for(let i=0;i<3;i++){const a=Math.random()*6.283,x=cx+Math.cos(a)*48,y=cy+Math.sin(a)*48,tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]])continue;const e=makeEnemy(i?'zumbi':'corr',tc(tx),tc(ty),null);e.state='investigate';e.nx=cx;e.ny=cy;e.it=6;e.idle=false;enemies.push(e);zs.push(e);}
  EV.trap={c,cx,cy,ped,zs,t:70,knock:0};
  return true;
}
function updTrap(dt){
  const tr=EV.trap; if(!tr)return; tr.t-=dt; const p=tr.ped, d=hyp(tr.cx-P.x,tr.cy-P.y);
  const live=tr.zs.filter(e=>e.alive&&hyp(e.x-tr.cx,e.y-tr.cy)<190);
  for(const e of live)if(e.state!=='chase'){e.state='investigate';e.nx=tr.cx+rr(-20,20);e.ny=tr.cy+rr(-20,20);e.it=5;if(hyp(e.x-tr.cx,e.y-tr.cy)<46){e.face=Math.atan2(tr.cy-e.y,tr.cx-e.x);e.hitAnim=.2;}}
  tr.knock-=dt; if(tr.knock<=0&&live.length){tr.knock=rr(1.2,2.2);if(d<700){AU.knock();alertNoise(tr.cx,tr.cy,240);}if(d<520&&Math.random()<.5)p.say={t:pick2(['Me tira daqui!','Eles tão quebrando o vidro!','Socorro! Tô preso no carro!']),life:1.8};}
  if(!live.length&&p.st==='trapped'){p.st='calm';p.x=tr.cx+(tr.c.horiz?0:30);p.y=tr.cy+(tr.c.horiz?30:0);p.say={t:'Acabou? Acabou...',life:2};EV.trap=null;return;}
  if(tr.t<=0&&live.length){p.alive=false;p.hp=0;AU.scream(clamp(1-d/800,.2,1));G.flick=.2;addDecal({k:'blood',x:tr.cx,y:tr.cy,r:18,rot:0,seed:.4});EV.trap=null;if(d<600)bark('rafa','t','Eu podia ter ajudado...');}
  if(d>2000)EV.trap=null;
}
function updEvents(dt){
  updPeds(dt); updEvCar(dt); updEvHeli(dt); updTrap(dt);
  const fl=EV.fall; if(fl){fl.t-=dt;
    if(fl.t<=0&&!fl.landed){fl.landed=true;AU.thud(1);AU.splat();G.shake+=9;buzz([90,30,60]);AU.sting();
      addDecal({k:'blood',x:fl.x,y:fl.y,r:34,rot:Math.random()*6,seed:Math.random()});
      bloodBurst(fl.x,fl.y,26,Math.random()*6);
      const p=spawnSurvivor({x:fl.x,y:fl.y},0,{st:'crawl'});p.prone=true;p.hp=30;p.ang=Math.random()*6.28;p.moving=false;p.crawlT=0;p.shoutT=2.2;p.bleed=rr(38,50);
      p.help=['Me ajuda... minhas pernas... eu não sinto as pernas...','Por favor... não me deixa aqui...','Moço... MOÇO! Volta!','Eles tão vindo... eu tô ouvindo eles...','Eu pulei... eu achei que ia morrer na hora...','Me puxa... só me puxa pra dentro...'];
      laterF(()=>bark('rafa','s',pick2(['Ela caiu do prédio... e tá viva. Tá se arrastando.','Ele pulou... e não morreu. Meu Deus, ele tá se arrastando.','Caiu do lado de mim. As pernas... viraram pro lado errado.'])),900);
      alertNoise(fl.x,fl.y,520);EV.fall=null;}}
  for(let i=EV.seen.length-1;i>=0;i--){const s=EV.seen[i];if(hyp(s.x-P.x,s.y-P.y)<300&&los(P.x,P.y,s.x,s.y)){bark('rafa','t',s.t);EV.seen.splice(i,1);}}
  // a cidade ao longe: tiros de outros sobreviventes, sirenes, cachorros
  EV.amb=(EV.amb??rr(15,30))-dt;
  if(G.ev&&G.ev.silent){if(G.flick>0)return;return;}
  if(EV.amb<=0){EV.amb=rr(35,70);const r=Math.random();
    if(r<.4){const n=ri(2,5);for(let i=0;i<n;i++){AU.nz(.12,1400,.7,.05,'lowpass',i*rr(.15,.35));AU.tn(120,50,.08,'square',.025,i*rr(.15,.35));}}
    else if(r<.7){AU.tn(620,880,1.4,'sine',.018);AU.tn(880,620,1.4,'sine',.018,1.4);}
    else AU.scream(.15);}
  if(G.wave>0||G.heli||CUT.on||inSafe()||P.hidden)return;
  const night=isNight(), F=G.flags, bc=G.lastD>=5, urban=G.lastD!==4;
  EV.t-=dt; if(EV.t>0)return; EV.t=night?rr(75,130):rr(100,170); if(typeof evOK==='function'&&!evOK(45)){EV.t=20;return;} if(typeof evMark==='function')evMark();
  if(enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<420)){EV.t=12;return;}
  const W8=[['surv',urban?16:0],['car',urban?9:0],['heli',7],['herd',night?16:7],['dorm',7],['sci',F.metTiao?(F.shopEv?10:6):0],['ferido',urban&&F.metTiao?7:0],
    ['comboio',urban&&EV.conv<(F.inibidorDone?5:3)?6:0],['preso',urban&&!EV.trap?8:0],['alarme',night&&urban?7:0],['grita',night&&bc?6:0],['van',F.bloqueio&&urban?5:0],
    ['comer',night?9:5],['queda',urban&&bc?(F.caos?24:12):0],['caes',urban?5:7]];
  let tot=0;for(const [,w] of W8)tot+=w; let roll=Math.random()*tot, kind='heli'; for(const [k,w] of W8){roll-=w;if(roll<=0){kind=k;break;}}
  if(kind==='comer'){const sp=evSpot(280,420,1.3,false);if(sp){const n=ri(2,4);addDecal({k:'corpse',x:sp.x,y:sp.y,rot:Math.random()*6.28,type:'zumbi',col:pick2(PED_LOOK)[0],skin:'#c8a890',r:11});addDecal({k:'blood',x:sp.x,y:sp.y,r:26,rot:0,seed:Math.random()});addDecal({k:'gib',x:sp.x+12,y:sp.y-6,r:4,rot:1,c:'#8a2a20'});
      for(let i=0;i<n;i++){const a=i/n*6.283+rr(-.3,.3),x=sp.x+Math.cos(a)*20,y=sp.y+Math.sin(a)*20,tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]])continue;const e=makeEnemy('zumbi',x,y,null);e.state='feed';e.feedA=a+Math.PI;e.face=e.feedA;enemies.push(e);}
      EV.seen.push({x:sp.x,y:sp.y,t:pick2(['Eles estão... comendo alguém. Ainda tá se mexendo.','Não olha. Não olha. Passa pelo outro lado.','Era uma mulher. Era uma mulher de vestido.'])});}return;}
  if(kind==='queda'){if(EV.fall)return;for(let i=0;i<40;i++){const a=Math.random()*6.283,d=rr(110,200),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;
      if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]]||bmap[idx(tx,ty)]>=0)continue;let wall=false;for(const [dx,dy] of DIRS4)if(map[idx(tx+dx,ty+dy)]===T.WALL)wall=true;if(!wall)continue;
      EV.fall={x:tc(tx),y:tc(ty),t:1.1,rise:rr(5,8),landed:false};AU.scream(clamp(1-d/500,.4,1));break;}return;}
  if(kind==='caes'){const sp=evSpot(560,760,null,false);if(sp){for(let i=0;i<ri(3,4);i++){const x=sp.x+rr(-40,40),y=sp.y+rr(-40,40),tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]])continue;const e=makeEnemy('cao',x,y,null);e.state='investigate';e.nx=P.x+rr(-60,60);e.ny=P.y+rr(-60,60);e.it=14;enemies.push(e);}
      for(let k=0;k<3;k++)AU.tn(380,240,1.1,'sine',.04,k*.5);setTimeout(()=>{if(G.mode==='play')bark('rafa','s','Uivo... cachorro. Mais de um. Eles tão vindo pelo cheiro.');},1300);}return;}
  if(kind==='sci'){const sp=evSpot(260,380,null);if(sp){const p=spawnSurvivor(sp,ri(2,3),{look:['#d8d4b8','#222','#c49a7a'],hazmat:true,help:SCI_HELP,thanks:SCI_THANKS,item:pick2(['m9','spray','cart','m9'])});p.say={t:pick2(SCI_HELP),life:2.2};}return;}
  if(kind==='ferido'){const sp=evSpot(300,440,1.2,false);if(sp){const p=spawnSurvivor(sp,0,{st:'sit',look:['#3d4a2f','#2f3a26','#a8734f']});p.ang=Math.random()*6.28;p.moving=false;}return;}
  if(kind==='comboio'){if(!evConvoy())EV.t=10;return;}
  if(kind==='preso'){if(!evTrapped())EV.t=10;return;}
  if(kind==='alarme'){const sp=roadSpot(300,520,null);if(sp){EV.car={x:sp.x,y:sp.y,ang:sp.ang,spd:0,crashIn:99,state:'crash',t:0,col:pick2(CAR_COLS),alarmT:12,honk:0};setTimeout(()=>{if(G.mode==='play')bark('rafa','s','Um alarme de carro... isso vai chamar todos eles pra lá.');},800);}return;}
  if(kind==='grita'){for(let i=0;i<30;i++){const a=P.ang+Math.PI+rr(-1.2,1.2),d=rr(300,440),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty))continue;const k=idx(tx,ty);if(SOLID[map[k]]||!reach[k]||safeMask[k])continue;enemies.push(makeEnemy('grita',tc(tx),tc(ty),null));break;}return;}
  if(kind==='van'){if(evCarStart()){EV.car.col='#e8e8e4';EV.car.crashIn=99;EV.car.vertice=true;setTimeout(()=>{if(G.mode==='play')bark('rafa','s','Uma van da Vértice... eles ainda estão rodando pela cidade.');},1200);}return;}
  const r=kind==='surv'?.1:kind==='car'?.4:kind==='heli'?.6:kind==='herd'?.7:.95;
  if(r<.34&&urban){const sp=evSpot(260,380,null);if(sp){const p=spawnSurvivor(sp,ri(2,3));p.say={t:pick2(PED_HELP),life:2};}}
  else if(r<.52&&urban){if(!evCarStart())EV.t=10;}
  else if(r<.66){evHeliStart();}
  else if(r<.83){
    const sp=evSpot(480,620,1.2,false); if(sp){const perp=sp.a+Math.PI/2*(Math.random()<.5?1:-1);
      for(let i=0;i<ri(6,9);i++){const x=sp.x-Math.cos(perp)*i*26+rr(-10,10),y=sp.y-Math.sin(perp)*i*26+rr(-10,10),tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]])continue;
        const e=makeEnemy('zumbi',x,y,null);e.herd=true;e.dir=perp;e.idle=false;e.wt=999;enemies.push(e);}
      setTimeout(()=>{if(G.mode==='play')bark('rafa','s','Uma horda... apaga a luz e não se mexe.');},400);AU.groan({x:sp.x,y:sp.y},1);}
  } else {const sp=evSpot(150,230,.5);if(sp){const e=makeEnemy(Math.random()<.5?'zumbi':'rast',sp.x,sp.y,null,true);enemies.push(e);}}
}
