// Import Mongoose to define commission records and their validation rules.
import mongoose from "mongoose";
// Import the plugin that applies tenant isolation to commission queries/writes.
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

// Define the database schema for commissions earned by travel agents.
const commissionSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true }, // Organization that owns the commission record.
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", required: true, index: true }, // Agent who earned the commission.
    booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true }, // Booking that generated this commission; one record per booking.
    customer: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Customer associated with the booking, when available.
    tour: { type: mongoose.Schema.Types.ObjectId, ref: "Tour" }, // Tour associated with the commission, when available.
    bookingAmount: { type: Number, required: true, min: 0 }, // Base booking amount used to calculate commission.
    rate: { type: Number, required: true, default: 10, min: 0, max: 100 }, // Commission percentage.
    amount: { type: Number, required: true, min: 0 }, // Commission amount before refund adjustments.
    refundedAmount: { type: Number, default: 0, min: 0 }, // Portion of commission reversed because the booking was refunded.
    adjustmentAmount: { type: Number, default: 0, min: 0 }, // Amount posted as a finance adjustment after a refund.
    adjustmentStatus: { type: String, enum: ["none", "pending", "posted"], default: "none" }, // State of the refund-related accounting adjustment.
    adjustmentAt: { type: Date, default: null }, // Time the adjustment was posted.
    status: { type: String, enum: ["pending", "approved", "processing", "paid", "cancelled", "rejected"], default: "pending" }, // Commission payout lifecycle state.
    paymentMethod: { type: String, enum: ["BANK_TRANSFER", "MPESA", "CASH", "CHEQUE"] }, // Method used to pay the commission.
    paymentReference: { type: String, trim: true, default: "" }, // Payment/transfer reference for reconciliation.
    transactionId: { type: String, trim: true, default: "" }, // Provider or bank transaction identifier.
    paidAt: { type: Date, default: null }, // Time the commission payout was recorded as paid.
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Administrator who approved the payout.
    approvedAt: { type: Date, default: null }, // Time of commission approval.
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null }, // Administrator who rejected the payout.
    rejectedAt: { type: Date, default: null }, // Time of commission rejection.
    rejectionReason: { type: String, default: "", trim: true }, // Explanation for a rejected commission.
    notes: { type: String, default: "", trim: true }, // General operational notes.
    financeNotes: { type: String, default: "", trim: true }, // Accounting notes about payout/refund adjustments.
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who created the record.
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User who last updated the record.
    isDeleted: { type: Boolean, default: false }, // Soft-delete flag that preserves the audit record.
    deletedAt: { type: Date, default: null }, // Time the record was soft-deleted.
  },
  // Automatically maintain creation/update timestamps and include virtual properties in serialized documents.
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

// Recalculate derived commission/refund fields before the record is persisted.
commissionSchema.pre("save", function (next) {
  // Calculate the commission from booking amount and rate when amount has not been supplied.
  if (!this.amount && this.bookingAmount && this.rate) this.amount = (this.bookingAmount * this.rate) / 100;
  // Ensure the refunded amount never exceeds the original commission.
  this.refundedAmount = Math.min(Number(this.refundedAmount || 0), Number(this.amount || 0));
  // Keep the accounting adjustment amount synchronized with the refunded commission.
  this.adjustmentAmount = this.refundedAmount;
  // Mark the adjustment posted when a refund adjustment exists, otherwise none.
  this.adjustmentStatus = this.refundedAmount > 0 ? "posted" : "none";
  // Continue the Mongoose save lifecycle.
  next();
});

// Expose whether the commission payout has been completed.
commissionSchema.virtual("isPaid").get(function () { return this.status === "paid"; });
// Expose whether the commission is awaiting action.
commissionSchema.virtual("isPending").get(function () { return this.status === "pending"; });
// Calculate the commission value remaining after refund adjustments.
commissionSchema.virtual("netAmount").get(function () { return Math.max(0, Number(this.amount || 0) - Number(this.refundedAmount || 0)); });

// Mark the commission approved and record who approved it and when.
commissionSchema.methods.approve = function (adminId) { this.status = "approved"; this.approvedBy = adminId; this.approvedAt = new Date(); return this.save(); };
// Mark the commission paid and store its payment reference, method and timestamp.
commissionSchema.methods.markPaid = function (reference, method) { this.status = "paid"; this.paymentReference = reference; this.paymentMethod = method; this.paidAt = new Date(); return this.save(); };
// Reject the commission payout and store the administrator and reason.
commissionSchema.methods.reject = function (adminId, reason) { this.status = "rejected"; this.rejectedBy = adminId; this.rejectedAt = new Date(); this.rejectionReason = reason; return this.save(); };
// Return commissions awaiting approval or payout.
commissionSchema.statics.getPending = function () { return this.find({ status: "pending", isDeleted: false }); };
// Return commissions already marked as paid.
commissionSchema.statics.getPaid = function () { return this.find({ status: "paid", isDeleted: false }); };

// Index agent/status queries used by commission management screens.
commissionSchema.index({ agent: 1, status: 1 });
// Index payout references used during payment reconciliation.
commissionSchema.index({ paymentReference: 1 });
// Index paid commissions by payment date.
commissionSchema.index({ paidAt: -1 });
// Index newest commission records first for history screens.
commissionSchema.index({ createdAt: -1 });
// Index soft-deletion state for active-record filters.
commissionSchema.index({ isDeleted: 1 });
// Index commissions by the approving administrator.
commissionSchema.index({ approvedBy: 1 });
// Index commissions by customer.
commissionSchema.index({ customer: 1 });
// Index commissions by tour.
commissionSchema.index({ tour: 1 });

// Apply tenant isolation before registering the model.
const tenantCommissionSchema = commissionSchema.plugin(tenantPlugin);
// Reuse the registered model during reloads or register it for the first time.
const Commission = mongoose.models.Commission || mongoose.model("Commission", tenantCommissionSchema);
// Export the model for commission controllers and finance services.
export default Commission;
