// ===================== 1.6: FLASHBACK · CLIMA · BRAVA E UNIVALI · (multiplayer em 19-mp.js) =====================
const LOOKS={
  richard:{richard:true,coat:'#1f2b4e',skin:'#d29d7c',hair:'#3a2415',pants:'#24262c'},
  edu:{coat:'#18191c',skin:'#e2b79a',hair:'#2a1c12',pants:'#2a2c34',look:'edu'},
  matheus:{coat:'#e8e6e0',skin:'#d9aa8c',hair:'#140f0c',pants:'#1c2230',look:'math'},
  marlon:{coat:'#1c1e21',skin:'#e0b090',hair:'#1c120a',pants:'#22242a',look:'marlon'},
  nicolas:{coat:'#d6c93a',skin:'#ecc8ae',hair:'#1a1210',pants:'#2a2a30',look:'nico'},
};

// ---------- CLIMA DINÂMICO ----------
// chuva (normal) · tempestade (abafa passos, mais escuro) · neblina do mar (ninguém enxerga longe) · apagão (postes do bairro apagam)
const WX={chuva:{n:'Chuva fina',sight:1,noise:1,dk:0},tempestade:{n:'Tempestade',sight:.85,noise:.6,dk:.06},neblina:{n:'Neblina do mar',sight:.55,noise:1,dk:.02},apagao:{n:'Apagão no bairro',sight:1,noise:1,dk:.08}};
function wxSet(k,quiet){
  if(!WX[k])return; G.wx=k; G.wxT=rr(170,320); G.wxSight=WX[k].sight; G._dkWx=WX[k].dk;
  if(k==='apagao'){G.wxD=dAt((P.x/TILE)|0,(P.y/TILE)|0);}
  if(quiet)return;
  const msg={tempestade:'A chuva engrossou. O barulho abafa os seus passos... e os deles.',neblina:'A neblina subiu do mar. Não dá pra ver nada a dez metros.',apagao:'Os postes apagaram, um por um. O bairro inteiro ficou no escuro.',chuva:'A chuva afinou.'}[k];
  toast(msg); if(k==='tempestade'){AU.thunder();G.light=Math.max(G.light,.5);} if(k==='apagao'){AU.thud(.6);AU.static(.6,.4);}
}
function wxTick(dt){
  if(!G.wx)wxSet('chuva',true);
  if(inSew()){G.wxSight=1;G._dkWx=0;return;}
  G.wxSight=WX[G.wx].sight; G._dkWx=WX[G.wx].dk;
  G.wxT-=dt; if(G.wxT<=0){const pd=dAt((P.x/TILE)|0,(P.y/TILE)|0), coast=pd===3||pd===7||pd===8||pd===2;
    const opts=G.wx==='chuva'?{tempestade:3,neblina:coast?4:1.5,apagao:(pd>=5&&pd<=7)||pd===10?3:0}:{chuva:6};
    wxSet(wpick(opts));}
  if(G.wx==='tempestade'){G.lightT=Math.min(G.lightT,rr(4,9));if(AU.rainG&&AU.ctx&&!inSew())AU.rainG.gain.setTargetAtTime(.11,AU.ctx.currentTime,.8);}
  else if(AU.rainG&&AU.ctx&&!inSew()&&G.ev.wxR!==G.wx)AU.rainG.gain.setTargetAtTime(.05,AU.ctx.currentTime,.8);
  G.ev.wxR=G.wx;
}
let WXFOG=null;
function drawWx(){
  if(G.mode!=='play'&&G.mode!=='menu')return; if(inSew()||!G.wx)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(G.wx==='tempestade'&&G.inB<0){ctx.strokeStyle='rgba(170,190,210,.16)';ctx.lineWidth=1.2;ctx.beginPath();for(let i=0;i<90;i++){const x=((i*137+renderT*900)%(view.w+200))-100,y=((i*251+renderT*1400)%(view.h+60))-30;ctx.moveTo(x,y);ctx.lineTo(x-6,y-22);}ctx.stroke();}
  if(G.wx==='neblina'){
    if(!WXFOG){WXFOG=document.createElement('canvas');WXFOG.width=256;WXFOG.height=256;const g=WXFOG.getContext('2d');for(let i=0;i<40;i++){const x=Math.random()*256,y=Math.random()*256,r=rr(30,80),gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(190,200,205,.14)');gr.addColorStop(1,'rgba(190,200,205,0)');g.fillStyle=gr;g.fillRect(0,0,256,256);}}
    const ox=-(renderT*12+cam.x*.4)%256,oy=-(cam.y*.4)%256; ctx.globalAlpha=G.inB>=0?.35:.9;
    for(let y=oy-256;y<view.h;y+=256)for(let x=ox-256;x<view.w;x+=256)ctx.drawImage(WXFOG,x,y);
    ctx.globalAlpha=1; const g=ctx.createRadialGradient(view.w/2,view.h/2,Math.min(view.w,view.h)*.15,view.w/2,view.h/2,Math.max(view.w,view.h)*.6);g.addColorStop(0,'rgba(150,160,165,0)');g.addColorStop(1,`rgba(150,160,165,${G.inB>=0?.12:.38})`);ctx.fillStyle=g;ctx.fillRect(0,0,view.w,view.h);}
}
(function(){
  const lo=lightOn; lightOn=function(l){if(G.wx==='apagao'&&(l.c==='lamp'||l.c==='neon'||l.c==='flood')&&l.b==null){const d=dAt((l.x/TILE)|0,(l.y/TILE)|0);if(d===G.wxD)return false;}return lo(l);};
  const an=alertNoise; alertNoise=function(x,y,r){return an(x,y,r*(G.wx&&WX[G.wx]?WX[G.wx].noise:1));};
})();

// ---------- a região da BR e da Universidade de BC, mais clara de dia ----------
function zoneLightTick(){ if(inZone()&&G.inB<0&&!inSew())G._dkZone=lerp(1,.62,daylight()); else if(inZone())G._dkZone=.85; else G._dkZone=0; }

// ---------- FLASHBACK: 19h, o Matheus no porto, o contêiner T-00 ----------
const FB={on:false,save:null,stage:0};
STORY.flashStart=function(){
  const F=G.flags; if(F.flashDone||FB.on)return;
  F.flashDone=true; FB.save=JSON.parse(JSON.stringify(serialize())); FB.save.flags.flashDone=true;
  playCut([{say:'matheus',m:'t',t:'Richard... antes de tudo isso. Eu tava no porto. No turno das sete. Eu vi quando abriram aquele contêiner.'},
    {say:'matheus',m:'s',t:'Eu nunca contei pra ninguém o que eu vi. Nem pro Marlon.'},
    {fx:'blackout',v:2},{do:()=>flashSetup()}],
    ()=>{G.banner={t:'Porto de Itajaí · 19h04 · seis horas antes',life:4};});
};
function flashSetup(){
  FB.on=true; FB.stage=0; G.flags.fbStage=0; FB.open=0; FB.arm=0; FB.exit=null; FB.door=0; FB.bt=0; FB.t=0;
  if(P.inCar)exitCar(true); V.spd=0; G.qte=null; G.struggle=null; P.grab=null;
  enemies=[]; projs=[]; G.comps=[]; G.wx='chuva'; G.clock=19*60+4;
  for(let i=0;i<P.owned.length;i++)P.owned[i]=false; P.owned[8]=true; P.w=8; P.hp=P.max=100; P.lookO=LOOKS.matheus;
  const c=LM.cais||{x:tc(140),y:tc(11)}; const [x,y]=freeTileNear(((c.x/TILE)|0)-28,((c.y/TILE)|0)+14,true); P.x=tc(x); P.y=tc(y); snapCamera(); flowTile=-1;
  const [cx,cy]=freeTileNear((c.x/TILE)|0,((c.y/TILE)|0)+5,false); FB.cont={x:tc(cx),y:tc(cy)};
  const [zx,zy]=freeTileNear(((c.x/TILE)|0)-4,((c.y/TILE)|0)+7,false);
  npcs.push({id:'zeFB',name:'Seu Zé',look:null,x:tc(zx),y:tc(zy),col:'#d07a24',hair:'#5a5a56',skin:'#c89878',ang:0,cond:()=>FB.on&&FB.stage<3});
  PCH.ze=PCH.ze||{name:'Seu Zé',skin:'#c89878',shade:'#9a6a50',hair:'#6a6a66',iris:'#3a2a1a',bg:['#3a2410','#120a04'],glow:'240,150,60',voice:100};
}
function flashObjective(){
  const s=FB.stage, c=FB.cont||{x:P.x,y:P.y};
  if(s===0)return {t:'(Matheus) Bata o ponto e fale com o Seu Zé perto do cais',at:{x:c.x-120,y:c.y+60}};
  if(s===1)return {t:'(Matheus) Tem um caminhão branco da Vértice no cais. Chegue perto do contêiner T-00 sem ser visto',at:c};
  if(s===2)return {t:'(Matheus) O que tem dentro bate na porta. Escute.',at:c};
  return {t:'(Matheus) CORRE! Até o portão do porto!',at:FB.exit};
}
function flashTick(dt){
  if(!FB.on||CUT.on)return; const c=FB.cont; if(!c)return;
  G.clock=Math.min(G.clock,19*60+30);
  if(FB.stage===0){const z=npcs.find(n=>n.id==='zeFB');if(z&&hyp(P.x-z.x,P.y-z.y)<120){FB.stage=1;
    playCut([{npc:z,id:'ze'},{say:'ze',m:'n',t:'Matheus! Chegou atrasado de novo, guri. A faculdade te deixa assim.'},
      {say:'matheus',m:'n',t:'Prova amanhã, Seu Zé. Que caminhão é aquele?'},
      {say:'ze',m:'t',t:'Vértice. Chegaram às seis com papelada do Ministério. Não deixam ninguém chegar perto do contêiner zero.'},
      {say:'ze',m:'s',t:'E ele tá batendo, Matheus. Faz uma hora que tá batendo por dentro.'}]);}}
  else if(FB.stage===1){if(hyp(P.x-c.x,P.y-c.y)<140){FB.stage=2;FB.t=0;AU.knock();}
    FB.bt=(FB.bt||0)-dt;if(FB.bt<=0){FB.bt=rr(1.2,2.2);AU.thud(clamp(1-hyp(P.x-c.x,P.y-c.y)/700,.1,.9));G.shake+=1;}}
  else if(FB.stage===2){FB.t+=dt;FB.bt=(FB.bt||0)-dt;if(FB.bt<=0){FB.bt=rr(.5,.9);AU.thud(1);AU.knock();G.shake+=3;FB.door=(FB.door||0)+1;}
    if(FB.t>4.5){FB.stage=3;flashBurst();}}
  else if(FB.stage===3){if(FB.exit&&hyp(P.x-FB.exit.x,P.y-FB.exit.y)<90)flashEnd();
    if(P.hp<25)P.hp=25;}
}
function flashBurst(){
  const c=FB.cont, z=npcs.find(n=>n.id==='zeFB');
  playCut([{fx:'shake',v:20},{sfx:'bigBoom',v:.5},{do:()=>{FB.open=1;for(let i=0;i<40;i++)parts.push({k:'debris',x:c.x,y:c.y,vx:rr(-300,300),vy:rr(-300,300),life:.8,max:.8,s:rr(2,5),c:'#5a6068'});}},
    {cam:{x:c.x,y:c.y},t:.8},{fx:'slow',v:.8},
    {say:'matheus',m:'s',t:'A porta... a porta do contêiner entortou pra fora.'},
    {do:()=>{FB.arm=1;AU.roar();AU.scream(1);if(z){bloodBurst(z.x,z.y,40,0);GORE.push({k:'corpse',x:z.x,y:z.y,rot:1,type:'zumbi',col:'#d07a24',skin:'#c89878',r:11});addDecal({k:'blood',x:z.x,y:z.y,r:34,rot:0,seed:.4});}}},{fx:'shake',v:14},
    {say:'matheus',m:'s',t:'SEU ZÉ!'},
    {say:'matheus',m:'s',think:true,t:'Um braço. Branco. Do tamanho de um carro. Puxou ele pra dentro inteiro.',dur:2.4},
    {do:()=>{for(let i=0;i<6;i++){const a=Math.random()*6.283,d=rr(160,260);const [x,y]=freeTileNear(((c.x+Math.cos(a)*d)/TILE)|0,((c.y+Math.sin(a)*d)/TILE)|0,false);const e=makeEnemy(i<2?'corr':'zumbi',tc(x),tc(y),null);e.col='#d07a24';e.state='chase';e.hunt=true;e.huntT=60;e.lx=P.x;e.ly=P.y;enemies.push(e);}
      const [ex,ey]=freeTileNear(((P.x/TILE)|0)-30,((P.y/TILE)|0)+12,true);FB.exit={x:tc(ex),y:tc(ey)};}},
    {say:'matheus',m:'s',think:true,t:'Os outros estivadores... estão levantando. CORRE.',dur:1.6},{camFree:1}]);
}
function flashEnd(){
  FB.stage=4;
  playCut([{fx:'blackout',v:2},{say:'matheus',m:'t',t:'Eu corri até a Universidade de BC. Três horas andando no escuro. Não contei pra ninguém. Achei que ninguém ia acreditar.'},
    {say:'matheus',m:'s',t:'Aquilo é o T-00, Richard. E ele ainda tá no porto.'}],
    ()=>{FB.on=false;const s=FB.save;FB.save=null;P.lookO=null;try{loadState(s);G.mode='play';G.flags.flashDone=true;toast('De volta ao presente.');if(typeof ach==='function')ach('flash');}catch(e){console.error(e);}});
}
function drawFlash(){
  if(!FB.on||!FB.cont)return; const c=FB.cont; if(!inV(c.x,c.y,200))return;
  ctx.save();ctx.translate(c.x,c.y);ctx.fillStyle='#3a4a5a';ctx.fillRect(-60,-26,120,52);ctx.fillStyle='#2a3440';for(let x=-56;x<60;x+=8)ctx.fillRect(x,-26,3,52);
  ctx.fillStyle='#d8d4c8';ctx.font='700 14px sans-serif';ctx.textAlign='center';ctx.fillText('T-00',0,4);
  const shake=FB.stage===2?rr(-2,2):0;ctx.fillStyle=FB.open?'#1a1e22':'#4a5a6a';ctx.fillRect(56+shake,-24,FB.open?18:6,48);
  if(FB.arm){ctx.fillStyle='#d8d0c0';ctx.beginPath();ctx.moveTo(60,-12);ctx.quadraticCurveTo(110,-40,150,-6);ctx.lineTo(160,4);ctx.quadraticCurveTo(110,-10,60,12);ctx.closePath();ctx.fill();ctx.strokeStyle='#8a3a30';ctx.lineWidth=2;for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(150,-4+i*3);ctx.lineTo(168,-10+i*6);ctx.stroke();}}
  ctx.restore();
  ctx.fillStyle='#e8e8e4';ctx.fillRect(c.x-160,c.y-20,70,34);ctx.fillStyle='#1a1a1a';ctx.font='700 9px sans-serif';ctx.textAlign='center';ctx.fillText('VÉRTICE',c.x-125,c.y);
}

// ---------- BRAVA: mais coisas pra fazer ----------
(function(){
  const g=genV12; genV12=function(){g();
    if(LM.mirante){const [x,y]=freeTileNear(((LM.mirante.x/TILE)|0)+2,(LM.mirante.y/TILE)|0,false);addInteract(x,y,'binoculo',37);LM.binoculo={x:tc(x),y:tc(y)};}
    // barco encalhado na areia da Brava
    let sp=null;for(let y=126;y<138&&!sp;y++)for(let x=176;x<200;x++)if(getT(x,y)===T.SAND&&getT(x+1,y)===T.SAND&&getT(x+2,y)===T.SAND&&getT(x,y+1)===T.SAND){sp=[x,y];break;}
    if(sp){addInteract(sp[0],sp[1],'barco',27);LM.barco={x:tc(sp[0]),y:tc(sp[1])};}
  };
})();
function binoculoUse(){
  const F=G.flags; const B=LM.oficina||{x:tc(140),y:tc(300)};
  playCut([{say:'rafa',m:'n',t:'Um binóculo de moeda, desses de turista. Ainda tem uma moeda presa.'},
    {cam:{x:tc(110),y:tc(250)},t:2.6},{fx:'zoom',v:.8},
    {say:'rafa',m:'s',think:true,t:F.inibidorDone?'Balneário inteira apagada. Só o fogo. E alguma coisa enorme andando na Avenida Atlântica.':'Dá pra ver Balneário inteira daqui. Os prédios pegando fogo, um atrás do outro, como vela.',dur:3},
    {cam:{x:tc(60),y:tc(30)},t:2.2},
    {say:'rafa',m:'t',think:true,t:'E lá longe, o porto. Com as luzes acesas. Ainda tem alguém lá.',dur:2.4},{fx:'zoom',v:1},{camFree:1}],
    ()=>{if(!F.binoc){F.binoc=true;ach('binoculo');}});
}
function barcoUse(){
  const F=G.flags; if(F.barco)return toast('O barco está vazio. Só água e areia lá dentro.');
  F.barco=true; AU.creak(.6);
  for(const [id,q] of [['m9',14],['ervaV',1],['pilha',1]]){const l=invAdd(id,q);if(l)boxAdd(id,l);}
  toast('Dentro do barco: munição, uma erva e uma pilha. E um celular com 47 chamadas perdidas.');
  later(900,()=>{const a=Math.random()*6.283;for(let i=0;i<3;i++){const [x,y]=freeTileNear(((P.x+Math.cos(a+i)*140)/TILE)|0,((P.y+Math.sin(a+i)*140)/TILE)|0,false);const e=makeEnemy('afog',tc(x),tc(y),null);e.rising=1;e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);}AU.splash(1);bark('rafa','s','Tem gente saindo da água!');});
}

// ---------- UNIVALI: missões pequenas ----------
// A prova do Rese: três folhas espalhadas · o fone do Matheus · a formatura no Foyer
(function(){
  const g=genV12; genV12=function(){g();
    const B=n=>buildings.find(b=>b.name&&b.name.startsWith(n));
    let k=0; for(const n of ['Bloco 4','Bloco 5','Bloco 9']){const b=B(n);if(!b)continue;const [x,y]=freeTileNear(b.x+((b.w/2)|0),b.y+((b.h/2)|0),false);pickups.push({uid:'prova'+k,tx:x,ty:y,x:tc(x),y:tc(y),id:'folhaProva',q:1,kind:'item'});pickOcc.add(idx(x,y));k++;}
    {const b=B('Bloco 9');if(b){const [x,y]=freeTileNear(b.x+2,b.y+2,false);pickups.push({uid:'foneMat',tx:x,ty:y,x:tc(x),y:tc(y),id:'foneMat',q:1,kind:'item'});pickOcc.add(idx(x,y));}}
    {const b=B('Foyer');if(b){LM.foyerIn={x:tc(b.x+b.w/2),y:tc(b.y+b.h/2)};}}
  };
})();
Object.assign(ITEMS,{
  folhaProva:{n:'Folha da prova do Rese',s:'PROVA',c:'#e8e4d8',st:3,k:'key',d:'Uma folha da prova de recuperação, com o nome RICHARD escrito no topo pelo professor. Tem mais duas espalhadas pelos blocos.'},
  foneMat:{n:'Fone do Matheus',s:'FONE',c:'#2a2a2e',st:1,k:'key',d:'O fone de ouvido do Matheus, todo enrolado. Ele esqueceu no estúdio do Bloco 9.'},
});
Object.assign(INT_LABEL,{binoculo:'Binóculo de moeda',barco:'Barco encalhado'});
function uniMissionsTick(dt){
  const F=G.flags;
  if(!F.provaDone&&invCount('folhaProva')>=3&&LM.sala102&&hyp(P.x-LM.sala102.x,P.y-LM.sala102.y)<120&&!CUT.on){F.provaDone=true;invRemove('folhaProva',3);
    playCut([{say:'rafa',m:'h',think:true,t:'Três folhas. A prova inteira. Vou deixar na mesa dele.',dur:2},
      ...(F.matFollow?[{say:'matheus',m:'a',t:'Tu vai FAZER a prova? No meio do apocalipse?'},{say:'rafa',m:'h',t:'Ele disse que eu ia fazer nem que fosse no helicóptero.'}]:[]),
      {do:()=>{const l=invAdd('calmante',2);if(l)boxAdd('calmante',l);ach('prova');toast('Prova entregue. Na gaveta do professor: dois calmantes e um bilhete: "Bom trabalho. Nota 7."');}}]);}
  if(!F.foneDone&&invCount('foneMat')>0&&F.matFollow&&compOf('matheus')&&hyp(compOf('matheus').x-P.x,compOf('matheus').y-P.y)<120&&!CUT.on){F.foneDone=true;invRemove('foneMat',1);
    playCut([{say:'rafa',m:'h',t:'Matheus. Toma. Teu fone de nerd.'},{say:'matheus',m:'h',t:'MEU FONE! ...Valeu, mano. Sério.'},{say:'matheus',m:'a',t:'Mas não é de nerd.'},
      {do:()=>{const l=invAdd('pecas',2);if(l)boxAdd('pecas',l);toast('O Matheus te deu duas peças de arma que ele guardava na mochila.');}}]);}
  // a formatura que não aconteceu
  if(!F.formatura&&LM.foyerIn&&inZone()&&hyp(P.x-LM.foyerIn.x,P.y-LM.foyerIn.y)<160&&!CUT.on){F.formatura=true;
    AU.tn(392,392,.6,'triangle',.05);AU.tn(523,523,.6,'triangle',.05,.6);AU.tn(659,659,1.2,'triangle',.05,1.2);
    for(let i=0;i<8;i++)AU.nz(.2,1800,1,.06,'bandpass',2+i*.12);
    psyFloat(LM.foyerIn.x,LM.foyerIn.y-40,'(aplausos)',{life:2.4,c:'#d8d0b8',size:13});
    later(2600,()=>{bark('rafa','s','Tem gente de beca no palco... de chapéu de formatura. Aplaudindo. Não tem plateia.');
      for(let i=0;i<5;i++){const [x,y]=freeTileNear(((LM.foyerIn.x)/TILE|0)+ri(-4,4),((LM.foyerIn.y)/TILE|0)-ri(2,4),false);const e=makeEnemy('zumbi',tc(x),tc(y),null);e.col='#141418';e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);}AU.roar();});}
}
if(typeof ACH!=='undefined')ACH.push({id:'prova',n:'Nota 7',d:'Entregue a prova de recuperação do professor Rese.'},{id:'binoculo',n:'Vista do mirante',d:'Olhe Balneário pelo binóculo do Morro do Careca.'},{id:'flash',n:'Seis horas antes',d:'Jogue a lembrança do Matheus no porto.'});

// ---------- ganchos ----------
(function(){
  const vi=v12Interact; v12Interact=function(o){if(o.type==='binoculo')return binoculoUse();if(o.type==='barco')return barcoUse();return vi(o);};
  const vt=v16Tick; v16Tick=function(dt){vt(dt);if(G.mode!=='play')return;zoneLightTick();if(CUT.on)return;wxTick(dt);flashTick(dt);uniMissionsTick(dt);
    // o flashback começa logo depois que o Matheus entra no grupo (fora de perigo)
    const F=G.flags; if(F.uniDone&&F.uniMat&&!F.flashDone&&!FB.on&&!G.ev.uniWave&&!P.inCar&&!G.struggle&&!G.qte&&!enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<500)){G.ev.fbT=(G.ev.fbT||0)+dt;if(G.ev.fbT>6)STORY.flashStart();}};
  const ob=objective; objective=function(){if(FB.on)return flashObjective();return ob();};
  const dp=drawParts; drawParts=function(){dp();drawFlash();};
  const ds=drawPsy; drawPsy=function(){drawWx();ds();};
  const rs=resetState; resetState=function(d){rs(d);G.wx=null;G.wxSight=1;G._dkWx=0;FB.on=false;P.lookO=null;};
  // o clima vai junto no registro (e volta igual depois do flashback)
  const ser=serialize; serialize=function(){const s=ser();if(G.wx){s.wx=G.wx;s.wxT=G.wxT;}return s;};
  const ls=loadState; loadState=function(s){ls(s);if(s&&s.wx&&WX[s.wx]){wxSet(s.wx,true);if(s.wxT>0)G.wxT=s.wxT;}};
  // durante o flashback não dá pra salvar
  const sv=UI.save.bind(UI); UI.save=function(){if(FB.on){toast('Isso é uma lembrança. Não dá pra salvar aqui.');return;}return sv();};
  const di=die; die=function(){if(FB.on){P.hp=30;toast('O Matheus tropeçou, mas levantou. Corre!');return;}return di();};
  // no flashback o Matheus está sozinho no porto, seis horas antes: sem o grupo, sem zumbis de fora e sem os sustos do Richard
  const sc=syncComps; syncComps=function(){if(FB.on){G.comps=[];return;}return sc();};
  const us=updSpawner; updSpawner=function(dt){if(FB.on){G.spawnT=4;return;}return us(dt);};
  const ue=updEvents; updEvents=function(dt){if(FB.on){updPeds(dt);return;}return ue(dt);};
  const ct=cryTick; cryTick=function(dt){if(FB.on)return;return ct(dt);};
  const tt=trapTick; trapTick=function(dt){if(FB.on)return;return tt(dt);};
  const pt=psyTick; psyTick=function(dt){if(FB.on)return;return pt(dt);};
  const st=soniaTick; soniaTick=function(dt){if(FB.on)return;return st(dt);};
  const zt=zoeiraTick; zoeiraTick=function(dt){if(FB.on)return;return zt(dt);};
  const tr=terrorTick; terrorTick=function(dt){if(FB.on)return;return tr(dt);};
})();
// no flashback só o Matheus (e quem estava no porto) fala: nada de comentários do Richard ou do grupo
(function(){const b=bark;bark=function(who){if(FB.on&&who!=='matheus'&&who!=='zeFB'&&who!=='ze')return;return b.apply(this,arguments);};})();
