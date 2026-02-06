export const LEVELS = [
  { id:'level1', name:'Neon Yard', arenaSize:{width:480,height:800}, backgroundColor:'#1a1f36', spawnPatterns:['radial','aimed'], music:null, unlockCondition:{type:'default'} },
  { id:'level2', name:'Circuit Ruins', arenaSize:{width:640,height:960}, backgroundColor:'#23233f', spawnPatterns:['spiral','aimed','miniboss'], music:null, unlockCondition:{type:'score',value:900} },
  { id:'level3', name:'Abyss Core', arenaSize:{width:760,height:1200}, backgroundColor:'#101824', spawnPatterns:['denseWave','spiral','bossPhase'], music:null, unlockCondition:{type:'levelsCompleted',value:2} }
];
