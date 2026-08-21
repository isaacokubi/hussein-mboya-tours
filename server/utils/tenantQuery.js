

export function tenantQuery(req, extra={}) {

if(
!req.user ||
!req.user.tenantId
){
throw new Error(
"Tenant context missing"
);
}

return {
...extra,
tenantId:req.user.tenantId
};

}


export function platformQuery(extra={}){

return extra;

}

