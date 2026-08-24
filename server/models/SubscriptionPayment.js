import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const subscriptionPaymentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    plan: { type: String, enum: ["starter", "professional", "business", "enterprise"], required: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "KES", uppercase: true },
    provider: { type: String, enum: ["mpesa", "bank", "manual", "stripe", "paypal"], default: "mpesa" },
    status: { type: String, enum: ["pending", "completed", "failed", "cancelled"], default: "pending", index: true },
    phoneNumber: { type: String, default: "" },
    checkoutRequestID: { type: String, default: "", index: true },
    merchantRequestID: { type: String, default: "" },
    mpesaReceiptNumber: { type: String, default: "", index: true },
    transactionReference: { type: String, default: "", index: true },
    paidAt: { type: Date, default: null },
    periodDays: { type: Number, default: 30, min: 1 },
    failureReason: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

subscriptionPaymentSchema.index({ provider: 1, transactionReference: 1 }, { unique: true, sparse: true, partialFilterExpression: { transactionReference: { $type: "string", $gt: "" } } });
subscriptionPaymentSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

subscriptionPaymentSchema.plugin(tenantPlugin);

export default mongoose.models.SubscriptionPayment || mongoose.model("SubscriptionPayment", subscriptionPaymentSchema);
