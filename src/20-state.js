/* ===========================================================================
   Deep Drop - state, progression and persistence
   =========================================================================== */

var lvl = {};                                    /* skill levels */
for(var _sk in SKILLS) lvl[_sk] = 1;

var owned = {rod:["r1"], reel:["e1"], line:["l1"], lure:["u1"]};
var equip = {rod:"r1", reel:"e1", line:"l1", lure:"u1"};

var cash = 0, cashShown = 0, best = 0, deepest = 0, casts = 0;
var xp = 0, plevel = 1;
var area = "pa";
var profile = "", skipperView = "main", skipperMsg = null;
var view = "fish";                               /* fish | shop | skills | map */
var shopKind = "rod";

var mode = "idle";                               /* idle | down | up | cashout */
var ents = [], haul = [], trail = [];
var hook = {x:0, y:0, vx:0};
var camY = -70, camTarget = -70;
var keyL = false, keyR = false, pointerX = null;
var shake = 0, flashLine = 0, t = 0, runFail = null, sapperUsed = false;
var PXM = 6;
var W = 480, H = 640, dpr = 1;
var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---- lookups ------------------------------------------------------------ */
function gearById(kind, id){
  var list = GEAR[kind];
  for(var i=0;i<list.length;i++) if(list[i].id === id) return list[i];
  return list[0];
}
function rod(){ return gearById("rod", equip.rod); }
function reel(){ return gearById("reel", equip.reel); }
function line(){ return gearById("line", equip.line); }
function lure(){ return gearById("lure", equip.lure); }
function areaById(id){
  for(var i=0;i<AREAS.length;i++) if(AREAS[i].id === id) return AREAS[i];
  return AREAS[0];
}
function fishById(id){
  for(var i=0;i<FISH.length;i++) if(FISH[i].id === id) return FISH[i];
  return null;
}

/* ---- skills ------------------------------------------------------------- */
function sk(k){ return SKILLS[k].base + (lvl[k]-1)*SKILLS[k].step; }
function skillUnlocked(k){ return plevel >= SKILLS[k].lvl; }
function skillCost(k){
  var s = SKILLS[k];
  return Math.round(s.cost*Math.pow(s.growth, lvl[k]-1)/10)*10;
}

/* ---- derived stats ------------------------------------------------------ */
function maxDepth(){ return Math.min(reel().depth, areaById(area).maxDepth); }
function gaffR(){ return sk("hookset"); }
function dropSpeed(){ return 2.05 * (1 - sk("thumb")/100*0.55); }
function reelBase(){ return reel().spd; }
function weightPen(){ return 0.020 * (1 - sk("deckhand")/100); }
function comboCap(){ return sk("livewell"); }
function chumStrength(){ return sk("chum")/100; }
function senseRange(){ return sk("sense"); }
function snapRelief(){ return sk("steady")/100; }
function priceMult(){ return lure().val * (1 + sk("monger")/100); }
function sapperChance(){ return sk("sapper")/100; }

/* the weight the whole rig handles before something gives */
function lineCapacity(){ return line().kg * LINE_FACTOR; }
function rigLimit(){ return Math.min(rod().maxKg, lineCapacity()); }

/* ---- value, xp and weight ----------------------------------------------- */
function rollKg(f){
  var lo = f.kg[0], hi = f.kg[1];
  /* squared bias: most fish sit near the small end, a big one is an event */
  var u = Math.pow(Math.random(), 2.2);
  return Math.round((lo + (hi-lo)*u) * 100)/100;
}
function fishValue(f, kg){
  if(f.tag) return 0;                             /* tag-and-release species */
  return Math.round(kg * f.rpk * RARITY[f.rar].val);
}
function fishXp(f, kg){
  return Math.round(Math.pow(Math.max(0.05, kg), 0.6) * RARITY[f.rar].xp);
}
function drawLen(f, kg){
  var span = f.kg[1] - f.kg[0];
  var u = span > 0 ? (kg - f.kg[0]) / span : 0;
  return f.len[0] + (f.len[1] - f.len[0]) * Math.pow(Math.max(0, Math.min(1, u)), 0.5);
}

/* ---- player level ------------------------------------------------------- */
function xpIntoLevel(){ return xp - xpTotalTo(plevel); }
function xpNeeded(){ return xpForLevel(plevel); }
function grantXp(n){
  xp += n;
  var gained = [];
  while(plevel < MAX_PLAYER_LVL && xp >= xpTotalTo(plevel + 1)){
    plevel++;
    gained.push(plevel);
  }
  return gained;
}
function unlockedAreas(){
  var out = [];
  for(var i=0;i<AREAS.length;i++) if(plevel >= AREAS[i].lvl) out.push(AREAS[i]);
  return out;
}

/* ---- storage ------------------------------------------------------------ */
var PKEY = "deepdrop.profiles.v2", CKEY = "deepdrop.current.v2";

var storageOK = (function(){
  try{
    var k = "deepdrop.probe";
    localStorage.setItem(k, "1");
    var v = localStorage.getItem(k);
    localStorage.removeItem(k);
    return v === "1";
  }catch(e){ return false; }
})();

function readJSON(key, fallback){
  try{ var r = localStorage.getItem(key); return r ? (JSON.parse(r) || fallback) : fallback; }
  catch(e){ return fallback; }
}
function allProfiles(){
  var o = readJSON(PKEY, {});
  return (o && typeof o === "object" && !(o instanceof Array)) ? o : {};
}
function writeProfiles(o){ try{ localStorage.setItem(PKEY, JSON.stringify(o)); }catch(e){} }

function snapshot(){
  var L = {};
  for(var k in lvl) L[k] = lvl[k];
  return {lvl:L, owned:{rod:owned.rod.slice(), reel:owned.reel.slice(),
                        line:owned.line.slice(), lure:owned.lure.slice()},
          equip:{rod:equip.rod, reel:equip.reel, line:equip.line, lure:equip.lure},
          cash:cash, best:best, deepest:deepest, casts:casts,
          xp:xp, plevel:plevel, area:area, ts:Date.now()};
}
function applyState(s){
  for(var k in lvl) lvl[k] = 1;
  owned = {rod:["r1"], reel:["e1"], line:["l1"], lure:["u1"]};
  equip = {rod:"r1", reel:"e1", line:"l1", lure:"u1"};
  cash = 0; best = 0; deepest = 0; casts = 0; xp = 0; plevel = 1; area = "pa";

  if(s && typeof s === "object"){
    if(s.lvl){ for(var k2 in lvl){ if(typeof s.lvl[k2] === "number") lvl[k2] = Math.min(MAXLVL, Math.max(1, s.lvl[k2]|0)); } }
    if(s.owned){
      for(var kind in owned){
        if(s.owned[kind] && s.owned[kind].length){
          var keep = [];
          for(var i=0;i<s.owned[kind].length;i++){
            var g = s.owned[kind][i];
            for(var j=0;j<GEAR[kind].length;j++) if(GEAR[kind][j].id === g){ keep.push(g); break; }
          }
          if(keep.indexOf(GEAR[kind][0].id) < 0) keep.unshift(GEAR[kind][0].id);
          owned[kind] = keep;
        }
      }
    }
    if(s.equip){
      for(var kind2 in equip){
        if(s.equip[kind2] && owned[kind2].indexOf(s.equip[kind2]) >= 0) equip[kind2] = s.equip[kind2];
      }
    }
    cash = Math.max(0, s.cash|0);
    best = Math.max(0, s.best|0);
    deepest = Math.max(0, s.deepest|0);
    casts = Math.max(0, s.casts|0);
    xp = Math.max(0, s.xp|0);
    plevel = Math.min(MAX_PLAYER_LVL, Math.max(1, s.plevel|0 || 1));
    if(s.area && areaById(s.area).id === s.area && plevel >= areaById(s.area).lvl) area = s.area;
  }
  cashShown = cash;
}
function save(){
  if(!profile) return;
  var all = allProfiles();
  all[profile] = snapshot();
  writeProfiles(all);
  try{ localStorage.setItem(CKEY, profile); }catch(e){}
}
function switchTo(name, state){
  profile = name;
  applyState(state !== undefined ? state : allProfiles()[name]);
  save();
  skipperView = "main"; skipperMsg = null;
  spawnColumn(); renderAll(); pushScore();
}
function load(){
  var all = allProfiles();
  var cur = "";
  try{ cur = localStorage.getItem(CKEY) || ""; }catch(e){}
  if(cur && all[cur]){ profile = cur; applyState(all[cur]); return; }
  var names = Object.keys(all);
  if(names.length){ profile = names[0]; applyState(all[profile]); }
}

/* ---- save codes ---------------------------------------------------------
   DD2-<skills>-<gear>-<cash>-<best>-<deepest>-<casts>-<xp>-<area+lvl>-<check>
   Base36 throughout so a code is all caps and safe to read down a phone.
   ------------------------------------------------------------------------ */
function checksum(s){
  var c = 0;
  for(var i=0;i<s.length;i++) c = (c*31 + s.charCodeAt(i)) % 1296;
  var out = c.toString(36).toUpperCase();
  return out.length < 2 ? "0" + out : out;
}
function b36(n){ return Math.max(0, Math.round(n)).toString(36).toUpperCase(); }

function packSkills(){
  var v = 0;
  for(var i=0;i<SKILL_ORDER.length;i++) v += (lvl[SKILL_ORDER[i]]-1) * Math.pow(8, i);
  return v;
}
function unpackSkills(v){
  var out = {};
  for(var i=0;i<SKILL_ORDER.length;i++){
    out[SKILL_ORDER[i]] = Math.floor(v / Math.pow(8, i)) % 8 + 1;
  }
  return out;
}
/* gear: 4 tiers of 3 bits (highest owned) + 4 equipped indexes of 3 bits */
function packGear(){
  var kinds = ["rod","reel","line","lure"], v = 0;
  for(var i=0;i<4;i++){
    var k = kinds[i], top = 0, eq = 0;
    for(var j=0;j<GEAR[k].length;j++){
      if(owned[k].indexOf(GEAR[k][j].id) >= 0) top = j;
      if(equip[k] === GEAR[k][j].id) eq = j;
    }
    v += top * Math.pow(8, i) + eq * Math.pow(8, i+4);
  }
  return v;
}
function unpackGear(v){
  var kinds = ["rod","reel","line","lure"];
  var o = {rod:[], reel:[], line:[], lure:[]}, e = {};
  for(var i=0;i<4;i++){
    var k = kinds[i];
    var top = Math.floor(v / Math.pow(8, i)) % 8;
    var eq  = Math.floor(v / Math.pow(8, i+4)) % 8;
    top = Math.min(top, GEAR[k].length-1);
    eq  = Math.min(eq,  top);
    for(var j=0;j<=top;j++) o[k].push(GEAR[k][j].id);
    e[k] = GEAR[k][eq].id;
  }
  return {owned:o, equip:e};
}
function encodeSave(){
  var areaIdx = 0;
  for(var i=0;i<AREAS.length;i++) if(AREAS[i].id === area) areaIdx = i;
  var body = [b36(packSkills()), b36(packGear()), b36(cash), b36(best),
              b36(deepest), b36(casts), b36(xp), b36(areaIdx*64 + plevel)].join("-");
  return "DD2-" + body + "-" + checksum(body);
}
function decodeSave(code){
  try{
    var parts = String(code).toUpperCase().replace(/[^A-Z0-9-]/g,"").split("-")
                  .filter(function(p){ return p.length; });
    if(parts.length !== 10 || parts[0] !== "DD2") return null;
    var body = parts.slice(1,9).join("-");
    if(checksum(body) !== parts[9]) return null;
    var a = parts.slice(1,9).map(function(p){ return parseInt(p, 36); });
    if(a.some(function(n){ return isNaN(n) || n < 0; })) return null;
    if(a[0] > Math.pow(8, SKILL_ORDER.length) || a[1] > Math.pow(8, 8)) return null;

    var g = unpackGear(a[1]);
    var pl = a[7] % 64, ai = Math.floor(a[7] / 64);
    if(pl < 1 || pl > MAX_PLAYER_LVL || ai < 0 || ai >= AREAS.length) return null;

    return {lvl:unpackSkills(a[0]), owned:g.owned, equip:g.equip,
            cash:a[2], best:a[3], deepest:a[4], casts:a[5], xp:a[6],
            plevel:pl, area:AREAS[ai].id};
  }catch(e){ return null; }
}
