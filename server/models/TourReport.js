import mongoose from "mongoose";


const tourReportSchema = new mongoose.Schema(

{


tour:{

type:mongoose.Schema.Types.ObjectId,

ref:"Tour",

required:true

},



guide:{

type:mongoose.Schema.Types.ObjectId,

ref:"Staff",

required:true

},



summary:{

type:String,

required:true

},



issues:[

String

],



customerFeedback:[

String

],



images:[

{

url:String,

publicId:String

}

],



completedAt:{

type:Date,

default:Date.now

}



},

{

timestamps:true

}

);



export default mongoose.model(

"TourReport",

tourReportSchema

);