# Water Quality Interpretation Tool — Full Build Specification

Use this document as the single source of truth for implementation. Follow sections in order unless noted.

---

## Role

Act as a senior product engineer with expertise in:

- Python data pipelines
- User-centered UI design
- Interpretable systems (NOT black-box ML)

You are building a water quality interpretation tool for non-expert users.

---

## Core principles

- Interpretability over complexity
- Clarity over visual polish
- Avoid causing unnecessary alarm
- Avoid misleading simplifications
- Always explain uncertainty and limitations

---

## Strict constraints

- Scope v1: **arsenic only**
- Other analytes may exist in the file but must be **ignored** after verification logging
- Do **not** generalize interpretations to other contaminants
- Do **not** use machine learning
- Keep logic simple, transparent, and explainable

---

## V1 implementation slice (2026) — supersedes arsenic-only for shipped app

The following applies to the **current repository build** (`build_output.py`, `output.json`, `index.html`). Earlier “arsenic only” bullets remain as **reference** for arsenic-specific copy tests; implementation follows **this** slice.

### Geography and UI

- **Colorado only** (`state == "Colorado"` in CDPHE CSV).
- **County** is the primary geography for v1 summaries (ZIP entry in UI only narrows county choices via embedded HUD-derived JSON; see `Data/zip_to_county_co.json`).
- **Statewide** and **PWS-first** flows are **out of scope for v1** (planned later).

### Contaminants

- **All analytes** present in the cleaned dataset, grouped by `(county, analyte_name)` with normalized matching key (`strip` + lowercase) and **display name** = most common original `analyte_name` string in that group.

### Aggregation (per county + analyte)

1. Restrict to rows for that county and analyte (after name normalization for grouping).
2. `data_year = max(year)` among rows with valid `year`.
3. Keep rows with `year == data_year`.
4. **Units (strict) for scored rows:** drop rows with empty `units` before checking; if more than one distinct non-null unit in the subset → `score_available: false`, `score_reason: "multiple_units"`.
5. **Concentrations:** `max_concentration` = max of numeric `maximum_concentration` in subset (ignore non-finite); if none finite, try fall back to max of `average_concentration`; `avg_concentration` = mean of numeric `average_concentration` (finite only).
6. **`sdwa_limit`:** mode (most frequent) of finite positive limits in subset; if **tie** for mode → `score_available: false`, `score_reason: "limit_tie"`.
7. **`n_pws`:** count distinct `pws_name` in subset.

### Scoring (interpretive index only, when `score_available`)

- `risk_score = min(100, (max_concentration / sdwa_limit) * 100)` when `sdwa_limit > 0` and both values finite.
- Categories (same half-open bands as below): `<40` Well Below Limit; `40–75` Moderate; `75–100` Approaching Limit; `>=100` Above Limit.
- **`over_limit`:** `true` iff `max_concentration > sdwa_limit` (strict inequality).

### Missing limit / unscored

- If no usable `sdwa_limit` for the subset, emit the analyte with `score_available: false`, `score_reason: "no_limit_in_data"`, optional `max_concentration` / `avg_concentration` / `unit` if still computable, and **no** `risk_score` / `category`.

### `output.json` (v1 schema)

Top-level:

| Field | Type | Notes |
|--------|------|--------|
| `generated_at` | string | ISO-8601 UTC |
| `current_year` | int | For confidence; overridable via CLI |
| `source` | string | CDPHE attribution |
| `dataset` | string | Dataset title |
| `limitations` | string | County aggregate; not household tap |
| `resultsByCounty` | object | Keys = CDPHE county name strings |

Each **county** value:

| Field | Type |
|--------|------|
| `county` | string |
| `data_year` | int \| null | Latest `year` used across analytes in that county (max of per-analyte `data_year`) |
| `confidence` | string | `High` / `Medium` / `Low` from gap `current_year - data_year` (use county-level max year) |
| `analytes` | array | One object per analyte (scored or unscored) |
| `exceedances` | array | Precomputed list of scored analytes with `over_limit: true`, sorted by amount over descending |

Each **analyte** object includes at minimum: `analyte_name`, `data_year`, `score_available`, `score_reason` (nullable), `max_concentration`, `avg_concentration`, `sdwa_limit`, `unit`, `unit_recognized`, `n_pws`, `risk_score`, `category`, `over_limit`, `amount_over_display` (e.g. `+1.2 µg/L` or null), `plain_explanation`, `guidance` (short neutral strings).

---

## User perspective

User question (motivating the UI): **“Is my water safe?”**

**Mandatory framing**

- **Never** imply household-level or tap-specific safety
- **Always** frame as: “Based on public water system data in **[county]** relative to EPA standards…”
- Do **not** provide medical or legal advice
- Do **not** claim compliance or non-compliance with regulations; the app produces an **interpretive index** only

---

## Data source (fixed dataset)

**Primary filename (as distributed):**

`EPHT_REF_COEPHT Public Drinking Water Data_2023_EN.xlsx - Public Drinking Water Data.csv`

**Implementation notes**

- Input path must be **configurable** (CLI argument, config constant, or environment variable)
- Recommend copying locally as `data.csv` for simpler paths
- Treat the file as **CSV** (UTF-8). If encoding errors occur, fail with a clear message suggesting UTF-8 export
- Do **not** assume columns beyond the list below exist; if required columns are missing, **fail fast** with a clear error

**Columns you may use (and only these)**

| Column                 | Use |
|------------------------|-----|
| `county`               | Aggregation + user selection |
| `analyte_name`         | Filter to arsenic |
| `maximum_concentration`| Worst-case concentration |
| `average_concentration`| Typical concentration |
| `sdwa_limit`           | EPA regulatory threshold (same units as concentrations after validation) |
| `units`                | Unit consistency check |
| `year`                 | Recency / confidence |
| `pws_name`             | Count distinct public water systems |

Do **not** assume additional columns (e.g. no `state`, `pws_id`, lat/long) unless you first extend this spec.

---

## Dependencies and deliverables

- **Language:** Python 3.10+ (state in README or script docstring)
- **Libraries:** `pandas` is acceptable; avoid heavy stacks unless necessary
- **Deliverable A:** A Python script or small module (e.g. `build_output.py`) that reads the CSV and writes `output.json`
- **Deliverable B:** A **single** static `index.html` (no frameworks, no build step) that presents results
- **Quality bar:** Code should be readable, with small pure functions for validation, aggregation, risk, and copy generation

---

## Cleaning (sequential pipeline — do not skip or reorder)

1. Load CSV from configurable path.
2. **Required columns check:** If any required column is missing, raise a clear error listing missing names.
3. **Coerce numerics:** Convert `maximum_concentration`, `average_concentration`, `sdwa_limit`, and `year` to numeric using non-permissive rules:
   - Strip whitespace
   - If a value cannot be parsed as a finite number, treat that cell as **invalid** for that row
4. **Drop rows** with missing or invalid values in: `county`, `analyte_name`, `maximum_concentration`, `average_concentration`, `sdwa_limit`, `year`
5. **Normalize `analyte_name`:**
   - Strip whitespace
   - Convert to **lowercase**
6. **Filter to arsenic:** keep rows where `analyte_name == "arsenic"`
7. **Verification log:** After the arsenic filter, print (or log) the set of unique **original** normalized names actually kept should be only arsenic variants that map to `"arsenic"` — if your normalization only lowercases, print unique `analyte_name` values after normalization for human verification
8. **Drop rows** where `sdwa_limit <= 0` or non-finite
9. **Units handling (strict):**
   - Drop rows where `units` is null or empty **before** distinct-unit validation
   - Compute distinct non-null `units` values with counts
   - If **more than one** distinct unit remains → **FAIL** with a clear error listing each unit and row count
   - If **exactly one** distinct unit → treat concentrations and `sdwa_limit` as that unit; document in JSON output field `unit` as the **literal** string from the file (do not silently rename)
   - **Acceptance rule:** If the single distinct unit is not a recognized µg/L / ppb family label (e.g. contains “ug/L”, “µg/L”, “ppb” case-insensitive), still allow it but set a boolean `unit_recognized: false` in metadata and add one sentence in limitations that the unit string was unexpected

---

## Aggregation rule (explicit, per county)

Within each **county**:

1. Let `data_year = max(year)` among rows for that county (after cleaning and arsenic filter).
2. Restrict to rows where `year == data_year`.
3. Compute:
   - `max_concentration` = **max** of `maximum_concentration` across those rows
   - `avg_concentration` = **mean** of `average_concentration` across those rows (if you need a rule for NaNs: there should be none after cleaning; if any appear, fail that county with a clear error)
   - `sdwa_limit` = **mode** (most frequent non-null value) of `sdwa_limit` among those rows
     - If **multiple modes tie** for top frequency → **FAIL** for that county with a message that inconsistent limits were found
4. Track:
   - `data_year`
   - `n_pws` = count of **distinct** `pws_name` in the filtered set

**Counties with no arsenic rows** after filtering: omit from `output.json` **or** include an entry with `available: false` and a short explanation — pick one approach and document it in the script docstring; default recommendation: **omit** to keep the UI simple.

---

## Fallback (max concentration)

- If `max_concentration` is missing **after aggregation** (should not happen if pipeline is correct), use `avg_concentration` and set `fallback_used: true`
- Else `fallback_used: false`

(Prefer implementing so `max_concentration` is always defined; keep this branch for defensive clarity.)

---

## Risk calculation (interpretive index only)

Let:

`raw_ratio = max_concentration / sdwa_limit`

`risk_score = min(100, raw_ratio * 100)`

**Categories (use consistent half-open intervals to avoid overlap bugs):**

| Condition | Category |
|-----------|----------|
| `risk_score < 40` | Well Below Limit |
| `40 <= risk_score < 75` | Moderate |
| `75 <= risk_score < 100` | Approaching Limit |
| `risk_score >= 100` | Above Limit |

**Disclaimers (must appear in UI and/or JSON copy):**

- This is an **interpretive index**, not a compliance determination
- `100` means “at or above the EPA limit **in this aggregated dataset view**,” not “your water fails inspection”

---

## Confidence (recency)

Define `current_year` as:

- **Default:** calendar year from the system clock at script run time
- **Optional override:** CLI flag `--current-year YYYY` for reproducible demos and tests

Let `recency_gap = current_year - data_year`.

| `recency_gap` | `confidence` |
|----------------|--------------|
| `<= 1` | High |
| `> 1` and `<= 3` | Medium |
| `> 3` | Low |

---

## Explanation and guidance copy (plain language)

For each county result, generate:

### Explanation (2–3 sentences max)

- Must answer the spirit of “Is my water safe?” **without** saying “your tap is safe”
- Must include: **“This does not necessarily mean unsafe water.”**
- Must include the county framing: **“Based on public water system data in [county]…”**
- No technical jargon (avoid “MCL”, “percentile”; you may say “EPA limit”)

### Guidance (neutral tone)

Map from category:

- **Well Below Limit:** No action needed from this summary alone
- **Moderate:** Reasonable to monitor public updates
- **Approaching Limit:** Consider monitoring public information; if you are concerned, consider asking a certified lab about testing options
- **Above Limit:** Consider learning more from official sources; if concerned, consider certified testing or treatment options

Do **not** name specific products or brands.

---

## Geographic limitation (always visible)

County results are **aggregates** across **multiple** public water systems and **do not** reflect a household-specific measurement.

---

## Output: `output.json`

Write pretty-printed JSON (`indent=2`) containing:

**Top-level**

- `generated_at`: ISO-8601 timestamp
- `current_year`: integer used for confidence
- `source`: `"Colorado Department of Public Health and Environment (CDPHE)"`
- `dataset`: `"Public Drinking Water Data (2023)"` (or match the official dataset title if you verify it)
- `unit_recognized`: boolean (see units section)
- `results`: array of per-county objects

**Per county object**

- `county`
- `risk_score` (number)
- `category` (string)
- `max_concentration`
- `avg_concentration`
- `sdwa_limit`
- `explanation` (string)
- `guidance` (string)
- `confidence` (`"High"` \| `"Medium"` \| `"Low"`)
- `fallback_used` (boolean)
- `data_year` (integer)
- `unit` (string, from data)
- `n_pws` (integer)
- `limitations` (short string, includes PWS aggregate + not household-specific)

---

## UI: single `index.html` (no frameworks)

**Tech constraints**

- One HTML file; vanilla CSS and JS only
- No React/Vue/Svelte, no bundler

**Data loading**

- Prefer loading `output.json` via `fetch("./output.json")`
- Document in a comment: opening the HTML via `file://` may block `fetch` in some browsers; recommend a simple local static server (e.g. `python -m http.server`) for demos

**Inputs**

- **County** dropdown: populated from `results[].county` sorted alphabetically
- **Contaminant** dropdown:
  - **Arsenic** — active, selectable
  - Other entries — visible but **disabled**, tooltip or helper text: “Requires a different interpretation model”

**Display sections (in order)**

1. **Primary result:** category + numeric score, large type, subtle color coding (avoid alarming reds for moderate values; reserve strongest emphasis for “Above Limit”)
2. **Direct answer:** short interpretation aligned with explanation rules
3. **Explanation** block
4. **Guidance** block
5. **Data** block: max (worst-case), avg (typical), EPA limit — all with units
6. **Confidence:** level + `data_year` shown plainly
7. **Limitations:** fixed sentence: “Based on public water system data, not household-specific measurements.”
8. **Fallback:** if `fallback_used`, show a neutral notice
9. **Footer:** CDPHE source, dataset name, and “as of” / generation context

**Accessibility**

- Sufficient color contrast; do not rely on color alone (include text labels for category)

---

## Multi-contaminant design (future-proofing)

- UI structure must allow adding contaminants later
- v1 logic and copy: **arsenic only**

---

## Final goal

Build a system that:

- Translates complex public data into clear insight
- Reduces misinterpretation
- Builds trust through transparency
- Feels simple while remaining technically careful

---

## Suggested project layout

```
CAC_WaterInterpretation/
  prmpt/
    WATER_INTERPRETATION_BUILD_SPEC.md   # this file
  data.csv                               # optional local copy (gitignored if large)
  build_output.py                        # CSV → output.json
  index.html                             # UI
  output.json                            # generated artifact (gitignored optional)
```

---

## Acceptance checklist (self-verify before submission)

- [ ] Arsenic-only logic; other analytes ignored after verification print
- [ ] Strict units validation (fail if multiple units after cleaning)
- [ ] County aggregation matches the exact year + mode rules
- [ ] Risk boundaries implemented without overlap
- [ ] No “your tap / your home” safety claims
- [ ] Medical/legal/compliance language avoided
- [ ] `output.json` schema matches spec
- [ ] Single-file HTML works when served locally
- [ ] Limitations and disclaimers visible without scrolling past fold (where reasonable)
