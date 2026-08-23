import { requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import mongoose from "mongoose";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import { normalizeRole } from "../utils/roleUtils.js";

const DEFAULT_PERMISSIONS = {
  customer: ["profile.view", "booking.create", "booking.view", "wishlist.manage"],
  agent: ["admin.dashboard", "booking.create", "booking.view", "customer.view", "commission.view", "view_agent_dashboard", "view_agent_tours", "create_agent_tour", "edit_agent_tour", "delete_agent_tour"],
  manager: ["tour.view", "tour.create", "tour.update", "booking.view", "booking.cancel", "tour.assign", "tour.availability", "calendar.manage", "customer.view", "guide.view", "vehicle.view", "report.view"],
  tour_guide: ["tour.view", "view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"],
  driver: ["tour.view", "view_assigned_tours"],
  admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "finance.view", "notifications.view", "report.view"],
  super_admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "finance.view", "notifications.view", "report.view", "roles.manage", "settings.manage", "system.audit", "system.security", "system.database", "system.backup"],
};

const ROLE_METADATA = {
  super_admin: { displayName: "Super Admin", level: 100, isSystem: true, isDefault: false },
  admin: { displayName: "Admin", level: 90, isSystem: true, isDefault: false },
  manager: { displayName: "Tour Manager", level: 70, isSystem: true, isDefault: false },
  tour_guide: { displayName: "Tour Guide", level: 50, isSystem: true, isDefault: false },
  driver: { displayName: "Driver", level: 40, isSystem: true, isDefault: false },
  agent: { displayName: "Travel Agent", level: 40, isSystem: true, isDefault: false },
  customer: { displayName: "Customer", level: 10, isSystem: true, isDefault: true },
};

let defaultsBootstrapPromise = null;
let roleIndexesPromise = null;

const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const sanitizePermissionIds = (values = []) => Array.from(new Set(
  (Array.isArray(values) ? values : []).filter(validObjectId).map((value) => String(value))
));

const ensureRoleIndexes = async () => {
  if (roleIndexesPromise) return roleIndexesPromise;

  roleIndexesPromise = (async () => {
    const indexes = await Role.collection.indexes();
    const legacyNameIndex = indexes.find(
      (index) => index.name === "name_1" && index.key?.name === 1 && Object.keys(index.key).length === 1,
    );

    if (legacyNameIndex) {
      try {
        await Role.collection.dropIndex(legacyNameIndex.name);
      } catch (error) {
        if (error?.codeName !== "IndexNotFound" && error?.code !== 27) throw error;
      }
    }

    const refreshed = await Role.collection.indexes();
    const tenantNameIndex = refreshed.find(
      (index) => index.unique === true && index.key?.tenantId === 1 && index.key?.name === 1,
    );

    if (!tenantNameIndex) {
      await Role.collection.createIndex(
        { tenantId: 1, name: 1 },
        { unique: true, name: "tenantId_name_unique" },
      );
    }
  })().catch((error) => {
    roleIndexesPromise = null;
    throw error;
  });

  return roleIndexesPromise;
};

export const ensureDefaultPermissions = async () => {
  requireTenantId();
  if (defaultsBootstrapPromise) return defaultsBootstrapPromise;

  defaultsBootstrapPromise = (async () => {
    await ensureRoleIndexes();

    const allNames = [...new Set(Object.values(DEFAULT_PERMISSIONS).flat())];
    await Permission.bulkWrite(allNames.map((name) => ({
      updateOne: {
        filter: { name },
        update: {
          $set: {
            label: name.replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
            description: `Permission: ${name}`,
            module: name.split(/[._]/)[0] || "system",
            category: "system",
            isActive: true,
          },
          $setOnInsert: { name },
        },
        upsert: true,
      },
    })), { ordered: false }).catch((error) => {
      if (error?.code !== 11000 && !error?.writeErrors?.every((e) => e?.code === 11000)) throw error;
    });

    const permissions = await Permission.find({ name: { $in: allNames } }).select("_id name").lean();
    const byName = new Map(permissions.map((permission) => [permission.name, permission._id]));

    for (const [roleName, names] of Object.entries(DEFAULT_PERMISSIONS)) {
      const role = await Role.findOne({ name: roleName }).select("_id name permissions level").lean();
      const ids = names.map((name) => byName.get(name)).filter(Boolean);
      const merged = new Map(sanitizePermissionIds(role?.permissions || []).map((id) => [String(id), id]));
      ids.forEach((id) => merged.set(String(id), id));
      const metadata = ROLE_METADATA[roleName] || { displayName: roleName, level: 20, isSystem: false, isDefault: false };

      await Role.updateOne(
        role ? { _id: role._id } : { name: roleName },
        {
          $set: {
            permissions: [...merged.values()],
            status: "active",
            displayName: metadata.displayName,
            description: `${roleName.replace(/_/g, " ")} access`,
            isSystem: metadata.isSystem,
            level: metadata.level,
            isDefault: metadata.isDefault,
          },
          $setOnInsert: { name: roleName },
        },
        { upsert: !role },
      );
    }
  })();

  try {
    return await defaultsBootstrapPromise;
  } finally {
    defaultsBootstrapPromise = null;
  }
};

const hydrateRoles = async (roleDocs) => {
  const permissionIds = Array.from(new Set(roleDocs.flatMap((role) => sanitizePermissionIds(role.permissions))));
  const permissionDocs = permissionIds.length
    ? await Permission.find({ _id: { $in: permissionIds } }).lean()
    : [];
  const permissionMap = new Map(permissionDocs.map((permission) => [String(permission._id), permission]));

  return roleDocs.map((role) => ({
    ...role,
    permissions: sanitizePermissionIds(role.permissions).map((id) => permissionMap.get(String(id))).filter(Boolean),
  }));
};

export const getRoles = async (req, res, next) => {
  try {
    await ensureDefaultPermissions();
    const roleDocs = await Role.find(tenantFilter(req)).sort({ level: -1 }).lean();
    return res.json({ success: true, count: roleDocs.length, roles: await hydrateRoles(roleDocs) });
  } catch (error) {
    next(error);
  }
};

export const getPermissions = async (req, res, next) => {
  try {
    await ensureDefaultPermissions();
    const permissions = await Permission.find({ isActive: { $ne: false } }).sort({ module: 1, name: 1 }).lean();
    return res.json({ success: true, count: permissions.length, permissions });
  } catch (error) {
    next(error);
  }
};

export const getRole = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    const roleDoc = await Role.findOne(tenantFilter(req, { _id: req.params.id })).lean();
    if (!roleDoc) return res.status(404).json({ success: false, message: "Role not found" });
    const [role] = await hydrateRoles([roleDoc]);
    return res.json({ success: true, role });
  } catch (error) {
    next(error);
  }
};

export const createRole = async (req, res, next) => {
  try {
    await ensureRoleIndexes();
    const { name, displayName, description = "", permissions = [], level = 1, status = "active", isDefault = false } = req.body;
    if (!name || !displayName) return res.status(400).json({ success: false, message: "Role name and display name are required." });

    const normalizedName = String(name).trim().toLowerCase().replace(/\s+/g, "_");
    const permissionIds = sanitizePermissionIds(permissions);
    if (permissionIds.length) {
      const validPermissions = await Permission.countDocuments({ _id: { $in: permissionIds }, isActive: { $ne: false } });
      if (validPermissions !== permissionIds.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });
    }

    if (await Role.findOne(tenantFilter(req, { name: normalizedName }))) {
      return res.status(409).json({ success: false, message: "A role with this name already exists." });
    }

    const role = await Role.create({
      name: normalizedName,
      displayName: String(displayName).trim(),
      description: String(description || "").trim(),
      permissions: permissionIds,
      level: Math.max(1, Number(level) || 1),
      status: status === "inactive" ? "inactive" : "active",
      isDefault: Boolean(isDefault),
      isSystem: false,
      createdBy: req.user?._id || null,
    });

    return res.status(201).json({ success: true, role });
  } catch (error) {
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A role with this name already exists." });
    next(error);
  }
};

export const updateRole = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role is protected and cannot be modified." });

    if (Object.prototype.hasOwnProperty.call(req.body, "displayName")) role.displayName = String(req.body.displayName || "").trim();
    if (Object.prototype.hasOwnProperty.call(req.body, "description")) role.description = String(req.body.description || "").trim();
    if (Object.prototype.hasOwnProperty.call(req.body, "level")) role.level = Math.max(1, Number(req.body.level) || 1);
    if (Object.prototype.hasOwnProperty.call(req.body, "status")) role.status = req.body.status === "inactive" ? "inactive" : "active";
    if (Object.prototype.hasOwnProperty.call(req.body, "isDefault")) role.isDefault = Boolean(req.body.isDefault);

    await role.save();
    return res.json({ success: true, role });
  } catch (error) {
    next(error);
  }
};

export const deleteRole = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role cannot be deleted." });
    if (role.isSystem) return res.status(403).json({ success: false, message: "System roles cannot be deleted. You may modify their permissions instead." });
    await role.deleteOne();
    return res.json({ success: true, message: "Role deleted" });
  } catch (error) {
    next(error);
  }
};

export const updatePermissions = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role permissions cannot be modified." });

    const permissionIds = sanitizePermissionIds(req.body.permissions);
    if (permissionIds.length) {
      const validPermissions = await Permission.countDocuments({ _id: { $in: permissionIds }, isActive: { $ne: false } });
      if (validPermissions !== permissionIds.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });
    }

    role.permissions = permissionIds;
    await role.save();
    return res.json({ success: true, role });
  } catch (error) {
    next(error);
  }
};

export const getRolesAndPermissions = async (req, res, next) => {
  try {
    await ensureDefaultPermissions();
    const [roleDocs, permissions] = await Promise.all([
      Role.find(tenantFilter(req)).sort({ level: -1 }).lean(),
      Permission.find({ isActive: { $ne: false } }).sort({ module: 1, name: 1 }).lean(),
    ]);
    return res.json({ success: true, roles: await hydrateRoles(roleDocs), permissions });
  } catch (error) {
    next(error);
  }
};
