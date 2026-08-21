#!/bin/bash

set -e

cd server

DATE=$(date +%Y%m%d_%H%M%S)

echo "=========================================="
echo " REPAIR ALL TENANT JWT SYNTAX ERRORS"
echo "=========================================="

mkdir -p backups/tenant_syntax_$DATE


echo "[1/5] Backing up controllers..."

cp controllers/*.js backups/tenant_syntax_$DATE/ 2>/dev/null || true


echo "[2/5] Searching broken tenantId insertions..."

grep -R "tenantId:" controllers -n > /tmp/tenant_before.txt || true


echo "[3/5] Removing malformed tenantId blocks..."

python3 <<'PY'
from pathlib import Path
import re

files = list(Path("controllers").glob("*.js"))

for f in files:

    text = f.read_text()

    original=text


    # Fix broken patterns like:
    #
    # email:user.email
    # tenantId:
    # user?.tenantId
    #
    text=re.sub(
        r'email\s*:\s*([^,\n]+),?\s*\n\s*tenantId\s*:\s*',
        r'email: \1,\n      tenantId: ',
        text
    )


    # Remove duplicated incomplete tenantId lines
    text=re.sub(
        r'tenantId\s*:\s*\n\s*\|\|.*?\n',
        '',
        text
    )


    # Remove empty tenantId declarations
    text=re.sub(
        r'tenantId\s*:\s*,',
        '',
        text
    )


    if text != original:
        print("Fixed:",f)
        f.write_text(text)

PY


echo "[4/5] Checking all controller syntax..."

FAILED=0

for file in controllers/*.js
do
    node --check "$file" || FAILED=1
done


echo "[5/5] Result"

if [ $FAILED -eq 0 ]
then
    echo "=========================================="
    echo " ALL CONTROLLERS VALID"
    echo "=========================================="
else
    echo "Some files still have errors"
fi


echo ""
echo "Backup:"
echo "backups/tenant_syntax_$DATE"

