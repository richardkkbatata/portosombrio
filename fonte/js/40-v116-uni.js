// ===================== 1.16 · UNIVERSIDADE DE BC MENOR E COM MAIS COISA =====================
// O campus era grande e vazio, e a história fazia você atravessar ele inteiro duas vezes: do túnel
// (leste) até a guarita do Seu Ademir (sudoeste) e de volta até a biblioteca (leste).
// - O Seu Ademir agora fica na guarita da entrada de veículos, do lado da biblioteca do 6A.
// - O gramado do norte e do nordeste virou mata fechada e área isolada pela Defesa Civil: o campus
//   ficou mais apertado, com menos chão vazio (os prédios e as missões continuam no mesmo lugar).
// - Missão nova: a Bruna, de Biomedicina, presa na câmara fria do Bloco 5 (Laboratórios). Ela chama
//   pelo interfone do campus; a senha da câmara está na lista de ramais da Secretaria (Bloco 3).
// - Alto-falantes do campus repetindo o aviso de evacuação.

const UNI={CX:12,get CY(){return ZY+18;}};
Object.assign(ITEMS,{});
PCH.bruna={name:'Bruna',skin:'#d8a888',shade:'#a87a5e',hair:'#3a2418',iris:'#3a2a1a',bg:['#16242a','#04080a'],glow:'150,200,210',voice:215};
const DOC116=DOCS.length;
DOCS.push(
  {t:'Lista de ramais da Secretaria',b:`UNIVERSIDADE DE BC · CAMPUS BALNEÁRIO CAMBORIÚ\nRAMAIS INTERNOS\n\nSecretaria Acadêmica .......... 2101\nBiblioteca (6A) ................. 2160\nCantina Bloco 6 ............... 2166\nLaboratórios (Bloco 5) ........ 2150\n   câmara fria (senha da porta): 0451 — NÃO PASSAR PARA ALUNO\nGuarita veículos ................ 2199\n\nCaneta vermelha, embaixo: "a menina da biomedicina ficou trancada lá. ninguém foi buscar."`},
  {t:'Aviso de evacuação (transcrição)',b:`Alto-falante do campus, repetindo a cada dois minutos:\n\n"Atenção, alunos, professores e funcionários. Por determinação da Defesa Civil, o campus está sendo evacuado. Dirijam-se com calma ao estacionamento sul. Não retornem às salas. Não tentem ajudar pessoas feridas. Repetindo..."\n\nNinguém desligou. O estacionamento sul está cheio de carros com as portas abertas.`},
);
Object.assign(INT_LABEL,{uniInterfone:'Interfone do campus'});
if(typeof ACH!=='undefined')ACH.push({id:'uniBruna',n:'Senha 0451',d:'Tire a Bruna da câmara fria do Bloco 5.'});

function uniGen(){
  const CX=UNI.CX, CY=UNI.CY, old=rnd; rnd=mulberry32(11617);
  // ---- a guarita nova: entrada de veículos, do lado da biblioteca ----
  {const g=building(CX+117,CY+85,7,5,{floor:T.TILEF,roof:'#4a8a5a',name:'Guarita · Entrada de veículos',doors:[['S',2,2],['W',2,1]],kind:'guarita'});
    const n=npcs.find(x=>x.id==='ademir'); LM.uniGuaritaVelha=LM.uniGuarita; LM.uniGuarita={x:tc(CX+120),y:tc(CY+87)};
    if(n){n.x=LM.uniGuarita.x;n.y=LM.uniGuarita.y;}
    lights.push({x:LM.uniGuarita.x,y:LM.uniGuarita.y,r:110,c:'lamp',f:1});}
  // ---- a câmara fria do Bloco 5 (laboratórios) ----
  {setT(CX+8,CY+76,T.WALL);setT(CX+8,CY+77,T.WALL);
    addGate('uniLab',CX+3,CY+71,2,1,null,'#8a9aa0','Porta da câmara fria','Porta de aço com um teclado de quatro números. Tem alguém batendo do outro lado.',T.TILEF);
    LM.uniLab={x:tc(CX+4),y:tc(CY+69)}; LM.uniLabIn={x:tc(CX+4),y:tc(CY+79)};
    npcs.push({id:'bruna',name:'Bruna',x:LM.uniLabIn.x,y:LM.uniLabIn.y,ang:-Math.PI/2,col:'#e8e6e0',hair:'#3a2418',skin:'#d8a888',crouch:true,cond:()=>!G.flags.brunaOk});
    for(const [x,y] of [[CX+5,CY+64],[CX+3,CY+67]])initEnemies.push({uid:'ulab'+x+'_'+y,type:'zumbi',x:tc(x),y:tc(y),col:UNI_COL,dorm:true});
    lights.push({x:LM.uniLabIn.x,y:LM.uniLabIn.y,r:70,c:'lamp',f:1});
    addPick(CX+5,CY+82,'adren',1);addPick(CX+2,CY+80,'cart',4);}
  // a lista de ramais na Secretaria (Bloco 3) e o aviso de evacuação
  if(LM.bloco3){const [x,y]=freeTileNear(((LM.bloco3.x/TILE)|0)+2,((LM.bloco3.y/TILE)|0)+1,false);pickups.push({uid:'uniRamais',tx:x,ty:y,x:tc(x),y:tc(y),id:DOC116,q:1,kind:'file'});pickOcc.add(idx(x,y));}
  {const [x,y]=freeTileNear(CX+64,CY+56,false);pickups.push({uid:'uniAviso',tx:x,ty:y,x:tc(x),y:tc(y),id:DOC116+1,q:1,kind:'file'});pickOcc.add(idx(x,y));}
  // interfone na parede do Bloco 2 (perto da praça)
  {const it=addInteract(CX+70,CY+43,'uniInterfone',22);LM.uniInterfone={x:it.x,y:it.y-36};}
  // ---- o campus fica mais apertado: mata fechada e área isolada no norte ----
  const keep=(x,y)=>{const px=tc(x),py=tc(y);
    for(const p of pickups)if(Math.abs(p.tx-x)<=3&&Math.abs(p.ty-y)<=3)return true;
    for(const n of npcs)if(hyp(n.x-px,n.y-py)<110)return true;
    for(const i of interacts)if(Math.abs(i.tx-x)<=3&&Math.abs(i.ty-y)<=3)return true;
    for(const g of gates)if(x>=g.x-3&&x<=g.x+g.w+2&&y>=g.y-3&&y<=g.y+g.h+2)return true;
    for(const k in LM){const L=LM[k];if(L&&L.x!=null&&hyp(L.x-px,L.y-py)<110)return true;}
    for(const b of buildings){if(!b.doorT)continue;for(const d of b.doorT)if(Math.abs(d.x-x)<=2&&Math.abs(d.y-y)<=2)return true;}
    return false;};
  const block=(x0,y0,x1,y1)=>{for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){if(!inb(x,y))continue;const k=idx(x,y);if(bmap[k]>=0)continue;const t=map[k];
      if(t!==T.GRASS&&t!==T.SIDE&&t!==T.CONC&&t!==T.TREE)continue;if(keep(x,y))continue;setT(x,y,R()<.18?T.TREE:T.FOREST);}};
  block(CX+28,CY+0,CX+33,CY+19); block(CX+60,CY+0,CX+93,CY+16); block(CX+95,CY+0,CX+127,CY+19);
  // a cerca da Defesa Civil marcando o fim da área aberta
  for(let x=CX+60;x<=CX+127;x++){const y=x<=CX+93?CY+17:CY+20,k=idx(x,y);if(bmap[k]<0&&!SOLID[map[k]]&&!keep(x,y))setT(x,y,T.FENCE);}
  graf(CX+76,CY+19,'ÁREA ISOLADA · DEFESA CIVIL',{rot:0,c:'#d8c050'});
  rnd=old;
}
function uniFix(){
  const y0=ZY,y1=HZO-1;
  // alcance da região refeito do zero
  for(let y=y0;y<=y1;y++)for(let x=0;x<W;x++)reach[idx(x,y)]=0;
  zoneReach(); if(typeof cbReach==='function'){/* Camboriú tem o próprio alcance, fica como está */}
  {const k=idx(7,273);reach[k]=1;}
  if(LM.cbIr){const k=idx((LM.cbIr.x/TILE)|0,(LM.cbIr.y/TILE)|0);reach[k]=1;}
  // o que ficou dentro da mata vai para o chão livre mais perto
  for(const p of pickups){if(p.ty<y0||p.ty>y1)continue;const k=idx(p.tx,p.ty);if(!SOLID[map[k]]&&reach[k])continue;pickOcc.delete(k);const [x,y]=freeTileNear(p.tx,p.ty,true);p.tx=x;p.ty=y;p.x=tc(x);p.y=tc(y);pickOcc.add(idx(x,y));}
  for(let i=initEnemies.length-1;i>=0;i--){const e=initEnemies[i],tx=(e.x/TILE)|0,ty=(e.y/TILE)|0;if(ty<y0||ty>y1)continue;const k=idx(tx,ty);if(SOLID[map[k]]||!reach[k])initEnemies.splice(i,1);}
  if(typeof invalidateRect==='function')invalidateRect(0,y0,W,y1-y0+1);
}
(function(){const g=genV12; genV12=function(){g();try{uniGen();uniFix();}catch(e){console.error('universidade 1.16',e);}};})();

// ---------- a Bruna ----------
LOCKS.uniLab={n:4,code:'0451',kick:'Bloco 5 · Laboratórios',t:'Câmara fria do laboratório',hint:'Quatro números. Talvez na lista de ramais da Secretaria.',
  open(){const g=gates.find(x=>x.id==='uniLab');if(g&&!g.open){openGate(g);G.flags.uniLab=true;AU.unlock();toast('A trava abriu com um estalo. Ar gelado no rosto.');later(500,uniBrunaFree);}}};
{const ug=useGate; useGate=function(g){if(g&&g.id==='uniLab'&&!g.open){if(!G.flags.uniLabSeen){G.flags.uniLabSeen=true;later(300,()=>bark('rafa','s','Tem alguém batendo do outro lado. Gente viva.'));}UI.code='';return UI.keypad('uniLab');}return ug(g);};}
function uniCampus(){const CX=UNI.CX,CY=UNI.CY,tx=(P.x/TILE)|0,ty=(P.y/TILE)|0;return inZone()&&tx>=CX-2&&tx<=CX+130&&ty>=CY-2&&ty<=CY+92&&!(typeof inCb==='function'&&inCb());}
function uniBrunaCall(){
  const F=G.flags; if(F.brunaCall)return; F.brunaCall=true;
  playCut([{sfx:'static',v:1},
    {say:'bruna',m:'s',radio:true,t:'...alguém? Alguém tá ouvindo esse interfone? Por favor...'},
    {say:'rafa',m:'s',t:'Tem alguém falando no alto-falante.'},
    {say:'bruna',m:'t',radio:true,t:'Meu nome é Bruna, eu sou da Biomedicina. Eu tô na câmara fria do laboratório, no Bloco 5. Eu me tranquei aqui de tarde.'},
    {say:'bruna',m:'t',radio:true,t:'Tem dois deles do lado de fora da porta. Eu ouço eles respirando. Eu não sinto mais os pés.'},
    {say:'bruna',m:'s',radio:true,t:'A senha da porta tá na lista de ramais da secretaria, no Bloco 3. Por favor. Por favor, não me deixa aqui.'},
    {sfx:'static',v:.6}],()=>{toast('Missão nova (opcional): a Bruna, na câmara fria do Bloco 5.');});
}
function uniBrunaFree(){
  const F=G.flags; if(F.brunaOk)return;
  const n=npcs.find(x=>x.id==='bruna'); if(!n){F.brunaOk=true;return;}
  playCut([{npc:n,id:'bruna'},{cam:n,t:.8},{startle:'bruna'},
    {say:'bruna',m:'s',t:'Não! Não... tu é gente. Tu é gente de verdade.'},
    {say:'rafa',m:'n',t:'Richard. Calma. Tu consegue andar?'},
    {say:'bruna',m:'t',t:'Mais ou menos. Eu tô congelando. Eu fiquei seis horas ouvindo eles arranharem essa porta.'},
    {say:'bruna',m:'n',t:'Toma. Eu achei na maleta da professora. É adrenalina. Eu ia usar se eles entrassem.'},
    {do:()=>{const l=invAdd('adren',1);if(l)boxAdd('adren',l);const m=invAdd('m9',10);if(m)boxAdd('m9',m);AU.pickup();toast('A Bruna te deu 1 injeção de adrenalina e munição de 9 mm.');}},
    {say:'bruna',m:'t',t:'Eu vou pra sala dos professores, no Bloco 1. Tem a máquina de escrever lá, a luz verde. Eu me tranco e espero o Exército.'},
    {say:'rafa',m:'t',think:true,t:'O Exército não vem. Mas eu não tenho coragem de falar isso pra ela.',dur:2.6},
    {camFree:true}],()=>{F.brunaOk=true;ach('uniBruna');
      if(LM.uniSafe)npcs.push({id:'brunaS',name:'Bruna',x:LM.uniSafe.x+20,y:LM.uniSafe.y+10,ang:0,col:'#e8e6e0',hair:'#3a2418',skin:'#d8a888',cond:()=>G.flags.brunaOk&&!G.flags.uniDone});});
}
{const sn=STORY.npc; STORY.npc=function(n){
  if(n&&n.id==='bruna')return bark('bruna','s',G.flags.uniLab?'Eu tô aqui!':'Abre a porta! A senha tá na secretaria! No Bloco 3!',{radio:!G.flags.uniLab});
  if(n&&n.id==='brunaS')return bark('bruna','n',pick2(['Obrigada, Richard. De verdade.','Eu vou ficar quietinha aqui. Volta se der.','A biblioteca é no 6A. Tem gente lá também, eu ouvi.']));
  return sn.call(STORY,n);};}
{const vi=v12Interact; v12Interact=function(o){
  if(o.type==='uniInterfone'){const F=G.flags;if(!F.brunaCall)return uniBrunaCall();
    if(!F.uniLab)return playCut([{sfx:'static',v:.8},{say:'bruna',m:'s',radio:true,t:'Tu ainda tá aí? A senha, a lista de ramais, no Bloco 3! Corre!'}]);
    return toast('Só chiado. O aviso de evacuação volta a tocar.');}
  return vi(o);};}
// interfone toca sozinho quando você está no campus e já falou com o Seu Ademir
{const vt=v16Tick; v16Tick=function(dt){vt(dt);
  if(G.mode!=='play'||CUT.on||(typeof MP!=='undefined'&&MP.on)||(typeof FB!=='undefined'&&FB.on))return;
  const F=G.flags; if(!uniCampus())return;
  if(!F.brunaCall&&F.ademirTalk&&!F.uniDone){G.ev.brT=(G.ev.brT||0)+dt;if(G.ev.brT>20&&!enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<450))uniBrunaCall();}
  // alto-falante: o aviso de evacuação, de vez em quando
  G.ev.avT=(G.ev.avT??30)-dt; if(G.ev.avT<=0){G.ev.avT=rr(80,140);if(!F.uniDone||Math.random()<.5){AU.static&&AU.static(.25,.5);bark('locutor','n','"Atenção. Por determinação da Defesa Civil, o campus está sendo evacuado. Dirijam-se ao estacionamento sul. Não tentem ajudar pessoas feridas."',{radio:true,dur:4});}}};}
PCH.locutor=PCH.locutor||{name:'Alto-falante',skin:'#c8946c',shade:'#9a6a4a',hair:'#2a2622',iris:'#2a1a10',bg:['#1a1a1a','#050505'],glow:'200,200,160',voice:130};
// carregar o registro: a porta da câmara continua aberta, a Bruna continua na sala dos professores
{const aws=applyWorldState; applyWorldState=function(){aws();const F=G.flags;
  if(F.uniLab){const g=gates.find(x=>x.id==='uniLab');if(g&&!g.open)openGate(g);}
  if(F.brunaOk&&LM.uniSafe&&!npcs.some(n=>n.id==='brunaS'))npcs.push({id:'brunaS',name:'Bruna',x:LM.uniSafe.x+20,y:LM.uniSafe.y+10,ang:0,col:'#e8e6e0',hair:'#3a2418',skin:'#d8a888',cond:()=>G.flags.brunaOk&&!G.flags.uniDone});};}
// missões: aparece na lista de secundárias da mochila
if(typeof misBody==='function'){const mb=misBody; misBody=function(){let s=mb();const F=G.flags;if(!F.brunaCall)return s;
  const it=(ok,t)=>`<li class="${ok?'ok':''}">${ok?'✓':'○'} ${t}</li>`;
  const h=`<h3>Universidade de BC · a Bruna (opcional)</h3><ul class="chk">${it(G.files&&G.files.has(DOC116),'Achar a senha na lista de ramais (Secretaria, Bloco 3)')}${it(F.uniLab,'Abrir a câmara fria do Bloco 5 (Laboratórios)')}${it(F.brunaOk,'Tirar a Bruna de lá')}</ul>`;
  const i=s.lastIndexOf('</div>');return i<0?s+h:s.slice(0,i)+h+s.slice(i);};}
// objetivo: só quando a história não está pedindo nada naquele momento (depois da biblioteca, por exemplo)
{const ob=objective; objective=function(){const o=ob();const F=G.flags;
  if(o&&o.t&&/guarita da entrada de pedestres/.test(o.t))o.t='Ache o Seu Ademir na guarita da entrada de veículos da Universidade de BC, do lado da biblioteca';
  try{if(F.brunaCall&&!F.brunaOk&&uniCampus()&&(!o||!o.at||F.uniDone)){if(!F.uniLab)return {t:'Opcional: a senha da câmara fria do Bloco 5 está na lista de ramais da Secretaria (Bloco 3)',at:G.files&&G.files.has(DOC116)?LM.uniLab:LM.bloco3};}}catch(e){}
  return o;};}
dbgExtra('1.16 · Universidade',[['uni:ademir','Ir até o Seu Ademir (guarita nova)'],['uni:bruna','Receber a chamada da Bruna'],['uni:lab','Ir até a câmara fria do Bloco 5'],['uni:livre','Soltar a Bruna']],function(k){
  const F=G.flags,close=()=>{if(UI.close)UI.close();G.mode='play';};
  if(!inZone())dbgJump('bc2');
  if(k==='uni:ademir'){close();P.x=LM.uniGuarita.x;P.y=LM.uniGuarita.y+50;snapCamera();return;}
  if(k==='uni:bruna'){close();F.brunaCall=false;return uniBrunaCall();}
  if(k==='uni:lab'){close();P.x=LM.uniLab.x;P.y=LM.uniLab.y;snapCamera();return;}
  if(k==='uni:livre'){close();F.brunaCall=true;P.x=LM.uniLab.x;P.y=LM.uniLab.y;snapCamera();return LOCKS.uniLab.open();}
});
