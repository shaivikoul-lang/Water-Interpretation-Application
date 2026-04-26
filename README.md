# Colorado water interpretation (CAC / school project)

This repo helps residents browse **public** drinking water data for **Colorado counties**: optional ZIP narrows the county list; after you pick a county, the app lists contaminants **above the EPA-style limit used in the dataset** (with plain-language detail). It is **not** a household water test and **not** a compliance determination.

## Data sources

| File | Source |
|------|--------|
| `Data/EPHT_REF_COEPHT Public Drinking Water Data_2023_EN.xlsx - Public Drinking Water Data.csv` | Colorado Department of Public Health and Environment (CDPHE), public drinking water data export. |
| `Data/ZIP_COUNTY_122025.xlsx` | HUD USPS ZIP–County crosswalk (download from HUD USER; `ZIP-COUNTY`, quarter as in filename). |
| `Data/zip_to_county_co.json` | Generated: Colorado-only ZIP → county (FIPS + **county names matched to CDPHE**). |
| `output.json` | Generated: per-county summaries and exceedance lists from the CDPHE CSV. |

## Regenerate derived files

From the project root (paths match macOS/Linux):

```bash
# ZIP → county JSON (needs openpyxl for the HUD xlsx)
pip install -r requirements.txt
python3 scripts/build_zip_county_co.py

# County water summaries for the website
python3 build_output.py
```

Optional flags:

```text
python3 build_output.py --input "Data/your_export.csv" --out output.json --current-year 2026
```

## Run the website locally

Browsers often block `fetch()` for local files opened as `file://`. Serve the repo root:

```bash
cd /path/to/CAC_WaterInterpretation
python3 -m http.server 8765
```

Open **http://127.0.0.1:8765/index.html** .

## Product spec

See [prmpt/WATER_INTERPRETATION_BUILD_SPEC.md](prmpt/WATER_INTERPRETATION_BUILD_SPEC.md), including the **V1 implementation slice** section for JSON shape and aggregation rules.

## License / attribution

Attribute CDPHE and HUD (and quarter) wherever you present the app. Follow each provider’s terms for redistribution of raw files.
