import mongoose from "mongoose";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

const normalizeIds = (values = []) => Array.from(new Set((Array.isArray(values) ? values : []).filter((v) => mongoose.Types.ObjectId.isValid(v)).map(String)));
const normalizeRoleName = (value = "") => String(value || "").trim().toLowerCase().replace(/[\s-]+/g, "_");

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

const canonicalizePlatformRoles = (roles) => {
  const grouped = new Map();
  for (const role of roles) {
    const key = normalizeRoleName(role.name);
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, { ...role });
      continue;
    }

    const existingPreferred = Boolean(existing.isSystem) && Number(existing.level) <= 100;
    const candidatePreferred = Boolean(role.isSystem) && Number(role.level) <= 100;
    const preferred = candidatePreferred && !existingPreferred ? role : existing;
    const mergedPermissions = normalizeIds([
      ...(existing.permissions || []).map((permission) => permission?._id || permission),
      ...(role.permissions || []).map((permission) => permission?._id || permission),
    ]);
    grouped.set(key, { ...preferred, permissions: mergedPermissions });
  }

  return [...grouped.values()].map((role) => {
    const key = normalizeRoleName(role.name);
    const metadata = PLATFORM_ROLE_METADATA[key];
    if (!metadata) return role;
    return {
      ...role,
      displayName: metadata.displayName,
      level: metadata.level,
      isSystem: true,
      status: "active",
    };
  }).sort((a, b) => Number(b.level || 0) - Number(a.level || 0));
};

const populateRolePermissions = async (roles) => {
  const permissionIds = normalizeIds(roles.flatMap((role) => (role.permissions || []).map((permission) => permission?._id || permission)));
  const permissionDocs = permissionIds.length
    ? await Permission.find({ _id: { $in: permissionIds }, isActive: { $ne: false } }).lean()
    : [];
  const permissionMap = new Map(permissionDocs.map((permission) => [String(permission._id), permission]));
  return roles.map((role) => ({
    ...role,
    permissions: normalizeIds((role.permissions || []).map((permission) => permission?._id || permission))
      .map((id) => permissionMap.get(id))
      .filter(Boolean),
  }));
};

export const getPlatformRoles = async (req, res, next) => {
  try {
    const roles = await Role.find({}).populate("permissions", "name label description module category isActive").sort({ level: -1, createdAt: 1 }).lean();
    const canonicalRoles = canonicalizePlatformRoles(roles);
    const hydratedRoles = await populateRolePermissions(canonicalRoles);
    return res.json({ success: true, count: hydratedRoles.length, roles: hydratedRoles, data: hydratedRoles });
  } catch (error) { next(error); }
};

export const getPlatformPermissions = async (req, res, next) => {
  try {
    const permissions = await Permission.find({ isActive: { $ne: false } }).sort({ module: 1, name: 1 }).lean();
    return res.json({ success: true, count: permissions.length, permissions, data: permissions });
  } catch (error) { next(error); }
};

export const getPlatformRole = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    const role = await Role.findById(req.params.id).populate("permissions", "name label description module category isActive").lean();
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    const [hydrated] = await populateRolePermissions([role]);
    const key = normalizeRoleName(hydrated.name);
    const metadata = PLATFORM_ROLE_METADATA[key];
    const normalizedRole = metadata ? { ...hydrated, displayName: metadata.displayName, level: metadata.level, isSystem: true, status: "active" } : hydrated;
    return res.json({ success: true, role: normalizedRole, data: normalizedRole });
  } catch (error) { next(error); }
};

export const updatePlatformRolePermissions = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    const normalized = normalizeRoleName(role.name);
    if (["super_admin", "superadmin"].includes(normalized)) return res.status(403).json({ success: false, message: "The Super Admin role permissions are protected." });
    const ids = normalizeIds(req.body?.permissions);
    const valid = ids.length ? await Permission.countDocuments({ _id: { $in: ids }, isActive: { $ne: false } }) : 0;
    if (valid !== ids.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });
    role.permissions = ids;
    await role.save();
    const updated = await Role.findById(role._id).populate("permissions", "name label description module category isActive").lean();
    const [hydrated] = await populateRolePermissions([updated]);
    const metadata = PLATFORM_ROLE_METADATA[normalizeRoleName(hydrated.name)];
    const normalizedRole = metadata ? { ...hydrated, displayName: metadata.displayName, level: metadata.level, isSystem: true, status: "active" } : hydrated;
    return res.json({ success: true, message: "Role permissions updated successfully.", role: normalizedRole, data: normalizedRole });
  } catch (error) { next(error); }
};
