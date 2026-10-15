// ================= SETTINGS: graphics quality toggle (pink pill in the shop panel) =================
(()=>{const b=document.createElement('button');b.id='qualityBtn';
  const label=()=>'✨ Quality: '+(QUALITY_PICK==='auto'?'Auto ('+QUALITY.name+')':QUALITY.name[0].toUpperCase()+QUALITY.name.slice(1));
  b.textContent=label();b.title='Tap to cycle Auto / Low / Med / High (reloads)';
  b.onclick=()=>{const seq=['auto','low','med','high'],n=seq[(seq.indexOf(QUALITY_PICK)+1)%seq.length];try{save();localStorage.setItem(QUALITY_KEY,n);}catch(e){}location.reload();};
  const r=document.getElementById('reset');r.parentNode.insertBefore(b,r);})();
