function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  const g=cpsTotal()*dt;if(g){state.points+=g;state.total+=g;}
  updateLevel(dt);sceneTick(now);idleTick(dt,now);stepSprings(dt);thighStep(dt);
  uiAcc+=dt;if(uiAcc>0.1){uiAcc=0;refresh();}
  renderer.render(scene,camera);
}
refresh();requestAnimationFrame(animate);

window.jcToast=m=>toast(m);   // used by the Android wrapper ('Updated to vN')
// debug/test handle (module scope is private)
window.__jc={get state(){return state;},QUALITY,camera,nipples,THREE,applyGarment,setLevelF,adminLevel,applyScene,BR,BR0,SCENES,renderWardrobe,IDLE,headG,body,headReact,idleTick};
