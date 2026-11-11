/**
 * Purpose: Vehicle database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare imageSchema for use by the surrounding module or function.
const imageSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  { _id: false },
);

// Declare maintenanceSchema for use by the surrounding module or function.
const maintenanceSchema = new mongoose.Schema(
  {
    serviceDate: { type: Date, required: true },
    description: { type: String, trim: true, default: "" },
    cost: { type: Number, default: 0, min: 0 },
    nextServiceDate: { type: Date, default: null },
  },
  { _id: false },
);

// Declare vehicleSchema for use by the surrounding module or function.
const vehicleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    registrationNumber: { type: String, required: true, uppercase: true, trim: true },
    registration: { type: String, trim: true, default: "" },
    model: { type: String, required: true, trim: true },
    manufacturer: { type: String, default: "", trim: true },
    year: { type: Number, min: 1990, max: new Date().getFullYear() + 1 },
    type: {
      type: String,
      enum: ["SUV", "VAN", "BUS", "LAND_CRUISER", "MINIBUS", "SEDAN", "PICKUP"],
      required: true,
    },
    capacity: { type: Number, required: true, min: 1 },
    driver: { type: mongoose.Schema.Types.ObjectId, ref: "Staff", default: null },
    assignedTour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", default: null },
    status: {
      type: String,
      enum: ["available", "assigned", "maintenance", "out_of_service"],
      default: "available",
    },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false, index: true },
    fuelType: { type: String, enum: ["Petrol", "Diesel", "Hybrid", "Electric"], default: "Diesel" },
    transmission: { type: String, enum: ["Manual", "Automatic"], default: "Manual" },
    mileage: { type: Number, default: 0, min: 0 },
    insuranceNumber: { type: String, default: "", trim: true },
    insuranceExpiry: { type: Date, default: null },
    lastServiceDate: { type: Date, default: null },
    nextServiceDate: { type: Date, default: null },
    maintenanceHistory: [maintenanceSchema],
    image: imageSchema,
    gallery: [imageSchema],
    description: { type: String, default: "", trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

// Perform the side effect or state update expressed on the following line.
vehicleSchema.index({ status: 1 });
// Perform the side effect or state update expressed on the following line.
vehicleSchema.index({ type: 1 });
// Perform the side effect or state update expressed on the following line.
vehicleSchema.index({ driver: 1 });
// Perform the side effect or state update expressed on the following line.
vehicleSchema.index({ assignedTour: 1 });
// Perform the side effect or state update expressed on the following line.
vehicleSchema.index({ isActive: 1 });
// Perform the side effect or state update expressed on the following line.
vehicleSchema.index({ nextServiceDate: 1 });

// Perform the side effect or state update expressed on the following line.
vehicleSchema.virtual("isAvailable").get(function () {
  // Return the expression shown below to the caller.
  return this.status === "available" && this.isActive;
});

// Perform the side effect or state update expressed on the following line.
vehicleSchema.methods.assignDriver = async function (driverId) {
  // Perform the side effect or state update expressed on the following line.
  this.driver = driverId;
  // Perform the side effect or state update expressed on the following line.
  this.status = "assigned";
  // Perform the side effect or state update expressed on the following line.
  await this.save();
  // Return the expression shown below to the caller.
  return this;
};

// Perform the side effect or state update expressed on the following line.
vehicleSchema.methods.releaseVehicle = async function () {
  // Perform the side effect or state update expressed on the following line.
  this.driver = null;
  // Perform the side effect or state update expressed on the following line.
  this.assignedTour = null;
  // Perform the side effect or state update expressed on the following line.
  this.status = "available";
  // Perform the side effect or state update expressed on the following line.
  await this.save();
  // Return the expression shown below to the caller.
  return this;
};

// Perform the side effect or state update expressed on the following line.
vehicleSchema.methods.scheduleMaintenance = async function (date) {
  // Perform the side effect or state update expressed on the following line.
  this.status = "maintenance";
  // Perform the side effect or state update expressed on the following line.
  this.nextServiceDate = date;
  // Perform the side effect or state update expressed on the following line.
  await this.save();
  // Return the expression shown below to the caller.
  return this;
};

// Perform the side effect or state update expressed on the following line.
vehicleSchema.plugin(tenantPlugin);

// Declare Vehicle for use by the surrounding module or function.
const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
