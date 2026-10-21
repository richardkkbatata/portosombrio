// ===================== 1.14 · CAMBORIÚ 2.0: O CERVO DESPERTO =====================
// O capítulo de Camboriú cresce:
// - Sargento Valença, do Exército, escondido e ferido no Tiro de Guerra. Precisa da maleta do pelotão.
// - O frigorífico: a maleta está na câmara fria, e lá mora uma coisa que não morre. Só dá para fugir,
//   batendo as portas atrás de si. Ela aparece uma vez só e nunca mais.
// - Furtividade: matar cultista distraído por trás, em silêncio; arrastar o corpo (se acharem, dão o
//   alarme); vestir o manto e andar disfarçado (cai se correr, atirar ou chegar perto de um vigia).
// - A missa da meia-noite: o sino toca três vezes e a cidade inteira entra na Matriz. Alguns minutos vazios.
// - O Pregador aparece no caminho: na escadaria, no fim da rua, na porta da casa dele, no cemitério.
// - O Cervo em duas formas: a da igreja (mais curta) e, depois de uma transformação, a forma desperta,
//   enorme, que derruba a fachada da Matriz e caça você pela cidade. O Nicolas atira do morro e o
//   Sargento Valença entra na luta.
// - Cidade maior: Tiro de Guerra, frigorífico, cemitério, rua nova no centro e casas das "oferendas".
// - Sons novos: rugido demoníaco, coro ao contrário, sub grave, coração, ossos, ganchos, grito, sussurros.
// - Perto do fim da história, o drone do Nicolas mostra Camboriú sem o Cervo.
// Também: aviso no online quando as versões são diferentes, intensidade do terror e guia de controles no celular.

// ---------- itens, documentos, inimigos, personagens ----------
Object.assign(ITEMS,{
  cbMaleta:{n:'Maleta do pelotão',s:'MALETA',c:'#5a6a3a',st:1,k:'key',d:'Maleta verde de primeiros socorros do Exército, com "PEL 2 · CB TEIXEIRA" escrito a caneta. Está gelada e tem sangue na alça.'},
});
const DOC114=DOCS.length;
DOCS.push(
  {t:'Ordem de serviço do pelotão',b:`EXÉRCITO BRASILEIRO · ORDEM DE SERVIÇO\n\nMissão: bloquear a BR-101 no trevo de Camboriú. Ninguém passa para o sul.\nCivis: conduzir à Igreja Matriz, conforme pedido do pároco local, que ofereceu abrigo e comida.\n\nObservação do comandante: "pessoal muito organizado. Velas em todas as janelas. Gente boa."\n\nEmbaixo, a lápis, outra letra: "não é o padre. o padre sumiu na terça. quem pediu foi o de branco."`},
  {t:'Bilhete na geladeira',b:`Preso com um ímã de pizzaria:\n\nMãe,\no Pregador veio buscar a vó hoje de tarde. Disse que é uma honra, que ela foi escolhida. A vó chorou e pediu pra levar o terço. Ele deixou.\n\nEu fui pro sótão. Eles batem em todas as portas de noite e contam quem tem vela acesa.\n\nSe alguém achar isso: a nossa vela apagou às três horas. Eu não tenho mais fósforo.`},
  {t:'Recado na lápide',b:`Escrito com batom numa lápide nova, ainda sem nome:\n\n"Aqui não tem ninguém enterrado.\nEles cavam de dia e deixam aberto.\nA cova é pra quem não acende a vela.\nEu contei: tem mais cova aberta do que gente viva na cidade."`},
  {t:'Caderno de entregas do frigorífico',b:`FRIGORÍFICO CAMBORIÚ · PEDIDOS\n\nPedido da Congregação: ganchos (40). Sal grosso (200 kg). Correntes.\nNão entrar na câmara 2 depois das 22h.\n\nSegunda: o seu Osmar do açougue não volta mais pra casa. Ele dorme lá dentro, no frio.\nTerça: ele não come. Eu juro que ele não come nada.\nQuarta: trouxeram os soldados. O seu Osmar disse que agora sim, "carne nova".\nQuinta: a câmara 2 está fazendo barulho de noite. Barulho de gancho. Eu não vou mais.`},
);
Object.assign(ETYPES,{
  carniceiro:{n:'A coisa do frigorífico',hp:99999,spd:92,dmg:30,r:20,col:'#3a1a16',skin:'#8a5a4a',sight:99999,boss:true},
  cervo2:{n:'O Cervo desperto',hp:3600,spd:84,dmg:32,r:40,col:'#0a0806',skin:'#d8ccb0',sight:99999,boss:true},
});
ETYPES.chifrudo.hp=1400;   // a forma da igreja é mais curta: a luta de verdade é a segunda
PCH.valenca={name:'Sgt. Valença',skin:'#c08a68',shade:'#8a5e44',hair:'#141210',iris:'#2a1e14',bg:['#1a2014','#06080a'],glow:'150,170,90',voice:104};
PXH.valenca={hw:57,hh:70,body:['#4a5232','#22261a'],
  clothes(c,cx,H2){c.fillStyle='rgba(30,36,20,.55)';for(const [x,y,r] of [[60,262,14],[96,290,11],[190,252,15],[222,292,12],[150,300,10],[120,256,8],[244,262,9]]){c.beginPath();c.ellipse(x,y,r,r*.6,.4,0,6.283);c.fill();}
    c.fillStyle='#3a4228';c.beginPath();c.moveTo(102,208);c.lineTo(cx,236);c.lineTo(178,208);c.lineTo(170,202);c.lineTo(cx,224);c.lineTo(110,202);c.closePath();c.fill();
    c.fillStyle='#2a2e1c';c.fillRect(176,250,44,10);c.fillStyle='#c8c4a8';c.font='700 9px sans-serif';c.fillText('VALENÇA',178,258);
    c.fillStyle='#6a1a14';c.fillRect(70,300,30,6);},
  details(c,cx,cy,my,mood){c.fillStyle='rgba(30,20,14,.35)';for(let i=0;i<90;i++){const a=Math.PI*(.08+Math.random()*.84),r=34+Math.random()*26;c.fillRect(cx+Math.cos(a)*r,cy+26+Math.sin(a)*r*.6,1.3,1.3);}
    c.strokeStyle='rgba(120,40,30,.55)';c.lineWidth=2;c.beginPath();c.moveTo(cx+30,cy-30);c.lineTo(cx+44,cy-8);c.stroke();
    if(mood!=='s'&&mood!=='h'){c.fillStyle='#9a5a4a';c.beginPath();c.ellipse(cx,my+3,12,3.6,0,0,6.283);c.fill();}},
  hair(c,cx,cy,hw,hh,p){c.fillStyle=p.hair;c.beginPath();c.moveTo(cx-hw,cy-18);c.bezierCurveTo(cx-hw,cy-hh-8,cx+hw,cy-hh-8,cx+hw,cy-18);c.quadraticCurveTo(cx,cy-40,cx-hw,cy-18);c.fill();
    c.fillStyle='rgba(255,255,255,.05)';for(let i=0;i<40;i++)c.fillRect(cx-hw+8+Math.random()*(hw*2-16),cy-hh+4+Math.random()*24,1.2,1.2);}};
LOOKX.valenca=function(o){ctx.fillStyle='#3e4628';ctx.beginPath();ctx.ellipse(-.6,0,7.4,7.2,0,0,6.283);ctx.fill();ctx.strokeStyle='#22261a';ctx.lineWidth=1;ctx.stroke();
  ctx.fillStyle='rgba(20,24,14,.6)';ctx.beginPath();ctx.arc(-2,-2,2,0,6.283);ctx.arc(1.6,2.4,1.6,0,6.283);ctx.fill();};
LOOKX.manto=function(o){ctx.fillStyle='#2a221c';ctx.beginPath();ctx.ellipse(-.5,0,7.6,7.2,0,0,6.283);ctx.fill();ctx.fillStyle='#050403';ctx.beginPath();ctx.ellipse(3,0,3.4,4,0,0,6.283);ctx.fill();
  ctx.strokeStyle='#8a1a14';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-4,-3);ctx.lineTo(-4,3);ctx.lineTo(0,0);ctx.closePath();ctx.stroke();};
if(typeof FALA_FISICA!=='undefined')FALA_FISICA.add('valenca');
Object.assign(INT_LABEL,{cbExec:'Matar em silêncio (por trás)',cbCorpo:'Arrastar o corpo'});
if(typeof ACH!=='undefined')ACH.push({id:'cbFuga',n:'Não olhe para trás',d:'Fuja da coisa do frigorífico de Camboriú.'},{id:'cbVal',n:'Ninguém fica para trás',d:'Salve o Sargento Valença.'},{id:'cbDesperto',n:'O Cervo desperto',d:'Derrube a segunda forma do Cervo.'},{id:'cbManto',n:'Um de nós',d:'Passe pela missa da meia-noite disfarçado de cultista.'});

// ---------- estado do capítulo (não vai no registro: o registro guarda só os G.flags) ----------
const CB2={frig:null,ftrail:[],drag:null,bodies:[],alertT:0,preg:null,missa:null,val:null,tr:[],nicoT:8,hb:0,lookPrev:undefined,px:null,py:null,shotT:-9,morph:null,volta:null,stun:0,t:0};
const CB2FAKE={fake:true,kind:'manto',x:0,y:0,tx:0,ty:0};
function cb2Reset(){CB2.frig=null;CB2.ftrail=[];CB2.drag=null;CB2.bodies=[];CB2.alertT=0;CB2.preg=null;CB2.missa=null;CB2.val=null;CB2.tr=[];CB2.nicoT=8;CB2.morph=null;CB2.volta=null;CB2.px=null;
  for(let i=interacts.length-1;i>=0;i--)if(interacts[i].dyn114)interacts.splice(i,1);
  for(let i=npcs.length-1;i>=0;i--)if(npcs[i].id==='cbPregApp')npcs.splice(i,1);if(CB2.preg&&CB2.preg.l)CB2.preg.l.off=true;
  if(P&&P.disf){P.disf=false;if(CB2.lookPrev!==undefined){P.lookO=CB2.lookPrev;CB2.lookPrev=undefined;}}}
const cb2Types=['cult','vig','marc'];
function cb2Fight(){const F=cbF();return !!(F.cbF2&&!F.cbBoss);}
function cb2Boss(){return enemies.find(e=>e.alive&&e.type==='cervo2');}
function cb2Free(tx,ty){return freeTileNear(tx|0,ty|0,true);}
function cb2Pt(x,y){const [a,b]=cb2Free((x/TILE)|0,(y/TILE)|0);return {x:tc(a),y:tc(b)};}
function cb2Give(id,q){const l=invAdd(id,q);if(l)boxAdd(id,l);}
function cb2Take(id){if(invCount(id)>0)return invRemove(id,1);const s=(G.box||[]).find(b=>b.id===id);if(s){s.q--;if(s.q<=0)G.box.splice(G.box.indexOf(s),1);return true;}return false;}
function cb2Inside(x,y,b){return x>=b.x*TILE&&x<(b.x+b.w)*TILE&&y>=b.y*TILE&&y<(b.y+b.h)*TILE;}
function cb2DistB(x,y,b){const cx=clamp(x,b.x*TILE,(b.x+b.w)*TILE),cy=clamp(y,b.y*TILE,(b.y+b.h)*TILE);return hyp(x-cx,y-cy);}

// ===================== O MAPA: TIRO DE GUERRA, FRIGORÍFICO, CEMITÉRIO, RUA NOVA =====================
function genCamb2(){
  const old=rnd; rnd=mulberry32(11414);
  // ---- rua nova no centro, entre a avenida e a rua do estádio ----
  vroad(82,cbY(42),cbY(55),3);
  // ---- Tiro de Guerra ----
  {const b=building(62,cbY(44),17,10,{floor:T.CONC,roof:'#4a5234',name:'Tiro de Guerra',kind:'casa',doors:[['N',7,2]]});b.dark=true;b.lit=false;CBL.tgB=b.id;
    iwall(b,70,cbY(45),70,cbY(52),[[cbY(49),2]]);
    for(const x of [72,74,76])prop(x,cbY(46),37); prop(64,cbY(46),1);prop(65,cbY(46),1); prop(77,cbY(49),37);
    addHide(64,cbY(52),'armario');
    cbPick('cbDocTG',66,cbY(47),DOC114,1,'file'); cbPick('cbTGm',68,cbY(51),'m9',10); cbPick('cbTGc',63,cbY(49),'cart',3);
    lights.push({x:tc(66),y:tc(cbY(48)),r:90,c:'lamp',f:1,cb:1});
    CBL.tg={x:tc(69.5),y:tc(cbY(42.5))}; CBL.val={x:tc(75.5),y:tc(cbY(51))};
    for(let i=0;i<7;i++)GORE.push({k:'drag',x:tc(70)+i*6,y:tc(cbY(43-i*.0))+i*10-40,r:9,rot:1.57,seed:i*.13,cb:1});
    graf(70,cbY(43),'TG 05-008',{rot:0,c:'#d8d4c8'});}
  npcs.push({id:'cbVal',name:'Sgt. Valença',x:CBL.val.x,y:CBL.val.y,ang:Math.PI,col:'#4a5232',hair:'#141210',skin:'#c08a68',look:'valenca',crouch:true,
    cond:()=>{const F=cbF();return cbOn()&&!!F.cbMilCall&&!F.cbDone&&!cb2Fight()&&!(F.cbBoss&&CB2.val);}});
  // ---- as casas das oferendas ----
  {const b1=cbHouse(87,44,11,9,'S'),b2=cbHouse(100,44,11,9,'S');b1.dark=b2.dark=true;
    cbPick('cbDocGel',92,cbY(48),DOC114+1,1,'file'); cbPick('cbOfA',104,cbY(47),'ervaV',1);
    for(const [x,y] of [[90,46],[94,50],[103,46],[108,50]])CBD.push({k:'vela',x:tc(x),y:tc(cbY(y)),n:1,apagada:1});
    CBL.gel={x:tc(92),y:tc(cbY(48))};}
  // ---- frigorífico ----
  {const b=building(120,cbY(60),27,18,{floor:T.TILEF,roof:'#5a5e5c',name:'Frigorífico Camboriú',kind:'mercado',doors:[['W',3,2],['S',2,2]]});b.dark=true;b.lit=false;CBL.frB=b.id;
    iwall(b,121,cbY(67),145,cbY(67),[[141,2]]);
    iwall(b,127,cbY(68),127,cbY(76),[[cbY(73),2]]);
    iwall(b,128,cbY(61),128,cbY(66),[[cbY(62),3]]);
    addGate('cbFrA',127,cbY(73),1,2,null,'#7a7e7c','Porta da câmara fria','Trancada por dentro. Eu não volto aí.',T.TILEF);
    addGate('cbFrB',122,cbY(77),2,1,null,'#6a6e6c','Porta da doca','Trancada por dentro. Eu não volto aí.',T.TILEF);
    addGate('cbFrE',120,cbY(63),1,2,null,'#6a6e6c','Porta do frigorífico','Trancada por dentro. Eu não volto aí.',T.TILEF);
    for(const id of ['cbFrA','cbFrB','cbFrE']){const g=gates.find(x=>x.id===id);if(g)openGate(g);}
    prop(122,cbY(61),1);prop(123,cbY(61),1);prop(126,cbY(65),36);
    prop(131,cbY(75),15);prop(136,cbY(69),4);prop(139,cbY(75),15);
    cbPick('cbDocFrig',124,cbY(62),DOC114+3,1,'file'); cbPick('cbMaletaP',144,cbY(75),'cbMaleta',1);
    for(let x=130;x<=144;x+=2)for(const y of [62,64,66])CBD.push({k:'gancho',x:tc(x),y:tc(cbY(y))-8,body:((x+y)%4)===0});
    for(let x=129;x<=145;x+=2)for(const y of [69,71])CBD.push({k:'gancho',x:tc(x),y:tc(cbY(y))-8,body:((x*3+y)%3)!==0,farda:((x+y)%5)===0});
    for(let x=121;x<=146;x+=2)for(let y=61;y<=76;y+=2)if(x>127)CBD.push({k:'gelo',x:tc(x),y:tc(cbY(y)),cam:y>=68?1:0});
    for(let i=0;i<9;i++)GORE.push({k:'blood',x:tc(131+i*1.6),y:tc(cbY(69+(i%3)*2)),r:14+i%3*4,rot:i,seed:i*.11,cb:1});
    GORE.push({k:'drag',x:tc(142),y:tc(cbY(74)),r:10,rot:0,seed:.4,cb:1});
    lights.push({x:tc(124),y:tc(cbY(63)),r:110,c:'lamp',f:1,cb:1,frig:1});
    lights.push({x:tc(136),y:tc(cbY(64)),r:80,c:'lamp',f:1,cb:1,frig:1});
    {const car=addCar(117,cbY(68),true,false,'#4a5634');car.kind='army';}
    CBL.frig={x:tc(119),y:tc(cbY(63.5))}; CBL.maleta={x:tc(144),y:tc(cbY(75))}; CBL.frigS={x:tc(118),y:tc(cbY(80))}; CBL.carnSpawn={x:tc(141.5),y:tc(cbY(68.6))};
    CBL.frHall={x:tc(132),y:tc(cbY(64))};
    graf(131,cbY(59),'FRIGORÍFICO',{rot:0,c:'#d8d4c8'});}
  // ---- cemitério, do lado da Matriz ----
  {for(let x=118;x<=147;x++){if(x<131||x>133)setT(x,cbY(20),T.FENCE);setT(x,cbY(10),T.FENCE);}
    for(let y=cbY(10);y<=cbY(20);y++){if(y<cbY(14)||y>cbY(16))setT(118,y,T.FENCE);setT(147,y,T.FENCE);}
    rect(119,cbY(15),28,1,T.DIRT); rect(132,cbY(11),1,9,T.DIRT);
    for(const [x,y] of [[122,11],[139,11],[137,17]]){const m=building(x,cbY(y),5,3,{floor:T.CONC,roof:'#8a8478',name:'Mausoléu',kind:'casa',doors:[]});m.lit=false;m.dark=true;}
    setT(129,cbY(12),T.TREE);setT(145,cbY(18),T.TREE);setT(120,cbY(18),T.TREE);
    for(let x=120;x<=145;x+=3)for(const y of [12,13,17,18,19]){if(x===132||x===129||(x>=121&&x<=127&&y<=13)||(x>=138&&x<=144&&y<=13)||(x>=136&&x<=142&&y>=17)||(x===120&&y===18)||(x===144&&y===18))continue;if(SOLID[getT(x,cbY(y))])continue;
      CBD.push({k:'lapide',x:tc(x),y:tc(cbY(y)),v:(x*7+y)%4});}
    for(const [x,y] of [[125,16],[142,14],[128,19]])CBD.push({k:'cova',x:tc(x),y:tc(cbY(y))});
    for(const [x,y] of [[124,15],[140,15],[132,13]])CBD.push({k:'vela',x:tc(x),y:tc(cbY(y)),n:2});
    cbPick('cbDocLap',134,cbY(18),DOC114+2,1,'file'); cbPick('cbCemS',143,cbY(16),'garrafa',1);
    CBD.push({k:'braseiro',x:tc(117),y:tc(cbY(13))});lights.push({x:tc(117),y:tc(cbY(13)),r:170,c:'fire',f:1,cb:1});
    CBL.cemit={x:tc(132),y:tc(cbY(15))}; CBL.cova={x:tc(125),y:tc(cbY(16))};
    graf(132,cbY(9),'CEMITÉRIO MUNICIPAL',{rot:0,c:'#d8d4c8'});}
  // ---- carros na volta da praça (o Cervo desperto passa por cima) ----
  for(const [x,y] of [[70,22],[101,23],[60,39],[122,40],[40,23]])addCar(x,cbY(y),true,false);
  // ---- mais gente: vigia na rua nova, cultistas perto do frigorífico e do cemitério ----
  cbZ('cbv8',"vig",83,cbY(48)); cbZ('cbc40','cult',118,cbY(58)); cbZ('cbc41','cult',134,cbY(22)); cbZ('cbc42','cult',96,cbY(54)); cbZ('cbc43','cult',72,cbY(55));
  for(const [x,y] of [[69,43],[84,43],[116,59],[116,22]]){CBD.push({k:'tocha',x:tc(x),y:tc(cbY(y))+8});lights.push({x:tc(x),y:tc(cbY(y))+10,r:110,c:'fire',f:1,cb:1});}
  rnd=old;
}
(function(){
  const g=genV12; genV12=function(){g();try{if(typeof CBL!=='undefined'&&CBL.coreto){genCamb2();cbReach();}}catch(e){console.error('camboriu 2',e);}};
})();

// ===================== SONS DEMONÍACOS =====================
(SND.extra=SND.extra||[]).push(
  // rugido: três vozes graves desafinadas, uma oitava embaixo, e um sub que treme
  ['cb_roar2',()=>{const D=SND.dsp,d=3.2,n=D.len(d),x=new Float32Array(n);
    for(const [f,v,g] of [[62,['a','o','u'],1],[47,['o','u','o'],.8],[93,['a','a','o'],.45],[31,['u','o','u'],.6]])D.add(x,D.voice({dur:d,f0:(u,t)=>f*(1.15-.3*u)*(1+.05*Math.sin(t*23)),v,rough:1,br:.45,jit:.09,q:[3,4,5],fs:.62,sat:3.4,gurg:11,env:(u,t)=>Math.min(1,t/.12)*Math.pow(1-u,.7)}),0,g);
    for(let i=0;i<n;i++){const t=i/44100;x[i]+=Math.sin(6.283*(58-10*t/d)*t)*.18*Math.min(1,t/.2)*Math.pow(1-t/d,.8);}
    D.F(x,'hp',55,.7,2);return D.fadeOut(D.norm(D.sat(x,1.5),.8),.3);},2],
  // coro ao contrário: acorde de vozes, invertido no tempo (cresce e corta)
  ['cb_rev',()=>{const D=SND.dsp,d=3.4,n=D.len(d),x=new Float32Array(n);
    for(const [f,v] of [[110,'o'],[130.8,'a'],[164.8,'u'],[82.4,'o']])D.add(x,D.voice({dur:d,f0:(u,t)=>f*(1+.006*Math.sin(t*5+f)),v:[v,v==='o'?'a':'o',v],rough:.08,br:.18,jit:.02,q:[7,9,11],env:u=>Math.pow(Math.sin(Math.PI*Math.min(1,u*1.1)),.6),sat:1.3}),0,.28);
    x.reverse();for(let i=0;i<n;i++){const u=i/n;x[i]*=Math.pow(u,1.6);}return D.fadeOut(D.norm(x),.04);},2],
  // sub grave que se sente mais do que se ouve
  ['cb_sub',()=>{const D=SND.dsp,d=2.8,n=D.len(d),x=new Float32Array(n);for(let i=0;i<n;i++){const t=i/44100;x[i]=Math.sin(6.283*(62*Math.exp(-t*.4)+30)*t)*Math.exp(-t*1.6)*Math.min(1,t/.01);}
    D.add(x,D.ex(D.F(D.N(D.len(.4)),'lp',180,1,2),8),0,.5);return D.fadeOut(D.norm(D.sat(x,1.4)),.2);},1],
  // coração
  ['cb_heart',()=>{const D=SND.dsp,d=.62,n=D.len(d),x=new Float32Array(n);for(const [o,a] of [[0,1],[.2,.7]]){const k=D.len(o);for(let i=0;i<n-k;i++){const t=i/44100;x[i+k]+=Math.sin(6.283*(58*Math.exp(-t*14)+32)*t)*Math.exp(-t*22)*a;}}
    return D.fadeOut(D.norm(D.F(x,'lp',220,.8)),.05);},1],
  // ossos quebrando
  ['cb_crack',()=>{const D=SND.dsp,d=1.6,n=D.len(d),x=new Float32Array(n);for(let k=0;k<14;k++){const at=D.rnd()*1.45,b=D.ex(D.F(D.N(D.len(.06)),'bp',900+D.rnd()*2600,3),70);D.add(x,b,at,.4+D.rnd()*.6);}
    D.add(x,D.ex(D.F(D.N(n),'lp',300,1),2.4),0,.18);return D.fadeOut(D.norm(D.sat(x,2)),.05);},2],
  // ganchos e correntes balançando
  ['cb_hook',()=>{const D=SND.dsp,d=2.4,n=D.len(d),x=new Float32Array(n);for(let k=0;k<6;k++){const at=k*.36+D.rnd()*.1;for(const [f,a] of [[1234,.5],[1873,.35],[2711,.25],[3390,.15]]){const p=D.ping(.6,f*(1+D.rnd()*.04),9);D.add(x,p,at,a*(1-k*.12));}}
    D.add(x,D.F(D.N(n),'bp',600,4),0,.03);return D.fadeOut(D.norm(x),.1);},2],
  // grito que não é humano
  ['cb_shriek',()=>{const D=SND.dsp,d=1.5,n=D.len(d),a=D.voice({dur:d,f0:(u,t)=>(820+520*Math.sin(Math.PI*u))*(1+.09*Math.sin(t*71)),v:['i','e','a'],rough:.6,br:.5,jit:.12,q:[5,6,8],sat:3.6,env:(u,t)=>Math.min(1,t/.03)*Math.pow(1-u,.5)}),
    b=D.voice({dur:d,f0:(u,t)=>(310+120*Math.sin(Math.PI*u))*(1+.05*Math.sin(t*37)),v:['a','o','u'],rough:1,br:.5,jit:.1,q:[3,4,5],sat:3,gurg:17});
    for(let i=0;i<n;i++)a[i]=a[i]*.6+b[i]*.55*Math.sin(6.283*93*i/44100);return D.fadeOut(D.norm(D.sat(a,1.6)),.08);},2],
  // sussurros numa língua estranha (ruído soprado passando por vogais)
  ['cb_whisp',()=>{const D=SND.dsp,d=3,n=D.len(d),x=new Float32Array(n);for(let k=0;k<3;k++){const v=D.voice({dur:d,f0:()=>140+k*30,v:['e','a','o','i','u','a'].sort(()=>D.rnd()-.5),rough:0,br:3.2,jit:0,q:[6,8,10],env:(u,t)=>Math.pow(Math.abs(Math.sin(t*(5+k*1.3))),2)*Math.sin(Math.PI*u),sat:1});
    D.add(x,D.F(v,'hp',900,.7),k*.13,.5);}return D.fadeOut(D.norm(x),.1);},2],
);
(function(){
  const has=n=>SND.b[n]&&SND.b[n].length;
  AU.cbRoar2=function(x,y,v=1){const t=(this.ctx&&this.ctx.currentTime)||0;if(t-(this.r2T||-9)<1.2)return;this.r2T=t;if(has('cb_roar2'))this.pbAt('cb_roar2',x,y,{vol:.34*v,wet:.5,maxD:2400,jit:.05,must:true});else this.roar&&this.roar();};
  AU.cbRev=function(v=1){if(has('cb_rev'))this.pb('cb_rev',{vol:.36*v,wet:.8,jit:.02,must:true});};
  AU.cbSub=function(v=1){const t=(this.ctx&&this.ctx.currentTime)||0;if(t-(this.subT||-9)<1.5)return;this.subT=t;if(has('cb_sub'))this.pb('cb_sub',{vol:.2*v,wet:.25,must:true});else this.thud&&this.thud(v);};
  AU.cbHeart=function(v=1,rate=1){if(has('cb_heart'))this.pb('cb_heart',{vol:.42*v,wet:.05,rate,jit:0});};
  AU.cbCrack=function(x,y,v=1){if(has('cb_crack'))this.pbAt('cb_crack',x,y,{vol:.5*v,wet:.35,maxD:1200,must:true});};
  AU.cbHook=function(x,y,v=1){if(has('cb_hook'))this.pbAt('cb_hook',x,y,{vol:.32*v,wet:.6,maxD:900});};
  AU.cbShriek=function(x,y,v=1){if(has('cb_shriek'))this.pbAt('cb_shriek',x,y,{vol:.5*v,wet:.55,maxD:1600,must:true});else this.scream&&this.scream(.8);};
  AU.cbWhisp=function(x,y,v=1){if(has('cb_whisp')){if(x==null)this.pb('cb_whisp',{vol:.28*v,wet:.7,pan:(Math.random()-.5)*1.6});else this.pbAt('cb_whisp',x,y,{vol:.32*v,wet:.6,maxD:900});}};
  // atalhos para as cutscenes ({sfx:'nome'})
  AU.cbRevS=function(v){AU.cbRev(v);}; AU.cbSubS=function(v){AU.cbSub(v);}; AU.cbWhispS=function(v){AU.cbWhisp(null,null,v);}; AU.cbHookS=function(v){AU.cbHook(P.x+120,P.y-60,v);};
})();

// ===================== O SARGENTO VALENÇA =====================
function cb2MilCall(){
  const F=cbF(); if(F.cbMilCall)return; F.cbMilCall=true;
  playCut([{sfx:'static',v:1},
    {say:'nico',m:'s',radio:true,t:'Richard... o drone pegou uma coisa. Tem um soldado vivo. Do Exército.'},
    {say:'nico',m:'t',radio:true,t:'Ele se arrastou pra dentro do Tiro de Guerra, no quarteirão entre a avenida e a rua do estádio. Deixou um rastro de sangue na calçada.'},
    {say:'rafa',m:'n',t:'Um soldado? Aqui?'},
    {say:'nico',m:'n',radio:true,t:'Se ele tiver arma e munição, a gente tem uma chance contra o que mora naquela igreja.'},
    {say:'nico',m:'t',radio:true,t:'E outra coisa. Se tu pegar um deles sozinho, distraído, chega por trás. Sem barulho. A capa deles serve em ti.'},
    {say:'rafa',m:'t',think:true,t:'Vestir a roupa de um morto. Andar no meio deles. Tá. Tá bom.',dur:2.4}],
    ()=>{G.banner={t:'Ache o soldado no Tiro de Guerra',life:3.5};toast(IN.touch?'Chegue por trás de um cultista distraído e toque em USAR para matar em silêncio. No corpo, dá para vestir o manto e arrastar.':'Chegue por trás de um cultista distraído e aperte E para matar em silêncio. No corpo, dá para vestir o manto e arrastar (E).');});
}
// a chegada no Tiro de Guerra: o rastro de sangue, a porta, o cano de uma arma no escuro
function cb2TGArrive(){
  const F=cbF(); if(F.cbTGseen)return; F.cbTGseen=true;
  const n=npcs.find(x=>x.id==='cbVal'); if(!n)return;
  CUT.actors.valenca=n;
  playCut([{cam:{x:CBL.tg.x,y:CBL.tg.y-20},t:.8},
    {say:'rafa',m:'t',think:true,t:'O sangue vai até a porta. E entra.',dur:2},
    {sfx:'cbWhispS',v:.4},{wait:.8},
    {cam:{x:CBL.val.x-60,y:CBL.val.y-40},t:1.2},
    {sfx:'creak',v:.5},{wait:.5},
    {say:'rafa',m:'s',t:'Tem alguém respirando lá no fundo.',dur:1.8},
    {cam:{x:CBL.val.x,y:CBL.val.y},t:.9},{emote:'valenca',k:'!',dur:1},
    {camFree:true}],()=>{});
}
STORY.cbValTalk=function(n){
  const F=cbF();
  if(F.cbBoss)return bark('valenca','n',pick2(['Eu vou pra BR, garoto. Vai na frente.','Obrigado pela maleta. Eu não ia passar de hoje.']));
  if(!F.cbMilMet){F.cbMilMet=true;
    const disf=!!P.disf, deliver=cbHas('cbMaleta');
    const steps=[{npc:n,id:'valenca'},{startle:'valenca'},{sfx:'cbHeartS',v:1},
      {say:'valenca',m:'a',t:disf?'TIRA ESSA CAPA! Tira essa capa agora ou eu atiro!':'Parado! Mão onde eu possa ver! PARADO!'},
      ...(disf?[{do:()=>cb2DisfOff(true)},{say:'rafa',m:'s',t:'Calma! Calma! Eu não sou deles! Tirei de um deles!'}]:[{say:'rafa',m:'s',t:'Calma! Eu não sou deles! Olha, tô de lanterna!'}]),
      {wait:.8},
      {say:'valenca',m:'t',t:'...Tá. Tá bom. Desculpa. Faz dois dias que eu não falo com ninguém que não reza pra aquele bicho.'},
      {say:'valenca',m:'n',t:'Sargento Valença. Exército. Mandaram o meu pelotão fechar a BR no trevo de Camboriú. Ninguém passava pro sul.'},
      {say:'valenca',m:'t',t:'Um homem de branco pediu ajuda pra levar os civis pra Matriz. Disse que era o padre. A gente ajudou. Carregou velho no colo.'},
      {say:'valenca',m:'t',t:'Na primeira noite eles pegaram a gente dormindo. Doze homens. Eu acordei com um deles cortando a minha perna.'},
      {wait:.6},
      {say:'valenca',m:'s',t:'Levaram os meninos pro frigorífico, perto do rio. Eu escutei eles gritando até de manhã.'},
      {say:'valenca',m:'t',t:'Depois parou.'},
      {wait:1},
      {say:'rafa',m:'a',t:'Tu tá sangrando muito.'},
      {say:'valenca',m:'n',t:'Facada na coxa. Se eu não fechar isso, não passo de amanhã. A maleta de primeiros socorros tava com o cabo Teixeira. E o cabo Teixeira tá lá dentro.'},
      {say:'valenca',m:'s',t:'No fundo do frigorífico, na câmara fria. Garoto... se tu ouvir alguma coisa lá dentro, não para pra olhar. Pega e sai.'},
      {do:()=>{F.cbMilAsk=true;}}];
    if(deliver)steps.push({say:'rafa',m:'s',t:'Eu já fui lá. Eu... eu já peguei.',dur:2},...cb2ValDeliverSteps(n,true));
    else steps.push({say:'rafa',m:'n',t:'Eu volto. Não sai daqui.'},{say:'valenca',m:'h',t:'Pra onde eu ia, né?'});
    playCut(steps,()=>{if(!F.cbMilOk)G.banner={t:'Pegue a maleta do pelotão no frigorífico',life:3.5};});
    return;}
  if(!F.cbMilOk&&cbHas('cbMaleta'))return playCut([{npc:n,id:'valenca'},{say:'rafa',m:'n',t:'Achei a maleta.'},...cb2ValDeliverSteps(n,false)]);
  if(!F.cbMilOk)return bark('valenca','t',pick2(['O frigorífico fica perto do rio, no fim da rua do estádio. A maleta tá na câmara fria.','Vai logo, garoto. Eu tô ficando gelado.','Se ouvir gancho balançando lá dentro, não olha. Corre.']));
  bark('valenca','n',pick2(['Quando o sino tocar três vezes, é a missa. A cidade fica vazia.','Quando tu for atrás do bicho, me chama. Eu chego.','A perna segura. Mais ou menos.']));
};
function cb2ValDeliverSteps(n,already){
  const F=cbF();
  return [{say:'valenca',m:'s',t:already?'Tu entrou lá sozinho? Antes de eu pedir?':'Tu voltou. Eu não achei que tu ia voltar.'},
    {do:()=>cb2Take('cbMaleta')},
    {fx:'blackout',v:1.6},{sfx:'creak',v:.3},{wait:1.4},
    {say:'valenca',m:'t',t:'Pronto. Costurado. Tá feio, mas segura.'},
    {say:'valenca',m:'n',t:'Tu viu o que tem lá dentro?'},
    {say:'rafa',m:'s',t:'Vi. Eu não sei o que era. Tinha avental. Tinha gancho no corpo dele.'},
    {wait:.6},{say:'valenca',m:'t',t:'Não me conta. Eu não quero saber. Eu não quero saber que os meninos tão com aquilo.',dur:3},
    {wait:.6},
    {say:'valenca',m:'n',t:'Escuta. Eles fazem missa à meia-noite. Quando o sino toca três vezes, todo mundo entra na Matriz. A cidade fica vazia uns minutos.'},
    {say:'valenca',m:'n',t:'E quando tu for atrás daquele bicho da igreja, me chama no rádio. Pra correr eu não sirvo mais. Pra atirar, sirvo.'},
    {do:()=>{F.cbMilOk=true;cb2Give('gran',2);AU.pickup();ach('cbVal');toast('O Sargento Valença te deu 2 granadas.');}},
    {say:'valenca',m:'h',t:'Toma. Duas granadas. É o que sobrou do pelotão.'},
    {say:'rafa',m:'n',t:'Obrigado, sargento.'}];
}
AU.cbHeartS=function(v){AU.cbHeart(v||1,1);};

// ===================== O FRIGORÍFICO =====================
// a entrada: luz piscando, ganchos balançando sozinhos, alguma coisa grande andando no fundo
function cb2FrigEnter(){
  const F=cbF(); if(F.cbFrigSeen||F.cbFrigDone)return; F.cbFrigSeen=true;
  playCut([{fx:'zoom',v:1.1},{cam:{x:CBL.frHall.x-120,y:CBL.frHall.y},t:1},
    {say:'rafa',m:'t',think:true,t:'Frio. Frio de verdade. E esse cheiro...',dur:2},
    {do:()=>{for(const l of lights)if(l.frig)l.flk=1.2;G.flick=.5;}},
    {cam:{x:CBL.frHall.x+60,y:CBL.frHall.y},t:1.4},
    {sfx:'cbHookS',v:1},{wait:1},
    {say:'rafa',m:'s',t:'Os ganchos tão balançando. Não tem vento aqui dentro.',dur:2.2},
    {wait:.7},{do:()=>{AU.cbBreath(CBL.carnSpawn.x,CBL.carnSpawn.y,.7);}},{wait:1.4},
    {say:'rafa',m:'t',think:true,t:'Tem alguma coisa respirando lá no fundo. Devagar. Dormindo.',dur:2.4},
    {cam:{x:CBL.carnSpawn.x,y:CBL.carnSpawn.y+60},t:1.2},
    {say:'rafa',m:'t',think:true,t:'Pega a maleta e sai. Não acende nada. Não olha pra nada.',dur:2.4},
    {camFree:true}],()=>{});
}
function cb2FrigStart(){
  const F=cbF(); if(F.cbFrigDone||CB2.frig)return;
  const s=CBL.carnSpawn;
  CB2.ftrail=[{x:P.x,y:P.y}];
  playCut([{say:'rafa',m:'t',think:true,t:'Peguei. Agora sai. Sai devagar.',dur:1.8},
    {wait:.5},{do:()=>{for(const l of lights)if(l.frig)l.off=true;G.flick=1;AU.cbHook(s.x,s.y,1.2);}},
    {wait:1.2},{sfx:'cbHeartS',v:1},{wait:.5},
    {cam:{x:s.x,y:s.y},t:.9},
    {do:()=>{AU.cbCrack(s.x,s.y,1);for(let i=0;i<20;i++)parts.push({k:'debris',x:s.x+rr(-20,20),y:s.y+rr(-20,20),vx:rr(-120,120),vy:rr(-120,120),life:.6,max:.6,s:rr(2,4),c:'#6a2a24'});GORE.push({k:'corpse',x:s.x+30,y:s.y+10,rot:1,type:'soldado',col:'#4a5232',skin:'#a88a70',r:12,cb:1});}},
    {spawn:'carniceiro',x:s.x,y:s.y,id:'carn',ang:Math.PI*.75},
    {do:()=>{const e=CUT.actors.carn;if(e){e.cb=1;e.rise=.01;e._l={x:e.x,y:e.y,r:120,c:'fire',f:1,cb:1};lights.push(e._l);}for(const l of lights)if(l.frig)l.off=false;}},
    {wait:1.2},{startle:'rafa'},
    {do:()=>{const e=CUT.actors.carn;if(e)AU.cbShriek(e.x,e.y,1.2);G.shake+=12;buzz&&buzz([90,40,140]);}},
    {fx:'shake',v:8},{wait:.9},
    {say:'rafa',m:'s',t:'Não. Não, não, não, não...',dur:1.3},
    {camFree:true}],
    ()=>{const e=enemies.find(x=>x.alive&&x.type==='carniceiro');if(!e)return;e.cut=false;e.rise=0;CB2.frig={t:0,e,end:false};
      G.banner={t:'CORRA',life:2.5};toast('Não dá pra lutar. Fuja pela doca e bata as portas atrás de você.');});
}
function cb2CarnAI(e,dt){
  e.anim+=dt; e.flash=Math.max(0,e.flash-dt); e.atk-=dt; e.hitAnim=Math.max(0,e.hitAnim-dt);
  if(e._l){e._l.x=e.x;e._l.y=e.y;e._l.r=100+Math.sin(e.anim*7)*18;}
  if(e.cut||!CB2.frig||CB2.frig.end){return;}
  e.state='chase'; e.sees=true;
  e.rt=(e.rt||0)-dt; if(e.rt<=0||!e.goal){e.rt=.22;e.goal=cb2ChaseGoal(e,CB2.ftrail);}
  // porta fechada no caminho: arromba
  const g=gates.find(x=>!x.open&&['cbFrA','cbFrB','cbFrE'].includes(x.id)&&hyp((x.x+x.w/2)*TILE-e.x,(x.y+x.h/2)*TILE-e.y)<52);
  if(g){e.bang=(e.bang||0)+dt;e.face=Math.atan2((g.y+g.h/2)*TILE-e.y,(g.x+g.w/2)*TILE-e.x);
    if(((e.bang*3)|0)!==((e.bangP||0)*3|0)){AU.thud(.8);G.shake+=2;}e.bangP=e.bang;
    if(e.bang>1.8&&g.id==='cbFrA'){openGate(g);e.bang=0;AU.cbCrack(e.x,e.y,.8);G.shake+=5;for(let i=0;i<16;i++)parts.push({k:'debris',x:(g.x+.5)*TILE,y:(g.y+1)*TILE,vx:rr(-140,140),vy:rr(-140,140),life:.5,max:.5,s:rr(2,4),c:'#7a7e7c'});}
    return;}
  e.bang=0;
  const gx=e.goal.x-e.x, gy=e.goal.y-e.y, gd=hyp(gx,gy)||1, spd=e.t.spd*(e.hitAnim>0?.5:1)*(G.D&&G.D.tmul?1:1);
  const nx=e.x+gx/gd*spd*dt*2, ny=e.y+gy/gd*spd*dt*2;
  // não sai para a rua: fica na porta
  if(bmap[idx((nx/TILE)|0,(ny/TILE)|0)]===CBL.frB)move(e,gx/gd*spd*dt,gy/gd*spd*dt,true);
  e.face=Math.atan2(gy,gx);
  const d=hyp(P.x-e.x,P.y-e.y);
  if(d<e.r+P.r+10&&e.atk<=0){e.atk=1.2;e.hitAnim=.45;hurtPlayer(e.t.dmg,e.x,e.y);G.shake+=8;AU.cbHook(e.x,e.y,.8);const a=Math.atan2(P.y-e.y,P.x-e.x);move(P,Math.cos(a)*26,Math.sin(a)*26,false);}
  e.snd=(e.snd||rr(1,2))-dt; if(e.snd<=0){e.snd=rr(1.4,2.6);if(Math.random()<.5)AU.cbHook(e.x,e.y,.7);else AU.cbBreath(e.x,e.y,1);}
}
// direção até o jogador: direto se enxerga, senão o ponto mais novo do rastro que ele enxerga
function cb2ChaseGoal(e,T){
  if(los(e.x,e.y,P.x,P.y))return {x:P.x,y:P.y};
  for(let i=T.length-1;i>=0;i--){const p=T[i];if(hyp(p.x-e.x,p.y-e.y)<700&&los(e.x,e.y,p.x,p.y))return p;}
  return T[0]||{x:P.x,y:P.y};
}
function cb2TrailPush(T,step,max){const l=T[T.length-1];if(!l||hyp(l.x-P.x,l.y-P.y)>step){T.push({x:P.x,y:P.y});if(T.length>max)T.shift();}}
function cb2FrigTick(dt){
  const S=CB2.frig; if(!S||S.end)return; S.t+=dt;
  const e=S.e; if(!e||!e.alive){CB2.frig=null;return;}
  cb2TrailPush(CB2.ftrail,30,90);
  // bater as portas atrás de você
  for(const g of gates){if(!g.open||g.slam||!['cbFrA','cbFrB','cbFrE'].includes(g.id))continue;
    const inG=P.x>=g.x*TILE-16&&P.x<=(g.x+g.w)*TILE+16&&P.y>=g.y*TILE-16&&P.y<=(g.y+g.h)*TILE+16;
    if(inG){g.pIn=true;continue;}
    if(g.pIn){g.pIn=false;const gc={x:(g.x+g.w/2)*TILE,y:(g.y+g.h/2)*TILE};
      if(hyp(e.x-gc.x,e.y-gc.y)>84&&hyp(P.x-gc.x,P.y-gc.y)<70){g.slam=true;closeGate(g);AU.thud(1);AU.knock&&AU.knock();G.shake+=4;floaters.push({x:P.x,y:P.y-24,t:'PORTA FECHADA',life:.9});}}}
  // saiu do prédio e se afastou: ela para na porta
  const B=buildings[CBL.frB];
  if(B&&!cb2Inside(P.x,P.y,B)&&cb2DistB(P.x,P.y,B)>TILE*2.2&&!CUT.on)cb2FrigEnd();
}
function cb2FrigEnd(){
  const S=CB2.frig; if(!S||S.end)return; S.end=true; const e=S.e, F=cbF();
  const door=[...gates].filter(g=>['cbFrB','cbFrE'].includes(g.id)).sort((a,b)=>hyp((a.x+.5)*TILE-e.x,(a.y+.5)*TILE-e.y)-hyp((b.x+.5)*TILE-e.x,(b.y+.5)*TILE-e.y))[0];
  const dc=door?{x:(door.x+door.w/2)*TILE,y:(door.y+door.h/2)*TILE}:{x:e.x,y:e.y};
  playCut([{cam:dc,t:.8},
    {do:()=>{for(const id of ['cbFrB','cbFrE']){const g=gates.find(x=>x.id===id);if(g&&g.open&&!(P.x>=g.x*TILE-20&&P.x<=(g.x+g.w)*TILE+20&&P.y>=g.y*TILE-20&&P.y<=(g.y+g.h)*TILE+20))closeGate(g);}AU.thud(1);G.shake+=6;}},
    {wait:.7},{do:()=>{AU.thud(1);G.shake+=5;}},{wait:.6},{do:()=>{AU.thud(1);G.shake+=7;}},
    {wait:.9},{do:()=>{AU.cbShriek(dc.x,dc.y,1);G.shake+=8;}},{fx:'shake',v:6},
    {wait:1.6},{do:()=>{e.alive=false;if(e._l){e._l.off=true;e._l=null;}AU.cbHook(dc.x,dc.y,.5);}},{wait:1.2},
    {say:'rafa',m:'s',t:'...Parou.',dur:1.4},
    {wait:.6},{say:'rafa',m:'t',think:true,t:'O que era aquilo? Tinha avental. Tinha avental de açougueiro.',dur:2.8},
    {say:'rafa',m:'t',think:true,t:'Ele não saiu. Ele não sai da sombra.',dur:2},
    {camFree:true}],
    ()=>{F.cbFrigDone=true;CB2.frig=null;ach('cbFuga');for(const g of gates)if(['cbFrA','cbFrB','cbFrE'].includes(g.id)){g.slam=false;g.pIn=false;}
      later(1500,()=>bark('nico','s',F.cbMilAsk?'Richard? Eu ouvi aquilo daqui do morro. Leva a maleta pro soldado.':'Richard? Eu ouvi aquilo daqui do morro. Tu tá vivo?',{radio:true}));});
}

// ===================== FURTIVIDADE: MATAR EM SILÊNCIO, CORPOS, DISFARCE =====================
function cb2ExecTarget(){
  if(!inCb()||P.inCar||P.hidden||CUT.on||G.scope||CB2.drag||cbF().cbBossOn)return null;
  let best=null,bd=48;
  for(const e of enemies){if(!e.alive||(e.type!=='cult'&&e.type!=='vig')||e.cut||e.irmao||e.victim||e.state==='chase'||e.cbMissa)continue;
    const d=hyp(e.x-P.x,e.y-P.y); if(d>=bd)continue;
    const back=Math.abs(angDiff(e.face||0,Math.atan2(P.y-e.y,P.x-e.x)));
    if(back<1.75||!los(P.x,P.y,e.x,e.y))continue; bd=d; best=e;}
  return best;
}
function cb2Exec(e){
  if(!e||!e.alive)return;
  P.slash=.16; P.ang=Math.atan2(e.y-P.y,e.x-P.x); AU.swish();
  e.cbExec=1; e.headshot=false; bloodBurst(e.x,e.y,6,P.ang);
  killEnemy(e);
  if(AU.pb)AU.pb('p_hurt',{vol:.1,rate:.7,wet:.1});
  G.flags.cbExecs=(G.flags.cbExecs||0)+1;
  // alguém viu?
  for(const o of enemies){if(!o.alive||o===e||!cb2Types.includes(o.type)||o.state==='chase'||o.cbMissa)continue;const d=hyp(o.x-e.x,o.y-e.y);
    if(d<240&&los(o.x,o.y,e.x,e.y)&&(d<90||Math.abs(angDiff(o.face||0,Math.atan2(e.y-o.y,e.x-o.x)))<1.1)){o.state='chase';o.lx=P.x;o.ly=P.y;o.lost=0;if(P.disf)cb2DisfBreak('viram você matar um deles');break;}}
  if(G.flags.cbExecs===1)later(600,()=>bark('rafa','t','...Desculpa. Desculpa.',{dur:1.6}));
}
function cb2AddBody(e){
  let dec=null; for(let i=decals.length-1;i>=Math.max(0,decals.length-6);i--){const d=decals[i];if(d.k==='corpse'&&hyp(d.x-e.x,d.y-e.y)<2){dec=d;break;}}
  const b={x:e.x,y:e.y,dec,manto:e.type!=='marc',found:!!G.scope||e.state==='chase',type:e.type};
  const it={type:'cbCorpo',x:b.x,y:b.y,tx:(b.x/TILE)|0,ty:(b.y/TILE)|0,cb:1,dyn114:1,body:b}; b.it=it; interacts.push(it);
  CB2.bodies.push(b);
  while(CB2.bodies.length>14){const o=CB2.bodies.shift();const k=interacts.indexOf(o.it);if(k>=0)interacts.splice(k,1);}
}
function cb2BodyHidden(b){const tx=(b.x/TILE)|0,ty=(b.y/TILE)|0;if(bmap[idx(tx,ty)]>=0)return true;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const t=getT(tx+i,ty+j);if(t===T.TREE||t===T.FOREST)return true;}return false;}
function cb2BodyUse(b){
  if(CB2.drag===b){CB2.drag=null;toast(cb2BodyHidden(b)?'Você largou o corpo. Aqui ninguém vai achar.':'Você largou o corpo. Na rua, alguém vai achar.');return;}
  if(!P.disf&&b.manto){b.manto=false;cb2DisfOn();return;}
  CB2.drag=b;toast('Arrastando o corpo. Esconda dentro de uma casa ou no meio das árvores. E de novo para largar.');
}
function cb2DisfOn(){
  if(P.disf)return; P.disf=true; G.flags.cbDisf=true; CB2.lookPrev=P.lookO; P.lookO={coat:'#2e2620',skin:'#d29d7c',hair:'#1a1612',pants:'#15120f',look:'manto'};
  AU.creak&&AU.creak(.3);
  if(!G.flags.cbDisfTip){G.flags.cbDisfTip=true;
    playCut([{say:'rafa',m:'t',think:true,t:'Tem cheiro de vela e de suor. Ainda tá quente.',dur:2.2},
      {say:'rafa',m:'t',think:true,t:'Não corre. Não atira. Não chega perto dos vigias. Anda devagar, como eles.',dur:2.6}],
      ()=>toast('Disfarçado: os cultistas não te reconhecem. Correr, atirar, arrastar corpo ou chegar perto de um vigia entrega você.'));}
  else toast('Você vestiu o manto.');
}
function cb2DisfOff(quiet){if(!P.disf)return;P.disf=false;G.flags.cbDisf=false;P.lookO=CB2.lookPrev;CB2.lookPrev=undefined;if(!quiet)toast('Você tirou o manto.');}
function cb2DisfBreak(why){
  if(!P.disf)return; cb2DisfOff(true); AU.sting&&AU.sting(); G.shake+=3;
  toast('O disfarce caiu: '+why+'.');
  let n=0;for(const e of enemies){if(!e.alive||!cb2Types.includes(e.type)||e.cbMissa)continue;const d=hyp(e.x-P.x,e.y-P.y);if(d<460&&los(e.x,e.y,P.x,P.y)){e.state='chase';e.lx=P.x;e.ly=P.y;e.lost=0;e.cbHold=0;e.cbWalk=null;if(n++<2&&AU.cbAli)AU.cbAli(e);}}
  if(n)psyFloat(P.x,P.y-30,'"É ELE! O FORASTEIRO!"',{life:2,c:'#e8c8b0'});
}
function cb2DisfTick(dt){
  if(!P.disf)return;
  const F=cbF();
  if(!inCb()||F.cbBossOn||F.cbDone){cb2DisfOff(true);return;}
  const shot=G.time-CB2.shotT<.35;
  for(const e of enemies){if(!e.alive||!cb2Types.includes(e.type)||e.cbMissa||e.cut)continue;const d=hyp(e.x-P.x,e.y-P.y);if(d>440)continue;if(!los(e.x,e.y,P.x,P.y))continue;
    if(shot&&d<420)return cb2DisfBreak('viram você atirar');
    if(P.running&&P.moving&&d<300)return cb2DisfBreak('ninguém da congregação corre');
    if(e.type==='vig'&&d<70)return cb2DisfBreak('o vigia olhou embaixo do capuz');
    if(e.type==='marc'&&d<54)return cb2DisfBreak('o Marcado sentiu o seu cheiro');
    if(CB2.drag&&d<260)return cb2DisfBreak('viram você arrastando um irmão');
    if(CB2.alertT>0&&d<92)return cb2DisfBreak('depois do corpo, eles olham todo mundo de perto');
    if(lampOn()&&d<120&&Math.abs(angDiff(P.ang,Math.atan2(e.y-P.y,e.x-P.x)))<.35&&Math.abs(angDiff(e.face||0,Math.atan2(P.y-e.y,P.x-e.x)))<1&&Math.random()<dt*.6)return cb2DisfBreak('você apontou a lanterna na cara de um deles');}
}
function cb2BodyTick(dt){
  CB2.alertT=Math.max(0,CB2.alertT-dt);
  const b=CB2.drag;
  if(b){
    if(P.running&&P.moving||P.hidden||P.inCar||CUT.on||P.firing){CB2.drag=null;if(P.running)toast('Você largou o corpo para correr.');}
    else{if(CB2.px!=null){const nx=CB2.px+(P.x-CB2.px)*.5,ny=CB2.py+(P.y-CB2.py)*.5;P.x=nx;P.y=ny;}
      const a=Math.atan2(b.y-P.y,b.x-P.x),tx=P.x+Math.cos(a)*24,ty=P.y+Math.sin(a)*24;b.x=tx;b.y=ty;if(b.dec){b.dec.x=tx;b.dec.y=ty;b.dec.rot=a;}
      b.it.x=tx;b.it.y=ty;b.it.tx=(tx/TILE)|0;b.it.ty=(ty/TILE)|0;
      if(Math.random()<dt*3)addDecal({k:'drop',x:tx+rr(-4,4),y:ty+rr(-4,4),r:2});}
  }
  CB2.px=P.x;CB2.py=P.y;
  CB2.bt=(CB2.bt||0)-dt; if(CB2.bt>0)return; CB2.bt=.3;
  for(const c of CB2.bodies){if(c.found||c===CB2.drag||cb2BodyHidden(c))continue;
    for(const e of enemies){if(!e.alive||!cb2Types.includes(e.type)||e.state==='chase'||e.cbMissa||e.cut)continue;const d=hyp(e.x-c.x,e.y-c.y);if(d>230)continue;
      if(!los(e.x,e.y,c.x,c.y))continue; if(d>110&&Math.abs(angDiff(e.face||0,Math.atan2(c.y-e.y,c.x-e.x)))>1.2)continue;
      c.found=true; e.state='investigate';e.nx=c.x;e.ny=c.y;e.it=14;e.cbHold=0;e.cbWalk=null;
      psyFloat(e.x,e.y-24,'"IRMÃO CAÍDO! IRMÃO CAÍDO!"',{life:2.4,c:'#e8c8b0'}); if(AU.cbAli)AU.cbAli(e);
      for(const o of enemies)if(o!==e&&o.alive&&cb2Types.includes(o.type)&&o.state!=='chase'&&hyp(o.x-c.x,o.y-c.y)<560){o.state='investigate';o.nx=c.x+rr(-140,140);o.ny=c.y+rr(-140,140);o.it=16;o.cbHold=0;o.cbWalk=null;}
      const v=enemies.find(o=>o.alive&&o.type==='vig'&&hyp(o.x-c.x,o.y-c.y)<900);
      if(v){later(1400,()=>{if(v.alive){AU.cbBell(v.x,v.y,.8);alertNoise(c.x,c.y,600);G.flags.cbBell=true;}});}
      CB2.alertT=60;
      if(hyp(P.x-c.x,P.y-c.y)<900)later(500,()=>bark('rafa','s',pick2(['Acharam o corpo. Droga.','Eles acharam. Agora vão olhar todo mundo de perto.'])));
      break;}}
}

// ===================== A MISSA DA MEIA-NOITE =====================
const CB_MISSA=[
  F=>'"Irmãos. Fechem os olhos. Hoje à noite o Cervo vai escolher."',
  F=>'"Tem um forasteiro andando pelas nossas ruas enquanto a gente reza. Richard. Ele acha que ninguém está vendo."',
  F=>F.cbExecs?'"Ele mata irmãos nossos pelas costas. Como um bicho. E ainda diz que nós somos os monstros."':'"Ele entrou na nossa cidade com uma lanterna. Como Ele pediu. Sozinho."',
  F=>P.disf?'"E agora... agora ele veste as nossas roupas. Está aqui. Entre nós. Não abram os olhos, irmãos. Ele está aqui."':'"Os amigos dele ficaram na BR. O Edu. O Matheus. Eu sei os nomes. Eu sei de tudo."',
  F=>F.cbMilOk?'"E ele salvou um soldado. Um soldado que viu demais. A gente vai achar o soldado, Richard. Depois."':'"Os mortos lá embaixo comem uns aos outros porque não têm pastor. Nós temos."',
  F=>'"Richard. Eu sei que você está ouvindo. Venha à Matriz. Ele espera você desde que você nasceu."',
];
function cb2MissaReady(){const F=cbF();return F.cbNoite&&!F.cbMissaOn&&!F.cbMissaDone&&!F.cbBossOn&&!CB2.frig&&!G.scope&&!CUT.on&&inCb()&&(G.ev.cbNoiteT||0)>70&&!enemies.some(e=>e.alive&&e.state==='chase'&&cb2Types.includes(e.type)&&hyp(e.x-P.x,e.y-P.y)<500);}
function cb2MissaStart(){
  const F=cbF(); if(F.cbMissaOn||F.cbMissaDone)return; F.cbMissaOn=true;
  const sino=CBL.sino||CBL.portal, por=CBL.portal;
  for(const e of enemies)if(e.alive&&cb2Types.includes(e.type)&&e.state!=='chase'&&!e.irmao&&!e.cut){e.cbMissa={t:0};e.cbHold=0;e.cbWalk=null;e.state='wander';}
  CB2.missa={t:0,line:0,disf:!!P.disf,act:[]};
  playCut([{cam:{x:sino.x,y:sino.y+tc(7)},t:1},
    {do:()=>AU.cbBell(sino.x,sino.y,1.2)},{wait:2.2},{do:()=>AU.cbBell(sino.x,sino.y,1.2)},{wait:2.2},{do:()=>AU.cbBell(sino.x,sino.y,1.3)},
    {say:'rafa',m:'t',think:true,t:'Três vezes. A missa.',dur:1.8},
    {cam:{x:por.x,y:por.y+tc(5)},t:1.2},
    {do:()=>{for(let i=0;i<8;i++){const a=i/8*Math.PI,e=makeEnemy('cult',por.x+Math.cos(a)*rr(200,320),por.y+tc(3)+Math.sin(a)*rr(120,220),null);e.cut=true;e.cb=1;e.vela=1;e.walkTo={x:por.x+rr(-30,30),y:por.y-tc(1),spd:36};e._l={x:e.x,y:e.y,r:80,c:'fire',f:1,cb:1};lights.push(e._l);enemies.push(e);CUT.actors['m'+i]=e;CB2.missa.act.push(e);}AU.cbHum(por.x,por.y,1.3);}},
    {wait:2.4},
    {say:'rafa',m:'t',think:true,t:'Todo mundo com vela na mão. Velhos. Criança. Todo mundo entrando.',dur:2.6},
    {do:()=>AU.cbRev(.7)},{wait:1.6},
    {sfx:'static',v:.6},{say:'pregador',m:'n',radio:true,t:'"Irmãos... sentem-se. As portas ficam abertas. Quem estiver lá fora, que escute."'},
    {camFree:true}],
    ()=>{for(const e of CB2.missa.act){e.alive=false;if(e._l){e._l.off=true;e._l=null;}}CB2.missa.act=[];G.banner={t:'Meia-noite · a cidade está vazia',life:4};
      toast('A missa: por alguns minutos, quase ninguém na rua. Aproveite.');});
}
function cb2MissaTick(dt){
  const M=CB2.missa, F=cbF(); if(!M)return; if(CUT.on)return;
  M.t+=dt; G.ev.cbPat=999;
  if(P.disf&&inCb())M.disfT=(M.disfT||0)+dt;
  const at=[10,24,38,52,66,80];
  if(M.line<at.length&&M.t>at[M.line]){const L=CB_MISSA[M.line](F);M.line++;cbSay(L);if(Math.random()<.5)later(2500,()=>AU.cbHum(CBL.altar.x,CBL.altar.y,1));}
  if(M.t>92){CB2.missa=null;F.cbMissaOn=false;F.cbMissaDone=true;G.ev.cbPat=4;
    if((M.disfT||0)>60)ach('cbManto');
    AU.cbBell(CBL.sino?CBL.sino.x:CBL.portal.x,CBL.sino?CBL.sino.y:CBL.portal.y,1);
    later(1500,()=>cbSay('"Amém. Agora vão, irmãos. Ele está na cidade. Tragam ele pra mim."'));
    for(let i=0;i<8;i++){const p=cb2Pt(CBL.portal.x+rr(-90,90),CBL.portal.y+tc(2));const e=makeEnemy('cult',p.x,p.y,null);e.cb=1;e.cbNight=1;e.state='investigate';const t=cbSpot(200,900)||{x:P.x,y:P.y};e.nx=t.x;e.ny=t.y;e.it=30;enemies.push(e);}
    G.banner={t:'A missa acabou. Eles estão saindo.',life:3.5};}
}

// ===================== O PREGADOR NO CAMINHO =====================
const CB_PREG=[
  {id:'a1',ok:F=>F.cbSt>=3&&!F.cbNoite&&!F.cbMissaOn,near:()=>CBL.paroq,r:430,at:()=>({x:tc(88),y:tc(cbY(23.4))}),
    lines:['"Bem-vindo à minha cidade, Richard."','"Pode entrar na casa do padre. Ele não vai se importar. Não mais."']},
  {id:'a2',ok:F=>F.cbNoite&&!F.cbMissaOn&&!F.cbBossOn,near:null,r:0,at:'frente',
    lines:['"O Edu e o Matheus estão na Caçulinha, não estão? Eu sei os nomes, Richard."','"Corre. Ele gosta quando correm."']},
  {id:'a3',ok:F=>cbHas('cbSeloVela')&&!F.cbBossOn,near:()=>CBL.pregador,r:520,at:()=>({x:tc(14.5),y:tc(cbY(59.5))}),
    lines:['"Você mexeu no meu altar."','"Agora a vela queima você também. Hoje. Amanhã. Pra sempre."']},
  {id:'a4',ok:F=>F.cbMilCall&&!F.cbBossOn,near:()=>CBL.cemit,r:380,at:()=>({x:tc(125),y:tc(cbY(17))}),
    lines:['"Gostou das covas? Contei uma pra cada um que não acendeu a vela."','"Tem uma com o seu nome. Eu mesmo cavei."']},
];
function cb2PregTick(dt){
  const F=cbF();
  if(CB2.preg){const A=CB2.preg,n=A.n;A.t+=dt;
    const d=hyp(P.x-n.x,P.y-n.y), lit=lampOn()&&d<420&&Math.abs(angDiff(P.ang,Math.atan2(n.y-P.y,n.x-P.x)))<.3&&A.t>2.5;
    n.ang=Math.atan2(P.y-n.y,P.x-n.x);
    const gone=d<170||lit||A.t>9||d>1100;
    if(!gone&&A.t>.5&&!A.s1){A.s1=1;bark('pregador','n',A.def.lines[0],{dur:3});AU.cbWhisp(n.x,n.y,.8);}
    if(!gone&&A.t>4&&!A.s2){A.s2=1;bark('pregador','s',A.def.lines[1],{dur:3});}
    if(gone){
      const k=npcs.indexOf(n);if(k>=0)npcs.splice(k,1);if(A.l)A.l.off=true;CB2.preg=null;G.flick=Math.max(G.flick||0,.6);AU.cbWhisp(n.x,n.y,1);AU.static&&AU.static(.3,.3);
      psyFloat(n.x,n.y-20,'...',{life:1.6,c:'#e8d8c8',whisper:true});
      if(!F.cbPregSome){F.cbPregSome=true;later(900,()=>bark('rafa','s','Ele tava ali. Ele tava bem ali.'));}}
    return;}
  if(CUT.on||G.scope||CB2.frig||!inCb()||F.cbBossOn)return;
  CB2.pt=(CB2.pt||0)-dt; if(CB2.pt>0)return; CB2.pt=1;
  for(const A of CB_PREG){if(F['cbPA_'+A.id]||!A.ok(F))continue;
    let at=null;
    if(A.at==='frente'){if(Math.random()>.12)continue;const a=P.ang;for(const dd of [460,400,340]){const x=P.x+Math.cos(a)*dd,y=P.y+Math.sin(a)*dd,tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty)||ty<CBY+9)continue;const k=idx(tx,ty);if(SOLID[map[k]]||!reach[k]||bmap[k]>=0||!los(P.x,P.y,x,y))continue;at={x:tc(tx),y:tc(ty)};break;}}
    else{const nr=A.near();if(!nr||hyp(P.x-nr.x,P.y-nr.y)>A.r)continue;at=A.at();if(!los(P.x,P.y,at.x,at.y)&&hyp(P.x-at.x,P.y-at.y)>200)continue;}
    if(!at)continue;
    F['cbPA_'+A.id]=true;
    const n={id:'cbPregApp',name:'O Pregador',x:at.x,y:at.y,ang:0,...LOOKS.pregador,col:'#e0dace',busy:true};
    npcs.push(n); CB2.preg={n,t:0,def:A,l:{x:n.x,y:n.y,r:170,c:'fire',f:1,cb:1}}; lights.push(CB2.preg.l);
    G.flick=Math.max(G.flick||0,.35); AU.cbHeart(1,1);
    // a primeira vez é uma cena: a câmera vai até ele
    if(A.id==='a1')playCut([{cam:n,t:1},{wait:1.2},{say:'rafa',m:'s',t:'Na escadaria da igreja. De branco.',dur:1.8},{camFree:true}]);
    if(A.id==='a4')playCut([{cam:{x:CBL.cova.x,y:CBL.cova.y},t:1},{say:'rafa',m:'t',think:true,t:'Covas abertas. Dezenas. Ninguém dentro.',dur:2.2},{cam:n,t:.8},{wait:.8},{camFree:true}]);
    break;}
}
(function(){const sn=STORY.npc;STORY.npc=function(n){if(n&&n.id==='cbPregApp')return;if(n&&n.id==='cbVal')return STORY.cbValTalk(n);return sn.call(STORY,n);};})();

// ===================== O CERVO: A TRANSFORMAÇÃO =====================
function cb2BreakFacade(){
  const B=buildings[CBL.igB]; if(!B)return;
  const y=cbY(21); for(let x=83;x<=92;x++){const k=idx(x,y);if(map[k]===T.WALL||map[k]===T.GATE){map[k]=B.floor;under[k]=B.floor;}}
  const g=gates.find(x=>x.id==='cbPortal'); if(g){g.open=true;}
  for(let x=83;x<=92;x++){const k=idx(x,y);map[k]=B.floor;under[k]=B.floor;}
  B.roof='#2a2622'; MAPV++; if(typeof invalidateRect==='function')invalidateRect(B.x,B.y,B.w,B.h+2);
}
function cb2Transform(e){
  const F=cbF(); if(F.cbF1Down)return; F.cbF1Down=true;
  e.cut=true; e.mode='stun'; e.mt=99; e.hp=Math.max(1,e.hp);
  for(const x of enemies)if(x.alive&&x.cb&&x.type==='marc')x.alive=false;
  const pr=npcs.find(n=>n.id==='cbPreg');
  CB2.morph={e,t:0};
  playCut([{fx:'slow',v:.8},{cam:{x:e.x,y:e.y},t:.8},
    {do:()=>{AU.cbBreath(e.x,e.y,1.3);e.down2=1;}},
    {say:'rafa',m:'s',t:'Caiu... ele caiu.',dur:1.6},
    {wait:1},
    ...(pr?[{cam:pr,t:.7},{say:'pregador',m:'h',t:'Caiu? Não, Richard. Você não matou Ele. Você acordou Ele.'},{cam:{x:e.x,y:e.y},t:.6}]:[]),
    {do:()=>{for(const l of lights)if(l.ig)l.off=true;G.flick=1;AU.cbSub(1);CB2.morph.on=true;e._l={x:e.x,y:e.y,r:150,c:'fire',f:1,cb:1};lights.push(e._l);}},
    {wait:1.2},{do:()=>AU.cbCrack(e.x,e.y,1.2)},{fx:'shake',v:6},{wait:1.1},
    {say:'rafa',m:'s',t:'O corpo dele... tá abrindo.',dur:1.8},
    {do:()=>{AU.cbRev(1);AU.cbCrack(e.x,e.y,1);}},{wait:1.4},
    {do:()=>{AU.cbCrack(e.x,e.y,1.3);G.shake+=6;}},
    {say:'rafa',m:'t',think:true,t:'A galhada tá crescendo. Tá virando espinho. A cabeça... a cabeça tá se abrindo no meio.',dur:3},
    {do:()=>{AU.cbRoar2(e.x,e.y,1.3);G.shake+=16;buzz&&buzz([120,40,200]);}},{fx:'flash',v:.6},{wait:1.4},
    ...(pr?[{say:'pregador',m:'s',t:'OLHEM PARA ELE! IRMÃOS, OLHEM PARA ELE!'}]:[]),
    {do:()=>{const B=buildings[CBL.igB];if(B){for(let i=0;i<70;i++)parts.push({k:'debris',x:tc(B.x+1+Math.random()*(B.w-2)),y:tc(B.y+1+Math.random()*(B.h-2)),vx:rr(-60,60),vy:rr(-60,60),life:rr(.6,1.4),max:1.4,s:rr(3,6),c:Math.random()<.5?'#6a5a48':'#3a3228'});
      for(let i=0;i<14;i++)GORE.push({k:'scorch',x:tc(B.x+2+Math.random()*(B.w-4)),y:tc(B.y+2+Math.random()*(B.h-6)),r:rr(20,46),rot:Math.random()*6,seed:Math.random(),cb:1});}
      AU.boom&&AU.boom(1);AU.cbSub(1);G.shake+=22;G.blackout=Math.max(G.blackout||0,.5);}},
    {say:'rafa',m:'s',t:'O TETO!',dur:1},{fx:'shake',v:14},{wait:.8},
    {do:()=>{cb2BreakFacade();e.alive=false;if(e._l){e._l.off=true;e._l=null;}const p={x:e.x,y:e.y};const c2=makeEnemy('cervo2',p.x,p.y,null);c2.cut=true;c2.cb=1;c2._l={x:p.x,y:p.y,r:170,c:'fire',f:1,cb:1};lights.push(c2._l);c2.mode='walk';c2.mt=3;c2.ph=1;c2.face=Math.PI/2;enemies.push(c2);CUT.actors.c2=c2;CB2.morph=null;
      c2.walkTo={x:CBL.portal.x,y:CBL.portal.y+tc(5),spd:110};G.ev.cb2Spawn=1;AU.cbRoar2(p.x,p.y,1.1);}},
    {cam:{x:CBL.portal.x,y:CBL.portal.y+tc(2)},t:.6},{wait:2.6},
    {do:()=>{G.shake+=12;AU.cbSub(1);}},{fx:'shake',v:12},
    {say:'rafa',m:'s',t:'Ele saiu pela parede. Ele tá na praça.',dur:1.8},
    {cam:{x:CBL.coreto.x,y:CBL.coreto.y-60},t:1},
    {do:()=>{const c2=CUT.actors.c2;if(c2)c2.walkTo={x:CBL.coreto.x,y:CBL.coreto.y-tc(3),spd:90};for(const l of CB_LIGHTS)if(hyp(l.x-CBL.coreto.x,l.y-CBL.coreto.y)<500&&Math.random()<.6)l.off=true;AU.cbRoar2(CBL.coreto.x,CBL.coreto.y,1);}},{wait:1.8},
    {sfx:'static',v:1},
    {say:'nico',m:'s',radio:true,t:'Richard?! O que é ISSO saindo da igreja?!'},
    ...(F.cbMilOk?[{say:'valenca',m:'a',radio:true,t:'Tô vendo, garoto. Tô chegando. Puxa ele pra praça, longe das casas.'}]:[]),
    {say:'nico',m:'n',radio:true,t:'Faz ele trombar em alguma coisa. Quando ele ficar tonto, eu acerto a cabeça. Daqui eu não erro.'},
    {say:'rafa',m:'a',t:'Tá. Tá bom. Vem, seu desgraçado. VEM.'},
    {camFree:true}],
    ()=>{F.cbF2=true;const c2=cb2Boss();if(c2){c2.cut=false;c2.walkTo=null;c2.mode='walk';c2.mt=2;}
      if(F.cbMilOk)cb2ValArrive();G.banner={t:'O Cervo desperto',life:3.5};
      toast('Faça ele investir contra paredes de casas. Atordoado, ele leva tiro do Nicolas.');});
}
(function(){
  const he=hurtEnemy; hurtEnemy=function(e,dmg,kx,ky,o){
    if(e&&e.type==='carniceiro'){e.flash=.08;if(!e.hitSay){e.hitSay=1;later(300,()=>bark('rafa','s','Não adianta! Não adianta nada!'));}return;}
    if(e&&e.type==='chifrudo'&&e.alive&&!G.flags.cbF1Down&&!(typeof MP!=='undefined'&&MP.on)&&e.hp-dmg<=e.max*.02){e.hp=Math.max(1,e.hp-dmg);e.flash=.08;cb2Transform(e);return;}
    if(e&&e.type==='cervo2'&&o&&o.ally){const floor=e.max*.12;if(e.hp<=floor)return;dmg=Math.min(dmg,e.hp-floor);}
    // a pele dele é grossa: bala de verdade só entra quando ele está atordoado
    else if(e&&e.type==='cervo2'&&e.mode!=='stun'&&dmg<9000){dmg*=.45;}
    return he.apply(this,[e,dmg,kx,ky,o]);};
  const sb=STORY.bossDown; STORY.bossDown=function(t){if(t==='chifrudo'||t==='cervo2'||t==='carniceiro')return;return sb.apply(this,arguments);};
  const ke=killEnemy; killEnemy=function(e,...a){
    const out=ke(e,...a);
    try{if(e&&!e.alive){
      if(inCbPx(e.x,e.y)&&cb2Types.includes(e.type)&&!e.cut&&!e.victim&&!e.cbProc&&!cbF().cbBossOn)cb2AddBody(e);
      if(e.type==='cervo2'){cbF().cbC2Dead=true;for(let i=decals.length-1;i>=0;i--)if(decals[i].k==='corpse'&&decals[i].type==='cervo2')decals.splice(i,1);
        if(e._l){e._l.off=true;e._l=null;}CBD.push({k:'carcaca',x:e.x,y:e.y,rot:e.face||0});later(300,()=>cb2Final(e));}
    }}catch(err){console.error(err);}
    return out;};
})();

// ===================== O CERVO DESPERTO =====================
function cb2Marcs(){return enemies.filter(e=>e.alive&&e.type==='marc'&&e.cb2).length;}
function cb2Smash(e,tx,ty,charge){
  const cx=e.x+tx*30,cy=e.y+ty*30,ctx0=(cx/TILE)|0,cty=(cy/TILE)|0;let any=false;
  for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++){const x=ctx0+i,y=cty+j;if(!inb(x,y)||y<=CBY)continue;const k=idx(x,y);if(bmap[k]>=0)continue;const t=map[k];
    if(t===T.TREE||t===T.PROP||(charge&&t===T.FENCE)){const u=under[k]&&!SOLID[under[k]]?under[k]:T.GRASS;setT(x,y,u);any=true;
      for(let q=0;q<8;q++)parts.push({k:'debris',x:tc(x),y:tc(y),vx:rr(-140,140),vy:rr(-140,140),life:.5,max:.5,s:rr(2,4),c:t===T.TREE?'#2a3a1e':'#5a4a3a'});if(G.time-(CB2.thT||0)>.45){CB2.thT=G.time;AU.thud(.5);}}
    else if(t===T.CAR){const car=cars.find(c=>x>=c.x&&x<c.x+c.w&&y>=c.y&&y<c.y+c.h);if(car){for(let jj=0;jj<car.h;jj++)for(let ii=0;ii<car.w;ii++){const kk=idx(car.x+ii,car.y+jj);setT(car.x+ii,car.y+jj,under[kk]&&!SOLID[under[kk]]?under[kk]:T.ROAD);}cars.splice(cars.indexOf(car),1);
        const bx=tc(car.x)+(car.w-1)*16,by=tc(car.y)+(car.h-1)*16;explodeFx(bx,by,1.2);AU.boom&&AU.boom(.8);G.shake+=10;GORE.push({k:'scorch',x:bx,y:by,r:60,rot:0,seed:.5,cb:1});
        if(hyp(P.x-bx,P.y-by)<110)hurtPlayer(18,bx,by);any=true;}}}
  for(const l of CB_LIGHTS)if(!l.off&&hyp(l.x-cx,l.y-cy)<46){l.off=true;AU.glass&&AU.glass(.6);for(let q=0;q<12;q++)parts.push({k:'spark',x:l.x,y:l.y,vx:rr(-160,160),vy:rr(-160,160),life:.3,max:.3,s:2,c:'#ffd27a'});}
  if(any&&typeof invalidateRect==='function')invalidateRect(ctx0-2,cty-2,5,5);
  return any;
}
function cb2C2AI(e,dt){
  const dx=P.x-e.x,dy=P.y-e.y,d=hyp(dx,dy)||1; e.anim+=dt; e.flash=Math.max(0,e.flash-dt); e.atk-=dt; e.hitAnim=Math.max(0,e.hitAnim-dt);
  if(e.cut)return; e.state='chase'; e.sees=true; e.lx=P.x; e.ly=P.y;
  const hf=e.hp/e.max;
  if(e.ph===1&&hf<.66){e.ph=2;e.mode='howl';e.mt=1.3;e.howlT=24;AU.cbRoar2(e.x,e.y,1.2);G.shake+=10;cbSay('"Irmãos! Venham! Venham ver o que Ele é!"');}
  if(e.ph===2&&hf<.33){e.ph=3;AU.cbShriek(e.x,e.y,1.3);AU.cbRev(1);G.flick=1;G.shake+=12;for(const l of CB_LIGHTS)if(Math.random()<.7)l.off=true;toast('Ele enlouqueceu. Não fica parado.');
    later(800,()=>bark('nico','s','Ele tá sangrando preto, Richard! Tá morrendo! Segura!',{radio:true}));}
  const spd=e.t.spd*(e.ph===3?1.3:e.ph===2?1.12:1);
  e.mt-=dt; e.howlT=(e.howlT??24)-dt;
  e.rt=(e.rt||0)-dt; if(e.rt<=0||!e.goal){e.rt=.3;e.goal=cb2ChaseGoal(e,CB2.btrail);}
  switch(e.mode){
    case 'walk':{const gx=e.goal.x-e.x,gy=e.goal.y-e.y,gd=hyp(gx,gy)||1,tx=gx/gd,ty=gy/gd;
      cb2Smash(e,tx,ty,false);
      const hit=move(e,tx*spd*dt,ty*spd*dt,true); e.stk=hit?(e.stk||0)+dt:Math.max(0,(e.stk||0)-dt);
      if(e.stk>2.4){e.stk=0;const p=CB2.btrail[Math.max(0,CB2.btrail.length-6)]||P;const q=cb2Pt(p.x,p.y);if(hyp(q.x-P.x,q.y-P.y)>140){for(let i=0;i<24;i++)parts.push({k:'smoke',x:e.x,y:e.y,vx:rr(-60,60),vy:rr(-60,60),life:1.2,max:1.2,s:rr(10,20),c:'#2a2420'});e.x=q.x;e.y=q.y;AU.cbSub(.6);}}
      e.face=Math.atan2(ty,tx);
      if(d<e.r+P.r+12&&e.atk<=0){e.atk=1.15;e.hitAnim=.35;hurtPlayer(e.t.dmg,e.x,e.y);G.shake+=8;}
      if(e.mt<=0&&d<175&&e.ph>=2){e.mode='smash';e.mt=.85;AU.cbRoar2(e.x,e.y,.6);}
      else if(e.mt<=0&&d<580&&d>110&&los(e.x,e.y,P.x,P.y)){e.mode='tele';e.mt=e.ph===3?.6:.9;e.cdx=dx/d;e.cdy=dy/d;AU.cbBreath(e.x,e.y,1.3);}
      else if(e.howlT<=0&&e.ph>=2&&cb2Marcs()<3){e.mode='howl';e.mt=1.3;e.howlT=e.ph===3?18:26;AU.cbRoar2(e.x,e.y,1);}
      break;}
    case 'tele':e.face=Math.atan2(e.cdy,e.cdx);if(e.mt<=0){e.mode='charge';e.mt=.95;AU.roar&&AU.roar();}break;
    case 'charge':{cb2Smash(e,e.cdx,e.cdy,true);const hit=move(e,e.cdx*spd*3.6*dt,e.cdy*spd*3.6*dt,true);
      if(d<e.r+P.r+8&&e.atk<=0){e.atk=1;hurtPlayer(e.t.dmg*1.25,e.x,e.y);G.shake+=10;move(P,e.cdx*40,e.cdy*40,false);e.mode='walk';e.mt=rr(3.5,5.5);}
      else if(hit){e.mode='stun';e.mt=e.ph===3?1.8:2.5;G.shake+=10;AU.thud(1);AU.cbSub(.7);CB2.stun++;toast('Ele bateu! AGORA!');cb2NicoBig(e);}
      else if(e.mt<=0){e.mode='walk';e.mt=e.ph===3?rr(2,3.2):rr(3.5,5.5);}break;}
    case 'smash':if(e.mt<=0){G.shake+=12;AU.cbSub(1);for(let i=0;i<36;i++){const a=i/36*6.283;parts.push({k:'smoke',x:e.x+Math.cos(a)*30,y:e.y+Math.sin(a)*30,vx:Math.cos(a)*220,vy:Math.sin(a)*220,life:.7,max:.7,s:rr(8,14),c:'#3a3028'});}
      if(d<140)hurtPlayer(20,e.x,e.y);for(const l of CB_LIGHTS)if(hyp(l.x-e.x,l.y-e.y)<220)l.off=true;e.mode='walk';e.mt=rr(3,4.5);}break;
    case 'howl':if(e.mt<=0){for(let i=0;i<2;i++){const s=cbSpot(300,520)||{x:e.x+rr(-200,200),y:e.y+rr(-200,200)};const m=makeEnemy('marc',s.x,s.y,null);m.cb=1;m.cb2=1;m.state='chase';m.lx=P.x;m.ly=P.y;enemies.push(m);}
      e.mode='walk';e.mt=rr(2,3);if(CB2.val)later(900,()=>bark('valenca','a','Tem mais deles vindo! Eu cuido dos pequenos!'));}break;
    case 'stun':if(e.mt<=0){e.mode='walk';e.mt=rr(2.5,4);}break;
  }
  e.snd=(e.snd??3)-dt; if(e.snd<=0){e.snd=rr(3,6);if(Math.random()<.4)AU.cbRoar2(e.x,e.y,.45);else AU.cbBreath(e.x,e.y,1.2);}
}
// o Nicolas, do morro
function cb2NicoShot(e,dmg,line){
  if(!e||!e.alive)return;
  const a=Math.atan2(e.y-(e.y+600),e.x-(e.x+400));
  CB2.tr.push({x0:e.x+520,y0:e.y+700,x1:e.x+rr(-6,6),y1:e.y+rr(-6,6),t:.14,c:'255,220,140'});
  AU.pb&&AU.pb('shot_sil',{vol:.2,far:.6,wet:.5}); bloodBurst(e.x,e.y,10,a);
  hurtEnemy(e,dmg,0,0,{ally:true}); floaters.push({x:e.x,y:e.y-e.r-8,t:'NICOLAS',life:.8});
  if(line)bark('nico','a',line,{radio:true,dur:1.8});
}
function cb2NicoBig(e){later(500,()=>{if(e.alive&&e.mode==='stun')cb2NicoShot(e,e.max*.085,pick2(['Peguei a cabeça dele!','Ele sentiu essa! De novo, Richard!','Faz ele bater de novo! Eu tô na mira!','NA CABEÇA!']));});}
// o Sargento Valença
function cb2ValArrive(){
  if(CB2.val)return; const base=cb2Pt(CBL.coreto.x-tc(10),CBL.coreto.y+tc(8));
  CB2.val={x:base.x,y:base.y,r:10,cr:10,ang:0,walk:0,cd:2,gcd:14,moving:false};
  later(600,()=>{AU.pbAt&&AU.pbAt('shot_smg',base.x,base.y,{vol:.3,maxD:1400});bark('valenca','a','SAI DA FRENTE DELE, GAROTO! FOGO!',{dur:2});});
}
function cb2ValTick(dt){
  const V=CB2.val; if(!V)return; const e=cb2Boss();
  V.moving=false;
  if(!e){if(cbF().cbBoss){const d=hyp(P.x-V.x,P.y-V.y);if(d>130){const a=Math.atan2(P.y-V.y,P.x-V.x);move(V,Math.cos(a)*70*dt,Math.sin(a)*70*dt,false);V.ang=a;V.walk+=dt*9;V.moving=true;}}return;}
  // fica de longe, de lado, perto de você
  const db=hyp(e.x-V.x,e.y-V.y), dp=hyp(P.x-V.x,P.y-V.y);
  let mx=0,my=0; if(db<260){mx+=(V.x-e.x)/db;my+=(V.y-e.y)/db;} if(dp>380){mx+=(P.x-V.x)/dp;my+=(P.y-V.y)/dp;}
  const ml=hyp(mx,my); if(ml>.1){move(V,mx/ml*95*dt,my/ml*95*dt,false);V.walk+=dt*10;V.moving=true;}
  const marcs=enemies.filter(m=>m.alive&&m.type==='marc'&&hyp(m.x-V.x,m.y-V.y)<520);
  const tg=marcs.sort((a,b)=>hyp(a.x-P.x,a.y-P.y)-hyp(b.x-P.x,b.y-P.y))[0]||e;
  V.ang=Math.atan2(tg.y-V.y,tg.x-V.x); V.cd-=dt; V.gcd-=dt;
  if(V.cd<=0&&hyp(tg.x-V.x,tg.y-V.y)<720&&los(V.x,V.y,tg.x,tg.y)){V.cd=tg===e?2.6:1.4;
    for(let i=0;i<4;i++)later(i*90,()=>{if(!tg.alive)return;CB2.tr.push({x0:V.x,y0:V.y,x1:tg.x+rr(-10,10),y1:tg.y+rr(-10,10),t:.07,c:'255,200,110'});AU.pbAt&&AU.pbAt('shot_smg',V.x,V.y,{vol:.22,maxD:1400,wet:.3});
      hurtEnemy(tg,tg===e?e.max*.0035:22,0,0,{ally:true});bloodBurst(tg.x,tg.y,2,V.ang);});
    if(Math.random()<.12)later(500,()=>bark('valenca','a',pick2(['Recarregando!','Tô contigo, garoto!','Esse bicho não cai?!','Mais um!'])));}
  if(V.gcd<=0&&(marcs.length>=2||e.mode==='stun')){V.gcd=e.mode==='stun'?16:12;const t={x:(marcs[0]||e).x,y:(marcs[0]||e).y};bark('valenca','a','GRANADA!',{dur:1.2});
    later(900,()=>{explodeFx(t.x,t.y,1);AU.boom&&AU.boom(.6);G.shake+=6;for(const o of enemies){if(!o.alive)continue;const dd=hyp(o.x-t.x,o.y-t.y);if(dd<120)hurtEnemy(o,o.type==='cervo2'?o.max*.03:140,0,0,{ally:true});}});}
}
function cb2FightTick(dt){
  const F=cbF(), e=cb2Boss(); if(!F.cbF2||F.cbBoss)return;
  cb2TrailPush(CB2.btrail,40,70);
  if(!e&&!CUT.on&&!F.cbBossFim&&!F.cbC2Dead&&!G.ev.cb2Spawn){G.ev.cb2Spawn=1;const p=cb2Pt(CBL.coreto.x,CBL.coreto.y-tc(3));const c2=makeEnemy('cervo2',p.x,p.y,null);c2.cb=1;c2._l={x:p.x,y:p.y,r:170,c:'fire',f:1,cb:1};lights.push(c2._l);c2.mode='walk';c2.mt=3;c2.ph=1;enemies.push(c2);F.cbBossOn=true;F.cbBossSpawned=true;
    if(!npcs.some(n=>n.id==='cbPreg'))npcs.push({id:'cbPreg',name:'O Pregador',x:CBL.pulpito.x,y:CBL.pulpito.y,ang:0,...LOOKS.pregador,col:'#e0dace',cond:()=>cbF().cbBossOn&&!cbF().cbPregDead});
    if(F.cbMilOk)cb2ValArrive();}
  if(!e||CUT.on)return;
  CB2.nicoT-=dt; if(CB2.nicoT<=0){CB2.nicoT=rr(9,13);if(e.mode!=='stun')cb2NicoShot(e,e.max*.015,Math.random()<.4?pick2(['Tô acertando, mas ele não para!','Ele nem sente os pequenos. Faz ele trombar!','Corre pra perto de uma casa, Richard!']):null);}
}
function cb2Final(e){
  const F=cbF(); if(F.cbBossFim)return; F.cbBossFim=true; F.cbBoss=true; F.cbSt=5; F.cbF2Done=true; ach&&ach('cbCervo'); ach&&ach('cbDesperto');
  for(const x of enemies)if(x.alive&&x.cb&&x.type==='marc')x.alive=false;
  const pr=npcs.find(n=>n.id==='cbPreg'); if(pr){const p=cb2Pt(CBL.portal.x,CBL.portal.y+tc(2));pr.x=p.x;pr.y=p.y;}
  const V=CB2.val;
  playCut([{fx:'slow',v:.9},{wait:.6},{do:()=>{AU.cbRoar2(e.x,e.y,.9);AU.cbRev(.8);}},{fx:'shake',v:16},{wait:1.4},
    {do:()=>{for(const l of CB_LIGHTS)l.off=false;for(const l of lights)if(l.ig)l.off=false;G.flick=.3;}},
    {say:'rafa',m:'s',t:'Caiu. Dessa vez caiu.',dur:1.8},
    {wait:.8},
    ...(pr?[{cam:pr,t:.9},{npc:pr,id:'pregador'},
      {say:'pregador',m:'s',t:'Não. NÃO. Você não entende o que fez. Ele segurava os mortos lá embaixo. Agora eles sobem o morro.'},
      {say:'pregador',m:'s',t:'Agora eles vêm pra cá também. Pra cá. Pra mim.'},
      {do:()=>{AU.glass&&AU.glass(1);}},{wait:.3},
      {do:()=>{F.cbPregDead=true;bloodBurst(pr.x,pr.y,16,0);AU.pb&&AU.pb('shot_sil',{vol:.2,far:.5});GORE.push({k:'corpse',x:pr.x,y:pr.y,rot:1,type:'cult',col:'#e0dace',skin:'#d8b898',r:12,cb:1});}},
      {sfx:'static',v:.8},{say:'nico',m:'t',radio:true,t:'...Desculpa, Richard. Eu precisava fazer isso. Pelo meu irmão.'}]:[]),
    ...(V?[{say:'valenca',m:'n',t:'Acabou, garoto. Acabou mesmo.'},
      {say:'valenca',m:'t',t:'Eu vou pra BR. Se sobrou alguém do meu pelotão, tá lá. Se não sobrou... alguém tem que contar o que aconteceu aqui.'},
      {say:'rafa',m:'n',t:'Se cuida, sargento.'}]:[]),
    {say:'rafa',m:'t',t:'Tá tudo bem, Nicolas. A gente vai embora daqui.'},
    {say:'nico',m:'n',radio:true,t:'Eu vou pra Balneário, pro alto de um prédio, com o drone. De lá eu te cubro pelo rádio até o fim, tá? Até o porto.'},
    {say:'nico',m:'h',radio:true,t:'E deixei uma coisa pra ti na porta da igreja. Era do meu irmão. Ele ia querer que alguém usasse.'},
    {camFree:true},
    {do:()=>{const i=WI('sniper');if(i>=0&&!P.owned[i])cbPick('cbSnipeR',88,cbY(24),i,5,'weapon');cbPick('cbSnipeA',90,cbY(24),'r308',12);}}],
    ()=>{G.banner={t:'O Cervo caiu · volte para a BR-101 pela estrada do leste',life:5};if(CB2.val)later(8000,()=>{CB2.val=null;});});
}

// o Valença também fala quando está do seu lado na luta
if(typeof falaPresente==='function'){const fp=falaPresente;falaPresente=function(w,R=1200){if(w==='valenca'&&CB2.val&&hyp(CB2.val.x-P.x,CB2.val.y-P.y)<R)return true;return fp(w,R);};}

// ===================== CORAÇÃO, SOMBRA, TICK =====================
function cb2Heart(dt){
  let d=1e9; for(const e of enemies)if(e.alive&&(e.type==='chifrudo'||e.type==='cervo2'||e.type==='carniceiro'))d=Math.min(d,hyp(e.x-P.x,e.y-P.y));
  for(const v of CB.vultos)d=Math.min(d,hyp(v.x-P.x,v.y-P.y)+150);
  // na luta o coração do próprio jogo (perigo/vida baixa) já bate: dois corações fora de tempo soavam como defeito
  if(d>620||cb2Fight()||G.heartT>-0.6&&(P.hp<P.max*.35||(G.fear||0)>.55))return; CB2.hb-=dt; if(CB2.hb>0)return; const k=d/620; CB2.hb=lerp(.42,1.15,k); AU.cbHeart(lerp(1.2,.45,k),lerp(1.15,.95,k));
}
(function(){
  const vt=v16Tick; v16Tick=function(dt){
    vt(dt);
    if(G.mode!=='play'||!cbOn())return;
    const F=cbF();
    cb2VoltaTick(dt);
    if(!inCb()){if(P.disf)cb2DisfOff(true);return;}
    if(F.cbDone&&F.cbVoltaZ&&!G.ev.cbVz&&!CUT.on)cb2VoltaState();
    if(F.cbNoite)G.ev.cbNoiteT=(G.ev.cbNoiteT||0)+dt;
    if(G.ev.cb2Respawn&&!CUT.on){G.ev.cb2Respawn=false;G.ev.cb2Spawn=0;}
    if(P.disf===undefined)P.disf=false;
    if(F.cbDisf&&!P.disf&&!F.cbBossOn&&!F.cbDone)cb2DisfOn();
    for(const e of enemies)if(e._l&&e.alive&&(e.vela||e.type==='cervo2'||e.type==='carniceiro')){e._l.x=e.x;e._l.y=e.y;}
    if(CUT.on){return;}
    // a ligação sobre o soldado: um pouco depois da luneta
    if(F.cbSt>=3&&!F.cbMilCall&&!G.scope){G.ev.cbMilT=(G.ev.cbMilT||0)+dt;if(G.ev.cbMilT>18&&!enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<500))return cb2MilCall();}
    if(F.cbMilCall&&!F.cbTGseen&&CBL.tg&&hyp(P.x-CBL.tg.x,P.y-CBL.tg.y)<150)return cb2TGArrive();
    {const B=buildings[CBL.frB];if(B&&!F.cbFrigSeen&&!F.cbFrigDone&&G.inB===CBL.frB&&cb2Inside(P.x,P.y,B))return cb2FrigEnter();}
    if(cb2MissaReady())return cb2MissaStart();
    cb2MissaTick(dt); cb2FrigTick(dt); cb2BodyTick(dt); cb2DisfTick(dt); cb2PregTick(dt); cb2FightTick(dt); cb2ValTick(dt); cb2Heart(dt);
    for(const t of CB2.tr)t.t-=dt; CB2.tr=CB2.tr.filter(t=>t.t>0);
  };
  // quem está de manto: os cultistas "não enxergam" (o motor acha que você está escondido)
  const ue=updEnemy; updEnemy=function(e,dt){
    if(e.type==='carniceiro')return cb2CarnAI(e,dt);
    if(e.type==='cervo2')return cb2C2AI(e,dt);
    if(e.cbMissa&&e.state!=='chase'){e.cbMissa.t+=dt;e.anim+=dt;const p=CBL.portal,dx=p.x-e.x,dy=p.y-e.y,d=hyp(dx,dy)||1;
      if(d<50||e.cbMissa.t>16||!CB2.missa&&!cbF().cbMissaOn){e.alive=false;if(e._l){e._l.off=true;e._l=null;}return;}
      if(e.type==='vig'){if(e.cbMissa.t>2.5){e.alive=false;if(e._l){e._l.off=true;e._l=null;}}return;}
      const hit=move(e,dx/d*40*dt,dy/d*40*dt,true);if(hit)e.cbMissa.st=(e.cbMissa.st||0)+dt;if(e.cbMissa.st>2.5){e.alive=false;if(e._l){e._l.off=true;e._l=null;}return;}e.face=Math.atan2(dy,dx);
      if(hyp(P.x-e.x,P.y-e.y)<(P.disf?40:lampOn()?150:80)&&los(e.x,e.y,P.x,P.y)){e.cbMissa=null;e.state='chase';e.lx=P.x;e.ly=P.y;}return;}
    if(P.disf&&!P.hidden&&cb2Types.includes(e.type)&&!e.irmao){P.hidden=CB2FAKE;try{return ue(e,dt);}finally{if(P.hidden===CB2FAKE)P.hidden=null;}}
    return ue(e,dt);
  };
  const fi=findInteract; findInteract=function(){
    const r=fi();
    try{const ex=cb2ExecTarget();if(ex&&(!r||r.k!=='gate'))return {k:'int',o:{type:'cbExec',e:ex,x:ex.x,y:ex.y,tx:(ex.x/TILE)|0,ty:(ex.y/TILE)|0}};}catch(e){}
    return r;};
  const pt=promptText; promptText=function(pr){
    if(pr&&pr.k==='int'&&pr.o&&pr.o.type==='cbCorpo'){const b=pr.o.body;return CB2.drag===b?'Soltar o corpo':(!P.disf&&b.manto)?'Vestir o manto do cultista':'Arrastar o corpo';}
    return pt(pr);};
  const vi=v12Interact; v12Interact=function(o){
    if(o.type==='cbExec')return cb2Exec(o.e);
    if(o.type==='cbCorpo')return cb2BodyUse(o.body);
    return vi(o);};
  const fr=fire; fire=function(){const c=P.cool,r=fr.apply(this,arguments);if(P.cool>c||P.cool>0)CB2.shotT=G.time;return r;};
  const op=STORY.onPickup; STORY.onPickup=function(id){if(op)op(id);if(id==='cbMaleta')later(200,cb2FrigStart);};
  // sem registro no meio da luta
  const di=doInteract; doInteract=function(){const pr=G.prompt;if(pr&&pr.k==='int'&&pr.o&&pr.o.type==='typewriter'&&(cb2Fight()||CB2.frig||cbF().cbMissaOn)&&inCb()){toast('Não dá tempo de escrever agora.');return;}return di.apply(this,arguments);};
  // carregar / começar de novo
  const aws=applyWorldState; applyWorldState=function(){aws();const F=G.flags;cb2Reset();CB2.btrail=[];
    if(F.cbFrigDone)for(const id of ['cbFrB','cbFrE']){const g=gates.find(x=>x.id===id);if(g&&g.open)closeGate(g);}
    if(F.cbF1Down)cb2BreakFacade();
    if(F.cbMissaOn&&!F.cbMissaDone){F.cbMissaOn=false;F.cbMissaDone=true;}
    if(F.cbF2&&!F.cbBoss){F.cbBossOn=true;F.cbBossSpawned=true;G.ev.cb2Respawn=true;G.ev.cb2Spawn=0;}
    G.ev.cbVz=0;};
  const rs=resetState; resetState=function(d){rs(d);cb2Reset();CB2.btrail=[];};
  CB2.btrail=[];
})();

// ===================== OBJETIVOS, MISSÕES, MAPA =====================
(function(){
  const ob=objective; objective=function(){
    const F=G.flags;
    try{if(F.cbCall&&!F.cbDone&&cbOn()&&inCb()&&!(typeof FB!=='undefined'&&FB.on)){
      if(CB2.frig&&!CB2.frig.end)return {t:'CORRA. Saia do frigorífico pela doca e bata as portas atrás de você',at:CBL.frigS};
      if(cb2Fight())return {t:'O Cervo desperto: faça ele investir contra as paredes das casas. Atordoado, ele leva o tiro do Nicolas'+(CB2.val?'. O Sargento Valença te cobre':''),at:null};
      if(F.cbPortal&&!F.cbBossOn&&!F.cbBoss)return {t:'O portal da Matriz está aberto. Entre na igreja',at:CBL.nave};
      if(F.cbBossOn&&!F.cbBoss)return ob();
      if(F.cbBoss)return ob();
      if(F.cbIrmao&&!F.cbPortal&&!cbHas('cbSeloCervo')){const sp=pickups.find(p=>p.uid==='cbSeloCervoP');if(sp)return {t:'Selo do Cervo: pegue o disco de osso que caiu do irmão do Nicolas',at:{x:sp.x,y:sp.y}};}
      const base=ob();
      if(F.cbMissaOn)return {t:'A missa da meia-noite: a cidade está quase vazia por alguns minutos. '+(base?base.t:''),at:base?base.at:null};
      if(F.cbSt>=3&&F.cbMilCall&&!F.cbMilOk&&!cbAllSeals()){
        if(!F.cbMilMet)return {t:'Ache o soldado ferido no Tiro de Guerra, no quarteirão entre a avenida e a rua do estádio',at:CBL.val};
        if(!cbHas('cbMaleta'))return {t:'Pegue a maleta de primeiros socorros do pelotão na câmara fria do frigorífico, perto do rio',at:pickups.some(p=>p.uid==='cbMaletaP')?CBL.maleta:CBL.frig};
        return {t:'Leve a maleta ao Sargento Valença, no Tiro de Guerra',at:CBL.val};}
      return base;}}catch(err){console.error(err);}
    return ob();};
  if(typeof misBody==='function'){const mb=misBody; misBody=function(){let s=mb();const F=G.flags;
    if(F.cbCall&&!F.cbDone){const it=(ok,t)=>`<li class="${ok?'ok':''}">${ok?'✓':'○'} ${t}</li>`;
      const nl=`<h3>Camboriú · a Congregação do Cervo</h3><ul class="chk">${it(F.cbSt>=3,'Encontrar o Nicolas no morro')}${it(F.cbMilOk,'Salvar o Sargento Valença (a maleta do frigorífico)')}${it(cbHas('cbSeloSino')||F.cbPortal,'Selo do Sino (torre da Matriz)')}${it(cbHas('cbSeloVela')||F.cbPortal,'Selo da Vela (porão da Casa do Pregador)')}${it(cbHas('cbSeloCervo')||F.cbPortal,'Selo do Cervo (o irmão do Nicolas, no estádio)')}${it(F.cbF1Down,'Derrubar o Cervo na Matriz')}${it(F.cbBoss,'Derrubar o Cervo desperto')}</ul>`;
      s=s.replace(/<h3>Camboriú · o portal da Matriz<\/h3><ul class="chk">[\s\S]*?<\/ul>/,nl);}
    return s;};}
  const cm=cbMapTo; cbMapTo=function(c){cm(c);try{const cx=c.getContext('2d'),w=W,h=HT-CBY,s=Math.min(c.width/w,c.height/h),ox=(c.width-w*s)/2,oy=(c.height-h*s)/2;
    cx.fillStyle='#ddd6c6';cx.font='700 11px sans-serif';cx.textAlign='left';cx.fillText('TIRO DE GUERRA',ox+60*s,oy+43*s);cx.fillText('FRIGORÍFICO',ox+121*s,oy+59*s);cx.fillText('CEMITÉRIO',ox+120*s,oy+9*s);
    if(cbF().cbMilCall&&!cbF().cbMilOk&&CBL.tg){cx.fillStyle='#e8d84a';cx.beginPath();cx.arc(ox+CBL.tg.x/TILE*s,oy+(CBL.tg.y/TILE-CBY)*s,4,0,6.283);cx.fill();}}catch(e){}};
})();

// ===================== A VOLTA A CAMBORIÚ (PERTO DO FIM DA HISTÓRIA) =====================
// Depois do Hospital Santa Clara, o drone do Nicolas passa por cima de Camboriú: sem o Cervo, os mortos subiram o morro.
function cb2VoltaTick(dt){
  const F=cbF();
  if(CB2.volta){for(const e of CB2.volta.z)if(e.alive){e.vis=true;e.va=1;}return;}
  if(!F.cbDone||F.cbVoltaCena||!F.hospOut||CUT.on||G.wave>0||G.heli||inCb()||(typeof MP!=='undefined'&&MP.on)||(typeof FB!=='undefined'&&FB.on))return;
  if(enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<600))return;
  G.ev.cbVoltaT=(G.ev.cbVoltaT||0)+dt; if(G.ev.cbVoltaT<25)return;
  F.cbVoltaCena=true; const c=CBL.coreto, V=CB2.volta={z:[]};
  const ls=[];
  playCut([{sfx:'static',v:1},
    {say:'nico',m:'s',radio:true,t:'Richard... tá me ouvindo? Eu mandei o drone pra Camboriú. Pra ver.'},
    {fx:'blackout',v:1.2},
    {do:()=>{for(const l of CB_LIGHTS){ls.push([l,l.off]);l.off=true;}for(const l of lights)if(l.ig){ls.push([l,l.off]);l.off=true;}
      for(let i=0;i<14;i++){const a=Math.random()*6.283,r=rr(60,380),e=makeEnemy(i%4===0?'corr':'zumbi',c.x+Math.cos(a)*r,c.y+Math.sin(a)*r*.6,null);e.cut=true;e.cb=1;e.face=Math.random()*6;e.walkTo={x:e.x+rr(-80,80),y:e.y+rr(-60,60),spd:22};enemies.push(e);V.z.push(e);CUT.actors['vz'+i]=e;}
      const f=lights.length;lights.push({x:c.x-tc(20),y:c.y-tc(8),r:260,c:'fire',f:1,cb:1,tmp114:1},{x:c.x+tc(25),y:c.y+tc(6),r:220,c:'fire',f:1,cb:1,tmp114:1});V.f=f;}},
    {cam:{x:c.x,y:c.y-tc(10)},t:0},{wait:1.2},
    {cam:{x:c.x,y:c.y},t:2.4},
    {say:'nico',m:'t',radio:true,t:'As velas apagaram. Todas. Não tem mais ninguém acendendo.'},
    {do:()=>{for(const e of V.z)if(Math.random()<.5)AU.groan&&AU.groan(null,.6);}},
    {say:'nico',m:'t',radio:true,t:'Eles subiram o morro, Richard. Os mortos. Tá cheio na praça. Dentro da igreja.'},
    {cam:{x:CBL.portal.x,y:CBL.portal.y},t:1.6},
    {say:'nico',m:'s',radio:true,t:'O Pregador tinha razão numa coisa. Aquele bicho segurava eles lá embaixo.'},
    {wait:.6},
    {say:'rafa',m:'t',radio:true,t:'E a gente fez o certo mesmo assim. Ele comia gente, Nicolas.'},
    {say:'nico',m:'n',radio:true,t:'Eu sei. Eu só queria que alguém visse antes de tudo acabar. Pronto. Agora tu viu.'},
    {fx:'blackout',v:1.2},
    {do:()=>{for(const e of V.z)e.alive=false;for(const [l,o] of ls)l.off=o;for(let i=lights.length-1;i>=0;i--)if(lights[i].tmp114)lights.splice(i,1);CB2.volta=null;F.cbVoltaZ=true;}},
    {camFree:true}],()=>{CB2.volta=null;});
}
// se você voltar lá depois: mortos na praça, velas apagadas, a congregação morta
function cb2VoltaState(){
  for(const l of CB_LIGHTS)l.off=true;
  for(const e of enemies)if(e.alive&&cb2Types.includes(e.type)){e.alive=false;GORE.push({k:'corpse',x:e.x,y:e.y,rot:Math.random()*6,type:'cult',col:'#2e2620',skin:'#c8a888',r:12,cb:1});}
  if(G.ev.cbVz)return; G.ev.cbVz=1;
  for(let i=0;i<14;i++){const s=cb2Pt(CBL.coreto.x+rr(-500,500),CBL.coreto.y+rr(-260,300));const e=makeEnemy(i%5===0?'corr':'zumbi',s.x,s.y,null);e.cb=1;enemies.push(e);}
}
(function(){const tr=cbTravel; cbTravel=function(toCb){const r=tr.apply(this,arguments);const F=cbF();
  if(toCb&&F.cbDone&&F.cbVoltaZ){later(1400,()=>{bark('rafa','t','As velas apagaram. Todas. E eles subiram mesmo.',{dur:2.4});});}
  return r;};})();

// ===================== DESENHO =====================
function cb2DrawCarn(e){
  const a=e.face,wk=e.anim*(CB2.frig?8:2),sw=Math.sin(wk)*6,rise=e.rise?Math.min(1,(e.rise+=lastDt||.016)/1.2):1;
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(a);const s=(e.r/20)*(.6+.4*rise);ctx.scale(s,s);
  ctx.fillStyle='rgba(0,0,0,.45)';ctx.beginPath();ctx.ellipse(2,4,30,24,0,0,6.283);ctx.fill();
  // pernas grossas e um avental imundo
  ctx.strokeStyle='#2a1612';ctx.lineWidth=8;ctx.lineCap='round';ctx.beginPath();ctx.moveTo(-6,-8);ctx.lineTo(-20+sw,-12);ctx.moveTo(-6,8);ctx.lineTo(-20-sw,12);ctx.stroke();
  ctx.fillStyle='#5a3a30';ctx.beginPath();ctx.ellipse(0,0,19,17,0,0,6.283);ctx.fill();
  ctx.fillStyle='#b8b0a0';ctx.beginPath();ctx.moveTo(6,-13);ctx.lineTo(14,-10);ctx.lineTo(14,10);ctx.lineTo(6,13);ctx.lineTo(-10,10);ctx.lineTo(-10,-10);ctx.closePath();ctx.fill();
  ctx.fillStyle='rgba(110,20,14,.8)';for(const [x,y,r] of [[4,-4,5],[-3,6,6],[9,3,3],[-6,-7,3]]){ctx.beginPath();ctx.arc(x,y,r,0,6.283);ctx.fill();}
  // ganchos enfiados nas costas
  ctx.strokeStyle='#8a8a86';ctx.lineWidth=1.6;for(const [x,y] of [[-12,-12],[-16,0],[-12,12],[-4,-16],[-4,16]]){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-8,y*1.3);ctx.quadraticCurveTo(x-12,y*1.3+4,x-8,y*1.3+6);ctx.stroke();}
  // braços compridos demais, cutelo
  const arm=e.hitAnim>0?12:0;
  ctx.strokeStyle='#4a2a22';ctx.lineWidth=6;ctx.beginPath();ctx.moveTo(4,-14);ctx.quadraticCurveTo(18,-28,34+arm,-20-sw*.3);ctx.moveTo(4,14);ctx.quadraticCurveTo(18,28,34+arm,20+sw*.3);ctx.stroke();
  ctx.fillStyle='#9a9a96';ctx.beginPath();ctx.moveTo(34+arm,16);ctx.lineTo(48+arm,14);ctx.lineTo(48+arm,26);ctx.lineTo(36+arm,26);ctx.closePath();ctx.fill();
  // a cabeça: sem pele, olhos brancos
  ctx.fillStyle='#8a4a3a';ctx.beginPath();ctx.ellipse(14,0,8,7,0,0,6.283);ctx.fill();
  ctx.fillStyle='#e8e0d0';ctx.fillRect(17,-3.5,2.4,2);ctx.fillRect(17,1.5,2.4,2);
  ctx.fillStyle='#2a0806';ctx.beginPath();ctx.ellipse(21,0,2.6,4,0,0,6.283);ctx.fill();
  ctx.restore();
}
function cb2DrawC2(e){
  // a mesma criatura, maior, com espinhos, a cabeça aberta e brasa no peito
  cbDrawCervo(e);
  const a=e.face,s=e.r/26;
  ctx.save();ctx.translate(e.x,e.y);ctx.rotate(a);ctx.scale(s,s);
  const g=ctx.createRadialGradient(0,0,2,0,0,16);g.addColorStop(0,`rgba(255,${90+Math.sin(renderT*8)*40|0},30,.9)`);g.addColorStop(1,'rgba(120,20,10,0)');ctx.fillStyle=g;ctx.beginPath();ctx.ellipse(0,0,14,13,0,0,6.283);ctx.fill();
  ctx.strokeStyle='rgba(255,120,60,.7)';ctx.lineWidth=1.2;for(let i=-8;i<=8;i+=4){ctx.beginPath();ctx.moveTo(i,-11);ctx.quadraticCurveTo(i+3,0,i,11);ctx.stroke();}
  ctx.strokeStyle='#1a0e08';ctx.lineWidth=2.2;for(const sd of [-1,1])for(let i=0;i<6;i++){const ax=-10+i*4,ay=sd*(12+((i*5)%4));ctx.beginPath();ctx.moveTo(ax,ay);ctx.lineTo(ax-3,ay+sd*9);ctx.stroke();}
  ctx.strokeStyle='#2a1a10';cbAntler(ctx,12,-5,-1.7,46,3,1);cbAntler(ctx,12,5,1.7,46,3,-1);
  ctx.fillStyle='#2a0806';ctx.beginPath();ctx.moveTo(24,-3);ctx.lineTo(36,-8);ctx.lineTo(34,0);ctx.lineTo(36,8);ctx.lineTo(24,3);ctx.closePath();ctx.fill();
  ctx.fillStyle='#d8ccb0';for(let i=0;i<4;i++){ctx.beginPath();ctx.moveTo(26+i*2.6,-4+i*.4);ctx.lineTo(27+i*2.6,-1);ctx.lineTo(28+i*2.6,-4+i*.4);ctx.fill();ctx.beginPath();ctx.moveTo(26+i*2.6,4-i*.4);ctx.lineTo(27+i*2.6,1);ctx.lineTo(28+i*2.6,4-i*.4);ctx.fill();}
  ctx.fillStyle=e.mode==='tele'||e.mode==='charge'?'#ff3a10':'#ff8a30';ctx.beginPath();ctx.arc(15,-3.6,2,0,6.283);ctx.arc(15,3.6,2,0,6.283);ctx.fill();
  if(e.mode==='smash'){ctx.strokeStyle=`rgba(255,80,40,${.4+Math.sin(renderT*30)*.3})`;ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,150/s*.6,0,6.283);ctx.stroke();}
  if(e.mode==='howl'){ctx.strokeStyle='rgba(220,200,180,.35)';ctx.lineWidth=2;for(let k=1;k<=3;k++){ctx.beginPath();ctx.arc(30,0,10+k*10+(renderT*40%10),-.6,.6);ctx.stroke();}}
  ctx.restore();
  if(Math.random()<.4)parts.push({k:'fire',x:e.x+rr(-e.r*.5,e.r*.5),y:e.y+rr(-e.r*.5,e.r*.5),vx:rr(-10,10),vy:rr(-40,-10),life:.5,max:.5,s:rr(2,4),c:'#ff6a20'});
}
(function(){
  const dc=cbDrawCervo; cbDrawCervo=function(e){
    const M=CB2.morph; if(!(M&&M.e===e&&M.on)){return dc(e);}
    M.t+=lastDt||.016; const k=Math.min(1,M.t/7), r0=e.r; e.r=r0*(1+k*.45);
    dc(e); e.r=r0;
    const s=e.r*(1+k*.45)/26; ctx.save();ctx.translate(e.x+Math.sin(renderT*40)*k*2,e.y);ctx.rotate(e.face);ctx.scale(s,s);
    ctx.strokeStyle=`rgba(255,90,40,${.4+.5*k})`;ctx.lineWidth=1.4;for(let i=0;i<10*k;i++){const a=i*1.7;ctx.beginPath();ctx.moveTo(Math.cos(a)*4,Math.sin(a)*4);ctx.lineTo(Math.cos(a+.3)*14,Math.sin(a+.3)*13);ctx.stroke();}
    ctx.strokeStyle='#1a0e08';cbAntler(ctx,12,-5,-1.8,34+k*16,3,1);cbAntler(ctx,12,5,1.8,34+k*16,3,-1);
    if(k>.5){ctx.fillStyle='#2a0806';ctx.beginPath();ctx.moveTo(24,-2);ctx.lineTo(24+12*k,-6*k);ctx.lineTo(24+10*k,0);ctx.lineTo(24+12*k,6*k);ctx.lineTo(24,2);ctx.closePath();ctx.fill();}
    ctx.restore();};
  const de=drawEnemy; drawEnemy=function(e){
    if(e&&(e.type==='carniceiro'||e.type==='cervo2')){const va=e.va??1;if(va<=.01)return;ctx.save();ctx.globalAlpha=va;
      if(e.type==='carniceiro')cb2DrawCarn(e);else cb2DrawC2(e);
      if(e.flash>0){ctx.globalAlpha=.4;ctx.fillStyle='#fff';ctx.beginPath();ctx.arc(e.x,e.y,e.r,0,6.283);ctx.fill();}ctx.restore();return;}
    if(e&&e.vela&&e.alive){const r=de(e);ctx.save();ctx.fillStyle='rgba(255,200,110,.35)';ctx.beginPath();ctx.arc(e.x+Math.cos(e.face||0)*10,e.y+Math.sin(e.face||0)*10,8,0,6.283);ctx.fill();ctx.fillStyle='#ffe0a0';ctx.beginPath();ctx.arc(e.x+Math.cos(e.face||0)*10,e.y+Math.sin(e.face||0)*10,1.8,0,6.283);ctx.fill();ctx.restore();return r;}
    return de(e);};
  const dp=drawParts; drawParts=function(){dp();try{cb2DrawWorld();}catch(err){}};
})();
function cb2DrawWorld(){
  if(!cbOn()||P.y<(CBY-30)*TILE&&!CUT.on)return;
  const vx0=cam.x-80,vy0=cam.y-80,vx1=cam.x+view.w/view.z+80,vy1=cam.y+view.h/view.z+80, iv=(x,y)=>x>vx0&&x<vx1&&y>vy0&&y<vy1;
  for(const d of CBD){if(!iv(d.x,d.y))continue;
    if(d.k==='lapide'){ctx.save();ctx.translate(d.x,d.y);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-7,2,15,6);ctx.fillStyle=d.v===3?'#7a7468':'#9a948a';
      if(d.v===0){ctx.fillRect(-1.5,-12,3,16);ctx.fillRect(-6,-7,12,3);}else{ctx.beginPath();ctx.moveTo(-6,4);ctx.lineTo(-6,-6);ctx.quadraticCurveTo(0,-13,6,-6);ctx.lineTo(6,4);ctx.closePath();ctx.fill();ctx.fillStyle='rgba(0,0,0,.25)';ctx.fillRect(-3,-4,6,1);ctx.fillRect(-3,-1,6,1);}
      ctx.restore();}
    else if(d.k==='cova'){ctx.save();ctx.translate(d.x,d.y);ctx.fillStyle='#3a2a1a';ctx.fillRect(-18,-10,36,20);ctx.fillStyle='#050403';ctx.fillRect(-14,-7,28,14);ctx.fillStyle='#5a4a30';for(let i=0;i<5;i++){ctx.beginPath();ctx.arc(20+i*2,-8+i*4,3,0,6.283);ctx.fill();}ctx.restore();}
    else if(d.k==='gelo'){if(Math.random()<.004)parts.push({k:'smoke',x:d.x+rr(-12,12),y:d.y+rr(-12,12),vx:rr(-8,8),vy:rr(-6,6),life:2.4,max:2.4,s:rr(8,14),c:d.cam?'#a8b8c8':'#8a96a0'});}
    else if(d.k==='carcaca'){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.rot);ctx.fillStyle='rgba(20,8,4,.85)';ctx.beginPath();ctx.ellipse(0,0,46,32,0,0,6.283);ctx.fill();ctx.strokeStyle='#c8bca0';ctx.lineWidth=2;for(let i=-24;i<=20;i+=7){ctx.beginPath();ctx.moveTo(i,-24);ctx.quadraticCurveTo(i+6,0,i,24);ctx.stroke();}
      ctx.strokeStyle='#2a1a10';cbAntler(ctx,30,-6,-1.6,50,3,1);cbAntler(ctx,30,6,1.6,50,3,-1);ctx.fillStyle='#d8ccb0';ctx.beginPath();ctx.ellipse(36,0,12,7,0,0,6.283);ctx.fill();ctx.restore();}
    else if(d.k==='vela'&&d.apagada){ctx.save();ctx.translate(d.x,d.y);ctx.fillStyle='#bab09a';ctx.fillRect(-1.5,-6,3,6);ctx.strokeStyle='#222';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(0,-6);ctx.lineTo(1,-9);ctx.stroke();ctx.restore();}
  }
  // corpo sendo arrastado: rastro
  if(CB2.drag){const b=CB2.drag;ctx.strokeStyle='rgba(120,20,16,.35)';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(P.x,P.y);ctx.lineTo(b.x,b.y);ctx.stroke();}
  // corpos que ainda não acharam: um brilho fraco para lembrar
  for(const b of CB2.bodies){if(b.found||!iv(b.x,b.y)||hyp(b.x-P.x,b.y-P.y)>260)continue;ctx.strokeStyle=cb2BodyHidden(b)?'rgba(120,180,120,.25)':'rgba(220,170,90,.3)';ctx.lineWidth=1;ctx.setLineDash([3,4]);ctx.beginPath();ctx.arc(b.x,b.y,16,0,6.283);ctx.stroke();ctx.setLineDash([]);}
  // o Sargento Valença
  const V=CB2.val; if(V&&iv(V.x,V.y))drawHuman(V.x,V.y,V.ang,{coat:'#4a5232',skin:'#c08a68',hair:'#141210',pants:'#3a3e2a',look:'valenca',wid:'smg',loaded:true,walk:V.walk||0,moving:!!V.moving,legAng:V.ang});
  // rastros de tiro dos aliados
  for(const t of CB2.tr){ctx.strokeStyle=`rgba(${t.c},${Math.min(1,t.t*10)})`;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(t.x0,t.y0);ctx.lineTo(t.x1,t.y1);ctx.stroke();}
}
// o manto não aparece no lugar errado (capítulo da Sonia, flashback, online)
{const dpl=drawPlayer; drawPlayer=function(){if(P.disf&&!inCb()){cb2DisfOff(true);}return dpl.apply(this,arguments);};}

// ===================== ONLINE: AVISO QUANDO AS VERSÕES SÃO DIFERENTES =====================
(function(){
  if(typeof mpSend!=='function'||typeof mpRecv!=='function')return;
  const ms=mpSend; mpSend=function(m,to,except){
    try{if(m&&m.t==='hello'&&m.c)m={...m,c:{...m.c,v:GAME_VER}};
      if(m&&m.t==='lobby'&&m.l&&m.l['0'])m={...m,l:{...m.l,'0':{...m.l['0'],v:GAME_VER}}};}catch(e){}
    return ms.call(this,m,to,except);};
  const warn=(v,quem)=>{const t=v?`Atenção: ${quem} está na versão ${v} e você na ${GAME_VER}. Pode dar problema: atualizem o jogo os dois.`:`Atenção: ${quem} está numa versão antiga do jogo (anterior à 1.14). Pode dar problema: atualizem o jogo.`;
    toast(t);G.banner={t:'Versões diferentes do jogo',life:4};MP.verWarn=t;};
  const mr=mpRecv; mpRecv=function(m,p){
    try{if(MP.role==='host'&&m&&m.t==='hello'&&m.c&&m.c.v!==GAME_VER)warn(m.c.v,m.c.apelido||m.c.nome||'um jogador');
      if(MP.role==='guest'&&m&&m.t==='lobby'&&m.l&&m.l['0']&&!MP.verWarned){MP.verWarned=true;if(m.l['0'].v!==GAME_VER)warn(m.l['0'].v,'quem criou a sala');}
      if(m&&m.t==='vwarn'&&m.v!==GAME_VER)warn(m.v,'quem criou a sala');}catch(e){}
    const r=mr.apply(this,arguments);
    try{if(MP.role==='host'&&m&&m.t==='hello'&&m.c&&m.c.v!==GAME_VER)ms({t:'vwarn',v:GAME_VER},p);}catch(e){}
    return r;};
})();

// ===================== INTENSIDADE DO TERROR =====================
OPT.terror=(()=>{try{const v=localStorage.getItem('ps-terror');return ['menos','normal','mais'].includes(v)?v:'normal';}catch(e){return 'normal';}})();
function terrorK(){return OPT.terror==='menos'?.5:OPT.terror==='mais'?-.6:0;}
{const vt=v16Tick; v16Tick=function(dt){vt(dt);const k=terrorK();if(!k||G.mode!=='play'||!dt)return;const x=dt*k;
  if(SND.amb&&SND.amb.next!=null)SND.amb.next+=x; if(typeof CB!=='undefined'&&CB.evT!=null)CB.evT+=x;
  if(G.ev){if(G.ev.fkT!=null)G.ev.fkT+=x;if(G.ev.ofT!=null)G.ev.ofT+=x;}};}
{const op=UI.opts.bind(UI); UI.opts=function(from){const r=op(from);try{const box=OV.querySelector('.opts');if(box&&!box.querySelector('.terbox')){const d=document.createElement('div');d.className='opt terbox';
  const b=(k,t)=>`<button data-a="ter114" data-k="${k}" class="${OPT.terror===k?'on':''}">${t}</button>`;
  d.innerHTML=`<h3>Intensidade do terror</h3><div class="seg">${b('menos','Menos sustos')}${b('normal','Normal')}${b('mais','Mais sustos')}</div><p class="hint">Muda quantas vezes acontecem os barulhos ao longe, os sustos e os eventos da cidade. A história é a mesma.</p>`+(IN.touch?`<div class="seg"><button data-a="guia114">Ver o guia dos controles</button></div>`:'');box.appendChild(d);}}catch(e){}return r;};}
{const ua=UI.act.bind(UI); UI.act=function(a,ds){
  if(a==='ter114'){OPT.terror=ds&&ds.k||'normal';try{localStorage.setItem('ps-terror',OPT.terror);}catch(e){}return this.opts(this.optsFrom);}
  if(a==='guia114'){if(this.close)this.close();G.mode='play';return guia114(true);}
  return ua(a,ds);};}

// ===================== GUIA DOS CONTROLES NO CELULAR =====================
function guia114(force){
  if(!IN.touch||typeof document==='undefined'||!document.body)return;
  if(!force){try{if(localStorage.getItem('ps-guia114'))return;}catch(e){}}
  try{localStorage.setItem('ps-guia114','1');}catch(e){}
  if(document.getElementById('guia114'))return;
  const L=[['tb-rel','Recarregar'],['tb-wpn','Trocar de arma'],['tb-gren','Arremessar (granada, garrafa)'],['tb-dodge','Esquivar'],['tb-heal','Curar'],['tb-crouch','Agachar (silêncio)'],['tb-lamp','Lanterna'],['tb-inv','Mochila, mapa e missões'],['tb-pause','Pausa e opções']];
  const C=stickCenters(), d=document.createElement('div'); d.id='guia114';
  d.style.cssText='position:fixed;inset:0;z-index:60;background:rgba(6,6,5,.78);color:#e8e0c8;font:600 13px "Special Elite",monospace;touch-action:none';
  const badge=(x,y,t)=>`<div style="position:absolute;left:${Math.round(x)}px;top:${Math.round(y)}px;transform:translate(-50%,-50%);width:24px;height:24px;border-radius:50%;background:#9c241b;color:#e9e1cc;font:700 13px sans-serif;display:flex;align-items:center;justify-content:center;border:2px solid #e9e1cc">${t}</div>`;
  const leg=[];let h=badge(C.move.x,C.move.y,'A')+badge(C.aim.x,C.aim.y,'B');
  leg.push(['A','Arraste para andar (até a borda corre)'],['B','Arraste para mirar (longe do centro atira)']);
  let n=1;for(const [id,t] of L){const el=document.getElementById(id);if(!el||el.hidden||!el.getBoundingClientRect)continue;const r=el.getBoundingClientRect();if(!r.width)continue;
    h+=`<div style="position:absolute;left:${r.left-3}px;top:${r.top-3}px;width:${r.width+6}px;height:${r.height+6}px;border:2px dashed #d8c78f;border-radius:50%"></div>`+badge(r.left+r.width-4,r.top+4,n);leg.push([n,t]);n++;}
  h+=`<div style="position:absolute;left:50%;top:50%;transform:translate(-50%,-62%);width:min(86vw,420px);background:#e9e1cc;color:#231d16;padding:14px 16px;border-left:4px solid #9c241b"><div style="font-size:19px;letter-spacing:.05em;margin-bottom:8px">GUIA DOS CONTROLES</div>`+
    leg.map(([k,t])=>`<div style="display:flex;gap:8px;margin:3px 0;font-size:13px"><b style="min-width:20px;color:#9c241b">${k}</b><span>${t}</span></div>`).join('')+
    `<div style="margin-top:8px;font-size:12px">O botão USAR aparece no meio da tela quando tem algo para pegar, abrir ou falar. Dá para mudar os botões de lugar em Opções.</div><div style="margin-top:10px;display:inline-block;border:2px solid #9c241b;padding:5px 12px">Toque para fechar</div></div>`;
  d.innerHTML=h; G.guia=true;
  const close=ev=>{if(ev){ev.preventDefault&&ev.preventDefault();ev.stopPropagation&&ev.stopPropagation();}G.guia=false;if(d.remove)d.remove();else if(d.parentNode)d.parentNode.removeChild(d);};
  d.addEventListener('touchstart',close,{passive:false});d.addEventListener('click',close);
  document.body.appendChild(d);
}
{const up=update; update=function(dt){if(G.guia)return;return up.apply(this,arguments);};}
{const vt=v16Tick; v16Tick=function(dt){vt(dt);if(IN.touch&&G.mode==='play'&&!CUT.on&&!G.guiaChk&&G.time>2){G.guiaChk=true;guia114(false);}};}

// ===================== MENU DE TESTE =====================
dbgExtra('1.14 · Camboriú 2.0',[['cb2:mil','Ir até o Sargento Valença (Tiro de Guerra)'],['cb2:frig','Ir para a maleta do frigorífico (começa a fuga)'],['cb2:frigfim','Terminar a fuga do frigorífico'],['cb2:valok','Sargento Valença salvo'],
  ['cb2:disf','Vestir o manto (disfarce)'],['cb2:exec','Cultista de costas na sua frente (matar em silêncio)'],['cb2:missa','Começar a missa da meia-noite'],['cb2:preg','Aparição do Pregador'],['cb2:cemit','Ir para o cemitério'],
  ['cb2:trans','Transformação do Cervo (fim da forma 1)'],['cb2:f2','Começar a luta do Cervo desperto (na praça)'],['cb2:f2fim','Derrubar o Cervo desperto (final)'],['cb2:volta','Cena da volta a Camboriú (drone)'],['cb2:som','Tocar os sons demoníacos'],['cb2:guia','Guia dos controles do celular']],
  function(k){
    const F=G.flags, close=()=>{if(UI.close)UI.close();G.mode='play';};
    const nico=()=>{if(!inCb()||!F.cbCall)UI.dbgAct('cb:ir',{});F.cbProc=true;F.cbSt=Math.max(F.cbSt||0,3);F.nicoMet=true;F.droneSeen=true;F.cbMilCall=true;F.cbTGseen=true;for(const e of enemies)if(e.alive&&['cbv1','cbv2','cbv3'].includes(e.uid))killEnemy(e);};
    const chefe=()=>{nico();F.cbMilOk=F.cbMilMet=F.cbMilAsk=true;F.cbIrmaoQuest=F.cbIrmao=true;F.cbPortal=true;{const g=gates.find(x=>x.id==='cbPortal');if(g&&!g.open)openGate(g);}};
    switch(k){
      case 'cb2:mil':nico();close();return cbGo({x:CBL.val.x-tc(3),y:CBL.val.y});
      case 'cb2:frig':nico();F.cbMilMet=F.cbMilAsk=true;F.cbFrigSeen=true;close();cbGo({x:CBL.maleta.x-tc(2),y:CBL.maleta.y});return;
      case 'cb2:frigfim':if(CB2.frig){cbGo({x:CBL.frigS.x,y:CBL.frigS.y+tc(1)});P.y+=tc(3);}close();return cb2FrigEnd();
      case 'cb2:valok':nico();F.cbMilMet=F.cbMilAsk=F.cbMilOk=true;F.cbFrigDone=true;close();return toast('Sargento Valença salvo.');
      case 'cb2:disf':if(!inCb())nico();close();return cb2DisfOn();
      case 'cb2:exec':{if(!inCb())nico();close();const a=P.ang,e=makeEnemy('cult',P.x+Math.cos(a)*36,P.y+Math.sin(a)*36,null);e.cb=1;e.face=a;e.state='wander';e.cbHold=30;enemies.push(e);return toast('Chegue perto e use E.');}
      case 'cb2:missa':nico();F.cbNoite=true;cbApplyNight();G.ev.cbNoiteT=999;F.cbMissaOn=F.cbMissaDone=false;close();return cb2MissaStart();
      case 'cb2:preg':{if(!inCb())nico();close();const A=CB_PREG[1];F['cbPA_a2']=false;const x=P.x+Math.cos(P.ang)*300,y=P.y+Math.sin(P.ang)*300,p=cb2Pt(x,y);const n={id:'cbPregApp',name:'O Pregador',x:p.x,y:p.y,ang:0,...LOOKS.pregador,col:'#e0dace',busy:true};npcs.push(n);CB2.preg={n,t:0,def:A,l:{x:n.x,y:n.y,r:170,c:'fire',f:1,cb:1}};lights.push(CB2.preg.l);return;}
      case 'cb2:cemit':nico();close();return cbGo({x:CBL.cemit.x-tc(8),y:CBL.cemit.y});
      case 'cb2:trans':{chefe();close();cbGo(CBL.nave);F.cbBossOn=true;F.cbBossSpawned=true;cbBossStart();CUT.pending.push([[{wait:.1}],()=>{const e=enemies.find(x=>x.alive&&x.type==='chifrudo');if(e)hurtEnemy(e,99999,0,0,{});}]);return;}
      case 'cb2:f2':chefe();F.cbF1Down=true;cb2BreakFacade();F.cbBossOn=true;F.cbBossSpawned=true;F.cbF2=true;G.ev.cb2Spawn=0;close();cbGo({x:CBL.coreto.x,y:CBL.coreto.y+tc(6)});return;
      case 'cb2:f2fim':{close();const e=cb2Boss();if(e)return hurtEnemy(e,99999,0,0,{});return toast('A luta do Cervo desperto não começou.');}
      case 'cb2:volta':F.cbCall=F.cbDone=true;F.hospOut=true;F.cbVoltaCena=false;G.ev.cbVoltaT=99;close();if(inCb())cbGo(LM.cbIrV);return;
      case 'cb2:som':close();AU.cbRoar2(P.x+200,P.y,1);later(3400,()=>AU.cbRev(1));later(7600,()=>AU.cbShriek(P.x-200,P.y,1));later(9400,()=>AU.cbCrack(P.x,P.y,1));later(11200,()=>AU.cbHook(P.x,P.y,1));later(13800,()=>AU.cbWhisp(null,null,1));for(let i=0;i<6;i++)later(16000+i*700,()=>AU.cbHeart(1,1));return;
      case 'cb2:guia':close();return guia114(true);
    }
  });
