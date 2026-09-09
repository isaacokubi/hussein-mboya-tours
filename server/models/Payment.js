// server/models/Payment.js

import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import Invoice from "./Invoice.js";
import Commission from "./Commission.js";

const paymentSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
    provider: { type: String, enum: ["MPESA", "STRIPE", "PAYPAL", "PESAPAL", "BANK", "CASH"], default: "MPESA" },
    method: { type: String, enum: ["mpesa", "card", "paypal", "pesapal", "bank", "cash"], default: "mpesa" },
    paymentMethod: { type: String, enum: ["MPESA", "CARD", "PAYPAL", "PESAPAL", "BANK_TRANSFER", "CASH", "M-Pesa", "Cash", "Card", "Bank", "PayPal", "Pesapal"], default: "MPESA" },
    amount: { type: Number, required: true, min: 0, validate: { validator: (value) => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1000000000, message: "Invalid payment amount." } },
    currency: { type: String, default: "KES", uppercase: true, trim: true },
    phone: { type: String, trim: true, default: "" },
    phoneNumber: { type: String, trim: true, default: "" },
    status: { type: String, enum: ["pending", "processing", "completed", "failed", "cancelled", "refunded"], default: "pending" },
    transactionId: { type: String, trim: true, default: "" },
    transactionReference: { type: String, trim: true, default: "" },
    invoiceNumber: { type: String, trim: true, default: "" },
    merchantRequestID: String,
    merchantRequestId: String,
    checkoutRequestID: String,
    checkoutRequestId: String,
    mpesaReceiptNumber: String,
    transactionDate: String,
    callbackResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    providerQueryResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    providerResultCode: { type: String, default: "" },
    lastQueriedAt: { type: Date, default: null },
    callbackReceivedAt: { type: Date, default: null },
    callbackEventId: { type: String, trim: true, default: "" },
    failureReason: { type: String, default: "" },
    failedAt: { type: Date, default: null },
    refundRequestedAt: { type: Date },
    refundStatus: { type: String, enum: ["none", "requested", "processing", "completed", "failed"], default: "none" },
    refundReference: { type: String, default: "" },
    refundResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
    refundedAmount: { type: Number, default: 0, min: 0 },
    refundRequestedAmount: { type: Number, default: 0, min: 0 },
    refundedAt: { type: Date, default: null },
    paidAt: Date,
    notes: { type: String, default: "", trim: true },
    webhookRetryCount: { type: Number, default: 0, min: 0 },
    lastWebhookRetryAt: { type: Date, default: null },
    nextWebhookRetryAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

paymentSchema.virtual("isSuccessful").get(function () { return this.status === "completed"; });
paymentSchema.virtual("isRefunded").get(function () { return this.refundStatus === "completed"; });
paymentSchema.virtual("netAmount").get(function () { return Math.max(0, Number(this.amount || 0) - Number(this.refundedAmount || 0)); });

paymentSchema.index({ customer: 1, createdAt: -1 });
paymentSchema.index({ booking: 1 });
paymentSchema.index({ status: 1, provider: 1 });
paymentSchema.index({ transactionId: 1 });
paymentSchema.index({ transactionReference: 1 });
paymentSchema.index({ tenantId: 1, provider: 1, transactionReference: 1 }, { unique: true, partialFilterExpression: { status: "completed", transactionReference: { $type: "string", $gt: "" } } });
paymentSchema.index({ tenantId: 1, checkoutRequestID: 1 }, { unique: true, partialFilterExpression: { checkoutRequestID: { $type: "string", $gt: "" } } });
paymentSchema.index({ tenantId: 1, checkoutRequestId: 1 }, { unique: true, partialFilterExpression: { checkoutRequestId: { $type: "string", $gt: "" } } });
paymentSchema.index({ tenantId: 1, mpesaReceiptNumber: 1 }, { unique: true, partialFilterExpression: { mpesaReceiptNumber: { $type: "string", $gt: "" } } });
paymentSchema.index({ tenantId: 1, booking: 1, createdAt: -1 });
paymentSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
paymentSchema.index({ tenantId: 1, callbackEventId: 1 }, { unique: true, partialFilterExpression: { callbackEventId: { $type: "string", $gt: "" } } });

paymentSchema.methods.markCompleted = function (receiptNumber, transactionId = "") { this.status = "completed"; this.mpesaReceiptNumber = receiptNumber; this.transactionId = transactionId; this.paidAt = new Date(); return this.save(); };
paymentSchema.methods.markFailed = function (reason) { this.status = "failed"; this.failureReason = reason; this.failedAt = new Date(); return this.save(); };

paymentSchema.post("save", async function () {
  if (!this.tenantId || !this.booking) return;
  if (!["completed", "refunded"].includes(this.status) && this.refundStatus !== "completed") return;

  const session = typeof this.$session === "function" ? this.$session() : null;
  const queryOptions = session ? { session } : {};
  const PaymentModel = this.constructor;
  const bookingId = this.booking;

  const [invoice, payments, commission] = await Promise.all([
    Invoice.findOne({ tenantId: this.tenantId, booking: bookingId, isDeleted: { $ne: true } }, null, queryOptions),
    PaymentModel.find({ tenantId: this.tenantId, booking: bookingId, status: { $in: ["completed", "refunded"] } }, null, queryOptions)
      .select("amount status refundedAmount refundStatus paymentMethod transactionReference transactionId mpesaReceiptNumber invoiceNumber updatedAt"),
    Commission.findOne({ tenantId: this.tenantId, booking: bookingId, isDeleted: { $ne: true } }, null, queryOptions),
  ]);

  const totalPaid = payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0);
  const totalRefunded = payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.refundedAmount || 0)), 0);

  if (invoice) {
    const totalAmount = Number(invoice.totalAmount || 0);
    const amountPaid = Math.min(totalAmount, Math.max(0, totalPaid));
    invoice.amountPaid = amountPaid;
    invoice.balance = Math.max(0, totalAmount - amountPaid);
    if (amountPaid <= 0) invoice.status = totalRefunded > 0 ? "refunded" : "pending";
    else if (amountPaid >= totalAmount && totalAmount > 0) invoice.status = "paid";
    else invoice.status = "partial";
    const latestPayment = payments.slice().sort((a, b) => Number(new Date(b.updatedAt || 0)) - Number(new Date(a.updatedAt || 0)))[0];
    if (latestPayment) {
      invoice.paymentMethod = latestPayment.paymentMethod || invoice.paymentMethod;
      invoice.paymentReference = latestPayment.mpesaReceiptNumber || latestPayment.transactionReference || latestPayment.transactionId || invoice.paymentReference;
    }
    await invoice.save(queryOptions);
  }

  if (commission) {
    const bookingAmount = Number(commission.bookingAmount || 0);
    const rate = Number(commission.rate || 0);
    const proportionalRefund = bookingAmount > 0 ? Math.min(Number(commission.amount || 0), (totalRefunded * rate) / 100) : 0;
    const nextRefunded = Number(proportionalRefund.toFixed(2));
    if (nextRefunded !== Number(commission.refundedAmount || 0)) {
      commission.refundedAmount = nextRefunded;
      commission.adjustmentAmount = nextRefunded;
      commission.adjustmentStatus = nextRefunded > 0 ? "posted" : "none";
      commission.adjustmentAt = nextRefunded > 0 ? new Date() : null;
      commission.financeNotes = nextRefunded > 0
        ? `Commission adjustment posted: KES ${nextRefunded.toFixed(2)} due to booking refund.`
        : commission.financeNotes;
      await commission.save(queryOptions);
    }
  }
});

const tenantPaymentSchema = paymentSchema.plugin(tenantPlugin);
const Payment = mongoose.models.Payment || mongoose.model("Payment", tenantPaymentSchema);
export default Payment;
