// garment item: bikini  (mesh builder; data/price lives in economy/config.js)
BUILD.bikini=m=>{const tri=ph=>{const a=((ph-Math.PI/2)%(2*Math.PI/3)+2*Math.PI/3)%(2*Math.PI/3)-Math.PI/3;return Math.min(1.0,0.52/Math.cos(a));};
   [-1,1].forEach(sx=>{cup(m,sx,0.006,tri);ribbon(m,strapPath(sx*0.2,BR.cy+0.98*BR.ryU,1.33).slice(0,11).concat(strapPath(sx*0.2,BR.cy+0.98*BR.ryU,2.0).slice(11)),0.016,0.008);});
   band(m,BR.cy-BR.ryD-0.01,BR.cy-BR.ryD+0.015,0.007,0);};
