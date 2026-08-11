import Role from "../models/Role.js";
import Permission from "../models/Permission.js";



/*
|--------------------------------------------------------------------------
| GET ROLES
|--------------------------------------------------------------------------
*/

const DEFAULT_PERMISSIONS = {
  customer: ["profile.view", "booking.create", "booking.view", "wishlist.manage"],
  agent: ["booking.create", "booking.view", "customer.view", "commission.view"],
  tour_manager: ["tour.view", "tour.create", "tour.update", "booking.view", "booking.cancel", "tour.assign", "tour.availability", "calendar.manage", "customer.view", "guide.view", "vehicle.view", "report.view"],
  tour_guide: ["tour.view", "view_assigned_tours", "view_tour_guests", "update_tour_status", "submit_tour_report"],
  driver: ["tour.view", "view_assigned_tours"],
  admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage", "notifications.view", "finance.view"],
  super_admin: ["admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage", "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage", "notifications.view", "finance.view"],
};

const ensureDefaultPermissions = async () => {
  const allNames = [...new Set(Object.values(DEFAULT_PERMISSIONS).flat())];
  await Permission.bulkWrite(allNames.map((name) => ({
    updateOne: {
      filter: { name },
      update: {
        $setOnInsert: {
          name,
          label: name.replace(/[._]/g, " ").replace(/\b\w/g, c => c.toUpperCase()),
          description: `Permission: ${name}`,
          module: name.split(/[._]/)[0],
          category: "system",
          isActive: true,
        },
      },
      upsert: true,
    },
  })));

  const permissions = await Permission.find({ name: { $in: allNames } }).lean();
  const byName = new Map(permissions.map(p => [p.name, p._id]));

  for (const [roleName, names] of Object.entries(DEFAULT_PERMISSIONS)) {
    const role = await Role.findOne({
      name: { $in: [roleName, roleName.replace("tour_", "")] },
    });
    if (!role) continue;
    if (!role.permissions?.length) {
      role.permissions = names.map(name => byName.get(name)).filter(Boolean);
      await role.save();
    }
  }
};

export const getRoles = async(req,res,next)=>{

try{

await ensureDefaultPermissions();

const roles =
await Role.find()

.populate(
"permissions"
)

.sort({
level:-1
});


res.json({

success:true,

count:roles.length,

roles

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


const role =
await Role.findById(
req.params.id
)
.populate(
"permissions"
);



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



role.permissions =
req.body.permissions || [];



await role.save();



res.json({

success:true,

role

});


}catch(error){

next(error);

}

};
