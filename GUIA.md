# Guia passo a passo — Porto Sombrio

Instruções clique por clique. Os nomes dos botões podem variar um pouco conforme a GoDaddy atualiza o painel; se algo não bater, procure o nome mais parecido.

> **Nunca** passe senha, código de verificação ou dados do cartão para ninguém, nem para o Claude. Nenhum passo aqui precisa disso.

---

## A) Subir o site no cPanel da GoDaddy e ativar o SSL grátis

### 1. Baixar o pacote
1. No GitHub, abra o repositório `portosombrio`, entre na pasta `entregas/` e clique em `porto-sombrio-site.zip`.
2. Clique em **Download** (ou "View raw"). Salve no computador. **Não** precisa descompactar.

### 2. Abrir o Gerenciador de Arquivos
1. Entre em **godaddy.com** → **Entrar**.
2. Vá em **Meus produtos**.
3. Em **Hospedagem na Web**, clique em **Gerenciar** ao lado do seu plano.
4. Clique em **Administrador do cPanel** (cPanel Admin).
5. No cPanel, na seção **Arquivos**, clique em **Gerenciador de Arquivos** (File Manager).
6. Clique em **Configurações** (Settings, canto superior direito) → marque **Mostrar arquivos ocultos (dotfiles)** → **Salvar**. Isso é necessário para ver o `.htaccess`.

### 3. Enviar e extrair
1. Na coluna da esquerda, clique em **public_html**.
2. Se tiver algo de exemplo lá dentro (por exemplo uma página padrão da GoDaddy), selecione e **Excluir**. Não apague a pasta `.well-known` nem `cgi-bin` se existirem.
3. Clique em **Carregar** (Upload) → **Selecionar arquivo** → escolha `porto-sombrio-site.zip`. Espere a barra chegar em 100% e clique em **Voltar para /home/.../public_html**.
4. Clique com o botão direito em `porto-sombrio-site.zip` → **Extrair** (Extract) → confirme que o destino é `/public_html` → **Extract Files**.
5. Confira: dentro de `public_html` devem aparecer `index.html`, `.htaccess`, as pastas `jogar`, `jogo`, `css`, `js`, `img` etc. (e não uma pasta `site` com tudo dentro).
6. Apague o `porto-sombrio-site.zip` de dentro da `public_html` (botão direito → Excluir).

### 4. SSL grátis (cadeado do https)
Os planos de hospedagem cPanel da GoDaddy costumam incluir SSL. Faça nesta ordem:
1. No painel da GoDaddy (**Meus produtos** → **Hospedagem na Web** → **Gerenciar**), procure **SSL** / **Certificados SSL** / **Configurar SSL**. Se aparecer um botão **Configurar** ou **Ativar** para o seu domínio, clique e siga.
2. Se não aparecer: no **cPanel**, seção **Segurança**, clique em **SSL/TLS Status**. Marque o seu domínio e o `www.` dele e clique em **Run AutoSSL**. Espere alguns minutos.
3. Se não existir nenhuma das duas opções, abra o chat do suporte da GoDaddy e peça: "quero ativar o SSL gratuito do meu plano de hospedagem no domínio X".
4. Teste: abra `http://seudominio.com.br` — ele deve ir sozinho para `https://seudominio.com.br` com cadeado. Teste também `www.seudominio.com.br` (deve ir para o endereço sem www).

> O `.htaccess` já força HTTPS. Se o SSL ainda não estiver ativo, o navegador vai mostrar aviso de segurança até o certificado ficar pronto. Isso é normal nas primeiras horas.

### 5. Dizer ao site qual é o seu domínio
Mande para o Claude: **"meu domínio é xxxxx.com.br"**. Ele troca em `site/js/config.js`, regenera (sitemap, links, verificação "Jogue no site oficial") e te diz quais arquivos subir de novo.

### 6. Google Search Console (opcional, ajuda a aparecer no Google)
1. Abra **search.google.com/search-console** → **Adicionar propriedade** → **Prefixo do URL** → `https://seudominio.com.br`.
2. Verifique pelo método **Tag HTML** ou **Arquivo HTML** (mande para o Claude o que o Google pedir; ele coloca no site).
3. Em **Sitemaps**, envie `https://seudominio.com.br/sitemap.xml`.

---

## B) AdSense: criar conta, pegar o ca-pub, onde colar e verificar o site

### 1. Criar a conta
1. Abra **adsense.google.com** → **Começar** (Get started).
2. Entre com a sua conta Google (com verificação em duas etapas ativada — veja a parte D).
3. Informe o site: `seudominio.com.br`. País: **Brasil**. Aceite os termos.
4. Preencha **Pagamentos** → **Informações de pagamento** com os seus dados (isso é entre você e o Google; não mande para ninguém).

### 2. Pegar o seu ID (ca-pub)
1. No AdSense, clique em **Conta** → **Configurações** → **Informações da conta**.
2. Copie o **ID do editor**: `pub-1234567890123456` (16 números). No site ele vira `ca-pub-1234567890123456`.

> O ID do editor **não é senha nem segredo**: ele aparece no código de todo site com AdSense. Pode mandar para o Claude.

### 3. Colar no site
Mande para o Claude: **"meu ca-pub é ca-pub-1234567890123456"**. Ele:
- coloca o ID em `site/js/config.js` (o único lugar);
- atualiza o `ads.txt` automaticamente;
- regenera o site e diz o que subir no cPanel (normalmente `js/config.js`, `ads.txt` e `jogo/porto-sombrio.html`).

Se preferir fazer sozinho: no cPanel, abra `public_html/js/config.js` → botão direito → **Edit** → troque `ca-pub-XXXXXXXXXXXXXXXX` pelo seu → **Save Changes**. Depois edite `public_html/ads.txt` e deixe só esta linha (com o seu número):
```
google.com, pub-1234567890123456, DIRECT, f08c47fec0942fa0
```

### 4. Verificar o site no AdSense
1. No AdSense, vá em **Sites** → seu domínio → **Verificar**.
2. Escolha o método **Snippet do ads.txt** (o `ads.txt` já está pronto no site) ou **Snippet de código do AdSense** (o site já carrega o código assim que o ca-pub estiver no `config.js`).
3. Clique em **Verificar** → marque "Coloquei o código" → **Solicitar revisão**.
4. A análise do Google leva de alguns dias a algumas semanas. Até lá, os espaços de anúncio aparecem vazios ou não aparecem — é normal.

### 5. Criar o bloco de anúncio (para os espaços do site)
1. **Anúncios** → **Por bloco de anúncios** → **Anúncios de display** → nome: `porto-sombrio` → tipo **Responsivo** → **Criar**.
2. No código que aparecer, copie só o número de `data-ad-slot="1234567890"`.
3. Mande para o Claude: **"meu slot é 1234567890"** (ou cole no `config.js`, no campo `ADSENSE_SLOT`).
4. Recomendado: em **Anúncios** → **Por site** → seu site, deixe os **Anúncios automáticos desligados**, ou exclua as páginas `/jogar/` e `/jogo/`, para nenhum anúncio cobrir o jogo.

### 6. Anúncio premiado dentro do jogo (opcional, depois)
O "assistir um anúncio para continuar depois de morrer" usa o **H5 Games Ads**, um programa separado do Google que precisa de aprovação. Depois que o AdSense estiver aprovado, entre em **adsense.google.com/start/h5-games-ads** → **Apply now** (Inscrever-se). Até ser aprovado, o botão simplesmente não aparece e o jogo funciona normal.

---

## C) Atualizar o site quando sair versão nova do jogo

1. Coloque o novo arquivo do jogo (o `.html`) na pasta **`novo-jogo/`** do repositório. Se tiver versão Windows nova, coloque junto `Porto Sombrio.exe`, `resources.neu` e `LEIA-ME.txt`.
   - Pelo site do GitHub: abra a pasta `novo-jogo` → **Add file** → **Upload files** → arraste o arquivo → **Commit changes**.
   - Ou simplesmente anexe o arquivo na conversa com o Claude.
2. Peça ao Claude: **"atualizar jogo"** (ou `/atualizar-jogo`). Se quiser, diga o que mudou na versão.
3. O Claude troca o jogo, adiciona a versão em **Atualizações**, gera o zip e te manda a lista exata, por exemplo:
   ```
   [trocar]   jogo/porto-sombrio.html
   [trocar]   jogo/.htaccess
   [trocar]   dados/updates.json
   [trocar]   index.html ...
   ```
4. No cPanel → **Gerenciador de Arquivos** → **public_html**, o jeito mais fácil:
   1. Baixe do GitHub o `entregas/porto-sombrio-atualizacao.zip`.
   2. **Carregar** → escolha o zip.
   3. Botão direito no zip → **Extrair** → destino `/public_html` → confirme a substituição.
   4. Apague o zip. Apague também os arquivos marcados como **[apagar]** na lista (se houver).
5. Abra o site com **Ctrl + F5** (ou numa aba anônima) e confira a versão nova no carimbo da página inicial.
6. Avise o Claude que subiu, para ele registrar o envio.

> Importante: sempre troque o `jogo/.htaccess` junto com o `jogo/porto-sombrio.html`. Ele contém a "impressão digital" exata do jogo; se só um dos dois for trocado, o navegador bloqueia o jogo por segurança.

---

## D) O que VOCÊ precisa fazer de segurança

### Verificação em duas etapas (2FA)
- **GoDaddy:** foto do perfil → **Minha conta** (Account Settings) → **Login e PIN** (Login & PIN) → **Verificação em duas etapas** → **Adicionar** → escolha **App autenticador** (Google Authenticator ou Microsoft Authenticator). Evite usar só SMS.
- **Google** (AdSense e Gmail): **myaccount.google.com** → **Segurança** → **Verificação em duas etapas** → **Ativar**. Melhor ainda: crie uma **chave de acesso (passkey)** no mesmo lugar.
- **GitHub:** foto → **Settings** → **Password and authentication** → **Enable two-factor authentication** → use app autenticador. **Guarde os códigos de recuperação** num lugar seguro (impresso ou num gerenciador de senhas).

### Bloqueio do domínio (Domain Lock)
1. GoDaddy → **Meus produtos** → **Domínios** → clique no seu domínio.
2. Em **Configurações** (ou na parte de **Segurança**), ative **Bloqueio de domínio** / **Domain Lock** → **Ativado**.
3. Aproveite e ative **Renovação automática**, para o domínio não expirar e ser comprado por outra pessoa.
4. Mantenha a **Privacidade do domínio** ligada, para o seu e-mail e telefone não aparecerem publicamente.

### Nunca clique nos seus próprios anúncios
- Nem para testar, nem "pra ajudar". O Google detecta e pode **cancelar a conta e reter os ganhos**.
- Não peça para amigos, família ou seguidores clicarem.
- Para ver como o site fica com anúncios, use a ferramenta de pré-visualização do próprio AdSense.

### Outros cuidados
- Senha forte e diferente para GoDaddy, Google e GitHub (use um gerenciador de senhas).
- Desconfie de e-mail dizendo que o domínio vai expirar, que o AdSense foi suspenso ou pedindo para "confirmar dados" por um link. Entre sempre digitando o endereço do site no navegador.
- Ninguém da GoDaddy, do Google ou o Claude vai pedir a sua senha ou código de verificação.
