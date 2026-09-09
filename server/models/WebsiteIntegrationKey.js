import mongoose from "mongoose";

/**
 * API credentials used by a tenant's existing website to send bookings into
 * the central Travel ERP. This collection is intentionally platform-global:
 * the hash is looked up before a tenant context exists, then the request is
 * switched into the key's tenant context by integrationAuth middleware.
 */
const websiteIntegrationKeySchema = new mongoose.Schema(
  {
    tenantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    keyPrefix: { type: String, required: true, trim: true, index: true },
    keyHash: { type: String, required: true, unique: true, index: true },
    publicKey: { type: String, required: true, unique: true, index: true },
    publicKeyHash: { type: String, required: true, unique: true, index: true },
    active: { type: Boolean, default: true, index: true },
    permissions: {
      type: [String],
      default: ["booking:create", "customer:create", "tour:read"],
    },
    allowedOrigins: { type: [String], default: [] },
    environment: {
      type: String,
      enum: ["test", "live"],
      default: "live",
    },
    lastUsedAt: { type: Date, default: null },
    usageCount: { type: Number, default: 0, min: 0 },
    revokedAt: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true }
);

// No tenantPlugin here: this model must be searchable by keyHash before the
// tenant has been established. Access is protected by the secret key itself.

export default mongoose.models.WebsiteIntegrationKey ||
  mongoose.model("WebsiteIntegrationKey", websiteIntegrationKeySchema);