import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";


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



export default tourCategorySchema.plugin(tenantPlugin);

mongoose.model(
"TourCategory",
tourCategorySchema
);