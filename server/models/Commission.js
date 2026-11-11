/**
 * Purpose: Commission database model. The statements below implement this module responsibilities.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import mongoose from "mongoose";
// Load ../tenancy/tenantPlugin.js so this module can use its exported dependencies.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Declare commissionSchema for use by the surrounding module or function.
const commissionSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", required: true, index: true },
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour" },
    bookingAmount: { type: Number, required: true, min: 0 },
    rate: { type: Number, required: true, default: 10, min: 0, max: 100 },
    amount: { type: Number, required: true, min: 0 },
    refundedAmount: { type: Number, default: 0, min: 0 },
    adjustmentAmount: { type: Number, default: 0, min: 0 },
    adjustmentStatus: { type: String, enum: ["none", "pending", "posted"], default: "none" },
    adjustmentAt: { type: Date, default: null },
    status: { type: String, enum: ["pending", "approved", "processing", "paid", "cancelled", "rejected"], default: "pending" },
    paymentMethod: { type: String, enum: ["BANK_TRANSFER", "MPESA", "CASH", "CHEQUE"] },
    paymentReference: { type: String, trim: true, default: "" },
    transactionId: { type: String, trim: true, default: "" },
    paidAt: { type: Date, default: null },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    financeNotes: { type: String, default: "", trim: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Perform the side effect or state update expressed on the following line.
commissionSchema.pre("save", function (next) {
  // Check the condition (!this.amount && this.bookingAmount && this.rate) and run the matching branch.
  if (!this.amount && this.bookingAmount && this.rate) this.amount = (this.bookingAmount * this.rate) / 100;
  // Perform the side effect or state update expressed on the following line.
  this.refundedAmount = Math.min(Number(this.refundedAmount || 0), Number(this.amount || 0));
  // Perform the side effect or state update expressed on the following line.
  this.adjustmentAmount = this.refundedAmount;
  // Perform the side effect or state update expressed on the following line.
  this.adjustmentStatus = this.refundedAmount > 0 ? "posted" : "none";
  // Perform the side effect or state update expressed on the following line.
  next();
});

// Perform the side effect or state update expressed on the following line.
commissionSchema.virtual("isPaid").get(function () { return this.status === "paid"; });
// Perform the side effect or state update expressed on the following line.
commissionSchema.virtual("isPending").get(function () { return this.status === "pending"; });
// Perform the side effect or state update expressed on the following line.
commissionSchema.virtual("netAmount").get(function () { return Math.max(0, Number(this.amount || 0) - Number(this.refundedAmount || 0)); });

// Perform the side effect or state update expressed on the following line.
commissionSchema.methods.approve = function (adminId) { this.status = "approved"; this.approvedBy = adminId; this.approvedAt = new Date(); return this.save(); };
// Perform the side effect or state update expressed on the following line.
commissionSchema.methods.markPaid = function (reference, method) { this.status = "paid"; this.paymentReference = reference; this.paymentMethod = method; this.paidAt = new Date(); return this.save(); };
// Perform the side effect or state update expressed on the following line.
commissionSchema.methods.reject = function (adminId, reason) { this.status = "rejected"; this.rejectedBy = adminId; this.rejectedAt = new Date(); this.rejectionReason = reason; return this.save(); };
// Perform the side effect or state update expressed on the following line.
commissionSchema.statics.getPending = function () { return this.find({ status: "pending", isDeleted: false }); };
// Perform the side effect or state update expressed on the following line.
commissionSchema.statics.getPaid = function () { return this.find({ status: "paid", isDeleted: false }); };

// Perform the side effect or state update expressed on the following line.
commissionSchema.index({ agent: 1, status: 1 });
// Perform the side effect or state update expressed on the following line.
commissionSchema.index({ paymentReference: 1 });
// Perform the side effect or state update expressed on the following line.
commissionSchema.index({ paidAt: -1 });
// Perform the side effect or state update expressed on the following line.
commissionSchema.index({ createdAt: -1 });
// Perform the side effect or state update expressed on the following line.
commissionSchema.index({ isDeleted: 1 });
// Perform the side effect or state update expressed on the following line.
commissionSchema.index({ approvedBy: 1 });
// Perform the side effect or state update expressed on the following line.
commissionSchema.index({ customer: 1 });
// Perform the side effect or state update expressed on the following line.
commissionSchema.index({ tour: 1 });

// Declare tenantCommissionSchema for use by the surrounding module or function.
const tenantCommissionSchema = commissionSchema.plugin(tenantPlugin);
// Declare Commission for use by the surrounding module or function.
const Commission = mongoose.models.Commission || mongoose.model("Commission", tenantCommissionSchema);
export default Commission;
