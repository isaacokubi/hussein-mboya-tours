import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const expenseSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", required: true, index: true },
  expenseNumber: { type: String, trim: true },
  category: { type: String, trim: true, required: true },
  supplierName: { type: String, trim: true, default: "" },
  supplierPin: { type: String, trim: true, uppercase: true, default: "" },
  description: { type: String, trim: true, required: true },
  amount: { type: Number, min: 0, required: true },
  taxAmount: { type: Number, min: 0, default: 0 },
  currency: { type: String, uppercase: true, default: "KES" },
  expenseDate: { type: Date, default: Date.now, index: true },
  paymentMethod: { type: String, enum: ["MPESA", "CARD", "BANK_TRANSFER", "CASH", "OTHER"], default: "BANK_TRANSFER" },
  paymentReference: { type: String, trim: true, default: "" },
  etimsInvoiceNumber: { type: String, trim: true, default: "" },
  status: { type: String, enum: ["draft", "approved", "paid", "cancelled"], default: "draft", index: true },
  notes: { type: String, trim: true, default: "" },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });

expenseSchema.pre("save", function(next) {
  if (!this.expenseNumber) this.expenseNumber = `EXP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  next();
});

expenseSchema.index({ tenantId: 1, expenseNumber: 1 }, { unique: true });
expenseSchema.plugin(tenantPlugin);
export default mongoose.models.Expense || mongoose.model("Expense", expenseSchema);
