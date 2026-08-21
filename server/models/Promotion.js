// server/models/Promotion.js

import mongoose from "mongoose";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| PROMOTION SCHEMA
|--------------------------------------------------------------------------
|
| Used for:
| - Tour discounts
| - Seasonal offers
| - Holiday campaigns
| - Coupon promotions
|
|--------------------------------------------------------------------------
*/

const promotionSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    /*
    |--------------------------------------------------------------------------
    | BASIC INFORMATION
    |--------------------------------------------------------------------------
    */

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    /*
    |--------------------------------------------------------------------------
    | PROMOTION CODE
    |--------------------------------------------------------------------------
    */

    code: {
      type: String,
      trim: true,
      uppercase: true,
      unique: true,
      sparse: true,
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

    discountValue: {
      type: Number,
      required: true,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | MAXIMUM DISCOUNT
    |--------------------------------------------------------------------------
    */

    maxDiscount: {
      type: Number,
      default: null,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | MINIMUM BOOKING AMOUNT
    |--------------------------------------------------------------------------
    */

    minimumBookingAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | VALIDITY
    |--------------------------------------------------------------------------
    */

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    /*
    |--------------------------------------------------------------------------
    | APPLICABLE TOURS
    |--------------------------------------------------------------------------
    */

    tours: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Tour",
      },
    ],

    /*
    |--------------------------------------------------------------------------
    | TARGET AUDIENCE
    |--------------------------------------------------------------------------
    */

    audience: {
      type: String,
      enum: [
        "all",
        "new",
        "returning",
        "vip",
        "corporate",
      ],
      default: "all",
    },

    /*
    |--------------------------------------------------------------------------
    | USAGE LIMITS
    |--------------------------------------------------------------------------
    */

    usageLimit: {
      type: Number,
      default: 0, // 0 = unlimited
      min: 0,
    },

    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    /*
    |--------------------------------------------------------------------------
    | STATUS
    |--------------------------------------------------------------------------
    */

    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    isDeleted: {
      type: Boolean,
      default: false,
      index: true,
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

promotionSchema.index({
  active: 1,
  startDate: 1,
  endDate: 1,
});

promotionSchema.index({
  audience: 1,
});

promotionSchema.index({
  tours: 1,
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

promotionSchema.virtual("isExpired").get(function () {
  return this.endDate < new Date();
});

promotionSchema.virtual("isStarted").get(function () {
  return this.startDate <= new Date();
});

promotionSchema.virtual("isAvailable").get(function () {
  const now = new Date();

  const withinDate =
    now >= this.startDate &&
    now <= this.endDate;

  const underLimit =
    this.usageLimit === 0 ||
    this.usageCount < this.usageLimit;

  return (
    this.active &&
    !this.isDeleted &&
    withinDate &&
    underLimit
  );
});

/*
|--------------------------------------------------------------------------
| METHODS
|--------------------------------------------------------------------------
*/

promotionSchema.methods.incrementUsage = function () {
  this.usageCount += 1;
  return this.save();
};

promotionSchema.methods.calculateDiscount = function (amount) {
  if (this.discountType === "percentage") {
    let discount = (amount * this.discountValue) / 100;

    if (
      this.maxDiscount &&
      discount > this.maxDiscount
    ) {
      discount = this.maxDiscount;
    }

    return discount;
  }

  return Math.min(this.discountValue, amount);
};

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

const Promotion =
  mongoose.models.Promotion ||
  mongoose.model("Promotion", promotionSchema);








export default Promotion;