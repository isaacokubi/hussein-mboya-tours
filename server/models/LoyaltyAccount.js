import mongoose from "mongoose";
const loyaltyAccountSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  points: { type: Number, default: 0, min: 0 },
  lifetimeEarned: { type: Number, default: 0, min: 0 },
  lifetimeRedeemed: { type: Number, default: 0, min: 0 },
  referralCode: { type: String, required: true, uppercase: true, trim: true },
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });
loyaltyAccountSchema.index({ tenantId: 1, customerId: 1 }, { unique: true });
loyaltyAccountSchema.index({ tenantId: 1, referralCode: 1 }, { unique: true });
export default mongoose.models.LoyaltyAccount || mongoose.model("LoyaltyAccount", loyaltyAccountSchema);
