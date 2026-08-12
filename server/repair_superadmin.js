
import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "./models/User.js";

dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const user = await User.findOne({
 email:"superadmin@coherenttours.com"
}).select("+password");

if(!user){
 throw new Error("superadmin missing");
}

user.password = "ChangeMe@12345";
user.role = "super_admin";

user.status="active";
user.isActive=true;
user.isVerified=true;

user.loginAttempts=0;
user.lockUntil=null;

await user.save();

console.log({
 email:user.email,
 role:user.role,
 status:user.status,
 verified:user.isVerified
});

await mongoose.disconnect();
