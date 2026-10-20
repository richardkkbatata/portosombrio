package br.portosombrio.jogo;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.FileInputStream;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.security.MessageDigest;
import java.util.Enumeration;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipFile;

/**
 * NÚCLEO DA ATUALIZAÇÃO (launcher NightGetaway) — Java puro, sem nada do Android,
 * de propósito: assim a lógica roda no computador nos testes (ferramentas/teste_atualizador.java).
 *
 * O que ele faz, na ordem:
 *   1. lê o catálogo https://nightgetaway.net.br/launcher/catalogo.json
 *   2. compara a versão de lá com a versão que está no aparelho
 *   3. baixa o pacote (zip com um index.html dentro) para um arquivo .tmp
 *   4. confere o sha256 do zip; se não bater, apaga e desiste (fica a versão de antes)
 *   5. tira o index.html do zip para "baixado/index.html"
 * Quem troca o jogo pela versão baixada é a MainActivity, na ABERTURA seguinte
 * (nunca no meio da partida), com {@link #aplicar}.
 */
public final class Atualizador {

  /** só baixa deste domínio (e por https). Os testes ligam o permitirHttp para usar o servidor local. */
  public static final String DOMINIO = "nightgetaway.net.br";
  public static final String CATALOGO = "https://" + DOMINIO + "/launcher/catalogo.json";
  /** somente testes: deixa usar http://127.0.0.1 */
  public static boolean permitirHttp = false;

  public static final int ESPERA = 5000;              // 5 s para o catálogo (timeout curto)
  public static final int ESPERA_PACOTE = 60000;      // 60 s para o pacote
  public static final long LIMITE_CATALOGO = 512 * 1024;        // 512 KB
  public static final long LIMITE_PACOTE = 64L * 1024 * 1024;   // 64 MB
  public static final long LIMITE_HTML = 128L * 1024 * 1024;    // 128 MB descompactado

  private Atualizador() { }

  /**
   * Quem quiser acompanhar o download (a barra de progresso da tela do launcher).
   * "total" é 0 quando o servidor não diz o tamanho.
   */
  public interface Progresso {
    void andou(long baixado, long total);
  }

  /** O que o catálogo diz sobre um jogo. */
  public static final class Info {
    public final String versao, url, sha256;
    public final long tamanho;
    /** "Novidades desta versão" — as frases da updates.json. Nunca null (pode ser vazio). */
    public final String[] notas;
    Info(String versao, String url, String sha256, long tamanho, String[] notas) {
      this.versao = versao; this.url = url; this.sha256 = sha256; this.tamanho = tamanho;
      this.notas = notas == null ? new String[0] : notas;
    }
    public String toString() { return versao + " " + url + " " + sha256 + " " + tamanho; }
  }

  /* ------------------------------------------------------------------ catálogo */

  /**
   * Tira do catálogo a versão e o pacote Android de um jogo. Sem biblioteca de JSON
   * (o catálogo é gerado pelo nosso próprio script, o formato é sempre o mesmo).
   * Devolve null se não achar o jogo ou faltar algum campo.
   */
  public static Info lerCatalogo(String json, String idJogo) {
    if (json == null) return null;
    int i = json.indexOf("\"" + idJogo + "\"");
    if (i < 0) return null;
    String trecho = json.substring(i);
    int fim = trecho.indexOf("\"id\"", 4);                 // começo do próximo jogo, se tiver
    if (fim > 0) trecho = trecho.substring(0, fim);
    String versao = campo(trecho, "versao");
    int p = trecho.indexOf("\"pacote_android\"");
    if (versao == null || p < 0) return null;
    String pac = trecho.substring(p);
    int f = pac.indexOf('}');
    if (f > 0) pac = pac.substring(0, f);
    String url = campo(pac, "url"), sha = campo(pac, "sha256"), tam = campo(pac, "tamanho");
    if (url == null || sha == null) return null;
    long t = 0;
    try { t = Long.parseLong(tam); } catch (Exception e) { }
    return new Info(versao, url, sha.toLowerCase(), t, notas(trecho));
  }

  /** Tira a lista "notas": ["...","..."] do trecho do jogo no catálogo. */
  public static String[] notas(String trecho) {
    try {
      int i = trecho.indexOf("\"notas\"");
      if (i < 0) return new String[0];
      int a = trecho.indexOf('[', i), f = trecho.indexOf(']', a);
      if (a < 0 || f < 0) return new String[0];
      String dentro = trecho.substring(a + 1, f);
      java.util.ArrayList<String> lista = new java.util.ArrayList<String>();
      Matcher m = Pattern.compile("\"((?:[^\"\\\\]|\\\\.)*)\"").matcher(dentro);
      while (m.find() && lista.size() < 20) {
        String s = m.group(1).replace("\\\"", "\"").replace("\\n", " ").replace("\\/", "/").replace("\\\\", "\\");
        if (s.trim().length() > 0) lista.add(s.trim());
      }
      return lista.toArray(new String[0]);
    } catch (Throwable t) {
      return new String[0];
    }
  }

  private static String campo(String s, String nome) {
    Matcher m = Pattern.compile("\"" + nome + "\"\\s*:\\s*(?:\"([^\"]*)\"|([0-9]+))").matcher(s);
    return m.find() ? (m.group(1) != null ? m.group(1) : m.group(2)) : null;
  }

  /** true se "a" é uma versão maior que "b" (1.14 > 1.9.2 > 1.9). Texto estranho vale 0. */
  public static boolean maior(String a, String b) {
    int[] x = partes(a), y = partes(b);
    for (int i = 0; i < 4; i++) { if (x[i] != y[i]) return x[i] > y[i]; }
    return false;
  }

  private static int[] partes(String v) {
    int[] r = new int[4];
    if (v == null) return r;
    Matcher m = Pattern.compile("\\d+").matcher(v);
    for (int i = 0; i < 4 && m.find(); i++) {
      try { r[i] = Integer.parseInt(m.group()); } catch (Exception e) { r[i] = 0; }
    }
    return r;
  }

  /* -------------------------------------------------------------------- rede */

  private static void confereEndereco(String url) throws IOException {
    String u = url == null ? "" : url.toLowerCase();
    if (u.startsWith("https://" + DOMINIO + "/") || u.startsWith("https://www." + DOMINIO + "/")) return;
    if (permitirHttp && (u.startsWith("http://127.0.0.1") || u.startsWith("http://localhost"))) return;
    throw new IOException("endereco nao permitido: " + url);
  }

  private static HttpURLConnection abrir(String url, int espera) throws IOException {
    confereEndereco(url);
    HttpURLConnection c = (HttpURLConnection) new URL(url).openConnection();
    c.setConnectTimeout(espera);
    c.setReadTimeout(espera);
    c.setInstanceFollowRedirects(false);      // nada de pular para outro servidor
    c.setRequestProperty("User-Agent", "PortoSombrioApp");
    c.setRequestProperty("Accept-Encoding", "identity");
    return c;
  }

  /** Baixa o catálogo como texto. Devolve null se der qualquer problema. */
  public static String baixarTexto(String url, int espera) {
    HttpURLConnection c = null;
    try {
      c = abrir(url, espera);
      if (c.getResponseCode() != 200) return null;
      InputStream in = c.getInputStream();
      ByteArrayOutputStream fora = new ByteArrayOutputStream();
      copiar(in, fora, LIMITE_CATALOGO);
      return new String(fora.toByteArray(), "UTF-8");
    } catch (Exception e) {
      return null;
    } finally {
      if (c != null) c.disconnect();
    }
  }

  /** Baixa um arquivo. Devolve false (e apaga o pedaço baixado) se falhar. */
  public static boolean baixarArquivo(String url, File destino, int espera) {
    return baixarArquivo(url, destino, espera, null, 0);
  }

  /**
   * O mesmo, avisando o andamento (para a barra de progresso). "totalDica" é o tamanho
   * que o catálogo prometeu, usado quando o servidor não manda o tamanho.
   */
  public static boolean baixarArquivo(String url, File destino, int espera, Progresso p, long totalDica) {
    HttpURLConnection c = null;
    OutputStream fora = null;
    try {
      c = abrir(url, espera);
      if (c.getResponseCode() != 200) return false;
      destino.getParentFile().mkdirs();
      long total = c.getContentLength();
      if (total <= 0) total = totalDica;
      fora = new FileOutputStream(destino);
      copiar(c.getInputStream(), fora, LIMITE_PACOTE, p, total);
      fora.close(); fora = null;
      if (p != null) p.andou(destino.length(), total > 0 ? total : destino.length());
      return true;
    } catch (Exception e) {
      fechar(fora);
      destino.delete();
      return false;
    } finally {
      fechar(fora);
      if (c != null) c.disconnect();
    }
  }

  private static void copiar(InputStream in, OutputStream fora, long limite) throws IOException {
    copiar(in, fora, limite, null, 0);
  }

  private static void copiar(InputStream in, OutputStream fora, long limite, Progresso p, long total)
      throws IOException {
    byte[] b = new byte[32 * 1024];
    long feito = 0, avisado = 0;
    int n;
    while ((n = in.read(b)) > 0) {
      feito += n;
      if (feito > limite) throw new IOException("arquivo grande demais");
      fora.write(b, 0, n);
      // avisa no máximo a cada 64 KB, para não atrapalhar o download
      if (p != null && feito - avisado >= 64 * 1024) { avisado = feito; p.andou(feito, total); }
    }
    fora.flush();
  }

  private static void fechar(Object o) {
    try { if (o instanceof OutputStream) ((OutputStream) o).close(); } catch (Exception e) { }
    try { if (o instanceof InputStream) ((InputStream) o).close(); } catch (Exception e) { }
  }

  /* ------------------------------------------------------------- arquivo/zip */

  /** sha256 do arquivo, em letras minúsculas. "" se não der para ler. */
  public static String sha256(File f) {
    InputStream in = null;
    try {
      MessageDigest d = MessageDigest.getInstance("SHA-256");
      in = new FileInputStream(f);
      byte[] b = new byte[32 * 1024];
      int n;
      while ((n = in.read(b)) > 0) d.update(b, 0, n);
      StringBuilder s = new StringBuilder();
      for (byte x : d.digest()) s.append(Character.forDigit((x >> 4) & 15, 16)).append(Character.forDigit(x & 15, 16));
      return s.toString();
    } catch (Exception e) {
      return "";
    } finally {
      fechar(in);
    }
  }

  /**
   * Tira o index.html de dentro do zip e grava em "destino" (nome fixo: nada de caminho
   * vindo do zip, para um pacote estragado não escrever fora da pasta).
   */
  public static boolean extrairIndex(File zip, File destino) {
    ZipFile z = null;
    OutputStream fora = null;
    File meio = new File(destino.getParentFile(), destino.getName() + ".parte");
    try {
      z = new ZipFile(zip);
      ZipEntry e = z.getEntry("index.html");
      if (e == null) {                                     // procura em qualquer pasta dentro do zip
        for (Enumeration<? extends ZipEntry> it = z.entries(); it.hasMoreElements(); ) {
          ZipEntry c = it.nextElement();
          String n = c.getName();
          if (!c.isDirectory() && (n.endsWith("/index.html") || n.equals("index.html"))) { e = c; break; }
        }
      }
      if (e == null) throw new IOException("sem index.html no pacote");
      destino.getParentFile().mkdirs();
      fora = new FileOutputStream(meio);
      copiar(z.getInputStream(e), fora, LIMITE_HTML);
      fora.close(); fora = null;
      if (meio.length() < 1024) throw new IOException("index.html pequeno demais");
      if (!trocar(meio, destino)) throw new IOException("nao deu para gravar");
      return true;
    } catch (Exception ex) {
      fechar(fora);
      meio.delete();
      destino.delete();
      return false;
    } finally {
      fechar(fora);
      try { if (z != null) z.close(); } catch (Exception ex) { }
    }
  }

  /** Renomeia de uma vez (troca atômica). Se o destino já existir, apaga antes. */
  public static boolean trocar(File de, File para) {
    if (!de.exists()) return false;
    if (para.exists() && !para.delete()) return false;
    if (de.renameTo(para)) return true;
    return copia(de, para) && de.delete();
  }

  /** Cópia simples (usada quando o renomear não funciona e para guardar a reserva). */
  public static boolean copia(File de, File para) {
    InputStream in = null;
    OutputStream fora = null;
    try {
      para.getParentFile().mkdirs();
      in = new FileInputStream(de);
      fora = new FileOutputStream(para);
      copiar(in, fora, LIMITE_HTML);
      fora.close(); fora = null;
      return true;
    } catch (Exception e) {
      fechar(fora);
      para.delete();
      return false;
    } finally {
      fechar(in);
      fechar(fora);
    }
  }

  /**
   * Põe no ar a versão baixada: guarda o jogo de agora como reserva e troca o ativo.
   * Se algo der errado, o ativo continua como estava.
   */
  public static boolean aplicar(File baixado, File ativo, File reserva) {
    if (baixado == null || !baixado.exists() || baixado.length() < 1024) return false;
    if (ativo.exists() && !copia(ativo, reserva)) return false;   // sem reserva, não troca
    if (!trocar(baixado, ativo)) { voltar(reserva, ativo); return false; }
    return true;
  }

  /** Volta para a versão anterior (quando a nova não abriu). */
  public static boolean voltar(File reserva, File ativo) {
    if (reserva == null || !reserva.exists() || reserva.length() < 1024) return false;
    return copia(reserva, ativo);
  }

  /* ------------------------------------------------------------------ tudo junto */

  /**
   * Procura versão nova e deixa o pacote pronto em "baixado". NÃO troca o jogo.
   * Devolve a versão baixada, ou null se não tinha novidade (ou se algo falhou).
   * Nunca joga exceção: na dúvida, o app abre a versão que já tinha.
   */
  public static String procurarEBaixar(String urlCatalogo, String idJogo, String versaoLocal,
                                       File baixado, File tmp) {
    return procurarEBaixar(urlCatalogo, idJogo, versaoLocal, baixado, tmp, null);
  }

  /** O mesmo, avisando o andamento do download. */
  public static String procurarEBaixar(String urlCatalogo, String idJogo, String versaoLocal,
                                       File baixado, File tmp, Progresso p) {
    try {
      String json = baixarTexto(urlCatalogo, ESPERA);
      if (json == null) return null;
      Info info = lerCatalogo(json, idJogo);
      if (info == null || !maior(info.versao, versaoLocal)) return null;
      if (!baixarArquivo(info.url, tmp, ESPERA_PACOTE, p, info.tamanho)) return null;
      if (info.tamanho > 0 && tmp.length() != info.tamanho) { tmp.delete(); return null; }
      if (!info.sha256.equals(sha256(tmp))) { tmp.delete(); return null; }   // zip trocado/estragado
      boolean ok = extrairIndex(tmp, baixado);
      tmp.delete();
      return ok ? info.versao : null;
    } catch (Throwable t) {
      try { tmp.delete(); } catch (Throwable x) { }
      return null;
    }
  }
}
