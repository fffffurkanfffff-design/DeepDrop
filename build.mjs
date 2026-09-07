/* Assembles src/ into the two single-file builds:
     public/index.html          - the hosted site (leaderboard talks to /api/scores)
     ../Deep Drop.html          - the copy you email; identical file, adapts itself
   Run with:  npm run build
*/
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const src = (f) => readFileSync(join(here, "src", f), "utf8");

const SCRIPTS = ["10-data.js", "20-state.js", "30-sim.js", "40-render.js", "50-ui.js", "60-main.js"];

const head = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Deep Drop</title>
<meta name="description" content="Deep Drop - an arcade fishing game on the South African coast. Rarity, real gear, and three fisheries.">
<link rel="icon" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%20100%20100'%3E%3Ctext%20y='.9em'%20font-size='90'%3E%F0%9F%8E%A3%3C/text%3E%3C/svg%3E">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@600;800&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
html{color-scheme:dark;background:#050B12}
body{margin:0}
img{max-width:100%}
[hidden]{display:none!important}
${src("00-style.css")}
</style>
</head>
<body>
`;

const body = src("01-body.html");
const code = SCRIPTS.map((f) => `/* ---- ${f} ---- */\n${src(f)}`).join("\n\n");

const page = `${head}${body}
<script>
(function(){
"use strict";
${code}
})();
</script>
</body>
</html>
`;

/* The Artifact host supplies <!doctype>/<html>/<head>/<body> itself, so that
   copy ships as a fragment: title + font links + style + body + script only. */
const fragment = `<title>Deep Drop</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Saira+Condensed:wght@600;800&family=Barlow:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500;600&display=swap">
<style>
${src("00-style.css")}
</style>
${body}
<script>
(function(){
"use strict";
${code}
})();
</script>
`;
/* Only refresh the artifact copy where one already exists, so a fresh
   checkout on someone else's machine does not sprout extra files. */
const artifactPath = join(here, "artifact.html");
if (existsSync(artifactPath)) {
  writeFileSync(artifactPath, fragment, "utf8");
  console.log("wrote artifact.html (fragment, " + Math.round(fragment.length/1024) + " KB)");
}

/* public/index.html is the site and is always written. The downloadable copy
   lives beside this folder and is only refreshed if it is already there. */
writeFileSync(join(here, "public", "index.html"), page, "utf8");
console.log("wrote public/index.html (" + Math.round(page.length / 1024) + " KB)");

const sibling = join(here, "..", "Deep Drop.html");
if (existsSync(sibling)) {
  writeFileSync(sibling, page, "utf8");
  console.log("wrote " + sibling + " (" + Math.round(page.length / 1024) + " KB)");
}

/* sanity: every script part must have made it in */
for (const f of SCRIPTS) {
  if (!page.includes(`/* ---- ${f} ---- */`)) {
    console.error("MISSING PART:", f);
    process.exit(1);
  }
}
console.log("ok - " + SCRIPTS.length + " script parts assembled");
