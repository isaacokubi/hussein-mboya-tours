import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "./models/User.js";
import { runWithTenant } from "./tenancy/context.js";


dotenv.config();


await mongoose.connect(process.env.MONGODB_URI);



console.log("\nSUPERADMIN TEST");


await runWithTenant(
{
role:"super_admin",
bypass:true
},
async()=>{

const users=await User.find({});

console.log(
users.map(u=>u.email)
);


});



console.log("\nCOMPANY TEST");


await runWithTenant(
{
tenantId:"6a8848720c81f71974fa7710",
role:"admin"
},
async()=>{


const users=await User.find({});

console.log(
users.map(u=>u.email)
);


});


await mongoose.disconnect();
