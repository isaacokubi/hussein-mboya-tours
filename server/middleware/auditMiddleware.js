
import {createAuditLog} from "../services/auditService.js";


const detectResource=(url)=>{

const map={

users:"User",
bookings:"Booking",
booking:"Booking",
tours:"Tour",
destinations:"Destination",
payments:"Payment",
reviews:"Review",
gallery:"Gallery",
vehicles:"Vehicle",
roles:"Role",
permissions:"Permission",
settings:"Setting"

};


for(const key in map){

if(url.includes(key)){
return map[key];
}

}


return "System";

};



export const auditMiddleware=(req,res,next)=>{


res.on("finish",async()=>{


try{


if(!req.user)
return;


let action="view";


if(req.method==="POST")
action="create";


if(req.method==="PUT" || req.method==="PATCH")
action="update";


if(req.method==="DELETE")
action="delete";


const status =
res.statusCode>=400
?"failed"
:"success";


await createAuditLog({

user:req.user._id,

action,

resource:
detectResource(req.originalUrl),

description:
`${req.method} ${req.originalUrl}`,

status,

severity:
status==="failed"
?"high"
:"low",

ipAddress:req.ip,

userAgent:
req.headers["user-agent"],

method:req.method,

endpoint:req.originalUrl,

metadata:{
statusCode:res.statusCode
}

});


}
catch(error){

console.error(
"Audit middleware error:",
error.message
);

}


});


next();


};
