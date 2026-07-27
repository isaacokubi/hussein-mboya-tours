import User from "../models/User.js";


export const agentMiddleware =
async(req,res,next)=>{


const user =
await User.findById(
req.user._id
);



if(
!user ||
user.role !== "travel_agent"
){

return res.status(403)
.json({

message:
"Agent access required"

});

}


if(
!user.agentProfile.approved
){

return res.status(403)
.json({

message:
"Agent account pending approval"

});

}



next();


};