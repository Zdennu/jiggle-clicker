// ================= BACKDROP (swap here) =================
// Pure CSS layers behind a transparent WebGL canvas: zero per-frame cost on mobile.
// To change the look, edit BACKDROP or replace applyBackdrop(); to disable, set BACKDROP=null.
const BACKDROP={
  base:'radial-gradient(120% 85% at 50% 35%, #fff1f6 0%, #fbd3e2 45%, #f2b3cb 100%)',      // baby pink studio
  glow:'radial-gradient(60% 40% at 50% 42%, rgba(255,255,255,.55), rgba(255,255,255,0) 70%)', // key-light spill behind subject
  bokeh:[[14,22,90,'255,255,255',.55],[84,18,70,'214,190,245',.45],[8,70,120,'255,255,255',.4],[90,64,100,'255,215,190',.4],[30,88,60,'230,200,250',.45],[72,90,80,'255,255,255',.45],[50,8,50,'255,190,215',.5],[20,48,36,'255,255,255',.6],[80,42,40,'255,255,255',.55]], // [x%,y%,size px,rgb,alpha]
  vignette:'radial-gradient(130% 100% at 50% 45%, rgba(230,120,160,0) 60%, rgba(214,110,150,.28) 100%)'
};
function applyBackdrop(cfg){
  const el=document.getElementById('backdrop');
  if(!cfg){el.style.background='#0a0a0a';return;}
  const spots=cfg.bokeh.map(([x,y,r,c,a])=>`radial-gradient(${r}px ${r}px at ${x}% ${y}%, rgba(${c},${a}) 0%, rgba(${c},${a*0.6}) 45%, rgba(${c},0) 100%)`);
  el.style.background=[cfg.vignette,cfg.glow,...spots,cfg.base].join(',');
}
applyBackdrop(BACKDROP);
// floating hearts / sparkles layer (CSS only, behind the canvas)
(()=>{const st=document.createElement('style');st.textContent='#sparkles{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden}#sparkles i{position:absolute;bottom:-30px;font-style:normal;opacity:0;animation:rise linear infinite}@keyframes rise{0%{transform:translateY(0) rotate(0);opacity:0}10%{opacity:.55}90%{opacity:.4}100%{transform:translateY(-110vh) rotate(40deg);opacity:0}}';document.head.appendChild(st);
 const d=document.createElement('div');d.id='sparkles';const ic=['♥','✦','♡','✧','♥'];for(let i=0;i<14;i++){const e=document.createElement('i');e.textContent=ic[i%5];e.style.cssText=`left:${(i*7.3+3)%100}%;font-size:${10+(i*5)%14}px;color:${['#ffffff','#f7a8c4','#d9c4f7','#ffd0b8'][i%4]};animation-duration:${14+(i*3)%11}s;animation-delay:-${(i*2.7)%14}s`;d.appendChild(e);}
 document.getElementById('backdrop').after(d);})();
const countEl=document.getElementById('count');const cpsEl=document.getElementById('cps');
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, window.innerWidth/window.innerHeight, 0.1, 100);
camera.position.set(0, 1.4, 4.2);
camera.lookAt(0, 1.1, 0);

const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('canvas'), antialias:true, alpha:true });
renderer.setClearColor(0x000000,0);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio,QUALITY.pr));

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(2, 3, 2);
scene.add(light);
const amb=new THREE.AmbientLight(0x404040, 1.5);scene.add(amb);

const bodyMat = new THREE.MeshStandardMaterial({ color: 0xd4a574, roughness:0.55, metalness:0.05 });
renderer.outputEncoding = THREE.sRGBEncoding;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.2;
light.intensity = 1.35; light.color.set(0xffe0c2); light.position.set(1.8,2.6,2.6);
const fill = new THREE.DirectionalLight(0xffe6d0, 0.45); fill.position.set(-3, 1.2, 2.5); scene.add(fill);
const rim = new THREE.DirectionalLight(0xffd0e4, 0.85); rim.position.set(-1.5, 2.5, -3); scene.add(rim);
const hemi=new THREE.HemisphereLight(0xfff0f5, 0xb07a86, 0.85);scene.add(hemi);

