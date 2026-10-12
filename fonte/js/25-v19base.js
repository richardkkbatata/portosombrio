// ===================== 1.9 · base compartilhada pelos módulos novos =====================
// Menu de teste: cada módulo registra a sua seção sem mexer no 16-debug.js:
//   dbgExtra('1.9 · Título', [['chave:acao','Rótulo do botão'], ...], (acao)=>{ ... })
// A seção aparece no topo da aba "Novidades" e o clique chama a função com a chave.
// Menu de teste: cada módulo registra as suas seções sem mexer no 16-debug.js.
//   dbgExtra(titulo,botoes,fn)        -> aba "Novidades" (no topo)
//   dbgTab('hist',titulo,botoes[,fn]) -> aba por assunto (no fim)
// Na lista de botões, '@chave' vira teleporte (tp) e '#chave' vira liga/desliga (tg).
const DBG_EXTRA=[], DBG_EXTRA_FN={};
function dbgReg(k,fn){if(fn&&k[0]!=='@'&&k[0]!=='#')DBG_EXTRA_FN[k]=fn;}
function dbgExtra(titulo,botoes,fn,tab){DBG_EXTRA.unshift({t:titulo,b:botoes,tab:tab||'nov'});for(const [k] of botoes)dbgReg(k,fn);}
function dbgTab(tab,titulo,botoes,fn){DBG_EXTRA.push({t:titulo,b:botoes,tab});for(const [k] of botoes)dbgReg(k,fn);}
{const da=UI.dbgAct.bind(UI); UI.dbgAct=function(k,ds){const fn=DBG_EXTRA_FN[k];if(fn){try{return fn.call(this,k,ds);}catch(e){console.error(e);toast('Erro: '+e.message);return;}}return da(k,ds);};}

// corrida do celular não fica ligada de uma partida pra outra
{const ng=newGame; newGame=function(){if(typeof TOUCH!=='undefined')TOUCH.runOn=false;return ng.apply(this,arguments);};}
