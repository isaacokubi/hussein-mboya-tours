import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";

dotenv.config();

const mongo =
process.env.MONGODB_URI ||
process.env.MONGO_URI;

if(!mongo){
 console.error("❌ MongoDB URI missing");
 process.exit(1);
}

console.log("==============================");
console.log("TENANT ISOLATION TEST");
console.log("==============================");

try{

await mongoose.connect(mongo);

console.log("✅ MongoDB connected");

const users = await User.find({});

console.log("\nUsers visible:", users.length);

users.forEach(user=>{

console.log({
 id:user._id.toString(),
 tenantId:user.tenantId || "NO TENANT",
 email:user.email,
 role:user.role
});

});


await mongoose.disconnect();

console.log("\n✅ TEST COMPLETE");

}
catch(error){

console.error(
"❌ TEST FAILED:",
error.message
);

process.exit(1);

}

