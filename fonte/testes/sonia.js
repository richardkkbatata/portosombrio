// 1.9 · Capítulo da Sonia: começa pelo título, o bairro é alcançável, os objetivos avançam, o Balseiro existe,
// o final volta ao título sem mexer no registro principal e o mundo principal continua igual.
{
const hashMundo=()=>R(`(()=>{let h=0;const n=W*HZO;for(let i=0;i<n;i++){h=(h*31+map[i]*7+bmap[i]+safeMask[i]*3)|0;}return [h,buildings.length,initEnemies.length].join(',')})()`);
A.newGame('normal'); G.mode='play'; G.flags.tutDone=true; G.tut=null; G.flags.marcaSonia=7; R('writeSave()');
const before=R(`localStorage.getItem(SAVE_KEY)`), mundo0=hashMundo();
ok(R(`(globalThis.CAPS||[]).some(c=>c.id==='sonia')`),'sonia: capítulo não registrado');
ok(R(`map[idx(50,NY+10)]===T.BORDER`),'sonia: linhas de Navegantes deviam ser parede no mundo principal');
R(`UI.title()`); R(`UI.act('caps',{})`); ok(R('UI.cur')==='caps','sonia: tela de capítulos');
R(`UI.act('cap',{k:'sonia'})`); finishTalk();
ok(R('SN.on'),'sonia: não começou'); ok(R('G.flags.cap')==='sonia','sonia: flag cap'); ok(R('P.lookO')===R('LOOKS.sonia'),'sonia: sem visual');
ok(R('P.owned.filter(Boolean).length')===1&&R('P.w')===8,'sonia: tem arma');
ok(A.objective().t.includes('rádio'),'sonia: objetivo inicial '+A.objective().t);
ok(R(`(P.y/TILE|0)>=NY`),'sonia: não está em Navegantes');
// tudo que importa é alcançável a partir do quarto
for(const k of ['radio','porta','bar','sinal','bloq','passou','predioDentro','janela','terminal','cabo','cabine','rampa'])
  ok(R(`(()=>{const [x,y]=snP('${k}');for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)if(reach[idx(x+i,y+j)]&&!SOLID[map[idx(x+i,y+j)]])return true;return false;})()`),'sonia: inalcançável '+k);
ok(!R(`reach[idx(60,NY+70)]`),'sonia: a outra margem não devia ser alcançável');
ok(R(`pickups.filter(p=>p.id==='garrafa'&&p.ty>=NY&&reach[idx(p.tx,p.ty)]).length`)>=4,'sonia: garrafas');
ok(R(`interacts.filter(o=>o.type==='hide'&&o.ty>=NY).length`)>=8,'sonia: esconderijos');
// sem arma: atirar não faz nada
R(`IN.fire=true`); step(20,{mx:0,my:0,fire:true}); R(`IN.fire=false`); ok(R('P.owned.filter(Boolean).length')===1,'sonia: ganhou arma');
// etapa 0: o rádio
R(`snRadio(interacts.find(o=>o.type==='snRadio'))`); finishTalk(); step(5,{mx:0,my:0,fire:false});
ok(R('SN.st')===1,'sonia: rádio '+R('SN.st'));
// etapa 1: andar até a praça liga pro Richard e chama o Balseiro
{const s=R(`snA('sinal')`);P.x=s.x;P.y=s.y;step(10,{mx:0,my:0});finishTalk();}
ok(R('SN.st')===2,'sonia: ligação '+R('SN.st')); ok(R('!!snBal()'),'sonia: sem Balseiro');
ok(R(`ETYPES.balseiro.hp`)>9000,'sonia: Balseiro matável');
R(`killEnemy(snBal())`); ok(R('!!snBal()'),'sonia: Balseiro morreu');
// etapa 2: esconder até ele passar
R(`{const h=interacts.filter(o=>o.type==='hide'&&o.ty>=NY).sort((a,b)=>hyp(a.x-P.x,a.y-P.y)-hyp(b.x-P.x,b.y-P.y))[0];const b=snBal();b.x=h.x+200;b.y=h.y;b.state='wander';enterHide(h);}`);
ok(R('!!P.hidden'),'sonia: não escondeu');
for(let i=0;i<12&&R('SN.st')===2;i++){step(60,{mx:0,my:0});finishTalk();}
ok(R('SN.st')===3,'sonia: esconder '+R('SN.st'));
R('exitHide()');
// etapa 3: garrafas do bar
R(`for(const p of pickups.filter(p=>p.id==='garrafa'&&p.ty>=NY).slice(0,3)){takePickup(p);}`); step(5,{mx:0,my:0});
ok(R('SN.st')===4,'sonia: garrafas '+R('SN.st')+' '+R(`invCount('garrafa')`));
// etapa 4: a barricada (garrafa joga os que comem pra longe)
{const n0=R(`enemies.filter(e=>e.alive&&e.state==='feed').length`);ok(n0>=4,'sonia: ninguém comendo na barricada '+n0);
 R(`{const a=snA('bloq');P.x=a.x-120;P.y=a.y;}`);R(`bottleBreak({x:tc(132),y:tc(NY+51)})`);step(420,{mx:0,my:0});
 ok(R(`enemies.filter(e=>e.alive&&e.state==='feed').length`)<n0,'sonia: garrafa não distraiu');
 ok(R(`enemies.filter(e=>e.alive&&e.sn&&e.type==='zumbi'&&hyp(e.x-tc(122),e.y-tc(NY+45.5))<70).length`)===0,'sonia: a fresta continua fechada');}
R(`{const a=snA('passou');P.x=a.x;P.y=a.y;}`); step(5,{mx:0,my:0});
ok(R('SN.st')===5,'sonia: barricada '+R('SN.st')); ok(R('snBal().state')==='chase','sonia: Balseiro não persegue');
// etapa 5: o prédio
R(`{const a=snA('predioDentro');P.x=a.x;P.y=a.y;}`); step(5,{mx:0,my:0}); finishTalk(); step(5,{mx:0,my:0});
ok(R('SN.st')===6,'sonia: prédio '+R('SN.st')); ok(R('G.clock')>=3*60,'sonia: não pulou a noite');
R(`snJanela(interacts.find(o=>o.type==='snJanela'))`); finishTalk(); step(5,{mx:0,my:0});
ok(R('SN.st')===7&&R('SN.cristo'),'sonia: janela '+R('SN.st'));
// morrer no capítulo não vira tela de morte
R('P.hp=0;die();'); ok(R('G.mode')==='play'&&R('P.hp')>0&&R('SN.deaths')===1,'sonia: morte no capítulo');
// etapa 7: o terminal
R(`{const a=snA('terminal');P.x=a.x;P.y=a.y;}`); step(5,{mx:0,my:0});
ok(R('SN.st')===8,'sonia: terminal '+R('SN.st')); finishTalk(); ok(R('SN.fuga')==='balsa','sonia: escolha '+R('SN.fuga'));
// etapa 8: soltar o cabo
R(`{const o=interacts.find(o=>o.type==='snCabo');P.x=o.x;P.y=o.y+30;snCabo(o);G.struggle.prog=999;}`); step(2,{mx:0,my:0});
for(let i=0;i<200&&R('CUT.on');i++){step(30,{mx:0,my:0});R('if(CUT.bub)cutTap()');}finishTalk();
ok(!R('SN.on'),'sonia: não terminou'); ok(R('G.mode')==='title','sonia: não voltou ao título '+R('G.mode')); ok(R('UI.cur')==='capfim','sonia: sem tela final');
ok(R(`localStorage.getItem(SAVE_KEY)`)===before,'sonia: registro principal mudou');
R(`UI.act('title',{})`); ok(R('UI.cur')==='title','sonia: voltar ao título');
// o outro final: cabine até amanhecer
R(`soniaStart(SNST.indexOf('fuga'))`); finishTalk();
R(`SN.fuga='cabine';SN.hold=2;snUnInt('snCabo');`); R(`{const h=interacts.find(o=>o.cabine);enterHide(h);}`); ok(R('!!(P.hidden&&P.hidden.cabine)'),'sonia: cabine');
for(let i=0;i<10&&R('SN.st')===8;i++){step(60,{mx:0,my:0});}
for(let i=0;i<200&&R('CUT.on');i++){step(30,{mx:0,my:0});R('if(CUT.bub)cutTap()');}finishTalk();
ok(!R('SN.on')&&R('G.mode')==='title','sonia: final da cabine');
// pulos do menu de teste
for(const k of ['sinal','esconder','garrafas','avenida','predio','cristo','ferry','fuga']){R(`soniaStart(SNST.indexOf('${k}'))`);finishTalk();
  ok(R('SN.on')&&R('SN.st')===R(`SNST.indexOf('${k}')`),'sonia: pulo '+k+' '+R('SN.st'));step(40,{mx:.3,my:.2});finishTalk();}
// sustos e o Balseiro rondando não quebram nada
R(`soniaStart(SNST.indexOf('ferry'))`);finishTalk();for(let i=0;i<8;i++){R('SN.scT=0');P.hp=100;step(120,{mx:Math.random()-.5,my:Math.random()-.5});finishTalk();}
ok(R('SN.on'),'sonia: capítulo caiu sozinho '+R('G.mode'));
R(`UI.act('quit',{})`); ok(!R('SN.on')&&!R('P.lookO'),'sonia: sair pelo menu');
ok(R(`localStorage.getItem(SAVE_KEY)`)===before,'sonia: registro principal mudou (fim)');
// mundo principal igual
A.newGame('normal'); ok(hashMundo()===mundo0,'sonia: mundo principal mudou');
ok(R(`map[idx(50,NY+10)]===T.BORDER`),'sonia: Navegantes ficou no mundo principal');
R(`{const s=readSave();loadState(s);}`); ok(R('G.flags.marcaSonia')===7&&!R('SN.on'),'sonia: carregar o registro depois');
R(`UI.title()`);
}
