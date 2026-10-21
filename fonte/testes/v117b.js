module.exports=(A,R,ok,step,finishTalk,vm,ctx)=>{
  const G=A.G;const run=n=>{for(let i=0;i<n;i++){if(R('CUT.on'))finishTalk();A.update(1/60);if(i%10===0){A.renderWorld();A.drawHUD();}}};
  const flush=()=>{for(let k=0;k<6;k++){for(const f of ctx.__timeouts.splice(0))try{f()}catch(e){};finishTalk();}};
  A.newGame('normal');G.mode='play';ctx.__timeouts.length=0;R("dbgJump('posto')");finishTalk();ctx.__timeouts.length=0;G.mode='play';
  ok(R("BOTIJ.length")>=15,'1.17: botijões no mapa ('+R("BOTIJ.length")+')');
  R("enemies=enemies.filter(e=>hyp(e.x-P.x,e.y-P.y)>900);DBG.god=true");
  R("(()=>{for(let a=0;a<6.28&&!window.__b;a+=.2)for(const d of [128,160,96]){const x=((P.x+Math.cos(a)*d)/32)|0,y=((P.y+Math.sin(a)*d)/32)|0;if(SOLID[getT(x,y)])continue;let clear=true;for(let t=0;t<=1;t+=.04){const tt=tileAtPx(P.x+(tc(x)-P.x)*t,P.y+(tc(y)-P.y)*t);if(BULLET_BLOCK[tt]||(SOLID[tt]&&tt!==T.PROP&&tt!==T.TREE&&tt!==T.FENCE&&tt!==T.WATER)){clear=false;break;}}if(!clear)continue;window.__b=botijAdd(x,y,'bjt');break;}const e=makeEnemy('zumbi',__b.x+20,__b.y+20,null);e.tb=1;e.state='dorm';enemies.push(e);})()");
  ok(R("!!window.__b"),'1.17: botijão de teste');
  R("P.ang=Math.atan2(__b.y-P.y,__b.x-P.x);IN.aimAng=P.ang;switchWeapon(1);P.mags[1]=12;P.cool=0;fire()");run(30);flush();
  ok(!R("BOTIJ.includes(__b)"),'1.17: tiro explode o botijão');
  ok(R("(()=>{const e=enemies.find(e=>e.tb);return !e||!e.alive||e.hp<e.max;})()"),'1.17: explosão pega o zumbi do lado');
  ok(R("(G.flags.bx||[]).includes('bjt')"),'1.17: botijão fica explodido no registro');
  // chute animado
  R("(()=>{const e=makeEnemy('zumbi',P.x+40,P.y,null);e.stun=2;enemies.push(e);P.st=100;G.prompt=findInteract();doInteract();})()");
  ok(R("!!P.kick"),'1.17: chute com animação');run(30);ok(!R("P.kick"),'1.17: animação do chute termina');
  // +N ao pegar
  R("(()=>{const p=dropSpawn(P.x+10,P.y,'m9',6);takePickup(p);})()");ok(R("floaters.some(f=>/\\+6/.test(f.t))"),'1.17: aviso +6 ao pegar');
  R("DBG.god=false");
};
