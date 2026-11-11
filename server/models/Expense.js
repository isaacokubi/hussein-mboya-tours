/**
 * Purpose: Expense database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare expenseSchema for use by the surrounding module or function.
const expenseSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  expenseNumber: { type: String, trim: true },
  category: { type: String, trim: true, required: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", default: null, index: true },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", default: null, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", default: null, index: true },
  supplierName: { type: String, trim: true, default: "" },
  supplierPin: { type: String, trim: true, uppercase: true, default: "" },
  description: { type: String, trim: true, required: true },
  amount: { type: Number, min: 0, required: true },
  taxAmount: { type: Number, min: 0, default: 0 },
  currency: { type: String, uppercase: true, default: "KES" },
  expenseDate: { type: Date, default: Date.now, index: true },
  paymentMethod: { type: String, enum: ["MPESA", "CARD", "BANK_TRANSFER", "CASH", "OTHER"], default: "BANK_TRANSFER" },
  paymentReference: { type: String, trim: true, default: "" },
  paidAt: { type: Date, default: null },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  paidBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  etimsInvoiceNumber: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["draft", "approved", "paid", "cancelled"], default: "draft", index: true },
  notes: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
expenseSchema.pre("save", function(next) { if (!this.expenseNumber) this.expenseNumber = `EXP-${Date.now()}-${Math.floor(Math.random() * 10000)}`; next(); });
// Perform the side effect or state update expressed on the following line.
expenseSchema.index({ tenantId: 1, expenseNumber: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
expenseSchema.index({ tenantId: 1, purchaseOrder: 1 }, { unique: true, partialFilterExpression: { purchaseOrder: { $type: "objectId" } } });
// Perform the side effect or state update expressed on the following line.
expenseSchema.index({ tenantId: 1, status: 1, expenseDate: -1 });
// Perform the side effect or state update expressed on the following line.
expenseSchema.plugin(tenantPlugin);
export default mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
