import mongoose from "mongoose";
const { Schema } = mongoose;
const schema = new Schema({
  tenantId:{type:Schema.Types.ObjectId,ref:"Organization",required:true,index:true},
  hotel:{type:Schema.Types.ObjectId,ref:"Hotel",required:true,index:true},
  roomType:{type:Schema.Types.ObjectId,ref:"HotelRoomType",required:true,index:true},
  name:{type:String,required:true,trim:true},
  code:{type:String,trim:true,uppercase:true},
  nightlyRate:{type:Number,min:0,required:true},
  currency:{type:String,uppercase:true,default:"KES"},
  mealPlan:{type:String,enum:["room_only","breakfast","half_board","full_board","all_inclusive"],default:"room_only"},
  minNights:{type:Number,min:1,default:1},
  maxNights:{type:Number,min:1,default:null},
  validFrom:{type:Date,default:null},
  validTo:{type:Date,default:null},
  refundable:{type:Boolean,default:true},
  cancellationPolicy:{type:String,trim:true,default:""},
  stopSell:{type:Boolean,default:false},
  status:{type:String,enum:["draft","active","inactive"],default:"active",index:true},
  createdBy:{type:Schema.Types.ObjectId,ref:"User",default:null},updatedBy:{type:Schema.Types.ObjectId,ref:"User",default:null}
},{timestamps:true});
schema.index({tenantId:1,hotel:1,roomType:1,status:1,validFrom:1,validTo:1});
export default mongoose.models.HospitalityRatePlan||mongoose.model("HospitalityRatePlan",schema);
