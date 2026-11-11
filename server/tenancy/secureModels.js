/**
 * Purpose: secure Models tenant-isolation module. Main declarations: secureIdQuery, secureUpdate.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */


// Define secureIdQuery; its parameters and body implement this operation.
export function secureIdQuery(id,tenantId){

// Return the object assembled below to the caller.
return {

_id:id,

tenantId

};

}


// Define secureUpdate; its parameters and body implement this operation.
export function secureUpdate(id,tenantId){

// Return the object assembled below to the caller.
return {

_id:id,

tenantId

};

}
