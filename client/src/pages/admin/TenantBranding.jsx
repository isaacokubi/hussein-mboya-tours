/**
 * Purpose: Tenant Branding page-level UI component. Main declarations: TenantBranding, load, update, updateColor, save.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import React, {useEffect,useState} from "react";

// Load ../../api/tenantBrandingApi so this module can use its exported dependencies.
import {
    getTenantBranding,
    updateTenantBranding
} from "../../api/tenantBrandingApi";


// Define TenantBranding; its parameters and body implement this operation.
export default function TenantBranding(){

// Declare [form,setForm] for use by the surrounding module or function.
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


// Declare [loading,setLoading] for use by the surrounding module or function.
const [loading,setLoading]=useState(true);





// Define load; its parameters and body implement this operation.
async function load(){

// Run this operation with a dedicated error-handling path for failures.
try{

// Declare data for use by the surrounding module or function.
const data =
await getTenantBranding();


// Perform the side effect or state update expressed on the following line.
setForm(prev=>({
...prev,
...data.branding
}));


}catch(error){

// Perform the side effect or state update expressed on the following line.
console.error(error);

}

finally{

// Perform the side effect or state update expressed on the following line.
setLoading(false);

}

}

// Perform the side effect or state update expressed on the following line.
useEffect(() => {
  // Perform the side effect or state update expressed on the following line.
  load();
}, []);




// Define update; its parameters and body implement this operation.
function update(field,value){

// Perform the side effect or state update expressed on the following line.
setForm({

...form,
[field]:value

});

}



// Define updateColor; its parameters and body implement this operation.
function updateColor(field,value){

// Perform the side effect or state update expressed on the following line.
setForm({

...form,

brandColors:{
...form.brandColors,
[field]:value
}

});

}



// Define save; its parameters and body implement this operation.
async function save(){

// Run this operation with a dedicated error-handling path for failures.
try{

// Perform the side effect or state update expressed on the following line.
await updateTenantBranding(form);

// Perform the side effect or state update expressed on the following line.
alert(
"Branding updated successfully"
);


}catch(error){

// Perform the side effect or state update expressed on the following line.
alert(
"Failed updating branding"
);

}

}



// Check the condition (loading) and run the matching branch.
if(loading)
// Return the expression shown below to the caller.
return <h3>Loading branding...</h3>;



// Return the expression shown below to the caller.
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
