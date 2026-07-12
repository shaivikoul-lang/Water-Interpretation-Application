#!/usr/bin/env bash
# Publish the built static site to a NEW GitHub repo for a separate GitHub Pages URL.
# Example URL: https://shaivikoul-lang.github.io/WaterLens-Guided/
#
# Usage:
#   ./scripts/publish-waterlens-guided.sh [WaterLens-Guided]
#
# Requires: SSH access to github.com as shaivikoul-lang, and gh CLI (for repo create).
set -euo pipefail

REPO_NAME="${1:-WaterLens-Guided}"
OWNER="${GITHUB_OWNER:-shaivikoul-lang}"
SSH_HOST="${GITHUB_SSH_HOST:-github-shaivi}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
GH="${GH_BIN:-gh}"

if ! command -v "$GH" >/dev/null 2>&1; then
  for candidate in /opt/homebrew/bin/gh /usr/local/bin/gh; do
    if [[ -x "$candidate" ]]; then
      GH="$candidate"
      break
    fi
  done
fi

export GIT_SSH_COMMAND="${GIT_SSH_COMMAND:-ssh -i ~/.ssh/id_ed25519_shaivi -o BatchMode=yes}"

"$ROOT/scripts/build-github-pages-site.sh"

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

cp -a "$ROOT/_site/." "$TMP/"
cd "$TMP"
git init -b main
git add .
git commit -m "WaterLens progressive disclosure UI — static site"

REMOTE="git@${SSH_HOST}:${OWNER}/${REPO_NAME}.git"

if command -v "$GH" >/dev/null 2>&1 && "$GH" auth status &>/dev/null; then
  if "$GH" repo view "${OWNER}/${REPO_NAME}" &>/dev/null; then
    echo "Repo ${OWNER}/${REPO_NAME} exists — pushing to main ..."
    git remote add origin "$REMOTE"
    git push -u origin main --force
  else
    echo "Creating repo ${OWNER}/${REPO_NAME} ..."
    "$GH" repo create "${OWNER}/${REPO_NAME}" --public --source=. --remote=origin --push
  fi
elif git ls-remote "$REMOTE" HEAD &>/dev/null; then
  echo "Repo ${OWNER}/${REPO_NAME} exists — pushing to main ..."
  git remote add origin "$REMOTE"
  git push -u origin main --force
else
  echo "Cannot create ${OWNER}/${REPO_NAME} automatically."
  echo "Run: gh auth login"
  echo "Or create an empty public repo at https://github.com/new?name=${REPO_NAME}"
  echo "Then: git remote add origin ${REMOTE} && git push -u origin main"
  exit 1
fi

if command -v "$GH" >/dev/null 2>&1 && "$GH" auth status &>/dev/null; then
  echo "Enabling GitHub Pages (branch main, /) ..."
  "$GH" api "repos/${OWNER}/${REPO_NAME}/pages" \
    -X POST \
    -f build_type=legacy \
    -f source[branch]=main \
    -f source[path]=/ \
    2>/dev/null || "$GH" api "repos/${OWNER}/${REPO_NAME}/pages" -X PUT \
    -f build_type=legacy \
    -f source[branch]=main \
    -f source[path]=/ \
    2>/dev/null || true
fi

echo ""
echo "GitHub Pages URL (live in ~1–2 min after first enable):"
echo "  https://${OWNER}.github.io/${REPO_NAME}/"
echo ""
echo "Test guided taste flow:"
echo "  https://${OWNER}.github.io/${REPO_NAME}/pws/CO0118015_hrw/dashboard/dist/index.html?concern=taste"
