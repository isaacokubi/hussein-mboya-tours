/**
 * Purpose: Loyalty database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Loyalty.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| LOYALTY TRANSACTION SCHEMA
|--------------------------------------------------------------------------
*/

// Declare transactionSchema for use by the surrounding module or function.
const transactionSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    type: {
      type: String,
      enum: [
        "earned",
        "redeemed",
        "bonus",
        "adjustment",
        "expired",
        "referral",
      ],
      required: true,
    },

    points: {
      type: Number,
      required: true,
      min: 0,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    _id: false,
  }
);

/*
|--------------------------------------------------------------------------
| LOYALTY SCHEMA
|--------------------------------------------------------------------------
*/

// Declare loyaltySchema for use by the surrounding module or function.
const loyaltySchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | USER
    |--------------------------------------------------------------------------
    */

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | POINTS
    |--------------------------------------------------------------------------
    */

    availablePoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    lifetimePoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    redeemedPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    expiredPoints: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | MEMBERSHIP TIER
    |--------------------------------------------------------------------------
    */

    tier: {
      type: String,
      enum: [
        "Bronze",
        "Silver",
        "Gold",
        "Platinum",
        "Diamond",
      ],
      default: "Bronze",
    },

    tierUpdatedAt: {
      type: Date,
      default: Date.now,
    },

    /*
    |--------------------------------------------------------------------------
    | REFERRALS
    |--------------------------------------------------------------------------
    */

    referralCode: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },

    referredBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    successfulReferrals: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | EXPIRY
    |--------------------------------------------------------------------------
    */

    pointsExpiryDate: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | ACTIVITY
    |--------------------------------------------------------------------------
    */

    lastEarnedAt: {
      type: Date,
      default: null,
    },

    lastRedeemedAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | TRANSACTION HISTORY
    |--------------------------------------------------------------------------
    */

    transactions: [transactionSchema],

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
  },
  {
    timestamps: true,
  }
);

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
loyaltySchema.virtual("totalTransactions").get(function () {
  // Return the length value to the caller.
  return this.transactions.length;
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
loyaltySchema.methods.addPoints = function (
  points,
  description = "",
  booking = null,
  createdBy = null
) {
  // Perform the side effect or state update expressed on the following line.
  this.availablePoints += points;
  // Perform the side effect or state update expressed on the following line.
  this.lifetimePoints += points;
  // Perform the side effect or state update expressed on the following line.
  this.lastEarnedAt = new Date();

  // Perform the side effect or state update expressed on the following line.
  this.transactions.push({
    type: "earned",
    points,
    description,
    booking,
    createdBy,
  });

  // Return the expression shown below to the caller.
  return this;
};

// Perform the side effect or state update expressed on the following line.
loyaltySchema.methods.redeemPoints = function (
  points,
  description = "",
  booking = null,
  createdBy = null
) {
  // Check the condition (this.availablePoints < points) and run the matching branch.
  if (this.availablePoints < points) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Insufficient loyalty points");
  }

  // Perform the side effect or state update expressed on the following line.
  this.availablePoints -= points;
  // Perform the side effect or state update expressed on the following line.
  this.redeemedPoints += points;
  // Perform the side effect or state update expressed on the following line.
  this.lastRedeemedAt = new Date();

  // Perform the side effect or state update expressed on the following line.
  this.transactions.push({
    type: "redeemed",
    points,
    description,
    booking,
    createdBy,
  });

  // Return the expression shown below to the caller.
  return this;
};

// Perform the side effect or state update expressed on the following line.
loyaltySchema.methods.updateTier = function () {
  // Check the condition (this.lifetimePoints >= 10000) and run the matching branch.
  if (this.lifetimePoints >= 10000) {
    // Perform the side effect or state update expressed on the following line.
    this.tier = "Diamond";
  } else if (this.lifetimePoints >= 5000) {
    // Perform the side effect or state update expressed on the following line.
    this.tier = "Platinum";
  } else if (this.lifetimePoints >= 2500) {
    // Perform the side effect or state update expressed on the following line.
    this.tier = "Gold";
  } else if (this.lifetimePoints >= 1000) {
    // Perform the side effect or state update expressed on the following line.
    this.tier = "Silver";
  } else {
    // Perform the side effect or state update expressed on the following line.
    this.tier = "Bronze";
  }

  // Perform the side effect or state update expressed on the following line.
  this.tierUpdatedAt = new Date();

  // Return the expression shown below to the caller.
  return this;
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
loyaltySchema.index({ tier: 1 });



// Perform the side effect or state update expressed on the following line.
loyaltySchema.index({ availablePoints: -1 });

// Perform the side effect or state update expressed on the following line.
loyaltySchema.index({ createdAt: -1 });

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantLoyaltySchema for use by the surrounding module or function.
const tenantLoyaltySchema = loyaltySchema.plugin(tenantPlugin);
// Declare Loyalty for use by the surrounding module or function.
const Loyalty = mongoose.models.Loyalty || mongoose.model("Loyalty", tenantLoyaltySchema);








export default Loyalty;
