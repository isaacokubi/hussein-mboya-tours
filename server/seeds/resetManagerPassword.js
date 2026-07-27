import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";


dotenv.config();


const resetManagerPassword = async () => {

  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");


    const manager = await User.findOne({
      email: "manager@husseinmboyatours.com"
    });


    if (!manager) {

      console.log("Tour Manager not found");

      process.exit(1);

    }


    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */


    manager.password = "Manager@12345";


    /*
    |--------------------------------------------------------------------------
    | ROLE SETTINGS
    |--------------------------------------------------------------------------
    */


    manager.legacyRole = "tourmanager";


    manager.isActive = true;

    manager.isVerified = true;


    /*
    |--------------------------------------------------------------------------
    | RESET SECURITY
    |--------------------------------------------------------------------------
    */


    manager.loginAttempts = 0;

    manager.lockUntil = null;


    await manager.save();


    console.log(
      "Tour Manager password reset successfully"
    );


    console.log(
      "Email: manager@husseinmboyatours.com"
    );


    console.log(
      "Password: Manager@12345"
    );


    process.exit(0);


  } catch (error) {

    console.error(
      "Password reset failed:",
      error.message
    );

    process.exit(1);

  }

};


resetManagerPassword();