import dotenv from "dotenv";
import mongoose from "mongoose";

import seedRoles from "./roleSeed.js";


dotenv.config();



const runSeeds = async()=>{

try{


if(!process.env.MONGODB_URI){

throw new Error(
"MONGODB_URI is missing in .env file"
);

}



console.log(
"Connecting to MongoDB..."
);



await mongoose.connect(
process.env.MONGODB_URI
);



console.log(
"MongoDB Connected Successfully"
);



await seedRoles();



console.log(
"Database seeding completed successfully"
);



await mongoose.connection.close();



process.exit(0);



}catch(error){


console.error(
"Seeder Failed:",
error.message
);



if(mongoose.connection.readyState !== 0){

await mongoose.connection.close();

}



process.exit(1);


}


};



runSeeds();