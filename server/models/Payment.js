// server/models/Payment.js

// Mongoose defines the payment schema and database model.
import mongoose from "mongoose";
// Apply tenant-aware query and write protections to this schema.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Queue external webhook notifications after payment lifecycle changes.
import { queueWebhookEvent } from "../services/webhookDeliveryService.js";
// Post confirmed payment/refund effects to the operational accounting ledger.
import { postPaymentToLedger } from "../services/operationalAccountingService.js";
// Synchronize invoices for hospitality bookings when their payment state changes.
import { syncHospitalityInvoicePayments } from "../services/hospitalityInvoiceService.js";
// Load invoices so payment changes can update invoice balances.
import Invoice from "./Invoice.js";
// Load commissions so refunds can adjust earned commission values.
import Commission from "./Commission.js";

const paymentSchema = new mongoose.Schema({
  // Organization that owns this payment; required for tenant isolation.
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },

  // Customer account associated with the payment.
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },

  // User account associated with the payment, when known.
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Tour booking this payment applies to.
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },

  // Hotel/airport-transfer booking associated with a hospitality payment.
  hospitalityBooking: { type: mongoose.Schema.Types.ObjectId, refPath: "hospitalityBookingModel", default: null, index: true },

  // Model name used to resolve the hospitality booking reference.
  hospitalityBookingModel: { type: String, enum: ["HotelBooking", "AirportTransferBooking"], default: null },

  // Hospitality workflow type associated with this payment.
  hospitalityType: { type: String, enum: ["hotel", "airport_transfer"], default: null, index: true },

  // Payment provider that processed or records the transaction.
  provider: { type: String, enum: ["MPESA", "STRIPE", "PAYPAL", "PESAPAL", "BANK", "CASH"], default: "MPESA" },

  // Lowercase canonical payment method used by older client/API contracts.
  method: { type: String, enum: ["mpesa", "card", "paypal", "pesapal", "bank", "cash"], default: "mpesa" },

  // Display/API payment method label retained for compatibility.
  paymentMethod: { type: String, enum: ["MPESA", "CARD", "PAYPAL", "PESAPAL", "BANK_TRANSFER", "CASH", "M-Pesa", "Cash", "Card", "Bank", "PayPal", "Pesapal"], default: "MPESA" },

  // Gross amount expected or received for this payment.
  amount: { type: Number, required: true, min: 0, validate: { validator: (value) => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1000000000, message: "Invalid payment amount." } },

  // Fee amount recorded for the payment.
  feeAmount: { type: Number, default: 0, min: 0 },

  // Compatibility field for payment-processing fees.
  paymentFee: { type: Number, default: 0, min: 0 },

  // Compatibility field for transaction fees.
  transactionFee: { type: Number, default: 0, min: 0 },

  // Fee charged or recorded by the payment gateway.
  gatewayFee: { type: Number, default: 0, min: 0 },

  // ISO-style currency code for the payment amount.
  currency: { type: String, default: "KES", uppercase: true, trim: true },

  // Payer phone number retained for compatibility.
  phone: { type: String, trim: true, default: "" },

  // Phone number used for the payment request.
  phoneNumber: { type: String, trim: true, default: "" },

  // Lifecycle status of the payment transaction.
  status: { type: String, enum: ["pending", "processing", "completed", "failed", "cancelled", "refunded"], default: "pending" },

  // Provider or internal transaction identifier.
  transactionId: { type: String, trim: true, default: "" },

  // Reference used to reconcile the transaction.
  transactionReference: { type: String, trim: true, default: "" },

  // Invoice reference associated with this payment.
  invoiceNumber: { type: String, trim: true, default: "" },

  // Daraja merchant request identifier.
  merchantRequestID: String,

  // Legacy-cased merchant request identifier.
  merchantRequestId: String,

  // Daraja checkout request identifier used for callback/status matching.
  checkoutRequestID: String,

  // Legacy-cased checkout request identifier.
  checkoutRequestId: String,

  // M-Pesa receipt number supplied after a successful payment.
  mpesaReceiptNumber: String,

  // Provider-reported transaction date/time.
  transactionDate: String,

  // Raw callback payload retained for reconciliation and audit.
  callbackResponse: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Provider status-query payload retained for reconciliation.
  providerQueryResponse: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Provider result code from callback or status query.
  providerResultCode: { type: String, default: "" },

  // Time the provider status was last queried.
  lastQueriedAt: { type: Date, default: null },

  // Time a provider callback was received.
  callbackReceivedAt: { type: Date, default: null },

  // Identifier used to recognize a callback event.
  callbackEventId: { type: String, trim: true, default: "" },

  // Human-readable reason for a failed payment.
  failureReason: { type: String, default: "" },

  // Time the payment was marked failed.
  failedAt: { type: Date, default: null },

  // Time a refund was requested.
  refundRequestedAt: { type: Date },

  // Lifecycle state of the refund workflow.
  refundStatus: { type: String, enum: ["none", "requested", "processing", "completed", "failed"], default: "none" },

  // Reference assigned to the refund request.
  refundReference: { type: String, default: "" },

  // Provider response retained for refund reconciliation.
  refundResponse: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Total amount refunded against this payment.
  refundedAmount: { type: Number, default: 0, min: 0 },

  // Amount requested for refund.
  refundRequestedAmount: { type: Number, default: 0, min: 0 },

  // Time the refund was completed.
  refundedAt: { type: Date, default: null },

  // Time the payment was confirmed as paid.
  paidAt: Date,

  // Internal notes attached to the payment record.
  notes: { type: String, default: "", trim: true },

  // Number of attempts made to deliver related webhook events.
  webhookRetryCount: { type: Number, default: 0, min: 0 },

  // Time of the most recent webhook retry.
  lastWebhookRetryAt: { type: Date, default: null },

  // Scheduled time for the next webhook retry.
  nextWebhookRetryAt: { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Expose a computed boolean for callers that need to check successful completion.
paymentSchema.virtual("isSuccessful").get(function () { return this.status === "completed"; });
// Expose whether the refund workflow has reached its completed state.
paymentSchema.virtual("isRefunded").get(function () { return this.refundStatus === "completed"; });
// Compute the remaining net payment after refunds, never returning a negative amount.
paymentSchema.virtual("netAmount").get(function () { return Math.max(0, Number(this.amount || 0) - Number(this.refundedAmount || 0)); });
paymentSchema.index({ customer: 1, createdAt: -1 }); paymentSchema.index({ booking: 1 }); paymentSchema.index({ status: 1, provider: 1 }); paymentSchema.index({ transactionId: 1 }); paymentSchema.index({ transactionReference: 1 });
paymentSchema.index({ tenantId: 1, provider: 1, transactionReference: 1 }, { unique: true, partialFilterExpression: { status: "completed", transactionReference: { $type: "string", $gt: "" } } });
paymentSchema.index({ tenantId: 1, checkoutRequestID: 1 }, { unique: true, partialFilterExpression: { checkoutRequestID: { $type: "string", $gt: "" } } }); paymentSchema.index({ tenantId: 1, checkoutRequestId: 1 }, { unique: true, partialFilterExpression: { checkoutRequestId: { $type: "string", $gt: "" } } }); paymentSchema.index({ tenantId: 1, mpesaReceiptNumber: 1 }, { unique: true, partialFilterExpression: { mpesaReceiptNumber: { $type: "string", $gt: "" } } }); paymentSchema.index({ tenantId: 1, booking: 1, createdAt: -1 }); paymentSchema.index({ tenantId: 1, status: 1, createdAt: -1 }); paymentSchema.index({ tenantId: 1, callbackEventId: 1 }, { unique: true, partialFilterExpression: { callbackEventId: { $type: "string", $gt: "" } } });

paymentSchema.pre("save", function (next) { this.$statusWasModified = this.isModified("status"); next(); });
paymentSchema.methods.markCompleted = function (receiptNumber, transactionId = "") { this.status = "completed"; this.mpesaReceiptNumber = receiptNumber; this.transactionId = transactionId; this.paidAt = new Date(); return this.save(); };
paymentSchema.methods.markFailed = function (reason) { this.status = "failed"; this.failureReason = reason; this.failedAt = new Date(); return this.save(); };

// After saving, synchronize confirmed hospitality payments with their invoices and ledger.
paymentSchema.post("save", async function () {
  try {
    if (this.tenantId && (this.booking || this.hospitalityBooking) && this.$statusWasModified && ["completed", "failed"].includes(this.status)) {
      await queueWebhookEvent({ tenantId: this.tenantId, event: `payment.${this.status}`, sourceId: String(this._id), data: { id: this._id, booking: this.booking || null, hospitalityBooking: this.hospitalityBooking || null, hospitalityType: this.hospitalityType || null, status: this.status, amount: this.amount, currency: this.currency || "KES", provider: this.provider, paymentMethod: this.paymentMethod || this.method, transactionId: this.transactionId || "", transactionReference: this.transactionReference || "", mpesaReceiptNumber: this.mpesaReceiptNumber || "", paidAt: this.paidAt || null, failureReason: this.status === "failed" ? this.failureReason || "" : "", updatedAt: this.updatedAt } });
    }
  } catch (webhookError) { console.error("PAYMENT WEBHOOK QUEUE ERROR:", webhookError.message); }
  if (!this.tenantId || !this.booking) return;
  if (!["completed", "refunded"].includes(this.status) && this.refundStatus !== "completed") return;
  const session = typeof this.$session === "function" ? this.$session() : null; const queryOptions = session ? { session } : {}; const PaymentModel = this.constructor; const bookingId = this.booking;
  if (this.status === "completed" && this.$statusWasModified) { try { await postPaymentToLedger(this, { session }); } catch (ledgerError) { console.error("PAYMENT GL POSTING ERROR:", ledgerError.message); } }
  const [invoice, payments, commission] = await Promise.all([
    Invoice.findOne({ tenantId: this.tenantId, booking: bookingId, isDeleted: { $ne: true } }, null, queryOptions),
    PaymentModel.find({ tenantId: this.tenantId, booking: bookingId, status: { $in: ["completed", "refunded"] } }, null, queryOptions).select("amount status refundedAmount refundStatus paymentMethod transactionReference transactionId mpesaReceiptNumber invoiceNumber updatedAt feeAmount paymentFee transactionFee gatewayFee"),
    Commission.findOne({ tenantId: this.tenantId, booking: bookingId, isDeleted: { $ne: true } }, null, queryOptions),
  ]);
  const totalPaid = payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0); const totalRefunded = payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.refundedAmount || 0)), 0);
  if (invoice) { const totalAmount = Number(invoice.totalAmount || 0); const amountPaid = Math.min(totalAmount, Math.max(0, totalPaid)); invoice.amountPaid = amountPaid; invoice.balance = Math.max(0, totalAmount - amountPaid); if (amountPaid <= 0) invoice.status = totalRefunded > 0 ? "refunded" : "pending"; else if (amountPaid >= totalAmount && totalAmount > 0) invoice.status = "paid"; else invoice.status = "partial"; const latestPayment = payments.slice().sort((a, b) => Number(new Date(b.updatedAt || 0)) - Number(new Date(a.updatedAt || 0)))[0]; if (latestPayment) { invoice.paymentMethod = latestPayment.paymentMethod || invoice.paymentMethod; invoice.paymentReference = latestPayment.mpesaReceiptNumber || latestPayment.transactionReference || latestPayment.transactionId || invoice.paymentReference; } await invoice.save(queryOptions); }
  if (commission) { const bookingAmount = Number(commission.bookingAmount || 0); const rate = Number(commission.rate || 0); const proportionalRefund = bookingAmount > 0 ? Math.min(Number(commission.amount || 0), (totalRefunded * rate) / 100) : 0; const nextRefunded = Number(proportionalRefund.toFixed(2)); if (nextRefunded !== Number(commission.refundedAmount || 0)) { commission.refundedAmount = nextRefunded; commission.adjustmentAmount = nextRefunded; commission.adjustmentStatus = nextRefunded > 0 ? "posted" : "none"; commission.adjustmentAt = nextRefunded > 0 ? new Date() : null; commission.financeNotes = nextRefunded > 0 ? `Commission adjustment posted: KES ${nextRefunded.toFixed(2)} due to booking refund.` : commission.financeNotes; await commission.save(queryOptions); } }
  try { const BookingModel = mongoose.models.Booking; const CorporateAccountModel = mongoose.models.CorporateAccount; if (BookingModel && CorporateAccountModel) { const booking = await BookingModel.findOne({ tenantId: this.tenantId, _id: bookingId }).select("corporateAccount").lean(); if (booking?.corporateAccount) { const corporateBookings = await BookingModel.find({ tenantId: this.tenantId, corporateAccount: booking.corporateAccount, isDeleted: { $ne: true }, status: { $nin: ["cancelled", "refunded"] } }).select("_id totalAmount").lean(); const corporateBookingIds = corporateBookings.map((item) => item._id); const corporatePayments = corporateBookingIds.length ? await PaymentModel.aggregate([{ $match: { tenantId: this.tenantId, booking: { $in: corporateBookingIds }, status: { $in: ["completed", "refunded"] } } }, { $project: { net: { $max: [0, { $subtract: ["$amount", { $ifNull: ["$refundedAmount", 0] }] }] } } }, { $group: { _id: null, total: { $sum: "$net" } } }]) : []; const exposure = Math.max(0, corporateBookings.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0) - Number(corporatePayments[0]?.total || 0)); await CorporateAccountModel.updateOne({ tenantId: this.tenantId, _id: booking.corporateAccount }, { $set: { currentBalance: Math.round(exposure * 100) / 100 } }, queryOptions); } } } catch (corporateSyncError) { console.error("CORPORATE BALANCE SYNC ERROR:", corporateSyncError.message); }
});

paymentSchema.post("save", async function () {
  if (!this.tenantId || !this.hospitalityBooking || !this.hospitalityType) return;
  if (!["completed", "refunded"].includes(this.status) && this.refundStatus !== "completed") return;
  try {
    if (this.status === "completed" && this.$statusWasModified) await postPaymentToLedger(this);
    const Model = this.hospitalityBookingModel === "HotelBooking" ? mongoose.models.HotelBooking : mongoose.models.AirportTransferBooking;
    const booking = Model ? await Model.findOne({ tenantId: this.tenantId, _id: this.hospitalityBooking }) : null;
    if (booking) await syncHospitalityInvoicePayments({ type: this.hospitalityType, booking });
  } catch (error) { console.error("HOSPITALITY PAYMENT FINANCE SYNC ERROR:", error.message); }
});

// Attach tenant isolation to the payment schema before model registration.
const tenantPaymentSchema = paymentSchema.plugin(tenantPlugin);
// Reuse an already-registered model during hot reloads, or register it once.
const Payment = mongoose.models.Payment || mongoose.model("Payment", tenantPaymentSchema);
// Export the model used by payment controllers and services.
export default Payment;
