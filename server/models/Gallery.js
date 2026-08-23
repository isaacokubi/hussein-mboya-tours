import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";


const gallerySchema = new mongoose.Schema(

{
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },

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










export default gallerySchema.plugin(tenantPlugin);

mongoose.model(
"Gallery",
gallerySchema
);
