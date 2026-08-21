import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


async function run(){

await mongoose.connect(process.env.MONGODB_URI);


const db=mongoose.connection.db;


const tenant =
await db.collection("organizations")
.findOne();


if(!tenant){

throw new Error("No organization found");

}



const collections=[

"agents",
"bookings",
"commissions",
"coupons",
"customers",
"destinations",
"galleries",
"heroslides",
"invoices",
"itineraries",
"notifications",
"payments",
"quotations",
"refunds",
"reviews",
"staffs",
"tours",
"vehicles",
"wallettransactions",
"wishlists"

];



for(const c of collections){

try{

const result =
await db.collection(c)
.updateMany(
{
tenantId:{
$exists:false
}
},
{
$set:{
tenantId:tenant._id
}
}
);


console.log(
c,
result.modifiedCount
);


}catch(e){

console.log(
"Skipped:",
c
);

}

}


await mongoose.disconnect();

}


run();
