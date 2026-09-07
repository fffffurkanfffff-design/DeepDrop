/* Balance probe - loads the data file and reports whether the gear curve can
   actually land the fish each fishery holds. Not shipped; run with:
     node src/_balance.cjs
*/
const fs = require("fs");
const path = require("path");
const code = fs.readFileSync(path.join(__dirname, "10-data.js"), "utf8");
eval(code);

/* LINE_FACTOR comes from 10-data.js */
function riskFor(ratio, relief = 0) {
  if (ratio <= 0.8) return 0;
  const r = ratio <= 1 ? ((ratio - 0.8) / 0.2) * 0.35 : 0.55 + (ratio - 1) * 0.5;
  return Math.max(0, Math.min(0.97, r * (1 - relief)));
}
function meanKg(f) {
  /* rollKg uses pow(u, 2.2); mean of that on [0,1] is 1/(1+2.2) */
  return f.kg[0] + (f.kg[1] - f.kg[0]) * (1 / 3.2);
}
const pct = (x) => (x * 100).toFixed(0) + "%";

console.log("=== gear tiers by unlock level ===");
for (const k of ["rod", "reel", "line"]) {
  console.log(
    " " + k.padEnd(5),
    GEAR[k].map((g) => `L${g.lvl}:${g.maxKg ?? g.depth ?? g.kg}`).join("  ")
  );
}

/* what gear does a player plausibly have at a given level? highest affordable tier */
function gearAt(level, kind) {
  let best = GEAR[kind][0];
  for (const g of GEAR[kind]) if (g.lvl <= level) best = g;
  return best;
}

console.log("\n=== per fishery: can the gear at unlock level land what's there? ===");
for (const a of AREAS) {
  const lvl = a.lvl;
  const r = gearAt(lvl, "rod"), e = gearAt(lvl, "reel"), l = gearAt(lvl, "line");
  console.log(`\n-- ${a.n} (unlocks L${lvl}) rod ${r.maxKg}kg | reel ${e.depth}m/${e.drag}kg | line ${l.kg}kg -> lands ~${l.kg * LINE_FACTOR}kg`);
  const here = FISH.filter((f) => f.areas.includes(a.id));
  let unreachable = 0, brutal = 0;
  for (const f of here) {
    const mk = meanKg(f);
    const reach = f.dep[0] <= Math.min(e.depth, a.maxDepth);
    const rodRisk = f.tag ? 0 : riskFor(mk / r.maxKg);
    const spoolRisk = f.tag ? 0 : riskFor(mk / (e.drag * SPOOL_FACTOR));
    const lineRisk = f.tag ? 0 : riskFor(mk / (l.kg * LINE_FACTOR));
    const worst = Math.max(rodRisk, spoolRisk, lineRisk);
    if (!reach) unreachable++;
    if (reach && worst > 0.6) brutal++;
    const flag = !reach ? "  (too deep)" : worst > 0.6 ? "  <-- brutal" : worst > 0.25 ? "  (risky)" : "";
    console.log(
      `    ${f.n.padEnd(21)} ${f.rar.padEnd(10)} mean ${mk.toFixed(1).padStart(6)}kg  ` +
      `rod ${pct(rodRisk).padStart(4)} spool ${pct(spoolRisk).padStart(4)} line ${pct(lineRisk).padStart(4)}${flag}`
    );
  }
  console.log(`    -> ${here.length} species, ${unreachable} out of depth, ${brutal} near-unlandable at unlock level`);
}

console.log("\n=== top-tier gear vs the biggest fish (max weight, not mean) ===");
const R = GEAR.rod[GEAR.rod.length - 1], E = GEAR.reel[GEAR.reel.length - 1], L = GEAR.line[GEAR.line.length - 1];
for (const f of FISH.filter((f) => f.kg[1] >= 100)) {
  const mx = f.kg[1];
  console.log(
    `    ${f.n.padEnd(21)} max ${String(mx).padStart(5)}kg  rod ${pct(riskFor(mx / R.maxKg, 0.49)).padStart(4)}` +
    `  line ${pct(riskFor(mx / (L.kg * LINE_FACTOR), 0.49)).padStart(4)}${f.tag ? "  (tag & release)" : ""}`
  );
}

console.log("\n=== levelling ===");
let total = 0;
for (let n = 1; n < 30; n++) {
  total += xpForLevel(n);
  if ([2, 5, 9, 14, 20, 25, 29].includes(n)) {
    console.log(`    reach L${String(n + 1).padStart(2)}  ${total.toLocaleString()} xp total`);
  }
}
/* rough xp per good cast at each area */
for (const a of AREAS) {
  const here = FISH.filter((f) => f.areas.includes(a.id));
  const avg = here.reduce((s, f) => s + Math.pow(meanKg(f), 0.6) * RARITY[f.rar].xp, 0) / here.length;
  console.log(`    ${a.n.padEnd(13)} ~${Math.round(avg)} xp per fish (avg species), ~${Math.round(avg * 6)} xp for a 6-fish haul`);
}
