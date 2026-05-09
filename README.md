# RuneLite Tile Markers

A lightweight visual editor for RuneLite Ground Markers tile-marker JSON.

Forked from Explv's original map project: https://github.com/Explv/Explv.github.io

## Features

- Import existing RuneLite tile markers by pasting JSON.
- Add/remove markers visually on the OSRS map.
- Export back to RuneLite-compatible JSON.
- Jump/focus to imported markers.
- Optional auto-jump after import.
- Per-marker color and label support.

## Local Development

```bash
npm install
npm run dev
```

## Production Build

```bash
npm run build
```

Build output is written to `dist/`.

## GitHub Pages

- If your repository is `STRIKERnz.github.io`, set `base: '/'` in `vite.config.js`.
- If your repository is `Tilemarkers`, set `base: '/Tilemarkers/'` in `vite.config.js`.

Then push to `master` and deploy via GitHub Pages (GitHub Actions workflow is included in `.github/workflows/deploy.yml`).
