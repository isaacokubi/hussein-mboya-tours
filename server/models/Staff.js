// server/models/Staff.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const emergencyContactSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    name: { type: String, trim: true, default: "" },
    relationship: { type: String, trim: true, default: "" },
    phone: { type: String, trim: true, default: "" },
  },
  { _id: false }
);

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
    employeeNumber: { type: String, unique: true, sparse: true },
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

staffSchema.virtual("isDriver").get(function () {
  return this.position === "driver";
});

staffSchema.virtual("isGuide").get(function () {
  return this.position === "guide";
});

staffSchema.methods.assignTour = async function (tourId) {
  if (!this.assignedTours.includes(tourId)) this.assignedTours.push(tourId);
  this.availability = "busy";
  return this.save();
};

staffSchema.methods.releaseFromTour = async function (tourId) {
  this.assignedTours = this.assignedTours.filter((id) => id.toString() !== tourId.toString());
  if (this.assignedTours.length === 0) this.availability = "available";
  return this.save();
};

staffSchema.index({ position: 1 });
staffSchema.index({ status: 1 });
staffSchema.index({ availability: 1 });
staffSchema.index({ isDeleted: 1 });
staffSchema.index(
  { tenantId: 1, email: 1 },
  {
    unique: true,
    name: "tenant_email_unique",
    partialFilterExpression: { tenantId: { $type: "objectId" } },
  }
);

const tenantStaffSchema = staffSchema.plugin(tenantPlugin);
const Staff = mongoose.models.Staff || mongoose.model("Staff", tenantStaffSchema);

export default Staff;
