#!/usr/bin/env python3
"""
Gera as páginas HTML do site a partir de ferramentas/paginas/*.html.

Uso:  python3 ferramentas/gerar_site.py

- Lê DOMINIO, ADSENSE_CLIENT e EMAIL de site/js/config.js (o único lugar de configuração).
- Monta cada página com o mesmo cabeçalho, abas e rodapé.
- Atualiza site/ads.txt, site/sitemap.xml e site/robots.txt.
- A versão do jogo (para "?v=" nos arquivos e no carimbo) vem de site/dados/updates.json.
"""
import json, re, sys, datetime, html
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
SITE = RAIZ / 'site'
PAGS = Path(__file__).resolve().parent / 'paginas'


def ler_config():
    txt = (SITE / 'js' / 'config.js').read_text(encoding='utf-8')
    def v(k):
        m = re.search(k + r"\s*:\s*'([^']*)'", txt)
        return m.group(1) if m else ''
    return {'dominio': v('DOMINIO').strip().lower().removeprefix('www.'),
            'pub': v('ADSENSE_CLIENT').strip(), 'email': v('EMAIL').strip()}


def ler_versao():
    d = json.loads((SITE / 'dados' / 'updates.json').read_text(encoding='utf-8'))
    return d.get('versao_atual') or d['versoes'][0]['versao']


def downloads():
    """Links e tamanhos dos arquivos de site/downloads (a página Baixar usa {{win_url}}, {{apk_tam}} etc.)."""
    def achar(padrao):
        fs = sorted((SITE / 'downloads').glob(padrao))
        if not fs:
            return '#', '—'
        f = fs[-1]
        mb = f.stat().st_size / 1024 / 1024
        return '/downloads/' + f.name, (f'{mb:.1f} MB' if mb >= 1 else f'{max(1, round(mb * 1024))} KB').replace('.', ',')
    w, a = achar('porto-sombrio-*-windows.zip'), achar('porto-sombrio-*-android.apk')
    return {'win_url': w[0], 'win_tam': w[1], 'apk_url': a[0], 'apk_tam': a[1]}


ABAS = [
    ('/', 'Início', '01'), ('/jogar/', 'Jogar', '02'), ('/baixar/', 'Baixar', '03'), ('/documentario/', 'Documentário', '04'),
    ('/personagens/', 'Personagens', '05'), ('/mapa/', 'Mapa', '06'), ('/bestiario/', 'Bestiário', '07'),
    ('/como-jogar/', 'Como jogar', '08'), ('/atualizacoes/', 'Atualizações', '09'),
]

BASE = """<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{titulo}</title>
<meta name="description" content="{descricao}">
<link rel="canonical" href="{url}">
<meta name="robots" content="{robots}">
<meta name="theme-color" content="#b89a62">
<meta name="author" content="Richard Klettke (richardkkbatata) e Eduardo Ramos (caf3ziin)">
{meta_adsense}
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:site_name" content="Porto Sombrio">
<meta property="og:title" content="{titulo}">
<meta property="og:description" content="{descricao}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="https://{dominio}/img/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.ico" sizes="32x32">
<link rel="icon" href="/img/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/img/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<link rel="preload" href="/fonts/special-elite.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/fonts/league-gothic.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/css/site.css?v={v}">
<script src="/js/js.js?v={v}"></script>
<script src="/js/config.js?v={v}" defer></script>
<script src="/js/site.js?v={v}" defer></script>
<script src="/js/anuncios.js?v={v}" defer></script>
{scripts}
</head>
<body class="pagina-{slug}">
<a class="pular" href="#conteudo">Pular para o conteúdo</a>
<div class="sinal on" id="sinal" aria-hidden="true"><canvas width="160" height="100"></canvas><b>SINAL</b></div>
<header class="topo">
  <div class="topo-linha">
    <a class="marca" href="/" aria-label="Porto Sombrio, página inicial"><small>ARQUIVO PS-0417</small><b>Porto Sombrio</b></a>
    <div class="protocolo">
      <div>Defesa Civil · Balneário Camboriú</div>
      <div><span>Material recolhido 48 h após o surto</span></div>
      <div class="controles-topo" style="justify-content:flex-end;margin-top:6px"><button class="botao-som" id="botao-som" type="button" aria-pressed="false">Som: desligado</button></div>
    </div>
  </div>
  <nav class="abas" aria-label="Seções do arquivo">
{abas}
  </nav>
</header>
<main class="folha" id="conteudo">
  <div class="folha-papel">
{conteudo}
  </div>
</main>
<footer class="rodape">
  <div class="rodape-grade">
    <div>
      <h4>Porto Sombrio</h4>
      <p class="credito">feito por richardkkbatata<br>(Richard Klettke)<br>e caf3ziin (Eduardo Ramos)</p>
      <p>Richard: <a href="https://github.com/richardkkbatata" rel="me noopener" target="_blank">GitHub</a> · <a href="https://www.instagram.com/richardklettke" rel="me noopener" target="_blank">Instagram</a><br>Eduardo: <a href="https://github.com/caf3ziin" rel="noopener" target="_blank">GitHub</a> · <a href="https://www.instagram.com/ramos._eduuyz/" rel="noopener" target="_blank">Instagram</a></p>
    </div>
    <div>
      <h4>Mais do arquivo</h4>
      <ul>
        <li><a href="/baixar/">Baixar o jogo</a></li>
        <li><a href="/ranking/">Ranking da Horda</a></li>
        <li><a href="/criador/">Criadores</a></li>
        <li><a href="/contato/">Contato</a></li>
        <li><a href="/privacidade/">Privacidade e cookies</a></li>
        <li><a href="/termos/">Termos de uso</a></li>
      </ul>
    </div>
    <div>
      <h4>Rádio do arquivo</h4>
      <p style="margin:0">Achado junto com a pasta. Ainda chia.</p>
      <div class="dial"><label for="dial" class="sr">Frequência do rádio</label><input id="dial" type="range" min="1" max="12" value="3"><output id="dial-out" for="dial">canal 3</output></div>
      <p id="dial-msg" class="mao" style="font-size:20px;margin:6px 0 0;min-height:1.2em" aria-live="polite"></p>
    </div>
  </div>
  <p class="ficcao">Obra de ficção. A Vértice, o surto e o "Arquivo PS-0417" existem só dentro do jogo; lugares reais de SC aparecem como cenário. © {ano} Richard Klettke e Eduardo Ramos. Versão do jogo: <span data-versao>{versao}</span>.</p>
</footer>
<div class="rec-fixo" aria-hidden="true"><span class="rec-dot"></span>REC · CAM 03<br><span id="relogio">--- --:--:--</span></div>
</body>
</html>
"""


def ler_pagina(p):
    txt = p.read_text(encoding='utf-8')
    m = re.match(r'<!--\s*(\{.*?\})\s*-->\s*', txt, re.S)
    if not m:
        sys.exit(f'Página sem cabeçalho JSON: {p.name}')
    meta = json.loads(m.group(1))
    return meta, txt[m.end():]


def main():
    cfg = ler_config()
    versao = ler_versao()
    import hashlib
    h = hashlib.sha256()
    for f in sorted(list((SITE / 'css').glob('*.css')) + list((SITE / 'js').glob('*.js'))):
        h.update(f.read_bytes())
    v = h.hexdigest()[:10]  # muda sozinho quando CSS/JS mudam (o navegador baixa de novo)
    dominio = cfg['dominio'] or 'SEUDOMINIO.com.br'
    hoje = datetime.date.today().isoformat()
    paginas = []
    for p in sorted(PAGS.glob('*.html')):
        meta, corpo = ler_pagina(p)
        caminho = meta['caminho']
        abas = '\n'.join(
            f'    <a class="aba" href="{h}"{" aria-current=\"page\"" if h == meta.get("aba", caminho) else ""}><i>{n}</i>{t}</a>'
            for h, t, n in ABAS)
        scripts = '\n'.join(f'<script src="{s}?v={v}" defer></script>' for s in meta.get('scripts', []))
        corpo = corpo.replace('{{versao}}', versao).replace('{{email}}', html.escape(cfg['email']))
        for k, val in downloads().items():
            corpo = corpo.replace('{{' + k + '}}', val)
        out = BASE.format(
            titulo=html.escape(meta['titulo']), descricao=html.escape(meta['descricao']),
            url=f'https://{dominio}{caminho}', robots=meta.get('robots', 'index, follow'),
            dominio=dominio, v=v, meta_adsense=(f'<meta name="google-adsense-account" content="{cfg["pub"]}">' if re.fullmatch(r'ca-pub-\d{16}', cfg['pub']) else ''), scripts=scripts, slug=meta['slug'], abas=abas,
            conteudo=corpo.rstrip(), ano=datetime.date.today().year, versao=versao)
        destino = SITE / ('404.html' if meta['slug'] == '404' else (caminho.strip('/') + '/index.html' if caminho != '/' else 'index.html'))
        destino.parent.mkdir(parents=True, exist_ok=True)
        destino.write_text(out, encoding='utf-8')
        if meta.get('sitemap', True):
            paginas.append((caminho, meta.get('prioridade', '0.6')))
        print('ok', destino.relative_to(RAIZ))

    # sitemap.xml
    linhas = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
    for c, pr in sorted(paginas, key=lambda x: -float(x[1])):
        linhas.append(f'  <url><loc>https://{dominio}{c}</loc><lastmod>{hoje}</lastmod><priority>{pr}</priority></url>')
    linhas.append('</urlset>')
    (SITE / 'sitemap.xml').write_text('\n'.join(linhas) + '\n', encoding='utf-8')

    # robots.txt
    (SITE / 'robots.txt').write_text(
        'User-agent: *\nAllow: /\n\n'
        f'Sitemap: https://{dominio}/sitemap.xml\n', encoding='utf-8')

    # ads.txt
    pub = cfg['pub']
    if re.fullmatch(r'ca-pub-\d{16}', pub):
        ads = f'google.com, {pub.replace("ca-", "")}, DIRECT, f08c47fec0942fa0\n'
    else:
        ads = ('# Troque pelo seu ID depois de aprovado no AdSense (o Claude faz isso pra você):\n'
               '# google.com, pub-XXXXXXXXXXXXXXXX, DIRECT, f08c47fec0942fa0\n')
    (SITE / 'ads.txt').write_text(ads, encoding='utf-8')

    # re-integra o jogo (o domínio fica gravado dentro dele)
    sys.path.insert(0, str(Path(__file__).resolve().parent))
    import integrar
    vj, nh, _ = integrar.integrar()
    print(f'Jogo integrado (versão {vj}, {nh} hashes na CSP).')
    print(f'Pronto. Domínio: {dominio} · versão: {versao} · AdSense: {"configurado" if ads.startswith("google") else "placeholder (anúncios invisíveis)"}')


if __name__ == '__main__':
    main()
