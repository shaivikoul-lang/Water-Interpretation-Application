# Optional regulatory limits for HRW merge

The dwinfo Drive **“all sample results”** bulk CSVs include sample **measures** and lab **detection limits**, but often **do not** include drinking-water **regulatory comparison values** (MCLs and related standards).

Federal numeric values and special cases (Lead/Copper action levels, turbidity TT, PFBS caveat) are summarized in [`EPA_NPDWR_LIMITS_SOURCE.md`](EPA_NPDWR_LIMITS_SOURCE.md).

The merge script fills `sdwa_limit` and concentrations in this order:

1. **Optional sidecar** `CDPHE_regulatory_limits_by_analyte.csv` (or `--limits-file`): one limit per **canonical** `analyte_name`, applied to every year for that contaminant.
2. **Legacy EPHT statewide CSV** (`EPHT_REF_COEPHT Public Drinking Water Data_2023_EN.xlsx - Public Drinking Water Data.csv`):
   - **Year-only** rows for **CO0118015** and analytes in the HRW allowlist are **appended** to the extract so annual maxima match the older EPHT-only page (dwinfo bulk alone can miss annual highs or use different units, e.g. Arsenic as MG/L vs µg/L).
   - For bulk-only rows, **(analyte_name, year)** **sdwa_limit** is still copied when the legacy file has a positive limit. Use `--no-legacy-epht-limit-backfill` to skip limit copy; `--no-legacy-epht-year-rows` to skip appending legacy Year summaries.
3. **Arsenic unit fix:** Drive bulk often reports Arsenic as **MG/L**; the merge converts to **µg/L** so values align with the legacy EPHT MCL (**10 µg/L**).
4. Otherwise `sdwa_limit` stays blank (e.g. new analytes/years only in dwinfo bulk until CDPHE or your sidecar supplies limits).

Lab **detection limit** from the bulk file is never copied into `sdwa_limit`.

## Limits file (`CDPHE_regulatory_limits_by_analyte.csv`)

The repository may include a curated EPA-aligned limits file under `Data/`. To start your own from scratch:

1. Copy the template to a working file next to your bulk CSVs:

   ```bash
   cp Data/CDPHE_regulatory_limits_by_analyte.template.csv Data/CDPHE_regulatory_limits_by_analyte.csv
   ```

2. Edit `Data/CDPHE_regulatory_limits_by_analyte.csv` with one row per **canonical** `analyte_name` (same strings as in `education.json` / `merge_dwinfo_bulk_to_epht_hrw.py` output, e.g. `Arsenic`, `Turbidity`, `PFOA`).

| Column | Required | Meaning |
|--------|----------|---------|
| `analyte_name` | yes | Canonical analyte key. |
| `sdwa_limit` | yes | Numeric regulatory limit in **the same units** as sample concentrations in your extract (e.g. µg/L for many chemicals, NTU for turbidity). |
| `source_note` | no | Short provenance (URL, document name, “CDPHE …”). For your records; not written into the EPHT CSV today. |
| `effective_as_of` | no | Optional date string for when the limit applies. For your records; not written into the EPHT CSV today. |

3. Rebuild the HRW extract and JSON:

   ```bash
   python3 pws/CO0118015_hrw/merge_dwinfo_bulk_to_epht_hrw.py
   python3 pws/CO0118015_hrw/build_pws_output.py
   ```

If `CDPHE_regulatory_limits_by_analyte.csv` is **missing**, merge behaves as before (all `sdwa_limit` blank from bulk samples).

## CLI override

```bash
python3 pws/CO0118015_hrw/merge_dwinfo_bulk_to_epht_hrw.py --limits-file /path/to/limits.csv
```

## Scope note

This join is **per analyte** (one limit applied to every year/row for that contaminant). If a rule changes by year, extend the merge script later (e.g. add `year_from` / `year_to` columns) or split analytes into versioned keys.

Only rows with a **positive numeric** `sdwa_limit` are applied; blanks and non-numeric values are skipped.
