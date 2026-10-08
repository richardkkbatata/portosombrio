# Porto Sombrio — site oficial

Site do jogo **Porto Sombrio**, feito por **richardkkbatata (Richard Klettke)**.
Site estático (HTML, CSS e JavaScript puros), sem framework e sem build, hospedado de graça na **Cloudflare Pages** (domínio na GoDaddy). Também funciona em hospedagem Apache/cPanel.

## O que tem aqui

| Pasta / arquivo | Para que serve |
|---|---|
| `site/` | **O site pronto.** |
| `entregas/porto-sombrio-site.zip` | O site inteiro para arrastar na Cloudflare Pages ("Criar nova implantação"). |
| `entregas/porto-sombrio-cpanel.zip` | O mesmo site para hospedagem cPanel (com `.htaccess`), se um dia mudar. |
| `site/_headers` | Segurança na Cloudflare (gerado automaticamente, equivale ao `.htaccess`). |
| `site/js/config.js` | **Único lugar de configuração:** domínio, ID do AdSense (`ca-pub-...`), bloco de anúncio e e-mail. |
| `site/dados/updates.json` | Lista de versões (página Atualizações e novidades da página inicial). Fácil de editar. |
| `site/.htaccess` | Segurança do servidor: HTTPS, sem www, CSP, HSTS, bloqueio de arquivos ocultos, cache, 404. |
| `jogo-original/porto-sombrio.html` | O jogo intacto, do jeito que você entregou. |
| `site/jogo/index.html` | O jogo integrado ao site (o mesmo arquivo + 3 linhas no final). |
| `novo-jogo/` | Onde você coloca uma versão nova do jogo para o comando "atualizar jogo". |
| `ferramentas/` | Scripts que o Claude usa: gerar páginas, integrar o jogo, atualizar versão, empacotar. |
| `ferramentas/paginas/` | O texto de cada página (o cabeçalho e o rodapé são montados pelo `gerar_site.py`). |

## Comandos (o Claude roda pra você)

```bash
python3 ferramentas/gerar_site.py      # depois de mudar config.js ou alguma página
python3 ferramentas/atualizar_jogo.py  # depois de colocar o jogo novo em novo-jogo/
python3 ferramentas/empacotar.py       # gera os zips e lista o que mudou
python3 ferramentas/empacotar.py --marcar   # depois que você subiu no cPanel
```

No Claude Code também existe o comando **`/atualizar-jogo`**.

O passo a passo de publicação, AdSense, atualização e segurança está em [`GUIA.md`](GUIA.md).
