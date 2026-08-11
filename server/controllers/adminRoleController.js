import mongoose from "mongoose";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";



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
  tour_manager: ["tour.view", "tour.create", "tour.update", "booking.view", "booking.cancel", "tour.assign", "tour.availability", "calendar.manage", "customer.view", "guide.view", "vehicle.view", "report.view"],
  tour_guide: ["tour.view", "view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"],
  driver: ["tour.view", "view_assigned_tours"],
  admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage", "notifications.view", "finance.view"],
  super_admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage", "notifications.view", "finance.view"],
};

let defaultsBootstrapPromise = null;

const validObjectId = (value) => mongoose.Types.ObjectId.isValid(value);

const sanitizePermissionIds = (values = []) =>
  Array.from(new Set(
    (Array.isArray(values) ? values : [])
      .filter(validObjectId)
      .map((value) => String(value))
  ));

const ensureDefaultPermissions = async () => {
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
      let role = await Role.findOne({ name: { $in: [roleName, roleName.replace("tour_", "")] } }).select("_id name permissions").lean();
      const roleDocName = role?.name || roleName;
      const ids = names.map((name) => byName.get(name)).filter(Boolean);
      const merged = new Map(
        sanitizePermissionIds(role?.permissions || []).map((id) => [String(id), id])
      );
      ids.filter(Boolean).forEach((id) => merged.set(String(id), id));
      const permissionsValue = [...merged.values()];

      const set = { permissions: permissionsValue, status: "active" };
      if (!role) {
        set.displayName = roleName.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());
        set.description = `${roleName.replace(/_/g, " ")} access`;
        set.isSystem = ["admin", "super_admin", "tour_manager", "tour_guide", "driver"].includes(roleName);
        set.level = roleName === "super_admin" ? 200 : roleName === "admin" ? 100 : 20;
        set.isDefault = roleName === "customer";
      } else if (!Number.isFinite(Number(role.level)) || Number(role.level) < 1) {
        set.level = roleName === "super_admin" ? 200 : roleName === "admin" ? 100 : 20;
      }

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

const roleDocs = await Role.find().sort({ level: -1 }).lean();
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

const roleDoc = await Role.findById(req.params.id).lean();
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

export const createRole = async(req,res,next)=>{

try{


const role =
await Role.create({

name:req.body.name,

displayName:req.body.displayName,

description:req.body.description || "",

permissions:req.body.permissions || [],

level:req.body.level || 1,

status:req.body.status || "active",

isDefault:req.body.isDefault || false,

createdBy:req.user?._id || null

});



res.status(201).json({

success:true,

role

});


}catch(error){

next(error);

}

};







/*
|--------------------------------------------------------------------------
| UPDATE ROLE
|--------------------------------------------------------------------------
*/

export const updateRole = async(req,res,next)=>{

try{


const role =
await Role.findById(
req.params.id
);



if(!role){

return res.status(404).json({

success:false,

message:"Role not found"

});

}





if(role.isSystem){

return res.status(403).json({

success:false,

message:"System roles cannot be modified"

});

}




Object.assign(
role,
req.body
);



await role.save();



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
| DELETE ROLE
|--------------------------------------------------------------------------
*/

export const deleteRole = async(req,res,next)=>{

try{


const role =
await Role.findById(
req.params.id
);



if(!role){

return res.status(404).json({

success:false,

message:"Role not found"

});

}




if(role.isSystem){

return res.status(403).json({

success:false,

message:"System roles cannot be deleted"

});

}



await role.deleteOne();



res.json({

success:true,

message:"Role deleted"

});



}catch(error){

next(error);

}

};









/*
|--------------------------------------------------------------------------
| UPDATE PERMISSIONS
|--------------------------------------------------------------------------
*/

export const updatePermissions = async(req,res,next)=>{

try{


const role =
await Role.findById(
req.params.id
);



if(!role){

return res.status(404).json({

success:false,

message:"Role not found"

});

}



const permissionIds = sanitizePermissionIds(req.body.permissions);

if (role.isSystem && ["super_admin", "superadmin"].includes(role.name)) {
  return res.status(403).json({
    success: false,
    message: "The Super Admin role permissions cannot be modified.",
  });
}

role.permissions = permissionIds;
await role.save();



res.json({

success:true,

role

});


}catch(error){

next(error);

}

};
