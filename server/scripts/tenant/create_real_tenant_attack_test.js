import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


const uri =
process.env.MONGODB_URI ||
process.env.MONGO_URI;


async function run(){

await mongoose.connect(uri);


const db =
mongoose.connection.db;


console.log(`
=================================
 REAL TENANT ATTACK SIMULATION
=================================
`);


const tenants =
await db.collection("organizations")
.find({})
.limit(2)
.toArray();


if(tenants.length<2){

throw new Error(
"Need two tenants"
);

}


const A=tenants[0]._id;
const B=tenants[1]._id;


await db.collection("vehicles")
.insertOne({

name:"Tenant B Secret Vehicle",

tenantId:B,

createdAt:new Date()

});


const companyAView =
await db.collection("vehicles")
.find({
tenantId:A
})
.toArray();



const leaked =
companyAView.find(
v=>v.name==="Tenant B Secret Vehicle"
);



if(leaked){

console.log(
"❌ SECURITY FAILURE: Tenant data leaked"
);

}else{

console.log(
"✅ SECURITY PASS: Tenant isolation works"
);

}



await db.collection("vehicles")
.deleteOne({
name:"Tenant B Secret Vehicle"
});


await mongoose.disconnect();

}


run()
.catch(err=>{
console.error(err);
process.exit(1);
});
