import { getBackgroundTenant } from "./backgroundContext.js";


export function backgroundTenantFilter(query={}){

    return {

        ...query,

        tenantId:getBackgroundTenant()

    };

}
