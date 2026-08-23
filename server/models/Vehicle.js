import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const imageSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    url: { type: String, default: "" },
    publicId: { type: String, default: "" },
  },
  { _id: false },
);

const maintenanceSchema = new mongoose.Schema(
  {
    serviceDate: { type: Date, required: true },
    description: { type: String, trim: true, default: "" },
    cost: { type: Number, default: 0, min: 0 },
    nextServiceDate: { type: Date, default: null },
  },
  { _id: false },
);

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

vehicleSchema.index({ status: 1 });
vehicleSchema.index({ type: 1 });
vehicleSchema.index({ driver: 1 });
vehicleSchema.index({ assignedTour: 1 });
vehicleSchema.index({ isActive: 1 });
vehicleSchema.index({ nextServiceDate: 1 });

vehicleSchema.virtual("isAvailable").get(function () {
  return this.status === "available" && this.isActive;
});

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

vehicleSchema.plugin(tenantPlugin);

const Vehicle = mongoose.models.Vehicle || mongoose.model("Vehicle", vehicleSchema);

export default Vehicle;
