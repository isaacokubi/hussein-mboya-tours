import { getSystemSettings } from "../services/settingsService.js";
import AuditLog from "../models/AuditLog.js";
import SecurityLog from "../models/SecurityLog.js";
import mongoose from "mongoose";


export const getAudit = async(req,res)=>{
try{

const logs = await AuditLog.find()
.populate("user","name email")
.sort({
createdAt:-1
})
.limit(100);


res.json({

success:true,

message:"Audit center operational",

logs

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


const events = await SecurityLog.find()
.sort({
createdAt:-1
})
.limit(100);


res.json({

success:true,

message:"Security center operational",

events

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


res.json({

success:true,

message:"Database tools operational",

status:

mongoose.connection.readyState===1
?"healthy"
:"disconnected",

database:{
host:mongoose.connection.host,
name:mongoose.connection.name
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

  const settings = await getSystemSettings();
  const companyName = settings.companyName || "Company";
try{


const routes =
req.app._router?.stack
?.filter(r=>r.route)
?.map(r=>({
path:r.route.path,
methods:Object.keys(r.route.methods)
}))
|| [];


res.json({

success:true,

message:"API monitor operational",

api:{

status:"healthy",

service:`${companyName} API`,

version:"1.0.0",

environment:process.env.NODE_ENV || "development",

uptime:process.uptime(),

timestamp:new Date(),

endpoints:routes

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


res.json({

success:true,

message:"System health operational",

system:{

status:"healthy",

uptime:process.uptime(),

memory:process.memoryUsage(),

node:{

version:process.version

},

environment:process.env.NODE_ENV || "development",

timestamp:new Date()

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


res.json({

success:true,

message:"Platform settings operational",

settings:{}

});


}catch(error){

res.status(500).json({
success:false,
message:error.message
});

}

};
