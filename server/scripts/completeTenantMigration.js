import mongoose from "mongoose";
import env from "../config/env.js";

await mongoose.connect(env.MONGODB_URI);

const tenantId = new mongoose.Types.ObjectId(
  "6a876d12a0bc937f083ba25a"
);

const collections = [
  "agents",
  "auditlogs",
  "bookings",
  "commissions",
  "customtourrequests",
  "databasebackups",
  "destinations",
  "galleries",
  "heroslides",
  "notifications",
  "payments",
  "roles",
  "securitylogs",
  "staffs",
  "systemsettings",
  "tours",
  "tourcategories",
  "users",
  "vehicles",
  "wishlists"
];

console.log("\n=== SAFE TENANT MIGRATION COMPLETION ===");
console.log("Database:", mongoose.connection.name);
console.log("Tenant:", tenantId.toString());
console.log("");

let failures = 0;

for (const name of collections) {
  const c = mongoose.connection.db.collection(name);

  try {
    const before = await c.countDocuments({
      $or: [
        { tenantId: { $exists: false } },
        { tenantId: null }
      ]
    });

    if (before === 0) {
      console.log(`PASS ${name}: already assigned`);
      continue;
    }

    const result = await c.updateMany(
      {
        $or: [
          { tenantId: { $exists: false } },
          { tenantId: null }
        ]
      },
      {
        $set: {
          tenantId
        }
      }
    );

    const remaining = await c.countDocuments({
      $or: [
        { tenantId: { $exists: false } },
        { tenantId: null }
      ]
    });

    if (remaining === 0) {
      console.log(
        `PASS ${name}: assigned ${result.modifiedCount} records`
      );
    } else {
      failures++;
      console.log(
        `FAIL ${name}: remaining=${remaining}`
      );
    }
  } catch (error) {
    failures++;
    console.error(`FAIL ${name}: ${error.message}`);
  }
}

await mongoose.disconnect();

console.log("");

if (failures > 0) {
  console.log(
    `=== MIGRATION COMPLETION FAILED: ${failures} collections ===`
  );
  process.exit(1);
}

console.log("=== MIGRATION COMPLETION: PASS ===");
console.log("All tenant-scoped records have tenantId.");
