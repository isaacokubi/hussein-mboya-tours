/**
 * Purpose: Promotion database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Promotion.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
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

// Declare promotionSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
promotionSchema.index({
  active: 1,
  startDate: 1,
  endDate: 1,
});

// Perform the side effect or state update expressed on the following line.
promotionSchema.index({
  audience: 1,
});

// Perform the side effect or state update expressed on the following line.
promotionSchema.index({
  tours: 1,
});

/*
|--------------------------------------------------------------------------
| VIRTUALS
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
promotionSchema.virtual("isExpired").get(function () {
  // Return the expression shown below to the caller.
  return this.endDate < new Date();
});

// Perform the side effect or state update expressed on the following line.
promotionSchema.virtual("isStarted").get(function () {
  // Return the expression shown below to the caller.
  return this.startDate <= new Date();
});

// Perform the side effect or state update expressed on the following line.
promotionSchema.virtual("isAvailable").get(function () {
  // Declare now for use by the surrounding module or function.
  const now = new Date();

  // Declare withinDate for use by the surrounding module or function.
  const withinDate =
    now >= this.startDate &&
    now <= this.endDate;

  // Declare underLimit for use by the surrounding module or function.
  const underLimit =
    this.usageLimit === 0 ||
    this.usageCount < this.usageLimit;

  // Return the expression shown below to the caller.
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

// Perform the side effect or state update expressed on the following line.
promotionSchema.methods.incrementUsage = function () {
  // Perform the side effect or state update expressed on the following line.
  this.usageCount += 1;
  // Return the result of this.save() to the caller.
  return this.save();
};

// Perform the side effect or state update expressed on the following line.
promotionSchema.methods.calculateDiscount = function (amount) {
  // Check the condition (this.discountType === "percentage") and run the matching branch.
  if (this.discountType === "percentage") {
    // Declare discount for use by the surrounding module or function.
    let discount = (amount * this.discountValue) / 100;

    // Check the condition (this.maxDiscount && discount > this.maxDiscount) and run the matching branch.
    if (
      this.maxDiscount &&
      discount > this.maxDiscount
    ) {
      // Perform the side effect or state update expressed on the following line.
      discount = this.maxDiscount;
    }

    // Return the value of discount to the caller.
    return discount;
  }

  // Return the result of Math.min() to the caller.
  return Math.min(this.discountValue, amount);
};

/*
|--------------------------------------------------------------------------
| MODEL
|--------------------------------------------------------------------------
*/

// Declare tenantPromotionSchema for use by the surrounding module or function.
const tenantPromotionSchema = promotionSchema.plugin(tenantPlugin);
// Declare Promotion for use by the surrounding module or function.
const Promotion = mongoose.models.Promotion || mongoose.model("Promotion", tenantPromotionSchema);








export default Promotion;
