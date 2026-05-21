#!/usr/bin/env python3
"""
Rebuild Data/EPHT_CO0118015_Highlands_Ranch_Water_all_rows.csv from CDPHE
“All sample results” bulk CSVs (downloaded from dwinfo → Google Drive).

Maps Drive column names to the EPHT-style schema expected by build_pws_output.py.

Optional regulatory limits:

- **Legacy EPHT statewide CSV** (repo `Data/EPHT_REF_...Public Drinking Water Data.csv`):
  (1) **Year-only** rows for CO0118015 and analytes in the HRW allowlist are **appended** so
  annual maxima / limits match the older EPHT dashboard (dwinfo bulk alone can miss annual highs
  or use different units). (2) For bulk-only rows, **(analyte_name, year)** **sdwa_limit** is still
  copied when the legacy file has a positive limit (e.g. Arsenic **10 µg/L**).
- **Sidecar** `Data/CDPHE_regulatory_limits_by_analyte.csv` (or `--limits-file`): per-analyte
  limit applied to **all** years when set; overrides legacy for that analyte.

**Arsenic unit fix:** Drive bulk often reports Arsenic as **MG/L** (e.g. `0.008`) while the legacy
EPHT snapshot used **µg/L** (`8`) with MCL **10 µg/L**. The merge converts those bulk values to
**µg/L** so comparisons match the prior app.

**Blank units:** When Drive or legacy EPHT rows omit **Unit Of Measure**, the merge fills a
canonical display unit per analyte (e.g. Lead **ug/L**, Copper **mg/L**, PFAS **ng/L**) so limits
and concentrations stay comparable in CSV, JSON, and UI. Known CDPHE variants (**UG/L**, **NG/L**,
**PCI/L**, **MG/L**, etc.) are normalized to one spelling each (**ug/L**, **ng/L**, **pCi/L**,
**mg/L**, **NTU**).

Lab “Detection Limit” from the dwinfo bulk file is never used as `sdwa_limit`.
See Data/README_regulatory_limits_by_analyte.md.
"""

from __future__ import annotations

import argparse
import csv
import re
import sys
from collections import Counter, defaultdict
from datetime import datetime
from pathlib import Path

PWS_ID = "CO0118015"

# Default statewide EPHT snapshot in repo (has sdwa_limit on CO0118015 rows for core analytes).
LEGACY_EPHT_LIMITS_CSV = (
    "EPHT_REF_COEPHT Public Drinking Water Data_2023_EN.xlsx - Public Drinking Water Data.csv"
)

# Drive "Analyte Name" (uppercase in file) -> canonical analyte_name (matches education.json / prior app)
DRIVE_ANALYTE_TO_CANONICAL: dict[str, str] = {
    "ARSENIC": "Arsenic",
    "ATRAZINE": "Atrazine",
    "NITRATE": "Nitrate",
    "NITRATE-NITRITE": "Nitrate",
    "RADIUM": "Radium",
    "RADIUM-226": "Radium",
    "RADIUM-228": "Radium",
    "COMBINED RADIUM (-226 & -228)": "Radium",
    "URANIUM": "Uranium",
    "COMBINED URANIUM": "Uranium",
    "TTHM": "TTHM (total trihalomethanes)",
    "TOTAL HALOACETIC ACIDS (HAA5)": "HAA5 (haloacetic acids)",
    "DI(2-ETHYLHEXYL) PHTHALATE": "DEHP [di(2-ethylhexyl)phthalate]",
    "TETRACHLOROETHYLENE": "PCE (tetrachloroethylene)",
    "TRICHLOROETHYLENE": "TCE (trichloroethylene)",
    "TURBIDITY": "Turbidity",
    "LEAD": "Lead",
    "COPPER FREE": "Copper",
    "PERFLUOROCTANOIC ACID (PFOA)": "PFOA",
    "PERFLUOROCTANE SULFONIC ACID (PFOS)": "PFOS",
    "PERFLUOROHEXANE SULFONIC ACID (PFHxS)": "PFHxS",
    "PERFLUOROBUTANE SULFONIC ACID (PFBS)": "PFBS",
    "PERFLUORONONANOIC ACID (PFNA)": "PFNA",
}

CANONICAL_ALLOWED: frozenset[str] = frozenset(
    {
        "Arsenic",
        "Atrazine",
        "DEHP [di(2-ethylhexyl)phthalate]",
        "HAA5 (haloacetic acids)",
        "Nitrate",
        "PCE (tetrachloroethylene)",
        "Radium",
        "TCE (trichloroethylene)",
        "TTHM (total trihalomethanes)",
        "Uranium",
        "Turbidity",
        "Lead",
        "Copper",
        "PFOA",
        "PFOS",
        "PFHxS",
        "PFBS",
        "PFNA",
    }
)

# When CDPHE/EPHT rows omit Unit Of Measure, fill so limits and concentrations share a display unit.
DEFAULT_DISPLAY_UNIT_BY_CANONICAL: dict[str, str] = {
    "Arsenic": "ug/L",
    "Atrazine": "ug/L",
    "DEHP [di(2-ethylhexyl)phthalate]": "ug/L",
    "HAA5 (haloacetic acids)": "ug/L",
    "Nitrate": "mg/L",
    "PCE (tetrachloroethylene)": "ug/L",
    "Radium": "pCi/L",
    "TCE (trichloroethylene)": "ug/L",
    "TTHM (total trihalomethanes)": "ug/L",
    "Uranium": "ug/L",
    "Turbidity": "NTU",
    "Lead": "ug/L",
    "Copper": "mg/L",
    "PFOA": "ng/L",
    "PFOS": "ng/L",
    "PFHxS": "ng/L",
    "PFBS": "ng/L",
    "PFNA": "ng/L",
}


def normalize_unit_display(unit_raw: str) -> str:
    """
    One display form for CDPHE / EPHT variants (UG/L, NG/L, PCI/L, MG/L, …).
    Unknown non-empty strings are returned stripped unchanged.
    """
    s = (unit_raw or "").strip()
    if not s:
        return ""
    t = s.upper().replace("Μ", "M").replace("µ", "U")
    t = re.sub(r"\s+", "", t)
    t = t.replace("／", "/")
    if t in ("UG/L", "PPB") or t == "UGL":
        return "ug/L"
    if t in ("MG/L", "PPM") or t == "MGL":
        return "mg/L"
    if t in ("NG/L",) or t == "NGL":
        return "ng/L"
    if t == "NTU":
        return "NTU"
    if t in ("PCI/L", "PC/L") or t == "PCIL":
        return "pCi/L"
    return s


def ensure_known_unit(canon: str, unit: str) -> str:
    u = (unit or "").strip()
    if not u:
        u = DEFAULT_DISPLAY_UNIT_BY_CANONICAL.get(canon, "")
    return normalize_unit_display(u)


EPHT_FIELDNAMES = [
    "state",
    "county",
    "county_fips",
    "year",
    "analyte_name",
    "time_period",
    "quarter",
    "average_concentration",
    "maximum_concentration",
    "sdwa_limit",
    "units",
    "pws_id_number",
    "pws_name",
    "pws_primary_source_code",
    "pws_population_served",
    "pws_latitude",
    "pws_longitude",
]


def to_float(x: str | None) -> float | None:
    if x is None:
        return None
    s = str(x).strip()
    if not s or s.upper() == "NULL" or s.upper() == "NA":
        return None
    try:
        v = float(s)
        if v != v or abs(v) == float("inf"):
            return None
        return v
    except ValueError:
        return None


def parse_year(collection_date: str | None) -> int | None:
    if not collection_date:
        return None
    s = str(collection_date).strip()
    m = re.match(r"^(\d{4})-\d{2}-\d{2}", s)
    if m:
        y = int(m.group(1))
        return y if 1900 <= y <= 2100 else None
    for fmt in ("%Y-%m-%d %H:%M:%S.%f", "%Y-%m-%d %H:%M:%S", "%Y-%m-%d"):
        try:
            return datetime.strptime(s[:26], fmt).year
        except ValueError:
            continue
    return None


def canonical_analyte(drive_name: str) -> str | None:
    key = (drive_name or "").strip()
    if not key:
        return None
    return DRIVE_ANALYTE_TO_CANONICAL.get(key)


def normalize_bulk_measure(canon: str, measure: float, unit_raw: str) -> tuple[float, str]:
    """
    Align Drive bulk units with the legacy EPHT 2023_EN snapshot where CDPHE used different labels.

    Arsenic: bulk often uses MG/L for values EPHT reported as ug/L (MCL 10 ug/L).
    """
    u = (unit_raw or "").strip().upper().replace("Μ", "M").replace("µ", "U")
    if canon == "Arsenic":
        if u in ("MG/L", "MGL"):
            return measure * 1000.0, "ug/L"
        if u in ("UG/L", "PPB"):
            return measure, "ug/L"
        # Non-detect rows sometimes omit unit; tiny positives in bulk are mg/L-scale.
        if not u and measure > 0 and measure < 0.05:
            return measure * 1000.0, "ug/L"
        if not u:
            return measure, "ug/L"
    return measure, normalize_unit_display((unit_raw or "").strip())


def iter_dwinfo_rows(data_dir: Path) -> list[Path]:
    paths = sorted(data_dir.glob("CDPHE_all_sample_results_*_dwinfo.csv"))
    if not paths:
        raise SystemExit(f"No CDPHE_all_sample_results_*_dwinfo.csv under {data_dir}")
    return paths


def load_limits_by_analyte(path: Path) -> dict[str, str]:
    """
    Optional sidecar: one regulatory limit per canonical analyte_name -> sdwa_limit string.
    Same numeric role as EPHT `sdwa_limit`; not lab detection limits.
    """
    out: dict[str, str] = {}
    with path.open(newline="", encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        if not reader.fieldnames:
            return {}
        fnorm = {h.strip() for h in reader.fieldnames if h}
        need = {"analyte_name", "sdwa_limit"}
        if not need.issubset(fnorm):
            raise SystemExit(
                f"Limits file {path} must include columns {sorted(need)}; got {sorted(fnorm)!r}"
            )
        for row in reader:
            name = (row.get("analyte_name") or "").strip()
            if not name:
                continue
            v = to_float(row.get("sdwa_limit"))
            if v is None or v <= 0:
                continue
            s = str(v)
            if name in out and out[name] != s:
                print(
                    f"Warning: duplicate limits row for {name!r} ({out[name]} vs {s}); keeping last",
                    file=sys.stderr,
                )
            out[name] = s
    return out


def resolve_limits_path(data_dir: Path, limits_file: Path | None) -> Path | None:
    """Explicit --limits-file must exist; default picks Data/CDPHE_regulatory_limits_by_analyte.csv if present."""
    if limits_file is not None:
        if not limits_file.is_file():
            raise SystemExit(f"--limits-file not found: {limits_file}")
        return limits_file
    candidate = data_dir / "CDPHE_regulatory_limits_by_analyte.csv"
    return candidate if candidate.is_file() else None


def load_legacy_epht_limits_by_analyte_year(epht_csv: Path, pws_id: str) -> dict[tuple[str, int], str]:
    """
    (analyte_name, calendar year) -> sdwa_limit string (mode if multiple rows disagree).
    Only rows with finite positive sdwa_limit are kept.
    """
    bucket: dict[tuple[str, int], list[float]] = defaultdict(list)
    with epht_csv.open(newline="", encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if (row.get("pws_id_number") or "").strip() != pws_id:
                continue
            an = (row.get("analyte_name") or "").strip()
            if not an:
                continue
            yf = to_float(row.get("year"))
            if yf is None:
                continue
            yi = int(round(yf))
            if not (1900 <= yi <= 2100):
                continue
            lim = to_float(row.get("sdwa_limit"))
            if lim is None or lim <= 0:
                continue
            bucket[(an, yi)].append(lim)
    out: dict[tuple[str, int], str] = {}
    for key, vals in bucket.items():
        top = Counter(vals).most_common(2)
        if len(top) == 2 and top[0][1] == top[1][1]:
            print(
                f"Warning: legacy EPHT limit tie for {key!r} — using {top[0][0]}",
                file=sys.stderr,
            )
        out[key] = str(top[0][0])
    return out


def load_legacy_epht_year_rows(epht_csv: Path, pws_id: str) -> list[dict[str, str]]:
    """
    Full EPHT-style Year rows for this PWS (annual summaries in the 2023_EN snapshot).
    Keeps year-by-year maxima aligned with the pre–dwinfo-bulk HRW page when bulk samples
    are incomplete or use different reporting grain.
    """
    rows: list[dict[str, str]] = []
    with epht_csv.open(newline="", encoding="utf-8-sig", errors="replace") as f:
        reader = csv.DictReader(f)
        for row in reader:
            if (row.get("pws_id_number") or "").strip() != pws_id:
                continue
            if (row.get("time_period") or "").strip() != "Year":
                continue
            an = (row.get("analyte_name") or "").strip()
            if an not in CANONICAL_ALLOWED:
                continue
            rec: dict[str, str] = {}
            for k in EPHT_FIELDNAMES:
                v = row.get(k)
                if v is None:
                    rec[k] = ""
                    continue
                s = str(v).strip()
                if s.upper() in ("NA", "NULL"):
                    s = ""
                rec[k] = s
            if to_float(rec.get("maximum_concentration")) is None and to_float(rec.get("average_concentration")) is None:
                continue
            if not (rec.get("units") or "").strip():
                rec["units"] = DEFAULT_DISPLAY_UNIT_BY_CANONICAL.get(an, "")
            rows.append(rec)
    return rows


def main() -> None:
    here = Path(__file__).resolve().parent
    root = here.parent.parent
    ap = argparse.ArgumentParser(description="Merge dwinfo bulk CSVs into EPHT-style HRW extract.")
    ap.add_argument(
        "--data-dir",
        type=Path,
        default=root / "Data",
        help="Directory containing CDPHE_all_sample_results_*_dwinfo.csv",
    )
    ap.add_argument(
        "--out",
        type=Path,
        default=root / "Data" / "EPHT_CO0118015_Highlands_Ranch_Water_all_rows.csv",
        help="Output EPHT-style CSV path.",
    )
    ap.add_argument(
        "--limits-file",
        type=Path,
        default=None,
        help=(
            "Optional CSV with columns analyte_name, sdwa_limit (+ optional source_note, effective_as_of). "
            "Default: <data-dir>/CDPHE_regulatory_limits_by_analyte.csv if that file exists."
        ),
    )
    ap.add_argument(
        "--no-legacy-epht-limit-backfill",
        action="store_true",
        help=(
            f"Do not fill sdwa_limit from legacy statewide EPHT CSV "
            f"({LEGACY_EPHT_LIMITS_CSV}) for matching (analyte, year)."
        ),
    )
    ap.add_argument(
        "--no-legacy-epht-year-rows",
        action="store_true",
        help=(
            f"Do not append legacy EPHT Year-only summary rows from {LEGACY_EPHT_LIMITS_CSV}. "
            "Not recommended if you want the same annual maxima as the older EPHT-only extract."
        ),
    )
    args = ap.parse_args()

    limits_path = resolve_limits_path(args.data_dir, args.limits_file)
    limits_map = load_limits_by_analyte(limits_path) if limits_path else {}

    legacy_epht = args.data_dir / LEGACY_EPHT_LIMITS_CSV
    legacy_limits: dict[tuple[str, int], str] = {}
    if not args.no_legacy_epht_limit_backfill and legacy_epht.is_file():
        legacy_limits = load_legacy_epht_limits_by_analyte_year(legacy_epht, PWS_ID)

    # Default lat/lon from prior extract (PWS centroid); Drive bulk file omits coordinates.
    default_lat, default_lon = "39.52", "-104.94"

    out_rows: list[dict[str, str]] = []

    for fp in iter_dwinfo_rows(args.data_dir):
        with fp.open(newline="", encoding="utf-8-sig", errors="replace") as f:
            reader = csv.DictReader(f)
            for row in reader:
                if (row.get("PWS ID") or "").strip() != PWS_ID:
                    continue
                an_raw = (row.get("Analyte Name") or "").strip()
                canon = canonical_analyte(an_raw)
                if not canon or canon not in CANONICAL_ALLOWED:
                    continue
                year = parse_year(row.get("Collection Date"))
                if year is None:
                    continue
                meas = to_float(row.get("Measure"))
                if meas is None:
                    continue
                unit = (row.get("Unit Of Measure") or "").strip() or ""
                meas, unit = normalize_bulk_measure(canon, meas, unit)
                unit = ensure_known_unit(canon, unit)
                county = (row.get("County") or "").strip().title() or "Douglas"
                pws_name = (row.get("PWS Name") or "").strip() or ""
                src = (row.get("PWS Source Type") or "").strip() or ""
                pop = (row.get("Population") or "").strip() or ""

                lim = limits_map.get(canon) or legacy_limits.get((canon, year))
                rec = {
                    "state": "Colorado",
                    "county": county,
                    "county_fips": "08035",
                    "year": str(year),
                    "analyte_name": canon,
                    "time_period": "Year",
                    "quarter": "0",
                    "average_concentration": str(meas),
                    "maximum_concentration": str(meas),
                    "sdwa_limit": lim if lim else "",
                    "units": unit,
                    "pws_id_number": PWS_ID,
                    "pws_name": pws_name,
                    "pws_primary_source_code": src,
                    "pws_population_served": pop,
                    "pws_latitude": default_lat,
                    "pws_longitude": default_lon,
                }
                out_rows.append(rec)

    legacy_year_rows_n = 0
    if (
        not args.no_legacy_epht_year_rows
        and legacy_epht.is_file()
    ):
        legacy_year_block = load_legacy_epht_year_rows(legacy_epht, PWS_ID)
        out_rows.extend(legacy_year_block)
        legacy_year_rows_n = len(legacy_year_block)

    for r in out_rows:
        r["units"] = normalize_unit_display(r.get("units") or "")

    out_rows.sort(key=lambda r: (r["analyte_name"].lower(), int(r["year"]), r["pws_name"]))

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=EPHT_FIELDNAMES)
        w.writeheader()
        w.writerows(out_rows)

    filled = sum(1 for r in out_rows if r.get("sdwa_limit"))
    print(
        f"Wrote {args.out} with {len(out_rows)} total rows "
        f"(dwinfo bulk samples plus {legacy_year_rows_n} legacy EPHT Year summaries when enabled)."
    )
    if limits_path:
        print(f"Regulatory limits sidecar: {limits_path} ({len(limits_map)} analyte(s)).")
    else:
        print(
            "No regulatory limits sidecar (optional Data/CDPHE_regulatory_limits_by_analyte.csv). "
            "See Data/README_regulatory_limits_by_analyte.md"
        )
    if legacy_limits:
        print(
            f"Legacy EPHT limit backfill: {legacy_epht.name} "
            f"({len(legacy_limits)} (analyte,year) keys; {filled} output rows with sdwa_limit)."
        )
    elif args.no_legacy_epht_limit_backfill:
        print("Legacy EPHT limit backfill: disabled (--no-legacy-epht-limit-backfill).")
    elif not legacy_epht.is_file():
        print(
            f"No legacy EPHT file ({LEGACY_EPHT_LIMITS_CSV}); "
            f"{filled} rows have sdwa_limit (sidecar only if applicable). "
            "Years only in dwinfo bulk may stay blank until limits are supplied."
        )
    else:
        print(f"{filled} output rows include sdwa_limit (sidecar and/or legacy EPHT limit keys).")

    if args.no_legacy_epht_year_rows:
        print("Legacy EPHT Year summary rows: not appended (--no-legacy-epht-year-rows).")
    elif legacy_year_rows_n:
        print(
            f"Legacy EPHT Year rows appended: {legacy_year_rows_n} "
            f"(annual summaries from {legacy_epht.name})."
        )
    elif legacy_epht.is_file():
        print("Legacy EPHT Year rows: 0 appended (check allowlist / EPHT file).")


if __name__ == "__main__":
    main()
