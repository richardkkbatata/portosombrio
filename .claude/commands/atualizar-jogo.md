---
description: Troca o jogo do site por uma versão nova, registra a versão, gera o zip e explica como publicar na Cloudflare
---

O usuário colocou uma versão nova do jogo na pasta `novo-jogo/` (um `.html`, e opcionalmente `Porto Sombrio.exe`, `resources.neu` e `LEIA-ME.txt` da versão Windows). Responda sempre em português simples: ele não é programador.

1. Confira o que tem em `novo-jogo/`. Se não houver `.html`, peça para ele colocar o arquivo lá (ou anexar na conversa e você salva lá).
2. Leia o começo e o fim do HTML novo e compare com `jogo-original/porto-sombrio.html` para descobrir o que mudou (diálogos, itens, chefes, textos novos). Use isso para escrever 2 a 6 notas curtas da versão, em português, no tom do registro de `site/dados/updates.json`. Se o próprio usuário disse o que mudou ($ARGUMENTS), use isso.
3. Rode: `python3 ferramentas/atualizar_jogo.py --titulo "..." --nota "..." --nota "..."`
4. Se a história mudou (personagens, chefes, finais), avise que o Documentário/Personagens/Bestiário podem precisar de ajuste e ofereça fazer (as páginas ficam em `ferramentas/paginas/`; depois rode `python3 ferramentas/gerar_site.py`).
5. Teste: suba o Apache local ou `python3 -m http.server` dentro de `site/` e abra `/jogar/` e `/jogo/` no Playwright; confira que não há erro no console.
6. Faça commit e push na branch de trabalho.
7. Mande o `entregas/porto-sombrio-site.zip` para o usuário (SendUserFile) e explique, clique por clique: Cloudflare → Workers e Pages → projeto porto-sombrio → Criar nova implantação → arrastar o zip → Salvar e implantar. Se der problema: Implantações → implantação anterior → Reverter.
