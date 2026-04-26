# Dominó Scorekeeper

A Progressive Web App (PWA) for scoring Dominican-style dominoes. Spanish-first, no ads, no tracking, works offline. Install on iPhone or Android by visiting the URL and adding to home screen.

**Created by José Rodríguez. Free to use at your own risk. No data collected — everything is stored locally on the user's device.**

---

## Features

- Two teams, two players each (editable names with pencil icon)
- Round-by-round scoring with running totals
- **Paso Corrido** quick-add bonus, stackable per round
- Edit or delete any round after the fact
- Save finished games to history
- Export a saved game as text (email / share)
- Share the current game as an image via the native share sheet
- Spanish / English toggle
- All data stays in `localStorage` — never sent to a server

---

## Deploying to GitHub Pages

The workflow at `.github/workflows/deploy.yml` builds and deploys automatically whenever you push to `main`. First-time setup:

1. **Create the repo** on GitHub (suggested: `jsrd12-apm/domino-scorekeeper`).

2. **Push this folder** to it:
   ```bash
   cd domino-build
   git init
   git add -A
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin git@github.com:jsrd12-apm/domino-scorekeeper.git
   git push -u origin main
   ```

3. **Enable Pages** with GitHub Actions:
   - Go to the repo on github.com → **Settings** → **Pages**
   - Under "Build and deployment", set **Source** to **GitHub Actions**

4. **Wait for the workflow to run** (~1 min). Watch it under the Actions tab.

5. The site will be live at: `https://jsrd12-apm.github.io/domino-scorekeeper/`

Share that URL — anyone who opens it on their phone can install:
- **Android / Chrome** → an install banner appears at the bottom; one tap.
- **iPhone / Safari** → tap Share → Add to Home Screen.

After install, it launches fullscreen with its own icon and works offline.

---

## Updating the app

```bash
# edit src/App.jsx
git add -A && git commit -m "feat: ..."
git push
```

The Actions workflow rebuilds and redeploys. Installed clients pick up the new version on next launch — but only if you bump the cache version. **Edit `public/service-worker.js` and bump `CACHE_VERSION`** (e.g. `'domino-v1'` → `'domino-v2'`) whenever you ship a change. Without bumping, browsers will keep serving the cached old files.

---

## Local development

```bash
npm install
npm run build         # produces dist/
npm run dev           # builds, then serves dist/ at http://localhost:8000
```

Service workers don't register on `file://` URLs, so always use the dev server, not double-clicking the HTML.

---

## Customization

Defaults live at the top of `src/App.jsx`:

```js
const APP_VERSION = '1.0';
const DEFAULT_FEEDBACK_EMAIL = 'jsrd12@gmail.com';
const DEFAULT_GITHUB_REPO = 'https://github.com/jsrd12-apm/domino-scorekeeper';
```

Change those, then change them in `package.json` and `public/manifest.json` as needed.

---

## Project layout

```
domino-build/
├── src/
│   ├── App.jsx          # main React component (the whole app)
│   ├── main.jsx         # entry point that mounts to #root
│   └── styles.css       # utility styles (Tailwind-style classes)
├── public/
│   ├── index.html       # HTML shell
│   ├── manifest.json    # PWA manifest
│   ├── service-worker.js
│   └── icon-*.png       # app icons
├── .github/workflows/
│   └── deploy.yml       # auto-deploy on push to main
├── build.js             # esbuild script
├── package.json
└── README.md            # this file
```

---

## License

Free software, use at your own risk. No warranty. No data collected. All data is stored locally on the user's device.
