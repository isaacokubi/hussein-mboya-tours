
import mongoose from "mongoose";
import User from "../models/User.js";
import AuditLog from "../models/AuditLog.js";
import { createAuditLog } from "../services/auditService.js";



export const getAudit = async(req,res)=>{

try{

const total =
await AuditLog.countDocuments();


const recent =
await AuditLog.find()
.sort({
createdAt:-1
})
.limit(10)
.populate(
"user",
"name email role"
);


await createAuditLog({
user:req.user?._id,
action:"view",
resource:"Audit Center",
description:"Viewed audit center dashboard",
ipAddress:req.ip,
userAgent:req.headers["user-agent"]
});


res.json({

success:true,

data:{
total,
recent
}

});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};





export const getSecurity = async(req,res)=>{

try{


const failedLogins =
await AuditLog.countDocuments({
action:"login_failed"
});


const critical =
await AuditLog.countDocuments({
severity:"critical"
});


await createAuditLog({
user:req.user?._id,
action:"view",
resource:"Security",
description:"Viewed security dashboard",
ipAddress:req.ip,
userAgent:req.headers["user-agent"]
});


res.json({

success:true,

data:{
failedLogins,
criticalEvents:critical
}

});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};





export const getDatabase = async(req,res)=>{

try{


const state =
mongoose.connection.readyState;


await createAuditLog({
user:req.user?._id,
action:"view",
resource:"Database",
description:"Viewed database tools",
ipAddress:req.ip,
userAgent:req.headers["user-agent"]
});


res.json({

success:true,

data:{

status:
state===1
?"connected"
:"disconnected",

database:
mongoose.connection.name,

host:
mongoose.connection.host

}

});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};






export const getApiMonitor = async(req,res)=>{

try{


await createAuditLog({
user:req.user?._id,
action:"view",
resource:"API Monitor",
description:"Viewed API monitoring",
ipAddress:req.ip,
userAgent:req.headers["user-agent"]
});


res.json({

success:true,

data:{

status:"operational",

timestamp:new Date(),

serverTime:process.uptime()

}

});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};






export const getSystem = async(req,res)=>{

try{


const memory =
process.memoryUsage();


await createAuditLog({
user:req.user?._id,
action:"view",
resource:"System",
description:"Viewed system health",
ipAddress:req.ip,
userAgent:req.headers["user-agent"]
});


res.json({

success:true,

data:{

status:"healthy",

uptime:
process.uptime(),

memory

}

});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};







export const getSettings = async(req,res)=>{

try{


await createAuditLog({
user:req.user?._id,
action:"view",
resource:"Settings",
description:"Viewed platform settings",
ipAddress:req.ip,
userAgent:req.headers["user-agent"]
});


res.json({

success:true,

data:{

maintenance:false,

environment:
process.env.NODE_ENV || "development"

}

});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};
