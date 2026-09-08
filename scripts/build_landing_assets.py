#!/usr/bin/env python3
"""
Generate the WaterLens landing-page image + font assets.

Sources
-------
Hero photo
    Chatfield State Park, Colorado — the reservoir immediately north of
    Highlands Ranch. Wikimedia Commons, CC BY-SA 4.0, by User:Denverjeffrey.
    https://commons.wikimedia.org/wiki/File:Chatfield_State_Park.JPG
    Attribution is rendered in the landing-page footer (licence requirement).

Community photo
    Images/HRW-WaterFrest1.png — Highlands Ranch Water booth at Water Day.
    NOTE: despite the .png extension the file is HEIC, which no major browser
    except Safari can decode, so it must be transcoded before use.

Outputs WebP (primary) plus JPEG (fallback) into the dashboard's src/assets,
and the Latin subset of Caveat into src/assets/fonts.

Usage: python3 scripts/build_landing_assets.py
"""

from __future__ import annotations

import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

from PIL import Image, WebPImagePlugin  # noqa: F401  (registers the WebP writer)

REPO = Path(__file__).resolve().parent.parent
ASSETS = REPO / "pws/CO0118015_hrw/dashboard/src/assets"
FONTS = ASSETS / "fonts"

HERO_SOURCE_URL = (
    "https://upload.wikimedia.org/wikipedia/commons/3/3a/Chatfield_State_Park.JPG"
)
COMMUNITY_SOURCE = REPO / "Images/HRW-WaterFest1.png"
COMMUNITY_SOURCE_LEGACY = REPO / "Images/HRW-WaterFrest1.png"

UA = "WaterLens-CAC/1.0 (Congressional App Challenge student project)"

# Hero: keep sky, the full foothill ridgeline, the tree line and a band of water.
# Source is 6000x4000; this window is the horizon rather than the empty foreground.
HERO_CROP = (0, 700, 6000, 2115)
HERO_OUT = (2048, 483)

# Banner crop: wide landscape strip from the Water Day booth photo.
COMMUNITY_CROP = (0, 780, 1320, 1680)
COMMUNITY_OUT = (2560, 560)
COMMUNITY_FULL_WIDTH = 1320


def fetch(url: str, dest: Path) -> Path:
    req = urllib.request.Request(url, headers={"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=120) as r, dest.open("wb") as f:
        f.write(r.read())
    return dest


def save_pair(img: Image.Image, stem: str, size: tuple[int, int]) -> None:
    out = img.resize(size, Image.LANCZOS).convert("RGB")
    webp = ASSETS / f"{stem}.webp"
    jpg = ASSETS / f"{stem}.jpg"
    out.save(webp, "WEBP", quality=82, method=6)
    out.save(jpg, "JPEG", quality=84, optimize=True, progressive=True)
    for p in (webp, jpg):
        print(f"  {p.relative_to(REPO)}  {p.stat().st_size // 1024} KB  {size[0]}x{size[1]}")


def build_hero(tmp: Path) -> None:
    print("hero (Chatfield State Park, CC BY-SA 4.0):")
    src = tmp / "chatfield.jpg"
    if not src.exists():
        fetch(HERO_SOURCE_URL, src)
    with Image.open(src) as im:
        save_pair(im.crop(HERO_CROP), "hero-chatfield", HERO_OUT)


def build_community(tmp: Path) -> None:
    print("community (HRW booth at Water Day, transcoded from HEIC):")
    source = COMMUNITY_SOURCE if COMMUNITY_SOURCE.exists() else COMMUNITY_SOURCE_LEGACY
    if not source.exists():
        sys.exit(f"missing {COMMUNITY_SOURCE} (or legacy {COMMUNITY_SOURCE_LEGACY})")
    # sips is the only HEIC decoder available here; PIL has no HEIF plugin.
    png = tmp / "waterfest.png"
    subprocess.run(
        ["sips", "-s", "format", "png", str(source), "--out", str(png)],
        check=True,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
    )
    with Image.open(png) as im:
        save_pair(im.crop(COMMUNITY_CROP), "waterfest", COMMUNITY_OUT)
        ratio = COMMUNITY_FULL_WIDTH / im.width
        full_h = int(im.height * ratio)
        save_pair(im.resize((COMMUNITY_FULL_WIDTH, full_h), Image.LANCZOS), "waterfest-full", (COMMUNITY_FULL_WIDTH, full_h))


def build_font(tmp: Path) -> None:
    """Self-host only Caveat's Latin subset so the page makes no third-party request."""
    print("font (Caveat 600, Latin subset):")
    css_url = "https://fonts.googleapis.com/css2?family=Caveat:wght@600&display=swap"
    req = urllib.request.Request(
        css_url,
        headers={
            # A modern UA is required or Google serves TTF instead of WOFF2.
            "User-Agent": (
                "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                "(KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
            )
        },
    )
    with urllib.request.urlopen(req, timeout=60) as r:
        css = r.read().decode()

    blocks = css.split("@font-face")
    latin = None
    for b in blocks:
        if "U+0000-00FF" in b:
            m = re.search(r"url\((https://[^)]+\.woff2)\)", b)
            if m:
                latin = m.group(1)
    if not latin:
        sys.exit("could not find Caveat latin woff2 subset")

    FONTS.mkdir(parents=True, exist_ok=True)
    dest = FONTS / "caveat-latin-600.woff2"
    fetch(latin, dest)
    print(f"  {dest.relative_to(REPO)}  {dest.stat().st_size // 1024} KB")


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory() as td:
        tmp = Path(td)
        build_hero(tmp)
        build_community(tmp)
        build_font(tmp)
    print("done")


if __name__ == "__main__":
    main()
