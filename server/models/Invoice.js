// server/models/Invoice.js
import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
import { postInvoiceToLedger } from "../services/operationalAccountingService.js";
import { queueWebhookEvent } from "../services/webhookDeliveryService.js";
import InvoiceSequence from "./InvoiceSequence.js";
import TaxProfile from "./TaxProfile.js";

const invoiceItemSchema = new mongoose.Schema({
  description: { type: String, trim: true, required: true },
  quantity: { type: Number, min: 0, default: 1 },
  unitPrice: { type: Number, min: 0, required: true },
  discount: { type: Number, min: 0, default: 0 },
  taxableAmount: { type: Number, min: 0, default: 0 },
  taxRate: { type: Number, min: 0, max: 100, default: 0 },
  taxType: { type: String, enum: ["STANDARD", "ZERO_RATED", "EXEMPT", "NON_VAT", "OTHER"], default: "STANDARD" },
  taxAmount: { type: Number, min: 0, default: 0 },
  totalAmount: { type: Number, min: 0, required: true },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true }, booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true }, customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null }, user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", default: null }, agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null }, invoiceNumber: { type: String, trim: true }, issueDate: { type: Date, default: Date.now }, dueDate: { type: Date }, subtotal: { type: Number, default: 0, min: 0 }, discount: { type: Number, default: 0, min: 0 }, tax: { type: Number, default: 0, min: 0 }, taxRate: { type: Number, default: 0, min: 0, max: 100 }, taxType: { type: String, enum: ["STANDARD", "ZERO_RATED", "EXEMPT", "NON_VAT", "OTHER"], default: "STANDARD" }, taxMode: { type: String, enum: ["exclusive", "inclusive"], default: "exclusive" }, taxableAmount: { type: Number, default: 0, min: 0 }, totalAmount: { type: Number, required: true, min: 0 }, items: { type: [invoiceItemSchema], default: [] }, amountPaid: { type: Number, default: 0, min: 0 }, balance: { type: Number, default: 0, min: 0 }, paymentMethod: { type: String, enum: ["MPESA", "CARD", "BANK_TRANSFER", "PAYPAL", "PESAPAL", "CASH"], default: "MPESA" }, paymentReference: { type: String, default: "", trim: true }, status: { type: String, enum: ["draft", "pending", "partial", "paid", "cancelled", "refunded", "overdue"], default: "pending" }, customerSnapshot: { name: String, email: String, phone: String, address: String, buyerPin: String }, buyerPin: { type: String, trim: true, uppercase: true, default: "" }, taxRegistrationNumber: { type: String, trim: true, uppercase: true, default: "" }, etimsStatus: { type: String, enum: ["not_configured", "pending", "submitted", "synced", "failed"], default: "not_configured" }, etimsInvoiceNumber: { type: String, trim: true, default: "" }, etimsReceiptNumber: { type: String, trim: true, default: "" }, etimsUniqueRegisterIdentifier: { type: String, trim: true, default: "" }, etimsQrCode: { type: String, trim: true, default: "" }, etimsSubmittedAt: { type: Date, default: null }, etimsResponse: { type: mongoose.Schema.Types.Mixed, default: {} }, etimsSubmissionAttempts: { type: Number, default: 0, min: 0 }, etimsLastError: { type: String, trim: true, default: "" }, etimsNextRetryAt: { type: Date, default: null }, etimsLastAttemptAt: { type: Date, default: null }, pdfUrl: { type: String, default: "" }, notes: { type: String, default: "", trim: true }, isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

invoiceSchema.pre("save", async function(next) {
  try {
    this.$wasNew = this.isNew;
    if (this.isNew && !this.invoiceNumber) { if (!this.tenantId) throw new Error("Tenant context is required to generate an invoice number."); const profile = await TaxProfile.findOne({ tenantId: this.tenantId }).lean(); const branchId = String(profile?.etimsBranchId || "HQ").trim() || "HQ"; const deviceId = String(profile?.etimsDeviceId || "MAIN").trim() || "MAIN"; const prefix = String(profile?.etimsInvoicePrefix || "INV").trim().toUpperCase() || "INV"; const sequence = await InvoiceSequence.findOneAndUpdate({ tenantId: this.tenantId, branchId, deviceId, prefix }, { $inc: { nextNumber: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true }); const number = Math.max(1, Number(sequence.nextNumber || 1) - 1); this.invoiceNumber = `${prefix}-${String(number).padStart(8, "0")}`; }
    const net = Math.max(0, Number(this.subtotal || 0) - Number(this.discount || 0)); if (!Number.isFinite(Number(this.taxableAmount)) || Number(this.taxableAmount) === 0) this.taxableAmount = net; if (!this.items?.length) this.items = [{ description: `Tour booking ${String(this.booking || "")}`, quantity: 1, unitPrice: Number(this.totalAmount || 0), taxableAmount: Number(this.taxableAmount || 0), taxRate: Number(this.taxRate || 0), taxType: this.taxType, taxAmount: Number(this.tax || 0), totalAmount: Number(this.totalAmount || 0) }];
    this.balance = Math.max(0, Number(this.totalAmount || 0) - Number(this.amountPaid || 0)); if (!["refunded", "cancelled", "draft"].includes(this.status)) { if (this.balance <= 0 && this.totalAmount > 0) this.status = "paid"; else if (this.amountPaid > 0) this.status = "partial"; else this.status = "pending"; }
    next();
  } catch (error) { next(error); }
});

invoiceSchema.methods.calculateBalance = function() { return Math.max(0, this.totalAmount - this.amountPaid); };
invoiceSchema.methods.markPaid = function(reference = "") { this.amountPaid = this.totalAmount; this.balance = 0; this.status = "paid"; if (reference) this.paymentReference = reference; return this.save(); };
invoiceSchema.methods.markEtimsAttempt = function(errorMessage = "") { this.etimsSubmissionAttempts = Number(this.etimsSubmissionAttempts || 0) + 1; this.etimsLastAttemptAt = new Date(); this.etimsLastError = String(errorMessage || "").trim(); this.etimsStatus = this.etimsLastError ? "failed" : "pending"; const delayMinutes = Math.min(60 * 24, 5 * (2 ** Math.min(this.etimsSubmissionAttempts - 1, 8))); this.etimsNextRetryAt = this.etimsLastError ? new Date(Date.now() + delayMinutes * 60 * 1000) : null; return this.save(); };

invoiceSchema.post("save", async function(doc) { try { await postInvoiceToLedger(doc); } catch (error) { console.error("INVOICE GL POSTING ERROR:", error.message); } try { if (doc.tenantId && doc.booking) await queueWebhookEvent({ tenantId: doc.tenantId, event: doc.$wasNew ? "invoice.created" : "invoice.updated", sourceId: String(doc._id), data: { id: doc._id, booking: doc.booking, invoiceNumber: doc.invoiceNumber, status: doc.status, totalAmount: doc.totalAmount, amountPaid: doc.amountPaid, balance: doc.balance, currency: "KES", paymentReference: doc.paymentReference || "", dueDate: doc.dueDate || null, etimsStatus: doc.etimsStatus, etimsInvoiceNumber: doc.etimsInvoiceNumber || "", updatedAt: doc.updatedAt } }); } catch (error) { console.error("INVOICE WEBHOOK QUEUE ERROR:", error.message); } });

invoiceSchema.index({ tenantId: 1, booking: 1 }, { unique: true }); invoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true }); invoiceSchema.index({ customer: 1 }); invoiceSchema.index({ tour: 1 }); invoiceSchema.index({ status: 1 }); invoiceSchema.index({ createdAt: -1 }); invoiceSchema.index({ dueDate: 1 }); invoiceSchema.index({ isDeleted: 1 }); invoiceSchema.index({ tenantId: 1, etimsStatus: 1, createdAt: -1 }); invoiceSchema.index({ tenantId: 1, etimsStatus: 1, etimsNextRetryAt: 1 });

const tenantInvoiceSchema = invoiceSchema.plugin(tenantPlugin);
const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", tenantInvoiceSchema);
export default Invoice;
