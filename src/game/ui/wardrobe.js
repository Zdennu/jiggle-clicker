// ---- categories: one data array per category (name, price, colours). Add items here; BUILD[id] makes the mesh. ----
const CATS=[{key:'bra',label:'Bras',icon:'🎀',items:GARMENTS},{key:'panty',label:'Panties',icon:'👙',items:PANTIES}];
const allItems=()=>CATS.flatMap(c=>c.items);
// save migration: old saves had equipped = 'id' | null (single slot)
(function migrateEquip(){const e=state.equipped;if(!e||typeof e!=='object'){const o={};CATS.forEach(c=>o[c.key]=null);
  if(typeof e==='string'){const c=CATS.find(c=>c.items.some(g=>g.id===e));if(c)o[c.key]=e;}state.equipped=o;}
  CATS.forEach(c=>{if(!(c.key in state.equipped))state.equipped[c.key]=null;});})();
function buildGarment(id){
  const g=allItems().find(x=>x.id===id);
  const mat=new THREE.MeshStandardMaterial({color:new THREE.Color(g.colors[state.colors[id]||0]).convertSRGBToLinear(),roughness:id==='bikini'?0.5:0.85,side:THREE.DoubleSide,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1});
  // garment built at level 0; other levels rebuilt on demand with identical topology (cached)
  const cache={},n0=garmentParts.length;
  const at=L=>{if(!cache[L]){const k=garmentParts.length;withBR(brL(L),()=>BUILD[id](mat));const P=garmentParts.splice(k);
    cache[L]=P.map(m=>({pos:Float32Array.from(m.geometry.attributes.position.array),xy:m.userData.rest}));P.forEach(m=>{m.parent.remove(m);m.geometry.dispose();});}return cache[L];};
  withBR(brL(0),()=>BUILD[id](mat));const mine=garmentParts.slice(n0);
  cache[0]=mine.map(m=>({pos:Float32Array.from(m.geometry.attributes.position.array),xy:m.userData.rest}));
  const wc={}, wallAt=L=>{if(!wc[L]){const k=garmentParts.length;FLAT=true;try{withBR(brL(L),()=>BUILD[id](mat));}finally{FLAT=false;}const P=garmentParts.splice(k);
    wc[L]=P.map(m=>Float32Array.from(m.geometry.attributes.position.array));P.forEach(m=>{m.parent.remove(m);m.geometry.dispose();});}return wc[L];};
  mine.forEach((m,i)=>{if(m.userData.rest)m.userData.def=registerDeform(m.geometry,L=>at(L)[i],null,null,L=>wallAt(L)[i]);});
}
function applyGarment(){
  if(!state.equipped||typeof state.equipped!=='object')state.equipped={bra:null,panty:null};
  clearGarment();
  const bra=state.equipped.bra&&GARMENTS.find(x=>x.id===state.equipped.bra);
  leftNipple.visible=rightNipple.visible=!bra;
  if(paintBody.last!==!bra){paintBody(!bra);paintBody.last=!bra;}
  CATS.forEach(c=>{const id=state.equipped[c.key];if(id&&c.items.some(g=>g.id===id))buildGarment(id);});
  deformDirty=true;
}
let wardTab='bra';
function renderWardrobe(){
  const L=document.getElementById('wardList');L.innerHTML='';
  const tabs=document.createElement('div');tabs.className='wtabs';
  CATS.forEach(c=>{const b=document.createElement('button');b.className='wtab'+(wardTab===c.key?' on':'');b.textContent=c.icon+' '+c.label;b.onclick=()=>{wardTab=c.key;renderWardrobe();};tabs.appendChild(b);});
  L.appendChild(tabs);
  const cat=CATS.find(c=>c.key===wardTab);
  cat.items.forEach(g=>{
    const owned=!!state.wardrobe[g.id],eq=state.equipped[cat.key]===g.id;
    const d=document.createElement('div');d.className='witem'+(eq?' eq':'');
    d.innerHTML=`<div class="row"><div><b>${g.name}</b>${eq?' <span class="wtag">wearing</span>':''}</div><button></button></div><div class="sws"></div>`;
    const b=d.querySelector('button');
    if(!owned){b.textContent=fmt(g.price);b.disabled=state.points<g.price;
      b.onclick=()=>{if(state.points>=g.price){state.points-=g.price;state.wardrobe[g.id]=1;state.equipped[cat.key]=g.id;applyGarment();save();refresh();renderWardrobe();}};}
    else{b.textContent=eq?'Unequip':'Equip';b.onclick=()=>{state.equipped[cat.key]=eq?null:g.id;applyGarment();save();renderWardrobe();};}
    g.colors.forEach((c,i)=>{const sw=document.createElement('span');sw.className='sw'+((state.colors[g.id]||0)===i?' sel':'');
      sw.style.background=hexStr(c);if(g.colorNames)sw.title=g.colorNames[i];sw.onclick=()=>{state.colors[g.id]=i;if(eq)applyGarment();save();renderWardrobe();};
      d.querySelector('.sws').appendChild(sw);});
    L.appendChild(d);
  });
}
document.getElementById('wardrobeBtn').onclick=()=>{shop.classList.remove('open');renderWardrobe();wardEl.classList.toggle('open');};
document.getElementById('wclose').onclick=()=>wardEl.classList.remove('open');
applyGarment();
let _wSig='';setInterval(()=>{if(!wardEl.classList.contains('open'))return;const sig=allItems().map(g=>state.points>=g.price?1:0).join('');if(sig!==_wSig){_wSig=sig;renderWardrobe();}},500);   // re-render only when affordability changes (keeps buttons stable under the finger)

