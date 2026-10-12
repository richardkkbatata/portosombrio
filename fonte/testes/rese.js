// 1.9 · Capítulo extra do Prof. Rese: começa pelo título, avança por todas as etapas, não mexe no registro e volta ao título.
module.exports=function(A,R,ok,step,finishTalk,vm,ctx,G,P){
  // registro principal antes
  A.newGame('normal'); G.mode='play'; G.flags.tutDone=true; G.tut=null; G.flags.marcaTeste=42; R('writeSave()');
  const before=R(`localStorage.getItem(SAVE_KEY)`);
  ok(R(`(globalThis.CAPS||[]).some(c=>c.id==='rese')`),'rese: capítulo não registrado');
  R(`UI.title()`); R(`UI.act('caps',{})`); ok(R('UI.cur')==='caps','rese: tela de capítulos');
  R(`UI.act('cap',{k:'rese'})`); finishTalk();
  ok(R('RC.on'),'rese: não começou'); ok(R('P.lookO')===R('LOOKS.alex'),'rese: sem visual do Rese'); ok(R('G.mode')==='play','rese: modo '+R('G.mode'));
  ok(A.objective().t.includes('provas'),'rese: objetivo inicial '+A.objective().t);
  ok(!R(`npcs.some(n=>n.id==='alex')`),'rese: Rese duplicado no mapa');
  // etapa 0: as três folhas, andando até cada uma
  for(let i=0;i<3;i++){const f=R(`RCP.folhas[${i}]`);P.x=f[0]*32;P.y=f[1]*32;P.hp=100;step(20,{mx:0,my:0});finishTalk();}
  step(80,{mx:0,my:0});finishTalk();
  ok(R('RC.st')===1,'rese: folhas não avançaram '+R('RC.st'));
  // etapa 1: a igreja (andar até lá dispara a conversa com o Otávio)
  const ig=R('RCP.igreja');P.x=ig[0]*32;P.y=ig[1]*32;step(10,{mx:0,my:0});finishTalk();
  ok(R('RC.st')===2,'rese: igreja '+R('RC.st'));ok(R('P.owned[1]'),'rese: sem pistola');
  R(`killEnemy(RC.otZ)`);step(10,{mx:0,my:0});finishTalk();ok(R('RC.st')===3,'rese: Otávio '+R('RC.st'));
  R(`for(const e of enemies)if(e.alive)killEnemy(e)`);
  // etapa 3/4: mercado e feirantes
  const d=R('RCP.dentro');P.x=d[0]*32;P.y=d[1]*32;step(10,{mx:0,my:0});finishTalk();ok(R('RC.st')===4,'rese: mercado '+R('RC.st'));
  for(const k of ['beto','neide']){const n=R(`(()=>{const n=npcs.find(n=>n.id==='${k}');return [n.x,n.y]})()`);P.x=n[0]+30;P.y=n[1];step(10,{mx:0,my:0});finishTalk();}
  step(5,{mx:0,my:0});finishTalk();ok(R('RC.st')===5,'rese: feirantes '+R('RC.st'));ok(R('P.owned[0]'),'rese: sem faca');
  // barricadas pelo interagir (luta de apertar)
  for(const k of ['S','E']){R(`{const o=interacts.find(o=>o.type==='rcBarr'&&o.k==='${k}');P.x=o.x;P.y=o.y+4;rcBarr(o);G.struggle.prog=999;}`);
    R(`{const m=G.mode,c=CUT.on;G.mode='play';CUT.on=false;struggleTick(.016);G.mode=m;CUT.on=c;}`);step(4,{mx:0,my:0});finishTalk();}
  ok(R('RC.barr.S&&RC.barr.E'),'rese: barricadas');step(4,{mx:0,my:0});ok(R('RC.st')===6,'rese: depois das barricadas '+R('RC.st'));
  ok(R(`SOLID[map[idx(30,47)]]`),'rese: porta sul não ficou bloqueada');
  R(`rcRadio(interacts.find(o=>o.type==='rcRadio'))`);finishTalk();R(`rcExt(interacts.find(o=>o.type==='rcExt'))`);step(4,{mx:0,my:0});finishTalk();
  ok(R('RC.st')===7,'rese: rádio/extintor '+R('RC.st'));ok(!R(`SOLID[map[idx(30,47)]]`),'rese: porta sul não cedeu');
  // defesa: segura o tempo, com zumbis vindo
  let maxE=0;for(let i=0;i<40&&R('RC.st')===7;i++){P.hp=100;step(90,{mx:0,my:0});finishTalk();maxE=Math.max(maxE,R('enemies.filter(e=>e.alive&&e.rc).length'));}
  ok(maxE>=3,'rese: defesa sem zumbis '+maxE);ok(R('RC.st')===8,'rese: defesa não terminou '+R('RC.st'));ok(R('!!(RC.boss&&RC.boss.alive)'),'rese: sem chefe');
  // morrer no capítulo não acaba o jogo nem vira tela de morte
  R('P.hp=0;die();');ok(R('G.mode')==='play'&&R('P.hp')>0&&R('RC.deaths')===1,'rese: morte no capítulo');
  R(`killEnemy(RC.boss)`);step(120,{mx:0,my:0});ctx.__timeouts.splice(0).forEach(f=>f());step(4,{mx:0,my:0});
  for(let i=0;i<200&&R('CUT.on');i++){step(30,{mx:0,my:0});R('if(CUT.bub)cutTap()');}finishTalk();
  ok(!R('RC.on'),'rese: não terminou');ok(R('G.mode')==='title','rese: não voltou ao título '+R('G.mode'));ok(R('UI.cur')==='capfim','rese: sem tela final');
  ok(R(`localStorage.getItem(SAVE_KEY)`)===before,'rese: registro principal mudou');
  R(`UI.act('title',{})`);ok(R('UI.cur')==='title','rese: voltar ao título');
  // pulos do menu de teste
  for(const k of ['igreja','rua','feira','barricar','radio','defesa','chefe']){R(`reseStart(RCST.indexOf('${k}'))`);finishTalk();ok(R('RC.on')&&R('RC.st')===R(`RCST.indexOf('${k}')`),'rese: pulo '+k+' '+R('RC.st'));step(30,{mx:0,my:0});finishTalk();}
  R(`reseStart(RCST.indexOf('fim'))`);finishTalk();ok(!R('RC.on')&&R('G.mode')==='title','rese: pulo final');
  // começa e sai pelo menu de pausa
  R(`reseStart()`);finishTalk();step(30,{mx:0,my:0});R(`UI.act('quit',{})`);ok(!R('RC.on')&&!R('P.lookO'),'rese: sair pelo menu');
  ok(R(`localStorage.getItem(SAVE_KEY)`)===before,'rese: registro principal mudou (fim)');
  R(`{const s=readSave();loadState(s);}`);ok(R('G.flags.marcaTeste')===42&&!R('RC.on'),'rese: carregar o registro depois');
  R(`UI.title()`);
};
