#!/bin/bash

echo "======================================"
echo " FIX WHY CHOOSE US TENANT ERROR"
echo "======================================"

PROJECT="$HOME/Desktop/isaac projects/mern stack/hussein-mboya"
CLIENT="$PROJECT/client"

FILE="$CLIENT/src/components/home/WhyChooseUs.jsx"


if [ ! -f "$FILE" ]; then
    echo "ERROR: File not found:"
    echo "$FILE"
    exit 1
fi


echo "Backup created..."

cp "$FILE" "$FILE.backup.$(date +%s)"


echo "Checking component..."


# Add import if missing
if ! grep -q "useTenant" "$FILE"; then

sed -i '1i import { useTenant } from "../../context/TenantContext";' "$FILE"

fi


echo "Adding tenant variables..."


if ! grep -q "companyName" "$FILE"; then

sed -i '/function WhyChooseUs/a\
\
  const { tenant } = useTenant();\
  const companyName = tenant?.name || tenant?.companyName || "Your Travel Company";\
' "$FILE"

fi



echo "Removing settings dependency..."

sed -i 's/settings\.companyName/companyName/g' "$FILE"


echo "Replacing old company branding..."

sed -i 's/Coherent Tours/{companyName}/g' "$FILE"


echo ""
echo "Remaining settings references:"
grep -n "settings" "$FILE" || echo "OK - no settings references"


echo ""
echo "Running frontend build..."

cd "$CLIENT"

npm run build


echo ""
echo "======================================"
echo " FIX COMPLETE"
echo "======================================"#!/bin/bash

echo "======================================"
echo " FIX WHY CHOOSE US TENANT ERROR"
echo "======================================"

FILE="src/components/home/WhyChooseUs.jsx"


if [ ! -f "$FILE" ]; then
    echo "ERROR: $FILE not found"
    exit 1
fi


echo "Creating backup..."
cp "$FILE" "$FILE.backup.$(date +%s)"


echo "Checking imports..."


# Ensure TenantContext import exists
if ! grep -q "TenantContext" "$FILE"; then

sed -i '1i import { useTenant } from "../../context/TenantContext";' "$FILE"

fi



echo "Adding tenant/companyName..."


# Add tenant hook after component declaration
if ! grep -q "const { tenant } = useTenant" "$FILE"; then

sed -i '/function WhyChooseUs/a\
\
  const { tenant } = useTenant();\
  const companyName = tenant?.name || tenant?.companyName || "Your Travel Company";\
' "$FILE"

fi



echo "Replacing settings references..."

sed -i 's/settings\.companyName/companyName/g' "$FILE"


echo "Replacing old branding..."

sed -i 's/Coherent Tours/{companyName}/g' "$FILE"


echo ""
echo "Current remaining settings references:"
grep -n "settings" "$FILE" || echo "No settings references"


echo ""
echo "Building frontend..."

npm run build


echo ""
echo "======================================"
echo " WHY CHOOSE US FIX COMPLETE"
echo "======================================"
