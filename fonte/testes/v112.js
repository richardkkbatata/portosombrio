module.exports=(A,R,ok,step,finishTalk,vm,ctx)=>{
  const G=A.G, flush=()=>{for(let k=0;k<6;k++){const q=ctx.__timeouts.splice(0);for(const f of q)try{f();}catch(e){console.log('timeout',e.message);}finishTalk();}};
  const run=(n,draw)=>{for(let i=0;i<n;i++){A.update(1/60);if(draw&&i%10===0){A.renderWorld();A.drawHUD();}}};
  const at=pt=>{R(`P.x=${pt.x};P.y=${pt.y};snapCamera();flowTile=-1;`);};
  const take=uid=>{const p=A.getPickups().find(p=>p.uid===uid);if(!p)return false;A.takePickup(p);R(`pickups=pickups.filter(p=>p.uid!=='${uid}');`);finishTalk();flush();return true;};
  const gate=id=>A.getGates().find(g=>g.id===id);
  A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;
  R("dbgJump('cbBase')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
  ok(R("NAV_D.short")==='Camboriú','1.12: distrito Camboriú');
  ok(R("reach[idx((CBL.mirante.x/32)|0,(CBL.mirante.y/32)|0)]&&reach[idx((CBL.portal.x/32)|0,(CBL.portal.y/32)|0)]&&reach[idx((CBL.fogueira.x/32)|0,(CBL.fogueira.y/32)|0)]&&reach[idx((CBL.seloVela.x/32)|0,(CBL.seloVela.y/32)|0)]&&reach[idx((CBL.sino.x/32)|0,(CBL.sino.y/32)|0)]"),'1.12: lugares do capítulo alcançáveis');
  for(const u of ['cbChaveSacP','cbChaveTorreP','cbSeloVelaP','cbDocAcou','cbDocPreg','cbDocT03'])ok(R(`(()=>{const p=pickups.find(p=>p.uid==='${u}');return !!p&&!!reach[idx(p.tx,p.ty)];})()`),'1.12: item alcançável '+u);
  // a chamada dispara sozinha depois da Universidade e do flashback
  R("G.ev.cbT=0;enemies=enemies.filter(e=>hyp(e.x-P.x,e.y-P.y)>900)");run(60*16);finishTalk();
  ok(G.flags.cbCall,'1.12: chamada do Nicolas depois da Universidade');
  ok(!(R('G.comps')||[]).length,'1.12: Edu e Matheus ficam (Richard vai sozinho)');
  let o=A.objective();ok(/Camboriú/.test(o.t),'1.12: objetivo leva a Camboriú: '+o.t);
  R("cbTravel(true)");finishTalk();flush();ok(R('inCb()'),'1.12: chegou em Camboriú');
  o=A.objective();ok(/centro/i.test(o.t),'1.12: objetivo do centro');
  run(120,true);
  ok(!A.enemies.some(e=>e.alive&&e.y>=R('CBY')*32&&['zumbi','corr','cao','pers'].includes(e.type)),'1.12: sem zumbi em Camboriú');
  at({x:R('CBL.coreto.x')+400,y:R('CBL.coreto.y')+180});run(30);finishTalk();flush();
  ok(G.flags.cbProc&&G.flags.cbSt>=2,'1.12: procissão e chamada pro morro');
  o=A.objective();ok(/morro|Nicolas/.test(o.t),'1.12: objetivo do morro');
  R("STORY.cbNicoTalk(npcs.find(n=>n.id==='cbNico'))");finishTalk();
  ok(R('!!G.scope'),'1.12: missão da luneta começa');
  run(60);A.renderWorld();A.drawHUD();R('drawPsy()');
  ok(R('G.camF')<.75,'1.12: câmera abre na luneta');
  R("(()=>{const S=G.scope;S.t=5;for(const v of S.tg.slice()){if(!v.alive)continue;S.hold=true;S.t=Math.PI*2*10;S.x=v.x-cbScopeSway(S)[0];S.y=v.y-cbScopeSway(S)[1];cbScopeFire(S);}})()");
  run(30);flush();finishTalk();flush();
  ok(!R('G.scope'),'1.12: luneta termina');
  ok(G.flags.cbSt>=3&&G.flags.nicoMet&&A.invCount('rojao')>0,'1.12: Nicolas encontrado, rojões');
  ok(!A.enemies.some(e=>e.alive&&['cbv1','cbv2','cbv3'].includes(e.uid)),'1.12: o Nicolas derrubou os vigias');
  o=A.objective();ok(/Matriz/.test(o.t),'1.12: objetivo Matriz '+o.t);
  R("useGate(gates.find(g=>g.id==='cbPortal'))");o=A.objective();ok(/vestiário/.test(o.t),'1.12: seta pro vestiário '+o.t);
  ok(take('cbChaveSacP'),'1.12: chave da sacristia');R("useGate(gates.find(g=>g.id==='cbParoq'))");ok(gate('cbParoq').open,'1.12: casa paroquial abre');
  ok(take('cbChaveTorreP'),'1.12: chave da torre');R("useGate(gates.find(g=>g.id==='cbTorre'))");ok(gate('cbTorre').open,'1.12: torre abre');
  R("cbRingBell()");for(let i=0;i<40&&R('CUT.on');i++){if(R('!!CUT.choice'))R('cutChoose(0)');else R('cutSkip()');}flush();
  ok(A.invCount('cbSeloSino')>0&&G.flags.cbNoite,'1.12: selo do sino e noite do ritual');
  o=A.objective();ok(/Vela/.test(o.t),'1.12: objetivo vela '+o.t);
  R("UI.code='';LOCKS.cbPorao.open()");ok(gate('cbPorao').open,'1.12: porão abre com 2317');
  ok(R("LOCKS.cbPorao.code")==='2317'&&/23 17/.test(R("DOCS[DOC112+1].b")),'1.12: senha no caderno do açougueiro');
  ok(take('cbSeloVelaP'),'1.12: selo da vela');flush();
  ok(G.flags.cbIrmaoQuest,'1.12: missão do irmão');o=A.objective();ok(/estádio/.test(o.t),'1.12: objetivo estádio '+o.t);
  at({x:R('CBL.fogueira.x'),y:R('CBL.fogueira.y')-200});run(40,true);finishTalk();
  const ir=A.enemies.find(e=>e.alive&&e.irmao);ok(ir,'1.12: o irmão (Marcado) aparece');
  if(ir){R("(()=>{const e=enemies.find(e=>e.alive&&e.irmao);hurtEnemy(e,9999,0,0,{});})()");flush();}
  ok(G.flags.cbIrmao&&take('cbSeloCervoP'),'1.12: selo do cervo');
  // salvar e carregar no meio do capítulo
  const sv=JSON.parse(JSON.stringify(R('serialize()')));R(`loadState(${JSON.stringify(sv)})`);G.mode='play';
  ok(G.flags.cbNoite&&A.invCount('cbSeloCervo')>0&&gate('cbTorre').open&&R("CB_LIGHTS.every(l=>l.off)"),'1.12: salvar/carregar mantém o capítulo');
  ok(!(R('G.comps')||[]).length,'1.12: depois de carregar continua sozinho');
  R("useGate(gates.find(g=>g.id==='cbPortal'))");ok(gate('cbPortal').open&&G.flags.cbPortal,'1.12: portal abre com os 3 selos');
  at(A.getLM?R('CBL.nave'):R('CBL.nave'));run(10);finishTalk();flush();run(5);
  const boss=A.enemies.find(e=>e.alive&&e.type==='chifrudo');ok(boss&&G.flags.cbBossOn,'1.12: luta do Cervo começa');
  ok(!gate('cbPortal').open,'1.12: a porta fecha na luta');
  R("DBG.god=true");run(60*8,true);R("DBG.god=false");ok(R("musicMode()")==='boss','1.12: música de chefe');
  if(boss)R("(()=>{const e=enemies.find(e=>e.alive&&e.type==='chifrudo');e.hp=e.max*.5;})()");run(30);
  ok(A.enemies.filter(e=>e.alive&&e.type==='marc'&&e.cb).length>=2,'1.12: fase 2 chama Marcados');
  R("(()=>{const e=enemies.find(e=>e.alive&&e.type==='chifrudo');if(e)hurtEnemy(e,99999,0,0,{});})()");flush();finishTalk();flush();
  ok(G.flags.cbBoss&&gate('cbPortal').open,'1.12: Cervo derrotado, porta abre');
  ok(A.getPickups().some(p=>p.uid==='cbSnipeR'),'1.12: rifle do irmão na porta');
  ok(take('cbSnipeR')&&A.P.owned[R("WI('sniper')")],'1.12: pegou o rifle');
  R("cbTravel(false)");finishTalk();flush();
  ok(G.flags.cbDone&&!R('inCb()')&&R('inZone()'),'1.12: volta pra BR');
  ok((R('G.comps')||[]).length>=1,'1.12: Edu/Matheus voltam');
  o=A.objective();ok(!/Camboriú/.test(o.t),'1.12: história segue: '+o.t);
  // o shopping não abre antes de Camboriú
  A.newGame('normal');G.mode='play';R("dbgJump('cbBase')");finishTalk();R("G.flags.cbCall=true");R("STORY.shopEvent()");ok(!G.flags.shopEv,'1.12: shopping espera Camboriú');
  // eventos de terror rodam sem erro
  R("dbgJump('cbBase')");finishTalk();R("G.flags.cbCall=true;G.flags.cbSt=3;cbGo(CBL.coreto)");
  for(const f of ['cbVulto(false)','cbRitual()','cbProcissao()'])R(f);for(let i=0;i<CB_EVTLEN();i++);
  R("for(const e of CB_EVT)try{e.f()}catch(x){throw x}");run(60*10,true);flush();ok(true,'');
};
function CB_EVTLEN(){return 0;}
