// achievements: name + test(state)
const ACH=[
 {id:'a1',name:'First poke!',test:s=>s.total>=1},
 {id:'a2',name:'100 points',test:s=>s.total>=100},
 {id:'a3',name:'1K points',test:s=>s.total>=1e3},
 {id:'a4',name:'1M points',test:s=>s.total>=1e6},
 {id:'a5',name:'1B points',test:s=>s.total>=1e9},
 {id:'a6',name:'500 clicks',test:s=>s.clicks>=500},
 {id:'a7',name:'Automated: 10/s',test:()=>cpsTotal()>=10},
 {id:'a8',name:'Industrial: 1K/s',test:()=>cpsTotal()>=1000}];
