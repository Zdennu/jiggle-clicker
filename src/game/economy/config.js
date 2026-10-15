// ================= ECONOMY CONFIG (data only) =================
// Tweak balance here. Prices/levels/upgrades/garments are plain data; code reads them.
const GROWTH=1.15;                 // upgrade price growth per owned
const LV_MAX=20, LV_STEP=1.07;     // level cap, chest growth factor per level
const CLICK_UPS=[
 {id:'c1',name:'Firm Grip',desc:'+1 per click',base:15,add:1},
 {id:'c2',name:'Double Tap',desc:'+5 per click',base:250,add:5},
 {id:'c3',name:'Power Poke',desc:'+40 per click',base:5000,add:40},
 {id:'c4',name:'Mega Squeeze',desc:'+300 per click',base:100000,add:300}];
const GENS=[
 {id:'g1',name:'Gentle Breeze',base:20,cps:0.2},
 {id:'g2',name:'Bouncy Ball',base:120,cps:1},
 {id:'g3',name:'Trampoline',base:1300,cps:8},
 {id:'g4',name:'Paint Shaker',base:14000,cps:47},
 {id:'g5',name:'Earthquake',base:150000,cps:260},
 {id:'g6',name:'Jiggle Reactor',base:1.6e6,cps:1400}];
const GARMENTS=[
 {id:'bra',name:'Basic Bra',price:500,colors:[0x141414,0x6e1430,0xf3ecdf]},
 {id:'bikini',name:'Bikini Top',price:2500,colors:[0x2a9df4,0xf4d03f,0xe74c3c]},
 {id:'sports',name:'Sports Bra',price:10000,colors:[0x555a64,0x7d3cff,0x2ecc71]},
 {id:'tank',name:'Tank Top',price:50000,colors:[0xffffff,0x1f1f1f,0xe67e22]},
 {id:'tee',name:'T-Shirt',price:250000,colors:[0x3d6fb6,0xc0392b,0x8e8e8e]},
 {id:'hoodie',name:'Hoodie',price:1500000,colors:[0x2c3e50,0x6b4f3a,0xb03060]}];
const PANTIES=[
 {id:'panty',name:'Lace Panties',price:600,colors:[0x3a0f34,0x141414,0xf3ecdf],colorNames:['Plum','Black','Ivory']}];

// ---- tops (worn over / instead of a bra). 'free:true' = owned from the start ----
const TOPS=[
 {id:'croptank',name:'Ribbed Crop Tank',price:0,free:true,colors:[0xf6f1ee,0xc9c2cc,0xf7c6d6,0xd9c8f0],colorNames:['White','Heather','Blush','Lavender']}];

// ==== NUDITY GATE ====================================================================================
// Being fully topless (no top AND no bra) is only selectable from this level on. Change this one number
// to move the unlock (e.g. 0 = always allowed, 21 = never, since max level is 20).
const TOPLESS_UNLOCK_LEVEL=10;
// =====================================================================================================

// ---- mood-lighting scenes (data only; 'unlock' = level needed, 0 = open). key/fill/rim = [hex, intensity] ----
const SCENES=[
 {id:'studio',name:'Studio Pink',icon:'🌸',unlock:0,exposure:1.2,key:[0xffe0c2,1.35],fill:[0xffe6d0,0.45],rim:[0xffd0e4,0.85],hemi:[0xfff0f5,0xb07a86,0.85],amb:1.5,
  bg:{base:'radial-gradient(120% 85% at 50% 35%, #fff1f6 0%, #fbd3e2 45%, #f2b3cb 100%)',glow:'radial-gradient(60% 40% at 50% 42%, rgba(255,255,255,.55), rgba(255,255,255,0) 70%)',
      bokeh:[[14,22,90,'255,255,255',.55],[84,18,70,'214,190,245',.45],[8,70,120,'255,255,255',.4],[90,64,100,'255,215,190',.4],[30,88,60,'230,200,250',.45],[72,90,80,'255,255,255',.45]],
      vignette:'radial-gradient(130% 100% at 50% 45%, rgba(230,120,160,0) 60%, rgba(214,110,150,.28) 100%)'}},
 {id:'candle',name:'Candlelight',icon:'🕯️',unlock:0,exposure:1.05,flicker:0.08,key:[0xffa860,1.45],fill:[0xff8a50,0.3],rim:[0xffb070,0.7],hemi:[0xffc89a,0x40201a,0.5],amb:0.7,
  bg:{base:'radial-gradient(110% 80% at 50% 45%, #6e3a28 0%, #3c1d18 55%, #1e0e0e 100%)',glow:'radial-gradient(55% 40% at 50% 50%, rgba(255,170,90,.35), rgba(255,170,90,0) 70%)',
      bokeh:[[12,30,60,'255,180,90',.55],[86,26,50,'255,200,120',.5],[20,78,80,'255,150,70',.35],[80,74,70,'255,190,110',.4]],
      vignette:'radial-gradient(130% 100% at 50% 45%, rgba(0,0,0,0) 55%, rgba(10,4,2,.55) 100%)'}},
 {id:'sunset',name:'Sunset Beach',icon:'🌅',unlock:0,exposure:1.15,key:[0xffc896,1.1],fill:[0xffb0a0,0.4],rim:[0xffb040,1.6],hemi:[0xffd8b0,0x7a5a6a,0.7],amb:1.1,
  bg:{base:'linear-gradient(180deg, #ff9a8b 0%, #ffb88c 38%, #ffd39a 52%, #8fb8d8 53%, #6a9cc4 100%)',glow:'radial-gradient(45% 30% at 50% 52%, rgba(255,240,180,.85), rgba(255,200,120,0) 70%)',
      bokeh:[[15,20,70,'255,230,200',.35],[85,30,60,'255,220,180',.3],[40,70,50,'255,255,255',.3],[70,80,60,'255,255,255',.25]],
      vignette:'radial-gradient(130% 100% at 50% 45%, rgba(0,0,0,0) 60%, rgba(120,50,60,.3) 100%)'}},
 {id:'neon',name:'Neon Club',icon:'🪩',unlock:0,exposure:1.15,key:[0xffd6e8,0.95],fill:[0x6a7bff,0.9],rim:[0xff3cc8,2.0],hemi:[0xc080ff,0x301040,0.6],amb:0.8,
  bg:{base:'radial-gradient(120% 90% at 50% 40%, #3a1458 0%, #1c0b33 55%, #0b0618 100%)',glow:'radial-gradient(50% 35% at 50% 45%, rgba(255,80,200,.3), rgba(255,80,200,0) 70%)',
      bokeh:[[10,20,80,'255,60,200',.5],[88,24,70,'80,140,255',.5],[18,76,90,'170,80,255',.45],[84,72,80,'255,80,160',.45],[50,10,50,'90,220,255',.4]],
      vignette:'radial-gradient(130% 100% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,.5) 100%)'}},
 {id:'moon',name:'Moonlight',icon:'🌙',unlock:0,exposure:1.1,key:[0xc8d8ff,1.05],fill:[0xffd8c0,0.35],rim:[0x9ab8ff,1.2],hemi:[0xb0c4ff,0x2a2438,0.7],amb:1.0,
  bg:{base:'radial-gradient(120% 90% at 50% 30%, #3c4c7a 0%, #1f2848 55%, #0e1226 100%)',glow:'radial-gradient(40% 30% at 70% 18%, rgba(220,230,255,.5), rgba(220,230,255,0) 70%)',
      bokeh:[[72,16,60,'235,240,255',.6],[12,30,40,'200,215,255',.35],[30,80,60,'160,180,255',.3],[86,70,50,'200,210,255',.3]],
      vignette:'radial-gradient(130% 100% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,10,.5) 100%)'}}];
