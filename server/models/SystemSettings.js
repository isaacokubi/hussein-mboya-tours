// server/models/SystemSetting.js

import mongoose from "mongoose";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

/*
|--------------------------------------------------------------------------
| SYSTEM SETTINGS SCHEMA
|--------------------------------------------------------------------------
|
| Stores global application configuration.
| Only one document should normally exist.
|
*/

const systemSettingsSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    /*
    |--------------------------------------------------------------------------
    | COMPANY INFORMATION
    |--------------------------------------------------------------------------
    */

    companyName: {
      type: String,
      required: true,
      trim: true,
      default: "Company",
    },

    companyLogo: {
      type: String,
      default: "",
    },

    websiteUrl: {
      type: String,
      trim: true,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | CONTACT DETAILS
    |--------------------------------------------------------------------------
    */

    supportEmail: {
      type: String,
      trim: true,
      lowercase: true,
      default: "",
    },

    supportPhone: {
      type: String,
      trim: true,
      default: "",
    },

    address: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "Nairobi",
    },

    country: {
      type: String,
      trim: true,
      default: "Kenya",
    },

    /*
    |--------------------------------------------------------------------------
    | REGIONAL SETTINGS
    |--------------------------------------------------------------------------
    */

    currency: {
      type: String,
      uppercase: true,
      trim: true,
      default: "KES",
    },

    currencySymbol: {
      type: String,
      default: "KSh",
    },

    timezone: {
      type: String,
      default: "Africa/Nairobi",
    },

    language: {
      type: String,
      default: "en",
    },

    /*
    |--------------------------------------------------------------------------
    | BUSINESS SETTINGS
    |--------------------------------------------------------------------------
    */

    taxRate: {
      type: Number,
      default: 0,
      min: 0,
    },

    bookingDepositPercentage: {
      type: Number,
      default: 30,
      min: 0,
      max: 100,
    },

    defaultCommissionRate: {
      type: Number,
      default: 10,
      min: 0,
      max: 100,
    },

    /*
    |--------------------------------------------------------------------------
    | APPLICATION SETTINGS
    |--------------------------------------------------------------------------
    */

    maintenanceMode: {
      type: Boolean,
      default: false,
    },

    allowRegistrations: {
      type: Boolean,
      default: true,
    },

    allowAgentRegistrations: {
      type: Boolean,
      default: true,
    },

    requireEmailVerification: {
      type: Boolean,
      default: true,
    },

    requirePhoneVerification: {
      type: Boolean,
      default: false,
    },

    /*
    |--------------------------------------------------------------------------
    | PAYMENT SETTINGS
    |--------------------------------------------------------------------------
    */

    enableMpesa: {
      type: Boolean,
      default: true,
    },

    enableStripe: {
      type: Boolean,
      default: false,
    },

    enablePaypal: {
      type: Boolean,
      default: false,
    },

    enableBankTransfer: { type: Boolean, default: true },
    bankName: { type: String, default: "" },
    bankAccountName: { type: String, default: "" },
    bankAccountNumber: { type: String, default: "" },
    bankBranch: { type: String, default: "" },
    bankSwiftCode: { type: String, default: "" },

    /*
    |--------------------------------------------------------------------------
    | EMAIL SETTINGS
    |--------------------------------------------------------------------------
    */

    emailFromName: {
      type: String,
      default: "Company",
    },

    emailFromAddress: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | SOCIAL MEDIA
    |--------------------------------------------------------------------------
    */

    facebook: {
      type: String,
      default: "",
    },

    instagram: {
      type: String,
      default: "",
    },

    twitter: {
      type: String,
      default: "",
    },

    youtube: {
      type: String,
      default: "",
    },

    /*
    |--------------------------------------------------------------------------
    | SEO SETTINGS
    |--------------------------------------------------------------------------
    */

    seoTitle: {
      type: String,
      default: "",
    },

    seoDescription: {
      type: String,
      default: "",
    },

    seoKeywords: [
      {
        type: String,
        trim: true,
      },
    ],
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

systemSettingsSchema.index({
  maintenanceMode: 1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

const SystemSettings =
  mongoose.models.SystemSettings ||
  mongoose.model("SystemSettings", systemSettingsSchema);








export default SystemSettings;
