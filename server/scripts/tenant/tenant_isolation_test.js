import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";


const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);


dotenv.config({
    path:path.resolve(__dirname,"../../.env")
});


console.log(`
=====================================
TENANT ISOLATION REGRESSION TEST
=====================================
`);



const mongo =
process.env.MONGODB_URI ||
process.env.MONGO_URI ||
process.env.DATABASE_URL;



async function run(){


if(!mongo){

console.error(`
❌ DATABASE URI NOT FOUND

Expected:
MONGODB_URI

`);

process.exit(1);

}



try{


await mongoose.connect(mongo);


console.log("✓ MongoDB connected");

console.log(
"Database:",
mongoose.connection.name
);



const collections =
await mongoose.connection.db
.listCollections()
.toArray();



let tenantCollections=0;
let totalTenantDocuments=0;



for(const collection of collections){


const name=collection.name;



const count =
await mongoose.connection.db
.collection(name)
.countDocuments({
tenantId:{
$exists:true
}
});



if(count>0){

tenantCollections++;

totalTenantDocuments += count;


console.log(
`✓ ${name}: ${count} tenant records`
);

}


}



console.log(`
=====================================
ISOLATION CHECK COMPLETE
=====================================

Tenant collections:
${tenantCollections}

Tenant documents:
${totalTenantDocuments}

=====================================
`);



await mongoose.disconnect();


}

catch(err){

console.error(
"❌ Database isolation test failed:"
);

console.error(err.message);

process.exit(1);

}


}



run();
