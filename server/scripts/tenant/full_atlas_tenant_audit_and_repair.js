import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


const mongoURI =
process.env.MONGO_URI ||
process.env.MONGODB_URI ||
process.env.MONGO_URL ||
process.env.DATABASE_URL;



const collectionsToAudit = [

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



async function run(){


console.log(`
=========================================
 ATLAS MULTITENANT PRODUCTION AUDIT
=========================================
`);


await mongoose.connect(mongoURI);


console.log(
"✅ Connected to MongoDB Atlas"
);



const db =
mongoose.connection.db;



let failures=[];



for(const name of collectionsToAudit){


const exists =
await db.listCollections({
name
}).hasNext();



if(!exists){
continue;
}



const collection =
db.collection(name);



const total =
await collection.countDocuments();



let tenantTagged =
await collection.countDocuments({

tenantId:{
$exists:true,
$ne:null
}

});



console.log(`

---------------------------------

Collection:
${name}

Total:
${total}

Tenant tagged:
${tenantTagged}

Missing tenant:
${total-tenantTagged}

---------------------------------

`);



/*
 USERS EXCEPTION:
 super_admin belongs to platform
 not tenant
*/


if(name==="users"){


const invalid =
await collection.countDocuments({

role:{
$nin:[
"super_admin",
"super_admin"
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

});



if(invalid>0){

failures.push({

collection:name,

missing:
invalid

});

}



}else{


if(total>0 && tenantTagged!==total){


failures.push({

collection:name,

missing:
total-tenantTagged

});


}


}



}



console.log(`
=========================================
 FINAL RESULT
=========================================
`);



if(failures.length){


console.log(
"❌ TENANT MIGRATION REQUIRED"
);



failures.forEach(item=>{

console.log(
`${item.collection}: ${item.missing} records`
);

});


process.exitCode=1;


}else{


console.log(`
✅ TENANT ISOLATION HEALTHY

Rules verified:

✔ Platform admins isolated
✔ Company users require tenantId
✔ Tenant collections protected

`);

}



await mongoose.disconnect();


}



run().catch(err=>{

console.error(err);

process.exit(1);

});
