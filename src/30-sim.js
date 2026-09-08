/* ===========================================================================
   Deep Drop - simulation
   =========================================================================== */

function zoneName(d){
  var a = areaById(area), m = maxDepth();
  if(d < m*0.18) return "Shallows";
  if(d < m*0.45) return "Mid water";
  if(d < m*0.75) return "Deep water";
  return a.id === "sl" ? "The canyon" : "The bottom";
}

/* ---- spawning ----------------------------------------------------------- */
function speciesHere(){
  var out = [];
  for(var i=0;i<FISH.length;i++){
    if(FISH[i].areas.indexOf(area) >= 0) out.push(FISH[i]);
  }
  return out;
}
/* Lure pushes the roll toward the rare end; chum pulls cheap fish out. */
function spawnWeight(f, boost){
  var idx = RARITY_ORDER.indexOf(f.rar);
  return RARITY[f.rar].spawn * Math.pow(1 + boost*3, idx/5);
}
function pickSpecies(pool, depth, boost){
  var cand = [], total = 0, i;
  for(i=0;i<pool.length;i++){
    var f = pool[i];
    if(depth < f.dep[0] || depth > f.dep[1]) continue;
    var w = spawnWeight(f, boost);
    cand.push({f:f, w:w});
    total += w;
  }
  if(!cand.length) return null;
  var r = Math.random()*total;
  for(i=0;i<cand.length;i++){
    r -= cand[i].w;
    if(r <= 0) return cand[i].f;
  }
  return cand[cand.length-1].f;
}

function makeEnt(kind, def, depth, x, kg){
  var len = kind === "fish" ? drawLen(def, kg) : (kind === "mine" ? 30 : def.len);
  return {
    kind:kind, def:def, kg:kg || (def.kg || 1), y:depth*PXM, x:x,
    dir: Math.random() < 0.5 ? -1 : 1,
    face: 1,
    len: len,
    sp: (kind === "fish" ? def.sp : (kind === "mine" ? 0 : 0.12)) * (0.72 + Math.random()*0.56),
    boost: 1,
    dartT: 1.5 + Math.random()*5,
    ph: Math.random()*Math.PI*2,
    bobPh: Math.random()*Math.PI*2,
    bobA: kind === "mine" ? 1.5 : (kind === "fish" ? 3 + Math.random()*7 : 2 + Math.random()*3),
    bobSp: 0.6 + Math.random()*1.1,
    oy: 0,
    rad: kind === "fish" ? Math.max(len*0.28, len*bodyRatio(def)*0.58) : (kind === "mine" ? 15 : def.len*0.34)
  };
}

function spawnColumn(){
  ents = [];
  var a = areaById(area);
  var deep = maxDepth();
  var deepLimit = deep + 26;
  var pool = speciesHere();
  var boost = lure().boost;
  var chum = chumStrength(), cullProb = chum*0.80;
  var cullValue = 30 + chum*180;

  /* fish, spread down the column with density rising as it deepens */
  var step = 7;
  for(var d = 9; d < deepLimit; d += step){
    var frac = d/Math.max(60, deep);
    var density = 0.42 + frac*0.55;                 /* chance of a spawn per step */
    if(Math.random() > density) continue;

    var f = pickSpecies(pool, d, boost);
    if(!f) continue;
    var kg = rollKg(f);
    if(cullProb > 0 && fishValue(f, kg) < cullValue && Math.random() < cullProb) continue;

    var x = 0.10 + Math.random()*0.80;
    /* baitfish move in shoals */
    if(f.kg[1] <= 1.5 && Math.random() < 0.5){
      var n = 2 + Math.floor(Math.random()*4);
      for(var q=0;q<n;q++){
        var sd = Math.max(9, d + (Math.random()-0.5)*13);
        var sx = Math.max(0.07, Math.min(0.93, x + (Math.random()-0.5)*0.20));
        ents.push(makeEnt("fish", f, sd, sx, rollKg(f)));
      }
      continue;
    }
    ents.push(makeEnt("fish", f, d, x, kg));
  }

  /* junk, shallow only */
  var junkN = Math.round((3 + Math.round(Math.min(deep,200)/45)) * (1 - debrisCut()*0.90));
  for(var j=0;j<junkN;j++){
    var jd = JUNK[Math.floor(Math.random()*JUNK.length)];
    var dd = 14 + Math.random()*Math.max(20, Math.min(deepLimit-14, 170));
    ents.push(makeEnt("junk", jd, dd, 0.10 + Math.random()*0.80, jd.kg));
  }

  /* mines - deep water only, and only in the rougher fisheries */
  if(a.bombDen > 0 && deep > a.bombFrom){
    var span = deep - a.bombFrom;
    var mines = Math.round(span * a.bombDen * (1 - mineCut()*0.85));
    for(var m=0;m<mines;m++){
      var md = a.bombFrom + Math.random()*span;
      ents.push(makeEnt("mine", {n:"Sea mine"}, md, 0.10 + Math.random()*0.80, 0));
    }
  }

  ents.sort(function(a2,b2){ return a2.y - b2.y; });
}

/* ---- risk --------------------------------------------------------------- */
/* Below 0.80 of a limit nothing happens; from there it ramps, and past the
   limit it becomes very likely. Steady hands shaves the whole curve down. */
function riskFor(ratio){
  if(ratio <= 0.80) return 0;
  var r = ratio <= 1
    ? (ratio - 0.80) / 0.20 * 0.35
    : 0.55 + (ratio - 1) * 0.5;
  return Math.max(0, Math.min(0.97, r * (1 - snapRelief())));
}
/* Tagged fish are released boatside rather than lifted, so they put no load
   on the rig - that is why a great white is landable at all. */
function haulKg(){
  var w = 0;
  for(var i=0;i<haul.length;i++) if(!haul[i].tag) w += haul[i].kg;
  return w;
}
function loadRatio(){ return haulKg() / Math.max(0.1, lineCapacity()); }

/* ---- run flow ----------------------------------------------------------- */
function cast(){
  if(mode !== "idle" || view !== "fish") return;
  spawnColumn();
  haul = []; trail = []; runFail = null; sapperUsed = false;
  hook.x = W*0.5; hook.y = 0; hook.vx = 0;
  mode = "down";
  casts++;
  splash();
  renderHaul(); renderShopTab(); syncGauges();
  elPrompt.style.display = "none";
  elBannerWrap.classList.remove("show");
}
function startReel(){
  mode = "up";
  shake = reduceMotion ? 0 : 9;
  renderHaul();
}

function endRun(kind, detail){
  runFail = {kind:kind, detail:detail};
  mode = "cashout";
  sFail();
  shake = reduceMotion ? 0 : 16;

  var titles = {
    line:"Line snapped",
    rod:"Rod snapped",
    spool:"Spooled",
    mine:"Mine!"
  };
  elBanner.className = "banner dud";
  elBanner.innerHTML = '<span class="big">' + titles[kind] + '</span>' +
                       '<span class="small">' + esc(detail) + '</span>';
  elBannerWrap.classList.add("show");
  save(); renderAll();

  setTimeout(function(){
    elBannerWrap.classList.remove("show");
    mode = "idle"; haul = []; trail = []; runFail = null;
    spawnColumn();
    elPrompt.style.display = "";
    renderHaul(); renderShopTab(); syncGauges();
  }, 2100);
}

function catchEnt(e){
  if(e.kind === "mine"){
    if(Math.random() < sapperChance() && !sapperUsed){
      sapperUsed = true;
      shake = reduceMotion ? 0 : 12;
      sSapper();
      flashMsg("Mine shrugged off");
      return true;                                   /* survived, mine removed */
    }
    endRun("mine", "You hit a sea mine at " + Math.round(e.y/PXM) + " m. The haul is gone.");
    return false;
  }

  if(e.kind === "fish" && !e.def.tag){
    /* rod - a single fish too heavy for the blank */
    if(Math.random() < riskFor(e.kg / rod().maxKg)){
      endRun("rod", e.def.n + " at " + fmtKg(e.kg) + " on a " + rod().spec + " rod.");
      return false;
    }
    /* reel - a big fish runs and empties the spool */
    if(Math.random() < riskFor(e.kg / spoolCapacity())){
      endRun("spool", e.def.n + " at " + fmtKg(e.kg) + " ran " + reel().n + " dry.");
      return false;
    }
  }

  var kg = e.kind === "fish" ? e.kg : (e.def.kg || 1);
  var val = e.kind === "fish" ? Math.round(fishValue(e.def, kg) * priceMult() * comboAt(haul.length)) : 0;
  var gained = e.kind === "fish" ? fishXp(e.def, kg) : 0;

  haul.push({n:e.def.n, v:val, kg:kg, xp:gained, d:Math.round(e.y/PXM),
             kind:e.kind, def:e.def, rar:e.def.rar, tag:!!e.def.tag});

  /* line - the total load is what breaks it */
  if(Math.random() < riskFor(loadRatio())){
    endRun("line", fmtKg(haulKg()) + " of fish on " + line().n + ".");
    return false;
  }

  sCatch(haul.length);
  renderHaul(); syncGauges();
  return true;
}
function comboAt(i){ return Math.min(comboCap(), 1 + 0.08*i); }

function cashOut(){
  mode = "cashout";
  var total = 0, gainedXp = 0, fishN = 0, biggest = 0, bigName = "";
  for(var i=0;i<haul.length;i++){
    total += haul[i].v;
    gainedXp += haul[i].xp;
    if(haul[i].kind === "fish"){
      fishN++;
      if(haul[i].kg > biggest){ biggest = haul[i].kg; bigName = haul[i].n; }
    }
  }
  cash += total;
  var isPB = total > 0 && total > best;
  if(isPB) best = total;
  var levels = grantXp(gainedXp);

  if(levels.length) sLevel(); else if(isPB) sPB(); else if(total > 0) sCash(); else sDud();

  elBanner.className = "banner" + (total > 0 || gainedXp > 0 ? (isPB ? " pb" : "") : " dud");
  if(total > 0 || gainedXp > 0){
    var sub = fishN + " fish";
    if(biggest > 0) sub += " &middot; best " + esc(bigName) + " " + fmtKg(biggest);
    sub += " &middot; " + gainedXp + " xp";
    if(isPB) sub = "Personal best &middot; " + sub;
    elBanner.innerHTML = '<span class="big">' + rand(total) + '</span><span class="small">' + sub + '</span>' +
      (levels.length ? '<span class="lvlup">Level ' + levels[levels.length-1] + '</span>' : '');
  } else {
    elBanner.innerHTML = '<span class="big">Empty hook</span><span class="small">Nothing on the line</span>';
  }
  elBannerWrap.classList.add("show");

  save(); pushScore(); renderAll();

  setTimeout(function(){
    elBannerWrap.classList.remove("show");
    mode = "idle"; haul = []; trail = [];
    spawnColumn();
    elPrompt.style.display = "";
    renderHaul(); renderShopTab(); syncGauges();
  }, levels.length ? 2400 : 1700);
}

/* ---- buying ------------------------------------------------------------- */
function buySkill(k){
  if(mode !== "idle" || lvl[k] >= MAXLVL || !skillUnlocked(k)) return;
  var c = skillCost(k);
  if(cash < c) return;
  cash -= c; cashShown = cash; lvl[k]++;
  sBuy(); save(); spawnColumn(); renderAll();
}
function buyGear(kind, id){
  if(mode !== "idle") return;
  var g = gearById(kind, id);
  if(owned[kind].indexOf(id) >= 0){ equipGear(kind, id); return; }
  if(plevel < g.lvl || cash < g.cost) return;
  cash -= g.cost; cashShown = cash;
  owned[kind].push(id);
  equip[kind] = id;
  sBuy(); save(); spawnColumn(); renderAll();
}
function equipGear(kind, id){
  if(mode !== "idle" || owned[kind].indexOf(id) < 0) return;
  equip[kind] = id;
  sEquip(); save(); spawnColumn(); renderAll();
}
function buySkin(kind, id){
  if(mode !== "idle") return;
  var list = kind === "char" ? CHAR_SKINS : BOAT_SKINS;
  var have = kind === "char" ? ownedChar : ownedBoat;
  var item = null;
  for(var i=0;i<list.length;i++) if(list[i].id === id) item = list[i];
  if(!item) return;
  if(have.indexOf(id) >= 0){ equipSkin(kind, id); return; }
  if(plevel < item.lvl || cash < item.cost) return;
  cash -= item.cost; cashShown = cash;
  have.push(id);
  if(kind === "char") charSkin = id; else boatSkin = id;
  sBuy(); save(); renderAll();
}
function equipSkin(kind, id){
  var have = kind === "char" ? ownedChar : ownedBoat;
  if(have.indexOf(id) < 0) return;
  if(kind === "char") charSkin = id; else boatSkin = id;
  sEquip(); save(); renderAll();
}
function setDial(k, v){
  if(lvl[k] < MAXLVL) return;
  dial[k] = Math.min(100, Math.max(0, Math.round(v/10)*10));
  save(); spawnColumn(); syncGauges();
}
function selectArea(id){
  if(mode !== "idle") return;
  var a = areaById(id);
  if(plevel < a.lvl) return;
  area = id;
  sEquip(); save(); spawnColumn(); renderAll();
}

/* ---- per-frame ---------------------------------------------------------- */
function step(dt){
  t += dt;
  if(shake > 0) shake = Math.max(0, shake - dt*22);
  if(flashLine > 0) flashLine = Math.max(0, flashLine - dt*1.6);

  var live = (mode === "down" || mode === "up");
  var margin = 0.055;

  for(var i=0;i<ents.length;i++){
    var e = ents[i];
    if(e.kind === "mine"){
      e.bobPh += dt * e.bobSp;
      e.oy = Math.sin(e.bobPh) * e.bobA;
      continue;
    }

    e.dartT -= dt;
    if(e.dartT <= 0){ e.dartT = 2 + Math.random()*6; e.boost = 1.7 + Math.random()*1.1; }
    e.boost += (1 - e.boost) * Math.min(1, dt*1.6);

    if(live && e.kind === "fish"){
      var fdx = e.x*W - hook.x, fdy = (e.y + e.oy) - hook.y;
      var d2 = fdx*fdx + fdy*fdy, near = 96 + e.rad;
      if(d2 < near*near){
        e.dir = fdx >= 0 ? 1 : -1;
        e.boost = Math.max(e.boost, 2.4);
      }
    }

    e.x += e.dir * e.sp * e.boost * dt * 0.055;
    if(e.x < margin){ e.x = margin; e.dir = 1; }
    if(e.x > 1-margin){ e.x = 1-margin; e.dir = -1; }

    e.face += (e.dir - e.face) * Math.min(1, dt*7);
    e.ph += dt * (2.2 + e.sp*e.boost);
    e.bobPh += dt * e.bobSp;
    e.oy = Math.sin(e.bobPh) * e.bobA;
  }

  if(live){
    var acc = 0;
    if(keyL) acc -= 1;
    if(keyR) acc += 1;
    if(pointerX !== null && !keyL && !keyR){
      acc = Math.max(-1, Math.min(1, (pointerX - hook.x)/55));
    }
    hook.vx += acc * dt * 42;
    hook.vx *= Math.pow(0.86, dt*7.5);
    hook.vx = Math.max(-6.5, Math.min(6.5, hook.vx));
    hook.x += hook.vx * dt * 34;
    var pad = gaffR()*0.6 + 6;
    if(hook.x < pad){ hook.x = pad; hook.vx = 0; }
    if(hook.x > W-pad){ hook.x = W-pad; hook.vx = 0; }

    if(mode === "down"){
      hook.y += dropSpeed() * dt * 60;
      var dm = hook.y/PXM;
      if(dm > deepest) deepest = Math.round(dm);
      if(dm >= maxDepth()){
        hook.y = maxDepth()*PXM;
        flashLine = 1; sLineOut(); startReel();
      }
    } else {
      var sp = Math.max(1.1, reelBase() - haulKg()*weightPen());
      hook.y -= sp * dt * 60;
      if(hook.y <= 0){ hook.y = 0; cashOut(); }
    }

    trail.unshift({x:hook.x, y:hook.y});
    if(trail.length > 240) trail.pop();

    var hr = gaffR()*0.5 + 3;
    for(var j=ents.length-1;j>=0;j--){
      var en = ents[j];
      var dx = en.x*W - hook.x, dy = (en.y + en.oy) - hook.y;
      var rr = hr + en.rad;
      if(dx*dx + dy*dy < rr*rr){
        var wasDown = mode === "down";
        ents.splice(j,1);
        var alive = catchEnt(en);
        if(!alive) return;                       /* run ended inside catchEnt */
        if(wasDown){ startReel(); break; }
      }
    }
  }

  camTarget = live ? hook.y - H*0.40 : -70;
  var lo = -70, hi = Math.max(lo, maxDepth()*PXM + 90 - H);
  camTarget = Math.max(lo, Math.min(hi, camTarget));
  camY += (camTarget - camY) * Math.min(1, dt*7);

  if(cashShown !== cash){
    var d2c = cash - cashShown;
    cashShown += (d2c > 0 ? 1 : -1) * Math.max(1, Math.abs(d2c) * Math.min(1, dt*5));
    if(Math.abs(cash - cashShown) < 1.5) cashShown = cash;
    elCash.textContent = Math.round(cashShown).toLocaleString("en-ZA");
    if(cashShown === cash){ renderShopTab(); renderSkillsTab(); }
  }
}
