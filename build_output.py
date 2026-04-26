#!/usr/bin/env python3
"""
Build output.json from CDPHE Colorado public drinking water CSV.
Implements v1 slice in prmpt/WATER_INTERPRETATION_BUILD_SPEC.md (all analytes, county-level).
"""

from __future__ import annotations

import argparse
import csv
import json
import re
from collections import Counter, defaultdict
from datetime import datetime, timezone
from pathlib import Path
from statistics import mean


def to_float(x) -> float | None:
    if x is None:
        return None
    s = str(x).strip()
    if not s or s.upper() == "NA" or s.lower() == "nan":
        return None
    try:
        v = float(s)
        if v != v or abs(v) == float("inf"):
            return None
        return v
    except ValueError:
        return None


def to_int_year(x) -> int | None:
    f = to_float(x)
    if f is None:
        return None
    if abs(f - round(f)) > 1e-9:
        return None
    y = int(round(f))
    return y if 1900 <= y <= 2100 else None


def unit_recognized(unit: str) -> bool:
    u = (unit or "").strip().lower()
    if not u:
        return False
    return bool(re.search(r"µg/l|ug/l|ppb|mg/l|ppm", u))


def risk_category(score: float) -> str:
    if score < 40:
        return "Well Below Limit"
    if score < 75:
        return "Moderate"
    if score < 100:
        return "Approaching Limit"
    return "Above Limit"


def mode_or_tie(values: list[float]) -> tuple[float | None, bool]:
    """Return (mode_value, tie) for positive finite values."""
    vals = [v for v in values if v is not None and v > 0 and v == v]
    if not vals:
        return None, False
    c = Counter(vals)
    top = c.most_common(2)
    if len(top) == 1:
        return top[0][0], False
    if top[0][1] == top[1][1]:
        return None, True
    return top[0][0], False


def format_amount_over(max_c: float, limit: float, unit: str) -> str:
    over = max_c - limit
    u = (unit or "").strip()
    s = f"+{over:.6g}"
    return f"{s} {u}" if u else s


def explanation_text(county: str, category: str, score: float) -> str:
    return (
        f"Based on public water system data in {county} relative to EPA limits, "
        f"this summary shows a level in the \"{category}\" range (index about {score:.0f} out of 100). "
        "This does not necessarily mean unsafe water for any one home."
    )


def guidance_text(category: str) -> str:
    m = {
        "Well Below Limit": "No action needed from this summary alone. You can still read local water notices if you like.",
        "Moderate": "Reasonable to follow public water updates from your provider or county.",
        "Approaching Limit": "If you are concerned, consider checking official information or asking a certified lab about testing options.",
        "Above Limit": "Consider learning more from official sources. If you are worried, consider certified testing or treatment options.",
    }
    return m.get(category, "See official water quality information for next steps.")


def load_colorado_rows(path: Path) -> list[dict]:
    required = (
        "state",
        "county",
        "analyte_name",
        "maximum_concentration",
        "average_concentration",
        "sdwa_limit",
        "units",
        "year",
        "pws_name",
    )
    rows: list[dict] = []
    with path.open(newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        missing = [c for c in required if c not in (reader.fieldnames or [])]
        if missing:
            raise SystemExit(f"Missing columns: {missing}")
        for row in reader:
            if (row.get("state") or "").strip() != "Colorado":
                continue
            rows.append(row)
    return rows


def aggregate_county_analyte(subset: list[dict]) -> dict:
    """subset: same county, same analyte, same data_year."""
    units_raw = [(r.get("units") or "").strip() for r in subset if (r.get("units") or "").strip()]
    distinct_units = list({u.lower() for u in units_raw})
    unit_str = units_raw[0] if len(distinct_units) == 1 and units_raw else (units_raw[0] if units_raw else "")

    if len(distinct_units) > 1:
        return {
            "score_available": False,
            "score_reason": "multiple_units",
            "unit": unit_str or None,
            "unit_recognized": unit_recognized(unit_str),
            "max_concentration": None,
            "avg_concentration": None,
            "sdwa_limit": None,
            "n_pws": len({(r.get("pws_name") or "").strip() for r in subset if (r.get("pws_name") or "").strip()}),
        }

    limits = []
    for r in subset:
        lim = to_float(r.get("sdwa_limit"))
        if lim is not None and lim > 0:
            limits.append(lim)
    limit_val, tie = mode_or_tie(limits)

    maxes = []
    avgs = []
    for r in subset:
        mx = to_float(r.get("maximum_concentration"))
        av = to_float(r.get("average_concentration"))
        if mx is not None:
            maxes.append(mx)
        if av is not None:
            avgs.append(av)
    max_c = max(maxes) if maxes else None
    if max_c is None and avgs:
        max_c = max(avgs)
    avg_c = mean(avgs) if avgs else None

    n_pws = len({(r.get("pws_name") or "").strip() for r in subset if (r.get("pws_name") or "").strip()})

    if tie:
        return {
            "score_available": False,
            "score_reason": "limit_tie",
            "unit": unit_str or None,
            "unit_recognized": unit_recognized(unit_str),
            "max_concentration": max_c,
            "avg_concentration": avg_c,
            "sdwa_limit": None,
            "n_pws": n_pws,
        }

    if limit_val is None:
        return {
            "score_available": False,
            "score_reason": "no_limit_in_data",
            "unit": unit_str or None,
            "unit_recognized": unit_recognized(unit_str),
            "max_concentration": max_c,
            "avg_concentration": avg_c,
            "sdwa_limit": None,
            "n_pws": n_pws,
        }

    if max_c is None or limit_val <= 0:
        return {
            "score_available": False,
            "score_reason": "missing_concentration",
            "unit": unit_str or None,
            "unit_recognized": unit_recognized(unit_str),
            "max_concentration": max_c,
            "avg_concentration": avg_c,
            "sdwa_limit": limit_val,
            "n_pws": n_pws,
        }

    raw_ratio = max_c / limit_val
    risk_score = min(100.0, raw_ratio * 100.0)
    cat = risk_category(risk_score)
    over = max_c > limit_val
    amt = format_amount_over(max_c, limit_val, unit_str) if over else None

    return {
        "score_available": True,
        "score_reason": None,
        "unit": unit_str or None,
        "unit_recognized": unit_recognized(unit_str),
        "max_concentration": max_c,
        "avg_concentration": avg_c,
        "sdwa_limit": limit_val,
        "n_pws": n_pws,
        "risk_score": round(risk_score, 2),
        "category": cat,
        "over_limit": over,
        "amount_over_display": amt,
        "guidance": guidance_text(cat),
    }


def confidence_for_year(current_year: int, data_year: int) -> str:
    gap = current_year - data_year
    if gap <= 1:
        return "High"
    if gap <= 3:
        return "Medium"
    return "Low"


def main() -> None:
    root = Path(__file__).resolve().parent
    default_in = root / "Data" / (
        "EPHT_REF_COEPHT Public Drinking Water Data_2023_EN.xlsx - Public Drinking Water Data.csv"
    )
    default_out = root / "output.json"

    ap = argparse.ArgumentParser()
    ap.add_argument("--input", type=Path, default=default_in)
    ap.add_argument("--out", type=Path, default=default_out)
    ap.add_argument("--current-year", type=int, default=None)
    args = ap.parse_args()

    if not args.input.is_file():
        raise SystemExit(f"Input not found: {args.input}")

    if args.current_year is None:
        current_year = datetime.now(timezone.utc).year
    else:
        current_year = args.current_year

    rows = load_colorado_rows(args.input)

    # (county, analyte_key) -> list of rows
    groups: dict[tuple[str, str], list[dict]] = defaultdict(list)
    display_names: dict[tuple[str, str], Counter] = defaultdict(Counter)

    for r in rows:
        county = (r.get("county") or "").strip()
        an_raw = (r.get("analyte_name") or "").strip()
        if not county or not an_raw:
            continue
        key = (county, an_raw.lower())
        groups[key].append(r)
        display_names[key][an_raw] += 1

    results_by_county: dict[str, dict] = {}

    for (county, _akey), g_rows in groups.items():
        years = []
        for r in g_rows:
            y = to_int_year(r.get("year"))
            if y is not None:
                years.append(y)
        if not years:
            continue
        data_year = max(years)
        subset = [r for r in g_rows if to_int_year(r.get("year")) == data_year]
        if not subset:
            continue

        display = display_names[(county, _akey)].most_common(1)[0][0]

        agg = aggregate_county_analyte(subset)
        rec = {
            "analyte_name": display,
            "data_year": data_year,
            **agg,
        }
        if rec["score_available"]:
            rec["plain_explanation"] = explanation_text(county, rec["category"], rec["risk_score"])
        else:
            rec["plain_explanation"] = (
                f"Based on public water system data in {county}: {display} could not be scored the same way "
                f"as other items ({rec.get('score_reason', 'unknown')}). This does not necessarily mean unsafe water."
            )
            rec["guidance"] = "See official provider or CDPHE materials for how to interpret this contaminant."

        if "guidance" not in rec:
            rec["guidance"] = guidance_text(rec.get("category") or "Well Below Limit")

        results_by_county.setdefault(county, {"analytes": [], "years": []})
        results_by_county[county]["analytes"].append(rec)
        results_by_county[county]["years"].append(data_year)

    # finalize county objects
    out_counties: dict[str, dict] = {}
    for county, pack in results_by_county.items():
        analytes = pack["analytes"]
        ys = pack["years"]
        county_max_year = max(ys) if ys else None
        conf = confidence_for_year(current_year, county_max_year) if county_max_year else "Low"

        exceedances = []
        for a in analytes:
            if a.get("score_available") and a.get("over_limit"):
                over_amt = (a.get("max_concentration") or 0) - (a.get("sdwa_limit") or 0)
                exceedances.append(
                    {
                        "analyte_name": a["analyte_name"],
                        "category": a["category"],
                        "risk_score": a["risk_score"],
                        "amount_over_display": a.get("amount_over_display"),
                        "data_year": a["data_year"],
                        "max_concentration": a["max_concentration"],
                        "sdwa_limit": a["sdwa_limit"],
                        "unit": a.get("unit"),
                        "summary": f"{a['analyte_name']}: worst-case level is above the EPA limit used in this dataset for {county}.",
                        "plain_explanation": a["plain_explanation"],
                        "guidance": a["guidance"],
                    }
                )
        exceedances.sort(
            key=lambda e: (e["max_concentration"] or 0) - (e["sdwa_limit"] or 0),
            reverse=True,
        )

        out_counties[county] = {
            "county": county,
            "data_year": county_max_year,
            "confidence": conf,
            "limitations": (
                "These numbers combine public water systems in this county. They are not a measurement from your home tap."
            ),
            "analytes": sorted(analytes, key=lambda x: x["analyte_name"].lower()),
            "exceedances": exceedances,
        }

    payload = {
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "current_year": current_year,
        "source": "Colorado Department of Public Health and Environment (CDPHE)",
        "dataset": "Public Drinking Water Data (2023 export)",
        "limitations": (
            "County-level public water system data. Not household-specific. Interpretive index only—not a legal compliance decision."
        ),
        "resultsByCounty": out_counties,
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    n_counties = len(out_counties)
    n_analytes = sum(len(v["analytes"]) for v in out_counties.values())
    print(f"Wrote {args.out} — counties: {n_counties}, analyte summaries: {n_analytes}")


if __name__ == "__main__":
    main()
