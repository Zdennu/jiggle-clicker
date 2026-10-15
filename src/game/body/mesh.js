// ---- Body mesh ----
const BU=QUALITY.bu, BV=QUALITY.bv;
// rows warped so the chest band (y≈1.2–1.9) gets ~2.5x the density
const _wv=[];{let acc=0;const N=4000;for(let k=0;k<=N;k++){const v=-0.06+1.12*k/N,y=v*2.45;_wv.push(acc);acc+=1+1.6*ex((y-1.5)/0.28);} const tot=_wv[N];for(let k=0;k<=N;k++)_wv[k]/=tot;}
const vOf=j=>{const f=j/BV;let lo=0,hi=_wv.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(_wv[m]<f)lo=m;else hi=m;}const a=_wv[lo],b=_wv[hi],k=lo+(b>a?(f-a)/(b-a):0);return -0.06+1.12*k/(_wv.length-1);};
const _wt=[];{let acc=0;const N=4096;for(let k=0;k<N;k++){const t=k/N*2*Math.PI;_wt.push(acc);acc+=1+2.2*Math.pow(Math.max(0,Math.sin(t)),2)*(0.4+0.6*ex(Math.cos(t)/0.75));} for(let k=0;k<N;k++)_wt[k]=_wt[k]/acc;_wt.push(1);}
const tOf=i=>{const f=i/BU;let lo=0,hi=_wt.length-1;while(hi-lo>1){const m=(lo+hi)>>1;if(_wt[m]<f)lo=m;else hi=m;}const a=_wt[lo],b=_wt[hi];return (lo+(b>a?(f-a)/(b-a):0))/(_wt.length-1)*2*Math.PI;};
const [bodyGeo,bodyRest]=buildGrid(BU,BV,(i,j)=>{const t=tOf(i);const p=SP(t,vOf(j),0);return [p.clone(),[p.x,p.y]];},true);
// orient faces outward: grid winding check
{const n=bodyGeo.attributes.normal; const k=Math.floor(BV/2)*BU+Math.floor(BU/4); if(n.getZ(k)<0){const ix=bodyGeo.index.array;for(let q=0;q<ix.length;q+=3){const t=ix[q+1];ix[q+1]=ix[q+2];ix[q+2]=t;}bodyGeo.computeVertexNormals();}}
// skin tone + areola via vertex colours
const skinC=new THREE.Color(0xd9a07a).convertSRGBToLinear(), areolaC=new THREE.Color(0x8e4438).convertSRGBToLinear(), bellyC=new THREE.Color(0xdfab85).convertSRGBToLinear();
const NIP=[-1,1].map(sx=>({x:sx*(BR.cx+0.02), y:BR.cy-0.02}));
function paintBody(showAreola){ const AS=1/(1+0.9*(BR.sw||0)*(BR.sR||0.3)/0.37); paintBody.as=AS;
  const pos=bodyGeo.attributes.position, col=new Float32Array(pos.count*3), c=new THREE.Color(),
    base=new THREE.Color(0xc48c66).convertSRGBToLinear(), ar=areolaC.clone(), mul=new THREE.Color(ar.r/base.r,ar.g/base.g,ar.b/base.b), one=new THREE.Color(0.93,0.84,0.77);
  for(let i=0;i<pos.count;i++){const [x,y]=bodyRest[i], z=pos.array[i*3+2];c.copy(one);
    if(showAreola&&z>0)for(const n of NIP){const d=Math.hypot(x-n.x,y-n.y); c.lerp(mul,0.92*(1-ss(0.03*AS,0.058*AS,d)));}
    col[i*3]=c.r;col[i*3+1]=c.g;col[i*3+2]=c.b;}
  const ca=bodyGeo.attributes.color; if(ca&&ca.count===pos.count){ca.array.set(col);ca.needsUpdate=true;} else bodyGeo.setAttribute('color',new THREE.BufferAttribute(col,3));
}
paintBody(true);
bodyMat.color.set(0xffffff); bodyMat.vertexColors=true; bodyMat.roughness=0.58;
const _tv=[];for(let j=0;j<=BV;j++)for(let i=0;i<BU;i++)_tv.push([tOf(i),vOf(j)]);
applySkin(bodyGeo,bodyMat,_tv);
const body=new THREE.Mesh(bodyGeo,bodyMat);
body.position.y=0.1; scene.add(body);
