// server/models/Invoice.js
// Mongoose defines invoice records, line items and their validation rules.
import mongoose from "mongoose";
// Apply tenant-scoped query/write protections to invoices.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Post invoice accounting effects to the general ledger.
import { postInvoiceToLedger } from "../services/operationalAccountingService.js";
// Queue external events when invoices are created or updated.
import { queueWebhookEvent } from "../services/webhookDeliveryService.js";
// Allocate tenant-scoped invoice numbers without relying on a process-local counter.
import InvoiceSequence from "./InvoiceSequence.js";
// Read tenant tax/eTIMS profile settings used while generating invoice numbers.
import TaxProfile from "./TaxProfile.js";

const invoiceItemSchema = new mongoose.Schema({
  // Description of the product/service line billed on the invoice.
  description: { type: String, trim: true, required: true },

  // Number of units billed on this line item.
  quantity: { type: Number, min: 0, default: 1 },

  // Price for one unit before discount/tax.
  unitPrice: { type: Number, min: 0, required: true },

  // Total discount applied to the invoice.
  discount: { type: Number, min: 0, default: 0 },

  // Amount subject to tax before tax is applied.
  taxableAmount: { type: Number, min: 0, default: 0 },

  // Default tax percentage applied to the invoice.
  taxRate: { type: Number, min: 0, max: 100, default: 0 },

  // Tax classification applied to the invoice.
  taxType: { type: String, enum: ["STANDARD", "ZERO_RATED", "EXEMPT", "NON_VAT", "OTHER"], default: "STANDARD" },

  // Tax amount calculated for this line item.
  taxAmount: { type: Number, min: 0, default: 0 },

  // Final line-item amount after applicable calculations.
  totalAmount: { type: Number, min: 0, required: true },
}, { _id: false });

const invoiceSchema = new mongoose.Schema({
  // Organization that owns the invoice; required for tenant isolation.
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },

  // Tour booking associated with the invoice.
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },

  // Hotel/airport-transfer booking associated with the invoice.
  hospitalityBooking: { type: mongoose.Schema.Types.ObjectId, refPath: "hospitalityBookingModel", default: null, index: true },

  // Model type used to resolve the hospitality booking reference.
  hospitalityBookingModel: { type: String, enum: ["HotelBooking", "AirportTransferBooking"], default: null },

  // Hospitality service category for the invoice.
  hospitalityType: { type: String, enum: ["hotel", "airport_transfer"], default: null, index: true },

  // Customer record billed by the invoice.
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },

  // User account associated with the invoice, when available.
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },

  // Tour record associated with the invoice.
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", default: null },

  // Agent associated with the booking/invoice.
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null },

  // Human-readable unique invoice number.
  invoiceNumber: { type: String, trim: true },

  // Date the invoice was issued.
  issueDate: { type: Date, default: Date.now },

  // Date payment is due, when configured.
  dueDate: { type: Date },

  // Invoice amount before discount and tax.
  subtotal: { type: Number, default: 0, min: 0 },

  // Total discount applied to the invoice.
  discount: { type: Number, default: 0, min: 0 },

  // Total tax amount for the invoice.
  tax: { type: Number, default: 0, min: 0 },

  // Default tax percentage applied to the invoice.
  taxRate: { type: Number, default: 0, min: 0, max: 100 },

  // Tax classification applied to the invoice.
  taxType: { type: String, enum: ["STANDARD", "ZERO_RATED", "EXEMPT", "NON_VAT", "OTHER"], default: "STANDARD" },

  // Indicates whether tax is included in or added to prices.
  taxMode: { type: String, enum: ["exclusive", "inclusive"], default: "exclusive" },

  // Amount subject to tax before tax is applied.
  taxableAmount: { type: Number, default: 0, min: 0 },

  // Final line-item amount after applicable calculations.
  totalAmount: { type: Number, required: true, min: 0 },

  // Detailed invoice line items.
  items: { type: [invoiceItemSchema], default: [] },

  // Total amount recorded as paid against the invoice.
  amountPaid: { type: Number, default: 0, min: 0 },

  // Outstanding invoice balance after recorded payments.
  balance: { type: Number, default: 0, min: 0 },

  // Payment method used to settle the invoice.
  paymentMethod: { type: String, enum: ["MPESA", "CARD", "BANK_TRANSFER", "PAYPAL", "PESAPAL", "CASH"], default: "MPESA" },

  // Reference used to reconcile the payment.
  paymentReference: { type: String, default: "", trim: true },

  // Invoice lifecycle status, including pending, partial, paid and refunded.
  status: { type: String, enum: ["draft", "pending", "partial", "paid", "cancelled", "refunded", "overdue"], default: "pending" },

  // Snapshot of customer identity/address details at invoice creation.
  customerSnapshot: { name: String, email: String, phone: String, address: String, buyerPin: String },

  // Customer tax PIN used on fiscal invoice records.
  buyerPin: { type: String, trim: true, uppercase: true, default: "" },

  // Seller tax registration number used by invoicing/tax workflows.
  taxRegistrationNumber: { type: String, trim: true, uppercase: true, default: "" },

  // eTIMS submission/synchronization lifecycle state.
  etimsStatus: { type: String, enum: ["not_configured", "pending", "submitted", "synced", "failed"], default: "not_configured" },

  // Invoice identifier assigned by eTIMS, when returned.
  etimsInvoiceNumber: { type: String, trim: true, default: "" },

  // Receipt identifier assigned by eTIMS, when returned.
  etimsReceiptNumber: { type: String, trim: true, default: "" },

  // Unique register identifier returned by eTIMS.
  etimsUniqueRegisterIdentifier: { type: String, trim: true, default: "" },

  // QR code payload or URL associated with the fiscal invoice.
  etimsQrCode: { type: String, trim: true, default: "" },

  // Time the invoice was submitted to eTIMS.
  etimsSubmittedAt: { type: Date, default: null },

  // Provider response retained for audit/reconciliation.
  etimsResponse: { type: mongoose.Schema.Types.Mixed, default: {} },

  // Number of eTIMS submission attempts.
  etimsSubmissionAttempts: { type: Number, default: 0, min: 0 },

  // Most recent eTIMS submission error, if any.
  etimsLastError: { type: String, trim: true, default: "" },

  // Scheduled time for the next eTIMS retry.
  etimsNextRetryAt: { type: Date, default: null },

  // Time the most recent eTIMS submission attempt occurred.
  etimsLastAttemptAt: { type: Date, default: null },

  // URL for the generated invoice PDF.
  pdfUrl: { type: String, default: "" },

  // Internal notes associated with the invoice.
  notes: { type: String, default: "", trim: true },

  // Soft-delete flag that preserves the invoice record for audit.
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Populate invoice defaults, generate an invoice number, and synchronize totals before saving.
invoiceSchema.pre("save", async function(next) {
  try {
    this.$wasNew = this.isNew;
    if (this.isNew && !this.invoiceNumber) {
      if (!this.tenantId) throw new Error("Tenant context is required to generate an invoice number.");
      const profile = await TaxProfile.findOne({ tenantId: this.tenantId }).lean();
      const branchId = String(profile?.etimsBranchId || "HQ").trim() || "HQ";
      const deviceId = String(profile?.etimsDeviceId || "MAIN").trim() || "MAIN";
      const prefix = String(profile?.etimsInvoicePrefix || "INV").trim().toUpperCase() || "INV";
      const sequence = await InvoiceSequence.findOneAndUpdate({ tenantId: this.tenantId, branchId, deviceId, prefix }, { $inc: { nextNumber: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
      const number = Math.max(1, Number(sequence.nextNumber || 1) - 1);
      this.invoiceNumber = `${prefix}-${String(number).padStart(8, "0")}`;
    }
    const net = Math.max(0, Number(this.subtotal || 0) - Number(this.discount || 0));
    if (!Number.isFinite(Number(this.taxableAmount)) || Number(this.taxableAmount) === 0) this.taxableAmount = net;
    if (!this.items?.length) {
      const label = this.hospitalityType === "hotel" ? "Hotel reservation" : this.hospitalityType === "airport_transfer" ? "Airport transfer reservation" : "Tour booking";
      const reference = this.hospitalityBooking || this.booking || "";
      this.items = [{ description: `${label} ${String(reference)}`, quantity: 1, unitPrice: Number(this.totalAmount || 0), taxableAmount: Number(this.taxableAmount || 0), taxRate: Number(this.taxRate || 0), taxType: this.taxType, taxAmount: Number(this.tax || 0), totalAmount: Number(this.totalAmount || 0) }];
    }
    this.balance = Math.max(0, Number(this.totalAmount || 0) - Number(this.amountPaid || 0));
    if (!["refunded", "cancelled", "draft"].includes(this.status)) {
      if (this.balance <= 0 && this.totalAmount > 0) this.status = "paid";
      else if (this.amountPaid > 0) this.status = "partial";
      else this.status = "pending";
    }
    next();
  } catch (error) { next(error); }
});

// Return the non-negative balance based on total amount and amount already paid.
invoiceSchema.methods.calculateBalance = function() { return Math.max(0, this.totalAmount - this.amountPaid); };
// Mark the invoice fully paid and optionally store its payment reference.
invoiceSchema.methods.markPaid = function(reference = "") { this.amountPaid = this.totalAmount; this.balance = 0; this.status = "paid"; if (reference) this.paymentReference = reference; return this.save(); };
// Record an eTIMS attempt and calculate the next retry time after a failure.
invoiceSchema.methods.markEtimsAttempt = function(errorMessage = "") { this.etimsSubmissionAttempts = Number(this.etimsSubmissionAttempts || 0) + 1; this.etimsLastAttemptAt = new Date(); this.etimsLastError = String(errorMessage || "").trim(); this.etimsStatus = this.etimsLastError ? "failed" : "pending"; const delayMinutes = Math.min(60 * 24, 5 * (2 ** Math.min(this.etimsSubmissionAttempts - 1, 8))); this.etimsNextRetryAt = this.etimsLastError ? new Date(Date.now() + delayMinutes * 60 * 1000) : null; return this.save(); };

// After saving, post accounting effects and queue an invoice-created/updated webhook.
invoiceSchema.post("save", async function(doc) {
  const session = typeof doc.$session === "function" ? doc.$session() : null;
  try { await postInvoiceToLedger(doc, { session }); } catch (error) { console.error("INVOICE GL POSTING ERROR:", error.message); }
  try {
    if (doc.tenantId && (doc.booking || doc.hospitalityBooking)) {
      await queueWebhookEvent({ tenantId: doc.tenantId, event: doc.$wasNew ? "invoice.created" : "invoice.updated", sourceId: String(doc._id), data: { id: doc._id, booking: doc.booking || null, hospitalityBooking: doc.hospitalityBooking || null, hospitalityType: doc.hospitalityType || null, invoiceNumber: doc.invoiceNumber, status: doc.status, totalAmount: doc.totalAmount, amountPaid: doc.amountPaid, balance: doc.balance, currency: "KES", paymentReference: doc.paymentReference || "", dueDate: doc.dueDate || null, etimsStatus: doc.etimsStatus, etimsInvoiceNumber: doc.etimsInvoiceNumber || "", updatedAt: doc.updatedAt } });
    }
  } catch (error) { console.error("INVOICE WEBHOOK QUEUE ERROR:", error.message); }
});

// Allow at most one invoice per tenant booking.
invoiceSchema.index({ tenantId: 1, booking: 1 }, { unique: true, partialFilterExpression: { booking: { $type: "objectId" } } });
// Allow at most one invoice per tenant hospitality booking/type combination.
invoiceSchema.index({ tenantId: 1, hospitalityBooking: 1, hospitalityType: 1 }, { unique: true, partialFilterExpression: { hospitalityBooking: { $type: "objectId" } } });
invoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ customer: 1 }); invoiceSchema.index({ tour: 1 }); invoiceSchema.index({ status: 1 }); invoiceSchema.index({ createdAt: -1 }); invoiceSchema.index({ dueDate: 1 }); invoiceSchema.index({ isDeleted: 1 });
invoiceSchema.index({ tenantId: 1, etimsStatus: 1, createdAt: -1 }); invoiceSchema.index({ tenantId: 1, etimsStatus: 1, etimsNextRetryAt: 1 });

// Attach tenant isolation before registering the model.
const tenantInvoiceSchema = invoiceSchema.plugin(tenantPlugin);
// Reuse an existing model during reloads or register the Invoice model once.
const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", tenantInvoiceSchema);
// Export the model for invoice/payment services and API handlers.
export default Invoice;
