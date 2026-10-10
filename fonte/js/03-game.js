// ===================== ESTADO DO JOGO =====================
const G = {mode:'title'};
const P = {};
let enemies=[], projs=[], parts=[], decals=[], hazards=[], floaters=[];
const cam = {x:0,y:0};
const flow = new Int16Array(W*HT), flowQ = new Int32Array(W*HT);
let flowT = 0, flowTile = -1;
const nflow=new Int16Array(W*HT); let nfId=0,nfOx=-99,nfOy=-99,nfT=-9;
const V={x:0,y:0,ang:-Math.PI/2,spd:0,hp:300,max:300,ok:false,dead:false,r:15,engT:0,hornT:0,skid:0};
const DBG={god:false,ammo:false,noclip:false,bright:false,fps:false,ai:false,freeze:false,speed:1};

let RUNID=0;
// atraso que não vaza para outra partida (novo jogo ou carregar)
function later(ms,fn){const id=RUNID;const go=()=>{if(id!==RUNID)return;if(G.mode==='play'&&!(typeof CUT!=='undefined'&&CUT.on&&ms<0))fn();else if(G.mode==='menu'||G.mode==='paused')setTimeout(go,300);};setTimeout(go,Math.abs(ms));}
function laterF(fn,ms){later(ms,fn);}
function resetState(diff){
  RUNID++;
  Object.assign(G,{mode:'play',diff,D:DIFFS[diff],time:0,inv:new Array(8).fill(null),slots:8,box:[],flags:{},
    files:new Set(),taken:new Set(),killed:new Set(),kills:0,saves:0,shake:0,hurt:0,flash:0,toasts:[],banner:null,lastD:-1,
    wave:0,heli:null,spawnT:8,prompt:null,expT:0,persT:25,persTp:6,inB:-1,boom:null,dropN:0,muzzle:null,radioT:0,
    blackout:0,light:0,lightT:rr(18,35),thunderT:0,heartT:0,hitDirs:[],batWarn:false,noiseT:0,st:{},achPop:null,hs:0,afogT:20,
    scareT:rr(45,70),vulto:null,objTxt:'',objT:0,pLit:false,litT:0,lastAct:0,clock:23*60+40,tmul:1,visT:0,restedNight:false,lampChain:null,phone:null,fear:0,detOn:false,detT:0,blips:[],comps:[],ev:{},struggle:null,objGl:0,objGlT:'',ring:0,btl:[],shockT:0,camF:1,camTgt:1});
  if(typeof PSY!=='undefined')PSY.floats=[];
  Object.assign(P,{x:START.x,y:START.y,r:11,hp:100,max:100,st:100,tired:false,ang:-Math.PI/2,w:8,dur:0,hidden:null,hideT:0,
    owned:[false,false,false,false,false,false,false,false,true],mags:[0,0,0,0,0,0,0,0,0],cool:0,reloading:0,inv:0,walk:0,det:100,thr:null,sil:0,crouch:false,
    firing:false,slash:0,moving:false,running:false,recoil:0,bat:100,lamp:true,legAng:-Math.PI/2,inCar:false,dodge:0,dodgeCd:0,dvx:0,dvy:0,grab:null,ride:false,crouch:false,lastDodge:-99,dStack:0,dodgeIF:0});
  while(P.owned.length<WEAPONS.length){P.owned.push(false);P.mags.push(0);}
  enemies=[];projs=[];parts=[];decals=[];hazards=[];floaters=[];flowTile=-1;if(typeof FIRES!=='undefined')FIRES=[];flowT=0;nfId=0;nfOx=-99;G.zm=1;
  if(typeof resetEvents==='function')resetEvents(); if(typeof BARK!=='undefined'){BARK.q=[];BARK.cur=null;} if(typeof CUT!=='undefined'){Object.assign(CUT,{on:false,pending:[],actors:{},q:[],st:null,bub:null,choice:null,cam:null,zm:1,onEnd:null});const sk=document.getElementById('cutskip');if(sk)sk.hidden=true;const ch=document.getElementById('cutch');if(ch){ch.hidden=true;ch.innerHTML='';}}
  resetCar();
}
function bigE(e){return !!(e.t.boss||e.type==='boss'||e.stalker||e.type==='brut');}
function lampOn(){return P.lamp&&P.bat>0&&!P.hidden&&!P.inCar;}
function resetCar(){const j=LM.jipe||{x:START.x+64,y:START.y};Object.assign(V,{x:j.x,y:j.y,ang:-Math.PI/2,spd:0,hp:V.max,ok:false,dead:false,engT:0,hornT:0,skid:0,hurtT:0});}
function scaleLoot(){
  for(const p of pickups) if(p.kind==='item'&&ITEMS[p.id].k==='ammo') p.q=Math.max(1,Math.round(p.q*G.D.loot));
}
function spawnInitial(){
  for(const e of initEnemies) if(!G.killed.has(e.uid)){const en=makeEnemy(e.type,e.x,e.y,e.uid,e.dorm);if(e.home)en.homeB=bmap[idx((e.x/TILE)|0,(e.y/TILE)|0)];if(e.col)en.col=e.col;if(e.feed){en.state='feed';en.feedA=Math.random()*6.28;en.face=en.feedA;const cx=en.x+Math.cos(en.feedA)*18,cy=en.y+Math.sin(en.feedA)*18;GORE.push({k:'corpse',x:cx,y:cy,rot:Math.random()*6.28,type:'zumbi',col:rpick(['#5a4a6a','#6a5a3a','#3a5a6a']),skin:'#c8a890',r:11},{k:'blood',x:cx,y:cy,r:24,rot:Math.random()*6,seed:Math.random()});}enemies.push(en);}
}
function newGame(diff){
  genWorld(); resetState(diff); scaleLoot();
  invAdd('ervaV',1); invAdd('pilha',1); if(diff==='facil'){invAdd('spray',1);invAdd('pilha',1);}
  spawnInitial(); markExplored(); snapCamera();
}
function makeEnemy(type,x,y,uid,dorm){
  const t=ETYPES[type]; const hp=t.hp*(type==='pers'||type==='bombeiro'||type==='boss'?G.D.phd:G.D.ehp);
  return {stalker:type==='pers'||type==='bombeiro',type,t,x,y,vx:0,vy:0,r:t.r,hp,max:hp,state:dorm?'dorm':type==='rast'?'hide':'wander',heard:0,nx:x,ny:y,lx:x,ly:y,sees:false,losN:false,losL:false,st:0,it:0,nf:0,hunt:type==='pers'||type==='bombeiro'||type==='boss',huntT:0,stk:0,sx:x,sy:y,skT:.8,scan:1,c3:type==='grita'?0:4,vis:false,va:0,rising:0,dir:Math.random()*6.283,wt:0,idle:false,
    atk:0,c2:Math.random()*2,flash:0,burn:0,stun:0,uid,face:Math.random()*6.283,losT:Math.random()*.3,los:false,alive:true,
    anim:Math.random()*10,cr:Math.min(t.r,(t.boss||type==='boss'||type==='pers'||type==='bombeiro'||type==='brut'||type==='ouvinte')?14:12),mode:null,mt:0,down:0,lunge:0,lost:0,stepT:0,hitAnim:0,home:t.boss?{x,y}:null,spdMul:type==='zumbi'?rr(.85,1.2):1};
}

// ===================== INVENTÁRIO =====================
function invCount(id){let n=0;for(const s of G.inv)if(s&&s.id===id)n+=s.q;return n;}
function invAdd(id,q){
  const st=ITEMS[id].st;
  for(const s of G.inv){if(q<=0)break;if(s&&s.id===id&&s.q<st){const a=Math.min(st-s.q,q);s.q+=a;q-=a;}}
  for(let i=0;i<G.slots&&q>0;i++){if(!G.inv[i]){const a=Math.min(st,q);G.inv[i]={id,q:a};q-=a;}}
  return q;
}
function invRemove(id,q){
  for(let i=G.inv.length-1;i>=0&&q>0;i--){const s=G.inv[i];if(s&&s.id===id){const a=Math.min(s.q,q);s.q-=a;q-=a;if(s.q<=0)G.inv[i]=null;}}
  return q===0;
}
function invFree(){let n=0;for(let i=0;i<G.slots;i++)if(!G.inv[i])n++;return n;}
function boxAdd(id,q){const s=G.box.find(s=>s.id===id);if(s)s.q+=q;else G.box.push({id,q});}
function healWith(id){
  const it=ITEMS[id];
  if(P.hp>=P.max){toast('Você já está bem.');return false;}
  P.hp=Math.min(P.max,P.hp+it.h); invRemove(id,1); AU.heal(); toast(`Usou ${it.n}.`); return true;
}
function quickHeal(){
  if(P.inCar){toast('Não dá pra se curar dirigindo.');return;}
  const need=P.max-P.hp; if(need<=0){toast('Você já está bem.');return;}
  const opts=['ervaV','misVV','misVR','spray'].filter(id=>invCount(id)>0);
  if(!opts.length){toast('Nenhum item de cura na mochila.');return;}
  opts.sort((a,b)=>ITEMS[a].h-ITEMS[b].h);
  const id=opts.find(id=>ITEMS[id].h>=need)||opts[opts.length-1];
  healWith(id);
}
function canCraft(r){for(const k in r.need)if(invCount(k)<r.need[k])return false;return true;}
function craft(r){
  if(!canCraft(r))return false;
  const snap=G.inv.map(s=>s?{...s}:null);
  for(const k in r.need)invRemove(k,r.need[k]);
  const left=invAdd(r.give[0],r.give[1]);
  if(left>0){G.inv=snap;toast('Sem espaço na mochila.');return false;}
  AU.craft(); toast(`Fabricou ${ITEMS[r.give[0]].n}${r.give[1]>1?' ×'+r.give[1]:''}.`); return true;
}

// ===================== SALVAR =====================
const SAVE_KEY='porto-sombrio-v15';
function packExplored(){let s='';for(let i=0;i<explored.length;i+=8){let b=0;for(let k=0;k<8;k++)if(explored[i+k])b|=1<<k;s+=String.fromCharCode(b);}return btoa(s);}
function unpackExplored(str){try{const s=atob(str);for(let i=0;i<s.length;i++){const b=s.charCodeAt(i);for(let k=0;k<8;k++)explored[i*8+k]=(b>>k)&1;}}catch(e){}}
function serialize(){
  return {v:2,diff:G.diff,time:G.time,clock:G.clock,kills:G.kills,saves:G.saves,inv:G.inv,slots:G.slots,box:G.box,flags:G.flags,
    st:G.st,files:[...G.files],taken:[...G.taken],killed:[...G.killed],gates:gates.filter(g=>g.open).map(g=>g.id),
    P:{x:P.x,y:P.y,hp:P.hp,max:P.max,w:P.w,owned:P.owned,mags:P.mags,bat:P.bat,dur:P.dur,det:P.det,thr:P.thr,sil:P.sil},V:{x:V.x,y:V.y,ang:V.ang,hp:V.hp,ok:V.ok,dead:V.dead},explored:packExplored()};
}
function hasSave(){try{return !!localStorage.getItem(SAVE_KEY);}catch(e){return false;}}
function writeSave(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(serialize()));return true;}catch(e){return false;}}
function readSave(){try{const s=localStorage.getItem(SAVE_KEY);return s?JSON.parse(s):null;}catch(e){return null;}}
function loadState(s){
  genWorld(); resetState(s.diff||'normal'); scaleLoot();
  G.time=s.time||0; G.clock=s.clock??(23*60+40); G.kills=s.kills||0; G.saves=s.saves||0; G.slots=s.slots||8;
  G.inv=new Array(G.slots).fill(null); (s.inv||[]).forEach((x,i)=>{if(i<G.slots)G.inv[i]=x;});
  G.box=s.box||[]; G.flags=s.flags||{}; if(G.flags.jipe&&!G.flags.bloqueio&&G.flags.eduJoin)G.flags.needDina=true; G.st=s.st||{}; G.files=new Set((s.files||[]).filter(i=>i>=0&&i<DOCS.length)); G.taken=new Set(s.taken||[]); G.killed=new Set(s.killed||[]);
  Object.assign(P,{x:s.P.x,y:s.P.y,hp:s.P.hp,max:s.P.max||100,w:s.P.w,owned:s.P.owned,mags:s.P.mags,bat:s.P.bat??100,legAng:P.ang});
  while(P.owned.length<WEAPONS.length){P.owned.push(false);P.mags.push(0);}
  P.owned[8]=true; P.dur=s.P.dur??(P.owned[0]?20:0); P.det=s.P.det??100; P.thr=s.P.thr||null; P.sil=s.P.sil||0; P.crouch=false; P.hidden=null; if(!P.owned[P.w])P.w=8;
  for(const id of (s.gates||[])){const g=gates.find(g=>g.id===id);if(g&&!g.open)openGate(g);}
  for(const g of gates)if(g.shut&&g.open&&!(s.gates||[]).includes(g.id)&&(g.id==='hospIn'))closeGate(g);
  pickups=pickups.filter(p=>!G.taken.has(p.uid));
  if(s.explored)unpackExplored(s.explored);
  if(G.flags.mapAll)explored.fill(1);
  if(s.V)Object.assign(V,s.V,{spd:0}); if(G.flags.jipe)V.ok=true;
  G.flags.radio=false;
  // registro feito no meio do evento do shopping: a cena recomeça; a Enfermeira volta a rondar
  if(G.flags.shopEv&&!G.flags.boss_especime&&!G.flags.shopOpen){G.flags.shopEv=false;delete G.flags['pw'+shopB()];const gr=gates.find(g=>g.id==='grade');if(gr&&gr.open)closeGate(gr);for(const id of ['shopN','shopS','shopW','shopE']){const g=gates.find(x=>x.id===id);if(g&&!g.open)openGate(g);}}
  if(G.flags.pescOn&&!G.flags.boss_pescador&&LM.cabecudas)initEnemies.push({uid:'b_pescador',type:'pescador',x:LM.cabecudas.x,y:LM.cabecudas.y});
  if(G.flags.dinaPlanted&&!G.flags.bloqWeak){G.flags.bloqWeak=true;G.flags.bloqueio_g=true;const g=gates.find(x=>x.id==='bloqueio');if(g&&!g.open)openGate(g);}
  // a ampola que caiu na drogaria continua lá se você salvou antes de pegar
  if((G.flags.boss_especime||G.flags.shopOpen)&&!G.flags.inibidorDone&&invCount('inibidor')<=0&&!G.box.some(b=>b.id==='inibidor')&&LM.shopFarm){const [x,y]=freeTileNear((LM.shopFarm.x/TILE)|0,(LM.shopFarm.y/TILE)|0,true);pickups.push({uid:'amp',tx:x,ty:y,x:tc(x),y:tc(y),id:'inibidor',q:1,kind:'item'});}
  applyWorldState();
  // pilhas que você pegou só uma parte (maleta cheia) continuam com o que sobrou
  if(G.flags.pq)for(const p of pickups)if(G.flags.pq[p.uid]!=null)p.q=G.flags.pq[p.uid];
  spawnInitial(); markExplored(); snapCamera();
}

// ===================== INTERAÇÃO =====================
function inSafe(){return safeMask[idx((P.x/TILE)|0,(P.y/TILE)|0)]===1;}
function findInteract(){
  if(P.inCar)return {k:'car',o:V};
  if(P.hidden)return {k:'unhide',o:P.hidden};
  let best=null,bd=46;
  {const d=hyp(V.x-P.x,V.y-P.y)-14;if(d<bd&&!V.dead){bd=d;best={k:'car',o:V};}}
  for(const p of pickups){const d=hyp(p.x-P.x,p.y-P.y);if(d<bd&&los(P.x,P.y,p.x,p.y)){bd=d;best={k:'pick',o:p};}}
  for(const it of interacts){const d=hyp(it.x-P.x,it.y-P.y)-8;if(d<bd&&los(P.x,P.y,it.x,it.y)){bd=d;best={k:'int',o:it};}}
  for(const n of npcs){if(n.cond&&!n.cond())continue;const d=hyp(n.x-P.x,n.y-P.y)-8;if(d<bd){bd=d;best={k:'npc',o:n};}}
  for(const g of gates){if(g.open)continue;const cx=clamp(P.x,g.x*TILE,(g.x+g.w)*TILE),cy=clamp(P.y,g.y*TILE,(g.y+g.h)*TILE);const d=hyp(P.x-cx,P.y-cy);if(d<Math.min(bd,30)){bd=d;best={k:'gate',o:g};}}
  return best;
}
const INT_LABEL={typewriter:'Máquina de escrever (salvar)',box:'Baú de itens',fuse:'Quadro de força',cofre:'Cofre',radio:'Rádio do heliponto',lever:'Alavanca da barricada',vitrine:'Vitrine do coronel',gerador:'Gerador da clínica',guindaste:'Comandos do guindaste',janela:'Quebrar a janela',som:'Mesa de som do DJ',onibus:'Porta do ônibus 22',bondinho:'Painel do bondinho',bondMA:'Painel da estação',bondinho2:'Painel do bondinho',geradorL:'Gerador auxiliar',cctv:'Monitores da guarita',sino:'Corda do sino da Matriz',painelShop:'Painel das portas de enrolar',disjuntor:'Disjuntor'};
function promptText(pr){
  if(!pr)return '';
  const o=pr.o;
  if(pr.k==='pick'){
    if(o.kind==='item')return `Pegar ${ITEMS[o.id].n}${o.q>1?' ('+o.q+')':''}`;
    if(o.kind==='weapon')return o.id===0?'Pegar faca':`Pegar ${WEAPONS[o.id].n}`;
    if(o.kind==='file')return `Ler: ${DOCS[o.id].t}`;
    if(o.kind==='bag')return 'Pegar bolsinha de couro';
    if(o.kind==='walkie')return 'Pegar rádio comunicador';
  }
  if(pr.k==='unhide')return 'Sair do esconderijo';
  if(pr.k==='int'&&o.type==='hide')return o.kind==='carro'?'Esconder no carro':o.kind==='cacamba'?'Esconder na caçamba':'Esconder no armário';
  if(pr.k==='int'&&o.type==='disjuntor'){const b=buildings[o.b];return (b&&G.flags['pw'+o.b]===false?'Religar a luz':'Desligar a luz')+(b&&b.name?' · '+b.name:'');}
  if(pr.k==='int')return INT_LABEL[o.type];
  if(pr.k==='npc')return `Falar com ${o.name}`;
  if(pr.k==='comp')return `Falar com ${o.name}`;
  if(pr.k==='gate')return o.name;
  if(pr.k==='car')return P.inCar?'Sair do jipe':V.ok?'Entrar no jipe':'Jipe do Tião (sem bateria)';
  return '';
}
function doInteract(){
  if(G.struggle){strugglePump();return;}
  const pr=G.prompt; if(!pr)return;
  const o=pr.o;
  if(pr.k==='pick')return takePickup(o);
  if(pr.k==='npc')return UI.npc(o);
  if(pr.k==='comp')return STORY.compTalk(o);
  if(pr.k==='gate')return useGate(o);
  if(pr.k==='car')return P.inCar?exitCar():enterCar();
  if(pr.k==='unhide')return exitHide();
  switch(o.type){
    case 'hide': return enterHide(o);
    case 'typewriter': if(G.wave>0||G.heli){toast('Não dá tempo de escrever agora.');return;} return UI.save();
    case 'box': return UI.box();
    case 'fuse':
      if(G.flags.fuse){toast('O quadro de força já está ligado.');return;}
      if(invCount('fusivel')>0){invRemove('fusivel',1);G.flags.fuse=true;if(typeof invalidateRect==='function')invalidateRect(o.tx,o.ty,1,1);const g=gates.find(g=>g.id==='arsenal');if(g)openGate(g);AU.unlock();toast('Você encaixou o fusível. A trava do arsenal abriu.');}
      else toast('O quadro está sem fusível. A trava do arsenal não tem energia.');
      return;
    case 'cofre':
      if(G.flags.cofre){toast('O cofre está vazio.');return;}
      return UI.keypad('cofre');
    case 'vitrine': if(G.flags.vitrine){toast('A vitrine está vazia.');return;} return UI.keypad('vitrine');
    case 'disjuntor': return toggleBreaker(o);
    case 'gerador': return STORY.gerador();
    case 'guindaste': return STORY.guindaste();
    case 'janela': return breakWindow(o,true);
    case 'som': return STORY.som(o);
    case 'bondinho': return STORY.bondinho(o);
    case 'bondMA': return STORY.bondMA(o);
    case 'bondinho2': return STORY.bondinho2(o);
    case 'geradorL': return STORY.geradorL(o);
    case 'onibus': return STORY.onibus(o);
    case 'cctv': return STORY.cctv(o);
    case 'sino': return STORY.sino(o);
    case 'painelShop': return STORY.painelShop();
    case 'radio':
      if(G.flags.radio){toast('O helicóptero já está a caminho.');return;}
      return UI.radio();
    default: if(typeof v12Interact==='function')return v12Interact(o);
  }
}
function useGate(g){
  if(g.open)return;
  if(g.id==='deposito')return UI.keypad('deposito');
  if(g.id==='bloqueio'&&invCount('dinamite')>0&&!G.flags.bloqWeak)return STORY.plantDina(g);
  if(g.id==='hospOut'&&!G.flags.matheusJoin){toast('Eu não saio daqui sem o Matheus.');AU.locked();return;}
  if(g.id==='hospIn'&&!g.open&&G.flags.hospLock&&!G.flags.hospOut)return STORY.hospFrontTry();
  if(g.id==='hospOut'&&!g.open&&G.flags.matheusJoin&&invCount('alicate')>0)return STORY.hospChain(g);
  if(!g.key){toast(g.msg);AU.locked();if(g.id==='bloqueio')STORY.bloqueioLook();return;}
  if(invCount(g.key)>0){
    invRemove(g.key,1); openGate(g); G.flags[g.id]=true; AU.unlock(); G.shake+=5;
    if(g.id==='hospOut')STORY.hospExit();
    toast(`Você usou ${ITEMS[g.key].n}. ${g.name} aberto.`);
  } else {toast(g.msg);AU.locked();}
}
function takePickup(p){
  if(p.kind==='item'){
    const it=ITEMS[p.id]; const left=invAdd(p.id,p.q);
    if(left===p.q){toast('Não cabe na maleta. Largue algo ou guarde no baú de um abrigo.');AU.locked();return;}
    const got=p.q-left;
    toast(`Pegou ${it.n}${got>1?' ×'+got:''}${left?` (ficaram ${left})`:''}.`);
    AU.pickup();
    if(left>0){p.q=left;if(p.uid!=null)(G.flags.pq||(G.flags.pq={}))[p.uid]=left;return;}
    if(p.id==='garrafa'&&invCount('gran')<=0)P.thr='garrafa'; if(p.id==='gran'&&!P.thr)P.thr='gran';
    ambush(p.id); STORY.onPickup(p.id);
  } else if(p.kind==='weapon'){
    G.flags.armed=true;
    if(p.id===0){const had=P.owned[0];P.owned[0]=true;P.dur=Math.min(60,(P.dur||0)+p.q);if(!had||WEAPONS[P.w].melee)P.w=0;AU.pickup();
      toast(had?`Mais uma faca. Ela aguenta ${P.dur} golpes.`:`Pegou uma faca de cozinha. Aguenta uns ${P.dur} golpes antes de quebrar.`);}
    else{if(typeof wpnLimit==='function')wpnLimit(p);const first=!P.owned[p.id];P.owned[p.id]=true; P.mags[p.id]=Math.max(P.mags[p.id],p.q); P.w=p.id; AU.pickup(); AU.reload();
      toast(`Pegou ${WEAPONS[p.id].n}.${IN.touch?'':` Tecla ${p.id===9?0:p.id+1} para equipar.`}${WEAPONS[p.id].noise===0?' Ela não faz barulho.':''}`);
      if(first&&p.id===1)STORY.firstGun();}
  } else if(p.kind==='file'){
    G.files.add(p.id); AU.paper(); UI.doc(p.id,null,()=>STORY.onFile(p.id)); if(G.files.size>=DOCS.length)ach('arquivos');
  } else if(p.kind==='bag'){
    G.slots=Math.min(16,G.slots+2); while(G.inv.length<G.slots)G.inv.push(null); AU.pickup();
    toast('Bolsinha de couro: +2 espaços na mochila.');
  } else if(p.kind==='walkie'){
    AU.pickup(); G.flags.walkie=true; toast('Rádio comunicador. Está ligado num canal só de chiado.');
    setTimeout(()=>{if(G.mode==='play'||G.mode==='menu')STORY.radioFirst();},700);
  }
  G.taken.add(p.uid); pickups=pickups.filter(x=>x!==p); pickOcc.delete(idx(p.tx,p.ty));
}
function spawnRing(n,type,minD,maxD,alerted){
  let made=0;
  for(let i=0;i<n;i++){const sp=spawnPoint(minD,maxD,false,true);if(!sp)continue;const e=makeEnemy(type,sp.x,sp.y,null);
    if(ETYPES[type].blind){e.heard=6;e.nx=P.x;e.ny=P.y;e.state='chase';}else if(alerted!==false){e.state='chase';e.hunt=true;e.huntT=25;}enemies.push(e);made++;}
  return made;
}
function ambush(id){
  switch(id){
    case 'fusivel':G.blackout=9;spawnRing(3,'corr',280,460);toast('As luzes da Avenida se apagaram de uma vez.');AU.thud(.6);break;
    case 'bateria':G.light=.5;G.thunderT=.4;spawnRing(3,'cao',360,520);spawnRing(2,'zumbi',260,420);laterF(()=>{toast('Latidos vindo da Avenida do Estado...');},700);break;
    case 'gato':spawnRing(2,'rast',200,320,false);break;
    case 'heliKey':G.blackout=10;spawnRing(3,'esfol',240,440);spawnRing(2,'zumbi',200,360);toast('O laboratório ficou completamente escuro.');AU.roar();break;
  }
}
function closeGate(g){if(!g||!g.open)return;g.open=false;MAPV++;for(let j=g.y;j<g.y+g.h;j++)for(let i=g.x;i<g.x+g.w;i++){const k=idx(i,j);under[k]=g.under;map[k]=g.steel?T.SHUTTER:T.GATE;}if(typeof invalidateRect==='function')invalidateRect(g.x,g.y,g.w,g.h);
  // quem ficou em cima do portão é empurrado para dentro
  for(const o of [P,...enemies]){if(!o||o.alive===false)continue;const tx=(o.x/TILE)|0,ty=(o.y/TILE)|0;if(tx>=g.x&&tx<g.x+g.w&&ty>=g.y&&ty<g.y+g.h){const [x,y]=freeTileNear(tx,ty,true);o.x=tc(x);o.y=tc(y);}}}
// disjuntor: apaga as luzes de um prédio inteiro (fica mais fácil passar despercebido lá dentro)
function powerOn(bi){return bi==null||bi<0||G.flags['pw'+bi]!==false;}
function lightOn(l){if(l.off)return false;if(lampOff(l))return false;if(l.bc&&G.ev&&G.ev.silent&&((l.x*7+l.y*3)|0)%5>1)return false;if(l.b!=null&&!powerOn(l.b))return false;return true;}
function toggleBreaker(it){
  const bi=it.b, b=buildings[bi]; if(!b)return; const on=powerOn(bi); G.flags['pw'+bi]=!on;
  AU.click(); AU.thud(.4); G.flick=.25; if(typeof invalidateRect==='function')invalidateRect(b.x,b.y,b.w,b.h);
  toast(on?`Você desligou a luz${b.name?' do '+b.name:''}. Lá dentro agora é só a lanterna.`:`A luz${b.name?' do '+b.name:''} voltou.`);
  if(on&&!G.flags.brkTip){G.flags.brkTip=true;laterF(()=>{bark('rafa','t','No escuro eles não me enxergam. Só não posso fazer barulho.');},700);}
}
// janela: dá pra quebrar e pular por ela (faz barulho)
function breakWindow(it,byPlayer){
  if(it.broken)return; it.broken=true; const b=buildings[bmap[idx(it.tx,it.ty)]];
  setT(it.tx,it.ty,b?b.floor:T.TILEF); if(typeof invalidateRect==='function')invalidateRect(it.tx,it.ty,1,1);
  interacts.splice(interacts.indexOf(it),1); G.flags['jan'+it.tx+'_'+it.ty]=true; if(b&&b.wins){const w=b.wins.find(w=>w.x===it.tx&&w.y===it.ty);if(w){w.broken=true;}}
  for(let i=0;i<16;i++)parts.push({k:'debris',x:it.x+rr(-8,8),y:it.y+rr(-8,8),vx:rr(-140,140),vy:rr(-140,140),life:.5,max:.5,s:rr(1.5,3),c:'#b8d0dc'});
  addDecal({k:'glass',x:it.x,y:it.y,r:14,rot:Math.random()*6,seed:Math.random()});
  AU.glass(clamp(1-hyp(it.x-P.x,it.y-P.y)/900,.2,1)); alertNoise(it.x,it.y,byPlayer?520:420); flowTile=-1;
  if(byPlayer){P.inv=Math.max(P.inv,.2);if(Math.random()<.35){P.hp=Math.max(1,P.hp-6);G.hurt=Math.min(1,G.hurt+.3);toast('Você se cortou no vidro.');}}
}
function spawnInBuilding(bi,n,minD,maxD){
  const b=buildings[bi]; if(!b)return 0; let made=0;
  for(let t=0;t<60&&made<n;t++){const x=b.x+ri(1,b.w-2),y=b.y+ri(1,b.h-2),k=idx(x,y);if(SOLID[map[k]]||flow[k]<0)continue;const d=hyp(tc(x)-P.x,tc(y)-P.y);if(d<minD||d>maxD)continue;
    const e=makeEnemy(Math.random()<.3?'corr':'zumbi',tc(x),tc(y),null);e.state='chase';e.hunt=true;e.huntT=20;e.rising=.6;enemies.push(e);made++;}
  return made;
}
function spawnBoss(type,x,y,uid,hunt){
  if(G.killed.has(uid)||enemies.some(e=>e.uid===uid&&e.alive))return null;
  const e=makeEnemy(type,x,y,uid); e.home={x,y}; if(hunt){e.state='chase';e.hunt=true;e.huntT=45;} enemies.push(e); return e;
}
function toggleCrouch(){if(P.inCar||P.hidden)return;P.crouch=!P.crouch;AU.hide(.3);if(P.crouch&&!G.flags.crouchTip){G.flags.crouchTip=true;toast('Agachado: mais lento, sem barulho de passo e mais difícil de ver no escuro.');}}
function attachSil(){if(!P.owned[1]){toast('Precisa de uma pistola pra rosquear o silenciador.');return;}if(P.sil>=30){toast('O silenciador da pistola ainda está bom.');return;}if(!invRemove('silenciador',1))return;P.sil=40;AU.reload();toast('Silenciador encaixado na pistola: uns 40 tiros quase sem barulho.');}
function toggleLamp(){
  if(P.bat<=0&&!P.lamp){toast('A lanterna está sem carga. Use pilhas na mochila.');AU.dry();return;}
  P.lamp=!P.lamp;AU.click();
}
// detector de presença: mostra o que se MEXE perto (até ~15 m), gasta pilha
function toggleDetector(){
  if(invCount('detector')<=0){toast('Você não tem um detector.');return;}
  if(!G.detOn&&P.det<=0){if(invRemove('pilha',1)){P.det=100;}else{toast('O detector está sem pilha.');AU.dry();return;}}
  G.detOn=!G.detOn;AU.click();if(G.detOn){AU.beep(.8,900);G.detT=0;}else G.blips=[];
  if(G.detOn&&!G.flags.detTip){G.flags.detTip=true;toast('Detector ligado: pontos vermelhos são coisas se mexendo. Parado, ele não pega.');}
}
const DET_R=480;
function updDetector(dt){
  if(!G.detOn)return;
  if(invCount('detector')<=0){G.detOn=false;G.blips=[];return;}
  P.det-=dt*.42;
  if(P.det<=0){
    if(invRemove('pilha',1)){P.det=100;toast('Pilha nova no detector.');AU.reload();}
    else{P.det=0;G.detOn=false;G.blips=[];toast('O detector apagou. Sem pilha.');AU.dry();return;}
  }
  for(const b of G.blips)b.a-=dt*.9; G.blips=G.blips.filter(b=>b.a>0);
  G.detT-=dt; if(G.detT>0)return;
  let nd=9999;
  for(const e of enemies){
    if(!e.alive)continue; const d=hyp(e.x-P.x,e.y-P.y);
    const mv=e.dpx==null?0:hyp(e.x-e.dpx,e.y-e.dpy); e.dpx=e.x;e.dpy=e.y;
    if(d>DET_R||e.state==='dorm')continue;
    if(mv<5&&e.state!=='feed')continue;
    G.blips.push({x:e.x,y:e.y,a:1,big:bigE(e)||e.type==='ouvinte'}); if(d<nd)nd=d;
  }
  G.detT=nd<160?.4:nd<320?.65:.9;
  if(nd<9999)AU.beep(clamp(1-nd/DET_R,.25,1),nd<160?1900:nd<320?1500:1150); else AU.beep(.15,700);
}
function usePilha(){
  if(invCount('pilha')<=0){toast('Você não tem pilhas.');return false;}
  if(P.bat>=99){toast('A lanterna já está carregada.');return false;}
  invRemove('pilha',1);P.bat=100;P.lamp=true;G.batWarn=false;AU.reload();toast('Lanterna carregada.');return true;
}
function gameAct(){const F=G.flags||{};return F.inibidorDone?3:F.bloqueio?2:1;}
function dropItem(x,y){
  const act=gameAct(), id=rpick(act===1?['pilha','ervaV','pilha','polv','m9']:act===2?['m9','ervaV','pilha','cart','polv','virote']:['m9','m9','cart','ervaV','polv','polvF','m9','cart','pilha']);
  const q=id==='m9'?ri(4,8):id==='cart'?2:1;
  const tx=(x/TILE)|0,ty=(y/TILE)|0; if(SOLID[getT(tx,ty)])return;
  pickups.push({uid:'d'+(G.dropN++),tx,ty,x,y,id,q,kind:'item'});
}
function objective(){
  const has=id=>invCount(id)>0, F=G.flags, E=G.ev||{};
  if(G.heli)return {t:G.heli.landed?'Corra para o helicóptero!':'O helicóptero está pousando. Aguente!',at:LM.pad};
  if(F.radio)return {t:`Defenda o heliponto até o resgate: ${Math.ceil(G.wave)} s`,at:null};
  if(E.posto&&E.posto.t>0)return {t:`VAZAMENTO! Saia de perto do posto: ${Math.ceil(E.posto.t)} s`,at:LM.oficina};
  if(F.hospLock&&!F.hospOut){
    if(!F.matheusJoin)return {t:'Trancado no Santa Clara. Ache o Matheus no isolamento. Ande devagar: ela escuta.',at:LM.isol};
    if(!has('alicate'))return {t:'Ache o alicate de corte na manutenção. Garrafas jogadas longe distraem ela.',at:LM.alicate};
    return {t:'Corte a corrente da saída dos fundos do hospital',at:LM.hospExit};
  }
  if(F.shopEv&&!F.boss_especime&&!F.shopOpen){
    if(!has('chaveMaq'))return {t:'Trancado no shopping. Pegue a chave da casa de máquinas na sala da segurança — ou derrube o Espécime.',at:LM.seguranca};
    return {t:'Destrave as portas no painel da casa de máquinas, na ala de serviço (sul)',at:LM.painelShop};
  }
  const armed=P.owned.slice(0,8).some(x=>x);
  if(!armed&&!F.armed)return {t:'Ache algo para se defender. A Dona Cida falou da cozinha do prédio em frente.',at:LM.faca1};
  if(!F.jipe){
    if(!F.metTiao)return {t:'Encontre o Tião na oficina da Barra Sul. Lanterna apagada, passo leve.',at:LM.oficina};
    if(!P.owned[1]&&!has('bateria')){
      if(!F.fuse){if(!has('fusivel'))return {t:'Ache o fusível no Supermercado Bom Preço',at:LM.mercado};return {t:'Encaixe o fusível no quadro de força da Delegacia',at:LM.fusebox};}
      return {t:'Pegue a pistola do arsenal da Delegacia',at:LM.arsenal};
    }
    if(!has('bateria'))return {t:F.deposito?'Pegue a bateria no depósito da conveniência':'A bateria está no depósito da conveniência do posto. O cadeado tem três números: o bilhete do Juninho dá a pista.',at:LM.posto};
    return {t:'Leve a bateria para o Tião, na oficina',at:LM.oficina};
  }
  if(!F.bloqueio){
    if(V.dead)return {t:F.tiaoMorto?'O jipe pegou fogo. Volte à oficina: tem peças no depósito do Tião.':'O jipe pegou fogo. Volte à oficina: o Tião ainda tem peças.',at:LM.oficina};
    if(F.needDina&&!F.bloqWeak){
      const inBox=G.box.some(b=>b.id==='dinamite');
      if(!has('dinamite')&&!F.dinaPlanted&&!inBox){
        if(!F.bondRide)return {t:'Pegue o bondinho na estação da Barra Sul até a Praia das Laranjeiras. O Seu Ivo tem dinamite.',at:LM.bondinho};
        return {t:'Desça a trilha da Mata Atlântica até a colônia de pescadores das Laranjeiras',at:LM.colonia};
      }
      if(!F.laranjGone&&F.ivoMet&&dAt((P.x/TILE)|0,(P.y/TILE)|0)===8){
        if(!F.geradorL)return {t:'Religue o bondinho: o gerador auxiliar fica na cozinha do Rancho das Laranjeiras',at:LM.geradorL};
        return {t:'Volte para a estação Laranjeiras do bondinho. RÁPIDO.',at:LM.bondL};
      }
      if(G.ev&&G.ev.fuse)return {t:`Pavio aceso! Saia de perto: ${Math.ceil(G.ev.fuse.t)} s`,at:null};
      if(!has('dinamite')&&inBox)return {t:'A dinamite ficou no baú. Pegue no baú de um abrigo (a oficina tem um).',at:LM.oficina};
      return {t:'Plante a dinamite na barricada da Estrada da Rainha, no fim da Barra Norte',at:gateCenter('bloqueio')};
    }
    if(!P.inCar)return {t:F.eduJoin?'Balneário está desmoronando. Entre no jipe com o Edu':'Entre no jipe do Tião',at:{x:V.x,y:V.y}};
    return {t:F.bloqWeak?'A barricada abriu. Passe com o jipe pela Estrada da Rainha':'Arrebente a barricada da Estrada da Rainha, no fim da Barra Norte (acelere!)',at:gateCenter('bloqueio')};
  }
  if(!F.metHelena)return {t:'Siga pela Estrada da Rainha até a Clínica da Brava',at:LM.clinica};
  if(!F.clinicPower){
    if(has('diesel'))return {t:'Abasteça o gerador da Clínica da Brava',at:LM.gerador};
    if(!F.maqResort&&!has('cartaoMestre'))return {t:G.files.has(22)?'O cartão mestre do gerente está no quarto 107 do resort':'Ache um jeito de entrar na casa de máquinas do Resort Brava Mar. Comece pela recepção.',at:G.files.has(22)?LM.quarto107:LM.recepcao};
    return {t:'Pegue o diesel na casa de máquinas do resort',at:LM.maqResort};
  }
  if(!F.inibidorDone){
    if(!has('inibidor')){
      if(F.eduVan&&!F.detGot)return {t:'O Edu achou uma van da Vértice na doca do shopping. Fale com ele.',at:LM.van};
      if(!F.transfer)return {t:'Volte para Balneário: o inibidor V-7 está na farmácia do Hospital Ruth Cardoso, ala leste',at:LM.farmacia};
      if(!F.shopEv)return {t:'A Vértice levou o V-7 para a Drogaria do Shopping Atlântico. Vá até lá.',at:LM.grade};
      return {t:'Pegue a ampola de V-7 que caiu na drogaria',at:LM.shopFarm};
    }
    if(F.eduVan)return {t:'Busque o Edu na van da Vértice e volte para a Helena',at:LM.van};
    return {t:'Leve o inibidor para a Helena, na Clínica da Brava',at:LM.clinica};
  }
  if(!F.vertice)return {t:'Abra o bloqueio da Vértice em Cabeçudas',at:gateCenter('vertice')};
  if(!F.matheusJoin)return {t:'O Matheus está preso no Hospital Santa Clara, no centro de Itajaí. Entre devagar.',at:F.hospLock?LM.isol:LM.hospIt};
  if(!F.heli){
    if(!has('heliKey'))return {t:'Ache o cartão do heliponto no Laboratório Vértice, no Porto de Itajaí',at:LM.lab};
    if(!F.conteiner)return {t:'Contêineres tombados bloqueiam o heliponto. O Matheus sabe operar o guindaste.',at:LM.guindaste};
    return {t:'Abra o portão do heliponto do Porto',at:gateCenter('heli')};
  }
  return {t:'Use o rádio do heliponto para chamar o resgate',at:LM.radio};
}
function startWave(){
  G.flags.radio=true; G.wave=90; G.spawnT=2; AU.radio(); G.banner={t:'Aguente 90 segundos',life:3.5};
  toast('"Recebido. Helicóptero a caminho. Mantenham o heliponto seguro."');
  G.flags.persOn=true;
  G.persT=Math.min(G.persT,8);
  G.ev.shipT=5;
}
// ===================== CONQUISTAS =====================
const ACH=[
  {id:'jipe',n:'Ronco do motor',d:'Faça o jipe do Tião funcionar.'},
  {id:'bloqueio',n:'Pé no fundo',d:'Arrebente a barricada da Estrada da Rainha.'},
  {id:'atropelo',n:'Faixa de pedestre',d:'Atropele 25 infectados numa partida.'},
  {id:'besta',n:'Silêncio na Brava',d:'Derrube 10 infectados com a besta.'},
  {id:'esquiva',n:'Corpo mole',d:'Escape de 15 golpes com a esquiva.'},
  {id:'afogado',n:'Maré cheia',d:'Derrote 10 Afogados.'},
  {id:'mingau',n:'Mingau voltou',d:'Devolva o gato da Dona Cida.'},
  {id:'cofre',n:'4072',d:'Abra o cofre do Banco Popular.'},
  {id:'arquivos',n:'Arquivista',d:`Leia os ${DOCS.length} arquivos.`},
  {id:'pers',n:'Ele sempre levanta',d:'Derrube o Perseguidor 3 vezes.'},
  {id:'boss',n:'Fim da Abominação',d:'Derrote a Abominação no heliponto.'},
  {id:'furtivo',n:'Ninguém em casa',d:'Esconda-se 10 vezes numa partida.'},
  {id:'b_gordo',n:'Posto fechado',d:'Derrote o Frentista.'},
  {id:'b_pescador',n:'Rede vazia',d:'Derrote o Pescador.'},
  {id:'b_especime',n:'Sem testemunhas',d:'Derrote o Espécime no Shopping Atlântico.'},
  {id:'manequim',n:'Não pisque',d:'Quebre 5 manequins.'},
  {id:'noite',n:'Vigília',d:'Atravesse uma noite inteira sem descansar num abrigo.'},
  {id:'heroi',n:'Ninguém fica pra trás',d:'Salve 3 sobreviventes perseguidos.'},
  {id:'onibus',n:'Ônibus 22',d:'Abra o ônibus preso na rodoviária.'},
  {id:'bombeiro',n:'Fogo amigo',d:'Derrube o Bombeiro.'},
  {id:'sino',n:'Pelo que os sinos dobram',d:'Toque o sino da Matriz em Itajaí.'},
  {id:'tiao',n:'A luz verde',d:'Sobreviva à volta do bondinho.'},
  {id:'cctv',n:'Câmera 3',d:'Veja as câmeras do condomínio da Brava.'},
  {id:'fuga',n:'Último voo',d:'Escape do litoral.'},
  {id:'dificil',n:'Sem anestesia',d:'Escape no Difícil.'},
  {id:'rankS',n:'Entrega expressa',d:'Escape com rank S.'},
];
const ACHS=new Set((()=>{try{return JSON.parse(localStorage.getItem('ps-ach')||'[]');}catch(e){return [];}})());
function ach(id){
  if(ACHS.has(id))return; const a=ACH.find(a=>a.id===id); if(!a)return;
  ACHS.add(id); try{localStorage.setItem('ps-ach',JSON.stringify([...ACHS]));}catch(e){}
  G.achPop={n:a.n,life:4}; AU.ach(); buzz([20,40,20]);
}
function stat(k,n,goal,id){G.st[k]=(G.st[k]||0)+n;if(goal&&G.st[k]>=goal)ach(id);}
function toast(t){G.toasts.push({t,life:3.4});if(G.toasts.length>4)G.toasts.shift();}

// ===================== FÍSICA =====================
function blocked(tx,ty,en){if(!inb(tx,ty))return true;const k=idx(tx,ty);if(SOLID[map[k]])return true;if(en&&safeMask[k])return true;return false;}
function resolve(e,en){
  const r=e.cr||e.r; let hit=false;
  const x0=Math.floor((e.x-r)/TILE),x1=Math.floor((e.x+r)/TILE),y0=Math.floor((e.y-r)/TILE),y1=Math.floor((e.y+r)/TILE);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    if(!blocked(tx,ty,en))continue;
    const rx=tx*TILE,ry=ty*TILE; const cx=clamp(e.x,rx,rx+TILE),cy=clamp(e.y,ry,ry+TILE);
    const dx=e.x-cx,dy=e.y-cy,d2=dx*dx+dy*dy; if(d2>=r*r)continue; hit=true;
    if(d2<1e-6){const l=e.x-rx,rg=rx+TILE-e.x,t=e.y-ry,b=ry+TILE-e.y,m=Math.min(l,rg,t,b);
      if(m===l)e.x=rx-r;else if(m===rg)e.x=rx+TILE+r;else if(m===t)e.y=ry-r;else e.y=ry+TILE+r;continue;}
    const d=Math.sqrt(d2),p=r-d; e.x+=dx/d*p; e.y+=dy/d*p;
  }
  return hit;
}
function move(e,dx,dy,en){e.x+=dx;const a=resolve(e,en);e.y+=dy;const b=resolve(e,en);return a||b;}
function los(x0,y0,x1,y1){
  const d=hyp(x1-x0,y1-y0),n=Math.ceil(d/12);
  for(let i=1;i<n;i++){const x=x0+(x1-x0)*i/n,y=y0+(y1-y0)*i/n;if(LIGHT_BLOCK[map[idx((x/TILE)|0,(y/TILE)|0)]])return false;}
  return true;
}
function castRay(x,y,a,max,blockArr,stopEnemies){
  const c=Math.cos(a),s=Math.sin(a); let d=0;
  const near=stopEnemies?enemies.filter(e=>e.alive&&!(e.stalker&&e.down>0)&&hyp(e.x-x,e.y-y)<max+30):null;
  while(d<max){
    d+=6; const px=x+c*d,py=y+s*d; const tx=(px/TILE)|0,ty=(py/TILE)|0;
    if(!inb(tx,ty)||blockArr[map[idx(tx,ty)]])return d;
    if(near)for(const e of near){if(Math.abs(e.x-px)<e.r&&Math.abs(e.y-py)<e.r&&hyp(e.x-px,e.y-py)<e.r)return d;}
  }
  return max;
}
function buildFlow(){
  flow.fill(-1);
  const sx=(P.x/TILE)|0,sy=(P.y/TILE)|0,s=idx(sx,sy);
  let h=0,t=0; flow[s]=0; flowQ[t++]=s;
  while(h<t){
    const k=flowQ[h++],d=flow[k]; if(d>=60)continue;
    const x=k%W,y=(k/W)|0;
    for(const [dx,dy] of DIRS4){
      const nx=x+dx,ny=y+dy; if(!inb(nx,ny))continue; const nk=idx(nx,ny);
      if(flow[nk]!==-1||SOLID[map[nk]]||safeMask[nk])continue;
      flow[nk]=d+1; flowQ[t++]=nk;
    }
  }
}
function buildNoiseFlow(x,y){
  const sx=(x/TILE)|0,sy=(y/TILE)|0; if(!inb(sx,sy))return;
  if(Math.abs(sx-nfOx)+Math.abs(sy-nfOy)<3&&G.time-nfT<1.5)return;
  nfOx=sx;nfOy=sy;nfT=G.time;nfId++;
  nflow.fill(-1); const s=idx(sx,sy); let h=0,t=0; nflow[s]=0; flowQ[t++]=s;
  while(h<t){
    const k=flowQ[h++],d=nflow[k]; if(d>=48)continue;
    const x0=k%W,y0=(k/W)|0;
    for(const [dx,dy] of DIRS4){
      const nx=x0+dx,ny=y0+dy; if(!inb(nx,ny))continue; const nk=idx(nx,ny);
      if(nflow[nk]!==-1||SOLID[map[nk]]||safeMask[nk])continue;
      nflow[nk]=d+1; flowQ[t++]=nk;
    }
  }
}
function flowDir(e,arr=flow){
  const tx=(e.x/TILE)|0,ty=(e.y/TILE)|0; if(!inb(tx,ty))return null;
  const k=idx(tx,ty); let best=arr[k]>=0?arr[k]:9999,bx=0,by=0,found=false;
  for(const [dx,dy] of DIRS8){
    const nx=tx+dx,ny=ty+dy; if(!inb(nx,ny))continue; const f=arr[idx(nx,ny)];
    if(f<0||f>=best)continue;
    if(dx&&dy&&(blocked(tx+dx,ty,true)||blocked(tx,ty+dy,true)))continue;
    best=f;bx=nx;by=ny;found=true;
  }
  if(!found)return null;
  return [tc(bx)-e.x,tc(by)-e.y];
}

// ===================== JOGADOR =====================
function updPlayer(dt){
  readInput(dt);
  if(P.inCar){updCar(dt);P.cool-=dt;P.inv-=dt;return;}
  P.dodgeCd-=dt;
  if(P.grab){const g=P.grab;g.t-=dt;P.moving=false;P.firing=false;P.cool=Math.max(P.cool,.1);G.shake=Math.max(G.shake,1.2);
    if(!g.e||!g.e.alive){P.grab=null;}else if(g.t<=0)releaseGrab(false);
    return;}
  if(P.hidden){P.hideT+=dt;P.st=Math.min(100,P.st+20*dt);P.cool-=dt;P.inv-=dt;P.moving=false;P.running=false;P.firing=false;
    if(P.hideT>.45&&hyp(IN.mx,IN.my)>.65)exitHide();return;}
  if(P.dodge>0){
    P.dodge-=dt; P.dodgeIF=(P.dodgeIF||0)-dt; move(P,P.dvx*dt,P.dvy*dt,false); P.legAng=P.dAng; P.walk+=dt*22; P.moving=true; P.cool=Math.max(P.cool,.05); P.inv-=dt;
    if(Math.random()<dt*30)parts.push({k:'smoke',x:P.x+rr(-5,5),y:P.y+rr(-5,5),vx:rr(-15,15),vy:rr(-15,15),life:.35,max:.35,s:rr(3,6),c:'#34322f'});
    return;
  }
  let mx=IN.mx,my=IN.my; const raw=hyp(mx,my); const len=Math.min(1,raw); if(raw>0){mx/=raw;my/=raw;}
  if(IN.aimAng!=null){
    let a=IN.aimAng;
    let best=null,bd=.18;
    for(const e of enemies){if(!e.alive||(e.stalker&&e.down>0))continue;const d=hyp(e.x-P.x,e.y-P.y);if(d>520)continue;
      const ea=Math.atan2(e.y-P.y,e.x-P.x),df=Math.abs(angDiff(a,ea));if(df<bd&&los(P.x,P.y,e.x,e.y)){bd=df;best=ea;}}
    if(best!=null)a=best;
    P.ang=a;
  } else if(IN.mouseOn){
    const wx=cam.x+IN.mouseX/view.z, wy=cam.y+IN.mouseY/view.z; P.ang=Math.atan2(wy-P.y,wx-P.x);
  } else if(len>.15){P.ang+=angDiff(P.ang,Math.atan2(my,mx))*Math.min(1,dt*10);}
  P.firing=IN.fire;
  const running=IN.run&&len>.15&&!P.firing&&!P.tired&&P.reloading<=0;
  if(running&&P.crouch)P.crouch=false;
  if(running){P.st-=22*dt;if(P.st<=0){P.st=0;P.tired=true;}}
  else{P.st=Math.min(100,P.st+(P.moving?14:22)*dt);if(P.tired&&P.st>35)P.tired=false;}
  let spd=(running?130:P.crouch?46:78)*DBG.speed; if(P.firing||P.reloading>0)spd*=.62; if(P.hp<P.max*.3)spd*=.8;
  if(DBG.noclip){P.x=clamp(P.x+mx*len*spd*dt*2,32,W*TILE-32);P.y=clamp(P.y+my*len*spd*dt*2,32,HT*TILE-32);}
  else move(P,mx*len*spd*dt,my*len*spd*dt,false);
  if(P.lamp&&P.bat>0){P.bat=Math.max(0,P.bat-dt*.5);if(P.bat<20&&!G.batWarn){G.batWarn=true;toast('A lanterna está fraca. Pilhas carregam na mochila.');}if(P.bat<=0){P.lamp=false;toast('A lanterna apagou.');AU.dry();}}
  if(running){G.noiseT-=dt;if(G.noiseT<=0){G.noiseT=.35;alertNoise(P.x,P.y,240);}}
  if(P.hp<P.max*.3&&len>.15&&Math.random()<dt*2.5)addDecal({k:'drop',x:P.x+rr(-5,5),y:P.y+rr(-5,5),r:rr(1.5,3)});
  P.moving=len>.15; P.running=running;
  if(P.legAng==null)P.legAng=P.ang;
  let lt=P.ang, back=false;
  if(P.moving){lt=Math.atan2(my,mx);if(Math.abs(angDiff(P.ang,lt))>2.0){lt+=Math.PI;back=true;}}
  P.legAng+=angDiff(P.legAng,lt)*Math.min(1,dt*(P.moving?14:6));
  P.walk+=len*dt*(running?15:10)*(back?-1:1);
  P.cool-=dt; P.inv-=dt; P.slash=Math.max(0,P.slash-dt); P.recoil=Math.max(0,P.recoil-dt*30);
  if(P.reloading>0){P.reloading-=dt;if(P.reloading<=0)finishReload();}
  if(P.firing)fire();
  if(P.moving&&!inSafe()&&!P.crouch){G.stepT=(G.stepT||0)-dt*(running?1.6:1);if(G.stepT<=0){G.stepT=.42;AU.step();}}
}
// esconderijos: armário, caçamba, carro abandonado
function enterHide(it){
  if(P.inCar||P.hidden||P.grab)return;
  if(enemies.some(e=>e.alive&&hyp(e.x-P.x,e.y-P.y)<e.r+P.r+14&&e.state==='chase')){toast('Não dá tempo. Ele está em cima de você.');return;}
  // de noite, em Balneário, às vezes o armário já tem dono
  if(it.kind==='armario'&&!it.empty&&isNight()&&G.flags.hideTip&&dAt(it.tx,it.ty)>=5&&Math.random()<.17&&!DBG.god){
    it.empty=true;
    const a=Math.atan2(P.y-it.y,P.x-it.x)||0, z=makeEnemy('zumbi',P.x-Math.cos(a)*22,P.y-Math.sin(a)*22,null); z.state='chase'; z.lx=P.x; z.ly=P.y; z.face=a; enemies.push(z);
    P.grab={e:z,t:1.9,n:0,need:P.owned[0]&&P.dur>0?3:(G.diff==='dificil'?8:6)}; z.grabbing=true; hurtPlayer(6,z.x,z.y); P.inv=0;
    AU.sting(); AU.scream(1); G.shake+=9; G.flick=.35; buzz([60,40,120]);
    bark('rafa','s','TINHA ALGUÉM DENTRO DO ARMÁRIO!');
    return;
  }
  it.empty=true;
  P.hidden=it; P.hideT=0; P.hx=P.x; P.hy=P.y; P.x=it.x; P.y=it.y; P.reloading=0; P.dodge=0;
  let seen=0;
  for(const e of enemies){if(!e.alive)continue;
    if(e.sees&&hyp(e.x-P.x,e.y-P.y)<480){e.sawHide=true;seen++;}
    else if(e.state==='chase'||e.hunt){e.state='search';e.st=rr(4,7);e.lx=P.hx;e.ly=P.hy;}}
  AU.hide(1); buzz(15); stat('hide',1,10,'furtivo');
  if(!G.flags.hideTip){G.flags.hideTip=true;toast(IN.touch?'Escondido. Mexa o direcional para sair.':'Escondido. Ande ou aperte E para sair.');}
  if(seen)laterF(()=>{if(P.hidden)bark('rafa','s','Ele me viu entrar... ele me viu entrar.');},400);
}
function exitHide(forced){
  if(!P.hidden)return; const it=P.hidden; P.hidden=null;
  let x=P.hx,y=P.hy; const tx=(x/TILE)|0,ty=(y/TILE)|0;
  if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]]){const t=freeTileNear(it.tx,it.ty,true);x=tc(t[0]);y=tc(t[1]);}
  P.x=x;P.y=y;const t2={x,y,r:P.r};resolve(t2,false);P.x=t2.x;P.y=t2.y;
  AU.hide(forced?1.4:.7); P.inv=Math.max(P.inv,.4);
  for(const e of enemies)e.sawHide=false;
}
// esquiva: rolamento curto, invulnerável, gasta fôlego
function dodge(){
  if(P.hidden){exitHide();return;}
  if(P.inCar||G.mode!=='play'||P.dodge>0||P.dodgeCd>0)return;
  const stk=Math.min(4,G.time-(P.lastDodge??-99)<3.2?(P.dStack||0)+1:0), cost=28+stk*14;
  if(P.st<cost){toast(stk?'Sem fôlego. As pernas não respondem.':'Sem fôlego para esquivar.');return;}
  P.dStack=stk; P.lastDodge=G.time;
  let mx=IN.mx,my=IN.my,l=hyp(mx,my); let a=l>.2?Math.atan2(my,mx):P.ang+Math.PI;
  const pw=470/(1+stk*.3);
  P.dodge=.26; P.dodgeIF=stk>=3?0:.14; P.dodgeCd=.7+stk*.55; P.st-=cost; P.dvx=Math.cos(a)*pw; P.dvy=Math.sin(a)*pw; P.dAng=a; P.reloading=0; P.dodged=false;
  if(stk>=2){P.tired=true;toast(stk>=3?'Você tropeçou. Esquivar sem parar cansa.':'Ofegante...');}
  AU.swish(); buzz(12);
  for(let i=0;i<6;i++)parts.push({k:'smoke',x:P.x+rr(-6,6),y:P.y+rr(-6,6),vx:-P.dvx*.1+rr(-20,20),vy:-P.dvy*.1+rr(-20,20),life:.4,max:.4,s:rr(4,7),c:'#3a3734'});
}
function switchWeapon(i){
  if(i<0||i>=WEAPONS.length||!P.owned[i]||i===P.w)return;
  P.w=i; P.reloading=0; P.cool=.25; AU.click();
}
function cycleWeapon(dir){
  for(let k=1;k<=WEAPONS.length;k++){const i=(P.w+dir*k+WEAPONS.length*3)%WEAPONS.length;if(P.owned[i]){switchWeapon(i);return;}}
}
function reload(){
  if(P.inCar||P.hidden)return;
  const w=WEAPONS[P.w]; if(w.melee||P.reloading>0)return;
  if(P.mags[P.w]>=w.mag)return;
  if(invCount(w.ammo)<=0&&!DBG.ammo){toast(`Sem ${ITEMS[w.ammo].n.toLowerCase()} na mochila.`);AU.dry();return;}
  P.reloading=w.reload; P.reloadW=P.w; AU.reload();
}
function finishReload(){
  const w=WEAPONS[P.reloadW]; if(P.reloadW!==P.w)return;
  if(DBG.ammo){P.mags[P.w]=w.mag;AU.click();return;}
  const take=Math.min(w.mag-P.mags[P.w],invCount(w.ammo)); invRemove(w.ammo,take); P.mags[P.w]+=take; AU.click();
}
function fire(){
  const w=WEAPONS[P.w]; if(P.cool>0||P.reloading>0)return;
  if(w.melee){melee();P.cool=w.rate;return;}
  if(P.mags[P.w]<=0&&!DBG.ammo){AU.dry();P.cool=.3;if(invCount(w.ammo)>0)reload();else if(!G.dryMsg||G.time-G.dryMsg>3){G.dryMsg=G.time;toast('Sem munição. Troque de arma ou recarregue.');}return;}
  if(!DBG.ammo)P.mags[P.w]--; P.cool=w.rate;
  const a=P.ang, c=Math.cos(a), s=Math.sin(a);
  const tx=P.x+c*(14+w.len), ty=P.y+s*(14+w.len);
  if(w.flame){
    for(let k=0;k<2;k++){const aa=a+rr(-.13,.13),sp=rr(330,420);
      projs.push({k:'f',x:P.x+c*20,y:P.y+s*20,vx:Math.cos(aa)*sp,vy:Math.sin(aa)*sp,dmg:w.dmg,life:rr(.45,.6),r:5,hit:new Set()});}
    G.muzzle={x:tx,y:ty,t:.06,c:'fire'}; if(Math.random()<.3)AU.flame();
  } else if(w.explosive){
    projs.push({k:'g',x:tx,y:ty,vx:c*w.speed,vy:s*w.speed,dmg:w.dmg,life:.9});
    G.muzzle={x:tx,y:ty,t:.08,c:'shot'}; AU.shot('lgran');
  } else {
    for(let i=0;i<w.pellets;i++){
      const aa=a+(Math.random()-.5)*w.spread*(P.moving?1.5:1)*(1+(G.fear||0)*.9)*(P.crouch&&!P.moving?.7:1), sp=w.speed*rr(.92,1.05);
      projs.push({k:'b',x:tx-c*8,y:ty-s*8,vx:Math.cos(aa)*sp,vy:Math.sin(aa)*sp,dmg:w.dmg,life:w.life,pierce:w.pierce||0,knock:w.knock,crit:w.crit,hit:null,bolt:!!w.bolt});
    }
    const sil=w.id==='pistola'&&P.sil>0;
    if(w.bolt){AU.swish();}else if(sil){G.muzzle={x:tx,y:ty,t:.03,c:'fire'};AU.shot('sil');}else{G.muzzle={x:tx,y:ty,t:.05,c:'shot'}; AU.shot(w.id);}
    if(!w.bolt)parts.push({k:'shell',x:P.x+c*8-s*6,y:P.y+s*8+c*6,vx:-s*rr(60,110)+c*rr(-20,20),vy:c*rr(60,110)+s*rr(-20,20),life:.5,max:.5,s:2,c:'#c9a24a',rot:Math.random()*6});
    for(let i=0;i<3;i++)parts.push({k:'spark',x:tx,y:ty,vx:c*rr(80,240)+rr(-40,40),vy:s*rr(80,240)+rr(-40,40),life:.12,max:.12,s:2,c:'#ffd27a'});
  }
  P.recoil=w.kick; G.shake+=w.kick*.35;
  const silenced=w.id==='pistola'&&P.sil>0;
  if(silenced){P.sil--;alertNoise(P.x,P.y,70);if(P.sil===0){toast('O silenciador gastou. A pistola volta a fazer barulho.');AU.dry();}}
  else if(w.noise){alertNoise(P.x,P.y,w.noise);G.lastLoud=G.time;}
}
function melee(){
  const wpn=WEAPONS[P.w], knife=wpn.id==='faca', a=P.ang; let hit=false;
  for(const e of enemies){
    if(!e.alive||(e.stalker&&e.down>0))continue;
    const d=hyp(e.x-P.x,e.y-P.y); if(d>(knife?46:40)+e.r)continue;
    if(Math.abs(angDiff(a,Math.atan2(e.y-P.y,e.x-P.x)))>.85)continue;
    const big=bigE(e);
    if(knife){hurtEnemy(e,wpn.dmg,Math.cos(a)*140,Math.sin(a)*140,{crit:.15});e.stun=Math.max(e.stun,.3);}
    else{hurtEnemy(e,wpn.dmg,Math.cos(a)*(big?30:320),Math.sin(a)*(big?30:320),{});if(!big)e.stun=Math.max(e.stun,.75);}
    hit=true;
  }
  P.slash=.16; AU.swish(); if(hit)AU.hit();
  if(knife&&hit){P.dur--; if(P.dur<=0){P.dur=0;P.owned[0]=false;P.w=8;toast('A faca quebrou. Você está de mãos vazias.');AU.dry();buzz(40);}else if(P.dur===5)toast('A faca está quase quebrando.');}
  alertNoise(P.x,P.y,hit?170:90);
}
function curThrow(){const a=P.thr||'gran';if(invCount(a)>0||DBG.ammo)return a;for(const b of ['gran','garrafa','rojao','sinal'])if(invCount(b)>0)return b;return a;}
function throwGrenade(){
  if(P.inCar||P.hidden)return;
  const id=curThrow();
  if(invCount(id)<=0&&!DBG.ammo){toast('Nada para arremessar. Garrafas vazias servem pra distrair.');return;}
  if(!DBG.ammo||id==='garrafa')invRemove(id,1);
  let dist=id==='garrafa'?330:280;
  if(IN.mouseOn){const wx=cam.x+IN.mouseX/view.z,wy=cam.y+IN.mouseY/view.z;dist=clamp(hyp(wx-P.x,wy-P.y),60,id==='garrafa'?480:420);}
  const c=Math.cos(P.ang),s=Math.sin(P.ang),sp=dist*1.9;
  if((id==='rojao'||id==='sinal')&&typeof v12Throw==='function')return v12Throw(id,dist);
  if(id==='garrafa'){projs.push({k:'bt',x:P.x+c*14,y:P.y+s*14,vx:c*dist/.75,vy:s*dist/.75,fuse:.75,life:2,spin:0});AU.swish();if(!G.flags.btTip){G.flags.btTip=true;toast('A garrafa quebra onde cair. Quem não enxerga vai até o barulho.');}return;}
  projs.push({k:'h',x:P.x+c*14,y:P.y+s*14,vx:c*sp,vy:s*sp,fuse:1.2,life:5,spin:0}); AU.swish();
}
function bottleBreak(p){
  p.dead=true; AU.glass(clamp(1-hyp(p.x-P.x,p.y-P.y)/900,.25,1));
  for(let i=0;i<14;i++)parts.push({k:'debris',x:p.x,y:p.y,vx:rr(-120,120),vy:rr(-120,120),life:.45,max:.45,s:rr(1.5,2.6),c:Math.random()<.5?'#6a9a7a':'#b8d0c0'});
  addDecal({k:'glass',x:p.x,y:p.y,r:12,rot:Math.random()*6,seed:Math.random()});
  alertNoise(p.x,p.y,640);
  const o=enemies.find(e=>e.alive&&e.type==='ouvinte'&&hyp(e.x-p.x,e.y-p.y)<640);
  if(o){G.btl=(G.btl||[]).filter(t=>G.time-t<45);G.btl.push(G.time);
    if(G.btl.length>=2&&Math.random()<.75){o.nx=P.x+rr(-90,90);o.ny=P.y+rr(-90,90);o.heard=4;o.hot=false;
      if(!G.flags.ouvLearn){G.flags.ouvLearn=true;laterF(()=>bark('rafa','s','Ela não foi atrás do vidro... ela tá vindo pra cá. Ela aprendeu.',{dur:2.4}),600);}}}
}
// barulho: quem ouve vai conferir o ponto (paredes abafam pela metade)
function alertNoise(x,y,r){
  let need=false;
  for(const e of enemies){
    if(!e.alive||e.type==='manequim')continue; const d=hyp(e.x-x,e.y-y); if(d>=r)continue;
    if(e.state==='hide'&&d>120)continue;
    if(e.type==='ouvinte'){if(d<r*.85){e.heard=6;e.nx=x+rr(-20,20);e.ny=y+rr(-20,20);e.hot=true;}continue;}
    if(d>r*.5&&!los(e.x,e.y,x,y))continue;
    if(e.state==='dorm'){if(d<r*.45)riseEnemy(e,x,y);continue;}
    if(e.state==='feed'){if(d<r*.6){e.state='investigate';e.nx=x;e.ny=y;e.it=10;need=true;}continue;}
    if(e.hunt)continue;
    if(e.t.blind){e.heard=4.5;e.nx=x;e.ny=y;if(e.state!=='chase'){e.state='chase';AU.hiss(e);}need=true;continue;}
    if(e.state==='chase'&&e.sees)continue;
    const j=Math.min(40,d*.06);
    if(e.state!=='investigate'&&e.state!=='chase'&&d<700)AU.groan(e,.45);
    e.state='investigate'; e.nx=x+rr(-j,j); e.ny=y+rr(-j,j); e.it=10; e.stk=0; need=true;
  }
  if(need)buildNoiseFlow(x,y);
}
function riseEnemy(e,x,y){if(e.state!=='dorm')return;e.state='chase';e.lx=x??P.x;e.ly=y??P.y;e.lost=.01;e.rising=.8;e.stun=.8;AU.groan(e,1);G.shake+=1.5;}
function hurtPlayer(dmg,fx,fy){
  if(G.mode!=='play'||DBG.god)return;
  if(P.inCar){if(V.hurtT>G.time)return;V.hurtT=G.time+.35;V.hp-=dmg*.55;G.shake+=2;AU.thud(.35);return;}
  if(P.dodge>0&&(P.dodgeIF||0)>0){if(!P.dodged){P.dodged=true;stat('dodge',1,15,'esquiva');floaters.push({x:P.x,y:P.y-22,t:'ESQUIVOU',life:.7});}return;}
  if(P.inv>0)return;
  G.hitDirs.push({a:Math.atan2(fy-P.y,fx-P.x),life:.9});
  dmg*=G.D.dmg; P.hp-=dmg; P.inv=.55; G.hurt=Math.min(1,G.hurt+.6); G.shake+=5;
  const a=Math.atan2(P.y-fy,P.x-fx); move(P,Math.cos(a)*14,Math.sin(a)*14,false);
  bloodBurst(P.x,P.y,8,a); AU.hurt(); buzz(35);
  if(P.hp<=0){P.hp=0;die();}
}
function die(){G.mode='dead';AU.death();setTimeout(()=>UI.dead(),900);}

// ===================== JIPE =====================
function carTop(){return G.flags&&G.flags.inibidorDone?330:245;}
function carBlocked(tx,ty){if(!inb(tx,ty))return true;const k=idx(tx,ty),t=map[k];if(SOLID[t]||t===T.WATER)return true;if(bmap[k]>=0)return true;return false;}
function enterCar(){
  if(V.dead){toast('O jipe está destruído.');return;}
  if(!V.ok){toast(G.flags.metTiao?'Sem bateria. O Tião precisa de uma bateria nova.':'Um jipe velho, sem bateria. Deve ser de alguém da oficina.');AU.locked();return;}
  P.inCar=true; P.reloading=0; V.spd=0; AU.init(); AU.unlock(); AU.engine(.4);
  if(!G.flags.droveOnce){G.flags.droveOnce=true;toast(IN.touch?'Use o direcional para dirigir. Toque em USAR para sair.':'WASD para dirigir, H buzina. E para sair.');STORY.firstDrive();}
}
function exitCar(force){
  if(!P.inCar)return;
  if(!force&&Math.abs(V.spd)>60){toast('Pare o jipe antes de sair.');return;}
  const c=Math.cos(V.ang),s=Math.sin(V.ang);
  const opts=[[-s*30,c*30],[s*30,-c*30],[-c*38,-s*38],[c*38,s*38],[-s*44,c*44],[s*44,-c*44]];
  let ok=false;
  for(const [ox,oy] of opts){
    const x=V.x+ox,y=V.y+oy,tx=(x/TILE)|0,ty=(y/TILE)|0;
    if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]])continue;
    P.x=x;P.y=y;const t={x,y,r:P.r};resolve(t,false);P.x=t.x;P.y=t.y;ok=true;break;
  }
  if(!ok&&!force){toast('Não tem espaço para abrir a porta.');return;}
  P.inCar=false; V.spd=0; AU.engine(0); P.inv=.6;
}
function carCollide(o){
  const r=V.r; let hit=null;
  const x0=Math.floor((o.x-r)/TILE),x1=Math.floor((o.x+r)/TILE),y0=Math.floor((o.y-r)/TILE),y1=Math.floor((o.y+r)/TILE);
  for(let ty=y0;ty<=y1;ty++)for(let tx=x0;tx<=x1;tx++){
    if(!carBlocked(tx,ty))continue;
    const rx=tx*TILE,ry=ty*TILE,cx=clamp(o.x,rx,rx+TILE),cy=clamp(o.y,ry,ry+TILE);
    const dx=o.x-cx,dy=o.y-cy,d2=dx*dx+dy*dy; if(d2>=r*r)continue;
    hit=hit||{tx,ty};
    if(d2<1e-6){o.x-=Math.cos(V.ang)*2;o.y-=Math.sin(V.ang)*2;continue;}
    const d=Math.sqrt(d2),p=r-d;o.x+=dx/d*p;o.y+=dy/d*p;
  }
  return hit;
}
function ramGate(hit){
  if(!hit)return false;
  const g=gates.find(g=>!g.open&&hit.tx>=g.x&&hit.tx<g.x+g.w&&hit.ty>=g.y&&hit.ty<g.y+g.h);
  if(!g||g.id!=='bloqueio')return false;
  if(!G.flags.bloqWeak){if(Math.abs(V.spd)>60){V.spd*=-.35;V.hp-=18;G.shake+=12;AU.thud(1);buzz(80);if(!G.ev.ramT||G.time-G.ev.ramT>4){G.ev.ramT=G.time;toast('O jipe bateu e voltou. Tem um caminhão-tanque atravessado atrás dos carros. Só explodindo.');}}return true;}
  if(Math.abs(V.spd)<145){toast('Mais rápido! Pegue distância e acelere.');return false;}
  openGate(g); G.flags.bloqueio=true; G.flags.persOn=true; G.persT=Math.min(G.persT,30);
  V.hp-=70; V.spd*=.45; G.shake+=22; AU.boom(.8); AU.thud(1); buzz(160); G.hs=.12; ach('bloqueio');
  for(let i=0;i<40;i++){const a=Math.random()*6.28,sp=rr(80,320);parts.push({k:'debris',x:V.x+Math.cos(V.ang)*30,y:V.y+Math.sin(V.ang)*30,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,life:rr(.4,.9),max:.9,s:rr(2,4),c:Math.random()<.5?'#6a6660':'#8a6a3a'});}
  alertNoise(V.x,V.y,1100); STORY.bloqueio(); return true;
}
function updCar(dt){
  let mx=IN.mx,my=IN.my; const raw=hyp(mx,my),len=Math.min(1,raw);
  const t=getT((V.x/TILE)|0,(V.y/TILE)|0);
  const grip=t===T.SAND?.55:(t===T.GRASS||t===T.DIRT||t===T.GRAVEL)?.8:1;
  let target=0;
  if(len>.2){
    const ia=Math.atan2(my,mx), diff=angDiff(V.ang,ia);
    const rev=V.spd<30&&Math.abs(diff)>1.95 || V.spd<0&&Math.abs(diff)>1.2;
    const turn=2.7*clamp(Math.abs(V.spd)/110,.18,1);
    if(rev){const d2=angDiff(V.ang,ia+Math.PI);V.ang+=clamp(d2,-turn*dt,turn*dt);target=-150*len;}
    else{V.ang+=clamp(diff,-turn*dt,turn*dt);target=carTop()*len*grip*(1-Math.min(.45,Math.abs(diff)/3.2));}
  }
  const acc=(target===0)?230:(Math.sign(target)!==Math.sign(V.spd)&&Math.abs(V.spd)>5)?480:(G.flags.inibidorDone?250:190);
  if(V.spd<target)V.spd=Math.min(target,V.spd+acc*dt);else V.spd=Math.max(target,V.spd-acc*dt);
  if(Math.abs(V.spd)>carTop()*grip+20)V.spd*=Math.pow(.3,dt);
  const vx=Math.cos(V.ang)*V.spd,vy=Math.sin(V.ang)*V.spd;
  const steps=Math.max(1,Math.ceil(Math.abs(V.spd)*dt/10));
  let hit=null;
  for(let i=0;i<steps;i++){V.x+=vx*dt/steps;V.y+=vy*dt/steps;const h=carCollide(V);if(h){hit=h;break;}}
  if(hit&&!ramGate(hit)){
    const sp=Math.abs(V.spd);
    if(sp>140){V.hp-=sp*.06;G.shake+=sp/40;buzz(30);AU.thud(clamp(sp/360,.2,1));for(let i=0;i<6;i++)parts.push({k:'spark',x:V.x+Math.cos(V.ang)*18,y:V.y+Math.sin(V.ang)*18,vx:rr(-140,140),vy:rr(-140,140),life:.2,max:.2,s:2,c:'#ffd27a'});}
    V.spd*=-.25;
  }
  // atropelar
  for(const e of enemies){
    if(!e.alive||(e.stalker&&e.down>0))continue;
    const d=hyp(e.x-V.x,e.y-V.y); if(d>V.r+e.r+6)continue;
    const a=Math.atan2(e.y-V.y,e.x-V.x), sp=Math.abs(V.spd);
    if(sp>90&&e.type!=='boss'&&!e.stalker&&!e.t.boss){
      if(e.hitCar&&G.time-e.hitCar<.4)continue; e.hitCar=G.time;
      const heavy=e.type==='brut'||e.type==='incha';
      hurtEnemy(e,sp*(heavy?.3:.48),Math.cos(a)*sp*1.1,Math.sin(a)*sp*1.1,{});
      if(e.alive){e.stun=Math.max(e.stun,.9);}else stat('run',1,25,'atropelo');
      buzz(15);
      V.spd*=heavy?.55:.86; V.hp-=heavy?14:3; G.shake+=3; AU.thud(.7);
      bloodBurst(e.x,e.y,10,a);
    } else {
      e.x=V.x+Math.cos(a)*(V.r+e.r+6); e.y=V.y+Math.sin(a)*(V.r+e.r+6); resolve(e,true);
      if(sp>60&&(e.type==='boss'||e.stalker||e.t.boss)){V.spd*=-.3;V.hp-=sp*.12;G.shake+=8;AU.thud(1);}
    }
  }
  P.x=V.x; P.y=V.y; P.ang=V.ang; P.legAng=V.ang; P.moving=false; P.running=false; P.firing=false;
  P.st=Math.min(100,P.st+18*dt);
  V.engT-=dt; if(V.engT<=0){V.engT=.5;alertNoise(V.x,V.y,240+Math.abs(V.spd)*.9);}
  if(IN.fire||IN.horn){if(V.hornT<=0){V.hornT=.9;AU.horn();alertNoise(V.x,V.y,900);}}
  V.hornT-=dt;
  AU.engine(.25+Math.abs(V.spd)/330*.75);
  if(Math.abs(V.spd)>200&&Math.random()<dt*20)parts.push({k:'smoke',x:V.x-Math.cos(V.ang)*22,y:V.y-Math.sin(V.ang)*22,vx:rr(-10,10),vy:rr(-10,10),life:.6,max:.6,s:rr(4,7),c:'#3a3734'});
  if(V.hp<V.max*.35&&Math.random()<dt*8)parts.push({k:'smoke',x:V.x+Math.cos(V.ang)*16,y:V.y+Math.sin(V.ang)*16,vx:rr(-10,10),vy:rr(-40,-15),life:1.2,max:1.2,s:rr(6,10),c:'#2c2a28'});
  if(V.hp<=0&&!V.dead){V.dead=true;V.hp=0;explode(V.x,V.y,90,60);exitCar(true);toast('O jipe pegou fogo. Agora é a pé.');lights.push({x:V.x,y:V.y,r:190,c:'fire',f:1});}
}

// ===================== INIMIGOS =====================
function hurtEnemy(e,dmg,kx,ky,o={}){
  if(!e.alive)return; if(e.stalker&&e.down>0)return;
  if(e.type==='ouvinte'){e.flash=.08;e.heard=6;e.nx=P.x;e.ny=P.y;e.hot=true;if(!G.flags.ouvBullet){G.flags.ouvBullet=true;toast('As balas não fazem nada. Ela só escuta.');}return;}
  if(e.state==='feed'){e.state='chase';e.lx=P.x;e.ly=P.y;}
  let crit=false; if(o.crit&&Math.random()<o.crit){dmg*=2.5;crit=true;floaters.push({x:e.x,y:e.y-e.r-6,t:'CRÍTICO',life:.8});}
  e.hp-=dmg; e.flash=.08; if(crit&&e.hp<=0)e.headshot=true;
  const km=e.type==='boss'||e.t.boss?.05:e.type==='brut'||e.stalker?.25:1; e.vx+=kx*km; e.vy+=ky*km;
  if(o.burn)e.burn=Math.max(e.burn,3);
  if(e.state==='dorm')riseEnemy(e); else if(e.t.blind){e.heard=4;e.nx=P.x;e.ny=P.y;e.state='chase';} else if(!e.sees){e.state='chase';e.lx=P.x;e.ly=P.y;e.lost=.01;e.face=Math.atan2(P.y-e.y,P.x-e.x);}
  if(!o.burn)bloodBurst(e.x,e.y,4,Math.atan2(ky,kx));
  if(e.hp<=0)killEnemy(e);
}
function killEnemy(e,self){
  if(e.stalker){
    if(e.down>0)return;
    e.down=e.type==='bombeiro'?14:24; e.hp=0; e.burn=0; G.shake+=6; AU.thud(1);
    toast(e.type==='bombeiro'?'O Bombeiro caiu. Ele vai se levantar. Corre.':'O Perseguidor caiu. Ele vai se levantar.'); if(e.type==='pers')stat('persDown',1,3,'pers'); else ach('bombeiro'); G.hs=.18;
    const id=rpick(['m9','cart','m357','ervaV']); const tx=(e.x/TILE)|0,ty=(e.y/TILE)|0;
    if(!SOLID[getT(tx,ty)])pickups.push({uid:'d'+(G.dropN++),tx,ty,x:e.x,y:e.y,id,q:id==='m9'?20:id==='cart'?6:id==='m357'?4:1,kind:'item'});
    return;
  }
  e.alive=false; G.kills++; if(e.uid)G.killed.add(e.uid);
  if(e.type==='afog')stat('afog',1,10,'afogado');
  if(e.type==='manequim'){stat('man',1,5,'manequim');for(let i=0;i<14;i++)parts.push({k:'debris',x:e.x,y:e.y,vx:rr(-150,150),vy:rr(-150,150),life:.6,max:.6,s:rr(2,4),c:'#d8cfc0'});AU.thud(.6);}
  if(e.uid==='zelador'){const tx=(e.x/TILE)|0,ty=(e.y/TILE)|0;const [x,y]=freeTileNear(tx,ty,true);pickups.push({uid:'chDir',tx:x,ty:y,x:tc(x),y:tc(y),id:'chaveDir',q:1,kind:'item'});laterF(()=>{bark('rafa','t','O molho de chaves do seu Valdir... desculpa, seu Valdir.');},500);}
  if(e.type==='soldado'){const id=Math.random()<.7?'m9':'cart';const tx=(e.x/TILE)|0,ty=(e.y/TILE)|0;if(!SOLID[getT(tx,ty)])pickups.push({uid:'d'+(G.dropN++),tx,ty,x:e.x,y:e.y,id,q:id==='m9'?ri(4,8):2,kind:'item'});}
  if(e.t.boss){
    G.flags['boss_'+e.type]=true; ach('b_'+e.type); G.hs=.3; G.shake+=18; AU.boom(.8); AU.roar(); buzz(200);
    G.banner={t:e.t.n+' caiu',life:3};
    for(let i=0;i<50;i++){const a=Math.random()*6.28,s=rr(60,320);parts.push({k:'blood',x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.3,.8),max:.8,s:rr(2,5),c:e.type==='gordo'?'#7a8a2a':'#8a1a14'});}
    for(let i=0;i<5;i++)addDecal({k:'blood',x:e.x+rr(-36,36),y:e.y+rr(-36,36),r:rr(14,30),rot:Math.random()*6,seed:Math.random()});
    if(e.type==='gordo'){hazards.push({x:e.x,y:e.y,r:140,life:9,max:9,dps:14});if(hyp(P.x-e.x,P.y-e.y)<160)hurtPlayer(28,e.x,e.y);AU.splat();}
    const drops={gordo:[['m9',12,'item'],['ervaV',1,'item']],enferm:[['spray',1,'item'],['cart',6,'item']],pescador:[[3,30,'weapon'],['m9',40,'item'],['gran',2,'item'],['ervaR',1,'item']],especime:[['spray',1,'item'],['m9',15,'item'],['cart',4,'item']]}[e.type]||[];
    for(const [id,q,kind] of drops){const [x,y]=freeTileNear((e.x/TILE)|0,(e.y/TILE)|0,true);pickups.push({uid:'d'+(G.dropN++),tx:x,ty:y,x:tc(x),y:tc(y),id,q,kind});pickOcc.add(idx(x,y));}
    STORY.bossDown(e.type);
  }
  if(e.type==='brut'||e.type==='esfol')G.hs=Math.max(G.hs,.07);
  if(e.type==='boss'){
    G.flags.bossDead=true; ach('boss'); G.hs=.35; G.shake+=20; AU.boom(1); AU.roar(); G.banner={t:'A Abominação caiu',life:3};
    for(let i=0;i<60;i++){const a=Math.random()*6.28,s=rr(60,360);parts.push({k:'blood',x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.3,.8),max:.8,s:rr(2,5),c:'#8a1a14'});}
    for(let i=0;i<6;i++)addDecal({k:'blood',x:e.x+rr(-40,40),y:e.y+rr(-40,40),r:rr(14,30),rot:Math.random()*6,seed:Math.random()});
    for(const id of ['spray','m357']){const [x,y]=freeTileNear((e.x/TILE)|0,(e.y/TILE)|0,true);pickups.push({uid:'d'+(G.dropN++),tx:x,ty:y,x:tc(x),y:tc(y),id,q:id==='m357'?8:1,kind:'item'});}
  }
  if(e.type!=='manequim')addDecal({k:'corpse',x:e.x,y:e.y,rot:Math.random()*6.28,type:e.type,col:e.t.col,skin:e.t.skin,r:e.r});
  addDecal({k:'blood',x:e.x+rr(-6,6),y:e.y+rr(-6,6),r:e.r*rr(1,1.6),rot:Math.random()*6.28,seed:Math.random()});
  bloodBurst(e.x,e.y,16,Math.random()*6.28);
  if(e.type!=='manequim'){const n=e.headshot?3:Math.random()<.5?1:0;for(let i=0;i<n;i++)addDecal({k:'gib',x:e.x+rr(-26,26),y:e.y+rr(-26,26),r:rr(3,5),rot:Math.random()*6.28,c:i?e.t.col:e.t.skin});
    if(e.headshot){for(let i=0;i<22;i++){const a=Math.random()*6.28,s=rr(80,300);parts.push({k:'blood',x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.2,.5),max:.5,s:rr(1.5,3.5),c:Math.random()<.5?'#7a1712':'#c8b8a8'});}G.shake+=2;}
    if(Math.random()<.18)addDecal({k:'drag',x:e.x,y:e.y,rot:Math.random()*6.28,seed:Math.random()});}
  AU.die(e.type);
  if(e.type==='incha'){
    hazards.push({x:e.x,y:e.y,r:72,life:7,max:7,dps:12});
    for(let i=0;i<26;i++){const a=Math.random()*6.28,s=rr(40,220);parts.push({k:'acid',x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.3,.7),max:.7,s:rr(2,4),c:'#9cc23a'});}
    if(hyp(P.x-e.x,P.y-e.y)<78)hurtPlayer(self?20:12,e.x,e.y);
    AU.splat();
  }
  if(Math.random()<[.05,.1,.22][gameAct()-1])dropItem(e.x,e.y);
}
function spit(e){
  const a=Math.atan2(P.y-e.y,P.x-e.x)+rr(-.08,.08);
  projs.push({k:'s',x:e.x+Math.cos(a)*e.r,y:e.y+Math.sin(a)*e.r,vx:Math.cos(a)*300,vy:Math.sin(a)*300,dmg:e.t.dmg,life:1.6});
  AU.spit(e);
}
function updEnemy(e,dt){
  const dx=P.x-e.x,dy=P.y-e.y,d=hyp(dx,dy)||1;
  if(d>1700&&!e.stalker)return;
  e.anim+=dt; e.flash=Math.max(0,e.flash-dt); e.atk-=dt; e.c2-=dt; e.hitAnim=Math.max(0,e.hitAnim-dt);
  if(e.stalker&&e.down>0){
    e.down-=dt; if(e.down<=0){e.hp=e.max;AU.roar();toast(e.type==='bombeiro'?'O Bombeiro se levantou.':'O Perseguidor se levantou.');}
    return;
  }
  if(e.burn>0){
    e.burn-=dt; e.hp-=11*dt;
    if(Math.random()<dt*16)parts.push({k:'fire',x:e.x+rr(-e.r,e.r),y:e.y+rr(-e.r,e.r),vx:rr(-15,15),vy:rr(-40,-10),life:.4,max:.4,s:rr(4,7),c:'#ff8a2a'});
    if(e.hp<=0){killEnemy(e);if(!e.alive)return;}
  }
  if(e.rising>0)e.rising-=dt;
  if(e.type==='manequim'){updManequim(e,dt,d,dx,dy);return;}
  if(e.type==='ouvinte'){updOuvinte(e,dt,d,dx,dy);return;}
  if(e.state==='feed'){
    // comendo alguém: não presta atenção em nada até você chegar perto ou fazer barulho
    e.anim+=dt*2; e.chewT=(e.chewT||rr(1,3))-dt; if(e.chewT<=0){e.chewT=rr(1.4,3);if(d<420){AU.splat();if(Math.random()<.5)bloodBurst(e.x+Math.cos(e.feedA)*12,e.y+Math.sin(e.feedA)*12,3,Math.random()*6);}}
    if((d<(lampOn()?150:110)&&!inSafe()&&!P.hidden)||e.flash>0){e.state='chase';e.lx=P.x;e.ly=P.y;e.lost=.01;e.rising=.5;AU.groan(e,1);AU.sting();G.shake+=2;}
    return;
  }
  if(e.grabbing){if(!P.grab||P.grab.e!==e){e.grabbing=false;}else{const a=Math.atan2(e.y-P.y,e.x-P.x);e.x=P.x+Math.cos(a)*(e.r+P.r-2);e.y=P.y+Math.sin(a)*(e.r+P.r-2);e.face=a+Math.PI;e.hitAnim=.3;e.anim+=dt*2;return;}}
  if(e.state==='dorm'){if((d<72&&!inSafe())||e.flash>0)riseEnemy(e);else return;}
  if(e.stun>0){e.stun-=dt;e.vx*=Math.pow(.02,dt);e.vy*=Math.pow(.02,dt);move(e,e.vx*dt,e.vy*dt,true);return;}
  const pSafe=G.pSafe;
  e.losT-=dt;
  if(e.losT<=0){
    e.losT=.2+Math.random()*.12; e.los=d<760&&los(e.x,e.y,P.x,P.y);
    // visão: precisa de linha livre, alcance e estar dentro do cone de visão (exceto bem perto ou já perseguindo)
    // visão curta: com a lanterna apagada (e fora da luz dos postes) só te veem quase encostando
    // de dia todo mundo está "iluminado": eles te veem de mais longe, com ou sem lanterna
    const dl=daylight(), lit=lampOn()||G.pLit||P.inCar||(dl>.55&&G.inB<0), boss=e.t.boss||e.type==='boss';
    let sr=(lit?e.t.sight*(boss?.95:.62)*(P.inCar?1.6:1)*(1+.3*dl):(e.type==='cao'?105:boss?120:62))*(G.wxSight||1);
    if(P.running)sr+=45; if(P.crouch&&!lit)sr*=.6; else if(P.crouch)sr*=.8;
    const close=(lit?64:40)*(P.crouch?.7:1), fov=e.state==='search'?1.6:e.state==='investigate'?1.25:1.0;
    const inCone=Math.abs(angDiff(e.face,Math.atan2(dy,dx)))<fov;
    const blinded=lampOn()&&d<300&&Math.abs(angDiff(P.ang,Math.atan2(-dy,-dx)))<.36;
    e.sees=!pSafe&&!P.hidden&&e.los&&!e.t.blind&&(d<close||(d<sr&&(inCone||e.state==='chase'&&e.lost<.01))||blinded);
    if(e.state==='chase'&&!e.sees)e.losL=los(e.x,e.y,e.lx,e.ly);
    if(e.state==='investigate')e.losN=los(e.x,e.y,e.nx,e.ny);
  }
  if(e.state==='hide'){
    if(d<95&&e.los&&!pSafe){e.state='chase';e.lunge=.55;e.lx=P.x;e.ly=P.y;AU.groan(e,1);} else return;
  }
  if(e.sawHide&&P.hidden){
    // viu você entrar: vai até o esconderijo e te arranca de lá
    e.state='chase';e.sees=false;e.lx=P.x;e.ly=P.y;e.lost=0;
    if(d<e.r+34&&e.atk<=0&&e.stun<=0){e.atk=1.2;e.sawHide=false;exitHide(true);hurtPlayer(e.t.dmg,e.x,e.y);G.shake+=6;AU.roar();toast('Ele te arrancou do esconderijo!');}
  } else if(P.hidden&&(e.hunt||e.state==='chase')){
    if(e.state!=='search'){e.state='search';e.st=rr(4,7);}
  } else if(e.hunt){
    if(!e.t.boss&&!e.stalker&&e.type!=='boss'){e.huntT-=dt;if(e.huntT<=0)e.hunt=false;}
    if(pSafe&&!e.stalker){e.lost+=dt;if(e.lost>2.5){e.state='wander';e.hunt=false;e.lost=0;}}
    else {e.state='chase';e.sees=e.los;e.lost=0;e.lx=P.x;e.ly=P.y;}
  } else if(e.t.blind){
    e.heard-=dt;
    if(e.state==='chase'&&e.heard<=0&&d>60){e.state='search';e.st=3;}
    if(e.state!=='chase'&&d<52&&!pSafe&&!P.hidden){e.state='chase';e.heard=3;e.nx=P.x;e.ny=P.y;AU.hiss(e);}
  } else {
    if(e.sees){
      if(e.state!=='chase'){e.state='chase';if(d<600)AU.groan(e,.8);}
      e.lx=P.x;e.ly=P.y;e.lost=0;
    } else if(e.state==='chase'){
      e.lost+=dt;
      if(pSafe&&e.lost>2.5||e.lost>9){e.state='search';e.st=3.5;e.lost=0;}
    }
    if(e.state==='chase'&&Math.random()<dt*.25&&d<520)AU.groan(e,.5);
  }
  let tx=0,ty=0,spd=e.t.spd*e.spdMul*(e.t.boss||e.type==='boss'||e.stalker?1:G.tmul);
  const toward=(x,y)=>{const ax=x-e.x,ay=y-e.y,l=hyp(ax,ay)||1;tx=ax/l;ty=ay/l;};
  const byFlow=(arr)=>{const f=flowDir(e,arr);if(f){const l=hyp(f[0],f[1])||1;tx=f[0]/l;ty=f[1]/l;return true;}return false;};
  if(e.prey&&e.prey.alive&&!e.sees&&e.state!=='chase'){
    // perseguindo um sobrevivente
    toward(e.prey.x,e.prey.y); const pd=hyp(e.prey.x-e.x,e.prey.y-e.y);
    if(pd<e.r+16&&e.atk<=0){e.atk=1.1;e.hitAnim=.3;e.prey.hp-=e.t.dmg;e.prey.hurt=.3;e.face=Math.atan2(e.prey.y-e.y,e.prey.x-e.x);bloodBurst(e.prey.x,e.prey.y,4,e.face);}
    e.it=10;
  } else if(e.state==='chase'){
    if(e.sawHide&&P.hidden){if(d<60)toward(P.x,P.y);else if(!byFlow(flow))toward(P.x,P.y);}
    else if(e.t.blind){
      if(e.los||d<40)toward(P.x,P.y); else if(!byFlow(flow))toward(P.x,P.y);
    } else if(e.sees||d<40||(e.hunt&&e.los)){toward(P.x,P.y);}
    else if(e.hunt){if(!byFlow(flow)){if(pSafe){tx=0;ty=0;}else toward(P.x,P.y);}}
    else{
      // perdeu de vista: vai até o último ponto onde viu o jogador
      const ld=hyp(e.lx-e.x,e.ly-e.y);
      if(ld<26){e.state='search';e.st=3.5;e.lost=0;}
      else if(e.losL)toward(e.lx,e.ly);
      else if(e.lost<1.6&&byFlow(flow)){}
      else toward(e.lx,e.ly);
      spd*=.85;
    }
    switch(e.type){
      case 'cusp':
        if(e.sees&&d<340){
          if(d<170){tx=-dx/d;ty=-dy/d;}
          else if(d<270){const s=e.strafe||(e.strafe=Math.random()<.5?1:-1);tx=-dy/d*s;ty=dx/d*s;spd*=.7;}
          if(e.c2<=0&&!pSafe){e.c2=2+Math.random()*1.2;spit(e);}
        }
        break;
      case 'brut':
        if(e.mode==='tele'){e.mt-=dt;tx=0;ty=0;if(e.mt<=0){e.mode='charge';e.mt=.8;e.cdx=Math.cos(e.face);e.cdy=Math.sin(e.face);}}
        else if(e.mode==='charge'){e.mt-=dt;tx=e.cdx;ty=e.cdy;spd=370;if(e.mt<=0){e.mode=null;e.c2=3.2;}}
        else if(e.sees&&d<300&&d>80&&e.c2<=0&&!pSafe){e.mode='tele';e.mt=.6;e.face=Math.atan2(dy,dx);AU.roar();}
        break;
      case 'incha':
        if(d<44&&!pSafe){killEnemy(e,true);return;}
        break;
      case 'rast':
        if(e.lunge>0){e.lunge-=dt;spd=215;}
        break;
      case 'grita':
        // para, enche o peito e grita: todo mundo em volta vem ver onde você está
        e.c3-=dt;
        if(e.mode==='scream'){e.mt-=dt;tx=0;ty=0;e.face=Math.atan2(dy,dx);if(e.mt<=0)e.mode=null;}
        else if(e.sees&&e.c3<=0&&!pSafe&&!P.hidden){
          e.c3=14;e.mode='scream';e.mt=1.2;AU.scream(1.4);G.shake+=5;buzz(70);alertNoise(P.x,P.y,1000);
          for(const o of enemies)if(o!==e&&o.alive&&!o.t.boss&&o.type!=='manequim'&&o.state!=='dorm'&&hyp(o.x-e.x,o.y-e.y)<950){o.state='investigate';o.nx=P.x+rr(-30,30);o.ny=P.y+rr(-30,30);o.it=12;o.stk=0;}
          spawnRing(2,'corr',460,660); buildNoiseFlow(P.x,P.y);
          if(!G.flags.gritaSeen){G.flags.gritaSeen=true;laterF(()=>{bark('rafa','s','Ela gritou... ela tá chamando os outros. Mata ela antes do grito!');},900);}
        }
        break;
      case 'esfol':{
        if(hyp(e.nx-P.x,e.ny-P.y)>90){const td=hyp(e.nx-e.x,e.ny-e.y);if(td<=20){tx=0;ty=0;}else if(td<60||los(e.x,e.y,e.nx,e.ny))toward(e.nx,e.ny);else if(!byFlow(nflow))toward(e.nx,e.ny);}
        if(e.mode==='leap'){e.mt-=dt;tx=e.cdx;ty=e.cdy;spd=430;if(e.mt<=0){e.mode=null;e.c2=2.2;}}
        else if(e.los&&d<190&&d>40&&e.c2<=0&&!pSafe&&e.heard>0){e.mode='leap';e.mt=.42;e.cdx=dx/d;e.cdy=dy/d;e.face=Math.atan2(dy,dx);AU.hiss(e);}
        break;}
      case 'gordo': case 'enferm': case 'pescador': case 'especime':{
        if(e.home&&!e.hunt&&hyp(e.x-e.home.x,e.y-e.home.y)>640){e.state='investigate';e.nx=e.home.x;e.ny=e.home.y;e.it=15;e.hp=Math.min(e.max,e.hp+e.max*.12);break;}
        e.c3-=dt;
        if(e.mode==='slamT'){e.mt-=dt;tx=0;ty=0;if(e.mt<=0){e.mode=null;e.c2=4.2;bossSlam(e);}break;}
        if(e.type==='enferm'){
          if(e.mode==='tele'){e.mt-=dt;tx=0;ty=0;if(e.mt<=0){e.mode='charge';e.mt=.75;e.cdx=Math.cos(e.face);e.cdy=Math.sin(e.face);}break;}
          if(e.mode==='charge'){e.mt-=dt;tx=e.cdx;ty=e.cdy;spd=400;if(e.mt<=0){e.mode=null;e.c3=3.5;}break;}
          if(e.sees&&d<360&&d>100&&e.c3<=0&&!pSafe){e.mode='tele';e.mt=.7;e.face=Math.atan2(dy,dx);AU.roar();break;}
        }
        if(e.type==='especime'){
          // salta em linha reta depois de se agachar; se errar e bater na parede, fica tonto
          if(e.mode==='tele'){e.mt-=dt;tx=0;ty=0;if(e.mt<=0){e.mode='leap';e.mt=.5;e.cdx=Math.cos(e.face);e.cdy=Math.sin(e.face);AU.hiss(e);}break;}
          if(e.mode==='leap'){e.mt-=dt;tx=e.cdx;ty=e.cdy;spd=540;if(e.mt<=0){e.mode=null;e.c3=2.4;}break;}
          if(e.sees&&d<430&&d>90&&e.c3<=0&&!pSafe){e.mode='tele';e.mt=.62;e.face=Math.atan2(dy,dx);AU.roar();break;}
          e.c4=(e.c4??7)-dt; if(e.c4<=0&&e.state==='chase'){e.c4=rr(11,15);AU.scream(1.2);G.shake+=6;if(!(G.ev&&G.ev.silent))spawnInBuilding(bmap[idx((e.x/TILE)|0,(e.y/TILE)|0)],2,220,480);alertNoise(e.x,e.y,700);}
        }
        if(e.c2<=0&&d<e.r+110&&!pSafe&&!P.hidden){e.mode='slamT';e.mt=.85;AU.roar();break;}
        if(e.type==='gordo'&&e.c3<=0&&e.sees&&d<330){e.c3=5.5;const a0=Math.atan2(dy,dx);for(let k=-3;k<=3;k++){const a=a0+k*.16+rr(-.04,.04);projs.push({k:'s',x:e.x+Math.cos(a)*e.r,y:e.y+Math.sin(a)*e.r,vx:Math.cos(a)*rr(190,250),vy:Math.sin(a)*rr(190,250),dmg:12,life:1.7});}AU.spit(e);AU.splat();}
        if(e.type==='pescador'&&e.c3<=0&&e.sees&&d<480){e.c3=7;const a0=Math.atan2(dy,dx);for(let k=-2;k<=2;k++){const a=a0+k*.2;projs.push({k:'s',x:e.x+Math.cos(a)*e.r,y:e.y+Math.sin(a)*e.r,vx:Math.cos(a)*270,vy:Math.sin(a)*270,dmg:14,life:2});}AU.splash(1);
          for(let i=0;i<2;i++){const sp2=spawnPoint(160,320,false,false);if(sp2){const a2=makeEnemy('afog',sp2.x,sp2.y,null);a2.rising=1;a2.stun=1;a2.state='chase';a2.hunt=true;a2.huntT=20;enemies.push(a2);}}}
        e.stepT-=dt; if(e.stepT<=0){e.stepT=e.type==='enferm'?.5:.75;AU.thud(clamp(1-d/800,0,1)*.7);if(d<360)G.shake+=1.2;}
        if(e.state==='chase'&&!e.roared){e.roared=true;AU.roar();STORY.bossSeen(e.type);}
        break;}
      case 'boss':{
        // a Abominação do navio: arrebenta tudo no caminho, arremessa pedaços de contêiner e fica pior pela metade da vida
        const rage=e.hp<e.max*.5; if(rage&&!e.raged){e.raged=true;e.spdMul=1.3;AU.roar();AU.roar();G.shake+=18;buzz(160);bark('rafa','s','Ela ficou pior! Ela tá destruindo o porto inteiro!');}
        if(e.mode==='slamT'){e.mt-=dt;tx=0;ty=0;if(e.mt<=0){e.mode=null;e.c2=rage?3.6:5.5;bossSlam(e);}}
        else if(e.mode==='tele2'){e.mt-=dt;tx=0;ty=0;e.face=Math.atan2(dy,dx);if(e.mt<=0){e.mode='rampage';e.mt=rage?1.9:1.4;e.cdx=Math.cos(e.face);e.cdy=Math.sin(e.face);AU.roar();G.shake+=6;}}
        else if(e.mode==='rampage'){e.mt-=dt;tx=e.cdx;ty=e.cdy;spd=rage?340:285;bossSmash(e);G.shake=Math.max(G.shake,3);if(e.mt<=0){e.mode=null;e.c4=rage?3.5:5.5;}}
        else if(e.c2<=0&&d<200){e.mode='slamT';e.mt=.9;AU.roar();}
        else{e.c4=(e.c4??5)-dt;if(e.c4<=0&&d>150&&d<760){e.mode='tele2';e.mt=rage?.55:.75;}
          e.c5=(e.c5??3)-dt;if(e.c5<=0&&d>220&&d<700){e.c5=rage?2.4:3.8;bossThrow(e,rage);}}
        e.c3-=dt; if(e.c3<=0&&e.los&&d<560&&e.mode!=='slamT'&&e.mode!=='rampage'&&e.mode!=='tele2'){e.c3=7;const a0=Math.atan2(dy,dx);for(let k=-2;k<=2;k++){const a=a0+k*.22;projs.push({k:'s',x:e.x+Math.cos(a)*e.r,y:e.y+Math.sin(a)*e.r,vx:Math.cos(a)*260,vy:Math.sin(a)*260,dmg:16,life:2.2});}AU.spit(e);}
        e.stepT-=dt; if(e.stepT<=0){e.stepT=e.mode==='rampage'?.25:.7;AU.thud(clamp(1-d/900,0,1)*.8);if(d<420)G.shake+=1.5;}
        break;}
      case 'bombeiro':
        if(!G.flags.bombMet2&&e.los&&d<500){G.flags.bombMet2=true;}
        e.stepT-=dt; if(e.stepT<=0){e.stepT=.62;AU.thud(clamp(1-d/800,0,1)*.7);if(d<300)G.shake+=.8;}
        if(e.stk>=1){const ex=(e.x/TILE)|0,ey=(e.y/TILE)|0,sx=Math.sign(Math.round(tx)),sy=Math.sign(Math.round(ty));for(const [ax,ay] of [[ex+sx,ey],[ex,ey+sy],[ex+sx,ey+sy]]){const tt=getT(ax,ay);if(tt===T.PROP||tt===T.WINDOW){const w=interacts.find(o=>o.type==='janela'&&o.tx===ax&&o.ty===ay);if(w)breakWindow(w,false);else{setT(ax,ay,under[idx(ax,ay)]||T.TILEF);if(typeof invalidateRect==='function')invalidateRect(ax,ay,1,1);flowTile=-1;}AU.thud(1);G.shake+=4;for(let i=0;i<12;i++)parts.push({k:'debris',x:tc(ax),y:tc(ay),vx:rr(-150,150),vy:rr(-150,150),life:.5,max:.5,s:3,c:'#6a5a48'});e.hitAnim=.4;break;}}}
        if(G.pSafe&&d<260){e.knT=(e.knT||0)-dt;if(e.knT<=0){e.knT=rr(1.4,2.4);AU.knock();AU.thud(.8);G.shake+=2;}}
        break;
      case 'pers':
        if(!G.flags.persMet&&e.los&&d<520){G.flags.persMet=true;STORY.persSeen();}
        spd=d>520?e.t.spd*1.55:e.t.spd;
        e.stepT-=dt; if(e.stepT<=0){e.stepT=d>520?.4:.58;AU.thud(clamp(1-d/900,0,1));if(d<380)G.shake+=1.2;}
        break;
    }
  } else if(e.state==='investigate'){
    // ouviu algo: vai conferir onde foi o barulho
    e.it-=dt; const nd=hyp(e.nx-e.x,e.ny-e.y);
    if(nd<28||e.it<=0){e.state='search';e.st=rr(3,4.5);}
    else if(e.losN)toward(e.nx,e.ny);
    else if(!byFlow(nflow))toward(e.nx,e.ny);
    spd*=e.t.blind?.8:.62;
  } else if(e.state==='search'){
    // olha em volta antes de desistir
    e.st-=dt; if(e.st<=0){e.state='wander';e.wt=0;}
    e.scanT=(e.scanT||0)-dt; if(e.scanT<=0){e.scanT=rr(.8,1.4);e.scan=-e.scan;e.idle=Math.random()<.6;e.dir=e.face+rr(-1,1);}
    e.face+=e.scan*dt*1.8;
    if(!e.idle){tx=Math.cos(e.dir);ty=Math.sin(e.dir);spd*=.28;}
  } else {
    if(e.herd){tx=Math.cos(e.dir);ty=Math.sin(e.dir);spd*=.75;}
    else{e.wt-=dt; if(e.wt<=0){e.wt=2+Math.random()*3;e.dir=Math.random()*6.283;e.idle=Math.random()<.45;}
    if(!e.idle){tx=Math.cos(e.dir);ty=Math.sin(e.dir);spd*=.32;}}
  }
  // preso? desiste do caminho
  e.skT-=dt; if(e.skT<=0){e.skT=.8;const mv=hyp(e.x-e.sx,e.y-e.sy);e.sx=e.x;e.sy=e.y;
    // encostado numa janela querendo chegar em você: bate até quebrar
    if(e.state==='chase'&&mv<8&&d<420&&!e.t.boss&&e.type!=='pers'){const ex=(e.x/TILE)|0,ey=(e.y/TILE)|0;
      for(let j=-1;j<=1&&e.alive;j++)for(let i=-1;i<=1;i++){if(getT(ex+i,ey+j)!==T.WINDOW)continue;const w=interacts.find(o=>o.type==='janela'&&o.tx===ex+i&&o.ty===ey+j);
        if(w){e.winHits=(e.winHits||0)+1;e.hitAnim=.4;AU.thud(.3);if(e.winHits>=3){e.winHits=0;breakWindow(w,false);if(d<500){AU.sting();bark('rafa','s','Ele quebrou o vidro!');}}else{AU.knock();}}j=2;break;}}
    if((Math.abs(tx)+Math.abs(ty))>0&&mv<5&&e.mode==null&&e.stun<=0&&e.stk>=1&&(e.hunt||bigE(e)||e.state==='chase'))unstick(e);
    if((Math.abs(tx)+Math.abs(ty))>0&&mv<5&&e.mode==null&&e.stun<=0){e.stk++;if(e.stk>=3){e.stk=0;if(e.state==='investigate'||(e.state==='chase'&&!e.sees&&!e.hunt)){e.state='search';e.st=2.5;}else if(e.state!=='chase'){e.wt=0;e.dir=Math.random()*6.283;}}}else e.stk=0;}
  if(e.mode==='charge'||e.mode==='leap'||e.mode==='rampage'){e.vx=tx*spd;e.vy=ty*spd;}
  else{const k=Math.min(1,dt*7);e.vx=lerp(e.vx,tx*spd,k);e.vy=lerp(e.vy,ty*spd,k);}
  const ox=e.x,oy=e.y;
  const col=move(e,e.vx*dt,e.vy*dt,true);
  if(e.mode==='leap'&&e.type==='especime'&&col&&hyp(e.x-ox,e.y-oy)<spd*dt*.5){e.mode=null;e.stun=1.3;e.c3=3;G.shake+=10;AU.thud(1);for(let i=0;i<12;i++)parts.push({k:'debris',x:e.x+e.cdx*e.r,y:e.y+e.cdy*e.r,vx:rr(-140,140),vy:rr(-140,140),life:.5,max:.5,s:3,c:'#8a8680'});}
  if(e.mode==='charge'){
    if(col&&hyp(e.x-ox,e.y-oy)<spd*dt*.5){e.mode=null;e.stun=1.5;e.c2=3.5;G.shake+=8;AU.thud(1);for(let i=0;i<10;i++)parts.push({k:'debris',x:e.x+e.cdx*e.r,y:e.y+e.cdy*e.r,vx:rr(-120,120),vy:rr(-120,120),life:.5,max:.5,s:3,c:'#6a6660'});}
    if(d<e.r+P.r+8){e.mode=null;e.c2=3.2;hurtPlayer(e.t.dmg,e.x,e.y);move(P,e.cdx*30,e.cdy*30,false);}
  } else if(e.mode==='rampage'){if(d<e.r+P.r+8&&e.atk<=0&&!P.hidden){e.atk=1;hurtPlayer(40,e.x,e.y);move(P,e.cdx*55,e.cdy*55,false);G.shake+=10;}if(col&&hyp(e.x-ox,e.y-oy)<spd*dt*.3){e.mode=null;e.stun=.7;e.c4=3;G.shake+=8;AU.thud(1);}}
  else if(e.mode==='leap'&&d<e.r+P.r+6){e.mode=null;e.c2=2.2;e.atk=1;hurtPlayer(e.t.dmg,e.x,e.y);}
  else if(e.state!=='chase'&&col){if(e.herd)e.dir+=rr(-.8,.8);else e.wt=0;}
  if(e.mode!=='tele'&&e.mode!=='tele2'&&e.mode!=='rampage'&&e.mode!=='charge'&&e.mode!=='leap'&&e.mode!=='slamT'&&(Math.abs(tx)+Math.abs(ty))>0){e.face+=angDiff(e.face,Math.atan2(ty,tx))*Math.min(1,dt*(e.state==='chase'?8:3));}
  // ataque com aviso: ele levanta os braços antes de morder (dá pra esquivar)
  if(e.wind>0){e.wind-=dt;e.vx*=.8;e.vy*=.8;if(e.wind<=0&&!pSafe&&!P.hidden&&!P.inCar&&d<e.r+P.r+16)enemyHit(e);}
  else if(e.state==='chase'&&!pSafe&&!P.hidden&&e.mode!=='charge'&&d<e.r+P.r+6&&e.atk<=0){
    e.atk=e.type==='cao'?.85:e.stalker||e.type==='boss'||e.t.boss?1.4:1.3; e.hitAnim=.45; e.face=Math.atan2(dy,dx);
    if(P.inCar)hurtPlayer(e.t.dmg,e.x,e.y); else{e.wind=e.type==='cao'?.18:e.t.boss||e.type==='boss'?.4:.3;if(Math.random()<.5)AU.groan(e,.9);}
  }
}
// preso numa quina ou atrás de um móvel: escorrega para o ladrilho livre mais próximo que leva até você
function unstick(e){
  const tx=(e.x/TILE)|0,ty=(e.y/TILE)|0; if(!inb(tx,ty))return;
  const cur=flow[idx(tx,ty)]; let best=null,bd=1e9;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=tx+i,y=ty+j;if(!inb(x,y)||blocked(x,y,true))continue;const f=flow[idx(x,y)];
    const sc=(f>=0?f:999)*10+Math.abs(i)+Math.abs(j)+(i||j?0:5);if(sc<bd){bd=sc;best=[x,y];}}
  if(!best)return; const [x,y]=best; if(cur>=0&&flow[idx(x,y)]>cur&&!(x===tx&&y===ty))return;
  e.x=lerp(e.x,tc(x),.6); e.y=lerp(e.y,tc(y),.6); e.vx*=.3; e.vy*=.3;
}
function enemyHit(e){
  const canGrab=['zumbi','corr','afog','rast'].includes(e.type)&&!P.grab&&P.dodge<=0&&!DBG.god&&Math.random()<.34;
  if(canGrab){P.grab={e,t:1.9,n:0,need:P.owned[0]&&P.dur>0?3:(G.diff==='dificil'?8:6)};e.grabbing=true;hurtPlayer(e.t.dmg*.45,e.x,e.y);P.inv=0;
    if(!G.flags.grabTip){G.flags.grabTip=true;toast(IN.touch?'Ele te agarrou! Toque na tela várias vezes!':'Ele te agarrou! Aperte qualquer tecla várias vezes!');}}
  else hurtPlayer(e.t.dmg,e.x,e.y);
}
function mashGrab(){
  const g=P.grab; if(!g)return; g.n++; G.shake+=1.5; AU.hit(); buzz(10);
  if(g.n>=g.need)releaseGrab(true);
}
function releaseGrab(won){
  const g=P.grab; if(!g)return; P.grab=null; const e=g.e; if(!e)return; e.grabbing=false;
  const a=Math.atan2(e.y-P.y,e.x-P.x);
  if(won){
    if(P.owned[0]&&P.dur>0){hurtEnemy(e,45,Math.cos(a)*260,Math.sin(a)*260,{});P.dur=Math.max(0,P.dur-2);if(P.dur<=0){P.owned[0]=false;if(P.w===0)P.w=8;toast('A faca ficou cravada nele. Quebrou.');}
      else floaters.push({x:P.x,y:P.y-24,t:'CONTRA-ATAQUE',life:.8});}
    else{e.vx+=Math.cos(a)*320;e.vy+=Math.sin(a)*320;floaters.push({x:P.x,y:P.y-24,t:'SE SOLTOU',life:.8});}
    if(e.alive)e.stun=Math.max(e.stun,1);
  } else {P.inv=0;hurtPlayer(e.t.dmg*1.3,e.x,e.y);e.vx+=Math.cos(a)*120;e.vy+=Math.sin(a)*120;e.stun=Math.max(e.stun,.5);}
  e.atk=1.6; P.inv=Math.max(P.inv,.7);
}
function bossSlam(e){
  G.shake+=16; AU.boom(.7);
  hazards.push({x:e.x,y:e.y,r:90,life:2.5,max:2.5,dps:10});
  for(let i=0;i<40;i++){const a=Math.random()*6.28,s=rr(120,340);parts.push({k:'debris',x:e.x,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.3,.7),max:.7,s:rr(2,4),c:'#5a5048'});}
  G.slam={x:e.x,y:e.y,t:.5};
  const d=hyp(P.x-e.x,P.y-e.y); if(d<175){hurtPlayer(30,e.x,e.y);const a=Math.atan2(P.y-e.y,P.x-e.x);move(P,Math.cos(a)*40,Math.sin(a)*40,false);}
}
function separate(){
  const L=enemies.filter(a=>a.alive&&Math.abs(a.x-P.x)<1800&&Math.abs(a.y-P.y)<1800), n=L.length;
  for(let i=0;i<n;i++){const a=L[i];
    for(let j=i+1;j<n;j++){const b=L[j];
      const dx=b.x-a.x,dy=b.y-a.y,rr2=a.r+b.r; if(Math.abs(dx)>rr2||Math.abs(dy)>rr2)continue;
      const d=hyp(dx,dy); if(d<rr2&&d>0.01){const p=(rr2-d)/2,ux=dx/d,uy=dy/d;a.x-=ux*p;a.y-=uy*p;b.x+=ux*p;b.y+=uy*p;resolve(a,true);resolve(b,true);}
    }
    const dx=a.x-P.x,dy=a.y-P.y,d=hyp(dx,dy),m=a.r+P.r;
    if(d<m&&d>0.01&&!P.hidden){a.x+=dx/d*(m-d);a.y+=dy/d*(m-d);resolve(a,true);}
  }
  for(const n2 of npcs){if(n2.cond&&!n2.cond())continue;const dx=P.x-n2.x,dy=P.y-n2.y,d=hyp(dx,dy),m=P.r+11;if(d<m&&d>0.01){P.x+=dx/d*(m-d);P.y+=dy/d*(m-d);resolve(P,false);}}
}

// ===================== PROJÉTEIS, PARTÍCULAS =====================
function updProjs(dt){
  for(const p of projs){
    if(p.k==='bt'){
      p.fuse-=dt; p.spin+=dt*14;
      const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt, t2=tileAtPx(nx,ny);
      if(BULLET_BLOCK[t2]||(SOLID[t2]&&t2!==T.WATER&&t2!==T.PROP&&t2!==T.TREE&&t2!==T.FENCE)){bottleBreak(p);continue;}
      p.x=nx;p.y=ny;
      for(const e of enemies){if(e.alive&&hyp(e.x-p.x,e.y-p.y)<e.r+4){if(e.type!=='ouvinte')hurtEnemy(e,4,p.vx*.05,p.vy*.05,{});bottleBreak(p);break;}}
      if(!p.dead&&p.fuse<=0)bottleBreak(p);
      continue;
    }
    if(p.k==='h'){
      p.fuse-=dt; p.spin+=dt*12;
      const nx=p.x+p.vx*dt; if(BULLET_BLOCK[tileAtPx(nx,p.y)]||SOLID[tileAtPx(nx,p.y)]&&tileAtPx(nx,p.y)!==T.WATER){p.vx*=-.45;}else p.x=nx;
      const ny=p.y+p.vy*dt; if(BULLET_BLOCK[tileAtPx(p.x,ny)]||SOLID[tileAtPx(p.x,ny)]&&tileAtPx(p.x,ny)!==T.WATER){p.vy*=-.45;}else p.y=ny;
      const f=Math.pow(.15,dt); p.vx*=f; p.vy*=f;
      if(p.fuse<=0){explode(p.x,p.y,115,150);p.dead=true;}
      continue;
    }
    const sp=hyp(p.vx,p.vy)||1, steps=Math.max(1,Math.ceil(sp*dt/8)), sdt=dt/steps;
    for(let s=0;s<steps&&!p.dead;s++){
      p.x+=p.vx*sdt; p.y+=p.vy*sdt;
      const t=tileAtPx(p.x,p.y);
      if(p.k==='s'){
        if(BULLET_BLOCK[t]){p.dead=true;splashOf(p);break;}
        if(hyp(P.x-p.x,P.y-p.y)<P.r+(p.rock?14:5)&&!P.hidden){if(!inSafe())hurtPlayer(p.dmg,p.x-p.vx*.05,p.y-p.vy*.05);p.dead=true;splashOf(p);break;}
        continue;
      }
      if(BULLET_BLOCK[t]){
        if(t===T.WINDOW&&(p.k==='b'||p.k==='g')){const wx=(p.x/TILE)|0,wy=(p.y/TILE)|0,it=interacts.find(i=>i.type==='janela'&&i.tx===wx&&i.ty===wy);if(it)breakWindow(it,false);}
        if(p.k==='g')explode(p.x-p.vx*sdt,p.y-p.vy*sdt,105,p.dmg);
        else if(p.k==='b')for(let i=0;i<4;i++)parts.push({k:'spark',x:p.x-p.vx*sdt,y:p.y-p.vy*sdt,vx:rr(-140,140)-p.vx*.1,vy:rr(-140,140)-p.vy*.1,life:.15,max:.15,s:2,c:'#ffd27a'});
        p.dead=true; break;
      }
      for(const e of enemies){
        if(!e.alive||(e.stalker&&e.down>0))continue;
        const rr2=e.r+(p.k==='f'?p.r:3); if(Math.abs(e.x-p.x)>rr2||Math.abs(e.y-p.y)>rr2)continue;
        if(hyp(e.x-p.x,e.y-p.y)>=rr2)continue;
        if(p.k==='g'){explode(p.x,p.y,105,p.dmg);p.dead=true;break;}
        if(p.hit&&p.hit.has(e))continue;
        if(p.k==='f'){p.hit.add(e);hurtEnemy(e,p.dmg,p.vx*.03,p.vy*.03,{burn:true});continue;}
        if(!p.hit)p.hit=new Set(); p.hit.add(e);
        hurtEnemy(e,p.dmg,p.vx/sp*p.knock,p.vy/sp*p.knock,{crit:p.crit,ally:p.ally});
        if(p.bolt&&!e.alive)stat('bolt',1,10,'besta');
        p.pierce--; if(p.pierce<0){p.dead=true;break;}
      }
    }
    if(p.k==='f'){p.r+=dt*42;const f=Math.pow(.25,dt);p.vx*=f;p.vy*=f;}
    p.life-=dt; if(p.life<=0&&!p.dead){if(p.k==='g')explode(p.x,p.y,105,p.dmg);if(p.k==='s')splashOf(p);p.dead=true;}
  }
  projs=projs.filter(p=>!p.dead);
}
function explode(x,y,r,dmg){
  for(const e of enemies){
    if(!e.alive)continue; const d=hyp(e.x-x,e.y-y);
    if(d<r+e.r&&los(x,y,e.x,e.y)){const f=1-Math.min(1,d/(r+e.r))*.5,a=Math.atan2(e.y-y,e.x-x);hurtEnemy(e,dmg*f,Math.cos(a)*280,Math.sin(a)*280,{});if(e.alive&&e.type!=='boss'&&!e.t.boss)e.stun=Math.max(e.stun,.6);}
  }
  const dp=hyp(P.x-x,P.y-y); if(dp<r&&los(x,y,P.x,P.y))hurtPlayer(32*(1-dp/r*.5),x,y);
  for(const e of enemies)if(e.alive&&e.state==='dorm'&&hyp(e.x-x,e.y-y)<r*2)riseEnemy(e);
  for(let i=0;i<34;i++){const a=Math.random()*6.28,s=rr(60,320);parts.push({k:'fire',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.25,.55),max:.55,s:rr(5,11),c:Math.random()<.5?'#ffb347':'#ff6a2a'});}
  for(let i=0;i<18;i++){const a=Math.random()*6.28,s=rr(20,120);parts.push({k:'smoke',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.8,1.6),max:1.6,s:rr(10,20),c:'#3a3734'});}
  for(let i=0;i<12;i++){const a=Math.random()*6.28,s=rr(100,300);parts.push({k:'debris',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.4,.8),max:.8,s:3,c:'#5a5650'});}
  addDecal({k:'scorch',x,y,r:r*.55,rot:Math.random()*6,seed:Math.random()});
  G.shake+=13; G.boom={x,y,t:.3}; buzz(dp<500?70:25); AU.boom(clamp(1-dp/1200,.15,1)); alertNoise(x,y,950);
}
function splashOf(p){if(p.rock){G.shake+=5;AU.thud(clamp(1-hyp(p.x-P.x,p.y-P.y)/900,.2,1));for(let i=0;i<16;i++)parts.push({k:'debris',x:p.x,y:p.y,vx:rr(-200,200),vy:rr(-200,200),life:.6,max:.6,s:rr(2,5),c:p.col||'#6e3529'});addDecal({k:'scorch',x:p.x,y:p.y,r:16,rot:0,seed:.5});}else acidSplash(p.x,p.y);}
function acidSplash(x,y){for(let i=0;i<8;i++){const a=Math.random()*6.28,s=rr(30,110);parts.push({k:'acid',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.35,max:.35,s:2.5,c:'#9cc23a'});}}
function bloodBurst(x,y,n,a){
  for(let i=0;i<n;i++){const aa=a+rr(-.9,.9),s=rr(30,200);parts.push({k:'blood',x,y,vx:Math.cos(aa)*s,vy:Math.sin(aa)*s,life:rr(.2,.45),max:.45,s:rr(1.5,3.2),c:Math.random()<.5?'#7a1712':'#a3241b'});}
  if(Math.random()<.5)addDecal({k:'blood',x:x+Math.cos(a)*rr(8,20),y:y+Math.sin(a)*rr(8,20),r:rr(5,10),rot:Math.random()*6,seed:Math.random()});
}
function addDecal(dc){decals.push(dc);if(decals.length>280)decals.splice(0,decals.length-280);}
function updParts(dt){
  for(const p of parts){
    p.life-=dt; p.x+=p.vx*dt; p.y+=p.vy*dt;
    const f=p.k==='smoke'?Math.pow(.4,dt):p.k==='fire'?Math.pow(.08,dt):Math.pow(.02,dt);
    p.vx*=f; p.vy*=f;
    if(p.k==='smoke')p.s+=dt*10;
    if(p.k==='blood'&&p.life<=0&&Math.random()<.25)addDecal({k:'drop',x:p.x,y:p.y,r:p.s*.9});
  }
  parts=parts.filter(p=>p.life>0);
  if(parts.length>900)parts.splice(0,parts.length-900);
  for(const c of cars){if(!c.burn)continue;const cx=(c.x+c.w/2)*TILE,cy=(c.y+c.h/2)*TILE;if(hyp(cx-P.x,cy-P.y)>900)continue;
    if(Math.random()<dt*22)parts.push({k:'fire',x:cx+rr(-12,12),y:cy+rr(-10,10),vx:rr(-10,10),vy:rr(-50,-20),life:rr(.3,.6),max:.6,s:rr(4,8),c:Math.random()<.5?'#ffb347':'#ff6a2a'});
    if(Math.random()<dt*6)parts.push({k:'smoke',x:cx+rr(-8,8),y:cy,vx:rr(-8,8),vy:rr(-40,-20),life:rr(1,2),max:2,s:rr(8,14),c:'#2c2a28'});}
  for(const f of floaters){f.life-=dt;f.y-=dt*30;}
  floaters=floaters.filter(f=>f.life>0);
}
function updHazards(dt){
  for(const h of hazards){h.life-=dt;if(!DBG.god&&!P.inCar&&hyp(P.x-h.x,P.y-h.y)<h.r*(h.life/h.max*.4+.6)&&!inSafe()){P.hp-=h.dps*G.D.dmg*dt;G.hurt=Math.max(G.hurt,.25);if(P.hp<=0&&G.mode==='play'){P.hp=0;die();}}}
  hazards=hazards.filter(h=>h.life>0);
}

// ===================== MUNDO VIVO =====================
function spawnPoint(minD,maxD,sameDistrict,needFlow){
  const pd=dAt((P.x/TILE)|0,(P.y/TILE)|0);
  for(let i=0;i<40;i++){
    const a=Math.random()*6.283,d=rr(minD,maxD),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d;
    const tx=(x/TILE)|0,ty=(y/TILE)|0; if(!inb(tx,ty))continue; const k=idx(tx,ty);
    if(SOLID[map[k]]||!reach[k]||safeMask[k])continue;
    if(sameDistrict&&dAt(tx,ty)!==pd)continue;
    if(needFlow&&flow[k]<0)continue;
    if(bmap[k]>=0&&bmap[k]===G.inB)continue;
    return {x:tc(tx),y:tc(ty)};
  }
  return null;
}
function updSpawner(dt){
  G.spawnT-=dt; if(G.spawnT>0)return;
  if(G.ev&&G.ev.silent){G.spawnT=4;return;}
  const nk=1-daylight();
  G.spawnT=G.wave>0?1.5:lerp(26,13,nk);
  if(inSafe()&&G.wave<=0)return;
  const pd=dAt((P.x/TILE)|0,(P.y/TILE)|0), DD=DISTRICTS[pd], bc=pd>=5&&pd<=7;
  let near=0; for(const e of enemies)if(e.alive&&!e.stalker&&e.type!=='manequim'&&hyp(e.x-P.x,e.y-P.y)<1200)near++;
  const cm=bc&&G.flags.caos?1+.3*G.flags.caos:pd===0?(G.flags.portoLimpo?.45:G.flags.hospOut?1.5:1):1;
  const cap=G.wave>0?24:Math.round(DD.cap*.6*[.7,1,1.25][gameAct()-1]*lerp(.8,1.5,nk)*cm); if(near>=cap)return; if(cm>1)G.spawnT/=cm;
  const n=G.wave>0?(Math.random()<.5?2:3):(nk>.7&&Math.random()<.4?2:1);
  // de noite em Balneário aparecem corredores e gritadeiras
  const tbl=nk>.7&&bc?Object.assign({},DD.spawn,{corr:(DD.spawn.corr||0)+3,grita:1.4}):DD.spawn;
  for(let i=0;i<n;i++){
    const sp=spawnPoint(G.wave>0?560:680,G.wave>0?820:1050,G.wave<=0,G.wave>0); if(!sp)continue;
    let type=wpick(tbl); if(type==='grita'&&enemies.filter(e=>e.alive&&e.type==='grita').length>=2)type='zumbi';
    const e=makeEnemy(type,sp.x,sp.y,null,nk<.3&&(type==='zumbi'||type==='rast')&&Math.random()<.4);
    if(G.wave>0){e.state='chase';e.hunt=true;e.huntT=60;}
    enemies.push(e);
  }
}
// ===================== GATILHOS DE CENA =====================
function updTriggers(){
  if(CUT.on||G.mode!=='play'||P.inCar)return;
  const F=G.flags, near=(id,r)=>{const n=npcs.find(n=>n.id===id);return n&&(!n.cond||n.cond())&&hyp(n.x-P.x,n.y-P.y)<r?n:null;};
  let n;
  if(!F.metTiao&&(n=near('tiao',150))&&G.inB>=0)return STORY.npc(n);
  if(F.metTiao&&!F.batDone&&invCount('bateria')>0&&(n=near('tiao',110)))return STORY.npc(n);
  if(F.batDone&&V.dead&&!F.bloqueio&&(n=near('tiao',120)))return STORY.npc(n);
  if(!F.metHelena&&(n=near('helena',170))&&G.inB>=0)return STORY.npc(n);
  if(F.metHelena&&F.clinicPower&&!F.inibidorDone&&invCount('inibidor')>0&&(n=near('helena',120)))return STORY.npc(n);
  if(!F.introGordo){const b=enemies.find(e=>e.alive&&e.type==='gordo');if(b&&hyp(b.x-P.x,b.y-P.y)<380&&los(P.x,P.y,b.x,b.y)){F.introGordo=true;return STORY.introBoss(b);}}
  // shopping: a equipe da Vértice está na drogaria quando você chega com a guia de transferência
  if(F.transfer&&F.metHelena&&!F.shopEv&&LM.grade){const sh=buildings.find(b=>b.kind==='shop');if(sh&&G.inB===sh.id&&hyp(P.x-LM.grade.x,P.y-LM.grade.y)<300&&los(P.x,P.y,LM.grade.x,LM.grade.y))return STORY.shopEvent();}
  if(!F.manTip){const m=enemies.find(e=>e.alive&&e.type==='manequim'&&e.vis&&hyp(e.x-P.x,e.y-P.y)<260);if(m&&G.inB===m.homeB){F.manTip=true;bark('rafa','t','Manequins... por que estão virados pra porta?');}}
}
// ===================== RELÓGIO: DIA E NOITE =====================
const CLOCK_RATE=.5; // minutos de jogo por segundo real: uma hora passa em dois minutos
function hourNow(){return (((G.clock||0)/60)%24+24)%24;}
function dayNo(){return Math.floor((G.clock||0)/1440)+1;}
function daylight(){const h=hourNow();if(h>=7&&h<17.5)return 1;if(h>=5&&h<7)return (h-5)/2;if(h>=17.5&&h<19.5)return 1-(h-17.5)/2;return 0;}
function isNight(){return daylight()<.3;}
function clockStr(){const m=Math.floor(G.clock||0)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0');}
function updClock(dt){
  const h0=hourNow(); G.clock+=dt*CLOCK_RATE; const h1=hourNow();
  const crossed=t=>(h0<t&&h1>=t)||(h0>h1&&(t>h0||t<=h1));
  if(crossed(18.5))onDusk();
  if(crossed(6))onDawn();
  G.tmul=lerp(.85,1.12,1-daylight());
}
function onDusk(){
  G.restedNight=false;
  // eles saem dos prédios quando escurece
  let n=0;
  for(const b of buildings){
    if(n>=7)break; if(b.safe||b.big||b.kind==='quiosque')continue;
    const cx=(b.x+b.w/2)*TILE,cy=(b.y+b.h/2)*TILE,d=hyp(cx-P.x,cy-P.y); if(d<260||d>950)continue;
    for(let t=0;t<10;t++){const x=b.x+ri(1,b.w-2),y=b.y+ri(1,b.h-2),k=idx(x,y);if(SOLID[map[k]]||!reach[k])continue;
      const e=makeEnemy(Math.random()<.25?'corr':'zumbi',tc(x),tc(y),null);e.state='investigate';e.nx=P.x+rr(-200,200);e.ny=P.y+rr(-200,200);e.it=20;enemies.push(e);n++;break;}
  }
  if(G.mode==='play'&&!inSafe()){AU.groan({x:P.x+200,y:P.y},1);laterF(()=>{bark('rafa','s','Escureceu... tem porta batendo em todo lugar. Eles tão saindo dos prédios.');},600);}
  if(G.flags.walkie&&G.flags.metHelena&&!G.flags.inibidorDone)laterF(()=>{bark('helena','s','Richard, anoiteceu. De noite eles enchem a rua. Apaga a luz ou acha um abrigo.',{radio:true});},4200);
}
function onDawn(){
  if(!G.restedNight&&G.time>240)ach('noite');
  G.restedNight=false;
  // com a luz, parte deles volta pro escuro dos prédios
  for(const e of enemies){if(!e.alive||e.uid||e.state==='chase'||e.t.boss||e.stalker||e.type==='manequim')continue;
    const d=hyp(e.x-P.x,e.y-P.y); if(d>700&&bmap[idx((e.x/TILE)|0,(e.y/TILE)|0)]<0&&Math.random()<.45)e.alive=false;}
  if(G.mode==='play')laterF(()=>{bark('rafa','t','Amanheceu. Eles ficam mais lentos com a luz... mas agora me enxergam de longe.');},500);
}
// ===================== CAMPO DE VISÃO DO RICHARD =====================
// Ele só enxerga o que está no cone à frente (com as paredes bloqueando) e o que está colado nele.
function fovParams(){if(P.inCar)return {half:1.35,range:660,peri:96};if(P.hidden)return {half:.55,range:330,peri:44};return {half:1.0,range:580,peri:74};}
function fovSees(x,y,r=0){
  if(DBG.bright)return true;
  const ox=P.inCar?V.x:P.x, oy=P.inCar?V.y:P.y, a=P.inCar?V.ang:P.ang, p=fovParams();
  const dx=x-ox,dy=y-oy,d=hyp(dx,dy);
  if(d<p.peri+r)return d<26||los(ox,oy,x,y);
  if(d>p.range+r)return false;
  if(Math.abs(angDiff(a,Math.atan2(dy,dx)))>p.half+Math.atan2(r+6,d))return false;
  return los(ox,oy,x,y);
}
function updVis(dt){
  G.visT-=dt; const chk=G.visT<=0; if(chk)G.visT=.08;
  const all=CUT.on||G.mode==='title';
  for(const e of enemies){
    if(!e.alive)continue;
    if(chk){const d=hyp(e.x-P.x,e.y-P.y);e.vis=all||e.cut||(d<820&&fovSees(e.x,e.y,e.r));}
    e.va=clamp((e.va||0)+(e.vis?dt*7:-dt*2.4),0,1); if(e.vis)e.seenT=G.time;
  }
  for(const p of peds){if(chk)p.vis=all||fovSees(p.x,p.y,11);p.va=clamp((p.va||0)+(p.vis?dt*7:-dt*2.4),0,1);}
}
// manequins: só se mexem quando ninguém está olhando
function mannequinWatched(e,d){
  if(G.blackout>0)return false;
  if(fovSees(e.x,e.y,e.r)&&(d<70||los(P.x,P.y,e.x,e.y)))return true;
  if(!e.vis||(G.flick>0&&lampOn()))return false;
  const ahead=Math.abs(angDiff(P.ang,Math.atan2(e.y-P.y,e.x-P.x)))<fovParams().half;
  if(!ahead)return false;
  if(daylight()>.5&&G.inB<0)return true;
  if(d<96)return true;
  if(lampOn()&&d<400&&Math.abs(angDiff(P.ang,Math.atan2(e.y-P.y,e.x-P.x)))<.46)return true;
  if(G.pLit&&d<230)return true;
  return false;
}
function updManequim(e,dt,d,dx,dy){
  const F=G.flags; if(!(F.shopEv&&!F.shopOpen&&!F.boss_especime)){e.vx=0;e.vy=0;e.moved=0;return;}
  e.atk-=0; const watched=mannequinWatched(e,d);
  if(watched){
    e.vx=0;e.vy=0;
    if((e.moved||0)>48){e.moved=0;AU.sting();G.shake+=2.5;buzz(25);if(!G.flags.manMoved){G.flags.manMoved=true;laterF(()=>{bark('rafa','s','Ele... ele estava lá atrás. Não tira o olho deles. Não pisca.');},500);}}
    return;
  }
  const active=d<560&&(e.homeB==null||e.homeB<0||G.inB===e.homeB||d<300)&&!G.pSafe&&!P.inCar&&!P.hidden&&!CUT.on;
  if(!active)return;
  let tx=dx/d,ty=dy/d; if(d>70){const f=flowDir(e);if(f){const l=hyp(f[0],f[1])||1;tx=f[0]/l;ty=f[1]/l;}}
  const ox=e.x,oy=e.y; move(e,tx*e.t.spd*dt,ty*e.t.spd*dt,true); e.moved=(e.moved||0)+hyp(e.x-ox,e.y-oy);
  e.face=Math.atan2(dy,dx); e.anim+=dt;
  if(d<e.r+P.r+9&&e.atk<=0){e.atk=1.2;e.hitAnim=.3;hurtPlayer(e.t.dmg,e.x,e.y);AU.sting();}
}
// ===================== O OUVINTE =====================
// Cego. Não morre. Anda pelo labirinto do Santa Clara ouvindo: passo, tiro, vidro, respiração.
function ouvPath(e,gx,gy){
  const b=buildings[e.homeB]; if(!b)return false;
  const key=gx+gy*W; if(e.pfK===key&&G.time-e.pfT<1.2)return true;
  const w=b.w,h=b.h,N=w*h; if(!e.pf||e.pf.length!==N)e.pf=new Int16Array(N);
  const pf=e.pf; pf.fill(-1); const q=e.pfQ||(e.pfQ=new Int32Array(N));
  const lx=gx-b.x,ly=gy-b.y; if(lx<0||ly<0||lx>=w||ly>=h)return false;
  let hd=0,tl=0; pf[lx+ly*w]=0; q[tl++]=lx+ly*w;
  while(hd<tl){const k=q[hd++],x=k%w,y=(k/w)|0,dd=pf[k];
    for(const [dx,dy] of DIRS4){const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const nk=nx+ny*w;if(pf[nk]!==-1)continue;if(SOLID[map[idx(b.x+nx,b.y+ny)]]&&!(nx===lx&&ny===ly))continue;pf[nk]=dd+1;q[tl++]=nk;}}
  e.pfK=key;e.pfT=G.time; return true;
}
function ouvStep(e){
  const b=buildings[e.homeB]; if(!b||!e.pf)return null;
  const tx=((e.x/TILE)|0)-b.x,ty=((e.y/TILE)|0)-b.y,w=b.w,h=b.h; if(tx<0||ty<0||tx>=w||ty>=h)return null;
  let best=e.pf[tx+ty*w]; if(best<0)best=9999; let bx=0,by=0,ok=false;
  for(const [dx,dy] of DIRS8){const nx=tx+dx,ny=ty+dy;if(nx<0||ny<0||nx>=w||ny>=h)continue;const f=e.pf[nx+ny*w];if(f<0||f>=best)continue;
    if(dx&&dy&&(blocked(b.x+tx+dx,b.y+ty,true)||blocked(b.x+tx,b.y+ty+dy,true)))continue;best=f;bx=nx;by=ny;ok=true;}
  if(!ok)return null; return [tc(b.x+bx)-e.x,tc(b.y+by)-e.y];
}
function ouvRandomTarget(e){
  const b=buildings[e.homeB]; if(!b)return;
  // ela não ronda à toa: quanto mais tempo você fica lá dentro, mais ela "sente" pra que lado você está
  if(G.inB===e.homeB&&Math.random()<clamp(.5+(e.press||0)/70,.5,.9)){
    const px=(P.x/TILE)|0,py=(P.y/TILE)|0,r=Math.max(3,8-((e.press||0)/30|0));
    for(let i=0;i<30;i++){const x=px+ri(-r,r),y=py+ri(-r,r);if(x<=b.x||y<=b.y||x>=b.x+b.w-1||y>=b.y+b.h-1)continue;if(!SOLID[map[idx(x,y)]]&&bmap[idx(x,y)]===e.homeB){e.nx=tc(x);e.ny=tc(y);return;}}
  }
  for(let i=0;i<30;i++){const x=b.x+ri(1,b.w-2),y=b.y+ri(1,b.h-2);if(!SOLID[map[idx(x,y)]]){e.nx=tc(x);e.ny=tc(y);return;}}
}
function updOuvinte(e,dt,d,dx,dy){
  const b=buildings[e.homeB], inside=b&&G.inB===e.homeB;
  e.heard-=dt; e.press=clamp((e.press||0)+(inside&&!P.hidden&&P.moving?dt*1.6:-dt*(inside?.35:2)),0,150);
  // de vez em quando ela para e escuta: tudo fica mais alto
  if(e.listen>0)e.listen-=dt; else if(e.heard<=0&&inside){e.listenT=(e.listenT??rr(6,10))-dt;if(e.listenT<=0){e.listenT=rr(7,12);e.listen=rr(2.2,3.4);if(d<520){AU.click2(1);AU.click2(.7);}}}
  const lm=e.listen>0?1.7:1;
  // ouvir o Richard: correndo de longe, andando só de perto, parado ou escondido não
  if(!P.hidden&&!G.pSafe&&(inside||d<200)&&!CUT.on){
    const loudFire=P.firing&&!(P.w===1&&P.sil>0)&&!WEAPONS[P.w].melee;
    const hr=(P.running?400:P.moving?(loudFire?320:P.crouch?34:120):(loudFire?320:P.crouch?0:40))*lm;
    if(d<hr&&(d<70||los(e.x,e.y,P.x,P.y)||d<hr*.6)){e.heard=4;e.nx=P.x;e.ny=P.y;e.hot=true;if(!e.alertS||G.time-e.alertS>4){e.alertS=G.time;AU.hiss(e);if(d<400)G.shake+=1;}}
  }
  // faro: bem de perto ela sente o seu cheiro, mesmo parado (agachado sente menos; sangrando, mais)
  let smelling=false;
  if(inside&&!G.pSafe&&!CUT.on){
    const sr=(P.crouch?62:92)*(P.hp<P.max*.4?1.35:1)*(P.hidden?.9:1);
    if(d<sr){smelling=true;e.smell=(e.smell||0)+dt*(P.moving?1.5:1);
      if(!e.sniffS||G.time-e.sniffS>1.1){e.sniffS=G.time;AU.nz(.5,700,.6,.14,'bandpass');}
      if(!G.flags.ouvSmell){G.flags.ouvSmell=true;bark('rafa','s','Ela tá... cheirando o ar. Ela sente o meu cheiro. Não respira. Não respira.',{dur:2.4});}
      if(P.hidden){if(e.smell>2&&(e.pounded||0)>=1){e.smell=0;e.pounded=0;exitHide(true);e.atk=1.4;hurtPlayer(e.t.dmg,e.x,e.y);AU.roar();G.shake+=14;buzz([120,40,160]);bark('rafa','s','ELA ME ARRANCOU DO ARMÁRIO!',{dur:1.6});}
        else if(e.smell>2){e.pounded=(e.pounded||0)+1;e.smell=0;e.atk=2;G.shake+=10;AU.knock();AU.thud(1);AU.roar();buzz([60,40,90]);e.heard=0;e.listen=0;ouvRandomTarget(e);e.nx=e.x+(e.x-P.x)*4;e.ny=e.y+(e.y-P.y)*4;
          bark('rafa','s',pick2(['Ela bateu no armário... ela sabe. Ela sabe.','Vai embora. Vai embora. Por favor.']),{dur:2});}}
      else if(e.smell>.75){e.heard=4;e.nx=P.x;e.ny=P.y;e.hot=true;}}
    else e.smell=Math.max(0,(e.smell||0)-dt*.7);
  }
  let spd=e.t.spd, goal=null;
  if(smelling&&e.heard<=0){goal=[P.x+rr(-6,6),P.y+rr(-6,6)];spd=P.hidden?20:48;e.state='investigate';}
  else if(e.listen>0&&e.heard<=0){goal=[e.x,e.y];spd=0;e.state='wander';}
  else if(e.heard>0){goal=[e.nx,e.ny]; spd=e.hot&&hyp(e.nx-P.x,e.ny-P.y)<60?192:128; e.state='investigate';}
  else{
    e.state='wander'; e.hot=false;
    if(!e.wtx||hyp(e.nx-e.x,e.ny-e.y)<30||(e.wt-=dt)<=0){ouvRandomTarget(e);e.wt=rr(8,14);e.wtx=1;}
    goal=[e.nx,e.ny]; spd=e.t.spd*.7;
  }
  // chega no lugar do barulho e fareja
  const gd=hyp(goal[0]-e.x,goal[1]-e.y);
  if(e.heard>0&&gd<26){e.heard=Math.min(e.heard,1.2);e.sniff=(e.sniff||0)+dt;spd=0;e.face+=Math.sin(G.time*3)*dt*2;}
  let tx=0,ty=0;
  if(spd>0){
    if(gd<40||(gd<140&&los(e.x,e.y,goal[0],goal[1]))){tx=(goal[0]-e.x)/(gd||1);ty=(goal[1]-e.y)/(gd||1);}
    else if(b&&ouvPath(e,(goal[0]/TILE)|0,(goal[1]/TILE)|0)){const s=ouvStep(e);if(s){const l=hyp(s[0],s[1])||1;tx=s[0]/l;ty=s[1]/l;}else{tx=(goal[0]-e.x)/(gd||1);ty=(goal[1]-e.y)/(gd||1);}}
    else{tx=(goal[0]-e.x)/(gd||1);ty=(goal[1]-e.y)/(gd||1);}
  }
  const k=Math.min(1,dt*5); e.vx=lerp(e.vx,tx*spd,k); e.vy=lerp(e.vy,ty*spd,k);
  const ox=e.x,oy=e.y; move(e,e.vx*dt,e.vy*dt,true);
  // nunca sai do hospital
  if(b){const cx=clamp(e.x,tc(b.x+1)-12,tc(b.x+b.w-2)+12),cy=clamp(e.y,tc(b.y+1)-12,tc(b.y+b.h-2)+12);e.x=cx;e.y=cy;}
  if(Math.abs(tx)+Math.abs(ty)>0)e.face+=angDiff(e.face,Math.atan2(ty,tx))*Math.min(1,dt*4);
  e.anim+=dt*(spd/60);
  e.stepT-=dt; if(e.stepT<=0){e.stepT=spd>130?.32:.7;if(d<700)AU.thud(clamp(1-d/700,0,1)*.35);}
  e.clickT=(e.clickT||rr(2,4))-dt; if(e.clickT<=0){e.clickT=rr(2.5,5);if(d<620)AU.click2(clamp(1-d/620,.1,1));}
  // esbarrou em você: pega
  if(!P.hidden&&!G.pSafe&&d<e.r+P.r+8&&e.atk<=0){e.atk=1.6;e.hitAnim=.4;e.face=Math.atan2(dy,dx);hurtPlayer(e.t.dmg,e.x,e.y);AU.roar();G.shake+=8;e.heard=3;e.nx=P.x;e.ny=P.y;e.hot=true;buzz(90);
    if(!G.flags.ouvHit){G.flags.ouvHit=true;laterF(()=>{bark('rafa','s','Ela não me viu... ela me OUVIU. Devagar. Joga alguma coisa longe.');},700);}}
}
// ===================== SUSTOS =====================
function lampOff(l){return l.offAt!=null&&G.time>=l.offAt&&G.time<l.offUntil;}
function nearCoast(){const ty=(P.y/TILE)|0;if(ty<45||(ty>388&&ty<405))return 0;return clamp(1-(coastX(ty)-(P.x/TILE))/16,0,1);}
function updScares(dt){
  if(G.winFace){G.winFace.t-=dt;if(G.winFace.t<=0)G.winFace=null;}
  const v=G.vulto;
  if(v){v.life-=dt;const d=hyp(v.x-P.x,v.y-P.y);
    const beam=lampOn()&&d<380&&Math.abs(angDiff(P.ang,Math.atan2(v.y-P.y,v.x-P.x)))<.42&&los(P.x,P.y,v.x,v.y);
    if(beam){v.seen+=dt;if(v.seen>.2){AU.sting();G.flick=.3;G.shake+=2;buzz(30);G.vulto=null;}}
    else if(d<80){AU.sting();G.vulto=null;}
    if(G.vulto&&v.life<=0)G.vulto=null;}
  const nc=nearCoast(); G.coast=lerp(G.coast||0,nc,Math.min(1,dt));
  if(nc>.3){G.waveT=(G.waveT||0)-dt;if(G.waveT<=0){G.waveT=rr(3.5,7);AU.wave(nc);}}
  // postes apagando um por um na sua direção
  const lc=G.lampChain; if(lc){for(const l of lc.ls){if(!l.clicked&&G.time>=l.offAt){l.clicked=true;AU.click();AU.thud(.15);for(let i=0;i<6;i++)parts.push({k:'spark',x:l.x,y:l.y,vx:rr(-80,80),vy:rr(-80,80),life:.25,max:.25,s:1.6,c:'#ffd27a'});}}
    if(!lc.done&&G.time>=lc.end){lc.done=true;AU.sting();G.shake+=3;for(let i=0;i<20;i++){const a=P.ang+rr(-.4,.4),dd=rr(200,300),x=P.x+Math.cos(a)*dd,y=P.y+Math.sin(a)*dd,tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]]||!los(P.x,P.y,x,y))continue;G.vulto={x,y,life:6,seen:0,face:Math.atan2(P.y-y,P.x-x)};break;}}
    if(G.time>lc.until)G.lampChain=null;}
  // telefone tocando dentro do prédio: barulho que chama eles
  const ph=G.phone; if(ph){ph.t-=dt;if(ph.t<=0&&ph.n>0){ph.n--;ph.t=1.6;AU.phone(clamp(1-hyp(ph.x-P.x,ph.y-P.y)/700,.15,1));alertNoise(ph.x,ph.y,460);}if(ph.n<=0&&ph.t<=0)G.phone=null;}
  if(G.wave>0||G.heli||P.inCar)return;
  const night=isNight(), bc=G.lastD>=5;
  G.scareT-=dt; if(G.scareT>0)return; G.scareT=rr(30,70)*(gameAct()===3?1.6:1)*(night?(bc?.5:.75):1.6);
  if(enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<520))return;
  const r=Math.random();
  if(!night){
    // de dia os sustos são mais discretos: um grito longe, batidas, passos
    if(r<.4)AU.scream(rr(.15,.35)); else if(r<.7)AU.knock(); else AU.steps();
    return;
  }
  if(r<.12&&bc&&!G.lampChain){
    const ls=lights.filter(l=>(l.c==='lamp'||l.c==='neon')&&hyp(l.x-P.x,l.y-P.y)<720).sort((a,b)=>hyp(b.x-P.x,b.y-P.y)-hyp(a.x-P.x,a.y-P.y)).slice(0,9);
    if(ls.length>=3){ls.forEach((l,i)=>{l.offAt=G.time+i*.5;l.offUntil=G.time+16;l.clicked=false;});G.lampChain={ls,end:G.time+ls.length*.5+.3,until:G.time+16,done:false};return;}
  }
  if(r<.22&&G.inB>=0&&!inSafe()&&!G.phone){
    const b=buildings[G.inB];const x=tc(b.x+ri(1,b.w-2)),y=tc(b.y+ri(1,b.h-2));G.phone={x,y,t:.2,n:4};
    laterF(()=>{bark('rafa','s','Um telefone... tocando aqui dentro. Para. Para de tocar...');},1800);return;
  }
  if(r<.42){
    for(let i=0;i<20;i++){const a=P.ang+rr(-.5,.5),dd=rr(250,350),x=P.x+Math.cos(a)*dd,y=P.y+Math.sin(a)*dd,tx=(x/TILE)|0,ty=(y/TILE)|0;
      if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]]||bmap[idx(tx,ty)]>=0||!los(P.x,P.y,x,y))continue;
      G.vulto={x,y,life:9,seen:0,face:Math.atan2(P.y-y,P.x-x),beach:nc>.4};break;}
  } else if(r<.5)AU.scream(rr(.25,.6));
  else if(r<.62){if(!windowFace())AU.knock();}
  else if(r<.74){G.blackout=Math.max(G.blackout,1.3);AU.thud(.5);}
  else if(r<.88){AU.steps();if(Math.random()<.45){const a=P.ang+Math.PI+rr(-.4,.4);const x=P.x+Math.cos(a)*190,y=P.y+Math.sin(a)*190,tx=(x/TILE)|0,ty=(y/TILE)|0;
      if(inb(tx,ty)&&!SOLID[map[idx(tx,ty)]]&&reach[idx(tx,ty)]&&!safeMask[idx(tx,ty)]){const e=makeEnemy(nc>.4?'afog':'zumbi',x,y,null);e.state='investigate';e.nx=P.x;e.ny=P.y;e.it=8;enemies.push(e);}}}
  else if(G.flags.walkie)STORY.whisper(); else AU.scream(.3);
}
// Afogados saem do mar quando você anda perto da praia
function updAfog(dt){
  if(G.ev&&G.ev.silent)return;
  if(G.wave>0||P.inCar&&Math.abs(V.spd)>150)return;
  G.afogT-=dt; if(G.afogT>0)return; G.afogT=rr(9,16);
  const ptx=(P.x/TILE)|0,pty=(P.y/TILE)|0; if(pty<45)return;
  const cands=[];
  for(let y=pty-16;y<=pty+16;y+=2)for(let x=ptx-4;x<=ptx+24;x++){
    if(!inb(x+1,y))continue; if(map[idx(x,y)]!==T.SAND||map[idx(x+1,y)]!==T.WATER)continue;
    const d=hyp(tc(x)-P.x,tc(y)-P.y); if(d>320&&d<760&&reach[idx(x,y)])cands.push([x,y]);
  }
  if(!cands.length)return;
  const near=enemies.filter(e=>e.alive&&e.type==='afog').length; if(near>=6)return;
  const n=Math.random()<.35?2:1;
  for(let i=0;i<n;i++){const [x,y]=rpick(cands);const e=makeEnemy('afog',tc(x),tc(y),null);e.rising=1.1;e.stun=1;e.face=Math.PI;e.state='investigate';e.nx=P.x;e.ny=P.y;e.it=12;enemies.push(e);
    for(let k=0;k<14;k++){const a=Math.random()*6.28,s=rr(30,140);parts.push({k:'acid',x:e.x+12,y:e.y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.5,max:.5,s:rr(2,3.5),c:'#9ab8c8'});}
    AU.splash(clamp(1-hyp(e.x-P.x,e.y-P.y)/900,.2,1));}
  if(!G.flags.afogSeen){G.flags.afogSeen=true;laterF(()=>{bark('rafa','s','Tem gente saindo do mar... andando. Não, não é gente.');},600);}
}
function updPers(dt){
  if(!G.flags.persOn||G.heli)return;
  let p=enemies.find(e=>e.type==='pers');
  // ele só caça da Brava pra cima: em Balneário e na estrada ele some
  if(dAt((P.x/TILE)|0,(P.y/TILE)|0)>=4&&!G.flags.radio){if(p&&hyp(p.x-P.x,p.y-P.y)>420&&p.down<=0)p.alive=false;return;}
  if(!p){
    G.persT-=dt; if(G.persT>0)return;
    if(inSafe()){G.persT=4;return;}
    const sp=spawnPoint(780,1000,false,true); if(!sp){G.persT=2;return;}
    p=makeEnemy('pers',sp.x,sp.y,null); p.state='chase'; p.hunt=true; enemies.push(p);
    if(!G.flags.persSeen){G.flags.persSeen=true;const s2=spawnPoint(300,420,false,false);if(s2){p.x=s2.x;p.y=s2.y;}STORY.introPers(p);}
    AU.roar(); return;
  }
  const d=hyp(p.x-P.x,p.y-P.y);
  if(d>1500&&p.down<=0){G.persTp-=dt;if(G.persTp<=0){G.persTp=7;const sp=spawnPoint(780,1000,false,true);if(sp){p.x=sp.x;p.y=sp.y;}}}
}
function updWave(dt){
  if(G.wave>0){
    G.wave-=dt;
    if(G.wave<=0){G.wave=0;G.heli={t:0,landed:false};toast('O helicóptero está chegando!');AU.heli();STORY.heli();}
  }
  if(G.heli){
    G.heli.t+=dt;
    if(!G.heli.landed&&G.heli.t>7){G.heli.landed=true;toast('Ele pousou! Corra para o helicóptero!');STORY.landed();}
    if(G.heli.landed&&hyp(P.x-LM.pad.x,P.y-LM.pad.y)<70&&(typeof ALLY==='undefined'||!ALLY.list.length||ALLY.list.every(a=>a.boarded)||G.heli.t>13)){G.mode='win';AU.win();setTimeout(()=>UI.win(),600);}
  }
}
function markExplored(){
  const cx=(P.x/TILE)|0,cy=(P.y/TILE)|0,R0=9;
  for(let j=-R0;j<=R0;j++)for(let i=-R0;i<=R0;i++){if(i*i+j*j>R0*R0)continue;const x=cx+i,y=cy+j;if(inb(x,y))explored[idx(x,y)]=1;}
}
function snapCamera(){cam.x=P.x-view.w/view.z/2;cam.y=P.y-view.h/view.z/2;}
function updCamera(dt){
  const vw=view.w/view.z,vh=view.h/view.z, look=CUT.on?0:P.inCar?V.spd*.42:IN.touch?45:70, fc=CUT.on?cutFocus():P;
  const tx=fc.x+Math.cos(P.ang)*look-vw/2, ty=fc.y+Math.sin(P.ang)*look-vh/2;
  const k=1-Math.pow(CUT.on?.12:.003,dt); cam.x=lerp(cam.x,tx,k); cam.y=lerp(cam.y,ty,k);
  cam.x=clamp(cam.x,-40,W*TILE-vw+40); cam.y=clamp(cam.y,-40,HT*TILE-vh+40);
}
function update(dt){
  G.time+=dt;
  if(typeof v16Tick==='function')v16Tick(dt);
  if(CUT.on){
    updCut(dt); updParts(dt);
    for(const e of enemies)if(e.alive){e.anim+=dt*.6;e.flash=Math.max(0,e.flash-dt);}
    G.shake=Math.max(0,G.shake-dt*30); G.blackout=Math.max(0,G.blackout-dt); G.light=Math.max(0,G.light-dt*2.2);
    if(G.slam){G.slam.t-=dt;if(G.slam.t<=0)G.slam=null;}
    for(const t of G.toasts)t.life-=dt; G.toasts=G.toasts.filter(t=>t.life>0);
    if(G.banner){G.banner.life-=dt;if(G.banner.life<=0)G.banner=null;}
    G.zm=lerp(G.zm||1,CUT.zm||1.14,Math.min(1,dt*2));
    G.inB=bmap[idx((P.x/TILE)|0,(P.y/TILE)|0)];
    updVis(dt); updCamera(dt); return;
  }
  updPlayer(dt);
  updClock(dt);
  if(G.mode!=='play')return;
  const pt=idx((P.x/TILE)|0,(P.y/TILE)|0);
  flowT-=dt; if(flowT<=0&&(pt!==flowTile||flowT<-.8)){buildFlow();flowTile=pt;flowT=.2;}
  G.pSafe=inSafe()&&!P.inCar;
  G.litT-=dt; if(G.litT<=0){G.litT=.25;G.pLit=false;if(G.blackout<=0&&!P.hidden)for(const l of lights){if(l.c!=='lamp'&&l.c!=='flood'&&l.c!=='fire'&&l.c!=='neon')continue;if(!lightOn(l))continue;if(l.c!=='fire'&&daylight()>.6)continue;const dx=l.x-P.x,dy=l.y-P.y;if(Math.abs(dx)>l.r||Math.abs(dy)>l.r)continue;if(dx*dx+dy*dy<l.r*l.r*.22){G.pLit=true;break;}}}
  if(!DBG.freeze)for(const e of enemies)if(e.alive)updEnemy(e,dt);
  separate();
  enemies=enemies.filter(e=>e.alive);
  updProjs(dt); updParts(dt); updHazards(dt);
  updPers(dt); updSpawner(dt); updAfog(dt); updScares(dt); updEvents(dt); updPlot(dt); updTriggers(); updWave(dt); updVis(dt); updDetector(dt);
  G.expT-=dt; if(G.expT<=0){G.expT=.3;markExplored();}
  const d=dAt((P.x/TILE)|0,(P.y/TILE)|0);
  if(d!==G.lastD){const first=G.lastD===-1;if(!first||G.time<1)G.banner={t:DISTRICTS[d].name,life:3.2};G.lastD=d;if(!first)STORY.onDistrict(d);}
  updBark(dt);
  for(const a of [P,...npcs]){if(a.emote){a.emote.t-=dt;if(a.emote.t<=0)a.emote=null;}if(a.startle>0)a.startle-=dt;}
  G.inB=bmap[pt];
  G.prompt=findInteract();
  G.shake=Math.max(0,G.shake-dt*30); G.hurt=Math.max(0,G.hurt-dt*1.4);
  G.blackout=Math.max(0,G.blackout-dt); G.light=Math.max(0,G.light-dt*2.2);
  G.lightT-=dt; if(G.lightT<=0&&isNight()){G.lightT=rr(22,50);G.light=.55;G.thunderT=rr(.5,2);laterF(()=>{G.light=Math.max(G.light,.35);},140);}
  if(G.thunderT>0){G.thunderT-=dt;if(G.thunderT<=0)AU.thunder();}
  for(const h of G.hitDirs)h.life-=dt; G.hitDirs=G.hitDirs.filter(h=>h.life>0);
  if(G.slam){G.slam.t-=dt;if(G.slam.t<=0)G.slam=null;}
  {let nd=9999;for(const e of enemies)if(e.alive&&e.state==='chase'){const dd=hyp(e.x-P.x,e.y-P.y);if(dd<nd)nd=dd;}
   if(P.hidden)for(const e of enemies)if(e.alive&&hyp(e.x-P.x,e.y-P.y)<280){nd=Math.min(nd,150);}
   const danger=P.hp<P.max*.35||nd<220||(G.fear||0)>.55; G.heartT-=dt; if(danger&&G.heartT<=0){G.heartT=P.hp<P.max*.35?.55:.8;AU.heart(P.hp<P.max*.35?1:.6);}}
  if(G.muzzle){G.muzzle.t-=dt;if(G.muzzle.t<=0)G.muzzle=null;}
  if(G.boom){G.boom.t-=dt;if(G.boom.t<=0)G.boom=null;}
  for(const t of G.toasts)t.life-=dt; G.toasts=G.toasts.filter(t=>t.life>0);
  if(G.banner){G.banner.life-=dt;if(G.banner.life<=0)G.banner=null;}
  if(G.achPop){G.achPop.life-=dt;if(G.achPop.life<=0)G.achPop=null;}
  if(P.firing||P.reloading>0)G.lastAct=G.time;
  G.zm=lerp(G.zm||1,P.inCar?.74:1,Math.min(1,dt*2.5));
  updCamera(dt);
}
