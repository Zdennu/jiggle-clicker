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
