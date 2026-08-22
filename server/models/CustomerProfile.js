// server/models/CustomerProfile.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
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

customerProfileSchema.virtual("isVIP").get(function () {
  return this.customerType === "vip";
});

customerProfileSchema.virtual("fullAddress").get(function () {
  return [this.address, this.city, this.country]
    .filter(Boolean)
    .join(", ");
});

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/



customerProfileSchema.index({
  customerType: 1,
});

customerProfileSchema.index({
  loyaltyTier: 1,
});

customerProfileSchema.index({
  totalBookings: -1,
});

customerProfileSchema.index({
  totalSpent: -1,
});

customerProfileSchema.index({
  isActive: 1,
});

customerProfileSchema.index({
  isDeleted: 1,
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

customerProfileSchema.methods.addLoyaltyPoints = function (points) {
  this.loyaltyPoints += points;

  if (this.loyaltyPoints >= 5000) {
    this.loyaltyTier = "platinum";
  } else if (this.loyaltyPoints >= 2500) {
    this.loyaltyTier = "gold";
  } else if (this.loyaltyPoints >= 1000) {
    this.loyaltyTier = "silver";
  } else {
    this.loyaltyTier = "bronze";
  }

  return this.save();
};

customerProfileSchema.methods.updateStatistics = function (amount) {
  this.totalBookings += 1;
  this.completedBookings += 1;
  this.totalSpent += amount;

  this.averageBookingValue =
    this.totalSpent / this.totalBookings;

  this.lastBookingDate = new Date();

  return this.save();
};

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const CustomerProfile =
  mongoose.models.CustomerProfile ||
  customerProfileSchema.plugin(tenantPlugin);

mongoose.model(
    "CustomerProfile",
    customerProfileSchema
  );








export default CustomerProfile;