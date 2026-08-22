// server/models/Referral.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

/*
|--------------------------------------------------------------------------
| REFERRAL SCHEMA
|--------------------------------------------------------------------------
|
| Tracks customer referral program.
|
| Flow:
|
| User A (Referrer)
|        │
|        ▼
| User B (Referred User)
|        │
|        ▼
| Makes Booking
|        │
|        ▼
| Reward Generated
|
|--------------------------------------------------------------------------
*/

const referralSchema = new mongoose.Schema(
  {
    /*
    |--------------------------------------------------------------------------
    | REFERRER
    |--------------------------------------------------------------------------
    */

    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | REFERRED USER
    |--------------------------------------------------------------------------
    */

    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | RELATED BOOKING
    |--------------------------------------------------------------------------
    */

    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | REFERRAL CODE
    |--------------------------------------------------------------------------
    */

    referralCode: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | REWARD
    |--------------------------------------------------------------------------
    */

    reward: {
      type: Number,
      default: 0,
      min: 0,
    },

    rewardType: {
      type: String,
      enum: [
        "cash",
        "points",
        "discount",
        "voucher",
        "gift",
      ],
      default: "cash",
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    status: {
      type: String,
      enum: [
        "pending",
        "qualified",
        "approved",
        "paid",
        "cancelled",
        "expired",
      ],
      default: "pending",
      index: true,
    },

    /*
    |--------------------------------------------------------------------------
    | IMPORTANT DATES
    |--------------------------------------------------------------------------
    */

    qualifiedAt: {
      type: Date,
      default: null,
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT REFERENCE
    |--------------------------------------------------------------------------
    */

    paymentReference: {
      type: String,
      default: "",
      trim: true,
    },

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
    | CREATED BY
    |--------------------------------------------------------------------------
    */

    createdBy: {
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
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/

referralSchema.index({
  referrer: 1,
  status: 1,
});

referralSchema.index({
  createdAt: -1,
});

referralSchema.index({
  reward: -1,
});

referralSchema.index({
  referralCode: 1,
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

referralSchema.methods.markQualified = function () {
  this.status = "qualified";
  this.qualifiedAt = new Date();
  return this.save();
};

referralSchema.methods.approveReward = function () {
  this.status = "approved";
  this.approvedAt = new Date();
  return this.save();
};

referralSchema.methods.markPaid = function (reference = "") {
  this.status = "paid";
  this.paidAt = new Date();
  this.paymentReference = reference;
  return this.save();
};

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Referral =
  mongoose.models.Referral ||
  referralSchema.plugin(tenantPlugin);

mongoose.model("Referral", referralSchema);

export default Referral;