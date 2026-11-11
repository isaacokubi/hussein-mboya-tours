/**
 * Purpose: admin Role Controller HTTP controller. Main declarations: consolidateRoleAliases, validObjectId, sanitizePermissionIds, ensureRoleIndexes, ensureDefaultPermissions.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { requireTenantId } from "../tenancy/context.js";
// Load ../tenancy/tenantQuery.js so this module can use its exported dependencies.
import { tenantFilter } from "../tenancy/tenantQuery.js";
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../models/Role.js so this module can use its exported dependencies.
import Role from "../models/Role.js";
// Load ../models/Permission.js so this module can use its exported dependencies.
import Permission from "../models/Permission.js";
// Load ../models/User.js so this module can use its exported dependencies.
import User from "../models/User.js";
// Load ../utils/roleUtils.js so this module can use its exported dependencies.
import { normalizeRole } from "../utils/roleUtils.js";

// Declare DEFAULT_PERMISSIONS for use by the surrounding module or function.
const DEFAULT_PERMISSIONS = {
  customer: ["profile.view", "booking.create", "booking.view", "wishlist.manage"],
  agent: ["admin.dashboard", "booking.create", "booking.view", "customer.view", "commission.view", "view_agent_dashboard", "view_agent_tours", "create_agent_tour", "edit_agent_tour", "delete_agent_tour"],
  tour_manager: ["tour.view", "tour.create", "tour.update", "booking.view", "booking.cancel", "tour.assign", "tour.availability", "calendar.manage", "customer.view", "guide.view", "vehicle.view", "report.view"],
  tour_guide: ["tour.view", "view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"],
  driver: ["tour.view", "view_assigned_tours"],
  admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "finance.view", "notifications.view", "report.view"],
  super_admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "finance.view", "notifications.view", "report.view", "roles.manage", "settings.manage", "system.audit", "system.security", "system.database", "system.backup"],
};

// Declare ROLE_METADATA for use by the surrounding module or function.
const ROLE_METADATA = {
  super_admin: { displayName: "Super Admin", level: 100, isSystem: true, isDefault: false },
  admin: { displayName: "Admin", level: 90, isSystem: true, isDefault: false },
  tour_manager: { displayName: "Tour Manager", level: 70, isSystem: true, isDefault: false },
  tour_guide: { displayName: "Tour Guide", level: 50, isSystem: true, isDefault: false },
  driver: { displayName: "Driver", level: 40, isSystem: true, isDefault: false },
  agent: { displayName: "Travel Agent", level: 40, isSystem: true, isDefault: false },
  customer: { displayName: "Customer", level: 10, isSystem: true, isDefault: true },
};

// Declare defaultsBootstrapPromise for use by the surrounding module or function.
let defaultsBootstrapPromise = null;
// Declare roleIndexesPromise for use by the surrounding module or function.
let roleIndexesPromise = null;

// Declare ROLE_ALIAS_GROUPS for use by the surrounding module or function.
const ROLE_ALIAS_GROUPS = {
  super_admin: ["superadmin"],
  admin: ["administrator"],
  tour_manager: ["manager", "tourmanager"],
  tour_guide: ["guide", "tourguide"],
  agent: ["travel_agent", "travelagent"],
};

// Declare consolidateRoleAliases for use by the surrounding module or function.
const consolidateRoleAliases = async () => {
  // Repeat the enclosed work for each required iteration.
  for (const [canonical, aliases] of Object.entries(ROLE_ALIAS_GROUPS)) {
    // Declare names for use by the surrounding module or function.
    const names = [canonical, ...aliases];
    // Declare roles for use by the surrounding module or function.
    const roles = await Role.find({ name: { $in: names } })
      .sort({ name: 1 })
      .lean();

    // Check the condition (!roles.length) and run the matching branch.
    if (!roles.length) continue;

    // Declare canonicalRole for use by the surrounding module or function.
    const canonicalRole = roles.find((role) => role.name === canonical);
    // Declare target for use by the surrounding module or function.
    let target = canonicalRole;

    // Check the condition (!target) and run the matching branch.
    if (!target) {
      // Declare source for use by the surrounding module or function.
      const source = roles[0];
      // Perform the side effect or state update expressed on the following line.
      target = await Role.create({
        name: canonical,
        displayName: ROLE_METADATA[canonical]?.displayName || source.displayName || canonical,
        description: source.description || `${canonical.replace(/_/g, " ")} access`,
        permissions: source.permissions || [],
        status: source.status || "active",
        level: source.level || ROLE_METADATA[canonical]?.level || 1,
        isDefault: Boolean(source.isDefault),
        isSystem: ROLE_METADATA[canonical]?.isSystem ?? Boolean(source.isSystem),
        createdBy: source.createdBy || null,
      });
      // Perform the side effect or state update expressed on the following line.
      target = target.toObject();
    }

    // Declare targetPermissions for use by the surrounding module or function.
    const targetPermissions = new Set((target.permissions || []).map((id) => String(id)));
    // Declare aliasIds for use by the surrounding module or function.
    const aliasIds = [];

    // Repeat the enclosed work for each required iteration.
    for (const role of roles) {
      // Check the condition (String(role._id) === String(target._id)) and run the matching branch.
      if (String(role._id) === String(target._id)) continue;
      // Perform the side effect or state update expressed on the following line.
      aliasIds.push(role._id);
      // Repeat the enclosed work for each required iteration.
      for (const permissionId of role.permissions || []) targetPermissions.add(String(permissionId));
    }

    // Check the condition (aliasIds.length) and run the matching branch.
    if (aliasIds.length) {
      // Perform the side effect or state update expressed on the following line.
      await User.updateMany(
        { roleId: { $in: aliasIds } },
        { $set: { roleId: target._id } },
      );
      // Perform the side effect or state update expressed on the following line.
      await Role.deleteMany({ _id: { $in: aliasIds } });
    }

    // Check the condition (targetPermissions.size !== (target.permissions || []).length) and run the matching branch.
    if (targetPermissions.size !== (target.permissions || []).length) {
      // Perform the side effect or state update expressed on the following line.
      await Role.updateOne(
        { _id: target._id },
        { $set: { permissions: [...targetPermissions] } },
      );
    }
  }
};

// Declare validObjectId for use by the surrounding module or function.
const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

// Declare sanitizePermissionIds for use by the surrounding module or function.
const sanitizePermissionIds = (values = []) => Array.from(new Set(
  (Array.isArray(values) ? values : []).filter(validObjectId).map((value) => String(value))
));

// Declare ensureRoleIndexes for use by the surrounding module or function.
const ensureRoleIndexes = async () => {
  // Check the condition (roleIndexesPromise) and run the matching branch.
  if (roleIndexesPromise) return roleIndexesPromise;

  // Perform the side effect or state update expressed on the following line.
  roleIndexesPromise = (async () => {
    // Declare indexes for use by the surrounding module or function.
    const indexes = await Role.collection.indexes();
    // Declare legacyNameIndex for use by the surrounding module or function.
    const legacyNameIndex = indexes.find(
      (index) => index.name === "name_1" && index.key?.name === 1 && Object.keys(index.key).length === 1,
    );

    // Check the condition (legacyNameIndex) and run the matching branch.
    if (legacyNameIndex) {
      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Perform the side effect or state update expressed on the following line.
        await Role.collection.dropIndex(legacyNameIndex.name);
      } catch (error) {
        // Check the condition (error?.codeName !== "IndexNotFound" && error?.code !== 27) and run the matching branch.
        if (error?.codeName !== "IndexNotFound" && error?.code !== 27) throw error;
      }
    }

    // Declare refreshed for use by the surrounding module or function.
    const refreshed = await Role.collection.indexes();
    // Declare tenantNameIndex for use by the surrounding module or function.
    const tenantNameIndex = refreshed.find(
      (index) => index.unique === true && index.key?.tenantId === 1 && index.key?.name === 1,
    );

    // Check the condition (!tenantNameIndex) and run the matching branch.
    if (!tenantNameIndex) {
      // Perform the side effect or state update expressed on the following line.
      await Role.collection.createIndex(
        { tenantId: 1, name: 1 },
        { unique: true, name: "tenantId_name_unique" },
      );
    }
  })().catch((error) => {
    // Perform the side effect or state update expressed on the following line.
    roleIndexesPromise = null;
    // Stop the current operation by raising the value of error.
    throw error;
  });

  // Return the value of roleIndexesPromise to the caller.
  return roleIndexesPromise;
};

// Declare ensureDefaultPermissions for use by the surrounding module or function.
export const ensureDefaultPermissions = async () => {
  // Perform the side effect or state update expressed on the following line.
  requireTenantId();
  // Check the condition (defaultsBootstrapPromise) and run the matching branch.
  if (defaultsBootstrapPromise) return defaultsBootstrapPromise;

  // Perform the side effect or state update expressed on the following line.
  defaultsBootstrapPromise = (async () => {
    // Perform the side effect or state update expressed on the following line.
    await ensureRoleIndexes();
    // Perform the side effect or state update expressed on the following line.
    await consolidateRoleAliases();

    // Declare allNames for use by the surrounding module or function.
    const allNames = [...new Set(Object.values(DEFAULT_PERMISSIONS).flat())];
    // Perform the side effect or state update expressed on the following line.
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
      // Check the condition (error?.code !== 11000 && !error?.writeErrors?.every((e) => e?.code ===) and run the matching branch.
      if (error?.code !== 11000 && !error?.writeErrors?.every((e) => e?.code === 11000)) throw error;
    });

    // Declare permissions for use by the surrounding module or function.
    const permissions = await Permission.find({ name: { $in: allNames } }).select("_id name").lean();
    // Declare byName for use by the surrounding module or function.
    const byName = new Map(permissions.map((permission) => [permission.name, permission._id]));

    // Repeat the enclosed work for each required iteration.
    for (const [roleName, names] of Object.entries(DEFAULT_PERMISSIONS)) {
      // Declare role for use by the surrounding module or function.
      const role = await Role.findOne({ name: roleName }).select("_id name permissions level").lean();
      // Declare ids for use by the surrounding module or function.
      const ids = names.map((name) => byName.get(name)).filter(Boolean);
      // Declare merged for use by the surrounding module or function.
      const merged = new Map(sanitizePermissionIds(role?.permissions || []).map((id) => [String(id), id]));
      // Perform the side effect or state update expressed on the following line.
      ids.forEach((id) => merged.set(String(id), id));
      // Declare metadata for use by the surrounding module or function.
      const metadata = ROLE_METADATA[roleName] || { displayName: roleName, level: 20, isSystem: false, isDefault: false };

      // Perform the side effect or state update expressed on the following line.
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

  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Return the completed the value of defaultsBootstrapPromise operation to the caller.
    return await defaultsBootstrapPromise;
  } finally {
    // Perform the side effect or state update expressed on the following line.
    defaultsBootstrapPromise = null;
  }
};

// Declare hydrateRoles for use by the surrounding module or function.
const hydrateRoles = async (roleDocs) => {
  // Declare permissionIds for use by the surrounding module or function.
  const permissionIds = Array.from(new Set(roleDocs.flatMap((role) => sanitizePermissionIds(role.permissions))));
  // Declare permissionDocs for use by the surrounding module or function.
  const permissionDocs = permissionIds.length
    ? await Permission.find({ _id: { $in: permissionIds } }).lean()
    : [];
  // Declare permissionMap for use by the surrounding module or function.
  const permissionMap = new Map(permissionDocs.map((permission) => [String(permission._id), permission]));

  // Return the result of roleDocs.map() to the caller.
  return roleDocs.map((role) => ({
    ...role,
    permissions: sanitizePermissionIds(role.permissions).map((id) => permissionMap.get(String(id))).filter(Boolean),
  }));
};

// Declare getRoles for use by the surrounding module or function.
export const getRoles = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await ensureDefaultPermissions();
    // Declare roleDocs for use by the surrounding module or function.
    const roleDocs = await Role.find(tenantFilter(req)).sort({ level: -1 }).lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, count: roleDocs.length, roles: await hydrateRoles(roleDocs) });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getPermissions for use by the surrounding module or function.
export const getPermissions = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await ensureDefaultPermissions();
    // Declare permissions for use by the surrounding module or function.
    const permissions = await Permission.find({ isActive: { $ne: false } }).sort({ module: 1, name: 1 }).lean();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, count: permissions.length, permissions });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getRole for use by the surrounding module or function.
export const getRole = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    // Declare roleDoc for use by the surrounding module or function.
    const roleDoc = await Role.findOne(tenantFilter(req, { _id: req.params.id })).lean();
    // Check the condition (!roleDoc) and run the matching branch.
    if (!roleDoc) return res.status(404).json({ success: false, message: "Role not found" });
    // Declare [role] for use by the surrounding module or function.
    const [role] = await hydrateRoles([roleDoc]);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, role });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare createRole for use by the surrounding module or function.
export const createRole = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await ensureRoleIndexes();
    // Declare { name, displayName, description = "", permissions = [], level = 1, status = "active", isDefault = false } for use by the surrounding module or function.
    const { name, displayName, description = "", permissions = [], level = 1, status = "active", isDefault = false } = req.body;
    // Check the condition (!name || !displayName) and run the matching branch.
    if (!name || !displayName) return res.status(400).json({ success: false, message: "Role name and display name are required." });

    // Declare normalizedName for use by the surrounding module or function.
    const normalizedName = normalizeRole(String(name).trim());
    // Check the condition (!normalizedName) and run the matching branch.
    if (!normalizedName) return res.status(400).json({ success: false, message: "A valid role name is required." });
    // Check the condition (normalizedName !== String(name).trim().toLowerCase().replace(/\s+/g, ") and run the matching branch.
    if (normalizedName !== String(name).trim().toLowerCase().replace(/\s+/g, "_")) return res.status(400).json({ success: false, message: "Use the canonical role name for this role." });
    // Declare permissionIds for use by the surrounding module or function.
    const permissionIds = sanitizePermissionIds(permissions);
    // Check the condition (permissionIds.length) and run the matching branch.
    if (permissionIds.length) {
      // Declare validPermissions for use by the surrounding module or function.
      const validPermissions = await Permission.countDocuments({ _id: { $in: permissionIds }, isActive: { $ne: false } });
      // Check the condition (validPermissions !== permissionIds.length) and run the matching branch.
      if (validPermissions !== permissionIds.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });
    }

    // Check the condition (await Role.findOne(tenantFilter(req, { name: normalizedName }))) and run the matching branch.
    if (await Role.findOne(tenantFilter(req, { name: normalizedName }))) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ success: false, message: "A role with this name already exists." });
    }

    // Declare role for use by the surrounding module or function.
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

    // Return the result of res.status(201).json() to the caller.
    return res.status(201).json({ success: true, role });
  } catch (error) {
    // Check the condition (error?.code === 11000) and run the matching branch.
    if (error?.code === 11000) return res.status(409).json({ success: false, message: "A role with this name already exists." });
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare updateRole for use by the surrounding module or function.
export const updateRole = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    // Declare role for use by the surrounding module or function.
    const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));
    // Check the condition (!role) and run the matching branch.
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    // Check the condition (normalizeRole(role.name) === "super_admin") and run the matching branch.
    if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role is protected and cannot be modified." });

    // Check the condition (Object.prototype.hasOwnProperty.call(req.body, "displayName")) and run the matching branch.
    if (Object.prototype.hasOwnProperty.call(req.body, "displayName")) role.displayName = String(req.body.displayName || "").trim();
    // Check the condition (Object.prototype.hasOwnProperty.call(req.body, "description")) and run the matching branch.
    if (Object.prototype.hasOwnProperty.call(req.body, "description")) role.description = String(req.body.description || "").trim();
    // Check the condition (Object.prototype.hasOwnProperty.call(req.body, "level")) and run the matching branch.
    if (Object.prototype.hasOwnProperty.call(req.body, "level")) role.level = Math.max(1, Number(req.body.level) || 1);
    // Check the condition (Object.prototype.hasOwnProperty.call(req.body, "status")) and run the matching branch.
    if (Object.prototype.hasOwnProperty.call(req.body, "status")) role.status = req.body.status === "inactive" ? "inactive" : "active";
    // Check the condition (Object.prototype.hasOwnProperty.call(req.body, "isDefault")) and run the matching branch.
    if (Object.prototype.hasOwnProperty.call(req.body, "isDefault")) role.isDefault = Boolean(req.body.isDefault);

    // Perform the side effect or state update expressed on the following line.
    await role.save();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, role });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare deleteRole for use by the surrounding module or function.
export const deleteRole = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    // Declare role for use by the surrounding module or function.
    const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));
    // Check the condition (!role) and run the matching branch.
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    // Check the condition (normalizeRole(role.name) === "super_admin") and run the matching branch.
    if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role cannot be deleted." });
    // Check the condition (role.isSystem) and run the matching branch.
    if (role.isSystem) return res.status(403).json({ success: false, message: "System roles cannot be deleted. You may modify their permissions instead." });
    // Perform the side effect or state update expressed on the following line.
    await role.deleteOne();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, message: "Role deleted" });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare updatePermissions for use by the surrounding module or function.
export const updatePermissions = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (!mongoose.Types.ObjectId.isValid(req.params.id)) and run the matching branch.
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) return res.status(400).json({ success: false, message: "Invalid role ID" });
    // Declare role for use by the surrounding module or function.
    const role = await Role.findOne(tenantFilter(req, { _id: req.params.id }));
    // Check the condition (!role) and run the matching branch.
    if (!role) return res.status(404).json({ success: false, message: "Role not found" });
    // Check the condition (normalizeRole(role.name) === "super_admin") and run the matching branch.
    if (normalizeRole(role.name) === "super_admin") return res.status(403).json({ success: false, message: "The Super Admin role permissions cannot be modified." });

    // Declare permissionIds for use by the surrounding module or function.
    const permissionIds = sanitizePermissionIds(req.body.permissions);
    // Check the condition (permissionIds.length) and run the matching branch.
    if (permissionIds.length) {
      // Declare validPermissions for use by the surrounding module or function.
      const validPermissions = await Permission.countDocuments({ _id: { $in: permissionIds }, isActive: { $ne: false } });
      // Check the condition (validPermissions !== permissionIds.length) and run the matching branch.
      if (validPermissions !== permissionIds.length) return res.status(400).json({ success: false, message: "One or more selected permissions are invalid." });
    }

    // Perform the side effect or state update expressed on the following line.
    role.permissions = permissionIds;
    // Perform the side effect or state update expressed on the following line.
    await role.save();
    // Return the result of res.json() to the caller.
    return res.json({ success: true, role });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};

// Declare getRolesAndPermissions for use by the surrounding module or function.
export const getRolesAndPermissions = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    await ensureDefaultPermissions();
    // Declare [roleDocs, permissions] for use by the surrounding module or function.
    const [roleDocs, permissions] = await Promise.all([
      Role.find(tenantFilter(req)).sort({ level: -1 }).lean(),
      Permission.find({ isActive: { $ne: false } }).sort({ module: 1, name: 1 }).lean(),
    ]);
    // Return the result of res.json() to the caller.
    return res.json({ success: true, roles: await hydrateRoles(roleDocs), permissions });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    next(error);
  }
};
