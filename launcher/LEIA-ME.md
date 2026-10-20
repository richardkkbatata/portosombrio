# Launcher do Windows — NightGetaway (versão 2.0)

Programa que a pessoa instala uma vez. Ele confere na internet se tem versão
nova do jogo, baixa sozinho, confere a segurança (sha256), troca o arquivo e
**abre o jogo**. Sem internet, abre a versão que já está no computador.

## A mudança da versão 2.0 (e por que ela existe)

Na versão 1.0 o launcher rodava o jogo **dentro dele** (página `jogo.html`,
porta fixa 42071). No computador do Richard isso dava este erro, logo ao abrir:

```
NE_CL_IVCTOKN: Neutralinojs application cannot connect with the framework core using NL_TOKEN.
```

**Causa.** O Neutralino entrega o `NL_TOKEN` **uma vez só** por janela
(`tokenSecurity: "one-time"`): a página guarda o token no `sessionStorage` da
origem `http://localhost:<porta>`. Quem carregar a página uma segunda vez sem
esse token recebe exatamente essa mensagem. O launcher 1.0 criava as duas
condições para isso acontecer:

1. **porta fixa** (`"port": 42071`): a origem é sempre a mesma em toda
   abertura, então o WebView2 reaproveita o estado daquela origem (inclusive
   restaurando a sessão anterior). O jogo avulso, que funciona no PC dele, usa
   `"port": 0` — origem nova a cada abertura, token sempre novo;
2. **duas páginas**: o botão JOGAR fazia `location.href = 'jogo.html'`, ou seja,
   uma segunda carga de página na mesma janela — a segunda já não tinha token.
   (E o `document.write` do HTML do jogo era uma terceira.)

**Correção, mantendo `tokenSecurity: "one-time"`** (não foi preciso usar
`"none"`, que abriria a API nativa para qualquer página local):

- o launcher voltou para **`"port": 0`** (porta sorteada), como o jogo;
- o launcher tem **uma página só** (`index.html`). O `jogo.html` foi apagado.
  Não existe mais navegação, recarga nem segunda janela;
- o launcher **não roda mais o jogo dentro dele**: no botão JOGAR ele executa
  o `Porto Sombrio.exe` da pasta de jogos. O jogo roda no processo dele,
  exatamente como o zip que a pessoa já usa hoje;
- `logging.enabled` e `logging.writeToLogFile` ligados: se der erro de novo,
  fica o `neutralinojs.log` do lado do `NightGetaway.exe`.

**Efeito bom de quebra:** o save. Como o jogo é o mesmo programa de sempre, com
a mesma configuração, ele guarda o save onde sempre guardou. O launcher só troca
o `resources.neu` do lado do `.exe`. Quem já jogava pelo zip **não perde nada**.

## O que tem nesta pasta

| Arquivo | O que é |
|---|---|
| `neutralino.config.json` | Configuração do programa (porta sorteada, permissões, log ligado). |
| `resources/index.html` | A ÚNICA página do launcher (lista de jogos). |
| `resources/estilo.css` | A aparência: papel, carimbo, fita, CFTV. |
| `resources/launcher.js` | O miolo: catálogo, download, sha256, troca, reserva e abrir o jogo. |
| `resources/neutralino.js` | Biblioteca oficial do Neutralino 5.4.0 (MIT), copiada do npm. |
| `resources/fonts/` | Special Elite, Caveat e League Gothic (as mesmas do site). |
| `teste/teste.js` + `teste/mock.js` | Teste no Playwright com um Neutralino de mentira. |

Fora desta pasta: `ferramentas/gerar_launcher.py` monta o programa e
`ferramentas/gerar_catalogo.py` publica os pacotes de atualização.

## Como funciona por dentro

1. Lê `https://nightgetaway.net.br/launcher/catalogo.json`.
2. Compara com `%LOCALAPPDATA%\NightGetaway\jogos\porto-sombrio\estado.json`.
3. **Primeira vez:** copia o `Porto Sombrio.exe` que veio dentro do zip do
   launcher (pasta `runtime\`) para `%LOCALAPPDATA%\NightGetaway\jogos\porto-sombrio\`.
   Esse programa nunca vem da internet.
4. **Atualizar:** baixa o `pacote_windows` (um zip com o `resources.neu` inteiro
   do jogo) mostrando a barra, confere o tamanho e o **sha256**, confere que o
   conteúdo é mesmo um `resources.neu` (tem `neutralino.config.json` e
   `resources/index.html` dentro), grava em `resources.neu.tmp`, renomeia o
   antigo para `anterior.neu` e só então renomeia o `.tmp` para `resources.neu`
   (troca atômica).
5. Se qualquer coisa falhar, **nada é gravado** e a versão antiga continua.
6. **JOGAR:** executa `"%LOCALAPPDATA%\NightGetaway\jogos\porto-sombrio\Porto Sombrio.exe"`
   em segundo plano. O jogo abre numa janela própria, em tela cheia, como sempre.
7. Depois de instalar uma versão nova, o launcher pergunta: *"o jogo abriu
   direito?"*. Se a pessoa disser que não (ou se ela abrir o launcher de novo sem
   ter respondido depois de ter tentado jogar), ele devolve o `anterior.neu` para
   o lugar e avisa.

### Onde fica o save do jogador (decisão desta versão)

O save fica **onde já estava**: na pasta de dados do WebView2 do próprio jogo,
porque quem roda o jogo continua sendo o `Porto Sombrio.exe` com a mesma
configuração de sempre. O launcher não hospeda o jogo e não tem a ver com isso.
Trocar o `resources.neu` não mexe no save.

### Segurança

- Só baixa de `https://nightgetaway.net.br` (confere a URL antes de pedir).
- Confere o sha256 **e** o formato do pacote antes de gravar qualquer coisa.
- O único programa que o launcher pode executar é o `Porto Sombrio.exe` de
  dentro de `%LOCALAPPDATA%\NightGetaway\jogos\<id>\`. O caminho é montado no
  código; nada do catálogo ou da internet entra nele. Antes de executar, o
  caminho é comparado com o caminho esperado, letra por letra.
- `nativeAllowList` só com o que é usado (arquivos, `os.getEnv`, `os.execCommand`).
- Porta sorteada: nenhuma outra página local sabe em que porta o launcher está.

## Como montar

```sh
python3 ferramentas/gerar_launcher.py
```

Ele pega o runtime do Neutralino (o `Porto Sombrio.exe` de dentro do zip
`site/downloads/porto-sombrio-*-windows.zip`) e gera:

- `entregas/launcher-windows/NightGetaway.exe` + `resources.neu` +
  `runtime/Porto Sombrio.exe` + `LEIA-ME.txt`
- `entregas/nightgetaway-launcher-2.0.0-windows.zip` (é o que vai para a pessoa)

Conferir o pacote montado: `python3 ferramentas/gerar_launcher.py --conferir`.

Para publicar no site, copie esse zip para `site/downloads/` e rode
`python3 ferramentas/gerar_site.py` (a página Baixar acha o zip do launcher
sozinha). O zip 1.0.0 que está lá hoje é da arquitetura velha e deve sair.

## Como testar

```sh
env -u HTTPS_PROXY -u https_proxy node launcher/teste/teste.js
```

Sobe um servidor na porta 8792 com um catálogo e pacotes de mentira (com
`resources.neu` de verdade, no formato asar) e testa: sem internet, versão nova,
sha256 errado, download interrompido, pacote com conteúdo errado, primeira
instalação (copiar o `.exe`), launcher velho (`launcher_min`), volta para a
reserva (automática e no botão) e o clique em JOGAR — conferindo que o comando
executado é **exatamente** o `.exe` da pasta de jogos. Termina com **TUDO OK**.
Os screenshots (`launcher2-*.png`) ficam no diretório de rascunho.

## O que ainda falta

- **Instalador** (`.exe` com Inno Setup ou NSIS) que põe os arquivos em
  `%LOCALAPPDATA%\NightGetaway\app` e cria os atalhos. Hoje a entrega é um zip:
  a pessoa extrai a pasta inteira (com a subpasta `runtime`) e abre o `.exe`.
- **Ícone próprio** do launcher no .exe (hoje usa o ícone do runtime).
- **Atualização do próprio launcher**: ele avisa quando está velho
  (`launcher_min`), mas quem baixa o launcher novo é a pessoa, no site.
- **Capa de verdade** no catálogo (`capa` hoje aponta para `img/og.png`).
- **Tela de conta** (save na nuvem) — depende da API de contas do Worker.
- **Launcher do Android** (ver `docs/LAUNCHER.md`). O pacote Android do catálogo
  continua sendo só o `index.html`, como antes.

## O que só dá para testar no Windows (aqui não tem Windows)

- O `NightGetaway.exe` abrir **sem o NE_CL_IVCTOKN**. É a correção principal.
- O `Porto Sombrio.exe` abrir no clique em JOGAR (`os.execCommand`) e o jogo
  aparecer em tela cheia.
- O save do jogo continuar igual depois de uma atualização do `resources.neu`.
- O `filesystem.copy` do runtime (uns 2,5 MB) na primeira vez; se essa chamada
  não existir na versão do runtime, o código cai sozinho em ler/gravar binário.
- Antivírus/SmartScreen ao abrir dois `.exe` diferentes com o mesmo conteúdo.
- O `neutralinojs.log` sendo gravado do lado do `NightGetaway.exe`.
