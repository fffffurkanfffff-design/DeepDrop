# Putting Deep Drop online — for whoever is doing the Netlify upload

This folder is a small website with one background function that keeps the
shared leaderboard. Two ways to put it up. **Pick one.**

> **Important:** dragging this folder onto Netlify's upload box will NOT work.
> Netlify skips the build step for dragged folders, so the leaderboard function
> never gets installed and the board stays empty. Both methods below avoid that.

---

## Method 1 — GitHub (no software to install)

Best if you don't already have Node.js. Everything happens in the browser.

1. **Unzip this folder** somewhere you can find it.

2. Go to <https://github.com/new>, give the repository any name, choose
   **Private** if you like, and click **Create repository**.

3. On the next page click **uploading an existing file**. Drag in *everything*
   from the unzipped folder — including the `src` and `netlify` folders — and
   click **Commit changes**.

4. Go to <https://app.netlify.com> → **Add new site** → **Import an existing
   project** → **GitHub**, and pick the repository you just made.

5. Netlify reads the settings from `netlify.toml` and fills the build in for
   you. Leave everything as it is and click **Deploy**.

Wait about a minute. Netlify gives you a web address and the game is live.
Every time you upload a change to GitHub, the site updates itself.

---

## Method 2 — one command (needs Node.js)

Faster if you already have Node.js, or don't mind installing it.

1. Install Node.js from <https://nodejs.org> (take the "LTS" one) if you
   haven't got it.

2. Unzip this folder. Open a terminal **inside** it:
   - **Windows:** open the folder, click the address bar, type `cmd`, press Enter
   - **Mac:** right-click the folder → Services → New Terminal at Folder

3. Run these two lines, one at a time:

```bash
npm install
```

```bash
npm run deploy
```

The first one fetches what the leaderboard needs. The second opens your browser
to log in to Netlify, asks which site to use — choose **Create & configure a new
site** — and then puts it online. From then on, `npm run deploy` is the only
command you need.

---

## Checking it worked

Open the site and look at the **Leaderboard** panel, bottom right.

| What it says | Meaning |
|---|---|
| **Live · all players** | Working. Everyone shares one board. |
| **Shared board offline** | The function didn't ship — the panel names the error. Almost always means the folder was dragged in instead of using a method above. |
| **This laptop** | You're opening the file directly rather than the website. Use the Netlify address. |

A board can be empty and still be working — a score is only sent once someone
lands a haul, so play one round and it will appear.

---

## If you want to change the game later

`src/10-data.js` holds the fish, gear and prices. After editing anything in
`src/`, run `npm run build` (Method 2) or just upload the change to GitHub
(Method 1). See `README.md` for the details.
