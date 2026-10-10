// ===================== 1.3: TUTORIAL · BANCADA · MÚSICA · SONIA =====================

// ---------- Sonia (namorada do Richard, no telefone) ----------
PCH.sonia={name:'Sonia',skin:'#e8bfa2',shade:'#b88a6c',hair:'#2a1810',iris:'#4a3020',bg:['#2a1420','#0c0508'],glow:'240,140,170',voice:230};
PXH.sonia={hw:52,hh:68,body:['#6a3a52','#2a1420'],
  clothes(c,cx){c.fillStyle='#7a4a62';c.beginPath();c.moveTo(100,212);c.quadraticCurveTo(cx,240,180,212);c.lineTo(172,206);c.quadraticCurveTo(cx,230,108,206);c.closePath();c.fill();
    c.strokeStyle='#e8d8c8';c.lineWidth=1.5;c.beginPath();c.arc(cx,226,16,.3,Math.PI-.3);c.stroke();c.fillStyle='#e8c870';c.beginPath();c.arc(cx,243,3,0,6.283);c.fill();},
  back(c,cx,cy,hw,p){c.fillStyle=p.hair;c.beginPath();c.ellipse(cx,cy+10,hw+18,108,0,0,6.283);c.fill();},
  details(c,cx,cy,my,mood){if(mood!=='s'&&mood!=='h'){c.fillStyle='#c46a6a';c.beginPath();c.moveTo(cx-14,my);c.quadraticCurveTo(cx-6,my-5,cx,my-3);c.quadraticCurveTo(cx+6,my-5,cx+14,my);c.quadraticCurveTo(cx,my+9,cx-14,my);c.fill();}
    c.fillStyle='rgba(230,120,120,.16)';for(const s of [-1,1]){c.beginPath();c.ellipse(cx+s*30,cy+18,13,9,0,0,6.283);c.fill();}
    c.strokeStyle='#1a100a';c.lineWidth=2;for(const s of [-1,1]){c.beginPath();c.moveTo(cx+s*30,cy-6);c.lineTo(cx+s*36,cy-10);c.stroke();}},
  hair(c,cx,cy,hw,hh,p){c.fillStyle=p.hair;c.beginPath();c.moveTo(cx-hw-6,cy+60);c.bezierCurveTo(cx-hw-16,cy-hh-26,cx+hw+16,cy-hh-26,cx+hw+6,cy+60);c.lineTo(cx+hw-6,cy+40);
    c.quadraticCurveTo(cx+hw,cy-20,cx+14,cy-48);c.quadraticCurveTo(cx-6,cy-30,cx-hw+4,cy-12);c.quadraticCurveTo(cx-hw+2,cy+20,cx-hw+4,cy+40);c.closePath();c.fill();
    c.strokeStyle='rgba(140,90,60,.35)';c.lineWidth=2;for(let i=0;i<12;i++){const x=cx-hw+Math.random()*hw*2,y=cy-hh+Math.random()*40;c.beginPath();c.moveTo(x,y);c.quadraticCurveTo(x+6,y+30,x+2,y+70);c.stroke();}}};
function sonia(t,m='n',dur){AU.phone(.5);bark('sonia',m,t,{radio:true,dur:dur||Math.max(3,t.length*.055+1.6)});}
const SONIA_HINT=[
  [/defender|faca/,'Amor, a Dona Cida falou da cozinha do prédio da frente. Vai de lanterna apagada, devagar.'],
  [/Tião na oficina|Encontre o Tião/,'A oficina do Tião é lá embaixo, na Barra Sul. Abre o mapa, aperta M: o losango laranja é pra onde tu tem que ir.'],
  [/fusível no Supermercado/,'Supermercado Bom Preço, na Barra Norte. Fusível costuma ficar nos fundos, perto do quadro de luz.'],
  [/quadro de força/,'Tu já tem o fusível. O quadro da Delegacia fica perto do arsenal, lá dentro.'],
  [/arsenal/,'Com a luz da Delegacia de volta, o arsenal destrava. Pega a pistola e conta as balas.'],
  [/cadeado|bilhete do Juninho/,'O cadeado tem três números. Lê o bilhete do Juninho com calma: a resposta tá lá dentro, amor.'],
  [/bateria/,'Leva a bateria pro Tião. Sem jipe ninguém atravessa a barricada.'],
  [/bondinho na estação|Pegue o bondinho/,'A estação do bondinho é do lado da oficina, na Barra Sul. Sobe e vê o Seu Ivo.'],
  [/trilha da Mata|colônia/,'Desce a trilha até a vila. A colônia é a casa de madeira grande, perto da praia.'],
  [/gerador auxiliar/,'O gerador fica na cozinha do restaurante. Vai fazer barulho: liga e corre pro bondinho.'],
  [/estação Laranjeiras/,'Corre pra estação! Não para pra olhar pra trás!'],
  [/dinamite|barricada/,'A barricada é no fim da Barra Norte, na Estrada da Rainha. Acende o pavio e corre pra longe.'],
  [/jipe/,'Entra no jipe e acelera. A barricada só cede com velocidade.'],
  [/Clínica da Brava/,'Segue pela Estrada da Rainha até a Brava. A clínica fica perto da praia.'],
  [/quarto 107|recepção|casa de máquinas do Resort|diesel/,'No resort, começa pela recepção. O gerente sempre deixa alguma coisa no quarto dele.'],
  [/Ruth Cardoso|inibidor V-7 está/,'O Ruth Cardoso é no Centro de BC. A farmácia fica na ala leste.'],
  [/Shopping Atlântico|drogaria/,'O shopping é no Centro. Amor... cuidado com o que a Vértice deixou lá dentro.'],
  [/sala da segurança|painel da casa de máquinas/,'Preso no shopping? A sala da segurança tem a chave. O painel fica na ala de serviço, no sul.'],
  [/Helena|inibidor para/,'Leva o inibidor pra Helena antes que seja tarde. Ela é a única que sabe tudo.'],
  [/Cabeçudas/,'O cartão da Helena abre o bloqueio de Cabeçudas. Depois dali é Itajaí. É do lado de onde eu tô.'],
  [/guindaste|Contêineres/,'O Matheus trabalha lá. Ele sabe mexer no guindaste.'],
  [/Abasteça o gerador/,'Tu tá com o diesel? Então é só abastecer o gerador do lado da clínica.'],
  [/Santa Clara|isolamento|alicate|corrente/,'Ela não enxerga, amor. Anda agachado, joga garrafa longe, e não corre. Nunca corre.'],
  [/cartão do heliponto|Laboratório/,'O cartão deve estar no Laboratório Vértice, no porto. Eu vejo as luzes dele daqui.'],
  [/guindaste|Contêineres/,'O Matheus trabalha lá. Ele sabe mexer no guindaste.'],
  [/rádio do heliponto/,'Usa o rádio do heliponto. Depois é só aguentar. Eu tô aqui do outro lado do rio, olhando.'],
  [/posto queimado/,'Alguém gritando? Vai com cuidado, Richard. Grito no meio do silêncio nunca é coisa boa.'],
];
function soniaTick(dt){
  const F=G.flags; if(!F.soniaMet||CUT.on||F.radio||G.mode!=='play')return;
  // ficou parado no mesmo objetivo: ela liga com uma dica
  G.ev.shT=(G.ev.shT??90)-dt;
  if((G.objT||0)>140&&G.ev.shT<=0&&!G.pSafe){G.ev.shT=170;const t=objective().t;const h=(SONIA_HINT.find(([r])=>r.test(t))||[0,'Abre o mapa, amor. Aperta M: o losango laranja é pra onde tu tem que ir.'])[1];sonia(h);}
  // a história pelo telefone
  const beat=(k,fn)=>{if(F[k])return;if(!G.ev.sBeatOk){F[k]=1;return;}if((G.ev.sBeatCd||0)>0)return;F[k]=1;G.ev.sBeatCd=45;fn();};
  G.ev.sBeatCd=(G.ev.sBeatCd||0)-dt; if(!G.ev.sBeatOk&&(G.ev.sBeatT=(G.ev.sBeatT||0)+dt)>1)G.ev.sBeatOk=1;
  if(F.eduJoin)beat('sEdu',()=>later(9000,()=>sonia('O Edu tá contigo? Graças a Deus. Não deixa ele fazer nenhuma burrice.','h')));
  if(F.tiaoMorto)beat('sTiao',()=>later(6000,()=>{sonia('Amor... tu tá chorando? O que aconteceu?','s');later(3600,()=>bark('rafa','t','O Tião morreu, Sonia. Ele ficou pra trás pra gente fugir.',{dur:2.6}));later(7000,()=>sonia('Então não deixa isso ser em vão. Não para. Por mim, não para.','t'));}));
  if(F.metHelena)beat('sHelena',()=>later(5000,()=>sonia('Uma médica da Vértice? Confia nela, Richard. Mas não muito.','n')));
  if(F.vertice)beat('sItajai',()=>later(4000,()=>{sonia('Tu tá em Itajaí? Eu tô do outro lado do rio, em Navegantes! Dá pra ver o porto daqui.','h');later(4200,()=>sonia('Tem uma luz piscando lá em cima, no heliponto. Vai pra lá. Eu te espero.','n'));}));
}
function soniaFirst(){
  const F=G.flags; if(F.soniaMet)return; F.soniaMet=true; AU.phone(1); G.ev.sBeatCd=60;
  later(900,()=>bark('rafa','s','O celular... é a Sonia!',{dur:1.6}));
  later(2700,()=>sonia('Richard?! Graças a Deus... eu tô ligando faz uma hora. Tô na casa da minha tia, em Navegantes. Aqui ainda tá calmo.','s',4));
  later(7200,()=>bark('rafa','n','Tô na Dona Cida, na Avenida Brasil. Amor, tá todo mundo virando. Todo mundo.',{dur:3}));
  later(10600,()=>sonia('Escuta: a TV diz que o Exército fechou tudo. Se tem saída, é por Itajaí, pelo porto. Eu vou ficar no telefone contigo enquanto der.','n',4.4));
  later(15600,()=>sonia('Se tu se perder, eu te ajudo. Tô com o mapa da cidade aberto aqui. Te amo. Volta pra mim.','h',3.6));
}

// ---------- tutorial no apartamento da Dona Cida ----------
const TUT=[
  {k:'move',t:'ANDAR',d:['WASD ou setas para andar · Shift corre','Use o controle da esquerda para andar'],ok:()=>hyp(P.x-(G.tut.x0||P.x),P.y-(G.tut.y0||P.y))>40,say:'Isso. Sem pressa, menino. Pressa faz barulho.'},
  {k:'lamp',t:'LANTERNA',d:['F apaga e acende a lanterna','Toque no botão da lanterna, no alto da tela'],ok:()=>!P.lamp,say:'No escuro eles quase não te veem. A lanterna te entrega.'},
  {k:'crouch',t:'AGACHAR',d:['C agacha: passo silencioso, difícil de ver','Toque em AGACHAR'],ok:()=>P.crouch,say:'Agachado ninguém te escuta. É assim que eu vou no banheiro de madrugada.'},
  {k:'stand',t:'LEVANTAR',d:['C de novo para levantar','Toque em AGACHAR de novo'],ok:()=>!P.crouch},
  {k:'inv',t:'MOCHILA',d:['I ou Tab abre a mochila e o mapa','Toque na mochila, no alto da tela'],ok:()=>G.ev.invOpened,say:'Olha o que você carrega. E o mapa. Sempre olha o mapa.'},
  {k:'throw',t:'GARRAFA',d:['G arremessa a garrafa: o barulho distrai eles','Toque em JOGAR para arremessar a garrafa'],ok:()=>invCount('garrafa')<=0,give:()=>{const l=invAdd('garrafa',1);if(l)boxAdd('garrafa',l);P.thr='garrafa';},say:'Eles vão atrás do barulho. Lembra disso quando estiver encurralado.'},
  {k:'save',t:'SALVAR',d:['Chegue na máquina de escrever e aperte E para salvar','Chegue na máquina de escrever e toque em USAR'],ok:()=>G.ev.saveOpened,say:'Toda vez que achar uma dessas com a luz verde, escreve. Pra alguém saber.'},
];
function tutTick(dt){
  const F=G.flags; if(F.tutDone||CUT.on||G.mode!=='play')return;
  const cb=typeof cidaB==='function'?cidaB():-1;
  if(!G.tut){if(F.armed&&!F.soniaMet){F.tutDone=true;later(3000,soniaFirst);return;}if(G.inB!==cb||F.armed)return;G.tut={i:0,x0:P.x,y0:P.y,t:0};AU.ui();return;}
  const T=G.tut; T.t+=dt;
  if(G.inB!==cb&&T.t>.5){F.tutDone=true;G.tut=null;toast('Tutorial encerrado.');soniaFirst();return;}
  const s=TUT[T.i]; if(!s){F.tutDone=true;G.tut=null;AU.ach&&AU.ach();bark('cida','h','Pronto, menino. Agora vai. A cozinha do seu Moacir é no prédio da frente.',{dur:3});later(4200,soniaFirst);return;}
  if(!T.given&&s.give){T.given=1;s.give();}
  if(s.ok()){T.done=(T.done||0)+dt;if(T.done>.35){if(s.say)bark('cida','n',s.say,{dur:2.6});T.i++;T.done=0;T.given=0;AU.pickup();}}
}
function drawTut(){
  const T=G.tut; if(!T||G.mode!=='play'||CUT.on)return; const s=TUT[T.i]; if(!s)return;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  const w=Math.min(420,view.w-40),h=58,x=view.w/2-w/2,y=view.h<520?Math.round(view.h*.16):Math.round(view.h*.68);
  ctx.fillStyle='rgba(8,10,12,.82)';ctx.fillRect(x,y,w,h);ctx.fillStyle='#d49a3c';ctx.fillRect(x,y,3,h);
  ctx.textAlign='left';ctx.fillStyle='#d49a3c';ctx.font=`700 11px ${FONT_UI}`;ctx.fillText(`TUTORIAL ${T.i+1}/${TUT.length} · ${s.t}`,x+12,y+18);
  ctx.fillStyle='#ddd6c6';ctx.font=`600 14px ${FONT_UI}`;ctx.fillText(s.d[IN.touch?1:0],x+12,y+40);
  ctx.fillStyle='rgba(221,214,198,.45)';ctx.font=`500 10px ${FONT_UI}`;ctx.textAlign='right';ctx.fillText('sair do apartamento pula o tutorial',x+w-10,y+h-6);
}

// ---------- bancada de armas ----------
ITEMS.pecas={n:'Peças de arma',s:'PEÇAS',c:'#9aa0a8',st:30,k:'craft',d:'Molas, pinos, um carregador quebrado. Na bancada dos abrigos vira melhoria de arma.'};
LOOT12.push(['pecas',[1,2]],['pecas',[1,2]]);
const UPG={m:{n:'Pente estendido',d:'+50% de balas no pente',c:3},r:{n:'Recarga rápida',d:'Recarrega 35% mais rápido',c:2},a:{n:'Mira ajustada',d:'Muito mais precisa e acerta mais crítico',c:3}};
const BASEW=WEAPONS.map(w=>({mag:w.mag,reload:w.reload,spread:w.spread,crit:w.crit}));
function applyUpgrades(){
  const U=(G.flags&&G.flags.up)||{};
  WEAPONS.forEach((w,i)=>{const b=BASEW[i];if(!b)return;Object.assign(w,b);const u=U[i];if(!u||w.melee)return;
    if(u.m&&w.mag)w.mag=Math.round(b.mag*1.5);if(u.r&&w.reload)w.reload=+(b.reload*.65).toFixed(2);if(u.a){if(w.spread!=null)w.spread=b.spread*.5;w.crit=(b.crit||0)+.08;}});
}
UI.bench=function(){
  if(G.mode==='play')G.mode='menu';
  const U=G.flags.up||{}, pc=invCount('pecas')+G.box.filter(b=>b.id==='pecas').reduce((n,b)=>n+b.q,0);
  const rows=WEAPONS.map((w,i)=>{if(!P.owned[i]||w.melee||i===8)return '';const u=U[i]||{};
    return `<div class="opt"><h3>${w.n}</h3><div class="seg">${Object.entries(UPG).map(([k,g])=>u[k]?`<button class="btn" disabled>✓ ${g.n}</button>`:`<button class="btn${pc>=g.c?' primary':''}" data-a="upg" data-w="${i}" data-u="${k}" ${pc>=g.c?'':'disabled'}>${g.n} · ${g.c} peças</button>`).join('')}</div><p class="hint">${Object.entries(UPG).map(([k,g])=>g.d).join(' · ')}</p></div>`;}).join('');
  this.open(`<div class="sheet wide"><div class="tabs"><p class="kick">Abrigo</p><h2 style="margin-right:auto">Bancada de armas</h2><button class="btn ghost" data-a="close">Fechar</button></div>
    <p class="hint">Você tem <b>${pc}</b> peças de arma (mochila e baú). Elas aparecem em mochilas largadas, caixas térmicas e com os chefes.</p>${rows||'<p class="hint">Você ainda não tem armas de fogo para melhorar.</p>'}</div>`,'','bench');
};
function payPecas(n){let left=n;const fromInv=Math.min(left,invCount('pecas'));if(fromInv)invRemove('pecas',fromInv);left-=fromInv;
  for(const b of G.box){if(left<=0)break;if(b.id!=='pecas')continue;const t=Math.min(left,b.q);b.q-=t;left-=t;}G.box=G.box.filter(b=>b.q>0);return left<=0;}
Object.assign(INT_LABEL,{bancada:'Bancada de armas'});

// ---------- música ----------
const MUS={mode:null,t:0,step:0,g:null};
AU.musicTick=function(mode){
  const c=this.ctx; if(!c)return;
  if(!MUS.g){MUS.g=c.createGain();MUS.g.gain.value=0;MUS.g.connect(this.master);}
  const t=c.currentTime;
  if(mode!==MUS.mode){MUS.mode=mode;MUS.t=t+.1;MUS.step=0;}
  MUS.g.gain.setTargetAtTime(mode&&this.on?(mode==='menu'?.16:.13):0,t,mode?1.2:.8);
  if(!mode)return;
  const bpm=mode==='menu'?66:mode==='final'?142:128, sd=60/bpm/2;   // colcheias
  while(MUS.t<t+.25){const s=MUS.step++,at=MUS.t;MUS.t+=sd;
    if(mode==='menu')musMenu(s,at,c); else musBoss(s,at,c,mode==='final');}
};
function nt(c,f,at,dur,type,vol,dest,lp){const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f,at);const g=c.createGain();g.gain.setValueAtTime(.0001,at);g.gain.exponentialRampToValueAtTime(vol,at+.012);g.gain.exponentialRampToValueAtTime(.0001,at+dur);
  let n=g;if(lp){const f2=c.createBiquadFilter();f2.type='lowpass';f2.frequency.value=lp;g.connect(f2);n=f2;}o.connect(g);n.connect(dest||MUS.g);o.start(at);o.stop(at+dur+.05);}
const HZ=m=>440*Math.pow(2,(m-69)/12);
// tema do menu: piano triste em lá menor (Am F C E), com uma melodia esparsa
function musMenu(s,at,c){
  const chords=[[57,60,64],[53,57,60],[48,52,55],[52,56,59]], ch=chords[((s/16)|0)%4], k=s%16;
  const arp=[0,1,2,1,0,2,1,2]; nt(c,HZ(ch[arp[k%8]]+12),at,1.6,'triangle',.18,MUS.g,2600);
  if(k===0){nt(c,HZ(ch[0]-12),at,3.6,'sine',.32);nt(c,HZ(ch[0]),at,3.6,'sine',.08);}
  const mel={0:[76,72,72,71],6:[74,72,72,71],10:[72,69,67,68],14:[71,69,64,64]}[k]; if(mel&&Math.random()<.85)nt(c,HZ(mel[((s/16)|0)%4]),at,1.4,'sine',.12,MUS.g,3000);
  if(k===8&&Math.random()<.3)nt(c,HZ(ch[2]+24),at,2.2,'sine',.05);
}
// tema de chefe: baixo martelando em ré menor, bumbo, prato, e um acorde dissonante a cada 2 compassos
function musBoss(s,at,c,fin){
  const k=s%16, bar=(s/16)|0, bass=[38,38,41,38,36,38,46,45][(s>>1)%8];
  if(s%2===0)nt(c,HZ(bass),at,.22,'sawtooth',.34,MUS.g,520);
  if(k%4===0){const o=c.createOscillator();o.type='sine';o.frequency.setValueAtTime(130,at);o.frequency.exponentialRampToValueAtTime(40,at+.18);const g=c.createGain();g.gain.setValueAtTime(.9,at);g.gain.exponentialRampToValueAtTime(.001,at+.25);o.connect(g);g.connect(MUS.g);o.start(at);o.stop(at+.3);}
  if(k%2===1&&AU.nb){const n=c.createBufferSource();n.buffer=AU.nb;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=7000;const g=c.createGain();g.gain.setValueAtTime(.12,at);g.gain.exponentialRampToValueAtTime(.001,at+.06);n.connect(f);f.connect(g);g.connect(MUS.g);n.start(at,Math.random());n.stop(at+.08);}
  if(k===8&&AU.nb){const n=c.createBufferSource();n.buffer=AU.nb;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1800;const g=c.createGain();g.gain.setValueAtTime(.35,at);g.gain.exponentialRampToValueAtTime(.001,at+.18);n.connect(f);f.connect(g);g.connect(MUS.g);n.start(at,Math.random());n.stop(at+.2);}
  if(k===0&&bar%2===0)for(const m of [62,63,69,(fin?74:70)])nt(c,HZ(m),at,1.9,'sawtooth',.05,MUS.g,1800);
  if(fin&&k%4===2)nt(c,HZ(bass+24),at,.12,'square',.05,MUS.g,2400);
}
function musicMode(){
  if(G.mode==='title')return 'menu';
  if(G.mode!=='play'&&G.mode!=='menu')return null;
  if(G.flags&&G.flags.radio&&G.wave>0)return 'final';
  const boss=enemies.find(e=>e.alive&&e.t&&e.t.boss&&e.type!=='ouvinte'&&e.state==='chase'&&hyp(e.x-P.x,e.y-P.y)<760);
  return boss?'boss':null;
}

// ---------- ligações ----------
(function(){
  const g12=genV12; genV12=function(){g12();
    for(const b of buildings){if(!b.safe)continue;for(let k=0;k<60;k++){const x=b.x+1+((R()*(b.w-2))|0),y=b.y+1+((R()*(b.h-2))|0),i=idx(x,y);if(SOLID[map[i]]||pickOcc.has(i)||interacts.some(o=>Math.abs(o.tx-x)+Math.abs(o.ty-y)<2))continue;interacts.push({tx:x,ty:y,x:tc(x),y:tc(y),type:'bancada'});break;}}
    // peças espalhadas
    let n=0;for(let i=0;i<3000&&n<18;i++){const x=1+((R()*(W-2))|0),y=1+((R()*390)|0),k=idx(x,y);if(bmap[k]<0||SOLID[map[k]]||pickOcc.has(k)||!reach[k]||safeMask[k])continue;addPick(x,y,'pecas',ri(1,2));n++;}};
  const vi=v12Interact; v12Interact=function(o){if(o.type==='bancada')return UI.bench();return vi(o);};
  const act=UI.act.bind(UI); UI.act=function(a,ds){
    if(a==='upg'){const i=+ds.w,k=ds.u,g=UPG[k];if(!g)return;const U=G.flags.up=G.flags.up||{};U[i]=U[i]||{};if(U[i][k])return this.bench();if(!payPecas(g.c)){toast('Peças insuficientes.');return this.bench();}
      U[i][k]=1;applyUpgrades();AU.craft();toast(`${WEAPONS[i].n}: ${g.n}.`);return this.bench();}
    return act(a,ds);};
  const inv=UI.inv.bind(UI); UI.inv=function(...a){if(G.ev)G.ev.invOpened=true;return inv(...a);};
  const sv=UI.save.bind(UI); UI.save=function(...a){if(G.ev)G.ev.saveOpened=true;return sv(...a);};
  const v=v16Tick; v16Tick=function(dt){v(dt);if(G.v13Run!==RUNID){G.v13Run=RUNID;G.tut=null;applyUpgrades();}if(G.mode==='play'){tutTick(dt);soniaTick(dt);}};
  const dp=drawPsy; drawPsy=function(){dp();drawTut();};
  const dw=v12DrawWorld; v12DrawWorld=function(){dw();for(const o of interacts){if(o.type!=='bancada'||!inV(o.x,o.y,30))continue;ctx.save();ctx.translate(o.x,o.y);ctx.fillStyle='rgba(0,0,0,.35)';ctx.fillRect(-12,-7,26,17);ctx.fillStyle='#6a4a2a';ctx.fillRect(-13,-9,26,16);ctx.fillStyle='#4a3218';ctx.fillRect(-13,-9,26,3);
    ctx.fillStyle='#8a9098';ctx.fillRect(-8,-5,9,3);ctx.fillRect(3,-2,6,6);ctx.fillStyle='#c8a050';ctx.fillRect(-6,2,4,2);ctx.restore();}};
  const be=STORY.ending; STORY.ending=function(){const r=be.call(STORY);if(G.flags.soniaMet)r.b+=' Do outro lado do rio, em Navegantes, a Sonia viu o helicóptero subir no meio da fumaça, e soube.';return r;};
  // drops de chefe trazem peças
  const ke=killEnemy; killEnemy=function(e,...r){const out=ke(e,...r);if(e&&e.t&&e.t.boss&&e.type!=='boss'){const [x,y]=freeTileNear((e.x/TILE)|0,(e.y/TILE)|0,true);pickups.push({uid:'pc'+(G.dropN++),tx:x,ty:y,x:tc(x),y:tc(y),id:'pecas',q:3,kind:'item'});pickOcc.add(idx(x,y));}return out;};
  // música roda em qualquer modo (inclusive no título)
  const fm=AU.mix.bind(AU); AU.mix=function(s,i){fm(s,i);try{AU.musicTick(musicMode());}catch(e){}};
})();

// ---------- marcação em tudo que dá pra usar ----------
function markTargets(){
  const F=G.flags, out=[], R2=300;
  const near=(x,y)=>{const d=hyp(x-P.x,y-P.y);return d<R2&&(d<110||los(P.x,P.y,x,y))?d:-1;};
  for(const o of interacts){
    if((o.type==='mochila'||o.type==='cooler')&&F['lt'+o.tx+'_'+o.ty])continue;
    if(o.type==='janela'&&o.broken)continue;
    const d=near(o.x,o.y); if(d<0)continue;
    const k=o.type==='hide'?'hide':(o.type==='typewriter'||o.type==='box'||o.type==='bancada')?'safe':(o.type==='mochila'||o.type==='cooler')?'loot':'use';
    out.push({x:o.x,y:o.y,k,d});}
  for(const g of gates){if(g.open||g.hidden)continue;const x=(g.x+g.w/2)*TILE,y=(g.y+g.h/2)*TILE,d=near(x,y);if(d>=0)out.push({x,y,k:'gate',d});}
  for(const n of npcs){if(n.cond&&!n.cond())continue;const d=near(n.x,n.y);if(d>=0)out.push({x:n.x,y:n.y-14,k:'npc',d});}
  for(const p of pickups){const d=near(p.x,p.y);if(d>=0&&d<220)out.push({x:p.x,y:p.y,k:'item',d});}
  return out;
}
const MKC={use:'#d49a3c',gate:'#c87a5a',hide:'#7ab8e8',safe:'#4ad06a',loot:'#c8b070',npc:'#e8d84a',item:'#ddd6c6'};
function drawMarks(){
  if(G.mode!=='play'||CUT.on||P.inCar||P.hidden)return;
  const z=view.z, pr=G.prompt&&G.prompt.o;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  for(const m of markTargets()){
    if(pr&&hyp(pr.x-m.x,pr.y-m.y)<4)continue;            // o que já está com o botão de usar não precisa
    const sx=(m.x-cam.x)*z, sy=(m.y-cam.y)*z-16*z, a=clamp(1-(m.d-60)/240,.25,.95)*(.75+.25*Math.sin(renderT*3+m.x*.01));
    if(sx<-20||sy<-20||sx>view.w+20||sy>view.h+20)continue;
    const r=m.k==='item'?3:4.5; ctx.globalAlpha=a; ctx.fillStyle=MKC[m.k]; ctx.strokeStyle='rgba(0,0,0,.7)'; ctx.lineWidth=1.5;
    ctx.beginPath();
    if(m.k==='npc'){ctx.arc(sx,sy,r,0,6.283);}
    else if(m.k==='item'){ctx.arc(sx,sy+10*z,r,0,6.283);}
    else{ctx.moveTo(sx,sy-r-1);ctx.lineTo(sx+r+1,sy);ctx.lineTo(sx,sy+r+1);ctx.lineTo(sx-r-1,sy);ctx.closePath();}
    ctx.fill();ctx.stroke();
  }
  ctx.globalAlpha=1;
}
(function(){const dp=drawPsy;drawPsy=function(){drawMarks();dp();};})();

// =============== Perseguidor: depois da Helena, alguém se arrasta pela rua... ===============
(function(){
  STORY.onBrava=function(){const F=G.flags;if(F.persHint)return;F.persHint=true;
    later(9000,()=>bark(F.eduFollow?'edu':'rafa','s',F.eduFollow?'Richard... tô com a sensação de que tem alguém olhando a gente do mato.':'Tem alguma coisa no mato... me olhando. Eu sinto.',{dur:2.4}));};
  const up=updPers; updPers=function(dt){if(!G.flags.persCine)return;return up(dt);};
  STORY.introPers=function(p){if(G.flags.persCine){AU.roar();return;}G.flags.persSeen=true;};
})();
function persCineTick(){
  const F=G.flags; if(F.persCine||!F.metHelena||CUT.on||P.inCar)return;
  const cb=clinicB(); if(G.inB===cb||cb<0){G.ev.pcIn=1;return;} if(!G.ev.pcIn&&!F.persCineArm)return;
  F.persCineArm=1; const b=buildings[cb]; if(hyp(P.x-(b.x+b.w/2)*TILE,P.y-(b.y+b.h/2)*TILE)>520)return;
  STORY.persCine();
}
STORY.persCine=function(){
  const F=G.flags; if(F.persCine)return; F.persCine=true; F.persSeen=true; F.persMet=true;
  // a vítima: vem se arrastando da rua
  const away=(ang,d)=>{const [x,y]=freeTileNear(((P.x+Math.cos(ang)*d)/TILE)|0,((P.y+Math.sin(ang)*d)/TILE)|0,true);return {x:tc(x),y:tc(y)};};
  const a0=P.ang, vp=away(a0,170);
  const vic={x:vp.x,y:vp.y,r:11,hp:999,alive:true,st:'cutcrawl',prone:true,col:'#7a5a3a',hair:'#3a2418',skin:'#c89a7a',ang:Math.atan2(P.y-vp.y,P.x-vp.x),walk:0,moving:false,t:0,say:null,help:[]};
  peds.push(vic);
  // ele: sai do mato, do lado da vítima
  let bush=null; for(let i=0;i<40&&!bush;i++){const a=a0+rr(-1.2,1.2),d=rr(260,340),x=P.x+Math.cos(a)*d,y=P.y+Math.sin(a)*d,tx=(x/TILE)|0,ty=(y/TILE)|0;if(!inb(tx,ty))continue;const t=map[idx(tx,ty)];if((t===T.GRASS||t===T.FOREST||t===T.DIRT)&&!SOLID[t]&&bmap[idx(tx,ty)]<0)bush={x:tc(tx),y:tc(ty)};}
  if(!bush)bush=away(a0+.6,300);
  const p=makeEnemy('pers',bush.x,bush.y,null); p.cut=true; p.state='idle'; p.face=Math.atan2(vic.y-p.y,vic.x-p.x); enemies.push(p);
  const leaves=()=>{for(let i=0;i<22;i++)parts.push({k:'debris',x:bush.x+rr(-14,14),y:bush.y+rr(-14,14),vx:rr(-90,90),vy:rr(-90,90),life:.6,max:.6,s:rr(2,3.5),c:Math.random()<.5?'#2a4a22':'#3a5a2a'});AU.nz(.5,1400,1,.12,'bandpass');};
  const mid=(o)=>({x:(P.x+o.x)/2,y:(P.y+o.y)/2});
  playCut([{npc:vic,id:'vic'},{cam:mid(vic),t:.7},
    {do:()=>{psyFloat(vic.x,vic.y,'"Moço... moço, me ajuda... eu não sinto as pernas..."',{life:3,c:'#f0d0c0',edge:false});AU.cry('meajuda',vic.x,vic.y,1);}},
    {walk:'vic',to:{x:vic.x+(P.x-vic.x)*.35,y:vic.y+(P.y-vic.y)*.35},spd:16,wait:false},{wait:2.2},
    {do:()=>{psyFloat(vic.x,vic.y,'"Ele vem atrás de quem tá sozinho... ele não para... ele NÃO PARA..."',{life:3.2,c:'#f0d0c0',edge:false});}},{wait:2.4},
    {cam:{x:(P.x+vic.x+bush.x)/3,y:(P.y+vic.y+bush.y)/3},t:.8},{do:leaves},{wait:.5},{do:leaves},{sfx:'thud',v:.6},
    {say:'rafa',m:'s',think:true,t:'O mato... tá se mexendo.',dur:1.4},
    {do:()=>{CUT.actors.pers=p;p.cut=true;}},{fx:'zoom',v:1.3},
    {say:'rafa',m:'s',t:'Um homem... de sobretudo. Ele tá andando direto pra ela.'},
    {walk:'pers',to:'vic',ox:0,oy:0,spd:48,tmax:6},
    {do:()=>{psyFloat(vic.x,vic.y,'"NÃO! NÃO, NÃO, NÃ—"',{life:1.3,c:'#ff8a7a',edge:false});AU.cry('naonao',vic.x,vic.y,1.2);}},{wait:.3},
    {fx:'slow',v:.7},{sfx:'thud',v:1},{fx:'shake',v:16},
    {do:()=>{bloodBurst(vic.x,vic.y,52,p.face);addDecal({k:'blood',x:vic.x,y:vic.y,r:38,rot:0,seed:.6});addDecal({k:'corpse',x:vic.x,y:vic.y,rot:vic.ang,type:'zumbi',col:vic.col,skin:vic.skin,r:11});
      for(let i=0;i<3;i++)addDecal({k:'gib',x:vic.x+rr(-18,18),y:vic.y+rr(-18,18),r:rr(3,5),rot:0,c:'#8a2a20'});const i=peds.indexOf(vic);if(i>=0)peds.splice(i,1);AU.splat();AU.thud(1);buzz([160,40,200]);G.fear=1;G.shockT=Math.max(G.shockT||0,25);}},
    {wait:1.2},{fx:'zoom',v:1.15},
    {say:'rafa',m:'s',t:'Ele pisou nela. Ele nem parou de andar. Ele nem olhou pra baixo.'},
    ...(F.eduFollow?[{say:'edu',m:'s',t:'Richard... ele tá olhando pra gente agora. Ele tá olhando PRA GENTE.'}]:[]),
    {face:'pers',at:'rafa'},{sfx:'roar',v:.8},{fx:'shake',v:6},
    {say:'rafa',m:'a',think:true,t:'Não dá pra lutar com isso. Corre. CORRE.',dur:1.6},
    {camFree:1}],()=>{p.cut=false;p.state='chase';p.hunt=true;p.lx=P.x;p.ly=P.y;F.persOn=true;G.persT=0;G.banner={t:'O Perseguidor',life:3.2};});
};
(function(){const v=v16Tick;v16Tick=function(dt){v(dt);if(G.mode==='play')persCineTick();};})();
