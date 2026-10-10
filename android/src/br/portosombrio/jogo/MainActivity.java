package br.portosombrio.jogo;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.os.Vibrator;
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

/**
 * Porto Sombrio para Android. O jogo (assets/index.html) roda numa WebView em tela cheia,
 * com tudo que entrega "navegador" desligado: sem tela branca, sem zoom, sem seleção de texto,
 * sem menu de segurar, sem rolagem elástica. Vibração e pausa de som são do aparelho.
 */
public class MainActivity extends Activity {
  private WebView web;
  private ImageView capa;
  private final Handler ui = new Handler(Looper.getMainLooper());
  private boolean pronto = false;

  @Override protected void onCreate(Bundle b) {
    super.onCreate(b);
    Window w = getWindow();
    w.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON | WindowManager.LayoutParams.FLAG_FULLSCREEN);
    entalhe(w);

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
    });
    raiz.addView(web, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

    capa = new ImageView(this);
    capa.setImageResource(R.drawable.logo_abertura);
    capa.setScaleType(ImageView.ScaleType.CENTER);
    capa.setBackgroundColor(Color.BLACK);
    raiz.addView(capa, new FrameLayout.LayoutParams(ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

    setContentView(raiz);
    telaCheia();
    if (b != null) { web.restoreState(b); tiraCapa(); }
    else web.loadUrl("file:///android_asset/index.html");
  }

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
    @JavascriptInterface public void pronto() { ui.post(new Runnable() { public void run() { tiraCapa(); } }); }
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
