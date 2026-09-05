import mongoose from "mongoose";
import { tenantPlugin } from "../tenancy/tenantPlugin.js";

const agentWithdrawalSchema = new mongoose.Schema(
  {
    tenantId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization", index: true },
    agent: { type: mongoose.Schema.Types.ObjectId, ref: "Agent", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, enum: ["MPESA", "BANK_TRANSFER"], required: true },
    accountName: { type: String, trim: true, required: true },
    mpesaPhone: { type: String, trim: true, default: "" },
    bankName: { type: String, trim: true, default: "" },
    bankAccountNumber: { type: String, trim: true, default: "" },
    bankBranch: { type: String, trim: true, default: "" },
    bankCode: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "processing", "completed", "rejected", "cancelled"],
      default: "pending",
      index: true,
    },
    paymentReference: { type: String, trim: true, default: "" },
    notes: { type: String, trim: true, default: "" },
    rejectionReason: { type: String, trim: true, default: "" },
    requestedAt: { type: Date, default: Date.now },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    approvedAt: { type: Date, default: null },
    processedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    processedAt: { type: Date, default: null },
    completedAt: { type: Date, default: null },
    rejectedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    rejectedAt: { type: Date, default: null },
  },
  { timestamps: true, versionKey: false }
);

agentWithdrawalSchema.index({ agent: 1, status: 1, createdAt: -1 });
agentWithdrawalSchema.index({ tenantId: 1, createdAt: -1 });

const tenantAgentWithdrawalSchema = agentWithdrawalSchema.plugin(tenantPlugin);
const AgentWithdrawal = mongoose.models.AgentWithdrawal || mongoose.model("AgentWithdrawal", tenantAgentWithdrawalSchema);

export default AgentWithdrawal;
