import mongoose from "mongoose";
import dotenv from "dotenv";
import User from "../models/User.js";


dotenv.config();


const resetBookingAgentPassword = async () => {

  try {

    await mongoose.connect(process.env.MONGODB_URI);

    console.log("MongoDB Connected");


    const agent = await User.findOne({
      email: "agent@husseinmboyatours.com"
    });


    if (!agent) {

      console.log("Booking Agent not found");

      process.exit(1);

    }


    /*
    |--------------------------------------------------------------------------
    | RESET PASSWORD
    |--------------------------------------------------------------------------
    */

    agent.password = "Agent@12345";


    /*
    |--------------------------------------------------------------------------
    | ROLE SETTINGS
    |--------------------------------------------------------------------------
    */


    agent.legacyRole = "bookingagent";


    agent.isActive = true;

    agent.isVerified = true;


    /*
    |--------------------------------------------------------------------------
    | RESET SECURITY
    |--------------------------------------------------------------------------
    */


    agent.loginAttempts = 0;

    agent.lockUntil = null;


    await agent.save();


    console.log(
      "Booking Agent password reset successfully"
    );


    console.log(
      "Email: agent@husseinmboyatours.com"
    );


    console.log(
      "Password: Agent@12345"
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


resetBookingAgentPassword();