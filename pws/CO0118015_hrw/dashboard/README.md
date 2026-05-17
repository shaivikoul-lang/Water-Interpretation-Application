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

Output is in `dist/`. `vite.config.ts` sets `base: './'` so assets resolve when the app is opened from a subfolder (for example GitHub Pages or static hosting under `pws/CO0118015_hrw/dashboard/`).

### Opening `dashboard/index.html` from a static file server

The file at `dashboard/index.html` is the **Vite entry** (it references `src/main.tsx`). A plain static server cannot compile TypeScript, so that URL used to look “blank.”

A small inline script **redirects** `…/dashboard/index.html` → `…/dashboard/dist/index.html` when the path matches that pattern. The built bundle in `dist/` is what you should load for static hosting.

Run **`npm run build`** in this folder first so `dist/` exists. For local development, use **`npm run dev`** (default port **5173**; **4173** is treated as `vite preview` and skips the redirect).

If your dev server uses another port, open **`dist/index.html`** directly after a build, or temporarily rename paths so the redirect still applies.

## Classic layout

From the dashboard, use **Classic layout** to return to `../index.html`. The classic page links back here as **Open the dashboard layout**.
