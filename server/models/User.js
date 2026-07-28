// server/models/User.js


import mongoose from "mongoose";

import bcrypt from "bcryptjs";





const userSchema = new mongoose.Schema(


{


/*
|--------------------------------------------------------------------------
| BASIC INFORMATION
|--------------------------------------------------------------------------
*/


name:{


type:String,


required:true,


trim:true


},




email:{


type:String,


required:true,


unique:true,


lowercase:true,


trim:true


},




password:{


type:String,


required:true


},




phone:{


type:String,


default:""


},









/*
|--------------------------------------------------------------------------
| PROFILE IMAGE
|--------------------------------------------------------------------------
|
| Cloudinary storage
|
|--------------------------------------------------------------------------
*/


profileImage:{


url:{


type:String,


default:""


},



publicId:{


type:String,


default:""


}



},







/*
|--------------------------------------------------------------------------
| ROLE SYSTEM
|--------------------------------------------------------------------------
|
| role = application role
|
| roleId = advanced RBAC reference
|
|--------------------------------------------------------------------------
*/


role:{


type:String,


enum:[


"customer",


"admin",


"agent",


"manager",


"guide"


],



default:"customer"


},






roleId:{


type:mongoose.Schema.Types.ObjectId,


ref:"Role",


default:null


},









/*
|--------------------------------------------------------------------------
| LEGACY ROLE SUPPORT
|--------------------------------------------------------------------------
*/


legacyRole:{


type:String,


default:"customer"


},







/*
|--------------------------------------------------------------------------
| AGENT LINK
|--------------------------------------------------------------------------
*/


agent:{


type:mongoose.Schema.Types.ObjectId,


ref:"Agent",


default:null


},







/*
|--------------------------------------------------------------------------
| PERMISSIONS OVERRIDE
|--------------------------------------------------------------------------
*/


permissionsOverride:[


{


type:mongoose.Schema.Types.ObjectId,


ref:"Permission"


}


],







/*
|--------------------------------------------------------------------------
| ACCOUNT STATUS
|--------------------------------------------------------------------------
*/


status:{


type:String,


enum:[


"active",


"inactive",


"suspended"


],



default:"active"


},




isVerified:{


type:Boolean,


default:false


},







/*
|--------------------------------------------------------------------------
| CUSTOMER MANAGEMENT
|--------------------------------------------------------------------------
|
| Used by Admin CRM dashboard
|
|--------------------------------------------------------------------------
*/


customerType:{


type:String,


enum:[


"regular",


"vip",


"corporate"


],



default:"regular"


},





totalSpent:{


type:Number,


default:0


},





totalBookings:{


type:Number,


default:0


},







/*
|--------------------------------------------------------------------------
| ADDRESS INFORMATION
|--------------------------------------------------------------------------
*/


address:{


type:String,


default:""


},




country:{


type:String,


default:""


},









/*
|--------------------------------------------------------------------------
| SECURITY
|--------------------------------------------------------------------------
*/


loginAttempts:{


type:Number,


default:0


},




lockUntil:{


type:Date,


default:null


},




lastLoginAt:{


type:Date,


default:null


},




passwordChangedAt:{


type:Date,


default:null


},




resetPasswordToken:{


type:String,


default:null


},




resetPasswordExpire:{


type:Date,


default:null


},







/*
|--------------------------------------------------------------------------
| LOYALTY
|--------------------------------------------------------------------------
*/


referralCode:{


type:String,


unique:true,


sparse:true


},




referredBy:{


type:String,


default:null


},




loyaltyPoints:{


type:Number,


default:0


}



},


{


timestamps:true


}

);









/*
|--------------------------------------------------------------------------
| PASSWORD HASH
|--------------------------------------------------------------------------
*/


userSchema.pre(

"save",

async function(next){



if(!this.isModified("password")){


return next();


}





const salt =

await bcrypt.genSalt(12);





this.password =

await bcrypt.hash(

this.password,

salt

);




next();



}

);









/*
|--------------------------------------------------------------------------
| PASSWORD CHECK
|--------------------------------------------------------------------------
*/


userSchema.methods.matchPassword = async function(password){


return bcrypt.compare(

password,

this.password

);


};









/*
|--------------------------------------------------------------------------
| HELPERS
|--------------------------------------------------------------------------
*/


userSchema.methods.isAdmin = function(){


return this.role === "admin";


};






userSchema.methods.isCustomer = function(){


return this.role === "customer";


};








/*
|--------------------------------------------------------------------------
| MODEL EXPORT
|--------------------------------------------------------------------------
*/


const User =


mongoose.models.User ||


mongoose.model(

"User",

userSchema

);




export default User;