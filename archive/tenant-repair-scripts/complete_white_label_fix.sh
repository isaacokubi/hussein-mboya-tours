#!/bin/bash

set -e

echo "=============================================="
echo " COMPLETE MULTI-TENANT WHITE LABEL FIX"
echo "=============================================="

ROOT=$(pwd)

echo ""
echo "1. Creating backup..."

mkdir -p branding_backup_$(date +%s)

BACKUP="branding_backup_$(ls -dt branding_backup_* | head -1 | cut -d_ -f3)"

cp -r src/components/home src/pages src/context "$BACKUP"/ 2>/dev/null || true


echo ""
echo "2. Checking TenantContext..."

mkdir -p src/context


if [ ! -f src/context/TenantContext.jsx ]; then

cat > src/context/TenantContext.jsx <<'EOF'
import React,{createContext,useContext,useEffect,useState} from "react";
import api from "../api/axios";

const TenantContext=createContext(null);

export function TenantProvider({children}){

const [tenant,setTenant]=useState(null);

useEffect(()=>{

async function loadTenant(){

try{

const res=await api.get("/tenant/current");

setTenant(
res.data?.tenant ||
res.data ||
null
);

}catch(err){

console.log("Tenant load skipped");

}

}

loadTenant();

},[]);


return (

<TenantContext.Provider value={{tenant}}>

{children}

</TenantContext.Provider>

);

}


export function useTenant(){

return useContext(TenantContext) || {
tenant:null
};

}
EOF

fi



echo ""
echo "3. Fixing tenant imports..."

find src/components/home -name "*.jsx" -type f -exec sed -i \
's#../../../context/TenantContext#../../context/TenantContext#g' {} \;


echo ""
echo "4. Fixing undefined settings references..."


FILES=$(grep -rl "settings.companyName" src 2>/dev/null || true)


for FILE in $FILES
do

echo "Processing $FILE"

sed -i \
's/settings\.companyName/companyName/g' \
"$FILE"

done



echo ""
echo "5. Injecting companyName variable..."


for FILE in $(grep -rl "companyName" src/components/home src/pages --include="*.jsx" 2>/dev/null)
do


if grep -q "useTenant" "$FILE"; then


if ! grep -q "const companyName" "$FILE"; then


sed -i '/const { tenant } = useTenant()/a\
\
const companyName = tenant?.name || tenant?.companyName || "Your Travel Company";\
' "$FILE"


fi

fi

done



echo ""
echo "6. Removing hardcoded Coherent Tours..."


grep -rl "Coherent Tours" src \
--include="*.jsx" \
--include="*.js" | while read FILE

do

echo "Updating $FILE"

sed -i 's/Coherent Tours/{companyName}/g' "$FILE"

done



echo ""
echo "7. Fixing static testimonials..."


sed -i \
's/Coherent Tours gave us/the company gave us/g' \
src/components/home/TestimonialsSection.jsx 2>/dev/null || true



echo ""
echo "8. Fixing environment API..."

if [ -f .env ]; then

sed -i \
's#https://employee-darkroom-acquire.ngrok-free.dev/api#http://localhost:5000/api#g' \
.env


sed -i \
's#https://employee-darkroom-acquire.ngrok-free.dev#http://localhost:5000#g' \
.env

fi



echo ""
echo "9. Checking remaining leaks..."

echo "----------------------------------------------"

grep -R -i \
"Coherent Tours\|Coherent\|Sarah Williams\|James Anderson\|Amina Hassan" \
src \
--include="*.jsx" \
--include="*.js" || echo "No old branding found"



echo ""
echo "10. Checking TenantContext imports..."

grep -R "TenantContext" -n src/components/home src/pages || true



echo ""
echo "11. Building frontend..."

npm run build



echo ""
echo "=============================================="
echo " WHITE LABEL FIX COMPLETE"
echo "=============================================="

echo ""
echo "Next:"
echo "1. Restart Vite"
echo "2. Clear browser storage"
echo "3. Login with Safari Adventures Kenya"
