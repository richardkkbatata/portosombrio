module.exports=(A,R,ok,step,finishTalk,vm,ctx)=>{
  const G=A.G, flush=()=>{for(let k=0;k<6;k++){const q=ctx.__timeouts.splice(0);for(const f of q)try{f();}catch(e){console.log('timeout',e.message);}finishTalk();}};
  const run=(n,draw)=>{for(let i=0;i<n;i++){if(R('CUT.on'))finishTalk();A.update(1/60);if(draw&&i%10===0){A.renderWorld();A.drawHUD();}}};
  const at=pt=>{R(`P.x=${pt.x};P.y=${pt.y};snapCamera();flowTile=-1;`);};
  const take=uid=>{const p=A.getPickups().find(p=>p.uid===uid);if(!p)return false;A.takePickup(p);R(`pickups=pickups.filter(p=>p.uid!=='${uid}');`);finishTalk();flush();return true;};
  const gate=id=>A.getGates().find(g=>g.id===id);
  const reachPt=s=>R(`(()=>{const p=${s};return !!p&&!!reach[idx((p.x/32)|0,(p.y/32)|0)];})()`);
  A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;
  R("dbgJump('cbBase')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
  // o mapa novo
  for(const k of ['tg','val','frig','maleta','frigS','carnSpawn','cemit','cova','gel'])ok(reachPt('CBL.'+k),'1.14: lugar alcançável '+k);
  for(const u of ['cbMaletaP','cbDocTG','cbDocGel','cbDocLap','cbDocFrig'])ok(R(`(()=>{const p=pickups.find(p=>p.uid==='${u}');return !!p&&!!reach[idx(p.tx,p.ty)];})()`),'1.14: item alcançável '+u);
  ok(R("buildings[CBL.frB].name")==='Frigorífico Camboriú'&&R("buildings[CBL.tgB].name")==='Tiro de Guerra','1.14: prédios novos');
  ok(['cbFrA','cbFrB','cbFrE'].every(id=>gate(id)&&gate(id).open),'1.14: portas do frigorífico abertas no começo');
  // até o Nicolas
  R("UI.dbgAct('cb:nico',{})");finishTalk();flush();R("STORY.cbNicoTalk(npcs.find(n=>n.id==='cbNico'))");finishTalk();
  if(R('!!G.scope'))R("cbScopeEnd('sai')");run(80);flush();finishTalk();flush();
  ok(G.flags.cbSt>=3,'1.14: Nicolas encontrado');
  // a ligação do soldado
  for(let k=0;k<22&&!G.flags.cbMilCall;k++){R("enemies=enemies.filter(e=>hyp(e.x-P.x,e.y-P.y)>700||!e.alive);if(G.scope)cbScopeEnd('sai')");run(60);finishTalk();flush();}
  ok(G.flags.cbMilCall,'1.14: Nicolas avisa do soldado');
  let o=A.objective();ok(/Tiro de Guerra/.test(o.t),'1.14: objetivo Tiro de Guerra: '+o.t);
  // furtividade: matar por trás, corpo, manto
  R("enemies=enemies.filter(e=>!(e.alive&&['cult','vig','marc'].includes(e.type)&&hyp(e.x-P.x,e.y-P.y)<900))");
  R("(()=>{const a=0;const e=makeEnemy('cult',P.x+30,P.y,null);e.cb=1;e.face=0;e.state='wander';e.cbHold=99;e.tst=1;enemies.push(e);})()");
  let pr=R("findInteract()");ok(pr&&pr.o&&pr.o.type==='cbExec','1.14: prompt de matar em silêncio');
  R("(()=>{const pr=findInteract();G.prompt=pr;doInteract();})()");flush();
  ok(!A.enemies.some(e=>e.alive&&e.tst),'1.14: matou em silêncio');
  ok(R("CB2.bodies.length")>=1,'1.14: corpo no chão');
  R("(()=>{const b=CB2.bodies[CB2.bodies.length-1];P.x=b.x-20;P.y=b.y;G.prompt=findInteract();})()");
  ok(R("promptText(G.prompt)")==='Vestir o manto do cultista','1.14: prompt vestir manto: '+R("promptText(G.prompt)"));
  R("doInteract()");finishTalk();flush();ok(R('P.disf')===true&&R("P.lookO.look")==='manto','1.14: disfarçado');
  // disfarçado, o cultista não te persegue
  R("(()=>{const e=makeEnemy('cult',P.x+90,P.y,null);e.cb=1;e.face=Math.PI;e.state='wander';e.tst2=1;enemies.push(e);P.lamp=false;})()");
  run(60);ok(R("enemies.find(e=>e.tst2).state")!=='chase'&&R('P.disf'),'1.14: disfarce engana o cultista');
  R("(()=>{const e=enemies.find(e=>e.tst2);e.x=P.x+90;e.y=P.y;e.state='wander';P.disf=true;})();P.running=true;P.moving=true;cb2DisfTick(.016)");ok(!R('P.disf'),'1.14: correr derruba o disfarce');R("P.running=false;P.moving=false");
  ok(R("enemies.find(e=>e.tst2).state")==='chase','1.14: depois do disfarce cair, ele persegue');
  R("for(const e of enemies)if(e.tst2)e.alive=false");
  // arrastar e achar o corpo
  R("(()=>{const b=CB2.bodies[CB2.bodies.length-1];P.x=b.x-20;P.y=b.y;G.prompt=findInteract();})()");ok(R("promptText(G.prompt)")==='Arrastar o corpo','1.14: arrastar');
  R("doInteract()");ok(R("!!CB2.drag"),'1.14: arrastando');
  const x0=R('P.x');for(let i=0;i<30;i++){R("P.x+=2");run(1);}ok(R("hyp(CB2.drag.x-P.x,CB2.drag.y-P.y)")<40,'1.14: corpo vem junto');
  R("(()=>{G.prompt={k:'int',o:CB2.drag.it};doInteract();})()");ok(!R("CB2.drag"),'1.14: soltou o corpo');
  R("(()=>{const b=CB2.bodies[CB2.bodies.length-1];b.found=false;b.x=P.x+60;b.y=P.y;const e=makeEnemy('cult',P.x+160,P.y,null);e.cb=1;e.face=Math.PI;e.state='wander';e.tst3=1;enemies.push(e);})()");
  R("CB2.bt=0;cb2BodyTick(.016)");ok(R("CB2.bodies[CB2.bodies.length-1].found")||R("cb2BodyHidden(CB2.bodies[CB2.bodies.length-1])"),'1.14: acharam o corpo');
  R("for(const e of enemies)if(e.tst3)e.alive=false");flush();
  // o Valença
  at(R('({x:CBL.tg.x,y:CBL.tg.y+20})'));run(10);finishTalk();flush();ok(G.flags.cbTGseen,'1.14: cena da chegada no Tiro de Guerra');
  R("STORY.cbValTalk(npcs.find(n=>n.id==='cbVal'))");finishTalk();flush();
  ok(G.flags.cbMilMet&&G.flags.cbMilAsk&&!G.flags.cbMilOk,'1.14: Valença pede a maleta');
  o=A.objective();ok(/maleta/.test(o.t),'1.14: objetivo maleta: '+o.t);
  // o frigorífico: entrar, pegar a maleta, fugir
  at(R('CBL.frHall'));R("G.inB=CBL.frB");run(5);finishTalk();flush();ok(G.flags.cbFrigSeen,'1.14: cena da entrada do frigorífico');
  at(R('({x:CBL.maleta.x-30,y:CBL.maleta.y})'));ok(take('cbMaletaP'),'1.14: pegou a maleta');flush();finishTalk();flush();
  ok(R("!!CB2.frig")&&A.enemies.some(e=>e.alive&&e.type==='carniceiro'),'1.14: a coisa aparece e a fuga começa');
  o=A.objective();ok(/CORRA/.test(o.t),'1.14: objetivo da fuga');
  const hp0=R('P.hp');R("(()=>{const e=enemies.find(e=>e.type==='carniceiro');hurtEnemy(e,999,0,0,{});})()");ok(A.enemies.some(e=>e.alive&&e.type==='carniceiro'),'1.14: não dá pra matar a coisa');
  // ela persegue
  const cd0=R("(()=>{const e=enemies.find(e=>e.alive&&e.type==='carniceiro');return hyp(e.x-P.x,e.y-P.y);})()");R("DBG.god=true");run(90);
  const cd1=R("(()=>{const e=enemies.find(e=>e.alive&&e.type==='carniceiro');return hyp(e.x-P.x,e.y-P.y);})()");ok(cd1<cd0,'1.14: a coisa vem atrás ('+(cd0|0)+' -> '+(cd1|0)+')');
  // fugir pela câmara fria e pela doca, batendo as portas
  for(const p of ['({x:tc(130),y:tc(cbY(73.5))})','({x:tc(126.6),y:tc(cbY(73.5))})','({x:tc(124),y:tc(cbY(73.5))})','({x:tc(122.5),y:tc(cbY(75.5))})','({x:tc(122.5),y:tc(cbY(77))})','({x:tc(122.5),y:tc(cbY(78.6))})','({x:tc(118),y:tc(cbY(79.5))})','({x:tc(114),y:tc(cbY(79.5))})']){at(R(p));run(12);}
  ok(gate('cbFrA').slam||gate('cbFrB').slam||G.flags.cbFrigDone||R("CB2.frig&&CB2.frig.end"),'1.14: bateu a porta');
  run(30);finishTalk();flush();R("DBG.god=false");
  ok(G.flags.cbFrigDone&&!A.enemies.some(e=>e.alive&&e.type==='carniceiro'),'1.14: fugiu e ela sumiu');
  ok(!gate('cbFrE').open&&!gate('cbFrB').open,'1.14: frigorífico trancado pra sempre');
  ok(A.invCount('cbMaleta')>0,'1.14: com a maleta');
  // entregar
  R("STORY.cbValTalk(npcs.find(n=>n.id==='cbVal'))");finishTalk();flush();
  ok(G.flags.cbMilOk&&A.invCount('cbMaleta')===0&&A.invCount('gran')>=2,'1.14: Valença salvo, deu granadas');
  // salvar e carregar: o frigorífico continua fechado
  {const sv=JSON.parse(JSON.stringify(R('serialize()')));R(`loadState(${JSON.stringify(sv)})`);G.mode='play';
    ok(!gate('cbFrE').open&&G.flags.cbMilOk,'1.14: carregar mantém frigorífico fechado e Valença salvo');}
  // a missa
  R("G.flags.cbNoite=true;cbApplyNight();G.ev.cbNoiteT=999;enemies=enemies.filter(e=>!(e.alive&&e.state==='chase'))");
  const vivos0=A.enemies.filter(e=>e.alive&&['cult','vig'].includes(e.type)).length;
  R("cbGo(CBL.coreto)");run(5);finishTalk();flush();
  ok(G.flags.cbMissaOn,'1.14: a missa começa');
  run(60*18);
  const vivos1=A.enemies.filter(e=>e.alive&&['cult','vig'].includes(e.type)).length;
  ok(vivos1<vivos0,'1.14: a cidade esvazia na missa ('+vivos0+' -> '+vivos1+')');
  o=A.objective();ok(/missa/.test(o.t),'1.14: objetivo da missa');
  R("if(CB2.missa)CB2.missa.t=92.5");run(30);flush();
  ok(G.flags.cbMissaDone&&!G.flags.cbMissaOn,'1.14: a missa acaba');
  // o Pregador aparece no caminho
  R("G.flags.cbPA_a4=false;cbGo({x:CBL.cemit.x-tc(4),y:CBL.cemit.y})");R("CB2.pt=0");run(3);finishTalk();
  ok(G.flags.cbPA_a4,'1.14: Pregador no cemitério');run(60*11);flush();ok(!R("CB2.preg"),'1.14: Pregador some');
  // a luta: forma 1, transformação, forma 2
  R("for(const id of ['cbSeloSino','cbSeloVela','cbSeloCervo'])if(!cbHas(id)){const l=invAdd(id,1);if(l)boxAdd(id,l);}G.flags.cbIrmaoQuest=G.flags.cbIrmao=true");
  R("useGate(gates.find(g=>g.id==='cbPortal'))");at(R('CBL.nave'));run(10);finishTalk();flush();run(5);
  ok(A.enemies.some(e=>e.alive&&e.type==='chifrudo'),'1.14: forma 1');
  R("(()=>{const e=enemies.find(e=>e.alive&&e.type==='chifrudo');hurtEnemy(e,e.hp+50,0,0,{});})()");flush();finishTalk();flush();
  const c2=A.enemies.find(e=>e.alive&&e.type==='cervo2');
  ok(c2&&G.flags.cbF2,'1.14: forma 2 na cidade');
  ok(R("map[idx(84,cbY(21))]")!==R("T.WALL"),'1.14: a fachada da Matriz caiu');
  ok(R("!!CB2.val"),'1.14: o Valença entra na luta');
  o=A.objective();ok(/desperto/.test(o.t),'1.14: objetivo da forma 2');
  R("DBG.god=true");run(60*6,true);
  ok(R("musicMode()")==='boss','1.14: música de chefe na forma 2');
  // ele bate na parede: o Nicolas acerta
  R("(()=>{const e=enemies.find(e=>e.alive&&e.type==='cervo2');e.x=tc(70);e.y=tc(cbY(19.5));e.mode='charge';e.cdx=0;e.cdy=-1;e.mt=1;P.x=tc(70);P.y=tc(cbY(23));})()");
  const hpA=R("enemies.find(e=>e.alive&&e.type==='cervo2').hp");run(40);flush();run(5);
  ok(R("CB2.stun")>=1,'1.14: investida na parede atordoa');
  ok(R("enemies.find(e=>e.alive&&e.type==='cervo2').hp")<hpA,'1.14: Nicolas acerta o atordoado');
  // os aliados não terminam a luta sozinhos
  R("(()=>{const e=enemies.find(e=>e.alive&&e.type==='cervo2');for(let i=0;i<200;i++)hurtEnemy(e,500,0,0,{ally:true});})()");
  ok(A.enemies.some(e=>e.alive&&e.type==='cervo2'),'1.14: aliados não matam o Cervo sozinhos');
  // salvar e carregar no meio da luta
  {const sv=JSON.parse(JSON.stringify(R('serialize()')));R(`loadState(${JSON.stringify(sv)})`);G.mode='play';run(30);
    ok(A.enemies.some(e=>e.alive&&e.type==='cervo2')&&G.flags.cbBossOn,'1.14: carregar no meio da luta volta o Cervo desperto');}
  R("(()=>{const e=enemies.find(e=>e.alive&&e.type==='cervo2');hurtEnemy(e,99999,0,0,{});})()");flush();finishTalk();flush();
  R("DBG.god=false");
  ok(G.flags.cbBoss&&G.flags.cbF2Done&&G.flags.cbPregDead,'1.14: final do capítulo');
  ok(A.getPickups().some(p=>p.uid==='cbSnipeA'),'1.14: munição do rifle na porta');
  run(120);ok(!A.enemies.some(e=>e.alive&&e.type==='cervo2'),'1.14: o Cervo desperto não volta depois de morto');
  ok(!R("(STORY.__barks||[]).some(t=>/Gordo/.test(t))"),'1.14: sem fala errada do Gordo');
  R("cbTravel(false)");finishTalk();flush();ok(G.flags.cbDone,'1.14: capítulo termina');
  // a volta (drone) perto do fim
  R("G.flags.hospOut=true;G.ev.cbVoltaT=99;enemies=enemies.filter(e=>!(e.alive&&e.state==='chase'))");run(10);
  ok(G.flags.cbVoltaCena,'1.14: cena da volta a Camboriú');finishTalk();flush();run(5);
  ok(G.flags.cbVoltaZ&&!R("CB2.volta"),'1.14: cena da volta termina');
  // intensidade do terror
  R("OPT.terror='menos'");const n0=R("SND.amb.next");run(60);const n1=R("SND.amb.next");R("OPT.terror='normal'");ok(n1>=n0-1.1,'1.14: menos sustos atrasa os sustos');
  // menu de teste
  for(const k of ['cb2:mil','cb2:disf','cb2:exec','cb2:preg','cb2:cemit','cb2:som']){try{R(`UI.dbgAct('${k}',{})`);finishTalk();run(20);flush();finishTalk();ok(true,'');}catch(e){ok(false,'1.14: debug '+k+' '+e.message);}}
};
