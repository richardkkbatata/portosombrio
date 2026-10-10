// ===================== 1.4: O CAÇADOR DA VÉRTICE · A GALERIA · A MALETA =====================
// Capítulo 1 ganha uma missão nova: o bondinho da Barra Sul está sem energia, e o único caminho até
// as Laranjeiras é a galeria pluvial que passa por baixo do Rio Camboriú. A entrada fica no Shopping
// Atlântico... e alguém da Vértice chegou lá antes.

// ---------- utilidades ----------
function sewB(){const b=buildings.find(b=>b.kind==='esgoto');return b?b.id:-1;}
function inSew(){const b=sewB();return b>=0&&G.inB===b;}
function shopRect(){const b=buildings.find(b=>b.kind==='shop');return b?{x0:b.x*TILE,y0:b.y*TILE,x1:(b.x+b.w)*TILE,y1:(b.y+b.h)*TILE,id:b.id}:null;}
function inShopPx(x,y){const r=shopRect();return r&&x>r.x0&&x<r.x1&&y>r.y0&&y<r.y1;}
function segCircle(x0,y0,x1,y1,cx,cy,r){const dx=x1-x0,dy=y1-y0,l2=dx*dx+dy*dy||1;let t=((cx-x0)*dx+(cy-y0)*dy)/l2;t=clamp(t,0,1);const px=x0+dx*t-cx,py=y0+dy*t-cy;return px*px+py*py<r*r;}
function brShopId(){return shopB();}
const SEWX0=6, SEWY0=H+24;          // canto da galeria (abaixo da superfície)

// ---------- a galeria pluvial ----------
function genSewer(){
  const old=rnd; rnd=mulberry32(14101);
  for(let y=H;y<HT;y++)for(let x=0;x<W;x++){const k=idx(x,y);map[k]=T.BORDER;bmap[k]=-1;safeMask[k]=0;under[k]=0;meta[k]=0;}
  const sb=building(SEWX0,SEWY0,196,H+81-SEWY0,{floor:T.CONC,roof:'#101214',name:'Galeria Pluvial do Rio Camboriú',kind:'esgoto',doors:[]});
  sb.noZ=true; sb.big=true; sb.dark=true; sb.lit=false;
  rect(sb.x+1,sb.y+1,sb.w-2,sb.h-2,T.WALL);
  const fl=(x,y,w,h)=>rect(x,y,w,h,T.CONC), wat=(x,y,w,h)=>rect(x,y,w,h,T.WATER), Y=SEWY0;
  // entrada (escada do almoxarifado do shopping)
  fl(8,Y+2,12,9); LM.sewIn={x:tc(11),y:tc(Y+5)}; LM.sewLadder={x:tc(10),y:tc(Y+3)};
  // T1: galeria principal, canal no meio e passarelas dos dois lados
  fl(20,Y+4,100,6); wat(24,Y+6,94,2); for(const bx of [32,52,70,92,110])fl(bx,Y+6,2,2);
  // sala A (depósito) · estação de bombeamento · sala B · sala C (fim da galeria)
  fl(34,Y+12,9,7); fl(37,Y+10,2,2);
  fl(54,Y+12,22,14); fl(58,Y+10,3,2); wat(60,Y+19,8,4);
  fl(96,Y+12,10,7); fl(99,Y+10,2,2);
  fl(120,Y+3,8,8);
  // T2: poço inundado que desce para o coletor-tronco (seca quando a bomba liga)
  fl(84,Y+10,5,24); LM.sewT2={x:84,y:Y+12,w:5,h:20};
  // T3: coletor-tronco
  fl(40,Y+34,110,7); wat(44,Y+37,103,1); for(const bx of [60,84,85,86,87,88,104,126])fl(bx,Y+37,1,1);
  // o ninho, no fim oeste
  fl(30,Y+32,10,10);
  // sala de controle das comportas
  fl(118,Y+42,12,8); fl(122,Y+41,3,1);
  // nicho lateral (comporta 3)
  fl(108,Y+42,6,5); fl(110,Y+41,2,1);
  // T4: sifão debaixo do rio · T5: poço de saída
  fl(150,Y+34,30,7); fl(180,Y+6,8,35);
  LM.sewOut={x:tc(183.5),y:tc(Y+8)}; LM.sewLid={x:tc(183.5),y:tc(Y+7)};
  // comportas (portas de aço que as válvulas movem)
  addGate('comp1',142,Y+34,1,7,null,'#4a5258','Comporta 1','Comporta de aço fechada. As válvulas ficam na sala de controle.',T.CONC);
  addGate('comp2',41,Y+34,1,7,null,'#4a5258','Comporta 2','Comporta de aço. Do outro lado, alguma coisa respira.',T.CONC);
  addGate('comp3',110,Y+41,2,1,null,'#4a5258','Comporta 3','Comporta de aço de um nicho de manutenção.',T.CONC);
  for(const id of ['comp1','comp2','comp3'])gates.find(g=>g.id===id).sew=true;
  // móveis, restos, luzes
  for(const [x,y] of [[9,Y+9],[18,Y+3],[35,Y+13],[41,Y+17],[55,Y+13],[74,Y+13],[74,Y+24],[55,Y+24],[97,Y+13],[104,Y+17],[126,Y+4],[121,Y+9],[31,Y+33],[38,Y+40],[128,Y+48],[119,Y+48]])prop(x,y,(x+y)%3?4:12);
  for(const [x,y] of [[64,Y+14],[65,Y+14],[64,Y+15],[65,Y+15]])prop(x,y,15);  // a bomba
  addInteract(70,Y+13,'quadroBomba',37); LM.quadroBomba={x:tc(70),y:tc(Y+14)};
  addInteract(127,Y+44,'mapaDren',37); LM.mapaDren={x:tc(127),y:tc(Y+45)};
  for(const [i,x] of [[1,120],[2,123],[3,126]]){const it=addInteract(x,Y+43,'valvula',36);it.v=i;}
  addInteract(183,Y+6,'tampaSaida',37);
  // itens: três fusíveis, documentos, munição
  addPick(40,Y+17,'fus30',1); addPick(103,Y+15,'fus10',1); addPick(124,Y+8,'fus20',1);
  addPick(100,Y+17,SEWDOC,1,'file'); addPick(123,Y+5,SEWDOC+1,1,'file'); addPick(125,Y+48,SEWDOC+2,1,'file');
  addPick(36,Y+16,'m9',10); addPick(72,Y+24,'ervaV',1); addPick(111,Y+45,'gran',1); addPick(112,Y+44,'pecas',2); addPick(184,Y+20,'cart',4); addPick(186,Y+30,'ervaR',1); addPick(14,Y+9,'pilha',1);
  for(const [x,y,c] of [[12,Y+4,'siren'],[44,Y+5,'lamp'],[80,Y+8,'siren'],[124,Y+6,'lamp'],[123,Y+46,'siren'],[184,Y+12,'siren'],[184,Y+36,'lamp']])lights.push({x:tc(x),y:tc(y),r:c==='siren'?120:100,c,f:1,b:sb.id});
  for(const [x,y] of [[58,Y+14],[72,Y+22],[66,Y+20]])lights.push({x:tc(x),y:tc(y),r:150,c:'lamp',f:0,b:sb.id,sewPump:true,off:true});
  // gente que se escondeu aqui embaixo
  for(const [x,y,r] of [[22,Y+8,1.2],[47,Y+15,.4],[76,Y+5,2.6],[123,Y+9,1.9],[33,Y+36,.2],[36,Y+38,2.2],[34,Y+40,4],[150,Y+38,1]])GORE.push({k:'corpse',x:tc(x),y:tc(y),rot:r,type:'zumbi',col:'#3a3e3a',skin:'#a89880',r:11});
  for(const [x,y] of [[22,Y+7],[124,Y+8],[34,Y+37],[36,Y+39],[66,Y+16]])GORE.push({k:'blood',x:tc(x),y:tc(y),r:26,rot:0,seed:.3});
  // os que já vivem aqui
  for(const [u,x,y,t,dm] of [['sc1',46,Y+4,'cego',true],['sc2',101,Y+8,'cego',false],['sc3',60,Y+17,'cego',true],['sc4',72,Y+20,'cego',false],['sc5',70,Y+38,'cego',false],['sc6',98,Y+35,'cego',true],['sa1',66,Y+7,'afog',false],['sa2',160,Y+38,'afog',false],['sa3',184,Y+24,'cego',false]])initEnemies.push({uid:u,type:t,x:tc(x),y:tc(y),dorm:dm});
  rnd=old;
}
function sewReach(){
  const q=[],s=idx((LM.sewIn.x/TILE)|0,(LM.sewIn.y/TILE)|0); reach[s]=1; q.push(s);
  while(q.length){const k=q.pop(),x=k%W,y=(k/W)|0;for(const [dx,dy] of DIRS4){const nx=x+dx,ny=y+dy;if(!inb(nx,ny))continue;const nk=idx(nx,ny);if(reach[nk])continue;const t=map[nk];if(SOLID[t]&&t!==T.GATE&&t!==T.SHUTTER)continue;reach[nk]=1;q.push(nk);}}
}
// inundado/seco: T2 (poço) e T4 (sifão)
function sewFlood(t2,t4){
  const Y=SEWY0;
  if(t2!=null)for(let y=Y+12;y<Y+32;y++)for(let x=84;x<89;x++)setT(x,y,t2?T.WATER:T.CONC);
  if(t4!=null){for(let y=Y+34;y<Y+41;y++)for(let x=150;x<180;x++)setT(x,y,t4&&y>Y+34&&y<Y+40?T.WATER:T.CONC);for(let y=Y+34;y<Y+41;y++)for(let x=180;x<188;x++)setT(x,y,t4&&y>Y+35&&y<Y+40?T.WATER:T.CONC);}
  if(typeof invalidateRect==='function')invalidateRect(80,Y+8,110,36);
  if(typeof MAPV!=='undefined')MAPV++;
}

// ---------- itens e documentos novos ----------
Object.assign(ITEMS,{
  manobra:{n:'Chave de manobra',s:'MANOB.',c:'#b8a070',st:1,k:'key',d:'Barra de ferro em T dos bombeiros. Destrava a tampa da galeria pluvial no almoxarifado do shopping.'},
  fus10:{n:'Fusível 10A',s:'10A',c:'#d8cc50',st:1,k:'key',d:'Fusível de cartucho, 10 ampères. Do quadro da estação de bombeamento.'},
  fus20:{n:'Fusível 20A',s:'20A',c:'#e0a040',st:1,k:'key',d:'Fusível de cartucho, 20 ampères. Do quadro da estação de bombeamento.'},
  fus30:{n:'Fusível 30A',s:'30A',c:'#e06a3a',st:1,k:'key',d:'Fusível de cartucho, 30 ampères. Do quadro da estação de bombeamento.'},
  radioBr:{n:'Rádio do Brandt',s:'RÁDIO',c:'#5a6a5a',st:1,k:'key',d:'Rádio tático da Vértice, rachado. De vez em quando chia uma voz.'},
});
const SEWDOC=DOCS.length;
DOCS.push(
  {t:'Planilha da manutenção',b:`CASAN · ESTAÇÃO ELEVATÓRIA EE-04 · RIO CAMBORIÚ\n\nQuadro geral da bomba (da esquerda para a direita):\n\n  BORNE A — motor de partida\n  BORNE B — painel e iluminação\n  BORNE C — bomba de recalque\n\nRegra do Seu Nestor, escrita na margem: "o mais forte vai no meio, o mais fraco nunca vai do lado do motor."\n\nAtenção: fusível errado no borne queima na hora. Já levei choque duas vezes.`},
  {t:'Bilhete do Seu Nestor',b:`Pra quem achar.\n\nEu desci pra religar a bomba quando a chuva começou. A galeria encheu em vinte minutos. Fiquei preso aqui com uns quinze que vieram do shopping fugindo.\n\nNo segundo dia uns começaram a ficar pálidos. Os olhos ficaram brancos. Eles não enxergam mais nada, mas ouvem um rato andando do outro lado do canal.\n\nAnda abaixado. Não corre perto deles.\n\nE se ouvir uma coisa arranhando dentro do ninho, lá no fundo... não abre a comporta 2. Ela é do tamanho de um carro.`},
  {t:'Mapa da drenagem',b:`SALA DE CONTROLE · COMPORTAS DO COLETOR-TRONCO\n\nVálvula 1 → mexe nas comportas 1 e 2\nVálvula 2 → mexe nas comportas 2 e 3\nVálvula 3 → mexe na comporta 3 e no dreno do sifão\n\nPara esvaziar o sifão debaixo do rio: comporta 1 aberta, dreno aberto, as do meio fechadas.\n\n(Cada válvula faz um barulho do inferno. Pensa antes de girar.)`},
  {t:'Rádio do Brandt',b:`[chiado]\n\n"Brandt, aqui é Arantes. Status do shopping."\n"Limpo. Trinta e oito infectados neutralizados. O civil está vindo, o tal do Richard. O velho da oficina mandou ele pela galeria."\n"Ele viu alguma coisa?"\n"Ainda não."\n"Então garanta que não veja. A galeria leva ao ninho do T-11."\n"E se ele sobreviver ao T-11?"\n"Ninguém sobrevive ao T-11, sargento."\n\n[fim da gravação]`}
);

// ---------- inimigos novos ----------
Object.assign(ETYPES,{
  cego:{n:'Cego da galeria',hp:58,spd:48,dmg:13,r:11,col:'#8a8478',skin:'#d8d0c0',sight:0,blind:true},
  coletor:{n:'T-11 · O Coletor',hp:99999,spd:96,dmg:30,r:22,col:'#c8beb0',skin:'#e4dacb',sight:0},
  brandt:{n:'Sargento Brandt',hp:620,spd:96,dmg:9,r:12,col:'#16181b',skin:'#c9a486',sight:9999,boss:true},
});
// retrato do Brandt
PCH.brandt={name:'Sargento Brandt',skin:'#c9a486',shade:'#946a50',hair:'#141618',iris:'#5a6a70',bg:['#101418','#030405'],glow:'200,60,50',voice:96};
PXH.brandt={hw:58,hh:72,body:['#1a1c1f','#08090a'],
  clothes(c,cx,H2){c.fillStyle='#24272b';c.fillRect(70,224,140,H2-224);c.fillStyle='#2e3236';for(const x of [92,128,164])c.fillRect(x,246,26,30);
    c.fillStyle='#d8d4c8';c.beginPath();c.moveTo(cx-10,238);c.lineTo(cx,256);c.lineTo(cx+10,238);c.lineTo(cx+5,238);c.lineTo(cx,248);c.lineTo(cx-5,238);c.closePath();c.fill();
    c.strokeStyle='#3a3e44';c.lineWidth=5;c.beginPath();c.moveTo(70,232);c.lineTo(210,300);c.stroke();},
  hair(c,cx,cy,hw,hh,p){c.fillStyle='#1a1c1f';c.beginPath();c.moveTo(cx-hw-6,cy+70);c.bezierCurveTo(cx-hw-14,cy-hh-26,cx+hw+14,cy-hh-26,cx+hw+6,cy+70);c.closePath();c.fill();
    c.fillStyle='#2a2d31';c.fillRect(cx-hw-10,cy-18,10,34);c.fillStyle='#3a3e44';c.fillRect(cx-hw-8,cy+12,26,5);},
  over(c,cx,cy,ey,ex){c.fillStyle='#1a1c1f';c.fillRect(cx-70,ey+14,140,90);c.fillRect(cx-70,ey-60,140,44);
    c.strokeStyle='rgba(255,255,255,.05)';c.lineWidth=2;for(let y=ey+20;y<ey+100;y+=6){c.beginPath();c.moveTo(cx-60,y);c.lineTo(cx+60,y);c.stroke();}
    c.strokeStyle='#7a4a3a';c.lineWidth=2;c.beginPath();c.moveTo(cx+ex+4,ey-18);c.lineTo(cx+ex+16,ey+12);c.stroke();}};

// ---------- fumaça que bloqueia a visão ----------
const BR={smokes:[],tracers:[],lasers:[]};
function addSmoke(x,y,r,t){BR.smokes.push({x,y,r,t,max:t});for(let i=0;i<34;i++){const a=Math.random()*6.283,s=rr(20,120);parts.push({k:'smoke',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(1.5,3),max:3,s:rr(18,34),c:'#6a6e70'});}AU.nz(1.6,2400,.4,.22,'highpass');AU.nz(1,600,.5,.12);}
(function(){const l0=los;los=function(x0,y0,x1,y1){if(BR.smokes.length)for(const s of BR.smokes)if(s.t>.6&&segCircle(x0,y0,x1,y1,s.x,s.y,s.r*.82))return false;return l0(x0,y0,x1,y1);};})();
function smokeTick(dt){for(const s of BR.smokes){s.t-=dt;if(Math.random()<dt*10&&s.t>.5){const a=Math.random()*6.283,d=Math.random()*s.r*.8;parts.push({k:'smoke',x:s.x+Math.cos(a)*d,y:s.y+Math.sin(a)*d,vx:rr(-12,12),vy:rr(-12,12),life:rr(1.6,2.6),max:2.6,s:rr(22,38),c:'#5e6264'});}}BR.smokes=BR.smokes.filter(s=>s.t>0);
  for(const t of BR.tracers)t.life-=dt; BR.tracers=BR.tracers.filter(t=>t.life>0);}
function drawSmokes(){for(const s of BR.smokes){const a=clamp(s.t/s.max*2.2,0,1)*.55;if(!inV(s.x,s.y,s.r))continue;const g=ctx.createRadialGradient(s.x,s.y,s.r*.2,s.x,s.y,s.r);g.addColorStop(0,`rgba(110,114,116,${a})`);g.addColorStop(1,'rgba(110,114,116,0)');ctx.fillStyle=g;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,6.283);ctx.fill();}}

// ---------- QUICK TIME: aperte no tempo certo ----------
function qteStart(o){
  if(G.qte)return; for(const k in KEYS)KEYS[k]=false; mouseDown=false; if(typeof resetTouch==='function')resetTouch();
  G.qte={px:P.x,py:P.y,label:o.label||'AGORA!',steps:o.steps||null,onStep:o.onStep||null,n:o.steps?o.steps.length:(o.n||3),i:0,t:0,dur:o.dur||1.3,w0:.48,w1:.86,fast:o.fast||1,ok:o.onOk,fail:o.onFail,foe:o.foe||null,kind:o.kind||'luta',flashT:0,done:false};
  AU.sting(); buzz([40,30,40]); G.shake+=4;
}
function qtePress(){
  const q=G.qte; if(!q||q.done||q.hold>0)return; const k=q.t/q.dur;
  if(k>=q.w0&&k<=q.w1){q.i++;q.flashT=.25;AU.hit();AU.swish();G.shake+=6;buzz(30);
    if(q.foe){const a=Math.atan2(q.foe.y-P.y,q.foe.x-P.x);for(let i=0;i<8;i++)parts.push({k:'spark',x:(P.x+q.foe.x)/2,y:(P.y+q.foe.y)/2,vx:Math.cos(a+rr(-1.4,1.4))*rr(80,220),vy:Math.sin(a+rr(-1.4,1.4))*rr(80,220),life:.25,max:.25,s:2,c:'#ffe6a0'});}
    if(q.onStep)try{q.onStep(q.i-1);}catch(e){}
    if(q.i>=q.n){q.done=true;G.qte=null;q.ok&&q.ok();return;}
    q.t=0;q.hold=.32;q.dur=rr(1.05,1.3)*(q.fast||1);const w=rr(.4,.58);q.w0=w;q.w1=w+rr(.3,.36);
  } else qteFail();
}
function qteFail(){const q=G.qte;if(!q)return;q.done=true;G.qte=null;AU.hurt();buzz([80,40,120]);q.fail&&q.fail();}
function qteTick(dt){
  const q=G.qte; if(!q)return; if(CUT.on){return;}
  if(q.hold>0){q.hold-=dt;}else q.t+=dt; if(q.flashT>0)q.flashT-=dt; P.inv=Math.max(P.inv,.25); P.firing=false; P.x=q.px; P.y=q.py;
  if(q.foe){const f=q.foe,a=Math.atan2(f.y-P.y,f.x-P.x),d=hyp(f.x-P.x,f.y-P.y);P.ang=a;f.face=a+Math.PI;if(d>f.r+P.r+2){f.x=P.x+Math.cos(a)*(f.r+P.r);f.y=P.y+Math.sin(a)*(f.r+P.r);}
    const wob=Math.sin(G.time*28)*1.4;f.x+=Math.cos(a+1.57)*wob*.1;}
  if(q.t>q.dur)qteFail();
}
function drawQTE(){
  const q=G.qte; if(!q||G.mode!=='play'||CUT.on)return; const z=view.z;
  const fx=q.foe?(P.x+q.foe.x)/2:P.x, fy=q.foe?(P.y+q.foe.y)/2:P.y; let sx=(fx-cam.x)*z, sy=(fy-cam.y)*z-70;
  sx=clamp(sx,90,view.w-90); sy=clamp(sy,110,view.h-120);
  ctx.setTransform(dpr,0,0,dpr,0,0); const k=clamp(q.t/q.dur,0,1), R0=64, r=R0*(1-k)+8;
  ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.arc(sx,sy,R0+12,0,6.283);ctx.fill();
  // a faixa certa
  const rw0=R0*(1-q.w1)+8, rw1=R0*(1-q.w0)+8;
  ctx.strokeStyle='rgba(217,163,60,.85)';ctx.lineWidth=rw1-rw0;ctx.beginPath();ctx.arc(sx,sy,(rw0+rw1)/2,0,6.283);ctx.stroke();
  const inW=k>=q.w0&&k<=q.w1;
  ctx.strokeStyle=inW?'#fff6d8':'#e8e0d0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(sx,sy,r,0,6.283);ctx.stroke();
  ctx.fillStyle=q.flashT>0?'#d9a33c':'#ddd6c6';ctx.font=`700 ${IN.touch?18:22}px ${FONT_UI}`;ctx.textAlign='center';ctx.textBaseline='middle';
  ctx.fillText(IN.touch?'TOQUE':'E',sx,sy+1);ctx.textBaseline='alphabetic';
  ctx.font=`700 16px ${FONT_UI}`;ctx.fillStyle='#ddd6c6';ctx.fillText(q.steps&&q.steps[q.i]?q.steps[q.i]:q.label,sx,sy-R0-22);
  ctx.font=`600 12px ${FONT_UI}`;ctx.fillStyle='rgba(221,214,198,.7)';
  ctx.fillText(IN.touch?'toque em AGORA! quando o anel chegar na faixa':'aperte E, Espaço ou clique quando o anel chegar na faixa',sx,sy+R0+26);
  for(let i=0;i<q.n;i++){ctx.fillStyle=i<q.i?'#d9a33c':'rgba(221,214,198,.25)';ctx.fillRect(sx-q.n*9+i*18,sy+R0+34,12,4);}
}

// ---------- o Sargento Brandt ----------
// Ex-forças especiais, contratado da Vértice. Atira de cobertura, some na fumaça, aparece do outro lado.
// Não é invencível: depois de cada rajada ele precisa recarregar, e no corpo a corpo dá pra virar o jogo.
function brandtCover(e){
  const r=shopRect(); if(!r)return null; const out=[];
  for(let i=0;i<60;i++){const x=rr(r.x0+80,r.x1-80),y=rr(r.y0+80,r.y1-300),tx=(x/TILE)|0,ty=(y/TILE)|0,k=idx(tx,ty);
    if(SOLID[map[k]]||bmap[k]!==r.id)continue; const d=hyp(x-P.x,y-P.y); if(d<360||d>900)continue; if(los(P.x,P.y,tc(tx),tc(ty)))continue;
    let near=0;for(const [dx,dy] of DIRS8)if(SOLID[getT(tx+dx,ty+dy)])near++; out.push({x:tc(tx),y:tc(ty),s:near+Math.random()*2});}
  out.sort((a,b)=>b.s-a.s); return out[0]||null;
}
function brSay(t,m='n'){bark('brandt',m,t,{radio:true,dur:Math.max(2.6,t.length*.05+1.4)});}
const BR_TAUNT={
  start:['Richard. É Richard, né? O velho da oficina falou de você no rádio. Falou demais.','Não é pessoal, garoto. A Vértice não deixa testemunha.'],
  lost:['Tá escuro aí? Pra mim não tá.','Eu fiz isso em Manaus, em São Gabriel, no Haiti. Você é só mais um corredor.','Respira mais baixo. Eu tô ouvindo daqui.','Seu amigo tá do lado de fora batendo na porta. Quer que eu deixe ele entrar?'],
  hurt:['Ah. Esse doeu.','Bom. Pelo menos você aprende rápido.','Isso foi sorte.'],
  reload:['Trocando!','Recarregando...','Pente vazio.'],
  smoke:['Cadê eu, Richard?','Olha pra trás.','Vamos fazer diferente.'],
  low:['Tá bom... tá bom. Você quer que seja assim.','Eles não me pagam o suficiente pra isso.'],
};
function spawnBrandt(x,y){
  const e=makeEnemy('brandt',x,y,'brandt'); e.mode='stalk'; e.mag=9; e.mt=0; e.smokeCd=6; e.rushCd=7; e.tauntT=10; e.light=true; e.ph=1; e.state='chase'; e.hunt=true; e.cut=false; e.va=1;
  enemies.push(e); return e;
}
function updBrandt(e,dt){
  const F=G.flags; e.anim+=dt; e.flash=Math.max(0,e.flash-dt); e.hitAnim=Math.max(0,(e.hitAnim||0)-dt);
  if(e.burn>0){e.burn-=dt;e.hp-=8*dt;if(e.hp<1)e.hp=1;}
  if(F.brandtDone||e.mode==='gone')return;
  if(G.qte&&G.qte.foe===e)return;
  const dx=P.x-e.x,dy=P.y-e.y,d=hyp(dx,dy)||1, a=Math.atan2(dy,dx);
  const r=e.hp/e.max; e.ph=r>.66?1:r>.33?2:3;
  e.losT-=dt; if(e.losT<=0){e.losT=.15;e.los=los(e.x,e.y,P.x,P.y)&&!P.hidden;}
  e.smokeCd-=dt; e.rushCd-=dt; e.tauntT-=dt;
  if(e.tauntT<=0&&!e.los&&e.mode==='stalk'){e.tauntT=rr(14,22);brSay(pick2(BR_TAUNT.lost),'n');}
  const spd=e.t.spd*(e.ph===3?1.15:1);
  const go=(tx,ty,s)=>{const l=hyp(tx,ty)||1;move(e,tx/l*s*dt,ty/l*s*dt,true);e.moving=true;};
  e.moving=false;
  if(e.stun>0){e.stun-=dt;e.vx*=Math.pow(.02,dt);e.vy*=Math.pow(.02,dt);move(e,e.vx*dt,e.vy*dt,true);return;}
  switch(e.mode){
    case 'stalk':{
      e.face+=angDiff(e.face,a)*Math.min(1,dt*6);
      if(e.los&&d<720){
        if(e.ph>=2&&e.rushCd<=0&&d<300&&d>60){e.mode='rush';e.mt=0;e.rushCd=rr(9,13);AU.roar();brSay(pick2(['Chega de tiro.','Vem cá.','Agora é na faca.']),'s');e.emote={k:'!',t:.8};break;}
        if(d<190){go(-dx,-dy,spd*.8);}            // perto demais: recua atirando
        else if(d<420){const s=e.str||(e.str=Math.random()<.5?1:-1);go(-dy*s,dx*s,spd*.45);if(Math.random()<dt*.3)e.str=-s;}
        else go(dx,dy,spd*.6);
        e.aimT=(e.aimT||0)+dt; if(e.aimT>(e.ph===1?.85:.65)){e.mode='aim';e.mt=0;e.aimA=a;AU.beep(.6,2200);}
      } else {
        e.aimT=0;
        const f=flowDir(e,flow); if(f)go(f[0],f[1],spd*(e.light?.55:.75)); else if(d<700)go(dx,dy,spd*.5);
        if(d>1300)brandtRelocate(e,true);
      }
      if(e.smokeCd<=0&&(e.los&&d<380||e.flashed>0)){brandtRelocate(e);}
      break;}
    case 'aim':{ // laser vermelho travando em você
      e.mt+=dt; const lead=.18; const tx=P.x+(P.moving?Math.cos(P.legAng||P.ang)*20*lead*10:0),ty=P.y+(P.moving?Math.sin(P.legAng||P.ang)*20*lead*10:0);
      e.aimA+=angDiff(e.aimA,Math.atan2(ty-e.y,tx-e.x))*Math.min(1,dt*(e.ph===1?3.5:5)); e.face=e.aimA;
      if(!e.los&&e.mt>.25){e.mode='stalk';e.aimT=0;break;}
      if(e.mt>.62){e.mode='burst';e.burst=3;e.bt=0;}
      break;}
    case 'burst':{
      e.bt-=dt; e.face=e.aimA; if(e.bt>0)break; e.bt=.11;
      brandtShoot(e); e.burst--; e.mag--;
      if(e.mag<=0){e.mode='reload';e.mt=0;brSay(pick2(BR_TAUNT.reload),'s');AU.click2(1);break;}
      if(e.burst<=0){e.mode='stalk';e.aimT=-rr(.2,.6);}
      break;}
    case 'reload':{ // recarregando: a sua janela
      e.mt+=dt; go(-dx,-dy,spd*.55); e.face+=angDiff(e.face,a)*Math.min(1,dt*3);
      if(e.mt>2.6){e.mag=9;e.mode='stalk';e.aimT=0;AU.reload();}
      break;}
    case 'rush':{
      e.mt+=dt; e.face=a; go(dx,dy,230);
      if(d<e.r+P.r+8){e.mode='stalk';brandtGrapple(e);break;}
      if(P.dodge>0&&d<90&&e.mt>.15){e.mode='stalk';e.stun=1.6;e.vx=Math.cos(a)*160;e.vy=Math.sin(a)*160;floaters.push({x:e.x,y:e.y-24,t:'ELE TROPEÇOU',life:1});AU.thud(.8);G.shake+=6;break;}
      if(e.mt>1.4){e.mode='stalk';}
      break;}
    case 'vanish':{
      e.mt+=dt; e.fade=clamp(1-e.mt*1.6,0,1);
      if(e.mt>.9){const c=e.relo;if(c){e.x=c.x;e.y=c.y;}e.mode='stalk';e.fade=1;e.light=e.ph<2;e.aimT=-1;e.tauntT=rr(2,4);
        later(rr(700,1400),()=>{if(!G.flags.brandtDone)brSay(pick2(BR_TAUNT.smoke),'n');});
        // passos longe, do lado errado
        const pan=-Math.cos(P.ang)*.7;try{AU.stepAt&&AU.stepAt(pan,.8,.2);AU.stepAt&&AU.stepAt(pan,.7,.55);}catch(err){}}
      break;}
  }
  if(e.flashed>0)e.flashed-=dt;
}
function brandtRelocate(e,silent){
  const c=brandtCover(e); if(!c){e.smokeCd=3;return;}
  e.relo=c; e.smokeCd=e.ph===1?rr(14,20):rr(8,12);
  if(!silent){addSmoke(e.x,e.y,120,e.ph===3?8:6.5);G.shake+=3;}
  e.mode='vanish';e.mt=0;
}
function brandtShoot(e){
  const sp=(P.crouch?.07:.045)+(P.running||P.dodge>0?.08:0)+(e.ph===1?.02:0);
  const a=e.aimA+rr(-sp,sp), mx=e.x+Math.cos(a)*16, my=e.y+Math.sin(a)*16;
  let d=castRay(mx,my,a,900,BULLET_BLOCK,false); for(const s of BR.smokes)if(s.t>.6&&segCircle(mx,my,mx+Math.cos(a)*d,my+Math.sin(a)*d,s.x,s.y,s.r*.5)){d=Math.min(d,hyp(s.x-mx,s.y-my));}
  const ex=mx+Math.cos(a)*d, ey=my+Math.sin(a)*d;
  BR.tracers.push({x0:mx,y0:my,x1:ex,y1:ey,life:.07}); BR.flash={x:mx,y:my,t:.05};
  AU.shot('pistola'); alertNoise(e.x,e.y,500);
  if(segCircle(mx,my,ex,ey,P.x,P.y,P.r+3)&&!P.hidden){
    if(Math.random()<(P.moving?.55:.85))hurtPlayer(e.t.dmg*(G.flags.brandtHits>6?1:1.15),e.x,e.y);G.flags.brandtHits=(G.flags.brandtHits||0)+1;
  } else {for(let i=0;i<4;i++)parts.push({k:'spark',x:ex,y:ey,vx:rr(-90,90),vy:rr(-90,90),life:.2,max:.2,s:1.6,c:'#ffd27a'});}
}
function brandtGrapple(e){
  AU.roar(); G.shake+=10; buzz([60,30,60]);
  later(10,()=>{if(!e.alive||G.flags.brandtDone)return;
    qteStart({label:e.ph===3?'ELE QUER TE ESFAQUEAR!':'SEGURA A FACA DELE!',n:e.ph===3?4:3,foe:e,kind:'faca',
      onOk:()=>{const a=Math.atan2(e.y-P.y,e.x-P.x);brandtHurt(e,e.max*.13,true);e.stun=2.6;e.vx=Math.cos(a)*240;e.vy=Math.sin(a)*240;
        floaters.push({x:P.x,y:P.y-26,t:'CONTRA-ATAQUE',life:1});bloodBurst(e.x,e.y,14,a);AU.splat();G.hs=Math.max(G.hs||0,.18);G.shake+=10;
        later(500,()=>{if(!G.flags.brandtDone)brSay(pick2(BR_TAUNT.hurt),'a');});
        if(!G.flags.brKickTip){G.flags.brKickTip=true;later(900,()=>toast(IN.touch?'Ele tá tonto! Chegue perto e toque em USAR para chutar.':'Ele tá tonto! Chegue perto e aperte E para chutar.'));}},
      onFail:()=>{const a=Math.atan2(P.y-e.y,P.x-e.x);P.inv=0;hurtPlayer(22,e.x,e.y);move(P,Math.cos(a)*30,Math.sin(a)*30,false);bloodBurst(P.x,P.y,12,a);e.rushCd=4;e.smokeCd=Math.min(e.smokeCd,1);
        later(300,()=>{if(!G.flags.brandtDone)brSay(pick2(['Devagar demais.','Na próxima é no pescoço.','Achou que ia ser fácil?']),'a');});}});});
}
function brandtHurt(e,dmg,melee){
  if(G.flags.brandtDone)return;
  e.hp-=dmg; e.flash=.1; e.hitAnim=.2;
  if(!melee&&e.mode==='stalk'&&Math.random()<.18&&e.smokeCd<4)e.smokeCd=0;
  if(e.hp<=e.max*.66&&!e.p2){e.p2=true;brSay('Tá bom. Agora eu desligo a lanterna.','a');e.light=false;}
  if(e.hp<=e.max*.33&&!e.p3){e.p3=true;brSay(pick2(BR_TAUNT.low),'s');e.smokeCd=0;}
  if(e.hp<=1){e.hp=1;brandtEnd(e);}
}
function brandtKick(e){
  const a=Math.atan2(e.y-P.y,e.x-P.x); brandtHurt(e,e.max*.08,true); e.stun=1.2; e.vx=Math.cos(a)*320; e.vy=Math.sin(a)*320;
  AU.thud(1); AU.hit(); G.shake+=8; floaters.push({x:e.x,y:e.y-24,t:'CHUTE',life:.8}); buzz(50); P.slash=.25;
}
function brandtEnd(e){
  const F=G.flags; if(F.brandtDone)return; F.brandtDone=true; e.mode='gone';
  playCut([{fx:'slow',v:.8},{sfx:'thud',v:1},{fx:'shake',v:10},
    {cam:{x:e.x,y:e.y},t:.6},
    {say:'brandt',m:'s',t:'...Hah. Tá bom. Tá bom, garoto.'},
    {say:'brandt',m:'a',t:'Você ganhou o direito de morrer lá embaixo. Manda um oi pro T-11 por mim.'},
    {do:()=>{addSmoke(e.x,e.y,150,7);AU.click2(1);}},{wait:.8},
    {do:()=>{e.alive=false;F.brandtGone=true;bloodBurst(e.x,e.y,10,0);addDecal({k:'blood',x:e.x,y:e.y,r:22,rot:0,seed:.5});
      for(const [id,q,dx,dy] of [['m9',20,0,0],['pecas',3,20,0],['radioBr',1,-20,10],['gran',1,0,20]]){const [tx,ty]=freeTileNear(((e.x+dx)/TILE)|0,((e.y+dy)/TILE)|0,true);const bp={uid:'brd_'+id,tx,ty,x:tc(tx),y:tc(ty),id,q,kind:'item'};pickups.push(bp);pickOcc.add(idx(tx,ty));idropAdd(bp);}}},
    {wait:.6},{camFree:1},
    {say:'rafa',m:'s',t:'Ele... sumiu. Tem sangue no chão. Muito sangue.'},
    {say:'rafa',m:'t',think:true,t:'"T-11". Seja lá o que for, tá na galeria. E eu vou descer lá.',dur:2.2},
    {do:()=>{brandtLightsBack();}}],
    ()=>{G.banner={t:'Sargento Brandt fugiu',life:3};ach('brandt');});
}
function brandtLightsBack(){
  const F=G.flags, sb=shopB(); if(sb>=0){delete F['pw'+sb];const b=buildings[sb];if(typeof invalidateRect==='function')invalidateRect(b.x,b.y,b.w,b.h);}
  for(const id of ['shopN','shopS','shopW','shopE']){const g=gates.find(x=>x.id===id);if(g&&!g.open)openGate(g);}
  AU.unlock(); F.brFight=false;
  if(F.eduSh){later(1200,()=>{bark('edu','s','RICHARD! A porta subiu! Tu tá vivo?! Eu tô entrando!');});}
}
function drawBrandt(e){
  const va=(e.va??1)*(e.fade??1); if(va<=.02)return; const a=e.face, wk=e.anim*(e.moving?9:2);
  ctx.save(); ctx.globalAlpha=va; ctx.translate(e.x,e.y); ctx.rotate(a);
  ctx.fillStyle='rgba(0,0,0,.4)';ctx.beginPath();ctx.ellipse(1,3,14,10,0,0,6.283);ctx.fill();
  const l=Math.sin(wk)*4;ctx.fillStyle='#0e0f11';ctx.fillRect(-6+l,-8,9,5);ctx.fillRect(-6-l,3,9,5);
  ctx.fillStyle=e.flash>0?'#fff':'#1d2024';ctx.beginPath();ctx.ellipse(0,0,10,12,0,0,6.283);ctx.fill();
  ctx.fillStyle='#2c3035';ctx.fillRect(-6,-9,10,18);ctx.fillStyle='#3a3e44';for(const y of [-6,-1,4])ctx.fillRect(-4,y,6,3);
  // braços e arma
  const aim=e.mode==='aim'||e.mode==='burst';
  ctx.fillStyle='#1d2024';ctx.fillRect(4,aim?-3:4,12,4);ctx.fillRect(4,aim?1:-7,9,4);
  if(e.mode==='rush'||(G.qte&&G.qte.foe===e)){ctx.strokeStyle='#d8dcdc';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(14,-4);ctx.lineTo(24,-6);ctx.stroke();}
  else{ctx.fillStyle='#0a0b0c';ctx.fillRect(12,-2,13,4);ctx.fillRect(14,1,3,4);}
  ctx.fillStyle='#16181b';ctx.beginPath();ctx.arc(2,0,6.4,0,6.283);ctx.fill();ctx.fillStyle='#3e4248';ctx.fillRect(3,-5,3,10);
  ctx.fillStyle='rgba(220,40,30,.9)';ctx.fillRect(5,-1,1.6,2);
  ctx.restore();
}
function brandtGlow(){
  const e=enemies.find(x=>x.alive&&x.type==='brandt');
  for(const t of BR.tracers){ctx.strokeStyle=`rgba(255,220,150,${t.life/.07*.8})`;ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(t.x0,t.y0);ctx.lineTo(t.x1,t.y1);ctx.stroke();}
  if(!e||(e.fade??1)<.2)return;
  if(e.mode==='aim'||e.mode==='burst'){const a=e.aimA;let d=castRay(e.x,e.y,a,900,BULLET_BLOCK,false);{const px=P.x-e.x,py=P.y-e.y,t=px*Math.cos(a)+py*Math.sin(a);if(t>0&&t<d&&Math.abs(-px*Math.sin(a)+py*Math.cos(a))<P.r)d=t;}for(const s of BR.smokes)if(s.t>.6){const sx=s.x-e.x,sy=s.y-e.y,t=sx*Math.cos(a)+sy*Math.sin(a);if(t>0&&t<d&&Math.abs(-sx*Math.sin(a)+sy*Math.cos(a))<s.r*.6)d=Math.max(20,t-s.r*.4);}const k=e.mode==='aim'?clamp(e.mt/.62,0,1):1;
    ctx.strokeStyle=`rgba(255,40,30,${.35+.55*k})`;ctx.lineWidth=1+k;ctx.beginPath();ctx.moveTo(e.x+Math.cos(a)*14,e.y+Math.sin(a)*14);ctx.lineTo(e.x+Math.cos(a)*d,e.y+Math.sin(a)*d);ctx.stroke();
    ctx.fillStyle='rgba(255,60,40,.9)';ctx.beginPath();ctx.arc(e.x+Math.cos(a)*d,e.y+Math.sin(a)*d,2.6,0,6.283);ctx.fill();}
}
function brandtLights(){
  const e=enemies.find(x=>x.alive&&x.type==='brandt'); if(BR.flash&&BR.flash.t>0){punch(BR.flash.x,BR.flash.y,200,.85);BR.flash.t-=lastDt;}
  if(!e||(e.fade??1)<.3)return;
  punch(e.x,e.y,28,.25);
  if(e.light&&e.mode!=='vanish'){for(let i=1;i<=5;i++){const dd=i*42;const d=castRay(e.x,e.y,e.face,dd,LIGHT_BLOCK,false);if(d<dd-4)break;punch(e.x+Math.cos(e.face)*dd,e.y+Math.sin(e.face)*dd,20+i*11,.55);}}
}

// ---------- a luta no shopping ----------
function shopMassacre(){
  const r=shopRect(); if(!r)return;
  for(const e of enemies){if(!e.alive||e.t.boss||e.stalker||e.type==='manequim'||e.type==='brandt')continue;if(!inShopPx(e.x,e.y))continue;
    e.alive=false; if(e.uid)G.killed.add(e.uid);
    GORE.push({k:'corpse',x:e.x,y:e.y,rot:Math.random()*6.28,type:e.type,col:e.t.col,skin:e.t.skin,r:e.r});GORE.push({k:'blood',x:e.x+rr(-6,6),y:e.y+rr(-6,6),r:rr(16,26),rot:0,seed:Math.random()});}
  for(const ie of initEnemies){if(ie.type==='manequim')continue;if(inShopPx(ie.x,ie.y)&&!G.killed.has(ie.uid)){G.killed.add(ie.uid);GORE.push({k:'corpse',x:ie.x,y:ie.y,rot:Math.random()*6.28,type:ie.type,col:ETYPES[ie.type].col,skin:ETYPES[ie.type].skin,r:ETYPES[ie.type].r});GORE.push({k:'blood',x:ie.x,y:ie.y,r:20,rot:0,seed:.5});}}
  // cartuchos no chão e mais corpos de quem tentou se esconder ali
  for(let i=0;i<26;i++){const x=rr(r.x0+60,r.x1-60),y=rr(r.y0+60,r.y1-320),k=idx((x/TILE)|0,(y/TILE)|0);if(SOLID[map[k]])continue;
    if(i<12)GORE.push({k:'corpse',x,y,rot:Math.random()*6.28,type:'zumbi',col:pick2(['#4f5a46','#5b3d33','#3d4a5a','#6a5a4a']),skin:'#8a9474',r:12});
    GORE.push({k:'blood',x:x+rr(-10,10),y:y+rr(-10,10),r:rr(12,24),rot:0,seed:Math.random()});}
}
function shopCh1(){const F=G.flags;return F.needDina&&!F.sewOut&&!F.bondRide&&!F.bloqWeak&&!F.bloqueio&&!F.laranjGone;}
STORY.shopCh1Enter=function(){
  const F=G.flags; if(F.shCh1)return; F.shCh1=true;
  if(F.eduFollow){F.eduFollow=false;F.eduSh=true;dropComp('edu');}
  playCut([{wait:.3},{sfx:'creak',v:.6},
    {say:'rafa',m:'s',t:'...Cadê eles? O shopping tava lotado dessas coisas.'},
    ...(F.eduSh?[{say:'edu',m:'s',t:'Richard. Olha o chão. Todos com um tiro na cabeça. Um só.'},{say:'edu',m:'t',t:'Eu fico aqui na porta vigiando a rua. Se vier alguma coisa eu grito. Vai rápido.'}]
      :[{say:'rafa',m:'s',think:true,t:'Todos com um tiro na cabeça. Um só. Quem fez isso não errou nenhum.',dur:2}]),
    {say:'rafa',m:'n',think:true,t:'A chave de manobra. O Tião disse que fica na sala da segurança, na ala leste.',dur:2}]);
};
STORY.brandtStart=function(){
  const F=G.flags; if(F.brFight||F.brandtDone)return; F.brFight=true;
  const sb=shopB(); const r=shopRect();
  const sp=brandtCover()||{x:(r.x0+r.x1)/2,y:r.y0+600};
  playCut([{sfx:'thud',v:1},{do:()=>{if(sb>=0){F['pw'+sb]=false;const b=buildings[sb];if(typeof invalidateRect==='function')invalidateRect(b.x,b.y,b.w,b.h);}G.blackout=1.2;}},
    {fx:'shake',v:6},{wait:.6},
    {do:()=>{for(const id of ['shopN','shopS','shopW','shopE']){const g=gates.find(x=>x.id===id);if(g&&g.open)closeGate(g);}AU.knock();AU.thud(1);}},{fx:'slam'},
    {say:'rafa',m:'s',t:'A luz... as portas! As portas desceram!'},
    ...(F.eduSh?[{say:'edu',m:'s',t:'RICHARD! A PORTA DESCEU SOZINHA! Eu não consigo levantar!',radio:true}]:[]),
    {sfx:'static',v:1},
    {say:'brandt',m:'n',t:BR_TAUNT.start[0],radio:true},
    {say:'brandt',m:'a',t:BR_TAUNT.start[1],radio:true},
    {do:()=>{spawnBrandt(sp.x,sp.y);}},
    {say:'rafa',m:'s',think:true,t:'Ele tá aqui dentro. No escuro. Com a lanterna acesa ele me acha... mas eu também vejo a dele.',dur:2.6}],
    ()=>{G.banner={t:'Sargento Brandt',life:3};toast('Esconda-se atrás das paredes. Quando ele recarregar, é a sua vez.');});
};
(function(){
  const uo=STORY.onPickup; STORY.onPickup=function(id){if(uo)uo(id);if(id==='manobra'&&shopCh1()&&!G.flags.brFight&&!G.flags.brandtDone)later(700,()=>STORY.brandtStart());};
})();

// ---------- a missão nova no capítulo 1 ----------
(function(){
  const ea=STORY.eduArrive;
  STORY.eduArrive=function(){
    const s=ea(); const i=s.findIndex(x=>x.say==='tiao'&&/bondinho/.test(x.t||''));
    if(i<0)return s;
    const j=s.findIndex((x,k)=>k>i&&x.say==='edu'&&/Bondinho/.test(x.t||''));
    const repl=[
      {say:'tiao',m:'t',t:'O Ivo, lá das Laranjeiras, pesca com dinamite. Safado. A Interpraias desabou ontem... e o bondinho morreu: o Exército cortou a energia da estação faz uma hora.'},
      {say:'rafa',m:'s',t:'Então não tem como chegar lá.'},
      {say:'tiao',m:'n',t:'Tem. A galeria pluvial grande. Passa por baixo do rio e sai na trilha da Mata Atlântica. Os bombeiros usavam pra resgate.'},
      {say:'tiao',m:'n',t:'A entrada de serviço é no almoxarifado do Shopping Atlântico. A tampa tem trava: precisa da chave de manobra. A segurança do shopping guardava uma.'},
      {say:'edu',m:'s',t:'Esgoto. De noite. Com essas coisas soltas. Perfeito.'},
    ];
    s.splice(i,(j>i?j-i+1:2),...repl);
    return s;
  };
  const ob=objective;
  objective=function(){
    const F=G.flags, has=id=>invCount(id)>0;
    if(F.brFight&&!F.brandtDone)return {t:'Sobreviva ao Sargento Brandt. Quando ele recarregar, ataque.',at:null};
    if(shopCh1()&&invCount('dinamite')<=0&&!F.dinaPlanted){
      if(inSew())return sewObjective();
      if(!F.sewIn){
        if(!has('manobra'))return {t:F.shCh1?'Pegue a chave de manobra na sala da segurança do shopping (ala leste)':'Vá até o Shopping Atlântico: a chave da galeria pluvial fica na sala da segurança',at:F.shCh1?LM.seguranca:LM.grade};
        return {t:'Abra a tampa da galeria no almoxarifado do shopping (ala de serviço, sul)',at:LM.sewHatch};
      }
      return {t:'Volte para a galeria pelo almoxarifado do shopping',at:LM.sewHatch};
    }
    return ob();
  };
})();
function sewObjective(){
  const F=G.flags, has=id=>invCount(id)>0;
  if(G.ev.chase)return {t:'CORRE! Até o poço de saída, no fim do sifão!',at:LM.sewOut};
  if(!F.sewPump){const n=['fus10','fus20','fus30'].filter(has).length;
    if(n<3)return {t:`O poço está inundado. Ache os fusíveis da bomba (${n}/3) e religue a estação de bombeamento`,at:n===0?{x:tc(38),y:tc(SEWY0+15)}:LM.quadroBomba};
    return {t:'Encaixe os três fusíveis no quadro da estação de bombeamento',at:LM.quadroBomba};}
  if(!F.sewDrain)return {t:'Desça pelo poço até o coletor-tronco e abra o sifão na sala de controle das comportas',at:LM.mapaDren};
  return {t:'Atravesse o sifão debaixo do rio até o poço de saída',at:LM.sewOut};
}
// a estação da Barra Sul sem energia durante a missão
(function(){const b=STORY.bondinho;STORY.bondinho=function(o){const F=G.flags;if(shopCh1()&&!F.bondRide)return toast('Painel: SEM ENERGIA. Um papel colado: "LINHA DESLIGADA PELO EXÉRCITO — 22H10".');return b(o);};})();

// ---------- tampas, quadro, válvulas ----------
Object.assign(INT_LABEL,{tampaGaleria:'Tampa da galeria pluvial',escadaSobe:'Escada para o shopping',quadroBomba:'Quadro da bomba',mapaDren:'Mapa da drenagem',valvula:'Válvula da comporta',tampaSaida:'Tampa do poço de saída'});
(function(){
  const vi=v12Interact;
  v12Interact=function(o){
    const F=G.flags;
    switch(o.type){
      case 'tampaGaleria':return sewHatchUse();
      case 'escadaSobe':return sewClimbBack();
      case 'quadroBomba':return UI.fuses();
      case 'mapaDren':return UI.dren();
      case 'valvula':return sewValve(o.v);
      case 'tampaSaida':return sewLid();
    }
    return vi(o);
  };
  const ug=useGate; useGate=function(g){if(g&&g.sew){toast(g.msg);AU.locked();return;}return ug(g);};
})();
function sewHatchUse(){
  const F=G.flags;
  if(!F.needDina&&!F.sewIn)return toast('Uma tampa de ferro redonda: "GALERIA PLUVIAL — ACESSO RESTRITO". Trancada.');
  if(F.sewOut)return toast('A galeria leva às Laranjeiras. Não tem por que voltar lá.');
  if(!F.sewIn&&invCount('manobra')<=0)return toast('A tampa tem uma trava de registro. Precisa de uma chave de manobra.');
  if(F.brFight&&!F.brandtDone)return toast('Não dá pra abrir com ele atirando em mim.');
  if(!F.sewIn){
    startStruggle({label:'Girando a chave de manobra',need:100,pump:16,hold:24,noise:220,sfx:'creak',x:P.x,y:P.y,onDone:()=>{F.sewIn=true;AU.unlock();sewDescend(true);}});return;}
  sewDescend(false);
}
function sewDescend(first){
  const F=G.flags;
  playCut([{fx:'blackout',v:1.2},{sfx:'creak',v:.8},
    {do:()=>{P.x=LM.sewIn.x;P.y=LM.sewIn.y;for(const c of (G.comps||[])){c.x=P.x+20;c.y=P.y+10;}snapCamera();flowTile=-1;}},{wait:.8},
    ...(first?[{say:'rafa',m:'s',t:'Que cheiro... é carne. Carne velha e água parada.'},
      ...(F.eduFollow?[{say:'edu',m:'s',t:'Mano, eu tô com água até a canela. E a água tá quente. Por que a água tá quente?'}]:[]),
      {say:'rafa',m:'t',think:true,t:'Lanterna baixa. Passo leve. Aqui embaixo o barulho anda longe.',dur:2}]:[])],
    ()=>{});
}
function sewClimbBack(){
  if(G.ev.chase)return toast('NÃO DÁ TEMPO!');
  playCut([{fx:'blackout',v:1},{do:()=>{const h=LM.sewHatch;const [x,y]=freeTileNear((h.x/TILE)|0,((h.y/TILE)|0)+1,true);P.x=tc(x);P.y=tc(y);for(const c of (G.comps||[])){c.x=P.x+16;c.y=P.y;}snapCamera();flowTile=-1;}},{wait:.5}]);
}
// os três fusíveis: A (motor) · B (painel) · C (bomba). Certo: A=20, B=30, C=10
UI.fuses=function(){
  const F=G.flags; if(F.sewPump)return toast('A bomba está ligada. O poço está secando.');
  const slots=F.fuseSlots||(F.fuseSlots=[null,null,null]); const names=['A · motor','B · painel','C · bomba'];
  const own=['fus10','fus20','fus30'].filter(id=>invCount(id)>0||slots.includes(id));
  this.open(`<div class="sheet narrow"><p class="kick">Estação elevatória EE-04</p><h2>Quadro da bomba</h2>
    <p class="hint">Escolha um fusível e toque num borne. Fusível errado queima na hora.</p>
    <div class="row">${['fus10','fus20','fus30'].map(id=>`<button class="btn${this.fsel===id?' primary':''}" data-a="fsel" data-k="${id}" ${invCount(id)>0?'':'disabled'}>${ITEMS[id].s}</button>`).join('')}</div>
    <div class="row">${slots.map((s,i)=>`<button class="btn${s?' primary':''}" data-a="fslot" data-k="${i}">${names[i]}<br><small>${s?ITEMS[s].s:'vazio'}</small></button>`).join('')}</div>
    <div class="row"><button class="btn" data-a="fgo" ${slots.every(Boolean)?'':'disabled'}>Ligar a chave geral</button><button class="btn ghost" data-a="close">Sair</button></div>
    <p class="hint">Você tem ${own.length} de 3 fusíveis.</p></div>`,'','fuses');
};
UI.dren=function(){
  const F=G.flags, st=sewComp();
  const row=(n,o)=>`<div class="opt"><h3>${n}</h3><p class="hint" style="color:${o?'#7ac08a':'#c8604a'}">${o?'ABERTA':'FECHADA'}</p></div>`;
  this.open(`<div class="sheet narrow"><p class="kick">Sala de controle</p><h2>Mapa da drenagem</h2>
    <p class="hint">Um painel de acrílico com o desenho das galerias. Lâmpadas pequenas mostram o estado de cada comporta.</p>
    <div class="opts">${row('Comporta 1 · saída leste',st&1)}${row('Comporta 2 · ninho (oeste)',st&2)}${row('Comporta 3 · nicho de manutenção',st&4)}${row('Dreno do sifão',st&8)}</div>
    <p class="hint">Embaixo, alguém riscou com chave: "1 E DRENO ABERTOS · O MEIO FECHADO".</p>
    <div class="row"><button class="btn primary" data-a="close" data-focus>Fechar</button></div></div>`,'','dren');
};
(function(){
  const act=UI.act.bind(UI);
  UI.act=function(a,ds){
    const F=G.flags;
    switch(a){
      case 'fsel':this.fsel=ds.k;return this.fuses();
      case 'fslot':{const i=+ds.k,sl=F.fuseSlots;if(sl[i]){invAdd(sl[i],1);sl[i]=null;AU.click();return this.fuses();}if(!this.fsel||invCount(this.fsel)<=0)return this.fuses();invRemove(this.fsel,1);sl[i]=this.fsel;this.fsel=null;AU.click();return this.fuses();}
      case 'fgo':{const sl=F.fuseSlots;const ok=sl[0]==='fus20'&&sl[1]==='fus30'&&sl[2]==='fus10';
        if(ok){this.close();sewPumpOn();return;}
        this.close();AU.thud(1);AU.static(1,.4);G.shake+=6;for(let i=0;i<18;i++)parts.push({k:'spark',x:LM.quadroBomba.x,y:LM.quadroBomba.y,vx:rr(-200,200),vy:rr(-200,200),life:.3,max:.3,s:2,c:'#ffd27a'});
        hurtPlayer(6,LM.quadroBomba.x,LM.quadroBomba.y);alertNoise(P.x,P.y,500);for(let i=0;i<3;i++)if(sl[i]){invAdd(sl[i],1);sl[i]=null;}
        toast('ESTOUROU! Os fusíveis saltaram do quadro. A planilha da manutenção deve dizer a ordem.');return;}
    }
    return act(a,ds);
  };
})();
function sewPumpOn(){
  const F=G.flags; F.sewPump=true; for(const l of lights)if(l.sewPump)l.off=false;
  AU.thud(1);AU.creak(1);G.shake+=8;AU.alarm();alertNoise(P.x,P.y,900);
  bark(F.eduFollow?'edu':'rafa','s',F.eduFollow?'LIGOU! ...e acordou tudo que tava dormindo aqui embaixo. Ótimo.':'Ligou. A bomba tá puxando... e o barulho chegou longe.');
  later(2500,()=>{sewFlood(false,null);toast('O poço secou. Dá pra descer até o coletor-tronco.');});
  for(const e of enemies)if(e.alive&&e.type==='cego'&&hyp(e.x-P.x,e.y-P.y)<900){if(e.state==='dorm')riseEnemy(e);e.heard=4;e.nx=P.x;e.ny=P.y;e.state='chase';}
}
function sewComp(){const F=G.flags;if(F.sewC==null)F.sewC=0;return F.sewC;}
function sewApplyGates(){
  const st=sewComp();
  for(const [id,bit] of [['comp1',1],['comp2',2],['comp3',4]]){const g=gates.find(x=>x.id===id);if(!g)continue;if(st&bit){if(!g.open)openGate(g);}else if(g.open)closeGate(g);}
}
function sewValve(v){
  const F=G.flags; if(F.sewDrain)return toast('O sifão já esvaziou.');
  if(!F.sewPump)return toast('A válvula não gira. Sem pressão: a bomba da estação precisa estar ligada.');
  if(G.ev.valve)return;
  G.ev.valve={t:1.6,v};
  startStruggle({label:'Girando a válvula '+v,need:100,pump:22,hold:40,noise:640,sfx:'creak',x:P.x,y:P.y,onDone:()=>{
    const mask={1:1|2,2:2|4,3:4|8}[v]; F.sewC=sewComp()^mask; sewApplyGates(); AU.thud(1);AU.creak(1);G.shake+=6;
    const st=F.sewC; const words=[];for(const [b,n] of [[1,'comporta 1'],[2,'comporta 2'],[4,'comporta 3'],[8,'dreno']])if(mask&b)words.push(n+(st&b?' abriu':' fechou'));
    toast(words.join(' · ')); G.ev.valve=null;
    if(mask&2&&st&2)later(600,()=>{AU.roar();G.shake+=8;bark('rafa','s','A comporta do ninho abriu... tem alguma coisa se mexendo lá dentro. Fecha. FECHA.');});
    for(const e of enemies)if(e.alive&&e.type==='cego'&&hyp(e.x-P.x,e.y-P.y)<1000){e.heard=4;e.nx=P.x+rr(-40,40);e.ny=P.y+rr(-40,40);e.state='chase';}
    if((st&1)&&(st&8)&&!(st&2)&&!(st&4))sewDrained();
    else if(st&8&&!(st&1))toast('O dreno abriu, mas a água não tem pra onde ir com a comporta 1 fechada.');}});
  setTimeout(()=>{if(G.ev)G.ev.valve=null;},4000);
}
function sewDrained(){
  const F=G.flags; F.sewDrain=true; sewFlood(null,false);
  AU.wave(1);AU.splash(1);G.shake+=10;
  playCut([{fx:'shake',v:10},{sfx:'creak',v:1},{wait:.4},
    {say:'rafa',m:'s',t:'A água tá descendo... o sifão tá secando!'},
    {wait:.5},{sfx:'roar',v:1},{fx:'shake',v:16},{fx:'slow',v:.5},
    {do:()=>{coletorRelease();}},{wait:.3},
    {cam:'coletor',t:1.2},{fx:'zoom',v:1.35},
    {say:F.eduFollow?'edu':'rafa',m:'s',t:F.eduFollow?'QUE PORRA É ESSA?! ELE SAIU DE DENTRO DO CANAL! RICHARD, CORRE!':'Saiu de dentro do canal. Isso... isso é o T-11.'},
    {camFree:1},{fx:'zoom',v:1}],
    ()=>{G.ev.chase={t:0};AU.sting();toast('CORRA até o poço de saída! Ele não morre.');});
}
// ---------- o T-11 ----------
function coletorRelease(){
  if(enemies.some(e=>e.alive&&e.type==='coletor'))return;
  const [x,y]=freeTileNear(108,SEWY0+36,false); const e=makeEnemy('coletor',tc(x),tc(y),'coletor'); e.state='chase'; e.mode='chase'; e.cut=false; e.va=1; e.hunt=true; e.stalker=false;
  enemies.push(e); CUT.actors.coletor=e; for(let i=0;i<30;i++)parts.push({k:'acid',x:e.x,y:e.y,vx:rr(-200,200),vy:rr(-200,200),life:.7,max:.7,s:rr(2,4),c:'#9ab8c8'});
}
function updColetor(e,dt){
  e.anim+=dt; e.flash=Math.max(0,e.flash-dt); e.atk-=dt;
  if(!G.ev.chase&&!CUT.on){e.fade=Math.max(0,(e.fade??1)-dt*.4);if(e.fade<=0)e.alive=false;return;}
  if(CUT.on)return;
  if(G.qte&&G.qte.foe===e)return;
  if(e.stun>0){e.stun-=dt;e.vx*=Math.pow(.05,dt);e.vy*=Math.pow(.05,dt);move(e,e.vx*dt,e.vy*dt,true);return;}
  const dx=P.x-e.x,dy=P.y-e.y,d=hyp(dx,dy)||1, a=Math.atan2(dy,dx);
  let spd=e.t.spd*(d>520?1.35:d<120?.9:1)*(G.diff==='facil'?.86:G.diff==='dificil'?1.08:1);
  const f=(d>60&&!los(e.x,e.y,P.x,P.y))?flowDir(e,flow):null; let tx=dx/d,ty=dy/d; if(f){const l=hyp(f[0],f[1])||1;tx=f[0]/l;ty=f[1]/l;}
  move(e,tx*spd*dt,ty*spd*dt,true); e.face+=angDiff(e.face,Math.atan2(ty,tx))*Math.min(1,dt*8); e.moving=true;
  e.stepT=(e.stepT||0)-dt; if(e.stepT<=0){e.stepT=.32;AU.thud(clamp(1-d/700,.1,.6));G.shake+=clamp(1-d/500,0,1)*2.2;}
  if(Math.random()<dt*.5)AU.roar();
  if(d<e.r+P.r+6&&e.atk<=0&&!P.hidden){
    e.atk=1.6;
    qteStart({label:'ELE TE PEGOU! CHUTA!',n:2,foe:e,kind:'coletor',fast:.85,
      onOk:()=>{e.stun=1.8;e.vx=-Math.cos(a)*300;e.vy=-Math.sin(a)*300;AU.thud(1);G.shake+=10;floaters.push({x:P.x,y:P.y-26,t:'SE SOLTOU',life:.9});P.st=Math.min(100,P.st+40);},
      onFail:()=>{P.inv=0;hurtPlayer(e.t.dmg,e.x,e.y);move(P,Math.cos(a)*40,Math.sin(a)*40,false);e.stun=.9;e.vx=-Math.cos(a)*120;e.vy=-Math.sin(a)*120;}});
  }
}
function drawColetor(e){
  const va=Math.max(e.va??1,.35)*(e.fade??1); if(va<=.02)return; const a=e.face, wk=e.anim*9;
  ctx.save();ctx.globalAlpha=va;ctx.translate(e.x,e.y);ctx.rotate(a);
  ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(2,4,30,20,0,0,6.283);ctx.fill();
  // quatro membros compridos demais
  ctx.strokeStyle='#b8ae9e';ctx.lineWidth=4.5;ctx.lineCap='round';
  for(const [s,ph] of [[-1,0],[1,Math.PI],[-1,Math.PI],[1,0]]){const l=Math.sin(wk+ph)*10, fr=ph===0?1:-1;
    ctx.beginPath();ctx.moveTo(fr*6,s*8);ctx.quadraticCurveTo(fr*14+l,s*30,fr*26+l*1.4,s*22);ctx.stroke();
    ctx.strokeStyle='#5a3a30';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(fr*26+l*1.4,s*22);ctx.lineTo(fr*33+l*1.4,s*20);ctx.stroke();ctx.strokeStyle='#b8ae9e';ctx.lineWidth=4.5;}
  ctx.fillStyle=e.flash>0?'#fff':e.t.col;ctx.beginPath();ctx.ellipse(0,0,20,11,0,0,6.283);ctx.fill();
  ctx.strokeStyle='rgba(120,60,50,.5)';ctx.lineWidth=1;for(let i=-14;i<=12;i+=5){ctx.beginPath();ctx.moveTo(i,-9);ctx.lineTo(i+2,9);ctx.stroke();}
  // cabeça: uma boca vertical que abre
  const m=2+Math.abs(Math.sin(e.anim*5))*4;ctx.fillStyle=e.t.skin;ctx.beginPath();ctx.ellipse(22,0,9,7.5,0,0,6.283);ctx.fill();
  ctx.fillStyle='#3a0c0a';ctx.beginPath();ctx.ellipse(26,0,4,m,0,0,6.283);ctx.fill();ctx.fillStyle='#e8e0cc';for(const y of [-m+1,m-1])for(const x of [24,26,28])ctx.fillRect(x,y-.6,1,1.2);
  ctx.restore();
}
function drawCego(e){ // por cima do desenho normal: rosto liso, sem olhos
  if((e.va??1)<=.05||e.state==='dorm')return; ctx.save();ctx.globalAlpha=e.va??1;ctx.translate(e.x,e.y);ctx.rotate(e.face);
  ctx.fillStyle='#e4dccb';ctx.beginPath();ctx.ellipse(8,0,6,5.4,0,0,6.283);ctx.fill();ctx.fillStyle='#4a1a14';ctx.fillRect(12,-1.2,2.5,2.4);
  if(e.state==='chase'&&e.heard>0){ctx.strokeStyle='rgba(255,90,70,.22)';ctx.lineWidth=1;ctx.beginPath();ctx.arc(0,0,20+Math.sin(renderT*8)*2,0,6.283);ctx.stroke();}
  ctx.restore();
}
// a tampa do poço de saída: emperrada
function sewLid(){
  const F=G.flags; if(F.sewOut)return;
  if(!F.sewDrain)return toast('Uma escada sobe até uma tampa de ferro. Daqui não dá pra chegar: o sifão está cheio.');
  startStruggle({label:'Empurrando a tampa',need:100,pump:14,hold:26,noise:300,sfx:'creak',x:P.x,y:P.y,onDone:()=>sewExit()});
}
function sewExit(){
  const F=G.flags; F.sewOut=true; G.ev.chase=null; const c=enemies.find(e=>e.alive&&e.type==='coletor'); if(c)c.alive=false;
  playCut([{fx:'blackout',v:1.4},{sfx:'thud',v:1},{sfx:'roar',v:1},
    {do:()=>{const pt=LM.bondMA;const [x,y]=freeTileNear((pt.x/TILE)|0,((pt.y/TILE)|0)+5,true);P.x=tc(x);P.y=tc(y);for(const cc of (G.comps||[])){cc.x=P.x+20;cc.y=P.y;}snapCamera();flowTile=-1;F.bondRide=1;}},
    {wait:1},{fx:'shake',v:8},
    {say:'rafa',m:'s',t:'...Fechei. Fechei a tampa. Ele bateu por baixo três vezes e parou.'},
    ...(F.eduFollow?[{say:'edu',m:'s',t:'Eu nunca mais desço num bueiro na minha vida. Nunca mais, Richard.'},{say:'edu',m:'n',t:'Ali embaixo é a trilha. A praia das Laranjeiras.'}]:[{say:'rafa',m:'n',think:true,t:'A trilha da Mata Atlântica. Daqui até a praia é descida.',dur:2}])],
    ()=>{G.banner={t:'Praia das Laranjeiras',life:3.2};ach('galeria');});
}
// tampa do almoxarifado (no shopping) e a escada de volta (na galeria)
(function(){
  const g=genV12;
  genV12=function(){
    g(); genSewer();
    npcs.push({id:'eduSh',name:'Edu',look:'edu',x:tc(125.5),y:tc(273.6),col:'#18191c',hair:'#2a1c12',skin:'#e2b79a',ang:Math.PI/2,cond:()=>!!(G.flags&&G.flags.eduSh)});
    const sb=buildings.find(b=>b.kind==='shop');
    if(sb){const X=v=>sb.x+v,Yy=v=>sb.y+v;let spot=null;for(const [a,b] of [[3,47],[4,44],[6,47],[9,44],[10,47],[13,47]]){const k=idx(X(a),Yy(b));if(!SOLID[map[k]]&&!pickOcc.has(k)){spot=[X(a),Yy(b)];break;}}
      if(!spot)spot=freeTileNear(X(7),Yy(45),false);
      const it=addInteract(spot[0],spot[1],'tampaGaleria',38); LM.sewHatch={x:tc(spot[0]),y:tc(spot[1])};
      // a chave de manobra, pendurada na sala da segurança
      addPick(X(46),Yy(19),'manobra',1);}
    addInteract(10,SEWY0+2,'escadaSobe',38);
    // Pescador: sai de Cabeçudas e vai pra margem do rio em Itajaí
    {const [x,y]=freeTileNear(172,60,false);LM.cabecudas={x:tc(x),y:tc(y)};}
    // Brava mais tranquila: sem cães, esfolados e a guarita do condomínio
    for(let i=initEnemies.length-1;i>=0;i--){const ie=initEnemies[i],ty=(ie.y/TILE)|0;
      if(ty>=82&&ty<=158&&(ie.type==='cao'||ie.type==='esfol'||ie.type==='corr'||ie.uid==='segBr'))initEnemies.splice(i,1);}
    sewReach(); sewFlood(true,true);
  };
})();
(function(){const sn=STORY.npc;STORY.npc=function(n){if(n&&n.id==='eduSh')return bark('edu','s',G.flags.brFight?'EU NÃO CONSIGO LEVANTAR ESSA PORTA, RICHARD!':pick2(['Vai lá, eu seguro a porta.','Tá muito quieto aí dentro, mano.','Pega a chave e volta. Rápido.']));return sn(n);};})();
// a galeria é uma "região" própria (fica fora da geração do mundo, pra não mudar a cidade)
const SEW_D={name:'Galeria Pluvial',short:'Galeria',mx:100,y0:H,y1:H+81,cap:0,count:0,spawn:{cego:1},loot:{pilha:1}};
(function(){const gw=genWorld;genWorld=function(){const i=DISTRICTS.indexOf(SEW_D);if(i>=0)DISTRICTS.splice(i,1);try{gw();}finally{DISTRICTS.push(SEW_D);}};})();
DISTRICTS.push(SEW_D);
DISTRICTS[3].spawn={zumbi:7,rast:1}; DISTRICTS[3].cap=10;
DISTRICTS[4].spawn={zumbi:6,corr:2,cao:1}; DISTRICTS[4].cap=12;
DISTRICTS[6].spawn.esfol=.35; DISTRICTS[5].spawn.esfol=.3; DISTRICTS[6].spawn.cao=(DISTRICTS[6].spawn.cao||0)+.6;

// ---------- desenho das coisas da galeria ----------
function drawSewerDeco(){
  if(!LM.sewIn)return; const Y=SEWY0;
  if(!inV(tc(100),tc(Y+20),2600))return;
  // escadas
  for(const L of [LM.sewLadder,{x:tc(183),y:tc(Y+6)}]){if(!inV(L.x,L.y,40))continue;ctx.fillStyle='#2a2c2e';ctx.fillRect(L.x-14,L.y-16,28,32);ctx.strokeStyle='#6a6e72';ctx.lineWidth=2.5;
    ctx.beginPath();ctx.moveTo(L.x-9,L.y-16);ctx.lineTo(L.x-9,L.y+16);ctx.moveTo(L.x+9,L.y-16);ctx.lineTo(L.x+9,L.y+16);for(let y=-12;y<=12;y+=6){ctx.moveTo(L.x-9,L.y+y);ctx.lineTo(L.x+9,L.y+y);}ctx.stroke();}
  // a bomba
  if(inV(tc(65),tc(Y+15),80)){ctx.fillStyle=G.flags.sewPump?'#3a5a4a':'#3a3e42';ctx.beginPath();ctx.arc(tc(64.5),tc(Y+14.5),26,0,6.283);ctx.fill();ctx.strokeStyle='#6a6e72';ctx.lineWidth=3;ctx.stroke();
    if(G.flags.sewPump){ctx.save();ctx.translate(tc(64.5),tc(Y+14.5));ctx.rotate(renderT*6);ctx.fillStyle='#8a9a8a';for(let i=0;i<4;i++){ctx.rotate(1.57);ctx.fillRect(2,-3,18,6);}ctx.restore();}}
  // limo e raízes nas paredes
}
function drawShopHatch(){
  const h=LM.sewHatch; if(!h||!inV(h.x,h.y,40))return; const o=G.flags.sewIn;
  ctx.fillStyle='#1a1c1e';ctx.beginPath();ctx.arc(h.x,h.y,13,0,6.283);ctx.fill();
  if(!o){ctx.fillStyle='#4a4e52';ctx.beginPath();ctx.arc(h.x,h.y,12,0,6.283);ctx.fill();ctx.strokeStyle='#2a2c2e';ctx.lineWidth=1.5;for(let i=-8;i<=8;i+=4){ctx.beginPath();ctx.moveTo(h.x-9,h.y+i);ctx.lineTo(h.x+9,h.y+i);ctx.stroke();}}
  else{ctx.fillStyle='#4a4e52';ctx.beginPath();ctx.ellipse(h.x+16,h.y+4,12,5,.3,0,6.283);ctx.fill();}
}

// ---------- a perseguição: adrenalina ----------
function chaseTick(dt){
  const c=G.ev.chase; if(!c)return; c.t+=dt;
  if(P.running)P.st=Math.min(100,P.st+10*dt);   // a adrenalina segura o fôlego
  G.fear=Math.max(G.fear||0,.75);
  if(!enemies.some(e=>e.alive&&e.type==='coletor')&&!G.flags.sewOut)coletorRelease();
}

// ===================== A MALETA =====================
// Grade estilo maleta: cada coisa ocupa espaço, inclusive as armas. Itens-chave não ocupam.
const MSZ={m9:[2,1],cart:[2,1],m357:[1,1],comb:[2,2],g40:[2,1],virote:[2,1],r762:[2,1],pilha:[1,1],gran:[1,2],garrafa:[1,2],rojao:[1,2],sinal:[1,2],calmante:[1,1],
  ervaV:[1,2],ervaR:[1,2],misVV:[1,2],misVR:[1,2],spray:[1,2],polv:[1,1],polvF:[1,1],pecas:[1,1],detector:[2,1],silenciador:[2,1]};
const WSZ={1:[3,2],2:[6,2],3:[4,2],4:[3,2],5:[5,2],6:[5,2],7:[5,2],9:[6,2]};
function isz(id){const it=ITEMS[id];if(!it||it.k==='key')return null;return MSZ[id]||[1,1];}
function maletaItems(extra){
  const out=[];
  for(let i=1;i<WEAPONS.length;i++)if(i!==8&&P.owned[i]&&WSZ[i])out.push({k:'w'+i,w:WSZ[i][0],h:WSZ[i][1]});
  G.inv.forEach((s,i)=>{if(!s)return;const z=isz(s.id);if(z)out.push({k:'i'+i,w:z[0],h:z[1]});});
  if(extra)out.push(...extra);
  return out;
}
function packMaleta(items){
  const mw=G.mw||8, mh=G.mh||6, g=new Uint8Array(mw*mh), res={};
  const list=items.slice().sort((a,b)=>(b.w*b.h-a.w*a.h)||(b.w-a.w)||(a.k<b.k?-1:1));
  const fits=(x,y,w,h)=>{if(x+w>mw||y+h>mh)return false;for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(g[j*mw+i])return false;return true;};
  for(const it of list){let placed=false;
    for(const [w,h] of (it.w===it.h?[[it.w,it.h]]:[[it.w,it.h],[it.h,it.w]])){
      for(let y=0;y<mh&&!placed;y++)for(let x=0;x<mw&&!placed;x++)if(fits(x,y,w,h)){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)g[j*mw+i]=1;res[it.k]={x,y,w,h};placed=true;}
      if(placed)break;}
    if(!placed)return null;}
  return res;
}
function maletaFits(extra){return !!packMaleta(maletaItems(extra));}
function maletaUsed(){let n=0;for(const it of maletaItems())n+=it.w*it.h;return n;}
(function(){
  invAdd=function(id,q){
    const st=ITEMS[id].st;
    for(const s of G.inv){if(q<=0)break;if(s&&s.id===id&&s.q<st){const a=Math.min(st-s.q,q);s.q+=a;q-=a;}}
    const z=isz(id);
    while(q>0){
      let i=G.inv.indexOf(null); if(i<0){G.inv.push(null);i=G.inv.length-1;G.slots=G.inv.length;}
      if(z&&!maletaFits([{k:'new',w:z[0],h:z[1]}]))break;
      const a=Math.min(st,q); G.inv[i]={id,q:a}; q-=a;
    }
    return q;
  };
  invFree=function(){return maletaFits([{k:'n',w:1,h:1}])?1:0;};
  const tp=takePickup;
  takePickup=function(p){
    if(p.kind==='weapon'&&p.id!==0&&p.id!==8&&!P.owned[p.id]&&WSZ[p.id]&&!maletaFits([{k:'nw',w:WSZ[p.id][0],h:WSZ[p.id][1]}])){
      toast(`${WEAPONS[p.id].n} não cabe na maleta. Largue ou guarde algo no baú de um abrigo.`);AU.locked();return;}
    if(p.kind==='bag'){G.mw=Math.min(11,(G.mw||8)+1);AU.pickup();toast('Bolsa de couro: a maleta ganhou mais espaço.');G.taken.add(p.uid);pickups=pickups.filter(x=>x!==p);pickOcc.delete(idx(p.tx,p.ty));return;}
    return tp(p);
  };
  // sem o limite de 3 armas: agora quem manda é o espaço da maleta
  wpnLimit=function(p){const F=G.flags;if(p.uid&&String(p.uid).startsWith('wd'))F.wdrops=(F.wdrops||[]).filter(w=>w.uid!==p.uid);};
  const ser=serialize; serialize=function(){const s=ser();s.mw=G.mw||8;s.mh=G.mh||6;s.v=3;return s;};
  const ls=loadState; loadState=function(s){
    ls(s);
    const old=(s.v||2)<3; G.mw=s.mw||Math.min(11,8+Math.max(0,((s.slots||8)-8)>>1)); G.mh=s.mh||6;
    const inv=G.inv.filter(Boolean); G.inv=new Array(64).fill(null); G.slots=64;
    // o que não couber vai pro baú
    for(const it of inv){const left=invAdd(it.id,it.q);if(left>0)boxAdd(it.id,left);}
    if(old){for(let i=1;i<WEAPONS.length;i++){}}
    sewReapply();
  };
  const rs=resetState; resetState=function(d){rs(d);G.mw=8;G.mh=6;G.inv=new Array(64).fill(null);G.slots=64;G.qte=null;BR.smokes=[];BR.tracers=[];};
})();
// cat → mais uma fileira; a bolsinha da loja de esportes → mais uma coluna
(function(){const o=STORY.onPickup;})();
function boxWeaponAdd(i){G.box.push({id:'_w',w:i,q:P.mags[i]||0});P.owned[i]=false;P.mags[i]=0;if(P.w===i)P.w=P.owned[0]?0:8;}
UI.itensBody=function(){
  const r=P.hp/P.max, st=r>=.6?['Bem','ok']:r>=.3?['Cuidado','warn']:['Perigo','bad'];
  const pack=packMaleta(maletaItems())||{}; const mw=G.mw||8, mh=G.mh||6;
  const cell=`min(38px, calc((100vw - 64px) / ${mw}))`;
  let cells='';
  for(const k in pack){const p=pack[k];let inner='',lab='',sel=false,da='';
    if(k[0]==='w'){const i=+k.slice(1),w=WEAPONS[i];sel=this.wsel===i;da=`data-a="wsel" data-w="${i}"`;const url=weaponIconURL(i);
      inner=`${url?`<img alt="" src="${url}" style="max-width:${p.w>=p.h?'92%':'none'};max-height:86%;${p.h>p.w?'transform:rotate(90deg);width:'+(p.h*30)+'px':''}">`:''}<span class="mq">${i===9?0:i+1}</span>${P.w===i?'<span class="mon">●</span>':''}`;lab=w.n;}
    else{const i=+k.slice(1),s=G.inv[i],it=ITEMS[s.id];sel=this.sel===i;da=`data-a="slot" data-i="${i}"`;inner=`<span class="mlab" style="--c:${it.c}">${esc(it.s)}</span>${it.st>1?`<span class="q">${s.q}</span>`:''}`;lab=it.n;}
    cells+=`<button class="mcell${sel?' on':''}" ${da} aria-label="${esc(lab)}" style="grid-column:${p.x+1}/span ${p.w};grid-row:${p.y+1}/span ${p.h}">${inner}</button>`;}
  const keys=G.inv.map((s,i)=>s&&!isz(s.id)?`<button class="li${this.sel===i?' on':''}" data-a="slot" data-i="${i}"><span class="lico">${iconHTML(s.id)}</span><b>${esc(ITEMS[s.id].n)}</b></button>`:'').join('');
  let det='<p class="hint">Toque numa arma ou num item da maleta. Tudo ocupa espaço, até as armas. O que sobrar vai pro baú dos abrigos.</p>';
  if(this.wsel!=null&&P.owned[this.wsel]){const i=this.wsel,w=WEAPONS[i];
    det=`<h3>${esc(w.n)}</h3><p>${w.melee?'Corpo a corpo.':`Pente ${P.mags[i]}/${w.mag} · ${invCount(w.ammo)} ${esc(ITEMS[w.ammo].n.toLowerCase())} na maleta.`} Ocupa ${WSZ[i][0]}×${WSZ[i][1]}.</p>
      <div class="row"><button class="btn primary" data-a="wpn" data-w="${i}">${P.w===i?'Na mão':'Equipar'}</button><button class="btn ghost" data-a="wdrop" data-w="${i}">Largar no chão</button></div>`;}
  else if(this.sel!=null&&G.inv[this.sel]){
    const s=G.inv[this.sel],it=ITEMS[s.id]; const acts=[];
    if(it.k==='heal'||it.k==='battery')acts.push(`<button class="btn primary" data-a="use">Usar</button>`);
    if(it.k==='throw'||s.id==='gran')acts.push(`<button class="btn primary" data-a="thr">${curThrow()===s.id?'Na mão':'Deixar na mão'}</button>`);
    if(s.id==='silenciador')acts.push(`<button class="btn primary" data-a="sil">Rosquear na pistola</button>`);
    if(s.id==='detector')acts.push(`<button class="btn primary" data-a="det">${G.detOn?'Desligar':'Ligar'}</button>`);
    if(it.k==='key')acts.push(`<span class="hint">Itens-chave não ocupam espaço e são usados sozinhos no lugar certo.</span>`);
    if(it.k!=='key')acts.push(`<button class="btn ghost" data-a="drop">Largar no chão</button>`);
    det=`<h3>${esc(it.n)}${s.q>1?` <span class="dim">×${s.q}</span>`:''}</h3><p>${esc(it.d)}</p><div class="row">${acts.join('')}</div>`;}
  const melee=[0,8].filter(i=>P.owned[i]).map(i=>`<button class="wpn${P.w===i?' on':''}" data-a="wpn" data-w="${i}"><span class="k">${i+1}</span><b>${WEAPONS[i].n}</b><small>${i===0?'aguenta '+P.dur+' golpes':'empurra e derruba'}</small></button>`).join('');
  const recs=RECIPES.map((rc,i)=>{const need=Object.entries(rc.need).map(([k,n])=>`${n} ${ITEMS[k].n}`).join(' + ');const ok=canCraft(rc);
    return `<button class="rec" data-a="craft" data-r="${i}" ${ok?'':'disabled'}><span>${esc(need)}</span><b>→ ${esc(ITEMS[rc.give[0]].n)}${rc.give[1]>1?' ×'+rc.give[1]:''}</b></button>`;}).join('');
  return `<div class="inv-grid">
    <section class="col"><div class="status ${st[1]}"><span>Condição</span><b>${st[0]}</b></div>
      <h3>Maleta <span class="dim">${maletaUsed()}/${mw*mh}</span></h3>
      <div class="maleta" style="grid-template-columns:repeat(${mw},${cell});grid-template-rows:repeat(${mh},${cell})">${cells}</div>
      <div class="wpns">${melee}</div>
      ${keys?`<h3>Itens-chave</h3><div class="list">${keys}</div>`:''}</section>
    <section class="col"><div class="detail">${det}</div><h3>Fabricar</h3><div class="recs">${recs}</div></section></div>`;
};
UI.box=function(){
  const pack=packMaleta(maletaItems())||{};
  const mine=[];
  for(let i=1;i<WEAPONS.length;i++)if(i!==8&&P.owned[i])mine.push(`<button class="li" data-a="wtobox" data-w="${i}"><span class="lico">${weaponIconURL(i)?`<img alt="" src="${weaponIconURL(i)}" style="height:22px">`:''}</span><b>${esc(WEAPONS[i].n)}</b><span class="q2">${P.mags[i]}/${WEAPONS[i].mag}</span></button>`);
  G.inv.forEach((s,i)=>{if(s)mine.push(`<button class="li" data-a="tobox" data-i="${i}"><span class="lico">${iconHTML(s.id)}</span><b>${esc(ITEMS[s.id].n)}</b><span class="q2">${s.q>1?'×'+s.q:''}</span></button>`);});
  const bx=G.box.map((s,i)=>s.id==='_w'?`<button class="li" data-a="frombox" data-i="${i}"><span class="lico">${weaponIconURL(s.w)?`<img alt="" src="${weaponIconURL(s.w)}" style="height:22px">`:''}</span><b>${esc(WEAPONS[s.w].n)}</b><span class="q2">${s.q}/${WEAPONS[s.w].mag}</span></button>`
    :`<button class="li" data-a="frombox" data-i="${i}"><span class="lico">${iconHTML(s.id)}</span><b>${esc(ITEMS[s.id].n)}</b><span class="q2">${s.q>1?'×'+s.q:''}</span></button>`).join('')||'<p class="hint">O baú está vazio.</p>';
  this.open(`<div class="sheet wide"><p class="kick">Abrigo</p><h2>Baú de itens</h2><p class="hint">Toque para mudar de lado. Armas também podem ficar no baú. O que fica aqui aparece em todos os abrigos.</p>
    <div class="boxcols"><section><h3>Maleta <span class="dim">${maletaUsed()}/${(G.mw||8)*(G.mh||6)}</span></h3><div class="list">${mine.join('')||'<p class="hint">Maleta vazia.</p>'}</div></section>
    <section><h3>Baú</h3><div class="list">${bx}</div></section></div>
    <div class="row"><button class="btn" data-a="close">Fechar</button></div></div>`,'','box');
};
(function(){
  const act=UI.act.bind(UI);
  UI.act=function(a,ds){
    switch(a){
      case 'wsel':{const i=+ds.w;this.sel=null;this.wsel=this.wsel===i?null:i;return this.inv('itens');}
      case 'slot':this.wsel=null;return act(a,ds);
      case 'wdrop':{const i=+ds.w;if(!P.owned[i])return this.inv('itens');const q=P.mags[i]||0;P.owned[i]=false;P.mags[i]=0;if(P.w===i)P.w=P.owned[0]?0:8;
        const [x,y]=freeTileNear((P.x/TILE)|0,(P.y/TILE)|0,true),uid='wd'+(G.dropN++)+'_'+((Math.random()*1e6)|0);pickups.push({uid,tx:x,ty:y,x:tc(x),y:tc(y),id:i,q,kind:'weapon'});pickOcc.add(idx(x,y));
        G.flags.wdrops=[...(G.flags.wdrops||[]),{uid,tx:x,ty:y,id:i,q}];this.wsel=null;return this.inv('itens');}
      case 'wtobox':{boxWeaponAdd(+ds.w);return this.box();}
      case 'frombox':{const s=G.box[+ds.i];if(!s)return;
        if(s.id==='_w'){if(P.owned[s.w]){toast('Você já está com essa arma.');return this.box();}if(!maletaFits([{k:'nw',w:WSZ[s.w][0],h:WSZ[s.w][1]}])){toast('Não cabe na maleta.');AU.locked();return this.box();}
          P.owned[s.w]=true;P.mags[s.w]=s.q;G.box.splice(+ds.i,1);AU.reload();return this.box();}
        const left=invAdd(s.id,s.q);if(left===s.q){this.box();toast('Não cabe na maleta.');return;}s.q=left;if(s.q<=0)G.box.splice(+ds.i,1);return this.box();}
    }
    return act(a,ds);
  };
})();

// ===================== ACESSIBILIDADE =====================
const SUBS={normal:{n:'Normal',f:1},grande:{n:'Grande',f:1.2},enorme:{n:'Enorme',f:1.42}};
const SHKS={normal:{n:'Normal',f:1},reduzido:{n:'Reduzido',f:.4},desligado:{n:'Desligado',f:0}};
const FLSH={normal:{n:'Normal',f:1},reduzido:{n:'Reduzido',f:.35}};
const CBS={nao:{n:'Desligado'},protan:{n:'Protanopia'},deutan:{n:'Deuteranopia'},tritan:{n:'Tritanopia'}};
Object.assign(OPT,{sub:'normal',shk:'normal',fls:'normal',cb:'nao'});
function shkF(){return (SHKS[OPT.shk]||SHKS.normal).f;}
function flsF(){return (FLSH[OPT.fls]||FLSH.normal).f;}
function subF(){return (SUBS[OPT.sub]||SUBS.normal).f;}
function applyA11y(){
  try{document.documentElement.style.setProperty('--sub',String(subF()));
    let st=document.getElementById('a11yCss');if(!st){st=document.createElement('style');st.id='a11yCss';document.head.appendChild(st);}
    st.textContent=`.vn-text{font-size:calc(clamp(17px,2.3vw,21px)*var(--sub,1))!important}#bark p{font-size:calc(15px*var(--sub,1))!important}
      .maleta{display:grid;gap:2px;padding:6px;background:#1c1a16;border:2px solid #3a342a;box-shadow:inset 0 0 0 1px #000;width:max-content;max-width:100%}
      .mcell{position:relative;display:flex;align-items:center;justify-content:center;background:#2a2620;border:1px solid #4a4236;padding:0;cursor:pointer;overflow:hidden;min-width:0;min-height:0}
      .mcell.on{outline:2px solid var(--amber);z-index:1}.mcell .ico{min-width:0;padding:3px 4px;font-size:11px}.mcell img{pointer-events:none}
      .mcell .q{position:absolute;right:3px;bottom:1px;font-size:12px;font-weight:700;color:#ddd6c6;text-shadow:0 1px 0 #000}
      .mcell .mq{position:absolute;left:4px;top:2px;font-size:11px;font-weight:700;color:rgba(221,214,198,.7)}.mcell .mon{position:absolute;right:4px;top:1px;font-size:10px;color:var(--amber)}
      .li.on{outline:2px solid var(--amber)}.mlab{display:block;max-width:calc(100% - 4px);overflow:hidden;font-size:10px;font-weight:700;letter-spacing:.02em;line-height:1.15;color:#121110;background:var(--c);padding:2px 3px;word-break:break-all;text-align:center}`;
    let sv=document.getElementById('cbSvg');
    if(!sv){sv=document.createElement('div');sv.id='cbSvg';sv.style.cssText='position:absolute;width:0;height:0;overflow:hidden';
      sv.innerHTML=`<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0"><defs>
        <filter id="cb-protan" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  .509 .491 0 0 0  .617 -.617 1 0 0  0 0 0 1 0"/></filter>
        <filter id="cb-deutan" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="1 0 0 0 0  .202 .798 0 0 0  .517 -.517 1 0 0  0 0 0 1 0"/></filter>
        <filter id="cb-tritan" color-interpolation-filters="linearRGB"><feColorMatrix type="matrix" values="1 0 .2 0 0  0 .9 .1 0 0  0 .2 .8 0 0  0 0 0 1 0"/></filter></defs></svg>`;
      document.body.appendChild(sv);}
    const cv=document.getElementById('cv'); if(cv&&cv.style)cv.style.filter=OPT.cb&&OPT.cb!=='nao'?`url(#cb-${OPT.cb})`:'';
  }catch(e){}
}
(function(){
  const lo=loadOpts; loadOpts=function(){lo();try{const o=JSON.parse(localStorage.getItem('ps-opt')||'{}');if(SUBS[o.sub])OPT.sub=o.sub;if(SHKS[o.shk])OPT.shk=o.shk;if(FLSH[o.fls])OPT.fls=o.fls;if(CBS[o.cb])OPT.cb=o.cb;}catch(e){}applyA11y();};
  const so=saveOpts; saveOpts=function(){so();applyA11y();};
  const op=UI.opts.bind(UI);
  UI.opts=function(from){
    op(from);
    try{const box=OV.querySelector('.opts');if(!box)return;
      const seg=(a,cur,o)=>`<div class="seg">${Object.keys(o).map(k=>`<button data-a="${a}" data-k="${k}" class="${k===cur?'on':''}" aria-pressed="${k===cur}">${o[k].n}</button>`).join('')}</div>`;
      const d=document.createElement('div');d.className='opt';
      d.innerHTML=`<h3>Acessibilidade</h3><p class="hint">Tamanho das legendas</p>${seg('a11y-sub',OPT.sub,SUBS)}<p class="hint">Tremor da câmera</p>${seg('a11y-shk',OPT.shk,SHKS)}<p class="hint">Clarões e relâmpagos</p>${seg('a11y-fls',OPT.fls,FLSH)}<p class="hint">Modo daltônico</p>${seg('a11y-cb',OPT.cb,CBS)}`;
      box.appendChild(d);}catch(e){}
  };
  const act=UI.act.bind(UI);
  UI.act=function(a,ds){
    if(a==='a11y-sub'){OPT.sub=ds.k;saveOpts();return this.opts();}
    if(a==='a11y-shk'){OPT.shk=ds.k;saveOpts();return this.opts();}
    if(a==='a11y-fls'){OPT.fls=ds.k;saveOpts();return this.opts();}
    if(a==='a11y-cb'){OPT.cb=ds.k;saveOpts();return this.opts();}
    return act(a,ds);
  };
})();

// ===================== GANCHOS NO LAÇO =====================
(function(){
  const vt=v16Tick;
  v16Tick=function(dt){
    vt(dt);
    if(G.mode!=='play')return;
    qteTick(dt); smokeTick(dt);
    if(CUT.on)return;
    const F=G.flags;
    // capítulo 1: o massacre do shopping, a entrada, a sala da segurança
    if(shopCh1()){
      if(!F.shKill){F.shKill=true;shopMassacre();}
      const sb=shopB(); if(sb>=0&&G.inB===sb&&!F.shCh1)STORY.shopCh1Enter();
      if(F.shKill&&!F.shopEv)for(const e of enemies)if(e.alive&&!e.t.boss&&!e.stalker&&e.type!=='brandt'&&e.type!=='manequim'&&inShopPx(e.x,e.y)&&hyp(e.x-P.x,e.y-P.y)>500){e.alive=false;}
    }
    if(F.brFight&&!F.brandtDone&&!enemies.some(e=>e.alive&&e.type==='brandt')){const c=brandtCover()||{x:P.x+300,y:P.y};spawnBrandt(c.x,c.y);}
    // o Edu esperando do lado de fora do shopping
    if(F.eduSh&&!F.eduFollow&&!F.brFight){const sb=shopB();
      if(F.brandtDone||G.inB!==sb){F.eduSh=false;F.eduFollow=true;syncComps();const c=compOf('edu');if(c&&F.brandtDone){const r=shopRect();c.x=(r.x0+r.x1)/2;c.y=r.y0+40;}}}
    if(shopCh1()&&F.shCh1&&!F.brFight&&!F.brandtDone&&invCount('manobra')>0&&G.inB===shopB()&&!G.ev.brQ){G.ev.brQ=1;later(1500,()=>{G.ev.brQ=0;if(G.inB===shopB()&&!G.flags.brFight)STORY.brandtStart();});}
    if(inSew())G.lightT=Math.max(G.lightT||0,5);
    // galeria
    if(inSew()){
      if(AU.rainG&&AU.ctx)AU.rainG.gain.setTargetAtTime(.006,AU.ctx.currentTime,.4);
      if(!G.boom)G.light=0;
      chaseTick(dt); sewPsy(dt);
    } else if(AU.rainG&&AU.ctx&&G.ev.wasSew){AU.rainG.gain.setTargetAtTime(.05,AU.ctx.currentTime,.6);}
    G.ev.wasSew=inSew();
    // o Pescador agora espera na margem do rio em Itajaí
    if(F.vertice&&!F.pescOn&&!F.boss_pescador&&dAt((P.x/TILE)|0,(P.y/TILE)|0)===1&&LM.cabecudas&&hyp(P.x-LM.cabecudas.x,P.y-LM.cabecudas.y)<520&&!enemies.some(e=>e.alive&&(e.t.boss||e.type==='boss'))){
      F.pescOn=true;const p=LM.cabecudas;const b=spawnBoss('pescador',p.x,p.y,'b_pescador',true);if(b)STORY.introBoss(b);}
  };
  const ue=updEnemy;
  updEnemy=function(e,dt){
    if(e.type==='brandt')return updBrandt(e,dt);
    if(e.type==='coletor')return updColetor(e,dt);
    return ue(e,dt);
  };
  const he=hurtEnemy;
  hurtEnemy=function(e,dmg,kx,ky,o={}){
    if(e&&e.type==='brandt'){if(!e.alive||e.mode==='gone')return;brandtHurt(e,dmg,false);bloodBurst(e.x,e.y,3,Math.atan2(ky||0,kx||1));if(e.mode==='vanish')return;return;}
    if(e&&e.type==='coletor'){e.flash=.08;if(dmg>=60&&e.stun<=0){e.stun=.35;e.vx+=(kx||0)*.3;e.vy+=(ky||0)*.3;}if(!G.flags.colTip){G.flags.colTip=true;toast('As balas só seguram ele um instante. CORRE.');}return;}
    return he(e,dmg,kx,ky,o);
  };
  const de=drawEnemy;
  drawEnemy=function(e){
    if(e.type==='brandt')return drawBrandt(e);
    if(e.type==='coletor')return drawColetor(e);
    de(e); if(e.type==='cego')drawCego(e);
  };
  const dp=drawParts; drawParts=function(){drawSewerDeco();drawShopHatch();dp();drawSmokes();};
  const dpl=drawPostLight; drawPostLight=function(){dpl();brandtGlow();};
  const el=evLights; evLights=function(){el();brandtLights();};
  const dr=drawRain; drawRain=function(){if(inSew())return;dr();};
  const ds=drawPsy; drawPsy=function(){ds();drawQTE();
    // dica de chute quando ele está tonto
    const e=enemies.find(x=>x.alive&&x.type==='brandt'&&x.stun>0); if(e&&hyp(e.x-P.x,e.y-P.y)<80&&G.mode==='play'&&!CUT.on&&!G.qte){ctx.setTransform(dpr,0,0,dpr,0,0);ctx.font=`700 15px ${FONT_UI}`;ctx.textAlign='center';ctx.fillStyle='#d9a33c';ctx.fillText(IN.touch?'USAR: CHUTAR':'E: CHUTAR',view.w/2,view.h*.66);}};
  const di=doInteract;
  doInteract=function(){
    if(G.qte){qtePress();return;}
    const e=enemies.find(x=>x.alive&&x.type==='brandt'&&x.stun>0); if(e&&hyp(e.x-P.x,e.y-P.y)<80&&!G.struggle){brandtKick(e);return;}
    return di();
  };
  const us=updSpawner; updSpawner=function(dt){if(inSew()||(G.flags.brFight&&!G.flags.brandtDone)){G.spawnT=4;return;}const sb=shopB();if(shopCh1()&&G.flags.shKill&&sb>=0&&G.inB===sb){G.spawnT=4;return;}return us(dt);};
  const uev=updEvents; updEvents=function(dt){if(inSew()||G.flags.brFight&&!G.flags.brandtDone){updPeds(dt);return;}return uev(dt);};
  const tt=trapTick; trapTick=function(dt){if(inSew())return;return tt(dt);};
  const rl=renderLighting; renderLighting=function(sx,sy,sp){G._dkSew=inSew()?.94:(G.flags&&G.flags.brFight&&!G.flags.brandtDone?.9:0);return rl(sx,sy,sp);};
})();
// sustos psicológicos na galeria
function sewPsy(dt){
  const F=G.flags, Y=SEWY0; G.ev.sewT=(G.ev.sewT??18)-dt; if(G.ev.sewT>0||G.ev.chase)return; G.ev.sewT=rr(22,40);
  const r=Math.random();
  if(r<.3){const a=Math.random()*6.283,x=P.x+Math.cos(a)*260,y=P.y+Math.sin(a)*260;psyFloat(x,y,pick2(['...tem alguém aí?','...me tira daqui...','...tá escuro, mãe...','...não abre a dois...']),{life:2.6,c:'#a8b0a8',size:12,whisper:true});AU.cry&&AU.cry(pick2(['socorro','richard']),x,y,.5);}
  else if(r<.55){AU.drag(.7);G.shake+=1;bark('rafa','s',pick2(['Alguma coisa se arrastou do outro lado do canal.','Isso foi dentro da parede?','Para. Escuta... tem água pingando no ritmo de um passo.']),{dur:2.2});}
  else if(r<.75&&!F.sewGlimpse&&P.x<tc(110)){F.sewGlimpse=true;AU.roar();G.shake+=4;bark('rafa','s','Lá no fundo... uma coisa comprida demais atravessou a galeria. Ela anda de quatro.',{dur:2.6});
    for(let i=0;i<14;i++)parts.push({k:'acid',x:P.x+Math.cos(P.ang)*360+rr(-40,40),y:P.y+Math.sin(P.ang)*360+rr(-20,20),vx:rr(-80,80),vy:rr(-80,80),life:.6,max:.6,s:3,c:'#9ab8c8'});}
  else {AU.heart(1);G.fear=Math.min(1,(G.fear||0)+.25);}
}
// estado da galeria depois de carregar o jogo
function sewReapply(){
  const F=G.flags; if(!LM.sewIn)return;
  sewFlood(!F.sewPump,!F.sewDrain); sewApplyGates();
  if(F.sewPump)for(const l of lights)if(l.sewPump)l.off=false;
  if(F.brFight&&!F.brandtDone){F.brFight=false;delete F['pw'+shopB()];for(const id of ['shopN','shopS','shopW','shopE']){const g=gates.find(x=>x.id===id);if(g&&!g.open)openGate(g);}const p=pickups.find(p=>p.id==='manobra');if(!p&&invCount('manobra')>0){}}
  if(F.shKill&&shopCh1())shopMassacre();
  if(F.eduSh&&!F.eduFollow&&!F.brFight){F.eduSh=false;F.eduFollow=true;syncComps();}
  if(F.brandtDone)brandtLightsBack();
  if(G.ev)G.ev.chase=null;
}
// conquistas novas
if(typeof ACH!=='undefined')ACH.push({id:'brandt',n:'Não é pessoal',d:'Sobreviva ao Sargento Brandt no shopping.'},{id:'galeria',n:'Debaixo do rio',d:'Escape do T-11 na galeria pluvial.'});

// ---------- menu de teste ----------
(function(){
  const dj=dbgJump;
  dbgJump=function(k){
    const F=G.flags;
    if(k==='brandt'||k==='galeria'||k==='galeria2'){
      dj('caos'); F.needDina=true; F.eduJoin=true; F.eduFollow=true; syncComps();
      if(k==='brandt'){const s=LM.seguranca;P.x=s.x-60;P.y=s.y;snapCamera();flowTile=-1;return;}
      F.shKill=true;F.shCh1=true;F.brandtDone=true;F.sewIn=true;invAdd('manobra',1);
      if(k==='galeria2'){F.sewPump=true;sewFlood(false,null);for(const l of lights)if(l.sewPump)l.off=false;P.x=tc(124);P.y=tc(SEWY0+46);}
      else{P.x=LM.sewIn.x;P.y=LM.sewIn.y;}
      for(const c of (G.comps||[])){c.x=P.x+20;c.y=P.y;}snapCamera();flowTile=-1;return;
    }
    return dj(k);
  };
  const dbg=UI.debug.bind(UI);
  UI.debug=function(){dbg();try{if(!DBG_OK)return;const grid=OV.querySelector('.dbg-grid');if(!grid)return;
    const bt=(k,l)=>`<button class="dbgb" data-a="dbg" data-k="${k}">${l}</button>`;
    const sec=document.createElement('section');
    sec.innerHTML=`<h3>Novidades 1.4</h3><div class="dbg-list">
      ${bt('j:brandt','Pular · Shopping, antes do Brandt')}${bt('v14:brandtNow','Começar a luta com o Brandt agora')}${bt('v14:brandtLow','Brandt com pouca vida')}${bt('v14:brandtQte','Brandt parte pra faca (quick time)')}${bt('v14:brandtWin','Vencer o Brandt')}
      ${bt('j:galeria','Pular · Galeria, entrada')}${bt('v14:fuses','Ganhar os três fusíveis')}${bt('v14:pump','Ligar a bomba (resolver fusíveis)')}${bt('j:galeria2','Pular · Galeria, sala das comportas')}${bt('v14:drain','Resolver as comportas (começa a fuga)')}
      ${bt('v14:chase','Soltar o T-11 aqui (fuga)')}${bt('v14:chaseStop','Parar a fuga e sumir com o T-11')}${bt('v14:exit','Sair da galeria (Laranjeiras)')}${bt('v14:smoke','Granada de fumaça aqui')}${bt('v14:qte','Testar quick time')}
      ${bt('v14:maleta','Maleta no tamanho máximo')}${bt('v14:maletaMin','Maleta no tamanho inicial')}${bt('v14:notas','Mostrar as novidades de novo no título')}${bt('v14:pesc','Pescador · litoral de Itajaí')}</div>`;
    grid.insertBefore(sec,grid.firstChild);
    for(const b of OV.querySelectorAll('[data-k=slots]'))b.textContent='Aumentar a maleta';}catch(e){}};
  const da=UI.dbgAct.bind(UI);
  UI.dbgAct=function(k,ds){
    const F=G.flags, near=()=>{const a=P.ang;return {x:P.x+Math.cos(a)*170,y:P.y+Math.sin(a)*170};};
    const br=()=>enemies.find(e=>e.alive&&e.type==='brandt');
    if(k==='spawn:brandt'){this.close();if(!br()){const p=near();F.brFight=true;spawnBrandt(p.x,p.y);}return;}
    if(k==='spawn:coletor'){this.close();G.ev.chase={t:0};coletorRelease();const c=enemies.find(e=>e.alive&&e.type==='coletor');if(c){const p=near();const [x,y]=freeTileNear((p.x/TILE)|0,(p.y/TILE)|0,false);c.x=tc(x);c.y=tc(y);}toast('T-11 solto. "Parar a fuga" no menu de teste some com ele.');return;}
    if(!k.startsWith('v14:'))return da(k,ds);
    const c=k.slice(4); this.close();
    switch(c){
      case 'brandtNow':{if(!shopCh1()){dbgJump('brandt');}if(invCount('manobra')<=0)invAdd('manobra',1);const m=pickups.find(p=>p.id==='manobra');if(m){G.taken.add(m.uid);pickups=pickups.filter(p=>p!==m);}F.shKill=true;shopMassacre();F.shCh1=true;if(F.eduFollow){F.eduFollow=false;F.eduSh=true;dropComp('edu');}const s=LM.seguranca;P.x=s.x-40;P.y=s.y;snapCamera();flowTile=-1;STORY.brandtStart();return;}
      case 'brandtLow':{const e=br();if(!e)return toast('O Brandt não está no mapa. Use "Começar a luta" antes.');e.hp=e.max*.2;e.p2=e.p3=true;e.light=false;return toast('Brandt com 20% da vida.');}
      case 'brandtQte':{const e=br();if(!e)return toast('O Brandt não está no mapa.');e.x=P.x+30;e.y=P.y;e.mode='stalk';brandtGrapple(e);return;}
      case 'brandtWin':{const e=br();if(!e)return toast('O Brandt não está no mapa.');e.hp=1;brandtEnd(e);return;}
      case 'fuses':for(const id of ['fus10','fus20','fus30'])if(invCount(id)<=0)invAdd(id,1);return toast('Fusíveis 10A, 20A e 30A na maleta. Ordem certa: A=20, B=30, C=10.');
      case 'pump':{for(const id of ['fus10','fus20','fus30'])invRemove(id,9);F.fuseSlots=['fus20','fus30','fus10'];if(!F.sewPump)sewPumpOn();return;}
      case 'drain':{if(!LM.sewIn)return;if(!inSew()){dbgJump('galeria2');}if(!F.sewPump){F.sewPump=true;sewFlood(false,null);for(const l of lights)if(l.sewPump)l.off=false;}F.sewC=1|8;sewApplyGates();sewDrained();return;}
      case 'chase':{G.ev.chase={t:0};coletorRelease();const co=enemies.find(e=>e.alive&&e.type==='coletor');if(co){const a=P.ang+Math.PI;const [x,y]=freeTileNear(((P.x+Math.cos(a)*260)/TILE)|0,((P.y+Math.sin(a)*260)/TILE)|0,false);co.x=tc(x);co.y=tc(y);}return;}
      case 'chaseStop':G.ev.chase=null;G.qte=null;for(const e of enemies)if(e.type==='coletor')e.alive=false;return toast('Fuga parada.');
      case 'exit':{if(!F.sewIn){F.sewIn=true;F.shKill=true;F.shCh1=true;F.brandtDone=true;}F.sewPump=true;F.sewDrain=true;F.sewC=1|8;sewFlood(false,false);sewApplyGates();F.needDina=true;sewExit();return;}
      case 'smoke':addSmoke(P.x+Math.cos(P.ang)*120,P.y+Math.sin(P.ang)*120,120,6.5);return;
      case 'qte':qteStart({label:'TESTE DE QUICK TIME',n:3,onOk:()=>toast('Acertou os três.'),onFail:()=>toast('Errou o tempo.')});return;
      case 'maleta':G.mw=11;G.mh=8;return toast('Maleta 11×8.');
      case 'maletaMin':G.mw=8;G.mh=6;{const inv=G.inv.filter(Boolean);G.inv=new Array(64).fill(null);for(const it of inv){const l=invAdd(it.id,it.q);if(l>0)boxAdd(it.id,l);}}return toast('Maleta 8×6. O que não coube foi pro baú.');
      case 'notas':try{localStorage.removeItem('ps-notas');}catch(e){}return toast('Na tela de título vai aparecer "Novidades" de novo.');
      case 'pesc':{F.vertice=true;F.pescOn=false;delete F.boss_pescador;const p=LM.cabecudas;const [x,y]=freeTileNear(((p.x/TILE)|0)-12,(p.y/TILE)|0,true);P.x=tc(x);P.y=tc(y);snapCamera();flowTile=-1;return;}
    }
  };
})();
