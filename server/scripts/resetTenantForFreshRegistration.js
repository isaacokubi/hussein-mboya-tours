import mongoose from "mongoose";
import env from "../config/env.js";

const mongoUri =
  env.MONGODB_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

if (!mongoUri) {
  throw new Error("MONGODB_URI/DATABASE_URL is not configured.");
}

await mongoose.connect(mongoUri);

const db = mongoose.connection.db;

console.log("\n============================================================");
console.log("FRESH TENANT / SUPERADMIN RESET");
console.log("============================================================");

const collections = await db.listCollections().toArray();

const GLOBAL_COLLECTIONS = new Set([
  "permissions",
  "currencies",
]);

const PRESERVE = new Set([
  "permissions",
  "currencies",
  "systemsettings",
]);

console.log("\nCollections found:");
for (const collection of collections) {
  console.log(` - ${collection.name}`);
}

console.log("\n============================================================");
console.log("DELETING EXISTING APPLICATION / TENANT DATA");
console.log("============================================================");

for (const collection of collections) {
  const name = collection.name;

  if (PRESERVE.has(name)) {
    console.log(`PRESERVE: ${name}`);
    continue;
  }

  try {
    const result = await db.collection(name).deleteMany({});
    console.log(`CLEARED: ${name} -> ${result.deletedCount} documents`);
  } catch (error) {
    console.error(`FAILED: ${name} -> ${error.message}`);
  }
}

console.log("\n============================================================");
console.log("VERIFICATION");
console.log("============================================================");

const remainingCollections = await db.listCollections().toArray();

for (const collection of remainingCollections) {
  const name = collection.name;
  const count = await db.collection(name).countDocuments();

  console.log(
    `${name.padEnd(25)} ${String(count).padStart(6)} documents`
  );
}

console.log("\n============================================================");
console.log("IMPORTANT");
console.log("============================================================");
console.log("Existing organizations: cleared");
console.log("Existing users: cleared");
console.log("Existing superadmins: cleared");
console.log("Existing roles: cleared");
console.log("Tenant/application data: cleared");
console.log("Global permissions: preserved");
console.log("Currencies: preserved");
console.log("System settings: preserved");
console.log("\nDatabase is ready for fresh registration.");

await mongoose.disconnect();
