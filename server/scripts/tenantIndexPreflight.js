/**
 * Purpose: tenant Index Preflight operational script. Main declarations: valueLabel, main.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../config/env.js so this module can use its exported dependencies.
import env from "../config/env.js";

// Declare TENANT_ID for use by the surrounding module or function.
const TENANT_ID = new mongoose.Types.ObjectId("6a876d12a0bc937f083ba25a");

// Declare checks for use by the surrounding module or function.
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

// Define valueLabel; its parameters and body implement this operation.
function valueLabel(value) {
  // Check the condition (value === null || value === undefined) and run the matching branch.
  if (value === null || value === undefined) return "<null>";
  // Return the result of String() to the caller.
  return String(value);
}

// Define main; its parameters and body implement this operation.
async function main() {
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================================");
  // Perform the side effect or state update expressed on the following line.
  console.log("TENANT UNIQUE INDEX PREFLIGHT");
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================================");
  // Perform the side effect or state update expressed on the following line.
  console.log(`Database tenant: ${TENANT_ID}`);
  // Perform the side effect or state update expressed on the following line.
  console.log("MODE: READ ONLY");
  // Perform the side effect or state update expressed on the following line.
  console.log("No documents or indexes will be modified.");
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================================\n");

  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(env.MONGODB_URI);

  // Perform the side effect or state update expressed on the following line.
  console.log(`Connected to database: ${mongoose.connection.name}\n`);

  // Declare failures for use by the surrounding module or function.
  let failures = 0;

  // Repeat the enclosed work for each required iteration.
  for (const [collectionName, field] of checks) {
    // Declare collection for use by the surrounding module or function.
    const collection = mongoose.connection.db.collection(collectionName);

    // Perform the side effect or state update expressed on the following line.
    console.log(`--- ${collectionName}.${field} ---`);

    /*
     * Only inspect documents belonging to this tenant.
     *
     * Missing/null values are excluded because sparse/partial unique
     * indexes may intentionally allow them.
     */
    // Declare duplicates for use by the surrounding module or function.
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

    // Check the condition (!duplicates.length) and run the matching branch.
    if (!duplicates.length) {
      // Perform the side effect or state update expressed on the following line.
      console.log("PASS: no duplicate tenant values found.\n");
      // Skip the remainder of this iteration and continue with the next one.
      continue;
    }

    // Perform the side effect or state update expressed on the following line.
    failures++;

    // Perform the side effect or state update expressed on the following line.
    console.log(
      `FAIL: ${duplicates.length} duplicate value group(s) found.`
    );

    // Repeat the enclosed work for each required iteration.
    for (const duplicate of duplicates) {
      // Perform the side effect or state update expressed on the following line.
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

    // Perform the side effect or state update expressed on the following line.
    console.log();
  }

  /*
   * Specifically verify Destination.slug because the current audit
   * identified it as the missing tenant-aware unique index.
   */
  // Perform the side effect or state update expressed on the following line.
  console.log("=== DESTINATION SLUG PRECHECK ===");

  // Declare destinationCollection for use by the surrounding module or function.
  const destinationCollection =
    mongoose.connection.db.collection("destinations");

  // Declare destinationDuplicates for use by the surrounding module or function.
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

  // Check the condition (destinationDuplicates.length) and run the matching branch.
  if (destinationDuplicates.length) {
    // Perform the side effect or state update expressed on the following line.
    failures++;

    // Perform the side effect or state update expressed on the following line.
    console.log(
      `FAIL: ${destinationDuplicates.length} duplicate destination slug group(s).`
    );

    // Repeat the enclosed work for each required iteration.
    for (const duplicate of destinationDuplicates) {
      // Perform the side effect or state update expressed on the following line.
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
    // Perform the side effect or state update expressed on the following line.
    console.log(
      "PASS: Destination.slug is safe for tenant unique indexing."
    );
  }

  /*
   * Inspect the actual indexes. This is still read-only.
   */
  // Perform the side effect or state update expressed on the following line.
  console.log("\n=== CURRENT TENANT INDEXES ===");

  // Repeat the enclosed work for each required iteration.
  for (const [collectionName, field] of checks) {
    // Declare collection for use by the surrounding module or function.
    const collection = mongoose.connection.db.collection(collectionName);
    // Declare indexes for use by the surrounding module or function.
    const indexes = await collection.indexes();

    // Declare tenantIndexes for use by the surrounding module or function.
    const tenantIndexes = indexes.filter(
      index =>
        index.unique === true &&
        index.key?.tenantId === 1 &&
        index.key?.[field] === 1
    );

    // Perform the side effect or state update expressed on the following line.
    console.log(
      `${collectionName}.${field}: ${
        tenantIndexes.length
          ? tenantIndexes.map(i => i.name).join(", ")
          : "MISSING"
      }`
    );
  }

  // Perform the side effect or state update expressed on the following line.
  console.log("\n============================================================");

  // Check the condition (failures) and run the matching branch.
  if (failures) {
    // Perform the side effect or state update expressed on the following line.
    console.log("TENANT UNIQUE PREFLIGHT: FAILED");
    // Perform the side effect or state update expressed on the following line.
    console.log("NO INDEX CHANGES WERE MADE.");
    // Perform the side effect or state update expressed on the following line.
    console.log("Resolve duplicate values before creating unique indexes.");
    // Perform the side effect or state update expressed on the following line.
    console.log("============================================================");

    // Perform the side effect or state update expressed on the following line.
    await mongoose.disconnect();
    // Perform the side effect or state update expressed on the following line.
    process.exit(1);
  }

  // Perform the side effect or state update expressed on the following line.
  console.log("TENANT UNIQUE PREFLIGHT: PASS");
  // Perform the side effect or state update expressed on the following line.
  console.log("No conflicting tenant values were found.");
  // Perform the side effect or state update expressed on the following line.
  console.log("No documents were modified.");
  // Perform the side effect or state update expressed on the following line.
  console.log("No indexes were modified.");
  // Perform the side effect or state update expressed on the following line.
  console.log("============================================================");

  // Perform the side effect or state update expressed on the following line.
  await mongoose.disconnect();
}

// Perform the side effect or state update expressed on the following line.
main().catch(async error => {
  // Perform the side effect or state update expressed on the following line.
  console.error("\nPREFLIGHT FAILED");
  // Perform the side effect or state update expressed on the following line.
  console.error(error.stack || error.message);

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.disconnect();
  } catch {}

  // Perform the side effect or state update expressed on the following line.
  process.exit(1);
});
