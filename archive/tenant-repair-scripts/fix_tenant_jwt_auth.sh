#!/bin/bash

set -e

SERVER="server"

echo "=========================================="
echo " FIXING TENANT JWT AUTH SYSTEM"
echo "=========================================="

cd "$SERVER"

DATE=$(date +%Y%m%d_%H%M%S)

echo "[1/8] Creating backup..."
mkdir -p backups/tenant_auth_$DATE

cp controllers/authController.js backups/tenant_auth_$DATE/ 2>/dev/null || true
cp controllers/adminAuthController.js backups/tenant_auth_$DATE/ 2>/dev/null || true
cp utils/generateToken.js backups/tenant_auth_$DATE/ 2>/dev/null || true


echo "[2/8] Checking authController syntax..."

node --check controllers/authController.js || true


echo "[3/8] Repairing authController tenant JWT..."

python3 <<'PY'
from pathlib import Path

p = Path("controllers/authController.js")

text = p.read_text()

# remove broken duplicate tenantId blocks
import re

text = re.sub(
r',?\s*tenantId:\s*user\?\.tenantId\s*\|\|\s*adminUser\?\.tenantId\s*\|\|\s*null',
'',
text
)

# add tenantId correctly after email if missing
text = text.replace(
'email: user.email,',
'email: user.email,\n      tenantId: user.tenantId || null,'
)

p.write_text(text)

PY


echo "[4/8] Repairing adminAuthController..."

python3 <<'PY'
from pathlib import Path

p=Path("controllers/adminAuthController.js")

text=p.read_text()

if "tenantId:" not in text:
    text=text.replace(
        "email: user.email,",
        "email: user.email,\n      tenantId: user.tenantId || null,"
    )

p.write_text(text)

PY


echo "[5/8] Validating generateToken..."

node --check utils/generateToken.js


echo "[6/8] Validating controllers..."

node --check controllers/authController.js
node --check controllers/adminAuthController.js


echo "[7/8] Cleaning stale node processes..."

pkill -f "node server.js" || true
pkill -f nodemon || true


echo "[8/8] Done"

echo ""
echo "Backup created:"
echo "backups/tenant_auth_$DATE"
echo ""

echo "Now start:"
echo "npm run dev"

