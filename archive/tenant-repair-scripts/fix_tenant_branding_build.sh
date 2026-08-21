#!/bin/bash

set -e

echo "======================================"
echo "FIX TENANT BRANDING BUILD"
echo "======================================"

CLIENT="client"

cd "$CLIENT"


echo ""
echo "1. Fixing tenantBrandingApi import"
echo "--------------------------------------"

if [ -f src/api/tenantBrandingApi.js ]; then

python3 <<'PY'
from pathlib import Path

p = Path("src/api/tenantBrandingApi.js")

data = p.read_text()

data = data.replace(
    'import api from "./api";',
    'import api from "./axios";'
)

p.write_text(data)

print("tenantBrandingApi.js fixed")

PY

else
echo "tenantBrandingApi.js missing"
exit 1
fi


echo ""
echo "2. Checking TenantContext"
echo "--------------------------------------"

if [ ! -f src/context/TenantContext.jsx ]; then

echo "Creating missing TenantContext.jsx"

mkdir -p src/context

cat > src/context/TenantContext.jsx <<'EOF'
import React,{createContext,useContext,useEffect,useState} from "react";
import {getTenantBranding} from "../api/tenantBrandingApi";

const TenantContext=createContext();

export function TenantProvider({children}){

const [tenant,setTenant]=useState({
name:"Hussein Mboya Tours",
currency:"KES",
timezone:"Africa/Nairobi"
});


useEffect(()=>{
loadTenant();
},[]);


async function loadTenant(){

try{

const res=await getTenantBranding();

if(res?.branding){

setTenant(res.branding);

document.title=res.branding.name;

}

}catch(err){

console.error(
"Tenant branding error",
err
);

}

}


return (

<TenantContext.Provider value={{tenant,setTenant}}>

{children}

</TenantContext.Provider>

);

}


export function useTenant(){

return useContext(TenantContext);

}
EOF

else

echo "TenantContext exists"

fi



echo ""
echo "3. Checking main.jsx provider"
echo "--------------------------------------"


python3 <<'PY'
from pathlib import Path

p=Path("src/main.jsx")

if p.exists():

    data=p.read_text()

    if "TenantProvider" not in data:

        data=data.replace(
        "import React",
        "import {TenantProvider} from './context/TenantContext';\nimport React"
        )

        data=data.replace(
        "<App />",
        "<TenantProvider><App /></TenantProvider>"
        )

        p.write_text(data)

        print("TenantProvider added")

    else:
        print("TenantProvider already installed")

else:
    print("main.jsx missing")

PY



echo ""
echo "4. Running production build"
echo "--------------------------------------"

npm run build



echo ""
echo "5. Git commit"
echo "--------------------------------------"

cd ..

git add client/src/api/tenantBrandingApi.js \
client/src/context/TenantContext.jsx \
client/src/main.jsx


git commit -m "Fix tenant branding API and global tenant context" || true


echo ""
echo "6. Push changes"
echo "--------------------------------------"

git push origin fix/rbac-production || true


echo ""
echo "======================================"
echo "TENANT BUILD FIX COMPLETE"
echo "======================================"

