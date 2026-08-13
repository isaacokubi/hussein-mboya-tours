import mongoose from "mongoose";
import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import AuditLog from "../models/AuditLog.js";
import SecurityLog from "../models/SecurityLog.js";


const securityService = {


async getSecurityStatus(){

const [
totalUsers,
adminUsers,
superAdmins,
roles,
permissions,
auditEvents,
securityEvents
] = await Promise.all([

User.countDocuments(),

User.countDocuments({
role:{
$in:[
"admin",
"administrator"
]
}
}),

User.countDocuments({
role:{
$in:[
"superadmin",
"super_admin"
]
}
}),

Role.countDocuments(),

Permission.countDocuments({
isActive:{
$ne:false
}
}),

AuditLog.countDocuments(),

SecurityLog.countDocuments()

]);


const databaseHealthy =
mongoose.connection.readyState === 1;


let score = 100;


if(!databaseHealthy)
score -= 30;

if(securityEvents > 50)
score -= 20;

if(auditEvents === 0)
score -= 10;


return {


securityScore:Math.max(score,0),


threatLevel:
securityEvents > 50
?"high"
:
securityEvents > 10
?"medium"
:"low",



authentication:{

status:"healthy",

users:totalUsers,

admins:adminUsers,

superAdmins,

jwt:"active"

},



authorization:{

roles,

permissions,

admins:adminUsers,

superAdmins

},



audit:{

events:auditEvents

},



security:{

events:securityEvents

},



system:{

database:
databaseHealthy
?"healthy"
:"error"

}


};


},



async getSecurityEvents(){

return await SecurityLog
.find()
.sort({
createdAt:-1
})
.limit(10)
.lean();

}


};


export default securityService;
