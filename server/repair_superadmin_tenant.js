import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);


const superAdmin = await User.findOne({
 email:"admin@husseinmboyatours.test"
});


if(!superAdmin){

console.log("Super admin not found");
process.exit(1);

}


console.log("BEFORE:");
console.log({
email:superAdmin.email,
tenantId:superAdmin.tenantId,
role:superAdmin.role
});


superAdmin.tenantId = null;

await superAdmin.save();


console.log("\nAFTER:");
console.log({
email:superAdmin.email,
tenantId:superAdmin.tenantId,
role:superAdmin.role
});


await mongoose.disconnect();

