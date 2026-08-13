import mongoose from "mongoose";
import dotenv from "dotenv";
import AuditLog from "./server/models/AuditLog.js";

dotenv.config({
 path:"./server/.env"
});

await mongoose.connect(process.env.MONGO_URI);

await AuditLog.create({
 action:"login",
 resource:"System",
 description:"Super administrator logged into Coherent Tours",
 status:"success",
 severity:"medium",
 metadata:{
   source:"initial_security_setup"
 }
});

console.log("Test audit created");

await mongoose.disconnect();
