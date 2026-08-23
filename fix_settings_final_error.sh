#!/usr/bin/env bash
set -euo pipefail

ROOT="$(pwd)"
SERVER="$ROOT/server"

echo
echo "============================================================"
echo " COHERENT TOURS - SETTINGS FINAL ERROR REPAIR"
echo "============================================================"
echo

if [[ ! -d "$SERVER" ]]; then
  echo "ERROR: server directory not found."
  exit 1
fi

STAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP="$ROOT/.repair-backups/settings-final-$STAMP"

mkdir -p "$BACKUP"

backup_file() {
  local file="$1"

  if [[ -f "$file" ]]; then
    local rel="${file#$ROOT/}"
    mkdir -p "$BACKUP/$(dirname "$rel")"
    cp -p "$file" "$BACKUP/$rel"
    echo "BACKUP: $rel"
  fi
}

echo "------------------------------------------------------------"
echo "1. BACKUP"
echo "------------------------------------------------------------"

backup_file "$SERVER/scripts/migrateSystemSettingsCanonical.js"
backup_file "$SERVER/scripts/settings-rbac-audit.js"
backup_file "$SERVER/controllers/agentController.js"
backup_file "$SERVER/controllers/bookingController.js"
backup_file "$SERVER/services/commissionService.js"

echo
echo "Backup:"
echo "  $BACKUP"

echo
echo "------------------------------------------------------------"
echo "2. VERIFY CANONICAL MODEL"
echo "------------------------------------------------------------"

if [[ ! -f "$SERVER/models/SystemSetting.js" ]]; then
  echo "ERROR: server/models/SystemSetting.js is missing."
  exit 1
fi

echo "OK: canonical SystemSetting model exists."

echo
echo "------------------------------------------------------------"
echo "3. REBUILD MIGRATION SCRIPT CLEANLY"
echo "------------------------------------------------------------"

cat > "$SERVER/scripts/migrateSystemSettingsCanonical.js" <<'NODE'
import "dotenv/config";
import mongoose from "mongoose";
import SystemSetting from "../models/SystemSetting.js";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error(
    "ERROR: MONGODB_URI, MONGO_URI, or DATABASE_URL is not configured."
  );
  process.exit(1);
}

const LEGACY_COLLECTION = "systemsettings";
const CANONICAL_COLLECTION = "systemsettings";

async function run() {
  console.log("");
  console.log("============================================================");
  console.log(" SYSTEM SETTINGS CANONICAL MIGRATION");
  console.log("============================================================");
  console.log("");

  await mongoose.connect(MONGODB_URI);

  const db = mongoose.connection.db;

  console.log(`Database: ${db.databaseName}`);
  console.log(`Canonical model: ${SystemSetting.modelName}`);
  console.log(`Canonical collection: ${SystemSetting.collection.name}`);
  console.log("");

  const collections = await db
    .listCollections({}, { nameOnly: true })
    .toArray();

  const names = new Set(collections.map((c) => c.name));

  console.log("Collections detected:");
  for (const name of names) {
    if (
      name.toLowerCase().includes("systemsetting")
    ) {
      console.log(`  - ${name}`);
    }
  }

  console.log("");

  /*
   * IMPORTANT:
   *
   * This script intentionally does NOT drop or delete the legacy
   * collection. It only verifies the canonical model and reports
   * available settings.
   */

  const count = await SystemSetting.countDocuments();

  console.log(`Canonical settings documents: ${count}`);

  const sample = await SystemSetting.find({})
    .select("_id key tenantId updatedAt")
    .limit(10)
    .lean();

  if (sample.length) {
    console.log("");
    console.log("Sample settings:");

    for (const item of sample) {
      console.log(
        `  ${item._id} | key=${item.key || "-"} | tenantId=${
          item.tenantId || "GLOBAL"
        }`
      );
    }
  }

  console.log("");
  console.log("MIGRATION CHECK COMPLETE.");
  console.log("");
  console.log(
    "No legacy collection was deleted or modified by this script."
  );
  console.log("");

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error("");
  console.error("MIGRATION CHECK FAILED");
  console.error(error);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});
NODE

echo "OK: migration script rebuilt."

echo
echo "------------------------------------------------------------"
echo "4. REBUILD RBAC AUDIT SCRIPT CLEANLY"
echo "------------------------------------------------------------"

cat > "$SERVER/scripts/settings-rbac-audit.js" <<'NODE'
import "dotenv/config";
import mongoose from "mongoose";

import SystemSetting from "../models/SystemSetting.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

const MONGODB_URI =
  process.env.MONGODB_URI ||
  process.env.MONGO_URI ||
  process.env.DATABASE_URL;

if (!MONGODB_URI) {
  console.error(
    "ERROR: MONGODB_URI, MONGO_URI, or DATABASE_URL is not configured."
  );
  process.exit(1);
}

async function run() {
  await mongoose.connect(MONGODB_URI);

  console.log("");
  console.log("============================================================");
  console.log(" SETTINGS / RBAC AUDIT");
  console.log("============================================================");
  console.log("");

  /*
   * SYSTEM SETTINGS
   */

  const settings = await SystemSetting.find({})
    .select("_id key tenantId enabled")
    .lean();

  console.log("SYSTEM SETTINGS");
  console.log("---------------");
  console.log(`Total settings: ${settings.length}`);

  /*
   * ROLES
   */

  const roles = await Role.find({})
    .select("_id name enabled tenantId permissions")
    .lean();

  console.log("");
  console.log("ROLES");
  console.log("-----");
  console.log(`Total roles: ${roles.length}`);

  const roleNames = new Set(
    roles.map((r) =>
      String(r.name || "").trim().toLowerCase()
    )
  );

  for (const required of [
    "superadmin",
    "admin",
    "manager",
    "agent",
    "customer",
  ]) {
    console.log(
      `${required}: ${
        roleNames.has(required) ? "OK" : "MISSING"
      }`
    );
  }

  /*
   * PERMISSIONS
   */

  const permissions = await Permission.find({})
    .select("_id name enabled tenantId")
    .lean();

  console.log("");
  console.log("PERMISSIONS");
  console.log("-----------");
  console.log(`Total permissions: ${permissions.length}`);

  const permissionNames = new Set(
    permissions.map((p) =>
      String(p.name || "").trim().toLowerCase()
    )
  );

  const importantPermissions = [
    "user.manage",
    "roles.manage",
    "analytics.view",
    "system.security",
    "manage_tours",
    "manage_bookings",
    "view_customers",
    "view_reports",
  ];

  for (const permission of importantPermissions) {
    console.log(
      `${permission}: ${
        permissionNames.has(permission.toLowerCase())
          ? "OK"
          : "MISSING"
      }`
    );
  }

  console.log("");
  console.log("AUDIT COMPLETE.");

  await mongoose.disconnect();
}

run().catch(async (error) => {
  console.error(error);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});
NODE

echo "OK: RBAC audit script rebuilt."

echo
echo "------------------------------------------------------------"
echo "5. CHECK CONTROLLER IMPORTS"
echo "------------------------------------------------------------"

for file in \
  "$SERVER/controllers/agentController.js" \
  "$SERVER/controllers/bookingController.js" \
  "$SERVER/services/commissionService.js"
do
  if [[ -f "$file" ]]; then
    echo
    echo "FILE: ${file#$ROOT/}"

    grep -nE \
      'SystemSetting|SystemSettings|getSystemSettings|settingsService' \
      "$file" \
      || true
  fi
done

echo
echo "------------------------------------------------------------"
echo "6. CHECK FOR DUPLICATE SYSTEMSETTING DECLARATIONS"
echo "------------------------------------------------------------"

DUPLICATES=0

for file in \
  "$SERVER/scripts/migrateSystemSettingsCanonical.js" \
  "$SERVER/scripts/settings-rbac-audit.js"
do
  count="$(
    grep -Ec \
      '^[[:space:]]*(import|const|let|var)[[:space:]]+SystemSetting([[:space:]]|=)' \
      "$file" \
      || true
  )"

  echo "${file#$ROOT/}: SystemSetting declarations = $count"

  if [[ "$count" -gt 1 ]]; then
    DUPLICATES=1
  fi
done

if [[ "$DUPLICATES" -ne 0 ]]; then
  echo
  echo "ERROR: duplicate SystemSetting declarations remain."
  exit 1
fi

echo "OK: no duplicate SystemSetting declarations."

echo
echo "------------------------------------------------------------"
echo "7. NODE SYNTAX CHECK"
echo "------------------------------------------------------------"

FILES=(
  "$SERVER/models/SystemSetting.js"
  "$SERVER/services/settingsService.js"
  "$SERVER/controllers/agentController.js"
  "$SERVER/controllers/bookingController.js"
  "$SERVER/services/commissionService.js"
  "$SERVER/scripts/migrateSystemSettingsCanonical.js"
  "$SERVER/scripts/settings-rbac-audit.js"
)

for file in "${FILES[@]}"; do
  if [[ -f "$file" ]]; then
    echo "CHECK: ${file#$ROOT/}"
    node --check "$file"
  fi
done

echo
echo "OK: all selected JavaScript files passed syntax checks."

echo
echo "------------------------------------------------------------"
echo "8. CANONICAL MODEL IMPORT TEST"
echo "------------------------------------------------------------"

node --input-type=module <<'NODE'
import("./server/models/SystemSetting.js")
  .then((module) => {
    if (!module.default) {
      console.error(
        "ERROR: SystemSetting default export is missing."
      );
      process.exit(1);
    }

    console.log(
      `OK: SystemSetting imported as ${module.default.modelName}.`
    );

    console.log(
      `Collection: ${module.default.collection.name}`
    );
  })
  .catch((error) => {
    console.error(
      "ERROR: SystemSetting model import failed."
    );
    console.error(error);
    process.exit(1);
  });
NODE

echo
echo "------------------------------------------------------------"
echo "9. SETTINGS SERVICE IMPORT TEST"
echo "------------------------------------------------------------"

node --input-type=module <<'NODE'
import("./server/services/settingsService.js")
  .then((module) => {
    if (typeof module.getSystemSettings !== "function") {
      console.error(
        "ERROR: getSystemSettings export is missing."
      );
      process.exit(1);
    }

    if (typeof module.updateSystemSettings !== "function") {
      console.error(
        "ERROR: updateSystemSettings export is missing."
      );
      process.exit(1);
    }

    console.log(
      "OK: settingsService exports getSystemSettings and updateSystemSettings."
    );
  })
  .catch((error) => {
    console.error(
      "ERROR: settingsService import failed."
    );
    console.error(error);
    process.exit(1);
  });
NODE

echo
echo "------------------------------------------------------------"
echo "10. SEARCHING FOR LIVE LEGACY MODEL IMPORTS"
echo "------------------------------------------------------------"

LEGACY_IMPORTS=0

if grep -RIn \
  --include='*.js' \
  --exclude-dir=node_modules \
  --exclude-dir=_legacy \
  --exclude-dir=models_backup_before_superadmin_fix \
  -E \
  'from[[:space:]]+["'\'']\.\./models/SystemSettings\.js["'\'']|from[[:space:]]+["'\'']\.\./models/SystemSettings["'\'']' \
  "$SERVER" 2>/dev/null
then
  LEGACY_IMPORTS=1
fi

if [[ "$LEGACY_IMPORTS" -eq 0 ]]; then
  echo "OK: no live SystemSettings model imports found."
else
  echo
  echo "WARNING: legacy SystemSettings imports remain."
fi

echo
echo "------------------------------------------------------------"
echo "11. SEARCHING FOR UNSAFE DEFAULT QUERIES"
echo "------------------------------------------------------------"

if grep -RIn \
  --include='*.js' \
  --exclude-dir=node_modules \
  --exclude-dir=_legacy \
  --exclude-dir=models_backup_before_superadmin_fix \
  -E \
  'SystemSetting\.find(One|ById|)\(\{[[:space:]]*key:[[:space:]]*["'\'']default' \
  "$SERVER" 2>/dev/null
then
  echo
  echo "ERROR: unsafe SystemSetting default lookup remains."
  exit 1
else
  echo "OK: no unsafe default SystemSetting lookup found."
fi

echo
echo "------------------------------------------------------------"
echo "12. SEARCHING FOR SYSTEMSETTINGS MODEL IDENTIFIERS"
echo "------------------------------------------------------------"

grep -RIn \
  --include='*.js' \
  --exclude-dir=node_modules \
  --exclude-dir=_legacy \
  --exclude-dir=models_backup_before_superadmin_fix \
  -E \
  'mongoose\.model\(["'\'']SystemSettings|import .*SystemSettings|SystemSettings\.find|SystemSettings\.findOne|SystemSettings\.findById' \
  "$SERVER" 2>/dev/null \
  || echo "OK: no executable legacy SystemSettings model usage found."

echo
echo "------------------------------------------------------------"
echo "13. GIT STATUS"
echo "------------------------------------------------------------"

git status --short 2>/dev/null || true

echo
echo "============================================================"
echo " SETTINGS FINAL ERROR REPAIR COMPLETE"
echo "============================================================"
echo
echo "Backup:"
echo "  $BACKUP"
echo
echo "NEXT:"
echo
echo "Run:"
echo "  node server/scripts/migrateSystemSettingsCanonical.js"
echo
echo "Then:"
echo "  node server/scripts/settings-rbac-audit.js"
echo
echo "IMPORTANT:"
echo "  The database has NOT been modified by this repair script."
echo "  Do NOT delete the legacy SystemSettings collection yet."
echo

