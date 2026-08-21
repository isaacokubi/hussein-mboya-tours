#!/bin/bash

set -e

echo "========================================"
echo "FINAL MULTI TENANT VERIFICATION"
echo "========================================"

cd server


echo ""
echo "1. Checking tenant plugin imports"
echo "--------------------------------"

python3 <<'PY'
from pathlib import Path

for f in Path("models").glob("*.js"):

    data=f.read_text()

    if "tenantIsolationPlugin" in data:

        if "import tenantIsolationPlugin" not in data:
            print("MISSING IMPORT:",f)

PY


echo ""
echo "2. Checking tenantId fields"
echo "--------------------------------"

python3 <<'PY'
from pathlib import Path

for f in Path("models").glob("*.js"):

    data=f.read_text()

    if "plugin(tenantIsolationPlugin)" in data:

        if "tenantId" not in data:
            print("NO TENANT FIELD:",f)

PY


echo ""
echo "3. Checking model syntax"
echo "--------------------------------"


for f in models/*.js
do
node --check "$f" || exit 1
done


echo ""
echo "4. Checking server syntax"
echo "--------------------------------"

node --check server.js


echo ""
echo "5. Checking tenant middleware"

grep -R "resolveTenant" middleware routes app.js server.js || true


echo ""
echo "========================================"
echo "TENANT VERIFICATION COMPLETE"
echo "========================================"

