import * as firestore from "../config/firestore.js";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const commissionSchema = new firestore.Schema(
  {
    tenantId: { type: firestore.Schema.Types.ObjectId, ref: "Organization", index: true },
    agent: { type: firestore.Schema.Types.ObjectId, ref: "Agent", required: true, index: true },
    booking: { type: firestore.Schema.Types.ObjectId, ref: "Booking", required: true, unique: true },
    customer: { type: firestore.Schema.Types.ObjectId, ref: "User" },
    tour: { type: firestore.Schema.Types.ObjectId, ref: "Tour" },
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
    approvedBy: { type: firestore.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    rejectedBy: { type: firestore.Schema.Types.ObjectId, ref: "User", default: null },
    rejectedAt: { type: Date, default: null },
    rejectionReason: { type: String, default: "", trim: true },
    notes: { type: String, default: "", trim: true },
    financeNotes: { type: String, default: "", trim: true },
    createdBy: { type: firestore.Schema.Types.ObjectId, ref: "User" },
    updatedBy: { type: firestore.Schema.Types.ObjectId, ref: "User" },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

commissionSchema.pre("save", function (next) {
  if (!this.amount && this.bookingAmount && this.rate) this.amount = (this.bookingAmount * this.rate) / 100;
  this.refundedAmount = Math.min(Number(this.refundedAmount || 0), Number(this.amount || 0));
  this.adjustmentAmount = this.refundedAmount;
  this.adjustmentStatus = this.refundedAmount > 0 ? "posted" : "none";
  next();
});

commissionSchema.virtual("isPaid").get(function () { return this.status === "paid"; });
commissionSchema.virtual("isPending").get(function () { return this.status === "pending"; });
commissionSchema.virtual("netAmount").get(function () { return Math.max(0, Number(this.amount || 0) - Number(this.refundedAmount || 0)); });

commissionSchema.methods.approve = function (adminId) { this.status = "approved"; this.approvedBy = adminId; this.approvedAt = new Date(); return this.save(); };
commissionSchema.methods.markPaid = function (reference, method) { this.status = "paid"; this.paymentReference = reference; this.paymentMethod = method; this.paidAt = new Date(); return this.save(); };
commissionSchema.methods.reject = function (adminId, reason) { this.status = "rejected"; this.rejectedBy = adminId; this.rejectedAt = new Date(); this.rejectionReason = reason; return this.save(); };
commissionSchema.statics.getPending = function () { return this.find({ status: "pending", isDeleted: false }); };
commissionSchema.statics.getPaid = function () { return this.find({ status: "paid", isDeleted: false }); };

commissionSchema.index({ agent: 1, status: 1 });
commissionSchema.index({ paymentReference: 1 });
commissionSchema.index({ paidAt: -1 });
commissionSchema.index({ createdAt: -1 });
commissionSchema.index({ isDeleted: 1 });
commissionSchema.index({ approvedBy: 1 });
commissionSchema.index({ customer: 1 });
commissionSchema.index({ tour: 1 });

const tenantCommissionSchema = commissionSchema.plugin(tenantPlugin);
const Commission = firestore.models.Commission || firestore.model("Commission", tenantCommissionSchema);
export default Commission;
