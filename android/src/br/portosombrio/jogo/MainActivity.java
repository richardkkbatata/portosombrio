package br.portosombrio.jogo;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
import android.content.pm.ActivityInfo;
import android.content.pm.PackageInfo;
import android.graphics.Color;
import android.net.ConnectivityManager;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Vibrator;
import android.util.TypedValue;
import android.view.Gravity;
import android.view.KeyEvent;
import android.view.View;
import android.view.ViewGroup;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import android.widget.ImageView;
import android.widget.TextView;

import java.io.File;
import java.io.InputStream;
import java.io.OutputStream;
import java.io.FileOutputStream;

/**
 * Porto Sombrio para Android — launcher NightGetaway.
 *
 * O app abre numa TELA DE LAUNCHER (a "folha de arquivo" da NightGetaway, igual à do
 * Windows): versão instalada, versão nova se houver, novidades, JOGAR e ATUALIZAR.
 * Quando a pessoa toca em JOGAR, o jogo abre na WebView de sempre, em tela cheia.
 *
 * O jogo continua sendo lido SEMPRE do mesmo endereço:
 *   getFilesDir()/jogo/index.html   <- ENDEREÇO FIXO, nunca muda de versão para versão
 * É isso que mantém o save do jogador (localStorage) no lugar quando o jogo é atualizado.
 *
 * A tela do launcher é uma SEGUNDA WebView, com o armazenamento DESLIGADO
 * (setDomStorageEnabled(false)): ela não pode gravar nada, então não tem como encostar
 * no save do jogo nem sem querer.
 *
 * O index.html de dentro do APK é a "versão de fábrica": na primeira vez (ou quando o
 * app é atualizado com um jogo mais novo) ele é copiado para essa pasta. Sem internet,
 * o app abre a versão que já está lá.
 *
 * A atualização continua sendo baixada sozinha no Wi-Fi e entra na ABERTURA SEGUINTE —
 * nunca no meio da partida. Agora a pessoa também pode mandar baixar na mão pelo botão
 * ATUALIZAR (inclusive pelos dados móveis, avisando que gasta internet).
 */
public class MainActivity extends Activity {
  private static final String JOGO = "porto-sombrio";
  private static final String[] EXTRAS = {"app.css", "app.js"};
  private static final String TELA_LAUNCHER = "file:///android_asset/launcher.html";

  private FrameLayout raiz;
  private WebView launcher;         // a tela da NightGetaway
  private WebView web;              // o jogo (criado só quando a pessoa toca em JOGAR)
  private ImageView capa;
  private TextView aviso;
  private final Handler ui = new Handler(Looper.getMainLooper());
  private boolean pronto = false;
  private boolean jogando = false;
  private boolean voltouLongo = false;
  private boolean dicaVoltar = false;

  private SharedPreferences pref;
  private File ativo, reserva, baixado, tmp;
  private String versaoNova = "";    // versão do catálogo ainda não baixada
  private String[] notas = new String[0];
  private long tamanhoNovo = 0;
  private boolean checando = false, baixando = false;

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    Window w = getWindow();
    w.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
    entalhe(w);

    pref = getSharedPreferences("launcher", MODE_PRIVATE);
    File f = getFilesDir();
    ativo = new File(f, "jogo/index.html");
    reserva = new File(f, "reserva/index.html");
    baixado = new File(f, "baixado/index.html");
    tmp = new File(f, "baixado/pacote.tmp");

    raiz = new FrameLayout(this);
    raiz.setBackgroundColor(Color.BLACK);
    setContentView(raiz);

    criarLauncher();

    prepararJogo();        // versão de fábrica na primeira vez / depois de atualizar o app
    aplicarBaixado();      // se tinha uma versão baixada esperando, ela entra AGORA (antes de abrir)

    ui.postDelayed(new Runnable() { public void run() { procurar(false); } }, 800);
  }

  private String enderecoDoJogo() { return "file://" + ativo.getAbsolutePath(); }

  /* ------------------------------------------------------- tela do launcher */

  private void criarLauncher() {
    setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_FULL_SENSOR);  // a capa pode ficar em pé
    launcher = new WebView(this);
    launcher.setBackgroundColor(0xFFB89A62);
    launcher.setOverScrollMode(View.OVER_SCROLL_NEVER);
    launcher.setHorizontalScrollBarEnabled(false);
    launcher.setLongClickable(false);
    launcher.setOnLongClickListener(new View.OnLongClickListener() {
      public boolean onLongClick(View v) { return true; }
    });
    WebSettings s = launcher.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(false);      // esta tela NÃO grava nada: o save do jogo fica intocado
    s.setDatabaseEnabled(false);
    s.setAllowFileAccess(true);
    s.setTextZoom(100);
    s.setSupportZoom(false);
    s.setBuiltInZoomControls(false);
    s.setUseWideViewPort(false);
    launcher.addJavascriptInterface(new PonteLauncher(), "PSLauncher");
    launcher.setWebChromeClient(new WebChromeClient());
    launcher.setWebViewClient(new WebViewClient() {
      @Override public boolean shouldOverrideUrlLoading(WebView v, String url) {
        if (url.startsWith("file:///android_asset/")) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e) { }
        return true;
      }
    });
    raiz.addView(launcher, new FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));
    launcher.loadUrl(TELA_LAUNCHER);
  }

  /** O que a tela do launcher mostra. Tudo em texto simples, sem biblioteca de JSON. */
  private String estadoJson() {
    StringBuilder s = new StringBuilder("{");
    s.append("\"jogo\":\"Porto Sombrio\"");
    s.append(",\"versao\":").append(aspas(pref.getString("versao_jogo", versaoDoApp())));
    s.append(",\"nova\":").append(aspas(versaoNova));
    String p = pref.getString("versao_baixada", null);
    s.append(",\"pronta\":").append(aspas(p != null && baixado.exists() ? p : ""));
    s.append(",\"tamanho\":").append(tamanhoNovo);
    s.append(",\"rede\":").append(aspas(temRede() ? (redeMedida() ? "movel" : "wifi") : "sem"));
    s.append(",\"app\":").append(aspas(versaoDoApp() + " (" + codigoDoApp() + ")"));
    s.append(",\"baixando\":").append(baixando);
    s.append(",\"notas\":[");
    for (int i = 0; i < notas.length; i++) {
      if (i > 0) s.append(',');
      s.append(aspas(notas[i]));
    }
    s.append("]}");
    return s.toString();
  }

  private static String aspas(String t) {
    if (t == null) t = "";
    StringBuilder s = new StringBuilder("\"");
    for (int i = 0; i < t.length(); i++) {
      char c = t.charAt(i);
      if (c == '"' || c == '\\') s.append('\\').append(c);
      else if (c < 0x20) s.append(' ');
      else s.append(c);
    }
    return s.append('"').toString();
  }

  /** Manda um pedaço de estado para a tela (ela junta com o que já tem). */
  private void evento(final String json) {
    ui.post(new Runnable() {
      public void run() {
        if (launcher == null) return;
        try {
          launcher.evaluateJavascript("window.psEvento&&psEvento(" + json + ")", null);
        } catch (Throwable t) { }
      }
    });
  }

  private void atualizarTela() { evento(estadoJson()); }

  /** ponte da tela do launcher: window.PSLauncher */
  private class PonteLauncher {
    @JavascriptInterface public String estado() { return estadoJson(); }
    @JavascriptInterface public void telaPronta() { atualizarTela(); }
    @JavascriptInterface public void jogar() {
      ui.post(new Runnable() { public void run() { abrirJogo(); } });
    }
    @JavascriptInterface public void atualizar(final boolean aceitaDados) {
      ui.post(new Runnable() {
        public void run() {
          if (aceitaDados) pref.edit().putBoolean("dados_moveis", true).apply();
          procurar(true);
        }
      });
    }
    /** põe no ar agora a versão que já foi baixada */
    @JavascriptInterface public void usarBaixada() {
      ui.post(new Runnable() {
        public void run() {
          if (jogando) return;                 // nunca troca com o jogo aberto
          String v = pref.getString("versao_baixada", null);
          aplicarBaixado();
          String agora = pref.getString("versao_jogo", "0");
          if (v != null && v.equals(agora)) {
            versaoNova = "";
            evento("{\"msg_titulo\":\"Jogo atualizado\",\"msg\":\"Agora você está na versão "
                + agora + ".\"}");
          } else {
            evento("{\"msg_titulo\":\"Não deu certo\",\"msg_ruim\":true,"
                + "\"msg\":\"Não foi possível trocar o jogo agora. Tente de novo mais tarde.\"}");
          }
          atualizarTela();
        }
      });
    }
  }

  /* ----------------------------------------------------------- abrir o jogo */

  private void abrirJogo() {
    if (jogando) return;
    jogando = true;
    setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_SENSOR_LANDSCAPE);
    if (web == null) {
      criarJogo();
      web.loadUrl(enderecoDoJogo());
      conferirDepois();    // se a versão nova não abrir, volta para a anterior
    } else {
      web.onResume();
      web.evaluateJavascript("window.PSApp&&PSApp.fundo(false)", null);
    }
    web.setVisibility(View.VISIBLE);
    if (capa != null && !pronto) capa.setVisibility(View.VISIBLE);
    launcher.setVisibility(View.GONE);
    telaCheia();
  }

  /** Volta para a tela do launcher SEM fechar o jogo: a partida continua onde estava. */
  private void voltarAoLauncher() {
    if (!jogando) return;
    jogando = false;
    if (web != null) {
      web.evaluateJavascript("window.PSApp&&PSApp.fundo(true)", null);
      web.onPause();
      web.setVisibility(View.GONE);
    }
    if (capa != null) capa.setVisibility(View.GONE);
    setRequestedOrientation(ActivityInfo.SCREEN_ORIENTATION_FULL_SENSOR);
    launcher.setVisibility(View.VISIBLE);
    mostrarSistema();
    atualizarTela();
  }

  private void criarJogo() {
    web = new WebView(this);
    web.setBackgroundColor(Color.BLACK);
    web.setOverScrollMode(View.OVER_SCROLL_NEVER);
    web.setVerticalScrollBarEnabled(false);
    web.setHorizontalScrollBarEnabled(false);
    web.setLongClickable(false);
    web.setHapticFeedbackEnabled(false);
    web.setOnLongClickListener(new View.OnLongClickListener() { public boolean onLongClick(View v) { return true; } });
    web.setLayerType(View.LAYER_TYPE_HARDWARE, null);

    WebSettings s = web.getSettings();
    s.setJavaScriptEnabled(true);
    s.setDomStorageEnabled(true);
    s.setDatabaseEnabled(true);
    s.setMediaPlaybackRequiresUserGesture(false);
    s.setAllowFileAccess(true);
    s.setTextZoom(100);
    s.setSupportZoom(false);
    s.setBuiltInZoomControls(false);
    s.setDisplayZoomControls(false);
    s.setUseWideViewPort(true);
    s.setLoadWithOverviewMode(false);
    s.setCacheMode(WebSettings.LOAD_DEFAULT);

    web.addJavascriptInterface(new Nativo(), "PSNativo");
    web.setWebChromeClient(new WebChromeClient());
    web.setWebViewClient(new WebViewClient() {
      @Override public boolean shouldOverrideUrlLoading(WebView v, String url) {
        if (url.startsWith("file:")) return false;
        try { startActivity(new Intent(Intent.ACTION_VIEW, Uri.parse(url))); } catch (Exception e) { }
        return true;
      }
      @Override public void onPageFinished(WebView v, String url) {
        // segurança: se o jogo não avisar que está pronto, tira a capa assim mesmo
        ui.postDelayed(new Runnable() { public void run() { tiraCapa(); } }, 2500);
      }
      @Override public void onReceivedError(WebView v, int codigo, String desc, String url) {
        if (url != null && url.equals(enderecoDoJogo())) ui.post(new Runnable() { public void run() { desfazer(); } });
      }
    });
    raiz.addView(web, new FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

    capa = new ImageView(this);
    capa.setImageResource(R.drawable.logo_abertura);
    capa.setScaleType(ImageView.ScaleType.CENTER);
    capa.setBackgroundColor(Color.BLACK);
    raiz.addView(capa, new FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

    aviso = new TextView(this);
    aviso.setTextColor(0xFFD8D2C2);
    aviso.setBackgroundColor(0xCC000000);
    aviso.setTextSize(TypedValue.COMPLEX_UNIT_SP, 12);
    int p = (int) (10 * getResources().getDisplayMetrics().density);
    aviso.setPadding(p, p / 2, p, p / 2);
    aviso.setVisibility(View.GONE);
    FrameLayout.LayoutParams lpA = new FrameLayout.LayoutParams(
        ViewGroup.LayoutParams.WRAP_CONTENT, ViewGroup.LayoutParams.WRAP_CONTENT, Gravity.BOTTOM | Gravity.START);
    lpA.setMargins(p, p, p, p);
    raiz.addView(aviso, lpA);
  }

  /* ----------------------------------------------------------- versão de fábrica */

  /**
   * Copia o jogo de dentro do APK para a pasta fixa, quando ela está vazia ou quando
   * o app foi atualizado (um APK novo pode trazer um jogo mais novo que o baixado).
   */
  private void prepararJogo() {
    try {
      ativo.getParentFile().mkdirs();
      String fabrica = versaoDoApp();
      int rev = codigoDoApp();
      boolean vazio = !ativo.exists() || ativo.length() < 1024;
      boolean appNovo = pref.getInt("rev_app", -1) != rev;
      if (vazio || appNovo) {
        for (String nome : EXTRAS) copiarAsset(nome, new File(ativo.getParentFile(), nome));
        copiarFontes();
      }
      if (vazio || (appNovo && Atualizador.maior(fabrica, pref.getString("versao_jogo", "0")))) {
        File meio = new File(ativo.getParentFile(), "index.novo");
        if (copiarAsset("index.html", meio) && Atualizador.trocar(meio, ativo)) {
          pref.edit().putString("versao_jogo", fabrica).remove("versao_baixada")
              .remove("conferir").remove("ruim").apply();
          baixado.delete();
        }
      }
      if (appNovo) pref.edit().putInt("rev_app", rev).apply();
    } catch (Throwable t) { }
  }

  private boolean copiarAsset(String nome, File destino) {
    InputStream in = null;
    OutputStream fora = null;
    try {
      destino.getParentFile().mkdirs();
      in = getAssets().open(nome);
      fora = new FileOutputStream(destino);
      byte[] b = new byte[32 * 1024];
      int n;
      while ((n = in.read(b)) > 0) fora.write(b, 0, n);
      fora.flush();
      return true;
    } catch (Throwable t) {
      return false;
    } finally {
      try { if (in != null) in.close(); } catch (Exception e) { }
      try { if (fora != null) fora.close(); } catch (Exception e) { }
    }
  }

  private void copiarFontes() {
    try {
      String[] lista = getAssets().list("fonts");
      if (lista == null) return;
      for (String nome : lista) copiarAsset("fonts/" + nome, new File(ativo.getParentFile(), "fonts/" + nome));
    } catch (Throwable t) { }
  }

  private String versaoDoApp() {
    try {
      PackageInfo i = getPackageManager().getPackageInfo(getPackageName(), 0);
      return i.versionName == null ? "0" : i.versionName;
    } catch (Throwable t) { return "0"; }
  }

  private int codigoDoApp() {
    try { return getPackageManager().getPackageInfo(getPackageName(), 0).versionCode; } catch (Throwable t) { return -1; }
  }

  /* ------------------------------------------------------------ troca e desfazer */

  /** Põe no ar a versão que foi baixada na vez passada. */
  private void aplicarBaixado() {
    String nova = pref.getString("versao_baixada", null);
    if (nova == null || !baixado.exists()) return;
    String antiga = pref.getString("versao_jogo", "0");
    if (Atualizador.aplicar(baixado, ativo, reserva)) {
      pref.edit().putString("versao_jogo", nova).putString("versao_reserva", antiga)
          .putString("conferir", nova).remove("versao_baixada").apply();
      if (versaoNova.equals(nova)) versaoNova = "";
      mostrar(getString(R.string.atualizado) + " " + nova, 7000, null);
    } else {
      pref.edit().remove("versao_baixada").apply();
      baixado.delete();
    }
  }

  /** Se a versão que acabou de entrar não disser "pronto" em 20 s, volta para a anterior. */
  private void conferirDepois() {
    if (pref.getString("conferir", null) == null) return;
    ui.postDelayed(new Runnable() { public void run() { desfazer(); } }, 20000);
  }

  /** Volta para a versão anterior do jogo e abre de novo. */
  private void desfazer() {
    String v = pref.getString("conferir", null);
    if (v == null || web == null) return;
    pref.edit().remove("conferir").apply();
    if (Atualizador.voltar(reserva, ativo)) {
      // marca a versão como ruim para não baixar a mesma de novo sem parar
      pref.edit().putString("versao_jogo", pref.getString("versao_reserva", "0")).putString("ruim", v).apply();
      mostrar(getString(R.string.voltou), 9000, null);
      web.clearCache(true);
      web.loadUrl(enderecoDoJogo());
    }
  }

  /* -------------------------------------------------------------- atualização */

  private boolean redeMedida() {
    try {
      ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
      return cm == null || cm.isActiveNetworkMetered();
    } catch (Throwable t) { return true; }
  }

  /** Rede boa para baixar sozinho? Wi-Fi (rede não medida) sempre; dados móveis só se a pessoa deixar. */
  private boolean redeBoa() {
    if (!temRede()) return false;
    if (!redeMedida()) return true;
    return pref.getBoolean("dados_moveis", false);
  }

  private boolean temRede() {
    try {
      ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
      return cm != null && cm.getActiveNetworkInfo() != null && cm.getActiveNetworkInfo().isConnected();
    } catch (Throwable t) { return false; }
  }

  /**
   * Lê o catálogo e, se for o caso, baixa a versão nova.
   * "forcado" = a pessoa tocou em ATUALIZAR (aí baixa mesmo nos dados móveis).
   * Sem "forcado" o download só acontece no Wi-Fi, como sempre foi.
   */
  private void procurar(final boolean forcado) {
    if (checando || baixando) return;
    if (!temRede()) { atualizarTela(); return; }
    checando = true;
    final String local = pref.getString("versao_jogo", versaoDoApp());
    new Thread(new Runnable() {
      public void run() {
        Atualizador.Info info = null;
        try {
          info = Atualizador.lerCatalogo(Atualizador.baixarTexto(Atualizador.CATALOGO, Atualizador.ESPERA), JOGO);
        } catch (Throwable t) { }
        final Atualizador.Info achada = info;
        ui.post(new Runnable() {
          public void run() {
            checando = false;
            if (achada == null) { atualizarTela(); return; }
            notas = achada.notas;
            String ruim = pref.getString("ruim", "");
            boolean temNova = Atualizador.maior(achada.versao, local) && !achada.versao.equals(ruim);
            versaoNova = temNova ? achada.versao : "";
            tamanhoNovo = temNova ? achada.tamanho : 0;
            atualizarTela();
            if (temNova && (forcado || redeBoa())) baixarAgora(local);
          }
        });
      }
    }).start();
  }

  /** Baixa o pacote agora, avisando a tela do launcher a cada pedaço. */
  private void baixarAgora(final String local) {
    if (baixando) return;
    baixando = true;
    atualizarTela();
    final Atualizador.Progresso p = new Atualizador.Progresso() {
      private int ultimo = -1;
      public void andou(long feito, long total) {
        int pct = total > 0 ? (int) (feito * 100 / total) : 0;
        if (pct == ultimo) return;
        ultimo = pct;
        evento("{\"baixando\":true,\"pct\":" + pct + "}");
      }
    };
    new Thread(new Runnable() {
      public void run() {
        String v = null;
        try {
          v = Atualizador.procurarEBaixar(Atualizador.CATALOGO, JOGO, local, baixado, tmp, p);
        } catch (Throwable t) { }
        final String achada = v;
        ui.post(new Runnable() {
          public void run() {
            baixando = false;
            if (achada != null) {
              pref.edit().putString("versao_baixada", achada).apply();
              versaoNova = "";
              mostrar(getString(R.string.pronta) + " " + achada + getString(R.string.pronta_fim), 10000, null);
            } else {
              evento("{\"msg_titulo\":\"Não deu para baixar\",\"msg_ruim\":true,"
                  + "\"msg\":\"A internet falhou no meio do caminho. O jogo continua funcionando; "
                  + "dá para tentar de novo mais tarde.\"}");
            }
            atualizarTela();
          }
        });
      }
    }).start();
  }

  /* ------------------------------------------------------------------- avisos */

  /** Aviso discreto no canto de baixo, dentro do jogo. "some" em milissegundos (0 = fica). */
  private void mostrar(String texto, int some, View.OnClickListener aoTocar) {
    if (aviso == null) return;
    aviso.setText(texto);
    aviso.setOnClickListener(aoTocar);
    aviso.setClickable(aoTocar != null);
    aviso.setAlpha(1f);
    aviso.setVisibility(jogando ? View.VISIBLE : View.GONE);
    ui.removeCallbacks(limpar);
    if (some > 0) ui.postDelayed(limpar, some);
  }

  private final Runnable limpar = new Runnable() { public void run() { esconder(); } };

  private void esconder() {
    if (aviso == null || aviso.getVisibility() != View.VISIBLE) return;
    if (aviso.isClickable()) return;        // aviso que espera um toque não sai sozinho
    aviso.animate().alpha(0f).setDuration(400).withEndAction(new Runnable() {
      public void run() { aviso.setVisibility(View.GONE); }
    }).start();
  }

  /* --------------------------------------------------------------------- tela */

  private void tiraCapa() {
    if (pronto || capa == null) return;
    pronto = true;
    capa.animate().alpha(0f).setDuration(350).withEndAction(new Runnable() {
      public void run() { capa.setVisibility(View.GONE); }
    }).start();
  }

  /** usa a área do entalhe (câmera) da tela, quando o aparelho tem (Android 9+). */
  private void entalhe(Window w) {
    if (Build.VERSION.SDK_INT < 28) return;
    try {
      WindowManager.LayoutParams lp = w.getAttributes();
      lp.getClass().getField("layoutInDisplayCutoutMode").setInt(lp, 1); // SHORT_EDGES
      w.setAttributes(lp);
    } catch (Exception e) { }
  }

  private void telaCheia() {
    if (Build.VERSION.SDK_INT >= 19) getWindow().getDecorView().setSystemUiVisibility(
        View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY | View.SYSTEM_UI_FLAG_FULLSCREEN | View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
        | View.SYSTEM_UI_FLAG_LAYOUT_STABLE | View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN | View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION);
  }

  /** na tela do launcher a barra do Android volta: é uma tela de menu, não o jogo. */
  private void mostrarSistema() {
    if (Build.VERSION.SDK_INT >= 19) getWindow().getDecorView().setSystemUiVisibility(View.SYSTEM_UI_FLAG_LAYOUT_STABLE);
  }

  /** ponte com o jogo: window.PSNativo */
  private class Nativo {
    @JavascriptInterface public void vibrar(long ms) {
      try {
        Vibrator v = (Vibrator) getSystemService(Context.VIBRATOR_SERVICE);
        if (v != null && v.hasVibrator()) v.vibrate(Math.max(1, Math.min(ms, 1000)));
      } catch (Exception e) { }
    }
    @JavascriptInterface public void pronto() {
      ui.post(new Runnable() {
        public void run() {
          tiraCapa();
          // o jogo abriu: a versão nova está boa, não precisa mais voltar atrás
          if (pref.getString("conferir", null) != null) pref.edit().remove("conferir").apply();
        }
      });
    }
    /** a versão do jogo que está rodando (o jogo pode mostrar, se quiser) */
    @JavascriptInterface public String versao() { return pref.getString("versao_jogo", "0"); }
  }

  @Override public void onWindowFocusChanged(boolean f) {
    super.onWindowFocusChanged(f);
    if (f && jogando) telaCheia();
  }

  @Override protected void onPause() {
    super.onPause();
    if (web != null) {
      web.evaluateJavascript("window.PSApp&&PSApp.fundo(true)", null);
      web.onPause();
    }
  }

  @Override protected void onResume() {
    super.onResume();
    if (jogando && web != null) {
      web.onResume();
      web.evaluateJavascript("window.PSApp&&PSApp.fundo(false)", null);
      telaCheia();
    } else {
      mostrarSistema();
      atualizarTela();
    }
  }

  /* ------------------------------------------------------------ botão voltar
   * Dentro do jogo: um toque continua virando Esc (pausa), igual a antes.
   * SEGURAR o voltar sai do jogo e mostra o launcher de novo — o jogo fica aberto
   * por trás, então nada se perde. Na tela do launcher, voltar fecha o aplicativo. */

  @Override public boolean onKeyDown(int codigo, KeyEvent e) {
    if (codigo == KeyEvent.KEYCODE_BACK && jogando) {
      e.startTracking();
      voltouLongo = false;
      return true;
    }
    return super.onKeyDown(codigo, e);
  }

  @Override public boolean onKeyLongPress(int codigo, KeyEvent e) {
    if (codigo == KeyEvent.KEYCODE_BACK && jogando) {
      voltouLongo = true;
      voltarAoLauncher();
      return true;
    }
    return super.onKeyLongPress(codigo, e);
  }

  @Override public boolean onKeyUp(int codigo, KeyEvent e) {
    if (codigo == KeyEvent.KEYCODE_BACK && jogando) {
      if (!voltouLongo && web != null) {
        web.evaluateJavascript(
            "window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',keyCode:27,bubbles:true}))", null);
        if (!dicaVoltar) { dicaVoltar = true; mostrar(getString(R.string.dica_voltar), 6000, null); }
      }
      voltouLongo = false;
      return true;
    }
    return super.onKeyUp(codigo, e);
  }

  @Override public void onBackPressed() {
    if (jogando) return;    // tratado em onKeyUp
    finish();               // na tela do launcher, voltar fecha o app
  }
}
