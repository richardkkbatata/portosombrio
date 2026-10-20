#!/usr/bin/env python3
"""
MONTA O LAUNCHER DO WINDOWS (NightGetaway).

O launcher é o MESMO runtime do Neutralino que o jogo já usa no Windows
(o "Porto Sombrio.exe" do zip de downloads), com um resources.neu diferente:
dentro dele vai a tela do launcher (launcher/resources/) e o
launcher/neutralino.config.json.

O launcher NÃO roda o jogo dentro dele: ele troca o resources.neu da pasta de
jogos e ABRE o "Porto Sombrio.exe". Por isso o mesmo runtime vai duas vezes no
pacote: como NightGetaway.exe (o launcher) e como runtime/Porto Sombrio.exe
(o programa do jogo, que o launcher copia para a pasta de jogos na primeira vez).

Entrada:
  launcher/neutralino.config.json   -> configuração (porta sorteada, permissões)
  launcher/resources/*              -> index.html, estilo.css, launcher.js, fontes
  site/downloads/porto-sombrio-<versão>-windows.zip  -> de onde sai o .exe do Neutralino

Saída (em entregas/):
  entregas/launcher-windows/NightGetaway.exe
  entregas/launcher-windows/resources.neu
  entregas/launcher-windows/runtime/Porto Sombrio.exe
  entregas/launcher-windows/LEIA-ME.txt
  entregas/nightgetaway-launcher-<versão>-windows.zip

Usar:
  python3 ferramentas/gerar_launcher.py                 # monta
  python3 ferramentas/gerar_launcher.py --conferir      # só relê o .neu e confere
"""
import json
import struct
import sys
import zipfile
from pathlib import Path

AQUI = Path(__file__).resolve().parent
RAIZ = AQUI.parent
LAN = RAIZ / 'launcher'
SAIDA = RAIZ / 'entregas' / 'launcher-windows'

LEIA = """NIGHTGETAWAY — LAUNCHER (Windows)

1. Extraia a pasta inteira (NightGetaway.exe, resources.neu e a pasta runtime)
   e deixe tudo junto, do jeito que veio.
2. Abra o NightGetaway.exe.
3. O launcher confere se tem versao nova do jogo e baixa sozinho.
4. No botao JOGAR, o jogo abre numa janela so dele, igual ao zip de sempre.

Os jogos ficam em:  %LOCALAPPDATA%\\NightGetaway\\jogos
Seus saves ficam no computador e nao se perdem nas atualizacoes.

Sem internet o launcher abre a versao que ja esta instalada.
Site: https://nightgetaway.net.br
"""


# ------------------------------------------------------------------ asar
def ler_asar(caminho: Path):
    """Devolve {'caminho/do/arquivo': bytes} de um .neu (formato asar)."""
    d = caminho.read_bytes()
    _, b, _, n = struct.unpack('<IIII', d[:16])
    hdr = json.loads(d[16:16 + n])
    base = 8 + b
    arq = {}

    def anda(no, p):
        for k, v in no['files'].items():
            q = f'{p}/{k}' if p else k
            if 'files' in v:
                anda(v, q)
            else:
                o = int(v['offset'])
                arq[q] = d[base + o:base + o + v['size']]

    anda(hdr, '')
    return arq


def escrever_asar(destino: Path, arquivos: dict):
    """Grava um .neu (asar) com os arquivos dados (chave = caminho dentro do pacote)."""
    raiz = {'files': {}}
    blob = bytearray()
    for nome in sorted(arquivos):
        partes = nome.split('/')
        no = raiz
        for p in partes[:-1]:
            no = no['files'].setdefault(p, {'files': {}})
        dados = arquivos[nome]
        no['files'][partes[-1]] = {'offset': str(len(blob)), 'size': len(dados)}
        blob += dados
    js = json.dumps(raiz, separators=(',', ':')).encode()
    pad = (4 - len(js) % 4) % 4
    js2 = js + b'\0' * pad
    destino.parent.mkdir(parents=True, exist_ok=True)
    tmp = destino.with_suffix('.tmp')
    tmp.write_bytes(struct.pack('<IIII', 4, len(js2) + 8, len(js2) + 4, len(js)) + js2 + bytes(blob))
    tmp.replace(destino)


# ------------------------------------------------------------------ montagem
def achar_exe() -> bytes:
    """Tira o 'Porto Sombrio.exe' (runtime do Neutralino) do zip de downloads."""
    zips = sorted((RAIZ / 'site' / 'downloads').glob('porto-sombrio-*-windows.zip'))
    if not zips:
        sys.exit('não achei site/downloads/porto-sombrio-*-windows.zip para pegar o .exe do Neutralino')
    z = zips[-1]
    with zipfile.ZipFile(z) as zf:
        nomes = [n for n in zf.namelist() if n.lower().endswith('.exe')]
        if not nomes:
            sys.exit(f'{z.name} não tem .exe dentro')
        return zf.read(nomes[0])


def juntar_recursos():
    cfg_txt = (LAN / 'neutralino.config.json').read_text(encoding='utf-8')
    cfg = json.loads(cfg_txt)                       # só para validar e ler a versão
    arquivos = {'neutralino.config.json': json.dumps(cfg, indent=2).encode('utf-8')}
    base = LAN / 'resources'
    for p in sorted(base.rglob('*')):
        if p.is_file():
            arquivos['resources/' + p.relative_to(base).as_posix()] = p.read_bytes()
    return cfg, arquivos


def conferir(neu: Path, cfg: dict):
    arq = ler_asar(neu)
    c = json.loads(arq['neutralino.config.json'])
    erros = []
    if c != cfg:
        erros.append('o neutralino.config.json dentro do .neu saiu diferente do original')
    if 'resources/jogo.html' in arq:
        erros.append('resources/jogo.html não existe mais nesta arquitetura (uma página só, '
                     'senão o NL_TOKEN do Neutralino vence)')
    permissoes = c.get('nativeAllowList') or []
    if 'os.execCommand' not in permissoes and 'os.spawnProcess' not in permissoes:
        erros.append('falta os.execCommand no nativeAllowList (é como o launcher abre o jogo)')
    if not (c.get('logging') or {}).get('writeToLogFile'):
        erros.append('ligue o logging.writeToLogFile (para a próxima falha deixar rastro)')
    for obrig in ('resources/index.html', 'resources/launcher.js',
                  'resources/estilo.css', 'resources/neutralino.js'):
        if obrig not in arq:
            erros.append('falta ' + obrig)
    html = arq.get('resources/index.html', b'').decode('utf-8', 'replace')
    for pedaco in ('launcher.js', 'neutralino.js', 'NightGetaway'):
        if pedaco not in html:
            erros.append(f'o index.html dentro do .neu não menciona {pedaco}')
    if c.get('port') not in (0, None):
        erros.append('a porta tem que ser 0 (sorteada): porta fixa reaproveita a origem e '
                     'quebra o NL_TOKEN (NE_CL_IVCTOKN)')
    print(f'{neu}: {len(arq)} arquivos')
    for k in sorted(arq):
        print(f'   {k:46s} {len(arq[k]):>9d} bytes')
    if erros:
        for e in erros:
            print('ERRO:', e)
        sys.exit(1)
    print('.neu conferido: OK (porta sorteada · versão', c['version'], ')')
    return arq


def main():
    cfg, arquivos = juntar_recursos()
    neu = SAIDA / 'resources.neu'
    if '--conferir' in sys.argv:
        if not neu.exists():
            sys.exit('monte primeiro: python3 ferramentas/gerar_launcher.py')
        conferir(neu, cfg)
        return
    SAIDA.mkdir(parents=True, exist_ok=True)
    escrever_asar(neu, arquivos)
    runtime = achar_exe()
    exe = SAIDA / 'NightGetaway.exe'
    exe.write_bytes(runtime)
    (SAIDA / 'runtime').mkdir(parents=True, exist_ok=True)
    exe_jogo = SAIDA / 'runtime' / 'Porto Sombrio.exe'
    exe_jogo.write_bytes(runtime)      # o launcher copia este para a pasta de jogos
    (SAIDA / 'LEIA-ME.txt').write_text(LEIA, encoding='utf-8', newline='\r\n')
    conferir(neu, cfg)

    zip_final = RAIZ / 'entregas' / f"nightgetaway-launcher-{cfg['version']}-windows.zip"
    with zipfile.ZipFile(zip_final, 'w', zipfile.ZIP_DEFLATED, compresslevel=9) as z:
        pasta = f"NightGetaway {cfg['version']}"
        for nome in ('NightGetaway.exe', 'resources.neu', 'LEIA-ME.txt',
                     'runtime/Porto Sombrio.exe'):
            z.write(SAIDA / nome, f'{pasta}/{nome}')
    print(f'Launcher montado: {zip_final}  ({zip_final.stat().st_size // 1024} KB)')
    print(f'   exe {exe.stat().st_size // 1024} KB · resources.neu {neu.stat().st_size // 1024} KB')


if __name__ == '__main__':
    main()
