// ================= short upper thighs (separate meshes, top hidden inside the pelvis; torso cap = crotch/buttocks) =================
const _secC={};
function torsoSec(y,xi){const k=y.toFixed(3)+'_'+xi.toFixed(3);if(_secC[k])return _secC[k];const v=new THREE.Vector3(),P=[];
  for(let i=0;i<=160;i++){const t=-Math.PI/2+i/160*Math.PI;S(t,y,0,v);P.push([Math.max(xi,v.x),v.z]);}   // right half (front->side->back), clipped at the inner edge
  P.unshift([xi,P[0][1]]);P.push([xi,P[P.length-1][1]]);return _secC[k]=P;}
function rayHit(P,cx,cz,dx,dz){let best=null,bt=1e9;for(let i=0;i<P.length-1;i++){const [ax,az]=P[i],[bx,bz]=P[i+1],ex_=bx-ax,ez=bz-az,den=dx*ez-dz*ex_;if(Math.abs(den)<1e-9)continue;
  const tt=((ax-cx)*ez-(az-cz)*ex_)/den,u=((ax-cx)*dz-(az-cz)*dx)/den;if(tt>0&&u>=0&&u<=1&&tt<bt){bt=tt;best=[cx+dx*tt,cz+dz*tt];}}return best;}
const THIGH={yT:0.32,yCut:-0.44,NA:72,NR:56,NC:8};

// near the junction, copy the torso's own normals onto the thigh so the shading is continuous (no seam line)
function thighNormals(g){const p=g.attributes.position,n=g.attributes.normal,v=new THREE.Vector3(),q=new THREE.Vector3();
  for(let k=0;k<p.count;k++){const y=p.getY(k),w=ss(0.12,0.22,y);if(w<=0)continue;const x=p.getX(k),z=p.getZ(k);
    const t=tForX(x,y,z>-0.03?1:-1,0);normalAt(t,y,0,v);q.set(n.getX(k),n.getY(k),n.getZ(k)).lerp(v,w).normalize();n.setXYZ(k,q.x,q.y,q.z);}
  n.needsUpdate=true;}
function thighGeo(sx){
  const {yT,yCut,NA,NR,NC}=THIGH,P=[],UV=[],COL=[],I=[],tmp=new THREE.Vector3();
  const tint=[0.93,0.84,0.77].map(c=>c); // same multiplier as the body paint
  const outerAt=y=>{if(y>=0.12)return Math.abs(S(0,y,0,tmp).x)+0.004-0.012*ss(0.12,0.3,y);const o=Math.abs(S(0,0.12,0,tmp).x)+0.004,q=(0.12-y)/(0.12-yCut);return o-0.085*Math.pow(q,1.2)+0.008*Math.sin(q*Math.PI);}; // taper + gentle inward angle toward the knees
  const innerAt=y=>0.036-0.02*ss(0.0,yCut,y);   // crotch gap narrows lower down
  const ring=(y,shrink)=>{const xo=outerAt(y),xi=innerAt(y),cx=(xo+xi)/2,r=(xo-xi)/2,q=ss(yT,yCut,y);
    const yM=Math.max(y,0.1), zF=S(tForX(sx*cx,yM,1,0),yM,0,tmp).z, zB=S(tForX(sx*cx,yM,-1,0),yM,0,tmp).z, d=Math.max(0,0.1-y);
    const zc=0.5*(zF+zB), rzF=(zF-zc)+0.004-0.07*d-0.1*d*d, rzB=(zc-zB)+0.004-0.12*d-0.2*d*d, pts=[];
    // thigh = the torso's own hip cross-section (clipped at the inner edge), shrunk toward the thigh centre going down -> no ledge
    const sec=torsoSec(Math.max(y,Y_BOT+0.001),xi), q2=ss(0.16,yCut,y), f=1-0.2*Math.pow(q2,0.9), of=0.0008-0.007*ss(0.2,0.44,y);   // thigh emerges very gradually -> no visible junction line
    const ccx=xi+(Math.abs(S(0,Math.max(y,Y_BOT+0.001),0,tmp).x)-xi)*0.5, ccz=zc;
    for(let a=0;a<=NA;a++){const ph=a/NA*Math.PI*2,c=Math.cos(ph),s=Math.sin(ph);
      const h=rayHit(sec,ccx,ccz,c,s)||[ccx+c*0.3,ccz+s*0.3];let xx=(h[0]-ccx+of*c)*f, zz=(h[1]-ccz+of*s)*f;
      const X=xi+(h[0]+of*c-xi)*f;
      // lower down: a rounder thigh (superellipse: flatter outer, fuller inner-thigh volume)
      const w=ss(-0.3,0.06,y), n=c>0?2.05:2.25, Sx=cx+Math.sign(c)*Math.pow(Math.abs(c),2/n)*r, Sz=zc+Math.sign(s)*Math.pow(Math.abs(s),2/n)*(s>0?rzF*(1+0.06*Math.max(0,s)*Math.max(0,c*0.5+0.5)):rzB);   // front quad softness, slightly outer
      const gf=s<0?0.012*ex((y-0.11)/0.03)*(0.5-0.5*c)*(-s):0;   // gluteal fold: inner-back crease fading outward
      pts.push([Sx+(X-Sx)*w,Sz+(ccz+zz-Sz)*w+gf]);}
    for(let it=0;it<4;it++){const o=pts.map(p=>p.slice());for(let a=0;a<NA;a++){const p0=o[(a-1+NA)%NA],p1=o[(a+1)%NA];pts[a][0]=0.5*o[a][0]+0.25*(p0[0]+p1[0]);pts[a][1]=0.5*o[a][1]+0.25*(p0[1]+p1[1]);}pts[NA]=pts[0].slice();}
    const cX=pts.reduce((a,p)=>a+p[0],0)/pts.length,cZ=pts.reduce((a,p)=>a+p[1],0)/pts.length;
    return pts.map(([x,z],a)=>[sx*(cX+(x-cX)*shrink),cZ+(z-cZ)*shrink,a/NA*Math.PI*2]);
  };
  (THIGH.ring||(THIGH.ring={}))[sx]=ring;
  const rows=[];
  for(let j=0;j<=NR;j++){const y=yT+(yCut-yT)*j/NR;rows.push([y,1]);}
  for(let k=1;k<=NC;k++){const a=k/NC*Math.PI/2;rows.push([yCut-0.05*Math.sin(a),Math.cos(Math.min(a,Math.PI/2*0.985))]);}  // soft rounded cut
  rows.forEach(([y,sh],j)=>{const R=ring(y,sh);R.forEach(([x,z,ph])=>{P.push(x,y,z);
      UV.push(uvU(Math.atan2((z+0.03)/0.33,x/0.62)),Math.max(0.004,((y-Y_BOT)/(Y_TOP-Y_BOT)+0.06)/1.12));
      const c=Math.cos(ph)*1, inner=Math.max(0,-c), back=Math.max(0,-Math.sin(ph));
      let ao=1-0.26*ex((y-0.04)/0.09)*Math.max(inner,back*0.9)   // inguinal / inner-thigh / gluteal crease
               -0.10*inner*ss(-0.05,-0.3,y)                                    // inner thighs facing each other
               -0.14*ss(yCut+0.02,yCut-0.05,y);                                // soft fade at the cut
      COL.push(tint[0]*ao,tint[1]*ao,tint[2]*ao);});});
  const W=NA+1;for(let j=0;j<rows.length-1;j++)for(let a=0;a<NA;a++){const p=j*W+a,q=p+W;sx<0?I.push(p,q,p+1,p+1,q,q+1):I.push(p,p+1,q,p+1,q+1,q);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(P,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));
  g.setAttribute('color',new THREE.Float32BufferAttribute(COL,3));g.setIndex(I);g.computeVertexNormals();g.userData={base:Float32Array.from(P),sx};thighNormals(g);return g;}
const thighs=[-1,1].map(sx=>{const m=new THREE.Mesh(thighGeo(sx),bodyMat);m.castShadow=m.receiveShadow=true;body.add(m);return m;});
// level widening (curvier hips -> fuller thighs, zero at the junction) + a light damped jiggle
const THJ={p:0,v:0,L:0,dirty:true};
function thighPose(){const Lr=THJ.L/20,jp=THJ.p;
  thighs.forEach(m=>{const g=m.geometry,B=g.userData.base,sx=g.userData.sx,p=g.attributes.position.array;
    for(let k=0;k<B.length;k+=3){const x=B[k],y=B[k+1],z=B[k+2],wd=ss(0.2,-0.12,y),s=1+0.075*Lr*wd,cx=sx*0.33,cz=-0.03;
      const inner=ss(0.1,-0.1,(x-cx)*sx), wj=ss(0.15,-0.35,y)*(0.55+0.45*inner);
      p[k]=cx+(x-cx)*s+sx*0.006*jp*wj; p[k+1]=y+0.012*jp*wj; p[k+2]=cz+(z-cz)*(1+0.05*Lr*wd)+0.004*jp*wj;}
    g.attributes.position.needsUpdate=true;});}
function thighLevel(L){if(Math.abs(L-THJ.L)<1e-4)return;THJ.L=L;thighPose();thighs.forEach(m=>{m.geometry.computeVertexNormals();thighNormals(m.geometry);});}
function thighKick(a){THJ.v+=a;}
function thighStep(dt){dt=Math.min(dt,1/30);if(Math.abs(THJ.p)<1e-4&&Math.abs(THJ.v)<1e-4){if(THJ.p!==0){THJ.p=0;THJ.v=0;thighPose();}return;}
  THJ.v+=(-150*THJ.p-6*THJ.v)*dt;THJ.p+=THJ.v*dt;thighPose();}

// soft key-light shadow: chest casts a crescent onto ribcage/upper stomach (tight frustum, 1024, PCFSoft)
renderer.shadowMap.enabled=true; renderer.shadowMap.type=THREE.PCFShadowMap; // PCF honours radius in r128 -> softer, warm-filled edge
light.castShadow=true; light.shadow.mapSize.set(QUALITY.shadow,QUALITY.shadow); light.shadow.radius=7;
Object.assign(light.shadow.camera,{left:-0.85,right:0.85,top:0.8,bottom:-0.8,near:1.5,far:6.5});
light.target.position.set(0,1.45,0); scene.add(light.target); light.shadow.camera.updateProjectionMatrix();
light.shadow.bias=-0.002; light.shadow.normalBias=0.03;
body.castShadow=body.receiveShadow=true;
// body: only the front chest region changes with level
const bodyTV=[];for(let j=0;j<=BV;j++)for(let i=0;i<BU;i++)bodyTV.push([tOf(i),vOf(j)]);
const bodyBase=Float32Array.from(bodyGeo.attributes.position.array), bodyRegion=[];
for(let i=0;i<bodyTV.length;i++){const y=bodyBase[i*3+1],z=bodyBase[i*3+2]-Zc(y);if(z>-0.28&&y>0.8&&y<2.25)bodyRegion.push(i);}
// flat chest wall (no breasts) -> jiggle/drag weight = distance off the wall in the current shape
const bodyWall=Float32Array.from(bodyBase);
withBR({h:0,sw:0},()=>{const p=new THREE.Vector3();for(const i of bodyRegion){const [t,v]=bodyTV[i];SP(t,v,0,p);bodyWall[i*3]=p.x;bodyWall[i*3+1]=p.y;bodyWall[i*3+2]=p.z;}});
const bodyShape=L=>{if(L===0)return {pos:bodyBase,xy:bodyRest};const pos=Float32Array.from(bodyBase),xy=bodyRest.slice(),p=new THREE.Vector3();
  withBR(brL(L),()=>{for(const i of bodyRegion){const [t,v]=bodyTV[i];SP(t,v,0,p);pos[i*3]=p.x;pos[i*3+1]=p.y;pos[i*3+2]=p.z;xy[i]=[p.x,p.y];}});
  return {pos,xy};};
const bodyDef=registerDeform(bodyGeo,bodyShape,bodyRegion,bodyWall);
// warm the level cache in idle time so level-ups never hitch
{let L=1;const warm=()=>{if(L>LV_MAX)return;bodyDef.shape(L++);setTimeout(warm,30);};setTimeout(warm,800);}
// nipples: small bumps riding the deformed surface
const nippleMat=new THREE.MeshStandardMaterial({color:new THREE.Color(0x7c4334).convertSRGBToLinear(),roughness:0.7});
const nipGeo=new THREE.SphereGeometry(0.016,16,12); nipGeo.scale(1,1,0.6);
const nipples=NIP.map(n=>{const t=tForX(n.x,n.y,1,0);const p=S(t,n.y,0);
  let best=0,bd=1e9;const pa=bodyGeo.attributes.position.array;for(let i=0;i<pa.length/3;i++){const d=(pa[i*3]-p.x)**2+(pa[i*3+1]-p.y)**2+(pa[i*3+2]-p.z)**2;if(d<bd){bd=d;best=i;}}
  const m=new THREE.Mesh(nipGeo,nippleMat);body.add(m);return {m,i:best};});
const leftNipple=nipples[0].m, rightNipple=nipples[1].m;
function placeNipples(){const pa=bodyGeo.attributes.position, na=bodyGeo.attributes.normal;
  nipples.forEach(n=>{const p=new THREE.Vector3().fromBufferAttribute(pa,n.i), no=new THREE.Vector3().fromBufferAttribute(na,n.i);
    n.m.position.copy(p).addScaledVector(no,0.004); n.m.quaternion.setFromUnitVectors(new THREE.Vector3(0,0,1),no);});}
placeNipples();
// chest pseudo-objects used by springs / hit test
const leftBreast={name:'L',sx:-1}, rightBreast={name:'R',sx:1};

