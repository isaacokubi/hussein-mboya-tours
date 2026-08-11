import mongoose from "mongoose";

const systemSettingSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      unique: true,
      default: "default",
      index: true,
    },
    companyName: {
      type: String,
      default: "Coherent Tours",
      trim: true,
    },
    supportEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    supportPhone: {
      type: String,
      default: "+254 733 439 362",
      trim: true,
    },
    currency: {
      type: String,
      default: "KES",
      trim: true,
      uppercase: true,
    },
    timezone: {
      type: String,
      default: "Africa/Nairobi",
      trim: true,
    },
    bookingNotifications: {
      type: Boolean,
      default: true,
    },
    paymentNotifications: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const SystemSetting =
  mongoose.models.SystemSetting ||
  mongoose.model("SystemSetting", systemSettingSchema);

export default SystemSetting;
