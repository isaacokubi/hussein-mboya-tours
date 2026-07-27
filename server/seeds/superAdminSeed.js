import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";


dotenv.config();


const createSuperAdmin = async()=>{

try{


await mongoose.connect(process.env.MONGODB_URI);

console.log("MongoDB Connected");


// ----------------------------------
// CREATE PERMISSIONS
// ----------------------------------


const permissionNames = [

"manage_users",
"manage_roles",
"manage_destinations",
"manage_tours",
"manage_bookings",
"view_reports"

];


const permissionIds = [];


for(const name of permissionNames){


let permission = await Permission.findOne({
    name
});


if(!permission){

permission = await Permission.create({
    name
});

console.log(
"Created permission:",
name
);

}


permissionIds.push(permission._id);


}



// ----------------------------------
// CREATE ROLE
// ----------------------------------

let superAdminRole = await Role.findOne({
    name:"superadmin"
});


if(!superAdminRole){


superAdminRole = await Role.create({

name:"superadmin",

permissions:permissionIds

});


console.log(
"Superadmin role created"
);


}
else{


superAdminRole.permissions = permissionIds;

await superAdminRole.save();


console.log(
"Superadmin role updated"
);


}



// ----------------------------------
// CREATE USER
// ----------------------------------

const email="admin@husseinmboyatours.com";


const existingAdmin = await User.findOne({
email
});


if(existingAdmin){

console.log(
"Super admin already exists"
);

process.exit();

}



const password = await bcrypt.hash(
"Admin@12345",
12
);



const admin = await User.create({

name:"Hussein Mboya",

email,

password,

role:superAdminRole._id,

phone:"",

isActive:true

});


console.log("SUPER ADMIN CREATED");

console.log({

name:admin.name,

email:admin.email,

role:"superadmin"

});


process.exit();


}

catch(error){

console.log(
"ADMIN SEED ERROR:",
error.message
);

process.exit(1);

}


};


createSuperAdmin();