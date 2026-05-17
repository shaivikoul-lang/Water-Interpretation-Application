# Highlands Ranch Water — **single PWS lane** (not global)

**This folder is for one public water system only:** CDPHE `pws_id_number` **CO0118015** (Highlands Ranch Water / regulatory names *Centennial Wsd* / *CENTENNIAL WSD* in the EPHT export). See [docs/PHASE_A_LOCK.md](../../docs/PHASE_A_LOCK.md).

It is **not** a county-wide blend and **not** “all of Douglas County.” Do not compare these outputs to the root [build_output.py](../../build_output.py) pipeline without reading the labels on each.

| Location | Role |
|----------|------|
| Repo root `build_output.py` → `output.json` | **Global Colorado** — county-level aggregation for the main site. |
| This folder `build_pws_output.py` → `output.json` | **HRW / CO0118015 only** — multi-year, single-system JSON for the HRW-focused demo page. |

- **`education.json`** — Curated “learn more” copy and official CDPHE/EPA links (hybrid: short hooks + links for all analytes in the export; longer paragraphs for five priority topics). Edit this file to adjust wording before stakeholder review.

## Regenerate HRW JSON

From the **repository root**:

```bash
python3 pws/CO0118015_hrw/build_pws_output.py
```

Optional: point at the full EPHT CSV (still filtered to `CO0118015`):

```bash
python3 pws/CO0118015_hrw/build_pws_output.py \
  --input "Data/EPHT_REF_COEPHT Public Drinking Water Data_2023_EN.xlsx - Public Drinking Water Data.csv"
```

## View the HRW demo page

Serve the **repo root** (same as the global app), then open:

**http://127.0.0.1:8765/pws/CO0118015_hrw/index.html**

The page loads **`output.json`** and **`education.json`** from this folder (not root `output.json`).
