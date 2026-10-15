// ================= SAVE (versioned schema, key kept for compatibility) =================
// Storage key stays 'clicker3d_save_v1' so existing players keep progress; the schema version lives in state.v.
const SAVE_KEY='clicker3d_save_v1', SAVE_VERSION=2;
const SAVE_MIGRATIONS={
  // v1 (no 'v' field): single garment slot -> per-category slots {bra, panty}
  1:s=>{const e=s.equipped;if(!e||typeof e!=='object'){s.equipped={bra:null,panty:null};if(typeof e==='string')s.equipped[e==='panty'?'panty':'bra']=e;}return s;},
};
function migrateSave(s){let v=s.v||1;while(v<SAVE_VERSION){s=(SAVE_MIGRATIONS[v]||(x=>x))(s);v++;}s.v=SAVE_VERSION;return s;}
function fresh(){return{v:SAVE_VERSION,level:0,points:0,total:0,clicks:0,owned:{},ach:{},wardrobe:{},equipped:null,colors:{}};}
let state=fresh();
try{const s=JSON.parse(localStorage.getItem(SAVE_KEY));if(s)state=Object.assign(fresh(),migrateSave(s));}catch(e){}
const own=id=>state.owned[id]||0;
const cost=u=>Math.ceil(u.base*Math.pow(GROWTH,own(u.id)));
const clickPower=()=>1+CLICK_UPS.reduce((a,u)=>a+u.add*own(u.id),0);
function cpsTotal(){return GENS.reduce((a,g)=>a+g.cps*own(g.id),0);}
function fmt(n){
  if(n<1000)return n<10&&n%1?n.toFixed(1):Math.floor(n).toString();
  const u=['K','M','B','T','Qa','Qi'];let i=-1;
  while(n>=1000&&i<u.length-1){n/=1000;i++;}
  return n.toFixed(n<10?2:n<100?1:0)+u[i];
}
function save(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(state));}catch(e){}}
setInterval(save,5000);window.addEventListener('beforeunload',save);
document.addEventListener('visibilitychange',()=>{if(document.hidden)save();});

