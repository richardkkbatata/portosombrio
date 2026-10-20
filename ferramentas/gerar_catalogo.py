#!/usr/bin/env python3
"""
CATÁLOGO DO LAUNCHER — o arquivo que o launcher NightGetaway lê para saber se tem versão nova.

Gera:
  site/launcher/catalogo.json                         -> lista dos jogos e a versão atual de cada um
  site/launcher/porto-sombrio/<versão>-windows.zip    -> o resources.neu do jogo (Windows), zipado
  site/launcher/porto-sombrio/<versão>-android.zip    -> o HTML preparado pro app Android, zipado

No Windows o launcher baixa esse pacote, confere o sha256 e troca o resources.neu
que fica do lado do "Porto Sombrio.exe" na pasta de jogos. O jogo continua sendo
aberto pelo .exe dele (o mesmo de hoje), então o save não muda de lugar.
No Android o pacote continua sendo só o index.html (o app usa o HTML direto).

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
LAUNCHER_MIN = '2.0.0'   # versão mínima do launcher que entende este catálogo (2.0 = pacote com resources.neu)


def dominio():
    txt = (SITE / 'js' / 'config.js').read_text(encoding='utf-8')
    m = re.search(r"DOMINIO\s*:\s*'([^']*)'", txt)
    return (m.group(1) if m else 'nightgetaway.net.br').strip().lower().removeprefix('www.')


def sha256(b: bytes) -> str:
    return hashlib.sha256(b).hexdigest()


def zipar(destino: Path, nome_dentro: str, dados: bytes):
    """Um zip com um arquivo só. Data fixa pra não mudar o sha256 à toa."""
    destino.parent.mkdir(parents=True, exist_ok=True)
    buf = destino.with_suffix('.tmp')
    with zipfile.ZipFile(buf, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        info = zipfile.ZipInfo(nome_dentro, date_time=(2026, 1, 1, 0, 0, 0))
        info.compress_type = zipfile.ZIP_DEFLATED
        info.external_attr = 0o644 << 16
        z.writestr(info, dados)
    buf.replace(destino)
    return destino


def config_do_jogo(versao: str) -> bytes:
    """
    A configuração do jogo no Windows. Sai do resources.neu que já funciona
    (o do zip de downloads), só trocando o número da versão. Se não achar o zip,
    usa a configuração padrão do jogo (porta sorteada, sem API nativa).
    """
    padrao = {
        'applicationId': 'js.richard.portosombrio', 'version': versao,
        'defaultMode': 'window', 'port': 0, 'documentRoot': '/resources/', 'url': '/',
        'enableServer': True, 'enableNativeAPI': False, 'tokenSecurity': 'one-time',
        'logging': {'enabled': False, 'writeToLogFile': False},
        'modes': {'window': {'title': 'Porto Sombrio', 'width': 1280, 'height': 800,
                             'minWidth': 640, 'minHeight': 400, 'fullScreen': True,
                             'center': True, 'resizable': True, 'enableInspector': False,
                             'exitProcessOnClose': True}},
        'cli': {'binaryName': 'PortoSombrio', 'resourcesPath': '/resources/'},
    }
    cfg = padrao
    zips = sorted((SITE / 'downloads').glob('porto-sombrio-*-windows.zip'))
    if zips:
        sys.path.insert(0, str(AQUI))
        import gerar_launcher                      # mesma leitura/escrita de asar do launcher
        with zipfile.ZipFile(zips[-1]) as zf:
            nomes = [n for n in zf.namelist() if n.endswith('resources.neu')]
            if nomes:
                tmp = LAN / '.neu-do-zip.tmp'
                tmp.parent.mkdir(parents=True, exist_ok=True)
                tmp.write_bytes(zf.read(nomes[0]))
                try:
                    arq = gerar_launcher.ler_asar(tmp)
                    cfg = json.loads(arq['neutralino.config.json'])
                finally:
                    tmp.unlink(missing_ok=True)
    cfg['version'] = versao
    return json.dumps(cfg, indent=2).encode('utf-8')


def montar_neu(destino: Path, versao: str, html: str) -> bytes:
    """Monta o resources.neu do jogo (config + resources/index.html) e devolve os bytes."""
    sys.path.insert(0, str(AQUI))
    import gerar_launcher
    gerar_launcher.escrever_asar(destino, {
        'neutralino.config.json': config_do_jogo(versao),
        'resources/index.html': html.encode('utf-8'),
    })
    return destino.read_bytes()


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
    pasta.mkdir(parents=True, exist_ok=True)
    # Windows: o resources.neu inteiro (o launcher troca ele do lado do .exe do jogo)
    neu_tmp = pasta / '.resources.neu.tmp'
    try:
        neu = montar_neu(neu_tmp, versao, html_win)
    finally:
        neu_tmp.unlink(missing_ok=True)
    conteudo = {'windows': ('resources.neu', neu),
                'android': ('index.html', html_and.encode('utf-8'))}
    for marca, (nome_dentro, bytes_dentro) in conteudo.items():
        p = zipar(pasta / f'{versao}-{marca}.zip', nome_dentro, bytes_dentro)
        b = p.read_bytes()
        pacotes[marca] = {'url': f'{base}/launcher/porto-sombrio/{p.name}',
                          'tamanho': len(b), 'sha256': sha256(b),
                          'arquivo': nome_dentro}
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
