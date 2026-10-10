// ===================== RETRATOS =====================
const PCH={
  rafa:{name:'Richard',skin:'#e0ad90',shade:'#ad7660',hair:'#33200f',iris:'#24130a',bg:['#1c1a22','#08070a'],glow:'214,170,120',voice:165},
  cida:{name:'Dona Cida',skin:'#c99a7a',shade:'#93684e',hair:'#d9d5cc',iris:'#4a3626',bg:['#24182a','#0b080d'],glow:'190,140,220',voice:290},
  tiao:{name:'Tião',skin:'#6e4a32',shade:'#45281a',hair:'#c9c4ba',iris:'#2a1a10',bg:['#141c2c','#06080d'],glow:'120,160,230',voice:120},
  helena:{name:'Dra. Helena',skin:'#e2bca2',shade:'#b08468',hair:'#7a3820',iris:'#3a5a4a',bg:['#102424','#050b0b'],glow:'110,220,200',voice:240},
  piloto:{name:'Piloto',skin:'#c49a7a',shade:'#8a6448',hair:'#222',iris:'#222',bg:['#1c2216','#070906'],glow:'170,200,120',voice:150},
  arantes:{name:'Dr. Arantes',skin:'#d9b69c',shade:'#a37c64',hair:'#8a8680',iris:'#33363c',bg:['#14221f','#050909'],glow:'120,230,200',voice:105},
  ivo:{name:'Seu Ivo',skin:'#b0805e',shade:'#7a5238',hair:'#e0dcd2',iris:'#2a2018',bg:['#14202a','#06090c'],glow:'140,180,210',voice:110},
  edu:{name:'Edu',skin:'#e8c0a4',shade:'#b88a70',hair:'#3a2616',iris:'#6a5a2e',bg:['#1a1a20','#070709'],glow:'210,170,120',voice:150},
  matheus:{name:'Matheus',skin:'#dcae90',shade:'#a8785c',hair:'#120c0a',iris:'#3a2416',bg:['#141c26','#06080b'],glow:'120,170,230',voice:122},
  guarda:{name:'Segurança da Vértice',skin:'#c49a7a',shade:'#8a6448',hair:'#111',iris:'#111',bg:['#141618','#050607'],glow:'180,200,210',voice:92},
};
const PORTRAITS={};
function portraitURL(who,mood,radio){
  const k=who+'|'+mood+'|'+(radio?1:0);
  if(k in PORTRAITS)return PORTRAITS[k];
  try{const c=document.createElement('canvas');c.width=280;c.height=320;drawPortrait(c.getContext('2d'),who,mood,radio);
    const u=c.toDataURL&&c.toDataURL('image/png');PORTRAITS[k]=typeof u==='string'&&u.length>30?u:'';}catch(e){PORTRAITS[k]='';}
  return PORTRAITS[k];
}
function drawPortrait(c,who,mood,radio){
  const p=PCH[who], W2=280, H2=320, cx=140, cy=136;
  const sick=mood==='k'; const skin=sick?'#b9b9a2':p.skin, shade=sick?'#7f8270':p.shade;
  const bg=c.createLinearGradient(0,0,0,H2);bg.addColorStop(0,p.bg[0]);bg.addColorStop(1,p.bg[1]);c.fillStyle=bg;c.fillRect(0,0,W2,H2);
  let g=c.createRadialGradient(170,110,10,170,110,190);g.addColorStop(0,`rgba(${p.glow},.32)`);g.addColorStop(1,`rgba(${p.glow},0)`);c.fillStyle=g;c.fillRect(0,0,W2,H2);
  c.strokeStyle='rgba(255,255,255,.025)';c.lineWidth=1;for(let y=0;y<H2;y+=4){c.beginPath();c.moveTo(0,y);c.lineTo(W2,y);c.stroke();}
  // corpo
  const body={rafa:['#1f2b4e','#0c1226'],cida:['#5e3f5e','#2f1f30'],tiao:['#25304a','#121826'],helena:['#e4e2da','#9a9890'],piloto:['#4a5232','#22261a'],arantes:['#dcd8bc','#8a8670'],guarda:['#24282c','#0c0e10'],edu:['#1c1c1f','#09090a'],matheus:['#ecebe6','#a6a6a0'],ivo:['#5a6a3a','#262e18']}[who]||(typeof PXH!=='undefined'&&PXH[who]&&PXH[who].body)||['#333','#111'];
  g=c.createLinearGradient(0,200,0,H2);g.addColorStop(0,body[0]);g.addColorStop(1,body[1]);
  c.fillStyle=g;c.beginPath();c.moveTo(18,H2);c.bezierCurveTo(24,240,70,212,cx,208);c.bezierCurveTo(210,212,256,240,262,H2);c.closePath();c.fill();
  // pescoço
  g=c.createLinearGradient(118,0,162,0);g.addColorStop(0,shade);g.addColorStop(.6,skin);g.addColorStop(1,shade);
  c.fillStyle=g;c.beginPath();c.moveTo(114,170);c.lineTo(166,170);c.lineTo(170,222);c.quadraticCurveTo(cx,236,110,222);c.closePath();c.fill();
  c.fillStyle='rgba(0,0,0,.28)';c.beginPath();c.ellipse(cx,196,30,12,0,0,6.283);c.fill();
  // roupa por personagem
  if(who==='rafa'){
    // camisa azul-marinho de time com listras vermelhas no ombro e pontinhos
    c.strokeStyle='#c8344a';c.lineWidth=5;for(const k of [0,9]){c.beginPath();c.moveTo(20+k,H2-6);c.quadraticCurveTo(40+k,236,92+k*.4,214);c.stroke();c.beginPath();c.moveTo(260-k,H2-6);c.quadraticCurveTo(240-k,236,188-k*.4,214);c.stroke();}
    c.fillStyle='rgba(200,52,74,.35)';for(let y=246;y<316;y+=7)for(let x=150;x<236;x+=7)if((x+y)%14<7&&x-150<(y-236)*1.2)c.fillRect(x,y,2,2);
    for(let y=246;y<316;y+=7)for(let x=44;x<130;x+=7)if((x+y)%14<7&&130-x<(y-236)*1.2)c.fillRect(x,y,2,2);
    c.fillStyle='#0e1430';c.beginPath();c.moveTo(108,208);c.lineTo(cx,238);c.lineTo(172,208);c.lineTo(166,203);c.lineTo(cx,226);c.lineTo(114,203);c.closePath();c.fill();
  } else if(who==='cida'){
    c.fillStyle='#ece6da';c.beginPath();c.moveTo(108,210);c.lineTo(cx,240);c.lineTo(172,210);c.lineTo(164,204);c.lineTo(cx,226);c.lineTo(116,204);c.closePath();c.fill();
    c.fillStyle='#c9a24a';c.fillRect(138,244,4,16);c.fillRect(132,249,16,4);
    c.fillStyle='rgba(255,255,255,.25)';for(let y=262;y<318;y+=18){c.beginPath();c.arc(cx,y,3,0,6.283);c.fill();}
  } else if(who==='tiao'){
    c.fillStyle='#1a2236';c.beginPath();c.moveTo(104,212);c.lineTo(cx,250);c.lineTo(176,212);c.lineTo(168,204);c.lineTo(cx,232);c.lineTo(112,204);c.closePath();c.fill();
    c.fillStyle='#c9a24a';c.beginPath();c.moveTo(196,246);c.lineTo(212,250);c.lineTo(208,270);c.lineTo(200,276);c.lineTo(192,270);c.closePath();c.fill();
    c.fillStyle='#111';c.fillRect(64,236,14,40);c.fillStyle='#d04a3a';c.fillRect(68,240,4,4);
  } else if(who==='helena'){
    c.fillStyle='#3a8a80';c.beginPath();c.moveTo(112,210);c.lineTo(cx,252);c.lineTo(168,210);c.closePath();c.fill();
    c.fillStyle='#cfccc2';c.beginPath();c.moveTo(96,214);c.lineTo(132,262);c.lineTo(120,H2);c.lineTo(84,H2);c.closePath();c.fill();c.beginPath();c.moveTo(184,214);c.lineTo(148,262);c.lineTo(160,H2);c.lineTo(196,H2);c.closePath();c.fill();
    c.fillStyle='#f2f0ea';c.fillRect(186,262,32,20);c.fillStyle='#3a8a80';c.fillRect(186,262,32,5);c.fillStyle='#555';c.fillRect(190,270,14,2);c.fillRect(190,275,20,2);
    if(sick){c.strokeStyle='rgba(90,40,90,.55)';c.lineWidth=1.5;c.beginPath();c.moveTo(150,182);c.quadraticCurveTo(156,196,150,214);c.moveTo(126,190);c.quadraticCurveTo(122,204,128,216);c.stroke();}
  } else if(who==='piloto'){
    c.fillStyle='#2a2e1e';c.fillRect(60,250,40,14);c.fillStyle='#c9a24a';c.fillRect(180,248,24,6);
  } else if(who==='arantes'){
    c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=2;for(const x of [70,110,170,210]){c.beginPath();c.moveTo(x,236);c.lineTo(x+6,H2);c.stroke();}
    c.fillStyle='#2e8a78';c.fillRect(178,252,40,18);c.fillStyle='#e8e6d6';c.font='700 15px "Barlow Condensed",sans-serif';c.fillText('VÉRTICE',181,266);
  } else if(who==='edu'){
    c.fillStyle='#0c0c0e';c.beginPath();c.moveTo(98,218);c.quadraticCurveTo(cx,246,182,218);c.lineTo(176,213);c.quadraticCurveTo(cx,236,104,213);c.closePath();c.fill();
    c.strokeStyle='rgba(255,255,255,.05)';c.lineWidth=2;c.beginPath();c.moveTo(60,260);c.quadraticCurveTo(cx,250,220,262);c.stroke();
  } else if(who==='matheus'){
    // camisa de time branca com gola azul-clara e recortes preto e azul; fone gamer no pescoço
    c.fillStyle='#16181c';c.beginPath();c.moveTo(20,H2);c.bezierCurveTo(26,250,52,224,84,214);c.lineTo(96,236);c.lineTo(60,H2);c.closePath();c.fill();
    c.beginPath();c.moveTo(260,H2);c.bezierCurveTo(254,250,228,224,196,214);c.lineTo(184,236);c.lineTo(220,H2);c.closePath();c.fill();
    c.fillStyle='#2a5aa8';c.beginPath();c.moveTo(62,H2);c.lineTo(94,240);c.lineTo(100,246);c.lineTo(74,H2);c.closePath();c.fill();c.beginPath();c.moveTo(218,H2);c.lineTo(186,240);c.lineTo(180,246);c.lineTo(206,H2);c.closePath();c.fill();
    c.fillStyle='#8ac4ea';c.beginPath();c.moveTo(104,207);c.lineTo(cx,244);c.lineTo(176,207);c.lineTo(168,203);c.lineTo(cx,230);c.lineTo(112,203);c.closePath();c.fill();
    c.fillStyle='rgba(0,0,0,.08)';for(let y=250;y<316;y+=10)c.fillRect(110,y,60,3);
    c.fillStyle='#1e2a44';c.font='700 22px "Barlow Condensed",sans-serif';c.fillText('10',190,292);
    // fone: arco atrás do pescoço e as conchas apoiadas na clavícula
    c.strokeStyle='#121316';c.lineWidth=9;c.beginPath();c.ellipse(cx,206,46,20,0,Math.PI*.05,Math.PI*.95,true);c.stroke();
    for(const s of [-1,1]){c.fillStyle='#17181c';c.beginPath();c.ellipse(cx+s*48,214,15,19,s*.3,0,6.283);c.fill();c.fillStyle='#2e3036';c.beginPath();c.ellipse(cx+s*48,214,10,13,s*.3,0,6.283);c.fill();c.fillStyle='rgba(120,200,255,.55)';c.beginPath();c.ellipse(cx+s*50,212,3,5,s*.3,0,6.283);c.fill();}
  } else if(who==='guarda'){
    c.fillStyle='#15181b';c.fillRect(62,236,156,70);c.fillStyle='#2a2f34';for(const x of [76,112,150,186])c.fillRect(x,246,24,30);c.fillStyle='#2e8a78';c.fillRect(124,240,32,6);
  }
  const X12=typeof PXH!=='undefined'?PXH[who]:null; if(X12&&X12.clothes)X12.clothes(c,cx,H2);
  if(X12&&X12.back)X12.back(c,cx,cy,X12.hw,p);
  // orelhas
  c.fillStyle=shade;c.beginPath();c.ellipse(84,142,10,17,0,0,6.283);c.ellipse(196,142,10,17,0,0,6.283);c.fill();
  // cabelo de trás
  if(who==='helena'){c.fillStyle=p.hair;c.beginPath();c.ellipse(cx,128,66,78,0,0,6.283);c.fill();c.beginPath();c.ellipse(204,170,16,40,-.3,0,6.283);c.fill();}
  if(who==='edu'){c.fillStyle=p.hair;c.beginPath();c.ellipse(cx,128,64,84,0,0,6.283);c.fill();
    for(const s of [-1,1]){c.beginPath();c.moveTo(cx+s*58,100);c.quadraticCurveTo(cx+s*72,160,cx+s*66,198);c.quadraticCurveTo(cx+s*84,206,cx+s*90,196);c.quadraticCurveTo(cx+s*76,190,cx+s*74,170);c.quadraticCurveTo(cx+s*70,120,cx+s*40,70);c.closePath();c.fill();}}
  if(who==='cida'){c.fillStyle=p.hair;c.beginPath();c.arc(cx,52,28,0,6.283);c.fill();c.strokeStyle='rgba(0,0,0,.12)';c.lineWidth=1.5;for(let a=0;a<6;a++){c.beginPath();c.arc(cx,52,8+a*3.6,a,a+2.4);c.stroke();}}
  // cabeça
  const hw=X12?X12.hw:who==='cida'||who==='helena'?53:who==='rafa'?55:who==='edu'?49:who==='matheus'?60:57, hh=X12?X12.hh:who==='rafa'?73:who==='edu'?78:66;
  g=c.createRadialGradient(cx-18,cy-24,8,cx,cy,82);g.addColorStop(0,skin);g.addColorStop(.75,skin);g.addColorStop(1,shade);
  c.fillStyle=g;c.beginPath();c.moveTo(cx-hw,cy-10);c.bezierCurveTo(cx-hw,cy-hh-6,cx+hw,cy-hh-6,cx+hw,cy-10);c.bezierCurveTo(cx+hw,cy+34,cx+24,cy+hh,cx,cy+hh);c.bezierCurveTo(cx-24,cy+hh,cx-hw,cy+34,cx-hw,cy-10);c.closePath();c.fill();
  if(!X12){c.strokeStyle=`rgba(${p.glow},.55)`;c.lineWidth=3;c.beginPath();c.moveTo(cx+hw-2,cy-30);c.bezierCurveTo(cx+hw+1,cy+10,cx+hw-6,cy+40,cx+22,cy+hh-4);c.stroke();}
  c.fillStyle='rgba(0,0,0,.14)';c.beginPath();c.ellipse(cx-hw+16,cy+14,14,34,.1,0,6.283);c.fill();
  if(who==='rafa'||who==='tiao'){c.fillStyle='rgba(20,10,5,.22)';for(let i=0;i<60;i++){const a=Math.random()*Math.PI,r=30+Math.random()*24;const x=cx+Math.cos(a)*r*.9,y=cy+28+Math.sin(a)*r*.6;if(y>cy+20)c.fillRect(x,y,1.4,1.4);}}
  // olhos
  const ey=cy-4, ex=24;
  const eyes=()=>{
    for(const s of [-1,1]){
      const x=cx+s*ex; let ow=11, oh=mood==='s'?7.5:mood==='h'?3:mood==='k'?3.6:5.5;
      if(mood==='h'){c.strokeStyle='#2a1a12';c.lineWidth=2.5;c.beginPath();c.arc(x,ey+3,9,Math.PI*1.15,Math.PI*1.85);c.stroke();continue;}
      c.fillStyle=sick?'#d8d6bc':'#efe9dc';c.beginPath();c.ellipse(x,ey,ow,oh,0,0,6.283);c.fill();
      c.save();c.beginPath();c.ellipse(x,ey,ow,oh,0,0,6.283);c.clip();
      const ir=mood==='s'?3.4:4.6; c.fillStyle=sick?'#8a8f84':p.iris;c.beginPath();c.arc(x+s*-1,ey+.5,ir,0,6.283);c.fill();
      c.fillStyle='#050505';c.beginPath();c.arc(x+s*-1,ey+.5,mood==='s'?1.4:2.2,0,6.283);c.fill();
      c.fillStyle='rgba(255,255,255,.85)';c.beginPath();c.arc(x+s*-1-1.5,ey-1.5,1.2,0,6.283);c.fill();
      if(mood==='a'||mood==='k'){c.fillStyle=skin;c.beginPath();c.moveTo(x-ow-2,ey-oh-2);c.lineTo(x+ow+2,ey-oh-2);c.lineTo(x+(mood==='a'?-s*ow:ow),ey+(mood==='a'?-1:-1));c.lineTo(x-(mood==='a'?s*ow:ow),ey+(mood==='a'?-1-s*2:-1));c.closePath();c.fill();}
      if(who==='rafa'&&mood!=='s'){c.fillStyle=skin;c.beginPath();c.ellipse(x,ey-oh*1.5,ow+2,oh*1.0,0,0,6.283);c.fill();}
      c.restore();
      c.strokeStyle='#1a100a';c.lineWidth=2.2;c.beginPath();c.ellipse(x,ey,ow,oh,0,Math.PI*1.05,Math.PI*1.95);c.stroke();
      if(who==='rafa'){c.strokeStyle='rgba(70,35,25,.45)';c.lineWidth=1.6;c.beginPath();c.ellipse(x,ey-3,ow+1,oh+3,0,Math.PI*1.1,Math.PI*1.9);c.stroke();c.strokeStyle='rgba(70,35,25,.3)';c.beginPath();c.ellipse(x,ey+1,ow-1,oh,0,Math.PI*.15,Math.PI*.85);c.stroke();}
      if(who==='helena'||sick){c.strokeStyle='rgba(60,20,40,.3)';c.lineWidth=2;c.beginPath();c.arc(x,ey+5,9,Math.PI*.15,Math.PI*.85);c.stroke();}
    }
  };
  if(who!=='piloto'&&who!=='guarda')eyes();
  // sobrancelhas
  if(who!=='piloto'&&who!=='guarda'){
    c.strokeStyle=who==='cida'||who==='tiao'?'#a8a49a':who==='matheus'?'#0e0806':'#1a120c';c.lineWidth=who==='tiao'?5:who==='rafa'?6:who==='matheus'?10:who==='edu'?6.5:4;c.lineCap='round';
    for(const s of [-1,1]){const x=cx+s*ex;let yIn=ey-13,yOut=ey-14;
      if(who==='rafa'||who==='edu'){yIn=ey-15;yOut=ey-15;} if(who==='matheus'){yIn=ey-13;yOut=ey-16;}
      if(mood==='s'){yIn=ey-20;yOut=ey-17;} if(mood==='a'){yIn=ey-8;yOut=ey-16;} if(mood==='t'||mood==='k'){yIn=ey-18;yOut=ey-11;} if(mood==='h'){yIn=ey-17;yOut=ey-16;}
      c.beginPath();c.moveTo(x-s*10,yIn);c.quadraticCurveTo(x,Math.min(yIn,yOut)-3,x+s*12,yOut);c.stroke();}
  }
  // nariz
  if(who!=='piloto'&&who!=='guarda'){c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=2;c.beginPath();c.moveTo(cx+3,ey+8);c.quadraticCurveTo(cx+8,ey+26,cx-2,ey+28);c.stroke();c.fillStyle='rgba(0,0,0,.18)';c.beginPath();c.ellipse(cx-6,ey+28,4,2.4,0,0,6.283);c.ellipse(cx+6,ey+28,4,2.4,0,0,6.283);c.fill();}
  // boca
  const my=cy+40;
  c.strokeStyle='#4a2018';c.lineWidth=3;c.beginPath();
  if(mood==='s'){c.fillStyle='#200808';c.ellipse(cx,my+2,9,7,0,0,6.283);c.fill();c.fillStyle='#e8e0d0';c.fillRect(cx-7,my-4,14,3);}
  else if(mood==='a'){c.moveTo(cx-16,my+3);c.quadraticCurveTo(cx,my-2,cx+16,my+3);c.stroke();}
  else if(mood==='t'||mood==='k'){c.moveTo(cx-14,my+4);c.quadraticCurveTo(cx,my-4,cx+14,my+4);c.stroke();}
  else if(mood==='h'){c.moveTo(cx-17,my-2);c.quadraticCurveTo(cx,my+12,cx+17,my-2);c.stroke();}
  else {c.moveTo(cx-14,my+1);c.quadraticCurveTo(cx,my+4,cx+14,my);c.stroke();}
  // detalhes
  if(who==='tiao'){c.fillStyle=p.hair;c.beginPath();c.moveTo(cx-24,my-6);c.quadraticCurveTo(cx,my-16,cx+24,my-6);c.quadraticCurveTo(cx+26,my+4,cx+16,my);c.quadraticCurveTo(cx,my-6,cx-16,my);c.quadraticCurveTo(cx-26,my+4,cx-24,my-6);c.fill();
    c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=1.5;for(const s of [-1,1]){c.beginPath();c.arc(cx+s*ex+s*12,ey+4,8,s<0?Math.PI*.6:Math.PI*.1,s<0?Math.PI*.9:Math.PI*.4);c.stroke();}c.beginPath();c.moveTo(cx-20,ey-26);c.lineTo(cx+20,ey-26);c.stroke();}
  if(who==='cida'){c.strokeStyle='#c9a24a';c.lineWidth=2;for(const s of [-1,1]){c.beginPath();c.arc(cx+s*ex,ey,14,0,6.283);c.stroke();}c.beginPath();c.moveTo(cx-10,ey);c.lineTo(cx+10,ey);c.stroke();
    c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=1.4;c.beginPath();c.moveTo(cx-34,my-4);c.quadraticCurveTo(cx-28,my+4,cx-22,my+10);c.moveTo(cx+34,my-4);c.quadraticCurveTo(cx+28,my+4,cx+22,my+10);c.stroke();}
  if(who==='edu'){
    // nariz comprido, cavanhaque ralo no queixo e bigode fraco, algumas espinhas
    c.strokeStyle='rgba(120,70,50,.3)';c.lineWidth=2;c.beginPath();c.moveTo(cx-4,ey+2);c.lineTo(cx-7,ey+30);c.stroke();
    c.fillStyle='rgba(205,95,85,.35)';for(const [x,y,r] of [[cx-34,cy+18,2.2],[cx+30,cy+24,2],[cx+38,cy+8,1.6],[cx-26,cy+30,1.8],[cx+12,ey-26,1.5]]){c.beginPath();c.arc(x,y,r,0,6.283);c.fill();}
    c.fillStyle='rgba(40,24,14,.32)';for(let i=0;i<30;i++){c.fillRect(cx+(Math.random()-.5)*30,my-8+Math.random()*4,1.3,1.3);}
    c.fillStyle='rgba(40,24,14,.55)';for(let i=0;i<70;i++){const x=cx+(Math.random()-.5)*20,y=my+16+Math.random()*20;if(Math.abs(x-cx)<11-(y-my-16)*.15)c.fillRect(x,y,1.5,1.5);}
    if(mood!=='s'&&mood!=='h'){c.fillStyle='#c48474';c.beginPath();c.moveTo(cx-15,my+1);c.quadraticCurveTo(cx,my-5,cx+15,my+1);c.quadraticCurveTo(cx,my+11,cx-15,my+1);c.fill();}
  }
  if(who==='matheus'){
    // bigode grosso e barba no queixo, rosto mais redondo
    c.fillStyle='#1a100a';c.beginPath();c.moveTo(cx-24,my-2);c.quadraticCurveTo(cx-12,my-14,cx,my-10);c.quadraticCurveTo(cx+12,my-14,cx+24,my-2);c.quadraticCurveTo(cx+12,my-6,cx,my-5);c.quadraticCurveTo(cx-12,my-6,cx-24,my-2);c.fill();
    c.beginPath();c.moveTo(cx-20,my+12);c.quadraticCurveTo(cx,my+8,cx+20,my+12);c.quadraticCurveTo(cx+18,my+34,cx,my+40);c.quadraticCurveTo(cx-18,my+34,cx-20,my+12);c.fill();
    c.fillStyle='rgba(26,16,10,.18)';for(let i=0;i<80;i++){const a2=Math.PI*(.15+Math.random()*.7),r=44+Math.random()*16;c.fillRect(cx+Math.cos(a2)*r*1.1,cy+22+Math.sin(a2)*r*.8,1.4,1.4);}
    if(mood!=='s'&&mood!=='h'){c.fillStyle='#b8705e';c.beginPath();c.ellipse(cx,my+4,13,5,0,0,6.283);c.fill();}
  }
  if(who==='rafa'){
    // bochechas e nariz rosados
    c.fillStyle='rgba(225,110,100,.16)';for(const [x,y,rx] of [[cx-30,cy+16,15],[cx+30,cy+16,15],[cx,ey+24,10]]){c.beginPath();c.ellipse(x,y,rx,rx*.7,0,0,6.283);c.fill();}
    // nariz reto com a ponta mais larga
    c.strokeStyle='rgba(120,60,40,.28)';c.lineWidth=2;c.beginPath();c.moveTo(cx-6,ey+4);c.quadraticCurveTo(cx-9,ey+18,cx-12,ey+24);c.stroke();
    c.fillStyle='rgba(255,230,210,.25)';c.beginPath();c.ellipse(cx+1,ey+21,5,4,0,0,6.283);c.fill();
    // lábios cheios, boca séria
    if(mood!=='s'&&mood!=='h'){c.fillStyle='#c27a6c';c.beginPath();c.moveTo(cx-17,my+1);c.quadraticCurveTo(cx-7,my-6,cx,my-3);c.quadraticCurveTo(cx+7,my-6,cx+17,my+1);c.quadraticCurveTo(cx+10,my+12,cx,my+12);c.quadraticCurveTo(cx-10,my+12,cx-17,my+1);c.fill();
      c.fillStyle='rgba(255,220,210,.25)';c.beginPath();c.ellipse(cx,my+7,7,2.2,0,0,6.283);c.fill();
      c.strokeStyle='rgba(90,40,32,.75)';c.lineWidth=1.8;c.beginPath();c.moveTo(cx-17,my+1);c.quadraticCurveTo(cx,my+3,cx+17,my+1);c.stroke();}
    // bigode ralo, cavanhaque no queixo e sombra de barba na mandíbula
    c.fillStyle='rgba(45,26,14,.28)';
    for(let i=0;i<34;i++){const x=cx+(Math.random()-.5)*34,y=my-9+Math.random()*5;c.fillRect(x,y,1.4,1.4);}
    for(let i=0;i<80;i++){const x=cx+(Math.random()-.5)*32,y=my+16+Math.random()*18;if(Math.abs(x-cx)<20-(y-my-15)*.3)c.fillRect(x,y,1.5,1.5);}
    c.fillStyle='rgba(45,26,14,.1)';for(let i=0;i<90;i++){const a2=Math.PI*(.12+Math.random()*.76),r=46+Math.random()*16;c.fillRect(cx+Math.cos(a2)*r*1.08,cy+20+Math.sin(a2)*r*.82,1.3,1.3);}
    // piercing na sobrancelha (lado direito da imagem) e brinco com pontinha (lado esquerdo)
    c.fillStyle='#e2e6ea';c.beginPath();c.arc(cx+ex+14,ey-21,2.4,0,6.283);c.arc(cx+ex+17,ey-11,2.4,0,6.283);c.fill();
    c.strokeStyle='#e2e6ea';c.lineWidth=2.2;c.beginPath();c.arc(83,162,5.5,0,6.283);c.stroke();c.fillStyle='#e2e6ea';c.beginPath();c.moveTo(80.5,166);c.lineTo(85.5,166);c.lineTo(83,175);c.fill();
  }

  if(X12&&X12.details)X12.details(c,cx,cy,my,mood);
  if(X12&&X12.hair)X12.hair(c,cx,cy,hw,hh,p);
  if(X12&&X12.over)X12.over(c,cx,cy,ey,ex);
  // cabelo da frente / chapéu
  if(who==='rafa'){
    // cabelo ondulado e fofo, volume em cima e dos lados, franja comprida em mechas que chegam na sobrancelha
    const H=p.hair, HL='#7a5636', HD='#1c1009';
    const blob=(x,y,rx,ry,col)=>{c.fillStyle=col;c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.283);c.fill();};
    c.fillStyle=H;c.beginPath();c.moveTo(cx-hw-2,cy-6);c.bezierCurveTo(cx-hw-12,cy-hh-30,cx+hw+12,cy-hh-30,cx+hw+2,cy-6);c.quadraticCurveTo(cx+hw-6,cy-34,cx,cy-40);c.quadraticCurveTo(cx-hw+6,cy-34,cx-hw-2,cy-6);c.closePath();c.fill();
    for(const [x,y,rx,ry] of [[cx-44,cy-66,22,18],[cx-20,cy-84,26,16],[cx+8,cy-88,26,15],[cx+34,cy-76,24,17],[cx+52,cy-54,16,20],[cx-56,cy-40,14,22],[cx+58,cy-30,10,18],[cx-60,cy-18,9,16]])blob(x,y,rx,ry,H);
    // franja: mechas onduladas com pontas enroladas, mais compridas no meio-esquerda
    const lock=(x,y,len,bend,w)=>{c.beginPath();c.moveTo(x-w,y);c.bezierCurveTo(x-w+bend,y+len*.4,x-w-bend*.5,y+len*.7,x+bend,y+len);c.bezierCurveTo(x+w-bend*.3,y+len*.7,x+w+bend,y+len*.35,x+w,y);c.closePath();c.fill();};
    c.fillStyle=H;
    for(const [x,len,bend,w] of [[cx-44,22,-5,11],[cx-30,30,5,11],[cx-15,32,-6,11],[cx-1,30,6,10],[cx+14,26,-5,10],[cx+28,22,4,10],[cx+42,18,-4,9]])lock(x,cy-50,len,bend,w);
    c.strokeStyle=H;c.lineWidth=4;c.lineCap='round';for(const [x,y,d] of [[cx-30,cy-20,1],[cx-14,cy-18,-1],[cx+2,cy-20,1],[cx+16,cy-24,-1]]){c.beginPath();c.arc(x+d*3,y,4,d>0?Math.PI*1.6:Math.PI*-.6,d>0?Math.PI*.6:Math.PI*.6+Math.PI);c.stroke();}
    // textura: ondas claras nas pontas e sombras perto da raiz
    c.fillStyle='rgba(122,86,54,.28)';for(const [x,y,rx,ry,r] of [[cx-26,cy-80,20,7,-.3],[cx+14,cy-84,18,6,.2],[cx+38,cy-66,12,6,.6],[cx-48,cy-56,10,6,-.8]]){c.beginPath();c.ellipse(x,y,rx,ry,r,0,6.283);c.fill();}
    c.strokeStyle='rgba(122,86,54,.55)';c.lineWidth=2;for(let i=0;i<12;i++){const x=cx-48+Math.random()*96,y=cy-90+Math.random()*36;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+6,y+6,x+1,y+13);c.stroke();}
    c.strokeStyle=HD;c.lineWidth=1.8;for(let i=0;i<14;i++){const x=cx-48+Math.random()*96,y=cy-60+Math.random()*22;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x-5,y+6,x+1,y+13);c.stroke();}
    c.strokeStyle='rgba(122,86,54,.5)';c.lineWidth=1.5;for(const [x,y] of [[cx-26,cy-28],[cx-6,cy-26],[cx+12,cy-30]]){c.beginPath();c.arc(x,y,4,.4,2.7);c.stroke();}
    c.lineCap='butt';
  }
  if(who==='edu'){
    // cabelo comprido ondulado até a mandíbula, risca no meio, pontas viradas pra fora
    c.fillStyle=p.hair;
    for(const s of [-1,1]){c.beginPath();c.moveTo(cx+s*2,cy-hh-4);c.bezierCurveTo(cx+s*40,cy-hh-6,cx+s*(hw+14),cy-50,cx+s*(hw+8),cy-4);
      c.quadraticCurveTo(cx+s*(hw+12),cy+40,cx+s*(hw+22),cy+54);c.quadraticCurveTo(cx+s*(hw+6),cy+56,cx+s*(hw-2),cy+30);
      c.quadraticCurveTo(cx+s*(hw-8),cy-20,cx+s*(hw-20),cy-40);c.quadraticCurveTo(cx+s*24,cy-58,cx+s*4,cy-62);c.closePath();c.fill();}
    c.strokeStyle='rgba(140,100,60,.45)';c.lineWidth=2;for(let i=0;i<10;i++){const s=i%2?1:-1,x=cx+s*(14+Math.random()*34),y=cy-70+Math.random()*60;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+s*8,y+12,x+s*4,y+24);c.stroke();}
    c.strokeStyle='rgba(0,0,0,.3)';c.lineWidth=1.5;c.beginPath();c.moveTo(cx,cy-hh-2);c.lineTo(cx+2,cy-58);c.stroke();
  }
  if(who==='matheus'){
    // cabelo curto, volume em cima
    c.fillStyle=p.hair;c.beginPath();c.moveTo(cx-hw-2,cy-14);c.bezierCurveTo(cx-hw-6,cy-hh-26,cx+hw+6,cy-hh-26,cx+hw+2,cy-14);c.quadraticCurveTo(cx+hw-6,cy-40,cx,cy-48);c.quadraticCurveTo(cx-hw+6,cy-40,cx-hw-2,cy-14);c.closePath();c.fill();
    for(const [x,y,rx,ry] of [[cx-30,cy-hh-6,22,14],[cx,cy-hh-12,26,15],[cx+30,cy-hh-6,22,14],[cx-48,cy-46,12,14],[cx+48,cy-46,12,14]]){c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.283);c.fill();}
    c.strokeStyle='rgba(90,70,50,.35)';c.lineWidth=1.6;for(let i=0;i<12;i++){const x=cx-40+Math.random()*80,y=cy-hh-14+Math.random()*24;c.beginPath();c.moveTo(x,y);c.lineTo(x+4,y+8);c.stroke();}
  }
  if(who==='cida'){c.fillStyle=p.hair;c.beginPath();c.moveTo(cx-hw-4,cy+4);c.bezierCurveTo(cx-hw-8,cy-hh-12,cx+hw+8,cy-hh-12,cx+hw+4,cy+4);c.quadraticCurveTo(cx+hw-6,cy-34,cx+10,cy-44);c.quadraticCurveTo(cx-14,cy-36,cx-hw+6,cy-30);c.closePath();c.fill();
    c.strokeStyle='rgba(0,0,0,.1)';c.lineWidth=1.5;for(let i=0;i<7;i++){c.beginPath();c.moveTo(cx-40+i*12,cy-64);c.quadraticCurveTo(cx-44+i*12,cy-40,cx-50+i*14,cy-20);c.stroke();}}
  if(who==='helena'){c.fillStyle=p.hair;c.beginPath();c.moveTo(cx-hw-4,cy+6);c.bezierCurveTo(cx-hw-8,cy-hh-14,cx+hw+8,cy-hh-14,cx+hw+4,cy+6);
    c.lineTo(cx+hw-4,cy-16);c.quadraticCurveTo(cx+hw-12,cy-40,cx+8,cy-48);c.lineTo(cx+2,cy-40);c.quadraticCurveTo(cx-18,cy-44,cx-hw+8,cy-26);c.lineTo(cx-hw+4,cy-8);c.closePath();c.fill();
    c.strokeStyle=p.hair;c.lineWidth=2;c.beginPath();c.moveTo(cx+hw-8,cy-24);c.quadraticCurveTo(cx+hw-2,cy,cx+hw-10,cy+18);c.stroke();}
  if(who==='tiao'){c.fillStyle='#1f2a44';c.beginPath();c.ellipse(cx,cy-46,hw+6,30,0,Math.PI,0);c.fill();c.fillRect(cx-hw-6,cy-48,hw*2+12,8);
    c.fillStyle='#111827';c.beginPath();c.moveTo(cx-hw-8,cy-40);c.quadraticCurveTo(cx,cy-24,cx+hw+8,cy-40);c.lineTo(cx+hw+4,cy-44);c.lineTo(cx-hw-4,cy-44);c.closePath();c.fill();
    c.fillStyle='#c9a24a';c.beginPath();c.moveTo(cx,cy-74);c.lineTo(cx+9,cy-66);c.lineTo(cx,cy-56);c.lineTo(cx-9,cy-66);c.closePath();c.fill();}
  if(who==='piloto'){g=c.createRadialGradient(cx-20,cy-40,10,cx,cy-10,90);g.addColorStop(0,'#6a7444');g.addColorStop(1,'#2e331e');c.fillStyle=g;c.beginPath();c.ellipse(cx,cy-12,72,80,0,0,6.283);c.fill();
    c.fillStyle=skin;c.beginPath();c.ellipse(cx,cy+48,36,24,0,0,Math.PI);c.fill();
    g=c.createLinearGradient(0,cy-40,0,cy+30);g.addColorStop(0,'#2a3440');g.addColorStop(1,'#0a0e12');c.fillStyle=g;c.beginPath();c.ellipse(cx,cy+4,56,34,0,0,6.283);c.fill();
    c.fillStyle='rgba(180,220,255,.25)';c.beginPath();c.ellipse(cx-20,cy-6,22,8,-.3,0,6.283);c.fill();
    c.strokeStyle='#111';c.lineWidth=4;c.beginPath();c.moveTo(cx+52,cy+20);c.quadraticCurveTo(cx+40,cy+56,cx+10,cy+58);c.stroke();c.fillStyle='#111';c.beginPath();c.arc(cx+8,cy+58,5,0,6.283);c.fill();}
  if(who==='arantes'){
    // óculos finos e o capuz do traje com visor
    c.strokeStyle='#2a2c30';c.lineWidth=2.4;for(const s of [-1,1]){c.beginPath();c.ellipse(cx+s*ex,ey,15,11,0,0,6.283);c.stroke();}c.beginPath();c.moveTo(cx-9,ey);c.lineTo(cx+9,ey);c.stroke();
    c.fillStyle='rgba(120,116,108,.9)';c.beginPath();c.ellipse(cx,cy-60,46,14,0,Math.PI,0);c.fill();
    g=c.createRadialGradient(cx-30,cy-50,10,cx,cy,120);g.addColorStop(0,'#eceadc');g.addColorStop(1,'#a8a690');c.fillStyle=g;
    c.beginPath();c.ellipse(cx,cy-2,96,112,0,0,6.283);c.moveTo(cx+60,cy+8);c.ellipse(cx,cy+8,60,70,0,0,6.283);c.fill('evenodd');
    c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=3;c.beginPath();c.ellipse(cx,cy+8,60,70,0,0,6.283);c.stroke();
    c.fillStyle='rgba(170,215,240,.13)';c.beginPath();c.ellipse(cx,cy+8,60,70,0,0,6.283);c.fill();
    c.strokeStyle='rgba(255,255,255,.35)';c.lineWidth=4;c.beginPath();c.ellipse(cx,cy+8,52,62,0,Math.PI*1.08,Math.PI*1.38);c.stroke();
    c.fillStyle='#4a4d50';c.beginPath();c.arc(cx+70,cy+70,14,0,6.283);c.fill();
  }
  if(who==='guarda'){
    g=c.createRadialGradient(cx-24,cy-44,10,cx,cy-10,96);g.addColorStop(0,'#3a4046');g.addColorStop(1,'#14171a');c.fillStyle=g;c.beginPath();c.ellipse(cx,cy-14,74,82,0,0,6.283);c.fill();
    c.fillStyle='#1c1f22';c.beginPath();c.ellipse(cx,cy+18,58,52,0,0,6.283);c.fill();
    for(const s of [-1,1]){c.fillStyle='#0a0c0e';c.beginPath();c.arc(cx+s*26,cy+2,17,0,6.283);c.fill();c.fillStyle='rgba(120,200,190,.35)';c.beginPath();c.arc(cx+s*26,cy+2,13,0,6.283);c.fill();c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.arc(cx+s*26-5,cy-3,3.5,0,6.283);c.fill();}
    c.fillStyle='#2a2e32';c.beginPath();c.ellipse(cx,cy+52,20,22,0,0,6.283);c.fill();c.strokeStyle='#121416';c.lineWidth=2;for(let k=-12;k<=12;k+=6){c.beginPath();c.moveTo(cx+k,cy+38);c.lineTo(cx+k,cy+66);c.stroke();}
    c.fillStyle='#2e8a78';c.fillRect(cx-30,cy-74,60,8);
  }
  // vinheta
  g=c.createRadialGradient(cx,cy+20,90,cx,cy+40,230);g.addColorStop(0,'rgba(0,0,0,0)');g.addColorStop(1,'rgba(0,0,0,.75)');c.fillStyle=g;c.fillRect(0,0,W2,H2);
  if(radio){
    c.fillStyle='rgba(40,90,60,.28)';c.fillRect(0,0,W2,H2);
    for(let y=0;y<H2;y+=3){c.fillStyle=`rgba(0,0,0,${.25+Math.random()*.2})`;c.fillRect(0,y,W2,1);}
    for(let i=0;i<9;i++){const y=Math.random()*H2;c.fillStyle='rgba(200,255,220,.12)';c.fillRect(0,y,W2,2+Math.random()*4);}
    c.fillStyle='rgba(200,255,220,.85)';c.font='700 16px "Barlow Condensed",sans-serif';c.fillText('● CANAL 7',14,26);
  }
}

// ===================== DIÁLOGOS =====================
const DLG={lines:[],i:0,typing:false,timer:null,full:'',shown:0,onEnd:null,right:null,pending:[],choosing:false};
function speakerName(w,radio){if(w==='helena'&&radio&&!G.flags.metHelena)return 'Voz no rádio';return PCH[w]?PCH[w].name:w;}
UI.talk=function(lines,onEnd){
  if(UI.cur&&UI.cur!=='talk'){DLG.pending.push([lines,onEnd]);return;}
  if(UI.cur==='talk'){DLG.pending.push([lines,onEnd]);return;}
  DLG.lines=lines.slice();DLG.i=0;DLG.onEnd=onEnd||null;DLG.choosing=false;
  DLG.right=(lines.find(l=>l.w&&l.w!=='rafa')||{}).w||null;
  const rightLine=lines.find(l=>l.w===DLG.right);
  const rp=DLG.right?portraitURL(DLG.right,'n',rightLine&&rightLine.radio):'';
  this.open(`<div class="vn" role="dialog" aria-label="Conversa">
    <button class="vn-skip" data-a="vnskip">Pular</button>
    <div class="vn-stage"><figure class="vn-por left" id="vnL"><img alt="" src="${portraitURL('rafa','n')}"><figcaption>${PCH.rafa.name}</figcaption></figure>
    ${DLG.right?`<figure class="vn-por right" id="vnR"><img alt="" src="${rp}"><figcaption>${esc(speakerName(DLG.right,rightLine&&rightLine.radio))}</figcaption></figure>`:'<span></span>'}</div>
    <div class="vn-box" id="vnBox"><div class="vn-name" id="vnName"></div><p class="vn-text" id="vnText" aria-live="polite"></p><div class="vn-choices" id="vnCh"></div><span class="vn-next" id="vnNext" aria-hidden="true">▼</span></div>
  </div>`,'vn-ov','talk');
  dlgStep();
};
function dlgStep(){
  const L=DLG.lines[DLG.i];
  if(!L){dlgEnd();return;}
  if(L.do){try{L.do();}catch(e){} DLG.i++;return dlgStep();}
  const box=document.getElementById('vnBox'); if(!box)return;
  const ch=document.getElementById('vnCh'), nm=document.getElementById('vnName'), tx=document.getElementById('vnText'), nx=document.getElementById('vnNext');
  if(L.choice){
    DLG.choosing=true; if(nx)nx.hidden=true;
    ch.innerHTML=L.choice.map((o,k)=>`<button class="vn-choice" data-a="vnc" data-k="${k}"><span>${k+1}</span>${esc(o.t)}</button>`).join('');
    if(!IN.touch){const b=ch.querySelector('button');if(b)b.focus({preventScroll:true});}
    return;
  }
  DLG.choosing=false; ch.innerHTML=''; if(nx)nx.hidden=true;
  const left=L.w==='rafa'; const pl=document.getElementById('vnL'), pr=document.getElementById('vnR');
  if(pl){pl.classList.toggle('on',left);if(left)pl.querySelector('img').src=portraitURL('rafa',L.m||'n');}
  if(pr){pr.classList.toggle('on',!left);if(!left){pr.querySelector('img').src=portraitURL(L.w,L.m||'n',L.radio);pr.querySelector('figcaption').textContent=speakerName(L.w,L.radio);}}
  nm.textContent=L.w==='rafa'&&L.think?'Richard (pensando)':speakerName(L.w,L.radio); nm.className='vn-name'+(left?'':' r');
  tx.className='vn-text'+(L.think?' think':'');
  DLG.full=L.t; DLG.shown=0; DLG.typing=true; tx.textContent='';
  clearInterval(DLG.timer);
  const voice=(PCH[L.w]||{voice:200}).voice;
  DLG.timer=setInterval(()=>{
    DLG.shown+=2; const t=document.getElementById('vnText'); if(!t){clearInterval(DLG.timer);return;}
    t.textContent=DLG.full.slice(0,DLG.shown);
    if(DLG.shown%4===0)AU.blip(voice,L.radio);
    if(DLG.shown>=DLG.full.length){clearInterval(DLG.timer);DLG.typing=false;const n=document.getElementById('vnNext');if(n)n.hidden=false;}
  },24);
}
function dlgAdvance(){
  if(UI.cur!=='talk'||DLG.choosing)return;
  if(DLG.typing){clearInterval(DLG.timer);DLG.typing=false;const t=document.getElementById('vnText');if(t)t.textContent=DLG.full;const n=document.getElementById('vnNext');if(n)n.hidden=false;return;}
  DLG.i++; dlgStep();
}
function dlgChoose(k){
  const L=DLG.lines[DLG.i]; if(!L||!L.choice)return; const o=L.choice[k]; if(!o)return;
  AU.ui(); DLG.choosing=false;
  if(o.do)try{o.do();}catch(e){}
  DLG.lines.splice(DLG.i+1,0,...(o.then||[]));
  DLG.i++; dlgStep();
}
function dlgSkip(){
  if(UI.cur!=='talk')return; clearInterval(DLG.timer); DLG.typing=false;
  while(DLG.i<DLG.lines.length){const L=DLG.lines[DLG.i];if(L.choice){dlgStep();return;}if(L.do){try{L.do();}catch(e){}}DLG.i++;}
  dlgEnd();
}
function dlgEnd(){
  clearInterval(DLG.timer); const cb=DLG.onEnd; DLG.onEnd=null;
  UI.close(); if(cb)cb();
}
// falas curtas durante a ação (não pausam o jogo)
const BARK={q:[],cur:null,t:0,shown:0,el:null};
function bark(w,m,t,o={}){BARK.q.push({w,m,t,radio:!!o.radio,dur:o.dur||Math.max(2.8,t.length*.055+1.6)});}
function updBark(dt){
  if(!BARK.el){BARK.el=document.getElementById('bark');if(!BARK.el)return;}
  const el=BARK.el;
  el.hidden=true;
  if(!BARK.cur&&BARK.q.length&&(G.mode==='play')&&!(typeof CUT!=='undefined'&&CUT.on)){
    BARK.cur=BARK.q.shift();BARK.t=0;BARK.shown=0;
  }
  if(!BARK.cur){if(!el.hidden&&BARK.t<=0)el.hidden=true;return;}
  if(G.mode!=='play')return;
  BARK.t+=dt; const b=BARK.cur;
  if(BARK.shown<b.t.length){const n=Math.min(b.t.length,Math.floor(BARK.t*55));if(n>BARK.shown){if(Math.floor(n/4)>Math.floor(BARK.shown/4))AU.blip((PCH[b.w]||{voice:200}).voice,b.radio);BARK.shown=n;el.querySelector('p').textContent=b.t.slice(0,n);}}
  if(BARK.t>b.dur){BARK.cur=null;BARK.t=0;el.hidden=true;}
}

// ===================== HISTÓRIA =====================
const L_=(w,m,t,o={})=>Object.assign({w,m,t},o);
const STORY={
  intro(){
    const lines=([
      L_('cida','s','Fecha a porta, menino. Devagar... isso. Eles escutam tudo.'),
      L_('rafa','s','O cara do quiosque... ele mordeu o pescoço de uma turista. No meio da Avenida Brasil. Eu vi.'),
      L_('cida','t','Não é mais o cara do quiosque. Faz três horas que ninguém nessa cidade é mais ninguém.'),
      {choice:[
        {t:'O que está acontecendo?',then:[
          L_('cida','n','O rádio chama de "gripe cinza". Começou na Vértice, aquele laboratório do Porto de Itajaí. Meu marido trabalhou lá vinte anos.'),
          L_('cida','t','Ele sempre dizia que um dia ia dar nisso. Morreu antes de ver. Deus foi bom com ele.'),
          L_('rafa','n','E o Exército?'),
          L_('cida','n','Fecharam a Estrada da Rainha e a BR-101. Ninguém sai de Balneário.')]},
        {t:'Eu preciso sair daqui.',then:[
          L_('cida','n','Todo mundo precisa. O rádio fala de um helicóptero no Porto de Itajaí. O último voo, antes de bombardearem tudo.'),
          L_('rafa','s','Itajaí? Isso é depois da Brava. A pé eu não chego nunca.'),
          L_('cida','t','Não chega.')]},
      ]},
      L_('cida','n','O Tião da oficina, lá na Barra Sul, tem um jipe velho. Daqueles que passam por cima de qualquer coisa.'),
      L_('cida','n','Se alguém atravessa aquela barricada da Estrada da Rainha, é aquele jipe.'),
      L_('rafa','s','Eu não tenho nem uma arma, Dona Cida.'),
      L_('cida','t','Ninguém aqui tem. O seu Moacir, do prédio da frente, cozinhava pra família toda. Tem faca naquela cozinha.'),
      L_('cida','n','E escuta: eles enxergam mal no escuro. Lanterna apagada, passo leve, que eles passam do seu lado. Correndo, eles escutam.'),
      L_('cida','t','De dia eles se enfiam nos prédios, no escuro dos apartamentos. De noite a rua é deles. Escolhe bem a hora de sair.'),
      L_('cida','t','E menino... aquela máquina de escrever. Se for sair, deixa registrado o que você fez. Pra alguém saber, se você não voltar.'),
      L_('cida','n','Mais uma coisa. Cuidado com quem está deitado no chão. Nem tudo que cai, fica.'),
      L_('rafa','n','...Valeu, Dona Cida. De verdade.'),
      L_('cida','h','Vai. E volta pra contar.'),
    ]);
    STORY.introStage(lines);
  },
  npc(n){
    const F=G.flags;
    if(n.id==='eduC'||n.id==='eduV'||n.id==='matH')return STORY.npc2(n);
    if(n.id==='cida'){
      if(F.catDone)return STORY.chat(L_('cida','h',rpick(['O Mingau dorme no meu travesseiro agora. Ingrato. Te devo essa, menino.','Volta sempre que precisar descansar. A luz verde segura eles lá fora.','Eu rezei por você. Não sei se adianta, mas rezei.'])));
      if(invCount('gato')>0)return UI.talk([
        L_('rafa','h','Olha quem eu achei no coreto da Praça Tamandaré. Me arranhou três vezes.'),
        L_('cida','h','MINGAU! Ai, seu ingrato... vem cá, vem.'),
        L_('cida','t','Desculpa, menino. É que... é a única coisa viva que sobrou da minha casa.'),
        {do:()=>{invRemove('gato',1);F.catDone=true;ach('mingau');G.mh=Math.min(8,(G.mh||6)+1);const l=invAdd('ervaV',2);if(l)boxAdd('ervaV',l);AU.pickup();toast('Você ganhou uma bolsa de couro (mais uma fileira na maleta) e duas ervas verdes.');}},
        L_('cida','n','Toma. A bolsinha do meu falecido e duas ervas da sacada. Você trouxe um pedaço da minha vida de volta.'),
      ]);
      if(!F.askedCat)return UI.talk([
        {do:()=>{F.askedCat=true;}},
        L_('cida','t','Menino... posso te pedir uma coisa? É bobagem, eu sei.'),
        L_('cida','t','O Mingau, meu gato. Fugiu quando começaram os gritos. Ele adora o coreto da Praça Tamandaré, aqui pertinho.'),
        {choice:[
          {t:'Eu procuro ele.',then:[L_('cida','h','Deus te abençoe. Eu tenho uma bolsinha de couro do meu falecido que vai te servir.')]},
          {t:'Dona Cida, é só um gato...',then:[L_('cida','t','É só um gato. É tudo que me sobrou.'),L_('rafa','t','...Eu vejo o que dá pra fazer.')]},
        ]},
      ]);
      return STORY.chat(L_('cida','n',rpick(['A oficina do Tião fica na Barra Sul, na Avenida Brasil. Desce reto.','O Mingau gosta do coreto da praça. Se ouvir um miado bravo, é ele.','Lembra: a máquina de escrever. Deixa registrado.','O padre da Santa Inês guardava uma faca de churrasco atrás do altar. Vai que...'])));
    }
    if(n.id==='tiao'){
      if(F.batDone&&V.dead&&!F.bloqueio)return STORY.stage(STORY.preNear('tiao'),[
        L_('tiao','a','Você QUEIMOU o meu jipe?'),
        L_('rafa','s','Eles vieram de todo lado, seu Tião. Eu bati, pegou fogo, eu saí correndo.'),
        L_('tiao','t','...Trinta anos de oficina e o garoto me queima o jipe numa noite.'),
        L_('tiao','n','Tem outro motor no depósito de peças. Me dá meia hora. Fica aqui dentro, na luz verde.'),
        {do:()=>{const j=LM.jipe||{x:V.x,y:V.y};Object.assign(V,{x:j.x,y:j.y,ang:-Math.PI/2,spd:0,hp:V.max*.7,ok:true,dead:false});G.clock+=30;AU.unlock();AU.rev(1);toast('O Tião remontou o jipe. Meia hora se passou.');}},
        L_('tiao','h','Pronto. Ronca pior que antes, mas ronca. Dessa vez, desvia deles.'),
      ]);
      if(F.batDone)return STORY.chat(L_('tiao','n',rpick(['O jipe tá na frente da oficina. Pega distância antes da barricada, garoto. Pé no fundo.','Esse motor tá cansado. Não espera correr muito com ele, não.','Se o grandalhão aparecer, não tenta ganhar. Tenta sumir.','Apaga a lanterna quando ouvir eles por perto. No escuro eles são cegos que nem toupeira.'])));
      if(invCount('bateria')>0)return STORY.stage(STORY.preNear('tiao'),[
        L_('rafa','n','A bateria do posto da Avenida do Estado. O Juninho tinha guardado.'),
        L_('tiao','s',F.boss_gordo?'E o Gordo do caixa?':'Você passou pelo Gordo do caixa? Vivo?'),
        L_('rafa','t',F.boss_gordo?'Não incha mais.':'Passei no escuro. Do lado dele. Ele respirava que nem um fole.'),
        L_('tiao','h','Garoto de sorte. Me dá isso aqui.'),
        {do:()=>{invRemove('bateria',1);F.batDone=true;F.jipe=true;ach('jipe');V.ok=true;if(V.hp<V.max*.5)V.hp=V.max*.5;F.mapAll=true;explored.fill(1);const l=invAdd('gran',1);if(l)boxAdd('gran',l);AU.unlock();AU.engine(.5);setTimeout(()=>AU.engine(0),1400);}},
        L_('tiao','n','...Ouviu isso? Ainda ronca. Fraco, mas ronca. Não vai passar de sessenta, setenta por hora.'),
        L_('tiao','n','Marquei o caminho no seu mapa: Barra Norte, Estrada da Rainha, Brava. Itajaí fica depois de Cabeçudas, mas a Vértice fechou a estrada.'),
        L_('tiao','a','A barricada do Exército fica no fim da Barra Norte, depois do acampamento que eles largaram. Pega embalo e não tira o pé.'),
        L_('tiao','t','Eu fico. Alguém tem que manter essa luz verde acesa pra quem vier depois.'),
        L_('tiao','n','Leva essa granada. É a única que eu tenho.'),
        {do:()=>toast('O jipe está pronto. Mapa revelado. Você ganhou uma granada de mão.')},
      ],[...STORY.postJeep(),...STORY.eduArrive()]);
      if(!F.metTiao)return STORY.stage(STORY.preStartle('tiao'),[
        {do:()=>{F.metTiao=true;}},
        L_('tiao','a','Quieto! Fecha essa porta. Devagar.'),
        L_('rafa','s','Desculpa... achei que o senhor era um deles.'),
        L_('tiao','n','Tião. Essa oficina é minha há trinta anos. A Cida te mandou? Então você é gente boa.'),
        {choice:[
          {t:'Preciso do seu jipe.',then:[
            L_('tiao','n','O jipe tá ali na frente. Motor bom, pneu bom. A bateria morreu ontem, antes de tudo isso.'),
            L_('tiao','n','O Juninho, do posto da Avenida do Estado, separou uma nova pra mim. Tá na loja de conveniência.')]},
          {t:'Como o senhor sobreviveu até agora?',then:[
            L_('tiao','n','No escuro. Eles enxergam mal sem luz, garoto. Só te acham se você esbarrar neles ou fizer barulho.'),
            L_('tiao','n','Se apertar, entra num armário, numa caçamba, num carro largado. Prende a respiração. Eles passam.')]},
        ]},
        L_('tiao','s','Mas o posto virou ninho. O Gordo do caixa ficou doente ontem e agora... cresceu. Fica parado no meio das bombas.'),
        L_('tiao','n','De mão vazia você não chega perto. O Bastos, da Delegacia, guardava uma pistola no arsenal. A trava é elétrica, queimou o fusível.'),
        L_('tiao','n','O supermercado Bom Preço tinha fusível de reserva. Ou vai no escuro e reza.'),
      ],[{do:()=>{const t=npcs.find(n=>n.id==='tiao');if(t)t.busy=false;}}]);
      return STORY.chat(L_('tiao','n',P.owned[1]?'Tem pistola agora? Então vai buscar a bateria. Posto da Avenida do Estado.':'A pistola do Bastos tá no arsenal da Delegacia. O fusível, no supermercado.'));
    }
    if(n.id==='helena'){
      if(!F.metHelena)return STORY.stage(STORY.preHelena(),[
        {do:()=>{F.metHelena=true;F['pw'+clinicB()]=false;G.flick=.3;}},
        L_('helena','k',F.walkie?'Richard... você é mais novo do que a voz no rádio.':'Não atira... por favor. Eu sou médica. Era médica.'),
        L_('rafa','s','Você tá... você tá cinza.'),
        L_('helena','k','Mordida. Duas da manhã. Eu tomei o que tinha do inibidor da Vértice. Acabou.'),
        L_('helena','t','E a clínica tá sem luz desde a meia-noite. O gerador secou. Sem energia eu não ligo nem a centrífuga pra ver o meu sangue.'),
        ...(F.eduJoin?[L_('edu','s','Doutora, a senhora tá... a senhora vai virar?'),L_('helena','k','Ainda não, rapaz. Me arruma luz e eu te digo quanto tempo eu tenho.')]:[]),
        L_('helena','n','O Resort Brava Mar, aqui do lado. O gerente vivia se gabando do gerador dele. Tem diesel na casa de máquinas.'),
        L_('helena','s','A porta de serviço só abre com o cartão mestre. E o gerente... ele se trancou num dos quartos quando começou.'),
        ...(F.eduJoin?[L_('edu','t','Richard... meu tornozelo travou desde a batida na barricada. Eu fico aqui com ela. Se ela piorar, eu te chamo.'),
          L_('rafa','t','Fica. E não deixa ela sozinha.'),{do:()=>{F.eduFollow=false;F.eduClinic=true;dropComp('edu');}}]:[]),
        L_('helena','s','E Richard... tem um homem de sobretudo andando pela Brava desde ontem. Se ele aparecer, não para pra olhar. Corre.'),
      ]);
      if(F.clinicPower&&!F.inibidorDone&&invCount('inibidor')>0)return STORY.stage(STORY.preNear('helena'),[
        L_('rafa','n','V-7. Uma ampola só. A Vértice levou o resto do hospital pro shopping... e soltou uma coisa atrás de mim.'),
        L_('helena','k',F.boss_especime?'O T-07... e você está aqui, inteiro. Ninguém volta disso, Richard.':'...Você voltou. Ninguém volta.'),
        ...(F.shopEv?[L_('rafa','a','Um tal de Arantes. Ele disse que o projeto continua.'),L_('helena','t','Rodrigo Arantes. Fui eu que ensinei ele a mentir pra imprensa.')]:[]),
        {walk:'helena',to:'rafa',ox:-18,spd:50},{fx:'flash',v:.35},{sfx:'hide',v:1},
        {do:()=>{invRemove('inibidor',1);F.inibidorDone=true;const l=invAdd('cartao',1);if(l)boxAdd('cartao',l);AU.pickup();P.max=Math.max(P.max,120);P.hp=P.max;toast('Você recebeu o Cartão da Vértice. Helena aplicou uma dose em você também: vida máxima aumentou.');}},
        L_('helena','h','Pronto. A cor volta em dez minutos. Toma, metade da última ampola é sua. Por precaução.'),
        L_('helena','n','E o cartão da Vértice. Cabeçudas fica ao norte. Depois do bloqueio, Itajaí.'),
        L_('helena','s','Daqui pra frente vai ter mais deles, Richard. Mas também mais coisa largada pelo caminho: polícia, Exército, gente que fugiu. Junta tudo.'),
        L_('helena','t','Quando o helicóptero pousar... me leva com você?'),
        {choice:[
          {t:'Você vem comigo.',do:()=>{F.helena='levar';},then:[L_('helena','h','Eu conheço a trilha pela costa. Te espero no heliponto.'),L_('rafa','t','Ela ainda está tossindo. Será que eu fiz a coisa certa?',{think:true}),{do:()=>{F.helenaGone=true;}}]},
          {t:'Não posso arriscar. Desculpa.',do:()=>{F.helena='ficar';},then:[L_('helena','t','...Eu sei. Eu faria o mesmo.'),L_('helena','n','Vai. Antes que eu mude de ideia sobre te ajudar.')]},
        ]},
        ...(F.eduJoin&&F.eduFollow?[L_('edu','t','Richard... eu vou ficar. Alguém tem que cuidar dela até o helicóptero. Tu acha o Matheus.'),
          L_('rafa','a','Edu...'),L_('edu','h','Vai logo, antes que eu desista. A gente se vê no porto.')]:[]),
        ...(F.eduJoin&&F.eduVan?[L_('helena','n','O seu amigo, o Edu, passou aqui antes de você. Disse que fica comigo até o fim. Teimoso.')]:[]),
        {do:()=>{if(F.eduJoin){F.eduFollow=false;F.eduVan=false;F.eduClinic=true;dropComp('edu');}}},
      ]);
      if(!F.clinicPower)return STORY.chat(L_('helena','k',rpick(['O resort é aqui do lado. Recepção primeiro: o gerente anotava tudo no livro de hóspedes.','Diesel, Richard. Sem luz eu não sei nem quanto tempo eu tenho.','*tosse* ...vai. Eu tô bem. Eu tô bem.'])));
      if(!F.inibidorDone)return STORY.chat(L_('helena','k',F.transfer?rpick(['Shopping Atlântico... a drogaria. Se a Vértice estiver lá, não confia em ninguém de branco.','O Arantes recolhe tudo que dá errado. Inclusive gente.','Anda, Richard. Tô ouvindo eles dentro da minha cabeça.']):rpick(['Hospital Ruth Cardoso... farmácia, ala leste... rápido.','Tô ouvindo eles dentro da minha cabeça, Richard. Anda.','Se a enfermeira aparecer, apaga a luz e some.'])));
      return STORY.chat(L_('helena','t','Chama o resgate. E não olha pra trás, Richard.'));
    }
  },
  onPickup(id){
    const F=G.flags;
    if(id==='fusivel')bark('rafa','s','Isso deve ligar o quadro da Delegacia... por que ficou tudo escuro?');
    if(id==='heliKey'){if(F.walkie)bark('helena','s','Richard! As luzes do laboratório... não fui eu. Ela está acordando nos armazéns.',{radio:true});else bark('rafa','s','Apagou tudo. Tem alguma coisa respirando aqui dentro.');}
    if(id==='gato')bark('rafa','h','Achei você, Mingau. Para de me arranhar, eu tô te salvando.');
    if(id==='bateria'&&G.flags.postoLeak)return;
    if(id==='inibidor')bark('rafa','s','Gelado... ainda tá gelado. Agora sai daqui, sai daqui.');
    if(id==='bateria')STORY.postoLeak();
    if(id==='diesel')STORY.dieselAmbush();
    if(id==='cartaoMestre')bark('rafa','s','O cartão... tava no bolso do gerente. Do que sobrou do gerente.');
    if(id==='chaveMaq')bark('rafa','n','"Casa de máquinas". Ala de serviço, no fundo do shopping.');
    if(id==='alicate')bark('matheus','s','Isso! Agora a corrente dos fundos. Devagar...');
    if(id==='chaveDir')bark('rafa','t','A chave da diretoria.');
  },
  // ---------- encenação das cutscenes ----------
  chat(L){bark(L.w,L.m||'n',L.t);},
  stage(pre,lines,post){playCut([...pre,...linesToSteps(lines),...(post||[])]);},
  introStage(lines){
    const c=npcs.find(n=>n.id==='cida'), D=LM.cidaDoor||{x:START.x,y:START.y-130}, out={x:D.x,y:D.y-3.4*TILE}, inside={x:D.x,y:D.y+2.6*TILE};
    const L=linesToSteps(lines); L.splice(3,0,{sfx:'knock'},{fx:'shake',v:4});
    playCut([
      {do:()=>{P.x=out.x;P.y=out.y;P.ang=P.legAng=Math.PI/2;P.lamp=true;if(c){c.ang=0;c.busy=true;}}},
      {spawn:'zumbi',x:D.x-2.4*TILE,y:D.y-3.8*TILE,id:'z1',ang:0},
      {spawn:'corr',x:D.x+3.6*TILE,y:D.y-3.4*TILE,id:'z2',ang:Math.PI},
      {cam:{x:D.x,y:D.y-2.4*TILE},t:.35},
      {say:'rafa',m:'s',t:'Abre! Abre a porta, pelo amor de Deus!',dur:1.2},
      {walk:'rafa',to:inside,spd:150,wait:false},
      {walk:'z1',to:{x:D.x-.6*TILE,y:D.y-1.3*TILE},spd:75,wait:false},
      {walk:'z2',to:{x:D.x+.8*TILE,y:D.y-1.2*TILE},spd:105},
      {fx:'slam'},{wait:.35},
      {say:'rafa',m:'s',think:true,t:'Fechou... fechou. Respira.',dur:1.3},
      {walk:'cida',to:'rafa',ox:24,spd:55},
      {startle:'rafa'},{face:'rafa',at:'cida'},
      ...L,
      {do:()=>{for(const id of ['z1','z2']){const z=CUT.actors[id];if(z){z.state='investigate';z.nx=z.x+rr(-420,420);z.ny=z.y-rr(120,300);z.it=20;}}if(c)c.busy=false;}},
    ]);
  },
  preStartle(id){
    return [
      {do:()=>{const n=npcs.find(n=>n.id===id);if(n){n.busy=true;n.ang=Math.atan2(n.y-P.y,n.x-P.x);}}},
      {emote:'rafa',k:'?'},{wait:.5},
      {walk:'rafa',to:id,ox:-34,oy:12,spd:55},
      {startle:id},{face:id,at:'rafa'},{fx:'shake',v:3},{startle:'rafa'},
    ];
  },
  preNear(id){return [{walk:'rafa',to:id,ox:-30,oy:10,spd:60},{face:'rafa',at:id}];},
  preHelena(){
    return [
      {do:()=>{const n=npcs.find(n=>n.id==='helena');if(n){n.busy=true;n.ang=-Math.PI/2+.4;}}},
      {cam:'helena',t:.8},{emote:'helena',k:'…',dur:1.6},{sfx:'hide',v:.6},
      {say:'helena',m:'k',think:false,t:'*tosse* ...não... de novo não...',dur:1.6},
      {walk:'rafa',to:'helena',ox:-36,oy:20,spd:50},
      {startle:'helena'},{face:'helena',at:'rafa'},{startle:'rafa'},
    ];
  },
  postJeep(){
    return [
      {walk:'tiao',to:{x:V.x-40,y:V.y-2},spd:80},
      {cam:{x:V.x,y:V.y},t:.6},
      {fx:'sparks',at:{x:V.x,y:V.y-14}},{wait:.4},{fx:'sparks',at:{x:V.x,y:V.y-14}},{sfx:'rev',v:1},{fx:'shake',v:3},
      {do:()=>{V.lightsT=2.5;}},{wait:.9},
      {say:'tiao',m:'h',t:'Hehe. Ainda ronca, a velha.',dur:1.6},
      {walk:'tiao',to:LM.tiaoHome||{x:V.x-300,y:V.y},spd:80},
      {do:()=>{const t=npcs.find(n=>n.id==='tiao');if(t)t.busy=false;}},
    ];
  },
  introBoss(e){
    const T={gordo:'É o Gordo do caixa... ele ocupa a porta inteira. Não posso deixar ele me ver.',enferm:'Tem uma coisa enorme no estacionamento... de touca de enfermeira. Ela tá vindo pra cá.',pescador:'Isso saiu do mar. Isso saiu do mar!'}[e.type];
    G.flags['seen_'+e.type]=true;
    const pre=e.type==='pescador'?[{fx:'splash',at:{x:e.x,y:e.y}},{fx:'shake',v:10}]:e.type==='enferm'?[{fx:'blackout',v:1.2},{fx:'shake',v:8}]:[];
    playCut([{npc:e,id:'boss'},{cam:{x:e.x,y:e.y},t:1.1},...pre,{sfx:'roar'},{fx:'shake',v:7},
      e.type==='enferm'?{walk:'boss',to:{x:e.x,y:e.y-70},spd:70}:{wait:.7},
      {say:'rafa',m:'s',think:e.type==='gordo',t:T,dur:2.4},{cam:{x:P.x,y:P.y},t:.4}]);
  },
  introPers(p){
    G.flags.persMet=true;
    playCut([{npc:p,id:'pers'},{fx:'blackout',v:.5},{cam:{x:p.x,y:p.y},t:1.2},{wait:.6},
      {walk:'pers',to:{x:p.x+(P.x-p.x)*.12,y:p.y+(P.y-p.y)*.12},spd:30},{sfx:'thud',v:1},{fx:'shake',v:5},
      {say:'rafa',m:'s',t:'Tem um homem parado ali... de sobretudo. Ele tá olhando pra mim.',dur:2.2},
      {say:'rafa',m:'a',think:true,t:'Corre. Corre agora.',dur:1.2}]);
  },
  // a guia de transferência: a Enfermeira acorda e o V-7 não está mais aqui
  onFile(id){
    const F=G.flags;
    if(id===16&&!F.transfer){
      F.transfer=true;
      G.blackout=1.2; AU.drag(1);
      laterF(()=>{bark('rafa','s',F.metHelena?'Transferido pro shopping... a Vértice veio buscar tudo antes de mim.':'Inibidor V-7... levaram tudo pro shopping. Não sei o que é isso, mas a Vértice queria muito.');},500);
      if(F.walkie)laterF(()=>{bark('helena','s','Shopping Atlântico? É o ponto de coleta deles. Se a Vértice estiver lá, Richard... não confia em ninguém de branco.',{radio:true});},9000);
    }
    if(id===17&&!F.manRead){F.manRead=true;laterF(()=>{bark('rafa','s','"Não tira a lanterna deles." Que tipo de conselho é esse?');},400);}
  },
  // Shopping Atlântico: a equipe do Dr. Arantes leva o V-7 e solta o T-07 no átrio
  shopEvent(){
    const F=G.flags; F.shopEv=true; if(F.eduFollow)STORY.eduToVan();
    const X=v=>tc(100+v), Y=v=>tc(276+v);
    const ar={id:'arantes',x:X(41),y:Y(2.2),ang:Math.PI/2,col:'#d8d4b8',hazmat:true},
      ci={id:'cient',x:X(38.5),y:Y(5),ang:Math.PI/2,col:'#d8d4b8',hazmat:true},
      gd={id:'guarda',x:X(44),y:Y(5.4),ang:Math.PI,col:'#1e2226',hazmat:true,mask:true,gun:'smg',pants:'#16181a'};
    cutNpcs.push(ar,ci,gd);
    const door={x:X(47.5),y:Y(4)}, out={x:X(52.6),y:Y(3.5)};
    playCut([
      {npc:ar,id:'arantes'},{npc:ci,id:'cient'},{npc:gd,id:'guarda'},
      {fx:'blackout',v:.5},{sfx:'thud',v:.6},
      {cam:{x:X(41),y:Y(6)},t:1.2},
      {say:'rafa',m:'s',think:true,t:'Tem luz lá dentro... e gente. Gente viva, de roupa branca.',dur:2.2},
      {walk:'cient',to:{x:X(42.5),y:Y(2.4)},spd:45},
      {say:'arantes',m:'n',t:'Lote V-7 confirmado. Catorze ampolas. Ninguém pode saber que isso existiu.'},
      {say:'guarda',m:'n',t:'Doutor. Civil no corredor.'},
      {face:'arantes',at:'rafa'},{face:'guarda',at:'rafa'},{startle:'rafa'},
      {say:'rafa',m:'s',t:'Ei! Espera! Eu preciso de uma dessas! Tem uma médica virando lá na Brava!'},
      {say:'arantes',m:'n',t:'Todo mundo está virando, rapaz. A diferença é quem assina a conta.'},
      {choice:[
        {t:'Abre essa grade.',then:[{say:'arantes',m:'n',t:'Não.'}]},
        {t:'Foram vocês que fizeram isso com a cidade.',then:[{say:'arantes',m:'n',t:'A Vértice deu emprego pra essa cidade por trinta anos. Hoje ela trabalha pra gente de outro jeito.'}]},
        {t:'A Helena me mandou.',then:[{say:'arantes',m:'a',t:'Helena... claro que ela está viva. Ela sempre dá um jeito.'},{say:'arantes',m:'n',t:'Diga a ela que o projeto continua. Se ela durar até lá.'}]},
      ]},
      {say:'arantes',m:'n',t:'Soltem o espécime. Limpeza completa.'},
      {say:'guarda',m:'n',t:'Com o civil aqui dentro?'},
      {say:'arantes',m:'n',t:'Principalmente com ele.'},
      {walk:'arantes',to:door,spd:90,wait:false},{walk:'cient',to:{x:door.x,y:door.y+24},spd:100,wait:false},
      {do:()=>{if(LM.shopFarm&&!pickups.some(p=>p.uid==='amp')){const [x,y]=freeTileNear((LM.shopFarm.x/TILE)|0,(LM.shopFarm.y/TILE)|0,false);pickups.push({uid:'amp',tx:x,ty:y,x:tc(x),y:tc(y),id:'inibidor',q:1,kind:'item'});pickOcc.add(idx(x,y));}AU.click();}},
      {walk:'guarda',to:{x:door.x-12,y:door.y+34},spd:90},
      {say:'rafa',m:'s',think:true,t:'Caiu uma ampola da maleta... rolou pra baixo do balcão. Atrás da grade.',dur:2.4},
      {walk:'arantes',to:out,spd:110,wait:false},{walk:'cient',to:out,spd:110,wait:false},{walk:'guarda',to:out,spd:110},
      {do:()=>{cutNpcs.length=0;for(const id of ['shopN','shopS','shopW','shopE']){const g=gates.find(g=>g.id===id);if(g)closeGate(g);}}},
      {fx:'shake',v:10},{sfx:'boom',v:.5},{sfx:'thud',v:1},
      {say:'rafa',m:'s',t:'As portas! Desceram todas as portas!',dur:1.6},
      {cam:{x:LM.cont.x,y:LM.cont.y},t:1.1},{sfx:'knock',v:1},{wait:.6},{sfx:'knock',v:1},{fx:'shake',v:6},{wait:.5},
      {fx:'blackout',v:1.2},{sfx:'roar',v:1},{fx:'shake',v:14},
      {do:()=>{const b=spawnBoss('especime',LM.cont.x,LM.cont.y+70,'b_especime',true);if(b){b.rising=.8;b.stun=.9;b.face=-Math.PI/2;CUT.actors.boss=b;}for(let i=0;i<30;i++)parts.push({k:'debris',x:LM.cont.x+rr(-40,40),y:LM.cont.y+rr(-40,40),vx:rr(-260,260),vy:rr(-260,260),life:.7,max:.7,s:rr(2,5),c:'#c8c8c0'});}},
      {wait:.9},
      {say:'rafa',m:'s',t:'O que... o que é ISSO?',dur:1.4},
      {cam:{x:P.x,y:P.y},t:.4},
    ],()=>{G.banner={t:'O Espécime',life:3};STORY.shopTrapped();if(F.walkie)laterF(()=>{bark('helena','s','Richard? Esse barulho... é o T-07. Ele salta antes de atacar. Faz ele bater na parede!',{radio:true});},2600);});
  },
  firstGun(){bark('rafa','t','Uma pistola. Doze balas. Cada uma conta.');laterF(()=>{toast('Tiro faz barulho: quem ouvir vai procurar de onde veio.');},2200);},
  bossSeen(t){
    const L={gordo:['rafa','s','Meu Deus... é o Gordo do caixa. Ele ocupa a porta inteira.'],enferm:['rafa','s','Ela é do tamanho da ambulância... e tá olhando pra mim.'],pescador:['rafa','s','Isso saiu do mar. Isso saiu do mar!']}[t];
    if(L&&!G.flags['seen_'+t]){G.flags['seen_'+t]=true;bark(L[0],L[1],L[2]);}
  },
  bossDown(t){
    if(t==='especime'){
      delete G.flags['pw'+shopB()];
      const g=gates.find(g=>g.id==='grade'); if(g&&!g.open)openGate(g);
      for(const id of ['shopN','shopS','shopW','shopE']){const s=gates.find(x=>x.id===id);if(s&&!s.open)openGate(s);}
      if(LM.shopFarm&&!pickups.some(p=>p.id==='inibidor')&&invCount('inibidor')<=0){const [x,y]=freeTileNear((LM.shopFarm.x/TILE)|0,(LM.shopFarm.y/TILE)|0,true);pickups.push({uid:'amp',tx:x,ty:y,x:tc(x),y:tc(y),id:'inibidor',q:1,kind:'item'});pickOcc.add(idx(x,y));}
      AU.unlock(); G.shake+=6;
      bark('rafa','a','Caiu... e a grade da drogaria cedeu com o tranco. A ampola. Pega a ampola.');
      if(G.flags.walkie)laterF(()=>{bark('helena','s','Você matou o T-07? Richard... a Vértice vai querer saber quem você é.',{radio:true});},6000);
      return;
    }
    if(t==='pescador'){bark('rafa','a','Ele tinha uma submetralhadora presa na rede... de algum soldado. Agora é minha.');}
    else if(t==='enferm')bark('rafa','t','Desculpa. Desculpa, moça.');
    else bark('rafa','t','Acabou. Acabou, Gordo.');
  },
  // sussurros no rádio durante os sustos
  whisper(){
    const t=rpick(['...Richard... tem alguém... atrás de você...','...apaga a luz... apaga a luz...','...canal sete... eles estão escutando...','...não corre... não corre...']);
    bark('helena','s',t,{radio:true,dur:2.6});
  },
  radioFirst(){
    G.flags.walkie=true;
    UI.talk([
      L_('rafa','s','Tem um rádio aqui no arsenal... está ligado.',{think:true}),
      L_('helena','s','...alguém... alguém aí? Canal sete... por favor, alguém...',{radio:true}),
      L_('rafa','s','Alô? Quem fala?'),
      L_('helena','t','Graças a Deus. Meu nome é Helena. Sou médica na Clínica da Brava. Estou presa aqui com... com o que sobrou.',{radio:true}),
      {choice:[
        {t:'Você é da Vértice?',then:[L_('helena','t','...Era. Ninguém mais é de lugar nenhum hoje.',{radio:true})]},
        {t:'Como eu chego aí?',then:[L_('helena','n','Pela Estrada da Rainha. O Exército fechou com uma barricada, mas um carro pesado passa.',{radio:true})]},
      ]},
      L_('helena','s','E escuta. O homem de sobretudo não é um homem. Ele segue sinais de rádio. Agora ele vai seguir esse aqui.',{radio:true}),
      L_('helena','s','Se ele chegar perto de você, corre.',{radio:true}),
      L_('rafa','a','Ótimo. Mais uma coisa querendo me matar.'),
    ]);
  },
  bloqueioLook(){if(!G.flags.bLook){G.flags.bLook=true;bark('rafa','t',G.flags.jipe?'A pé não passa. Com o jipe, e rápido, talvez.':'Carros empilhados e arame. A pé não passa. O jipe do Tião...');}},
  bloqueio(){
    bark('rafa','a','PASSEI! Passei! ...O jipe ainda tá inteiro? Tá. Mais ou menos.');
    if(G.flags.walkie)bark('helena','s','Richard, ouvi a batida daqui. Siga a estrada pela beira do morro. A Brava é logo depois da Praia dos Amores.',{radio:true});
    laterF(()=>{{toast('Passos pesados atrás de você...');AU.roar();}},5000);
  },
  firstDrive(){bark('rafa','h','Bateria nova, tanque cheio. Desculpa, seu Tião, eu devolvo.');},
  onDistrict(d){
    const F=G.flags; F.seenD=F.seenD||{}; if(F.seenD[d])return; F.seenD[d]=true;
    const T0={
      7:'A Barra Sul. O bondinho ainda tá rodando... vazio.',
      6:'O Centro. Ontem a gente tava comendo pastel aqui às duas da manhã. Ontem.',
      5:'A Barra Norte. A roda-gigante está girando sozinha, com as luzes acesas. Ninguém desligou.',
      4:'A Estrada da Rainha. Só mato dos dois lados. Se esse jipe morrer aqui, eu morro junto.',
      3:'A Praia Brava. O mar está parado demais. Nem as ondas fazem barulho.',
      5:G.flags.caos>=2?'A Barra Norte. A roda-gigante pegando fogo... e ainda girando.':'A Barra Norte. A roda-gigante está girando sozinha, com as luzes acesas. Ninguém desligou.',
      2:'Cabeçudas. Casa de pescador, barco virado... e uma cancela da Vértice no meio da rua.',
      1:'Itajaí. O centro histórico. As igrejas ainda estão com as luzes acesas.',
      0:'O Porto. Daqui dá pra sentir o cheiro de química do laboratório.'};
    if(T0[d])bark('rafa','t',T0[d]);
    if(d===3)STORY.onBrava();
  },
  persSeen(){bark('rafa','s','Que... que diabos é aquilo? Ele está olhando pra mim.');},
  wave(){bark('helena','s','Ela subiu! Richard, ela bate no chão antes de atacar. Sai de perto quando ela parar!',{radio:true});},
  heli(){bark('piloto','n','Itajaí, aqui é Águia Seis. Pouso em trinta segundos. Mantenham o heliponto limpo.',{radio:true});},
  landed(){bark('piloto','a','Embarque agora! AGORA!',{radio:true,dur:3});},
  ending(){
    const F=G.flags, boss=F.bossDead?' A Abominação ficou para trás, em pedaços, no meio do heliponto.':'';
    const hs=clockStr().replace(':','h'), d=dayNo(), when=`O helicóptero subiu às ${hs}${d>1?`, ${d===2?'um dia':(d-1)+' dias'} depois daquela segunda-feira`:''}.`;
    const vert=F.shopEv?' Em algum lugar lá embaixo, uma van branca da Vértice seguia pela BR-101 sem nenhum bloqueio.':'';
    const mat=F.matheusJoin?' O Matheus sentou no chão do helicóptero, com o fone pendurado no pescoço, e ficou olhando o porto sumir.':'';
    const mortos=[F.tiaoMorto&&'o Tião, que segurou a porta da oficina',F.cidaTurned&&'a Dona Cida, que nunca saiu do apartamento',F.ivoMorto&&'o Seu Ivo, que esperou o barco'].filter(Boolean);
    const luto=mortos.length?' Você pensou em '+mortos.join(', ').replace(/, ([^,]*)$/,' e $1')+'.':'';
    const edu=F.eduCame?' O Edu não largou o revólver do Tião em nenhum momento.':F.eduJoin?' Você pensou no Edu, que ficou na Brava, e não conseguiu falar o nome dele em voz alta.':'';
    if(F.helena==='levar')return {t:F.eduCame&&F.matheusJoin?'Final: Os três':'Final: Passageira',b:when+mat+edu+luto+' Helena dormiu encostada na janela, a mão sobre o curativo.'+boss+' Quando o bombardeio começou, os prédios da Avenida Atlântica acenderam uma última vez lá embaixo. Catorze minutos depois, ela abriu os olhos. Eles estavam cinzentos.'+vert};
    if(F.helena==='ficar')return {t:'Final: A última luz',b:when+mat+edu+luto+' Da porta você viu a Praia Brava apagada lá embaixo, e pensou em Helena.'+boss+' Quando o bombardeio começou, Balneário e Itajaí acenderam uma última vez. Você nunca soube se ela chegou a ver.'+vert};
    return {t:F.matheusJoin?'Final: Quem sobrou':'Final: Sozinho',b:when+mat+edu+luto+' Ninguém falou nada durante o voo.'+boss+' Quando o bombardeio começou, o litoral inteiro acendeu uma última vez, da roda-gigante ao porto, e você contou nos dedos quantas pessoas conheceu desde aquela noite.'+vert};
  },
};
UI.npc=function(n){STORY.npc(n);};
