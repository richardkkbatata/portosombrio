// Testes das contas na nuvem. Sobe o worker com `wrangler dev --local` e roda:
//   PS_URL=http://127.0.0.1:8787 node worker/test-conta.js
// Tem que terminar com TUDO OK.
const BASE = process.env.PS_URL || 'http://127.0.0.1:8787';
let falhas = 0, feitos = 0;

function ok(cond, nome, extra = '') {
  feitos++;
  if (cond) console.log('  ok  ' + nome);
  else { falhas++; console.log('  FALHOU  ' + nome + (extra ? ' -> ' + extra : '')); }
}
async function api(met, rota, corpo, token) {
  const h = { 'content-type': 'application/json' };
  if (token) h.authorization = 'Bearer ' + token;
  const r = await fetch(BASE + rota, { method: met, headers: h, body: corpo === undefined ? undefined : JSON.stringify(corpo) });
  let j = null; try { j = await r.json(); } catch {}
  return { st: r.status, j };
}
const nome = p => p + Math.random().toString(36).slice(2, 8);

(async () => {
  console.log('Contas em ' + BASE);

  // --- criar conta
  const u1 = nome('tester'), s1 = 'senha-bem-grande-1';
  let r = await api('POST', '/api/conta/criar', { usuario: u1, senha: s1, apelido: 'Teste 1' });
  if (r.st === 503) { console.log('\nD1 não está ligado (binding DB). Ligue o banco no wrangler.jsonc e rode de novo.'); process.exit(1); }
  ok(r.st === 200 && /^[0-9a-f]{64}$/.test(r.j?.token || ''), 'criar conta devolve token', JSON.stringify(r.j));
  const t1 = r.j.token;

  ok((await api('POST', '/api/conta/criar', { usuario: u1, senha: s1 })).st === 409, 'usuário repetido é recusado');
  ok((await api('POST', '/api/conta/criar', { usuario: 'ab', senha: s1 })).st === 400, 'usuário curto é recusado');
  ok((await api('POST', '/api/conta/criar', { usuario: nome('x'), senha: '123' })).st === 400, 'senha curta é recusada');
  ok((await api('POST', '/api/conta/criar', { usuario: nome('x'), senha: s1, email: 'nao-e-email' })).st === 400, 'e-mail inválido é recusado');

  // --- entrar
  r = await api('POST', '/api/conta/entrar', { usuario: u1, senha: s1 });
  ok(r.st === 200 && r.j.token && r.j.apelido === 'Teste 1', 'entrar com a senha certa');
  const t1b = r.j.token;
  r = await api('POST', '/api/conta/entrar', { usuario: u1, senha: 'errada-errada' });
  ok(r.st === 401 && r.j.erro === 'usuario-ou-senha', 'senha errada é recusada');
  r = await api('POST', '/api/conta/entrar', { usuario: nome('nao-existe'), senha: s1 });
  ok(r.st === 401 && r.j.erro === 'usuario-ou-senha', 'conta que não existe dá o mesmo erro (não entrega quem existe)');

  // --- quem sou eu / sem token
  r = await api('GET', '/api/conta/eu', undefined, t1);
  ok(r.st === 200 && r.j.usuario === u1 && !('senha_hash' in r.j), 'dados da conta sem a senha');
  ok((await api('GET', '/api/conta/eu')).st === 401, 'sem token é 401');
  ok((await api('GET', '/api/conta/eu', undefined, 'f'.repeat(64))).st === 401, 'token inventado é 401');

  // --- save
  const save = { capitulo: 3, hp: 77, itens: ['faca', 'pistola'] };
  r = await api('PUT', '/api/saves/porto-sombrio/1', { dados: JSON.stringify(save), versao_jogo: '1.14', resumo: 'Avenida Brasil' }, t1);
  ok(r.st === 200, 'gravar o slot 1');
  r = await api('GET', '/api/saves/porto-sombrio/1', undefined, t1);
  ok(r.st === 200 && JSON.parse(r.j.dados).hp === 77 && r.j.versao_jogo === '1.14', 'ler o slot 1 de volta');
  r = await api('PUT', '/api/saves/porto-sombrio/1', { dados: JSON.stringify({ ...save, hp: 10 }), versao_jogo: '1.14' }, t1);
  r = await api('GET', '/api/saves/porto-sombrio/1', undefined, t1);
  ok(JSON.parse(r.j.dados).hp === 10, 'gravar por cima do mesmo slot');
  ok((await api('GET', '/api/saves/porto-sombrio/4', undefined, t1)).st === 404, 'slot vazio é 404');
  r = await api('PUT', '/api/saves/porto-sombrio/9', { dados: '{}' }, t1);
  ok(r.st === 400 && r.j?.erro === 'slot-invalido', 'slot fora de 1..5 é recusado', JSON.stringify(r));
  r = await api('PUT', '/api/saves/porto-sombrio/2', { dados: 'x'.repeat(300 * 1024) }, t1);
  ok(r.st === 413, 'save gigante é recusado');
  r = await api('GET', '/api/saves?jogo=porto-sombrio', undefined, t1);
  ok(r.st === 200 && r.j.slots.length === 1 && r.j.slots[0].slot === 1, 'lista de slots');

  // --- extras
  ok((await api('PUT', '/api/extras/porto-sombrio', { extras: { horda: '27', som: '0.8' } }, t1)).st === 200, 'gravar extras');
  r = await api('GET', '/api/extras/porto-sombrio', undefined, t1);
  ok(r.j?.extras?.horda === '27', 'ler extras');

  // --- uma conta não lê a outra
  const u2 = nome('outro');
  r = await api('POST', '/api/conta/criar', { usuario: u2, senha: 'outra-senha-grande' });
  const t2 = r.j.token;
  ok((await api('GET', '/api/saves/porto-sombrio/1', undefined, t2)).st === 404, 'outra conta NÃO lê o save alheio');
  r = await api('GET', '/api/saves?jogo=porto-sombrio', undefined, t2);
  ok(r.j.slots.length === 0, 'outra conta vê a própria lista vazia');

  // --- apelido
  ok((await api('PUT', '/api/conta/apelido', { apelido: 'Richard' }, t1)).st === 200, 'trocar apelido');
  r = await api('GET', '/api/conta/eu', undefined, t1);
  ok(r.j.apelido === 'Richard', 'apelido novo aparece');

  // --- sair
  ok((await api('POST', '/api/conta/sair', {}, t1b)).st === 200, 'sair de uma sessão');
  ok((await api('GET', '/api/conta/eu', undefined, t1b)).st === 401, 'token da sessão encerrada não vale mais');
  ok((await api('GET', '/api/conta/eu', undefined, t1)).st === 200, 'a outra sessão continua valendo');

  // --- apagar a conta (LGPD)
  ok((await api('DELETE', '/api/conta', undefined, t1)).st === 200, 'apagar a conta');
  ok((await api('GET', '/api/conta/eu', undefined, t1)).st === 401, 'depois de apagar, o token não vale');
  r = await api('POST', '/api/conta/entrar', { usuario: u1, senha: s1 });
  ok(r.st === 401, 'depois de apagar, não dá para entrar');
  await api('DELETE', '/api/conta', undefined, t2);

  console.log(`\n${feitos} testes, ${falhas} falha(s)`);
  console.log(falhas ? 'TEM FALHA' : 'TUDO OK');
  process.exit(falhas ? 1 : 0);
})().catch(e => { console.error('erro no teste:', e); process.exit(1); });
