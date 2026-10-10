import sys
def rep(path, old, new, count=1):
    s=open(path).read()
    n=s.count(old)
    if n!=count:
        raise SystemExit(f"[{path}] esperado {count} ocorrência(s), achei {n}:\n{old[:200]}")
    s=s.replace(old,new)
    open(path,'w').write(s)
