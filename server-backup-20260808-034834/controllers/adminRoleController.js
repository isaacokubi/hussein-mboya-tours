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
