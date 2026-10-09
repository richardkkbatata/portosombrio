#!/usr/bin/env python3
"""
ATUALIZAR JOGO — troca o jogo do site por uma versão nova.

Como usar:
  1. Coloque o novo arquivo do jogo (ex.: porto-sombrio.html) na pasta  novo-jogo/
     (Opcional: junto, os arquivos da versão Windows: "Porto Sombrio.exe", "resources.neu", "LEIA-ME.txt")
  2. Rode:
       python3 ferramentas/atualizar_jogo.py --titulo "Nome da versão" --nota "O que mudou" --nota "Outra mudança"
     (título e notas são opcionais; dá pra editar depois em site/dados/updates.json)

O script:
  - descobre a versão escrita dentro do jogo ("Versão 1.4.0" na tela de título);
  - guarda o jogo intacto em jogo-original/ e gera site/jogo/index.html integrado
    (verificação de domínio, anúncio premiado opcional, CSP com o hash certo);
  - adiciona a versão no topo de site/dados/updates.json;
  - se tiver versão Windows, gera o .zip novo de download;
  - regenera as páginas (versão nova em todo lugar);
  - gera os pacotes .zip e diz exatamente quais arquivos trocar no cPanel.
"""
import argparse, datetime, json, re, shutil, sys, zipfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
NOVO = RAIZ / 'novo-jogo'
ORIGINAL = RAIZ / 'jogo-original' / 'porto-sombrio.html'
UPDATES = RAIZ / 'site' / 'dados' / 'updates.json'
DOWNLOADS = RAIZ / 'site' / 'downloads'
PAG_JOGAR = AQUI / 'paginas' / '02-jogar.html'
sys.path.insert(0, str(AQUI))


def achar_html(arg):
    if arg:
        p = Path(arg)
        return p if p.exists() else sys.exit(f'Arquivo não encontrado: {arg}')
    htmls = sorted(NOVO.glob('*.html'), key=lambda p: p.stat().st_mtime, reverse=True)
    if not htmls:
        sys.exit('Nenhum .html em novo-jogo/. Coloque o novo porto-sombrio.html lá dentro.')
    return htmls[0]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('arquivo', nargs='?')
    ap.add_argument('--titulo')
    ap.add_argument('--nota', action='append')
    ap.add_argument('--versao', help='força o número da versão, se o jogo não disser')
    a = ap.parse_args()

    src = achar_html(a.arquivo)
    html = src.read_text(encoding='utf-8')
    if '<canvas' not in html or '<script' not in html:
        sys.exit(f'{src.name} não parece ser o jogo (não achei canvas/script).')
    import integrar
    if integrar.MARCA in html:
        html = html[:html.index(integrar.MARCA)].rstrip() + '\n'
    versao = a.versao or integrar.versao_do_jogo(html)
    if not versao:
        sys.exit('Não achei "Versão X.Y" dentro do jogo. Rode de novo com --versao 1.4.0')

    dados = json.loads(UPDATES.read_text(encoding='utf-8'))
    antiga = dados.get('versao_atual')
    if ORIGINAL.exists() and ORIGINAL.read_text(encoding='utf-8') == html:
        print(f'Esse arquivo é igual ao jogo que já está no site ({antiga}). Nada a fazer no jogo.')
    ORIGINAL.parent.mkdir(exist_ok=True)
    ORIGINAL.write_text(html, encoding='utf-8')

    # registro de versões
    if not any(v['versao'] == versao for v in dados['versoes']):
        dados['versoes'].insert(0, {
            'versao': versao,
            'data': datetime.date.today().isoformat(),
            'titulo': a.titulo or f'Versão {versao}',
            'resumo': (a.nota or ['Nova versão do jogo.'])[0],
            'mudancas': a.nota or ['Nova versão do jogo.'],
        })
        print(f'Versão {versao} adicionada em site/dados/updates.json')
    else:
        print(f'A versão {versao} já estava no registro; só troquei o arquivo do jogo.')
    dados['versao_atual'] = versao
    UPDATES.write_text(json.dumps(dados, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

    # versão Windows (opcional)
    exe, neu = NOVO / 'Porto Sombrio.exe', NOVO / 'resources.neu'
    if exe.exists() and neu.exists():
        pasta = f'Porto Sombrio {versao}'
        destino = DOWNLOADS / f'porto-sombrio-{versao}-windows.zip'
        for velho in DOWNLOADS.glob('porto-sombrio-*-windows.zip'):
            velho.unlink()
        with zipfile.ZipFile(destino, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
            z.write(exe, f'{pasta}/Porto Sombrio.exe')
            z.write(neu, f'{pasta}/resources.neu')
            leia = NOVO / 'LEIA-ME.txt'
            if leia.exists():
                z.write(leia, f'{pasta}/LEIA-ME.txt')
        mb = destino.stat().st_size / 1024 / 1024
        pag = PAG_JOGAR.read_text(encoding='utf-8')
        pag = re.sub(r'/downloads/porto-sombrio-[\d.]+-windows\.zip', f'/downloads/{destino.name}', pag)
        pag = re.sub(r'Baixar para Windows \([\d,]+ MB\)', f'Baixar para Windows ({mb:.1f} MB)'.replace('.', ','), pag)
        PAG_JOGAR.write_text(pag, encoding='utf-8')
        print(f'Versão Windows empacotada: site/downloads/{destino.name}')
        for f in (exe, neu, NOVO / 'LEIA-ME.txt'):
            if f.exists():
                f.unlink()

    # versão Android (APK) — toda versão nova gera o APK junto
    try:
        import gerar_apk
        gerar_apk.main()
        pag = PAG_JOGAR.read_text(encoding='utf-8')
        pag = re.sub(r'/downloads/porto-sombrio-[\d.]+-android\.apk', f'/downloads/porto-sombrio-{versao}-android.apk', pag)
        PAG_JOGAR.write_text(pag, encoding='utf-8')
    except SystemExit as e:
        print(f'ATENÇÃO: o APK não foi gerado ({e}). Rode: python3 ferramentas/gerar_apk.py')

    # páginas + integração do jogo
    import gerar_site
    gerar_site.main()

    # o arquivo novo já foi guardado em jogo-original/; tira da fila
    if src.parent == NOVO:
        src.unlink()

    print('\n' + '=' * 60)
    import empacotar
    empacotar.main(marcar=False)
    print('=' * 60)
    print(f'\nJogo atualizado: {antiga} -> {versao}.')
    print('Agora: Cloudflare -> Workers e Pages -> porto-sombrio -> Criar nova implantação -> arraste entregas/porto-sombrio-site.zip')


if __name__ == '__main__':
    main()
