# CDPHE “All sample results” (from dwinfo)

These CSVs were downloaded from **CDPHE Drinking water consumer information and data**:

https://cdphe.colorado.gov/dwinfo  

Under **Sample Result Data → All sample results** (Google Drive links by year range).

| Local file | Source period on dwinfo |
|------------|-------------------------|
| `CDPHE_all_sample_results_2000-2005_dwinfo.csv` | 2000–2005 |
| `CDPHE_all_sample_results_2006-2010_dwinfo.csv` | 2006–2010 |
| `CDPHE_all_sample_results_2011-2015_dwinfo.csv` | 2011–2015 |
| `CDPHE_all_sample_results_2016-2020_dwinfo.csv` | 2016–2020 |
| `CDPHE_all_sample_results_2021-2025_dwinfo.csv` | 2021–2025 |
| `CDPHE_all_sample_results_2026-present_dwinfo.csv` | 2026–Present |

**Note:** Google Drive may return a small “virus scan warning” HTML page first; a second request to `drive.usercontent.google.com/download` with the hidden form fields (`id`, `export`, `confirm`, `uuid`) is required for the larger files.

**Git:** Filenames matching `CDPHE_all_sample_results_*_dwinfo.csv` are listed in the repo root `.gitignore` so they are not committed (~842 MB total). Keep them locally or store them outside the repo if you prefer.

**Next step for HRW:** Filter any of these files for `PWS ID` / `pws_id_number` **CO0118015** (column names differ from the older EPHT export—inspect the header row) and merge into your pipeline when ready.

### Rebuild HRW extract from bulk files (repo)

```bash
python3 pws/CO0118015_hrw/merge_dwinfo_bulk_to_epht_hrw.py
python3 pws/CO0118015_hrw/build_pws_output.py
```

The merge script maps Drive `Analyte Name` strings to the canonical names used in `education.json` (see `DRIVE_ANALYTE_TO_CANONICAL` in the script).

**Limits and annual levels:** the bulk sample CSVs often omit MCL-style limits and may use different units (e.g. Arsenic as **MG/L** vs legacy **µg/L**). The merge script **converts Arsenic bulk MG/L → µg/L**, **appends legacy EPHT Year-only summary rows** for CO0118015 (same annual maxima as the older EPHT page), **backfills `sdwa_limit`** from legacy **(analyte, year)** when needed, and supports optional [`CDPHE_regulatory_limits_by_analyte.csv`](CDPHE_regulatory_limits_by_analyte.csv). See [`README_regulatory_limits_by_analyte.md`](README_regulatory_limits_by_analyte.md). Flags: `--no-legacy-epht-limit-backfill`, `--no-legacy-epht-year-rows`. Rerun merge + `build_pws_output.py` after changes.
