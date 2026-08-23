// server/models/Currency.js

import mongoose from "mongoose";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| CURRENCY SCHEMA
|--------------------------------------------------------------------------
|
| Stores exchange rates used throughout the application.
|
| Examples:
|
| KES
| USD
| EUR
| GBP
|
|--------------------------------------------------------------------------
*/

const currencySchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    /*
    |--------------------------------------------------------------------------
    | ISO CODE
    |--------------------------------------------------------------------------
    */

    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      minlength: 3,
      maxlength: 3,
    },

    /*
    |--------------------------------------------------------------------------
    | CURRENCY NAME
    |--------------------------------------------------------------------------
    */

    name: {
      type: String,
      required: true,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | SYMBOL
    |--------------------------------------------------------------------------
    */

    symbol: {
      type: String,
      required: true,
      trim: true,
    },

    /*
    |--------------------------------------------------------------------------
    | EXCHANGE RATE
    |--------------------------------------------------------------------------
    |
    | Relative to the system base currency.
    |--------------------------------------------------------------------------
    */

    exchangeRate: {
      type: Number,
      required: true,
      min: 0,
      default: 1,
    },

    /*
    |--------------------------------------------------------------------------
    | DECIMAL PLACES
    |--------------------------------------------------------------------------
    */

    decimalPlaces: {
      type: Number,
      default: 2,
      min: 0,
      max: 6,
    },

    /*
    |--------------------------------------------------------------------------
    | DEFAULT CURRENCY
    |--------------------------------------------------------------------------
    */

    isDefault: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | ACTIVE STATUS
    |--------------------------------------------------------------------------
    */

    isActive: {
      type: Boolean,
      default: true,
    },

    /*
    |--------------------------------------------------------------------------
    | LAST RATE UPDATE
    |--------------------------------------------------------------------------
    */

    lastUpdated: {
      type: Date,
      default: Date.now,
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

currencySchema.index({
  isActive: 1,
});

currencySchema.index({
  isDefault: 1,
});

/*
|--------------------------------------------------------------------------
| ENSURE ONLY ONE DEFAULT CURRENCY
|--------------------------------------------------------------------------
*/

currencySchema.pre("save", async function (next) {
  if (this.isDefault) {
    await this.constructor.updateMany(
      {
        _id: { $ne: this._id },
      },
      {
        isDefault: false,
      }
    );
  }

  this.lastUpdated = new Date();

  next();
});

/*
|--------------------------------------------------------------------------
| INSTANCE METHODS
|--------------------------------------------------------------------------
*/

currencySchema.methods.convertFromBase = function (amount) {
  return Number((amount * this.exchangeRate).toFixed(this.decimalPlaces));
};

currencySchema.methods.convertToBase = function (amount) {
  return Number((amount / this.exchangeRate).toFixed(this.decimalPlaces));
};

/*
|--------------------------------------------------------------------------
| STATIC METHODS
|--------------------------------------------------------------------------
*/

currencySchema.statics.getDefaultCurrency = function () {
  return this.findOne({
    isDefault: true,
    isActive: true,
  });
};

currencySchema.statics.getActiveCurrencies = function () {
  return this.find({
    isActive: true,
  }).sort({
    code: 1,
  });
};

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const Currency =
  mongoose.models.Currency ||
  mongoose.model("Currency", currencySchema);








export default Currency;
