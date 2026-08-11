import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const userSchema = new mongoose.Schema(
  {
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

    phone: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value) => /^\d{10}$/.test(String(value || "")),
        message: "Phone number must contain exactly 10 digits.",
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },

    role: {
    type: String,
    enum: [
      "customer",
      "admin",
      "super_admin",
      "superadmin",
      "administrator",
      "agent",
      "travel_agent",
      "tour_manager",
      "tourmanager",
      "manager",
      "tour_guide",
      "tourguide",
      "guide",
      "driver",
    ],
    default: "customer",
  },

    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      default: null,
    },

    permissionsOverride: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],

    legacyRole: {
      type: String,
      default: "customer",
    },

    profileImage: {
      url: {
        type: String,
        default: "",
      },

      publicId: {
        type: String,
        default: "",
      },
    },

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "disabled",
        "suspended",
        "blocked",
      ],
      default: "active",
    },

    isVerified: {
      type: Boolean,
      default: false,
    },

    loyaltyPoints: {
      type: Number,
      default: 0,
    },

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
    },

    loginAttempts: {
      type: Number,
      default: 0,
    },

    lockUntil: {
      type: Date,
      default: null,
    },

    passwordResetCodeHash: {
      type: String,
      default: "",
      select: false,
    },

    passwordResetExpiresAt: {
      type: Date,
      default: null,
      select: false,
    },

    passwordResetAttempts: {
      type: Number,
      default: 0,
      select: false,
    },

    lastLoginAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| HASH PASSWORD
|--------------------------------------------------------------------------
*/

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  const salt = await bcrypt.genSalt(10);

  this.password = await bcrypt.hash(
    this.password,
    salt
  );

  next();
});

/*
|--------------------------------------------------------------------------
| AUTO REFERRAL CODE
|--------------------------------------------------------------------------
*/

userSchema.pre("save", function (next) {
  if (!this.referralCode) {
    this.referralCode = crypto
      .randomBytes(4)
      .toString("hex")
      .toUpperCase();
  }

  next();
});

/*
|--------------------------------------------------------------------------
| MATCH PASSWORD
|--------------------------------------------------------------------------
*/

userSchema.methods.matchPassword = async function (
  enteredPassword
) {
  return await bcrypt.compare(
    enteredPassword,
    this.password
  );
};

/*
|--------------------------------------------------------------------------
| ACCOUNT LOCK HELPER
|--------------------------------------------------------------------------
*/

userSchema.virtual("isActive").get(function () {
  return this.status === "active";
});

userSchema.virtual("isLocked").get(function () {
  return (
    this.lockUntil &&
    this.lockUntil > Date.now()
  );
});

const User = mongoose.model(
  "User",
  userSchema
);

export default User;