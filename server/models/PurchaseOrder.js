import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const lineSchema = new firestore.Schema({
  description: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0.001 },
  unitCost: { type: Number, required: true, min: 0 },
  taxRate: { type: Number, min: 0, max: 100, default: 0 },
  taxType: { type: String, enum: ["standard", "zero_rated", "exempt", "non_vat"], default: "standard" },
  subtotal: { type: Number, min: 0, default: 0 },
  taxAmount: { type: Number, min: 0, default: 0 },
  total: { type: Number, min: 0, default: 0 },
}, { _id: true });

const purchaseOrderSchema = new firestore.Schema({
  tenantId: { type: firestore.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  poNumber: { type: String, trim: true },
  supplier: { type: firestore.Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
  booking: { type: firestore.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
  tour: { type: firestore.Schema.Types.ObjectId, ref: "Tour", default: null, index: true },
  issueDate: { type: Date, default: Date.now },
  expectedDate: { type: Date, default: null },
  currency: { type: String, uppercase: true, default: "KES" },
  lines: { type: [lineSchema], default: [] },
  subtotal: { type: Number, min: 0, default: 0 },
  taxAmount: { type: Number, min: 0, default: 0 },
  totalAmount: { type: Number, min: 0, default: 0 },
  status: { type: String, enum: ["draft", "submitted", "approved", "partially_received", "received", "cancelled"], default: "draft", index: true },
  approvedBy: { type: firestore.Schema.Types.ObjectId, ref: "User", default: null },
  approvedAt: { type: Date, default: null },
  receivedAt: { type: Date, default: null },
  notes: { type: String, trim: true, default: "" },
  createdBy: { type: firestore.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

purchaseOrderSchema.pre("validate", function(next) {
  if (!this.lines.length) return next(new Error("Purchase order requires at least one line item."));
  let subtotal = 0; let taxAmount = 0;
  this.lines.forEach((line) => {
    line.subtotal = Math.round(line.quantity * line.unitCost * 100) / 100;
    line.taxAmount = line.taxType === "standard" ? Math.round(line.subtotal * (line.taxRate / 100) * 100) / 100 : 0;
    line.total = Math.round((line.subtotal + line.taxAmount) * 100) / 100;
    subtotal += line.subtotal; taxAmount += line.taxAmount;
  });
  this.subtotal = Math.round(subtotal * 100) / 100;
  this.taxAmount = Math.round(taxAmount * 100) / 100;
  this.totalAmount = Math.round((subtotal + taxAmount) * 100) / 100;
  next();
});
purchaseOrderSchema.pre("save", function(next) {
  if (!this.poNumber) this.poNumber = `PO-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  next();
});
purchaseOrderSchema.index({ tenantId: 1, poNumber: 1 }, { unique: true });
purchaseOrderSchema.index({ tenantId: 1, supplier: 1, status: 1 });
purchaseOrderSchema.plugin(tenantPlugin);
export default firestore.models.PurchaseOrder || firestore.model("PurchaseOrder", purchaseOrderSchema);
