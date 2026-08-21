import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import Organization from "./models/Organization.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);


console.log("\n==============================");
console.log("REPAIR TENANT ASSIGNMENT");
console.log("==============================");


const tenant = await Organization.findOne({
 slug:"isolation-a-1787316338681-scz3kr"
});


if(!tenant){

 console.log("❌ Isolation tenant not found");
 process.exit(1);

}


const user = await User.findOne({
 email:"admin@safariadventures.co.ke"
});


if(!user){

 console.log("❌ Safari admin not found");
 process.exit(1);

}


console.log("\nBEFORE");

console.log({
 email:user.email,
 tenant:user.tenantId
});


user.tenantId = tenant._id;

await user.save();


console.log("\nAFTER");

console.log({
 email:user.email,
 tenant:user.tenantId
});


await mongoose.disconnect();


console.log("\n✅ Tenant assignment repaired");

