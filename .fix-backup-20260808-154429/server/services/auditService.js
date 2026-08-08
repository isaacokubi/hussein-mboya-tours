import AuditLog from "../models/AuditLog.js";

/*
|--------------------------------------------------------------------------
| CREATE AUDIT LOG
|--------------------------------------------------------------------------
*/

export const createAuditLog = async ({
  user = null,
  action,
  resource,
  resourceId = null,
  ipAddress = null,
  userAgent = null,
  metadata = {},
}) => {
  try {
    return await AuditLog.create({
      user,
      action,
      resource,
      resourceId,
      ipAddress,
      userAgent,
      metadata,
    });
  } catch (error) {
    console.error("Audit Log Error:", error.message);

    // Don't interrupt the main application if audit logging fails
    return null;
  }
};


export const createAuditLog = async(data)=>{
    return {
        success:true,
        data
    };
};
