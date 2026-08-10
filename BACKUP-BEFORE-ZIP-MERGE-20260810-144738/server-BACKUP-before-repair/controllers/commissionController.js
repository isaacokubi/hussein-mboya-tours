import Commission from "../models/Commission.js";



/*
|--------------------------------------------------------------------------
| GET ALL COMMISSIONS
|--------------------------------------------------------------------------
*/

export const getCommissions = async(req,res)=>{

try{


const commissions =
await Commission.find()

.populate({
path:"agent",
populate:{
path:"user",
select:"name email"
}
})

.populate(
"booking"
)

.sort({
createdAt:-1
});



res.json({

success:true,

data:commissions

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
| GET AGENT COMMISSIONS
|--------------------------------------------------------------------------
*/

export const getAgentCommissions = async(req,res)=>{

try{


const commissions =
await Commission.find({

agent:req.params.agentId

})

.populate("booking")

.sort({
createdAt:-1
});



res.json({

success:true,

data:commissions

});


}catch(error){

res.status(500).json({

success:false,

message:error.message

});

}

};
