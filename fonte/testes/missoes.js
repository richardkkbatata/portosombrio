// 1.9 · Missões secundárias e eventos aleatórios (29-v19-missoes.js)
// Recebe (A,R,ok,step,finishTalk,vm,ctx,G,P); R(código) roda dentro do jogo.
module.exports=function(A,R,ok,step,finishTalk,vm,ctx,G,P){
  const flush=()=>{for(let k=0;k<4;k++){const t=ctx.__timeouts.splice(0);t.forEach(f=>{try{f()}catch(e){console.log('timeout',e.message)}});}finishTalk();};
  A.newGame('normal'); G.mode='play';
  const ids=R('V19M.map(m=>m.id)'); ok(ids.length>=10,'menos de 10 missões: '+ids.length);
  // alcance: NPCs, pontos e itens das missões
  const bad=R(`(()=>{const o=[];const t=(x,y,w)=>{const tx=(x/TILE)|0,ty=(y/TILE)|0;if(!reach[idx(tx,ty)]||SOLID[map[idx(tx,ty)]])o.push(w+'@'+tx+','+ty);};
    for(const m of V19M){if(!m.npc)continue;const n=npcs.find(n=>n.v19===m.id);if(!n){o.push('sem npc '+m.id);continue;}t(n.x,n.y,'npc '+m.id);}
    for(const k in V19P)t(V19P[k].x,V19P[k].y,'ponto '+k);
    for(const p of pickups)if(String(p.uid).startsWith('v19_'))t(p.x,p.y,'item '+p.uid);
    if(!LM.farmacia)o.push('sem farmácia');return o;})()`);
  ok(bad.length===0,'missões inalcançáveis: '+bad.join(' '));
  const nPk=R(`pickups.filter(p=>String(p.uid).startsWith('v19_')).length`); ok(nPk>=16,'itens de missão: '+nPk);
  for(const k of ['dog','antena','clinicaBrava','foto_foyer','foto_uniBib','foto_quadraUni'])ok(R(`!!V19P['${k}']`),'ponto sem lugar: '+k);
  // conversas com todos os NPCs (começar) sem erro
  for(const id of ids){const has=R(`!!npcs.find(n=>n.v19==='${id}')`);if(!has)continue;
    R(`{const n=npcs.find(n=>n.v19==='${id}');P.x=n.x+30;P.y=n.y;G.mode='play';G.prompt=findInteract();}`);
    ok(R(`G.prompt&&G.prompt.k==='npc'&&G.prompt.o.v19==='${id}'`),'não dá pra falar com '+id);
    A.doInteract();finishTalk();if(G.mode==='menu')A.UI.close();G.mode='play';}
  for(const id of ['pipoca','insulina','farmacia','prancha','barco','gerador','cachaca','vinil','fotos','escolta'])ok(R(`v19St('${id}')`)===1,'conversa não começou '+id);
  ok(R(`invCount('camera')`)===1,'Carol não deu a câmera');
  // completar cada missão pelo caminho de verdade
  const g0=()=>R('grana()');
  const take=uid=>R(`{const p=pickups.find(p=>p.uid==='${uid}');if(p){P.x=p.x;P.y=p.y;takePickup(p);}}`);
  const talk=id=>{R(`{const n=npcs.find(n=>n.v19==='${id}');P.x=n.x+30;P.y=n.y;G.mode='play';G.prompt=findInteract();doInteract();}`);finishTalk();G.mode='play';};
  let g;
  // pipoca: chamar o cachorro no cemitério e levar até o Seu Valdir
  g=g0(); R(`{enemies=[];const d=V19P.dog;P.x=d.x+20;P.y=d.y;}`); step(2,{});
  R(`{const o=v19Points().find(o=>o.lab==='Chamar o cachorro');o&&o.use();}`); ok(R('!!(V19T.dog&&V19T.dog.f)'),'cachorro não seguiu');
  R(`{const n=npcs.find(n=>n.v19==='pipoca');P.x=n.x+40;P.y=n.y;}`); for(let i=0;i<120&&R(`v19St('pipoca')`)!==2;i++){step(1,{});finishTalk();}
  ok(R(`v19St('pipoca')`)===2&&g0()>=g+300,'Pipoca não voltou');
  // insulina
  g=g0(); take('v19_insulina'); talk('insulina'); ok(R(`v19St('insulina')`)===2&&g0()>=g+200,'insulina');
  // antena: começa pelo rádio
  R(`G.flags.walkie=true;G.time=300;G.ev.v19osni=99;G.ev.lastE=-999;`); step(2,{}); finishTalk(); flush();
  ok(R(`v19St('antena')`)===1,'Seu Osni não chamou no rádio');
  g=g0(); R(`invAdd('pilha',1);{const a=V19P.antena;P.x=a.x;P.y=a.y;G.mode='play';G.prompt=findInteract();}`); ok(R(`G.prompt&&G.prompt.k==='v19'`),'antena sem botão');
  A.doInteract(); finishTalk(); ok(R(`v19St('antena')`)===2&&g0()>=g+250,'antena');
  // drogaria
  R(`enemies=[];{const L=LM.farmacia;P.x=L.x;P.y=L.y+60;}`); step(2,{}); ok(R(`(V19T.farm||[]).length`)>=2,'drogaria sem zumbis');
  R(`for(const e of V19T.farm)killEnemy(e);`); step(2,{}); ok(R(`!!v19S('farmacia').lim`),'drogaria não ficou limpa');
  g=g0(); talk('farmacia'); ok(R(`v19St('farmacia')`)===2&&g0()>=g+150,'drogaria');
  // carta (começa ao pegar)
  take('v19_carta'); ok(R(`v19St('carta')`)===1,'carta não começou ao pegar'); g=g0(); talk('carta'); ok(R(`v19St('carta')`)===2&&R(`invCount('joia')+G.box.filter(b=>b.id==='joia').length`)>0,'carta');
  take('v19_prancha'); g=g0(); talk('prancha'); ok(R(`v19St('prancha')`)===2&&g0()>=g+200,'prancha');
  take('v19_chaveBarco'); g=g0(); talk('barco'); ok(R(`v19St('barco')`)===2&&g0()>=g+250,'barco');
  for(let i=0;i<5;i++)take('v19_galao'+i); ok(R(`invCount('galao')`)===5,'galões '+R(`invCount('galao')`)); g=g0(); talk('gerador'); ok(R(`v19St('gerador')`)===2&&g0()>=g+400,'gerador');
  take('v19_cachaca0'); take('v19_cachaca1'); g=g0(); talk('cachaca'); ok(g0()===g+120&&R(`v19St('cachaca')`)===1,'pinga parcial');
  take('v19_cachaca2'); take('v19_cachaca3'); talk('cachaca'); ok(R(`v19St('cachaca')`)===2&&g0()>=g+340,'pinga');
  for(let i=0;i<3;i++)take('v19_vinil'+i); g=g0(); talk('vinil'); ok(R(`v19St('vinil')`)===2&&g0()>=g+300,'vinil');
  for(const k of ['foyer','uniBib','quadraUni']){R(`{const p=V19P['foto_${k}'];P.x=p.x;P.y=p.y;G.mode='play';G.prompt=findInteract();}`);ok(R(`G.prompt&&G.prompt.k==='v19'`),'sem foto '+k);A.doInteract();}
  ok(R(`v19S('fotos').fotos.length`)===3,'fotos'); g=g0(); talk('fotos'); ok(R(`v19St('fotos')`)===2&&g0()>=g+200,'fotos entregue');
  // escolta: o Seu Arlindo segue até a clínica
  R(`enemies=[];`); g=g0(); ok(R(`v19S('escolta').f`)===1,'Arlindo não segue');
  const c=R(`[V19P.clinicaBrava.x,V19P.clinicaBrava.y]`);
  {const d0=R(`(()=>{const n=npcs.find(n=>n.v19==='escolta');P.x=n.x+200;P.y=n.y;return n.x})()`);step(60,{});ok(R(`npcs.find(n=>n.v19==='escolta').x`)!==d0,'Arlindo não andou atrás');}
  R(`{const n=npcs.find(n=>n.v19==='escolta');const c=V19P.clinicaBrava;n.x=c.x+40;n.y=c.y;P.x=c.x+90;P.y=c.y;enemies=[];}`);
  for(let i=0;i<30&&R(`v19St('escolta')`)!==2;i++){step(1,{});finishTalk();}
  ok(R(`v19St('escolta')`)===2&&g0()>=g+250,'escolta '+R(`(()=>{const n=npcs.find(n=>n.v19==='escolta');return Math.hypot(n.x-V19P.clinicaBrava.x,n.y-V19P.clinicaBrava.y)|0})()`));
  ok(R(`V19M.every(m=>v19St(m.id)===2)`),'faltou missão: '+R(`V19M.filter(m=>v19St(m.id)!==2).map(m=>m.id).join(',')`));
  ok(R(`ACHS.has('v19todas')&&ACHS.has('pipoca')`),'conquistas das missões');
  // registro: estado das missões volta igual
  R(`{G.flags.v19m.pipoca.s=1;G.flags.v19m.fotos={s:1,fotos:['foyer']};G.flags.v19seg='fotos';globalThis.__s=JSON.parse(JSON.stringify(serialize()));G.flags.v19m={};loadState(__s);}`);
  ok(R(`v19St('pipoca')===1&&v19S('fotos').fotos.length===1&&G.flags.v19seg==='fotos'&&v19St('vinil')===2`),'missões não voltaram do registro');
  ok(R(`pickups.filter(p=>String(p.uid).startsWith('v19_')).length`)===0||R(`!pickups.some(p=>p.uid==='v19_carta')`),'item de missão voltou depois de pego');
  R(`G.flags.v19m={};`); A.newGame('normal'); G.mode='play';
  // tela de missões e botão na pausa
  R(`UI.pause();`); ok(R(`OV.innerHTML.includes('data-a="v19m"')`),'pausa sem Missões'); R(`UI.act('v19m',{});`); ok(R(`UI.cur`)==='v19m','tela de missões'); R(`UI.act('v19m-back',{});UI.close();G.mode='play';`);
  // rumo: com objetivo sem lugar, aponta para a missão seguida
  R(`{v19Start('vinil',true);G.flags.v19seg='vinil';}`); ok(R(`(()=>{const o=objective();return !o.at||o.at.x!=null})()`),'objetivo quebrado');
  // eventos: todos disparam sem erro e acabam
  R(`G.flags.walkie=true;enemies=[];`);
  const evs=R('V19EV'); ok(evs.length>=8,'menos de 8 eventos');
  const outdoor=R(`{const s=START;P.x=s.x;P.y=s.y+60;}[P.x,P.y]`);
  for(const k of evs){R(`V19E.cur=null;V19E.objs=[];G.mode='play';`);
    let started=false;
    for(let tries=0;tries<6&&!started;tries++){
      if(k==='pisca'||k==='telefone'){R(`{const b=buildings.find(b=>b.name==='Hotel Atlântida');P.x=tc(b.x+(b.w>>1));P.y=tc(b.y+(b.h>>1));const [x,y]=freeTileNear((P.x/32)|0,(P.y/32)|0,true);P.x=tc(x);P.y=tc(y);G.inB=bOfXY(P.x,P.y);}`);if(k==='telefone')R(`{const s=LM.cidaDoor;P.x=s.x;P.y=s.y-90;G.inB=bOfXY(P.x,P.y);}`);}
      else R(`{const s=LM.coreto;const [x,y]=freeTileNear(((s.x/32)|0)+${tries*3},((s.y/32)|0)+6,true);P.x=tc(x);P.y=tc(y);G.inB=bOfXY(P.x,P.y);}`);
      started=R(`v19EvStart('${k}')`);}
    ok(started,'evento não começou '+k);
    for(let i=0;i<20;i++){step(30,{});finishTalk();flush();P.hp=100;
      const o=R(`(V19E.cur&&V19E.cur.o&&!V19E.cur.o.gone)?1:0`);
      if(o){R(`{const o=V19E.cur.o;if(!(o.fall>0)){P.x=o.x;P.y=o.y+4;o.use();if(o.lido&&!o.gone)o.use();}}`);finishTalk();flush();}
      if(R('!V19E.cur'))break;
      if(k==='saqueador'){R(`{const s=V19E.cur.s;P.x=s.x+40;P.y=s.y;}`);}
    }
    if(R('!!V19E.cur'))R('V19E.cur.life=0;'),step(2,{}),finishTalk();
    ok(R('!V19E.cur'),'evento não acabou '+k);
  }
  // os eventos não aparecem no multiplayer nem em cena
  R(`V19E.cur=null;V19E.t=0;CUT.on=true;`); ok(R('v19Blocked()'),'evento durante cena'); R(`CUT.on=false;`);
  // agenda: com o tempo, algum evento acontece (e só um por vez)
  R(`{V19E.cur=null;V19E.t=0.01;G.ev.lastE=-999;enemies=[];const s=LM.coreto;const [x,y]=freeTileNear(((s.x/32)|0),((s.y/32)|0)+6,true);P.x=tc(x);P.y=tc(y);G.inB=-1;}`);
  let saw=false; for(let i=0;i<10&&!saw;i++){step(5,{});finishTalk();if(R('!!V19E.cur'))saw=true;else R('V19E.t=0.01;G.ev.lastE=-999;');}
  ok(saw,'agenda de eventos não disparou');
  R(`v19EvEnd();`);
  // menu de teste
  R(`v19Debug('v19m:all');v19Debug('v19m:done');`); ok(R(`V19M.every(m=>v19St(m.id)===2)`),'debug completar todas');
  R(`v19Debug('v19m:reset');`); A.UI.close&&A.UI.close(); G.mode='play';
  R(`G.flags.v19m={};V19E.cur=null;V19E.objs=[];`);
};
