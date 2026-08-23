// server/models/Customer.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| EMERGENCY CONTACT
|--------------------------------------------------------------------------
*/

const emergencyContactSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
    name: {
      type: String,
      trim: true,
      default: "",
    },

    relationship: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    _id: false,
  },
);

/*
|--------------------------------------------------------------------------
| CUSTOMER SCHEMA
|--------------------------------------------------------------------------
*/

const customerSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | OWNER AGENT
    |--------------------------------------------------------------------------
    */

    agent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Agent",
      default: null,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | OPTIONAL LINK TO USER ACCOUNT
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
      unique: true,
      sparse: true,
    },

    /*
    |--------------------------------------------------------------------------
    | BASIC DETAILS
    |--------------------------------------------------------------------------
    */

    firstName: {
      type: String,
      required: true,
      trim: true,
    },

    lastName: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
      default: "",
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PERSONAL DETAILS
    |--------------------------------------------------------------------------
    */

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      default: null,
    },

    dateOfBirth: {
      type: Date,
      default: null,
    },

    nationality: {
      type: String,
      trim: true,
      default: "",
    },

    passportNumber: {
      type: String,
      trim: true,
      default: "",
    },

    passportExpiryDate: {
      type: Date,
      default: null,
    },

    nationalId: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | ADDRESS
    |--------------------------------------------------------------------------
    */

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    county: {
      type: String,
      trim: true,
      default: "",
    },

    country: {
      type: String,
      trim: true,
      default: "Kenya",
    },

    postalCode: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | COMPANY
    |--------------------------------------------------------------------------
    */

    company: {
      type: String,
      trim: true,
      default: "",
    },

    jobTitle: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | EMERGENCY CONTACT
    |--------------------------------------------------------------------------
    */

    emergencyContact: emergencyContactSchema,

    /*
    |--------------------------------------------------------------------------
    | PROFILE
    |--------------------------------------------------------------------------
    */

    profileImage: {
      type: String,
      default: "",
    },

    customerType: {
      type: String,
      enum: [
        "individual",
        "family",
        "corporate",
        "vip",
      ],
      default: "individual",
    },

    /*
    |--------------------------------------------------------------------------
    | CRM
    |--------------------------------------------------------------------------
    */

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],

    preferredContactMethod: {
      type: String,
      enum: [
        "phone",
        "email",
        "whatsapp",
      ],
      default: "phone",
    },

    marketingConsent: {
      type: Boolean,
      default: true,
    },

    lastContactedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | LOYALTY
    |--------------------------------------------------------------------------
    */

    loyaltyPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalBookings: {
      type: Number,
      default: 0,
      min: 0,
    },

    completedBookings: {
      type: Number,
      default: 0,
      min: 0,
    },

    cancelledBookings: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalSpent: {
      type: Number,
      default: 0,
      min: 0,
    },

    averageBookingValue: {
      type: Number,
      default: 0,
      min: 0,
    },

    lastBookingDate: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "active",
        "inactive",
        "blocked",
      ],
      default: "active",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | AUDIT
    |--------------------------------------------------------------------------
    */

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,

    toJSON: {
      virtuals: true,
    },

    toObject: {
      virtuals: true,
    },
  },
);

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

customerSchema.virtual("fullName").get(function () {
  return `${this.firstName} ${this.lastName}`;
});

customerSchema.virtual("bookingCount", {
  ref: "Booking",
  localField: "_id",
  foreignField: "customer",
  count: true,
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

customerSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  phone: "text",
});

customerSchema.index({
  agent: 1,
  status: 1,
});

customerSchema.index({
  customerType: 1,
});

customerSchema.index({
  email: 1,
});

customerSchema.index({
  phone: 1,
});

customerSchema.index({
  createdAt: -1,
});

customerSchema.index({
  totalSpent: -1,
});

customerSchema.index({
  loyaltyPoints: -1,
});

customerSchema.index({
  isDeleted: 1,
});

/*
|--------------------------------------------------------------------------
| MIDDLEWARE
|--------------------------------------------------------------------------
*/

customerSchema.pre("save", function (next) {
  if (this.totalBookings > 0) {
    this.averageBookingValue =
      this.totalSpent / this.totalBookings;
  } else {
    this.averageBookingValue = 0;
  }

  next();
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

customerSchema.methods.addLoyaltyPoints = function (points) {
  this.loyaltyPoints += points;
  return this.save();
};

customerSchema.methods.softDelete = function () {
  this.isDeleted = true;
  this.deletedAt = new Date();
  this.status = "inactive";
  return this.save();
};

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

const tenantCustomerSchema = customerSchema.plugin(tenantPlugin);
const Customer = mongoose.models.Customer || mongoose.model("Customer", tenantCustomerSchema);








export default Customer;
