import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


const mongoURI =
process.env.MONGO_URI ||
process.env.MONGODB_URI;


async function run(){

await mongoose.connect(mongoURI);


const db = mongoose.connection.db;


const organization =
await db.collection("organizations")
.findOne({
slug: process.env.DEFAULT_TENANT_SLUG || "hussein-mboya-tours"
});


if(!organization){

throw new Error(
"No default organization found"
);

}


console.log(
"Using tenant:",
organization.name
);


const result =
await db.collection("users")
.updateMany(

{
role:{
$nin:[
"super_admin",
"superadmin"
]
},

$or:[
{
tenantId:null
},
{
tenantId:{
$exists:false
}
}
]

},

{
$set:{
tenantId:organization._id
}
}

);


console.log(`
================================

Updated users:
${result.modifiedCount}

Super admins excluded:
YES

================================
`);


await mongoose.disconnect();

}


run().catch(err=>{

console.error(err);
process.exit(1);

});
