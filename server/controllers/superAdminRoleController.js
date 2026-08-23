import mongoose from "mongoose";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";

const normalizeIds = (values = []) => Array.from(new Set((Array.isArray(values) ? values : []).filter((v) => mongoose.Types.ObjectId.isValid(v)).map(String)));

export const getPlatformRoles = async (req, res, next) => {
  try {
    const roles = await Role.find({}).populate("permissions", "name label description module category isActive").sort({ level: -1 }).lean();
    return res.json({ success: true, count: roles.length, roles, data: roles });
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
    return res.json({ success: true, role, data: role });
  } catch (error) { next(error); }
};

export const updatePlatformRolePermissions = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    const normalized = String(role.name || "").toLowerCase().replace(/[\s-]+/g, "_");
    if (["super_admin", "superadmin"].includes(normalized)) return res.status(403).json({ success: false, message: "The Super Admin role permissions are protected." });
    const ids = normalizeIds(req.body?.permissions);
    const valid = ids.length ? await Permission.countDocuments({ _id: { $in: ids }, isActive: { $ne: false } }) : 0;
    if (valid !== ids.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });
    role.permissions = ids;
    await role.save();
    const updated = await Role.findById(role._id).populate("permissions", "name label description module category isActive").lean();
    return res.json({ success: true, message: "Role permissions updated successfully.", role: updated, data: updated });
  } catch (error) { next(error); }
};
