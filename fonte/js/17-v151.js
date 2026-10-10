// ===================== 1.5.1: MALETA DE VERDADE · QUICK TIME MAIS DIFÍCIL · SAÍDA DA GALERIA =====================

// ---------- MALETA: cada coisa tem lugar fixo, você arruma ----------
// G.mpos guarda onde cada coisa está: {chave:{x,y,w,h}}. Arma: 'w'+índice. Item: 'i'+uid da pilha.
function mKey(i,s){if(!s.u)s.u=(G.mU=(G.mU||0)+1);return 'i'+s.u;}
function mItems(){
  const out=[];
  for(let i=1;i<WEAPONS.length;i++)if(i!==8&&P.owned[i]&&WSZ[i])out.push({k:'w'+i,w:WSZ[i][0],h:WSZ[i][1]});
  G.inv.forEach((s,i)=>{if(!s)return;const z=isz(s.id);if(z)out.push({k:mKey(i,s),w:z[0],h:z[1]});});
  return out;
}
function mGrid(skip){
  const mw=G.mw||8,mh=G.mh||6,g=new Uint8Array(mw*mh);
  for(const k in (G.mpos||{})){if(k===skip)continue;const p=G.mpos[k];for(let j=p.y;j<p.y+p.h;j++)for(let i=p.x;i<p.x+p.w;i++)if(i<mw&&j<mh)g[j*mw+i]=1;}
  return g;
}
function mFree(g,x,y,w,h){const mw=G.mw||8,mh=G.mh||6;if(x<0||y<0||x+w>mw||y+h>mh)return false;for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)if(g[j*mw+i])return false;return true;}
function mFind(w,h,skip){const g=mGrid(skip),mw=G.mw||8,mh=G.mh||6;for(const [a,b] of (w===h?[[w,h]]:[[w,h],[h,w]]))for(let y=0;y<mh;y++)for(let x=0;x<mw;x++)if(mFree(g,x,y,a,b))return {x,y,w:a,h:b};return null;}
// mantém G.mpos igual ao que existe de verdade (tira o que saiu, acha lugar pro que entrou)
function mSync(){
  if(!G.mpos)G.mpos={};
  const items=mItems(), keys=new Set(items.map(i=>i.k));
  for(const k in G.mpos)if(!keys.has(k))delete G.mpos[k];
  const mw=G.mw||8,mh=G.mh||6;
  for(const k in G.mpos){const p=G.mpos[k];if(p.x+p.w>mw||p.y+p.h>mh)delete G.mpos[k];}
  let lost=[];
  for(const it of items){if(G.mpos[it.k])continue;const f=mFind(it.w,it.h,null);if(f)G.mpos[it.k]=f;else lost.push(it);}
  if(lost.length){const p=packMaleta(items);if(p){G.mpos={};for(const k in p)G.mpos[k]=p[k];}}
}
function mOrganize(){const p=packMaleta(mItems());if(!p){toast('Não deu pra organizar: tem coisa demais.');return false;}G.mpos={};for(const k in p)G.mpos[k]=p[k];AU.click();return true;}
function mCanAdd(w,h){mSync();return !!mFind(w,h,null);}
function mCouldAfterOrganize(extra){return !!packMaleta(mItems().concat(extra));}
(function(){
  // agora "cabe" = tem um buraco livre do tamanho certo, sem mexer no resto
  maletaFits=function(extra){mSync();if(!extra||!extra.length)return true;
    const saved=JSON.stringify(G.mpos);let ok=true;
    for(const it of extra){const f=mFind(it.w,it.h,null);if(!f){ok=false;break;}G.mpos['tmp'+Math.random()]=f;}
    G.mpos=JSON.parse(saved);return ok;};
  const ia=invAdd;
  invAdd=function(id,q){
    const st=ITEMS[id].st;
    for(const s of G.inv){if(q<=0)break;if(s&&s.id===id&&s.q<st){const a=Math.min(st-s.q,q);s.q+=a;q-=a;}}
    const z=isz(id); mSync();
    while(q>0){
      let i=G.inv.indexOf(null); if(i<0){G.inv.push(null);i=G.inv.length-1;G.slots=G.inv.length;}
      let spot=null; if(z){spot=mFind(z[0],z[1],null);if(!spot)break;}
      const a=Math.min(st,q); const s={id,q:a}; G.inv[i]=s; if(spot)G.mpos[mKey(i,s)]=spot; q-=a;
    }
    return q;
  };
  const tp=takePickup;
  takePickup=function(p){
    if(p.kind==='item'&&isz(p.id)){const z=isz(p.id);const merge=G.inv.some(s=>s&&s.id===p.id&&s.q<ITEMS[p.id].st);
      if(!merge&&!mCanAdd(z[0],z[1])){if(mCouldAfterOrganize([{k:'n',w:z[0],h:z[1]}]))toast('Não cabe assim. Abra a maleta e arrume (ou toque em Organizar).');else toast('Maleta cheia. Largue algo ou guarde no baú de um abrigo.');AU.locked();return;}}
    if(p.kind==='weapon'&&p.id!==0&&p.id!==8&&!P.owned[p.id]&&WSZ[p.id]&&!mCanAdd(WSZ[p.id][0],WSZ[p.id][1])){
      if(mCouldAfterOrganize([{k:'nw',w:WSZ[p.id][0],h:WSZ[p.id][1]}]))toast(`${WEAPONS[p.id].n}: não cabe assim. Abra a maleta e arrume o espaço.`);else toast(`${WEAPONS[p.id].n} não cabe na maleta. Largue ou guarde algo no baú.`);AU.locked();return;}
    const r=tp(p); mSync(); return r;
  };
  const ser=serialize; serialize=function(){mSync();const s=ser();s.mpos=G.mpos;s.mU=G.mU||0;return s;};
  const ls=loadState; loadState=function(s){
    // cópia do baú do registro: o carregamento antigo (1.4) arruma a maleta e joga no baú o que não coube, mexendo em s.box
    const box0=s&&s.mpos?JSON.parse(JSON.stringify(s.box||[])):null; ls(s);
    if(s.mpos){G.inv=new Array(64).fill(null);(s.inv||[]).filter(Boolean).forEach((x,i)=>{G.inv[i]={id:x.id,q:x.q,u:x.u};});G.box=box0;}
    G.mU=Math.max(G.mU||0,s.mU||0);for(const it of G.inv)if(it&&it.u)G.mU=Math.max(G.mU,it.u);G.mpos=s.mpos||{};mSync();};
  const rs=resetState; resetState=function(d){rs(d);G.mpos={};G.mU=0;};
})();

// ---------- ícones desenhados de cada item (no tamanho que ele ocupa) ----------
const MICO={};
function itemIconURL(id,w,h){
  const key=id+w+'x'+h; if(key in MICO)return MICO[key];
  try{
    const S=40,c=document.createElement('canvas');c.width=w*S;c.height=h*S;const g=c.getContext('2d');const it=ITEMS[id]||{};
    const W2=c.width,H2=c.height,cx=W2/2,cy=H2/2;
    const box=(x,y,ww,hh,col,edge)=>{g.fillStyle=col;g.fillRect(x,y,ww,hh);g.strokeStyle=edge||'rgba(0,0,0,.5)';g.lineWidth=2;g.strokeRect(x+1,y+1,ww-2,hh-2);};
    const bullets=(n,col,tip,x0,y0,dx,len)=>{for(let i=0;i<n;i++){const x=x0+i*dx;g.fillStyle=col;g.fillRect(x,y0,5,len);g.fillStyle=tip;g.beginPath();g.moveTo(x,y0);g.lineTo(x+2.5,y0-5);g.lineTo(x+5,y0);g.fill();}};
    const leaf=(col,dark)=>{g.fillStyle='#5a3a24';g.fillRect(cx-9,H2-18,18,14);g.fillStyle='#3a2414';g.fillRect(cx-11,H2-20,22,4);
      for(const [a,l] of [[-1.9,26],[-1.2,30],[-.5,24],[-2.6,22]]){g.fillStyle=col;g.beginPath();g.ellipse(cx+Math.cos(a)*l*.5,H2-20+Math.sin(a)*l*.7,6,l*.42,a+1.57,0,6.283);g.fill();g.strokeStyle=dark;g.lineWidth=1;g.beginPath();g.moveTo(cx,H2-20);g.lineTo(cx+Math.cos(a)*l*.9,H2-20+Math.sin(a)*l*1.2);g.stroke();}};
    switch(id){
      case 'm9':case 'r762':box(4,cy-8,W2-8,22,id==='m9'?'#7a6a3a':'#4a5a3a');bullets(id==='m9'?8:6,'#c9a24a','#d8c890',10,cy-4,id==='m9'?8:11,id==='m9'?12:16);g.fillStyle='#121110';g.font='700 10px sans-serif';g.fillText(id==='m9'?'9mm':'7.62',8,cy+12);break;
      case 'cart':for(let i=0;i<5;i++){g.fillStyle='#b5492f';g.fillRect(8+i*14,cy-12,10,22);g.fillStyle='#c9a24a';g.fillRect(8+i*14,cy+6,10,6);}break;
      case 'm357':bullets(4,'#c7c2b4','#9a948a',8,cy-2,8,14);break;
      case 'virote':for(let i=0;i<4;i++){g.strokeStyle='#9a8460';g.lineWidth=3;g.beginPath();g.moveTo(8,cy-10+i*7);g.lineTo(W2-10,cy-10+i*7);g.stroke();g.fillStyle='#c8c4b8';g.beginPath();g.moveTo(W2-10,cy-13+i*7);g.lineTo(W2-3,cy-10+i*7);g.lineTo(W2-10,cy-7+i*7);g.fill();}break;
      case 'g40':for(let i=0;i<3;i++){g.fillStyle='#8a9a4a';g.fillRect(10+i*20,cy-10,14,20);g.fillStyle='#c9a24a';g.beginPath();g.arc(17+i*20,cy-10,7,Math.PI,0);g.fill();}break;
      case 'comb':box(cx-16,8,32,H2-14,'#d0702c');g.fillStyle='#3a2a1a';g.fillRect(cx-6,2,12,8);g.fillStyle='#121110';g.font='700 9px sans-serif';g.fillText('COMB',cx-13,cy+4);break;
      case 'pilha':g.fillStyle='#2a3a5a';g.fillRect(cx-9,6,18,H2-10);g.fillStyle='#8fb0d0';g.fillRect(cx-9,6,18,10);g.fillStyle='#c8c4b8';g.fillRect(cx-4,2,8,5);break;
      case 'gran':g.fillStyle='#4a5a2e';g.beginPath();g.ellipse(cx,cy+8,13,19,0,0,6.283);g.fill();g.strokeStyle='#2a3418';g.lineWidth=2;for(let y=-8;y<=20;y+=7){g.beginPath();g.moveTo(cx-12,cy+y);g.lineTo(cx+12,cy+y);g.stroke();}g.fillStyle='#8a8e92';g.fillRect(cx-5,cy-16,10,8);g.strokeStyle='#c8c4b8';g.beginPath();g.arc(cx+8,cy-14,5,0,6.283);g.stroke();break;
      case 'garrafa':g.fillStyle='rgba(106,154,122,.85)';g.fillRect(cx-8,cy-6,16,H2/2+2);g.fillRect(cx-4,6,8,cy-10);g.fillStyle='rgba(255,255,255,.3)';g.fillRect(cx-5,cy-2,3,20);break;
      case 'rojao':g.fillStyle='#d84a8a';g.fillRect(cx-7,12,14,H2-20);g.fillStyle='#e8d8a0';for(let y=16;y<H2-10;y+=8)g.fillRect(cx-7,y,14,2);g.strokeStyle='#8a6a4a';g.beginPath();g.moveTo(cx,12);g.lineTo(cx+4,3);g.stroke();break;
      case 'sinal':g.fillStyle='#e8503a';g.fillRect(cx-6,8,12,H2-14);g.fillStyle='#2a1a14';g.fillRect(cx-6,8,12,8);g.fillStyle='#ffd27a';g.beginPath();g.arc(cx,8,5,0,6.283);g.fill();break;
      case 'calmante':box(4,cy-12,W2-8,24,'#d8d8e0');g.fillStyle='#9ab8d8';for(let j=0;j<2;j++)for(let i=0;i<3;i++){g.beginPath();g.ellipse(10+i*10,cy-5+j*10,3.5,3,0,0,6.283);g.fill();}break;
      case 'ervaV':leaf('#4f9a4a','#2a5a26');break;
      case 'ervaR':leaf('#b03a3a','#6a1a1a');break;
      case 'misVV':case 'misVR':g.fillStyle='rgba(220,220,210,.5)';g.fillRect(cx-11,14,22,H2-20);g.fillStyle=id==='misVV'?'#3f8a46':'#a8603a';g.fillRect(cx-10,30,20,H2-37);g.fillStyle='#8a7a5a';g.fillRect(cx-12,9,24,7);break;
      case 'spray':g.fillStyle='#e8e4d8';g.fillRect(cx-10,18,20,H2-24);g.fillStyle='#2a8a4a';g.fillRect(cx-10,34,20,14);g.fillStyle='#fff';g.fillRect(cx-2,36,4,10);g.fillRect(cx-5,39,10,4);g.fillStyle='#8a8e92';g.fillRect(cx-5,8,10,11);g.fillRect(cx+4,9,6,4);break;
      case 'polv':case 'polvF':g.fillStyle=id==='polv'?'#8a8070':'#a8704e';g.beginPath();g.moveTo(cx-12,10);g.lineTo(cx+12,10);g.lineTo(cx+15,H2-6);g.lineTo(cx-15,H2-6);g.closePath();g.fill();g.fillStyle='#3a3a36';g.fillRect(cx-12,8,24,4);g.fillStyle='#121110';g.font='700 8px sans-serif';g.fillText(id==='polv'?'PÓLV':'PÓLV+',cx-12,cy+6);break;
      case 'pecas':g.strokeStyle='#a8a49c';g.lineWidth=4;for(const [x,y,r] of [[cx-6,cy-4,8],[cx+8,cy+6,6]]){g.beginPath();g.arc(x,y,r,0,6.283);g.stroke();for(let k=0;k<8;k++){const a=k/8*6.283;g.fillStyle='#a8a49c';g.fillRect(x+Math.cos(a)*(r+2)-2,y+Math.sin(a)*(r+2)-2,4,4);}}break;
      case 'detector':box(6,cy-12,W2-12,24,'#2a2e32');g.fillStyle='#5ad07a';g.beginPath();g.arc(cx-8,cy,8,0,6.283);g.fill();g.fillStyle='#0e1a12';g.beginPath();g.arc(cx-8,cy,5,0,6.283);g.fill();g.fillStyle='#d8261e';g.fillRect(cx+10,cy-4,6,4);break;
      case 'silenciador':g.fillStyle='#2a2c2e';g.fillRect(8,cy-6,W2-16,12);g.fillStyle='#4a4e52';for(let x=14;x<W2-10;x+=8)g.fillRect(x,cy-6,2,12);break;
      default:{g.fillStyle=it.c||'#6a6460';g.fillRect(6,6,W2-12,H2-12);g.fillStyle='rgba(0,0,0,.35)';g.fillRect(6,H2-16,W2-12,10);g.fillStyle='#121110';g.font='700 10px sans-serif';g.textAlign='center';g.fillText(it.s||'?',cx,cy+3);}
    }
    MICO[key]=c.toDataURL('image/png');
  }catch(e){MICO[key]=null;}
  return MICO[key];
}

// ---------- tela da maleta: selecionar, mover, girar, organizar ----------
UI.itensBody=function(){
  mSync();
  const r=P.hp/P.max, st=r>=.6?['Bem','ok']:r>=.3?['Cuidado','warn']:['Perigo','bad'];
  const mw=G.mw||8, mh=G.mh||6, cell=`min(40px, calc((100vw - 64px) / ${mw}))`;
  const mv=this.mmove||null, rot=!!this.mrot;
  let cells='';
  // o fundo: uma casinha clicável por posição (para soltar o que está sendo movido)
  for(let y=0;y<mh;y++)for(let x=0;x<mw;x++)cells+=`<button class="mbg${mv?' on':''}" data-a="mput" data-x="${x}" data-y="${y}" aria-label="Espaço ${x+1},${y+1}" style="grid-column:${x+1};grid-row:${y+1}"></button>`;
  for(const k in G.mpos){const p=G.mpos[k];let inner='',lab='',sel=false,da='';
    if(k[0]==='w'){const i=+k.slice(1),w=WEAPONS[i];if(!w)continue;sel=this.wsel===i;da=`data-a="wsel" data-w="${i}"`;const url=weaponIconURL(i);
      inner=`${url?`<img alt="" src="${url}" style="${p.h>p.w?`width:${p.h*34}px;transform:rotate(90deg)`:'max-width:94%;max-height:90%'}">`:''}<span class="mq">${i===9?0:i+1}</span>${P.w===i?'<span class="mon">●</span>':''}`;lab=w.n;}
    else{const i=G.inv.findIndex(s=>s&&('i'+s.u)===k);if(i<0)continue;const s=G.inv[i],it=ITEMS[s.id];sel=this.sel===i;da=`data-a="slot" data-i="${i}"`;const url=itemIconURL(s.id,p.w,p.h);
      inner=`${url?`<img alt="" src="${url}" style="width:100%;height:100%;object-fit:contain">`:`<span class="mlab" style="--c:${it.c}">${esc(it.s)}</span>`}${it.st>1?`<span class="q">${s.q}</span>`:''}`;lab=it.n;}
    const moving=mv===k;
    cells+=`<button class="mcell${sel?' on':''}${moving?' mov':''}" ${da} data-mk="${k}" aria-label="${esc(lab)}" style="grid-column:${p.x+1}/span ${p.w};grid-row:${p.y+1}/span ${p.h};${mv&&!moving?'pointer-events:none;opacity:.55':''}">${inner}</button>`;}
  const keys=G.inv.map((s,i)=>s&&!isz(s.id)?`<button class="li${this.sel===i?' on':''}" data-a="slot" data-i="${i}"><span class="lico">${iconHTML(s.id)}</span><b>${esc(ITEMS[s.id].n)}</b></button>`:'').join('');
  const used=Object.values(G.mpos).reduce((n,p)=>n+p.w*p.h,0);
  let det='<p class="hint">Toque numa arma ou num item para ver o que fazer. Para arrumar: segure o item e arraste até o lugar. Enquanto arrasta, aperte R (ou toque com outro dedo) pra girar.</p>';
  const selKey=this.wsel!=null?'w'+this.wsel:(this.sel!=null&&G.inv[this.sel]&&isz(G.inv[this.sel].id)?'i'+G.inv[this.sel].u:null);
  const moveRow=selKey?`<div class="row">${mv===selKey?`<button class="btn primary" data-a="mrot">Girar (${rot?'deitado':'em pé'})</button><button class="btn ghost" data-a="mcancel">Cancelar</button><span class="hint">Agora toque no lugar da maleta.</span>`:`<button class="btn" data-a="mspin" data-k="${selKey}">Girar aqui</button>`}</div>`:'';
  if(this.wsel!=null&&P.owned[this.wsel]){const i=this.wsel,w=WEAPONS[i];
    det=`<h3>${esc(w.n)}</h3><p>${w.melee?'Corpo a corpo.':`Pente ${P.mags[i]}/${w.mag} · ${invCount(w.ammo)} ${esc(ITEMS[w.ammo].n.toLowerCase())} na maleta.`} Ocupa ${WSZ[i][0]}×${WSZ[i][1]}.</p>
      <div class="row"><button class="btn primary" data-a="wpn" data-w="${i}">${P.w===i?'Na mão':'Equipar'}</button><button class="btn ghost" data-a="wdrop" data-w="${i}">Largar no chão</button></div>${moveRow}`;}
  else if(this.sel!=null&&G.inv[this.sel]){
    const s=G.inv[this.sel],it=ITEMS[s.id]; const acts=[]; const z=isz(s.id);
    if(it.k==='heal'||it.k==='battery')acts.push(`<button class="btn primary" data-a="use">Usar</button>`);
    if(it.k==='throw'||s.id==='gran')acts.push(`<button class="btn primary" data-a="thr">${curThrow()===s.id?'Na mão':'Deixar na mão'}</button>`);
    if(s.id==='silenciador')acts.push(`<button class="btn primary" data-a="sil">Rosquear na pistola</button>`);
    if(s.id==='detector')acts.push(`<button class="btn primary" data-a="det">${G.detOn?'Desligar':'Ligar'}</button>`);
    if(it.k==='key')acts.push(`<span class="hint">Itens-chave não ocupam espaço e são usados sozinhos no lugar certo.</span>`);
    if(it.k!=='key')acts.push(`<button class="btn ghost" data-a="drop">Largar no chão</button>`);
    det=`<h3>${esc(it.n)}${s.q>1?` <span class="dim">×${s.q}</span>`:''}</h3><p>${esc(it.d)}${z?` Ocupa ${z[0]}×${z[1]}.`:''}</p><div class="row">${acts.join('')}</div>${z?moveRow:''}`;}
  const melee=[0,8].filter(i=>P.owned[i]).map(i=>`<button class="wpn${P.w===i?' on':''}" data-a="wpn" data-w="${i}"><span class="k">${i+1}</span><b>${WEAPONS[i].n}</b><small>${i===0?'aguenta '+P.dur+' golpes':'empurra e derruba'}</small></button>`).join('');
  const recs=RECIPES.map((rc,i)=>{const need=Object.entries(rc.need).map(([k,n])=>`${n} ${ITEMS[k].n}`).join(' + ');const ok=canCraft(rc);
    return `<button class="rec" data-a="craft" data-r="${i}" ${ok?'':'disabled'}><span>${esc(need)}</span><b>→ ${esc(ITEMS[rc.give[0]].n)}${rc.give[1]>1?' ×'+rc.give[1]:''}</b></button>`;}).join('');
  return `<div class="inv-grid">
    <section class="col"><div class="status ${st[1]}"><span>Condição</span><b>${st[0]}</b></div>
      <h3>Maleta <span class="dim">${used}/${mw*mh}</span> <button class="btn ghost mini" data-a="morg">Organizar</button></h3>
      <div class="maleta${mv?' moving':''}" style="grid-template-columns:repeat(${mw},${cell});grid-template-rows:repeat(${mh},${cell})">${cells}</div>
      <div class="wpns">${melee}</div>
      ${keys?`<h3>Itens-chave</h3><div class="list">${keys}</div>`:''}</section>
    <section class="col"><div class="detail">${det}</div><h3>Fabricar</h3><div class="recs">${recs}</div></section></div>`;
};
(function(){
  try{const st=document.createElement('style');st.textContent=`.maleta{position:relative;background:repeating-linear-gradient(0deg,#1c1a16 0 1px,transparent 1px 100%),#221f1a}
    .mbg{background:#262219;border:1px solid #3a3428;padding:0;min-width:0;min-height:0;cursor:default}.mbg.on{cursor:pointer;background:#2e2a1e;border-color:#6a5a36}.mbg.on:hover{background:#4a3e22}
    .mcell{z-index:1}.mcell.mov{outline:2px dashed var(--amber);opacity:.85}.mcell img{image-rendering:auto}.btn.mini{font-size:11px;padding:3px 8px;min-height:24px;margin-left:8px;vertical-align:middle}`;document.head.appendChild(st);}catch(e){}
  const act=UI.act.bind(UI);
  UI.act=function(a,ds){
    switch(a){
      case 'mmove':{this.mmove=ds.k;const p=G.mpos[ds.k];this.mrot=p?p.w<p.h:false;return this.inv('itens');}
      case 'mcancel':this.mmove=null;return this.inv('itens');
      case 'mrot':this.mrot=!this.mrot;return this.inv('itens');
      case 'mput':{const k=this.mmove;if(!k)return;const p=G.mpos[k];if(!p){this.mmove=null;return this.inv('itens');}
        const base=k[0]==='w'?WSZ[+k.slice(1)]:isz((G.inv.find(s=>s&&'i'+s.u===k)||{}).id);if(!base){this.mmove=null;return this.inv('itens');}
        let w=base[0],h=base[1];if(w!==h&&(this.mrot?w>h:w<h)){const t=w;w=h;h=t;}
        const x=+ds.x,y=+ds.y,g=mGrid(k);
        if(!mFree(g,x,y,w,h)){AU.locked();toast('Não cabe aí.');return;}
        G.mpos[k]={x,y,w,h};this.mmove=null;AU.click();return this.inv('itens');}
      case 'mspin':{const k=ds.k,p=G.mpos[k];if(!p||p.w===p.h)return this.inv('itens');const g=mGrid(k);
        if(mFree(g,p.x,p.y,p.h,p.w)){G.mpos[k]={x:p.x,y:p.y,w:p.h,h:p.w};AU.click();}else{const f=mFind(p.h,p.w,k);if(f&&f.w===p.h){G.mpos[k]=f;AU.click();}else{AU.locked();toast('Sem espaço pra girar aí. Mova antes.');}}return this.inv('itens');}
      case 'morg':mOrganize();this.mmove=null;return this.inv('itens');
      case 'slot':case 'wsel':if(this.mmove)return;break;
      case 'close':case 'tab':this.mmove=null;break;
    }
    return act(a,ds);
  };
  // os outros lugares que mexem na maleta continuam em ordem
  const uc=UI.close.bind(UI); UI.close=function(){this.mmove=null;mSync();return uc();};
})();

// ---------- QUICK TIME DO BRANDT: mais rápido, aparece em lugares diferentes e muda o botão ----------
const QKEYS=[{k:'KeyE',l:'E'},{k:'KeyQ',l:'Q'},{k:'KeyF',l:'F'},{k:'Space',l:'ESPAÇO'},{k:'KeyR',l:'R'}];
function qtePrep(q){
  if(!q||!q.multi)return;
  const pool=QKEYS.slice(0,q.ph>=3?5:q.ph>=2?4:3);
  q.key=pick2(pool.filter(k=>k.k!==(q.key&&q.key.k)))||pool[0];
  q.off={x:rr(-.3,.3),y:rr(-.22,.22)};
  // no toque: três círculos, só um é o certo
  const n=3, opts=[q.key.l]; while(opts.length<n){const o=pick2(pool).l;if(!opts.includes(o))opts.push(o);}
  q.opts=opts.sort(()=>Math.random()-.5).map((l,i)=>({l,i}));
}
(function(){
  const qs=qteStart;
  qteStart=function(o){qs(o);const q=G.qte;if(q&&o.multi){q.multi=true;q.ph=o.ph||1;q.dur=o.dur||.9;q.w0=.55;q.w1=.82;qtePrep(q);}};
  const qp=qtePress;
  qtePress=function(x,y,code){
    const q=G.qte; if(!q||q.done||q.hold>0)return;
    if(q.multi){
      let right=false;
      if(code){right=code===q.key.k;}
      else if(x!=null&&q.hit){for(const h of q.hit){if(hyp(x-h.x,y-h.y)<h.r+6){right=h.l===q.key.l;break;}}if(!q.hit.some(h=>hyp(x-h.x,y-h.y)<h.r+6))return;}
      else return; // clique do mouse ou botão Usar: não conta nem erra (só a tecla certa ou o botão certo na tela)
      if(!right){qteFail();return;}
    }
    const i0=q.i; qp(); const q2=G.qte; if(q2&&q2===q&&q.i>i0&&q.multi){q.dur=rr(.72,.92)*(q.ph>=3?.85:1);const w=rr(.45,.6);q.w0=w;q.w1=w+rr(.2,.26);qtePrep(q);}
  };
  // teclado: durante o quick time as teclas viram os botões do golpe (não acendem lanterna nem curam)
  if(document.addEventListener)document.addEventListener('keydown',e=>{
    const q=G.qte; if(!q||G.mode!=='play'||CUT.on)return;
    if(!q.multi)return;
    if(e.repeat){e.stopPropagation();e.preventDefault();return;}
    const known=QKEYS.some(k=>k.k===e.code); if(!known)return;
    e.stopPropagation(); e.preventDefault(); qtePress(null,null,e.code);
  },true);
  const dq=drawQTE;
  drawQTE=function(){
    const q=G.qte; if(!q||!q.multi)return dq();
    if(G.mode!=='play'||CUT.on)return;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    const cx=clamp(view.w/2+q.off.x*view.w,110,view.w-110), cy=clamp(view.h/2+q.off.y*view.h,120,view.h-(IN.touch?210:110)), k=clamp(q.t/q.dur,0,1), R0=58, r=R0*(1-k)+8;
    const rw0=R0*(1-q.w1)+8, rw1=R0*(1-q.w0)+8, inW=k>=q.w0&&k<=q.w1;
    ctx.fillStyle='rgba(0,0,0,.55)';ctx.beginPath();ctx.arc(cx,cy,R0+12,0,6.283);ctx.fill();
    ctx.strokeStyle='rgba(217,163,60,.85)';ctx.lineWidth=rw1-rw0;ctx.beginPath();ctx.arc(cx,cy,(rw0+rw1)/2,0,6.283);ctx.stroke();
    ctx.strokeStyle=inW?'#fff6d8':'#e8e0d0';ctx.lineWidth=3;ctx.beginPath();ctx.arc(cx,cy,r,0,6.283);ctx.stroke();
    ctx.textAlign='center';ctx.textBaseline='middle';
    if(IN.touch){
      // três botões: toque no que está escrito em cima
      q.hit=[];const n=q.opts.length;
      for(const o of q.opts){const bx=cx+(o.i-(n-1)/2)*74,by=cy+R0+54;
        ctx.fillStyle='rgba(0,0,0,.7)';ctx.beginPath();ctx.arc(bx,by,26,0,6.283);ctx.fill();ctx.strokeStyle='#d9a33c';ctx.lineWidth=2;ctx.stroke();
        ctx.fillStyle='#ddd6c6';ctx.font=`700 ${o.l.length>2?11:18}px ${FONT_UI}`;ctx.fillText(o.l,bx,by+1);q.hit.push({x:bx,y:by,r:26,l:o.l});}
      ctx.fillStyle=q.flashT>0?'#d9a33c':'#ddd6c6';ctx.font=`700 ${q.key.l.length>2?13:24}px ${FONT_UI}`;ctx.fillText(q.key.l,cx,cy+1);
    } else {
      q.hit=null;ctx.fillStyle=q.flashT>0?'#d9a33c':'#ddd6c6';ctx.font=`700 ${q.key.l.length>2?14:26}px ${FONT_UI}`;ctx.fillText(q.key.l,cx,cy+1);
    }
    ctx.textBaseline='alphabetic';ctx.font=`700 16px ${FONT_UI}`;ctx.fillStyle='#ddd6c6';ctx.fillText(q.steps&&q.steps[q.i]?q.steps[q.i]:q.label,cx,cy-R0-22);
    ctx.font=`600 12px ${FONT_UI}`;ctx.fillStyle='rgba(221,214,198,.7)';
    ctx.fillText(IN.touch?'toque no botão com a letra do meio quando o anel chegar na faixa':'aperte a tecla do meio quando o anel chegar na faixa',cx,cy+R0+(IN.touch?104:26));
    for(let i=0;i<q.n;i++){ctx.fillStyle=i<q.i?'#d9a33c':'rgba(221,214,198,.25)';ctx.fillRect(cx-q.n*9+i*18,cy+R0+(IN.touch?114:34),12,4);}
  };
})();
// entrada de mouse e toque passam a posição do clique
(function(){
  const cv=document.getElementById('cv'); if(!cv||!cv.addEventListener)return;
  cv.addEventListener('mousedown',e=>{if(G.qte&&G.qte.multi&&G.mode==='play'){e.stopImmediatePropagation();qtePress(e.clientX,e.clientY);}},true);
  cv.addEventListener('touchstart',e=>{if(G.qte&&G.qte.multi&&G.mode==='play'){e.preventDefault();e.stopImmediatePropagation();const t=e.changedTouches[0];if(t)qtePress(t.clientX,t.clientY);}},{capture:true,passive:false});
})();

// ---------- GALERIA: subir a escada da saída é só um toque ----------
sewLid=function(){
  const F=G.flags; if(F.sewOut)return;
  if(!F.sewDrain)return toast('Uma escada sobe até a tampa. Daqui não dá pra chegar: o sifão está cheio.');
  G.struggle=null; G.qte=null; sewExit();
};
Object.assign(INT_LABEL,{tampaSaida:'Subir a escada (saída)'});
