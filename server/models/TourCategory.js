import mongoose from "mongoose";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";


const tourCategorySchema = new mongoose.Schema(

{

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },

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