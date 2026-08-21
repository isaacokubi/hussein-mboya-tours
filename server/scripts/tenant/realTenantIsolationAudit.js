import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


const mongoURI =
process.env.MONGO_URI ||
process.env.MONGODB_URI ||
process.env.MONGO_URL ||
process.env.DATABASE_URL;


console.log(`
========================================
 REAL TENANT DATABASE ISOLATION AUDIT
========================================
`);


async function run(){

await mongoose.connect(mongoURI);


const db = mongoose.connection.db;


const tenantCollections = [

"users",
"customers",
"customerprofiles",
"bookings",
"tours",
"vehicles",
"staffs",
"staffprofiles",
"agents",
"quotations",
"invoices",
"payments",
"reviews"

];


let failures = [];


for(const collectionName of tenantCollections){

const exists =
await db.listCollections({
name:collectionName
}).hasNext();


if(!exists){

console.log(
"SKIP missing:",
collectionName
);

continue;

}


const collection =
db.collection(collectionName);



const total =
await collection.countDocuments();



const tenantCount =
await collection.countDocuments({
tenant:{
$exists:true
}
});


console.log(`
Collection:
${collectionName}

Total:
${total}

Tenant tagged:
${tenantCount}
`);



if(total > 0 && tenantCount === 0){

failures.push(collectionName);

}

}



console.log(`
========================================
 AUDIT RESULT
========================================
`);


if(failures.length){

console.log(
"❌ COLLECTIONS WITHOUT TENANT ISOLATION:"
);

failures.forEach(x=>console.log("-",x));


process.exitCode=1;


}else{


console.log(
"✅ ALL CHECKED COLLECTIONS HAVE TENANT CONTEXT"
);


}



await mongoose.disconnect();


}


run().catch(err=>{

console.error(err);

process.exit(1);

});
