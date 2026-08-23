import mongoose from "mongoose";
import env from "../config/env.js";
import "../tenancy/bootstrap.js";

const tenantModels = [
  "AIConversation", "AITask", "Agent", "AuditLog", "Booking", "Campaign", "Commission", "Coupon",
  "CustomTourRequest", "Customer", "CustomerProfile", "DatabaseBackup", "Destination", "Gallery", "HeroSlide",
  "Invoice", "Itinerary", "Loyalty", "Media", "Notification", "Payment", "Promotion", "Quotation", "Referral",
  "Refund", "RefundAudit", "Review", "Role", "SecurityLog", "Staff", "StaffProfile", "SystemSetting",
  "SystemSettings", "Tour", "TourCategory", "TourGallery", "TourPackage", "TourReport", "User", "UserPreference",
  "Vehicle", "WalletTransaction", "Wishlist",
];

const dryRun = process.argv.includes("--dry-run");

async function loadModels() {
  const loaded = [];
  for (const name of tenantModels) {
    try {
      const module = await import(`../models/${name}.js`);
      if (module.default?.schema?.path("tenantId")) loaded.push(module.default);
    } catch (error) {
      console.warn(`[skip] ${name}: ${error.message}`);
    }
  }
  return loaded;
}

function indexKey(index) {
  return Object.entries(index.key || {})
    .map(([field, direction]) => `${field}:${direction}`)
    .join(",");
}

function isSingleFieldUnique(index) {
  return Boolean(index.unique) && Object.keys(index.key || {}).length === 1;
}

function schemaTenantUniqueFields(Model) {
  const fields = new Set();
  for (const [key, options] of Model.schema.indexes()) {
    if (!options?.unique) continue;
    const entries = Object.entries(key);
    if (entries.length === 2 && entries[0][0] === "tenantId" && entries[0][1] === 1 && entries[1][1] === 1) {
      fields.add(entries[1][0]);
    }
  }
  return fields;
}

await mongoose.connect(env.MONGODB_URI);

try {
  const models = await loadModels();
  let plannedDrops = 0;
  let created = 0;

  console.log(`Tenant index reconciliation ${dryRun ? "(DRY RUN)" : "(WRITE MODE)"}`);

  for (const Model of models) {
    const collection = Model.collection;
    const dbIndexes = await collection.listIndexes().toArray();
    const tenantUniqueFields = schemaTenantUniqueFields(Model);

    // A tenantId-only unique index is never valid on a tenant-scoped
    // collection: every tenant must be able to own many records. Older
    // migrations accidentally created this index and it blocks the second
    // staff/driver/guide record for the same company.
    for (const dbIndex of dbIndexes) {
      if (!isSingleFieldUnique(dbIndex)) continue;
      const field = Object.keys(dbIndex.key || {})[0];

      if (field === "tenantId" || tenantUniqueFields.has(field)) {
        plannedDrops += 1;
        console.log(`[drop] ${Model.modelName}.${dbIndex.name} (${field} unique globally)`);
        if (!dryRun) await collection.dropIndex(dbIndex.name);
      }
    }

    const currentAfterDrops = dryRun ? dbIndexes : await collection.listIndexes().toArray();
    const currentKeys = new Set(currentAfterDrops.map(indexKey));

    for (const [key, options] of Model.schema.indexes()) {
      const normalized = indexKey({ key });
      if (currentKeys.has(normalized)) continue;
      if (options?.unique && Object.keys(key).length === 2 && key.tenantId === 1) {
        created += 1;
        console.log(`[create] ${Model.modelName}.${normalized}`);
        if (!dryRun) await collection.createIndex(key, options);
      }
    }
  }

  console.log(`\nPlanned global-unique removals: ${plannedDrops}`);
  console.log(`Tenant compound indexes requiring creation: ${created}`);
  if (dryRun) console.log("No database changes were made.");
} finally {
  await mongoose.disconnect();
}
