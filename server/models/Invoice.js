/**
 * Purpose: Invoice database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
// server/models/Invoice.js
// Load mongoose so this module can use its exported dependencies.
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";
// Load ../services/operationalAccountingService.js so this module can use its exported dependencies.
import { postInvoiceToLedger } from "../services/operationalAccountingService.js";
// Load ../services/webhookDeliveryService.js so this module can use its exported dependencies.
import { queueWebhookEvent } from "../services/webhookDeliveryService.js";
// Load ./InvoiceSequence.js so this module can use its exported dependencies.
import InvoiceSequence from "./InvoiceSequence.js";
// Load ./TaxProfile.js so this module can use its exported dependencies.
import TaxProfile from "./TaxProfile.js";

// Declare invoiceItemSchema for use by the surrounding module or function.
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

// Declare invoiceSchema for use by the surrounding module or function.
const invoiceSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null },
  hospitalityBooking: { type: mongoose.Schema.Types.ObjectId, refPath: "hospitalityBookingModel", default: null, index: true },
  hospitalityBookingModel: { type: String, enum: ["HotelBooking", "AirportTransferBooking"], default: null },
  hospitalityType: { type: String, enum: ["hotel", "airport_transfer"], default: null, index: true },
  customer: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", default: null },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", default: null },
  agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", default: null },
  invoiceNumber: { type: String, trim: true },
  issueDate: { type: Date, default: Date.now },
  dueDate: { type: Date },
  subtotal: { type: Number, default: 0, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  tax: { type: Number, default: 0, min: 0 },
  taxRate: { type: Number, default: 0, min: 0, max: 100 },
  taxType: { type: String, enum: ["STANDARD", "ZERO_RATED", "EXEMPT", "NON_VAT", "OTHER"], default: "STANDARD" },
  taxMode: { type: String, enum: ["exclusive", "inclusive"], default: "exclusive" },
  taxableAmount: { type: Number, default: 0, min: 0 },
  totalAmount: { type: Number, required: true, min: 0 },
  items: { type: [invoiceItemSchema], default: [] },
  amountPaid: { type: Number, default: 0, min: 0 },
  balance: { type: Number, default: 0, min: 0 },
  paymentMethod: { type: String, enum: ["MPESA", "CARD", "BANK_TRANSFER", "PAYPAL", "PESAPAL", "CASH"], default: "MPESA" },
  paymentReference: { type: String, default: "", trim: true },
  status: { type: String, enum: ["draft", "pending", "partial", "paid", "cancelled", "refunded", "overdue"], default: "pending" },
  customerSnapshot: { name: String, email: String, phone: String, address: String, buyerPin: String },
  buyerPin: { type: String, trim: true, uppercase: true, default: "" },
  taxRegistrationNumber: { type: String, trim: true, uppercase: true, default: "" },
  etimsStatus: { type: String, enum: ["not_configured", "pending", "submitted", "synced", "failed"], default: "not_configured" },
  etimsInvoiceNumber: { type: String, trim: true, default: "" },
  etimsReceiptNumber: { type: String, trim: true, default: "" },
  etimsUniqueRegisterIdentifier: { type: String, trim: true, default: "" },
  etimsQrCode: { type: String, trim: true, default: "" },
  etimsSubmittedAt: { type: Date, default: null },
  etimsResponse: { type: mongoose.Schema.Types.Mixed, default: {} },
  etimsSubmissionAttempts: { type: Number, default: 0, min: 0 },
  etimsLastError: { type: String, trim: true, default: "" },
  etimsNextRetryAt: { type: Date, default: null },
  etimsLastAttemptAt: { type: Date, default: null },
  pdfUrl: { type: String, default: "" },
  notes: { type: String, default: "", trim: true },
  isDeleted: { type: Boolean, default: false },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
invoiceSchema.pre("save", async function(next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    this.$wasNew = this.isNew;
    // Check the condition (this.isNew && !this.invoiceNumber) and run the matching branch.
    if (this.isNew && !this.invoiceNumber) {
      // Check the condition (!this.tenantId) and run the matching branch.
      if (!this.tenantId) throw new Error("Tenant context is required to generate an invoice number.");
      // Declare profile for use by the surrounding module or function.
      const profile = await TaxProfile.findOne({ tenantId: this.tenantId }).lean();
      // Declare branchId for use by the surrounding module or function.
      const branchId = String(profile?.etimsBranchId || "HQ").trim() || "HQ";
      // Declare deviceId for use by the surrounding module or function.
      const deviceId = String(profile?.etimsDeviceId || "MAIN").trim() || "MAIN";
      // Declare prefix for use by the surrounding module or function.
      const prefix = String(profile?.etimsInvoicePrefix || "INV").trim().toUpperCase() || "INV";
      // Declare sequence for use by the surrounding module or function.
      const sequence = await InvoiceSequence.findOneAndUpdate({ tenantId: this.tenantId, branchId, deviceId, prefix }, { $inc: { nextNumber: 1 } }, { upsert: true, new: true, setDefaultsOnInsert: true });
      // Declare number for use by the surrounding module or function.
      const number = Math.max(1, Number(sequence.nextNumber || 1) - 1);
      // Perform the side effect or state update expressed on the following line.
      this.invoiceNumber = `${prefix}-${String(number).padStart(8, "0")}`;
    }
    // Declare net for use by the surrounding module or function.
    const net = Math.max(0, Number(this.subtotal || 0) - Number(this.discount || 0));
    // Check the condition (!Number.isFinite(Number(this.taxableAmount)) || Number(this.taxableAmo) and run the matching branch.
    if (!Number.isFinite(Number(this.taxableAmount)) || Number(this.taxableAmount) === 0) this.taxableAmount = net;
    // Check the condition (!this.items?.length) and run the matching branch.
    if (!this.items?.length) {
      // Declare label for use by the surrounding module or function.
      const label = this.hospitalityType === "hotel" ? "Hotel reservation" : this.hospitalityType === "airport_transfer" ? "Airport transfer reservation" : "Tour booking";
      // Declare reference for use by the surrounding module or function.
      const reference = this.hospitalityBooking || this.booking || "";
      // Perform the side effect or state update expressed on the following line.
      this.items = [{ description: `${label} ${String(reference)}`, quantity: 1, unitPrice: Number(this.totalAmount || 0), taxableAmount: Number(this.taxableAmount || 0), taxRate: Number(this.taxRate || 0), taxType: this.taxType, taxAmount: Number(this.tax || 0), totalAmount: Number(this.totalAmount || 0) }];
    }
    // Perform the side effect or state update expressed on the following line.
    this.balance = Math.max(0, Number(this.totalAmount || 0) - Number(this.amountPaid || 0));
    // Check the condition (!["refunded", "cancelled", "draft"].includes(this.status)) and run the matching branch.
    if (!["refunded", "cancelled", "draft"].includes(this.status)) {
      // Check the condition (this.balance <= 0 && this.totalAmount > 0) and run the matching branch.
      if (this.balance <= 0 && this.totalAmount > 0) this.status = "paid";
      else if (this.amountPaid > 0) this.status = "partial";
      else this.status = "pending";
    }
    // Perform the side effect or state update expressed on the following line.
    next();
  } catch (error) { next(error); }
});

// Perform the side effect or state update expressed on the following line.
invoiceSchema.methods.calculateBalance = function() { return Math.max(0, this.totalAmount - this.amountPaid); };
// Perform the side effect or state update expressed on the following line.
invoiceSchema.methods.markPaid = function(reference = "") { this.amountPaid = this.totalAmount; this.balance = 0; this.status = "paid"; if (reference) this.paymentReference = reference; return this.save(); };
// Perform the side effect or state update expressed on the following line.
invoiceSchema.methods.markEtimsAttempt = function(errorMessage = "") { this.etimsSubmissionAttempts = Number(this.etimsSubmissionAttempts || 0) + 1; this.etimsLastAttemptAt = new Date(); this.etimsLastError = String(errorMessage || "").trim(); this.etimsStatus = this.etimsLastError ? "failed" : "pending"; const delayMinutes = Math.min(60 * 24, 5 * (2 ** Math.min(this.etimsSubmissionAttempts - 1, 8))); this.etimsNextRetryAt = this.etimsLastError ? new Date(Date.now() + delayMinutes * 60 * 1000) : null; return this.save(); };

// Perform the side effect or state update expressed on the following line.
invoiceSchema.post("save", async function(doc) {
  // Declare session for use by the surrounding module or function.
  const session = typeof doc.$session === "function" ? doc.$session() : null;
  // Run this operation with a dedicated error-handling path for failures.
  try { await postInvoiceToLedger(doc, { session }); } catch (error) { console.error("INVOICE GL POSTING ERROR:", error.message); }
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Check the condition (doc.tenantId && (doc.booking || doc.hospitalityBooking)) and run the matching branch.
    if (doc.tenantId && (doc.booking || doc.hospitalityBooking)) {
      // Perform the side effect or state update expressed on the following line.
      await queueWebhookEvent({ tenantId: doc.tenantId, event: doc.$wasNew ? "invoice.created" : "invoice.updated", sourceId: String(doc._id), data: { id: doc._id, booking: doc.booking || null, hospitalityBooking: doc.hospitalityBooking || null, hospitalityType: doc.hospitalityType || null, invoiceNumber: doc.invoiceNumber, status: doc.status, totalAmount: doc.totalAmount, amountPaid: doc.amountPaid, balance: doc.balance, currency: "KES", paymentReference: doc.paymentReference || "", dueDate: doc.dueDate || null, etimsStatus: doc.etimsStatus, etimsInvoiceNumber: doc.etimsInvoiceNumber || "", updatedAt: doc.updatedAt } });
    }
  } catch (error) { console.error("INVOICE WEBHOOK QUEUE ERROR:", error.message); }
});

// Perform the side effect or state update expressed on the following line.
invoiceSchema.index({ tenantId: 1, booking: 1 }, { unique: true, partialFilterExpression: { booking: { $type: "objectId" } } });
// Perform the side effect or state update expressed on the following line.
invoiceSchema.index({ tenantId: 1, hospitalityBooking: 1, hospitalityType: 1 }, { unique: true, partialFilterExpression: { hospitalityBooking: { $type: "objectId" } } });
// Perform the side effect or state update expressed on the following line.
invoiceSchema.index({ tenantId: 1, invoiceNumber: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
invoiceSchema.index({ customer: 1 }); invoiceSchema.index({ tour: 1 }); invoiceSchema.index({ status: 1 }); invoiceSchema.index({ createdAt: -1 }); invoiceSchema.index({ dueDate: 1 }); invoiceSchema.index({ isDeleted: 1 });
// Perform the side effect or state update expressed on the following line.
invoiceSchema.index({ tenantId: 1, etimsStatus: 1, createdAt: -1 }); invoiceSchema.index({ tenantId: 1, etimsStatus: 1, etimsNextRetryAt: 1 });

// Declare tenantInvoiceSchema for use by the surrounding module or function.
const tenantInvoiceSchema = invoiceSchema.plugin(tenantPlugin);
// Declare Invoice for use by the surrounding module or function.
const Invoice = mongoose.models.Invoice || mongoose.model("Invoice", tenantInvoiceSchema);
export default Invoice;
