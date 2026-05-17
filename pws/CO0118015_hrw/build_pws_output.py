#!/usr/bin/env python3
"""
Build pws/CO0118015_hrw/output.json — Highlands Ranch Water (single PWS), multi-year.

Helpers below are intentionally duplicated from repo-root build_output.py so that file
stays frozen for the global/county pipeline; consolidate into a shared module later if desired.
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

PWS_ID = "CO0118015"
PWS_LABEL = "Highlands Ranch Water (PWS CO0118015)"


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
    vals = [v for v in values if v is not None and v > 0 and v == v]
    if not vals:
        return None, False
    c = Counter(vals)
    top = c.most_common(2)
    if len(top) == 1:
        return top[0][0], False
    if top[0][1] == top[1][1]:
        return None, False
    return top[0][0], False


def format_amount_over(max_c: float, limit: float, unit: str) -> str:
    over = max_c - limit
    u = (unit or "").strip()
    s = f"+{over:.6g}"
    return f"{s} {u}" if u else s


def guidance_text(category: str) -> str:
    m = {
        "Well Below Limit": "No action needed from this summary alone. You can still read local water notices if you like.",
        "Moderate": "Reasonable to follow public water updates from your provider or county.",
        "Approaching Limit": "If you are concerned, consider checking official information or asking a certified lab about testing options.",
        "Above Limit": "Consider learning more from official sources. If you are worried, consider certified testing or treatment options.",
    }
    return m.get(category, "See official water quality information for next steps.")


def explanation_pws(category: str, score: float) -> str:
    return (
        f"Based on public data for {PWS_LABEL} relative to EPA limits in this dataset, "
        f"this summary shows a level in the \"{category}\" range (index about {score:.0f} out of 100). "
        "This does not necessarily mean unsafe water for any one home."
    )


def aggregate_pws_analyte_year(subset: list[dict]) -> dict:
    """subset: same PWS, same analyte, same calendar year (may include Year + Quarter rows)."""
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
            "n_pws_names": len({(r.get("pws_name") or "").strip() for r in subset if (r.get("pws_name") or "").strip()}),
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

    n_names = len({(r.get("pws_name") or "").strip() for r in subset if (r.get("pws_name") or "").strip()})

    if tie:
        return {
            "score_available": False,
            "score_reason": "limit_tie",
            "unit": unit_str or None,
            "unit_recognized": unit_recognized(unit_str),
            "max_concentration": max_c,
            "avg_concentration": avg_c,
            "sdwa_limit": None,
            "n_pws_names": n_names,
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
            "n_pws_names": n_names,
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
            "n_pws_names": n_names,
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
        "n_pws_names": n_names,
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


def load_colorado_rows_for_pws(path: Path, pws_id: str) -> list[dict]:
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
        "pws_id_number",
    )
    rows: list[dict] = []
    pid = (pws_id or "").strip()
    with path.open(newline="", encoding="utf-8", errors="replace") as f:
        reader = csv.DictReader(f)
        missing = [c for c in required if c not in (reader.fieldnames or [])]
        if missing:
            raise SystemExit(f"Missing columns: {missing}")
        for row in reader:
            if (row.get("state") or "").strip() != "Colorado":
                continue
            if (row.get("pws_id_number") or "").strip() != pid:
                continue
            rows.append(row)
    return rows


def main() -> None:
    here = Path(__file__).resolve().parent
    root = here.parent.parent

    default_in = root / "Data" / "EPHT_CO0118015_Highlands_Ranch_Water_all_rows.csv"
    default_out = here / "output.json"

    ap = argparse.ArgumentParser(description=f"Build single-PWS JSON for {PWS_ID}.")
    ap.add_argument("--input", type=Path, default=default_in, help="EPHT CSV (full export or CO0118015 extract).")
    ap.add_argument("--out", type=Path, default=default_out)
    ap.add_argument("--pws-id", type=str, default=PWS_ID)
    ap.add_argument("--current-year", type=int, default=None)
    args = ap.parse_args()

    if not args.input.is_file():
        raise SystemExit(f"Input not found: {args.input}")

    if args.current_year is None:
        current_year = datetime.now(timezone.utc).year
    else:
        current_year = args.current_year

    rows = load_colorado_rows_for_pws(args.input, args.pws_id)
    if not rows:
        raise SystemExit(f"No rows for pws_id_number={args.pws_id!r} in {args.input}")

    county = (rows[0].get("county") or "").strip() or "Douglas"
    pws_names = sorted({(r.get("pws_name") or "").strip() for r in rows if (r.get("pws_name") or "").strip()})

    # (analyte_key) -> rows
    groups: dict[str, list[dict]] = defaultdict(list)
    display_names: dict[str, Counter] = defaultdict(Counter)

    for r in rows:
        an_raw = (r.get("analyte_name") or "").strip()
        if not an_raw:
            continue
        key = an_raw.lower()
        groups[key].append(r)
        display_names[key][an_raw] += 1

    analytes_out: list[dict] = []
    exceedances_all: list[dict] = []

    for akey, g_rows in sorted(groups.items(), key=lambda x: x[0]):
        display = display_names[akey].most_common(1)[0][0]
        years_set: set[int] = set()
        for r in g_rows:
            y = to_int_year(r.get("year"))
            if y is not None:
                years_set.add(y)
        if not years_set:
            continue

        by_year: list[dict] = []
        for y in sorted(years_set):
            subset = [r for r in g_rows if to_int_year(r.get("year")) == y]
            if not subset:
                continue
            agg = aggregate_pws_analyte_year(subset)
            rec = {"year": y, **agg}
            if rec["score_available"]:
                rec["plain_explanation"] = explanation_pws(rec["category"], rec["risk_score"])
            else:
                rec["plain_explanation"] = (
                    f"For {PWS_LABEL}: {display} in {y} could not be scored the same way as other items "
                    f"({rec.get('score_reason', 'unknown')}). This does not necessarily mean unsafe water."
                )
                rec["guidance"] = "See official provider or CDPHE materials for how to interpret this contaminant."
            if "guidance" not in rec:
                rec["guidance"] = guidance_text(rec.get("category") or "Well Below Limit")
            by_year.append(rec)

            if rec.get("score_available") and rec.get("over_limit"):
                exceedances_all.append(
                    {
                        "analyte_name": display,
                        "year": y,
                        "category": rec["category"],
                        "risk_score": rec["risk_score"],
                        "amount_over_display": rec.get("amount_over_display"),
                        "max_concentration": rec["max_concentration"],
                        "sdwa_limit": rec["sdwa_limit"],
                        "unit": rec.get("unit"),
                        "summary": (
                            f"{display} ({y}): worst-case level is above the EPA limit used in this dataset for {PWS_LABEL}."
                        ),
                        "plain_explanation": rec["plain_explanation"],
                        "guidance": rec["guidance"],
                    }
                )

        if not by_year:
            continue

        latest_y = max(y["year"] for y in by_year)
        analytes_out.append(
            {
                "analyte_name": display,
                "summary_latest_year": latest_y,
                "by_year": by_year,
            }
        )

    exceedances_all.sort(
        key=lambda e: ((e["max_concentration"] or 0) - (e["sdwa_limit"] or 0), e["year"]),
        reverse=True,
    )

    all_years = sorted({y for a in analytes_out for y in (x["year"] for x in a["by_year"])})
    data_max_year = max(all_years) if all_years else None
    conf = confidence_for_year(current_year, data_max_year) if data_max_year else "Low"

    payload = {
        "lane": "pws",
        "pws_id_number": args.pws_id.strip(),
        "pws_label": PWS_LABEL,
        "pws_names_in_export": pws_names,
        "county": county,
        "generated_at": datetime.now(timezone.utc).isoformat(),
        "current_year": current_year,
        "source": "Colorado Department of Public Health and Environment (CDPHE)",
        "dataset": "Public Drinking Water Data (2023 export), filtered to this PWS only",
        "limitations": (
            f"Single public water system {args.pws_id.strip()}; not all systems in {county} County or Colorado. "
            "Not household-specific. Interpretive index only—not a legal compliance decision."
        ),
        "data_year_max": data_max_year,
        "confidence": conf,
        "years_present": all_years,
        "analytes": sorted(analytes_out, key=lambda x: x["analyte_name"].lower()),
        "exceedances_all_years": exceedances_all,
    }

    args.out.parent.mkdir(parents=True, exist_ok=True)
    with args.out.open("w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)

    print(
        f"Wrote {args.out} — PWS {args.pws_id}: analytes {len(analytes_out)}, "
        f"years {all_years[0] if all_years else '—'}..{all_years[-1] if all_years else '—'}, "
        f"exceedance rows {len(exceedances_all)}"
    )


if __name__ == "__main__":
    main()
