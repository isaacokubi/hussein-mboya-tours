#!/usr/bin/env bash
set -euo pipefail

SERVER_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SERVER_DIR"

EMAIL="admin@husseinmboyatours.test"
TENANT_ID="6a87fe1bc3f48c3dcddf4a23"

echo "============================================================"
echo " HUSSEIN MBOYA TOURS - ADMIN LOGIN REPAIR"
echo "============================================================"
echo

# ------------------------------------------------------------
# 1. Locate Role model
# ------------------------------------------------------------
echo "[1/8] Locating Role model..."

ROLE_FILE=""

for candidate in \
  "models/Role.js" \
  "models/role.js" \
  "models/AdminRole.js" \
  "models/adminRole.js"
do
  if [[ -f "$candidate" ]]; then
    ROLE_FILE="$candidate"
    break
  fi
done

if [[ -z "$ROLE_FILE" ]]; then
  echo "ERROR: Could not find a Role model."
  echo
  find models -maxdepth 1 -type f \
    \( -iname '*role*.js' -o -iname '*permission*.js' \) \
    -print
  exit 1
fi

echo "Role model: $ROLE_FILE"
echo

# ------------------------------------------------------------
# 2. Check route ordering
# ------------------------------------------------------------
echo "[2/8] Verifying admin authentication route ordering..."

AUTH_LINE="$(grep -nF 'router.use("/admin/auth", adminAuthRoutes);' routes/index.js | head -1 | cut -d: -f1 || true)"
ADMIN_LINE="$(grep -nF 'router.use("/admin", adminRoutes);' routes/index.js | head -1 | cut -d: -f1 || true)"

if [[ -z "$AUTH_LINE" || -z "$ADMIN_LINE" ]]; then
  echo "ERROR: Could not find admin auth/admin routes."
  exit 1
fi

echo "/admin/auth: line $AUTH_LINE"
echo "/admin:      line $ADMIN_LINE"

if (( AUTH_LINE >= ADMIN_LINE )); then
  echo "ERROR: /admin/auth is still after /admin."
  exit 1
fi

echo "PASS: admin authentication route is correctly ordered."
echo

# ------------------------------------------------------------
# 3. Securely request new password
# ------------------------------------------------------------
echo "[3/8] Creating/resetting admin password..."
echo

while true; do
  read -r -s -p "Enter NEW password for $EMAIL: " NEW_PASSWORD
  echo
  read -r -s -p "Confirm NEW password: " CONFIRM_PASSWORD
  echo

  if [[ -z "$NEW_PASSWORD" ]]; then
    echo "ERROR: Password cannot be empty."
    echo
    continue
  fi

  if [[ "$NEW_PASSWORD" != "$CONFIRM_PASSWORD" ]]; then
    echo "ERROR: Passwords do not match."
    echo
    continue
  fi

  if (( ${#NEW_PASSWORD} < 8 )); then
    echo "ERROR: Password must contain at least 8 characters."
    echo
    continue
  fi

  break
done

export REPAIR_ADMIN_PASSWORD="$NEW_PASSWORD"

# ------------------------------------------------------------
# 4. Repair/check database account
# ------------------------------------------------------------
echo
echo "[4/8] Checking database and repairing admin account..."

node --env-file=.env --input-type=module <<'NODE'
import mongoose from "mongoose";
import env from "./config/env.js";

const EMAIL = "admin@husseinmboyatours.test";
const TENANT_ID = "6a87fe1bc3f48c3dcddf4a23";
const NEW_PASSWORD = process.env.REPAIR_ADMIN_PASSWORD;

if (!NEW_PASSWORD) {
  throw new Error("REPAIR_ADMIN_PASSWORD was not supplied.");
}

/*
 * IMPORTANT:
 * Register referenced models before User.populate().
 */
await import("./models/Permission.js").catch(() => {});
await import("./models/Role.js").catch(async () => {
  await import("./models/AdminRole.js").catch(() => {});
});

const { default: User } = await import("./models/User.js");
const { default: Organization } = await import("./models/Organization.js");

await mongoose.connect(env.MONGODB_URI || process.env.MONGODB_URI);

console.log("MongoDB: connected");

const tenant = await Organization.findById(TENANT_ID).lean();

if (!tenant) {
  throw new Error(`Tenant ${TENANT_ID} does not exist.`);
}

if (tenant.status === "cancelled") {
  throw new Error("Tenant is cancelled.");
}

console.log("Tenant:", tenant.name);
console.log("Tenant status:", tenant.status);
console.log("Tenant ID:", String(tenant._id));

let user = await User.findOne({ email: EMAIL }).select("+password");

if (!user) {
  throw new Error(`Admin user ${EMAIL} does not exist.`);
}

console.log("Admin user found:", String(user._id));

if (!user.tenantId) {
  console.log("Admin has no tenantId. Assigning requested tenant...");
  user.tenantId = tenant._id;
} else {
  console.log("Existing tenantId:", String(user.tenantId));

  if (String(user.tenantId) !== TENANT_ID) {
    console.log("Correcting admin tenant assignment...");
    user.tenantId = tenant._id;
  }
}

/*
 * Ensure the account is active.
 */
user.status = "active";

if (Object.prototype.hasOwnProperty.call(user.toObject(), "isActive")) {
  user.isActive = true;
}

/*
 * Reset password.
 *
 * User.js should contain the project's password hashing middleware.
 * Assigning user.password and calling save() allows the existing
 * Mongoose pre-save hashing logic to run.
 */
user.password = NEW_PASSWORD;

await user.save();

console.log("Password reset successfully.");

const verificationUser = await User.findOne({ email: EMAIL }).select("+password");

if (!verificationUser) {
  throw new Error("Admin disappeared after save.");
}

const passwordWorks = await verificationUser.matchPassword(NEW_PASSWORD);

if (!passwordWorks) {
  throw new Error(
    "CRITICAL: Password verification failed after saving. Check User.js password hashing."
  );
}

console.log("Password verification: PASS");
console.log("Status:", verificationUser.status);
console.log(
  "Tenant:",
  verificationUser.tenantId ? String(verificationUser.tenantId) : "NONE"
);

/*
 * Read roleId without requiring population if possible.
 */
console.log(
  "roleId:",
  verificationUser.roleId ? String(verificationUser.roleId) : "NONE"
);
console.log(
  "legacy role:",
  verificationUser.role || "NONE"
);
console.log(
  "legacyRole:",
  verificationUser.legacyRole || "NONE"
);

await mongoose.disconnect();

console.log("MongoDB: disconnected");
NODE

unset REPAIR_ADMIN_PASSWORD

echo
echo "Admin database repair completed."
echo

# ------------------------------------------------------------
# 5. Syntax verification
# ------------------------------------------------------------
echo "[5/8] Running JavaScript syntax checks..."

node --check routes/index.js
node --check routes/adminAuthRoutes.js
node --check controllers/adminAuthController.js
node --check middleware/tenantMiddleware.js
node --check middleware/authMiddleware.js
node --check models/User.js

echo "Syntax checks: PASS"
echo

# ------------------------------------------------------------
# 6. Verify route implementation
# ------------------------------------------------------------
echo "[6/8] Verifying login route..."

grep -nF 'router.use("/admin/auth", adminAuthRoutes);' routes/index.js
grep -nF 'router.use("/admin", adminRoutes);' routes/index.js

echo
echo "Admin auth route:"
sed -n '1,80p' routes/adminAuthRoutes.js

echo

# ------------------------------------------------------------
# 7. Check whether server is running
# ------------------------------------------------------------
echo "[7/8] Checking localhost:5000..."

if curl -sS --max-time 5 http://localhost:5000/api/health >/tmp/hmt_health.json 2>/dev/null; then
  echo "Backend is running."
  cat /tmp/hmt_health.json
else
  echo "Backend is NOT responding on localhost:5000."
  echo "Start it with:"
  echo
  echo "  cd \"$SERVER_DIR\""
  echo "  npm run dev"
fi

echo

# ------------------------------------------------------------
# 8. Final instructions
# ------------------------------------------------------------
echo "[8/8] Repair completed."
echo
echo "============================================================"
echo " NEXT TEST"
echo "============================================================"
echo
echo "Use the password you just entered."
echo
echo "Do NOT use \$NEW_ADMIN_PASSWORD unless you export it."
echo
echo "Recommended test:"
echo
echo "curl -sS -i \\"
echo "  -H 'Content-Type: application/json' \\"
echo "  -H 'X-Tenant-ID: $TENANT_ID' \\"
echo "  -X POST \\"
echo "  http://localhost:5000/api/admin/auth/login \\"
echo "  --data '{\"email\":\"$EMAIL\",\"password\":\"YOUR_PASSWORD_HERE\"}'"
echo
echo "Expected:"
echo
echo "HTTP/1.1 200 OK"
echo
echo '{"success":true,"token":"...","user":{...}}'
echo
echo "============================================================"
