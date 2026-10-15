// ---- sheer tulle with sparse florals (panty centre panel) ----
const PMESH=(()=>{const N=512,mk=()=>{const c=document.createElement('canvas');c.width=c.height=N;return [c,c.getContext('2d')];};
  const [c,g]=mk(),[ac,ag]=mk();g.fillStyle='#fff';g.fillRect(0,0,N,N);ag.fillStyle='#8a8a8a';ag.fillRect(0,0,N,N);   // sheer tulle: ~55% tint between the threads
  ag.strokeStyle='#fff';ag.lineWidth=2.2;const hx=16,hy=16;ag.beginPath();                          // fine tulle (tileable: 512 = 32 cells)
  for(let y=-hy;y<N+hy;y+=hy)for(let x=((y/hy)&1)*hx/2-hx;x<N+hx;x+=hx){ag.moveTo(x,y);ag.lineTo(x+hx/2,y+hy);ag.moveTo(x,y);ag.lineTo(x-hx/2,y+hy);}ag.stroke();
  const flower=(x,y,s,a0)=>{for(const [dx,dy] of [[0,0],[N,0],[-N,0],[0,N],[0,-N]]){ag.save();ag.translate(x+dx,y+dy);ag.rotate(a0);ag.fillStyle='#fff';
      for(let p=0;p<6;p++){ag.rotate(Math.PI/3);ag.beginPath();ag.ellipse(s*0.55,0,s*0.5,s*0.3,0,0,7);ag.fill();}
      for(let k=0;k<2;k++){ag.beginPath();ag.ellipse(s*(1.4+0.5*k),s*(0.5-k),s*0.55,s*0.2,0.6-k,0,7);ag.fill();}
      g.save();g.translate(x+dx,y+dy);g.strokeStyle='rgba(60,25,35,0.35)';g.lineWidth=1.2;for(let p=0;p<6;p++){g.rotate(Math.PI/3);g.beginPath();g.ellipse(s*0.55,0,s*0.5,s*0.3,0,0,7);g.stroke();}g.restore();ag.restore();}};
  flower(150,170,26,0.3);flower(390,400,20,1.2);                                                   // sparse motif
  const map=new THREE.CanvasTexture(c);map.encoding=THREE.sRGBEncoding;const alpha=new THREE.CanvasTexture(ac);
  for(const t of [map,alpha]){t.wrapS=t.wrapT=THREE.RepeatWrapping;t.anisotropy=8;}return {map,alpha};})();
