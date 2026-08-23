import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";

const SUPERADMIN_EMAIL = "platform@globaltours.test";
const CANONICAL_ROLE = "super_admin";
const LEGACY_ROLE = "superadmin";

async function main() {
  console.log(`
============================================================
 COHERENT TOURS - SUPERADMIN ROLE CONSISTENCY FIX
============================================================
`);

  if (!process.env.MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is not configured. Make sure server/.env exists."
    );
  }

  await mongoose.connect(process.env.MONGODB_URI);

  console.log("OK: MongoDB connected.");
  console.log(`Database: ${mongoose.connection.name}`);

  const db = mongoose.connection.db;
  const users = db.collection("users");
  const roles = db.collection("roles");

  console.log(`
------------------------------------------------------------
 STEP 1: VERIFY CANONICAL RBAC ROLE
------------------------------------------------------------
`);

  const canonicalRole = await roles.findOne({
    name: CANONICAL_ROLE,
  });

  if (!canonicalRole) {
    throw new Error(
      `Canonical RBAC role '${CANONICAL_ROLE}' does not exist.`
    );
  }

  const permissionCount = Array.isArray(canonicalRole.permissions)
    ? canonicalRole.permissions.length
    : 0;

  console.log(`Role: ${canonicalRole.name}`);
  console.log(`Role ID: ${canonicalRole._id}`);
  console.log(`System role: ${canonicalRole.isSystem ? "YES" : "NO"}`);
  console.log(`Permissions: ${permissionCount}`);

  if (!canonicalRole.isSystem) {
    throw new Error(
      "Refusing to modify the user because super_admin is not marked as a system role."
    );
  }

  if (permissionCount === 0) {
    throw new Error(
      "Refusing to modify the user because super_admin has no permissions."
    );
  }

  console.log("OK: canonical SuperAdmin role is healthy.");

  console.log(`
------------------------------------------------------------
 STEP 2: LOCATE SUPERADMIN USER
------------------------------------------------------------
`);

  const user = await users.findOne({
    email: SUPERADMIN_EMAIL,
  });

  if (!user) {
    throw new Error(
      `SuperAdmin user '${SUPERADMIN_EMAIL}' was not found.`
    );
  }

  console.log(`User ID: ${user._id}`);
  console.log(`Name: ${user.name}`);
  console.log(`Email: ${user.email}`);
  console.log(`Current role: ${user.role}`);
  console.log(`Tenant ID: ${user.tenantId ?? "null"}`);
  console.log(`Active: ${user.isActive === false ? "NO" : "YES"}`);

  /*
   * We only normalize the known legacy SuperAdmin value.
   *
   * We deliberately do NOT overwrite arbitrary roles.
   */
  if (user.role === CANONICAL_ROLE) {
    console.log(`
OK: User already uses canonical role '${CANONICAL_ROLE}'.
No database modification is required.
`);
  } else if (user.role === LEGACY_ROLE) {
    console.log(`
LEGACY ROLE DETECTED:
  ${LEGACY_ROLE}

NORMALIZING TO:
  ${CANONICAL_ROLE}
`);

    const result = await users.updateOne(
      {
        _id: user._id,
        role: LEGACY_ROLE,
      },
      {
        $set: {
          role: CANONICAL_ROLE,
        },
      }
    );

    if (result.modifiedCount !== 1) {
      throw new Error(
        "The SuperAdmin user was not modified. Aborting verification."
      );
    }

    console.log(
      "OK: SuperAdmin user role normalized to 'super_admin'."
    );
  } else {
    throw new Error(
      `Unexpected role '${user.role}'. Refusing to overwrite it automatically.`
    );
  }

  console.log(`
------------------------------------------------------------
 STEP 3: VERIFY USER AFTER REPAIR
------------------------------------------------------------
`);

  const repairedUser = await users.findOne(
    {
      _id: user._id,
    },
    {
      projection: {
        _id: 1,
        name: 1,
        email: 1,
        role: 1,
        tenantId: 1,
        organization: 1,
        isActive: 1,
      },
    }
  );

  console.log(JSON.stringify(repairedUser, null, 2));

  if (repairedUser.role !== CANONICAL_ROLE) {
    throw new Error(
      `Verification failed. User role is '${repairedUser.role}', expected '${CANONICAL_ROLE}'.`
    );
  }

  console.log(`
------------------------------------------------------------
 STEP 4: VERIFY ROLE/PERMISSION CONSISTENCY
------------------------------------------------------------
`);

  const finalRole = await roles.findOne({
    name: repairedUser.role,
  });

  if (!finalRole) {
    throw new Error(
      `No RBAC role exists for user role '${repairedUser.role}'.`
    );
  }

  const finalPermissionCount = Array.isArray(finalRole.permissions)
    ? finalRole.permissions.length
    : 0;

  console.log(`User role: ${repairedUser.role}`);
  console.log(`RBAC role: ${finalRole.name}`);
  console.log(`System role: ${finalRole.isSystem ? "YES" : "NO"}`);
  console.log(`Permission count: ${finalPermissionCount}`);

  if (repairedUser.role !== finalRole.name) {
    throw new Error(
      "User role and RBAC role names do not match."
    );
  }

  if (finalPermissionCount === 0) {
    throw new Error(
      "SuperAdmin RBAC role has zero permissions."
    );
  }

  console.log("OK: user and RBAC role are now consistent.");

  console.log(`
============================================================
 SUPERADMIN ROLE CONSISTENCY: HEALTHY
============================================================

User:
  ${repairedUser.email}

Stored role:
  ${repairedUser.role}

Canonical RBAC role:
  ${finalRole.name}

Permissions:
  ${finalPermissionCount}

No permissions were changed.
No roles were created.
No roles were deleted.
No tenant isolation rules were changed.
============================================================
`);
}

main()
  .catch((error) => {
    console.error(`
============================================================
 REPAIR FAILED
============================================================
`);
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });
