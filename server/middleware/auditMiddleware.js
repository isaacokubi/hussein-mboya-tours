/**
 * Purpose: audit Middleware request middleware. Main declarations: detectResource, auditMiddleware.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */

// Load ../services/auditService.js so this module can use its exported dependencies.
import {createAuditLog} from "../services/auditService.js";


// Declare detectResource for use by the surrounding module or function.
const detectResource=(url)=>{

// Declare map for use by the surrounding module or function.
const map={

auth:"Authentication",
security:"Security",
superadmin:"Super Admin",
admin:"Admin",
users:"User",
user:"User",
bookings:"Booking",
booking:"Booking",
tours:"Tour",
tour:"Tour",
destinations:"Destination",
destination:"Destination",
payments:"Payment",
payment:"Payment",
reviews:"Review",
gallery:"Gallery",
vehicles:"Vehicle",
roles:"Role",
permissions:"Permission",
settings:"Setting",
database:"Database",
system:"System",
api:"API Monitor"

};


// Repeat the enclosed work for each required iteration.
for(const key in map){

// Check the condition (url.includes(key)) and run the matching branch.
if(url.includes(key)){
// Return the expression shown below to the caller.
return map[key];
}

}


// Return a configured text value to the caller.
return "System";

};



// Declare auditMiddleware for use by the surrounding module or function.
export const auditMiddleware=(req,res,next)=>{


// Perform the side effect or state update expressed on the following line.
res.on("finish",async()=>{


// Run this operation with a dedicated error-handling path for failures.
try{


// Check the condition (!req.user) and run the matching branch.
if(!req.user)
// Return the result to the caller.
return;


// Declare action for use by the surrounding module or function.
let action="view";


// Check the condition (req.method==="POST") and run the matching branch.
if(req.method==="POST")
// Perform the side effect or state update expressed on the following line.
action="create";


// Check the condition (req.method==="PUT" || req.method==="PATCH") and run the matching branch.
if(req.method==="PUT" || req.method==="PATCH")
// Perform the side effect or state update expressed on the following line.
action="update";


// Check the condition (req.method==="DELETE") and run the matching branch.
if(req.method==="DELETE")
// Perform the side effect or state update expressed on the following line.
action="delete";


// Declare status for use by the surrounding module or function.
const status =
res.statusCode>=400
?"failed"
:"success";


// Perform the side effect or state update expressed on the following line.
await createAuditLog({

user:req.user._id,

action,

resource:
detectResource(req.originalUrl),

description:
`${req.method} ${req.originalUrl}`,

status,

severity:
res.statusCode >= 500
? "critical"
:
res.statusCode === 403
? "high"
:
res.statusCode === 401
? "medium"
:
status==="failed"
? "medium"
: "low",

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
// Handle the error raised by the preceding protected operation.
catch(error){

// Perform the side effect or state update expressed on the following line.
console.error(
"Audit middleware error:",
error.message
);

}


});


// Perform the side effect or state update expressed on the following line.
next();


};
