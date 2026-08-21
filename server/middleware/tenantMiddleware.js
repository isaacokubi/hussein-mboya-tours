import Organization from "../models/Organization.js";
import { runWithTenant } from "../tenancy/context.js";


export async function resolveTenant(req,res,next){


try{


const user=req.user;



// SUPER ADMIN HAS FULL PLATFORM ACCESS

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



// NORMAL COMPANY USERS

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



next();


}

catch(error){

next(error);

}


}

