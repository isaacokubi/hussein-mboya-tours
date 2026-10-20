// Import Mongoose to define and validate organization documents.
import mongoose from "mongoose";
// Import the canonical tenant plugin for organization model setup.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Define the schema for each company/organization using the multi-tenant platform.
const organizationSchema = new mongoose.Schema(
  {
    // Optional parent tenant reference; platform-level organization records may not have one.
    tenantId: {
      type: mongoose.Schema.Types.ObjectId, // Store a MongoDB document identifier.
      ref: "Organization", // Reference another organization when hierarchy is used.
      index: true, // Speed up lookups by parent tenant.
      required: false, // Allow top-level organizations to exist without a parent.
    },
    // Public company/tenant name displayed throughout the application.
    name: { type: String, required: true, trim: true, maxlength: 160 },
    // Unique URL-friendly slug used to resolve tenant subdomains and links.
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    // Registered legal name, when it differs from the public display name.
    legalName: { type: String, trim: true, default: "" },
    // URL of the company's logo.
    logoUrl: { type: String, trim: true, default: "" },
    // URL of the browser tab icon for this tenant.
    favicon: { type: String, trim: true, default: "" },
    // Optional color palette applied to tenant-specific frontend theme variables.
    brandColors: {
      primary: { type: String, trim: true, default: "" }, // Main brand color.
      secondary: { type: String, trim: true, default: "" }, // Supporting brand color.
      accent: { type: String, trim: true, default: "" }, // Highlight/action color.
    },
    // Public company website URL.
    websiteUrl: { type: String, trim: true, default: "" },
    // Optional custom domains must be omitted when unset. Explicit null values
    // can still participate in unique indexes depending on the stored index.
    // Custom domain used to resolve the tenant when a company has its own domain.
    domain: { type: String, trim: true, lowercase: true, default: undefined },
    // Customer support email displayed in public pages and communications.
    supportEmail: { type: String, trim: true, lowercase: true, default: "" },
    // Customer support phone number.
    supportPhone: { type: String, trim: true, default: "" },
    // Company postal/street address.
    address: { type: String, trim: true, default: "" },
    // Country where the organization operates.
    country: { type: String, trim: true, default: "Kenya" },
    // Timezone used for tenant-local schedules and date displays.
    timezone: { type: String, trim: true, default: "Africa/Nairobi" },
    // Default currency code used for tenant pricing and payment displays.
    currency: { type: String, trim: true, uppercase: true, default: "KES" },
    // Organization lifecycle state used to allow, suspend or end access.
    status: { type: String, enum: ["active", "suspended", "trial", "cancelled"], default: "trial", index: true },
    // Subscription plan and renewal lifecycle details for this tenant.
    subscription: {
      plan: { type: String, enum: ["starter", "professional", "business", "enterprise"], default: "starter" }, // Tenant subscription tier.
      seats: { type: Number, default: 5, min: 1 }, // Number of users/seats included by configuration.
      trialEndsAt: { type: Date, default: null }, // Date the trial period expires.
      renewsAt: { type: Date, default: null }, // Next renewal date, when applicable.
    },
    // Feature flags controlling which product capabilities are available to this tenant.
    features: {
      payments: { type: Boolean, default: true }, // Enable the payment module.
      mpesa: { type: Boolean, default: true }, // Enable M-Pesa payment support.
      stripe: { type: Boolean, default: true }, // Enable Stripe payment support.
      ai: { type: Boolean, default: false }, // Enable AI features when permitted.
      customDomain: { type: Boolean, default: false }, // Enable custom-domain functionality.
    },
    // Flexible tenant-specific settings that do not have dedicated schema fields.
    settings: { type: mongoose.Schema.Types.Mixed, default: {} },
    // User who created/provisioned the organization, when known.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  // Add createdAt and updatedAt timestamps automatically.
  { timestamps: true }
);

// Enforce uniqueness for supplied custom domains while allowing organizations without a domain.
organizationSchema.index({ domain: 1 }, { unique: true, sparse: true });

// Configure the organization schema as a global collection rather than tenant-filtered data.
tenantPlugin(organizationSchema, { global: true });

// Export the registered organization model.
export default mongoose.model("Organization", organizationSchema);
