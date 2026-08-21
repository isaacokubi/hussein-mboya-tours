#!/bin/bash

set -e

cd server

DATE=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo " FIX MFA CONTROLLER TENANT JWT SYNTAX"
echo "=========================================="

mkdir -p backups/mfa_fix_$DATE

cp controllers/mfaController.js backups/mfa_fix_$DATE/

python3 <<'PY'
from pathlib import Path
import re

p = Path("controllers/mfaController.js")

text = p.read_text()

print("Scanning mfaController.js")


# Fix broken tenantId object entries
text = re.sub(
    r'tenantId\s*:\s*\n\s*user\?\.tenantId\s*\|\|\s*adminUser\?\.tenantId\s*\|\|\s*null\s*,?',
    'tenantId: user?.tenantId || adminUser?.tenantId || null,',
    text
)


# Fix cases where tenantId was inserted without comma before it
text = re.sub(
    r'(\w+)\s*:\s*([^,\n]+)\n\s*tenantId\s*:',
    r'\1: \2,\n      tenantId:',
    text
)


# Remove duplicate empty tenantId
text = re.sub(
    r'tenantId\s*:\s*,',
    '',
    text
)


p.write_text(text)

print("mfaController.js repaired")

PY


echo "Checking syntax..."

node --check controllers/mfaController.js

echo ""
echo "MFA CONTROLLER FIXED"
echo "Backup:"
echo "backups/mfa_fix_$DATE"

