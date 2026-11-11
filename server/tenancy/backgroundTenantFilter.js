/**
 * Purpose: background Tenant Filter tenant-isolation module. Main declarations: backgroundTenantFilter.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { getBackgroundTenant } from "./backgroundContext.js";


// Define backgroundTenantFilter; its parameters and body implement this operation.
export function backgroundTenantFilter(query={}){

    // Return the object assembled below to the caller.
    return {

        ...query,

        tenantId:getBackgroundTenant()

    };

}
