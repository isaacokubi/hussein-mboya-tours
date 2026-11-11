/**
 * Purpose: Payment Link database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load crypto so this module can use its exported dependencies.
import crypto from "crypto";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare paymentLinkSchema for use by the surrounding module or function.
const paymentLinkSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  token: { type: String, required: true, unique: true, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, index: true },
  invoice: { type: mongoose.Schema.Types.ObjectId, ref: "Invoice", default: null },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: "KES", uppercase: true, trim: true },
  status: { type: String, enum: ["active", "paid", "expired", "cancelled"], default: "active", index: true },
  expiresAt: { type: Date, default: null, index: true },
  usedAt: { type: Date, default: null },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
// Perform the side effect or state update expressed on the following line.
paymentLinkSchema.statics.generateToken = () => crypto.randomBytes(24).toString("base64url");
// Perform the side effect or state update expressed on the following line.
paymentLinkSchema.plugin(tenantPlugin);
export default mongoose.models.PaymentLink || mongoose.model("PaymentLink", paymentLinkSchema);
