# Porto Sombrio — site oficial (instruções para o Claude)

- O dono do projeto (Richard, "richardkkbatata") NÃO é programador: responda sempre em português, com passos simples, clique por clique. Nunca peça senhas nem dados pessoais.
- `site/` é o site publicado na **Cloudflare Pages** (Direct Upload do `entregas/porto-sombrio-site.zip`; domínio registrado na GoDaddy com nameservers da Cloudflare). Também compatível com Apache/cPanel (`.htaccess`, zip `porto-sombrio-cpanel.zip`). Sem framework, sem build, sem bibliotecas externas.
- Segurança: `site/.htaccess` é a fonte da CSP do site; `ferramentas/integrar.py` gera `site/_headers` (Cloudflare) com a mesma política + a CSP do jogo. Teste Cloudflare localmente com `npx wrangler pages dev <pasta do zip extraído>`.
- As páginas HTML de `site/` são GERADAS: edite `ferramentas/paginas/*.html` (conteúdo) ou `ferramentas/gerar_site.py` (cabeçalho/abas/rodapé) e rode `python3 ferramentas/gerar_site.py`.
- Configuração única: `site/js/config.js` (DOMINIO, ADSENSE_CLIENT, ADSENSE_SLOT, EMAIL). Depois de mudar, rode o gerador (atualiza ads.txt, sitemap, canonical e a verificação de domínio dentro do jogo).
- O jogo NÃO deve ser reescrito. `jogo-original/porto-sombrio.html` é a cópia intacta; `ferramentas/integrar.py` gera `site/jogo/index.html` + `site/jogo/.htaccess` + `site/_headers` (CSP com sha256 dos scripts inline). Sempre que o jogo mudar, os dois arquivos sobem juntos.
- Publicação: a Cloudflare Pages está LIGADA ao GitHub e publica sozinha a branch `main` (diretório de saída `site`). SEMPRE, ao terminar qualquer mudança testada, faça commit e `git push origin HEAD:main` (além da branch de trabalho) e confira que `origin/main` == HEAD. Não precisa mandar zip nem pedir upload manual na Cloudflare.
- Atualizar jogo: `/atualizar-jogo` (ver `.claude/commands/atualizar-jogo.md`) → `ferramentas/atualizar_jogo.py`.
- Empacotar: `python3 ferramentas/empacotar.py` (zips em `entregas/` + lista do que trocar). Depois que o usuário subir: `--marcar`.
- Direção de arte: arquivo de investigação da Defesa Civil de BC 48 h após o surto (papel, carimbo, fita, VHS/CCTV). Proibido: gradiente roxo/azul, glassmorphism, cards flutuando em fundo escuro, Inter/Poppins, emojis, texto de marketing.
- Fontes self-hosted em `site/fonts/` (Special Elite, Caveat, League Gothic, licença SIL OFL).
- História: só o que está no código do jogo. Não invente fatos que contradigam o jogo.
- Teste antes de entregar: Apache local (`apt-get install apache2`, AllowOverride All, mod_rewrite/headers/expires/ssl) ou `python3 -m http.server` em `site/`, e Playwright (Chromium em /opt/pw-browsers) sem erros no console em PC e celular.
