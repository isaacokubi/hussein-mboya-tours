#!/usr/bin/env bash

set -e

echo "=========================================="
echo " JWT TENANT CLAIM GLOBAL REPAIR"
echo "=========================================="

BACKUP="tenant_jwt_backup_$(date +%Y%m%d_%H%M%S)"

mkdir -p "$BACKUP"

echo "Creating backup..."

cp controllers/adminAuthController.js "$BACKUP/" 2>/dev/null || true
cp controllers/authController.js "$BACKUP/" 2>/dev/null || true
cp controllers/mfaController.js "$BACKUP/" 2>/dev/null || true
cp controllers/publicOnboardingController.js "$BACKUP/" 2>/dev/null || true
cp controllers/bootstrapController.js "$BACKUP/" 2>/dev/null || true


echo "Backup created: $BACKUP"


python3 <<'PY'

from pathlib import Path
import re


files = [
    "controllers/adminAuthController.js",
    "controllers/authController.js",
    "controllers/mfaController.js",
    "controllers/publicOnboardingController.js",
    "controllers/bootstrapController.js"
]


for file in files:

    path = Path(file)

    if not path.exists():
        print("Skipping:", file)
        continue


    text = path.read_text()


    # Find generateToken blocks
    pattern = r"(const token\s*=\s*generateToken\s*\(\s*\{)(.*?)(\}\s*\)\s*;)"


    def fix(match):

        start = match.group(1)
        body = match.group(2)
        end = match.group(3)


        if "tenantId" in body:
            return match.group(0)


        addition = """

      tenantId:
        user?.tenantId ||
        adminUser?.tenantId ||
        organization?._id ||
        req.headers["x-tenant-id"] ||
        null,
"""


        return start + body + addition + end



    new_text = re.sub(
        pattern,
        fix,
        text,
        flags=re.S
    )


    if new_text != text:

        path.write_text(new_text)

        print("Updated:", file)

    else:

        print("No changes:", file)



PY


echo
echo "=========================================="
echo " Checking token generation"
echo "=========================================="


grep -Rni "generateToken" controllers


echo
echo "=========================================="
echo " Checking tenant claims"
echo "=========================================="


grep -Rni "tenantId" controllers utils middleware


echo
echo "=========================================="
echo " DONE"
echo " Backup:"
echo "$BACKUP"
echo "=========================================="

