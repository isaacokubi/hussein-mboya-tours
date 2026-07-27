import mongoose from "mongoose";


const invoiceSchema =
new mongoose.Schema({

booking:{
type:mongoose.Schema.Types.ObjectId,
ref:"Booking"
},


invoiceNumber:String,


amount:Number,


status:{
type:String,
enum:[
"paid",
"pending"
],
default:"pending"
}


},
{
timestamps:true
});


export default mongoose.model(
"Invoice",
invoiceSchema
);