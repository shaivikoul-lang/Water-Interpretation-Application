# Deploy WaterLens progressive disclosure UI (separate track)

This UI lives on **`feature/progressive-disclosure-ui`** — **not merged to `main`**.

The existing production site at  
`https://shaivikoul-lang.github.io/Water-Interpretation-Application/`  
stays on **`main`** until you change it.

---

## Option A — Separate GitHub Pages URL (recommended)

Use a **new repository** so both sites can run at the same time.

| Site | Branch / repo | URL |
|------|----------------|-----|
| **Original** | `main` in `Water-Interpretation-Application` | `.../Water-Interpretation-Application/` |
| **WaterLens guided UI** | new repo `WaterLens-Guided` | `.../WaterLens-Guided/` |

### One-time setup

```bash
cd /path/to/CAC_WaterInterpretation
git checkout feature/progressive-disclosure-ui
chmod +x scripts/build-github-pages-site.sh scripts/publish-waterlens-guided.sh
./scripts/publish-waterlens-guided.sh WaterLens-Guided
```

Then in GitHub:

1. Open **Shaivikoul/WaterLens-Guided** → **Settings** → **Pages**
2. Source: **Deploy from a branch** → **main** → **/ (root)**
3. Save — live in ~1–2 minutes at:

   **https://shaivikoul-lang.github.io/WaterLens-Guided/**

### Test URLs (new site)

| Page | URL |
|------|-----|
| Landing | `/` |
| Taste guided | `/pws/CO0118015_hrw/dashboard/dist/index.html?concern=taste` |
| PFAS | `?concern=pfas` |
| Explore | `/pws/CO0118015_hrw/dashboard/dist/index.html` |

Regenerate booth QR to point at the new URL when ready.

---

## Option B — Same repo, separate deploy branch

GitHub Actions (`.github/workflows/deploy-progressive-disclosure.yml`) deploys this branch to:

**`gh-pages-progressive-disclosure`**

On each push to `feature/progressive-disclosure-ui`.

To preview on the **same** project URL (replaces what Pages shows):

1. **Settings** → **Pages** → Source: **gh-pages-progressive-disclosure** branch → `/ (root)`

⚠️ Only one Pages source per repo — switching replaces the `main` deployment until you switch back.

---

## Local preview

```bash
./scripts/build-github-pages-site.sh
python3 -m http.server 8765 --directory _site
```

Open http://127.0.0.1:8765/

---

## What stays on main

- Classic stakeholder dashboard track
- No progressive-disclosure merge required
- Switch production whenever you choose

---

## Pending (not blocking deploy)

- HRW taste copy sign-off (`cac/hrw-taste-content-stakeholder-questions.md`)
- Usability test on taste path
