'use strict';
// ===================== CONSTANTES E UTILIDADES =====================
const TILE = 32, W = 210, H = 470, CW = 60;
// abaixo da superfície: a galeria pluvial (linhas H..HT-1). O mapa da superfície continua com H linhas.
const HS = 232, HT = H + HS;   // H..H+81: galeria · H+82..: BR-101 e Universidade de BC
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}
let rnd = mulberry32(1);
const R = () => rnd();
const ri = (a,b) => a + Math.floor(R()*(b-a+1));
const pick = a => a[Math.floor(R()*a.length)];
const rpick = a => a[Math.floor(Math.random()*a.length)];
const rr = (a,b) => a + Math.random()*(b-a);
const clamp = (v,a,b) => v<a?a:v>b?b:v;
const lerp = (a,b,t) => a+(b-a)*t;
const hyp = Math.hypot;
function wpick(w, rf=Math.random){let s=0;for(const k in w)s+=w[k];let r=rf()*s;for(const k in w){r-=w[k];if(r<=0)return k;}return Object.keys(w)[0];}
function angDiff(a,b){let d=b-a;while(d>Math.PI)d-=Math.PI*2;while(d<-Math.PI)d+=Math.PI*2;return d;}
const DIRS4 = [[1,0],[-1,0],[0,1],[0,-1]];
const DIRS8 = [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]];

// ===================== TILES =====================
const T = {GRASS:0,ROAD:1,SIDE:2,WOOD:3,TILEF:4,WALL:5,WATER:6,DIRT:7,PIER:8,BORDER:9,PROP:10,TREE:11,FENCE:12,GATE:13,CAR:14,CONC:15,SAFE:16,GRAVEL:17,RUBBLE:18,CARPET:19,SAND:20,ROCK:21,FOREST:22,SHUTTER:23,WINDOW:24};
const SOLID = new Uint8Array(32);
[T.WALL,T.WATER,T.BORDER,T.PROP,T.TREE,T.FENCE,T.GATE,T.CAR,T.RUBBLE,T.ROCK,T.FOREST,T.SHUTTER,T.WINDOW].forEach(t=>SOLID[t]=1);
const BULLET_BLOCK = new Uint8Array(32);
[T.WALL,T.BORDER,T.GATE,T.CAR,T.RUBBLE,T.ROCK,T.FOREST,T.SHUTTER,T.WINDOW].forEach(t=>BULLET_BLOCK[t]=1);
const LIGHT_BLOCK = new Uint8Array(32);
[T.WALL,T.BORDER,T.RUBBLE,T.ROCK,T.FOREST,T.SHUTTER].forEach(t=>LIGHT_BLOCK[t]=1);

// ===================== REGIÕES (de norte para sul, como no mapa real) =====================
const DISTRICTS = [
  {name:'Porto de Itajaí', short:'Porto', mx:110, y0:0, y1:31, cap:20, count:42,
   spawn:{zumbi:4,corr:4,cusp:3,brut:2,incha:2,rast:1,esfol:2,soldado:1},
   loot:{m9:6,cart:4,m357:2,ervaV:3,ervaR:2,spray:1,polv:3,polvF:3,comb:3,g40:2,gran:1.2,pilha:2,virote:1}},
  {name:'Itajaí, Centro Histórico', short:'Itajaí', mx:60, y0:32, y1:71, cap:18, count:52,
   spawn:{zumbi:6,corr:3,cusp:2,incha:2,brut:1,cao:2,esfol:1},
   loot:{m9:6,cart:4,m357:1.5,ervaV:3,ervaR:2,polv:3,polvF:2,comb:1.5,g40:1.5,gran:1,pilha:2,spray:.6}},
  {name:'Cabeçudas', short:'Cabeçudas', mx:160, y0:72, y1:81, cap:10, count:8,
   spawn:{zumbi:5,cao:3,rast:2},
   loot:{m9:4,cart:2,ervaV:3,polv:2,pilha:2,virote:1}},
  {name:'Praia Brava', short:'Brava', mx:110, y0:82, y1:139, cap:15, count:54,
   spawn:{zumbi:7,corr:3,cao:2,rast:2,esfol:1},
   loot:{m9:3,cart:1.5,ervaV:4,ervaR:2,polv:3,polvF:1,pilha:4,virote:3}},
  {name:'Estrada da Rainha', short:'Estrada', mx:150, y0:140, y1:158, cap:18, count:14,
   spawn:{zumbi:7,corr:4,cao:3,incha:1},
   loot:{m9:1,ervaV:3,pilha:3}},
  {name:'Barra Norte', short:'Barra Norte', mx:104, y0:159, y1:243, cap:15, count:46,
   spawn:{zumbi:7,corr:2,incha:1,cusp:1,rast:2,cao:1},
   loot:{m9:1.2,ervaV:4,ervaR:1,polv:2,pilha:5}},
  {name:'Centro de Balneário Camboriú', short:'Centro', mx:104, y0:244, y1:327, cap:16, count:60,
   spawn:{zumbi:8,corr:2,incha:1,cusp:1,rast:2},
   loot:{m9:1.2,ervaV:4,ervaR:1.5,polv:2,pilha:5,m357:.15}},
  {name:'Barra Sul', short:'Barra Sul', mx:104, y0:328, y1:393, cap:13, count:36,
   spawn:{zumbi:9,rast:2,cao:1},
   loot:{m9:.8,ervaV:4,ervaR:1,polv:2,pilha:5}},
  {name:'Praia das Laranjeiras', short:'Laranjeiras', mx:140, y0:394, y1:469, cap:12, count:26,
   spawn:{zumbi:6,afog:3,rast:2,cao:1},
   loot:{m9:.8,ervaV:3,ervaR:1,polv:2,pilha:4,cart:.4}},
];
const LOOTQ = {pilha:[1,2],virote:[3,6],m9:[5,11],cart:[3,6],m357:[3,6],comb:[40,80],g40:[1,3],gran:[1,1],ervaV:[1,1],ervaR:[1,1],polv:[2,4],polvF:[1,3],spray:[1,1]};

// ===================== ITENS =====================
const ITEMS = {
  m9:{n:'Munição 9mm',s:'9mm',c:'#c9a24a',st:60,k:'ammo',d:'Balas para a pistola e a submetralhadora.'},
  cart:{n:'Cartuchos',s:'CART',c:'#b5492f',st:24,k:'ammo',d:'Cartuchos calibre 12 para a escopeta.'},
  m357:{n:'Munição .357',s:'.357',c:'#c7c2b4',st:12,k:'ammo',d:'Munição pesada para o revólver Magnum. Atravessa vários alvos.'},
  comb:{n:'Combustível',s:'COMB',c:'#d0702c',st:200,k:'ammo',d:'Tanque de combustível para o lança-chamas.'},
  g40:{n:'Granada 40mm',s:'40mm',c:'#8a9a4a',st:8,k:'ammo',d:'Projétil explosivo para o lança-granadas.'},
  pilha:{n:'Pilhas',s:'PILHA',c:'#8fb0d0',st:4,k:'battery',d:'Carrega a lanterna. Use aqui na mochila quando a luz começar a falhar.'},
  virote:{n:'Virotes',s:'VIROTE',c:'#9a8460',st:20,k:'ammo',d:'Flechas curtas para a besta. Não fazem barulho nenhum.'},
  gran:{n:'Granada de mão',s:'GRAN',c:'#6d7a3e',st:5,k:'throw',d:'Arremesse com G ou com o botão Granada. Explode depois de um segundo.'},
  ervaV:{n:'Erva verde',s:'ERVA',c:'#4f9a4a',st:1,k:'heal',h:30,d:'Recupera um pouco de saúde. Duas ervas juntas curam mais. Combine em Fabricar.'},
  ervaR:{n:'Erva vermelha',s:'ERVA',c:'#b03a3a',st:1,k:'mix',d:'Sozinha não faz nada. Junto com uma erva verde, cura completamente.'},
  misVV:{n:'Mistura verde',s:'MIX',c:'#3f8a46',st:1,k:'heal',h:65,d:'Duas ervas verdes moídas. Recupera bastante saúde.'},
  misVR:{n:'Mistura verde e vermelha',s:'MIX',c:'#a8603a',st:1,k:'heal',h:999,d:'Recupera toda a saúde.'},
  spray:{n:'Spray de primeiros socorros',s:'SPRAY',c:'#d6d2c6',st:1,k:'heal',h:999,d:'Recupera toda a saúde.'},
  polv:{n:'Pólvora',s:'PÓLV',c:'#8a8070',st:10,k:'craft',d:'Use em Fabricar para montar munição.'},
  polvF:{n:'Pólvora forte',s:'PÓLV+',c:'#a8704e',st:10,k:'craft',d:'Pólvora de alta potência. Use em Fabricar.'},
  fusivel:{n:'Fusível',s:'FUSÍV',c:'#d8cc50',st:1,k:'key',d:'Fusível de alta corrente. Serve no quadro de força da Delegacia, na Quinta Avenida.'},
  cartao:{n:'Cartão da Vértice',s:'CARTÃO',c:'#d6d6d0',st:1,k:'key',d:'Cartão de acesso da Vértice. Abre o bloqueio de Cabeçudas, no caminho para Itajaí.'},
  heliKey:{n:'Cartão do heliponto',s:'HELI',c:'#d55a4a',st:1,k:'key',d:'Cartão de acesso ao heliponto do Porto de Itajaí.'},
  bateria:{n:'Bateria',s:'BAT',c:'#5a7ad8',st:1,k:'key',d:'Bateria de 12 volts. O Tião precisa dela para ligar o jipe.'},
  inibidor:{n:'Inibidor V-7',s:'V-7',c:'#5ad0a0',st:1,k:'key',d:'Ampola refrigerada da Vértice. A Helena precisa disso para não virar.'},
  garrafa:{n:'Garrafa vazia',s:'GARRAFA',c:'#6a9a7a',st:6,k:'throw',d:'Jogue longe com o botão de arremesso: quebra fazendo barulho e chama a atenção deles pra lá. Prepare na mochila para arremessar no lugar da granada.'},
  alicate:{n:'Alicate de corte',s:'ALICATE',c:'#c84a3a',st:1,k:'key',d:'Corta corrente e cadeado. A saída dos fundos do Santa Clara está acorrentada.'},
  diesel:{n:'Galão de diesel',s:'DIESEL',c:'#c98a2a',st:1,k:'key',d:'Diesel do gerador do resort. A clínica da Helena está sem energia.'},
  cartaoMestre:{n:'Cartão mestre do resort',s:'MESTRE',c:'#c9a24a',st:1,k:'key',d:'Abre qualquer porta de serviço do Resort Brava Mar.'},
  chaveMaq:{n:'Chave da casa de máquinas',s:'CHAVE',c:'#b8b2a0',st:1,k:'key',d:'Chave da casa de máquinas do Shopping Atlântico. É lá que ficam os disjuntores das portas.'},
  dinamite:{n:'Dinamite de pesca',s:'DINAM.',c:'#c8402a',st:1,k:'key',d:'Três bananas amarradas com fita isolante e um pavio. Do Seu Ivo. Dá pra abrir a barricada da Estrada da Rainha.'},
  silenciador:{n:'Silenciador',s:'SILENC.',c:'#6a6e72',st:4,k:'mod',d:'Rosqueia no cano da pistola. O tiro vira um estalo seco. Gasta depois de uns 40 tiros.'},
  chaveOnibus:{n:'Chave do ônibus 22',s:'CHAVE',c:'#c8b84a',st:1,k:'key',d:'Chaveiro da Viação Catarinense, ônibus 22. Tinha gente batendo no vidro desse ônibus.'},
  chaveCasa:{n:'Chaves do condomínio',s:'CHAVES',c:'#7aa0c8',st:1,k:'key',d:'Molho de chaves da guarita. A etiqueta mais gasta diz: CASA 4.'},
  chaveDir:{n:'Chave da diretoria',s:'CHAVE',c:'#a8905a',st:1,k:'key',d:'Uma chave com etiqueta: DIRETORIA. Colégio Estadual.'},
  detector:{n:'Detector de presença',s:'DETEC',c:'#5ad0a0',st:1,k:'key',d:'Aparelho da Vértice. Apita quando alguma coisa se mexe por perto, mesmo atrás de parede. Gasta pilha rápido. Ligue no botão Detector (tecla T).'},
  gato:{n:'Mingau, o gato',s:'GATO',c:'#e0a860',st:1,k:'key',d:'Um gato laranja muito irritado. É o Mingau da Dona Cida.'},
};
const RECIPES = [
  {need:{ervaV:2}, give:['misVV',1]},
  {need:{ervaV:1,ervaR:1}, give:['misVR',1]},
  {need:{polv:2}, give:['m9',15]},
  {need:{polv:1,polvF:1}, give:['cart',5]},
  {need:{polvF:2}, give:['m357',4]},
  {need:{polvF:3}, give:['g40',2]},
];

// ===================== ARMAS =====================
const WEAPONS = [
  {id:'faca',n:'Faca de cozinha',melee:true,dmg:22,rate:.38,range:46},
  {id:'pistola',n:'Pistola 9mm',ammo:'m9',mag:12,dmg:21,rate:.24,spread:.035,speed:980,reload:1.2,pellets:1,crit:.12,noise:420,kick:2,knock:60,life:.7,len:13},
  {id:'escopeta',n:'Escopeta',ammo:'cart',mag:6,dmg:12,rate:.85,spread:.34,speed:820,reload:2.0,pellets:8,crit:0,noise:620,kick:7,knock:150,life:.36,len:20},
  {id:'smg',n:'Submetralhadora',ammo:'m9',mag:30,dmg:12,rate:.075,spread:.11,speed:1020,reload:1.7,pellets:1,crit:.05,noise:520,kick:1.4,knock:30,life:.6,len:16},
  {id:'magnum',n:'Revólver Magnum',ammo:'m357',mag:6,dmg:100,rate:.75,spread:.01,speed:1350,reload:2.1,pellets:1,crit:.1,pierce:3,noise:720,kick:9,knock:220,life:.8,len:15},
  {id:'chamas',n:'Lança-chamas',ammo:'comb',mag:100,flame:true,dmg:4,rate:.045,reload:2.4,noise:260,kick:.3,len:20},
  {id:'lgran',n:'Lança-granadas',ammo:'g40',mag:4,explosive:true,dmg:140,rate:.9,speed:620,reload:2.6,noise:800,kick:6,len:20},
  {id:'besta',n:'Besta',ammo:'virote',mag:1,dmg:85,rate:.35,spread:.004,speed:1150,reload:1.05,pellets:1,crit:.25,pierce:1,noise:0,kick:2,knock:110,life:.9,len:18,bolt:true},
  {id:'maos',n:'Mãos nuas',melee:true,dmg:4,rate:.55,range:40,shove:true},
];

// ===================== INIMIGOS =====================
const ETYPES = {
  zumbi:{n:'Zumbi',hp:46,spd:40,dmg:12,r:12,col:'#4f5a46',skin:'#8a9474',sight:250},
  corr:{n:'Corredor',hp:32,spd:100,dmg:9,r:11,col:'#5b3d33',skin:'#a07a62',sight:310},
  incha:{n:'Inchado',hp:85,spd:32,dmg:18,r:17,col:'#56632c',skin:'#9aa64a',sight:220},
  cusp:{n:'Cuspidor',hp:55,spd:55,dmg:12,r:12,col:'#33493e',skin:'#6f9a7e',sight:340},
  cao:{n:'Cão infectado',hp:26,spd:128,dmg:7,r:10,col:'#4a3b30',skin:'#6e5646',sight:330},
  brut:{n:'Brutamontes',hp:290,spd:58,dmg:28,r:20,col:'#4a3936',skin:'#8b6e64',sight:300},
  rast:{n:'Rastejante',hp:36,spd:38,dmg:10,r:11,col:'#4a4436',skin:'#7c7460',sight:110},
  pers:{n:'O Perseguidor',hp:900,spd:64,dmg:34,r:21,col:'#1b1e20',skin:'#5a5550',sight:99999},
  grita:{n:'Gritadeira',hp:34,spd:46,dmg:8,r:11,col:'#4a3a44',skin:'#a89a90',sight:300},
  soldado:{n:'Soldado infectado',hp:82,spd:44,dmg:14,r:12,col:'#3d4a2f',skin:'#86907a',sight:270},
  manequim:{n:'Manequim',hp:70,spd:150,dmg:16,r:12,col:'#cfc5b2',skin:'#e0d6c4',sight:0},
  afog:{n:'Afogado',hp:72,spd:38,dmg:15,r:13,col:'#33494c',skin:'#86a09c',sight:240},
  esfol:{n:'Esfolado',hp:120,spd:72,dmg:20,r:13,col:'#6a2624',skin:'#b0524a',sight:0,blind:true},
  gordo:{n:'O Frentista',hp:700,spd:30,dmg:26,r:34,col:'#56632c',skin:'#a2ae52',sight:300,boss:true},
  enferm:{n:'A Enfermeira',hp:1000,spd:60,dmg:30,r:30,col:'#c8c2b4',skin:'#8f7068',sight:340,boss:true},
  pescador:{n:'O Pescador',hp:1300,spd:46,dmg:32,r:34,col:'#2a3a3c',skin:'#7c9894',sight:340,boss:true},
  bombeiro:{n:'O Bombeiro',hp:1100,spd:68,dmg:34,r:18,col:'#2e2418',skin:'#5a3a2a',sight:360},
  ouvinte:{n:'O Ouvinte',hp:99999,spd:58,dmg:55,r:20,col:'#8a7a70',skin:'#c8b4a4',sight:0,blind:true},
  especime:{n:'O Espécime',hp:1500,spd:64,dmg:30,r:30,col:'#b8b0a4',skin:'#d8cfc2',sight:420,boss:true},
  boss:{n:'A Abominação',hp:2600,spd:50,dmg:38,r:40,col:'#3a2830',skin:'#8a5a5a',sight:99999},
};

const DIFFS = {
  facil:{n:'Fácil',ehp:.75,dmg:.6,loot:1.45,phd:.7,d:'Mais munição e inimigos mais fracos. Bom para conhecer a cidade.'},
  normal:{n:'Normal',ehp:1,dmg:1,loot:1,phd:1,d:'A experiência pensada: munição contada, cada tiro importa.'},
  dificil:{n:'Difícil',ehp:1.3,dmg:1.45,loot:.75,phd:1.3,d:'Pouca munição e mordidas que doem. Para quem já escapou uma vez.'},
};

// ===================== ARQUIVOS (documentos) =====================
const DOCS = [
  {t:'Caderno do Richard', b:`Segunda, 23h40.\n\nSaí do corujão de jogo na casa do Gui. A moto morreu no meio da Avenida Brasil e eu entrei no primeiro prédio com luz. Uma senhora, a Dona Cida, abriu a porta e me puxou pra dentro.\n\nLá fora as pessoas não são mais pessoas. Andam devagar, mordem, não sentem nada. A Avenida Atlântica, que nunca dorme, está em silêncio.\n\nO celular morreu às 22h30. A última mensagem que chegou foi do Gui: \"tá vendo isso?\"\n\nO rádio fala em evacuação pelo Porto de Itajaí. Entre aqui e lá: a Barra Norte, a Estrada da Rainha, a Praia Brava, Cabeçudas. A pé, ninguém chega.\n\nNão tenho arma. Não tenho nada. A Dona Cida disse: luz apagada, passo leve. Eles enxergam mal no escuro. Mas escutam.\n\nE ela disse outra coisa: de dia eles se escondem nos prédios, no escuro dos apartamentos. De noite saem todos pra rua.`},
  {t:'Bilhete do padre', b:`Irmãos, não temam o que vem da noite, porque...\n\n(o resto está riscado)\n\nTranquei a igreja com quem conseguiu chegar. Às três da manhã já não eram as mesmas pessoas.\n\nA faca do churrasco ficou atrás do altar, para o caso de Deus estar ocupado. Não é muito. Quebra fácil. Use com fé.`},
  {t:'Bilhete na geladeira', b:`Amor, fui buscar a Bia na escola. Dizem que tem gente doente no Centro, não sai de casa.\n\nTem erva no vaso da sacada, aquela verde que a sua mãe plantou. Se a febre subir, mói duas juntas que faz mais efeito. A vermelha sozinha não serve pra nada, mas misturada com a verde levanta até defunto.\n\n(Espero que não literalmente.)\n\n— Lu`},
  {t:'Comunicado da Prefeitura', b:`COMUNICADO OFICIAL — BALNEÁRIO CAMBORIÚ\n\nO surto de "gripe cinza" está sob controle.\n\nA Estrada da Rainha e os acessos à BR-101 estão bloqueados pelo Exército. A evacuação de civis será feita exclusivamente pelo Porto de Itajaí.\n\nEvite contato com pessoas de pele acinzentada e olhar fixo. Os abrigos com luz verde são seguros: eles não entram lá.\n\nMantenha a calma.`},
  {t:'Recado do gerente', b:`Sônia,\n\nO fusível reserva do quadro geral está no depósito, no fundo do mercado, atrás da última gôndola. A Delegacia pediu emprestado ontem, mas eu não entreguei: eles nunca devolvem nada.\n\nAh, e mudei a senha do cofre que alugamos no banco da Terceira Avenida. Agora é 4072. Não anota em lugar nenhum.\n\n(Eu sei, eu sei.)\n\n— Valdir`},
  {t:'Relatório do Oficial Bastos', b:`Ocorrência 0417.\n\nIndivíduo de aproximadamente 2,30 m, sobretudo escuro, chapéu, visto na Avenida Atlântica. Resistiu a mais de 40 disparos. Não fala. Não corre. Não para.\n\nParece procurar alguém. Uma colega de Itajaí falou que ele segue sinais de rádio.\n\nO arsenal está trancado: a trava é elétrica e o quadro de força queimou o fusível. Lá dentro ficou a minha pistola reserva e o rádio da viatura. O resto do armamento o Exército levou.`},
  {t:'Extrato estranho', b:`LABORATÓRIOS VÉRTICE S.A. — UNIDADE PORTO DE ITAJAÍ\nDepósitos mensais: R$ 3.200.000,00\nReferência: "Projeto Cepa Cinza, fase de campo — litoral"\n\nAnotação a lápis do caixa:\n"Perguntar ao gerente por que um laboratório paga aluguel por duas cidades inteiras."`},
  {t:'Memorando Vértice', b:`CONFIDENCIAL — USO INTERNO\n\nA Cepa Cinza apresenta 100% de reanimação motora em até seis horas.\n\nEfeitos observados: agressividade; acúmulo de ácido em hospedeiros obesos (rompem ao morrer); hipertrofia muscular em hospedeiros sob estresse (investidas em linha reta, perdem o equilíbrio ao bater em paredes).\n\nO protótipo T-Sobretudo foi liberado para recuperar amostras. Ele não deve ser confrontado. Ele não pode ser destruído, apenas atrasado.`},
  {t:'Bilhete do frentista', b:`Seu Tião,\n\nGuardei a bateria nova pro seu jipe aqui no posto da Avenida do Estado, no depósito da conveniência, e passei o cadeado de três números. O senhor sabe o código: é o número da bomba onde o Gordo trabalha, repetido três vezes.\n\nSe o senhor ainda estiver vivo, vem buscar. E cuidado com o Gordo do caixa. Ele passou mal ontem e agora não para de crescer. Fica parado no meio das bombas, inchando. Se apagar a lanterna e andar devagar, ele não vê.\n\n— Juninho`},
  {t:'Diário do guarda-vidas', b:`Posto 3, Barra Norte.\n\n23h40 — O mar está parado. Nunca vi o mar parado assim.\n\n01h15 — Corpos chegando na areia. Alguns ainda se mexem.\n\n02h30 — O Exército fechou a Estrada da Rainha com uma barricada de carros, no fim da Terceira Avenida. Ouvi o sargento dizer que só passa ali quem tiver um veículo pesado e coragem.\n\nEu não tenho nenhum dos dois.`},
  {t:'Prontuário: paciente zero', b:`Clínica da Brava — atendimento noturno.\n\nPaciente: masculino, 34 anos, operário da unidade Vértice do Porto de Itajaí.\nFebre de 41 °C, pele acinzentada.\n\n22h10 — óbito.\n22h16 — o paciente se levantou e mordeu a enfermeira Clara.\n\nA Dra. Helena guardou o cartão de acesso da Vértice. Disse que é a única forma de passar pelo bloqueio de Cabeçudas.`},
  {t:'Ordem militar 06-B', b:`PROTOCOLO DE ESTERILIZAÇÃO\n\nApós a decolagem do último voo de evacuação, Balneário Camboriú e Itajaí serão neutralizadas por bombardeio.\n\nÚltimo voo de evacuação: chamar pelo rádio do heliponto do Porto de Itajaí. A aeronave precisa de 90 segundos de aproximação. A área deve ser mantida segura durante esse tempo.\n\nCivis infectados não embarcam.`},
  {t:'Bilhete rabiscado', b:`Se você está lendo isso, presta atenção.\n\nAs coisas sem pele, as vermelhas que andam de quatro: elas NÃO ENXERGAM. Ouvem tudo.\n\nSe correr, elas vêm. Se atirar, elas vêm. Se andar devagar, passa do lado e elas nem viram a cabeça.\n\nO Beto não acreditou. A prancha dele ainda está ali fora.`},
  {t:'Relatório T-Abominação', b:`LABORATÓRIOS VÉRTICE — UNIDADE PORTO DE ITAJAÍ\n\nO espécime T-Abominação escapou da contenção do subsolo às 01h50.\n\nComportamento: atraído por sinais de rádio de alta potência. Ataque em área (golpe no chão) e projeção de ácido em leque.\n\nRecomendação: NÃO acionar o rádio do heliponto antes da extração da equipe Vértice.\n\n(Ninguém da equipe Vértice voltou.)`},
  {t:'Plantão do hospital', b:`HOSPITAL RUTH CARDOSO — PLANTÃO NOTURNO\n\nA Vértice entregou o último lote do inibidor V-7 aqui às 21h. Está na geladeira da farmácia, ala leste.\n\nA chefe da enfermagem foi a primeira a se aplicar uma dose. Não funcionou do jeito que deveria. Levaram ela junto com o lote, amarrada numa maca.\n\nA escopeta da segurança está no armário da ala oeste. Boa sorte.`},
  {t:'Recado no mirante', b:`Riscado na grade do mirante do Morro do Careca:\n\n"Daqui dá pra ver tudo. Balneário apagado, a Brava apagada.\nSó o porto de Itajaí ainda tem luz.\nSe tem luz, tem gente.\nVou pra lá."\n\nEmbaixo, com outra letra: "ele não foi."`},
  {t:'Guia de transferência', b:`HOSPITAL RUTH CARDOSO — FARMÁCIA\nGuia de transferência nº 0093\n\nMaterial: inibidor V-7, lote completo (14 ampolas)\nDestino: Drogaria do Shopping Atlântico, ponto de coleta da Vértice\nAutorizado por: Dr. R. Arantes, Laboratórios Vértice S.A.\n\nEmbaixo, a caneta, com a letra tremida:\n"Vieram de roupa branca e levaram tudo. Disseram que o shopping é o ponto de recolhimento. Disseram que o contêiner do átrio não pode ser aberto de jeito nenhum."`},
  {t:'Relatório da segurança', b:`SHOPPING ATLÂNTICO — CENTRAL DE SEGURANÇA\n\n23h50 — Quatro pessoas da Vértice entraram pela doca de carga. Trouxeram um contêiner e deixaram no átrio. Disseram: não abram, não encostem. Se ouvirem batidas lá dentro, saiam do prédio.\n\n01h10 — Estão batendo lá dentro.\n\n01h40 — A câmera 4 mostra os manequins da loja de roupas em outro lugar. Revisei a gravação três vezes. Eles só mudam de posição quando a câmera falha.\n\nSe você está lendo isso: não tira a lanterna deles. Eles só andam quando ninguém está olhando.\n\n02h05 — Se o sistema baixar as portas de enrolar, só o painel da casa de máquinas destrava. Fica na ala de serviço, no fundo do shopping. A chave está no claviculário aqui da segurança.`},
  {t:'Lista da Defesa Civil', b:`ABRIGO PROVISÓRIO — GINÁSIO MUNICIPAL\n\n00h30 — 112 pessoas cadastradas. Faltam colchonetes.\n01h15 — Primeiros casos de febre. Isolamos no canto da arquibancada.\n02h00 — Não deu tempo de isolar.\n\nQuem estiver deitado nos colchonetes: não acorde ninguém. Passa devagar. Eles dormem de olho aberto.`},
  {t:'Diário do Cabo Nunes', b:`Barricada da Estrada da Rainha.\n\nA ordem é clara: ninguém sai de Balneário. Nem a pé, nem de carro, nem chorando.\n\nÀs duas da manhã passou um comboio da Vértice. Abrimos a barricada pra eles. Pra eles abriram.\n\nO sargento mandou recuar pro porto ao amanhecer. Deixamos tudo. Deixamos o Peixoto, que foi mordido. Ele ainda está andando aqui no acampamento, de capacete.`},
  {t:'Bilhete do coveiro', b:`Trinta anos cuidando desse cemitério e nunca vi um morto se mexer. Até essa noite.\n\nNão foi debaixo da terra, foi em cima: o povo que trouxeram pra enterrar às pressas, deitado entre as lápides.\n\nDe dia eles ficam quietos. De noite, qualquer barulho levanta a fileira inteira.`},
  {t:'Ordem de recolhimento', b:`LABORATÓRIOS VÉRTICE S.A. — EQUIPE DE CAMPO 3\nResponsável: Dr. R. Arantes\n\n1. Recolher todo o inibidor V-7 distribuído em Balneário Camboriú.\n2. Ponto de coleta: Shopping Atlântico, doca de carga, Av. Brasil.\n3. Se houver testemunhas civis, liberar o Espécime T-07 do contêiner do átrio.\n\nO T-07 caça pelo movimento e pelo som. Salta antes de atacar. Não desperdice munição tentando segurá-lo: ele só para quando cai.`},
  {t:'Livro de hóspedes', b:`RESORT BRAVA MAR — RECEPÇÃO\n\nQuarto 104: "Batidas no quarto do lado a noite inteira."\nResposta, letra do gerente: "O 107 sou eu. Desculpem. Não abram a porta."\n\nEmbaixo, escrito com força:\n"Paulo, se você ainda estiver aí: o cartão mestre ficou no 107, em cima da cama. É o único que abre a casa de máquinas. O diesel do gerador está lá. A Dra. Helena precisa dele pra clínica não apagar."`},
  {t:'Registro do Santa Clara', b:`HOSPITAL SANTA CLARA — NECROTÉRIO\n\nPaciente 31. Cega desde o primeiro dia. A audição ficou absurda: escuta a gente respirando do outro lado da parede.\n\nEla cresceu. Quebrou todas as lâmpadas do segundo bloco. Anda pelos corredores sem esbarrar em nada.\n\nBala não faz efeito. Já tentaram.\n\nSe precisar passar: ande devagar, não corra, não atire. Jogue alguma coisa longe. Uma garrafa, qualquer coisa. Ela vai até o barulho.\n\nA porta dos fundos está acorrentada. O alicate está na manutenção.`},
  {t:'Recado na lousa', b:`COLÉGIO ESTADUAL — SALA 4\n\n(escrito com giz, letra tremida)\n\n"A diretora trancou a sala dela com os remédios e o rádio dentro e foi embora. A chave ficou com o seu Valdir, o zelador.\n\nO seu Valdir foi mordido na quadra. Ele ainda anda por lá. Macacão laranja. Molho de chaves na cintura.\n\nNinguém aqui tem coragem."`},
  {t:'Flyer da Ressaca', b:`RESSACA CLUB — SEXTA SEM FIM\nOpen bar até as 4h · DJ convidado\n\nNo verso, de caneta:\n"O som ainda tá ligado no painel do DJ. Se alguém ligar, todos eles vão pra pista. TODOS. Foi assim que eu consegui sair pelos fundos.\nO dinheiro do caixa e as coisas do segurança ficaram no escritório, atrás da pista."`},
  {t:'Diário de obra', b:`OBRA — RESIDENCIAL MAREA, 32 ANDARES\nMestre de obras: Josué\n\n00h20 — O guindasteiro desceu da cabine gritando que tinha gente subindo pela estrutura. Gente não sobe por fora.\n\n01h00 — Os cachorros da obra pararam de latir. Depois voltaram. Diferentes.\n\n01h30 — Deixei a pólvora da demolição e os sinalizadores no contêiner do escritório. Quem achar, use.`},
  {t:'Quadro da rodoviária', b:`RODOVIÁRIA DE BALNEÁRIO CAMBORIÚ\n\nÚLTIMA PARTIDA: 23h55 — FLORIANÓPOLIS — CANCELADA\nÚLTIMA PARTIDA: 00h10 — CURITIBA — CANCELADA\n\nAviso colado no vidro do guichê:\n"O Exército fechou a BR. Os ônibus vão ficar aqui. Quem estava dentro, fica dentro. NÃO ABRAM AS PORTAS DOS ÔNIBUS."`},
  {t:'Diário da casa 4', b:`Condomínio Morada da Brava, casa 4.\n\nO Exército passou de madrugada recolhendo arma de todo mundo. A nossa eles não acharam: está no fundo falso do armário do escritório, com a munição que o Paulo comprava escondido.\n\nO Paulo foi ver o barulho na guarita e não voltou. O segurança disse que as câmeras mostram ele ainda andando pela rua. Andando torto.\n\nSe alguém achar isso: a chave está com o segurança. A gente foi pelo mato até Itajaí.`},
  {t:'Ficha do acervo', b:`MUSEU HISTÓRICO DE ITAJAÍ\n\nPeça 112: revólver do coronel, calibre .357, restaurado e funcional (não deveria estar).\n\nA vitrine tem fechadura eletrônica de quatro dígitos. A senha é o ano em que Itajaí virou município. Quem esquecer, a placa da praça da Matriz lembra.`},
  {t:'Bilhete do operador', b:`ESTAÇÃO MATA ATLÂNTICA — PARQUE UNIPRAIAS\n\nDesliguei a linha às 23h30 com duas cabines no ar. Tinha gente dentro. Eles batiam no vidro e eu não conseguia trazer de volta sem energia.\n\nO gerador auxiliar que alimenta a estação de baixo fica na cozinha do Rancho, nas Laranjeiras. Se alguém religar, a linha volta.\n\nDeixei o silenciador do vigia no armário. Ele não vai mais precisar. Ele está lá embaixo, na trilha. Andando.`},
  {t:'Caderno do Seu Ivo', b:`Colônia Z-7.\n\nA Rosa foi mordida na mão limpando peixe. Coisa pequena. Ela dorme desde a tarde.\n\nTranquei a porta do quarto porque ela fala dormindo. Fala coisa que não é dela.\n\nOs meninos saíram com os dois barcos às dez da noite. Disseram que voltavam pra buscar a gente ao amanhecer.\n\nA dinamite está comigo. Pra quem precisar abrir caminho. Eu não vou a lugar nenhum sem a Rosa.`},
  {t:'Promessa na capela', b:`Escrito na parede, atrás da imagem de Nossa Senhora dos Navegantes:\n\n"Os barcos voltaram às duas da manhã. Sem ninguém dentro. Só a água vermelha no fundo.\n\nO mar está trazendo eles de volta. Um por um. Andando pela areia.\n\nSe alguém ler: não espera o barco. Não espera ninguém."`},
];
