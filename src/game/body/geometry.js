// ================= Sculpted torso: one parametric surface =================
// Monotone cubic interpolation of key profiles (no overshoot)
function mono(xs, ys){
  const n=xs.length, d=[], m=new Array(n);
  for(let i=0;i<n-1;i++) d.push((ys[i+1]-ys[i])/(xs[i+1]-xs[i]));
  m[0]=d[0]; m[n-1]=d[n-2];
  for(let i=1;i<n-1;i++) m[i]=(d[i-1]*d[i]<=0)?0:(d[i-1]+d[i])/2;
  for(let i=0;i<n-1;i++){ if(d[i]===0){m[i]=m[i+1]=0;continue;} const a=m[i]/d[i],b=m[i+1]/d[i],s=a*a+b*b; if(s>9){const t=3/Math.sqrt(s);m[i]=t*a*d[i];m[i+1]=t*b*d[i];} }
  return y=>{ if(y<=xs[0])return ys[0]; if(y>=xs[n-1])return ys[n-1];
    let i=0; while(y>xs[i+1])i++; const h=xs[i+1]-xs[i], t=(y-xs[i])/h, t2=t*t, t3=t2*t;
    return (2*t3-3*t2+1)*ys[i]+(t3-2*t2+t)*h*m[i]+(-2*t3+3*t2)*ys[i+1]+(t3-t2)*h*m[i+1]; };
}
const KY = [-0.85,-0.5,-0.22,0.00, 0.22, 0.45, 0.70, 0.88, 1.08, 1.30, 1.52, 1.72, 1.88, 1.98, 2.06, 2.15, 2.24, 2.45];
const Wf = mono(KY, [0.47,0.52,0.585,0.63, 0.665,0.60, 0.48, 0.435,0.46, 0.53, 0.575,0.60, 0.635,0.62, 0.52, 0.33, 0.215,0.20]); // half width
const Ff = mono(KY, [0.22,0.25,0.29,0.31, 0.33, 0.31, 0.27, 0.255,0.26, 0.285,0.30, 0.30, 0.27, 0.235,0.19, 0.15, 0.135,0.13]); // front depth
const Bf = mono(KY, [0.24,0.28,0.34,0.37, 0.39, 0.30, 0.235,0.215,0.235,0.265,0.275,0.27, 0.255,0.22, 0.17, 0.135,0.125,0.12]); // back depth
const Zc = mono(KY, [-0.03,-0.03,-0.03,-0.03,-0.03,-0.01,0.0, 0.0, 0.0, 0.0, 0.0, 0.0, -0.01,-0.015,-0.025,-0.035,-0.035,-0.035]); // centre line z
const ss=(a,b,x)=>{const t=Math.min(1,Math.max(0,(x-a)/(b-a)));return t*t*(3-2*t);};
const ex=(v)=>Math.exp(-v*v);
const Y_BOT=0.17, Y_TOP=2.45;
// Breasts
const BR={sw:0,sR:0.3,sC:0.1,sX:0.25,sY:1.45,cx:0.205, cy:1.52, rx:0.25, ryU:0.4, ryD:0.21, h:0.1, st:0, sag:0.1, comp:0, rxIn:0.17, up:0};
function breastR(x,y,sx){ // normalized radius in footprint
  const dxs=(x-sx*BR.cx)*sx, dy=(y-BR.cy)/(y>BR.cy?BR.ryU:BR.ryD);
  if(dxs>=0){const dx=dxs/BR.rx;return Math.sqrt(dx*dx+dy*dy);}
  if(!BR.comp){const dx=dxs/BR.rxIn;return Math.sqrt(dx*dx+dy*dy);}
  // inner side under compression: shorter reach + flatter (superelliptic) wall where the sides meet
  const dx=-dxs/BR.rxIn, pw=2+2.5*BR.comp; return Math.sqrt(Math.pow(dx,pw)+dy*dy);
}
// One footprint, one profile family: BR.st (0 = realistic, 1 = anime) blends a soft, wide falloff into a fuller,
// rounder dome by changing the exponent smoothly (no second shape -> no blend seams). Upper pole always slopes softly.
function breastH(x,y,sx){const r=breastR(x,y,sx); if(r>=1)return 0; const q=1-r*r, st=BR.st||0;
  const dn=(y-BR.cy)/(y>BR.cy?BR.ryU:BR.ryD), up=ss(-0.55,0.85,dn);
  const eLow=1.55+(0.85-1.55)*st, eUp=1.9+(1.2-1.9)*st, e=eLow+(eUp-eLow)*up;   // lower/outer round, upper long slope
  const edge=Math.sqrt(ss(0,0.6-0.1*st,q));                                       // C1 merge into the chest wall
  return BR.h*Math.pow(q,e)*edge*(1+0.12*st*ss(0.2,-0.7,dn)*q);}                   // heavier underside when big
function smax(a,b,k){const h=Math.max(0,Math.min(1,0.5+0.5*(a-b)/k));return b+(a-b)*h+k*h*(1-h)*0.5;}
function breastW(x,y,sx){const r=breastR(x,y,sx); if(r>=1)return 0; const q=1-r*r; return q*q;}
// mode: 0 skin, 1 fabric bridged across cleavage
let yBodyInv0=0.2, FLAT=false;   // FLAT: evaluate the bare chest wall (for garment jiggle weights)
const TSH=0.15, yBody=yo=>yo-TSH*0.05*Math.log1p(Math.exp((1.3-yo)/0.05));   // torso ~13% shorter below the underbust (smooth remap)
function S(t,yo,mode,out){
  out=out||new THREE.Vector3(); const y=yBody(yo);
  const c=Math.cos(t), s=Math.sin(t), front=s>0;
  const W=Wf(y), D=front?Ff(y):Bf(y);
  const nx=2/2.25, nz=2/(front?2.2:2.7);
  let x=W*Math.sign(c)*Math.pow(Math.abs(c),nx);
  let z=D*Math.sign(s)*Math.pow(Math.abs(s),nz);
  const ax=Math.abs(x);
  let dz=0, dx=0;
  if(front){
    const f=Math.pow(s,1.5), dk=mode===1?0.25:1;
    // clavicles rising toward the shoulders, sternal notch, ribcage/abdomen softness, navel
    const yc=2.0+0.07*ss(0,0.42,ax);
    dz+=dk*0.016*ex((y-yc)/0.028)*ss(0.05,0.12,ax)*(1-ss(0.34,0.46,ax))*f;
    dz-=dk*0.022*ex(x/0.06)*ex((y-2.035)/0.05);
    dz+=0.012*ex((y-0.55)/0.18)*ex(x/0.3);          // lower belly
    dz-=dk*0.010*ex(x/0.022)*ex((y-0.72)/0.022);       // navel (≈ iliac-crest level, 2/5 up from crotch)
    dz-=dk*0.005*ex(x/0.028)*ss(0.75,1.0,y)*(1-ss(1.25,1.4,y)); // abdominal midline
    for(const sx of [-1,1]){
      const nx=sx*(0.035+(y-2.05)*0.42); dz+=dk*0.0045*ex((x-nx)/0.026)*ss(2.06,2.14,y)*(1-ss(2.36,2.44,y)); // neck tendons (SCM)
      dz+=dk*0.005*ex((x-sx*0.40)/0.06)*ex((y-0.42)/0.06);                   // hip bones
      for(let r=0;r<3;r++)dz+=dk*0.0012*ex((y-(1.12+r*0.075+Math.abs(x)*0.12))/0.02)*ss(0.26,0.36,Math.abs(x))*(1-ss(0.5,0.58,Math.abs(x))); // rib hints
      dz-=dk*0.003*ex((x-sx*0.43)/0.06)*ex((y-0.7)/0.12);                     // waist / oblique groove
    }
  } else {
    const f=Math.pow(-s,1.5);
    dz-=(mode===1?0.3:1)*0.014*ex(x/0.045)*ss(0.45,0.7,y)*(1-ss(1.8,2.0,y))*f;     // spine groove
    for(const sx of [-1,1]) dz+=0.016*ex((x-sx*0.27)/0.14)*ex((y-1.68)/0.17)*f; // shoulder blades
    dz-=0.018*ex(x/0.035)*(1-ss(0.06,0.3,y))*f;                     // gluteal cleft (soft)
    for(const sx of [-1,1])dz-=0.011*ex((x-sx*0.095)/0.025)*ex((y-0.42)/0.025)*f; // back dimples
    for(const sx of [-1,1])dz+=0.008*ex((x-sx*0.12)/0.05)*ss(0.5,0.8,y)*(1-ss(1.3,1.6,y))*f; // erector muscles beside the spine
    dz+=0.02*ex((y-0.18)/0.16)*(ex((x-0.24)/0.22)+ex((x+0.24)/0.22))*0.5*f; // glutes
  }
  // breast mounds: footprint measured along the chest wall (front x, then wrapping round the side toward the
  // mid-axillary line), displaced along the wall normal so lateral growth bulges past the torso silhouette
  let bh=0;{
    let ang=(t-Math.PI/2)%(2*Math.PI);if(ang<0)ang+=2*Math.PI;if(ang>Math.PI)ang=2*Math.PI-ang;
    const xu=Math.sign(c)*(ang<=Math.PI/2?Math.abs(x):W+(ang-Math.PI/2)*Bf(y));
    let hb=0;const hs=[];
    for(const sx of [-1,1]){
      const inner=sx*xu<BR.cx, xe=(mode===1&&inner)?sx*BR.cx:xu;
      const h=(mode===1&&y<BR.cy)?(()=>{const bl=ss(BR.cy,BR.cy-0.1,y);return smax(breastH(xe,y,sx)+0.004*bl,breastH(xe,BR.cy,sx)*Math.pow(ss(BR.cy-BR.ryD*2.2,BR.cy,y),1.2),0.05*bl+1e-4);})():breastH(xe,y,sx);
      if(mode===1)hb=Math.max(hb,h); else hs.push(h);
    }
    bh=mode===1?hb:smax(hs[0],hs[1],0.025);
  }
  const x0=x, z0=z;
  if(mode===0)bh*=1-(BR.sw||0);
  if(FLAT)bh=0;
  if(bh>0){const Dd=front?Ff(y):Bf(y);let nx=x/(W*W),nz=z/(Dd*Dd);const l=Math.hypot(nx,nz)||1;nx/=l;nz/=l;
    // blend toward pure forward push near the centre line (keeps the cleavage valley well-behaved)
    const fw=1-ss(0.1,0.45,Math.abs(x)/W);nx*=1-fw;nz=nz*(1-fw)+fw;const l2=Math.hypot(nx,nz);x+=nx/l2*bh;z+=nz/l2*bh;}
  // big sizes: wrap the chest patch onto two real spheres (overhanging bottom/sides, narrow base) and blend
  // positions from the height-field shape (realistic, low levels) to the sphere shape (balloon, level 20)
  let oyS=null;
  if(!FLAT&&mode===0&&BR.sw>0&&Math.sin(t)>-0.35){
    let ang=(t-Math.PI/2)%(2*Math.PI);if(ang<0)ang+=2*Math.PI;if(ang>Math.PI)ang=2*Math.PI-ang;
    const xu=Math.sign(c)*(ang<=Math.PI/2?Math.abs(x0):W+(ang-Math.PI/2)*Bf(y));
    const sx=xu<0?-1:1, Rr=BR.sR, cc=BR.sC, scx=BR.sX, scy=BR.sY;
    const dxu=xu-sx*0.229, dyu=y-1.48, d=Math.hypot(dxu,dyu);   // anchored at the (static) nipple point
    const up0=Math.max(0,d>1e-6?dyu/d:0), thM=Math.acos(-cc/Rr)*(1-0.42*up0*up0), rb=Rr*Math.sin(Math.acos(-cc/Rr)), D1=rb*0.9, D2=rb*(1.8+1.1*up0*up0);   // upper pole: ring sits higher on the ball and slopes long into the chest
    if(d<D2){
      // chest-wall depth under the sphere centre
      const Wc=Wf(scy), Dc=Ff(scy), cq=Math.min(0.999,Math.pow(Math.min(1,scx/Wc),1.125)), zw=Dc*Math.pow(Math.sqrt(1-cq*cq),0.909);
      const C=[sx*scx, scy, zw+cc];
      const ax=[0.12*sx,-0.22,1], al=Math.hypot(...ax); ax[0]/=al;ax[1]/=al;ax[2]/=al;       // gaze: slightly out and down
      let e1=[1,0,-ax[0]/ax[2]]; const l1=Math.hypot(...e1); e1=e1.map(v=>v/l1);
      const e2=[ax[1]*e1[2]-ax[2]*e1[1], ax[2]*e1[0]-ax[0]*e1[2], ax[0]*e1[1]-ax[1]*e1[0]];
      const ux=d>1e-6?dxu/d:0, uy=d>1e-6?dyu/d:0;
      let P;
      if(d<D1){const q=d/D1, th=thM*(q*(0.6+0.4*q)), st=Math.sin(th), ct=Math.cos(th);
        P=[0,1,2].map(k=>C[k]+Rr*(st*(ux*e1[k]+uy*e2[k])+ct*ax[k]));}
      else {const s1=(d-D1)/(D2-D1), sm=s1*s1*(3-2*s1), st=Math.sin(thM), ct=Math.cos(thM);
        const ring=[0,1,2].map(k=>C[k]+Rr*(st*(ux*e1[k]+uy*e2[k])+ct*ax[k]));
        const wall=[x0,y,z0];
        P=[0,1,2].map(k=>ring[k]+(wall[k]-ring[k])*sm);
        P[2]+=0.08*Rr*Math.sin(Math.PI*s1)*(1-s1);}                  // soft fillet bulge in the crease
      {const ly=(P[1]-C[1])/Rr, lo=Math.max(0,-ly), lx=(P[0]-C[0])*sx/Rr, fr=Math.max(0,(P[2]-C[2])/Rr);
       P[1]-=0.07*Rr*lo*lo*fr; P[2]+=0.03*Rr*lo*(1-lo)*fr;            // gravity: fuller, rounder lower pole
       P[1]+=0.035*Rr*Math.max(0,ly)*fr; P[2]-=0.04*Rr*Math.max(0,ly)*Math.max(0,ly)*fr;   // upper pole slopes flatter
       P[0]+=sx*0.025*Rr*Math.max(0,lx)*lo;}                          // slight outer-lower fullness
      {const k=0.02, v=sx*P[0], pen=Math.max(0,0.03-v);                     // squish: inner side flattens on the midline,
       P[0]=sx*k*Math.log1p(Math.exp(v/k));                                     // displaced volume bulges up and forward
       P[1]+=0.45*pen*ss(-0.6,0.4,uy); P[2]+=0.35*pen;}   // soft press at the midline (smooth, never crosses)
      const w=BR.sw*(1-ss(D2*0.85,D2,d))*(1-ss(1.45,1.8,y)*(1-ss(0.02,0.3,Math.abs(xu))));   // sternum above the cleavage stays chest wall
      x+= (P[0]-x)*w; z+=(P[2]-z)*w; oyS=(P[1]-y)*w; dz*=1-w;
    }
  }
  // deltoid rounding on the sides
  const side=Math.abs(c);
  x+=Math.sign(c)*0.02*ex((y-1.9)/0.1)*Math.pow(side,3);
  // legs: below the hips the cross-section pinches at the centre (front and back) into two thighs with a slight gap
  // legs: two thighs branching from the pelvis. Below the crotch the cross-section pinches to a zero-width web at the
  // centre, the web retracts up into a rounded crotch arch, and the thighs are pushed apart to leave a real gap.
  let oy=yo+(oyS||0);
  if(false){const g=ss(0.06,-0.2,y), xx=x+dx, a=Math.abs(xx);
    z*=1-g*0.995*ex(xx/0.075); dz*=1-g*ex(xx/0.09);                      // round inner thighs meeting at a web
    dx+=g*Math.sign(xx)*0.085*(1-ss(0,0.35,a));                            // thighs separate: ~0.12 gap
    const c=1-ss(0.015,0.12,a);                                              // web columns retract to the crotch arch
    const yArch=yo+(yBodyInv0-yo)*c; oy=Math.max(yo,yArch);}
  out.set(x+dx, oy, z+Math.sign(s)*dz+Zc(y));
  return out;
}
// cap rows: rounded closure at both ends
function SP(t,v,mode,out){ // v in [-1, 1+]: v<0 bottom cap, v>1 top cap; else y=lerp
  if(v>=0&&v<=1) return S(t,Y_BOT+(Y_TOP-Y_BOT)*v,mode,out);
  const top=v>1, phi=(top?v-1:-v)*Math.PI/2/0.06; // cap spans 0.06 in v
  const yE=top?Y_TOP:Y_BOT; out=S(t,yE,mode,out);
  const k=Math.cos(Math.min(phi,Math.PI/2*0.985)), cz=Zc(yE);
  out.x*=k; out.z=cz+(out.z-cz)*k; out.y=yE+(top?1:-1)*(top?0.04:0.13)*Math.sin(Math.min(phi,Math.PI/2));
  return out;
}
const _a=new THREE.Vector3(),_b=new THREE.Vector3(),_c=new THREE.Vector3(),_d=new THREE.Vector3();
function normalAt(t,y,mode,out){
  const e=1e-3; S(t+e,y,mode,_a);S(t-e,y,mode,_b);_a.sub(_b);
  S(t,y+e,mode,_c);S(t,y-e,mode,_d);_c.sub(_d);
  out=(out||new THREE.Vector3()).crossVectors(_c,_a).normalize();
  S(t,y,mode,_b); if(out.x*_b.x+out.z*(_b.z-Zc(y))<0) out.negate();
  return out;
}
// find t on the front (sgn=1) or back (sgn=-1) whose x matches
function tForX(x,y,sgn,mode){
  let lo=sgn>0?0.0001:Math.PI+0.0001, hi=sgn>0?Math.PI-0.0001:2*Math.PI-0.0001;
  for(let i=0;i<40;i++){const m=(lo+hi)/2, px=S(m,y,mode,_a).x; if((sgn>0?px>x:px<x))lo=m;else hi=m;}
  return (lo+hi)/2;
}

// Jiggle bookkeeping for any mesh built on the surface
const deformables=[]; // {geo, rest:Float32Array, idx:[], wL:[], wR:[]}
const BR0=Object.assign({},BR), F_MAX=Math.pow(LV_STEP,LV_MAX);
Object.assign(BR,brFor(1));   // base mesh is built at the (new) level-0 size
function brFor(F){const L=Math.log(F)/Math.log(LV_STEP);
  // Anatomy: vertical footprint (2nd-6th rib) stays nearly fixed; growth widens the base, mostly laterally toward
  // the mid-axillary line, adds projection and fills the upper pole. Sag/nipple drop kept minimal.
  // Level 0/1 starts at the old level-10 size; growth to L20 is huge anime scale, mostly projection + roundness.
  // All terms are smooth polynomials/smoothsteps in L -> no jumps between levels.
  const u=Math.max(0,L)/LV_MAX, u2=u*u;
  const st=0.55+0.45*ss(0,0.6,u);                                     // profile: semi-real -> fully round
  const b={cx:0.209+0.03*u, cy:BR0.cy-0.02-0.04*u, rx:0.265*(1+0.3*u+0.15*u2), h:0.225*(1+0.6*u+0.5*u2), sag:BR0.sag, up:0, st};
  b.ryU=0.45*(1+0.2*u+0.1*u2); b.ryD=0.256*(1+0.5*u+0.3*u2);
  b.rxIn=Math.min(b.rx, b.cx-(0.05-0.055*st)-0.03*u);                  // inner sides meet and press past the midline
  b.sw=0.88*ss(0.15,0.95,u); b.sR=0.24+0.13*u; b.sC=0.11+0.1*u; b.sX=0.215+0.075*u; b.sY=1.47-0.06*u;   // sphere target
  b.comp=0.4*ss(0.3,0.9,u);
  return b;}
function withBR(o,cb){const keep=Object.assign({},BR);Object.assign(BR,o);try{return cb();}finally{Object.assign(BR,keep);}}
function wts(pos,xy){const L=new Float32Array(xy.length),R=new Float32Array(xy.length);
  for(let i=0;i<xy.length;i++){if(pos[i*3+2]<=0)continue;const [x,y]=xy[i];L[i]=breastW(x,y,-1);R[i]=breastW(x,y,1);}return [L,R];}
const brL=L=>brFor(Math.pow(LV_STEP,L));
// Exact per-level shapes (same topology), computed lazily + cached; fractional levels lerp adjacent shapes.
// getShape(L) -> {pos:Float32Array, xy:[[x,y]...]} ; diff = vertex indices that may change with level (null = all)
function registerDeform(geo, getShape, diff, wall, wallFn){
  const base=geo.attributes.position.array, n=base.length/3, idx=[];
  for(let i=0;i<n;i++){const y=base[i*3+1],z=base[i*3+2];if(z>0&&y>0.75&&y<2.25)idx.push(i);}
  const rec={geo,wall,wallFn,rest:Float32Array.from(base),idx,wL:new Float32Array(idx.length),wR:new Float32Array(idx.length),cache:{},
    diff:diff||Array.from({length:n},(_,i)=>i)};
  rec.shape=L=>{if(!rec.cache[L]){const s=getShape(L),wl=new Float32Array(idx.length),wr=new Float32Array(idx.length);
      const H=new Float32Array(idx.length*6), near=new Uint8Array(idx.length); // per side: height, d/dx, d/dy (for cheap shifted-bump evaluation)
      withBR(brL(L),()=>{const e=0.012;for(let k=0;k<idx.length;k++){const [x,y]=s.xy[idx[k]];wl[k]=breastW(x,y,-1);wr[k]=breastW(x,y,1);near[k]=(breastR(x,y,-1)<1.5||breastR(x,y,1)<1.5)?1:0;
        for(let q=0;q<2;q++){const sx=q?1:-1,o=k*6+q*3;H[o]=breastH(x,y,sx);if(H[o]>0||wl[k]||wr[k]){H[o+1]=(breastH(x+e,y,sx)-breastH(x-e,y,sx))/(2*e);H[o+2]=(breastH(x,y+e,sx)-breastH(x,y-e,sx))/(2*e);}}}});
      rec.cache[L]={pos:s.pos,xy:s.xy,wl,wr,H,near};}return rec.cache[L];};
  rec.apply=Lf=>{let L0=Math.floor(Lf),f=Lf-L0;if(L0>=LV_MAX){L0=LV_MAX;f=0;}
    if(rec.wallFn)rec.wall=rec.wallFn(Math.min(LV_MAX,Math.round(Lf)));
    const A=rec.shape(L0),B=f>1e-4?rec.shape(L0+1):A,p=geo.attributes.position.array;
    for(const i of rec.diff){for(let c=0;c<3;c++){const q=i*3+c;rec.rest[q]=p[q]=A.pos[q]+(B.pos[q]-A.pos[q])*f;}}
    for(let k=0;k<idx.length;k++){rec.wL[k]=A.wl[k]+(B.wl[k]-A.wl[k])*f;rec.wR[k]=A.wr[k]+(B.wr[k]-A.wr[k])*f;}
    if(!rec.H)rec.H=new Float32Array(idx.length*6);for(let k=0;k<rec.H.length;k++)rec.H[k]=A.H[k]+(B.H[k]-A.H[k])*f;
    rec.near=f>1e-4?A.near.map((v,k)=>v|B.near[k]):A.near;
    if(!rec.XY)rec.XY=new Float32Array(idx.length*2);
    for(let k=0;k<idx.length;k++){const a=A.xy[idx[k]],b=B.xy[idx[k]];rec.XY[k*2]=a[0]+(b[0]-a[0])*f;rec.XY[k*2+1]=a[1]+(b[1]-a[1])*f;}
    geo.attributes.position.needsUpdate=true;};
  deformables.push(rec); rec.apply(lvF); return rec;
}
let lvF=0;
let deformDirty=false;
function buildGrid(cols,rows,fn,closedU,faceOk){ // fn(i,j)->[pos,restXY]
  const P=[],R=[],I=[]; const C=closedU?cols:cols+1;
  for(let j=0;j<=rows;j++)for(let i=0;i<C;i++){const [p,r]=fn(i,j);P.push(p.x,p.y,p.z);R.push(r);}
  for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){
    const i1=closedU?(i+1)%cols:i+1, a=j*C+i,b=j*C+i1,c=(j+1)*C+i,d=(j+1)*C+i1;
    if(faceOk&&!faceOk(i,j))continue; I.push(a,b,d,a,d,c);}
  const g=new THREE.BufferGeometry(); g.setAttribute('position',new THREE.Float32BufferAttribute(P,3)); g.setIndex(I);
  g.computeVertexNormals(); return [g,R];
}

