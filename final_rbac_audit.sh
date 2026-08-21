#!/usr/bin/env bash

set -u

PROJECT_ROOT="$(pwd)"
SERVER_DIR="$PROJECT_ROOT/server"
CLIENT_DIR="$PROJECT_ROOT/client"

echo "============================================================"
echo " HUSSEIN MBOYA TOURS - FINAL RBAC PRODUCTION AUDIT"
echo "============================================================"

FAIL=0

echo
echo "[1/10] Checking required RBAC files..."

FILES=(
  "server/controllers/adminRoleController.js"
  "server/routes/adminRoleRoutes.js"
  "server/middleware/authMiddleware.js"
  "server/utils/roleUtils.js"
  "server/models/Role.js"
  "client/src/api/superAdminApi.js"
  "client/src/api/admin/adminRoleApi.js"
  "client/src/pages/superadmin/SuperAdminRoles.jsx"
  "client/src/pages/admin/roles/AdminRoles.jsx"
  "client/src/pages/rbac/RolesPage.jsx"
)

for file in "${FILES[@]}"; do
  if [ -f "$file" ]; then
    echo "PASS: $file"
  else
    echo "FAIL: missing $file"
    FAIL=1
  fi
done


echo
echo "[2/10] Checking duplicate SuperAdmin RBAC API exports..."

COUNT=$(grep -Ec '^export const (getRoles|getRole|getPermissions|updateRolePermissions)' \
  client/src/api/superAdminApi.js || true)

echo "RBAC exports found: $COUNT"

if [ "$COUNT" -eq 4 ]; then
  echo "PASS: no duplicate SuperAdmin RBAC exports"
else
  echo "FAIL: unexpected RBAC export count"
  FAIL=1
fi


echo
echo "[3/10] Checking role route registration..."

if grep -q 'router.use("/admin/roles", adminRoleRoutes)' server/routes/index.js; then
  echo "PASS: /admin/roles registered"
else
  echo "FAIL: /admin/roles not registered"
  FAIL=1
fi


echo
echo "[4/10] Checking RBAC controller exports..."

REQUIRED_EXPORTS=(
  getRoles
  getPermissions
  getRole
  createRole
  updateRole
  deleteRole
  updatePermissions
)

for name in "${REQUIRED_EXPORTS[@]}"; do
  if grep -qE "^export const $name" server/controllers/adminRoleController.js; then
    echo "PASS: $name"
  else
    echo "FAIL: missing controller export $name"
    FAIL=1
  fi
done


echo
echo "[5/10] Checking role normalization..."

if grep -q 'export function normalizeRole' server/utils/roleUtils.js &&
   grep -q 'super_admin: "superadmin"' server/utils/roleUtils.js; then
  echo "PASS: role normalization"
else
  echo "FAIL: role normalization"
  FAIL=1
fi


echo
echo "[6/10] Checking Super Admin protection..."

if grep -q 'role === "superadmin"' server/middleware/authMiddleware.js &&
   grep -q 'return next()' server/middleware/authMiddleware.js; then
  echo "PASS: Super Admin permission bypass exists"
else
  echo "FAIL: Super Admin bypass not detected"
  FAIL=1
fi


echo
echo "[7/10] Backend syntax validation..."

BACKEND_FILES=(
  server/controllers/adminRoleController.js
  server/routes/adminRoleRoutes.js
  server/middleware/authMiddleware.js
  server/utils/roleUtils.js
  server/models/Role.js
)

for file in "${BACKEND_FILES[@]}"; do
  if node --check "$file" >/dev/null 2>&1; then
    echo "PASS: $file"
  else
    echo "FAIL: $file"
    node --check "$file"
    FAIL=1
  fi
done


echo
echo "[8/10] MongoDB RBAC validation..."

(
  cd "$SERVER_DIR"

  node --env-file=.env --input-type=module <<'EOF'
import mongoose from "mongoose";
import Role from "./models/Role.js";

const uri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

if (!uri) {
  console.error("FAIL: MongoDB URI not configured.");
  process.exit(1);
}

try {
  await mongoose.connect(uri);

  const roles = await Role.find()
    .populate("permissions", "name label enabled")
    .sort({ level: -1 })
    .lean();

  console.log(`Roles found: ${roles.length}`);

  if (roles.length === 0) {
    console.error("FAIL: no roles found.");
    process.exit(1);
  }

  const requiredRoles = [
    "super_admin",
    "admin",
    "manager",
    "tour_guide",
    "driver",
    "agent",
    "customer"
  ];

  const names = new Set(roles.map(r => r.name));

  for (const required of requiredRoles) {
    if (!names.has(required)) {
      console.error(`FAIL: missing role ${required}`);
      process.exit(1);
    }
  }

  const superAdmin = roles.find(r => r.name === "super_admin");

  if (!superAdmin) {
    console.error("FAIL: super_admin missing.");
    process.exit(1);
  }

  if (superAdmin.isSystem !== true) {
    console.error("FAIL: super_admin must be a system role.");
    process.exit(1);
  }

  if ((superAdmin.permissions || []).length === 0) {
    console.error("FAIL: super_admin has no permissions.");
    process.exit(1);
  }

  console.log("PASS: all required roles exist.");
  console.log(
    `PASS: super_admin permissions = ${superAdmin.permissions.length}`
  );

  for (const role of roles) {
    console.log(
      `${role.name.padEnd(15)} permissions=${role.permissions?.length || 0}`
    );
  }

  await mongoose.disconnect();
} catch (error) {
  console.error(error);
  process.exit(1);
}
EOF
) || FAIL=1


echo
echo "[9/10] Frontend production build..."

if (
  cd "$CLIENT_DIR" &&
  npm run build
); then
  echo "PASS: frontend production build"
else
  echo "FAIL: frontend production build"
  FAIL=1
fi


echo
echo "[10/10] Checking accidental backup files..."

BACKUP_FOUND=0

for pattern in \
  "rbac_backup_*" \
  ".superadmin-account-backup-*" \
  "backups"
do
  if compgen -G "$pattern" > /dev/null 2>&1; then
    echo "FOUND: $pattern"
    BACKUP_FOUND=1
  fi
done

if [ "$BACKUP_FOUND" -eq 1 ]; then
  echo
  echo "NOTE: backup files exist but will NOT be deleted automatically."
  echo "Review them before removing."
else
  echo "PASS: no backup directories detected."
fi


echo
echo "============================================================"
echo " FINAL RESULT"
echo "============================================================"

if [ "$FAIL" -eq 0 ]; then
  echo
  echo "SUCCESS"
  echo
  echo "RBAC is structurally ready for commit."
  echo
  echo "Next commands:"
  echo
  echo "git status --short"
  echo
  echo "git diff --check"
  echo
  echo "git diff --stat"
  echo
else
  echo
  echo "FAILED"
  echo
  echo "One or more checks failed."
  echo "DO NOT PUSH YET."
  echo
  exit 1
fi

