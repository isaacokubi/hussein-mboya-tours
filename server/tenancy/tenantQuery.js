export function tenantFilter(req,query={}){


if(!req.tenantId){

throw new Error(
"Missing tenant context"
);

}


return {

...query,

tenantId:req.tenantId

};


}
