/**
 * Purpose: Payment database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Payment.js

// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../services/webhookDeliveryService.js so this module can use its exported dependencies.
import { queueWebhookEvent } from "../services/webhookDeliveryService.js";
// Load ../services/operationalAccountingService.js so this module can use its exported dependencies.
import { postPaymentToLedger } from "../services/operationalAccountingService.js";
// Load ../services/hospitalityInvoiceService.js so this module can use its exported dependencies.
import { syncHospitalityInvoicePayments } from "../services/hospitalityInvoiceService.js";
// Load ./Invoice.js so this module can use its exported dependencies.
import Invoice from "./Invoice.js";
// Load ./Commission.js so this module can use its exported dependencies.
import Commission from "./Commission.js";

// Declare paymentSchema for use by the surrounding module or function.
const paymentSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  hospitalityBooking: { type: mongoose.Schema.Types.ObjectId, refPath: "hospitalityBookingModel", default: null, index: true },
  hospitalityBookingModel: { type: String, enum: ["HotelBooking", "AirportTransferBooking"], default: null },
  hospitalityType: { type: String, enum: ["hotel", "airport_transfer"], default: null, index: true },
  provider: { type: String, enum: ["MPESA", "STRIPE", "PAYPAL", "PESAPAL", "BANK", "CASH"], default: "MPESA" },
  method: { type: String, enum: ["mpesa", "card", "paypal", "pesapal", "bank", "cash"], default: "mpesa" },
  paymentMethod: { type: String, enum: ["MPESA", "CARD", "PAYPAL", "PESAPAL", "BANK_TRANSFER", "CASH", "M-Pesa", "Cash", "Card", "Bank", "PayPal", "Pesapal"], default: "MPESA" },
  amount: { type: Number, required: true, min: 0, validate: { validator: (value) => Number.isFinite(Number(value)) && Number(value) >= 0 && Number(value) <= 1000000000, message: "Invalid payment amount." } },
  feeAmount: { type: Number, default: 0, min: 0 },
  paymentFee: { type: Number, default: 0, min: 0 },
  transactionFee: { type: Number, default: 0, min: 0 },
  gatewayFee: { type: Number, default: 0, min: 0 },
  currency: { type: String, default: "KES", uppercase: true, trim: true },
  phone: { type: String, trim: true, default: "" },
  phoneNumber: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["pending", "processing", "completed", "failed", "cancelled", "refunded"], default: "pending" },
  activeAttempt: { type: Boolean, default: false, index: true },
  transactionId: { type: String, trim: true, default: "" },
  transactionReference: { type: String, trim: true, default: "" },
  providerOrderId: { type: String, trim: true, default: "", index: true },
  providerCaptureId: { type: String, trim: true, default: "", index: true },
  providerApprovalUrl: { type: String, trim: true, default: "" },
  providerEnvironment: { type: String, enum: ["sandbox", "production", ""], default: "" },
  invoiceNumber: { type: String, trim: true, default: "" },
  merchantRequestID: String, merchantRequestId: String, checkoutRequestID: String, checkoutRequestId: String,
  mpesaReceiptNumber: String, transactionDate: String,
  callbackResponse: { type: mongoose.Schema.Types.Mixed, default: {} }, providerQueryResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
  providerResultCode: { type: String, default: "" }, lastQueriedAt: { type: Date, default: null }, callbackReceivedAt: { type: Date, default: null }, callbackEventId: { type: String, trim: true, default: "" },
  failureReason: { type: String, default: "" }, failedAt: { type: Date, default: null },
  refundRequestedAt: { type: Date }, refundStatus: { type: String, enum: ["none", "requested", "processing", "completed", "failed"], default: "none" }, refundReference: { type: String, default: "" }, refundResponse: { type: mongoose.Schema.Types.Mixed, default: {} }, refundedAmount: { type: Number, default: 0, min: 0 }, refundRequestedAmount: { type: Number, default: 0, min: 0 }, refundedAt: { type: Date, default: null }, paidAt: Date,
  notes: { type: String, default: "", trim: true }, manualConfirmation: { confirmedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, confirmedAt: { type: Date, default: null }, amount: { type: Number, default: null }, currency: { type: String, default: "", uppercase: true, trim: true }, reference: { type: String, default: "", trim: true, maxlength: 200 }, notes: { type: String, default: "", trim: true, maxlength: 1000 } }, webhookRetryCount: { type: Number, default: 0, min: 0 }, lastWebhookRetryAt: { type: Date, default: null }, nextWebhookRetryAt: { type: Date, default: null },
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Perform the side effect or state update expressed on the following line.
paymentSchema.virtual("isSuccessful").get(function () { return this.status === "completed"; });
// Perform the side effect or state update expressed on the following line.
paymentSchema.virtual("isRefunded").get(function () { return this.refundStatus === "completed"; });
// Perform the side effect or state update expressed on the following line.
paymentSchema.virtual("netAmount").get(function () { return Math.max(0, Number(this.amount || 0) - Number(this.refundedAmount || 0)); });
// Perform the side effect or state update expressed on the following line.
paymentSchema.index({ customer: 1, createdAt: -1 }); paymentSchema.index({ booking: 1 }); paymentSchema.index({ status: 1, provider: 1 }); paymentSchema.index({ transactionId: 1 }); paymentSchema.index({ transactionReference: 1 });
// Perform the side effect or state update expressed on the following line.
paymentSchema.index({ tenantId: 1, provider: 1, transactionReference: 1 }, { unique: true, partialFilterExpression: { status: "completed", transactionReference: { $type: "string", $gt: "" } } });
// Perform the side effect or state update expressed on the following line.
paymentSchema.index({ tenantId: 1, provider: 1, providerOrderId: 1 }, { unique: true, partialFilterExpression: { providerOrderId: { $type: "string", $gt: "" } } });
// Perform the side effect or state update expressed on the following line.
paymentSchema.index({ tenantId: 1, booking: 1, provider: 1, activeAttempt: 1 }, { unique: true, partialFilterExpression: { activeAttempt: true }, name: "unique_active_payment_attempt_tenant_booking_provider" });
// Perform the side effect or state update expressed on the following line.
paymentSchema.index({ tenantId: 1, checkoutRequestID: 1 }, { unique: true, partialFilterExpression: { checkoutRequestID: { $type: "string", $gt: "" } } }); paymentSchema.index({ tenantId: 1, checkoutRequestId: 1 }, { unique: true, partialFilterExpression: { checkoutRequestId: { $type: "string", $gt: "" } } }); paymentSchema.index({ tenantId: 1, mpesaReceiptNumber: 1 }, { unique: true, partialFilterExpression: { mpesaReceiptNumber: { $type: "string", $gt: "" } } }); paymentSchema.index({ tenantId: 1, booking: 1, createdAt: -1 }); paymentSchema.index({ tenantId: 1, status: 1, createdAt: -1 }); paymentSchema.index({ tenantId: 1, callbackEventId: 1 }, { unique: true, partialFilterExpression: { callbackEventId: { $type: "string", $gt: "" } } });

// Perform the side effect or state update expressed on the following line.
paymentSchema.pre("save", function (next) { this.$statusWasModified = this.isModified("status"); if (["completed", "failed", "cancelled", "refunded"].includes(this.status)) this.activeAttempt = false; next(); });
// Perform the side effect or state update expressed on the following line.
paymentSchema.methods.markCompleted = function (receiptNumber, transactionId = "") { this.status = "completed"; this.mpesaReceiptNumber = receiptNumber; this.transactionId = transactionId; this.paidAt = new Date(); return this.save(); };
// Perform the side effect or state update expressed on the following line.
paymentSchema.methods.markFailed = function (reason) { this.status = "failed"; this.failureReason = reason; this.failedAt = new Date(); return this.save(); };

// Perform the side effect or state update expressed on the following line.
paymentSchema.post("save", async function () {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (this.tenantId && (this.booking || this.hospitalityBooking) && this.$st) and run the matching branch.
    if (this.tenantId && (this.booking || this.hospitalityBooking) && this.$statusWasModified && ["completed", "failed"].includes(this.status)) {
      // Perform the side effect or state update expressed on the following line.
      await queueWebhookEvent({ tenantId: this.tenantId, event: `payment.${this.status}`, sourceId: String(this._id), data: { id: this._id, booking: this.booking || null, hospitalityBooking: this.hospitalityBooking || null, hospitalityType: this.hospitalityType || null, status: this.status, amount: this.amount, currency: this.currency || "KES", provider: this.provider, paymentMethod: this.paymentMethod || this.method, transactionId: this.transactionId || "", transactionReference: this.transactionReference || "", mpesaReceiptNumber: this.mpesaReceiptNumber || "", paidAt: this.paidAt || null, failureReason: this.status === "failed" ? this.failureReason || "" : "", updatedAt: this.updatedAt } });
    }
  } catch (webhookError) { console.error("PAYMENT WEBHOOK QUEUE ERROR:", webhookError.message); }
  // Check the condition (!this.tenantId || !this.booking) and run the matching branch.
  if (!this.tenantId || !this.booking) return;
  // Check the condition (!["completed", "refunded"].includes(this.status) && this.refundStatus ) and run the matching branch.
  if (!["completed", "refunded"].includes(this.status) && this.refundStatus !== "completed") return;
  // Declare session for use by the surrounding module or function.
  const session = typeof this.$session === "function" ? this.$session() : null; const queryOptions = session ? { session } : {}; const PaymentModel = this.constructor; const bookingId = this.booking;
  // Check the condition (this.status === "completed" && this.$statusWasModified) and run the matching branch.
  if (this.status === "completed" && this.$statusWasModified) { try { await postPaymentToLedger(this, { session }); } catch (ledgerError) { console.error("PAYMENT GL POSTING ERROR:", ledgerError.message); } }
  // Declare [invoice, payments, commission] for use by the surrounding module or function.
  const [invoice, payments, commission] = await Promise.all([
    Invoice.findOne({ tenantId: this.tenantId, booking: bookingId, isDeleted: { $ne: true } }, null, queryOptions),
    PaymentModel.find({ tenantId: this.tenantId, booking: bookingId, status: { $in: ["completed", "refunded"] } }, null, queryOptions).select("amount status refundedAmount refundStatus paymentMethod transactionReference transactionId mpesaReceiptNumber invoiceNumber updatedAt feeAmount paymentFee transactionFee gatewayFee"),
    Commission.findOne({ tenantId: this.tenantId, booking: bookingId, isDeleted: { $ne: true } }, null, queryOptions),
  ]);
  // Declare totalPaid for use by the surrounding module or function.
  const totalPaid = payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.amount || 0) - Number(payment.refundedAmount || 0)), 0); const totalRefunded = payments.reduce((sum, payment) => sum + Math.max(0, Number(payment.refundedAmount || 0)), 0);
  // Check the condition (invoice) and run the matching branch.
  if (invoice) { const totalAmount = Number(invoice.totalAmount || 0); const amountPaid = Math.min(totalAmount, Math.max(0, totalPaid)); invoice.amountPaid = amountPaid; invoice.balance = Math.max(0, totalAmount - amountPaid); if (amountPaid <= 0) invoice.status = totalRefunded > 0 ? "refunded" : "pending"; else if (amountPaid >= totalAmount && totalAmount > 0) invoice.status = "paid"; else invoice.status = "partial"; const latestPayment = payments.slice().sort((a, b) => Number(new Date(b.updatedAt || 0)) - Number(new Date(a.updatedAt || 0)))[0]; if (latestPayment) { invoice.paymentMethod = latestPayment.paymentMethod || invoice.paymentMethod; invoice.paymentReference = latestPayment.mpesaReceiptNumber || latestPayment.transactionReference || latestPayment.transactionId || invoice.paymentReference; } await invoice.save(queryOptions); }
  // Check the condition (commission) and run the matching branch.
  if (commission) { const bookingAmount = Number(commission.bookingAmount || 0); const rate = Number(commission.rate || 0); const proportionalRefund = bookingAmount > 0 ? Math.min(Number(commission.amount || 0), (totalRefunded * rate) / 100) : 0; const nextRefunded = Number(proportionalRefund.toFixed(2)); if (nextRefunded !== Number(commission.refundedAmount || 0)) { commission.refundedAmount = nextRefunded; commission.adjustmentAmount = nextRefunded; commission.adjustmentStatus = nextRefunded > 0 ? "posted" : "none"; commission.adjustmentAt = nextRefunded > 0 ? new Date() : null; commission.financeNotes = nextRefunded > 0 ? `Commission adjustment posted: KES ${nextRefunded.toFixed(2)} due to booking refund.` : commission.financeNotes; await commission.save(queryOptions); } }
  // Run this operation with a dedicated error-handling path for failures.
  try { const BookingModel = mongoose.models.Booking; const CorporateAccountModel = mongoose.models.CorporateAccount; if (BookingModel && CorporateAccountModel) { const booking = await BookingModel.findOne({ tenantId: this.tenantId, _id: bookingId }).select("corporateAccount").lean(); if (booking?.corporateAccount) { const corporateBookings = await BookingModel.find({ tenantId: this.tenantId, corporateAccount: booking.corporateAccount, isDeleted: { $ne: true }, status: { $nin: ["cancelled", "refunded"] } }).select("_id totalAmount").lean(); const corporateBookingIds = corporateBookings.map((item) => item._id); const corporatePayments = corporateBookingIds.length ? await PaymentModel.aggregate([{ $match: { tenantId: this.tenantId, booking: { $in: corporateBookingIds }, status: { $in: ["completed", "refunded"] } } }, { $project: { net: { $max: [0, { $subtract: ["$amount", { $ifNull: ["$refundedAmount", 0] }] }] } } }, { $group: { _id: null, total: { $sum: "$net" } } }]) : []; const exposure = Math.max(0, corporateBookings.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0) - Number(corporatePayments[0]?.total || 0)); await CorporateAccountModel.updateOne({ tenantId: this.tenantId, _id: booking.corporateAccount }, { $set: { currentBalance: Math.round(exposure * 100) / 100 } }, queryOptions); } } } catch (corporateSyncError) { console.error("CORPORATE BALANCE SYNC ERROR:", corporateSyncError.message); }
});

// Perform the side effect or state update expressed on the following line.
paymentSchema.post("save", async function () {
  // Check the condition (!this.tenantId || !this.hospitalityBooking || !this.hospitalityType) and run the matching branch.
  if (!this.tenantId || !this.hospitalityBooking || !this.hospitalityType) return;
  // Check the condition (!["completed", "refunded"].includes(this.status) && this.refundStatus ) and run the matching branch.
  if (!["completed", "refunded"].includes(this.status) && this.refundStatus !== "completed") return;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (this.status === "completed" && this.$statusWasModified) and run the matching branch.
    if (this.status === "completed" && this.$statusWasModified) await postPaymentToLedger(this);
    // Declare Model for use by the surrounding module or function.
    const Model = this.hospitalityBookingModel === "HotelBooking" ? mongoose.models.HotelBooking : mongoose.models.AirportTransferBooking;
    // Declare booking for use by the surrounding module or function.
    const booking = Model ? await Model.findOne({ tenantId: this.tenantId, _id: this.hospitalityBooking }) : null;
    // Check the condition (booking) and run the matching branch.
    if (booking) await syncHospitalityInvoicePayments({ type: this.hospitalityType, booking });
  } catch (error) { console.error("HOSPITALITY PAYMENT FINANCE SYNC ERROR:", error.message); }
});

// Declare tenantPaymentSchema for use by the surrounding module or function.
const tenantPaymentSchema = paymentSchema.plugin(tenantPlugin);
// Declare Payment for use by the surrounding module or function.
const Payment = mongoose.models.Payment || mongoose.model("Payment", tenantPaymentSchema);
export default Payment;
