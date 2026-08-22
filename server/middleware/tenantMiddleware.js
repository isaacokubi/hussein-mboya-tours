import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";


export async function resolveTenant(req,res,next){

try{


const user=req.user;


// SUPER ADMIN PLATFORM ACCESS

if(
user &&
user.role==="super_admin"
){

return runWithTenant(
{
role:"super_admin",
bypass:true
},
()=>next()
);

}



// NORMAL TENANT USER

if(
user &&
user.tenantId
){

return runWithTenant(
{
tenantId:user.tenantId,
role:user.role
},
()=>next()
);

}



// PUBLIC WEBSITE DEFAULT TENANT

const tenant = await Organization.findOne({
slug:"hussein-mboya-tours"
});


if(tenant){

req.tenantId = tenant._id;
req.tenant = tenant;

return runWithTenant(
{
tenantId:tenant._id,
tenant,
role:"public",
bypass:false
},
()=>next()
);

}



// NO TENANT FOUND

next();


}

catch(error){

next(error);

}

}
