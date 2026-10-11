#!/bin/sh
# Monta o jogo a partir dos arquivos de js/ (a ordem importa: os de baixo embrulham os de cima).
# Saída: fonte/porto-sombrio.html e fonte/.all.js (só o JavaScript, usado pelo test.js).
# Para publicar: cp fonte/porto-sombrio.html jogo-original/porto-sombrio.html e siga o fluxo de "Atualizar jogo" do CLAUDE.md.
set -e
cd "$(dirname "$0")"
# arquivos fixos + qualquer js/25..99-*.js novo (em ordem), e o 06-main por último
EXTRA=$(ls js/[2-9][0-9]-*.js 2>/dev/null | sort | awk -F/ '{n=substr($2,1,2)+0; if(n>=25) print $0}' | tr '\n' ' ')
{ cat shell.html; echo '<script>'; cat js/01-core.js js/02-world.js js/03-game.js js/04-render.js js/04b-weapons.js js/05-ui.js js/07-story.js js/08-cut.js js/09-plot.js js/10-v16.js js/11-v12.js js/12-v13.js js/13-v14.js js/15-v15.js js/14-notas.js js/16-debug.js js/17-v151.js js/18-v16.js js/19-mp.js js/20-v161.js js/21-v171.js js/22-v18.js js/23-v181.js js/24-v183.js $EXTRA js/06-main.js; echo '</script>'; } > porto-sombrio.html
cat js/01-core.js js/02-world.js js/03-game.js js/04-render.js js/04b-weapons.js js/05-ui.js js/07-story.js js/08-cut.js js/09-plot.js js/10-v16.js js/11-v12.js js/12-v13.js js/13-v14.js js/15-v15.js js/14-notas.js js/16-debug.js js/17-v151.js js/18-v16.js js/19-mp.js js/20-v161.js js/21-v171.js js/22-v18.js js/23-v181.js js/24-v183.js $EXTRA js/06-main.js > .all.js
