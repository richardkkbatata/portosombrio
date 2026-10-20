// ===================== CONTA NA NUVEM (opcional) =====================
// Liga o jogo à API de contas do site (worker/contas.js) para o registro ir pra nuvem.
// Nada aqui muda o jogo: quem não entra numa conta joga exatamente como antes.
// A senha NUNCA é guardada nem escrita no console: fica só o token da sessão no localStorage.
const NU_SITE='nightgetaway.net.br';
const NU_JOGO='porto-sombrio';
const NU_TOK_KEY='ps-nuvem-tok', NU_USER_KEY='ps-nuvem-user', NU_APEL_KEY='ps-nuvem-apelido', NU_FILA_KEY='ps-nuvem-fila';
const NU={tok:null,usuario:'',apelido:'',fila:[],slots:null,enviando:false,msg:'',carregando:false};

function nuLS(k){try{return localStorage.getItem(k);}catch(e){return null;}}
function nuLSet(k,v){try{if(v==null){if(localStorage.removeItem)localStorage.removeItem(k);else localStorage.setItem(k,'');}else localStorage.setItem(k,String(v));}catch(e){}}

// endereço da API: no próprio site usa caminho relativo; no APK/Windows vai no domínio.
// 'ps-nuvem' no localStorage troca o endereço (serve pra testar com um servidor local).
function nuBase(){
  const o=nuLS('ps-nuvem'); if(o)return String(o).replace(/\/+$/,'');
  let h=''; try{h=(location.hostname||'').toLowerCase();}catch(e){}
  return (h&&(h.endsWith(NU_SITE)||h.endsWith('pages.dev')))?'':'https://'+NU_SITE;
}
function nuURL(rota){return nuBase()+rota;}

// ---------- estado guardado ----------
(function(){
  NU.tok=nuLS(NU_TOK_KEY)||null; NU.usuario=nuLS(NU_USER_KEY)||''; NU.apelido=nuLS(NU_APEL_KEY)||'';
  try{const f=JSON.parse(nuLS(NU_FILA_KEY)||'[]');if(Array.isArray(f))NU.fila=f.map(n=>+n).filter(n=>n>=1&&n<=SLOTS);}catch(e){}
})();
function nuLogado(){return !!NU.tok;}
function nuGuardar(d){
  NU.tok=d&&d.token||null; NU.usuario=d&&d.usuario||''; NU.apelido=d&&d.apelido||NU.usuario;
  nuLSet(NU_TOK_KEY,NU.tok); nuLSet(NU_USER_KEY,NU.usuario); nuLSet(NU_APEL_KEY,NU.apelido);
}
function nuEsquecer(){NU.tok=null;NU.usuario='';NU.apelido='';NU.slots=null;nuLSet(NU_TOK_KEY,null);nuLSet(NU_USER_KEY,null);nuLSet(NU_APEL_KEY,null);}
function nuFilaSalvar(){nuLSet(NU_FILA_KEY,JSON.stringify(NU.fila));}
function nuEnfileirar(n){n=+n;if(!(n>=1&&n<=SLOTS))return;if(!NU.fila.includes(n))NU.fila.push(n);nuFilaSalvar();}
function nuDesenfileirar(n){NU.fila=NU.fila.filter(x=>x!==+n);nuFilaSalvar();}

// ---------- mensagens de erro em português simples ----------
const NU_ERROS={'sem-internet':'Sem internet agora. Vou tentar de novo depois.','usuario-ou-senha':'Usuário ou senha errados.',
  'usuario-existe':'Esse usuário já existe. Escolha outro nome.','usuario-invalido':'O usuário só aceita letras, números, ponto, - e _ (de 3 a 20 letras).',
  'senha-curta':'A senha precisa de pelo menos 8 letras ou números.','email-invalido':'Esse e-mail não parece certo.',
  'muitas-tentativas':'Muitas tentativas. Espere uns 15 minutos.','entre na sua conta':'Sua entrada expirou. Entre na conta de novo.',
  'contas ainda não ligadas':'O servidor das contas ainda não está ligado. Jogue normal: o registro fica no aparelho.',
  'save-grande':'Esse registro está grande demais para a nuvem.','sem-save':'Não tem registro desse número na nuvem.',
  'apelido-vazio':'Escreva um apelido.','banco':'O servidor das contas está com problema. Tente mais tarde.',
  'json':'Deu errado ao falar com o servidor.','grande':'Mandei coisa demais de uma vez.','sem-conta':'Essa conta não existe mais.'};
function nuErroTxt(e){return NU_ERROS[e]||(e?'Não deu: '+e:'Não deu certo agora.');}

// ---------- conversa com o servidor (nunca estoura: sempre devolve objeto) ----------
async function nuFetch(rota,opc){
  const o=opc||{};
  if(typeof fetch!=='function')return {ok:false,erro:'sem-internet'};
  const h={}; if(o.body)h['content-type']='application/json';
  if(o.auth!==false&&NU.tok)h['authorization']='Bearer '+NU.tok;
  let ac=null,tm=null;
  try{if(typeof AbortController!=='undefined'){ac=new AbortController();tm=setTimeout(()=>{try{ac.abort();}catch(e){}},12000);}}catch(e){}
  try{
    const r=await fetch(nuURL(rota),{method:o.met||'GET',headers:h,cache:'no-store',body:o.body?JSON.stringify(o.body):undefined,signal:ac?ac.signal:undefined});
    if(tm)clearTimeout(tm);
    let d=null; try{d=await r.json();}catch(e){}
    if(r.status===401&&o.auth!==false&&NU.tok&&rota!=='/api/conta/entrar'){nuEsquecer();return {ok:false,erro:'entre na sua conta'};}
    if(!r.ok||!d||d.ok===false)return {ok:false,erro:(d&&d.erro)||'servidor',st:r.status};
    return {ok:true,d};
  }catch(e){if(tm)clearTimeout(tm);return {ok:false,erro:'sem-internet'};}
}
function nuAparelho(){try{return IN.touch?'celular':'computador';}catch(e){return 'computador';}}

// ---------- datas: comparar o registro do aparelho com o da nuvem ----------
function nuTsLocal(s){
  const m=s&&s.meta; if(!m)return 0;
  if(m.ts>0)return +m.ts;
  const q=String(m.quando||''),p=/(\d{2})\/(\d{2})\/(\d{4})[,\s]+(\d{2}):(\d{2})(?::(\d{2}))?/.exec(q);
  if(p)return new Date(+p[3],+p[2]-1,+p[1],+p[4],+p[5],+(p[6]||0)).getTime();
  return 0;
}
function nuData(ms){if(!ms)return 'data desconhecida';try{return new Date(ms).toLocaleString('pt-BR');}catch(e){return String(ms);}}
// a nuvem só ganha se for MAIS NOVA que o do aparelho com folga de 1 minuto (relógios nunca batem exato)
function nuNuvemMaisNova(tsLocal,tsNuvem){return tsNuvem>0&&tsNuvem>tsLocal+60000;}
// marca a hora exata no registro (o meta.quando já existia, mas é texto)
(function(){const ser=serialize;serialize=function(){const s=ser.apply(this,arguments);try{if(s&&s.meta)s.meta.ts=Date.now();}catch(e){}return s;};})();

// ---------- enviar / baixar um registro ----------
function nuPacote(n){
  const s=slotRead(n); if(!s)return null;
  const m=s.meta||{};
  return {dados:JSON.stringify(s),versao_jogo:String(m.v||(typeof GAME_VER!=='undefined'?GAME_VER:'')),
    resumo:String(`${m.onde||'—'} · dia ${m.dia||1} ${m.hora||''}`).slice(0,30)};
}
async function nuEnviarSlot(n){
  if(!nuLogado())return {ok:false,erro:'entre na sua conta'};
  const p=nuPacote(n); if(!p){nuDesenfileirar(n);return {ok:false,erro:'sem-save'};}
  const r=await nuFetch('/api/saves/'+NU_JOGO+'/'+n,{met:'PUT',body:p});
  if(r.ok)nuDesenfileirar(n); else nuEnfileirar(n);
  return r;
}
async function nuEnviarFila(){
  if(NU.enviando||!nuLogado()||!NU.fila.length)return false;
  NU.enviando=true;
  try{for(const n of NU.fila.slice()){const r=await nuEnviarSlot(n);if(!r.ok)break;}}
  finally{NU.enviando=false;}
  return !NU.fila.length;
}
async function nuListar(){
  if(!nuLogado())return {ok:false,erro:'entre na sua conta'};
  const r=await nuFetch('/api/saves?jogo='+NU_JOGO);
  if(r.ok)NU.slots=(r.d.slots||[]).slice();
  return r;
}
async function nuBaixarSlot(n){
  const r=await nuFetch('/api/saves/'+NU_JOGO+'/'+n);
  if(!r.ok)return r;
  let o=null; try{o=JSON.parse(r.d.dados);}catch(e){}
  if(!o||!o.P||!o.flags)return {ok:false,erro:'Esse registro da nuvem está estragado.'};
  try{localStorage.setItem(slotKey(n),JSON.stringify(o));}catch(e){return {ok:false,erro:'Não deu pra guardar neste aparelho.'};}
  return {ok:true,d:r.d};
}

// depois de salvar no aparelho, manda pra nuvem (sem internet, fica na fila)
(function(){
  const ws=writeSave; writeSave=function(){
    const r=ws.apply(this,arguments);
    if(r&&nuLogado()){nuEnfileirar(SLOT);try{nuEnviarFila();}catch(e){}}
    return r;
  };
  try{if(typeof addEventListener==='function')addEventListener('online',()=>{try{nuEnviarFila();}catch(e){}});}catch(e){}
})();

// ===================== TELAS =====================
function nuVal(id){const e=document.getElementById(id);return e&&e.value!=null?String(e.value).trim():'';}
function nuSlotsHTML(){
  if(NU.carregando)return '<p class="hint">Vendo o que tem na nuvem...</p>';
  if(!NU.slots)return '<p class="hint">Ainda não olhei a nuvem.</p>';
  if(!NU.slots.length)return '<p class="hint">Nenhum registro na nuvem ainda. Salve no jogo e ele sobe sozinho.</p>';
  return `<div class="lista slots">${NU.slots.map(s=>`<div class="lrow"><span class="ln"><b>Registro ${s.slot}</b>
    <small>${esc(String(s.resumo||'—'))} · versão ${esc(String(s.versao_jogo||'?'))} · ${esc(nuData((s.atualizado||0)*1000))}</small></span>
    <span class="sbtn"><button class="btn mini" data-a="nu-baixar" data-n="${s.slot}">Trazer pra cá</button></span></div>`).join('')}</div>`;
}
UI.nuvem=function(from){
  this.nuFrom=from||this.nuFrom||'title';
  const cab=`<div class="tabs"><p class="kick">NightGetaway</p><h2 style="margin-right:auto">Conta na nuvem</h2><button class="btn ghost" data-a="nu-back">Voltar</button></div>`;
  const aviso='<p class="hint">Isto é opcional. Sem conta o jogo funciona igual, com o registro guardado só neste aparelho. Com conta, o registro também fica na internet e você continua a partida em outro computador ou celular.</p>';
  const msg=NU.msg?`<p class="nu-msg">${esc(NU.msg)}</p>`:'';
  if(!nuLogado()){
    this.open(`<div class="sheet wide nuvem">${cab}${aviso}${msg}
      <div class="nu-form">
        <label>Usuário<input id="nu-user" type="text" maxlength="20" autocomplete="username" spellcheck="false"></label>
        <label>Senha<input id="nu-senha" type="password" maxlength="60" autocomplete="current-password"></label>
        <label>E-mail (só se quiser, para recuperar a senha)<input id="nu-email" type="email" maxlength="120" autocomplete="email"></label>
      </div>
      <div class="row"><button class="btn primary" data-a="nu-entrar" data-focus>Entrar</button><button class="btn" data-a="nu-criar">Criar conta</button></div>
      <p class="hint">O usuário aceita letras, números, ponto, - e _ (3 a 20 letras). A senha precisa de 8 letras ou mais. A senha não fica guardada neste aparelho.</p></div>`,'','nuvem');
    return;
  }
  this.open(`<div class="sheet wide nuvem">${cab}
    <p>Você está na conta <b>${esc(NU.apelido||NU.usuario)}</b> (usuário ${esc(NU.usuario)}).</p>
    ${msg}${NU.fila.length?`<p class="hint">Faltou mandar ${NU.fila.length} registro(s) pra nuvem. Vou mandar quando a internet voltar.</p>`:''}
    <h3>Registros na nuvem</h3>${nuSlotsHTML()}
    <div class="row"><button class="btn" data-a="nu-ver">Ver a nuvem de novo</button><button class="btn" data-a="nu-subir">Mandar meus 5 registros</button>
      <button class="btn ghost" data-a="nu-sair">Sair da conta</button></div>
    ${aviso}</div>`,'','nuvem');
};
// pergunta qual registro usar quando o da nuvem é mais novo
UI.nuConf=function(n,tsLocal,info){
  this.nuConfN=n; this.nuConfInfo=info||{};
  this.open(`<div class="sheet narrow nuvem"><p class="kick">Registro ${n}</p><h2>Qual registro você quer?</h2>
    <p>O registro que está na nuvem é mais novo que o deste aparelho. Escolha com cuidado: o outro não é apagado agora, mas o jogo vai continuar do que você escolher.</p>
    <div class="lista slots">
      <div class="lrow"><span class="ln"><b>Neste aparelho</b><small>${esc(nuData(tsLocal))}</small></span>
        <span class="sbtn"><button class="btn mini" data-a="nu-usaLocal" data-n="${n}">Usar este</button></span></div>
      <div class="lrow"><span class="ln"><b>Na nuvem (${esc(NU.apelido||NU.usuario)})</b><small>${esc(nuData(((info&&info.atualizado)||0)*1000))}${info&&info.resumo?' · '+esc(String(info.resumo)):''}</small></span>
        <span class="sbtn"><button class="btn mini primary" data-a="nu-usaNuvem" data-n="${n}">Usar o da nuvem</button></span></div>
    </div>
    <div class="row"><button class="btn ghost" data-a="nu-confCancel">Deixar pra depois</button></div></div>`,'','nuconf');
};

// ===================== AÇÕES =====================
(function(){
  const act=UI.act.bind(UI);
  UI.act=function(a,ds){
    const n=+(ds&&ds.n)||1;
    switch(a){
      case 'nuvem':NU.msg='';return this.nuvem((ds&&ds.from)||'title');
      case 'nu-back':return this.nuFrom==='pause'?(G.mode='play',this.pause()):this.title();
      case 'nu-entrar':case 'nu-criar':{
        const u=nuVal('nu-user').toLowerCase(),s=nuVal('nu-senha'),em=nuVal('nu-email'),criar=a==='nu-criar';
        if(!/^[a-z0-9_.-]{3,20}$/.test(u)){NU.msg=nuErroTxt('usuario-invalido');return this.nuvem();}
        if(s.length<8){NU.msg=nuErroTxt('senha-curta');return this.nuvem();}
        NU.msg='Falando com o servidor...'; this.nuvem();
        const corpo={usuario:u,senha:s,aparelho:nuAparelho()};
        if(criar&&em)corpo.email=em; if(criar)corpo.apelido=u;
        nuFetch(criar?'/api/conta/criar':'/api/conta/entrar',{met:'POST',body:corpo,auth:false}).then(r=>{
          if(!r.ok){NU.msg=nuErroTxt(r.erro);if(UI.cur==='nuvem')UI.nuvem();return;}
          nuGuardar(r.d); NU.msg=criar?'Conta criada. Seus registros vão subir sozinhos.':'Você entrou.';
          toast(criar?'Conta criada.':'Você entrou na sua conta.');
          if(UI.cur==='nuvem')UI.nuvem();
          UI.act('nu-ver',{});
          try{nuEnviarFila();}catch(e){}
        });
        return;}
      case 'nu-sair':{
        const t=NU.tok; nuEsquecer(); NU.msg='Você saiu da conta. O registro continua neste aparelho.';
        if(t)nuFetch('/api/conta/sair',{met:'POST'}).catch(()=>{});
        toast('Saiu da conta.'); return this.nuvem();}
      case 'nu-ver':{
        if(!nuLogado())return this.nuvem();
        NU.carregando=true; if(UI.cur==='nuvem')this.nuvem();
        nuListar().then(r=>{NU.carregando=false;if(!r.ok)NU.msg=nuErroTxt(r.erro);if(UI.cur==='nuvem')UI.nuvem();});
        return;}
      case 'nu-subir':{
        if(!nuLogado())return this.nuvem();
        let q=0; for(let i=1;i<=SLOTS;i++)if(slotRead(i)){nuEnfileirar(i);q++;}
        NU.msg=q?`Mandando ${q} registro(s) pra nuvem...`:'Nenhum registro neste aparelho para mandar.';
        this.nuvem();
        nuEnviarFila().then(()=>{NU.msg=NU.fila.length?'Faltou mandar '+NU.fila.length+' registro(s). Vou tentar de novo depois.':'Tudo na nuvem.';
          if(UI.cur==='nuvem')UI.act('nu-ver',{});}).catch(()=>{});
        return;}
      case 'nu-baixar':{
        NU.msg='Trazendo o registro '+n+'...'; this.nuvem();
        nuBaixarSlot(n).then(r=>{NU.msg=r.ok?`Registro ${n} trazido da nuvem para este aparelho.`:nuErroTxt(r.erro);
          if(r.ok)toast('Registro '+n+' veio da nuvem.');if(UI.cur==='nuvem')UI.nuvem();});
        return;}
      // escolha do conflito
      case 'nu-usaLocal':{UI.nuPular=n;return act('slotLoad',{n:String(n)});}
      case 'nu-usaNuvem':{
        NU.msg='Trazendo o registro da nuvem...'; this.nuvem();
        nuBaixarSlot(n).then(r=>{if(!r.ok){NU.msg=nuErroTxt(r.erro);if(UI.cur==='nuvem')UI.nuvem();return;}
          UI.nuPular=n; UI.act('slotLoad',{n:String(n)});});
        return;}
      case 'nu-confCancel':return this.slots(this.slotMode||'load');
      // ao abrir um slot: confere a nuvem antes (nunca sobrescreve sozinho)
      case 'slotLoad':{
        if(UI.nuPular===n){UI.nuPular=null;return act(a,ds);}
        if(!nuLogado()||!slotRead(n))return act(a,ds);
        const tsL=nuTsLocal(slotRead(n));
        nuFetch('/api/saves/'+NU_JOGO+'/'+n).then(r=>{
          if(!r.ok||!nuNuvemMaisNova(tsL,(r.d.atualizado||0)*1000)){UI.nuPular=n;return UI.act('slotLoad',{n:String(n)});}
          UI.nuConf(n,tsL,r.d);
        });
        toast('Conferindo a nuvem...');
        return;}
    }
    return act(a,ds);};
  const bk=UI.back.bind(UI); UI.back=function(){if(this.cur==='nuvem')return this.act('nu-back',{});if(this.cur==='nuconf')return this.slots(this.slotMode||'load');return bk();};
  // botão no título, depois de Registros
  const tt=UI.title.bind(UI); UI.title=function(){tt();try{const m=OV.querySelector('.menu');if(!m||m.querySelector('[data-a=nuvem]'))return;
    const b=document.createElement('button');b.className='btn';b.dataset.a='nuvem';b.dataset.from='title';
    b.textContent=nuLogado()?`Conta na nuvem: ${NU.apelido||NU.usuario}`:'Conta na nuvem';
    const ref=m.querySelector('[data-a=slotsMenu]');if(ref&&ref.parentNode===m&&m.insertBefore)m.insertBefore(b,ref.nextSibling);else m.appendChild(b);
  }catch(e){}};
  try{const st=document.createElement('style');st.textContent=`.nuvem .nu-form{display:flex;flex-direction:column;gap:10px;margin:12px 0}
    .nuvem .nu-form label{display:flex;flex-direction:column;gap:4px;color:var(--dim);font-size:14px}
    .nuvem .nu-form input{font:inherit;font-size:16px;padding:7px 9px;background:rgba(0,0,0,.3);color:var(--ink,#ddd6c6);border:1px solid var(--line,#5a5040)}
    .nuvem .nu-msg{border-left:2px solid var(--amber,#d9a33c);padding:4px 0 4px 10px;margin:10px 0}`;document.head.appendChild(st);}catch(e){}
})();

// ---------- menu de teste ----------
if(typeof dbgExtra==='function')dbgExtra('1.14 · Conta na nuvem',[['nu:tela','Abrir a tela da Conta'],['nu:envia','Forçar envio do registro de agora'],
  ['nu:conf','Forçar a pergunta do conflito (nuvem mais nova)'],['nu:fila','Ver a fila de envio'],['nu:base','Mostrar o endereço da API'],['nu:esquece','Esquecer o token (sair sem avisar o servidor)']],
  function(k){
    switch(k){
      case 'nu:tela':NU.msg='';return UI.nuvem('title');
      case 'nu:envia':{if(!nuLogado())return toast('Entre numa conta primeiro.');nuEnfileirar(SLOT);nuEnviarFila().then(()=>toast(NU.fila.length?'Não deu: ficou na fila.':'Registro na nuvem.'));return;}
      case 'nu:conf':{const s=slotRead(SLOT);if(!s)return toast('Salve no registro atual primeiro.');
        return UI.nuConf(SLOT,nuTsLocal(s),{atualizado:Math.floor((Date.now()+86400000)/1000),resumo:'teste'});}
      case 'nu:fila':return toast(NU.fila.length?'Fila: registros '+NU.fila.join(', '):'Fila vazia.');
      case 'nu:base':return toast('API: '+(nuBase()||'este mesmo site')+'/api/conta');
      case 'nu:esquece':{nuEsquecer();toast('Token esquecido.');return;}
    }
  });
