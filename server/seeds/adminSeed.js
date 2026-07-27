import mongoose from "mongoose";
import dotenv from "dotenv";

import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";


dotenv.config();


const createAdmin = async()=>{

try{


await mongoose.connect(
process.env.MONGODB_URI
);


console.log("MongoDB Connected");



const permissionNames = [

"manage_users",

"manage_tours",

"manage_destinations",

"manage_bookings",

"manage_payments",

"view_reports"

];



const permissionIds = [];



for(const name of permissionNames){


let permission =
await Permission.findOne({
name
});



if(!permission){

permission =
await Permission.create({

name

});

}



permissionIds.push(permission._id);


}




let adminRole =
await Role.findOne({
name:"admin"
});



if(!adminRole){


adminRole =
await Role.create({

name:"admin",

permissions:permissionIds

});


console.log("Admin role created");


}else{


adminRole.permissions =
permissionIds;


await adminRole.save();


console.log("Admin role updated");


}




const existingAdmin =
await User.findOne({

email:"admin@husseinmboyatours.com"

});



if(existingAdmin){

console.log("Admin already exists");

process.exit();

}




const admin =
await User.create({

name:"Hussein Mboya Admin",

email:"admin@husseinmboyatours.com",

password:"Admin@12345",

role:adminRole._id,

legacyRole:"admin",

isActive:true,

isVerified:true

});



console.log("--------------------------------");

console.log("ADMIN CREATED");

console.log("Email:",
admin.email);

console.log("Password:",
"Admin@12345");

console.log("--------------------------------");


process.exit();



}catch(error){

console.log(
"Admin seed failed:",
error.message
);

process.exit(1);

}


};


createAdmin();