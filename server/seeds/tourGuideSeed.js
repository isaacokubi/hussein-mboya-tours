import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";


dotenv.config();


const createTourGuide = async () => {

try {


await mongoose.connect(process.env.MONGODB_URI);

console.log("MongoDB Connected");



// ----------------------------------
// GUIDE PERMISSIONS
// ----------------------------------

const permissionNames = [

"view_assigned_tours",
"manage_assigned_itineraries",
"update_tour_status",
"view_customer_details",
"upload_tour_notes"

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
// CREATE GUIDE ROLE
// ----------------------------------

let guideRole = await Role.findOne({
    name:"guide"
});



if(!guideRole){


guideRole = await Role.create({

name:"guide",

permissions:permissionIds

});


console.log(
"Guide role created"
);


}
else{


guideRole.permissions = permissionIds;

await guideRole.save();


console.log(
"Guide role updated"
);


}




// ----------------------------------
// CREATE TOUR GUIDE USER
// ----------------------------------

const email = "guide@husseinmboyatours.com";



const existingGuide = await User.findOne({
    email
});


if(existingGuide){

console.log(
"Tour Guide already exists"
);

process.exit();

}



const hashedPassword = await bcrypt.hash(
"Guide@12345",
12
);




const guide = await User.create({

name:"Safari Guide",

email,

password:hashedPassword,

phone:"",


role:guideRole._id,


// Legacy compatibility
legacyRole:"guide",


isActive:true


});




console.log("TOUR GUIDE CREATED");


console.log({

name:guide.name,

email:guide.email,

password:"Guide@12345",

role:"guide",

legacyRole:"guide"

});



process.exit();


}


catch(error){


console.log(
"TOUR GUIDE SEED ERROR:",
error.message
);


process.exit(1);


}


};



createTourGuide();