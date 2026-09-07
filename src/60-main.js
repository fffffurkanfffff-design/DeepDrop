/* ===========================================================================
   Deep Drop - input and boot
   =========================================================================== */

function typing(){
  var a = document.activeElement;
  if(!a) return false;
  var tag = a.tagName;
  return tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || a.isContentEditable;
}
document.addEventListener("keydown", function(e){
  if(typing()) return;
  if(e.key === "ArrowLeft" || e.key === "a" || e.key === "A"){ keyL = true; pointerX = null; e.preventDefault(); }
  if(e.key === "ArrowRight" || e.key === "d" || e.key === "D"){ keyR = true; pointerX = null; e.preventDefault(); }
  if(e.code === "Space" || e.key === " "){
    if(document.activeElement && document.activeElement.tagName === "BUTTON") return;
    e.preventDefault();
    AC();
    if(view !== "fish") setView("fish");
    else cast();
  }
  /* 1-4 jump between the pages */
  if(e.key === "1") setView("fish");
  if(e.key === "2") setView("shop");
  if(e.key === "3") setView("skills");
  if(e.key === "4") setView("map");
});
document.addEventListener("keyup", function(e){
  if(e.key === "ArrowLeft" || e.key === "a" || e.key === "A") keyL = false;
  if(e.key === "ArrowRight" || e.key === "d" || e.key === "D") keyR = false;
});

function localX(ev){
  var r = sounder.getBoundingClientRect();
  return (ev.clientX - r.left) / r.width * W;
}
sounder.addEventListener("pointerdown", function(ev){
  AC();
  pointerX = localX(ev);
  if(mode === "idle") cast();
  try{ sounder.setPointerCapture(ev.pointerId); }catch(e){}
});
sounder.addEventListener("pointermove", function(ev){
  if(mode === "down" || mode === "up") pointerX = localX(ev);
});
sounder.addEventListener("pointerup", function(){ pointerX = null; });
sounder.addEventListener("pointercancel", function(){ pointerX = null; });

elMute.addEventListener("click", function(){
  muted = !muted;
  elMute.textContent = muted ? "Sound off" : "Sound on";
  if(!muted){ AC(); tone(660, 0.09, "triangle", 0.08); }
  elMute.blur();
});

/* ---- loop --------------------------------------------------------------- */
function resize(){
  var r = sounder.getBoundingClientRect();
  if(!r.width || !r.height) return;
  dpr = Math.min(2, window.devicePixelRatio || 1);
  W = Math.max(240, Math.round(r.width));
  H = Math.max(320, Math.round(r.height));
  cv.width = Math.round(W*dpr);
  cv.height = Math.round(H*dpr);
}
window.addEventListener("resize", resize);

var last = 0;
function frame(now){
  var dt = last ? Math.min(0.05, (now - last)/1000) : 0.016;
  last = now;
  if(view === "fish"){
    step(dt);
    draw();
    if(mode === "down" || mode === "up") syncGauges();
  }
  requestAnimationFrame(frame);
}

/* ---- boot --------------------------------------------------------------- */
load();
resize();
spawnColumn();
setView("fish");
renderAll();
initBoard();
requestAnimationFrame(frame);
