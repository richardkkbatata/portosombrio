#!/usr/bin/env python3
"""
CATÁLOGO DO LAUNCHER — o arquivo que o launcher NightGetaway lê para saber se tem versão nova.

Gera:
  site/launcher/catalogo.json                         -> lista dos jogos e a versão atual de cada um
  site/launcher/porto-sombrio/<versão>-windows.zip    -> o HTML do jogo (Windows), zipado
  site/launcher/porto-sombrio/<versão>-android.zip    -> o HTML preparado pro app Android, zipado

O launcher baixa o pacote, confere o sha256 e troca só o arquivo do jogo: ninguém
precisa baixar zip nem APK novo a cada versão.

Roda sozinho dentro do gerar_site.py (e, por tabela, do atualizar_jogo.py).
Também dá pra rodar na mão:  python3 ferramentas/gerar_catalogo.py
"""
import hashlib, json, re, sys, zipfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
SITE = RAIZ / 'site'
LAN = SITE / 'launcher'
JOGO = RAIZ / 'jogo-original' / 'porto-sombrio.html'
DISTRIBUIDORA = 'NightGetaway'
LAUNCHER_MIN = '1.0.0'   # versão mínima do launcher que entende este catálogo


def dominio():
    txt = (SITE / 'js' / 'config.js').read_text(encoding='utf-8')
    m = re.search(r"DOMINIO\s*:\s*'([^']*)'", txt)
    return (m.group(1) if m else 'nightgetaway.net.br').strip().lower().removeprefix('www.')


def sha256(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def zipar(destino: Path, html: str):
    """Um zip com um index.html só. Data fixa pra não mudar o sha256 à toa."""
    destino.parent.mkdir(parents=True, exist_ok=True)
    dados = html.encode('utf-8')
    buf = destino.with_suffix('.tmp')
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        info = zipfile.ZipInfo('index.html', date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        z.writestr(info, dados)
    buf.replace(destino)
    return destino


def gerar():
    if not JOGO.exists():
        sys.exit('jogo-original/porto-sombrio.html não existe')
    dados = json.loads((SITE / 'dados' / 'updates.json').read_text(encoding='utf-8'))
    versao = dados.get('versao_atual') or dados['versoes'][0]['versao']
    atual = next((v for v in dados['versoes'] if v['versao'] == versao), dados['versoes'][0])
    base = f'https://{dominio()}'

    html_win = JOGO.read_text(encoding='utf-8')
    sys.path.insert(0, str(AQUI))
    import gerar_apk                                     # mesma preparação que entra no APK
    html_and = gerar_apk.preparar(JOGO)

    pasta = LAN / 'porto-sombrio'
    # limpa pacotes de versões antigas (fica só a atual + a anterior, pra reserva)
    antigos = sorted(pasta.glob('*-windows.zip')) + sorted(pasta.glob('*-android.zip'))
    pacotes = {}
    for marca, html in (('windows', html_win), ('android', html_and)):
        p = zipar(pasta / f'{versao}-{marca}.zip', html)
        b = p.read_bytes()
        pacotes[marca] = {'url': f'{base}/launcher/porto-sombrio/{p.name}',
                          'tamanho': len(b), 'sha256': sha256(b)}
    guardar = {f'{versao}-windows.zip', f'{versao}-android.zip'}
    for p in antigos:
        if p.name not in guardar and p.exists():
            vp = p.name.split('-')[0]
            if vp != versao and vp not in [v['versao'] for v in dados['versoes'][:2]]:
                p.unlink()

    catalogo = {
        'distribuidora': DISTRIBUIDORA,
        'launcher_min': LAUNCHER_MIN,
        'gerado': dados.get('versoes', [{}])[0].get('data', ''),
        'jogos': [{
            'id': 'porto-sombrio',
            'nome': 'Porto Sombrio',
            'versao': versao,
            'titulo_versao': atual.get('titulo', ''),
            'capa': f'{base}/img/og.png',
            'site': f'{base}/',
            'pacote_windows': pacotes['windows'],
            'pacote_android': pacotes['android'],
            'notas': atual.get('mudancas', [])[:8],
        }],
    }
    LAN.mkdir(parents=True, exist_ok=True)
    (LAN / 'catalogo.json').write_text(json.dumps(catalogo, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    return versao, pacotes


if __name__ == '__main__':
    v, p = gerar()
    print(f'Catálogo do launcher: versão {v} · Windows {p["windows"]["tamanho"] // 1024} KB · Android {p["android"]["tamanho"] // 1024} KB')
