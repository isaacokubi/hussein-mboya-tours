import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";


dotenv.config();


const createTourManager = async () => {

try {


await mongoose.connect(process.env.MONGODB_URI);

console.log("MongoDB Connected");


// ----------------------------------
// TOUR MANAGER PERMISSIONS
// ----------------------------------

const permissionNames = [

"manage_tours",
"manage_itineraries",
"manage_destinations",
"manage_bookings",
"view_bookings"

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
// CREATE TOUR MANAGER ROLE
// ----------------------------------

let tourManagerRole = await Role.findOne({
    name:"tourmanager"
});


if(!tourManagerRole){


tourManagerRole = await Role.create({

name:"tourmanager",

permissions:permissionIds

});


console.log(
"Tour Manager role created"
);


}
else{


tourManagerRole.permissions = permissionIds;

await tourManagerRole.save();


console.log(
"Tour Manager role updated"
);


}



// ----------------------------------
// CREATE USER
// ----------------------------------

const email = "manager@husseinmboyatours.com";


const existingUser = await User.findOne({
    email
});


if(existingUser){

console.log(
"Tour Manager already exists"
);

process.exit();

}



const hashedPassword = await bcrypt.hash(
"Manager@12345",
12
);



const manager = await User.create({

name:"Tour Manager",

email,

password:hashedPassword,

phone:"",

role:tourManagerRole._id,

isActive:true

});



console.log("TOUR MANAGER CREATED");

console.log({

name:manager.name,

email:manager.email,

password:"Manager@12345",

role:"tourmanager"

});


process.exit();


}

catch(error){

console.log(
"TOUR MANAGER SEED ERROR:",
error.message
);

process.exit(1);

}


};


createTourManager();