import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";

import User from "../models/User.js";
import Agent from "../models/Agent.js";

import crypto from "crypto";
dotenv.config({
  path: "./server/.env"
});


const seedAgents = async () => {

  try {

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed


    const emails = [
      "john.kamau@coherenttours.com",
      "mary.wanjiku@coherenttours.com",
      "david.otieno@coherenttours.com"
    ];


    await Agent.deleteMany({
      email:{
        $in:emails
      }
    });


    await User.deleteMany({
      email:{
        $in:emails
      }
    });


    const password = await bcrypt.hash(
      process.env.SEED_AGENT_PASSWORD || crypto.randomBytes(18).toString("base64url"),
      12
    );


    const agents = [
      {
        name:"John Kamau",
        email:"john.kamau@coherenttours.com",
        phone:"+254711111111",
        companyName:"Safari Adventures Kenya",
        location:"Nairobi"
      },

      {
        name:"Mary Wanjiku",
        email:"mary.wanjiku@coherenttours.com",
        phone:"+254722222222",
        companyName:"Africa Luxury Travels",
        location:"Mombasa"
      },

      {
        name:"David Otieno",
        email:"david.otieno@coherenttours.com",
        phone:"+254733333333",
        companyName:"East Africa Safaris",
        location:"Kisumu"
      }
    ];



    for(const data of agents){


      const user = await User.create({

        name:data.name,

        email:data.email,

        phone:data.phone,

        password,

        role:"agent",

        legacyRole:"agent",

        status:"active"

      });



      const agent = await Agent.create({

        user:user._id,

        companyName:data.companyName,

        phone:data.phone,

        email:data.email,

        location:data.location,

        commissionRate:10,

        totalCommission:0,

        pendingCommission:0,

        paidCommission:0,

        walletBalance:0,

        totalSales:0,

        totalBookings:0,

        successfulBookings:0,

        cancelledBookings:0,

        isApproved:true,

        status:"active"

      });



      console.log(
        `✓ Created agent ${agent.email}`
      );

    }


    // debug removed

    process.exit(0);


  } catch(error){

    console.error(error);

    process.exit(1);

  }

};


seedAgents();