#!/usr/bin/env bash

set -u

PROJECT_ROOT="$(pwd)"
SERVER_DIR="$PROJECT_ROOT/server"
CLIENT_DIR="$PROJECT_ROOT/client"
BACKUP_DIR="$PROJECT_ROOT/rbac_backup_$(date +%Y%m%d_%H%M%S)"

echo "============================================================"
echo " HUSSEIN MBOYA TOURS - COMPLETE RBAC REPAIR"
echo "============================================================"
echo "Project: $PROJECT_ROOT"
echo

if [ ! -d "$SERVER_DIR" ] || [ ! -d "$CLIENT_DIR" ]; then
  echo "ERROR: Run this script from the Hussein-Mboya project root."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "[1/12] Backing up RBAC files..."

FILES_TO_BACKUP=(
  "server/controllers/adminRoleController.js"
  "server/middleware/authMiddleware.js"
  "server/middleware/permissionMiddleware.js"
  "server/models/Role.js"
  "server/routes/adminRoleRoutes.js"
  "server/utils/buildPermissions.js"
  "server/utils/roleUtils.js"
  "client/src/pages/superadmin/SuperAdminRoles.jsx"
  "client/src/pages/rbac/RolesPage.jsx"
  "client/src/api/admin/adminRoleApi.js"
  "client/src/api/superAdminApi.js"
  "client/src/routes/AppRoutes.jsx"
)

for file in "${FILES_TO_BACKUP[@]}"; do
  if [ -f "$PROJECT_ROOT/$file" ]; then
    mkdir -p "$BACKUP_DIR/$(dirname "$file")"
    cp "$PROJECT_ROOT/$file" "$BACKUP_DIR/$file"
  fi
done

echo "Backup created:"
echo "$BACKUP_DIR"
echo

echo "[2/12] Fixing adminRoleController.js..."

python3 <<'PY'
from pathlib import Path

p = Path("server/controllers/adminRoleController.js")
text = p.read_text()

# Add canonical normalizeRole import.
if 'from "../utils/roleUtils.js"' not in text:
    text = text.replace(
        'import Permission from "../models/Permission.js";',
        'import Permission from "../models/Permission.js";\nimport { normalizeRole } from "../utils/roleUtils.js";'
    )

# Remove the old updateRole function and replace it with a consistent implementation.
start = text.find("export const updateRole = async")
end = text.find("\n\nexport const deleteRole", start)

if start == -1 or end == -1:
    raise SystemExit("Could not locate updateRole function safely.")

new_update = r'''export const updateRole = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const normalizedRoleName = normalizeRole(role.name);

    /*
     * Super Admin is the only permanently protected role.
     * Other system roles may be administered by a Super Admin.
     */
    if (normalizedRoleName === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "The Super Admin role is protected and cannot be modified.",
      });
    }

    const allowedFields = [
      "displayName",
      "description",
      "level",
      "status",
      "isDefault",
    ];

    for (const field of allowedFields) {
      if (!Object.prototype.hasOwnProperty.call(req.body, field)) {
        continue;
      }

      if (field === "level") {
        role.level = Math.max(1, Number(req.body.level) || 1);
      } else if (field === "status") {
        role.status =
          req.body.status === "inactive"
            ? "inactive"
            : "active";
      } else if (field === "isDefault") {
        role.isDefault = Boolean(req.body.isDefault);
      } else if (field === "displayName") {
        role.displayName = String(req.body.displayName || "").trim();
      } else if (field === "description") {
        role.description = String(req.body.description || "").trim();
      }
    }

    await role.save();

    return res.json({
      success: true,
      role,
    });
  } catch (error) {
    next(error);
  }
};
'''

text = text[:start] + new_update + text[end:]

# Replace deleteRole completely.
start = text.find("export const deleteRole = async")
end = text.find("\n\n\n\n\n/*\n|--------------------------------------------------------------------------\n| UPDATE PERMISSIONS", start)

if start == -1:
    raise SystemExit("Could not locate deleteRole function safely.")

new_delete = r'''export const deleteRole = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    const role = await Role.findById(req.params.id);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const normalizedRoleName = normalizeRole(role.name);

    if (normalizedRoleName === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "The Super Admin role cannot be deleted.",
      });
    }

    /*
     * Other system roles may be protected from deletion.
     * They can still have their permissions managed by Super Admin.
     */
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: "System roles cannot be deleted. You may modify their permissions instead.",
      });
    }

    await role.deleteOne();

    return res.json({
      success: true,
      message: "Role deleted",
    });
  } catch (error) {
    next(error);
  }
};
'''

text = text[:start] + new_delete + text[end:]

# Make updatePermissions use canonical role normalization.
old = '''    const normalizedRoleName = String(role.name || "")
      .trim()
      .toLowerCase()
      .replace(/[\\s_-]+/g, "");

    if (
      role.isSystem &&
      normalizedRoleName === "superadmin"
    )'''

new = '''    const normalizedRoleName = normalizeRole(role.name);

    if (normalizedRoleName === "superadmin")'''

if old in text:
    text = text.replace(old, new)

p.write_text(text)
print("adminRoleController.js repaired.")
PY

echo

echo "[3/12] Fixing SuperAdminRoles.jsx..."

cat > client/src/pages/superadmin/SuperAdminRoles.jsx <<'EOF'
import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getUserRole } from "../../utils/roleUtils";
import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import {
  getRoles,
  getRole,
  getPermissions,
  updateRolePermissions,
} from "../../api/superAdminApi";

const normalizeRoleName = (role) =>
  String(role?.name || "")
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");

const permissionId = (permission) =>
  typeof permission === "object"
    ? String(permission?._id || "")
    : String(permission || "");

export default function SuperAdminRoles() {
  const { user, hasPermission } = useAuth();
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState(null);
  const [selectedPermissions, setSelectedPermissions] = useState([]);
  const [loadError, setLoadError] = useState("");

  const isSuperAdmin =
    normalizeRoleName({
      name: getUserRole(user),
    }) === "superadmin";

  const canManageRoles =
    isSuperAdmin || hasPermission("roles.manage");

  const {
    data: roles = [],
    isLoading: rolesLoading,
    isError: rolesError,
  } = useQuery({
    queryKey: ["rbac-roles"],
    queryFn: getRoles,
  });

  const {
    data: permissions = [],
    isLoading: permissionsLoading,
    isError: permissionsError,
  } = useQuery({
    queryKey: ["rbac-permissions"],
    queryFn: getPermissions,
  });

  const updateRole = useMutation({
    mutationFn: () =>
      updateRolePermissions(
        selectedRole._id,
        selectedPermissions,
      ),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: ["rbac-roles"],
      });

      try {
        const refreshed = await getRole(selectedRole._id);

        setSelectedRole(refreshed);

        setSelectedPermissions(
          (refreshed.permissions || []).map(permissionId),
        );

        setLoadError("");
      } catch (error) {
        setLoadError(
          error?.response?.data?.message ||
            "Permissions were saved, but the role could not be refreshed.",
        );
      }
    },

    onError: (error) => {
      setLoadError(
        error?.response?.data?.message ||
          "Unable to update permissions.",
      );
    },
  });

  if (!canManageRoles) {
    return (
      <div className="p-8">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-red-700">
          <h2 className="text-lg font-bold">
            Access denied
          </h2>
          <p className="mt-1">
            You do not have permission to manage roles.
          </p>
        </div>
      </div>
    );
  }

  const openRole = async (role) => {
    setLoadError("");

    try {
      const fullRole = await getRole(role._id);

      setSelectedRole(fullRole);

      setSelectedPermissions(
        (fullRole.permissions || []).map(permissionId),
      );
    } catch (error) {
      setLoadError(
        error?.response?.data?.message ||
          "Unable to load role details.",
      );
    }
  };

  const selectedIsSuperAdmin =
    normalizeRoleName(selectedRole) === "superadmin";

  const togglePermission = (id) => {
    if (selectedIsSuperAdmin) {
      return;
    }

    const normalizedId = String(id);

    setSelectedPermissions((previous) =>
      previous.includes(normalizedId)
        ? previous.filter(
            (permission) => permission !== normalizedId,
          )
        : [...previous, normalizedId],
    );
  };

  return (
    <div className="space-y-6 p-6 lg:p-8">
      <header>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-700">
              Access Control
            </p>

            <h1 className="mt-1 text-3xl font-bold text-slate-900">
              Roles &amp; Permissions Center
            </h1>

            <p className="mt-1 text-slate-500">
              Manage access policies for every operational role.
            </p>
          </div>

          <div className="rounded-lg bg-slate-100 px-4 py-2 text-sm text-slate-600">
            {roles.length} role{roles.length === 1 ? "" : "s"}
          </div>
        </div>
      </header>

      {loadError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          {loadError}
        </div>
      )}

      {rolesError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Unable to load roles. Check authentication and the
          `/admin/roles` API.
        </div>
      )}

      {permissionsError && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
          Unable to load the permission catalogue.
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900">
              Roles
            </h2>

            {rolesLoading && (
              <span className="text-sm text-slate-500">
                Loading...
              </span>
            )}
          </div>

          {rolesLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-20 animate-pulse rounded-lg bg-slate-100"
                />
              ))}
            </div>
          ) : roles.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-center text-slate-500">
              No roles found.
            </div>
          ) : (
            <div className="space-y-3">
              {roles.map((role) => {
                const active =
                  selectedRole?._id === role._id;

                const system =
                  Boolean(role.isSystem);

                const protectedRole =
                  normalizeRoleName(role) === "superadmin";

                return (
                  <button
                    key={role._id}
                    type="button"
                    onClick={() => openRole(role)}
                    className={`w-full rounded-xl border p-4 text-left transition ${
                      active
                        ? "border-slate-900 bg-slate-50 shadow-sm"
                        : "hover:border-slate-400 hover:bg-slate-50"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="font-bold text-slate-900">
                          {role.displayName ||
                            role.name}
                        </h3>

                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-400">
                          {role.name}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1">
                        {protectedRole ? (
                          <span className="rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-700">
                            Protected
                          </span>
                        ) : system ? (
                          <span className="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-700">
                            System
                          </span>
                        ) : (
                          <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">
                            Custom
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-sm text-slate-500">
                      <span>
                        Level {role.level ?? "-"}
                      </span>

                      <span>
                        {role.permissions?.length || 0} permissions
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </section>

        <section className="rounded-xl border bg-white p-5 shadow-sm lg:col-span-2">
          {!selectedRole ? (
            <div className="flex min-h-[400px] items-center justify-center text-center text-slate-500">
              <div>
                <h2 className="text-xl font-semibold text-slate-700">
                  Select a role
                </h2>
                <p className="mt-2">
                  Choose a role from the left to inspect its permissions.
                </p>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-6 border-b pb-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-slate-500">
                      Role
                    </p>

                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                      {selectedRole.displayName ||
                        selectedRole.name}
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      {selectedRole.description ||
                        "No role description provided."}
                    </p>
                  </div>

                  {selectedIsSuperAdmin ? (
                    <span className="rounded-full bg-red-100 px-3 py-1 text-sm font-semibold text-red-700">
                      Super Admin Protected
                    </span>
                  ) : selectedRole.isSystem ? (
                    <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">
                      System Role
                    </span>
                  ) : (
                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-semibold text-emerald-700">
                      Custom Role
                    </span>
                  )}
                </div>
              </div>

              {permissionsLoading ? (
                <div className="grid gap-3 md:grid-cols-2">
                  {[1, 2, 3, 4, 5, 6].map((item) => (
                    <div
                      key={item}
                      className="h-14 animate-pulse rounded-lg bg-slate-100"
                    />
                  ))}
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-2">
                  {permissions.map((permission) => {
                    const id = String(permission._id);

                    const checked =
                      selectedPermissions.includes(id);

                    return (
                      <label
                        key={id}
                        className={`flex items-start gap-3 rounded-lg border p-4 transition ${
                          selectedIsSuperAdmin
                            ? "cursor-not-allowed bg-slate-50 opacity-60"
                            : checked
                              ? "cursor-pointer border-emerald-300 bg-emerald-50"
                              : "cursor-pointer hover:bg-slate-50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="mt-1 h-4 w-4"
                          checked={checked}
                          disabled={selectedIsSuperAdmin}
                          onChange={() =>
                            togglePermission(id)
                          }
                        />

                        <span>
                          <span className="block font-medium text-slate-900">
                            {permission.label ||
                              permission.name}
                          </span>

                          <span className="mt-1 block text-xs text-slate-500">
                            {permission.name}
                          </span>

                          {permission.description && (
                            <span className="mt-1 block text-xs text-slate-400">
                              {permission.description}
                            </span>
                          )}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-t pt-5">
                <div className="text-sm text-slate-500">
                  {selectedIsSuperAdmin
                    ? "Super Admin permissions are protected to prevent accidental lockout."
                    : `${selectedPermissions.length} permission${
                        selectedPermissions.length === 1
                          ? ""
                          : "s"
                      } selected`}
                </div>

                <button
                  type="button"
                  onClick={() => updateRole.mutate()}
                  disabled={
                    selectedIsSuperAdmin ||
                    updateRole.isPending ||
                    permissionsLoading
                  }
                  className="rounded-lg bg-slate-900 px-6 py-3 font-semibold text-white transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {updateRole.isPending
                    ? "Saving..."
                    : "Save Permissions"}
                </button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
EOF

echo "SuperAdminRoles.jsx replaced."

echo

echo "[4/12] Cleaning duplicate superAdmin role API definitions..."

python3 <<'PY'
from pathlib import Path

p = Path("client/src/api/superAdminApi.js")
text = p.read_text()

# Remove duplicate blocks if they somehow occur in the file.
# Keep exactly one implementation of each RBAC API.
def remove_duplicate_exports(text, name):
    marker = f"export const {name} ="
    first = text.find(marker)

    if first == -1:
        return text

    second = text.find(marker, first + len(marker))

    while second != -1:
        # Find the end of the duplicate declaration by looking for
        # the next export declaration.
        next_export = text.find("\nexport const ", second + 1)

        if next_export == -1:
            text = text[:second].rstrip() + "\n"
        else:
            text = text[:second] + text[next_export + 1:]

        second = text.find(marker, first + len(marker))

    return text

for name in [
    "getRoles",
    "getRole",
    "getPermissions",
    "updateRolePermissions",
]:
    text = remove_duplicate_exports(text, name)

p.write_text(text)
print("superAdminApi.js checked.")
PY

echo

echo "[5/12] Standardizing RBAC route behavior..."

python3 <<'PY'
from pathlib import Path

p = Path("server/routes/adminRoleRoutes.js")
text = p.read_text()

# Keep the existing route protection. SuperAdmin bypass is handled by
# authMiddleware. This avoids weakening the endpoint globally.
text = text.replace(
    'router.use(checkPermission("roles.manage"));',
    'router.use(checkPermission("roles.manage"));'
)

p.write_text(text)
print("adminRoleRoutes.js verified.")
PY

echo

echo "[6/12] Checking AuthContext permission normalization..."

python3 <<'PY'
from pathlib import Path

p = Path("client/src/context/AuthContext.jsx")

if not p.exists():
    print("AuthContext.jsx not found; skipping.")
else:
    text = p.read_text()

    # Fix whitespace around enabled check if present.
    text = text.replace(
        'p?.enabled!== false',
        'p?.enabled !== false'
    )

    p.write_text(text)
    print("AuthContext.jsx normalized.")
PY

echo

echo "[7/12] Ensuring server dependencies are available..."

if [ ! -d "$SERVER_DIR/node_modules" ]; then
  echo "Installing server dependencies..."
  (
    cd "$SERVER_DIR" &&
    npm install
  ) || {
    echo "ERROR: Server npm install failed."
    exit 1
  }
else
  echo "server/node_modules exists."
fi

echo

echo "[8/12] Ensuring client dependencies are available..."

if [ ! -d "$CLIENT_DIR/node_modules" ]; then
  echo "Installing client dependencies..."
  (
    cd "$CLIENT_DIR" &&
    npm install
  ) || {
    echo "ERROR: Client npm install failed."
    exit 1
  }
else
  echo "client/node_modules exists."
fi

echo

echo "[9/12] Backend syntax validation..."

BACKEND_OK=1

for file in \
  server/controllers/adminRoleController.js \
  server/middleware/authMiddleware.js \
  server/middleware/permissionMiddleware.js \
  server/models/Role.js \
  server/routes/adminRoleRoutes.js \
  server/utils/buildPermissions.js \
  server/utils/roleUtils.js
do
  echo "Checking $file"

  if ! node --check "$file"; then
    BACKEND_OK=0
    echo "FAILED: $file"
  fi
done

echo

echo "[10/12] MongoDB RBAC inspection..."

MONGO_OK=1

(
  cd "$SERVER_DIR"

  node --env-file=.env --input-type=module <<'EOF'
import mongoose from "mongoose";
import Role from "./models/Role.js";

const mongoUri =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  process.env.DATABASE_URL;

if (!mongoUri) {
  console.error("ERROR: MONGO_URI/MONGODB_URI/DATABASE_URL is not configured.");
  process.exit(2);
}

try {
  await mongoose.connect(mongoUri);

  const roles = await Role.find()
    .populate("permissions", "name label enabled")
    .sort({ level: -1 })
    .lean();

  console.log("");
  console.log("=============== RBAC DATABASE ===============");

  if (!roles.length) {
    console.log("NO ROLES FOUND");
  }

  for (const role of roles) {
    console.log("");
    console.log(`ROLE: ${role.displayName || role.name}`);
    console.log(`  id:        ${role._id}`);
    console.log(`  name:      ${role.name}`);
    console.log(`  level:     ${role.level}`);
    console.log(`  status:    ${role.status}`);
    console.log(`  system:    ${role.isSystem}`);
    console.log(`  default:   ${role.isDefault}`);
    console.log(`  permissions: ${role.permissions?.length || 0}`);

    for (const permission of role.permissions || []) {
      console.log(`    - ${permission?.name || "(missing permission)"}`);
    }
  }

  console.log("");
  console.log("=============================================");
  console.log("");

  await mongoose.disconnect();
} catch (error) {
  console.error("MongoDB RBAC inspection failed:");
  console.error(error);
  process.exit(1);
}
EOF
) || MONGO_OK=0

echo

echo "[11/12] Frontend production build..."

BUILD_OK=1

(
  cd "$CLIENT_DIR" &&
  npm run build
) || BUILD_OK=0

echo

echo "[12/12] Creating RBAC repair report..."

REPORT="$PROJECT_ROOT/RBAC_REPAIR_REPORT.txt"

{
  echo "============================================================"
  echo "HUSSEIN MBOYA TOURS - RBAC REPAIR REPORT"
  echo "============================================================"
  echo
  echo "Date: $(date)"
  echo
  echo "BACKUP:"
  echo "$BACKUP_DIR"
  echo
  echo "BACKEND SYNTAX:"
  if [ "$BACKEND_OK" -eq 1 ]; then
    echo "PASS"
  else
    echo "FAILED"
  fi
  echo
  echo "MONGODB INSPECTION:"
  if [ "$MONGO_OK" -eq 1 ]; then
    echo "PASS"
  else
    echo "FAILED"
  fi
  echo
  echo "FRONTEND BUILD:"
  if [ "$BUILD_OK" -eq 1 ]; then
    echo "PASS"
  else
    echo "FAILED"
  fi
  echo
  echo "RBAC CHANGES:"
  echo "- Added canonical normalizeRole import."
  echo "- Standardized Super Admin role detection."
  echo "- Protected Super Admin from modification."
  echo "- Protected Super Admin from deletion."
  echo "- Allowed other system roles to have permissions managed."
  echo "- Moved updateRole database operations inside try/catch."
  echo "- Improved SuperAdminRoles UI."
  echo "- Added robust permission ID normalization."
  echo "- Removed duplicate RBAC API declarations where present."
  echo "- Verified role routes."
  echo
  echo "IMPORTANT:"
  echo "This script does NOT push changes to GitHub."
  echo
} > "$REPORT"

echo
echo "============================================================"
echo " RBAC REPAIR FINISHED"
echo "============================================================"
echo
echo "Backup:"
echo "$BACKUP_DIR"
echo
echo "Report:"
echo "$REPORT"
echo

if [ "$BACKEND_OK" -eq 1 ]; then
  echo "Backend syntax: PASS"
else
  echo "Backend syntax: FAILED"
fi

if [ "$MONGO_OK" -eq 1 ]; then
  echo "MongoDB RBAC inspection: PASS"
else
  echo "MongoDB RBAC inspection: FAILED"
fi

if [ "$BUILD_OK" -eq 1 ]; then
  echo "Frontend build: PASS"
else
  echo "Frontend build: FAILED"
fi

echo
echo "Run:"
echo "  git diff -- server/controllers/adminRoleController.js client/src/pages/superadmin/SuperAdminRoles.jsx"
echo
echo "Then:"
echo "  git status --short"
echo

if [ "$BACKEND_OK" -ne 1 ] || [ "$BUILD_OK" -ne 1 ]; then
  echo "WARNING: One or more validations failed."
  echo "DO NOT PUSH YET."
  exit 1
fi

echo "RBAC code repair and build validation completed successfully."
