import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";


dotenv.config();


const resetTourGuidePassword = async () => {

  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");


    const tourGuide = await User.findOne({
      email: "guide@husseinmboyatours.com"
    });


    if (!tourGuide) {

      console.log("Tour Guide not found");

      process.exit(1);

    }


    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    tourGuide.password = "Guide@12345";


    /*
    |--------------------------------------------------------------------------
    | ROLE SETTINGS
    |--------------------------------------------------------------------------
    */

    tourGuide.legacyRole = "tourguide";

    tourGuide.isActive = true;

    tourGuide.isVerified = true;


    /*
    |--------------------------------------------------------------------------
    | RESET LOGIN SECURITY
    |--------------------------------------------------------------------------
    */

    tourGuide.loginAttempts = 0;

    tourGuide.lockUntil = null;


    await tourGuide.save();


    console.log(
      "Tour Guide password reset successfully"
    );


    console.log(
      "Email: guide@husseinmboyatours.com"
    );


    console.log(
      "Password: Guide@12345"
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


resetTourGuidePassword();