import mongoose from "mongoose";
import dotenv from "dotenv";

import User from "../models/User.js";

dotenv.config();

const guides = [
    {
        name: "John Safari Guide",
        email: "john.guide@husseinmboyatours.com",
        password: "password123",
        role: "tour_guide",
        phone: "+254700111222",
        isActive: true
    },
    {
        name: "Mary Wildlife Expert",
        email: "mary.guide@husseinmboyatours.com",
        password: "password123",
        role: "tour_guide",
        phone: "+254700333444",
        isActive: true
    },
    {
        name: "David Mountain Guide",
        email: "david.guide@husseinmboyatours.com",
        password: "password123",
        role: "tour_guide",
        phone: "+254700555666",
        isActive: true
    }
];


const seedGuides = async()=>{

    try{

        await mongoose.connect(
            process.env.MONGODB_URI
        );


        await User.deleteMany({
            role:"tour_guide"
        });


        await User.insertMany(
            guides
        );


        console.log(
            "✅ Tour guides seeded"
        );


        process.exit();


    }catch(error){

        console.error(error);
        process.exit(1);

    }

};


seedGuides();