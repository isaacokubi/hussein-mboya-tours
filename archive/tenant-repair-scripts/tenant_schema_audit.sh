#!/bin/bash

echo "===================================="
echo "REAL TENANT SCHEMA AUDIT"
echo "===================================="

cd server

echo ""
echo "Models missing tenantId field"
echo "--------------------------------"

for file in models/*.js
do

if grep -q "tenantId" "$file"
then
    :
else
    echo "MISSING: $file"
fi

done


echo ""
echo "Models containing tenantId"
echo "--------------------------------"

for file in models/*.js
do

if grep -q "tenantId" "$file"
then
    echo "OK: $file"
fi

done


echo ""
echo "DONE"

