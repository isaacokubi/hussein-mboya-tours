import mongoose from "mongoose";


const tourCategorySchema = new mongoose.Schema(

{

name:{

type:String,

required:true,

trim:true

},


slug:{

type:String,

required:true,

unique:true,

lowercase:true

},


icon:{

type:String,

default:"Map"

},


description:{

type:String,

required:true

},


image:{

type:String,

default:""

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
"TourCategory",
tourCategorySchema
);