// Mongoose defines user documents and validates stored account fields.
import mongoose from "mongoose";
// Enforce tenant-scoped reads and writes for tenant-owned user accounts.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Use bcrypt to hash passwords before storing them.
import bcrypt from "bcryptjs";
// Use cryptographically secure randomness to generate referral codes.
import crypto from "crypto";

// Recognize bcrypt hashes so a password already hashed by another flow is not hashed twice.
const BCRYPT_HASH_PATTERN = /^\$2[aby]\$\d{2}\$[./A-Za-z0-9]{53}$/;

const userSchema = new mongoose.Schema(
  {
    // User's display/full name.
    name: { type: String, required: true, trim: true },
    // Email uniqueness is tenant-scoped. Global uniqueness caused one company
    // to block another company from using the same legitimate staff email.
    email: { type: String, required: true, lowercase: true, trim: true },
    // Pending email changes are verified by a one-time code before the
    // canonical login/recovery email is replaced.
    pendingEmail: { type: String, default: "", lowercase: true, trim: true, select: false },
    // Hash of the one-time code used to verify an email change.
    emailChangeCodeHash: { type: String, default: "", select: false },
    // Expiry time for the pending email verification code.
    emailChangeExpiresAt: { type: Date, default: null, select: false },
    // Number of verification attempts for the pending email change.
    emailChangeAttempts: { type: Number, default: 0, select: false },
    // Required phone number validated against the application's expected digit format.
    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => /^\d{10}$/.test(String(value || "").trim()),
        message: "Phone number must contain exactly 10 digits.",
      },
    },
    // Password hash; excluded from normal query results for security.
    password: { type: String, required: true, minlength: 8, select: false },
    // Canonical/legacy role label used by authorization code.
    role: {
      type: String,
      enum: ["customer", "admin", "super_admin", "superadmin", "administrator", "agent", "travel_agent", "tour_manager", "tourmanager", "manager", "tour_guide", "tourguide", "guide", "driver"],
      default: "customer",
    },
    // Reference to the structured Role record.
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", default: null },
    // Organization that owns this account; null is allowed for platform/global users.
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", default: null },
    // Per-user permission overrides represented by Permission references.
    permissionsOverride: [{ type: mongoose.Schema.Types.ObjectId, ref: "Permission" }],
    // Fallback role field retained for older records and integrations.
    legacyRole: { type: String, default: "customer" },
    // Image URL and media identifier used for the user's profile picture.
    profileImage: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    // Account lifecycle state used to permit or block access.
    status: { type: String, enum: ["active", "inactive", "disabled", "suspended", "blocked"], default: "active" },
    // Whether the account has completed its required verification flow.
    isVerified: { type: Boolean, default: false },
    // Accumulated customer loyalty points.
    loyaltyPoints: { type: Number, default: 0 },
    // Referral uniqueness is tenant-scoped by tenantPlugin. Keeping the path
    // itself non-unique avoids defining a duplicate standalone unique index.
    referralCode: { type: String, sparse: true },
    // Count of consecutive unsuccessful login attempts.
    loginAttempts: { type: Number, default: 0 },
    // Timestamp until which sign-in should remain locked.
    lockUntil: { type: Date, default: null },
    // Hash of the password-reset code, hidden from normal queries.
    passwordResetCodeHash: { type: String, default: "", select: false },
    // Expiry time for the password-reset code.
    passwordResetExpiresAt: { type: Date, default: null, select: false },
    // Count of attempts to validate the password-reset code.
    passwordResetAttempts: { type: Number, default: 0, select: false },
    // Hash of a one-time login PIN, hidden from normal queries.
    loginPinHash: { type: String, default: "", select: false },
    // Expiry time for the one-time login PIN.
    loginPinExpiresAt: { type: Date, default: null, select: false },
    // Count of failed login-PIN attempts.
    loginPinAttempts: { type: Number, default: 0, select: false },
    // Timestamp when the latest login PIN was sent.
    loginPinLastSentAt: { type: Date, default: null, select: false },
    // Timestamp of the user's most recent successful login.
    lastLoginAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Speed up role lookups within a tenant.
userSchema.index({ tenantId: 1, role: 1 });
userSchema.index(
  { tenantId: 1, email: 1 },
  {
    unique: true,
    name: "tenant_email_unique",
    partialFilterExpression: { tenantId: { $type: "objectId" } },
  }
);

// Hash plaintext passwords before persistence, unless the password field is unchanged.
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

// Generate a referral code when the user does not already have one.
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
