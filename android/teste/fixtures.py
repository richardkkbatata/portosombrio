#!/usr/bin/env python3
"""Monta os catálogos e pacotes falsos do teste da atualização (android/teste/rodar.sh).

Uso: python3 android/teste/fixtures.py <raiz do projeto> <pasta do servidor local>
Gera, a partir do catálogo de verdade: um caso certo, um com sha256 errado, um com
tamanho errado, um zip estragado e um zip sem index.html dentro.
"""
import hashlib, json, shutil, sys, zipfile
from pathlib import Path

raiz, out = Path(sys.argv[1]), Path(sys.argv[2])
out.mkdir(parents=True, exist_ok=True)
lan = raiz / 'site' / 'launcher'
cat = json.loads((lan / 'catalogo.json').read_text(encoding='utf-8'))
shutil.copy(next((lan / 'porto-sombrio').glob('*-android.zip')), out / 'pacote.zip')
BASE = 'http://127.0.0.1:8791'


def sha(b):
    return hashlib.sha256(b).hexdigest()


def grava(nome, url, tamanho, sha256):
    c = json.loads(json.dumps(cat))
    c['jogos'][0]['pacote_android'] = {'url': url, 'tamanho': tamanho, 'sha256': sha256}
    (out / nome).write_text(json.dumps(c, ensure_ascii=False, indent=2), encoding='utf-8')


bom = (out / 'pacote.zip').read_bytes()
grava('catalogo.json', f'{BASE}/pacote.zip', len(bom), sha(bom))
grava('catalogo-sha-errado.json', f'{BASE}/pacote.zip', len(bom), '0' * 64)
grava('catalogo-tamanho-errado.json', f'{BASE}/pacote.zip', len(bom) + 10, sha(bom))

mal = bom[:len(bom) // 2]
(out / 'estragado.zip').write_bytes(mal)
grava('catalogo-zip-estragado.json', f'{BASE}/estragado.zip', len(mal), sha(mal))

with zipfile.ZipFile(out / 'sem-index.zip', 'w') as z:
    z.writestr('outro.txt', 'nada aqui')
b = (out / 'sem-index.zip').read_bytes()
grava('catalogo-sem-index.json', f'{BASE}/sem-index.zip', len(b), sha(b))
print('pacotes de teste em', out)
