#!/bin/bash

echo "======================================"
echo " FIX TENANT CONTEXT IMPORT PATHS"
echo "======================================"

SRC="src"

echo "Fixing pages imports..."

find "$SRC/pages" -type f \( -name "*.jsx" -o -name "*.js" \) | while read file
do

if grep -q "TenantContext" "$file"
then

echo "Fixing $file"

sed -i \
's#../../context/TenantContext#../context/TenantContext#g' \
"$file"

fi

done


echo "Fixing components imports..."

find "$SRC/components" -type f \( -name "*.jsx" -o -name "*.js" \) | while read file
do

if grep -q "TenantContext" "$file"
then

echo "Checking $file"

# home components are src/components/home
sed -i \
's#../../context/TenantContext#../../context/TenantContext#g' \
"$file"

fi

done


echo "Checking imports..."

grep -R "TenantContext" -n src


echo ""
echo "Running build..."

npm run build


echo ""
echo "======================================"
echo " TENANT IMPORT FIX COMPLETE"
echo "======================================"
