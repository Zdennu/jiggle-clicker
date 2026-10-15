// ---------- Levels: XP = total points; chest grows ~7%/level (compounding), capped ----------
const lvNeed=n=>n<=0?0:Math.round(120*Math.pow(1.8,n));
function levelFor(total){let n=0;while(n<LV_MAX&&total>=lvNeed(n+1))n++;return n;}
let lvShown=Math.min(LV_MAX,state.level||levelFor(state.total));
function setLevelF(L){lvF=L;thighLevel(L);Object.assign(BR,brFor(Math.pow(LV_STEP,L)));deformables.forEach(r=>r.apply(L));deformDirty=true;{const AS=1/(1+0.9*(BR.sw||0)*(BR.sR||0.3)/0.37);if(paintBody.as&&Math.abs(AS-paintBody.as)>0.03)paintBody(paintBody.last!==false);}if(window.fitCamera&&camera)fitCamera();}
setLevelF(lvShown);
// ---- level-up moment: swell-and-bounce (overshoot inflation + spring impulse), glow flash, haptics ----
const LVUP={t:-1};
function swellAt(t){if(t<0||t>1.2)return 0;return t<0.16?0.11*Math.sin(t/0.16*Math.PI/2):0.11*Math.exp(-(t-0.16)*5.5)*Math.cos((t-0.16)*17);}
function levelUpFx(){LVUP.t=0;thighKick(0.9);
  for(const s of [SL,SR]){s.v[1]+=0.9;s.v[2]+=0.5;} SL.v[0]-=0.35;SR.v[0]+=0.35;
  try{if(navigator.vibrate)navigator.vibrate([25,40,70]);}catch(_){}
  let f=document.getElementById('lvflash');if(!f){f=document.createElement('div');f.id='lvflash';
    f.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:14;opacity:0;background:radial-gradient(ellipse at 50% 45%,rgba(255,235,245,.8),rgba(248,170,205,.35) 42%,rgba(0,0,0,0) 70%);transition:opacity .5s ease-out';document.body.appendChild(f);}
  f.style.transition='none';f.style.opacity='1';requestAnimationFrame(()=>requestAnimationFrame(()=>{f.style.transition='opacity .9s ease-out';f.style.opacity='0';}));
  const b=document.getElementById('lvbar');if(b&&b.animate)b.animate([{transform:'scale(1)'},{transform:'scale(1.15)'},{transform:'scale(1)'}],{duration:450,easing:'ease-out'});}
function updateLevel(dt){
  const L=levelFor(state.total);
  if(L!==state.level){const up=L>(state.level||0);state.level=L;if(up&&L>lvShown){toast('LEVEL UP! Lv '+L);levelUpFx();}lvShown=L;save();}
  const t=lvShown;if(Math.abs(t-lvF)>1e-3)setLevelF(Math.abs(t-lvF)<0.004?t:lvF+(t-lvF)*Math.min(1,dt*2.2));
  const a=lvNeed(L),b=lvNeed(L+1),f=L>=LV_MAX?1:Math.max(0,Math.min(1,(state.total-a)/(b-a)));
  lvFill.style.width=(f*100).toFixed(1)+'%';
  const tx=L>=LV_MAX?'Lv '+L+' MAX':'Lv '+L;if(lvBadge.textContent!==tx)lvBadge.textContent=tx;
  lvTxt.parentNode.title=L>=LV_MAX?'Max level':fmt(state.total)+' / '+fmt(b)+' XP';
}
function floatText(x,y,txt){
  const f=document.createElement('div');f.className='float';f.textContent=txt;
  f.style.left=x+'px';f.style.top=y+'px';f.style.transform='translate(-50%,0)';
  document.body.appendChild(f);setTimeout(()=>f.remove(),1000);
  const ic=['💗','💖','✨','💕','🌸'];for(let i=0;i<4;i++){const h=document.createElement('div');h.className='heart';h.textContent=ic[(Math.random()*ic.length)|0];
    h.style.left=(x+(Math.random()-0.5)*30)+'px';h.style.top=(y+(Math.random()-0.5)*20)+'px';h.style.setProperty('--dx',((Math.random()-0.5)*70).toFixed(0)+'px');h.style.setProperty('--r',((Math.random()-0.5)*60).toFixed(0)+'deg');
    h.style.animationDelay=(i*0.05)+'s';h.style.fontSize=(13+Math.random()*10)+'px';document.body.appendChild(h);setTimeout(()=>h.remove(),1300);}
}

const raycaster=new THREE.Raycaster(),mouse=new THREE.Vector2();
function onPointer(e){
  if(e.isPrimary===false)return;
  e.preventDefault();
  const rect=renderer.domElement.getBoundingClientRect();
  mouse.x=((e.clientX-rect.left)/rect.width)*2-1;
  mouse.y=-((e.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(mouse,camera);
  const hits=raycaster.intersectObjects([body],true);
  if(hits.length){
    const lp=body.worldToLocal(hits[0].point.clone());if(lp.z<0)return;
    const rl=breastR(lp.x,lp.y,-1),rr=breastR(lp.x,lp.y,1);
    if(Math.min(rl,rr)>1.6)return;   // generous grab/tap area incl. cleavage and edges
    const o=rl<rr?leftBreast:rightBreast;
    const p=clickPower();state.points+=p;state.total+=p;state.clicks++;
    jiggle(o);floatText(e.clientX,e.clientY,'+'+fmt(p));refresh();
    // grab candidate: becomes a drag after ~150ms hold or >6px movement
    GRAB.cand={o,id:e.pointerId,x0:e.clientX,y0:e.clientY,t0:performance.now(),lx:e.clientX,ly:e.clientY,lt:performance.now(),vx:0,vy:0,acc:0};
    try{renderer.domElement.setPointerCapture(e.pointerId);}catch(_){}
  }
}
