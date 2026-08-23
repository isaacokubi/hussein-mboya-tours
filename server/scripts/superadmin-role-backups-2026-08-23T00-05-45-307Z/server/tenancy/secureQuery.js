import mongoose from "mongoose";


export function getTenantFilter(req){

    if(!req.user){
        throw new Error("Missing authenticated user");
    }


    const role =
        req.user.role;


    // Platform level users
    if(
        role === "super_admin" ||
        role === "superadmin"
    ){
        return {};
    }


    const tenantId =
        req.user.tenantId ||
        req.user.organization;


    if(!tenantId){
        throw new Error(
            "Tenant context missing"
        );
    }


    return {
        tenantId:
        new mongoose.Types.ObjectId(tenantId)
    };

}



export function mergeTenantFilter(
    query,
    req
){

    return {
        ...query,
        ...getTenantFilter(req)
    };

}
