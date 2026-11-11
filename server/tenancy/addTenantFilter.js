/**
 * Purpose: add Tenant Filter tenant-isolation module. Main declarations: tenantFilter.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export function tenantFilter(req){
    // Check the condition (!req?.tenantId) and run the matching branch.
    if(!req?.tenantId){
        // Return the object assembled below to the caller.
        return {};
    }

    // Return the object assembled below to the caller.
    return {
        tenantId:req.tenantId
    };
}
