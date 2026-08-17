#!/bin/bash

set -e

PROJECT="$HOME/Desktop/isaac projects/mern stack/hussein-mboya"
ZIP="hussein-mboya-tours-mfa-fixed.zip"
BACKUP="backup_before_mfa_merge_$(date +%Y%m%d_%H%M%S)"

echo "=========================================="
echo "BACKUP CURRENT PROJECT"
echo "=========================================="

mkdir -p "$BACKUP"

rsync -a \
--exclude node_modules \
--exclude client/node_modules \
--exclude server/node_modules \
--exclude .git \
./ "$BACKUP/"


echo "=========================================="
echo "EXTRACT ZIP"
echo "=========================================="

rm -rf /tmp/hussein_mfa_extract

mkdir -p /tmp/hussein_mfa_extract

unzip -q "$ZIP" -d /tmp/hussein_mfa_extract


echo "=========================================="
echo "LOCATING SOURCE"
echo "=========================================="

SOURCE=$(find /tmp/hussein_mfa_extract -maxdepth 1 -type d | tail -1)

echo "Source:"
echo "$SOURCE"


echo "=========================================="
echo "MERGING FIX"
echo "=========================================="

rsync -av \
--exclude node_modules \
--exclude client/node_modules \
--exclude server/node_modules \
--exclude .env \
--exclude .env.* \
"$SOURCE/" "$PROJECT/"


echo "=========================================="
echo "REMOVE TEMP SCRIPTS"
echo "=========================================="

rm -f \
fix_customer_mfa_state.sh \
fix_mfa_final.sh \
fix_mfa_pin_scope_final.sh \
fix_mfa_pin_scope_force.sh \
fix_mfa_pin_scope_real.sh \
fix_pin_scope_error.sh


echo "=========================================="
echo "NODE CHECK"
echo "=========================================="

cd server

node --check controllers/mfaController.js


echo "=========================================="
echo "CLIENT BUILD"
echo "=========================================="

cd ../client

npm run build


echo "=========================================="
echo "COMMIT"
echo "=========================================="

cd ..

git add .

git commit -m "Fix MFA audit actions and PIN flow" || true


echo "=========================================="
echo "PUSH"
echo "=========================================="

git push origin main


echo "=========================================="
echo "DONE"
echo "=========================================="

echo "Backup:"
echo "$BACKUP"

