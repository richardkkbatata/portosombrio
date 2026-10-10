// ===================== MUNDO =====================
const map=new Uint8Array(W*HT), meta=new Uint8Array(W*HT), under=new Uint8Array(W*HT), bmap=new Int16Array(W*HT),
  safeMask=new Uint8Array(W*HT), mark=new Uint8Array(W*HT), rdir=new Uint8Array(W*HT), tvar=new Float32Array(W*HT),
  reach=new Uint8Array(W*HT), explored=new Uint8Array(W*HT);
let puddles=[], buildings=[], cars=[], lights=[], lamps=[], pickups=[], interacts=[], gates=[], npcs=[], initEnemies=[], LM={}, START={x:0,y:0}, uidc=0;
const pickOcc = new Set();
const idx=(x,y)=>y*W+x;
const inb=(x,y)=>x>=0&&y>=0&&x<W&&y<HT;
const tc=v=>v*TILE+TILE/2;
const OVERLAY_T = new Set([T.PROP,T.TREE,T.FENCE,T.CAR,T.GATE,T.RUBBLE,T.SHUTTER,T.WINDOW]);
let winAt=new Map(), MAPV=0;
function setT(x,y,t,m=0){
  if(!inb(x,y))return; const i=idx(x,y); MAPV++;
  if(OVERLAY_T.has(t)){ if(!SOLID[map[i]]) under[i]=map[i]; } else under[i]=t;
  map[i]=t; meta[i]=m;
}
function getT(x,y){return inb(x,y)?map[idx(x,y)]:T.BORDER;}
function rect(x,y,w,h,t,m=0){for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)setT(i,j,t,m);}
function dAt(tx,ty){for(let d=DISTRICTS.length-1;d>=0;d--)if(ty>=DISTRICTS[d].y0)return d;return 0;}
function tileAtPx(x,y){return getT(Math.floor(x/TILE),Math.floor(y/TILE));}

function protect(b,x,y){for(let j=-1;j<=1;j++)for(let i=-1;i<=1;i++)b.prot.add(idx(x+i,y+j));}
function building(x,y,w,h,o={}){
  const b={id:buildings.length,x,y,w,h,roof:o.roof||'#3b3634',name:o.name||'',safe:!!o.safe,roofA:1,kind:o.kind||'casa',loot:!!o.loot,prot:new Set(),floor:o.floor??T.WOOD,lit:!o.safe&&R()<.32};
  buildings.push(b);
  for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++){
    const e=i===x||j===y||i===x+w-1||j===y+h-1;
    setT(i,j,e?T.WALL:b.floor); bmap[idx(i,j)]=b.id; if(b.safe)safeMask[idx(i,j)]=1;
  }
  for(const dd of (o.doors||[['S']])) door(b,dd[0],dd[1],dd[2]||2);
  return b;
}
function door(b,side,off,wd=2){
  const horiz=side==='N'||side==='S'; const len=horiz?b.w:b.h;
  if(off==null)off=Math.floor((len-wd)/2);
  for(let k=0;k<wd;k++){
    let x,y;
    if(side==='N'){x=b.x+off+k;y=b.y;} else if(side==='S'){x=b.x+off+k;y=b.y+b.h-1;}
    else if(side==='W'){x=b.x;y=b.y+off+k;} else {x=b.x+b.w-1;y=b.y+off+k;}
    setT(x,y,b.floor); protect(b,x,y); (b.doorT||(b.doorT=[])).push({x,y,side});
    const ox=x+(side==='W'?-1:side==='E'?1:0), oy=y+(side==='N'?-1:side==='S'?1:0);
    const ot=getT(ox,oy);
    if(SOLID[ot]&&ot!==T.BORDER&&ot!==T.WATER&&ot!==T.WALL) setT(ox,oy,T.SIDE);
  }
}
// parede interna reta com aberturas: gaps = [[início,largura],...]
function iwall(b,x0,y0,x1,y1,gaps=[]){
  const inGap=v=>gaps.some(([s,w])=>v>=s&&v<s+w);
  if(y0===y1){for(let x=x0;x<=x1;x++){if(inGap(x)){protect(b,x,y0);continue;}setT(x,y0,T.WALL);}}
  else {for(let y=y0;y<=y1;y++){if(inGap(y)){protect(b,x0,y);continue;}setT(x0,y,T.WALL);}}
}
function furnish(b,p,types){
  for(let j=b.y+1;j<b.y+b.h-1;j++)for(let i=b.x+1;i<b.x+b.w-1;i++){
    const k=idx(i,j); if(SOLID[map[k]]||b.prot.has(k)||pickOcc.has(k))continue;
    const adj=getT(i-1,j)===T.WALL||getT(i+1,j)===T.WALL||getT(i,j-1)===T.WALL||getT(i,j+1)===T.WALL;
    if(!adj||R()>=p*.62)continue;
    // nunca em corredor estreito nem colado numa passagem/porta
    const sol=(x,y)=>SOLID[getT(x,y)], gap=(x,y)=>!sol(x,y)&&((sol(x-1,y)&&sol(x+1,y))||(sol(x,y-1)&&sol(x,y+1)));
    if((sol(i-1,j)&&sol(i+1,j))||(sol(i,j-1)&&sol(i,j+1)))continue;
    if(gap(i-1,j)||gap(i+1,j)||gap(i,j-1)||gap(i,j+1))continue;
    let nb=0;for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++)if((dx||dy)&&getT(i+dx,j+dy)===T.PROP)nb++; if(nb>=2)continue;
    setT(i,j,T.PROP,pick(types));
  }
}
function prop(x,y,m){setT(x,y,T.PROP,m);}
function freeTileNear(tx,ty,needReach){
  for(let r=0;r<10;r++)for(let j=-r;j<=r;j++)for(let i=-r;i<=r;i++){
    if(Math.max(Math.abs(i),Math.abs(j))!==r)continue;
    const x=tx+i,y=ty+j; if(!inb(x,y))continue; const k=idx(x,y);
    if(SOLID[map[k]])continue; if(needReach&&!reach[k])continue; if(pickOcc.has(k))continue;
    return [x,y];
  }
  return [tx,ty];
}
function addPick(tx,ty,id,q=1,kind='item'){
  const [x,y]=freeTileNear(tx,ty,false);
  const p={uid:'p'+(uidc++),tx:x,ty:y,x:tc(x),y:tc(y),id,q,kind};
  pickups.push(p); pickOcc.add(idx(x,y)); return p;
}
function addInteract(tx,ty,type,m){prop(tx,ty,m);const it={tx,ty,x:tc(tx),y:tc(ty),type};interacts.push(it);return it;}
function addGate(id,x,y,w,h,key,col,name,msg,und=T.ROAD){
  const g={id,x,y,w,h,key,col,name,msg,under:und,open:false,steel:id==='servico'||id.startsWith('shop')};
  gates.push(g); rect(x,y,w,h,g.steel?T.SHUTTER:T.GATE); for(let j=y;j<y+h;j++)for(let i=x;i<x+w;i++)under[idx(i,j)]=und;
  return g;
}
function openGate(g){g.open=true;for(let j=g.y;j<g.y+g.h;j++)for(let i=g.x;i<g.x+g.w;i++)setT(i,j,g.under);if(typeof invalidateRect==='function')invalidateRect(g.x,g.y,g.w,g.h);}
function gateCenter(id){const g=gates.find(g=>g.id===id);return g?{x:(g.x+g.w/2)*TILE,y:(g.y+g.h/2)*TILE}:null;}
function safeRoom(x,y,w,h,doors,name){
  const b=building(x,y,w,h,{floor:T.SAFE,safe:true,roof:'#2a3a31',name,doors,kind:'safe'});
  addInteract(x+1,y+1,'typewriter',20);
  addInteract(x+w-2,y+1,'box',21);
  lights.push({x:(x+w/2)*TILE,y:(y+h/2)*TILE,r:Math.max(w,h)*TILE*.8,c:'safe',f:0});
  return b;
}
// ---------- esconderijos ----------
function addHide(x,y,kind){if(kind!=='carro')prop(x,y,kind==='armario'?28:29);const it={tx:x,ty:y,x:tc(x),y:tc(y),type:'hide',kind};interacts.push(it);return it;}
function addLocker(b,x,y){const k=idx(x,y);if(SOLID[map[k]]||pickOcc.has(k))return null;b.prot.add(k);return addHide(x,y,'armario');}
function autoLocker(b){
  for(let t=0;t<30;t++){
    const x=b.x+ri(1,b.w-2),y=b.y+ri(1,b.h-2),k=idx(x,y);
    if(SOLID[map[k]]||b.prot.has(k)||pickOcc.has(k))continue;
    const wallAdj=getT(x-1,y)===T.WALL||getT(x+1,y)===T.WALL||getT(x,y-1)===T.WALL||getT(x,y+1)===T.WALL; if(!wallAdj)continue;
    let free=0;for(const [dx,dy] of DIRS4){const t2=getT(x+dx,y+dy);if(!SOLID[t2])free++;} if(free<2)continue;
    return addHide(x,y,'armario');
  }
  return null;
}
function dumpsters(x0,y0,x1,y1,p){
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    if(getT(x,y)!==T.SIDE||R()>p)continue;
    let wall=false,bad=false;
    for(const [dx,dy] of DIRS4)if(getT(x+dx,y+dy)===T.WALL)wall=true;
    if(!wall)continue;
    for(let j=-2;j<=2&&!bad;j++)for(let i=-2;i<=2;i++){const xx=x+i,yy=y+j;if(!inb(xx,yy))continue;const k=idx(xx,yy);
      if(bmap[k]>=0&&!SOLID[map[k]]){bad=true;break;} if(map[k]===T.PROP||map[k]===T.TREE){bad=true;break;}}
    if(!bad)addHide(x,y,'cacamba');
  }
}
const ROOFS=['#5a3b32','#4a4a52','#5b4d3a','#3f4a3f','#6a4535','#4d3f4f','#55463c'];
function house(x,y,w,h,side,floor=T.WOOD){
  const b=building(x,y,w,h,{floor,roof:pick(ROOFS),doors:[[side]],loot:true});
  furnish(b,.22,[1,2,3,12,14]); if(R()<.55)autoLocker(b); return b;
}
function trees(x0,y0,x1,y1,p){
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    if(getT(x,y)!==T.GRASS)continue; let ok=true;
    for(let j=-1;j<=1&&ok;j++)for(let i=-1;i<=1;i++){const t=getT(x+i,y+j);if(t!==T.GRASS){ok=false;break;}}
    if(ok&&R()<p)setT(x,y,T.TREE);
  }
}
function scatterProps(x0,y0,x1,y1,p,types,onT){
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    if(getT(x,y)!==onT)continue; let ok=true;
    for(let j=-1;j<=1&&ok;j++)for(let i=-1;i<=1;i++){const t=getT(x+i,y+j); if(t!==onT){ok=false;break;}}
    if(ok&&R()<p&&!pickOcc.has(idx(x,y)))prop(x,y,pick(types));
  }
}
const CAR_COLS=['#6a2a24','#2d3c55','#55585a','#2f4a36','#7a6a3a','#3a3a3e','#8a8a86','#5a3a5a'];
function addBus(x,y){const c={x,y,w:4,h:1,horiz:true,burn:false,col:pick(['#c8b84a','#3a6a9a','#b8b8b0']),flip:R()<.5,bus:true};cars.push(c);for(let i=0;i<4;i++)setT(x+i,y,T.CAR);return c;}
function addCar(x,y,horiz,burn,col){
  const w=horiz?2:1,h=horiz?1:2;
  const car={x,y,w,h,horiz,burn,col:col||pick(CAR_COLS),flip:R()<.5,amb:false};
  cars.push(car); for(let j=0;j<h;j++)for(let i=0;i<w;i++)setT(x+i,y+j,T.CAR);
  if(burn)lights.push({x:(x+w/2)*TILE,y:(y+h/2)*TILE,r:190,c:'fire',f:1});
  return car;
}

// ---------- ferramentas de traçado ----------
function hroad(x0,x1,y,w=4){
  for(let j=0;j<w;j++)for(let x=x0;x<=x1;x++){setT(x,y+j,T.ROAD);rdir[idx(x,y+j)]|=1;}
  for(let x=x0;x<=x1;x++)mark[idx(x,y+(w>>1)-1)]=1;
}
function vroad(x,y0,y1,w=4){
  for(let y=y0;y<=y1;y++)for(let k=0;k<w;k++){setT(x+k,y,T.ROAD);rdir[idx(x+k,y)]|=2;}
  for(let y=y0;y<=y1;y++)mark[idx(x+(w>>1)-1,y)]=2;
}
// estrada sinuosa: carimba um disco ao longo de uma polilinha
function curvyRoad(pts,rad,shoulder,tile=T.ROAD){
  for(let s=0;s<pts.length-1;s++){
    const [ax,ay]=pts[s],[bx,by]=pts[s+1],L=hyp(bx-ax,by-ay),n=Math.ceil(L*3);
    for(let i=0;i<=n;i++){
      const px=ax+(bx-ax)*i/n,py=ay+(by-ay)*i/n,R2=Math.ceil(shoulder);
      for(let j=-R2;j<=R2;j++)for(let k=-R2;k<=R2;k++){
        const x=Math.floor(px)+k,y=Math.floor(py)+j; if(x<1||y<1||x>=W-1||y>=H-1)continue;
        const d=hyp(x+.5-px,y+.5-py), t=map[idx(x,y)];
        if(d<=rad){if(t!==T.ROAD&&t!==tile)setT(x,y,tile);}
        else if(d<=shoulder&&(t===T.FOREST||t===T.ROCK||t===T.TREE))setT(x,y,d<=rad+1.1&&R()<.8?T.DIRT:T.GRASS);
      }
    }
  }
}
function sidewalksIn(x0,y0,x1,y1){
  for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++){
    if(getT(x,y)!==T.GRASS)continue;
    let near=false;
    for(let j=-1;j<=1&&!near;j++)for(let i=-1;i<=1;i++){if(getT(x+i,y+j)===T.ROAD){near=true;break;}}
    if(near)setT(x,y,T.SIDE);
  }
}
function replaceIn(x0,y0,x1,y1,from,to){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)if(inb(x,y)&&map[idx(x,y)]===from)setT(x,y,to);}
const NOCARS=[[100,150,127,188],[148,360,157,377],[150,22,166,31],[170,70,180,87],[120,134,133,150],[120,272,129,276],[150,279,156,287],[106,66,117,72]];
let NOFIX=[];
function carsIn(x0,y0,x1,y1,n){
  let tries=0,placed=0;
  while(placed<n&&tries++<800){
    const horiz=R()<.5,w=horiz?2:1,h=horiz?1:2,x=ri(x0,x1),y=ri(y0,y1); let ok=!NOCARS.some(([a,b,c,d])=>x>=a-1&&x<=c&&y>=b-1&&y<=d);
    for(let j=-2;j<=h+1&&ok;j++)for(let i=-2;i<=w+1;i++){
      const t=getT(x+i,y+j);
      if(j>=0&&j<h&&i>=0&&i<w){if(t!==T.ROAD||rdir[idx(x+i,y+j)]!==(horiz?1:2)){ok=false;break;}}
      else if(t===T.CAR){ok=false;break;}
    }
    if(!ok)continue;
    addCar(x,y,horiz,R()<.12); placed++;
  }
}
// preenche uma quadra (limites inclusivos, sem a rua) com prédios
function fillBlock(x0,y0,x1,y1,o={}){
  const w=x1-x0+1,h=y1-y0+1,side=o.side||'S',roofs=o.roofs||ROOFS;
  const mk=(x,y,ww,hh,sd)=>{const b=building(x,y,ww,hh,{floor:o.floor??(R()<.5?T.WOOD:T.TILEF),roof:pick(roofs),doors:[[sd]],loot:true,kind:o.kind||'casa',name:o.name||''});if(ww>=8&&hh>=8&&!o.tower)bsp(b,x+1,y+1,x+ww-2,y+hh-2,2,3);furnish(b,o.tower?.22:.16,o.props||[1,2,3,12,14]);if(R()<.55)autoLocker(b);return b;};
  if(o.tower){const b=mk(x0+1,y0+1,w-2,h-2,side);b.tall=1;return [b];}
  if(w>=13){
    const a=Math.floor((w-3)/2);
    const out=[];
    if(R()>.12)out.push(mk(x0+1,y0+1,a,h-2,side));
    if(R()>.12)out.push(mk(x0+2+a,y0+1,w-3-a,h-2,side));
    return out;
  }
  if(R()<.15&&!o.always){trees(x0+1,y0+1,x1-1,y1-1,.3);return [];}
  return [mk(x0+1,y0+1,w-2,h-2,side)];
}
function quiosque(x,y,name){const b=building(x,y,4,3,{floor:T.WOOD,roof:'#7a5a3a',name:name||'Quiosque',doors:[['W',1,1]],loot:true});return b;}
const COAST_K=[[0,199],[33,199],[34,198],[71,198],[73,188],[81,188],[83,196],[404,196],[411,171],[436,170],[442,195],[452,198],[469,190]];
function coastX(y){
  for(let i=0;i<COAST_K.length-1;i++){const [y0,x0]=COAST_K[i],[y1,x1]=COAST_K[i+1];if(y>=y0&&y<=y1)return Math.round(lerp(x0,x1,(y-y0)/Math.max(1,y1-y0)));}
  return 196;
}
const ROOFS_COL=['#8a4a3a','#6a7a4a','#b08a3a','#4a6a8a','#8a5a6a','#a0603a','#5a7a7a'];
const ROOFS_TOWER=['#3a3d42','#34373c','#42454a','#2e3238','#3c3a40'];

// ---------- relevo, mar e matas ----------
function genTerrain(){
  for(let x=0;x<W;x++){setT(x,0,T.BORDER);setT(x,H-1,T.BORDER);}
  for(let y=0;y<H;y++){setT(0,y,T.BORDER);setT(W-1,y,T.BORDER);}
  // Rio Itajaí-Açu ao norte e o mar a leste
  rect(1,1,W-2,9,T.WATER);
  for(let y=10;y<H-1;y++){const c=coastX(y)+(y>82&&(y<140||y>158)?Math.round(Math.sin(y*.37)*.6):0);for(let x=c;x<W-1;x++)setT(x,y,T.WATER);}
  // morros e matas
  rect(1,10,13,62,T.FOREST);                                    // morro a oeste de Itajaí
  for(let y=72;y<=81;y++)for(let x=1;x<coastX(y);x++)setT(x,y,x>178?T.ROCK:T.FOREST); // morro de Cabeçudas
  rect(1,82,13,58,T.FOREST);                                    // mata atrás da Brava
  for(let y=140;y<=158;y++)for(let x=1;x<coastX(y);x++)setT(x,y,x>=160?T.ROCK:T.FOREST); // Morro do Careca
  rect(1,159,11,230,T.FOREST);                                  // morros a oeste de BC
  rect(12,332,26,57,T.FOREST);                                  // morro do Cristo Luz
  rect(1,389,W-2,5,T.WATER);                                    // Rio Camboriú
  rect(1,394,W-2,H-395,T.FOREST);                               // morro das Laranjeiras
  for(let y=394;y<=H-2;y++)for(let x=coastX(y);x<W-1;x++)setT(x,y,T.WATER);
  // areia: prainha de Cabeçudas, Brava e Balneário
  for(let y=73;y<=388;y++){
    if(y>=140&&y<=158)continue;
    const c=coastX(y), s=c-(y<82?5:10);
    for(let x=s;x<c;x++)if(getT(x,y)!==T.WATER)setT(x,y,T.SAND);
  }
  // bordas irregulares de mata (clareiras)
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    const t=map[idx(x,y)]; if(t!==T.FOREST)continue;
    let edge=false;for(const [dx,dy] of DIRS4){const n=getT(x+dx,y+dy);if(n===T.GRASS){edge=true;break;}}
    if(edge&&R()<.35)setT(x,y,T.TREE);
  }
}
// fileira de casas com cômodos numa quadra comprida
function rowHouses(x0,y0,x1,y1,side,o={}){
  let x=x0+1; const h=y1-y0-1;
  while(x<=x1-7){
    const w=Math.min(x1-x,ri(8,11)); if(w<7)break;
    if(R()<.1){trees(x,y0+1,x+w-1,y1-1,.35);x+=w+1;continue;}
    const hh=Math.max(7,h-ri(0,3)), by=side==='N'?y0+1:y1-hh;
    bigHouse(x,by,w,hh,side,{roof:o.roofs?pick(o.roofs):undefined});
    x+=w+1+(R()<.3?1:0);
  }
}
// labirinto: células de 2x2 separadas por paredes, com alguns atalhos para não virar só beco sem saída
function carveMaze(b,ox,oy,cols,rows,p=3){
  const c=p-1;
  for(let y=oy;y<oy+rows*p-1;y++)for(let x=ox;x<ox+cols*p-1;x++)setT(x,y,T.WALL);
  const seen=new Uint8Array(cols*rows), links=new Uint8Array(cols*rows), cell=(i,j)=>{rect(ox+i*p,oy+j*p,c,c,b.floor);};
  const link=(i,j,ni,nj)=>{links[j*cols+i]++;links[nj*cols+ni]++;if(ni>i)rect(ox+i*p+c,oy+j*p,1,c,b.floor);else if(ni<i)rect(ox+ni*p+c,oy+j*p,1,c,b.floor);else if(nj>j)rect(ox+i*p,oy+j*p+c,c,1,b.floor);else rect(ox+i*p,oy+nj*p+c,c,1,b.floor);};
  const st=[[0,rows-1]]; seen[(rows-1)*cols]=1; cell(0,rows-1);
  while(st.length){
    const [i,j]=st[st.length-1], nb=[[1,0],[-1,0],[0,1],[0,-1]].map(([dx,dy])=>[i+dx,j+dy]).filter(([a,c])=>a>=0&&c>=0&&a<cols&&c<rows&&!seen[c*cols+a]);
    if(!nb.length){st.pop();continue;}
    const [ni,nj]=nb[Math.floor(R()*nb.length)]; seen[nj*cols+ni]=1; cell(ni,nj); link(i,j,ni,nj); st.push([ni,nj]);
  }
  for(let k=0;k<Math.floor(cols*rows*.18);k++){const i=ri(0,cols-2),j=ri(0,rows-2);if(R()<.5)link(i,j,i+1,j);else link(i,j,i,j+1);}
  return {p,at:(i,j)=>({x:ox+i*p,y:oy+j*p}),dead:(i,j)=>links[j*cols+i]<=1,room:(i,j,w,h)=>{rect(ox+i*p,oy+j*p,w*p-1,h*p-1,b.floor);return {x0:ox+i*p,y0:oy+j*p,x1:ox+(i+w)*p-2,y1:oy+(j+h)*p-2};}};
}

// ---------- Porto de Itajaí ----------
function genPorto(){
  rect(14,10,184,2,T.CONC);                          // cais
  rect(14,12,184,19,T.CONC);                         // pátio do porto
  rect(50,4,4,6,T.PIER); for(let x=50;x<=53;x+=3)prop(x,4,7);  // ferry para Navegantes
  rect(196,10,3,3,T.ROCK);                           // molhe na foz
  hroad(14,197,26);                                  // via interna do porto
  vroad(110,12,31);
  for(let x=14;x<=197;x++)if(!((x>=46&&x<=49)||(x>=110&&x<=113)||(x>=142&&x<=145)))setT(x,31,T.FENCE);
  // Laboratório Vértice: recepção, laboratórios, servidores, diretoria, contenção
  {const lab=building(18,13,45,13,{floor:T.TILEF,roof:'#2e3236',name:'Laboratório Vértice',doors:[['E',5,2],['N',4,2]],kind:'lab'});
   iwall(lab,19,17,61,17,[[22,2],[31,2],[40,2],[49,2],[58,2]]); for(const x of [27,36,45,54])iwall(lab,x,14,x,16);
   iwall(lab,19,20,61,20,[[24,2],[36,2],[46,2],[56,2]]); for(const x of [30,42,52])iwall(lab,x,21,x,24);
   for(const x of [20,22,24,26,28])prop(x,22,15); for(const x of [33,35,37,39])prop(x,22,11);
   for(const [x,y] of [[29,15],[31,15],[33,15],[38,15],[40,15],[42,15]])prop(x,y,11); for(let x=46;x<=53;x+=2)prop(x,14,35);
   prop(57,14,2); prop(59,14,2); for(const x of [44,46,48,50])prop(x,24,4); for(let x=53;x<=61;x+=2)prop(x,24,28);
   addPick(60,15,'heliKey',1); addPick(56,16,'silenciador',1); addPick(24,23,13,1,'file'); addPick(50,22,6,4,'weapon'); addPick(47,22,'g40',3); addPick(58,22,'spray',1);
   LM.heliKey={x:tc(60),y:tc(15)}; LM.lab={x:tc(64),y:tc(18.5)};
   for(const [x,y] of [[25,22],[37,23]])addDecalStatic('blood',x,y,18);
   lights.push({x:tc(40),y:tc(18.5),r:140,c:'lamp',f:1}); lights.push({x:tc(24),y:tc(22),r:90,c:'siren',f:0});}
  // Armazém 4 (lança-chamas) e Armazém 5
  {const wh=building(68,13,22,12,{floor:T.TILEF,roof:'#41464a',name:'Armazém 4',doors:[['S'],['N',3,2]],kind:'armazem',loot:true});
   iwall(wh,79,14,79,23,[[18,2]]); for(let y=15;y<=22;y+=3)for(let x=70;x<=77;x++)if(x!==73)prop(x,y,4);
   addPick(86,16,5,60,'weapon'); addPick(71,21,7,1,'file'); addPick(87,22,'comb',60); LM.armazem={x:tc(86),y:tc(16)};
   lights.push({x:tc(79),y:tc(18),r:130,c:'lamp',f:1});}
  {const w5=building(94,13,15,12,{floor:T.TILEF,roof:'#3e4448',name:'Armazém 5',doors:[['S']],kind:'armazem',loot:true});
   for(let y=15;y<=21;y+=3)for(let x=96;x<=106;x++)if(x!==101)prop(x,y,4); addPick(100,22,'cart',4);}
  // pátio de contêineres e guindastes
  for(const [x,y,l] of [[116,14,10],[116,17,10],[130,14,12],[130,18,12],[116,21,8],[146,14,8],[146,18,8],[130,22,10]])
    for(let i=0;i<l;i++){if(getT(x+i,y)===T.CONC)prop(x+i,y,6);if(getT(x+i,y+1)===T.CONC)prop(x+i,y+1,6);}
  for(let y=13;y<=25;y++)for(let x=156;x<=165;x++)prop(x,y,6);          // muralha de contêineres na frente do heliponto
  for(const x of [60,100,122,138,152])if(getT(x,12)===T.CONC){prop(x,12,15);lights.push({x:tc(x),y:tc(12),r:220,c:'flood',f:0});}
  // cabine do guindaste: só quem sabe operar tira os contêineres caídos da via
  {building(147,21,6,4,{floor:T.TILEF,roof:'#c9a24a',name:'Cabine do guindaste',doors:[['S',2,2]],kind:'cabine'});
   addInteract(150,22,'guindaste',24); LM.guindaste={x:tc(149.5),y:tc(25.5)};}
  addGate('conteiner',156,26,10,4,null,'#6e3529','Contêineres caídos','Uma pilha de contêineres tombou na via. Só um guindaste tira isso daqui.',T.CONC);
  // heliponto
  rect(166,13,31,17,T.CONC);
  for(let x=166;x<=196;x++){setT(x,13,T.FENCE);setT(x,29,T.FENCE);} for(let y=13;y<=29;y++){setT(166,y,T.FENCE);setT(196,y,T.FENCE);}
  addGate('heli',166,26,1,2,'heliKey','#d55a4a','Portão do heliponto','Trancado. O leitor pede o cartão do heliponto.',T.CONC);
  addInteract(169,15,'radio',24); LM.radio={x:tc(169),y:tc(15)};
  LM.pad={x:tc(182),y:tc(21)};
  for(const [x,y] of [[169,27],[193,15],[193,27]])lights.push({x:tc(x),y:tc(y),r:200,c:'flood',f:0});
  LM.cais={x:tc(140),y:tc(11)};
  carsIn(14,26,155,29,3);
  graf(130,28,'NAVIO À DERIVA — NÃO RESPONDE',{c:'#d8d4c8',s:.7});
}

// ---------- Itajaí, Centro Histórico ----------
function genItajai(){
  hroad(14,197,32); hroad(14,81,50); hroad(142,197,50); hroad(14,197,68);
  for(const x of [14,46,78,142,174])vroad(x,32,71);
  const XC=[[18,45],[50,77],[82,109],[114,141],[146,173],[178,197]], YR=[[36,49],[54,67]];
  // Hospital Santa Clara: dois quarteirões de corredores largos. Não tem infectado aqui dentro. Tem uma coisa que escuta.
  {const hb=building(82,36,60,32,{floor:T.TILEF,roof:'#5e625e',name:'Hospital Santa Clara',doors:[['S',28,4],['N',4,2]],kind:'hospital2'});
   hb.noZ=true; hb.dark=true;
   const mz=carveMaze(hb,84,37,14,7,4), P4=4;
   rect(83,64,58,3,T.TILEF);                          // corredor da recepção, de ponta a ponta
   rect(104,61,16,3,T.TILEF);                         // recepção
   const iso=mz.room(12,0,2,2), man=mz.room(0,2,2,2), nec=mz.room(4,0,3,1), far=mz.room(8,4,2,2), uti=mz.room(2,5,2,1), cap=mz.room(10,2,1,2);
   addGate('hospIn',110,67,4,1,null,'#55585c','Porta do hospital','A porta travou atrás de você. Não abre por dentro.',T.TILEF); {const g=gates[gates.length-1];g.shut=true;openGate(g);}
   addGate('hospOut',86,36,2,1,'alicate','#8a8478','Saída dos fundos','Corrente grossa com cadeado. Precisa de um alicate de corte.',T.TILEF);
   rect(86,37,2,1,T.TILEF);
   npcs.push({id:'matH',name:'Matheus',look:'math',crouch:true,x:tc(iso.x0+3),y:tc(iso.y0+3),col:'#e8e6e0',hair:'#140f0c',skin:'#d9aa8c',ang:Math.PI/2,cond:()=>!(G.flags&&G.flags.matheusJoin)});
   LM.isol={x:tc(iso.x0+3),y:tc(iso.y0+3)}; prop(iso.x1,iso.y0,11); prop(iso.x0,iso.y1,4); prop(iso.x1,iso.y1,11);
   addPick(man.x0+1,man.y0+1,'alicate',1); LM.alicate={x:tc(man.x0+1),y:tc(man.y0+1)}; prop(man.x1,man.y1,4); prop(man.x1,man.y0,1); prop(man.x0,man.y1,15);
   for(let x=nec.x0;x<=nec.x1;x+=3)prop(x,nec.y0,36); addPick(nec.x1,nec.y1,23,1,'file'); for(let x=nec.x0+1;x<nec.x1;x+=4)addDecalStatic('blood',x,nec.y1,18);
   prop(far.x0,far.y0,1); prop(far.x1,far.y0,1); prop(far.x0+2,far.y0,1); addPick(far.x0+2,far.y0+2,'ervaV',1); addPick(far.x1,far.y1,'spray',1); addPick(far.x0,far.y1,'pilha',1);
   for(let x=uti.x0;x<=uti.x1;x+=3)prop(x,uti.y0,36); addPick(uti.x1,uti.y1,'ervaR',1); addDecalStatic('corpse',uti.x0+3,uti.y1,12);
   prop(cap.x0+1,cap.y0,27); addPick(cap.x0,cap.y1,'garrafa',2); lights.push({x:tc(cap.x0+1),y:tc(cap.y0+1),r:90,c:'candle',f:1});
   // garrafas pelo corredor (no canto da célula, nunca no meio da passagem)
   {let n=0;for(let k=0;k<40&&n<4;k++){const i=ri(0,13),j=ri(0,6),c=mz.at(i,j);if(SOLID[getT(c.x,c.y)]||pickOcc.has(idx(c.x,c.y)))continue;addPick(c.x,c.y,'garrafa',1);n++;}}
   // macas e armários só nas pontas sem saída, encostados na parede
   let placed=0;for(let j=0;j<7;j++)for(let i=0;i<14;i++){if(!mz.dead(i,j)||R()<.35)continue;const c=mz.at(i,j);const cx=c.x+2,cy=c.y+2;if(SOLID[getT(cx,cy)])continue;
     if(placed%3===0)addLocker(hb,cx,cy);else if(placed%3===1)prop(cx,cy,36);else addDecalStatic('drag',c.x+1,c.y+1,0);placed++;}
   for(let k=0;k<10;k++){const i=ri(0,13),j=ri(0,6),c=mz.at(i,j);addDecalStatic(R()<.5?'blood':'drag',c.x+1,c.y+1,16);}
   for(const [x,y] of [[111,62],[90,48],[120,42],[134,56],[100,40]])lights.push({x:tc(x),y:tc(y),r:80,c:'siren',f:1});
   initEnemies.push({uid:'ouvinte',type:'ouvinte',x:tc(mz.at(7,3).x+1.5),y:tc(mz.at(7,3).y+1.5),home:1});
   LM.hospIt={x:tc(111.5),y:tc(69)}; LM.hospExit={x:tc(86.5),y:tc(34)}; LM.hospIn={x:tc(111.5),y:tc(64.5)};
   graf(112,70.4,'NÃO FAÇA BARULHO',{rot:.02}); graf(96,34.4,'ELA ESCUTA',{rot:-.03});}
  // Igreja Matriz
  {const ch=building(52,37,24,12,{floor:T.WOOD,roof:'#5a3a3a',name:'Igreja Matriz',doors:[['S',10,3]],kind:'igreja'});
   iwall(ch,53,40,74,40,[[54,1],[73,1]]);
   for(let x=58;x<=69;x++)prop(x,41,27); for(let y=43;y<=46;y+=1)if(y%2){for(let x=54;x<=61;x++)prop(x,y,13);for(let x=66;x<=73;x++)prop(x,y,13);}
   addPick(60,38,'polvF',3); addPick(72,38,'spray',1); LM.matriz={x:tc(63.5),y:tc(50)}; addInteract(53,38,'sino',27); LM.sino={x:tc(53),y:tc(39)};
   lights.push({x:tc(63.5),y:tc(41),r:160,c:'candle',f:1});
   initEnemies.push({uid:'matr1',type:'zumbi',x:tc(64),y:tc(44),dorm:true,feed:true});}
  // Praça da Matriz
  {rect(50,54,28,14,T.GRASS); for(let x=50;x<=77;x++){setT(x,60,T.DIRT);setT(x,61,T.DIRT);} for(let y=54;y<=67;y++){setT(63,y,T.DIRT);setT(64,y,T.DIRT);}
   building(60,57,8,8,{floor:T.WOOD,roof:'#6a5a3a',name:'Coreto da Matriz',doors:[['N',3,2],['S',3,2],['E',3,2],['W',3,2]],kind:'coreto'});
   trees(50,54,77,67,.18); LM.pracaIt={x:tc(63.5),y:tc(60.5)}; graf(63.5,57.4,'ITAJAÍ · MUNICÍPIO DESDE 1860',{c:'#c8b878',rot:0,s:.75});
   for(const [x,y] of [[51,55],[76,66]])lights.push({x:tc(x),y:tc(y),r:130,c:'lamp',f:1});}
  // Mercado Público (abrigo) e as bancas na calçada
  {rect(18,36,28,14,T.CONC);
   safeRoom(23,38,16,10,[['S'],['E']],'Mercado Público');
   addPick(30,40,11,1,'file'); addPick(26,44,'ervaV',1); for(const x of [27,28,33,34])prop(x,43,1);
   LM.itajai={x:tc(31),y:tc(43)};
   for(let x=19;x<=44;x+=3)if(x<23||x>38)prop(x,37,9);}
  // Museu Histórico: o revólver do coronel está numa vitrine trancada
  {const mu=building(20,55,24,12,{floor:T.WOOD,roof:'#7a5a3a',name:'Museu Histórico',doors:[['S',10,3]],kind:'museu'});
   iwall(mu,21,60,42,60,[[25,2],[38,2]]); iwall(mu,32,56,32,59,[[57,1]]);
   for(const [x,y] of [[22,63],[26,63],[30,63],[34,63],[38,63]])prop(x,y,1);
   for(const [x,y] of [[22,57],[24,57],[35,57],[37,57],[39,57]])prop(x,y,3);
   addInteract(41,57,'vitrine',38); LM.vitrine={x:tc(41),y:tc(57)}; addPick(28,57,29,1,'file'); LM.museu={x:tc(31),y:tc(68)};
   lights.push({x:tc(31),y:tc(62),r:120,c:'lamp',f:1});}
  // Corpo de Bombeiros
  {const cb=building(148,37,24,12,{floor:T.CONC,roof:'#8a2a24',name:'Corpo de Bombeiros',doors:[['S',3,6],['E',4,2]],kind:'bombeiros',loot:true});
   iwall(cb,160,38,160,47,[[42,2]]); {const t=addCar(150,41,true,false,'#b02a20');t.kind='bomb';} {const t=addCar(154,44,true,true,'#b02a20');t.kind='bomb';}
   for(let y=39;y<=46;y+=2)prop(170,y,28); addPick(165,40,'spray',1); addPick(163,46,'comb',40); addPick(168,46,'gran',1);
   initEnemies.push({uid:'bomb1',type:'brut',x:tc(165),y:tc(43)}); LM.bombeiros={x:tc(158),y:tc(50)};}
  // casario colorido
  rowHouses(146,54,173,67,'N',{roofs:ROOFS_COL}); rowHouses(178,36,197,49,'S',{roofs:ROOFS_COL}); rowHouses(178,54,197,67,'N',{roofs:ROOFS_COL});
  sidewalksIn(14,32,197,71);
  {const pc=addCar(60,51,true,false,'#e6e6e2');pc.kind='police';lights.push({x:tc(61),y:tc(51),r:170,c:'siren',f:0});}
  carsIn(14,32,197,71,16);
  graf(63,34,'ELES SAEM QUANDO ESCURECE',{rot:-.02});
}

// ---------- Cabeçudas ----------
function genCabecudas(){
  vroad(174,72,85);
  rect(150,73,24,8,T.GRASS); rect(178,73,5,8,T.GRASS);
  for(const [x,y,w,h,s] of [[151,74,6,5,'E'],[159,74,6,5,'E'],[166,74,6,5,'E']])house(x,y,w,h,s);
  sidewalksIn(150,72,183,81);
  for(const x of [184,185])prop(x,76,7);
  // caixa do Exército largada depois do bloqueio: daqui pra frente o jogo dá mais munição
  for(const x of [180,181])prop(x,73,4); addPick(179,74,'m9',24); addPick(182,74,'cart',8); addPick(179,75,'gran',2); addPick(182,75,'spray',1); LM.caixa={x:tc(180.5),y:tc(74.5)};
  // bloqueio da Vértice
  addGate('vertice',174,77,4,2,'cartao','#d6d6d0','Bloqueio da Vértice','Cancela da Vértice. Um leitor de cartão pisca em vermelho.');
  for(const x of [172,173,178,179])for(const y of [77,78])setT(x,y,T.ROCK);
  lights.push({x:tc(176),y:tc(76),r:170,c:'siren',f:0});
  LM.vertice={x:tc(176),y:tc(80)}; LM.cabecudas={x:tc(183),y:tc(75)};
}

// ---------- Praia Brava ----------
function genBrava(){
  hroad(14,183,82); hroad(14,183,108); hroad(14,183,136);
  for(const x of [14,52,128,156])vroad(x,82,139); vroad(90,108,139); vroad(180,82,139);
  rect(184,82,2,58,T.SIDE);
  // Resort Brava Mar: duas alas de quartos, piscina no pátio, restaurante, cozinha e a casa de máquinas
  {const X0=57;
   const rs=building(57,87,70,20,{floor:T.WOOD,roof:'#6a7a8a',name:'Resort Brava Mar',doors:[['S',31,4]],kind:'resort'});
   rs.noZ=true; rs.big=true;
   iwall(rs,58,102,125,102,[[68,2],[88,8],[114,2]]);
   // ala oeste
   iwall(rs,67,88,67,101,[[90,1],[98,1]]); iwall(rs,70,88,70,101,[[90,1],[98,1]]); iwall(rs,58,94,66,94); iwall(rs,71,94,79,94); iwall(rs,80,88,80,101);
   // ala leste
   iwall(rs,113,88,113,101,[[90,1],[98,1]]); iwall(rs,116,88,116,101,[[98,1]]); iwall(rs,104,94,112,94); iwall(rs,117,94,125,94); iwall(rs,103,88,103,101);
   // restaurante, cozinha e pátio
   iwall(rs,81,92,102,92,[[85,1],[98,1]]); iwall(rs,92,88,92,91,[[89,1]]);
   rect(85,95,14,5,T.WATER); for(let x=84;x<=99;x++){if(getT(x,94)!==T.WALL)setT(x,94,T.CONC);if(getT(x,100)!==T.WALL)setT(x,100,T.CONC);}
   for(const [x,y] of [[82,89],[85,89],[88,89],[82,91],[86,91]])prop(x,y,2); for(let x=94;x<=101;x++)prop(x,88,9); prop(101,90,11);
   for(const [x,y] of [[82,96],[82,98],[101,96],[101,98]])prop(x,y,13);
   for(let x=84;x<=87;x++)prop(x,103,9);
   // quartos 101-108 (106 virou casa de máquinas)
   const rooms={101:[58,88,66,93],102:[71,88,79,93],103:[58,95,66,101],104:[71,95,79,101],105:[104,88,112,93],107:[104,95,112,101],108:[117,95,125,101]};
   const doorAt={101:[68.4,90],102:[69.6,90],103:[68.4,98],104:[69.6,98],105:[114.4,90],106:[115.6,90],107:[114.4,98],108:[115.6,98]};
   for(const n in rooms){const [a,b,c,d]=rooms[n];prop(a,b,14);prop(a+1,b,14);prop(c,d,3);if(R()<.6)prop(c,b,12);}
   for(const n in doorAt)graf(doorAt[n][0],doorAt[n][1]+(n%2?-1.2:-1.2),String(n),{c:'#e8e4d8',s:.42,rot:0});
   addPick(108,97,'cartaoMestre',1); LM.quarto107={x:tc(108),y:tc(97)};
   addPick(62,90,'ervaV',1); addPick(76,99,'pilha',1); addPick(121,99,'polv',2); addPick(110,90,'m9',6);
   // casa de máquinas (porta trancada pelo cartão mestre)
   addGate('maqResort',116,90,1,1,'cartaoMestre','#c9a24a','Casa de máquinas','Porta de serviço. O leitor pede o cartão mestre do resort.',T.WOOD);
   for(const [x,y] of [[120,89],[121,89]])prop(x,y,15); prop(124,92,4); addPick(118,92,'diesel',1); LM.maqResort={x:tc(118),y:tc(92)};
   // recepção e o livro de hóspedes
   addInteract(58,104,'disjuntor',37); addPick(90,104,22,1,'file'); LM.resort={x:tc(90),y:tc(107.5)}; LM.recepcao={x:tc(90),y:tc(104)};
   for(const [x,y] of [[60,97],[74,90],[107,98],[122,97],[100,97],[62,104],[118,104]])initEnemies.push({uid:'res'+x+y,type:'zumbi',x:tc(x),y:tc(y),dorm:R()<.5,feed:x===100});
   for(const [x,y] of [[70,104],[100,104],[112,104],[97,90]])lights.push({x:tc(x),y:tc(y),r:130,c:'lamp',f:1});
   graf(91.5,109.6,'RESORT BRAVA MAR',{c:'#c9a24a',s:.8,rot:0});}
  // Clínica da Brava (Helena) com o gerador no pátio
  {rect(132,86,24,22,T.CONC);
   safeRoom(136,89,16,10,[['S',7,2]],'Clínica da Brava');
   npcs.push({id:'helena',name:'Dra. Helena',x:tc(144),y:tc(93),col:'#d8d6ce',hair:'#7a3820',ang:-Math.PI/2,cond:()=>!(G.flags&&G.flags.helenaGone)});
   npcs.push({id:'eduC',name:'Edu',look:'edu',x:tc(148),y:tc(95),col:'#18191c',hair:'#2a1c12',skin:'#e2b79a',ang:Math.PI,cond:()=>!!(G.flags&&G.flags.eduClinic&&!G.flags.helenaGone)});
   addPick(138,91,10,1,'file'); addPick(150,96,'spray',1);
   LM.clinica={x:tc(143.5),y:tc(100)};
   addInteract(138,103,'gerador',15); LM.gerador={x:tc(138),y:tc(103)};
   {const am=addCar(146,104,true,false,'#d8d6cc');am.kind='amb';lights.push({x:tc(147),y:tc(104),r:170,c:'siren',f:0});}}
  // surf shop (besta) e a guarita dos salva-vidas
  {const sf=building(161,88,12,8,{floor:T.WOOD,roof:'#3a7a8a',name:'Surf Shop Brava',doors:[['S',5,2]],kind:'loja',loot:true});
   addPick(163,90,'bag',1,'bag'); addPick(169,90,'virote',8); addPick(166,93,12,1,'file'); addPick(170,93,7,1,'weapon');
   LM.besta={x:tc(170),y:tc(93)}; LM.surf={x:tc(166.5),y:tc(97)};
   for(const x of [162,163,164])prop(x,89,8);
   bigHouse(161,98,8,8,'N'); bigHouse(170,99,9,8,'N');}
  // condomínio nos morros: casarões
  for(const [x,y,w,h,s] of [[19,87,15,10,'S'],[36,87,15,10,'S'],[36,99,14,8,'N'],[19,113,15,10,'S'],[19,125,15,10,'N'],[36,125,14,10,'N']])
    bigHouse(x,y,w,h,s,{roof:pick(ROOFS_COL)});
  {const gu=building(19,99,15,8,{floor:T.TILEF,roof:'#3a4450',name:'Guarita do condomínio',doors:[['N',6,2]],kind:'guarita'});
   for(let x=21;x<=28;x++)prop(x,104,9); addInteract(25,103,'cctv',35); LM.cctv={x:tc(25),y:tc(98)}; addPick(31,101,'pilha',1); addPick(21,101,'m9',8);
   lights.push({x:tc(25),y:tc(103),r:90,c:'flood',f:1}); initEnemies.push({uid:'segBr',type:'zumbi',x:tc(30),y:tc(104),feed:true});
   const c4=building(36,113,15,10,{floor:T.WOOD,roof:'#8a6a4a',name:'Casa 4',doors:[['N',6,2]],kind:'casa'});
   addGate('casa4',42,113,2,1,'chaveCasa','#7aa0c8','Casa 4','Porta blindada. "CASA 4". Precisa da chave do condomínio.',T.WOOD); protect(c4,42,113); protect(c4,43,113);
   iwall(c4,37,118,49,118,[[40,2],[46,2]]); for(const x of [38,48])prop(x,114,12); prop(37,121,14); prop(49,121,1);
   addPick(47,120,'g40',6); addPick(48,121,'cart',10); addPick(38,120,'gran',2); addPick(44,121,'spray',1); addPick(41,121,'silenciador',1); addPick(40,114,28,1,'file');
   if(!buildings.some(b=>b.kind==='casa4L')){c4.kind='casa4L';} LM.casa4={x:tc(43),y:tc(111)};}
  // supermercado da Brava e torres de frente pro mar
  {const sm=building(58,113,30,14,{floor:T.TILEF,roof:'#4a5a3a',name:'Mercado da Brava',doors:[['S',13,3]],kind:'mercado'});
   for(const y of [116,119,122])for(let x=60;x<=85;x++){if(x===72||x===73)continue;prop(x,y,1);} for(const x of [62,66,78,82])prop(x,124,9);
   addPick(84,115,'pilha',2); addPick(61,121,'ervaR',1); addPick(70,117,'polv',2); addInteract(59,114,'disjuntor',37); lights.push({x:tc(73),y:tc(120),r:160,c:'lamp',f:1});
   initEnemies.push({uid:'mbr1',type:'zumbi',x:tc(74),y:tc(121)}); initEnemies.push({uid:'mbr2',type:'corr',x:tc(64),y:tc(125)});
   rowHouses(56,128,89,135,'N');}
  homeBlock(94,112,127,135,{style:'casas'}); homeBlock(132,112,155,135,{style:'torre',side:'N'});
  aptBuilding(161,113,18,22,{side:'W',tall:true,name:'Edifício Pôr do Sol'});
  for(const y of [92,104,118,130])quiosque(188,y);
  for(let y=84;y<=138;y+=7)if(getT(186,y)===T.SAND)setT(186,y,T.TREE);
  sidewalksIn(14,82,185,139);
  trees(14,82,183,139,.06);
  carsIn(14,82,183,139,14);
  graf(104,110,'CUIDADO COM O HOMEM DE CHAPÉU',{rot:.01});
}

// ---------- Estrada da Rainha + Morro do Careca ----------
const RAINHA=[[125.9,159],[125.9,151],[121,147],[123.5,143],[129.9,139.5]];
function genEstrada(){
  curvyRoad(RAINHA,2.05,3.4);
  // morro careca: topo pelado com mirante
  for(let y=141;y<=157;y++)for(let x=150;x<=186;x++){const e=((x-170)/16)**2+((y-149)/8)**2;if(e<=1)setT(x,y,(Math.sin(x*.55+y*.2)+Math.cos(y*.47-x*.13)+R()*.5)>.55?T.DIRT:T.GRASS);}
  curvyRoad([[127,145],[138,146],[150,148],[166,148]],.9,1.6,T.DIRT);
  rect(176,146,4,5,T.CONC); for(let y=145;y<=151;y++)setT(180,y,T.FENCE); for(let x=176;x<=180;x++){setT(x,145,T.FENCE);setT(x,151,T.FENCE);}
  addPick(178,148,15,1,'file'); addPick(177,149,'pilha',2);
  LM.mirante={x:tc(177),y:tc(148)};
  lights.push({x:tc(178),y:tc(148),r:110,c:'lamp',f:1});
  for(const [x,y,b] of [[119,148,true],[127,142,false]]){if(!SOLID[getT(x,y)]&&!SOLID[getT(x+1,y)]&&getT(x,y)!==T.ROAD)addCar(x,y,true,b);}
  // barricada do Exército: faixa fechada na saída de Balneário
  for(let y=151;y<=158;y++)for(let x=1;x<coastX(y);x++){if(x>=124&&x<=127)continue;setT(x,y,x>128?T.ROCK:T.FOREST);}
  rect(124,151,4,8,T.ROAD);
  addGate('bloqueio',124,157,4,2,null,'#8a6a3a','Barricada do Exército','Carros empilhados e arame farpado. A pé não passa. Só um veículo pesado, em alta velocidade.');
  LM.bloqueio={x:tc(126),y:tc(160)};
  lights.push({x:tc(122),y:tc(159),r:180,c:'fire',f:1});
}

// ---------- interiores: cômodos, prédios de apartamentos e casas grandes ----------
// divide um retângulo de piso em cômodos, sempre deixando passagem entre eles
function bsp(b,x0,y0,x1,y1,depth,minS=3){
  const ops=[];
  for(let x=x0-1;x<=x1+1;x++)for(const y of [y0-1,y1+1])if(inb(x,y)&&!SOLID[map[idx(x,y)]])ops.push([x,y]);
  for(let y=y0;y<=y1;y++)for(const x of [x0-1,x1+1])if(inb(x,y)&&!SOLID[map[idx(x,y)]])ops.push([x,y]);
  const rec=(x0,y0,x1,y1,d)=>{
    const w=x1-x0+1,h=y1-y0+1; if(d<=0)return;
    const canV=w>=minS*2+1, canH=h>=minS*2+1; if(!canV&&!canH)return;
    if(d<depth&&w*h<34&&R()<.45)return;
    const vert=canV&&(!canH||(w>h?R()<.8:R()<.25));
    for(let t=0;t<12;t++){
      if(vert){
        const sx=ri(x0+minS,x1-minS);
        if(ops.some(([ox,oy])=>Math.abs(ox-sx)<=1&&(oy===y0-1||oy===y1+1)))continue;
        const gw=h>=7&&R()<.35?2:1, gy=ri(y0,y1-gw+1);
        for(let y=y0;y<=y1;y++){if(y>=gy&&y<gy+gw){protect(b,sx,y);ops.push([sx,y]);}else setT(sx,y,T.WALL);}
        rec(x0,y0,sx-1,y1,d-1); rec(sx+1,y0,x1,y1,d-1); return;
      } else {
        const sy=ri(y0+minS,y1-minS);
        if(ops.some(([ox,oy])=>Math.abs(oy-sy)<=1&&(ox===x0-1||ox===x1+1)))continue;
        const gw=w>=7&&R()<.35?2:1, gx=ri(x0,x1-gw+1);
        for(let x=x0;x<=x1;x++){if(x>=gx&&x<gx+gw){protect(b,x,sy);ops.push([x,sy]);}else setT(x,sy,T.WALL);}
        rec(x0,y0,x1,sy-1,d-1); rec(x0,sy+1,x1,y1,d-1); return;
      }
    }
  };
  rec(x0,y0,x1,y1,depth);
}
function protRect(b,x0,y0,x1,y1){for(let y=y0;y<=y1;y++)for(let x=x0;x<=x1;x++)b.prot.add(idx(x,y));}
// prédio com corredor central e apartamentos dos dois lados
function aptBuilding(x,y,w,h,o={}){
  const side=o.side||'S', vert=side==='S'||side==='N', L=vert?w:h, mid=Math.floor(L/2)-1;
  const opp={S:'N',N:'S',E:'W',W:'E'}[side];
  const b=building(x,y,w,h,{floor:o.floor??(R()<.6?T.TILEF:T.WOOD),roof:o.roof||pick(ROOFS_TOWER),doors:o.doors||[[side,mid,2],[opp,mid,2]],kind:o.kind||'predio',name:o.name||'',loot:true});
  if(o.tall)b.tall=1;
  const apts=[];
  const splitRows=(a0,a1)=>{const total=a1-a0+1,n=Math.max(1,Math.floor((total+1)/7)),seg=Math.floor((total-(n-1))/n),out=[];let c=a0;for(let i=0;i<n;i++){const e=i===n-1?a1:c+seg-1;out.push([c,e]);c=e+2;}return out;};
  if(vert){
    const c0=x+mid, wl=c0-1, wr=c0+2, rows=splitRows(y+1,y+h-2);
    iwall(b,wl,y+1,wl,y+h-2,rows.map(([a,c])=>[(a+c)>>1,1]));
    iwall(b,wr,y+1,wr,y+h-2,rows.map(([a,c])=>[((a+c)>>1)+(c-a>3?1:0),1]));
    for(let i=0;i<rows.length-1;i++){const sy=rows[i][1]+1;iwall(b,x+1,sy,wl-1,sy);iwall(b,wr+1,sy,x+w-2,sy);}
    protRect(b,c0,y+1,c0+1,y+h-2);
    for(const [a,c] of rows){if(wl-1>=x+1)apts.push({x0:x+1,y0:a,x1:wl-1,y1:c});if(x+w-2>=wr+1)apts.push({x0:wr+1,y0:a,x1:x+w-2,y1:c});}
  } else {
    const r0=y+mid, wt=r0-1, wb=r0+2, cols=splitRows(x+1,x+w-2);
    iwall(b,x+1,wt,x+w-2,wt,cols.map(([a,c])=>[(a+c)>>1,1]));
    iwall(b,x+1,wb,x+w-2,wb,cols.map(([a,c])=>[((a+c)>>1)+(c-a>3?1:0),1]));
    for(let i=0;i<cols.length-1;i++){const sx=cols[i][1]+1;iwall(b,sx,y+1,sx,wt-1);iwall(b,sx,wb+1,sx,y+h-2);}
    protRect(b,x+1,r0,x+w-2,r0+1);
    for(const [a,c] of cols){if(wt-1>=y+1)apts.push({x0:a,y0:y+1,x1:c,y1:wt-1});if(y+h-2>=wb+1)apts.push({x0:a,y0:wb+1,x1:c,y1:y+h-2});}
  }
  for(const ap of apts)if(ap.x1-ap.x0>=6||ap.y1-ap.y0>=6)bsp(b,ap.x0,ap.y0,ap.x1,ap.y1,2,3);
  furnish(b,.14,o.props||[1,2,3,12,14]);
  autoLocker(b); if(R()<.6)autoLocker(b);
  b.apts=apts; return b;
}
// casa com cômodos de verdade
function bigHouse(x,y,w,h,side,o={}){
  const b=building(x,y,w,h,{floor:o.floor??(R()<.6?T.WOOD:T.TILEF),roof:o.roof||pick(ROOFS),doors:[[side]],loot:true,kind:o.kind||'casa',name:o.name||''});
  const a=(w-2)*(h-2); bsp(b,x+1,y+1,x+w-2,y+h-2,a<=70?2:a<=200?3:4,3);
  furnish(b,.17,o.props||[1,2,3,12,14]); if(R()<.65)autoLocker(b);
  return b;
}
// quadra residencial: casas com quintal, sobrados geminados ou uma torre
function homeBlock(x0,y0,x1,y1,o={}){
  const w=x1-x0+1,h=y1-y0+1, st=o.style||'casas';
  if(st==='parque'||(st==='casas'&&R()<.05)){trees(x0+1,y0+1,x1-1,y1-1,.3);return;}
  if(st==='torre')return aptBuilding(x0+1,y0+1,w-2,h-2,{side:o.side||'S',tall:true});
  if(st==='duplas'){
    const hh=Math.floor((h-3)/2);
    bigHouse(x0+1,y0+1,w-2,hh,'N',{roof:pick(ROOFS_TOWER)}); bigHouse(x0+1,y0+2+hh,w-2,h-3-hh,'S',{roof:pick(ROOFS_TOWER)});
    return;
  }
  const hw=Math.floor((w-3)/2), hh=Math.floor((h-3)/2);
  const lots=[[x0+1,y0+1,hw,hh,'N'],[x0+2+hw,y0+1,w-3-hw,hh,'N'],[x0+1,y0+2+hh,hw,h-3-hh,'S'],[x0+2+hw,y0+2+hh,w-3-hw,h-3-hh,'S']];
  for(const [lx,ly,lw,lh,sd] of lots){
    if(R()<.09){trees(lx,ly,lx+lw-1,ly+lh-1,.35);continue;}
    const bw=Math.max(7,lw-ri(0,2)), bh=Math.max(7,lh-ri(0,3));
    const bx=lx+(R()<.5?0:lw-bw), by=sd==='N'?ly:ly+lh-bh;
    bigHouse(bx,by,bw,bh,R()<.2?(bx===lx?'W':'E'):sd);
  }
}
// pichações no chão e nas paredes (algumas só aparecem depois de certos eventos)
let GRAF=[], GORE=[];
function addDecalStatic(k,x,y,r){GORE.push({k,x:tc(x),y:tc(y),r:r||14,rot:R()*6.283,seed:R()});}
function graf(x,y,t,o={}){GRAF.push({x:tc(x),y:tc(y),t,rot:o.rot??(R()-.5)*.3,c:o.c||'#a8241c',s:o.s||1,cond:o.cond||null});}

// ---------- Praia das Laranjeiras (só se chega de bondinho: a Interpraias desmoronou) ----------
function genLaranjeiras(){
  // estação Mata Atlântica, no alto do morro
  for(let y=402;y<=422;y++)for(let x=88;x<=116;x++){const e=((x-102)/14)**2+((y-412)/10)**2;if(e<=1)setT(x,y,R()<.25?T.DIRT:T.GRASS);}
  {const ma=building(96,406,12,8,{floor:T.CONC,roof:'#2f4a3a',name:'Estação Mata Atlântica',doors:[['S',5,2]],kind:'bondinho',dark:true});
   for(let x=98;x<=104;x+=3)prop(x,407,9); addLocker(ma,106,408); addPick(105,411,'silenciador',1); addPick(97,412,30,1,'file');
   addInteract(98,408,'bondMA',10); LM.bondMA={x:tc(101.5),y:tc(415)};
   initEnemies.push({uid:'oper',type:'zumbi',x:tc(101),y:tc(410)}); addDecalStatic('drag',100,411,0);}
  // trilha morro abaixo, no escuro da mata
  curvyRoad([[102,416],[108,421],[114,423],[120,428],[126,426],[132,421],[138,418]],1,1.4,T.DIRT);
  for(const [x,y] of [[110,422],[121,427],[128,424]])initEnemies.push({uid:'tr'+x,type:x===121?'rast':'cao',x:tc(x),y:tc(y)});
  for(const [x,y] of [[112,424],[124,428]])addDecalStatic('corpse',x,y,11);
  // vila: clareira entre o morro e a praia
  for(let y=404;y<=442;y++)for(let x=126;x<=169;x++){if(getT(x,y)===T.WATER)continue;if(x>=coastX(y)-9){setT(x,y,T.SAND);continue;}setT(x,y,R()<.18?T.DIRT:T.GRASS);}
  curvyRoad([[138,406],[138,441]],1,1.1,T.DIRT); curvyRoad([[126,412],[160,412]],1,1,T.DIRT);
  // a Interpraias desmoronada, com um ônibus esmagado
  curvyRoad([[126,412],[121,406],[118,400]],1,1.4,T.DIRT); for(let y=396;y<=402;y++)for(let x=113;x<=123;x++)if(R()<.75)setT(x,y,R()<.5?T.ROCK:T.RUBBLE); addBus(119,404).col='#8a8a86';
  graf(122,409,'INTERPRAIAS INTERDITADA',{rot:-.4,c:'#e8c84a',s:.7});
  // colônia de pescadores (Seu Ivo e a Rosa no quarto dos fundos)
  {const co=building(128,406,14,9,{floor:T.WOOD,roof:'#4a5a6a',name:'Colônia de Pescadores Z-7',doors:[['S',5,2]],kind:'colonia'});
   iwall(co,136,407,136,413); addGate('rosa',136,410,1,1,null,'#6a4a3a','Quarto dos fundos','Trancado. Alguém respira devagar do outro lado.',T.WOOD); protect(co,136,410);
   for(const x of [129,131])prop(x,407,7); prop(134,413,13); addPick(130,412,'cart',4); addPick(140,412,31,1,'file');
   npcs.push({id:'ivo',name:'Seu Ivo',x:tc(133),y:tc(410),col:'#5a6a3a',hair:'#d8d4c8',skin:'#b0805e',ang:Math.PI/2,cond:()=>!(G.flags&&G.flags.ivoMorto)});
   initEnemies.push({uid:'rosa',type:'zumbi',x:tc(139),y:tc(410),col:'#a85a7a'}); LM.colonia={x:tc(133.5),y:tc(417)};
   lights.push({x:tc(132),y:tc(410),r:110,c:'candle',f:1});}
  // restaurante: o gerador da estação fica na cozinha
  {const rs=building(144,418,14,11,{floor:T.TILEF,roof:'#7a4a2a',name:'Rancho das Laranjeiras',doors:[['W',4,2],['N',3,2]],kind:'restaurante'});
   rs.dark=true; iwall(rs,151,419,151,427,[[423,1]]);
   for(const x of [152,154,156])prop(x,419,15); addInteract(156,426,'geradorL',15); LM.geradorL={x:tc(155),y:tc(426)};
   for(let y=420;y<=427;y+=3)for(let x=145;x<=149;x+=2)prop(x,y,13); addPick(150,427,'garrafa',3); addPick(157,421,'spray',1);
   for(const [x,y] of [[146,422],[148,425],[150,421]])initEnemies.push({uid:'rs'+x+y,type:'zumbi',x:tc(x),y:tc(y),feed:x===148,dorm:x===150});
   initEnemies.push({uid:'rsk',type:'incha',x:tc(154),y:tc(424)});}
  // estação Laranjeiras do bondinho
  {building(129,428,12,8,{floor:T.CONC,roof:'#7a3a2a',name:'Estação Laranjeiras',doors:[['N',5,2],['E',3,2]],kind:'bondinho'});
   addInteract(134,433,'bondinho2',10); LM.bondL={x:tc(134.5),y:tc(426.5)}; for(const x of [131,137])prop(x,432,9);
   graf(135,437.4,'O ÚLTIMO BARCO NÃO VOLTOU',{rot:.02});}
  // praia: quiosques, barcos, píer
  building(161,413,5,4,{floor:T.WOOD,roof:'#c8a050',name:'Quiosque',doors:[['W']],kind:'quiosque'}); building(161,428,5,4,{floor:T.WOOD,roof:'#c8a050',name:'Quiosque',doors:[['W']],kind:'quiosque'});
  for(const [x,y] of [[163,420],[165,424],[162,434]])prop(x,y,7); rect(170,423,9,2,T.PIER); addPick(177,423,'m9',8);
  for(const [x,y] of [[164,418],[166,431],[163,437]])initEnemies.push({uid:'pl'+y,type:'afog',x:tc(x),y:tc(y),dorm:true});
  // Ponta das Laranjeiras: capela dos navegantes
  for(let y=437;y<=450;y++)for(let x=166;x<coastX(y);x++){if(getT(x,y)===T.WATER)continue;setT(x,y,x>coastX(y)-3?T.ROCK:(R()<.3?T.DIRT:T.GRASS));}
  curvyRoad([[160,436],[170,440],[178,444],[184,452]],1,1,T.DIRT);
  {const cp=building(174,441,9,6,{floor:T.WOOD,roof:'#d8d4c8',name:'Capela dos Navegantes',doors:[['W',2,2]],kind:'capela'});
   for(let y=442;y<=445;y+=2)prop(178,y,13); addPick(181,442,32,1,'file'); addPick(181,445,'ervaR',1); lights.push({x:tc(180),y:tc(443),r:110,c:'candle',f:1});}
  // Taquarinhas: o acampamento que ninguém deixou
  for(let y=450;y<=H-2;y++){const c=coastX(y);for(let x=c-7;x<c;x++)if(getT(x,y)!==T.WATER)setT(x,y,T.SAND);for(let x=150;x<c-7;x++)if(getT(x,y)===T.FOREST&&x>c-24)setT(x,y,R()<.4?T.DIRT:T.GRASS);}
  for(const [x,y] of [[176,456],[179,460],[174,463]]){prop(x,y,14);addDecalStatic('blood',x+1,y,14);}
  for(const [x,y] of [[177,458],[175,461],[180,464]])initEnemies.push({uid:'tq'+y,type:'zumbi',x:tc(x),y:tc(y),dorm:true});
  addPick(178,462,'gran',1); addPick(173,458,'pilha',2); LM.taquarinhas={x:tc(177),y:tc(460)};
  LM.laranj={x:tc(140),y:tc(420)};
  graf(140,404.5,'NÃO ESPEREM O BARCO',{rot:.03});
}

// ---------- Balneário Camboriú ----------
// Quadras de 24x24 entre avenidas. Do oeste para o mar: Rua do Morro, Av. do Estado, Quinta, Quarta, Terceira, Brasil, Atlântica.
const BC_AV=[[12,4,'Rua do Morro'],[38,6,'Av. do Estado'],[68,4,'Quinta Avenida'],[96,4,'Quarta Avenida'],[124,4,'Terceira Avenida'],[152,4,'Av. Brasil'],[180,4,'Av. Atlântica']];
const BC_ST=[160,188,216,244,272,300,328,356,384];
const BC_BX=[[16,37],[44,67],[72,95],[100,123],[128,151],[156,179]];
const BC_BY=[[164,187],[192,215],[220,243],[248,271],[276,299],[304,327],[332,355],[360,383]];
function genBC(){
  vroad(12,160,331); vroad(38,160,387,6); vroad(68,160,387); vroad(96,160,387);
  vroad(124,160,275); vroad(124,328,387);   // a Terceira passa por baixo do shopping
  vroad(152,160,387); vroad(180,160,387);
  for(const y of BC_ST){const xw=y<=328?12:38; if(y===300){hroad(xw,99,y);hroad(152,183,y);} else hroad(xw,183,y);}
  rect(184,159,2,230,T.SIDE);               // calçadão
  const used=new Set(), U=(bx,by)=>used.add(bx+','+by);

  // ======== BARRA NORTE ========
  // roda-gigante
  U(5,0);{rect(157,165,22,22,T.CONC);
    for(let j=0;j<2;j++)for(let i=0;i<2;i++)prop(167+i,175+j,15);
    LM.roda={x:tc(167.5),y:tc(175.5)};
    for(const [x,y] of [[158,166],[177,166],[158,185],[177,185]])lights.push({x:tc(x),y:tc(y),r:130,c:'neon',f:0});
    building(158,180,6,5,{floor:T.WOOD,roof:'#7a3a2a',name:'Bilheteria',doors:[['E']],loot:true,kind:'quiosque'});
    addPick(159,182,'pilha',1); prop(173,168,9); prop(161,170,9);}
  // acampamento abandonado do Exército, logo depois da barricada
  U(3,0);{rect(101,165,22,22,T.DIRT);
    for(let y=165;y<=186;y++)for(let x=101;x<=122;x++)if(R()<.22)setT(x,y,T.GRASS);
    for(let x=101;x<=122;x++)if(x<108||x>113)prop(x,166,17);
    for(let y=168;y<=185;y++){if(y%4)prop(101,y,17);}
    building(103,169,8,6,{floor:T.DIRT,roof:'#4a5232',name:'Barraca do Exército',doors:[['S']],kind:'tenda'});
    building(113,169,8,6,{floor:T.DIRT,roof:'#4a5232',name:'Barraca de comando',doors:[['S']],kind:'tenda'});
    for(const x of [104,106,108])prop(x,170,14);
    prop(114,170,2); prop(115,170,2); prop(119,170,4);
    addPick(118,172,19,1,'file'); addPick(116,172,'pilha',1); addPick(105,173,'ervaV',1); addPick(111,182,'m9',5);
    {const c=addCar(103,178,true,true,'#3d4a2f');c.kind='army';} {const c=addCar(115,182,true,false,'#3d4a2f');c.kind='army';}
    for(const [x,y] of [[108,177],[118,177],[106,184],[120,184]])initEnemies.push({uid:'sold'+x+y,type:'soldado',x:tc(x),y:tc(y)});
    prop(111,177,5); lights.push({x:tc(111),y:tc(177),r:190,c:'fire',f:1});
    LM.acamp={x:tc(111),y:tc(180)};
    graf(110,163.6,'EXÉRCITO ATIRA EM CIVIL',{rot:-.04});}
  // Ginásio Municipal: abrigo da Defesa Civil que caiu
  U(2,1);{const gy=building(73,193,22,22,{floor:T.WOOD,roof:'#4a5a6a',name:'Ginásio Municipal',doors:[['S',9,3],['N',9,2]],kind:'abrigo'});
    for(let y=195;y<=212;y++){prop(74,y,13);prop(75,y,13);}
    for(let y=196;y<=209;y+=3)for(let x=78;x<=92;x+=2)if(R()<.75)prop(x,y,14);
    prop(90,212,2); prop(91,212,2);
    addPick(92,211,18,1,'file'); addPick(88,212,'ervaV',1); addPick(77,212,'pilha',1); addPick(93,195,'polv',2);
    for(let i=0;i<10;i++){const x=ri(78,92),y=ri(196,210);if(SOLID[map[idx(x,y)]])continue;initEnemies.push({uid:'gin'+i,type:'zumbi',x:tc(x),y:tc(y),dorm:true});}
    initEnemies.push({uid:'gin_c',type:'corr',x:tc(85),y:tc(211)});
    lights.push({x:tc(84),y:tc(203),r:160,c:'lamp',f:1});
    LM.ginasio={x:tc(84),y:tc(212)}; gy.noZ=true;
    graf(84,216.6,'NÃO DURMA AQUI',{rot:.03});}
  // Supermercado Bom Preço (fusível)
  U(1,1);{const mk=building(45,193,22,22,{floor:T.TILEF,roof:'#4a422f',name:'Supermercado Bom Preço',doors:[['S',9,3],['E',4,2]],kind:'mercado'});
    iwall(mk,46,201,65,201,[[61,2]]); iwall(mk,53,194,53,200,[[197,1]]);
    for(let x=56;x<=64;x+=3){prop(x,194,4);prop(x,195,4);}
    for(let y=195;y<=199;y+=2)prop(46,y,11);
    addPick(47,194,'fusivel',1); LM.mercado={x:tc(47),y:tc(194)}; addPick(58,199,4,1,'file');
    for(const y of [204,207,210])for(let x=48;x<=63;x++){if(x===55||x===56)continue;prop(x,y,1);}
    for(const x of [48,50,60,62])prop(x,212,9);
    addPick(52,205,'ervaV',1); addPick(60,208,'ervaR',1); addPick(64,211,'pilha',1);
    addLocker(mk,65,203); lights.push({x:tc(56),y:tc(206),r:150,c:'lamp',f:1}); addInteract(66,213,'disjuntor',37);
    initEnemies.push({uid:'mkfeed',type:'zumbi',x:tc(57),y:tc(208.6),feed:true});}
  // Paróquia Santa Inês (faca atrás do altar)
  U(4,1);{const ch=building(129,193,22,22,{floor:T.WOOD,roof:'#3d3542',name:'Paróquia Santa Inês',doors:[['S',9,3]],kind:'igreja'});
    iwall(ch,130,196,149,196,[[131,1],[148,1]]);
    for(let x=136;x<=143;x++)prop(x,198,27);
    for(let y=201;y<=211;y+=2){for(let x=131;x<=136;x++)prop(x,y,13);for(let x=142;x<=148;x++)prop(x,y,13);}
    addPick(146,194,0,16,'weapon'); addPick(132,194,1,1,'file'); addPick(148,212,'spray',1);
    LM.church={x:tc(146),y:tc(195)}; lights.push({x:tc(139.5),y:tc(198),r:150,c:'candle',f:1});
    initEnemies.push({uid:'ig1',type:'zumbi',x:tc(139),y:tc(204),dorm:true}); initEnemies.push({uid:'ig2',type:'zumbi',x:tc(130),y:tc(206)});}
  // guarda-vidas na areia
  safeRoom(187,199,7,5,[['W']],'Posto Guarda-Vidas 3'); addPick(189,201,9,1,'file'); LM.guarda={x:tc(189),y:tc(201)};

  // ======== CENTRO ========
  // Delegacia (arsenal com trava elétrica)
  U(1,2);{const dp=building(45,221,22,22,{floor:T.TILEF,roof:'#2e3440',name:'Delegacia',doors:[['S',9,3],['W',12,2]],kind:'delegacia'});
    iwall(dp,46,235,65,235,[[49,2],[61,2]]);
    for(let x=51;x<=59;x++)if(x!==55)prop(x,238,9);
    for(let y=222;y<=227;y++){setT(49,y,T.FENCE);setT(53,y,T.FENCE);}
    for(let x=46;x<=56;x++)if(x!==51)setT(x,228,T.FENCE);
    iwall(dp,57,222,57,228); iwall(dp,58,228,65,228,[[61,2]]);
    addGate('arsenal',61,228,2,1,null,'#b03a2e','Porta do arsenal','Trava elétrica. Está sem energia.',T.TILEF);
    protect(dp,61,228); protect(dp,62,228);
    addInteract(65,233,'fuse',22); LM.fusebox={x:tc(65),y:tc(233)};
    for(const [x,y] of [[48,231],[52,231],[56,232],[60,232]])prop(x,y,2);
    addPick(62,223,1,12,'weapon'); addPick(64,223,'walkie',1,'walkie'); addPick(59,223,'m9',10); addPick(60,226,0,14,'weapon');
    addPick(47,233,5,1,'file');
    LM.arsenal={x:tc(62),y:tc(224)}; LM.delegacia={x:tc(55),y:tc(243)};
    NOFIX.push([46,222,48,227],[54,222,56,227]);
    addInteract(46,241,'disjuntor',37);
    initEnemies.push({uid:'cela1',type:'zumbi',x:tc(47),y:tc(224)}); initEnemies.push({uid:'cela3',type:'zumbi',x:tc(55),y:tc(225)});
    lights.push({x:tc(56),y:tc(231),r:130,c:'lamp',f:1});
    addLocker(dp,46,229); addLocker(dp,65,237);
    const pc=addCar(57,245,true,false,'#e6e6e2');pc.kind='police';lights.push({x:tc(58),y:tc(245),r:170,c:'siren',f:0});
    graf(50,243.6,'ELES OUVEM',{rot:-.02});}
  // Edifício Moacir (a primeira faca), do outro lado da rua da Dona Cida
  U(3,2);{const mo=aptBuilding(101,221,22,22,{side:'S',name:'Edifício Moacir',roof:'#4a3f36',floor:T.WOOD,props:[1,3,12,14]});
    const ap=mo.apts.find(a=>a.x0>111&&a.y1>238)||mo.apts[mo.apts.length-1];
    const kf=addPick(ap.x1,ap.y0,0,18,'weapon'); LM.faca1={x:kf.x,y:kf.y};
    addPick(ap.x0,ap.y1,2,1,'file'); prop(ap.x1,ap.y1,3);}
  // Banco Popular (cofre)
  U(4,2);{const bk=building(129,221,22,22,{floor:T.TILEF,roof:'#3a3a35',name:'Banco Popular',doors:[['S',9,3]],kind:'banco'});
    iwall(bk,130,228,149,228,[[134,1],[145,1]]); iwall(bk,140,222,140,227);
    addInteract(149,223,'cofre',23); LM.cofre={x:tc(149),y:tc(223)};
    for(let x=131;x<=148;x++)if(x<138||x>141)prop(x,233,9);
    for(const x of [133,134,135,144,145,146])prop(x,238,13);
    addPick(131,223,6,1,'file'); addPick(133,225,'m9',10);
    lights.push({x:tc(139),y:tc(236),r:120,c:'lamp',f:1});}
  // Praça Almirante Tamandaré (coreto, Mingau)
  U(5,2);{rect(156,220,24,24,T.GRASS);
    for(let x=156;x<=179;x++){setT(x,231,T.DIRT);setT(x,232,T.DIRT);} for(let y=220;y<=243;y++){setT(167,y,T.DIRT);setT(168,y,T.DIRT);}
    building(164,228,8,8,{floor:T.WOOD,roof:'#5b4636',name:'Coreto',doors:[['N',3,2],['S',3,2],['E',3,2],['W',3,2]],kind:'coreto'});
    addPick(167,231,'gato',1); LM.coreto={x:tc(167.5),y:tc(231.5)}; addPick(158,241,3,1,'file');
    trees(156,220,179,243,.2);
    for(const [x,y] of [[157,221],[178,242],[157,242],[178,221]])lights.push({x:tc(x),y:tc(y),r:130,c:'lamp',f:1});}
  // Posto da Av. do Estado (bateria, O Frentista)
  U(0,3);{rect(16,248,22,24,T.CONC);
    const st=building(17,249,10,8,{floor:T.TILEF,roof:'#7a2b25',name:'Conveniência do Posto',doors:[['E',3,2]],kind:'loja'});
    iwall(st,21,250,21,255,[[252,1]]); prop(23,251,9); prop(24,255,1);
    addGate('deposito',21,252,1,1,null,'#9a8a5a','Depósito da conveniência','Cadeado de três números.',T.TILEF); protect(st,21,252);
    addPick(18,250,'bateria',1); addPick(24,250,8,1,'file'); LM.posto={x:tc(18),y:tc(250)};
    [[29,254],[33,254],[29,260],[33,260]].forEach(([x,y],i)=>{prop(x,y,16);graf(x,y-1.1,'BOMBA '+(i+1),{c:'#d8cfa8',rot:0,s:.8});});
    initEnemies.push({uid:'b_gordo',type:'gordo',x:tc(29.5),y:tc(262.6)}); LM.bombas={x:tc(31),y:tc(257)};
    addCar(28,267,true,true); addCar(20,260,true,false);
    building(17,264,8,7,{floor:T.CONC,roof:'#3a4a5a',name:'Lava-jato',doors:[['E',2,3]],loot:true,kind:'loja'});
    lights.push({x:tc(31),y:tc(257),r:170,c:'lamp',f:1}); lights.push({x:tc(27),y:tc(252),r:110,c:'neon',f:0});}
  // Apartamento da Dona Cida (início) e casas da quadra
  U(3,3);{safeRoom(102,249,12,9,[['N',3,2]],'Apartamento da Dona Cida');
    START={x:tc(108),y:tc(253)};
    npcs.push({id:'cida',name:'Dona Cida',x:tc(111),y:tc(253),col:'#6a4a6a',hair:'#d0cbc2',ang:Math.PI,cond:()=>!(G.flags&&G.flags.cidaTurned)});
    addPick(103,255,0,1,'file'); prop(112,256,14);
    LM.cidaDoor={x:tc(105.5),y:tc(249)};
    bigHouse(116,249,7,9,'N'); bigHouse(101,260,11,11,'S'); bigHouse(113,260,10,11,'S');
    graf(108,247.6,'LUZ VERDE = SEGURO',{c:'#4a9a5a',rot:.02});}
  // Hotel Atlântida
  U(4,3);{aptBuilding(129,249,22,22,{side:'S',tall:true,name:'Hotel Atlântida',kind:'hotel',roof:'#34373c'});LM.hotel={x:tc(140),y:tc(271)};}
  // Colégio Estadual: salas, laboratório, quadra coberta; a chave da diretoria está com o zelador
  U(2,2);{const cg=building(73,221,22,22,{floor:T.TILEF,roof:'#6a5a44',name:'Colégio Estadual',doors:[['W',9,2],['S',3,2]],kind:'escola'});
    cg.noZ=true; cg.big=true;
    iwall(cg,74,228,94,228,[[76,1],[81,1],[86,1],[91,1]]); for(const x of [78,83,88])iwall(cg,x,222,x,227);
    iwall(cg,74,233,86,233,[[76,1],[82,1]]); iwall(cg,79,234,79,242);
    iwall(cg,87,229,87,242,[[230,2],[239,2]]);
    addGate('diretoria',91,228,1,1,'chaveDir','#8a6a3a','Diretoria','Trancada. "DIREÇÃO". A chave ficou com o zelador.',T.TILEF); protect(cg,91,228);
    for(const [x0] of [[74],[79],[84]])for(let y=223;y<=226;y+=2)for(let x=x0;x<=x0+3;x+=2)prop(x,y,13);
    addPick(80,224,24,1,'file'); graf(81,222.4,'AULAS SUSPENSAS',{c:'#e8e4dc',rot:0,s:.7});
    for(const [x,y] of [[90,222],[93,222],[93,226]])prop(x,y,11); addPick(90,226,'cart',6); addPick(92,224,'ervaR',1); addPick(93,224,'bag',1,'bag'); addPick(91,223,'m9',12); addPick(90,224,'pilha',2);
    // laboratório (sudoeste) e sala dos professores
    for(const y of [236,239])for(let x=74;x<=77;x++)prop(x,y,9); addPick(74,241,'polv',2); addPick(77,241,'polvF',1);
    for(const [x,y] of [[75,237],[77,240]])initEnemies.push({uid:'lab'+x,type:'zumbi',x:tc(x),y:tc(y),dorm:true});
    for(let x=81;x<=85;x+=2)prop(x,237,9); addPick(84,240,'garrafa',3); addLocker(cg,80,241);
    // quadra coberta (leste): o zelador come alguém no meio da quadra
    rect(88,229,6,13,T.WOOD); for(let y=230;y<=241;y++){if(y%3===0)prop(93,y,13);}
    initEnemies.push({uid:'zelador',type:'zumbi',x:tc(91),y:tc(236),feed:true,col:'#c86a24'});
    for(const [x,y] of [[89,231],[93,240],[89,241]])initEnemies.push({uid:'quad'+x+y,type:'zumbi',x:tc(x),y:tc(y)});
    initEnemies.push({uid:'colgr',type:'grita',x:tc(84),y:tc(231)});
    lights.push({x:tc(84),y:tc(230.5),r:120,c:'lamp',f:1}); lights.push({x:tc(91),y:tc(236),r:140,c:'lamp',f:1});
    addInteract(74,229,'disjuntor',37); LM.colegio={x:tc(72),y:tc(231)}; LM.quadra={x:tc(91),y:tc(236)};
    graf(84,219.4,'A QUADRA NÃO',{rot:-.04});}
  // Boate Ressaca: a festa não parou; o som do DJ chama todos pra pista
  U(1,3);{const bt=building(45,249,22,22,{floor:T.CARPET,roof:'#2a1a2e',name:'Ressaca Club',doors:[['N',9,3]],kind:'boate'});
    bt.noZ=true; bt.big=true; bt.dark=true;
    iwall(bt,46,254,66,254,[[49,3],[62,3]]); for(let x=50;x<=60;x++)prop(x,251,9); prop(47,251,11); prop(65,251,11);
    iwall(bt,58,264,66,264,[[59,1]]); iwall(bt,58,265,58,269);
    addGate('escritorioB',59,264,1,1,null,'#5a3a5a','Escritório','Trancado por dentro. Dá pra ouvir alguém respirando atrás da porta.',T.WOOD); protect(bt,59,264);
    rect(48,257,9,9,T.TILEF); for(const [x,y] of [[47,256],[57,256],[47,266],[57,266]])prop(x,y,10);
    addInteract(52,255,'som',10); LM.som={x:tc(52),y:tc(255)}; LM.boate={x:tc(55),y:tc(248)};
    for(let i=0;i<12;i++){const x=ri(48,56),y=ri(257,265);initEnemies.push({uid:'pista'+i,type:i%5===4?'corr':'zumbi',x:tc(x),y:tc(y),dorm:i%3!==0});}
    for(let y=256;y<=268;y+=3)prop(46,y,13); prop(60,256,13); prop(64,258,13);
    addPick(64,262,25,1,'file'); addPick(48,252,'garrafa',4); addPick(63,252,'garrafa',2);
    addPick(60,266,'cart',8); addPick(64,269,'silenciador',1); addPick(63,267,'m9',20); addPick(65,266,'gran',1); addPick(61,268,'ervaV',1); addPick(65,268,'pilha',2);
    initEnemies.push({uid:'segur',type:'brut',x:tc(62),y:tc(267)});
    for(const [x,y] of [[50,258],[55,263],[52,261]])lights.push({x:tc(x),y:tc(y),r:110,c:'neon',f:0});
    addInteract(66,255,'disjuntor',37);
    graf(55,247.4,'A FESTA NÃO PAROU',{c:'#c84aa8',rot:.03});}
  // Obra do Residencial Marea: estrutura vazada, contêiner do escritório, cães da obra
  U(5,4);{for(let x=156;x<=179;x++){if(x<165||x>168)setT(x,276,T.FENCE);setT(x,299,T.FENCE);} for(let y=276;y<=299;y++){setT(156,y,T.FENCE);setT(179,y,T.FENCE);}
    for(let y=277;y<=298;y++)for(let x=157;x<=178;x++)setT(x,y,R()<.7?T.DIRT:T.GRAVEL);
    const ob=building(159,279,14,13,{floor:T.CONC,roof:'#5a5a58',name:'Residencial Marea (obra)',doors:[['N',5,4],['S',6,3]],kind:'obra'});
    ob.noZ=true; for(const [x,y] of [[162,282],[167,282],[162,287],[167,287],[170,282],[170,287]])setT(x,y,T.WALL);
    for(let i=0;i<14;i++){const x=ri(160,171),y=ri(280,290);if(map[idx(x,y)]===T.CONC&&R()<.6)setT(x,y,T.RUBBLE);}
    for(const [x,y] of [[164,284],[168,289],[160,290]])prop(x,y,4);
    const ct=building(171,293,7,5,{floor:T.WOOD,roof:'#a8642a',name:'Contêiner do escritório',doors:[['W',2,1]],kind:'loja'});
    addPick(172,294,26,1,'file'); addPick(176,294,'polv',3); addPick(176,296,'gran',1); addPick(173,296,'pilha',1);
    for(let x=158;x<=166;x+=2)prop(x,295,17); prop(176,280,15); prop(177,281,15);
    for(const [x,y] of [[161,296],[164,297],[175,290]])initEnemies.push({uid:'cao'+x,type:'cao',x:tc(x),y:tc(y)});
    initEnemies.push({uid:'obraf',type:'zumbi',x:tc(165),y:tc(285),feed:true});
    lights.push({x:tc(166),y:tc(278),r:200,c:'flood',f:0}); LM.obra={x:tc(166.5),y:tc(276)};
    graf(166.5,274.6,'OBRA EMBARGADA',{rot:0,c:'#e8c84a',s:.8});}
  // Rodoviária: ônibus parados com gente presa dentro
  U(1,5);U(1,6);{const rd=building(45,305,22,12,{floor:T.TILEF,roof:'#3a4a5a',name:'Rodoviária',doors:[['N',9,4],['S',9,4]],kind:'rodov'});
    rd.big=true;
    for(let x=47;x<=64;x+=3)prop(x,307,9); iwall(rd,46,310,66,310,[[50,3],[56,4],[62,3]]);
    for(const x of [48,52,60,64])prop(x,313,13); addPick(66,306,27,1,'file'); addPick(46,315,'ervaV',1); addPick(65,315,'garrafa',2);
    initEnemies.push({uid:'rodf',type:'zumbi',x:tc(56),y:tc(314),feed:true}); initEnemies.push({uid:'rod2',type:'corr',x:tc(48),y:tc(315)});
    addInteract(46,306,'disjuntor',37); LM.rodov={x:tc(56),y:tc(304)};
    rect(44,318,24,10,T.CONC); rect(44,332,24,24,T.CONC);
    for(const [x,y] of [[46,320],[52,320],[58,320],[46,334],[52,334],[46,340],[58,340],[52,346],[46,352]]){const bb=addBus(x,y);if(x===58&&y===340){bb.col='#c8b84a';bb.n22=true;}}
    addPick(64,306,'chaveOnibus',1); addInteract(60,341,'onibus',10); LM.onibus={x:tc(60),y:tc(342)}; graf(60,338.6,'22',{c:'#e8e4dc',rot:0,s:1.2});
    for(let i=0;i<5;i++){const [x,y]=[[47,321],[53,335],[47,341],[59,341],[53,347]][i];initEnemies.push({uid:'bus'+i,type:'zumbi',x:tc(x+1),y:tc(y-1),dorm:true});}
    addPick(62,336,'m9',8); addPick(64,348,'pilha',1); addPick(63,352,'spray',1);
    lights.push({x:tc(56),y:tc(325),r:180,c:'lamp',f:1}); lights.push({x:tc(56),y:tc(344),r:150,c:'lamp',f:1});
    graf(56,330.5,'NÃO ABRAM OS ÔNIBUS',{rot:-.02});}

  // Shopping Atlântico: quatro quadras, lojas em volta de um corredor em anel, átrio, cinema, praça de alimentação
  U(3,4);U(4,4);U(3,5);U(4,5);
  {const X=v=>100+v, Y=v=>276+v;
   const sh=building(100,276,52,52,{floor:T.TILEF,roof:'#4a4652',name:'Shopping Atlântico',kind:'shop',doors:[]});
   sh.noZ=true; sh.big=true; LM.shop={x:tc(X(25.5)),y:tc(Y(20))};
   door(sh,'N',24,4); door(sh,'S',24,4);
   // ala de serviço (sul): almoxarifado, corredor e a casa de máquinas
   iwall(sh,X(1),Y(41),X(50),Y(41),[[X(24),4]]);
   iwall(sh,X(15),Y(42),X(15),Y(50),[[Y(45),2]]); iwall(sh,X(35),Y(42),X(35),Y(50));
   addGate('casaMaq',X(35),Y(45),1,2,'chaveMaq','#7a6a4a','Casa de máquinas','Porta trancada. "CASA DE MÁQUINAS — SÓ PESSOAL AUTORIZADO".',T.CONC); protect(sh,X(35),Y(45)); protect(sh,X(35),Y(46));
   rect(X(36),Y(42),15,9,T.CONC); for(const [a,b] of [[44,43],[45,43],[44,44],[45,44]])prop(X(a),Y(b),15); prop(X(48),Y(48),4); prop(X(38),Y(49),4); prop(X(50),Y(43),11);
   addInteract(X(42),Y(47),'painelShop',37); LM.painelShop={x:tc(X(42)),y:tc(Y(47))};
   addPick(X(39),Y(43),'pilha',1); addPick(X(49),Y(49),'polv',2);
   for(let lx=2;lx<=13;lx+=3){prop(X(lx),Y(43),12);prop(X(lx),Y(46),12);prop(X(lx),Y(49),12);} addPick(X(4),Y(48),'ervaV',1); addPick(X(12),Y(44),'garrafa',2);
   initEnemies.push({uid:'almox1',type:'zumbi',x:tc(X(8)),y:tc(Y(45)),dorm:true}); initEnemies.push({uid:'almox2',type:'rast',x:tc(X(11)),y:tc(Y(48))});
   for(const lx of [17,22,30,33])prop(X(lx),Y(42),11); graf(X(25.5),Y(47),'SAÍDA →',{c:'#d8d4c8',rot:0});
   addPick(X(48),Y(15),'chaveMaq',1); addInteract(X(44),Y(14.4)|0,'disjuntor',37); door(sh,'W',10,2); door(sh,'E',30,2); door(sh,'E',3,2);
   // faixa norte: roupas, livraria, lanchonete, hall, ótica, drogaria, corredor de serviço
   iwall(sh,X(1),Y(8),X(50),Y(8),[[X(3),3],[X(11),2],[X(17),3],[X(23),6],[X(31),2],[X(38),5]]);
   for(const lx of [8,15,22,29,35,46])iwall(sh,X(lx),Y(1),X(lx),Y(7),lx===46?[[Y(4),1]]:[]);
   // faixa sul: loja de departamento, fliperama, hall, café, praça de alimentação
   iwall(sh,X(1),Y(33),X(50),Y(33),[[X(4),3],[X(9),2],[X(16),3],[X(23),6],[X(32),3],[X(40),10]]);
   for(const lx of [13,22,29,38])iwall(sh,X(lx),Y(34),X(lx),Y(40));
   // alas oeste (eletrônicos, esportes) e leste (segurança, banheiros)
   iwall(sh,X(1),Y(13),X(8),Y(13)); iwall(sh,X(1),Y(28),X(8),Y(28)); iwall(sh,X(8),Y(14),X(8),Y(27),[[Y(16),3],[Y(23),3]]); iwall(sh,X(1),Y(21),X(7),Y(21));
   iwall(sh,X(43),Y(13),X(50),Y(13)); iwall(sh,X(43),Y(28),X(50),Y(28)); iwall(sh,X(43),Y(14),X(43),Y(27),[[Y(17),2],[Y(24),2]]); iwall(sh,X(44),Y(21),X(50),Y(21));
   // cinema
   iwall(sh,X(29),Y(13),X(38),Y(13)); iwall(sh,X(29),Y(28),X(38),Y(28)); iwall(sh,X(29),Y(14),X(29),Y(27)); iwall(sh,X(38),Y(14),X(38),Y(27),[[Y(15),2]]);
   for(let ly=17;ly<=25;ly+=2)for(let lx=31;lx<=36;lx++)prop(X(lx),Y(ly),13);
   for(let lx=30;lx<=37;lx++)prop(X(lx),Y(14),34);
   initEnemies.push({uid:'cine1',type:'zumbi',x:tc(X(33)),y:tc(Y(20)),dorm:true}); initEnemies.push({uid:'cine2',type:'zumbi',x:tc(X(35)),y:tc(Y(24)),dorm:true});
   // átrio: pilares, fonte, escadas rolantes e o contêiner da Vértice
   for(const [a,b] of [[14,14],[27,14],[14,27],[27,27],[20,14],[20,27]])setT(X(a),Y(b),T.WALL);
   for(let j=0;j<2;j++)for(let i=0;i<2;i++)prop(X(18+i),Y(18+j),31);
   for(let j=0;j<4;j++){prop(X(16),Y(16+j),32);prop(X(25),Y(16+j),32);}
   for(let j=0;j<3;j++)for(let i=0;i<3;i++)prop(X(22+i),Y(22+j),33);
   for(const [a,b] of [[16,23],[17,23],[10,20],[11,26],[40,20],[41,25]])prop(X(a),Y(b),13);
   LM.atrio={x:tc(X(19)),y:tc(Y(24))}; LM.cont={x:tc(X(23)),y:tc(Y(23))};
   // drogaria atrás da grade
   addGate('grade',X(38),Y(8),5,1,null,'#8a8d90','Grade da Drogaria','Grade de aço baixada. Uma luz de emergência pisca lá dentro.',T.TILEF);
   for(let lx=37;lx<=44;lx++)if(lx!==40&&lx!==41)prop(X(lx),Y(1),11);
   for(const lx of [37,38,43,44])prop(X(lx),Y(4),1);
   LM.shopFarm={x:tc(X(41)),y:tc(Y(3))}; LM.grade={x:tc(X(40)),y:tc(Y(10))};
   lights.push({x:tc(X(41)),y:tc(Y(4)),r:110,c:'siren',f:0});
   addGate('servico',X(51),Y(3),1,2,null,'#6a6e70','Porta de serviço','Porta de aço da doca de carga. Trancada por fora.',T.TILEF);
   LM.doca={x:tc(X(49)),y:tc(Y(4))};
   // portas de enrolar (abertas até o sistema do shopping baixar)
   for(const [id,x,y,w,h] of [['shopN',X(24),Y(0),4,1],['shopS',X(24),Y(51),4,1],['shopW',X(0),Y(10),1,2],['shopE',X(51),Y(30),1,2]]){const g=addGate(id,x,y,w,h,null,'#55585c','Porta de enrolar','A porta de aço desceu. O sistema do shopping travou tudo.',T.TILEF);g.shut=true;openGate(g);}
   // lojas
   for(let ly=2;ly<=6;ly+=2)for(const lx of [2,4,6])prop(X(lx),Y(ly),12);
   for(const [a,b] of [[3,3],[5,5],[1,5]])initEnemies.push({uid:'man'+a+b,type:'manequim',x:tc(X(a)),y:tc(Y(b)),home:1});
   for(let ly=1;ly<=7;ly+=2){prop(X(9),Y(ly),12);prop(X(14),Y(ly),12);}
   addPick(X(12),Y(2),'pilha',1);
   for(let lx=16;lx<=21;lx++)prop(X(lx),Y(2),9); prop(X(17),Y(5),2); prop(X(20),Y(5),2);
   for(let lx=30;lx<=34;lx++)if(lx!==32)prop(X(lx),Y(2),9);
   for(let ly=35;ly<=39;ly+=2)for(const lx of [2,5,8,11])prop(X(lx),Y(ly),12);
   for(const [a,b] of [[3,37],[7,36],[10,39],[4,40]])initEnemies.push({uid:'man'+a+b,type:'manequim',x:tc(X(a)),y:tc(Y(b)),home:1});
   for(const lx of [15,17,19,21])prop(X(lx),Y(39),3); addPick(X(18),Y(36),'polv',2);
   for(let lx=30;lx<=37;lx++)if(lx<32||lx>34)prop(X(lx),Y(40),9); prop(X(31),Y(36),2); prop(X(36),Y(36),2);
   for(let lx=39;lx<=50;lx++)prop(X(lx),Y(40),9);
   for(const [a,b] of [[41,35],[44,35],[47,35],[41,38],[44,38],[47,38]])prop(X(a),Y(b),2);
   addPick(X(49),Y(37),'ervaV',1);
   for(const [a,b] of [[42,36],[46,37],[49,35]])initEnemies.push({uid:'food'+a,type:'zumbi',x:tc(X(a)),y:tc(Y(b)),dorm:true});
   for(let ly=15;ly<=19;ly+=2)prop(X(1),Y(ly),3); prop(X(5),Y(15),1); addPick(X(4),Y(18),'bag',1,'bag'); addPick(X(6),Y(19),'pilha',2);
   for(let ly=23;ly<=27;ly+=2)prop(X(1),Y(ly),12); addPick(X(5),Y(25),'ervaV',1);
   for(let lx=45;lx<=50;lx++)prop(X(lx),Y(14),35); prop(X(47),Y(17),2); addPick(X(49),Y(18),17,1,'file'); addPick(X(45),Y(19),'spray',1); addPick(X(50),Y(16),1,8,'weapon'); addPick(X(46),Y(16),'m9',12); addLocker(sh,X(50),Y(20));
   for(const lx of [45,47,49])prop(X(lx),Y(27),3); initEnemies.push({uid:'banh',type:'zumbi',x:tc(X(47)),y:tc(Y(24))});
   for(const [a,b] of [[30,11],[5,30],[44,31],[11,15],[40,26],[20,10],[33,31]])initEnemies.push({uid:'shz'+a+b,type:'zumbi',x:tc(X(a)),y:tc(Y(b))});
   initEnemies.push({uid:'shinch',type:'incha',x:tc(X(10)),y:tc(Y(30))});
   for(const [a,b] of [[10,11],[41,11],[10,30],[41,30],[25,20]])lights.push({x:tc(X(a)),y:tc(Y(b)),r:150,c:'lamp',f:1});
   // a van da Vértice na doca
   {const v=addCar(153,283,false,false,'#e8e8e4');v.kind='vertice';} addPick(155,283,21,1,'file'); LM.van={x:tc(154.5),y:tc(285.5)};
   npcs.push({id:'eduV',name:'Edu',look:'edu',x:tc(154.5),y:tc(285.6),col:'#18191c',hair:'#2a1c12',skin:'#e2b79a',ang:Math.PI,cond:()=>!!(G.flags&&G.flags.eduVan)});
   LM.seguranca={x:tc(X(47)),y:tc(Y(17))}; addLocker(sh,X(2),Y(50)); addLocker(sh,X(33),Y(49)); addLocker(sh,X(12),Y(31));
   graf(125.5,274.6,'NÃO ENTRE NO SHOPPING',{rot:.01});
   graf(125.5,319.5,'VÉRTICE ESTÁ NO SHOPPING',{cond:()=>G.flags&&G.flags.shopEv,c:'#d8d4c8'});}
  // Hospital Ruth Cardoso (guia de transferência na farmácia, ala leste)
  U(2,5);{const hb=building(73,305,22,22,{floor:T.TILEF,roof:'#62655f',name:'Hospital Ruth Cardoso',doors:[['S',9,3],['E',9,2]],kind:'hospital'});
    iwall(hb,74,313,93,313,[[76,1],[81,1],[86,1],[91,1]]);
    for(const x of [79,84,89])iwall(hb,x,306,x,312);
    iwall(hb,74,317,93,317,[[76,1],[82,3],[90,1]]); iwall(hb,79,318,79,325); iwall(hb,88,318,88,325);
    for(const [x,y] of [[74,307],[77,307],[74,310],[77,310],[80,307],[83,307],[80,310],[85,307],[88,307],[85,310]])prop(x,y,11);
    prop(90,306,1); prop(93,306,1); prop(93,311,11);
    addPick(92,308,16,1,'file'); LM.farmacia={x:tc(92),y:tc(308)};
    addPick(75,319,2,6,'weapon'); addLocker(hb,78,324); addLocker(hb,74,312);
    for(const x of [81,82,84,85])prop(x,322,13); prop(86,319,9); prop(87,319,9);
    addPick(86,324,14,1,'file'); addPick(81,308,'ervaV',1); addPick(83,325,'cart',2);
    for(const [x,y] of [[90,320],[92,320],[90,323],[92,323]])prop(x,y,11);
    for(const [x,y] of [[91,322],[93,324],[89,325]])initEnemies.push({uid:'morg'+x+y,type:'zumbi',x:tc(x),y:tc(y),dorm:true});
    initEnemies.push({uid:'hos1',type:'zumbi',x:tc(86),y:tc(315)}); initEnemies.push({uid:'hos2',type:'corr',x:tc(76),y:tc(315)});
    LM.hospital={x:tc(83),y:tc(327)}; addInteract(74,326,'disjuntor',37);
    lights.push({x:tc(84),y:tc(315),r:130,c:'lamp',f:1});
    graf(83.5,302.6,'A VÉRTICE SABIA',{rot:-.03});}
  U(2,6);{rect(73,333,22,22,T.CONC);
    {const a1=addCar(76,336,true,false,'#d8d6cc');a1.kind='amb';} {const a2=addCar(86,344,true,true,'#d8d6cc');a2.kind='amb';} addCar(80,350,true,false);
    lights.push({x:tc(77),y:tc(336),r:170,c:'siren',f:0}); LM.estac={x:tc(84),y:tc(341)};}

  // ======== BARRA SUL ========
  // Cemitério
  U(1,7);{for(let x=44;x<=67;x++){setT(x,360,T.FENCE);setT(x,383,T.FENCE);} for(let y=360;y<=383;y++){setT(44,y,T.FENCE);setT(67,y,T.FENCE);}
    for(let x=54;x<=57;x++)setT(x,360,T.GRASS);
    for(let y=361;y<=382;y++){setT(55,y,T.DIRT);setT(56,y,T.DIRT);}
    for(let y=364;y<=380;y+=3)for(let x=46;x<=65;x+=2){if(x>=53&&x<=58)continue;if(R()<.8)prop(x,y,30);}
    building(47,374,7,6,{floor:T.CONC,roof:'#55524c',name:'Mausoléu',doors:[['N',2,2]],kind:'mausoleu'}); addPick(49,377,20,1,'file');
    trees(45,361,66,382,.06);
    for(let i=0;i<9;i++){const x=ri(46,65),y=ri(362,381);if(SOLID[map[idx(x,y)]])continue;initEnemies.push({uid:'cem'+i,type:i<7?'zumbi':'rast',x:tc(x),y:tc(y),dorm:true});}
    lights.push({x:tc(55.5),y:tc(362),r:140,c:'candle',f:1});
    LM.cemiterio={x:tc(55.5),y:tc(364)};
    graf(56,358.4,'DE NOITE ELES LEVANTAM',{rot:-.02});}
  // Oficina do Tião e o pátio de sucata
  U(4,7);{rect(129,361,22,22,T.CONC);
    safeRoom(138,364,13,10,[['E',3,2]],'Oficina do Tião');
    npcs.push({id:'tiao',name:'Tião',x:tc(142),y:tc(368),col:'#2f3d55',hair:'#2a2420',ang:0,cond:()=>!(G.flags&&G.flags.tiaoMorto)});
    for(const [x,y] of [[140,371],[141,371],[146,365]])prop(x,y,4);
    LM.oficina={x:tc(148),y:tc(368)}; LM.jipe={x:tc(153.6),y:tc(368)}; LM.tiaoHome={x:tc(142),y:tc(368)};
    addCar(130,363,false,false); addCar(132,370,true,true); addCar(139,379,true,false);
    building(130,374,7,6,{floor:T.CONC,roof:'#4a4038',name:'Depósito de peças',doors:[['N',2,2]],loot:true,kind:'loja'});}
  // estação do bondinho
  U(5,7);{rect(157,361,22,22,T.CONC);
    building(162,366,12,8,{floor:T.CONC,roof:'#7a3a2a',name:'Estação Barra Sul do Bondinho',doors:[['W',3,2],['N',5,2]],kind:'bondinho',loot:true});
    LM.bondinho={x:tc(168),y:tc(370)}; addInteract(171,368,'bondinho',10); LM.bondBS={x:tc(168),y:tc(374.5)}; lights.push({x:tc(168),y:tc(364),r:140,c:'lamp',f:1});}
  // molhe da Barra Sul
  rect(186,386,16,2,T.PIER); rect(202,385,2,4,T.ROCK); lights.push({x:tc(200),y:tc(386.5),r:120,c:'lamp',f:1});
  // Cristo Luz, no morro a oeste
  {curvyRoad([[38.5,345.5],[33,346],[28,349],[25,352]],1.1,1.8,T.DIRT);
    for(let y=348;y<=372;y++)for(let x=12;x<=36;x++){const e=((x-24)/11)**2+((y-360)/11.5)**2;if(e<=1)setT(x,y,(Math.sin(x*.6)+Math.cos(y*.5)+R()*.4)>1?T.DIRT:T.GRASS);}
    rect(23,352,2,2,T.ROCK); LM.cristo={x:tc(23.5),y:tc(352.5)};
    building(19,362,10,6,{floor:T.WOOD,roof:'#d8d4c8',name:'Capela do Cristo Luz',doors:[['N',4,2]],kind:'capela'});
    addPick(27,366,0,20,'weapon'); addPick(20,366,'pilha',2); addPick(21,363,'ervaR',1); addPick(26,363,'bag',1,'bag');
    LM.capela={x:tc(27),y:tc(366)};
    for(let x=21;x<=26;x++)prop(x,365,13);
    lights.push({x:tc(24),y:tc(365),r:120,c:'candle',f:1}); lights.push({x:tc(24),y:tc(354),r:230,c:'flood',f:0});}

  // quadras restantes
  for(let by=0;by<8;by++)for(let bx=0;bx<6;bx++){
    if(used.has(bx+','+by))continue; if(bx===0&&by>=6)continue;
    const [x0,x1]=BC_BX[bx],[y0,y1]=BC_BY[by];
    const style=bx===5?'torre':bx>=3?(R()<.45?'torre':'duplas'):bx===2?(R()<.3?'duplas':'casas'):'casas';
    homeBlock(x0,y0,x1,y1,{style,side:by%2?'S':'N'});
  }
  // quiosques e palmeiras na areia
  for(const y of [172,228,262,312,344,372])quiosque(188,y);
  for(let y=161;y<=386;y+=6)if(getT(186,y)===T.SAND)setT(186,y,T.TREE);
  sidewalksIn(12,159,185,388);
  trees(12,159,185,388,.05);
  carsIn(12,159,183,388,52);
  lights.push({x:tc(130),y:tc(162),r:140,c:'lamp',f:1});
  graf(182,214,'MÃE, FUI PRO PORTO',{rot:Math.PI/2-.05,c:'#d8d4c8'});
  graf(154,256,'NÃO SAIA À NOITE',{rot:Math.PI/2+.04});
  graf(70,290,'ELES SÓ ANDAM QUANDO VOCÊ NÃO OLHA',{rot:-Math.PI/2+.03,c:'#d8d4c8',s:.8});
}

function computeReach(){
  reach.fill(0);
  const q=new Int32Array(W*HT); let h=0,t=0;
  const s=idx(Math.floor(START.x/TILE),Math.floor(START.y/TILE)); reach[s]=1; q[t++]=s;
  for(const L of [LM.bondMA,LM.sewIn]){if(!L)continue;const s2=idx((L.x/TILE)|0,(L.y/TILE)|0);if(!reach[s2]){reach[s2]=1;q[t++]=s2;}}
  while(h<t){
    const k=q[h++]; const x=k%W, y=(k/W)|0;
    for(const [dx,dy] of DIRS4){
      const nx=x+dx,ny=y+dy; if(!inb(nx,ny))continue; const nk=idx(nx,ny);
      if(reach[nk])continue; const tt=map[nk];
      if(SOLID[tt]&&tt!==T.GATE&&tt!==T.SHUTTER)continue;
      reach[nk]=1; q[t++]=nk;
    }
  }
}
function randomTileIn(d,ok){
  const D=DISTRICTS[d], y0=Math.max(1,D.y0), y1=Math.min(H-2,D.y1);
  for(let i=0;i<600;i++){
    const x=ri(1,W-2), y=ri(y0,y1), k=idx(x,y);
    if(SOLID[map[k]]||!reach[k]||safeMask[k])continue;
    if(ok&&!ok(x,y,k))continue;
    return [x,y];
  }
  return null;
}
function placeLoot(){
  for(const b of buildings){
    if(!b.loot)continue;
    const d=dAt(b.x,b.y), area=(b.w-2)*(b.h-2); const n=(R()<.6?1:0)+(R()<.25?1:0)+(area>200&&R()<.5?1:0)+(area>380&&R()<.5?1:0);
    for(let i=0;i<n;i++){
      for(let tries=0;tries<20;tries++){
        const x=b.x+ri(1,b.w-2), y=b.y+ri(1,b.h-2), k=idx(x,y);
        if(SOLID[map[k]]||pickOcc.has(k))continue;
        const id=wpick(DISTRICTS[d].loot,R); const q=ri(...LOOTQ[id]);
        addPick(x,y,id,q); break;
      }
    }
  }
  for(let d=0;d<DISTRICTS.length;d++){
    for(let i=0;i<7;i++){
      const tt=randomTileIn(d,(x,y,k)=>!pickOcc.has(k)&&bmap[k]<0&&map[k]!==T.ROAD);
      if(!tt)continue; const id=wpick(DISTRICTS[d].loot,R); addPick(tt[0],tt[1],id,ri(...LOOTQ[id]));
    }
  }
}
function placeEnemies(){
  let n=0;
  for(let d=0;d<DISTRICTS.length;d++){
    const D=DISTRICTS[d];
    for(let i=0;i<Math.round(D.count*.6);i++){
      const tt=randomTileIn(d,(x,y,k)=>hyp(tc(x)-START.x,tc(y)-START.y)>18*TILE&&(bmap[k]<0||R()<.4));
      if(!tt)continue;
      let type=wpick(D.spawn,R);
      initEnemies.push({uid:'e'+(n++),type,x:tc(tt[0]),y:tc(tt[1]),dorm:(type==='zumbi'||type==='rast')&&R()<.3});
      if(type==='cao'){for(let k=0;k<2;k++)initEnemies.push({uid:'e'+(n++),type:'cao',x:tc(tt[0])+ri(-20,20),y:tc(tt[1])+ri(-20,20)});}
    }
  }
  // gente que virou dentro de casa: zumbis nos cômodos, alguns ainda deitados
  for(const b of buildings){
    if(b.safe||b.noZ||b.kind==='quiosque'||b.kind==='coreto')continue;
    const area=(b.w-2)*(b.h-2); if(area<24)continue;
    const d=dAt(b.x,b.y), bc=d>=5;
    let k=(R()<(bc?.6:.4)?1:0)+(area>160&&R()<.55?1:0)+(area>360&&R()<.7?1:0);
    for(let i=0;i<k;i++)for(let t=0;t<14;t++){
      const x=b.x+ri(1,b.w-2),y=b.y+ri(1,b.h-2),kk=idx(x,y);
      if(SOLID[map[kk]]||!reach[kk]||pickOcc.has(kk))continue;
      if(hyp(tc(x)-START.x,tc(y)-START.y)<14*TILE)break;
      let type=wpick(DISTRICTS[d].spawn,R); if(type==='cao'||type==='esfol')type='zumbi';
      initEnemies.push({uid:'e'+(n++),type,x:tc(x),y:tc(y),dorm:R()<.35});
      break;
    }
  }
}
// janelas: todas aparecem de fora; algumas poucas dá pra quebrar e usar como rota de fuga
function placeWindows(){
  winAt=new Map();
  const skip=new Set(['tenda','coreto','quiosque','cabine','mausoleu','bondinho']);
  for(const b of buildings){
    b.wins=[]; if(b.safe||skip.has(b.kind))continue;
    const cand=[];
    for(let x=b.x+1;x<b.x+b.w-1;x++){cand.push([x,b.y,0,1]);cand.push([x,b.y+b.h-1,0,-1]);}
    for(let y=b.y+1;y<b.y+b.h-1;y++){cand.push([b.x,y,1,0]);cand.push([b.x+b.w-1,y,-1,0]);}
    const brk=[];
    for(const [x,y,ix,iy] of cand){
      if(getT(x,y)!==T.WALL||(x*3+y*5)%4!==0)continue;
      const ik=idx(x+ix,y+iy), ok=idx(x-ix,y-iy); if(!inb(x-ix,y-iy))continue;
      if(SOLID[map[ik]]||bmap[ok]>=0)continue;
      const w={x,y,dir:iy===1?0:iy===-1?2:ix===1?3:1,b}; b.wins.push(w); winAt.set(idx(x,y),w.dir);
      const ot=map[ok]; if(!SOLID[ot]&&ot!==T.WATER&&!b.prot.has(ik))brk.push(w);
    }
    if(b.dark)continue;
    let nb=b.big?2:((b.w-2)*(b.h-2)>150?1:(R()<.3?1:0));
    while(nb-->0&&brk.length){const w=brk.splice(Math.floor(R()*brk.length),1)[0];setT(w.x,w.y,T.WINDOW);w.brk=true;interacts.push({tx:w.x,ty:w.y,x:tc(w.x),y:tc(w.y),type:'janela'});}
  }
}
// luzes dentro de prédio ficam ligadas ao disjuntor daquele prédio
function linkPower(){
  for(const l of lights){const tx=(l.x/TILE)|0,ty=(l.y/TILE)|0,bi=bmap[idx(tx,ty)];if(bi>=0&&!buildings[bi].safe&&l.c!=='safe')l.b=bi;if(bi<0&&(l.c==='lamp'||l.c==='neon')&&dAt(tx,ty)>=5)l.bc=true;}
  for(const it of interacts)if(it.type==='disjuntor')it.b=bmap[idx(it.tx,it.ty)];
}
// cômodos que ficaram sem passagem (móveis ou paredes no caminho): abre espaço
function unblockPockets(){
  const keep=new Set(interacts.map(it=>idx(it.tx,it.ty)));
  const skip=k=>{const x=k%W,y=(k/W)|0;return NOFIX.some(([a,b,c,d])=>x>=a&&x<=c&&y>=b&&y<=d);};
  for(let it=0;it<8;it++){
    computeReach(); let changed=0;
    for(let k=0;k<W*H;k++){
      if(reach[k]||bmap[k]<0||SOLID[map[k]]||skip(k))continue;
      const x=k%W,y=(k/W)|0;
      for(const [dx,dy] of DIRS4){const nk=idx(x+dx,y+dy);if(map[nk]===T.PROP&&!keep.has(nk)){setT(x+dx,y+dy,buildings[bmap[k]].floor);changed++;}}
    }
    if(!changed){
      for(let k=0;k<W*H&&!changed;k++){
        if(reach[k]||bmap[k]<0||SOLID[map[k]]||skip(k))continue; const x=k%W,y=(k/W)|0, b=buildings[bmap[k]];
        for(const [dx,dy] of DIRS4){const wx=x+dx,wy=y+dy,ox=x+2*dx,oy=y+2*dy;if(!inb(ox,oy))continue;const wk=idx(wx,wy),ok2=idx(ox,oy);
          if(map[wk]!==T.WALL||bmap[wk]!==bmap[k])continue; if(wx===b.x||wy===b.y||wx===b.x+b.w-1||wy===b.y+b.h-1)continue;
          if(reach[ok2]&&!SOLID[map[ok2]]){setT(wx,wy,b.floor);changed++;break;}}
      }
      if(!changed)break;
    }
  }
  computeReach();
}

function placeLamps(){
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){
    const k=idx(x,y); if(map[k]!==T.SIDE)continue;
    if((x*7+y*13)%23!==0)continue;
    if(R()<.3)continue;
    const broken=R()<.25;
    lamps.push({x:tc(x),y:tc(y),broken});
    if(!broken)lights.push({x:tc(x),y:tc(y),r:150,c:'lamp',f:R()<.25?1:0});
  }
}
function fixPickups(){
  pickOcc.clear();
  for(const p of pickups){
    const k=idx(p.tx,p.ty);
    if(!reach[k]||SOLID[map[k]]||pickOcc.has(k)){const [x,y]=freeTileNear(p.tx,p.ty,true);p.tx=x;p.ty=y;}
    p.x=tc(p.tx); p.y=tc(p.ty); pickOcc.add(idx(p.tx,p.ty));
  }
}
// corpos na areia e silhuetas paradas dentro do mar (só aparecem direito com relâmpago ou lanterna)
let beachDeco=[], seaFigs=[];
function genBeachDeco(){
  beachDeco=[];seaFigs=[];
  for(let y=46;y<=386;y++){
    const c=coastX(y); if(getT(c,y)!==T.WATER)continue;
    if(getT(c-1,y)===T.SAND&&R()<.07){const x=c-ri(1,5);if(getT(x,y)===T.SAND)beachDeco.push({x:tc(x)+ri(-10,10),y:tc(y)+ri(-10,10),rot:R()*6.28,k:R()<.7?'corpo':'prancha',seed:R()});}
    if(R()<.035&&y>58){const d=ri(2,9);if(getT(c+d,y)===T.WATER)seaFigs.push({x:tc(c+d),y:tc(y),ph:R()*6.28,s:.85+R()*.4});}
  }
}
let staticMapImg=null;
function genWorld(){
  rnd=mulberry32(20261006); uidc=0;
  map.fill(T.GRASS); meta.fill(0); under.fill(0); bmap.fill(-1); safeMask.fill(0); mark.fill(0); rdir.fill(0); reach.fill(0); explored.fill(0);
  puddles=[];buildings=[];cars=[];lights=[];lamps=[];pickups=[];interacts=[];gates=[];npcs=[];initEnemies=[];LM={};pickOcc.clear();NOFIX=[];GRAF=[];GORE=[];
  for(let i=0;i<W*H;i++)tvar[i]=R();
  genTerrain(); genPorto(); genItajai(); genCabecudas(); genBrava(); genEstrada(); genBC(); genLaranjeiras();
  dumpsters(14,32,197,139,.035); dumpsters(12,159,185,388,.03);
  for(const c of cars)if(!c.burn&&!c.kind&&R()<.4){const it={tx:c.x,ty:c.y,x:(c.x+c.w/2)*TILE,y:(c.y+c.h/2)*TILE,type:'hide',kind:'carro'};interacts.push(it);}
  genBeachDeco();
  for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const t=map[idx(x,y)];if((t===T.ROAD||t===T.SIDE||t===T.CONC)&&R()<.02)puddles.push({x:tc(x)+ri(-6,6),y:tc(y)+ri(-6,6),rx:ri(14,30),ry:ri(7,14),rot:R()*.6-.3,ph:R()*6});}
  for(let i=0;i<W*H;i++)if(rdir[i]===3)mark[i]=0;
  placeWindows();
  unblockPockets();
  linkPower();
  placeLoot(); placeEnemies(); placeLamps(); fixPickups();
  if(typeof genV12==='function')genV12();
  staticMapImg=null;
  if(typeof computeStatic==='function')computeStatic();
}
