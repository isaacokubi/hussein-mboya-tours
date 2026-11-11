/**
 * Purpose: Loyalty Account database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Declare loyaltyAccountSchema for use by the surrounding module or function.
const loyaltyAccountSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  points: { type: Number, default: 0, min: 0 },
  lifetimeEarned: { type: Number, default: 0, min: 0 },
  lifetimeRedeemed: { type: Number, default: 0, min: 0 },
  referralCode: { type: String, required: true, uppercase: true, trim: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
// Perform the side effect or state update expressed on the following line.
loyaltyAccountSchema.index({ tenantId: 1, customerId: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
loyaltyAccountSchema.index({ tenantId: 1, referralCode: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
loyaltyAccountSchema.plugin(tenantPlugin);

export default mongoose.models.LoyaltyAccount || mongoose.model("LoyaltyAccount", loyaltyAccountSchema);
