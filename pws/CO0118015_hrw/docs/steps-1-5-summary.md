# Steps 1–5 (Nick analyte expansion) — what changed

## Step 1 — Inventory

- **File:** [step1-analyte-inventory.md](step1-analyte-inventory.md)  
- **Content:** Lists the **10** measures present in the CDPHE-derived HRW extract today, lists Nick’s **five** additions, and states that the checked-in **2023_EN** statewide file only contains those same ten `analyte_name` values (no numeric rows yet for turbidity / lithium / lead / copper / PFAS).

## Step 2 — CDPHE name map

- **File:** [step2-cdph-analyte-map.md](step2-cdph-analyte-map.md)  
- **Content:** Canonical JSON keys (`Turbidity`, `Lithium`, `Lead`, `Copper`, `PFAS`) vs likely EPHT spellings and a checklist for the next CSV refresh.

## Step 3 — Pipeline + `output.json`

- **File:** [../build_pws_output.py](../build_pws_output.py)  
- **Changes:**  
  - `PENDING_ANALYTES_STAKEHOLDER` tuple (alphabetical display names).  
  - After grouping CSV rows, append placeholder packs: `summary_latest_year: null`, `dataset_status: "pending_export"`, `by_year: []`.  
  - `unit_recognized()` also accepts **NTU** for when turbidity rows exist.  
  - Full `analytes` list sorted by name → **15** entries.  
- **Regenerated:** [../output.json](../output.json) (run `python3 pws/CO0118015_hrw/build_pws_output.py`).

## Step 4 — `education.json`

- **File:** [../education.json](../education.json)  
- **Changes:** New expanded entries for **Copper, Lead, Lithium, PFAS, Turbidity** (hooks, EPA/CDPHE links, bullets explaining “no rows in this export”). Optional extra bullets for **Radium** and **Uranium** (Colorado / natural background context).

## Step 5 — Dashboard + classic UI

| Area | Change |
|------|--------|
| Types | [`dashboard/src/types/water.ts`](../dashboard/src/types/water.ts) — `summary_latest_year: number \| null`, optional `dataset_status`. |
| Derive | [`dashboard/src/lib/derive.ts`](../dashboard/src/lib/derive.ts) — `latestRowForAnalyte` returns `undefined` when `by_year` is empty or `summary_latest_year` is null. |
| App | [`dashboard/src/App.tsx`](../dashboard/src/App.tsx) — default selection = **first analyte with any `by_year` rows** (so the app does not open on an empty placeholder). |
| Cards | [`ContaminantCard.tsx`](../dashboard/src/components/ContaminantCard.tsx) — amber banner + “Awaiting data rows” when pending. |
| Trend | [`TrendPanel.tsx`](../dashboard/src/components/TrendPanel.tsx) — empty state message instead of an empty chart. |
| Attention | [`AttentionSection.tsx`](../dashboard/src/components/AttentionSection.tsx) — uses `latestRowForAnalyte` for “approaching” logic. |
| Classic | [`../index.html`](../index.html) — safe `by_year` handling, **—** for null latest year, empty-table note, initial measure = first with data. |
| Ship bundle | `npm run build` in `dashboard/` refreshes `public/data/*` and **`dist/`** (new hashed JS/CSS). |

When a future EPHT file includes real rows for any pending name, re-run `build_pws_output.py`; if the CSV name matches the placeholder key, the placeholder row will be replaced by real grouped data (or adjust `PENDING_ANALYTES_STAKEHOLDER` / add a rename map).
