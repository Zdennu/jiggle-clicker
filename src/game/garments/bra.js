// ================= Lingerie bra: one continuous shell with thickness, rolled edges, UVs =================

function braMaterial(color){
  return new THREE.MeshPhysicalMaterial({color:new THREE.Color(color).convertSRGBToLinear(),map:BRA_TEX.map,normalMap:BRA_TEX.nmap,
    alphaMap:BRA_TEX.alpha,alphaTest:0.45,normalScale:new THREE.Vector2(0.6,0.6),roughness:0.42,metalness:0.0,clearcoat:0.25,clearcoatRoughness:0.35,
    sheen:new THREE.Color(color).convertSRGBToLinear().multiplyScalar(0.6),side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
}
// balconette/plunge cut profile as functions of torso angle t (uses current BR => scales per level)
// cup geometry in chest-WALL coordinates: blends from the height-field footprint (low levels) to the sphere
// patch (high levels), so the same (t,y) outline wraps the balls. S() then maps it onto the real surface.
const tW=(x,y,s)=>withBR({h:0,sw:0},()=>tForX(x,y,s||1,0));
function cupGeo(){const sw=BR.sw||0, th0=Math.acos(-BR.sC/BR.sR), D1=BR.sR*Math.sin(th0)*0.9;
  return {cx:BR.cx+(0.229-BR.cx)*sw, cy:BR.cy+(1.48-BR.cy)*sw, rx:BR.rx+(D1*1.08-BR.rx)*sw, ryD:BR.ryD+(D1*1.06-BR.ryD)*sw, ryU:BR.ryU+(D1*1.15-BR.ryU)*sw, sw};}
function braProfile(t){
  const G=cupGeo(), p=withBR({h:0,sw:0},()=>S(t,G.cy,0,new THREE.Vector3())), fr=Math.sin(t), ax=Math.abs(p.x);
  const dxn=Math.max(-1,Math.min(1,(ax-G.cx)/G.rx));
  const front=ss(-0.05,0.35,fr), cupC=front*(1-ss(0.95,1.15,(ax-G.cx)/G.rx));
  const wire=G.cy-G.ryD*Math.sqrt(Math.max(0,1-dxn*dxn))*0.97;
  const yWire0=G.cy-G.ryD*0.97;
  const yBot=yWire0-0.034-0.012*(1-front);
  const yWire=front*Math.max(yBot+0.024,wire)+(1-front)*(yBot+0.03);
  const xs=Math.min(G.cx+G.rx*0.35,Wf(G.cy+G.ryU*0.45)*0.82), ys=G.cy+G.ryU*0.5, gore=yWire0+0.03+0.02*(1-G.sw);
  const wingTop=yBot+0.045+0.03*front*ss(0.3,0.8,Math.abs(Math.cos(t)));
  let yN=ax<=xs?gore+(ys-gore)*Math.pow(ax/xs,1.08):ys+(wingTop-ys)*ss(xs,G.cx+G.rx*1.45,ax);
  const yTop=yN*front+wingTop*(1-front);
  return {yBot,yWire:Math.min(yWire,yTop-0.03),yTop,cupC,G};
}
function braShell(mat){
  const COLS=300, RB=10, RC=56, RR=5, th=0.006, strain=(BR.sw||0);
  const rows=[]; // per column list of vertices around the closed (outer->roll->inner->roll) loop
  const P=[],UV=[],XY=[],I=[]; let per=0;
  const T=new THREE.Vector3(),N=new THREE.Vector3(),q=new THREE.Vector3(),a=new THREE.Vector3(),b=new THREE.Vector3();
  for(let i=0;i<COLS;i++){
    const t=i/COLS*2*Math.PI, pr=braProfile(t), ring=[];
    const ys=[];for(let r=0;r<=RB;r++)ys.push([pr.yBot+(pr.yWire-pr.yBot)*r/RB, 0.47*r/RB]);
    for(let r=1;r<=RC;r++)ys.push([pr.yWire+(pr.yTop-pr.yWire)*r/RC, 0.47+0.53*r/RC]);
    const pt=(y,extra)=>{const p=S(t,y,0,new THREE.Vector3());normalAt(t,y,0,N);
      const f=(y-pr.yWire)/Math.max(1e-3,pr.yTop-pr.yWire), lift=0.012*(1-0.6*strain)*pr.cupC*ss(0.55,1,f); // neckline stands slightly off the skin
      const off=f<0?0.0065-0.0028*strain:0.0065; return [p.addScaledVector(N,off+lift+extra),N.clone(),p];};
    const tangentUp=(y)=>{S(t,y+0.004,0,a);S(t,y-0.004,0,b);return a.sub(b).normalize().clone();};
    const outer=ys.map(([y,v])=>{const [p,n,s]=pt(y,0);return {p,n,y,v,s};});
    // loop: outer bottom->top, rolled top edge, inner top->bottom, rolled bottom edge
    outer.forEach(o=>ring.push([o.p,o.v,o.s]));
    const top=outer[outer.length-1],bot=outer[0],Tt=tangentUp(top.y),Tb=tangentUp(bot.y);
    for(let k=1;k<RR;k++){const th2=k/RR*Math.PI,c=top.p.clone().addScaledVector(top.n,-th/2);ring.push([c.addScaledVector(top.n,th/2*Math.cos(th2)).addScaledVector(Tt,0.004*Math.sin(th2)),1,top.s]);}
    for(let r=outer.length-1;r>=0;r--){const o=outer[r];ring.push([o.p.clone().addScaledVector(o.n,-th),o.v,o.s]);}
    for(let k=1;k<RR;k++){const th2=k/RR*Math.PI,c=bot.p.clone().addScaledVector(bot.n,-th/2);ring.push([c.addScaledVector(bot.n,-th/2*Math.cos(th2)).addScaledVector(Tb,-0.004*Math.sin(th2)),0,bot.s]);}
    per=ring.length;
    ring.forEach(([p,v,s])=>{P.push(p.x,p.y,p.z);UV.push(i/COLS,v);XY.push([s.x,s.y]);});
  }
  for(let i=0;i<COLS;i++)for(let r=0;r<per;r++){const i1=(i+1)%COLS,r1=(r+1)%per,A=i*per+r,B=i1*per+r,C=i*per+r1,D=i1*per+r1;I.push(A,C,D,A,D,B);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();
  // ensure outward winding
  {const nz=g.attributes.normal.getZ(Math.floor(COLS/4)*per+5);if(nz<0){const ix=g.index.array;for(let k=0;k<ix.length;k+=3){const tmp=ix[k+1];ix[k+1]=ix[k+2];ix[k+2]=tmp;}g.computeVertexNormals();}}
  return addGarmentGeo(g,XY,mat);
}
function braWire(mat){
  [-1,1].forEach(sx=>{const G=cupGeo(), pts=[];for(let k=0;k<=18;k++){const dx=-0.95+1.9*k/18, x=sx*(G.cx+dx*G.rx);
    const t=tW(x,G.cy),pr=braProfile(t);pts.push([x,pr.yWire+0.003,0.0095]);}
    tubeOnSurf(mat.userData.trim||mat,pts,0.0032,false,60);});
}
function braBow(mat){            // small satin bow at the centre gore
  const G=cupGeo(), pr=braProfile(Math.PI/2), y=pr.yTop+0.004, z=0.012, m=mat.userData.trim||mat;
  for(const sx of [-1,1]){const loop=[];for(let k=0;k<12;k++){const a=k/12*Math.PI*2;loop.push([sx*(0.016+0.014*Math.cos(a)),y+0.009*Math.sin(a),z]);}tubeOnSurf(m,loop,0.0028,true,30);
    tubeOnSurf(m,[[sx*0.004,y-0.002,z],[sx*0.012,y-0.016,z],[sx*0.016,y-0.026,z]],0.0025,false,10);}
  tubeOnSurf(m,[[0,y-0.004,z+0.002],[0,y+0.004,z+0.002]],0.0055,false,4);
}
// ---- elastic satin strap texture: sheen bands + edge stitching (u across, v along) ----
const STRAP_TEX=(()=>{const W=64,H=256,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  const gr=g.createLinearGradient(0,0,W,0);gr.addColorStop(0,'#b8b8b8');gr.addColorStop(0.12,'#f2f2f2');gr.addColorStop(0.5,'#ffffff');gr.addColorStop(0.88,'#f2f2f2');gr.addColorStop(1,'#b8b8b8');
  g.fillStyle=gr;g.fillRect(0,0,W,H);
  for(let y=0;y<H;y+=2){g.fillStyle=`rgba(0,0,0,${0.03+0.03*((y/2)%2)})`;g.fillRect(0,y,W,1);}           // fine elastic rib
  g.fillStyle='rgba(60,20,20,0.55)';for(let y=0;y<H;y+=16){g.fillRect(7,y,3,10);g.fillRect(W-10,y,3,10);} // edge stitching
  const map=new THREE.CanvasTexture(c);map.encoding=THREE.sRGBEncoding;map.wrapS=map.wrapT=THREE.RepeatWrapping;map.anisotropy=4;return map;})();
function strapMat(base){const m=new THREE.MeshPhysicalMaterial({color:base.color.clone(),map:STRAP_TEX,roughness:0.32,clearcoat:0.3,clearcoatRoughness:0.35,
  sheen:new THREE.Color().copy(base.color).multiplyScalar(0.8),sheenRoughness:0.35,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});return m;}
// thick strap from a 3D centreline: P (pts), Nn (outward normals), R (rest xy)
function thickStrap(mat,P,Nn,R,w,th){
  const curve=new THREE.CatmullRomCurve3(P),N=Math.max(40,P.length*6),V=[],UV=[],RR=[],I=[];let len=0,prev=null;
  const sec=[[-0.5,1],[0.5,1],[0.5,0],[-0.5,0]]; // across, up
  for(let k=0;k<=N;k++){const u=k/N,p=curve.getPoint(u),tg=curve.getTangent(u),f=u*(P.length-1),i0=Math.min(P.length-2,Math.floor(f)),a=f-i0;
    const no=Nn[i0].clone().lerp(Nn[i0+1],a);no.addScaledVector(tg,-no.dot(tg)).normalize();const b=new THREE.Vector3().crossVectors(tg,no).normalize();
    if(prev)len+=p.distanceTo(prev);prev=p.clone();const rx=R[i0][0]+(R[i0+1][0]-R[i0][0])*a,ry=R[i0][1]+(R[i0+1][1]-R[i0][1])*a;
    for(let s=0;s<5;s++){const [cx,cy]=sec[s%4];V.push(...p.clone().addScaledVector(b,cx*w).addScaledVector(no,cy*th).toArray());
      UV.push(s===0||s===4?0:s===1?1:s===2?1:0, len/(w*4));RR.push([rx,ry]);}
    if(k<N)for(let s=0;s<4;s++){const a0=k*5+s,a1=a0+1,b0=a0+5,b1=b0+1;I.push(a0,b0,a1,a1,b0,b1);}}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(V,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();
  const m=addGarmentGeo(g,RR,mat);return {curve,len,m};
}
// small hardware loop in the strap frame at curve param u
function hwLoop(mat,curve,Nfn,u,rest,hw,hh,r,lift){const p=curve.getPoint(u),tg=curve.getTangent(u),no=Nfn(u);no.addScaledVector(tg,-no.dot(tg)).normalize();
  const b=new THREE.Vector3().crossVectors(tg,no).normalize(),c=p.clone().addScaledVector(no,lift);
  const loop=[[-hw,-hh],[hw,-hh],[hw,hh],[-hw,hh]].map(([x,y])=>c.clone().addScaledVector(b,x).addScaledVector(tg,y));
  const g=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(loop,true,'catmullrom',0.05),24,r,6,true);
  return addGarmentGeo(g,new Array(g.attributes.position.count).fill(rest),mat);}
function braStraps(mat){
  const sw=BR.sw||0, W=0.024, TH=0.0028, sm=mat.userData.satin||(mat.userData.satin=strapMat(mat));sm.color.copy(mat.color);sm.sheen.copy(mat.color).multiplyScalar(0.8);
  const metal=mat.userData.metal||mat;
  [-1,1].forEach(sx=>{
    const G=cupGeo(), xs=Math.min(G.cx+G.rx*0.35,Wf(G.cy+G.ryU*0.45)*0.82);
    // anchor: the cup's outer neckline peak (same point braProfile uses), sitting on the cup's outer face
    const xA=sx*xs*1.03, tA=tW(xA,G.cy,1), prA=braProfile(tA), yA=prA.yTop-0.006, tAs=tW(xA,yA,1);
    const NA=normalAt(tAs,yA,0,new THREE.Vector3()), A=S(tAs,yA,0,new THREE.Vector3()).addScaledVector(NA,0.0065+0.012*(1-0.6*sw)*prA.cupC+0.002);
    const xsh=sx*(0.30+0.02*sw);let yTop=1.9;while(Wf(yTop+0.005)-0.01>Math.abs(xsh)&&yTop<2.4)yTop+=0.005;
    const off=0.0016-0.0007*sw; // tighter = digs in slightly
    const tB=tW(xsh,yTop-0.03,1), B=onSurf(tB,yTop-0.03,0,off);
    const P=[],Nn=[],R=[];const NF=24;
    for(let k=0;k<=NF;k++){const u=k/NF,x=xA+(xsh-xA)*u,y=yA+(yTop-0.03-yA)*u,t=tW(x,y,1);
      const n=normalAt(t,y,0,new THREE.Vector3()),ps=onSurf(t,y,0,off),pl=A.clone().lerp(B,u);
      // taut: the strap spans straight unless the skin pushes it outward
      const d=ps.clone().sub(pl).dot(n), q=pl.clone().addScaledVector(n,Math.max(0,d));if(k===0)q.copy(A);
      P.push(q);Nn.push(n);R.push([x,y]);}
    for(let it=0;it<4;it++)for(let k=1;k<NF;k++){const m=P[k-1].clone().add(P[k+1]).multiplyScalar(0.5);const n=Nn[k],dm=m.clone().sub(P[k]).dot(n);if(dm>0)P[k].addScaledVector(n,dm);} // relax kinks outward only (never into skin)
    // over the shoulder and down the back
    for(let k=1;k<=4;k++){const y=yTop-0.03+(0.02)*k/4,t=tW(xsh,y,1);P.push(onSurf(t,y,0,off));Nn.push(normalAt(t,y,0,new THREE.Vector3()));R.push([xsh,y]);}
    const yB=braProfile(tW(xsh,1.3,-1)).yTop-0.012;
    for(let k=0;k<=12;k++){const y=yTop-0.01-(yTop-0.01-yB)*k/12,t=tW(xsh,y,-1);P.push(onSurf(t,y,0,off));Nn.push(normalAt(t,y,0,new THREE.Vector3()));R.push([xsh,y]);}
    const {curve}=thickStrap(sm,P,Nn,R,W,TH);
    const Nfn=u=>{const f=u*(P.length-1),i=Math.min(P.length-2,Math.floor(f));return Nn[i].clone().lerp(Nn[i+1],f-i).normalize();};
    const uF=NF/(P.length-1);
    const restAt=u=>{const f=u*(P.length-1),i=Math.min(P.length-2,Math.floor(f));return R[i];};
    // slider ~55% up the front, ring just above the cup
    const uS=uF*0.55;hwLoop(metal,curve,Nfn,uS,restAt(uS),W*0.62,0.008,0.0022,TH+0.0015);
    {const p=curve.getPoint(uS),tg=curve.getTangent(uS),no=Nfn(uS),c=p.clone().addScaledVector(no,TH+0.0022);
     const g=new THREE.TubeGeometry(new THREE.LineCurve3(c.clone().addScaledVector(new THREE.Vector3().crossVectors(tg,no).normalize(),-W*0.6),c.clone().addScaledVector(new THREE.Vector3().crossVectors(tg,no).normalize(),W*0.6)),2,0.002,6,false);
     addGarmentGeo(g,new Array(g.attributes.position.count).fill(restAt(uS)),metal);}
    const uR=uF*0.07;{const p=curve.getPoint(uR),tg=curve.getTangent(uR),no=Nfn(uR);const g=new THREE.TorusGeometry(W*0.62,0.0024,6,24);
      const m=new THREE.Matrix4().makeBasis(new THREE.Vector3().crossVectors(tg,no).normalize(),tg,no.clone().normalize()).setPosition(p.clone().addScaledVector(no,TH+0.0012));g.applyMatrix4(m);
      addGarmentGeo(g,new Array(g.attributes.position.count).fill(restAt(uR)),metal);}
  });
}
function tubeOnSurf(mat,pts,r,closed,segs){
  const P3=pts.map(([x,y,off])=>{const t=tW(x,y,1);return onSurf(t,y,0,off);});
  const curve=new THREE.CatmullRomCurve3(P3,closed),seg=segs||(closed?24:6),rad=8;
  const g=new THREE.TubeGeometry(curve,seg,r,rad,closed),xy=[];
  for(let k=0;k<g.attributes.position.count;k++){const s=Math.floor(k/(rad+1))/seg*(pts.length-(closed?0:1)),i0=Math.min(pts.length-1,Math.floor(s))%pts.length;xy.push([pts[i0][0],pts[i0][1]]);}
  return addGarmentGeo(g,xy,mat);
}

