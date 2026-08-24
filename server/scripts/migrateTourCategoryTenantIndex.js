import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
if (!uri) throw new Error("MONGODB_URI or MONGO_URI is required");

await mongoose.connect(uri);
const collection = mongoose.connection.collection("tourcategories");

const indexes = await collection.indexes();
const legacy = indexes.find((index) => index.name === "slug_1" || (index.key && index.key.slug === 1 && Object.keys(index.key).length === 1));
if (legacy) {
  await collection.dropIndex(legacy.name);
  console.log(`Dropped legacy global category slug index: ${legacy.name}`);
}

await collection.createIndex({ tenantId: 1, slug: 1 }, { unique: true, name: "tenant_category_slug_unique" });
console.log("Created tenant-scoped tour category slug index.");
await mongoose.disconnect();
