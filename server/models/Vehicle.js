import mongoose from "mongoose";


const vehicleSchema =
new mongoose.Schema({

name:String,

registration:String,

type:{
type:String,
enum:[
"SUV",
"BUS",
"VAN"
]
},


capacity:Number,


driver:String,


status:{
type:String,
enum:[
"Available",
"Assigned",
"Maintenance"
],
default:"Available"
}


});


export default mongoose.model(
"Vehicle",
vehicleSchema
);