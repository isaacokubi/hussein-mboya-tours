import mongoose from "mongoose";


const staffSchema =
new mongoose.Schema({

name:String,


email:String,


phone:String,


position:{
type:String,
enum:[
"admin",
"tour_manager",
"guide",
"driver",
"support"
]

},


status:{
type:String,
enum:[
"active",
"inactive"
],
default:"active"
}


},{
timestamps:true
});


export default mongoose.model(
"Staff",
staffSchema
);