#!/bin/bash

set -e

echo "======================================"
echo " FINAL TENANT BRANDING REPAIR"
echo "======================================"

CLIENT="$(pwd)"
SRC="$CLIENT/src"

echo "1. Checking context directory..."

mkdir -p "$SRC/context"


echo "2. Creating TenantContext..."

cat > "$SRC/context/TenantContext.jsx" <<'EOF'
import React, { createContext, useContext, useMemo } from "react";
import { useSettings } from "./SettingsContext";

const TenantContext = createContext(null);

export function TenantProvider({ children }) {

  const settingsContext = useSettings?.() || {};

  const tenant = useMemo(() => {

    const settings =
      settingsContext.settings ||
      {};

    return {
      name:
        settings.companyName ||
        settings.tenantName ||
        "Safari Adventures Kenya",

      logo:
        settings.logo ||
        settings.companyLogo ||
        "",

      phone:
        settings.supportPhone ||
        "",

      email:
        settings.supportEmail ||
        "",

      currency:
        settings.currency ||
        "KES"
    };

  }, [settingsContext.settings]);


  return (
    <TenantContext.Provider value={{tenant}}>
      {children}
    </TenantContext.Provider>
  );
}


export function useTenant(){

  return useContext(TenantContext) || {
    tenant:{
      name:"Safari Adventures Kenya"
    }
  };

}
EOF



echo "3. Fixing broken imports..."

find "$SRC" -type f -name "*.jsx" -o -name "*.js" | while read file
do

if grep -q "TenantContext" "$file"
then

echo "Checking $file"

sed -i 's#../context/TenantContext#../../context/TenantContext#g' "$file"

fi

done



echo "4. Updating remaining default company names..."

grep -rl "Coherent Tours" "$SRC" | while read file
do

echo "Updating $file"

sed -i 's/Coherent Tours/Safari Adventures Kenya/g' "$file"

done



echo "5. Fixing dynamic branding defaults..."

grep -rl "Safari Adventures Kenya" "$SRC" | while read file
do

sed -i \
"s/settings?.companyName || 'Safari Adventures Kenya'/settings?.companyName || tenant?.name || 'Safari Adventures Kenya'/g" \
"$file"

done



echo "6. Checking remaining references..."

if grep -R "Coherent Tours" "$SRC"
then
echo "WARNING: old branding remains"
else
echo "OK - no old branding"
fi



echo "7. Building frontend..."

npm run build


echo ""
echo "======================================"
echo " BRANDING FIX COMPLETE"
echo "======================================"

