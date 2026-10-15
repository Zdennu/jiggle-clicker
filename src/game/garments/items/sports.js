// garment item: sports  (mesh builder; data/price lives in economy/config.js)
BUILD.sports=m=>{const top=t=>{const u=uOf(t);const nk=front(t)?1.72:1.8;return u<0.45?nk+(1.9-nk)*Math.pow(ss(0.05,0.45,u),0.8):1.9-0.26*ss(0.45,0.85,u);};
   shell(m,{mode:1,yBot:()=>1.2,yTop:top,off:()=>0.012});band(m,1.2,1.28,0.018,1);
   [-1,1].forEach(sx=>ribbon(m,strapPath(sx*0.3,1.86,1.76),0.11,0.014));};
