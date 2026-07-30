import mongoose from "mongoose";

const auditLogSchema =
new mongoose.Schema(
{

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

action:String,

resource:String,

resourceId:String,

ipAddress:String,

userAgent:String,

metadata:{
type:Object,
default:{}
}

},
{
timestamps:true
}
);

export default mongoose.model(
"AuditLog",
auditLogSchema
);