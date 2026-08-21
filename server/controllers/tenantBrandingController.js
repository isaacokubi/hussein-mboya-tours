import {mergeTenantFilter} from "../tenancy/secureQuery.js";
import Organization from "../models/Organization.js";


export async function getBranding(req,res){

try{

const tenant =
await Organization.findById(
req.tenantId
);


if(!tenant){

return res.status(404).json({
message:"Tenant not found"
});

}


res.json({
success:true,
branding:{
name:tenant.name,
logo:tenant.logo,
favicon:tenant.favicon,
brandColors:tenant.brandColors,
contactEmail:tenant.contactEmail,
contactPhone:tenant.contactPhone,
website:tenant.website,
address:tenant.address,
currency:tenant.currency,
timezone:tenant.timezone,
invoiceFooter:tenant.invoiceFooter
}
});


}catch(error){

res.status(500).json({
message:error.message
});

}

}



export async function updateBranding(req,res){

try{

const updated =
await Organization.findByIdAndUpdate(
req.tenantId,
req.body,
{
new:true
}
);


res.json({
success:true,
organization:updated
});


}catch(error){

res.status(500).json({
message:error.message
});

}

}
