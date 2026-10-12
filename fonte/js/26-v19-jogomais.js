// ===================== 1.9 · NOTA FINAL · NOVO JOGO+ · PESADELO · ROUPAS · PRÊMIOS =====================
// Tudo que passa de uma partida para outra fica no localStorage:
//   'ps-jogomais' {clears, best:{diff:nota}, unl:{pesadelo,faca,muni,lant}, prem:{faca,muni,lant}, carry:{...}}
//   'ps-roupas'   {sel:{personagem:id}, comp:['personagem:id']}   (roupas compradas no Mascate)
//   'ps-jm-mortes' {runId:n}   (mortes da partida; o registro carregado não apaga a conta)

// ---------- dificuldade Pesadelo e a fita de tinta ----------
DIFFS.pesadelo={n:'Pesadelo',ehp:1.55,dmg:1.9,loot:.5,phd:1.6,d:'Quase nada no chão, mordida que arranca pedaço, e salvar gasta fita de tinta. O homem de sobretudo chega cedo.'};
ITEMS.fita={n:'Fita de tinta',s:'FITA',c:'#2c2a30',st:9,k:'key',d:'Fita para a máquina de escrever. No Pesadelo, cada registro gasta uma.'};
const jmPes=()=>G.diff==='pesadelo';

// ---------- armazenamento ----------
function jmGet(){try{const d=JSON.parse(localStorage.getItem('ps-jogomais')||'null');return d&&typeof d==='object'?d:{};}catch(e){return {};}}
function jmSet(d){try{localStorage.setItem('ps-jogomais',JSON.stringify(d));}catch(e){}}
function jmHash(s){s=String(s);let h=7;for(let i=0;i<s.length;i++)h=(h*31+s.charCodeAt(i))|0;return Math.abs(h);}

// ---------- mortes da partida (só no jogo solo) ----------
function jmMortes(){let n=G.flags.mortes|0;try{const m=JSON.parse(localStorage.getItem('ps-jm-mortes')||'{}');if(G.flags.runId&&m[G.flags.runId]!=null)n=Math.max(n,m[G.flags.runId]|0);}catch(e){}return n;}
{const di=die; die=function(){const was=G.mode;const r=di.apply(this,arguments);
  if(was!=='dead'&&G.mode==='dead'&&!MP.on&&!G.flags.mpMode&&!(typeof FB!=='undefined'&&FB.on)){
    G.flags.mortes=jmMortes()+1;
    try{const m=JSON.parse(localStorage.getItem('ps-jm-mortes')||'{}');if(G.flags.runId){m[G.flags.runId]=G.flags.mortes;const ks=Object.keys(m);if(ks.length>8)delete m[ks[0]];localStorage.setItem('ps-jm-mortes',JSON.stringify(m));}}catch(e){}}
  return r;};}

// ---------- a nota ----------
const NOTAS_ORD=['D','C','B','A','S'];
// s: {t: segundos, mortes, saves, salvos, diff}
function jmNota(s){
  const m=(s.t||0)/60, rows=[];
  rows.push(['Ponto de partida','',40]);
  rows.push(['Tempo',fmtTime(s.t||0),m<=45?25:m<=60?20:m<=80?12:m<=110?5:0]);
  rows.push(['Mortes',String(s.mortes|0),Math.max(0,15-5*(s.mortes|0))]);
  rows.push(['Registros salvos',String(s.saves|0),(s.saves|0)<=4?10:(s.saves|0)<=8?6:(s.saves|0)<=14?3:0]);
  rows.push(['Sobreviventes salvos',String(s.salvos|0),Math.min(10,(s.salvos|0)*2)]);
  rows.push(['Dificuldade',DIFFS[s.diff]?DIFFS[s.diff].n:'Normal',{facil:-10,normal:0,dificil:8,pesadelo:15}[s.diff]||0]);
  const pts=rows.reduce((n,r)=>n+r[2],0);
  let nota=pts>=95?'S':pts>=80?'A':pts>=65?'B':pts>=50?'C':'D';
  if(s.diff==='facil'&&nota==='S')nota='A';
  return {nota,pts,rows};
}
function jmStats(){return {t:G.time,mortes:jmMortes(),saves:G.saves,salvos:(G.st&&G.st.saved)|0,diff:G.diff};}
const notaMelhor=(a,b)=>NOTAS_ORD.indexOf(a)>=NOTAS_ORD.indexOf(b)?a:b;
function jmTemS(d,difs){d=d||jmGet();return Object.keys(d.best||{}).some(k=>d.best[k]==='S'&&(!difs||difs.includes(k)));}

// prêmios da nota S (só valem no Novo Jogo+)
const PREMIOS=[
  {k:'faca',n:'Faca infinita',d:'A faca nunca quebra.',req:'Nota S em qualquer dificuldade.',ok:d=>jmTemS(d)},
  {k:'lant',n:'Lanterna infinita',d:'A pilha nunca acaba.',req:'Nota S no Normal ou acima.',ok:d=>jmTemS(d,['normal','dificil','pesadelo'])},
  {k:'muni',n:'Munição infinita',d:'O pente nunca esvazia.',req:'Nota S no Difícil ou no Pesadelo.',ok:d=>jmTemS(d,['dificil','pesadelo'])},
];
function premOn(k){if(!G.flags||!G.flags.jogomais||MP.on)return false;const d=jmGet();const p=PREMIOS.find(p=>p.k===k);return !!(p&&p.ok(d)&&d.prem&&d.prem[k]);}

// fim de partida: grava a nota, o que passa pro Jogo+ e o que foi liberado; devolve a lista de novidades
function jmFinish(res){
  const d=jmGet(), antes={pes:!!(d.unl&&d.unl.pesadelo),prem:PREMIOS.filter(p=>p.ok(d)).map(p=>p.k),roupas:roupasLivres(d)};
  d.clears=(d.clears|0)+1; d.best=d.best||{}; d.best[G.diff]=d.best[G.diff]?notaMelhor(res.nota,d.best[G.diff]):res.nota;
  d.unl=d.unl||{}; d.unl.pesadelo=true;
  d.carry={owned:P.owned.slice(),mags:P.mags.slice(),up:JSON.parse(JSON.stringify(G.flags.up||{})),grana:grana(),mw:G.mw||8,mh:G.mh||6,dur:P.dur|0,ng:(G.flags.jogomais|0)};
  jmSet(d);
  const nov=[];
  if(!antes.pes)nov.push('Novo Jogo+','Dificuldade Pesadelo');
  for(const p of PREMIOS)if(p.ok(d)&&!antes.prem.includes(p.k))nov.push('Prêmio: '+p.n);
  for(const r of roupasLivres(d))if(!antes.roupas.includes(r))nov.push('Roupa: '+roupaNome(r));
  return [...new Set(nov)];
}

// ---------- tela final ----------
{const uw=UI.win.bind(UI); UI.win=function(){
  uw();
  if(MP.on||G.flags.mpMode)return;
  try{
    const res=jmNota(jmStats());
    if(res.nota==='S'&&G.diff!=='facil')ach('rankS');
    if(G.diff==='pesadelo')ach('pesadelo');
    if(G.flags.jogomais)ach('jogomais');
    if(!G.flags.jmDone){G.flags.jmDone=true;this.jmNov=jmFinish(res);}
    const box=OV.querySelector('.win'); if(!box)return;
    const rk=box.querySelector('.rank'); if(rk){rk.textContent=res.nota;rk.classList.add('jm-n'+res.nota);}
    const ht=box.querySelector('.hint');
    const tab=`<div class="jmnota"><h3>Como saiu a nota <b>${res.pts} pontos</b></h3><dl>${res.rows.map(r=>`<dt>${esc(r[0])}${r[1]?` <small>${esc(r[1])}</small>`:''}</dt><dd class="${r[2]<0?'neg':''}">${r[2]>=0?'+':''}${r[2]}</dd>`).join('')}</dl>
      <p class="hint">S a partir de 95 · A 80 · B 65 · C 50. No Fácil a nota máxima é A.</p>
      ${(this.jmNov||[]).length?`<p class="jmnov">Liberado: ${this.jmNov.map(esc).join(' · ')}</p>`:''}</div>`;
    if(ht)ht.outerHTML=tab; else box.querySelector('.stats').insertAdjacentHTML('afterend',tab);
    const st=box.querySelector('.stats'); if(st&&!st.querySelector('.jm-m'))st.insertAdjacentHTML('beforeend',`<dt class="jm-m">Mortes</dt><dd>${jmMortes()}</dd><dt>Sobreviventes salvos</dt><dd>${(G.st&&G.st.saved)|0}</dd>`);
    const row=box.querySelector('.row');
    if(row&&G.flags.jogomais){const b=document.createElement('button');b.className='btn';b.dataset.a='jm-epi';b.textContent='Epílogo do Jogo+';row.insertBefore(b,row.firstChild);
      const pr=row.querySelector('[data-a=restart]');if(pr)pr.removeAttribute('data-focus');b.dataset.focus='';try{b.focus();}catch(e){}}
  }catch(e){console.error(e);}
};}
UI.jmEpi=function(){
  const F=G.flags,n=F.jogomais|0;
  this.open(`<div class="paper intro jmepi"><p class="stamp">Defesa Civil · arquivo complementar · ${n>1?'reabertura nº '+n:'reaberto'}</p>
    <p>Quarenta e oito horas depois. A equipe que desceu no Porto de Itajaí achou o laboratório da Vértice lacrado por dentro e os computadores apagados à mão, um por um.</p>
    <p>No canal, o navio continua parado. O contêiner 00 está aberto e vazio, com a porta amassada de dentro para fora. Ninguém sabe dizer quando ele saiu.</p>
    <p>Na última página do relatório alguém grampeou uma foto tirada em Navegantes, do outro lado do rio: um rapaz de mochila sentado no meio-fio, ${F.soniaMet?'a Sonia do lado dele, as duas mãos no braço dele':'sozinho, olhando a fumaça que ainda sobe do porto'}.</p>
    <p>Embaixo, a caneta: "Ele já fez esse caminho antes. Não é a primeira vez que essa noite acontece."</p>
    <div class="row"><button class="btn dark" data-a="jm-epiback" data-focus>Voltar</button></div></div>`,'','jmepi');
};

// ---------- Novo Jogo+ ----------
function jmAplicar(){
  const d=jmGet(),c=d.carry; if(!c)return false;
  G.flags.jogomais=(c.ng|0)+1;
  if(Array.isArray(c.owned))c.owned.forEach((v,i)=>{if(v&&i<P.owned.length)P.owned[i]=true;});
  if(Array.isArray(c.mags))c.mags.forEach((v,i)=>{if(i<P.mags.length&&P.owned[i])P.mags[i]=Math.max(P.mags[i]|0,v|0);});
  P.owned[8]=true; if(P.owned[0])P.dur=Math.max(P.dur|0,c.dur|0,20);
  G.flags.up=JSON.parse(JSON.stringify(c.up||{}));
  G.flags.grana=c.grana|0; G.mw=Math.max(G.mw||8,c.mw|0||8); G.mh=Math.max(G.mh||6,c.mh|0||6);
  if(typeof mSync==='function')try{mSync();}catch(e){}
  return true;
}
const jmPode=()=>!!jmGet().carry;

// inimigos mais fortes e mais rápidos; alguns tipos do fim aparecem cedo
{const me=makeEnemy; makeEnemy=function(type,x,y,uid,dorm){
  const on=G.flags&&G.flags.jogomais&&!MP.on;
  if(on&&!uid&&type==='zumbi'&&Math.random()<.14)type=rpick(['corr','cusp','soldado','cusp','brut']);
  const e=me.call(this,type,x,y,uid,dorm);
  if(on){const n=Math.min(3,G.flags.jogomais|0),big=!!(e.t.boss||type==='boss'||e.stalker);
    const k=big?1.3+.15*n:1.15+.1*n; e.hp*=k; e.max=e.hp; e.spdMul*=big?1.04+.02*n:1.08+.03*n; e.t=Object.assign({},e.t,{dmg:e.t.dmg*(1.08+.04*n)}); e.jm=1;}
  return e;};}

// ---------- Pesadelo: menos coisa no chão, fitas raras, salvar gasta fita, Perseguidor cedo ----------
{const sl=scaleLoot; scaleLoot=function(){sl();
  if(!jmPes())return;
  pickups=pickups.filter(p=>!(p.kind==='item'&&ITEMS[p.id]&&ITEMS[p.id].k==='heal'&&jmHash(p.uid)%4===0));
  for(const p of pickups)if(p.kind==='item'&&ITEMS[p.id]&&(ITEMS[p.id].k==='ammo'||ITEMS[p.id].k==='heal'||ITEMS[p.id].k==='craft')&&jmHash('f'+p.uid)%17===0){p.id='fita';p.q=1;}
};}
{const ng=newGame; newGame=function(diff){const r=ng.apply(this,arguments);
  G.flags.runId=Date.now().toString(36)+Math.random().toString(36).slice(2,6);
  if(diff==='pesadelo')invAdd('fita',2);
  return r;};}
{const us=UI.save.bind(UI); UI.save=function(){us();try{if(!jmPes())return;const p=OV.querySelector('.sheet>p:not(.kick)');const n=invCount('fita');
  if(p)p.insertAdjacentHTML('afterend',`<p class="hint jmfita">Pesadelo: cada registro gasta uma fita de tinta. Você tem <b>${n}</b>.</p>`);
  if(!n){const b=OV.querySelector('[data-a=dosave]');if(b){b.disabled=true;b.textContent='Sem fita de tinta';}}}catch(e){}};}
// o Perseguidor: no Pesadelo ele liga quando o jipe pega (ou aos 25 min) e caça também em Balneário
{const da=dAt; let persCedo=false; dAt=function(){const r=da.apply(this,arguments);return persCedo&&r>=4?3:r;};
 const up=updPers; updPers=function(dt){
  if(jmPes()&&!MP.on){const F=G.flags; if(!F.persOn&&(F.jipe||G.time>25*60)){F.persOn=true;G.persT=Math.min(G.persT,20);}
    persCedo=true; try{return up.call(this,dt);}finally{persCedo=false;}}
  return up.call(this,dt);};}

// ---------- Mascate: fita no Pesadelo, roupas sempre ----------
function lojaSync(){
  for(let i=LOJA.length-1;i>=0;i--)if(LOJA[i].jm)LOJA.splice(i,1);
  if(jmPes())LOJA.push({g:'Pesadelo',jm:1,it:[{id:'fita',q:1,p:350}]});
  const rs=[]; const own=roupasComp();
  for(const ch in ROUPAS)for(const r of ROUPAS[ch].l)if(r.p&&!own.includes(ch+':'+r.id))rs.push({roupa:ch+':'+r.id,p:r.p});
  if(rs.length)LOJA.push({g:'Roupas',jm:1,it:rs});
}
{const ul=UI.loja; UI.loja=function(tab){lojaSync();ul.call(this,tab);
  try{LOJA.forEach((g,gi)=>g.it.forEach((e,ei)=>{if(!e.roupa)return;const b=OV.querySelector(`[data-a=loja-c][data-k="${gi}:${ei}"]`);const row=b&&b.closest('.lrow');if(!row)return;
    const [ch]=e.roupa.split(':');row.querySelector('.lico').innerHTML='<span class="lw">ROUPA</span>';row.querySelector('.ln').innerHTML=`<b>${esc(roupaNome(e.roupa))}</b><small>para ${esc(ROUPAS[ch].n)} · troque na tela Roupas</small>`;}));}catch(e){}};}
{const lc=lojaComprar; lojaComprar=function(k){
  const [gi,ei]=String(k).split(':').map(Number),e=LOJA[gi]&&LOJA[gi].it[ei];
  if(e&&e.roupa){if(grana()<e.p){AU.locked();return toast('Dinheiro não dá.');}
    const R=roupasGet();R.comp=[...new Set([...(R.comp||[]),e.roupa])];roupasSet(R);granaAdd(-e.p);AU.pickup();UI.lojaFala='Fica bem em você. Troca lá na tela de Roupas.';toast('Roupa comprada: '+roupaNome(e.roupa)+'.');return;}
  return lc.apply(this,arguments);};}

// ---------- roupas alternativas ----------
const ROUPAS={
  richard:{n:'Richard',base:{coat:'#1f2b4e',skin:'#d29d7c',hair:'#3a2415',pants:'#24262c'},l:[
    {id:'base',n:'Jaqueta azul'},
    {id:'capa',n:'Capa de chuva amarela',coat:'#c9a23a',pants:'#2a2c30',ach:'fuga'},
    {id:'couro',n:'Jaqueta de couro',coat:'#3b2a1e',pants:'#18181a',nota:true},
    {id:'dc',n:'Colete da Defesa Civil',coat:'#d0662a',pants:'#2c3038',p:2500}]},
  edu:{n:'Edu',base:{coat:'#18191c',pants:'#2a2c34'},l:[
    {id:'base',n:'Moletom preto'},
    {id:'xadrez',n:'Camisa xadrez',coat:'#7a2c28',ach:'heroi'},
    {id:'cinza',n:'Moletom cinza',coat:'#77756f',pants:'#23252a',p:1500}]},
  matheus:{n:'Matheus',base:{coat:'#e8e6e0',pants:'#1c2230'},l:[
    {id:'base',n:'Camiseta branca'},
    {id:'vento',n:'Corta-vento azul',coat:'#2c4c7c',ach:'flash'},
    {id:'verde',n:'Camisa verde do time',coat:'#2d6a3c',pants:'#1a1c20',nota:true}]},
  marlon:{n:'Marlon',base:{coat:'#1c1e21'},l:[
    {id:'base',n:'Camiseta preta'},
    {id:'regata',n:'Regata branca',coat:'#d8d4ca',ach:'trio'},
    {id:'oleado',n:'Capa de pescador',coat:'#c8b028',p:1500}]},
  nicolas:{n:'Nicolas',base:{coat:'#d6c93a'},l:[
    {id:'base',n:'Camiseta amarela'},
    {id:'lycra',n:'Lycra de surf preta',coat:'#16181c',ach:'univali'},
    {id:'jeans',n:'Jaqueta jeans',coat:'#3c5a80',p:1500}]},
};
function roupasGet(){try{const r=JSON.parse(localStorage.getItem('ps-roupas')||'null');return r&&typeof r==='object'?r:{};}catch(e){return {};}}
function roupasSet(r){try{localStorage.setItem('ps-roupas',JSON.stringify(r));}catch(e){}}
function roupasComp(){return roupasGet().comp||[];}
function roupaNome(k){const [ch,id]=k.split(':');const r=ROUPAS[ch]&&ROUPAS[ch].l.find(x=>x.id===id);return r?r.n:k;}
function roupaLivre(ch,r,d){if(r.id==='base')return true;if(r.ach)return ACHS.has(r.ach);if(r.nota)return jmTemS(d);if(r.p)return roupasComp().includes(ch+':'+r.id);return false;}
function roupasLivres(d){d=d||jmGet();const out=[];for(const ch in ROUPAS)for(const r of ROUPAS[ch].l)if(r.id!=='base'&&roupaLivre(ch,r,d))out.push(ch+':'+r.id);return out;}
function roupaReq(ch,r){if(r.ach){const a=ACH.find(a=>a.id===r.ach);return 'Conquista: '+(a?a.n:r.ach);}if(r.nota)return 'Escape com nota S';if(r.p)return 'À venda no Mascate · '+brl(r.p);return '';}
// a roupa escolhida (null = a de sempre)
function roupaDe(ch){const R=roupasGet(),id=R.sel&&R.sel[ch];if(!id||id==='base'||!ROUPAS[ch])return null;const r=ROUPAS[ch].l.find(x=>x.id===id);return r&&roupaLivre(ch,r)?r:null;}
function roupaSel(ch,id){const R=roupasGet();R.sel=R.sel||{};R.sel[ch]=id;roupasSet(R);}

// desenho: Richard, o Matheus do flashback, a turma que te segue e os dois do porto
{const dp=drawPlayer; drawPlayer=function(){
  if(MP.on)return dp.apply(this,arguments);
  const fb=typeof FB!=='undefined'&&FB.on, r=fb?roupaDe('matheus'):(!P.lookO?roupaDe('richard'):null);
  if(!r)return dp.apply(this,arguments);
  const o=P.lookO; P.lookO=Object.assign({},o||Object.assign({richard:true},ROUPAS.richard.base),r.coat?{coat:r.coat}:{},r.pants?{pants:r.pants}:{});
  try{return dp.apply(this,arguments);}finally{P.lookO=o;}};}
{const dc=drawComps; drawComps=function(){
  if(MP.on)return dc.apply(this,arguments);
  const back=[];
  const vest=(o,ch)=>{const r=roupaDe(ch);if(!r)return;back.push([o,o.col,o.pants]);if(r.coat)o.col=r.coat;if(r.pants&&'pants' in o)o.pants=r.pants;};
  for(const c of (G.comps||[]))vest(c,c.id);
  if(typeof ALLY!=='undefined')for(const a of ALLY.list)vest(a,a.id==='nico'?'nicolas':a.id);
  try{return dc.apply(this,arguments);}finally{for(const [o,c,p] of back){o.col=c;if(p!==undefined)o.pants=p;}}};}

function roupaPrev(cv,ch,r){try{
  const c2=cv.getContext('2d'),sv=ctx; c2.clearRect(0,0,cv.width,cv.height);
  const B=ROUPAS[ch].base,L=ch==='richard'?{richard:true}:(typeof LOOKS!=='undefined'&&LOOKS[ch])||{};
  const o=Object.assign({},L,B,{coat:r.coat||B.coat,pants:r.pants||B.pants||'#22242a'});
  if(ch==='marlon'||ch==='nicolas'){const l=LOOK12[ch==='nicolas'?'nico':'marlon'];o.skin=l.skin;o.hair=l.hair;o.look=l.look;}
  ctx=c2; ctx.save(); ctx.translate(cv.width/2,cv.height/2+2); ctx.scale(2.8,2.8);
  try{drawHuman(0,0,-Math.PI/2,Object.assign(o,{walk:0,moving:false,legAng:-Math.PI/2,wid:null}));}finally{ctx.restore();ctx=sv;}
}catch(e){}}
UI.roupas=function(from){
  if(from)this.roupasFrom=from;
  const d=jmGet(),R=roupasGet();
  const sec=Object.keys(ROUPAS).map(ch=>{const C=ROUPAS[ch],cur=(R.sel&&R.sel[ch])||'base';
    return `<section class="rpch"><h3>${esc(C.n)}</h3><div class="rplist">${C.l.map(r=>{const ok=roupaLivre(ch,r,d),on=ok&&(cur===r.id||(r.id==='base'&&!roupaDe(ch)));
      return `<button class="rp${on?' on':''}${ok?'':' trava'}" data-a="rp-sel" data-c="${ch}" data-k="${r.id}" aria-pressed="${on}"><canvas width="64" height="64" data-rp="${ch}:${r.id}"></canvas><b>${esc(r.n)}</b><small>${on?'vestindo':ok?'liberada':esc(roupaReq(ch,r))}</small></button>`;}).join('')}</div></section>`;}).join('');
  this.open(`<div class="sheet wide roupas"><div class="tabs"><p class="kick">${roupasLivres(d).length} de ${Object.values(ROUPAS).reduce((n,c)=>n+c.l.length-1,0)} liberadas</p><h2 style="margin-right:auto">Roupas</h2><button class="btn ghost" data-a="rp-back">Voltar</button></div>
    <p class="hint">A roupa escolhida vale no jogo solo e fica salva neste aparelho. As do Mascate você compra com o dinheiro da partida.</p>${sec}</div>`,'','roupas');
  try{OV.querySelectorAll('canvas[data-rp]').forEach(cv=>{const [ch,id]=cv.dataset.rp.split(':');roupaPrev(cv,ch,ROUPAS[ch].l.find(x=>x.id===id));});}catch(e){}
};

// ---------- título, pausa, dificuldade ----------
{const tt=UI.title.bind(UI); UI.title=function(){tt();try{const m=OV.querySelector('.menu');if(!m)return;const nw=m.querySelector('[data-a=new]');
  if(jmPode()){const b=document.createElement('button');b.className='btn';b.dataset.a='jm-new';b.textContent='Novo Jogo+';m.insertBefore(b,nw?nw.nextSibling:null);}
  const r=document.createElement('button');r.className='btn';r.dataset.a='roupas';r.dataset.from='title';r.textContent='Roupas';const ac=m.querySelector('[data-a=achs]');m.insertBefore(r,ac?ac.nextSibling:null);}catch(e){}};}
{const pz=UI.pause.bind(UI); UI.pause=function(){const res=pz.apply(this,arguments);try{if(UI.cur==='pause'&&!MP.on){const m=OV.querySelector('.menu');if(m&&!m.querySelector('[data-a=roupas]')){const b=document.createElement('button');b.className='btn';b.dataset.a='roupas';b.dataset.from='pause';b.textContent='Roupas';const q=m.querySelector('[data-a=achs]');m.insertBefore(b,q?q.nextSibling:null);}}}catch(e){}return res;};}
{const ud=UI.diff.bind(UI); UI.diff=function(){ud();try{
  const d=jmGet(),box=OV.querySelector('.diffs'); if(!box)return;
  if(d.unl&&d.unl.pesadelo&&!box.querySelector('[data-d=pesadelo]'))box.insertAdjacentHTML('beforeend',`<button class="card jmpes" data-a="diff" data-d="pesadelo"><b>${DIFFS.pesadelo.n}</b><span>${DIFFS.pesadelo.d}</span></button>`);
  if(this.jmPend){const k=OV.querySelector('.kick');if(k)k.textContent='Novo Jogo+ · '+((d.carry&&d.carry.ng|0)+1)+'ª volta';
    const c=d.carry||{},arm=(c.owned||[]).filter((v,i)=>v&&i!==8&&WEAPONS[i]).length;
    const prem=PREMIOS.map(p=>{const ok=p.ok(d),on=ok&&d.prem&&d.prem[p.k];return `<button class="dbgt${on?' on':''}" data-a="jm-prem" data-k="${p.k}" ${ok?'':'disabled'} aria-pressed="${!!on}">${esc(p.n)}<span>${ok?(on?'ligado':'desligado'):esc(p.req)}</span></button>`;}).join('');
    box.insertAdjacentHTML('afterend',`<div class="jmcarry"><p class="hint">Você leva ${arm} arma${arm===1?'':'s'}, a munição nos pentes, as melhorias, ${brl(c.grana|0)} e a maleta ${c.mw||8}×${c.mh||6}. Os infectados voltam mais fortes e mais rápidos, e alguns dos piores aparecem cedo.</p><h3>Prêmios da nota S</h3><div class="dbg-list">${prem}</div></div>`);}
}catch(e){}};}
{const act=UI.act.bind(UI); UI.act=function(a,ds){
  switch(a){
    case 'new':this.jmPend=false;break;
    case 'jm-new':if(!jmPode())return this.title();this.jmPend=true;return this.diff();
    case 'jm-prem':{const d=jmGet();d.prem=d.prem||{};d.prem[ds.k]=!d.prem[ds.k];jmSet(d);return this.diff();}
    case 'diff':if(this.jmPend){this.jmPend=false;newGame(ds.d);jmAplicar();return this.intro();}break;
    case 'title':this.jmPend=false;break;
    case 'dosave':if(jmPes()&&!MP.on){
      if(invCount('fita')<=0){AU.locked();this.close();return toast('Sem fita de tinta. A máquina não escreve nada.');}
      invRemove('fita',1);const s0=G.saves;const r=act(a,ds);if(G.saves===s0)invAdd('fita',1);else toast('Gastou uma fita de tinta. Sobraram '+invCount('fita')+'.');return r;}
      break;
    case 'jm-epi':return this.jmEpi();
    case 'jm-epiback':return this.win();
    case 'roupas':return this.roupas(ds.from||'title');
    case 'rp-sel':{const ch=ds.c,r=ROUPAS[ch]&&ROUPAS[ch].l.find(x=>x.id===ds.k);if(!r)return;if(!roupaLivre(ch,r)){AU.locked();toast(roupaReq(ch,r)+'.');return;}roupaSel(ch,r.id);AU.pickup&&AU.pickup();return this.roupas();}
    case 'rp-back':if(this.roupasFrom==='pause'){G.mode='play';return this.pause();}return this.title();
  }
  return act(a,ds);};}

// ---------- prêmios ligados: valem a cada quadro ----------
{const up=update; update=function(dt){const r=up.apply(this,arguments);
  if(G.mode==='play'&&G.flags&&G.flags.jogomais&&!MP.on){
    if(premOn('faca')&&P.owned[0])P.dur=Math.max(P.dur|0,30);
    if(premOn('lant'))P.bat=100;
    if(premOn('muni')){const w=WEAPONS[P.w];if(w&&w.mag&&P.w!==8&&P.w!==0)P.mags[P.w]=w.mag;}
  }
  return r;};}

// ---------- conquistas novas ----------
ACH.push({id:'pesadelo',n:'Acordado',d:'Escape no Pesadelo.'},{id:'jogomais',n:'De novo, não',d:'Termine um Novo Jogo+.'});

// ---------- visual ----------
(function(){try{const s=document.createElement('style');s.textContent=`
  .jmnota{margin:10px 0 4px;border-top:1px dashed var(--line);padding-top:8px}.jmnota h3{display:flex;justify-content:space-between;margin:0 0 6px}.jmnota h3 b{color:var(--amber)}
  .jmnota dl{display:grid;grid-template-columns:1fr auto;gap:2px 12px;margin:0}.jmnota dt small{opacity:.65}.jmnota dd{margin:0;text-align:right;font-weight:700;color:#8ac06a}.jmnota dd.neg{color:#d0604a}
  .jmnov{color:var(--amber);font-weight:700;margin:6px 0 0}.rank.jm-nS{color:#e0b84a}.rank.jm-nD{color:#a05048}
  .card.jmpes{border-color:#7a2a24}.card.jmpes b{color:#d0604a}.jmcarry{margin-top:10px}.jmcarry .dbg-list{display:flex;flex-wrap:wrap;gap:6px}.jmcarry .dbgt[disabled]{opacity:.5}
  .roupas .rpch{margin:8px 0}.roupas h3{margin:6px 0}.rplist{display:flex;flex-wrap:wrap;gap:8px}
  .rp{display:flex;flex-direction:column;align-items:center;gap:2px;width:132px;padding:6px;border:1px solid var(--line);background:rgba(0,0,0,.18);color:inherit;font:inherit;cursor:pointer;text-align:center}
  .rp canvas{width:64px;height:64px}.rp b{font-size:13px}.rp small{font-size:11px;opacity:.75}.rp.on{border-color:var(--amber);box-shadow:inset 0 0 0 1px var(--amber)}.rp.trava canvas{filter:grayscale(1) brightness(.35)}.rp.trava{opacity:.75}
  .jmepi p:not(.stamp){line-height:1.5}
  @media (max-width:700px),(max-height:450px){.rp{width:104px}.rp canvas{width:48px;height:48px}}`;document.head.appendChild(s);}catch(e){}})();

// ---------- menu de teste ----------
dbgExtra('1.9 · Jogo+ e nota',[['jm:nota','Tela final com nota (dados falsos)'],['jm:tudo','Liberar tudo (Jogo+, Pesadelo, prêmios, roupas)'],['jm:ngp','Começar Novo Jogo+ agora'],['jm:pes','Mudar esta partida para Pesadelo'],['jm:roupa','Trocar as roupas de todos'],['jm:pf','Prêmio: faca infinita'],['jm:pl','Prêmio: lanterna infinita'],['jm:pm','Prêmio: munição infinita'],['jm:zera','Apagar Jogo+ e roupas']],function(k){
  const d=jmGet();
  switch(k){
    case 'jm:nota':G.time=rr(38,95)*60;G.saves=ri(2,12);G.flags.mortes=ri(0,4);G.st.saved=ri(0,6);G.flags.jmDone=false;this.close();G.mode='win';return this.win();
    case 'jm:tudo':{d.clears=Math.max(1,d.clears|0);d.best={facil:'A',normal:'S',dificil:'S',pesadelo:'S'};d.unl={pesadelo:true};
      if(!d.carry)d.carry={owned:P.owned.slice(),mags:P.mags.slice(),up:JSON.parse(JSON.stringify(G.flags.up||{})),grana:Math.max(grana(),3000),mw:G.mw||8,mh:G.mh||6,dur:30,ng:0};
      jmSet(d);for(const a of ['fuga','heroi','flash','trio','univali'])ach(a);const R=roupasGet();R.comp=[];for(const ch in ROUPAS)for(const r of ROUPAS[ch].l)if(r.p)R.comp.push(ch+':'+r.id);roupasSet(R);this.close();return toast('Tudo liberado.');}
    case 'jm:ngp':{if(!d.carry){d.carry={owned:P.owned.slice(),mags:P.mags.slice(),up:G.flags.up||{},grana:grana(),mw:G.mw||8,mh:G.mh||6,dur:P.dur|0,ng:0};jmSet(d);}
      newGame(G.diff||'normal');jmAplicar();G.flags.tutDone=true;G.tut=null;this.close();G.mode='play';document.getElementById('tc').hidden=!IN.touch;return toast('Novo Jogo+ ('+G.flags.jogomais+'ª volta).');}
    case 'jm:pes':G.diff='pesadelo';G.D=DIFFS.pesadelo;invAdd('fita',2);this.close();return toast('Agora é Pesadelo. Ganhou 2 fitas de tinta.');
    case 'jm:roupa':{const R=roupasGet();R.sel=R.sel||{};for(const ch in ROUPAS){const l=ROUPAS[ch].l,i=l.findIndex(x=>x.id===(R.sel[ch]||'base'));R.sel[ch]=l[(i+1)%l.length].id;}roupasSet(R);this.close();
      return toast(Object.keys(ROUPAS).map(ch=>ROUPAS[ch].n+': '+(roupaDe(ch)?roupaDe(ch).n:'padrão')).join(' · '));}
    case 'jm:pf':case 'jm:pl':case 'jm:pm':{const p={'jm:pf':'faca','jm:pl':'lant','jm:pm':'muni'}[k];d.prem=d.prem||{};d.prem[p]=!d.prem[p];jmSet(d);if(!G.flags.jogomais)G.flags.jogomais=1;
      const P2=PREMIOS.find(x=>x.k===p);this.close();return toast(P2.n+(d.prem[p]?' ligado':' desligado')+(P2.ok(d)?'':' (ainda trancado: '+P2.req+')')+'.');}
    case 'jm:zera':try{localStorage.removeItem('ps-jogomais');localStorage.removeItem('ps-roupas');}catch(e){}this.close();return toast('Jogo+ e roupas apagados.');
  }
});
