import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import mongoose from "mongoose";
import { runWithTenant } from "../tenancy/context.js";
import Organization from "../models/Organization.js";

const TARGET = Math.max(10, Number(process.env.TEST_SEED_COUNT || 10));
const MODEL_DIR = path.resolve(process.cwd(), "models");
const GLOBALS = new Set(["Organization", "Permission", "Currency"]);

const isModel = (value) => Boolean(value?.modelName && value?.schema && value?.collection);
const isGlobal = (model) => GLOBALS.has(model.modelName) || !model.schema.path("tenantId");

function indexes(model) {
  return model.schema.indexes().map(([key, options]) => ({ key: key || {}, options: options || {} }));
}

function tenantSingleton(model) {
  return indexes(model).some(({ key, options }) => options.unique && Object.keys(key).length === 1 && Object.keys(key)[0] === "tenantId");
}

async function loadModels() {
  const entries = await fs.readdir(MODEL_DIR, { withFileTypes: true });
  const models = [];
  for (const entry of entries.filter((item) => item.isFile() && item.name.endsWith(".js"))) {
    try {
      const module = await import(pathToFileURL(path.join(MODEL_DIR, entry.name)).href);
      if (isModel(module.default)) models.push(module.default);
      for (const value of Object.values(module)) if (isModel(value) && !models.includes(value)) models.push(value);
    } catch (error) {
      console.warn(`MODEL_AUDIT_IMPORT_SKIPPED ${entry.name}: ${error.message}`);
    }
  }
  return models.sort((a, b) => a.modelName.localeCompare(b.modelName));
}

async function auditTenant(models, tenant) {
  return runWithTenant({ tenantId: tenant._id, role: "admin" }, async () => {
    const records = [];
    for (const model of models.filter((item) => !isGlobal(item))) {
      const count = await model.countDocuments({});
      const minimum = tenantSingleton(model) ? 1 : TARGET;
      records.push({ model: model.modelName, count, minimum, pass: count >= minimum });
    }
    return { tenantId: String(tenant._id), tenantName: tenant.name, records };
  });
}

async function main() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!uri) throw new Error("MONGODB_URI or MONGO_URI is missing.");
  await mongoose.connect(uri);
  try {
    const models = await loadModels();
    const tenants = await runWithTenant({ role: "super_admin", bypass: true }, () =>
      Organization.find({ status: "active" }).sort({ createdAt: 1 }).lean());
    if (!tenants.length) throw new Error("No active tenants found.");

    const summaries = [];
    for (const tenant of tenants) summaries.push(await auditTenant(models, tenant));
    const failed = summaries.flatMap((tenant) => tenant.records.filter((record) => !record.pass).map((record) => ({
      tenantId: tenant.tenantId,
      tenantName: tenant.tenantName,
      ...record,
    })));

    console.log(JSON.stringify({
      success: failed.length === 0,
      targetPerTenant: TARGET,
      tenantsProcessed: tenants.length,
      tenantScopedModels: models.filter((model) => !isGlobal(model)).length,
      failedRecords: failed,
      tenants: summaries,
    }, null, 2));
    if (failed.length) process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(`Seeded-data audit failed: ${error.message}`);
  process.exitCode = 1;
});
