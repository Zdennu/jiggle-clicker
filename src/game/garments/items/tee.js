// garment item: tee  (mesh builder; data/price lives in economy/config.js)
BUILD.tee=m=>{const top=t=>front(t)?2.1+0.1*Math.pow(uOf(t),1.5):2.2;
   tops(m,{bot:0.4,top,off:0.02,loose:0.03,sleeve:0.06});};
