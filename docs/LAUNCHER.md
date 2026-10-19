# Launcher da distribuidora (instruções para o Claude Code)

> Pedido do Richard (dono): um **instalador/launcher da nossa distribuidora** com os nossos jogos.
> A pessoa instala uma vez e o launcher **atualiza o jogo sozinho pela internet (Wi-Fi)**:
> ninguém mais baixa um zip/APK novo a cada versão.
> O dono não é programador: fale com ele em português, passo a passo.
> Nome da distribuidora: **PERGUNTAR AO RICHARD** antes de pôr em tela (enquanto isso, use "Launcher").

## O que já existe e deve ser reaproveitado

- Domínio: `https://nightgetaway.net.br` (Cloudflare Worker + assets em `site/`, ver `wrangler.jsonc`).
- Registro de versões: `site/dados/updates.json` (`versao_atual` + lista `versoes` com notas). **É a fonte da verdade da versão.**
- Downloads atuais: `site/downloads/porto-sombrio-<versão>-windows.zip` e `-android.apk`.
- Windows hoje: zip do Neutralino (`resources.neu`, com o `resources/index.html` do jogo).
- Android hoje: APK WebView gerado por `ferramentas/gerar_apk.py` (chave `android/porto-sombrio.keystore`, NUNCA trocar).
- O jogo inteiro é **um único HTML** (`jogo-original/porto-sombrio.html`). Por isso a atualização pode baixar só esse arquivo, sem reinstalar nada.

## Ideia central

O launcher é um programa pequeno e fixo. O conteúdo de cada jogo (o HTML) fica num cache local e é trocado quando sai versão nova.

1. Ao abrir, o launcher lê o catálogo `https://nightgetaway.net.br/launcher/catalogo.json`.
2. Compara a versão de cada jogo instalado com a do catálogo.
3. Se tiver versão nova: baixa o pacote, confere o **sha256**, troca o arquivo de forma atômica (baixa em `.tmp`, confere, renomeia) e guarda a versão antiga como reserva para voltar se der erro.
4. Sem internet: abre a última versão instalada normalmente.
5. O save do jogador (localStorage `ps-*` e os registros/slots) **não pode ser perdido** na atualização. Mantenha a mesma origem/pasta de dados do WebView entre versões e teste isso.

### Formato do catálogo (sugestão)

```json
{
  "launcher_min": "1.0.0",
  "jogos": [
    {
      "id": "porto-sombrio",
      "nome": "Porto Sombrio",
      "versao": "1.13.1",
      "capa": "https://nightgetaway.net.br/launcher/porto-sombrio/capa.jpg",
      "pacote": "https://nightgetaway.net.br/launcher/porto-sombrio/1.13.1.zip",
      "tamanho": 0,
      "sha256": "...",
      "notas": ["frases da updates.json"]
    }
  ]
}
```

- O pacote contém o HTML do jogo **já preparado** (para Windows: o `index.html` do zip; para Android: o HTML que o `gerar_apk.py` monta na função `preparar`, com fontes locais, `app.css`/`app.js`). Se os dois forem diferentes, publique dois pacotes (`pacote_windows`, `pacote_android`).
- Gere o catálogo com um script novo `ferramentas/gerar_catalogo.py` lendo `site/dados/updates.json` e `jogo-original/porto-sombrio.html`, e chame-o do `gerar_site.py` / `atualizar_jogo.py` para que **toda versão nova atualize o catálogo sozinha**.
- Arquivos em `site/launcher/` (publicados junto com o site pelo push na `main`).

## Plataformas

### Windows
- Launcher em **Neutralino** (já usado no projeto, leve) ou Tauri. Um instalador único (`.exe`, por exemplo com Inno Setup ou NSIS) que cria atalho na área de trabalho e no menu Iniciar.
- Jogos instalados em `%LOCALAPPDATA%\<Distribuidora>\jogos\<id>\<versão>\`.
- O launcher também se atualiza: se `launcher_min` for maior que a versão dele, baixa o instalador novo e avisa.

### Android
- Transformar o APK atual em launcher: o app passa a carregar o HTML do armazenamento interno (`getFilesDir()/jogos/porto-sombrio/index.html`), e não mais de dentro do APK. O HTML embutido no APK fica como versão de fábrica (funciona offline na primeira vez).
- Baixar só no Wi-Fi por padrão (`ConnectivityManager`, rede não medida), com opção "baixar também pelos dados móveis".
- **Mesma keystore e mesmo `applicationId`** para o app instalado receber a atualização por cima, sem perder o save.
- Atualização do próprio app (código Java) continua via APK novo, e é rara. Use `APP_REV` em `gerar_apk.py`.

### iPhone
- Não tem APK. A versão web `/jogo/` já se atualiza sozinha (é o site). Não precisa de launcher.

## Tela do launcher

- Lista de jogos (capa, nome, versão instalada, botão JOGAR).
- Barra de progresso do download e "Novidades" com as notas da versão.
- Seguir a direção de arte do `CLAUDE.md`: arquivo/papel/carimbo, Special Elite/Caveat/League Gothic. Sem gradiente roxo/azul, sem glassmorphism, sem emojis, sem texto de marketing.

## Segurança

- Só baixar de `https://nightgetaway.net.br` (HTTPS) e sempre conferir o sha256 antes de trocar.
- Nunca executar nada baixado fora do pacote do jogo.
- Se o arquivo novo não abrir (página em branco ou erro), voltar para a versão anterior automaticamente.

## Regras do projeto que continuam valendo

- O jogo NÃO é reescrito: o launcher só entrega o mesmo HTML. Mudança no jogo continua em `fonte/js/*.js` → `sh fonte/build.sh` → `node fonte/test.js` (TUDO OK).
- Toda versão nova do jogo: APK + zip Windows + site + **catálogo do launcher**, todos com o mesmo número de `updates.json`.
- Ao terminar e testar: commit e `git push origin HEAD:main`, e conferir que `origin/main` == HEAD.

## Testes antes de entregar

1. Instalar o launcher com a versão X, publicar o catálogo local com X+1 e ver se ele baixa, troca e abre.
2. Conferir que o save (slots, recorde da Horda, configurações) continua lá depois da troca.
3. Abrir sem internet: abre a versão instalada.
4. sha256 errado: recusa e mantém a versão atual.
5. Android: instalar por cima do APK antigo (mesma chave) sem perder o save; download só no Wi-Fi.
6. Playwright no HTML baixado (PC e celular) sem erros no console.
