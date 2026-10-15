// ---- procedural lingerie lace textures (bra cups + panty borders) ----
const BRA_TEX=(()=>{ // procedural lingerie textures (built once, 2048x1024): floral lace w/ see-through net, satin band, eyelash scallops
  const W=2048,H=1024, Y=v=>H-v*H;
  const QS=QUALITY.laceScale, mk=()=>{const c=document.createElement('canvas');c.width=Math.round(W*QS);c.height=Math.round(H*QS);const x=c.getContext('2d');x.scale(QS,QS);return [c,x];};
  const [c,g]=mk(), [ac,ag]=mk(), [hc,hg]=mk();     // colour, alpha (white=solid), height
  let sd=11;const rr=()=>(sd=(sd*16807)%2147483647)/2147483647;
  g.fillStyle='#fff';g.fillRect(0,0,W,H); ag.fillStyle='#000';ag.fillRect(0,0,W,H); hg.fillStyle='#000';hg.fillRect(0,0,W,H);
  const LACE0=0.47, LACE1=0.955;                       // cup lace zone in v
  // --- satin band + wire channel (solid) ---
  ag.fillStyle='#fff';ag.fillRect(0,Y(LACE0+0.01),W,H*(LACE0+0.01));
  hg.fillStyle='#303030';hg.fillRect(0,Y(LACE0),W,H*LACE0);
  for(let y=Y(LACE0);y<H;y+=3){hg.fillStyle=`rgba(255,255,255,${0.05+0.05*Math.sin(y*0.9)})`;hg.fillRect(0,y,W,1);}   // fine satin weave
  g.fillStyle='rgba(255,255,255,1)';g.fillRect(0,Y(LACE0),W,H*LACE0);
  g.fillStyle='rgba(0,0,0,0.10)';g.fillRect(0,Y(0.47),W,H*0.06);                       // underwire channel tone
  const stitch=(v,col)=>{for(const [cc,cg] of [[0,g],[1,hg]]){cg.strokeStyle=cc?'#909090':(col||'rgba(60,40,40,0.55)');cg.lineWidth=2.5;cg.setLineDash([9,6]);cg.beginPath();cg.moveTo(0,Y(v));cg.lineTo(W,Y(v));cg.stroke();cg.setLineDash([]);}};
  stitch(0.465);stitch(0.415);stitch(0.04);stitch(0.37);
  // hook & eye closure at the back (u=0.75)
  // --- lace: hex tulle net + floral motifs + raised cordonnet outlines ---
  const yL0=Y(LACE1), yL1=Y(LACE0);
  ag.strokeStyle='#fff';ag.lineWidth=2.6; g.strokeStyle='rgba(255,255,255,1)';
  const hx=20, hy=16;                                      // tulle cell
  ag.beginPath();for(let y=yL0;y<yL1;y+=hy){for(let x=((y/hy)%2)*hx/2;x<W;x+=hx){ag.moveTo(x,y);ag.lineTo(x+hx/2,y+hy);ag.moveTo(x,y);ag.lineTo(x-hx/2,y+hy);}}ag.stroke();
  hg.globalAlpha=0.5;hg.drawImage(ac,0,0);hg.globalAlpha=1;
  const blossom=(x,y,s)=>{                               // rose: layered petals + centre whorl
    for(const L of [[1,'#fff',8],[0.66,'#fff',6],[0.36,'#fff',5]]){const [k,col,n]=L;
      for(let p=0;p<n;p++){const a=p/n*Math.PI*2+rr()*0.4+k;for(const G of [ag,hg]){G.save();G.translate(x,y);G.rotate(a);G.beginPath();G.ellipse(s*k*0.55,0,s*k*0.5,s*k*0.32,0,0,7);
        G.fillStyle=G===hg?`rgb(${150+80*(1-k)},${150+80*(1-k)},${150+80*(1-k)})`:'#fff';G.fill();
        G.strokeStyle=G===hg?'#fff':'#000';G.lineWidth=G===hg?2.2:1.2;G.stroke();G.restore();}}}
    for(const G of [g]){G.save();G.translate(x,y);for(let p=0;p<8;p++){G.rotate(Math.PI/4);G.strokeStyle='rgba(70,30,35,0.35)';G.lineWidth=1.3;G.beginPath();G.ellipse(s*0.55,0,s*0.5,s*0.32,0,0,7);G.stroke();}
      G.fillStyle='rgba(70,30,35,0.45)';G.beginPath();G.arc(0,0,s*0.16,0,7);G.fill();G.restore();}};
  const leaf=(x,y,a,len)=>{for(const G of [ag,hg,g]){G.save();G.translate(x,y);G.rotate(a);G.beginPath();G.moveTo(0,0);G.quadraticCurveTo(len*0.5,-len*0.28,len,0);G.quadraticCurveTo(len*0.5,len*0.28,0,0);
      if(G===g){G.strokeStyle='rgba(70,30,35,0.35)';G.lineWidth=1.2;G.stroke();G.beginPath();G.moveTo(0,0);G.lineTo(len*0.9,0);G.stroke();}
      else{G.fillStyle=G===hg?'#c8c8c8':'#fff';G.fill();if(G===hg){G.strokeStyle='#fff';G.lineWidth=2;G.stroke();}}G.restore();}};
  const stem=(x0,y0,x1,y1)=>{for(const G of [ag,hg,g]){G.strokeStyle=G===g?'rgba(70,30,35,0.4)':'#fff';G.lineWidth=G===g?1.4:3;G.beginPath();G.moveTo(x0,y0);G.bezierCurveTo(x0+(x1-x0)*0.3,y0-18,x0+(x1-x0)*0.7,y1+18,x1,y1);G.stroke();}};
  const TILE=170;
  for(let ty=yL0+10;ty<yL1-6;ty+=TILE*0.62)for(let tx=((Math.round(ty/(TILE*0.62)))%2)*TILE/2;tx<W+TILE;tx+=TILE){
    const x=tx+(rr()-0.5)*20, y=ty+(rr()-0.5)*14, s=34+rr()*12;
    stem(x,y,x+TILE*0.55,y+TILE*0.3);
    for(let k=0;k<3;k++)leaf(x+TILE*(0.18+k*0.14),y+TILE*(0.08+k*0.07)+(k%2?-12:12),(k%2?-0.9:0.9)+rr()*0.3,28+rr()*10);
    blossom(x,y,s);
    for(const G of [ag,hg]){G.fillStyle='#fff';for(let k=0;k<5;k++){G.beginPath();G.arc(x+(rr()-0.5)*TILE*0.8,y+TILE*0.3+(rr()-0.5)*22,3.5,0,7);G.fill();}} // picot dots
  }
  // --- scalloped eyelash edge along the cup top ---
  const yE=Y(LACE1), sw=44;
  for(let x=0;x<W;x+=sw){for(const G of [ag,hg]){G.fillStyle=G===hg?'#d8d8d8':'#fff';G.beginPath();G.moveTo(x,yE+6);G.arc(x+sw/2,yE+6,sw/2,Math.PI,0);G.fill();
      G.strokeStyle='#fff';G.lineWidth=1.3;for(let k=0;k<7;k++){const a=Math.PI+k/6*Math.PI, r0=sw/2, r1=sw/2+7+rr()*7;G.beginPath();G.moveTo(x+sw/2+Math.cos(a)*r0,yE+6+Math.sin(a)*r0);G.lineTo(x+sw/2+Math.cos(a)*r1,yE+6+Math.sin(a)*r1);G.stroke();}}
    g.strokeStyle='rgba(70,30,35,0.45)';g.lineWidth=1.4;g.beginPath();g.arc(x+sw/2,yE+6,sw/2-2,Math.PI,0);g.stroke();}
  ag.fillStyle='#fff';ag.fillRect(0,yE+6,W,4);                                          // cord along the scallop base
  // colour: lace slightly darker/translucent-looking vs satin
  g.fillStyle='rgba(60,25,30,0.10)';g.fillRect(0,yL0-30,W,yL1-yL0+30);
  const map=new THREE.CanvasTexture(c);map.encoding=THREE.sRGBEncoding;map.anisotropy=8;
  const alpha=new THREE.CanvasTexture(ac);alpha.anisotropy=8;
  // height -> normal map (lace relief + satin weave)
  const NW=Math.round(W*QS),NH=Math.round(H*QS);
  const hd=hg.getImageData(0,0,NW,NH).data, nc=document.createElement('canvas');nc.width=NW;nc.height=NH;const ng=nc.getContext('2d'),img=ng.createImageData(NW,NH);
  const hv=(x,y)=>hd[((Math.min(NH-1,Math.max(0,y)))*NW+((x+NW)%NW))*4]/255;
  for(let y=0;y<NH;y++)for(let x=0;x<NW;x++){const dx=hv(x+1,y)-hv(x-1,y),dy=hv(x,y+1)-hv(x,y-1),s=2.2,i=(y*NW+x)*4;
    let nx=-dx*s,ny=dy*s,nz=1,l=Math.hypot(nx,ny,nz);img.data[i]=(nx/l*0.5+0.5)*255;img.data[i+1]=(ny/l*0.5+0.5)*255;img.data[i+2]=(nz/l*0.5+0.5)*255;img.data[i+3]=255;}
  ng.putImageData(img,0,0);const nmap=new THREE.CanvasTexture(nc);nmap.anisotropy=8;
  for(const tx of [map,alpha,nmap]){tx.wrapS=THREE.RepeatWrapping;tx.repeat.set(3,1);}   // ~isotropic lace on the cups
  return {map,nmap,alpha};
})();
