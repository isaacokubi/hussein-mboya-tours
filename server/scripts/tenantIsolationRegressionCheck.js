import mongoose from "mongoose";
<<<<<<< HEAD
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
=======
import env from "../config/env.js";
import { runWithTenant } from "../tenancy/context.js";

await import("../tenancy/bootstrap.js");
const { default: Organization } = await import("../models/Organization.js");
const { default: Destination } = await import("../models/Destination.js");

await mongoose.connect(env.MONGODB_URI);

const suffix = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const createdTenantIds = [];
const createdDestinationIds = [];
const results = [];
const fixture = (name, slug) => ({ name, slug, country: "Kenya", description: `Tenant isolation regression fixture for ${name}.` });

const pass = (name) => results.push({ name, ok: true });
const fail = (name, error) => results.push({ name, ok: false, error: error?.message || String(error) });
const expect = async (name, fn) => {
  try { await fn(); pass(name); } catch (error) { fail(name, error); }
};

try {
  const tenantA = await runWithTenant({ bypass: true }, () => Organization.create({ name: `Isolation A ${suffix}`, slug: `isolation-a-${suffix}`, status: "active" }));
  const tenantB = await runWithTenant({ bypass: true }, () => Organization.create({ name: `Isolation B ${suffix}`, slug: `isolation-b-${suffix}`, status: "active" }));
  createdTenantIds.push(tenantA._id, tenantB._id);

  let destinationA;
  let destinationB;

  await expect("Tenant A create", async () => {
    destinationA = await runWithTenant({ tenantId: tenantA._id }, () => Destination.create(fixture(`Isolation Destination A ${suffix}`, `isolation-destination-a-${suffix}`)));
    createdDestinationIds.push(destinationA._id);
  });

  await expect("Tenant B create", async () => {
    destinationB = await runWithTenant({ tenantId: tenantB._id }, () => Destination.create(fixture(`Isolation Destination B ${suffix}`, `isolation-destination-b-${suffix}`)));
    createdDestinationIds.push(destinationB._id);
  });

  await expect("Missing tenant context fails closed", async () => {
    try { await Destination.findOne({ _id: destinationA._id }); }
    catch (error) {
      if (/Tenant context is required/i.test(error.message)) return;
      throw error;
    }
    throw new Error("Tenant-scoped query unexpectedly succeeded without tenant context.");
  });

  await expect("Cross-tenant read blocked", async () => {
    const found = await runWithTenant({ tenantId: tenantA._id }, () => Destination.findById(destinationB._id).lean());
    if (found) throw new Error("Tenant A read Tenant B data.");
  });

  await expect("Cross-tenant update blocked", async () => {
    const result = await runWithTenant({ tenantId: tenantA._id }, () => Destination.updateOne({ _id: destinationB._id }, { $set: { name: `ATTACK ${suffix}` } }));
    if (result.matchedCount !== 0) throw new Error("Tenant A updated Tenant B data.");
  });

  await expect("Cross-tenant delete blocked", async () => {
    const result = await runWithTenant({ tenantId: tenantA._id }, () => Destination.deleteOne({ _id: destinationB._id }));
    if (result.deletedCount !== 0) throw new Error("Tenant A deleted Tenant B data.");
  });

  await expect("Tenant-scoped insertMany", async () => {
    const docs = await runWithTenant({ tenantId: tenantA._id }, () => Destination.insertMany([
      fixture(`Isolation Bulk 1 ${suffix}`, `isolation-bulk-1-${suffix}`),
      fixture(`Isolation Bulk 2 ${suffix}`, `isolation-bulk-2-${suffix}`),
    ]));
    createdDestinationIds.push(...docs.map((doc) => doc._id));
    if (docs.some((doc) => String(doc.tenantId) !== String(tenantA._id))) throw new Error("insertMany assigned the wrong tenant.");
  });

  await expect("Tenant-scoped bulkWrite", async () => {
    const result = await runWithTenant({ tenantId: tenantA._id }, () => Destination.bulkWrite([
      { updateOne: { filter: { _id: destinationA._id }, update: { $set: { shortDescription: "tenant-isolation-regression" } } } },
    ]));
    if (result.matchedCount !== 1) throw new Error("bulkWrite did not target the tenant-owned record.");
  });

  await expect("Cross-tenant aggregation lookup blocked", async () => {
    const rows = await runWithTenant({ tenantId: tenantA._id }, () => Destination.aggregate([
      { $match: { _id: destinationA._id } },
      { $lookup: { from: "destinations", pipeline: [{ $match: { country: "Kenya" } }], as: "allKenyaDestinations" } },
    ]));
    const joinedIds = (rows[0]?.allKenyaDestinations || []).map((row) => String(row._id));
    if (joinedIds.includes(String(destinationB._id))) throw new Error("Aggregation lookup returned Tenant B data.");
    if (!joinedIds.includes(String(destinationA._id))) throw new Error("Aggregation lookup lost Tenant A data.");
  });

  await expect("estimatedDocumentCount fails closed", async () => {
    try { await runWithTenant({ tenantId: tenantA._id }, () => Destination.estimatedDocumentCount()); }
    catch (error) {
      if (/not tenant-safe|Tenant context/i.test(error.message)) return;
      throw error;
    }
    throw new Error("estimatedDocumentCount unexpectedly succeeded in tenant context.");
  });

  await expect("Tenant data survives cross-tenant attacks", async () => {
    const own = await runWithTenant({ tenantId: tenantA._id }, () => Destination.findById(destinationA._id).lean());
    const other = await runWithTenant({ tenantId: tenantB._id }, () => Destination.findById(destinationA._id).lean());
    if (!own) throw new Error("Tenant A lost its own record.");
    if (other) throw new Error("Tenant B can read Tenant A data.");
  });
} finally {
  await runWithTenant({ bypass: true }, async () => {
    if (createdDestinationIds.length) await Destination.deleteMany({ _id: { $in: createdDestinationIds } });
    if (createdTenantIds.length) await Organization.deleteMany({ _id: { $in: createdTenantIds } });
  });
  await mongoose.disconnect();
>>>>>>> feat/first-admin-superadmin-onboarding
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
