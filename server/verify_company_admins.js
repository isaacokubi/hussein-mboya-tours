import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import Organization from "./models/Organization.js";


dotenv.config();


await mongoose.connect(process.env.MONGODB_URI);


const users =
await User.find({})
.populate("tenantId");


console.log("\n==============================");
console.log("COMPANY USER MAP");
console.log("==============================");


users.forEach(u=>{


console.log({

email:u.email,

role:u.role,

tenant:
u.tenantId?.name || "GLOBAL SUPERADMIN"

});


});


await mongoose.disconnect();

