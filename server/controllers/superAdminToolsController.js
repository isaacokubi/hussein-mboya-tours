/**
 * Purpose: super Admin Tools Controller HTTP controller. Main declarations: getAudit, getSecurity, getDatabase, getApiMonitor, getSystem.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { publicErrorMessage } from "../utils/publicError.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load ../services/settingsService.js so this module can use its exported dependencies.
import { getSystemSettings } from "../services/settingsService.js";
// Load ../models/AuditLog.js so this module can use its exported dependencies.
import AuditLog from "../models/AuditLog.js";
// Load ../models/SecurityLog.js so this module can use its exported dependencies.
import SecurityLog from "../models/SecurityLog.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";


// Declare getAudit for use by the surrounding module or function.
export const getAudit = async(req,res)=>{
// Run this operation with a dedicated error-handling path for failures.
try{

// Declare logs for use by the surrounding module or function.
const logs = await AuditLog.find(tenantFilter(req))
.populate("user","name email")
.sort({
createdAt:-1
})
.limit(100);


// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

message:"Audit center operational",

logs

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
res.status(500).json({
success:false,
message: publicErrorMessage(error)
});

}

};



// Declare getSecurity for use by the surrounding module or function.
export const getSecurity = async(req,res)=>{
// Run this operation with a dedicated error-handling path for failures.
try{


// Declare events for use by the surrounding module or function.
const events = await SecurityLog.find(tenantFilter(req))
.sort({
createdAt:-1
})
.limit(100);


// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

message:"Security center operational",

events

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
res.status(500).json({
success:false,
message: publicErrorMessage(error)
});

}

};



// Declare getDatabase for use by the surrounding module or function.
export const getDatabase = async(req,res)=>{
// Run this operation with a dedicated error-handling path for failures.
try{


// Perform the side effect or state update expressed on the following line.
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

// Perform the side effect or state update expressed on the following line.
res.status(500).json({
success:false,
message: publicErrorMessage(error)
});

}

};



// Declare getApiMonitor for use by the surrounding module or function.
export const getApiMonitor = async(req,res)=>{

  // Declare settings for use by the surrounding module or function.
  const settings = await getSystemSettings();
  // Declare companyName for use by the surrounding module or function.
  const companyName = settings.companyName || "Company";
// Run this operation with a dedicated error-handling path for failures.
try{


// Declare routes for use by the surrounding module or function.
const routes =
req.app._router?.stack
?.filter(r=>r.route)
?.map(r=>({
path:r.route.path,
methods:Object.keys(r.route.methods)
}))
|| [];


// Perform the side effect or state update expressed on the following line.
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

// Perform the side effect or state update expressed on the following line.
res.status(500).json({
success:false,
message: publicErrorMessage(error)
});

}

};



// Declare getSystem for use by the surrounding module or function.
export const getSystem = async(req,res)=>{
// Run this operation with a dedicated error-handling path for failures.
try{


// Perform the side effect or state update expressed on the following line.
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

// Perform the side effect or state update expressed on the following line.
res.status(500).json({
success:false,
message: publicErrorMessage(error)
});

}

};



// Declare getSettings for use by the surrounding module or function.
export const getSettings = async(req,res)=>{
// Run this operation with a dedicated error-handling path for failures.
try{


// Perform the side effect or state update expressed on the following line.
res.json({

success:true,

message:"Platform settings operational",

settings:{}

});


}catch(error){

// Perform the side effect or state update expressed on the following line.
res.status(500).json({
success:false,
message: publicErrorMessage(error)
});

}

};
