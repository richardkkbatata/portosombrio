// ===================== 1.17.1 · O RUGIDO DO CERVO SEM DERRUBAR O SOM =====================
// O Cervo desperto respirava/rugia a cada 3-6 s com muito grave (fundamental de 30-60 Hz). Em alguns
// fones e caixas (principalmente Bluetooth e Windows com "equalização de volume"/proteção de audição)
// esse grave forte faz o próprio aparelho abaixar ou cortar o som por uns segundos. Agora:
// - o rugido, a respiração e o grito do Cervo passam por um corte de graves (sem nada abaixo de ~110 Hz);
// - tocam mais baixo e com mais espaço entre um e outro, e nunca dois ao mesmo tempo;
// - a música agenda as notas com mais antecedência (um travadinha da tela não deixa a música parar).
(function(){
  if(typeof SND==='undefined'||!SND.dsp)return;
  const D=SND.dsp;
  // versões "sem grave" geradas a partir das mesmas receitas
  const hp=(x,f)=>{D.F(x,'hp',f,.7,3);return D.fadeOut(D.norm(x,.85),.08);};
  const ex=SND.extra||[];
  const get=n=>{const r=ex.find(e=>e[0]===n);return r?r[1]:null;};
  const add=[];
  const r2=get('cb_roar2'), br=get('cb_breath'), sh=get('cb_shriek');
  if(r2)add.push(['cb_roar2s',()=>{const x=r2();return hp(Array.isArray(x)?x[0]:x,120);},2]);
  if(br)add.push(['cb_breaths',()=>{const x=br();return hp(Array.isArray(x)?x[0]:x,110);},2]);
  if(sh)add.push(['cb_shrieks',()=>{const x=sh();return hp(Array.isArray(x)?x[0]:x,160);},1]);
  ex.push(...add); SND.extra=ex;
})();
(function(){
  const has=n=>SND.b[n]&&SND.b[n].length;
  const now=()=>(AU.ctx&&AU.ctx.currentTime)||0;
  let last=-9;
  const gate=(gap)=>{const t=now();if(t-last<gap)return false;last=t;return true;};
  const fight=()=>typeof cb2Fight==='function'&&cb2Fight();
  const r2=AU.cbRoar2, br=AU.cbBreath, sh=AU.cbShriek, ro=AU.roar, sb=AU.cbSub;
  AU.cbRoar2=function(x,y,v=1){if(!gate(1.6))return;if(has('cb_roar2s'))return this.pbAt('cb_roar2s',x,y,{vol:.26*v,wet:.45,maxD:2400,jit:.05,must:true});return r2.call(this,x,y,v*.7);};
  AU.cbBreath=function(x,y,v=1){if(fight()&&!gate(1.2))return;if(has('cb_breaths'))return this.pbAt('cb_breaths',x,y,{vol:.26*v,wet:.4,maxD:900});return br.call(this,x,y,v*.7);};
  AU.cbShriek=function(x,y,v=1){if(!gate(1.4))return;if(has('cb_shrieks'))return this.pbAt('cb_shrieks',x,y,{vol:.32*v,wet:.5,maxD:1600,must:true});return sh.call(this,x,y,v*.7);};
  // na luta do Cervo desperto, o rugido genérico e o "tremor" ficam bem mais baixos
  AU.roar=function(){if(fight()){if(!gate(1.2))return;if(has('roar'))return this.pb('roar',{vol:.28,wet:.4,must:true,jit:.05});}return ro.apply(this,arguments);};
  AU.cbSub=function(v=1){if(fight())return;return sb.call(this,v);};
})();
// o Cervo desperto "fala" menos vezes
{const ai=cb2C2AI; cb2C2AI=function(e,dt){const before=e.snd;const r=ai.apply(this,arguments);if(before!=null&&e.snd>before)e.snd=rr(6,10);return r;};}
// música com mais folga: agenda 0,6 s à frente
{const mt=AU.musicTick; AU.musicTick=function(mode){
  const c=this.ctx; if(!c||!MUS.g||!mode||mode!==MUS.mode)return mt.apply(this,arguments);
  const r=mt.apply(this,arguments);
  try{const t=c.currentTime,bpm=mode==='menu'?66:mode==='final'?142:128,sd=60/bpm/2;
    while(MUS.t<t+.6){const s=MUS.step++,at=MUS.t;MUS.t+=sd;if(mode==='menu')musMenu(s,at,c);else musBoss(s,at,c,mode==='final');}}catch(e){}
  return r;};}
