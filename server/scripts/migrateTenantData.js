import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


await mongoose.connect(process.env.MONGO_URI);


const tenant =
process.argv[2];


if(!tenant){

console.log(
"Usage: node scripts/migrateTenantData.js TENANT_ID"
);

process.exit();

}


const collections =
await mongoose.connection.db
.listCollections()
.toArray();



for(const c of collections){


const col =
mongoose.connection.db.collection(c.name);


const result =
await col.updateMany(
{
tenantId:
{
$exists:false
}
},
{
$set:{
tenantId:
new mongoose.Types.ObjectId(tenant)
}
}
);


console.log(
c.name,
result.modifiedCount
);


}



await mongoose.disconnect();
