import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import mongoose from "mongoose";
import "../tenancy/bootstrap.js";
import env from "../config/env.js";

const APPLY = process.argv.includes("--apply");
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const modelsDir = path.resolve(__dirname, "../models");
const GLOBAL_MODELS = new Set(["Organization", "Permission", "Currency"]);

const modelFiles = (await fs.readdir(modelsDir))
  .filter((file) => file.endsWith(".js"))
  .filter((file) => file !== "notFoundMiddleware.js");

for (const file of modelFiles) {
  await import(pathToFileURL(path.join(modelsDir, file)).href);
}

await mongoose.connect(env.MONGODB_URI || process.env.MONGODB_URI);

const results = [];

for (const [name, Model] of Object.entries(mongoose.models)) {
  if (GLOBAL_MODELS.has(name) || !Model.schema.path("tenantId")) continue;

  const schemaIndexes = Model.schema.indexes();
  const tenantUniqueFields = new Set(
    schemaIndexes
      .filter(([fields, options]) => options?.unique && fields.tenantId === 1)
      .map(([fields]) => Object.keys(fields).find((field) => field !== "tenantId"))
      .filter(Boolean)
  );

  if (!tenantUniqueFields.size) continue;

  const indexes = await Model.collection.indexes();
  for (const index of indexes) {
    if (!index.unique || index.name === "_id_") continue;

    const keys = Object.keys(index.key || {});
    if (keys.length !== 1) continue;

    const field = keys[0];
    if (!tenantUniqueFields.has(field)) continue;

    const action = APPLY ? "drop" : "would-drop";
    if (APPLY) await Model.collection.dropIndex(index.name);

    results.push({
      model: name,
      collection: Model.collection.name,
      index: index.name,
      field,
      action,
    });
  }
}

console.log(JSON.stringify({
  mode: APPLY ? "apply" : "dry-run",
  changed: results.length,
  results,
}, null, 2));

await mongoose.disconnect();
