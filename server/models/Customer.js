/**
 * Purpose: Customer database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Customer.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| EMERGENCY CONTACT
|--------------------------------------------------------------------------
*/

// Declare emergencyContactSchema for use by the surrounding module or function.
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

// Declare customerSchema for use by the surrounding module or function.
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
      default: false,
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

// Perform the side effect or state update expressed on the following line.
customerSchema.virtual("fullName").get(function () {
  // Return the expression shown below to the caller.
  return `${this.firstName} ${this.lastName}`;
});

// Perform the side effect or state update expressed on the following line.
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

// Perform the side effect or state update expressed on the following line.
customerSchema.index({
  firstName: "text",
  lastName: "text",
  email: "text",
  phone: "text",
});

// Perform the side effect or state update expressed on the following line.
customerSchema.index({
  agent: 1,
  status: 1,
});

// Perform the side effect or state update expressed on the following line.
customerSchema.index({
  customerType: 1,
});

// Perform the side effect or state update expressed on the following line.
customerSchema.index({
  email: 1,
});

// Perform the side effect or state update expressed on the following line.
customerSchema.index({
  phone: 1,
});

// Perform the side effect or state update expressed on the following line.
customerSchema.index({
  createdAt: -1,
});

// Perform the side effect or state update expressed on the following line.
customerSchema.index({
  totalSpent: -1,
});

// Perform the side effect or state update expressed on the following line.
customerSchema.index({
  loyaltyPoints: -1,
});

// Perform the side effect or state update expressed on the following line.
customerSchema.index({
  isDeleted: 1,
});

/*
|--------------------------------------------------------------------------
| MIDDLEWARE
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
customerSchema.pre("save", function (next) {
  // Check the condition (this.totalBookings > 0) and run the matching branch.
  if (this.totalBookings > 0) {
    // Perform the side effect or state update expressed on the following line.
    this.averageBookingValue =
      this.totalSpent / this.totalBookings;
  } else {
    // Perform the side effect or state update expressed on the following line.
    this.averageBookingValue = 0;
  }

  // Perform the side effect or state update expressed on the following line.
  next();
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
customerSchema.methods.addLoyaltyPoints = function (points) {
  // Perform the side effect or state update expressed on the following line.
  this.loyaltyPoints += points;
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
customerSchema.methods.softDelete = function () {
  // Perform the side effect or state update expressed on the following line.
  this.isDeleted = true;
  // Perform the side effect or state update expressed on the following line.
  this.deletedAt = new Date();
  // Perform the side effect or state update expressed on the following line.
  this.status = "inactive";
  // Return the result of this.save() to the caller.
  return this.save();
};

/*
|--------------------------------------------------------------------------
| EXPORT
|--------------------------------------------------------------------------
*/

// Declare tenantCustomerSchema for use by the surrounding module or function.
const tenantCustomerSchema = customerSchema.plugin(tenantPlugin);
// Declare Customer for use by the surrounding module or function.
const Customer = mongoose.models.Customer || mongoose.model("Customer", tenantCustomerSchema);






export default Customer;