import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
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

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
    },

    phone: {
      type: String,
      default: "",
    },

    /*
|--------------------------------------------------------------------------
| ROLE SYSTEM
|--------------------------------------------------------------------------
|
| Simple role support
|
| customer
| admin
|
*/

    role: {
      type: String,

      enum: ["customer", "admin", "agent", "tour_manager", "tour_guide"],

      default: "customer",
    },

    /*
|--------------------------------------------------------------------------
| ADVANCED RBAC SUPPORT
|--------------------------------------------------------------------------
*/

    roleId: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Role",

      default: null,
    },

    /*
|--------------------------------------------------------------------------
| AGENT LINK
|--------------------------------------------------------------------------
*/

    agent: {
      type: mongoose.Schema.Types.ObjectId,

      ref: "Agent",

      default: null,
    },

    /*
|--------------------------------------------------------------------------
| PERMISSIONS
|--------------------------------------------------------------------------
*/

    permissionsOverride: [
      {
        type: mongoose.Schema.Types.ObjectId,

        ref: "Permission",
      },
    ],

    /*
|--------------------------------------------------------------------------
| ACCOUNT STATUS
|--------------------------------------------------------------------------
*/

    status: {
      type: String,

      enum: ["active", "inactive", "suspended"],

      default: "active",
    },

    isVerified: {
      type: Boolean,

      default: false,
    },

    /*
|--------------------------------------------------------------------------
| PROFILE
|--------------------------------------------------------------------------
*/

    profileImage: {
      type: String,

      default: "",
    },

    address: {
      type: String,

      default: "",
    },

    country: {
      type: String,

      default: "",
    },

    /*
|--------------------------------------------------------------------------
| SECURITY
|--------------------------------------------------------------------------
*/

    loginAttempts: {
      type: Number,

      default: 0,
    },

    lockUntil: {
      type: Date,

      default: null,
    },

    lastLoginAt: {
      type: Date,

      default: null,
    },

    passwordChangedAt: {
      type: Date,

      default: null,
    },

    resetPasswordToken: {
      type: String,

      default: null,
    },

    resetPasswordExpire: {
      type: Date,

      default: null,
    },

    /*
|--------------------------------------------------------------------------
| REFERRAL + LOYALTY
|--------------------------------------------------------------------------
*/

    referralCode: {
      type: String,

      unique: true,

      sparse: true,
    },

    referredBy: {
      type: String,

      default: null,
    },

    loyaltyPoints: {
      type: Number,

      default: 0,
    },
  },

  {
    timestamps: true,
  },
);

/*
|--------------------------------------------------------------------------
| PASSWORD HASHING
|--------------------------------------------------------------------------
*/

userSchema.pre(
  "save",

  async function (next) {
    if (!this.isModified("password")) return next();

    const salt = await bcrypt.genSalt(12);

    this.password = await bcrypt.hash(
      this.password,

      salt,
    );

    next();
  },
);

/*
|--------------------------------------------------------------------------
| PASSWORD CHECK
|--------------------------------------------------------------------------
*/

userSchema.methods.matchPassword = async function (password) {
  return bcrypt.compare(
    password,

    this.password,
  );
};

/*
|--------------------------------------------------------------------------
| ACCOUNT LOCK CHECK
|--------------------------------------------------------------------------
*/

userSchema.methods.isLocked = function () {
  return this.lockUntil && this.lockUntil > Date.now();
};

/*
|--------------------------------------------------------------------------
| ADMIN CHECK HELPER
|--------------------------------------------------------------------------
*/

userSchema.methods.isAdmin = function () {
  return this.role === "admin";
};

/*
|--------------------------------------------------------------------------
| CUSTOMER CHECK HELPER
|--------------------------------------------------------------------------
*/

userSchema.methods.isCustomer = function () {
  return this.role === "customer";
};

const User =
  mongoose.models.User ||
  mongoose.model(
    "User",

    userSchema,
  );

export default User;
