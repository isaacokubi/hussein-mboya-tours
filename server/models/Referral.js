/**
 * Purpose: Referral database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Referral.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare referralSchema for use by the surrounding module or function.
const referralSchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
      required: false,
    },
    referrer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referredUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Booking",
      default: null,
    },
    referralCode: {
      type: String,
      trim: true,
      uppercase: true,
      index: true,
    },
    reward: {
      type: Number,
      default: 0,
      min: 0,
    },
    rewardType: {
      type: String,
      enum: ["cash", "points", "discount", "voucher", "gift"],
      default: "cash",
    },
    status: {
      type: String,
      enum: ["pending", "qualified", "approved", "paid", "cancelled", "expired"],
      default: "pending",
      index: true,
    },
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
    paymentReference: {
      type: String,
      default: "",
      trim: true,
    },
    notes: {
      type: String,
      default: "",
      trim: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Perform the side effect or state update expressed on the following line.
referralSchema.index({ referrer: 1, status: 1 });
// Perform the side effect or state update expressed on the following line.
referralSchema.index({ createdAt: -1 });
// Perform the side effect or state update expressed on the following line.
referralSchema.index({ reward: -1 });

// Perform the side effect or state update expressed on the following line.
referralSchema.methods.markQualified = function () {
  // Perform the side effect or state update expressed on the following line.
  this.status = "qualified";
  // Perform the side effect or state update expressed on the following line.
  this.qualifiedAt = new Date();
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
referralSchema.methods.approveReward = function () {
  // Perform the side effect or state update expressed on the following line.
  this.status = "approved";
  // Perform the side effect or state update expressed on the following line.
  this.approvedAt = new Date();
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
referralSchema.methods.markPaid = function (reference = "") {
  // Perform the side effect or state update expressed on the following line.
  this.status = "paid";
  // Perform the side effect or state update expressed on the following line.
  this.paidAt = new Date();
  // Perform the side effect or state update expressed on the following line.
  this.paymentReference = reference;
  // Return the result of this.save() to the caller.
  return this.save();
};

// Declare tenantReferralSchema for use by the surrounding module or function.
const tenantReferralSchema = referralSchema.plugin(tenantPlugin);
// Declare Referral for use by the surrounding module or function.
const Referral = mongoose.models.Referral || mongoose.model("Referral", tenantReferralSchema);

export default Referral;
