#!/usr/bin/env python3
"""
Gera os pacotes para subir no cPanel (pasta public_html):

  entregas/porto-sombrio-site.zip            -> o site INTEIRO para a Cloudflare Pages (sem .htaccess; usa _headers)
  entregas/porto-sombrio-cpanel.zip          -> o site INTEIRO para hospedagem cPanel/Apache (com .htaccess)
  entregas/porto-sombrio-atualizacao.zip     -> (cPanel) só os arquivos que mudaram desde o último envio

e imprime a lista exata de arquivos para substituir.

Uso:  python3 ferramentas/empacotar.py            (compara com o último envio)
      python3 ferramentas/empacotar.py --marcar   (registra que este pacote foi enviado)

O registro do último envio fica em ferramentas/ultimo-envio.json.
"""
import hashlib, json, sys, zipfile
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SITE = RAIZ / 'site'
ENTREGAS = RAIZ / 'entregas'
REGISTRO = Path(__file__).resolve().parent / 'ultimo-envio.json'
DATA_FIXA = (2026, 1, 1, 0, 0, 0)  # zip igual quando o conteúdo é igual


def arquivos():
    for p in sorted(SITE.rglob('*')):
        if p.is_file() and p.name != '.DS_Store':
            yield p.relative_to(SITE).as_posix(), p


def mapa():
    return {r: hashlib.sha256(p.read_bytes()).hexdigest() for r, p in arquivos()}


def zipar(destino, lista):
    destino.parent.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        for r in lista:
            info = zipfile.ZipInfo(r, DATA_FIXA)
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o644 << 16
            z.writestr(info, (SITE / r).read_bytes())


def main(marcar=False):
    atual = mapa()
    antes = json.loads(REGISTRO.read_text(encoding='utf-8')) if REGISTRO.exists() else {}
    novos = [r for r in atual if r not in antes]
    mudados = [r for r in atual if r in antes and antes[r] != atual[r]]
    removidos = [r for r in antes if r not in atual]

    cloud = [r for r in atual if not r.endswith('.htaccess')]
    zipar(ENTREGAS / 'porto-sombrio-site.zip', cloud)
    zipar(ENTREGAS / 'porto-sombrio-cpanel.zip', [r for r in atual if not r.startswith('_')])
    tam = (ENTREGAS / 'porto-sombrio-site.zip').stat().st_size / 1024 / 1024
    print(f'CLOUDFLARE: entregas/porto-sombrio-site.zip ({tam:.1f} MB, {len(cloud)} arquivos)')
    print('  -> no painel da Cloudflare: Criar nova implantação e arrastar este zip inteiro.')
    print('(cPanel, se um dia usar: entregas/porto-sombrio-cpanel.zip)')

    if antes:
        alterados = novos + mudados
        if alterados:
            zipar(ENTREGAS / 'porto-sombrio-atualizacao.zip', alterados)
            print('Pacote só com o que mudou: entregas/porto-sombrio-atualizacao.zip')
        print('\n(só para cPanel) arquivos que mudaram desde o último envio:')
        for r in alterados:
            print(('  [novo]     ' if r in novos else '  [trocar]   ') + r)
        for r in removidos:
            print('  [apagar]   ' + r)
        if not (alterados or removidos):
            print('  (nada mudou desde o último envio)')
    else:
        print('Primeiro envio: suba o pacote completo e extraia dentro da public_html.')

    if marcar:
        REGISTRO.write_text(json.dumps(atual, indent=1, sort_keys=True) + '\n', encoding='utf-8')
        print('\nRegistrado como enviado.')


if __name__ == '__main__':
    main('--marcar' in sys.argv)
