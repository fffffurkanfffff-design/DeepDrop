# Updating Deep Drop — for whoever runs the Netlify site

The game already lives on Netlify. This replaces it with the newer version.
It takes a couple of minutes.

> **Replace the whole folder, not just the game file.** This update changed the
> leaderboard code as well as the game. If you only swap `public/index.html`,
> the game updates but big scores keep getting rejected by the leaderboard.

---

## Which method?

Use whichever one the site was set up with the first time.

### If it came from GitHub

1. **Unzip** this folder.
2. Open the repository on **github.com**.
3. Click **Add file → Upload files**, then drag in *everything* from the
   unzipped folder — including the `src` and `netlify` folders.
4. Scroll down and click **Commit changes**.

GitHub replaces the old files with the new ones. Netlify notices within a
minute, rebuilds, and the live site updates itself. Nothing else to do.

### If it was put up with a command

1. **Unzip** this folder somewhere.
2. Open a terminal inside it:
   - **Windows:** open the folder, click the address bar, type `cmd`, press Enter
   - **Mac:** right-click the folder → Services → New Terminal at Folder
3. Run these two lines, one at a time:

```bash
npm install
```

```bash
npm run deploy
```

When it asks which site, **choose the existing Deep Drop site** rather than
creating a new one — otherwise you end up with a second site at a different
address and the old one stays out of date.

---

## Checking it worked

Open the live site and look for these. All four should be true:

| Where | What you should see |
|---|---|
| Top row of tabs | Five tabs, ending in **Crew** |
| **Fisheries** tab | Four places, the last being **Sodwana Bay** |
| Right-hand column | A **Your code** panel under Skipper |
| Leaderboard panel | **Live · all players** |

If the leaderboard says **Shared board offline** in red, the function didn't
ship — the panel itself will name the error. That almost always means the folder
was dragged onto Netlify's upload box instead of using a method above.

---

## Nobody loses their progress

Existing players keep everything: name, money, best haul, gear, skill levels,
casts and depth records. This was tested against a save from the previous
version — it loaded with every value intact.

Two things players will notice:

- **They may gain a level.** Levelling was made faster, and the game recalculates
  from experience already earned. It never takes a level away.
- **Two new skills** (Scavenger and Minesweeper) start at level 1, and the new
  crew and boat skins start at the default. Everything else is untouched.

Progress is saved per browser, so it stays on the machine it was earned on. The
new **Your code** panel is how a player moves progress to another computer:
copy the code there, paste it in here. Codes from the previous version still work.

---

## What's new in this update

- **Sodwana Bay**, a fourth fishery unlocking at level 35 — 620 m deep, and
  nothing below epic lives there. Dogtooth tuna run to over R1 million.
- **Two more tiers of rod, reel and line** at R1 million and R5 million,
  handling 750 kg and 1500 kg.
- **Skills become dials once maxed** — set how strongly each one applies.
- **Two new skills**: Scavenger (less debris) and Minesweeper (fewer mines).
- **A skipper on the boat**, plus a Crew tab for buying outfits and boats.
- **Faster levelling** throughout.
