import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";


dotenv.config();


const createCustomer = async () => {

try {


await mongoose.connect(process.env.MONGODB_URI);

console.log("MongoDB Connected");



// ----------------------------------
// CUSTOMER PERMISSIONS
// ----------------------------------

const permissionNames = [

"view_tours",
"view_destinations",
"create_bookings",
"manage_own_bookings",
"submit_reviews"

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
// CREATE CUSTOMER ROLE
// ----------------------------------

let customerRole = await Role.findOne({
    name:"customer"
});



if(!customerRole){


customerRole = await Role.create({

name:"customer",

permissions:permissionIds

});


console.log(
"Customer role created"
);


}
else{


customerRole.permissions = permissionIds;

await customerRole.save();


console.log(
"Customer role updated"
);


}




// ----------------------------------
// CREATE CUSTOMER USER
// ----------------------------------

const email = "customer@husseinmboyatours.com";



const existingCustomer = await User.findOne({
    email
});


if(existingCustomer){

console.log(
"Customer already exists"
);

process.exit();

}



const hashedPassword = await bcrypt.hash(
"Customer@12345",
12
);




const customer = await User.create({

name:"John Customer",

email,

password:hashedPassword,

phone:"",


// RBAC role reference
role:customerRole._id,


// Legacy compatibility
legacyRole:"customer",


isActive:true


});




console.log("CUSTOMER CREATED");


console.log({

name:customer.name,

email:customer.email,

password:"Customer@12345",

role:"customer",

legacyRole:customer.legacyRole

});


process.exit();


}


catch(error){


console.log(
"CUSTOMER SEED ERROR:",
error.message
);


process.exit(1);


}


};



createCustomer();