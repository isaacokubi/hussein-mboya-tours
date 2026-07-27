import Tour from "../models/Tour.js";



export const createAgentTour =
async(req,res,next)=>{


try{


const images =
req.files.map(
file=>file.path
);



const tour =
await Tour.create({

...req.body,

images,


createdBy:
req.user._id,


agentCreated:true

});



res.status(201)
.json(tour);


}
catch(error){

next(error);

}

};