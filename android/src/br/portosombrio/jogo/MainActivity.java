package br.portosombrio.jogo;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.content.SharedPreferences;
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
 * Porto Sombrio para Android (launcher NightGetaway). O jogo roda numa WebView em tela
 * cheia, com tudo que entrega "navegador" desligado.
 *
 * O jogo NÃO é mais lido de dentro do APK: ele fica em
 *   getFilesDir()/jogo/index.html   <- ENDEREÇO FIXO, nunca muda de versão para versão
 * e é esse endereço que a WebView abre sempre. Assim o save do jogador (localStorage)
 * continua no mesmo lugar quando o jogo é atualizado.
 *
 * O index.html de dentro do APK é a "versão de fábrica": na primeira vez (ou quando o
 * app é atualizado com um jogo mais novo) ele é copiado para essa pasta. Sem internet,
 * o app abre a versão que já está lá.
 *
 * A atualização é baixada em segundo plano (só no Wi-Fi, por padrão) e só entra na
 * ABERTURA SEGUINTE — nunca no meio da partida.
 */
public class MainActivity extends Activity {
  private static final String JOGO = "porto-sombrio";
  private static final String[] EXTRAS = {"app.css", "app.js"};

  private WebView web;
  private ImageView capa;
  private TextView aviso;
  private final Handler ui = new Handler(Looper.getMainLooper());
  private boolean pronto = false;

  private SharedPreferences pref;
  private File ativo, reserva, baixado, tmp;
  private String versaoNova;        // versão achada no catálogo que ainda não foi baixada
  private boolean checando = false;

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

    FrameLayout raiz = new FrameLayout(this);
    raiz.setBackgroundColor(Color.BLACK);

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
    raiz.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

    capa = new ImageView(this);
    capa.setImageResource(R.drawable.logo_abertura);
    capa.setScaleType(ImageView.ScaleType.CENTER);
    capa.setBackgroundColor(Color.BLACK);
    raiz.addView(capa, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

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

    setContentView(raiz);
    telaCheia();

    prepararJogo();        // versão de fábrica na primeira vez / depois de atualizar o app
    aplicarBaixado();      // se tinha uma versão baixada esperando, ela entra AGORA (antes de abrir)

    if (b != null) { web.restoreState(b); tiraCapa(); }
    else web.loadUrl(enderecoDoJogo());

    conferirDepois();      // se a versão nova não abrir, volta para a anterior
    ui.postDelayed(new Runnable() { public void run() { procurar(false); } }, 1200);
  }

  private String enderecoDoJogo() { return "file://" + ativo.getAbsolutePath(); }

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
    if (v == null) return;
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

  /** Rede boa para baixar? Wi-Fi (rede não medida) sempre; dados móveis só se a pessoa deixar. */
  private boolean redeBoa() {
    try {
      ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
      if (cm == null || cm.getActiveNetworkInfo() == null || !cm.getActiveNetworkInfo().isConnected()) return false;
      if (!cm.isActiveNetworkMetered()) return true;
      return pref.getBoolean("dados_moveis", false);
    } catch (Throwable t) { return false; }
  }

  private boolean temRede() {
    try {
      ConnectivityManager cm = (ConnectivityManager) getSystemService(Context.CONNECTIVITY_SERVICE);
      return cm != null && cm.getActiveNetworkInfo() != null && cm.getActiveNetworkInfo().isConnected();
    } catch (Throwable t) { return false; }
  }

  /**
   * Procura versão nova e baixa, em segundo plano. "forcado" = a pessoa tocou no aviso
   * para baixar pelos dados móveis.
   */
  private void procurar(final boolean forcado) {
    if (checando || !temRede()) return;
    if (!forcado && !redeBoa()) { avisarMedida(); return; }
    checando = true;
    final String local = pref.getString("versao_jogo", versaoDoApp());
    new Thread(new Runnable() {
      public void run() {
        String v = null;
        try {
          String json = Atualizador.baixarTexto(Atualizador.CATALOGO, Atualizador.ESPERA);
          Atualizador.Info info = Atualizador.lerCatalogo(json, JOGO);
          String ruim = pref.getString("ruim", "");
          if (info != null && Atualizador.maior(info.versao, local) && !info.versao.equals(ruim)) {
            versaoNova = info.versao;
            ui.post(new Runnable() { public void run() { mostrar(getString(R.string.baixando), 0, null); } });
            v = Atualizador.procurarEBaixar(Atualizador.CATALOGO, JOGO, local, baixado, tmp);
          }
        } catch (Throwable t) { }
        final String achada = v;
        ui.post(new Runnable() {
          public void run() {
            checando = false;
            if (achada != null) {
              pref.edit().putString("versao_baixada", achada).apply();
              mostrar(getString(R.string.pronta) + " " + achada + getString(R.string.pronta_fim), 10000, null);
            } else {
              esconder();
            }
          }
        });
      }
    }).start();
  }

  /** No 4G/5G: só avisa, e deixa a pessoa escolher baixar. */
  private void avisarMedida() {
    final String local = pref.getString("versao_jogo", versaoDoApp());
    new Thread(new Runnable() {
      public void run() {
        Atualizador.Info info = Atualizador.lerCatalogo(
            Atualizador.baixarTexto(Atualizador.CATALOGO, Atualizador.ESPERA), JOGO);
        if (info == null || !Atualizador.maior(info.versao, local)
            || info.versao.equals(pref.getString("ruim", ""))) return;
        final String v = info.versao;
        ui.post(new Runnable() {
          public void run() {
            mostrar(getString(R.string.so_wifi_1) + " " + v + getString(R.string.so_wifi_2), 0,
                new View.OnClickListener() {
                  public void onClick(View x) {
                    pref.edit().putBoolean("dados_moveis", true).apply();
                    aviso.setOnClickListener(null);
                    procurar(true);
                  }
                });
          }
        });
      }
    }).start();
  }

  /* ------------------------------------------------------------------- avisos */

  /** Aviso discreto no canto de baixo. "some" em milissegundos (0 = fica). */
  private void mostrar(String texto, int some, View.OnClickListener aoTocar) {
    if (aviso == null) return;
    aviso.setText(texto);
    aviso.setOnClickListener(aoTocar);
    aviso.setClickable(aoTocar != null);
    aviso.setAlpha(1f);
    aviso.setVisibility(View.VISIBLE);
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
      public void run() { capa.setVisibility(View.GONE); getWindow().setBackgroundDrawable(null); }
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

  @Override public void onWindowFocusChanged(boolean f) { super.onWindowFocusChanged(f); if (f) telaCheia(); }
  @Override protected void onSaveInstanceState(Bundle b) { super.onSaveInstanceState(b); web.saveState(b); }
  @Override protected void onPause() {
    super.onPause();
    web.evaluateJavascript("window.PSApp&&PSApp.fundo(true)", null);
    web.onPause();
  }
  @Override protected void onResume() {
    super.onResume(); web.onResume(); telaCheia();
    web.evaluateJavascript("window.PSApp&&PSApp.fundo(false)", null);
  }
  /* o botão voltar vira Esc (pausa) no jogo, em vez de fechar o app */
  @Override public void onBackPressed() {
    web.evaluateJavascript("window.dispatchEvent(new KeyboardEvent('keydown',{key:'Escape',code:'Escape',keyCode:27,bubbles:true}))", null);
  }
}
