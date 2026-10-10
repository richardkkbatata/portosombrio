# Código-fonte do jogo Porto Sombrio

O `jogo-original/porto-sombrio.html` é gerado a partir daqui. **Mexa no jogo sempre por esta pasta**, nunca direto no HTML montado.

## Como funciona
- `js/*.js`: o jogo, em partes. A ordem de montagem está em `build.sh` e importa: cada versão nova entra num arquivo novo (`18-v16.js`, `19-mp.js`, `20-v161.js`, `21-v171.js`...) que "embrulha" funções antigas (`const x=fn; fn=function(){...x()}`), sem reescrever os arquivos de baixo.
- `shell.html`: o HTML e o CSS em volta do jogo.
- `sh fonte/build.sh`: monta `fonte/porto-sombrio.html` (e `fonte/.all.js`, usado pelos testes).
- `node fonte/test.js`: roda o jogo num navegador falso e simula partidas; tem que terminar com `TUDO OK`. O teste "Edu não foi pra van" às vezes falha à toa; rode de novo.
- `patch/rep.py`: `rep(arquivo, texto_velho, texto_novo)` para trocas exatas com Python.

## Arquivos principais
| arquivo | o que tem |
|---|---|
| 01-core | constantes, mapa (W, H, HS, HT), armas, inimigos, itens |
| 02-world | geração da cidade |
| 03-game | jogador, inimigos, combate, salvar/carregar, gatilhos |
| 04-render / 04b-weapons | desenho, luz, HUD |
| 05-ui | menus, toque, teclado |
| 07-story, 08-cut, 09-plot | história, cenas, enredo e `dbgJump` |
| 10..15 | versões 1.0 a 1.5 (esgoto, Brandt, Universidade de BC, BR-101) |
| 14-notas | `NOTAS`: notas de versão mostradas no jogo (a primeira é a versão atual) |
| 16-debug | menu de teste (código 1707), em abas |
| 17-v151 | maleta estilo RE4, quick time difícil |
| 18-v16 | clima, flashback, missões da Brava e da universidade |
| 19-mp | multiplayer: conta, servidor (`mpSrv*`), corretores, modo sem internet, Noite Zero |
| 20-v161 | maleta de arrastar |
| 21-v171 | celular: botão de correr, botões que somem, editor de controles |
| 22-v18 | Mascate (loja) e dinheiro, Modo Horda e ranking, levantar amigo, frases rápidas, placar, minimapa, mira assistida |

## Regras do Richard para toda versão
- Subir a versão e escrever as notas em `14-notas.js` (aparecem dentro do jogo).
- Atualizar o menu de debug (`16-debug.js`) com o que for novo e corrigir conflitos.
- Multiplayer: o anfitrião manda no mundo. O convidado nunca mata nada sozinho: ele manda `hit` e o anfitrião responde com `die`. Itens: `take`/`drop`.
- Depois de montar: `cp fonte/porto-sombrio.html jogo-original/porto-sombrio.html` e seguir o "Atualizar jogo" do CLAUDE.md (site, APK, servidor).
