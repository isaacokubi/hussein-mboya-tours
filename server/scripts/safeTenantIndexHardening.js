import fs from "fs";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { execFileSync } from "child_process";
import mongoose from "mongoose";
import env from "../config/env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SERVER_ROOT = path.resolve(__dirname, "..");
const MODELS_DIR = path.join(SERVER_ROOT, "models");

const TENANT_ID_STRING = "6a876d12a0bc937f083ba25a";
const tenantId = new mongoose.Types.ObjectId(TENANT_ID_STRING);

/*
|--------------------------------------------------------------------------
| SAFETY
|--------------------------------------------------------------------------
|
| This script NEVER updates/deletes/inserts application documents.
|
| It may:
|   - edit model source files to remove known duplicate index declarations
|   - create/drop MongoDB indexes
|
|--------------------------------------------------------------------------
*/

const DRY_RUN =
  String(process.env.TENANT_INDEX_DRY_RUN || "false").toLowerCase() ===
  "true";

const BACKUP_DIR = path.join(
  SERVER_ROOT,
  `.tenant-index-backup-${Date.now()}`
);

/*
|--------------------------------------------------------------------------
| Tenant-scoped uniqueness
|--------------------------------------------------------------------------
|
| These are the fields already established as tenant-scoped in the
| database/application architecture.
|
|--------------------------------------------------------------------------
*/

const TENANT_UNIQUE_FIELDS = {
  User: [
    {
      field: "email",
      options: { unique: true }
    },
    {
      field: "referralCode",
      options: { unique: true, sparse: true }
    }
  ],

  Staff: [
    {
      field: "email",
      options: { unique: true }
    },
    {
      field: "employeeNumber",
      options: {
        unique: true,
        partialFilterExpression: {
          employeeNumber: {
            $type: "string",
            $gt: ""
          }
        }
      }
    }
  ],

  Destination: [
    {
      field: "slug",
      options: { unique: true }
    }
  ],

  Tour: [
    {
      field: "slug",
      options: { unique: true }
    }
  ],

  TourCategory: [
    {
      field: "slug",
      options: { unique: true }
    }
  ],

  Vehicle: [
    {
      field: "registrationNumber",
      options: { unique: true }
    }
  ],

  Wishlist: [
    {
      field: "user",
      options: { unique: true }
    }
  ]
};

/*
|--------------------------------------------------------------------------
| Known duplicate schema indexes
|--------------------------------------------------------------------------
|
| These correspond to the Mongoose warnings seen during your migration:
|
| domain
| status
| audience
| type
| createdBy
| referralCode
| code
| reference
|
| We only remove a field-level "index: true" when the same field is also
| explicitly indexed by schema.index(). We do NOT remove arbitrary indexes.
|
|--------------------------------------------------------------------------
*/

const KNOWN_DUPLICATE_FIELDS = new Set([
  "domain",
  "status",
  "audience",
  "type",
  "createdBy",
  "referralCode",
  "code",
  "reference"
]);

const MODEL_FILES_TO_BACKUP = new Set([
  "User.js",
  "Staff.js",
  "Destination.js",
  "Tour.js",
  "TourCategory.js",
  "Vehicle.js",
  "Wishlist.js",
  "Organization.js",
  "AuditLog.js",
  "SecurityLog.js",
  "Notification.js",
  "Campaign.js",
  "Promotion.js",
  "Payment.js",
  "Loyalty.js",
  "Role.js"
]);

function log(message = "") {
  console.log(message);
}

function warn(message = "") {
  console.warn(`WARNING: ${message}`);
}

function fail(message) {
  console.error(`ERROR: ${message}`);
  process.exitCode = 1;
}

function indexKeyString(key) {
  return Object.entries(key)
    .map(([field, direction]) => `${field}:${direction}`)
    .join(",");
}

function isTenantUniqueIndex(index) {
  return (
    index.unique === true &&
    index.key &&
    index.key.tenantId === 1
  );
}

function isGlobalUniqueIndex(index) {
  return (
    index.unique === true &&
    index.key &&
    !Object.prototype.hasOwnProperty.call(index.key, "tenantId")
  );
}

function samePartialFilter(a, b) {
  return JSON.stringify(a || null) === JSON.stringify(b || null);
}

function expectedTenantIndex(modelName, fieldConfig) {
  return {
    key: {
      tenantId: 1,
      [fieldConfig.field]: 1
    },
    unique: true,
    ...(fieldConfig.options.sparse
      ? { sparse: true }
      : {}),
    ...(fieldConfig.options.partialFilterExpression
      ? {
          partialFilterExpression:
            fieldConfig.options.partialFilterExpression
        }
      : {})
  };
}

function describeIndex(index) {
  return {
    name: index.name,
    key: index.key,
    unique: !!index.unique,
    sparse: !!index.sparse,
    partialFilterExpression:
      index.partialFilterExpression || null
  };
}

async function getModelFiles() {
  const entries = await fs.promises.readdir(MODELS_DIR, {
    withFileTypes: true
  });

  return entries
    .filter(
      entry =>
        entry.isFile() &&
        entry.name.endsWith(".js") &&
        !entry.name.startsWith(".")
    )
    .map(entry => entry.name)
    .sort();
}

async function importAllModels() {
  const files = await getModelFiles();

  log(`Discovered ${files.length} model files.`);

  for (const file of files) {
    const fullPath = path.join(MODELS_DIR, file);

    try {
      await import(pathToFileURL(fullPath).href);
    } catch (error) {
      warn(
        `Could not import ${file}: ${error.message}`
      );
    }
  }

  return files;
}

/*
|--------------------------------------------------------------------------
| Source-level duplicate index cleanup
|--------------------------------------------------------------------------
|
| This only removes "index: true" from fields where:
|
|   1. the field is one of the known duplicate-warning fields, AND
|   2. the same field is explicitly declared by schema.index(...)
|
| We make a backup before doing anything.
|
|--------------------------------------------------------------------------
*/

function removeKnownDuplicateFieldIndexes(source, fileName) {
  let result = source;
  let changes = 0;

  if (!KNOWN_DUPLICATE_FIELDS.size) {
    return {
      source: result,
      changes
    };
  }

  /*
   * We intentionally use a conservative pattern:
   *
   * fieldName: {
   *   ...
   *   index: true,
   *   ...
   * }
   *
   * Only fields named in KNOWN_DUPLICATE_FIELDS are considered.
   */

  for (const field of KNOWN_DUPLICATE_FIELDS) {
    const fieldPattern = new RegExp(
      `(${field}\\s*:\\s*\\{[\\s\\S]*?)(index\\s*:\\s*true\\s*,?)([\\s\\S]*?\\})`,
      "m"
    );

    const match = result.match(fieldPattern);

    if (!match) {
      continue;
    }

    /*
     * Only remove if there is an explicit schema.index({ field: ... })
     * somewhere in the same file.
     */
    const explicitIndexPattern = new RegExp(
      `schema\\.index\\s*\\(\\s*\\{[\\s\\S]*?${field}\\s*:`,
      "m"
    );

    if (!explicitIndexPattern.test(result)) {
      continue;
    }

    const replacement = `${match[1]}${match[3]}`;

    result = result.replace(
      fieldPattern,
      replacement
    );

    changes++;

    log(
      `  SOURCE FIX ${fileName}: removed redundant index:true from ${field}`
    );
  }

  return {
    source: result,
    changes
  };
}

async function backupAndFixModelSources(modelFiles) {
  const candidates = modelFiles.filter(file =>
    MODEL_FILES_TO_BACKUP.has(file)
  );

  if (!candidates.length) {
    warn("No known model files found for source cleanup.");
    return;
  }

  if (!DRY_RUN) {
    await fs.promises.mkdir(BACKUP_DIR, {
      recursive: true
    });

    log(`\nSource backup directory: ${BACKUP_DIR}`);
  }

  let totalChanges = 0;

  for (const file of candidates) {
    const fullPath = path.join(MODELS_DIR, file);

    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const original = await fs.promises.readFile(
      fullPath,
      "utf8"
    );

    const { source, changes } =
      removeKnownDuplicateFieldIndexes(
        original,
        file
      );

    if (!changes) {
      continue;
    }

    totalChanges += changes;

    if (DRY_RUN) {
      log(
        `  DRY RUN: would update ${file}`
      );
      continue;
    }

    await fs.promises.copyFile(
      fullPath,
      path.join(BACKUP_DIR, file)
    );

    await fs.promises.writeFile(
      fullPath,
      source,
      "utf8"
    );
  }

  log(
    `Source cleanup changes: ${totalChanges}`
  );
}

/*
|--------------------------------------------------------------------------
| Schema audit
|--------------------------------------------------------------------------
*/

function auditSchemaIndexes() {
  log("\n=== MONGOOSE MODEL INDEX AUDIT ===\n");

  const modelNames = Object.keys(mongoose.models).sort();

  let globalUniqueCount = 0;
  let tenantUniqueCount = 0;
  let duplicateSchemaCount = 0;

  for (const modelName of modelNames) {
    const Model = mongoose.models[modelName];

    if (!Model?.schema) {
      continue;
    }

    const indexes = Model.schema.indexes();

    log(`--- ${modelName} ---`);

    const seen = new Map();

    for (const [key, options] of indexes) {
      const keyString = indexKeyString(key);

      if (seen.has(keyString)) {
        duplicateSchemaCount++;

        warn(
          `${modelName}: duplicate schema index ${keyString}`
        );
      }

      seen.set(keyString, options);

      const descriptor = {
        key,
        unique: !!options?.unique,
        sparse: !!options?.sparse,
        partialFilterExpression:
          options?.partialFilterExpression || null
      };

      if (descriptor.unique) {
        if (
          Object.prototype.hasOwnProperty.call(
            key,
            "tenantId"
          )
        ) {
          tenantUniqueCount++;
          log(
            `  TENANT UNIQUE ${JSON.stringify(descriptor)}`
          );
        } else {
          globalUniqueCount++;
          log(
            `  GLOBAL UNIQUE ${JSON.stringify(descriptor)}`
          );
        }
      }
    }

    log();
  }

  log(
    `Schema audit summary: globalUnique=${globalUniqueCount}, tenantUnique=${tenantUniqueCount}, duplicateSchemaIndexes=${duplicateSchemaCount}`
  );
}

/*
|--------------------------------------------------------------------------
| Database index audit
|--------------------------------------------------------------------------
*/

async function auditDatabaseIndexes() {
  log("\n=== MONGODB INDEX AUDIT ===\n");

  const collections =
    await mongoose.connection.db
      .listCollections()
      .toArray();

  let globalUnique = 0;
  let tenantUnique = 0;

  for (const { name } of collections) {
    const collection =
      mongoose.connection.db.collection(name);

    let indexes;

    try {
      indexes = await collection.indexes();
    } catch {
      continue;
    }

    const relevant = indexes.filter(
      index => index.unique
    );

    if (!relevant.length) {
      continue;
    }

    log(`--- ${name} ---`);

    for (const index of relevant) {
      if (isTenantUniqueIndex(index)) {
        tenantUnique++;
        log(
          `  TENANT ${JSON.stringify(
            describeIndex(index)
          )}`
        );
      } else if (isGlobalUniqueIndex(index)) {
        globalUnique++;
        log(
          `  GLOBAL ${JSON.stringify(
            describeIndex(index)
          )}`
        );
      }
    }

    log();
  }

  log(
    `Database unique index summary: global=${globalUnique}, tenant=${tenantUnique}`
  );
}

/*
|--------------------------------------------------------------------------
| Tenant index synchronization
|--------------------------------------------------------------------------
|
| We use explicit MongoDB indexes here so the intended tenant uniqueness
| is unambiguous.
|
|--------------------------------------------------------------------------
*/

async function synchronizeTenantIndexes() {
  log("\n=== TENANT UNIQUE INDEX SYNCHRONIZATION ===\n");

  for (const [modelName, fields] of Object.entries(
    TENANT_UNIQUE_FIELDS
  )) {
    const Model = mongoose.models[modelName];

    if (!Model) {
      warn(
        `${modelName}: model not loaded; skipping`
      );
      continue;
    }

    const collection = Model.collection;
    const existing = await collection.indexes();

    for (const fieldConfig of fields) {
      const expected =
        expectedTenantIndex(
          modelName,
          fieldConfig
        );

      const expectedKey =
        indexKeyString(expected.key);

      const matchingTenantIndexes =
        existing.filter(
          index =>
            index.unique === true &&
            indexKeyString(index.key) ===
              expectedKey
        );

      const expectedPartial =
        expected.partialFilterExpression || null;

      const exact = matchingTenantIndexes.find(
        index =>
          !!index.unique &&
          !!index.sparse ===
            !!expected.sparse &&
          samePartialFilter(
            index.partialFilterExpression,
            expectedPartial
          )
      );

      if (exact) {
        log(
          `PASS ${modelName}.${fieldConfig.field}: ${exact.name}`
        );
      } else if (DRY_RUN) {
        log(
          `DRY RUN ${modelName}.${fieldConfig.field}: would create tenant-aware unique index`
        );
      } else {
        const indexName =
          `tenantId_1_${fieldConfig.field}_1`;

        /*
         * Remove incorrect tenant-aware index variants with
         * the same key before creating the correct one.
         */
        for (const index of matchingTenantIndexes) {
          if (index.name === "_id_") {
            continue;
          }

          warn(
            `Dropping incompatible tenant index ${modelName}.${index.name}`
          );

          await collection.dropIndex(
            index.name
          );
        }

        await collection.createIndex(
          expected.key,
          {
            name: indexName,
            unique: true,
            ...(expected.sparse
              ? { sparse: true }
              : {}),
            ...(expected.partialFilterExpression
              ? {
                  partialFilterExpression:
                    expected.partialFilterExpression
                }
              : {})
          }
        );

        log(
          `CREATED ${modelName}.${indexName}`
        );
      }
    }
  }
}

/*
|--------------------------------------------------------------------------
| Remove obsolete global unique indexes
|--------------------------------------------------------------------------
|
| We only remove a global unique index when:
|
|   - its model/field is explicitly listed as tenant-scoped above
|   - the corresponding tenant-aware unique index exists
|
| No arbitrary global index is removed.
|
|--------------------------------------------------------------------------
*/

async function removeObsoleteGlobalUniqueIndexes() {
  log("\n=== GLOBAL UNIQUE INDEX CLEANUP ===\n");

  for (const [modelName, fields] of Object.entries(
    TENANT_UNIQUE_FIELDS
  )) {
    const Model = mongoose.models[modelName];

    if (!Model) {
      continue;
    }

    const collection = Model.collection;
    const indexes = await collection.indexes();

    for (const fieldConfig of fields) {
      const field = fieldConfig.field;

      const globalIndexes = indexes.filter(
        index =>
          index.unique === true &&
          !Object.prototype.hasOwnProperty.call(
            index.key || {},
            "tenantId"
          ) &&
          index.key?.[field] === 1 &&
          Object.keys(index.key).length === 1
      );

      for (const index of globalIndexes) {
        /*
         * Safety check: tenant-aware index must exist first.
         */
        const tenantIndexExists =
          indexes.some(
            candidate =>
              candidate.unique === true &&
              candidate.key?.tenantId === 1 &&
              candidate.key?.[field] === 1
          );

        if (!tenantIndexExists) {
          throw new Error(
            `REFUSING to drop ${modelName}.${index.name}: tenant-aware replacement does not exist`
          );
        }

        if (DRY_RUN) {
          log(
            `DRY RUN ${modelName}: would drop global unique ${index.name}`
          );
        } else {
          log(
            `Dropping obsolete global unique index ${modelName}.${index.name}`
          );

          await collection.dropIndex(
            index.name
          );
        }
      }
    }
  }
}

/*
|--------------------------------------------------------------------------
| Index synchronization
|--------------------------------------------------------------------------
*/

async function syncAllIndexes() {
  log("\n=== MONGOOSE INDEX SYNCHRONIZATION ===\n");

  if (DRY_RUN) {
    log(
      "DRY RUN enabled: syncIndexes() will NOT execute."
    );
    return;
  }

  for (const modelName of Object.keys(
    mongoose.models
  )) {
    const Model = mongoose.models[modelName];

    if (!Model?.syncIndexes) {
      continue;
    }

    /*
     * IMPORTANT:
     * syncIndexes() changes indexes only.
     * It does not modify application documents.
     */
    try {
      const dropped =
        await Model.syncIndexes();

      if (dropped?.length) {
        log(
          `${modelName}: dropped indexes: ${dropped.join(
            ", "
          )}`
        );
      } else {
        log(
          `${modelName}: synchronized`
        );
      }
    } catch (error) {
      /*
       * We stop rather than silently ignoring index conflicts.
       */
      throw new Error(
        `${modelName} syncIndexes failed: ${error.message}`
      );
    }
  }
}

/*
|--------------------------------------------------------------------------
| Final tenant audit
|--------------------------------------------------------------------------
*/

async function finalTenantAudit() {
  const checks = [
    "agents",
    "auditlogs",
    "bookings",
    "commissions",
    "customtourrequests",
    "databasebackups",
    "destinations",
    "galleries",
    "heroslides",
    "notifications",
    "payments",
    "roles",
    "securitylogs",
    "staffs",
    "systemsettings",
    "tours",
    "tourcategories",
    "users",
    "vehicles",
    "wishlists"
  ];

  log("\n=== FINAL TENANT DATA AUDIT ===");
  log(`Database: ${mongoose.connection.name}`);
  log(`Tenant: ${TENANT_ID_STRING}\n`);

  let failures = 0;

  for (const name of checks) {
    const collection =
      mongoose.connection.db.collection(name);

    const total =
      await collection.countDocuments();

    if (total === 0) {
      log(
        `PASS ${name.padEnd(25)} total=0`
      );
      continue;
    }

    const missing =
      await collection.countDocuments({
        $or: [
          {
            tenantId: {
              $exists: false
            }
          },
          {
            tenantId: null
          }
        ]
      });

    const tenantDocs =
      await collection.countDocuments({
        tenantId
      });

    const otherTenantDocs =
      await collection.countDocuments({
        tenantId: {
          $exists: true,
          $ne: null,
          $ne: tenantId
        }
      });

    const pass =
      missing === 0 &&
      otherTenantDocs === 0 &&
      tenantDocs === total;

    if (!pass) {
      failures++;
    }

    log(
      `${pass ? "PASS" : "FAIL"} ${name.padEnd(25)} ` +
      `total=${String(total).padEnd(6)} ` +
      `tenant=${String(tenantDocs).padEnd(6)} ` +
      `missing=${String(missing).padEnd(6)} ` +
      `other=${otherTenantDocs}`
    );
  }

  if (failures) {
    throw new Error(
      `Final tenant audit failed: ${failures} collections`
    );
  }

  log("\n=== FINAL TENANT AUDIT: PASS ===");
}

/*
|--------------------------------------------------------------------------
| Existing project checks
|--------------------------------------------------------------------------
*/

function runProjectCheck(command, args) {
  log(`\n>>> ${command} ${args.join(" ")}`);

  execFileSync(
    command,
    args,
    {
      cwd: SERVER_ROOT,
      stdio: "inherit",
      env: process.env
    }
  );
}

function runExistingChecks() {
  log("\n=== FINAL APPLICATION CHECKS ===");

  runProjectCheck(
    process.platform === "win32"
      ? "npm.cmd"
      : "npm",
    ["run", "check:rbac"]
  );

  runProjectCheck(
    process.platform === "win32"
      ? "npm.cmd"
      : "npm",
    ["run", "check:security"]
  );

  runProjectCheck(
    process.platform === "win32"
      ? "npm.cmd"
      : "npm",
    ["run", "check:multitenancy"]
  );

  runProjectCheck(
    process.platform === "win32"
      ? "npm.cmd"
      : "npm",
    ["run", "check:production"]
  );
}

/*
|--------------------------------------------------------------------------
| Main
|--------------------------------------------------------------------------
*/

async function main() {
  log("============================================================");
  log("SAFE MULTI-TENANT INDEX HARDENING");
  log("============================================================");
  log(`Database tenant: ${TENANT_ID_STRING}`);
  log(`DRY RUN: ${DRY_RUN}`);
  log("Application documents will NOT be modified.");
  log("============================================================\n");

  /*
   * Phase 1: connect
   */
  await mongoose.connect(
    env.MONGODB_URI
  );

  log(
    `Connected to database: ${mongoose.connection.name}`
  );

  /*
   * Phase 2: discover/import models
   */
  const modelFiles =
    await importAllModels();

  /*
   * Phase 3: backup + conservative source cleanup
   *
   * This must happen before the model index synchronization.
   */
  await backupAndFixModelSources(
    modelFiles
  );

  /*
   * If source files were modified, this process cannot safely reload
   * already-imported schemas. Therefore the script tells the operator
   * to rerun after source cleanup.
   *
   * This avoids accidentally synchronizing stale in-memory schemas.
   */
  if (!DRY_RUN) {
    const backupFiles =
      fs.existsSync(BACKUP_DIR)
        ? await fs.promises.readdir(
            BACKUP_DIR
          )
        : [];

    if (backupFiles.length) {
      log("\n============================================================");
      log("SOURCE INDEX DEFINITIONS WERE CHANGED");
      log("============================================================");
      log(
        "The current Node process has already loaded the old schemas."
      );
      log(
        "For safety, no MongoDB index synchronization will be performed"
      );
      log(
        "using stale in-memory schemas."
      );
      log("");
      log(
        `Backup created at: ${BACKUP_DIR}`
      );
      log("");
      log(
        "Restart this script once to load the corrected schemas and continue."
      );
      log(
        "No application documents were modified."
      );
      log("============================================================\n");

      await mongoose.disconnect();
      return;
    }
  }

  /*
   * Phase 4: schema audit
   */
  auditSchemaIndexes();

  /*
   * Phase 5: database audit
   */
  await auditDatabaseIndexes();

  /*
   * Phase 6: ensure tenant-aware indexes
   */
  await synchronizeTenantIndexes();

  /*
   * Phase 7: remove obsolete global unique indexes
   */
  await removeObsoleteGlobalUniqueIndexes();

  /*
   * Phase 8: synchronize indexes declared by models
   */
  await syncAllIndexes();

  /*
   * Phase 9: database audit after synchronization
   */
  await auditDatabaseIndexes();

  /*
   * Phase 10: final tenant audit
   */
  await finalTenantAudit();

  await mongoose.disconnect();

  /*
   * Phase 11: project-level checks.
   *
   * Run after disconnect so the project check commands get a clean
   * Node process.
   */
  runExistingChecks();

  log("\n============================================================");
  log("SAFE TENANT INDEX HARDENING: PASS");
  log("============================================================");
  log("No application documents were modified.");
  log("Indexes/schema definitions were audited and synchronized.");
  log("RBAC check: PASS");
  log("Security check: PASS");
  log("Multi-tenancy check: PASS");
  log("Production readiness check: PASS");
  log("============================================================");
}

main().catch(async error => {
  console.error("\n============================================================");
  console.error("SAFE TENANT INDEX HARDENING: FAILED");
  console.error("============================================================");
  console.error(error.stack || error.message);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});
