/**
 * Purpose: Coupon database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Coupon.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare couponSchema for use by the surrounding module or function.
const couponSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    code: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    discountType: { type: String, enum: ["percentage", "fixed"], required: true },
    amount: { type: Number, required: true, min: 0 },
    startDate: { type: Date, default: Date.now },
    expiresAt: { type: Date, required: true },
    usageLimit: { type: Number, default: 1, min: 1 },
    usedCount: { type: Number, default: 0, min: 0 },
    minimumBookingAmount: { type: Number, default: 0, min: 0 },
    maximumDiscount: { type: Number, default: null, min: 0 },
    active: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// Perform the side effect or state update expressed on the following line.
couponSchema.index({ tenantId: 1, code: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
couponSchema.index({ tenantId: 1, active: 1, expiresAt: 1 });
// Perform the side effect or state update expressed on the following line.
couponSchema.index({ tenantId: 1, createdAt: -1 });

// Perform the side effect or state update expressed on the following line.
couponSchema.virtual("remainingUses").get(function () {
  // Return the result of Math.max() to the caller.
  return Math.max(this.usageLimit - this.usedCount, 0);
});

// Perform the side effect or state update expressed on the following line.
couponSchema.virtual("expired").get(function () {
  // Return the expression shown below to the caller.
  return this.expiresAt < new Date();
});

// Perform the side effect or state update expressed on the following line.
couponSchema.methods.isExpired = function () {
  // Return the expression shown below to the caller.
  return this.expiresAt < new Date();
};

// Perform the side effect or state update expressed on the following line.
couponSchema.methods.canBeUsed = function () {
  // Return the expression shown below to the caller.
  return this.active && !this.isExpired() && this.usedCount < this.usageLimit;
};

// Perform the side effect or state update expressed on the following line.
couponSchema.methods.calculateDiscount = function (bookingAmount) {
  // Check the condition (!this.canBeUsed() || bookingAmount < this.minimumBookingAmount) and run the matching branch.
  if (!this.canBeUsed() || bookingAmount < this.minimumBookingAmount) return 0;

  // Declare discount for use by the surrounding module or function.
  let discount = this.discountType === "percentage"
    ? (bookingAmount * this.amount) / 100
    : this.amount;

  // Check the condition (this.maximumDiscount != null && discount > this.maximumDiscount) and run the matching branch.
  if (this.maximumDiscount != null && discount > this.maximumDiscount) {
    // Perform the side effect or state update expressed on the following line.
    discount = this.maximumDiscount;
  }

  // Return the result of Math.min() to the caller.
  return Math.min(Math.max(discount, 0), bookingAmount);
};

// Perform the side effect or state update expressed on the following line.
couponSchema.methods.incrementUsage = async function () {
  // Perform the side effect or state update expressed on the following line.
  this.usedCount += 1;
  // Perform the side effect or state update expressed on the following line.
  await this.save();
};

// Declare tenantCouponSchema for use by the surrounding module or function.
const tenantCouponSchema = couponSchema.plugin(tenantPlugin);
// Declare Coupon for use by the surrounding module or function.
const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", tenantCouponSchema);

export default Coupon;
