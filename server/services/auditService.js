import AuditLog from "../models/AuditLog.js";

export const createAuditLog =
async({

user,

action,

resource,

resourceId,

ipAddress,

userAgent,

metadata={}

})=>{

await AuditLog.create({

user,

action,

resource,

resourceId,

ipAddress,

userAgent,

metadata

});

};