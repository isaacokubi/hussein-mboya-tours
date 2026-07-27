import {
  generateTravelAdvice
} from "../services/aiService.js";



export const askAI =
async(req,res)=>{


try{


const {
message
}=req.body;



if(!message){

return res.status(400).json({

success:false,

message:"Message required"

});

}



const reply =
await generateTravelAdvice(message);



return res.status(200).json({

success:true,

reply

});



}catch(error){


console.error(
"AI CONTROLLER ERROR:",
error
);


return res.status(500).json({

success:false,

message:error.message

});


}


};