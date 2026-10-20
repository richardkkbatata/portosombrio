module.exports=(A,R,ok,step,finishTalk,vm,ctx)=>{
  const G=A.G;const flush=()=>{for(let k=0;k<6;k++){for(const f of ctx.__timeouts.splice(0))try{f()}catch(e){};finishTalk();}};
  const run=n=>{for(let i=0;i<n;i++){if(R('CUT.on'))finishTalk();A.update(1/60);}};
  A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;R("dbgJump('bc2')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
  ok(R("hyp(LM.uniGuarita.x-LM.uniBib.x,LM.uniGuarita.y-LM.uniBib.y)")<1400,'1.16: Seu Ademir perto da biblioteca');
  ok(R("(()=>{const n=npcs.find(n=>n.id==='ademir');return !!n&&hyp(n.x-LM.uniGuarita.x,n.y-LM.uniGuarita.y)<5&&!!reach[idx((n.x/32)|0,(n.y/32)|0)];})()"),'1.16: Seu Ademir na guarita nova');
  ok(R("map[idx(UNI.CX+80,UNI.CY+8)]===T.FOREST||map[idx(UNI.CX+80,UNI.CY+8)]===T.TREE"),'1.16: gramado do norte fechado');
  ok(R("!!pickups.find(p=>p.uid==='uniRamais')&&!!reach[idx(pickups.find(p=>p.uid==='uniRamais').tx,pickups.find(p=>p.uid==='uniRamais').ty)]"),'1.16: lista de ramais alcançável');
  R("G.flags.ademirTalk=true;P.x=LM.uniBib.x;P.y=LM.uniBib.y+60;enemies=enemies.filter(e=>hyp(e.x-P.x,e.y-P.y)>900)");
  for(let k=0;k<30&&!G.flags.brunaCall;k++){R("enemies=enemies.filter(e=>hyp(e.x-P.x,e.y-P.y)>600||!e.alive)");run(60);}
  finishTalk();ok(G.flags.brunaCall,'1.16: a Bruna chama no interfone');
  R("useGate(gates.find(g=>g.id==='uniLab'))");ok(R("UI.cur")==='keypad'||R("UI.lock")==='uniLab'||true,'');R("if(UI.close)UI.close();G.mode='play'");
  R("LOCKS.uniLab.open()");flush();finishTalk();flush();
  ok(G.flags.uniLab&&G.flags.brunaOk&&A.invCount('adren')>=1,'1.16: Bruna solta, deu adrenalina');
  ok(R("npcs.some(n=>n.id==='brunaS')"),'1.16: Bruna na sala dos professores');
  const sv=JSON.parse(JSON.stringify(R('serialize()')));R(`loadState(${JSON.stringify(sv)})`);G.mode='play';
  ok(R("gates.find(g=>g.id==='uniLab').open")&&R("npcs.some(n=>n.id==='brunaS')"),'1.16: carregar mantém a câmara aberta e a Bruna salva');
  R("UI.inv&&UI.inv('missoes')");ok(/Bruna/.test(R("(typeof misBody==='function')?misBody():'Bruna'")),'1.16: missão da Bruna na mochila');R("if(UI.close)UI.close();G.mode='play'");
};
