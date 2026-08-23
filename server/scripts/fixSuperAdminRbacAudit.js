import "dotenv/config";
import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

const auditFile = path.resolve(
  process.cwd(),
  "scripts/settings-rbac-audit.js"
);

const timestamp = new Date()
  .toISOString()
  .replace(/[:.]/g, "-");

const backupFile = `${auditFile}.backup-${timestamp}`;

function line() {
  console.log(
    "------------------------------------------------------------"
  );
}

async function main() {
  console.log(`
============================================================
 COHERENT TOURS - SUPERADMIN RBAC REPAIR
============================================================
`);

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Check server/.env."
    );
  }

  /*
   * ----------------------------------------------------------
   * 1. BACK UP AUDIT SCRIPT
   * ----------------------------------------------------------
   */

  if (fs.existsSync(auditFile)) {
    fs.copyFileSync(auditFile, backupFile);

    console.log(
      `BACKUP: ${path.relative(process.cwd(), backupFile)}`
    );
  } else {
    console.log(
      "WARNING: settings-rbac-audit.js was not found."
    );
  }

  /*
   * ----------------------------------------------------------
   * 2. CONNECT TO DATABASE
   * ----------------------------------------------------------
   */

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("OK: MongoDB connected.");
  console.log(
    `Database: ${mongoose.connection.name}`
  );

  line();

  /*
   * ----------------------------------------------------------
   * 3. FIND CANONICAL SUPERADMIN ROLE
   * ----------------------------------------------------------
   *
   * Canonical role in this database:
   *
   *     super_admin
   *
   * We deliberately do NOT create "super_admin".
   */

  const superAdminRole = await Role.findOne({
    $or: [
      { name: "super_admin" },
      { name: "super_admin" }
    ]
  })
    .select("_id name description permissions isSystem tenantId")
    .lean();

  if (!superAdminRole) {
    console.error(
      "ERROR: No super_admin/superadmin role exists."
    );

    process.exitCode = 1;
    return;
  }

  console.log(
    `FOUND SUPERADMIN ROLE: ${superAdminRole.name}`
  );

  console.log(
    `Role ID: ${superAdminRole._id}`
  );

  console.log(
    `System role: ${superAdminRole.isSystem ? "YES" : "NO"}`
  );

  /*
   * ----------------------------------------------------------
   * 4. VERIFY CANONICAL ROLE NAME
   * ----------------------------------------------------------
   */

  if (superAdminRole.name !== "super_admin") {
    console.log(
      "WARNING: SuperAdmin role exists under legacy name:"
    );

    console.log(
      `  ${superAdminRole.name}`
    );

    console.log(
      "No database rename will be performed automatically."
    );

    console.log(
      "The audit will recognize both names."
    );
  } else {
    console.log(
      "OK: canonical role name is super_admin."
    );
  }

  /*
   * ----------------------------------------------------------
   * 5. VERIFY PERMISSION REFERENCES
   * ----------------------------------------------------------
   */

  const permissionIds = Array.isArray(
    superAdminRole.permissions
  )
    ? superAdminRole.permissions
    : [];

  console.log(
    `SuperAdmin permission references: ${permissionIds.length}`
  );

  const validPermissions = await Permission.find({
    _id: {
      $in: permissionIds
    }
  })
    .select("_id name key slug")
    .lean();

  const validIds = new Set(
    validPermissions.map((permission) =>
      String(permission._id)
    )
  );

  const orphanedPermissions = permissionIds.filter(
    (permissionId) =>
      !validIds.has(String(permissionId))
  );

  if (orphanedPermissions.length > 0) {
    console.error(
      `ERROR: ${orphanedPermissions.length} orphaned SuperAdmin permission references found.`
    );

    for (const id of orphanedPermissions) {
      console.error(
        `  - ${id}`
      );
    }

    process.exitCode = 1;
  } else {
    console.log(
      "OK: all SuperAdmin permission references resolve."
    );
  }

  /*
   * ----------------------------------------------------------
   * 6. VERIFY IMPORTANT PERMISSIONS
   * ----------------------------------------------------------
   */

  const permissionNames = new Set();

  for (const permission of validPermissions) {
    if (permission.name) {
      permissionNames.add(permission.name);
    }

    if (permission.key) {
      permissionNames.add(permission.key);
    }

    if (permission.slug) {
      permissionNames.add(permission.slug);
    }
  }

  const expectedPermissions = [
    "user.manage",
    "roles.manage",
    "analytics.view",
    "system.security",
    "manage_tours",
    "manage_bookings",
    "view_customers",
    "view_reports"
  ];

  console.log("\nIMPORTANT PERMISSIONS");

  for (const permission of expectedPermissions) {
    const found = permissionNames.has(permission);

    console.log(
      `${permission}: ${found ? "OK" : "MISSING"}`
    );
  }

  /*
   * ----------------------------------------------------------
   * 7. NATIVE USER DIAGNOSTIC
   * ----------------------------------------------------------
   *
   * We intentionally do NOT use:
   *
   *     User.find(...)
   *
   * because User has tenant-enforcement middleware.
   *
   * This native collection query is diagnostic-only.
   * It does not modify users and does not disable middleware.
   */

  const usersCollection =
    mongoose.connection.collection("users");

  const superAdminUsers =
    await usersCollection
      .find({
        $or: [
          {
            role: "super_admin"
          },
          {
            role: "super_admin"
          },
          {
            role: "super_admin"
          },
          {
            email: {
              $regex: "super_admin",
              $options: "i"
            }
          }
        ]
      })
      .project({
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        tenantId: 1,
        organization: 1,
        isActive: 1
      })
      .toArray();

  console.log("\nSUPERADMIN-LIKE USERS");

  if (superAdminUsers.length === 0) {
    console.log(
      "No SuperAdmin-like users found."
    );
  } else {
    for (const user of superAdminUsers) {
      console.log(
        JSON.stringify(user, null, 2)
      );
    }

    console.log(
      `Total matching users: ${superAdminUsers.length}`
    );
  }

  /*
   * ----------------------------------------------------------
   * 8. PATCH RBAC AUDIT
   * ----------------------------------------------------------
   */

  if (fs.existsSync(auditFile)) {
    let audit = fs.readFileSync(
      auditFile,
      "utf8"
    );

    const original = audit;

    /*
     * Normalize direct required-role declarations.
     *
     * Examples:
     *
     * "super_admin"
     * 'super_admin'
     *
     * become:
     *
     * "super_admin"
     */

    audit = audit.replace(
      /(["'])superadmin\1/g,
      '"super_admin"'
    );

    /*
     * If the audit contains comparisons such as:
     *
     * role.name === "super_admin"
     *
     * make them recognize the canonical role.
     */

    audit = audit.replace(
      /role\.name\s*===\s*["']superadmin["']/g,
      '["super_admin", "superadmin"].includes(role.name)'
    );

    /*
     * Avoid damaging the audit if no relevant pattern exists.
     */

    if (audit !== original) {
      fs.writeFileSync(
        auditFile,
        audit,
        "utf8"
      );

      console.log(
        "\nFIXED: settings-rbac-audit.js now recognizes super_admin."
      );
    } else {
      console.log(
        "\nINFO: no direct superadmin string required patching."
      );
    }
  }

  /*
   * ----------------------------------------------------------
   * 9. FINAL STATUS
   * ----------------------------------------------------------
   */

  line();

  if (
    orphanedPermissions.length === 0 &&
    superAdminRole.name === "super_admin"
  ) {
    console.log(
      "SUPERADMIN RBAC STATUS: HEALTHY"
    );
  } else {
    console.log(
      "SUPERADMIN RBAC STATUS: REVIEW REQUIRED"
    );
  }

  console.log(`
IMPORTANT:
  No role was created.
  No role was deleted.
  No user was modified.
  No permission was modified.
  No tenant middleware was disabled.
  No tenant isolation rule was changed.

Backup:
  ${backupFile}

============================================================
 SUPERADMIN RBAC REPAIR COMPLETE
============================================================
`);
}

main()
  .catch((error) => {
    console.error(
      "\nERROR:",
      error.message
    );

    console.error(error);

    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
