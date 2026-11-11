/**
 * Purpose: User database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load bcryptjs so this module can use its exported dependencies.
import bcrypt from "bcryptjs";
// Load crypto so this module can use its exported dependencies.
import crypto from "crypto";

// Declare BCRYPT_HASH_PATTERN for use by the surrounding module or function.
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

// Declare userSchema for use by the surrounding module or function.
const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    // Email uniqueness is tenant-scoped. Global uniqueness caused one company
    // to block another company from using the same legitimate staff email.
    email: { type: String, required: true, lowercase: true, trim: true },
    // Pending email changes are verified by a one-time code before the
    // canonical login/recovery email is replaced.
    pendingEmail: { type: String, default: "", lowercase: true, trim: true, select: false },
    emailChangeCodeHash: { type: String, default: "", select: false },
    emailChangeExpiresAt: { type: Date, default: null, select: false },
    emailChangeAttempts: { type: Number, default: 0, select: false },
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
    // Referral uniqueness is tenant-scoped by tenantPlugin. Keeping the path
    // itself non-unique avoids defining a duplicate standalone unique index.
    referralCode: { type: String, sparse: true },
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

// Perform the side effect or state update expressed on the following line.
userSchema.index({ tenantId: 1, role: 1 });
// Perform the side effect or state update expressed on the following line.
userSchema.index(
  { tenantId: 1, email: 1 },
  {
    unique: true,
    name: "tenant_email_unique",
    partialFilterExpression: { tenantId: { $type: "objectId" } },
  }
);

// Perform the side effect or state update expressed on the following line.
userSchema.pre("save", async function (next) {
  // Check the condition (!this.isModified("password")) and run the matching branch.
  if (!this.isModified("password")) return next();

  // Never hash an already-hashed password. This protects registration,
  // password-reset and administrative password updates from accidental
  // double hashing while keeping plaintext passwords out of MongoDB.
  // Check the condition (BCRYPT_HASH_PATTERN.test(String(this.password || ""))) and run the matching branch.
  if (BCRYPT_HASH_PATTERN.test(String(this.password || ""))) return next();

  // Declare salt for use by the surrounding module or function.
  const salt = await bcrypt.genSalt(10);
  // Perform the side effect or state update expressed on the following line.
  this.password = await bcrypt.hash(String(this.password), salt);
  // Perform the side effect or state update expressed on the following line.
  next();
});

// Perform the side effect or state update expressed on the following line.
userSchema.pre("save", function (next) {
  // Check the condition (!this.referralCode) and run the matching branch.
  if (!this.referralCode) {
    // Perform the side effect or state update expressed on the following line.
    this.referralCode = crypto.randomBytes(4).toString("hex").toUpperCase();
  }
  // Perform the side effect or state update expressed on the following line.
  next();
});

// Perform the side effect or state update expressed on the following line.
userSchema.methods.matchPassword = async function (enteredPassword) {
  // Declare candidate for use by the surrounding module or function.
  const candidate = String(enteredPassword ?? "");
  // Declare storedHash for use by the surrounding module or function.
  const storedHash = String(this.password || "");
  // Check the condition (!candidate || !storedHash) and run the matching branch.
  if (!candidate || !storedHash) return false;

  // Check the condition (BCRYPT_HASH_PATTERN.test(storedHash)) and run the matching branch.
  if (BCRYPT_HASH_PATTERN.test(storedHash)) {
    // Return the result of bcrypt.compare() to the caller.
    return bcrypt.compare(candidate, storedHash);
  }

  // One-time compatibility path for legacy accounts whose password was stored
  // before bcrypt hashing was enforced. A successful legacy login immediately
  // rehashes the password through the save hook, so plaintext is not retained.
  // Check the condition (storedHash === candidate) and run the matching branch.
  if (storedHash === candidate) {
    // Perform the side effect or state update expressed on the following line.
    this.password = candidate;
    // Perform the side effect or state update expressed on the following line.
    await this.save({ validateBeforeSave: false });
    // Return the expression shown below to the caller.
    return true;
  }

  // Return the expression shown below to the caller.
  return false;
};

// Perform the side effect or state update expressed on the following line.
userSchema.virtual("isActive").get(function () {
  // Return the expression shown below to the caller.
  return this.status === "active";
});

// Perform the side effect or state update expressed on the following line.
userSchema.virtual("isLocked").get(function () {
  // Return the expression shown below to the caller.
  return this.lockUntil && this.lockUntil > Date.now();
});

// Declare tenantUserSchema for use by the surrounding module or function.
const tenantUserSchema = userSchema.plugin(tenantPlugin);
// Declare User for use by the surrounding module or function.
const User = mongoose.models.User || mongoose.model("User", tenantUserSchema);

export default User;
