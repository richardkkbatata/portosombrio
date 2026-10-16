module.exports=(A,R,ok)=>{
  A.newGame('normal');A.G.mode='play';
  for(const id of ['cano','machado','rev38']){const i=R(`WI('${id}')`);ok(i>=0,'1.10: arma '+id);const p=A.getPickups().find(p=>p.kind==='weapon'&&p.id===i);ok(p&&A.reach[A.idx(p.tx,p.ty)],'1.10: '+id+' no mapa e alcançável');}
  ok(R('mascates().length')===0,'1.10: sem Mascate no modo história');
  R('FB.on=true');A.G.flags.persOn=true;A.G.persT=0;A.P.x=A.LM.lab.x;A.P.y=A.LM.lab.y+60;for(let i=0;i<90;i++)A.update(1/60);
  ok(!A.enemies.some(e=>e.alive&&e.type==='pers'),'1.10: Perseguidor fora do flashback');
  A.G.ev.v19cinza=3;for(let i=0;i<240;i++)A.update(1/60);R('FB.on=false');ok(!(A.G.ev.v19cinza>0),'1.10: cinza acaba mesmo no flashback');
  Object.assign(A.G.flags,{armed:true,jipe:true,bloqueio:true,metHelena:true,clinicPower:true,uniDone:true,uniMeet:true,uniMat:true,matheusJoin:true,matFollow:true});
  A.P.owned[R(`WI('rev38')`)]=true;A.P.x=A.LM.uniBib.x;A.P.y=A.LM.uniBib.y+60;const o=A.objective();
  ok(o.at&&Math.abs(o.at.x-A.LM.tunelZ.x)<2&&Math.abs(o.at.y-A.LM.tunelZ.y)<2,'1.10: seta da Universidade vai pro túnel');
  ok(R('ETYPES.brandt.hp')>=1000,'1.10: Brandt mais forte');
  // companheiros em combate não quebram
  R(`syncComps();for(let i=0;i<4;i++){const z=makeEnemy('zumbi',P.x+120,P.y+i*10);z.state='chase';z.sees=true;enemies.push(z);}G.lastLoud=G.time;`);
  for(let i=0;i<200;i++){A.update(1/60);if(i%8===0){A.renderWorld();A.drawHUD();}}ok(true,'');
};
