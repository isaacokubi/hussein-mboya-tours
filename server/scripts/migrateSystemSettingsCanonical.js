import dotenv from "dotenv";
dotenv.config({ path: new URL("../.env", import.meta.url) });
import mongoose from "mongoose";
import SystemSetting from "../models/SystemSetting.js";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error(
    "ERROR: MONGODB_URI, MONGO_URI, or DATABASE_URL is not configured."
  );
  process.exit(1);
}

const LEGACY_COLLECTION = "systemsettings";
const CANONICAL_COLLECTION = "systemsettings";

async function run() {
  console.log("");
  console.log("============================================================");
  console.log(" SYSTEM SETTINGS CANONICAL MIGRATION");
  console.log("============================================================");
  console.log("");

  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;

  console.log(`Database: ${db.databaseName}`);
  console.log(`Canonical model: ${SystemSetting.modelName}`);
  console.log(`Canonical collection: ${SystemSetting.collection.name}`);
  console.log("");

  const collections = await db
    .listCollections({}, { nameOnly: true })
    .toArray();

  const names = new Set(collections.map((c) => c.name));

  console.log("Collections detected:");
  for (const name of names) {
    if (
      name.toLowerCase().includes("systemsetting")
    ) {
      console.log(`  - ${name}`);
    }
  }

  console.log("");

  /*
   * IMPORTANT:
   *
   * This script intentionally does NOT drop or delete the legacy
   * collection. It only verifies the canonical model and reports
   * available settings.
   */

  const count = await SystemSetting.countDocuments();

  console.log(`Canonical settings documents: ${count}`);

  const sample = await SystemSetting.find({})
    .select("_id key tenantId updatedAt")
    .limit(10)
    .lean();

  if (sample.length) {
    console.log("");
    console.log("Sample settings:");

    for (const item of sample) {
      console.log(
        `  ${item._id} | key=${item.key || "-"} | tenantId=${
          item.tenantId || "GLOBAL"
        }`
      );
    }
  }

  console.log("");
  console.log("MIGRATION CHECK COMPLETE.");
  console.log("");
  console.log(
    "No legacy collection was deleted or modified by this script."
  );
  console.log("");

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("");
  console.error("MIGRATION CHECK FAILED");
  console.error(error);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});
