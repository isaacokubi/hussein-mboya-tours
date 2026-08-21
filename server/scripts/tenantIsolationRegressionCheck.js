import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import Organization from "../models/Organization.js";
import Tour from "../models/Tour.js";
import Destination from "../models/Destination.js";


async function run(){

await mongoose.connect(process.env.MONGODB_URI);


console.log("================================================");
console.log("TENANT ISOLATION REGRESSION TEST");
console.log("================================================");



await Organization.deleteMany({
name:{
$regex:"Tenant Isolation Test"
}
});


const stamp=Date.now();



const tenantA=await Organization.create({

name:"Tenant Isolation Test A",

slug:"tenant-isolation-a-"+stamp,

domain:"tenant-a-"+stamp+".test",

status:"active"

});



const tenantB=await Organization.create({

name:"Tenant Isolation Test B",

slug:"tenant-isolation-b-"+stamp,

domain:"tenant-b-"+stamp+".test",

status:"active"

});



console.log(
"Created tenants:",
tenantA._id,
tenantB._id
);



const destinationA = await Destination.create({

name:"Tenant A Destination",

slug:"tenant-a-destination-"+stamp,

country:"Kenya",

location:"Nairobi",

description:"Private Tenant A test destination",

tenantId:tenantA._id

});



const destinationB = await Destination.create({

name:"Tenant B Destination",

slug:"tenant-b-destination-"+stamp,

country:"Kenya",

location:"Mombasa",

description:"Private Tenant B test destination",

tenantId:tenantB._id

});




const tourA=await Tour.create({

title:"Tenant A Secret Tour",

name:"Tenant A Secret Tour",

slug:"tenant-a-tour-"+stamp,

tenantId:tenantA._id,

destination:destinationA._id,

country:"Kenya",

location:"Nairobi",

date:new Date(),

price:1000,

description:"Private tenant A data"

});





const tourB=await Tour.create({

title:"Tenant B Secret Tour",

name:"Tenant B Secret Tour",

slug:"tenant-b-tour-"+stamp,

tenantId:tenantB._id,

destination:destinationB._id,

country:"Kenya",

location:"Mombasa",

date:new Date(),

price:2000,

description:"Private tenant B data"

});



console.log("Created tenant tours");




const tenantAData =
await Tour.find({
tenantId:tenantA._id
});



const tenantBData =
await Tour.find({
tenantId:tenantB._id
});





if(
tenantAData.some(
t=>t._id.equals(tourB._id)
)
){

throw new Error(
"TENANT LEAK: Tenant A sees Tenant B data"
);

}





if(
tenantBData.some(
t=>t._id.equals(tourA._id)
)
){

throw new Error(
"TENANT LEAK: Tenant B sees Tenant A data"
);

}





console.log("");

console.log("======================================");

console.log("TENANT ISOLATION REGRESSION PASS");

console.log("======================================");





await Tour.deleteMany({

_id:{
$in:[
tourA._id,
tourB._id
]
}

});



await Destination.deleteMany({

_id:{
$in:[
destinationA._id,
destinationB._id
]

}

});



await Organization.deleteMany({

_id:{
$in:[
tenantA._id,
tenantB._id
]

}

});



await mongoose.disconnect();


}



run().catch(err=>{

console.error(err);

process.exit(1);

});
