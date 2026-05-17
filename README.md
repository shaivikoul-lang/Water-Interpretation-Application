# Colorado water interpretation (CAC / school project)

This repo helps residents browse **public** drinking water data for **Colorado counties**: optional ZIP narrows the county list; after you pick a county, the app lists contaminants **above the EPA-style limit used in the dataset** (with plain-language detail). It is **not** a household water test and **not** a compliance determination.

## Global vs single–water-system (HRW) builds

| Track | Script | Output | Site entry |
|--------|--------|--------|------------|
| **Global Colorado** (county-level) | [`build_output.py`](build_output.py) | [`output.json`](output.json) at repo root | [`lookup.html`](lookup.html) |
| **Highlands Ranch Water only** (PWS `CO0118015`, multi-year) | [`pws/CO0118015_hrw/build_pws_output.py`](pws/CO0118015_hrw/build_pws_output.py) | [`pws/CO0118015_hrw/output.json`](pws/CO0118015_hrw/output.json) | [`pws/CO0118015_hrw/index.html`](pws/CO0118015_hrw/index.html) (also the default site entry via root [`index.html`](index.html)) |

The root pipeline **aggregates by county** across systems in that county. The **`pws/CO0118015_hrw/`** folder is **one public water system** only — not “all of Douglas County.” See [`pws/CO0118015_hrw/README.md`](pws/CO0118015_hrw/README.md). Adding another district later: copy the `pws/<PWS_ID>_<slug>/` pattern.

## Data sources

| File | Source |
|------|--------|
| `Data/EPHT_REF_COEPHT Public Drinking Water Data_2023_EN.xlsx - Public Drinking Water Data.csv` | Colorado Department of Public Health and Environment (CDPHE), public drinking water data export. |
| `Data/ZIP_COUNTY_122025.xlsx` | HUD USPS ZIP–County crosswalk (download from HUD USER; `ZIP-COUNTY`, quarter as in filename). |
| `Data/zip_to_county_co.json` | Generated: Colorado-only ZIP → county (FIPS + **county names matched to CDPHE**). |
| `output.json` | Generated (global): per-county summaries and exceedance lists from the CDPHE CSV. |
| `pws/CO0118015_hrw/output.json` | Generated (HRW): single-PWS, multi-year summaries from the same CDPHE fields. |
| `pws/CO0118015_hrw/education.json` | Curated (HRW page): short resident hooks, official CDPHE/EPA links, expanded blurbs for five priority contaminants — edit before stakeholder sign-off. |

## Stakeholder alignment (Phase A)

Highlands Ranch Water focus: see **[docs/PHASE_A_LOCK.md](docs/PHASE_A_LOCK.md)** — verified **`pws_id_number`** and `pws_name` variants from the EPHT CSV, email draft for Nic George, and one-sentence pitch.

## Regenerate derived files

From the project root (paths match macOS/Linux):

```bash
# ZIP → county JSON (needs openpyxl for the HUD xlsx)
pip install -r requirements.txt
python3 scripts/build_zip_county_co.py

# County water summaries for the website
python3 build_output.py

# Highlands Ranch Water (PWS CO0118015) — multi-year JSON for the HRW demo page
python3 pws/CO0118015_hrw/build_pws_output.py
```

Optional flags:

```text
python3 build_output.py --input "Data/your_export.csv" --out output.json --current-year 2026
python3 pws/CO0118015_hrw/build_pws_output.py --input "Data/EPHT_REF_COEPHT Public Drinking Water Data_2023_EN.xlsx - Public Drinking Water Data.csv" --out pws/CO0118015_hrw/output.json
```

## Run the website locally

Browsers often block `fetch()` for local files opened as `file://`. Serve the repo root:

```bash
cd /path/to/CAC_WaterInterpretation
python3 -m http.server 8765
```

Open **http://127.0.0.1:8765/** or **http://127.0.0.1:8765/index.html** (redirects to HRW). For the statewide county app only, use **http://127.0.0.1:8765/lookup.html**.

If pages return **404**, the server was almost certainly started in the **wrong folder** (not the repo root). Stop it (`Ctrl+C`), `cd` to the folder that contains both `index.html` and `pws/`, then run `python3 -m http.server 8765` again.

## Product spec

See [prmpt/WATER_INTERPRETATION_BUILD_SPEC.md](prmpt/WATER_INTERPRETATION_BUILD_SPEC.md), including the **V1 implementation slice** section for JSON shape and aggregation rules.

## License / attribution

Attribute CDPHE and HUD (and quarter) wherever you present the app. Follow each provider’s terms for redistribution of raw files.
