/**
 * Purpose: vehicle Seed database seed module. Main declarations: seedVehicles.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load dotenv so this module can use its exported dependencies.
import dotenv from "dotenv";

// Load ../models/Vehicle.js so this module can use its exported dependencies.
import Vehicle from "../models/Vehicle.js";

// Perform the side effect or state update expressed on the following line.
dotenv.config();


// Declare vehicles for use by the surrounding module or function.
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


// Declare seedVehicles for use by the surrounding module or function.
const seedVehicles = async()=>{

    // Run this operation with a dedicated error-handling path for failures.
    try{

        // Perform the side effect or state update expressed on the following line.
        await mongoose.connect(
            process.env.MONGODB_URI
        );


        // Perform the side effect or state update expressed on the following line.
        await Vehicle.deleteMany();


        // Perform the side effect or state update expressed on the following line.
        await Vehicle.insertMany(
            vehicles
        );


        // Perform the side effect or state update expressed on the following line.
        console.log(
            "✅ Vehicles seeded successfully"
        );


        // Perform the side effect or state update expressed on the following line.
        process.exit();


    }catch(error){

        // Perform the side effect or state update expressed on the following line.
        console.error(
            error.message
        );

        // Perform the side effect or state update expressed on the following line.
        process.exit(1);

    }

};


// Perform the side effect or state update expressed on the following line.
seedVehicles();
