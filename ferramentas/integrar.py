#!/usr/bin/env python3
"""
Integra o jogo ao site SEM reescrever o jogo.

Pega jogo-original/porto-sombrio.html (cópia intacta do jogo) e grava
site/jogo/index.html com, no final do arquivo:
  1. um script pequeno que mostra "Jogue no site oficial" fora do seu domínio;
  2. /js/config.js e /jogo/integracao.js (anúncio premiado opcional).
Também calcula o hash (sha256) dos scripts do jogo e grava site/jogo/.htaccess
com a Content-Security-Policy certa para essa versão.

Uso:  python3 ferramentas/integrar.py
"""
import base64, hashlib, json, re
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
ORIGEM = RAIZ / 'jogo-original' / 'porto-sombrio.html'
DESTINO = RAIZ / 'site' / 'jogo' / 'index.html'
HTACCESS = RAIZ / 'site' / 'jogo' / '.htaccess'
MARCA = '<!-- PS-INTEGRACAO'

GOOGLE_SCRIPT = ('https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.google.com '
                 'https://*.gstatic.com https://*.doubleclick.net https://*.googletagservices.com '
                 'https://*.adtrafficquality.google https://fundingchoicesmessages.google.com https://static.cloudflareinsights.com')
GOOGLE_CONNECT = ('https://cloudflareinsights.com https://*.google.com https://*.googlesyndication.com https://*.doubleclick.net '
                  'https://*.adtrafficquality.google https://*.gstatic.com')
GOOGLE_FRAME = ('https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com '
                'https://*.adtrafficquality.google')

VERIFICA = r"""(function(){var D=%s,h=(location.hostname||"").toLowerCase().replace(/^www\./,"");
if(!D||/SEUDOMINIO/i.test(D)||h===D||h==="localhost"||h==="127.0.0.1"||h==="[::1]")return;
function m(){var d=document.createElement("div");d.setAttribute("role","dialog");d.setAttribute("aria-label","Jogue no site oficial");
d.style.cssText="position:fixed;inset:0;z-index:2147483647;background:#0a0c0b;color:#ddd6c6;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;text-align:center;padding:24px;font:18px/1.5 'Special Elite','Courier New',monospace";
var u="https://"+D+"/jogar/";d.innerHTML='<p style="margin:0;letter-spacing:.22em;color:#d49a3c;font-size:13px">SINAL NÃO AUTORIZADO</p><h1 style="margin:0;font-size:clamp(30px,7vw,52px);font-weight:400">Jogue no site oficial</h1><p style="margin:0;max-width:460px">Esta cópia de Porto Sombrio está rodando fora do site oficial do jogo.</p><a style="color:#0a0c0b;background:#d49a3c;padding:12px 20px;text-decoration:none;font-size:20px" target="_top" rel="noopener" href="'+u+'">'+D+'</a>';
document.body.appendChild(d);try{G.mode="menu";}catch(e){}
["keydown","keyup"].forEach(function(t){window.addEventListener(t,function(e){e.stopImmediatePropagation();},true);});}
if(document.body)m();else document.addEventListener("DOMContentLoaded",m);})();"""


def ler_dominio():
    txt = (RAIZ / 'site' / 'js' / 'config.js').read_text(encoding='utf-8')
    m = re.search(r"DOMINIO\s*:\s*'([^']*)'", txt)
    return (m.group(1) if m else '').strip().lower().removeprefix('www.')


def versao_do_jogo(html):
    m = re.search(r'Versão\s+(\d+(?:\.\d+)+)', html)
    return m.group(1) if m else None


def integrar():
    jogo = ORIGEM.read_text(encoding='utf-8')
    if MARCA in jogo:  # alguém mandou o arquivo já integrado: tira a integração antiga
        jogo = jogo[:jogo.index(MARCA)].rstrip() + '\n'
    dominio = ler_dominio()
    vh = hashlib.sha256((RAIZ / 'site/js/config.js').read_bytes() + (RAIZ / 'site/jogo/integracao.js').read_bytes()).hexdigest()[:10]
    inline = VERIFICA % json.dumps(dominio)
    bloco = ('\n' + MARCA + ' · gerado por ferramentas/integrar.py, não edite à mão -->\n'
             f'<script>{inline}</script>\n'
             f'<script src="/js/config.js?v={vh}"></script>\n'
             f'<script src="/jogo/integracao.js?v={vh}"></script>\n')
    final = jogo.rstrip() + '\n' + bloco
    DESTINO.write_text(final, encoding='utf-8')

    # hashes de TODOS os <script> sem src (o do jogo + o verificador)
    hashes = []
    for m in re.finditer(r'<script(?![^>]*\bsrc=)[^>]*>(.*?)</script>', final, re.S):
        h = base64.b64encode(hashlib.sha256(m.group(1).encode('utf-8')).digest()).decode()
        hashes.append(f"'sha256-{h}'")
    csp = ("default-src 'self'; "
           f"script-src 'self' {' '.join(hashes)} {GOOGLE_SCRIPT}; "
           "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
           "font-src 'self' https://fonts.gstatic.com; "
           "img-src 'self' data: blob: https:; "
           "media-src 'self' data: blob:; "
           f"connect-src 'self' {GOOGLE_CONNECT}; "
           f"frame-src {GOOGLE_FRAME}; "
           "worker-src 'self' blob:; "
           "frame-ancestors 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; "
           "upgrade-insecure-requests")
    HTACCESS.write_text(
        '# Gerado por ferramentas/integrar.py — NÃO edite à mão.\n'
        '# A política abaixo libera só os scripts desta versão exata do jogo (hash sha256)\n'
        '# e o necessário do Google (AdSense / H5 Games Ads).\n'
        '<IfModule mod_headers.c>\n'
        f'  Header always set Content-Security-Policy "{csp}"\n'
        '  <FilesMatch "\\.html$">\n'
        '    Header set Cache-Control "no-cache, must-revalidate"\n'
        '  </FilesMatch>\n'
        '</IfModule>\n', encoding='utf-8')
    escrever_headers_cloudflare(csp)
    return versao_do_jogo(jogo), len(hashes), dominio


def csp_do_site():
    """A mesma CSP do site que está no .htaccess (fonte única: site/.htaccess)."""
    txt = (RAIZ / 'site' / '.htaccess').read_text(encoding='utf-8')
    m = re.search(r'Header always set Content-Security-Policy "([^"]+)"', txt)
    return m.group(1)


def escrever_headers_cloudflare(csp_jogo):
    """site/_headers: as mesmas proteções do .htaccess, no formato da Cloudflare Pages."""
    (RAIZ / 'site' / '_headers').write_text(
        '# Gerado por ferramentas/integrar.py — NÃO edite à mão.\n'
        '# Segurança e cache do site na Cloudflare Pages (equivale ao .htaccess).\n'
        '/*\n'
        f'  Content-Security-Policy: {csp_do_site()}\n'
        '  Strict-Transport-Security: max-age=31536000\n'
        '  X-Content-Type-Options: nosniff\n'
        '  Referrer-Policy: strict-origin-when-cross-origin\n'
        '  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=(), fullscreen=(self)\n'
        '  X-Frame-Options: SAMEORIGIN\n'
        '  Cross-Origin-Opener-Policy: same-origin-allow-popups\n'
        '\n'
        '# o jogo tem a política dele, com o hash exato desta versão\n'
        '/jogo/*\n'
        '  ! Content-Security-Policy\n'
        f'  Content-Security-Policy: {csp_jogo}\n'
        '\n'
        '/css/*\n  Cache-Control: public, max-age=604800\n'
        '/js/*\n  Cache-Control: public, max-age=604800\n'
        '/jogo/integracao.js\n  Cache-Control: public, max-age=604800\n'
        '/img/*\n  Cache-Control: public, max-age=31536000\n'
        '/fonts/*\n  Cache-Control: public, max-age=31536000\n'
        '/favicon.ico\n  Cache-Control: public, max-age=31536000\n'
        '/dados/*\n  Cache-Control: no-cache\n',
        encoding='utf-8')


if __name__ == '__main__':
    v, n, d = integrar()
    print(f'Jogo integrado: versão {v} · {n} scripts com hash · domínio: {d or "(placeholder)"}')
