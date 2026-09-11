import mongoose from "mongoose";
const { Schema } = mongoose;
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
schema.index({tenantId:1,roomType:1,startDate:1,endDate:1,status:1});
export default mongoose.models.HospitalityRoomBlock||mongoose.model("HospitalityRoomBlock",schema);
