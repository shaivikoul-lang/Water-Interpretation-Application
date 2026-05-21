# Highlands Ranch Water — **single PWS lane** (not global)

**This folder is for one public water system only:** CDPHE `pws_id_number` **CO0118015** (Highlands Ranch Water / regulatory names *Centennial Wsd* / *CENTENNIAL WSD* in the EPHT export). See [docs/PHASE_A_LOCK.md](../../docs/PHASE_A_LOCK.md).

It is **not** a county-wide blend and **not** “all of Douglas County.” Do not compare these outputs to the root [build_output.py](../../build_output.py) pipeline without reading the labels on each.

| Location | Role |
|----------|------|
| Repo root `build_output.py` → `output.json` | **Global Colorado** — county-level aggregation for the main site. |
| This folder `build_pws_output.py` → `output.json` | **HRW / CO0118015 only** — multi-year, single-system JSON for the HRW-focused demo page. |

- **`education.json`** — Curated “learn more” copy and official CDPHE/EPA links (hybrid: short hooks + links for all analytes in the export; longer paragraphs for five priority topics). Edit this file to adjust wording before stakeholder review. **Re-check EPA/CDPHE URLs occasionally** — agencies move pages and old links will 404.

## Regenerate HRW JSON

From the **repository root**:

```bash
python3 pws/CO0118015_hrw/merge_dwinfo_bulk_to_epht_hrw.py
python3 pws/CO0118015_hrw/build_pws_output.py
```

The **merge** step rebuilds `Data/EPHT_CO0118015_Highlands_Ranch_Water_all_rows.csv` from the CDPHE **dwinfo → Drive** “all sample results” CSVs (`Data/CDPHE_all_sample_results_*_dwinfo.csv`). It **appends legacy EPHT Year-only rows** for CO0118015 (annual maxima / limits like the older EPHT page), **converts Arsenic bulk MG/L → µg/L**, **backfills `sdwa_limit`** from legacy `(analyte, year)` when needed, and supports an optional limits sidecar (`--no-legacy-epht-year-rows`, `--no-legacy-epht-limit-backfill` — see [`Data/README_CDPHE_dwinfo_downloads.md`](../../Data/README_CDPHE_dwinfo_downloads.md) and [`Data/README_regulatory_limits_by_analyte.md`](../../Data/README_regulatory_limits_by_analyte.md)). The **build** step reads that extract and writes this folder’s `output.json`.

Optional: point `build_pws_output.py` at the older statewide EPHT file instead (still filtered to `CO0118015`):

```bash
python3 pws/CO0118015_hrw/build_pws_output.py \
  --input "Data/EPHT_REF_COEPHT Public Drinking Water Data_2023_EN.xlsx - Public Drinking Water Data.csv"
```

## View the HRW demo page

Serve the **repo root** (same as the global app), then open:

**http://127.0.0.1:8765/** or **http://127.0.0.1:8765/index.html** (redirects here), or directly **http://127.0.0.1:8765/pws/CO0118015_hrw/index.html**

The page loads **`output.json`** and **`education.json`** from this folder (not root `output.json`).
