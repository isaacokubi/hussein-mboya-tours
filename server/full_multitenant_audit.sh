#!/bin/bash

PROJECT_ROOT="$(pwd)"

REPORT="MULTITENANT_FULL_AUDIT_REPORT.txt"

echo "============================================" > $REPORT
echo " HUSSEIN MBOYA TOURS MULTITENANT AUDIT" >> $REPORT
echo " Date: $(date)" >> $REPORT
echo "============================================" >> $REPORT


echo "" >> $REPORT
echo "1. TENANT MODELS" >> $REPORT
echo "--------------------------------" >> $REPORT

grep -R "Organization\|Tenant\|tenantId\|organizationId" \
models services middleware routes controllers \
--exclude-dir=node_modules >> $REPORT 2>&1



echo "" >> $REPORT
echo "2. MISSING TENANT FIELDS" >> $REPORT
echo "--------------------------------" >> $REPORT

for file in models/*.js
do
    if grep -q "Schema" "$file"; then

        if ! grep -q "tenantId\|organizationId" "$file"; then
            echo "WARNING NO TENANT FIELD: $file" >> $REPORT
        fi

    fi
done



echo "" >> $REPORT
echo "3. DATABASE QUERIES WITHOUT TENANT FILTER" >> $REPORT
echo "--------------------------------" >> $REPORT


grep -R "\.find(" \
controllers services routes \
--exclude-dir=node_modules \
>> $REPORT 2>&1


grep -R "\.findOne(" \
controllers services routes \
--exclude-dir=node_modules \
>> $REPORT 2>&1



echo "" >> $REPORT
echo "4. ADMIN/SUPERADMIN BYPASS CHECK" >> $REPORT
echo "--------------------------------" >> $REPORT


grep -R "bypass:true\|super_admin\|superadmin" \
services middleware controllers \
--exclude-dir=node_modules \
>> $REPORT 2>&1



echo "" >> $REPORT
echo "5. TENANT MIDDLEWARE FILES" >> $REPORT
echo "--------------------------------" >> $REPORT


find . \
-name "*tenant*" \
-o -name "*Tenant*" \
>> $REPORT



echo "" >> $REPORT
echo "6. TEST COVERAGE" >> $REPORT
echo "--------------------------------" >> $REPORT


for test in \
testTenantMiddleware.js \
testTenantSecurity.js \
test_real_tenant_filter.js \
test_tenant_isolation.js \
test_superadmin_vs_company.js
do

if [ -f "$test" ]
then
echo "FOUND $test" >> $REPORT
else
echo "MISSING $test" >> $REPORT
fi

done



echo "" >> $REPORT
echo "7. SECURITY RISKS" >> $REPORT
echo "--------------------------------" >> $REPORT


grep -R "Model.find({})\|Model.find()\|findOne({})" \
controllers services \
--exclude-dir=node_modules \
>> $REPORT 2>&1



echo "" >> $REPORT
echo "8. ROUTE TENANT PROTECTION" >> $REPORT
echo "--------------------------------" >> $REPORT


grep -R "router\." routes \
--exclude-dir=node_modules \
>> $REPORT



echo "" >> $REPORT
echo "============================================" >> $REPORT
echo " AUDIT FINISHED" >> $REPORT
echo "============================================" >> $REPORT


echo ""
echo "DONE"
echo "REPORT CREATED:"
echo "$PROJECT_ROOT/$REPORT"
