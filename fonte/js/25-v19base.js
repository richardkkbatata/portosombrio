// ===================== 1.9 · base compartilhada pelos módulos novos =====================
// Menu de teste: cada módulo registra a sua seção sem mexer no 16-debug.js:
//   dbgExtra('1.9 · Título', [['chave:acao','Rótulo do botão'], ...], (acao)=>{ ... })
// A seção aparece no topo da aba "Novidades" e o clique chama a função com a chave.
const DBG_EXTRA=[], DBG_EXTRA_FN={};
function dbgExtra(titulo,botoes,fn){DBG_EXTRA.unshift({t:titulo,b:botoes});for(const [k] of botoes)DBG_EXTRA_FN[k]=fn;}
{const da=UI.dbgAct.bind(UI); UI.dbgAct=function(k,ds){const fn=DBG_EXTRA_FN[k];if(fn){try{return fn.call(this,k,ds);}catch(e){console.error(e);toast('Erro: '+e.message);return;}}return da(k,ds);};}
