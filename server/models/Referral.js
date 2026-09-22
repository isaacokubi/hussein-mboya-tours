// server/models/Referral.js

import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const referralSchema = new firestore.Schema(
  {
    tenantId: {
      type: firestore.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
      required: false,
    },
    referrer: {
      type: firestore.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    referredUser: {
      type: firestore.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    booking: {
      type: firestore.Schema.Types.ObjectId,
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
      type: firestore.Schema.Types.ObjectId,
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

referralSchema.index({ referrer: 1, status: 1 });
referralSchema.index({ createdAt: -1 });
referralSchema.index({ reward: -1 });

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

const tenantReferralSchema = referralSchema.plugin(tenantPlugin);
const Referral = firestore.models.Referral || firestore.model("Referral", tenantReferralSchema);

export default Referral;
