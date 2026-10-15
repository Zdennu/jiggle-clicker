// ================= Skin: procedural textures + fake subsurface (generated once, ≤2048px) =================
function uvU(t){let d=(t-Math.PI/2)%(2*Math.PI);if(d<0)d+=2*Math.PI;if(d>Math.PI)d=2*Math.PI-d;return d/Math.PI;} // front centre u=0, back u=1 (mirrored => seamless)
const SKIN_TEX=(()=>{
  const W=QUALITY.skinTex,H=QUALITY.skinTex,AX=1.6, uvY=y=>H*(1-(y/2.45+0.06)/1.12); // body-y -> canvas row
  const uvX=t=>uvU(t)*W; // front centre u=0, back centre u=1 (mirrored, seamless)               // torso angle -> canvas column (front centre t=π/2 -> W/4)
  let seed=7;const rnd=()=>(seed=(seed*16807)%2147483647)/2147483647;
  // colour: warm tan base, soft tonal blotches, warmer/pinker chest + collarbones, freckles, beauty marks
  const c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');
  g.fillStyle='#a8673f';g.fillRect(0,0,W,H);
  for(let i=0;i<260;i++){const x=rnd()*W,y=rnd()*H,r=40+rnd()*160,l=rnd()<0.5;g.save();g.translate(x,y);g.scale(AX,1);const gr=g.createRadialGradient(0,0,0,0,0,r);
    gr.addColorStop(0,l?'rgba(214,150,105,0.10)':'rgba(140,80,48,0.09)');gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.fillRect(-r,-r,2*r,2*r);g.restore();}
  const warm=(t,y,rx,ry,col)=>{const x=uvX(t),yy=uvY(y);g.save();g.translate(x,yy);g.scale(rx*AX/2,ry);const gr=g.createRadialGradient(0,0,0,0,0,1);
    gr.addColorStop(0,col);gr.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=gr;g.beginPath();g.arc(0,0,1,0,7);g.fill();g.restore();};
  warm(Math.PI/2,1.75,420,180,'rgba(205,105,80,0.20)');     // flushed upper chest
  warm(Math.PI/2,2.02,380,60,'rgba(205,110,90,0.20)');      // over the collarbones
  warm(Math.PI/2,1.5,330,150,'rgba(205,130,95,0.12)');     // lighter, slightly pinker chest
  warm(Math.PI*1.5,1.6,500,300,'rgba(120,75,50,0.10)');     // back a touch deeper in tone
  // ---- lower torso form shading (baked AO + anatomy cues) ----
  {const tx=(x,y)=>tForX(x,y,1,0), shade=(x,y,rx,ry,col)=>warm(tx(x,y),y,rx,ry,col);
   // AO toward the closed bottom: all around, strongest at the very base
   const yb0=uvY(0.42),yb1=uvY(-0.06);const ag=g.createLinearGradient(0,yb0,0,yb1);ag.addColorStop(0,'rgba(60,25,12,0)');ag.addColorStop(0.55,'rgba(60,25,12,0.03)');ag.addColorStop(1,'rgba(40,15,8,0.06)');g.fillStyle=ag;g.fillRect(0,yb0,W,yb1-yb0);
   // side / oblique / waist curvature: deepen toward the flanks (u≈0.3–0.6)
   for(const [y,a] of [[0.55,0.13],[0.8,0.15],[1.05,0.11]]){const yy=uvY(y),sg=g.createLinearGradient(0.18*W,0,0.62*W,0);sg.addColorStop(0,'rgba(90,40,22,0)');sg.addColorStop(0.55,`rgba(90,40,22,${a})`);sg.addColorStop(1,'rgba(90,40,22,0)');
     g.save();g.translate(0.5*W,yy);g.scale(0.22*W,0.2*373);const rg2=g.createRadialGradient(0,0,0,0,0,1);rg2.addColorStop(0,`rgba(90,40,22,${a})`);rg2.addColorStop(1,'rgba(90,40,22,0)');g.fillStyle=rg2;g.beginPath();g.arc(0,0,1,0,7);g.fill();g.restore();}
   // lower-belly: soft highlight on the curve, warm shadow in the low crease beneath it
   shade(0,0.6,240,70,'rgba(232,170,128,0.16)');
   shade(0,0.36,260,30,'rgba(95,42,25,0.14)');
   // linea alba + abdominal softness (faint midline, gentle side-of-abs shadows)
   {const y0=uvY(1.28),y1=uvY(0.9);const lg=g.createLinearGradient(0,0,10,0);lg.addColorStop(0,'rgba(100,45,28,0.16)');lg.addColorStop(1,'rgba(100,45,28,0)');g.fillStyle=lg;g.fillRect(0,y0,10,y1-y0);
    const lg2=g.createLinearGradient(0,uvY(0.84),0,uvY(0.5));lg2.addColorStop(0,'rgba(100,45,28,0.09)');lg2.addColorStop(1,'rgba(100,45,28,0)');g.fillStyle=lg2;g.fillRect(0,uvY(0.84),7,uvY(0.5)-uvY(0.84));}
   for(const x of [0.16]){shade(x,1.05,60,90,'rgba(105,50,30,0.07)');shade(x,1.05,26,70,'rgba(232,175,135,0.08)');}
   // navel: inner shadow, warm rim, tiny top-lip highlight
   shade(0,0.722,30,13,'rgba(110,50,30,0.35)');
   shade(0,0.718,14,7,'rgba(55,20,12,0.75)');
   shade(0,0.745,22,5,'rgba(240,185,145,0.22)');
   // hip bones / iliac crest: highlight on the crest, shadow just inside & below
   for(const x of [0.40]){shade(x,0.47,60,20,'rgba(238,180,140,0.16)');shade(x-0.06,0.38,55,32,'rgba(95,42,25,0.14)');shade(x+0.02,0.6,40,40,'rgba(95,42,25,0.06)');}
  }
  for(let i=0;i<900;i++){const t=Math.PI/2+(rnd()-0.5)*1.9,y=1.55+rnd()*0.65,x=uvX(t),yy=uvY(y);
    g.fillStyle=`rgba(120,70,45,${0.06+rnd()*0.14})`;g.beginPath();g.ellipse(x,yy,(0.6+rnd()*1.2)*AX*0.6,0.6+rnd()*1.2,0,0,7);g.fill();}
  // (no single beauty marks: UVs are mirrored left/right, so they would appear in symmetric pairs)
  const map=new THREE.CanvasTexture(c);map.encoding=THREE.sRGBEncoding;map.anisotropy=4;
  // pores / micro-normal + roughness (sheen on chest/shoulder highs)
  const n=document.createElement('canvas');n.width=W;n.height=H;const ng=n.getContext('2d'),img=ng.createImageData(W,H);
  const hgt=new Float32Array(W*H);for(let i=0;i<W*H;i++)hgt[i]=rnd();
  for(let p=0;p<2;p++){const o=new Float32Array(W*H);for(let y=1;y<H-1;y++)for(let x=1;x<W-1;x++){const i=y*W+x;o[i]=(hgt[i]*4+hgt[i-1]+hgt[i+1]+hgt[i-W]+hgt[i+W])/8;}hgt.set(o);}
  for(let y=0;y<H;y++)for(let x=0;x<W;x++){const i=y*W+x,dx=hgt[i+1<W*H?i+1:i]-hgt[i>0?i-1:i],dy=hgt[i+W<W*H?i+W:i]-hgt[i>=W?i-W:i],s=2.2;
    const ed=Math.min(1,Math.min(x,W-1-x)/10);let nx=-dx*s*ed,ny=-dy*s*ed,l=Math.hypot(nx,ny,1); /* flat at mirror edges: no seam */ img.data[i*4]=(nx/l*0.5+0.5)*255;img.data[i*4+1]=(ny/l*0.5+0.5)*255;img.data[i*4+2]=(1/l*0.5+0.5)*255;img.data[i*4+3]=255;}
  ng.putImageData(img,0,0);const nmap=new THREE.CanvasTexture(n);
  const r=document.createElement('canvas');r.width=512;r.height=256;const rg=r.getContext('2d');rg.fillStyle='rgb(192,192,192)';rg.fillRect(0,0,512,256);
  const shine=(t,y,rx,ry)=>{const x=uvU(t)*512,yy=uvY(y)/4;const gr=rg.createRadialGradient(x,yy,0,x,yy,rx);gr.addColorStop(0,'rgba(160,160,160,0.7)');gr.addColorStop(1,'rgba(192,192,192,0)');rg.fillStyle=gr;rg.save();rg.translate(x,yy);rg.scale(1,ry/rx);rg.translate(-x,-yy);rg.fillRect(x-rx,yy-rx,2*rx,2*rx);rg.restore();};
  shine(0.1,1.9,30,25);shine(Math.PI-0.1,1.9,30,25);shine(Math.PI/2,2.02,90,12);
  const rough=new THREE.CanvasTexture(r);
  return {map,nmap,rough};
})();
function applySkin(geo,mat,tv){
  const uv=new Float32Array(tv.length*2);for(let i=0;i<tv.length;i++){uv[i*2]=uvU(tv[i][0]);uv[i*2+1]=(tv[i][1]+0.06)/1.12;}
  geo.setAttribute('uv',new THREE.BufferAttribute(uv,2));
  Object.assign(mat,{map:SKIN_TEX.map,normalMap:SKIN_TEX.nmap,roughnessMap:SKIN_TEX.rough,roughness:1.0});
  mat.normalScale=new THREE.Vector2(0.1,0.1);
  // fake subsurface: warm wrap-light on the terminator + soft warm rim
  mat.onBeforeCompile=sh=>{sh.fragmentShader=sh.fragmentShader.replace('#include <output_fragment>',`
    { vec3 V=normalize(vViewPosition); float nv=clamp(dot(normal,V),0.0,1.0);
      float rim=pow(1.0-nv,2.5);
      outgoingLight+= diffuseColor.rgb*vec3(1.0,0.40,0.24)*(0.12*rim+0.045) - reflectedLight.directSpecular*0.45;   // tame balloon-like specular
      outgoingLight+= vec3(1.0,0.86,0.80)*0.035*pow(1.0-nv,4.0);                                               // soft skin fresnel sheen
    }
    #include <output_fragment>`);};
  mat.needsUpdate=true;
}

