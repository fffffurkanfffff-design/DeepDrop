/* Tries candidate levelling settings and reports the milestones each produces,
   so the curve is chosen from numbers rather than guesswork.
   Run: node src/_tune.cjs
*/
const fs = require("fs");
const path = require("path");
eval(fs.readFileSync(path.join(__dirname, "10-data.js"), "utf8"));

const FISH_PER_HAUL = 5;
const SAMPLES = 12000;

function rollKg(f) { return f.kg[0] + (f.kg[1] - f.kg[0]) * Math.pow(Math.random(), 2.2); }
function spawnWeight(f, boost, R) {
  return R[f.rar].spawn * Math.pow(1 + boost * 3, RARITY_ORDER.indexOf(f.rar) / 5);
}
function gearAt(level, kind) {
  let best = GEAR[kind][0];
  for (const g of GEAR[kind]) if (g.lvl <= level) best = g;
  return best;
}
function areaAt(level) { let a = AREAS[0]; for (const x of AREAS) if (level >= x.lvl) a = x; return a; }

function milestones(R, base, exp) {
  const xpFor = (n) => Math.round(base * Math.pow(n, exp));
  const cache = {};
  function xpPerFish(areaId, boost, maxDepth) {
    const key = areaId + "|" + boost + "|" + maxDepth;
    if (cache[key]) return cache[key];
    const pool = FISH.filter((f) => f.areas.includes(areaId) && f.dep[0] <= maxDepth);
    let wsum = 0;
    for (const f of pool) wsum += spawnWeight(f, boost, R);
    let acc = 0;
    for (let i = 0; i < SAMPLES; i++) {
      let r = Math.random() * wsum, pick = pool[0];
      for (const f of pool) { r -= spawnWeight(f, boost, R); if (r <= 0) { pick = f; break; } }
      acc += Math.round(Math.pow(Math.max(0.05, rollKg(pick)), 0.6) * R[pick.rar].xp);
    }
    return (cache[key] = acc / SAMPLES);
  }
  let running = 0; const marks = {};
  for (let n = 1; n < MAX_PLAYER_LVL; n++) {
    const a = areaAt(n), reel = gearAt(n, "reel"), lure = gearAt(n, "lure");
    const per = xpPerFish(a.id, lure.boost, Math.min(reel.depth, a.maxDepth));
    running += xpFor(n) / (per * FISH_PER_HAUL);
    marks[n + 1] = Math.round(running);
  }
  return marks;
}

const scale = (mult) => {
  const R = JSON.parse(JSON.stringify(RARITY));
  for (const k of RARITY_ORDER) R[k].xp = Math.round(R[k].xp * (mult[k] ?? 1));
  return R;
};

const candidates = [
  { label: "current (90 x n^1.55, xp as-is)", R: RARITY, base: 90, exp: 1.55 },
  { label: "flatter curve only (70 x n^1.38)", R: RARITY, base: 70, exp: 1.38 },
  { label: "richer commons only", R: scale({ common: 2.2, uncommon: 2.0, rare: 1.8, epic: 1.6, legendary: 1.5, mythic: 1.4 }), base: 90, exp: 1.55 },
  { label: "both, gentle (75 x n^1.42)", R: scale({ common: 2.0, uncommon: 1.9, rare: 1.7, epic: 1.5, legendary: 1.4, mythic: 1.3 }), base: 75, exp: 1.42 },
  { label: "both, stronger (65 x n^1.34)", R: scale({ common: 2.4, uncommon: 2.2, rare: 1.9, epic: 1.7, legendary: 1.5, mythic: 1.4 }), base: 65, exp: 1.34 },
];

console.log("total casts from a fresh start\n");
console.log("  " + "setting".padEnd(36) + "L5".padStart(6) + "L9*".padStart(7) + "L13".padStart(7) +
            "L20*".padStart(8) + "L25".padStart(7) + "L30".padStart(7));
console.log("  " + "-".repeat(36) + "  " + "-".repeat(40));
for (const c of candidates) {
  const m = milestones(c.R, c.base, c.exp);
  console.log("  " + c.label.padEnd(36) +
    String(m[5]).padStart(6) + String(m[9]).padStart(7) + String(m[13]).padStart(7) +
    String(m[20]).padStart(8) + String(m[25]).padStart(7) + String(m[30]).padStart(7));
}
console.log("\n  * L9 unlocks False Bay, L20 unlocks St Lucia");
console.log("  target: L9 around 25-30 casts, L20 around 110-130, L30 under 300");
