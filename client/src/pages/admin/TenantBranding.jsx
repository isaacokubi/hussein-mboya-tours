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
