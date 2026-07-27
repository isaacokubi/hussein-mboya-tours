import mongoose from "mongoose";

const staffProfileSchema =
new mongoose.Schema(
{

user:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
},

department:String,

position:String,

employeeNumber:String,

hireDate:Date,

active:{
type:Boolean,
default:true
}

},
{
timestamps:true
}
);

export default mongoose.model(
"StaffProfile",
staffProfileSchema
);