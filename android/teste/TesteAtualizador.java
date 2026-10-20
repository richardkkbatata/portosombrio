import br.portosombrio.jogo.Atualizador;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;

/**
 * TESTE DA ATUALIZAÇÃO DO APP ANDROID — roda no computador, sem Android.
 *
 * Como rodar (do raiz do projeto):
 *   python3 -m http.server 8791 --directory <pasta com catalogo.json e os zips> &
 *   javac -d /tmp/aulas android/src/br/portosombrio/jogo/Atualizador.java android/teste/TesteAtualizador.java
 *   java -cp /tmp/aulas TesteAtualizador http://127.0.0.1:8791 <pasta de trabalho>
 *
 * Termina com "TUDO OK" se tudo passou.
 */
public class TesteAtualizador {
  static int erros = 0, feitos = 0;

  static void ok(String nome, boolean cond) {
    feitos++;
    if (cond) System.out.println("ok   " + nome);
    else { erros++; System.out.println("ERRO " + nome); }
  }

  public static void main(String[] a) throws Exception {
    String base = a[0];
    File dir = new File(a[1]);
    Atualizador.permitirHttp = true;

    File baixado = new File(dir, "baixado/index.html");
    File tmp = new File(dir, "baixado/pacote.tmp");
    File ativo = new File(dir, "jogo/index.html");
    File reserva = new File(dir, "reserva/index.html");
    ativo.getParentFile().mkdirs();
    Files.write(ativo.toPath(), gordo("JOGO VELHO").getBytes(StandardCharsets.UTF_8));

    // 1. leitura do catálogo de verdade
    String json = Atualizador.baixarTexto(base + "/catalogo.json", 5000);
    ok("catálogo baixa", json != null);
    Atualizador.Info i = Atualizador.lerCatalogo(json, "porto-sombrio");
    ok("catálogo tem o jogo", i != null);
    ok("versão lida do catálogo", i != null && i.versao.matches("\\d+(\\.\\d+)+"));
    ok("sha256 lido (64 letras)", i != null && i.sha256.length() == 64);
    ok("tamanho lido", i != null && i.tamanho > 1000);
    ok("jogo que não existe no catálogo", Atualizador.lerCatalogo(json, "outro-jogo") == null);

    // 1b. novidades da versão (as notas que a tela do launcher mostra)
    ok("notas lidas do catálogo", i != null && i.notas.length > 0);
    ok("nota não vem vazia", i != null && i.notas[0].length() > 10);
    ok("notas nunca são null", Atualizador.notas("{\"sem\":1}").length == 0);
    String[] n2 = Atualizador.notas("{\"notas\": [\"um\", \"dois \\\"três\\\"\"], \"x\": 1}");
    ok("duas notas", n2.length == 2 && n2[0].equals("um"));
    ok("aspas dentro da nota", n2.length == 2 && n2[1].equals("dois \"três\""));

    // 2. comparação de versões
    ok("1.14 > 1.13.1", Atualizador.maior("1.14", "1.13.1"));
    ok("1.9.2 > 1.9", Atualizador.maior("1.9.2", "1.9"));
    ok("1.9 não é maior que 1.14", !Atualizador.maior("1.9", "1.14"));
    ok("igual não é maior", !Atualizador.maior("1.14", "1.14"));
    ok("texto estranho não quebra", !Atualizador.maior(null, "1.0"));

    // 3. caminho feliz: baixa, confere sha256, tira o index.html
    String v = Atualizador.procurarEBaixar(base + "/catalogo.json", "porto-sombrio", "1.0", baixado, tmp);
    ok("baixou a versão nova", v != null && v.equals(i.versao));
    ok("index.html baixado existe", baixado.exists() && baixado.length() > 1000);
    ok("é o HTML do jogo preparado", texto(baixado).contains("<meta charset")
        && texto(baixado).contains("Porto Sombrio") && texto(baixado).contains("app.js"));
    ok("o arquivo .tmp foi apagado", !tmp.exists());
    ok("o jogo ativo não foi mexido ainda", texto(ativo).contains("JOGO VELHO"));

    // 3b. andamento do download (a barra de progresso da tela do launcher)
    baixado.delete();
    final long[] ultimo = {-1, 0, 0};   // último "feito", total, quantas vezes avisou
    final boolean[] cresce = {true};
    Atualizador.Progresso p = new Atualizador.Progresso() {
      public void andou(long feito, long total) {
        if (feito < ultimo[0]) cresce[0] = false;
        ultimo[0] = feito; ultimo[1] = total; ultimo[2]++;
      }
    };
    String vp = Atualizador.procurarEBaixar(base + "/catalogo.json", "porto-sombrio", "1.0", baixado, tmp, p);
    ok("baixou avisando o andamento", vp != null && ultimo[2] > 0);
    ok("o andamento só cresce", cresce[0]);
    ok("terminou no tamanho do pacote", ultimo[0] == i.tamanho && ultimo[1] == i.tamanho);

    // 4. já está na versão do catálogo: não baixa nada
    baixado.delete();
    ok("sem versão nova, não baixa", Atualizador.procurarEBaixar(base + "/catalogo.json", "porto-sombrio", i.versao, baixado, tmp) == null);
    ok("nada sobrou", !baixado.exists() && !tmp.exists());

    // 5. sha256 errado no catálogo: recusa
    ok("sha256 errado recusa", Atualizador.procurarEBaixar(base + "/catalogo-sha-errado.json", "porto-sombrio", "1.0", baixado, tmp) == null);
    ok("nada gravado com sha errado", !baixado.exists() && !tmp.exists());

    // 6. zip estragado (mas com o sha256 certo do arquivo estragado): recusa
    ok("zip estragado recusa", Atualizador.procurarEBaixar(base + "/catalogo-zip-estragado.json", "porto-sombrio", "1.0", baixado, tmp) == null);
    ok("nada gravado com zip estragado", !baixado.exists() && !tmp.exists());

    // 7. zip sem index.html dentro: recusa
    ok("zip sem index.html recusa", Atualizador.procurarEBaixar(base + "/catalogo-sem-index.json", "porto-sombrio", "1.0", baixado, tmp) == null);

    // 8. tamanho diferente do que o catálogo diz: recusa
    ok("tamanho diferente recusa", Atualizador.procurarEBaixar(base + "/catalogo-tamanho-errado.json", "porto-sombrio", "1.0", baixado, tmp) == null);

    // 9. servidor fora do ar / endereço de outro domínio
    ok("servidor fora do ar", Atualizador.procurarEBaixar("http://127.0.0.1:8799/catalogo.json", "porto-sombrio", "1.0", baixado, tmp) == null);
    ok("endereço de fora é recusado", Atualizador.baixarTexto("https://exemplo.com/catalogo.json", 3000) == null);
    ok("http comum é recusado", Atualizador.baixarTexto("http://nightgetaway.net.br/launcher/catalogo.json", 3000) == null);

    // 10. troca no ar (atômica) e volta atrás
    v = Atualizador.procurarEBaixar(base + "/catalogo.json", "porto-sombrio", "1.0", baixado, tmp);
    ok("baixou de novo", v != null);
    ok("trocou o jogo", Atualizador.aplicar(baixado, ativo, reserva));
    ok("o ativo agora é o novo", texto(ativo).length() > 1000 && !texto(ativo).contains("JOGO VELHO"));
    ok("a reserva guardou o anterior", texto(reserva).contains("JOGO VELHO"));
    ok("o baixado saiu do caminho", !baixado.exists());
    ok("voltou para o anterior", Atualizador.voltar(reserva, ativo));
    ok("o ativo é o anterior outra vez", texto(ativo).contains("JOGO VELHO"));

    // 11. aplicar sem nada baixado não estraga nada
    ok("aplicar sem pacote não faz nada", !Atualizador.aplicar(baixado, ativo, reserva));
    ok("o jogo continua lá", texto(ativo).contains("JOGO VELHO"));

    // 12. arquivo vazio/pequeno não é aceito
    File pequeno = new File(dir, "baixado/pequeno.html");
    Files.write(pequeno.toPath(), "x".getBytes(StandardCharsets.UTF_8));
    ok("arquivo pequeno não é aceito", !Atualizador.aplicar(pequeno, ativo, reserva));

    // 13. sha256 de um arquivo conhecido
    File sa = new File(dir, "abc.txt");
    Files.write(sa.toPath(), "abc".getBytes(StandardCharsets.UTF_8));
    ok("sha256 confere", Atualizador.sha256(sa).equals("ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad"));
    ok("sha256 de arquivo que não existe", Atualizador.sha256(new File(dir, "nao-existe")).equals(""));

    System.out.println((erros == 0 ? "TUDO OK" : erros + " ERRO(S)") + " — " + feitos + " testes");
    if (erros > 0) System.exit(1);
  }

  static String texto(File f) throws Exception {
    return f.exists() ? new String(Files.readAllBytes(f.toPath()), StandardCharsets.UTF_8) : "";
  }

  static String gordo(String marca) {
    StringBuilder s = new StringBuilder("<!DOCTYPE html><html><body>" + marca);
    while (s.length() < 4000) s.append(" .");
    return s + "</body></html>";
  }
}
