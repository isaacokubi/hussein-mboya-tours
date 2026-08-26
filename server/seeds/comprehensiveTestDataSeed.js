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
const GLOBAL_MODEL_NAMES = new Set(["Organization", "Permission", "Currency"]);
const PRIVATE_FIELD_RE = /(token|secret|reset|pinHash|passwordReset|loginPin|apiKey|accessToken|refreshToken|hash)$/i;
const SKIP_OPTIONAL_FIELDS = new Set(["_id", "__v", "deletedAt", "deletedBy", "lockUntil", "passwordResetCodeHash", "passwordResetExpiresAt", "passwordResetAttempts", "loginPinHash", "loginPinExpiresAt", "loginPinAttempts", "loginPinLastSentAt"]);

const roleCycle = ["customer", "agent", "tour_guide", "tour_manager", "manager", "driver", "travel_agent"];
const statusWords = ["active", "confirmed", "upcoming", "pending", "completed", "paid", "scheduled", "ongoing"];
const seasons = ["Spring", "Summer", "Autumn", "Winter", "All Year"];
const countries = ["Kenya", "Tanzania", "Uganda", "Rwanda", "South Africa", "Botswana", "Namibia", "Zambia", "Zimbabwe", "Morocco"];
const cities = ["Nairobi", "Arusha", "Kampala", "Kigali", "Cape Town", "Gaborone", "Windhoek", "Lusaka", "Victoria Falls", "Marrakesh"];

function isModel(value) {
  return Boolean(value?.modelName && value?.schema && value?.collection);
}

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function pickEnum(pathDef, index) {
  const values = pathDef?.enumValues || pathDef?.options?.enum || [];
  return values.length ? values[index % values.length] : undefined;
}

function refForPath(pathDef) {
  return pathDef?.options?.ref || pathDef?.caster?.options?.ref || null;
}

function sampleUrl(modelName, index) {
  return `https://example.com/test-data/${slug(modelName)}/${index + 1}`;
}

function stringValue(modelName, field, index, pathDef) {
  const enumValue = pickEnum(pathDef, index);
  if (enumValue !== undefined) return enumValue;

  const f = field.toLowerCase();
  if (f.includes("email")) return `${slug(modelName)}${index + 1}@example.test`;
  if (f.includes("phone") || f.includes("mobile")) return `254700${String(index + 1).padStart(6, "0")}`;
  if (f.includes("password")) return DEFAULT_PASSWORD;
  if (f === "role" || f.endsWith("role")) return roleCycle[index % roleCycle.length];
  if (f.includes("currency")) return "KES";
  if (f === "country") return countries[index % countries.length];
  if (f === "city" || f.includes("town")) return cities[index % cities.length];
  if (f.includes("timezone")) return "Africa/Nairobi";
  if (f.includes("url") || f.includes("link") || f.includes("website") || f.includes("video")) return sampleUrl(modelName, index);
  if (f.includes("image") || f === "avatar") return sampleUrl(modelName, index) + "/image.jpg";
  if (f.includes("slug")) return `${slug(modelName)}-${index + 1}`;
  if (f.includes("code") || f.includes("reference") || f.includes("number")) return `${slug(modelName).toUpperCase()}-${String(index + 1).padStart(4, "0")}`;
  if (f.includes("title") || f.includes("name")) return `${modelName} Test ${index + 1}`;
  if (f.includes("description") || f.includes("summary") || f.includes("notes") || f.includes("comment")) return `Synthetic ${field} for ${modelName} test record ${index + 1}.`;
  if (f.includes("category")) return "Safari";
  if (f.includes("season")) return seasons[index % seasons.length];
  if (f.includes("status")) return statusWords[index % statusWords.length];
  if (f.includes("location") || f.includes("address")) return `${cities[index % cities.length]}, Kenya`;
  return `${field} ${index + 1}`;
}

function numberValue(field, index, pathDef) {
  const min = Number.isFinite(pathDef?.options?.min) ? pathDef.options.min : 0;
  const max = Number.isFinite(pathDef?.options?.max) ? pathDef.options.max : undefined;
  const f = field.toLowerCase();
  let value = min;
  if (/(price|amount|fare|cost|revenue|balance|deposit|fee|commission)/.test(f)) value = 1500 + index * 750;
  else if (/(rating|score)/.test(f)) value = 3 + (index % 3) * 0.5;
  else if (/(percent|discount|rate)/.test(f)) value = 5 + (index % 6) * 5;
  else if (/(capacity|slots|seats|guests|travelers|quantity|count|total)/.test(f)) value = 10 + index;
  else if (/(age)/.test(f)) value = 21 + (index % 35);
  else value = index + 1;
  if (value < min) value = min;
  if (max !== undefined && value > max) value = max;
  return value;
}

function dateValue(field, index) {
  const now = new Date();
  const f = field.toLowerCase();
  const date = new Date(now);
  if (/(travel|start|arrival|checkin|from|due|renew)/.test(f)) date.setDate(date.getDate() + 10 + index);
  else if (/(end|departure|checkout|to)/.test(f)) date.setDate(date.getDate() + 11 + index);
  else date.setDate(date.getDate() - index);
  return date;
}

function buildSubdoc(schema, modelName, index, depth = 0) {
  if (!schema || depth > 2) return {};
  const result = {};
  for (const [field, def] of Object.entries(schema.paths || {})) {
    if (SKIP_OPTIONAL_FIELDS.has(field) || field === "_id") continue;
    if (!def.options?.required && depth > 0) continue;
    const value = valueForPath(modelName, field, def, index, depth + 1);
    if (value !== undefined) result[field] = value;
  }
  return result;
}

function valueForPath(modelName, field, pathDef, index, depth = 0) {
  if (SKIP_OPTIONAL_FIELDS.has(field) || PRIVATE_FIELD_RE.test(field)) {
    if (!pathDef?.options?.required) return undefined;
  }

  const instance = pathDef.instance;
  const ref = refForPath(pathDef);

  if (instance === "String") {
    return stringValue(modelName, field, index, pathDef);
  }
  if (instance === "Number") return numberValue(field, index, pathDef);
  if (instance === "Boolean") return index % 2 === 0;
  if (instance === "Date") return dateValue(field, index);
  if (instance === "ObjectId") return new mongoose.Types.ObjectId();
  if (instance === "Array") {
    const caster = pathDef.caster;
    if (caster?.schema) return [buildSubdoc(caster.schema, modelName, index, depth)];
    if (caster?.instance === "String") return [stringValue(modelName, `${field}Item`, index, caster)];
    if (caster?.instance === "Number") return [numberValue(`${field}Item`, index, caster)];
    if (caster?.instance === "ObjectId") return [new mongoose.Types.ObjectId()];
    return [];
  }
  if (instance === "Embedded" && pathDef.schema) return buildSubdoc(pathDef.schema, modelName, index, depth);
  if (instance === "Mixed") return { seeded: true, source: "comprehensiveTestDataSeed", index: index + 1 };
  if (ref && !pathDef?.options?.required) return new mongoose.Types.ObjectId();
  return undefined;
}

async function loadModels() {
  const entries = await fs.readdir(MODEL_DIR, { withFileTypes: true });
  const files = entries.filter((entry) => entry.isFile() && entry.name.endsWith(".js"));
  const imported = [];
  for (const file of files) {
    const modulePath = pathToFileURL(path.join(MODEL_DIR, file.name)).href;
    try {
      const mod = await import(modulePath);
      if (isModel(mod.default)) imported.push(mod.default);
      for (const value of Object.values(mod)) {
        if (isModel(value) && !imported.includes(value)) imported.push(value);
      }
    } catch (error) {
      console.warn(`MODEL_IMPORT_SKIPPED ${file.name}: ${error.message}`);
    }
  }
  return imported.sort((a, b) => a.modelName.localeCompare(b.modelName));
}

function modelUsesTenant(model) {
  return Boolean(model.schema.path("tenantId")) && !GLOBAL_MODEL_NAMES.has(model.modelName);
}

async function ensureModelCount(model, tenantId) {
  const work = async () => {
    const current = await model.countDocuments({});
    if (current >= TARGET_COUNT) return { created: 0, count: current };

    let created = 0;
    for (let i = current; i < TARGET_COUNT; i += 1) {
      let saved = false;
      for (let attempt = 0; attempt < 5 && !saved; attempt += 1) {
        const doc = new model();
        for (const [field, pathDef] of Object.entries(model.schema.paths || {})) {
          if (field === "_id" || field === "__v" || SKIP_OPTIONAL_FIELDS.has(field)) continue;
          const needsValue = pathDef.options?.required || ["String", "Number", "Date"].includes(pathDef.instance) && ["name", "title", "email", "phone", "slug", "description", "status", "category", "country", "location", "amount", "price", "currency", "code", "reference", "number"].some((hint) => field.toLowerCase().includes(hint));
          if (!needsValue && doc.get(field) !== undefined) continue;
          const value = valueForPath(model.modelName, field, pathDef, i + attempt, 0);
          if (value !== undefined) doc.set(field, value);
        }
        if (model.modelName === "User") {
          doc.set("password", DEFAULT_PASSWORD);
          doc.set("role", roleCycle[i % roleCycle.length]);
          doc.set("status", "active");
          doc.set("phone", `254700${String(i + 1).padStart(6, "0")}`);
        }
        if (model.modelName === "Organization") {
          doc.set("name", `Coherent Tours Test Organization ${i + 1}`);
          doc.set("slug", `coherent-tours-test-org-${i + 1}`);
          doc.set("status", "active");
          doc.set("country", "Kenya");
          doc.set("timezone", "Africa/Nairobi");
          doc.set("currency", "KES");
        }
        try {
          await doc.save();
          created += 1;
          saved = true;
        } catch (error) {
          if (attempt === 4) throw new Error(`${model.modelName} seed failed at record ${i + 1}: ${error.message}`);
        }
      }
    }
    return { created, count: await model.countDocuments({}) };
  };

  return modelUsesTenant(model)
    ? runWithTenant({ tenantId, role: "admin" }, work)
    : runWithTenant({ role: "super_admin", bypass: true }, work);
}

async function relinkReferences(models, tenantId) {
  const pools = new Map();
  for (const model of models) {
    const load = async () => model.find({}).select("_id").limit(TARGET_COUNT).lean();
    const rows = modelUsesTenant(model)
      ? await runWithTenant({ tenantId, role: "admin" }, load)
      : await runWithTenant({ role: "super_admin", bypass: true }, load);
    pools.set(model.modelName, rows.map((row) => row._id));
  }

  for (const source of models) {
    const referencePaths = Object.entries(source.schema.paths || {}).filter(([, def]) => refForPath(def));
    if (!referencePaths.length) continue;

    const updateSource = async () => {
      const docs = await source.find({}).limit(TARGET_COUNT);
      for (let index = 0; index < docs.length; index += 1) {
        const doc = docs[index];
        let changed = false;
        for (const [field, def] of referencePaths) {
          const refModel = refForPath(def);
          const ids = pools.get(refModel) || [];
          if (!ids.length) continue;
          if (def.instance === "Array") {
            if (def.caster?.instance === "ObjectId" && ids.length) {
              const current = doc.get(field);
              if (!Array.isArray(current) || !current.length) {
                doc.set(field, [ids[index % ids.length]]);
                changed = true;
              }
            }
          } else if (def.instance === "ObjectId") {
            const current = doc.get(field);
            if (!current) {
              doc.set(field, ids[index % ids.length]);
              changed = true;
            }
          }
        }
        if (changed) await doc.save();
      }
    };

    if (modelUsesTenant(source)) await runWithTenant({ tenantId, role: "admin" }, updateSource);
    else await runWithTenant({ role: "super_admin", bypass: true }, updateSource);
  }
}

async function main() {
  if (!ALLOW_TEST_SEED) {
    throw new Error("Refusing to seed. Set ALLOW_TEST_SEED=true explicitly for test data generation.");
  }

  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) throw new Error("MONGODB_URI is missing.");

  await mongoose.connect(mongoUri);
  const models = await loadModels();
  if (!models.length) throw new Error("No Mongoose models were loaded from server/models.");

  const Organization = mongoose.models.Organization;
  if (!Organization) throw new Error("Organization model is required for tenant-aware test data.");

  await runWithTenant({ role: "super_admin", bypass: true }, async () => {
    const count = await Organization.countDocuments({});
    for (let i = count; i < TARGET_COUNT; i += 1) {
      await Organization.create({
        name: `Coherent Tours Test Organization ${i + 1}`,
        slug: `coherent-tours-test-org-${i + 1}`,
        legalName: `Coherent Tours Test Organization ${i + 1} Ltd`,
        supportEmail: `support${i + 1}@coherenttours.test`,
        supportPhone: `254700${String(i + 1).padStart(6, "0")}`,
        address: `${cities[i % cities.length]}, Kenya`,
        country: "Kenya",
        timezone: "Africa/Nairobi",
        currency: "KES",
        status: "active",
        subscription: { plan: "professional", seats: 50, trialEndsAt: null, renewsAt: dateValue("renewsAt", i) },
        features: { payments: true, mpesa: true, stripe: true, ai: true, customDomain: false },
      });
    }
  });

  const organizations = await runWithTenant({ role: "super_admin", bypass: true }, () => Organization.find({}).sort({ createdAt: 1 }).limit(TARGET_COUNT).lean());
  const tenantId = organizations[0]?._id;
  if (!tenantId) throw new Error("Unable to establish a test tenant.");

  const summary = [];
  for (const model of models) {
    if (model.modelName === "Organization") {
      summary.push({ model: model.modelName, count: await Organization.countDocuments({}), created: 0 });
      continue;
    }
    const result = await ensureModelCount(model, tenantId);
    summary.push({ model: model.modelName, count: result.count, created: result.created });
  }

  await relinkReferences(models, tenantId);

  const finalCounts = {};
  for (const model of models) {
    const read = async () => model.countDocuments({});
    finalCounts[model.modelName] = modelUsesTenant(model)
      ? await runWithTenant({ tenantId, role: "admin" }, read)
      : await runWithTenant({ role: "super_admin", bypass: true }, read);
  }

  console.log(JSON.stringify({
    success: true,
    targetCount: TARGET_COUNT,
    tenantId: String(tenantId),
    modelsAudited: models.length,
    modelsAtOrAboveTarget: Object.values(finalCounts).filter((count) => count >= TARGET_COUNT).length,
    counts: finalCounts,
    created: summary.reduce((sum, item) => sum + item.created, 0),
    message: "Comprehensive test data seeded across every loadable Mongoose model, with tenant-aware references repaired."
  }, null, 2));
}

main()
  .catch((error) => {
    console.error("Comprehensive test seed failed:", error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
