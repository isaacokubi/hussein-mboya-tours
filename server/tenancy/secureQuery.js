import * as firestore from "../config/firestore.js";


export function getTenantFilter(req){

    if(!req.user){
        throw new Error("Missing authenticated user");
    }


    const role =
        req.user.role;


    // Platform level users
    if(
        role === "super_admin" ||
        role === "super_admin"
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
        new firestore.Types.ObjectId(tenantId)
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
