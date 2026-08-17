#!/usr/bin/env bash
set -u
set -o pipefail

PROJECT="$HOME/Desktop/isaac projects/mern stack/hussein-mboya"
ZIP="${1:-}"
STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$HOME/Desktop/hussein-mboya-security-backup-$STAMP"
TMP="/tmp/hussein-security-$STAMP"
LOG="$HOME/Desktop/hussein-security-merge-$STAMP.log"

cleanup(){ rm -rf "$TMP" 2>/dev/null || true; }
trap cleanup EXIT

fail(){ echo ""; echo "FAILED: $1"; echo "Backup: $BACKUP"; echo "Log: $LOG"; exit 1; }

exec > >(tee -a "$LOG") 2>&1

cd "$PROJECT" || fail "Cannot enter project."

if [ -z "$ZIP" ]; then
  echo "Usage: $0 /path/to/hussein-mboya-tours-security-hardened.zip"
  exit 2
fi
[ -f "$ZIP" ] || fail "ZIP not found: $ZIP"
[ -d "$PROJECT/.git" ] || fail "Project is not a Git repository."

BRANCH="$(git branch --show-current)"
[ -n "$BRANCH" ] || fail "Cannot determine current branch."

echo "Creating backup: $BACKUP"
mkdir -p "$BACKUP" || fail "Cannot create backup."
rsync -a --exclude=.git --exclude=node_modules --exclude=client/dist "$PROJECT/" "$BACKUP/" || fail "Backup failed."

mkdir -p "$TMP" || fail "Cannot create temp directory."
unzip -q "$ZIP" -d "$TMP" || fail "ZIP extraction failed."

SRC="$TMP"
if [ -d "$TMP/hussein-mboya-tours-main" ]; then SRC="$TMP/hussein-mboya-tours-main"; fi
[ -d "$SRC/client" ] || fail "ZIP does not contain client/."
[ -d "$SRC/server" ] || fail "ZIP does not contain server/."

echo "Merging security hardening..."
rsync -a --exclude=.git --exclude=node_modules --exclude=client/dist "$SRC/" "$PROJECT/" || fail "Merge failed."

rm -f "$PROJECT/detected.\"" "$PROJECT/yntax: PASSED\"" 2>/dev/null || true

echo "Installing/checking frontend dependencies..."
cd "$PROJECT/client" || fail "Cannot enter client."
if [ ! -x node_modules/.bin/vite ]; then npm install || fail "npm install failed."; fi

echo "Building frontend..."
npm run build || fail "Frontend build failed. Nothing will be pushed."

cd "$PROJECT" || fail "Cannot return to project."

echo "Checking server JavaScript syntax..."
while IFS= read -r -d '' FILE; do
  node --check "$FILE" || fail "Server syntax error: ${FILE#$PROJECT/}"
done < <(find server -type f -name '*.js' -not -path '*/node_modules/*' -print0)

echo "Checking Checkout hook ordering..."
python3 - <<'PY' || exit 1
from pathlib import Path
p=Path("client/src/pages/Checkout.jsx")
text=p.read_text()
polling=text.find("M-PESA PAYMENT STATUS POLLING")
loading=text.find("if (tourLoading || bookingLoading)")
notfound=text.find("if ((!tour?._id && !booking?._id))")
assert polling >= 0 and loading >= 0 and notfound >= 0
assert polling < loading and polling < notfound
print("PASS: polling section precedes both early returns.")
PY
[ $? -eq 0 ] || fail "Checkout hook ordering verification failed."

echo "Git status:"
git status --short
git add -A || fail "git add failed."

if git diff --cached --quiet; then
  echo "No changes to commit. Nothing to push."
else
  git diff --cached --stat
  git commit -m "security hardening and checkout hook repair" || fail "Commit failed."
  git push origin "$BRANCH" || fail "GitHub push failed."
fi

echo ""
echo "SUCCESS"
echo "Latest commit: $(git log -1 --oneline)"
echo "Backup: $BACKUP"
echo "Log: $LOG"
