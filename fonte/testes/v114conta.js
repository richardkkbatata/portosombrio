// 1.14 · Conta na nuvem (save na nuvem, opcional). Aqui não tem internet (sem fetch no harness):
// testa o que é decidido no jogo — endereço da API, mensagens, token, fila, conflito e as telas.
module.exports=(A,R,ok,step,finishTalk,vm,ctx)=>{
  const G=A.G;
  A.newGame('normal');G.mode='play';

  // endereço da API: fora do site vai no domínio; o 'ps-nuvem' troca (serve pra testar local)
  R("nuEsquecer();NU.fila.length=0;nuFilaSalvar()");
  ok(R("nuBase()")==='https://nightgetaway.net.br','1.14 conta: fora do site a API é o domínio');
  R("localStorage.setItem('ps-nuvem','http://127.0.0.1:8790/')");
  ok(R("nuBase()")==='http://127.0.0.1:8790'&&R("nuURL('/api/conta/eu')")==='http://127.0.0.1:8790/api/conta/eu','1.14 conta: endereço de teste vale e tira a barra do fim');
  R("localStorage.setItem('ps-nuvem','')");
  ok(R("nuBase()")==='https://nightgetaway.net.br','1.14 conta: sem endereço de teste volta pro domínio');

  // erros em português, sem vazar código do servidor
  ok(/senha errad/i.test(R("nuErroTxt('usuario-ou-senha')"))&&/já existe/.test(R("nuErroTxt('usuario-existe')"))
    &&/internet/.test(R("nuErroTxt('sem-internet')"))&&/8 letras/.test(R("nuErroTxt('senha-curta')")),'1.14 conta: mensagens de erro em português');
  ok(R("nuErroTxt('coisa-nova')").length>0,'1.14 conta: erro desconhecido ainda dá mensagem');

  // sem conta: nada muda, e nada de senha guardada
  ok(!R("nuLogado()"),'1.14 conta: começa sem conta');
  ok(R("writeSave()"),'1.14 conta: salvar sem conta continua funcionando');
  ok(R("NU.fila.length")===0,'1.14 conta: sem conta não enfileira nada');

  // entrar (simulado: é o que o nuFetch devolveria) guarda só o token
  R("nuGuardar({token:'tk-teste',usuario:'richard',apelido:'Richard'})");
  ok(R("nuLogado()")&&R("localStorage.getItem('ps-nuvem-tok')")==='tk-teste','1.14 conta: token guardado');
  ok(R("[NU_TOK_KEY,NU_USER_KEY,NU_APEL_KEY,NU_FILA_KEY].join(',')").indexOf('senha')<0&&R("JSON.stringify(NU)").indexOf('senha')<0,'1.14 conta: senha nunca vai pro aparelho nem fica em memória');

  // salvar com conta: entra na fila (aqui não tem internet, então fica na fila)
  R("slotSet(2)");
  ok(R("writeSave()"),'1.14 conta: salvar com conta continua salvando no aparelho');
  ok(R("NU.fila.includes(2)"),'1.14 conta: sem internet o registro fica na fila');
  R("nuEnfileirar(2);nuEnfileirar(2)");
  ok(R("NU.fila.filter(n=>n===2).length")===1,'1.14 conta: a fila não repete o mesmo registro');
  ok(R("JSON.parse(localStorage.getItem('ps-nuvem-fila')).includes(2)"),'1.14 conta: a fila fica guardada pra tentar depois');

  // pacote mandado pro servidor
  const p=R("nuPacote(2)");
  ok(p&&typeof p.dados==='string'&&JSON.parse(p.dados).P&&p.resumo.length>0&&p.resumo.length<=30,'1.14 conta: pacote do save tem dados e resumo curto');
  ok(R("nuPacote(4)")===null,'1.14 conta: registro vazio não vira pacote');

  // datas: só pergunta quando a nuvem é de verdade mais nova
  ok(R("nuTsLocal(slotRead(2))")>0,'1.14 conta: o registro tem a hora exata');
  ok(R("nuTsLocal({meta:{quando:'16/10/2026, 21:30:00'}})")===new Date(2026,9,16,21,30,0).getTime(),'1.14 conta: hora de registro antigo sai do texto');
  ok(R("nuTsLocal(null)")===0&&R("nuTsLocal({})")===0,'1.14 conta: registro sem hora não quebra');
  ok(R("nuNuvemMaisNova(1000000,1000000+600000)")===true,'1.14 conta: nuvem 10 min mais nova pergunta');
  ok(R("nuNuvemMaisNova(1000000,1000000+10000)")===false&&R("nuNuvemMaisNova(1000000,0)")===false,'1.14 conta: diferença de segundos não pergunta');

  // telas
  R("NU.msg='';UI.nuvem('title')");
  ok(R("UI.cur")==='nuvem'&&/Registros na nuvem/.test(R("OV.innerHTML"))&&/Sair da conta/.test(R("OV.innerHTML")),'1.14 conta: tela da conta abre pra quem entrou');
  R("NU.slots=[{slot:2,resumo:'Centro · dia 1',versao_jogo:'1.14',atualizado:1760000000}];UI.nuvem('title')");
  ok(/Registro 2/.test(R("OV.innerHTML"))&&/Trazer pra c/.test(R("OV.innerHTML")),'1.14 conta: mostra os registros da nuvem');
  R("nuEsquecer();NU.msg='';UI.nuvem('title')");
  ok(/Criar conta/.test(R("OV.innerHTML"))&&/opcional/.test(R("OV.innerHTML"))&&/Entrar/.test(R("OV.innerHTML")),'1.14 conta: sem conta a tela oferece entrar/criar e avisa que é opcional');
  R("UI.act('nu-entrar',{})");
  ok(/letras, n/.test(R("OV.innerHTML")),'1.14 conta: usuário vazio dá recado, não erro');

  // conflito: pergunta, mostra as duas datas e não sobrescreve nada sozinho
  R("nuGuardar({token:'tk-teste',usuario:'richard',apelido:'Richard'});slotSet(2)");
  const antes=R("localStorage.getItem(slotKey(2))");
  R("UI.nuConf(2,Date.parse('2026-10-18T10:00:00'),{atualizado:Math.floor(Date.parse('2026-10-19T10:00:00')/1000),resumo:'Camboriú'})");
  ok(R("UI.cur")==='nuconf'&&/Neste aparelho/.test(R("OV.innerHTML"))&&/Na nuvem/.test(R("OV.innerHTML"))&&/18\/10\/2026/.test(R("OV.innerHTML"))&&/19\/10\/2026/.test(R("OV.innerHTML")),'1.14 conta: conflito mostra as duas datas');
  ok(R("localStorage.getItem(slotKey(2))")===antes,'1.14 conta: a pergunta do conflito não mexeu no registro do aparelho');
  R("UI.act('nu-confCancel',{})");ok(R("UI.cur")==='slots','1.14 conta: "deixar pra depois" volta pros Registros');

  // carregar o registro escolhendo o do aparelho funciona igual ao de antes
  R("UI.act('nu-usaLocal',{n:'2'})");
  ok(R("G.mode")==='play'&&!R("UI.cur"),'1.14 conta: escolher o do aparelho carrega o registro');

  // sem conta, abrir um slot não conversa com a nuvem (carrega direto)
  R("nuEsquecer();UI.slots('load');UI.act('slotLoad',{n:'2'})");
  ok(R("G.mode")==='play'&&!R("UI.cur"),'1.14 conta: sem conta o registro abre direto, como antes');

  // botão no título
  R("UI.title()");
  ok(/data-a="nuvem"|data-a=nuvem/.test(R("OV.innerHTML"))||R("!!OV.querySelector('[data-a=nuvem]')"),'1.14 conta: título tem o botão da conta');

  // menu de teste
  for(const k of ['nu:tela','nu:fila','nu:base','nu:conf','nu:esquece'])R(`UI.dbgAct(${JSON.stringify(k)},{})`);
  ok(true,'1.14 conta: botões do menu de teste rodam');

  // limpa pro resto dos testes
  R("nuEsquecer();NU.fila.length=0;nuFilaSalvar();NU.slots=null;NU.msg='';slotSet(1);UI.close();G.mode='play'");
};
