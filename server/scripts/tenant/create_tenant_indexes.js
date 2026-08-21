import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


await mongoose.connect(
process.env.MONGO_URI ||
process.env.MONGODB_URI
);


const db =
mongoose.connection.db;


const collections=[
"users",
"customers",
"bookings",
"tours",
"vehicles",
"staffs",
"payments",
"invoices",
"quotations",
"reviews"
];


for(
const c of collections
){

await db.collection(c)
.createIndex({
tenantId:1
});


console.log(
"Indexed:",
c
);

}


await mongoose.disconnect();

console.log(
"Tenant indexes complete"
);
