import mongoose from "mongoose";

const organizationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 160 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    legalName: { type: String, trim: true, default: "" },
    logoUrl: { type: String, trim: true, default: "" },
    websiteUrl: { type: String, trim: true, default: "" },
    domain: { type: String, trim: true, lowercase: true, default: null },
    supportEmail: { type: String, trim: true, lowercase: true, default: "" },
    supportPhone: { type: String, trim: true, default: "" },
    country: { type: String, trim: true, default: "Kenya" },
    timezone: { type: String, trim: true, default: "Africa/Nairobi" },
    currency: { type: String, trim: true, uppercase: true, default: "KES" },
    status: { type: String, enum: ["active", "suspended", "trial", "cancelled"], default: "trial", index: true },
    subscription: {
      plan: { type: String, enum: ["starter", "professional", "business", "enterprise"], default: "starter" },
      seats: { type: Number, default: 5, min: 1 },
      trialEndsAt: { type: Date, default: null },
      renewsAt: { type: Date, default: null },
    },
    features: {
      payments: { type: Boolean, default: true },
      mpesa: { type: Boolean, default: true },
      stripe: { type: Boolean, default: true },
      ai: { type: Boolean, default: false },
      customDomain: { type: Boolean, default: false },
    },
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

organizationSchema.index({ domain: 1 }, { unique: true, sparse: true });

export default mongoose.model("Organization", organizationSchema);
