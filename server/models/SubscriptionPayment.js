import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// This model tracks platform subscription charges separately from customer booking/hospitality payments.
const subscriptionPaymentSchema = new mongoose.Schema(
  {
    // Every subscription charge belongs to one tenant; queries must always include this scope.
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    plan: { type: String, enum: ["starter", "professional", "business", "enterprise"], required: true },
    amount: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "KES", uppercase: true },
    provider: { type: String, enum: ["mpesa", "bank", "manual", "stripe", "paypal"], default: "mpesa" },
    // Only the verified callback may confirm success; reconciliation can safely mark provider-confirmed failures/cancellations.
    status: { type: String, enum: ["pending", "completed", "failed", "cancelled"], default: "pending", index: true },
    phoneNumber: { type: String, default: "" },
    checkoutRequestID: { type: String, default: "", index: true },
    merchantRequestID: { type: String, default: "" },
    mpesaReceiptNumber: { type: String, default: "", index: true },
    transactionReference: { type: String, default: "", index: true },
    paidAt: { type: Date, default: null },
    // Throttle status polling so a client polling every few seconds does not query Daraja on every request.
    lastQueriedAt: { type: Date, default: null },
    providerQueryResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    periodDays: { type: Number, default: 30, min: 1 },
    failureReason: { type: String, default: "" },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

// Provider references are used to prevent a single transaction reference being recorded twice.
subscriptionPaymentSchema.index({ provider: 1, transactionReference: 1 }, { unique: true, name: "provider_1_transactionReference_1", partialFilterExpression: { transactionReference: { $type: "string", $gt: "" } } });
subscriptionPaymentSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

// Apply the shared tenant safeguards to model queries and writes.
subscriptionPaymentSchema.plugin(tenantPlugin);

export default mongoose.models.SubscriptionPayment || mongoose.model("SubscriptionPayment", subscriptionPaymentSchema);
