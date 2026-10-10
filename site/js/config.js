/*
  =====================================================================
  PORTO SOMBRIO — CONFIGURAÇÃO DO SITE (o ÚNICO lugar para trocar)
  =====================================================================
  1) DOMINIO: o seu domínio, sem "https://" e sem "www".  Ex.: 'portosombrio.com.br'
  2) ADSENSE_CLIENT: o seu ID do AdSense.  Ex.: 'ca-pub-1234567890123456'
  3) ADSENSE_SLOT: o número do bloco de anúncio (data-ad-slot).  Ex.: '1234567890'
  4) EMAIL: o e-mail que aparece na página Contato.

  Enquanto estiver com X (placeholder), os espaços de anúncio ficam
  invisíveis e nada do Google é carregado.

  Depois de trocar, peça pro Claude rodar:  python3 ferramentas/gerar_site.py
  (ele também atualiza o ads.txt, o sitemap.xml e os links do site).
*/
window.PS_CONFIG = {
  DOMINIO: 'SEUDOMINIO.com.br',
  ADSENSE_CLIENT: 'ca-pub-2897231611604599',
  ADSENSE_SLOT: 'XXXXXXXXXX',
  // A-ADS (a-ads.com): número do bloco. Aparece nos espaços de anúncio enquanto o
  // ADSENSE_SLOT acima não estiver preenchido. Vazio = sem A-ADS.
  A_ADS: '2458130',
  EMAIL: 'contato@SEUDOMINIO.com.br',
  INSTAGRAM: 'https://www.instagram.com/richardklettke',
  GITHUB: 'https://github.com/richardkkbatata',

  // Anúncio premiado dentro do jogo (H5 Games Ads). Deixe true só para TESTAR
  // (mostra anúncio de teste do Google). Em produção: false.
  ANUNCIO_TESTE: false
};
