import mongoose from "mongoose";
import dotenv from "dotenv";
import Organization from "../models/Organization.js";

dotenv.config();

await mongoose.connect(process.env.MONGO_URI);

const tenant = await Organization.findOne();

if(!tenant){
 console.log("No organization found");
 process.exit();
}

const models=[
"User",
"Customer",
"Booking",
"Tour",
"Destination",
"Vehicle",
"Invoice",
"Commission",
"Coupon",
"Gallery",
"Itinerary",
"CustomTourRequest"
];


for(const name of models){

try{

const Model =
(await import(`../models/${name}.js`)).default;


const result =
await Model.updateMany(
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
name,
result.modifiedCount,
"updated"
);


}catch(err){

console.log(
name,
"skipped"
);

}

}


console.log("Tenant migration complete");

process.exit();

