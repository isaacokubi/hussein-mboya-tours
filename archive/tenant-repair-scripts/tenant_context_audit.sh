#!/bin/bash

echo "===================================="
echo "TENANT CONTEXT FLOW AUDIT"
echo "===================================="

cd server


echo ""
echo "1. Tenant context setters"
echo "--------------------------------"

grep -R "setTenantContext" middleware controllers services utils


echo ""
echo "2. Global tenant context usage"
echo "--------------------------------"

grep -R "__tenantContext" .


echo ""
echo "3. Async context implementation"
echo "--------------------------------"

grep -R "AsyncLocalStorage" .


echo ""
echo "4. Tenant middleware mounting"
echo "--------------------------------"

grep -R "tenantMiddleware" app.js server.js routes


echo ""
echo "===================================="
echo "AUDIT COMPLETE"
echo "===================================="

