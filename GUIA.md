# Guia passo a passo — Porto Sombrio

Instruções clique por clique. Os nomes dos botões podem variar um pouco (GoDaddy e Cloudflare mudam o painel às vezes, e alguns aparecem em inglês). Se algo não bater, procure o nome mais parecido ou mande um print pro Claude.

> **Nunca** passe senha, código de verificação ou dados do cartão para ninguém, nem para o Claude. Nenhum passo aqui precisa disso.

---

## A) Colocar o site no ar de graça (Cloudflare Pages) com o seu domínio da GoDaddy

O site fica hospedado de graça na Cloudflare, com cadeado (https) grátis. Na GoDaddy fica só o domínio.

### 1. Baixar o pacote
1. Baixe o `porto-sombrio-site.zip` que o Claude mandou na conversa, ou pegue no GitHub: repositório `portosombrio` → pasta `entregas/` → `porto-sombrio-site.zip` → **Download**.
2. **Não** descompacte.

### 2. Criar a conta grátis na Cloudflare
1. Abra **dash.cloudflare.com/sign-up**, crie a conta com e-mail e senha, e confirme o e-mail.
2. Se perguntar plano, escolha sempre **Free** (grátis). Não precisa de cartão.

### 3. Publicar o site
1. No menu da esquerda, clique em **Workers e Pages** (Workers & Pages).
2. Clique em **Criar** (Create / Create application).
3. Escolha a aba **Pages** e depois **Arrastar e soltar seus arquivos** / **Fazer upload de ativos** (Drag and drop your files / Upload assets).
4. Nome do projeto: `porto-sombrio` → **Criar projeto**.
5. Arraste o `porto-sombrio-site.zip` para o quadro (ou clique em **selecionar do computador**) → **Implantar site** (Deploy site).
6. Em uns segundos aparece um endereço tipo `porto-sombrio.pages.dev`. Abra para ver o site funcionando.

### 4. Ligar o seu domínio da GoDaddy
**4a. Adicionar o domínio na Cloudflare**
1. No menu da esquerda da Cloudflare, vá em **Início** (Account Home) → **Adicionar um domínio** (Add a domain / Onboard a domain).
2. Digite o seu domínio (sem www, ex.: `seudominio.com.br`) → deixe marcado **Verificar registros DNS automaticamente** → **Continuar**.
3. Plano: role até o fim e escolha **Free** → **Continuar**.
4. Na lista de registros DNS, só clique em **Continuar**.
5. A Cloudflare mostra **2 servidores de nomes** (algo como `ana.ns.cloudflare.com` e `bob.ns.cloudflare.com`). **Deixe essa aba aberta.**

**4b. Trocar os servidores de nomes na GoDaddy**
1. Em outra aba: **godaddy.com** → entre → **Meus produtos** → **Domínios** → clique no seu domínio.
2. Clique em **DNS** → aba **Servidores de nomes** → **Alterar servidores de nomes**.
3. Escolha **Usarei meus servidores de nomes** (ou "Vou usar meus próprios servidores de nomes").
4. Apague o que estiver lá e cole os **2 endereços** que a Cloudflare mostrou (um em cada campo) → **Salvar** → confirme.
   - Se pedir código, é o da verificação em duas etapas (só você vê).
   - Se aparecer aviso de **DNSSEC**, desative o DNSSEC na GoDaddy primeiro.
5. Volte na aba da Cloudflare e clique em **Verificar servidores de nomes agora**. Pode levar de minutos até 24 horas. A Cloudflare manda um e-mail quando o domínio estiver **Ativo**.

**4c. Apontar o domínio para o site**
1. Na Cloudflare: **Workers e Pages** → clique no projeto **porto-sombrio** → aba **Domínios personalizados** (Custom domains) → **Configurar um domínio personalizado**.
2. Digite `seudominio.com.br` → **Continuar** → **Ativar domínio**.
3. Repita e adicione também `www.seudominio.com.br`.
4. Espere ficar **Ativo** (o cadeado/SSL é criado sozinho, pode levar alguns minutos).

### 5. Ligar o HTTPS obrigatório e tirar o www
1. Na Cloudflare, clique no seu domínio (na página inicial da conta).
2. **SSL/TLS** → **Certificados de borda** (Edge Certificates) → ligue **Sempre usar HTTPS** (Always Use HTTPS).
3. **Regras** (Rules) → **Visão geral** → **Criar regra** → em **Modelos** escolha **Redirecionar de WWW para raiz** (Redirect from WWW to root) → **Implantar** (Deploy).
4. Teste: `http://seudominio.com.br` e `www.seudominio.com.br` devem cair em `https://seudominio.com.br` com cadeado.

> As proteções de segurança (CSP, HSTS, nosniff etc.) vão dentro do próprio zip, no arquivo `_headers`. Você não precisa configurar nada disso.

### 6. Dizer ao site qual é o seu domínio
Mande para o Claude: **"meu domínio é xxxxx.com.br"**. Ele troca em `site/js/config.js`, regenera tudo e te manda um zip novo. Aí é só fazer uma nova implantação (veja a parte C).

### 7. Google Search Console (opcional, ajuda a aparecer no Google)
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
- regenera o site e gera o zip novo.

Depois o Claude te manda o zip novo, e você faz uma **nova implantação** na Cloudflare (parte C, passo 4).

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

1. Mande o novo arquivo do jogo (o `.html`) aqui na conversa, ou coloque na pasta `novo-jogo/` do repositório. Se tiver versão Windows nova, mande junto `Porto Sombrio.exe`, `resources.neu` e `LEIA-ME.txt`.
2. Peça ao Claude: **"atualizar jogo"** (ou `/atualizar-jogo`). Se quiser, diga o que mudou na versão.
3. O Claude troca o jogo, adiciona a versão em **Atualizações** e te manda um `porto-sombrio-site.zip` novo.
4. Na Cloudflare: **Workers e Pages** → projeto **porto-sombrio** → **Criar nova implantação** (Create deployment) → arraste o zip novo → **Salvar e implantar**.
   - Na Cloudflare você sempre manda o zip **inteiro**. Ela troca tudo de uma vez, então não tem como esquecer arquivo.
5. Abra o site numa aba anônima e confira a versão nova no carimbo da página inicial.
6. Deu problema? Na mesma tela do projeto, em **Implantações**, clique nos três pontinhos da implantação anterior → **Reverter** (Rollback). O site volta como estava.

## D) O que VOCÊ precisa fazer de segurança

### Verificação em duas etapas (2FA)
- **GoDaddy:** foto do perfil → **Minha conta** (Account Settings) → **Login e PIN** (Login & PIN) → **Verificação em duas etapas** → **Adicionar** → escolha **App autenticador** (Google Authenticator ou Microsoft Authenticator). Evite usar só SMS.
- **Google** (AdSense e Gmail): **myaccount.google.com** → **Segurança** → **Verificação em duas etapas** → **Ativar**. Melhor ainda: crie uma **chave de acesso (passkey)** no mesmo lugar.
- **GitHub:** foto → **Settings** → **Password and authentication** → **Enable two-factor authentication** → use app autenticador. **Guarde os códigos de recuperação** num lugar seguro (impresso ou num gerenciador de senhas).

### Cloudflare
- **dash.cloudflare.com** → ícone do perfil → **Perfil** → **Autenticação** → **Autenticação de dois fatores** → ative com app autenticador e guarde os códigos de backup.

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
