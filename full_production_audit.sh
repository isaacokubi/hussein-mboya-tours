#!/bin/bash

set -e

echo "====================================="
echo "HUSSEIN MBOYA TOURS FULL AUDIT"
echo "====================================="


echo ""
echo "1. Git status"
echo "----------------"
git status


echo ""
echo "2. Node versions"
echo "----------------"
node -v
npm -v


echo ""
echo "3. Backend install check"
echo "----------------"
cd server
npm install


echo ""
echo "4. Backend syntax scan"
echo "----------------"

find . \
-name "*.js" \
-not -path "./node_modules/*" \
-exec node --check {} \;


echo ""
echo "5. Frontend build"
echo "----------------"

cd ../client

npm install

npm run build


echo ""
echo "6. Tenant isolation files"
echo "----------------"

cd ../server

echo "Tenant middleware:"
grep -R "tenantId" middleware models tenancy utils \
--include="*.js" | wc -l


echo ""
echo "7. Duplicate tenant loaders"
echo "----------------"

grep -R "loadTenantPlugin" . \
--exclude-dir=node_modules


echo ""
echo "8. Security scan"
echo "----------------"

grep -R "console.log" controllers routes services \
--include="*.js" | head -30


echo ""
echo "9. Environment check"
echo "----------------"

ls -la .env*

echo ""
echo "====================================="
echo "AUDIT COMPLETE"
echo "====================================="
