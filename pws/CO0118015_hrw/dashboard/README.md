# Highlands Ranch Water — React dashboard

Consumer-style view of the same JSON as the classic `../index.html` page: hero snapshot, cards, trends (Recharts), and education copy. Built with Vite, React, TypeScript, Tailwind CSS v4, and Framer Motion.

## Prerequisites

- Node.js 20+ recommended

## Setup and run

```bash
npm install
npm run dev
```

`predev` / `prebuild` copy `../output.json` and `../education.json` into `public/data/` so the UI always matches the latest pipeline output from `../build_pws_output.py`.

## Production build

```bash
npm run build
```

Output is in `dist/`. `vite.config.ts` sets `base: './'` so assets resolve when the app is opened from a subfolder (for example GitHub Pages under `…/dashboard/dist/`).

The **`dist/`** folder is **checked into git** for this repo so GitHub Pages can serve the built app without running `npm run build` on every push. After you change dashboard source or HRW JSON, run **`npm run build`** here and commit the updated `dist/` files.

### Opening `dashboard/index.html` from a static file server

The file at `dashboard/index.html` is the **Vite entry** (it references `src/main.tsx`). A plain static server cannot compile TypeScript, so that URL redirects to **`dist/index.html`** when not on the Vite dev server.

On **GitHub Pages**, use **`dist/index.html`** directly (the HRW classic page links there). For local development, use **`npm run dev`** (port **5173**).

## Classic layout

From the dashboard, use **Classic layout** to return to `../index.html`. The classic page links back here as **Open the dashboard layout**.
