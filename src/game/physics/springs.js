// ---------- Chest physics: one 3D spring per side + soft contact + coupling ----------
// Deformation is applied in displacement-field space: each side's bump is shifted/scaled with a
// first-order (precomputed gradient) update and the two are re-blended with the same smooth union,
// so where they press together the cleavage squashes instead of clipping. Cheap: a few flops/vertex.
const springs=new Map();
[leftBreast,rightBreast].forEach(o=>springs.set(o,{p:[0,0,0],v:[0,0,0],lag:0}));
const SL=springs.get(leftBreast), SR=springs.get(rightBreast);
function jiggle(obj){thighKick(0.35);headReact();const s=springs.get(obj),sx=obj.sx,L=lvF||0,m=1+0.05*L;
  s.v[0]+=-sx*0.75*m; s.v[1]+=-0.6*m; s.v[2]+=-0.35; // tap pushes inward, down and back
  const o=obj===leftBreast?SR:SL; o.v[1]+=-0.3; o.v[0]+=sx*0.15*m; }
let lastSq={};
function applyDeform(){
  const L=lvF||0, pen=Math.max(0,-(SR.p[0]-SL.p[0]))*(0.4+BR.comp*2.5), sc=[SL,SR].map(s=>s.p[2]*2.2+pen*2.2);           // forward/back -> projection scale
  const gs=(typeof GRAB!=='undefined'&&GRAB.on)?springs.get(GRAB.on.o):null, lm=s=>s===gs?0.4:0.3;   // free swings can carry well past the centre
  const cl=(v,m)=>m*Math.tanh(v/m), ox=[cl(SL.p[0],lm(SL)),cl(SR.p[0],lm(SR))], oy=[cl(SL.p[1]+SL.lag*0.3+pen*0.35,lm(SL)),cl(SR.p[1]+SR.lag*0.3+pen*0.35,lm(SR))];
  if(gs)sc[gs===SL?0:1]-=0.07;
  const xc=0.5*(ox[0]+ox[1]), SW=(typeof LVUP!=='undefined')?swellAt(LVUP.t):0;   // contact plane follows both sides   // slight squash under the finger
  deformables.forEach(rec=>{const p=rec.geo.attributes.position.array,r=rec.rest,H=rec.H;if(!H)return;
    for(let k=0;k<rec.idx.length;k++){const i=rec.idx[k]*3,o=k*6;
      const h0=H[o],h1=H[o+3];if(!rec.wall&&!rec.near[k])continue;
      // anchored at the chest wall: displacement weighted by projection depth (base ~0, front volume ~1)
      const BH=BR.h*(1+0.15*BR.comp)+(BR.sw||0)*BR.sR; let wl,wr; if(rec.wall){const j=rec.idx[k]*3, Wl=rec.wall, off=Math.hypot(r[j]-Wl[j],r[j+1]-Wl[j+1],r[j+2]-Wl[j+2]);
        const ww=ss(0,1,off/(BR.h*(1-(BR.sw||0))+(BR.sw||0)*BR.sR*1.5))*0.85+0.15*Math.min(1,off/(BR.h*(1-(BR.sw||0))+(BR.sw||0)*BR.sR*1.5)); const sxv=Wl[j]<0?-1:1, ddx=Wl[j]-sxv*0.229, ddy=Wl[j+1]-1.5, wf=ww>0.999?ww:Math.max(ww,(0.3+0.25*(BR.sw||0))*Math.exp(-(ddx*ddx+ddy*ddy)/0.075));   // broad soft field: surrounding skin follows a little (no fold)
        wl=r[j]<0?wf:0; wr=r[j]<0?0:wf;}
      else{const BH=BR.h*(1+0.15*BR.comp); wl=Math.pow(Math.min(1,Math.max(0,h0)/BH),0.85); wr=Math.pow(Math.min(1,Math.max(0,h1)/BH),0.85);}
      const dx=wl*ox[0]+wr*ox[1], dy=wl*oy[0]+wr*oy[1];
      const sq=pen*3*(wl+wr)*Math.exp(-Math.abs(r[i])/0.08); let nx=r[i]+dx, cl=0;
      // soft contact against the moving contact plane (midpoint of both sides' sideways offsets), not a fixed x=0
      {const side=r[i]<0?-1:1, v=side*(nx-xc); if(v<0.06){const k=0.012, nv=k*Math.log1p(Math.exp(v/k)); const f=ss(0.0,0.7,wl+wr); cl=(nv-v)*f; nx+=side*cl;}}   // only tissue that moves takes part in contact
      p[i]=nx; p[i+1]=r[i+1]+dy+0.5*sq+0.6*cl*(wl+wr); p[i+2]=r[i+2]+0.5*cl*(wl+wr)+h0*sc[0]+h1*sc[1]-0.25*Math.abs(dy)*(wl+wr)*(h0+h1)/BH; // swing arc: tip pulls in slightly
      if(SW&&rec.wall){const j=rec.idx[k]*3,Wl=rec.wall;p[i]+=(r[j]-Wl[j])*SW;p[i+1]+=(r[j+1]-Wl[j+1])*SW;p[i+2]+=(r[j+2]-Wl[j+2])*SW;}   // level-up swell
    }
    rec.geo.attributes.position.needsUpdate=true;rec.geo.computeVertexNormals();rec.geo.computeBoundingSphere();});
  placeNipples();
}
const lvFill=document.getElementById('lvfill'),lvTxt=document.getElementById('lvtxt'),lvBadge=document.getElementById('lvbadge');
function stepSprings(dt){
  const L=lvF||0, k=118/(1+0.026*L), c=3.3/(1+0.012*L), kc=0.22*k;     // heavier (lower freq) at higher levels
  const sw=BR.sw||0, gap0=(1-sw)*2*(BR.cx-BR.rxIn)+sw*2*(BR.sX-BR.sR), prox=ss(0.14,-0.04,gap0);   // real inner-edge gap at rest         // how close the inner edges sit at rest
  const kcon=k*(1.5+3*prox+6*BR.comp);
  let moving=deformDirty;const n=Math.max(1,Math.ceil(dt/0.008)),h=dt/n;
  for(let it=0;it<n;it++){
    const pen=Math.max(0,-(SR.p[0]-SL.p[0])-Math.max(0,gap0));       // inner edges pressing together
    for(const [s,o,sx] of [[SL,SR,-1],[SR,SL,1]]){
      const gr=(typeof GRAB!=='undefined'&&GRAB.on&&springs.get(GRAB.on.o)===s);
      for(let d=0;d<3;d++){let f=-k*(d===1?0.8:1)*s.p[d]-c*s.v[d]+kc*(o.p[d]-s.p[d]);if(d===0)f+=sx*kcon*pen;
        if(gr)f+=k*4*(GRAB.target[d]-s.p[d])-c*2*s.v[d];s.v[d]+=f*h;}
      for(let d=0;d<3;d++)s.p[d]+=s.v[d]*h;
      s.lag+=(s.p[1]-s.lag)*Math.min(1,h*12);
    }}
  if(typeof GRAB!=='undefined'&&GRAB.on)moving=true;
  if(LVUP.t>=0){LVUP.t+=Math.min(dt,1/30);moving=true;if(LVUP.t>1.2)LVUP.t=-1;}
  for(const s of [SL,SR]){const mag=Math.abs(s.p[0])+Math.abs(s.p[1])+Math.abs(s.p[2])+Math.abs(s.v[0])+Math.abs(s.v[1])+Math.abs(s.v[2])+Math.abs(s.lag-s.p[1]);
    if(mag<2e-4){s.p=[0,0,0];s.v=[0,0,0];s.lag=0;}else moving=true;}
  if(moving){applyDeform();deformDirty=false;}
}

