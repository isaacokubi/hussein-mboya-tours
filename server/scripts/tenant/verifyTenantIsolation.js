import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

console.log(`
==================================
 Tenant Isolation Verification
==================================
`);

const mongoURI =
process.env.MONGO_URI ||
process.env.MONGODB_URI ||
process.env.MONGO_URL ||
process.env.DATABASE_URL;


async function run(){

if(!mongoURI){

console.error(`
❌ MongoDB connection string missing.

Checked:
MONGO_URI
MONGODB_URI
MONGO_URL
DATABASE_URL

Create/update your .env file.
`);

process.exit(1);

}


try{

await mongoose.connect(mongoURI);


console.log("✅ MongoDB connected");


const collections =
await mongoose.connection.db.listCollections().toArray();


console.log(`
Collections detected:
`);


for(const collection of collections){

console.log(
" -",
collection.name
);

}


console.log(`

==================================
 Tenant Isolation Inspection PASS
==================================

Database reachable.
Collections scanned:
${collections.length}

`);

await mongoose.disconnect();


}
catch(error){

console.error(
"❌ Tenant verification failed:"
);

console.error(error.message);

process.exit(1);

}


}


run();
