import dotenv from "dotenv";
import mongoose from "mongoose";

import Permission from "../models/Permission.js";



dotenv.config();



const MONGODB_URI = process.env.MONGODB_URI;



const tourGuidePermissions = [

  {
    name: "view_assigned_tours",
    description: "Allow guide to view assigned tours",
  },


  {
    name: "view_tour_guests",
    description: "Allow guide to view guests in assigned tours",
  },


  {
    name: "update_tour_status",
    description: "Allow guide to update tour progress/status",
  },


  {
    name: "submit_tour_report",
    description: "Allow guide to submit tour reports",
  },

];





const seedTourGuidePermissions = async()=>{


try{


await mongoose.connect(
MONGODB_URI
);



console.log(
"MongoDB Connected"
);





for(const permission of tourGuidePermissions){


await Permission.findOneAndUpdate(

{
name:permission.name
},


permission,


{
upsert:true,
new:true
}


);


console.log(
`Seeded permission: ${permission.name}`
);


}






console.log(
"Tour Guide Permissions Seeded Successfully"
);



await mongoose.connection.close();


process.exit(0);



}

catch(error){


console.log(
"Seeder Error:",
error.message
);


process.exit(1);


}



};






seedTourGuidePermissions();