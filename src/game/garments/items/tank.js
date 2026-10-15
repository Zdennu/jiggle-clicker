// garment item: tank  (mesh builder; data/price lives in economy/config.js)
BUILD.tank=m=>{const top=t=>{const u=uOf(t);const nk=front(t)?1.7:1.82;return u<0.45?nk+(1.9-nk)*Math.pow(ss(0.05,0.45,u),0.8):1.9-0.3*ss(0.45,0.85,u);};
   tops(m,{bot:0.42,top,off:0.014,loose:0.02});
   [-1,1].forEach(sx=>ribbon(m,strapPath(sx*0.3,1.86,1.8),0.1,0.016));};
