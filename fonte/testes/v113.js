module.exports=(A,R,ok,step,finishTalk,vm,ctx)=>{
  const G=A.G; const run=(n,d)=>{for(let i=0;i<n;i++){A.update(1/60);if(d&&i%10===0){A.renderWorld();A.drawHUD();}}};
  A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;R("dbgJump('caos')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
  // missões
  R("UI.inv('missoes')");ok(R("UI.tab")==='missoes','1.13: aba Missões abre');const mb=R("misBody()");ok(/História principal/.test(mb)&&/secundárias/.test(mb)&&/ m a /.test(mb),'1.13: missões mostram principal, secundárias e onde ir');
  R("UI.close();G.mode='play'");
  // registros
  R("slotSet(3)");ok(R("writeSave()"),'1.13: salvar no slot 3');ok(R("!!slotRead(3)&&!!slotRead(3).meta"),'1.13: slot 3 tem dados');
  const txt=R("JSON.stringify({jogo:'porto-sombrio',registro:slotRead(3)})");ok(R(`slotImportData(5,${JSON.stringify(txt)})`)&&R("!!slotRead(5)"),'1.13: importar arquivo no slot 5');
  ok(!R(`slotImportData(4,'{"x":1}')`),'1.13: arquivo errado é recusado');
  R("UI.slots('save')");R("UI.close();G.mode='play';slotSet(1)");
  // caos: casa destruída fica destruída depois de carregar
  R("G.flags.postoBoom=true;G.flags.caos=2");
  const id=R("(()=>{const b=buildings.find(b=>chHouseOk(b)&&hyp(tc(b.x)-P.x,tc(b.y)-P.y)<4000);if(!b)return -1;chDestroy(b,true);return b.id;})()");
  ok(id>=0,'1.13: achou casa pra explodir');
  if(id>=0){const d=R(`(()=>{const b=buildings[${id}];return {t:getT(b.x+2,b.y+2),door:b.doorT&&b.doorT[0]?getT(b.doorT[0].x,b.doorT[0].y):-1};})()`);ok(d.t===R('T.RUBBLE')&&d.door===R('T.RUBBLE'),'1.13: casa destruída fechada');
    const sv=JSON.parse(JSON.stringify(R('serialize()')));R('newGame("normal")');R(`loadState(${JSON.stringify(sv)})`);G.mode='play';
    ok(R(`buildings[${id}].destroyed&&getT(buildings[${id}].x+2,buildings[${id}].y+2)===T.RUBBLE`),'1.13: continua destruída depois de carregar');}
  for(let k=0;k<6;k++){R("CH.t=0");run(60,true);}
  R("for(const e of CH_EV)try{e.f()}catch(x){throw x}");run(60*8,true);ok(true,'');
  // matar um sobrevivente
  R("const p=chMkPed(P.x+60,P.y,{st:'calm',hp:20});p.saved=true;pedHurt(p,99,0)");run(30);ok(R("G.flags.pedKill")>=1&&R("G.shockT")>0,'1.13: matar sobrevivente conta e dá medo');
  // Camboriú com tochas e eventos novos
  ok(R("CBD.some(d=>d.k==='tocha')&&CBD.some(d=>d.k==='braseiro')"),'1.13: tochas e braseiros em Camboriú');
  R("dbgJump('cbBase')");finishTalk();R("G.flags.cbCall=true;G.flags.cbSt=3;cbGo(CBL.coreto)");for(const e of R("CB_EVT.length")?[0]:[]);
  R("for(const e of CB_EVT)try{e.f()}catch(x){throw x}");run(60*6,true);ok(true,'');
  // o Cervo não renasce
  R("G.flags.cbPortal=true;G.flags.cbBossOn=true;G.flags.cbBossSpawned=true;const e=makeEnemy('chifrudo',P.x+100,P.y,null);e.cb=1;enemies.push(e);hurtEnemy(e,99999,0,0,{})");finishTalk();for(let k=0;k<4;k++){for(const f of ctx.__timeouts.splice(0))try{f()}catch(x){};finishTalk();}run(120);R("for(const e of enemies)if(e.type==='cervo2')e.alive=false");
  ok(!A.enemies.some(e=>e.alive&&e.type==='chifrudo'),'1.13: o Cervo não nasce de novo');
};
