# Step 2 — CDPHE / EPHT name map (Nick’s five + verification)

When rows exist in a future export, `analyte_name` in the CSV must match what we use as JSON keys (same string as `education.json` and dashboard selection).

| Stakeholder ask | Canonical key in our JSON | Typical CDPHE / rulebook naming (verify on your next extract) |
|----------------|---------------------------|----------------------------------------------------------------|
| Turbidity | `Turbidity` | Often **Turbidity**; units **NTU** (nephelometric turbidity units). |
| Lithium | `Lithium` | Emerging contaminant; name may include **Lithium** or rule-specific wording when regulated. |
| Lead | `Lead` | Often **Lead** (Lead and Copper Rule sampling). |
| Copper | `Copper` | Often **Copper** (same rule family as lead). |
| PFAS (per species) | `PFOA`, `PFOS`, `PFHxS`, `PFBS`, `PFNA`, … | Drive/Looker often list each compound separately (e.g. **PERFLUOROCTANOIC ACID (PFOA)**); the merge script maps spellings to these canonical keys. |
| Radium | `Radium` | Drive may list **RADIUM-226**, **RADIUM-228**, or **COMBINED RADIUM (-226 & -228)** (PCI/L); merge maps these to the single `Radium` series. |
| Uranium | `Uranium` | Drive may use **COMBINED URANIUM** (PCI/L); mapped to `Uranium`. |

## Verification checklist (run when you have a new CSV)

1. Filter `pws_id_number == CO0118015`.  
2. `SELECT DISTINCT analyte_name` (or equivalent in Python) for keywords: `turbid`, `lithium`, `lead`, `copper`, `pfas`, `pfoa`, `pfos`, `radium`, `uranium`.  
3. If names differ from the table above, either:  
   - rename keys in `PENDING_ANALYTES` in `build_pws_output.py` to match CDPHE **exactly**, or  
   - add a small normalisation map in the builder (future work).  

## Current repo export (2023_EN statewide file)

The older `EPHT_REF_...2023_EN...csv` snapshot in the repository only contained **ten** statewide analytes; it did **not** include turbidity / lead / copper / PFAS species for HRW.

## After dwinfo → Drive bulk merge

Bulk files `Data/CDPHE_all_sample_results_*_dwinfo.csv` (see README in `Data/`) **do** include additional analytes for **CO0118015** (for example turbidity, lead, copper, and several PFAS species). Running [`merge_dwinfo_bulk_to_epht_hrw.py`](../merge_dwinfo_bulk_to_epht_hrw.py) rebuilds [`Data/EPHT_CO0118015_Highlands_Ranch_Water_all_rows.csv`](../../Data/EPHT_CO0118015_Highlands_Ranch_Water_all_rows.csv); then `build_pws_output.py` regenerates `output.json`.

---

## dwinfo → Looker / EPHT / Drive (HRW row discovery)

Start at **[CDPHE Drinking water consumer information and data](https://cdphe.colorado.gov/dwinfo)**.

### 1. EPHT map (same family as the older EPHT CSV)

- **Link:** [Sample results (map)](https://coepht.colorado.gov/public-drinking-water-data) (linked from dwinfo under *Sample Result Data*).
- **Use for:** browsing and downloads that match the “public drinking water data” experience; good for spot checks before you pull bulk files.

### 2. Looker — select contaminant sample results

- **Link:** [Select contaminant sample results](https://lookerstudio.google.com/s/mJdb98re77k).
- **Use for:** interactive filters (contaminant / system / geography depend on how CDPHE built the report). Use it to **preview** whether a contaminant appears for your PWS before you commit to a large CSV.

### 3. Google Drive — “All sample results” (bulk CSVs)

- **Where on dwinfo:** *Sample Result Data* → **All sample results** (year-range bullets).
- **Local copies (after download):** see [`Data/README_CDPHE_dwinfo_downloads.md`](../../Data/README_CDPHE_dwinfo_downloads.md) — files named `Data/CDPHE_all_sample_results_<period>_dwinfo.csv`.
- **Use for:** full machine use — filter `PWS ID == CO0118015`, inspect **`Analyte Name`** spellings (e.g. `TURBIDITY`, `LEAD`, `COPPER FREE`, `PERFLUOROCTANOIC ACID (PFOA)`), then feed into the HRW merge script that rebuilds [`Data/EPHT_CO0118015_Highlands_Ranch_Water_all_rows.csv`](../../Data/EPHT_CO0118015_Highlands_Ranch_Water_all_rows.csv).

### 4. Safe Water Information Finder (system context)

- **Link:** [Safe Water Information Finder Tool](https://datastudio.google.com/s/qNUgvtSt8kM).
- **Use for:** contacts, violations, inspection deficiencies — **not** a substitute for the contaminant time-series CSV, but useful for outreach copy and “who to call.”

### 5. HRW filter checklist (Drive / CSV)

1. Open any merged export row with **`PWS ID` = `CO0118015`** (names may show as **HIGHLANDS RANCH WSD** or **CENTENNIAL WSD** — same ID in the bulk files checked in 2026).  
2. List distinct **`Analyte Name`** values you care about (turbidity, lead, copper, PFAS species, etc.).  
3. Map each spelling to the **canonical** `analyte_name` used in [`education.json`](../education.json) / dashboard (see merge script `DRIVE_ANALYTE_TO_CANONICAL` in [`merge_dwinfo_bulk_to_epht_hrw.py`](../merge_dwinfo_bulk_to_epht_hrw.py)).  
4. Rebuild `output.json` with `python3 pws/CO0118015_hrw/build_pws_output.py` after updating the HRW CSV.

### Google Drive “virus scan” quirk

Large files may return a small HTML **virus scan warning** page. A follow-up GET to `https://drive.usercontent.google.com/download` with the form’s `id`, `export`, `confirm`, and `uuid` fields retrieves the real CSV. The merge README documents this; re-download scripts can mirror that flow.
