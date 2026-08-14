import fs from "fs";
import path from "path";
import {exec} from "child_process";
import {promisify} from "util";

const execAsync = promisify(exec);
const BACKUP_DIR = path.join(process.cwd(),"server","backups");

import mongoose from "mongoose";
import DatabaseBackup from "../models/DatabaseBackup.js";
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





export const getDatabaseStatus = async (req,res)=>{
  try{

    const mongoose = await import("mongoose");

    const state =
      mongoose.default.connection.readyState;

    res.json({
      success:true,

      database:{
        status:
          state === 1
          ? "Connected"
          : "Disconnected",

        connected:
          state === 1,

        host:
          mongoose.default.connection.host || "Unknown",

        name:
          mongoose.default.connection.name || "Unknown",

        environment:
          process.env.NODE_ENV || "production",

        checkedAt:
          new Date()
      }
    });

  }catch(error){

    console.error(
      "DATABASE STATUS ERROR",
      error
    );

    res.status(500).json({
      success:false,
      message:"Unable to read database status"
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










export const clearSystemCache = async(req,res)=>{

try{

const folders=[

path.join(process.cwd(),"cache"),

path.join(process.cwd(),"tmp"),

path.join(process.cwd(),"uploads","tmp")

];


let cleared=[];


for(const folder of folders){

if(fs.existsSync(folder)){

for(const item of fs.readdirSync(folder)){

fs.rmSync(
path.join(folder,item),
{
recursive:true,
force:true
}
);

}

cleared.push(folder);

}

}


res.json({

success:true,

message:"System cache cleared successfully",

cleared,

timestamp:new Date()

});


}
catch(error){

console.error(
" CACHE CLEAR ERROR ",
error
);

try{

await createAuditLog({

user:req.user?._id,

action:"error",

resource:"Database",

description:error.message,

status:"failed",

severity:"high"

});

}catch(e){}


res.status(500).json({

success:false,

message:error.message

});

}

};


export const createDatabaseBackup = async(req,res)=>{

try{

if (!mongoose.connection.db) {

return res.status(503).json({
success:false,
message:"Database connection unavailable"
});

}

const db =
mongoose.connection.db;

const backupDir =
path.join(
process.cwd(),
"server",
"backups"
);


if(!fs.existsSync(backupDir)){
fs.mkdirSync(
backupDir,
{
recursive:true
}
);
}


const filename =
`database-backup-${Date.now()}.json`;


const filepath =
path.join(
backupDir,
filename
);



const backupData={

createdAt:new Date(),

environment:
process.env.NODE_ENV || "production",

database:
mongoose.connection.name || "unknown",

createdBy:
req.user?.email ||
req.user?._id ||
"system"

};


console.log(
"BACKUP DB STATE:",
mongoose.connection.readyState,
mongoose.connection.name
);


console.log("BACKUP DATABASE:", mongoose.connection.name);
console.log("MONGO STATE:", mongoose.connection.readyState);

const collections =
await db.listCollections().toArray();

console.log(
"COLLECTION COUNT:",
collections.length
);


console.log(
"FOUND COLLECTIONS:",
collections
);


const collectionNames =
collections.map(
collection => collection.name
);


for(const collection of collections){

const name = collection.name;


backupData[name] =
await db
.collection(name)
.find({})
.toArray();

}



fs.writeFileSync(
filepath,
JSON.stringify(
backupData,
null,
2
)
);



const savedBackup = await DatabaseBackup.create({

file:filename,

size:
(fs.statSync(filepath).size / 1024 / 1024).toFixed(2)+" MB",

collections:
collectionNames,

databaseName:
mongoose.connection.name || "unknown",

environment:
process.env.NODE_ENV || "production",

createdBy:
req.user?.email ||
req.user?._id ||
"system"

});

console.log("SAVED BACKUP RECORD:", savedBackup);


await createAuditLog({

user:req.user?._id,

action:"create",

resource:"Database",

description:
`Database backup created: ${filename}`,

status:"success",

severity:"low"

});


res.json({

success:true,

message:
"Database backup created successfully",

file:filename

});


}
catch(error){

console.error(
"BACKUP ERROR DETAILS:",
error.message,
error.stack
);


res.status(500).json({

success:false,

message:error.message

});

}

};




export const listDatabaseBackups = async(req,res)=>{

try{

const backups =
await DatabaseBackup.find()
.sort({
createdAt:-1
})
.lean();


res.json({

success:true,

backups

});


}
catch(error){

console.error(
"LIST BACKUPS ERROR",
error
);

try{

await createAuditLog({

user:req.user?._id,

action:"error",

resource:"Database",

description:error.message,

status:"failed",

severity:"high"

});

}catch(e){}


res.status(500).json({

success:false,

message:error.message

});

}

};





export const downloadDatabaseBackup = async(req,res)=>{

try{

const backup =
await DatabaseBackup.findById(
req.params.id
);

if(!backup){

return res.status(404).json({
success:false,
message:"Backup not found"
});

}


const filepath =
path.join(
process.cwd(),
"server",
"backups",
backup.file
);


if(!fs.existsSync(filepath)){

return res.status(404).json({
success:false,
message:"Backup file missing"
});

}


res.download(filepath);

}
catch(error){

await createAuditLog({
user:req.user?._id,
action:"error",
resource:"Database",
description:error.message,
status:"failed",
severity:"high"
});

res.status(500).json({
success:false,
message:error.message
});

}

};






export const deleteDatabaseBackup = async(req,res)=>{

try{

const backup =
await DatabaseBackup.findById(
req.params.id
);


if(!backup){

return res.status(404).json({
success:false,
message:"Backup not found"
});

}


const filepath =
path.join(
process.cwd(),
"server",
"backups",
backup.file
);


if(fs.existsSync(filepath)){

fs.rmSync(filepath);

}


await DatabaseBackup.findByIdAndDelete(
req.params.id
);


res.json({

success:true,

message:"Backup deleted successfully"

});


}
catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};


