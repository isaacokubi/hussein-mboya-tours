import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import AuditLog from "../models/AuditLog.js";
import SecurityLog from "../models/SecurityLog.js";


const securityService = {

async getSecurityStatus(){

const [
users,
admins,
roles,
permissions,
auditEvents,
securityEvents
]=await Promise.all([

User.countDocuments(),

User.countDocuments({
role:{
$in:[
"admin",
"superadmin",
"super_admin"
]
}
}),

Role.countDocuments(),

Permission.countDocuments(),

AuditLog.countDocuments(),

SecurityLog.countDocuments()

]);


const database =
mongoose.connection.readyState===1
?"healthy"
:"warning";


return {

securityScore:92,

threatLevel:
securityEvents>20
?"medium"
:"low",

authentication:{

status:"healthy",

totalUsers:users,

activeSessions:0,

failedLogins:0,

twoFactorEnabled:0

},


authorization:{

roles,

permissions,

admins

},


system:{

database,

auditEvents,

securityEvents

}

};


},


async getSecurityEvents(){

return await SecurityLog.find()
.sort({
createdAt:-1
})
.limit(10)
.lean();

}

};


export default securityService;
