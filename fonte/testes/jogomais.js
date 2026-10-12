// 1.9 · nota final, Novo Jogo+, Pesadelo e roupas
R(`localStorage.setItem('ps-jogomais','{}');localStorage.setItem('ps-roupas','{}');`);
// nota
ok(R(`jmNota({t:40*60,mortes:0,saves:3,salvos:5,diff:'normal'}).nota`)==='S','nota S perfeita no Normal');
ok(R(`jmNota({t:40*60,mortes:0,saves:3,salvos:5,diff:'facil'}).nota`)==='A','Fácil não passa de A');
ok(R(`jmNota({t:200*60,mortes:9,saves:30,salvos:0,diff:'normal'}).nota`)==='D','nota D');
ok(R(`jmNota({t:70*60,mortes:1,saves:6,salvos:2,diff:'dificil'}).nota`)==='A','nota A no Difícil: '+R(`jmNota({t:70*60,mortes:1,saves:6,salvos:2,diff:'dificil'}).pts`));
ok(R(`jmNota({t:100*60,mortes:2,saves:10,salvos:1,diff:'normal'}).nota`)==='C','nota C: '+R(`jmNota({t:100*60,mortes:2,saves:10,salvos:1,diff:'normal'}).pts`));
// mortes contam mesmo carregando o registro
R(`newGame('normal');G.mode='play';G.flags.tutDone=true;writeSave();die();`);
ok(R(`jmMortes()`)===1,'morte contada');
R(`loadState(readSave());G.mode='play';`); ok(R(`jmMortes()`)===1,'morte sobrevive ao carregar');
// fim: grava o que passa pro Jogo+
R(`P.owned[1]=true;P.mags[1]=7;G.flags.grana=1234;G.mw=10;G.flags.up={1:{dmg:1}};G.time=40*60;G.saves=2;G.st.saved=5;G.flags.mortes=0;localStorage.setItem('ps-jm-mortes','{}');G.mode='win';UI.win();`);
ok(R(`UI.cur`)==='win','tela final');
ok(R(`jmGet().clears`)===1&&R(`jmGet().unl.pesadelo`)===true,'primeira vitória libera Pesadelo');
ok(R(`jmGet().best.normal`)==='S','melhor nota gravada');
R(`UI.win();`); ok(R(`jmGet().clears`)===1,'tela final duas vezes não conta duas vitórias');
// Novo Jogo+ ida e volta
R(`UI.title();`); ok(R(`jmPode()`),'Jogo+ disponível');
R(`UI.act('jm-new',{});`); ok(R(`UI.cur`)==='diff'&&R(`UI.jmPend`)===true,'tela de dificuldade do Jogo+');
R(`UI.act('diff',{d:'normal'});`);
ok(R(`G.flags.jogomais`)===1,'Jogo+ ligado');
ok(R(`P.owned[1]&&P.mags[1]===7`),'arma e pente vieram');
ok(R(`grana()`)===1234&&R(`G.mw`)===10&&R(`G.flags.up[1].dmg`)===1,'dinheiro, maleta e melhorias vieram');
ok(R(`(()=>{const e=makeEnemy('zumbi',0,0,'teste');return e.max>ETYPES.zumbi.hp*1.2;})()`),'zumbi mais forte no Jogo+');
ok(R(`(()=>{const s=serialize();loadState(JSON.parse(JSON.stringify(s)));return G.flags.jogomais===1&&P.owned[1];})()`),'Jogo+ fica no registro');
// prêmios
R(`(()=>{const d=jmGet();d.prem={faca:true,lant:true,muni:true};jmSet(d);})();G.mode='play';P.owned[0]=true;P.dur=1;P.bat=5;P.w=1;P.mags[1]=0;CUT.on=false;update(.016);`);
ok(R(`P.dur`)>=30&&R(`P.bat`)===100,'faca e lanterna infinitas (nota S no Normal)');
ok(R(`P.mags[1]`)===0,'munição infinita trancada sem S no Difícil');
// Pesadelo: salvar gasta fita
R(`newGame('pesadelo');G.mode='play';`);
ok(R(`invCount('fita')`)===2,'Pesadelo começa com 2 fitas');
ok(R(`pickups.filter(p=>p.id==='fita').length`)>=2,'fitas raras no mundo: '+R(`pickups.filter(p=>p.id==='fita').length`));
R(`UI.save();UI.act('dosave',{});`); ok(R(`invCount('fita')`)===1&&R(`G.saves`)===1,'salvar gastou uma fita');
R(`UI.save();UI.act('dosave',{});UI.save();UI.act('dosave',{});`); ok(R(`invCount('fita')`)===0&&R(`G.saves`)===2,'sem fita não salva');
R(`UI.loja('c');`); ok(R(`LOJA.some(g=>g.jm&&g.it.some(e=>e.id==='fita'))`),'Mascate vende fita no Pesadelo');
R(`G.flags.grana=500;lojaComprar(LOJA.length-2+':0');`); ok(R(`invCount('fita')`)===1,'comprou fita');
R(`UI.close();G.flags.jipe=true;G.persT=0;updPers(.016);`); ok(R(`G.flags.persOn`)===true,'Perseguidor liga cedo no Pesadelo');
// roupas
R(`newGame('normal');G.mode='play';`);
ok(R(`roupaDe('richard')`)===null,'roupa padrão');
R(`UI.act('rp-sel',{c:'richard',k:'couro'});`); ok(R(`roupaDe('richard').id`)==='couro','roupa da nota S liberada e escolhida');
ok(JSON.parse(R(`localStorage.getItem('ps-roupas')`)).sel.richard==='couro','roupa salva no aparelho');
R(`UI.act('rp-sel',{c:'edu',k:'cinza'});`); ok(R(`roupaDe('edu')`)===null,'roupa do Mascate trancada antes de comprar');
R(`G.flags.grana=5000;UI.loja('c');{const gi=LOJA.findIndex(g=>g.g==='Roupas'),ei=LOJA[gi].it.findIndex(e=>e.roupa==='edu:cinza');lojaComprar(gi+':'+ei);}UI.act('rp-sel',{c:'edu',k:'cinza'});`);
ok(R(`roupaDe('edu').id`)==='cinza'&&R(`grana()`)===3500,'roupa comprada no Mascate');
R(`UI.roupas('title');spawnComp('edu',P.x+20,P.y);renderWorld();UI.close();`);
R(`localStorage.setItem('ps-jogomais','{}');localStorage.setItem('ps-roupas','{}');`);
R(`newGame('pesadelo')`);console.log('jogomais: fitas no mundo (Pesadelo)',R(`pickups.filter(p=>p.id==='fita').length`));R(`newGame('normal')`);
