-- Contas NightGetaway: conta, sessões, saves na nuvem e extras (recordes, configurações).
CREATE TABLE IF NOT EXISTS contas (
  id TEXT PRIMARY KEY,
  usuario TEXT UNIQUE NOT NULL,
  email TEXT,
  senha_hash TEXT NOT NULL,
  senha_sal TEXT NOT NULL,
  apelido TEXT,
  criado INTEGER,
  ultimo_login INTEGER
);
CREATE TABLE IF NOT EXISTS sessoes (
  token_hash TEXT PRIMARY KEY,
  conta TEXT NOT NULL,
  expira INTEGER NOT NULL,
  aparelho TEXT
);
CREATE INDEX IF NOT EXISTS idx_sessoes_conta ON sessoes(conta);
CREATE TABLE IF NOT EXISTS saves (
  conta TEXT NOT NULL,
  jogo TEXT NOT NULL,
  slot INTEGER NOT NULL,
  dados TEXT NOT NULL,
  versao_jogo TEXT,
  atualizado INTEGER,
  resumo TEXT,
  PRIMARY KEY (conta, jogo, slot)
);
CREATE TABLE IF NOT EXISTS extras (
  conta TEXT NOT NULL,
  jogo TEXT NOT NULL,
  chave TEXT NOT NULL,
  valor TEXT,
  PRIMARY KEY (conta, jogo, chave)
);
