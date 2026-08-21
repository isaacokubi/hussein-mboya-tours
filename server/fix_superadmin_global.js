import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);


console.log("\n==============================");
console.log("MAKE SUPERADMIN GLOBAL");
console.log("==============================");


const admins = await User.find({
 role:"super_admin"
});


console.log(
"SuperAdmins found:",
admins.length
);


for(const admin of admins){

console.log("\nUpdating:");
console.log({
 email:admin.email,
 oldTenant:admin.tenantId
});


admin.tenantId = null;

await admin.save();


console.log("UPDATED:",admin.email);

}


await mongoose.disconnect();


console.log("\n✅ SUPERADMIN NOW GLOBAL");

