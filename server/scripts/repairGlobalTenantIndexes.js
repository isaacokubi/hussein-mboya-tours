import mongoose from "mongoose";
import env from "../config/env.js";

const GLOBAL_INDEXES = {
  organizations: [
    { key: { slug: 1 }, options: { unique: true } },
    { key: { domain: 1 }, options: { unique: true, sparse: true } },
  ],
  permissions: [
    { key: { name: 1 }, options: { unique: true } },
  ],
  currencies: [
    { key: { code: 1 }, options: { unique: true } },
  ],
};

const TENANT_PREFIX = "tenantId_";

await mongoose.connect(env.MONGODB_URI);

try {
  const db = mongoose.connection.db;

  for (const [collectionName, requiredIndexes] of Object.entries(GLOBAL_INDEXES)) {
    const collection = db.collection(collectionName);
    const indexes = await collection.listIndexes().toArray();

    for (const index of indexes) {
      const keyNames = Object.keys(index.key || {});
      const isTenantPrefixed = index.name?.startsWith(TENANT_PREFIX) || keyNames.includes("tenantId");
      if (!isTenantPrefixed) continue;

      console.log(`Dropping obsolete tenant-partitioned index ${collectionName}.${index.name}`);
      await collection.dropIndex(index.name);
    }

    for (const definition of requiredIndexes) {
      const existing = await collection.listIndexes().toArray();
      const matches = existing.find((index) =>
        JSON.stringify(index.key) === JSON.stringify(definition.key)
      );

      if (matches?.unique === true && Boolean(matches.sparse) === Boolean(definition.options.sparse)) {
        continue;
      }

      if (matches) {
        console.log(`Dropping conflicting index ${collectionName}.${matches.name}`);
        await collection.dropIndex(matches.name);
      }

      console.log(`Creating canonical global index ${collectionName}.${Object.keys(definition.key).join("_")}`);
      await collection.createIndex(definition.key, definition.options);
    }
  }

  console.log("Global tenant index repair completed successfully.");
} finally {
  await mongoose.disconnect();
}
