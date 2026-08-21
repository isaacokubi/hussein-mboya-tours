export function tenantFilter(req){
    if(!req?.tenantId){
        return {};
    }

    return {
        tenantId:req.tenantId
    };
}
