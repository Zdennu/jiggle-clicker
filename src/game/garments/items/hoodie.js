// garment item: hoodie  (mesh builder; data/price lives in economy/config.js)
BUILD.hoodie=m=>{const top=t=>front(t)?2.12+0.1*Math.pow(uOf(t),1.5):2.24;
   tops(m,{bot:0.12,top,off:0.035,loose:0.03,sleeve:0.08});
   {const pts=[];for(let k=0;k<64;k++){const t=k/64*2*Math.PI;pts.push(onSurf(t,top(t)-0.01,1,0.07));}
    const tg=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,true),96,0.055,12,true);const mm=new THREE.Mesh(tg,m);body.add(mm);garmentParts.push(mm);}
   shell(m,{mode:1,t0:tForX(0.3,0.7,1,1),t1:tForX(-0.3,0.7,1,1),cols:40,rows:16,yBot:()=>0.5,yTop:t=>0.82-0.05*uOf(t),off:()=>0.05});};
