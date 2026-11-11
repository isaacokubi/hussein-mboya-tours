/**
 * Purpose: Customer Profile database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/CustomerProfile.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| CUSTOMER PROFILE SCHEMA
|--------------------------------------------------------------------------
|
| Extends the User account with travel preferences,
| loyalty information and CRM data.
|
*/

// Declare customerProfileSchema for use by the surrounding module or function.
const customerProfileSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    /*
    |--------------------------------------------------------------------------
    | USER ACCOUNT
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    /*
    |--------------------------------------------------------------------------
    | PERSONAL INFORMATION
    |--------------------------------------------------------------------------
    */

    dateOfBirth: {
      type: Date,
      default: null,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
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

    passportExpiry: {
      type: Date,
      default: null,
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

    country: {
      type: String,
      trim: true,
      default: "Kenya",
    },

    /*
    |--------------------------------------------------------------------------
    | EMERGENCY CONTACT
    |--------------------------------------------------------------------------
    */

    emergencyContact: {
      name: {
        type: String,
        default: "",
      },

      relationship: {
        type: String,
        default: "",
      },

      phone: {
        type: String,
        default: "",
      },
    },

    /*
    |--------------------------------------------------------------------------
    | TRAVEL PREFERENCES
    |--------------------------------------------------------------------------
    */

    travelPreferences: {
      destinations: [
        {
          type: String,
          trim: true,
        },
      ],

      activities: [
        {
          type: String,
          trim: true,
        },
      ],

      travelStyle: {
        type: String,
        enum: [
          "budget",
          "standard",
          "luxury",
          "family",
          "adventure",
          "business",
        ],
        default: "standard",
      },

      budgetRange: {
        type: String,
        enum: [
          "low",
          "medium",
          "high",
        ],
        default: "medium",
      },

      preferredAccommodation: {
        type: String,
        default: "",
      },

      preferredTransport: {
        type: String,
        default: "",
      },

      dietaryRequirements: [
        {
          type: String,
        },
      ],

      accessibilityNeeds: {
        type: String,
        default: "",
      },
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

    loyaltyTier: {
      type: String,
      enum: [
        "bronze",
        "silver",
        "gold",
        "platinum",
      ],
      default: "bronze",
    },

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER STATISTICS
    |--------------------------------------------------------------------------
    */

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

    lastTravelDate: {
      type: Date,
      default: null,
    },

    lastBookingDate: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | CUSTOMER CATEGORY
    |--------------------------------------------------------------------------
    */

    customerType: {
      type: String,
      enum: [
        "new",
        "regular",
        "vip",
        "corporate",
      ],
      default: "new",
    },

    /*
    |--------------------------------------------------------------------------
    | MARKETING
    |--------------------------------------------------------------------------
    */

    marketingPreferences: {
      email: {
        type: Boolean,
        default: true,
      },

      sms: {
        type: Boolean,
        default: false,
      },

      whatsapp: {
        type: Boolean,
        default: false,
      },

      promotions: {
        type: Boolean,
        default: true,
      },
    },

    /*
    |--------------------------------------------------------------------------
    | WISHLIST
    |--------------------------------------------------------------------------
    */

    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | NOTES
    |--------------------------------------------------------------------------
    */

    notes: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | ACCOUNT STATUS
    |--------------------------------------------------------------------------
    */

    isActive: {
      type: Boolean,
      default: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
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
  }
);

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
customerProfileSchema.virtual("isVIP").get(function () {
  // Return the expression shown below to the caller.
  return this.customerType === "vip";
});

// Perform the side effect or state update expressed on the following line.
customerProfileSchema.virtual("fullAddress").get(function () {
  // Return the result of [this.address, this.city, this.country]     .filter(Boolean)     .join() to the caller.
  return [this.address, this.city, this.country]
    .filter(Boolean)
    .join(", ");
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/



// Perform the side effect or state update expressed on the following line.
customerProfileSchema.index({
  customerType: 1,
});

// Perform the side effect or state update expressed on the following line.
customerProfileSchema.index({
  loyaltyTier: 1,
});

// Perform the side effect or state update expressed on the following line.
customerProfileSchema.index({
  totalBookings: -1,
});

// Perform the side effect or state update expressed on the following line.
customerProfileSchema.index({
  totalSpent: -1,
});

// Perform the side effect or state update expressed on the following line.
customerProfileSchema.index({
  isActive: 1,
});

// Perform the side effect or state update expressed on the following line.
customerProfileSchema.index({
  isDeleted: 1,
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
customerProfileSchema.methods.addLoyaltyPoints = function (points) {
  // Perform the side effect or state update expressed on the following line.
  this.loyaltyPoints += points;

  // Check the condition (this.loyaltyPoints >= 5000) and run the matching branch.
  if (this.loyaltyPoints >= 5000) {
    // Perform the side effect or state update expressed on the following line.
    this.loyaltyTier = "platinum";
  } else if (this.loyaltyPoints >= 2500) {
    // Perform the side effect or state update expressed on the following line.
    this.loyaltyTier = "gold";
  } else if (this.loyaltyPoints >= 1000) {
    // Perform the side effect or state update expressed on the following line.
    this.loyaltyTier = "silver";
  } else {
    // Perform the side effect or state update expressed on the following line.
    this.loyaltyTier = "bronze";
  }

  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
customerProfileSchema.methods.updateStatistics = function (amount) {
  // Perform the side effect or state update expressed on the following line.
  this.totalBookings += 1;
  // Perform the side effect or state update expressed on the following line.
  this.completedBookings += 1;
  // Perform the side effect or state update expressed on the following line.
  this.totalSpent += amount;

  // Perform the side effect or state update expressed on the following line.
  this.averageBookingValue =
    this.totalSpent / this.totalBookings;

  // Perform the side effect or state update expressed on the following line.
  this.lastBookingDate = new Date();

  // Return the result of this.save() to the caller.
  return this.save();
};

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantCustomerProfileSchema for use by the surrounding module or function.
const tenantCustomerProfileSchema = customerProfileSchema.plugin(tenantPlugin);
// Declare CustomerProfile for use by the surrounding module or function.
const CustomerProfile = mongoose.models.CustomerProfile || mongoose.model("CustomerProfile", tenantCustomerProfileSchema);








export default CustomerProfile;
