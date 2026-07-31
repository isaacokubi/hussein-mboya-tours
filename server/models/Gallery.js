import mongoose from "mongoose";


const gallerySchema = new mongoose.Schema(

{

title:{

type:String,

required:true,

trim:true

},


image:{

url:String,

publicId:String

},


category:{

type:String,

enum:[

"Safari",

"Beach",

"Culture",

"Adventure",

"Vehicle"

],

default:"Safari"

},


featured:{

type:Boolean,

default:false

},


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
"Gallery",
gallerySchema
);