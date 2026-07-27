import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";


dotenv.config();


const resetCustomerPassword = async () => {

  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");


    const customer = await User.findOne({
      email: "customer@husseinmboyatours.com"
    });


    if (!customer) {

      console.log("Customer not found");

      process.exit(1);

    }


    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    customer.password = "Customer@12345";


    /*
    |--------------------------------------------------------------------------
    | CUSTOMER SETTINGS
    |--------------------------------------------------------------------------
    */

    customer.legacyRole = "customer";

    customer.isActive = true;

    customer.isVerified = true;


    /*
    |--------------------------------------------------------------------------
    | RESET LOGIN SECURITY
    |--------------------------------------------------------------------------
    */

    customer.loginAttempts = 0;

    customer.lockUntil = null;


    await customer.save();


    console.log(
      "Customer password reset successfully"
    );


    console.log(
      "Email:",
      customer.email
    );


    console.log(
      "Password: Customer@12345"
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


resetCustomerPassword();