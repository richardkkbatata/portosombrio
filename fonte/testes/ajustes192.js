module.exports=(A,R,ok)=>{
  A.newGame('normal');
  const L=A.getLM().faca1;
  const rapidos=A.enemies.filter(e=>(e.type==='cao'||e.type==='corr')&&Math.hypot(e.x-L.x,e.y-L.y)<18*32);
  ok(rapidos.length===0,'1.9.2: cães/corredores perto da primeira faca ('+rapidos.length+')');
  ok(A.enemies.length>300,'1.9.2: o resto do mundo continua com inimigos ('+A.enemies.length+')');
  // a seta do esgoto aponta para um fusível que falta
  A.G.mode='play';
  ok(typeof A.objective==='function','1.9.2: objective existe');
};
