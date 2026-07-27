import mongoose from "mongoose";

const mediaSchema =
new mongoose.Schema(
{

fileName:String,

url:String,

fileType:String,

size:Number,

uploadedBy:{
type:mongoose.Schema.Types.ObjectId,
ref:"User"
}

},
{
timestamps:true
}
);

export default mongoose.model(
"Media",
mediaSchema
);