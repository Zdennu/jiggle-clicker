// ---------- Admin ----------
function adminAdd(n){n=Number(n);if(!isFinite(n)||n<=0)return;state.points+=n;save();refresh();}
document.getElementById('adminBtn').onclick=()=>document.getElementById('admin').classList.toggle('open');
document.getElementById('adminAdd').onclick=()=>{const i=document.getElementById('adminAmt');adminAdd(i.value);i.value='';};
// admin level shortcuts: set total XP to the target level's threshold so the level system stays consistent
function adminLevel(v){const cur=levelFor(state.total);
  const to=v==='max'?LV_MAX:Math.max(0,Math.min(LV_MAX,cur+Number(v)));if(to===cur)return;
  state.total=lvNeed(to);save();refresh();}
document.querySelectorAll('#admin [data-lv]').forEach(b=>b.onclick=()=>adminLevel(b.dataset.lv));
document.querySelectorAll('#admin [data-add]').forEach(b=>b.onclick=()=>adminAdd(b.dataset.add));

