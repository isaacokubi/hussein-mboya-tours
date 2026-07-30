import dotenv from "dotenv";
import mongoose from "mongoose";

import User from "../models/User.js";
import Role from "../models/Role.js";


dotenv.config();



const migrateRoles = async()=>{


try{


await mongoose.connect(
process.env.MONGODB_URI
);



const users = await User.find({
role:null
});



for(const user of users){


const roleName = user.legacyRole || "customer";


const role = await Role.findOne({
name:roleName
});



if(role){


user.role = role._id;

await user.save();


console.log(
`Updated ${user.email} -> ${role.name}`
);


}


}



console.log(
"Role migration completed"
);



process.exit(0);



}catch(error){


console.error(
error
);


process.exit(1);


}


};



migrateRoles();