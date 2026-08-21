#!/bin/bash

set -e

ROOT="$(pwd)"
SERVER="$ROOT/server"
REPORT="$ROOT/MULTITENANCY_AUDIT_REPORT.txt"

echo "=================================================" > "$REPORT"
echo " FULL MULTITENANCY AUDIT REPORT" >> "$REPORT"
echo " Project: hussein-mboya-tours" >> "$REPORT"
echo " Date: $(date)" >> "$REPORT"
echo "=================================================" >> "$REPORT"

echo "" >> "$REPORT"
echo "1. PROJECT STRUCTURE" >> "$REPORT"
echo "--------------------" >> "$REPORT"

for d in models controllers routes middleware tenancy utils scripts; do
    if [ -d "$SERVER/$d" ]; then
        echo "[OK] server/$d exists" >> "$REPORT"
    else
        echo "[MISSING] server/$d" >> "$REPORT"
    fi
done


echo "" >> "$REPORT"
echo "2. TENANCY FILES" >> "$REPORT"
echo "----------------" >> "$REPORT"

find "$SERVER" \
-type f \
| grep -Ei "tenant|organization|context|isolation" \
>> "$REPORT" || true


echo "" >> "$REPORT"
echo "3. MODELS TENANT FIELD CHECK" >> "$REPORT"
echo "-----------------------------" >> "$REPORT"

if [ -d "$SERVER/models" ]; then

for file in "$SERVER"/models/*.js; do

    name=$(basename "$file")

    if grep -q "tenantId" "$file"; then
        echo "[HAS tenantId] $name" >> "$REPORT"
    else
        echo "[MISSING tenantId] $name" >> "$REPORT"
    fi

done

fi


echo "" >> "$REPORT"
echo "4. MODEL INDEX CHECK" >> "$REPORT"
echo "--------------------" >> "$REPORT"

grep -R "tenantId.*index" "$SERVER/models" \
>> "$REPORT" 2>/dev/null || true


echo "" >> "$REPORT"
echo "5. CONTROLLER QUERY AUDIT" >> "$REPORT"
echo "--------------------------" >> "$REPORT"

grep -R \
-E "find\\(|findOne\\(|findById\\(|aggregate\\(|updateOne\\(|deleteOne\\(" \
"$SERVER/controllers" \
>> "$REPORT" 2>/dev/null || true


echo "" >> "$REPORT"
echo "6. TENANT FILTER USAGE" >> "$REPORT"
echo "----------------------" >> "$REPORT"

grep -R \
-E "tenantId|req\\.tenant|tenantContext|getTenant" \
"$SERVER/controllers" \
>> "$REPORT" 2>/dev/null || true


echo "" >> "$REPORT"
echo "7. ROUTE MIDDLEWARE AUDIT" >> "$REPORT"
echo "--------------------------" >> "$REPORT"

grep -R \
-E "tenant|auth|protect|admin|authorize" \
"$SERVER/routes" \
>> "$REPORT" 2>/dev/null || true


echo "" >> "$REPORT"
echo "8. UNSAFE GLOBAL QUERIES" >> "$REPORT"
echo "------------------------" >> "$REPORT"

grep -R \
-E "find\\(\\{\\s*\\}|find\\(\\s*\\)" \
"$SERVER" \
>> "$REPORT" 2>/dev/null || true


echo "" >> "$REPORT"
echo "9. SUPERADMIN CHECK" >> "$REPORT"
echo "--------------------" >> "$REPORT"

grep -R \
-E "super_admin|superadmin|bypass" \
"$SERVER" \
>> "$REPORT" 2>/dev/null || true


echo "" >> "$REPORT"
echo "10. TENANT TEST FILES" >> "$REPORT"
echo "---------------------" >> "$REPORT"

find "$SERVER" \
-type f \
| grep -Ei "test|spec" \
>> "$REPORT" || true


echo "" >> "$REPORT"
echo "=================================================" >> "$REPORT"
echo " AUDIT COMPLETE" >> "$REPORT"
echo "=================================================" >> "$REPORT"


echo ""
echo "Audit completed."
echo "Report created:"
echo "$REPORT"

