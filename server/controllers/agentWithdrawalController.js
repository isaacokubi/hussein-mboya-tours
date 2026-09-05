import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Agent from "../models/Agent.js";
import Commission from "../models/Commission.js";
import AgentWithdrawal from "../models/AgentWithdrawal.js";
import { initiateMpesaB2CPayout } from "../services/mpesaB2cService.js";

const getAgentForUser = async (req) =>
  Agent.findOne(mergeTenantFilter(req, { user: req.user._id, status: "active" }));

const getBalances = async (req, agentId) => {
  const base = mergeTenantFilter(req, { agent: agentId, isDeleted: { $ne: true } });
  const [paidResult, reservedResult, completedResult] = await Promise.all([
    Commission.aggregate([
      { $match: { ...base, status: "paid" } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } },
    ]),
    AgentWithdrawal.aggregate([
      { $match: { ...mergeTenantFilter(req, { agent: agentId, status: { $in: ["pending", "approved", "processing"] } }) } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } },
    ]),
    AgentWithdrawal.aggregate([
      { $match: { ...mergeTenantFilter(req, { agent: agentId, status: "completed" }) } },
      { $group: { _id: null, total: { $sum: { $ifNull: ["$amount", 0] } } } },
    ]),
  ]);
  const paidCommission = Number(paidResult[0]?.total || 0);
  const reserved = Number(reservedResult[0]?.total || 0);
  const withdrawn = Number(completedResult[0]?.total || 0);
  return { paidCommission, reservedWithdrawals: reserved, withdrawn, availableBalance: Math.max(0, Number((paidCommission - reserved - withdrawn).toFixed(2))) };
};

export const getMyWithdrawalData = async (req, res, next) => {
  requireTenantId();
  try {
    const agent = await getAgentForUser(req);
    if (!agent) return res.status(404).json({ success: false, message: "Active agent profile not found." });
    const [balances, withdrawals] = await Promise.all([
      getBalances(req, agent._id),
      AgentWithdrawal.find(mergeTenantFilter(req, { agent: agent._id })).sort({ createdAt: -1 }).limit(30).lean(),
    ]);
    return res.json({ success: true, data: { balances, withdrawals } });
  } catch (error) { next(error); }
};

export const requestWithdrawal = async (req, res, next) => {
  requireTenantId();
  try {
    const agent = await getAgentForUser(req);
    if (!agent) return res.status(404).json({ success: false, message: "Active agent profile not found." });
    const amount = Number(req.body?.amount);
    const method = String(req.body?.method || "MPESA").toUpperCase();
    const accountName = String(req.body?.accountName || "").trim();
    const mpesaPhone = String(req.body?.mpesaPhone || "").trim();
    const bankName = String(req.body?.bankName || "").trim();
    const bankAccountNumber = String(req.body?.bankAccountNumber || "").trim();
    const bankBranch = String(req.body?.bankBranch || "").trim();
    const bankCode = String(req.body?.bankCode || "").trim();
    if (!Number.isFinite(amount) || amount <= 0) return res.status(400).json({ success: false, message: "Enter a valid withdrawal amount." });
    if (!["MPESA", "BANK_TRANSFER"].includes(method)) return res.status(400).json({ success: false, message: "Choose M-Pesa or bank transfer." });
    if (!accountName) return res.status(400).json({ success: false, message: "Account name is required." });
    if (method === "MPESA" && !mpesaPhone) return res.status(400).json({ success: false, message: "M-Pesa phone number is required." });
    if (method === "BANK_TRANSFER" && (!bankName || !bankAccountNumber)) return res.status(400).json({ success: false, message: "Bank name and account number are required." });
    const balances = await getBalances(req, agent._id);
    if (amount > balances.availableBalance) return res.status(400).json({ success: false, message: `Insufficient withdrawable commission. Available balance: KES ${balances.availableBalance.toLocaleString()}.` });
    const withdrawal = await AgentWithdrawal.create({
      agent: agent._id,
      amount: Number(amount.toFixed(2)),
      method,
      accountName,
      mpesaPhone: method === "MPESA" ? mpesaPhone : "",
      bankName: method === "BANK_TRANSFER" ? bankName : "",
      bankAccountNumber: method === "BANK_TRANSFER" ? bankAccountNumber : "",
      bankBranch: method === "BANK_TRANSFER" ? bankBranch : "",
      bankCode: method === "BANK_TRANSFER" ? bankCode : "",
      notes: String(req.body?.notes || "").trim(),
    });
    return res.status(201).json({ success: true, message: "Withdrawal request submitted successfully.", data: withdrawal, balances: await getBalances(req, agent._id) });
  } catch (error) { next(error); }
};

export const getWithdrawals = async (req, res, next) => {
  requireTenantId();
  try {
    const withdrawals = await AgentWithdrawal.find(mergeTenantFilter(req, {}))
      .populate({ path: "agent", populate: { path: "user", select: "name email phone" } })
      .populate("approvedBy", "name email")
      .populate("processedBy", "name email")
      .sort({ createdAt: -1 }).lean();
    return res.json({ success: true, data: withdrawals });
  } catch (error) { next(error); }
};

export const approveWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await AgentWithdrawal.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!withdrawal) return res.status(404).json({ success: false, message: "Withdrawal request not found." });
    if (withdrawal.status !== "pending") return res.status(400).json({ success: false, message: `Withdrawal is already ${withdrawal.status}.` });
    withdrawal.status = "approved";
    withdrawal.approvedBy = req.user._id;
    withdrawal.approvedAt = new Date();
    await withdrawal.save();
    return res.json({ success: true, message: "Withdrawal approved.", data: withdrawal });
  } catch (error) { next(error); }
};

export const rejectWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await AgentWithdrawal.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!withdrawal) return res.status(404).json({ success: false, message: "Withdrawal request not found." });
    if (!["pending", "approved"].includes(withdrawal.status)) return res.status(400).json({ success: false, message: `Withdrawal is already ${withdrawal.status}.` });
    withdrawal.status = "rejected";
    withdrawal.rejectedBy = req.user._id;
    withdrawal.rejectedAt = new Date();
    withdrawal.rejectionReason = String(req.body?.reason || "Rejected by finance.").trim();
    await withdrawal.save();
    return res.json({ success: true, message: "Withdrawal rejected.", data: withdrawal });
  } catch (error) { next(error); }
};

export const completeWithdrawal = async (req, res, next) => {
  try {
    const withdrawal = await AgentWithdrawal.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!withdrawal) return res.status(404).json({ success: false, message: "Withdrawal request not found." });
    if (!["approved", "processing"].includes(withdrawal.status)) return res.status(400).json({ success: false, message: "Only an approved or processing withdrawal can be paid." });

    const balances = await getBalances(req, withdrawal.agent);
    const amountWithoutThisReservation = Number((balances.availableBalance + withdrawal.amount).toFixed(2));
    if (withdrawal.amount > amountWithoutThisReservation) return res.status(400).json({ success: false, message: "Withdrawal can no longer be funded by the available commission balance." });

    if (withdrawal.method === "MPESA") {
      if (withdrawal.status === "processing" && withdrawal.conversationId) {
        return res.json({ success: true, message: "M-Pesa payout is already being processed by Safaricom.", data: withdrawal });
      }
      withdrawal.status = "processing";
      withdrawal.processedBy = req.user._id;
      withdrawal.processedAt = new Date();
      await withdrawal.save();

      try {
        const response = await initiateMpesaB2CPayout({ amount: withdrawal.amount, phone: withdrawal.mpesaPhone, withdrawalId: withdrawal._id.toString() });
        withdrawal.conversationId = String(response.ConversationID || "").trim();
        withdrawal.originatorConversationId = String(response.OriginatorConversationID || "").trim();
        withdrawal.resultDescription = String(response.ResponseDescription || "M-Pesa payout request accepted.").trim();
        await withdrawal.save();
        return res.status(202).json({ success: true, message: "M-Pesa payout sent to Safaricom for processing. The agent will receive the money on the requested M-Pesa number when Safaricom completes the transaction.", data: withdrawal });
      } catch (error) {
        withdrawal.status = "rejected";
        withdrawal.rejectionReason = error.message;
        withdrawal.resultDescription = error.message;
        await withdrawal.save();
        return res.status(502).json({ success: false, message: error.message || "M-Pesa payout could not be initiated." });
      }
    }

    // Bank transfers remain manual until a bank disbursement API is configured.
    const reference = String(req.body?.paymentReference || req.body?.transactionId || "").trim();
    if (!reference) return res.status(400).json({ success: false, message: "Enter the actual bank transfer reference before completing a bank withdrawal." });
    withdrawal.status = "completed";
    withdrawal.paymentReference = reference;
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    withdrawal.completedAt = new Date();
    await withdrawal.save();
    const updatedBalances = await getBalances(req, withdrawal.agent);
    return res.json({ success: true, message: "Bank withdrawal completed and deducted from the agent wallet.", data: withdrawal, balances: updatedBalances });
  } catch (error) { next(error); }
};
