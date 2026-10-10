// ===================== 1.2: MARLON, ALEX RESE, NICOLAS · CÂMERA · EXPLORAÇÃO =====================
// Os três não andam com você. Cada um tem a sua parte da história, e no fim todos aparecem no porto.

// ---------- retratos ----------
Object.assign(PCH,{
  marlon:{name:'Marlon',skin:'#e0b090',shade:'#a87a5e',hair:'#1c120a',iris:'#3a2414',bg:['#0e1418','#040607'],glow:'90,210,140',voice:118},
  alex:{name:'Prof. Alex Rese',skin:'#d9a682',shade:'#a3714f',hair:'#1a100a',iris:'#3a2616',bg:['#3a2a08','#120c02'],glow:'240,180,50',voice:128},
  nico:{name:'Nicolas',skin:'#ecc8ae',shade:'#b88e74',hair:'#1a1210',iris:'#3a2a1c',bg:['#1a1c10','#070804'],glow:'220,210,80',voice:190},
});
const PXH={
  marlon:{hw:60,hh:70,
    body:['#1c1e21','#0a0b0c'],
    clothes(c,cx,H2){ // jaqueta puffer preta com gomos, capuz na gola, camiseta preta
      c.strokeStyle='rgba(255,255,255,.07)';c.lineWidth=2;for(let y=236;y<H2;y+=14){c.beginPath();c.moveTo(24,y+8);c.quadraticCurveTo(70,y-6,108,y);c.stroke();c.beginPath();c.moveTo(256,y+8);c.quadraticCurveTo(210,y-6,172,y);c.stroke();}
      c.fillStyle='#232629';c.beginPath();c.moveTo(84,214);c.quadraticCurveTo(cx,196,196,214);c.lineTo(188,232);c.quadraticCurveTo(cx,214,92,232);c.closePath();c.fill();
      c.fillStyle='#0b0b0c';c.beginPath();c.moveTo(110,214);c.lineTo(cx,250);c.lineTo(170,214);c.closePath();c.fill();
      c.strokeStyle='#4a4d52';c.lineWidth=2;c.beginPath();c.moveTo(cx+18,226);c.lineTo(cx+22,H2);c.stroke();
      c.strokeStyle='#d8d8d8';c.lineWidth=1.4;for(const s of [-1,1]){c.beginPath();c.moveTo(cx+s*20,222);c.lineTo(cx+s*24,262);c.stroke();}},
    details(c,cx,cy,my,mood){ // barba cheia e fechada, do maxilar ao queixo
      c.fillStyle='#1e140c';c.beginPath();c.moveTo(cx-58,cy-4);c.quadraticCurveTo(cx-60,cy+50,cx-24,cy+70);c.quadraticCurveTo(cx,cy+82,cx+24,cy+70);c.quadraticCurveTo(cx+60,cy+50,cx+58,cy-4);
      c.quadraticCurveTo(cx+48,cy+26,cx+26,cy+30);c.quadraticCurveTo(cx,cy+24,cx-26,cy+30);c.quadraticCurveTo(cx-48,cy+26,cx-58,cy-4);c.fill();
      c.beginPath();c.moveTo(cx-22,my-4);c.quadraticCurveTo(cx,my-14,cx+22,my-4);c.quadraticCurveTo(cx,my-7,cx-22,my-4);c.fill();
      c.fillStyle='rgba(60,40,26,.4)';for(let i=0;i<70;i++){const a=Math.PI*(.05+Math.random()*.9),r=40+Math.random()*24;c.fillRect(cx+Math.cos(a)*r*1.05,cy+30+Math.sin(a)*r*.7,1.4,1.4);}
      if(mood!=='s'&&mood!=='h'){c.fillStyle='#b8705e';c.beginPath();c.ellipse(cx,my+3,12,4,0,0,6.283);c.fill();}},
    hair(c,cx,cy,hw,hh,p){ // curto, mais volume em cima, laterais baixas
      c.fillStyle=p.hair;c.beginPath();c.moveTo(cx-hw,cy-20);c.bezierCurveTo(cx-hw-2,cy-hh-14,cx+hw+2,cy-hh-14,cx+hw,cy-20);c.quadraticCurveTo(cx+hw-8,cy-42,cx,cy-46);c.quadraticCurveTo(cx-hw+8,cy-42,cx-hw,cy-20);c.closePath();c.fill();
      for(const [x,y,rx,ry] of [[cx-24,cy-hh+2,24,10],[cx+6,cy-hh-2,28,10],[cx+30,cy-hh+4,20,9]]){c.beginPath();c.ellipse(x,y,rx,ry,0,0,6.283);c.fill();}
      c.fillStyle='rgba(28,18,10,.55)';for(const s of [-1,1]){c.beginPath();c.ellipse(cx+s*(hw-4),cy-26,8,16,0,0,6.283);c.fill();}
      c.strokeStyle='rgba(110,80,50,.35)';c.lineWidth=1.6;for(let i=0;i<14;i++){const x=cx-40+Math.random()*80,y=cy-hh-8+Math.random()*18;c.beginPath();c.moveTo(x,y);c.lineTo(x+5,y-6);c.stroke();}}},
  alex:{hw:56,hh:72,
    body:['#141414','#060606'],
    clothes(c,cx){c.fillStyle='#141414';c.beginPath();c.moveTo(96,206);c.quadraticCurveTo(cx,226,184,206);c.lineTo(190,232);c.lineTo(90,232);c.closePath();c.fill();c.fillStyle='#0a0a0a';c.beginPath();c.moveTo(102,212);c.quadraticCurveTo(cx,240,178,212);c.lineTo(172,206);c.quadraticCurveTo(cx,230,108,206);c.closePath();c.fill();
      c.strokeStyle='rgba(255,255,255,.05)';c.lineWidth=3;c.beginPath();c.moveTo(56,262);c.quadraticCurveTo(cx,248,224,262);c.stroke();},
    details(c,cx,cy,my,mood){ // barba cheia bem aparada, bigode
      c.fillStyle='#1a100a';c.beginPath();c.moveTo(cx-54,cy+2);c.quadraticCurveTo(cx-54,cy+52,cx-22,cy+70);c.quadraticCurveTo(cx,cy+80,cx+22,cy+70);c.quadraticCurveTo(cx+54,cy+52,cx+54,cy+2);
      c.quadraticCurveTo(cx+44,cy+30,cx+22,cy+32);c.quadraticCurveTo(cx,cy+26,cx-22,cy+32);c.quadraticCurveTo(cx-44,cy+30,cx-54,cy+2);c.fill();
      c.beginPath();c.moveTo(cx-24,my-2);c.quadraticCurveTo(cx-10,my-15,cx,my-9);c.quadraticCurveTo(cx+10,my-15,cx+24,my-2);c.quadraticCurveTo(cx,my-6,cx-24,my-2);c.fill();
      if(mood!=='s'){c.fillStyle='#b06a58';c.beginPath();c.ellipse(cx,my+3,13,mood==='h'?6:4,0,0,6.283);c.fill();}
      c.strokeStyle='rgba(0,0,0,.18)';c.lineWidth=1.5;for(const s of [-1,1]){c.beginPath();c.arc(cx+s*36,cy-2,7,s<0?Math.PI*.6:Math.PI*.1,s<0?Math.PI*.9:Math.PI*.4);c.stroke();}},
    hair(c,cx,cy,hw,hh,p){ // ondulado, jogado pra trás e pro lado, com volume
      c.fillStyle=p.hair;c.beginPath();c.moveTo(cx-hw-2,cy-16);c.bezierCurveTo(cx-hw-8,cy-hh-22,cx+hw+12,cy-hh-22,cx+hw+4,cy-20);c.quadraticCurveTo(cx+hw-10,cy-44,cx+10,cy-50);c.quadraticCurveTo(cx-hw+6,cy-40,cx-hw-2,cy-16);c.closePath();c.fill();
      for(const [x,y,rx,ry,r] of [[cx-32,cy-hh-2,22,12,-.4],[cx-4,cy-hh-10,28,12,0],[cx+26,cy-hh-6,26,12,.3],[cx+50,cy-hh+12,14,14,.6],[cx-48,cy-hh+14,12,13,-.5]]){c.beginPath();c.ellipse(x,y,rx,ry,r,0,6.283);c.fill();}
      c.strokeStyle='rgba(120,90,60,.4)';c.lineWidth=2;for(let i=0;i<10;i++){const x=cx-40+Math.random()*84,y=cy-hh-16+Math.random()*22;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+10,y-4,x+16,y+6);c.stroke();}}},
  nico:{hw:50,hh:70,
    body:['#d8cc3a','#8a8018'],
    clothes(c,cx,H2){ // camiseta amarela com estampa, cordão no pescoço
      c.fillStyle='#bfb22a';c.beginPath();c.moveTo(108,210);c.quadraticCurveTo(cx,236,172,210);c.lineTo(166,204);c.quadraticCurveTo(cx,226,114,204);c.closePath();c.fill();
      c.strokeStyle='#4a4a40';c.lineWidth=1.6;c.beginPath();c.moveTo(118,212);c.quadraticCurveTo(cx,262,162,212);c.stroke();c.fillStyle='#6a6a5e';c.fillRect(cx-3,258,6,8);
      c.fillStyle='rgba(30,30,24,.45)';c.beginPath();c.arc(194,280,11,0,6.283);c.fill();c.fillRect(182,294,24,4);},
    details(c,cx,cy,my,mood){if(mood!=='s'&&mood!=='h'){c.fillStyle='#c48474';c.beginPath();c.moveTo(cx-13,my);c.quadraticCurveTo(cx,my-4,cx+13,my);c.quadraticCurveTo(cx,my+8,cx-13,my);c.fill();}
      c.fillStyle='rgba(225,120,110,.14)';for(const s of [-1,1]){c.beginPath();c.ellipse(cx+s*30,cy+18,13,9,0,0,6.283);c.fill();}},
    over(c,cx,cy,ey,ex){ // óculos redondos de aro fino
      c.strokeStyle='#2a2420';c.lineWidth=2.6;for(const s of [-1,1]){c.beginPath();c.arc(cx+s*ex,ey,15,0,6.283);c.stroke();}c.beginPath();c.moveTo(cx-9,ey-2);c.quadraticCurveTo(cx,ey-6,cx+9,ey-2);c.stroke();
      c.fillStyle='rgba(200,220,255,.08)';for(const s of [-1,1]){c.beginPath();c.arc(cx+s*ex,ey,14,0,6.283);c.fill();}},
    back(c,cx,cy,hw,p){c.fillStyle=p.hair;c.beginPath();c.ellipse(cx,cy-10,hw+20,92,0,0,6.283);c.fill();},
    hair(c,cx,cy,hw,hh,p){ // cabelo liso cortado tipo cuia/chanel, franja reta até a sobrancelha, cobre as orelhas
      c.fillStyle=p.hair;c.beginPath();c.moveTo(cx-hw-18,cy+44);c.bezierCurveTo(cx-hw-26,cy-hh-30,cx+hw+26,cy-hh-30,cx+hw+18,cy+44);c.lineTo(cx+hw-2,cy+40);c.quadraticCurveTo(cx+hw+2,cy-6,cx+hw-6,cy-22);
      c.lineTo(cx-hw+6,cy-22);c.quadraticCurveTo(cx-hw-2,cy-6,cx-hw+2,cy+40);c.closePath();c.fill();
      c.beginPath();c.moveTo(cx-hw,cy-20);c.lineTo(cx+hw,cy-20);c.lineTo(cx+hw-4,cy-28);c.quadraticCurveTo(cx,cy-36,cx-hw+4,cy-28);c.closePath();c.fill();
      c.strokeStyle='rgba(120,90,70,.35)';c.lineWidth=1.6;for(let i=0;i<16;i++){const x=cx-hw+Math.random()*hw*2;c.beginPath();c.moveTo(x,cy-hh-6+Math.random()*10);c.lineTo(x+(Math.random()-.5)*6,cy-24);c.stroke();}}},
};
// visto de cima
const LOOKX={
  marlon(o){ctx.fillStyle=o.hair;ctx.beginPath();ctx.arc(-1.2,0,5.2,0,6.283);ctx.fill();ctx.fillStyle='#1e140c';ctx.beginPath();ctx.arc(2.6,0,4.6,-1.25,1.25);ctx.lineTo(2.6,0);ctx.fill();ctx.fillStyle='#2a2d31';ctx.beginPath();ctx.arc(-4.5,0,4,Math.PI*.5,Math.PI*1.5);ctx.fill();},
  alex(o){ctx.fillStyle=o.hair;ctx.beginPath();ctx.ellipse(-1.6,-.6,5.6,6.2,.3,0,6.283);ctx.fill();ctx.beginPath();ctx.ellipse(1.5,-4,3,2.2,.6,0,6.283);ctx.fill();ctx.fillStyle='#1a100a';ctx.beginPath();ctx.arc(2.8,0,4.4,-1.2,1.2);ctx.lineTo(2.8,0);ctx.fill();},
  nico(o){ctx.fillStyle=o.hair;ctx.beginPath();ctx.arc(-.8,0,6.6,0,6.283);ctx.fill();ctx.fillStyle=o.skin;ctx.beginPath();ctx.arc(2.2,0,3.6,-1,1);ctx.fill();ctx.strokeStyle='#2a2420';ctx.lineWidth=.8;ctx.beginPath();ctx.arc(4.4,-2,1.4,0,6.283);ctx.arc(4.4,2,1.4,0,6.283);ctx.stroke();},
};
const LOOK12={marlon:{col:'#1c1e21',hair:'#1c120a',skin:'#e0b090',look:'marlon'},alex:{col:'#141414',hair:'#1a100a',skin:'#d9a682',look:'alex'},nico:{col:'#d6c93a',hair:'#1a1210',skin:'#ecc8ae',look:'nico'}};

// ---------- itens novos ----------
Object.assign(ITEMS,{
  rojao:{n:'Rojão',s:'ROJÃO',c:'#d84a8a',st:6,k:'throw',d:'Sobra do réveillon do Nicolas. Explode longe com luz e estouro: tudo que escuta vai pra lá. Arremesse como granada.'},
  sinal:{n:'Sinalizador',s:'SINAL',c:'#e8503a',st:4,k:'throw',d:'Bastão de luz vermelha. Queima por meio minuto onde cair: ilumina e atrai os que enxergam.'},
  calmante:{n:'Calmante',s:'CALM.',c:'#9ab8d8',st:3,k:'heal',h:10,d:'Comprimido de farmácia. A mão para de tremer, o coração desacelera. Tira o medo na hora.'},
});
const DOC12=DOCS.length;
DOCS.push(
  {t:'Lista de embarque',b:`VÉRTICE S.A. — LOGÍSTICA DE CAMPO\nNavio MARIANA K. · Origem: trapiche da Barra Sul\n\nContêineres 41 a 58: "material biológico vivo — manter fechado".\nContêiner 00: "T-00. NÃO ALIMENTAR APÓS AS 22H."\n\nNa margem, à caneta, a letra do Marlon:\n"Tinha criança no 44. Eu ouvi."`},
  {t:'Caderno do professor Rese',b:`Anotações a lápis, letra de quem dá aula há muito tempo.\n\n— T-00: tecido regenera rápido demais. Bala só irrita.\n— Reação violenta a cloro concentrado (hipoclorito + ácido = gás). Derrete a camada externa.\n— O Arantes sabia. Sempre soube.\n\nNo pé da página:\n"Richard faltou de novo. Se eu sair dessa, ele vai fazer a prova de recuperação nem que seja no helicóptero."`},
  {t:'Scanner do Nicolas',b:`Transcrição, caneta azul, letra torta:\n\n[EXÉRCITO, 03:12] "Operação Maré Limpa confirmada. Saturação da faixa litorânea às 05h40."\n[VÉRTICE, 03:40] "Equipe aérea no heliponto do porto. Prioridade: amostras e a Dra. Helena. Civis: negativo."\n[VÉRTICE, 03:41] "Repito: civis, negativo."\n\nEmbaixo, sublinhado três vezes: "ELES NÃO VÊM BUSCAR NINGUÉM."`},
);
const FOTO0=DOCS.length;
const FOTOS=[
  ['Praia Central','Uma família na areia, todo mundo de chapéu. No verso: "Último domingo antes do Bruno começar na Vértice. Ele tava tão feliz."'],
  ['Roda-gigante','Um casal se beijando dentro da cabine. No verso, outra letra: "Ela não desceu da cabine 14. Ninguém desceu."'],
  ['Barra Sul','Três pescadores segurando uma tainha enorme. No verso: "A rede veio com uma mão dentro. Ninguém riu depois disso."'],
  ['Praia Brava','Surfistas de madrugada, antes do sol. No verso: "Tem gente boiando em pé lá no fundo. Não entra no mar."'],
  ['Laranjeiras','Um casal jovem num barco de pesca. No verso: "1979. Pra sempre, Rosinha. — Ivo"'],
  ['Museu Histórico','Uma turma de escola na frente do museu. Um rosto foi riscado de caneta até rasgar o papel.'],
  ['Cabeçudas','O portão da Vértice cheio de caminhões brancos, foto tirada escondida. No verso: "Contêiner 44. Tem respiração."'],
  ['Mirante','Uma selfie no mirante da Estrada da Rainha. No fundo, um navio parado. No verso: "Três dias parado ali e ninguém sai."'],
  ['Cemitério','Um túmulo aberto. A tampa de pedra foi empurrada pra fora. Por dentro.'],
  ['Colégio Estadual','Um professor de costas, escrevendo na lousa "PROVA SEXTA". No verso: "Turma: se alguém achar isso, estou no Mercado Público de Itajaí. — Prof. Rese"'],
  ['Cabine de fotos','Quatro quadros de cabine de shopping. Nos três primeiros, uma moça sorrindo. No quarto, alguém atrás dela. Sem rosto.'],
  ['Porto de Itajaí','O cargueiro MARIANA K. saindo de Santos, tripulação de jaleco na amurada. No verso: "Carga: T-00. Destino: Itajaí. Que Deus nos perdoe."'],
];
for(const [t,b] of FOTOS)DOCS.push({t:'Foto: '+t,b:'Uma foto molhada, com a borda queimada.\n\n'+b});
ACH.push({id:'album',n:'Álbum de família',d:'Ache as 12 fotos espalhadas pelo litoral.'},{id:'trio',n:'Turma do fundão',d:'Lute ao lado do Marlon, do Nicolas e do professor Rese no porto.'},{id:'rese',n:'Aprovado com louvor',d:'Ouça a última aula do professor Rese.'});
Object.assign(INT_LABEL,{mochila:'Mochila largada',cooler:'Caixa térmica'});

// ---------- o mundo: onde cada um está, e o que tem pra achar ----------
function genV12(){
  const yb=bOf(110,370); if(yb>=0&&buildings[yb])buildings[yb].name='Edifício Yacht';
  const at=(x,y)=>{const [a,b]=freeTileNear(x,y,true);return {x:tc(a),y:tc(b),tx:a,ty:b};};
  const m=at(112,385); LM.marlon={x:m.x,y:m.y};
  npcs.push({id:'marlon',name:'Marlon',x:m.x,y:m.y,ang:-Math.PI/2,...LOOK12.marlon,cond:()=>G.flags&&!!G.flags.marlonMet&&!G.flags.marlonGone});
  const mc=at(110,255); npcs.push({id:'marlonC',name:'Marlon',x:mc.x,y:mc.y,ang:Math.PI,...LOOK12.marlon,cond:()=>G.flags&&G.flags.marlon==='cida'&&!!G.flags.bloqueio&&!G.flags.radio});
  const ma=at(80,19); LM.marlonA={x:ma.x,y:ma.y}; npcs.push({id:'marlonA',name:'Marlon',x:ma.x,y:ma.y,ang:0,...LOOK12.marlon,cond:()=>G.flags&&G.flags.marlon==='mar'&&!!G.flags.vertice&&!G.flags.radio});
  const n=at(165,92); LM.nico={x:n.x,y:n.y}; npcs.push({id:'nico',name:'Nicolas',x:n.x,y:n.y,ang:Math.PI/2,...LOOK12.nico,cond:()=>G.flags&&!!G.flags.droneSeen&&!G.flags.radio});
  const a=at(31,44); LM.alex={x:a.x,y:a.y}; npcs.push({id:'alex',name:'Prof. Alex Rese',x:a.x,y:a.y,ang:Math.PI/2,...LOOK12.alex,cond:()=>G.flags&&!G.flags.alexGone&&!G.flags.radio});
  const ag=at(150,27); npcs.push({id:'alexG',name:'Prof. Alex Rese',x:ag.x,y:ag.y,ang:-Math.PI/2,...LOOK12.alex,cond:()=>G.flags&&G.flags.alex==='junto'&&!!G.flags.alexGone&&!G.flags.radio});
  // documentos da trama
  addPick(33,40,DOC12+1,1,'file'); addPick(169,90,DOC12+2,1,'file');
  // fotos
  const FP=[[coastX(232)-4,232],[168,190],[coastX(372)-4,372],[coastX(112)-4,112],[176,446],[44,72],[182,77],[176,150],[56,368],[96,218],[118,303],[100,20]];
  FP.forEach(([x,y],i)=>addPick(Math.round(x),y,FOTO0+i,1,'file'));
  // caixas térmicas na areia e postos de salva-vidas
  for(let y=170;y<=380;y+=30){const x=Math.round(coastX(y))-6;if(inb(x,y)&&!SOLID[map[idx(x,y)]])interacts.push({tx:x,ty:y,x:tc(x),y:tc(y),type:'cooler'});}
  for(const y of [96,124,420,436]){const x=Math.round(coastX(y))-5;if(inb(x,y)&&!SOLID[map[idx(x,y)]])interacts.push({tx:x,ty:y,x:tc(x),y:tc(y),type:'cooler'});}
  // mochilas largadas pelas ruas
  let k=0; for(let i=0;i<4000&&k<34;i++){const x=1+((R()*(W-2))|0),y=1+((R()*(390))|0),t=map[idx(x,y)];if(t!==T.ROAD&&t!==T.SIDE&&t!==T.SAND)continue;if(bmap[idx(x,y)]>=0||safeMask[idx(x,y)]||!reach[idx(x,y)])continue;
    if(interacts.some(o=>Math.abs(o.tx-x)+Math.abs(o.ty-y)<12))continue;interacts.push({tx:x,ty:y,x:tc(x),y:tc(y),type:'mochila'});k++;}
}
const LOOT12=[['m9',[6,12]],['pilha',[1,2]],['ervaV',[1,1]],['cart',[3,5]],['calmante',[1,1]],['rojao',[1,2]],['sinal',[1,2]],['polv',[2,3]],['garrafa',[1,2]],['spray',[1,1]],['m357',[2,3]]];
function lootDrop(o,n){const got=[];for(let i=0;i<n;i++){const [id,q]=pick2(LOOT12);const qq=ri(q[0],q[1]);const l=invAdd(id,qq);if(l)boxAdd(id,l);got.push(ITEMS[id].n+(qq>1?' ×'+qq:''));}AU.pickup();later(1200,()=>toast('Pegou: '+got.join(', ')+'.'));}
function v12Interact(o){
  const F=G.flags, key='lt'+o.tx+'_'+o.ty;
  if(o.type==='mochila'||o.type==='cooler'){
    if(F[key])return toast(o.type==='cooler'?'A caixa térmica está vazia. Só gelo derretido e sangue.':'Já revirei essa mochila.');
    F[key]=1; AU.paper();
    const r=Math.random();
    if(o.type==='mochila'&&r<.12){ // a mochila estava presa a alguém
      const [x,y]=freeTileNear(o.tx+1,o.ty,true);const e=makeEnemy('rast',tc(x),tc(y),null);e.rising=.5;e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);AU.roar();G.shake+=6;buzz([60,30,60]);
      bark('rafa','s','A alça tava presa no braço dele... ELE TAVA VIVO DEBAIXO DA MOCHILA!',{dur:2});lootDrop(o,1);return;}
    if(r<.22){AU.hiss&&AU.hiss({x:o.x,y:o.y});for(let i=0;i<10;i++)parts.push({k:'debris',x:o.x,y:o.y,vx:rr(-140,140),vy:rr(-140,140),life:.5,max:.5,s:2,c:'#3a2a20'});G.shake+=3;toast('Ratos! Dezenas, saindo de dentro.');}
    const notes=o.type==='cooler'?['Latas de cerveja, um protetor solar e uma pulseira de hospital.','Gelo derretido. Embaixo, umas coisas úteis.','Sanduíches mofados. E isso aqui.']:['Uma carteira com foto de criança. E o resto.','Um caderno de faculdade com a última página escrita "ME DESCULPA".','Roupa molhada, um carregador... e coisas que servem.'];
    toast(pick2(notes)); lootDrop(o,o.type==='cooler'?ri(1,2):ri(1,3)); return;
  }
}

// ---------- Marlon (Ato 1, Barra Sul) ----------
STORY.marlonMeet=function(){
  const F=G.flags; if(F.marlonMet)return; F.marlonMet=true;
  const n=npcs.find(x=>x.id==='marlon'); const z=enemies.filter(e=>e.alive&&!e.t.boss&&!e.stalker&&hyp(e.x-P.x,e.y-P.y)<260).sort((a,b)=>hyp(a.x-P.x,a.y-P.y)-hyp(b.x-P.x,b.y-P.y))[0];
  const ed=F.eduFollow;
  playCut([{npc:n,id:'marlon'},{sfx:'shot',v:'magnum'},{fx:'shake',v:6},
    {do:()=>{if(z){bloodBurst(z.x,z.y,24,Math.atan2(z.y-n.y,z.x-n.x));z.headshot=true;hurtEnemy(z,99999,0,0,{});}}},
    {cam:'marlon',t:.8},
    {say:'marlon',m:'a',t:'ABAIXA! ...Pronto. Tava em cima de ti, mano.'},
    {walk:'marlon',to:'rafa',ox:0,oy:-40,spd:110},
    {say:'rafa',m:'s',t:'MARLON?! Caramba, Marlon!'},
    {say:'marlon',m:'n',t:'Desde as dez eu tô no terraço do Yacht com a carabina do meu vô. Já perdi a conta de quantos.'},
    {say:'marlon',m:'t',t:'Mas não foi isso o pior. Caminhão branco da Vértice no trapiche. Botando gente VIVA em contêiner. Gente que ainda gritava.'},
    ...(ed?[{say:'edu',m:'s',t:'Gente viva? Pra quê, mano?'},{say:'marlon',m:'t',t:'Sei lá. Os contêineres foram num navio, rumo Itajaí. Um tinha "T-00" pintado. Esse não gritava. Esse batia.'}]
      :[{say:'marlon',m:'t',t:'Foram num navio, rumo Itajaí. Um tinha "T-00" pintado. Esse não gritava. Esse batia.'}]),
    {say:'marlon',m:'n',t:'Eu não vou contigo, Richard. Alguém tem que fazer alguma coisa aqui. Fala tu: o que eu faço?'},
    {choice:[
      {t:'Cuida da Dona Cida. Ela tá sozinha no prédio da luz verde.',do:()=>{F.marlon='cida';},then:[
        {say:'marlon',m:'n',t:'A senhora do gato? Fechado. Ninguém entra naquele prédio enquanto eu tiver bala.'}]},
      {t:'Descobre pra onde a Vértice levou essa gente.',do:()=>{F.marlon='mar';},then:[
        {say:'marlon',m:'a',t:'Tem um bote no trapiche. Vou pelo mar até Itajaí. Te chamo no rádio quando achar alguma coisa.'}]},
    ]},
    {do:()=>{const l=invAdd('m9',14);if(l)boxAdd('m9',l);AU.reload();toast('O Marlon te deu munição 9mm.');}},
    {say:'marlon',m:'h',t:'Toma. Era de um PM que não precisa mais. A gente se vê no porto, irmão.'},
    {do:()=>{F.marlonGone=true;}}]);
};
STORY.marlonCida=function(n){
  const F=G.flags;
  if(F.marlonCidaTalk)return bark('marlon','n',pick2(['Tô de olho na rua. Vai tranquilo.','Três tentaram entrar. Nenhum conseguiu.','Ela me fez tomar chá. No meio do apocalipse. Chá.']));
  F.marlonCidaTalk=true;
  playCut([{npc:n,id:'marlon'},
    {say:'marlon',m:'n',t:'Richard! A senhora tá inteira. Três tentaram subir a escada. Nenhum desceu.'},
    {say:'cida',m:'h',t:'Esse menino não dorme, Richard. Fica na janela a noite toda com aquela espingarda.'},
    {say:'marlon',m:'h',t:'Carabina, Dona Cida.'},{say:'cida',m:'n',t:'Espingarda.'},
    {say:'marlon',m:'t',t:'O rádio da polícia falou de um barco de pescador saindo do Saco da Fazenda antes do amanhecer. Eu levo ela até lá e te encontro no porto.'},
    {do:()=>{const l=invAdd('calmante',2);if(l)boxAdd('calmante',l);toast('A Dona Cida te deu dois calmantes. "Pra tremedeira, menino."');}}]);
};
STORY.marlonArm=function(n){
  const F=G.flags;
  if(F.marlonArmTalk)return bark('marlon','n',pick2(['A lista tá contigo. Lê ela.','Esse navio parado lá fora... não chega perto dele.','Eu fico aqui em cima vigiando. Vai.']));
  F.marlonArmTalk=true;
  playCut([{npc:n,id:'marlon'},
    {say:'marlon',m:'s',t:'Richard. Achei. Olha isso: uma lista de embarque. Contêiner 41 até 58, "material biológico vivo".'},
    {say:'marlon',m:'t',t:'Eu abri o 44. Tinha criança, mano. Já era tarde. Eu... fechei de novo.'},
    {say:'marlon',m:'n',t:'E o contêiner 00 tá naquele navio parado no canal. O T-00. Eles alimentaram ele a semana inteira.'},
    {say:'marlon',m:'a',t:'Vou subir num guindaste e cobrir o heliponto. Quando a merda começar, olha pra cima.'},
    {do:()=>{const l=invAdd('m357',6);if(l)boxAdd('m357',l);G.files.add(DOC12);AU.paper();toast('O Marlon te deu munição .357 e a lista de embarque (veja em Arquivos).');}}]);
};
// ---------- Nicolas (Ato 2, Brava) ----------
function droneStart(){const F=G.flags;if(F.droneSeen||G.ev.drone)return;G.ev.drone={x:P.x-200,y:P.y-160,t:0,phase:0};}
function droneTick(dt){
  const d=G.ev.drone; if(!d)return; d.t+=dt; const F=G.flags;
  if(d.phase===0){const a=d.t*1.6;const tx=P.x+Math.cos(a)*70,ty=P.y+Math.sin(a)*70;d.x=lerp(d.x,tx,Math.min(1,dt*2.2));d.y=lerp(d.y,ty,Math.min(1,dt*2.2));
    if(d.t>.6&&!d.b1){d.b1=1;bark('rafa','s','Um drone?! ...Tem alguém pilotando isso.',{dur:2});}
    if(d.t>3.4&&!d.b2){d.b2=1;psyFloat(d.x,d.y,'"Ei! Moço da mochila! Surf shop, do lado da clínica! Tô vivo!"',{life:3.6,c:'#e8e070'});AU.static(.4,.3);}
    if(d.t>6.5){d.phase=1;F.droneSeen=true;}}
  else{const t=LM.nico;d.x=lerp(d.x,t.x,Math.min(1,dt*1.2));d.y=lerp(d.y,t.y-20,Math.min(1,dt*1.2));if(hyp(d.x-t.x,d.y-t.y+20)<20)G.ev.drone=null;}
  d.bz=(d.bz||0)-dt; if(d.bz<=0){d.bz=.18;const dd=hyp(d.x-P.x,d.y-P.y);if(dd<700)AU.tn(210+Math.random()*30,200,.18,'sawtooth',.012*clamp(1-dd/700,.1,1));}
}
STORY.nicoTalk=function(n){
  const F=G.flags;
  if(F.nicoMet)return bark('nico','n',pick2(['Meu drone tá carregando. Te chamo no rádio.','Sabia que eu ia ser útil um dia. Minha mãe dizia que drone era perda de tempo.','Se eu sair daqui, a primeira coisa que eu faço é dormir uma semana.']));
  F.nicoMet=true;
  playCut([{npc:n,id:'nico'},
    {say:'nico',m:'s',t:'Calma, calma! Sou eu do drone! Nicolas!'},
    {say:'rafa',m:'n',t:'Tu tá sozinho aqui?'},
    {say:'nico',m:'t',t:'Meu irmão saiu pra buscar gasolina às onze. Disse que voltava em dez minutos.'},
    {wait:.8},{say:'nico',m:'t',t:'...Faz cinco horas.'},
    {say:'nico',m:'n',t:'Eu fiquei no scanner. Peguei o canal do Exército. Escuta isso:'},
    {sfx:'static',v:1},{say:'guarda',m:'n',radio:true,t:'"...Operação Maré Limpa confirmada. Saturação da faixa litorânea às zero cinco e quarenta. Repito, zero cinco quarenta."'},
    {say:'rafa',m:'s',t:'Saturação... eles vão bombardear tudo?'},
    {say:'nico',m:'s',t:'E tem pior. O helicóptero do porto é da Vértice. Num canal deles: "prioridade: amostras e a Dra. Helena. Civis: negativo".'},
    ...(F.metHelena?[{say:'rafa',m:'a',t:'Eles querem a Helena. Ela é a prova do que eles fizeram.'}]:[{say:'rafa',m:'n',t:'Dra. Helena... a voz do rádio. Ela tá na clínica.'}]),
    {say:'nico',m:'n',t:'Eu não sou de briga, mano. Mas meu drone voa longe. Toma: sobrou do réveillon. Barulho e luz, eles vão atrás.'},
    {do:()=>{const l=invAdd('rojao',3);if(l)boxAdd('rojao',l);AU.pickup();toast('O Nicolas te deu 3 rojões. Arremesse como granada (escolha na mochila).');}},
    {say:'nico',m:'h',t:'Vou ficar de olho em ti lá de cima. Se o rádio chiar, sou eu.'}]);
};
function droneScout(dt){
  const F=G.flags; if(!F.nicoMet||F.radio||CUT.on||G.inB>=0)return; const d=dAt((P.x/TILE)|0,(P.y/TILE)|0); if(d!==3&&!(d>=5&&d<=7))return;
  G.ev.scoutT=(G.ev.scoutT??40)-dt; if(G.ev.scoutT>0)return; G.ev.scoutT=rr(55,80);
  let n=0; for(const e of enemies)if(e.alive&&e.state!=='dorm'&&hyp(e.x-P.x,e.y-P.y)<650){G.blips.push({x:e.x,y:e.y,a:1,big:bigE(e)});n++;}
  AU.static(.5,.4); G.ev.droneFly={x:P.x-500,y:P.y-300,t:0};
  bark('nico','n',n===0?'Drone por cima de ti: rua limpa. Por enquanto.':n<4?`Tô vendo ${n} deles perto de ti. Marquei no teu radar.`:`Mano... ${n} deles em volta. Marquei tudo. Vai devagar.`,{radio:true});
}
// ---------- Alex Rese (Ato 3, Mercado Público de Itajaí) ----------
STORY.alexMeet=function(){
  const F=G.flags; if(F.alexMet)return; F.alexMet=true; const n=npcs.find(x=>x.id==='alex');
  playCut([{npc:n,id:'alex'},{startle:'alex'},
    {say:'alex',m:'a',t:'PARADO! ...Eu tô com um extintor e não tenho medo de usar.'},
    {say:'rafa',m:'s',t:'Professor Rese?!'},
    {say:'alex',m:'s',t:'Richard?! Tu falta na minha aula o semestre inteiro e aparece aqui, no fim do mundo?'},
    {say:'rafa',m:'h',t:'Pelo jeito hoje a chamada é só eu, professor.'},
    {say:'alex',m:'h',t:'Engraçadinho. Senta. Tu vai precisar ouvir isso, e eu não vou repetir. Como sempre.'},
    {say:'alex',m:'n',t:'Antes de dar aula eu trabalhei dois anos na Vértice. Com o Arantes. Saí quando vi o que eles estavam criando.'},
    {say:'alex',m:'t',t:'O que tá naquele navio parado no canal é o T-00. O primeiro. Eles alimentaram ele com tudo que deu errado.'},
    {say:'alex',m:'n',t:'Bala não resolve, ele regenera. Mas o tecido dele odeia cloro. Muito cloro, de uma vez só, derrete ele por fora.'},
    ...(F.nicoMet?[{say:'alex',m:'t',t:'O garoto do drone te falou do bombardeio? Cinco e quarenta. A gente tem até lá.'}]:[]),
    ...(F.marlon==='mar'?[{say:'alex',m:'n',t:'Um rapaz barbudo passou aqui de bote, com uma carabina. Disse que te conhecia. Foi pro porto.'}]:[]),
    {choice:[
      {t:'Termina a arma, professor. Eu seguro o resto.',do:()=>{F.alex='arma';},then:[
        {say:'alex',m:'a',t:'Tem um caminhão da estação de tratamento no pátio, cheio de hipoclorito. Eu misturo o resto aqui.'},
        {say:'alex',m:'n',t:'Quando tu ouvir uma buzina que não para... sai da frente.'}]},
      {t:'Vem com a gente agora, professor.',do:()=>{F.alex='junto';},then:[
        {say:'alex',m:'t',t:'Eu não corro, Richard. Mas sei mexer num guindaste. Meu pai foi estivador nesse porto trinta anos.'},
        {say:'alex',m:'n',t:'Vou pela beira do rio e te espero lá em cima, na cabine. De lá eu vejo o porto inteiro.'}]},
    ]},
    {do:()=>{const l=invAdd('calmante',1);if(l)boxAdd('calmante',l);toast('O professor Rese te deu um calmante.');}},
    {say:'alex',m:'h',t:'E Richard... se eu não aparecer na chamada amanhã, tu tá aprovado. Mas só se eu não aparecer.'}],()=>{if(F.alex==='junto')F.alexGone=true;});
};
STORY.alexTalk=function(n){
  const F=G.flags;
  if(n.id==='alexG')return bark('alex','n',pick2(['Daqui de cima eu vejo tudo. Inclusive tu se escondendo. Anda.','Meu pai dizia: guindaste não perdoa erro. Nem professor.','O navio... ele tá se mexendo por dentro, Richard.']));
  if(!F.alexMet)return STORY.alexMeet();
  bark('alex','n',pick2(F.alex==='arma'?['Hipoclorito, ácido muriático e paciência. Muita paciência.','Vai, Richard. Não fica olhando, que eu erro a medida.','Se der certo, eu viro nome de prova. "Questão Rese".']:['Vou já. Tô juntando coragem. E o chimarrão.','Vai na frente. Eu te alcanço no cais.']));
};
// ---------- a batalha final: os três no porto ----------
const ALLY={list:[],shots:[]}; let hurtEnemyRaw=null;
function allyArrive(){
  const F=G.flags; if(G.ev.allyIn)return; G.ev.allyIn=true;
  const base=LM.pad||{x:P.x,y:P.y}; const mk=(id,dx,dy)=>{const [x,y]=freeTileNear(((base.x+dx)/TILE)|0,((base.y+dy)/TILE)|0,true);return {id,x:tc(x),y:tc(y),r:10,cr:10,ang:0,walk:0,cd:rr(1,2.5),...LOOK12[id]};};
  ALLY.list=[mk('marlon',-300,140),mk('nico',-220,200)]; AU.horn(); AU.shipHorn&&AU.shipHorn();
  bark('marlon','a',F.marlonMet?(F.marlon==='cida'?'RICHARD! A Dona Cida tá no barco do pescador! Vim terminar isso!':'Falei que eu vinha! Tô em cima do contêiner, ó!'):(F.droneSeen?'Ei! Tu é o Richard? O garoto do drone te achou! Cobre aí que eu cubro daqui!':'Ei! Tu é o Richard? Ouvi o rádio do heliponto! Cobre aí que eu cubro daqui!'),{dur:2.6});
  bark('nico','s',F.nicoMet?'Trouxe o resto dos rojões! Todos! Ano novo adiantado, seus desgraçados!':'Oi! Nicolas, prazer, depois a gente conversa! Rojão nele!',{dur:2.6});
}
function allyTick(dt){
  const F=G.flags; if(!F.radio||G.mode!=='play')return; const el=90-G.wave;
  // o helicóptero chegou: os dois correm pra ele
  if(G.heli&&ALLY.list.length&&LM.pad){
    if(!G.ev.allyRun){G.ev.allyRun=1;bark('marlon','a','O HELICÓPTERO! Nicolas, CORRE! Richard, VEM!',{dur:2.2});later(2400,()=>bark('nico','s','Espera! Espera eu! Minhas pernas não funcionam mais!',{dur:2.2}));}
    for(const a of ALLY.list){if(a.boarded)continue;const dx=LM.pad.x-a.x,dy=LM.pad.y-a.y,d=hyp(dx,dy);
      if(d<26&&G.heli.landed){a.boarded=true;AU.thud(.4);continue;}
      if(d>20){const s=(a.id==='nico'?150:175)*dt;a.ang=Math.atan2(dy,dx);move(a,dx/d*s,dy/d*s,false);a.walk=(a.walk||0)+dt*12;a.moving=true;}}
    if(ALLY.list.every(a=>a.boarded)&&!G.ev.allyIn2){G.ev.allyIn2=1;bark('marlon','h','Tamo dentro! Só falta tu, Richard!',{dur:2});}
    return;}
  if(el>=9&&!G.ev.allyIn)allyArrive();
  const boss=enemies.find(e=>e.alive&&e.type==='boss');
  if(!G.ev.alexDone&&boss&&G.ev.allyIn&&el>=14&&(el>=34||boss.hp<boss.max*.62)&&!CUT.on){G.ev.alexDone=true;return alexFinale(boss);}
  if(CUT.on)return;
  for(const a of ALLY.list){
    a.cd-=dt; const tgt=boss||enemies.filter(e=>e.alive&&!e.t.boss&&hyp(e.x-P.x,e.y-P.y)<420).sort((p,q)=>hyp(p.x-P.x,p.y-P.y)-hyp(q.x-P.x,q.y-P.y))[0];
    if(tgt)a.ang=Math.atan2(tgt.y-a.y,tgt.x-a.x);
    if(a.cd>0||!tgt)continue;
    const far=hyp(tgt.x-a.x,tgt.y-a.y); if(far>950||!los(a.x,a.y,tgt.x,tgt.y)){a.cd=.6;continue;}
    if(a.id==='marlon'){a.cd=boss?3.4:1.8;AU.shot('magnum');ALLY.shots.push({x0:a.x,y0:a.y,x1:tgt.x,y1:tgt.y,t:.14});allyHit(tgt,boss?30:60,Math.cos(a.ang)*80,Math.sin(a.ang)*80,{});bloodBurst(tgt.x,tgt.y,6,a.ang);
      if(boss&&Math.random()<.18)bark('marlon','a',pick2(['Na cabeça! ...Ele nem sentiu.','Mais um! Continua, Richard!','Recarregando! Segura ele!']));}
    else{a.cd=boss?7:4;const t2=tgt;ALLY.shots.push({rj:1,x0:a.x,y0:a.y,x1:t2.x,y1:t2.y,t:.8,max:.8,tg:t2});AU.nz(.5,2600,1,.12,'bandpass');}
  }
  for(const s of ALLY.shots){s.t-=dt;if(s.rj&&s.t<=0&&!s.hit){s.hit=1;const t2=s.tg;rojaoBoom(t2&&t2.alive?t2.x:s.x1,t2&&t2.alive?t2.y:s.y1,t2&&t2.alive?t2:null);}}
  ALLY.shots=ALLY.shots.filter(s=>s.t>-.05);
}
// o tiro final é sempre do Richard: os aliados não tiram o último quarto da vida do chefe
function allyHit(e,dmg,kx,ky,o){if(e.type==='boss'){const floor=e.max*.25;if(e.hp<=floor)return;dmg=Math.min(dmg*(G.flags.bossMelt?1.35:1),e.hp-floor);return hurtEnemyRaw(e,dmg,kx,ky,{});}return hurtEnemy(e,dmg,kx,ky,o);}
function rojaoBoom(x,y,tgt){
  const cols=['#ff4a8a','#ffd04a','#4ad0ff','#8aff6a','#ffffff'];
  for(let i=0;i<46;i++){const a=Math.random()*6.283,s=rr(60,320);parts.push({k:'spark',x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(.4,.9),max:.9,s:rr(1.5,3),c:pick2(cols)});}
  AU.nz(.35,1800,.6,.5);AU.tn(1400,300,.4,'square',.05);G.light=Math.max(G.light||0,.35);G.shake+=3;
  if(tgt){allyHit(tgt,tgt.type==='boss'?25:80,0,0,{burn:true});if(tgt.type==='boss')tgt.stun=Math.max(tgt.stun||0,.8);}
  alertNoise(x,y,700);
}
function alexFinale(boss){
  const F=G.flags, arma=F.alex!=='junto', met=F.alexMet;
  const bx=boss.x,by=boss.y;
  if(arma){
    const from={x:bx+tc(18),y:by+tc(6)};
    playCut([{sfx:'horn'},{wait:.3},{sfx:'horn'},
      {say:'alex',m:'a',radio:!met,t:met?'RICHARD! SAI DA FRENTE DELE! AGORA!':'Garoto! Aqui é o professor Rese! SAI DA FRENTE DO BICHO!'},
      {cam:{x:bx,y:by},t:.4},{do:()=>{G.ev.truck={x:from.x,y:from.y,x1:bx,y1:by,t:0,dur:2.2};}},
      {wait:2.2},
      {do:()=>{G.ev.truck=null;explodeFx(bx,by,1.9);AU.bigBoom();for(let i=0;i<70;i++){const a=Math.random()*6.283,s=rr(40,200);parts.push({k:'smoke',x:bx+rr(-30,30),y:by+rr(-30,30),vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rr(2,4),max:4,s:rr(18,34),c:'#b8d08a'});}
        if(boss.alive){allyHit(boss,650,0,0,{burn:true});boss.stun=Math.max(boss.stun||0,3);}F.bossMelt=true;F.alexMorto=true;G.shockT=Math.max(G.shockT||0,30);}},
      {fx:'shake',v:24},{fx:'flash',v:1},{fx:'slow',v:.8},{wait:1.2},
      {say:'rafa',m:'s',t:'PROFESSOR!'},
      {say:'nico',m:'s',t:'Ele tava dentro... ele tava dentro do caminhão...'},
      {sfx:'static',v:1},{say:'alex',m:'k',radio:true,t:'...Richard... a pele dele... tá derretendo. Agora a bala entra.'},
      {say:'alex',m:'h',radio:true,t:'Foi uma honra. Aprovado. Com louvor.',dur:2.6},
      {sfx:'static',v:.6},{wait:.8},
      {say:'marlon',m:'a',t:'FOGO NELE! TUDO QUE TIVER!'},
      {camFree:1}],()=>{ach('rese');});
  } else {
    const cr=LM.guindaste||{x:bx,y:by-200};
    playCut([{cam:cr,t:.8},
      {say:'alex',m:'a',radio:true,t:met?'Richard, puxa ele pra perto do cais! Bem embaixo do gancho!':'Aqui é o professor Rese, no guindaste! Puxem ele pro cais!'},
      {cam:{x:bx,y:by},t:.6},{do:()=>{G.ev.cont={x:bx,y:by,t:0,dur:1.4};AU.creak(1);}},{wait:1.4},
      {do:()=>{G.ev.cont=null;explodeFx(bx,by,1.2);AU.thud(1);AU.bigBoom();if(boss.alive){allyHit(boss,650,0,0,{});boss.stun=Math.max(boss.stun||0,4);}GORE.push({k:'scorch',x:bx,y:by,r:120,rot:0,seed:.2});}},
      {fx:'shake',v:22},{fx:'slow',v:.6},{wait:1},
      {say:'alex',m:'h',radio:true,t:'Desculpa o atraso na chamada, turma.'},
      {sfx:'roar',v:1},{fx:'shake',v:10},{cam:cr,t:.8},
      {say:'alex',m:'s',radio:true,t:'Ele tá subindo pela torre... Richard. Termina isso por mim.'},
      {do:()=>{explodeFx(cr.x,cr.y-30,1.3);AU.scream(1);F.alexMorto=true;G.shockT=Math.max(G.shockT||0,30);}},{fx:'shake',v:16},{sfx:'static',v:1},{wait:1},
      {say:'rafa',m:'s',t:'PROFESSOR!'},
      {say:'marlon',m:'a',t:'Ele deu a vida nisso, Richard! ATIRA!'},
      {camFree:1}],()=>{ach('rese');const b=enemies.find(e=>e.alive&&e.type==='boss');if(b){b.x=bx;b.y=by;}});
  }
}
function v12DrawWorld(){
  for(const a of ALLY.list)if(!a.boarded&&inV(a.x,a.y,60))drawHuman(a.x,a.y,a.ang,{coat:a.col,skin:a.skin,hair:a.hair,pants:'#22242a',look:a.look,wid:a.id==='marlon'?'escopeta':null,loaded:true,walk:a.walk||0,moving:!!a.moving,legAng:a.ang});
  for(const s of ALLY.shots){
    if(s.rj){const k=1-clamp(s.t/s.max,0,1),x=lerp(s.x0,s.x1,k),y=lerp(s.y0,s.y1,k)-Math.sin(k*Math.PI)*80;ctx.fillStyle='#ffd04a';ctx.beginPath();ctx.arc(x,y,3,0,6.283);ctx.fill();parts.push({k:'spark',x,y,vx:rr(-20,20),vy:rr(-20,20),life:.3,max:.3,s:1.5,c:'#ff8a4a'});}
    else{ctx.strokeStyle=`rgba(255,230,160,${clamp(s.t/.14,0,1)})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s.x0,s.y0);ctx.lineTo(s.x1,s.y1);ctx.stroke();}
  }
  const tr=G.ev&&G.ev.truck; if(tr){const k=clamp(tr.t/tr.dur,0,1),x=lerp(tr.x,tr.x1,k*k),y=lerp(tr.y,tr.y1,k*k),a=Math.atan2(tr.y1-tr.y,tr.x1-tr.x);
    ctx.save();ctx.translate(x,y);ctx.rotate(a);ctx.fillStyle='rgba(0,0,0,.4)';ctx.fillRect(-36,-12,76,30);ctx.fillStyle='#d8d4c0';ctx.fillRect(-40,-15,58,30);ctx.fillStyle='#2a6a8a';ctx.fillRect(18,-14,22,28);ctx.fillStyle='#1a2a36';ctx.fillRect(28,-11,9,22);
    ctx.fillStyle='#2a6a8a';ctx.font='700 9px sans-serif';ctx.fillText('CLORO',-34,4);ctx.fillStyle='#ffe8a0';ctx.fillRect(38,-12,4,5);ctx.fillRect(38,7,4,5);ctx.restore();}
  const ct=G.ev&&G.ev.cont; if(ct){const k=clamp(ct.t/ct.dur,0,1),s=lerp(2.2,1,k);ctx.fillStyle=`rgba(0,0,0,${.2+.4*k})`;ctx.beginPath();ctx.ellipse(ct.x,ct.y,70*s*.6,30*s*.6,0,0,6.283);ctx.fill();
    ctx.save();ctx.translate(ct.x,ct.y-(1-k)*260);ctx.scale(s,s);ctx.fillStyle='#b8402a';ctx.fillRect(-44,-18,88,36);ctx.fillStyle='rgba(0,0,0,.2)';for(let i=-40;i<44;i+=8)ctx.fillRect(i,-18,3,36);ctx.restore();}
  const d=G.ev&&G.ev.drone; if(d)drawDrone(d.x,d.y);
  const df=G.ev&&G.ev.droneFly; if(df)drawDrone(df.x,df.y);
  for(const f of FLARES){ctx.fillStyle='#ff3a2a';ctx.beginPath();ctx.arc(f.x,f.y,3,0,6.283);ctx.fill();}
  for(const g of DOGS)drawDog(g);
  // mochilas e caixas térmicas
  const F=G.flags;
  for(const o of interacts){if(o.type!=='mochila'&&o.type!=='cooler')continue;if(!inV(o.x,o.y,40))continue;const used=F['lt'+o.tx+'_'+o.ty];
    ctx.save();ctx.translate(o.x,o.y);ctx.rotate(((o.tx*7+o.ty*3)%10)/10*6.28);ctx.globalAlpha=used?.55:1;
    if(o.type==='mochila'){ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(2,3,10,7,0,0,6.283);ctx.fill();ctx.fillStyle=['#2a4a7a','#7a2a2a','#2a5a3a','#5a4a2a'][(o.tx+o.ty)%4];rrect(ctx,-8,-6,16,12,3);ctx.fill();ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-8,-1,16,2);if(used){ctx.fillStyle='#1a1a1a';ctx.fillRect(-5,-4,10,3);}}
    else{ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-9,-5,20,14);ctx.fillStyle='#d8d8d0';ctx.fillRect(-10,-7,20,13);ctx.fillStyle='#2a7ab8';ctx.fillRect(-10,-7,20,4);ctx.fillStyle='rgba(0,0,0,.2)';ctx.fillRect(-4,-8,8,2);}
    ctx.restore();}
  ctx.globalAlpha=1;
}
function drawDrone(x,y){ctx.save();ctx.translate(x,y);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(10,14,14,6,0,0,6.283);ctx.fill();
  ctx.strokeStyle='#2a2c30';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-9,-9);ctx.lineTo(9,9);ctx.moveTo(9,-9);ctx.lineTo(-9,9);ctx.stroke();ctx.fillStyle='#3a3c40';ctx.fillRect(-4,-4,8,8);
  for(const [px,py] of [[-9,-9],[9,-9],[-9,9],[9,9]]){ctx.strokeStyle='rgba(200,200,210,.5)';ctx.beginPath();ctx.arc(px,py,5,renderT*30,renderT*30+2);ctx.stroke();}
  ctx.fillStyle=((renderT*4)|0)%2?'#ff3a2a':'#3aff6a';ctx.fillRect(-1,-1,2,2);ctx.restore();}

// ---------- sinalizador e rojão (arremesso) ----------
const FLARES=[], V12P=[];
function v12Throw(id,dist){
  const c=Math.cos(P.ang),s=Math.sin(P.ang); V12P.push({k:id,x:P.x+c*14,y:P.y+s*14,vx:c*dist/.8,vy:s*dist/.8,t:.8}); AU.swish();
  if(id==='rojao'&&!G.flags.rjTip){G.flags.rjTip=true;toast('O rojão estoura onde cair. Tudo que escuta corre pra lá.');}
  if(id==='sinal'&&!G.flags.slTip){G.flags.slTip=true;toast('O sinalizador queima por meio minuto. Ilumina e atrai os que enxergam.');}
}
function v12ProjTick(dt){
  for(const p of V12P){p.t-=dt;const nx=p.x+p.vx*dt,ny=p.y+p.vy*dt;if(SOLID[getT((nx/TILE)|0,(ny/TILE)|0)]){p.vx*=-.3;p.vy*=-.3;}else{p.x=nx;p.y=ny;}
    if(p.t<=0){p.dead=1;if(p.k==='rojao')rojaoBoom(p.x,p.y,null);else{FLARES.push({x:p.x,y:p.y,t:30});lights.push(p.light={x:p.x,y:p.y,r:200,c:'fire',f:1,tmp:1});}}}
  for(let i=V12P.length-1;i>=0;i--)if(V12P[i].dead)V12P.splice(i,1);
  for(const f of FLARES){f.t-=dt;f.at=(f.at||0)-dt;if(f.at<=0){f.at=1.5;for(const e of enemies)if(e.alive&&!e.t.blind&&e.type!=='ouvinte'&&!e.t.boss&&e.state!=='chase'&&hyp(e.x-f.x,e.y-f.y)<520){e.state='investigate';e.nx=f.x+rr(-20,20);e.ny=f.y+rr(-20,20);e.it=6;}}
    if(Math.random()<dt*20)parts.push({k:'smoke',x:f.x,y:f.y,vx:rr(-8,8),vy:rr(-30,-10),life:1.2,max:1.2,s:rr(5,9),c:'#8a3a30'});}
  for(let i=FLARES.length-1;i>=0;i--)if(FLARES[i].t<=0){const f=FLARES[i];const li=lights.findIndex(l=>l.tmp&&l.x===f.x&&l.y===f.y);if(li>=0)lights.splice(li,1);FLARES.splice(i,1);}
}

// ---------- eventos aleatórios novos ----------
const DOGS=[];
function v12Events(dt){
  const F=G.flags; if(CUT.on||G.pSafe||P.inCar||F.radio)return;
  G.ev.e12T=(G.ev.e12T??rr(120,180))-dt; if(G.ev.e12T>0)return; G.ev.e12T=rr(160,260); if(!evOK(50))return; evMark();
  const night=isNight(), bc=(()=>{const d=dAt((P.x/TILE)|0,(P.y/TILE)|0);return d>=5&&d<=7;})();
  const pool=[['tv',bc?3:1],['mimico',night?4:1],['crianca',night?2:1],['cao',2],['fogos',1],['celular',2]];
  let tot=0;for(const p of pool)tot+=p[1];let r=Math.random()*tot,k='tv';for(const [n,w] of pool){r-=w;if(r<=0){k=n;break;}}
  if(k==='tv'){const b=buildings.filter(b=>b.name&&!b.safe&&hyp((b.x+b.w/2)*TILE-P.x,(b.y+b.h/2)*TILE-P.y)<520)[0];if(!b)return;const x=clamp(P.x,b.x*TILE,(b.x+b.w)*TILE),y=clamp(P.y,b.y*TILE,(b.y+b.h)*TILE);
    const L=pick2([['...a Vértice S.A. nega qualquer relação com o surto...','...permaneçam em suas casas, com portas e janelas fechadas...','...o Exército informa que a evacuação foi— (chiado)'],['...Plantão. Plantão. Pedimos que ninguém tente atravessar a BR-101...','...pessoas mordidas devem ser isoladas imediatamente, mesmo familiares...','...mesmo... familiares...'],['(uma TV ligada sozinha, num programa de culinária gravado)','"...e agora a gente deixa descansar por quarenta minutos..."','(alguém bate no vidro da TV por dentro da loja)']]);
    L.forEach((t,i)=>later(i*2600,()=>{psyFloat(x,y,t,{life:2.6,c:'#a8c8e8'});AU.static(.4,.5);}));alertNoise(x,y,300);return;}
  if(k==='mimico'){const z=enemies.filter(e=>e.alive&&(e.type==='zumbi'||e.type==='corr')&&!e.vis&&e.state!=='chase'&&hyp(e.x-P.x,e.y-P.y)>260&&hyp(e.x-P.x,e.y-P.y)<520)[0];if(!z)return;z.mimic=4;return;}
  if(k==='crianca'){const s=farSpot(320,460);if(!s)return;G.ev.kid={x:s.x,y:s.y,t:0};return;}
  if(k==='cao'){if(DOGS.length)return;const s=evSpot(160,240,null,false);if(!s)return;const g=evSpot(380,560,null,false);if(!g)return;DOGS.push({x:s.x,y:s.y,r:9,cr:9,tx:g.x,ty:g.y,ang:0,walk:0,st:'come',t:0});AU.tn(700,500,.15,'square',.05);AU.tn(700,500,.15,'square',.05,.25);return;}
  if(k==='fogos'){const s=farSpot(700,1000);if(!s)return;G.ev.fogos={x:s.x,y:s.y,n:6,t:0};later(1200,()=>bark('rafa','s','Fogos... alguém tá soltando fogos. Tem gente viva lá. Ou tinha.',{dur:2.2}));return;}
  if(k==='celular'){const s=farSpot(160,280);if(!s)return;const [x,y]=freeTileNear((s.x/TILE)|0,(s.y/TILE)|0,true);GORE.push({k:'corpse',x:tc(x),y:tc(y),rot:Math.random()*6,type:'zumbi',col:pick2(PED_LOOK)[0],skin:'#c8a890',r:11});G.ev.phone12={x:tc(x),y:tc(y),t:0,rings:0};return;}
}
function v12EventTick(dt){
  // o que imita voz de gente
  for(const e of enemies){if(!e.mimic||!e.alive)continue;e.mimicT=(e.mimicT||0)-dt;const d=hyp(e.x-P.x,e.y-P.y);
    if(d<110||e.vis){e.mimic=0;e.state='chase';e.lx=P.x;e.ly=P.y;AU.roar();G.shake+=5;if(!G.flags.mimTip){G.flags.mimTip=true;bark('rafa','s','Era ELE pedindo socorro! Ele tava imitando gente!',{dur:2});}continue;}
    if(e.mimicT<=0){e.mimicT=rr(3,5);e.mimic--;AU.cry(pick2(['socorro','ajuda']),e.x,e.y,.8);psyFloat(e.x,e.y,pick2(['...socorro...','Aqui... me ajuda...','Moço... vem cá...','Tô machucado... aqui...']),{life:2.2,c:'#e0c8b8'});
      e.state='investigate';e.nx=P.x;e.ny=P.y;e.it=4;}}
  const kid=G.ev.kid; if(kid){kid.t+=dt;kid.c=(kid.c||0)-dt;if(kid.c<=0){kid.c=3.2;AU.cry('choro',kid.x,kid.y,.9);psyFloat(kid.x,kid.y,pick2(['(uma criança chorando)','"Mãe... mãe, cadê você..."','"Tá escuro... tô com medo..."']),{life:2.6,c:'#c8c8e0'});}
    if(hyp(kid.x-P.x,kid.y-P.y)<90){G.ev.kid=null;const [x,y]=freeTileNear((kid.x/TILE)|0,(kid.y/TILE)|0,true);const e=makeEnemy('corr',tc(x),tc(y),null);e.r=8;e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);AU.scream(1);G.shake+=10;buzz([90,40,120]);alertNoise(kid.x,kid.y,900);
      bark('rafa','s','Não... não... era uma criança. ERA UMA CRIANÇA.',{dur:2.2});}
    else if(kid.t>40)G.ev.kid=null;}
  for(const g of DOGS){g.t+=dt;const d=hyp(g.x-P.x,g.y-P.y);let tx=g.x,ty=g.y,spd=0;
    if(g.st==='come'){tx=P.x;ty=P.y;spd=130;if(d<60){g.st='lead';AU.tn(600,450,.12,'square',.05);bark('rafa','h','Ei... ei, amigão. Tu tá sozinho também? ...Quer que eu te siga?',{dur:2.4});}}
    else if(g.st==='lead'){const dt2=hyp(g.tx-g.x,g.ty-g.y);if(d>220){spd=0;g.wait=(g.wait||0)+dt;if(g.wait>1.5){g.wait=0;AU.tn(650,480,.12,'square',.045);}}else{tx=g.tx;ty=g.ty;spd=95;}
      if(dt2<30){g.st='dig';g.t=0;}}
    else if(g.st==='dig'){if(d<90&&!g.gave){g.gave=1;lootDrop({tx:(g.x/TILE)|0,ty:(g.y/TILE)|0},3);bark('rafa','h','Uma mochila enterrada... tu me trouxe aqui. Bom garoto.',{dur:2.2});}if(g.gave&&g.t>3){g.st='go';}}
    else if(g.st==='go'){tx=g.x+(g.x-P.x);ty=g.y+(g.y-P.y);spd=150;if(d>900)g.gone=1;}
    for(const e of enemies)if(e.alive&&!e.t.boss&&hyp(e.x-g.x,e.y-g.y)<40&&g.st!=='go'){g.st='go';AU.tn(900,300,.4,'sawtooth',.06);}
    if(spd>0){const a=Math.atan2(ty-g.y,tx-g.x);g.ang=a;move(g,Math.cos(a)*spd*dt,Math.sin(a)*spd*dt,true);g.walk+=dt*14;}}
  for(let i=DOGS.length-1;i>=0;i--)if(DOGS[i].gone)DOGS.splice(i,1);
  const fg=G.ev.fogos; if(fg){fg.t-=dt;if(fg.t<=0&&fg.n>0){fg.n--;fg.t=rr(.6,1.4);const x=fg.x+rr(-90,90),y=fg.y+rr(-90,90);rojaoBoom(x,y,null);for(const e of enemies)if(e.alive&&!e.t.boss&&e.state!=='chase'&&hyp(e.x-x,e.y-y)<1300){e.state='investigate';e.nx=x;e.ny=y;e.it=12;}}if(fg.n<=0&&fg.t<=0)G.ev.fogos=null;}
  const ph=G.ev.phone12; if(ph){ph.t-=dt;const d=hyp(ph.x-P.x,ph.y-P.y);if(ph.t<=0&&ph.rings<8){ph.t=2;ph.rings++;AU.phone(clamp(1-d/700,.2,1));psyFloat(ph.x,ph.y,'(um celular tocando no bolso de um corpo)',{life:1.8,c:'#c8d8e8'});}
    if(d<50){G.ev.phone12=null;const msgs=[['"Filho, é a mãe. Tô no ginásio com a Defesa Civil. Disseram que é seguro. Vem pra cá, tá?"','(mensagem das 22h40)'],['"Amor, não abre a porta pra ninguém. NINGUÉM. Nem pra mim. Se eu bater, não abre."','(mensagem das 23h12)'],['"...tá ouvindo? Eles tão na escada. Se tu ouvir isso, eu te amo. Desculpa pela briga..."','(mensagem das 00h03)']];
      const m=pick2(msgs);AU.static(.5,.4);psyFloat(P.x,P.y-30,m[1],{life:2,c:'#8a9aa8',edge:false});later(600,()=>psyFloat(P.x,P.y-30,m[0],{life:5,c:'#d8e0e8',edge:false}));
      later(5400,()=>bark('rafa','t','Ninguém atendeu ele. Ninguém vai atender.',{dur:2}));}
    else if(ph.rings>=8)G.ev.phone12=null;}
}
// batidas na porta do quarto seguro, de quem não devia estar lá fora
function safeKnock(dt){
  const F=G.flags; if(!G.pSafe||CUT.on||F.radio||!isNight())return;
  G.ev.knT=(G.ev.knT??rr(70,120))-dt; if(G.ev.knT>0)return; G.ev.knT=rr(140,220);
  const b=G.inB>=0?buildings[G.inB]:null; if(!b)return; const dx=(b.x+b.w/2)*TILE, dy=(b.y+b.h)*TILE-8;
  const voices=[]; if(F.tiaoMorto)voices.push(['tiao','Garoto... é o Tião. Abre a porta. Tá frio aqui fora.']); if(F.ivoMorto)voices.push(['ivo','Moço... a Rosa tá comigo. Deixa a gente entrar...']);
  if(F.cidaTurned)voices.push(['cida','Menino... é a Cida. Esqueci minha chave. Abre pra mim, abre...']); if(F.alexMorto)voices.push(['alex','Richard. Chamada. Responde a chamada.']);
  AU.knock(); G.shake+=2;
  later(1400,()=>{AU.knock();if(voices.length){const [w,t]=pick2(voices);psyFloat(dx,dy,'"'+t+'"',{life:3.6,c:'#c8b8a8'});AU.cry('sussurro',dx,dy,1.2);
      later(4200,()=>{bark('rafa','s',pick2(['Não abre. Não abre. Ele morreu. Eu VI.','Não é ele. Não pode ser ele.','Não responde. Fica quieto.']),{dur:2.2});});}
    else psyFloat(dx,dy,'"Tem alguém aí? Por favor... abre..."',{life:3,c:'#c8b8a8'});
    later(7000,()=>{AU.nz(1.6,2400,4,.08,'bandpass');psyFloat(dx,dy,'(unhas arranhando a porta, devagar)',{life:2.6,c:'#8a8a8a'});});});
}
// respiração do outro lado da parede
function wallBreath(dt){
  if(G.inB<0||G.pSafe||CUT.on||!isNight())return; const b=buildings[G.inB]; if(!b||!(b.dark||!powerOn(b.id)))return;
  G.ev.wbT=(G.ev.wbT??rr(60,90))-dt; if(G.ev.wbT>0)return; G.ev.wbT=rr(100,160); if(!evOK(30))return; evMark();
  for(let i=0;i<20;i++){const a=Math.random()*6.283,x=P.x+Math.cos(a)*48,y=P.y+Math.sin(a)*48;if(SOLID[getT((x/TILE)|0,(y/TILE)|0)]){
    AU.breath(1,true);later(700,()=>AU.breath(.9,false));later(1700,()=>AU.breath(1,true));later(2400,()=>AU.breath(.8,false));
    psyFloat(x,y,'(alguém respirando do outro lado da parede)',{life:3,c:'#8a8a9a',edge:false});G.fear=Math.max(G.fear||0,.5);return;}}
}
function drawDog(g){ctx.save();ctx.translate(g.x,g.y);ctx.rotate(g.ang);ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(1,3,13,6,0,0,6.283);ctx.fill();
  const l=Math.sin(g.walk*1.4)*3;ctx.fillStyle='#5a3a1e';for(const [lx,ly] of [[6,-4],[6,4],[-6,-4],[-6,4]])ctx.fillRect(lx+(lx>0?l:-l)-2,ly+(ly>0?0:-2),4,3);
  ctx.fillStyle='#a8743a';ctx.beginPath();ctx.ellipse(0,0,11,5.5,0,0,6.283);ctx.fill();ctx.beginPath();ctx.ellipse(10,0,5,4,0,0,6.283);ctx.fill();ctx.fillStyle='#5a3a1e';ctx.beginPath();ctx.ellipse(9,-3.5,2,1.4,0,0,6.283);ctx.ellipse(9,3.5,2,1.4,0,0,6.283);ctx.fill();
  ctx.strokeStyle='#a8743a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-10,0);ctx.lineTo(-15,Math.sin(renderT*12)*4);ctx.stroke();ctx.fillStyle='#c83a2a';ctx.fillRect(4,-1,2,2);ctx.restore();}

// ---------- câmera: perto no apertado, longe no aberto ----------
function camTick(dt){
  G.camT=(G.camT||0)-dt; if(G.camT<=0){G.camT=.25;
    let f;
    if(P.inCar)f=1; else if(P.hidden)f=1.2;
    else{let s=0;const n=12;for(let i=0;i<n;i++){const a=i/n*6.283;s+=castRay(P.x,P.y,a,520,BULLET_BLOCK,false);}const avg=s/n;
      const b=G.inB>=0?buildings[G.inB]:null, scary=b&&(b.dark||b.kind==='hospital2'||b.kind==='hospital'||b.kind==='shop'||!powerOn(b.id));
      f=lerp(1.24,.86,clamp((avg-90)/330,0,1)); if(b)f=Math.max(f,scary?1.2:1.08); if(isNight()&&!lampOn()&&!b)f+=.04;}
    G.camTgt=clamp(f,.8,1.28);}
  G.camF=lerp(G.camF||1,G.camTgt||1,Math.min(1,dt*1.4));
}


// ---------- ligações ----------
(function(){
  const baseNpc=STORY.npc;
  STORY.npc=function(n){
    if(n.id==='marlon')return bark('marlon','n','Vai, Richard. Eu cubro daqui.');
    if(n.id==='marlonC')return STORY.marlonCida(n);
    if(n.id==='marlonA')return STORY.marlonArm(n);
    if(n.id==='nico')return STORY.nicoTalk(n);
    if(n.id==='alex'||n.id==='alexG')return STORY.alexTalk(n);
    return baseNpc.call(STORY,n);
  };
  const baseEnd=STORY.ending;
  STORY.ending=function(){
    const r=baseEnd.call(STORY), F=G.flags;
    let add=' O helicóptero era da Defesa Civil: o Nicolas tinha trocado a frequência no último minuto, e a Vértice nunca soube.';
    if(G.ev&&G.ev.allyIn)add+=' O Marlon sentou na porta aberta do helicóptero, com a carabina no colo, e não tirou o olho do porto. O Nicolas dormiu em dois minutos, abraçado ao controle do drone.';
    if(F.alexMorto)add+=F.alex==='junto'?' Lá embaixo, a cabine do guindaste ainda queimava. O professor Rese ficou lá em cima, de onde dava pra ver o porto inteiro.':' Lá embaixo, onde o caminhão de cloro explodiu, ainda subia uma fumaça verde. O professor Rese nunca deu a prova de recuperação.';
    if(F.marlon==='cida'&&!F.cidaTurned)add+=' Em algum lugar no mar, um barco de pescador levava a Dona Cida e um gato laranja muito irritado.';
    r.b+=add; return r;
  };
  const v16=v16Tick;
  v16Tick=function(dt){if(G.v12Run!==RUNID){G.v12Run=RUNID;ALLY.list=[];ALLY.shots=[];FLARES.length=0;DOGS.length=0;V12P.length=0;for(let i=lights.length-1;i>=0;i--)if(lights[i].tmp)lights.splice(i,1);}
    v16(dt);if(G.mode==='play'){camTick(dt);v12ProjTick(dt);droneTick(dt);if(G.ev.droneFly){const f=G.ev.droneFly;f.t+=dt;f.x+=420*dt;f.y+=240*dt;if(f.t>3)G.ev.droneFly=null;}
    if(G.ev.truck)G.ev.truck.t+=dt; if(G.ev.cont)G.ev.cont.t+=dt;
    allyTick(dt); if(!CUT.on){v12Events(dt);v12EventTick(dt);droneScout(dt);v12Plot(dt);safeKnock(dt);wallBreath(dt);}}};
  const sw=startWave; startWave=function(){sw();const F=G.flags;
    later(2500,()=>bark('nico','s',F.nicoMet?'Richard! Eu entrei no canal da Vértice e mandei o helicóptero da Defesa Civil pro teu heliponto no lugar do deles! Segura noventa segundos!':(F.marlonMet?'Aqui é o Nicolas, amigo do Marlon!':'Aqui é o Nicolas, de Balneário! Tô te vendo pelo drone!')+' Troquei a frequência: quem tá vindo é a Defesa Civil, não a Vértice! Aguenta aí!',{radio:true,dur:3.4}));};
  const dc=drawComps; drawComps=function(){dc();v12DrawWorld();};
  const el=evLights; evLights=function(){el();const tr=G.ev&&G.ev.truck;if(tr){const k=clamp(tr.t/tr.dur,0,1);punch(lerp(tr.x,tr.x1,k*k),lerp(tr.y,tr.y1,k*k),180,.8);}
    const ct=G.ev&&G.ev.cont;if(ct)punch(ct.x,ct.y,200,.7);for(const a of ALLY.list)punch(a.x,a.y,70,.5);for(const f of FLARES)punch(f.x,f.y,170,.75);const d=G.ev&&G.ev.drone;if(d)punch(d.x,d.y,40,.5);};
  const hw=healWith; healWith=function(id){if(id==='calmante'){invRemove('calmante',1);G.fear=0;G.shockT=0;P.hp=Math.min(P.max,P.hp+10);AU.heal();toast('O coração desacelerou. A mão parou de tremer.');return true;}return hw(id);};
  hurtEnemyRaw=hurtEnemy; hurtEnemy=function(e,dmg,kx,ky,o){if(e&&e.type==='boss'&&o&&o.ally)return allyHit(e,dmg,kx,ky,{});if(e&&e.type==='boss'&&G.flags.bossMelt)dmg*=1.35;return hurtEnemyRaw(e,dmg,kx,ky,o);};
})();
// gatilhos da história
function v12Plot(dt){
  const F=G.flags, d=dAt((P.x/TILE)|0,(P.y/TILE)|0);
  if(F.eduJoin&&!F.marlonMet&&!F.bloqueio&&LM.marlon&&!P.inCar&&hyp(P.x-LM.marlon.x,P.y-LM.marlon.y)<300)return STORY.marlonMeet();
  if(F.bloqueio&&d===3&&!F.droneSeen&&!G.ev.drone&&G.inB<0)droneStart();
  if(F.vertice&&!F.alexMet&&LM.alex&&G.inB>=0&&G.inB===bOf((LM.alex.x/TILE)|0,(LM.alex.y/TILE)|0))return STORY.alexMeet();
  if(F.marlon==='mar'&&F.vertice&&!F.marlonRadio&&d<=1){F.marlonRadio=true;AU.static(1,.6);bark('marlon','n','Richard, é o Marlon. Cheguei de bote. Tô no Armazém 4 do porto. Achei uma lista da Vértice. Vem me ver.',{radio:true});}
  const fotos=FOTOS.reduce((n,_,i)=>n+(G.files.has(FOTO0+i)?1:0),0); if(fotos>=FOTOS.length&&!F.albumDone){F.albumDone=true;ach('album');toast('Você achou todas as fotos.');}
  if(F.radio&&G.ev.allyIn&&F.alexMorto&&!F.trioAch){F.trioAch=true;ach('trio');}
}

// ---------- menu de teste (1.2) ----------
(function(){
  const base=dbgJump;
  dbgJump=function(k){
    const goTo=pt=>{if(!pt)return;if(P.inCar)exitCar(true);const [x,y]=freeTileNear((pt.x/TILE)|0,(pt.y/TILE)|0,true);P.x=tc(x);P.y=tc(y);snapCamera();flowTile=-1;};
    if(k==='marlon'){base('caos');G.flags.marlonMet=false;goTo({x:LM.marlon.x,y:LM.marlon.y+tc(6)});G.comps.forEach(c=>{c.x=P.x-30;c.y=P.y;});return;}
    if(k==='nico'){base('brava');goTo({x:LM.nico.x,y:LM.nico.y+tc(8)});return;}
    if(k==='alex'){base('itajai');G.flags.alexMet=false;goTo({x:LM.alex.x,y:LM.alex.y+tc(10)});return;}
    if(k==='final'){base('navio');return;}
    return base(k);
  };
})();

// ---------- fuzil (final do jogo) e limite de 3 armas de fogo ----------
WEAPONS.push({id:'fuzil',n:'Fuzil FAL',ammo:'r762',mag:20,dmg:58,rate:.15,spread:.028,speed:1500,reload:2.3,pellets:1,crit:.15,pierce:2,noise:900,kick:4.5,knock:140,life:.9,len:24});
ITEMS.r762={n:'Munição 7,62',s:'7,62',c:'#b8a46a',st:40,k:'ammo',d:'Munição de fuzil, do arsenal da Vértice. Atravessa dois de uma vez.'};
WMODEL.fuzil={len:32,fore:18};
(function(){
  const dw=drawWeaponModel;
  drawWeaponModel=function(c,id,loaded=true,firing=false){
    if(id!=='fuzil')return dw(c,id,loaded,firing);
    const R2=(x,y,w,h,r,f)=>{rrect(c,x,y,w,h,r);c.fillStyle=f;c.fill();};
    R2(-17,-2.6,11,5.2,1.2,'#2a2c2e'); R2(-7,-2.4,22,4.8,1.2,'#33363a'); R2(14,-1.1,16,2.2,.8,'#1e2022'); R2(29,-1.6,3,3.2,.6,'#141516');
    R2(1,2.2,4,6,1,'#1c1d1f'); R2(-3,1.8,3,4.4,1,'#2a2c2e'); c.fillStyle='#4a4e52';c.fillRect(-4,-3.6,12,1.2);
    c.fillStyle='rgba(255,255,255,.14)';c.fillRect(-7,-2.2,22,.8);
    if(firing){c.fillStyle='rgba(255,200,90,.9)';c.beginPath();c.moveTo(32,0);c.lineTo(42,-4);c.lineTo(39,0);c.lineTo(42,4);c.closePath();c.fill();}
  };
  const sh=AU.shot.bind(AU); AU.shot=function(id){if(id==='fuzil'){this.nz(.32,1900,.6,.85);this.tn(140,45,.18,'square',.22);this.nz(.6,400,.8,.25,'lowpass',.05);return;}return sh(id);};
})();
function idropAdd(p){const F=G.flags;F.idrops=[...(F.idrops||[]),{uid:p.uid,tx:p.tx,ty:p.ty,id:p.id,q:p.q}];}
function firearms(){const r=[];for(let i=1;i<WEAPONS.length;i++)if(i!==8&&P.owned[i])r.push(i);return r;}
// pegar uma 4ª arma de fogo: larga a que está na mão (ou a mais antiga) no chão
function wpnLimit(p){
  const F=G.flags;
  if(p.uid&&String(p.uid).startsWith('wd'))F.wdrops=(F.wdrops||[]).filter(w=>w.uid!==p.uid);
  if(p.id===0||p.id===8||P.owned[p.id])return;
  const own=firearms(); if(own.length<3)return;
  const d=own.includes(P.w)?P.w:own[0], q=P.mags[d]||0;
  P.owned[d]=false; P.mags[d]=0; if(P.w===d)P.w=(p.id!=null&&p.id!==0)?p.id:8; 
  const [x,y]=freeTileNear((P.x/TILE)|0,(P.y/TILE)|0,true), uid='wd'+(G.dropN++)+'_'+((Math.random()*1e6)|0);
  pickups.push({uid,tx:x,ty:y,x:tc(x),y:tc(y),id:d,q,kind:'weapon'}); pickOcc.add(idx(x,y));
  F.wdrops=[...(F.wdrops||[]),{uid,tx:x,ty:y,id:d,q}];
  toast(`Só dá pra carregar 3 armas. Você largou ${WEAPONS[d].n} no chão.`);
}
(function(){
  const aws=applyWorldState;
  applyWorldState=function(){aws();for(const w of (G.flags.wdrops||[]))if(!pickups.some(p=>p.uid===w.uid))pickups.push({uid:w.uid,tx:w.tx,ty:w.ty,x:tc(w.tx),y:tc(w.ty),id:w.id,q:w.q,kind:'weapon'});
    for(const w of (G.flags.idrops||[]))if(!G.taken.has(w.uid)&&!pickups.some(p=>p.uid===w.uid)){pickups.push({uid:w.uid,tx:w.tx,ty:w.ty,x:tc(w.tx),y:tc(w.ty),id:w.id,q:w.q,kind:'item'});pickOcc.add(idx(w.tx,w.ty));}};
  // itens largados no chão (pelo jogador ou pelo Brandt) continuam lá depois de carregar o registro
  const tp=takePickup; takePickup=function(p){const r=tp(p);const F=G.flags;if(p&&F.idrops&&F.idrops.some(w=>w.uid===p.uid)){if(G.taken.has(p.uid))F.idrops=F.idrops.filter(w=>w.uid!==p.uid);else for(const w of F.idrops)if(w.uid===p.uid)w.q=p.q;}return r;};
  const g12=genV12;
  genV12=function(){g12();const lab=LM.lab||{x:tc(64),y:tc(19)};addPick((lab.x/TILE)|0,((lab.y/TILE)|0)+2,9,20,'weapon');addPick(((lab.x/TILE)|0)+3,((lab.y/TILE)|0)+2,'r762',20);addPick(88,18,'r762',20);addPick(160,26,'r762',20);};
})();

// ---------- menu de teste só com o código ----------
let DBG_OK=false;
LOCKS.dbg={n:4,code:'1707',kick:'Ferramentas',t:'Menu de teste',hint:'Digite o código de acesso.',open(){DBG_OK=true;UI.debug();}};
(function(){const d=UI.debug.bind(UI);UI.debug=function(){if(!DBG_OK){this.code='';return this.keypad('dbg');}return d();};})();

// ---------- Santa Clara: os dutos ----------
function hospDucts(){
  const hb=hosp2B(); if(hb<0)return; const b=buildings[hb]; LM.ducts=[];
  // 8 setores (4x2): em cada um, um piso encostado em parede, longe da entrada e da saída
  for(let sy=0;sy<2;sy++)for(let sx=0;sx<4;sx++){
    const x0=b.x+2+sx*((b.w-4)/4|0), y0=b.y+2+sy*((b.h-4)/2|0), w=(b.w-4)/4|0, h=(b.h-4)/2|0; let best=null;
    for(let k=0;k<60&&!best;k++){const x=x0+((R()*w)|0),y=y0+((R()*h)|0),i=idx(x,y);if(SOLID[map[i]]||bmap[i]!==hb)continue;
      let wall=0;for(const [dx,dy] of DIRS4)if(SOLID[map[idx(x+dx,y+dy)]])wall++;if(wall<1||wall>2)continue;
      if(LM.hospIn&&hyp(tc(x)-LM.hospIn.x,tc(y)-LM.hospIn.y)<200)continue;if(LM.hospExit&&hyp(tc(x)-LM.hospExit.x,tc(y)-LM.hospExit.y)<160)continue;
      if(pickOcc.has(i))continue;best={x:tc(x),y:tc(y),tx:x,ty:y,i:LM.ducts.length};}
    if(best)LM.ducts.push(best);}
}
(function(){const g=genV12;genV12=function(){g();hospDucts();};})();
function ductTick(dt){
  const F=G.flags, o=enemies.find(e=>e.alive&&e.type==='ouvinte'); if(!o||!LM.ducts||!LM.ducts.length)return;
  const hb=hosp2B(); if(G.inB!==hb||CUT.on||F.hospOut){G.ev.duct=null;return;}
  const dv=G.ev.duct;
  if(dv){dv.t-=dt;dv.c-=dt;
    if(dv.c<=0){dv.c=rr(.5,.9);const n=pick2(LM.ducts);const d=hyp(n.x-P.x,n.y-P.y);AU.thud(clamp(1-d/700,.15,.7));AU.nz(.25,600,2,.06*clamp(1-d/700,.2,1),'bandpass');}
    if(dv.t<=0){G.ev.duct=null;const t=dv.to;F['duct'+t.i]=1;
      o.x=t.x;o.y=t.y;o.heard=3.5;o.nx=P.x+rr(-50,50);o.ny=P.y+rr(-50,50);o.hot=false;o.listen=0;o.smell=0;o.vx=0;o.vy=0;
      for(let i=0;i<26;i++)parts.push({k:'debris',x:t.x,y:t.y,vx:rr(-200,200),vy:rr(-200,200),life:.7,max:.7,s:rr(2,4),c:i%2?'#6a6e72':'#3a3c40'});
      AU.thud(1);AU.click2(1);AU.roar();G.shake+=12;buzz([90,40,120]);
      if(!F.ductTip){F.ductTip=true;later(500,()=>bark(F.matFollow?'matheus':'rafa','s',F.matFollow?'ELA VEIO PELO DUTO! Ela anda por dentro das paredes, mano!':'Ela saiu do duto... ela anda por dentro das paredes.',{dur:2.2}));}}
    return;}
  G.ev.ductCd=(G.ev.ductCd??20)-dt; if(G.ev.ductCd>0)return;
  if(hyp(o.x-P.x,o.y-P.y)<480||o.heard>0&&o.hot)return;   // perto: ela vem andando mesmo
  // o duto mais perto de você (mas não colado), que não seja o que ela já está
  const opts=LM.ducts.filter(d=>hyp(d.x-P.x,d.y-P.y)>110&&hyp(d.x-o.x,d.y-o.y)>200).sort((a,b)=>hyp(a.x-P.x,a.y-P.y)-hyp(b.x-P.x,b.y-P.y));
  const to=opts[0]; if(!to||hyp(to.x-P.x,to.y-P.y)>420)return;
  G.ev.ductCd=rr(35,55); G.ev.duct={to,t:3.2,c:0}; o.listen=3.5;
  AU.creak(.6); if(!F.ductHear){F.ductHear=true;later(400,()=>bark('rafa','s','Tem alguma coisa se arrastando... dentro do teto. Nos dutos.',{dur:2}));}
}
function drawDucts(){
  if(!LM.ducts)return; const F=G.flags;
  for(const d of LM.ducts){if(!inV(d.x,d.y,30))continue;const br=F['duct'+d.i], dv=G.ev&&G.ev.duct, shake=dv&&dv.to===d?rr(-1.5,1.5):0;
    ctx.save();ctx.translate(d.x+shake,d.y);ctx.fillStyle='#0c0d0e';ctx.fillRect(-11,-11,22,22);
    if(!br){ctx.fillStyle='#55595e';ctx.fillRect(-12,-12,24,3);ctx.fillRect(-12,9,24,3);ctx.fillRect(-12,-12,3,24);ctx.fillRect(9,-12,3,24);for(let k=-6;k<=6;k+=4)ctx.fillRect(-9,k,18,1.6);}
    else{ctx.fillStyle='#55595e';ctx.save();ctx.rotate(.6);ctx.fillRect(4,-14,22,4);ctx.restore();ctx.fillStyle='rgba(90,20,16,.6)';ctx.beginPath();ctx.arc(2,3,7,0,6.283);ctx.fill();}
    ctx.restore();}
}
(function(){const dw=v12DrawWorld;v12DrawWorld=function(){drawDucts();dw();};
  const v=v16Tick;v16Tick=function(dt){v(dt);if(G.mode==='play')ductTick(dt);};})();

// ---------- mapa (M): missões secundárias, personagens, legenda ----------
function sideMissions(){
  const F=G.flags, L=[];
  const add=(at,t,c,k)=>{if(at)L.push({at,t,c:c||'#7ab8e8',k:k||'side'});};
  if(F.askedCat&&!F.catDone&&invCount('gato')<=0)add(LM.coreto,'Mingau, o gato da Dona Cida');
  if(invCount('gato')>0)add(LM.cidaDoor,'Levar o Mingau pra Dona Cida');
  if(!F.cofre)add(LM.cofre,'Cofre do Banco Popular');
  if(!F.onibus)add(LM.onibus,'Ônibus 22 da rodoviária');
  if(!F.somTip)add(LM.som,'Ressaca Club (som da boate)');
  if(F.bloqueio&&!F.cctv)add(LM.cctv,'Câmeras do condomínio');
  if(F.bloqueio&&!F.casa4)add(LM.casa4,'Casa 4 do condomínio');
  if(F.vertice&&!F.vitrine)add(LM.vitrine,'Vitrine do museu');
  if(F.vertice&&!F.sino)add(LM.sino,'Sino da Matriz');
  if(F.droneSeen&&!F.nicoMet)add(LM.nico,'Nicolas (surf shop)','#e8d84a','npc');
  if(F.vertice&&!F.alexMet)add(LM.alex,'Mercado Público','#e8d84a','npc');
  if(F.marlon==='mar'&&F.vertice&&!F.marlonArmTalk)add(LM.marlonA,'Marlon (Armazém 4)','#e8d84a','npc');
  if(F.marlon==='cida'&&F.bloqueio&&!F.marlonCidaTalk&&!F.radio)add(LM.cidaDoor,'Marlon e a Dona Cida','#e8d84a','npc');
  return L;
}
(function(){
  const dm=drawMapTo;
  drawMapTo=function(c){
    dm(c); const cx=c.getContext('2d'), s=Math.min(c.width/W,c.height/H), ox=(c.width-W*s)/2, oy=(c.height-H*s)/2, px=v=>ox+v/TILE*s, py=v=>oy+v/TILE*s;
    const fs=Math.max(10,s*2.6); cx.font=`600 ${fs}px ${FONT_UI}`; cx.textBaseline='middle';
    const box=(x,y,t,col)=>{const w=cx.measureText(t).width+10;let bx=x+9;if(bx+w>c.width-4)bx=x-9-w;cx.fillStyle='rgba(8,10,12,.82)';cx.fillRect(bx,y-fs*.7,w,fs*1.4);cx.fillStyle=col;cx.textAlign='left';cx.fillText(t,bx+5,y);};
    for(const m of sideMissions()){const x=px(m.at.x),y=py(m.at.y),r=Math.max(4,s*1.5);
      cx.fillStyle=m.c;cx.strokeStyle='#0b0d0c';cx.lineWidth=2;
      if(m.k==='npc'){cx.beginPath();cx.arc(x,y,r+1,0,6.283);cx.fill();cx.stroke();}
      else{cx.beginPath();cx.moveTo(x,y-r-2);cx.lineTo(x+r+2,y);cx.lineTo(x,y+r+2);cx.lineTo(x-r-2,y);cx.closePath();cx.fill();cx.stroke();}
      box(x,y,m.t,m.c);}
    const ob=objective(); if(ob.at)box(px(ob.at.x),py(ob.at.y),'Objetivo','#d49a3c');
  };
})();

// ---------- menos zumbis, mas cada mordida dói mais (20%) ----------
for(const k in ETYPES){const t=ETYPES[k];if(t.boss||k==='boss'||k==='pers'||k==='bombeiro'||k==='ouvinte'||k==='manequim'||k==='brut')continue;t.dmg=Math.round(t.dmg*1.2);}

// ---------- perseguidores ficam fora da arena de chefe (menos no final) ----------
function arenaB(){
  if(G.flags.radio||G.inB<0)return -1;
  const b=G.inB, boss=enemies.some(e=>e.alive&&(e.t.boss||e.type==='ouvinte')&&!e.stalker&&e.type!=='boss'&&bmap[idx((e.x/TILE)|0,(e.y/TILE)|0)]===b);
  if(boss||b===hosp2B()||(G.flags.shopEv&&!G.flags.shopOpen&&!G.flags.boss_especime&&b===shopB()))return b;
  return -1;
}
function stalkerArena(){
  const ab=arenaB();
  for(const e of enemies){if(!e.alive||!e.stalker)continue;
    const k=idx((e.x/TILE)|0,(e.y/TILE)|0), inA=ab>=0&&bmap[k]===ab;
    if(!inA){if(bmap[k]<0)e.outPos={x:e.x,y:e.y};continue;}
    // entrou: volta pra fora, e fica rondando a porta
    const o=e.outPos||spawnPoint(700,900,false,true); if(!o)continue;
    e.x=o.x;e.y=o.y;e.vx=0;e.vy=0;e.state='search';e.st=8;e.hunt=false;e.mode=null;
    if(!G.ev.arenaTip){G.ev.arenaTip=1;later(400,()=>bark('rafa','t','Ele parou na porta... não quis entrar. Até ele tem medo do que tem aqui dentro.',{dur:2.4}));}
  }
}
(function(){const v=v16Tick;v16Tick=function(dt){v(dt);if(G.mode==='play'&&!CUT.on)stalkerArena();};})();

// =============== apresentações dos perseguidores ===============
// --- o Bombeiro: alguém pede socorro no posto queimado... e ele sai do fogo ---
function bombCallTick(dt){
  const F=G.flags; if(F.bombMet||!G.ev.silent||CUT.on)return;
  if(!F.bombCall){G.ev.bcT=(G.ev.bcT??8)-dt;if(G.ev.bcT>0)return;F.bombCall=true;
    const B=LM.bombas||LM.posto; AU.cry('socorro',B.x,B.y,1.2); psyFloat(B.x,B.y,'"SOCORRO! ALGUÉM! NO POSTO!"',{life:3.4,c:'#f0c8b8'});
    later(1500,()=>bark(F.eduFollow?'edu':'rafa','s',F.eduFollow?'Richard, tem alguém vivo gritando lá do posto queimado! A gente tem que ir!':'Alguém vivo... gritando lá do posto queimado. Na Avenida do Estado.',{dur:2.6}));return;}
  const B=LM.bombas||LM.posto; G.ev.bcC=(G.ev.bcC??6)-dt;
  if(G.ev.bcC<=0){G.ev.bcC=rr(7,10);AU.cry(pick2(['socorro','meajuda']),B.x,B.y,1);psyFloat(B.x,B.y,pick2(['"SOCORRO!"','"Tem alguém aí?! O fogo tá chegando!"','"Me tira daqui, por favor!"']),{life:2.6,c:'#f0c8b8'});}
  G.ev.bcLate=(G.ev.bcLate||0)+dt; if(G.ev.bcLate>240&&!G.ev.bombLate){G.ev.bombLate=true;G.ev.bombT=4;return;}  // ignorou o pedido: ele vem de qualquer jeito
  if(!P.inCar&&hyp(P.x-B.x,P.y-B.y)<330)STORY.bombCine();
}
STORY.bombCine=function(){
  const F=G.flags; if(F.bombMet)return; F.bombMet=true;
  const B=LM.bombas||LM.posto, [sx,sy]=freeTileNear(((B.x+P.x)/2/TILE)|0,((B.y+P.y)/2/TILE)|0,true);
  const surv={x:tc(sx),y:tc(sy),ang:0,col:'#5a7a9a',skin:'#c8a080',hair:'#2a1a10',walk:0,moving:false};
  const [fx,fy]=freeTileNear((B.x/TILE)|0,(B.y/TILE)|0,true); const bomb=makeEnemy('bombeiro',tc(fx),tc(fy),null); bomb.cut=true; bomb.state='idle'; bomb.face=Math.atan2(surv.y-bomb.y,surv.x-bomb.x);
  addFire(bomb.x,bomb.y,60,false); cutNpcs.push(surv);
  playCut([{npc:surv,id:'surv'},{cam:{x:surv.x,y:surv.y},t:.8},
    {say:'rafa',m:'s',t:'Ei! Aqui! Vem pra cá, rápido!'},
    {walk:'surv',to:{x:surv.x+(P.x-surv.x)*.3,y:surv.y+(P.y-surv.y)*.3},spd:60},
    {do:()=>{psyFloat(surv.x,surv.y,'"Graças a Deus! Eu achei que não tinha mais ninguém!"',{life:3,c:'#f0d8c8',edge:false});}},{wait:1.6},
    {do:()=>{psyFloat(surv.x,surv.y,'"Tinha um bombeiro aqui... ele tava pegando fogo e não caía..."',{life:3,c:'#f0d8c8',edge:false});}},{wait:2},
    {sfx:'drag',v:1},{wait:.5},{sfx:'drag',v:1},{fx:'shake',v:4},
    {cam:{x:bomb.x,y:bomb.y},t:.9},{fx:'zoom',v:1.35},
    {do:()=>{enemies.push(bomb);CUT.actors.bomb=bomb;for(let i=0;i<40;i++)parts.push({k:'fire',x:bomb.x+rr(-20,20),y:bomb.y+rr(-20,20),vx:rr(-80,80),vy:rr(-120,-20),life:rr(.4,.9),max:.9,s:rr(8,14),c:Math.random()<.5?'#ffb347':'#ff6a2a'});AU.roar();G.light=.5;}},
    {wait:.9},{say:'rafa',m:'s',think:true,t:'Tem alguém... saindo de dentro do fogo.',dur:1.6},
    {walk:'bomb',to:'surv',ox:-26,spd:120,tmax:2.5},
    {do:()=>{psyFloat(surv.x,surv.y,'"NÃO—"',{life:1.2,c:'#ff8a7a',edge:false});}},{wait:.25},
    {fx:'slow',v:.6},{sfx:'thud',v:1},{fx:'shake',v:16},{fx:'flash',v:.4},
    {do:()=>{const a=Math.atan2(surv.y-bomb.y,surv.x-bomb.x);bloodBurst(surv.x,surv.y,46,a);
      addDecal({k:'blood',x:surv.x,y:surv.y,r:34,rot:0,seed:.3});addDecal({k:'corpse',x:surv.x,y:surv.y,rot:a,type:'zumbi',col:surv.col,skin:surv.skin,r:11});
      addDecal({k:'gib',x:surv.x+Math.cos(a)*44,y:surv.y+Math.sin(a)*44,r:6,rot:0,c:surv.skin});const i=cutNpcs.indexOf(surv);if(i>=0)cutNpcs.splice(i,1);AU.splat();buzz([140,40,200]);G.fear=1;G.shockT=Math.max(G.shockT||0,25);}},
    {wait:1.2},{fx:'zoom',v:1.2},
    {say:'rafa',m:'s',t:'Ele... ele arrancou a cabeça dele. Com o machado. Num golpe só.'},
    ...(F.eduFollow?[{say:'edu',m:'s',t:'Ele tava no posto quando explodiu, Richard. Ele virou ISSO. E agora ele tá olhando pra gente.'}]:[]),
    {face:'bomb',at:'rafa'},{sfx:'roar',v:1},{fx:'shake',v:8},
    {say:'rafa',m:'a',think:true,t:'Não dá pra matar isso. Só correr. E não parar nunca.',dur:2},
    {camFree:1}],()=>{bomb.cut=false;bomb.state='chase';bomb.hunt=true;bomb.lx=P.x;bomb.ly=P.y;G.banner={t:'O Bombeiro',life:3.2};});
};
// --- o Perseguidor: o orelhão, e as luzes que apagam com ele cada vez mais perto ---
STORY.introPers=function(p){
  const F=G.flags; F.persMet=true;
  const a=P.ang, at=(d)=>{const [x,y]=freeTileNear(((P.x+Math.cos(a)*d)/TILE)|0,((P.y+Math.sin(a)*d)/TILE)|0,true);return {x:tc(x),y:tc(y)};};
  const ph={x:P.x+Math.cos(a+1.6)*50,y:P.y+Math.sin(a+1.6)*50};
  const put=(d)=>{const q=at(d);p.x=q.x;p.y=q.y;p.face=Math.atan2(P.y-p.y,P.x-p.x);p.vx=0;p.vy=0;};
  put(330); p.cut=true;
  playCut([{npc:p,id:'pers'},
    {do:()=>AU.phone(1)},{wait:1.2},{do:()=>AU.phone(1)},
    {say:'rafa',m:'s',t:'Um orelhão... tocando. No meio da rua, no meio disso tudo.'},
    {do:()=>AU.phone(1)},{wait:.8},{sfx:'click',v:1},
    {say:'rafa',m:'n',t:'...Alô?'},
    {sfx:'static',v:.6},{wait:1.2},
    {do:()=>{psyFloat(ph.x,ph.y,'(do outro lado da linha, alguém respirando devagar)',{life:2.8,c:'#9aa0a8',edge:false});AU.breath(1,true);}},{wait:1.6},
    {do:()=>{psyFloat(ph.x,ph.y,'"...Richard."',{life:2.4,c:'#c86a5a',edge:false});AU.cry('richard',ph.x,ph.y,1.6);}},{wait:1.4},
    {say:'rafa',m:'s',t:'Quem é? COMO VOCÊ SABE O MEU NOME?'},
    {do:()=>{psyFloat(ph.x,ph.y,'"Vira pra trás."',{life:2.2,c:'#c86a5a',edge:false});}},{wait:1.6},
    {cam:{x:p.x,y:p.y},t:.8},
    {say:'rafa',m:'s',think:true,t:'Lá no fim da rua. Debaixo do último poste. Um homem de sobretudo.',dur:2},
    {fx:'blackout',v:.7},{sfx:'thud',v:.7},{do:()=>put(210)},{camFree:1},{wait:.9},
    {say:'rafa',m:'s',think:true,t:'A luz apagou... e ele tá mais perto.',dur:1.4},
    {fx:'blackout',v:.7},{sfx:'thud',v:.9},{do:()=>put(110)},{wait:.9},{fx:'zoom',v:1.3},
    {fx:'blackout',v:.7},{sfx:'thud',v:1},{do:()=>{put(44);AU.roar();}},{fx:'shake',v:10},{startle:'rafa'},
    {say:'rafa',m:'s',t:'ELE TÁ AQUI!'},
    ...(F.eduFollow?[{say:'edu',m:'s',t:'CORRE, RICHARD! ELE NÃO PARA! ESSE AÍ NÃO PARA!'}]:[]),
    {camFree:1}],()=>{p.cut=false;p.state='chase';p.hunt=true;p.lx=P.x;p.ly=P.y;G.banner={t:'O Perseguidor',life:3.2};});
};
(function(){
  const ob=objective; objective=function(){const F=G.flags;if(F.bombCall&&!F.bombMet&&!G.ev.bombLate&&G.ev.silent&&!(G.heli||F.radio))return {t:'Alguém grita por socorro no posto queimado da Avenida do Estado. Vá ajudar.',at:LM.bombas||LM.posto};return ob();};
  const v=v16Tick;v16Tick=function(dt){v(dt);if(G.mode==='play')bombCallTick(dt);};
})();
