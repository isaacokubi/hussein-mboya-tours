#!/bin/bash

echo "=========================================="
echo " COMPLETE TENANT RUNTIME + BRANDING FIX "
echo "=========================================="

ROOT="$(pwd)"
CLIENT="$ROOT/client"

if [ ! -d "$CLIENT" ]; then
    echo "ERROR: client folder missing"
    exit 1
fi


echo "1. Backup frontend..."
cp -r "$CLIENT/src" "$CLIENT/src_backup_tenant_fix_$(date +%s)"


echo "2. Fixing WhyChooseUs settings error..."

FILE="$CLIENT/src/components/home/WhyChooseUs.jsx"

if [ -f "$FILE" ]; then

python3 <<PY
from pathlib import Path

p=Path("$FILE")

data=p.read_text()

# add settings hook if missing
if "useSettings" not in data:

    data=data.replace(
        "import { useTenant } from",
        "import { useSettings } from '../../context/SettingsContext';\nimport { useTenant } from"
    )


if "const { settings" not in data:

    data=data.replace(
        "function WhyChooseUs",
        "function WhyChooseUs"
    )

    marker="{"

    idx=data.find(marker,data.find("function WhyChooseUs"))

    if idx!=-1:
        data=data[:idx+1] + """
  const { settings = {} } = useSettings() || {};
  const { tenant } = useTenant() || {};
  const companyName =
    settings?.companyName ||
    tenant?.name ||
    "Safari Adventures Kenya";

""" + data[idx+1:]


data=data.replace(
"Coherent Tours",
"{companyName}"
)

p.write_text(data)

print("WhyChooseUs fixed")

PY

else
echo "WhyChooseUs not found"
fi



echo "3. Fixing bad TenantContext imports..."

find "$CLIENT/src" -type f \\( -name "*.jsx" -o -name "*.js" \\) -print0 |
while IFS= read -r -d '' file
do

sed -i 's#../../../context/TenantContext#../../context/TenantContext#g' "$file"

done



echo "4. Removing remaining Coherent Tours leaks..."

grep -rl "Coherent Tours" "$CLIENT/src" \
--include="*.jsx" \
--include="*.js" |
while read file
do
echo "Cleaning $file"

sed -i 's/Coherent Tours/{companyName}/g' "$file"

done



echo "5. Checking tenant imports..."

grep -R "TenantContext" "$CLIENT/src" | head -50



echo "6. Fixing frontend environment..."

ENV="$CLIENT/.env"

if [ -f "$ENV" ]; then

sed -i \
's#VITE_API_URL=.*#VITE_API_URL=http://localhost:5000/api#g' \
"$ENV"

sed -i \
's#VITE_SOCKET_URL=.*#VITE_SOCKET_URL=http://localhost:5000#g' \
"$ENV"

fi



echo "7. Clearing Vite cache..."

rm -rf "$CLIENT/node_modules/.vite"



echo "8. Building frontend..."

cd "$CLIENT"

npm run build


echo ""
echo "=========================================="
echo " TENANT FIX COMPLETE "
echo "=========================================="

echo ""
echo "Next:"
echo "1. Restart backend"
echo "2. Restart frontend"
echo "3. Login Safari Adventures Kenya again"
echo ""
