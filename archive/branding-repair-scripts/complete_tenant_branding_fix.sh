#!/bin/bash

set -e

echo "======================================"
echo " COMPLETE TENANT BRANDING FIX"
echo "======================================"

ROOT=$(pwd)


############################################
# 1. Create Tenant Context
############################################

mkdir -p src/context

cat > src/context/TenantContext.jsx <<'EOF'
import React,{createContext,useContext,useEffect,useState} from "react";
import api from "../api/axios";

const TenantContext=createContext(null);

export function TenantProvider({children}){

 const [tenant,setTenant]=useState({
   name:"Safari Adventures Kenya",
   companyName:"Safari Adventures Kenya"
 });

 const [loading,setLoading]=useState(true);


 useEffect(()=>{

   async function loadTenant(){

    try{

      const res=await api.get("/tenant/current");

      const data=res.data?.tenant || res.data || {};

      setTenant({
        ...data,
        name:data.name || data.companyName || "Safari Adventures Kenya",
        companyName:data.companyName || data.name || "Safari Adventures Kenya"
      });


      localStorage.setItem(
        "tenantName",
        data.name || data.companyName || ""
      );


    }catch(err){

      console.log(
       "Tenant fallback mode"
      );

    }
    finally{
      setLoading(false);
    }

   }


   loadTenant();

 },[]);


 return (

 <TenantContext.Provider
 value={{
   tenant,
   loading
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


echo "TenantContext created"



############################################
# 2. Fix broken replacements
############################################


python3 <<'PY'

from pathlib import Path


for p in Path("src").rglob("*.jsx"):

    s=p.read_text()


    bad='"{settings?.companyName || tenant?.name || \'Safari Adventures Kenya\'}"'


    if bad in s:

        s=s.replace(
            bad,
            "settings?.companyName || 'Safari Adventures Kenya'"
        )

        p.write_text(s)

        print("Fixed",p)

PY



############################################
# 3. Add tenant usage to branding components
############################################


python3 <<'PY'

from pathlib import Path


files=[

"src/components/home/WhyChooseUs.jsx",
"src/components/home/NewsletterSection.jsx",
"src/components/home/TestimonialsSection.jsx",
"src/pages/Tours.jsx",
"src/pages/About.jsx",
"src/pages/Destinations.jsx",
"src/pages/MyCustomTours.jsx",
"src/pages/BookingDetails.jsx"

]


for file in files:

 p=Path(file)

 if not p.exists():
  continue


 s=p.read_text()


 if "useTenant" not in s:

  if "import" in s:

   lines=s.splitlines()

   lines.insert(
    0,
    'import { useTenant } from "../context/TenantContext";'
   )

   s="\n".join(lines)


  marker="{"

  idx=s.find(marker)

  if idx!=-1:

   pass


 p.write_text(s)


print("Branding imports prepared")

PY



############################################
# 4. Check remaining old names
############################################


echo ""
echo "Checking old branding..."

grep -R "Coherent Tours" -n src || echo "OK - no Coherent Tours"



############################################
# 5. Build
############################################


echo ""
echo "Running frontend build..."

npm run build


echo ""
echo "======================================"
echo " TENANT BRANDING FIX COMPLETE"
echo "======================================"
