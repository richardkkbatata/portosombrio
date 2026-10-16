// ===================== 1.9: MISSÕES SECUNDÁRIAS E EVENTOS ALEATÓRIOS =====================
// Tudo fica em G.flags.v19m (vai junto no registro). Os eventos são passageiros (não salvam).
// Ganchos: genV12 (lugares, NPCs e itens), STORY.npc (conversas), findInteract/promptText/doInteract
// (pontos virtuais: cachorro, antena, fotos, caixa, telefone...), v16Tick (lógica), drawComps (desenho),
// objective (rumo da missão seguida só quando a história não tem rumo), UI.pause (botão Missões).

const V19P={};            // lugares calculados na geração do mundo
const V19T={};            // coisas passageiras: seguidores, zumbis da farmácia, evento atual
const V19E={cur:null,t:110,objs:[]};

Object.assign(ITEMS,{
  insulina:{n:'Insulina da Dona Zuleica',s:'INSUL',c:'#d8e8f0',st:1,k:'key',d:'Duas canetas de insulina geladas, do frigobar da cozinha do Hotel Atlântida.'},
  cartaJu:{n:'Carta para a Jurema',s:'CARTA',c:'#e8dcc0',st:1,k:'key',d:'Envelope amassado: "Para Jurema, Colônia de Pescadores Z-7, Laranjeiras. Entregar em mãos."'},
  prancha:{n:'Prancha do Lipe',s:'PRANC',c:'#e8a040',st:1,k:'key',d:'Uma prancha 6\'2 com um adesivo de caveira. Tem o nome LIPE escrito na rabeta.'},
  chaveBarco:{n:'Chave do barco',s:'CHAVE',c:'#c8a040',st:1,k:'key',d:'Chave com chaveiro de boia: "Maria Clara II". O barco do Seu Dário.'},
  galao:{n:'Galão de gasolina',s:'GALÃO',c:'#c83a2a',st:5,k:'key',d:'Galão vermelho de cinco litros. A Tânia do Ginásio precisa de cinco pro gerador.'},
  cachaca:{n:'Garrafa de cachaça',s:'PINGA',c:'#d8c070',st:4,k:'key',d:'Cachaça artesanal de alambique. O Zé do Rancho paga por cada uma.'},
  vinil:{n:'Disco de vinil',s:'VINIL',c:'#1a1a1a',st:3,k:'key',d:'Um LP antigo, sem arranhão. O DJ Tavinho do Ressaca Club quer três.'},
  camera:{n:'Câmera da Carol',s:'FOTO',c:'#2a2a2e',st:1,k:'key',d:'Câmera de filme da Carol, do Estúdio de Fotografia. Tem um rolo novo dentro.'},
});

// rostos e nomes de quem fala
Object.assign(PCH,{
  valdir:{name:'Seu Valdir',skin:'#c89878',shade:'#9a6a50',hair:'#d8d4cc',iris:'#3a2a1a',bg:['#2a2418','#0a0806'],glow:'220,180,110',voice:110},
  zuleica:{name:'Dona Zuleica',skin:'#d8a888',shade:'#a87a5e',hair:'#b8b0a8',iris:'#3a2618',bg:['#2a1a24','#0a0608'],glow:'210,150,170',voice:220},
  osni:{name:'Seu Osni',skin:'#c8946c',shade:'#9a6a4a',hair:'#8a8680',iris:'#2a1a10',bg:['#1a2418','#060904'],glow:'140,190,120',voice:100},
  haroldo:{name:'Seu Haroldo',skin:'#d0a080',shade:'#a07658',hair:'#3a3632',iris:'#2a1a10',bg:['#e8e4d8','#6a6a60'],glow:'230,230,220',voice:120},
  jurema:{name:'Dona Jurema',skin:'#a8724e',shade:'#7a4e34',hair:'#2a1e16',iris:'#1a120a',bg:['#16242e','#04080c'],glow:'110,170,210',voice:205},
  lipe:{name:'Lipe',skin:'#c8906a',shade:'#9a6a4a',hair:'#e0c070',iris:'#3a2a18',bg:['#0e2a32','#03090c'],glow:'90,190,210',voice:165},
  dario:{name:'Seu Dário',skin:'#a8724e',shade:'#7a4e34',hair:'#c8c4bc',iris:'#1a120a',bg:['#14202a','#04070a'],glow:'100,150,190',voice:95},
  tania:{name:'Tânia',skin:'#b07a5a',shade:'#7a4e38',hair:'#1a120c',iris:'#2a1a10',bg:['#3a2a10','#100a04'],glow:'230,170,80',voice:200},
  ze:{name:'Zé do Rancho',skin:'#c8946c',shade:'#9a6a4a',hair:'#2a2622',iris:'#2a1a10',bg:['#3a2410','#120a04'],glow:'230,150,80',voice:105},
  tavinho:{name:'DJ Tavinho',skin:'#8a5a3e',shade:'#5e3a26',hair:'#141010',iris:'#1a100a',bg:['#2a1030','#08040a'],glow:'200,90,220',voice:150},
  carol:{name:'Carol',skin:'#e0b090',shade:'#b08060',hair:'#6a2a1a',iris:'#2a3a2a',bg:['#1a1a1e','#060608'],glow:'200,200,210',voice:230},
  arlindo:{name:'Seu Arlindo',skin:'#d0a080',shade:'#a07658',hair:'#e0dcd4',iris:'#3a2a1a',bg:['#24201a','#080706'],glow:'200,180,140',voice:100},
  locutor:{name:'Rádio Maré 98.3',skin:'#c8946c',shade:'#9a6a4a',hair:'#2a2622',iris:'#2a1a10',bg:['#1a1a1a','#050505'],glow:'200,200,160',voice:130},
  saq:{name:'Saqueador',skin:'#b88a68',shade:'#8a5e44',hair:'#1a1410',iris:'#1a120a',bg:['#201a16','#070605'],glow:'180,120,90',voice:115},
});

// ---------- as missões ----------
// at: lugar do NPC (chave de LM) e deslocamento; cor da roupa; quem fala
const V19M=[
  {id:'pipoca',n:'O Pipoca',onde:'Coreto da Avenida',npc:'valdir',at:['coreto',-3,4],col:'#5a4a3a',hair:'#d8d4cc',skin:'#c89878'},
  {id:'insulina',n:'A insulina da Dona Zuleica',onde:'Edifício Moacir',npc:'zuleica',at:['moacir',0,0],col:'#7a3a5a',hair:'#b8b0a8',skin:'#d8a888'},
  {id:'antena',n:'A antena do Seu Osni',onde:'Edifício Pôr do Sol (Brava)',npc:null,radio:'osni'},
  {id:'farmacia',n:'A drogaria do Seu Haroldo',onde:'Drogaria, perto do Ruth Cardoso',npc:'haroldo',at:['farmacia',0,3],col:'#e8e4d8',hair:'#3a3632',skin:'#d0a080'},
  {id:'carta',n:'Carta para a Jurema',onde:'Colônia de Pescadores Z-7',npc:'jurema',at:['colonia',0,5],col:'#2a4a6a',hair:'#2a1e16',skin:'#a8724e'},
  {id:'prancha',n:'A prancha do Lipe',onde:'Quiosques da Brava',npc:'lipe',at:['quiosqueBrava',0,0],col:'#2a8aa0',hair:'#e0c070',skin:'#c8906a'},
  {id:'barco',n:'O barco do Seu Dário',onde:'Cabeçudas',npc:'dario',at:['bombeiros',2,8],col:'#c8a040',hair:'#c8c4bc',skin:'#a8724e'},
  {id:'gerador',n:'Gasolina pro Ginásio',onde:'Ginásio Municipal',npc:'tania',at:['ginasio',0,-1],col:'#d86a20',hair:'#1a120c',skin:'#b07a5a'},
  {id:'cachaca',n:'A pinga do Zé',onde:'Rancho das Laranjeiras',npc:'ze',at:['rancho',0,0],col:'#3a2a1a',hair:'#2a2622',skin:'#c8946c'},
  {id:'vinil',n:'Os discos do DJ Tavinho',onde:'Ressaca Club',npc:'tavinho',at:['boate',0,0],col:'#4a1a5a',hair:'#141010',skin:'#8a5a3e'},
  {id:'fotos',n:'O último rolo da Carol',onde:'Bloco 9 · Universidade de BC',npc:'carol',at:['bloco9',0,0],col:'#1a1a1e',hair:'#6a2a1a',skin:'#e0b090'},
  {id:'escolta',n:'Seu Arlindo vai pra clínica',onde:'Mercado da Brava',npc:'arlindo',at:['mercadoBrava',0,0],col:'#6a6a5a',hair:'#e0dcd4',skin:'#d0a080'},
];
const V19MI=Object.fromEntries(V19M.map(m=>[m.id,m]));
const V19NEED={gerador:5,cachaca:4,vinil:3,fotos:3};
const V19FOTOS=[['foyer','o Foyer, onde ia ser a formatura'],['uniBib','a Biblioteca'],['quadraUni','a Quadra de Esportes']];

function v19S(id){const F=G.flags;F.v19m=F.v19m||{};return F.v19m[id]||(F.v19m[id]={s:0});}
function v19St(id){return ((G.flags.v19m||{})[id]||{}).s|0;}
function v19Give(id,q){const l=invAdd(id,q);if(l)boxAdd(id,l);if(typeof mSync==='function')mSync();}
function v19Start(id,quiet){const s=v19S(id);if(s.s)return false;s.s=1;s.t0=G.time|0;const m=V19MI[id];
  if(!G.flags.v19seg||v19St(G.flags.v19seg)!==1)G.flags.v19seg=id;
  if(!quiet){toast('Missão secundária: '+m.n+'.');G.banner={t:'Missão secundária: '+m.n,life:2.6};}return true;}
function v19Done(id,rw){const s=v19S(id);if(s.s===2)return false;s.s=2;s.t1=G.time|0;const m=V19MI[id];const got=[];
  if(rw){if(rw.grana){granaAdd(rw.grana);got.push(brl(rw.grana));}for(const [it,q] of (rw.it||[])){v19Give(it,q);got.push(ITEMS[it].n+(q>1?' ×'+q:''));}if(rw.ach)ach(rw.ach);}
  AU.pickup();toast('Missão concluída: '+m.n+(got.length?' · '+got.join(', '):'')+'.');
  if(G.flags.v19seg===id){const nx=V19M.find(x=>v19St(x.id)===1);G.flags.v19seg=nx?nx.id:null;}
  const n=V19M.filter(x=>v19St(x.id)===2).length; if(n>=5)ach('v19cinco'); if(n>=V19M.length)ach('v19todas');
  return true;}
const V19REW={
  pipoca:{grana:300,ach:'pipoca'},
  insulina:{grana:200,it:[['m9',15]]},
  antena:{grana:250,it:[['cart',6]]},
  farmacia:{grana:150,it:[['ervaV',2],['spray',1]]},
  carta:{grana:100,it:[['joia',1]]},
  prancha:{grana:200,it:[['cart',8]]},
  barco:{grana:250,it:[['pecas',3]]},
  gerador:{grana:400,it:[['gran',1]]},
  cachaca:{grana:100,it:[['polv',2]]},
  vinil:{grana:300,it:[['pilha',2]]},
  fotos:{grana:200,it:[['calmante',1]]},
  escolta:{grana:250,it:[['ervaR',1],['polv',1]]},
};

// ---------- lugares, NPCs e itens (a cada geração do mundo) ----------
function v19Spot(tx,ty){const [x,y]=freeTileNear(tx|0,ty|0,true);return {x:tc(x),y:tc(y),tx:x,ty:y};}
function v19Anchor(k){
  const L=LM[k]; if(L&&L.x!=null)return [(L.x/TILE)|0,(L.y/TILE)|0];
  const B=n=>buildings.find(b=>b.name&&b.name.startsWith(n)), mid=b=>b?[b.x+((b.w/2)|0),b.y+((b.h/2)|0)]:null;
  if(k==='moacir')return mid(B('Edifício Moacir'));
  if(k==='quiosqueBrava'){const q=buildings.find(b=>b.name==='Quiosque'&&b.y>110&&b.y<125&&b.x>180);return q?[q.x-2,q.y+1]:null;}
  if(k==='rancho')return mid(B('Rancho das Laranjeiras'));
  if(k==='bloco9')return mid(B('Bloco 9'));
  if(k==='mercadoBrava')return mid(B('Mercado da Brava'));
  if(k==='quadraUni')return mid(B('Quadra de Esportes'));
  if(k==='porDoSol')return mid(B('Edifício Pôr do Sol'));
  if(k==='surfShop')return mid(B('Surf Shop Brava'));
  if(k==='casaCab'){const b=buildings.find(b=>b.kind==='casa'&&b.x>=178&&b.y>=35&&b.y<=40);return mid(b);}
  return null;
}
function v19Pick(uid,k,dx,dy,id,q){const a=v19Anchor(k);if(!a)return;const [x,y]=freeTileNear(a[0]+(dx|0),a[1]+(dy|0),true);const p={uid:'v19_'+uid,tx:x,ty:y,x:tc(x),y:tc(y),id,q:q||1,kind:'item'};pickups.push(p);pickOcc.add(idx(x,y));}
(function(){
  const g=genV12; genV12=function(){g();
    for(const k in V19P)delete V19P[k];
    for(const m of V19M){if(!m.npc)continue;const a=v19Anchor(m.at[0]);if(!a)continue;const s=v19Spot(a[0]+m.at[1],a[1]+m.at[2]);V19P[m.id]=s;
      npcs.push({id:'v19_'+m.id,v19:m.id,name:PCH[m.npc].name,look:null,x:s.x,y:s.y,col:m.col,hair:m.hair,skin:m.skin,ang:Math.PI/2,
        cond:m.id==='escolta'?()=>v19St('escolta')!==2:null});}
    const put=(k,a,dx,dy)=>{const A=v19Anchor(a);if(A)V19P[k]=v19Spot(A[0]+(dx|0),A[1]+(dy|0));};
    put('dog','cemiterio',0,2); put('antena','porDoSol',0,0); put('clinicaBrava','clinica',0,3);
    for(const [k] of V19FOTOS)put('foto_'+k,k==='foyer'?'foyerIn':k,0,0);
    // itens das missões
    v19Pick('insulina','hotel',-3,2,'insulina');
    v19Pick('carta','rodov',2,0,'cartaJu');
    v19Pick('prancha','mirante',-2,-1,'prancha');
    v19Pick('chaveBarco','casaCab',0,0,'chaveBarco');
    [['posto',0,2],['lava',0,0],['obra',0,2],['oficina',-4,4],['estac',0,0]].forEach(([k,dx,dy],i)=>v19Pick('galao'+i,k==='lava'?'bombas':k,dx,dy+(k==='lava'?10:0),'galao'));
    [['colonia',3,-2],['laranj',-2,4],['bondMA',2,2],['taquarinhas',0,-2]].forEach(([k,dx,dy],i)=>v19Pick('cachaca'+i,k,dx,dy,'cachaca'));
    [['museu',0,0],['surfShop',0,0],['casa4',0,2]].forEach(([k,dx,dy],i)=>v19Pick('vinil'+i,k,dx,dy,'vinil'));
  };
})();

// pegar o item de uma missão que você ainda não conhece já começa a missão
const V19ITEM={insulina:'insulina',cartaJu:'carta',prancha:'prancha',chaveBarco:'barco',galao:'gerador',cachaca:'cachaca',vinil:'vinil'};
{const tp=takePickup; takePickup=function(p){const r=tp.apply(this,arguments);
  if(p&&p.kind==='item'&&V19ITEM[p.id]&&G.taken&&G.taken.has(p.uid)){const id=V19ITEM[p.id];
    if(!v19St(id)){v19Start(id,true);toast(id==='carta'?'Uma carta pra alguém da Colônia Z-7. Missão secundária: '+V19MI.carta.n+'.':'Isso parece ser de alguém. Missão secundária: '+V19MI[id].n+'.');}
    else if(V19NEED[id]&&v19St(id)===1){const n=invCount(p.id);toast(`${ITEMS[p.id].n}: ${n} de ${V19NEED[id]}.`);}}
  return r;};}

// ---------- conversas ----------
function v19Cut(n,steps,end){playCut([{npc:n,id:n.npcId||PCHid(n)},...steps],end);}
function PCHid(n){return V19MI[n.v19].npc;}
function v19Talk(n){
  const id=n.v19, m=V19MI[id], st=v19S(id), w=m.npc, F=G.flags;
  const S=(t,mo)=>({say:w,m:mo||'n',t}), R_=(t,mo)=>({say:'rafa',m:mo||'n',t});
  const done=()=>v19Done(id,V19REW[id]);
  if(st.s===2){const fim={pipoca:'O Pipoca não sai mais do meu pé. Obrigado, rapaz.',insulina:'Tô melhor, meu filho. Deus te pague.',farmacia:'Pega o que precisar no balcão. Só não mexe no controlado.',
      carta:'Eu leio essa carta toda noite. Obrigada.',prancha:'Quando o mar baixar eu volto pra água. Tu vai ver.',barco:'A Maria Clara tá pronta. Se precisar sair pelo mar, me chama.',gerador:'A luz do Ginásio tá acesa por tua causa.',
      cachaca:'Volta quando quiser, a casa é tua.',vinil:'Tô no ar, parceiro. Liga o rádio.',fotos:'Eu vou revelar quando tiver um laboratório de novo.',escolta:'A doutora disse que eu fico.'}[id];
    if(id==='cachaca'&&invCount('cachaca')>0)return v19Cachaca(n);
    return bark(w,'h',fim||'Valeu.');}
  if(id==='pipoca'){
    if(!st.s)return v19Cut(n,[S('Rapaz! Rapaz, tu viu um cachorro? Caramelo, coleira vermelha. Atende por Pipoca.','t'),R_('Não vi, não, senhor.'),
      S('Ele fugiu quando começaram os tiros. Ele tem medo de fogos, sempre correu pro cemitério, lá perto do Ruth Cardoso. Na hora do Ano Novo era sempre lá que eu achava ele.','s'),
      S('Eu não consigo andar até lá. Não com essas pernas. Não com essas coisas na rua.','t'),R_('Vou dar uma olhada.'),{do:()=>v19Start(id)}]);
    if(V19T.dog&&V19T.dog.f&&hyp(V19T.dog.x-n.x,V19T.dog.y-n.y)<160)return v19Cut(n,[S('PIPOCA! Ô meu Deus, Pipoca!','h'),{do:()=>{V19T.dog.home=true;st.f=0;}},S('Ele tá magro, mas tá inteiro. Toma, rapaz, é tudo que eu guardei debaixo do colchão.','h'),{do:done}]);
    return bark(w,'t','Cemitério, rapaz. Ele sempre ia pro cemitério.');}
  if(id==='insulina'){
    if(!st.s&&invCount('insulina')<=0)return v19Cut(n,[S('Moço... moço, tu tem açúcar? Não, espera. Não é açúcar. É insulina.','t'),R_('A senhora tá bem?'),
      S('Eu sou diabética. Acabou ontem. Meu filho é cozinheiro no Hotel Atlântida, ele guardava as minhas canetas no frigobar da cozinha.','s'),
      S('A farmácia tá cheia daquelas coisas. Mas o hotel... o hotel é aqui do lado.','t'),{do:()=>v19Start(id)}]);
    if(invCount('insulina')>0)return v19Cut(n,[R_('Dona Zuleica. Tava no frigobar, como a senhora disse.'),S('Ai, graças... Me dá aqui.','h'),S('O meu filho... tu viu ele lá? Não? Tá bom. Tá bom. Ele deve ter saído antes.','s'),
      {do:()=>{invRemove('insulina',1);done();}}]);
    return bark(w,'t','Cozinha do Hotel Atlântida, moço. No frigobar.');}
  if(id==='farmacia'){
    if(!st.s)return v19Cut(n,[S('Não entra aí! A drogaria tá cheia. Eu me tranquei no depósito e saí pela janela dos fundos.','t'),
      S('Eu sou o farmacêutico. Tem soro, tem curativo, tem remédio pra muita gente lá dentro. Mas eles tão lá. Seis, sete.','s'),R_('E se eu limpar?'),
      S('Se tu limpar a minha drogaria, rapaz, eu te dou do bom. E abro o balcão pra quem precisar.','n'),{do:()=>{v19Start(id);st.k=0;}}]);
    if(st.lim)return v19Cut(n,[S('Silêncio... tu conseguiu mesmo. Toma. Do bom, como eu prometi.','h'),{do:done}]);
    return bark(w,'t','Eles ainda tão lá dentro. Eu tô ouvindo.');}
  if(id==='carta'){
    if(invCount('cartaJu')>0)return v19Cut(n,[R_('A senhora é a Jurema? Achei isso na Rodoviária.'),S('...É a letra do meu irmão. Ele ia pegar o ônibus pra cá ontem de manhã.','t'),
      {fx:'zoom',v:1.05},S('"Ju, se o ônibus não sair, eu vou a pé. Guarda o meu lugar na mesa." ...Ele sempre chegava atrasado.','s'),{fx:'zoom',v:1},
      S('Toma. Era da nossa mãe. Eu prefiro que tu use pra sair dessa cidade.','s'),{do:()=>{invRemove('cartaJu',1);v19Start(id,true);done();}}]);
    return bark(w,'s',pick2(['Tu viu algum ônibus vindo de Balneário? Meu irmão vinha pra cá.','A gente espera os barcos aqui. Ninguém sai da Colônia sozinho.']));}
  if(id==='prancha'){
    if(invCount('prancha')>0)return v19Cut(n,[S('MINHA PRANCHA! Mano, tu achou!','h'),R_('Tava lá no Morro do Careca. Que diabo ela fazia lá em cima?'),S('Eu subi pra ver a onda e eles vieram. Larguei tudo e desci rolando.','a'),
      S('Toma. O Kadu não precisa saber que eu tinha isso aqui guardado.','h'),{do:()=>{invRemove('prancha',1);v19Start(id,true);done();}}]);
    if(!st.s)return v19Cut(n,[S('Ô, parceiro. Tu tá indo pro lado do Morro do Careca?','n'),S('Deixei a minha prancha lá no mirante. Ela foi cara, mano. Foi o primeiro salário de garçom.','s'),R_('Tu quer que eu vá buscar uma prancha. No meio disso tudo.'),
      S('Eu pago! Tenho cartucho de escopeta que o meu tio deixou na barraca.','h'),{do:()=>v19Start(id)}]);
    return bark(w,'n','No mirante do Morro do Careca, mano. Lá em cima.');}
  if(id==='barco'){
    if(invCount('chaveBarco')>0)return v19Cut(n,[R_('Seu Dário? Chaveiro de boia. Maria Clara II.'),S('É ela! Achou na casa do meu genro? Eu deixei lá quando tudo começou.','h'),
      S('Agora sim. A Maria Clara tem diesel pra chegar em Porto Belo. Se um dia tu precisar sair pelo mar, me procura.','n'),{do:()=>{invRemove('chaveBarco',1);v19Start(id,true);F.v19barco=true;done();}}]);
    if(!st.s)return v19Cut(n,[S('Psiu. Tu. Não grita, que eles escutam.','t'),S('Eu tenho um barco ali na Cabeçudas. Maria Clara II. Tem diesel, tem tudo. Só não tem chave.','s'),
      S('Ficou na casa do meu genro, a última casa da rua, perto do Corpo de Bombeiros. Ele... ele não abre mais a porta pra ninguém.','t'),{do:()=>v19Start(id)}]);
    return bark(w,'t','A casa do meu genro, rapaz. A última da rua.');}
  if(id==='gerador'){
    const q=invCount('galao');
    if(st.s===1&&q>=5)return v19Cut(n,[R_('Cinco galões. Onde eu deixo?'),S('Bem aqui! Ai, menino. Tu não sabe o que é ter quarenta pessoas no escuro.','h'),{do:()=>{invRemove('galao',5);AU.unlock();G.flick=.3;done();}},S('A luz voltou! Escutou? As crianças tão gritando, mas é de alegria.','h')]);
    if(!st.s)return v19Cut(n,[S('Ei! Tu tá sozinho? Eu sou a Tânia, voluntária da Defesa Civil. Tem gente aqui no Ginásio.','n'),
      S('O gerador tá seco. Se eu não ligar ele hoje, a gente fica no escuro de novo. E no escuro... tu sabe.','t'),
      S('Preciso de cinco galões de gasolina. Posto, lava-jato, oficina, a obra do Residencial... tem coisa por aí.','n'),{do:()=>v19Start(id)}]);
    return bark(w,'n',`Tu tem ${q} de 5 galões. Posto, lava-jato, obra, oficina da Barra Sul, estacionamento do hospital.`);}
  if(id==='cachaca'){
    if(!st.s)return v19Cut(n,[S('Ô de casa! Entra, entra, que lá fora tá feio.','h'),S('O Rancho fecha nunca, mas a pinga acabou. Eu tinha garrafa escondida pela Laranjeiras inteira, da época do alambique do meu pai.','n'),
      S('Pago sessenta conto por garrafa. Tem quatro por aí: na Colônia, na Praia de Laranjeiras, na estação do bondinho e na Taquarinhas.','n'),R_('Sessenta por garrafa. No apocalipse.'),S('Apocalipse sem pinga é que não dá, rapaz.','h'),{do:()=>v19Start(id)}]);
    if(invCount('cachaca')>0)return v19Cachaca(n);
    return bark(w,'n',`Já me trouxe ${st.n|0} de 4. Colônia, praia, bondinho, Taquarinhas.`);}
  if(id==='vinil'){
    const q=invCount('vinil');
    if(st.s===1&&q>=3)return v19Cut(n,[S('Três! Três bolachas! Tu é dos meus, irmão.','h'),{do:()=>{invRemove('vinil',3);done();F.v19dj=true;}},S('O transmissor do clube ainda pega no rádio comunicador. Toda noite eu vou tocar alguma coisa. Pra quem ainda tá vivo saber que não tá sozinho.','n')]);
    if(!st.s)return v19Cut(n,[S('Desliga essa lanterna, irmão. Aqui é cabine de DJ, não é delegacia.','a'),S('A boate tá vazia, mas a mesa funciona. Tem um transmissor de rádio pirata aqui atrás.','n'),
      S('Só que os meus discos ficaram tudo pela cidade. Um no Museu lá de Itajaí, um na Surf Shop da Brava, um na Casa 4 do condomínio. Me traz três e eu volto pro ar.','n'),{do:()=>v19Start(id)}]);
    return bark(w,'n',`${q} de 3 discos. Museu de Itajaí, Surf Shop da Brava, Casa 4.`);}
  if(id==='fotos'){
    const tir=(st.fotos||[]).length;
    if(st.s===1&&tir>=3)return v19Cut(n,[R_('Três fotos. O Foyer, a Biblioteca e a Quadra.'),S('Obrigada. É o meu TCC: "a universidade vazia". Eu nunca imaginei que ia ficar vazia de verdade.','s'),
      {do:()=>{invRemove('camera',1);done();}}]);
    if(!st.s)return v19Cut(n,[S('Tu é da Gastronomia? Não? Tanto faz.','n'),S('Eu sou a Carol, do Estúdio. Falta três fotos pro meu trabalho final e eu não vou sair desse bloco nem morta.','t'),
      S('Leva a minha câmera. O Foyer, a Biblioteca e a Quadra. Tira e me traz.','n'),{do:()=>{v19Start(id);st.fotos=[];v19Give('camera',1);}}]);
    if(invCount('camera')<=0)return v19Cut(n,[S('Tu perdeu a minha câmera?! Toma a reserva. Cuida dessa, pelo amor.','a'),{do:()=>v19Give('camera',1)}]);
    return bark(w,'n',`Faltam ${3-tir}. O Foyer, a Biblioteca e a Quadra.`);}
  if(id==='escolta'){
    if(!st.s)return v19Cut(n,[S('Eu tô aqui desde a meia-noite, rapaz. Atrás das gôndolas.','t'),S('A minha neta disse que tem uma clínica aqui na Brava com médica. Eu tenho marca-passo. Se a pilha acabar...','s'),
      R_('A Clínica da Brava. Fica perto da praia.'),S('Tu me leva? Eu ando devagar, mas eu ando.','t'),{do:()=>{v19Start(id);st.f=1;}}]);
    if(st.f)return bark(w,'t','Vai na frente, rapaz. Eu vou atrás.');
    return v19Cut(n,[S('Tu volta pra me levar?','t'),{do:()=>{st.f=1;toast('O Seu Arlindo está te seguindo.');}}]);}
}
function v19Cachaca(n){const st=v19S('cachaca'),q=invCount('cachaca');if(q<=0)return;invRemove('cachaca',q);st.n=(st.n|0)+q;granaAdd(60*q);
  playCut([{npc:n,id:'ze'},{say:'ze',m:'h',t:q>1?`${q} garrafas! Toma ${brl(60*q)}.`:`Essa é das boas. Toma ${brl(60)}.`}],()=>{if(st.n>=4&&st.s===1)v19Done('cachaca',V19REW.cachaca);});}
(function(){const sn=STORY.npc;STORY.npc=function(n){if(n&&n.v19)return v19Talk(n);return sn(n);};})();

// ---------- pontos virtuais: o que dá pra usar sem ser NPC ----------
function v19Points(){
  const out=[], F=G.flags;
  const d=V19T.dog; if(d&&!d.home&&!d.f&&v19St('pipoca')===1)out.push({x:d.x,y:d.y,lab:'Chamar o cachorro',use:()=>{d.f=1;v19S('pipoca').f=1;AU.pickup();bark('rafa','h','Pipoca? Vem cá, Pipoca. Vem.');toast('O Pipoca está te seguindo. Leve ele até o Seu Valdir, no coreto.');}});
  const an=V19P.antena; if(an&&v19St('antena')===1)out.push({x:an.x,y:an.y,lab:'Consertar o amplificador da antena',use:v19Antena});
  if(v19St('fotos')===1&&invCount('camera')>0)for(const [k,nome] of V19FOTOS){const p=V19P['foto_'+k];const st=v19S('fotos');if(p&&!(st.fotos||[]).includes(k))out.push({x:p.x,y:p.y,lab:'Fotografar '+nome,use:()=>v19Foto(k,nome)});}
  for(const o of V19E.objs)if(!o.gone)out.push(o);
  return out;
}
function v19Antena(){const st=v19S('antena');
  if(invCount('pilha')<=0)return toast('O amplificador está sem bateria. Precisa de uma pilha.');
  invRemove('pilha',1);AU.unlock();AU.static(.5,.5);
  playCut([{say:'rafa',m:'n',think:true,t:'Fio solto, pilha nova, conector no lugar. Tem que funcionar.'},{do:()=>AU.radio()},
    {say:'osni',m:'h',radio:true,t:'...ATENÇÃO! Câmbio! Tô te ouvindo limpo agora! Daqui do Pôr do Sol dá pra falar até com Florianópolis!'},
    {say:'osni',m:'n',radio:true,t:'Deixei um pacote na portaria pra ti. Cartucho que era do meu cunhado. E dinheiro, que agora não serve pra nada pra mim.'}],
    ()=>v19Done('antena',V19REW.antena));}
function v19Foto(k,nome){const st=v19S('fotos');st.fotos=st.fotos||[];if(st.fotos.includes(k))return;st.fotos.push(k);G.flick=.12;AU.tn(1800,1800,.05,'square',.06);AU.tn(400,300,.12,'sawtooth',.04,.06);
  toast(`Foto: ${nome}. ${st.fotos.length} de 3.`);if(st.fotos.length>=3)later(700,()=>bark('rafa','n','Pronto. Três fotos. Agora volta pro Bloco 9.'));}

{const fi=findInteract; findInteract=function(){let best=fi();if(P.inCar||P.hidden||(typeof MP!=='undefined'&&MP.on))return best;
  let bd=best?22:46; for(const o of v19Points()){const d=hyp(o.x-P.x,o.y-P.y)-6;if(d<bd){bd=d;best={k:'v19',o};}} return best;};}
{const pt=promptText; promptText=function(pr){if(pr&&pr.k==='v19')return pr.o.lab;return pt(pr);};}
{const di=doInteract; doInteract=function(){const pr=G.prompt;if(pr&&pr.k==='v19'){try{pr.o.use();}catch(e){console.error(e);}return;}return di();};}

// ---------- lógica das missões ----------
function v19Follow(f,dt,dist,spd){
  const d=hyp(P.x-f.x,P.y-f.y); f.moving=false;
  if(d>700){const a=Math.random()*6.283;const s=v19Spot(((P.x+Math.cos(a)*50)/TILE)|0,((P.y+Math.sin(a)*50)/TILE)|0);f.x=s.x;f.y=s.y;return;}
  if(d<dist)return; const a=Math.atan2(P.y-f.y,P.x-f.x), nx=f.x+Math.cos(a)*spd*dt, ny=f.y+Math.sin(a)*spd*dt;
  const ok=(x,y)=>!SOLID[getT((x/TILE)|0,(y/TILE)|0)];
  if(ok(nx,ny)){f.x=nx;f.y=ny;}else if(ok(nx,f.y))f.x=nx;else if(ok(f.x,ny))f.y=ny;
  f.ang=a;f.moving=true;f.walk=(f.walk||0)+dt*8;
}
function v19MissTick(dt){
  const F=G.flags, M=F.v19m||{};
  // o Pipoca
  if(v19St('pipoca')===1){
    if(!V19T.dog){const s=v19S('pipoca');if(s.f){const p=v19Spot(((P.x-40)/TILE)|0,(P.y/TILE)|0);V19T.dog={x:p.x,y:p.y,f:1,ang:0};}else if(V19P.dog)V19T.dog={x:V19P.dog.x,y:V19P.dog.y,f:0,ang:0};}
    const d=V19T.dog; if(d&&d.f&&!d.home){v19Follow(d,dt,46,210);const v=npcs.find(n=>n.v19==='pipoca');
      if(v&&hyp(d.x-v.x,d.y-v.y)<110&&!CUT.on)v19Talk(v);}
    if(d&&!d.f&&hyp(d.x-P.x,d.y-P.y)<260&&!d.ganiu){d.ganiu=1;AU.tn(900,600,.3,'sine',.05);AU.tn(900,600,.3,'sine',.05,.4);psyFloat(d.x,d.y,'(ganido)',{life:2,c:'#e8d8a8'});}
  }
  if(V19T.dog&&V19T.dog.home){const v=npcs.find(n=>n.v19==='pipoca');if(v){V19T.dog.x+=(v.x+18-V19T.dog.x)*Math.min(1,dt*3);V19T.dog.y+=(v.y+10-V19T.dog.y)*Math.min(1,dt*3);}}
  if(v19St('pipoca')===2&&!V19T.dog){const v=npcs.find(n=>n.v19==='pipoca');if(v)V19T.dog={x:v.x+18,y:v.y+10,home:true,ang:0};}
  // antena: o Seu Osni chama pelo rádio (só depois do rádio comunicador)
  if(!v19St('antena')&&F.walkie&&G.time>240&&!G.ev.silent){G.ev.v19osni=(G.ev.v19osni||0)+dt;if(G.ev.v19osni>40&&!CUT.on&&evOK(30)){evMark();v19Start('antena',true);AU.radio();
    bark('osni','n','Alguém na escuta? Aqui é o Osni, radioamador, do último andar do Edifício Pôr do Sol, lá na Brava. Câmbio.',{radio:true});
    later(5500,()=>bark('osni','t','A minha antena tá mal-ligada e eu não consigo descer. Quem estiver perto, o amplificador fica na entrada. Câmbio.',{radio:true}));
    later(9000,()=>toast('Missão secundária: '+V19MI.antena.n+'. Leve uma pilha.'));}}
  // a drogaria: os zumbis aparecem quando você chega perto
  if(v19St('farmacia')===1&&LM.farmacia){const st=v19S('farmacia'),L=LM.farmacia,d=hyp(P.x-L.x,P.y-L.y);
    if(!V19T.farm&&!st.lim&&d<520){V19T.farm=[];const n=Math.max(2,6-(st.k|0));for(let i=0;i<n;i++){const [x,y]=freeTileNear(((L.x/TILE)|0)+ri(-3,3),((L.y/TILE)|0)+ri(-4,-1),true);const e=makeEnemy(i===0?'corr':'zumbi',tc(x),tc(y),null);e.v19='farm';enemies.push(e);V19T.farm.push(e);}}
    if(V19T.farm&&!st.lim){const vivos=V19T.farm.filter(e=>e.alive).length;st.k=6-vivos;if(!vivos){st.lim=1;toast('A drogaria está limpa. Volte e fale com o Seu Haroldo.');}}}
  // escolta
  if(v19St('escolta')===1){const n=npcs.find(n=>n.v19==='escolta'),st=v19S('escolta');
    if(n&&st.f){if(!V19T.esc){V19T.esc=1;if(hyp(n.x-P.x,n.y-P.y)>300){const p=v19Spot(((P.x+40)/TILE)|0,(P.y/TILE)|0);n.x=p.x;n.y=p.y;}}
      const pr=enemies.some(e=>e.alive&&hyp(e.x-n.x,e.y-n.y)<140);
      if(pr){G.ev.v19arl=(G.ev.v19arl||0)-dt;if(G.ev.v19arl<=0){G.ev.v19arl=6;bark('arlindo','t',pick2(['Rapaz! Tem um ali!','Ai, meu coração...','Não deixa ele chegar perto de mim!']));}}
      else v19Follow(n,dt,54,95);
      const c=V19P.clinicaBrava; if(c&&hyp(n.x-c.x,n.y-c.y)<120&&!CUT.on){st.f=0;
        playCut([{npc:n,id:'arlindo'},{say:'arlindo',m:'h',t:'A clínica... Tem luz lá dentro. Obrigado, rapaz. Tu é um bom menino.'},{say:'rafa',m:'n',t:'Bate na porta e fala que foi o Richard que trouxe.'}],()=>v19Done('escolta',V19REW.escolta));}}}
}

// ---------- EVENTOS ALEATÓRIOS ----------
const V19EV=['caixa','radio','pisca','telefone','cinza','amarrado','saqueador','musica','fita'];
const V19EVN={caixa:'Caixa de suprimentos',radio:'Transmissão da Rádio Maré',pisca:'Luzes piscando',telefone:'Telefone tocando',cinza:'Chuva de cinza',amarrado:'Zumbi amarrado',saqueador:'Saqueador',musica:'Caixa de som ligada',fita:'Fita da câmera'};
function v19Blocked(){
  if(G.mode!=='play'||CUT.on)return true;
  if(typeof MP!=='undefined'&&MP.on)return true;
  if(typeof FB!=='undefined'&&FB.on)return true;
  if(G.flags.cap||G.cap||G.flags.capOn||(G.ev&&G.ev.cap))return true;
  if(G.wave>0||G.heli||G.flags.radio||G.struggle||G.qte||P.inCar||P.hidden||inSafe())return true;
  if(G.ev&&(G.ev.silent||G.ev.uniWave||G.ev.posto))return true;
  if(typeof inSew==='function'&&inSew())return true;
  return false;
}
function v19Obj(o){o.gone=false;V19E.objs.push(o);return o;}
function v19EvEnd(){V19E.cur=null;V19E.objs=V19E.objs.filter(o=>o.keep&&!o.gone);}
function v19Outdoor(minD,maxD){const sp=evSpot(minD,maxD,null,false);return sp&&bOfXY(sp.x,sp.y)<0?sp:null;}
function v19FarSpot(minD,maxD){for(let i=0;i<60;i++){const a=Math.random()*6.283,d=rr(minD,maxD),tx=((P.x+Math.cos(a)*d)/TILE)|0,ty=((P.y+Math.sin(a)*d)/TILE)|0;if(!inb(tx,ty))continue;const k=idx(tx,ty);if(SOLID[map[k]]||!reach[k]||safeMask[k])continue;if(inZone()!==(ty>=ZY))continue;return {x:tc(tx),y:tc(ty),a};}return null;}
function v19Dir(x,y){const a=Math.atan2(y-P.y,x-P.x),i=Math.round(a/(Math.PI/4));return ['a leste','a sudeste','ao sul','a sudoeste','a oeste','a noroeste','ao norte','a nordeste'][(i+8)%8];}
function v19Zs(x,y,n,type){let k=0;for(let i=0;i<n*3&&k<n;i++){const a=Math.random()*6.283,d=rr(180,280),tx=((x+Math.cos(a)*d)/TILE)|0,ty=((y+Math.sin(a)*d)/TILE)|0;if(!inb(tx,ty))continue;const q=idx(tx,ty);if(SOLID[map[q]]||!reach[q]||safeMask[q])continue;const e=makeEnemy(type||'zumbi',tc(tx),tc(ty),null);e.state='investigate';e.nx=x;e.ny=y;e.it=20;enemies.push(e);k++;}return k;}
const V19LOOT=[['m9',12],['ervaV',1],['pilha',1],['cart',5],['polv',1],['spray',1],['gran',1],['m357',4]];
function v19Loot(n){const got=[];for(let i=0;i<n;i++){const [id,q]=pick2(V19LOOT);v19Give(id,q);got.push(ITEMS[id].n+(q>1?' ×'+q:''));}return got.join(', ');}

const V19START={
  caixa(){const sp=v19Outdoor(240,420);if(!sp)return false;
    const o=v19Obj({x:sp.x,y:sp.y,lab:'Abrir a caixa de suprimentos',fall:3.2,draw:'caixa',use(){if(o.fall>0)return;o.gone=true;AU.creak(.5);toast('Caixa da Defesa Civil: '+v19Loot(3)+'.');v19EvEnd();}});
    V19E.cur={k:'caixa',life:150,o}; AU.tn(80,70,3,'sawtooth',.03); bark('rafa','s','Um avião... largou alguma coisa de paraquedas. Ali!'); return true;},
  radio(){if(!G.flags.walkie)return false;const sp=v19FarSpot(520,900);if(!sp)return false;
    const o=v19Obj({x:sp.x,y:sp.y,lab:'Pegar a mochila da Rádio Maré',draw:'mochila',use(){o.gone=true;toast('Na mochila: '+v19Loot(2)+'. E um bilhete: "Força, Balneário."');v19EvEnd();}});
    V19E.cur={k:'radio',life:400,o}; AU.radio(); const dir=v19Dir(sp.x,sp.y);
    bark('locutor','n','...Rádio Maré, 98.3. Se você está ouvindo, não está sozinho. Nossa equipe deixou mantimentos numa mochila laranja.',{radio:true});
    later(6000,()=>bark('locutor','n',`Pelo sinal do teu rádio, a mochila ficou ${dir} de onde você está. Pouco mais de quinhentos metros. Boa sorte.`,{radio:true}));
    later(11000,()=>toast(`Mochila da rádio: ${dir} daqui.`)); return true;},
  pisca(){if(G.inB<0)return false;V19E.cur={k:'pisca',life:6,t:0,step:0};AU.static(.3,.4);bark('rafa','t','As luzes... tão piscando.');return true;},
  telefone(){let sp=null;for(let i=0;i<60&&!sp;i++){const a=Math.random()*6.283,d=rr(200,420),tx=((P.x+Math.cos(a)*d)/TILE)|0,ty=((P.y+Math.sin(a)*d)/TILE)|0;if(!inb(tx,ty))continue;const k=idx(tx,ty);if(SOLID[map[k]]||!reach[k]||safeMask[k]||bmap[k]<0)continue;const b=buildings[bmap[k]];if(b&&(b.safe||b.big))continue;sp={x:tc(tx),y:tc(ty)};}
    if(!sp)return false;
    const o=v19Obj({x:sp.x,y:sp.y,lab:'Atender o telefone',draw:'fone',use(){o.gone=true;v19Fone(o);}});
    V19E.cur={k:'telefone',life:50,o,ring:0}; later(900,()=>bark('rafa','s','Um telefone tocando. Telefone fixo. Num prédio vazio.')); return true;},
  cinza(){if(inZone()&&G.inB>=0)return false;V19E.cur={k:'cinza',life:70,t:0};G.ev.v19cinza=70;bark('rafa','s','Isso é... cinza? Tá chovendo cinza. É dos prédios queimando.');return true;},
  amarrado(){const sp=v19Outdoor(220,360);if(!sp)return false;
    const o=v19Obj({x:sp.x,y:sp.y,lab:'Ler o bilhete pregado nele',draw:'amarrado',lido:false,use(){
      if(!o.lido){o.lido=true;o.lab='Acabar com o sofrimento dele';AU.creak(.3);
        return playCut([{say:'rafa',m:'t',think:true,t:'"Esse é o Jair, meu marido. Eu não tive coragem. Se você tiver, faz por mim. Deixei as coisas dele no bolso. — M."',dur:4.2},{say:'rafa',m:'s',think:true,t:'Ele ainda tá de aliança.'}]);}
      o.gone=true;AU.thud(1);G.shake+=3;addDecal({k:'corpse',x:o.x,y:o.y,rot:Math.random()*6.28,type:'zumbi',col:'#4a5a6a',skin:'#a8b0a0',r:11});addDecal({k:'blood',x:o.x,y:o.y,r:18,rot:0,seed:Math.random()});
      toast('No bolso dele: '+v19Loot(2)+'.');bark('rafa','s','Descansa, Jair.');v19EvEnd();}});
    V19E.cur={k:'amarrado',life:240,o,gr:0}; EV.seen.push({x:sp.x,y:sp.y,t:'Tem um deles amarrado no poste. Com corda de varal.'}); return true;},
  saqueador(){if(G.inB>=0)return false;const sp=v19Outdoor(260,360);if(!sp)return false;V19E.cur={k:'saqueador',life:60,s:{x:sp.x,y:sp.y,ang:0,walk:0,fase:0}};return true;},
  musica(){const sp=v19Outdoor(220,380);if(!sp)return false;
    const o=v19Obj({x:sp.x,y:sp.y,lab:'Desligar a caixa de som',draw:'som',use(){o.gone=true;AU.unlock();v19Give('pilha',1);toast('Caixa de som de bluetooth, com 12% de bateria. Você tirou a pilha dela.');v19EvEnd();}});
    V19E.cur={k:'musica',life:45,o,n:0,b:0}; later(1200,()=>bark('rafa','a','Quem é que deixa uma caixa de som tocando AGORA? Isso vai chamar todos eles.')); return true;},
  fita(){const sp=v19Outdoor(140,280);if(!sp)return false;
    const o=v19Obj({x:sp.x,y:sp.y,lab:'Ver a fita da câmera',draw:'fita',use(){o.gone=true;AU.static(.4,.6);
      playCut([{say:'rafa',m:'n',think:true,t:'Uma câmera de mão. A fita ainda tá dentro. REC, 23:12, do dia do surto.'},
        {say:'rafa',m:'t',think:true,t:'"...Gravando! Olha a Atlântica, amor, tá todo mundo correndo. Deve ser briga. Não, olha, ele tá... ele mordeu o..."'},
        {say:'rafa',m:'s',think:true,t:'Depois só o chão. E alguém respirando perto do microfone. A fita acaba.'}],
        ()=>{toast('Na bolsa da câmera: '+v19Loot(1)+'.');});v19EvEnd();}});
    V19E.cur={k:'fita',life:200,o}; return true;},
};
function v19Fone(o){const r=Math.random();
  if(r<.34)return playCut([{say:'rafa',m:'t',t:'...Alô?'},{say:'rafa',m:'s',think:true,t:'"Mãe? Mãe, é tu? Eu tô no Bloco 6, tem gente batendo na porta, mãe, vem me buscar..."'},{say:'rafa',m:'t',think:true,t:'Caiu. Era uma gravação na secretária eletrônica. Repetindo.'}],()=>{v19Give('ervaV',1);toast('Do lado do telefone: uma erva verde num pote de vidro.');v19EvEnd();});
  if(r<.67)return playCut([{say:'rafa',m:'t',t:'Alô?'},{say:'rafa',m:'s',think:true,t:'"...unidade sete, confirma código âmbar no setor Barra Sul. Vértice, câmbio." Desligaram.'},{say:'rafa',m:'a',think:true,t:'Eles ainda estão contando quem tá vivo.'}],()=>{granaAdd(80);toast('Na gaveta embaixo do telefone: '+brl(80)+'.');v19EvEnd();});
  playCut([{say:'rafa',m:'t',t:'Alô?'},{say:'rafa',m:'k',think:true,t:'Só respiração. Respiração molhada. E ela tá vindo do quarto, não do telefone.'}],()=>{const e=makeEnemy('zumbi',o.x+rr(-30,30),o.y+rr(-30,30),null);const [x,y]=freeTileNear((e.x/TILE)|0,(e.y/TILE)|0,true);e.x=tc(x);e.y=tc(y);e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);AU.sting();G.shake+=4;v19EvEnd();});
}
function v19Saq(c,dt){const s=c.s,d=hyp(P.x-s.x,P.y-s.y);
  if(s.fase===0){const a=Math.atan2(P.y-s.y,P.x-s.x);s.ang=a;const nx=s.x+Math.cos(a)*90*dt,ny=s.y+Math.sin(a)*90*dt;if(!SOLID[getT((nx/TILE)|0,(ny/TILE)|0)]){s.x=nx;s.y=ny;}s.walk+=dt*7;s.moving=true;
    if(d<70&&!CUT.on){s.fase=1;s.moving=false;const g=grana(),armed=P.owned.slice(0,8).some(x=>x),pede=Math.max(50,Math.round(g*.3/10)*10);
      CUT.actors.saq=s;
      if(g<=0)return playCut([{say:'saq',m:'a',t:'Ô, parceiro. Devagar. Passa o dinheiro.'},{say:'rafa',m:'n',t:'Que dinheiro?'},{say:'saq',m:'s',t:'...Nem dinheiro tu tem. Some daqui, vai.'}],()=>{s.fase=2;});
      playCut([{say:'saq',m:'a',t:'Ô, parceiro. Devagar. Mão onde eu possa ver.'},{say:'saq',m:'a',t:`Passa ${brl(pede)} e ninguém se machuca. Hoje todo mundo tá fazendo o que pode.`},
        {choice:[{t:`Dar ${brl(pede)}.`,then:[{do:()=>{granaAdd(-pede);}},{say:'saq',m:'n',t:'Valeu. Sem ressentimento. Boa sorte aí.'}]},
          {t:'Nem pensar.',then:armed?[{say:'rafa',m:'a',t:'Eu tô armado. Tu não tá.'},{say:'saq',m:'t',t:'Tá, tá! Calma! Eu já tô indo!'},{do:()=>{if(Math.random()<.6){dropAt(s.x,s.y,'pecas',1);toast('Ele derrubou alguma coisa correndo.');}}}]:
            [{say:'saq',m:'a',t:'Então vai ser do jeito difícil.'},{do:()=>{hurtPlayer(14,s.x,s.y);const lv=Math.min(grana(),Math.round(pede*.7));granaAdd(-lv);toast(`Ele te deu um soco e levou ${brl(lv)}.`);}}]}]}],()=>{s.fase=2;});}
    if(c.life<5)s.fase=2; return;}
  if(s.fase===2){const a=Math.atan2(s.y-P.y,s.x-P.x);s.ang=a;s.x+=Math.cos(a)*170*dt;s.y+=Math.sin(a)*170*dt;s.walk+=dt*10;s.moving=true;if(d>700){v19EvEnd();}}
}
function v19EvTick(dt){
  const c=V19E.cur;
  if(G.ev&&G.ev.v19cinza>0)G.ev.v19cinza-=dt;
  if(c){c.life-=dt;
    if(c.k==='caixa'&&c.o.fall>0){c.o.fall-=dt;if(c.o.fall<=0){AU.thud(1);G.shake+=4;alertNoise(c.o.x,c.o.y,520);v19Zs(c.o.x,c.o.y,3);}}
    if(c.k==='pisca'){c.t+=dt;G.flick=Math.max(G.flick||0,Math.random()<.5?.12:0);if(c.t>2.2&&!c.step){c.step=1;G.flick=.6;
      let ok=false;for(let i=0;i<20&&!ok;i++){const a=P.ang+Math.PI+rr(-.8,.8),d=rr(60,110),tx=((P.x+Math.cos(a)*d)/TILE)|0,ty=((P.y+Math.sin(a)*d)/TILE)|0;if(!inb(tx,ty))continue;const k=idx(tx,ty);if(SOLID[map[k]]||safeMask[k]||!los(P.x,P.y,tc(tx),tc(ty)))continue;
        const e=makeEnemy('zumbi',tc(tx),tc(ty),null);e.state='chase';e.lx=P.x;e.ly=P.y;enemies.push(e);ok=true;}
      AU.sting();AU.groan({x:P.x,y:P.y},1);later(700,()=>bark('rafa','k','ATRÁS DE MIM!'));}}
    if(c.k==='telefone'&&!c.o.gone){c.ring-=dt;if(c.ring<=0){c.ring=2.6;const v=clamp(1-hyp(c.o.x-P.x,c.o.y-P.y)/700,.15,1);for(let i=0;i<2;i++){AU.tn(880,880,.35,'square',.03*v,i*.45);AU.tn(1100,1100,.35,'square',.02*v,i*.45);}psyFloat(c.o.x,c.o.y,'(trim, trim)',{life:1.6,c:'#e8e0c8'});}}
    if(c.k==='musica'&&!c.o.gone){c.b-=dt;c.n-=dt;if(c.b<=0){c.b=.42;const f=pick2([330,392,440,494,523]);AU.tn(f,f,.3,'triangle',.05*clamp(1-hyp(c.o.x-P.x,c.o.y-P.y)/800,.1,1));AU.tn(82,60,.18,'sine',.08);}
      if(c.n<=0){c.n=3;alertNoise(c.o.x,c.o.y,460);}}
    if(c.k==='amarrado'&&!c.o.gone){c.gr-=dt;if(c.gr<=0){c.gr=rr(4,7);if(hyp(c.o.x-P.x,c.o.y-P.y)<500)AU.groan({x:c.o.x,y:c.o.y},.5);}if(hyp(c.o.x-P.x,c.o.y-P.y)>1600)v19EvEnd();}
    if(c.k==='saqueador')v19Saq(c,dt);
    if(V19E.cur&&V19E.cur.life<=0){if(c.k==='musica'&&!c.o.gone)toast('A música parou. A bateria da caixa acabou.');if(c.k==='telefone'&&!c.o.gone)toast('O telefone parou de tocar.');v19EvEnd();}
    return;}
  if(v19Blocked())return;
  V19E.t-=dt; if(V19E.t>0)return;
  V19E.t=rr(160,260);
  if(typeof evOK==='function'&&!evOK(60)){V19E.t=30;return;}
  if(enemies.some(e=>e.alive&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<420)){V19E.t=20;return;}
  const night=isNight(), W8=[['caixa',6],['radio',G.flags.walkie?6:0],['pisca',G.inB>=0?9:0],['telefone',G.inZ?0:6],['cinza',G.flags.caos||night?5:2],['amarrado',5],['saqueador',G.inB<0?5:0],['musica',night?6:4],['fita',5]];
  let tot=0;for(const [,w] of W8)tot+=w;let r=Math.random()*tot,k=null;for(const [kk,w] of W8){r-=w;if(r<=0){k=kk;break;}}
  if(k&&v19EvStart(k)&&typeof evMark==='function')evMark(); else V19E.t=25;
}
function v19EvStart(k){if(V19E.cur)v19EvEnd();V19E.objs=V19E.objs.filter(o=>!o.gone);const f=V19START[k];if(!f)return false;try{return !!f();}catch(e){console.error(e);V19E.cur=null;return false;}}

// ---------- desenho ----------
function v19DrawDog(d){ctx.save();ctx.translate(d.x,d.y);ctx.rotate(d.ang||0);const w=Math.sin(d.walk||0)*2;
  ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(0,3,13,6,0,0,6.283);ctx.fill();
  ctx.fillStyle='#c8904a';ctx.fillRect(-11,-4,18,9);ctx.fillRect(-9+w,-6,3,13);ctx.fillRect(3-w,-6,3,13);
  ctx.beginPath();ctx.arc(9,0,5,0,6.283);ctx.fill();ctx.fillStyle='#a8703a';ctx.fillRect(10,-6,3,3);ctx.fillRect(10,3,3,3);
  ctx.fillStyle='#c8261e';ctx.fillRect(5,-4,2,8);ctx.strokeStyle='#c8904a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-11,0);ctx.lineTo(-16,Math.sin(G.time*14)*3);ctx.stroke();ctx.restore();}
function v19Tag(x,y,t,c){ctx.font=`700 10px ${FONT_UI}`;ctx.textAlign='center';const w=ctx.measureText(t).width+8;ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(x-w/2,y-11,w,13);ctx.fillStyle=c||'#e8d8a8';ctx.fillText(t,x,y-1);}
function v19DrawWorld(){
  const F=G.flags;
  // marca em cima de quem tem missão
  for(const n of npcs){if(!n.v19||(n.cond&&!n.cond())||!inV(n.x,n.y,60))continue;const s=v19St(n.v19);if(s===2)continue;
    const pronto=v19Ready(n.v19); if(s===1&&!pronto)continue; v19Tag(n.x,n.y-32,s?'!':'?',s?'#e8c050':'#d8d0b8');}
  if(V19T.dog&&inV(V19T.dog.x,V19T.dog.y,40))v19DrawDog(V19T.dog);
  const n=npcs.find(n=>n.v19==='escolta'); if(n&&n.moving){n.walk=(n.walk||0);}
  for(const o of v19Points()){if(!inV(o.x,o.y,80))continue;
    if(o.draw==='caixa'){const h=o.fall>0?o.fall*60:0;ctx.fillStyle='rgba(0,0,0,.35)';ctx.beginPath();ctx.ellipse(o.x,o.y+6,14*(1-h/240),6,0,0,6.283);ctx.fill();
      if(h>0){ctx.strokeStyle='rgba(230,230,220,.7)';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(o.x-12,o.y-h-6);ctx.lineTo(o.x-22,o.y-h-40);ctx.moveTo(o.x+12,o.y-h-6);ctx.lineTo(o.x+22,o.y-h-40);ctx.stroke();ctx.fillStyle='#d86a20';ctx.beginPath();ctx.ellipse(o.x,o.y-h-44,26,10,0,Math.PI,0);ctx.fill();}
      ctx.fillStyle='#6a5a3a';ctx.fillRect(o.x-12,o.y-h-10,24,18);ctx.strokeStyle='#3a2e1c';ctx.lineWidth=2;ctx.strokeRect(o.x-12,o.y-h-10,24,18);ctx.fillStyle='#d8c890';ctx.fillRect(o.x-8,o.y-h-4,16,5);
      if(h<=0)v19Tag(o.x,o.y-20,'DEFESA CIVIL','#e8a050');}
    else if(o.draw==='mochila'){ctx.fillStyle='#d86a20';ctx.fillRect(o.x-7,o.y-8,14,16);ctx.fillStyle='#8a3a10';ctx.fillRect(o.x-5,o.y-2,10,6);if(hyp(o.x-P.x,o.y-P.y)<200)v19Tag(o.x,o.y-16,'MOCHILA');}
    else if(o.draw==='fone'){ctx.fillStyle='#1a1a1a';ctx.fillRect(o.x-6,o.y-4,12,8);ctx.fillStyle='#c8261e';if(Math.sin(G.time*12)>0)ctx.fillRect(o.x-2,o.y-8,4,3);}
    else if(o.draw==='som'){ctx.fillStyle='#202024';ctx.fillRect(o.x-9,o.y-6,18,12);ctx.fillStyle=`rgba(80,160,255,${.5+.5*Math.sin(G.time*8)})`;ctx.fillRect(o.x-7,o.y+4,14,2);ctx.fillStyle='#3a3a40';ctx.beginPath();ctx.arc(o.x-4,o.y,3,0,6.283);ctx.arc(o.x+4,o.y,3,0,6.283);ctx.fill();}
    else if(o.draw==='fita'){ctx.fillStyle='#2a2a2e';ctx.fillRect(o.x-8,o.y-5,16,10);ctx.fillStyle='#c8261e';ctx.fillRect(o.x+5,o.y-4,2,2);}
    else if(o.draw==='amarrado'){ctx.fillStyle='#5a4a3a';ctx.fillRect(o.x-3,o.y-26,6,40);const sw=Math.sin(G.time*3)*.25;drawHuman(o.x,o.y+4,Math.PI/2+sw,{coat:'#4a5a6a',skin:'#a8b0a0',hair:'#3a3632',pants:'#22201c'});
      ctx.strokeStyle='#d8d4c0';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(o.x-10,o.y-2);ctx.lineTo(o.x+10,o.y+2);ctx.moveTo(o.x-10,o.y+6);ctx.lineTo(o.x+10,o.y+10);ctx.stroke();ctx.fillStyle='#e8e4d8';ctx.fillRect(o.x-5,o.y-14,10,7);}
    else if(o.lab&&hyp(o.x-P.x,o.y-P.y)<220){ctx.strokeStyle='rgba(232,192,80,.8)';ctx.lineWidth=2;ctx.beginPath();ctx.arc(o.x,o.y,10+Math.sin(G.time*4)*2,0,6.283);ctx.stroke();}}
  const c=V19E.cur; if(c&&c.k==='saqueador'&&inV(c.s.x,c.s.y,60))drawHuman(c.s.x,c.s.y,c.s.ang,{coat:'#3a3a2a',skin:'#b88a68',hair:'#1a1410',pants:'#22201c',walk:c.s.walk,moving:c.s.moving,legAng:c.s.ang});
}
function v19Ready(id){const st=v19S(id);if(st.s!==1)return false;
  if(id==='insulina')return invCount('insulina')>0; if(id==='farmacia')return !!st.lim; if(id==='gerador')return invCount('galao')>=5;
  if(id==='cachaca')return invCount('cachaca')>0; if(id==='vinil')return invCount('vinil')>=3; if(id==='fotos')return (st.fotos||[]).length>=3;
  if(id==='pipoca')return !!(V19T.dog&&V19T.dog.f); return false;}
function v19DrawAsh(){if(!(G.ev&&G.ev.v19cinza>0)||G.mode!=='play')return;ctx.setTransform(dpr,0,0,dpr,0,0);const a=clamp(G.ev.v19cinza/8,0,1)*clamp((70-G.ev.v19cinza)/6,0,1);
  ctx.fillStyle=`rgba(90,84,78,${.14*a})`;ctx.fillRect(0,0,view.w,view.h);ctx.fillStyle=`rgba(200,196,188,${.55*a})`;
  for(let i=0;i<70;i++){const s=i*97.13,x=((s*13.7+G.time*(14+i%5*4))%(view.w+40))-20,y=((s*7.3+G.time*(36+i%7*6))%(view.h+40))-20;ctx.fillRect(x,y,2+(i%3),2);}}

// ---------- rumo da missão seguida (só quando a história não aponta pra lugar nenhum) ----------
function v19Target(id){const st=v19S(id),F=G.flags,P_=V19P;
  const npc=()=>{const n=npcs.find(n=>n.v19===id);return n?{x:n.x,y:n.y}:null;};
  if(v19Ready(id)||id==='escolta'&&st.f)return id==='escolta'?P_.clinicaBrava:npc();
  const pk=itid=>{const p=pickups.find(p=>p.id===itid&&String(p.uid).startsWith('v19_'));return p?{x:p.x,y:p.y}:null;};
  switch(id){case 'pipoca':return V19T.dog?{x:V19T.dog.x,y:V19T.dog.y}:P_.dog;case 'insulina':return pk('insulina');case 'antena':return P_.antena;case 'farmacia':return LM.farmacia;
    case 'carta':return npc();case 'prancha':return pk('prancha');case 'barco':return pk('chaveBarco');case 'gerador':return pk('galao');case 'cachaca':return pk('cachaca');case 'vinil':return pk('vinil');
    case 'fotos':{for(const [k] of V19FOTOS)if(!(st.fotos||[]).includes(k))return P_['foto_'+k];return npc();}case 'escolta':return npc();}
  return null;}
function v19Hint(id){const st=v19S(id),q=it=>invCount(it);
  if(v19Ready(id))return 'Volte e fale com '+(PCH[V19MI[id].npc]||{}).name+'.';
  return {pipoca:'Procure o Pipoca no cemitério, perto do Ruth Cardoso.',insulina:'Cozinha do Hotel Atlântida, no frigobar.',antena:'Amplificador na entrada do Edifício Pôr do Sol, na Brava. Leve uma pilha.',
    farmacia:`Limpe a drogaria: ${st.k|0} de 6.`,carta:'Entregue a carta para a Jurema, na Colônia Z-7 (Laranjeiras).',prancha:'A prancha ficou no mirante do Morro do Careca.',barco:'A chave está na última casa da rua, perto do Corpo de Bombeiros.',
    gerador:`Galões: ${q('galao')} de 5.`,cachaca:`Garrafas entregues: ${st.n|0} de 4.`,vinil:`Discos: ${q('vinil')} de 3.`,fotos:`Fotos: ${(st.fotos||[]).length} de 3.`,escolta:st.f?'Leve o Seu Arlindo até a Clínica da Brava.':'Volte pro Mercado da Brava e chame o Seu Arlindo.'}[id]||'';}
{const ob=objective; objective=function(){const o=ob();
  try{if(!o||o.at||(typeof inCb==='function'&&inCb())||(typeof inZone==='function'&&inZone()&&G.flags.uniDone===false)||G.heli||G.flags.radio||G.wave>0||/\d+ s\b/.test(o.t||'')||/^(Sobreviva|Segure|Aguente|Defenda|CORRE|Corra|Fuja|VAZAMENTO|Pavio|Derrube|Escape)/i.test(o.t||'')||(G.flags.brFight&&!G.flags.brandtDone)||(G.ev&&(G.ev.uniWave||G.ev.fuse||G.ev.chase))||(typeof FB!=='undefined'&&FB.on)||(typeof MP!=='undefined'&&MP.on))return o;
    const id=G.flags.v19seg; if(!id||v19St(id)!==1)return o; const t=v19Target(id); if(!t)return o;
    return Object.assign({},o,{t:(o.t?o.t+' · ':'')+V19MI[id].n+': '+v19Hint(id),at:t});}catch(e){return o;}};}

// ---------- tela de missões (no menu de pausa) ----------
UI.v19m=function(){
  const rows=V19M.map(m=>{const s=v19St(m.id);
    if(!s)return `<div class="lrow"><span class="ln"><b>???</b><small>Ainda não encontrada. Fale com quem você encontrar pela cidade.</small></span></div>`;
    const seg=G.flags.v19seg===m.id;
    return `<div class="lrow"><span class="ln"><b>${esc(m.n)}${s===2?' · concluída':''}</b><small>${esc(m.onde)}${s===1?' · '+esc(v19Hint(m.id)):''}</small></span>${s===1?`<button class="btn mini${seg?' primary':''}" data-a="v19m-seg" data-k="${m.id}">${seg?'Seguindo':'Seguir'}</button>`:''}</div>`;}).join('');
  const n=V19M.filter(m=>v19St(m.id)===2).length;
  this.open(`<div class="sheet wide loja"><div class="tabs"><h2 style="margin-right:auto">Missões secundárias</h2><b class="lgrana">${n} de ${V19M.length}</b><button class="btn ghost" data-a="v19m-back">Voltar</button></div>
    <p class="hint">A missão seguida aparece na bússola só quando a história não está apontando pra nenhum lugar.</p><div class="lista">${rows}</div></div>`,'','v19m');
};
{const op=UI.open.bind(UI); UI.open=function(html,cls,name){if(name==='pause'&&typeof html==='string'&&!html.includes('data-a="v19m"')){const act=V19M.filter(m=>v19St(m.id)===1).length;
    html=html.replace('<button class="btn" data-a="controls2"',`<button class="btn" data-a="v19m">Missões${act?' ('+act+' ativas)':''}</button><button class="btn" data-a="controls2"`);}
  return op(html,cls,name);};}
{const act=UI.act.bind(UI); UI.act=function(a,ds){
  if(a==='v19m')return this.v19m();
  if(a==='v19m-seg'){G.flags.v19seg=ds.k;return this.v19m();}
  if(a==='v19m-back'){this.close();G.mode='play';return this.pause();}
  return act(a,ds);};}

// ---------- conquistas ----------
ACH.push({id:'pipoca',n:'Bom garoto',d:'Leve o Pipoca de volta para o Seu Valdir.'},{id:'v19cinco',n:'Vizinho de confiança',d:'Complete cinco missões secundárias.'},{id:'v19todas',n:'Defesa Civil honorária',d:'Complete todas as missões secundárias.'});

// ---------- ganchos ----------
(function(){
  const vt=v16Tick; v16Tick=function(dt){vt(dt);if(G.mode!=='play'||CUT.on||!dt)return;
    if((typeof MP!=='undefined'&&MP.on)||(typeof FB!=='undefined'&&FB.on))return;
    try{v19MissTick(dt);v19EvTick(dt);if(G.flags.v19dj&&!v19Blocked()){G.ev.v19dj=(G.ev.v19dj??rr(200,320))-dt;if(G.ev.v19dj<=0&&G.flags.walkie&&isNight()){G.ev.v19dj=rr(300,480);AU.radio();bark('tavinho','h',pick2(['Rádio Ressaca no ar. Se tu tá ouvindo, tu tá vivo. Segura a onda aí.','Essa vai pro parceiro da mochila, que trouxe os meus discos.','Fica no escuro, fica quieto e escuta essa. Ressaca Club, a noite toda.']),{radio:true});}}}catch(e){console.error(e);}};
  const dc=drawComps; drawComps=function(){dc();if(G.mode==='title')return;try{v19DrawWorld();}catch(e){}};
  const ds=drawPsy; drawPsy=function(){ds();try{v19DrawAsh();}catch(e){}};
  const rs=resetState; resetState=function(d){rs(d);V19T.dog=null;V19T.farm=null;V19T.esc=0;V19E.cur=null;V19E.objs=[];V19E.t=rr(100,160);};
})();

// ---------- menu de teste ----------
function v19Debug(k){
  if(k==='v19m:list')return UI.v19m();
  if(k==='v19m:all'){for(const m of V19M)v19Start(m.id,true);toast('Todas as missões começaram.');return;}
  if(k==='v19m:done'){for(const m of V19M)v19DoneProg(m.id);toast('Todas as missões concluídas.');return;}
  if(k==='v19m:reset'){G.flags.v19m={};G.flags.v19seg=null;V19T.dog=null;V19T.farm=null;toast('Missões zeradas.');return;}
  if(k&&k.startsWith('v19e:')){UI.close&&UI.cur&&UI.close();G.mode='play';const ok=v19EvStart(k.slice(5));toast(ok?'Evento: '+V19EVN[k.slice(5)]:'Esse evento não cabe aqui.');return ok;}
}
// completa uma missão pelo caminho dela (usado no teste e no menu): entrega os itens e chama a recompensa
function v19DoneProg(id){v19Start(id,true);const st=v19S(id);if(st.s===2)return;
  if(id==='cachaca'){st.n=4;}
  if(id==='fotos'){st.fotos=V19FOTOS.map(x=>x[0]);}
  v19Done(id,V19REW[id]);}
if(typeof dbgExtra==='function')dbgExtra('1.9 · Missões e eventos',[['v19m:list','Ver missões'],['v19m:all','Começar todas'],['v19m:done','Completar todas'],['v19m:reset','Zerar missões'],...V19EV.map(k=>['v19e:'+k,V19EVN[k]])],v19Debug);
