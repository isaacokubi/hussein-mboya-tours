import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Role from "../models/Role.js";
import Permission from "../models/Permission.js";


dotenv.config();


const createBookingAgent = async () => {

try {


await mongoose.connect(process.env.MONGODB_URI);

console.log("MongoDB Connected");


// ----------------------------------
// BOOKING AGENT PERMISSIONS
// ----------------------------------

const permissionNames = [

"create_bookings",
"manage_customer_bookings",
"view_tours",
"view_destinations",
"view_commissions",
"view_wallet"

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
// CREATE BOOKING AGENT ROLE
// ----------------------------------

let bookingAgentRole = await Role.findOne({
    name:"bookingagent"
});


if(!bookingAgentRole){


bookingAgentRole = await Role.create({

name:"bookingagent",

permissions:permissionIds

});


console.log(
"Booking Agent role created"
);


}
else{


bookingAgentRole.permissions = permissionIds;

await bookingAgentRole.save();


console.log(
"Booking Agent role updated"
);


}



// ----------------------------------
// CREATE BOOKING AGENT USER
// ----------------------------------

const email = "agent@husseinmboyatours.com";


const existingAgent = await User.findOne({
    email
});


if(existingAgent){

console.log(
"Booking Agent already exists"
);

process.exit();

}



const hashedPassword = await bcrypt.hash(
"Agent@12345",
12
);




const agent = await User.create({

name:"Booking Agent",

email,

password:hashedPassword,

phone:"",

role:bookingAgentRole._id,


agentProfile:{

commissionRate:10,

walletBalance:0

},


isActive:true


});



console.log("BOOKING AGENT CREATED");


console.log({

name:agent.name,

email:agent.email,

password:"Agent@12345",

commissionRate:agent.agentProfile.commissionRate,

walletBalance:agent.agentProfile.walletBalance,

role:"bookingagent"

});


process.exit();


}


catch(error){

console.log(
"BOOKING AGENT SEED ERROR:",
error.message
);

process.exit(1);

}


};


createBookingAgent();