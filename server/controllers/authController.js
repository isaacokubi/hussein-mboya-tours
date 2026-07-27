import "../models/Role.js";
import "../models/Permission.js";


import User from "../models/User.js";
import Role from "../models/Role.js";
import SecurityLog from "../models/SecurityLog.js";

import generateToken from "../utils/generateToken.js";





/*
|--------------------------------------------------------------------------
| LOGIN USER
|--------------------------------------------------------------------------
*/

export const login = async (req,res,next)=>{


try{


const {

email,

password

}=req.body;





/*
|--------------------------------------------------------------------------
| FIND USER + LOAD ROLE PERMISSIONS
|--------------------------------------------------------------------------
*/


const user = await User.findOne({

email:email.toLowerCase()

})


.populate({

path:"role",

populate:{

path:"permissions"

}

})


.populate({

path:"permissionsOverride"

});







if(!user){


await SecurityLog.create({

email,

action:"login_failed",

ipAddress:req.ip,

userAgent:req.headers["user-agent"],

details:"User not found"

});



return res.status(401).json({

success:false,

message:"Invalid email or password"

});


}








/*
|--------------------------------------------------------------------------
| ACCOUNT STATUS CHECK
|--------------------------------------------------------------------------
*/


if(user.status !== "active"){


await SecurityLog.create({

user:user._id,

email:user.email,

action:"login_blocked",

ipAddress:req.ip,

userAgent:req.headers["user-agent"],

details:`Account ${user.status}`

});




return res.status(403).json({

success:false,

message:`Account ${user.status}`

});


}








/*
|--------------------------------------------------------------------------
| ACCOUNT LOCK CHECK
|--------------------------------------------------------------------------
*/


if(

user.lockUntil &&

user.lockUntil > Date.now()

){


return res.status(423).json({

success:false,

message:"Account temporarily locked"

});


}








/*
|--------------------------------------------------------------------------
| PASSWORD CHECK
|--------------------------------------------------------------------------
*/


const passwordMatch =

await user.matchPassword(password);






if(!passwordMatch){


user.loginAttempts += 1;




if(user.loginAttempts >= 5){


user.lockUntil =

new Date(

Date.now()+30*60*1000

);


}




await user.save();





await SecurityLog.create({

user:user._id,

email:user.email,

action:"login_failed",

ipAddress:req.ip,

userAgent:req.headers["user-agent"],

details:"Invalid password"

});






return res.status(401).json({

success:false,

message:"Invalid email or password"

});


}








/*
|--------------------------------------------------------------------------
| RESET SECURITY
|--------------------------------------------------------------------------
*/


user.loginAttempts = 0;

user.lockUntil = null;

user.lastLoginAt = new Date();



await user.save();








/*
|--------------------------------------------------------------------------
| LOGIN SUCCESS LOG
|--------------------------------------------------------------------------
*/


await SecurityLog.create({

user:user._id,

email:user.email,

action:"login_success",

ipAddress:req.ip,

userAgent:req.headers["user-agent"]

});









/*
|--------------------------------------------------------------------------
| BUILD PERMISSIONS
|--------------------------------------------------------------------------
*/


const rolePermissions =

user.role?.permissions || [];



const overridePermissions =

user.permissionsOverride || [];





const permissionMap = new Map();





[

...rolePermissions,

...overridePermissions

].forEach(permission=>{


permissionMap.set(

permission.name,

permission

);


});







const permissions =

Array.from(permissionMap.values())

.map(permission=>({


name:permission.name,

label:permission.label,

path:permission.path,

icon:permission.icon,

module:permission.module


}));










/*
|--------------------------------------------------------------------------
| USER RESPONSE
|--------------------------------------------------------------------------
*/


const userResponse = {


_id:user._id,


name:user.name,


email:user.email,


phone:user.phone,



role:user.role

?

user.role.name

:

null,



permissions,



legacyRole:user.legacyRole,



status:user.status,



isVerified:user.isVerified,



loyaltyPoints:user.loyaltyPoints,



referralCode:user.referralCode,



lastLoginAt:user.lastLoginAt,



createdAt:user.createdAt


};










/*
|--------------------------------------------------------------------------
| CREATE TOKEN
|--------------------------------------------------------------------------
*/


const token = generateToken({

id:user._id,

role:user.role?.name,

permissions

});








return res.status(200).json({

success:true,

token,

user:userResponse

});






}catch(error){


console.error(

"LOGIN ERROR:",

error

);


next(error);


}


};












/*
|--------------------------------------------------------------------------
| REGISTER USER
|--------------------------------------------------------------------------
*/

export const register = async(req,res,next)=>{


try{


const {

name,

email,

phone,

password

}=req.body;







/*
|--------------------------------------------------------------------------
| CHECK EXISTING USER
|--------------------------------------------------------------------------
*/


const existingUser =

await User.findOne({

email:email.toLowerCase()

});





if(existingUser){


return res.status(400).json({

success:false,

message:"User already exists"

});


}








/*
|--------------------------------------------------------------------------
| GET CUSTOMER ROLE
|--------------------------------------------------------------------------
*/


const customerRole =

await Role.findOne({

name:"Customer"

});





if(!customerRole){


return res.status(500).json({

success:false,

message:"Customer role not configured"

});


}








/*
|--------------------------------------------------------------------------
| CREATE USER
|--------------------------------------------------------------------------
*/


const user = await User.create({

name,

email:email.toLowerCase(),

phone,

password,

role:customerRole._id,

legacyRole:"customer",

status:"active"


});








/*
|--------------------------------------------------------------------------
| GENERATE TOKEN
|--------------------------------------------------------------------------
*/


const token = generateToken({

id:user._id,

role:"Customer",

permissions:[]

});








return res.status(201).json({

success:true,

token,


user:{


_id:user._id,


name:user.name,


email:user.email,


phone:user.phone,


role:"Customer",


permissions:[],


legacyRole:user.legacyRole,


status:user.status


}


});







}catch(error){


console.error(

"REGISTER ERROR:",

error

);


next(error);


}


};









/*
|--------------------------------------------------------------------------
| GET CURRENT USER
|--------------------------------------------------------------------------
|
| GET /api/auth/me
|
|--------------------------------------------------------------------------
*/


export const getMe = async(req,res)=>{


try{


const user = await User.findById(req.user._id)


.populate({

path:"role",

populate:{

path:"permissions"

}

})


.populate({

path:"permissionsOverride"

});








if(!user){


return res.status(404).json({

success:false,

message:"User not found"

});


}








const rolePermissions =

user.role?.permissions || [];



const overridePermissions =

user.permissionsOverride || [];





const permissionMap = new Map();





[

...rolePermissions,

...overridePermissions

].forEach(permission=>{


permissionMap.set(

permission.name,

permission

);


});







const permissions =

Array.from(permissionMap.values())

.map(permission=>({


name:permission.name,

label:permission.label,

path:permission.path,

icon:permission.icon,

module:permission.module


}));







return res.status(200).json({

success:true,


user:{


_id:user._id,


name:user.name,


email:user.email,


phone:user.phone,


role:user.role?.name || null,


permissions,


legacyRole:user.legacyRole,


status:user.status,


isVerified:user.isVerified,


loyaltyPoints:user.loyaltyPoints,


referralCode:user.referralCode,


lastLoginAt:user.lastLoginAt,


createdAt:user.createdAt


}


});





}catch(error){


console.error(

"GET ME ERROR:",

error

);



return res.status(500).json({

success:false,

message:error.message

});


}


};