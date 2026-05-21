# EPA NPDWR limits used in `CDPHE_regulatory_limits_by_analyte.csv`

Numeric `sdwa_limit` values in [`CDPHE_regulatory_limits_by_analyte.csv`](CDPHE_regulatory_limits_by_analyte.csv) are **curated from EPA’s National Primary Drinking Water Regulations** page (tables for inorganics, organics, DBPs, radionuclides, PFAS) so they align with **federal** MCLs / action levels, expressed in **the same units as the HRW extract** (µg/L, mg/L, pCi/L, NTU, ng/L as applicable).

- **Primary citation (HTML):** https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations  
- **Companion table hub:** https://www.epa.gov/your-drinking-water/table-regulated-drinking-water-contaminants  
- **Snapshot used when populating the CSV:** page **Last updated: December 1, 2025** (see also project copy under `uploads/national-primary-drinking-water-regulations-0.md` if present).
- **Codified rule (eCFR, Title 40):** [40 CFR Part 141 — National Primary Drinking Water Regulations](https://www.ecfr.gov/current/title-40/chapter-I/subchapter-D/subpart-G/part-141) (subparts with MCLs and treatment techniques, including PFAS subpart O as adopted). Use the eCFR **current** text when you need authoritative regulatory language beyond EPA’s summary tables.

## Row index (must match extract units)

| `analyte_name` | `sdwa_limit` | Extract units | Rule type (summary) |
|----------------|-------------:|-----------------|---------------------|
| Arsenic | 10 | µg/L | MCL |
| Atrazine | 3 | µg/L | MCL |
| DEHP [di(2-ethylhexyl)phthalate] | 6 | µg/L | MCL |
| HAA5 (haloacetic acids) | 60 | µg/L | MCL |
| Nitrate | 10 | mg/L (as N) | MCL |
| PCE (tetrachloroethylene) | 5 | µg/L | MCL |
| TCE (trichloroethylene) | 5 | µg/L | MCL |
| TTHM (total trihalomethanes) | 80 | µg/L | MCL |
| Radium | 5 | pCi/L | MCL (combined 226+228) |
| Uranium | 30 | µg/L | MCL |
| Turbidity | 1 | NTU | TT: **1 NTU** / **0.3 NTU @ 95% monthly** / **≤5 NTU** (filtration-dependent); HRW JSON uses **1 NTU reference only**—**not auto-scored** (see `build_pws_output.py`) |
| Lead | 10 | µg/L | Action level (tap samples; treatment technique) |
| Copper | 1.3 | mg/L | Action level |
| PFOA | 4 | ng/L | MCL |
| PFOS | 4 | ng/L | MCL |
| PFHxS | 10 | ng/L | MCL |
| PFNA | 10 | ng/L | MCL |
| PFBS | 2000 | ng/L | HBWC / HI context only (not an individual MCL) |

Per-row `source_note` and optional `effective_as_of` in the CSV mirror this table and the links above.

## Conversions applied

EPA tables often list **mg/L**; the HRW pipeline uses **µg/L** for many VOCs/metals (×1000). **Nitrate** stays **mg/L as nitrogen (10)**. **Radium (combined 226+228)** uses **5 pCi/L**. **Uranium** uses **30 µg/L** (EPA MCL). **TTHM / HAA5** use **80 / 60 µg/L** from **0.080 / 0.060 mg/L** DBP MCLs.

## Non-MCL / special cases (read before changing numbers)

- **Lead:** Regulated through a **treatment technique** (corrosion control and tap sampling), not a simple MCL. EPA’s [National Primary Drinking Water Regulations](https://www.epa.gov/ground-water-and-drinking-water/national-primary-drinking-water-regulations) summary states the **tap water action level** is **0.010 mg/L** (**10 µg/L** / **10 ppb**) when your extract reports lead as µg/L; systems take additional steps if more than **10%** of tap samples exceed that level (same footnote block as copper **1.3 mg/L**). This reflects the **Lead and Copper Rule Improvements (LCRI)** (2024); older references sometimes cited **0.015 mg/L**. See [Lead and Copper Rule Improvements](https://www.epa.gov/ground-water-and-drinking-water/lead-and-copper-rule-improvements). **HRW `output.json` does not auto-score lead** from a single yearly high vs that number (`score_reason: lead_copper_action_level`); use official tap-sampling framing.
- **Copper:** **Action level 1.3 mg/L** — use when Copper samples are in **mg/L** (as in dwinfo bulk). **HRW `output.json` does not auto-score copper** the same way as an MCL (`score_reason: lead_copper_action_level`).
- **Turbidity:** Federal rules are a **treatment technique**, not one MCL: for **conventional or direct filtration**, turbidity **must not exceed 1 NTU** at any time, and **at least 95% of samples each month** must be **≤ 0.3 NTU**; systems using **other** filtration follow **state** rules that must include **never exceeding 5 NTU** at any time. The sidecar value **1** is only the **EPA “at no time” reference** for the conventional/direct line in summary materials. **Highlands Ranch `output.json` does not score turbidity** against that number (year-level highs are not monthly compliance statistics); the dashboard shows it as **“Reference only (not scored).”** Replace the reference or add system-specific rules if CDPHE directs otherwise.
- **PFBS:** EPA lists **no individual MCL**; a **HBWC** appears in the PFAS hazard-index materials. The CSV uses **2000 ng/L** (from **0.002 mg/L** HBWC) only as a **rough scale** for ng/L data—**not** equivalent to an individual MCL. Prefer CDPHE guidance for public messaging. **HRW `output.json` does not auto-score PFBS** against that number (`score_reason: pfbs_hazard_index_reference`); the classic table links to **Learn more** for context.

Re-run after edits:

```bash
python3 pws/CO0118015_hrw/merge_dwinfo_bulk_to_epht_hrw.py
python3 pws/CO0118015_hrw/build_pws_output.py
```

Sidecar limits are applied **before** legacy `(analyte,year)` backfill (`limits_map.get(canon) or …`), so these EPA-based rows override legacy where both exist (they should match for core analytes).
