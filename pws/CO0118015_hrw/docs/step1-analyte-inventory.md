# Step 1 — Analyte inventory (HRW / CO0118015)

**Source rows:** `Data/EPHT_CO0118015_Highlands_Ranch_Water_all_rows.csv` (and full-state file filtered to this PWS) — built by `build_pws_output.py` into `pws/CO0118015_hrw/output.json`.

## Currently in the export (10 measures)

These appear in the CDPHE-derived JSON today (alphabetical):

1. Arsenic  
2. Atrazine  
3. DEHP [di(2-ethylhexyl)phthalate]  
4. HAA5 (haloacetic acids)  
5. Nitrate  
6. PCE (tetrachloroethylene)  
7. Radium  
8. TCE (trichloroethylene)  
9. TTHM (total trihalomethanes)  
10. Uranium  

**Phase-1 rule:** none of the above are removed; any stakeholder additions are **additive**.

## Stakeholder-requested additions (next)

Douglas County (Nick, May 2026 feedback) also asked to surface **turbidity**, **lithium**, **lead**, **copper**, and **PFAS** alongside the list above.

## Data reality check (same step, verified)

The Colorado file checked in-repo,

`Data/EPHT_REF_COEPHT Public Drinking Water Data_2023_EN.xlsx - Public Drinking Water Data.csv`,

contains **only the same ten `analyte_name` values statewide** (no turbidity / lithium / lead / copper / PFAS rows in this export). So those five cannot be populated from numeric rows until a **newer or wider EPHT export** (or another approved source) is added and the HRW extract regenerated.

**What we do in code (steps 3–5):** append **placeholder** analyte entries (`dataset_status: pending_export`, empty `by_year`) so the UI and education layer can show the measures and explain the gap, without inventing concentrations.
