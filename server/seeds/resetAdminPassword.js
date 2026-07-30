import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";


dotenv.config();


const resetPassword = async()=>{

try{

await mongoose.connect(process.env.MONGODB_URI);


const user = await User.findOne({
email:"admin@husseinmboyatours.com"
});


if(!user){

console.log("Admin not found");
process.exit();

}


user.password = "Admin@12345";

user.legacyRole="superadmin";

user.isVerified=true;

user.loginAttempts=0;

user.lockUntil=null;


await user.save();


console.log("Admin password reset successfully");


process.exit();


}catch(error){

console.log(error);

process.exit(1);

}

};


resetPassword();