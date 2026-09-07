# Deep Drop — Netlify site with a shared leaderboard

This folder is the version of the game that runs on a website, with **one
leaderboard shared by everyone who plays**.

```
public/index.html            the game
netlify/functions/scores.mjs the leaderboard API
netlify.toml                 tells Netlify where those two live
package.json                 dependencies + the deploy command
```

---

## Deploying it

Netlify's **drag-and-drop** upload will not work for this folder. Drag-and-drop
skips the build step, so the leaderboard function never gets its dependencies
installed and the board silently stays empty. Use one of the two below instead.

### Option A — one command (simplest)

Open a terminal in this folder and run:

```bash
npx netlify deploy --build --prod
```

The first time, it opens your browser to log in and asks which site to deploy
to — choose **Create & configure a new site**, or pick your existing Deep Drop
site to replace what's there. Every later deploy is that same one command.

### Option B — connect it to GitHub

Push this folder to a GitHub repository, then in Netlify choose
**Add new site → Import an existing project** and pick that repo. Netlify reads
`netlify.toml` and sets everything up. After that, every push redeploys.

---

## Trying it before you deploy

```bash
npm run dev
```

Then open <http://localhost:8888>. This runs the real function against a local
copy of the storage, so you can confirm the leaderboard works before it goes
live. Press `Ctrl+C` to stop it.

---

## How the leaderboard works

`GET /api/scores` returns the top 50 players. `POST /api/scores` submits one
score. The game posts your best haul when you finish a cast, and re-checks the
board every 12 seconds, so other players appear without a refresh.

Scores live in **Netlify Blobs** — storage built into Netlify. There is no
database to set up, no second account, and no API keys anywhere in the page.

Each player is stored under their own key, so two people landing a haul at the
same moment can't overwrite each other. Re-submitting a smaller haul never
replaces a bigger one, so an old tab left open can't wipe your record.

### One honest limitation

The game runs in the player's browser, so the score it sends is not something
the server can independently verify — anyone who knows how to open browser
developer tools could post a fake haul. The function rejects impossible values
and nonsense input, which is enough for a game among friends, but it is not
cheat-proof. Making it so would mean running the game itself on the server,
which is a much bigger build. Worth knowing before you share it widely.

If someone does post a junk score, delete it from
**Netlify dashboard → your site → Blobs → `deep-drop`**.

---

## Changing the game

The game is no longer one big file. Source lives in `src/` and a build step
stitches it together:

```
src/00-style.css     look and feel
src/01-body.html     page structure (the four tabs)
src/10-data.js       species, rarity, gear, skills, fisheries   <- balance lives here
src/20-state.js      progression, gear stats, saving, save codes
src/30-sim.js        spawning, the run, snap/spool/mine rules
src/40-render.js     canvas: fish, mines, water
src/50-ui.js         shop, skills, fisheries, panels, leaderboard
src/60-main.js       input and the game loop
```

Edit a file, then:

```bash
npm run build
```

That writes all three copies at once: `public/index.html` (the site),
`../Deep Drop.html` (the emailed copy) and `artifact.html`. `npm run dev` and
`npm run deploy` build first, so you never ship a stale copy.

Two dev tools, neither shipped:

```bash
node src/_balance.cjs      # can the gear curve actually land the fish? prints risks per fishery
```

`src/_species-sheet.html` draws every species side by side — copy it and
`10-data.js`/`40-render.js` into `public/` to view it, then delete them again.

### Tuning knobs

Almost all balance is in `src/10-data.js`:

- `RARITY` — `spawn` is relative frequency, `val` a price multiplier, `xp` the xp rate
- each fish's `kg` (real catch range), `rpk` (rand per kg) and `dep` (depth band)
- `GEAR` — real products; `lvl` gates it, `cost` prices it
- `LINE_FACTOR` (4) — a rig lands about 4x its line class
- `SPOOL_FACTOR` (5) — a reel handles about 5x its drag rating before it is spooled
- `xpForLevel()` — the levelling curve

Run the balance probe after changing any of these.
