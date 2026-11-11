/**
 * Purpose: Accommodation Inventory database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Declare { Schema } for use by the surrounding module or function.
const { Schema } = mongoose;
// Declare AccommodationInventorySchema for use by the surrounding module or function.
const AccommodationInventorySchema = new Schema({
  tenantId:{type:Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
  propertyName:{type:String,required:true,trim:true,maxlength:180},
  location:{type:String,trim:true,maxlength:180},
  roomType:{type:String,required:true,trim:true,maxlength:120},
  totalRooms:{type:Number,min:0,required:true},
  availableRooms:{type:Number,min:0,required:true},
  nightlyRate:{type:Number,min:0,default:0},
  currency:{type:String,default:"KES",uppercase:true},
  status:{type:String,enum:["active","inactive"],default:"active"},
  notes:{type:String,trim:true,maxlength:2000},
  createdBy:{type:Schema.Types.ObjectId,ref:"User"},
  updatedBy:{type:Schema.Types.ObjectId,ref:"User"},
},{timestamps:true});
// Perform the side effect or state update expressed on the following line.
AccommodationInventorySchema.index({tenantId:1,propertyName:1,roomType:1},{unique:true});
// Perform the side effect or state update expressed on the following line.
AccommodationInventorySchema.plugin(tenantPlugin);

export default mongoose.models.AccommodationInventory || mongoose.model("AccommodationInventory",AccommodationInventorySchema);
