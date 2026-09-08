#!/usr/bin/env bash
# Assemble a static GitHub Pages site for WaterLens progressive disclosure UI.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SITE="$ROOT/_site"

echo "Building static site in $SITE ..."
rm -rf "$SITE"
mkdir -p "$SITE/pws/CO0118015_hrw/dashboard"

echo "Building dashboard bundle ..."
(cd "$ROOT/pws/CO0118015_hrw/dashboard" && npm install && npm run build)

# WaterLens React homepage is the GitHub Pages front door.
cp -a "$ROOT/pws/CO0118015_hrw/dashboard/dist/." "$SITE/"
cp -r "$ROOT/pws/CO0118015_hrw/dashboard/dist" "$SITE/pws/CO0118015_hrw/dashboard/dist"

if [[ -d "$ROOT/booth" ]]; then
  cp -r "$ROOT/booth" "$SITE/booth"
fi
cp "$ROOT/pws/CO0118015_hrw/index.html" "$SITE/pws/CO0118015_hrw/"
cp "$ROOT/pws/CO0118015_hrw/output.json" "$SITE/pws/CO0118015_hrw/"
cp "$ROOT/pws/CO0118015_hrw/education.json" "$SITE/pws/CO0118015_hrw/"

touch "$SITE/.nojekyll"
echo "Done. Open locally: python3 -m http.server 8765 --directory $SITE"
