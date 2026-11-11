/**
 * Purpose: migrate Legacy Roles database seed module. Main declarations: normalizeRoleDocument, tenantKey, migrateRoles.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import dotenv from "dotenv";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";

// Load ../utils/roleUtils.js so this module can use its exported dependencies.
import { normalizeRole } from "../utils/roleUtils.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();

// Declare APPLY for use by the surrounding module or function.
const APPLY = String(process.env.APPLY_ROLE_NORMALIZATION || "").toLowerCase() === "true";

// Declare normalizeRoleDocument for use by the surrounding module or function.
const normalizeRoleDocument = (role) =>
  normalizeRole(role?.name || role?.displayName || role?.role || "");

// Declare tenantKey for use by the surrounding module or function.
const tenantKey = (tenantId) => String(tenantId || "platform");

// Declare migrateRoles for use by the surrounding module or function.
const migrateRoles = async () => {
  // Check the condition (!process.env.MONGODB_URI) and run the matching branch.
  if (!process.env.MONGODB_URI) throw new Error("MONGODB_URI is missing.");

  // Perform the side effect or state update expressed on the following line.
  await mongoose.connect(process.env.MONGODB_URI);

  // Declare db for use by the surrounding module or function.
  const db = mongoose.connection.db;
  // Declare roles for use by the surrounding module or function.
  const roles = await db.collection("roles").find({}).sort({ createdAt: 1, _id: 1 }).toArray();
  // Declare users for use by the surrounding module or function.
  const users = await db.collection("users").find({}).project({ _id: 1, tenantId: 1, roleId: 1, role: 1, legacyRole: 1 }).toArray();

  // Declare groups for use by the surrounding module or function.
  const groups = new Map();
  // Repeat the enclosed work for each required iteration.
  for (const role of roles) {
    // Declare canonical for use by the surrounding module or function.
    const canonical = normalizeRoleDocument(role);
    // Check the condition (!canonical) and run the matching branch.
    if (!canonical) continue;
    // Declare key for use by the surrounding module or function.
    const key = `${tenantKey(role.tenantId)}:${canonical}`;
    // Check the condition (!groups.has(key)) and run the matching branch.
    if (!groups.has(key)) groups.set(key, []);
    // Perform the side effect or state update expressed on the following line.
    groups.get(key).push({ ...role, canonical });
  }

  // Declare userOps for use by the surrounding module or function.
  const userOps = [];
  // Declare roleOps for use by the surrounding module or function.
  const roleOps = [];
  // Declare deleteIds for use by the surrounding module or function.
  const deleteIds = [];
  // Declare report for use by the surrounding module or function.
  const report = [];

  // Repeat the enclosed work for each required iteration.
  for (const [key, members] of groups) {
    // Declare canonicalRole for use by the surrounding module or function.
    const canonicalRole = members.find((role) => String(role.name || "").toLowerCase() === role.canonical) || members[0];
    // Declare canonicalName for use by the surrounding module or function.
    const canonicalName = canonicalRole.canonical;
    // Declare mergedPermissions for use by the surrounding module or function.
    const mergedPermissions = [...new Set(members.flatMap((role) => (role.permissions || []).map((id) => String(id)).filter((id) => mongoose.isValidObjectId(id))))];
    // Declare duplicateIds for use by the surrounding module or function.
    const duplicateIds = members.filter((role) => String(role._id) !== String(canonicalRole._id)).map((role) => role._id);

    // Declare affectedUsers for use by the surrounding module or function.
    const affectedUsers = users.filter((user) =>
      members.some((role) => String(role._id) === String(user.roleId)) ||
      members.some((role) => normalizeRole(user.role || user.legacyRole || "") === role.canonical && tenantKey(user.tenantId) === tenantKey(role.tenantId))
    );

    // Check the condition (String(canonicalRole.name || "").toLowerCase() !== canonicalName || du) and run the matching branch.
    if (
      String(canonicalRole.name || "").toLowerCase() !== canonicalName ||
      duplicateIds.length ||
      affectedUsers.some((user) => String(user.roleId || "") !== String(canonicalRole._id) || normalizeRole(user.role || user.legacyRole || "") !== canonicalName)
    ) {
      // Perform the side effect or state update expressed on the following line.
      report.push({
        key,
        canonicalRoleId: String(canonicalRole._id),
        canonicalName,
        duplicateRoleIds: duplicateIds.map(String),
        affectedUsers: affectedUsers.length,
      });
    }

    // Check the condition (!APPLY) and run the matching branch.
    if (!APPLY) continue;

    // Check the condition (duplicateIds.length) and run the matching branch.
    if (duplicateIds.length) {
      // Remove aliases before renaming the retained role so the tenant-scoped
      // unique (tenantId, name) index cannot reject a canonical-name collision.
      // Perform the side effect or state update expressed on the following line.
      await db.collection("roles").deleteMany({ _id: { $in: duplicateIds } });
    }

    // Perform the side effect or state update expressed on the following line.
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

    // Check the condition (affectedUsers.length) and run the matching branch.
    if (affectedUsers.length) {
      // Repeat the enclosed work for each required iteration.
      for (const user of affectedUsers) {
        // Perform the side effect or state update expressed on the following line.
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

    // Perform the side effect or state update expressed on the following line.
    deleteIds.push(...duplicateIds);
  }

  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({
    mode: APPLY ? "APPLY" : "DRY_RUN",
    roleGroups: groups.size,
    groupsRequiringNormalization: report.length,
    report,
  }, null, 2));

  // Check the condition (!APPLY) and run the matching branch.
  if (!APPLY) {
    // Perform the side effect or state update expressed on the following line.
    console.log("No database changes were made. Set APPLY_ROLE_NORMALIZATION=true to apply the reviewed normalization.");
    // Return the result to the caller.
    return;
  }

  // Check the condition (roleOps.length) and run the matching branch.
  if (roleOps.length) await db.collection("roles").bulkWrite(roleOps, { ordered: false });
  // Check the condition (userOps.length) and run the matching branch.
  if (userOps.length) await db.collection("users").bulkWrite(userOps, { ordered: false });
  // Check the condition (deleteIds.length) and run the matching branch.
  if (deleteIds.length) await db.collection("roles").deleteMany({ _id: { $in: deleteIds } });

  // Perform the side effect or state update expressed on the following line.
  console.log(JSON.stringify({
    applied: true,
    canonicalRolesUpdated: roleOps.length,
    usersUpdated: userOps.length,
    duplicateRolesRemoved: deleteIds.length,
  }, null, 2));
};

// Perform the side effect or state update expressed on the following line.
migrateRoles()
  .catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    console.error("Role normalization failed:", error);
    // Perform the side effect or state update expressed on the following line.
    process.exitCode = 1;
  })
  .finally(async () => {
    // Perform the side effect or state update expressed on the following line.
    await mongoose.connection.close().catch(() => {});
  });
