import dotenv from "dotenv";

import connectDatabase from "../config/database.js";

import User from "../models/User.js";
import Role from "../models/Role.js";


dotenv.config();



const seedUsers = async () => {


  try {


    await connectDatabase();


    console.log("Database connected");




    /*
    |--------------------------------------------------------------------------
    | FIND ROLES
    |--------------------------------------------------------------------------
    */


    const adminRole = await Role.findOne({

      name:"admin"

    });



    const managerRole = await Role.findOne({

      name:"tour_manager"

    });





    if(!adminRole){

      throw new Error(
        "Admin role not found"
      );

    }





    if(!managerRole){

      throw new Error(
        "Tour Manager role not found"
      );

    }







    /*
    |--------------------------------------------------------------------------
    | REMOVE EXISTING USERS
    |--------------------------------------------------------------------------
    */


    await User.deleteMany({

      email:{

        $in:[

          "admin@demo.com",

          "manager@demo.com"

        ]

      }

    });







    /*
    |--------------------------------------------------------------------------
    | CREATE ADMIN
    |--------------------------------------------------------------------------
    */


    const admin = await User.create({

      name:"Hussein Admin",

      email:"admin@demo.com",

      phone:"0712345678",

      password:"Admin@12345",


      // MUST MATCH USER ENUM
      role:"admin",


      // RBAC ROLE REFERENCE
      roleId:adminRole._id,


      status:"active",

      isVerified:true


    });









    /*
    |--------------------------------------------------------------------------
    | CREATE TOUR MANAGER
    |--------------------------------------------------------------------------
    */


    const manager = await User.create({

      name:"Hussein Tour Manager",

      email:"manager@demo.com",

      phone:"0712345679",

      password:"Manager@12345",


      // MUST MATCH USER ENUM
      role:"tour_manager",


      // RBAC ROLE REFERENCE
      roleId:managerRole._id,


      status:"active",

      isVerified:true


    });









    console.log("================================");


    console.log("ADMIN CREATED");


    console.log({

      email:admin.email,

      password:"Admin@12345",

      role:admin.role

    });





    console.log("--------------------------------");





    console.log("TOUR MANAGER CREATED");



    console.log({

      email:manager.email,

      password:"Manager@12345",

      role:manager.role

    });





    console.log("================================");





    process.exit(0);



  }


  catch(error){


    console.error(

      "USER SEED ERROR:",

      error.message

    );


    process.exit(1);


  }


};





seedUsers();