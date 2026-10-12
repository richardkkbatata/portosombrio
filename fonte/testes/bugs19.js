// bugs19: correções da caça de bugs (1.8.3)
// Mascate: arma guardada no baú conta como sua (antes dava pra comprar de novo e ficava uma cópia presa no baú)
A.newGame('normal');G.mode='play';
R(`{P.owned[2]=true;P.mags[2]=6;mSync();boxWeaponAdd(2);G.flags.grana=5000;lojaComprar('3:0');}`);
ok(R('grana()')===5000&&!R('P.owned[2]')&&R(`G.box.filter(b=>b.id==='_w'&&b.w===2).length`)===1,'Mascate vendeu arma que já estava no baú');
R(`UI.loja('c');UI.close();G.mode='play';`);
// sem a arma no baú, continua comprando normal
R(`{G.box=G.box.filter(b=>b.id!=='_w');G.flags.grana=5000;lojaComprar('3:0');}`);
ok(R('P.owned[2]')||R('grana()')===5000,'Mascate parou de vender arma');
