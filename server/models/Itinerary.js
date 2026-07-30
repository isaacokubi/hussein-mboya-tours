import mongoose from "mongoose";


const itinerarySchema =
new mongoose.Schema({

tour:{
type:mongoose.Schema.Types.ObjectId,
ref:"Tour"
},


days:[

{

title:String,

time:String,

description:String

}

],


createdBy:{

type:mongoose.Schema.Types.ObjectId,
ref:"User"

}


},

{
timestamps:true
});


export default mongoose.model(
"Itinerary",
itinerarySchema
);