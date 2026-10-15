// ================= QUALITY PRESETS =================
// low / med / high: body mesh density, shadow map, texture size, pixel-ratio cap. 'auto' picks by device.
const QUALITY_PRESETS={
  low :{pr:1.25,bu:200,bv:220,shadow:512, skinTex:512, laceScale:0.5},
  med :{pr:2,   bu:260,bv:280,shadow:1024,skinTex:1024,laceScale:0.75},
  high:{pr:3,   bu:320,bv:340,shadow:1024,skinTex:1024,laceScale:1},
};
const QUALITY_KEY='jc_quality';
function autoQuality(){const mem=navigator.deviceMemory||4,cores=navigator.hardwareConcurrency||4,mobile=/Android|iPhone|iPad|Mobi/i.test(navigator.userAgent);
  if(mem<=3||cores<=4)return 'low';return mobile?'med':'high';}
const QUALITY_PICK=(()=>{try{return localStorage.getItem(QUALITY_KEY)||'auto';}catch(e){return 'auto';}})();
const QUALITY_NAME=QUALITY_PICK==='auto'?autoQuality():QUALITY_PICK;
const QUALITY=Object.assign({name:QUALITY_NAME},QUALITY_PRESETS[QUALITY_NAME]||QUALITY_PRESETS.med);
