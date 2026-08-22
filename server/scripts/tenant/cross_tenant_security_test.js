import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import {fileURLToPath} from "url";

import { mergeTenantFilter } from "../../tenancy/context.js";


const __filename=fileURLToPath(import.meta.url);
const __dirname=path.dirname(__filename);


dotenv.config({
    path:path.resolve(__dirname,"../../.env")
});


console.log(`
=====================================
CROSS TENANT SECURITY TEST
=====================================
`);



async function run(){


await mongoose.connect(
process.env.MONGODB_URI
);


console.log("✓ Database connected");



const users =
mongoose.connection.collection("users");



const tenants =
await users.distinct(
"tenantId"
);



console.log(
"Detected tenants:",
tenants.length
);



if(tenants.length < 2){

console.log(`
⚠ Only one tenant detected.

Create another tenant before attack testing.
`);

await mongoose.disconnect();
return;

}



const tenantA=tenants[0];
const tenantB=tenants[1];



console.log(`
Tenant A:
${tenantA}

Tenant B:
${tenantB}
`);



let failures=[];



const leaked =
await users.find({

...mergeTenantFilter(
{
},
tenantA
),

tenantId:tenantB

})
.toArray();



if(leaked.length){

failures.push(
"Tenant A accessed Tenant B users"
);

}



console.log(
"Cross tenant records exposed:",
leaked.length
);



console.log(`
=====================================
RESULT
=====================================

Failures:
${failures.length}

${failures.join("\n")}

=====================================
`);




await mongoose.disconnect();


}



run();
