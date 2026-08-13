import mongoose from "mongoose";
import AuditLog from "../models/AuditLog.js";
import User from "../models/User.js";
import { createAuditLog } from "../services/auditService.js";



export const getAuditLogs = async(req,res)=>{
try{

const {
page=1,
limit=25,
search="",
action="",
resource="",
status="",
severity=""
}=req.query;


const filter={};


if(action)
filter.action=action;


if(resource)
filter.resource=resource;


if(status)
filter.status=status;


if(severity)
filter.severity=severity;



if(search){

filter.$or=[
{
description:{
$regex:search,
$options:"i"
}
},
{
resource:{
$regex:search,
$options:"i"
}
},
{
action:{
$regex:search,
$options:"i"
}
}
];

}



const skip =
(Number(page)-1)
*
Number(limit);



const [
logs,
total,
success,
failed,
critical
]=await Promise.all([


AuditLog.find(filter)
.populate(
"user",
"name email role"
)
.sort({
createdAt:-1
})
.skip(skip)
.limit(Number(limit)),


AuditLog.countDocuments(filter),


AuditLog.countDocuments({
status:"success"
}),


AuditLog.countDocuments({
status:"failed"
}),


AuditLog.countDocuments({
severity:"critical"
})


]);



res.json({

success:true,


statistics:{

total,
success,
failed,
critical

},


pagination:{

page:Number(page),
limit:Number(limit),
pages:Math.ceil(total/limit)

},


logs


});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};




export const getSecurityStatus = async (req,res)=>{
  try {

    const securityService = await import("../services/securityService.js");

    const data = await securityService.default.getSecurityStatus();

    await createAuditLog({
      user:req.user?._id,
      action:"view",
      resource:"Security",
      description:"Viewed security center status",
      severity:"low",
      ipAddress:req.ip,
      userAgent:req.headers["user-agent"],
      endpoint:req.originalUrl,
      method:req.method
    });

    res.json({
      success:true,
      data
    });

  } catch(error){

    res.status(500).json({
      success:false,
      message:error.message
    });

  }
};




export const getDatabaseStatus = async(req,res)=>{

try{

await createAuditLog({
user:req.user?._id,
action:"view",
resource:"Database",
description:"Viewed database status",
severity:"low",
ipAddress:req.ip,
userAgent:req.headers["user-agent"],
endpoint:req.originalUrl,
method:req.method
});

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
