import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

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

  // Never hash an already-hashed password. This protects registration,
  // password-reset and administrative password updates from accidental
  // double hashing while keeping plaintext passwords out of MongoDB.
  if (BCRYPT_HASH_PATTERN.test(String(this.password || ""))) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(String(this.password), salt);
  next();
});

userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  }
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  const candidate = String(enteredPassword ?? "");
  const storedHash = String(this.password || "");
  if (!candidate || !storedHash) return false;

  if (BCRYPT_HASH_PATTERN.test(storedHash)) {
    return bcrypt.compare(candidate, storedHash);
  }

  // One-time compatibility path for legacy accounts whose password was stored
  // before bcrypt hashing was enforced. A successful legacy login immediately
  // rehashes the password through the save hook, so plaintext is not retained.
  if (storedHash === candidate) {
    this.password = candidate;
    await this.save({ validateBeforeSave: false });
    return true;
  }

  return false;
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
