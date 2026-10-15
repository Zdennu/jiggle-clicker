// ---------- Wardrobe ----------
const wardEl=document.getElementById('wardrobe');
let garmentParts=[];
function hexStr(c){return '#'+c.toString(16).padStart(6,'0');}
function clearGarment(){garmentParts.forEach(m=>{m.parent&&m.parent.remove(m);m.geometry.dispose();const d=m.userData.def;if(d){const k=deformables.indexOf(d);if(k>=0)deformables.splice(k,1);}});garmentParts=[];}
function addTo(parent,geo,mat,pos,rot,scl){
  const m=new THREE.Mesh(geo,mat);if(pos)m.position.set(...pos);if(rot)m.rotation.set(...rot);if(scl)m.scale.set(...scl);
  parent.add(m);garmentParts.push(m);return m;
}
// ---- surface-fitted garment builders (body-local coords) ----
const BY=body.position.y;
const _n=new THREE.Vector3();
function onSurf(t,y,mode,off){const p=S(t,y,mode,new THREE.Vector3());normalAt(t,y,mode,_n);return p.addScaledVector(_n,off);}
function addGarmentGeo(geo,rest,mat){
  const m=new THREE.Mesh(geo,mat);m.castShadow=m.receiveShadow=true;body.add(m);garmentParts.push(m);
  m.userData.rest=rest;return m;
}
// shell over the torso: columns in t, each column spans yBot(t)..yTop(t)
function shell(mat,o){
  const cols=o.cols||200, rows=o.rows||90, t0=o.t0===undefined?0:o.t0, t1=o.t1===undefined?2*Math.PI:o.t1, closed=o.t0===undefined;
  const [g,R]=buildGrid(cols,rows,(i,j)=>{
    const t=t0+(t1-t0)*i/cols, yb=o.yBot(t), yt=o.yTop(t), y=yb+(yt-yb)*j/rows;
    const p=onSurf(t,y,o.mode||0,o.off(t,y,j/rows)); const r=S(t,y,0,_a); return [p,[r.x,r.y]];
  },closed);
  return addGarmentGeo(g,R,mat);
}
// cup: polar patch around a breast centre, conforming to the skin surface
function cup(mat,sx,off,rmax){
  const cols=128, rows=48;
  const [g,R]=buildGrid(cols,rows,(i,j)=>{
    const ph=i/cols*2*Math.PI, c=Math.cos(ph), lim=c<0?(BR.cx-0.035)/(BR.rx*-c):9, rho=Math.max(0.0005,Math.min(rmax(ph),lim)*j/rows);
    const x=sx*BR.cx+rho*BR.rx*Math.cos(ph)*sx, y=BR.cy+rho*Math.sin(ph)*(Math.sin(ph)>0?BR.ryU:BR.ryD);
    const t=tForX(x,y,1,0); return [onSurf(t,y,0,off),[x,y]];
  },true);
  return addGarmentGeo(g,R,mat);
}
// flat ribbon (strap) following the surface: list of [x,y,side]
function ribbon(mat,path,w,off,twist){
  const pts=[],nrm=[],rest=[];
  path.forEach(([x,y,sg])=>{const t=tW(x,y,sg);pts.push(onSurf(t,y,0,off));nrm.push(normalAt(t,y,0,new THREE.Vector3()));rest.push([x,y]);});
  const curve=new THREE.CatmullRomCurve3(pts), N=120, P=[], I=[], RR=[];
  for(let k=0;k<=N;k++){const u=k/N, p=curve.getPoint(u), tg=curve.getTangent(u), f=u*(pts.length-1), i0=Math.min(pts.length-2,Math.floor(f));
    const no=nrm[i0].clone().lerp(nrm[i0+1],f-i0).normalize(), b=new THREE.Vector3().crossVectors(tg,no).normalize();
    if(twist)b.applyAxisAngle(tg,twist*Math.sin(u*Math.PI*2)*Math.sin(u*Math.PI));
    const r=rest[i0], r2=rest[i0+1], rx=r[0]+(r2[0]-r[0])*(f-i0), ry=r[1]+(r2[1]-r[1])*(f-i0);
    P.push(...p.clone().addScaledVector(b,w/2).toArray(),...p.clone().addScaledVector(b,-w/2).toArray());RR.push([rx,ry],[rx,ry]);
    if(k<N){const a=k*2;I.push(a,a+1,a+3,a,a+3,a+2);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();
  return addGarmentGeo(g,RR,mat);
}
// strap path over the shoulder at a given x
function strapPath(x,yFront,yBack){
  let yTop=1.9;while(Wf(yTop+0.005)-0.01>x&&yTop<2.4)yTop+=0.005;
  const p=[];const nF=10;
  for(let k=0;k<=nF;k++){const y=yFront+(yTop-0.01-yFront)*k/nF;p.push([x,y,1]);}
  for(let k=nF;k>=0;k--){const y=yBack+(yTop-0.01-yBack)*k/nF;p.push([x,y,-1]);}
  return p;
}
const uOf=t=>Math.abs(Math.cos(t)), front=t=>Math.sin(t)>0;
function band(mat,y0,y1,off,mode){return shell(mat,{yBot:()=>y0,yTop:()=>y1,off:()=>off,rows:6,mode});}
function tops(mat,o){ // generic top: torso shell + trim + optional sleeves
  shell(mat,{mode:1,cols:240,rows:170,yBot:()=>o.bot,yTop:o.top,off:(t,y,v)=>o.off+o.loose*ss(o.bot+0.5,o.bot,y)});
  // ribbed hem + neck trim
  shell(mat,{mode:1,yBot:()=>o.bot-0.005,yTop:()=>o.bot+0.06,rows:4,off:()=>o.off+o.loose+0.008});
}
