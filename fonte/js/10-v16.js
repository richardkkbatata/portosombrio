// ===================== v1.1: ESFORÇO, VOZES, CABEÇA =====================
// Coisas que não dependem de um lugar: portas que não abrem na hora, gente pedindo socorro,
// o que o Richard começa a ouvir quando o medo sobe. Tudo some sozinho ao carregar (G.ev / G.* zerados no resetState).

// ---------- som: vozes, reverb, zumbido do medo ----------
(function(){
  const VOW={a:[800,1150],o:[500,880],u:[350,700],e:[480,1750],i:[300,2250]};
  AU.rev=AU.rev||null;
  AU.wet=function(){
    const c=this.ctx; if(!c)return null; if(this.revIn)return this.revIn;
    try{const len=c.sampleRate*2.4,b=c.createBuffer(2,len,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<len;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/len,2.6);}
      const cv=c.createConvolver();cv.buffer=b;const g=c.createGain();g.gain.value=.55;cv.connect(g);g.connect(this.master);this.revIn=cv;}catch(e){this.revIn=null;}
    return this.revIn;
  };
  // saída posicionada: pan (-1..1), distância abafa, um pouco de eco
  AU.out=function(pan,far,wet){
    const c=this.ctx; const g=c.createGain(); let node=g;
    const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.value=lerp(5200,900,clamp(far||0,0,1));g.connect(lp);node=lp;
    let pn=null; if(c.createStereoPanner){pn=c.createStereoPanner();pn.pan.value=clamp(pan||0,-1,1);node.connect(pn);node=pn;}
    node.connect(this.master); const w=this.wet(); if(w&&wet!==0){const s=c.createGain();s.gain.value=wet??.5;node.connect(s);s.connect(w);}
    return g;
  };
  // uma voz humana sintetizada: sílabas com consoante, vogal e contorno de altura
  AU.vox=function(syl,vol,pan,far,opt={}){
    const c=this.ctx; if(!c||!this.on)return; const out=this.out(pan,far,opt.wet); let t=c.currentTime+(opt.delay||0);
    for(const s of syl){
      const [f1,f2]=VOW[s.v]||VOW.a, d=s.d, p0=s.p*(opt.pitch||1), p1=(s.p2||s.p)*(opt.pitch||1);
      if(s.c){const n=c.createBufferSource();n.buffer=this.nb;const bf=c.createBiquadFilter();bf.type=s.c==='s'?'highpass':'bandpass';bf.frequency.value=s.c==='s'?4200:s.c==='r'?1400:2200;
        const ng=c.createGain();const cd=s.c==='s'?.09:.035;ng.gain.setValueAtTime(vol*(s.c==='s'?.35:.5),t);ng.gain.exponentialRampToValueAtTime(.0008,t+cd);n.connect(bf);bf.connect(ng);ng.connect(out);n.start(t,Math.random());n.stop(t+cd+.02);t+=cd*.7;}
      const src=opt.whisper?c.createBufferSource():c.createOscillator();
      if(opt.whisper){src.buffer=this.nb;}else{src.type='sawtooth';src.frequency.setValueAtTime(p0,t);src.frequency.linearRampToValueAtTime(p1,t+d);
        const lfo=c.createOscillator();lfo.frequency.value=5+Math.random()*2;const lg=c.createGain();lg.gain.value=p0*(opt.shake||.03);lfo.connect(lg);lg.connect(src.frequency);lfo.start(t);lfo.stop(t+d+.05);}
      const env=c.createGain();env.gain.setValueAtTime(.0008,t);env.gain.linearRampToValueAtTime(vol,t+Math.min(.05,d*.3));env.gain.setValueAtTime(vol,t+d*.7);env.gain.exponentialRampToValueAtTime(.0008,t+d);
      for(const [f,q,a] of [[f1,6,1],[f2,8,.6]]){const bp=c.createBiquadFilter();bp.type='bandpass';bp.frequency.value=f;bp.Q.value=q;const ga=c.createGain();ga.gain.value=a*(opt.whisper?2.2:1);src.connect(bp);bp.connect(ga);ga.connect(env);}
      if(s.trill){const am=c.createOscillator();am.frequency.value=26;const ag=c.createGain();ag.gain.value=vol*.5;am.connect(ag);ag.connect(env.gain);am.start(t);am.stop(t+.12);}
      env.connect(out); if(opt.whisper)src.start(t,Math.random());else src.start(t); src.stop(t+d+.05);
      t+=d+(s.gap||.03);
    }
    return t-c.currentTime;
  };
  const PAT={
    socorro:[{c:'s',v:'o',d:.15,p:430},{c:'k',v:'o',d:.13,p:470},{c:'r',v:'o',d:.62,p:560,p2:380,trill:1}],
    ajuda:[{v:'a',d:.12,p:420},{c:'s',v:'u',d:.14,p:470},{c:'d',v:'a',d:.6,p:600,p2:360}],
    meajuda:[{c:'m',v:'i',d:.1,p:440},{v:'a',d:.1,p:470},{c:'s',v:'u',d:.13,p:520},{c:'d',v:'a',d:.55,p:640,p2:380}],
    naonao:[{c:'n',v:'a',d:.22,p:600,p2:520},{c:'n',v:'a',d:.22,p:640,p2:540,gap:.05},{c:'n',v:'a',d:.4,p:700,p2:420}],
    grito:[{v:'a',d:1.1,p:640,p2:420}],
    choro:[{v:'u',d:.18,p:380,p2:330,gap:.22},{v:'u',d:.16,p:400,p2:340,gap:.3},{v:'u',d:.22,p:370,p2:300,gap:.4},{v:'o',d:.35,p:360,p2:280}],
    richard:[{c:'r',v:'i',d:.16,p:300},{c:'s',v:'a',d:.24,p:280},{c:'d',v:'u',d:.2,p:260}],
  };
  AU.cry=function(kind,x,y,vol=1){
    if(!this.ctx)return 0; const dx=x-P.x,dy=y-P.y,d=hyp(dx,dy),far=clamp(d/1400,0,1),pan=clamp(dx/600,-1,1);
    const v=.16*vol*clamp(1.15-far,.15,1), female=Math.random()<.5;
    const o={pitch:female?1.35:1,shake:kind==='grito'?.06:.035,wet:.6};
    if(kind==='richard'||kind==='sussurro')return this.vox(PAT.richard,.05*vol,pan,.1,{whisper:true,wet:.8});
    if(kind==='choro')return this.vox(PAT.choro,v*.6,pan,far,o);
    return this.vox(PAT[kind]||PAT.socorro,v,pan,far,o);
  };
  AU.stepAt=function(pan,vol=1,delay=0){const c=this.ctx;if(!c||!this.on)return;const out=this.out(pan,.2,.4);const t=c.currentTime+delay;
    const n=c.createBufferSource();n.buffer=this.nb;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=380+Math.random()*120;f.Q.value=1.6;const g=c.createGain();g.gain.setValueAtTime(.16*vol,t);g.gain.exponentialRampToValueAtTime(.0008,t+.08);n.connect(f);f.connect(g);g.connect(out);n.start(t,Math.random());n.stop(t+.1);};
  AU.breath=function(v,inh){this.nz(inh?.55:.75,inh?900:620,1.3,.05*v,'bandpass');};
  AU.typewriter=function(v=1){for(let i=0;i<9;i++){const dl=i*.13+Math.random()*.05;this.tn(1900,1500,.02,'square',.05*v,dl);this.nz(.03,3200,3,.07*v,'bandpass',dl);}this.tn(2600,2600,.25,'sine',.03*v,1.3);};
  AU.chain=function(v=1){this.nz(.18,3400,4,.16*v,'bandpass');this.tn(2200,1800,.05,'square',.04*v);};
  AU.door=function(v=1){this.tn(80,55,.25,'sine',.4*v);this.nz(.2,260,1,.25*v);this.nz(.12,1800,4,.06*v,'bandpass',.05);};
  // zumbido que acompanha o medo: duas notas brigando + chiado no ouvido depois de explosão
  AU.fearMix=function(f,ring){
    const c=this.ctx; if(!c)return;
    if(!this.sendG){const w=this.wet();if(w){this.sendG=c.createGain();this.sendG.gain.value=.14;this.sendG.connect(w);}}
    if(!this.fearG){try{const g=c.createGain();g.gain.value=0;g.connect(this.master);for(const fr of [110,116.6,58]){const o=c.createOscillator();o.type=fr<60?'sine':'triangle';o.frequency.value=fr;o.connect(g);o.start();}
      const rg=c.createGain();rg.gain.value=0;rg.connect(this.master);const ro=c.createOscillator();ro.type='sine';ro.frequency.value=4100;ro.connect(rg);ro.start();this.fearG=g;this.ringG=rg;}catch(e){return;}}
    const t=c.currentTime; this.fearG.gain.setTargetAtTime(this.on?Math.pow(clamp(f,0,1),2)*.045:0,t,.8); this.ringG.gain.setTargetAtTime(this.on?clamp(ring,0,1)*.018:0,t,.3);
  };
})();

// ---------- esforço: cortar, empurrar, acender — com barulho e sem garantia ----------
// {label, need, pump (por toque), hold (por segundo segurando), noise, sfx, x,y, onDone, fake, fakeAt, hint}
function startStruggle(o){
  if(G.struggle)return; G.struggle=Object.assign({prog:o.keep?(G.flags[o.keep]||0):0,tick:0,px:P.x,py:P.y,t:0,need:100,pump:12,hold:16,noise:240},o);
  P.crouch=false; for(const k of ['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'])KEYS[k]=false; resetTouch&&resetTouch();
  AU.sting(); buzz(30);
}
function strugglePump(){const s=G.struggle;if(!s)return;if(G.time-(s.lastP||-1)<.11)return;s.lastP=G.time;s.prog+=s.pump*(G.fear>.6?.85:1);s.shk=.18;struggleNoise(s);buzz(18);}
function struggleNoise(s){try{s.sfx&&AU[s.sfx]&&AU[s.sfx](1);}catch(e){} if(s.noise>0)alertNoise(s.x??P.x,s.y??P.y,s.noise); G.shake+=1.2;}
function struggleTick(dt){
  const s=G.struggle; if(!s)return;
  if(CUT.on||P.hidden||P.inCar||G.mode!=='play'){return;}
  s.t+=dt;
  // mexeu = largou
  const mv=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>KEYS[k])||(typeof TOUCH!=='undefined'&&TOUCH.move.id!==null&&hyp(TOUCH.move.x-TOUCH.move.ox,TOUCH.move.y-TOUCH.move.oy)>18);
  if(s.t>.25&&(mv||hyp(P.x-s.px,P.y-s.py)>24)){G.struggle=null;if(s.keep)G.flags[s.keep]=s.prog;toast(s.quit||'Você largou.');return;}
  P.x=s.px;P.y=s.py;
  if(KEYS.KeyE||KEYS.Space){s.prog+=s.hold*dt;s.tick-=dt;if(s.tick<=0){s.tick=.6;struggleNoise(s);}}
  if(s.shk>0)s.shk-=dt;
  if(s.warn&&!s.warned){const o=enemies.find(e=>e.alive&&e.type==='ouvinte'&&hyp(e.x-P.x,e.y-P.y)<170);if(o){s.warned=true;bark(G.flags.matFollow?'matheus':'rafa','s',G.flags.matFollow?'PARA! Ela tá do teu lado! Solta e sai daí!':'Ela tá aqui. Do meu lado. Solta. Solta.',{dur:1.8});}}
  if(s.hp==null)s.hp=P.hp; if(P.hp<s.hp-.5){G.struggle=null;if(s.keep)G.flags[s.keep]=s.prog;const o=enemies.find(e=>e.alive&&e.type==='ouvinte'&&hyp(e.x-P.x,e.y-P.y)<70);toast(o?'Ela te pegou. Você soltou tudo.':'Te pegaram. Você soltou tudo.');return;}
  if(s.fake&&s.prog>=s.fakeAt){G.struggle=null;s.onFail&&s.onFail();return;}
  if(s.prog>=s.need){G.struggle=null;AU.unlock();s.onDone&&s.onDone();}
}
function drawStruggle(){
  const s=G.struggle; if(!s||G.mode!=='play'||CUT.on)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const w=Math.min(360,view.w-60),h=12,x=view.w/2-w/2,y=view.h*.76, k=clamp(s.prog/s.need,0,1), sh=(s.shk>0?rr(-3,3):0)+(G.fear>.5?rr(-1,1)*G.fear:0);
  ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x-10+sh,y-34,w+20,64);
  ctx.fillStyle='#ddd6c6';ctx.font=`700 14px ${FONT_UI}`;ctx.textAlign='center';ctx.fillText(s.label.toUpperCase(),view.w/2+sh,y-14);
  ctx.fillStyle='rgba(255,255,255,.12)';ctx.fillRect(x+sh,y,w,h);ctx.fillStyle=k>.75?'#d9a33c':'#c8402a';ctx.fillRect(x+sh,y,w*k,h);
  ctx.fillStyle='rgba(221,214,198,.65)';ctx.font=`600 11px ${FONT_UI}`;
  ctx.fillText(IN.touch?'Toque em FORÇA! sem parar · andar = largar':'Segure E ou aperte sem parar · andar = largar',view.w/2,y+h+15);
}

// intervalo mínimo entre eventos aleatórios (de qualquer sistema)
function evOK(gap=45){return G.time-((G.ev&&G.ev.lastE)??-999)>gap;}
function evMark(){if(G.ev)G.ev.lastE=G.time;}
// ---------- vozes no escuro: pedidos de socorro, gente presa ----------
const PSY={floats:[]};
function psyFloat(x,y,t,o={}){PSY.floats.push({x,y,t,life:o.life||3,max:o.life||3,c:o.c||'#e8d8c8',size:o.size||13,edge:o.edge!==false,whisper:!!o.whisper});if(PSY.floats.length>8)PSY.floats.shift();}
function inBC(){const d=dAt((P.x/TILE)|0,(P.y/TILE)|0);return d>=5&&d<=7;}
function farSpot(r0,r1){for(let i=0;i<20;i++){const a=Math.random()*6.283,d=rr(r0,r1),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;if(inb(tx,ty)&&map[idx(tx,ty)]!==T.WATER)return {x,y};}return null;}
const CRY_TXT={socorro:['SOCORRO!','SOCORRO! ALGUÉM!','ME AJUDA, PELO AMOR DE DEUS!'],ajuda:['AJUDA!','ALGUÉM AJUDA!'],meajuda:['ME AJUDA!','ME AJUDA, POR FAVOR!'],naonao:['NÃO! NÃO! NÃO!','SAI DE MIM!'],grito:['AAAAAH!'],choro:['(alguém chorando)','(um choro baixinho)']};
function cryAt(kind,x,y,vol=1){AU.cry(kind,x,y,vol);psyFloat(x,y,pick2(CRY_TXT[kind]||['...']),{life:2.8,c:kind==='choro'?'#a8a8b8':'#f0d0c0'});}
function cryTick(dt){
  const F=G.flags; G.ev.cryT=(G.ev.cryT??rr(10,18))-dt; if(G.ev.cryT>0)return;
  const caos=F.caos>=1&&!G.ev.silent&&inBC(), silent=G.ev.silent&&inBC(), night=isNight();
  if(caos){G.ev.cryT=F.caos>=2?rr(28,50):rr(45,80);const s=farSpot(380,900);if(!s)return;
    const r=Math.random(); if(r<.45)cryAt(pick2(['socorro','ajuda','meajuda']),s.x,s.y); else if(r<.7){cryAt('naonao',s.x,s.y);later(1400,()=>{AU.cry('grito',s.x,s.y,.9);});} else if(r<.85)cryAt('grito',s.x,s.y); else cryAt('choro',s.x,s.y,.8);
    if(!F.cryTip){F.cryTip=true;later(2200,()=>bark(F.eduFollow?'edu':'rafa','s',F.eduFollow?'Tem gente viva gritando, Richard... a gente não consegue chegar em todo mundo.':'Tem gente viva pedindo ajuda... e eu não consigo chegar em todo mundo.',{dur:2.4}));}
    return;}
  if(silent){G.ev.cryT=rr(70,120);const s=farSpot(500,900);if(s)cryAt(Math.random()<.6?'choro':'socorro',s.x,s.y,.6);return;}
  G.ev.cryT=night?rr(100,170):rr(150,240); if(night&&G.inB<0&&Math.random()<.6){const s=farSpot(700,1100);if(s)cryAt(pick2(['socorro','grito','choro']),s.x,s.y,.45);}
}
// alguém preso num prédio perto: grita, bate na porta, e para. Se você chegar a tempo... chega tarde.
const TRAP_L=[['ME AJUDA! TEM ALGUÉM AÍ FORA?!','A PORTA NÃO ABRE! ELES TÃO NO CORREDOR!','POR FAVOR! EU TENHO UMA FILHA!','NÃO NÃO NÃO NÃO—'],
  ['Moço! Moço, eu tô te vendo da janela! Abre aqui embaixo!','Eles arrombaram a porta da cozinha!','Corre... corre não, VOLTA, VOLTA!','—'],
  ['Mãe? Mãe, cadê você?','Tem alguém batendo na porta do quarto...','Mãe, é você? Fala alguma coisa...','—']];
function trapTick(dt){
  const F=G.flags, tr=G.ev.trap;
  if(!tr){ if(!(F.caos>=1&&!G.ev.silent&&inBC()))return; G.ev.trapT=(G.ev.trapT??rr(90,140))-dt; if(G.ev.trapT>0)return; G.ev.trapT=rr(160,260); if(!evOK(50))return;
    let best=null; for(const b of buildings){if(b.safe||!b.name)continue;const cx=(b.x+b.w/2)*TILE,cy=(b.y+b.h/2)*TILE,d=hyp(cx-P.x,cy-P.y);if(d<300||d>640)continue;if(!best||Math.random()<.3)best=b;}
    if(!best)return; const X=clamp(P.x,best.x*TILE,(best.x+best.w)*TILE),Y=clamp(P.y,best.y*TILE,(best.y+best.h)*TILE);
    evMark(); G.ev.trap={x:X,y:Y,b:best.id,i:0,t:0,lines:pick2(TRAP_L),female:Math.random()<.6};
    if(!F.trapTip){F.trapTip=true;later(3000,()=>bark('rafa','s','Tem alguém preso ali dentro... a voz vem dali.',{dur:2}));}
    return;}
  tr.t+=dt; const d=hyp(tr.x-P.x,tr.y-P.y);
  if(tr.i<tr.lines.length&&tr.t>=tr.i*3.4){const L=tr.lines[tr.i++];psyFloat(tr.x,tr.y,L,{life:3,c:'#f0c8b8'});if(L!=='—'){AU.cry(tr.i===tr.lines.length?'naonao':pick2(['socorro','meajuda','ajuda']),tr.x,tr.y,1.1);AU.knock();}}
  const arrived=d<120&&tr.t>2;
  if(tr.i>=tr.lines.length||arrived){
    G.ev.trap=null; AU.cry('grito',tr.x,tr.y,1.2); G.shockT=Math.max(G.shockT||0,arrived?30:14); later(700,()=>{psyFloat(tr.x,tr.y,'...',{life:3,c:'#8a8a8a'});});
    addDecal({k:'blood',x:tr.x,y:tr.y,r:24,rot:0,seed:Math.random()});
    if(arrived||Math.random()<.35){later(1500,()=>{const [x,y]=freeTileNear((tr.x/TILE)|0,(tr.y/TILE)|0,true);const e=makeEnemy('corr',tc(x),tc(y),null);e.state='chase';e.lx=P.x;e.ly=P.y;e.rising=.4;enemies.push(e);AU.roar();G.shake+=6;
      bark('rafa','s',pick2(['Era tarde. Era tarde demais.','Eu cheguei... e ela já era um deles.','Eu demorei. Eu demorei demais.']),{dur:2.2});});}
    else later(1800,()=>bark('rafa','t',pick2(['...Parou de gritar.','Silêncio. Só silêncio agora.','Eu não fui. Eu ouvi e não fui.']),{dur:2.2}));
  }
}

// ---------- a cabeça do Richard ----------
function psyTick(dt){
  const F=G.flags, fear=G.fear||0, dark=!lampOn();
  // passos que param um segundo depois dos seus
  if(P.moving&&!P.inCar){G.ev.movT=(G.ev.movT||0)+dt;}
  else{ if((G.ev.movT||0)>1.6&&fear>.3&&(dark||fear>.55)&&!G.pSafe&&!P.inCar&&(G.ev.echoCd||0)<=0&&Math.random()<.4){G.ev.echoCd=rr(60,100);
      const pan=-Math.cos(P.ang)*.6; AU.stepAt(pan,.9,.32);AU.stepAt(pan,.8,.74);
      if(!F.echoTip){F.echoTip=true;later(1500,()=>bark('rafa','s','Eu parei... e os passos pararam um segundo depois.',{dur:2.2}));}}
    G.ev.movT=0;}
  if(G.ev.echoCd>0)G.ev.echoCd-=dt;
  // respiração presa quando escondido com medo
  if((P.hidden||P.crouch)&&fear>.45){G.ev.brT=(G.ev.brT||0)-dt;if(G.ev.brT<=0){G.ev.brT=lerp(2,1.05,fear);AU.breath(fear,true);later(450,()=>AU.breath(fear*.8,false));}}
  // alguém diz o seu nome
  G.ev.nameCd=(G.ev.nameCd??40)-dt;
  if(fear>.62&&G.ev.nameCd<=0&&!G.pSafe&&Math.random()<dt*.15){G.ev.nameCd=rr(120,200);const a=P.ang+Math.PI+rr(-.5,.5),x=P.x+Math.cos(a)*70,y=P.y+Math.sin(a)*70;
    AU.cry('richard',x,y,1);psyFloat(x,y,pick2(['...Richard...','Richard.','...volta, Richard...']),{life:2.2,c:'#b07070',size:12,whisper:true,edge:false});}
  // o objetivo falha
  G.objGl=Math.max(0,(G.objGl||0)-dt); G.ev.glCd=(G.ev.glCd??30)-dt;
  if(fear>.8&&G.ev.glCd<=0){G.ev.glCd=rr(70,120);G.objGl=1.3;const dead=F.tiaoMorto||F.ivoMorto||F.cidaTurned;
    G.objGlT=pick2(['NÃO TEM SAÍDA','ELES SABEM ONDE VOCÊ ESTÁ','VOLTA PRA CASA, RICHARD',...(dead?['VOCÊ DEIXOU ELES MORREREM','FOI CULPA SUA']:[])]);AU.static(.6,.3);}
  // vozes no rádio de quem já morreu
  if(F.tiaoMorto&&F.bloqueio&&!F.ghostTiao&&isNight()&&!G.pSafe&&G.inB<0&&!inBC()&&(G.ev.ghT=(G.ev.ghT??90)-dt)<=0){F.ghostTiao=true;AU.radio();AU.static(1,1.2);
    later(900,()=>bark('tiao','t','Garoto... tá me ouvindo? Alguém apagou a luz verde da oficina...',{radio:true}));
    later(5200,()=>{AU.static(1,.4);bark('rafa','s','Não. Não, não, não. Ele morreu. Eu vi ele morrer. EU VI.',{dur:2.6});});}
  if(F.cidaTurned&&!F.ghostCida&&START&&hyp(P.x-START.x,P.y-START.y)<380){F.ghostCida=true;AU.typewriter(1);psyFloat(START.x,START.y,'tec... tec... tec...',{life:3,c:'#9ab89a'});
    later(2400,()=>bark('rafa','s','A máquina de escrever dela... alguém tá batendo nas teclas.',{dur:2.2}));}
  if(F.ivoMorto&&F.laranjGone&&!F.ghostIvo&&dAt((P.x/TILE)|0,(P.y/TILE)|0)<=1&&nearCoast()>.5){F.ghostIvo=true;const s=farSpot(300,500);if(s){AU.cry('sussurro',s.x,s.y,1.4);psyFloat(s.x,s.y,'...Rosa? Rosinha?...',{life:3,c:'#9aa8b8'});}}
  // culpa no quarto seguro
  if(G.pSafe&&!F.guilt1&&F.tiaoMorto){F.guilt1=true;later(1200,()=>bark('rafa','t',F.eduFollow?'O Tião ficou pra trás por nossa causa, Edu.':'Ele ficou pra trás pra eu fugir. Eu nem olhei pra trás.',{dur:2.6}));
    if(F.eduFollow)later(4400,()=>bark('edu','t','Ele escolheu, Richard. Deixa ele ter escolhido.',{dur:2.4}));}
  // ver alguém morrer não passa: o medo fica lá em cima por um tempo
  for(const k of ['tiaoMorto','ivoMorto','cidaTurned']){if(F[k]&&!G.ev['shock'+k]){G.ev['shock'+k]=1;if(!G.ev.shockInit)continue;G.shockT=40;}}
  G.ev.shockInit=1;
  if(G.shockT>0){G.shockT-=dt;G.fear=Math.max(G.fear||0,.55+.3*clamp(G.shockT/40,0,1));}
  // os amigos percebem
  G.ev.compCd=(G.ev.compCd??30)-dt;
  if(fear>.68&&G.ev.compCd<=0&&!G.pSafe){const c=(G.comps||[]).find(c=>hyp(c.x-P.x,c.y-P.y)<160);if(c){G.ev.compCd=rr(70,120);
    const L=c.id==='edu'?['Respira, Richard. Respira comigo. Um... dois...','Ei. Ei! Olha pra mim. Eu tô aqui.','Tu tá branco, mano. Fica perto de mim.','Se tu surtar, eu surto junto. Então não surta.']
      :['Mano, tu tá tremendo inteiro.','Fala comigo. Qualquer coisa. Só não fica quieto assim.','Eu também tô ouvindo coisa, Richard. Ignora.','Se aquilo voltar, tu corre. Não espera por mim.'];
    bark(c.id,'s',pick2(L),{dur:2.4});G.fear=Math.max(0,(G.fear||0)-.15);}}
  // depois de uma explosão perto, o ouvido apita
  if(G.boom&&G.boom.t>.5&&hyp(G.boom.x-P.x,G.boom.y-P.y)<520)G.ring=Math.max(G.ring||0,1.6);
  G.ring=Math.max(0,(G.ring||0)-dt*.5);
}
// sons da noite: longe, nunca perto o bastante pra você ver
function ambTick(dt){
  if(G.inB>=0&&Math.random()>.3)return; G.ev.ambT=(G.ev.ambT??rr(30,50))-dt; if(G.ev.ambT>0)return; G.ev.ambT=isNight()?rr(45,80):rr(70,120);
  const s=farSpot(800,1400); if(!s||!AU.ctx)return; const dx=s.x-P.x, pan=clamp(dx/700,-1,1), out=()=>AU.out(pan,.75,.8), c=AU.ctx, t0=c.currentTime;
  const tone=(f0,f1,d,type,v,dl=0)=>{const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t0+dl);o.frequency.linearRampToValueAtTime(f1,t0+dl+d);const g=c.createGain();g.gain.setValueAtTime(.0008,t0+dl);g.gain.linearRampToValueAtTime(v,t0+dl+.15);g.gain.exponentialRampToValueAtTime(.0008,t0+dl+d);o.connect(g);g.connect(out());o.start(t0+dl);o.stop(t0+dl+d+.05);};
  const r=Math.random();
  if(r<.3){tone(520,780,.9,'sine',.05);tone(780,480,1.4,'sine',.05,.9);}                       // cão uivando
  else if(r<.5){for(let i=0;i<4;i++){tone(620,880,.7,'sine',.025,i*1.4);tone(880,620,.7,'sine',.025,i*1.4+.7);}} // sirene longe
  else if(r<.7){for(let i=0;i<3;i++)tone(140,70,.3,'square',.06,i*rr(.6,1.4));}               // metal batendo no vento
  else if(r<.85){for(let i=0;i<8;i++)tone(1250,1250,.18,'square',.018,i*.36);}                 // alarme de carro
  else AU.cry('grito',s.x,s.y,.35);
}
function v16Tick(dt){
  if(G.mode==='play'&&!G.ev.shockInit){for(const k of ['tiaoMorto','ivoMorto','cidaTurned'])if(G.flags[k])G.ev['shock'+k]=1;}
  struggleTick(dt);
  for(const f of PSY.floats)f.life-=dt; PSY.floats=PSY.floats.filter(f=>f.life>0);
  AU.fearMix(G.mode==='play'?(G.fear||0):0,G.ring||0);
  if(G.mode!=='play'||CUT.on)return;
  cryTick(dt); trapTick(dt); psyTick(dt); ambTick(dt);
}
function drawPsy(){
  if(G.mode!=='play'&&G.mode!=='menu')return; const z=view.z;
  ctx.setTransform(dpr,0,0,dpr,0,0); ctx.textAlign='center';
  for(const f of PSY.floats){
    const a=clamp(f.life/f.max*1.6,0,1)*(f.whisper?.55:.95); let x=(f.x-cam.x)*z,y=(f.y-cam.y)*z-18, off=false;
    ctx.font=`${f.whisper?'italic 500':'700'} ${f.size}px ${FONT_UI}`; ctx.globalAlpha=a;
    const tw=ctx.measureText(f.t).width;
    const m=40; if(x<m||x>view.w-m||y<m+30||y>view.h-m){if(!f.edge)continue;off=true;y=clamp(y,m+60,view.h-m-60);}
    x=clamp(x,tw/2+30,view.w-tw/2-30); ctx.fillStyle='rgba(0,0,0,.45)';ctx.fillRect(x-tw/2-6,y-f.size,tw+12,f.size+7);
    ctx.fillStyle=f.c;ctx.fillText(f.t,x+(f.whisper?rr(-.6,.6):0),y);
    if(off){const ang=Math.atan2(f.y-P.y,f.x-P.x);ctx.save();ctx.translate(x+Math.cos(ang)*(tw/2+14),y-f.size/2+3+Math.sin(ang)*8);ctx.rotate(ang);ctx.beginPath();ctx.moveTo(6,0);ctx.lineTo(-4,-5);ctx.lineTo(-4,5);ctx.closePath();ctx.fill();ctx.restore();}
  }
  ctx.globalAlpha=1;
  drawStruggle();
  if(DBG.ouv){const o=enemies.find(e=>e.alive&&e.type==='ouvinte');if(o){ctx.setTransform(dpr*z,0,0,dpr*z,-cam.x*z*dpr,-cam.y*z*dpr);ctx.strokeStyle='rgba(255,80,80,.6)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y,(P.crouch?46:68),0,6.283);ctx.stroke();ctx.strokeStyle='rgba(120,180,255,.5)';ctx.beginPath();ctx.arc(o.nx||o.x,o.ny||o.y,10,0,6.283);ctx.stroke();ctx.setTransform(dpr,0,0,dpr,0,0);ctx.fillStyle='#fff';ctx.font='12px monospace';ctx.textAlign='left';ctx.fillText(`cega: ${o.state} ouviu ${Math.max(0,o.heard||0).toFixed(1)} faro ${(o.smell||0).toFixed(1)} escuta ${Math.max(0,o.listen||0).toFixed(1)} pressão ${(o.press||0)|0}`,12,view.h-12);}}
}

// ---------- portas e saídas que pedem esforço ----------
STORY.hospChain=function(g){
  // 1) cortar a corrente  2) a porta emperra — e ela ouviu
  const push=()=>startStruggle({label:'Empurrando a porta emperrada',keep:'pushProg',warn:1,need:100,pump:6,hold:20,noise:0,sfx:'door',x:P.x,y:P.y,quit:'Você largou a porta.',
    onDone:()=>{const gg=gates.find(x=>x.id==='hospOut');if(gg&&!gg.open)openGate(gg);invRemove('alicate',1);G.flags.hospOut=true;AU.door(1.4);G.shake+=10;toast('A porta cedeu. Saída dos fundos aberta.');STORY.hospExit();
      const o=enemies.find(e=>e.alive&&e.type==='ouvinte');if(o){o.heard=0;o.hot=false;}}});
  if(G.flags.chainCut){bark('rafa','s','Empurra... EMPURRA!',{dur:1.2});return push();}
  startStruggle({label:'Cortando a corrente',keep:'chainProg',warn:1,need:100,pump:5,hold:15,noise:330,sfx:'chain',x:P.x,y:P.y,quit:'Você soltou o alicate.',
    onDone:()=>{G.flags.chainCut=true;AU.chain(1.4);G.shake+=4;bark('rafa','s','Cortou! ...a porta não abre. Tá emperrada. EMPURRA!',{dur:1.8});
      const o=enemies.find(e=>e.alive&&e.type==='ouvinte');if(o){o.listen=0;AU.roar();later(900,()=>{if(!o.alive||G.flags.hospOut)return;o.heard=6;o.nx=P.x+rr(-60,60);o.ny=P.y+rr(-60,60);o.hot=false;});}
      if(G.flags.matFollow){later(900,()=>bark('matheus','s','ELA OUVIU! ELA TÁ VINDO! EMPURRA, RICHARD!',{dur:1.6}));
        later(2600,()=>{if(!o||!o.alive||G.flags.hospOut||hyp(o.x-P.x,o.y-P.y)>300)return;const b=buildings[o.homeB];if(!b)return;
          const tx=tc(b.x+b.w-6),ty=tc(b.y+b.h-4);AU.glass(.8);o.heard=5;o.nx=tx;o.ny=ty;o.hot=false;o.smell=0;
          bark('matheus','s','Joguei uma garrafa lá no fundo! VAI, VAI!',{dur:1.6});});}
      push();}});
};
STORY.hospFrontTry=function(){
  if(G.flags.hospTry)return toast('A porta da frente não abre por dentro. Nem adianta.');
  startStruggle({label:'Forçando a porta da frente',need:100,pump:6,hold:20,noise:300,sfx:'door',x:P.x,y:P.y,fake:true,fakeAt:82,
    onFail:()=>{G.flags.hospTry=true;AU.thud(1);AU.click2(1);G.shake+=6;toast('A maçaneta quebrou na sua mão.');bark('rafa','s','A maçaneta... saiu na minha mão. E eu fiz barulho demais.',{dur:2.2});
      const o=enemies.find(e=>e.alive&&e.type==='ouvinte');if(o){o.heard=5;o.nx=P.x;o.ny=P.y;o.hot=false;}}});
};
(function(){
  const plant=STORY.plantDina, gen=STORY.geradorL;
  STORY.plantDina=function(g){
    if(G.ev.fuse||G.struggle)return;
    startStruggle({label:'Acendendo o pavio (fósforo úmido)',need:100,pump:9,hold:24,noise:120,sfx:'click',x:P.x,y:P.y,quit:'Você guardou os fósforos.',
      onDone:()=>plant(g)});
    if(!G.flags.matchTip){G.flags.matchTip=true;bark('rafa','s','Fósforo molhado... acende, acende, ACENDE!',{dur:1.8});}
  };
  STORY.geradorL=function(o){
    const F=G.flags; if(F.geradorL||(!F.ivoMet&&invCount('dinamite')<=0))return gen(o);
    if(G.struggle)return;
    startStruggle({label:'Puxando a corda do gerador',need:100,pump:7,hold:16,noise:420,sfx:'rev',x:P.x,y:P.y,quit:'Você soltou a corda.',onDone:()=>gen(o)});
    bark('rafa','s','Pega... pega... cada puxada faz um barulho do inferno.',{dur:2});
  };
})();

// ---------- menu de teste ----------
function trapForce(){G.ev.trap=null;const keep=G.flags.caos;G.flags.caos=Math.max(1,keep||0);const sil=G.ev.silent;G.ev.silent=false;
  const oldIn=inBC;inBC=()=>true;G.ev.trapT=0;trapTick(0);inBC=oldIn;G.flags.caos=keep;G.ev.silent=sil;if(!G.ev.trap)toast('Nenhum prédio perto o bastante (300–640 px).');}
(function(){
  const base=dbgJump;
  dbgJump=function(k){
    const F=G.flags, goTo=pt=>{if(!pt)return;if(P.inCar)exitCar(true);const [x,y]=freeTileNear((pt.x/TILE)|0,(pt.y/TILE)|0,true);P.x=tc(x);P.y=tc(y);snapCamera();flowTile=-1;};
    if(k==='ivo'){base('laranj');goTo({x:LM.colonia.x,y:LM.colonia.y+40});G.comps.forEach(c=>{c.x=P.x-30;c.y=P.y;});return;}
    if(k==='hospIn'){base('hosp');goTo({x:LM.hospIn.x,y:LM.hospIn.y-tc(3)});return;}
    if(k==='hospSaida'){base('hosp');F.hospLock=true;const g=gates.find(x=>x.id==='hospIn');if(g&&g.open)closeGate(g);F.matheusJoin=true;F.matFollow=true;F.eduFollow=false;syncComps();
      const l=invAdd('alicate',1);if(l)boxAdd('alicate',l);goTo({x:LM.hospExit.x,y:LM.hospExit.y+tc(3)});G.comps.forEach(c=>{c.x=P.x+20;c.y=P.y+30;});return;}
    if(k==='cida'){base('bc2');goTo({x:START.x,y:START.y+tc(4)});G.comps.forEach(c=>{c.x=P.x-30;c.y=P.y;});return;}
    return base(k);
  };
})();
