import fs from "fs";
import path from "path";


const DIR="./models";

let missing=[];


for(const file of fs.readdirSync(DIR)){


if(!file.endsWith(".js"))
continue;


const full=
path.join(DIR,file);


const code=
fs.readFileSync(
full,
"utf8"
);



const tenantModels=[
"User",
"Booking",
"Tour",
"Destination",
"Vehicle",
"Guide",
"Driver",
"Payment",
"Invoice",
"Review",
"Gallery",
"Coupon",
"Commission",
"Notification",
"Quotation",
"Voucher",
"Agent",
"Staff",
"Itinerary"
];


let requiresTenant=false;


for(const model of tenantModels){

if(
code.includes(`model("${model}`)
||
code.includes(`model('${model}`)
){

requiresTenant=true;

}

}



if(
requiresTenant &&
!code.includes("tenantId")
){

missing.push(file);

}


}



console.log(`
=====================================
MODEL TENANT AUDIT
=====================================

Models missing tenantId:

${missing.length}

${missing.join("\n")}


=====================================
`);
