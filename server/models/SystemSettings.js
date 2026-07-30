import mongoose from "mongoose";

const settingsSchema =
new mongoose.Schema(
{

companyName:String,

supportEmail:String,

supportPhone:String,

websiteUrl:String,

currency:{
type:String,
default:"KES"
},

timezone:{
type:String,
default:"Africa/Nairobi"
},

maintenanceMode:{
type:Boolean,
default:false
},

allowRegistrations:{
type:Boolean,
default:true
}

},
{
timestamps:true
}
);

export default mongoose.model(
"SystemSettings",
settingsSchema
);