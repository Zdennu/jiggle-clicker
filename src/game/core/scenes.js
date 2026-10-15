// ================= MOOD LIGHTING SCENES (data in economy/config.js -> SCENES) =================
// Recolours the existing 4 lights + CSS backdrop only: no extra lights or passes, so cost is identical on every quality preset.
let SCN=SCENES[0];
function applyScene(id){SCN=SCENES.find(s=>s.id===id)||SCENES[0];state.scene=SCN.id;
  light.color.set(SCN.key[0]);light.intensity=SCN.key[1];fill.color.set(SCN.fill[0]);fill.intensity=SCN.fill[1];
  rim.color.set(SCN.rim[0]);rim.intensity=SCN.rim[1];hemi.color.set(SCN.hemi[0]);hemi.groundColor.set(SCN.hemi[1]);hemi.intensity=SCN.hemi[2];
  amb.intensity=SCN.amb;renderer.toneMappingExposure=SCN.exposure;applyBackdrop(SCN.bg);
  document.body.dataset.scene=SCN.id;const b=document.getElementById('sceneBtn');if(b)b.textContent=SCN.icon+' '+SCN.name;}
function sceneTick(now){if(!SCN.flicker||QUALITY.name==='low')return;   // candle flicker: two slow sines + jitter
  const f=Math.sin(now*0.0071)*0.5+Math.sin(now*0.0173+1.3)*0.35+Math.sin(now*0.041)*0.15;light.intensity=SCN.key[1]*(1+SCN.flicker*f);}
(()=>{const b=document.createElement('button');b.id='sceneBtn';b.title='Change mood lighting';
  b.onclick=()=>{const open=SCENES.filter(s=>(state.level||0)>=s.unlock),i=open.indexOf(SCN);applyScene(open[(i+1)%open.length].id);save();};
  document.body.appendChild(b);applyScene(state.scene||'studio');})();
