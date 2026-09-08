/* ===========================================================================
   Deep Drop - interface
   =========================================================================== */

var cv = document.getElementById("cv");
var ctx = cv.getContext("2d");
var sounder = document.getElementById("sounder");
var elCash = document.getElementById("cash"), elCash2 = document.getElementById("cash2"),
    elCash3 = document.getElementById("cash3");
var elDepth = document.getElementById("depth"), elZone = document.getElementById("zone");
var elGDepth = document.getElementById("gDepth"), elGLine = document.getElementById("gLine");
var elGCount = document.getElementById("gCount"), elGMult = document.getElementById("gMult");
var elLoadBar = document.getElementById("loadBar"), elLoadFill = document.getElementById("loadFill"),
    elLoadNum = document.getElementById("loadNum");
var elList = document.getElementById("list"), elListTitle = document.getElementById("listTitle"),
    elListTag = document.getElementById("listTag");
var elHaulValue = document.getElementById("haulValue");
var elPrompt = document.getElementById("prompt"), elBannerWrap = document.getElementById("bannerWrap"),
    elBanner = document.getElementById("banner"), elFlash = document.getElementById("flash");
var elMute = document.getElementById("mute");
var elSkipBody = document.getElementById("skipperBody"), elSkipTag = document.getElementById("skipperTag");
var elLb = document.getElementById("leaderboard"), elLbTag = document.getElementById("lbTag");
var elPlevel = document.getElementById("plevel"), elXpFill = document.getElementById("xpfill"),
    elXpNum = document.getElementById("xpnum"), elAreaName = document.getElementById("areaName");
var elRigTag = document.getElementById("rigTag");
var elNav = document.getElementById("nav");
var elKindTabs = document.getElementById("kindtabs"), elKindBlurb = document.getElementById("kindblurb"),
    elGearGrid = document.getElementById("gearGrid");
var elSkillGrid = document.getElementById("skillGrid");
var elMapGrid = document.getElementById("mapGrid"), elSpecBody = document.getElementById("specBody");
var elCash4 = document.getElementById("cash4");
var elSkinTabs = document.getElementById("skinTabs"), elSkinGrid = document.getElementById("skinGrid");
var elCrewCv = document.getElementById("crewCv"), elCrewCaption = document.getElementById("crewCaption");
var skinKind = "char";
var VIEWS = {fish:document.getElementById("viewFish"), shop:document.getElementById("viewShop"),
             skills:document.getElementById("viewSkills"), map:document.getElementById("viewMap"),
             crew:document.getElementById("viewCrew")};

/* ---- helpers ------------------------------------------------------------ */
function rand(n){ return "R " + Math.round(n).toLocaleString("en-ZA"); }
function esc(s){
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
                  .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
}
function fmtKg(kg){
  if(kg < 1) return Math.round(kg*1000) + " g";
  if(kg < 10) return kg.toFixed(1) + " kg";
  return Math.round(kg) + " kg";
}
function rarChip(r){
  return '<span class="rc" style="color:' + RARITY[r].c + '">' + RARITY[r].n + '</span>';
}
var flashT = null;
function flashMsg(txt){
  elFlash.textContent = txt;
  elFlash.classList.add("show");
  if(flashT) clearTimeout(flashT);
  flashT = setTimeout(function(){ elFlash.classList.remove("show"); }, 1400);
}

/* ---- sound -------------------------------------------------------------- */
var actx = null, muted = false;
function AC(){
  try{
    if(!actx){ var C = window.AudioContext || window.webkitAudioContext; if(!C) return null; actx = new C(); }
    if(actx.state === "suspended") actx.resume();
    return actx;
  }catch(e){ return null; }
}
function tone(freq, dur, type, vol, glide){
  if(muted) return; var a = AC(); if(!a) return;
  var o = a.createOscillator(), g = a.createGain();
  o.type = type || "sine"; o.frequency.setValueAtTime(freq, a.currentTime);
  if(glide) o.frequency.exponentialRampToValueAtTime(Math.max(30, glide), a.currentTime + dur);
  g.gain.setValueAtTime(0.0001, a.currentTime);
  g.gain.exponentialRampToValueAtTime(vol || 0.10, a.currentTime + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + dur);
  o.connect(g); g.connect(a.destination); o.start(); o.stop(a.currentTime + dur + 0.02);
}
function noise(dur, vol, from, to){
  if(muted) return; var a = AC(); if(!a) return;
  var n = Math.floor(a.sampleRate * dur), buf = a.createBuffer(1, n, a.sampleRate), d = buf.getChannelData(0);
  for(var i=0;i<n;i++) d[i] = (Math.random()*2-1) * Math.pow(1 - i/n, 2.2);
  var src = a.createBufferSource(); src.buffer = buf;
  var f = a.createBiquadFilter(); f.type = "lowpass";
  f.frequency.setValueAtTime(from, a.currentTime);
  f.frequency.exponentialRampToValueAtTime(to, a.currentTime + dur);
  var g = a.createGain(); g.gain.value = vol;
  src.connect(f); f.connect(g); g.connect(a.destination); src.start();
}
function splash(){ noise(0.32, 0.20, 2400, 260); }
function sCatch(i){ tone(360 + Math.min(i,16)*40, 0.13, "square", 0.075); }
function sCash(){ tone(523,0.13,"triangle",0.10); setTimeout(function(){tone(659,0.13,"triangle",0.10);},95); setTimeout(function(){tone(880,0.24,"triangle",0.10);},190); }
function sPB(){ sCash(); setTimeout(function(){tone(1175,0.30,"triangle",0.10);},300); }
function sLevel(){ [523,659,784,1047].forEach(function(f,i){ setTimeout(function(){ tone(f,0.22,"triangle",0.10); }, i*110); }); }
function sBuy(){ tone(392,0.10,"triangle",0.09); setTimeout(function(){tone(784,0.20,"triangle",0.09);},80); }
function sEquip(){ tone(587,0.09,"triangle",0.07); }
function sLineOut(){ tone(150,0.28,"sawtooth",0.06,80); }
function sDud(){ tone(190,0.22,"sawtooth",0.05,110); }
function sFail(){ noise(0.45, 0.24, 1400, 90); tone(220,0.42,"sawtooth",0.09,60); }
function sSapper(){ noise(0.22, 0.16, 900, 200); tone(660,0.14,"square",0.07); }

/* ---- navigation --------------------------------------------------------- */
function setView(v){
  view = v;
  for(var k in VIEWS) VIEWS[k].hidden = (k !== v);
  var btns = elNav.querySelectorAll("button[data-view]");
  for(var i=0;i<btns.length;i++){
    btns[i].classList.toggle("on", btns[i].getAttribute("data-view") === v);
  }
  if(v === "shop") renderShopTab();
  if(v === "skills") renderSkillsTab();
  if(v === "map") renderMapTab();
  if(v === "crew") renderCrewTab();
  if(v === "fish") resize();
}
elNav.addEventListener("click", function(ev){
  var b = ev.target.closest("button[data-view]");
  if(!b) return;
  AC();
  setView(b.getAttribute("data-view"));
  b.blur();
});

/* ---- header ------------------------------------------------------------- */
function renderHeader(){
  elPlevel.textContent = plevel;
  elAreaName.textContent = areaById(area).n;
  var into = xpIntoLevel(), need = xpNeeded();
  if(plevel >= MAX_PLAYER_LVL){
    elXpFill.style.width = "100%";
    elXpNum.textContent = "max level";
  } else {
    elXpFill.style.width = Math.max(0, Math.min(100, into/need*100)) + "%";
    elXpNum.textContent = into.toLocaleString("en-ZA") + " / " + need.toLocaleString("en-ZA") + " xp";
  }
  var c = Math.round(cashShown).toLocaleString("en-ZA");
  elCash.textContent = c; elCash2.textContent = c; elCash3.textContent = c;
  if(elCash4) elCash4.textContent = c;
  elRigTag.textContent = rod().n.split(" ")[0] + " · " + line().n;
}

/* ---- gauges ------------------------------------------------------------- */
function syncGauges(){
  var dm = Math.round(hook.y/PXM);
  elDepth.textContent = dm + " m";
  elGDepth.innerHTML = dm + '<small>m</small>';
  elGLine.innerHTML = Math.round(maxDepth()) + '<small>m</small>';
  elGCount.textContent = String(haul.length);
  elGMult.innerHTML = "&times;" + comboAt(haul.length).toFixed(2);
  elZone.textContent = zoneName(dm);

  var kg = haulKg(), lim = lineCapacity(), ratio = kg/lim;
  elLoadFill.style.width = Math.max(0, Math.min(100, ratio*100)) + "%";
  elLoadBar.className = "bar" + (ratio > 0.95 ? " crit" : ratio > 0.75 ? " warn" : "");
  elLoadNum.textContent = fmtKg(kg) + " / " + Math.round(lim) + " kg";
  renderHeader();
}

/* ---- haul list ---------------------------------------------------------- */
function renderHaul(){
  if(mode === "idle" || mode === "cashout"){
    elListTitle.textContent = "This haul";
    elListTag.textContent = "Waiting";
    elList.innerHTML = '<div class="empty">Nothing on the line. Cast to start a run &mdash; ' +
      'the first thing you touch on the way down ends the drop.</div>';
    elHaulValue.textContent = rand(0);
    return;
  }
  elListTitle.textContent = "This haul";
  elListTag.textContent = mode === "down" ? "Dropping" : "Reeling in";
  if(!haul.length){
    elList.innerHTML = '<div class="empty">Hook is clean. Thread the gaps to reach the deep money.</div>';
    elHaulValue.textContent = rand(0);
    return;
  }
  var h = "", total = 0;
  for(var i=haul.length-1;i>=0;i--){
    var c = haul[i]; total += c.v;
    h += '<div class="row">' +
           '<span class="nm">' + esc(c.n) +
             (c.rar ? ' ' + rarChip(c.rar) : '') + '</span>' +
           '<span class="kg">' + fmtKg(c.kg) + '</span>' +
           '<span class="val' + (c.v ? '' : ' zero') + '">' +
             (c.tag ? "tagged" : (c.v ? rand(c.v) : "&mdash;")) + '</span>' +
         '</div>';
  }
  elList.innerHTML = h;
  elHaulValue.textContent = rand(total);
}

/* ---- shop --------------------------------------------------------------- */
function renderShopTab(){
  var tabs = "";
  for(var i=0;i<GEAR_KINDS.length;i++){
    var k = GEAR_KINDS[i];
    tabs += '<button type="button" data-kind="' + k.k + '"' +
            (shopKind === k.k ? ' class="on"' : '') + '>' + k.n + '</button>';
  }
  elKindTabs.innerHTML = tabs;
  var kd = GEAR_KINDS.filter(function(g){ return g.k === shopKind; })[0];
  elKindBlurb.textContent = kd ? kd.blurb : "";

  var cur = gearById(shopKind, equip[shopKind]);
  var list = GEAR[shopKind], h = "";
  for(var j=0;j<list.length;j++){
    var g = list[j];
    var have = owned[shopKind].indexOf(g.id) >= 0;
    var on = equip[shopKind] === g.id;
    var locked = plevel < g.lvl;
    var afford = cash >= g.cost;

    var stats = "";
    if(shopKind === "rod")  stats = statChip("Handles", g.maxKg + " kg", cur.maxKg, g.maxKg);
    if(shopKind === "reel") stats = statChip("Depth", g.depth + " m", cur.depth, g.depth) +
                                    statChip("Drag", g.drag + " kg", cur.drag, g.drag) +
                                    statChip("Before spooling", (g.holds || g.drag*SPOOL_FACTOR) + " kg", cur.holds || cur.drag*SPOOL_FACTOR, g.holds || g.drag*SPOOL_FACTOR) +
                                    statChip("Retrieve", g.spd.toFixed(1) + " kn", cur.spd, g.spd);
    if(shopKind === "line") stats = statChip("Class", g.kg + " kg", cur.kg, g.kg) +
                                    statChip("Lands about", (g.kg*LINE_FACTOR) + " kg", cur.kg, g.kg);
    if(shopKind === "lure") stats = statChip("Rarity pull", "+" + Math.round(g.boost*100) + "%", cur.boost, g.boost) +
                                    statChip("Price", "x" + g.val.toFixed(2), cur.val, g.val);

    var btn;
    if(locked) btn = '<span class="lock">Unlocks at level ' + g.lvl + '</span>' +
                     '<button class="buy" type="button" disabled>' + rand(g.cost) + '</button>';
    else if(on) btn = '<button class="buy on" type="button" disabled>Equipped</button>';
    else if(have) btn = '<button class="buy owned" type="button" data-kind="' + shopKind +
                        '" data-id="' + g.id + '">Equip</button>';
    else btn = '<button class="buy" type="button" data-kind="' + shopKind + '" data-id="' + g.id + '"' +
               (afford && mode === "idle" ? '' : ' disabled') + '>' + rand(g.cost) + '</button>';

    h += '<div class="card' + (on ? ' equipped' : '') + (locked ? ' locked' : '') + '">' +
           '<div class="card-top"><span class="card-name">' + esc(g.n) +
             '<em>' + esc(g.spec) + '</em></span></div>' +
           '<div class="card-stats">' + stats + '</div>' +
           '<div class="card-foot">' + btn + '</div>' +
         '</div>';
  }
  elGearGrid.innerHTML = h;
  renderHeader();
}
function statChip(label, text, curVal, newVal){
  var cls = "stat";
  if(newVal > curVal) cls += " up";
  else if(newVal < curVal) cls += " down";
  return '<span class="' + cls + '">' + label + ' <b>' + text + '</b></span>';
}
elKindTabs.addEventListener("click", function(ev){
  var b = ev.target.closest("button[data-kind]");
  if(!b) return;
  shopKind = b.getAttribute("data-kind");
  renderShopTab(); b.blur();
});
elGearGrid.addEventListener("click", function(ev){
  var b = ev.target.closest("button[data-id]");
  if(!b) return;
  buyGear(b.getAttribute("data-kind"), b.getAttribute("data-id"));
  b.blur();
});

/* ---- skills ------------------------------------------------------------- */
function renderSkillsTab(){
  var h = "";
  for(var i=0;i<SKILL_ORDER.length;i++){
    var k = SKILL_ORDER[i], s = SKILLS[k];
    var locked = plevel < s.lvl;
    var maxed = lvl[k] >= MAXLVL;
    var c = skillCost(k);
    var pips = "";
    for(var p=0;p<MAXLVL;p++) pips += '<span class="pip' + (p < lvl[k] ? " on" : "") + '"></span>';

    var now = sk(k).toFixed(s.dec) + " " + s.unit;
    var next = (sk(k) + s.step).toFixed(s.dec) + " " + s.unit;

    var btn;
    if(locked) btn = '<span class="lock">Unlocks at level ' + s.lvl + '</span>' +
                     '<button class="buy" type="button" disabled>' + rand(c) + '</button>';
    else if(maxed) btn = '<span class="lock" style="color:var(--sodium)">Maxed &middot; adjustable</span>';
    else btn = '<button class="buy" type="button" data-skill="' + k + '"' +
               (cash >= c && mode === "idle" ? '' : ' disabled') + '>' +
               next + ' &middot; ' + rand(c) + '</button>';

    var dialRow = maxed
      ? '<div class="dial"><span class="lbl">Intensity</span>' +
          '<input type="range" min="0" max="100" step="10" value="' + dial[k] + '" ' +
            'data-dialskill="' + k + '" aria-label="' + s.n + ' intensity">' +
          '<span class="pct">' + dial[k] + '%</span></div>'
      : '';

    h += '<div class="card' + (locked ? ' locked' : '') + (maxed ? ' maxed' : '') + '">' +
           '<div class="card-top"><span class="card-name">' + s.n +
             '<em>' + s.blurb + '</em></span>' +
             '<span class="stat">now <b>' + now + '</b></span></div>' +
           '<div class="pips">' + pips + '</div>' + dialRow +
           '<div class="card-foot">' + btn + '</div>' +
         '</div>';
  }
  elSkillGrid.innerHTML = h;
  renderHeader();
}
elSkillGrid.addEventListener("click", function(ev){
  var b = ev.target.closest("button[data-skill]");
  if(!b) return;
  buySkill(b.getAttribute("data-skill"));
  b.blur();
});
elSkillGrid.addEventListener("input", function(ev){
  var r = ev.target.closest("input[data-dialskill]");
  if(!r) return;
  var k = r.getAttribute("data-dialskill");
  setDial(k, +r.value);
  var pct = r.parentNode.querySelector(".pct");
  if(pct) pct.textContent = dial[k] + "%";
  var card = r.closest(".card");
  var now = card && card.querySelector(".stat b");
  if(now) now.textContent = sk(k).toFixed(SKILLS[k].dec) + " " + SKILLS[k].unit;
});

/* ---- fisheries ---------------------------------------------------------- */
function renderMapTab(){
  var h = "";
  for(var i=0;i<AREAS.length;i++){
    var a = AREAS[i];
    var locked = plevel < a.lvl;
    var on = area === a.id;
    var tierCls = a.tier === "Beginner" ? "b" : a.tier === "Intermediate" ? "i"
                : a.tier === "Expert" ? "e" : "l";
    var n = 0;
    for(var j=0;j<FISH.length;j++) if(FISH[j].areas.indexOf(a.id) >= 0) n++;

    h += '<div class="mapcard' + (on ? ' on' : '') + (locked ? ' locked' : '') + '">' +
           '<span class="tier ' + tierCls + '">' + a.tier + '</span>' +
           '<h3>' + esc(a.n) + '</h3>' +
           '<span class="sub">' + esc(a.sub) + ' &middot; ' + a.maxDepth + ' m &middot; ' + n + ' species</span>' +
           '<p>' + esc(a.blurb) + '</p>' +
           '<div class="card-foot">' +
             (locked
               ? '<span class="lock">Unlocks at level ' + a.lvl + '</span>'
               : on
                 ? '<button class="buy on" type="button" disabled>Fishing here</button>'
                 : '<button class="buy" type="button" data-area="' + a.id + '"' +
                   (mode === "idle" ? '' : ' disabled') + '>Sail here</button>') +
           '</div>' +
         '</div>';
  }
  elMapGrid.innerHTML = h;

  /* species table for the selected area */
  var rows = "";
  var here = [];
  for(var f=0;f<FISH.length;f++) if(FISH[f].areas.indexOf(area) >= 0) here.push(FISH[f]);
  here.sort(function(x,y){
    var d = RARITY_ORDER.indexOf(x.rar) - RARITY_ORDER.indexOf(y.rar);
    return d !== 0 ? d : x.kg[1] - y.kg[1];
  });
  for(var q=0;q<here.length;q++){
    var fs = here[q];
    var reachable = fs.dep[0] <= maxDepth();
    var vLo = fishValue(fs, fs.kg[0]), vHi = fishValue(fs, fs.kg[1]);
    rows += '<tr' + (reachable ? '' : ' class="out"') + '>' +
              '<td>' + esc(fs.n) + '</td>' +
              '<td>' + rarChip(fs.rar) + '</td>' +
              '<td class="n">' + fmtKg(fs.kg[0]) + ' &ndash; ' + fmtKg(fs.kg[1]) + '</td>' +
              '<td class="n">' + fs.dep[0] + '&ndash;' + fs.dep[1] + ' m</td>' +
              '<td class="v">' + (fs.tag ? "tag &amp; release" : rand(vLo) + " &ndash; " + rand(vHi)) + '</td>' +
            '</tr>';
  }
  elSpecBody.innerHTML = rows;
  renderHeader();
}
elMapGrid.addEventListener("click", function(ev){
  var b = ev.target.closest("button[data-area]");
  if(!b) return;
  selectArea(b.getAttribute("data-area"));
  b.blur();
});

/* ---- leaderboard -------------------------------------------------------- */
var cloudDb = null, cloudRows = null, boardMode = "local", pollTimer = null;
var API = "/api/scores", POLL_MS = 12000;

function httpHosted(){ return location.protocol === "http:" || location.protocol === "https:"; }
function docIdFor(name){
  var id = String(name).replace(/[^A-Za-z0-9_\-.~:@+]/g, "_").slice(0, 60);
  return id.length ? id : "skipper";
}
function takeRows(rows, m){
  if(!rows || typeof rows.length !== "number") return false;
  cloudRows = [];
  for(var i=0;i<rows.length;i++){
    var r = rows[i];
    if(r && typeof r.name === "string" && r.name) cloudRows.push(r);
  }
  boardMode = m;
  renderLeaderboard();
  return true;
}
/* Report why the shared board is missing, in the panel rather than the
   console. Swallowing this just looks like "the leaderboard is broken". */
var netStatus = null;
function fetchBoard(){
  if(!httpHosted() || !window.fetch) return;
  fetch(API, {cache:"no-store"}).then(function(r){
    if(!r.ok){ netStatus = "the server answered " + r.status; boardMode = "offline"; renderLeaderboard(); return null; }
    return r.json();
  }).then(function(rows){
    if(rows && rows.error){ netStatus = String(rows.error); boardMode = "offline"; renderLeaderboard(); }
    else if(rows){ netStatus = null; takeRows(rows, "net"); }
  }).catch(function(){
    netStatus = "no answer from /api/scores";
    boardMode = "offline";
    renderLeaderboard();
  });
}
function postScore(){
  if(!httpHosted() || !window.fetch || !profile || best <= 0) return;
  fetch(API, {method:"POST", headers:{"content-type":"application/json"},
    body:JSON.stringify({name:profile, best:best, deepest:deepest, casts:casts})})
    .then(function(r){ return r.ok ? r.json() : null; })
    .then(function(rows){ if(rows && !rows.error) takeRows(rows, "net"); })
    .catch(function(){});
}
function initClaudeDb(){
  if(!(window.claude && typeof window.claude.use === "function")) return;
  Promise.resolve(window.claude.use("db")).then(function(db){
    if(!db) return;
    cloudDb = db;
    try{
      db.collection("leaderboard").orderBy("best","desc").limit(25).onSnapshot(
        function(snap){
          if(boardMode === "net") return;
          takeRows(snap.docs.map(function(d){ return d.data() || {}; }), "claude");
        },
        function(){ if(boardMode !== "net"){ cloudRows = null; boardMode = "local"; renderLeaderboard(); } }
      );
    }catch(e){ cloudDb = null; }
    pushScore();
  }).catch(function(){});
}
function pushClaude(){
  if(!cloudDb || !profile || best <= 0) return;
  try{
    cloudDb.doc("leaderboard/" + docIdFor(profile))
      .set({name:profile, best:best, deepest:deepest, casts:casts, ts:Date.now()})
      .catch(function(){});
  }catch(e){}
}
function pushScore(){ postScore(); pushClaude(); }
function initBoard(){
  if(httpHosted()){
    fetchBoard();
    if(pollTimer) clearInterval(pollTimer);
    pollTimer = setInterval(function(){ if(!document.hidden) fetchBoard(); }, POLL_MS);
  }
  initClaudeDb();
}
function renderLeaderboard(){
  var rows, live = false;
  if(cloudRows && boardMode !== "offline"){
    live = true;
    rows = cloudRows.map(function(r){
      return {name:String(r.name||"?"), best:r.best|0, deepest:r.deepest|0};
    });
  } else {
    var all = allProfiles();
    rows = Object.keys(all).map(function(n){
      return {name:n, best:all[n].best|0, deepest:all[n].deepest|0};
    });
  }
  rows.sort(function(a,b){ return b.best - a.best; });
  rows = rows.slice(0, 12);

  elLbTag.textContent = boardMode === "net" ? "Live · all players"
                      : boardMode === "claude" ? "Live"
                      : boardMode === "offline" ? "Shared board offline"
                      : "This laptop";
  elLbTag.className = "tag" + (live ? " live" : boardMode === "offline" ? " warn" : "");

  if(boardMode === "offline" && !rows.length){
    elLb.innerHTML = '<div class="empty">Showing nobody yet, and the shared board is not answering &mdash; ' +
      esc(netStatus || "unknown") + '.<br><br>The shared leaderboard needs the site deployed with ' +
      '<b>npm run deploy</b>. Dragging the folder into Netlify skips the build, so /api/scores never ships.</div>';
    return;
  }
  if(!rows.length || rows[0].best === 0){
    elLb.innerHTML = '<div class="empty">No hauls landed yet. Land one and you top the board.</div>';
    return;
  }
  var h = "";
  for(var i=0;i<rows.length;i++){
    if(rows[i].best <= 0) continue;
    h += '<div class="row' + (rows[i].name === profile ? ' me' : '') + '">' +
           '<span class="pos">' + (i+1) + '</span>' +
           '<span class="nm">' + esc(rows[i].name) + '</span>' +
           '<span class="dp">' + rows[i].deepest + 'm</span>' +
           '<span class="val">' + rand(rows[i].best) + '</span>' +
         '</div>';
  }
  elLb.innerHTML = h;
}

/* ---- skipper ------------------------------------------------------------ */
function renderSkipper(){
  var all = allProfiles();
  var names = Object.keys(all);
  elSkipTag.textContent = profile ? (casts + (casts === 1 ? " cast" : " casts")) : "";

  var msg = skipperMsg ? '<p class="hint ' + skipperMsg.k + '">' + esc(skipperMsg.t) + '</p>' : '';
  if(!storageOK){
    msg = '<p class="hint warn">This browser is blocking saved data, so progress will not survive a ' +
          'refresh. Take a save code before you close the tab.</p>' + msg;
  }

  if(!profile || skipperView === "new"){
    elSkipBody.innerHTML =
      '<div class="skip">' +
        '<p class="hint">Enter a name and this browser keeps your progress under it. ' +
        'Several people can share one laptop.</p>' +
        '<div class="skip-form">' +
          '<input type="text" id="nameIn" maxlength="18" placeholder="Your name" autocomplete="off">' +
          '<button class="mini go" type="button" id="nameGo">Start</button>' +
        '</div>' + msg +
        (profile ? '<div class="skip-actions"><button class="mini" type="button" data-act="cancel">Back</button></div>' : '') +
      '</div>';
  } else if(skipperView === "switch"){
    var w = '';
    for(var i=0;i<names.length;i++){
      w += '<button type="button" data-who="' + esc(names[i]) + '"' +
             (names[i] === profile ? ' class="cur"' : '') + '>' +
             '<span>' + esc(names[i]) + '</span><span>' + rand(all[names[i]].best|0) + '</span></button>';
    }
    elSkipBody.innerHTML =
      '<div class="skip"><p class="hint">Pick a skipper on this browser.</p>' +
        '<div class="skip-actions">' +
          '<button class="mini" type="button" data-act="new">New skipper</button>' +
          '<button class="mini" type="button" data-act="cancel">Back</button>' +
        '</div>' + msg + '<div class="who">' + w + '</div></div>';
  } else {
    elSkipBody.innerHTML =
      '<div class="skip">' +
        '<div class="skip-id"><span class="skip-name">' + esc(profile) + '</span>' +
          '<span class="skip-sub">' + (names.length > 1 ? names.length + " aboard" : "Skipper") + '</span></div>' +
        '<div class="skip-stats">' +
          '<span>Best haul <b>' + rand(best) + '</b></span>' +
          '<span>Deepest <b>' + deepest + ' m</b></span>' +
        '</div>' +
        '<div class="skip-actions">' +
          '<button class="mini" type="button" data-act="switch">Switch</button>' +
          '<button class="mini" type="button" data-act="new">New</button>' +
        '</div>' + msg +
      '</div>';
  }
  wireSkipper();
}
function wireSkipper(){
  var acts = elSkipBody.querySelectorAll("[data-act]");
  for(var i=0;i<acts.length;i++){
    acts[i].addEventListener("click", function(ev){
      var a = ev.currentTarget.getAttribute("data-act");
      skipperMsg = null;
      if(a === "switch"){ skipperView = "switch"; renderSkipper(); }
      else if(a === "new"){ skipperView = "new"; renderSkipper(); focusIn("nameIn"); }
      else if(a === "cancel"){ skipperView = "main"; renderSkipper(); }
      else if(a === "code"){ skipperView = "code"; renderSkipper(); }
      else if(a === "copy") copyCode();
      else if(a === "restore") restoreCode();
      ev.currentTarget.blur();
    });
  }
  var whos = elSkipBody.querySelectorAll("[data-who]");
  for(var j=0;j<whos.length;j++){
    whos[j].addEventListener("click", function(ev){
      if(mode !== "idle"){ skipperMsg = {k:"warn", t:"Finish the cast first."}; renderSkipper(); return; }
      switchTo(ev.currentTarget.getAttribute("data-who"));
    });
  }
  var go = document.getElementById("nameGo");
  if(go) go.addEventListener("click", claimName);
  var inp = document.getElementById("nameIn");
  if(inp) inp.addEventListener("keydown", function(ev){ if(ev.key === "Enter"){ ev.preventDefault(); claimName(); } });
  var ci = document.getElementById("codeIn");
  if(ci) ci.addEventListener("keydown", function(ev){ if(ev.key === "Enter"){ ev.preventDefault(); restoreCode(); } });
}
function focusIn(id){ var el = document.getElementById(id); if(el) try{ el.focus(); }catch(e){} }
function claimName(){
  var el = document.getElementById("nameIn");
  if(!el) return;
  var name = el.value.replace(/\s+/g," ").trim().slice(0,18);
  if(!name){ skipperMsg = {k:"warn", t:"Type a name first."}; renderSkipper(); focusIn("nameIn"); return; }
  var all = allProfiles();
  if(all[name] && name !== profile){
    switchTo(name);
    skipperMsg = {k:"ok", t:"Welcome back, " + name + "."};
    renderSkipper();
    return;
  }
  if(!profile){
    profile = name; save();
    skipperView = "main"; skipperMsg = null;
    renderAll(); pushScore();
    return;
  }
  switchTo(name, {});
}
function codeSay(kind, text){
  var el = document.getElementById("codeMsg");
  if(!el) return;
  el.className = "hint " + kind;
  el.textContent = text;
}
function refreshCode(){
  var el = document.getElementById("codeOut");
  if(el && document.activeElement !== el) el.value = encodeSave();
}
function copyCode(){
  var el = document.getElementById("codeOut");
  if(!el) return;
  var done = function(){ codeSay("ok", "Code copied."); };
  try{
    el.select(); el.setSelectionRange(0, 99999);
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(el.value).then(done, function(){
        try{ document.execCommand("copy"); done(); }
        catch(e){ codeSay("warn", "Copy it by hand: select the code and press Ctrl+C."); }
      });
      return;
    }
    document.execCommand("copy"); done();
  }catch(e){
    codeSay("warn", "Copy it by hand: select the code and press Ctrl+C.");
  }
}
function restoreCode(){
  if(mode !== "idle"){ codeSay("warn", "Finish the cast first."); return; }
  var el = document.getElementById("codeIn");
  if(!el) return;
  var raw = el.value.trim();
  if(!raw){ codeSay("warn", "Paste a code into the box first."); return; }
  var s = decodeSave(raw);
  if(!s){ codeSay("warn", "That code did not read right. Check it and try again."); return; }
  applyState(s);
  if(!profile) profile = "Skipper";
  save(); spawnColumn(); renderAll(); pushScore();
  el.value = "";
  codeSay("ok", "Progress loaded — level " + plevel + ", " + rand(cash) + ".");
}

/* ---- render everything -------------------------------------------------- */
function renderAll(){
  renderHeader();
  refreshCode();
  renderCrewTab();
  renderHaul();
  renderSkipper();
  renderLeaderboard();
  renderShopTab();
  renderSkillsTab();
  renderMapTab();
  syncGauges();
}

/* ---- crew and boat ------------------------------------------------------ */
function renderCrewPreview(){
  if(!elCrewCv) return;
  var c = elCrewCv, pctx = c.getContext("2d");
  /* drawBoat paints through the shared ctx, so lend it this canvas briefly */
  var keepCtx = ctx, keepDpr = dpr;
  ctx = pctx; dpr = 1;
  ctx.setTransform(1,0,0,1,0,0);
  ctx.clearRect(0,0,c.width,c.height);

  var waterY = c.height*0.66;
  var g = ctx.createLinearGradient(0, waterY, 0, c.height);
  g.addColorStop(0, "#0E4152"); g.addColorStop(1, "#062430");
  ctx.fillStyle = g; ctx.fillRect(0, waterY, c.width, c.height-waterY);

  ctx.strokeStyle = "rgba(150,214,214,.42)"; ctx.lineWidth = 1.6;
  ctx.beginPath();
  for(var wx=0; wx<=c.width; wx+=6){
    var wy = waterY + Math.sin(wx*0.045 + t*1.7)*2.2;
    if(wx === 0) ctx.moveTo(wx,wy); else ctx.lineTo(wx,wy);
  }
  ctx.stroke();

  /* the whole point of this screen is seeing the detail, so draw it large */
  var s = 2.1;
  ctx.save();
  ctx.translate(c.width/2, waterY);
  ctx.scale(s, s);
  ctx.translate(-c.width/2, -waterY);
  drawBoat(c.width/2, waterY);
  ctx.restore();

  ctx = keepCtx; dpr = keepDpr;
}

function renderCrewTab(){
  if(!elSkinGrid) return;
  var list = skinKind === "char" ? CHAR_SKINS : BOAT_SKINS;
  var have = skinKind === "char" ? ownedChar : ownedBoat;
  var wearing = skinKind === "char" ? charSkin : boatSkin;

  var tabs = elSkinTabs.querySelectorAll("button[data-skin]");
  for(var ti=0; ti<tabs.length; ti++){
    tabs[ti].classList.toggle("on", tabs[ti].getAttribute("data-skin") === skinKind);
  }

  var h = "";
  for(var i=0;i<list.length;i++){
    var it = list[i];
    var owned2 = have.indexOf(it.id) >= 0;
    var on = wearing === it.id;
    var locked = plevel < it.lvl;

    var sw = skinKind === "char"
      ? [it.shirt, it.trouser, it.hatCol || it.skin]
      : [it.hull, it.cabin, it.trim];
    var swatch = '<span class="skincard-sw">';
    for(var q=0;q<sw.length;q++) swatch += '<span class="sw" style="background:' + sw[q] + '"></span>';
    swatch += '</span>';

    var btn;
    if(locked) btn = '<span class="lock">Unlocks at level ' + it.lvl + '</span>' +
                     '<button class="buy" type="button" disabled>' + rand(it.cost) + '</button>';
    else if(on) btn = '<button class="buy on" type="button" disabled>Wearing</button>';
    else if(owned2) btn = '<button class="buy owned" type="button" data-skinkind="' + skinKind +
                          '" data-skinid="' + it.id + '">Wear</button>';
    else btn = '<button class="buy" type="button" data-skinkind="' + skinKind + '" data-skinid="' + it.id + '"' +
               (cash >= it.cost && mode === "idle" ? '' : ' disabled') + '>' + rand(it.cost) + '</button>';

    h += '<div class="card' + (on ? ' equipped' : '') + (locked ? ' locked' : '') + '">' +
           '<div class="card-top"><span class="card-name">' + esc(it.n) +
             '<em>' + esc(it.sub) + '</em></span>' + swatch + '</div>' +
           '<div class="card-foot">' + btn + '</div>' +
         '</div>';
  }
  elSkinGrid.innerHTML = h;
  if(elCrewCaption){
    elCrewCaption.textContent = charById(charSkin).n + " aboard the " + boatById(boatSkin).n + ".";
  }
  renderCrewPreview();
}
if(elSkinTabs){
  elSkinTabs.addEventListener("click", function(ev){
    var b = ev.target.closest("button[data-skin]");
    if(!b) return;
    skinKind = b.getAttribute("data-skin");
    renderCrewTab(); b.blur();
  });
}
if(elSkinGrid){
  elSkinGrid.addEventListener("click", function(ev){
    var b = ev.target.closest("button[data-skinid]");
    if(!b) return;
    buySkin(b.getAttribute("data-skinkind"), b.getAttribute("data-skinid"));
    b.blur();
  });
}

/* The save-code panel is static markup, so its buttons wire up once and the
   readonly field is refreshed by renderAll rather than re-rendered. */
(function(){
  var copyBtn = document.getElementById("codeCopy");
  var loadBtn = document.getElementById("codeLoad");
  var inp = document.getElementById("codeIn");
  if(copyBtn) copyBtn.addEventListener("click", function(){ copyCode(); this.blur(); });
  if(loadBtn) loadBtn.addEventListener("click", function(){ restoreCode(); this.blur(); });
  if(inp) inp.addEventListener("keydown", function(ev){
    if(ev.key === "Enter"){ ev.preventDefault(); restoreCode(); }
  });
})();
