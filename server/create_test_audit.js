import mongoose from "mongoose";
import dotenv from "dotenv";
import AuditLog from "./models/AuditLog.js";

dotenv.config({
  path:"./.env"
});

const mongo =
process.env.MONGODB_URI ||
process.env.MONGO_URI;

if (!mongo) {
  console.error("MongoDB connection string missing");
  process.exit(1);
}

try {

await mongoose.connect(mongo);

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

// debug removed

await mongoose.disconnect();

process.exit(0);

} catch(error){

console.error("Audit creation failed:");
console.error(error.message);

process.exit(1);

}
