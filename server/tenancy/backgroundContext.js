/**
 * Purpose: background Context tenant-isolation module. Main declarations: setBackgroundTenant, getBackgroundTenant, clearBackgroundTenant.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
let activeTenantId = null;


// Define setBackgroundTenant; its parameters and body implement this operation.
export function setBackgroundTenant(tenantId){

    // Perform the side effect or state update expressed on the following line.
    activeTenantId = tenantId;

}


// Define getBackgroundTenant; its parameters and body implement this operation.
export function getBackgroundTenant(){

    // Check the condition (!activeTenantId) and run the matching branch.
    if(!activeTenantId){

        // Stop the current operation by raising a new Error instance.
        throw new Error(
            "Background tenant context missing"
        );

    }


    // Return the value of activeTenantId to the caller.
    return activeTenantId;

}


// Define clearBackgroundTenant; its parameters and body implement this operation.
export function clearBackgroundTenant(){

    // Perform the side effect or state update expressed on the following line.
    activeTenantId=null;

}
