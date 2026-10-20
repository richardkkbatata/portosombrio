# Launcher do Windows — NightGetaway

Programa que a pessoa instala uma vez. Ele confere na internet se tem versão
nova do jogo, baixa sozinho, confere a segurança (sha256) e troca o arquivo.
Sem internet, abre a versão que já está no computador.

## O que tem nesta pasta

| Arquivo | O que é |
|---|---|
| `neutralino.config.json` | Configuração do programa (porta fixa 42071 e permissões). |
| `resources/index.html` | A tela do launcher (lista de jogos). |
| `resources/estilo.css` | A aparência: papel, carimbo, fita, CFTV. |
| `resources/launcher.js` | O miolo: catálogo, download, sha256, troca e reserva. |
| `resources/jogo.html` | A página que abre o jogo instalado. |
| `resources/neutralino.js` | Biblioteca oficial do Neutralino 5.4.0 (MIT), copiada do npm. |
| `resources/fonts/` | Special Elite, Caveat e League Gothic (as mesmas do site). |
| `teste/teste.js` + `teste/mock.js` | Teste no Playwright com um Neutralino de mentira. |

Fora desta pasta: `ferramentas/gerar_launcher.py` monta o programa.

## Como montar

```sh
python3 ferramentas/gerar_launcher.py
```

Ele pega o runtime do Neutralino (o `Porto Sombrio.exe` de dentro do zip
`site/downloads/porto-sombrio-*-windows.zip`), monta um `resources.neu` novo com
a tela do launcher e gera:

- `entregas/launcher-windows/NightGetaway.exe` + `resources.neu` + `LEIA-ME.txt`
- `entregas/nightgetaway-launcher-1.0.0-windows.zip` (é o que vai para a pessoa)

Conferir o pacote montado: `python3 ferramentas/gerar_launcher.py --conferir`
(relê o `.neu` e confere que o `index.html` e o `neutralino.config.json` estão certos).

## Como testar

```sh
env -u HTTPS_PROXY -u https_proxy node launcher/teste/teste.js
```

Sobe um servidor na porta 8792 com um catálogo e pacotes de mentira e testa:
sem internet, versão nova, sha256 errado, download interrompido, primeira
instalação, launcher velho (`launcher_min`), volta para a reserva, e o clique em
JOGAR. Termina com **TUDO OK**. Os screenshots ficam no diretório de rascunho.

## Como funciona por dentro

1. Lê `https://nightgetaway.net.br/launcher/catalogo.json`
   (gerado por `ferramentas/gerar_catalogo.py`, já existente).
2. Compara com `%LOCALAPPDATA%\NightGetaway\jogos\<id>\estado.json`.
3. Atualizar: baixa o `pacote_windows` mostrando a barra de progresso, confere
   o tamanho e o **sha256**, abre o zip (só aceita um `index.html` dentro),
   grava em `index.html.tmp`, renomeia o antigo para `anterior.html` e só então
   renomeia o `.tmp` para `index.html` (troca atômica).
4. Se qualquer coisa falhar, **nada é gravado** e a versão antiga continua.
5. O `estado.json` fica marcado com `tentativa: <versão nova>`. Essa marca só sai
   quando o jogo abre de verdade. Se o launcher abrir e a marca ainda estiver lá,
   ele devolve o `anterior.html` para o lugar e avisa a pessoa.

### Onde fica o save do jogador (decisão)

O jogo guarda tudo no `localStorage`, que é separado **por origem**
(`http://localhost:<porta>`). Por isso:

- o `neutralino.config.json` usa **porta fixa** (`"port": 42071`);
- o jogo abre **na mesma janela e no mesmo processo**, pela página `jogo.html`,
  que lê o HTML do disco e injeta no documento.

Assim a origem é sempre `http://localhost:42071`, em qualquer versão: os slots de
save, o recorde da Horda e as opções nunca se perdem numa atualização. Abrir uma
segunda janela criaria um segundo processo, que não conseguiria usar a mesma
porta fixa — por isso o launcher não usa `window.create`.

> Atenção: o save do zip antigo do jogo (o `Porto Sombrio.exe` com `port: 0`) ficava
> numa porta sorteada a cada abertura, então **não** dá para trazer aquele save
> para cá. Quem jogava pelo zip começa do zero no launcher (ou usa o
> `exportar .pssave` do próprio jogo para trazer o save na mão).

### Segurança

- Só baixa de `https://nightgetaway.net.br` (confere a URL antes de pedir).
- Confere o sha256 do pacote antes de gravar qualquer coisa.
- O único arquivo gravado é o HTML do jogo. O launcher **não** tem permissão de
  executar programas (`os.execCommand` não está no `nativeAllowList`).
- Antes de injetar o HTML do jogo, `jogo.html` tira o acesso nativo da página.

## O que ainda falta

- **Instalador** (`.exe` com Inno Setup ou NSIS) que põe os arquivos em
  `%LOCALAPPDATA%\NightGetaway\app` e cria os atalhos na área de trabalho e no
  menu Iniciar. Hoje a entrega é um zip: a pessoa extrai e abre o `NightGetaway.exe`.
- **Ícone próprio** do launcher no .exe (hoje usa o ícone do runtime).
- **Atualização do próprio launcher**: ele já avisa quando está velho
  (`launcher_min`), mas quem baixa o launcher novo é a pessoa, no site.
- **Capa de verdade** no catálogo (`capa` hoje aponta para `img/og.png` do site).
- **Tela de conta** (save na nuvem) — depende da API de contas do Worker.
- **Launcher do Android**: o APK precisa passar a ler o HTML de `getFilesDir()`
  (ver `docs/LAUNCHER.md`). Não entra nesta pasta.
- Testar no Windows de verdade (aqui não tem Windows): ver abaixo.

## O que só dá para testar no Windows

- O `.exe` com o `resources.neu` novo abrir e a porta 42071 subir.
- O `localStorage` continuar depois de fechar e abrir o programa (é o WebView2
  que guarda, numa pasta de dados do app).
- Atualizar com o jogo aberto, antivírus/SmartScreen e o atalho do menu Iniciar.
