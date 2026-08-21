#!/bin/bash

set -e

echo "======================================"
echo "CREATING TENANT BRANDING FRONTEND"
echo "======================================"

cd client

mkdir -p src/api
mkdir -p src/pages/admin


echo "======================================"
echo "CREATING BRANDING API SERVICE"
echo "======================================"

cat > src/api/tenantBrandingApi.js <<'EOF'
import api from "./api";

export const getTenantBranding = async () => {
    const response = await api.get(
        "/tenant/branding"
    );

    return response.data;
};


export const updateTenantBranding = async (data) => {

    const response = await api.put(
        "/tenant/branding",
        data
    );

    return response.data;
};
EOF



echo "======================================"
echo "CREATING TENANT BRANDING PAGE"
echo "======================================"


cat > src/pages/admin/TenantBranding.jsx <<'EOF'
import React, {useEffect,useState} from "react";

import {
    getTenantBranding,
    updateTenantBranding
} from "../../api/tenantBrandingApi";


export default function TenantBranding(){

const [form,setForm]=useState({
    name:"",
    logo:"",
    favicon:"",
    contactEmail:"",
    contactPhone:"",
    website:"",
    address:"",
    currency:"KES",
    timezone:"Africa/Nairobi",
    invoiceFooter:"",

    brandColors:{
        primary:"#0f766e",
        secondary:"#1e293b",
        accent:"#f59e0b"
    }
});


const [loading,setLoading]=useState(true);


useEffect(()=>{

load();

},[]);



async function load(){

try{

const data =
await getTenantBranding();


setForm(prev=>({
...prev,
...data.branding
}));


}catch(error){

console.error(error);

}

finally{

setLoading(false);

}

}



function update(field,value){

setForm({

...form,
[field]:value

});

}



function updateColor(field,value){

setForm({

...form,

brandColors:{
...form.brandColors,
[field]:value
}

});

}



async function save(){

try{

await updateTenantBranding(form);

alert(
"Branding updated successfully"
);


}catch(error){

alert(
"Failed updating branding"
);

}

}



if(loading)
return <h3>Loading branding...</h3>;



return (

<div className="admin-page">

<h1>
Tenant Branding
</h1>


<label>
Company Name
</label>

<input
value={form.name}
onChange={
e=>update("name",e.target.value)
}
/>



<label>
Logo URL
</label>

<input
value={form.logo}
onChange={
e=>update("logo",e.target.value)
}
/>



<label>
Email
</label>

<input
value={form.contactEmail}
onChange={
e=>update("contactEmail",e.target.value)
}
/>



<label>
Phone
</label>

<input
value={form.contactPhone}
onChange={
e=>update("contactPhone",e.target.value)
}
/>



<label>
Website
</label>

<input
value={form.website}
onChange={
e=>update("website",e.target.value)
}
/>



<label>
Address
</label>

<textarea

value={form.address}

onChange={
e=>update("address",e.target.value)
}

/>



<h3>
Brand Colors
</h3>


<label>
Primary
</label>

<input
type="color"
value={
form.brandColors.primary
}
onChange={
e=>updateColor(
"primary",
e.target.value
)
}
/>



<label>
Secondary
</label>

<input
type="color"
value={
form.brandColors.secondary
}
onChange={
e=>updateColor(
"secondary",
e.target.value
)
}
/>



<label>
Accent
</label>

<input
type="color"
value={
form.brandColors.accent
}
onChange={
e=>updateColor(
"accent",
e.target.value
)
}
/>



<label>
Invoice Footer
</label>

<textarea

value={form.invoiceFooter}

onChange={
e=>update(
"invoiceFooter",
e.target.value
)
}

/>



<button
onClick={save}
>

Save Branding

</button>


</div>

);

}
EOF



echo "======================================"
echo "SEARCHING ROUTER"
echo "======================================"

ROUTER=$(find src -name "*Routes*.jsx" -o -name "App.jsx" | head -1)

echo "Router file:"
echo $ROUTER



echo "======================================"
echo "ADDING ROUTE"
echo "======================================"



python3 <<PY

from pathlib import Path

file=Path("$ROUTER")

if file.exists():

    data=file.read_text()

    if "TenantBranding" not in data:

        data=data.replace(
        "import React",
        'import TenantBranding from "./pages/admin/TenantBranding";\n\nimport React'
        )


        if "<Routes>" in data:

            data=data.replace(
            "<Routes>",
            "<Routes>\n<Route path='/admin/branding' element={<TenantBranding />} />"
            )


        file.write_text(data)


print("Route patch complete")

PY



echo "======================================"
echo "BUILD TEST"
echo "======================================"

npm run build


echo "======================================"
echo "FRONTEND BRANDING READY"
echo "======================================"


cd ..

git add client/src/api/tenantBrandingApi.js \
client/src/pages/admin/TenantBranding.jsx \
client


git commit -m "Add tenant white label branding dashboard frontend" || true


git push origin fix/rbac-production


echo "======================================"
echo "DONE"
echo "======================================"

