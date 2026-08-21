import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


async function run(){

await mongoose.connect(process.env.MONGODB_URI);


const db = mongoose.connection.db;


console.log("Connected:", db.databaseName);



const indexes =
await db.collection("organizations").indexes();



for(const i of indexes){

if(i.key?.domain){

console.log("Dropping:",i.name);

await db.collection("organizations")
.dropIndex(i.name);

}

}



// Create MongoDB compatible partial index

await db.collection("organizations")
.createIndex(
{
domain:1
},
{
unique:true,
name:"domain_partial_unique",
partialFilterExpression:{
domain:{
$type:"string"
}
}
}
);



console.log(
"SUCCESS: domain index repaired"
);



await mongoose.disconnect();

}


run().catch(err=>{

console.error(err);

process.exit(1);

});
