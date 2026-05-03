/* =============================================
   LEGENDARY DECK BATTLE — game.js
   Fully rewritten for quality
============================================= */

'use strict';

// ============================================================
// CARD CLASS
// ============================================================
class Card {
    constructor(data) {
        this.name        = data.name;
        this.cost        = data.cost;
        this.description = data.description;
        this.icon        = data.icon;
        this.type        = data.type;       // attack, defend, heal, skill
        this.target      = data.target;     // enemy, self, both
        this.effect      = data.effect;
        this.cooldown    = data.cooldown || 0;
        this.upgraded    = data.upgraded || false;
    }
    clone() {
        return new Card({...this});
    }
}

// ============================================================
// STATE
// ============================================================
let gs = {
    player: null,
    enemy: null,          // 호환용 (enemies[targetIdx] 참조)
    enemies: [],          // 다중 적 배열
    targetIdx: 0,         // 현재 타겟 인덱스
    deck: [],
    hand: [],
    discardPile: [],
    exhaustPile: [],
    energy: 3,
    maxEnergy: 3,
    turn: 1,
    currentStage: 1,
    maxStage: 5,
    mapRows: [],
    mapPosition: 0,
    mapChosenCol: null,
    gameOver: false,
    inMap: true,
    autoMode: true,
    autoTimer: null,
    autoSpeed: 700,
    selectedChar: 'paladin',
    monsterPool: [],
    selectedBoss: null,
    _selectedDifficulty: 0,
    currentAct: 0,
    tutorialDone: false,
};

// ============================================================
// 세계관: 각인의 서 — 파기된 계약
// ● 신과 인간 사이의 계약(각인)이 붕괴된 세계
// ● 각인 보유자(刻印者)들이 여정을 통해 근원악 「공허의 핵」을 봉인
// ● 에너지 → 각인 수정 / 방어 → 결계 / 독 → 부식 / 강화 → 각성
// ============================================================
let CHARACTER_ICONS = { paladin: '⚔️', mage: '✦', ranger: '◈' };

function getEnemyIcon(name) {
    let map = {
        '그레믈린':'👺','가시':'🌿','독버섯':'🍄','브리아르':'👑',
        '혼령':'👻','납골':'💀','역병':'🧟','서약':'⚔️','리치':'☠️','모르가스':'💜',
        '임프':'😈','파수꾼':'🪨','흑화':'🗡️','박쥐':'🦇','점술사':'🔮','바알':'🐉',
    };
    for (let [k,v] of Object.entries(map)) { if (name.includes(k)) return v; }
    return '👾';
}

let PLAYER_TEMPLATES = {
    paladin: { name:'가론 (서약기사)', maxHp:70, hp:70, def:0, power:1, gold:50, cooldowns:{}, relics:[], ownedCards:{}, cardUpgrades:{} },
    mage:    { name:'세라 (균열술사)', maxHp:55, hp:55, def:0, power:1, gold:50, cooldowns:{}, relics:[], ownedCards:{}, cardUpgrades:{} },
    ranger:  { name:'이안 (추적자)',   maxHp:60, hp:60, def:0, power:1, gold:50, cooldowns:{}, relics:[], ownedCards:{}, cardUpgrades:{} },
};

let STARTING_RELICS = {
    paladin: '서약의 심장',
    mage:    '균열의 눈',
    ranger:  '추적자의 각인',
};

let RELIC_DATA = {
    // ── 시작 각인 유물 (직업 전용, 특별) ──
    '서약의 심장':    { icon:'⚜️', rarity:'special', desc:'매 전투 시작 결계 +3 (가론 전용)',
        onBattleStart: p => { p.def += 3; } },
    '균열의 눈':      { icon:'🔮', rarity:'special', desc:'각인력 영구 +1, 최대 생명 +5 (세라 전용)',
        onAcquire: p => { p.power += 1; p.maxHp += 5; p.hp += 5; } },
    '추적자의 각인':  { icon:'🪶', rarity:'special', desc:'각인력 영구 +1, 매 전투 결계 +1 (이안 전용)',
        onBattleStart: p => { p.def += 1; }, onAcquire: p => { p.power += 1; } },

    // ── 일반 유물 ──
    '고대의 반지':    { icon:'💍', rarity:'common', desc:'각인력 영구 +1', onAcquire: p => { p.power += 1; } },
    '치유 각인석':    { icon:'⚗️', rarity:'common', desc:'즉시 생명력 +15', onAcquire: p => { p.hp = Math.min(p.maxHp, p.hp + 15); } },
    '전투의 함성':    { icon:'📯', rarity:'common', desc:'각인력 영구 +2', onAcquire: p => { p.power += 2; } },
    '불굴의 부적':    { icon:'🔮', rarity:'common', desc:'최대 생명 +10', onAcquire: p => { p.maxHp += 10; p.hp += 10; } },
    '영혼의 돌':      { icon:'🪨', rarity:'common', desc:'매 전투 시작 최대 생명의 5% 회복', onBattleStart: p => { p.hp = Math.min(p.maxHp, p.hp + Math.ceil(p.maxHp * 0.05)); } },
    '수호천사의 깃털':{ icon:'🪶', rarity:'common', desc:'매 전투 시작 결계 +6', onBattleStart: p => { p.def += 6; } },
    '황금 동전':      { icon:'🪙', rarity:'common', desc:'전투 승리 시 각인석 +8', onBattleStart: () => {} },
    '강철 의지':      { icon:'⚙️', rarity:'common', desc:'최대 생명 +5, 각인력 +1, 매 전투 결계 +1', onAcquire: p => { p.maxHp+=5; p.hp+=5; p.power+=1; }, onBattleStart: p => { p.def+=1; } },
    '생명의 씨앗':    { icon:'🌱', rarity:'common', desc:'최대 생명 +20', onAcquire: p => { p.maxHp += 20; p.hp += 20; } },
    '수호의 방패':    { icon:'🛡️', rarity:'common', desc:'매 전투 시작 결계 +8', onBattleStart: p => { p.def += 8; } },
    '약탈자의 주머니':{ icon:'👜', rarity:'common', desc:'전투 승리 시 각인석 +15', onBattleStart: () => {} },
    '공명석':         { icon:'🔔', rarity:'common', desc:'전투 승리 시 생명력 +3', onBattleStart: () => {} },

    // ── 희귀 유물 ──
    '용의 비늘':      { icon:'🐉', rarity:'rare', desc:'결계 영구 +3', onAcquire: p => { p.def += 3; } },
    '마나 수정':      { icon:'💎', rarity:'rare', desc:'매 흐름 시작 각인 수정 +1 (최대 4)', onTurnStart: () => { gs.maxEnergy=Math.max(gs.maxEnergy,4); gs.energy=Math.min(gs.energy+1,gs.maxEnergy); } },
    '피의 계약':      { icon:'🩸', rarity:'rare', desc:'생명 -8, 각인력 영구 +3', onAcquire: p => { p.hp=Math.max(1,p.hp-8); p.power+=3; } },
    '파괴의 인장':    { icon:'💢', rarity:'rare', desc:'각인력 영구 +2, 최대 생명 -10', onAcquire: p => { p.power+=2; p.maxHp=Math.max(10,p.maxHp-10); p.hp=Math.min(p.hp,p.maxHp); } },
    '무기 숫돌':      { icon:'🔪', rarity:'rare', desc:'각인력 영구 +1, 매 전투 시작 각인력 +1', onBattleStart: p => { p.power+=1; }, onAcquire: p => { p.power+=1; } },
    '고대의 심장':    { icon:'💜', rarity:'rare', desc:'최대 생명 +15, 매 전투 결계 +2', onAcquire: p => { p.maxHp+=15; p.hp+=15; }, onBattleStart: p => { p.def+=2; } },
    '망자의 해골':    { icon:'💀', rarity:'rare', desc:'매 전투 시작 각인 수정 +1', onBattleStart: () => { gs.energy=Math.min(gs.maxEnergy+2,gs.energy+1); } },
    '불꽃의 심장':    { icon:'🔥', rarity:'rare', desc:'매 전투 시작 각인력 +2, 최대 생명 -5', onAcquire: p => { p.maxHp=Math.max(10,p.maxHp-5); p.hp=Math.min(p.hp,p.maxHp); }, onBattleStart: p => { p.power+=2; } },
    '냉기의 수정':    { icon:'❄️', rarity:'rare', desc:'매 전투 시작 결계 +4, 각인 수정 +1', onBattleStart: p => { p.def+=4; gs.energy=Math.min(gs.maxEnergy+1,gs.energy+1); } },
    '마법사의 모자':  { icon:'🎩', rarity:'rare', desc:'매 흐름 각성 대기 추가 -1', onTurnStart: () => { if(gs.player&&gs.player.cooldowns) for(let k in gs.player.cooldowns) gs.player.cooldowns[k]=Math.max(0,(gs.player.cooldowns[k]||0)-1); } },
    '시간의 모래':    { icon:'⏳', rarity:'rare', desc:'매 전투 시작 모든 각성 대기 -1', onBattleStart: () => { if(gs.player&&gs.player.cooldowns) for(let k in gs.player.cooldowns) gs.player.cooldowns[k]=Math.max(0,(gs.player.cooldowns[k]||0)-1); } },
    '달의 부적':      { icon:'🌙', rarity:'rare', desc:'매 3흐름마다 생명 +8 자동 회복', onTurnStart: () => { if(gs.turn%3===0){ gs.player.hp=Math.min(gs.player.maxHp,gs.player.hp+8); addLog('◈ 달의 부적: 생명 +8','heal'); } } },
    '망각의 서':      { icon:'📜', rarity:'rare', desc:'전투 시작 시 각인패 +2장 드로우', onBattleStart: () => { setTimeout(()=>drawCards(2),200); } },
    '독사의 이빨':    { icon:'🐍', rarity:'rare', desc:'매 전투 시작 적에게 부식 +3', onBattleStart: () => { if(gs.enemy) gs.enemy.poison=(gs.enemy.poison||0)+3; } },
    '고대 지도':      { icon:'🗺️', rarity:'rare', desc:'획득 시 각인석 +30 즉시 지급', onAcquire: p => { p.gold+=30; } },

    // ── 전설 유물 ──
    '마력 증폭기':    { icon:'🔋', rarity:'legendary', desc:'최대 각인 수정 +1, 각인력 +1', onAcquire: p => { gs.maxEnergy+=1; gs.energy+=1; p.power+=1; } },
    '성기사의 서약':  { icon:'✝️', rarity:'legendary', desc:'생명 50% 미만 시 결계 +5 추가', onBattleStart: p => { if(p.hp < p.maxHp*0.5) p.def+=5; } },
    '혈석':           { icon:'🔴', rarity:'legendary', desc:'생명 30% 미만 시 각인력 +5 (전투 1회)', onBattleStart: p => { p._bloodStoneUsed=false; }, onTurnStart: () => { let p=gs.player; if(!p._bloodStoneUsed&&p.hp<p.maxHp*0.3){ p.power+=5; p._bloodStoneUsed=true; addLog('◈ 혈석: 각인력 +5!','event'); showFloat('+5⚡','misc','player'); } } },
    '저주의 눈':      { icon:'👁️', rarity:'legendary', desc:'각인력 영구 +3, 매 흐름 생명 -1', onAcquire: p => { p.power+=3; }, onTurnStart: () => { gs.player.hp=Math.max(1,gs.player.hp-1); } },
    '전쟁의 북':      { icon:'🥁', rarity:'legendary', desc:'매 전투 시작 각인력 +3, 결계 -2', onBattleStart: p => { p.power+=3; p.def=Math.max(0,p.def-2); } },
    '정복자의 왕관':  { icon:'👑', rarity:'legendary', desc:'보스 처치 시 최대 생명 +10, 각인력 +1', onBattleStart: () => {} },
    '어둠의 결정':    { icon:'🖤', rarity:'legendary', desc:'각인력 +4, 생명/최대 생명 -20, 결계 -1', onAcquire: p => { p.power+=4; p.hp=Math.max(1,p.hp-20); p.maxHp=Math.max(10,p.maxHp-20); p.def=Math.max(0,p.def-1); } },
    '연금술 도가니':  { icon:'🧪', rarity:'legendary', desc:'획득 시 생명 +10', onAcquire: p => { p.hp=Math.min(p.maxHp,p.hp+10); } },
    '용사의 휘장':    { icon:'🏅', rarity:'legendary', desc:'각인력 +1, 최대 생명 +10, 결계 +2', onAcquire: p => { p.power+=1; p.maxHp+=10; p.hp+=10; p.def+=2; } },
    '공허의 왕홀':    { icon:'🌑', rarity:'legendary', desc:'전투 시작 시 적의 현재 생명 10% 즉시 소멸', onBattleStart: () => { if(gs.enemy){ let dmg=Math.floor(gs.enemy.hp*0.1); gs.enemy.hp-=dmg; addLog(`◈ 공허의 왕홀: 적 생명 -${dmg}(10%)`, 'damage'); } } },
};




// ============================================================
// 캐릭터별 누적 제약 난이도
// 막 완주 횟수(difficultylevel)에 따라 직업 특성 제한이 추가됨
// ============================================================
let CHAR_PENALTIES = {
    paladin: [
        { lv:1, desc:'흐름 종료 시 결계 -3' },
        { lv:2, desc:'최대 생명 -15' },
        { lv:3, desc:'치유 효과 -30%' },
        { lv:4, desc:'전투 시작 시 각인 수정 -1' },
        { lv:5, desc:'보스전 매 3흐름마다 결계 -2 추가' },
    ],
    mage: [
        { lv:1, desc:'균열 피해 -15%' },
        { lv:2, desc:'최대 각인 수정 -1' },
        { lv:3, desc:'각성 대기 전체 +1' },
        { lv:4, desc:'최대 생명 -10' },
        { lv:5, desc:'전투 시작 시 무작위 오염패 1장 추가' },
    ],
    ranger: [
        { lv:1, desc:'부식 축적 효과 -1 (최소 0)' },
        { lv:2, desc:'시작 패 -1장' },
        { lv:3, desc:'각인석 획득 -20%' },
        { lv:4, desc:'각인력 +효과 절반' },
        { lv:5, desc:'적 재생 효과 강화 (리젠 +50%)' },
    ],
};

// 현재 캐릭터+난이도에 적용되는 패널티 목록 반환
function getCharPenalties(charKey, diffLv) {
    let list = CHAR_PENALTIES[charKey] || [];
    return list.filter(p => p.lv <= diffLv).map(p => p.desc);
}

// 패널티를 실제 게임에 적용
function applyCharPenalties(player, charKey, diffLv) {
    let list = CHAR_PENALTIES[charKey] || [];
    list.forEach(p => {
        if (p.lv > diffLv) return;
        // 팔라딘
        if (charKey === 'paladin') {
            if (p.lv === 2) { player.maxHp -= 15; player.hp = Math.min(player.hp, player.maxHp); }
        }
        // 균열술사
        if (charKey === 'mage') {
            if (p.lv === 2) { gs.maxEnergy = Math.max(1, gs.maxEnergy - 1); }
            if (p.lv === 4) { player.maxHp -= 10; player.hp = Math.min(player.hp, player.maxHp); }
        }
        // 추적자
        if (charKey === 'ranger') {
            if (p.lv === 5) { /* 적 재생 강화 — processGimmick에서 처리 */ }
        }
    });
}

// 패널티별 게임 내 수치 보정
function getCharPenaltyMult(charKey, diffLv, type) {
    // type: 'heal', 'def', 'attack', 'draw', 'poison', 'power', 'gold', 'cooldown', 'energy_start'
    let penalties = CHAR_PENALTIES[charKey] || [];
    let active = penalties.filter(p => p.lv <= diffLv);
    let mult = 1.0;
    let bonus = 0;
    active.forEach(p => {
        // ── 팔라딘 ──
        if (charKey === 'paladin') {
            if (p.lv === 3 && type === 'heal')          mult *= 0.7;   // 치유 -30%
            if (p.lv === 4 && type === 'energy_start')  bonus -= 1;    // 전투 시작 수정 -1
        }
        // ── 균열술사 ──
        if (charKey === 'mage') {
            if (p.lv === 1 && type === 'attack')         mult *= 0.85;  // 균열 피해 -15%
            if (p.lv === 3 && type === 'cooldown')       bonus += 1;    // 각성 대기 +1
        }
        // ── 추적자 ──
        if (charKey === 'ranger') {
            if (p.lv === 1 && type === 'poison')         bonus -= 1;    // 부식 -1
            if (p.lv === 2 && type === 'draw')           bonus -= 1;    // 시작 패 -1
            if (p.lv === 3 && type === 'gold')           mult *= 0.8;   // 각인석 -20%
            if (p.lv === 4 && type === 'power')          mult *= 0.5;   // 각인력 +효과 절반
        }
    });
    return { mult, bonus };
}
// ── 캐릭터별 개별 난이도 ──
// 직업별로 클리어 횟수를 따로 저장 (nakindo_diff_paladin, _mage, _ranger)
function getCharDifficulty(charKey) {
    return Number(localStorage.getItem('nakindo_diff_' + (charKey || 'paladin')) || '0');
}
function setCharDifficulty(charKey, lv) {
    localStorage.setItem('nakindo_diff_' + charKey, String(lv));
}
function getDifficultyLevel() {
    // 플레이어가 타이틀에서 선택한 난이도 우선, 없으면 캐릭터 최대 난이도
    if (gs._selectedDifficulty != null) return gs._selectedDifficulty;
    return getCharDifficulty(gs.selectedChar || 'paladin');
}
function setDifficultyLevel(lv) {
    setCharDifficulty(gs.selectedChar || 'paladin', lv);
}
function getDifficultyMult() {
    let lv = getDifficultyLevel();
    return 1 + Math.min(lv * 0.05, 0.5);
}

// 난이도 보정 적용 (applyAscension 대체)
function applyAscension(m, isElite=false, isBoss=false) {
    let mult = getDifficultyMult();
    if (mult <= 1) return;
    m.hp    = Math.ceil(m.hp * mult);
    if (isElite) m.hp = Math.ceil(m.hp * 1.05);
    if (isBoss)  m.hp = Math.ceil(m.hp * 1.10);
}

// ============================================================
// 영구 각성 시스템
// ============================================================
let PERM_UPGRADES = [
    { id:'startGold',   name:'시작 각인석 +30',   icon:'💰', desc:'게임 시작 시 각인석 30 추가',              max:5, cost:1 },
    { id:'startHp',     name:'최대 생명 +10',   icon:'❤️', desc:'캐릭터 최대 생명 10 영구 증가',            max:5, cost:1 },
    { id:'startPower',  name:'각인력 +1',          icon:'⚡', desc:'시작 각인력 영구 +1',                      max:3, cost:2 },
    { id:'startEnergy', name:'최대 각인 수정 +1',   icon:'💠', desc:'전투 최대 수정 1 증가',               max:2, cost:3 },
    { id:'startRelic',  name:'각인 유물 추가',   icon:'💍', desc:'시작 시 랜덤 유물 1개 추가 획득',       max:2, cost:2 },
    { id:'startCards',  name:'각인패 드로우 +1',        icon:'🃏', desc:'전투 시작 카드 1장 추가 드로우',        max:3, cost:2 },
    { id:'goldBonus',   name:'각인석 획득 +20%',   icon:'🪙', desc:'모든 각인석 획득량 20% 추가',             max:3, cost:2 },
    { id:'healBonus',   name:'회복의 각인 +10%', icon:'🏕️', desc:'공명의 결절 생명력 회복량 10% 증가',            max:3, cost:1 },
];

function getPermUpgrades() {
    try { return JSON.parse(localStorage.getItem('nakindo_upgrades') || '{}'); } catch(e) { return {}; }
}
function savePermUpgrades(obj) {
    localStorage.setItem('nakindo_upgrades', JSON.stringify(obj));
}
function getUpgradePoints() {
    return Number(localStorage.getItem('nakindo_points') || '0');
}
function addUpgradePoints(n) {
    localStorage.setItem('nakindo_points', String(getUpgradePoints() + n));
}
function spendUpgradePoint(n) {
    n = n || 1;
    let cur = getUpgradePoints();
    if (cur < n) return false;
    localStorage.setItem('nakindo_points', String(cur - n));
    return true;
}

function applyPermUpgrades(player) {
    let upgs = getPermUpgrades();
    if ((upgs.startGold   || 0) > 0) player.gold   += 30   * upgs.startGold;
    if ((upgs.startHp     || 0) > 0) { player.maxHp += 10  * upgs.startHp; player.hp += 10 * upgs.startHp; }
    if ((upgs.startPower  || 0) > 0) player.power  += upgs.startPower;
}
function goldBonusMult() {
    let lv = (getPermUpgrades().goldBonus || 0);
    let base = 1 + lv * 0.2;
    let pen = getCharPenaltyMult(gs.selectedChar, getDifficultyLevel(), 'gold');
    return base * pen.mult;
}
function restHealBonus() {
    return (getPermUpgrades().healBonus || 0) * 0.1;
}
function startCardBonus() {
    return getPermUpgrades().startCards || 0;
}


// ============================================================
// DEBUFF CARDS — 이벤트 혹은 승천으로 덱에 끼어드는 저주 카드
// ============================================================
let DEBUFF_CARDS = [
    // ── 기본 오염패 ──
    { name:'공포의 각인',
      cost:0, rarity:'curse',
      description:'아무 효과 없음. 하지만 패 하나를 영구히 차지한다.',
      lore:'파기된 계약이 남긴 공허한 흔적.',
      icon:'😨', type:'curse', target:'self',
      effect:()=>{ addLog('공포의 각인: 공허만이 남는다...','damage'); } },

    { name:'피의 대가',
      cost:1, rarity:'curse',
      description:'즉시 생명력 -3. 사용해도 사라지지 않는다.',
      lore:'계약의 대가는 항상 피로 치른다.',
      icon:'🩸', type:'curse', target:'self',
      effect:()=>{ applyDamage(gs.player, 3); addLog('피의 대가: -3 생명력','damage'); } },

    { name:'망각의 균열',
      cost:0, rarity:'curse',
      description:'사용 시 각인서를 다시 섞는다.',
      lore:'공간의 균열이 기억을 흐트러뜨린다.',
      icon:'🌫️', type:'curse', target:'self',
      effect:()=>{
        gs.deck=[...gs.deck,...gs.discardPile]; gs.discardPile=[];
        shuffle(gs.deck); addLog('망각의 균열: 각인서 재섞기','event');
      }},

    { name:'업보의 굴레',
      cost:2, rarity:'curse',
      description:'사용 시 손패에서 무작위 각인패 1장 소멸.',
      lore:'과거의 죄업이 현재의 힘을 갉아먹는다.',
      icon:'⛓️', type:'curse', target:'self',
      effect:()=>{
        if(gs.hand.length>1){
          let idx=Math.floor(Math.random()*gs.hand.length);
          let removed=gs.hand.splice(idx,1)[0];
          addLog(`업보의 굴레: [${removed.name}] 소멸!`,'damage');
          renderHand();
        }
      }},

    { name:'혼돈의 메아리',
      cost:1, rarity:'curse',
      description:'적과 자신 모두 2~9 무작위 피해.',
      lore:'균열에서 흘러나온 혼돈의 각인 기운.',
      icon:'🌀', type:'curse', target:'self',
      effect:()=>{
        let ed=Math.floor(Math.random()*8)+2;
        let pd=Math.floor(Math.random()*5)+1;
        applyDamage(gs.enemy,ed); applyDamage(gs.player,pd);
        addLog(`혼돈의 메아리: 적 -${ed}, 자신 -${pd}`,'damage');
      }},

    { name:'공허의 숨결',
      cost:0, rarity:'curse',
      description:'이번 흐름 사용 가능한 수정이 1 감소한다.',
      lore:'공허가 숨을 내뱉으면 힘이 사라진다.',
      icon:'💨', type:'curse', target:'self',
      effect:()=>{
        gs.energy=Math.max(0,gs.energy-1);
        addLog('공허의 숨결: 수정 -1','damage');
        renderEnergyGems();
      }},

    { name:'각인 부식',
      cost:1, rarity:'curse',
      description:'적 결계 +4. 사용 후 소멸하지 않는다.',
      lore:'오염된 각인이 오히려 적을 보호한다.',
      icon:'🦠', type:'curse', target:'self',
      effect:()=>{
        if(gs.enemy){ gs.enemy.def+=4; addLog('각인 부식: 적 결계 +4','damage'); updateHUD(); }
      }},

    { name:'시간 삼식',
      cost:2, rarity:'curse',
      description:'즉시 각인석 -15. 사용해도 덱에서 사라지지 않는다.',
      lore:'균열이 세계를 갉아먹듯, 시간이 재화를 삼킨다.',
      icon:'⌛', type:'curse', target:'self',
      effect:()=>{
        gs.player.gold=Math.max(0,gs.player.gold-15);
        addLog('시간 삼식: 각인석 -15','damage'); updateHUD();
      }},
];

function getRandomDebuffCard() {
    return DEBUFF_CARDS[Math.floor(Math.random() * DEBUFF_CARDS.length)];
}

// 가론(서약기사) 기본 덱
function makePaladinDeck() {
    let p = gs.player;
    return [
        { name:'서약의 칼',    cost:1, description:'적에게 6 피해',                             icon:'⚔️', type:'attack', target:'enemy', effect:()=>applyDamage(gs.enemy, dmg(6,'서약의 칼')*p.power) },
        { name:'결계 방어',    cost:1, description:'결계 +5',                                   icon:'🛡️', type:'defend', target:'self',  effect:()=>addDef(p, defVal(5,'결계 방어')) },
        { name:'생명 각인',    cost:2, description:'생명력 +6 회복',                            icon:'💚', type:'heal',   target:'self',  effect:()=>heal(p, healVal(6,'생명 각인')) },
        { name:'파쇄 일격',    cost:2, description:'적에게 12 피해',                            icon:'💥', type:'attack', target:'enemy', effect:()=>applyDamage(gs.enemy, dmg(12,'파쇄 일격')*p.power) },
        { name:'서약 분쇄',    cost:3, description:'적에게 22 피해 (각성 대기)',                icon:'⚡', type:'skill',  target:'enemy', effect:()=>applyDamage(gs.enemy, dmg(22,'서약 분쇄')), cooldown:4 },
        { name:'전사의 각성',  cost:2, description:'각인력 +3 이번 전투 지속 (각성 대기 3흐름)',     icon:'🔥', type:'skill',  target:'self',  effect:()=>{ let b=dmg(3,'전사의 각성'); p.power+=b; addLog(`각인력 +${b}!`,'event'); showFloat(`+${b} 각인력`,'misc'); }, cooldown:3 },
    ];
}

// 세라(균열술사) 기본 덱
function makeMageDeck() {
    let p = gs.player;
    return [
        { name:'균열 불꽃',    cost:1, description:'적에게 7 피해',                             icon:'🔥', type:'attack', target:'enemy', effect:()=>applyDamage(gs.enemy, dmg(7,'균열 불꽃')*p.power) },
        { name:'마력 결계',    cost:1, description:'결계 +4',                                   icon:'✨', type:'defend', target:'self',  effect:()=>addDef(p, defVal(4,'마력 결계')) },
        { name:'생명 각인',    cost:2, description:'생명력 +6 회복',                            icon:'💚', type:'heal',   target:'self',  effect:()=>heal(p, healVal(6,'생명 각인')) },
        { name:'아케인 폭발',  cost:2, description:'적에게 11 피해',                            icon:'💜', type:'attack', target:'enemy', effect:()=>applyDamage(gs.enemy, dmg(11,'아케인 폭발')*p.power) },
        { name:'공간 균열',    cost:2, description:'적 결계 -3, 6 피해',                        icon:'🌀', type:'skill',  target:'enemy', effect:()=>{ gs.enemy.def=Math.max(0,gs.enemy.def-defVal(3,'공간 균열')); applyDamage(gs.enemy,dmg(6,'공간 균열')); } },
        { name:'붕괴 운석',    cost:3, description:'적에게 25 피해 (각성 대기)',                icon:'☄️', type:'skill',  target:'enemy', effect:()=>applyDamage(gs.enemy,dmg(25,'붕괴 운석')), cooldown:4 },
    ];
}

// 이안(추적자) 기본 덱
function makeRangerDeck() {
    let p = gs.player;
    return [
        { name:'추적 화살',    cost:1, description:'적에게 5 피해',                             icon:'🏹', type:'attack', target:'enemy', effect:()=>applyDamage(gs.enemy, dmg(5,'추적 화살')*p.power) },
        { name:'잔상 회피',    cost:1, description:'결계 +5',                                   icon:'🌫️', type:'defend', target:'self',  effect:()=>addDef(p, defVal(5,'잔상 회피')) },
        { name:'생명 각인',    cost:2, description:'생명력 +6 회복',                            icon:'💚', type:'heal',   target:'self',  effect:()=>heal(p, healVal(6,'생명 각인')) },
        { name:'정밀 저격',    cost:2, description:'적에게 12 피해',                            icon:'🎯', type:'attack', target:'enemy', effect:()=>applyDamage(gs.enemy, dmg(12,'정밀 저격')*p.power) },
        { name:'부식 화살',    cost:2, description:'5 피해 + 부식 3 중첩',                      icon:'☠️', type:'skill',  target:'enemy', effect:()=>{ applyDamage(gs.enemy,dmg(5,'부식 화살')); addPoison(defVal(3,'부식 화살')); } },
        { name:'연속 사격',    cost:3, description:'적에게 20 피해 (각성 대기)',                icon:'⚡', type:'skill',  target:'enemy', effect:()=>applyDamage(gs.enemy,dmg(20,'연속 사격')), cooldown:3 },
    ];
}

let DECK_BUILDERS = { paladin: makePaladinDeck, mage: makeMageDeck, ranger: makeRangerDeck };

// ── 전체 카드 라이브러리 ──
// buildDeck이 이름으로 카드 템플릿을 찾을 수 있도록 모든 카드를 등록
function getAllCardLibrary() {
    let lib = {};
    // 직업 기본 덱 + 상점 + 보상을 모두 합산
    ['paladin','mage','ranger'].forEach(cls => {
        // 기본 덱 (effect 클로저는 gs.player 참조 — buildDeck 시점에 호출해야 함)
        // 상점
        (SHOP_CARDS[cls] || []).forEach(c => { lib[c.name] = c; });
        // 보상
        (REWARD_CARDS[cls] || []).forEach(c => { lib[c.name] = c; });
    });
    // 저주 카드
    DEBUFF_CARDS.forEach(c => { lib[c.name] = c; });
    return lib;
}

// _extras에는 이름만 저장
function addExtraCard(cardTemplate) {
    if (!gs.player.ownedCards._extraNames) gs.player.ownedCards._extraNames = [];
    gs.player.ownedCards._extraNames.push(cardTemplate.name);
    addLog(`✦ 각인패 획득: ${cardTemplate.name}`, 'event');
}

// ============================================================
// ACT SYSTEM — 1막/2막/3막
// ============================================================
// groups: 노드별 등장 몬스터 조합 (1~3마리)
// enemies 배열은 단일 적 목록 (레거시 호환용)
let ACTS = [
    {
        id: 1, name: '제1장', stageName: '파기된 숲 · 가시 계약지', bg: 'act1',
        monsters: [
            { name:'숲 그레믈린',     hp:20, def:0, reward:18, gimmick:'none',         icon:'👺', svgKey:'goblin',        elite:false },
            { name:'그레믈린 도둑',   hp:28, def:0, reward:24, gimmick:'gold_drain',   icon:'🗡️', svgKey:'goblin_rogue',  elite:false },
            { name:'가시 사수',       hp:25, def:0, reward:22, gimmick:'none',         icon:'🏹', svgKey:'goblin_archer', elite:false },
            { name:'덤불 쐐기',       hp:34, def:1, reward:30, gimmick:'shield_rage',  icon:'⚔️', svgKey:'goblin_knight', elite:false },
            { name:'독버섯 주술사',   hp:30, def:1, reward:28, gimmick:'regen',        icon:'🍄', svgKey:'goblin_shaman', elite:false },
            { name:'가시숲 군장',     hp:45, def:2, reward:55, gimmick:'enrage_stack', icon:'👹', svgKey:'goblin_boss',   elite:true  },
        ],
        // 일반 전투 그룹 (1~3마리 조합)
        groups: [
            [{ name:'숲 그레믈린', hp:20, def:0, reward:10, gimmick:'none', svgKey:'goblin' }],
            [{ name:'숲 그레믈린', hp:18, def:0, reward:8, gimmick:'none', svgKey:'goblin' },
             { name:'숲 그레믈린', hp:18, def:0, reward:8, gimmick:'none', svgKey:'goblin' }],
            [{ name:'그레믈린 도둑', hp:28, def:0, reward:20, gimmick:'gold_drain', svgKey:'goblin_rogue' }],
            [{ name:'가시 사수', hp:25, def:0, reward:18, gimmick:'none', svgKey:'goblin_archer' }],
            [{ name:'그레믈린 도둑', hp:22, def:0, reward:10, gimmick:'gold_drain', svgKey:'goblin_rogue' },
             { name:'가시 사수',    hp:20, def:0, reward:10, gimmick:'none',        svgKey:'goblin_archer' }],
            [{ name:'숲 그레믈린', hp:16, def:0, reward:6, gimmick:'none', svgKey:'goblin' },
             { name:'독버섯 주술사', hp:28, def:1, reward:14, gimmick:'regen', svgKey:'goblin_shaman' },
             { name:'숲 그레믈린', hp:16, def:0, reward:6, gimmick:'none', svgKey:'goblin' }],
            [{ name:'덤불 쐐기', hp:34, def:1, reward:26, gimmick:'shield_rage', svgKey:'goblin_knight' }],
            [{ name:'가시 사수', hp:22, def:0, reward:10, gimmick:'none', svgKey:'goblin_archer' },
             { name:'가시 사수', hp:22, def:0, reward:10, gimmick:'none', svgKey:'goblin_archer' },
             { name:'가시 사수', hp:22, def:0, reward:10, gimmick:'none', svgKey:'goblin_archer' }],
        ],
        eliteGroups: [
            [{ name:'가시숲 군장', hp:45, def:2, reward:30, gimmick:'enrage_stack', svgKey:'goblin_boss', elite:true },
             { name:'그레믈린 도둑', hp:20, def:0, reward:10, gimmick:'none', svgKey:'goblin_rogue' }],
        ],
        bosses: [
            { name:'브리아르 군왕',   hp:70, def:3, reward:80, gimmick:'armor_break',  icon:'🌿', svgKey:'goblin_king',   boss:true },
            { name:'가시덤불 마녀',   hp:65, def:2, reward:80, gimmick:'enrage_stack', icon:'🌵', svgKey:'thorn_witch',   boss:true },
        ],
    },
    {
        id: 2, name: '제2장', stageName: '망령의 묘원 · 무너진 서약', bg: 'act2',
        monsters: [
            { name:'방황하는 혼령',   hp:22, def:0, reward:22, gimmick:'none',        icon:'👻', svgKey:'ghost',         elite:false },
            { name:'납골 전사',       hp:28, def:1, reward:26, gimmick:'none',        icon:'💀', svgKey:'skeleton',      elite:false },
            { name:'역병 보행자',     hp:35, def:0, reward:28, gimmick:'regen',       icon:'🧟', svgKey:'zombie',        elite:false },
            { name:'서약 파괴자',     hp:38, def:2, reward:34, gimmick:'counter',     icon:'⚔️', svgKey:'cursed_knight', elite:false },
            { name:'리치 수련생',     hp:32, def:1, reward:30, gimmick:'armor_break', icon:'☠️', svgKey:'lich',          elite:false },
            { name:'묘원의 재판관',   hp:55, def:2, reward:60, gimmick:'def_steal',   icon:'🌑', svgKey:'undead_lord',   elite:true  },
        ],
        groups: [
            [{ name:'방황하는 혼령', hp:22, def:0, reward:18, gimmick:'none', svgKey:'ghost' }],
            [{ name:'방황하는 혼령', hp:18, def:0, reward:10, gimmick:'none', svgKey:'ghost' },
             { name:'방황하는 혼령', hp:18, def:0, reward:10, gimmick:'none', svgKey:'ghost' }],
            [{ name:'납골 전사', hp:28, def:1, reward:22, gimmick:'none', svgKey:'skeleton' }],
            [{ name:'납골 전사', hp:24, def:1, reward:12, gimmick:'none', svgKey:'skeleton' },
             { name:'납골 전사', hp:24, def:1, reward:12, gimmick:'none', svgKey:'skeleton' }],
            [{ name:'역병 보행자', hp:35, def:0, reward:24, gimmick:'regen', svgKey:'zombie' }],
            [{ name:'방황하는 혼령', hp:18, def:0, reward:8, gimmick:'none', svgKey:'ghost' },
             { name:'리치 수련생',   hp:28, def:1, reward:16, gimmick:'armor_break', svgKey:'lich' },
             { name:'방황하는 혼령', hp:18, def:0, reward:8, gimmick:'none', svgKey:'ghost' }],
            [{ name:'서약 파괴자', hp:38, def:2, reward:30, gimmick:'counter', svgKey:'cursed_knight' }],
            [{ name:'납골 전사', hp:22, def:1, reward:10, gimmick:'none', svgKey:'skeleton' },
             { name:'역병 보행자', hp:28, def:0, reward:12, gimmick:'regen', svgKey:'zombie' },
             { name:'납골 전사', hp:22, def:1, reward:10, gimmick:'none', svgKey:'skeleton' }],
        ],
        eliteGroups: [
            [{ name:'묘원의 재판관', hp:55, def:2, reward:40, gimmick:'def_steal', svgKey:'undead_lord', elite:true },
             { name:'방황하는 혼령', hp:18, def:0, reward:10, gimmick:'none', svgKey:'ghost' }],
        ],
        bosses: [
            { name:'모르가스 공',     hp:80, def:4, reward:90, gimmick:'regen',       icon:'💜', svgKey:'undead_king',   boss:true },
            { name:'뼈의 황제',       hp:75, def:3, reward:90, gimmick:'enrage_stack',icon:'💀', svgKey:'bone_emperor',  boss:true },
        ],
    },
    {
        id: 3, name: '제3장', stageName: '균열 심연 · 공허의 핵', bg: 'act3',
        monsters: [
            { name:'균열 임프',       hp:24, def:0, reward:25, gimmick:'none',         icon:'😈', svgKey:'fire_imp',      elite:false },
            { name:'용암 파수꾼',     hp:42, def:2, reward:32, gimmick:'shield_rage',  icon:'🪨', svgKey:'lava_golem',    elite:false },
            { name:'흑화 기사',       hp:38, def:2, reward:35, gimmick:'counter',      icon:'🗡️', svgKey:'dark_knight',   elite:false },
            { name:'지옥 박쥐 떼',    hp:28, def:0, reward:28, gimmick:'gold_drain',   icon:'🦇', svgKey:'hell_bat',      elite:false },
            { name:'심연 점술사',     hp:36, def:1, reward:38, gimmick:'enrage_stack', icon:'🔮', svgKey:'abyss_witch',   elite:false },
            { name:'폭염의 군주',     hp:62, def:3, reward:65, gimmick:'armor_break',  icon:'🔥', svgKey:'inferno_lord',  elite:true  },
        ],
        groups: [
            [{ name:'균열 임프', hp:24, def:0, reward:18, gimmick:'none', svgKey:'fire_imp' }],
            [{ name:'균열 임프', hp:20, def:0, reward:10, gimmick:'none', svgKey:'fire_imp' },
             { name:'균열 임프', hp:20, def:0, reward:10, gimmick:'none', svgKey:'fire_imp' }],
            [{ name:'지옥 박쥐 떼', hp:28, def:0, reward:20, gimmick:'gold_drain', svgKey:'hell_bat' }],
            [{ name:'지옥 박쥐 떼', hp:22, def:0, reward:10, gimmick:'gold_drain', svgKey:'hell_bat' },
             { name:'지옥 박쥐 떼', hp:22, def:0, reward:10, gimmick:'gold_drain', svgKey:'hell_bat' },
             { name:'균열 임프',    hp:18, def:0, reward:8,  gimmick:'none',       svgKey:'fire_imp' }],
            [{ name:'흑화 기사', hp:38, def:2, reward:30, gimmick:'counter', svgKey:'dark_knight' }],
            [{ name:'심연 점술사', hp:36, def:1, reward:28, gimmick:'enrage_stack', svgKey:'abyss_witch' }],
            [{ name:'균열 임프', hp:18, def:0, reward:8, gimmick:'none', svgKey:'fire_imp' },
             { name:'흑화 기사',  hp:32, def:2, reward:14, gimmick:'counter', svgKey:'dark_knight' },
             { name:'균열 임프', hp:18, def:0, reward:8, gimmick:'none', svgKey:'fire_imp' }],
            [{ name:'용암 파수꾼', hp:42, def:2, reward:32, gimmick:'shield_rage', svgKey:'lava_golem' }],
        ],
        eliteGroups: [
            [{ name:'폭염의 군주', hp:62, def:3, reward:40, gimmick:'armor_break', svgKey:'inferno_lord', elite:true },
             { name:'균열 임프', hp:20, def:0, reward:10, gimmick:'none', svgKey:'fire_imp' }],
        ],
        bosses: [
            { name:'바알-나크라스',   hp:95, def:5, reward:100, gimmick:'enrage_stack', icon:'🐉', svgKey:'dragon',        boss:true },
            { name:'공허의 포식자',   hp:88, def:4, reward:100, gimmick:'def_steal',    icon:'🌌', svgKey:'void_behemoth', boss:true },
            { name:'균열 드래곤',     hp:90, def:4, reward:100, gimmick:'armor_break',  icon:'💥', svgKey:'crack_dragon',  boss:true },
        ],
    },
];

// 전체 몬스터 풀: 3막을 합쳐서 순서대로 배치
// startGame에서 gs.acts를 설정, 막별 진행
let MONSTER_SETS = {}; // 하위 호환성 (더 이상 직접 사용 안 함)

// Shop card pools by class
let SHOP_CARDS = {
    paladin: [
        { name:'심판',          cost:2, description:'적에게 16 피해',             icon:'⚖️', type:'attack', target:'enemy', effect:()=>applyDamage(gs.enemy,16*gs.player.power) },
        { name:'거성의 방패',   cost:2, description:'결계 +9',                    icon:'🏰', type:'defend', target:'self',  effect:()=>addDef(gs.player,9) },
        { name:'빛의 심판',     cost:2, description:'18 피해, 결계 +4',           icon:'✝️', type:'skill',  target:'enemy', effect:()=>{ applyDamage(gs.enemy,18); addDef(gs.player,4); } },
        { name:'성스러운 분노', cost:1, description:'각인력 +2, 각인 수정 +1',         icon:'✴️', type:'skill',  target:'self',  effect:()=>{ gainTempPower(2,'성스러운 분노'); gainEnergy(1,'성스러운 분노'); } },
    ],
    mage: [
        { name:'대형 화염구',   cost:2, description:'적에게 19 피해',             icon:'🔥', type:'attack', target:'enemy', effect:()=>applyDamage(gs.enemy,19*gs.player.power) },
        { name:'시간 왜곡',     cost:2, description:'모든 각성 대기 -2흐름',             icon:'⏳', type:'skill',  target:'self',  effect:()=>{ for(let k in gs.player.cooldowns) gs.player.cooldowns[k]=Math.max(0,(gs.player.cooldowns[k]||0)-2); addLog('각성 대기 -2','event'); } },
        { name:'마나 폭발',     cost:3, description:'30 피해 (각성 대기)',        icon:'💫', type:'skill',  target:'enemy', effect:()=>applyDamage(gs.enemy,30), cooldown:5 },
        { name:'마력 과부하',   cost:1, description:'각인력 +3, 각인 수정 +1',         icon:'✴️', type:'skill',  target:'self',  effect:()=>{ gainTempPower(3,'마력 과부하'); gainEnergy(1,'마력 과부하'); } },
    ],
    ranger: [
        { name:'마무리 일격',   cost:2, description:'적에게 15 피해',             icon:'💥', type:'attack', target:'enemy', effect:()=>applyDamage(gs.enemy,15*gs.player.power) },
        { name:'정밀 사격',     cost:2, description:'각인력 +4 (각성 대기 3흐름)',        icon:'🎯', type:'skill',  target:'self',  effect:()=>{ gs.player.power+=4; addLog('각인력 +4','event'); showFloat('+4⚡','misc'); }, cooldown:3 },
        { name:'다중 화살',     cost:3, description:'10×2 피해',                  icon:'🏹', type:'attack', target:'enemy', effect:()=>{ applyDamage(gs.enemy,10); applyDamage(gs.enemy,10); } },
        { name:'사냥꾼의 리듬', cost:1, description:'각인력 +2, 각인 수정 +1',         icon:'✴️', type:'skill',  target:'self',  effect:()=>{ gainTempPower(2,'사냥꾼의 리듬'); gainEnergy(1,'사냥꾼의 리듬'); } },
    ],
};

// Reward cards pool (pick one after battle)
let REWARD_CARDS = {
    paladin: [
        // ── common ──
        { name:'성스러운 빛',   cost:2, rarity:'common',    description:'생명 +8, 결계 +4',             icon:'✨', type:'heal',   target:'self',  effect:()=>{ heal(gs.player,8); addDef(gs.player,4); } },
        { name:'철벽 방어',     cost:1, rarity:'common',    description:'결계 +8',                    icon:'🏛️', type:'defend', target:'self',  effect:()=>addDef(gs.player,8) },
        { name:'분쇄 강타',     cost:2, rarity:'common',    description:'15 피해, 적결계 -5',         icon:'🔨', type:'attack', target:'enemy', effect:()=>{ applyDamage(gs.enemy,15); gs.enemy.def=Math.max(0,gs.enemy.def-5); } },
        { name:'신앙의 불꽃',   cost:1, rarity:'common',    description:'각인력 +2, 결계 +3',           icon:'🕯️', type:'skill',  target:'self',  effect:()=>{ gainTempPower(2,'신앙의 불꽃'); addDef(gs.player,3); } },
        { name:'성전의 기도',   cost:2, rarity:'common',    description:'각인 수정 +2, 생명 +5',           icon:'🙏', type:'skill',  target:'self',  effect:()=>{ gainEnergy(2,'성전의 기도'); heal(gs.player,5); } },
        { name:'마지막 결의',   cost:0, rarity:'common',    description:'각인력 +4, 이번 흐름만',         icon:'⚡', type:'skill',  target:'self',  effect:()=>gainTempPower(4,'마지막 결의') },
        { name:'투지',          cost:1, rarity:'common',    description:'각인 수정 +2 (각성 대기 2)',     icon:'🔥', type:'skill',  target:'self',  effect:()=>gainEnergy(2,'투지'), cooldown:2 },
        { name:'전장의 고동',   cost:2, rarity:'rare',      description:'각인 수정 +3, 결계 +5 (각성 대기 3)', icon:'🥁', type:'skill', target:'self', effect:()=>{ gainEnergy(3,'전장의 고동'); addDef(gs.player,5); }, cooldown:3 },
        // ── rare ──
        { name:'성전사의 맹세', cost:2, rarity:'rare',      description:'20 피해 + 결계 +8',          icon:'🛡️', type:'skill',  target:'enemy', effect:()=>{ applyDamage(gs.enemy,20*gs.player.power); addDef(gs.player,8); } },
        { name:'신성한 폭풍',   cost:3, rarity:'rare',      description:'30 피해, 결계 파괴',         icon:'⛈️', type:'attack', target:'enemy', effect:()=>{ gs.enemy.def=0; applyDamage(gs.enemy,30*gs.player.power); } },
        { name:'불사의 갑옷',   cost:2, rarity:'rare',      description:'결계 +12, 다음 피해 무효화 (1회)', icon:'🏰', type:'defend', target:'self',  effect:()=>{ addDef(gs.player,12); gs.player._shield=true; addLog('◈ 불사의 갑옷: 다음 피해 무효화!','event'); } },
        { name:'성소의 축복',   cost:1, rarity:'rare',      description:'생명 +15, 각인력 +2, 각인 수정 +1', icon:'☀️', type:'heal',   target:'self',  effect:()=>{ heal(gs.player,15); gainTempPower(2,'성소의 축복'); gainEnergy(1,'성소의 축복'); } },
        // ── legendary ──
        { name:'각인 파쇄',   cost:3, rarity:'legendary', description:'적 결계 무시, 45 피해, 결계 +10', icon:'⚔️', type:'skill', target:'enemy', effect:()=>{ let d=gs.enemy.def; gs.enemy.def=0; applyDamage(gs.enemy,45); gs.enemy.def=d; addDef(gs.player,10); } },
        { name:'불멸의 의지',   cost:2, rarity:'legendary', description:'생명 50% 이하면 즉시 완전 회복, 각인력 +5', icon:'💎', type:'heal', target:'self', effect:()=>{ if(gs.player.hp<=gs.player.maxHp*0.5){ gs.player.hp=gs.player.maxHp; addLog('◈ 불멸의 의지: 완전 회복!','event'); } gainTempPower(5,'불멸의 의지'); } },
        // ── 추가 카드 ──
        { name:'방패 던지기',   cost:1, rarity:'common',    description:'결계값만큼 피해 (최대 20)',    icon:'🛡️', type:'attack', target:'enemy', effect:()=>{ applyDamage(gs.enemy, Math.min(gs.player.def*2,20)); } },
        { name:'신성한 치유',   cost:2, rarity:'common',    description:'생명 +12, 결계 +6',             icon:'💚', type:'heal',   target:'self',  effect:()=>{ heal(gs.player,12); addDef(gs.player,6); } },
        { name:'반격',          cost:1, rarity:'common',    description:'결계 +5, 다음 피해 받으면 반격 10', icon:'↩️', type:'skill', target:'self', effect:()=>{ addDef(gs.player,5); gs.player._counterAtk=10; addLog('◈ 반격 준비!','event'); } },
        { name:'성스러운 갑주', cost:3, rarity:'rare',      description:'결계 +18, 생명 +8',             icon:'⚜️', type:'defend', target:'self',  effect:()=>{ addDef(gs.player,18); heal(gs.player,8); } },
        { name:'신의 선택',     cost:2, rarity:'rare',      description:'적 생명 30% 이하면 즉사, 아니면 30 피해', icon:'✨', type:'skill', target:'enemy', effect:()=>{ if(gs.enemy.hp <= gs.enemy.startHp*0.3){ gs.enemy.hp=0; addLog('◈ 신의 선택: 즉사!','event'); } else applyDamage(gs.enemy,30*gs.player.power); } },
        { name:'희생의 검',     cost:0, rarity:'rare',      description:'생명 -10, 적에게 25 피해',       icon:'🗡️', type:'attack', target:'enemy', effect:()=>{ gs.player.hp=Math.max(1,gs.player.hp-10); applyDamage(gs.enemy,25*gs.player.power); } },
        { name:'성전의 심판',   cost:4, rarity:'legendary', description:'적 결계 0으로 파쇄 후 70 피해, 아군 결계 +15', icon:'🌟', type:'skill', target:'enemy', effect:()=>{ gs.enemy.def=0; applyDamage(gs.enemy,70*gs.player.power); addDef(gs.player,15); } },
    ],
    mage: [
        // ── common ──
        { name:'번개 폭발',     cost:2, rarity:'common',    description:'적에게 15 피해',             icon:'⚡', type:'attack', target:'enemy', effect:()=>applyDamage(gs.enemy,15*gs.player.power) },
        { name:'마법 방어막',   cost:1, rarity:'common',    description:'결계 +7',                    icon:'🔰', type:'defend', target:'self',  effect:()=>addDef(gs.player,7) },
        { name:'결빙',          cost:2, rarity:'common',    description:'10 피해, 부식 2',            icon:'🧊', type:'skill',  target:'enemy', effect:()=>{ applyDamage(gs.enemy,10); addPoison(2); } },
        { name:'마나 폭주',     cost:1, rarity:'common',    description:'각인력 +3, 이번 흐름만',         icon:'🌀', type:'skill',  target:'self',  effect:()=>gainTempPower(3,'마나 폭주') },
        { name:'아케인 흐름',   cost:2, rarity:'common',    description:'각인 수정 +2, 각인력 +1',         icon:'🌊', type:'skill',  target:'self',  effect:()=>{ gainEnergy(2,'아케인 흐름'); gainTempPower(1,'아케인 흐름'); } },
        { name:'무한 마나',     cost:3, rarity:'common',    description:'각인 수정 +4 (각성 대기 4흐름)',      icon:'♾️', type:'skill',  target:'self',  effect:()=>gainEnergy(4,'무한 마나'), cooldown:4 },
        // ── rare ──
        { name:'차원 균열',     cost:2, rarity:'rare',      description:'결계 +무시 25 피해 + 부식 3', icon:'🌌', type:'skill',  target:'enemy', effect:()=>{ let d=gs.enemy.def; gs.enemy.def=0; applyDamage(gs.enemy,25*gs.player.power); gs.enemy.def=d; addPoison(3); } },
        { name:'시간 정지',     cost:3, rarity:'rare',      description:'각인 수정 +5, 각인력 +4, 각성 대기 전체 -2', icon:'⏸️', type:'skill', target:'self', effect:()=>{ gainEnergy(5,'시간 정지'); gainTempPower(4,'시간 정지'); for(let k in gs.player.cooldowns) gs.player.cooldowns[k]=Math.max(0,(gs.player.cooldowns[k]||0)-2); } },
        { name:'마법 폭풍',     cost:3, rarity:'rare',      description:'35 피해, 부식 5',            icon:'🌪️', type:'attack', target:'enemy', effect:()=>{ applyDamage(gs.enemy,35*gs.player.power); addPoison(5); } },
        { name:'마나 결정체',   cost:1, rarity:'rare',      description:'각인 수정 +3, 다음 카드 비용 0', icon:'🔷', type:'skill',  target:'self',  effect:()=>{ gainEnergy(3,'마나 결정체'); gs.player._nextFree=true; addLog('◈ 마나 결정체: 다음 카드 비용 0!','event'); } },
        // ── legendary ──
        { name:'절대 소각',     cost:4, rarity:'legendary', description:'적 결계 무시, 60 피해 + 부식 8', icon:'☄️', type:'skill', target:'enemy', effect:()=>{ gs.enemy.def=0; applyDamage(gs.enemy,60*gs.player.power); addPoison(8); } },
        { name:'시간의 주인',   cost:2, rarity:'legendary', description:'모든 각성 대기 초기화, 수정 완전 충전, 각인력 +6', icon:'🕰️', type:'skill', target:'self', effect:()=>{ for(let k in gs.player.cooldowns) gs.player.cooldowns[k]=0; gs.energy=gs.maxEnergy; gainTempPower(6,'시간의 주인'); addLog('◈ 시간의 주인: 모든 제한 해제!','event'); } },
        { name:'별의 의지',     cost:3, rarity:'legendary', description:'각인 수정 전부 소모 → 소모량×8 피해', icon:'⭐', type:'skill', target:'enemy', effect:()=>{ let e=gs.energy; gs.energy=0; applyDamage(gs.enemy,e*8*gs.player.power); addLog(`별의 의지: 수정 ${e} 소모 → ${e*8} 피해!`,'event'); } },
        { name:'반중력장',      cost:3, rarity:'rare',      description:'적 결계 0, 부식 6, 결계 +10', icon:'🌀', type:'skill',  target:'enemy', effect:()=>{ gs.enemy.def=0; addPoison(6); addDef(gs.player,10); } },
        { name:'마법 가속',     cost:1, rarity:'common',    description:'각인 수정 +2, 결계 +3',          icon:'💨', type:'skill',  target:'self',  effect:()=>{ gainEnergy(2,'마법 가속'); addDef(gs.player,3); } },
        { name:'얼음 창',       cost:2, rarity:'common',    description:'12 피해, 부식 3',             icon:'🧊', type:'attack', target:'enemy', effect:()=>{ applyDamage(gs.enemy,12*gs.player.power); addPoison(3); } },
        { name:'에테르 흐름',   cost:2, rarity:'rare',      description:'각인 수정 +3, 각인력 +2 (각성 대기 3)', icon:'🌌', type:'skill', target:'self', effect:()=>{ gainEnergy(3,'에테르 흐름'); gainTempPower(2,'에테르 흐름'); }, cooldown:3 },
        { name:'마나 흡수',     cost:1, rarity:'rare',      description:'적 결계 -5, 각인 수정 +2, 각인력 +2', icon:'💠', type:'skill', target:'enemy', effect:()=>{ gs.enemy.def=Math.max(0,gs.enemy.def-5); gainEnergy(2,'마나 흡수'); gainTempPower(2,'마나 흡수'); } },
        { name:'마나 급류',     cost:1, rarity:'common',    description:'각인 수정 +2 (각성 대기 2)',     icon:'💧', type:'skill',  target:'self',  effect:()=>gainEnergy(2,'마나 급류'), cooldown:2 },
        { name:'혼돈의 불꽃',   cost:2, rarity:'rare',      description:'20~40 피해 (무작위)',          icon:'🎲', type:'attack', target:'enemy', effect:()=>{ applyDamage(gs.enemy,(20+Math.floor(Math.random()*21))*gs.player.power); } },
        { name:'집중',          cost:1, rarity:'common',    description:'각인력 +2, 이번 흐름만',         icon:'🎯', type:'skill',  target:'self',  effect:()=>gainTempPower(2,'집중') },
        { name:'마법진',        cost:2, rarity:'common',    description:'결계 +8, 다음 흐름 각인 수정 +2',  icon:'🔮', type:'defend', target:'self',  effect:()=>{ addDef(gs.player,8); gs.player._nextTurnEnergy=(gs.player._nextTurnEnergy||0)+2; addLog('마법진: 다음 흐름 각인 수정 +2!','event'); } },
    ],
    ranger: [
        // ── common ──
        { name:'매복 공격',     cost:2, rarity:'common',    description:'18 피해 (결계 무시)',         icon:'🗡️', type:'attack', target:'enemy', effect:()=>{ let d=gs.enemy.def; gs.enemy.def=0; applyDamage(gs.enemy,18); gs.enemy.def=d; } },
        { name:'치유 허브',     cost:1, rarity:'common',    description:'생명 +10',                     icon:'🌿', type:'heal',   target:'self',  effect:()=>heal(gs.player,10) },
        { name:'폭발 화살',     cost:3, rarity:'common',    description:'24 피해',                    icon:'💣', type:'attack', target:'enemy', effect:()=>applyDamage(gs.enemy,24*gs.player.power) },
        { name:'표범의 기운',   cost:1, rarity:'common',    description:'각인력 +3, 이번 흐름만',         icon:'🐆', type:'skill',  target:'self',  effect:()=>gainTempPower(3,'표범의 기운') },
        { name:'바람과 함께',   cost:2, rarity:'common',    description:'각인 수정 +2, 결계 +4',         icon:'🍃', type:'skill',  target:'self',  effect:()=>{ gainEnergy(2,'바람과 함께'); addDef(gs.player,4); } },
        { name:'자연의 힘',     cost:0, rarity:'common',    description:'각인력 +2, 각인 수정 +1',         icon:'🌱', type:'skill',  target:'self',  effect:()=>{ gainTempPower(2,'자연의 힘'); gainEnergy(1,'자연의 힘'); } },
        // ── rare ──
        { name:'독사의 일격',   cost:2, rarity:'rare',      description:'결계 +무시 20 피해 + 부식 6', icon:'🐍', type:'attack', target:'enemy', effect:()=>{ let d=gs.enemy.def; gs.enemy.def=0; applyDamage(gs.enemy,20*gs.player.power); gs.enemy.def=d; addPoison(6); } },
        { name:'폭풍 화살',     cost:3, rarity:'rare',      description:'12 피해 ×3회',              icon:'🌪️', type:'attack', target:'enemy', effect:()=>{ applyDamage(gs.enemy,12); applyDamage(gs.enemy,12); applyDamage(gs.enemy,12); } },
        { name:'야수의 본능',   cost:1, rarity:'rare',      description:'각인력 +5, 각인 수정 +2',         icon:'🦅', type:'skill',  target:'self',  effect:()=>{ gainTempPower(5,'야수의 본능'); gainEnergy(2,'야수의 본능'); } },
        { name:'독안개',        cost:2, rarity:'rare',      description:'부식 8 + 결계 +6',           icon:'☁️', type:'skill',  target:'self',  effect:()=>{ addPoison(8); addDef(gs.player,6); } },
        // ── legendary ──
        { name:'자연의 분노',   cost:3, rarity:'legendary', description:'결계 +무시 50 피해 + 부식 10, 결계 +8', icon:'🌿', type:'skill', target:'enemy', effect:()=>{ let d=gs.enemy.def; gs.enemy.def=0; applyDamage(gs.enemy,50*gs.player.power); gs.enemy.def=d; addPoison(10); addDef(gs.player,8); } },
        { name:'무한 화살통',   cost:0, rarity:'legendary', description:'이번 흐름 각인 수정 +5, 각인력 +5, 결계 +5', icon:'♾️', type:'skill', target:'self', effect:()=>{ gainEnergy(5,'무한 화살통'); gainTempPower(5,'무한 화살통'); addDef(gs.player,5); addLog('◈ 무한 화살통: 모든 능력 폭발!','event'); } },
        { name:'사냥꾼의 눈',   cost:1, rarity:'rare',      description:'적 결계 -8, 15 피해',         icon:'👁️', type:'skill',  target:'enemy', effect:()=>{ gs.enemy.def=Math.max(0,gs.enemy.def-8); applyDamage(gs.enemy,15*gs.player.power); } },
        { name:'천공의 화살',   cost:4, rarity:'legendary', description:'결계 +무시, 현재 부식×5 피해', icon:'🌠', type:'skill', target:'enemy', effect:()=>{ let poison=gs.enemy.poison||0; let d=gs.enemy.def; gs.enemy.def=0; applyDamage(gs.enemy,Math.max(30,poison*5)*gs.player.power); gs.enemy.def=d; addLog(`천공의 화살: ${Math.max(30,poison*5)} 피해!`,'event'); } },
        { name:'함정 설치',     cost:2, rarity:'common',    description:'다음 적 공격 시 부식 5 추가',  icon:'🪤', type:'skill',  target:'self',  effect:()=>{ gs.player._trapPoison=5; addLog('◈ 함정 설치!','event'); } },
        { name:'자연의 축복',   cost:2, rarity:'rare',      description:'생명 +12, 부식 +4, 결계 +5',   icon:'🌸', type:'heal',   target:'self',  effect:()=>{ heal(gs.player,12); addPoison(4); addDef(gs.player,5); } },
        { name:'사냥 본능',     cost:1, rarity:'common',    description:'각인력 +2, 이번 흐름만',         icon:'🦅', type:'skill',  target:'self',  effect:()=>gainTempPower(2,'사냥 본능') },
        { name:'독폭풍',        cost:3, rarity:'rare',      description:'부식 12, 15 피해',            icon:'🌫️', type:'attack', target:'enemy', effect:()=>{ addPoison(12); applyDamage(gs.enemy,15*gs.player.power); } },
        { name:'투혼',          cost:0, rarity:'common',    description:'각인력 +1 (영구)',               icon:'💢', type:'skill',  target:'self',  effect:()=>{ gs.player.power+=1; addLog('◈ 투혼: 각인력 영구 +1!','event'); showFloat('+1⚡','misc','player'); } },
        { name:'바람의 숨결',   cost:2, rarity:'rare',      description:'각인 수정 +3, 결계 +4 (각성 대기 3)', icon:'💨', type:'skill', target:'self', effect:()=>{ gainEnergy(3,'바람의 숨결'); addDef(gs.player,4); }, cooldown:3 },
        { name:'야생의 숨결',   cost:1, rarity:'common',    description:'각인 수정 +2, 부식 +1 (각성 대기 2)', icon:'🍃', type:'skill', target:'self', effect:()=>{ gainEnergy(2,'야생의 숨결'); addPoison(1); }, cooldown:2 },
        { name:'독 화살비',     cost:2, rarity:'common',    description:'8 피해, 부식 4',              icon:'🏹', type:'attack', target:'enemy', effect:()=>{ applyDamage(gs.enemy,8*gs.player.power); addPoison(4); } },
        { name:'재빠른 발놀림', cost:1, rarity:'common',    description:'결계 +6, 각인 수정 +1',          icon:'👟', type:'defend', target:'self',  effect:()=>{ addDef(gs.player,6); gainEnergy(1,'재빠른 발놀림'); } },
    ],
};

// ============================================================
// CARD UPGRADE DEFINITIONS
// 각 카드별 강화 효과: { desc, apply(cardTemplate) → upgraded desc }
// ============================================================
let CARD_UPGRADES = {
    // 팔라딘
    '서약의 칼':  { maxLv:3, tiers:['6→8 피해',       '8→11 피해',      '11→15 피해']       },
    '결계 방어':  { maxLv:3, tiers:['결계 5→8',        '결계 8→12',      '결계 12→16']       },
    '생명 각인':  { maxLv:3, tiers:['생명 6→9 회복',     '생명 9→13 회복',   '생명 13→18 회복']    },
    '파쇄 일격':  { maxLv:3, tiers:['12→17 피해',      '17→23 피해',     '23→30 피해']       },
    '서약 분쇄':  { maxLv:2, tiers:['22→32 피해',      '32→45 피해']                         },
    '전사의 각성':{ maxLv:2, tiers:['각인력+3→+5',       '각인력+5→+8, 각성 대기-1']               },
    // 마법사
    '균열 불꽃':  { maxLv:3, tiers:['7→10 피해',       '10→14 피해',     '14→19 피해']       },
    '마력 결계':  { maxLv:3, tiers:['결계 4→7',        '결계 7→10',      '결계 10→14']       },
    '아케인 폭발':{ maxLv:3, tiers:['11→16 피해',      '16→22 피해',     '22→29 피해']       },
    '공간 균열':  { maxLv:2, tiers:['결계-3→-5, +6→10','결계-5→-8, +10→14']                 },
    '붕괴 운석':  { maxLv:2, tiers:['25→36 피해',      '36→50 피해']                         },
    // 레인저
    '추적 화살':  { maxLv:3, tiers:['5→8 피해',        '8→11 피해',      '11→15 피해']       },
    '잔상 회피':  { maxLv:3, tiers:['결계 5→8',        '결계 8→12',      '결계 12→16']       },
    '정밀 저격':  { maxLv:3, tiers:['12→17 피해',      '17→23 피해',     '23→30 피해']       },
    '부식 화살':  { maxLv:2, tiers:['부식 3→5중첩',    '부식 5→7중첩, 즉시피해 +5']          },
    '연속 사격':  { maxLv:2, tiers:['20→30 피해',      '30→42 피해']                         },
    // 공용 전투 카드
    '성스러운 빛':{ maxLv:2, tiers:['생명+8→12, 결계+4→7','생명+12→16, 결계+7→11']              },
    '철벽 방어':  { maxLv:2, tiers:['결계 8→12',       '결계 12→17']                         },
    '분쇄 강타':  { maxLv:2, tiers:['15→21 피해',      '21→30 피해']                         },
    '번개 폭발':  { maxLv:2, tiers:['15→22 피해',      '22→31 피해']                         },
    '마법 방어막':{ maxLv:2, tiers:['결계 7→11',       '결계 11→16']                         },
    '결빙':       { maxLv:2, tiers:['10→15 피해, 부식 2→4','15→21 피해, 부식 4→6']           },
    '매복 공격':  { maxLv:2, tiers:['18→26 피해',      '26→36 피해']                         },
    '치유 허브':  { maxLv:2, tiers:['생명+10→15',        '생명+15→22']                           },
    '폭발 화살':  { maxLv:2, tiers:['24→34 피해',      '34→48 피해']                         },
    // 에너지 카드
    '투지':           { maxLv:2, tiers:['수정 2→3',        '수정 3→4, 효과 강화']            },
    '마나 급류':      { maxLv:2, tiers:['수정 2→3',        '수정 3→4, 효과 강화']            },
    '야생의 숨결':    { maxLv:2, tiers:['수정 2→3',        '수정 3→4, 효과 강화']            },
    '전장의 고동':    { maxLv:2, tiers:['수정 3→4',        '각성 대기 3→2흐름']                       },
    '에테르 흐름':    { maxLv:2, tiers:['수정 3→4',        '각성 대기 3→2흐름']                       },
    '바람의 숨결':    { maxLv:2, tiers:['수정 3→4',        '각성 대기 3→2흐름']                       },
    '성전의 기도':    { maxLv:2, tiers:['수정+2 생명+5→+8',  '수정+3 생명+8']                      },
    '아케인 흐름':    { maxLv:2, tiers:['수정+2 각인력+1→+2','수정+3 각인력+2']                     },
    '바람과 함께':    { maxLv:2, tiers:['수정+2 결계+4→+6','수정+3 결계+6']                     },
    '무한 마나':      { maxLv:2, tiers:['수정 4→5',        '각성 대기 4→3흐름']                       },
    // 각인력 카드
    '투혼':           { maxLv:3, tiers:['각인력 1→2',          '각인력 2→3',        '각인력 3→4']         },
    '집중':           { maxLv:3, tiers:['각인력 2→3',          '각인력 3→4',        '각인력 4→5']         },
    '사냥 본능':      { maxLv:3, tiers:['각인력 2→3',          '각인력 3→4',        '각인력 4→5']         },
    '마지막 결의':    { maxLv:2, tiers:['각인력 4→6',          '각인력 6→8']                           },
    '마나 폭주':      { maxLv:2, tiers:['각인력 3→5',          '각인력 5→7']                           },
    '표범의 기운':    { maxLv:2, tiers:['각인력 3→5',          '각인력 5→7']                           },
    '성스러운 분노':  { maxLv:2, tiers:['각인력+2 수정+1→+2','각인력+3 수정+2']                     },
    '마력 과부하':    { maxLv:2, tiers:['각인력+3 수정+1→+2','각인력+4 수정+2']                     },
    '사냥꾼의 리듬':  { maxLv:2, tiers:['각인력+2 수정+1→+2','각인력+3 수정+2']                     },
    '신앙의 불꽃':    { maxLv:2, tiers:['각인력+2 결계+3→+5',  '각인력+3 결계+5→+8']                   },
    '자연의 힘':      { maxLv:2, tiers:['각인력+2 수정+1→+2','각인력+3 수정+2']                     },
};

// ============================================================
// HELPERS
// ============================================================
function deepClone(o) { return JSON.parse(JSON.stringify(o)); }
function shuffle(arr) {
    for (let i = arr.length-1; i > 0; i--) {
        let j = Math.floor(Math.random()*(i+1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
}

// dmg: 강화 레벨에 따라 기본 데미지 배율 적용
// lv0=1.0, lv1=1.35, lv2=1.75, lv3=2.20
let DMG_MULT = [1.0, 1.35, 1.75, 2.20];
function dmg(base, cardName) {
    let lvl = Math.min((gs.player.cardUpgrades||{})[cardName] || 0, 3);
    return Math.floor(base * (DMG_MULT[lvl] || 1.0));
}

// def: 결계 수치도 강화 배율 동일하게
function defVal(base, cardName) {
    let lvl = Math.min((gs.player.cardUpgrades||{})[cardName] || 0, 3);
    return Math.floor(base * (DMG_MULT[lvl] || 1.0));
}

// heal: 회복도 강화 배율
function healVal(base, cardName) {
    let lvl = Math.min((gs.player.cardUpgrades||{})[cardName] || 0, 3);
    return Math.floor(base * (DMG_MULT[lvl] || 1.0));
}

// 강화 비용: 레벨 0→1: 30G, 1→2: 60G, 2→3: 100G
function upgradeCost(lvl) { return [30, 60, 100][lvl] || 999; }

// 현재 보유 카드 목록 (유니크 이름 기준)
function getOwnedCardNames() {
    let base = DECK_BUILDERS[gs.selectedChar]().map(c => c.name);
    let extras = gs.player.ownedCards._extraNames || [];
    return [...new Set([...base, ...extras])];
}

function applyDamage(target, amount) {
    amount = Math.max(0, Math.floor(amount));

    // 불사의 갑옷: 플레이어가 피격 시 1회 무효화
    if (target === gs.player && gs.player._shield) {
        gs.player._shield = false;
        addLog('▣ 불사의 갑옷: 피해 무효화!', 'event');
        showFloat('무효!', 'misc', 'player');
        updateHUD();
        return 0;
    }
    let blocked = Math.min(target.def, amount);
    target.def = Math.max(0, target.def - blocked);
    let actual = amount - blocked;
    target.hp -= actual;

    let name = target === gs.player ? gs.player.name : (target.name || '적');
    let isPlayer = target === gs.player;
    addLog(`${name}에 ${amount} 피해 (결계 ${blocked} 차단, 실제 ${actual})`, 'damage');
    showFloat(`-${actual}`, 'damage', isPlayer ? 'player' : 'enemy');

    if (isPlayer) flashEl('playerPanel', 'flash-red');
    else {
        // 다중 적: 해당 적 슬롯에 플래시
        let idx = gs.enemies ? gs.enemies.indexOf(target) : -1;
        if (idx >= 0) {
            let slots = document.querySelectorAll('.enemy-slot');
            if (slots[idx]) slots[idx].classList.add('flash-red');
            setTimeout(() => { if (slots[idx]) slots[idx].classList.remove('flash-red'); }, 300);
        } else {
            flashEl('enemyPanel', 'flash-red');
        }
        notifyEnemyHit(target);
    }

    // 함정 설치 — 플레이어가 피해 받을 때 발동
    if (isPlayer && gs.player._trapPoison > 0) {
        gs.enemy.poison = (gs.enemy.poison||0) + gs.player._trapPoison;
        addLog(`◆ 함정 발동: 적 부식 +${gs.player._trapPoison}!`, 'event');
        gs.player._trapPoison = 0;
    }

    // 반격 카드 — 플레이어가 피해 받으면 즉시 반격
    if (isPlayer && gs.player._counterAtk > 0 && actual > 0) {
        let cAtk = gs.player._counterAtk;
        gs.player._counterAtk = 0;
        if (gs.enemy && gs.enemy.hp > 0) {
            gs.enemy.hp -= cAtk;
            addLog(`↩ 반격 발동! ${cAtk} 피해`, 'event');
            showFloat(`↩-${cAtk}`, 'damage', 'enemy');
        }
    }

    updateHUD();
}

function heal(target, amount) {
    amount = Math.max(0, Math.floor(amount));
    // 팔라딘 lv3 패널티: 치유 -30%
    if (target === gs.player) {
        let pen = getCharPenaltyMult(gs.selectedChar, getDifficultyLevel(), 'heal');
        amount = Math.max(1, Math.floor(amount * pen.mult));
    }
    target.hp = Math.min(target.maxHp || 999, target.hp + amount);
    let name = target === gs.player ? target.name : gs.enemy.name;
    let side = (target === gs.player) ? 'player' : 'enemy';
    addLog(`${name} 생명 +${amount} 회복`, 'heal');
    showFloat(`+${amount}`, 'heal', side);
    updateHUD();
}

function addDef(target, amount) {
    target.def += amount;
    let isPlayer = target === gs.player;
    addLog(`${target.name} 결계 +${amount}`, 'defend');
    showFloat(`+${amount}▣`, 'defend', isPlayer ? 'player' : 'enemy');
    updateHUD();
}

function addPoison(stacks) {
    let pen = getCharPenaltyMult(gs.selectedChar, getDifficultyLevel(), 'poison');
    stacks = Math.max(0, stacks + pen.bonus);
    if (stacks <= 0) { addLog('부식 무효화 (패널티)', 'event'); return; }
    gs.enemy.poison = (gs.enemy.poison || 0) + stacks;
    addLog(`◆ 적 부식 +${stacks} (총 ${gs.enemy.poison})`, 'event');
    showFloat(`+${stacks}☠`, 'misc', 'enemy');
    updateEnemyStatus();
}

function gainEnergy(amount, cardName) {
    let lvl = Math.min((gs.player.cardUpgrades||{})[cardName] || 0, 3);
    let bonus = lvl > 0 ? 1 : 0;          // 강화 시 +1 추가
    let total = amount + bonus;
    gs.energy = Math.min(gs.maxEnergy + 3, gs.energy + total); // 최대에너지+3까지 초과 가능
    addLog(`◈ 각인 수정 +${total}`, 'event');
    showFloat(`+${total}◈`, 'misc', 'player');
    renderEnergyGems();
}

function gainTempPower(amount, cardName) {
    let lvl = Math.min((gs.player.cardUpgrades||{})[cardName] || 0, 3);
    let total = amount + lvl;              // 강화마다 +1
    // 추적자 lv4 패널티: 각인력 +효과 절반
    let powerMult = getCharPenaltyMult(gs.selectedChar, getDifficultyLevel(), 'power').mult;
    total = Math.max(1, Math.floor(total * powerMult));
    gs.player._tempPower = (gs.player._tempPower || 0) + total;
    gs.player.power += total;
    addLog(`▲ 이번 흐름 각인력 +${total} (임시)`, 'event');
    showFloat(`+${total}⚡`, 'misc', 'player');
    updateHUD();
}

function addRelic(relicName) {
    if (!gs.player.relics.includes(relicName)) {
        gs.player.relics.push(relicName);
        let r = RELIC_DATA[relicName];
        if (r && r.onAcquire) r.onAcquire(gs.player);
        addLog(`유물 획득: ${relicName}`, 'event');
        showFloat(r ? r.icon : '✨', 'misc', 'player');
        renderRelics();
        updateHUD();
    }
}

function addLog(msg, type='') {
    let el = document.getElementById('logEntries');
    if (!el) return;
    let div = document.createElement('div');
    div.className = `log-entry ${type}`;
    div.textContent = msg;
    el.prepend(div);
    // limit
    while (el.children.length > 60) el.removeChild(el.lastChild);
}

function showFloat(text, type, side) {
    let container = document.getElementById('floatContainer');
    let span = document.createElement('span');
    span.className = `float-text ${type}`;
    span.textContent = text;

    let x = side === 'player' ? '20%' : side === 'enemy' ? '72%' : '50%';
    let y = (30 + Math.random() * 20) + '%';
    span.style.left = x;
    span.style.top  = y;
    container.appendChild(span);
    setTimeout(() => span.remove(), 1200);
}

function flashEl(id, cls) {
    let el = document.getElementById(id);
    if (!el) return;
    el.classList.remove(cls);
    void el.offsetWidth;
    el.classList.add(cls);
    setTimeout(() => el.classList.remove(cls), 600);
}

// ============================================================
// DECK / HAND
// ============================================================
function buildDeck() {
    gs.deck = [];

    // 1) 기본 덱 템플릿 (매번 새로 호출해서 최신 gs.player 클로저 사용)
    let baseTemplates = DECK_BUILDERS[gs.selectedChar]();

    // 기본 카드 복사 수
    baseTemplates.forEach(tpl => {
        let copies = 1;
        // 기본 공격패 × 5
        if (['서약의 칼','균열 불꽃','추적 화살'].includes(tpl.name))               copies = 5;
        // 기본 방어·회복패 × 3
        else if (['결계 방어','마력 결계','잔상 회피','생명 각인'].includes(tpl.name)) copies = 3;
        // 중급 공격패 × 2
        else if (['파쇄 일격','아케인 폭발','정밀 저격'].includes(tpl.name))          copies = 2;
        for (let i = 0; i < copies; i++) {
            gs.deck.push(new Card(tpl));
        }
    });

    // 2) 획득한 추가 카드 — 이름으로 라이브러리에서 신선한 템플릿 조회
    let extraNames = (gs.player.ownedCards && gs.player.ownedCards._extraNames) || [];
    let cardLib = getAllCardLibrary();
    // 동적 카드 (REWARD_CARDS / SHOP_CARDS)는 gs.player 직접 참조하는 effect를 가지므로 OK
    extraNames.forEach(name => {
        let tpl = cardLib[name];
        if (tpl) {
            gs.deck.push(new Card(tpl));
        } else {
            // 찾지 못한 경우 기본 덱에서 재탐색
            let fallback = baseTemplates.find(t => t.name === name);
            if (fallback) gs.deck.push(new Card(fallback));
        }
    });

    shuffle(gs.deck);
    gs.discardPile = [];
    gs.hand = [];
}

function drawCards(n = 5) {
    for (let i = 0; i < n; i++) {
        if (gs.deck.length === 0) {
            if (gs.discardPile.length === 0) break;
            gs.deck = [...gs.discardPile];
            gs.discardPile = [];
            shuffle(gs.deck);
            addLog('덱을 재섞었습니다.', 'event');
        }
        gs.hand.push(gs.deck.pop());
    }
}

// ============================================================
// COMBAT LOGIC
// ============================================================
function startCombat(enemyOrGroup, stageNum) {
    // 단일 적 또는 배열 모두 지원
    let group = Array.isArray(enemyOrGroup) ? enemyOrGroup : [enemyOrGroup];
    gs.enemies = group.map(e => {
        let m = deepClone(e);
        m.startHp = m.hp;
        m.poison  = m.poison || 0;
        m.def     = m.def    || 0;
        m.power   = m.power  || 1;
        return m;
    });
    gs.targetIdx = 0;
    gs.enemy = gs.enemies[0]; // 호환용 참조

    gs.currentStage = stageNum;
    gs.turn = 1;
    gs.energy = gs.maxEnergy;
    gs.player.power = PLAYER_TEMPLATES[gs.selectedChar].power + getRelicPowerBonus();
    gs.player.def = 0;
    gs.player.cooldowns = gs.player.cooldowns || {};
    gs.gameOver = false;

    // ── 전투 시작 시 로그 초기화 ──
    let logEntries = document.getElementById('logEntries');
    if (logEntries) logEntries.innerHTML = '';

    // 팔라딘 lv4 패널티: 전투 시작 수정 -1
    let energyPenalty = getCharPenaltyMult(gs.selectedChar, getDifficultyLevel(), 'energy_start').bonus;
    if (energyPenalty < 0) {
        gs.energy = Math.max(0, gs.energy + energyPenalty);
    }

    // 독 묘약 이벤트 효과 적용
    if (gs.player._nextBattlePoison) {
        gs.enemy.poison = (gs.enemy.poison||0) + gs.player._nextBattlePoison;
        addLog(`◈ 독 묘약 발동: 부식 +${gs.player._nextBattlePoison}`, 'event');
        gs.player._nextBattlePoison = 0;
    }

    // Apply battle-start relics
    gs.player.relics.forEach(r => {
        let rel = RELIC_DATA[r];
        if (rel && rel.onBattleStart) rel.onBattleStart(gs.player);
    });

    // 균열술사 lv5 패널티: 전투 시작 시 오염패 추가
    if (gs.selectedChar === 'mage' && getDifficultyLevel() >= 5) {
        let curse = getRandomDebuffCard();
        if (curse) {
            addExtraCard(curse);
            addLog(`⚠ 패널티: [${curse.name}] 덱에 추가됨`, 'damage');
        }
    }

    buildDeck();
    let drawBonus = startCardBonus() + getCharPenaltyMult(gs.selectedChar, getDifficultyLevel(), 'draw').bonus;
    drawCards(Math.max(1, 5 + drawBonus));

    showScreen('combatScreen');
    updateCombatCharIcon(gs.selectedChar);
    updateHUD();
    renderHand();
    renderRelics();
    updateEnemyStatus();

    // 난이도 배지
    let badge = document.getElementById('ascensionBadge');
    if (badge) {
        let lv = getDifficultyLevel();
        if (lv > 0) { badge.textContent = `⚔ 난이도 ${lv}`; badge.style.display = ''; }
        else badge.style.display = 'none';
    }

    document.getElementById('endTurnBtn').disabled = false;
    let enemyNames = gs.enemies.map(e=>e.name).join(', ');
    addLog(`◈ 구역 ${stageNum}: ${enemyNames} 등장!`, 'event');

    if (gs.autoMode) startAutoSequence();
}

function getRelicPowerBonus() {
    let bonus = 0;
    gs.player.relics.forEach(r => {
        if (r === '고대의 반지' || r === '사냥꾼의 은총' || r === '마법 서클') bonus++;
        if (r === '전투의 함성') bonus += 2;
    });
    return bonus;
}

function useCard(index, forcedTarget) {
    if (gs.gameOver || gs.inMap) return;
    if (index < 0 || index >= gs.hand.length) return;

    let card = gs.hand[index];
    let cd = (gs.player.cooldowns[card.name] || 0);
    if (cd > 0) {
        addLog(`${card.name} — 각성 대기 ${cd}흐름 남음`, 'event');
        return;
    }
    if (gs.energy < card.cost) {
        addLog('각인 수정 부족!', 'event');
        return;
    }

    // 카드 사용 애니메이션
    let cardEls = document.querySelectorAll('.card');
    if (cardEls[index]) {
        cardEls[index].classList.add('card-play-anim');
    }

    gs.energy -= card.cost;

    // 마나 결정체: 다음 카드 비용 0
    if (gs.player._nextFree && card.cost > 0) {
        gs.energy += card.cost;
        gs.player._nextFree = false;
        addLog('마나 결정체: 카드 비용 무료!', 'event');
    }

    // 카드 효과 안전 실행
    try {
        card.effect();
    } catch(e) {
        addLog(`⚠ [${card.name}] 효과 오류`, 'event');
        console.error('card effect error:', card.name, e);
    }

    if (card.cooldown > 0) {
        let cdPen = getCharPenaltyMult(gs.selectedChar, getDifficultyLevel(), 'cooldown').bonus;
        gs.player.cooldowns[card.name] = card.cooldown + cdPen;
        addLog(`${card.name} — 각성 대기: ${card.cooldown + cdPen}흐름`, 'event');
    }

    gs.discardPile.push(card);
    gs.hand.splice(index, 1);

    updateHUD();
    renderHand();

    if (checkCombatEnd()) return;

    if (gs.hand.length === 0 && !gs.gameOver) {
        setTimeout(endTurn, 300);
    }
}

function endTurn() {
    if (gs.gameOver || gs.inMap) return;

    gs.turn++;
    gs.energy = gs.maxEnergy;

    // 마법진 — 다음 흐름 수정 추가
    if (gs.player._nextTurnEnergy > 0) {
        gs.energy = Math.min(gs.maxEnergy + 3, gs.energy + gs.player._nextTurnEnergy);
        addLog(`◈ 마법진: 각인 수정 +${gs.player._nextTurnEnergy}`, 'event');
        gs.player._nextTurnEnergy = 0;
    }
    gs.player.def = 0; // 흐름 종료 시 결계 초기화

    // 팔라딘 lv1 패널티: 흐름 종료 시 결계 -3 (이미 0이라 추가 감소 없지만, 향후 유지 효과와 조합)
    // — 현재는 결계가 0으로 리셋되므로 패널티 의미가 흐름 중 결계 회복 불가로 작동
    // 실제 패널티: 흐름 종료 결계 최종값 -3 (음수 방지)

    // 임시 각인력 초기화
    if (gs.player._tempPower > 0) {
        gs.player.power = Math.max(1, gs.player.power - gs.player._tempPower);
        gs.player._tempPower = 0;
    }
    gs.discardPile = gs.discardPile.concat(gs.hand);
    gs.hand = [];

    // Reduce cooldowns
    for (let cn in gs.player.cooldowns) {
        gs.player.cooldowns[cn] = Math.max(0, (gs.player.cooldowns[cn]||0) - 1);
        if (gs.player.cooldowns[cn] === 0) addLog(`✦ [${cn}] 각성 해제!`, 'event');
    }

    // 부식 tick — 모든 살아있는 적에게 적용
    let allEnemies = (gs.enemies && gs.enemies.length > 0) ? gs.enemies : (gs.enemy ? [gs.enemy] : []);
    allEnemies.filter(e => e.hp > 0 && e.poison > 0).forEach(e => {
        let dmg = e.poison;
        addLog(`◈ ${e.name} 부식 피해: ${dmg}`, 'damage');
        e.hp -= dmg;
        e.poison = Math.max(0, e.poison - 1);
        showFloat(`-${dmg}☠`, 'damage', 'enemy');
    });
    if (checkCombatEnd()) return;

    // Turn relic effects
    gs.player.relics.forEach(r => {
        let rel = RELIC_DATA[r];
        if (rel && rel.onTurnStart) rel.onTurnStart(gs.player);
    });

    // Scenario
    processScenario();

    // Enemy attack
    enemyAttack();
    if (checkCombatEnd()) return;

    // 팔라딘 lv1 패널티: 흐름 종료/시작 시 결계 -3
    if (gs.selectedChar === 'paladin' && getDifficultyLevel() >= 1) {
        gs.player.def = Math.max(0, gs.player.def - 3);
    }

    drawCards(5);
    updateHUD();
    renderHand();
    updateEnemyStatus();
    addLog(`— 흐름 ${gs.turn} 시작 —`, 'event');
}

// ============================================================
// GIMMICK DEFINITIONS
// ============================================================
/*
  none          — 기본 공격만
  shield_rage   — 결계가 0이 되면 각인력 +3 (영구)
  enrage_stack  — 3흐름마다 각인력 +1 누적
  regen         — 4흐름마다 생명 10% 회복
  def_steal     — 공격할 때 플레이어 결계를 빼앗아 자신 방어로 흡수
  gold_drain    — 2흐름마다 각인석 5 강탈
  counter       — 피해를 받으면 다음 흐름 공격력 +50% (1회)
  armor_break   — 매 3흐름마다 플레이어 결계 0으로 초기화
*/

let GIMMICK_INFO = {
    none:         { icon:'',   label:'없음',         desc:'' },
    shield_rage:  { icon:'▲', label:'균열 분노',    desc:'결계가 0이 되면 각인력 영구 +3' },
    enrage_stack: { icon:'↑', label:'균열 축적',    desc:'3흐름마다 각인력 +1 영구 상승' },
    regen:        { icon:'♥', label:'재생',         desc:'4흐름마다 최대 생명의 10% 회복' },
    def_steal:    { icon:'◀', label:'결계 흡수',    desc:'공격 시 결계를 절반 흡수' },
    gold_drain:   { icon:'✦', label:'각인석 강탈',    desc:'2흐름마다 각인석 5 강탈' },
    counter:      { icon:'↩', label:'역류 각인',    desc:'피해를 받은 다음 흐름 공격력 +50%' },
    armor_break:  { icon:'✕', label:'결계 파쇄',    desc:'3흐름마다 결계를 0으로 초기화' },
};

function processGimmick() {
    // 모든 살아있는 적에게 기믹 처리
    let activeEnemies = (gs.enemies && gs.enemies.length > 0)
        ? gs.enemies.filter(e => e.hp > 0)
        : (gs.enemy ? [gs.enemy] : []);

    activeEnemies.forEach(enemy => {
        let g = enemy.gimmick;
        if (!g || g === 'none') return;

        if (g === 'shield_rage') {
            if (enemy.def === 0 && !enemy._rageActivated) {
                enemy._rageActivated = true;
                enemy._bonusPower = (enemy._bonusPower || 0) + 3;
                addLog(`▲ ${enemy.name} 분노 폭발! 공격력 +3`, 'event');
                showFloat('분노!', 'misc', 'enemy');
            }
        }
        if (g === 'enrage_stack') {
            if (gs.turn > 1 && gs.turn % 3 === 0) {
                enemy._bonusPower = (enemy._bonusPower || 0) + 1;
                addLog(`↑ ${enemy.name} 분노 축적! (누적 ${enemy._bonusPower})`, 'event');
                showFloat('공격↑', 'misc', 'enemy');
            }
        }
        if (g === 'regen') {
            if (gs.turn % 4 === 0) {
                let base = Math.floor((enemy.startHp || enemy.hp) * 0.1);
                let mult = (gs.selectedChar === 'ranger' && getDifficultyLevel() >= 5) ? 1.5 : 1.0;
                let amt  = Math.floor(base * mult);
                enemy.hp = Math.min(enemy.startHp || enemy.hp, enemy.hp + amt);
                addLog(`✦ ${enemy.name} 재생 +${amt}`, 'heal');
                showFloat(`+${amt}♥`, 'heal', 'enemy');
            }
        }
        if (g === 'def_steal' && gs.player.def > 0) {
            let steal = Math.ceil(gs.player.def / 2);
            gs.player.def -= steal;
            enemy.def += steal;
            addLog(`◀ ${enemy.name} 결계 흡수! -${steal}▣`, 'event');
            showFloat(`-${steal}▣`, 'damage', 'player');
        }
        if (g === 'gold_drain' && gs.turn % 2 === 0) {
            let drain = Math.min(5, gs.player.gold);
            if (drain > 0) {
                gs.player.gold -= drain;
                addLog(`✦ ${enemy.name} 각인석 강탈! -${drain}`, 'damage');
                showFloat(`-${drain}✦`, 'damage', 'player');
            }
        }
        if (g === 'counter' && enemy._counterReady) {
            enemy._bonusPower = (enemy._bonusPower || 0) + Math.floor(computeEnemyIntent() * 0.5);
            enemy._counterReady = false;
            addLog(`◆ ${enemy.name} 반격 태세!`, 'event');
            showFloat('반격!', 'misc', 'enemy');
        }
        if (g === 'armor_break' && gs.turn > 1 && gs.turn % 3 === 0 && gs.player.def > 0) {
            addLog(`✗ ${enemy.name} 결계 파쇄! → 0`, 'damage');
            showFloat('결계 파괴!', 'damage', 'player');
            gs.player.def = 0;
        }
    });
    updateHUD();
}

// counter 기믹: 피해 받을 때 마킹 (applyDamage에서 호출)
function notifyEnemyHit(target) {
    // target이 넘어오면 해당 적, 아니면 현재 타겟 적
    let e = target || gs.enemy;
    if (e && e.gimmick === 'counter' && !e._counterReady) {
        e._counterReady = true;
    }
}

function processScenario() {
    // gs.enemy를 현재 타겟 적으로 동기화
    if (gs.enemies && gs.enemies.length > 0) {
        gs.enemy = gs.enemies[gs.targetIdx] || gs.enemies.find(e => e.hp > 0) || gs.enemies[0];
    }

    // 팔라딘 lv5 패널티: 보스전 3흐름마다 결계 -2
    if (gs.selectedChar === 'paladin' && getDifficultyLevel() >= 5 && gs.enemy && gs.enemy.boss) {
        if (gs.turn % 3 === 0) {
            gs.player.def = Math.max(0, gs.player.def - 2);
            addLog('⚠ 패널티: 보스전 결계 -2', 'damage');
        }
    }

    // 기본 스케일링: 4턴마다 결계 +1
    if (gs.turn % 4 === 0 && gs.enemy.hp > 0) {
        gs.enemy.def += 1;
        addLog(`${gs.enemy.name} 결계 강화 (+1)`, 'defend');
    }
    // 각성 (9턴): 기믹 강화
    if (gs.turn === 9 && gs.enemy.hp > 0 && !gs.enemy.awakened) {
        gs.enemy.awakened = true;
        gs.enemy.hp += 8;                  // +15 → +8
        gs.enemy.def += 1;                 // +2 → +1
        addLog(`◆ ${gs.enemy.name} 각성! 생명+8, 결계+1`, 'event');
        showFloat('각성!', 'misc', 'enemy');
        flashEl('enemyPanel', 'flash-gold');
        // 기믹도 각성 시 강화
        if (gs.enemy.gimmick === 'shield_rage') {
            gs.enemy._rageActivated = false; // 다시 발동 가능
        }
        if (gs.enemy.gimmick === 'counter') {
            gs.enemy._counterReady = false;
        }
    }
    // 기믹 처리
    processGimmick();

    // 플레이어 부식 틱
    if (gs.player.poison > 0) {
        applyDamage(gs.player, gs.player.poison);
        gs.player.poison = Math.max(0, gs.player.poison - 1);
        addLog(`◈ 부식 피해: ${gs.player.poison + 1}`, 'damage');
        updatePlayerStatus();
        if (checkCombatEnd()) return;
    }
}

function enemyAttack() {
    let attackers = (gs.enemies.length > 0 ? gs.enemies : [gs.enemy]).filter(e => e && e.hp > 0);

    attackers.forEach(enemy => {
        if (gs.player.hp <= 0) return;

        let baseAtk = 4 + (gs.currentStage - 1) * 2;
        let bonusPow = enemy._bonusPower || 0;
        let atk = baseAtk + bonusPow;

        if (enemy.elite) atk += 2;
        if (enemy.boss)  {
            atk += 4;
            gs.player.def = Math.max(0, gs.player.def - 1);
            addLog('⚠ 보스: 결계 파괴 -1!', 'damage');
        }
        if (gs.turn % 5 === 0) {
            atk += 2;
            addLog(`▲ ${enemy.name} 분노의 각인!`, 'event');
            showFloat('분노!', 'misc', 'enemy');
        }

        addLog(`${enemy.name} 공격 → ${atk} 피해`, 'enemy-action');
        applyDamage(gs.player, atk);
    });
    updateIntentDisplay();
}

function computeEnemyIntent() {
    let baseAtk = 4 + (gs.currentStage - 1) * 2;
    let bonusPow = (gs.enemy && gs.enemy._bonusPower) || 0;
    let atk = baseAtk + bonusPow;
    if (gs.enemy && gs.enemy.elite) atk += 2;
    if (gs.enemy && gs.enemy.boss)  atk += 4;
    return atk;
}

function updateIntentDisplay() {
    // 각 적 슬롯 위에 의도 표시 (renderEnemies에서 처리하므로 여기선 타겟만 강조)
    document.querySelectorAll('.enemy-slot').forEach((slot, i) => {
        slot.classList.toggle('target', i === gs.targetIdx);
    });
}


function checkCombatEnd() {
    if (gs.gameOver) return false;

    // 현재 타겟이 죽었으면
    if (gs.enemies.length > 0 && gs.enemies[gs.targetIdx] && gs.enemies[gs.targetIdx].hp <= 0) {
        // 다음 살아있는 적으로 전환
        let nextIdx = gs.enemies.findIndex((e, i) => i !== gs.targetIdx && e.hp > 0);
        if (nextIdx >= 0) {
            addLog(`✦ ${gs.enemies[gs.targetIdx].name} 처치! → ${gs.enemies[nextIdx].name}!`, 'event');
            showFloat('처치!', 'misc', 'enemy');
            gs.targetIdx = nextIdx;
            gs.enemy = gs.enemies[nextIdx];
            updateHUD();
            updateEnemyStatus();
            return false;
        }
        // 모두 처치
        let anyAlive = gs.enemies.some(e => e.hp > 0);
        if (!anyAlive) {
            stopAutoSequence();
            gs.gameOver = true;
            setTimeout(() => handleVictory(), 400);
            return true;
        }
    }
    // 레거시: gs.enemy 단독
    if (!gs.enemies.length && gs.enemy && gs.enemy.hp <= 0) {
        stopAutoSequence();
        gs.gameOver = true;
        setTimeout(() => handleVictory(), 400);
        return true;
    }
    if (gs.player.hp <= 0) {
        gs.player.hp = 0;
        stopAutoSequence();
        gs.gameOver = true;
        setTimeout(() => handleDefeat(), 400);
        return true;
    }
    return false;
}

// ============================================================
// AUTO SEQUENCE
// ============================================================
function autoStep() {
    if (gs.gameOver || gs.inMap) return;
    if (gs.hand.length === 0) { endTurn(); return; }

    let idx = gs.hand.findIndex(c => {
        let cd = (gs.player.cooldowns[c.name] || 0);
        return cd === 0 && c.cost <= gs.energy;
    });

    if (idx === -1) { endTurn(); return; }
    useCard(idx);
}

function startAutoSequence() {
    stopAutoSequence();
    gs.autoTimer = setInterval(() => { if (!gs.gameOver) autoStep(); }, gs.autoSpeed);
}
function stopAutoSequence() {
    if (gs.autoTimer) { clearInterval(gs.autoTimer); gs.autoTimer = null; }
}

// ============================================================
// VICTORY / DEFEAT / REWARDS
// ============================================================
function handleVictory() {
    addLog('✦ 전투 승리!', 'event');
    // 모든 적 보상 합산
    let totalReward = 0;
    if (gs.enemies && gs.enemies.length > 0) {
        totalReward = gs.enemies.reduce((sum, e) => sum + (e.reward || 0), 0);
    } else {
        totalReward = gs.enemy ? (gs.enemy.reward || gs.currentStage * 10) : gs.currentStage * 10;
    }
    let goldEarned = Math.floor(totalReward * goldBonusMult());

    if (gs.player.relics.includes('황금 동전')) {
        goldEarned += 8;
        addLog('✦ 황금 동전: 각인석 +8 추가!', 'event');
    }
    if (gs.player.relics.includes('약탈자의 주머니')) {
        goldEarned += 15;
        addLog('✦ 약탈자의 주머니: 각인석 +15!', 'event');
    }
    gs.player.gold += goldEarned;

    if (gs.player.relics.includes('공명석')) {
        let recov = 3;
        gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + recov);
        addLog(`◈ 공명석: 생명 +${recov} 회복`, 'heal');
    }

    // enemies 배열에서 boss/elite 판별
    let anyBoss  = gs.enemies ? gs.enemies.some(e => e.boss)  : (gs.enemy && gs.enemy.boss);
    let anyElite = gs.enemies ? gs.enemies.some(e => e.elite) : (gs.enemy && gs.enemy.elite);

    // 보스 처치 → 다음 막으로
    if (anyBoss) {
        if (gs.player.relics.includes('정복자의 왕관')) {
            gs.player.maxHp += 10; gs.player.hp += 10;
            gs.player.power += 1;
            addLog('◈ 정복자의 왕관: 최대 생명 +10, 각인력 +1!', 'event');
        }
        let nextAct = gs.currentAct + 1;
        if (nextAct >= ACTS.length) {
            showGameOver(true);
            return;
        }
        showActTransition(nextAct, goldEarned);
        return;
    }

    // 엘리트 처치 → 유물 보상
    if (anyElite) {
        let availRelics = Object.keys(RELIC_DATA).filter(r => !gs.player.relics.includes(r));
        if (availRelics.length > 0) {
            let picks = availRelics.sort(() => Math.random()-0.5).slice(0, 3);
            addLog('▲ 엘리트 처치! 유물을 획득합니다...', 'event');
            showEliteRelicReward(picks, goldEarned);
            return;
        }
    }

    if (gs.mapPosition >= gs.mapRows.length - 1) {
        showGameOver(true);
        return;
    }

    showRewardScreen(goldEarned);
}

function showActTransition(nextActIdx, goldEarned) {
    let act = ACTS[nextActIdx];
    let prevAct = ACTS[nextActIdx - 1];
    let screen  = document.getElementById('gameOverScreen');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    screen.classList.add('active');

    document.getElementById('gameOverContent').innerHTML = `
        <div class="act-transition">
            <div class="act-trans-icon">⊗</div>
            <div class="act-trans-title">${prevAct.name} — 각인이 공명했습니다</div>
            <div class="act-trans-sub">✦ +${goldEarned} 각인석 획득</div>
            <div class="act-trans-heal-banner">
                ❤️ 다음 장 진입 시 생명력이 <b>100%</b> 회복됩니다
            </div>
            <div class="act-trans-arrow-row">
                <span class="act-trans-badge">${act.name}</span>
                <span style="font-size:22px;">→</span>
                <span class="act-trans-stagename">${act.stageName}</span>
            </div>
            <div class="act-trans-desc">${actFlavorText(nextActIdx)}</div>
            <button class="btn-ascend" id="nextActBtn">${act.name}으로 진입 →</button>
        </div>
    `;

    document.getElementById('nextActBtn').addEventListener('click', () => {
        if (nextActIdx === 1) addRelic('불굴의 부적');
        if (nextActIdx === 2) addRelic('전투의 함성');

        // ── 막 클리어 완전 회복 ──
        gs.player.hp = gs.player.maxHp;
        gs.player.def = 0;

        // 전투 로그 초기화
        let logEl = document.getElementById('logEntries');
        if (logEl) logEl.innerHTML = '';

        loadAct(nextActIdx);
        gs.mapPosition = 0;
        gs.inMap = true;
        generateMap();
        showScreen('mapScreen');
        renderMap();
        addLog(`✦ ${prevAct.name} 완료 — 생명력이 완전히 회복됩니다!`, 'heal');
        addLog(`◈ ${act.name} — ${act.stageName}에 진입합니다`, 'event');
    });
}

function actFlavorText(idx) {
    return [
        '',
        '가시 계약지를 돌파했습니다. 이제 망령들이 떠도는 묘원이 기다립니다.\n각인의 힘이 더욱 강해지는 것을 느낍니다...',
        '모르가스 공이 봉인됐습니다. 이제 마지막 — 공허의 핵이 균열을 통해 다가옵니다.\n당신이 이 세계의 마지막 희망입니다.',
        '모든 각인이 완성됐습니다.',
    ][idx] || '';
}

function handleDefeat() {
    addLog('✕ 패배...', 'damage');
    // 전투 로그 초기화 (딜레이 후 게임오버 화면 전환)
    setTimeout(() => {
        let logEntries = document.getElementById('logEntries');
        if (logEntries) logEntries.innerHTML = '';
        showGameOver(false);
    }, 600);
}

// 스테이지에 따른 희귀도 가중치
function getRarityWeights() {
    let stage = gs.mapPosition;
    // stage 0~3: rare 15%, legendary 3%
    // stage 4~6: rare 25%, legendary 8%
    // stage 7+:  rare 35%, legendary 15%
    if (stage >= 7) return { common:50, rare:35, legendary:15 };
    if (stage >= 4) return { common:67, rare:25, legendary:8  };
    return               { common:82, rare:15, legendary:3  };
}

function pickCardsByRarity(pool, count) {
    let weights = getRarityWeights();
    let byRarity = { common: pool.filter(c=>c.rarity==='common'),
                     rare:   pool.filter(c=>c.rarity==='rare'),
                     legendary: pool.filter(c=>c.rarity==='legendary') };
    let result = [];
    let used = new Set();

    for (let i = 0; i < count; i++) {
        let roll = Math.random() * 100;
        let rarity = roll < weights.legendary ? 'legendary'
                   : roll < weights.legendary + weights.rare ? 'rare'
                   : 'common';
        let candidates = byRarity[rarity].filter(c => !used.has(c.name));
        // fallback
        if (!candidates.length) candidates = byRarity['common'].filter(c => !used.has(c.name));
        if (!candidates.length) candidates = pool.filter(c => !used.has(c.name));
        if (!candidates.length) break;
        let picked = candidates[Math.floor(Math.random() * candidates.length)];
        result.push(picked);
        used.add(picked.name);
    }
    return result;
}


// 엘리트 처치 후 유물 3개 중 1개 선택
function showEliteRelicReward(picks, goldEarned) {
    let content = document.getElementById('rewardContent');
    let html = `
        <div class="elite-relic-header">
            <div class="elite-relic-header-icon" style="color:#ff7043">${RELIC_RARITY_SVG.rare}</div>
            <div class="elite-relic-title">엘리트 처치!</div>
            <div class="elite-relic-sub">유물 1개를 선택하세요</div>
        </div>
        <div class="elite-relic-choices" id="eliteRelicChoices">
    `;
    picks.forEach(rk => {
        let rd = RELIC_DATA[rk];
        if (!rd) return;
        let rar = rd.rarity || 'common';
        let rarCol = {special:'#e040fb',legendary:'#ffd54f',rare:'#4fc3f7',common:'#a0a0b8'}[rar];
        html += `
            <div class="elite-relic-card" data-relic="${rk}" style="--rc:${rarCol}">
                <div class="elite-relic-icon" style="color:${rarCol}">${getRelicIconSVG(rk, rar)}</div>
                <div class="elite-relic-card-name">${rk}</div>
                <div class="elite-relic-rarity">${rarityBadgeHtml(rar)}</div>
                <div class="elite-relic-card-desc">${rd.desc}</div>
            </div>
        `;
    });
    html += `</div>`;
    content.innerHTML = html;
    showScreen('rewardScreen');
    document.querySelectorAll('.elite-relic-card').forEach(el => {
        el.addEventListener('click', () => {
            let rk = el.dataset.relic;
            addRelic(rk);
            addLog(`◈ [${rk}] 획득!`, 'event');
            showRewardScreen(goldEarned);
        });
    });
}

function showRewardScreen(goldEarned) {
    let pool  = REWARD_CARDS[gs.selectedChar] || [];
    let picks = pickCardsByRarity(pool, 3);
    let weights = getRarityWeights();
    let skipGold = Math.floor(goldEarned * 0.5);

    const RARITY_DATA = {
        common:    { label:'일반', color:'#a0a0b8', border:'rgba(160,160,184,0.35)', glow:'none',                               bg:'rgba(160,160,184,0.05)' },
        rare:      { label:'희귀', color:'#4fc3f7', border:'rgba(79,195,247,0.6)',   glow:'0 0 18px rgba(79,195,247,0.45)',      bg:'rgba(79,195,247,0.06)'  },
        legendary: { label:'전설', color:'#ffd54f', border:'rgba(255,213,79,0.75)',  glow:'0 0 24px rgba(255,213,79,0.55)',      bg:'rgba(255,213,79,0.07)'  },
    };

    let rewardContent = document.getElementById('rewardContent');
    rewardContent.innerHTML = `
        <!-- 골드 배너 -->
        <div class="rw-gold-banner">
            <span class="rw-gold-icon">✦</span>
            <span>각인석 +${goldEarned} 획득</span>
            <span class="rw-gold-cur">현재 ${gs.player.gold}</span>
        </div>

        <!-- 탭 -->
        <div class="rw-tabs">
            <button class="rw-tab active" data-tab="cards">⚔️ 각인패 선택</button>
            <button class="rw-tab" data-tab="upgrade">⚒️ 각인패 각성</button>
        </div>

        <!-- 카드 보상 패널 -->
        <div id="rwPanelCards" class="rw-panel">
            <div class="rw-rarity-hint">
                <span style="color:#a0a0b8">일반 ${weights.common}%</span>
                <span class="rw-dot">·</span>
                <span style="color:#4fc3f7">희귀 ${weights.rare}%</span>
                <span class="rw-dot">·</span>
                <span style="color:#ffd54f">전설 ${weights.legendary}%</span>
            </div>
            <div class="rw-card-row" id="rwCardRow"></div>
            <div class="rw-skip-row">
                <button class="rw-skip-btn" id="rwSkipBtn">
                    건너뛰기 &nbsp;<span class="rw-skip-gold">✦ +${skipGold}</span>
                </button>
            </div>
        </div>

        <!-- 각성(강화) 패널 -->
        <div id="rwPanelUpgrade" class="rw-panel" style="display:none">
            <div id="upgradeCardList" class="upgrade-card-list"></div>
        </div>

        <div id="rewardActions" style="text-align:center;margin-top:12px;"></div>
    `;

    document.getElementById('rewardGold').textContent = gs.player.gold;

    // ── 카드 렌더링 ──
    let rowEl = document.getElementById('rwCardRow');
    picks.forEach((card) => {
        let rarity = card.rarity || 'common';
        let rd = RARITY_DATA[rarity] || RARITY_DATA.common;
        let tc = TYPE_COLOR[card.type] || '#888';
        let tl = TYPE_LABEL[card.type] || card.type;

        let div = document.createElement('div');
        div.className = `rw-card-pick rarity-${rarity}`;
        div.style.cssText = `
            border-color: ${rd.border};
            box-shadow: ${rd.glow};
            background: linear-gradient(160deg, ${rd.bg} 0%, rgba(0,0,0,0) 100%);
        `;
        div.innerHTML = `
            <div class="rw-card-rarity-stripe" style="background:${rd.color}"></div>
            <div class="rw-card-rarity-badge" style="color:${rd.color};border-color:${rd.border};background:${rd.bg}">
                ${rd.label}
            </div>
            <div class="rw-card-cost-gem">◈${card.cost}</div>
            <div class="rw-card-ico" style="color:${tc}">${getCardIconSVG(card)}</div>
            <div class="rw-card-name" style="color:${rd.color}">${card.name}</div>
            <div class="rw-card-type" style="color:${tc}">${tl}</div>
            <div class="rw-card-desc">${card.description}</div>
            <div class="rw-card-select-btn">선택</div>
        `;
        div.addEventListener('click', () => {
            if (div.classList.contains('chosen')) return;
            rowEl.querySelectorAll('.rw-card-pick').forEach(e => e.classList.remove('chosen'));
            div.classList.add('chosen');
            div.querySelector('.rw-card-select-btn').textContent = '✓ 선택됨';
            addExtraCard(card);
            showContinueButton();
        });
        rowEl.appendChild(div);
    });

    // 건너뛰기
    document.getElementById('rwSkipBtn').addEventListener('click', () => {
        gs.player.gold += skipGold;
        document.getElementById('rewardGold').textContent = gs.player.gold;
        document.getElementById('rwSkipBtn').disabled = true;
        document.getElementById('rwSkipBtn').textContent = `✦ +${skipGold} 획득!`;
        showContinueButton();
    });

    // ── 각성(강화) 탭 ──
    renderUpgradeList();

    // 탭 전환
    document.querySelectorAll('.rw-tab').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.rw-tab').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            let tab = btn.dataset.tab;
            document.getElementById('rwPanelCards').style.display   = tab === 'cards'   ? '' : 'none';
            document.getElementById('rwPanelUpgrade').style.display = tab === 'upgrade' ? '' : 'none';
        });
    });

    showScreen('rewardScreen');
}

function renderUpgradeList() {
    let container = document.getElementById('upgradeCardList');
    if (!container) return;
    container.innerHTML = '';

    let cardNames = getOwnedCardNames();

    if (!cardNames.length) {
        container.innerHTML = `<div class="upg-empty">보유한 각인패가 없습니다.</div>`;
        return;
    }

    // 강화 가능 / 최대 / 강화 불가 순 정렬
    let sorted = cardNames.slice().sort((a, b) => {
        let aUpg = CARD_UPGRADES[a], bUpg = CARD_UPGRADES[b];
        let aLv  = gs.player.cardUpgrades[a] || 0;
        let bLv  = gs.player.cardUpgrades[b] || 0;
        let aMax = !aUpg || aLv >= aUpg.maxLv;
        let bMax = !bUpg || bLv >= bUpg.maxLv;
        if (aMax !== bMax) return aMax ? 1 : -1;
        return 0;
    });

    sorted.forEach(name => {
        let upgData  = CARD_UPGRADES[name];
        let curLv    = gs.player.cardUpgrades[name] || 0;
        let maxLv    = upgData ? upgData.maxLv : 0;
        let isMaxed  = curLv >= maxLv || !upgData;
        let noUpg    = !upgData;
        let cost     = isMaxed ? 0 : upgradeCost(curLv);
        let canAfford= gs.player.gold >= cost;
        let nextEff  = upgData && !isMaxed ? upgData.tiers[curLv] : null;
        let prevEff  = upgData && curLv > 0 ? upgData.tiers[curLv - 1] : null;

        // 카드 타입 색상 (라이브러리에서 조회)
        let lib = getAllCardLibrary();
        let card = lib[name];
        let typeColor = card ? (TYPE_COLOR[card.type] || '#888') : '#888';
        let typeIcon  = card ? card.icon : '🃏';
        let costNum   = card ? card.cost : '?';

        let pipsHtml = '';
        if (maxLv > 0) {
            pipsHtml = Array.from({length: maxLv}, (_,i) =>
                `<span class="upg-dot ${i < curLv ? 'on' : ''}"></span>`
            ).join('');
        }

        let div = document.createElement('div');
        div.className = `upg-row ${isMaxed ? 'is-maxed' : ''} ${noUpg ? 'no-upg' : ''}`;
        div.style.setProperty('--tc', typeColor);
        div.innerHTML = `
            <div class="upg-card-visual">
                <div class="upg-card-cost">◈${costNum}</div>
                <div class="upg-card-ico">${typeIcon}</div>
                <div class="upg-card-name">${name}</div>
            </div>
            <div class="upg-card-detail">
                <div class="upg-lv-row">
                    <span class="upg-lv-label">Lv ${curLv}/${maxLv}</span>
                    <span class="upg-dots">${pipsHtml}</span>
                </div>
                ${prevEff  ? `<div class="upg-prev-eff">현재: ${prevEff}</div>` : ''}
                ${nextEff  ? `<div class="upg-next-eff">▸ 다음: ${nextEff}</div>` : ''}
                ${isMaxed && !noUpg ? `<div class="upg-maxed-text">✦ 최대 각성</div>` : ''}
                ${noUpg    ? `<div class="upg-no-upg-text">각성 불가</div>` : ''}
            </div>
            <div class="upg-card-action">
                ${isMaxed || noUpg
                    ? `<span class="upg-badge-max">${noUpg ? '—' : 'MAX'}</span>`
                    : `<button class="upg-btn ${canAfford ? '' : 'locked'}"
                            data-name="${name}" data-cost="${cost}">
                            각성<br><span class="upg-btn-cost">✦${cost}</span>
                       </button>`
                }
            </div>
        `;
        container.appendChild(div);
    });

    // 버튼 바인딩
    container.querySelectorAll('.upg-btn:not(.locked)').forEach(btn => {
        btn.addEventListener('click', () => {
            let name = btn.dataset.name;
            let cost = Number(btn.dataset.cost);
            if (gs.player.gold < cost) {
                addLog('각인석 부족!', 'event');
                return;
            }
            gs.player.gold -= cost;
            gs.player.cardUpgrades[name] = (gs.player.cardUpgrades[name] || 0) + 1;
            addLog(`✦ [${name}] 각성 Lv.${gs.player.cardUpgrades[name]}`, 'event');
            showFloat('각성!', 'misc', 'player');
            let goldEl = document.getElementById('rewardGold');
            if (goldEl) goldEl.textContent = gs.player.gold;
            renderUpgradeList();
        });
    });
}

function showContinueButton() {
    let existing = document.getElementById('continueMapBtn');
    if (existing) return;
    let btn = document.createElement('button');
    btn.id = 'continueMapBtn';
    btn.className = 'btn-continue-map';
    btn.textContent = '◈ 여정 계속';
    btn.addEventListener('click', () => {
        gs.mapPosition++;
        gs.inMap = true;
        showScreen('mapScreen');
        renderMap();
    });
    document.getElementById('rewardContent').appendChild(btn);
}

// ============================================================
// MAP — 분기형 노드 시스템
// ============================================================
/*
  지도는 "층(row)" 단위로 구성됩니다.
  각 층에는 2~3개의 선택지가 있고, 플레이어는 그 중 1개를 골라 진행합니다.
  mapNodes: [ { rowIndex, choices: [node, node, ...] }, ... ]
  mapPosition: 현재 층 인덱스
  mapChosenCol: 이번 층에서 선택한 열 인덱스 (null이면 미선택)
*/

// 막별 맵 프리셋 — 이벤트/유물/일반/엘리트 명확히 분리
let ACT_ROW_PRESETS = {
    // 1막: 고블린 숲 — 이벤트 많고 비교적 쉬운 구조
    act1: [
        { types: ['enemy'] },                         // 0: 첫 전투
        { types: ['enemy', 'event'] },                // 1: 전투 or 이벤트
        { types: ['relic', 'event'] },                // 2: 유물 or 이벤트
        { types: ['enemy', 'enemy', 'event'] },       // 3: 전투×2 or 이벤트
        { types: ['enemy', 'rest'] },                 // 4: 전투 or 공명의 결절
        { types: ['shop', 'event', 'relic'] },        // 5: 상점·이벤트·유물
        { types: ['elite', 'enemy'] },                // 6: 엘리트 or 전투
        { types: ['event', 'rest'] },                 // 7: 이벤트 or 공명의 결절
        { types: ['boss'] },                          // 8: 보스
    ],
    // 2막: 묘지 — 유물 강조, 엘리트 2회
    act2: [
        { types: ['enemy'] },
        { types: ['enemy', 'event'] },
        { types: ['relic', 'shop'] },
        { types: ['enemy', 'enemy', 'event'] },
        { types: ['elite', 'rest'] },
        { types: ['relic', 'event', 'enemy'] },
        { types: ['enemy', 'enemy', 'shop'] },
        { types: ['elite', 'event'] },
        { types: ['rest', 'relic'] },
        { types: ['boss'] },
    ],
    // 3막: 심연 — 어렵고 치열한 구조, 엘리트 더 많음
    act3: [
        { types: ['enemy'] },
        { types: ['enemy', 'relic'] },
        { types: ['elite', 'event'] },
        { types: ['enemy', 'enemy', 'event'] },
        { types: ['shop', 'rest'] },
        { types: ['elite', 'relic'] },
        { types: ['enemy', 'enemy', 'enemy'] },
        { types: ['event', 'rest'] },
        { types: ['elite', 'shop'] },
        { types: ['boss'] },
    ],
};

let NODE_LABELS = {
    enemy:  (n) => `⚔️ ${n.monsterName || '전투'}`,
    elite:  (n) => `⚠️ 수호자 — ${n.monsterName || '?'}`,
    boss:   (n) => `💀 ${n.monsterName || '보스'}`,
    shop:   ()  => `🏪 각인 상인`,
    event:  ()  => `✨ 각인의 기억`,
    relic:  ()  => `💍 각인 유물`,
    rest:   ()  => `◈ 공명의 결절`,
};

let NODE_ICONS = { enemy:'⚔️', elite:'😈', boss:'👑', shop:'🏪', event:'✨', relic:'💍', rest:'◈' };
let NODE_COLORS = {
    enemy:'#c0392b', elite:'#ff7043', boss:'#ff1744',
    shop:'#c9a84c', event:'#7c4dff', relic:'#00bcd4', rest:'#27ae60',
};

function generateMap() {
    gs.mapRows = [];
    gs.mapPosition = 0;
    gs.mapChosenCol = null;

    let pool = gs.monsterPool;
    let actKey = ['act1','act2','act3'][gs.currentAct] || 'act1';
    let presets = ACT_ROW_PRESETS[actKey] || ACT_ROW_PRESETS.act1;

    let normalMonsters = pool.filter(m => !m.elite && !m.boss);
    let eliteMonsters  = pool.filter(m => m.elite);
    // loadAct에서 선택된 보스를 사용 (없으면 pool에서 찾기)
    let bossMonster    = gs.selectedBoss || pool.find(m => m.boss) || pool[pool.length - 1];

    let enemyIdx = 0;
    let eliteIdx = 0;

    presets.forEach((preset, rowIdx) => {
        let choices = [];
        let types = [...preset.types].sort(() => Math.random() - 0.5);

        types.forEach(type => {
            let node = { type, rowIndex: rowIdx };

            if (type === 'enemy') {
                let m = normalMonsters[enemyIdx % normalMonsters.length];
                node.monsterIdx  = pool.indexOf(m);
                node.monsterName = m.name;
                node.monsterHp   = m.hp;
                node.monsterPow  = m.power || 1;
                node.monsterIcon = m.icon || '👾';
                // 다중 몹 여부 (2~3막 일부 노드는 2마리)
                if (gs.currentAct >= 1 && Math.random() < 0.35) {
                    let m2 = normalMonsters[(enemyIdx + 1) % normalMonsters.length];
                    node.extraMonster = { name: m2.name, hp: m2.hp, def: m2.def || 0, icon: m2.icon || '👾', gimmick: m2.gimmick || 'none' };
                }
                enemyIdx++;
            } else if (type === 'elite') {
                let m = eliteMonsters[eliteIdx % Math.max(1, eliteMonsters.length)];
                node.monsterIdx  = pool.indexOf(m);
                node.monsterName = m.name;
                node.monsterHp   = Math.floor(m.hp * 1.1);
                node.monsterPow  = (m.power || 1);
                node.monsterIcon = m.icon || '😈';
                eliteIdx++;
            } else if (type === 'boss') {
                node.monsterIdx  = pool.indexOf(bossMonster);
                node.monsterName = bossMonster.name;
                node.monsterHp   = bossMonster.hp + 15;
                node.monsterPow  = (bossMonster.power || 1) + 1;
                node.monsterIcon = bossMonster.icon || '💀';
            } else if (type === 'relic') {
                // 랜덤 유물 미리 배정
                let relicKeys = Object.keys(RELIC_DATA).filter(r => !gs.player.relics.includes(r));
                node.relicKey = relicKeys[Math.floor(Math.random() * relicKeys.length)] || null;
            }

            node.label = NODE_LABELS[type] ? NODE_LABELS[type](node) : type;
            choices.push(node);
        });

        gs.mapRows.push({ choices });
    });

    gs.maxStage = presets.filter(p => p.types.some(t => ['enemy','elite','boss'].includes(t))).length;
}



function renderMap() {
    let el = document.getElementById('mapContainer');
    if (!el) return;
    let p = gs.player;
    if (!p) return;

    document.getElementById('mapPlayerName').textContent = p.name;
    document.getElementById('mapHp').textContent = p.hp;
    document.getElementById('mapGold').textContent = p.gold;

    let rows = gs.mapRows;
    if (!rows || rows.length === 0) {
        el.innerHTML = '<div style="color:var(--text-dim);text-align:center;padding:40px">지도 생성 중...</div>';
        return;
    }
    let curRow = gs.mapPosition;

    let html = `<div class="map-path">`;

    // 위에서 아래로 (보스가 마지막)
    rows.forEach((row, rowIdx) => {
        let isDoneRow = rowIdx < curRow;
        let isActiveRow = rowIdx === curRow;
        let isLockedRow = rowIdx > curRow;

        // 층 구분자
        let rowLabel = rowIdx === 0 ? '시작' : rowIdx === rows.length - 1 ? '최종 결전' : `${rowIdx}층`;
        html += `<div class="map-row-label">${rowLabel}</div>`;
        html += `<div class="map-row ${isActiveRow?'active-row':''} ${isDoneRow?'done-row':''} ${isLockedRow?'locked-row':''}">`;

        row.choices.forEach((node, colIdx) => {
            let isDone   = isDoneRow;
            // 이전 행에서 선택한 노드인지 (colIdx가 mapChosenCol과 일치하는 완료된 행)
            let isChosen = isDoneRow && (rowIdx === curRow - 1) && (colIdx === gs.mapChosenCol);
            let isActive = isActiveRow;
            let isLocked = isLockedRow;

            let sublabel = '';
            if (['enemy','elite','boss'].includes(node.type)) {
                let multi = node.extraMonster ? ' +1' : '';
                sublabel = `❤️${node.monsterHp||'?'} ${node.monsterIcon||'👾'}${multi}`;
            } else if (node.type === 'rest') {
                sublabel = '생명 30% 공명 회복';
            } else if (node.type === 'shop') {
                sublabel = '유물 · 각인패 구매';
            } else if (node.type === 'event') {
                sublabel = '각인의 기억...';
            } else if (node.type === 'relic') {
                sublabel = node.relicKey ? `${RELIC_DATA[node.relicKey]?.icon || '💍'} ${node.relicKey}` : '??? 각인 유물';
            }

            let cls = `map-node type-${node.type}`;
            if (isDone)    cls += ' done';
            if (isChosen)  cls += ' chosen-path';
            if (isActive) cls += ' active';
            if (isLocked) cls += ' locked';

            html += `
                <div class="${cls}" data-row="${rowIdx}" data-col="${colIdx}"
                     style="--node-color:${NODE_COLORS[node.type]||'#888'}">
                    <div class="node-icon">${NODE_ICONS[node.type]}</div>
                    <div class="node-info">
                        <div class="node-label">${node.label}</div>
                        ${sublabel ? `<div class="node-sublabel">${sublabel}</div>` : ''}
                    </div>
                    ${isDone   ? '<div class="node-done-badge">✓</div>' : ''}
                    ${isActive ? '<div class="active-arrow">→</div>' : ''}
                </div>
            `;
        });

        html += `</div>`; // .map-row

        if (rowIdx < rows.length - 1) {
            html += `<div class="map-connector"></div>`;
        }
    });

    html += `</div>`;
    el.innerHTML = html;

    // 활성 행의 노드만 클릭 가능
    el.querySelectorAll('.map-node.active').forEach(n => {
        n.addEventListener('click', () => {
            let rowIdx = Number(n.dataset.row);
            let colIdx = Number(n.dataset.col);
            loadNode(rowIdx, colIdx);
        });
    });
}

function loadNode(rowIdx, colIdx) {
    gs.mapChosenCol = colIdx;  // 선택한 열 기록
    let row = gs.mapRows[rowIdx];
    if (!row) return;
    let node = row.choices[colIdx];
    if (!node) return;
    gs.inMap = false;

    if (node.type === 'shop') {
        showShop();
    } else if (node.type === 'event') {
        showEvent();
    } else if (node.type === 'rest') {
        showRest();
    } else if (node.type === 'relic') {
        // 유물 상자 — 유물 획득 OR 각인석 획득 선택
        showRelicChest(node);
    } else {
        let act = ACTS[gs.currentAct];
        let isBoss  = node.type === 'boss';
        let isElite = node.type === 'elite';

        let group;

        if (isBoss && gs.selectedBoss) {
            // 보스: 단일 적
            let m = deepClone(gs.selectedBoss);
            applyAscension(m, false, true);
            startCombat([m], rowIdx + 1);
            return;
        } else if (isElite && act && act.eliteGroups && act.eliteGroups.length > 0) {
            // 엘리트: eliteGroups에서 무작위 선택
            let eg = act.eliteGroups[Math.floor(Math.random() * act.eliteGroups.length)];
            group = deepClone(eg);
        } else if (!isBoss && !isElite && act && act.groups && act.groups.length > 0) {
            // 일반: groups에서 무작위 선택
            group = deepClone(act.groups[Math.floor(Math.random() * act.groups.length)]);
        } else {
            // 폴백: monsterPool 단일 적
            let poolM = gs.monsterPool[node.monsterIdx] || gs.monsterPool[gs.monsterPool.length-1];
            group = [deepClone(poolM)];
        }

        // 난이도 적용 + HP 보정
        let mult = getDifficultyMult();
        group.forEach((m, i) => {
            m.startHp = m.hp;
            m.hp = Math.ceil(m.hp * mult);
            m.startHp = m.hp;
            m.def = m.def || 0;
            m.power = m.power || 1;
            if (isElite) { m.elite = true; }
        });

        startCombat(group, rowIdx + 1);
    }
}

// ============================================================
// REST (공명의 결절) — 체력 회복 OR 각인패 각성 선택
// ============================================================
function showRest() {
    let healAmt = Math.floor(gs.player.maxHp * (0.35 + restHealBonus()));

    let html = `
        <div class="event-card">
            <div class="event-icon-sym">◈</div>
            <div class="event-title">◈ 공명의 결절</div>
            <div class="event-desc">각인의 공명이 느껴지는 결절에 도달했습니다.<br>잠시 멈춰 무엇을 하시겠습니까?</div>
            <div class="rest-choices" id="restChoices">

                <div class="rest-choice-btn" id="restHealBtn">
                    <div class="rest-choice-icon-sym" style="color:#5dd98c">♥</div>
                    <div class="rest-choice-title">생명 공명</div>
                    <div class="rest-choice-desc">생명 <b>+${healAmt}</b> 회복<br>
                        <small>(현재 ${gs.player.hp} / ${gs.player.maxHp})</small>
                    </div>
                </div>

                <div class="rest-choice-btn" id="restUpgradeBtn">
                    <div class="rest-choice-icon-sym" style="color:var(--gold)">✦</div>
                    <div class="rest-choice-title">각인패 각성</div>
                    <div class="rest-choice-desc">보유 각인패 1장을 <b>무료</b>로 각성합니다</div>
                </div>

            </div>

            <!-- 각인패 각성 패널 (기본 숨김) -->
            <div id="restUpgradePanel" style="display:none; margin-top:14px; width:100%;">
                <div class="event-desc" style="margin-bottom:10px;">각성할 각인패를 선택하세요</div>
                <div id="restUpgradeList" class="rest-upgrade-list"></div>
            </div>

            <div id="restResultMsg" style="display:none;" class="event-result good"></div>
        </div>
    `;
    document.getElementById('eventContent').innerHTML = html;
    showScreen('eventScreen');

    // ── 휴식 선택 ──
    document.getElementById('restHealBtn').addEventListener('click', () => {
        gs.player.hp = Math.min(gs.player.maxHp, gs.player.hp + healAmt);
        addLog(`◈ 공명 휴식: 생명 +${healAmt} 회복`, 'heal');
        showFloat(`+${healAmt}♥`, 'heal', 'player');
        document.getElementById('restChoices').style.display = 'none';
        let msg = document.getElementById('restResultMsg');
        msg.textContent = `생명 +${healAmt} 회복! (현재 ${gs.player.hp}/${gs.player.maxHp})`;
        msg.style.display = '';
        appendRestContinue();
    });

    // ── 각인패 각성 선택 ──
    document.getElementById('restUpgradeBtn').addEventListener('click', () => {
        document.getElementById('restChoices').style.display = 'none';
        document.getElementById('restUpgradePanel').style.display = '';
        renderRestUpgradeList();
    });
}

function renderRestUpgradeList() {
    let container = document.getElementById('restUpgradeList');
    if (!container) return;
    container.innerHTML = '';

    let cardNames = getOwnedCardNames();
    let upgradable = cardNames.filter(name => {
        let ud = CARD_UPGRADES[name];
        let lv = (gs.player.cardUpgrades[name] || 0);
        return ud && lv < ud.maxLv;
    });

    if (upgradable.length === 0) {
        container.innerHTML = '<div class="event-desc" style="color:var(--text-dim)">각성 가능한 각인패가 없습니다.</div>';
        appendRestContinue();
        return;
    }

    upgradable.forEach(name => {
        let ud = CARD_UPGRADES[name];
        let lv = (gs.player.cardUpgrades[name] || 0);
        let nextEff = ud.tiers[lv] || '';

        let btn = document.createElement('div');
        btn.className = 'rest-upgrade-row';
        btn.innerHTML = `
            <div class="rest-upgrade-name">${name}</div>
            <div class="rest-upgrade-info">
                Lv.${lv} → <b>Lv.${lv+1}</b>
                ${nextEff ? `<span class="rest-upgrade-eff">▸ ${nextEff}</span>` : ''}
            </div>
            <button class="btn-upgrade rest-upg-pick">강화</button>
        `;
        btn.querySelector('.rest-upg-pick').addEventListener('click', () => {
            gs.player.cardUpgrades[name] = (gs.player.cardUpgrades[name] || 0) + 1;
            addLog(`✦ [${name}] 각성 Lv.${gs.player.cardUpgrades[name]}`, 'event');
            showFloat('강화!', 'misc', 'player');
            document.getElementById('restUpgradePanel').style.display = 'none';
            let msg = document.getElementById('restResultMsg');
            msg.textContent = `[${name}] Lv.${gs.player.cardUpgrades[name]}으로 강화 완료!`;
            msg.style.display = '';
            appendRestContinue();
        });
        container.appendChild(btn);
    });
}

function appendRestContinue() {
    if (document.getElementById('restContinueBtn')) return;
    let btn = document.createElement('button');
    btn.id = 'restContinueBtn';
    btn.className = 'btn-event-continue';
    btn.textContent = '여정 계속 →';
    btn.style.marginTop = '16px';
    btn.addEventListener('click', () => {
        gs.mapPosition++;
        gs.inMap = true;
        showScreen('mapScreen');
        renderMap();
    });
    document.querySelector('.event-card').appendChild(btn);
}

// ============================================================
// RELIC CHEST — 유물 + 소량 골드 동시 획득
// ============================================================
function showRelicChest(node) {
    let relicKey = node.relicKey;
    let relicData = relicKey ? RELIC_DATA[relicKey] : null;
    let goldAmt = 20 + gs.currentAct * 10; // 1막 20 / 2막 30 / 3막 40

    let relicHtml = relicData
        ? `<div class="relic-chest-relic">
               <span class="relic-chest-icon" style="color:#00bcd4">${getRelicIconSVG(relicKey, relicData.rarity)}</span>
               <div>
                   <div class="relic-chest-name">${relicKey}</div>
                   <div class="relic-chest-desc">${relicData.desc}</div>
               </div>
           </div>`
        : '';

    let html = `
        <div class="event-card">
            <div class="event-icon-sym" style="color:#00bcd4">◇</div>
            <div class="event-title">각인 유물 발견</div>
            <div class="event-desc">봉인된 각인 상자에서 유물과 각인석이 나타납니다.</div>
            ${relicHtml}
            <div class="relic-chest-gold-tag">💰 각인석 +${goldAmt} 함께 획득</div>
            <div id="relicResultMsg" style="display:none;" class="event-result good"></div>
            <button class="btn-event-continue" id="relicOpenBtn">각인 해제 →</button>
        </div>
    `;

    document.getElementById('eventContent').innerHTML = html;
    showScreen('eventScreen');

    document.getElementById('relicOpenBtn').addEventListener('click', () => {
        // 유물 획득
        if (relicKey) addRelic(relicKey);
        // 골드 지급
        gs.player.gold += goldAmt;
        addLog(`✦ 각인석 +${goldAmt} 획득`, 'event');
        showFloat(`+${goldAmt}✦`, 'misc', 'player');

        document.getElementById('relicOpenBtn').style.display = 'none';
        let msg = document.getElementById('relicResultMsg');
        msg.innerHTML = `${relicKey ? `✦ ${relicKey} 획득!` : ''} &nbsp; ✦ 각인석 +${goldAmt}!`;
        msg.style.display = '';

        let btn = document.createElement('button');
        btn.className = 'btn-event-continue';
        btn.textContent = '여정 계속 →';
        btn.style.marginTop = '10px';
        btn.addEventListener('click', () => {
            gs.mapPosition++;
            gs.inMap = true;
            showScreen('mapScreen');
            renderMap();
        });
        document.querySelector('.event-card').appendChild(btn);
    });
}
function showShop() {
    const RELIC_PRICE = 50;
    const CARD_PRICE  = 40;

    let pool        = SHOP_CARDS[gs.selectedChar] || [];
    let relicPool   = Object.keys(RELIC_DATA).filter(r => !gs.player.relics.includes(r));
    let relicOffers = relicPool.sort(() => Math.random()-0.5).slice(0, 3);
    let cardOffers  = [...pool].sort(() => Math.random()-0.5).slice(0, 4);
    let soldRelics  = new Set();
    let soldCards   = new Set();

    function render() {
        let gold = gs.player.gold;
        document.getElementById('shopGold').textContent = gold;

        let relicHtml = relicOffers.map(r => {
            let data = RELIC_DATA[r];
            if (!data) return '';
            let sold   = soldRelics.has(r);
            let canBuy = gold >= RELIC_PRICE && !sold;
            let rar    = data.rarity || 'common';
            let rarCol = { special:'#e040fb', legendary:'#ffd54f', rare:'#4fc3f7', common:'#a0a0b8' }[rar] || '#a0a0b8';
            let rarLbl = { special:'전용', legendary:'전설', rare:'희귀', common:'일반' }[rar] || '일반';
            return `
            <div class="shop-relic-card ${!canBuy&&!sold?'shop-locked':''} ${sold?'shop-sold':''}"
                 data-type="relic" data-key="${r}">
                <div class="shop-relic-top" style="border-color:${rarCol}33">
                    <span class="shop-relic-ico" style="color:${rarCol}">${getRelicIconSVG(r, rar)}</span>
                    <span class="shop-rarity-tag" style="color:${rarCol};border-color:${rarCol}55">${rarLbl}</span>
                </div>
                <div class="shop-relic-name">${r}</div>
                <div class="shop-relic-desc">${data.desc}</div>
                <div class="shop-relic-price ${!canBuy&&!sold?'shop-price-insufficient':''}">
                    ${sold ? '✓ 구매 완료' : `✦ ${RELIC_PRICE}${!canBuy?' — 부족':''}`}
                </div>
            </div>`;
        }).join('');

        let cardHtml = cardOffers.map((c, i) => {
            let sold   = soldCards.has(i);
            let canBuy = gold >= CARD_PRICE && !sold;
            let tc     = TYPE_COLOR[c.type] || '#888';
            let tl     = TYPE_LABEL[c.type] || c.type;
            let rarCol = { legendary:'#ffd54f', rare:'#4fc3f7', common:'#a0a0b8' }[c.rarity||'common'] || '#a0a0b8';
            let rarLbl = { legendary:'전설', rare:'희귀', common:'일반' }[c.rarity||'common'] || '일반';
            return `
            <div class="shop-card-card ${!canBuy&&!sold?'shop-locked':''} ${sold?'shop-sold':''}"
                 data-type="card" data-idx="${i}">
                <div class="shop-card-top" style="border-top-color:${tc}">
                    <div class="shop-card-cost-gem">◈${c.cost}</div>
                    <span class="shop-rarity-tag" style="color:${rarCol};border-color:${rarCol}55">${rarLbl}</span>
                </div>
                <div class="shop-card-ico" style="color:${tc}">${getCardIconSVG(c)}</div>
                <div class="shop-card-name" style="color:${rarCol}">${c.name}</div>
                <div class="shop-card-type" style="color:${tc}">${tl}</div>
                <div class="shop-card-desc">${c.description}</div>
                <div class="shop-card-price ${!canBuy&&!sold?'shop-price-insufficient':''}">
                    ${sold ? '✓ 구매 완료' : `✦ ${CARD_PRICE}${!canBuy?' — 부족':''}`}
                </div>
            </div>`;
        }).join('');

        document.getElementById('shopContent').innerHTML = `
            <div class="shop-wrap">
                <div class="shop-gold-bar">
                    <span class="shop-gold-label">보유 각인석</span>
                    <span class="shop-gold-val">✦ ${gold}</span>
                </div>
                <div class="shop-section-hd">
                    <span class="shop-section-ico">💍</span>
                    <span class="shop-section-nm">각인 유물</span>
                    <span class="shop-section-price">✦ ${RELIC_PRICE}</span>
                </div>
                <div class="shop-relic-row">${relicHtml}</div>
                <div class="shop-section-hd" style="margin-top:20px">
                    <span class="shop-section-ico">📖</span>
                    <span class="shop-section-nm">각인패</span>
                    <span class="shop-section-price">✦ ${CARD_PRICE}</span>
                </div>
                <div class="shop-card-row">${cardHtml}</div>
            </div>
        `;

        document.querySelectorAll('#shopContent [data-type]').forEach(el => {
            if (el.classList.contains('shop-locked') || el.classList.contains('shop-sold')) return;
            el.addEventListener('click', () => {
                if (el.classList.contains('shop-sold') || el.classList.contains('shop-locked')) return;
                if (el.dataset.type === 'relic') {
                    let r = el.dataset.key;
                    if (gs.player.gold < RELIC_PRICE) return;
                    gs.player.gold -= RELIC_PRICE;
                    soldRelics.add(r);
                    addRelic(r);
                    addLog(`✦ [${r}] 구매`, 'event');
                } else {
                    let idx = Number(el.dataset.idx);
                    let c   = cardOffers[idx];
                    if (!c || gs.player.gold < CARD_PRICE) return;
                    gs.player.gold -= CARD_PRICE;
                    soldCards.add(idx);
                    addExtraCard(c);
                    addLog(`✦ [${c.name}] 구매`, 'event');
                }
                render();
            });
        });
    }

    render();
    showScreen('shopScreen');
}


// ============================================================
// EVENTS — 선택지 방식으로 전면 확장
// ============================================================
let EVENTS = [
    {
        icon:'💧', title:'각인의 샘',
        desc:'땅 속에서 각인의 기운이 솟구칩니다. 마시는 자에게 힘을 주지만, 과음하면 위험합니다.',
        choices: [
            { label:'조금 마시기',
              result:'good', text:'생명력 +20 회복',
              action: p => { heal(p, 20); addLog('각인의 샘: 생명력 +20','heal'); }},
            { label:'오염된 물 들이키기',
              result:'neutral', text:'생명력 +35, 오염패 1장 획득',
              action: p => {
                  heal(p, 35);
                  let d = getRandomDebuffCard();
                  addExtraCard(d);
                  addLog(`오염된 샘: 생명력 +35, [${d.name}] 오염됨`,'event');
              }},
            { label:'그냥 지나침',
              result:'neutral', text:'아무 일 없음',
              action: () => {}},
        ]
    },
    {
        icon:'📦', title:'파기된 계약 상자',
        desc:'공허의 각인이 새겨진 낡은 상자. 힘이 응축되어 있지만 오염도 함께합니다.',
        choices: [
            { label:'계약 수용 (각인석 +55, 오염패 획득)',
              result:'good', text:'각인석 +55 + 오염패 1장',
              action: p => {
                  p.gold += 55;
                  let d = getRandomDebuffCard();
                  addExtraCard(d);
                  addLog(`계약 수용: 각인석 +55, [${d.name}] 오염`,'event');
              }},
            { label:'안전하게 열기 (각인석 +20)',
              result:'neutral', text:'각인석 +20',
              action: p => { p.gold += 20; addLog('각인석 +20','event'); }},
            { label:'무시',
              result:'neutral', text:'아무 일 없음',
              action: () => {}},
        ]
    },
    {
        icon:'👁️', title:'공허의 속삭임',
        desc:'균열에서 흘러나온 목소리가 힘을 제안합니다. "대가가 있다는 건... 알고 있겠지?"',
        choices: [
            { label:'각인력 +4 수용 (생명 -20, 오염패 1장)',
              result:'good', text:'각인력 +4, 생명 -20, 오염패 1장',
              action: p => {
                  p.power += 4;
                  p.hp = Math.max(1, p.hp - 20);
                  let d = getRandomDebuffCard();
                  addExtraCard(d);
                  addLog(`공허 계약: 각인력+4, 생명-20, [${d.name}]`,'event');
              }},
            { label:'각인석으로 결계 치기 (각인석 -45, 각인력 +2)',
              result:'neutral', text:'각인석 -45, 각인력 +2',
              action: p => {
                  if(p.gold < 45){ addLog('각인석 부족','damage'); return; }
                  p.gold -= 45; p.power += 2;
                  addLog('각인석 45로 안전 계약: 각인력 +2','event');
              }},
            { label:'무시하기',
              result:'neutral', text:'아무 일 없음',
              action: () => {}},
        ]
    },
    {
        icon:'📚', title:'금지된 각인 서고',
        desc:'오래된 각인 연구 기록들. 지식에는 대가가 따릅니다.',
        choices: [
            { label:'전설 각인패 습득 (생명 -15)',
              result:'good', text:'전설 각인패 1장 + 생명 -15',
              action: p => {
                  p.hp = Math.max(1, p.hp - 15);
                  let pool = (REWARD_CARDS[gs.selectedChar]||[]).filter(c => c.rarity === 'legendary');
                  if(!pool.length) pool = REWARD_CARDS[gs.selectedChar]||[];
                  if(pool.length){
                      let c = pool[Math.floor(Math.random()*pool.length)];
                      addExtraCard(c);
                      addLog(`금서: [${c.name}] 획득! 생명 -15`,'event');
                  }
              }},
            { label:'오염패 제거 (각인석 -30)',
              result:'neutral', text:'오염패 1장 제거',
              action: p => {
                  if(p.gold < 30){ addLog('각인석 부족','damage'); return; }
                  p.gold -= 30;
                  let names = p.ownedCards._extraNames || [];
                  let lib = getAllCardLibrary();
                  let idx = names.findIndex(n => { let t=lib[n]; return t && t.type==='curse'; });
                  if(idx >= 0){
                      let r = names.splice(idx,1)[0];
                      addLog(`[${r}] 제거 완료`,'event');
                  } else addLog('제거할 오염패 없음','event');
              }},
            { label:'나가기',
              result:'neutral', text:'아무 일 없음',
              action: () => {}},
        ]
    },
    {
        icon:'⚗️', title:'균열 연금술사',
        desc:'공간의 균열을 연구하는 연금술사가 묘약을 판매합니다.',
        choices: [
            { label:'생명 묘약 (각인석 -20, 생명 +25)',
              result:'good', text:'생명 +25',
              action: p => {
                  if(p.gold<20){ addLog('각인석 부족','damage'); return; }
                  p.gold-=20; heal(p,25);
              }},
            { label:'각인 묘약 (각인석 -35, 각인력 +2)',
              result:'good', text:'각인력 +2',
              action: p => {
                  if(p.gold<35){ addLog('각인석 부족','damage'); return; }
                  p.gold-=35; p.power+=2; addLog('각인 묘약: 각인력 +2','event');
              }},
            { label:'부식 묘약 (무료, 다음 전투 적 부식+8)',
              result:'neutral', text:'다음 전투 적 부식 +8',
              action: p => {
                  p._nextBattlePoison=(p._nextBattlePoison||0)+8;
                  addLog('부식 묘약 장착: 다음 접촉 부식+8','event');
              }},
        ]
    },
    {
        icon:'🏚️', title:'파기된 성채',
        desc:'전쟁의 흔적이 남은 폐성. 훈련 시설과 금고가 남아 있습니다.',
        choices: [
            { label:'각성 훈련 (생명 -8, 무작위 각인패 강화)',
              result:'good', text:'생명 -8, 각인패 무료 강화',
              action: p => {
                  p.hp = Math.max(1, p.hp - 8);
                  let names = getOwnedCardNames();
                  let upgradable = names.filter(n => {
                      let ud=CARD_UPGRADES[n]; let lv=p.cardUpgrades[n]||0;
                      return ud && lv < ud.maxLv;
                  });
                  if(upgradable.length){
                      let n = upgradable[Math.floor(Math.random()*upgradable.length)];
                      p.cardUpgrades[n]=(p.cardUpgrades[n]||0)+1;
                      addLog(`[${n}] 각성 Lv.${p.cardUpgrades[n]}`,'event');
                  } else addLog('각성 가능한 각인패 없음','event');
              }},
            { label:'금고 약탈 (각인석 +40)',
              result:'good', text:'각인석 +40',
              action: p => { p.gold+=40; addLog('성채 약탈: 각인석 +40','event'); }},
            { label:'지나침',
              result:'neutral', text:'아무 일 없음',
              action: () => {}},
        ]
    },
    {
        icon:'🪦', title:'균열의 제단',
        desc:'공허에서 넘어온 제단이 피를 요구합니다. 대가를 치르면 봉인된 힘을 얻습니다.',
        choices: [
            { label:'생명의 각인 (생명 -25%, 유물 1개 획득)',
              result:'good', text:'최대 생명의 25% 소모, 랜덤 유물 획득',
              action: p => {
                  let cost = Math.floor(p.maxHp * 0.25);
                  p.hp = Math.max(1, p.hp - cost);
                  let avail = Object.keys(RELIC_DATA).filter(r => !p.relics.includes(r));
                  if(avail.length){
                      let r = avail[Math.floor(Math.random()*avail.length)];
                      addRelic(r);
                      addLog(`제단의 선물: [${r}] + 생명 -${cost}`,'event');
                  }
              }},
            { label:'각인석의 봉헌 (각인석 -50, 최대 생명 +15)',
              result:'good', text:'각인석 -50, 최대 생명 +15',
              action: p => {
                  if(p.gold<50){ addLog('각인석 부족','damage'); return; }
                  p.gold-=50; p.maxHp+=15; p.hp+=15;
                  addLog('제단 봉헌: 최대 생명 +15','event');
              }},
            { label:'외면',
              result:'neutral', text:'아무 일 없음',
              action: () => {}},
        ]
    },
    {
        icon:'💎', title:'균열 수정 지대',
        desc:'각인의 힘이 응축된 수정들이 흩어져 있습니다. 하지만 불안정해 보입니다.',
        choices: [
            { label:'안정된 수정 흡수 (각인석 +35)',
              result:'good', text:'각인석 +35',
              action: p => { p.gold+=35; addLog('수정 흡수: 각인석 +35','event'); }},
            { label:'불안정한 수정 흡수 (각인력 +1, 최대 생명 -10)',
              result:'neutral', text:'각인력 +1, 최대 생명 -10',
              action: p => {
                  p.power+=1;
                  p.maxHp=Math.max(10,p.maxHp-10);
                  p.hp=Math.min(p.hp,p.maxHp);
                  addLog('불안정 흡수: 각인력+1, 최대 생명-10','event');
              }},
            { label:'희귀 수정 강제 흡수 (각인석 +60, 오염패 2장)',
              result:'good', text:'각인석 +60 + 오염패 2장',
              action: p => {
                  p.gold+=60;
                  for(let i=0;i<2;i++){
                      let d=getRandomDebuffCard();
                      addExtraCard(d);
                      addLog(`오염: [${d.name}]`,'damage');
                  }
                  addLog('희귀 수정 흡수: 각인석 +60','event');
              }},
        ]
    },
    {
        icon:'⚠️', title:'함정 통로',
        desc:'바닥에 각인된 기묘한 문양. 함정입니다. 어떻게 통과하시겠습니까?',
        choices: [
            { label:'강행 돌파 (생명 -10)',
              result:'bad', text:'생명 -10',
              action: p => { p.hp=Math.max(1,p.hp-10); addLog('함정 발동: 생명 -10','damage'); }},
            { label:'결계로 차단 (결계 -15, 통과)',
              result:'neutral', text:'결계가 있으면 결계 소모, 없으면 생명 -5',
              action: p => {
                  if(p.def >= 15){ p.def-=15; addLog('결계로 함정 차단: 결계 -15','event'); }
                  else { p.hp=Math.max(1,p.hp-5); addLog('부분 차단: 생명 -5','damage'); }
              }},
            { label:'우회 (각인석 -15, 완전 통과)',
              result:'good', text:'각인석 -15, 피해 없음',
              action: p => {
                  p.gold=Math.max(0,p.gold-15);
                  addLog('우회: 각인석 -15, 안전 통과','event');
              }},
        ]
    },
    {
        icon:'🌌', title:'시간의 균열',
        desc:'과거와 현재가 겹쳐진 이상한 공간. 여기서 무엇이든 가능할 것 같습니다.',
        choices: [
            { label:'기억 복원 (무작위 각인패 2장 획득)',
              result:'good', text:'무작위 각인패 2장 (희귀 이상)',
              action: p => {
                  let pool=(REWARD_CARDS[gs.selectedChar]||[]).filter(c=>c.rarity!=='common');
                  if(!pool.length) pool=REWARD_CARDS[gs.selectedChar]||[];
                  for(let i=0;i<2;i++){
                      let c=pool[Math.floor(Math.random()*pool.length)];
                      if(c){ addExtraCard(c); addLog(`균열 기억: [${c.name}] 획득`,'event'); }
                  }
              }},
            { label:'시간 역행 (모든 오염패 제거, 생명 -30%)',
              result:'neutral', text:'오염패 전부 제거, 생명 -30%',
              action: p => {
                  let cost=Math.floor(p.maxHp*0.3);
                  p.hp=Math.max(1,p.hp-cost);
                  let names=p.ownedCards._extraNames||[];
                  let lib=getAllCardLibrary();
                  let before=names.length;
                  p.ownedCards._extraNames=names.filter(n=>{
                      let t=lib[n]; return !(t&&t.type==='curse');
                  });
                  let removed=before-p.ownedCards._extraNames.length;
                  addLog(`시간 역행: 오염패 ${removed}장 제거, 생명 -${cost}`,'event');
              }},
            { label:'그냥 지나침',
              result:'neutral', text:'아무 일 없음',
              action: () => {}},
        ]
    },
];


function showEvent() {
    let ev = EVENTS[Math.floor(Math.random() * EVENTS.length)];

    let choiceHtml = ev.choices.map((c, i) => `
        <button class="event-choice-btn result-${c.result}" data-ci="${i}">
            ${c.label}
        </button>
    `).join('');

    document.getElementById('eventContent').innerHTML = `
        <div class="event-card">
            <div class="event-icon-sym">✦</div>
            <div class="event-title">${ev.title}</div>
            <div class="event-desc">${ev.desc}</div>
            <div class="event-choices" id="eventChoices">${choiceHtml}</div>
            <div id="eventResultBox" class="event-result" style="display:none"></div>
            <button class="btn-event-continue" id="eventContinueBtn" style="display:none">계속 →</button>
        </div>
    `;

    document.querySelectorAll('.event-choice-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            let ci = Number(btn.dataset.ci);
            let choice = ev.choices[ci];
            choice.action(gs.player);
            updateHUD();

            document.getElementById('eventChoices').style.display = 'none';
            let rb = document.getElementById('eventResultBox');
            rb.className = `event-result ${choice.result}`;
            rb.textContent = choice.text;
            rb.style.display = '';
            document.getElementById('eventContinueBtn').style.display = '';

            document.getElementById('eventContinueBtn').addEventListener('click', () => {
                gs.mapPosition++;
                gs.inMap = true;
                showScreen('mapScreen');
                renderMap();
            });
        });
    });

    showScreen('eventScreen');
}

// ============================================================
// GAME OVER
// ============================================================
function showGameOver(won) {
    let content = document.getElementById('gameOverContent');

    if (won) {
        // 난이도 증가 + 강화석 지급
        let oldDiff = getDifficultyLevel();
        setDifficultyLevel(oldDiff + 1);
        let pointsEarned = 2 + gs.currentAct; // 막 진행에 따라 추가 포인트
        addUpgradePoints(pointsEarned);
        let totalPoints = getUpgradePoints();

        content.innerHTML = `
            <div class="gameover-win-wrap">
                <div class="win-emblem">⊗</div>
                <div class="gameover-title win">각인이 완성됐습니다</div>
                <div class="win-subtitle">공허의 핵이 봉인됐습니다</div>

                <div class="win-stats">
                    <div class="win-stat-row">
                        <span class="win-stat-label">각인자</span>
                        <span class="win-stat-val">${gs.player.name}</span>
                    </div>
                    <div class="win-stat-row">
                        <span class="win-stat-label">잔여 각인석</span>
                        <span class="win-stat-val">✦ ${gs.player.gold}</span>
                    </div>
                    <div class="win-stat-row">
                        <span class="win-stat-label">획득 유물</span>
                        <span class="win-stat-val">${gs.player.relics.length}개</span>
                    </div>
                    <div class="win-stat-row">
                        <span class="win-stat-label">잔여 생명</span>
                        <span class="win-stat-val">${gs.player.hp} / ${gs.player.maxHp}</span>
                    </div>
                </div>

                <div class="win-next-badge">
                    다음 여정 — 난이도 ${oldDiff + 1}
                    <span class="win-next-mult">수호자 +${Math.round(getDifficultyMult()*100-100)}%</span>
                </div>

                <div class="upgrade-earned-banner">
                    강화석 <b>+${pointsEarned}</b> 획득 &nbsp;·&nbsp; 총 보유 ${totalPoints}개
                </div>

                <div class="gameover-win-btns">
                    <button class="btn-ascend" id="openUpgradeBtn">✦ 각인 강화</button>
                    <button class="btn-restart" id="restartBtn">타이틀로</button>
                </div>
            </div>
        `;

        document.getElementById('restartBtn').addEventListener('click', () => { initUpgradeUI(); backToTitle(); });
        document.getElementById('openUpgradeBtn').addEventListener('click', showUpgradeShop);

    } else {
        // 패배 — 상황별 텍스트 생성
        let actName  = ACTS[gs.currentAct]?.name  || '여정';
        let stageName= ACTS[gs.currentAct]?.stageName || '';
        let charName = gs.player ? gs.player.name : '각인자';
        let enemyName= gs.enemy  ? gs.enemy.name  : '';
        let stage    = gs.currentStage || 1;
        let hpLeft   = gs.player ? Math.max(0, gs.player.hp) : 0;
        let relicCnt = gs.player ? gs.player.relics.length : 0;
        let goldLeft = gs.player ? gs.player.gold : 0;

        // 막·구역에 따른 세계관 사망 메시지
        const DEATH_LINES = [
            // 공통
            '각인의 빛이 꺼졌습니다. 하지만 계약은 아직 파기되지 않았습니다.',
            '공허가 당신을 삼켰습니다. 각인의 기억만이 남습니다.',
            '균열이 당신을 집어삼켰습니다. 이 세계는 아직 구원을 기다립니다.',
            '서약은 실패했습니다. 그러나 각인자는 다시 일어납니다.',
            '파기된 계약이 당신을 끌어당겼습니다. 다음 여정을 준비하세요.',
            '어둠이 각인을 덮었습니다. 하지만 불꽃은 꺼지지 않습니다.',
        ];
        const ENEMY_LINES = {
            // 보스
            '브리아르 군왕':   '가시숲의 왕이 계약지를 다시 지배합니다. 당신의 각인은 덩굴에 묻혔습니다.',
            '가시덤불 마녀':   '덩굴의 저주가 당신을 영원히 묶어두었습니다. 마녀의 웃음소리가 울립니다.',
            '모르가스 공':     '망령의 묘원에 또 하나의 영혼이 깃들었습니다. 당신은 이제 그의 군대입니다.',
            '뼈의 황제':       '황제의 뼈 왕국에 당신도 흡수됐습니다. 왕관이 더욱 빛납니다.',
            '바알-나크라스':   '공허의 핵이 완전히 깨어났습니다. 세계가 균열 속으로 무너집니다...',
            '공허의 포식자':   '포식자가 당신의 각인을 집어삼켰습니다. 공허만이 남았습니다.',
            '균열 드래곤':     '균열 드래곤의 포효가 세계를 가릅니다. 균열이 더 넓어졌습니다.',
            '폭염의 군주':     '불꽃이 각인을 완전히 태웠습니다. 재만이 남습니다.',
            // 엘리트
            '가시숲 군장':     '군장이 가시숲의 지배를 굳혔습니다. 더 강한 준비가 필요합니다.',
            '묘원의 재판관':   '재판관이 선고를 내렸습니다. 당신은 유죄입니다.',
            '폭염의 군주':     '군주의 불꽃이 길을 막았습니다.',
            // 일반
            '숲 그레믈린':     '첫 그레믈린에게 패배했습니다. 기초부터 다시 시작하세요.',
            '리치 수련생':     '수련생에게도 패배했습니다. 각인의 힘을 더 익히세요.',
        };

        let lore = ENEMY_LINES[enemyName]
            || DEATH_LINES[Math.floor(Math.random() * DEATH_LINES.length)];

        // 구역별 보조 텍스트
        let stageCtx = '';
        if (gs.currentAct === 0 && stage <= 3) {
            stageCtx = '초입에서 쓰러졌습니다. 가시 계약지의 그레믈린들이 비웃습니다.';
        } else if (gs.currentAct === 0) {
            stageCtx = '가시 계약지를 거의 벗어날 뻔했습니다.';
        } else if (gs.currentAct === 1 && stage <= 3) {
            stageCtx = '망령의 묘원 입구에서 쓰러졌습니다. 혼령들이 주위를 맴돕니다.';
        } else if (gs.currentAct === 1) {
            stageCtx = '망령의 묘원 깊은 곳에서 쓰러졌습니다.';
        } else if (gs.currentAct === 2) {
            stageCtx = '균열 심연에서 쓰러졌습니다. 공허의 핵이 점점 강해집니다.';
        }

        content.innerHTML = `
            <div class="gameover-lose-wrap">
                <div class="gameover-lose-emblem">💀</div>

                <div class="gameover-title lose">각인이 소멸했습니다</div>

                <div class="gameover-lose-context">
                    <span class="lose-act-badge">${actName} · 구역 ${stage}</span>
                    ${stageName ? `<span class="lose-stage-name">${stageName}</span>` : ''}
                </div>

                <div class="gameover-lose-lore">${lore}</div>

                ${stageCtx ? `<div class="gameover-lose-stage-ctx">${stageCtx}</div>` : ''}

                <div class="gameover-lose-stats">
                    <div class="lose-stat-row">
                        <span class="lose-stat-label">각인자</span>
                        <span class="lose-stat-val">${charName}</span>
                    </div>
                    ${enemyName ? `
                    <div class="lose-stat-row">
                        <span class="lose-stat-label">쓰러뜨린 적</span>
                        <span class="lose-stat-val enemy-name">${enemyName}</span>
                    </div>` : ''}
                    <div class="lose-stat-row">
                        <span class="lose-stat-label">남은 생명</span>
                        <span class="lose-stat-val">${hpLeft} / ${gs.player?.maxHp || '?'}</span>
                    </div>
                    <div class="lose-stat-row">
                        <span class="lose-stat-label">보유 각인석</span>
                        <span class="lose-stat-val">✦ ${goldLeft}</span>
                    </div>
                    <div class="lose-stat-row">
                        <span class="lose-stat-label">유물</span>
                        <span class="lose-stat-val">${relicCnt}개</span>
                    </div>
                </div>

                <div class="gameover-lose-hint">
                    각인의 서를 강화하고 다시 도전하세요.
                </div>

                <div class="gameover-lose-btns">
                    <button class="btn-ascend" id="openUpgradeBtn2">✦ 각인 강화</button>
                    <button class="btn-restart" id="restartBtn">다시 도전</button>
                </div>

                <div class="lose-upgrade-pts">
                    강화석 보유: <b>${getUpgradePoints()}</b>개
                </div>
            </div>
        `;
        document.getElementById('restartBtn').addEventListener('click', () => { initUpgradeUI(); backToTitle(); });
        document.getElementById('openUpgradeBtn2').addEventListener('click', showUpgradeShop);
    }

    showScreen('gameOverScreen');
}

// ── 업그레이드 상점 ──
function showUpgradeShop() {
    let content = document.getElementById('gameOverContent');
    let upgs    = getPermUpgrades();
    let points  = getUpgradePoints();

    let rows = PERM_UPGRADES.map(u => {
        let lv      = upgs[u.id] || 0;
        let maxed   = lv >= u.max;
        let canBuy  = points >= u.cost && !maxed;
        let pips    = Array.from({length: u.max}, (_,i) =>
            `<span class="perm-pip ${i < lv ? 'on' : ''}"></span>`
        ).join('');

        return `
        <div class="perm-upg-row ${maxed ? 'maxed' : ''}" data-id="${u.id}">
            <div class="perm-upg-icon">${u.icon}</div>
            <div class="perm-upg-body">
                <div class="perm-upg-name">${u.name}</div>
                <div class="perm-upg-desc">${u.desc}</div>
                <div class="perm-upg-lvrow">
                    <div class="perm-upg-pips">${pips}</div>
                    <span class="perm-upg-lv">Lv ${lv}/${u.max}</span>
                </div>
            </div>
            <div class="perm-upg-action">
                ${maxed
                    ? `<span class="perm-upg-max">MAX</span>`
                    : `<button class="perm-upg-btn ${canBuy ? '' : 'locked'}"
                           data-id="${u.id}" data-cost="${u.cost}">
                           각성<br><span class="perm-upg-cost">✦${u.cost}</span>
                       </button>`
                }
            </div>
        </div>`;
    }).join('');

    content.innerHTML = `
        <div class="perm-shop-wrap">
            <div class="perm-shop-header">
                <div class="perm-shop-title">
                    <span class="perm-shop-emblem">⊗</span>
                    각인 영구 강화
                </div>
                <div class="perm-shop-pts">
                    <span class="perm-pts-label">강화석</span>
                    <span class="perm-pts-val" id="permPtsVal">${points}</span>
                </div>
            </div>
            <div class="perm-shop-desc-banner">
                클리어할 때마다 강화석을 획득합니다.<br>
                영구 강화는 모든 여정에 적용됩니다.
            </div>
            <div class="perm-upg-list" id="permUpgList">${rows}</div>
            <button class="btn-restart perm-back-btn" id="upgradeBackBtn">← 타이틀로</button>
        </div>
    `;

    document.getElementById('upgradeBackBtn').addEventListener('click', () => {
        initUpgradeUI();
        backToTitle();
    });

    document.querySelectorAll('.perm-upg-btn:not(.locked)').forEach(btn => {
        btn.addEventListener('click', () => {
            let id   = btn.dataset.id;
            let cost = Number(btn.dataset.cost);
            if (!spendUpgradePoint(cost)) return;
            let cur = getPermUpgrades();
            cur[id] = (cur[id] || 0) + 1;
            savePermUpgrades(cur);
            let upgName = PERM_UPGRADES.find(u => u.id === id)?.name || id;
            addLog(`✦ [${upgName}] 영구 각성!`, 'event');
            showUpgradeShop();
        });
    });
}

// showGameOver 마지막 호출 상태 저장
let _origShowGameOver = showGameOver;
showGameOver = function(won) {
    showGameOver._lastWon = won;
    _origShowGameOver(won);
};

// ============================================================
// HUD UPDATE
// ============================================================
function updateHUD() {
    let p = gs.player;
    if (!p) return;

    // 플레이어
    document.getElementById('combatPlayerName').textContent = p.name;
    document.getElementById('playerHp').textContent    = Math.max(0, p.hp);
    document.getElementById('playerMaxHp').textContent = p.maxHp;
    document.getElementById('playerDef').textContent   = p.def;
    document.getElementById('playerPower').textContent = p.power;
    document.getElementById('combatGold').textContent  = p.gold;
    setHpBar('playerHpBar', Math.max(0, p.hp / p.maxHp), true);

    // 다중 적 렌더링
    renderEnemies();

    // 막 배너
    let act = ACTS[gs.currentAct];
    if (act) {
        let actLabelEl = document.getElementById('actLabel');
        let actStageEl = document.getElementById('actStageName');
        if (actLabelEl) actLabelEl.textContent = act.name;
        if (actStageEl) actStageEl.textContent = act.stageName.split('·')[0].trim();
    }

    renderEnergyGems();
    document.getElementById('deckCount').textContent    = gs.deck.length;
    document.getElementById('discardCount').textContent = gs.discardPile.length;
    document.getElementById('turnNum').textContent      = gs.turn;
    document.getElementById('stageNum').textContent     = gs.currentStage;
    updateIntentDisplay();
}

function renderEnemies() {
    let enemiesArea = document.getElementById('enemiesArea');
    if (!enemiesArea) return;
    let enemies = gs.enemies && gs.enemies.length > 0 ? gs.enemies : (gs.enemy ? [gs.enemy] : []);
    if (!enemies.length) return;

    enemiesArea.innerHTML = '';

    enemies.forEach((e, idx) => {
        let isTarget = idx === gs.targetIdx;
        let isDead   = e.hp <= 0;
        let pct      = Math.max(0, Math.min(1, e.hp / (e.startHp || e.hp)));

        // SVG
        let svgStr = '';
        if (e.svgKey && typeof getMonsterSVG !== 'undefined') {
            svgStr = getMonsterSVG(e.svgKey, 4) || '';
        }
        let iconHtml = svgStr
            ? `<div class="enemy-svg-wrap">${svgStr}</div>`
            : `<span class="sts-enemy-emoji">${e.icon || '👾'}</span>`;

        // HP 바 채우기 색상
        let fillClass = pct <= 0.25 ? 'cb-hp-fill enemy-fill low'
                      : pct <= 0.5  ? 'cb-hp-fill enemy-fill mid'
                      : 'cb-hp-fill enemy-fill';

        let card = document.createElement('div');
        card.className = `enemy-slot ${isTarget ? 'target' : ''} ${isDead ? 'dead' : ''}`;
        card.dataset.idx = idx;
        card.innerHTML = `
            <div class="enemy-slot-sprite">${iconHtml}</div>
            <div class="enemy-slot-hud">
                <div class="cb-char-name enemy-name-col">${e.name}</div>
                <div class="cb-hp-bar-wrap">
                    <div class="cb-hp-bar enemy-bar">
                        <div class="${fillClass}" style="width:${(pct*100).toFixed(1)}%"></div>
                    </div>
                    <div class="cb-hp-text">
                        <span>${Math.max(0,e.hp)}</span>
                        <span class="cb-hp-sep">/</span>
                        <span>${e.startHp||e.hp}</span>
                    </div>
                </div>
                <div class="cb-enemy-stats">
                    <span class="cb-stat-pill blue">◼ <b>${e.def}</b></span>
                    <span class="cb-stat-pill red">⚡ <b>${e.power||1}</b></span>
                </div>
            </div>
            ${isTarget ? '<div class="enemy-target-arrow">▼</div>' : ''}
        `;

        // 클릭으로 타겟 변경
        if (!isDead) {
            card.addEventListener('click', () => {
                gs.targetIdx = idx;
                gs.enemy = gs.enemies[idx];
                renderEnemies();
                updateIntentDisplay();
            });
        }
        enemiesArea.appendChild(card);
    });
}

// applyDamage에서 현재 타겟 적에게 피해 주도록 gs.enemy가 항상 최신 타겟을 가리키게 유지
function getTargetEnemy() {
    if (gs.enemies && gs.enemies.length > 0) {
        return gs.enemies[gs.targetIdx] || gs.enemies.find(e => e.hp > 0);
    }
    return gs.enemy;
}

function setHpBar(id, pct, isPlayer) {
    // wrapper bar
    let bar = document.getElementById(id);
    if (!bar) return;
    // fill child — 새 HTML 구조의 sibling fill ID 사용
    let fillId = id.replace('HpBar', 'HpFill');
    let fill = document.getElementById(fillId);
    if (!fill) {
        // 구 방식 폴백
        fill = bar.querySelector('.cb-hp-fill') || bar.querySelector('.arena-hp-bar-fill');
    }
    if (!fill) return;
    let pctNum = Math.max(0, Math.min(1, pct));
    fill.style.width = (pctNum * 100).toFixed(1) + '%';
    fill.classList.remove('low','mid');
    if (pctNum <= 0.25) fill.classList.add('low');
    else if (pctNum <= 0.5) fill.classList.add('mid');
}

// 하위 호환성 유지 (hp-ring 없어도 오류 없도록)
function setHpRing(id, pct, isPlayer) {
    // no-op: HP 링 → HP 바 방식으로 전환됨
}

function renderEnergyGems() {
    let container = document.getElementById('energyGems');
    if (!container) return;
    container.innerHTML = '';
    container.className = 'sts-energy-gems';
    let displayMax = Math.max(gs.maxEnergy, gs.energy);
    for (let i = 0; i < displayMax; i++) {
        let gem = document.createElement('div');
        let isOver = i >= gs.maxEnergy;
        gem.className = `energy-gem ${i < gs.energy ? (isOver ? 'overflow' : 'full') : 'empty'}`;
        if (isOver) gem.title = '수정 초과';
        container.appendChild(gem);
    }
    let label = document.getElementById('energyLabel');
    if (label) label.textContent = `${gs.energy}/${gs.maxEnergy}`;
}

// 카드 이름 → 서브타입 분류
let ENERGY_CARD_NAMES = new Set([
    '투지','마나 급류','야생의 숨결',
    '전장의 고동','에테르 흐름','바람의 숨결',
    '성전의 기도','아케인 흐름','바람과 함께','무한 마나',
]);
let POWER_CARD_NAMES = new Set([
    '투혼','집중','사냥 본능',
    '전사의 각성','마지막 결의','마나 폭주','표범의 기운',
    '성스러운 분노','마력 과부하','사냥꾼의 리듬','자연의 힘',
    '신앙의 불꽃','정밀 사격',
]);
function getCardSubtype(name) {
    if (ENERGY_CARD_NAMES.has(name)) return 'energy';
    if (POWER_CARD_NAMES.has(name)) return 'power';
    return '';
}

function renderHand() {
    let area = document.getElementById('handArea');
    if (!area) return;
    area.innerHTML = '';
    area.className = 'sts-hand-area';

    let n = gs.hand.length;
    let maxSpread = 18;

    gs.hand.forEach((card, i) => {
        let cd = (gs.player.cooldowns[card.name] || 0);
        let cantAfford = card.cost > gs.energy;
        let onCD = cd > 0;
        let upgLv = (gs.player.cardUpgrades[card.name] || 0);
        let upgMax = CARD_UPGRADES[card.name] ? CARD_UPGRADES[card.name].maxLv : 0;

        let subtype = getCardSubtype(card.name);
        let rarity = card.rarity || 'common';

        let t = n <= 1 ? 0 : (i / (n - 1)) - 0.5;
        let angle = t * maxSpread;
        let yOffset = Math.abs(t) * 18;

        let div = document.createElement('div');
        div.className = `card ${card.type}${onCD ? ' on-cooldown' : ''}${cantAfford ? ' cant-afford' : ''}${upgLv > 0 ? ' upgraded' : ''}`;
        if (subtype) div.dataset.subtype = subtype;
        div.dataset.rarity = rarity;
        div.style.cssText = `transform: rotate(${angle}deg) translateY(${yOffset}px); z-index: ${i + 1};`;

        let liveDesc = card.description;
        if (subtype === 'energy' && upgLv > 0) liveDesc += ` (+${upgLv} 각성)`;
        if (subtype === 'power'  && upgLv > 0) liveDesc += ` (+${upgLv} 각성)`;

        let iconSVG = getCardIconSVG(card);
        let typeColor = { attack:'var(--attack-color)', defend:'var(--defend-color)',
                          heal:'var(--heal-color)', skill:'var(--skill-color)', curse:'var(--curse-color)' }[card.type] || '#888';

        div.innerHTML = `
            <div class="card-cost-badge">${card.cost}</div>
            ${upgLv > 0 ? `<div class="card-upgrade-badge">+${upgLv}</div>` : ''}
            <div class="card-svg-icon" style="color:${typeColor}">${iconSVG}</div>
            <div class="card-name">${card.name}</div>
            <div class="card-desc">${liveDesc}</div>
            ${upgLv > 0 && upgMax > 0 ? `<div class="card-upg-pips">${Array.from({length:upgMax},(_,k)=>`<span class="upg-pip ${k<upgLv?'on':''}"></span>`).join('')}</div>` : ''}
            ${onCD ? `<div class="card-cd">대기: ${cd}흐름</div>` : ''}
        `;
        // 클릭만으로 사용 (드래그 없음)
        div.addEventListener('click', () => {
            if (!gs.gameOver && !gs.inMap) useCard(i);
        });
        // 드로우 애니메이션
        div.style.animationDelay = `${i * 0.05}s`;
        div.classList.add('card-deal');
        area.appendChild(div);
    });
}

function renderRelics() {
    let container = document.getElementById('relicsMini');
    if (!container) return;
    container.innerHTML = '';
    gs.player.relics.forEach(r => {
        let data = RELIC_DATA[r];
        let dot = document.createElement('div');
        dot.className = 'relic-dot';
        let rar = data ? (data.rarity || 'common') : 'common';
        let rarColor = {special:'#e040fb',legendary:'#ffd54f',rare:'#4fc3f7',common:'#a0a0b8'}[rar];
        dot.style.setProperty('--rc', rarColor);
        dot.innerHTML = `<span class="relic-dot-svg" style="color:${rarColor}">${getRelicIconSVG(r, rar)}</span>`;

        // JS 기반 스마트 툴팁 (화면 이탈 방지)
        let tipEl = null;
        dot.addEventListener('mouseenter', () => {
            if (tipEl) tipEl.remove();
            tipEl = document.createElement('div');
            tipEl.className = 'relic-tooltip-popup';
            tipEl.innerHTML = `
                <div class="relic-tooltip-name">${r}</div>
                <div class="relic-tooltip-desc">${data ? data.desc : '알 수 없음'}</div>
            `;
            document.body.appendChild(tipEl);
            positionTooltip(dot, tipEl);
        });
        dot.addEventListener('mouseleave', () => {
            if (tipEl) { tipEl.remove(); tipEl = null; }
        });

        container.appendChild(dot);
    });
}

function positionTooltip(anchor, tip) {
    let GAP = 8;
    let MARGIN = 8; // 화면 가장자리 여백

    // 일단 body에 붙여서 실제 크기 측정
    tip.style.visibility = 'hidden';
    tip.style.position = 'fixed';
    tip.style.top = '0';
    tip.style.left = '0';

    let anchorRect = anchor.getBoundingClientRect();
    let tipW = tip.offsetWidth || 200;
    let tipH = tip.offsetHeight || 60;
    let vw = window.innerWidth;
    let vh = window.innerHeight;

    // 기본: 위쪽에 표시
    let top = anchorRect.top - tipH - GAP;
    let left = anchorRect.left + anchorRect.width / 2 - tipW / 2;

    // 위쪽 공간 부족 → 아래쪽으로
    if (top < MARGIN) {
        top = anchorRect.bottom + GAP;
    }

    // 오른쪽 이탈 방지
    if (left + tipW > vw - MARGIN) {
        left = vw - MARGIN - tipW;
    }
    // 왼쪽 이탈 방지
    if (left < MARGIN) {
        left = MARGIN;
    }
    // 아래쪽 이탈 방지
    if (top + tipH > vh - MARGIN) {
        top = anchorRect.top - tipH - GAP;
    }

    tip.style.top = `${top}px`;
    tip.style.left = `${left}px`;
    tip.style.visibility = 'visible';
}

function updateEnemyStatus() {
    // 다중 적: renderEnemies()가 슬롯을 그리므로 여기서 재렌더
    renderEnemies();
}

function updatePlayerStatus() {
    // 플레이어 부식 태그를 relicsMini 옆에 표시
    let pStatusEl = document.getElementById('playerStatusTags');
    if (!pStatusEl) {
        pStatusEl = document.createElement('div');
        pStatusEl.id = 'playerStatusTags';
        pStatusEl.className = 'status-tags';
        pStatusEl.style.cssText = 'margin-top:3px;justify-content:flex-start;';
        let relicEl = document.getElementById('relicsMini');
        if (relicEl && relicEl.parentNode) relicEl.parentNode.insertBefore(pStatusEl, relicEl.nextSibling);
    }
    pStatusEl.innerHTML = '';
    if (gs.player && gs.player.poison > 0) {
        let tag = document.createElement('div');
        tag.className = 'status-tag poison';
        tag.textContent = `◈ 부식 ×${gs.player.poison}`;
        pStatusEl.appendChild(tag);
    }
}

// ============================================================
// SCREEN TRANSITIONS
// ============================================================
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    // 음악 테마 전환
    if (id === 'titleScreen')   setMusicTheme('title');
    else if (id === 'combatScreen') setMusicTheme('battle');
    else setMusicTheme('map');
}

// ============================================================
// DRAG & DROP on combat drop zones
// ============================================================
function initDropZones() {
    // 드래그 기능 제거 — 클릭만으로 카드 사용
}

// ============================================================
// TITLE / NEW GAME
// ============================================================
function backToTitle() {
    stopAutoSequence();
    gs.gameOver   = false;
    gs.inMap      = true;
    gs.player     = null;
    gs.enemy      = null;
    gs.enemies    = [];
    gs.targetIdx  = 0;
    gs.deck       = [];
    gs.hand       = [];
    gs.discardPile = [];
    gs.mapRows    = [];
    gs.mapPosition  = 0;
    gs.mapChosenCol = null;
    gs.selectedBoss = null;
    gs.turn     = 1;
    gs.energy   = 3;
    gs.maxEnergy = 3;
    showScreen('titleScreen');
    initUpgradeUI();
}

function startGame() {
    gs.gameOver = false;
    gs.inMap = true;
    gs.turn = 1;
    gs.mapPosition = 0;
    gs.currentAct = 0;
    gs.maxEnergy = 3;
    gs.selectedBoss = null;

    // 영구 각성: 최대 에너지
    let upgs = getPermUpgrades();
    if ((upgs.startEnergy || 0) >= 1) gs.maxEnergy += upgs.startEnergy;

    gs.energy = gs.maxEnergy;
    gs.deck = []; gs.hand = []; gs.discardPile = [];

    let tpl = deepClone(PLAYER_TEMPLATES[gs.selectedChar]);
    gs.player = tpl;
    gs.player.ownedCards = { _extraNames: [] };
    gs.player.cardUpgrades = {};
    gs.player.cooldowns = {};
    gs.player.relics = [];

    addRelic(STARTING_RELICS[gs.selectedChar]);

    // 영구 각성 효과 적용
    applyPermUpgrades(gs.player);

    // 캐릭터별 누적 제약 패널티
    applyCharPenalties(gs.player, gs.selectedChar, getDifficultyLevel());

    // 추가 유물 업그레이드
    if ((upgs.startRelic || 0) > 0) {
        for (let i = 0; i < upgs.startRelic; i++) {
            let avail = Object.keys(RELIC_DATA).filter(r => !gs.player.relics.includes(r));
            if (avail.length) addRelic(avail[Math.floor(Math.random()*avail.length)]);
        }
    }

    loadAct(0);
    generateMap();
    showScreen('mapScreen');
    renderMap();

    let diffLv = getDifficultyLevel();
    let diffMsg = diffLv > 0 ? ` [난이도 ${diffLv} — 적 강화 ${Math.round(getDifficultyMult()*100-100)}%]` : '';
    addLog(`◈ ${gs.player.name}의 각인의 여정이 시작됩니다!${diffMsg}`, 'event');
}

function loadAct(actIdx) {
    gs.currentAct = actIdx;
    let act = ACTS[actIdx];
    if (!act) return;

    // 일반 몬스터 + 무작위 보스 1개 선택
    let selectedBoss = null;
    if (act.bosses && act.bosses.length > 0) {
        selectedBoss = deepClone(act.bosses[Math.floor(Math.random() * act.bosses.length)]);
        gs.selectedBoss = selectedBoss; // 막 내내 같은 보스 유지
    }

    gs.monsterPool = deepClone(act.monsters);
    if (selectedBoss) gs.monsterPool.push(selectedBoss);

    gs.maxStage = gs.monsterPool.length;

    // 지도 화면 상단 막 이름 업데이트
    let header = document.querySelector('#mapScreen .screen-title');
    if (header) header.textContent = `◈ ${act.name} · ${act.stageName}`;

    // 보스 이름 예고 (로그)
    if (selectedBoss) {
        addLog(`◈ 이번 장의 각인 군주: ${selectedBoss.name}`, 'event');
    }
}

// ============================================================
// TITLE UI BINDINGS
// ============================================================
document.querySelectorAll('.char-card').forEach(el => {
    el.addEventListener('click', () => {
        document.querySelectorAll('.char-card').forEach(c => c.classList.remove('active'));
        el.classList.add('active');
        gs.selectedChar = el.dataset.key;
        // 캐릭터 바꾸면 난이도를 해당 캐릭터 기본값(0)으로 리셋
        gs._selectedDifficulty = 0;
        initUpgradeUI();
    });
});

document.getElementById('startBtn').addEventListener('click', startGame);

// Codex
document.getElementById('codexBtn').addEventListener('click', openCodex);
document.getElementById('codexClose').addEventListener('click', closeCodex);
document.querySelectorAll('.codex-tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.codex-tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        renderCodex(tab.dataset.ctab, null);
    });
});

// Shop back
document.getElementById('shopBackBtn').addEventListener('click', () => {
    gs.mapPosition++;
    gs.inMap = true;
    showScreen('mapScreen');
    renderMap();
});

// Event back (handled inside showEvent, but backup)
document.getElementById('eventBackBtn').addEventListener('click', () => {
    gs.mapPosition++;
    gs.inMap = true;
    showScreen('mapScreen');
    renderMap();
});

// Combat controls
document.getElementById('endTurnBtn').addEventListener('click', () => {
    if (!gs.gameOver && !gs.inMap) endTurn();
});

document.getElementById('autoToggle').addEventListener('change', e => {
    gs.autoMode = e.target.checked;
    if (gs.autoMode && !gs.inMap && !gs.gameOver) startAutoSequence();
    else stopAutoSequence();
});

document.getElementById('speedSlider').addEventListener('input', e => {
    gs.autoSpeed = Number(e.target.value);
    if (gs.autoMode && !gs.inMap && !gs.gameOver) startAutoSequence();
});

// Deck / Discard viewer buttons
document.getElementById('deckViewBtn').addEventListener('click', () => {
    showCardListModal('◈ 각인패 더미', gs.deck || []);
});
document.getElementById('discardViewBtn').addEventListener('click', () => {
    showCardListModal('✦ 소진된 각인패', gs.discardPile || []);
});

// ============================================================
// PARTICLE EFFECTS on title
// ============================================================
(function initParticles() {
    let container = document.getElementById('titleParticles');
    if (!container) return;
    for (let i = 0; i < 30; i++) {
        let p = document.createElement('div');
        p.className = 'particle';
        p.style.left = Math.random() * 100 + '%';
        p.style.animationDuration = (5 + Math.random() * 10) + 's';
        p.style.animationDelay = (Math.random() * 8) + 's';
        p.style.width = p.style.height = (Math.random() < 0.5 ? 2 : 3) + 'px';
        container.appendChild(p);
    }
})();

// ============================================================
// CHARACTER SVG INJECTION
// ============================================================
function injectCharacterSVGs() {
    let SVG_MAKERS = {
        paladin: typeof makePaladinSVG !== 'undefined' ? makePaladinSVG : null,
        mage:    typeof makeMageSVG    !== 'undefined' ? makeMageSVG    : null,
        ranger:  typeof makeRangerSVG  !== 'undefined' ? makeRangerSVG  : null,
    };

    // 타이틀 캐릭터 선택 카드
    ['paladin','mage','ranger'].forEach(key => {
        let el = document.getElementById('charIcon' + key.charAt(0).toUpperCase() + key.slice(1));
        if (el && SVG_MAKERS[key]) {
            el.innerHTML = SVG_MAKERS[key](4);
        }
    });
}

function updateCombatCharIcon(charKey) {
    let SVG_MAKERS = {
        paladin: typeof makePaladinSVG !== 'undefined' ? makePaladinSVG : null,
        mage:    typeof makeMageSVG    !== 'undefined' ? makeMageSVG    : null,
        ranger:  typeof makeRangerSVG  !== 'undefined' ? makeRangerSVG  : null,
    };
    let el = document.getElementById('combatPlayerIcon');
    if (el && SVG_MAKERS[charKey]) {
        el.innerHTML = SVG_MAKERS[charKey](5);
    }
}

// ============================================================
// DECK / DISCARD VIEWER MODAL
// ============================================================
function showCardListModal(title, cards) {
    let existing = document.getElementById('cardListModal');
    if (existing) existing.remove();

    let typeColor = { attack:'#c0392b', defend:'#2980b9', heal:'#27ae60', skill:'#8e44ad', curse:'#555' };

    let overlay = document.createElement('div');
    overlay.id = 'cardListModal';
    overlay.style.cssText = `
        position:fixed; inset:0; z-index:9999;
        display:flex; align-items:center; justify-content:center;
        background:rgba(0,0,0,0.75); backdrop-filter:blur(4px);
        animation:fadeIn 0.15s ease;
    `;

    let sorted = [...cards].sort((a,b) => a.name.localeCompare(b.name));
    let cardItems = sorted.map(c => {
        let col = typeColor[c.type] || '#666';
        let upgLv = (gs.player && gs.player.cardUpgrades[c.name]) || 0;
        return `
            <div style="
                display:flex; align-items:center; gap:10px;
                padding:8px 12px;
                background:#16161f; border:1px solid #2a2a3a;
                border-left:3px solid ${col};
                border-radius:8px;
            ">
                <span style="font-size:20px;">${c.icon}</span>
                <div style="flex:1;">
                    <div style="font-family:'Cinzel',serif;font-size:12px;color:#f0d070;font-weight:700;">
                        ${c.name}${upgLv > 0 ? ` <span style="color:#c9a84c;font-size:10px;">+${upgLv}</span>` : ''}
                    </div>
                    <div style="font-size:11px;color:#7a7570;">${c.description}</div>
                </div>
                <div style="
                    width:22px;height:22px;border-radius:50%;
                    background:#7c4dff;border:1px solid #b388ff;
                    display:flex;align-items:center;justify-content:center;
                    font-size:11px;font-weight:700;color:#fff;flex-shrink:0;
                ">${c.cost}</div>
            </div>
        `;
    }).join('');

    overlay.innerHTML = `
        <div style="
            background:#111118; border:1px solid #2a2a3a;
            border-radius:16px; padding:0; max-width:420px; width:92%;
            max-height:80vh; display:flex; flex-direction:column;
            box-shadow:0 8px 40px rgba(0,0,0,0.8);
            overflow:hidden;
        ">
            <div style="
                padding:14px 20px; border-bottom:1px solid #2a2a3a;
                display:flex; justify-content:space-between; align-items:center;
                background:#0d0d18;
            ">
                <div style="font-family:'Cinzel',serif;font-size:14px;color:#c9a84c;font-weight:700;">
                    ${title} <span style="font-size:12px;color:#7a7570;">(${cards.length}장)</span>
                </div>
                <button id="cardModalClose" style="
                    background:none;border:none;color:#7a7570;
                    font-size:20px;cursor:pointer;line-height:1;padding:0;
                ">✕</button>
            </div>
            <div style="
                overflow-y:auto; padding:12px 16px;
                display:flex; flex-direction:column; gap:6px;
            ">
                ${cards.length === 0
                    ? '<div style="text-align:center;color:#555;padding:20px;">비어 있음</div>'
                    : cardItems
                }
            </div>
        </div>
    `;

    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove(); });
    overlay.querySelector('#cardModalClose').addEventListener('click', () => overlay.remove());
    document.body.appendChild(overlay);
}

// ============================================================
// ASCENSION TITLE UI
// ============================================================
function initDiffSelectUI() {
    let charKey = gs.selectedChar || 'paladin';
    let maxDiff = getCharDifficulty(charKey);         // 현재 최대 해금 난이도
    let curDiff = gs._selectedDifficulty ?? 0;        // 현재 선택한 난이도

    let row = document.getElementById('diffSelectRow');
    let penEl = document.getElementById('diffPenaltyDisplay');
    if (!row) return;

    // 난이도 0 ~ min(maxDiff+1, 5) 표시 (다음 잠금 단계 미리 보여줌)
    let showMax = Math.min(maxDiff + 1, 5);
    let levels = [];
    for (let i = 0; i <= showMax; i++) levels.push(i);

    row.innerHTML = levels.map(lv => {
        let isLocked = lv > maxDiff;
        let isActive = lv === curDiff;
        let mult = lv === 0 ? 0 : Math.round(Math.min(lv * 0.05, 0.5) * 100);
        let label = lv === 0 ? '일반' : `난이도 ${lv}`;
        let sub   = lv === 0 ? '기본 여정' : `적 +${mult}%`;
        return `
        <div class="diff-btn ${isActive ? 'active' : ''} ${isLocked ? 'locked' : ''}"
             data-lv="${lv}" title="${isLocked ? '클리어 후 해금' : ''}">
            <span class="diff-btn-label">${label}</span>
            <span class="diff-btn-sub">${isLocked ? '🔒' : sub}</span>
        </div>`;
    }).join('');

    // 패널티 표시
    if (penEl) {
        let penalties = CHAR_PENALTIES[charKey]?.filter(p => p.lv <= curDiff) || [];
        if (penalties.length === 0 || curDiff === 0) {
            penEl.innerHTML = curDiff === 0
                ? '<span class="diff-pen-none">패널티 없음</span>'
                : '';
        } else {
            penEl.innerHTML = penalties.map(p =>
                `<span class="diff-penalty">${p.desc}</span>`
            ).join('');
        }
    }

    // 클릭 바인딩
    row.querySelectorAll('.diff-btn:not(.locked)').forEach(btn => {
        btn.addEventListener('click', () => {
            gs._selectedDifficulty = Number(btn.dataset.lv);
            initDiffSelectUI();  // re-render
        });
    });
}

function initUpgradeUI() {
    let points = getUpgradePoints();
    let valEl  = document.getElementById('upgradePointsVal');
    if (valEl) valEl.textContent = points;

    // 난이도 선택 UI 렌더링
    initDiffSelectUI();

    // 기존 difficultyDisplay (hidden) — 호환용
    let diffEl = document.getElementById('difficultyDisplay');
    if (diffEl) {
        let charKey = gs.selectedChar || 'paladin';
        let rows = [
            { key:'paladin', label:'서약기사', lv: getCharDifficulty('paladin') },
            { key:'mage',    label:'균열술사', lv: getCharDifficulty('mage')    },
            { key:'ranger',  label:'추적자',   lv: getCharDifficulty('ranger')  },
        ];
        let hasAny = rows.some(r => r.lv > 0);
        if (!hasAny) {
            diffEl.innerHTML = '';
        } else {
            let html = '<div class="char-diff-rows">';
            rows.forEach(r => {
                let mult = Math.round((1 + Math.min(r.lv*0.05, 0.5))*100 - 100);
                let penalties = r.lv > 0 ? (CHAR_PENALTIES[r.key]||[]).filter(p=>p.lv<=r.lv) : [];
                html += `
                    <div class="char-diff-row ${r.key===charKey?'active-char':''}">
                        <span class="char-diff-label">${r.label}</span>
                        <span class="diff-lv-badge">난이도 ${r.lv}</span>
                        ${r.lv>0?`<span class="diff-stat">적 +${mult}%</span>`:'<span class="diff-stat dim">첫 클리어 전</span>'}
                    </div>
                    ${penalties.length ? `<div class="diff-penalties">${penalties.map(p=>`<span class="diff-penalty">${p.desc}</span>`).join('')}</div>` : ''}
                `;
            });
            html += '</div>';
            diffEl.innerHTML = html;
        }
    }

    let shopBtn = document.getElementById('upgradeShopBtn');
    if (shopBtn) {
        shopBtn.onclick = () => {
            showUpgradeShop();
            showScreen('gameOverScreen');
        };
    }
}

// ============================================================
// CARD & RELIC SVG ICON SYSTEM
// ============================================================

// 카드 타입별 SVG 심볼
const CARD_TYPE_SVG = {
    attack: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M14.5 2.5L21 9 9 21 3 15l12-12.5z"/>
        <line x1="7" y1="17" x2="3" y2="21"/>
        <path d="M17 3l4 4-2 2-4-4 2-2z" fill="currentColor"/>
    </svg>`,
    defend: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 2L3 7v6c0 5 4 9 9 11 5-2 9-6 9-11V7L12 2z"/>
    </svg>`,
    heal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/>
    </svg>`,
    skill: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
    </svg>`,
    curse: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="12" y1="8" x2="12" y2="12"/>
        <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>`,
};

// 카드별 개별 SVG 아이콘 (이름으로 매핑)
const CARD_ICON_SVG = {
    // ─ 서약기사
    '서약의 칼':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2.5L21 9 9 21 3 15l12-12.5z"/><line x1="7" y1="17" x2="3" y2="21"/></svg>`,
    '결계 방어':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v6c0 5 4 9 9 11 5-2 9-6 9-11V7L12 2z"/></svg>`,
    '생명 각인':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    '파쇄 일격':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M3 3l18 18M21 3L3 21"/></svg>`,
    '서약 분쇄':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    '전사의 각성':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    // ─ 균열술사
    '균열 불꽃':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    '마력 결계':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v6c0 5 4 9 9 11 5-2 9-6 9-11V7L12 2z"/><path d="M12 8v8M8 12h8"/></svg>`,
    '아케인 폭발':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></svg>`,
    '공간 균열':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/><line x1="4" y1="4" x2="20" y2="20"/></svg>`,
    '붕괴 운석':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="13" cy="11" r="4"/><path d="M13 11l-9 9"/><path d="M10 7l-3-5M14 6l1-4M17 9l5-2"/></svg>`,
    // ─ 추적자
    '추적 화살':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>`,
    '잔상 회피':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 8l4 4-4 4M7 8l-4 4 4 4M3 12h18"/><path opacity=".4" d="M3 8h4M3 16h4M17 8h4M17 16h4"/></svg>`,
    '정밀 저격':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="22" y1="12" x2="18" y2="12"/><line x1="6" y1="12" x2="2" y2="12"/><line x1="12" y1="6" x2="12" y2="2"/><line x1="12" y1="22" x2="12" y2="18"/></svg>`,
    '부식 화살':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/><circle cx="5" cy="12" r="2" fill="currentColor"/></svg>`,
    '연속 사격':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="3" y1="8" x2="17" y2="8"/><polyline points="11 3 17 8 11 13"/><line x1="3" y1="16" x2="17" y2="16"/><polyline points="11 11 17 16 11 21"/></svg>`,
};

// 유물 희귀도별 SVG 심볼
const RELIC_RARITY_SVG = {
    special:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="currentColor" opacity=".3"/><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>`,
    legendary: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    rare:      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    common:    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 3"/></svg>`,
};

// 유물 이름→SVG 매핑 (개성있는 아이콘)
const RELIC_ICON_SVG = {
    '서약의 심장':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v6c0 5 4 9 9 11 5-2 9-6 9-11V7L12 2z"/><path d="M12 8v4M10 12h4" stroke-width="2.5"/></svg>`,
    '균열의 눈':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/><line x1="4" y1="4" x2="20" y2="20" stroke-width="1.5"/></svg>`,
    '추적자의 각인':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/></svg>`,
    '고대의 반지':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg>`,
    '치유 각인석':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/></svg>`,
    '전투의 함성':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`,
    '불굴의 부적':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`,
    '영혼의 돌':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M8.56 2.75c4.37 6.03 6.02 9.42 8.03 17.72m2.54-15.38c-3.72 4.35-8.94 5.66-16.88 5.85m19.5 1.9c-3.5-.93-6.63-.82-8.94 0-2.58.92-5.01 2.86-7.44 6.32"/></svg>`,
    '수호천사의 깃털':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/><path d="M12 12c-2-3-6-4-6-4s4 0 6 4z"/></svg>`,
    '황금 동전':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v12M8.5 9.5C9 8 10.3 7 12 7c2.2 0 3.5 1.5 3.5 3 0 1.4-.8 2.5-3.5 4-2.7 1.5-3.5 2.6-3.5 4 0 1.5 1.3 3 3.5 3 1.7 0 3-.9 3.5-2.5"/></svg>`,
    '강철 의지':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v6c0 5 4 9 9 11 5-2 9-6 9-11V7L12 2z"/><path d="M9 12l2 2 4-4"/></svg>`,
    '생명의 씨앗':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22V12M12 12C12 7 6 3 3 6c3 1 6 3 9 6zM12 12c0-5 6-9 9-6-3 1-6 3-9 6z"/></svg>`,
    '수호의 방패':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v6c0 5 4 9 9 11 5-2 9-6 9-11V7L12 2z"/></svg>`,
    '약탈자의 주머니':`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
    '공명석':         `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="4"/><path d="M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>`,
    '용의 비늘':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"/><path d="M8 12c0-2.21 1.79-4 4-4s4 1.79 4 4-1.79 4-4 4"/></svg>`,
    '마나 수정':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 19 7 19 17 12 22 5 17 5 7"/></svg>`,
    '피의 계약':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 10c-.83 0-1.5-.67-1.5-1.5v-5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5z"/><path d="M20.5 10H19V8.5c0-.83.67-1.5 1.5-1.5s1.5.67 1.5 1.5-.67 1.5-1.5 1.5z"/><path d="M9.5 14.5c.83 0 1.5.67 1.5 1.5v5c0 .83-.67 1.5-1.5 1.5S8 21.83 8 21v-5c0-.83.67-1.5 1.5-1.5z"/><path d="M3.5 14H5v1.5c0 .83-.67 1.5-1.5 1.5S2 16.33 2 15.5 2.67 14 3.5 14z"/><path d="M14 14.5c0-.83.67-1.5 1.5-1.5h5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-5c-.83 0-1.5-.67-1.5-1.5z"/><path d="M15.5 9H17v1.5c0 .83-.67 1.5-1.5 1.5S14 11.33 14 10.5v-5C14 4.67 14.67 4 15.5 4s1.5.67 1.5 1.5V7"/><path d="M10 9.5C10 8.67 9.33 8 8.5 8h-5C2.67 8 2 8.67 2 9.5S2.67 11 3.5 11h5c.83 0 1.5-.67 1.5-1.5z"/></svg>`,
    '파괴의 인장':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    '무기 숫돌':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14.5 2.5L21 9 9 21 3 15l12-12.5z"/><path d="M7 17l3-3"/></svg>`,
    '고대의 심장':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 0 0 0-7.78z"/><path d="M12 8v4M10 10h4"/></svg>`,
    '망자의 해골':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="11" r="7"/><path d="M9 11a1 1 0 1 0 2 0 1 1 0 0 0-2 0zm4 0a1 1 0 1 0 2 0 1 1 0 0 0-2 0z" fill="currentColor"/><path d="M9 17v2h6v-2M11 17v2M13 17v2"/></svg>`,
    '불꽃의 심장':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>`,
    '냉기의 수정':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="2" x2="12" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    '마법사의 모자':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L4 20h16L12 2z"/><line x1="4" y1="20" x2="20" y2="20"/></svg>`,
    '시간의 모래':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 22h14M5 2h14M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>`,
    '달의 부적':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`,
    '망각의 서':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>`,
    '독사의 이빨':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>`,
    '고대 지도':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
    '마력 증폭기':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    '성기사의 서약':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 7v6c0 5 4 9 9 11 5-2 9-6 9-11V7L12 2z"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>`,
    '혈석':           `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2L3 9l1.5 11h15L21 9 12 2z"/><circle cx="12" cy="13" r="3" fill="currentColor" opacity=".4"/></svg>`,
    '저주의 눈':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>`,
    '전쟁의 북':      `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><ellipse cx="12" cy="6" rx="9" ry="4"/><path d="M3 6v12c0 2.21 4.03 4 9 4s9-1.79 9-4V6"/><path d="M3 12c0 2.21 4.03 4 9 4s9-1.79 9-4"/></svg>`,
    '정복자의 왕관':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 20h20M5 20V8l7-6 7 6v12"/><path d="M12 2v6M7 8l5 4 5-4"/></svg>`,
    '어둠의 결정':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2"/></svg>`,
    '연금술 도가니':  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3l-4 9M15 3l4 9M3 12h18M5 12l2 7a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l2-7"/></svg>`,
    '용사의 휘장':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>`,
    '공허의 왕홀':    `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="20" x2="12" y2="4"/><circle cx="12" cy="4" r="2"/><path d="M9 8l-3 3 3 3M15 8l3 3-3 3"/></svg>`,
};

// 카드 이름으로 SVG 아이콘 반환 (없으면 타입 기본 아이콘)
function getCardIconSVG(card) {
    return CARD_ICON_SVG[card.name] || CARD_TYPE_SVG[card.type] || CARD_TYPE_SVG.skill;
}

// 유물 이름으로 SVG 아이콘 반환 (없으면 희귀도 기본 아이콘)
function getRelicIconSVG(name, rarity) {
    return RELIC_ICON_SVG[name] || RELIC_RARITY_SVG[rarity || 'common'] || RELIC_RARITY_SVG.common;
}


// ============================================================
// CODEX — 카드·유물·적·저주 도감
// ============================================================

// 모든 카드 데이터 평탄화 (도감용, 실제 effect 없이 메타데이터만)
// ── 도감용 카드 메타 — REWARD_CARDS + SHOP_CARDS + 기본덱에서 자동 수집
function getAllCardsMeta() {
    let byClass = { paladin: [], mage: [], ranger: [] };

    // 기본 덱 카드 (오리지널 각인 이름)
    let baseMeta = {
        paladin: [
            { name:'서약의 칼',   cost:1, icon:'⚔️', type:'attack', rarity:'common', desc:'적에게 6 피해. 각성 시 최대 15 피해.' },
            { name:'결계 방어',   cost:1, icon:'🛡️', type:'defend', rarity:'common', desc:'결계 +5. 각성 시 최대 +16.' },
            { name:'생명 각인',   cost:2, icon:'💚', type:'heal',   rarity:'common', desc:'생명력 +6 회복. 각성 시 최대 +18.' },
            { name:'파쇄 일격',   cost:2, icon:'💥', type:'attack', rarity:'common', desc:'적에게 12 피해.' },
            { name:'서약 분쇄',   cost:3, icon:'⚡', type:'skill',  rarity:'common', desc:'22 피해 (각성 대기 4).' },
            { name:'전사의 각성', cost:2, icon:'🔥', type:'skill',  rarity:'common', desc:'각인력 +3 (각성 대기 3).' },
        ],
        mage: [
            { name:'균열 불꽃',   cost:1, icon:'🔥', type:'attack', rarity:'common', desc:'7 피해.' },
            { name:'마력 결계',   cost:1, icon:'✨', type:'defend', rarity:'common', desc:'결계 +4.' },
            { name:'생명 각인',   cost:2, icon:'💚', type:'heal',   rarity:'common', desc:'생명력 +6 회복.' },
            { name:'아케인 폭발', cost:2, icon:'💜', type:'attack', rarity:'common', desc:'11 피해.' },
            { name:'공간 균열',   cost:2, icon:'🌀', type:'skill',  rarity:'common', desc:'결계 -3, 6 피해.' },
            { name:'붕괴 운석',   cost:3, icon:'☄️', type:'skill',  rarity:'common', desc:'25 피해 (각성 대기 4).' },
        ],
        ranger: [
            { name:'추적 화살',   cost:1, icon:'🏹', type:'attack', rarity:'common', desc:'5 피해.' },
            { name:'잔상 회피',   cost:1, icon:'🌫️', type:'defend', rarity:'common', desc:'결계 +5.' },
            { name:'생명 각인',   cost:2, icon:'💚', type:'heal',   rarity:'common', desc:'생명력 +6 회복.' },
            { name:'정밀 저격',   cost:2, icon:'🎯', type:'attack', rarity:'common', desc:'12 피해.' },
            { name:'부식 화살',   cost:2, icon:'☠️', type:'skill',  rarity:'common', desc:'5 피해 + 부식 3.' },
            { name:'연속 사격',   cost:3, icon:'⚡', type:'skill',  rarity:'common', desc:'20 피해 (각성 대기 3).' },
        ],
    };

    ['paladin','mage','ranger'].forEach(cls => {
        let seen = new Set();
        // 기본 덱
        baseMeta[cls].forEach(c => { seen.add(c.name); byClass[cls].push({...c, class:cls}); });
        // 상점 카드
        (SHOP_CARDS[cls]||[]).forEach(c => {
            if (!seen.has(c.name)) {
                seen.add(c.name);
                byClass[cls].push({ name:c.name, cost:c.cost, icon:c.icon, type:c.type, rarity:'common', class:cls, desc:c.description + ' [상점]' });
            }
        });
        // 보상 카드 (rare/legendary 포함)
        (REWARD_CARDS[cls]||[]).forEach(c => {
            if (!seen.has(c.name)) {
                seen.add(c.name);
                byClass[cls].push({ name:c.name, cost:c.cost, icon:c.icon, type:c.type, rarity:c.rarity||'common', class:cls, desc:c.description });
            }
        });
    });

    return byClass;
}

let TYPE_COLOR = { attack:'#c0392b', defend:'#2980b9', heal:'#27ae60', skill:'#8e44ad', curse:'#6a2080' };
let TYPE_LABEL = { attack:'공격', defend:'결계패', heal:'회복패', skill:'기술패', curse:'오염패' };
let CLASS_LABEL = { paladin:'서약기사', mage:'균열술사', ranger:'추적자' };
let CLASS_COLOR = { paladin:'#c9a84c', mage:'#7c4dff', ranger:'#27ae60' };

// 희귀도 배지 HTML
function rarityBadgeHtml(rarity) {
    const map = {
        special:   { label:'전용',   color:'#e040fb', bg:'rgba(224,64,251,0.12)', border:'rgba(224,64,251,0.4)' },
        common:    { label:'일반',   color:'#a0a0b8', bg:'rgba(160,160,184,0.1)', border:'rgba(160,160,184,0.3)' },
        rare:      { label:'희귀',   color:'#4fc3f7', bg:'rgba(79,195,247,0.12)', border:'rgba(79,195,247,0.4)' },
        legendary: { label:'전설',   color:'#ffd54f', bg:'rgba(255,213,79,0.14)', border:'rgba(255,213,79,0.5)' },
        curse:     { label:'오염',   color:'#ce93d8', bg:'rgba(206,147,216,0.12)', border:'rgba(206,147,216,0.4)' },
    };
    let r = map[rarity] || map.common;
    return `<span class="codex-rarity-badge" style="color:${r.color};background:${r.bg};border-color:${r.border}">${r.label}</span>`;
}

function renderCodex(tab, filter) {
    let body    = document.getElementById('codexBody');
    let filterEl = document.getElementById('codexFilter');
    body.innerHTML = '';
    filterEl.innerHTML = '';

    // ══ 각인패(카드) 탭 ══
    if (tab === 'cards') {
        let allByClass = getAllCardsMeta();
        let classes = ['paladin','mage','ranger'];
        let charNames = { paladin:'가론', mage:'세라', ranger:'이안' };

        // 직업 필터
        filterEl.innerHTML = classes.map(c => {
            let col = CLASS_COLOR[c] || '#888';
            return `<button class="codex-filter-btn ${filter===c?'active':''}" data-f="${c}"
                style="--fc:${col}">${charNames[c]}</button>`;
        }).join('');
        filterEl.querySelectorAll('.codex-filter-btn').forEach(b =>
            b.addEventListener('click', () => renderCodex('cards', b.dataset.f))
        );

        let showClass = filter || 'paladin';
        let cards = allByClass[showClass] || [];

        // 희귀도별 분류
        let byRarity = { '기본': [], '일반': [], '희귀': [], '전설': [] };
        cards.forEach(c => {
            if (['서약의 칼','결계 방어','생명 각인','파쇄 일격','서약 분쇄','전사의 각성',
                 '균열 불꽃','마력 결계','아케인 폭발','공간 균열','붕괴 운석',
                 '추적 화살','잔상 회피','정밀 저격','부식 화살','연속 사격'].includes(c.name)) {
                byRarity['기본'].push(c);
            } else if (c.rarity === 'legendary') byRarity['전설'].push(c);
            else if (c.rarity === 'rare') byRarity['희귀'].push(c);
            else byRarity['일반'].push(c);
        });

        let html = '';
        Object.entries(byRarity).forEach(([label, list]) => {
            if (!list.length) return;
            let colors = { '기본':'#a0a0b8','일반':'#a0a0b8','희귀':'#4fc3f7','전설':'#ffd54f' };
            let col = colors[label] || '#888';
            html += `<div class="codex-section-header" style="border-color:${col}20;color:${col}">
                <span class="codex-section-dot" style="background:${col}"></span>${label}패
                <span class="codex-section-count">${list.length}장</span>
            </div><div class="codex-card-grid">`;
            html += list.map(c => {
                let tc = TYPE_COLOR[c.type] || '#888';
                let tl = TYPE_LABEL[c.type] || c.type;
                let rBadge = rarityBadgeHtml(c.rarity || 'common');
                return `
                <div class="codex-card-item codex-card-type-${c.type}">
                    <div class="codex-card-header">
                        <span class="codex-card-cost">◈${c.cost}</span>
                        ${rBadge}
                    </div>
                    <div class="codex-card-icon-big" style="color:${tc}">${getCardIconSVG(c)}</div>
                    <div class="codex-card-name">${c.name}</div>
                    <div class="codex-card-typelabel" style="color:${tc}">${tl}</div>
                    <div class="codex-card-desc">${c.desc}</div>
                </div>`;
            }).join('');
            html += `</div>`;
        });
        body.innerHTML = html;

    // ══ 유물 탭 ══
    } else if (tab === 'relics') {
        let rarityOrder = ['special','legendary','rare','common'];
        let rarityLabel = { special:'전용 각인', legendary:'전설 유물', rare:'희귀 유물', common:'일반 유물' };
        let rarityColor = { special:'#e040fb', legendary:'#ffd54f', rare:'#4fc3f7', common:'#a0a0b8' };

        // 희귀도 필터 버튼
        filterEl.innerHTML = ['all',...rarityOrder].map(r => `
            <button class="codex-filter-btn ${(filter||'all')===r?'active':''}" data-f="${r}"
                style="--fc:${rarityColor[r]||'#a0a0b8'}">
                ${r==='all'?'전체':rarityLabel[r]||r}
            </button>`).join('');
        filterEl.querySelectorAll('.codex-filter-btn').forEach(b =>
            b.addEventListener('click', () => renderCodex('relics', b.dataset.f))
        );

        let showRarity = filter || 'all';
        let relics = Object.entries(RELIC_DATA);
        if (showRarity !== 'all') relics = relics.filter(([,d]) => (d.rarity||'common') === showRarity);

        // 그룹화
        let grouped = {};
        rarityOrder.forEach(r => { grouped[r] = []; });
        relics.forEach(([name,data]) => {
            let r = data.rarity || 'common';
            if (!grouped[r]) grouped[r] = [];
            grouped[r].push([name,data]);
        });

        let html = '';
        rarityOrder.forEach(rar => {
            let list = grouped[rar];
            if (!list || !list.length) return;
            let col = rarityColor[rar];
            html += `<div class="codex-section-header" style="border-color:${col}20;color:${col}">
                <span class="codex-section-dot" style="background:${col}"></span>${rarityLabel[rar]}
                <span class="codex-section-count">${list.length}개</span>
            </div><div class="codex-relic-grid-new">`;
            html += list.map(([name,data]) => {
                let rBadge = rarityBadgeHtml(rar);
                return `
                <div class="codex-relic-card" style="--rc:${col}">
                    <div class="codex-relic-card-top">
                        <span class="codex-relic-big-icon" style="color:${col}">${getRelicIconSVG(name, rar)}</span>
                        <div class="codex-relic-card-info">
                            <div class="codex-relic-card-name">${name}</div>
                            ${rBadge}
                        </div>
                    </div>
                    <div class="codex-relic-card-desc">${data.desc}</div>
                </div>`;
            }).join('');
            html += `</div>`;
        });
        body.innerHTML = html || '<div style="color:var(--text-dim);text-align:center;padding:20px">해당 희귀도의 유물이 없습니다.</div>';

    // ══ 오염패 탭 ══
    } else if (tab === 'curses') {
        filterEl.innerHTML = '';
        let curseColor = '#ce93d8';
        let html = `
        <div class="codex-curse-intro">
            <div class="codex-curse-intro-icon" style="color:${curseColor}; width:32px; height:32px; display:flex; align-items:center; justify-content:center;">${CARD_TYPE_SVG.curse}</div>
            <div class="codex-curse-intro-text">
                오염패는 공허의 각인으로 인해 덱에 끼어드는 부정적인 카드입니다.<br>
                이벤트나 특정 선택에서 획득하며, 대부분 사라지지 않습니다.
            </div>
        </div>
        <div class="codex-card-grid">`;
        html += DEBUFF_CARDS.map(c => `
            <div class="codex-card-item codex-card-type-curse">
                <div class="codex-card-header">
                    <span class="codex-card-cost">◈${c.cost}</span>
                    ${rarityBadgeHtml('curse')}
                </div>
                <div class="codex-card-icon-big" style="color:${curseColor}">${getCardIconSVG(c)}</div>
                <div class="codex-card-name">${c.name}</div>
                <div class="codex-card-typelabel" style="color:${curseColor}">오염패</div>
                <div class="codex-card-desc">${c.description}</div>
                ${c.lore ? `<div class="codex-card-lore">"${c.lore}"</div>` : ''}
            </div>
        `).join('');
        html += `</div>`;
        body.innerHTML = html;
    }
}

function openCodex() {
    document.getElementById('codexModal').style.display = 'flex';
    renderCodex('cards', 'paladin');
    document.querySelectorAll('.codex-tab').forEach(t => {
        t.classList.toggle('active', t.dataset.ctab === 'cards');
    });
}
function closeCodex() {
    document.getElementById('codexModal').style.display = 'none';
}

// ============================================================
// MUSIC SYSTEM — Web Audio API 기반 프로시저럴 BGM
// ============================================================
let audioCtx = null;
let musicNodes = [];
let musicPlaying = false;
let musicVolume = 0.35;
let musicScheduler = null;

function getAudioCtx() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    return audioCtx;
}

// ── 스케일 정의 ──
// title : C# 마이너 — 신비롭고 장엄 (낮은 옥타브 아르페지오)
// battle: A 하모닉 마이너 — 긴박하고 위험, 드럼+베이스
// map   : G 마이너 — 여행, 우울한 탐험
let currentMusicTheme = 'title';
let musicGain = null;

function startMusic(theme) {
    if (!musicPlaying) return;
    theme = theme || currentMusicTheme;
    currentMusicTheme = theme;
    stopMusicNodes();

    let ctx = getAudioCtx();
    if (ctx.state === 'suspended') ctx.resume();

    musicGain = ctx.createGain();
    musicGain.gain.setValueAtTime(musicVolume * 0.8, ctx.currentTime);
    let comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 10;
    comp.ratio.value = 6; comp.attack.value = 0.003; comp.release.value = 0.15;
    musicGain.connect(comp); comp.connect(ctx.destination);

    function makeReverb(secs, decay) {
        let cv = ctx.createConvolver();
        let len = ctx.sampleRate * secs;
        let buf = ctx.createBuffer(2, len, ctx.sampleRate);
        for (let ch = 0; ch < 2; ch++) {
            let d = buf.getChannelData(ch);
            for (let i = 0; i < len; i++)
                d[i] = (Math.random()*2-1) * Math.exp(-i/(ctx.sampleRate*decay));
        }
        cv.buffer = buf; return cv;
    }
    let rvShort = makeReverb(1.5, 0.6);
    let rvLong  = makeReverb(3.5, 1.4);
    let rvGS = ctx.createGain(); rvGS.gain.value = theme==='battle' ? 0.06 : 0.12;
    let rvGL = ctx.createGain(); rvGL.gain.value = theme==='battle' ? 0.04 : 0.18;
    rvShort.connect(rvGS); rvGS.connect(musicGain);
    rvLong.connect(rvGL);  rvGL.connect(musicGain);

    function osc(freq, type, vol, atk, rel, start, dur, dest, detuneAmt) {
        let o = ctx.createOscillator(), e = ctx.createGain();
        o.type = type; o.frequency.value = freq;
        if (detuneAmt) o.detune.value = detuneAmt;
        e.gain.setValueAtTime(0, start);
        e.gain.linearRampToValueAtTime(vol, start + atk);
        e.gain.setValueAtTime(vol * 0.7, start + atk + rel * 0.3);
        e.gain.exponentialRampToValueAtTime(0.0001, start + dur);
        o.connect(e); e.connect(dest || musicGain);
        o.start(start); o.stop(start + dur + 0.1);
        musicNodes.push(o, e);
    }
    function chord(freqs, type, vol, atk, start, dur, dest) {
        freqs.forEach((f, i) => osc(f, type, vol / freqs.length, atk, dur*0.3, start + i*0.012, dur, dest));
    }
    function noise(vol, lo, hi, start, dur, dest) {
        let len = Math.ceil(ctx.sampleRate * Math.max(dur, 0.05));
        let buf = ctx.createBuffer(1, len, ctx.sampleRate);
        let d = buf.getChannelData(0);
        for (let i = 0; i < len; i++) d[i] = Math.random()*2-1;
        let src = ctx.createBufferSource(); src.buffer = buf;
        let lpf = ctx.createBiquadFilter(); lpf.type='lowpass'; lpf.frequency.value=hi;
        let hpf = ctx.createBiquadFilter(); hpf.type='highpass'; hpf.frequency.value=lo;
        let e = ctx.createGain(); e.gain.setValueAtTime(vol, start); e.gain.exponentialRampToValueAtTime(0.0001, start+dur);
        src.connect(hpf); hpf.connect(lpf); lpf.connect(e); e.connect(dest||musicGain);
        src.start(start); musicNodes.push(src, e, lpf, hpf);
    }

    // TITLE: C# minor — 각인의 눈물
    if (theme === 'title') {
        let BPM=52, beat=60/BPM, ROOT=138.59;
        let CHORDS=[
            [ROOT,ROOT*1.189,ROOT*1.498],
            [ROOT*0.749,ROOT*0.749*1.260,ROOT*0.749*1.587],
            [ROOT*0.595,ROOT*0.595*1.260,ROOT*0.595*1.587],
            [ROOT*0.668,ROOT*0.668*1.260,ROOT*0.668*1.498],
        ];
        let ARP=[ROOT*2,ROOT*2*1.189,ROOT*2*1.498,ROOT*4,ROOT*2*1.189,ROOT*2*1.498,ROOT*4,ROOT*2*1.782];
        [ROOT*0.25,ROOT*0.5,ROOT*0.5*1.498].forEach((f,fi)=>{
            let o=ctx.createOscillator(),g=ctx.createGain(),flt=ctx.createBiquadFilter();
            flt.type='lowpass'; flt.frequency.value=320; o.type='sawtooth'; o.frequency.value=f;
            g.gain.value=[0.05,0.032,0.018][fi];
            let lfo=ctx.createOscillator(),lg=ctx.createGain();
            lfo.frequency.value=0.18; lg.gain.value=g.gain.value*0.18;
            lfo.connect(lg); lg.connect(g.gain); lfo.start();
            o.connect(flt); flt.connect(g); g.connect(musicGain); g.connect(rvLong);
            o.start(); musicNodes.push(o,g,flt,lfo,lg);
        });
        let step=0,nextT=ctx.currentTime+0.1;
        function titleStep(){
            while(nextT<ctx.currentTime+0.6){
                let bar=Math.floor(step/8)%CHORDS.length, cFreqs=CHORDS[bar], sub=step%8;
                if(sub===0){ chord(cFreqs,'sawtooth',0.09,0.08,nextT,beat*8.5,rvShort); chord(cFreqs.map(f=>f*2),'triangle',0.045,0.12,nextT,beat*8.2,rvLong); }
                let af=ARP[step%ARP.length];
                osc(af,'triangle',0.07,0.015,beat*0.6,nextT,beat*0.85,musicGain);
                osc(af,'sine',0.025,0.03,beat*0.7,nextT+0.015,beat*1.0,rvShort);
                if(sub===1||sub===3||sub===5||sub===7){ let mi=[0,2,4,7,4,2,0,5][step%8]; let mf=ARP[mi%ARP.length]*0.5; osc(mf,'triangle',0.055,0.06,beat*1.8,nextT,beat*2.2,musicGain); osc(mf,'triangle',0.02,0.08,beat*1.9,nextT+0.02,beat*2.4,rvLong); }
                if(sub===0){ osc(ROOT*0.25,'sine',0.18,0.005,beat*0.35,nextT,beat*0.5,musicGain); noise(0.06,80,300,nextT,0.25,musicGain); }
                if(sub===4) osc(ROOT*0.25*1.189,'sine',0.10,0.005,beat*0.25,nextT,beat*0.35,musicGain);
                nextT+=beat; step++;
            }
        }
        titleStep();
        musicScheduler=setInterval(titleStep,180);
        musicNodes.push({stop:()=>clearInterval(musicScheduler)});
    }

    // BATTLE: A harmonic minor — 균열의 전쟁
    else if (theme === 'battle') {
        let BPM=136,beat=60/BPM,ROOT=220;
        let SC=[220,246.94,261.63,293.66,329.63,349.23,415.30,440];
        let BASS=[0,0,3,3,4,4,0,0,0,2,3,0,4,3,2,0,0,0,5,3,2,1,0,4,0,3,4,5,4,3,2,0];
        let MEL=[7,5,4,3,2,4,5,7,4,3,2,4,5,7,4,2,7,6,5,4,3,5,7,6,5,4,3,5,7,6,5,4];
        function kick(t,vol){ let o=ctx.createOscillator(),e=ctx.createGain(); o.type='sine'; o.frequency.setValueAtTime(220,t); o.frequency.exponentialRampToValueAtTime(40,t+0.12); e.gain.setValueAtTime(vol||0.85,t); e.gain.exponentialRampToValueAtTime(0.001,t+0.28); o.connect(e); e.connect(musicGain); o.start(t); o.stop(t+0.32); musicNodes.push(o,e); }
        function snare(t){ noise(0.32,1500,9000,t,0.10,musicGain); osc(200,'sine',0.10,0.001,0.06,t,0.08,musicGain); osc(320,'sine',0.05,0.001,0.05,t,0.07,musicGain); }
        function hihat(t,vol,open){ noise(vol||0.06,open?4000:8000,16000,t,open?0.12:0.04,musicGain); }
        function cymbal(t,vol){ noise(vol||0.18,3000,14000,t,0.6,musicGain); }
        let step=0,nextT=ctx.currentTime+0.05;
        function battleStep(){
            while(nextT<ctx.currentTime+0.5){
                let sub=step%16;
                if(sub===0||sub===8) kick(nextT,sub===0?0.9:0.7);
                if(sub===4||sub===12) snare(nextT);
                if(sub===0&&Math.floor(step/16)%4===0) cymbal(nextT,0.15);
                hihat(nextT,[0,2,4,6,8,10,12,14].includes(sub)?0.07:0.04,sub===4||sub===12);
                if(step%2===0){ let bi=BASS[(step/2)%BASS.length]; let bf=SC[bi%SC.length]*0.5; osc(bf,'square',0.16,0.004,0.055,nextT,beat*0.9,musicGain); osc(bf,'sawtooth',0.04,0.004,0.06,nextT,beat*0.85,rvShort); }
                if(step%2===0){ let mi=MEL[(step/2)%MEL.length]; let mf=SC[mi%SC.length]*2; osc(mf,'sawtooth',0.10,0.01,0.08,nextT,beat*0.7,musicGain,-8); osc(mf,'sawtooth',0.04,0.01,0.08,nextT,beat*0.7,rvShort,8); osc(mf*1.5,'triangle',0.025,0.01,0.06,nextT,beat*0.5,rvLong); }
                if(step%8===0){ let bar=Math.floor(step/8)%4; let BRASS=[[SC[0],SC[2],SC[4]],[SC[3],SC[5],SC[0]*2],[SC[4],SC[6],SC[1]*2],[SC[0],SC[2],SC[4]]]; BRASS[bar].forEach((f,i)=>osc(f,'square',0.05+i*0.01,0.018,beat*3.5,nextT,beat*3.8,rvShort,i%2===0?-5:5)); }
                if(step%6===0&&step>0) noise(0.06,5000,12000,nextT,0.18,musicGain);
                nextT+=beat/2; step++;
            }
        }
        battleStep();
        musicScheduler=setInterval(battleStep,180);
        musicNodes.push({stop:()=>clearInterval(musicScheduler)});
    }

    // MAP: G minor — 각인된 여정
    else {
        let BPM=66,beat=60/BPM,ROOT=98;
        let SC=[196,220,233.08,261.63,293.66,311.13,349.23,392];
        let CM=[[196,233.08,293.66],[233.08,261.63,349.23],[261.63,311.13,392],[220,261.63,329.63]];
        let CELLO=[4,3,2,0,3,5,4,2,0,2,3,5,4,3,2,4,5,4,3,2,0,3,5,7];
        let FLUTE=[7,5,7,4,5,3,5,7,4,5,7,5,3,4,5,3,7,5,4,3,5,4,3,5];
        CM[0].forEach((f,i)=>{
            let o=ctx.createOscillator(),g=ctx.createGain(),flt=ctx.createBiquadFilter();
            flt.type='lowpass'; flt.frequency.value=400; o.type='sawtooth'; o.frequency.value=f*0.5;
            g.gain.value=[0.045,0.028,0.016][i];
            let lfo=ctx.createOscillator(),lg=ctx.createGain();
            lfo.frequency.value=0.22; lg.gain.value=g.gain.value*0.22;
            lfo.connect(lg); lg.connect(g.gain); lfo.start();
            o.connect(flt); flt.connect(g); g.connect(musicGain); g.connect(rvLong);
            o.start(); musicNodes.push(o,g,flt,lfo,lg);
        });
        let step=0,nextT=ctx.currentTime+0.1;
        function mapStep(){
            while(nextT<ctx.currentTime+0.6){
                let bar=Math.floor(step/6)%CM.length, sub=step%6;
                if(sub===0){ chord(CM[bar],'sawtooth',0.07,0.10,nextT,beat*6.5,rvShort); chord(CM[bar].map(f=>f*2),'triangle',0.035,0.14,nextT,beat*6.2,rvLong); }
                let ci=CELLO[step%CELLO.length], cf=SC[ci%SC.length];
                osc(cf,'triangle',0.075,0.06,beat*0.7,nextT,beat*0.95,musicGain);
                osc(cf,'triangle',0.028,0.08,beat*0.8,nextT+0.02,beat*1.1,rvShort);
                osc(cf*0.5,'sine',0.04,0.04,beat*0.8,nextT,beat*1.0,musicGain);
                if(sub%3===1){ let fi2=FLUTE[Math.floor(step/3)%FLUTE.length]; let ff=SC[fi2%SC.length]*2; osc(ff,'sine',0.055,0.05,beat*1.6,nextT,beat*1.9,musicGain); osc(ff,'sine',0.020,0.07,beat*1.7,nextT+0.025,beat*2.1,rvLong); osc(ff*1.5,'sine',0.012,0.06,beat*1.2,nextT,beat*1.4,rvShort); }
                if(sub===2||sub===5){ let pf=SC[CELLO[(step+2)%CELLO.length]%SC.length]*2; osc(pf,'triangle',0.055,0.005,0.08,nextT,0.12,musicGain); osc(pf,'triangle',0.018,0.005,0.09,nextT,0.14,rvShort); }
                if(sub===0){ let bf=CM[bar][0]*0.5; osc(bf,'sine',0.10,0.02,beat*1.5,nextT,beat*2.0,musicGain); osc(bf*1.498,'sine',0.04,0.03,beat*1.3,nextT,beat*1.8,rvShort); }
                nextT+=beat; step++;
            }
        }
        mapStep();
        musicScheduler=setInterval(mapStep,180);
        musicNodes.push({stop:()=>clearInterval(musicScheduler)});
    }
}


function stopMusicNodes() {
    clearInterval(musicScheduler);
    musicScheduler = null;
    musicNodes.forEach(n => {
        try { if (n.stop) n.stop(); } catch(e) {}
        try { if (n.disconnect) n.disconnect(); } catch(e) {}
    });
    musicNodes = [];
    if (musicGain) { try { musicGain.disconnect(); } catch(e) {} musicGain = null; }
}

function setMusicTheme(theme) {
    if (currentMusicTheme === theme) return;
    if (musicPlaying) startMusic(theme);
    else currentMusicTheme = theme;
}

function initMusic() {
    let btn = document.getElementById('musicToggleBtn');
    let vol = document.getElementById('musicVolume');
    if (!btn || !vol) return;

    // 볼륨 슬라이더
    vol.addEventListener('input', () => {
        musicVolume = Number(vol.value);
        if (musicGain) musicGain.gain.setValueAtTime(musicVolume, getAudioCtx().currentTime);
    });

    // 음악 토글
    btn.addEventListener('click', () => {
        if (musicPlaying) {
            musicPlaying = false;
            stopMusicNodes();
            btn.textContent = '—';
            btn.title = '음악 켜기';
        } else {
            musicPlaying = true;
            btn.textContent = '♪';
            btn.title = '음악 끄기';
            startMusic(currentMusicTheme);
        }
    });

    // 첫 사용자 인터랙션 후 자동 재생
    document.addEventListener('click', function autoStart() {
        if (!musicPlaying) {
            musicPlaying = true;
            btn.textContent = '♪';
            startMusic(currentMusicTheme);
        }
        document.removeEventListener('click', autoStart);
    }, { once: true });
}

// showScreen 시 음악 테마 전환
let _origShowScreen = null;
function showScreenWithMusic(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    // 테마 전환
    if (id === 'titleScreen')  setMusicTheme('title');
    else if (id === 'combatScreen') setMusicTheme('battle');
    else setMusicTheme('map');
}

// ============================================================
// ESC KEY — 홈화면 이동
// ============================================================
function initEscHandler() {
    document.addEventListener('keydown', e => {
        // Space 키 → 흐름 종료
    if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        let escVisible = document.getElementById('escModal').style.display !== 'none';
        if (!escVisible && !gs.inMap && !gs.gameOver) endTurn();
        return;
    }
        let codex = document.getElementById('codexModal');
        if (codex && codex.style.display !== 'none') { closeCodex(); return; }
        let tutModal = document.getElementById('tutorialModal');
        if (tutModal && tutModal.style.display !== 'none') { tutModal.style.display = 'none'; return; }
        let titleActive = document.getElementById('titleScreen').classList.contains('active');
        if (titleActive) return;
        let escVisible = document.getElementById('escModal').style.display !== 'none';
        if (escVisible) { hideEscModal(); return; }
        showEscModal();
    });

    // 팝업 바깥 클릭 시 닫기
    document.getElementById('escModal').addEventListener('click', function(e) {
        if (e.target === this) hideEscModal();
    });
}

function showEscModal() {
    // 현재 상태 정보 수집
    let isInBattle = !gs.inMap && !gs.gameOver && gs.enemy;
    let p = gs.player;
    let actName  = ACTS[gs.currentAct]?.name  || '';
    let stageName= ACTS[gs.currentAct]?.stageName?.split('·')[0]?.trim() || '';

    let statusHtml = '';
    if (p && isInBattle) {
        let hpPct = Math.round(p.hp / p.maxHp * 100);
        let hpColor = hpPct > 60 ? '#5dd98c' : hpPct > 30 ? '#ffd54f' : '#ff6b6b';
        statusHtml = `
        <div class="esc-status">
            <div class="esc-status-row">
                <span class="esc-status-label">❤️ 생명</span>
                <span class="esc-status-val" style="color:${hpColor}">${p.hp} / ${p.maxHp}</span>
            </div>
            <div class="esc-status-row">
                <span class="esc-status-label">✦ 각인석</span>
                <span class="esc-status-val">${p.gold}</span>
            </div>
            <div class="esc-status-row">
                <span class="esc-status-label">◈ 구역</span>
                <span class="esc-status-val">${actName} · ${gs.currentStage || 1}구역</span>
            </div>
            ${gs.enemy ? `<div class="esc-status-row">
                <span class="esc-status-label">👾 교전 중</span>
                <span class="esc-status-val esc-enemy-name">${gs.enemies && gs.enemies.length>0 ? gs.enemies.filter(e=>e.hp>0).map(e=>e.name).join(', ') : (gs.enemy?gs.enemy.name:'')}</span>
            </div>` : ''}
        </div>`;
    } else if (p) {
        statusHtml = `
        <div class="esc-status">
            <div class="esc-status-row">
                <span class="esc-status-label">❤️ 생명</span>
                <span class="esc-status-val">${p.hp} / ${p.maxHp}</span>
            </div>
            <div class="esc-status-row">
                <span class="esc-status-label">✦ 각인석</span>
                <span class="esc-status-val">${p.gold}</span>
            </div>
            ${actName ? `<div class="esc-status-row">
                <span class="esc-status-label">◈ 장</span>
                <span class="esc-status-val">${actName}${stageName ? ' · ' + stageName : ''}</span>
            </div>` : ''}
        </div>`;
    }

    document.getElementById('escInner').innerHTML = `
        <div class="esc-emblem">⊗</div>
        <div class="esc-title">여정을 중단하시겠습니까?</div>
        <div class="esc-desc">타이틀로 돌아가면 현재 여정의 모든 진행이 사라집니다.</div>
        ${statusHtml}
        <div class="esc-warn">⚠️ 저장되지 않습니다</div>
        <div class="esc-btns">
            <button id="escCancelBtn" class="esc-cancel">계속 진행</button>
            <button id="escConfirmBtn" class="esc-confirm">타이틀로</button>
        </div>
    `;

    // 버튼 바인딩 (innerHTML 교체 후 재바인딩)
    document.getElementById('escConfirmBtn').addEventListener('click', () => {
        hideEscModal();
        stopAutoSequence();
        backToTitle();
    });
    document.getElementById('escCancelBtn').addEventListener('click', hideEscModal);

    document.getElementById('escModal').style.display = 'flex';
    stopAutoSequence();
}
function hideEscModal() {
    document.getElementById('escModal').style.display = 'none';
    if (!gs.inMap && !gs.gameOver && gs.autoMode) startAutoSequence();
}

// ============================================================
// TUTORIAL SYSTEM — 처음 플레이하는 유저 가이드
// ============================================================
const TUTORIAL_STEPS = [
    {
        title: '각인의 서에 오신 것을 환영합니다',
        icon: '⊗',
        text: `신과 인간이 맺은 계약 「각인(刻印)」이 붕괴된 세계.\n\n당신은 몸에 각인의 흔적을 지닌 각인자(刻印者)로서,\n세 개의 봉인된 장(章)을 통과하여\n근원악 「공허의 핵」을 다시 봉인해야 합니다.`,
    },
    {
        title: '각인 수정 ◈',
        icon: '◈',
        text: `전투마다 「각인 수정」이 3개 주어집니다.\n\n카드를 사용하면 수정이 소모됩니다.\n수정이 부족하면 카드를 사용할 수 없습니다.\n\n흐름을 종료하면 수정이 완전히 충전됩니다.`,
        highlight: 'energyGems',
    },
    {
        title: '결계 — 피해 흡수',
        icon: '▣',
        text: `「결계」는 적의 공격을 먼저 흡수합니다.\n\n예를 들어 결계 5 상태에서 8의 공격을 받으면\n실제 생명력 손실은 3입니다.\n\n결계는 흐름이 종료되면 초기화됩니다.`,
        highlight: 'playerDef',
    },
    {
        title: '각인력 ⚡ — 공격력 배율',
        icon: '⚡',
        text: `「각인력」은 공격 카드의 피해를 증폭시킵니다.\n\n기본 각인력은 1입니다.\n각인력이 2가 되면 공격 카드 피해가 2배!\n\n「전사의 각성」 같은 카드로 각인력을 높이세요.`,
        highlight: 'playerPower',
    },
    {
        title: '부식 — 지속 피해',
        icon: '✦',
        text: `「부식」은 매 흐름 적에게 지속 피해를 줍니다.\n\n부식 5 상태의 적은 매 흐름 5의 피해를 입습니다.\n그 후 부식 수치는 1씩 감소합니다.\n\n이안(추적자)은 부식을 극도로 활용합니다.`,
    },
    {
        title: '덱 구성 — 각인패 선택',
        icon: '✦',
        text: `전투에서 승리하면 새 각인패를 덱에 추가할 수 있습니다.\n\n「상점」에서 카드와 유물을 구매하거나,\n「공명의 결절」에서 카드를 각성(강화)할 수 있습니다.\n\n강한 조합을 만들어 진행할수록 강해집니다.`,
        highlight: 'deckCount',
    },
    {
        title: '유물 — 지속 효과',
        icon: '◇',
        text: `「유물」은 다양한 지속 효과를 제공합니다.\n\n엘리트 적을 처치하거나 유물 노드에서 획득합니다.\n\n좋은 유물 조합이 승리를 결정짓습니다.\n도감에서 모든 유물을 확인하세요.`,
        highlight: 'relicsMini',
    },
    {
        title: '세 명의 각인자',
        icon: '⊗',
        text: `▸ 가론 (서약기사) — 생명 70, 결계·치유 특화\n  폭발적인 결계와 자가 회복으로 버텨냅니다.\n\n▸ 세라 (균열술사) — 생명 55, 공간 균열·대형 피해\n  강력한 단발 피해와 디버프로 압도합니다.\n\n▸ 이안 (추적자) — 생명 60, 부식·연속 사격\n  누적 부식과 빠른 다중 공격으로 소모시킵니다.`,
    },
    {
        title: '준비가 되셨나요?',
        icon: '◈',
        text: `계약이 파기된 세계는 당신을 기다리고 있습니다.\n\n각인의 힘을 모으고, 덱을 구축하고,\n세 개의 장을 통과하여\n「바알-나크라스」를 봉인하세요.\n\n행운을 빕니다, 각인자여.`,
    },
];

let tutorialStep = 0;

function showTutorial() {
    let el = document.getElementById('tutorialModal');
    if (!el) return;
    el.style.display = 'flex';
    renderTutorialStep(0);
}

function renderTutorialStep(step) {
    tutorialStep = step;
    let data = TUTORIAL_STEPS[step];
    let isLast = step >= TUTORIAL_STEPS.length - 1;
    let modal = document.getElementById('tutorialModal');
    if (!modal) return;

    let pips = TUTORIAL_STEPS.map((_,i) =>
        `<div class="tut-pip ${i===step?'active':i<step?'done':''}" data-step="${i}"></div>`
    ).join('');

    modal.querySelector('.tut-body').innerHTML = `
        <div class="tut-icon">${data.icon}</div>
        <div class="tut-title">${data.title}</div>
        <div class="tut-text">${data.text.replace(/\n/g,'<br>')}</div>
        <div class="tut-pips">${pips}</div>
        <div class="tut-btns">
            ${step > 0 ? `<button class="tut-btn tut-prev" id="tutPrevBtn">← 이전</button>` : '<span></span>'}
            <button class="tut-btn tut-next" id="tutNextBtn">${isLast ? '모험 시작 ⚔️' : '다음 →'}</button>
        </div>
    `;

    modal.querySelectorAll('.tut-pip').forEach(pip => {
        pip.addEventListener('click', () => renderTutorialStep(Number(pip.dataset.step)));
    });

    let nextBtn = modal.querySelector('#tutNextBtn');
    if (nextBtn) nextBtn.addEventListener('click', () => {
        if (isLast) {
            modal.style.display = 'none';
            localStorage.setItem('kakin_tutorial_done', '1');
        } else {
            renderTutorialStep(step + 1);
        }
    });

    let prevBtn = modal.querySelector('#tutPrevBtn');
    if (prevBtn) prevBtn.addEventListener('click', () => renderTutorialStep(step - 1));
}

// ============================================================
// INIT DROP ZONES
// ============================================================
initDropZones();
initUpgradeUI();
injectCharacterSVGs();
initMusic();
initEscHandler();

// 튜토리얼 버튼
let tutBtn = document.getElementById('tutorialBtn');
if (tutBtn) tutBtn.addEventListener('click', showTutorial);

// 첫 실행 시 자동 튜토리얼
if (!localStorage.getItem('kakin_tutorial_done')) {
    setTimeout(showTutorial, 600);
}

// Show title
showScreen('titleScreen');

