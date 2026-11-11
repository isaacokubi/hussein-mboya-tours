/**
 * Purpose: Currency database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Currency.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare currencySchema for use by the surrounding module or function.
const currencySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      index: true,
      required: false,
    },
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    symbol: {
      type: String,
      required: true,
      trim: true,
    },
    exchangeRate: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },
    decimalPlaces: {
      type: Number,
      default: 2,
      min: 0,
      max: 6,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastUpdated: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Perform the side effect or state update expressed on the following line.
currencySchema.index({ isActive: 1 });
// Perform the side effect or state update expressed on the following line.
currencySchema.index({ isDefault: 1 });

// Perform the side effect or state update expressed on the following line.
currencySchema.pre("save", async function (next) {
  // Check the condition (this.isDefault) and run the matching branch.
  if (this.isDefault) {
    // Perform the side effect or state update expressed on the following line.
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }

  // Perform the side effect or state update expressed on the following line.
  this.lastUpdated = new Date();
  // Perform the side effect or state update expressed on the following line.
  next();
});

// Perform the side effect or state update expressed on the following line.
currencySchema.methods.convertFromBase = function (amount) {
  // Return the result of Number() to the caller.
  return Number((amount * this.exchangeRate).toFixed(this.decimalPlaces));
};

// Perform the side effect or state update expressed on the following line.
currencySchema.methods.convertToBase = function (amount) {
  // Return the result of Number() to the caller.
  return Number((amount / this.exchangeRate).toFixed(this.decimalPlaces));
};

// Perform the side effect or state update expressed on the following line.
currencySchema.statics.getDefaultCurrency = function () {
  // Return the result of this.findOne() to the caller.
  return this.findOne({
    isDefault: true,
    isActive: true,
  });
};

// Perform the side effect or state update expressed on the following line.
currencySchema.statics.getActiveCurrencies = function () {
  // Return the result of this.find({ isActive: true }).sort() to the caller.
  return this.find({ isActive: true }).sort({ code: 1 });
};

// Currencies are platform-global system data. They must not be tenant
// filtered or have their unique ISO code partitioned by tenant.
// Perform the side effect or state update expressed on the following line.
tenantPlugin(currencySchema, { global: true });

// Declare Currency for use by the surrounding module or function.
const Currency =
  mongoose.models.Currency ||
  mongoose.model("Currency", currencySchema);

export default Currency;
