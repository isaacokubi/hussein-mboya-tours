/**
 * Purpose: super Admin Role Controller HTTP controller. Main declarations: normalizeIds, normalizeRoleName, canonicalizePlatformRoles, populateRolePermissions, getPlatformRoles.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/Permission.js so this module can use its exported dependencies.
import Permission from "../models/Permission.js";

// Declare normalizeIds for use by the surrounding module or function.
const normalizeIds = (values = []) => Array.from(new Set((Array.isArray(values) ? values : []).filter((v) => mongoose.Types.ObjectId.isValid(v)).map(String)));
// Declare normalizeRoleName for use by the surrounding module or function.
const normalizeRoleName = (value = "") => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

// Declare PLATFORM_ROLE_METADATA for use by the surrounding module or function.
const PLATFORM_ROLE_METADATA = {
  super_admin: { displayName: "Super Admin", level: 100, isSystem: true },
  superadmin: { displayName: "Super Admin", level: 100, isSystem: true },
  admin: { displayName: "Administrator", level: 90, isSystem: true },
  manager: { displayName: "Tour Manager", level: 70, isSystem: true },
  tour_guide: { displayName: "Tour Guide", level: 50, isSystem: true },
  agent: { displayName: "Travel Agent", level: 40, isSystem: true },
  driver: { displayName: "Driver", level: 40, isSystem: true },
  customer: { displayName: "Customer", level: 10, isSystem: true },
};

// Declare canonicalizePlatformRoles for use by the surrounding module or function.
const canonicalizePlatformRoles = (roles) => {
  // Declare grouped for use by the surrounding module or function.
  const grouped = new Map();
  // Repeat the enclosed work for each required iteration.
  for (const role of roles) {
    // Declare key for use by the surrounding module or function.
    const key = normalizeRoleName(role.name);
    // Declare existing for use by the surrounding module or function.
    const existing = grouped.get(key);
    // Check the condition (!existing) and run the matching branch.
    if (!existing) {
      // Perform the side effect or state update expressed on the following line.
      grouped.set(key, { ...role });
      // Skip the remainder of this iteration and continue with the next one.
      continue;
    }

    // Declare existingPreferred for use by the surrounding module or function.
    const existingPreferred = Boolean(existing.isSystem) && Number(existing.level) <= 100;
    // Declare candidatePreferred for use by the surrounding module or function.
    const candidatePreferred = Boolean(role.isSystem) && Number(role.level) <= 100;
    // Declare preferred for use by the surrounding module or function.
    const preferred = candidatePreferred && !existingPreferred ? role : existing;
    // Declare mergedPermissions for use by the surrounding module or function.
    const mergedPermissions = normalizeIds([
      ...(existing.permissions || []).map((permission) => permission?._id || permission),
      ...(role.permissions || []).map((permission) => permission?._id || permission),
    ]);
    // Perform the side effect or state update expressed on the following line.
    grouped.set(key, { ...preferred, permissions: mergedPermissions });
  }

  // Return the result of [...grouped.values()].map((role) => {     const key = normalizeRoleName(role.name);     const metadata = PLATFORM_ROLE_METADATA[key];     if (!metadata) return role;     return {       ...role,       displayName: metadata.displayName,       level: metadata.level,       isSystem: true,       status: "active",     };   }).sort() to the caller.
  return [...grouped.values()].map((role) => {
    // Declare key for use by the surrounding module or function.
    const key = normalizeRoleName(role.name);
    // Declare metadata for use by the surrounding module or function.
    const metadata = PLATFORM_ROLE_METADATA[key];
    // Check the condition (!metadata) and run the matching branch.
    if (!metadata) return role;
    // Return the object assembled below to the caller.
    return {
      ...role,
      displayName: metadata.displayName,
      level: metadata.level,
      isSystem: true,
      status: "active",
    };
  }).sort((a, b) => Number(b.level || 0) - Number(a.level || 0));
};

// Declare populateRolePermissions for use by the surrounding module or function.
const populateRolePermissions = async (roles) => {
  // Declare permissionIds for use by the surrounding module or function.
  const permissionIds = normalizeIds(roles.flatMap((role) => (role.permissions || []).map((permission) => permission?._id || permission)));
  // Declare permissionDocs for use by the surrounding module or function.
  const permissionDocs = permissionIds.length
    ? await Permission.find({ _id: { $in: permissionIds }, isActive: { $ne: false } }).lean()
    : [];
  // Declare permissionMap for use by the surrounding module or function.
  const permissionMap = new Map(permissionDocs.map((permission) => [String(permission._id), permission]));
  // Return the result of roles.map() to the caller.
  return roles.map((role) => ({
    ...role,
    permissions: normalizeIds((role.permissions || []).map((permission) => permission?._id || permission))
      .map((id) => permissionMap.get(id))
      .filter(Boolean),
  }));
};

// Declare getPlatformRoles for use by the surrounding module or function.
export const getPlatformRoles = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare roles for use by the surrounding module or function.
    const roles = await Role.find({}).populate("permissions", "name label description module category isActive").sort({ level: -1, createdAt: 1 }).lean();
    // Declare canonicalRoles for use by the surrounding module or function.
    const canonicalRoles = canonicalizePlatformRoles(roles);
    // Declare hydratedRoles for use by the surrounding module or function.
    const hydratedRoles = await populateRolePermissions(canonicalRoles);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, count: hydratedRoles.length, roles: hydratedRoles, data: hydratedRoles });
  } catch (error) { next(error); }
};

// Declare getPlatformPermissions for use by the surrounding module or function.
export const getPlatformPermissions = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare permissions for use by the surrounding module or function.
    const permissions = await Permission.find({ isActive: { $ne: false } }).sort({ module: 1, name: 1 }).lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, count: permissions.length, permissions, data: permissions });
  } catch (error) { next(error); }
};

// Declare getPlatformRole for use by the surrounding module or function.
export const getPlatformRole = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    // Declare role for use by the surrounding module or function.
    const role = await Role.findById(req.params.id).populate("permissions", "name label description module category isActive").lean();
    // Check the condition (!role) and run the matching branch.
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    // Declare [hydrated] for use by the surrounding module or function.
    const [hydrated] = await populateRolePermissions([role]);
    // Declare key for use by the surrounding module or function.
    const key = normalizeRoleName(hydrated.name);
    // Declare metadata for use by the surrounding module or function.
    const metadata = PLATFORM_ROLE_METADATA[key];
    // Declare normalizedRole for use by the surrounding module or function.
    const normalizedRole = metadata ? { ...hydrated, displayName: metadata.displayName, level: metadata.level, isSystem: true, status: "active" } : hydrated;
    // Return the result of res.json() to the caller.
    return res.json({ success: true, role: normalizedRole, data: normalizedRole });
  } catch (error) { next(error); }
};

// Declare updatePlatformRolePermissions for use by the surrounding module or function.
export const updatePlatformRolePermissions = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    // Declare role for use by the surrounding module or function.
    const role = await Role.findById(req.params.id);
    // Check the condition (!role) and run the matching branch.
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    // Declare normalized for use by the surrounding module or function.
    const normalized = normalizeRoleName(role.name);
    // Check the condition (["super_admin", "superadmin"].includes(normalized)) and run the matching branch.
    if (["super_admin", "superadmin"].includes(normalized)) return res.status(403).json({ success: false, message: "The Super Admin role permissions are protected." });
    // Declare ids for use by the surrounding module or function.
    const ids = normalizeIds(req.body?.permissions);
    // Declare valid for use by the surrounding module or function.
    const valid = ids.length ? await Permission.countDocuments({ _id: { $in: ids }, isActive: { $ne: false } }) : 0;
    // Check the condition (valid !== ids.length) and run the matching branch.
    if (valid !== ids.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });
    // Perform the side effect or state update expressed on the following line.
    role.permissions = ids;
    // Perform the side effect or state update expressed on the following line.
    await role.save();
    // Declare updated for use by the surrounding module or function.
    const updated = await Role.findById(role._id).populate("permissions", "name label description module category isActive").lean();
    // Declare [hydrated] for use by the surrounding module or function.
    const [hydrated] = await populateRolePermissions([updated]);
    // Declare metadata for use by the surrounding module or function.
    const metadata = PLATFORM_ROLE_METADATA[normalizeRoleName(hydrated.name)];
    // Declare normalizedRole for use by the surrounding module or function.
    const normalizedRole = metadata ? { ...hydrated, displayName: metadata.displayName, level: metadata.level, isSystem: true, status: "active" } : hydrated;
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Role permissions updated successfully.", role: normalizedRole, data: normalizedRole });
  } catch (error) { next(error); }
};
