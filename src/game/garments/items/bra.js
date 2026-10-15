// garment item: bra  (mesh builder; data/price lives in economy/config.js)
BUILD.bra=m=>{const bm=m.userData.bra||(m.userData.bra=braMaterial(0xffffff));bm.color.copy(m.color);bm.sheen.copy(m.color).multiplyScalar(0.6);
   if(!bm.userData.trim){bm.userData.trim=new THREE.MeshPhysicalMaterial({color:0xffffff,roughness:0.3,clearcoat:0.4,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2});
     bm.userData.metal=new THREE.MeshStandardMaterial({color:new THREE.Color(0xd8c39a).convertSRGBToLinear(),metalness:0.9,roughness:0.3});}
   bm.userData.trim.color.copy(m.color).multiplyScalar(0.85);
   braShell(bm);braWire(bm);braBow(bm);braStraps(bm);};
