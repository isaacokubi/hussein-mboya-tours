import Organization from "../models/Organization.js";


/*
 Resolve tenant from request

 Supports:
 - X-Tenant-ID header
 - X-Tenant-Slug header
 - Logged in user's organization
*/

export async function resolveTenant(req,res,next){

try{


let tenant=null;



// Header tenant ID

if(req.headers["x-tenant-id"]){

tenant =
await Organization.findById(
req.headers["x-tenant-id"]
);

}



// Header tenant slug

if(!tenant && req.headers["x-tenant-slug"]){

tenant =
await Organization.findOne({
slug:req.headers["x-tenant-slug"]
});

}



// User organization fallback

if(
!tenant &&
req.user &&
req.user.organization
){

tenant =
await Organization.findById(
req.user.organization
);

}



if(tenant){

req.tenantId = tenant._id;
req.tenant = tenant;

}



next();



}catch(error){

console.error(
"Tenant resolver error:",
error
);


res.status(500).json({
message:"Tenant resolution failed"
});


}

}



/*
 Strict tenant middleware
*/

export default async function tenantMiddleware(req,res,next){

try{


if(!req.user){

return res.status(401).json({
message:"Authentication required"
});

}



// SuperAdmin bypass

if(
req.user.role==="superadmin" ||
req.user.role==="SuperAdmin"
){

return next();

}




if(!req.tenantId){

return res.status(403).json({
message:"No tenant assigned"
});

}



next();



}catch(error){

console.error(
"Tenant middleware error:",
error
);


res.status(500).json({
message:"Tenant access failed"
});


}

}
