import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";

import AuditLog from "../models/AuditLog.js";


export const createAuditLog = async({

user=null,
action,
resource,
resourceId=null,
description="",
status="success",
severity="low",
ipAddress="",
userAgent="",
method="",
endpoint="",
metadata={}

})=>{
  requireTenantId();

try{

return await AuditLog.create({

user,
action,
resource,
resourceId,
description,
status,
severity,
ipAddress,
userAgent,
method,
endpoint,
metadata

});


}catch(error){

console.error(
"Audit Log Error:",
error.message
);

return null;

}

};
