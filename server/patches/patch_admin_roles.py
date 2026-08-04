from pathlib import Path
import shutil


ROOT = Path(__file__).resolve().parents[1]


def backup(file):
    backup_file = Path(str(file) + ".backup")

    if not backup_file.exists():
        shutil.copy(file, backup_file)
        print("Backup:", backup_file)



def write_file(path, content):

    path.parent.mkdir(
        parents=True,
        exist_ok=True
    )

    if path.exists():
        print("Already exists:", path)
        return

    path.write_text(
        content.strip() + "\n"
    )

    print("Created:", path)



# -------------------------------------------------
# ADMIN ROLE CONTROLLER
# -------------------------------------------------

write_file(

ROOT / "controllers/adminRoleController.js",

r'''
import Role from "../models/Role.js";



/*
|--------------------------------------------------------------------------
| GET ROLES
|--------------------------------------------------------------------------
*/

export const getRoles = async(req,res,next)=>{

try{


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

'''
)





# -------------------------------------------------
# ADMIN ROLE ROUTES
# -------------------------------------------------

write_file(

ROOT / "routes/adminRoleRoutes.js",

r'''
import express from "express";


import {

getRoles,
getRole,
createRole,
updateRole,
deleteRole,
updatePermissions

}

from "../controllers/adminRoleController.js";


import {
protect
}
from "../middleware/authMiddleware.js";


import adminMiddleware
from "../middleware/adminMiddleware.js";



const router =
express.Router();



router.use(protect);

router.use(adminMiddleware);



router.get(
"/",
getRoles
);



router.get(
"/:id",
getRole
);



router.post(
"/",
createRole
);



router.put(
"/:id",
updateRole
);



router.delete(
"/:id",
deleteRole
);



router.patch(
"/:id/permissions",
updatePermissions
);



export default router;
'''
)






# -------------------------------------------------
# UPDATE INDEX ROUTES
# -------------------------------------------------

index = ROOT / "routes/index.js"

backup(index)



text=index.read_text()



if "adminRoleRoutes" not in text:


    text=text.replace(

'import adminPaymentRoutes from "./adminPaymentRoutes.js";',

'import adminPaymentRoutes from "./adminPaymentRoutes.js";\nimport adminRoleRoutes from "./adminRoleRoutes.js";'

)



if '"/admin/roles"' not in text:


    text=text.replace(

'router.use(\n  "/admin/payments",\n  adminPaymentRoutes\n);',

'''router.use(
  "/admin/payments",
  adminPaymentRoutes
);


router.use(
  "/admin/roles",
  adminRoleRoutes
);'''

)



index.write_text(text)



print("ADMIN ROLE PATCH COMPLETE")
