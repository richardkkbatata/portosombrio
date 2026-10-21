module.exports=(A,R,ok,step,finishTalk,vm,ctx)=>{
  const G=A.G;const run=n=>{for(let i=0;i<n;i++){if(R('CUT.on'))finishTalk();A.update(1/60);}};
  A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;R("dbgJump('posto')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
  ok(R("CRATES.length")>=25,'1.17: caixas espalhadas ('+R("CRATES.length")+')');
  ok(R("CRATES.every(c=>{const it=c.it;return [[1,0],[-1,0],[0,1],[0,-1]].some(([a,b])=>reach[idx(c.tx+a,c.ty+b)]&&!SOLID[map[idx(c.tx+a,c.ty+b)]]);})"),'1.17: caixas alcançáveis');
  // sem nada: cai o que falta
  R("UI.dbgAct('drop:vazio',{})");
  const L=R("dropNeeds().map(n=>n.id)");ok(L.includes('m9')&&L.includes('ervaV'),'1.17: precisa de munição da pistola e cura: '+L.join(','));
  ok(!L.includes('cart')||R("P.owned[WI('escopeta')]||P.owned[WI('cano')]"),'1.17: não pede munição de arma que você não tem');
  let got={},n=0;for(let i=0;i<200;i++){const p=R("(()=>{const p=dropRoll({x:P.x+60,y:P.y,max:30,type:'zumbi'});if(p){pickups.splice(pickups.indexOf(p),1);return p.id;}return null;})()");if(p){n++;got[p]=(got[p]||0)+1;}}
  ok(n>40&&!got.grana,'1.17: apertado, cai bastante ('+n+'/200)');
  // cheio: quase nada
  R("UI.dbgAct('drop:cheio',{})");let m=0,ammo=0;for(let i=0;i<200;i++){const p=R("(()=>{const p=dropRoll({x:P.x+60,y:P.y,max:30,type:'zumbi'});if(p){pickups.splice(pickups.indexOf(p),1);return p.id;}return null;})()");if(p){m++;if(p!=='grana')ammo++;}}
  ok(m===0,'1.17: bem servido, não cai munição ('+m+' drops, '+ammo+' de munição)');
  // caixa
  R("UI.dbgAct('drop:vazio',{})");const c0=R("CRATES.length");
  R("(()=>{const c=CRATES[0];P.x=tc(c.tx)+40;P.y=tc(c.ty);G.prompt={k:'int',o:c.it};doInteract();})()");
  ok(R("CRATES.length")===c0-1&&R("(G.flags.cx||[]).length")===1,'1.17: quebrou a caixa');
  const sv=JSON.parse(JSON.stringify(R('serialize()')));R(`loadState(${JSON.stringify(sv)})`);G.mode='play';
  ok(R("CRATES.length")===c0-1,'1.17: caixa quebrada continua quebrada depois de carregar');
  // some depois de um tempo
  R("(()=>{const p=dropSpawn(P.x+400,P.y,'m9',5);p.life=1;window.__p=p;})()");run(140);ok(!R("pickups.includes(__p)"),'1.17: drop esquecido some');
  // suprimento em luta de chefe
  R("UI.dbgAct('cb2:f2',{})");finishTalk();run(20);R("DBG.god=true;UI.dbgAct('drop:vazio',{});DSUP.t=0");const p0=R("pickups.filter(p=>p.dyn!=null).length");run(30);
  ok(R("pickups.filter(p=>p.dyn!=null).length")>p0,'1.17: suprimento aparece na luta quando você está apertado');
  R("UI.dbgAct('drop:cheio',{});DSUP.t=0");const p1=R("pickups.filter(p=>p.dyn!=null).length");run(30);
  ok(R("pickups.filter(p=>p.dyn!=null).length")===p1,'1.17: bem servido, sem suprimento');
  R("DBG.god=false");
  // chute no atordoado
  A.newGame('normal');G.mode='play';R("dbgJump('posto')");finishTalk();G.mode='play';
  R("enemies=enemies.filter(e=>hyp(e.x-P.x,e.y-P.y)>900);(()=>{const e=makeEnemy('zumbi',P.x+40,P.y,null);e.stun=2;e.tk=1;enemies.push(e);const f=makeEnemy('zumbi',P.x+70,P.y+20,null);f.tk2=1;enemies.push(f);})();P.st=100");
  ok(R("(findInteract()||{}).o&&findInteract().o.type")==='chute','1.17: prompt de chutar no atordoado');
  const hx=R("enemies.find(e=>e.tk2).x");R("G.prompt=findInteract();doInteract()");
  ok(R("(()=>{const e=enemies.find(e=>e.tk);return !e||!e.alive||e.hp<e.max;})()")&&R("(()=>{const f=enemies.find(e=>e.tk2);return !f.alive||f.hp<f.max;})()"),'1.17: chute acerta ele e o do lado');
};
