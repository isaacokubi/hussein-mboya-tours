#!/usr/bin/env bash

set -Eeuo pipefail

ROOT="$(pwd)"
SERVER="$ROOT/server"
BACKUP="$ROOT/.repair-backups/settings-rbac-$(date +%Y%m%d-%H%M%S)"

echo
echo "============================================================"
echo " COHERENT TOURS - SETTINGS/RBAC REPAIR"
echo "============================================================"
echo "Project : $ROOT"
echo "Backup  : $BACKUP"
echo

if [[ ! -d "$SERVER" ]]; then
  echo "ERROR: server directory not found."
  exit 1
fi

mkdir -p "$BACKUP"

backup_file() {
  local file="$1"

  if [[ -f "$file" ]]; then
    local relative="${file#$ROOT/}"
    mkdir -p "$BACKUP/$(dirname "$relative")"
    cp -p "$file" "$BACKUP/$relative"
    echo "BACKUP: $relative"
  fi
}

echo
echo "------------------------------------------------------------"
echo "1. BACKING UP FILES"
echo "------------------------------------------------------------"

backup_file "$SERVER/models/SystemSetting.js"
backup_file "$SERVER/models/SystemSettings.js"
backup_file "$SERVER/services/settingsService.js"

while IFS= read -r file; do
  backup_file "$ROOT/$file"
done < <(
  grep -RIl \
    --include='*.js' \
    -E 'SystemSettings|SystemSetting' \
    "$SERVER" 2>/dev/null || true
)

echo
echo "------------------------------------------------------------"
echo "2. VERIFYING CANONICAL SYSTEM SETTING MODEL"
echo "------------------------------------------------------------"

CANONICAL="$SERVER/models/SystemSetting.js"

if [[ ! -f "$CANONICAL" ]]; then
  echo "ERROR: $CANONICAL does not exist."
  exit 1
fi

if ! grep -q 'tenantId' "$CANONICAL"; then
  echo "ERROR: canonical SystemSetting.js does not contain tenantId."
  echo "No changes made to the model."
  exit 1
fi

if ! grep -q 'unique: true' "$CANONICAL"; then
  echo "WARNING: tenantId/key unique index was not detected."
fi

echo "OK: SystemSetting.js selected as canonical model."

echo
echo "------------------------------------------------------------"
echo "3. NORMALIZING SystemSettings IMPORTS"
echo "------------------------------------------------------------"

# Convert imports/requires of the duplicate model to SystemSetting.
find "$SERVER" \
  -type f \
  -name '*.js' \
  -not -path '*/node_modules/*' \
  -print0 |
while IFS= read -r -d '' file; do

  if grep -q 'models/SystemSettings' "$file"; then
    echo "FIX IMPORT: ${file#$ROOT/}"

    sed -i \
      -e 's#models/SystemSettings\.js#models/SystemSetting.js#g' \
      -e 's#models/SystemSettings#models/SystemSetting#g' \
      "$file"
  fi

done

echo
echo "------------------------------------------------------------"
echo "4. NORMALIZING MODEL IDENTIFIERS"
echo "------------------------------------------------------------"

# We deliberately do NOT globally replace every variable named
# SystemSettings because that could corrupt unrelated logic.
#
# This handles the common import form:
#
# import SystemSettings from "../models/SystemSetting.js";
#
# and changes it to:
#
# import SystemSetting from "../models/SystemSetting.js";

find "$SERVER" \
  -type f \
  -name '*.js' \
  -not -path '*/node_modules/*' \
  -print0 |
while IFS= read -r -d '' file; do

  if grep -Eq \
    'import[[:space:]]+SystemSettings[[:space:]]+from[[:space:]]+["'\''].*models/SystemSetting\.js' \
    "$file"; then

    echo "FIX MODEL NAME: ${file#$ROOT/}"

    sed -i \
      -E 's/import[[:space:]]+SystemSettings[[:space:]]+from/import SystemSetting from/' \
      "$file"

    sed -i \
      -E 's/\bSystemSettings\./SystemSetting./g' \
      "$file"

  fi

done

echo
echo "------------------------------------------------------------"
echo "5. REBUILDING SETTINGS SERVICE"
echo "------------------------------------------------------------"

SETTINGS_SERVICE="$SERVER/services/settingsService.js"

if [[ -f "$SETTINGS_SERVICE" ]]; then
  backup_file "$SETTINGS_SERVICE"
fi

cat > "$SETTINGS_SERVICE" <<'EOF'
import SystemSetting from "../models/SystemSetting.js";

/*
|--------------------------------------------------------------------------
| SYSTEM SETTINGS SERVICE
|--------------------------------------------------------------------------
|
| Single source of truth for application settings.
|
| IMPORTANT:
| - Never perform a global settings lookup by key alone.
| - Tenant settings are identified by tenantId + key.
| - Platform-level operations may explicitly bypass tenant filtering.
|
*/

const DEFAULT_SETTINGS = {
  key: "default",

  companyName: process.env.COMPANY_NAME || "Coherent Tours",
  companyLogo: process.env.COMPANY_LOGO || "",
  websiteUrl: process.env.COMPANY_WEBSITE || "",

  supportEmail: process.env.SUPPORT_EMAIL || "",
  supportPhone: process.env.SUPPORT_PHONE || "",

  address: process.env.COMPANY_ADDRESS || "",
  city: process.env.COMPANY_CITY || "Nairobi",
  country: process.env.COMPANY_COUNTRY || "Kenya",

  currency: process.env.DEFAULT_CURRENCY || "KES",
  currencySymbol: process.env.DEFAULT_CURRENCY_SYMBOL || "KSh",
  timezone: process.env.DEFAULT_TIMEZONE || "Africa/Nairobi",
  language: process.env.DEFAULT_LANGUAGE || "en",

  taxRate: Number(process.env.DEFAULT_TAX_RATE || 0),
  bookingDepositPercentage: Number(
    process.env.DEFAULT_BOOKING_DEPOSIT_PERCENTAGE || 30
  ),
  defaultCommissionRate: Number(
    process.env.DEFAULT_COMMISSION_RATE || 10
  ),

  maintenanceMode:
    String(process.env.MAINTENANCE_MODE || "false").toLowerCase() === "true",

  allowRegistrations:
    String(process.env.ALLOW_REGISTRATIONS || "true").toLowerCase() !== "false",

  allowAgentRegistrations:
    String(process.env.ALLOW_AGENT_REGISTRATIONS || "true").toLowerCase() !==
    "false",

  requireEmailVerification:
    String(process.env.REQUIRE_EMAIL_VERIFICATION || "true").toLowerCase() !==
    "false",

  requirePhoneVerification:
    String(process.env.REQUIRE_PHONE_VERIFICATION || "false").toLowerCase() ===
    "true",

  enableMpesa:
    String(process.env.ENABLE_MPESA || "true").toLowerCase() !== "false",

  enableStripe:
    String(process.env.ENABLE_STRIPE || "false").toLowerCase() === "true",

  enablePaypal:
    String(process.env.ENABLE_PAYPAL || "false").toLowerCase() === "true",

  enableBankTransfer:
    String(process.env.ENABLE_BANK_TRANSFER || "true").toLowerCase() !==
    "false",

  bankName: process.env.BANK_NAME || "",
  bankAccountName: process.env.BANK_ACCOUNT_NAME || "",
  bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER || "",
  bankBranch: process.env.BANK_BRANCH || "",
  bankSwiftCode: process.env.BANK_SWIFT_CODE || "",

  emailFromName: process.env.EMAIL_FROM_NAME || "Coherent Tours",
  emailFromAddress: process.env.EMAIL_FROM_ADDRESS || "",

  facebook: process.env.FACEBOOK_URL || "",
  instagram: process.env.INSTAGRAM_URL || "",
  twitter: process.env.TWITTER_URL || "",
  youtube: process.env.YOUTUBE_URL || "",

  seoTitle: process.env.SEO_TITLE || "",
  seoDescription: process.env.SEO_DESCRIPTION || "",
  seoKeywords: [],

  bookingNotifications: true,
  paymentNotifications: true,
};

/*
|--------------------------------------------------------------------------
| Tenant Resolution
|--------------------------------------------------------------------------
*/

const resolveTenantId = (source) => {
  const tenantId =
    source?.tenantId ||
    source?.user?.tenantId ||
    source?.user?._id && source?.tenantId;

  return tenantId || null;
};

/*
|--------------------------------------------------------------------------
| Get Settings
|--------------------------------------------------------------------------
*/

export async function getSystemSettings(source = {}) {
  const tenantId = resolveTenantId(source);

  /*
   * Existing request-based callers may pass req.
   */
  if (!tenantId) {
    /*
     * Preserve compatibility for platform/bootstrap code.
     *
     * This fallback is intentionally controlled and should not be used
     * for normal tenant requests.
     */
    const globalSettings = await SystemSetting.findOne({
      key: "default",
      tenantId: { $exists: false },
    })
      .lean()
      .catch(() => null);

    if (globalSettings) {
      return globalSettings;
    }

    return {
      ...DEFAULT_SETTINGS,
      _isDefault: true,
      _tenantScoped: false,
    };
  }

  let settings = await SystemSetting.findOne({
    tenantId,
    key: "default",
  }).lean();

  if (!settings) {
    settings = await SystemSetting.findOneAndUpdate(
      {
        tenantId,
        key: "default",
      },
      {
        $setOnInsert: {
          ...DEFAULT_SETTINGS,
          tenantId,
        },
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true,
      }
    ).lean();
  }

  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    tenantId,
    _tenantScoped: true,
  };
}

/*
|--------------------------------------------------------------------------
| Update Settings
|--------------------------------------------------------------------------
*/

export async function updateSystemSettings(source = {}, updates = {}) {
  const tenantId = resolveTenantId(source);

  if (!tenantId) {
    throw new Error(
      "Tenant ID is required when updating system settings."
    );
  }

  const allowedFields = Object.keys(DEFAULT_SETTINGS);

  const safeUpdates = {};

  for (const field of allowedFields) {
    if (Object.prototype.hasOwnProperty.call(updates, field)) {
      safeUpdates[field] = updates[field];
    }
  }

  return SystemSetting.findOneAndUpdate(
    {
      tenantId,
      key: "default",
    },
    {
      $set: safeUpdates,
      $setOnInsert: {
        tenantId,
        key: "default",
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
    }
  ).lean();
}

export { DEFAULT_SETTINGS };

export default getSystemSettings;
EOF

echo "OK: settingsService.js rebuilt."

echo
echo "------------------------------------------------------------"
echo "6. FIXING COMMON UNSAFE SETTINGS QUERIES"
echo "------------------------------------------------------------"

# These are deliberately conservative replacements.
#
# Before:
#   SystemSetting.findOne({ key: "default" })
#
# After:
#   SystemSetting.findOne({ tenantId: req.tenantId, key: "default" })
#
# Only controllers with req are changed automatically.

while IFS= read -r file; do

  if grep -q 'SystemSetting.findOne({ key: "default" })' "$file"; then

    if grep -q 'req\.tenantId' "$file"; then
      echo "TENANT FIX: ${file#$ROOT/}"

      sed -i \
        's/SystemSetting\.findOne({ key: "default" })/SystemSetting.findOne({ tenantId: req.tenantId, key: "default" })/g' \
        "$file"

    else
      echo "REVIEW REQUIRED: ${file#$ROOT/}"
      echo "  Contains global SystemSetting lookup but no obvious req.tenantId."
    fi

  fi

done < <(
  grep -RIl \
    --include='*.js' \
    'SystemSetting.findOne({ key: "default" })' \
    "$SERVER" 2>/dev/null || true
)

echo
echo "------------------------------------------------------------"
echo "7. ADDING DATABASE MIGRATION"
echo "------------------------------------------------------------"

MIGRATION="$SERVER/scripts/migrateSystemSettingsCanonical.js"

cat > "$MIGRATION" <<'EOF'
import "dotenv/config";
import mongoose from "mongoose";
import SystemSetting from "../models/SystemSetting.js";
import SystemSettings from "../models/SystemSettings.js";

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("ERROR: MONGODB_URI is not configured.");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(MONGODB_URI);

  console.log("Connected to MongoDB.");

  const oldCollection = SystemSettings.collection.name;
  const canonicalCollection = SystemSetting.collection.name;

  console.log("Legacy collection:", oldCollection);
  console.log("Canonical collection:", canonicalCollection);

  const legacyDocuments = await mongoose.connection
    .collection(oldCollection)
    .find({})
    .toArray();

  console.log(`Legacy documents found: ${legacyDocuments.length}`);

  let migrated = 0;
  let skipped = 0;

  for (const document of legacyDocuments) {
    const tenantId = document.tenantId;

    /*
     * SystemSetting requires tenantId.
     *
     * We intentionally do not invent a tenant ID.
     */
    if (!tenantId) {
      console.log(
        `SKIPPED ${document._id}: no tenantId`
      );
      skipped++;
      continue;
    }

    const {
      _id,
      __v,
      createdAt,
      updatedAt,
      ...data
    } = document;

    await SystemSetting.updateOne(
      {
        tenantId,
        key: data.key || "default",
      },
      {
        $set: {
          ...data,
          tenantId,
          key: data.key || "default",
        },
        $setOnInsert: {
          createdAt: createdAt || new Date(),
        },
      },
      {
        upsert: true,
      }
    );

    migrated++;
  }

  console.log("");
  console.log("Migration complete.");
  console.log("Migrated:", migrated);
  console.log("Skipped :", skipped);

  await mongoose.disconnect();
};

run().catch(async (error) => {
  console.error("Migration failed:", error);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});
EOF

echo "Created:"
echo "  $MIGRATION"

echo
echo "------------------------------------------------------------"
echo "8. ADDING RBAC CONTRACT CHECK"
echo "------------------------------------------------------------"

RBAC_CHECK="$SERVER/scripts/settings-rbac-audit.js"

cat > "$RBAC_CHECK" <<'EOF'
import "dotenv/config";
import mongoose from "mongoose";

import SystemSetting from "../models/SystemSetting.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error("MONGODB_URI is missing.");
  process.exit(1);
}

const run = async () => {
  await mongoose.connect(uri);

  console.log("");
  console.log("============================================================");
  console.log(" SETTINGS / RBAC DATABASE AUDIT");
  console.log("============================================================");

  /*
   * SETTINGS
   */

  const settings = await SystemSetting.find({})
    .select("_id tenantId key companyName currency defaultCommissionRate")
    .lean();

  console.log("");
  console.log("SYSTEM SETTINGS");
  console.log("----------------");

  console.log(`Total settings: ${settings.length}`);

  const missingTenant = settings.filter(
    (item) => !item.tenantId
  );

  console.log(`Missing tenantId: ${missingTenant.length}`);

  const duplicateMap = new Map();

  for (const item of settings) {
    const key = `${String(item.tenantId)}:${item.key}`;

    duplicateMap.set(
      key,
      (duplicateMap.get(key) || 0) + 1
    );
  }

  const duplicates = [...duplicateMap.entries()]
    .filter(([, count]) => count > 1);

  console.log(`Duplicate tenant/key pairs: ${duplicates.length}`);

  /*
   * ROLES
   */

  const roles = await Role.find({})
    .select("_id name displayName tenantId permissions isSystem level")
    .lean();

  console.log("");
  console.log("ROLES");
  console.log("-----");

  console.log(`Total roles: ${roles.length}`);

  const roleNames = roles.map((r) =>
    String(r.name || "").trim().toLowerCase()
  );

  for (const required of [
    "superadmin",
    "admin",
    "manager",
    "agent",
    "customer",
  ]) {
    console.log(
      `${required}: ${roleNames.includes(required) ? "OK" : "MISSING"}`
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
};

run().catch(async (error) => {
  console.error(error);

  try {
    await mongoose.disconnect();
  } catch {}

  process.exit(1);
});
EOF

echo "Created:"
echo "  $RBAC_CHECK"

echo
echo "------------------------------------------------------------"
echo "9. RENAMING LEGACY MODEL FILE SAFELY"
echo "------------------------------------------------------------"

LEGACY="$SERVER/models/SystemSettings.js"

if [[ -f "$LEGACY" ]]; then

  ARCHIVE_DIR="$SERVER/models/_legacy"
  mkdir -p "$ARCHIVE_DIR"

  cp -p "$LEGACY" \
    "$ARCHIVE_DIR/SystemSettings.js.$(date +%Y%m%d-%H%M%S).bak"

  echo "Legacy model archived."

else
  echo "SystemSettings.js already absent."
fi

echo
echo "------------------------------------------------------------"
echo "10. SEARCHING FOR REMAINING REFERENCES"
echo "------------------------------------------------------------"

echo
echo "Remaining SystemSettings references:"
grep -RIn \
  --include='*.js' \
  --exclude-dir=node_modules \
  --exclude-dir=_legacy \
  'SystemSettings' \
  "$SERVER" 2>/dev/null || true

echo
echo "Remaining unsafe settings queries:"
grep -RIn \
  --include='*.js' \
  --exclude-dir=node_modules \
  --exclude-dir=_legacy \
  -E 'SystemSetting\.find(One|ById|)\(\{[[:space:]]*key:[[:space:]]*["'\'']default' \
  "$SERVER" 2>/dev/null || true

echo
echo "------------------------------------------------------------"
echo "11. JAVASCRIPT SYNTAX CHECK"
echo "------------------------------------------------------------"

if command -v node >/dev/null 2>&1; then

  node --check "$SERVER/services/settingsService.js"
  node --check "$SERVER/scripts/migrateSystemSettingsCanonical.js"
  node --check "$SERVER/scripts/settings-rbac-audit.js"

  echo "Syntax checks passed."

else
  echo "WARNING: node command not available."
fi

echo
echo "------------------------------------------------------------"
echo "12. GIT DIFF"
echo "------------------------------------------------------------"

if command -v git >/dev/null 2>&1 && git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
  git status --short
  echo
  git diff --stat
else
  echo "Git repository not detected."
fi

echo
echo "============================================================"
echo " REPAIR PREPARATION COMPLETE"
echo "============================================================"
echo
echo "Backup:"
echo "  $BACKUP"
echo
echo "IMPORTANT:"
echo "  Do NOT delete the legacy settings collection yet."
echo
echo "Next commands:"
echo
echo "  node server/scripts/migrateSystemSettingsCanonical.js"
echo
echo "  node server/scripts/settings-rbac-audit.js"
echo
echo "Then run your normal test/build commands."
echo
