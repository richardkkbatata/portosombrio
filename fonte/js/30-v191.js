// ===================== 1.9.1 · CELULAR: MENUS CABEM NA TELA =====================
// Antes: o .ov centralizava (ou alinhava embaixo) com flex + overflow:auto. Quando o conteúdo
// era maior que a tela (celular deitado), a parte de cima saía da tela e não dava pra rolar
// até ela ("Novo jogo" sumia). Agora o alinhamento é feito com margin:auto, que centraliza
// quando cabe e começa do topo (com rolagem) quando não cabe.
// No título com o celular deitado, os botões ficam em duas colunas pra caber sem rolar.
{const st=document.createElement('style');st.id='v191-css';st.textContent=`
.ov{align-items:flex-start;justify-content:flex-start}
.ov>*{margin:auto;flex-shrink:0;max-width:100%}
.ov.title-ov>*{margin:auto auto 0 0}
.ov.vn-ov>*{margin:auto auto 0}
@media (max-height:500px){
  .title{max-width:min(720px,100%);padding-block:4px}
  .title .menu{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));width:min(620px,100%);max-width:none;gap:5px 8px}
  .title .menu>*{min-width:0}
  .title .menu .btn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .title .lede{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
}
@media (orientation:portrait) and (max-height:880px){.title{gap:8px;padding-block:6px}.title .menu{gap:4px}.title .menu .btn{min-height:34px;font-size:13px;padding:4px 12px}.title .foot{display:none}.title .lede{font-size:13px}}
@media (max-height:380px){.title .menu .btn{min-height:30px;font-size:13px;padding:3px 12px}.title{gap:6px}}
@media (max-height:340px){.title .lede{display:none}.title h1{font-size:clamp(28px,10vh,40px)}}
`;try{(document.head||document.body).appendChild(st);}catch(e){}}

dbgExtra('1.9.1 · Menus no celular',[['v191:titulo','Abrir a tela de título'],['v191:dif','Abrir a escolha de dificuldade'],['v191:medir','Medir: algum botão fora da tela?']],function(k){
  if(k==='v191:titulo'){G.mode='title';return this.title();}
  if(k==='v191:dif'){G.mode='title';return this.diff();}
  if(k==='v191:medir'){
    const ov=document.getElementById('ov');
    const fora=[...ov.querySelectorAll('button')].filter(b=>{const r=b.getBoundingClientRect();return r.top<ov.getBoundingClientRect().top-1&&ov.scrollTop===0;}).length;
    toast(fora?`${fora} botão(ões) acima da tela`:`Tudo alcançável (${innerWidth}x${innerHeight})`);
  }
});
