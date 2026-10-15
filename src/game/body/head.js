// ================= NECK, HEAD, FACE, HAIR + idle life (procedural, cheap) =================
// Neck tube grows out of the torso's top ring (same skin material/UVs) -> head (deformed sphere, painted
// anime-realistic face on a canvas that is only redrawn when the expression changes) -> hair (cap + strand cards
// with alpha, CPU sway on a single merged geometry).
const HQ={low:{cards:30,seg:10,face:512,hs:40},med:{cards:46,seg:12,face:1024,hs:56},high:{cards:64,seg:14,face:1024,hs:72}}[QUALITY.name]||{cards:46,seg:12,face:1024,hs:56};
const headG=new THREE.Group(), HEAD={};
const IDLE={t:0,blinkIn:2.5,blink:0,smile:0,closed:0,blush:0,gaze:[0,0],gazeT:[0,0],gazeIn:3,react:0,reactV:0,hair:{p:[0,0],v:[0,0]},key:''};
(()=>{
  // ---- neck: exact torso top ring -> slightly narrower circle ----
  const NR=BU, ring=[], TT=[];for(let i=0;i<NR;i++){const t=tOf(i);TT.push(t);ring.push(S(t,Y_TOP,0,new THREE.Vector3()).clone());}
  const bc=bodyGeo.attributes.color;let jT=0;for(let j=0;j<=BV;j++)if(Math.abs(vOf(j)-1)<Math.abs(vOf(jT)-1))jT=j;   // torso row at the neck top -> copy its vertex colours
  const cx=0, cz=ring.reduce((a,p)=>a+p.z,0)/NR, y0=ring.reduce((a,p)=>a+p.y,0)/NR, rN=ring.reduce((a,p)=>a+Math.hypot(p.x,p.z-cz),0)/NR;
  const NH=0.07, NJ=10, P=[],UV=[],C=[],I=[], sk=new THREE.Color(0xd9a07a).convertSRGBToLinear();
  for(let j=0;j<=NJ;j++){const s=j/NJ,k=s*s*(3-2*s);for(let i=0;i<NR;i++){const t=TT[i],a=ring[i];
      const r=rN*(0.93-0.03*s),ox=Math.cos(t)*r,oz=cz+0.01+Math.sin(t)*r*0.95;
      P.push(a.x+(ox-a.x)*Math.min(1,k*1.6),y0+NH*s+(a.y-y0)*(1-s),a.z+(oz-a.z)*Math.min(1,k*1.6));UV.push(uvU(t),Math.min(0.995,(1+0.06)/1.12+s*0.02));C.push(bc.getX(jT*BU+i),bc.getY(jT*BU+i),bc.getZ(jT*BU+i));}}
  for(let j=0;j<NJ;j++)for(let i=0;i<NR;i++){const a=j*NR+i,b=j*NR+(i+1)%NR,c=a+NR,d=b+NR;I.push(a,d,b,a,c,d);}
  const ng=new THREE.BufferGeometry();ng.setAttribute('position',new THREE.Float32BufferAttribute(P,3));ng.setAttribute('uv',new THREE.Float32BufferAttribute(UV,2));
  ng.setAttribute('color',new THREE.Float32BufferAttribute(C,3));ng.setIndex(I);ng.computeVertexNormals();
  {const n=ng.attributes.normal;for(let i=0;i<NR;i++){const p=ring[i],q=new THREE.Vector3(p.x,0,p.z-cz).normalize();n.setXYZ(i,q.x,q.y,q.z);}}   // seam normals = horizontal (match torso)
  const neck=new THREE.Mesh(ng,bodyMat);neck.castShadow=neck.receiveShadow=true;body.add(neck);
  // ---- head ----
  const HC=new THREE.Vector3(0,y0+NH+0.14,cz+0.025);const HS=1.45;headG.position.set(0,y0-0.13,cz+0.005);headG.scale.setScalar(HS);body.add(headG);
  const hg=new THREE.SphereGeometry(1,HQ.hs,Math.round(HQ.hs*0.75)),hp=hg.attributes.position,uv=hg.attributes.uv;
  for(let i=0;i<hp.count;i++){let x=hp.getX(i),y=hp.getY(i),z=hp.getZ(i);const ux=x,uy=y,uz=z;
    let X=x*0.128,Y=y*0.165,Z=z*(z>0?0.145:0.16);
    if(uy<0){const k=1-0.36*Math.pow(-uy,1.6);X*=k;if(uz>0)Z*=1-0.12*Math.pow(-uy,2);}           // jaw + chin taper
    if(uz>0){Z+=0.016*Math.exp(-((X/0.016)**2+((Y+0.035)/0.03)**2));                       // small nose
      Z-=0.007*(Math.exp(-(((X-0.047)/0.03)**2+((Y-0.012)/0.02)**2))+Math.exp(-(((X+0.047)/0.03)**2+((Y-0.012)/0.02)**2)));   // soft eye sockets
      Z+=0.004*Math.exp(-((X/0.03)**2+((Y+0.085)/0.012)**2));}                              // lips
    hp.setXYZ(i,X,Y+0.14,Z+0.025);uv.setXY(i,0.5+X/0.30,0.5+Y/0.38);}
  hg.computeVertexNormals();
  const skinAvg=(()=>{const im=SKIN_TEX.map.image,cx2=im.getContext('2d'),d=cx2.getImageData(0,0,im.width,Math.max(4,im.height*0.03|0)).data;let r=0,g=0,b=0,n=d.length/4;for(let i=0;i<d.length;i+=4){r+=d[i];g+=d[i+1];b+=d[i+2];}return [r/n|0,g/n|0,b/n|0];})();
  const FC=document.createElement('canvas');FC.width=FC.height=HQ.face;const fx=FC.getContext('2d');const ftex=new THREE.CanvasTexture(FC);ftex.encoding=THREE.sRGBEncoding;ftex.anisotropy=4;
  const hm=new THREE.MeshStandardMaterial({map:ftex,color:new THREE.Color(bc.getX(jT*BU+BU/4|0),bc.getY(jT*BU+BU/4|0),bc.getZ(jT*BU+BU/4|0)),roughness:0.62});hm.onBeforeCompile=bodyMat.onBeforeCompile;
  const head=new THREE.Mesh(hg,hm);head.castShadow=true;headG.add(head);
  // ---- face painter (only on expression change) ----
  HEAD.draw=(e)=>{const W=512,s=FC.width/W;fx.setTransform(s,0,0,s,0,0);
    fx.fillStyle=`rgb(${skinAvg})`;fx.fillRect(0,0,W,W);
    const blob=(x,y,rx,ry,c0)=>{const g=fx.createRadialGradient(x,y,0,x,y,rx);g.addColorStop(0,c0);g.addColorStop(1,c0.replace(/[\d.]+\)$/,'0)'));fx.save();fx.translate(x,y);fx.scale(1,ry/rx);fx.translate(-x,-y);fx.fillStyle=g;fx.fillRect(x-rx,y-rx,2*rx,2*rx);fx.restore();};
    blob(256,250,150,170,'rgba(255,190,160,0.10)');                                       // soft face light
    const bl=0.18+0.5*e.blush; blob(176,318,46,26,`rgba(255,110,130,${bl})`);blob(336,318,46,26,`rgba(255,110,130,${bl})`);   // blush
    // brows
    fx.strokeStyle='rgba(78,42,32,0.85)';fx.lineCap='round';
    for(const sx of [-1,1]){fx.lineWidth=5;fx.beginPath();const bx=256+sx*82,by=196-6*e.smile;fx.moveTo(bx-sx*30,by+6);fx.quadraticCurveTo(bx,by-10,bx+sx*34,by+4);fx.stroke();}
    // eyes
    for(const sx of [-1,1]){const ex=256+sx*82,ey=258;
      if(e.closed||e.blink){fx.lineWidth=5;fx.strokeStyle='#2a1512';fx.beginPath();
        if(e.closed){fx.moveTo(ex-30,ey+6);fx.quadraticCurveTo(ex,ey-16,ex+30,ey+6);}else{fx.moveTo(ex-30,ey);fx.quadraticCurveTo(ex,ey+12,ex+30,ey);}
        fx.stroke();fx.lineWidth=2.5;for(let k=0;k<3;k++){fx.beginPath();fx.moveTo(ex+sx*(16+k*6),ey+(e.closed?-2:6));fx.lineTo(ex+sx*(22+k*8),ey+(e.closed?4:12));fx.stroke();}continue;}
      fx.save();fx.beginPath();fx.ellipse(ex,ey,38,27,0,0,7);fx.clip();
      fx.fillStyle='#fbf3ef';fx.fillRect(ex-40,ey-30,80,60);
      const gx=ex+e.gaze[0]*10,gy=ey+2+e.gaze[1]*5;
      let g=fx.createRadialGradient(gx,gy-5,2,gx,gy,23);g.addColorStop(0,'#c98a5e');g.addColorStop(0.6,'#7a4128');g.addColorStop(1,'#3a1a10');fx.fillStyle=g;fx.beginPath();fx.arc(gx,gy,23,0,7);fx.fill();
      fx.fillStyle='#160a08';fx.beginPath();fx.arc(gx,gy,10,0,7);fx.fill();
      fx.fillStyle='rgba(60,25,20,0.35)';fx.fillRect(ex-40,ey-30,80,11);                   // lid shadow
      fx.restore();
      fx.fillStyle='#fff';fx.beginPath();fx.arc(gx-7,gy-8,7.5,0,7);fx.fill();fx.globalAlpha=0.8;fx.beginPath();fx.arc(gx+6,gy+6,2.8,0,7);fx.fill();fx.globalAlpha=1;   // catchlights
      fx.strokeStyle='#1e0e0c';fx.lineWidth=7;fx.beginPath();fx.ellipse(ex,ey,39,28,0,Math.PI*1.05,Math.PI*1.95);fx.stroke();   // upper lash line
      fx.lineWidth=3;for(let k=0;k<4;k++){const a=Math.PI*(1.55+sx*0.1+sx*k*0.1);fx.beginPath();fx.moveTo(ex+39*Math.cos(a),ey+28*Math.sin(a));fx.lineTo(ex+47*Math.cos(a)+sx*5,ey+36*Math.sin(a)-2);fx.stroke();}   // lashes, flicked out
      fx.lineWidth=1.6;fx.strokeStyle='rgba(40,18,14,0.6)';fx.beginPath();fx.ellipse(ex,ey,37,27,0,Math.PI*0.15,Math.PI*0.85);fx.stroke();}
    // nose
    fx.strokeStyle='rgba(120,60,45,0.35)';fx.lineWidth=2.5;fx.beginPath();fx.moveTo(250,322);fx.quadraticCurveTo(256,328,262,322);fx.stroke();
    // lips (glossy), smile lifts corners
    const ly=371,sm=e.smile*6;fx.fillStyle='#c25a68';fx.beginPath();fx.moveTo(226,ly-sm);fx.quadraticCurveTo(244,ly-12,256,ly-7);fx.quadraticCurveTo(268,ly-12,286,ly-sm);fx.quadraticCurveTo(256,ly+2,226,ly-sm);fx.fill();
    fx.fillStyle='#d26e7a';fx.beginPath();fx.moveTo(228,ly-sm+1);fx.quadraticCurveTo(256,ly+3,284,ly-sm+1);fx.quadraticCurveTo(256,ly+20,228,ly-sm+1);fx.fill();
    fx.strokeStyle='rgba(110,35,45,0.55)';fx.lineWidth=2;fx.beginPath();fx.moveTo(226,ly-sm);fx.quadraticCurveTo(256,ly+3-sm*0.3,286,ly-sm);fx.stroke();
    blob(258,ly+9,12,4,'rgba(255,255,255,0.55)');                                          // gloss
    ftex.needsUpdate=true;};
  HEAD.draw({blush:0,smile:0,closed:0,blink:0,gaze:[0,0]});
  // ---- hair ----
  const HT=(()=>{const c=document.createElement('canvas');c.width=128;c.height=512;const g=c.getContext('2d');let sd=7;const rnd=()=>(sd=(sd*16807)%2147483647)/2147483647;
    for(let i=0;i<220;i++){const x=rnd()*128,w=1+rnd()*2.5,l=0.75+rnd()*0.25,sh=rnd();g.strokeStyle=`rgba(${120+sh*80|0},${78+sh*55|0},${66+sh*45|0},${0.65+rnd()*0.35})`;g.lineWidth=w;
      g.beginPath();g.moveTo(x,0);g.bezierCurveTo(x+(rnd()-0.5)*14,170,x+(rnd()-0.5)*18,340,x+(rnd()-0.5)*24,512*l);g.stroke();}
    const t=new THREE.CanvasTexture(c);t.encoding=THREE.sRGBEncoding;return t;})();
  const hairM=new THREE.MeshStandardMaterial({map:HT,color:0x3e271f,roughness:0.5,metalness:0,alphaTest:0.4,side:THREE.DoubleSide});
  const capM=new THREE.MeshStandardMaterial({map:HT,color:0x33201a,roughness:0.55,metalness:0});
  // cap: head copy pushed out, face region removed (hairline)
  {const cg=hg.clone(),cp=cg.attributes.position,src=hg.attributes.position;const keep=[];
    for(let i=0;i<cp.count;i++){const x=src.getX(i),y=src.getY(i)-0.14,z=src.getZ(i)-0.025;const L=Math.hypot(x,y,z)||1;cp.setXYZ(i,x*1.075,y*1.07+0.14+0.006,z*1.07+0.025);
      const face=z>0.03&&y<0.075-0.25*Math.max(0,Math.abs(x)-0.06)&&!(Math.abs(x)>0.105&&z<0.07);keep.push(!face&&y>-0.13);}
    const ix=cg.index.array,ni=[];for(let q=0;q<ix.length;q+=3)if(keep[ix[q]]&&keep[ix[q+1]]&&keep[ix[q+2]])ni.push(ix[q],ix[q+1],ix[q+2]);cg.setIndex(ni);
    const cu=cg.attributes.uv;for(let i=0;i<cu.count;i++){const x=cp.getX(i),z=cp.getZ(i);cu.setXY(i,Math.atan2(x,z)/Math.PI*3,(cp.getY(i)-0.14)*2.2);}cg.computeVertexNormals();
    const cap=new THREE.Mesh(cg,capM);cap.castShadow=true;headG.add(cap);}
  // strand cards (head-local coords, hang toward the shoulders/back; radius kept outside the torso)
  const bodyR=(dx,dz,yb)=>{const t=Math.atan2(dz,dx),p=S(t,Math.min(Y_TOP,yb),0,_a);return Math.hypot(p.x,p.z-cz);};
  const CP=[],CU=[],CI=[],W8=[],PH=[];const N=HQ.cards,SEG=HQ.seg,hy=headG.position.y;
  for(let k=0;k<N;k++){const f=k/(N-1),phi=(f*2-1)*2.35+(k%2?0.04:-0.04),front=Math.abs(phi)>1.75;
    const len=front?0.36+0.04*((k*7)%3):0.62+0.12*((k*5)%4)/3,ry=0.2+0.03*((k*3)%3)/2,w=front?0.05:0.075;
    const r0=0.15,b=CP.length/3;
    for(let j=0;j<=SEG;j++){const s=j/SEG,y=ry-len*s*(1+0.1*s);let r=r0+0.03*Math.sin(Math.min(1,s*3)*Math.PI/2);
      const pe=front?phi:phi*(1-0.45*ss(0.2,0.7,s)),dx=Math.sin(pe),dz=-Math.cos(pe);   // side hair sweeps behind the shoulders
      const yb=hy+y*HS;if(yb<Y_TOP+0.02)r=Math.max(r,(bodyR(dx,dz,yb)+0.025+0.01*s)/HS);else r=Math.max(r,0.135+0.02*s);
      const px=dx*r,pz=dz*r+0.02,tx=-dz,tz=dx,ww=w*(1-0.35*s)*(front?1:1+0.3*s);
      for(const e of [-1,1]){CP.push(px+tx*ww*0.5*e,y,pz+tz*ww*0.5*e);CU.push(e<0?((k*0.37)%1)*0.5:((k*0.37)%1)*0.5+0.5,1-s);W8.push(Math.pow(s,1.5));PH.push(phi);}}
    for(let j=0;j<SEG;j++){const a=b+j*2;CI.push(a,a+1,a+2,a+1,a+3,a+2);}}
  // bangs: short swept cards over the forehead
  for(let k=0;k<11;k++){const f=k/10,ang=(f-0.5)*1.9+(f<0.5?-0.08:0.08),dx=Math.sin(ang),dz=Math.cos(ang),b=CP.length/3,SG=6;
    for(let j=0;j<=SG;j++){const s=j/SG,y=0.305-(0.13+0.03*Math.abs(Math.sin(k*2.3)))*s,r=0.137+0.02*Math.sin(s*Math.PI*0.9)+0.004*k%2,sw=0.05*s*s*Math.sign(ang||1);
      const px=dx*r+sw*dz,pz=dz*r+0.025-sw*dx*0.3,tx=dz,tz=-dx,ww=0.045*(1-0.6*s);
      for(const e of [-1,1]){CP.push(px+tx*ww*0.5*e,y,pz+tz*ww*0.5*e);CU.push(e<0?f*0.4:f*0.4+0.5,1-s*0.5);W8.push(s*0.3);PH.push(ang+Math.PI);}}
    for(let j=0;j<SG;j++){const a=b+j*2;CI.push(a,a+1,a+2,a+1,a+3,a+2);}}
  const hgC=new THREE.BufferGeometry();hgC.setAttribute('position',new THREE.Float32BufferAttribute(CP,3));hgC.setAttribute('uv',new THREE.Float32BufferAttribute(CU,2));hgC.setIndex(CI);hgC.computeVertexNormals();
  const hair=new THREE.Mesh(hgC,hairM);hair.castShadow=true;headG.add(hair);
  HEAD.hair={geo:hgC,base:Float32Array.from(CP),w:Float32Array.from(W8),ph:Float32Array.from(PH)};
})();
function headReact(){IDLE.smile=1;IDLE.closed=0.35;IDLE.blush=Math.min(1,IDLE.blush+0.12);IDLE.reactV=Math.max(-2.5,Math.min(2.5,IDLE.reactV+1.6*(Math.random()<0.5?-1:1)));IDLE.hair.v[0]+=0.25*(Math.random()-0.5);IDLE.hair.v[1]+=0.15;}
function idleTick(dt,now){dt=Math.max(0,Math.min(0.05,dt));const I=IDLE,t=(I.t+=dt);
  // breathing (≈15/min) feeds the chest springs; sway + weight shift on the whole body; head tilt
  const br=Math.sin(t*1.6),brv=Math.cos(t*1.6);body.scale.set(1+0.003*br,1,1+0.007*br);
  SL.v[1]+=0.06*brv*dt*10;SR.v[1]+=0.06*brv*dt*10;
  body.rotation.z=0.012*Math.sin(t*0.45);body.position.x=0.012*Math.sin(t*0.23);
  I.reactV+=(-40*I.react-7*I.reactV)*dt;I.react+=I.reactV*dt;
  headG.rotation.z=0.055*Math.sin(t*0.31)+0.06*I.react-body.rotation.z*0.5;headG.rotation.x=0.03*Math.sin(t*0.37+1)-0.05*I.smile*0.5;headG.rotation.y=0.08*Math.sin(t*0.21)+I.gaze[0]*0.06;
  // blink / glance / expression decay
  if((I.blinkIn-=dt)<0){I.blink=0.14;I.blinkIn=2+Math.random()*3.5;}I.blink=Math.max(0,I.blink-dt);
  if((I.gazeIn-=dt)<0){I.gazeT=Math.random()<0.55?[0,0]:[(Math.random()*2-1)*0.9,(Math.random()*2-1)*0.4];I.gazeIn=2.5+Math.random()*4;}
  for(const k of [0,1])I.gaze[k]+=(I.gazeT[k]-I.gaze[k])*Math.min(1,dt*10);
  I.smile=Math.max(0,I.smile-dt*0.6);I.closed=Math.max(0,I.closed-dt);I.blush=Math.max(0,I.blush-dt*0.06);
  const e={blink:I.blink>0?1:0,closed:I.closed>0?1:0,smile:Math.round(I.smile*3)/3,blush:Math.round(I.blush*8)/8,gaze:[Math.round(I.gaze[0]*4)/4,Math.round(I.gaze[1]*4)/4]};
  const key=JSON.stringify(e);if(key!==I.key){I.key=key;HEAD.draw(e);}
  // hair sway: damped pendulum driven by head/body motion
  const H=I.hair,dr=[-(headG.rotation.z+body.rotation.z)*0.25,0];
  for(const k of [0,1]){H.v[k]+=(-22*(H.p[k]-dr[k])-3.2*H.v[k])*dt;H.p[k]+=H.v[k]*dt;}
  const hh=HEAD.hair,p=hh.geo.attributes.position.array,b=hh.base;
  for(let i=0,n=hh.w.length;i<n;i++){const w=hh.w[i],o=i*3,wv=0.004*Math.sin(t*1.3+hh.ph[i]*2)*w;p[o]=b[o]+(H.p[0]+wv)*w*0.12;p[o+2]=b[o+2]+(H.p[1]*0.1+wv)*w*0.5*Math.sign(b[o+2]);p[o+1]=b[o+1];}
  hh.geo.attributes.position.needsUpdate=true;}
