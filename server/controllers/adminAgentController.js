import {mergeTenantFilter} from "../tenancy/secureQuery.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import Agent from "../models/Agent.js";
import User from "../models/User.js";



/*
|--------------------------------------------------------------------------
| GET ALL AGENTS
|--------------------------------------------------------------------------
*/

export const getAgents = async (req,res)=>{

try{

const agents = await Agent.find(tenantFilter(req))
.populate(
"user",
"name email phone role"
)
.sort({
createdAt:-1
});


res.json({

success:true,

data:agents

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};




/*
|--------------------------------------------------------------------------
| GET SINGLE AGENT
|--------------------------------------------------------------------------
*/

export const getAgentById = async(req,res)=>{

try{


const agent = await Agent.findById(req.params.id)
.populate(
"user",
"name email phone role"
);


if(!agent){

return res.status(404).json({

success:false,

message:"Agent not found"

});

}



res.json({

success:true,

data:agent

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};




/*
|--------------------------------------------------------------------------
| APPROVE AGENT
|--------------------------------------------------------------------------
*/

export const approveAgent = async(req,res)=>{

try{


const agent = await Agent.findById(
req.params.id
);



if(!agent){

return res.status(404).json({

success:false,

message:"Agent not found"

});

}



agent.isApproved = true;

agent.status = "active";

agent.approvedBy = req.user._id;

agent.approvedAt = new Date();


await agent.save();



res.json({

success:true,

message:"Agent approved successfully",

data:agent

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};





/*
|--------------------------------------------------------------------------
| UPDATE AGENT STATUS
|--------------------------------------------------------------------------
*/

export const updateAgentStatus = async(req,res)=>{

try{


const {
status
}=req.body;



const allowedStatuses=[

"active",

"inactive",

"suspended"

];



if(!allowedStatuses.includes(status)){

return res.status(400).json({

success:false,

message:"Invalid agent status"

});

}



const agent =
await Agent.findByIdAndUpdate(

req.params.id,

{
status
},

{
new:true
}

);



if(!agent){

return res.status(404).json({

success:false,

message:"Agent not found"

});

}



res.json({

success:true,

message:"Agent status updated",

data:agent

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
