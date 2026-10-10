#!/usr/bin/env python3
"""
Gera o app Android do jogo: site/downloads/porto-sombrio-<versão>-android.apk

O app é uma WebView em tela cheia com jogo-original/porto-sombrio.html dentro
(funciona sem internet; o multiplayer usa a internet normalmente).

Precisa (Ubuntu):  apt-get install aapt apksigner dalvik-exchange android-sdk-platform-23 zipalign
Uso:  python3 ferramentas/gerar_apk.py            (pega a versão de site/dados/updates.json)

A chave android/porto-sombrio.keystore NÃO pode mudar: o Android só aceita
atualizar o app se a versão nova for assinada com a mesma chave.
"""
import json, re, shutil, subprocess, sys, tempfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
AND = RAIZ / 'android'
JAR = next(Path('/usr/lib/android-sdk/platforms').glob('*/android.jar'))
CHAVE, SENHA = AND / 'porto-sombrio.keystore', 'portosombrio'
DOWN = RAIZ / 'site' / 'downloads'
APP_REV = 1  # suba quando mudar só o app (android/), sem versão nova do jogo


def rodar(*cmd):
    r = subprocess.run([str(c) for c in cmd], capture_output=True, text=True)
    if r.returncode:
        sys.exit(f'falhou: {" ".join(map(str, cmd))}\n{r.stdout}\n{r.stderr}')


def preparar(origem):
    """O jogo intacto + o que faz ele parecer app: fontes locais (sem internet),
    tela do tamanho do aparelho e a ponte com o Android (app.js). Não mexe na jogabilidade."""
    html = Path(origem).read_text(encoding='utf-8')
    html = re.sub(r'<link[^>]*fonts\.(?:googleapis|gstatic)\.com[^>]*>\s*', '', html)
    cab = ('<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no,viewport-fit=cover">'
           '<meta name="theme-color" content="#000000">'
           '<link rel="stylesheet" href="app.css"><script src="app.js"></script>\n')
    i = html.find('\n', html.find('<meta charset')) + 1
    return html[:i] + cab + html[i:]


def codigo(v):
    p = [int(x) for x in re.findall(r'\d+', v)] + [0, 0, 0]
    return p[0] * 10000 + p[1] * 100 + p[2]


def main():
    versao = json.loads((RAIZ / 'site/dados/updates.json').read_text(encoding='utf-8'))['versao_atual']
    with tempfile.TemporaryDirectory() as t:
        t = Path(t)
        (t / 'assets').mkdir(); (t / 'classes').mkdir(); (t / 'gen').mkdir()
        (t / 'assets/index.html').write_text(preparar(RAIZ / 'jogo-original/porto-sombrio.html'), encoding='utf-8')
        for f in ('app.css', 'app.js'):
            shutil.copy(AND / 'extra' / f, t / 'assets' / f)
        shutil.copytree(AND / 'extra/fonts', t / 'assets/fonts')
        base = t / 'base.apk'
        rodar('aapt', 'package', '-f', '-M', AND / 'AndroidManifest.xml', '-S', AND / 'res', '-A', t / 'assets',
              '-I', JAR, '-F', base, '-J', t / 'gen', '--version-code', codigo(versao) * 10 + APP_REV, '--version-name', versao,
              '--min-sdk-version', 21, '--target-sdk-version', 34)
        fontes = list((AND / 'src').rglob('*.java')) + list((t / 'gen').rglob('*.java'))
        rodar('javac', '-nowarn', '-source', '8', '-target', '8', '-bootclasspath', JAR, '-d', t / 'classes', *fontes)
        rodar('dalvik-exchange', '--dex', f'--output={t / "classes.dex"}', t / 'classes')
        subprocess.run(['aapt', 'add', str(base), 'classes.dex'], cwd=t, capture_output=True, check=True)
        alinhado = t / 'alinhado.apk'
        rodar('zipalign', '-f', '4', base, alinhado)
        for velho in DOWN.glob('porto-sombrio-*-android.apk'):
            velho.unlink()
        saida = DOWN / f'porto-sombrio-{versao}-android.apk'
        rodar('apksigner', 'sign', '--ks', CHAVE, '--ks-pass', f'pass:{SENHA}', '--key-pass', f'pass:{SENHA}',
              '--v4-signing-enabled', 'false', '--out', saida, alinhado)
        rodar('apksigner', 'verify', saida)
    print(f'APK: {saida.relative_to(RAIZ)} ({saida.stat().st_size / 1024 / 1024:.1f} MB, versão {versao})')


if __name__ == '__main__':
    main()
