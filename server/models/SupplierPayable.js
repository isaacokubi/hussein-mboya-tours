import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const supplierPayableSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  payableNumber: { type: String, trim: true },
  supplier: { type: mongoose.Schema.Types.ObjectId, ref: "Supplier", required: true, index: true },
  purchaseOrder: { type: mongoose.Schema.Types.ObjectId, ref: "PurchaseOrder", default: null, index: true },
  expense: { type: mongoose.Schema.Types.ObjectId, ref: "Expense", default: null, index: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", default: null, index: true },
  tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour", default: null, index: true },
  amount: { type: Number, required: true, min: 0 },
  amountPaid: { type: Number, min: 0, default: 0 },
  balance: { type: Number, min: 0, default: 0 },
  dueDate: { type: Date, default: null, index: true },
  status: { type: String, enum: ["open", "partially_paid", "paid", "overdue", "cancelled"], default: "open", index: true },
  paymentReference: { type: String, trim: true, default: "" },
  notes: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

supplierPayableSchema.pre("validate", function(next) {
  if (this.amountPaid > this.amount) return next(new Error("Supplier payable payment cannot exceed the payable amount."));
  this.balance = Math.max(0, Math.round((this.amount - this.amountPaid) * 100) / 100);
  if (this.status !== "cancelled") this.status = this.balance === 0 ? "paid" : this.amountPaid > 0 ? "partially_paid" : (this.dueDate && new Date(this.dueDate) < new Date() ? "overdue" : "open");
  next();
});
supplierPayableSchema.pre("save", function(next) { if (!this.payableNumber) this.payableNumber = `PAY-${Date.now()}-${Math.floor(Math.random() * 10000)}`; next(); });
supplierPayableSchema.index({ tenantId: 1, payableNumber: 1 }, { unique: true });
supplierPayableSchema.plugin(tenantPlugin);
export default mongoose.models.SupplierPayable || mongoose.model("SupplierPayable", supplierPayableSchema);
