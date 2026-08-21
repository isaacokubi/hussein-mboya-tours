import mongoose from "mongoose";
import tenantAggregationPlugin from "../utils/tenantAggregationPlugin.js";

const systemSettingSchema = new mongoose.Schema(
  {

    tenantId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Organization",
        index:true,
        required:false
    },
    key: { type: String, unique: true, default: "default", index: true },
    companyName: { type: String, default: "Company", trim: true },
    companyLogo: { type: String, default: "" },
    websiteUrl: { type: String, default: "", trim: true },
    supportEmail: { type: String, default: "", trim: true, lowercase: true },
    supportPhone: { type: String, default: "", trim: true },
    address: { type: String, default: "", trim: true },
    city: { type: String, default: "Nairobi", trim: true },
    country: { type: String, default: "Kenya", trim: true },
    currency: { type: String, default: "KES", trim: true, uppercase: true },
    currencySymbol: { type: String, default: "KSh", trim: true },
    timezone: { type: String, default: "Africa/Nairobi" },
    language: { type: String, default: "en", trim: true },
    taxRate: { type: Number, default: 0, min: 0, max: 100 },
    bookingDepositPercentage: { type: Number, default: 30, min: 0, max: 100 },
    defaultCommissionRate: { type: Number, default: 10, min: 0, max: 100 },
    maintenanceMode: { type: Boolean, default: false },
    allowRegistrations: { type: Boolean, default: true },
    allowAgentRegistrations: { type: Boolean, default: true },
    requireEmailVerification: { type: Boolean, default: true },
    requirePhoneVerification: { type: Boolean, default: false },
    enableMpesa: { type: Boolean, default: true },
    enableStripe: { type: Boolean, default: false },
    enablePaypal: { type: Boolean, default: false },
    enableBankTransfer: { type: Boolean, default: true },
    bankName: { type: String, default: "", trim: true },
    bankAccountName: { type: String, default: "", trim: true },
    bankAccountNumber: { type: String, default: "", trim: true },
    bankBranch: { type: String, default: "", trim: true },
    bankSwiftCode: { type: String, default: "", trim: true },
    emailFromName: { type: String, default: "Company", trim: true },
    emailFromAddress: { type: String, default: "", trim: true, lowercase: true },
    facebook: { type: String, default: "", trim: true },
    instagram: { type: String, default: "", trim: true },
    twitter: { type: String, default: "", trim: true },
    youtube: { type: String, default: "", trim: true },
    seoTitle: { type: String, default: "", trim: true },
    seoDescription: { type: String, default: "", trim: true },
    seoKeywords: { type: [String], default: [] },
    bookingNotifications: { type: Boolean, default: true },
    paymentNotifications: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const SystemSetting =
  mongoose.models.SystemSetting ||
  mongoose.model("SystemSetting", systemSettingSchema);








export default SystemSetting;