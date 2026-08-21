import { mergeTenantFilter } from "../tenancy/context.js";
import { tenantFilter } from "../tenancy/tenantQuery.js";
import mongoose from "mongoose";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";
import { normalizeRole } from "../utils/roleUtils.js";



/*
|--------------------------------------------------------------------------
| GET ROLES
|--------------------------------------------------------------------------
*/

const DEFAULT_PERMISSIONS = {
  customer: ["profile.view", "booking.create", "booking.view", "wishlist.manage"],
  agent: [
    "admin.dashboard",
    "booking.create",
    "booking.view",
    "customer.view",
    "commission.view",
    "view_agent_dashboard",
    "view_agent_tours",
    "create_agent_tour",
    "edit_agent_tour",
    "delete_agent_tour",
  ],
  manager: ["tour.view", "tour.create", "tour.update", "booking.view", "booking.cancel", "tour.assign", "tour.availability", "calendar.manage", "customer.view", "guide.view", "vehicle.view", "report.view"],
  tour_guide: ["tour.view", "view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"],
  driver: ["tour.view", "view_assigned_tours"],
  admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "finance.view", "notifications.view", "report.view"],
  super_admin: [
"admin.dashboard",
"user.manage",
"staff.manage",
"tour.manage",
"booking.manage",
"payment.manage",
"refund.manage",
"analytics.view",
"finance.view",
"notifications.view",
"report.view",
"roles.manage",
"settings.manage",
"system.audit",
"system.security",
"system.database",
"system.backup"
],
};

let defaultsBootstrapPromise = null;

const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const sanitizePermissionIds = (values = []) =>
  Array.from(new Set(
    (Array.isArray(values) ? values : [])
      .filter(validObjectId)
      .map((value) => String(value))
  ));

export const ensureDefaultPermissions = async () => {
  if (defaultsBootstrapPromise) return defaultsBootstrapPromise;

  defaultsBootstrapPromise = (async () => {
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

    for (const [roleName, names] of Object.entries(DEFAULT_PERMISSIONS)) {
      let role = await Role.findOne({ name: roleName })
        .select("_id name permissions level")
        .lean();

      const roleDocName = role?.name || roleName;
      const ids = names.map((name) => byName.get(name)).filter(Boolean);
      const merged = new Map(
        sanitizePermissionIds(role?.permissions || []).map((id) => [String(id), id])
      );
      ids.filter(Boolean).forEach((id) => merged.set(String(id), id));
      const permissionsValue = [...merged.values()];

      const ROLE_METADATA = {
        super_admin: {
          displayName: "Super Admin",
          level: 100,
          isSystem: true,
          isDefault: false,
        },
        admin: {
          displayName: "Admin",
          level: 90,
          isSystem: true,
          isDefault: false,
        },
        manager: {
          displayName: "Tour Manager",
          level: 70,
          isSystem: true,
          isDefault: false,
        },
        tour_guide: {
          displayName: "Tour Guide",
          level: 50,
          isSystem: true,
          isDefault: false,
        },
        driver: {
          displayName: "Driver",
          level: 40,
          isSystem: true,
          isDefault: false,
        },
        agent: {
          displayName: "Travel Agent",
          level: 40,
          isSystem: true,
          isDefault: false,
        },
        customer: {
          displayName: "Customer",
          level: 10,
          isSystem: true,
          isDefault: true,
        },
      };

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
        { $set: set, $setOnInsert: { name: roleDocName } },
        { upsert: !role }
      );
    }
  })();

  try { return await defaultsBootstrapPromise; }
  finally { defaultsBootstrapPromise = null; }
};

export const getRoles = async(req,res,next)=>{

try{

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

return res.json({
  success: true,
  count: roles.length,
  roles,
});


}catch(error){

next(error);

}

};





/*
|--------------------------------------------------------------------------
| GET SINGLE ROLE
|--------------------------------------------------------------------------
*/



export const getPermissions = async (req, res, next) => {
  try {
    await ensureDefaultPermissions();
    const permissions = await Permission.find({ isActive: { $ne: false } })
      .sort({ module: 1, name: 1 })
      .lean();
    return res.json({ success: true, permissions });
  } catch (error) {
    next(error);
  }
};

export const getRole = async(req,res,next)=>{

try{


if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
  return res.status(400).json({ success: false, message: "Invalid role ID" });
}

const roleDoc = await Role.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
).lean();
if (!roleDoc) {
  return res.status(404).json({ success: false, message: "Role not found" });
}

const permissionIds = sanitizePermissionIds(roleDoc.permissions);
const permissions = permissionIds.length
  ? await Permission.find({ _id: { $in: permissionIds } }).lean()
  : [];
const permissionMap = new Map(permissions.map((permission) => [String(permission._id), permission]));
const role = {
  ...roleDoc,
  permissions: permissionIds.map((id) => permissionMap.get(String(id))).filter(Boolean),
};



if(!role){

return res.status(404).json({

success:false,

message:"Role not found"

});

}


res.json({

success:true,

role

});


}catch(error){

next(error);

}

};






/*
|--------------------------------------------------------------------------
| CREATE ROLE
|--------------------------------------------------------------------------
*/

export const createRole = async (req, res, next) => {
  try {
    const {
      name,
      displayName,
      description = "",
      permissions = [],
      level = 1,
      status = "active",
      isDefault = false,
    } = req.body;

    if (!name || !displayName) {
      return res.status(400).json({
        success: false,
        message: "Role name and display name are required.",
      });
    }

    const normalizedName = String(name)
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

    const permissionIds = sanitizePermissionIds(permissions);

    if (permissionIds.length) {
      const validPermissions = await Permission.countDocuments({
        _id: { $in: permissionIds },
        isActive: { $ne: false },
      });

      if (validPermissions !== permissionIds.length) {
        return res.status(400).json({
          success: false,
          message: "One or more selected permissions are invalid.",
        });
      }
    }

    const existingRole = await Role.findOne({
      name: normalizedName,
    });

    if (existingRole) {
      return res.status(409).json({
        success: false,
        message: "A role with this name already exists.",
      });
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

    return res.status(201).json({
      success: true,
      role,
    });
  } catch (error) {
    next(error);
  }
};



export const updateRole = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    const role = await Role.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const normalizedRoleName = normalizeRole(role.name);

    /*
     * Super Admin is the only permanently protected role.
     * Other system roles may be administered by a Super Admin.
     */
    if (normalizedRoleName === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "The Super Admin role is protected and cannot be modified.",
      });
    }

    const allowedFields = [
      "displayName",
      "description",
      "level",
      "status",
      "isDefault",
    ];

    for (const field of allowedFields) {
      if (!Object.prototype.hasOwnProperty.call(req.body, field)) {
        continue;
      }

      if (field === "level") {
        role.level = Math.max(1, Number(req.body.level) || 1);
      } else if (field === "status") {
        role.status =
          req.body.status === "inactive"
            ? "inactive"
            : "active";
      } else if (field === "isDefault") {
        role.isDefault = Boolean(req.body.isDefault);
      } else if (field === "displayName") {
        role.displayName = String(req.body.displayName || "").trim();
      } else if (field === "description") {
        role.description = String(req.body.description || "").trim();
      }
    }

    await role.save();

    return res.json({
      success: true,
      role,
    });
  } catch (error) {
    next(error);
  }
};


export const deleteRole = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    const role = await Role.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    const normalizedRoleName = normalizeRole(role.name);

    if (normalizedRoleName === "superadmin") {
      return res.status(403).json({
        success: false,
        message: "The Super Admin role cannot be deleted.",
      });
    }

    /*
     * Other system roles may be protected from deletion.
     * They can still have their permissions managed by Super Admin.
     */
    if (role.isSystem) {
      return res.status(403).json({
        success: false,
        message: "System roles cannot be deleted. You may modify their permissions instead.",
      });
    }

    await role.deleteOne();

    return res.json({
      success: true,
      message: "Role deleted",
    });
  } catch (error) {
    next(error);
  }
};





/*
|--------------------------------------------------------------------------
| UPDATE PERMISSIONS
|--------------------------------------------------------------------------
*/

export const updatePermissions = async (req, res, next) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid role ID",
      });
    }

    const role = await Role.findOne(
mergeTenantFilter(req,{
_id:req.params.id
})
);

    if (!role) {
      return res.status(404).json({
        success: false,
        message: "Role not found",
      });
    }

    /*
     * Super Admin permissions must never be removed or altered.
     */
    const normalizedRoleName = normalizeRole(role.name);

    if (normalizedRoleName === "superadmin") {
      return res.status(403).json({
        success: false,
        message:
          "The Super Admin role permissions cannot be modified.",
      });
    }

    const permissionIds =
      sanitizePermissionIds(req.body.permissions);

    if (permissionIds.length) {
      const validPermissions =
        await Permission.countDocuments({
          _id: { $in: permissionIds },
          isActive: { $ne: false },
        });

      if (validPermissions !== permissionIds.length) {
        return res.status(400).json({
          success: false,
          message:
            "One or more selected permissions are invalid.",
        });
      }
    }

    role.permissions = permissionIds;

    await role.save();

    return res.json({
      success: true,
      role,
    });
  } catch (error) {
    next(error);
  }
};
