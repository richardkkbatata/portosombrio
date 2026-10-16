// ===================== 1.14 · REVISÃO: QUEM FALA TEM QUE ESTAR LÁ, E CORREÇÕES GERAIS =====================
// Fala (balão ou cutscene) de personagem que não está perto do Richard é descartada:
// o Matheus não fala mais em Camboriú, o Edu não comenta do outro lado da cidade, etc.
// Rádio, telefone e pensamento continuam valendo. Nos capítulos extras e no flashback o "jogador"
// é outro personagem, então a regra não se aplica lá.
const FALA_FISICA=new Set(['edu','matheus','marlon','alex','helena','tiao','cida','ivo','ademir','neusa','juliana','kadu','bia','lauro','ze','beto','otavio','neide','arlindo','tavinho','brandt','arantes','pregador','zuleica','valdir','haroldo','jurema','lipe','dario','tania','carol']);
function falaOutroModo(){return (typeof SN!=='undefined'&&SN.on)||(typeof RC!=='undefined'&&RC.on)||(typeof FB!=='undefined'&&FB.on)||(typeof MP!=='undefined'&&MP.on);}
function falaPresente(w,R=1200){
  if(!w||w==='rafa'||!FALA_FISICA.has(w)||falaOutroModo())return true;
  const near=a=>a&&a.x!=null&&hyp(a.x-P.x,a.y-P.y)<R;
  if(typeof CUT!=='undefined'&&CUT.actors&&CUT.actors[w])return true;
  if(near(typeof actorOf==='function'?actorOf(w):null)&&actorOf(w)!==P)return true;
  if(near(compOf(w)))return true;
  if(npcs.some(n=>(n.id===w||(n.v19&&typeof V19MI!=='undefined'&&V19MI[n.v19]&&V19MI[n.v19].npc===w)||String(n.id).includes(w)||(n.look&&w.startsWith(n.look))||(n.name&&n.name.toLowerCase().includes(w)))&&(!n.cond||n.cond())&&near(n)))return true;
  if(typeof ALLY!=='undefined'&&ALLY.list.some(a=>a.id===w&&near(a)))return true;
  if(enemies.some(e=>e.alive&&e.type===w&&near(e)))return true;
  return false;
}
const FALA_LOG=[];
// quem decide a fala é a presença, não o "está no grupo"
function eduAqui(){return !!G.flags.eduFollow&&falaPresente('edu',900);}
function matAqui(){return !!G.flags.matFollow&&falaPresente('matheus',900);}
(function(){
  const bk=bark; bark=function(w,m,t,o={}){if(!o.radio&&!falaPresente(w)){if(FALA_LOG.length<300)FALA_LOG.push(w+': '+t);return;}return bk.apply(this,arguments);};
  const cn=cutNext; cutNext=function(){
    try{for(let k=0;k<40;k++){const s=CUT.q[CUT.i+1];if(!s||!s.say||s.radio||s.think||falaPresente(s.say))break;if(FALA_LOG.length<300)FALA_LOG.push('[cut] '+s.say+': '+s.t);CUT.i++;}}catch(e){}
    return cn.apply(this,arguments);};
})();
// menu de teste: "Nicolas" agora leva ao morro de Camboriú (ele não fica mais na surf shop da Brava)
{const dj=dbgJump; dbgJump=function(k){if(k==='nico'&&typeof UI.dbgAct==='function'){try{return UI.dbgAct('cb:nico',{});}catch(e){}}return dj.apply(this,arguments);};}
// em Camboriú não tem zumbi: os eventos da cidade que dependem deles ficam parados lá
{const pausa=['caosTick','cryTick','trapTick','v12EventTick','bombCallTick','dragTick','pinnedTick','terrorTick','surfTick','v19EvTick','updEvents','ductTick'];
  for(const nm of pausa){try{const f=globalThis[nm]||eval(nm);if(typeof f!=='function')continue;
    const w=function(){if(typeof inCb==='function'&&inCb())return;return f.apply(this,arguments);};
    eval(nm+'=w');}catch(e){}}}
