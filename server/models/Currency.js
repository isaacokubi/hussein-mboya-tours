// server/models/Currency.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

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

currencySchema.index({ isActive: 1 });
currencySchema.index({ isDefault: 1 });

currencySchema.pre("save", async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      { _id: { $ne: this._id } },
      { isDefault: false }
    );
  }

  this.lastUpdated = new Date();
  next();
});

currencySchema.methods.convertFromBase = function (amount) {
  return Number((amount * this.exchangeRate).toFixed(this.decimalPlaces));
};

currencySchema.methods.convertToBase = function (amount) {
  return Number((amount / this.exchangeRate).toFixed(this.decimalPlaces));
};

currencySchema.statics.getDefaultCurrency = function () {
  return this.findOne({
    isDefault: true,
    isActive: true,
  });
};

currencySchema.statics.getActiveCurrencies = function () {
  return this.find({ isActive: true }).sort({ code: 1 });
};

// Currencies are platform-global system data. They must not be tenant
// filtered or have their unique ISO code partitioned by tenant.
tenantPlugin(currencySchema, { global: true });

const Currency =
  mongoose.models.Currency ||
  mongoose.model("Currency", currencySchema);

export default Currency;
