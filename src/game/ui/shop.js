// Shop UI
const shop=document.getElementById('shop'),btns={};
function buildList(el,list,isGen){
  list.forEach(u=>{
    const d=document.createElement('div');d.className='item';
    d.innerHTML=`<div><div class="n">${u.name} <span class="o"></span></div><div class="d">${isGen?'+'+fmt(u.cps)+'/s each':u.desc}</div></div><button></button>`;
    const b=d.querySelector('button');
    b.onclick=()=>{const c=cost(u);if(state.points>=c){state.points-=c;state.owned[u.id]=own(u.id)+1;refresh();save();}};
    btns[u.id]={b,o:d.querySelector('.o'),u};el.appendChild(d);
  });
}
buildList(document.getElementById('clickList'),CLICK_UPS,false);
buildList(document.getElementById('genList'),GENS,true);
document.getElementById('upgrades').onclick=()=>{document.getElementById('wardrobe').classList.remove('open');shop.classList.toggle('open');};
document.getElementById('close').onclick=()=>shop.classList.remove('open');
document.getElementById('reset').onclick=()=>{
  if(confirm('Reset all progress?')){state=fresh();localStorage.removeItem(SAVE_KEY);applyGarment();refresh();}
};
function refresh(){
  countEl.textContent=fmt(state.points);
  cpsEl.textContent='+'+fmt(cpsTotal())+'/s · '+fmt(clickPower())+'/click';
  for(const k in btns){const{b,o,u}=btns[k],c=cost(u);b.textContent=fmt(c);b.disabled=state.points<c;o.textContent=own(k)?'×'+own(k):'';}
  checkAch();
}
function toast(msg){
  const lv=/^LEVEL UP/.test(msg);const t=document.createElement('div');t.className='toast'+(lv?' lv':'');t.textContent=(lv?'💖 ':'🏆 ')+msg+(lv?' ✨':'');
  document.getElementById('toasts').appendChild(t);setTimeout(()=>t.remove(),3000);
}
function checkAch(){ACH.forEach(a=>{if(!state.ach[a.id]&&a.test(state)){state.ach[a.id]=1;toast(a.name);save();}});}


