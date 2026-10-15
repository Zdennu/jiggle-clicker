// ================= lace panties v2 (ref: low-rise V-front lace brief) =================
// narrow lace side bands sweeping to high points over the hip bones, a low V at the centre front, wide eyelash-scalloped
// lace borders on the top edge and the high-cut leg openings, a sheer mesh centre panel with sparse florals, a satin bow
// at the V and an opaque gusset only underneath. Built on the body surface (wall coordinates for jiggle weights).

const GUSSET_FADE=(()=>{const c=document.createElement('canvas');c.width=4;c.height=128;const g=c.getContext('2d'),gr=g.createLinearGradient(0,0,0,128);
  gr.addColorStop(0,'#000');gr.addColorStop(0.1,'#fff');gr.addColorStop(0.9,'#fff');gr.addColorStop(1,'#666');g.fillStyle=gr;g.fillRect(0,0,4,128);return new THREE.CanvasTexture(c);})();   // soft top edge (no seam line)
const PL={PX:2000};                                      // lace pixels per world unit (same scale as the bra lace)
function plK(t){return ss(-0.35,0.35,Math.sin(t));}       // 1 front, 0 back
function plTop(t){const c=Math.abs(Math.cos(t)),k=plK(t);return k*(0.45+0.17*Math.pow(c,1.1))+(1-k)*(0.5+0.12*c);}          // V front, high at the hips
function plLeg(t){const c=Math.abs(Math.cos(t)),k=plK(t),side=plTop(t)-0.09;                                                // ~3.5 cm side band
  const f=k*Math.pow(ss(0.07,0.97,c),0.5)+(1-k)*Math.pow(ss(0.06,0.95,c),0.9);return Y_BOT+(side-Y_BOT)*f;}
function plGrid(mat,COLS,ROWS,yAt,offAt,uvAt,keepCol){ // grid over the torso ring: yAt(t,s) s:0..1 rows
  const P=[],R=[],UV=[],I=[],v=new THREE.Vector3(),n=new THREE.Vector3(),ts=[];for(let i=0;i<=COLS;i++)ts.push(i/COLS*2*Math.PI);
  const G=ts.map(t=>{const col=[];for(let j=0;j<=ROWS;j++){const y=yAt(t,j/ROWS),p=S(t,y,0,v).clone();normalAt(t,y,0,n);p.addScaledVector(n,offAt(t,j/ROWS));col.push([p,y]);}return col;});
  const arcU=[0];for(let i=1;i<=COLS;i++)arcU.push(arcU[i-1]+G[i][0][0].distanceTo(G[i-1][0][0]));
  for(let j=0;j<=ROWS;j++)for(let i=0;i<=COLS;i++){const [p,y]=G[i][j];P.push(p.x,p.y,p.z);const r=withBR({h:0,sw:0},()=>S(ts[i],y,0,v));R.push([r.x,r.y]);
    let al=0;for(let q=1;q<=j;q++)al+=G[i][q][0].distanceTo(G[i][q-1][0]);UV.push(...uvAt(arcU[i],al,j/ROWS));}
  const C=COLS+1;for(let j=0;j<ROWS;j++)for(let i=0;i<COLS;i++){if(keepCol&&!keepCol(ts[i]))continue;const a=j*C+i,b=a+1,c=a+C,d=c+1;I.push(a,b,c,b,d,c);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));g.setIndex(I);g.computeVertexNormals();
  return addGarmentGeo(g,R,mat);}
function pantyV2(m){
  const col=m.color, lace=m.userData.pl||(m.userData.pl=braMaterial(0xffffff));lace.color.copy(col);lace.sheen.copy(col).multiplyScalar(0.6);
  const mesh=m.userData.pm||(m.userData.pm=new THREE.MeshPhysicalMaterial({map:PMESH.map,alphaMap:PMESH.alpha,transparent:true,depthWrite:false,roughness:0.5,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  mesh.color.copy(col);mesh.sheen=new THREE.Color().copy(col).multiplyScalar(0.5);
  const lin=m.userData.plin||(m.userData.plin=new THREE.MeshPhysicalMaterial({roughness:0.55,side:THREE.DoubleSide,alphaMap:GUSSET_FADE,transparent:true,depthWrite:false}));lin.color.copy(col).multiplyScalar(0.8).add(new THREE.Color(0.03,0.012,0.008));
  const press=t=>0.0022*Math.pow(Math.abs(Math.cos(t)),3);                 // side bands hug and press in slightly at the hips
  const BW=0.075, K=PL.PX/512, KU=2700/(2048*3), KV=2700/1024;   // wider, denser scalloped borders
  // sheer centre panels (front + back), between the borders
  plGrid(mesh,300,30,(t,s)=>{const a=plTop(t)-0.02,b=Math.max(Y_BOT+0.002,plLeg(t)+0.02*ss(0.1,0.3,Math.abs(Math.cos(t))));return a+(b-a)*s;},t=>0.0055-press(t),(u,al)=>[u*K,-al*K]);
  // top border: scallops point up
  plGrid(lace,300,8,(t,s)=>plTop(t)-BW*s,t=>0.0075-press(t),(u,al)=>[u*KU,0.955-al*KV]);
  // leg borders: scallops point down/out; fade out where they reach the gusset
  plGrid(lace,300,8,(t,s)=>{const c=Math.abs(Math.cos(t)),w=BW*ss(0.015,0.1,c);return plLeg(t)+w*s+0.0015;},t=>0.0075-press(t),(u,al)=>[u*KU,0.955-al*KV],t=>Math.abs(Math.cos(t))>0.012);
  // gusset: opaque, only underneath (front crotch edge -> around the bottom -> back)
  {const tc=Math.acos(0.075),xg=0.072,NX=20,NY=24,P=[],R=[],I=[],v=new THREE.Vector3(),n=new THREE.Vector3();
   for(let j=0;j<=NY;j++){const s=j/NY;for(let i=0;i<=NX;i++){const up=s<0.12,x=(-xg+2*xg*i/NX)*(up?1+0.6*(1-s/0.12):1),front=s<0.5,yU=Y_BOT+0.045*(1-s/0.12),t=tForX(x,up?yU:Y_BOT+0.001,front?1:-1,0),vv=up?0:-0.06*(front?(s-0.12)/0.38:(1-s)/0.5)*0.985;
       const p=up?S(t,yU,0,v).clone():SP(t,vv,0,v).clone();const pc=SP(t,Math.min(-0.0005,vv),0,new THREE.Vector3()),pd=SP(t,vv-0.004,0,new THREE.Vector3());
       const o=new THREE.Vector3(p.x*0.4,-1,p.z-(-0.03)).normalize();p.addScaledVector(o,0.005);P.push(p.x,p.y,p.z);R.push([p.x,Y_BOT]);}}
   for(let j=0;j<NY;j++)for(let i=0;i<NX;i++){const a=j*(NX+1)+i,b=a+1,c=a+NX+1,d=c+1;I.push(a,b,c,b,d,c);}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setIndex(I);g.computeVertexNormals();const UVl=[];for(let j=0;j<=NY;j++)for(let i=0;i<=NX;i++)UVl.push(i/NX,j/NY);g.setAttribute('uv',new THREE.Float32BufferAttribute(UVl,2));addGarmentGeo(g,R,lin).renderOrder=1;
   const UVg=[];for(let j=0;j<=NY;j++)for(let i=0;i<=NX;i++)UVg.push(i/NX*xg*2*K,-j/NY*0.3*K);const g2=g.clone();g2.setAttribute('uv',new THREE.Float32BufferAttribute(UVg,2));addGarmentGeo(g2,R,mesh).renderOrder=2;}   // same tulle over the gusset -> one continuous fabric
  // small flat folded satin bow at the V (two flattened loops, knot, two tails), laid on the surface
  {const bowM=m.userData.pbow||(m.userData.pbow=new THREE.MeshPhysicalMaterial({color:new THREE.Color(0xe77aa6).convertSRGBToLinear(),roughness:0.32,clearcoat:0.35,side:THREE.DoubleSide}));
   const y=plTop(Math.PI/2)-0.014,t=tW(0,y,1),P0=onSurf(t,y,0,0.009),N0=normalAt(t,y,0,new THREE.Vector3());
   const base=new THREE.Matrix4().lookAt(new THREE.Vector3(),N0.clone().negate(),new THREE.Vector3(0,1,0)).setPosition(P0);
   const part=(geo,x,yy,rz,sx,sy,sz)=>{geo.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(x,yy,0),new THREE.Quaternion().setFromEuler(new THREE.Euler(0,0,rz)),new THREE.Vector3(sx,sy,sz)));geo.applyMatrix4(base);
     addGarmentGeo(geo,new Array(geo.attributes.position.count).fill([0,y]),bowM);};
   for(const sx of [-1,1]){part(new THREE.SphereGeometry(1,20,12),sx*0.021,0.002,sx*0.22,0.021,0.012,0.0035);         // folded loops
     part(new THREE.BoxGeometry(1,1,1),sx*0.008,-0.019,sx*0.35,0.007,0.026,0.0018);}                                    // tails
   part(new THREE.SphereGeometry(1,14,10),0,0,0,0.0065,0.008,0.0045);}                                                    // knot
}

