function animate(now){
  requestAnimationFrame(animate);
  const dt=Math.min(0.05,(now-last)/1000);last=now;
  const g=cpsTotal()*dt;if(g){state.points+=g;state.total+=g;}
  updateLevel(dt);stepSprings(dt);thighStep(dt);
  uiAcc+=dt;if(uiAcc>0.1){uiAcc=0;refresh();}
  renderer.render(scene,camera);
}
refresh();requestAnimationFrame(animate);

// debug/test handle (module scope is private)
window.__jc={get state(){return state;},QUALITY,camera,nipples,THREE,applyGarment,setLevelF,adminLevel};
