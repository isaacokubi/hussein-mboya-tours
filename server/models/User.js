import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Email uniqueness is tenant-scoped. Global uniqueness caused one company
    // to block another company from using the same legitimate staff email.
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => /^\d{10}$/.test(String(value || "").trim()),
        message: "Phone number must contain exactly 10 digits.",
      },
    },
    password: { type: String, required: true, minlength: 8, select: false },
    role: {
      type: String,
      enum: ["customer", "admin", "super_admin", "superadmin", "administrator", "agent", "travel_agent", "tour_manager", "tourmanager", "manager", "tour_guide", "tourguide", "guide", "driver"],
      default: "customer",
    },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    permissionsOverride: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
    legacyRole: { type: String, default: "customer" },
    profileImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    status: { type: String, enum: ["active", "inactive", "disabled", "suspended", "blocked"], default: "active" },
    isVerified: { type: Boolean, default: false },
    loyaltyPoints: { type: Number, default: 0 },
    referralCode: { type: String, unique: true, sparse: true },
    loginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    passwordResetCodeHash: { type: String, default: "", select: false },
    passwordResetExpiresAt: { type: Date, default: null, select: false },
    passwordResetAttempts: { type: Number, default: 0, select: false },
    loginPinHash: { type: String, default: "", select: false },
    loginPinExpiresAt: { type: Date, default: null, select: false },
    loginPinAttempts: { type: Number, default: 0, select: false },
    loginPinLastSentAt: { type: Date, default: null, select: false },
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

userSchema.index({ tenantId: 1, role: 1 });
userSchema.index(
  { tenantId: 1, email: 1 },
  {
    unique: true,
    name: "tenant_email_unique",
    partialFilterExpression: { tenantId: { $type: "objectId" } },
  }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return bcrypt.compare(enteredPassword, this.password);
};

userSchema.virtual("isActive").get(function () {
  return this.status === "active";
});

userSchema.virtual("isLocked").get(function () {
  return this.lockUntil && this.lockUntil > Date.now();
});

const tenantUserSchema = userSchema.plugin(tenantPlugin);
const User = mongoose.models.User || mongoose.model("User", tenantUserSchema);

export default User;
