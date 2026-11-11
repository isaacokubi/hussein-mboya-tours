/**
 * Purpose: tenant Query tenant-isolation module. Main declarations: tenantFilter.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export function tenantFilter(req,query={}){


// Check the condition (!req.tenantId) and run the matching branch.
if(!req.tenantId){

// Stop the current operation by raising a new Error instance.
throw new Error(
"Missing tenant context"
);

}


// Return the object assembled below to the caller.
return {

...query,

tenantId:req.tenantId

};


}
