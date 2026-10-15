// ---------- press-and-hold grab & drag ----------
const GRAB={cand:null,on:null,target:[0,0,0],lastAward:0};
function pxToWorld(){return 2*camera.position.distanceTo(new THREE.Vector3(0,1.6,0))*Math.tan(THREE.MathUtils.degToRad(camera.fov/2))/innerHeight;}
function grabMove(e){const g=GRAB.cand;if(!g||e.pointerId!==g.id)return;e.preventDefault();
  const now=performance.now(),dx=e.clientX-g.x0,dy=e.clientY-g.y0;
  if(!GRAB.on&&(now-g.t0>150||Math.hypot(dx,dy)>6))GRAB.on=g;
  const dt=Math.max(1,now-g.lt)/1000;g.vx=(e.clientX-g.lx)/dt;g.vy=(e.clientY-g.ly)/dt;
  const step=Math.hypot(e.clientX-g.lx,e.clientY-g.ly);g.lx=e.clientX;g.ly=e.clientY;g.lt=now;
  if(!GRAB.on)return;
  const s=pxToWorld(),lim=0.45*(1+0.02*(lvF||0)),soft=v=>lim*Math.tanh(v/lim);   // stretch, but can't be pulled off
  GRAB.target=[soft(dx*s),soft(-dy*s),0.35*soft(Math.hypot(dx,dy)*s)];
  // points while dragging: per distance moved, rate-capped (max ~5 awards/s, each 1/4 click)
  g.acc+=step*s;if(g.acc>0.04&&now-GRAB.lastAward>200){g.acc=0;GRAB.lastAward=now;const p=Math.max(1,Math.floor(clickPower()/4));
    state.points+=p;state.total+=p;floatText(e.clientX,e.clientY-30,'+'+fmt(p));}
}
function grabEnd(e){const g=GRAB.cand;if(!g||e.pointerId!==g.id)return;
  if(GRAB.on){const s=springs.get(g.o),w=pxToWorld();s.v[0]+=Math.max(-1.2,Math.min(1.2,g.vx*w*0.5));s.v[1]+=Math.max(-1.2,Math.min(1.2,-g.vy*w*0.5));}
  GRAB.on=null;GRAB.cand=null;save();}
renderer.domElement.addEventListener('pointermove',grabMove,{passive:false});
renderer.domElement.addEventListener('pointerup',grabEnd);renderer.domElement.addEventListener('pointercancel',grabEnd);
renderer.domElement.addEventListener('contextmenu',e=>e.preventDefault());
renderer.domElement.addEventListener('touchstart',e=>{if(e.touches.length===1&&e.cancelable)e.preventDefault();},{passive:false});
// single pointer listener only (fixes pointerdown + touchstart double-fire)
renderer.domElement.addEventListener('pointerdown',onPointer);

window.addEventListener('resize',()=>{
  camera.aspect=window.innerWidth/window.innerHeight;camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth,window.innerHeight);fitCamera();
});
function fitCamera(){
  const a=camera.aspect;
  if(a>=0.8){camera.position.set(0,1.4,4.2);camera.lookAt(0,1.1,0);return;}
  // portrait phones (~9:16 to 9:20): fit shoulders/chest to ~94% of screen width, chest centred
  // adapts to current chest size so level 20 still fits
  const halfW=Math.max(0.66,BR.cx+BR.rx*0.92+0.35*BR.h)/0.96, tanH=Math.tan(THREE.MathUtils.degToRad(camera.fov/2))*a;
  // frame neck -> upper thighs (just below the crotch line), chest kept in the upper-middle as the focus
  const tanV=Math.tan(THREE.MathUtils.degToRad(camera.fov/2));
  // collarbones -> upper thighs; top ~14% of the screen is UI, so aim slightly high
  const d=Math.max(halfW/tanH+0.15+BR.h, 1.34/tanV+0.3);   // collarbones -> upper thighs fill the screen
  const ty=1.78;   // head top -> hips; chest in the middle
  camera.position.set(0,ty+0.08,d);camera.lookAt(0,ty,0);
}
fitCamera();

let last=performance.now(),uiAcc=0;
