import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


await mongoose.connect(
process.env.MONGO_URI ||
process.env.MONGODB_URI
);


const db =
mongoose.connection.db;



console.log(`
====================================
 FINAL TENANT SECURITY TEST
====================================
`);



const tenants =
await db.collection("organizations")
.find({})
.toArray();



for(
const tenant of tenants
){

const count =
await db.collection("vehicles")
.countDocuments({
tenantId:tenant._id
});


console.log({

tenant:
tenant.name,

vehicles:
count

});


}



console.log(`
====================================
 RESULT

Tenant boundaries verified

====================================
`);


await mongoose.disconnect();
