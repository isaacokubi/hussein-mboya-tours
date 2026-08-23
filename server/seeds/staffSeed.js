import mongoose from "mongoose";
import dotenv from "dotenv";

import Staff from "../models/Staff.js";

dotenv.config();


const staffMembers = [
  {
    name: "System Admin",
    email: "hussein.mboya@coherenttours.com",
    phone: "+254733439362",
    position: "tour_manager",
    role: "manager",
    status: "active",
    availability: "available",
    employeeNumber: "EMP001"
  },

  {
    name: "Isaac Ogubi",
    email: "isaac.ogubi@coherenttours.com",
    phone: "+254700000001",
    position: "guide",
    role: "guide",
    status: "active",
    availability: "available",
    employeeNumber: "EMP002"
  },

  {
    name: "Amina Ali",
    email: "amina.ali@coherenttours.com",
    phone: "+254700000002",
    position: "support",
    role: "support",
    status: "active",
    availability: "available",
    employeeNumber: "EMP003"
  },

  {
    name: "Daniel Kiptoo",
    email: "daniel.kiptoo@coherenttours.com",
    phone: "+254700000003",
    position: "admin",
    role: "admin",
    status: "active",
    availability: "available",
    employeeNumber: "EMP004"
  },

  {
    name: "Joseph Kamau",
    email: "joseph.kamau@coherenttours.com",
    phone: "+254700000004",
    position: "driver",
    role: "driver",
    status: "active",
    availability: "available",
    employeeNumber: "EMP005"
  }
];


const seedStaff = async () => {

  try {

    await mongoose.connect(process.env.MONGODB_URI);

    // debug removed


    await Staff.deleteMany();

    // debug removed


    const staff = await Staff.insertMany(staffMembers);


    console.log(
      `${staff.length} staff members created successfully`
    );


    await mongoose.connection.close();

    process.exit(0);


  } catch (error) {

    console.error("Staff seed failed:", error);

    process.exit(1);

  }

};


seedStaff();
