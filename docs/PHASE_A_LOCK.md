# Phase A — Lock “who” and story (Highlands Ranch Water)

**Primary data file (authoritative):**  
`Data/EPHT_REF_COEPHT Public Drinking Water Data_2023_EN.xlsx - Public Drinking Water Data.csv` (repo root relative path)

This is the Colorado EPHT public drinking water export. The app pipeline (`build_output.py` → `output.json`) should keep using this file unless you replace it with a newer CDPHE export (then update paths in README / script defaults).

---

## 1. Public water system ID (from EPHT CSV, verified)

Filtered the full EPHT CSV where `pws_id_number == CO0118015` (Douglas County, Highlands Ranch / Centennial Water service area per public reporting).

| Field | Value |
|--------|--------|
| **`pws_id_number`** | **`CO0118015`** |
| **`county`** | **Douglas** (all 453 rows checked) |
| **Rows in file** | **453** |
| **`year` range** | **1999** – **2022** |

**Stakeholder confirmation:** Nic George (Water/Wastewater Superintendent, Highlands Ranch Water) confirmed by email that **`CO0118015`** is the correct CDPHE `pws_id` for **Highlands Ranch Water** customers.

### `pws_name` spelling in this file (both refer to the same PWS ID)

CDPHE exports sometimes mix casing/spelling. For this ID, the file contains:

| `pws_name` (exact) | Row count |
|--------------------|-----------|
| `Centennial Wsd` | 286 |
| `CENTENNIAL WSD` | 167 |

**Implementation rule:** Filter by **`pws_id_number == CO0118015`**, not by `pws_name` string alone, so both spellings are included.

**Extract (all matching rows from the EPHT file):**  
`Data/EPHT_CO0118015_Highlands_Ranch_Water_all_rows.csv` — **453** data rows + header, same columns as the parent EPHT CSV. Calendar years present in the `year` column span **1999 through 2022** (**24** distinct year values in this export).

---

## 2. Brand vs regulatory name

- **Stakeholder / public brand:** “Highlands Ranch Water” (per Nic George, HRW).
- **Regulatory listing in this dataset:** `CENTENNIAL WSD` / `Centennial Wsd` with ID **`CO0118015`**.

**Action:** In UI and README, display **“Highlands Ranch Water”** as the friendly name and show **“CDPHE listing: CO0118015 (Centennial WSD)”** in a subtitle or footnote so residents are not confused.

**Done:** Nic confirmed **`CO0118015`** for HRW (see note under table above). The email below was the request; you can keep it for your records.

---

## 3. Email to Nic (copy and send — already sent / for records)

**Subject:** Confirm CDPHE `pws_id` for Highlands Ranch Water  

**Body:**

> Hi Nic,  
>  
> Thank you again for your feedback—I’m narrowing the next version to **one public water system** instead of county-wide blending.  
>  
> In CDPHE’s EPHT public drinking water CSV, the system I believe serves **Highlands Ranch Water** customers is listed as **`pws_id_number = CO0118015`**, with **`pws_name`** appearing as **Centennial Wsd** or **CENTENNIAL WSD** (same ID). Douglas County, rows in this export span **1999–2022**.  
>  
> Can you confirm that **`CO0118015`** is the correct ID for **Highlands Ranch Water**, or point me to the correct `pws_id` / CDPHE name if different?  
>  
> Best,  
> [Your name]

---

## 4. One-sentence pitch (ID confirmed with Nic)

**Draft:**  
“We use **CDPHE public monitoring data** for **Highlands Ranch Water** (regulatory ID **`CO0118015`**, listed as Centennial WSD in the state file) to show **multi-year water quality context** in plain language—what the numbers mean next to **EPA health limits**, without claiming results for any one home’s tap.”

---

## 5. What `above_safe_limit_rows.csv` is (reminder)

`Data/above_safe_limit_rows.csv` is a **one-off derived export** from the same EPHT file (rows where measured level &gt; `sdwa_limit`), **not** an official CDPHE product. For Nic’s direction, treat the **full EPHT CSV** + **`CO0118015`** filter as source of truth for HRW-focused builds.

---

## 6. Next build steps (Phase B — when you implement)

1. Add `--pws-id CO0118015` (or config) to `build_output.py`; filter rows before aggregation.  
2. Change headline geography from county to **this PWS**; keep disclaimers (“public monitoring, not your tap”).  
3. Multi-year: emit time series per analyte (not only latest year).  
4. Education blocks + EPA/CDPHE links in UI.

---

*Generated from analysis of the EPHT CSV in this repository.*
