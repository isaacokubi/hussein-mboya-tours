import Itinerary from "../models/Itinerary.js";



export const createItinerary =
async(req,res)=>{


try{


const itinerary =
await Itinerary.create({

...req.body,

createdBy:req.user._id

});


res.status(201)
.json(itinerary);


}

catch(error){

res.status(500)
.json({

message:error.message

});

}


};





export const getItineraries =
async(req,res)=>{


const data =
await Itinerary.find()
.populate("tour");


res.json(data);


};