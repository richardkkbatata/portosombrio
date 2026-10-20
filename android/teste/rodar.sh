#!/bin/sh
# Teste da atualização do app Android (launcher), rodando no computador — sem Android.
# Uso (do raiz do projeto):  sh android/teste/rodar.sh
# Tem que terminar com TUDO OK.
set -e
RAIZ=$(cd "$(dirname "$0")/../.." && pwd)
T=${TMPDIR:-/tmp}/ps-teste-launcher
rm -rf "$T"
mkdir -p "$T/aulas" "$T/trabalho" "$T/servidor"

python3 "$RAIZ/ferramentas/gerar_catalogo.py" >/dev/null
python3 "$RAIZ/android/teste/fixtures.py" "$RAIZ" "$T/servidor"

javac -nowarn -d "$T/aulas" "$RAIZ/android/src/br/portosombrio/jogo/Atualizador.java" "$RAIZ/android/teste/TesteAtualizador.java"
fuser -k 8791/tcp >/dev/null 2>&1 || true
cd "$T/servidor"
python3 -m http.server 8791 --bind 127.0.0.1 >/dev/null 2>&1 &
SRV=$!
sleep 2
fim=0
JAVA_TOOL_OPTIONS= java -Dfile.encoding=UTF-8 -cp "$T/aulas" TesteAtualizador http://127.0.0.1:8791 "$T/trabalho" || fim=1
kill "$SRV" 2>/dev/null || true
fuser -k 8791/tcp >/dev/null 2>&1 || true
exit $fim
