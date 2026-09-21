import dotenv from "dotenv";
import mongoose from "mongoose";

import { normalizeRole } from "../utils/roleUtils.js";

dotenv.config();

const APPLY = String(process.env.APPLY_ROLE_NORMALIZATION || "").toLowerCase() === "true";

const normalizeRoleDocument = (role) =>
  normalizeRole(role?.name || role?.displayName || role?.role || "");

const tenantKey = (tenantId) => String(tenantId || "platform");

const migrateRoles = async () => {
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");

  await mongoose.connect(process.env.MONGODB_URI);

  const db = mongoose.connection.db;
  const roles = await db.collection("roles").find({}).sort({ createdAt: 1, _id: 1 }).toArray();
  const users = await db.collection("users").find({}).project({ _id: 1, tenantId: 1, roleId: 1, role: 1, legacyRole: 1 }).toArray();

  const groups = new Map();
  for (const role of roles) {
    const canonical = normalizeRoleDocument(role);
    if (!canonical) continue;
    const key = `${tenantKey(role.tenantId)}:${canonical}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push({ ...role, canonical });
  }

  const userOps = [];
  const roleOps = [];
  const deleteIds = [];
  const report = [];

  for (const [key, members] of groups) {
    const canonicalRole = members.find((role) => String(role.name || "").toLowerCase() === role.canonical) || members[0];
    const canonicalName = canonicalRole.canonical;
    const mergedPermissions = [...new Set(members.flatMap((role) => (role.permissions || []).map((id) => String(id)).filter((id) => mongoose.isValidObjectId(id))))];
    const duplicateIds = members.filter((role) => String(role._id) !== String(canonicalRole._id)).map((role) => role._id);

    const affectedUsers = users.filter((user) =>
      members.some((role) => String(role._id) === String(user.roleId)) ||
      members.some((role) => normalizeRole(user.role || user.legacyRole || "") === role.canonical && tenantKey(user.tenantId) === tenantKey(role.tenantId))
    );

    if (
      String(canonicalRole.name || "").toLowerCase() !== canonicalName ||
      duplicateIds.length ||
      affectedUsers.some((user) => String(user.roleId || "") !== String(canonicalRole._id) || normalizeRole(user.role || user.legacyRole || "") !== canonicalName)
    ) {
      report.push({
        key,
        canonicalRoleId: String(canonicalRole._id),
        canonicalName,
        duplicateRoleIds: duplicateIds.map(String),
        affectedUsers: affectedUsers.length,
      });
    }

    if (!APPLY) continue;

    if (duplicateIds.length) {
      // Remove aliases before renaming the retained role so the tenant-scoped
      // unique (tenantId, name) index cannot reject a canonical-name collision.
      await db.collection("roles").deleteMany({ _id: { $in: duplicateIds } });
    }

    roleOps.push({
      updateOne: {
        filter: { _id: canonicalRole._id },
        update: {
          $set: {
            name: canonicalName,
            permissions: mergedPermissions.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      },
    });

    if (affectedUsers.length) {
      for (const user of affectedUsers) {
        userOps.push({
          updateOne: {
            filter: { _id: user._id },
            update: {
              $set: {
                roleId: canonicalRole._id,
                role: canonicalName,
                legacyRole: canonicalName,
              },
            },
          },
        });
      }
    }

    deleteIds.push(...duplicateIds);
  }

  console.log(JSON.stringify({
    mode: APPLY ? "APPLY" : "DRY_RUN",
    roleGroups: groups.size,
    groupsRequiringNormalization: report.length,
    report,
  }, null, 2));

  if (!APPLY) {
    console.log("No database changes were made. Set APPLY_ROLE_NORMALIZATION=true to apply the reviewed normalization.");
    return;
  }

  if (roleOps.length) await db.collection("roles").bulkWrite(roleOps, { ordered: false });
  if (userOps.length) await db.collection("users").bulkWrite(userOps, { ordered: false });
  if (deleteIds.length) await db.collection("roles").deleteMany({ _id: { $in: deleteIds } });

  console.log(JSON.stringify({
    applied: true,
    canonicalRolesUpdated: roleOps.length,
    usersUpdated: userOps.length,
    duplicateRolesRemoved: deleteIds.length,
  }, null, 2));
};

migrateRoles()
  .catch((error) => {
    console.error("Role normalization failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.connection.close().catch(() => {});
  });
