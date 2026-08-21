#!/bin/bash

set -e

echo "================================"
echo "CREATING TENANT CONTEXT"
echo "================================"


cd client


mkdir -p src/context


cat > src/context/TenantContext.jsx <<'EOF'
import React,{createContext,useContext,useEffect,useState} from "react";

import {
getTenantBranding
} from "../api/tenantBrandingApi";


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

if(res.branding){

setTenant(res.branding);


document.title=res.branding.name;


}

}catch(err){

console.error(
"Tenant branding load failed",
err
);

}

}


return (

<TenantContext.Provider
value={{
tenant,
setTenant
}}
>

{children}

</TenantContext.Provider>

);


}


export function useTenant(){

return useContext(TenantContext);

}

EOF



echo "================================"
echo "PATCHING MAIN APP"
echo "================================"


python3 <<PY

from pathlib import Path


files=[
"src/main.jsx",
"src/App.jsx"
]


for f in files:

 p=Path(f)

 if p.exists():

  data=p.read_text()


  if "TenantProvider" not in data:

   data=data.replace(
   "import React",
   "import {TenantProvider} from './context/TenantContext';\n\nimport React"
   )


   data=data.replace(
   "<App />",
   "<TenantProvider><App /></TenantProvider>"
   )


   p.write_text(data)


print("Tenant provider installed")

PY



npm run build


cd ..

git add client

git commit -m "Add global tenant branding context"

git push origin fix/rbac-production || true


echo "================================"
echo "DONE"
echo "================================"

