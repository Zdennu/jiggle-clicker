// garment item: croptank: fitted ribbed crop tank (default top). Opaque, drapes over the chest (mode 1),
// diagonal tension folds pulling toward the bust, hem rises as the chest grows.
const RIB_TEX=(()=>{const W=1024,H=256,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  g.fillStyle='#808080';g.fillRect(0,0,W,H);const N=96;                     // 96 ribs around the body
  for(let i=0;i<N;i++){const x=i*W/N,gr=g.createLinearGradient(x,0,x+W/N,0);gr.addColorStop(0,'#5a5a5a');gr.addColorStop(0.5,'#b4b4b4');gr.addColorStop(1,'#5a5a5a');g.fillStyle=gr;g.fillRect(x,0,W/N+1,H);}
  const t=new THREE.CanvasTexture(c);t.wrapS=THREE.RepeatWrapping;return t;})();
BUILD.croptank=m=>{
  m.bumpMap=RIB_TEX;m.bumpScale=0.0035;m.roughness=0.92;m.side=THREE.DoubleSide;
  const grow=Math.max(0,Math.min(1,(BR.h-BR0.h)/0.35));                    // 0 at L1 .. ~1 at L20
  const bot=1.06+0.09*grow;                                                 // hem lifts with the chest
  const top=t=>{const u=uOf(t);const nk=front(t)?1.74:1.82;return u<0.45?nk+(1.9-nk)*Math.pow(ss(0.05,0.45,u),0.8):1.9-0.3*ss(0.45,0.85,u);};
  const cols=240,rows=150,off=(t,y)=>{                                       // tension folds: diagonal, from bust apex down/outwards
    const fr=Math.max(0,Math.sin(t)),dy=BR.cy-y,m=fr*ss(0,0.05,dy)*ss(BR.cy-bot+0.02,BR.cy-bot-0.1,dy);
    const ax=Math.cos(t)*1.6;return 0.012+0.0022*m*(0.5+0.5*Math.sin(34*(Math.abs(ax)*0.9+dy*1.3)));};
  // follow the true skin (mode 0: height-field at low levels, spheres at high), then bridge the cleavage per row
  // like stretched fabric: between the two bust apexes the cloth is a straight line, never dipping inward.
  const PP=[],RR=[];
  for(let j=0;j<=rows;j++){const row=[];
    for(let i=0;i<cols;i++){const t=2*Math.PI*i/cols,yt=top(t),y=bot+(yt-bot)*j/rows,p=onSurf(t,y,0,off(t,y));row.push(p);RR.push([S(t,y,0,_a).x,_a.y]);}
    // columns run t=0 (right side) -> pi/2 (front) -> pi (left side); apex = max-z column on each half
    let iR=-1,iL=-1;for(let i=0;i<cols/2;i++){const p=row[i];if(p.x>0&&(iR<0||p.z>row[iR].z))iR=i;if(p.x<0&&(iL<0||p.z>row[iL].z))iL=i;}
    if(iR>=0&&iL>iR+1){const A=row[iR],B=row[iL];for(let i=iR+1;i<iL;i++){const k=(i-iR)/(iL-iR),p=row[i],zl=A.z+(B.z-A.z)*k;
      const w=ss(0,0.004,zl-p.z);p.x+=(A.x+(B.x-A.x)*k-p.x)*w;p.z=Math.max(p.z,zl);p.y+=(A.y+(B.y-A.y)*k-p.y)*w*0.5;}}
    row.forEach(p=>PP.push(p));}
  // hang: below the bust apex the cloth falls in a slant instead of tucking under the breast (per column, top -> hem)
  for(let i=0;i<cols;i++){let zm=-9,ym=0,xm=0;for(let j=rows;j>=0;j--){const p=PP[j*cols+i];if(p.z<0.02)continue;
    if(p.z>zm){zm=p.z;ym=p.y;}else{const zz=zm-0.45*(ym-p.y);if(zz>p.z)p.z=zz;}}}
  const [g,R]=buildGrid(cols,rows,(i,j)=>[PP[j*cols+i],RR[j*cols+i]],true);
  const uv=[];for(let j=0;j<=rows;j++)for(let i=0;i<cols;i++)uv.push(i/cols,j/rows);g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));
  addGarmentGeo(g,R,m);
  // folded hem band + wide ribbed straps
  {const HR=3,P=[],RH=[];for(let j=0;j<=HR;j++)for(let i=0;i<cols;i++){const q=PP[j*cols+i],zc=Zc(q.y),d=new THREE.Vector3(q.x,0,q.z-zc).normalize();
     P.push(q.clone().addScaledVector(d,0.0045).add(new THREE.Vector3(0,j===0?-0.006:0,0)));RH.push(RR[j*cols+i]);}
   const [gh,rh]=buildGrid(cols,HR,(i,j)=>[P[j*cols+i],RH[j*cols+i]],true);addGarmentGeo(gh,rh,m);}   // folded hem band
  [-1,1].forEach(sx=>ribbon(m,strapPath(sx*0.27,1.88,1.8),0.075,0.014));};
