import mongoose from "mongoose";
import env from "../config/env.js";

const TENANT_UNIQUE_INDEXES = [
  {
    collection: "users",
    field: "email",
    sparse: false,
  },
  {
    collection: "users",
    field: "referralCode",
    sparse: true,
  },
  {
    collection: "staffs",
    field: "email",
    sparse: false,
  },
  {
    collection: "staffs",
    field: "employeeNumber",
    sparse: false,
    partialFilterExpression: {
      employeeNumber: {
        $type: "string",
        $gt: "",
      },
    },
  },
  {
    collection: "destinations",
    field: "slug",
    sparse: false,
  },
  {
    collection: "tours",
    field: "slug",
    sparse: false,
  },
  {
    collection: "tourcategories",
    field: "slug",
    sparse: false,
  },
  {
    collection: "vehicles",
    field: "registrationNumber",
    sparse: false,
  },
  {
    collection: "wishlists",
    field: "user",
    sparse: false,
  },
];

function samePartial(a, b) {
  return JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
}

async function main() {
  console.log("============================================================");
  console.log("SAFE TENANT UNIQUE INDEX MIGRATION");
  console.log("============================================================");
  console.log("MODE: INDEX ONLY");
  console.log("Application documents will NOT be modified.");
  console.log("============================================================\n");

  await mongoose.connect(env.MONGODB_URI);

  console.log(`Connected to database: ${mongoose.connection.name}\n`);

  /*
   * PHASE 1
   * Create/verify every required tenant-aware unique index.
   *
   * IMPORTANT:
   * We deliberately do this BEFORE dropping global unique indexes.
   */
  console.log("=== PHASE 1: ENSURE TENANT UNIQUE INDEXES ===\n");

  for (const config of TENANT_UNIQUE_INDEXES) {
    const collection =
      mongoose.connection.db.collection(config.collection);

    const expectedKey = {
      tenantId: 1,
      [config.field]: 1,
    };

    const indexes = await collection.indexes();

    const exact = indexes.find(
      index =>
        index.unique === true &&
        JSON.stringify(index.key) ===
          JSON.stringify(expectedKey) &&
        !!index.sparse === !!config.sparse &&
        samePartial(
          index.partialFilterExpression,
          config.partialFilterExpression
        )
    );

    if (exact) {
      console.log(
        `PASS ${config.collection}.${config.field}: ${exact.name}`
      );
      continue;
    }

    /*
     * Remove only incompatible unique indexes with exactly the same
     * tenant-aware key.
     */
    const incompatible = indexes.filter(
      index =>
        index.unique === true &&
        JSON.stringify(index.key) ===
          JSON.stringify(expectedKey)
    );

    for (const index of incompatible) {
      console.log(
        `Dropping incompatible tenant index ${config.collection}.${index.name}`
      );

      await collection.dropIndex(index.name);
    }

    const indexName =
      `tenantId_1_${config.field}_1`;

    const options = {
      name: indexName,
      unique: true,
    };

    if (config.sparse) {
      options.sparse = true;
    }

    if (config.partialFilterExpression) {
      options.partialFilterExpression =
        config.partialFilterExpression;
    }

    await collection.createIndex(
      expectedKey,
      options
    );

    console.log(
      `CREATED ${config.collection}.${indexName}`
    );
  }

  /*
   * PHASE 2
   * Verify all replacements exist BEFORE dropping any global index.
   */
  console.log(
    "\n=== PHASE 2: VERIFY TENANT REPLACEMENTS ===\n"
  );

  for (const config of TENANT_UNIQUE_INDEXES) {
    const collection =
      mongoose.connection.db.collection(config.collection);

    const indexes = await collection.indexes();

    const expectedKey = {
      tenantId: 1,
      [config.field]: 1,
    };

    const exists = indexes.some(
      index =>
        index.unique === true &&
        JSON.stringify(index.key) ===
          JSON.stringify(expectedKey)
    );

    if (!exists) {
      throw new Error(
        `SAFETY STOP: missing tenant replacement for ${config.collection}.${config.field}`
      );
    }

    console.log(
      `VERIFIED ${config.collection}.${config.field}`
    );
  }

  /*
   * PHASE 3
   * Remove ONLY the explicitly known obsolete global indexes.
   *
   * No arbitrary unique index is touched.
   */
  console.log(
    "\n=== PHASE 3: REMOVE OBSOLETE GLOBAL INDEXES ===\n"
  );

  const GLOBAL_REPLACEMENTS = [
    ["users", "email", "email_1"],
    ["users", "referralCode", "referralCode_1"],

    ["staffs", "email", "email_1"],
    ["staffs", "employeeNumber", "employeeNumber_1"],

    ["destinations", "slug", "slug_1"],
    ["tours", "slug", "slug_1"],
    ["tourcategories", "slug", "slug_1"],
    ["vehicles", "registrationNumber", "registrationNumber_1"],
    ["wishlists", "user", "user_1"],
  ];

  for (const [collectionName, field, globalIndexName] of GLOBAL_REPLACEMENTS) {
    const collection =
      mongoose.connection.db.collection(collectionName);

    const indexes = await collection.indexes();

    const tenantReplacementExists = indexes.some(
      index =>
        index.unique === true &&
        index.key?.tenantId === 1 &&
        index.key?.[field] === 1
    );

    if (!tenantReplacementExists) {
      throw new Error(
        `SAFETY STOP: refusing to remove ${collectionName}.${globalIndexName}; tenant replacement missing`
      );
    }

    const globalIndex = indexes.find(
      index =>
        index.name === globalIndexName &&
        index.unique === true &&
        !index.key?.tenantId &&
        index.key?.[field] === 1 &&
        Object.keys(index.key || {}).length === 1
    );

    if (!globalIndex) {
      console.log(
        `PASS ${collectionName}.${globalIndexName}: already absent`
      );
      continue;
    }

    console.log(
      `Dropping obsolete global index ${collectionName}.${globalIndexName}`
    );

    await collection.dropIndex(globalIndexName);

    console.log(
      `DROPPED ${collectionName}.${globalIndexName}`
    );
  }

  /*
   * PHASE 4
   * Final index verification.
   */
  console.log(
    "\n=== PHASE 4: FINAL INDEX VERIFICATION ===\n"
  );

  let failures = 0;

  for (const config of TENANT_UNIQUE_INDEXES) {
    const collection =
      mongoose.connection.db.collection(config.collection);

    const indexes = await collection.indexes();

    const tenantIndex = indexes.find(
      index =>
        index.unique === true &&
        index.key?.tenantId === 1 &&
        index.key?.[config.field] === 1
    );

    if (!tenantIndex) {
      failures++;

      console.log(
        `FAIL ${config.collection}.${config.field}`
      );

      continue;
    }

    console.log(
      `PASS ${config.collection}.${config.field}: ${tenantIndex.name}`
    );
  }

  if (failures) {
    throw new Error(
      `Final tenant index verification failed: ${failures} index(es)`
    );
  }

  console.log("\n============================================================");
  console.log("SAFE TENANT INDEX MIGRATION: PASS");
  console.log("============================================================");
  console.log("Indexes changed only.");
  console.log("Application documents modified: 0");
  console.log("============================================================\n");

  await mongoose.disconnect();
}

main().catch(async error => {
  console.error("\n============================================================");
  console.error("SAFE TENANT INDEX MIGRATION: FAILED");
  console.error("============================================================");
  console.error(error.stack || error.message);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});
