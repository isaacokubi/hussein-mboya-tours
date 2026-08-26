import "dotenv/config";
import fs from "fs/promises";
import path from "path";
import { pathToFileURL } from "url";
import mongoose from "mongoose";
import { runWithTenant } from "../tenancy/context.js";

const TARGET = Math.max(10, Number(process.env.TEST_SEED_COUNT || 10));
const ALLOW = String(process.env.ALLOW_TEST_SEED || "false").toLowerCase() === "true";
const PASSWORD = process.env.TEST_SEED_PASSWORD || "TestPassword123!";
const MODEL_DIR = path.resolve(process.cwd(), "models");
const GLOBALS = new Set(["Organization", "Permission", "Currency"]);
const SKIP = new Set([
  "_id", "__v", "deletedAt", "deletedBy", "lockUntil",
  "passwordResetCodeHash", "passwordResetExpiresAt", "passwordResetAttempts",
  "loginPinHash", "loginPinExpiresAt", "loginPinAttempts", "loginPinLastSentAt", "$*"
]);
const PRIVATE = /(token|secret|reset|pinHash|passwordReset|loginPin|apiKey|accessToken|refreshToken|hash)$/i;
const ROLES = ["customer", "agent", "tour_guide", "tour_manager", "manager", "driver", "travel_agent"];
const CITIES = ["Nairobi", "Mombasa", "Arusha", "Kampala", "Kigali", "Cape Town", "Gaborone", "Windhoek", "Lusaka", "Marrakesh"];
const COUNTRIES = ["Kenya", "Tanzania", "Uganda", "Rwanda", "South Africa", "Botswana", "Namibia", "Zambia", "Zimbabwe", "Morocco"];

const isModel = (v) => Boolean(v?.modelName && v?.schema && v?.collection);
const isGlobal = (m) => GLOBALS.has(m.modelName) || !m.schema.path("tenantId");
const refFor = (d) => d?.options?.ref || d?.caster?.options?.ref || null;
const isMapWildcard = (field) => field === "$*" || field.endsWith(".$*");
const enumFor = (d, i) => {
  const values = d?.enumValues || d?.options?.enum || [];
  return values.length ? values[i % values.length] : undefined;
};

function tenantToken(tenantId) {
  return String(tenantId).replace(/[^a-z0-9]/gi, "").slice(-10).toLowerCase();
}

function textValue(model, field, i, def, tenantId) {
  const enumValue = enumFor(def, i);
  if (enumValue !== undefined) return enumValue;
  const f = field.toLowerCase();
  const token = tenantToken(tenantId);
  if (f === "email") return `${model.toLowerCase()}-${token}-${i + 1}@test.example`;
  if (f.includes("phone") || f.includes("mobile")) return `0700${String(i + 1).padStart(6, "0")}`;
  if (f.includes("currency")) return "KES";
  if (f === "country") return COUNTRIES[i % COUNTRIES.length];
  if (f === "city" || f.includes("town")) return CITIES[i % CITIES.length];
  if (f.includes("timezone")) return "Africa/Nairobi";
  if (f.includes("url") || f.includes("link") || f.includes("website") || f.includes("video")) return `https://example.com/${model.toLowerCase()}/${token}/${i + 1}`;
  if (f.includes("image") || f === "avatar") return `https://example.com/${model.toLowerCase()}/${token}/${i + 1}.jpg`;
  if (f.includes("slug")) return `${model.toLowerCase()}-${token}-${i + 1}`;
  if (f.includes("code") || f.includes("reference") || f.includes("number")) return `${model.toUpperCase()}-${token}-${String(i + 1).padStart(4, "0")}`;
  if (f.includes("title") || f.includes("name")) return `${model} Test ${i + 1}`;
  if (f.includes("description") || f.includes("summary") || f.includes("notes") || f.includes("comment") || f.includes("reason")) return `Synthetic ${field} for ${model} tenant ${token} record ${i + 1}.`;
  if (f.includes("location") || f.includes("address")) return `${CITIES[i % CITIES.length]}, Kenya`;
  return `${field} ${token} ${i + 1}`;
}

function numberValue(field, i, def, tenantId) {
  const min = Number.isFinite(def?.options?.min) ? def.options.min : 0;
  const max = Number.isFinite(def?.options?.max) ? def.options.max : undefined;
  const f = field.toLowerCase();
  const tokenNumber = parseInt(tenantToken(tenantId).slice(-5), 36) || 1;
  let value = i + 1 + tokenNumber;
  if (/(price|amount|fare|cost|revenue|balance|deposit|fee|commission)/.test(f)) value = 1500 + i * 500 + tokenNumber;
  else if (/(rating|score)/.test(f)) value = 3 + (i % 5) * 0.5;
  else if (/(percent|discount|rate)/.test(f)) value = 5 + (i % 6) * 5;
  else if (/(capacity|slots|seats|guests|travelers|quantity|count|total)/.test(f)) value = 10 + i;
  else if (f.includes("age")) value = 21 + (i % 35);
  value = Math.max(min, value);
  return max === undefined ? value : Math.min(max, value);
}

function dateValue(field, i) {
  const d = new Date();
  const f = field.toLowerCase();
  if (/(travel|start|arrival|checkin|from|due|renew)/.test(f)) d.setDate(d.getDate() + 10 + i);
  else if (/(end|departure|checkout|to)/.test(f)) d.setDate(d.getDate() + 11 + i);
  else d.setDate(d.getDate() - i);
  return d;
}

function uniqueSingleFields(model) {
  const fields = new Set();
  for (const [key, options] of model.schema.indexes()) {
    if (!options?.unique) continue;
    const names = Object.keys(key || {});
    if (names.length === 1 && names[0] !== "tenantId") fields.add(names[0]);
  }
  return fields;
}

function tenantOnlyUnique(model) {
  return model.schema.indexes().some(([key, options]) => {
    const names = Object.keys(key || {});
    return Boolean(options?.unique) && names.length === 1 && names[0] === "tenantId";
  });
}

function buildValue(model, field, def, i, pools, tenantId, depth = 0) {
  if (SKIP.has(field) || isMapWildcard(field) || PRIVATE.test(field)) return undefined;
  if (field === "tenantId") return tenantId;
  const ref = refFor(def);
  if (def.instance === "String") return textValue(model.modelName, field, i, def, tenantId);
  if (def.instance === "Number") return numberValue(field, i, def, tenantId);
  if (def.instance === "Boolean") return i % 2 === 0;
  if (def.instance === "Date") return dateValue(field, i);
  if (def.instance === "ObjectId") {
    if (ref === "Organization") return tenantId;
    const ids = ref ? (pools.get(ref) || []) : [];
    return ids.length ? ids[i % ids.length] : undefined;
  }
  if (def.instance === "Array") {
    const caster = def.caster;
    if (caster?.instance === "String") return [textValue(model.modelName, `${field}Item`, i, caster, tenantId)];
    if (caster?.instance === "Number") return [numberValue(`${field}Item`, i, caster, tenantId)];
    if (caster?.instance === "ObjectId") {
      const ids = pools.get(caster.options?.ref) || [];
      return ids.length ? [ids[i % ids.length]] : [];
    }
    if (caster?.schema && depth < 2) return [buildSubdoc(caster.schema, model.modelName, i, pools, tenantId, depth + 1)];
    return [];
  }
  if (def.instance === "Map") return new Map();
  if (def.instance === "Embedded" && def.schema && depth < 2) return buildSubdoc(def.schema, model.modelName, i, pools, tenantId, depth + 1);
  if (def.instance === "Mixed") return { seeded: true, source: "allTenantsTestDataSeedV3", tenant: tenantToken(tenantId), index: i + 1 };
  return undefined;
}

function buildSubdoc(schema, modelName, i, pools, tenantId, depth) {
  const out = {};
  for (const [field, def] of Object.entries(schema.paths || {})) {
    if (field === "_id" || SKIP.has(field) || isMapWildcard(field)) continue;
    const value = buildValue({ modelName, schema }, field, def, i, pools, tenantId, depth);
    if (value !== undefined) out[field] = value;
  }
  return out;
}

async function loadModels() {
  const entries = await fs.readdir(MODEL_DIR, { withFileTypes: true });
  const models = [];
  for (const entry of entries.filter((e) => e.isFile() && e.name.endsWith(".js"))) {
    try {
      const mod = await import(pathToFileURL(path.join(MODEL_DIR, entry.name)).href);
      if (isModel(mod.default)) models.push(mod.default);
      for (const value of Object.values(mod)) if (isModel(value) && !models.includes(value)) models.push(value);
    } catch (error) {
      console.warn(`MODEL_IMPORT_SKIPPED ${entry.name}: ${error.message}`);
    }
  }
  return models.sort((a, b) => a.modelName.localeCompare(b.modelName));
}

async function tenantPools(models, tenantId) {
  const pools = new Map();
  for (const model of models) {
    const read = async () => model.find({}).select("_id").limit(TARGET).lean();
    const rows = isGlobal(model)
      ? await runWithTenant({ role: "super_admin", bypass: true }, read)
      : await runWithTenant({ tenantId, role: "admin" }, read);
    pools.set(model.modelName, rows.map((row) => row._id));
  }
  return pools;
}

function enforceGlobalUniqueValues(model, doc, i, tenantId) {
  const fields = uniqueSingleFields(model);
  const token = tenantToken(tenantId);
  for (const field of fields) {
    const current = doc.get(field);
    if (current === undefined || current === null || current === "") continue;
    if (typeof current === "string") {
      doc.set(field, `${current}-${token}`.replace(/--+/g, "-"));
    } else if (typeof current === "number") {
      doc.set(field, current + (parseInt(token.slice(-5), 36) || 1) + i * 10000);
    } else if (field.toLowerCase().includes("id")) {
      doc.set(field, new mongoose.Types.ObjectId());
    }
  }
}

async function createMissing(model, tenantId, pools) {
  if (isGlobal(model)) return { created: 0, count: await model.countDocuments(), skipped: true };
  return runWithTenant({ tenantId, role: "admin" }, async () => {
    const current = await model.countDocuments({});
    const desired = tenantOnlyUnique(model) ? 1 : TARGET;
    if (current >= desired) return { created: 0, count: current, skipped: false };

    const pathEntries = Object.entries(model.schema.paths || {}).filter(([field]) => field !== "_id" && field !== "__v" && !SKIP.has(field) && !isMapWildcard(field));
    let created = 0;

    for (let i = current; i < desired; i += 1) {
      const doc = new model();
      doc.set("tenantId", tenantId);
      let missingDependency = false;

      for (const [field, def] of pathEntries) {
        const ref = refFor(def);
        if (ref && def.options?.required && ref !== "Organization" && !(pools.get(ref) || []).length) {
          missingDependency = true;
          break;
        }
        const value = buildValue(model, field, def, i, pools, tenantId);
        if (value !== undefined) doc.set(field, value);
      }

      if (model.modelName === "User") {
        doc.set("password", PASSWORD);
        doc.set("role", ROLES[i % ROLES.length]);
        if (doc.schema.path("status")) doc.set("status", "active");
        if (doc.schema.path("isVerified")) doc.set("isVerified", true);
        doc.set("phone", `0700${String(i + 1).padStart(6, "0")}`);
        doc.set("email", `user-${tenantToken(tenantId)}-${i + 1}@example.test`);
      }

      if (model.modelName === "Tour") {
        doc.set("published", true);
        doc.set("available", true);
        doc.set("status", "upcoming");
        doc.set("date", dateValue("date", i));
        doc.set("price", 5000 + i * 1000);
        doc.set("slug", `tour-${tenantToken(tenantId)}-${i + 1}`);
      }

      if (model.modelName === "Booking") {
        const tours = pools.get("Tour") || [];
        if (!tours.length) missingDependency = true;
        else {
          doc.set("tour", tours[i % tours.length]);
          const total = 5000 + i * 500;
          doc.set("travelDate", dateValue("travelDate", i));
          doc.set("totalAmount", total);
          doc.set("subtotal", total);
          doc.set("depositAmount", Math.round(total / 2));
          doc.set("balanceAmount", Math.round(total / 2));
          if (doc.schema.path("paymentStatus")) doc.set("paymentStatus", "partial");
          if (doc.schema.path("status")) doc.set("status", i % 2 ? "pending" : "confirmed");
        }
      }

      if (model.modelName === "Campaign") {
        const users = pools.get("User") || [];
        if (!users.length) missingDependency = true;
        else {
          doc.set("createdBy", users[i % users.length]);
          if (doc.schema.path("name")) doc.set("name", `Tenant ${tenantToken(tenantId)} Test Campaign ${i + 1}`);
          if (doc.schema.path("message")) doc.set("message", `Tenant test campaign message ${i + 1}.`);
          if (doc.schema.path("status")) doc.set("status", "draft");
        }
      }

      enforceGlobalUniqueValues(model, doc, i, tenantId);
      if (missingDependency) continue;

      try {
        await doc.save();
        created += 1;
        const ids = pools.get(model.modelName) || [];
        if (ids.length < TARGET) pools.set(model.modelName, [...ids, doc._id]);
      } catch (error) {
        console.warn(`SEED_SKIP ${model.modelName} tenant=${tenantToken(tenantId)} record=${i + 1}: ${error.message}`);
      }
    }

    return { created, count: await model.countDocuments({}), skipped: false };
  });
}

async function seedTenant(models, tenant) {
  let pools = await tenantPools(models, tenant._id);
  const passes = [];
  for (let pass = 1; pass <= models.length + 3; pass += 1) {
    let progress = 0;
    for (const model of models) {
      if (isGlobal(model)) continue;
      const result = await createMissing(model, tenant._id, pools);
      progress += result.created || 0;
    }
    passes.push({ pass, progress });
    pools = await tenantPools(models, tenant._id);

    const incomplete = models.some((model) => {
      if (isGlobal(model)) return false;
      const minimum = tenantOnlyUnique(model) ? 1 : TARGET;
      return (pools.get(model.modelName)?.length || 0) < minimum;
    });
    if (!incomplete || progress === 0) break;
  }

  const counts = {};
  for (const model of models.filter((item) => !isGlobal(item))) {
    counts[model.modelName] = await runWithTenant({ tenantId: tenant._id, role: "admin" }, () => model.countDocuments({}));
  }
  return { tenantId: String(tenant._id), tenantName: tenant.name, counts, passes };
}

async function main() {
  if (!ALLOW) throw new Error("Set ALLOW_TEST_SEED=true to run test data seeding.");
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  if (!mongoUri) throw new Error("MONGODB_URI or MONGO_URI is missing.");
  await mongoose.connect(mongoUri);

  try {
    const models = await loadModels();
    const Organization = mongoose.models.Organization;
    if (!Organization) throw new Error("Organization model is required.");

    const tenants = await runWithTenant(
      { role: "super_admin", bypass: true },
      () => Organization.find({ status: "active" }).sort({ createdAt: 1 }).lean()
    );
    if (!tenants.length) throw new Error("No active registered tenants found.");

    const summaries = [];
    for (const tenant of tenants) summaries.push(await seedTenant(models, tenant));

    const tenantModels = models.filter((model) => !isGlobal(model));
    const complete = summaries.every((summary) => tenantModels.every((model) => {
      const required = tenantOnlyUnique(model) ? 1 : TARGET;
      return Number(summary.counts[model.modelName] || 0) >= required;
    }));

    console.log(JSON.stringify({
      success: complete,
      targetPerTenant: TARGET,
      tenantsProcessed: summaries.length,
      tenantScopedModels: tenantModels.length,
      tenants: summaries,
      message: complete
        ? "Test data populated independently for every active registered tenant with globally unique fixture identifiers."
        : "Seeding completed with unresolved model dependencies or constraints; inspect SEED_SKIP warnings and tenant counts above."
    }, null, 2));

    if (!complete) process.exitCode = 2;
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error(`All-tenant test seed failed: ${error.message}`);
  process.exitCode = 1;
});