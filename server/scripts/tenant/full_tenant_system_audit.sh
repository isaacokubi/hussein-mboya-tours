#!/bin/bash

set -e

echo "======================================"
echo "FULL MULTI TENANT SYSTEM AUDIT"
echo "======================================"


echo ""
echo "1. Checking tenancy context exports"
echo "-----------------------------------"

grep "export function" tenancy/context.js


echo ""
echo "2. Checking old tenant APIs"
echo "-----------------------------------"

grep -R "getTenantId\|isTenantBypassed\|setTenantContext\|getTenantContext" \
middleware tenancy utils controllers routes \
--include="*.js" || true



echo ""
echo "3. Checking duplicate model plugins"
echo "-----------------------------------"

grep -R "tenantIsolationPlugin" models || true



echo ""
echo "4. Checking global mongoose plugin loader"
echo "-----------------------------------"

grep -R "mongoose.plugin" config app.js server.js || true



echo ""
echo "5. Checking app.js tenant order"
echo "-----------------------------------"

nl -ba app.js | head -80



echo ""
echo "6. Checking syntax"
echo "-----------------------------------"

for file in $(find . \
-name "*.js" \
-not -path "./node_modules/*")

do

node --check "$file" >/dev/null || {
echo "SYNTAX ERROR:"
echo "$file"
exit 1
}

done


echo ""
echo "7. Checking models with tenant plugin"
echo "-----------------------------------"

grep -R "tenantId" models | wc -l



echo ""
echo "8. Checking server startup"
echo "-----------------------------------"

timeout 15 node server.js || true



echo ""
echo "======================================"
echo "TENANT AUDIT COMPLETE"
echo "======================================"

