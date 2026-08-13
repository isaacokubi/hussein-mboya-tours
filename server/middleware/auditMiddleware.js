
import { createAuditLog } from "../services/auditService.js";


export const auditMiddleware = (req,res,next)=>{

const start = Date.now();


res.on("finish", async()=>{

try{

if(!req.user) return;


let action="view";


if(req.method==="POST")
action="create";

if(req.method==="PUT" || req.method==="PATCH")
action="update";

if(req.method==="DELETE")
action="delete";


await createAuditLog({

user:req.user._id,

action,

resource:"System",

description:
`${req.method} ${req.originalUrl}`,

status:
res.statusCode >= 400
?
"failed"
:
"success",

severity:
res.statusCode >=400
?
"high"
:
"low",

ipAddress:req.ip,

userAgent:
req.headers["user-agent"],

method:req.method,

endpoint:req.originalUrl,

metadata:{
statusCode:res.statusCode,
responseTime:
Date.now()-start
}

});


}catch(error){

console.error(
"Audit middleware error:",
error.message
);

}

});


next();

};
