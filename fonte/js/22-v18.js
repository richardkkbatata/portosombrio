// ===================== 1.8 · O MASCATE · MODO HORDA · LEVANTAR O AMIGO · FRASES · PLACAR · MINIMAPA · MIRA ASSISTIDA =====================

// ---------- dinheiro ----------
ITEMS.grana={n:'Dinheiro',s:'R$',c:'#6a9a4a',st:99999,k:'key',d:'Notas amassadas e moedas. O Mascate aceita.'};
ITEMS.joia={n:'Joia',s:'JOIA',c:'#d8b84a',st:10,k:'treasure',d:'Aliança, relógio, corrente de ouro. Não serve pra nada aqui, mas o Mascate paga bem: R$ 500 cada.'};
MSZ.joia=[1,1];
const grana=()=>G.flags.grana|0;
function granaAdd(v){G.flags.grana=Math.max(0,grana()+Math.round(v));G.granaT=G.time;}
const brl=v=>'R$ '+String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g,'.');
function dropAt(x,y,id,q){const [tx,ty]=freeTileNear((x/TILE)|0,(y/TILE)|0,true);const p={uid:'d'+(G.dropN++),tx,ty,x:tc(tx),y:tc(ty),id,q,kind:'item'};pickups.push(p);pickOcc.add(idx(tx,ty));return p;}

// ---------- o Mascate: lojinha num carrinho, em alguns pontos da cidade ----------
const LOJA=[
  {g:'Munição',it:[{id:'m9',q:15,p:90},{id:'cart',q:6,p:130},{id:'m357',q:6,p:240},{id:'virote',q:6,p:110},{id:'comb',q:40,p:220},{id:'g40',q:2,p:280}]},
  {g:'Cura',it:[{id:'ervaV',q:1,p:80},{id:'ervaR',q:1,p:140},{id:'spray',q:1,p:320}]},
  {g:'Arremesso e outros',it:[{id:'gran',q:1,p:190},{id:'pilha',q:1,p:60},{faca:true,p:150}]},
  {g:'Armas',it:[{w:2,p:900},{w:3,p:1400},{w:7,p:1200},{w:4,p:2600},{w:5,p:3200},{w:6,p:3800}]},
  {g:'Melhorias',it:[{maleta:true,p:1500}]},
];
const VENDA={joia:500}; for(const g of LOJA)for(const e of g.it)if(e.id)VENDA[e.id]=Math.max(1,Math.floor(e.p/e.q*.5));
const MASC_LUG=[['coreto','no coreto'],['oficina','na Barra Sul'],['uniGuarita','na Universidade de BC'],['itajai','em Itajaí']];
function mascates(){
  if(G._mascLM!==LM){G._mascLM=LM;G._masc=[];
    for(const [k,onde] of MASC_LUG){const L=LM[k];if(!L)continue;const [x,y]=freeTileNear(((L.x/TILE)|0)+2,((L.y/TILE)|0)+2,true);G._masc.push({x:tc(x),y:tc(y),onde});lights.push({x:tc(x)+38,y:tc(y)-18,r:120,c:'fire',f:1});}}
  return G._masc.concat(G.mascTmp?[G.mascTmp]:[]);
}
const MASC_FALA=['E aí, parceiro! Tá precisando de quê?','Chega mais. Hoje tem de tudo, menos garantia.','Opa! Ainda vivo? Bom pra mim.','Dinheiro na mão, bala na agulha.'];
UI.loja=function(tab){
  this.lojaTab=tab||this.lojaTab||'c'; mSync();
  const g=grana(), row=(ico,n,sub,btn)=>`<div class="lrow"><span class="lico">${ico}</span><span class="ln"><b>${n}</b>${sub?`<small>${sub}</small>`:''}</span>${btn}</div>`;
  let body='';
  if(this.lojaTab==='c'){
    body=LOJA.map((gr,gi)=>`<h3>${gr.g}</h3>`+gr.it.map((e,ei)=>{const k=gi+':'+ei;let n,sub='',dis=g<e.p,ico='',why='';
      if(e.id){n=ITEMS[e.id].n+(e.q>1?' ×'+e.q:'');ico=iconHTML(e.id);sub=`você tem ${invCount(e.id)}`;}
      else if(e.w!=null){const w=WEAPONS[e.w];n=w.n;ico='<span class="lw">'+w.n.split(' ')[0].slice(0,4).toUpperCase()+'</span>';sub=w.ammo?'usa '+ITEMS[w.ammo].n.toLowerCase():'';if(P.owned[e.w]){dis=true;why='já tem';}}
      else if(e.faca){n='Faca nova';ico='<span class="lw">FACA</span>';sub=P.owned[0]&&P.dur>0?`a sua aguenta ${P.dur} golpes`:'você está sem faca';if(P.owned[0]&&P.dur>=30){dis=true;why='já está boa';}}
      else if(e.maleta){n='Maleta maior (+1 coluna)';ico='<span class="lw">+1</span>';sub=`hoje: ${G.mw||8}×${G.mh||6}`;if((G.mw||8)>=11){dis=true;why='no máximo';}}
      return row(ico,n,sub,`<button class="btn mini${dis?'':' primary'}" data-a="loja-c" data-k="${k}" ${dis?'disabled':''}>${why||brl(e.p)}</button>`);}).join('')).join('');
  } else {
    const seen=new Set(),rows=[];
    for(const s of G.inv){if(!s||seen.has(s.id)||!VENDA[s.id])continue;seen.add(s.id);const q=invCount(s.id);rows.push(row(iconHTML(s.id),ITEMS[s.id].n+' ×'+q,`${brl(VENDA[s.id])} cada`,`<button class="btn mini" data-a="loja-v" data-k="${s.id}" data-q="1">Vender 1</button>${q>1?`<button class="btn mini" data-a="loja-v" data-k="${s.id}" data-q="${q}">Tudo (${brl(VENDA[s.id]*q)})</button>`:''}`));}
    body=rows.join('')||'<p class="hint">Nada que ele compre. Joias valem R$ 500 cada; munição e cura ele paga a metade.</p>';
  }
  this.open(`<div class="sheet wide loja"><div class="tabs"><h2 style="margin-right:auto">O Mascate</h2><b class="lgrana">${brl(g)}</b><button class="btn ghost" data-a="close">Sair</button></div><p class="mfala">"${esc(this.lojaFala||MASC_FALA[0])}"</p>
    <div class="seg"><button data-a="loja-tab" data-k="c" class="${this.lojaTab==='c'?'on':''}">Comprar</button><button data-a="loja-tab" data-k="v" class="${this.lojaTab==='v'?'on':''}">Vender</button></div>
    <div class="lista">${body}</div></div>`,'','loja');
};
function lojaComprar(k){
  const [gi,ei]=String(k).split(':').map(Number),e=LOJA[gi]&&LOJA[gi].it[ei]; if(!e)return;
  if(grana()<e.p){AU.locked();return toast('Dinheiro não dá.');}
  if(e.id){const l=invAdd(e.id,e.q);
    if(l){if(MP.on||l===e.q){if(e.q-l>0)invRemove(e.id,e.q-l);AU.locked();return toast('Não cabe na maleta. Organize ou venda algo.');}
      boxAdd(e.id,l);toast('Não coube tudo na maleta: o resto foi pro baú.');}}
  else if(e.w!=null){if(P.owned[e.w])return;const s=WSZ[e.w];if(s&&!mCanAdd(s[0],s[1])){AU.locked();return toast('Não cabe na maleta. Organize, venda algo ou compre a maleta maior.');}
    P.owned[e.w]=true;P.mags[e.w]=WEAPONS[e.w].mag;mSync();}
  else if(e.faca){P.owned[0]=true;P.dur=Math.max(P.dur||0,30);mSync();}
  else if(e.maleta){if((G.mw||8)>=11)return;G.mw=(G.mw||8)+1;}
  granaAdd(-e.p);AU.pickup();UI.lojaFala=rpick(['Boa escolha.','Isso aí vai salvar teu couro.','Negócio fechado!','Volte sempre... se ainda estiver vivo.']);
}
function lojaVender(id,q){q=Math.min(q|0,invCount(id));if(q<=0||!VENDA[id])return;invRemove(id,q);granaAdd(VENDA[id]*q);AU.pickup();mSync();UI.lojaFala=id==='joia'?'Opa, isso aí vale uma grana!':'Fica comigo.';}

// dinheiro cai dos inimigos (no solo e no anfitrião; o convidado nunca mata nada sozinho)
{const ke=killEnemy; killEnemy=function(e){
  const was=e&&e.alive&&!e.ghost; const r=ke.apply(this,arguments);
  if(was&&!e.alive&&!(MP.on&&MP.role==='guest')){
    if(MP.on&&MP.role==='host'&&MP.stats){const id=MP.creditId||'0';const s=MP.stats[id];if(s)s.k++;}
    const boss=e.t.boss||e.type==='boss'||e.type==='pers'||e.type==='bombeiro', big=e.max>=200;
    const ch=MP.on&&MP.modo==='horda'?.6:MP.on?.5:.3;
    if(boss)dropAt(e.x,e.y,'grana',ri(300,600));
    else if(big||Math.random()<ch)dropAt(e.x+rr(-6,6),e.y+rr(-6,6),'grana',big?ri(50,110):ri(8,26));
    if(!boss&&Math.random()<.03)dropAt(e.x,e.y,'joia',1);
  }
  return r;};}
// pegar dinheiro não ocupa espaço
{const tp=takePickup; takePickup=function(p){
  if(p&&p.id==='grana'){granaAdd(p.q);G.taken.add(p.uid);pickups=pickups.filter(x=>x!==p);pickOcc.delete(idx(p.tx,p.ty));AU.pickup();toast('+'+brl(p.q));
    if(MP.on&&p.uid)mpSend({t:'take',u:p.uid});return;}
  return tp.apply(this,arguments);};}

// ---------- prompts: Mascate e levantar amigo ----------
{const fi=findInteract; findInteract=function(){
  let best=fi();
  if(P.inCar||P.hidden)return best;
  if(MP.on&&best&&(best.k==='npc'||(best.k==='pick'&&(best.o.kind==='file'||best.o.kind==='walkie'||(best.o.kind==='item'&&ITEMS[best.o.id]&&ITEMS[best.o.id].k==='key'&&best.o.id!=='grana')))))best=null;
  // levantar amigo caído ganha de tudo; o Mascate só ganha de outro aviso se estiver bem pertinho
  if(MP.on&&!(P.mpDown>0)){let bd=56,rv=null;for(const [id,r] of Object.entries(MP.remote||{})){if(r.hp>0||r.x==null)continue;const d=hyp(r.x-P.x,r.y-P.y);if(d<bd){bd=d;rv={k:'mprev',o:{id,r}};}}if(rv)return rv;}
  let bd=best?22:52;
  for(const m of mascates()){const d=hyp(m.x-P.x,m.y-P.y)-6;if(d<bd){bd=d;best={k:'masc',o:m};}}
  return best;};}
{const pt=promptText; promptText=function(pr){if(pr&&pr.k==='masc')return 'Falar com o Mascate';if(pr&&pr.k==='mprev')return `Levantar ${pr.o.r.apelido||'amigo'} (segure)`;return pt(pr);};}
{const di=doInteract; doInteract=function(){const pr=G.prompt;
  if(pr&&pr.k==='masc'){UI.lojaFala=rpick(MASC_FALA);if(!G.flags.mascVisto){G.flags.mascVisto=true;}return UI.loja('c');}
  if(pr&&pr.k==='mprev'){MP.rev={id:pr.o.id,t:0};return;}
  return di();};}

// ---------- multiplayer: estatísticas, levantar, frases ----------
const FRASES=[['Socorro!','KeyZ','Z'],['Preciso de munição!','KeyX','X'],['Vem aqui!','KeyV','V'],['Chefão!','KeyB','B']];
function mpStat(id){const s=MP.stats||(MP.stats={});return s[id]||(s[id]={k:0,d:0,r:0,dmg:0});}
function mpSay(i){if(!MP.on||G.mode!=='play'||!FRASES[i])return;const m={t:'say',k:i,id:MP.myId,x:P.x|0,y:P.y|0};mpShowSay(m);mpSend(m);}
function mpShowSay(m){const nome=m.id===MP.myId?(MP.me&&MP.me.apelido)||'Você':((MP.roster[m.id]||{}).apelido||'?');
  (MP.says||(MP.says={}))[m.id]={k:m.k,t:3}; (MP.pings||(MP.pings=[])).push({x:m.x,y:m.y,k:m.k,t:6,c:m.id===MP.myId?(MP.me&&MP.me.cor):(MP.roster[m.id]||{}).cor});
  if(m.id!==MP.myId){toast(`${nome}: ${FRASES[m.k][0]}`);buzz&&buzz(20);}AU.click();}
function mpRevived(by){if(!(P.mpDown>0))return;P.mpDown=0;P.hp=50;P.inv=2;const n=by==='0'||MP.roster[by]?(MP.roster[by]||{}).apelido||'Alguém':'Alguém';toast(`${n} te levantou!`);AU.pickup();}
{const rv=mpRecv; mpRecv=function(m,p){
  const H=MP.role==='host';
  if(m&&m.t==='say'){mpShowSay(m);if(H)mpSend(m,null,p);return;}
  if(m&&m.t==='rev'){if(H){mpStat(m.by).r++;if(m.to==='0')mpRevived(m.by);else{const q=MP.players[m.to];if(q)mpSend(m,q.peer);}}else if(m.to===MP.myId)mpRevived(m.by);return;}
  if(m&&m.t==='end'){mpEnd2(m);return;}
  if(m&&m.t==='drop'){for(const q of m.p||[])(MP.known||(MP.known=new Set())).add(q.uid);if(H)mpSend(m,null,p);}
  if(m&&m.t==='hit'&&H){MP.creditId=p.id;mpStat(p.id).dmg+=Math.min(+m.d||0,400);try{return rv(m,p);}finally{MP.creditId=null;}}
  return rv(m,p);};}
function mpSendRev(id){const m={t:'rev',to:id,by:MP.myId};if(MP.role==='host'){mpStat(MP.myId).r++;const q=MP.players[id];if(q)mpSend(m,q.peer);}else mpSend(m);
  toast(`Você levantou ${(MP.roster[id]||{}).apelido||'o amigo'}!`);}

// ---------- modos: Noite Zero (história curta) e Horda (ondas sem fim) ----------
const HORDA_CHEFES=['gordo','especime','pescador','boss'];
function mpStage(i){
  if(MP.modo!=='horda')return MPST[i];
  if(i%2===1)return {pausa:14,t:'Intervalo: o Mascate está aqui. Compre rápido'};
  const n=(i>>1)+1;
  const mix=n<=3?'inicio':n<=7?'leve':n<=12?'media':'pesada';
  if(n%5===0){const b=HORDA_CHEFES[((n/5)-1)%HORDA_CHEFES.length];return {wave:n,boss:b,hpk:.45+.15*(n/5),rate:Math.max(1.8,4-.1*n),grp:1,cap:6+n,mix,t:`Onda ${n} · Chefão: derrubem ${ETYPES[b].n}`};}
  // ondas 1 a 3 são de aquecimento; a partir da 4 cresce devagar (dá tempo de comprar arma melhor)
  return {wave:n,kills:6+3*n,rate:Math.max(.5,2.6-.13*n),grp:1+Math.floor(n/4),burst:2+Math.floor(n/2),cap:Math.min(8+3*n,42),mix,t:`Onda ${n}: matem {n} zumbis`};
}
const mpNeed=s=>Math.round(s.kills*(.7+.3*mpN()));
mpStageStart=function(){
  const s=mpStage(MP.stage); if(!s)return; MP.prog=0; MP.kills=0; MP.wv=2; MP.boss=null; G.mascTmp=null;
  if(s.wave)MP.onda=s.wave; MP.cap=(s.cap||30)+4*(mpN()-1);
  if(s.pausa){const c=mpCenter(),[x,y]=freeTileNear(((c.x/TILE)|0)+3,((c.y/TILE)|0)+1,true);G.mascTmp={x:tc(x),y:tc(y),onde:'aqui',tmp:true};mpSend({t:'masc',x:G.mascTmp.x,y:G.mascTmp.y});
    const msg='Intervalo';G.banner={t:msg,life:2.5};mpSend({t:'banner',s:msg});return;}
  if(s.boss){const e=mpSpawnAt(s.boss,420,560,'mpboss'+MP.stage)||mpSpawnAt(s.boss,250,700,'mpboss'+MP.stage);
    if(e){e.hp=e.max=e.max*s.hpk*(.75+.35*mpN());e.home=null;MP.boss=e;}}
  else mpWave(s.mix,(s.burst||3)+2*(mpN()-1));
  const msg=s.boss?ETYPES[s.boss].n:s.wave?'Onda '+s.wave:'Onda '+(MP.stage+1); G.banner={t:msg,life:3};mpSend({t:'banner',s:msg});
};
mpHostStage=function(dt){
  if(MP.endT!=null){if((MP.endT-=dt)<=0){MP.endT=null;mpEnd(true);}return;}
  const s=mpStage(MP.stage); if(!s)return;
  if(!MP.started){MP.started=true;mpStageStart();}
  if(!s.pausa&&(MP.wv-=dt)<=0){MP.wv=s.rate*rr(.8,1.2);mpWave(s.mix,(s.grp||1)+Math.floor((mpN()-1)*.6));}
  if(s.hold||s.pausa)MP.prog+=dt;
  const done=s.pausa?MP.prog>=s.pausa:s.kills?MP.kills>=mpNeed(s):s.hold?MP.prog>=s.hold:s.boss?!(MP.boss&&MP.boss.alive):false;
  if(done){
    if(s.bark){bark(...s.bark);mpSend({t:'bark',w:s.bark[0],m:s.bark[1],s:s.bark[2]});}
    if(MP.modo!=='horda'||s.boss){mpKit();mpSend({t:'kit'});}
    if(!s.pausa){const v=MP.modo==='horda'?40+20*(s.wave||1):120;mpBonus(v);mpSend({t:'bonus',v});}
    if(s.pausa){G.mascTmp=null;mpSend({t:'masc'});}
    MP.started=false;
    if(++MP.stage>=MPST.length&&MP.modo!=='horda'){MP.endT=3;MP.creditId='-';for(const e of enemies)if(e.alive&&e.mpw)killEnemy(e);MP.creditId=null;}
  }
  if(mpAllPos().every(p=>p.hp<=0)){if((MP.allDownT=(MP.allDownT||0)+dt)>4)mpEnd(false);}else MP.allDownT=0;
};
mpObjective=function(){
  if(MP.role!=='host')return {t:MP.objT||'Fiquem juntos',at:MP.objAt};
  const s=mpStage(MP.stage); if(!s)return {t:'Amanheceu.',at:null};
  let t=s.t.replace('{n}',s.kills?mpNeed(s):'').replace('{s}',s.hold||'');
  if(s.kills)t+=` (${Math.min(MP.kills,mpNeed(s))}/${mpNeed(s)})`; else if(s.hold)t+=` (${Math.floor(MP.prog)}/${s.hold}s)`;
  else if(s.pausa)t+=` (${Math.max(0,Math.ceil(s.pausa-MP.prog))}s)`;
  else if(MP.boss&&MP.boss.alive)t+=` (${Math.ceil(100*MP.boss.hp/MP.boss.max)}%)`;
  const at=MP.boss&&MP.boss.alive?{x:MP.boss.x,y:MP.boss.y}:s.pausa&&G.mascTmp?G.mascTmp:null;
  return {t,at};
};
// zumbi fica mais forte a cada onda na Horda
{const sa=mpSpawnAt; mpSpawnAt=function(type,a,b,uid){const e=sa(type,a,b,uid);if(e&&MP.modo==='horda'&&MP.onda>3&&!e.t.boss&&e.type!=='boss'){const k=1+.05*(MP.onda-3);e.hp*=k;e.max*=k;}return e;};}
{const b=mpBegin; mpBegin=function(info){
  MP.modo=info.modo||'zero'; MP.stats={}; MP.onda=0; MP.rev=null; MP.says={}; MP.pings=[]; MP.downPrev={}; G.mascTmp=null; MP.sent=false;
  b(info); P.mpDown=0;
  G.flags.grana=MP.modo==='horda'?300:400;
  if(MP.role==='host')enemies=enemies.filter(e=>e.mpw||hyp(e.x-P.x,e.y-P.y)>950); // começa sem os zumbis da cidade em cima da turma
  MP.known=new Set(pickups.map(p=>p.uid)); for(const id of Object.keys(info.pl||{}))mpStat(id);
  if(MP.modo==='horda'){G.banner={t:mpN()>1?'Horda':'Horda · solo',life:3.5};toast('Ondas sem fim. Chefão a cada 5. Até onde vocês aguentam?');}
};}
// início: o anfitrião manda o modo junto
{const si=mpStartInfo; mpStartInfo=function(){const o=si();o.modo=MP.modo||'zero';return o;};}

// ---------- fim de partida: placar com títulos ----------
function mpPlacar(){const rows=Object.entries(MP.stats||{}).map(([id,s])=>({id,nome:(MP.roster[id]||{}).apelido||'?',cor:(MP.roster[id]||{}).cor||'#ddd',char:(MP.roster[id]||{}).char,...s}));
  const tit=(f,txt)=>{if(rows.length<2)return;const mx=Math.max(...rows.map(r=>r[f]));if(mx>0)for(const r of rows)if(r[f]===mx)(r.tit||(r.tit=[])).push(txt);};
  tit('k','Carregou o time');tit('d','Morreu primeiro, de novo');tit('r','Anjo da guarda');tit('dmg','Pancada');
  if(rows.length>1)for(const r of rows)if(!r.d)(r.tit||(r.tit=[])).push('Intocável');
  return rows.sort((a,b)=>b.k-a.k);}
mpEnd=function(win,msg){
  if(!MP.on)return;
  if(MP.role==='host'){const m={t:'end',win,msg:msg||'',st:mpPlacar(),modo:MP.modo,onda:MP.onda||0};mpSend(m);mpEnd2(m);if(MP.modo==='horda'&&MP.onda>0)rankEnviar(m);}
  else mpEnd2({win,msg,st:[],modo:MP.modo,onda:MP.onda||0});
};
function mpEnd2(m){
  if(!MP.on)return; MP.on=false; G.mp=null; G.mascTmp=null; P.mpDown=0; MP.rev=null;
  const c=contaGet(); const me=(m.st||[]).find(r=>r.id===MP.myId);
  if(c){c.jogos=(c.jogos||0)+1;if(m.win)c.vit=(c.vit||0)+1;if(me){c.kills=(c.kills||0)+me.k;c.revives=(c.revives||0)+me.r;}if(m.modo==='horda')c.hordaMax=Math.max(c.hordaMax||0,m.onda||0);contaSave(c);}
  G.mode='menu';
  const tab=(m.st||[]).length?`<table class="placar"><tr><th></th><th>Matou</th><th>Caiu</th><th>Levantou</th></tr>${m.st.map(r=>`<tr><td><span class="dot" style="background:${r.cor}"></span> <b>${esc(r.nome)}</b>${r.tit?`<small>${r.tit.map(esc).join(' · ')}</small>`:''}</td><td>${r.k}</td><td>${r.d}</td><td>${r.r}</td></tr>`).join('')}</table>`:'';
  const horda=m.modo==='horda';
  UI.open(`<div class="sheet narrow win"><p class="kick">${horda?'Horda':'Noite Zero'} · beta</p><h2 class="endt">${horda?`Onda ${m.onda||0}`:m.win?'Vocês sobreviveram':'A noite venceu'}</h2>
    <p>${m.msg?esc(m.msg):horda?(m.onda>=10?'Isso aí é coisa de profissional.':'A horda levou a melhor. Dessa vez.'):m.win?'A turma inteira derrubou os três chefões. Por enquanto.':'Ninguém ficou de pé dessa vez.'}</p>
    ${tab}${horda?'<div id="rank-box" class="rankbox"><p class="hint">Carregando o ranking...</p></div>':''}
    <div class="row"><button class="btn primary" data-a="mp-leave">Voltar ao título</button></div></div>`,'','win');
  if(horda)rankMostrar(document.getElementById('rank-box'),mpN()>1||(m.st||[]).length>1?'equipe':'solo');
}

// ---------- ranking da Horda (guardado no site: nightgetaway.net.br/api/ranking) ----------
const RANK_SITE='nightgetaway.net.br';
function rankURL(){const h=(location.hostname||'').toLowerCase();return (h.endsWith(RANK_SITE)||h.endsWith('pages.dev'))?'/api/ranking':'https://'+RANK_SITE+'/api/ranking';}
function rankEnviar(m){
  const nomes=(m.st||[]).map(r=>r.nome).slice(0,5); const kills=(m.st||[]).reduce((a,r)=>a+r.k,0);
  const body={modo:nomes.length>1?'equipe':'solo',equipe:nomes.join(' + ').slice(0,60),jogadores:nomes,onda:m.onda|0,kills,v:typeof GAME_VER!=='undefined'?GAME_VER:''};
  try{fetch(rankURL(),{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(body)}).catch(()=>{});}catch(e){}
}
async function rankMostrar(el,modo){
  if(!el)return; let d=null;
  try{const ac=typeof AbortController!=='undefined'?new AbortController():null,tm=setTimeout(()=>ac&&ac.abort(),8000);const r=await fetch(rankURL()+'?modo='+modo,{cache:'no-store',signal:ac&&ac.signal});clearTimeout(tm);if(r.ok)d=await r.json();}catch(e){}
  if(!el.isConnected&&el.isConnected!==undefined)return;
  if(!d||!Array.isArray(d.top)){el.innerHTML='<p class="hint">Ranking fora do ar agora (precisa de internet).</p>';return;}
  el.innerHTML=`<h3>Top 10 · ${modo==='solo'?'sozinho':'em equipe'}</h3>`+(d.top.length?`<ol class="rank">${d.top.slice(0,10).map(r=>`<li><b>${esc(r.equipe)}</b><span>onda ${r.onda} · ${r.kills} zumbis</span></li>`).join('')}</ol>`:'<p class="hint">Ninguém no ranking ainda. Seja o primeiro.</p>');
}

// ---------- minimapa (só no online) ----------
let MINI=null;
function miniBuild(){
  if(MINI&&MINI.lm===LM)return MINI; const c=document.createElement('canvas');c.width=W;c.height=HT;const g=c.getContext('2d');
  if(!g.createImageData)return null; const img=g.createImageData(W,HT);
  for(let i=0;i<W*HT;i++){const col=MAPC[map[i]]||[30,30,32],o=i*4,k=SOLID[map[i]]?.55:.85;img.data[o]=col[0]*k;img.data[o+1]=col[1]*k;img.data[o+2]=col[2]*k;img.data[o+3]=255;}
  g.putImageData(img,0,0); MINI={c,lm:LM}; return MINI;
}
function drawMini(){
  const m=miniBuild(); if(!m)return;
  const f=IN.touch?hudF():1, S=Math.round((IN.touch?112:150)*f), x0=10+SAFE.l, y0=8+SAFE.t+Math.round(38*f)+(view.h>view.w?Math.round(26*f)+16:30), RT=34, k=S/(RT*2);
  const cx=P.x/TILE, cy=P.y/TILE, mx=v=>x0+(v/TILE-cx+RT)*k, my=v=>y0+(v/TILE-cy+RT)*k;
  ctx.save(); ctx.globalAlpha=.92; ctx.fillStyle='rgba(8,9,8,.8)'; ctx.fillRect(x0-2,y0-2,S+4,S+4);
  ctx.beginPath(); ctx.rect(x0,y0,S,S); ctx.clip(); ctx.imageSmoothingEnabled=false;
  ctx.drawImage(m.c,cx-RT,cy-RT,RT*2,RT*2,x0,y0,S,S);
  for(const e of enemies){if(!e.alive)continue;const dx=e.x-P.x,dy=e.y-P.y;if(Math.abs(dx)>RT*TILE||Math.abs(dy)>RT*TILE)continue;
    const big=e.t.boss||e.type==='boss'||e.max>=500;ctx.fillStyle=big?'#ff5a3a':'rgba(210,60,50,.85)';const r=big?3.5:1.6;ctx.fillRect(mx(e.x)-r,my(e.y)-r,r*2,r*2);}
  for(const M of mascates()){ctx.fillStyle='#d9a33c';ctx.fillRect(mx(M.x)-2.5,my(M.y)-2.5,5,5);}
  ctx.restore(); ctx.save();
  const edge=(px,py)=>[clamp(px,x0+4,x0+S-4),clamp(py,y0+4,y0+S-4)];
  for(const p of MP.pings||[]){const [px,py]=edge(mx(p.x),my(p.y)),a=clamp(p.t/1.5,0,1),r=5+((6-p.t)%1)*8;ctx.strokeStyle=p.c||'#d9a33c';ctx.globalAlpha=a;ctx.lineWidth=2;ctx.beginPath();ctx.arc(px,py,r,0,6.283);ctx.stroke();ctx.globalAlpha=1;}
  if(MP.objAt||(MP.role==='host'&&mpObjective().at)){const o=MP.role==='host'?mpObjective().at:MP.objAt;if(o){const [px,py]=edge(mx(o.x),my(o.y));ctx.fillStyle='#ffd27a';ctx.beginPath();ctx.moveTo(px,py-5);ctx.lineTo(px+4,py);ctx.lineTo(px,py+5);ctx.lineTo(px-4,py);ctx.closePath();ctx.fill();}}
  for(const r of Object.values(MP.remote||{})){if(r.x==null)continue;const [px,py]=edge(mx(r.x),my(r.y));ctx.fillStyle=r.hp>0?(r.cor||'#ddd'):'#7a2a24';ctx.strokeStyle='#0a0a0a';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(px,py,4,0,6.283);ctx.fill();ctx.stroke();
    if(r.hp<=0){ctx.strokeStyle='#ff6a5a';ctx.beginPath();ctx.moveTo(px-3,py-3);ctx.lineTo(px+3,py+3);ctx.moveTo(px+3,py-3);ctx.lineTo(px-3,py+3);ctx.stroke();}}
  {const px=x0+S/2,py=y0+S/2,a=P.ang;ctx.fillStyle=(MP.me&&MP.me.cor)||'#d9a33c';ctx.strokeStyle='#0a0a0a';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(px+Math.cos(a)*7,py+Math.sin(a)*7);ctx.lineTo(px+Math.cos(a+2.5)*5,py+Math.sin(a+2.5)*5);ctx.lineTo(px+Math.cos(a-2.5)*5,py+Math.sin(a-2.5)*5);ctx.closePath();ctx.fill();ctx.stroke();}
  ctx.strokeStyle='rgba(221,214,198,.25)';ctx.lineWidth=1;ctx.strokeRect(x0-.5,y0-.5,S+1,S+1);
  ctx.restore();
}

// ---------- desenho: Mascate, caídos, frases sobre a cabeça, barra de levantar ----------
{const dc=drawComps; drawComps=function(){dc();
  for(const M of mascates()){if(!inV(M.x,M.y,80))continue;
    ctx.fillStyle='#4a3424';ctx.fillRect(M.x+12,M.y-12,26,20);ctx.fillStyle='#7a2a24';ctx.fillRect(M.x+10,M.y-16,30,6);ctx.fillStyle='#2a1a12';ctx.beginPath();ctx.arc(M.x+16,M.y+10,4,0,6.283);ctx.arc(M.x+34,M.y+10,4,0,6.283);ctx.fill();
    ctx.fillStyle='rgba(255,196,96,.9)';ctx.beginPath();ctx.arc(M.x+38,M.y-18,3,0,6.283);ctx.fill();
    drawHuman(M.x,M.y,Math.atan2(P.y-M.y,P.x-M.x),{coat:'#3a2a3e',skin:'#c8946c',hair:'#14100c',pants:'#22201c'});
    ctx.font=`700 10px ${FONT_UI}`;ctx.textAlign='center';ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(M.x-26,M.y-36,52,13);ctx.fillStyle='#d9a33c';ctx.fillText('MASCATE',M.x,M.y-26);}
  if(!MP.on)return;
  const bubble=(x,y,t)=>{ctx.font=`700 11px ${FONT_UI}`;const w=ctx.measureText(t).width+12;ctx.fillStyle='rgba(240,232,214,.95)';ctx.fillRect(x-w/2,y-58,w,17);ctx.fillStyle='#16120c';ctx.textAlign='center';ctx.fillText(t,x,y-46);};
  for(const [id,s] of Object.entries(MP.says||{})){if(s.t<=0)continue;const r=id===MP.myId?P:MP.remote[id];if(r&&r.x!=null)bubble(r.x,r.y,FRASES[s.k][0]);}
  for(const [id,r] of Object.entries(MP.remote||{})){if(r.hp>0||r.x==null||!inV(r.x,r.y,60))continue;ctx.font=`700 10px ${FONT_UI}`;ctx.textAlign='center';ctx.fillStyle='#ff6a5a';ctx.fillText('CAÍDO',r.x,r.y+26);
    if(MP.rev&&MP.rev.id===id){ctx.strokeStyle='#d9a33c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(r.x,r.y,18,-Math.PI/2,-Math.PI/2+6.283*clamp(MP.rev.t/2.2,0,1));ctx.stroke();}}
};}
{const dh=mpDrawHud; mpDrawHud=function(){dh(); if(MP.on&&G.mode==='play'){ctx.setTransform(dpr,0,0,dpr,0,0);drawMini();}};}
// dinheiro na tela: aparece quando muda
{const ds=drawPsy; drawPsy=function(){ds(); if(G.mode!=='play'||G.granaT==null||G.time-G.granaT>4)return; ctx.setTransform(dpr,0,0,dpr,0,0);
  const a=clamp(4-(G.time-G.granaT),0,1),f=HUDS[OPT.hud].f,t=brl(grana()),portrait=view.h>view.w;ctx.globalAlpha=a;ctx.font=`700 ${Math.round(13*f)}px ${FONT_UI}`;
  // ao lado da pílula da arma (mesma conta do HUD)
  const pw=Math.round((portrait?124:150)*f),phh=Math.round(34*f),py=portrait?stickCenters().move.y-STICK.r-50*f:view.h-SAFE.b-8-phh,w=ctx.measureText(t).width+14,x=view.w/2+pw/2+6,y=py+(phh-22*f)/2;
  panel(x,y,w,22*f);ctx.fillStyle='#8ac06a';ctx.textAlign='center';ctx.fillText(t,x+w/2,y+15.5*f);ctx.globalAlpha=1;};}

// ---------- ticks ----------
{const vt=v16Tick; v16Tick=function(dt){vt(dt);
  if(G.mode!=='play'||!MP.on)return;
  for(const s of Object.values(MP.says||{}))s.t-=dt; MP.pings=(MP.pings||[]).filter(p=>(p.t-=dt)>0);
  // segurar pra levantar
  if(MP.rev){const r=MP.remote[MP.rev.id],held=!!(KEYS.KeyE||(document.getElementById('tb-use')||{classList:{contains:()=>false}}).classList.contains('down'));
    if(!r||r.hp>0||P.mpDown>0||hyp(r.x-P.x,r.y-P.y)>76||!held)MP.rev=null;
    else if((MP.rev.t+=dt)>=2.2){mpSendRev(MP.rev.id);MP.rev=null;}}
  // anfitrião conta quem caiu
  if(MP.role==='host'){const cur={'0':P.hp};for(const [id,q] of Object.entries(MP.players))cur[id]=q.hp;
    for(const [id,h] of Object.entries(cur)){if(h<=0&&(MP.downPrev[id]??1)>0)mpStat(id).d++;MP.downPrev[id]=h;}}
  // itens que aparecem no chão (caixas, largados, dinheiro) viram de todo mundo
  if((MP.dropT=(MP.dropT||0)-dt)<=0){MP.dropT=.4;const k=MP.known||(MP.known=new Set()),nw=[];for(const p of pickups)if(!k.has(p.uid)){k.add(p.uid);nw.push(p);}if(nw.length)mpSend({t:'drop',p:nw});}
};}
// mercador temporário da Horda chega pra todo mundo
function mpBonus(v){granaAdd(v);toast(`Etapa vencida: +${brl(v)} pra cada um.`);}
{const rv=mpRecv; mpRecv=function(m,p){if(m&&m.t==='bonus'){mpBonus(m.v);return;}if(m&&m.t==='masc'){G.mascTmp=m.x!=null?{x:m.x,y:m.y,onde:'aqui',tmp:true}:null;return;}return rv(m,p);};}
// caído: 30 segundos pra alguém levantar (senão levanta sozinho perto de um amigo)
{const di=die; die=function(){const prev=P.mpDown||0,r=di.apply(this,arguments);if(MP.on){if(prev>0)P.mpDown=prev;else{P.mpDown=30;toast('Você caiu! Um amigo pode te levantar.');}}return r;};}
// explosões do anfitrião também pegam os amigos
{const ex=explode; explode=function(x,y,r,dmg){const o=ex.apply(this,arguments);
  if(MP.on&&MP.role==='host')for(const q of Object.values(MP.players)){if(q.hp<=0)continue;const d=hyp(q.x-x,q.y-y);if(d<r&&los(x,y,q.x,q.y))mpSend({t:'hurt',d:32*(1-d/r*.5),x,y},q.peer);}
  return o;};}

// ---------- frases: teclas Z X V B no PC, botão no celular ----------
document.addEventListener&&document.addEventListener('keydown',e=>{if(!MP.on||G.mode!=='play'||e.repeat)return;const i=FRASES.findIndex(f=>f[1]===e.code);if(i>=0){e.preventDefault();mpSay(i);}});
(function(){try{
  const top=document.querySelector&&document.querySelector('#tc .ttop'), tc=document.getElementById('tc'); if(!top||!tc||!document.createElement)return;
  const b=document.createElement('button');b.className='tb sq';b.id='tb-say';b.hidden=true;b.setAttribute('aria-label','Frases rápidas');
  b.innerHTML='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5h16v10H9l-5 4z"/><path d="M8 9h8M8 12h5"/></svg>';top.insertBefore(b,top.firstChild);
  const bar=document.createElement('div');bar.id='saybar';bar.hidden=true;bar.innerHTML=FRASES.map((f,i)=>`<button class="tb" data-say="${i}">${f[0]}</button>`).join('');tc.appendChild(bar);
  const tog=e=>{e.preventDefault();e.stopPropagation();bar.hidden=!bar.hidden;AU.click();};
  b.addEventListener('touchstart',tog,{passive:false});b.addEventListener('click',e=>{if(Date.now()-lastTouchT<600)return;tog(e);});
  bar.addEventListener('touchstart',e=>{const t=e.target.closest&&e.target.closest('[data-say]');if(!t)return;e.preventDefault();e.stopPropagation();mpSay(+t.dataset.say);bar.hidden=true;},{passive:false});
  bar.addEventListener('click',e=>{const t=e.target.closest&&e.target.closest('[data-say]');if(!t||Date.now()-lastTouchT<600)return;mpSay(+t.dataset.say);bar.hidden=true;});
}catch(e){}})();
{const ut=updTouchUI; updTouchUI=function(){ut();const b=document.getElementById('tb-say');if(b){b.hidden=!MP.on;if(!MP.on){const s=document.getElementById('saybar');if(s)s.hidden=true;}}};}

// ---------- mira assistida (celular) ----------
let MIRA=true; try{MIRA=localStorage.getItem('ps-mira')!=='0';}catch(e){}
{const ri=readInput; readInput=function(){ri();
  if(!MIRA||!IN.touch||IN.aimAng==null||P.inCar)return;
  let best=null,bs=1e9;
  for(const e of enemies){if(!e.alive||e.state==='dorm')continue;const dx=e.x-P.x,dy=e.y-P.y,d=hyp(dx,dy);if(d>520||d<8)continue;
    const da=Math.abs(angDiff(IN.aimAng,Math.atan2(dy,dx)));if(da>.38)continue;const sc=da*300+d*.4;if(sc<bs&&los(P.x,P.y,e.x,e.y)){bs=sc;best=e;}}
  if(best){const a=Math.atan2(best.y-P.y,best.x-P.x);IN.aimAng+=angDiff(IN.aimAng,a)*.75;}
};}

// ---------- telas: título, lobby (modo), opções, maleta ----------
{const tt=UI.title.bind(UI); UI.title=function(){tt();try{const m=OV.querySelector('.menu');if(!m)return;const mp=m.querySelector('[data-a=mp]');
  const b=document.createElement('button');b.className='btn';b.dataset.a='horda-solo';b.textContent='Modo Horda';m.insertBefore(b,mp?mp.nextSibling:null);}catch(e){}};}
{const um=UI.mp; UI.mp=function(){um.call(this);try{
  if(MP.role!=='host'||!(MP.code||MP.manual))return; const st=OV.querySelector('[data-a=mp-start]'); if(!st)return;
  const md=MP.modo||'zero'; st.textContent=md==='horda'?'Começar a Horda':'Começar a Noite Zero';
  const d=document.createElement('div');d.innerHTML=`<h3>Modo</h3><div class="seg"><button data-a="mp-modo" data-k="zero" class="${md==='zero'?'on':''}">Noite Zero (3 chefões)</button><button data-a="mp-modo" data-k="horda" class="${md==='horda'?'on':''}">Horda (ondas sem fim)</button></div>`;
  st.parentNode.parentNode.insertBefore(d,st.parentNode);}catch(e){}};}
{const op=UI.opts.bind(UI); UI.opts=function(from){op(from);try{if(!IN.touch)return;const box=OV.querySelector('.opts');if(!box)return;
  const d=document.createElement('div');d.className='opt';d.innerHTML=`<h3>Mira assistida</h3><div class="seg"><button data-a="mira" data-k="1" class="${MIRA?'on':''}">Ligada</button><button data-a="mira" data-k="0" class="${MIRA?'':'on'}">Desligada</button></div>`;box.appendChild(d);}catch(e){}};}
{const ib=UI.itensBody; UI.itensBody=function(){return ib.call(this).replace('<span>Condição</span>',`<span>Condição · <b style="color:#8ac06a">${brl(grana())}</b></span>`);};}
function hordaSolo(){
  const c=contaGet()||{nome:'Sobrevivente',apelido:'eu',cor:'#d9a33c',fav:'richard'};
  mpLeave(); MP.role='host'; MP.myId='0'; MP.players={}; MP.peers={}; MP.me={nome:c.nome,apelido:c.apelido,cor:c.cor,frase:c.frase||'',char:c.fav||'richard'}; MP.modo='horda';
  mpBegin({pl:{'0':{...MP.me}},modo:'horda'});
}
{const act=UI.act.bind(UI); UI.act=function(a,ds){
  switch(a){
    case 'loja-tab':return this.loja(ds.k);
    case 'loja-c':lojaComprar(ds.k);return this.loja('c');
    case 'loja-v':lojaVender(ds.k,+ds.q);return this.loja('v');
    case 'mp-modo':MP.modo=ds.k;return this.mp();
    case 'horda-solo':return hordaSolo();
    case 'mira':MIRA=ds.k==='1';try{localStorage.setItem('ps-mira',MIRA?'1':'0');}catch(e){}return this.opts(this.optsFrom||'title');
  }
  return act(a,ds);};}
{const oo=UI.opts.bind(UI);UI.opts=function(from){this.optsFrom=from;return oo(from);};}
try{const st=document.createElement('style');st.textContent=`
  .loja .lista{display:flex;flex-direction:column;gap:4px;max-height:58vh;overflow:auto}.lrow{display:flex;align-items:center;gap:10px;padding:5px 8px;border:1px solid var(--line);background:rgba(255,255,255,.02)}
  .lrow .ln{flex:1;display:flex;flex-direction:column}.lrow small{color:var(--dim)}.lrow .lico{width:34px;height:34px;display:flex;align-items:center;justify-content:center}.lrow .lico svg,.lrow .lico img{max-width:34px;max-height:34px}
  .lw{font:700 10px var(--f-ui);color:var(--amber);border:1px solid var(--line);padding:2px 3px}.mfala{margin:0 0 8px;color:var(--amber);font-style:italic}.lgrana{color:#8ac06a;font:700 20px var(--f-ui);margin-right:10px}.lrow .btn.mini{margin-left:4px}
  .placar{width:100%;border-collapse:collapse;margin:8px 0}.placar th,.placar td{padding:5px 6px;border-bottom:1px solid var(--line);text-align:center}.placar td:first-child{text-align:left}.placar small{display:block;color:var(--amber);font-size:11px}
  .rank{margin:4px 0 0;padding-left:22px}.rank li{padding:3px 0}.rank li span{color:var(--dim);margin-left:8px;font-size:12px}.rankbox{margin:6px 0}
  #saybar{position:absolute;top:calc(52px + env(safe-area-inset-top,0px));left:50%;transform:translateX(-50%);display:flex;flex-wrap:wrap;justify-content:center;max-width:calc(100vw - 24px);gap:6px;pointer-events:auto;z-index:6}
  #saybar .tb{padding:8px 14px;font-size:13px;border-radius:8px;background:rgba(8,10,9,.85)}`;document.head.appendChild(st);}catch(e){}

// ---------- menu de teste (1.8) ----------
{const da=UI.dbgAct.bind(UI); UI.dbgAct=function(k,ds){
  if(!k.startsWith('v18:'))return da(k,ds);
  const c=k.slice(4); const soMP=()=>{if(!MP.on||MP.role!=='host'){toast('Só funciona como anfitrião (ou na Horda sozinho).');return false;}return true;};
  switch(c){
    case 'grana':granaAdd(5000);this.close();return toast('+R$ 5.000');
    case 'joia':{const l=invAdd('joia',3);if(l)boxAdd('joia',l);this.close();return toast('3 joias na maleta.');}
    case 'loja':UI.lojaFala='Abri só pra você, parceiro.';return this.loja('c');
    case 'masc':{let b=null,bd=1e9;for(const m of mascates()){const d=hyp(m.x-P.x,m.y-P.y);if(d<bd){bd=d;b=m;}}this.close();if(!b)return toast('Nenhum Mascate neste mapa.');P.x=b.x-24;P.y=b.y;snapCamera();flowTile=-1;return toast('Mascate '+b.onde+'.');}
    case 'horda':this.close();return hordaSolo();
    case 'onda':{this.close();if(!soMP())return;const s=mpStage(MP.stage);MP.creditId='-';for(const e of enemies)if(e.alive&&e.mpw)killEnemy(e);MP.creditId=null;if(s){if(s.kills)MP.kills=9999;if(s.hold||s.pausa)MP.prog=999;}return;}
    case 'chefe':{this.close();if(!soMP()||MP.modo!=='horda')return toast('Só na Horda.');let i=MP.stage+1;while(!(mpStage(i)&&mpStage(i).boss))i++;MP.stage=i;MP.started=false;MP.creditId='-';for(const e of enemies)if(e.alive&&e.mpw)killEnemy(e);MP.creditId=null;return toast('Onda '+mpStage(i).wave+'.');}
    case 'cair':this.close();if(!MP.on)return toast('Só no multiplayer.');P.hp=0;return die();
    case 'levantar':this.close();if(!MP.on)return toast('Só no multiplayer.');return mpRevived(MP.myId);
    case 'frase':this.close();if(!MP.on)return toast('Só no multiplayer.');return mpSay(0);
    case 'rank':{this.open(`<div class="sheet narrow"><p class="kick">Menu de teste · 1.8</p><h2>Ranking da Horda</h2><div id="rank-a"></div><div id="rank-b"></div><div class="row"><button class="btn ghost" data-a="dbgtab" data-k="nov">Voltar</button></div></div>`,'','debug');
      rankMostrar(document.getElementById('rank-a'),'equipe');rankMostrar(document.getElementById('rank-b'),'solo');return;}
    case 'mira':MIRA=!MIRA;try{localStorage.setItem('ps-mira',MIRA?'1':'0');}catch(e){}this.close();return toast(MIRA?'Mira assistida ligada.':'Mira assistida desligada.');
  }
};}

// dano do anfitrião também conta no placar; sair limpa o "caído"
{const he=hurtEnemy; hurtEnemy=function(e,d){if(MP.on&&MP.role==='host'&&!MP.creditId&&d>0&&e&&e.alive&&!e.ghost&&MP.stats)mpStat('0').dmg+=Math.min(d,400);return he.apply(this,arguments);};}
{const ml=mpLeave; mpLeave=function(){ml();P.mpDown=0;G.mascTmp=null;};}
