// ===================== MODELOS DAS ARMAS (vista de cima) =====================
// Origem = mão que segura o cabo; o cano aponta para +x. Medidas em pixels do mundo.
const WMODEL={
  faca:{len:14,fore:0},
  pistola:{len:15,fore:0},
  escopeta:{len:30,fore:17},
  smg:{len:19,fore:10},
  magnum:{len:19,fore:0},
  chamas:{len:26,fore:12},
  lgran:{len:22,fore:13},
  besta:{len:24,fore:9},
  maos:{len:8,fore:0},
};
function drawWeaponModel(c,id,loaded=true,firing=false){
  const R2=(x,y,w,h,r,f)=>{rrect(c,x,y,w,h,r);c.fillStyle=f;c.fill();};
  const hl=(x,y,w)=>{c.fillStyle='rgba(255,255,255,.16)';c.fillRect(x,y,w,.8);};
  c.lineCap='round';
  switch(id){
    case 'faca':
      c.fillStyle='#2a2a2a';R2(-4,-1.6,6,3.2,1,'#2a2622');
      c.fillStyle='#c8ccd0';c.beginPath();c.moveTo(2,-1.4);c.lineTo(13,-.4);c.lineTo(14,.2);c.lineTo(2,1.4);c.closePath();c.fill();
      hl(3,-1.2,9);break;
    case 'pistola':
      R2(-3,-2.3,17,4.6,1.2,'#2b2c30');
      c.fillStyle='#1b1c1f';for(let i=0;i<4;i++)c.fillRect(-2+i*1.2,-2.3,.6,4.6);
      c.fillStyle='#141517';c.fillRect(4,-.9,4,1.8);
      hl(-2,-2.1,15);
      c.fillStyle='#0b0b0c';c.fillRect(13.4,-1,1,2);
      c.fillStyle='#d8c070';c.fillRect(12,-.4,.8,.8);break;
    case 'escopeta':
      c.fillStyle='#6a4426';c.beginPath();c.moveTo(-16,-3.2);c.lineTo(-2,-2.2);c.lineTo(-2,2.2);c.lineTo(-16,3.2);c.closePath();c.fill();
      c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.6;c.beginPath();c.moveTo(-14,-1);c.lineTo(-4,-.6);c.moveTo(-13,1.4);c.lineTo(-5,.9);c.stroke();
      c.fillStyle='#2a1a0e';c.fillRect(-16.5,-3.2,1.4,6.4);
      R2(-3,-2.8,10,5.6,1.5,'#25262a');
      c.fillStyle='#17181b';c.fillRect(6,-1.6,24,3.2);
      hl(6,-1.5,24);
      R2(13,-3.1,9,6.2,1.6,'#7a4e2a');
      c.fillStyle='rgba(0,0,0,.3)';for(let i=0;i<4;i++)c.fillRect(14.2+i*2,-3.1,.7,6.2);
      c.fillStyle='#c8c8c0';c.beginPath();c.arc(29.5,0,.7,0,6.283);c.fill();break;
    case 'smg':
      c.fillStyle='#3a3b40';c.fillRect(-11,-2.6,9,1);c.fillRect(-11,1.6,9,1);c.fillRect(-11.5,-2.6,1.2,5.2);
      R2(-3,-3,14,6,1.5,'#2a2b2f');
      c.fillStyle='#1c1d20';c.fillRect(3,2.4,3.4,6.6);c.fillStyle='#2e2f33';c.fillRect(3,8,3.4,1.2);
      hl(-2,-2.8,12);
      c.fillStyle='#222327';c.fillRect(11,-1.7,8,3.4);
      c.fillStyle='#0e0e10';for(let i=0;i<3;i++){c.beginPath();c.arc(12.5+i*2.2,0,.6,0,6.283);c.fill();}
      c.fillStyle='#0b0b0c';c.fillRect(18.6,-1,1,2);break;
    case 'magnum':
      R2(-4.5,-1,2,2,.5,'#55585c');
      R2(-3,-2.6,8,5.2,1.3,'#8a8d92');
      c.fillStyle='#9da0a5';c.beginPath();c.arc(4.5,0,3.7,0,6.283);c.fill();
      c.fillStyle='#3a3c40';for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.arc(4.5+Math.cos(a)*2.2,Math.sin(a)*2.2,.75,0,6.283);c.fill();}
      R2(7,-1.7,12,3.4,.8,'#a8abb0');
      c.fillStyle='#c8cbd0';c.fillRect(7.5,-.4,11,.8);
      c.fillStyle='#0b0b0c';c.fillRect(18.6,-.8,.8,1.6);break;
    case 'chamas':
      c.strokeStyle='#1a1a1a';c.lineWidth=1.8;c.beginPath();c.moveTo(-3,2.5);c.quadraticCurveTo(-8,8,-14,5);c.stroke();
      R2(-4,-3.6,17,7.2,2,'#3e432c');
      c.fillStyle='#d07a24';c.fillRect(0,-3.6,1.6,7.2);c.fillRect(6,-3.6,1.6,7.2);
      hl(-3,-3.3,15);
      c.fillStyle='#2b2b2b';c.fillRect(13,-1.9,9,3.8);
      c.fillStyle='#4a4a4a';c.beginPath();c.moveTo(22,-2.2);c.lineTo(26,-3.4);c.lineTo(26,3.4);c.lineTo(22,2.2);c.closePath();c.fill();
      c.fillStyle=firing?'#ffd27a':'#5ab0ff';c.beginPath();c.arc(26.8,0,firing?1.6:1,0,6.283);c.fill();break;
    case 'lgran':
      c.fillStyle='#2a2b2e';c.fillRect(-11,-2,8,4);c.fillStyle='#1a1b1d';c.fillRect(-11.5,-2.6,1.4,5.2);
      c.fillStyle='#4a5530';c.beginPath();c.arc(2,0,5.4,0,6.283);c.fill();
      c.strokeStyle='#323a20';c.lineWidth=.8;for(let i=0;i<6;i++){const a=i*Math.PI/3;c.beginPath();c.moveTo(2,0);c.lineTo(2+Math.cos(a)*5.4,Math.sin(a)*5.4);c.stroke();}
      R2(6,-3.2,16,6.4,1.2,'#5a6638');
      hl(7,-3,14);
      c.fillStyle='#2a3018';c.fillRect(21,-3.2,1.6,6.4);
      c.fillStyle='#3a4224';c.fillRect(12,3,3.5,3.5);break;
    case 'maos':
      c.fillStyle='#a8734f';c.beginPath();c.arc(2,0,4.2,0,6.283);c.fill();c.fillStyle='rgba(0,0,0,.25)';for(let i=0;i<3;i++)c.fillRect(3.5,-2.6+i*2.1,2.4,.7);break;
    case 'besta':
      R2(-8,-2,23,4,1.5,'#6a4a2a');
      c.strokeStyle='rgba(0,0,0,.25)';c.lineWidth=.5;c.beginPath();c.moveTo(-6,-.6);c.lineTo(12,-.4);c.stroke();
      c.strokeStyle='#2e2016';c.lineWidth=2.6;c.beginPath();c.moveTo(12,-11.5);c.quadraticCurveTo(18.5,0,12,11.5);c.stroke();
      c.strokeStyle='rgba(225,220,205,.8)';c.lineWidth=.7;c.beginPath();
      if(loaded){c.moveTo(12,-11.5);c.lineTo(5,0);c.lineTo(12,11.5);}else{c.moveTo(12,-11.5);c.lineTo(12,11.5);}c.stroke();
      if(loaded){c.fillStyle='#8a7050';c.fillRect(5,-.5,18,1);c.fillStyle='#c8ccd0';c.beginPath();c.moveTo(23,-1.6);c.lineTo(26,0);c.lineTo(23,1.6);c.closePath();c.fill();c.fillStyle='#b03a3a';c.fillRect(5,-1.2,2,2.4);}
      break;
  }
}
const WICONS={};
function weaponIconURL(i){
  if(i in WICONS)return WICONS[i];
  try{
    const id=WEAPONS[i].id,M=WMODEL[id],c=document.createElement('canvas');c.width=120;c.height=48;const g=c.getContext('2d');
    const s=Math.min(3.2,96/(M.len+18));g.translate(60-((M.len-18)/2+4)*s,24);g.scale(s,s);
    drawWeaponModel(g,id,true,false);
    const u=c.toDataURL&&c.toDataURL('image/png');WICONS[i]=typeof u==='string'&&u.length>30?u:null;
  }catch(e){WICONS[i]=null;}
  return WICONS[i];
}
