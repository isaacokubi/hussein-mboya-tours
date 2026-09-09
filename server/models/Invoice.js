// server/models/Invoice.js
import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import { postInvoiceToLedger } from "../services/operationalAccountingService.js";
import { queueWebhookEvent } from "../services/webhookDeliveryService.js";

const invoiceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true }, booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true }, customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null }, user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", default: null }, agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null }, invoiceNumber: { type: String, trim: true }, issueDate: { type: Date, default: Date.now }, dueDate: { type: Date }, subtotal: { type: Number, default: 0, min: 0 }, discount: { type: Number, default: 0, min: 0 }, tax: { type: Number, default: 0, min: 0 }, taxRate: { type: Number, default: 0, min: 100 }, taxType: { type: String, enum: ["STANDARD", "ZERO_RATED", "EXEMPT", "NON_VAT", "OTHER"], default: "STANDARD" }, totalAmount: { type: Number, required: true, min: 0 }, amountPaid: { type: Number, default: 0, min: 0 }, balance: { type: Number, default: 0, min: 0 }, paymentMethod: { type: String, enum: ["MPESA", "CARD", "BANK_TRANSFER", "PAYPAL", "PESAPAL", "CASH"], default: "MPESA" }, paymentReference: { type: String, default: "", trim: true }, status: { type: String, enum: ["draft", "pending", "partial", "paid", "cancelled", "refunded", "overdue"], default: "pending" }, customerSnapshot: { name: String, email: String, phone: String }, buyerPin: { type: String, trim: true, uppercase: true, default: "" }, taxRegistrationNumber: { type: String, trim: true, uppercase: true, default: "" }, etimsStatus: { type: String, enum: ["not_configured", "pending", "submitted", "synced", "failed"], default: "not_configured" }, etimsInvoiceNumber: { type: String, trim: true, default: "" }, etimsReceiptNumber: { type: String, trim: true, default: "" }, etimsUniqueRegisterIdentifier: { type: String, trim: true, default: "" }, etimsQrCode: { type: String, trim: true, default: "" }, etimsSubmittedAt: { type: Date, default: null }, etimsResponse: { type: mongoose.Schema.Types.Mixed, default: {} }, etimsSubmissionAttempts: { type: Number, default: 0, min: 0 }, etimsLastError: { type: String, trim: true, default: "" }, etimsNextRetryAt: { type: Date, default: null }, etimsLastAttemptAt: { type: Date, default: null }, pdfUrl: { type: String, default: "" }, notes: { type: String, default: "", trim: true }, isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

invoiceSchema.pre("save", function(next) {
  this.$wasNew = this.isNew;
  if (!this.invoiceNumber) this.invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  this.balance = Math.max(0, Number(this.totalAmount || 0) - Number(this.amountPaid || 0));
  if (!["refunded", "cancelled", "draft"].includes(this.status)) {
    if (this.balance <= 0 && this.totalAmount > 0) this.status = "paid";
    else if (this.amountPaid > 0) this.status = "partial";
    else this.status = "pending";
  }
  next();
});

invoiceSchema.methods.calculateBalance = function() { return Math.max(0, this.totalAmount - this.amountPaid); };
invoiceSchema.methods.markPaid = function(reference = "") { this.amountPaid = this.totalAmount; this.balance = 0; this.status = "paid"; if (reference) this.paymentReference = reference; return this.save(); };
invoiceSchema.methods.markEtimsAttempt = function(errorMessage = "") { this.etimsSubmissionAttempts = Number(this.etimsSubmissionAttempts || 0) + 1; this.etimsLastAttemptAt = new Date(); this.etimsLastError = String(errorMessage || "").trim(); this.etimsStatus = this.etimsLastError ? "failed" : "pending"; const delayMinutes = Math.min(60 * 24, 5 * (2 ** Math.min(this.etimsSubmissionAttempts - 1, 8))); this.etimsNextRetryAt = this.etimsLastError ? new Date(Date.now() + delayMinutes * 60 * 1000) : null; return this.save(); };

invoiceSchema.post("save", async function(doc) {
  try { await postInvoiceToLedger(doc); } catch (error) { console.error("INVOICE GL POSTING ERROR:", error.message); }
  try {
    if (doc.tenantId && doc.booking) {
      await queueWebhookEvent({
        tenantId: doc.tenantId,
        event: doc.$wasNew ? "invoice.created" : "invoice.updated",
        sourceId: String(doc._id),
        data: {
          id: doc._id,
          booking: doc.booking,
          invoiceNumber: doc.invoiceNumber,
          status: doc.status,
          totalAmount: doc.totalAmount,
          amountPaid: doc.amountPaid,
          balance: doc.balance,
          currency: "KES",
          paymentReference: doc.paymentReference || "",
          dueDate: doc.dueDate || null,
          etimsStatus: doc.etimsStatus,
          etimsInvoiceNumber: doc.etimsInvoiceNumber || "",
          updatedAt: doc.updatedAt,
        },
      });
    }
  } catch (error) { console.error("INVOICE WEBHOOK QUEUE ERROR:", error.message); }
});

invoiceSchema.index({ tenantId: 1, booking: 1 }, { unique: true }); invoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true }); invoiceSchema.index({ customer: 1 }); invoiceSchema.index({ tour: 1 }); invoiceSchema.index({ status: 1 }); invoiceSchema.index({ createdAt: -1 }); invoiceSchema.index({ dueDate: 1 }); invoiceSchema.index({ isDeleted: 1 }); invoiceSchema.index({ tenantId: 1, etimsStatus: 1, createdAt: -1 }); invoiceSchema.index({ tenantId: 1, etimsStatus: 1, etimsNextRetryAt: 1 });

const tenantInvoiceSchema = invoiceSchema.plugin(tenantPlugin);
const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", tenantInvoiceSchema);
export default Invoice;
