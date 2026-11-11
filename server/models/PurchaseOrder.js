/**
 * Purpose: Purchase Order database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare lineSchema for use by the surrounding module or function.
const lineSchema = new mongoose.Schema({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0.001 },
  unitCost: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, min: 0, max: 100, default: 0 },
  taxType: { type: String, enum: ["standard", "zero_rated", "exempt", "non_vat"], default: "standard" },
  subtotal: { type: Number, min: 0, default: 0 },
  taxAmount: { type: Number, min: 0, default: 0 },
  total: { type: Number, min: 0, default: 0 },
}, { _id: true });

// Declare purchaseOrderSchema for use by the surrounding module or function.
const purchaseOrderSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  poNumber: { type: String, trim: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", default: null, index: true },
  issueDate: { type: Date, default: Date.now },
  expectedDate: { type: Date, default: null },
  currency: { type: String, uppercase: true, default: "KES" },
  lines: { type: [lineSchema], default: [] },
  subtotal: { type: Number, min: 0, default: 0 },
  taxAmount: { type: Number, min: 0, default: 0 },
  totalAmount: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["draft", "submitted", "approved", "partially_received", "received", "cancelled"], default: "draft", index: true },
  approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  approvedAt: { type: Date, default: null },
  receivedAt: { type: Date, default: null },
  notes: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

// Perform the side effect or state update expressed on the following line.
purchaseOrderSchema.pre("validate", function(next) {
  // Check the condition (!this.lines.length) and run the matching branch.
  if (!this.lines.length) return next(new Error("Purchase order requires at least one line item."));
  // Declare subtotal for use by the surrounding module or function.
  let subtotal = 0; let taxAmount = 0;
  // Perform the side effect or state update expressed on the following line.
  this.lines.forEach((line) => {
    // Perform the side effect or state update expressed on the following line.
    line.subtotal = Math.round(line.quantity * line.unitCost * 100) / 100;
    // Perform the side effect or state update expressed on the following line.
    line.taxAmount = line.taxType === "standard" ? Math.round(line.subtotal * (line.taxRate / 100) * 100) / 100 : 0;
    // Perform the side effect or state update expressed on the following line.
    line.total = Math.round((line.subtotal + line.taxAmount) * 100) / 100;
    // Perform the side effect or state update expressed on the following line.
    subtotal += line.subtotal; taxAmount += line.taxAmount;
  });
  // Perform the side effect or state update expressed on the following line.
  this.subtotal = Math.round(subtotal * 100) / 100;
  // Perform the side effect or state update expressed on the following line.
  this.taxAmount = Math.round(taxAmount * 100) / 100;
  // Perform the side effect or state update expressed on the following line.
  this.totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
  // Perform the side effect or state update expressed on the following line.
  next();
});
// Perform the side effect or state update expressed on the following line.
purchaseOrderSchema.pre("save", function(next) {
  // Check the condition (!this.poNumber) and run the matching branch.
  if (!this.poNumber) this.poNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  // Perform the side effect or state update expressed on the following line.
  next();
});
// Perform the side effect or state update expressed on the following line.
purchaseOrderSchema.index({ tenantId: 1, poNumber: 1 }, { unique: true });
// Perform the side effect or state update expressed on the following line.
purchaseOrderSchema.index({ tenantId: 1, supplier: 1, status: 1 });
// Perform the side effect or state update expressed on the following line.
purchaseOrderSchema.plugin(tenantPlugin);
export default mongoose.models.PurchaseOrder || mongoose.model("PurchaseOrder", purchaseOrderSchema);
