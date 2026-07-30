import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";


dotenv.config();


const resetFinanceOfficerPassword = async () => {

  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");


    const financeOfficer = await User.findOne({
      email: "finance@husseinmboyatours.com"
    });


    if (!financeOfficer) {

      console.log("Finance Officer not found");

      process.exit(1);

    }


    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    financeOfficer.password = "Finance@12345";


    /*
    |--------------------------------------------------------------------------
    | ROLE SETTINGS
    |--------------------------------------------------------------------------
    */

    financeOfficer.legacyRole = "financeofficer";


    financeOfficer.isActive = true;

    financeOfficer.isVerified = true;


    /*
    |--------------------------------------------------------------------------
    | RESET LOGIN SECURITY
    |--------------------------------------------------------------------------
    */

    financeOfficer.loginAttempts = 0;

    financeOfficer.lockUntil = null;


    await financeOfficer.save();


    console.log(
      "Finance Officer password reset successfully"
    );


    console.log(
      "Email: finance@husseinmboyatours.com"
    );


    console.log(
      "Password: Finance@12345"
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


resetFinanceOfficerPassword();