import mongoose from "mongoose";
import dotenv from "dotenv";

import Role from "./models/Role.js";
import Permission from "./models/Permission.js";
import User from "./models/User.js";

dotenv.config({ path: "./.env" });

const permissions = [
"admin.dashboard",
"user.manage",
"staff.manage",
"tour.manage",
"booking.manage",
"payment.manage",
"refund.manage",
"analytics.view",
"finance.view",
"settings.manage",
"roles.manage",
"notifications.view",
"system.audit",
"customer.view",
"manage_customers",
"manage_destinations",
"commission.view",
"review.manage",
"report.view",
"guide.view",
"vehicle.view"
];


async function repair(){

await mongoose.connect(process.env.MONGODB_URI);

console.log("Connected");


/*
 CREATE MISSING PERMISSIONS
*/

let permissionDocs=[];

for(const name of permissions){

let p=await Permission.findOne({name});

if(!p){

p=await Permission.create({
name,
displayName:name.replaceAll("_"," "),
description:"System permission",
isActive:true
});

console.log("Created permission:",name);

}

permissionDocs.push(p._id);

}


/*
 UPDATE ADMIN ROLES
*/

const adminRoles = await Role.find({
name:{
$in:[
"admin",
"administrator",
"super_admin",
"superadmin"
]
}
});


for(const role of adminRoles){

role.permissions = permissionDocs;
role.level = 100;
role.status="active";

await role.save();

console.log(
"Updated role:",
role.name
);

}


/*
 UPDATE USERS WITH ADMIN ROLE
*/

const users = await User.find({
role:{
$in:[
"admin",
"administrator",
"super_admin"
]
}
});


for(const user of users){

const role = await Role.findOne({
name:{
$in:[
"admin",
"super_admin",
"superadmin"
]
}
});


if(role){

user.roleId=role._id;

await user.save();

console.log(
"Updated user:",
user.email
);

}

}


console.log("RBAC REPAIR COMPLETE");

process.exit(0);

}


repair().catch(err=>{

console.error(err);

process.exit(1);

});
