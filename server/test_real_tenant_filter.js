import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "./models/User.js";
import {runWithTenant} from "./tenancy/context.js";


dotenv.config();


await mongoose.connect(process.env.MONGODB_URI);



console.log("\n==============================");
console.log("SUPER ADMIN TEST");
console.log("==============================");


await runWithTenant(
{
role:"super_admin"
},
async()=>{

const users =
await User.find({});


console.log(
users.map(u=>({
email:u.email,
tenant:u.tenantId
}))
);


});





console.log("\n==============================");
console.log("COMPANY ADMIN TEST");
console.log("==============================");


await runWithTenant(
{
tenantId:"6a8848720c81f71974fa7710",
role:"admin"
},
async()=>{


const users =
await User.find({});


console.log(
users.map(u=>({
email:u.email,
tenant:u.tenantId
}))
);


});


await mongoose.disconnect();

console.log("\nTEST COMPLETE");
