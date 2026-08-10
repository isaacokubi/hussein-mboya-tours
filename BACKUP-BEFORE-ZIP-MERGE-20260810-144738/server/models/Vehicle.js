// server/models/Vehicle.js

import mongoose from "mongoose";

/*
|--------------------------------------------------------------------------
| IMAGE SCHEMA
|--------------------------------------------------------------------------
*/

const imageSchema = new mongoose.Schema(
  {
    url: {
      type: String,
      default: "",
    },

    publicId: {
      type: String,
      default: "",
    },
  },
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| MAINTENANCE RECORD SCHEMA
|--------------------------------------------------------------------------
*/

const maintenanceSchema = new mongoose.Schema(
  {
    serviceDate: {
      type: Date,
      required: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    cost: {
      type: Number,
      default: 0,
      min: 0,
    },

    nextServiceDate: {
      type: Date,
      default: null,
    },
  },
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| VEHICLE SCHEMA
|--------------------------------------------------------------------------
*/

const vehicleSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    registrationNumber: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    // Legacy compatibility
    registration: {
      type: String,
      trim: true,
      default: "",
    },

    model: {
      type: String,
      required: true,
      trim: true,
    },

    manufacturer: {
      type: String,
      default: "",
      trim: true,
    },

    year: {
      type: Number,
      min: 1990,
      max: new Date().getFullYear() + 1,
    },

    /*
    |--------------------------------------------------------------------------
    | VEHICLE TYPE
    |--------------------------------------------------------------------------
    */

    type: {
      type: String,
      enum: [
        "SUV",
        "VAN",
        "BUS",
        "LAND_CRUISER",
        "MINIBUS",
        "SEDAN",
        "PICKUP",
      ],
      required: true,
    },

    capacity: {
      type: Number,
      required: true,
      min: 1,
    },

    /*
    |--------------------------------------------------------------------------
    | DRIVER ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Staff",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | TOUR ASSIGNMENT
    |--------------------------------------------------------------------------
    */

    assignedTour: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "available",
        "assigned",
        "maintenance",
        "out_of_service",
      ],
      default: "available",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    /*
    |--------------------------------------------------------------------------
    | VEHICLE DETAILS
    |--------------------------------------------------------------------------
    */

    fuelType: {
      type: String,
      enum: [
        "Petrol",
        "Diesel",
        "Hybrid",
        "Electric",
      ],
      default: "Diesel",
    },

    transmission: {
      type: String,
      enum: [
        "Manual",
        "Automatic",
      ],
      default: "Manual",
    },

    mileage: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | INSURANCE
    |--------------------------------------------------------------------------
    */

    insuranceNumber: {
      type: String,
      default: "",
      trim: true,
    },

    insuranceExpiry: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | MAINTENANCE
    |--------------------------------------------------------------------------
    */

    lastServiceDate: {
      type: Date,
      default: null,
    },

    nextServiceDate: {
      type: Date,
      default: null,
    },

    maintenanceHistory: [
      maintenanceSchema,
    ],

    /*
    |--------------------------------------------------------------------------
    | MEDIA
    |--------------------------------------------------------------------------
    */

    image: imageSchema,

    gallery: [
      imageSchema,
    ],

    /*
    |--------------------------------------------------------------------------
    | DESCRIPTION
    |--------------------------------------------------------------------------
    */

    description: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | OWNERSHIP
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/



vehicleSchema.index({
  status: 1,
});

vehicleSchema.index({
  type: 1,
});

vehicleSchema.index({
  driver: 1,
});

vehicleSchema.index({
  assignedTour: 1,
});

vehicleSchema.index({
  isActive: 1,
});

vehicleSchema.index({
  nextServiceDate: 1,
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

vehicleSchema.virtual("isAvailable").get(function () {
  return (
    this.status === "available" &&
    this.isActive
  );
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

vehicleSchema.methods.assignDriver = async function (driverId) {
  this.driver = driverId;
  this.status = "assigned";
  await this.save();
  return this;
};

vehicleSchema.methods.releaseVehicle = async function () {
  this.driver = null;
  this.assignedTour = null;
  this.status = "available";
  await this.save();
  return this;
};

vehicleSchema.methods.scheduleMaintenance = async function (date) {
  this.status = "maintenance";
  this.nextServiceDate = date;
  await this.save();
  return this;
};

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Vehicle =
  mongoose.models.Vehicle ||
  mongoose.model(
    "Vehicle",
    vehicleSchema,
  );

export default Vehicle;