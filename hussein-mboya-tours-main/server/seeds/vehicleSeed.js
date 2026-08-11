import mongoose from "mongoose";
import dotenv from "dotenv";

import Vehicle from "../models/Vehicle.js";

dotenv.config();


const vehicles = [

    {
        name: "Safari Land Cruiser 1",
        model: "Toyota Land Cruiser Prado",
        registrationNumber: "KDA001A",
        type: "LAND_CRUISER",
        capacity: 7,
        status: "available"
    },


    {
        name: "Safari Land Cruiser 2",
        model: "Toyota Land Cruiser V8",
        registrationNumber: "KDB002B",
        type: "LAND_CRUISER",
        capacity: 8,
        status: "available"
    },


    {
        name: "Tour Van",
        model: "Toyota Hiace",
        registrationNumber: "KDC003C",
        type: "VAN",
        capacity: 14,
        status: "available"
    }

];


const seedVehicles = async()=>{

    try{

        await mongoose.connect(
            process.env.MONGODB_URI
        );


        await Vehicle.deleteMany();


        await Vehicle.insertMany(
            vehicles
        );


        console.log(
            "✅ Vehicles seeded successfully"
        );


        process.exit();


    }catch(error){

        console.error(
            error.message
        );

        process.exit(1);

    }

};


seedVehicles();
