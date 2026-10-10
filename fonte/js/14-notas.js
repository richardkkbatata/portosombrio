// ===================== NOTAS DA VERSÃO =====================
// Toda atualização entra aqui em cima. A primeira da lista é a versão atual do jogo.
const NOTAS=[
  {v:'1.7.1',d:'10/10/2026',t:'Mais zumbi, menos tela',itens:[
    'Celular: botão de correr. Toque pra ligar ou desligar. O direcional não corre mais sozinho quando vai até a borda.',
    'Celular: tela mais limpa. Os botões ficam só com o ícone (os nomes aparecem só no começo) e cada um só aparece quando serve pra algo: Curar só com item de cura, Recarga só com o pente faltando bala, Arma só com mais de uma arma, Jogar só com granada ou garrafa.',
    'Celular: editor de controles (Opções > Editar controles). Arraste qualquer botão ou direcional pra onde quiser e deixe maior ou menor. Fica salvo, separado com o celular em pé e deitado.',
    'Multiplayer: a Noite Zero virou matança. Ondas de zumbi em volta da turma e três chefões: O Frentista, O Espécime e A Abominação. Quanto mais gente, mais zumbi e chefão mais forte.',
    'Multiplayer: munição e erva pra todo mundo a cada etapa vencida, vida do chefão aparece pra todos, cuspe e pedra de inimigo agora acertam os amigos também, e a lista da equipe ficou menor.',
    'A Univali agora se chama Universidade de BC no jogo.',
    'Correções: itens não duplicam mais ao carregar o registro, pilha de munição pega pela metade não enche de novo ao carregar, itens largados no chão e o loot do Brandt não somem mais ao carregar, o clima é salvo, e os cegos do esgoto acordam do jeito certo.',
    'Correções: o flashback do Matheus não começa mais no meio de um carro, agarrão ou quick time; a turma, os eventos e os sustos do Richard param durante a lembrança; resgate embaixo do carro não termina mais com a pessoa já morta; portão da biblioteca da universidade abre certo depois dos pulos do menu de teste.',
    'Menu de teste: seção 1.7.1 com editor de controles, corrida, horda e chefão da Noite Zero.']},
  {v:'1.7',d:'10/10/2026',t:'Servidor próprio',itens:[
    'Multiplayer com servidor do Porto Sombrio: o código de 4 letras agora passa pelo nosso servidor, então dá pra jogar com os amigos de qualquer lugar, cada um na sua internet.',
    'Se o servidor estiver dormindo, o jogo acorda ele sozinho (pode levar até 1 minuto na primeira partida).',
    'Se o servidor estiver fora do ar, o jogo usa os serviços antigos, e o modo sem internet continua lá.',
    'Campo "Servidor" no fim da tela do multiplayer, caso o endereço mude.',
    'Menu de teste: botão "Testar servidor", que mostra se conectou e o ping.']},
  {v:'1.6.2',d:'09/10/2026',t:'Rede teimosa',itens:[
    'Multiplayer: pra achar a equipe pelo código de 4 letras, o jogo agora tenta 3 serviços diferentes ao mesmo tempo. Se a rede bloquear um, usa outro.',
    'Multiplayer: modo sem internet. Se nenhum serviço responder, dá pra conectar na mesma Wi-Fi trocando um código longo (Criar equipe sem internet / Entrar sem internet).',
    'A mensagem de erro agora diz o que fazer.']},
  {v:'1.6.1',d:'09/10/2026',t:'Código da equipe',itens:[
    'Multiplayer: acabou o código gigante. Quem cria a equipe recebe um código de 4 letras (tipo EA4K); os amigos digitam e entram. Precisa de internet só pra se acharem.',
    'Multiplayer: zumbi morto morre pra todo mundo. Antes, quem não era o anfitrião matava só na tela dele e continuava apanhando do zumbi "fantasma".',
    'Multiplayer: item pego some pra todo mundo, e o que cai dos zumbis aparece pra todos.',
    'Maleta: segure o item e arraste até o lugar. Verde cabe, vermelho não. Enquanto arrasta, R, a rodinha do mouse ou um segundo dedo gira o item. Toque rápido continua selecionando.']},
  {v:'1.6',d:'09/10/2026',t:'Noite Zero',itens:[
    'Multiplayer local (beta): até 5 pessoas na mesma rede Wi-Fi, cada uma com um dos amigos: Richard, Edu, Matheus, Marlon ou Nicolas. Sem servidor: quem cria a sala manda um código de convite e o amigo devolve um código de resposta (dá pra mandar pelo WhatsApp).',
    'Noite Zero: uma história curta só do multiplayer, da Oficina do Tião até a biblioteca da Universidade de BC. Quem cai levanta perto de um amigo. Não mexe no seu jogo solo nem no registro.',
    'Conta: ao abrir o jogo você cria sua conta com nome, apelido, cor, personagem preferido e uma frase. Ela aparece no lobby e em cima do seu boneco no multiplayer. Por enquanto fica salva no aparelho.',
    'Flashback: depois da Universidade de BC, o Matheus conta o que viu no porto às 19h do primeiro dia. Você joga como ele, com o Seu Zé, até o contêiner T-00 abrir.',
    'Clima que muda sozinho: chuva fina, tempestade (os zumbis enxergam menos e ouvem menos), neblina e apagão geral na cidade.',
    'A região da BR-101 e da Universidade de BC ficou bem mais clara durante o dia.',
    'Brava: binóculo no mirante pra ver a cidade de longe e um barco encalhado na areia pra revistar (cuidado com quem ainda está lá dentro).',
    'Universidade de BC: missões pequenas. Junte as três folhas da prova do Rese e entregue na Sala 102, devolva o fone do Matheus que ficou no Bloco 9 e veja o que sobrou da formatura no Foyer.',
    'Conquistas novas e menu de debug atualizado com clima, flashback, missões e multiplayer.']},
  {v:'1.5.1',d:'09/10/2026',t:'Maleta de verdade',itens:[
    'Maleta estilo RE4 de verdade: cada coisa fica onde você colocou. Escolha o item, toque em Mover e depois no lugar da grade. Girar deita ou levanta. Organizar arruma tudo sozinho.',
    'Se uma coisa não couber do jeito que está, o jogo avisa que dá pra arrumar a maleta pra caber.',
    'Ícones novos desenhados pra cada item, no tamanho que ele ocupa: munição, ervas, spray, granada, garrafa, pilha, pólvora e outros.',
    'Quick time do Brandt mais difícil: mais rápido, o anel aparece em lugares diferentes da tela e o botão muda a cada golpe (E, Q, F, Espaço ou R). No celular aparecem três botões e só um é o certo.',
    'Galeria: pra sair, é só subir a escada no fim do sifão. Não precisa mais empurrar a tampa.']},
  {v:'1.5',d:'09/10/2026',t:'A Turma da Universidade de BC',itens:[
    'Região nova: a BR-101 destruída e o campus da Universidade de BC em Balneário Camboriú, com os blocos de verdade (1 a 10, o Bloco 3 redondo, a quadra, a praça, as torres e os estacionamentos). Fica do outro lado do túnel no fim da Avenida do Estado.',
    'Missão obrigatória no capítulo 2: o Marlon e o Matheus estão presos na biblioteca do Bloco 6A. O Matheus agora começa na Universidade de BC e vai com você até o fim.',
    'Gente nova: Seu Ademir (segurança da Universidade de BC), Dona Neusa (cantina), Cabo Juliana (Exército, na BR), Kadu e Bia (surfistas da Brava) e Seu Lauro (roda-gigante).',
    'No Santa Clara, no lugar do Matheus, tem a pasta do Paciente Zero pra pegar.',
    'Brandt: o quick time ficou mais longo e virou luta de verdade, com quatro sequências (faca, desarme, parede e judô), finalização em câmera lenta e um visual novo pra ele, no retrato e visto de cima.',
    'Caçulinha do Marlon, perto da BR. O Richard pega no pé do Matheus, o Edu ficou mais quieto e sarcástico, e o Nicolas fala de política pelo rádio.',
    'Mais terror: gente presa embaixo de carro (dá pra tentar salvar), gente arrastada pro escuro e a primeira queda de prédio garantida no caos de Balneário.',
    'Lugares famosos com missão: tirar o Seu Lauro da roda-gigante e acender o Cristo Luz.',
    'Brava: acampamento dos surfistas com fogueira e violão, onde o medo baixa. Na volta, ele não está mais lá.',
    'Menu de teste reorganizado em abas: Novidades, Jogador, Itens, História, Chefes, Personagens, Lugares, Inimigos, Medo, Mundo e Final.']},
  {v:'1.4',d:'09/10/2026',t:'O Caçador e a Galeria',itens:[
    'Missão nova no capítulo 1: o bondinho morreu, e o caminho até as Laranjeiras é a galeria pluvial que sai do Shopping Atlântico.',
    'Luta contra o Sargento Brandt, da Vértice: laser antes da rajada, granada de fumaça, voz nos alto-falantes e corpo a corpo no tempo certo. Quando ele recarregar, é a sua vez.',
    'Fase nova: Galeria Pluvial do Rio Camboriú, com os Cegos da galeria, o quebra-cabeça dos fusíveis e o das comportas.',
    'T-11, o Coletor: uma perseguição em que não dá pra lutar, só fugir.',
    'Inventário em maleta (estilo RE4): tudo ocupa espaço, inclusive as armas. Acabou o limite de 3 armas. Armas podem ficar no baú.',
    'Acessibilidade: tamanho das legendas, tremor da câmera, clarões e modo daltônico (em Opções).',
    'A chegada na Brava ficou mais calma. O Pescador agora aparece no litoral de Itajaí.',
    'Mais gente caindo dos prédios no caos de Balneário.',
    'Notas da versão dentro do jogo (esta tela).',
    'Menu de teste com uma seção nova para tudo da 1.4: Brandt, galeria, fusíveis, comportas, T-11, maleta e Pescador.']},
  {v:'1.3.2',d:'08/10/2026',t:'O Perseguidor',itens:[
    'Nova apresentação do Perseguidor, depois da conversa com a Helena na Brava.',
    'Correções pequenas e de estabilidade.']},
  {v:'1.3',d:'08/10/2026',t:'Sonia e a bancada',itens:[
    'Sonia, a namorada do Richard, dá dicas pelo rádio.',
    'Tutorial curto no apartamento da Dona Cida.',
    'Bancada de armas: melhore dano, recarga e munição com peças.',
    'Música de verdade no menu, nos chefes e no final.',
    'Marcação em tudo que dá pra interagir. Sprite novo para quando o Richard está agachado.',
    'O Marlon e o Nicolas fogem no helicóptero no final.']},
  {v:'1.2',d:'07/10/2026',t:'Marlon, Nicolas e o professor',itens:[
    'Marlon, Nicolas e o professor Alex Rese entram na história e ajudam a derrubar o chefe final, com escolhas que mudam o fim.',
    'Câmera automática. Manequins só na missão do shopping, e eles congelam quando você olha.',
    'Fuzil FAL pro final, dutos no Santa Clara, missões secundárias no mapa e mais eventos aleatórios.',
    'Mais difícil: menos zumbis, mas 20% mais fortes. A esquiva cansa.',
    'O menu de teste pede código.']},
  {v:'1.1',d:'07/10/2026',t:'Mais medo',itens:[
    'Correção do Richard sumindo da tela.',
    'Gente gritando por socorro, sustos psicológicos e som mais assustador.',
    'Portas que pedem esforço, uma ouvinte mais esperta no Santa Clara e cutscenes novas.']},
  {v:'1.0',d:'07/10/2026',t:'Lançamento',itens:['Primeira versão completa de Porto Sombrio: de Balneário Camboriú ao Porto de Itajaí.']},
];
const GAME_VER=NOTAS[0].v;
UI.notas=function(from){
  this.notasFrom=from||this.notasFrom||'title';
  const it=NOTAS.map((n,i)=>`<section class="nota${i===0?' nova':''}"><p class="kick">Versão ${n.v} · ${n.d}</p><h3>${esc(n.t)}</h3><ul>${n.itens.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></section>`).join('');
  this.open(`<div class="sheet wide"><div class="tabs"><p class="kick">Porto Sombrio ${GAME_VER}</p><h2 style="margin-right:auto">Notas da versão</h2><button class="btn ghost" data-a="notasback">Voltar</button></div>
    <div class="notas">${it}</div></div>`,'','notas');
  try{localStorage.setItem('ps-notas',GAME_VER);}catch(e){}
};
(function(){
  try{const st=document.createElement('style');st.textContent=`.notas{display:flex;flex-direction:column;gap:18px;max-height:min(70vh,640px);overflow:auto;padding-right:6px}
    .nota{border-left:2px solid var(--line);padding:2px 0 2px 14px}.nota.nova{border-left-color:var(--amber)}.nota h3{margin:2px 0 6px}
    .nota ul{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:5px;color:#cfc8b8;font-size:16px;line-height:1.4}`;document.head.appendChild(st);}catch(e){}
  const tt=UI.title.bind(UI);
  UI.title=function(){
    tt();
    try{const m=OV.querySelector('.menu');if(m){let novo=true;try{novo=localStorage.getItem('ps-notas')!==GAME_VER;}catch(e){}
      const b=document.createElement('button');b.className='btn';b.dataset.a='notas';b.dataset.from='title';b.textContent=novo?`Novidades da ${GAME_VER} ●`:'Notas da versão';m.appendChild(b);}
      const f=OV.querySelector('.foot');if(f)f.textContent=f.textContent.replace(/Versão [\d.]+/,'Versão '+GAME_VER);}catch(e){}
  };
  const pz=UI.pause.bind(UI);
  UI.pause=function(){pz();try{const m=OV.querySelector('.menu');if(m&&G.mode==='menu'){const b=document.createElement('button');b.className='btn';b.dataset.a='notas';b.dataset.from='pause';b.textContent='Notas da versão';const q=m.querySelector('[data-a=quit]');m.insertBefore(b,q||null);}}catch(e){}};
  const act=UI.act.bind(UI);
  UI.act=function(a,ds){
    if(a==='notas')return this.notas(ds.from);
    if(a==='notasback'){if(this.notasFrom==='pause'){G.mode='play';return this.pause();}return this.title();}
    return act(a,ds);
  };
})();
