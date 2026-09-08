/* ===========================================================================
   Deep Drop - data
   Species, rarity, gear, skills and fisheries.
   Weights are the real ranges these fish are actually caught at in SA waters.
   =========================================================================== */

/* ---- rarity -------------------------------------------------------------
   spawn  : relative spawn weight (higher = more common)
   val    : multiplier on rand-per-kg
   xp     : xp multiplier
   ------------------------------------------------------------------------ */
var RARITY = {
  common:    {n:"Common",    spawn:1000, val:1.00, xp:10,   c:"#8FA6B2"},
  uncommon:  {n:"Uncommon",  spawn:400,  val:1.15, xp:20,   c:"#5FDCC0"},
  rare:      {n:"Rare",      spawn:140,  val:1.35, xp:38,  c:"#57A6F0"},
  epic:      {n:"Epic",      spawn:42,   val:1.65, xp:85,  c:"#B77BE8"},
  legendary: {n:"Legendary", spawn:9,    val:2.10, xp:195, c:"#FFA23A"},
  mythic:    {n:"Mythic",    spawn:1.6,  val:3.20, xp:590, c:"#FF5E7A"}
};
var RARITY_ORDER = ["common","uncommon","rare","epic","legendary","mythic"];

/* ---- fisheries ---------------------------------------------------------- */
var AREAS = [
  {id:"pa", n:"Port Alfred",  sub:"Eastern Cape", tier:"Beginner",
   lvl:1,  maxDepth:190, bombFrom:9999, bombDen:0,
   blurb:"Warm surf and the Kowie mouth. Forgiving water, modest fish.",
   sky:"#0A141D", tint:[14,65,82]},
  {id:"fb", n:"False Bay",    sub:"Western Cape", tier:"Intermediate",
   lvl:9,  maxDepth:320, bombFrom:150, bombDen:0.012,
   blurb:"Cold, deep and green. Kelp, reef and the gamefish that patrol them.",
   sky:"#0A1420", tint:[10,54,74]},
  {id:"sl", n:"St Lucia",     sub:"KwaZulu-Natal", tier:"Expert",
   lvl:20, maxDepth:460, bombFrom:120, bombDen:0.020,
   blurb:"The subtropical drop-off. Billfish, sharks and the deep canyon.",
   sky:"#0B1622", tint:[16,72,80]},
  {id:"sod", n:"Sodwana Bay", sub:"iSimangaliso, KZN", tier:"Legendary",
   lvl:35, maxDepth:620, bombFrom:140, bombDen:0.026,
   blurb:"The edge of the continental shelf. Nothing small lives out here.",
   sky:"#0C1A26", tint:[18,80,86]}
];

/* ---- species ------------------------------------------------------------
   areas : which fisheries it appears in
   kg    : [min, max] real catch weight
   rpk   : rand per kg before rarity multiplier
   dep   : [min, max] depth band in metres
   len   : [px at min weight, px at max weight]
   shape : bait | slim | torpedo | deep | verydeep | shark | bill | flat
   tail  : fork | lunate | round | shark | point
   dorsal: low | spiny | long | sail | twin | shark
   head  : normal | blunt | bill | point | shovel
   mark  : none | bars | spots | stripe | lateral | yellowfin | blotch | rings
   ------------------------------------------------------------------------ */
var FISH = [

  /* ===== shared across every fishery ===== */
  {id:"anchovy", n:"Anchovy", areas:["pa","fb","sl"], rar:"common", kg:[0.02,0.1], rpk:22,
   dep:[6,45], len:[16,22], sp:1.25, shape:"bait", tail:"fork", dorsal:"low", head:"point",
   back:"#4E7C93", mid:"#BFD8E4", belly:"#EEF5F8", mark:"stripe", markCol:"#DCE9F2"},

  {id:"sardine", n:"Sardine", areas:["pa","fb","sl"], rar:"common", kg:[0.05,0.2], rpk:24,
   dep:[6,55], len:[19,27], sp:1.15, shape:"bait", tail:"fork", dorsal:"low", head:"normal",
   back:"#3E6E86", mid:"#C6DCE8", belly:"#F1F7FA", mark:"stripe", markCol:"#9FC4D6"},

  {id:"harder", n:"Harder", areas:["pa","fb","sl"], rar:"common", kg:[0.2,1.2], rpk:26,
   dep:[5,40], len:[24,36], sp:0.9, shape:"slim", tail:"fork", dorsal:"twin", head:"blunt",
   back:"#6E7C68", mid:"#CBD3BE", belly:"#EFF2E6", mark:"stripe", markCol:"#A8B49C"},

  {id:"blacktail", n:"Blacktail", areas:["pa","fb","sl"], rar:"common", kg:[0.3,1.5], rpk:34,
   dep:[10,60], len:[26,36], sp:0.8, shape:"deep", tail:"fork", dorsal:"spiny", head:"blunt",
   back:"#42525C", mid:"#B8C6CE", belly:"#E6EDF1", mark:"none", markCol:"#2A343A"},

  {id:"shad", n:"Shad (Elf)", areas:["pa","fb","sl"], rar:"common", kg:[0.5,4], rpk:38,
   dep:[12,80], len:[32,52], sp:1.35, shape:"torpedo", tail:"fork", dorsal:"twin", head:"normal",
   back:"#4A6B7C", mid:"#C0D6E0", belly:"#EDF4F7", mark:"none", markCol:"#345260"},

  {id:"bronzebream", n:"Bronze bream", areas:["pa","fb","sl"], rar:"uncommon", kg:[1,5], rpk:46,
   dep:[18,80], len:[32,46], sp:0.7, shape:"deep", tail:"fork", dorsal:"spiny", head:"blunt",
   back:"#5A4632", mid:"#B08C5E", belly:"#DCC79C", mark:"none", markCol:"#3E301F"},

  {id:"kob", n:"Kob", areas:["pa","fb","sl"], rar:"uncommon", kg:[1,25], rpk:58,
   dep:[25,150], len:[38,86], sp:0.85, shape:"torpedo", tail:"point", dorsal:"twin", head:"normal",
   back:"#7A7263", mid:"#CFC3AA", belly:"#EDE6D6", mark:"lateral", markCol:"#9C8F76"},

  {id:"garrick", n:"Garrick", areas:["pa","fb","sl"], rar:"rare", kg:[3,25], rpk:66,
   dep:[20,120], len:[46,84], sp:1.45, shape:"torpedo", tail:"lunate", dorsal:"twin", head:"point",
   back:"#41707F", mid:"#BCD6DE", belly:"#EAF3F6", mark:"none", markCol:"#2E5462"},

  /* ===== Port Alfred - beginner ===== */
  {id:"capestump", n:"Cape stumpnose", areas:["pa"], rar:"common", kg:[0.3,1.5], rpk:32,
   dep:[8,45], len:[26,36], sp:0.8, shape:"deep", tail:"fork", dorsal:"spiny", head:"point",
   back:"#5E6E7A", mid:"#C8D6DE", belly:"#EEF3F6", mark:"yellowfin", markCol:"#E8C24A"},

  {id:"stumpnose", n:"White stumpnose", areas:["pa"], rar:"common", kg:[0.4,2.5], rpk:38,
   dep:[12,60], len:[28,40], sp:0.75, shape:"deep", tail:"fork", dorsal:"spiny", head:"point",
   back:"#7E8A92", mid:"#DCE4E9", belly:"#F3F7F9", mark:"bars", markCol:"#9EAAB2"},

  {id:"baardman", n:"Baardman", areas:["pa"], rar:"uncommon", kg:[1,6], rpk:48,
   dep:[20,90], len:[34,52], sp:0.65, shape:"deep", tail:"round", dorsal:"long", head:"blunt",
   back:"#4C4A46", mid:"#A8A49C", belly:"#D8D4CA", mark:"bars", markCol:"#33322F"},

  {id:"grunter", n:"Spotted grunter", areas:["pa"], rar:"uncommon", kg:[1,8], rpk:54,
   dep:[15,80], len:[34,58], sp:0.8, shape:"deep", tail:"fork", dorsal:"spiny", head:"blunt",
   back:"#6E6A5E", mid:"#C6BEA8", belly:"#E8E2D2", mark:"spots", markCol:"#4A463C"},

  {id:"whitesteenbras", n:"White steenbras", areas:["pa"], rar:"uncommon", kg:[2,15], rpk:60,
   dep:[20,100], len:[38,68], sp:0.75, shape:"deep", tail:"fork", dorsal:"spiny", head:"point",
   back:"#6C7680", mid:"#CCD6DE", belly:"#EDF2F6", mark:"bars", markCol:"#8E9AA4"},

  {id:"sandshark", n:"Sand shark", areas:["pa"], rar:"uncommon", kg:[3,20], rpk:30,
   dep:[30,120], len:[52,88], sp:0.6, shape:"flat", tail:"point", dorsal:"low", head:"shovel",
   back:"#8A8574", mid:"#C4BDA6", belly:"#E4DECA", mark:"none", markCol:"#6A6656"},

  {id:"riversnapper", n:"River snapper", areas:["pa"], rar:"rare", kg:[2,12], rpk:78,
   dep:[25,110], len:[36,60], sp:0.9, shape:"deep", tail:"fork", dorsal:"spiny", head:"blunt",
   back:"#6A3A2E", mid:"#B4705A", belly:"#DCAE96", mark:"none", markCol:"#4A2820"},

  {id:"duskykob", n:"Dusky kob", areas:["pa"], rar:"rare", kg:[5,40], rpk:82,
   dep:[45,170], len:[54,100], sp:0.8, shape:"torpedo", tail:"point", dorsal:"twin", head:"normal",
   back:"#5E5A4E", mid:"#B4AC96", belly:"#DCD5C2", mark:"lateral", markCol:"#8A8270"},

  {id:"raggie", n:"Raggedtooth shark", areas:["pa"], rar:"epic", kg:[40,150], rpk:34,
   dep:[70,185], len:[92,150], sp:0.7, shape:"shark", tail:"shark", dorsal:"shark", head:"point",
   back:"#6A6E70", mid:"#A8ACAE", belly:"#D6D8D8", mark:"blotch", markCol:"#87684C"},

  {id:"trophykob", n:"Trophy kob", areas:["pa"], rar:"legendary", kg:[40,70], rpk:120,
   dep:[110,190], len:[100,132], sp:0.75, shape:"torpedo", tail:"point", dorsal:"twin", head:"normal",
   back:"#7E7458", mid:"#DCCFA4", belly:"#F2EBD4", mark:"lateral", markCol:"#B8A87E"},

  /* ===== False Bay - intermediate ===== */
  {id:"hottentot", n:"Hottentot", areas:["fb"], rar:"common", kg:[0.3,2], rpk:34,
   dep:[15,70], len:[26,38], sp:0.65, shape:"deep", tail:"fork", dorsal:"spiny", head:"blunt",
   back:"#4A5866", mid:"#A6B4C0", belly:"#D4DEE6", mark:"bars", markCol:"#32404C"},

  {id:"panga", n:"Panga", areas:["fb"], rar:"common", kg:[0.4,2], rpk:36,
   dep:[30,110], len:[28,38], sp:0.7, shape:"deep", tail:"fork", dorsal:"spiny", head:"point",
   back:"#8E5A48", mid:"#DBA286", belly:"#F0CDB6", mark:"none", markCol:"#6A3E30"},

  {id:"galjoen", n:"Galjoen", areas:["fb"], rar:"uncommon", kg:[0.8,5], rpk:52,
   dep:[12,65], len:[30,46], sp:0.6, shape:"verydeep", tail:"fork", dorsal:"spiny", head:"blunt",
   back:"#242E36", mid:"#4E5E68", belly:"#7E8E98", mark:"none", markCol:"#161D22"},

  {id:"redroman", n:"Red roman", areas:["fb"], rar:"uncommon", kg:[0.5,4], rpk:62,
   dep:[25,110], len:[28,44], sp:0.65, shape:"deep", tail:"round", dorsal:"spiny", head:"blunt",
   back:"#A8341E", mid:"#E0714C", belly:"#F4A886", mark:"spots", markCol:"#F6E2C6"},

  {id:"snoek", n:"Snoek", areas:["fb"], rar:"uncommon", kg:[2,9], rpk:44,
   dep:[40,160], len:[54,84], sp:1.4, shape:"slim", tail:"fork", dorsal:"long", head:"point",
   back:"#3E5A68", mid:"#9EBECC", belly:"#DCEAF0", mark:"none", markCol:"#2A4250"},

  {id:"silverkob", n:"Silver kob", areas:["fb"], rar:"uncommon", kg:[1,15], rpk:64,
   dep:[40,170], len:[38,74], sp:0.85, shape:"torpedo", tail:"point", dorsal:"twin", head:"normal",
   back:"#7E828C", mid:"#D2D8DE", belly:"#EEF2F5", mark:"lateral", markCol:"#A2A8B0"},

  {id:"katonkel", n:"Katonkel", areas:["fb"], rar:"rare", kg:[3,15], rpk:70,
   dep:[50,190], len:[52,84], sp:1.6, shape:"slim", tail:"lunate", dorsal:"twin", head:"point",
   back:"#33526A", mid:"#A4C2D4", belly:"#E0EDF3", mark:"bars", markCol:"#5E7E92"},

  {id:"geelbek", n:"Geelbek", areas:["fb"], rar:"rare", kg:[3,25], rpk:76,
   dep:[70,240], len:[48,88], sp:0.95, shape:"torpedo", tail:"fork", dorsal:"twin", head:"normal",
   back:"#5E6E5C", mid:"#B6C2A0", belly:"#E2E8CC", mark:"yellowfin", markCol:"#E0CC64"},

  {id:"yellowtail", n:"Yellowtail", areas:["fb"], rar:"rare", kg:[4,40], rpk:80,
   dep:[60,250], len:[50,96], sp:1.7, shape:"torpedo", tail:"lunate", dorsal:"twin", head:"point",
   back:"#2E5468", mid:"#9CBED0", belly:"#DCEBF2", mark:"yellowfin", markCol:"#EBC44A"},

  {id:"seventyfour", n:"Seventy-four", areas:["fb"], rar:"epic", kg:[5,30], rpk:110,
   dep:[100,290], len:[48,82], sp:0.7, shape:"deep", tail:"fork", dorsal:"spiny", head:"blunt",
   back:"#8E3A52", mid:"#D4849A", belly:"#EEBECC", mark:"stripe", markCol:"#F0DCE4"},

  {id:"bronzewhaler", n:"Bronze whaler", areas:["fb"], rar:"epic", kg:[60,200], rpk:30,
   dep:[120,310], len:[100,158], sp:0.85, shape:"shark", tail:"shark", dorsal:"shark", head:"point",
   back:"#7A6A50", mid:"#B0A184", belly:"#DCD5C2", mark:"none", markCol:"#5A4E3A"},

  {id:"cowshark", n:"Sevengill cowshark", areas:["fb"], rar:"legendary", kg:[80,250], rpk:44,
   dep:[160,320], len:[112,170], sp:0.6, shape:"shark", tail:"shark", dorsal:"shark", head:"blunt",
   back:"#5A6068", mid:"#909AA2", belly:"#C6CED4", mark:"spots", markCol:"#3A4048"},

  {id:"greatwhite", n:"Great white", areas:["fb"], rar:"mythic", kg:[400,1000], rpk:0,
   tag:true, dep:[190,320], len:[150,215], sp:0.75, shape:"shark", tail:"shark", dorsal:"shark",
   head:"point", back:"#4E565E", mid:"#8E979E", belly:"#E8ECEE", mark:"none", markCol:"#333A40"},

  /* ===== St Lucia - expert ===== */
  {id:"bonito", n:"Bonito", areas:["sl"], rar:"common", kg:[1,6], rpk:40,
   dep:[20,110], len:[32,50], sp:1.5, shape:"torpedo", tail:"lunate", dorsal:"twin", head:"point",
   back:"#2C4E66", mid:"#9EBCCE", belly:"#DEEBF2", mark:"stripe", markCol:"#44647C"},

  {id:"queenfish", n:"Queenfish", areas:["sl"], rar:"uncommon", kg:[2,12], rpk:52,
   dep:[20,120], len:[42,70], sp:1.5, shape:"slim", tail:"lunate", dorsal:"twin", head:"point",
   back:"#5C7686", mid:"#C2D6E0", belly:"#EBF3F7", mark:"spots", markCol:"#7E94A2"},

  {id:"bluefinking", n:"Bluefin kingfish", areas:["sl"], rar:"uncommon", kg:[2,12], rpk:58,
   dep:[25,130], len:[38,62], sp:1.55, shape:"deep", tail:"lunate", dorsal:"twin", head:"blunt",
   back:"#2A4E7E", mid:"#7EA2C8", belly:"#D2E2EE", mark:"yellowfin", markCol:"#3E76B4"},

  {id:"gtrevally", n:"Trevally", areas:["sl"], rar:"rare", kg:[10,60], rpk:74,
   dep:[40,200], len:[58,110], sp:1.6, shape:"deep", tail:"lunate", dorsal:"twin", head:"blunt",
   back:"#4A5560", mid:"#A6B2BC", belly:"#DDE4E9", mark:"none", markCol:"#333C44"},

  {id:"couta", n:"King mackerel", areas:["sl"], rar:"rare", kg:[5,35], rpk:78,
   dep:[45,220], len:[62,116], sp:1.7, shape:"slim", tail:"lunate", dorsal:"twin", head:"point",
   back:"#2E4A5E", mid:"#94B4C6", belly:"#D8E8F0", mark:"bars", markCol:"#5A7E94"},

  {id:"dorado", n:"Dorado", areas:["sl"], rar:"rare", kg:[3,25], rpk:84,
   dep:[25,150], len:[48,92], sp:1.75, shape:"slim", tail:"lunate", dorsal:"sail", head:"blunt",
   back:"#1E6E52", mid:"#66C48E", belly:"#E8D85C", mark:"spots", markCol:"#2A8A64"},

  {id:"guitarfish", n:"Giant guitarfish", areas:["sl"], rar:"rare", kg:[20,120], rpk:36,
   dep:[60,230], len:[86,142], sp:0.55, shape:"flat", tail:"point", dorsal:"low", head:"shovel",
   back:"#8A8270", mid:"#BEB6A0", belly:"#E0DAC8", mark:"none", markCol:"#6A6454"},

  {id:"yellowfin", n:"Yellowfin tuna", areas:["sl"], rar:"rare", kg:[15,80], rpk:92,
   dep:[70,300], len:[64,124], sp:1.8, shape:"torpedo", tail:"lunate", dorsal:"twin", head:"point",
   back:"#1E4468", mid:"#7EA6C4", belly:"#D6E6F0", mark:"yellowfin", markCol:"#E8C43C"},

  {id:"wahoo", n:"Wahoo", areas:["sl","sod"], rar:"epic", kg:[10,60], rpk:104,
   dep:[80,300], len:[74,132], sp:1.95, shape:"slim", tail:"lunate", dorsal:"long", head:"point",
   back:"#26405C", mid:"#8098B4", belly:"#D2DEEA", mark:"bars", markCol:"#44648C"},

  {id:"sailfish", n:"Sailfish", areas:["sl","sod"], rar:"epic", kg:[20,70], rpk:112,
   dep:[90,320], len:[92,146], sp:1.85, shape:"bill", tail:"lunate", dorsal:"sail", head:"bill",
   back:"#1E3E6E", mid:"#4E86C0", belly:"#CADCEE", mark:"stripe", markCol:"#7FB0DC"},

  {id:"zambezi", n:"Zambezi shark", areas:["sl","sod"], rar:"epic", kg:[80,300], rpk:32,
   dep:[110,360], len:[110,172], sp:0.9, shape:"shark", tail:"shark", dorsal:"shark", head:"blunt",
   back:"#6E7468", mid:"#A2A898", belly:"#D6DACA", mark:"none", markCol:"#4E5448"},

  {id:"blackmarlin", n:"Black marlin", areas:["sl","sod"], rar:"legendary", kg:[100,600], rpk:64,
   dep:[180,440], len:[130,215], sp:1.6, shape:"bill", tail:"lunate", dorsal:"long", head:"bill",
   back:"#16324E", mid:"#3E76A8", belly:"#C4D8E8", mark:"none", markCol:"#4E8CC0"},

  {id:"bluemarlin", n:"Blue marlin", areas:["sl","sod"], rar:"legendary", kg:[80,450], rpk:68,
   dep:[170,430], len:[126,204], sp:1.65, shape:"bill", tail:"lunate", dorsal:"long", head:"bill",
   back:"#1C3A72", mid:"#4A7CC4", belly:"#CCDCEF", mark:"stripe", markCol:"#6E9ED8"},

  {id:"broadbill", n:"Broadbill swordfish", areas:["sl","sod"], rar:"legendary", kg:[50,350], rpk:76,
   dep:[240,460], len:[120,196], sp:1.35, shape:"bill", tail:"lunate", dorsal:"sail", head:"bill",
   back:"#2E3A4A", mid:"#76879A", belly:"#CDD6DE", mark:"none", markCol:"#4A5666"},

  {id:"tigershark", n:"Tiger shark", areas:["sl","sod"], rar:"legendary", kg:[150,600], rpk:40,
   dep:[200,450], len:[134,208], sp:0.85, shape:"shark", tail:"shark", dorsal:"shark", head:"blunt",
   back:"#5A6250", mid:"#96A084", belly:"#D2D8C4", mark:"bars", markCol:"#3A4034"},

  {id:"coelacanth", n:"Coelacanth", areas:["sl","sod"], rar:"mythic", kg:[30,90], rpk:1900,
   bounty:true, dep:[330,460], len:[86,128], sp:0.32, shape:"deep", tail:"round", dorsal:"twin",
   head:"blunt", back:"#22406A", mid:"#5F86B4", belly:"#9CBCD8", mark:"spots", markCol:"#DCE8F4"},

  /* ===== Sodwana Bay - nothing under epic lives out here ===== */
  {id:"mantaray", n:"Manta ray", areas:["sod"], rar:"epic", kg:[150,900], rpk:0,
   tag:true, dep:[25,140], len:[120,190], sp:0.55, shape:"flat", tail:"point", dorsal:"low",
   head:"shovel", back:"#1E2A38", mid:"#4A5C70", belly:"#DDE4EA", mark:"blotch", markCol:"#C6D2DC"},

  {id:"potatobass", n:"Potato bass", areas:["sod"], rar:"epic", kg:[20,110], rpk:900,
   dep:[40,180], len:[74,132], sp:0.45, shape:"verydeep", tail:"round", dorsal:"spiny",
   head:"blunt", back:"#4E4A40", mid:"#9A9384", belly:"#CFC9BA", mark:"spots", markCol:"#332F28"},

  {id:"kingfish", n:"Giant kingfish", areas:["sod"], rar:"legendary", kg:[35,85], rpk:1100,
   dep:[30,160], len:[86,140], sp:1.7, shape:"deep", tail:"lunate", dorsal:"twin",
   head:"blunt", back:"#3A4652", mid:"#9BA8B4", belly:"#DCE3E9", mark:"none", markCol:"#2A343E"},

  {id:"dogtooth", n:"Dogtooth tuna", areas:["sod"], rar:"mythic", kg:[40,110], rpk:3800,
   dep:[60,300], len:[96,152], sp:1.9, shape:"torpedo", tail:"lunate", dorsal:"twin",
   head:"point", back:"#1C3A54", mid:"#6E92AE", belly:"#D2E0EA", mark:"stripe", markCol:"#8FB2C8"},

  {id:"whaleshark", n:"Whale shark", areas:["sod"], rar:"mythic", kg:[900,4000], rpk:0,
   tag:true, dep:[20,120], len:[170,240], sp:0.35, shape:"shark", tail:"shark", dorsal:"shark",
   head:"blunt", back:"#2E4256", mid:"#5A7288", belly:"#D6DEE4", mark:"spots", markCol:"#E4ECF2"}
];

/* ---- gear ---------------------------------------------------------------
   Real gear classes and specs; model names are descriptive, not brand names.
   rod  : maxKg  - the fish weight the blank handles before it lets go
   reel : depth  - line capacity in metres;  drag - kg of drag;  spd - retrieve
   line : kg     - breaking strain
   lure : boost  - shifts spawns toward the rarer end;  val - price multiplier
   ------------------------------------------------------------------------ */
var GEAR = {
  rod: [
    {id:"r1", n:"Shimano Sienna Spin 6'6\"",  spec:"3-6 kg light spin",    lvl:1,  cost:0,      maxKg:9},
    {id:"r2", n:"Daiwa Sensor Surf 10'",       spec:"6-10 kg surf",         lvl:3,  cost:900,    maxKg:18},
    {id:"r3", n:"Shimano Raider Inshore 8'",   spec:"8-15 kg inshore",      lvl:6,  cost:2600,   maxKg:32},
    {id:"r4", n:"Penn Rampage Boat",           spec:"15 kg boat class",     lvl:10, cost:7500,   maxKg:60},
    {id:"r5", n:"Shimano T-Curve Stand-Up",    spec:"24 kg stand-up",       lvl:15, cost:22000,  maxKg:115},
    {id:"r6", n:"Penn International V",        spec:"37 kg game",           lvl:21, cost:60000,  maxKg:230},
    {id:"r7", n:"Shimano Tiagra Ultra",        spec:"60 kg bluewater",      lvl:27, cost:150000,  maxKg:480},
    {id:"r8", n:"Penn International V 130",    spec:"130 lb unlimited",     lvl:30, cost:1000000, maxKg:750},
    {id:"r9", n:"Shimano Tiagra Ultra 130",    spec:"130 lb tournament",    lvl:40, cost:5000000, maxKg:1500}
  ],
  reel: [
    {id:"e1", n:"Shimano Sienna 2500",     spec:"4 kg drag, 150 m",     lvl:1,  cost:0,      depth:60,  drag:4,  spd:2.2, holds:20},
    {id:"e2", n:"Daiwa BG 4000",           spec:"7 kg drag, 220 m",     lvl:2,  cost:700,    depth:95,  drag:7,  spd:2.5, holds:35},
    {id:"e3", n:"Penn Battle III 6000",    spec:"11 kg drag, 300 m",    lvl:5,  cost:2200,   depth:140, drag:11, spd:2.8, holds:55},
    {id:"e4", n:"Penn Slammer IV 8500",    spec:"15 kg drag, 350 m",    lvl:8,  cost:6000,   depth:190, drag:15, spd:3.1, holds:75},
    {id:"e5", n:"Shimano Stella SW 14000", spec:"25 kg drag, 420 m",    lvl:13, cost:18000,  depth:250, drag:25, spd:3.4, holds:125},
    {id:"e6", n:"Penn International VI 30",spec:"36 kg full drag",      lvl:18, cost:45000,  depth:330, drag:36, spd:3.8, holds:180},
    {id:"e7", n:"Shimano Tiagra 50W",      spec:"45 kg lever drag",     lvl:24, cost:110000,  depth:460, drag:45,  spd:4.2, holds:225},
    {id:"e8", n:"Shimano Tiagra 130A",     spec:"70 kg lever drag",     lvl:30, cost:1000000, depth:560, drag:70,  spd:4.6, holds:750},
    {id:"e9", n:"Penn International 130VSX", spec:"140 kg two-speed",   lvl:40, cost:5000000, depth:640, drag:140, spd:5.0, holds:1500}
  ],
  line: [
    {id:"l1", n:"Maxima Ultragreen",       spec:"4 kg mono",            lvl:1,  cost:0,     kg:4},
    {id:"l2", n:"Berkley Trilene Big Game",spec:"8 kg mono",            lvl:2,  cost:450,   kg:8},
    {id:"l3", n:"PowerPro braid",          spec:"15 kg, 0.19 mm",       lvl:5,  cost:1600,  kg:15},
    {id:"l4", n:"Daiwa J-Braid x8",        spec:"24 kg, 0.28 mm",       lvl:9,  cost:5000,  kg:24},
    {id:"l5", n:"Sufix 832",               spec:"37 kg, 0.36 mm",       lvl:14, cost:15000, kg:37},
    {id:"l6", n:"PowerPro Hollow Ace",     spec:"60 kg hollow braid",   lvl:20, cost:42000, kg:60},
    {id:"l7", n:"Jerry Brown Hollow",      spec:"100 kg hollow braid",  lvl:26, cost:95000,   kg:100},
    {id:"l8", n:"Momoi Hi-Catch 400 lb",  spec:"180 kg mono leader",   lvl:30, cost:1000000, kg:188},
    {id:"l9", n:"Momoi Diamond 800 lb",   spec:"360 kg big-game",      lvl:40, cost:5000000, kg:375}
  ],
  lure: [
    {id:"u1", n:"Mustad baitholder",  spec:"plain hook and bait",   lvl:1,  cost:0,     boost:0.00, val:1.00},
    {id:"u2", n:"Sardine cut bait",   spec:"the local standby",     lvl:2,  cost:400,   boost:0.10, val:1.05},
    {id:"u3", n:"Halco Twisty",       spec:"chrome casting spoon",  lvl:4,  cost:1200,  boost:0.22, val:1.10},
    {id:"u4", n:"Z-Man dropshot rig", spec:"soft plastic",          lvl:7,  cost:3500,  boost:0.36, val:1.18},
    {id:"u5", n:"Live mackerel",      spec:"nothing beats it",      lvl:11, cost:9000,  boost:0.52, val:1.28},
    {id:"u6", n:"Shimano Butterfly",  spec:"vertical speed jig",    lvl:16, cost:26000, boost:0.70, val:1.40},
    {id:"u7", n:"Rapala X-Rap Magnum",spec:"skirted trolling lure", lvl:22, cost:70000, boost:0.90, val:1.60}
  ]
};
var GEAR_KINDS = [
  {k:"rod",  n:"Rods",  blurb:"Holds the weight. Overload it and the blank goes."},
  {k:"reel", n:"Reels", blurb:"Line capacity sets your depth. Drag stops a spooling."},
  {k:"line", n:"Line",  blurb:"Breaking strain. The single most common way to lose a fish."},
  {k:"lure", n:"Lures", blurb:"What you attract, and what it fetches at the market."}
];

/* ---- skills -------------------------------------------------------------
   Techniques, not equipment - nothing here duplicates a gear stat.
   ------------------------------------------------------------------------ */
var SKILLS = {
  hookset:  {n:"Hookset",       blurb:"width of the bite",              unit:"cm",  base:11, step:2.4,  cost:220,  growth:1.80, dec:0, lvl:1},
  thumb:    {n:"Thumb control", blurb:"slows the drop for tight gaps",  unit:"% ",  base:0,  step:10,   cost:260,  growth:1.82, dec:0, lvl:1},
  chum:     {n:"Chumming",      blurb:"thins small fry out of the water", unit:"% ", base:0, step:11,   cost:420,  growth:1.86, dec:0, lvl:3},
  scavenger:{n:"Scavenger",     blurb:"less debris in the water",        unit:"% ", base:0, step:11,   cost:380,  growth:1.84, dec:0, lvl:4},
  livewell: {n:"Livewell",      blurb:"how high the run bonus climbs",  unit:"x",   base:3,  step:0.45, cost:520,  growth:1.86, dec:1, lvl:6},
  deckhand: {n:"Deckhand",      blurb:"less drag from a heavy haul",    unit:"% ",  base:0,  step:9,    cost:700,  growth:1.85, dec:0, lvl:8},
  sense:    {n:"Fish sense",    blurb:"reads weight and rarity in the water", unit:"m", base:0, step:26, cost:900, growth:1.84, dec:0, lvl:11},
  steady:   {n:"Steady hands",  blurb:"lowers the risk of a break-off", unit:"% ",  base:0,  step:7,    cost:1400, growth:1.88, dec:0, lvl:14},
  monger:   {n:"Fishmonger",    blurb:"what the market pays you",       unit:"% ",  base:0,  step:8,    cost:2000, growth:1.90, dec:0, lvl:17},
  sapper:   {n:"Sapper",        blurb:"shrug off the first mine each run", unit:"%",base:0,  step:12,   cost:3200, growth:1.92, dec:0, lvl:21},
  sweeper:  {n:"Minesweeper",   blurb:"fewer mines laid in the water",   unit:"% ", base:0, step:11,   cost:2600, growth:1.90, dec:0, lvl:24}
};
var SKILL_ORDER = ["hookset","thumb","chum","scavenger","livewell","deckhand","sense","steady","monger","sapper","sweeper"];
var MAXLVL = 8;

/* ---- junk and mines ----------------------------------------------------- */
var JUNK = [
  {n:"Veldskoen",    len:30, kg:1.2, s:"boot"},
  {n:"Tin can",      len:23, kg:0.4, s:"can"},
  {n:"Old tyre",     len:42, kg:6.0, s:"tyre"},
  {n:"Tangled line", len:34, kg:0.8, s:"tangle"}
];

/* ---- levelling ---------------------------------------------------------- */
var MAX_PLAYER_LVL = 45;
/* Sodwana's epic-plus fish pay so much xp that without this the last ten
   levels would fall in a handful of casts. Levels below 28 are untouched. */
function xpForLevel(n){
  var tail = 1 + Math.max(0, n - 28) / 8;
  return Math.round(65 * Math.pow(n, 1.34) * tail);
}   /* xp to go from n to n+1 */
function xpTotalTo(n){
  var t = 0;
  for(var i=1;i<n;i++) t += xpForLevel(i);
  return t;
}

/* body height as a fraction of length, per body plan */
var SHAPE_RATIO = {
  bait:0.26, slim:0.19, torpedo:0.33, deep:0.54, verydeep:0.70,
  shark:0.26, bill:0.23, flat:0.50
};
function bodyRatio(f){ return SHAPE_RATIO[f.shape] || 0.32; }

/* A fish is fought, not winched: line class is well below what a rig lands.
   Real 60 kg line takes a 400 kg marlin, so capacity is the class times this. */
var LINE_FACTOR = 4;
/* legacy fallback if a reel has no explicit holds figure */
var SPOOL_FACTOR = 5;

/* ---- crew and boat skins -------------------------------------------------
   Bought with the same rand the fish earn. Purely cosmetic - nothing here
   changes how the game plays.
   ------------------------------------------------------------------------ */
var CHAR_SKINS = [
  {id:"c1", n:"Deckhand",          sub:"shorts and a faded tee",   lvl:1,  cost:0,
   skin:"#C08A5E", shirt:"#B8442F", trouser:"#2E3A44", hat:null,      hatCol:"#1E2A33"},
  {id:"c2", n:"Ski-boat skipper",  sub:"cap, shades, sunblock",    lvl:5,  cost:15000,
   skin:"#B87F52", shirt:"#2E6E7E", trouser:"#26313A", hat:"cap",     hatCol:"#14313A"},
  {id:"c3", n:"Charter captain",   sub:"whites and a peaked cap",  lvl:12, cost:120000,
   skin:"#C99A6E", shirt:"#E6EDE9", trouser:"#1C2833", hat:"peaked",  hatCol:"#0F1A22"},
  {id:"c4", n:"Tournament angler", sub:"team shirt, fighting belt",lvl:20, cost:600000,
   skin:"#A9724A", shirt:"#1E4E86", trouser:"#12202B", hat:"cap",     hatCol:"#123A66"},
  {id:"c5", n:"Big-game skipper",  sub:"foul-weather gear",        lvl:30, cost:2500000,
   skin:"#8E5F3C", shirt:"#E8A22E", trouser:"#22303A", hat:"sou",     hatCol:"#D18F22"},
  {id:"c6", n:"Sodwana legend",    sub:"sun-bleached and salted",  lvl:40, cost:12000000,
   skin:"#7C5233", shirt:"#0F3A34", trouser:"#0C1C22", hat:"wide",    hatCol:"#4A3B24"}
];

var BOAT_SKINS = [
  {id:"b1", n:"Old ski-boat",      sub:"it floats, mostly",        lvl:1,  cost:0,
   hull:"#101E28", cabin:"#162833", trim:"#2B4453", len:44},
  {id:"b2", n:"Cape ski-boat",     sub:"twin outboards",           lvl:6,  cost:25000,
   hull:"#16323E", cabin:"#1E4452", trim:"#3E7286", len:48},
  {id:"b3", n:"Deep-sea cat",      sub:"catamaran hull",           lvl:14, cost:250000,
   hull:"#1A2E3E", cabin:"#E6EDE9", trim:"#5FA8C4", len:54},
  {id:"b4", n:"Sportfisher",       sub:"flybridge and outriggers", lvl:24, cost:1200000,
   hull:"#E6EDE9", cabin:"#243642", trim:"#C8412E", len:60},
  {id:"b5", n:"Bluewater cruiser", sub:"tuna tower",               lvl:33, cost:6000000,
   hull:"#0E2A36", cabin:"#E8DFC8", trim:"#E8A22E", len:66},
  {id:"b6", n:"Sodwana battlewagon", sub:"built for the shelf",    lvl:42, cost:20000000,
   hull:"#101820", cabin:"#2E4656", trim:"#5FDCC0", len:74}
];
