import mongoose from "mongoose";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";


export const getAuditLogs = async(req,res)=>{
try{

const logs = await AuditLog.find()
.sort({createdAt:-1})
.limit(100);

res.json({
success:true,
data:logs
});

}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}
};



export const getSecurityStatus = async(req,res)=>{

try{

const admins = await User.countDocuments({
role:{
$in:[
"admin",
"superadmin",
"super_admin"
]
}
});


res.json({

success:true,

security:{
authentication:"active",
authorization:"active",
admins,
status:"protected"
}

});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};



export const getDatabaseStatus = async(req,res)=>{

try{

res.json({

success:true,

database:{

status:
mongoose.connection.readyState===1
?"connected"
:"disconnected",

host:
mongoose.connection.host,

name:
mongoose.connection.name

}

});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};



export const getSystemHealth = async(req,res)=>{

res.json({

success:true,

system:{

status:"healthy",

uptime:
process.uptime(),

memory:
process.memoryUsage(),

node:
process.version

}

});

};



export const getApiMonitor = async(req,res)=>{

res.json({

success:true,

api:{

status:"online",

timestamp:new Date(),

service:"Coherent Tours API"

}

});

};
