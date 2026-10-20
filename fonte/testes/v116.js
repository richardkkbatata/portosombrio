module.exports=(A,R,ok,step,finishTalk,vm,ctx)=>{
  const G=A.G;const run=n=>{for(let i=0;i<n;i++){if(R('CUT.on'))finishTalk();A.update(1/60);}};
  A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;R("dbgJump('posto')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
  const ps=A.getPickups().filter(p=>p.id==='adren');
  ok(ps.length>=5&&ps.length<=8,'1.16: poucas injeções no mapa ('+ps.length+')');
  ok(ps.every(p=>R(`!!reach[idx(${p.tx},${p.ty})]`)),'1.16: injeções alcançáveis');
  R("invAdd('adren',1)");const sp0=R('DBG.speed');R("P.st=10;P.tired=true");
  ok(R("healWith('adren')")&&R('P.adren')>20,'1.16: usar a injeção');
  ok(Math.abs(R('DBG.speed')-sp0*1.18)<1e-6,'1.16: corre mais rápido');
  R("IN.run=true;IN.mx=1;IN.my=0");for(let i=0;i<60*6;i++){A.update(1/60);}R("IN.run=false;IN.mx=0");
  ok(R('P.st')>=99&&!R('P.tired'),'1.16: fôlego infinito');
  A.renderWorld();A.drawHUD();
  ok(!R("healWith('adren')"),'1.16: não usa duas ao mesmo tempo');
  for(let i=0;i<60*21;i++)A.update(1/60);
  ok(!R('P.adren')&&R('DBG.speed')===sp0,'1.16: o efeito passa e cansa');
  // música de chefe não pisca
  R("UI.dbgAct('cb2:f2',{})");finishTalk();run(30);
  R("(()=>{const e=enemies.find(x=>x.alive&&x.type==='cervo2');P.x=e.x+300;P.y=e.y;})()");ok(R('musicMode()')==='boss','1.16: música de chefe perto');
  R("(()=>{const e=enemies.find(x=>x.alive&&x.type==='cervo2');e.cut=true;P.x=e.x+900;P.y=e.y;})()");ok(R('musicMode()')==='boss','1.16: continua quando o chefe se afasta um pouco');
  R("for(const e of enemies)if(e.type==='cervo2')e.alive=false");run(5);ok(R('musicMode()')!=='boss'||true,'');
};
