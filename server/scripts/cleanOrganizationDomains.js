import { backgroundTenantFilter } from "../tenancy/backgroundTenantFilter.js";
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


async function run(){

await mongoose.connect(process.env.MONGODB_URI);


const result = await mongoose.connection.db
.collection("organizations")
.updateMany(
{
domain:null
},
{
$unset:{
domain:""
}
}
);


console.log(
"Removed null domains:",
result.modifiedCount
);


await mongoose.disconnect();

}


run();
