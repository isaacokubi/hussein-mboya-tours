let activeTenantId = null;


export function setBackgroundTenant(tenantId){

    activeTenantId = tenantId;

}


export function getBackgroundTenant(){

    if(!activeTenantId){

        throw new Error(
            "Background tenant context missing"
        );

    }


    return activeTenantId;

}


export function clearBackgroundTenant(){

    activeTenantId=null;

}
