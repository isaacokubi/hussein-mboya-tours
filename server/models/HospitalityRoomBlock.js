/**
 * Purpose: Hospitality Room Block database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Declare { Schema } for use by the surrounding module or function.
const { Schema } = mongoose;
// Declare schema for use by the surrounding module or function.
const schema = new Schema({
  tenantId:{type:Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
  hotel:{type:Schema.Types.ObjectId,ref:"Hotel",required:true,index:true},
  roomType:{type:Schema.Types.ObjectId,ref:"HotelRoomType",required:true,index:true},
  startDate:{type:Date,required:true,index:true},
  endDate:{type:Date,required:true,index:true},
  quantity:{type:Number,min:1,required:true},
  reason:{type:String,trim:true,default:"Maintenance"},
  status:{type:String,enum:["blocked","released"],default:"blocked",index:true},
  createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},
  updatedBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true});
// Perform the side effect or state update expressed on the following line.
schema.index({tenantId:1,roomType:1,startDate:1,endDate:1,status:1});
// Perform the side effect or state update expressed on the following line.
schema.plugin(tenantPlugin);

export default mongoose.models.HospitalityRoomBlock||mongoose.model("HospitalityRoomBlock",schema);
