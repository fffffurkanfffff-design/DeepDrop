/* Levelling probe - simulates real hauls using the actual spawn weighting and
   weight rolls, then reports how many casts each level costs.
   Run: node src/_levelprobe.cjs
*/
const fs = require("fs");
const path = require("path");
eval(fs.readFileSync(path.join(__dirname, "10-data.js"), "utf8"));

const FISH_PER_HAUL = 5;   /* a decent run rakes in about this many on the way up */
const SAMPLES = 20000;

function rollKg(f) {
  const u = Math.pow(Math.random(), 2.2);
  return f.kg[0] + (f.kg[1] - f.kg[0]) * u;
}
function fishXp(f, kg) {
  return Math.round(Math.pow(Math.max(0.05, kg), 0.6) * RARITY[f.rar].xp);
}
function spawnWeight(f, boost) {
  const idx = RARITY_ORDER.indexOf(f.rar);
  return RARITY[f.rar].spawn * Math.pow(1 + boost * 3, idx / 5);
}
/* gear a player plausibly holds at a level */
function gearAt(level, kind) {
  let best = GEAR[kind][0];
  for (const g of GEAR[kind]) if (g.lvl <= level) best = g;
  return best;
}

/* expected xp for one caught fish in an area, at a given lure boost and depth reach */
function xpPerFish(areaId, boost, maxDepth) {
  const pool = FISH.filter(
    (f) => f.areas.includes(areaId) && f.dep[0] <= maxDepth
  );
  let total = 0, wsum = 0;
  for (const f of pool) {
    const w = spawnWeight(f, boost);
    wsum += w;
  }
  let acc = 0;
  for (let i = 0; i < SAMPLES; i++) {
    let r = Math.random() * wsum;
    let pick = pool[0];
    for (const f of pool) { r -= spawnWeight(f, boost); if (r <= 0) { pick = f; break; } }
    acc += fishXp(pick, rollKg(pick));
  }
  return acc / SAMPLES;
}

function xpTotalTo(n) { let t = 0; for (let i = 1; i < n; i++) t += xpForLevel(i); return t; }

/* which area is a player realistically fishing at each level? the best unlocked */
function areaAt(level) {
  let a = AREAS[0];
  for (const x of AREAS) if (level >= x.lvl) a = x;
  return a;
}

console.log("casts needed per level (5 fish landed per cast)\n");
console.log("  lvl  area          xp/fish   xp/cast   xp needed   casts   running");
let running = 0;
const marks = {};
for (let n = 1; n < MAX_PLAYER_LVL; n++) {
  const a = areaAt(n);
  const reel = gearAt(n, "reel");
  const lure = gearAt(n, "lure");
  const depth = Math.min(reel.depth, a.maxDepth);
  const per = xpPerFish(a.id, lure.boost, depth);
  const perCast = per * FISH_PER_HAUL;
  const need = xpForLevel(n);
  const casts = need / perCast;
  running += casts;
  marks[n + 1] = running;
  if (n <= 12 || n % 3 === 0 || n === MAX_PLAYER_LVL - 1) {
    console.log(
      "  " + String(n).padStart(3) +
      "  " + a.n.padEnd(13) +
      String(Math.round(per)).padStart(7) +
      String(Math.round(perCast)).padStart(10) +
      String(Math.round(need)).padStart(12) +
      String(Math.round(casts)).padStart(8) +
      String(Math.round(running)).padStart(10)
    );
  }
}
console.log("\nmilestones (total casts from a fresh start):");
for (const lv of [2, 3, 5, 9, 13, 15, 20, 25, 30]) {
  if (marks[lv]) console.log("  reach L" + String(lv).padStart(2) + "  " + Math.round(marks[lv]).toLocaleString() + " casts" +
    (lv === 9 ? "   <- False Bay unlocks" : lv === 20 ? "   <- St Lucia unlocks" : ""));
}
