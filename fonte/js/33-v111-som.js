// ===================== 1.11 · O SOM DO MEDO =====================
// Todos os sons do jogo refeitos. Em vez de bipes de oscilador tocados na hora, o jogo agora
// "grava" (sintetiza) cada som uma vez, em JavaScript puro, logo depois de abrir: tiros com estalo,
// corpo, pancada grave e eco nos prédios; zumbis com voz rouca de verdade (fonte glotal + formantes);
// grito, uivo, passos, portas, vidro, explosões, trovão. Cada som tem variações, toca posicionado
// (esquerda/direita, abafado de longe) e com reverb melhor. Ambiente com chuva/vento/zumbido em loop,
// barulhos ao longe (estilo Darkwood), camada de tensão quando tem coisa te caçando, e música nova
// no menu e nos chefes. Enquanto os sons ainda não ficaram prontos, os antigos continuam tocando.
const SND={b:{},jobs:[],ok:false,started:false,active:0,beds:null,last:{}};
(function(){
  let SR=44100, seed=1;
  const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647;};
  const TAU=Math.PI*2;
  const len=d=>Math.max(1,Math.round(d*SR));
  function N(n){const a=new Float32Array(n);for(let i=0;i<n;i++)a[i]=rnd()*2-1;return a;}
  // ruído suave (vai e volta devagar), -1..1
  function smooth(n,rate){const a=new Float32Array(n),step=Math.max(1,Math.round(SR/rate));let v0=rnd()*2-1,v1=rnd()*2-1;
    for(let i=0;i<n;i++){const k=i%step;if(k===0&&i){v0=v1;v1=rnd()*2-1;}const u=k/step,s=u*u*(3-2*u);a[i]=v0+(v1-v0)*s;}return a;}
  function BQ(){this.x1=this.x2=this.y1=this.y2=0;}
  BQ.prototype.set=function(type,f,q){const w=TAU*Math.min(Math.max(f,10),SR*.45)/SR,cs=Math.cos(w),al=Math.sin(w)/(2*q);let b0,b1,b2;
    if(type==='lp'){b0=(1-cs)/2;b1=1-cs;b2=b0;}else if(type==='hp'){b0=(1+cs)/2;b1=-(1+cs);b2=b0;}else{b0=al;b1=0;b2=-al;}
    const a0=1+al;this.b0=b0/a0;this.b1=b1/a0;this.b2=b2/a0;this.a1=-2*cs/a0;this.a2=(1-al)/a0;return this;};
  BQ.prototype.p=function(x){const y=this.b0*x+this.b1*this.x1+this.b2*this.x2-this.a1*this.y1-this.a2*this.y2;this.x2=this.x1;this.x1=x;this.y2=this.y1;this.y1=Math.abs(y)<1e-20?0:y;return y;};
  // filtro (f pode ser número ou função do tempo em segundos); ord = quantas passadas (2, 4, 6... pólos)
  function F(x,type,f,q=.707,ord=1){for(let o=0;o<ord;o++){const b=new BQ(),fn=typeof f==='function';if(!fn)b.set(type,f,q);
    for(let i=0;i<x.length;i++){if(fn&&(i&31)===0)b.set(type,f(i/SR),q);x[i]=b.p(x[i]);}}return x;}
  const ex=(x,k,a=0)=>{for(let i=0;i<x.length;i++){const t=i/SR;x[i]*=Math.exp(-t*k)*(a>0?Math.min(1,t/a):1);}return x;};
  const add=(dst,src,off=0,g=1)=>{const o=Math.round(off*SR);for(let i=0;i<src.length&&o+i<dst.length;i++)if(o+i>=0)dst[o+i]+=src[i]*g;return dst;};
  const sat=(x,g)=>{const k=Math.tanh(g);for(let i=0;i<x.length;i++)x[i]=Math.tanh(x[i]*g)/k;return x;};
  const norm=(x,p=.95)=>{let m=0;for(const a of (Array.isArray(x)?x:[x]))for(let i=0;i<a.length;i++)m=Math.max(m,Math.abs(a[i]));
    m=p/(m||1);for(const a of (Array.isArray(x)?x:[x]))for(let i=0;i<a.length;i++)a[i]*=m;return x;};
  const fadeOut=(x,d=.02)=>{const n=Math.min(x.length,len(d));for(let i=0;i<n;i++)x[x.length-1-i]*=i/n;return x;};
  const blep=(t,dt)=>{if(t<dt){t/=dt;return t+t-t*t-1;}if(t>1-dt){t=(t-1)/dt;return t*t+t+t+1;}return 0;};
  // dente de serra sem chiado digital, f = função(t)
  function saw(n,f){const a=new Float32Array(n);let ph=rnd();for(let i=0;i<n;i++){const dt=f(i/SR)/SR;ph+=dt;if(ph>=1)ph-=1;a[i]=2*ph-1-blep(ph,dt);}return a;}
  function sweep(n,f,amp){const a=new Float32Array(n);let ph=0;for(let i=0;i<n;i++){const t=i/SR;ph+=f(t)/SR;a[i]=Math.sin(TAU*ph)*amp(t);}return a;}
  function ping(d,f,k){const n=len(d),a=new Float32Array(n);for(let i=0;i<n;i++){const t=i/SR;a[i]=Math.sin(TAU*f*t)*Math.exp(-t*k);}return a;}
  // loop sem emenda: os últimos 'cf' segundos são misturados no começo
  function loopify(x,cf){const c=len(cf),n=x.length-c,o=new Float32Array(n);for(let i=0;i<n;i++)o[i]=x[i];
    for(let i=0;i<c;i++){const u=i/c;o[i]=x[i]*Math.sqrt(u)+x[n+i]*Math.sqrt(1-u);}return o;}

  // ---------- VOZ (zumbis, gritos, gemidos do Richard) ----------
  const VW={a:[800,1150,2800],o:[500,880,2600],u:[350,700,2500],e:[480,1750,2600],i:[320,2250,3000],h:[620,1050,2600]};
  const vlerp=(path,u)=>{const k=Math.min(path.length-1.0001,Math.max(0,u*(path.length-1))),i=k|0,f=k-i,A=VW[path[i]],B=VW[path[i+1]]||A;return [A[0]+(B[0]-A[0])*f,A[1]+(B[1]-A[1])*f,A[2]+(B[2]-A[2])*f];};
  function voice(o){
    const n=len(o.dur),out=new Float32Array(n),jt=smooth(n,o.jr||28),gu=o.gurg?smooth(n,6):null,bq=[new BQ(),new BQ(),new BQ()];
    const q=o.q||[5,7,9],g=o.g||[1,.7,.35],path=o.v||['u','a','o'];let ph=rnd(),ph2=0,gph=0;
    for(let i=0;i<n;i++){const t=i/SR,u=t/o.dur;
      if((i&31)===0){const fm=vlerp(path,u),sh=o.fs||1;for(let j=0;j<3;j++)bq[j].set('bp',fm[j]*sh,q[j]);}
      const f=o.f0(u,t)*(1+jt[i]*(o.jit||.02)),dt=f/SR;ph+=dt;if(ph>=1)ph-=1;ph2+=dt*.5;if(ph2>=1)ph2-=1;
      let s=2*ph-1-blep(ph,dt);if(o.rough)s*=1+o.rough*.5*(ph2<.5?1:-1);
      s+=(rnd()*2-1)*(o.br||.12);
      let y=0;for(let j=0;j<3;j++)y+=bq[j].p(s)*g[j];
      let e=o.env?o.env(u,t):Math.pow(Math.sin(Math.PI*u),.7);
      if(gu){gph+=(o.gurg+gu[i]*o.gurg*.4)/SR;e*=.5+.5*Math.abs(Math.sin(TAU*gph));}
      out[i]=y*e;}
    norm(out,1); if(o.wet){const w=ex(F(N(n),'bp',1400,.6),0);for(let i=0;i<n;i++)w[i]*=o.wet*Math.pow(Math.sin(Math.PI*i/n),2);add(out,w);}
    sat(out,o.sat||2); if(o.sub){for(let i=0;i<n;i++){const t=i/SR;out[i]+=Math.sin(TAU*o.sub*t)*o.subA*Math.pow(Math.sin(Math.PI*t/o.dur),.6);}}
    return fadeOut(norm(out));
  }
  const envA=(a,r)=>(u,t)=>Math.min(1,t/a)*Math.pow(1-u,r);

  // ---------- ARMAS ----------
  function gun(p){
    const n=len(p.len),x=new Float32Array(n),cr=F(N(n),'hp',p.cr*.5,.707,2),bo=F(F(N(n),'hp',p.b0),'lp',p.b1,.707,2),bl=F(N(n),'lp',650,.707,2);
    let ph=0,ph2=0;
    for(let i=0;i<n;i++){const t=i/SR;ph+=(p.f0*Math.exp(-t*30)+p.f1)/SR;ph2+=(55*Math.exp(-t*8)+22)/SR;
      let s=cr[i]*Math.exp(-t*p.dk*3.2)*.9*(t<.0009?3:1)+bo[i]*Math.exp(-t*p.dk*.75)*.8+Math.sin(TAU*ph)*Math.exp(-t*p.dk*.6)*1.2
        +Math.sin(TAU*ph2)*Math.exp(-t*6)*.55*(p.sub||1)+bl[i]*Math.exp(-t*p.dk*.5)*.8;
      x[i]=s;}
    sat(x,p.g); norm(x,1);
    const L=x.slice(),R=x.slice();
    if(p.echo!==0){for(const [dl,gg,pn,fc] of [[.19+rnd()*.06,.32,-.6,2600],[.41+rnd()*.06,.2,.7,1800],[.72+rnd()*.08,.12,-.3,1200]]){
      const e=F(x.slice(),'lp',fc,.707,2),gl=gg*Math.cos((pn+1)*Math.PI/4)*1.4,gr=gg*Math.sin((pn+1)*Math.PI/4)*1.4;add(L,e,dl,gl);add(R,e,dl,gr);}}
    return norm([fadeOut(L,.1),fadeOut(R,.1)],.97);
  }
  const GUNS={pistola:{cr:2800,b0:250,b1:2200,f0:150,f1:32,dk:26,len:1.5,g:2.2,sub:.6},
    escopeta:{cr:1800,b0:120,b1:1800,f0:110,f1:28,dk:14,len:1.8,g:2.8,sub:1},
    smg:{cr:3300,b0:300,b1:2800,f0:170,f1:40,dk:36,len:1.1,g:2.0,sub:.4},
    magnum:{cr:2400,b0:150,b1:2200,f0:120,f1:28,dk:15,len:1.9,g:3,sub:1},
    fuzil:{cr:3200,b0:200,b1:3000,f0:130,f1:34,dk:22,len:1.7,g:2.6,sub:.9},
    sniper:{cr:2500,b0:100,b1:2500,f0:95,f1:25,dk:9,len:2.4,g:3.2,sub:1.3},
    cano:{cr:1700,b0:100,b1:1700,f0:100,f1:26,dk:12,len:2,g:3.3,sub:1.2},
    rev38:{cr:2600,b0:200,b1:2400,f0:140,f1:30,dk:20,len:1.6,g:2.4,sub:.7}};
  function silenced(){const n=len(.4),x=ex(F(F(N(n),'hp',700),'lp',3200),55);add(x,ex(F(N(len(.05)),'bp',4200,6),120),.002,.6);
    add(x,ping(.06,180,60),0,.6);add(x,ex(F(N(len(.08)),'bp',2600,8),90),.06,.35);return fadeOut(norm(sat(x,1.5)));}
  function launcher(){const n=len(1),x=sweep(n,t=>160*Math.exp(-t*12)+55,t=>Math.exp(-t*9)*1.3);add(x,ex(F(N(n),'lp',600,.707,2),10,.003));
    add(x,ex(F(N(len(.1)),'bp',3000,5),60),.0,.4);return fadeOut(norm(sat(x,1.8)));}
  function crossbow(){const n=len(.6),x=sweep(n,t=>190*(1+.02*Math.exp(-t*30)),t=>Math.exp(-t*14));add(x,ex(F(N(n),'bp',1200,1.5),40),0,.8);
    add(x,ex(F(N(len(.2)),'hp',2500),25),.01,.3);return fadeOut(norm(sat(x,1.4)));}
  function flameS(){const n=len(.5),x=F(N(n),'bp',t=>700+300*Math.sin(t*20),.6);for(let i=0;i<n;i++)x[i]*=Math.sin(Math.PI*i/n);
    add(x,F(N(n),'lp',200),0,.6);return fadeOut(norm(sat(x,1.4)));}
  function shell(){const n=len(.5),x=new Float32Array(n);let tt=0;for(const [dl,g] of [[0,1],[.085,.5],[.14,.25],[.17,.12]]){tt=dl;const f=4800+rnd()*1200;
    add(x,ping(.12,f,70),tt,g);add(x,ping(.08,f*1.52,95),tt,g*.5);add(x,ex(F(N(len(.01)),'hp',5000),400),tt,g*.4);}return fadeOut(norm(x));}
  function metal(f,k,d=.12){const x=ping(d,f,k);add(x,ping(d,f*1.41,k*1.3),0,.5);add(x,ping(d,f*2.13,k*1.7),0,.3);return x;}
  function reloadS(){const n=len(.8),x=new Float32Array(n);
    add(x,ex(F(N(len(.04)),'bp',2400,5),110),0,.7);add(x,ping(.06,170,55),0,.5);                    // pente saindo
    const sl=F(N(len(.09)),'bp',t=>1500+t*25000,3);for(let i=0;i<sl.length;i++)sl[i]*=Math.sin(Math.PI*i/sl.length);add(x,sl,.32,.5);
    add(x,metal(3100,80),.47,.8);add(x,ex(F(N(len(.05)),'bp',1800,3),90),.47,.9);add(x,ping(.08,150,40),.47,.7);   // trava
    return fadeOut(norm(x));}
  function clickS(){const x=new Float32Array(len(.12));add(x,ex(F(N(len(.02)),'bp',3600,8),260),0,1);add(x,metal(4200,140,.05),0,.4);add(x,ex(F(N(len(.02)),'bp',2600,8),260),.045,.5);return fadeOut(norm(x));}
  function dryS(){const x=new Float32Array(len(.15));add(x,ex(F(N(len(.03)),'bp',1900,5),200),0,1);add(x,ping(.06,700,70),0,.5);add(x,ping(.05,320,60),.004,.4);return fadeOut(norm(x));}

  // ---------- CORPO ----------
  function hitS(v){const n=len(.6),x=sweep(n,t=>(110+v*15)*Math.exp(-t*30)+52,t=>Math.exp(-t*22)*1.2);
    add(x,ex(F(N(n),'bp',900+v*200,.8),40));add(x,ex(F(N(n),'lp',600),14),0,.5);add(x,ex(F(N(n),'hp',3000),90),0,.4);return fadeOut(norm(sat(x,1.8)));}
  function swishS(v){const d=.2+v*.04,n=len(d),x=F(N(n),'bp',t=>600+2600*Math.sin(Math.PI*Math.min(1,t/d)),1.4);for(let i=0;i<n;i++)x[i]*=Math.pow(Math.sin(Math.PI*i/n),2);return fadeOut(norm(x));}
  function splatS(){const n=len(.5),x=new Float32Array(n);for(let k=0;k<5;k++){const d=.06+rnd()*.08;add(x,ex(F(N(len(d)),'bp',350+rnd()*1300,2.5),30+rnd()*30),k*.05+rnd()*.03,1-k*.15);}
    add(x,sweep(len(.2),t=>90*Math.exp(-t*20)+40,t=>Math.exp(-t*20)),0,.8);return fadeOut(norm(sat(x,1.6)));}
  function stepS(v){const n=len(.25),x=ex(F(N(n),'lp',700+v*150,.707,2),38+v*4,.003);add(x,ex(F(N(n),'bp',2400+v*500,1.2),90),0,.3);
    if(v%2)add(x,ex(F(N(len(.12)),'bp',1200,1),40),.03,.2);return fadeOut(norm(x));}
  function heartS(){const n=len(.6),x=sweep(n,t=>50*Math.exp(-t*12)+38,t=>Math.exp(-t*24));add(x,ex(F(N(n),'lp',120),30),0,.3);
    add(x,sweep(len(.3),t=>58*Math.exp(-t*12)+42,t=>Math.exp(-t*26)),.2,.7);return fadeOut(norm(sat(x,1.3)));}
  function breathS(inh){const d=inh?.55:.8,n=len(d),s=N(n),x=new Float32Array(n);const a=F(s.slice(),'bp',inh?1700:700,inh?2:2.5),b=F(s.slice(),'bp',inh?2700:1200,3);
    for(let i=0;i<n;i++){const u=i/n;x[i]=(a[i]+b[i]*.6)*Math.pow(Math.sin(Math.PI*Math.pow(u,inh?.7:.5)),1.5);}return fadeOut(norm(x));}

  // ---------- CENÁRIO ----------
  function doorS(){const n=len(1),x=sweep(n,t=>85*Math.exp(-t*6)+52,t=>Math.exp(-t*12));add(x,ex(F(N(n),'lp',420,.707,2),15,.002));
    const r=ex(F(N(n),'bp',1500,4),8);for(let i=0;i<n;i++)r[i]*=.5+.5*Math.sin(TAU*35*i/SR);add(x,r,.02,.12);return fadeOut(norm(sat(x,1.4)));}
  function knockS(){const n=len(1.1),x=new Float32Array(n);for(let k=0;k<3;k++){const o=k*.31+rnd()*.02;add(x,ex(F(N(len(.12)),'bp',210,6),55),o,1);add(x,ping(.1,150+rnd()*15,40),o,.6);add(x,ex(F(N(len(.01)),'hp',2500),300),o,.3);}return fadeOut(norm(sat(x,1.5)));}
  // rangido de dobradiça/madeira: atrito irregular com ressonâncias agudas (nada de faixa de voz)
  function creakS(v){const d=.9+v*.35,n=len(d),x=new Float32Array(n),sm=smooth(n,4);let ph=0;
    for(let i=0;i<n;i++){const t=i/SR,f=(38+28*Math.sin(Math.PI*t/d)+22*sm[i])*(1+v*.15);ph+=f/SR;if(ph>=1){ph-=1;x[i]=.6+rnd()*.8;}}
    const y=F(x.slice(),'bp',1900+v*260,26);add(y,F(x.slice(),'bp',3300+v*300,30),0,.7);add(y,F(x.slice(),'bp',5100,34),0,.35);
    add(y,ex(F(x.slice(),'lp',260,.707,2),2),0,.5);
    for(let i=0;i<n;i++)y[i]*=Math.pow(Math.sin(Math.PI*i/n),.6);return fadeOut(norm(sat(norm(y),1.3)));}
  function glassS(){const n=len(1.1),x=ex(F(N(n),'hp',3200,.707,2),12);for(let i=0;i<n;i++)x[i]*=.5;
    for(let k=0;k<26;k++)add(x,ping(.2,2500+rnd()*4800,40+rnd()*50),Math.pow(rnd(),2)*.5,.25+rnd()*.35);add(x,ex(F(N(len(.2)),'bp',900,1.5),30),0,.6);return fadeOut(norm(x));}
  function thudS(){const n=len(.9),x=sweep(n,t=>70*Math.exp(-t*8)+34,t=>Math.exp(-t*10));add(x,ex(F(N(n),'lp',180,.707,2),9),0,1.1);add(x,ex(F(N(n),'bp',650,2),22),.01,.25);return fadeOut(norm(sat(x,1.6)));}
  function boomS(big){const d=big?4.5:2.6,n=len(d),x=ex(F(N(n),'lp',big?320:500,.707,2),big?1.4:2.4,.004);for(let i=0;i<n;i++)x[i]*=1.4;
    add(x,sweep(n,t=>60*Math.exp(-t*3)+(big?20:25),t=>Math.exp(-t*(big?2:3))),0,1.2);
    const dn=len(d*.6);for(let k=0;k<(big?140:80);k++){const t=Math.pow(rnd(),1.8)*d*.6;add(x,ex(F(N(len(.02)),'hp',1800+rnd()*3000),250),t,.15*(1-t/d));}
    add(x,ex(F(N(len(.05)),'hp',1200),80),0,.8);void dn;return fadeOut(norm(sat(x,2.2)),.3);}
  function thunderS(){const d=4.5,n=len(d),base=F(N(n),'lp',130,.707,2),x=new Float32Array(n);const bumps=[[.05,.08,1.2]];for(let k=0;k<5;k++)bumps.push([.2+rnd()*2.4,.25+rnd()*.6,.4+rnd()*.6]);
    for(let i=0;i<n;i++){const t=i/SR;let e=0;for(const [c,w,a] of bumps)e+=a*Math.exp(-Math.pow((t-c)/w,2));x[i]=base[i]*e*Math.exp(-t*.35);}
    add(x,ex(F(N(len(.4)),'hp',1500),12),.03,.35);return fadeOut(norm(sat(x,1.6)),.5);}
  function dragS(){const n=len(.8),x=F(N(n),'bp',2300,4),sm=smooth(n,9);add(x,F(N(n),'bp',900,3),0,.7);for(let i=0;i<n;i++)x[i]*=(.5+.5*sm[i])*Math.sin(Math.PI*i/n);return fadeOut(norm(x));}
  function chainS(){const x=new Float32Array(len(.6));for(let k=0;k<6;k++)add(x,metal(2900+rnd()*1800,50+rnd()*30,.15),rnd()*.3,.4+rnd()*.5);return fadeOut(norm(x));}
  function stingS(v){const d=2,n=len(d),x=new Float32Array(n),cl=v?[987.8,1046.5,1108.7,1661]:[1046.5,1108.7,1174.7,1568];
    for(const f of cl){const s=saw(n,t=>f*(1+.004*Math.sin(TAU*5.5*t)));for(let i=0;i<n;i++){const t=i/SR;x[i]+=s[i]*(.6+.4*Math.sin(TAU*9*t))*Math.exp(-t*1.5)*Math.min(1,t/.015)*.25;}}
    F(x,'hp',700);F(x,'lp',6000);add(x,ex(F(N(n),'hp',4000),3),0,.25);
    add(x,sweep(n,t=>70*Math.exp(-t*4)+36,t=>Math.exp(-t*3)),0,1.1);add(x,ex(F(N(n),'lp',200,.707,2),8),0,.8);return fadeOut(norm(sat(x,1.6)),.3);}
  function hissS(){const n=len(.7),x=F(N(n),'bp',3600,1.3);add(x,F(N(n),'bp',2000,2),0,.6);for(let i=0;i<n;i++){const t=i/SR;x[i]*=Math.min(1,t/.04)*Math.exp(-Math.max(0,t-.15)*5);}
    const vv=voice({dur:.7,f0:()=>110,v:['h','h'],rough:.8,br:.6,env:envA(.03,1.5),sat:2});add(x,vv,0,.35);return fadeOut(norm(x));}
  function spitS(){const n=len(.45),x=F(N(n),'bp',1200,2),sm=smooth(n,30);for(let i=0;i<n;i++)x[i]*=(.5+.5*sm[i])*Math.exp(-i/SR*7)*Math.min(1,i/SR/.02);add(x,splatS(),.18,.5);return fadeOut(norm(x));}

  // ---------- AMBIENTE (loops) ----------
  function rainBed(){const d=9,cf=1,n=len(d+cf),ch=[];for(let c=0;c<2;c++){const x=F(N(n),'hp',2400,.707,2);for(let i=0;i<n;i++)x[i]*=.55;add(x,F(N(n),'bp',1100,.6),0,.22);add(x,F(N(n),'lp',350),0,.08);
    for(let k=0;k<d*22;k++)add(x,ping(.03,2200+rnd()*4000,220),rnd()*d,.04+rnd()*.06);ch.push(loopify(x,cf));}return norm(ch,.9);}
  function windBed(){const d=12,cf=1.5,n=len(d+cf),ch=[];for(let c=0;c<2;c++){const p=c*1.7;
    const x=F(N(n),'bp',t=>420+260*Math.sin(TAU*t/d+p)+120*Math.sin(TAU*3*t/d+1+p),1.1);
    const y=F(N(n),'bp',t=>1300+500*Math.sin(TAU*2*t/d+2+p),2.2);
    for(let i=0;i<n;i++){const t=i/SR;x[i]=x[i]*(.45+.55*Math.pow(Math.sin(Math.PI*2*t/d+p),2))+y[i]*.35*Math.pow(Math.sin(Math.PI*3*t/d+p*2),4);}ch.push(loopify(x,cf));}return norm(ch,.9);}
  function droneBed(){const d=16,cf=2,n=len(d+cf),ch=[];for(let c=0;c<2;c++){const x=new Float32Array(n);
    for(const [f,a] of [[41.2,1],[41.2*1.006,.8],[61.8,.45],[82.4*1.003,.25]]){const s=saw(n,()=>f*(c?1.002:1));add(x,s,0,a);}
    F(x,'lp',t=>150+60*Math.sin(TAU*t/8),.9,2);for(let i=0;i<n;i++){const t=i/SR;x[i]=x[i]*(.7+.3*Math.sin(TAU*t/d*2))+Math.sin(TAU*30.9*t)*.5;}ch.push(loopify(x,cf));}return norm(ch,.9);}
  function roomBed(){const d=8,cf=1,n=len(d+cf),ch=[];for(let c=0;c<2;c++){const x=F(N(n),'lp',220,.707,2);for(let i=0;i<n;i++){const t=i/SR;x[i]=x[i]*1.5+Math.sin(TAU*50*t)*.08+Math.sin(TAU*100*t+c)*.05;}
    add(x,F(N(n),'hp',5000),0,.02);ch.push(loopify(x,cf));}return norm(ch,.9);}
  // tensão: cordas dissonantes em Ré (Ré, Mib, Sol#: trítono) com tremolo de arco, 16 s em loop
  function tensionBed(){const d=16,cf=2,n=len(d+cf),ch=[];for(let c=0;c<2;c++){const x=new Float32Array(n);
    for(const [f,a] of [[73.42,1],[77.78,.7],[103.83,.6],[146.83,.4],[155.56,.25]])for(const dt of [-7,0,6]){const ff=f*Math.pow(2,(dt+(c?3:-3))/1200);add(x,saw(n,()=>ff),0,a/3);}
    F(x,'lp',t=>700+500*Math.pow(Math.sin(Math.PI*t/4),2),.9,2);
    for(let i=0;i<n;i++){const t=i/SR;x[i]*=.75+.25*Math.sin(TAU*6.5*t+c);}ch.push(loopify(x,cf));}return norm(ch,.9);}
  function pulseBed(){const d=3.2,n=len(d),x=new Float32Array(n);for(let k=0;k<4;k++){const o=k*.8;add(x,sweep(len(.4),t=>52*Math.exp(-t*14)+36,t=>Math.exp(-t*16)),o,1);add(x,sweep(len(.3),t=>58*Math.exp(-t*14)+40,t=>Math.exp(-t*18)),o+.22,.6);}
    for(let k=0;k<8;k++)add(x,ex(F(N(len(.02)),'bp',5200,6),200),k*.4+.1,.08);return [x,x.slice()];}
  // trilha de exploração: acordes graves que respiram devagar, com um brilho metálico lá no fundo (32 s, loop)
  function ambBed(){const d=32,cf=3,n=len(d+cf),ch=[];for(let c=0;c<2;c++){const x=new Float32Array(n);
    for(const [f,a,ph] of [[73.42,1,0],[110,.55,1.3],[155.56,.35,2.1],[220*1.006,.18,.7],[61.74,.5,2.8]]){const s=saw(n,()=>f*(c?1.003:.997));for(let i=0;i<n;i++){const t=i/SR;s[i]*=a*(.25+.75*Math.pow(Math.sin(Math.PI*((t/d*2+ph/6.283)%1)),2));}add(x,s);}
    F(x,'lp',t=>320+260*Math.sin(TAU*t/d+c),.8,2);
    for(let k=0;k<6;k++){const t0=rnd()*d,p=ping(4,880*Math.pow(2,[0,1,3,6,7][(rnd()*5)|0]/12)*(rnd()<.5?1:2),.6);for(let i=0;i<p.length;i++)p[i]*=Math.min(1,i/SR/1.5);add(x,p,t0,.05);}
    ch.push(loopify(x,cf));}return norm(ch,.9);}
  // coro de Camboriú: vozes graves cantando "uuu/ooo" bem devagar, como numa igreja vazia (24 s, loop)
  function coroBed(){const d=24,cf=3,n=len(d+cf),ch=[];for(let c=0;c<2;c++){const x=new Float32Array(n);
    for(const [f,v,a] of [[73.42,'u',1],[73.42*1.004,'o',.8],[110,'u',.6],[103.83,'o',.35],[146.83,'u',.3]]){const y=voice({dur:d+cf,f0:(u,t)=>f*(1+.004*Math.sin(t*.7+c)),v:[v,v==='u'?'o':'u',v],rough:.02,br:.08,jit:.006,q:[9,11,13],env:(u,t)=>.35+.65*Math.pow(Math.sin(Math.PI*((t/8+a)%1)),2),sat:1.1});add(x,y,0,a*.3);}
    F(x,'lp',1800,.707,2);ch.push(loopify(x,cf));}return norm(ch,.9);}
  // ---------- INSTRUMENTOS (música) ----------
  function piano(f){const d=5,n=len(d),x=new Float32Array(n),B=.0004;
    for(let k=1;k<=9;k++){const fk=f*k*Math.sqrt(1+B*k*k);if(fk>SR*.45)break;const a=1/Math.pow(k,1.15)*(k===1?1:.8),dk=.7+.45*k,dtu=1+(rnd()-.5)*.0015;
      for(let i=0;i<n;i++){const t=i/SR;x[i]+=Math.sin(TAU*fk*dtu*t+k)*a*(Math.exp(-t*dk)*.75+Math.exp(-t*dk*4)*.25);}}
    add(x,ex(F(N(len(.05)),'lp',3000),80),0,.3);for(let i=0;i<len(.004);i++)x[i]*=i/len(.004);return fadeOut(norm(x),.4);}
  function padS(f){const d=8,n=len(d),x=new Float32Array(n);for(const dt of [-11,-4,0,5,12])add(x,saw(n,()=>f*Math.pow(2,dt/1200)),0,.2);
    F(x,'lp',t=>500+700*Math.sin(Math.PI*t/d),.8,2);for(let i=0;i<n;i++){const u=i/n;x[i]*=Math.min(1,u*d/1.2)*Math.min(1,(1-u)*d/2);}return norm(x);}
  function kickS(){const n=len(.5),x=sweep(n,t=>140*Math.exp(-t*28)+42,t=>Math.exp(-t*9));add(x,ex(F(N(len(.01)),'hp',2000),300),0,.3);return fadeOut(norm(sat(x,1.6)));}
  function snareS(){const n=len(.35),x=ex(F(N(n),'bp',2000,.7),16);add(x,sweep(n,t=>200*Math.exp(-t*8)+160,t=>Math.exp(-t*30)),0,.6);return fadeOut(norm(sat(x,1.5)));}
  function hatS(){return fadeOut(norm(ex(F(N(len(.08)),'hp',7500,.707,2),60)));}
  function taikoS(){const n=len(1.2),x=sweep(n,t=>80*Math.exp(-t*5)+48,t=>Math.exp(-t*4.5));add(x,ex(F(N(n),'lp',300),10),0,.5);add(x,ex(F(N(len(.03)),'bp',1200,2),80),0,.3);return fadeOut(norm(sat(x,1.4)));}
  function brassS(f){const d=2,n=len(d),x=new Float32Array(n);for(const dt of [-9,0,8])add(x,saw(n,()=>f*Math.pow(2,dt/1200)),0,.33);
    F(x,'lp',t=>250+2600*Math.exp(-t*3)*Math.min(1,t/.06),1.2);for(let i=0;i<n;i++){const t=i/SR;x[i]*=Math.min(1,t/.03)*Math.exp(-t*1.2);}return fadeOut(norm(sat(x,1.5)),.2);}

  // ---------- fila de geração (um pouco por quadro, sem travar) ----------
  const J=(name,fn,k=1)=>{for(let v=0;v<k;v++)SND.jobs.push([name,()=>fn(v)]);};
  function queue(){
    J('piano_lo',()=>piano(220));J('piano_hi',()=>piano(880));J('pad',()=>padS(110));
    for(const id in GUNS)J('shot_'+id,()=>gun(GUNS[id]),2);
    J('shot_sil',silenced,2);J('shot_lgran',launcher);J('shot_besta',crossbow);J('flame',flameS);J('shell',shell,2);
    J('hit',hitS,4);J('swish',swishS,3);J('step',stepS,4);J('click',clickS);J('dry',dryS);J('reload',reloadS);
    // zumbi comum: 6 gemidos diferentes
    const zp=[['u','a','o'],['o','a','h'],['a','h','u'],['u','o'],['h','a','o'],['o','u','a']];
    J('gr_z',v=>voice({dur:1.3+v*.22,f0:u=>(72+v*6)*(1+.3*Math.sin(Math.PI*u))*(1-.15*Math.exp(-u*3))+4*Math.sin(u*40),v:zp[v],rough:.5+v*.08,br:.22,jit:.035,q:[5,6,8],wet:.12,sat:2}),6);
    J('gr_corr',v=>voice({dur:.6+v*.15,f0:u=>(150+v*25)*(1+.5*Math.sin(Math.PI*u))+18*Math.sin(u*70),v:['a','e','a'],rough:.85,br:.3,jit:.05,q:[4,6,8],env:envA(.02,.8),sat:3}),3);
    J('gr_big',v=>voice({dur:1.7+v*.3,f0:u=>(46+v*6)*(1+.35*Math.sin(Math.PI*u)),v:['o','a','u'],rough:1,br:.3,jit:.04,q:[4,5,7],fs:.85,sat:2.6,sub:38+v*4,subA:.25}),3);
    J('gr_gurg',v=>voice({dur:1.2+v*.3,f0:u=>(80+v*10)*(1-.2*u),v:['u','h','o'],rough:.6,br:.35,jit:.06,gurg:12+v*4,sat:2.2}),3);
    J('gr_cao',v=>{if(v<2){const b=()=>voice({dur:.2,f0:u=>520-200*u,v:['a','h'],rough:.35,br:.35,jit:.04,env:envA(.008,1.2),sat:2.4});const x=new Float32Array(len(.7));add(x,b());add(x,b(),.27+v*.05,.85);return fadeOut(norm(x));}
      return voice({dur:.9,f0:()=>95,v:['h','u'],rough:1,br:.4,jit:.05,env:envA(.06,.5),sat:2.6});},3);
    J('die_z',v=>voice({dur:1+v*.2,f0:u=>(95+v*8)*(1-.5*u),v:['a','u','u'],rough:.7,br:.3,gurg:16,env:envA(.02,1.4),sat:2.2}),3);
    J('die_cao',()=>{const x=new Float32Array(len(.7));add(x,voice({dur:.25,f0:u=>950-400*u,v:['i','e'],rough:.1,br:.2,env:envA(.005,1),sat:1.6}));add(x,voice({dur:.35,f0:u=>800-450*u,v:['e','u'],rough:.2,br:.25,env:envA(.005,1.4),sat:1.6}),.3,.7);return fadeOut(norm(x));});
    J('scream',v=>{const x=voice({dur:2.1,f0:(u,t)=>{let f=420+500*(1-Math.exp(-t*3.5))+25*Math.sin(TAU*6.8*t)*Math.min(1,t)+14*Math.sin(TAU*11*t);if(u>.75)f-=(u-.75)*900;if((t>.7&&t<.79)||(t>1.25&&t<1.33))f*=.5;return f*(v?.85:1);},
      v:['a','e','i'],rough:.3,br:.2,jit:.05,q:[7,9,10],g:[1,.9,.6],env:(u,t)=>Math.min(1,t/.04)*(u<.75?1:Math.exp(-(u-.75)*14)),sat:3});add(x,F(N(x.length),'hp',3000),0,.04);return norm(x);},2);
    J('roar',v=>voice({dur:1.8,f0:u=>(52+v*8)*(1+.45*Math.sin(Math.PI*u))-10*u,v:['o','a','a','u'],rough:1,br:.45,jit:.05,q:[3.5,5,6],fs:.8,env:envA(.05,.9),sat:3.2,sub:36,subA:.35}),2);
    J('howl',()=>voice({dur:2.8,f0:(u,t)=>(u<.3?420+1000*u:720-160*(u-.3))*(1+.02*Math.sin(TAU*5*t)),v:['u','o','u'],rough:.1,br:.1,jit:.02,q:[8,10,12],sat:1.4}));
    J('hiss',hissS,2);J('spit',spitS);J('splat',splatS,3);
    J('p_hurt',v=>voice({dur:.28+v*.04,f0:u=>(150+v*12)*(1-.28*u),v:v===1?['a','h']:['h','u'],rough:.18,br:.25,jit:.03,env:envA(.008,1),sat:1.8}),3);
    J('p_death',()=>voice({dur:1.5,f0:u=>140*(1-.5*u),v:['a','h','u'],rough:.45,br:.3,jit:.05,env:envA(.02,1.3),sat:2}));
    J('breath_in',()=>breathS(true));J('breath_out',()=>breathS(false));J('heart',heartS);
    J('door',doorS,2);J('knock',knockS);J('creak',creakS,2);J('glass',glassS,2);J('thud',thudS,2);
    J('boom',()=>boomS(false),2);J('bigboom',()=>boomS(true));J('thunder',thunderS,2);J('drag',dragS);J('chain',chainS);J('sting',stingS,2);
    J('bed_amb',ambBed);J('bed_coro',coroBed);
    J('bed_rain',rainBed);J('bed_wind',windBed);J('bed_drone',droneBed);J('bed_room',roomBed);J('bed_ten',tensionBed);J('bed_pulse',pulseBed);
    J('kick',kickS);J('snare',snareS);J('hat',hatS);J('taiko',taikoS);J('brass',()=>brassS(146.83));
    for(const [nm,fn,k] of (SND.extra||[]))J(nm,fn,k||1);
  }
  SND.pump=function(c,ms){
    if(!c)return; if(!SND.started){SND.started=true;SR=c.sampleRate||44100;seed=20261016;queue();SND.total=SND.jobs.length;}
    const t0=(typeof performance!=='undefined'?performance:Date).now();
    while(SND.jobs.length&&((typeof performance!=='undefined'?performance:Date).now()-t0)<ms){
      const [name,fn]=SND.jobs.shift();
      try{let r=fn();const chs=Array.isArray(r)?r:[r];const b=c.createBuffer(chs.length,chs[0].length,SR);
        for(let k=0;k<chs.length;k++){if(b.copyToChannel)b.copyToChannel(chs[k],k);else b.getChannelData(k).set(chs[k]);}
        (SND.b[name]=SND.b[name]||[]).push(b);}catch(e){console.error('som',name,e);}
    }
    if(!SND.jobs.length&&!SND.ok){SND.ok=true;try{AU.bedsOn();}catch(e){console.error(e);}}
  };
  SND.dsp={voice,gun,GUNS,N,F,add,ex,sat,norm,fadeOut,ping,sweep,saw,smooth,envA,len:d=>len(d),rnd:()=>rnd(),loopify,BQ,VW};
})();

// ---------- tocar ----------
(function(){
  // compressor no fim: muitos tiros/gritos juntos não estouram
  {const ini=AU.init.bind(AU);AU.init=function(){const had=!!this.ctx;const r=ini();const c=this.ctx;
    if(!had&&c&&this.master&&c.createDynamicsCompressor&&!this.comp){try{const k=c.createDynamicsCompressor();k.threshold.value=-12;k.knee.value=8;k.ratio.value=5;k.attack.value=.003;k.release.value=.18;
      this.master.disconnect();this.master.connect(k);k.connect(c.destination);this.comp=k;}catch(e){}}return r;};}
  const has=n=>SND.b[n]&&SND.b[n].length;
  // saída própria: pan, abafa com a distância (sem cortar os agudos de perto), manda pro reverb
  AU.out2=function(pan,far,wet){
    const c=this.ctx,g=c.createGain(),lp=c.createBiquadFilter();lp.type='lowpass';const f=clamp(far||0,0,1);lp.frequency.value=f<=0?20000:lerp(16000,650,Math.pow(f,.6));g.connect(lp);let node=lp;
    if(c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=clamp(pan||0,-1,1);node.connect(p);node=p;}
    node.connect(this.master);const w=this.wet();if(w&&wet>0){const s=c.createGain();s.gain.value=wet;node.connect(s);s.connect(w);}
    return g;
  };
  AU.pb=function(name,o={}){
    const c=this.ctx;if(!c||!this.on||!has(name))return false;
    if(SND.active>56&&!o.must)return true;
    const L=SND.b[name],b=L[(Math.random()*L.length)|0],s=c.createBufferSource();s.buffer=b;
    s.playbackRate.value=(o.rate||1)*(1+(Math.random()-.5)*(o.jit??.06));
    const inside=G&&G.mode==='play'&&G.inB>=0,out=this.out2(o.pan||0,o.far||0,(o.wet??.25)*(inside?1.6:1));out.gain.value=o.vol??1;
    s.connect(out);SND.active++;s.onended=()=>{SND.active--;try{out.disconnect();}catch(e){}};
    s.start(c.currentTime+(o.delay||0));return true;
  };
  // posição relativa ao jogador
  const posOf=(x,y,maxD=900)=>{const dx=x-P.x,dy=y-P.y,d=hyp(dx,dy);return {pan:clamp(dx/520,-1,1)*.85,far:clamp(d/maxD,0,1),d};};
  AU.pbAt=function(name,x,y,o={}){const p=posOf(x,y,o.maxD||900);return this.pb(name,Object.assign({},o,{pan:p.pan,far:p.far,vol:(o.vol??1)*clamp(1.1-p.far,.08,1)}));};
  // reverb novo: estéreo, reflexões iniciais, cauda que escurece com o tempo
  AU.wet=function(){
    const c=this.ctx;if(!c)return null;if(this.revIn)return this.revIn;
    try{const sr=c.sampleRate,len=Math.round(sr*2.8),b=c.createBuffer(2,len,sr);
      for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let y=0;
        for(let i=0;i<len;i++){const u=i/len,a=Math.exp(-u*6.2)*(i<sr*.004?i/(sr*.004):1),k=.08+.85*u;y=y*k+(Math.random()*2-1)*(1-k);d[i]=y*a*(1+k*2);}
        for(const [dl,g] of [[.009,.7],[.015,.5],[.023,.45],[.037,.35],[.051,.3],[.069,.22]]){const i=Math.round((dl+(ch?.003:0))*sr);d[i]+=g*(ch?-1:1);}}
      const cv=c.createConvolver();cv.buffer=b;const g=c.createGain();g.gain.value=.5;cv.connect(g);g.connect(this.master);this.revIn=cv;}catch(e){this.revIn=null;}
    return this.revIn;
  };
  const O={};for(const k of ['shot','flame','reload','click','dry','swish','hit','hurt','death','die','groan','spit','roar','sting','scream','knock','steps','thud','boom','splat','glass','bigBoom','bell','drag','creak','thunder','heart','breath','stepAt','step','door','chain','hiss'])O[k]=AU[k];
  const ok=()=>SND.ok||false;
  AU.shot=function(id){
    const nm='shot_'+id;if(!has(nm))return O.shot.call(this,id);
    const v={pistola:.22,escopeta:.33,smg:.12,magnum:.36,fuzil:.42,sniper:.42,cano:.36,rev38:.3,sil:.21,lgran:.35,besta:.3}[id]||.35;
    this.pb(nm,{vol:v,wet:.22,jit:.04,must:true});
    if(!['sil','lgran','besta','escopeta','cano'].includes(id)||Math.random()<.3)this.pb('shell',{vol:.07,delay:.35+Math.random()*.25,pan:(Math.random()-.5)*.6,wet:.1});
  };
  AU.flame=function(){if(!this.pb('flame',{vol:.2,wet:.1}))O.flame.call(this);};
  AU.reload=function(){if(!this.pb('reload',{vol:.38,wet:.1,jit:.03}))O.reload.call(this);};
  AU.click=function(){if(!this.pb('click',{vol:.17,wet:.05}))O.click.call(this);};
  AU.dry=function(){if(!this.pb('dry',{vol:.25,wet:.05}))O.dry.call(this);};
  AU.swish=function(){if(!this.pb('swish',{vol:.12,wet:.08,jit:.15}))O.swish.call(this);};
  AU.hit=function(){if(!this.pb('hit',{vol:.17,wet:.15,jit:.12}))O.hit.call(this);};
  AU.hurt=function(){if(!has('p_hurt'))return O.hurt.call(this);this.pb('p_hurt',{vol:.18,wet:.1,jit:.05});this.pb('hit',{vol:.1,wet:.1});};
  AU.death=function(){if(!has('p_death'))return O.death.call(this);this.pb('p_death',{vol:.3,wet:.4,must:true});this.pb('thud',{vol:.35,delay:.9,wet:.3});};
  AU.die=function(type){if(!has('die_z'))return O.die.call(this,type);this.pb(type==='cao'?'die_cao':'die_z',{vol:.13,wet:.25});this.pb('splat',{vol:.06,wet:.15});};
  const GRT={corr:'gr_corr',cao:'gr_cao',brut:'gr_big',gordo:'gr_big',boss:'gr_big',bombeiro:'gr_big',pescador:'gr_big',especime:'gr_big',rast:'gr_gurg',afog:'gr_gurg',incha:'gr_gurg',cusp:'gr_gurg'};
  AU.groan=function(e,v){
    if(!this.ctx||!has('gr_z'))return O.groan.call(this,e,v);
    const now=this.ctx.currentTime;if(now-this.lastGroan<1.1)return;
    const p=posOf(e.x,e.y,850);const vol=clamp(1-p.d/850,0,1)*.16*(v||1);if(vol<.015)return;this.lastGroan=now;
    const nm=GRT[e.type]||'gr_z',rate=e.type==='zumbi'||!GRT[e.type]?(.88+((e.id||e.x||0)*7%10)/40):1;
    this.pb(nm,{vol,pan:p.pan,far:p.far*.8,wet:.35,rate,jit:.08});
  };
  AU.spit=function(e){if(!has('spit'))return O.spit.call(this,e);this.pbAt('spit',e.x,e.y,{vol:.18,wet:.2});};
  AU.hiss=function(e){if(!has('hiss'))return O.hiss.call(this,e);if(e)this.pbAt('hiss',e.x,e.y,{vol:.25,wet:.3,maxD:700});else this.pb('hiss',{vol:.12,far:.5,wet:.4});};
  AU.roar=function(){if(!has('roar'))return O.roar.call(this);this.pb('roar',{vol:.6,wet:.45,must:true,jit:.05});};
  AU.sting=function(){const t=this.ctx?this.ctx.currentTime:0;if(t-(this._stT||-99)<12)return;this._stT=t;if(!has('sting'))return O.sting.call(this);this.pb('sting',{vol:.4,wet:.35,must:true,jit:.02});};
  AU.scream=function(v=1){if(!has('scream'))return O.scream.call(this,v);const far=clamp(1-v,0,.92);this.pb('scream',{vol:.11*Math.min(1.2,v+.15),far,pan:far>.3?(Math.random()-.5)*1.4:0,wet:.45+far*.4,jit:.1});};
  AU.knock=function(){if(!this.pb('knock',{vol:.6,wet:.5,far:.15,pan:(Math.random()-.5)}))O.knock.call(this);};
  AU.steps=function(){if(!has('step'))return O.steps.call(this);const pan=Math.random()<.5?-.7:.7;for(let i=0;i<5;i++)this.pb('step',{vol:.1,pan,far:.35,wet:.45,delay:i*.42+Math.random()*.04});};
  AU.step=function(){if(!this.pb('step',{vol:.04,wet:.08,jit:.15}))O.step.call(this);};
  AU.stepAt=function(pan,vol=1,delay=0){if(!this.pb('step',{vol:.09*vol,pan,far:.2,wet:.4,delay,jit:.15}))O.stepAt.call(this,pan,vol,delay);};
  AU.thud=function(v){if(v<=0)return;if(!this.pb('thud',{vol:.4*v,wet:.3}))O.thud.call(this,v);};
  AU.boom=function(v){if(!this.pb('boom',{vol:.77*v,wet:.35,must:true}))O.boom.call(this,v);};
  AU.bigBoom=function(){if(!this.pb('bigboom',{vol:1,wet:.4,must:true}))O.bigBoom.call(this);};
  AU.splat=function(){if(!this.pb('splat',{vol:.09,wet:.15,jit:.12}))O.splat.call(this);};
  AU.glass=function(v=1){if(!this.pb('glass',{vol:1*v,wet:.3}))O.glass.call(this,v);};
  AU.drag=function(v=1){if(!this.pb('drag',{vol:.4*v,wet:.4,far:.2}))O.drag.call(this,v);};
  AU.creak=function(v=1){if(!this.pb('creak',{vol:.45*v,wet:.45,jit:.1}))O.creak.call(this,v);};
  AU.thunder=function(){if(!this.pb('thunder',{vol:1,wet:.3,must:true,jit:.1}))O.thunder.call(this);};
  AU.heart=function(v){if(!this.pb('heart',{vol:.56*v,wet:0,jit:.03}))O.heart.call(this,v);};
  AU.breath=function(v,inh){if(!this.pb(inh?'breath_in':'breath_out',{vol:.05*v,wet:.05,jit:.08}))O.breath.call(this,v,inh);};
  AU.door=function(v=1){if(!this.pb('door',{vol:.6*v,wet:.4}))O.door.call(this,v);};
  AU.chain=function(v=1){if(!this.pb('chain',{vol:.4*v,wet:.25}))O.chain.call(this,v);};
  void ok;
})();

// ---------- ambiente em camadas + barulhos ao longe + tensão ----------
(function(){
  const ob=AU.amb;
  AU.amb=function(){
    ob.call(this); const c=this.ctx;
    // os nós antigos de chuva e zumbido saem; entram os novos (com o mesmo nome, que o resto do jogo usa)
    try{this.rainG.disconnect();this.droneG.disconnect();}catch(e){}
    const mk=(v,dest)=>{const g=c.createGain();g.gain.value=v;g.connect(dest||this.master);return g;};
    this.outF=c.createBiquadFilter();this.outF.type='lowpass';this.outF.frequency.value=18000;this.outF.connect(this.master);
    this.rainG=mk(.05,this.outF);this.windG=mk(.0,this.outF);this.droneG=mk(.03);this.roomG=mk(0);
    this.oldRain=c.createBufferSource();this.oldRain.buffer=this.nb;this.oldRain.loop=true;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.value=1500;f.Q.value=.5;
    this.oldRainG=c.createGain();this.oldRainG.gain.value=1;this.oldRain.connect(f);f.connect(this.oldRainG);this.oldRainG.connect(this.rainG);this.oldRain.start();
  };
  AU.bedsOn=function(){
    const c=this.ctx;if(!c||SND.beds)return;SND.beds={};
    const loop=(name,dest,v)=>{const L=SND.b[name];if(!L)return null;const s=c.createBufferSource();s.buffer=L[0];s.loop=true;const g=c.createGain();g.gain.value=v;s.connect(g);g.connect(dest);s.start();return g;};
    if(this.rainG){loop('bed_rain',this.rainG,1.3);if(this.oldRainG)this.oldRainG.gain.setTargetAtTime(0,c.currentTime,.5);}
    if(this.windG)loop('bed_wind',this.windG,1);
    if(this.droneG)loop('bed_drone',this.droneG,2.5);
    if(this.roomG)loop('bed_room',this.roomG,1);
    // tensão vai pela música (respeita a barra de volume da música)
    const dest=(typeof MUS!=='undefined'&&MUS.out)||this.master;
    SND.ten=c.createGain();SND.ten.gain.value=0;SND.ten.connect(dest);SND.tenDest=dest;
    SND.tenPad=loop('bed_ten',SND.ten,0);SND.tenPulse=loop('bed_pulse',SND.ten,0);
    SND.score=c.createGain();SND.score.gain.value=0;SND.score.connect(dest);SND.scDest=dest;SND.scAmb=loop('bed_amb',SND.score,0);SND.scCoro=loop('bed_coro',SND.score,0);
  };
  const AMB={next:20,lvl:0};
  const EVT=[
    {w:3,f(){AU.pb('creak',{vol:.28,far:.75,pan:(Math.random()-.5)*1.8,wet:.7,rate:.7+Math.random()*.3});}},
    {w:2,f(){AU.pb('scream',{vol:.05,far:.93,pan:(Math.random()-.5)*1.8,wet:.9,rate:.8+Math.random()*.25});}},
    {w:2,f(){AU.pb('howl',{vol:.08,far:.85,pan:(Math.random()-.5)*1.8,wet:.8,rate:.85+Math.random()*.2});}},
    {w:2,f(){const id=['fuzil','pistola','escopeta'][(Math.random()*3)|0];const pan=(Math.random()-.5)*1.8;for(let i=0;i<1+((Math.random()*3)|0);i++)AU.pb('shot_'+id,{vol:.06,far:.96,pan,wet:.6,delay:i*(.25+Math.random()*.4)});}},
    {w:2,f(){AU.pb('glass',{vol:.3,far:.8,pan:(Math.random()-.5)*1.8,wet:.7});}},
    {w:3,f(){AU.pb('gr_z',{vol:.06,far:.85,pan:(Math.random()-.5)*1.8,wet:.7,rate:.75+Math.random()*.3});}},
    {w:2,inside:true,f(){AU.pb('knock',{vol:.25,far:.5,pan:(Math.random()-.5)*1.6,wet:.8,rate:.85});}},
    {w:2,inside:true,f(){AU.pb('drag',{vol:.2,far:.55,pan:(Math.random()-.5)*1.6,wet:.8});}},
    {w:2,f(){const r=Math.pow(2,-[0,1,3,6][(Math.random()*4)|0]/12)*.5;AU.pb('piano_lo',{vol:.14,rate:r,wet:.95,jit:0});}},
    {w:1,fear:.35,f(){try{AU.cry('sussurro',P.x+(Math.random()-.5)*200,P.y+(Math.random()-.5)*200,1);}catch(e){}}},
    {w:1,fear:.3,f(){const pan=Math.random()<.5?-.8:.8;for(let i=0;i<4;i++)AU.pb('step',{vol:.07,pan,far:.3,wet:.5,delay:i*.5+Math.random()*.05});}},
    {w:1,f(){AU.pb('chain',{vol:.15,far:.7,pan:(Math.random()-.5)*1.8,wet:.8,rate:.6});}},
  ];
  function ambEvent(inside,fear){
    const L=EVT.filter(e=>(!e.inside||inside)&&(!e.fear||fear>=e.fear));let s=L.reduce((a,e)=>a+e.w,0)*Math.random();
    for(const e of L){s-=e.w;if(s<=0){e.f();return;}}
  }
  const om=AU.mix.bind(AU);
  let lastT=0;
  AU.mix=function(safe,inside){
    om(safe,inside);const c=this.ctx;if(!c)return;
    try{SND.pump(c,SND.ok?0:(G.mode==='play'?5:9));}catch(e){}
    if(!SND.ok)return;
    const t=c.currentTime,dt=Math.min(.1,Math.max(0,t-lastT));lastT=t;
    const play=G.mode==='play',sew=typeof inSew==='function'&&play&&inSew(),storm=G.wx==='tempestade';
    // chuva, vento e "sala fechada"
    this.rainG.gain.setTargetAtTime(!play?.03:sew?.004:storm?.1:inside?.035:.05,t,.6);
    this.windG.gain.setTargetAtTime(!play?.02:sew||safe?0:inside?.012:storm?.07:.035,t,.8);
    this.roomG.gain.setTargetAtTime(play&&(inside||sew)?.03:0,t,.8);
    this.outF.frequency.setTargetAtTime(play&&(inside||sew)?650:18000,t,.3);
    // tensão: quanta coisa está te caçando agora
    let ch=0;if(play&&!safe&&!(typeof CUT!=='undefined'&&CUT.on))for(const e of enemies){if(e.alive&&e.state==='chase'){const d=hyp(e.x-P.x,e.y-P.y);if(d<560)ch+=e.t&&e.t.boss?1:d<260?.45:.25;}}
    const fear=play?(G.fear||0):0,boss=typeof musicMode==='function'&&musicMode()!=null;
    const want=boss||safe||!play?0:clamp(ch*.6+fear*.45,0,1);AMB.lvl+=(want-AMB.lvl)*Math.min(1,dt*(want>AMB.lvl?1.2:.35));
    if(SND.ten){const dest=(typeof MUS!=='undefined'&&MUS.out)||this.master;if(dest!==SND.tenDest){try{SND.ten.disconnect();}catch(e){}SND.ten.connect(dest);SND.tenDest=dest;}
      SND.tenPad&&SND.tenPad.gain.setTargetAtTime(Math.pow(AMB.lvl,1.2)*.5,t,.3);SND.tenPulse&&SND.tenPulse.gain.setTargetAtTime(clamp(AMB.lvl*1.5-.45,0,1)*.6,t,.3);SND.ten.gain.setTargetAtTime(this.on?.55:0,t,.3);}
    // trilha ambiente: toca um tempo, some, volta. O silêncio também assusta.
    if(SND.score){const dest=(typeof MUS!=='undefined'&&MUS.out)||this.master;if(dest!==SND.scDest){try{SND.score.disconnect();}catch(e){}SND.score.connect(dest);SND.scDest=dest;}
      AMB.sc=(AMB.sc??20)-dt;if(AMB.sc<=0){AMB.scOn=!AMB.scOn;AMB.sc=AMB.scOn?rr(55,95):rr(35,70);}
      const cb=typeof inCb==='function'&&play&&inCb(), want2=play&&!safe&&!boss&&AMB.lvl<.35&&AMB.scOn&&!(typeof CUT!=='undefined'&&CUT.on&&!cb);
      SND.scAmb&&SND.scAmb.gain.setTargetAtTime(want2&&!cb?.32:0,t,4);SND.scCoro&&SND.scCoro.gain.setTargetAtTime(want2&&cb?.4:(cb&&play&&!boss?.08:0),t,4);
      SND.score.gain.setTargetAtTime(this.on?.6:0,t,.5);}
    // barulhos ao longe
    if(play&&!safe&&!(typeof CUT!=='undefined'&&CUT.on)&&!(typeof MP!=='undefined'&&MP.on)){AMB.next-=dt;if(AMB.next<=0){AMB.next=(45+Math.random()*65)*(1-fear*.3);if(AMB.lvl<.5&&Math.random()<.7)ambEvent(inside,fear);}}
  };
  SND.amb=AMB;
})();

// ---------- música nova no menu e nos chefes (com instrumentos gravados) ----------
(function(){
  const om=musMenu,obs=musBoss;
  function mrev(c){if(SND.mrev)return SND.mrev;try{const sr=c.sampleRate,len=Math.round(sr*4),b=c.createBuffer(2,len,sr);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);let y=0;for(let i=0;i<len;i++){const u=i/len,k=.1+.8*u;y=y*k+(Math.random()*2-1)*(1-k);d[i]=y*Math.exp(-u*5)*(1+k*2);}}
    const cv=c.createConvolver();cv.buffer=b;const g=c.createGain();g.gain.value=.55;cv.connect(g);g.connect(MUS.g);SND.mrev=cv;}catch(e){SND.mrev=null;}return SND.mrev;}
  function smp(c,name,at,rate,vol,wet=.4,pan=0){const L=SND.b[name];if(!L||!MUS.g)return;const s=c.createBufferSource();s.buffer=L[(Math.random()*L.length)|0];s.playbackRate.value=rate;
    const g=c.createGain();g.gain.value=vol;s.connect(g);let n=g;if(pan&&c.createStereoPanner){const p=c.createStereoPanner();p.pan.value=pan;g.connect(p);n=p;}n.connect(MUS.g);const r=mrev(c);if(r&&wet>0){const w=c.createGain();w.gain.value=wet;n.connect(w);w.connect(r);}
    s.start(at);s.stop(at+(s.buffer.duration/rate)+.05);}
  const pno=(c,m,at,vol,wet=.55,pan=0)=>{const f=HZ(m),hi=f>440;smp(c,hi?'piano_hi':'piano_lo',at,f/(hi?880:220),vol,wet,pan);};
  musMenu=function(s,at,c){
    if(!SND.ok)return;
    const chords=[[57,60,64],[53,57,60],[48,52,55],[52,56,59]],bar=(s/16)|0,ch=chords[bar%4],k=s%16;
    if(k===0){for(const m of ch)smp(c,'pad',at,HZ(m-12)/110,.09,.5);pno(c,ch[0]-24,at,.32,.6);}
    const arp=[0,1,2,1,0,2,1,2];if(k%2===0||Math.random()<.35)pno(c,ch[arp[k%8]]+12,at,.08+Math.random()*.05,.55,(k%4-1.5)*.2);
    const mel={0:[76,72,72,71],6:[74,72,72,71],10:[72,69,67,68],14:[71,69,64,64]}[k];if(mel&&Math.random()<.85)pno(c,mel[bar%4],at,.13,.7);
    if(k===8&&Math.random()<.3)pno(c,ch[2]+24,at,.05,.9);
    if(k===12&&bar%4===3)smp(c,'creak',at,.6,.05,.9,-.6);
  };
  musBoss=function(s,at,c,fin){
    if(!SND.ok)return obs(s,at,c,fin);
    const k=s%16,bar=(s/16)|0,bass=[38,38,41,38,36,38,46,45][(s>>1)%8];
    if(s%2===0)nt(c,HZ(bass),at,.22,'sawtooth',.3,MUS.g,520);
    if(k%4===0)smp(c,'kick',at,1,.85,.1);
    if(k===4||k===12)smp(c,'snare',at,1,.45,.3);
    if(k%2===1||(fin&&Math.random()<.5))smp(c,'hat',at,1,.1+Math.random()*.06,.05,(Math.random()-.5)*.5);
    if(k===0)smp(c,'taiko',at,1,.6,.5);
    if(k===10&&bar%2)smp(c,'taiko',at,1.2,.35,.5);
    if(k===0&&bar%2===0)for(const m of [50,51,57,(fin?62:58)])smp(c,'brass',at,HZ(m)/146.83,.14,.45);
    if(fin&&k%4===2)nt(c,HZ(bass+24),at,.12,'square',.04,MUS.g,2400);
  };
})();
