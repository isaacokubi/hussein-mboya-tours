/**
 * Purpose: Custom Tour Request database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Declare schema for use by the surrounding module or function.
const schema=new mongoose.Schema({

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },customer:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:false,index:true},
user:{type:mongoose.Schema.Types.ObjectId,ref:"User",default:null,index:true},
guestContact:{
  name:{type:String,default:"",trim:true,maxlength:120},
  email:{type:String,default:"",trim:true,lowercase:true,maxlength:180},
  phone:{type:String,default:"",trim:true,maxlength:30}
},destination:{type:String,required:true,trim:true},durationDays:{type:Number,required:true,min:1},people:{type:Number,required:true,min:1},startDate:{type:Date,default:null},budget:{type:Number,default:0,min:0},requirements:{type:String,default:""},status:{type:String,enum:["pending","approved","quoted","rejected","converted"],default:"pending",index:true},quotedAmount:{type:Number,default:0,min:0},adminNotes:{type:String,default:""},assignedGuide:{type:mongoose.Schema.Types.ObjectId,ref:"Staff",default:null},assignedDriver:{type:mongoose.Schema.Types.ObjectId,ref:"Staff",default:null},assignedAgent:{type:mongoose.Schema.Types.ObjectId,ref:"Agent",default:null},

pickupLocation:{type:String,default:""},
pickupDate:{type:Date,default:null},
pickupTime:{type:String,default:""},

adults:{type:Number,default:1,min:1},
children:{type:Number,default:0,min:0},

accommodationPreference:{type:String,default:""},
mealPreference:{type:String,default:""},
transportPreference:{type:String,default:""},

emergencyContact:{type:String,default:""},
specialRequests:{type:String,default:""},

bookingId:{type:mongoose.Schema.Types.ObjectId,ref:"Booking",default:null},
paymentId:{type:mongoose.Schema.Types.ObjectId,default:null}},{timestamps:true});

// Perform the side effect or state update expressed on the following line.
schema.plugin(tenantPlugin);
// Perform the side effect or state update expressed on the following line.
schema.plugin(tenantAggregationPlugin);
// Perform the side effect or state update expressed on the following line.
schema.index({customer:1,createdAt:-1});





export default mongoose.model("CustomTourRequest",schema);
