import mongoose from "mongoose";
import env from "../config/env.js";

const TENANT_ID = new mongoose.Types.ObjectId("6a876d12a0bc937f083ba25a");

const checks = [
  ["users", "email"],
  ["users", "referralCode"],
  ["staffs", "email"],
  ["staffs", "employeeNumber"],
  ["destinations", "slug"],
  ["tours", "slug"],
  ["tourcategories", "slug"],
  ["vehicles", "registrationNumber"],
  ["wishlists", "user"],
];

function valueLabel(value) {
  if (value === null || value === undefined) return "<null>";
  return String(value);
}

async function main() {
  console.log("============================================================");
  console.log("TENANT UNIQUE INDEX PREFLIGHT");
  console.log("============================================================");
  console.log(`Database tenant: ${TENANT_ID}`);
  console.log("MODE: READ ONLY");
  console.log("No documents or indexes will be modified.");
  console.log("============================================================\n");

  await mongoose.connect(env.MONGODB_URI);

  console.log(`Connected to database: ${mongoose.connection.name}\n`);

  let failures = 0;

  for (const [collectionName, field] of checks) {
    const collection = mongoose.connection.db.collection(collectionName);

    console.log(`--- ${collectionName}.${field} ---`);

    /*
     * Only inspect documents belonging to this tenant.
     *
     * Missing/null values are excluded because sparse/partial unique
     * indexes may intentionally allow them.
     */
    const duplicates = await collection.aggregate([
      {
        $match: {
          tenantId: TENANT_ID,
          [field]: {
            $exists: true,
            $nin: [null, ""],
          },
        },
      },
      {
        $group: {
          _id: `$${field}`,
          count: { $sum: 1 },
          ids: { $push: "$_id" },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
      {
        $sort: {
          count: -1,
        },
      },
      {
        $limit: 20,
      },
    ]).toArray();

    if (!duplicates.length) {
      console.log("PASS: no duplicate tenant values found.\n");
      continue;
    }

    failures++;

    console.log(
      `FAIL: ${duplicates.length} duplicate value group(s) found.`
    );

    for (const duplicate of duplicates) {
      console.log(
        JSON.stringify(
          {
            value: valueLabel(duplicate._id),
            count: duplicate.count,
            ids: duplicate.ids.map(String),
          },
          null,
          2
        )
      );
    }

    console.log();
  }

  /*
   * Specifically verify Destination.slug because the current audit
   * identified it as the missing tenant-aware unique index.
   */
  console.log("=== DESTINATION SLUG PRECHECK ===");

  const destinationCollection =
    mongoose.connection.db.collection("destinations");

  const destinationDuplicates =
    await destinationCollection.aggregate([
      {
        $match: {
          tenantId: TENANT_ID,
          slug: {
            $exists: true,
            $nin: [null, ""],
          },
        },
      },
      {
        $group: {
          _id: "$slug",
          count: { $sum: 1 },
          ids: { $push: "$_id" },
          names: { $push: "$name" },
        },
      },
      {
        $match: {
          count: { $gt: 1 },
        },
      },
    ]).toArray();

  if (destinationDuplicates.length) {
    failures++;

    console.log(
      `FAIL: ${destinationDuplicates.length} duplicate destination slug group(s).`
    );

    for (const duplicate of destinationDuplicates) {
      console.log(
        JSON.stringify(
          {
            slug: duplicate._id,
            count: duplicate.count,
            ids: duplicate.ids.map(String),
            names: duplicate.names,
          },
          null,
          2
        )
      );
    }
  } else {
    console.log(
      "PASS: Destination.slug is safe for tenant unique indexing."
    );
  }

  /*
   * Inspect the actual indexes. This is still read-only.
   */
  console.log("\n=== CURRENT TENANT INDEXES ===");

  for (const [collectionName, field] of checks) {
    const collection = mongoose.connection.db.collection(collectionName);
    const indexes = await collection.indexes();

    const tenantIndexes = indexes.filter(
      index =>
        index.unique === true &&
        index.key?.tenantId === 1 &&
        index.key?.[field] === 1
    );

    console.log(
      `${collectionName}.${field}: ${
        tenantIndexes.length
          ? tenantIndexes.map(i => i.name).join(", ")
          : "MISSING"
      }`
    );
  }

  console.log("\n============================================================");

  if (failures) {
    console.log("TENANT UNIQUE PREFLIGHT: FAILED");
    console.log("NO INDEX CHANGES WERE MADE.");
    console.log("Resolve duplicate values before creating unique indexes.");
    console.log("============================================================");

    await mongoose.disconnect();
    process.exit(1);
  }

  console.log("TENANT UNIQUE PREFLIGHT: PASS");
  console.log("No conflicting tenant values were found.");
  console.log("No documents were modified.");
  console.log("No indexes were modified.");
  console.log("============================================================");

  await mongoose.disconnect();
}

main().catch(async error => {
  console.error("\nPREFLIGHT FAILED");
  console.error(error.stack || error.message);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});
