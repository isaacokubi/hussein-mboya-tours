/**
 * Purpose: audit Service business-logic service. Main declarations: createAuditLog.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { mergeTenantFilter , requireTenantId} from "../tenancy/context.js";

// Load ../models/AuditLog.js so this module can use its exported dependencies.
import AuditLog from "../models/AuditLog.js";


// Declare createAuditLog for use by the surrounding module or function.
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
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();

// Run this operation with a dedicated error-handling path for failures.
try{

// Return the completed the result of AuditLog.create() operation to the caller.
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

// Perform the side effect or state update expressed on the following line.
console.error(
"Audit Log Error:",
error.message
);

// Return the expression shown below to the caller.
return null;

}

};
