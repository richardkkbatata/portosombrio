// ===================== ÁUDIO (sintetizado) =====================
const AU={
  ctx:null,on:true,lastGroan:0,
  init(){
    if(this.ctx){if(this.ctx.state==='suspended')this.ctx.resume();return;}
    try{
      const AC=window.AudioContext||window.webkitAudioContext; if(!AC)return;
      this.ctx=new AC(); this.master=this.ctx.createGain(); this.master.gain.value=this.on?.7:0; this.master.connect(this.ctx.destination);
      const len=this.ctx.sampleRate*2, b=this.ctx.createBuffer(1,len,this.ctx.sampleRate), d=b.getChannelData(0);
      for(let i=0;i<len;i++)d[i]=Math.random()*2-1; this.nb=b; this.amb();
    }catch(e){this.ctx=null;}
  },
  setOn(v){this.on=v;if(this.master)this.master.gain.setTargetAtTime(v?.7:0,this.ctx.currentTime,.05);},
  amb(){
    const c=this.ctx;
    const r=c.createBufferSource();r.buffer=this.nb;r.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1500;f.Q.value=.5;
    const g=c.createGain();g.gain.value=.05;r.connect(f);f.connect(g);g.connect(this.master);r.start();this.rainG=g;
    const g2=c.createGain();g2.gain.value=.03;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=170;lp.connect(g2);g2.connect(this.master);
    for(const fr of [55,55.7,82.4]){const o=c.createOscillator();o.type='sawtooth';o.frequency.value=fr;o.connect(lp);o.start();}
    this.droneG=g2;
    const g3=c.createGain();g3.gain.value=0;g3.connect(this.master);
    for(const fr of [220,261.6,329.6,392]){const o=c.createOscillator();o.type='sine';o.frequency.value=fr;const og=c.createGain();og.gain.value=.22;
      const lfo=c.createOscillator();lfo.frequency.value=.15+Math.random()*.2;const lg=c.createGain();lg.gain.value=.1;lfo.connect(lg);lg.connect(og.gain);lfo.start();
      o.connect(og);og.connect(g3);o.start();}
    this.safeG=g3;
  },
  mix(safe,inside){if(!this.ctx||!this.safeG)return;const t=this.ctx.currentTime;if(this.sendG)this.sendG.gain.setTargetAtTime(safe?.04:inside?.32:.14,t,.5);this.safeG.gain.setTargetAtTime(safe?.06:0,t,.7);this.droneG.gain.setTargetAtTime(safe?.006:.03,t,.7);this.rainG.gain.setTargetAtTime(inside?.016:.05,t,.4);},
  nz(dur,freq,q,vol,type='lowpass',delay=0){
    const c=this.ctx;if(!c||!this.on)return;const t=c.currentTime+delay;
    const s=c.createBufferSource();s.buffer=this.nb;const f=c.createBiquadFilter();f.type=type;f.frequency.value=freq;f.Q.value=q;
    const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);
    s.connect(f);f.connect(g);g.connect(this.master);if(this.sendG)g.connect(this.sendG);s.start(t,Math.random()*1.5);s.stop(t+dur+.05);
  },
  tn(f0,f1,dur,type,vol,delay=0){
    const c=this.ctx;if(!c||!this.on)return;const t=c.currentTime+delay;
    const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(1,f1),t+dur);
    const g=c.createGain();g.gain.setValueAtTime(vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+dur);o.connect(g);g.connect(this.master);if(this.sendG)g.connect(this.sendG);o.start(t);o.stop(t+dur+.05);
  },
  shot(id){
    switch(id){
      case 'pistola':this.nz(.16,2400,.8,.5);this.tn(180,60,.1,'square',.12);break;
      case 'escopeta':this.nz(.4,1300,.6,.8);this.tn(110,40,.2,'square',.25);this.nz(.12,300,1,.4,'lowpass',.32);break;
      case 'smg':this.nz(.09,2900,.9,.32);this.tn(200,90,.05,'square',.07);break;
      case 'magnum':this.nz(.5,1600,.5,.95);this.tn(90,30,.3,'sawtooth',.3);break;
      case 'sil':this.nz(.07,3600,1.6,.2,'bandpass');this.tn(520,240,.04,'square',.03);this.nz(.05,900,1,.06,'lowpass',.02);break;
      case 'lgran':this.nz(.2,600,1,.5);this.tn(140,60,.15,'triangle',.3);break;
    }
  },
  flame(){this.nz(.25,700,.4,.12,'bandpass');},
  reload(){this.tn(900,700,.04,'square',.06);this.tn(500,420,.05,'square',.06,.18);this.nz(.06,3000,2,.12,'highpass',.3);},
  click(){this.tn(1200,900,.03,'square',.05);},
  dry(){this.tn(1500,1400,.03,'square',.06);},
  swish(){this.nz(.12,1800,2,.18,'bandpass');},
  hit(){this.tn(140,60,.08,'square',.12);},
  hurt(){this.tn(320,140,.22,'sawtooth',.15);this.nz(.15,800,1,.18);},
  death(){this.tn(200,40,1.2,'sawtooth',.25);this.nz(1,400,.5,.3);},
  die(type){this.nz(.3,500,1,.18);this.tn(type==='cao'?400:120,type==='cao'?120:50,.3,'sawtooth',.08);},
  groan(e,v){
    if(!this.ctx)return;const now=this.ctx.currentTime;if(now-this.lastGroan<.7)return;this.lastGroan=now;
    const d=hyp(e.x-P.x,e.y-P.y),vol=clamp(1-d/650,0,1)*.12*v;if(vol<.01)return;
    if(e.type==='cao'){this.tn(420,260,.25,'sawtooth',vol);this.tn(380,240,.2,'sawtooth',vol*.8,.3);return;}
    const c=this.ctx,t=c.currentTime,o=c.createOscillator(),lfo=c.createOscillator(),lg=c.createGain(),f=c.createBiquadFilter(),g=c.createGain();
    o.type='sawtooth';o.frequency.value=rr(70,120);lfo.frequency.value=rr(4,8);lg.gain.value=12;lfo.connect(lg);lg.connect(o.frequency);
    f.type='bandpass';f.frequency.value=rr(400,700);f.Q.value=3;g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(vol,t+.15);g.gain.exponentialRampToValueAtTime(.0008,t+rr(.7,1.2));
    o.connect(f);f.connect(g);g.connect(this.master);o.start(t);lfo.start(t);o.stop(t+1.3);lfo.stop(t+1.3);
  },
  spit(e){const d=hyp(e.x-P.x,e.y-P.y);this.nz(.2,1200,3,.2*clamp(1-d/700,0,1),'bandpass');},
  roar(){this.tn(90,50,.9,'sawtooth',.2);this.nz(.8,300,.6,.2);},
  engine(v){
    const c=this.ctx;if(!c)return;
    if(!this.engO){if(v<=0)return;try{const o=c.createOscillator();o.type='sawtooth';const o2=c.createOscillator();o2.type='square';const f=c.createBiquadFilter();f.type='lowpass';f.frequency.value=320;const g=c.createGain();g.gain.value=0;o.connect(f);o2.connect(f);f.connect(g);g.connect(this.master);o.frequency.value=42;o2.frequency.value=21;o.start();o2.start();this.engO=o;this.engO2=o2;this.engG=g;this.engF=f;}catch(e){return;}}
    const t=c.currentTime;this.engG.gain.setTargetAtTime(v>0&&this.on?.05+v*.06:0,t,.12);this.engO.frequency.setTargetAtTime(38+v*70,t,.1);this.engO2.frequency.setTargetAtTime(19+v*35,t,.1);this.engF.frequency.setTargetAtTime(240+v*600,t,.1);
  },
  ach(){[523,659,784,1046].forEach((f,i)=>this.tn(f,f,.18,'triangle',.07,i*.08));},
  splash(v){this.nz(.5,900,.6,.25*v);this.nz(.3,2400,1,.1*v,'bandpass',.05);},
  sting(){[1046,1108,1568].forEach((f,i)=>this.tn(f,f*.98,.9,'sawtooth',.035,i*.02));this.nz(.5,4000,2,.12,'highpass');this.tn(70,40,.6,'sine',.35);},
  scream(v){this.tn(700,1300,1.1,'sawtooth',.05*v);this.tn(760,1150,1.1,'square',.03*v,.05);this.nz(1,2200,3,.06*v,'bandpass');},
  knock(){for(let i=0;i<3;i++){this.tn(110,60,.12,'sine',.4,i*.32);this.nz(.08,500,2,.18,'bandpass',i*.32);}},
  steps(){for(let i=0;i<5;i++)this.nz(.07,350+Math.random()*150,1.6,.13,'bandpass',i*.42);},
  wave(v){this.nz(2.2,420,.5,.07*v);this.nz(1.4,1200,.6,.03*v,'lowpass',.3);},
  hide(v){this.nz(.18,800,1,.12*v,'bandpass');this.tn(140,90,.15,'square',.04*v);},
  rev(v){this.tn(55,150,.9,'sawtooth',.12*v);this.tn(28,75,.9,'square',.08*v);this.nz(.6,300,.8,.08*v);},
  horn(){this.tn(392,392,.5,'square',.08);this.tn(330,330,.5,'square',.07);},
  thud(v){if(v<=0)return;this.tn(70,35,.2,'sine',.35*v);this.nz(.12,180,1,.2*v);},
  boom(v){this.nz(1.1,500,.4,.9*v);this.tn(80,25,.8,'sine',.6*v);},
  splat(){this.nz(.35,700,1.5,.3,'bandpass');},
  pickup(){this.tn(660,660,.08,'triangle',.1);this.tn(990,990,.12,'triangle',.08,.07);},
  paper(){this.nz(.25,4000,.6,.08,'highpass');},
  heal(){this.tn(520,780,.3,'sine',.1);this.tn(780,1040,.3,'sine',.07,.12);},
  craft(){this.tn(300,300,.05,'square',.06);this.tn(600,600,.08,'triangle',.08,.08);},
  unlock(){this.tn(200,200,.06,'square',.1);this.tn(150,150,.08,'square',.1,.1);this.nz(.3,900,1,.15,'bandpass',.15);},
  locked(){this.tn(160,150,.08,'square',.08);this.tn(160,150,.08,'square',.08,.12);},
  radio(){this.nz(1,2000,.3,.12,'bandpass');this.tn(1000,1000,.1,'sine',.08,.2);this.tn(1000,1000,.1,'sine',.08,.4);},
  heli(){const c=this.ctx;if(!c)return;for(let i=0;i<40;i++)this.nz(.09,220,1.5,.14,'lowpass',i*.12);},
  win(){[392,523,659,784].forEach((f,i)=>this.tn(f,f,.6,'triangle',.1,i*.18));},
  step(){this.nz(.05,400+Math.random()*200,1.5,.05,'bandpass');},
  save(){for(let i=0;i<6;i++)this.nz(.04,2500,2,.12,'bandpass',i*.07);this.tn(1800,1800,.05,'sine',.06,.5);},
  ui(){this.tn(800,800,.03,'square',.03);},
  blip(f,radio){if(!this.ctx||!this.on)return;this.tn(f*(.9+Math.random()*.25),f*.9,.035,radio?'sawtooth':'square',.025);if(radio&&Math.random()<.3)this.nz(.05,2500,1,.02,'bandpass');},
  hiss(e){if(!this.ctx)return;const d=e?hyp(e.x-P.x,e.y-P.y):300;const v=clamp(1-d/700,0,1)*.25;if(v<.01)return;this.nz(.45,3200,4,v,'bandpass');this.nz(.3,1800,6,v*.6,'bandpass',.1);},
  phone(v){for(let r=0;r<2;r++){this.tn(440,440,.38,'sine',.05*v,r*.5);this.tn(480,480,.38,'sine',.05*v,r*.5);}},
  heart(v){this.tn(62,40,.12,'sine',.5*v);this.tn(58,38,.12,'sine',.35*v,.17);},
  glass(v=1){this.nz(.35,4200,1.2,.45*v,'highpass');for(let i=0;i<5;i++)this.tn(2600+Math.random()*2400,1800,.06,'triangle',.05*v,.04+i*.05);this.nz(.2,900,1,.2*v,'bandpass',.02);},
  click2(v=1){for(let i=0;i<3;i++){this.tn(2400,1900,.018,'square',.07*v,i*.07);}this.nz(.05,3000,6,.05*v,'bandpass',.25);},
  beep(v=1,f=1400){this.tn(f,f,.06,'sine',.07*v);},
  alarm(){for(let i=0;i<4;i++){this.tn(880,660,.22,'square',.06,i*.5);this.tn(660,880,.22,'square',.06,i*.5+.25);}},
  bigBoom(){this.nz(3.2,140,.4,1);this.nz(1.4,900,.5,.6,'lowpass',.03);this.tn(60,22,2.6,'sine',.7);this.tn(40,18,3,'sawtooth',.25,.1);},
  shipHorn(){this.tn(73,72,3.8,'sawtooth',.25);this.tn(110,109,3.8,'sawtooth',.16);this.tn(55,54,4,'sine',.4);},
  bell(v=1){for(const [f0,a] of [[392,.25],[784,.12],[588,.08],[196,.2]])this.tn(f0,f0*.995,3.2,'sine',a*v);this.nz(.08,3000,2,.1*v,'bandpass');},
  drag(v=1){this.nz(.55,2300,6,.09*v,'bandpass');this.nz(.4,900,3,.06*v,'bandpass',.1);this.tn(140,120,.5,'sawtooth',.02*v);},
  creak(v=1){this.tn(90,60,1.4,'sawtooth',.12*v);this.nz(1.2,300,3,.15*v,'bandpass');},
  static(v=1,d=.5){this.nz(d,2600,.6,.12*v,'bandpass');},
  thunder(){this.nz(2.4,180,.5,.55);this.nz(1.2,700,.4,.25,'lowpass',.05);this.tn(48,30,1.8,'sine',.3);},
};

// ===================== ENTRADA =====================
const IN={mx:0,my:0,run:false,fire:false,aimAng:null,mouseX:0,mouseY:0,mouseOn:false,touch:false};
const KEYS={}; let mouseDown=false, lastTouchT=0, lastWheel=0;
const TOUCH={move:{id:null,ox:0,oy:0,x:0,y:0},aim:{id:null,ox:0,oy:0,x:0,y:0}};
function resetTouch(){TOUCH.move.id=null;TOUCH.aim.id=null;}
const STICK={r:50};
function hudF(){return (typeof HUDS!=='undefined'&&HUDS[OPT.hud])?HUDS[OPT.hud].f:1;}
function stickCenters(){
  const f=hudF(), portrait=view.h>view.w; STICK.r=50*f;
  const off=(portrait?82:80)*f, y=view.h-SAFE.b-(portrait?104:74)*f;
  return {move:{x:SAFE.l+off+(portrait?0:10),y},aim:{x:view.w-SAFE.r-off-(portrait?0:10),y},portrait};
}
// botões de ação em arco em volta do direcional de mira; USAR aparece no centro só quando há algo para usar
function layoutTouch(){
  const C=stickCenters(), A=C.aim, M=C.move, f=hudF(), R=STICK.r+38*f, pos={};
  const arc=(deg,r=R)=>[A.x+Math.cos(deg*Math.PI/180)*r,A.y+Math.sin(deg*Math.PI/180)*r];
  if(C.portrait){
    // em pé: coluna de botões na borda direita, acima da mira; curar acima do direcional de andar
    const cx=view.w-SAFE.r-30*f, top=A.y-STICK.r-34*f, gap=52*f;
    pos['tb-rel']=[cx,top]; pos['tb-wpn']=[cx,top-gap]; pos['tb-gren']=[cx,top-gap*2];
    pos['tb-dodge']=[A.x-STICK.r-30*f,A.y+STICK.r*.35]; pos['tb-heal']=[SAFE.l+30*f,M.y-STICK.r-34*f]; pos['tb-crouch']=[SAFE.l+30*f,M.y-STICK.r-86*f];
    pos['tb-use']=[view.w/2,M.y-STICK.r-96*f];
  } else {
    pos['tb-rel']=arc(190); pos['tb-wpn']=arc(232); pos['tb-gren']=arc(274); pos['tb-dodge']=arc(148,R+4*f);
    pos['tb-heal']=[M.x+Math.cos(-50*Math.PI/180)*R,M.y+Math.sin(-50*Math.PI/180)*R]; pos['tb-crouch']=[M.x+Math.cos(-100*Math.PI/180)*R,M.y+Math.sin(-100*Math.PI/180)*R];
    pos['tb-use']=[view.w/2,view.h-SAFE.b-84*f];
  }
  for(const id in pos){const el=document.getElementById(id);if(!el||!el.style)continue;el.style.left=pos[id][0]+'px';el.style.top=pos[id][1]+'px';}
}
// estado dos botões de toque (chamado a cada quadro)
let tcState='';
function updTouchUI(){
  if(!IN.touch)return;
  const tc=document.getElementById('tc'); if(!tc||tc.hidden)return;
  const pr=G.mode==='play'?G.prompt:null, txt=G.qte&&G.mode==='play'?(G.qte.multi?'':'AGORA!'):G.struggle&&G.mode==='play'?'FORÇA!':pr?promptText(pr):'';
  const thr=curThrow(), gn=invCount(thr), st=[txt,P.inCar,gn,thr,P.lamp&&P.bat>0,P.st<25,invCount('detector')>0,G.detOn,P.crouch,isFS()].join('|');
  if(st===tcState)return; tcState=st;
  const u=document.getElementById('tb-use'); if(u){u.hidden=!txt;const t=document.getElementById('tb-use-t');if(t)t.textContent=txt.length>30?txt.slice(0,29)+'…':txt;}
  tc.classList.toggle('car',!!P.inCar);
  const g=document.getElementById('tb-gren-n'); if(g)g.textContent=gn>0?String(gn):'';
  const ge=document.getElementById('tb-gren'); if(ge){ge.classList.toggle('dim',gn<=0);ge.classList.toggle('bt',thr==='garrafa');}
  const de=document.getElementById('tb-dodge'); if(de)de.classList.toggle('dim',P.st<25);
  const le=document.getElementById('tb-lamp'); if(le)le.classList.toggle('off',!(P.lamp&&P.bat>0));
  const ce=document.getElementById('tb-crouch'); if(ce)ce.classList.toggle('on',!!P.crouch);
  const fe=document.getElementById('tb-fs'); if(fe)fe.hidden=!(canFS()&&!isFS()&&!standalone());
  const dte=document.getElementById('tb-det'); if(dte){const has=invCount('detector')>0;dte.hidden=!has;dte.classList.toggle('off',!G.detOn);}
}
function readInput(){
  let mx=0,my=0;
  if(KEYS.KeyA||KEYS.ArrowLeft)mx-=1; if(KEYS.KeyD||KEYS.ArrowRight)mx+=1;
  if(KEYS.KeyW||KEYS.ArrowUp)my-=1; if(KEYS.KeyS||KEYS.ArrowDown)my+=1;
  IN.aimAng=null; IN.fire=mouseDown&&G.mode==='play'; IN.run=!!(KEYS.ShiftLeft||KEYS.ShiftRight); IN.horn=!!KEYS.KeyH;
  if(TOUCH.move.id!==null||TOUCH.aim.id!==null){
    const C=stickCenters(),Rr=STICK.r;
    if(TOUCH.move.id!==null){const dx=TOUCH.move.x-C.move.x,dy=TOUCH.move.y-C.move.y,d=hyp(dx,dy);if(d>7){const k=Math.min(1,d/Rr);mx=dx/d*k;my=dy/d*k;}IN.run=d>Rr*.92;}
    if(TOUCH.aim.id!==null){const dx=TOUCH.aim.x-C.aim.x,dy=TOUCH.aim.y-C.aim.y,d=hyp(dx,dy);if(d>8){IN.aimAng=Math.atan2(dy,dx);IN.fire=d>Rr*.38;}}
  }
  IN.mx=mx; IN.my=my;
}
function setTouchMode(on){
  if(IN.touch===on)return; IN.touch=on; document.getElementById('tc').hidden=!(on&&G.mode==='play'); if(on)IN.mouseOn=false;
  {const app=document.getElementById('app');if(app&&app.classList)app.classList.toggle('touchui',on);} tcState='';
  cv.style.cursor=on?'default':'none';
}
window.addEventListener('touchstart',()=>{lastTouchT=Date.now();setTouchMode(true);},{passive:true,capture:true});
window.addEventListener('keydown',e=>{
  AU.init();
  if(['Tab','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)&&G.mode!=='title')e.preventDefault();
  if(IN.touch&&Date.now()-lastTouchT>1500)setTouchMode(false);
  if(G.mode==='menu'&&UI.cur==='talk'){
    if(['Space','Enter','KeyE','NumpadEnter'].includes(e.code)){e.preventDefault();if(!e.repeat)dlgAdvance();}
    else if(e.code==='Escape')dlgSkip();
    else if(/^Digit[1-4]$/.test(e.code))dlgChoose(+e.code.slice(5)-1);
    return;
  }
  if(G.mode==='menu'){
    if(e.code==='Escape'||(UI.cur==='inv'&&['Tab','KeyI','KeyM'].includes(e.code))||(UI.cur==='doc'&&e.code==='KeyE')||(UI.cur==='debug'&&['Backquote','F2'].includes(e.code)))UI.back();
    return;
  }
  if(G.mode!=='play')return;
  if(CUT.on){e.preventDefault();if(e.repeat)return;if(['Space','Enter','KeyE','NumpadEnter'].includes(e.code))cutTap();else if(e.code==='Escape')cutSkip();else if(/^Digit[1-4]$/.test(e.code))cutChoose(+e.code.slice(5)-1);return;}
  if(P.grab&&!e.repeat){mashGrab();return;}
  KEYS[e.code]=true; if(e.repeat)return;
  switch(e.code){
    case 'KeyR':reload();break;
    case 'KeyE':doInteract();break;
    case 'Space':case 'ControlLeft':if(P.inCar||G.struggle||G.qte)doInteract();else dodge();break;
    case 'KeyQ':quickHeal();break;
    case 'KeyG':throwGrenade();break;
    case 'Tab':case 'KeyI':UI.inv('itens');break;
    case 'KeyM':UI.inv('mapa');break;
    case 'KeyF':toggleLamp();break;
    case 'KeyC':toggleCrouch();break;
    case 'KeyT':toggleDetector();break;
    case 'Backquote':case 'F2':e.preventDefault();UI.debug();break;
    case 'Escape':case 'KeyP':UI.pause();break;
    default: if(/^Digit[1-9]$/.test(e.code))switchWeapon(+e.code.slice(5)-1); else if(e.code==='Digit0')switchWeapon(9);
  }
});
window.addEventListener('keyup',e=>{KEYS[e.code]=false;});
window.addEventListener('blur',()=>{for(const k in KEYS)KEYS[k]=false;mouseDown=false;resetTouch();if(G.mode==='play')UI.pause();});
cv.addEventListener('mousemove',e=>{IN.mouseX=e.clientX;IN.mouseY=e.clientY;if(!IN.touch||Date.now()-lastTouchT>1500){if(IN.touch)setTouchMode(false);IN.mouseOn=true;}});
cv.addEventListener('mousedown',e=>{AU.init();if(CUT.on){cutTap();return;}if(P.grab){mashGrab();return;}if(G.qte&&G.mode==='play'){qtePress();return;}if(IN.touch&&Date.now()-lastTouchT<1500)return;IN.mouseX=e.clientX;IN.mouseY=e.clientY;IN.mouseOn=true;if(e.button===0)mouseDown=true;if(e.button===2&&G.mode==='play')dodge();});
window.addEventListener('mouseup',e=>{if(e.button===0)mouseDown=false;});
cv.addEventListener('contextmenu',e=>e.preventDefault());
cv.addEventListener('wheel',e=>{e.preventDefault();if(G.mode!=='play')return;const now=Date.now();if(now-lastWheel<160)return;lastWheel=now;cycleWeapon(e.deltaY>0?1:-1);},{passive:false});
cv.addEventListener('touchstart',e=>{
  e.preventDefault(); AU.init(); lastTouchT=Date.now(); setTouchMode(true);
  if(G.mode!=='play')return;
  if(CUT.on){cutTap();return;}
  if(P.grab)mashGrab();
  if(G.qte){qtePress();return;}
  const C=stickCenters();
  for(const t of e.changedTouches){
    const x=t.clientX,y=t.clientY, dm=hyp(x-C.move.x,y-C.move.y), da=hyp(x-C.aim.x,y-C.aim.y);
    const wantMove=dm<150||(x<view.w*.5&&da>=150);
    if(wantMove){if(TOUCH.move.id===null)Object.assign(TOUCH.move,{id:t.identifier,x,y});}
    else if(TOUCH.aim.id===null)Object.assign(TOUCH.aim,{id:t.identifier,x,y});
  }
},{passive:false});
cv.addEventListener('touchmove',e=>{
  e.preventDefault(); lastTouchT=Date.now();
  for(const t of e.changedTouches){for(const s of [TOUCH.move,TOUCH.aim]){if(s.id===t.identifier){s.x=t.clientX;s.y=t.clientY;}}}
},{passive:false});
function endTouch(e){for(const t of e.changedTouches){if(TOUCH.move.id===t.identifier)TOUCH.move.id=null;if(TOUCH.aim.id===t.identifier)TOUCH.aim.id=null;}}
cv.addEventListener('touchend',endTouch);cv.addEventListener('touchcancel',endTouch);
function bindTouchButtons(){
  const map={'tb-use':()=>doInteract(),'tb-rel':()=>reload(),'tb-heal':()=>quickHeal(),'tb-wpn':()=>cycleWeapon(1),'tb-gren':()=>throwGrenade(),'tb-inv':()=>UI.inv('itens'),'tb-pause':()=>UI.pause(),'tb-lamp':()=>toggleLamp(),'tb-det':()=>toggleDetector(),'tb-dodge':()=>dodge(),'tb-crouch':()=>toggleCrouch(),'tb-fs':()=>toggleFS()};
  for(const id in map){
    const el=document.getElementById(id); if(!el)continue;
    el.addEventListener('touchstart',e=>{e.preventDefault();e.stopPropagation();AU.init();lastTouchT=Date.now();if(el.classList)el.classList.add('down');buzz(8);if(P.grab){mashGrab();return;}if(G.mode==='play')map[id]();},{passive:false});
    const up=()=>{if(el.classList)el.classList.remove('down');};el.addEventListener('touchend',up);el.addEventListener('touchcancel',up);
    el.addEventListener('click',e=>{if(Date.now()-lastTouchT<600)return;if(G.mode==='play')map[id]();});
  }
}

// ===================== INTERFACE (menus) =====================
// ---------- ícones dos itens (desenhados em canvas) ----------
const ICONS={};
function paintIcon(c,id){
  const it=ITEMS[id], col=it.c; c.clearRect(0,0,64,64); c.lineCap='round'; c.lineJoin='round';
  const rr2=(x,y,w,h,r)=>{rrect(c,x,y,w,h,r);};
  const bullets=(n,x0,y0,dx,w,h,body,tip)=>{for(let i=0;i<n;i++){const x=x0+i*dx;c.fillStyle=body;c.fillRect(x,y0,w,h);c.fillStyle=tip;c.beginPath();c.moveTo(x,y0);c.lineTo(x+w/2,y0-w*.9);c.lineTo(x+w,y0);c.fill();}};
  switch(id){
    case 'm9':c.fillStyle='#2a2824';rr2(8,30,48,22,4);c.fill();c.fillStyle=col;c.fillRect(8,30,48,6);bullets(5,13,22,8,6,12,'#c9a24a','#d8b870');break;
    case 'm357':c.fillStyle='#2a2824';rr2(8,30,48,22,4);c.fill();c.fillStyle='#7a7d80';c.fillRect(8,30,48,6);bullets(4,14,20,10,7,14,'#bfb8a8','#8a6a3a');break;
    case 'cart':for(let i=0;i<3;i++){const x=12+i*14;c.fillStyle='#b5392a';rr2(x,16,11,30,3);c.fill();c.fillStyle='#c9a24a';c.fillRect(x,40,11,8);}break;
    case 'comb':c.fillStyle='#b8501e';rr2(14,14,36,40,5);c.fill();c.fillStyle='#8a3a14';c.fillRect(20,20,24,4);c.fillStyle='#2a2420';c.fillRect(38,8,8,8);c.strokeStyle='#e8a060';c.lineWidth=3;c.beginPath();c.moveTo(22,30);c.lineTo(42,46);c.moveTo(42,30);c.lineTo(22,46);c.stroke();break;
    case 'g40':for(let i=0;i<2;i++){const x=14+i*20;c.fillStyle='#6a7a3a';rr2(x,22,16,26,6);c.fill();c.fillStyle='#c9a24a';c.fillRect(x,42,16,8);c.fillStyle='#d8c04a';c.fillRect(x+4,22,8,4);}break;
    case 'virote':c.strokeStyle='#8a7050';c.lineWidth=3;for(let i=0;i<3;i++){c.beginPath();c.moveTo(14+i*6,52);c.lineTo(40+i*6,12);c.stroke();c.fillStyle='#c8ccd0';c.beginPath();c.moveTo(40+i*6,12);c.lineTo(36+i*6,20);c.lineTo(44+i*6,18);c.fill();c.fillStyle='#b03a3a';c.fillRect(12+i*6,48,5,6);}break;
    case 'gran':c.fillStyle='#4f5a2c';c.beginPath();c.arc(32,38,16,0,6.283);c.fill();c.fillStyle='#3a4220';for(let i=-1;i<=1;i++)c.fillRect(18,36+i*8,28,2);c.fillStyle='#8a8a86';c.fillRect(26,16,12,8);c.strokeStyle='#c8ccd0';c.lineWidth=2;c.beginPath();c.arc(44,18,6,0,6.283);c.stroke();break;
    case 'ervaV':case 'ervaR':c.fillStyle='#6a4a30';rr2(18,40,28,16,3);c.fill();c.fillStyle=col;for(const [x,y,r] of [[24,32,8],[38,30,8],[31,22,8],[31,36,7]]){c.beginPath();c.ellipse(x,y,r,r*.6,(x-31)*.08,0,6.283);c.fill();}break;
    case 'misVV':case 'misVR':c.fillStyle='rgba(220,220,210,.35)';rr2(18,14,28,40,6);c.fill();c.fillStyle=col;rr2(20,28,24,24,4);c.fill();c.fillStyle='#8a8a86';c.fillRect(20,10,24,6);break;
    case 'spray':c.fillStyle='#e6e2d6';rr2(20,16,24,40,5);c.fill();c.fillStyle='#b8261e';c.fillRect(27,30,10,4);c.fillRect(30,27,4,10);c.fillStyle='#55585c';c.fillRect(26,8,12,8);break;
    case 'polv':case 'polvF':c.fillStyle=col;c.beginPath();c.moveTo(18,24);c.quadraticCurveTo(14,54,32,54);c.quadraticCurveTo(50,54,46,24);c.closePath();c.fill();c.fillStyle='#4a3a2a';c.fillRect(22,18,20,8);c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.arc(32,40,6,0,6.283);c.fill();break;
    case 'pilha':for(let i=0;i<2;i++){const x=16+i*18;c.fillStyle='#3a5a8a';rr2(x,16,14,38,3);c.fill();c.fillStyle='#c8ccd0';c.fillRect(x,16,14,10);c.fillRect(x+4,11,6,5);c.fillStyle='#d8c04a';c.fillRect(x+3,36,8,3);}break;
    case 'cartao':case 'heliKey':c.fillStyle=col;rr2(10,18,44,28,4);c.fill();c.fillStyle='#2a2a2a';c.fillRect(10,24,44,6);c.fillStyle='#c9a24a';c.fillRect(16,34,10,8);break;
    case 'fusivel':c.fillStyle='#d8d0b0';rr2(14,24,36,16,6);c.fill();c.fillStyle='#8a8a86';c.fillRect(8,26,8,12);c.fillRect(48,26,8,12);c.fillStyle='#c9a24a';c.fillRect(22,28,20,8);break;
    case 'bateria':c.fillStyle='#2a3a6a';rr2(10,22,44,30,3);c.fill();c.fillStyle='#d04a3a';c.fillRect(16,16,8,6);c.fillStyle='#ddd';c.fillRect(40,16,8,6);c.fillStyle='#5a7ad8';c.fillRect(14,30,36,6);break;
    case 'garrafa':c.save();c.translate(32,32);c.rotate(-.6);c.fillStyle='#3e6a52';rr2(-16,-8,24,16,4);c.fill();c.fillRect(8,-4,12,8);c.fillStyle='rgba(220,255,230,.45)';c.fillRect(-13,-5,14,3);c.restore();break;
    case 'alicate':c.strokeStyle='#8a8a86';c.lineWidth=5;c.beginPath();c.moveTo(20,12);c.lineTo(34,34);c.moveTo(44,12);c.lineTo(30,34);c.stroke();c.strokeStyle=col;c.lineWidth=7;c.beginPath();c.moveTo(32,34);c.lineTo(20,56);c.moveTo(32,34);c.lineTo(44,56);c.stroke();break;
    case 'diesel':c.fillStyle=col;rr2(14,16,36,40,5);c.fill();c.fillStyle='#2a2420';c.fillRect(38,8,8,8);c.fillStyle='rgba(0,0,0,.3)';c.fillRect(20,26,24,4);c.fillStyle='#ddd';c.font='bold 10px sans-serif';c.fillText('DIESEL',17,46);break;
    case 'cartaoMestre':c.fillStyle=col;rr2(10,18,44,28,4);c.fill();c.fillStyle='#3a2a1a';c.fillRect(10,24,44,6);c.fillStyle='#fff';c.fillRect(16,34,18,4);break;
    case 'chaveMaq':case 'chaveDir':case 'chaveOnibus':case 'chaveCasa':c.fillStyle=col;c.beginPath();c.arc(22,32,10,0,6.283);c.fill();c.fillRect(30,29,24,6);c.fillRect(46,34,4,8);c.fillRect(38,34,4,6);c.fillStyle='#141516';c.beginPath();c.arc(22,32,4,0,6.283);c.fill();break;
    case 'detector':c.fillStyle='#22262a';rr2(14,10,36,46,6);c.fill();c.fillStyle='#0e2a20';c.beginPath();c.arc(32,28,12,0,6.283);c.fill();c.strokeStyle=col;c.lineWidth=1.5;c.beginPath();c.arc(32,28,8,0,6.283);c.stroke();c.fillStyle=col;c.beginPath();c.arc(36,24,2.5,0,6.283);c.fill();c.fillStyle='#55595e';c.fillRect(20,44,24,6);break;
    case 'gato':c.fillStyle=col;c.beginPath();c.arc(32,36,16,0,6.283);c.fill();c.beginPath();c.moveTo(18,28);c.lineTo(20,12);c.lineTo(30,22);c.fill();c.beginPath();c.moveTo(46,28);c.lineTo(44,12);c.lineTo(34,22);c.fill();c.fillStyle='#2a2010';c.beginPath();c.arc(26,34,2.5,0,6.283);c.arc(38,34,2.5,0,6.283);c.fill();c.fillStyle='#c0605a';c.beginPath();c.arc(32,40,2,0,6.283);c.fill();break;
    default:{c.fillStyle=col;c.beginPath();c.arc(24,30,10,0,6.283);c.fill();c.fillRect(30,27,22,6);c.fillRect(44,30,4,10);c.fillStyle='#141516';c.beginPath();c.arc(24,30,4,0,6.283);c.fill();}
  }
}
function iconHTML(id){
  if(!(id in ICONS)){
    try{const c=document.createElement('canvas');c.width=64;c.height=64;paintIcon(c.getContext('2d'),id);const u=c.toDataURL&&c.toDataURL('image/png');ICONS[id]=typeof u==='string'&&u.length>30?u:null;}catch(e){ICONS[id]=null;}
  }
  const it=ITEMS[id];
  return ICONS[id]?`<img class="iimg" src="${ICONS[id]}" alt=""><span class="ilab">${esc(it.s)}</span>`:`<span class="ico" style="--c:${it.c}">${esc(it.s)}</span>`;
}
const OV=document.getElementById('ov');
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const paras=t=>t.split('\n\n').map(p=>`<p>${esc(p).replace(/\n/g,'<br>')}</p>`).join('');
function fmtTime(s){const m=Math.floor(s/60),ss=Math.floor(s%60);return `${m}:${String(ss).padStart(2,'0')}`;}
// fechaduras de código espalhadas pelo mapa
// ---------- tela cheia ----------
function standalone(){try{return matchMedia('(display-mode: standalone)').matches||matchMedia('(display-mode: fullscreen)').matches||navigator.standalone===true;}catch(e){return false;}}
function canFS(){const d=document.documentElement;return !!(d&&(d.requestFullscreen||d.webkitRequestFullscreen));}
function isFS(){return !!(document.fullscreenElement||document.webkitFullscreenElement);}
function fsShow(){return !standalone();}
function isIOS(){try{return /iPhone|iPod/.test(navigator.userAgent)||(/Macintosh/.test(navigator.userAgent)&&navigator.maxTouchPoints>1&&!document.documentElement.requestFullscreen);}catch(e){return false;}}
function inFrame(){try{return window.self!==window.top;}catch(e){return true;}}
function fsHint(){const m=isIOS()?'O iPhone não deixa site nenhum abrir em tela cheia. Pra jogar sem as barras: Compartilhar → "Adicionar à Tela de Início" e abra o Porto Sombrio pelo ícone.':inFrame()?'O navegador bloqueou a tela cheia porque o jogo está dentro de outra página. Abra o jogo numa aba própria (ou instale pelo menu do navegador) e toque de novo.':'O navegador recusou a tela cheia. Tente pelo menu do navegador (⋮ → Tela cheia ou Instalar app).';toast(m);UI.fsMsg=m;setTimeout(()=>{try{const el=OV.querySelector('.foot')||OV.querySelector('.hint');if(el)el.textContent=m;}catch(e){}},420);}
function toggleFS(){
  try{
    if(isFS()){(document.exitFullscreen||document.webkitExitFullscreen).call(document);}
    else if(canFS()){const d=document.documentElement;const r=d.requestFullscreen?d.requestFullscreen({navigationUI:'hide'}):d.webkitRequestFullscreen();
      if(r&&r.then)r.then(()=>{try{if(screen.orientation&&screen.orientation.lock)screen.orientation.lock('landscape').catch(()=>{});}catch(e){}}).catch(()=>fsHint());
      else setTimeout(()=>{if(!isFS())fsHint();},600);}
    else fsHint();
  }catch(e){fsHint();}
  setTimeout(()=>{resize();if(typeof layoutTouch==='function')layoutTouch();},400);
}
const LOCKS={
  cofre:{n:4,code:'4072',kick:'Banco Popular',t:'Cofre',hint:'Um teclado de quatro dígitos.',open(){G.flags.cofre=true;ach('cofre');if(typeof wpnLimit==='function')wpnLimit({id:4});P.owned[4]=true;P.mags[4]=Math.max(P.mags[4],6);const left=invAdd('m357',6);if(left)boxAdd('m357',left);toast('Dentro do cofre: um Revólver Magnum e munição .357. Tecla 5 para equipar.');}},
  deposito:{n:3,code:'333',kick:'Conveniência do Posto',t:'Cadeado do depósito',hint:'Um cadeado de três números. O Juninho deixou um bilhete.',open(){const g=gates.find(g=>g.id==='deposito');if(g)openGate(g);G.flags.deposito=true;toast('O cadeado abriu.');}},
  vitrine:{n:4,code:'1860',kick:'Museu Histórico',t:'Vitrine do coronel',hint:'Fechadura eletrônica de quatro dígitos.',open(){G.flags.vitrine=true;if(!P.owned[4]){if(typeof wpnLimit==='function')wpnLimit({id:4});P.owned[4]=true;P.mags[4]=6;toast('O revólver do coronel. Funciona. Tecla 5 para equipar.');}else toast('Munição .357 guardada junto do revólver.');const l=invAdd('m357',8);if(l)boxAdd('m357',l);if(typeof invalidateRect==='function'&&LM.vitrine)invalidateRect((LM.vitrine.x/TILE)|0,(LM.vitrine.y/TILE)|0,1,1);}},
};
const UI={
  cur:null,tab:'itens',sel:null,code:'',backTo:null,
  open(html,cls,name){
    OV.className='ov'+(cls?' '+cls:''); OV.innerHTML=html; OV.hidden=false; this.cur=name;
    if(G.mode==='play')G.mode='menu';
    mouseDown=false; for(const k in KEYS)KEYS[k]=false; resetTouch();
    document.getElementById('tc').hidden=true;
    if(!IN.touch){const f=OV.querySelector('[data-focus]')||OV.querySelector('button:not([disabled])');if(f)f.focus({preventScroll:true});}
  },
  close(){
    OV.hidden=true; OV.innerHTML=''; this.cur=null;
    const dcb=this.docCb; this.docCb=null; if(dcb)setTimeout(()=>{try{dcb();}catch(e){console.error(e);}},60);
    if(G.mode==='menu')G.mode='play';
    document.getElementById('tc').hidden=!(IN.touch&&G.mode==='play');
    if(typeof DLG!=='undefined'&&DLG.pending.length&&G.mode==='play'){const [l,cb]=DLG.pending.shift();setTimeout(()=>{if(G.mode==='play'&&!UI.cur)UI.talk(l,cb);else DLG.pending.unshift([l,cb]);},60);}
  },
  back(){
    if(this.cur==='doc'&&this.backTo==='arquivos'){this.backTo=null;this.inv('arquivos');return;}
    if(this.cur==='opts')return this.act('optback',{});
    if(this.cur==='achs')return this.act('achback',{});
    if(this.cur==='controls'&&this.backTo){const b=this.backTo;this.backTo=null;b==='title'?this.title():this.pause();return;}
    if(this.cur==='title'||this.cur==='dead'||this.cur==='win'||this.cur==='diff'||this.cur==='intro')return;
    this.close();
  },
  title(){
    G.mode='title'; document.getElementById('tc').hidden=true;
    this.open(`<div class="title">
      <p class="kick">Uma noite em</p>
      <h1>Porto Sombrio</h1>
      <p class="lede">Balneário Camboriú caiu às 22h16. O último helicóptero parte do Porto de Itajaí, do outro lado da Estrada da Rainha.</p>
      <div class="menu">
        <button class="btn primary" data-a="new" data-focus>Novo jogo</button>
        ${fsShow()?`<button class="btn" data-a="fs">${isFS()?'Sair da tela cheia':'Tela cheia'}</button>`:''}
        ${hasSave()?'<button class="btn" data-a="cont">Continuar do último registro</button>':''}
        <button class="btn" data-a="controls">Controles</button>
        <button class="btn" data-a="opts" data-from="title">Opções</button>
        <button class="btn" data-a="achs">Conquistas ${ACHS.size} de ${ACH.length}</button>
      </div>
      <p class="foot">Versão ${(()=>{try{return GAME_VER;}catch(e){return '';}})()} · Melhor com fone de ouvido. Funciona no teclado e mouse ou na tela de toque.</p>
    </div>`,'title-ov','title');
  },
  diff(){
    this.open(`<div class="sheet narrow"><p class="kick">Novo jogo</p><h2>Escolha a dificuldade</h2>
      <div class="diffs">${['facil','normal','dificil'].map(k=>`<button class="card" data-a="diff" data-d="${k}" ${k==='normal'?'data-focus':''}><b>${DIFFS[k].n}</b><span>${DIFFS[k].d}</span></button>`).join('')}</div>
      <div class="row"><button class="btn ghost" data-a="title">Voltar</button></div></div>`,'','diff');
  },
  intro(){
    this.open(`<div class="paper intro"><p class="stamp">Balneário Camboriú · segunda-feira · 23h40</p>
      <p>Você é o Richard. Voltava de uma noite de jogo na casa de um amigo quando a moto morreu no meio da Avenida Brasil e a cidade começou a gritar. A Dona Cida te puxou para dentro do apartamento dela, o único com luz verde no prédio.</p>
      <p>O rádio fala de um último helicóptero no Porto de Itajaí. Entre você e ele: a Barra Norte, a Estrada da Rainha bloqueada pelo Exército, a Praia Brava, Cabeçudas e uma costa inteira que não está mais viva. A pé não dá. Vai precisar de um carro.</p>
      <p>A noite é longa e o dia também. De dia eles se escondem no escuro dos prédios e te enxergam de longe na rua. De noite saem todos, mais rápidos e em maior número. Você só enxerga o que está na sua frente.</p>
      <p>Os abrigos de luz verde são seguros. Neles você salva o jogo, guarda itens no baú e pode esperar a noite passar.</p>
      <div class="row"><button class="btn dark" data-a="start" data-focus>Começar</button></div></div>`,'','intro');
  },
  controls(from){
    this.backTo=from;
    this.open(`<div class="sheet"><p class="kick">Como jogar</p><h2>Controles</h2>
      <div class="ctrl-grid">
        <section><h3>Teclado e mouse</h3><dl class="keys">
          <dt>W A S D</dt><dd>Andar</dd><dt>Shift</dt><dd>Correr (gasta fôlego)</dd><dt>Mouse</dt><dd>Mirar</dd><dt>Clique</dt><dd>Atirar ou golpear</dd>
          <dt>R</dt><dd>Recarregar</dd><dt>Espaço</dt><dd>Esquiva (ou botão direito do mouse)</dd><dt>E</dt><dd>Pegar, abrir, falar</dd><dt>Q</dt><dd>Curar rápido</dd><dt>G</dt><dd>Granada de mão</dd><dt>F</dt><dd>Ligar e desligar a lanterna</dd>
          <dt>E no jipe</dt><dd>Entrar e sair. W A S D dirige, H buzina</dd><dt>1 a 9</dt><dd>Trocar de arma (ou a roda do mouse). 9 = mãos: empurra e derruba</dd><dt>Tab</dt><dd>Mochila</dd><dt>M</dt><dd>Mapa</dd><dt>Esc</dt><dd>Pausa</dd><dt>' ou F2</dt><dd>Menu de teste</dd></dl></section>
        <section><h3>Tela de toque</h3><dl class="keys">
          <dt>Lado esquerdo</dt><dd>Arraste para andar. Arraste até o fim para correr.</dd>
          <dt>Lado direito</dt><dd>Arraste para mirar. Mais longe, atira. A mira puxa para o inimigo mais próximo.</dd>
          <dt>Usar</dt><dd>Pegar, abrir, falar, entrar no jipe</dd><dt>No jipe</dt><dd>O lado esquerdo dirige. O direito buzina.</dd><dt>Botões</dt><dd>Em volta da mira: recarregar, trocar arma, granada e esquiva. Curar fica perto do direcional de andar. O botão USAR aparece no meio quando tem algo pra pegar.</dd></dl></section>
      </div>
      <h3>Dicas</h3>
      <ul class="tips"><li>Cada bairro tem um abrigo de luz verde. Os infectados não entram lá.</li>
      <li>Com a lanterna apagada eles só te veem quase encostando. Com ela acesa, ou parado embaixo de um poste, te veem de longe. Lanterna na cara deles também denuncia.</li>
      <li>Se um zumbi te agarrar, toque na tela (ou aperte qualquer tecla) várias vezes. Com faca, você contra-ataca rápido.</li>
      <li>A cidade está viva: gente fugindo, carros desgovernados, helicópteros. Salvar alguém pode render um presente. Ou te matar.</li>
      <li>Armários, caçambas e carros largados servem de esconderijo. Se alguém te viu entrar, ele vem te tirar de lá.</li>
      <li>Você começa sem arma. A faca quebra depois de alguns golpes. As mãos só empurram, mas um empurrão salva.</li>
      <li>Tiro chama atenção: quem ouvir vai conferir de onde veio. As pilhas acabam rápido, procure sempre.</li>
      <li>Ervas e pólvora viram itens melhores em Fabricar, na mochila.</li>
      <li>Leia os arquivos. Eles dizem onde estão as chaves e as senhas.</li>
      <li>Inchados explodem em ácido. Brutamontes investem em linha reta e ficam tontos se baterem na parede.</li>
      <li>Você não consegue matar o homem de sobretudo. Só derrubar por um tempo.</li>
      <li>Correr e atirar fazem barulho. Os Esfolados são cegos: ande devagar perto deles, ou use a besta, que é silenciosa.</li>
      <li>Nem todo corpo no chão está morto.</li>
      <li>Você só enxerga o que está à sua frente. Fora do cone de visão você só ouve: as marcas em volta do Richard mostram de onde vêm os passos (vermelhas quando estão atrás de você).</li>
      <li>De dia eles se escondem no escuro dos prédios e te veem de longe na rua. De noite saem todos, mais rápidos. No abrigo dá pra esperar a hora passar.</li>
      <li>Manequim que muda de lugar só muda quando ninguém está olhando. Mantenha a luz neles.</li>
      <li>A lanterna gasta pilha. Desligue (F ou botão Luz) quando estiver num lugar iluminado.</li></ul>
      <div class="row"><button class="btn" data-a="back" data-focus>Voltar</button></div></div>`,'','controls');
  },
  opts(from){
    if(from)this.optFrom=from;
    const seg=(a,cur,o)=>`<div class="seg">${Object.keys(o).map(k=>`<button data-a="${a}" data-k="${k}" class="${k===cur?'on':''}" aria-pressed="${k===cur}">${o[k].n}</button>`).join('')}</div>`;
    const fsOk=(()=>{try{return !!(document.fullscreenEnabled||document.webkitFullscreenEnabled);}catch(e){return false;}})();
    const iosHint=(()=>{try{return /iPhone|iPad|iPod/.test(navigator.userAgent)&&!(navigator.standalone);}catch(e){return false;}})();
    this.open(`<div class="sheet narrow"><p class="kick">Ajustes</p><h2>Opções</h2>
      <div class="opts">
        <div class="opt"><h3>Gráficos</h3>${seg('setq',QKEY,QUAL)}</div>
        <div class="opt"><h3>Brilho</h3>${seg('setbri',OPT.bri,BRIS)}<p class="hint">Use Claro se estiver jogando em lugar iluminado ou com o brilho do celular baixo.</p></div>
        <div class="opt"><h3>Câmera</h3><p class="hint">Automática: chega perto em lugar fechado e escuro, se afasta na rua e na praia.</p></div>
        <div class="opt"><h3>Tamanho dos botões e do painel</h3>${seg('sethud',OPT.hud,HUDS)}</div>
        <div class="opt"><h3>Som e vibração</h3><div class="seg"><button data-a="sound" class="${AU.on?'on':''}">Som ${AU.on?'ligado':'desligado'}</button><button data-a="vib" class="${OPT.vib?'on':''}">Vibração ${OPT.vib?'ligada':'desligada'}</button></div></div>
        ${fsOk?`<div class="opt"><h3>Tela</h3><div class="seg"><button data-a="fs">Tela cheia</button></div></div>`:''}
        ${iosHint?`<p class="hint">No iPhone: toque em Compartilhar e depois em "Adicionar à Tela de Início" para jogar em tela cheia, como um app.</p>`:''}
      </div>
      <div class="row"><button class="btn primary" data-a="optback" data-focus>Voltar</button></div></div>`,'','opts');
  },
  achs(from){
    if(from)this.achFrom=from;
    this.open(`<div class="sheet wide"><div class="tabs"><p class="kick">${ACHS.size} de ${ACH.length}</p><h2 style="margin-right:auto">Conquistas</h2><button class="btn ghost" data-a="achback">Voltar</button></div>
      <div class="achs">${ACH.map(a=>`<div class="ach${ACHS.has(a.id)?' on':''}"><span class="m">${ACHS.has(a.id)?'✓':'?'}</span><b>${esc(a.n)}</b><small>${esc(a.d)}</small></div>`).join('')}</div>
      <p class="hint">As conquistas ficam salvas neste aparelho, mesmo começando um jogo novo.</p></div>`,'','achs');
  },
  pause(){
    if(G.mode!=='play')return;
    this.open(`<div class="sheet narrow"><p class="kick">${fmtTime(G.time)} · ${DIFFS[G.diff].n}</p><h2>Pausa</h2>
      <div class="menu">
        <button class="btn primary" data-a="close" data-focus>Continuar</button>
        ${fsShow()?`<button class="btn" data-a="fs" data-from="pause">${isFS()?'Sair da tela cheia':'Tela cheia'}</button>`:''}
        <button class="btn" data-a="inv" data-t="itens">Maleta</button>
        <button class="btn" data-a="controls2">Controles</button>
        <button class="btn" data-a="opts" data-from="pause">Opções</button>
        <button class="btn" data-a="achs" data-from="pause">Conquistas ${ACHS.size} de ${ACH.length}</button>
        <button class="btn" data-a="debug">Menu de teste</button>
        <button class="btn ghost" data-a="quit">Sair para o título</button>
      </div>
      <p class="hint">O progresso só fica guardado quando você usa uma máquina de escrever num abrigo.</p></div>`,'','pause');
  },
  inv(tab){
    if(tab)this.tab=tab;
    if(this.sel!=null&&(this.sel>=G.slots||!G.inv[this.sel]))this.sel=null;
    const tabs=[['itens','Itens'],['mapa','Mapa'],['arquivos',`Arquivos ${G.files.size}/${DOCS.length}`]];
    this.open(`<div class="sheet wide inv">
      <div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${this.tab===k}" class="tab${this.tab===k?' on':''}" data-a="tab" data-t="${k}">${l}</button>`).join('')}
      <button class="btn ghost closebtn" data-a="close">Fechar</button></div>
      <div class="tabbody">${this.tab==='itens'?this.itensBody():this.tab==='mapa'?this.mapBody():this.filesBody()}</div></div>`,'','inv');
    if(this.tab==='mapa')this.paintMap();
  },
  itensBody(){
    const r=P.hp/P.max, st=r>=.6?['Bem','ok']:r>=.3?['Cuidado','warn']:['Perigo','bad'];
    const used=G.inv.filter(Boolean).length;
    const wpns=WEAPONS.map((w,i)=>P.owned[i]?`<button class="wpn${P.w===i?' on':''}" data-a="wpn" data-w="${i}"><span class="k">${i===9?0:i+1}</span>${weaponIconURL(i)?`<img class="wimg" alt="" src="${weaponIconURL(i)}">`:''}<b>${w.n}</b><small>${w.melee?'corpo a corpo':P.mags[i]+' / '+w.mag+' · '+invCount(w.ammo)+' na mochila'}</small></button>`:'').join('');
    const slots=[];for(let i=0;i<G.slots;i++){const s=G.inv[i];const it=s&&ITEMS[s.id];
      slots.push(`<button class="slot${this.sel===i?' on':''}${s?'':' empty'}" data-a="slot" data-i="${i}" aria-label="${s?esc(it.n)+(s.q>1?' '+s.q:''):'Espaço vazio'}">${s?`${iconHTML(s.id)}${it.st>1?`<span class="q">${s.q}</span>`:''}`:''}</button>`);}
    let det='<p class="hint">Toque num item para ver o que dá para fazer com ele.</p>';
    if(this.sel!=null&&G.inv[this.sel]){
      const s=G.inv[this.sel],it=ITEMS[s.id]; const acts=[];
      if(it.k==='heal'||it.k==='battery')acts.push(`<button class="btn primary" data-a="use">Usar</button>`);
      if(it.k==='throw'||s.id==='gran')acts.push(`<button class="btn primary" data-a="thr">${curThrow()===s.id?'Na mão':'Deixar na mão'}</button>`);
      if(s.id==='silenciador')acts.push(`<button class="btn primary" data-a="sil">Rosquear na pistola</button>`);
      if(s.id==='detector')acts.push(`<button class="btn primary" data-a="det">${G.detOn?'Desligar':'Ligar'}</button>`);
      if(it.k==='throw')acts.push(`<span class="hint">Arremesse com G ou com o botão Granada.</span>`);
      if(it.k==='key')acts.push(`<span class="hint">Itens-chave são usados sozinhos quando você interage com o lugar certo.</span>`);
      if(it.k!=='key')acts.push(`<button class="btn ghost" data-a="drop">Largar no chão</button>`);
      det=`<h3>${esc(it.n)}${s.q>1?` <span class="dim">×${s.q}</span>`:''}</h3><p>${esc(it.d)}</p><div class="row">${acts.join('')}</div>`;
    }
    const recs=RECIPES.map((rc,i)=>{const need=Object.entries(rc.need).map(([k,n])=>`${n} ${ITEMS[k].n}`).join(' + ');const ok=canCraft(rc);
      return `<button class="rec" data-a="craft" data-r="${i}" ${ok?'':'disabled'}><span>${esc(need)}</span><b>→ ${esc(ITEMS[rc.give[0]].n)}${rc.give[1]>1?' ×'+rc.give[1]:''}</b></button>`;}).join('');
    return `<div class="inv-grid">
      <section class="col"><div class="status ${st[1]}"><span>Condição</span><b>${st[0]}</b></div>
        <h3>Armas</h3><div class="wpns">${wpns}</div>
        <h3>Mochila <span class="dim">${used}/${G.slots}</span></h3><div class="slots">${slots.join('')}</div></section>
      <section class="col"><div class="detail">${det}</div><h3>Fabricar</h3><div class="recs">${recs}</div></section></div>`;
  },
  mapBody(){
    return `<div class="mapwrap"><canvas id="mapc" aria-label="Mapa de Balneário Camboriú a Itajaí"></canvas></div>
      <p class="legend"><span class="lg safe"></span>Abrigo seguro <span class="lg obj"></span>Objetivo <span class="lg gate"></span>Portão trancado <span style="color:#7ab8e8">◆</span> Missão secundária <span style="color:#e8d84a">●</span> Personagem <span class="lg you"></span>Você · Fotos ${typeof FOTOS!=='undefined'?FOTOS.reduce((n,_,i)=>n+(G.files.has(FOTO0+i)?1:0),0):0}/12</p>`;
  },
  paintMap(){
    const c=document.getElementById('mapc'); if(!c)return;
    const wrap=(c.parentElement||c).getBoundingClientRect(), d=Math.min(2,window.devicePixelRatio||1);
    const cssW=Math.max(200,Math.min(wrap.width-14,560)), cssH=cssW*H/W;
    c.style.width=cssW+'px'; c.style.height=cssH+'px';
    c.width=Math.round(cssW*d); c.height=Math.round(cssH*d);
    drawMapTo(c);
    const w=c.parentElement; if(w&&w.scrollTo)try{w.scrollTop=Math.max(0,P.y/TILE/H*cssH-w.clientHeight/2);}catch(e){}
  },
  filesBody(){
    if(!G.files.size)return `<p class="hint">Nenhum arquivo ainda. Procure papéis brilhando pelo chão.</p>`;
    return `<div class="files">${[...G.files].sort((a,b)=>a-b).map(i=>`<button class="filebtn" data-a="readdoc" data-i="${i}"><b>${esc(DOCS[i].t)}</b><span>Arquivo ${String(i+1).padStart(2,'0')}</span></button>`).join('')}</div>`;
  },
  doc(i,from,cb){
    this.backTo=from||null; this.docCb=cb||null;
    this.open(`<article class="paper"><p class="stamp">Arquivo ${String(i+1).padStart(2,'0')} de ${DOCS.length}</p><h2>${esc(DOCS[i].t)}</h2>${paras(DOCS[i].b)}
      <div class="row"><button class="btn dark" data-a="back" data-focus>${from?'Voltar':'Fechar'}</button></div></article>`,'','doc');
  },
  box(){
    const inv=G.inv.map((s,i)=>s?`<button class="li" data-a="tobox" data-i="${i}"><span class="lico">${iconHTML(s.id)}</span><b>${esc(ITEMS[s.id].n)}</b><span class="q2">${s.q>1?'×'+s.q:''}</span></button>`:'').join('')||'<p class="hint">Mochila vazia.</p>';
    const bx=G.box.map((s,i)=>`<button class="li" data-a="frombox" data-i="${i}"><span class="lico">${iconHTML(s.id)}</span><b>${esc(ITEMS[s.id].n)}</b><span class="q2">${s.q>1?'×'+s.q:''}</span></button>`).join('')||'<p class="hint">O baú está vazio.</p>';
    this.open(`<div class="sheet wide"><p class="kick">Abrigo</p><h2>Baú de itens</h2><p class="hint">Toque num item para mudar de lado. O que fica no baú aparece em todos os abrigos.</p>
      <div class="boxcols"><section><h3>Mochila <span class="dim">${G.inv.filter(Boolean).length}/${G.slots}</span></h3><div class="list">${inv}</div></section>
      <section><h3>Baú</h3><div class="list">${bx}</div></section></div>
      <div class="row"><button class="btn" data-a="close">Fechar</button></div></div>`,'','box');
  },
  keypad(lock='cofre'){
    this.lock=lock; const L=LOCKS[this.lock||'cofre'];
    const k=[1,2,3,4,5,6,7,8,9,'del',0,'ok'];
    const shown=(this.code+'____'.slice(0,L.n)).slice(0,L.n).split('').join(' ');
    this.open(`<div class="sheet narrow keypad"><p class="kick">${L.kick}</p><h2>${L.t}</h2><p class="hint">${L.hint}</p>
      <output class="code" aria-live="polite">${shown}</output>
      <div class="keys">${k.map(v=>`<button class="kp${v==='ok'?' ok':''}" data-a="kp" data-k="${v}">${v==='del'?'Apagar':v==='ok'?'Abrir':v}</button>`).join('')}</div>
      <div class="row"><button class="btn ghost" data-a="close">Sair</button></div></div>`,'','keypad');
  },
  save(){
    const night=isNight();
    this.open(`<div class="sheet narrow"><p class="kick">Abrigo · ${clockStr()} · dia ${dayNo()}</p><h2>Máquina de escrever</h2><p>Registrar o progresso? O registro anterior será substituído.</p>
      <div class="row"><button class="btn primary" data-a="dosave" data-focus>Salvar</button><button class="btn ghost" data-a="close">Cancelar</button></div>
      <h3>Descansar</h3><p class="hint">Esperar aqui dentro passa as horas e recupera um pouco de saúde. Lá fora a cidade continua andando.</p>
      <div class="row">${night?'<button class="btn" data-a="rest" data-h="6">Esperar amanhecer</button>':'<button class="btn" data-a="rest" data-h="19">Esperar anoitecer</button>'}<button class="btn" data-a="rest" data-h="+3">Esperar 3 horas</button></div></div>`,'','save');
  },
  radio(){
    this.open(`<div class="sheet narrow"><p class="kick">Heliporto</p><h2>Rádio militar</h2><p>Chamar o resgate agora? O helicóptero leva 90 segundos para chegar, e o barulho vai atrair tudo que está por perto.</p>
      <div class="row"><button class="btn primary" data-a="callradio" data-focus>Chamar resgate</button><button class="btn ghost" data-a="close">Ainda não</button></div></div>`,'','radio');
  },
  npc(n){STORY.npc(n);},
  dead(){
    this.open(`<div class="dead"><h1>Você morreu</h1><p class="lede">${fmtTime(G.time)} na cidade · ${G.kills} infectados derrubados</p>
      <div class="menu">${hasSave()?'<button class="btn primary" data-a="load" data-focus>Voltar ao último registro</button>':''}
      <button class="btn" data-a="restart" ${hasSave()?'':'data-focus'}>Recomeçar do início</button><button class="btn ghost" data-a="quit">Título</button></div></div>`,'dead-ov','dead');
  },
  win(){
    const t=G.time/60; let rank=t<50&&G.saves<=4?'S':t<75?'A':t<110?'B':'C'; if(G.diff==='facil'&&rank==='S')rank='A';
    ach('fuga'); if(G.diff==='dificil')ach('dificil'); if(rank==='S')ach('rankS');
    const side=(G.flags.catDone?1:0)+(G.flags.cofre?1:0);
    this.open(`<div class="sheet narrow win"><p class="kick">Você escapou do litoral</p>
      <h2 class="endt">${esc(STORY.ending().t)}</h2>
      <div class="rankrow"><div class="rank">${rank}</div><p>${esc(STORY.ending().b)}</p></div>
      <dl class="stats"><dt>Tempo</dt><dd>${fmtTime(G.time)}</dd><dt>Dificuldade</dt><dd>${DIFFS[G.diff].n}</dd><dt>Infectados derrubados</dt><dd>${G.kills}</dd>
      <dt>Registros salvos</dt><dd>${G.saves}</dd><dt>Arquivos lidos</dt><dd>${G.files.size} de ${DOCS.length}</dd><dt>Pedidos atendidos</dt><dd>${side} de 2</dd></dl>
      <p class="hint">Rank S: menos de 50 minutos e no máximo 4 registros, fora do Fácil.</p>
      <div class="row"><button class="btn primary" data-a="restart" data-focus>Jogar de novo</button><button class="btn ghost" data-a="quit">Título</button></div></div>`,'','win');
  },
  debug(){
    if(G.mode==='play')G.mode='menu';
    const tg=(k,l)=>`<button class="dbgt${DBG[k]?' on':''}" data-a="dbg" data-k="t:${k}" aria-pressed="${DBG[k]}">${l}<span>${DBG[k]?'ligado':'desligado'}</span></button>`;
    const bt=(k,l)=>`<button class="dbgb" data-a="dbg" data-k="${k}">${l}</button>`;
    const TP=[['start','Apartamento da Dona Cida'],['marlon','Marlon · Edifício Yacht'],['nico','Nicolas · surf shop'],['alex','Prof. Rese · Mercado Público'],['marlonA','Marlon · Armazém 4 (porto)'],['bondBS','Bondinho · estação Barra Sul'],['bondMA','Bondinho · Mata Atlântica'],['colonia','Laranjeiras · colônia (Seu Ivo)'],['geradorL','Laranjeiras · gerador do Rancho'],['bondL','Laranjeiras · estação'],['taquarinhas','Taquarinhas · acampamento'],['hospIt','Santa Clara · porta da frente'],['isol','Santa Clara · isolamento (Matheus)'],['alicate','Santa Clara · manutenção (alicate)'],['hospExit','Santa Clara · saída dos fundos'],['church','Paróquia Santa Inês'],['coreto','Praça Tamandaré'],['delegacia','Delegacia'],['mercado','Supermercado'],['cofre','Banco (cofre)'],['posto','Posto da Av. do Estado'],['oficina','Oficina do Tião'],['shop','Shopping Atlântico'],['grade','Drogaria do shopping'],['farmacia','Hospital Ruth Cardoso'],['ginasio','Ginásio (abrigo caído)'],['cemiterio','Cemitério'],['acamp','Acampamento do Exército'],['capela','Cristo Luz'],['roda','Roda-gigante'],['bloqueio','Barricada da Estrada'],['mirante','Morro do Careca'],['clinica','Clínica da Brava'],['surf','Surf shop'],['vertice','Bloqueio de Cabeçudas'],['itajai','Mercado Público de Itajaí'],['armazem','Armazém do porto'],['lab','Laboratório Vértice'],['radio','Heliponto'],['colegio','Colégio Estadual'],['boate','Ressaca Club'],['obra','Obra do Residencial Marea'],['rodov','Rodoviária'],['van','Van da Vértice (shopping)'],['painelShop','Casa de máquinas do shopping'],['resort','Resort Brava Mar'],['quarto107','Quarto 107'],['maqResort','Casa de máquinas do resort'],['hospIt','Hospital Santa Clara'],['isol','Isolamento (Santa Clara)'],['alicate','Manutenção (Santa Clara)'],['matriz','Igreja Matriz'],['vitrine','Museu (vitrine)'],['bombeiros','Bombeiros'],['guindaste','Guindaste'],['cais','Cais do porto'],['onibus','Ônibus 22 (rodoviária)'],['bondinho','Estação do bondinho (Barra Sul)'],['bondMA','Estação Mata Atlântica'],['colonia','Colônia de pescadores'],['geradorL','Rancho das Laranjeiras'],['taquarinhas','Praia de Taquarinhas'],['cctv','Guarita do condomínio'],['casa4','Casa 4 (Brava)'],['sino','Sino da Matriz']];
    this.open(`<div class="sheet wide dbg"><div class="tabs"><p class="kick">Ferramentas</p><h2 style="margin-right:auto">Menu de teste</h2><button class="btn ghost" data-a="close">Fechar</button></div>
      <p class="hint">Use para testar o jogo. O que você liga aqui vale só para esta partida e não vai para o registro salvo.</p>
      <div class="dbg-grid">
        <section><h3>Jogador</h3><div class="dbg-list">${tg('god','Invencível')}${tg('ammo','Munição infinita')}${tg('noclip','Atravessar paredes')}
          <button class="dbgt" data-a="dbg" data-k="speed">Velocidade<span>${DBG.speed}x</span></button>${bt('heal','Curar tudo')}${bt('bat','Carregar lanterna')}${bt('slots','+4 espaços na mochila')}</div></section>
        <section><h3>Itens</h3><div class="dbg-list">${bt('weapons','Todas as armas')}${bt('keys','Todas as chaves e itens-chave')}${bt('ammokit','Kit de munição')}${bt('healkit','Kit de cura')}${bt('files','Todos os arquivos')}</div></section>
        <section><h3>Mundo</h3><div class="dbg-list"><button class="dbgt" data-a="dbg" data-k="clock">Hora<span>${clockStr()}</span></button>${tg('bright','Luz total')}${bt('gates','Abrir todos os portões')}${bt('map','Revelar o mapa')}${bt('light','Raio agora')}${bt('blackout','Apagão')}${bt('pers','Chamar o Perseguidor')}${bt('car','Jipe consertado aqui')}</div></section>
        <section><h3>Inimigos</h3><div class="dbg-list">${Object.keys(ETYPES).map(k=>bt('spawn:'+k,'Criar '+ETYPES[k].n)).join('')}${bt('kill','Matar todos por perto')}${tg('freeze','Congelar inimigos')}${tg('ai','Mostrar estado da IA')}</div></section>
        <section><h3>Pular na história</h3><div class="dbg-list">${bt('j:posto','Ato 1 · Posto (bateria)')}${bt('j:caos','Ato 1 · Jipe pronto, Edu, caos')}${bt('j:laranj','Ato 1 · Laranjeiras (bondinho)')}${bt('j:brava','Ato 2 · Chegada na Brava')}${bt('j:gerador','Ato 2 · Diesel na mão')}${bt('j:bc2','Ato 2 · Balneário em silêncio (Bombeiro)')}${bt('j:shop','Ato 2 · Armadilha do shopping')}${bt('j:itajai','Ato 3 · Itajaí')}${bt('j:hosp','Ato 3 · Santa Clara')}${bt('j:porto','Ato 3 · Porto com o Matheus')}${bt('j:navio','Ato 3 · Navio no cais')}</div></section>
        <section><h3>Pular (1.1)</h3><div class="dbg-list">${bt('j:ivo','Laranjeiras · Seu Ivo vivo (colônia)')}${bt('j:hospIn','Santa Clara · entrando (porta tranca)')}${bt('j:hospSaida','Santa Clara · na saída com alicate')}${bt('j:cida','Balneário em silêncio · prédio da Dona Cida')}</div></section>
        <section><h3>Personagens (1.2)</h3><div class="dbg-list">${bt('j:marlon','Marlon · Barra Sul (Edifício Yacht)')}${bt('j:nico','Nicolas · surf shop da Brava')}${bt('j:alex','Prof. Alex Rese · Mercado Público')}${bt('j:final','Batalha final com os três')}${bt('allyNow','Chamar os três agora (na batalha)')}${bt('photos','Ganhar todas as fotos')}${bt('throws','Rojões e sinalizadores')}</div></section>
        <section><h3>Medo e som (1.1)</h3><div class="dbg-list">${tg('fearMax','Medo no máximo')}${tg('ouv','Ver faro e escuta da cega')}${bt('ouvHere','Chamar a cega até você')}${bt('cry','Grito de socorro agora')}${bt('trap','Alguém preso pedindo ajuda')}${bt('name','Sussurrar o nome')}${bt('echo','Passos que param depois')}${bt('glitch','Objetivo falhando')}${bt('ghost','Rádio do Tião (morto)')}${bt('amb','Som da noite')}${bt('qte','Testar esforço (barra)')}</div></section>
        <section><h3>Missão</h3><div class="dbg-list">${bt('end','Pular para o heliponto')}${bt('wave','Chamar o resgate (15 s)')}${bt('win','Vencer agora')}${bt('die','Morrer agora')}${tg('fps','Mostrar FPS')}</div></section>
        <section><h3>Teleportar</h3><div class="dbg-list">${TP.filter(([k])=>k==='start'||LM[k]).map(([k,l])=>bt('tp:'+k,l)).join('')}</div></section>
      </div></div>`,'','debug');
  },
  dbgAct(k,ds){
    const give=(id,q)=>{const l=invAdd(id,q);if(l)boxAdd(id,l);};
    const goTo=(pt)=>{if(P.inCar)exitCar(true);const [x,y]=freeTileNear((pt.x/TILE)|0,(pt.y/TILE)|0,true);P.x=tc(x);P.y=tc(y);snapCamera();flowTile=-1;};
    if(k.startsWith('t:')){const f=k.slice(2);DBG[f]=!DBG[f];return this.debug();}
    if(k.startsWith('tp:')){const t=k.slice(3);goTo(t==='start'?START:LM[t]);this.close();toast('Teleportado.');return;}
    if(k.startsWith('j:')){this.close();dbgJump(k.slice(2));return;}
    if(k.startsWith('spawn:')){const t=k.slice(6);const a=P.ang,x=P.x+Math.cos(a)*170,y=P.y+Math.sin(a)*170;
      const [tx,ty]=freeTileNear((x/TILE)|0,(y/TILE)|0,true);const e=makeEnemy(t,tc(tx),tc(ty),null);e.state='chase';if(e.t.blind){e.heard=5;e.nx=P.x;e.ny=P.y;}enemies.push(e);this.close();return;}
    switch(k){
      case 'speed':DBG.speed=DBG.speed===1?1.6:DBG.speed===1.6?2.5:1;return this.debug();
      case 'clock':G.clock+=180;return this.debug();
      case 'heal':P.hp=P.max;break;
      case 'bat':P.bat=100;P.lamp=true;break;
      case 'slots':G.mw=Math.min(11,(G.mw||8)+1);G.mh=Math.min(8,(G.mh||6)+1);break;
      case 'weapons':WEAPONS.forEach((w,i)=>{P.owned[i]=true;P.mags[i]=w.mag||0;});break;
      case 'keys':for(const id of ['fusivel','cartao','heliKey','bateria','gato','diesel','cartaoMestre','chaveMaq','chaveDir','alicate','detector','chaveOnibus','chaveCasa'])give(id,1);give('garrafa',6);break;
      case 'ammokit':give('m9',60);give('cart',24);give('m357',12);give('comb',200);give('g40',8);give('virote',20);give('gran',5);give('pilha',4);break;
      case 'healkit':give('spray',2);give('misVR',2);give('ervaV',2);break;
      case 'files':DOCS.forEach((d,i)=>G.files.add(i));break;
      case 'gates':for(const g of gates){if(!g.open)openGate(g);G.flags[g.id]=true;}G.flags.fuse=true;break;
      case 'map':explored.fill(1);G.flags.mapAll=true;break;
      case 'light':G.light=.6;G.thunderT=.5;this.close();return;
      case 'blackout':G.blackout=10;this.close();return;
      case 'pers':G.flags.persOn=true;G.persT=0;this.close();return;
      case 'car':{if(P.inCar)exitCar(true);G.flags.jipe=true;G.flags.metTiao=true;Object.assign(V,{ok:true,dead:false,hp:V.max,spd:0,ang:P.ang});const [x,y]=freeTileNear(((P.x+Math.cos(P.ang)*60)/TILE)|0,((P.y+Math.sin(P.ang)*60)/TILE)|0,true);V.x=tc(x);V.y=tc(y);this.close();toast('Jipe pronto. Chegue perto e use E.');return;}
      case 'kill':for(const e of enemies){if(!e.alive||hyp(e.x-P.x,e.y-P.y)>800)continue;if(e.stalker)killEnemy(e);else{e.hp=0;killEnemy(e);}}break;
      case 'end':for(const g of gates){if(!g.open)openGate(g);G.flags[g.id]=true;}G.flags.fuse=true;goTo(LM.radio);this.close();toast('Você está no heliponto. Use o rádio para chamar o resgate.');return;
      case 'wave':if(!G.flags.radio){goTo(LM.pad);startWave();}G.wave=Math.min(G.wave,15);this.close();return;
      case 'win':this.close();G.mode='win';AU.win();this.win();return;
      case 'die':this.close();P.hp=0;die();return;
      case 'allyNow':this.close();if(!G.flags.radio){toast('Só funciona com o resgate chamado (heliponto).');return;}G.wave=Math.min(G.wave,80);allyArrive();return;
      case 'photos':FOTOS.forEach((_,i)=>G.files.add(FOTO0+i));break;
      case 'throws':give('rojao',4);give('sinal',3);give('calmante',2);break;
      case 'ouvHere':{const o=enemies.find(e=>e.alive&&e.type==='ouvinte');if(!o){toast('A cega não está no mapa (Santa Clara, Itajaí).');return this.debug();}o.heard=6;o.nx=P.x;o.ny=P.y;o.hot=true;this.close();return;}
      case 'cry':{this.close();const s=farSpot(380,700);if(s)cryAt('socorro',s.x,s.y,1);return;}
      case 'trap':this.close();trapForce();return;
      case 'name':{this.close();const a=P.ang+Math.PI,x=P.x+Math.cos(a)*70,y=P.y+Math.sin(a)*70;AU.cry('richard',x,y,1);psyFloat(x,y,'...Richard...',{life:2.2,c:'#b07070',size:12,whisper:true,edge:false});return;}
      case 'echo':{this.close();const pan=-Math.cos(P.ang)*.6;AU.stepAt(pan,.9,.32);AU.stepAt(pan,.8,.74);return;}
      case 'glitch':this.close();G.objGl=1.5;G.objGlT='NÃO TEM SAÍDA';AU.static(.6,.3);return;
      case 'ghost':this.close();G.flags.ghostTiao=false;G.flags.tiaoMorto=true;G.flags.bloqueio=true;G.ev.ghT=0;AU.radio();AU.static(1,1.2);later(900,()=>bark('tiao','t','Garoto... tá me ouvindo? Alguém apagou a luz verde da oficina...',{radio:true}));return;
      case 'amb':this.close();G.ev.ambT=0;G.inB=-1;return;
      case 'qte':this.close();startStruggle({label:'Teste de esforço',need:100,pump:12,hold:16,noise:200,sfx:'door',x:P.x,y:P.y,onDone:()=>toast('Conseguiu.')});return;
    }
    toast('Feito.');return this.debug();
  },
  act(a,ds){
    switch(a){
      case 'new':return this.diff();
      case 'diff':newGame(ds.d);return this.intro();
      case 'start':this.close();G.lastD=3;STORY.intro();setTimeout(()=>{if(G.mode==='play'&&!G.tut)toast(IN.touch?'Dica: o botão de lanterna (canto de cima) apaga a luz. No escuro eles quase não te veem.':'Dica: F apaga a lanterna. No escuro eles quase não te veem.');},1500);return;
      case 'cont':{const s=readSave();if(!s){this.title();return;}loadState(s);this.close();G.mode='play';toast('Registro carregado.');document.getElementById('tc').hidden=!IN.touch;return;}
      case 'controls':return this.controls('title');
      case 'controls2':return this.controls('pause');
      case 'back':return this.back();
      case 'title':return this.title();
      case 'close':return this.close();
      case 'inv':return this.inv(ds.t);
      case 'tab':return this.inv(ds.t);
      case 'sound':AU.setOn(!AU.on);if(this.cur==='opts')return this.opts();G.mode='play';return this.pause();
      case 'opts':this.optFrom=ds.from||(G.mode==='title'?'title':'pause');return this.opts();
      case 'optback':case 'achback':{const f=a==='optback'?this.optFrom:this.achFrom;if(f==='pause'){G.mode='play';return this.pause();}return this.title();}
      case 'achs':this.achFrom=ds.from||'title';return this.achs();
      case 'setq':setQuality(ds.k);try{localStorage.setItem('ps-gfx-manual','1');}catch(e){}return this.opts();
      case 'setzoom':OPT.zoom=ds.k;saveOpts();return this.opts();
      case 'sethud':OPT.hud=ds.k;saveOpts();return this.opts();
      case 'setbri':OPT.bri=ds.k;saveOpts();return this.opts();
      case 'vib':OPT.vib=!OPT.vib;saveOpts();buzz(30);return this.opts();
      case 'quit':this.close();G.mode='title';enemies=[];projs=[];return this.title();
      case 'slot':{const i=+ds.i;this.sel=this.sel===i?null:i;return this.inv('itens');}
      case 'thr':{const s=G.inv[this.sel];if(s){P.thr=s.id;toast(`${ITEMS[s.id].n} na mão para arremessar.`);}return this.inv('itens');}
      case 'det':{toggleDetector();return this.inv('itens');}
      case 'sil':{attachSil();return this.inv('itens');}
      case 'use':{const s=G.inv[this.sel];if(s&&ITEMS[s.id].k==='heal')healWith(s.id);else if(s&&ITEMS[s.id].k==='battery')usePilha();return this.inv('itens');}
      case 'fs':{toggleFS();const from=ds.from,cur=UI.cur;setTimeout(()=>{if(cur==='pause'&&UI.cur==='pause'){G.mode='play';UI.pause();}else if(cur==='title'&&UI.cur==='title')UI.title();else if(cur==='opts'&&UI.cur==='opts')UI.opts(UI.optsFrom);},350);return;}
      case 'debug':return this.debug();
      case 'gfx':{const ks=Object.keys(QUAL);setQuality(ks[(ks.indexOf(QKEY)+1)%ks.length]);try{localStorage.setItem('ps-gfx-manual','1');}catch(e){}if(G.mode==='title')return this.title();G.mode='play';return this.pause();}
      case 'dbg':return this.dbgAct(ds.k,ds);
      case 'drop':{const s=G.inv[this.sel];if(!s)return;const [x,y]=freeTileNear((P.x/TILE)|0,(P.y/TILE)|0,true);
        const dp={uid:'dp'+(G.dropN++)+'_'+((Math.random()*1e6)|0),tx:x,ty:y,x:tc(x),y:tc(y),id:s.id,q:s.q,kind:'item'};pickups.push(dp);pickOcc.add(idx(x,y));if(typeof idropAdd==='function')idropAdd(dp);G.inv[this.sel]=null;this.sel=null;return this.inv('itens');}
      case 'craft':craft(RECIPES[+ds.r]);return this.inv('itens');
      case 'wpn':switchWeapon(+ds.w);return this.inv('itens');
      case 'readdoc':return this.doc(+ds.i,'arquivos');
      case 'tobox':{const s=G.inv[+ds.i];if(s){boxAdd(s.id,s.q);G.inv[+ds.i]=null;}return this.box();}
      case 'frombox':{const s=G.box[+ds.i];if(!s)return;const left=invAdd(s.id,s.q);if(left===s.q){this.box();toast('Mochila cheia.');return;}s.q=left;if(s.q<=0)G.box.splice(+ds.i,1);return this.box();}
      case 'kp':{const k=ds.k;
        if(k==='del')this.code=this.code.slice(0,-1);
        else if(k==='ok'){
          const L=LOCKS[this.lock||'cofre'];
          if(this.code===L.code){this.code='';AU.unlock();this.close();L.open();return;}
          this.code='';AU.locked();this.keypad(this.lock);const o=OV.querySelector('.code');if(o){o.textContent='senha errada';o.classList.add('err');}return;
        } else if(this.code.length<LOCKS[this.lock||'cofre'].n)this.code+=k;
        return this.keypad(this.lock);}
      case 'rest':{
        const h=String(ds.h||'+3'); let add;
        if(h[0]==='+')add=(+h.slice(1))*60; else {let dh=((+h)-hourNow()+24)%24; if(dh<.05)dh=24; add=dh*60;}
        const wasNight=isNight(), c0=G.clock, c1=c0+add, evs=[];
        for(let d=Math.floor(c0/1440);d<=Math.floor(c1/1440)+1;d++){for(const [m,k] of [[360,'dawn'],[1110,'dusk']]){const t=d*1440+m;if(t>c0&&t<=c1)evs.push([t,k]);}}
        evs.sort((a,b)=>a[0]-b[0]);
        G.clock=c1; P.hp=Math.min(P.max,P.hp+add/60*6); P.st=100; if(wasNight||evs.some(e=>e[1]==='dusk'))G.restedNight=true;
        for(const e of enemies)if(e.alive&&!e.uid&&e.type!=='pers'&&hyp(e.x-P.x,e.y-P.y)>900)e.alive=false;
        enemies=enemies.filter(e=>e.alive); G.spawnT=2;
        this.close(); AU.save(); G.blackout=Math.max(G.blackout,.6); G.banner={t:`${clockStr()} · dia ${dayNo()}`,life:3.2};
        const last=evs[evs.length-1]; if(last){if(last[1]==='dawn')onDawn();else onDusk();}
        return;}
      case 'dosave':{G.saves++;const ok=writeSave();AU.save();this.close();toast(ok?'Progresso registrado.':'Não foi possível salvar neste navegador.');if(!ok)G.saves--;return;}
      case 'callradio':this.close();startWave();return;
      case 'load':{const s=readSave();if(!s)return;loadState(s);this.close();G.mode='play';toast('Registro carregado.');document.getElementById('tc').hidden=!IN.touch;return;}
      case 'restart':newGame(G.diff||'normal');this.close();G.mode='play';G.lastD=-1;document.getElementById('tc').hidden=!IN.touch;return;
    }
  },
};
OV.addEventListener('click',e=>{
  if(UI.cur==='talk'){AU.init();const c=e.target.closest('[data-a="vnc"]');if(c){dlgChoose(+c.dataset.k);return;}if(e.target.closest('[data-a="vnskip"]')){dlgSkip();return;}dlgAdvance();return;}
  const b=e.target.closest('[data-a]'); if(!b||b.disabled)return;
  AU.init(); AU.ui(); UI.act(b.dataset.a,b.dataset);
});
if(document.addEventListener)for(const ev of ['fullscreenchange','webkitfullscreenchange'])document.addEventListener(ev,()=>{setTimeout(()=>{resize();layoutTouch();tcState='';},120);});
window.addEventListener('resize',()=>{resize();layoutTouch();if(UI.cur==='inv'&&UI.tab==='mapa')UI.paintMap();});
