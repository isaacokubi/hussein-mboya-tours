/**
 * Purpose: Staff database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Staff.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare emergencyContactSchema for use by the surrounding module or function.
const emergencyContactSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    name: { type: String, trim: true, default: "" },
    relationship: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

// Declare staffSchema for use by the surrounding module or function.
const staffSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null, index: true },
    name: { type: String, required: true, trim: true },
    // Staff emails are unique within a tenant, not globally.
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true, trim: true },
    nationalId: { type: String, default: "", trim: true },
    gender: { type: String, enum: ["male", "female", "other"], default: null },
    dateOfBirth: { type: Date, default: null },
    address: { type: String, default: "", trim: true },
    position: { type: String, enum: ["admin", "tour_manager", "guide", "driver", "support"], required: true },
    role: { type: String, enum: ["admin", "manager", "guide", "driver", "support"], default: null },
    department: { type: String, default: "", trim: true },
    profileImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    licenseNumber: { type: String, default: "", trim: true },
    licenseExpiry: { type: Date, default: null },
    languages: [{ type: String, trim: true }],
    certifications: [{ type: String, trim: true }],
    experience: { type: Number, default: 0, min: 0 },
    employeeNumber: { type: String, trim: true, default: undefined },
    employmentType: { type: String, enum: ["full_time", "part_time", "contract", "temporary"], default: "full_time" },
    joinedAt: { type: Date, default: Date.now },
    salary: { type: Number, default: 0, min: 0 },
    availability: { type: String, enum: ["available", "busy", "leave", "offline"], default: "available" },
    assignedTours: [{ type: mongoose.Schema.Types.ObjectId, ref: "Tour" }],
    completedTours: { type: Number, default: 0, min: 0 },
    averageRating: { type: Number, default: 0, min: 0, max: 5 },
    emergencyContact: emergencyContactSchema,
    status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    notes: { type: String, default: "", trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Perform the side effect or state update expressed on the following line.
staffSchema.virtual("isDriver").get(function () {
  // Return the expression shown below to the caller.
  return this.position === "driver";
});

// Perform the side effect or state update expressed on the following line.
staffSchema.virtual("isGuide").get(function () {
  // Return the expression shown below to the caller.
  return this.position === "guide";
});

// Perform the side effect or state update expressed on the following line.
staffSchema.methods.assignTour = async function (tourId) {
  // Check the condition (!this.assignedTours.includes(tourId)) and run the matching branch.
  if (!this.assignedTours.includes(tourId)) this.assignedTours.push(tourId);
  // Perform the side effect or state update expressed on the following line.
  this.availability = "busy";
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
staffSchema.methods.releaseFromTour = async function (tourId) {
  // Perform the side effect or state update expressed on the following line.
  this.assignedTours = this.assignedTours.filter((id) => id.toString() !== tourId.toString());
  // Check the condition (this.assignedTours.length === 0) and run the matching branch.
  if (this.assignedTours.length === 0) this.availability = "available";
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
staffSchema.pre("validate", function (next) {
  // Check the condition (this.employeeNumber === null || this.employeeNumber === "") and run the matching branch.
  if (this.employeeNumber === null || this.employeeNumber === "") {
    // Perform the side effect or state update expressed on the following line.
    this.employeeNumber = undefined;
  }
  // Perform the side effect or state update expressed on the following line.
  next();
});

// Perform the side effect or state update expressed on the following line.
staffSchema.index({ position: 1 });
// Perform the side effect or state update expressed on the following line.
staffSchema.index({ status: 1 });
// Perform the side effect or state update expressed on the following line.
staffSchema.index({ availability: 1 });
// Perform the side effect or state update expressed on the following line.
staffSchema.index({ isDeleted: 1 });
// Perform the side effect or state update expressed on the following line.
staffSchema.index(
  { tenantId: 1, email: 1 },
  {
    unique: true,
    name: "tenant_email_unique",
    partialFilterExpression: { tenantId: { $type: "objectId" } },
  }
);

// Declare tenantStaffSchema for use by the surrounding module or function.
const tenantStaffSchema = staffSchema.plugin(tenantPlugin);
// Declare Staff for use by the surrounding module or function.
const Staff = mongoose.models.Staff || mongoose.model("Staff", tenantStaffSchema);

export default Staff;
