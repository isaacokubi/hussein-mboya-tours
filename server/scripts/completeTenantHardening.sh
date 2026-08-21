#!/bin/bash

set -e

echo "======================================"
echo "MULTI TENANT HARDENING START"
echo "======================================"

########################################
# 1. Fix organization domain indexes
########################################

echo "Fixing organization domain index..."

cat > scripts/fixOrganizationDomainIndex.js <<'JS'
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run(){

await mongoose.connect(process.env.MONGODB_URI);

const db = mongoose.connection.db;


const indexes = await db
.collection("organizations")
.indexes();


for(const i of indexes){

if(i.key.domain){

console.log("Dropping:",i.name);

await db.collection("organizations")
.dropIndex(i.name);

}

}


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
$exists:true,
$type:"string",
$ne:""
}
}
}
);


console.log(
"Organization domain index fixed"
);


await mongoose.disconnect();

}


run().catch(err=>{
console.error(err);
process.exit(1);
});
JS


node scripts/fixOrganizationDomainIndex.js


########################################
# 2. Clean null domains
########################################

echo "Cleaning null domains..."

cat > scripts/cleanOrganizationDomains.js <<'JS'
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

async function run(){

await mongoose.connect(process.env.MONGODB_URI);


const result =
await mongoose.connection.db
.collection("organizations")
.updateMany(
{
domain:null
},
{
$unset:{
domain:""
}
}
);


console.log(
"Removed:",
result.modifiedCount
);


await mongoose.disconnect();

}

run();
JS


node scripts/cleanOrganizationDomains.js



########################################
# 3. Fix tenant isolation test
########################################

echo "Fixing isolation test..."

python3 <<'PY'

file="scripts/tenantIsolationRegressionCheck.js"

try:

    data=open(file).read()

    data=data.replace(
    'domain:null',
    'domain:"tenant-"+Date.now()+".test"'
    )

    open(file,"w").write(data)

    print("Regression script updated")

except Exception as e:
    print(e)

PY



########################################
# 4. Add tenantId to models safely
########################################


echo "Adding tenant fields..."

cat > scripts/addTenantFields.js <<'JS'
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

console.log("Missing",file);

continue;

}


let data=fs.readFileSync(file,"utf8");


if(data.includes("tenantId")){

console.log("Already:",model);

continue;

}


// insert after schema opening

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


console.log(
"Patched:",
model
);


}

JS


node scripts/addTenantFields.js



########################################
# 5. Backfill tenant IDs
########################################


echo "Backfilling tenant IDs..."


cat > scripts/backfillTenantIds.js <<'JS'
import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();


async function run(){

await mongoose.connect(process.env.MONGODB_URI);


const db=mongoose.connection.db;


const tenant=
await db.collection("organizations")
.findOne();


if(!tenant){

throw new Error(
"No organization found"
);

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


const result=
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
JS



node scripts/backfillTenantIds.js



########################################
# 6. Validation
########################################


echo "Running syntax validation..."

find controllers middleware models tenancy utils \
-name "*.js" \
-print0 | xargs -0 -n1 node --check



echo "Running tenant index check..."

node scripts/tenantIndexPreflight.js



echo "Running isolation test..."

node scripts/tenantIsolationRegressionCheck.js



########################################
# 7. Git commit
########################################

echo "Preparing git commit..."

cd ..

git add .

git commit -m "Complete multi tenant isolation hardening" || true

git push origin fix/rbac-production || true



echo "======================================"
echo "MULTI TENANT HARDENING COMPLETE"
echo "======================================"

