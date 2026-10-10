// ===================== MULTIPLAYER (BETA) · CONTA =====================
// Até 5 amigos. Quem cria a sala recebe um CÓDIGO DE EQUIPE de 4 letras; os outros digitam e entram.
// O código só serve pros aparelhos se acharem (um "corretor" gratuito na internet); depois o jogo vai direto
// de aparelho pra aparelho (WebRTC). Quem criou a sala é o dono do mundo: zumbis, itens e objetivos moram nele.
// Regra de ouro pra não ter mob fantasma: o convidado NUNCA mata nada sozinho. Ele avisa "acertei o zumbi X",
// o anfitrião aplica o dano e avisa todo mundo quando morre ou quando alguém pega um item.

// ---------- CONTA (fica salva neste aparelho) ----------
const CONTA_KEY='ps-conta';
const CONTA_CORES=['#d9a33c','#c84a3a','#4a9ad8','#5ac07a','#b06ad8','#e8e0d0','#e87aa8','#3ac8c0'];
const MP_CHARS=[['richard','Richard'],['edu','Edu'],['matheus','Matheus'],['marlon','Marlon'],['nicolas','Nicolas']];
function contaGet(){try{return JSON.parse(localStorage.getItem(CONTA_KEY)||'null');}catch(e){return null;}}
function contaSave(c){try{localStorage.setItem(CONTA_KEY,JSON.stringify(c));}catch(e){}}
UI.conta=function(from){
  this.contaFrom=from||'title'; const c=contaGet()||{nome:'',apelido:'',cor:CONTA_CORES[0],fav:'richard',frase:''};
  this.open(`<div class="sheet narrow"><p class="kick">${contaGet()?'Sua conta':'Bem-vindo'}</p><h2>${contaGet()?'Editar conta':'Criar conta'}</h2>
    <p class="hint">A conta fica salva neste aparelho e aparece pros outros no multiplayer. Mais pra frente, com servidor, ela vai pra nuvem.</p>
    <div class="opts">
      <div class="opt"><h3>Nome</h3><input id="ct-nome" class="inp" maxlength="24" value="${esc(c.nome)}" placeholder="Richard Klettke"></div>
      <div class="opt"><h3>Apelido (aparece em cima do boneco)</h3><input id="ct-apel" class="inp" maxlength="14" value="${esc(c.apelido)}" placeholder="richardkkbatata"></div>
      <div class="opt"><h3>Cor</h3><div class="seg">${CONTA_CORES.map(k=>`<button data-a="ct-cor" data-k="${k}" class="${k===c.cor?'on':''}" style="background:${k};min-width:34px" aria-label="Cor ${k}">${k===c.cor?'✓':'&nbsp;'}</button>`).join('')}</div></div>
      <div class="opt"><h3>Personagem preferido</h3><div class="seg">${MP_CHARS.map(([k,n])=>`<button data-a="ct-fav" data-k="${k}" class="${k===c.fav?'on':''}">${n}</button>`).join('')}</div></div>
      <div class="opt"><h3>Frase (aparece no lobby)</h3><input id="ct-frase" class="inp" maxlength="40" value="${esc(c.frase||'')}" placeholder="Bora sobreviver"></div>
      ${c.jogos?`<p class="hint">Partidas no multiplayer: ${c.jogos||0} · Vitórias: ${c.vit||0}</p>`:''}
    </div>
    <div class="row"><button class="btn primary" data-a="ct-ok" data-focus>Salvar</button><button class="btn ghost" data-a="ct-back">${contaGet()?'Voltar':'Depois'}</button></div></div>`,'','conta');
  this.ctTmp=c;
};
function contaRead(){const t=UI.ctTmp||{};const v=id=>{const e=document.getElementById(id);return e&&e.value!=null?String(e.value).trim():'';};
  const c=Object.assign({},contaGet()||{},{nome:v('ct-nome')||t.nome||'Sobrevivente',apelido:v('ct-apel')||t.apelido||'',cor:t.cor||CONTA_CORES[0],fav:t.fav||'richard',frase:v('ct-frase')||t.frase||''});
  if(!c.apelido)c.apelido=c.nome.split(' ')[0].slice(0,14); if(!c.criado)c.criado=Date.now(); if(!c.id)c.id=Math.random().toString(36).slice(2,10); return c;}

// ---------- rede ----------
const MP={on:false,role:null,links:[],seen:new Set(),manual:false,code:'',status:'',peers:{},players:{},me:null,myId:'0',roster:{},remote:{},ghosts:new Map(),nid:1,eid:1,stage:0,prog:0,sendT:0,snapT:0};
const MP_ICE=[{urls:'stun:stun.l.google.com:19302'},{urls:'stun:stun1.l.google.com:19302'}];
const mpRid=n=>Math.random().toString(36).slice(2,2+n);
const mpRoom=c=>'portosombrio-'+c.toLowerCase();
// Pra achar a equipe o jogo tenta 3 "corretores" gratuitos ao mesmo tempo (se a rede bloquear um, usa outro).
// Sem nenhum? Dá pra conectar sem internet trocando um código longo (mesma Wi-Fi).
const MP_BROKERS=()=>globalThis.PS_BROKERS||[{k:'pj',url:'wss://0.peerjs.com/peerjs?key=peerjs'},{k:'mq',url:'wss://broker.emqx.io:8084/mqtt'},{k:'mq',url:'wss://broker.hivemq.com:8884/mqtt'}];
function brokerPJ(b,id){return new Promise((ok,no)=>{
  let ws,up=false; try{ws=new WebSocket(`${b.url}&id=${id}&token=${mpRid(8)}&version=1.5.4`);}catch(e){return no('net');}
  const link={send:(type,dst,payload)=>{if(ws.readyState===1)ws.send(JSON.stringify({type,dst,payload}));},close:()=>{try{ws.close();}catch(e){}}};
  const fail=()=>{if(!up){up=true;clearTimeout(tm);link.close();no('net');}}, tm=setTimeout(fail,9000);
  ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(x){return;}if(m.type==='OPEN'){up=true;clearTimeout(tm);ok(link);}else if(m.type==='ID-TAKEN'||m.type==='ERROR')fail();else mpOnSig(m,link);};
  ws.onerror=fail; ws.onclose=()=>{clearInterval(ws.hb);fail();};
  ws.hb=setInterval(()=>{if(ws.readyState===1)ws.send('{"type":"HEARTBEAT"}');},5000);
});}
function brokerMQ(b,id){return new Promise((ok,no)=>{
  let ws,up=false; try{ws=new WebSocket(b.url,'mqtt');}catch(e){return no('net');} ws.binaryType='arraybuffer';
  const E=new TextEncoder(),T=t=>'portosombrio/v16/'+t, str=s=>{const u=E.encode(s);return [u.length>>8,u.length&255,...u];};
  const pkt=(h,body)=>{const o=[h];let n=body.length;do{let d=n%128;n=Math.floor(n/128);if(n)d|=128;o.push(d);}while(n);return new Uint8Array([...o,...body]);};
  const link={send:(type,dst,payload)=>{if(ws.readyState===1)ws.send(pkt(0x30,[...str(T(dst)),...E.encode(JSON.stringify({type,src:id,payload}))]));},close:()=>{try{ws.close();}catch(e){}}};
  const fail=()=>{if(!up){up=true;clearTimeout(tm);link.close();no('net');}}, tm=setTimeout(fail,9000);
  ws.onopen=()=>ws.send(pkt(0x10,[...str('MQTT'),4,2,0,60,...str('ps'+mpRid(10))]));
  ws.onmessage=e=>{const a=new Uint8Array(e.data);let i=0;
    while(i<a.length){const h=a[i];let len=0,mul=1,j=i+1,d;do{d=a[j++];len+=(d&127)*mul;mul*=128;}while(d&128);const body=a.subarray(j,j+len);i=j+len;
      if(h>>4===2)ws.send(pkt(0x82,[0,1,...str(T(id)),0]));
      else if(h>>4===9){up=true;clearTimeout(tm);ok(link);}
      else if(h>>4===3){const off=2+((body[0]<<8)|body[1])+(((h>>1)&3)?2:0);try{mpOnSig(JSON.parse(new TextDecoder().decode(body.subarray(off))),link);}catch(x){}}}};
  ws.onerror=fail; ws.onclose=()=>{clearInterval(ws.hb);fail();};
  ws.hb=setInterval(()=>{if(ws.readyState===1)ws.send(new Uint8Array([0xC0,0]));},30000);
});}
async function mpLinks(id){const r=await Promise.allSettled(MP_BROKERS().map(b=>(b.k==='pj'?brokerPJ:brokerMQ)(b,id)));MP.links=r.filter(x=>x.status==='fulfilled').map(x=>x.value);return MP.links.length;}
const mpIce=pc=>new Promise(r=>{if(pc.iceGatheringState==='complete')return r();const t=setTimeout(r,2500);pc.addEventListener('icegatheringstatechange',()=>{if(pc.iceGatheringState==='complete'){clearTimeout(t);r();}});});
function mpRefresh(){if(UI.cur==='mp')UI.mp();}
// código longo (sem internet): o SDP comprimido
const b64e=b=>{let s='';for(const c of new Uint8Array(b))s+=String.fromCharCode(c);return btoa(s);};
async function mpEnc(o){const s=JSON.stringify(o);try{const cs=new CompressionStream('deflate-raw'),w=cs.writable.getWriter();w.write(new TextEncoder().encode(s));w.close();return 'Z'+b64e(await new Response(cs.readable).arrayBuffer());}catch(e){return 'J'+btoa(unescape(encodeURIComponent(s)));}}
async function mpDec(c){c=String(c||'').replace(/\s+/g,'');if(c[0]==='Z'){const u=Uint8Array.from(atob(c.slice(1)),x=>x.charCodeAt(0)),ds=new DecompressionStream('deflate-raw'),w=ds.writable.getWriter();w.write(u);w.close();return JSON.parse(await new Response(ds.readable).text());}return JSON.parse(decodeURIComponent(escape(atob(c.slice(1)))));}

// ---------- servidor dedicado (1.7) ----------
// Primeiro o jogo tenta o NOSSO servidor (de qualquer lugar, sem depender da rede). Ele só repassa as mensagens:
// quem manda no mundo continua sendo o anfitrião. Cada jogador do outro lado vira um "peer" de mentira
// ({open, dc.send}) e o resto do multiplayer nem percebe a diferença.
const MP_SRV_PADRAO='wss://porto-sombrio.onrender.com/ws';
function mpSrvUrl(){let u='';try{u=localStorage.getItem('ps-servidor')||'';}catch(e){}u=String(globalThis.PS_SERVIDOR||u||MP_SRV_PADRAO).trim();
  if(!/^[a-z]+:\/\//i.test(u))u='wss://'+u; u=u.replace(/^http/i,'ws'); if(!/\/ws\/?$/.test(u))u=u.replace(/\/+$/,'')+'/ws'; return u;}
const mpSrvHealth=u=>u.replace(/^ws/i,'http').replace(/\/ws\/?$/,'')+'/health';
const mpWait=ms=>new Promise(r=>setTimeout(r,ms));
function mpFetchT(u,ms){const c=new AbortController(),t=setTimeout(()=>c.abort(),ms);return fetch(u,{cache:'no-store',signal:c.signal}).finally(()=>clearTimeout(t));}
// o plano grátis do Render dorme sem uso: acorda com o /health (até 70 s)
async function mpSrvWake(u,still){const end=Date.now()+70000;let falhas=0;
  const aviso=setTimeout(()=>{if(still()){MP.status='Acordando o servidor, pode levar até 1 minuto...';mpRefresh();}},1500);
  try{while(Date.now()<end&&still()){const t0=Date.now();
    try{const r=await mpFetchT(mpSrvHealth(u),Math.max(1000,end-Date.now()));if(r.ok)return true;falhas=0;}
    catch(e){if(Date.now()-t0<3000&&++falhas>=3)return false;}
    await mpWait(2000);}
  return false;}finally{clearTimeout(aviso);}}
function mpSrvOpen(u){return new Promise((ok,no)=>{let ws;try{ws=new WebSocket(u);}catch(e){return no(e);}
  const t=setTimeout(()=>{try{ws.close();}catch(e){}no('tempo');},10000);
  ws.onopen=()=>{clearTimeout(t);ok(ws);}; ws.onerror=()=>{clearTimeout(t);no('erro');};});}
function mpSrvTx(o){const ws=MP.srv;if(ws&&ws.readyState===1)try{ws.send(JSON.stringify(o));}catch(e){}}
function mpSrvPeer(id){return {id,srv:true,open:true,dc:{readyState:'open',send:s=>mpSrvTx({t:'relay',to:id,m:s})},pc:{close(){}}};}
function mpSrvAsk(types,ms){return new Promise(r=>{const w={types,r};MP.srvWait=w;setTimeout(()=>{if(MP.srvWait===w){MP.srvWait=null;r(null);}},ms);});}
function mpSrvRecv(m){
  const w=MP.srvWait; if(w&&w.types.includes(m.t)){MP.srvWait=null;w.r(m);return;}
  switch(m.t){
    case 'msg':{const p=MP.peers[m.from];if(!p||!p.srv)return;let g;try{g=JSON.parse(m.m);}catch(e){return;}if(g&&typeof g==='object')mpRecv(g,p);break;}
    case 'peer-open':if(MP.role==='host'&&!MP.peers[m.id])MP.peers[m.id]=mpSrvPeer(m.id);break;
    case 'peer-close':{const p=MP.peers[m.id];if(p&&p.srv)mpPeerGone(p);break;}
    case 'room-closed':if(MP.role==='guest'){const p=MP.peers['0'];if(p&&p.srv)mpPeerGone(p);}else if(MP.role==='host'){mpSrvLost();}break;
    case 'pong':MP.srvRtt=Date.now()-m.n;break;
  }
}
function mpSrvLost(){mpSrvClose();
  if(MP.role==='guest'){const p=MP.peers['0'];if(p&&p.srv)mpPeerGone(p);}
  else if(MP.role==='host'){for(const p of Object.values(MP.peers))if(p.srv)mpPeerGone(p,true);MP.code='';
    if(!MP.manual)MP.status='A conexão com o servidor caiu. Saia e crie a equipe de novo.';toast('A conexão com o servidor caiu.');mpRefresh();}}
async function mpSrvConnect(still){const u=mpSrvUrl();MP.status='Conectando ao servidor...';mpRefresh();
  if(!await mpSrvWake(u,still)||!still())return null;
  let ws;try{ws=await mpSrvOpen(u);}catch(e){return null;}
  if(!still()){try{ws.close();}catch(e){}return null;}
  MP.srv=ws; ws.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(x){return;}if(m&&typeof m==='object')mpSrvRecv(m);};
  ws.onclose=()=>{if(MP.srv===ws){MP.srv=null;mpSrvLost();}};
  clearInterval(MP.srvPing); MP.srvPing=setInterval(()=>mpSrvTx({t:'ping',n:Date.now()}),20000); mpSrvTx({t:'ping',n:Date.now()});
  return ws;}
function mpSrvClose(){clearInterval(MP.srvPing);const ws=MP.srv;MP.srv=null;MP.srvRoom=false;if(MP.srvWait){MP.srvWait.r(null);MP.srvWait=null;}
  if(ws){try{if(ws.readyState===1)ws.send('{"t":"leave"}');}catch(e){}try{ws.close();}catch(e){}}}
async function mpSrvHost(){const still=()=>MP.role==='host'&&!MP.manual;
  if(!await mpSrvConnect(still))return false;
  mpSrvTx({t:'host'}); const r=await mpSrvAsk(['room','err'],8000);
  if(!r||r.t!=='room'||!still()){mpSrvClose();return false;}
  MP.code=r.code; MP.srvRoom=true; MP.nid=Math.max(MP.nid,5); return true;}
async function mpSrvJoin(code){const still=()=>MP.role==='guest'&&MP.code===code;
  if(!await mpSrvConnect(still))return null;
  mpSrvTx({t:'join',code}); const r=await mpSrvAsk(['joined','err'],8000);
  if(r&&r.t==='joined'&&still()){MP.myId=r.id;MP.srvRoom=true;MP.peers={'0':mpSrvPeer('0')};MP.status='';mpSend({t:'hello',c:MP.me});return 'ok';}
  mpSrvClose(); return r&&r.t==='err'?r.msg:null;}
// botão "Testar servidor" (menu de teste)
async function mpSrvTest(){const u=mpSrvUrl(),t0=Date.now(),show=(t,ok)=>UI.open(`<div class="sheet narrow"><p class="kick">Menu de teste · 1.7</p><h2>Servidor</h2><p class="hint">${esc(u)}</p><p class="mpst">${esc(t)}</p>
    <div class="row">${ok!=null?'<button class="btn" data-a="dbg" data-k="v17:srv">Testar de novo</button>':''}<button class="btn ghost" data-a="dbgtab" data-k="nov">Voltar</button></div></div>`,'','dbg');
  show('Testando... Se o servidor estiver dormindo, pode levar até 1 minuto.');
  let ok=false;try{ok=(await mpFetchT(mpSrvHealth(u),70000)).ok;}catch(e){}
  if(!ok)return show('Não conectou: o servidor não respondeu. Confira o endereço no fim da tela do multiplayer.',false);
  const acordou=Date.now()-t0;
  try{const ws=await mpSrvOpen(u);const rtt=await new Promise((r,no)=>{ws.onmessage=e=>{try{const m=JSON.parse(e.data);if(m.t==='pong')r(Date.now()-m.n);}catch(x){}};ws.send(JSON.stringify({t:'ping',n:Date.now()}));setTimeout(()=>no(),8000);});
    try{ws.close();}catch(e){}
    show(`Conectou. Ping: ${rtt} ms.`+(acordou>3000?` (Levou ${Math.round(acordou/1000)} s pra acordar.)`:''),true);}
  catch(e){show('O servidor respondeu, mas a conexão do multiplayer (WebSocket) não abriu.',false);}}

async function mpHost(manual){
  MP.role='host';MP.myId='0';MP.players={};MP.peers={};MP.seen=new Set();MP.nid=1;MP.code='';MP.manual=!!manual;MP.status=manual?'':'Criando a equipe...';mpLobbyCast();mpRefresh();
  if(manual)return;
  if(await mpSrvHost()){MP.status='';return mpRefresh();}
  if(MP.role!=='host'||MP.manual)return;
  MP.status='O servidor não respondeu. Tentando os outros serviços...';mpRefresh();
  const c=Array.from({length:4},()=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[(Math.random()*32)|0]).join('');
  const ok=await mpLinks(mpRoom(c)); if(MP.role!=='host'||MP.code)return;
  if(ok){MP.code=c;MP.status='';}
  else{MP.manual=true;MP.status='Não deu pra criar o código: nenhum dos serviços respondeu nesta rede. Use o modo sem internet logo abaixo (mesma Wi-Fi).';}
  mpRefresh();
}
async function mpGuestPC(){const pc=new RTCPeerConnection({iceServers:MP_ICE}),peer={id:'0',pc,dc:pc.createDataChannel('ps')};MP.peers={'0':peer};mpWire(peer);
  await pc.setLocalDescription(await pc.createOffer());await mpIce(pc);return pc.localDescription.sdp;}
async function mpJoin(code){
  code=String(code||'').toUpperCase().replace(/[^A-Z0-9]/g,''); if(code.length!==4)return toast('O código da equipe tem 4 letras.');
  MP.role='guest';MP.code=code;MP.answered=false;MP.status=`Procurando a equipe ${code}...`;mpRefresh();
  const sv=await mpSrvJoin(code); if(sv==='ok'||MP.role!=='guest'||MP.code!==code)return mpRefresh();
  if(sv==='cheia'){MP.role=null;MP.status='A equipe já tem 5 jogadores.';return mpRefresh();}
  MP.status=`Procurando a equipe ${code}...`;mpRefresh();
  if(!await mpLinks('ps-'+mpRid(10))){MP.role=null;MP.status='Nenhum dos serviços pra achar a equipe respondeu nesta rede. Use o modo sem internet (mesma Wi-Fi).';return mpRefresh();}
  const sdp=await mpGuestPC(); for(const l of MP.links)l.send('OFFER',mpRoom(code),{sdp});
  clearTimeout(MP.joinT); MP.joinT=setTimeout(()=>{const p=MP.peers['0'];if(MP.role==='guest'&&!(p&&p.open)){MP.status=`Não achei a equipe ${code}. Confere o código e se o anfitrião está com a equipe aberta.`;mpRefresh();}},15000);
}
async function mpJoinManual(){MP.role='guest';MP.manual=true;MP.status='Gerando seu código...';mpRefresh();MP.offerCode=await mpEnc({s:await mpGuestPC()});MP.status='';mpRefresh();}
function mpOnSig(m,link){const p=m.payload||{};
  if(MP.role==='host'&&m.type==='OFFER'&&!MP.seen.has(m.src)){MP.seen.add(m.src);mpAccept(p.sdp,pl=>link.send('ANSWER',m.src,pl));}
  if(MP.role==='guest'&&m.type==='ANSWER'&&!MP.answered){if(p.full){MP.status='A equipe já tem 5 jogadores.';return mpRefresh();}MP.answered=true;const pr=MP.peers['0'];if(pr)pr.pc.setRemoteDescription({type:'answer',sdp:p.sdp}).catch(()=>{});}
}
async function mpAccept(sdp,reply){
  if(Object.keys(MP.peers).length>=4)return reply({full:1});
  const id=String(MP.nid++),pc=new RTCPeerConnection({iceServers:MP_ICE}),peer={id,pc}; MP.peers[id]=peer;
  pc.ondatachannel=e=>{peer.dc=e.channel;mpWire(peer);};
  try{await pc.setRemoteDescription({type:'offer',sdp});await pc.setLocalDescription(await pc.createAnswer());await mpIce(pc);reply({sdp:pc.localDescription.sdp});}catch(e){delete MP.peers[id];toast('Código inválido.');}
}
function mpWire(p){const dc=p.dc;
  dc.onopen=()=>{p.open=true;if(MP.role==='guest'){clearTimeout(MP.joinT);MP.status='';mpSend({t:'hello',c:MP.me});}};
  dc.onclose=()=>mpPeerGone(p);
  dc.onmessage=e=>{let m;try{m=JSON.parse(e.data);}catch(x){return;}mpRecv(m,p);};
}
function mpPeerGone(p,quiet){if(p.gone)return;p.gone=true;p.open=false;
  if(MP.role==='host'){delete MP.peers[p.id];delete MP.players[p.id];delete MP.remote[p.id];mpLobbyCast();if(!quiet)toast('Um jogador saiu da equipe.');}
  else if(MP.role==='guest'){toast('A conexão com o anfitrião caiu.');if(MP.on)mpEnd(false,'A conexão com o anfitrião caiu.');else{MP.status='A conexão caiu.';}}
  mpRefresh();}
// manda pra um peer (to), ou pra todos menos "except". Pelo servidor, "todos" vira uma mensagem só ('*').
function mpSend(m,to,except){const s=JSON.stringify(m);let all=false;
  if(!to&&!except&&MP.srv&&MP.role==='host'&&Object.values(MP.peers).some(p=>p.srv)){mpSrvTx({t:'relay',to:'*',m:s});all=true;}
  for(const p of to?[to]:Object.values(MP.peers))if(p!==except&&!(all&&p.srv)&&p.open&&p.dc&&p.dc.readyState==='open')try{p.dc.send(s);}catch(e){}}
function mpTaken(skip){const t=[];if(MP.role==='host'&&skip!=='0')t.push(MP.me.char);for(const [id,p] of Object.entries(MP.players))if(id!==skip)t.push(p.c.char);return t;}
function mpLobbyCast(){if(MP.role!=='host')return;const r={'0':{...MP.me}};for(const [id,p] of Object.entries(MP.players))r[id]={...p.c};MP.roster=r;mpSend({t:'lobby',l:r});}
function mpStartInfo(){mpLobbyCast();return {pl:MP.roster};}

// ---------- mensagens ----------
function mpRecv(m,p){const H=MP.role==='host';
  switch(m.t){
    case 'hello':{if(!H)return;const tk=mpTaken(p.id),ch=tk.includes(m.c.char)?(MP_CHARS.find(([k])=>!tk.includes(k))||['edu'])[0]:m.c.char;
      MP.players[p.id]={c:{...m.c,char:ch},peer:p,x:START.x,y:START.y,hp:100,w:1};mpSend({t:'you',id:p.id,char:ch},p);mpLobbyCast();toast(`${m.c.apelido||m.c.nome} entrou na equipe.`);
      if(MP.on)mpSend({t:'start',pl:MP.roster},p);break;}
    case 'you':MP.myId=m.id;MP.me.char=m.char;break;
    case 'lobby':MP.roster=m.l;break;
    case 'pick':{const q=H&&MP.players[p.id];if(!q)return;if(!mpTaken(p.id).includes(m.char))q.c.char=m.char;mpSend({t:'you',id:p.id,char:q.c.char},p);mpLobbyCast();break;}
    case 'start':if(!H)mpBegin(m);break;
    case 'st':if(H&&MP.players[p.id])Object.assign(MP.players[p.id],m.s);break;
    case 'snap':if(!H)mpApplySnap(m);break;
    case 'hit':if(H){const e=enemies.find(e=>e.alive&&e.mpid===m.u);if(e)hurtEnemy(e,m.d,m.kx,m.ky,{});}break;
    case 'fx':mpFx(m.b);if(H){mpSend(m,null,p);if(m.b[0])alertNoise(m.b[0][0],m.b[0][1],380);}break;
    case 'take':mpTake(m.u);if(H)mpSend(m,null,p);break;
    case 'drop':for(const q of m.p)if(!G.taken.has(q.uid)&&!pickups.some(x=>x.uid===q.uid)){pickups.push(q);pickOcc.add(idx(q.tx,q.ty));}break;
    case 'die':{const g=MP.ghosts.get(m.u);if(g)mpGhostGone(g,true);break;}
    case 'hurt':if(G.mode==='play'&&!(P.mpDown>0))hurtPlayer(m.d,m.x,m.y);break;
    case 'tp':mpTp(m.x,m.y);break;
    case 'bark':bark(m.w,m.m,m.s);break;
    case 'gift':mpGift(m.g,m.msg);break;
    case 'kit':mpKit();break;
    case 'banner':G.banner={t:m.s,life:3};break;
    case 'end':mpEnd(m.win);break;
  }
  if(['hello','you','lobby','pick'].includes(m.t))mpRefresh();
}
function mpTake(u){G.taken.add(u);const q=pickups.find(x=>x.uid===u);if(q){pickups=pickups.filter(x=>x!==q);pickOcc.delete(idx(q.tx,q.ty));}}
function mpTp(x,y){const [a,b]=freeTileNear(((x+rr(-40,40))/TILE)|0,((y+rr(-40,40))/TILE)|0,true);P.x=tc(a);P.y=tc(b);snapCamera();flowTile=-1;}
function mpGift(g,msg){for(const [id,q] of g){const l=invAdd(id,q);if(l)boxAdd(id,l);}toast(msg||'Você recebeu suprimentos.');AU.pickup();}
// tiros dos outros: só o desenho (dano 0 não machuca ninguém, quem decide é o anfitrião)
function mpFx(b){for(const [x,y,a,sp,life] of b)projs.push({k:'b',x,y,vx:Math.cos(a)*sp,vy:Math.sin(a)*sp,dmg:0,life,pierce:0,knock:0,crit:0,hit:null});}

// ---------- tela ----------
UI.mp=function(){
  if(!contaGet())return this.conta('mp');
  if(!MP.me){const c=contaGet();MP.me={nome:c.nome,apelido:c.apelido,cor:c.cor,frase:c.frase||'',char:c.fav||'richard'};}
  const conn=MP.role==='host'?!!MP.code:MP.role==='guest'&&MP.peers['0']&&MP.peers['0'].open;
  const tk=MP.role==='host'?mpTaken('0'):Object.entries(MP.roster).filter(([id])=>id!==MP.myId).map(([,p])=>p.char);
  const chars=`<h3>Seu personagem</h3><div class="seg">${MP_CHARS.map(([k,n])=>`<button data-a="mp-char" data-k="${k}" class="${MP.me.char===k?'on':''}" ${tk.includes(k)?'disabled':''}>${n}</button>`).join('')}</div>`;
  const list=`<h3>Equipe (${Object.keys(MP.roster).length}/5)</h3><div class="mplist">${Object.entries(MP.roster).map(([id,p])=>`<div class="mpp"><span class="dot" style="background:${p.cor}"></span><b>${esc(p.apelido||p.nome)}</b> <span class="dim">· ${esc((MP_CHARS.find(c=>c[0]===p.char)||[0,p.char])[1])}${id==='0'?' · anfitrião':''}</span>${p.frase?`<small>"${esc(p.frase)}"</small>`:''}</div>`).join('')}</div>`;
  let body;
  if(typeof WebSocket==='undefined')body='<p class="hint">Este navegador não conecta com outros aparelhos. Use o Chrome, o Edge ou o Safari atualizados.</p>';
  else if(!MP.role)body=`<div class="row"><button class="btn primary" data-a="mp-host">Criar equipe</button></div>
    <h3>Ou entre com o código da equipe</h3><div class="row"><input id="mp-code" class="inp mpin" maxlength="4" autocomplete="off" autocapitalize="characters" placeholder="ABCD"><button class="btn" data-a="mp-join">Entrar</button></div>
    <h3>Sem internet (mesma Wi-Fi)</h3><p class="hint">Mais trabalhoso: vocês trocam um código longo (pelo Bluetooth, AirDrop ou digitando). Use só se o código de 4 letras não funcionar.</p>
    <div class="row"><button class="btn ghost" data-a="mp-hostM">Criar equipe sem internet</button><button class="btn ghost" data-a="mp-joinM">Entrar sem internet</button></div>`;
  else if(MP.role==='host'){const man=`<h3>Amigo sem internet?</h3><p class="hint">Cole o código longo dele aqui e mande de volta a resposta.</p><textarea id="mp-off" class="inp code" rows="2" placeholder="código do amigo"></textarea><div class="row"><button class="btn" data-a="mp-ansM">Gerar resposta</button></div>
      ${MP.ansCode?`<p class="hint">Mande esta resposta pro amigo:</p><textarea class="inp code" readonly rows="3" onclick="this.select()">${MP.ansCode}</textarea><div class="row"><button class="btn ghost mini" data-a="mp-copy" data-k="ans">Copiar</button></div>`:''}`;
    body=(MP.code?`<p class="hint">Código da equipe. Passe pros amigos:</p><div class="mpcode">${MP.code}</div><div class="row"><button class="btn ghost mini" data-a="mp-copy">Copiar</button></div>`:'')
      +(MP.code||MP.manual?`${chars}${list}<div class="row"><button class="btn primary" data-a="mp-start">Começar a Noite Zero</button></div>${man}`:'');}
  else body=conn?`${chars}${list}<p class="hint">Esperando o anfitrião começar...</p>`
    :MP.manual&&MP.offerCode?`<p class="hint">1. Mande este código pro anfitrião (ele cola em "Amigo sem internet?"):</p><textarea class="inp code" readonly rows="3" onclick="this.select()">${MP.offerCode}</textarea><div class="row"><button class="btn ghost mini" data-a="mp-copy" data-k="off">Copiar</button></div>
      <p class="hint">2. Cole aqui a resposta que ele mandar:</p><textarea id="mp-ans" class="inp code" rows="2" placeholder="resposta do anfitrião"></textarea><div class="row"><button class="btn primary" data-a="mp-conM">Conectar</button></div>`:'';
  this.open(`<div class="sheet wide"><div class="tabs"><p class="kick">Beta · até 5 jogadores</p><h2 style="margin-right:auto">Multiplayer</h2><button class="btn ghost" data-a="mp-leave">${MP.role?'Sair da equipe':'Voltar'}</button></div>
    <div class="mpme"><span class="dot" style="background:${MP.me.cor}"></span><b>${esc(MP.me.apelido)}</b> <button class="btn ghost mini" data-a="conta" data-from="mp">Editar conta</button></div>
    ${MP.status?`<p class="mpst">${esc(MP.status)}</p>`:''}${body}
    <p class="hint">O código de 4 letras usa o servidor do Porto Sombrio: dá pra jogar de qualquer lugar. Se ele estiver fora do ar, o jogo tenta os serviços antigos e ainda tem o modo sem internet. A Noite Zero é uma história curta só do multiplayer e não mexe no seu jogo solo.</p>
    <h3>Servidor</h3><p class="hint">Só troque se passarem um endereço novo. Vazio = o padrão.</p>
    <div class="row"><input id="mp-srv" class="inp" style="flex:1;min-width:0" autocomplete="off" spellcheck="false" value="${esc((()=>{try{return localStorage.getItem('ps-servidor')||'';}catch(e){return '';}})())}" placeholder="${esc(MP_SRV_PADRAO)}"><button class="btn ghost mini" data-a="mp-srv">Salvar</button></div></div>`,'','mp');
};
function mpLeave(){
  mpSrvClose();
  for(const p of Object.values(MP.peers))try{p.pc.close();}catch(e){}
  for(const l of MP.links||[])l.close(); MP.links=[]; clearTimeout(MP.joinT);
  Object.assign(MP,{on:false,role:null,manual:false,offerCode:'',ansCode:'',code:'',status:'',peers:{},players:{},roster:{},remote:{},myId:'0'}); MP.ghosts.clear(); G.mp=null; P.lookO=null;
}
function mpEnd(win,msg){
  if(!MP.on)return; MP.on=false; G.mp=null; const c=contaGet(); if(c){c.jogos=(c.jogos||0)+1;if(win)c.vit=(c.vit||0)+1;contaSave(c);}
  if(MP.role==='host')mpSend({t:'end',win});
  G.mode='menu';
  UI.open(`<div class="sheet narrow win"><p class="kick">Noite Zero · beta</p><h2 class="endt">${win?'Vocês sobreviveram':'A noite venceu'}</h2>
    <p>${msg?esc(msg):win?'A turma inteira atravessou a BR e segurou a Universidade de BC até o amanhecer. Por enquanto.':'Ninguém ficou de pé dessa vez.'}</p>
    <p class="hint">O multiplayer completo vem numa próxima versão. Obrigado por testar!</p>
    <div class="row"><button class="btn primary" data-a="mp-leave">Voltar ao título</button></div></div>`,'','win');
}

// ---------- partida ----------
function mpBegin(info){
  MP.on=true; MP.roster=info.pl; Object.assign(MP,{stage:0,prog:0,kills:0,started:false,boss:null,endT:null,allDownT:0,remote:{}}); MP.ghosts.clear();
  newGame('normal'); G.mp={role:MP.role}; const F=G.flags; F.tutDone=true; G.tut=null; F.mpMode=true; F.armed=true; F.walkie=true;
  UI.close(); G.mode='play'; document.getElementById('tc').hidden=!IN.touch;
  if(MP.role==='guest'){enemies=[];G.dropN=100000*(+MP.myId);}
  mpSetChar((info.pl[MP.myId]||MP.me).char);
  {const A=LM.coreto||START,[x,y]=freeTileNear(((A.x)/TILE|0)+(+MP.myId)*2-4,(A.y/TILE)|0,true);P.x=tc(x);P.y=tc(y);} snapCamera(); flowTile=-1; G.clock=20*60;
  G.banner={t:'Noite Zero',life:3.5}; toast('Matem tudo. Fiquem juntos.');
}
function mpSetChar(ch){
  P.lookO=LOOKS[ch]||LOOKS.richard; MP.myChar=ch; P.owned[0]=true; P.dur=Math.max(P.dur||0,30);
  const kit={richard:[[1,'m9',36]],edu:[[1,'m9',36]],matheus:[[2,'cart',12]],marlon:[[4,'m357',12]],nicolas:[[7,'virote',14],[null,'rojao',2]]}[ch]||[[1,'m9',24]];
  for(const [w,a,q] of kit){if(w!=null){P.owned[w]=true;P.mags[w]=WEAPONS[w].mag;P.w=w;}invAdd(a,q);} invAdd('ervaV',2); mSync();
}
// ---------- Noite Zero (1.7.1): matar zumbi com os amigos e derrubar chefão. Sem enrolação. ----------
// Tudo acontece em volta da turma (o centro é a média de quem está de pé). Mais gente na equipe = mais zumbi e chefão mais forte.
const MPST=[
  // começa leve (só pistola na mão) e aperta conforme a turma ganha arma e munição
  {t:'Primeira onda: matem {n} zumbis',kills:12,rate:2.4,grp:1,burst:3,cap:10,mix:'inicio',bark:['edu','n','Doze. Eu contei. Alguém mais contou ou só eu trabalho aqui?']},
  {t:'Chefão: derrubem O Frentista',boss:'gordo',hpk:.7,rate:4.5,grp:1,cap:6,mix:'inicio',bark:['marlon','n','O gordão caiu. Passa no Mascate e respira, que vem mais.']},
  {t:'Segurem a praça: {s} segundos de horda',hold:45,rate:1.6,grp:2,burst:4,cap:16,mix:'leve',bark:['nico','n','Quarenta e cinco segundos. Parecia uma aula do Rese.']},
  {t:'Chefão: derrubem O Espécime',boss:'especime',hpk:.9,rate:3.5,grp:1,cap:10,mix:'leve',bark:['matheus','s','Isso aí saiu do porto. Eu reconheço. Bora acabar com isso.']},
  {t:'Horda pesada: matem {n} zumbis',kills:30,rate:1,grp:2,burst:6,cap:22,mix:'media',bark:['marlon','a','Trinta. Tô sem dedo de tanto atirar.']},
  {t:'Chefão final: derrubem A Abominação',boss:'boss',hpk:.85,rate:2.5,grp:2,cap:16,mix:'pesada',bark:['marlon','a','Amanheceu. A gente conseguiu. A turma inteira. Até o Edu chegou no horário.']},
];
const MP_MIX={inicio:[['zumbi',88],['corr',8],['cao',4]],leve:[['zumbi',70],['corr',20],['cao',10]],media:[['zumbi',50],['corr',22],['incha',10],['cusp',10],['cao',8]],pesada:[['zumbi',40],['corr',20],['incha',10],['cusp',10],['brut',6],['soldado',14]]};
const mpAllPos=()=>[{x:P.x,y:P.y,hp:P.hp},...Object.values(MP.players)];
const mpN=()=>1+Object.keys(MP.players).length;
function mpNear(L,r,all){if(!L)return true;const f=p=>p.hp>0&&hyp(p.x-L.x,p.y-L.y)<r;return all?mpAllPos().every(p=>p.hp<=0||f(p)):mpAllPos().some(f);}
function mpCenter(){const up=mpAllPos().filter(p=>p.hp>0&&p.x!=null);const L=up.length?up:mpAllPos();return {x:L.reduce((a,p)=>a+p.x,0)/L.length,y:L.reduce((a,p)=>a+p.y,0)/L.length};}
function mpPick(mix){const t=MP_MIX[mix]||MP_MIX.leve;let r=Math.random()*t.reduce((a,x)=>a+x[1],0);for(const [k,w] of t)if((r-=w)<=0)return k;return 'zumbi';}
function mpSpawnAt(type,minD,maxD,uid){
  const c=mpCenter();
  for(let k=0;k<14;k++){const a=Math.random()*6.283,d=rr(minD,maxD),tx=((c.x+Math.cos(a)*d)/TILE)|0,ty=((c.y+Math.sin(a)*d)/TILE)|0;
    if(!inb(tx,ty)||SOLID[map[idx(tx,ty)]]||map[idx(tx,ty)]===T.SAFE||!reach[idx(tx,ty)])continue;
    if(mpAllPos().some(p=>hyp(p.x-tc(tx),p.y-tc(ty))<minD*.8))continue;
    const e=makeEnemy(type,tc(tx),tc(ty),uid||null);Object.assign(e,{state:'chase',hunt:true,huntT:999,lx:c.x,ly:c.y,mpw:true});enemies.push(e);return e;}
  return null;
}
function mpWave(mix,n){const alive=enemies.filter(e=>e.alive&&e.mpw).length,cap=MP.cap||(30+mpN()*8);for(let i=0;i<n&&alive+i<cap;i++)mpSpawnAt(mpPick(mix),360,560);}
function mpKit(){for(let i=0;i<WEAPONS.length;i++){const w=WEAPONS[i];if(!P.owned[i]||w.melee||!w.ammo)continue;const l=invAdd(w.ammo,Math.max(6,w.mag*2));if(l)boxAdd(w.ammo,l);}
  const l=invAdd('ervaV',1);if(l)boxAdd('ervaV',l);toast('Munição e erva pra todo mundo.');AU.pickup();}
function mpStageStart(){
  const s=MPST[MP.stage]; if(!s)return; MP.prog=0; MP.kills=0; MP.wv=2; MP.boss=null; if(!s.boss)mpWave(s.mix,6+mpN()*3);
  if(s.boss){const e=mpSpawnAt(s.boss,420,560,'mpboss'+MP.stage)||mpSpawnAt(s.boss,250,700,'mpboss'+MP.stage);
    if(e){e.hp=e.max=e.max*s.hpk*(.75+.35*mpN());e.home=null;MP.boss=e;}}
  const msg=s.boss?ETYPES[s.boss].n:'Onda '+(MP.stage+1); G.banner={t:msg,life:3};mpSend({t:'banner',s:msg});
}
function mpHostStage(dt){
  if(MP.endT!=null){if((MP.endT-=dt)<=0){MP.endT=null;mpEnd(true);}return;}
  const s=MPST[MP.stage]; if(!s)return;
  if(!MP.started){MP.started=true;mpStageStart();}
  if((MP.wv-=dt)<=0){MP.wv=s.rate*rr(.8,1.2);mpWave(s.mix,2+Math.floor(mpN()*.8)+(s.hold?1:0));}
  if(s.hold)MP.prog+=dt;
  const done=s.kills?MP.kills>=Math.round(s.kills*(.7+.3*mpN())):s.hold?MP.prog>=s.hold:s.boss?!(MP.boss&&MP.boss.alive):false;
  if(done){
    if(s.bark){bark(...s.bark);mpSend({t:'bark',w:s.bark[0],m:s.bark[1],s:s.bark[2]});}
    mpKit();mpSend({t:'kit'});
    MP.started=false; if(++MP.stage>=MPST.length){MP.endT=3;for(const e of enemies)if(e.alive&&e.mpw)killEnemy(e);}
  }
  if(mpAllPos().every(p=>p.hp<=0)){if((MP.allDownT=(MP.allDownT||0)+dt)>4)mpEnd(false);}else MP.allDownT=0;
}
function mpObjective(){
  if(MP.role!=='host')return {t:MP.objT||'Fiquem juntos',at:MP.objAt};
  const s=MPST[MP.stage]; if(!s)return {t:'Amanheceu.',at:null};
  const need=s.kills?Math.round(s.kills*(.7+.3*mpN())):0;
  let t=s.t.replace('{n}',need).replace('{s}',s.hold||'');
  if(s.kills)t+=` (${Math.min(MP.kills,need)}/${need})`; else if(s.hold)t+=` (${Math.floor(MP.prog)}/${s.hold}s)`;
  else if(MP.boss&&MP.boss.alive)t+=` (${Math.ceil(100*MP.boss.hp/MP.boss.max)}%)`;
  return {t,at:MP.boss&&MP.boss.alive?{x:MP.boss.x,y:MP.boss.y}:null};
}

// ---------- foto do mundo (anfitrião → convidados, 12 vezes por segundo) ----------
const mpMe=()=>({x:P.x|0,y:P.y|0,ang:+P.ang.toFixed(2),la:+(P.legAng||P.ang).toFixed(2),hp:P.hp|0,w:P.w,cr:P.crouch?1:0,mv:P.moving?1:0,wk:+(P.walk||0).toFixed(1)});
function mpSnap(){
  const ps=mpAllPos().filter(p=>p.x!=null), e=[];
  for(const en of enemies){if(!en.alive||!ps.some(p=>hyp(p.x-en.x,p.y-en.y)<1100))continue;if(!en.mpid)en.mpid=MP.eid++;
    e.push([en.mpid,en.type,en.x|0,en.y|0,+en.face.toFixed(2),en.state==='dorm'?1:0,en.col||0,en.flash>0?1:0,en.max>200?Math.round(100*en.hp/en.max):0]);}
  const p={'0':{...mpMe(),ch:MP.myChar}}; for(const [id,q] of Object.entries(MP.players))p[id]={x:q.x|0,y:q.y|0,ang:q.ang,la:q.la,hp:q.hp,w:q.w,cr:q.cr,mv:q.mv,wk:q.wk,ch:q.c.char};
  const o=mpObjective(); return {t:'snap',e,p,o:o.t,a:o.at?[o.at.x|0,o.at.y|0]:null,c:G.clock|0};
}
function mpApplySnap(m){
  MP.objT=m.o; MP.objAt=m.a?{x:m.a[0],y:m.a[1]}:null; if(m.c)G.clock=m.c;
  for(const [id,q] of Object.entries(m.p))if(id!==MP.myId)mpRemote(id,q);
  for(const [u,type,x,y,face,dorm,col,fl,hp] of m.e){let g=MP.ghosts.get(u);
    if(!g){if(!ETYPES[type])continue;g=makeEnemy(type,x,y,null,!!dorm);g.ghost=true;g.mpid=u;if(col)g.col=col;MP.ghosts.set(u,g);enemies.push(g);}
    Object.assign(g,{tx:x,ty:y,face,state:dorm?'dorm':'chase',seen:G.time,seenT:G.time});if(hp)g.hp=g.max*hp/100;if(fl)g.flash=.08;}
}
function mpGhostGone(g,dead){MP.ghosts.delete(g.mpid);g.alive=false;if(dead){bloodBurst(g.x,g.y,8,0);GORE.push({k:'corpse',x:g.x,y:g.y,rot:Math.random()*6.28,type:g.type,col:g.col||g.t.col,skin:g.t.skin,r:g.r});}}
function mpRemote(id,q){const r=MP.remote[id]||(MP.remote[id]={x:q.x,y:q.y});const R=MP.roster[id]||{};Object.assign(r,q,{tx:q.x,ty:q.y,x:r.x,y:r.y,char:q.ch||R.char,apelido:R.apelido,cor:R.cor});}

// ---------- desenho ----------
const hpCol=h=>h>50?'#62c06c':h>25?'#d9a33c':'#d24a3a';
function mpDrawRemotes(){
  if(!MP.on)return;
  for(const r of Object.values(MP.remote)){if(r.x==null||!inV(r.x,r.y,60))continue;
    const L=LOOKS[r.char]||LOOKS.edu, wid=WEAPONS[r.w]?WEAPONS[r.w].id:null;
    if(r.hp<=0){ctx.globalAlpha=.6;drawDecal({k:'corpse',x:r.x,y:r.y,rot:r.ang||0,type:'zumbi',col:L.coat,skin:L.skin,r:11});ctx.globalAlpha=1;}
    else drawHuman(r.x,r.y,r.ang||0,{...L,crouch:!!r.cr,legAng:r.la??r.ang,walk:r.wk||0,moving:!!r.mv,wid:wid==='maos'?null:wid,loaded:true});
    const nm=r.apelido||'?'; ctx.font=`700 11px ${FONT_UI}`;ctx.textAlign='center';const tw=ctx.measureText(nm).width;
    ctx.fillStyle='rgba(0,0,0,.6)';ctx.fillRect(r.x-tw/2-4,r.y-34,tw+8,14);ctx.fillRect(r.x-14,r.y-18,28,3);
    ctx.fillStyle=r.cor||'#ddd6c6';ctx.fillText(nm,r.x,r.y-23);ctx.fillStyle=hpCol(r.hp);ctx.fillRect(r.x-14,r.y-18,28*clamp((r.hp||0)/100,0,1),3);}
}
function mpDrawHud(){
  if(!MP.on||G.mode!=='play')return; ctx.setTransform(dpr,0,0,dpr,0,0);
  const rows=[{n:MP.me.apelido,c:MP.me.cor,hp:P.hp,ch:MP.myChar},...Object.values(MP.remote).map(r=>({n:r.apelido||'?',c:r.cor||'#ddd',hp:r.hp||0,ch:r.char}))];
  // lista compacta: nome + barrinha de vida (sem o nome do personagem, que já aparece no boneco)
  const W2=IN.touch?104:140; let y=IN.touch?62+SAFE.t:view.h*.3; const x=view.w-W2-8-SAFE.r;
  if(rows.length>1)for(const r of rows){ctx.globalAlpha=.85;ctx.fillStyle='rgba(9,11,10,.6)';ctx.fillRect(x,y,W2,18);ctx.fillStyle=r.c;ctx.fillRect(x,y,3,18);ctx.textAlign='left';
    ctx.fillStyle='#ddd6c6';ctx.font=`700 10px ${FONT_UI}`;ctx.fillText(fitText(r.n,W2*.5),x+7,y+12.5);
    ctx.fillStyle='rgba(255,255,255,.1)';ctx.fillRect(x+W2*.55,y+7,W2*.4,4);ctx.fillStyle=hpCol(r.hp);ctx.fillRect(x+W2*.55,y+7,W2*.4*clamp(r.hp/100,0,1),4);ctx.globalAlpha=1;y+=21;}
  if(P.mpDown>0){ctx.fillStyle='rgba(60,0,0,.35)';ctx.fillRect(0,0,view.w,view.h);ctx.fillStyle='#ddd6c6';ctx.font=`700 22px ${FONT_UI}`;ctx.textAlign='center';ctx.fillText(`Caído! Peça ajuda pra um amigo (${Math.ceil(P.mpDown)}s)`,view.w/2,view.h/2);}
}

// ---------- ganchos no jogo (só agem com MP.on) ----------
(function(){
  const guest=()=>MP.on&&MP.role==='guest', host=()=>MP.on&&MP.role==='host';
  // anfitrião: cada zumbi caça o jogador mais perto, seja de que aparelho for
  const ue=updEnemy; updEnemy=function(e,dt){
    if(guest()){if(e.tx!=null){const k=Math.min(1,dt*10);e.x+=(e.tx-e.x)*k;e.y+=(e.ty-e.y)*k;}e.flash=Math.max(0,e.flash-dt);return;}
    if(!host())return ue(e,dt);
    let id=null,bd=P.hp>0?hyp(P.x-e.x,P.y-e.y):1e9; for(const [i,q] of Object.entries(MP.players))if(q.hp>0&&hyp(q.x-e.x,q.y-e.y)<bd){bd=hyp(q.x-e.x,q.y-e.y);id=i;}
    if(!id)return ue(e,dt);
    const q=MP.players[id], sv={x:P.x,y:P.y,hidden:P.hidden,crouch:P.crouch,running:P.running,moving:P.moving,lamp:P.lamp,inCar:P.inCar,inv:P.inv,grab:P.grab,hp:P.hp};
    Object.assign(P,{x:q.x,y:q.y,hidden:null,crouch:!!q.cr,running:false,moving:!!q.mv,lamp:true,inCar:false,inv:0,grab:null,hp:q.hp}); G.mpTgt=q;
    try{ue(e,dt);}finally{const gr=P.grab;Object.assign(P,sv);G.mpTgt=null;if(gr&&gr!==sv.grab){e.grabbing=false;mpSend({t:'hurt',d:e.t.dmg,x:e.x,y:e.y},q.peer);}}
  };
  const hp=hurtPlayer; hurtPlayer=function(d,fx,fy){if(G.mpTgt){mpSend({t:'hurt',d,x:fx,y:fy},G.mpTgt.peer);return;}return hp(d,fx,fy);};
  // convidado não mata nada: manda o acerto pro anfitrião
  const he=hurtEnemy; hurtEnemy=function(e,d,kx,ky){
    if(MP.on&&!(d>0))return;
    if(guest()){if(e.ghost&&e.alive){mpSend({t:'hit',u:e.mpid,d,kx:kx|0,ky:ky|0});e.flash=.1;bloodBurst(e.x,e.y,3,Math.atan2(ky||0,kx||1));}return;}
    return he.apply(this,arguments);};
  const ke=killEnemy; killEnemy=function(e){
    if(guest()){if(e.ghost&&e.alive)mpSend({t:'hit',u:e.mpid,d:9999,kx:0,ky:0});return;}
    const n=pickups.length, r=ke.apply(this,arguments);
    if(host()){MP.kills=(MP.kills||0)+1;if(e.mpid)mpSend({t:'die',u:e.mpid});const nw=pickups.slice(n);if(nw.length)mpSend({t:'drop',p:nw});}
    return r;};
  // item pego some pra todo mundo
  const tp=takePickup; takePickup=function(p){const r=tp.apply(this,arguments);if(MP.on&&p.uid&&!pickups.includes(p))mpSend({t:'take',u:p.uid});return r;};
  const fr=fire; fire=function(){const n=projs.length,r=fr.apply(this,arguments);if(MP.on){const b=projs.slice(n).filter(p=>p.k==='b').map(p=>[p.x|0,p.y|0,+Math.atan2(p.vy,p.vx).toFixed(3),hyp(p.vx,p.vy)|0,p.life]);if(b.length)mpSend({t:'fx',b});}return r;};
  const di=die; die=function(){if(MP.on){P.hp=0;P.mpDown=8;P.firing=false;return;}return di();};
  const bk=bark; bark=function(who){if(MP.on&&who==='rafa')return;return bk.apply(this,arguments);};
  const ob=objective; objective=function(){return MP.on?mpObjective():ob();};
  {const a=updTriggers;updTriggers=function(){if(!MP.on)return a.apply(this,arguments);};}
  {const a=plotTriggers;plotTriggers=function(){if(!MP.on)return a.apply(this,arguments);};}
  {const a=updPers;updPers=function(){if(!MP.on)return a.apply(this,arguments);};}
  {const a=soniaTick;soniaTick=function(){if(!MP.on)return a.apply(this,arguments);};}
  const up=updPlayer; updPlayer=function(dt){if(MP.on&&P.mpDown>0){IN.mx=0;IN.my=0;IN.fire=false;}return up(dt);};
  const vt=v16Tick; v16Tick=function(dt){vt(dt);if(!MP.on||G.mode!=='play')return;
    if(P.mpDown>0&&(P.mpDown-=dt)<=0){P.hp=60;P.inv=2;const t=Object.values(MP.remote).find(r=>r.hp>0);if(t)mpTp(t.x,t.y);toast('Você levantou.');}
    for(const r of Object.values(MP.remote))if(r.tx!=null){const k=Math.min(1,dt*12);r.x+=(r.tx-r.x)*k;r.y+=(r.ty-r.y)*k;}
    if(MP.role==='host'){for(const [id,q] of Object.entries(MP.players))mpRemote(id,{x:q.x,y:q.y,ang:q.ang,la:q.la,hp:q.hp,w:q.w,cr:q.cr,mv:q.mv,wk:q.wk,ch:q.c.char});
      for(const p of projs)if(p.k==='s'&&!p.dead)for(const q of Object.values(MP.players))if(q.hp>0&&hyp(q.x-p.x,q.y-p.y)<12+(p.rock?14:5)){mpSend({t:'hurt',d:p.dmg,x:p.x,y:p.y},q.peer);p.dead=true;break;}
      mpHostStage(dt); if((MP.snapT-=dt)<=0){MP.snapT=1/12;mpSend(mpSnap());}}
    else{if((MP.sendT-=dt)<=0){MP.sendT=1/15;mpSend({t:'st',s:mpMe()});}
      for(const g of MP.ghosts.values())if(G.time-(g.seen||0)>1.5)mpGhostGone(g,false);
      enemies=enemies.filter(e=>e.ghost&&e.alive);}
  };
  const dc=drawComps; drawComps=function(){dc();mpDrawRemotes();};
  const ds=drawPsy; drawPsy=function(){ds();mpDrawHud();};
  const sv=UI.save.bind(UI); UI.save=function(){if(MP.on)return toast('No multiplayer beta não tem registro. Fiquem vivos.');return sv();};
  const pz=UI.pause.bind(UI); UI.pause=function(){if(!MP.on)return pz();if(G.mode!=='play')return;
    UI.open(`<div class="sheet narrow"><p class="kick">Multiplayer beta</p><h2>Pausa</h2>${mpN()>1?'<p class="hint">O jogo continua pros outros enquanto este menu está aberto.</p>':''}<div class="menu"><button class="btn primary" data-a="close">Continuar</button><button class="btn" data-a="inv" data-t="itens">Maleta</button><button class="btn" data-a="opts" data-from="pause">Opções</button><button class="btn ghost" data-a="mp-leave">Sair da partida</button></div></div>`,'','pause');};
  // título: multiplayer e conta; na primeira vez pede pra criar a conta
  const tt=UI.title.bind(UI); UI.title=function(){tt();try{const m=OV.querySelector('.menu');if(!m)return;const c=contaGet();
    const b=document.createElement('button');b.className='btn';b.dataset.a='mp';b.textContent='Multiplayer (beta)';const nw=m.querySelector('[data-a=new]');m.insertBefore(b,nw?nw.nextSibling:null);
    const b2=document.createElement('button');b2.className='btn ghost';b2.dataset.a='conta';b2.dataset.from='title';b2.textContent=c?`Conta: ${c.apelido}`:'Criar conta';m.appendChild(b2);
    let skip=false;try{skip=localStorage.getItem('ps-conta-depois')==='1';}catch(e){}
    if(!c&&!UI.contaAsked&&!skip){UI.contaAsked=true;setTimeout(()=>{if(UI.cur==='title')UI.conta('title');},400);}}catch(e){}};
  const act=UI.act.bind(UI);
  UI.act=function(a,ds){
    switch(a){
      case 'conta':return this.conta(ds.from);
      case 'ct-cor':case 'ct-fav':{const k=a==='ct-cor'?'cor':'fav';this.ctTmp=Object.assign(contaRead(),{[k]:ds.k});OV.querySelectorAll(`[data-a=${a}]`).forEach(b=>{const on=b.dataset.k===ds.k;b.classList.toggle('on',on);if(a==='ct-cor')b.textContent=on?'✓':' ';});return;}
      case 'ct-ok':{const c=contaRead();contaSave(c);if(MP.me)Object.assign(MP.me,{nome:c.nome,apelido:c.apelido,cor:c.cor,frase:c.frase});mpLobbyCast();toast('Conta salva.');return this.contaFrom==='mp'?this.mp():this.title();}
      case 'ct-back':if(!contaGet())try{localStorage.setItem('ps-conta-depois','1');}catch(e){}return this.contaFrom==='mp'&&contaGet()?this.mp():this.title();
      case 'mp':return this.mp();
      case 'mp-host':mpHost();return;
      case 'mp-srv':{const t=document.getElementById('mp-srv'),v=t?String(t.value).trim():'';try{if(v)localStorage.setItem('ps-servidor',v);else localStorage.removeItem('ps-servidor');}catch(e){}toast(v?'Servidor salvo.':'Voltou pro servidor padrão.');return;}
      case 'mp-join':{const t=document.getElementById('mp-code');mpJoin(t?t.value:'');return;}
      case 'mp-copy':{const c=ds.k==='ans'?MP.ansCode:ds.k==='off'?MP.offerCode:MP.code;try{navigator.clipboard.writeText(c);toast('Código copiado.');}catch(e){toast('Selecione o texto e copie.');}return;}
      case 'mp-hostM':mpHost(true);return;
      case 'mp-joinM':mpJoinManual();return;
      case 'mp-ansM':{const t=document.getElementById('mp-off');mpDec(t&&t.value).then(o=>mpAccept(o.s,async pl=>{if(pl.full)return toast('A equipe já tem 5 jogadores.');MP.ansCode=await mpEnc({a:pl.sdp});mpRefresh();})).catch(()=>toast('Código inválido.'));return;}
      case 'mp-conM':{const t=document.getElementById('mp-ans');mpDec(t&&t.value).then(o=>{const p=MP.peers['0'];if(!p||!o.a)throw 0;MP.status='Conectando...';mpRefresh();return p.pc.setRemoteDescription({type:'answer',sdp:o.a});}).catch(()=>toast('Resposta inválida.'));return;}
      case 'mp-char':MP.me.char=ds.k;if(MP.role==='guest')mpSend({t:'pick',char:ds.k});else mpLobbyCast();return this.mp();
      case 'mp-start':if(MP.role==='host'){const info=mpStartInfo();mpSend({t:'start',...info});mpBegin(info);}return;
      case 'mp-leave':mpLeave();return this.title();
    }
    return act(a,ds);
  };
  // Enter no campo do código já entra
  OV.addEventListener('keydown',e=>{if(e.target&&e.target.id==='mp-code'&&e.key==='Enter')mpJoin(e.target.value);});
  try{const st=document.createElement('style');st.textContent=`.inp{width:100%;background:#0e100f;color:var(--ink);border:1px solid var(--line);padding:8px 10px;font:inherit;font-size:16px}
    .mpin{max-width:9em;text-transform:uppercase;letter-spacing:.3em;font-size:22px;text-align:center}.inp.code{font-family:monospace;font-size:11px;word-break:break-all}.mpcode{font:700 46px/1 monospace;letter-spacing:.25em;color:var(--amber);margin:6px 0}.mpst{color:var(--amber)}
    .mplist{display:flex;flex-direction:column;gap:6px}.mpp{display:flex;flex-wrap:wrap;align-items:baseline;gap:6px;padding:6px 8px;background:rgba(255,255,255,.03);border:1px solid var(--line)}.mpp small{width:100%;color:var(--dim)}
    .dot{display:inline-block;width:12px;height:12px;border-radius:50%}.mpme{display:flex;align-items:center;gap:8px;margin:4px 0 8px}`;document.head.appendChild(st);}catch(e){}
})();
