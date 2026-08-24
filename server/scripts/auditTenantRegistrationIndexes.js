import dotenv from "dotenv";
import mongoose from "mongoose";
import "../models/Organization.js";
import "../models/User.js";

dotenv.config();

const REQUIRED = {
  organizations: {
    slug: { key: { slug: 1 }, unique: true },
    domain: { key: { domain: 1 }, unique: true, sparse: true },
  },
  users: {
    tenant_email_unique: {
      key: { tenantId: 1, email: 1 },
      unique: true,
      partial: { tenantId: { $type: "objectId" } },
    },
  },
};

function sameKey(actual, expected) {
  return JSON.stringify(actual) === JSON.stringify(expected);
}

function findIndex(indexes, name, expected) {
  return indexes.find((index) =>
    index.name === name ||
    (sameKey(index.key, expected.key) && index.unique === expected.unique)
  );
}

const fail = (message) => {
  console.error(`✗ ${message}`);
  process.exitCode = 1;
};

try {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is required.");
  await mongoose.connect(process.env.MONGODB_URI);

  const db = mongoose.connection.db;

  for (const [collectionName, requirements] of Object.entries(REQUIRED)) {
    const collection = db.collection(collectionName);
    const indexes = await collection.indexes();
    console.log(`\n=== ${collectionName} ===`);

    for (const [name, expected] of Object.entries(requirements)) {
      const actual = findIndex(indexes, name, expected);
      if (!actual) {
        fail(`Missing required unique index: ${collectionName}.${name}`);
        continue;
      }

      if (!sameKey(actual.key, expected.key) || !actual.unique) {
        fail(`Incorrect index definition: ${collectionName}.${name}`);
        continue;
      }

      if (expected.sparse && !actual.sparse) {
        fail(`Organization.domain index must be sparse.`);
        continue;
      }

      if (expected.partial && !sameKey(actual.partialFilterExpression, expected.partial)) {
        fail(`User tenant email index has an incorrect partial filter.`);
        continue;
      }

      console.log(`✓ ${name}`, {
        key: actual.key,
        unique: actual.unique,
        sparse: Boolean(actual.sparse),
        partialFilterExpression: actual.partialFilterExpression || null,
      });
    }
  }

  const nullDomains = await db.collection("organizations").countDocuments({ domain: null });
  if (nullDomains > 0) {
    fail(`Found ${nullDomains} organization(s) with explicit domain:null. Remove these values before relying on the sparse unique domain index.`);
  } else {
    console.log("✓ No explicit domain:null values found.");
  }

  const globalEmailIndexes = (await db.collection("users").indexes()).filter((index) =>
    index.unique && sameKey(index.key, { email: 1 })
  );

  if (globalEmailIndexes.length) {
    fail(`Found a global unique User.email index: ${globalEmailIndexes.map((index) => index.name).join(", ")}`);
  } else {
    console.log("✓ No global unique User.email index found.");
  }
} finally {
  await mongoose.disconnect().catch(() => {});
}

if (process.exitCode) {
  console.error("\nTenant registration index audit FAILED.");
} else {
  console.log("\nTenant registration index audit PASSED.");
}
