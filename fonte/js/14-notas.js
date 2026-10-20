// ===================== NOTAS DA VERSÃO =====================
// Toda atualização entra aqui em cima. A primeira da lista é a versão atual do jogo.
const NOTAS=[
  {v:'1.16',d:'20/10/2026',t:'Adrenalina e correções',itens:[
    'Injeção de adrenalina: poucas espalhadas pelo mapa. Por 25 segundos você corre um pouco mais rápido e não cansa. Tem um indicador no canto da tela com o tempo que falta. Quando acaba, o Richard fica sem fôlego.',
    'Celular: o relógio não fica mais escondido atrás dos botões de cima, e a grade da maleta cabe inteira na tela. Em Camboriú, as lanternas de cultista que sumia não ficam mais acesas no chão.',
    'Som nas lutas de chefe corrigido: a música não liga e desliga mais toda hora (ela recomeçava do zero sempre que o chefe se afastava), e não dá mais estouro depois de um travadinha.',
  ]},
  {v:'1.15',d:'20/10/2026',t:'Conta na nuvem e launcher',itens:[
    'Conta na nuvem (opcional): no título, botão Conta na nuvem. Quem entra numa conta tem o registro guardado também na internet, e continua a partida em outro computador ou celular. Sem internet o registro fica na fila e sobe depois. Se o registro da nuvem for mais novo que o do aparelho, o jogo pergunta qual usar. Sem conta tudo continua igual, com o registro só no aparelho.',
    'Celular: o aplicativo agora se atualiza sozinho. Quando sai versão nova do jogo, ele baixa no Wi-Fi e troca na próxima vez que você abrir. Não precisa mais baixar o APK a cada atualização.',
    'Windows: launcher NightGetaway. Instala uma vez e o jogo novo chega sozinho pela internet, com as novidades de cada versão na tela.',
    'Menu de teste: seção 1.15 com a tela da Conta, envio do registro, a pergunta do conflito e a fila de envio.']},
  {v:'1.14',d:'19/10/2026',t:'Camboriú 2.0: o Cervo desperto',itens:[
    'Camboriú maior: Tiro de Guerra, frigorífico, cemitério do lado da Matriz, uma rua nova no centro e as casas das "oferendas", com bilhetes de quem ficou.',
    'Sargento Valença, do Exército: escondido e ferido no Tiro de Guerra. Ache a maleta do pelotão para ele e ele entra na luta final com você.',
    'O frigorífico: a maleta está na câmara fria, e lá dentro mora uma coisa que não morre. Só dá para fugir, batendo as portas atrás de você. Ela aparece uma vez só.',
    'Furtividade: chegue por trás de um cultista distraído e mate em silêncio. Arraste o corpo para esconder (se acharem, dão o alarme) ou vista o manto e ande disfarçado no meio deles.',
    'A missa da meia-noite: o sino toca três vezes, a cidade inteira entra na Matriz com velas e o Pregador fala de você no alto-falante.',
    'O Pregador aparece no seu caminho: na escadaria, no fim da rua, na porta da casa dele e no cemitério. E some.',
    'O Cervo em duas formas: depois da luta na igreja vem uma transformação, o teto cai e ele sai pela parede, enorme, caçando você pela cidade. O Nicolas atira do morro e o Sargento Valença entra na luta.',
    'Muito mais cutscenes no capítulo, sons demoníacos novos (rugido, coro ao contrário, grave que treme, coração, ossos, ganchos, sussurros) e, perto do fim da história, o drone do Nicolas mostra Camboriú depois do Cervo.',
    'Opções: intensidade do terror (menos sustos, normal ou mais sustos). No celular: guia dos controles na primeira vez (e em Opções).',
    'Online: aviso quando você e quem criou a sala estão em versões diferentes do jogo.',
  ]},
  {v:'1.13.1',d:'16/10/2026',t:'Revisão de falas e correções',itens:[
    'Ninguém fala mais de onde não está: o Matheus e o Edu não comentam nada em Camboriú (ou em qualquer lugar em que não estejam com você). Quando o amigo não está do lado, quem fala é o Richard.',
    'Em Camboriú não acontecem mais eventos de zumbi (gente presa embaixo de carro, sobrevivente fugindo de zumbi, chuva de cinza etc.) e a seta de missão secundária não puxa mais você para fora da cidade.',
    'O rojão não diz mais que é "do Nicolas" quando você acha um antes de conhecer ele, e o final só fala do Nicolas se você conheceu ele.',
    'Menu de teste: "Nicolas" agora leva ao morro de Camboriú.',
  ]},
  {v:'1.13',d:'16/10/2026',t:'Caos, missões e registros',itens:[
    'Aba Missões na mochila: a missão principal de agora com o lugar, a distância e a direção, a lista da história (sem spoiler do que vem), o que falta em Camboriú e todas as missões secundárias com "Seguir".',
    'Registros: 5 slots na máquina de escrever, e dá para exportar o registro num arquivo (.pssave) e importar em outro computador. No título, botão Registros.',
    'Depois do posto, caos total em Balneário: gente se matando na rua, gente pegando fogo, corpo caindo do prédio, carro explodindo e casas que explodem e ficam destruídas e fechadas para sempre.',
    'Os sobreviventes da rua (que não são da história) agora podem morrer pelas suas mãos. O Richard sente: o medo sobe, ele fala, e mais tarde ouve a voz de quem matou.',
    'Camboriú mais medieval e mais cruel: tochas na avenida e na fachada da Matriz, braseiros na praça, uma vela em cada porta, enforcados nas figueiras, corpos com velas, cabeças em estacas, gente fugindo dos cultistas (dá pra salvar) e oferecidos queimando em estacas.',
    'Missão da luneta mais livre: 10 balas, câmera ainda mais aberta, e você derruba quem quiser na praça. O sino não acaba mais a missão (traz mais gente). Q sai da luneta. Com o rifle na mão, fora da luneta, a câmera abre bem mais.',
    'Som: trilha ambiente nova que aparece e some (o silêncio também assusta), coro grave nas ruas de Camboriú, sustos menos frequentes, e o rangido de porta não parece mais gemido de zumbi.',
    'Correções: o Cervo não nasce de novo depois de morrer; a neblina não fica mais quadriculada nem presa na tela; a tela não pisca mais à toa (nem na luneta); a música do título não começa mais com a antiga.',
  ]},
  {v:'1.12',d:'16/10/2026',t:'Camboriú: a Congregação do Cervo',itens:[
    'Capítulo novo na história, depois da Universidade de BC: Camboriú. O Richard vai sozinho (Edu e Matheus ficam na Caçulinha do Marlon). Lá não tem zumbi: tem um culto, a Congregação do Cervo.',
    'Inimigos novos: cultistas de capuz com foice e lanterna (procuram em grupo e chamam os outros), vigias que tocam o sino se te veem, os Marcados (cultistas que viraram bicho, de quatro e com chifre) e o chefe, o Cervo, o Espécime T-03 da Vértice.',
    'A Igreja Matriz, a praça com as figueiras, o estádio, o açougue, a casa do Pregador nas Areias e o morro do Rio Pequeno. Vai e volta de chaves no estilo clássico do survival horror: três selos (sino, vela e cervo) abrem o portal da Matriz, com senha de cadeado escondida num caderno.',
    'O Nicolas agora aparece pela primeira vez em Camboriú (não mais na Brava), no morro com o rifle do irmão. Missão da luneta: a câmera abre a praça inteira, o drone dele marca os vigias, a lupa mostra o alvo de perto, e você segura a respiração para mirar. Se um vigia vê o outro cair, ele toca o sino.',
    'Depois disso o Nicolas te cobre do morro: cultista que grudar em você na rua cai sozinho. No fim, o rifle de precisão do irmão fica com o Richard (ele saiu do bloqueio da Vértice). Com o rifle na mão, a câmera abre para ver longe.',
    'Terror o tempo todo: rituais na rua (dá para salvar a vítima se for rápido), procissões cantando, gente pendurada nas árvores, símbolos que aparecem onde você acabou de passar, sussurros, o sermão no alto-falante que passa a falar seu nome, e o Cervo atravessando a rua lá longe. Tocar o sino começa a noite do ritual: os postes apagam e todo mundo sai de lanterna.',
    'Menu de teste: seção "1.12 · Camboriú" com atalho para cada parte do capítulo e para os eventos de terror.',
  ]},
  {v:'1.11',d:'16/10/2026',t:'O som do medo',itens:[
    'Todos os sons do jogo foram refeitos. Acabou o som de videogame antigo: agora o jogo cria cada som com camadas, eco e variações logo que abre.',
    'Tiros com estalo, pancada grave, eco batendo nos prédios e o estojo caindo no chão. Cada arma tem o seu som: pistola, .38, metralhadora, espingarda, cano duplo, Magnum, fuzil, rifle de precisão, silenciador, lança-granadas e besta.',
    'Zumbis com voz rouca de verdade e gemidos diferentes: o comum, o corredor rosnando, os grandes bem graves, os rastejantes gorgolejando, o cão latindo e rosnando. O som vem do lado em que o zumbi está e fica abafado de longe.',
    'Grito da Gritadeira, rugido dos chefes, gemido do Richard quando apanha, respiração, coração, passos, portas, madeira rangendo, vidro, explosões e trovão, tudo novo.',
    'Ambiente em camadas: chuva, vento e um zumbido grave. Dentro dos prédios a chuva fica abafada. Barulhos ao longe, sem aviso: grito, uivo, tiro distante, metal rangendo, vidro quebrando, alguém batendo na parede, passos atrás de você quando o medo está alto.',
    'Música de tensão: quando tem coisa te caçando, entram cordas desafinadas e um pulso de coração, que somem quando você despista.',
    'Música nova no menu (piano e cordas) e nos chefes (tambor, metais e bateria).',
  ]},
  {v:'1.10',d:'16/10/2026',t:'Mais medo, armas novas e amigos que lutam',itens:[
    'Visão em cone, inspirada em Darkwood: o que está atrás do Richard fica no escuro. Dá pra desligar em Opções.',
    'Falso morto: alguns corpos no chão levantam quando você passa do lado. Com muito medo, a mão treme na mira e a lanterna falha. No escuro, sozinho, dá pra ouvir passos que não são seus.',
    'Quatro armas novas: revólver .38 (guarita da Universidade, com munição; o Marlon avisa, é pro bicho do shopping), espingarda de cano duplo (casa do Seu Ivo), machado de incêndio (Bombeiros de Itajaí) e rifle de precisão com mira a laser (bloqueio da Vértice em Cabeçudas).',
    'Edu e Matheus lutam do jeito deles: o Edu chega pelo lado do zumbi, o Matheus cobre de trás, e os dois gritam pra puxar o zumbi que está em cima de você quando você está machucado.',
    'Marlon e Nicolas se mexem no heliponto: recuam, andam de lado e não ficam parados como estátua.',
    'Sargento Brandt mais difícil: mais vida, mira mais rápida, recarga mais curta e reforço a cada fase.',
    'O Mascate saiu do modo história (fica só no online), e zumbi não deixa mais dinheiro na história.',
    'Correções: a chuva de cinza não fica mais presa na tela; NPC parado numa porta ou trilha não trava mais o caminho (você empurra e ele volta pro lugar); o Perseguidor não aparece mais no flashback do Matheus, nos capítulos extras nem na Universidade; na Universidade a seta leva até o túnel de saída.',
    'Online: o intervalo da Horda agora é intervalo de verdade (a onda some e não nasce zumbi); jogando sozinho, a pausa pausa mesmo quando um amigo caiu sem avisar.']},
  {v:'1.9.3',d:'12/10/2026',t:'História mais coerente',itens:[
    'Começo menos pesado: a vizinhança da primeira faca, na cozinha do prédio da frente, não tem mais cães nem corredor. Antes eram 6 cães e 1 corredor perto do único lugar onde se pega arma, com o jogador desarmado.',
    'Matheus pede a pasta do Paciente Zero no Santa Clara depois de resgatado na Universidade, mas o objetivo da tela nunca levava até lá. Agora a seta leva (opcional, nada trava sem ela).',
    'Missões secundárias não aparecem mais misturadas em nenhuma luta ou fuga: Sargento Brandt, defesas, perseguições e contagens. Antes só o pavio e a biblioteca estavam cobertos.']},
  {v:'1.9.2',d:'12/10/2026',t:'Setas que faziam sentido',itens:[
    'Esgoto: com 1 ou 2 fusíveis da bomba na mão, a seta apontava para o quadro de energia. Agora ela aponta para o fusível que ainda falta.',
    'Missões secundárias não roubam mais a seta nos momentos de pressa: pavio da dinamite aceso e defesa da biblioteca. Antes a seta mandava o jogador para o outro lado do mapa no meio da contagem.',
    'Nesses dois momentos o texto da missão secundária também não aparece mais misturado com o aviso da contagem regressiva.']},
  {v:'1.9.1',d:'12/10/2026',t:'Cabe no celular',itens:[
    'Celular deitado: o menu do título não corta mais em cima. Antes o "Novo jogo" e os primeiros botões sumiam e não dava pra chegar neles.',
    'Celular deitado: os botões do título ficam em duas colunas e tudo cabe na tela sem rolar.',
    'Qualquer janela maior que a tela agora rola desde o começo, em vez de esconder a parte de cima.',
    'Menu de teste: seção 1.9.1 com a tela de título, a dificuldade e uma medição dos botões.']},
  {v:'1.9',d:'11/10/2026',t:'Capítulos extras',itens:[
    'Nota no final, de S a D: tempo, mortes, registros, sobreviventes salvos e dificuldade, com os pontos de cada um na tela.',
    'Novo Jogo+: depois de zerar, recomeça com armas, melhorias, dinheiro e maleta. Infectados mais fortes e rápidos, os piores aparecem cedo, chefões aguentam mais, e tem um epílogo novo no fim.',
    'Dificuldade Pesadelo (libera na primeira vitória): quase nada no chão, mordida que dói, Perseguidor cedo, e salvar gasta Fita de tinta.',
    'Roupas: 11 roupas novas pro Richard e a turma (título e pausa), liberadas por conquista, nota S ou compradas no Mascate. Prêmios da nota S: faca, lanterna e munição infinitas no Jogo+.',
    'Capítulos extras no título. Capítulo da Sonia: Navegantes, mesma noite, sem arma nenhuma; fuja, esconda-se, jogue garrafa e escape do Balseiro até a balsa ou o amanhecer.',
    'Capítulo do Prof. Rese: Itajaí, 22h31, antes do Richard chegar. Recolha as provas, descubra quem tocou o sino da Matriz, segure o Mercado Público com os feirantes e enfrente o Fiscal do Mercado.',
    '12 missões secundárias novas (o cachorro Pipoca, a insulina da Dona Zuleica, a antena do Seu Osni, a drogaria do Seu Haroldo, os discos do DJ Tavinho e mais) com botão Missões na pausa.',
    '9 eventos aleatórios novos: caixa de paraquedas, rádio com mochila escondida, luzes piscando, telefone tocando, chuva de cinza, zumbi amarrado, saqueador, caixa de som chamando a horda, fita de câmera.',
    'Correções: o Mascate não vende mais arma que está no baú, a corrida do celular desliga numa partida nova, o dinheiro aparece separado na maleta.']},
  {v:'1.8.3',d:'10/10/2026',t:'Caído é caído',itens:[
    'Multiplayer: quem cai não atira, não anda, não recarrega, não se cura e não joga granada. Antes dava pra continuar atirando caído, e a cura fazia os amigos verem você de pé enquanto a sua tela dizia "Caído".',
    'Menos atraso: o jogo prevê pra onde os zumbis e os amigos estão indo (usando o ping de cada um) e as atualizações chegam 20 vezes por segundo. O ping aparece no canto da tela (pro convidado, o dele e o do anfitrião).',
    'Caiu a internet? O convidado volta sozinho pra mesma vaga, com arma, maleta e vida, em menos de 1 segundo depois que a conexão volta. Se o anfitrião cair, a equipe espera ele por até 1 minuto em vez de acabar a partida.',
    'Internet que some sem avisar agora é percebida em uns 12 segundos (antes a tela ficava parada pra sempre).',
    'Pausa, maleta, Mascate ou trocar de janela não congelam mais a partida dos amigos. Com o menu aberto o mundo continua (e o dano também). Na Horda sozinho a pausa ainda pausa.',
    'Item ou dinheiro disputado: se dois pegam ao mesmo tempo, só um leva (antes os dois ganhavam).',
    'Todo mundo vê as explosões, as chamas, o cuspe e as pedras dos zumbis; o lança-chamas do convidado acende o zumbi; quem sai some da tela de todos; placar não conta em dobro.',
    'Quem entra com a partida rolando cai no modo certo (Noite Zero ou Horda), perto da turma, sem os itens que já foram pegos.',
    'Menos mensagens pela rede: lança-chamas e submetralhadora não derrubam mais ninguém do servidor.',
    'Celular: o jogo no navegador do celular agora usa o tamanho certo da tela (antes ficava tudo miúdo); aviso de "Caído", lista da equipe e ping cabem com o celular em pé.',
    'Menu de teste: "Cair agora" e "Testar servidores".']},
  {v:'1.8.2',d:'10/10/2026',t:'Servidor no Brasil',itens:[
    'Multiplayer: servidor novo na Cloudflare, dentro do próprio site, rodando na América do Sul. Ping bem menor e ele não dorme mais: acabou a espera de "acordando o servidor".',
    'O servidor antigo (Render) ficou de reserva: se o novo não responder, o jogo usa ele sozinho. Quem entra pelo código procura a equipe nos dois.',
    'Menu de teste: "Testar servidores" mostra o ping do novo e do de reserva.']},
  {v:'1.8.1',d:'10/10/2026',t:'Mais justo',itens:[
    'Horda e Noite Zero mais justas: o começo é leve (poucos zumbis, quase só os lentos, enquanto vocês só têm pistola) e aperta aos poucos. Nas primeiras ondas não vem mais aquela multidão.',
    'Horda: ondas 1 a 3 são de aquecimento; a vida dos zumbis só começa a subir a partir da onda 4, e os chefões das primeiras rodadas ficaram mais fracos.',
    'A partida começa sem os zumbis da cidade em cima da turma.',
    'Mais dinheiro: os zumbis deixam cair dinheiro mais vezes e em quantidade maior, e cada etapa vencida dá um bônus pra cada um (na Horda, cresce a cada onda). Começa com mais dinheiro também.',
    'Volume: barras separadas de Efeitos e Música, nas Opções e na Pausa.',
    'Multiplayer: quem não é o anfitrião agora vê o sangue dos tiros, o espirro quando o zumbi leva bala e as poças de sangue quando ele morre.']},
  {v:'1.8',d:'10/10/2026',t:'O Mascate',itens:[
    'O Mascate: um vendedor com carrinho na praça, na Barra Sul, na Universidade de BC e em Itajaí. Compra e vende munição, cura, granada, pilha, faca nova, armas e maleta maior.',
    'Dinheiro: os zumbis deixam cair notas (os grandes e os chefões, bem mais). De vez em quando cai uma joia, que o Mascate paga R$ 500. O dinheiro não ocupa espaço na maleta.',
    'Modo Horda: ondas sem fim, cada vez mais fortes, com chefão a cada 5 ondas e o Mascate aparecendo no intervalo. Dá pra jogar sozinho (botão Modo Horda no título) ou com a equipe (escolha Horda no multiplayer).',
    'Ranking: o recorde da Horda vai pro site (nightgetaway.net.br/ranking), separado entre sozinho e em equipe.',
    'Multiplayer: quem cai fica 30 segundos no chão. Um amigo chega perto e segura Usar pra levantar. Se ninguém vier, levanta sozinho perto da turma.',
    'Multiplayer: frases rápidas ("Socorro!", "Preciso de munição!", "Vem aqui!", "Chefão!"). No PC: Z, X, V e B. No celular: o botão de balão lá em cima. Aparece em cima do boneco e marca no minimapa.',
    'Multiplayer: minimapa com a turma em tempo real, os zumbis por perto, o chefão, o Mascate e o objetivo.',
    'Multiplayer: placar no fim com quem matou, caiu e levantou mais, e títulos como "Carregou o time" e "Morreu primeiro, de novo". Fica salvo na conta.',
    'Multiplayer: explosões acertam os amigos também, e tudo que aparece no chão (caixa quebrada, item largado, dinheiro) aparece pra todo mundo.',
    'Celular: mira assistida. A mira puxa de leve pro zumbi mais perto da direção que você aponta (dá pra desligar em Opções).',
    'Quick time do Brandt: clique do mouse e o botão Usar não contam mais como erro; vale só a tecla certa ou o botão certo na tela.',
    'Menu de teste: seções 1.8 com dinheiro, joias, loja, Horda, cair/levantar, frases, ranking e mira.']},
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
    'Maleta de verdade, com espaço: cada coisa fica onde você colocou. Escolha o item, toque em Mover e depois no lugar da grade. Girar deita ou levanta. Organizar arruma tudo sozinho.',
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
    'Inventário em maleta (cada coisa ocupa espaço): tudo ocupa espaço, inclusive as armas. Acabou o limite de 3 armas. Armas podem ficar no baú.',
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
