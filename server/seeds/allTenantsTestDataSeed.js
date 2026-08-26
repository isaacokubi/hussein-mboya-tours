import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import mongoose from "mongoose";
import { runWithTenant } from "../tenancy/context.js";

const TARGET_COUNT = Math.max(10, Number(process.env.TEST_SEED_COUNT || 10));
const ALLOW_TEST_SEED = String(process.env.ALLOW_TEST_SEED || "false").toLowerCase() === "true";
const DEFAULT_PASSWORD = process.env.TEST_SEED_PASSWORD || "TestPassword123!";
const MODEL_DIR = path.resolve(process.cwd(), "models");
const GLOBAL_MODELS = new Set(["Organization", "Permission", "Currency"]);
const PRIVATE_FIELDS = /(token|secret|reset|pinHash|passwordReset|loginPin|apiKey|accessToken|refreshToken|hash)$/i;
const SKIP_FIELDS = new Set([
  "_id", "__v", "deletedAt", "deletedBy", "lockUntil", "passwordResetCodeHash",
  "passwordResetExpiresAt", "passwordResetAttempts", "loginPinHash", "loginPinExpiresAt",
  "loginPinAttempts", "loginPinLastSentAt"
]);
const cities = ["Nairobi", "Mombasa", "Arusha", "Kampala", "Kigali", "Cape Town", "Gaborone", "Windhoek", "Lusaka", "Marrakesh"];
const countries = ["Kenya", "Tanzania", "Uganda", "Rwanda", "South Africa", "Botswana", "Namibia", "Zambia", "Zimbabwe", "Morocco"];
const roles = ["customer", "agent", "tour_guide", "tour_manager", "manager", "driver", "travel_agent"];
const statuses = ["active", "confirmed", "upcoming", "pending", "completed", "paid", "scheduled", "ongoing"];

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function isModel(value) {
  return Boolean(value?.modelName && value?.schema && value?.collection);
}

function isGlobal(model) {
  return GLOBAL_MODELS.has(model.modelName) || !model.schema.path("tenantId");
}

function refFor(pathDef) {
  return pathDef?.options?.ref || pathDef?.caster?.options?.ref || null;
}

function enumValue(pathDef, index) {
  const values = pathDef?.enumValues || pathDef?.options?.enum || [];
  return values.length ? values[index % values.length] : undefined;
}

function sampleUrl(modelName, index, suffix = "") {
  return `https://example.com/test-data/${modelName.toLowerCase()}/${index + 1}${suffix}`;
}

function stringValue(modelName, field, index, pathDef) {
  const selected = enumValue(pathDef, index);
  if (selected !== undefined) return selected;
  const f = field.toLowerCase();
  if (f === "email") return `${modelName.toLowerCase()}${index + 1}@tenant-test.example`;
  if (f.includes("phone") || f.includes("mobile")) return `2547${String(10000000 + index).slice(-8)}`;
  if (f === "password") return DEFAULT_PASSWORD;
  if (f === "role" || f.endsWith("role")) return roles[index % roles.length];
  if (f.includes("currency")) return "KES";
  if (f === "country") return countries[index % countries.length];
  if (f === "city" || f.includes("town")) return cities[index % cities.length];
  if (f.includes("timezone")) return "Africa/Nairobi";
  if (f.includes("url") || f.includes("link") || f.includes("website") || f.includes("video")) return sampleUrl(modelName, index);
  if (f.includes("image") || f === "avatar") return `${sampleUrl(modelName, index)}/image.jpg`;
  if (f.includes("slug")) return `${modelName.toLowerCase()}-test-${index + 1}`;
  if (f.includes("code") || f.includes("reference") || f.includes("number")) return `${modelName.toUpperCase()}-${String(index + 1).padStart(4, "0")}`;
  if (f.includes("title") || f.includes("name")) return `${modelName} Test ${index + 1}`;
  if (f.includes("description") || f.includes("summary") || f.includes("notes") || f.includes("comment") || f.includes("reason")) {
    return `Synthetic ${field} for ${modelName} tenant test record ${index + 1}.`;
  }
  if (f.includes("category")) return "Safari";
  if (f.includes("location") || f.includes("address")) return `${cities[index % cities.length]}, Kenya`;
  return `${field} ${index + 1}`;
}

function numberValue(field, index, pathDef) {
  const min = Number.isFinite(pathDef?.options?.min) ? pathDef.options.min : 0;
  const max = Number.isFinite(pathDef?.options?.max) ? pathDef.options.max : undefined;
  const f = field.toLowerCase();
  let value = index + 1;
  if (/(price|amount|fare|cost|revenue|balance|deposit|fee|commission)/.test(f)) value = 1500 + index * 750;
  else if (/(rating|score)/.test(f)) value = 3 + (index % 5) * 0.5;
  else if (/(percent|discount|rate)/.test(f)) value = 5 + (index % 6) * 5;
  else if (/(capacity|slots|seats|guests|travelers|quantity|count|total)/.test(f)) value = 10 + index;
  else if (/(age)/.test(f)) value = 21 + (index % 35);
  value = Math.max(min, value);
  return max !== undefined ? Math.min(max, value) : value;
}

function dateValue(field, index) {
  const date = new Date();
  const f = field.toLowerCase();
  if (/(travel|start|arrival|checkin|from|due|renew)/.test(f)) date.setDate(date.getDate() + 10 + index);
  else if (/(end|departure|checkout|to)/.test(f)) date.setDate(date.getDate() + 11 + index);
  else date.setDate(date.getDate() - index);
  return date;
}

function valueForPath(model, field, pathDef, index, pools, tenantId, depth = 0) {
  if (SKIP_FIELDS.has(field) || PRIVATE_FIELDS.test(field)) {
    if (!pathDef?.options?.required) return undefined;
  }

  if (field === "tenantId") return tenantId;

  const type = pathDef.instance;
  const refModel = refFor(pathDef);
  if (type === "String") return stringValue(model.modelName, field, index, pathDef);
  if (type === "Number") return numberValue(field, index, pathDef);
  if (type === "Boolean") return index % 2 === 0;
  if (type === "Date") return dateValue(field, index);
  if (type === "ObjectId") {
    if (refModel) {
      const ids = pools.get(refModel) || [];
      if (refModel === "Organization") return tenantId;
      if (ids.length) return ids[index % ids.length];
      return undefined;
    }
    return new mongoose.Types.ObjectId();
  }
  if (type === "Array") {
    const caster = pathDef.caster;
    if (caster?.schema) return [buildSubdoc(caster.schema, model.modelName, index, pools, tenantId, depth + 1)];
    if (caster?.instance === "String") return [stringValue(model.modelName, `${field}Item`, index, caster)];
    if (caster?.instance === "Number") return [numberValue(`${field}Item`, index, caster)];
    if (caster?.instance === "ObjectId") {
      const ids = pools.get(caster.options?.ref) || [];
      return ids.length ? [ids[index % ids.length]] : [];
    }
    return [];
  }
  if (type === "Embedded" && pathDef.schema) return buildSubdoc(pathDef.schema, model.modelName, index, pools, tenantId, depth + 1);
  if (type === "Mixed") return { seeded: true, source: "allTenantsTestDataSeed", index: index + 1 };
  if (refModel) {
    const ids = pools.get(refModel) || [];
    return ids[index % Math.max(1, ids.length)];
  }
  return undefined;
}

function buildSubdoc(schema, modelName, index, pools, tenantId, depth = 0) {
  if (!schema || depth > 2) return {};
  const result = {};
  for (const [field, def] of Object.entries(schema.paths || {})) {
    if (SKIP_FIELDS.has(field) || field === "_id") continue;
    if (!def.options?.required && depth > 0) continue;
    const value = valueForPath({ modelName, schema }, field, def, index, pools, tenantId, depth + 1);
    if (value !== undefined) result[field] = value;
  }
  return result;
}

async function loadModels() {
  const entries = await fs.readdir(MODEL_DIR, { withFileTypes: true });
  const imported = [];
  for (const entry of entries.filter((item) => item.isFile() && item.name.endsWith(".js"))) {
    try {
      const importedModule = await import(pathToFileURL(path.join(MODEL_DIR, entry.name)).href);
      if (isModel(importedModule.default)) imported.push(importedModule.default);
      for (const value of Object.values(importedModule)) if (isModel(value) && !imported.includes(value)) imported.push(value);
    } catch (error) {
      console.warn(`MODEL_IMPORT_SKIPPED ${entry.name}: ${error.message}`);
    }
  }
  return imported.sort((a, b) => a.modelName.localeCompare(b.modelName));
}

async function getPools(models, tenantId) {
  const pools = new Map();
  for (const model of models) {
    const load = async () => model.find({}).select("_id").limit(TARGET_COUNT).lean();
    const rows = isGlobal(model)
      ? await runWithTenant({ role: "super_admin", bypass: true }, load)
      : await runWithTenant({ tenantId, role: "admin" }, load);
    pools.set(model.modelName, rows.map((row) => row._id));
  }
  return pools;
}

async function createForModel(model, tenantId, pools) {
  const scoped = !isGlobal(model);
  const work = async () => {
    const current = await model.countDocuments({});
    if (current >= TARGET_COUNT) return { created: 0, count: current, blocked: false };

    let created = 0;
    for (let index = current; index < TARGET_COUNT; index += 1) {
      const doc = new model();
      if (scoped) doc.set("tenantId", tenantId);
      let blocked = false;

      for (const [field, def] of Object.entries(model.schema.paths || {})) {
        if (field === "_id" || field === "__v" || SKIP_FIELDS.has(field)) continue;
        const refModel = refFor(def);
        const required = Boolean(def.options?.required);
        if (refModel && required && refModel !== "Organization" && !(pools.get(refModel) || []).length) {
          blocked = true;
          break;
        }
        const value = valueForPath(model, field, def, index, pools, tenantId);
        if (value !== undefined && (doc.get(field) === undefined || required)) doc.set(field, value);
      }

      if (model.modelName === "User") {
        doc.set("password", DEFAULT_PASSWORD);
        doc.set("role", roles[index % roles.length]);
        doc.set("status", "active");
        doc.set("isVerified", true);
        doc.set("phone", `254700${String(index + 1).padStart(6, "0")}`);
        doc.set("email", `test-${String(tenantId).slice(-6)}-${index + 1}@example.test`);
      }

      if (model.modelName === "Tour") {
        doc.set("published", true);
        doc.set("available", true);
        doc.set("status", "upcoming");
        doc.set("date", dateValue("date", index));
        doc.set("price", 5000 + index * 1000);
      }

      if (model.modelName === "Booking") {
        const tourIds = pools.get("Tour") || [];
        if (!tourIds.length) blocked = true;
        else {
          doc.set("tour", tourIds[index % tourIds.length]);
          doc.set("travelDate", dateValue("travelDate", index));
          const total = 5000 + index * 500;
          doc.set("subtotal", total);
          doc.set("totalAmount", total);
          doc.set("depositAmount", Math.round(total * 0.5));
          doc.set("balanceAmount", Math.round(total * 0.5));
          doc.set("paymentStatus", "partial");
          doc.set("status", index % 2 === 0 ? "confirmed" : "pending");
          doc.set("contact", {
            name: `Test Traveler ${index + 1}`,
            email: `traveler-${String(tenantId).slice(-6)}-${index + 1}@example.test`,
            phone: `254711${String(index + 1).padStart(6, "0")}`
          });
          doc.set("travelers", [{
            name: `Traveler ${index + 1}",
            age: 25 + (index % 25),
            gender: index % 2 === 0 ? "male" : "female",
            nationality: "Kenyan",
            passportNumber: `TEST${String(index + 1).padStart(6, "0")}`,
            emergencyContactName: "Test Contact",
            emergencyContactPhone: "254722000000",
            dietaryRequirements: "None",
            medicalConditions: "None"
          }]);
        }
      }

      if (model.modelName === "Campaign") {
        const userIds = pools.get("User") || [];
        if (!userIds.length) blocked = true;
        else {
          doc.set("createdBy", userIds[index % userIds.length]);
          doc.set("message", `Tenant test campaign message ${index + 1}.`);
          doc.set("name", `Tenant Test Campaign ${index + 1}`);
          doc.set("status", "draft");
        }
      }

      if (blocked) continue;

      try {
        await doc.save();
        created += 1;
        const id = doc._id;
        const list = pools.get(model.modelName) || [];
        list.push(id);
        pools.set(model.modelName, list.slice(0, TARGET_COUNT));
      } catch (error) {
        if (index === TARGET_COUNT - 1 && created === 0) {
          return { created, count: await model.countDocuments({}), blocked: true, error: error.message };
        }
      }
    }

    return { created, count: await model.countDocuments({}), blocked: created === 0 };
  };

  return scoped
    ? runWithTenant({ tenantId, role: "admin" }, work)
    : runWithTenant({ role: "super_admin", bypass: true }, work);
}

async function seedTenant(models, tenant) {
  const tenantId = tenant._id;
  const results = [];
  let pools = await getPools(models, tenantId);

  for (let pass = 1; pass <= Math.max(3, models.length); pass += 1) {
    let progress = false;
    for (const model of models) {
      if (model.modelName === "Organization" || model.modelName === "Permission" || model.modelName === "Currency") continue;
      const result = await createForModel(model, tenantId, pools);
      results.push({ pass, model: model.modelName, ...result });
      if (result.created > 0) progress = true;
    }
    pools = await getPools(models, tenantId);
    const pending = [];
    for (const model of models) {
      if (isGlobal(model)) continue;
      const count = pools.get(model.modelName)?.length || 0;
      if (count < TARGET_COUNT) pending.push(model.modelName);
    }
    if (!pending.length || !progress) break;
    await sleep(25);
  }

  const finalCounts = {};
  for (const model of models) {
    const read = async () => model.countDocuments({});
    finalCounts[model.modelName] = isGlobal(model)
      ? await runWithTenant({ role: "super_admin", bypass: true }, read)
      : await runWithTenant({ tenantId, role: "admin" }, read);
  }

  return { tenantId: String(tenantId), name: tenant.name, counts: finalCounts, results };
}

async function main() {
  if (!ALLOW_TEST_SEED) throw new Error("Refusing to seed. Set ALLOW_TEST_SEED=true explicitly.");
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is missing.");

  await mongoose.connect(mongoUri);
  try {
    const models = await loadModels();
    if (!models.length) throw new Error("No Mongoose models were loaded.");
    const Organization = mongoose.models.Organization;
    if (!Organization) throw new Error("Organization model is required.");

    const tenants = await runWithTenant(
      { role: "super_admin", bypass: true },
      () => Organization.find({ status: "active" }).sort({ createdAt: 1 }).lean()
    );
    if (!tenants.length) throw new Error("No active registered tenants were found.");

    const summaries = [];
    for (const tenant of tenants) summaries.push(await seedTenant(models, tenant));

    const tenantScopedModels = models.filter((model) => !isGlobal(model)).map((model) => model.modelName);
    const complete = summaries.every((tenant) => tenantScopedModels.every((modelName) => Number(tenant.counts[modelName] || 0) >= TARGET_COUNT));

    console.log(JSON.stringify({
      success: complete,
      targetCount: TARGET_COUNT,
      tenantsProcessed: summaries.length,
      tenantScopedModels: tenantScopedModels.length,
      tenants: summaries,
      message: complete
        ? "Comprehensive test data is populated independently for every active registered tenant."
        : "Tenant-aware seeding completed as far as schema dependencies allowed; inspect per-model counts for remaining blockers."
    }, null, 2));

    if (!complete) process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("All-tenant test seed failed:", error.message);
  process.exitCode = 1;
});
