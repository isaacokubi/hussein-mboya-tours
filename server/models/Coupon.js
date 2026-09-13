// server/models/Coupon.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

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

couponSchema.index({ tenantId: 1, code: 1 }, { unique: true });
couponSchema.index({ tenantId: 1, active: 1, expiresAt: 1 });
couponSchema.index({ tenantId: 1, createdAt: -1 });

couponSchema.virtual("remainingUses").get(function () {
  return Math.max(this.usageLimit - this.usedCount, 0);
});

couponSchema.virtual("expired").get(function () {
  return this.expiresAt < new Date();
});

couponSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

couponSchema.methods.canBeUsed = function () {
  return this.active && !this.isExpired() && this.usedCount < this.usageLimit;
};

couponSchema.methods.calculateDiscount = function (bookingAmount) {
  if (!this.canBeUsed() || bookingAmount < this.minimumBookingAmount) return 0;

  let discount = this.discountType === "percentage"
    ? (bookingAmount * this.amount) / 100
    : this.amount;

  if (this.maximumDiscount != null && discount > this.maximumDiscount) {
    discount = this.maximumDiscount;
  }

  return Math.min(Math.max(discount, 0), bookingAmount);
};

couponSchema.methods.incrementUsage = async function () {
  this.usedCount += 1;
  await this.save();
};

const tenantCouponSchema = couponSchema.plugin(tenantPlugin);
const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", tenantCouponSchema);

export default Coupon;
