import mongoose from "mongoose";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
const schema=new mongoose.Schema({

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },customer:{type:mongoose.Schema.Types.ObjectId,ref:"User",required:true,index:true},destination:{type:String,required:true,trim:true},durationDays:{type:Number,required:true,min:1},people:{type:Number,required:true,min:1},startDate:{type:Date,default:null},budget:{type:Number,default:0,min:0},requirements:{type:String,default:""},status:{type:String,enum:["pending","approved","quoted","rejected","converted"],default:"pending",index:true},quotedAmount:{type:Number,default:0,min:0},adminNotes:{type:String,default:""},assignedGuide:{type:mongoose.Schema.Types.ObjectId,ref:"Staff",default:null},assignedDriver:{type:mongoose.Schema.Types.ObjectId,ref:"Staff",default:null},assignedAgent:{type:mongoose.Schema.Types.ObjectId,ref:"Agent",default:null},

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

schema.plugin(tenantPlugin);
schema.plugin(tenantAggregationPlugin);
schema.index({customer:1,createdAt:-1});





export default mongoose.model("CustomTourRequest",schema);
