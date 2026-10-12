// ===================== 1.9.2 · AJUSTES DE LÓGICA E DIFICULDADE =====================
// O começo estava mais pesado que o final: a única arma inicial fica na cozinha do prédio da frente
// e ali perto andavam 6 cães e um corredor, com o jogador sem arma nenhuma.
// Agora, numa partida nova, a vizinhança da primeira faca fica só com zumbis lentos (dá pra desviar).
{const ng=newGame; newGame=function(){
  const r=ng.apply(this,arguments);
  try{
    const L=LM&&LM.faca1; if(!L||!enemies)return r;
    const armado=P.owned&&P.owned.slice(0,8).some(x=>x); if(armado)return r;
    enemies=enemies.filter(e=>!((e.type==='cao'||e.type==='corr')&&Math.hypot(e.x-L.x,e.y-L.y)<18*TILE));
  }catch(e){console.error(e);}
  return r;};}
