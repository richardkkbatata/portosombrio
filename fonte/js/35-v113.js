// ===================== 1.13 · CAOS, MISSÕES E REGISTROS =====================
// - Aba "Missões" na mochila: principal (onde ir, o que fazer, distância e direção) e secundárias.
// - Registros: 5 slots, e exportar/importar o registro num arquivo (.pssave) para levar para outro PC.
// - Depois do posto, Balneário em caos total: gente se matando, gente pegando fogo, corpos caindo,
//   carros e casas explodindo. Casa que explode fica destruída e fechada para sempre (vai no registro).
// - Os sobreviventes da rua (que não são da história) podem morrer pelas mãos do Richard. Ele sente.
// - Camboriú: iluminação de tocha e braseiro, velas nas janelas, mais gente sendo morta.

// ===================== MISSÕES NA MOCHILA =====================
const MIS_CAP=[
  {n:'A delegacia e o posto',done:F=>F.postoBoom},
  {n:'Fuga pela Estrada da Rainha',done:F=>F.bloqWeak||F.metHelena},
  {n:'A Clínica da Brava e a Dra. Helena',done:F=>F.clinicPower},
  {n:'Universidade de BC',done:F=>F.uniDone===true},
  {n:'Camboriú: a Congregação do Cervo',done:F=>F.cbDone,show:F=>F.cbCall||F.cbDone},
  {n:'O inibidor V-7',done:F=>F.inibidorDone},
  {n:'Itajaí',done:F=>F.alexMet||F.hospOut},
  {n:'Hospital Santa Clara',done:F=>F.hospOut},
  {n:'O porto e o heliponto',done:F=>F.bossDead},
];
function misWhere(at){
  if(!at)return 'Sem lugar marcado: siga o que está escrito.';
  const dx=at.x-P.x,dy=at.y-P.y,d=Math.round(hyp(dx,dy)/TILE*1.6),a=Math.atan2(dy,dx)*180/Math.PI;
  const dirs=['leste','sudeste','sul','sudoeste','oeste','noroeste','norte','nordeste'],dir=dirs[((Math.round(a/45)%8)+8)%8];
  const di=dAt((at.x/TILE)|0,(at.y/TILE)|0),dn=DISTRICTS[di]?DISTRICTS[di].name:'';
  if(d<12)return `Aqui perto${dn?' · '+dn:''}.`;
  return `${dn?dn+' · ':''}${d} m a ${dir}.`;
}
function misBody(){
  const F=G.flags, o=objective()||{t:'—'};
  let cur=-1; const caps=MIS_CAP.filter(c=>!c.show||c.show(F));
  const rows=caps.map((c,i)=>{const done=!!c.done(F);if(!done&&cur<0)cur=i;const now=cur===i;
    return `<div class="lrow mis${now?' now':''}"><span class="ln"><b>${done?'✓ ':now?'▶ ':''}${done||now?esc(c.n):'???'}</b>${now?`<small>${esc(o.t)}</small><small class="onde">${esc(misWhere(o.at))}</small>`:done?'<small>concluído</small>':'<small>ainda não</small>'}</span></div>`;}).join('');
  // Camboriú: o que falta
  let cb='';
  if(F.cbCall&&!F.cbDone&&typeof cbHas==='function'){const it=(ok,t)=>`<li class="${ok?'ok':''}">${ok?'✓':'○'} ${t}</li>`;
    cb=`<h3>Camboriú · o portal da Matriz</h3><ul class="chk">${it(F.cbSt>=3,'Encontrar o Nicolas no morro')}${it(cbHas('cbSeloSino')||F.cbPortal,'Selo do Sino (torre da Matriz)')}${it(cbHas('cbSeloVela')||F.cbPortal,'Selo da Vela (porão da Casa do Pregador)')}${it(cbHas('cbSeloCervo')||F.cbPortal,'Selo do Cervo (o irmão do Nicolas, no estádio)')}${it(F.cbBoss,'Derrubar o Cervo')}</ul>`;}
  // secundárias
  let side='';
  if(typeof V19M!=='undefined'){
    side=V19M.map(m=>{const s=v19St(m.id);if(!s)return `<div class="lrow"><span class="ln"><b>???</b><small>Ainda não encontrada. Fale com quem estiver pela cidade.</small></span></div>`;
      const seg=F.v19seg===m.id,t=s===1&&typeof v19Target==='function'?v19Target(m.id):null;
      return `<div class="lrow"><span class="ln"><b>${s===2?'✓ ':''}${esc(m.n)}${s===2?' · concluída':''}</b><small>${esc(m.onde)}${s===1?' · '+esc(v19Hint(m.id)):''}</small>${s===1?`<small class="onde">${esc(misWhere(t))}</small>`:''}</span>${s===1?`<button class="btn mini${seg?' primary':''}" data-a="misSeg" data-k="${m.id}">${seg?'Seguindo':'Seguir'}</button>`:''}</div>`;}).join('');
    const n=V19M.filter(m=>v19St(m.id)===2).length;
    side=`<h3>Missões secundárias · ${n} de ${V19M.length}</h3><p class="hint">A missão que você seguir aparece na seta quando a história não estiver apontando pra nenhum lugar.</p><div class="lista">${side}</div>`;}
  return `<div class="misbox"><h3>Agora</h3><div class="agora"><b>${esc(o.t)}</b><span>${esc(misWhere(o.at))}</span>${o.at?'<button class="btn mini" data-a="tab" data-t="mapa">Ver no mapa</button>':''}</div>
    <h3>História principal</h3><div class="lista">${rows}</div>${cb}${side}</div>`;
}
(function(){
  const inv=UI.inv.bind(UI);
  UI.inv=function(tab){
    if(tab)this.tab=tab;
    if(this.tab!=='missoes'){const r=inv(tab);misTabBtn();return r;}
    const tabs=[['itens','Itens'],['mapa','Mapa'],['arquivos',`Arquivos ${G.files.size}/${DOCS.length}`],['missoes','Missões']];
    this.open(`<div class="sheet wide inv">
      <div class="tabs" role="tablist">${tabs.map(([k,l])=>`<button role="tab" aria-selected="${this.tab===k}" class="tab${this.tab===k?' on':''}" data-a="tab" data-t="${k}">${l}</button>`).join('')}
      <button class="btn ghost closebtn" data-a="close">Fechar</button></div>
      <div class="tabbody">${misBody()}</div></div>`,'','inv');
  };
  function misTabBtn(){try{const t=OV.querySelector('.inv .tabs');if(!t||!t.insertBefore||t.querySelector('[data-t="missoes"]'))return;const b=document.createElement('button');b.className='tab';b.setAttribute('role','tab');b.dataset.a='tab';b.dataset.t='missoes';b.textContent='Missões';const c=t.querySelector('.closebtn');t.insertBefore(b,c);}catch(e){}}
  const act=UI.act.bind(UI); UI.act=function(a,ds){
    if(a==='misSeg'){G.flags.v19seg=ds.k;return this.inv('missoes');}
    return act(a,ds);};
  try{const st=document.createElement('style');st.textContent=`.misbox h3{margin:14px 0 6px}.misbox .agora{display:flex;flex-wrap:wrap;gap:6px 12px;align-items:center;padding:10px 12px;border:1px solid var(--line,#5a5040);background:rgba(0,0,0,.25)}
    .misbox .agora b{flex:1 1 100%;font-size:15px}.misbox .agora span{color:var(--dim);font-size:13px}.lrow.mis.now{outline:1px solid var(--amber,#d9a33c)}.lrow small.onde{color:var(--amber,#d9a33c)}
    .misbox ul.chk{list-style:none;padding:0;margin:0}.misbox ul.chk li{padding:3px 0;color:var(--dim)}.misbox ul.chk li.ok{color:#7ac08a}`;document.head.appendChild(st);}catch(e){}
})();

// ===================== REGISTROS: SLOTS E ARQUIVO =====================
const SLOTS=5;
function slotKey(n){return n<=1?SAVE_KEY:SAVE_KEY+'-s'+n;}
let SLOT=1; try{SLOT=clamp(+(localStorage.getItem('ps-slot')||1)|0,1,SLOTS)||1;}catch(e){}
function slotSet(n){SLOT=n;try{localStorage.setItem('ps-slot',String(n));}catch(e){}}
function slotRead(n){try{const s=localStorage.getItem(slotKey(n));return s?JSON.parse(s):null;}catch(e){return null;}}
function slotMeta(s){if(!s)return null;const m=s.meta||{};return m;}
(function(){
  const ser=serialize; serialize=function(){const s=ser.apply(this,arguments);try{let o='';try{o=(objective()||{}).t||'';}catch(e){}
    const di=dAt((P.x/TILE)|0,(P.y/TILE)|0);s.meta={quando:new Date().toLocaleString('pt-BR'),onde:DISTRICTS[di]?DISTRICTS[di].name:'',obj:o.slice(0,120),hora:typeof clockStr==='function'?clockStr():'',dia:typeof dayNo==='function'?dayNo():1,v:(typeof NOTAS!=='undefined'&&NOTAS[0])?NOTAS[0].v:''};}catch(e){}return s;};
  hasSave=function(){try{return !!localStorage.getItem(slotKey(SLOT));}catch(e){return false;}};
  writeSave=(function(ws){return function(){if((typeof SN!=='undefined'&&SN.on)||(typeof RC!=='undefined'&&RC.on))return false;try{localStorage.setItem(slotKey(SLOT),JSON.stringify(serialize()));return true;}catch(e){return false;}};})(writeSave);
  readSave=function(){return slotRead(SLOT);};
})();
function slotsHTML(mode){
  let h='';for(let n=1;n<=SLOTS;n++){const s=slotRead(n),m=slotMeta(s);
    h+=`<div class="lrow slot${n===SLOT?' now':''}"><span class="ln"><b>Registro ${n}${n===SLOT?' · atual':''}</b><small>${m?esc(`${m.onde||'—'} · ${m.hora||''} dia ${m.dia||1} · salvo em ${m.quando||'?'}`):s?'Registro antigo':'Vazio'}</small>${m&&m.obj?`<small class="onde">${esc(m.obj)}</small>`:''}</span>
      <span class="sbtn">${mode==='save'?`<button class="btn mini primary" data-a="slotSave" data-n="${n}">Salvar aqui</button>`:''}${s?`<button class="btn mini" data-a="slotLoad" data-n="${n}">Carregar</button><button class="btn mini" data-a="slotExp" data-n="${n}">Exportar</button>`:''}
      <button class="btn mini ghost" data-a="slotImp" data-n="${n}">Importar</button>${s&&mode!=='save'?`<button class="btn mini ghost" data-a="slotDel" data-n="${n}">Apagar</button>`:''}</span></div>`;}
  return `<div class="lista slots">${h}</div><p class="hint">Exportar baixa um arquivo .pssave com o registro. Em outro computador, abra o jogo, vá em Registros e use Importar para colocar o arquivo num slot.</p>
    <input type="file" id="slotFile" accept=".pssave,.json,application/json" hidden>`;
}
UI.slots=function(mode){this.slotMode=mode||'load';
  this.open(`<div class="sheet wide"><div class="tabs"><p class="kick">${mode==='save'?'Abrigo · '+clockStr():'Porto Sombrio'}</p><h2 style="margin-right:auto">Registros</h2><button class="btn ghost" data-a="${mode==='save'?'close':'slotBack'}">${mode==='save'?'Fechar':'Voltar'}</button></div>${slotsHTML(mode)}</div>`,'','slots');};
function slotExport(n){
  const s=slotRead(n); if(!s){toast('Esse slot está vazio.');return;}
  const txt=JSON.stringify({jogo:'porto-sombrio',slot:n,registro:s}), nome=`porto-sombrio-registro-${n}.pssave`;
  try{const b=new Blob([txt],{type:'application/json'}),u=URL.createObjectURL(b),a=document.createElement('a');a.href=u;a.download=nome;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(u);a.remove&&a.remove();},1500);toast('Registro exportado: '+nome);}
  catch(e){toast('Este aparelho não deixou baixar o arquivo.');}
}
function slotImportData(n,txt){
  try{let o=JSON.parse(txt);if(o&&o.registro)o=o.registro;if(!o||!o.P||!o.flags)throw 0;localStorage.setItem(slotKey(n),JSON.stringify(o));toast(`Registro importado no slot ${n}.`);AU.save&&AU.save();return true;}
  catch(e){toast('Esse arquivo não é um registro do Porto Sombrio.');AU.locked&&AU.locked();return false;}
}
(function(){
  const act=UI.act.bind(UI); UI.act=function(a,ds){
    const n=+ds.n||1;
    if(a==='slotSave'){slotSet(n);G.saves++;const ok=writeSave();AU.save();toast(ok?`Progresso registrado no slot ${n}.`:'Não foi possível salvar neste aparelho.');return this.slots('save');}
    if(a==='slotLoad'){const s=slotRead(n);if(!s)return;slotSet(n);loadState(s);this.close();G.mode='play';toast(`Registro ${n} carregado.`);const tc=document.getElementById('tc');if(tc)tc.hidden=!IN.touch;return;}
    if(a==='slotExp'){slotExport(n);return;}
    if(a==='slotDel'){if(this.delAsk!==n){this.delAsk=n;toast('Toque em Apagar de novo para confirmar.');return;}this.delAsk=null;try{localStorage.removeItem(slotKey(n));}catch(e){}toast(`Slot ${n} apagado.`);return this.slots(this.slotMode);}
    if(a==='slotImp'){this.impSlot=n;const f=document.getElementById('slotFile');if(f&&f.click)f.click();return;}
    if(a==='slotBack'){return this.title();}
    if(a==='slotsMenu')return this.slots('load');
    if(a==='slotsSave'){return this.slots('save');}
    return act(a,ds);};
  if(typeof OV!=='undefined'&&OV.addEventListener)OV.addEventListener('change',e=>{const t=e.target;if(!t||t.id!=='slotFile'||!t.files||!t.files[0])return;const n=UI.impSlot||1;const r=new FileReader();r.onload=()=>{slotImportData(n,String(r.result));UI.slots(UI.slotMode);};r.readAsText(t.files[0]);t.value='';});
  // a máquina de escrever abre os slots; o título ganha "Registros"
  const op=UI.open.bind(UI); UI.open=function(html,cls,name){
    if(typeof html==='string'){
      if(name==='save')html=html.replace('<button class="btn primary" data-a="dosave" data-focus>Salvar</button>',`<button class="btn primary" data-a="dosave" data-focus>Salvar no registro ${SLOT}</button><button class="btn" data-a="slotsSave">Outro registro / arquivo</button>`).replace('O registro anterior será substituído.',`O registro ${SLOT} será substituído. Você tem 5 registros e pode exportar para um arquivo.`);
      if(name==='title'&&!html.includes('data-a="slotsMenu"'))html=html.replace(/(<button class="btn"[^>]*data-a="cont"[^>]*>[^<]*<\/button>)/,'$1<button class="btn" data-a="slotsMenu">Registros (slots e arquivo)</button>');
    }
    return op(html,cls,name);};
  try{const st=document.createElement('style');st.textContent=`.slots .lrow{flex-wrap:wrap}.slots .sbtn{display:flex;flex-wrap:wrap;gap:6px}.slots .lrow.now{outline:1px solid var(--amber,#d9a33c)}`;document.head.appendChild(st);}catch(e){}
})();

// ===================== O RICHARD MATA GENTE (sobreviventes que não são da história) =====================
const PK={lines:['Não... não, não, não. Ele era gente. Ele tava vivo.','O que eu fiz? O QUE EU FIZ?','Ele só queria sair daqui. Igual a mim.','Eu tô virando um deles. Sem precisar ser mordido.','Ninguém viu. Ninguém vai saber. Só eu.'],
  bad:['Ele ia matar ela. Eu não tive escolha.','Ele mereceu. Não mereceu?']};
function pedHurt(p,dmg,ang,o={}){
  if(!p||!p.alive||p.st==='trapped')return;
  p.hp-=dmg; p.hurt=.3; p.byPlayer=!o.chaos||p.byPlayer; bloodBurst(p.x,p.y,6,ang||0);
  if(p.st!=='flee'&&p.st!=='cbv'&&!p.murderer){p.st='leave';p.fade=0;p.say={t:pick2(['NÃO ATIRA! NÃO ATIRA!','Tá maluco?!','SOCORRO! ELE TÁ ATIRANDO!']),life:1.6};}
}
function pedKilled(p){
  if(!p.byPlayer||p.counted)return; p.counted=true;
  const F=G.flags; F.pedKill=(F.pedKill||0)+(p.murderer?0:1);
  G.shockT=Math.max(G.shockT||0,p.murderer?18:45); G.fear=Math.max(G.fear||0,p.murderer?.5:.8); G.shake+=3;
  const L=p.murderer?PK.bad:PK.lines; later(700,()=>bark('rafa','s',L[Math.min(L.length-1,p.murderer?0:Math.max(0,(F.pedKill||1)-1))%L.length],{dur:2.6}));
  if(!p.murderer)later(rr(9000,16000),()=>{try{psyFloat(p.x,p.y,pick2(['"...por quê?"','"eu tinha uma filha"','"a gente podia ter ido junto"']),{life:3,c:'#c8b8a8',whisper:true});AU.cry&&AU.cry('sussurro',p.x,p.y,1);}catch(e){}});
  if(F.pedKill===3)later(4000,()=>bark('rafa','t','Minha mão não para de tremer. Não é medo deles. É medo de mim.',{dur:2.8}));
}
(function(){
  // bala e flecha acertam os sobreviventes também
  const up=updProjs; updProjs=function(dt){
    for(const pr of projs){if(pr.dead||!(pr.k==='b'||pr.k==='a'||pr.k==='f'))continue;
      for(const p of peds){if(!p.alive||p.turned&&p.alive===false||p.st==='trapped')continue;const r=(p.r||11)+(pr.k==='f'?(pr.r||8):3);
        if(Math.abs(p.x-pr.x)<r&&Math.abs(p.y-pr.y)<r&&hyp(p.x-pr.x,p.y-pr.y)<r){pedHurt(p,pr.dmg||20,Math.atan2(pr.vy,pr.vx));if(pr.k!=='f')pr.dead=true;break;}}}
    return up(dt);};
  // faca, machado, cano: golpe na frente
  const ml=melee; melee=function(){const r=ml.apply(this,arguments);try{const w=WEAPONS[P.w];const rg=(w&&w.range)||46;
    for(const p of peds){if(!p.alive||p.st==='trapped')continue;const d=hyp(p.x-P.x,p.y-P.y);if(d<rg+p.r&&Math.abs(angDiff(P.ang,Math.atan2(p.y-P.y,p.x-P.x)))<.9){pedHurt(p,(w&&w.dmg)||20,P.ang);break;}}}catch(e){}return r;};
  // explosão do jogador pega quem estiver perto
  const ex=explode; explode=function(x,y,r,dmg){if(!CH.noBlame)for(const p of peds)if(p.alive&&hyp(p.x-x,p.y-y)<r)pedHurt(p,dmg,Math.atan2(p.y-y,p.x-x));return ex.apply(this,arguments);};
  // quando morre: a culpa (e o assassino da briga pode virar alvo)
  const upd=updPeds; updPeds=function(dt){const was=peds.filter(p=>p.alive);const r=upd(dt);for(const p of was)if(!p.alive)pedKilled(p);return r;};
})();

// ===================== CAOS TOTAL EM BALNEÁRIO (depois do posto) =====================
const CH={t:30,noBlame:false,fx:[]};
const CH_LOOT=new Set(['m9','cart','ervaV','ervaA','pilha','polv','garrafa','comb','spray','r762','m357','virote','pecas','gran','m38','r308','calmante']);
function chOk(){const F=G.flags;return F.postoBoom&&G.mode==='play'&&!CUT.on&&!(typeof MP!=='undefined'&&MP.on)&&cbOn()&&!(typeof inCb==='function'&&inCb())&&!inZone()&&!inSew()&&typeof inBC==='function'&&inBC()&&!(typeof FB!=='undefined'&&FB.on)&&!G.heli&&!(G.wave>0);}
function chHouseOk(b){
  if(!b||b.safe||b.destroyed||b.kind!=='casa'||b.name||b.y>=H)return false;
  if(P.x>tc(b.x-2)&&P.x<tc(b.x+b.w+2)&&P.y>tc(b.y-2)&&P.y<tc(b.y+b.h+2))return false;
  const inB=(o)=>{const tx=o.tx!=null?o.tx:(o.x/TILE)|0,ty=o.ty!=null?o.ty:(o.y/TILE)|0;return tx>=b.x&&tx<b.x+b.w&&ty>=b.y&&ty<b.y+b.h;};
  if(interacts.some(o=>inB(o)&&o.type!=='hide'&&o.type!=='janela'))return false;
  if(npcs.some(n=>inB(n)))return false;
  if(gates.some(g=>g.x>=b.x&&g.x<b.x+b.w&&g.y>=b.y&&g.y<b.y+b.h))return false;
  if(pickups.some(p=>inB(p)&&(p.kind!=='item'||!CH_LOOT.has(p.id))))return false;
  if(lights.some(l=>l.c==='safe'&&inB(l)))return false;
  return true;
}
function chDestroy(b,live){
  if(!b||b.destroyed)return; b.destroyed=true; b.roof='#15110e'; b.lit=false;
  for(let j=b.y+1;j<b.y+b.h-1;j++)for(let i=b.x+1;i<b.x+b.w-1;i++)setT(i,j,T.RUBBLE);
  for(const d of (b.doorT||[]))setT(d.x,d.y,T.RUBBLE);
  for(let i=interacts.length-1;i>=0;i--){const o=interacts[i];if(o.tx>=b.x&&o.tx<b.x+b.w&&o.ty>=b.y&&o.ty<b.y+b.h)interacts.splice(i,1);}
  for(let i=pickups.length-1;i>=0;i--){const p=pickups[i];if(p.tx>=b.x&&p.tx<b.x+b.w&&p.ty>=b.y&&p.ty<b.y+b.h){pickups.splice(i,1);}}
  for(const e of enemies)if(e.alive&&e.x>tc(b.x)&&e.x<tc(b.x+b.w)&&e.y>tc(b.y)&&e.y<tc(b.y+b.h))e.alive=false;
  const cx=tc(b.x+b.w/2),cy=tc(b.y+b.h/2);
  for(let k=0;k<4;k++)GORE.push({k:'scorch',x:cx+rr(-b.w*10,b.w*10),y:cy+rr(-b.h*10,b.h*10),r:rr(30,60),rot:Math.random()*6,seed:Math.random()});
  CH.fx.push({x:cx,y:cy,b:b.id}); if(CH.fx.length<=14&&typeof addFire==='function')addFire(cx+rr(-30,30),cy+rr(-30,30),rr(26,40),false);
  if(typeof invalidateRect==='function')invalidateRect(b.x-1,b.y-1,b.w+2,b.h+2); flowTile=-1; if(typeof MAPV!=='undefined')MAPV++;
  if(live){const F=G.flags;F.destr=F.destr||[];if(!F.destr.includes(b.id)&&F.destr.length<40)F.destr.push(b.id);}
}
function chFarSpot(minD,maxD){if(typeof spawnPoint==='function'){const s=spawnPoint(minD,maxD,undefined,false);if(s)return s;}return null;}
function chMkPed(x,y,o={}){const look=pick2(PED_LOOK);const p={x,y,r:11,hp:o.hp||40,alive:true,st:o.st||'cbv',col:look[0],hair:look[1],skin:look[2],ang:0,walk:0,moving:true,t:0,say:null,shoutT:.5,saved:false,item:pick2(['m9','ervaV','pilha','cart']),help:['SOCORRO!','ME AJUDA!','NÃO! NÃO!'],thanks:['Obrigado... obrigado.'],...o};peds.push(p);return p;}
const CH_EV=[
  // uma casa explode (gás, fogo, alguém lá dentro): fica destruída pra sempre
  {w:3,f(){const cands=buildings.filter(b=>chHouseOk(b)&&hyp(tc(b.x+b.w/2)-P.x,tc(b.y+b.h/2)-P.y)>360&&hyp(tc(b.x+b.w/2)-P.x,tc(b.y+b.h/2)-P.y)<900);if(!cands.length)return false;
    const b=cands[(Math.random()*cands.length)|0],x=tc(b.x+b.w/2),y=tc(b.y+b.h/2);
    CH.noBlame=true;try{G.light=Math.max(G.light||0,.6);G.boom={x,y,t:.5};G.shake+=14;AU.bigBoom&&AU.bigBoom();explodeFx&&explodeFx(x,y,1.6);}catch(e){}CH.noBlame=false;
    chDestroy(b,true);alertNoise(x,y,1400);later(1200,()=>bark('rafa','s',pick2(['A casa inteira... foi pelos ares.','Tinha gente lá dentro? Tinha gente lá dentro?!','Gás. A cidade inteira vai explodir uma casa por vez.']),{dur:2.4}));return true;}},
  // briga: um sobrevivente mata outro na rua
  {w:3,f(){const s=chFarSpot(260,460);if(!s)return false;const v=chMkPed(s.x,s.y,{st:'cbv',hp:30}),a=chMkPed(s.x+rr(-90,90),s.y+rr(-90,90),{st:'cbk',hp:45,murderer:true});a.col='#2a2a2a';a.prey=v;a.say={t:pick2(['É MEU! A COMIDA É MINHA!','Tu foi mordido! Eu vi! EU VI!','Sai da minha casa!']),life:2};v.say={t:'NÃO! PARA!',life:1.6};AU.cry&&AU.cry('naonao',v.x,v.y,1);return true;}},
  // alguém pegando fogo corre gritando
  {w:2,f(){const s=chFarSpot(220,380);if(!s)return false;const p=chMkPed(s.x,s.y,{st:'cbfire',hp:60});p.burnT=6;p.say={t:'AAAAAH!',life:2};AU.cbVictim?AU.cbVictim(p.x,p.y,1):AU.scream(.6);return true;}},
  // um corpo cai do prédio do lado
  {w:2,f(){const s=chFarSpot(90,200);if(!s)return false;later(600,()=>{AU.thud(1);G.shake+=4;bloodBurst(s.x,s.y,20,Math.random()*6);addDecal({k:'corpse',x:s.x,y:s.y,rot:Math.random()*6,type:'zumbi',col:pick2(PED_LOOK)[0],skin:'#c8a890',r:11});addDecal({k:'blood',x:s.x,y:s.y,r:28,rot:0,seed:Math.random()});});
    AU.cry&&AU.cry('grito',s.x,s.y,.8);later(1600,()=>bark('rafa','s',pick2(['Ele... pulou? Ou empurraram?','Caiu do lado de mim. Do lado.']),{dur:2}));return true;}},
  // carro explode
  {w:2,f(){for(let i=0;i<60;i++){const a=Math.random()*6.283,d=rr(300,700),tx=((P.x+Math.cos(a)*d)/TILE)|0,ty=((P.y+Math.sin(a)*d)/TILE)|0;if(!inb(tx,ty)||ty>=H||getT(tx,ty)!==T.CAR)continue;
    const x=tc(tx),y=tc(ty);CH.noBlame=true;try{explode(x,y,90,60);}catch(e){}CH.noBlame=false;addFire&&addFire(x,y,30,false);return true;}return false;}},
  // tiroteio longe e gritos (só som, raro)
  {w:1,f(){const a=Math.random()*6.283;for(let i=0;i<4;i++)later(i*rr(180,420),()=>AU.pb&&AU.pb('shot_pistola',{vol:.06,far:.95,pan:Math.cos(a),wet:.6}));later(1800,()=>AU.cry&&AU.cry('socorro',P.x+Math.cos(a)*800,P.y+Math.sin(a)*800,1));return true;}},
];
function chTick(dt){
  // os sobreviventes do caos (estados próprios)
  for(const p of peds){if(!p.alive)continue;
    if(p.st==='cbk'){const v=p.prey;if(!v||!v.alive){p.st='leave';p.fade=0;continue;}const d=hyp(v.x-p.x,v.y-p.y),a=Math.atan2(v.y-p.y,v.x-p.x);p.ang=a;p.moving=true;p.walk+=dt*12;
      if(d>22)move(p,Math.cos(a)*118*dt,Math.sin(a)*118*dt,true);else{p.hitT=(p.hitT||0)-dt;if(p.hitT<=0){p.hitT=.55;v.hp-=12;v.hurt=.3;bloodBurst(v.x,v.y,6,a);AU.hit&&AU.hit();}}}
    else if(p.st==='cbv'){let k=peds.find(o=>o.alive&&o.st==='cbk'&&o.prey===p);if(!k){p.st='leave';p.fade=0;continue;}const a=Math.atan2(p.y-k.y,p.x-k.x)+Math.sin(p.t*3)*.5;p.ang=a;p.moving=true;p.walk+=dt*12;move(p,Math.cos(a)*92*dt,Math.sin(a)*92*dt,true);
      p.shoutT-=dt;if(p.shoutT<=0){p.shoutT=rr(1.6,2.6);p.say={t:pick2(['SOCORRO!','ALGUÉM!','NÃO! NÃO!']),life:1.4};}}
    else if(p.st==='cbfire'){p.burnT-=dt;p.hp-=9*dt;const a=p.ang+Math.sin(p.t*5)*1.6;p.ang=a;p.moving=true;p.walk+=dt*14;move(p,Math.cos(a)*120*dt,Math.sin(a)*120*dt,true);
      if(Math.random()<dt*30)parts.push({k:'fire',x:p.x+rr(-8,8),y:p.y+rr(-8,8),vx:rr(-20,20),vy:rr(-50,-10),life:.4,max:.4,s:rr(4,8),c:'#ff8a2a'});}
  }
  if(!chOk())return;
  CH.t-=dt; if(CH.t>0)return; CH.t=rr(28,58)*(G.flags.caos>=2?.8:1);
  const L=CH_EV; let s=L.reduce((a,e)=>a+e.w,0)*Math.random();
  for(const e of L){s-=e.w;if(s<=0){if(!e.f())CH.t=5;return;}}
}

// ===================== CAMBORIÚ: TOCHAS, BRASEIROS, VELAS NAS JANELAS, MAIS MORTES =====================
function cbLightsMedieval(){
  if(!cbOn()||typeof CBL==='undefined'||!CBL.coreto)return;
  const L=(x,y,r)=>lights.push({x,y,r,c:'fire',f:1,cb:1});
  // braseiros nos cantos da praça e na escadaria da Matriz
  for(const [x,y] of [[64,26],[111,26],[64,36],[111,36],[84,23],[92,23],[88,58],[160,40],[196,66]]){const px=tc(x)+16,py=tc(cbY(y))+16;CBD.push({k:'braseiro',x:px,y:py});L(px,py,190);}
  // tochas na fachada da Matriz e ao longo da avenida
  for(let x=74;x<=102;x+=7)CBD.push({k:'tocha',x:tc(x)+16,y:tc(cbY(21))+30}),L(tc(x)+16,tc(cbY(21))+34,120);
  for(let x=8;x<=146;x+=13){for(const y of [37,42]){const px=tc(x)+16,py=tc(cbY(y))+(y===37?24:8);if(SOLID[getT(x,cbY(y))])continue;CBD.push({k:'tocha',x:px,y:py});L(px,py,115);}}
  // uma vela em cada janela (a ordem do Pregador)
  for(const b of buildings){if(b.y<CBY||b.safe||b.kind==='igreja'||!b.doorT||!b.doorT.length)continue;const d=b.doorT[0];const ox=d.side==='W'?-1:d.side==='E'?1:0,oy=d.side==='N'?-1:d.side==='S'?1:0;
    const px=tc(d.x)+16+ox*14,py=tc(d.y)+16+oy*14;CBD.push({k:'vela',x:px,y:py,n:2});L(px,py,70);}
  // gente que já foi oferecida: corpos com velas pela cidade, enforcados nas figueiras
  for(const [x,y] of [[69,28],[95,28],[107,34],[72,34]])CBD.push({k:'enforcado',x:tc(x)+16,y:tc(cbY(y))+34});
  for(const [x,y] of [[42,40],[124,24],[100,57],[20,57],[60,46],[132,43]]){const px=tc(x)+16,py=tc(cbY(y))+16;GORE.push({k:'corpse',x:px,y:py,rot:(x*7)%6,type:'cult',col:'#6a5a4a',skin:'#c8a888',r:11,cb:1});GORE.push({k:'blood',x:px,y:py,r:24,rot:0,seed:.3,cb:1});
    for(let i=0;i<3;i++){const a=i/3*6.283;CBD.push({k:'vela',x:px+Math.cos(a)*22,y:py+Math.sin(a)*18,n:1});}}
  for(const [x,y] of [[120,56],[52,40],[176,43]])CBD.push({k:'cabecas',x:tc(x)+16,y:tc(cbY(y))+16});
}
(function(){
  const g=genV12; genV12=function(){g();try{cbLightsMedieval();}catch(e){console.error(e);}};
  // desenho dos novos enfeites de Camboriú
  const dd=cbDrawDeco; cbDrawDeco=function(){dd();if(!cbOn()||P.y<(CBY-30)*TILE)return;
    const vx0=cam.x-80,vy0=cam.y-80,vx1=cam.x+view.w/view.z+80,vy1=cam.y+view.h/view.z+80;
    for(const d of CBD){if(d.x<vx0||d.x>vx1||d.y<vy0||d.y>vy1)continue;
      if(d.k==='tocha'){ctx.save();ctx.translate(d.x,d.y);ctx.fillStyle='#3a2a1a';ctx.fillRect(-1.5,-4,3,12);const f=Math.sin(renderT*13+d.x)*1.2;
        ctx.fillStyle='rgba(255,150,50,.25)';ctx.beginPath();ctx.arc(0,-8,11,0,6.283);ctx.fill();ctx.fillStyle='#ff9a30';ctx.beginPath();ctx.ellipse(f*.5,-8,3.2,5.5,0,0,6.283);ctx.fill();ctx.fillStyle='#ffe0a0';ctx.beginPath();ctx.ellipse(f*.3,-7,1.4,2.6,0,0,6.283);ctx.fill();ctx.restore();
        if(Math.random()<.04)parts.push({k:'fire',x:d.x+rr(-2,2),y:d.y-12,vx:rr(-6,6),vy:rr(-40,-20),life:.4,max:.4,s:2,c:'#ffb347'});}
      else if(d.k==='braseiro'){ctx.save();ctx.translate(d.x,d.y);ctx.fillStyle='#2a2420';ctx.beginPath();ctx.arc(0,0,10,0,6.283);ctx.fill();ctx.strokeStyle='#5a5048';ctx.lineWidth=2;ctx.stroke();
        for(let i=0;i<5;i++){const a=renderT*4+i*1.3;ctx.fillStyle=`rgba(255,${110+i*24},30,${.55+.3*Math.sin(a*2)})`;ctx.beginPath();ctx.ellipse(Math.sin(a)*3,-i*2.4,8-i,10-i*1.4,0,0,6.283);ctx.fill();}ctx.restore();
        if(Math.random()<.12)parts.push({k:'fire',x:d.x+rr(-5,5),y:d.y-10,vx:rr(-10,10),vy:rr(-60,-30),life:.5,max:.5,s:rr(2,4),c:'#ffb347'});if(Math.random()<.03)parts.push({k:'smoke',x:d.x,y:d.y-14,vx:rr(-6,6),vy:rr(-30,-15),life:1.6,max:1.6,s:rr(8,12),c:'#2a2724'});}
      else if(d.k==='cabecas'){ctx.save();ctx.translate(d.x,d.y);for(let i=-1;i<=1;i++){ctx.strokeStyle='#3a2a1a';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(i*9,8);ctx.lineTo(i*9,-8);ctx.stroke();ctx.fillStyle=i?'#b8a088':'#a89078';ctx.beginPath();ctx.arc(i*9,-10,4.4,0,6.283);ctx.fill();ctx.fillStyle='rgba(110,16,12,.8)';ctx.fillRect(i*9-2.5,-6.5,5,4);}ctx.restore();}
      else if(d.k==='estaca'){ctx.save();ctx.translate(d.x,d.y);ctx.strokeStyle='#2a1a0c';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,10);ctx.lineTo(0,-14);ctx.stroke();ctx.fillStyle='#1a1410';ctx.beginPath();ctx.ellipse(0,-6,6,9,0,0,6.283);ctx.fill();
        const on=(d.t||0)<40;if(on){for(let i=0;i<6;i++){const a=renderT*5+i;ctx.fillStyle=`rgba(255,${120+i*20},40,${.5+.3*Math.sin(a*2)})`;ctx.beginPath();ctx.ellipse(Math.sin(a)*4,2-i*3.4,10-i,13-i*1.6,0,0,6.283);ctx.fill();}}ctx.restore();
        d.t=(d.t||0)+(lastDt||.016);if(on&&Math.random()<.06)parts.push({k:'smoke',x:d.x,y:d.y-20,vx:rr(-8,8),vy:rr(-40,-20),life:2,max:2,s:rr(10,16),c:'#2a2724'});}
    }};
  // mais gente sendo morta em Camboriú
  if(typeof CB_EVT!=='undefined'){
    CB_EVT.push(
      {w:3,f:()=>cbRitual()},
      // alguém foge correndo, com cultistas e um Marcado atrás: dá pra salvar, se for rápido
      {w:3,f:()=>{const s=cbSpot(260,420);if(!s)return false;const p=chMkPed(s.x,s.y,{st:'flee',hp:40,turned:true,help:['ELES VÃO ME OFERECER! SOCORRO!','ME TIRA DAQUI!','NÃO DEIXA ELES ME LEVAREM!'],thanks:['Obrigado... eu vou pro mato. Pro mato.']});
        for(let i=0;i<3;i++){const e=makeEnemy(i?'cult':'marc',s.x+rr(-160,160),s.y+rr(-160,160),null);e.cb=1;e.prey=p;e.state='investigate';e.nx=s.x;e.ny=s.y;e.it=30;enemies.push(e);}
        p.say={t:'SOCORRO!',life:1.6};return true;}},
      // um oferecido queimando numa estaca
      {w:2,f:()=>{const s=cbSpot(300,520);if(!s)return false;CBD.push({k:'estaca',x:s.x,y:s.y,tmp:1,t:0});const l={x:s.x,y:s.y,r:200,c:'fire',f:1,cb:1};lights.push(l);later(40000,()=>{l.off=true;});AU.cbVictim(s.x,s.y,1);
        later(1400,()=>bark('rafa','s',pick2(['Tem alguém amarrado naquilo... pegando fogo.','Eles queimaram uma pessoa. Viva.']),{dur:2.2}));return true;}},
      // cabeças em estacas no caminho
      {w:1,f:()=>{const t=cbSpot(180,320);if(!t)return false;CBD.push({k:'cabecas',x:t.x,y:t.y,tmp:1});return true;}},
    );
  }
  // tick e carregar
  const vt=v16Tick; v16Tick=function(dt){vt(dt);if(G.mode!=='play')return;try{chTick(dt);}catch(e){console.error(e);}};
  const aws=applyWorldState; applyWorldState=function(){aws();CH.fx=[];for(const id of (G.flags.destr||[]))chDestroy(buildings[id],false);};
  const rs=resetState; resetState=function(d){rs(d);CH.t=30;CH.fx=[];};
})();

// ===================== MENU DE TESTE =====================
dbgExtra('1.13 · Caos, missões e registros',[['v113:caos','Caos: evento agora'],['v113:casa','Caos: explodir uma casa perto'],['v113:briga','Caos: briga na rua'],['v113:fogo','Caos: alguém pegando fogo'],['v113:ped','Sobrevivente aqui (para testar matar)'],['v113:missoes','Abrir a aba Missões'],['v113:slots','Abrir os Registros']],
  function(k){const close=()=>{if(UI.close)UI.close();G.mode='play';},F=G.flags;
    if(!F.postoBoom&&['v113:caos','v113:casa','v113:briga','v113:fogo'].includes(k)){F.postoBoom=true;F.caos=Math.max(F.caos||0,1);}
    switch(k){
      case 'v113:caos':close();CH.t=0;return;
      case 'v113:casa':close();return CH_EV[0].f()||toast('Nenhuma casa liberada por perto.');
      case 'v113:briga':close();return CH_EV[1].f()||toast('Sem lugar aqui.');
      case 'v113:fogo':close();return CH_EV[2].f()||toast('Sem lugar aqui.');
      case 'v113:ped':close();{const p=chMkPed(P.x+Math.cos(P.ang)*90,P.y+Math.sin(P.ang)*90,{st:'calm',hp:40});p.saved=true;}return;
      case 'v113:missoes':return UI.inv('missoes');
      case 'v113:slots':return UI.slots('save');
    }});
