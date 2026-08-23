#!/bin/bash

set -e

echo "================================="
echo "REPAIR TENANT CONTEXT ENFORCEMENT"
echo "================================="


python3 <<'PY'

from pathlib import Path


file=Path("tenancy/context.js")

data=file.read_text()


print("Current context:")
print(data[:1000])


PY


echo ""
echo "Checking tenant middleware"


grep -R "setTenantContext\|tenantId\|bypass" middleware tenancy \
--include="*.js"


echo ""
echo "================================="
echo "Review complete"
echo "================================="
