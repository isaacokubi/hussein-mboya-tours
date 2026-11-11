/**
 * Purpose: System Settings database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/SystemSetting.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../utils/tenantAggregationPlugin.js so this module can use its exported dependencies.
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
/*
|--------------------------------------------------------------------------
| SYSTEM SETTINGS SCHEMA
|--------------------------------------------------------------------------
|
| Stores global application configuration.
| Only one document should normally exist.
|
*/

// Declare systemSettingsSchema for use by the surrounding module or function.
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

// Perform the side effect or state update expressed on the following line.
systemSettingsSchema.index({
  maintenanceMode: 1,
});

/*
|--------------------------------------------------------------------------
| EXPORT MODEL
|--------------------------------------------------------------------------
*/

// Perform the side effect or state update expressed on the following line.
tenantPlugin(systemSettingsSchema);


// Declare SystemSettings for use by the surrounding module or function.
const SystemSettings =
  mongoose.models.SystemSettings ||
  mongoose.model("SystemSettings", systemSettingsSchema);








export default SystemSettings;
