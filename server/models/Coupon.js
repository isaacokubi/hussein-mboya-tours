// server/models/Coupon.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| COUPON SCHEMA
|--------------------------------------------------------------------------
*/

const couponSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index:true },
    /*
    |--------------------------------------------------------------------------
    | BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },

    description: {
      type: String,
      default: "",
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | DISCOUNT
    |--------------------------------------------------------------------------
    */

    discountType: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | VALIDITY
    |--------------------------------------------------------------------------
    */

    startDate: {
      type: Date,
      default: Date.now,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | USAGE LIMITS
    |--------------------------------------------------------------------------
    */

    usageLimit: {
      type: Number,
      default: 1,
      min: 1,
    },

    usedCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | MINIMUM ORDER
    |--------------------------------------------------------------------------
    */

    minimumBookingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    maximumDiscount: {
      type: Number,
      default: null,
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    active: {
      type: Boolean,
      default: true,
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
  }
);

/*
|--------------------------------------------------------------------------
| INDEXES
|--------------------------------------------------------------------------
*/


couponSchema.index({
  active: 1,
  expiresAt: 1,
});

couponSchema.index({
  createdAt: -1,
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

couponSchema.virtual("remainingUses").get(function () {
  return Math.max(this.usageLimit - this.usedCount, 0);
});

couponSchema.virtual("expired").get(function () {
  return this.expiresAt < new Date();
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

couponSchema.methods.isExpired = function () {
  return this.expiresAt < new Date();
};

couponSchema.methods.canBeUsed = function () {
  return (
    this.active &&
    !this.isExpired() &&
    this.usedCount < this.usageLimit
  );
};

couponSchema.methods.calculateDiscount = function (bookingAmount) {
  if (!this.canBeUsed()) {
    return 0;
  }

  if (bookingAmount < this.minimumBookingAmount) {
    return 0;
  }

  let discount = 0;

  if (this.discountType === "percentage") {
    discount = (bookingAmount * this.amount) / 100;

    if (
      this.maximumDiscount &&
      discount > this.maximumDiscount
    ) {
      discount = this.maximumDiscount;
    }
  } else {
    discount = this.amount;
  }

  return Math.min(discount, bookingAmount);
};

couponSchema.methods.incrementUsage = async function () {
  this.usedCount += 1;

  await this.save();
};

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const tenantCouponSchema = couponSchema.plugin(tenantPlugin);
const Coupon = mongoose.models.Coupon || mongoose.model("Coupon", tenantCouponSchema);








export default Coupon;