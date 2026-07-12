#!/usr/bin/env bash
# Publish the built static site to a NEW GitHub repo for a separate GitHub Pages URL.
# Example URL: https://shaivikoul-lang.github.io/WaterLens-Guided/
#
# Usage:
#   ./scripts/publish-waterlens-guided.sh WaterLens-Guided
#
# Requires: gh CLI authenticated, repo must not exist OR be empty.
set -euo pipefail

REPO_NAME="${1:-WaterLens-Guided}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

"$ROOT/scripts/build-github-pages-site.sh"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cp -a "$ROOT/_site/." "$TMP/"
cd "$TMP"
git init -b main
git add .
git commit -m "WaterLens progressive disclosure UI — static site"

if gh repo view "Shaivikoul/$REPO_NAME" &>/dev/null; then
  echo "Repo Shaivikoul/$REPO_NAME exists — pushing to main ..."
  git remote add origin "git@github-shaivi:Shaivikoul/${REPO_NAME}.git"
  git push -u origin main --force
else
  echo "Creating repo Shaivikoul/$REPO_NAME ..."
  gh repo create "Shaivikoul/$REPO_NAME" --public --source=. --remote=origin --push
fi

echo ""
echo "Next: GitHub → $REPO_NAME → Settings → Pages → Source: Deploy from branch → main → /(root)"
echo "Live URL (after Pages enables, ~1–2 min):"
echo "  https://shaivikoul-lang.github.io/${REPO_NAME}/"
