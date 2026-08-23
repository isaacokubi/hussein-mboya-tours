import fs from "fs";

const models=[

"Agent",
"Booking",
"Commission",
"Coupon",
"Customer",
"Destination",
"Gallery",
"HeroSlide",
"Invoice",
"Itinerary",
"Notification",
"Payment",
"Quotation",
"Refund",
"Review",
"Staff",
"Tour",
"Vehicle",
"WalletTransaction",
"Wishlist"

];


for(const model of models){

const file=`models/${model}.js`;

if(!fs.existsSync(file)){
console.log("Missing:",file);
continue;
}


let data=fs.readFileSync(file,"utf8");


if(data.includes("tenantId")){
console.log("Already:",model);
continue;
}



data=data.replace(
"const ",
"const "
);



data=data.replace(
/new mongoose\.Schema\(\{/,
`new mongoose.Schema({

tenantId:{
type:mongoose.Schema.Types.ObjectId,
ref:"Organization",
index:true
},
`
);



fs.writeFileSync(file,data);

console.log("Patched:",model);

}
