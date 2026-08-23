import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import mongoose from "mongoose";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import { normalizeRole } from "../utils/roleUtils.js";

const DEFAULT_PERMISSIONS = {
  customer: ["profile.view", "booking.create", "booking.view", "wishlist.manage"],
  agent: [
    "admin.dashboard", "booking.create", "booking.view", "customer.view", "commission.view",
    "view_agent_dashboard", "view_agent_tours", "create_agent_tour", "edit_agent_tour", "delete_agent_tour",
  ],
  manager: ["tour.view", "tour.create", "tour.update", "booking.view", "booking.cancel", "tour.assign", "tour.availability", "calendar.manage", "customer.view", "guide.view", "vehicle.view", "report.view"],
  tour_guide: ["tour.view", "view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"],
  driver: ["tour.view", "view_assigned_tours"],
  admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "finance.view", "notifications.view", "report.view"],
  super_admin: [
    "admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage",
    "analytics.view", "finance.view", "notifications.view", "report.view", "roles.manage", "settings.manage",
    "system.audit", "system.security", "system.database", "system.backup",
  ],
};

let defaultsBootstrapPromise = null;
let roleIndexesPromise = null;

const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const sanitizePermissionIds = (values = []) =>
  Array.from(new Set(
    (Array.isArray(values) ? values : [])
      .filter(validObjectId)
      .map((value) => String(value))
  ));

/**
 * The RBAC Role schema is tenant-scoped, so role names must be unique per
 * tenant rather than globally. Older deployments may still have the legacy
 * `name_1` MongoDB index. Remove that stale index and ensure the intended
 * compound unique index exists before the idempotent role bootstrap runs.
 */
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
    const byName = new Map(permissions.map(p => [p.name, p._id]));

    const ROLE_METADATA = {
      super_admin: { displayName: "Super Admin", level: 100, isSystem: true, isDefault: false },
      admin: { displayName: "Admin", level: 90, isSystem: true, isDefault: false },
      manager: { displayName: "Tour Manager", level: 70, isSystem: true, isDefault: false },
      tour_guide: { displayName: "Tour Guide", level: 50, isSystem: true, isDefault: false },
      driver: { displayName: "Driver", level: 40, isSystem: true, isDefault: false },
      agent: { displayName: "Travel Agent", level: 40, isSystem: true, isDefault: false },
      customer: { displayName: "Customer", level: 10, isSystem: true, isDefault: true },
    };

    for (const [roleName, names] of Object.entries(DEFAULT_PERMISSIONS)) {
      const role = await Role.findOne({ name: roleName })
        .select("_id name permissions level")
        .lean();

      const ids = names.map((name) => byName.get(name)).filter(Boolean);
      const merged = new Map(
        sanitizePermissionIds(role?.permissions || []).map((id) => [String(id), id])
      );
      ids.forEach((id) => merged.set(String(id), id));
      const permissionsValue = [...merged.values()];
      const metadata = ROLE_METADATA[roleName] || {
        displayName: roleName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
        level: 20,
        isSystem: false,
        isDefault: false,
      };

      const set = {
        permissions: permissionsValue,
        status: "active",
        displayName: metadata.displayName,
        description: `${roleName.replace(/_/g, " ")} access`,
        isSystem: metadata.isSystem,
        level: metadata.level,
        isDefault: metadata.isDefault,
      };

      await Role.updateOne(
        role ? { _id: role._id } : { name: roleName },
        { $set: set, $setOnInsert: { name: roleName } },
        { upsert: true },
      );
    }
  })();

  try {
    return await defaultsBootstrapPromise;
  } finally {
    defaultsBootstrapPromise = null;
  }
};

export const getRoles = async (req, res, next) => {
  try {
    await ensureDefaultPermissions();
    const roleDocs = await Role.find(tenantFilter(req)).sort({ level: -1 }).lean();
    const permissionIds = Array.from(new Set(
      roleDocs.flatMap((role) => sanitizePermissionIds(role.permissions))
    ));
    const permissionDocs = permissionIds.length
      ? await Permission.find({ _id: { $in: permissionIds } }).lean()
      : [];
    const permissionMap = new Map(permissionDocs.map((permission) => [String(permission._id), permission]));
    const roles = roleDocs.map((role) => ({
      ...role,
      permissions: sanitizePermissionIds(role.permissions)
        .map((id) => permissionMap.get(String(id)))
        .filter(Boolean),
    }));

    return res.json({ success: true, count: roles.length, roles });
  } catch (error) {
    next(error);
  }
};

export const getPermissions = async (req, res, next) => {
  try {
    await ensureDefaultPermissions();
    const permissions = await Permission.find({ isActive: true }).sort({ module: 1, name: 1 }).lean();
    return res.json({ success: true, count: permissions.length, permissions });
  } catch (error) {
    next(error);
  }
};

export const getRolesAndPermissions = async (req, res, next) => {
  try {
    await ensureDefaultPermissions();
    const [roles, permissions] = await Promise.all([
      Role.find(tenantFilter(req)).sort({ level: -1 }).lean(),
      Permission.find({ isActive: true }).sort({ module: 1, name: 1 }).lean(),
    ]);
    return res.json({ success: true, roles, permissions });
  } catch (error) {
    next(error);
  }
};

export { normalizeRole };
