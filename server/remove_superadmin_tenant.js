import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();


await mongoose.connect(process.env.MONGODB_URI);


const admin =
await User.findOne({
email:"admin@husseinmboyatours.test"
});


if(!admin){

console.log("Superadmin not found");
process.exit();

}


admin.tenantId=null;


admin.role="super_admin";


await admin.save();


console.log(
"SuperAdmin tenant removed"
);


await mongoose.disconnect();

