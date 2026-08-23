import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const mongoURI =
process.env.MONGO_URI ||
process.env.MONGODB_URI ||
process.env.MONGO_URL ||
process.env.DATABASE_URL;


async function run(){

console.log(`
=========================================
 SUPER ADMIN TENANT EXCEPTION FIX
=========================================
`);


await mongoose.connect(mongoURI);


const db = mongoose.connection.db;


const users = db.collection("users");


const superAdmins =
await users.find({

role:{
$in:[
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

})
.toArray();


console.log(
`Valid platform super admins found: ${superAdmins.length}`
);


superAdmins.forEach(user=>{

console.log({

name:user.name,
email:user.email,
role:user.role,
tenantId:user.tenantId || "PLATFORM"

});

});


console.log(`

=========================================
 RESULT
=========================================

Platform administrators are allowed
without tenantId.

Tenant enforcement applies to:

- admins
- managers
- agents
- guides
- drivers
- customers

=========================================

`);


await mongoose.disconnect();

}


run().catch(err=>{

console.error(err);
process.exit(1);

});
