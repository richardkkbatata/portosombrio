// ===================== 1.9: CAPÍTULO EXTRA · PROF. ALEX RESE NO MERCADO PÚBLICO =====================
// O que o professor Rese fazia em Itajaí antes do grupo chegar: a noite do surto, as provas na Praça da Matriz,
// o Dr. Otávio da Vértice na Igreja Matriz, os feirantes do Mercado Público, o rádio e o Fiscal.
// Joga-se a partir do título ("Capítulos extras"). Não mexe no registro principal: o mundo é gerado do zero
// e, no fim, volta para o título. Durante o capítulo não dá pra salvar.

// ---------- registro compartilhado dos capítulos extras (a Sonia usa o mesmo) ----------
globalThis.CAPS=globalThis.CAPS||[];
if(!UI.caps){
  UI.caps=function(){
    const L=globalThis.CAPS||[];
    this.open(`<div class="sheet narrow"><p class="kick">Capítulos extras</p><h2>Outras noites</h2>
      <p class="lede">Histórias de quem estava no litoral antes do Richard chegar. Não mexem no seu registro.</p>
      <div class="diffs">${L.map((c,i)=>`<button class="card" data-a="cap" data-k="${c.id}" ${i===0?'data-focus':''}><b>${c.n}</b><span>${c.d}</span></button>`).join('')}</div>
      <div class="row"><button class="btn ghost" data-a="title">Voltar</button></div></div>`,'','caps');
  };
}
if(!globalThis.CAPS_UI){
  globalThis.CAPS_UI=true;
  {const tt=UI.title.bind(UI); UI.title=function(){tt();try{const m=OV.querySelector('.menu');if(!m||m.querySelector('[data-a=caps]'))return;
    const b=document.createElement('button');b.className='btn';b.dataset.a='caps';b.textContent='Capítulos extras';
    const ref=m.querySelector('[data-a=controls]');m.insertBefore(b,ref||null);}catch(e){}};}
  {const ua=UI.act.bind(UI); UI.act=function(a,ds){
    if(a==='caps')return this.caps();
    if(a==='cap'){const c=(globalThis.CAPS||[]).find(c=>c.id===(ds&&ds.k));if(c){this.close();try{c.start();}catch(e){console.error(e);this.title();}}return;}
    return ua(a,ds);};}
  {const ub=UI.back.bind(UI); UI.back=function(){if(this.cur==='caps')return this.title();return ub();};}
}

// ---------- o professor ----------
LOOKS.alex={coat:'#141414',skin:'#d9a682',hair:'#1a100a',pants:'#2e2c2a',look:'alex'};
PCH.otavio={name:'Dr. Otávio',skin:'#e0bc9e',shade:'#a8866a',hair:'#4a4642',iris:'#2a3a3a',bg:['#14221f','#050909'],glow:'120,230,200',voice:118};
PCH.beto={name:'Seu Beto do peixe',skin:'#b8805c',shade:'#82543a',hair:'#2a2a28',iris:'#2a1a10',bg:['#102030','#04080c'],glow:'110,170,220',voice:98};
PCH.neide={name:'Dona Neide do pastel',skin:'#e4b898',shade:'#b0866a',hair:'#6a3a20',iris:'#3a2618',bg:['#3a2410','#120a04'],glow:'240,170,80',voice:250};
PCH.locutor={name:'Defesa Civil',skin:'#c8a888',shade:'#90705a',hair:'#3a3a3a',iris:'#2a2a2a',bg:['#1a1a1a','#050505'],glow:'200,200,200',voice:140};
PCH.richC=Object.assign({},PCH.rafa);
Object.assign(ITEMS,{
  provaRese:{n:'Provas do 2º ano',s:'PROVAS',c:'#e8e4d8',st:3,k:'key',d:'Provas de química do Colégio Estadual, corrigidas pela metade. Caneta vermelha em tudo.'},
  extintor:{n:'Extintor de incêndio',s:'EXTINTOR',c:'#b02a20',st:1,k:'key',d:'Pesado, vermelho e vencido desde 2019. Serve pra apagar fogo e pra convencer gente.'},
});
Object.assign(INT_LABEL,{rcBarr:'Barricar a porta',rcRadio:'Rádio da administração',rcExt:'Extintor na parede'});
if(typeof ACH!=='undefined')ACH.push({id:'capRese',n:'Chamada feita',d:'Termine o capítulo extra do professor Rese no Mercado Público.'});

const RC={on:false,st:0,t:0};
const RCN=['alex','otavio','beto','neide','locutor','richC'];
const rcT=(x,y)=>({x:tc(x),y:tc(y)});
// lugares (tiles) do Centro Histórico de Itajaí
const RCP={coreto:[63.5,61.5],folhas:[[54,56],[75,65],[67,53]],igreja:[63.5,44],otavio:[63,42],mercS:[30.5,49],beto:[26,41],neide:[35,45],
  barrS:[30.5,46],barrE:[37,42.5],doorS:[[30,47],[31,47]],doorE:[[38,42],[38,43]],radio:[33,40],ext:[25,45],dentro:[30.5,43]};
const RCST=['provas','igreja','otavio','rua','feira','barricar','radio','defesa','chefe','fim'];

function rcCut(steps,end){playCut([{npc:P,id:'alex'},...steps],end);}
function rcZ(type,tx,ty,o){const [x,y]=freeTileNear(tx|0,ty|0,false);const e=makeEnemy(type,tc(x),tc(y),null);if(o&&o.chase){e.state='chase';e.hunt=true;e.huntT=60;e.lx=P.x;e.ly=P.y;}if(o&&o.col)e.col=o.col;e.rc=1;enemies.push(e);return e;}
function rcPick(id,q,tx,ty){const [x,y]=freeTileNear(tx|0,ty|0,true);pickups.push({uid:'rc'+id+(RC.pk=(RC.pk||0)+1),tx:x,ty:y,x:tc(x),y:tc(y),id,q,kind:'item'});}
function rcInt(type,tx,ty){const it={tx:tx|0,ty:ty|0,x:tc(tx),y:tc(ty),type};interacts.push(it);return it;}
function rcUnInt(type){for(let i=interacts.length-1;i>=0;i--)if(interacts[i].type===type&&(!RC.doneB||true))interacts.splice(i,1);}
function rcPlug(list,on){for(const [x,y] of list){const k=idx(x,y);if(on){if(map[k]!==T.PROP){RC.under=RC.under||{};RC.under[k]=map[k];prop(x,y,1);}}else{const u=(RC.under&&RC.under[k]!=null)?RC.under[k]:T.SAFE;setT(x,y,u);}}
  const xs=list.map(a=>a[0]),ys=list.map(a=>a[1]);if(typeof invalidateRect==='function')invalidateRect(Math.min(...xs),Math.min(...ys),3,3);flowTile=-1;}
function rcMercadoSafe(on){const b=buildings.find(b=>b.name==='Mercado Público');if(!b)return;for(let y=b.y;y<b.y+b.h;y++)for(let x=b.x;x<b.x+b.w;x++)safeMask[idx(x,y)]=on?1:0;}
function rcGo(tx,ty){if(P.inCar)exitCar(true);const [x,y]=freeTileNear(tx|0,ty|0,true);P.x=tc(x);P.y=tc(y);snapCamera();flowTile=-1;}

// ---------- começo ----------
function reseStart(st){
  if(typeof MP!=='undefined'&&MP.on)return;
  newGame('normal');
  for(const k of Object.keys(RC))delete RC[k];
  RC.on=true; RC.st=0; RC.t=0; RC.got=[0,0,0]; RC.talk={}; RC.barr={S:0,E:0}; RC.kills=0; RC.deaths=0; RC.t0=G.time; RC.bt=8; RC.hold=0; RC.spT=0; RC.boss=null; RC.under={}; RC.pk=0; RC.ext=0;
  const F=G.flags; F.tutDone=true; G.tut=null; F.rcCap=true;
  G.mode='play'; G.clock=22*60+31; G.wx='chuva'; enemies=[]; projs=[]; G.comps=[]; G.qte=null; G.struggle=null; P.grab=null;
  // o Rese do jogo principal sai de cena (quem anda aqui é ele mesmo)
  for(const n of npcs)if(n.id==='alex'||n.id==='alexG'){n.id+='_main';n.cond=()=>false;}
  for(let i=0;i<P.owned.length;i++){P.owned[i]=false;P.mags[i]=0;} P.owned[8]=true; P.w=8; P.hp=P.max=100; P.bat=100; P.lamp=true; P.lookO=LOOKS.alex;
  G.inv=new Array(G.slots).fill(null); G.box=[]; invAdd('ervaV',1);
  npcs.push({id:'otavio',name:'Dr. Otávio',x:tc(RCP.otavio[0]),y:tc(RCP.otavio[1]),ang:Math.PI/2,col:'#e8e8e4',hair:'#4a4642',skin:'#e0bc9e',cond:()=>RC.on&&RC.st<=2&&!RC.otTurned,crouch:true});
  npcs.push({id:'beto',name:'Seu Beto do peixe',x:tc(RCP.beto[0]),y:tc(RCP.beto[1]),ang:0,col:'#2c4a6a',hair:'#2a2a28',skin:'#b8805c',cond:()=>RC.on&&(RC.st<7||RC.st>=9)});
  npcs.push({id:'neide',name:'Dona Neide do pastel',x:tc(RCP.neide[0]),y:tc(RCP.neide[1]),ang:Math.PI,col:'#a83a3a',hair:'#6a3a20',skin:'#e4b898',cond:()=>RC.on&&(RC.st<7||RC.st>=9)});
  rcGo(RCP.coreto[0],RCP.coreto[1]); P.ang=-Math.PI/2;
  for(const [x,y] of [[52,66],[77,55],[70,68]])rcZ('zumbi',x,y);
  if(st)return rcJump(st);
  rcCut([{fx:'blackout',v:2},
    {say:'alex',m:'n',think:true,t:'Vinte e três provas. Dezenove escreveram "óxido" com ch. Eu devia ter ficado em casa.',dur:3},
    {sfx:'scream',v:.5},{fx:'shake',v:4},
    {say:'alex',m:'a',t:'Isso foi um grito? Na Praça da Matriz? Numa segunda-feira?'},
    {do:()=>{AU.nz&&AU.nz(.6,600,1,.2,'lowpass',0);G.shake+=3;}},
    {say:'alex',m:'s',t:'E o vento levou as provas. Claro. Se eu perder as provas, a direção me crucifica antes de qualquer zumbi.'},
    {say:'alex',m:'n',think:true,t:'Zumbi. Que palavra eu escolhi. Deve ser o cansaço.',dur:2.2}],
    ()=>{G.banner={t:'Itajaí · Praça da Matriz · 22h31 · a noite do surto',life:4.5};});
}
globalThis.CAPS.push({id:'rese',n:'Capítulo do Prof. Rese',d:'Itajaí, 22h31. Antes do Richard aparecer, o professor tinha provas pra corrigir e um mercado pra segurar.',start:()=>reseStart()});

// ---------- objetivos ----------
function rcObjective(){
  const s=RC.st, A=(p)=>rcT(p[0],p[1]);
  if(s===0){const i=RC.got.findIndex(g=>!g);const n=RC.got.filter(Boolean).length;return {t:`(Rese) Recolha as provas que o vento espalhou pela praça (${n}/3)`,at:i>=0?A(RCP.folhas[i]):null};}
  if(s===1)return {t:'(Rese) O sino da Igreja Matriz tocou. Ninguém toca sino às onze da noite. Vá ver',at:A(RCP.igreja)};
  if(s===2)return {t:'(Rese) O Otávio virou. Não deixe ele sair da igreja',at:null};
  if(s===3)return {t:'(Rese) Vá até o Mercado Público. Tem luz lá dentro',at:A(RCP.mercS)};
  if(s===4){const f=['beto','neide'].filter(k=>!RC.talk[k]);return {t:`(Rese) Fale com os feirantes que ficaram presos no mercado (${2-f.length}/2)`,at:f.length?A(RCP[f[0]]):null};}
  if(s===5){const n=(RC.barr.S?1:0)+(RC.barr.E?1:0);return {t:`(Rese) Barrique as duas portas com as bancas (${n}/2)`,at:!RC.barr.S?A(RCP.barrS):A(RCP.barrE)};}
  if(s===6)return {t:RC.radioOk?'(Rese) Pegue o extintor da parede. Pra garantir':'(Rese) Ligue o rádio da administração',at:A(RC.radioOk?RCP.ext:RCP.radio)};
  if(s===7)return {t:`(Rese) A porta do sul cedeu! Segure o mercado: ${Math.max(0,Math.ceil(RC.hold))} s`,at:null};
  if(s===8)return {t:'(Rese) O Fiscal do Mercado. Reprove ele',at:null};
  return {t:'(Rese) Espere. Alguém vem vindo',at:null};
}

// ---------- o capítulo, passo a passo ----------
function rcTick(dt){
  if(!RC.on||CUT.on||G.mode!=='play')return;
  RC.t+=dt; const s=RC.st, near=(p,r)=>hyp(P.x-tc(p[0]),P.y-tc(p[1]))<r;
  G.clock=Math.min(G.clock,23*60+50);
  if(P.hp<P.max*.25&&!RC.lowT){RC.lowT=1;bark('alex','s','Eu tenho cinquenta e poucos anos e um joelho ruim. Calma.');}
  if(P.hp>P.max*.5)RC.lowT=0;
  rcBarks(dt);
  if(s===0){
    RCP.folhas.forEach((f,i)=>{if(!RC.got[i]&&near(f,34)){RC.got[i]=1;invAdd('provaRese',1);AU.pickup();
      const n=RC.got.filter(Boolean).length;
      if(n===1)bark('alex','n','Uma. Nota 4. Pelo menos escreveu o nome.');
      if(n===2){bark('alex','a','Duas. Essa aqui tá com sangue. Não é tinta vermelha. Não é minha.');for(const [x,y] of [[f[0]+7,f[1]+3],[f[0]-6,f[1]+5]])rcZ('zumbi',x,y,{chase:true});}
      if(n===3){RC.st=1;later(800,()=>{AU.tn&&(AU.tn(330,330,1.6,'triangle',.07),AU.tn(330,330,1.6,'triangle',.06,1.8),AU.tn(330,330,1.6,'triangle',.05,3.6));
        rcCut([{cam:rcT(63.5,40),t:1.6},{say:'alex',m:'t',t:'O sino da Matriz. Três batidas.'},{say:'alex',m:'s',think:true,t:'O padre Anselmo tem oitenta anos e dorme às oito. Não é ele.',dur:2.2},{camFree:1}]);});}}});
  }
  else if(s===1){if(near(RCP.igreja,120)&&G.inB>=0)rcOtavio();}
  else if(s===2){const z=RC.otZ;if(!z||!z.alive){RC.st=3;RC.cp=RCP.igreja;
      later(600,()=>{bark('alex','t','Desculpa, Otávio. Tu nunca chegou no horário. Hoje chegou cedo demais.');
        for(const [x,y] of [[44,52],[48,50],[40,55],[36,51],[46,47]])rcZ(Math.random()<.25?'corr':'zumbi',x,y);
        later(4200,()=>bark('alex','n','O mercado. A Dona Neide sempre fica até tarde fechando o caixa. Tem luz lá.'));});}}
  else if(s===3){if(near(RCP.dentro,150)&&G.inB>=0&&G.pSafe)rcFeira();}
  else if(s===4){for(const k of ['beto','neide'])if(!RC.talk[k]){const n=npcs.find(n=>n.id===k);if(n&&hyp(n.x-P.x,n.y-P.y)<70){rcTalk(n);break;}}
    if(RC.talk.beto&&RC.talk.neide&&!CUT.on){RC.st=5;RC.cp=RCP.dentro;rcInt('rcBarr',RCP.barrS[0],RCP.barrS[1]).k='S';rcInt('rcBarr',RCP.barrE[0],RCP.barrE[1]).k='E';
      bark('neide','a','Professor, as bancas de fruta! Empurra as bancas nas portas!');
      for(const [x,y] of [[28,53],[33,53],[44,44],[45,40]])rcZ('zumbi',x,y);}}
  else if(s===5){RC.bt2=(RC.bt2||0)-dt;if(RC.bt2<=0){RC.bt2=rr(2,3.5);AU.knock();AU.thud(.5);G.shake+=1;}
    if(RC.barr.S&&RC.barr.E){RC.st=6;rcInt('rcRadio',RCP.radio[0],RCP.radio[1]);bark('alex','n','Duas portas. Duas bancas. Física básica: eles empurram, a banca empurra de volta.');}}
  else if(s===6){if(RC.radioOk&&RC.ext){RC.st=7;rcDefesa();}}
  else if(s===7){RC.hold-=dt;RC.spT-=dt;
    if(RC.spT<=0){RC.spT=rr(2.2,3.4);const alive=enemies.filter(e=>e.alive&&e.rc).length;if(alive<9){const n=ri(1,2);for(let i=0;i<n;i++)rcZ(Math.random()<.3?'corr':Math.random()<.15?'incha':'zumbi',30+rr(-4,4),52+rr(0,3),{chase:true});}}
    if(RC.hold<=0)rcChefe();}
  else if(s===8){const b=RC.boss;if(b&&!b.alive&&!RC.bossDead){RC.bossDead=1;later(900,()=>rcFim());}}
}
function rcOtavio(){
  RC.st=2; RC.cp=RCP.igreja; const n=npcs.find(n=>n.id==='otavio');
  rcCut([{npc:n,id:'otavio'},{startle:'otavio'},
    {say:'otavio',m:'s',t:'Alex... graças a Deus. Eu fui na tua casa. Depois no colégio. O porteiro disse que tu corrigia prova na praça.'},
    {say:'alex',m:'a',t:'Otávio? Da Vértice? Seis anos sem te ver e tu me aparece tocando o sino da igreja?'},
    {say:'otavio',m:'t',t:'Era o único jeito de tu vir. Tu nunca atende telefone.'},
    {say:'otavio',m:'s',t:'O Arantes abriu o contêiner zero. No porto, às sete. Disseram que era pra "conter".'},
    {say:'otavio',m:'t',t:'Agora o T-00 tá num navio parado no canal. E tudo que ele tocou levantou de novo.'},
    {say:'alex',m:'t',t:'Eu avisei. Eu saí daquele laboratório justamente porque avisei.'},
    {say:'otavio',m:'s',t:'Tu foi o único que entendeu o tecido dele. O cloro, Alex. Tu lembra do cloro.'},
    {say:'alex',m:'n',t:'Muito cloro, de uma vez só. Lembro. Ninguém quis ouvir.'},
    {say:'otavio',m:'k',t:'Toma. A pistola da segurança da Vértice. Me morderam na Hercílio Luz... eu não vou precisar.'},
    {do:()=>{P.owned[1]=true;P.mags[1]=6;invAdd('m9',10);P.w=1;AU.reload();toast('O Dr. Otávio te deu uma pistola 9mm e um punhado de balas.');}},
    {say:'alex',m:'s',t:'Otávio. Otávio, olha pra mim. Fica acordado.'},
    {fx:'shake',v:6},{sfx:'roar',v:1},
    {do:()=>{RC.otTurned=1;const e=rcZ('zumbi',RCP.otavio[0],RCP.otavio[1],{chase:true,col:'#e8e8e4'});e.hp=e.max=e.max*1.6;RC.otZ=e;bloodBurst&&bloodBurst(e.x,e.y,14,0);}},
    {say:'alex',m:'a',t:'Não. NÃO. Tu sempre foi péssimo de pontualidade, Otávio, e justo hoje resolve se adiantar!'}]);
}
function rcFeira(){
  RC.st=4; RC.cp=RCP.dentro;
  rcCut([{say:'alex',m:'n',think:true,t:'Mercado Público. Aberto desde 1917. Hoje é abrigo.',dur:2},
    {say:'neide',m:'a',t:'PROFESSOR! Fecha isso, fecha, fecha!'},
    {say:'alex',m:'n',t:'Boa noite, Dona Neide. Calma. Ninguém vai fechar nada gritando.'}]);
}
function rcTalk(n){
  if(!n)return;
  if(n.id==='beto'&&!RC.talk.beto){RC.talk.beto=1;
    return rcCut([{npc:n,id:'beto'},
      {say:'beto',m:'s',t:'Professor Rese... meu filho fez prova com o senhor. Tirou cinco.'},
      {say:'alex',m:'n',t:'Cinco e meio. Arredondei pra baixo porque ele colou do colega.'},
      {say:'beto',m:'t',t:'Tem uma coisa lá fora comendo o Seu Valdemar. Na frente da minha banca.'},
      {say:'beto',m:'n',t:'Leva a faca de peixe. Tá afiada. Eu afio toda segunda.'},
      {do:()=>{P.owned[0]=true;if(P.w===8)P.w=0;AU.pickup();toast('Seu Beto te deu a faca de peixeiro dele.');}}]);}
  if(n.id==='neide'&&!RC.talk.neide){RC.talk.neide=1;
    return rcCut([{npc:n,id:'neide'},
      {say:'neide',m:'s',t:'Eu tava fechando o caixa. Aí a mulher do caldo de cana entrou mordendo todo mundo.'},
      {say:'alex',m:'t',t:'E onde ela tá agora?'},
      {say:'neide',m:'a',t:'Lá fora, na porta do sul. Batendo. Faz meia hora que bate.'},
      {say:'neide',m:'n',t:'Toma. Erva da minha horta e um pastel de palmito. Ninguém enfrenta isso de barriga vazia.'},
      {do:()=>{invAdd('ervaV',1);P.hp=Math.min(P.max,P.hp+20);toast('Dona Neide te deu uma erva e um pastel. O pastel você comeu ali mesmo.');}}]);}
  bark(n.id,'n',pick2(n.id==='beto'?['Afiada, professor. Corta até osso de tainha.','Meu filho vai querer saber que o senhor salvou o mercado. Mas não muda a nota dele não.','Se o senhor sair, eu não abro de volta. Sem ofensa.']
    :['O senhor tá pálido. Come alguma coisa.','Minha filha mora em Balneário. Ela não atende.','Depois disso o pastel é por conta da casa. Pra sempre.']));
}
function rcBarr(o){
  if(RC.barr[o.k])return toast('Essa porta já está barricada.');
  startStruggle({label:o.k==='S'?'Empurrando a banca de frutas':'Empurrando a banca de peixe',need:100,pump:11,hold:15,noise:260,sfx:'door',x:o.x,y:o.y,
    quit:'O professor largou a banca no meio do caminho.',
    onDone:()=>{RC.barr[o.k]=1;rcPlug(o.k==='S'?RCP.doorS:RCP.doorE,true);const i=interacts.indexOf(o);if(i>=0)interacts.splice(i,1);AU.thud(1);G.shake+=4;
      bark('alex','n',o.k==='S'?'Uma. Fica aí, banca. Tu é a melhor aluna que eu tive hoje.':'Pronto. Agora só falta o resto do mundo cooperar.');}});
}
function rcRadio(o){
  if(RC.radioOk)return toast('Só chiado agora.');
  RC.radioOk=1; const i=interacts.indexOf(o); if(i>=0)interacts.splice(i,1);
  rcInt('rcExt',RCP.ext[0],RCP.ext[1]);
  rcCut([{sfx:'static',v:1},
    {say:'locutor',m:'t',radio:true,t:'...Defesa Civil de Balneário Camboriú. A cidade caiu às 22h16. Repito: Balneário caiu.'},
    {say:'locutor',m:'s',radio:true,t:'Haverá um último helicóptero de resgate no Porto de Itajaí. Quem puder, vá até o porto...'},
    {sfx:'static',v:.8},
    {say:'alex',m:'t',t:'Balneário. Metade da minha turma mora em Balneário.'},
    {say:'alex',m:'s',think:true,t:'O Richard mora lá. Faltou o semestre inteiro. Se alguém sobrevive a isso é ele: nunca tá onde devia estar.',dur:3.2},
    {say:'alex',m:'n',t:'Se ele aparecer, faz a prova de recuperação. Nem que seja no helicóptero.'},
    {say:'beto',m:'a',t:'Professor! A porta do sul tá rangendo!'}]);
}
function rcExt(o){
  if(RC.ext)return; RC.ext=1; const i=interacts.indexOf(o); if(i>=0)interacts.splice(i,1);
  invAdd('extintor',1); AU.pickup();
  toast('Extintor de incêndio. Vencido desde 2019. Pesado o bastante.');
  bark('alex','a','Ninguém entra. Eu tô com um extintor e não tenho medo de usar.');
}
function rcDefesa(){
  RC.hold=50; RC.spT=2; RC.cp=RCP.dentro; rcMercadoSafe(false);
  rcCut([{fx:'slam'},{fx:'shake',v:12},{sfx:'bigBoom',v:.4},
    {do:()=>{rcPlug(RCP.doorS,false);for(let i=0;i<30;i++)parts.push({k:'debris',x:tc(30.5),y:tc(47),vx:rr(-200,200),vy:rr(-260,-40),life:.7,max:.7,s:rr(2,4),c:'#7a5a3a'});
      for(const [x,y] of [[29,50],[32,50],[30,52]])rcZ('zumbi',x,y,{chase:true});rcPick('m9',12,34,42);rcPick('m9',10,26,46);}},
    {cam:rcT(30.5,47),t:1},
    {say:'alex',m:'a',t:'A banca de frutas! A minha melhor aluna!'},
    {say:'neide',m:'s',t:'Beto, a câmara fria! Pra câmara fria!'},
    {say:'alex',m:'a',t:'Vão! Eu seguro a porta. Eu seguro turma de trinta adolescente numa sexta à tarde, eu seguro isso.'},
    {camFree:1}],()=>{toast('Tem munição nas bancas. Segure o mercado.');});
}
function rcChefe(){
  RC.st=8; RC.cp=RCP.dentro;
  rcCut([{fx:'slam'},{sfx:'roar',v:1},{fx:'shake',v:16},
    {do:()=>{rcPlug(RCP.doorE,false);const e=rcZ('brut',43,42.5,{chase:true,col:'#c8a020'});e.t=Object.assign({},e.t,{n:'O Fiscal do Mercado',boss:true});e.hp=e.max=360*(G.D.ehp||1);RC.boss=e;
      for(let i=0;i<24;i++)parts.push({k:'debris',x:tc(38),y:tc(42.5),vx:rr(-260,60),vy:rr(-200,200),life:.7,max:.7,s:rr(2,5),c:'#5a4a3a'});rcPick('m9',12,32,40);}},
    {cam:rcT(40,42.5),t:1.2},
    {say:'alex',m:'s',t:'Colete amarelo. Prancheta. É o fiscal da prefeitura. Ele vinha toda semana multar a Dona Neide.'},
    {say:'alex',m:'a',t:'Tu nunca aprovou nada aqui dentro. Hoje quem reprova sou eu.'},
    {camFree:1}]);
}
function rcFim(){
  RC.st=9; for(const e of enemies)if(e.alive&&e.rc)killEnemy(e);
  const [rx,ry]=freeTileNear(30,52,true);
  const rich={id:'richC',name:'Richard',x:tc(rx),y:tc(ry),ang:-Math.PI/2,col:'#1f2b4e',hair:'#3a2415',skin:'#d29d7c',cond:()=>RC.on&&RC.st>=9&&RC.richIn};
  npcs.push(rich);
  rcCut([{say:'alex',m:'k',t:'Acabou. Por enquanto.'},
    {say:'neide',m:'s',t:'Professor... o senhor tá bem?'},
    {say:'alex',m:'n',t:'Vou ficar aqui. Alguém precisa segurar o mercado. E alguém da turma vai aparecer. Sempre aparece alguém atrasado.'},
    {say:'alex',m:'t',think:true,t:'Hipoclorito na estação de tratamento. Ácido na loja de piscina. Se o Otávio tinha razão, o cloro ainda serve.',dur:3},
    {fx:'blackout',v:2.4},
    {do:()=>{G.banner={t:'Mercado Público · horas depois',life:3.4};G.clock=Math.max(G.clock,23*60+55);RC.richIn=1;rcGo(RCP.dentro[0],RCP.dentro[1]-1);P.ang=Math.PI/2;}},
    {npc:rich,id:'richC'},
    {sfx:'knock',v:1},{walk:'richC',to:rcT(30.5,45.5),spd:70,tmax:3},
    {startle:'alex'},
    {say:'alex',m:'a',t:'PARADO! ...Eu tô com um extintor e não tenho medo de usar.'},
    {say:'richC',m:'s',t:'Professor Rese?!'},
    {say:'alex',m:'s',t:'Richard?! Tu falta na minha aula o semestre inteiro e aparece aqui, no fim do mundo?'},
    {say:'richC',m:'h',t:'Pelo jeito hoje a chamada é só eu, professor.'},
    {fx:'blackout',v:2}],
    ()=>rcEnd(true));
}
function rcEnd(won){
  const mins=Math.max(1,Math.round((G.time-(RC.t0||0))/60)), dt=RC.deaths||0;
  const nota=Math.max(5,Math.min(10,10-dt*.5-(mins>18?.5:0)));
  RC.on=false; P.lookO=null; G.struggle=null; enemies=[]; projs=[];
  if(won&&typeof ach==='function')ach('capRese');
  G.mode='title'; document.getElementById('tc').hidden=true;
  if(!won)return UI.title();
  const nt=String(nota.toFixed(1)).replace('.',',');
  UI.open(`<div class="paper intro"><p class="stamp">Capítulo extra · concluído</p>
    <p>O professor Alex Rese segurou o Mercado Público de Itajaí até o Richard aparecer. O resto da história você já conhece. Ou vai conhecer.</p>
    <p>Tempo: ${mins} min · Quedas: ${dt}</p>
    <p><b>Nota ${nt}.</b> ${nota>=10?'Com louvor. Não se acostume.':nota>=8?'Perdeu ponto pela letra.':'Passou. Raspando. Como sempre.'}</p>
    <div class="row"><button class="btn primary" data-a="title" data-focus>Voltar ao título</button></div></div>`,'','capfim');
}

// ---------- humor de professor: o Rese corrige até zumbi ----------
const RC_BARKS=['Não é "grrr", é "grr". Uma consoante a menos, por favor.','Mastigar de boca aberta. Menos um ponto.','Isso aí é gemido ou é dúvida? Levanta a mão.',
  'Chegou atrasado e sem material. Típico.','Fila indiana! Ninguém aprende nada se todo mundo vier junto.','Concordância, gente. "Eles quer" não existe. "Eles querem". Querem me comer, no caso.',
  'Nota zero em postura. E em higiene.','Essa resposta eu não aceito. Volta pro teu lugar.','Quem não estudou que não venha com fome.'];
function rcBarks(dt){
  RC.bt-=dt; if(RC.bt>0)return;
  const e=enemies.find(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<320);
  if(!e){RC.bt=3;return;}
  RC.bt=rr(13,20); bark('alex',Math.random()<.5?'a':'n',pick2(RC_BARKS));
}

// ---------- desenho: folhas, barricadas, rádio, extintor ----------
function drawRese(){
  if(!RC.on)return;
  if(RC.st===0)RCP.folhas.forEach((f,i)=>{if(RC.got[i])return;const x=tc(f[0]),y=tc(f[1]);if(!inV(x,y,40))return;const w=Math.sin(G.time*3+i)*.25;
    ctx.save();ctx.translate(x,y);ctx.rotate(w+i);ctx.fillStyle='#e8e4d8';ctx.fillRect(-7,-9,14,18);ctx.fillStyle='#b02a20';ctx.fillRect(-4,-6,6,1.5);ctx.fillRect(-4,-2,8,1.2);ctx.fillStyle='#4a4a4a';ctx.fillRect(-4,2,8,1);ctx.restore();});
  for(const it of interacts){if(it.type==='rcRadio'){ctx.fillStyle='#2a2a2a';ctx.fillRect(it.x-9,it.y-6,18,12);ctx.fillStyle='#c8a020';ctx.fillRect(it.x-6,it.y-3,5,5);ctx.fillStyle='#8a8a8a';ctx.fillRect(it.x+2,it.y-3,5,1.5);ctx.fillRect(it.x+2,it.y,5,1.5);}
    if(it.type==='rcExt'){ctx.fillStyle='#b02a20';ctx.fillRect(it.x-4,it.y-9,8,16);ctx.fillStyle='#1a1a1a';ctx.fillRect(it.x-2,it.y-11,4,3);}
    if(it.type==='rcBarr'){ctx.strokeStyle=`rgba(212,154,60,${.4+Math.sin(G.time*4)*.25})`;ctx.lineWidth=2;ctx.strokeRect(it.x-12,it.y-12,24,24);}}
}

// ---------- pulos (menu de teste e testes) ----------
function rcJump(k){
  const st=typeof k==='number'?k:RCST.indexOf(k); if(!RC.on)return reseStart(st>0?st:null); if(CUT.on)finishCutNow();
  if(st>=1)RC.got=[1,1,1];
  if(st>=2){RC.st=1;rcGo(RCP.igreja[0],RCP.igreja[1]+2);rcOtavio();finishCutNow();if(RC.otZ&&st>2)killEnemy(RC.otZ);}
  if(st===1){RC.st=1;rcGo(RCP.igreja[0],RCP.igreja[1]+8);}
  if(st>=3){RC.st=3;rcGo(RCP.mercS[0],RCP.mercS[1]+1);}
  if(st>=4){P.owned[1]=true;P.mags[1]=6;RC.st=3;rcGo(RCP.dentro[0],RCP.dentro[1]);rcFeira();finishCutNow();}
  if(st>=5){for(const k of ['beto','neide']){rcTalk(npcs.find(n=>n.id===k));finishCutNow();}rcTick(.016);finishCutNow();}
  if(st>=6){for(const o of interacts.filter(o=>o.type==='rcBarr')){RC.barr[o.k]=1;rcPlug(o.k==='S'?RCP.doorS:RCP.doorE,true);}rcUnInt('rcBarr');rcTick(.016);}
  if(st>=7){const r=interacts.find(o=>o.type==='rcRadio');if(r)rcRadio(r);finishCutNow();const e=interacts.find(o=>o.type==='rcExt');if(e)rcExt(e);rcTick(.016);finishCutNow();}
  if(st>=8){RC.hold=0;rcTick(.016);finishCutNow();}
  if(st>=9){if(RC.boss)killEnemy(RC.boss);RC.bossDead=1;rcFim();}
  for(const e of enemies)if(e.alive&&st>=3&&st<7&&hyp(e.x-P.x,e.y-P.y)<300)killEnemy(e);
}
function finishCutNow(){for(let k=0;k<120&&CUT.on;k++){if(CUT.choice)cutChoose(0);else cutSkip();}}

// ---------- ganchos: durante o capítulo o resto do jogo fica quieto ----------
(function(){
  const off=fn=>function(){if(RC.on)return;return fn.apply(this,arguments);};
  const sc=syncComps; syncComps=function(){if(RC.on){G.comps=[];return;}return sc.apply(this,arguments);};
  const us=updSpawner; updSpawner=function(dt){if(RC.on){G.spawnT=4;return;}return us(dt);};
  updEvents=off(updEvents); updPlot=off(updPlot); updTriggers=off(updTriggers); updScares=off(updScares); updPers=off(updPers); updAfog=off(updAfog);
  cryTick=off(cryTick); trapTick=off(trapTick); psyTick=off(psyTick); soniaTick=off(soniaTick); zoeiraTick=off(zoeiraTick); terrorTick=off(terrorTick);
  STORY.onDistrict=off(STORY.onDistrict);
  if(typeof mascates==='function'){const ms=mascates;mascates=function(){if(RC.on)return [];return ms.apply(this,arguments);};}
  const b=bark; bark=function(who){if(RC.on&&!RCN.includes(who))return;return b.apply(this,arguments);};
  const ob=objective; objective=function(){if(RC.on)return rcObjective();return ob.apply(this,arguments);};
  const ws=writeSave; writeSave=function(){if(RC.on)return false;return ws.apply(this,arguments);};
  const sv=UI.save.bind(UI); UI.save=function(){if(RC.on){toast('O professor não tem tempo de registrar nada. Tem prova pra corrigir.');return;}return sv();};
  const di=die; die=function(){if(RC.on){RC.deaths=(RC.deaths||0)+1;P.hp=P.max;G.struggle=null;P.grab=null;
      for(const e of enemies)if(e.alive&&hyp(e.x-P.x,e.y-P.y)<200){const a=Math.atan2(e.y-P.y,e.x-P.x);e.x+=Math.cos(a)*120;e.y+=Math.sin(a)*120;e.stun=2;}
      if(RC.cp)rcGo(RC.cp[0],RC.cp[1]);
      G.blackout=Math.max(G.blackout,1.4);toast('O professor caiu... e levantou. "Ainda não terminei de corrigir."');return;}
    return di.apply(this,arguments);};
  const nf=UI.npc; UI.npc=function(n){if(RC.on&&n&&RCN.includes(n.id))return rcTalk(n);return nf.apply(this,arguments);};
  const vi=v12Interact; v12Interact=function(o){if(RC.on){if(o.type==='rcBarr')return rcBarr(o);if(o.type==='rcRadio')return rcRadio(o);if(o.type==='rcExt')return rcExt(o);}return vi(o);};
  const vt=v16Tick; v16Tick=function(dt){vt(dt);try{rcTick(dt);}catch(e){console.error(e);}};
  const dp=drawParts; drawParts=function(){dp();drawRese();};
  const rs=resetState; resetState=function(d){rs(d);RC.on=false;};
  const ke=killEnemy; killEnemy=function(e){const a=e&&e.alive;const r=ke.apply(this,arguments);if(RC.on&&a&&e.rc)RC.kills++;return r;};
  const ua=UI.act.bind(UI); UI.act=function(a,ds){if(RC.on&&(a==='quit'||a==='title')){RC.on=false;P.lookO=null;}return ua(a,ds);};
})();

// ---------- menu de teste ----------
if(typeof dbgExtra==='function')dbgExtra('1.9 · Capítulo do Rese',[['v19r:start','Começar'],['v19r:igreja','Pular · sino da Matriz'],['v19r:rua','Pular · rua até o mercado'],
  ['v19r:feira','Pular · feirantes'],['v19r:barricar','Pular · barricar portas'],['v19r:radio','Pular · rádio e extintor'],['v19r:defesa','Pular · defesa do mercado'],
  ['v19r:chefe','Pular · o Fiscal'],['v19r:fim','Pular · final (chega o Richard)']],
  function(k){const s=String(k).replace('v19r:','');if(s==='start'){if(typeof UI.close==='function')UI.close();return reseStart();}if(typeof UI.close==='function')UI.close();if(!RC.on)reseStart(RCST.indexOf(s));else rcJump(s);});
