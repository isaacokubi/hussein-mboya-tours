/**
 * Purpose: secure Query tenant-isolation module. Main declarations: getTenantFilter, mergeTenantFilter.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";


// Define getTenantFilter; its parameters and body implement this operation.
export function getTenantFilter(req){

    // Check the condition (!req.user) and run the matching branch.
    if(!req.user){
        // Stop the current operation by raising a new Error instance.
        throw new Error("Missing authenticated user");
    }


    // Declare role for use by the surrounding module or function.
    const role =
        req.user.role;


    // Platform level users
    // Check the condition (role === "super_admin" || role === "super_admin") and run the matching branch.
    if(
        role === "super_admin" ||
        role === "super_admin"
    ){
        // Return the object assembled below to the caller.
        return {};
    }


    // Declare tenantId for use by the surrounding module or function.
    const tenantId =
        req.user.tenantId ||
        req.user.organization;


    // Check the condition (!tenantId) and run the matching branch.
    if(!tenantId){
        // Stop the current operation by raising a new Error instance.
        throw new Error(
            "Tenant context missing"
        );
    }


    // Return the object assembled below to the caller.
    return {
        tenantId:
        new mongoose.Types.ObjectId(tenantId)
    };

}



// Define mergeTenantFilter; its parameters and body implement this operation.
export function mergeTenantFilter(
    query,
    req
){

    // Return the object assembled below to the caller.
    return {
        ...query,
        ...getTenantFilter(req)
    };

}
