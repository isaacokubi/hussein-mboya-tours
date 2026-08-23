// server/models/Loyalty.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| LOYALTY TRANSACTION SCHEMA
|--------------------------------------------------------------------------
*/

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

loyaltySchema.virtual("totalTransactions").get(function () {
  return this.transactions.length;
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

loyaltySchema.methods.addPoints = function (
  points,
  description = "",
  booking = null,
  createdBy = null
) {
  this.availablePoints += points;
  this.lifetimePoints += points;
  this.lastEarnedAt = new Date();

  this.transactions.push({
    type: "earned",
    points,
    description,
    booking,
    createdBy,
  });

  return this;
};

loyaltySchema.methods.redeemPoints = function (
  points,
  description = "",
  booking = null,
  createdBy = null
) {
  if (this.availablePoints < points) {
    throw new Error("Insufficient loyalty points");
  }

  this.availablePoints -= points;
  this.redeemedPoints += points;
  this.lastRedeemedAt = new Date();

  this.transactions.push({
    type: "redeemed",
    points,
    description,
    booking,
    createdBy,
  });

  return this;
};

loyaltySchema.methods.updateTier = function () {
  if (this.lifetimePoints >= 10000) {
    this.tier = "Diamond";
  } else if (this.lifetimePoints >= 5000) {
    this.tier = "Platinum";
  } else if (this.lifetimePoints >= 2500) {
    this.tier = "Gold";
  } else if (this.lifetimePoints >= 1000) {
    this.tier = "Silver";
  } else {
    this.tier = "Bronze";
  }

  this.tierUpdatedAt = new Date();

  return this;
};

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

loyaltySchema.index({ tier: 1 });



loyaltySchema.index({ availablePoints: -1 });

loyaltySchema.index({ createdAt: -1 });

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const tenantLoyaltySchema = loyaltySchema.plugin(tenantPlugin);
const Loyalty = mongoose.models.Loyalty || mongoose.model("Loyalty", tenantLoyaltySchema);








export default Loyalty;
