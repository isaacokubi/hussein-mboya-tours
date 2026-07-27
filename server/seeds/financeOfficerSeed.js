import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";


dotenv.config();


const createFinanceOfficer = async () => {

try {


await mongoose.connect(process.env.MONGODB_URI);

console.log("MongoDB Connected");



// ----------------------------------
// FINANCE PERMISSIONS
// ----------------------------------

const permissionNames = [

"manage_payments",
"view_transactions",
"manage_commissions",
"process_refunds",
"view_finance_reports"

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
// CREATE FINANCE ROLE
// ----------------------------------

let financeRole = await Role.findOne({
    name:"finance"
});



if(!financeRole){


financeRole = await Role.create({

name:"finance",

permissions:permissionIds

});


console.log(
"Finance role created"
);


}
else{


financeRole.permissions = permissionIds;

await financeRole.save();


console.log(
"Finance role updated"
);


}




// ----------------------------------
// CREATE FINANCE OFFICER USER
// ----------------------------------

const email = "finance@husseinmboyatours.com";



const existingOfficer = await User.findOne({
    email
});


if(existingOfficer){

console.log(
"Finance Officer already exists"
);

process.exit();

}



const hashedPassword = await bcrypt.hash(
"Finance@12345",
12
);




const officer = await User.create({

name:"Finance Officer",

email,

password:hashedPassword,

phone:"",


role:financeRole._id,


// keep legacy compatibility
legacyRole:"finance",


isActive:true


});




console.log("FINANCE OFFICER CREATED");


console.log({

name:officer.name,

email:officer.email,

password:"Finance@12345",

role:"finance",

legacyRole:"finance"

});



process.exit();


}


catch(error){


console.log(
"FINANCE OFFICER SEED ERROR:",
error.message
);


process.exit(1);


}


};



createFinanceOfficer();