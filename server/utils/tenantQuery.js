/**
 * Purpose: tenant Query server application module. Main declarations: tenantQuery, platformQuery.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */


// Define tenantQuery; its parameters and body implement this operation.
export function tenantQuery(req, extra={}) {

// Check the condition (!req.user || !req.user.tenantId) and run the matching branch.
if(
!req.user ||
!req.user.tenantId
){
// Stop the current operation by raising a new Error instance.
throw new Error(
"Tenant context missing"
);
}

// Return the object assembled below to the caller.
return {
...extra,
tenantId:req.user.tenantId
};

}


// Define platformQuery; its parameters and body implement this operation.
export function platformQuery(extra={}){

// Return the value of extra to the caller.
return extra;

}
