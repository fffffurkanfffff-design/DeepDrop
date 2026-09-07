/* ===========================================================================
   Deep Drop - canvas rendering
   Fish are drawn parametrically: a body profile, then tail / dorsal / head /
   markings chosen per species, so each one reads as itself in the water.
   =========================================================================== */

/* backPk : where along the body the back peaks (0 = tail, 1 = nose)
   backH  : height of the back above the spine
   bellyH : depth of the belly below it
   nose   : how far the snout sits above the spine
   ped    : thickness of the tail wrist                                    */
var PROFILE = {
  bait:     {backPk:0.10, backH:0.95, bellyH:0.85, nose:0.06, ped:0.17},
  slim:     {backPk:0.05, backH:0.92, bellyH:0.78, nose:0.05, ped:0.15},
  torpedo:  {backPk:0.12, backH:1.00, bellyH:0.94, nose:0.08, ped:0.19},
  deep:     {backPk:0.04, backH:1.00, bellyH:1.00, nose:0.12, ped:0.22},
  verydeep: {backPk:0.00, backH:1.00, bellyH:1.06, nose:0.16, ped:0.24},
  shark:    {backPk:0.14, backH:0.86, bellyH:0.76, nose:0.02, ped:0.13},
  bill:     {backPk:0.12, backH:0.90, bellyH:0.80, nose:0.04, ped:0.15},
  flat:     {backPk:0.24, backH:0.62, bellyH:0.56, nose:0.02, ped:0.13}
};

function bodyPath(L, Hh, p, wig){
  var nose = L*0.50, tailX = -L*0.44;
  var ped = Hh*p.ped, sweep = wig*Hh*0.35;
  ctx.beginPath();
  ctx.moveTo(nose, -Hh*p.nose);
  /* back */
  ctx.bezierCurveTo(L*(0.20+p.backPk), -Hh*p.backH,
                    L*(-0.05+p.backPk), -Hh*p.backH,
                    tailX, -ped + sweep);
  /* wrist */
  ctx.lineTo(tailX, ped + sweep);
  /* belly */
  ctx.bezierCurveTo(L*(-0.05+p.backPk), Hh*p.bellyH,
                    L*(0.22+p.backPk), Hh*p.bellyH,
                    nose, Hh*p.nose*0.6);
  ctx.closePath();
}

function drawTail(kind, L, Hh, col, col2, wig){
  var x = -L*0.44, sweep = wig*Hh*0.9;
  ctx.fillStyle = col;
  ctx.beginPath();
  if(kind === "lunate"){
    ctx.moveTo(x + L*0.03, 0);
    ctx.quadraticCurveTo(x - L*0.14, -Hh*1.55 + sweep, x - L*0.22, -Hh*1.75 + sweep);
    ctx.quadraticCurveTo(x - L*0.06, -Hh*0.55 + sweep*0.5, x - L*0.04, 0);
    ctx.quadraticCurveTo(x - L*0.06, Hh*0.55 + sweep*0.5, x - L*0.22, Hh*1.70 + sweep);
    ctx.quadraticCurveTo(x - L*0.14, Hh*1.50 + sweep, x + L*0.03, 0);
  } else if(kind === "fork"){
    ctx.moveTo(x + L*0.04, 0);
    ctx.lineTo(x - L*0.14, -Hh*1.15 + sweep);
    ctx.quadraticCurveTo(x - L*0.05, -Hh*0.30 + sweep*0.5, x - L*0.03, 0);
    ctx.quadraticCurveTo(x - L*0.05, Hh*0.30 + sweep*0.5, x - L*0.14, Hh*1.12 + sweep);
  } else if(kind === "round"){
    ctx.moveTo(x + L*0.04, -Hh*0.30);
    ctx.quadraticCurveTo(x - L*0.22, -Hh*0.95 + sweep, x - L*0.20, sweep);
    ctx.quadraticCurveTo(x - L*0.22, Hh*0.95 + sweep, x + L*0.04, Hh*0.30);
  } else if(kind === "point"){
    ctx.moveTo(x + L*0.04, -Hh*0.34);
    ctx.lineTo(x - L*0.20, -Hh*0.80 + sweep);
    ctx.lineTo(x - L*0.24, sweep);
    ctx.lineTo(x - L*0.20, Hh*0.80 + sweep);
    ctx.lineTo(x + L*0.04, Hh*0.34);
  } else {                                   /* shark - long upper lobe */
    ctx.moveTo(x + L*0.04, 0);
    ctx.lineTo(x - L*0.20, -Hh*2.05 + sweep);
    ctx.lineTo(x - L*0.10, -Hh*0.30 + sweep*0.6);
    ctx.lineTo(x - L*0.16, Hh*0.95 + sweep);
    ctx.lineTo(x - L*0.02, Hh*0.20);
  }
  ctx.closePath(); ctx.fill();
}

function drawDorsal(kind, L, Hh, col, wig){
  ctx.fillStyle = col;
  var s = wig*Hh*0.25;
  if(kind === "sail"){
    ctx.beginPath();
    ctx.moveTo(L*0.26, -Hh*0.78);
    ctx.quadraticCurveTo(L*0.10, -Hh*3.10 + s, -L*0.16, -Hh*2.60 + s);
    ctx.quadraticCurveTo(-L*0.26, -Hh*1.30, -L*0.30, -Hh*0.62);
    ctx.closePath(); ctx.fill();
  } else if(kind === "shark"){
    ctx.beginPath();
    ctx.moveTo(L*0.06, -Hh*0.82);
    ctx.quadraticCurveTo(L*0.02, -Hh*2.15 + s, -L*0.14, -Hh*1.95 + s);
    ctx.lineTo(-L*0.16, -Hh*0.70);
    ctx.closePath(); ctx.fill();
    /* second, small dorsal near the tail */
    ctx.beginPath();
    ctx.moveTo(-L*0.30, -Hh*0.62);
    ctx.lineTo(-L*0.36, -Hh*1.05 + s);
    ctx.lineTo(-L*0.40, -Hh*0.55);
    ctx.closePath(); ctx.fill();
  } else if(kind === "long"){
    ctx.beginPath();
    ctx.moveTo(L*0.28, -Hh*0.74);
    ctx.quadraticCurveTo(L*0.05, -Hh*1.62 + s, -L*0.22, -Hh*1.30 + s);
    ctx.lineTo(-L*0.34, -Hh*0.58);
    ctx.closePath(); ctx.fill();
  } else if(kind === "spiny"){
    ctx.beginPath();
    ctx.moveTo(L*0.24, -Hh*0.76);
    for(var i=0;i<5;i++){
      var t0 = i/5, t1 = (i+0.5)/5;
      ctx.lineTo(L*(0.24 - t1*0.44), -Hh*(1.05 + 0.30*Math.sin(i)) + s);
      ctx.lineTo(L*(0.24 - (t0+0.2/5)*0.44), -Hh*0.80);
    }
    ctx.lineTo(-L*0.22, -Hh*0.66);
    ctx.closePath(); ctx.fill();
  } else if(kind === "twin"){
    ctx.beginPath();
    ctx.moveTo(L*0.24, -Hh*0.76);
    ctx.lineTo(L*0.12, -Hh*1.48 + s);
    ctx.lineTo(L*0.00, -Hh*0.74);
    ctx.closePath(); ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-L*0.06, -Hh*0.72);
    ctx.quadraticCurveTo(-L*0.16, -Hh*1.20 + s, -L*0.30, -Hh*0.60);
    ctx.closePath(); ctx.fill();
  } else {                                   /* low */
    ctx.beginPath();
    ctx.moveTo(L*0.10, -Hh*0.72);
    ctx.lineTo(-L*0.02, -Hh*1.16 + s);
    ctx.lineTo(-L*0.16, -Hh*0.66);
    ctx.closePath(); ctx.fill();
  }
}

function drawMarkings(f, L, Hh, kg){
  var m = f.mark;
  if(m === "none" || m === "yellowfin") return;
  ctx.save();
  ctx.globalAlpha = 0.55;
  ctx.fillStyle = f.markCol;
  ctx.strokeStyle = f.markCol;

  if(m === "bars"){
    for(var i=0;i<7;i++){
      var bx = L*(0.34 - i*0.115);
      ctx.beginPath();
      ctx.moveTo(bx, -Hh*0.95);
      ctx.quadraticCurveTo(bx - L*0.02, 0, bx, Hh*0.85);
      ctx.lineTo(bx - L*0.035, Hh*0.85);
      ctx.quadraticCurveTo(bx - L*0.055, 0, bx - L*0.035, -Hh*0.95);
      ctx.closePath(); ctx.fill();
    }
  } else if(m === "stripe"){
    ctx.globalAlpha = 0.5;
    ctx.lineWidth = Math.max(1.4, Hh*0.20);
    ctx.beginPath();
    ctx.moveTo(L*0.40, -Hh*0.06);
    ctx.quadraticCurveTo(0, -Hh*0.18, -L*0.42, -Hh*0.02);
    ctx.stroke();
  } else if(m === "lateral"){
    ctx.globalAlpha = 0.45;
    ctx.lineWidth = Math.max(0.9, Hh*0.07);
    ctx.beginPath();
    ctx.moveTo(L*0.36, -Hh*0.14);
    ctx.quadraticCurveTo(0, -Hh*0.24, -L*0.42, -Hh*0.04);
    ctx.stroke();
  } else if(m === "spots"){
    var n = 14;
    for(var s2=0;s2<n;s2++){
      var a = s2*2.399;                                  /* golden-angle scatter */
      var px = L*(0.34 - (s2/n)*0.74) + Math.cos(a)*L*0.03;
      var py = Math.sin(a)*Hh*0.72;
      var r = Math.max(0.9, Hh*0.10 * (0.6 + (s2%3)*0.2));
      ctx.beginPath(); ctx.arc(px, py, r, 0, 6.284); ctx.fill();
    }
  } else if(m === "blotch"){
    for(var b=0;b<9;b++){
      var a2 = b*2.399;
      ctx.beginPath();
      ctx.ellipse(L*(0.30 - (b/9)*0.70), Math.sin(a2)*Hh*0.55,
                  Hh*0.22, Hh*0.15, a2, 0, 6.284);
      ctx.fill();
    }
  }
  ctx.restore();
}

function drawFish(x, y, e){
  var f = e.def, L = e.len || 40, R = bodyRatio(f), Hh = L*R;
  var p = PROFILE[f.shape] || PROFILE.torpedo;
  var face = e.face === undefined ? e.dir : e.face;
  if(Math.abs(face) < 0.10) face = face < 0 ? -0.10 : 0.10;
  var wig = Math.sin(e.ph)*0.16*(e.boost || 1);
  var finCol = f.mark === "yellowfin" ? f.markCol : f.back;

  ctx.save();
  ctx.translate(x, y);
  ctx.scale(face, 1);
  ctx.rotate(wig*0.12);

  /* rare fish carry a faint aura so they stand out at depth */
  var ri = RARITY_ORDER.indexOf(f.rar);
  if(ri >= 2){
    var glow = ctx.createRadialGradient(0,0,L*0.2, 0,0,L*0.85);
    glow.addColorStop(0, RARITY[f.rar].c + "44");
    glow.addColorStop(1, RARITY[f.rar].c + "00");
    ctx.fillStyle = glow;
    ctx.beginPath(); ctx.arc(0, 0, L*0.85, 0, 6.284); ctx.fill();
  }

  drawTail(f.tail, L, Hh, finCol, f.mid, wig);
  drawDorsal(f.dorsal, L, Hh, finCol, wig);

  /* anal fin */
  ctx.fillStyle = finCol;
  ctx.beginPath();
  ctx.moveTo(-L*0.04, Hh*0.74);
  ctx.lineTo(-L*0.18, Hh*1.24 + wig*3);
  ctx.lineTo(-L*0.28, Hh*0.62);
  ctx.closePath(); ctx.fill();

  /* body */
  var g = ctx.createLinearGradient(0, -Hh, 0, Hh);
  g.addColorStop(0,    f.back);
  g.addColorStop(0.42, f.mid);
  g.addColorStop(0.78, f.belly);
  g.addColorStop(1,    f.belly);
  ctx.fillStyle = g;
  bodyPath(L, Hh, p, wig);
  ctx.fill();

  /* markings, clipped to the body so nothing leaks past the outline */
  ctx.save();
  bodyPath(L, Hh, p, wig);
  ctx.clip();
  drawMarkings(f, L, Hh, e.kg);
  ctx.restore();

  /* snout */
  if(f.head === "bill"){
    ctx.strokeStyle = f.back;
    ctx.lineWidth = Math.max(1.8, L*0.028);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(L*0.48, -Hh*0.06);
    ctx.lineTo(L*0.92, -Hh*0.16);
    ctx.stroke();
  } else if(f.head === "shovel"){
    ctx.fillStyle = f.mid;
    ctx.beginPath();
    ctx.moveTo(L*0.44, -Hh*0.30);
    ctx.quadraticCurveTo(L*0.78, -Hh*0.06, L*0.44, Hh*0.26);
    ctx.closePath(); ctx.fill();
  }

  /* gill plate */
  ctx.strokeStyle = "rgba(0,0,0,.20)";
  ctx.lineWidth = Math.max(0.8, L*0.012);
  ctx.beginPath();
  ctx.moveTo(L*0.26, -Hh*0.62);
  ctx.quadraticCurveTo(L*0.17, 0, L*0.26, Hh*0.56);
  ctx.stroke();
  if(f.shape === "shark"){
    for(var gi=0; gi<5; gi++){
      ctx.beginPath();
      ctx.moveTo(L*(0.24 - gi*0.035), -Hh*0.34);
      ctx.lineTo(L*(0.23 - gi*0.035), Hh*0.10);
      ctx.stroke();
    }
  }

  /* pectoral */
  ctx.fillStyle = finCol;
  ctx.globalAlpha = 0.9;
  ctx.beginPath();
  ctx.moveTo(L*0.16, Hh*0.22);
  if(f.shape === "shark" || f.shape === "bill"){
    ctx.lineTo(-L*0.06, Hh*1.55 + wig*3);
    ctx.lineTo(L*0.02, Hh*0.30);
  } else {
    ctx.lineTo(-L*0.02, Hh*0.92 + wig*3);
    ctx.lineTo(L*0.24, Hh*0.32);
  }
  ctx.closePath(); ctx.fill();
  ctx.globalAlpha = 1;

  /* eye */
  var ex = L*0.34, ey = -Hh*0.24;
  if(f.head === "bill") ex = L*0.40;
  if(f.head === "blunt") ex = L*0.31;
  var er = Math.max(1.4, L*0.042);
  ctx.fillStyle = "rgba(255,255,255,.55)";
  ctx.beginPath(); ctx.arc(ex, ey, er*1.25, 0, 6.284); ctx.fill();
  ctx.fillStyle = "#06131B";
  ctx.beginPath(); ctx.arc(ex, ey, er, 0, 6.284); ctx.fill();
  ctx.fillStyle = "rgba(255,255,255,.80)";
  ctx.beginPath(); ctx.arc(ex + er*0.28, ey - er*0.32, Math.max(0.5, er*0.34), 0, 6.284); ctx.fill();

  ctx.restore();
}

/* ---- mines -------------------------------------------------------------- */
function drawMine(x, y, e){
  ctx.save();
  ctx.translate(x, y);
  var r = 13, blink = (Math.sin(t*4 + e.bobPh) + 1)/2;

  /* mooring chain */
  ctx.strokeStyle = "rgba(150,160,168,.30)";
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(0, r); ctx.lineTo(0, r + 26); ctx.stroke();

  /* spikes */
  ctx.fillStyle = "#3A4046";
  for(var i=0;i<10;i++){
    var a = i*0.6283 + 0.2;
    ctx.save(); ctx.rotate(a);
    ctx.beginPath();
    ctx.moveTo(-3.2, -r); ctx.lineTo(0, -r - 7.5); ctx.lineTo(3.2, -r);
    ctx.closePath(); ctx.fill();
    ctx.restore();
  }
  /* casing */
  var g = ctx.createRadialGradient(-r*0.35, -r*0.4, r*0.15, 0, 0, r);
  g.addColorStop(0, "#5A626A");
  g.addColorStop(1, "#22282E");
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.284); ctx.fill();
  ctx.strokeStyle = "#161B20"; ctx.lineWidth = 1.4;
  ctx.beginPath(); ctx.arc(0, 0, r, 0, 6.284); ctx.stroke();

  /* warning lamp */
  ctx.fillStyle = "rgba(228,83,60," + (0.35 + blink*0.65) + ")";
  ctx.beginPath(); ctx.arc(0, 0, 3.6, 0, 6.284); ctx.fill();
  ctx.fillStyle = "rgba(228,83,60," + (0.06 + blink*0.14) + ")";
  ctx.beginPath(); ctx.arc(0, 0, r + 10, 0, 6.284); ctx.fill();
  ctx.restore();
}

/* ---- junk --------------------------------------------------------------- */
function drawJunk(x, y, e){
  var j = e.def, L = j.len;
  ctx.save(); ctx.translate(x, y); ctx.rotate(Math.sin(e.ph*0.35)*0.28);
  ctx.lineWidth = 2;
  if(j.s === "boot"){
    ctx.fillStyle = "#3A342C";
    ctx.beginPath();
    ctx.moveTo(-L*0.16,-L*0.34); ctx.lineTo(L*0.10,-L*0.34); ctx.lineTo(L*0.12,L*0.10);
    ctx.lineTo(L*0.46,L*0.16); ctx.lineTo(L*0.46,L*0.34); ctx.lineTo(-L*0.16,L*0.34);
    ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#5C5245"; ctx.stroke();
  } else if(j.s === "can"){
    ctx.fillStyle = "#5A6068";
    ctx.beginPath(); ctx.rect(-L*0.26,-L*0.40,L*0.52,L*0.80); ctx.fill();
    ctx.strokeStyle = "#7C848D"; ctx.stroke();
    ctx.fillStyle = "#7C848D";
    ctx.beginPath(); ctx.ellipse(0,-L*0.40,L*0.26,L*0.10,0,0,6.284); ctx.fill();
  } else if(j.s === "tyre"){
    ctx.strokeStyle = "#26262A"; ctx.lineWidth = L*0.16;
    ctx.beginPath(); ctx.arc(0,0,L*0.34,0,6.284); ctx.stroke();
    ctx.strokeStyle = "#43434A"; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.arc(0,0,L*0.34,0,6.284); ctx.stroke();
  } else {
    ctx.strokeStyle = "#6E7A70"; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for(var i=0;i<5;i++){
      var a = i*1.3 + e.ph*0.2;
      ctx.moveTo(Math.cos(a)*L*0.34, Math.sin(a)*L*0.30);
      ctx.quadraticCurveTo(Math.cos(a+1.9)*L*0.14, Math.sin(a+1.9)*L*0.14,
                           Math.cos(a+2.9)*L*0.32, Math.sin(a+2.9)*L*0.28);
    }
    ctx.stroke();
  }
  ctx.restore();
}

/* ---- water -------------------------------------------------------------- */
function waterAt(d, tint){
  var stops = [
    [0,    tint[0],       tint[1],       tint[2]],
    [0.18, tint[0]*0.80,  tint[1]*0.80,  tint[2]*0.86],
    [0.42, tint[0]*0.58,  tint[1]*0.60,  tint[2]*0.68],
    [0.68, tint[0]*0.38,  tint[1]*0.40,  tint[2]*0.48],
    [1.00, tint[0]*0.16,  tint[1]*0.20,  tint[2]*0.26],
    [1.60, tint[0]*0.06,  tint[1]*0.09,  tint[2]*0.14]
  ];
  var m = Math.max(60, maxDepth());
  var u = Math.max(0, d)/m;
  for(var i=0;i<stops.length-1;i++){
    var a = stops[i], b = stops[i+1];
    if(u <= b[0]){
      var k = (u - a[0])/(b[0]-a[0]);
      return "rgb(" + Math.round(a[1]+(b[1]-a[1])*k) + "," +
                      Math.round(a[2]+(b[2]-a[2])*k) + "," +
                      Math.round(a[3]+(b[3]-a[3])*k) + ")";
    }
  }
  return "rgb(2,7,12)";
}

function drawBoat(sx, sy){
  ctx.save();
  ctx.translate(sx, sy + Math.sin(t*1.5)*2.2);
  ctx.fillStyle = "#101E28";
  ctx.beginPath();
  ctx.moveTo(-44,-6); ctx.lineTo(44,-6); ctx.lineTo(30,10); ctx.lineTo(-32,10); ctx.closePath(); ctx.fill();
  ctx.fillStyle = "#162833";
  ctx.beginPath(); ctx.rect(-16,-22,26,16); ctx.fill();
  ctx.strokeStyle = "#2B4453"; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(-44,-6); ctx.lineTo(44,-6); ctx.stroke();
  ctx.fillStyle = "rgba(255,162,58,.10)";
  ctx.beginPath(); ctx.arc(-3,-15,13,0,6.284); ctx.fill();
  ctx.fillStyle = "rgba(255,162,58,.9)";
  ctx.beginPath(); ctx.arc(-3,-15,2.6,0,6.284); ctx.fill();
  ctx.strokeStyle = "#2B4453"; ctx.lineWidth = 2; ctx.lineCap = "round";
  ctx.beginPath(); ctx.moveTo(14,-8); ctx.lineTo(40,-30); ctx.stroke();
  ctx.restore();
}

function draw(){
  var a = areaById(area);
  var sh = shake > 0 ? (Math.random()-0.5)*shake : 0;
  ctx.setTransform(dpr,0,0,dpr,0,0);
  ctx.save();
  ctx.translate(sh, sh*0.5);

  var topD = camY/PXM, botD = (camY+H)/PXM;

  var grd = ctx.createLinearGradient(0,0,0,H);
  for(var s=0;s<=6;s++){
    grd.addColorStop(s/6, waterAt(topD + (botD-topD)*(s/6), a.tint));
  }
  ctx.fillStyle = grd; ctx.fillRect(0,0,W,H);

  var surfaceY = -camY;

  if(surfaceY > 0){
    ctx.fillStyle = a.sky;
    ctx.fillRect(0,0,W,surfaceY);
    ctx.fillStyle = "rgba(255,162,58,.13)";
    ctx.fillRect(0, Math.max(0, surfaceY-46), W, Math.min(46, surfaceY));
    for(var st=0; st<18; st++){
      var sxs = (st*97) % W, sys = (st*53) % Math.max(12, surfaceY-52);
      ctx.fillStyle = "rgba(230,237,233," + (0.10 + (st%5)*0.045) + ")";
      ctx.fillRect(sxs, sys, 1.4, 1.4);
    }
  }

  if(botD < maxDepth()*0.6){
    var beamTop = Math.max(surfaceY, -200);
    ctx.save(); ctx.globalCompositeOperation = "lighter";
    for(var b=0;b<4;b++){
      var bx = W*(0.16 + b*0.23) + Math.sin(t*0.22 + b)*22;
      var gg = ctx.createLinearGradient(bx, beamTop, bx, beamTop + 150*PXM);
      gg.addColorStop(0, "rgba(150,214,214,.10)");
      gg.addColorStop(1, "rgba(150,214,214,0)");
      ctx.fillStyle = gg;
      ctx.beginPath();
      ctx.moveTo(bx-14, beamTop); ctx.lineTo(bx+14, beamTop);
      ctx.lineTo(bx+68, beamTop + 150*PXM); ctx.lineTo(bx-58, beamTop + 150*PXM);
      ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  ctx.fillStyle = "rgba(190,220,230,1)";
  for(var m=0;m<70;m++){
    var my = ((m*163 + t*10) % (H+80)) - 40;
    var mx = (m*137.5) % W;
    var mw = 1 + (m%3)*0.5;
    ctx.globalAlpha = 0.05 + (m%7)*0.018;
    ctx.fillRect(mx, my, mw, mw);
  }
  ctx.globalAlpha = 1;

  if(!reduceMotion && (mode === "down" || mode === "up")){
    var sweep = ((t*0.42) % 1) * H;
    var sg = ctx.createLinearGradient(0, sweep-30, 0, sweep+4);
    sg.addColorStop(0, "rgba(255,162,58,0)");
    sg.addColorStop(1, "rgba(255,162,58,.09)");
    ctx.fillStyle = sg; ctx.fillRect(0, sweep-30, W, 34);
  }

  /* depth ruler */
  ctx.textBaseline = "middle";
  var tickStep = maxDepth() > 260 ? 25 : 10;
  var startM = Math.floor(topD/tickStep)*tickStep;
  for(var d = startM; d < botD + tickStep; d += tickStep){
    if(d < 0) continue;
    var y = d*PXM - camY;
    var major = d % (tickStep*5) === 0;
    ctx.strokeStyle = major ? "rgba(255,162,58,.30)" : "rgba(255,162,58,.11)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W - (major ? 22 : 12), y + 0.5); ctx.lineTo(W, y + 0.5); ctx.stroke();
    if(major && d > 0){
      ctx.fillStyle = "rgba(255,162,58,.62)";
      ctx.font = "500 10px 'IBM Plex Mono', monospace";
      ctx.textAlign = "right";
      ctx.fillText(String(d), W - 27, y);
    }
  }

  var lineY = maxDepth()*PXM - camY;
  if(lineY > -20 && lineY < H+20){
    ctx.strokeStyle = flashLine > 0 ? "rgba(228,83,60," + (0.35 + flashLine*0.5) + ")" : "rgba(228,83,60,.30)";
    ctx.setLineDash([7,6]); ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0,lineY+0.5); ctx.lineTo(W,lineY+0.5); ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = "rgba(228,83,60,.78)";
    ctx.font = "500 9px 'IBM Plex Mono', monospace";
    ctx.textAlign = "left";
    ctx.fillText("SPOOL EMPTY", 8, lineY - 9);
  }

  /* entities */
  var sense = senseRange(), live = (mode === "down" || mode === "up");
  for(var i=0;i<ents.length;i++){
    var e = ents[i];
    var ey = e.y + e.oy - camY;
    if(ey < -110 || ey > H + 110) continue;
    var ex = e.x*W;
    if(e.kind === "fish") drawFish(ex, ey, e);
    else if(e.kind === "mine") drawMine(ex, ey, e);
    else drawJunk(ex, ey, e);

    /* fish sense reads the water around the hook */
    if(live && sense > 0 && e.kind === "fish"){
      var ddx = ex - hook.x, ddy = (e.y + e.oy) - hook.y;
      if(ddx*ddx + ddy*ddy < (sense*PXM)*(sense*PXM)){
        var col = RARITY[e.def.rar].c;
        ctx.font = "500 9px 'IBM Plex Mono', monospace";
        ctx.textAlign = "center";
        ctx.fillStyle = col;
        ctx.fillText(fmtKg(e.kg).toUpperCase(), ex, ey - e.len*0.55 - 6);
      }
    }
  }

  /* line, haul and hook */
  var hy = hook.y - camY;
  var boatX = W*0.5;
  if(live){
    var lr = loadRatio();
    var lineCol = lr > 0.95 ? "228,83,60" : lr > 0.75 ? "255,162,58" : "255,162,58";
    ctx.strokeStyle = "rgba(" + lineCol + "," + (lr > 0.75 ? 0.85 : 0.55) + ")";
    ctx.lineWidth = lr > 0.95 ? 2.1 : 1.2;
    ctx.beginPath();
    ctx.moveTo(boatX, surfaceY);
    ctx.quadraticCurveTo(boatX + (hook.x-boatX)*0.35 - hook.vx*6, surfaceY + (hy-surfaceY)*0.55, hook.x, hy);
    ctx.stroke();

    for(var c=0;c<haul.length;c++){
      var p = trail[Math.min(trail.length-1, (c+1)*7)] || {x:hook.x, y:hook.y};
      var ce = {def:haul[c].def, dir:1, face:1, boost:1, ph:t*3 + c,
                len:haul[c].kind === "fish" ? drawLen(haul[c].def, haul[c].kg) : haul[c].def.len,
                kg:haul[c].kg};
      if(haul[c].kind === "fish") drawFish(p.x, p.y - camY, ce);
      else drawJunk(p.x, p.y - camY, ce);
    }

    var r = gaffR()*0.5;
    ctx.fillStyle = "rgba(255,162,58,.16)";
    ctx.beginPath(); ctx.arc(hook.x, hy, r+3, 0, 6.284); ctx.fill();
    ctx.strokeStyle = "#E6EDE9"; ctx.lineWidth = 2.2; ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(hook.x, hy - r*1.6);
    ctx.lineTo(hook.x, hy);
    ctx.arc(hook.x, hy, r, -Math.PI*0.5, Math.PI*0.9);
    ctx.stroke();
  }

  drawBoat(boatX, surfaceY);

  if(surfaceY > -40 && surfaceY < H+40){
    ctx.strokeStyle = "rgba(150,214,214,.42)"; ctx.lineWidth = 1.6;
    ctx.beginPath();
    for(var wx=0; wx<=W; wx+=6){
      var wy = surfaceY + Math.sin(wx*0.045 + t*1.7)*2.4 + Math.sin(wx*0.017 - t*1.1)*1.6;
      if(wx === 0) ctx.moveTo(wx,wy); else ctx.lineTo(wx,wy);
    }
    ctx.stroke();
  }

  var vg = ctx.createRadialGradient(W/2,H/2,H*0.30, W/2,H/2,H*0.78);
  vg.addColorStop(0,"rgba(0,0,0,0)"); vg.addColorStop(1,"rgba(0,0,0,.42)");
  ctx.fillStyle = vg; ctx.fillRect(0,0,W,H);
  ctx.restore();
}
