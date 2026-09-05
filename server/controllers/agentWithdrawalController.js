import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";
import Agent from "../models/Agent.js";
import Commission from "../models/Commission.js";
import AgentWithdrawal from "../models/AgentWithdrawal.js";

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
  return {
    paidCommission,
    reservedWithdrawals: reserved,
    withdrawn,
    availableBalance: Math.max(0, Number((paidCommission - reserved - withdrawn).toFixed(2))),
  };
};

export const getMyWithdrawalData = async (req, res, next) => {
  requireTenantId();
  try {
    const agent = await getAgentForUser(req);
    if (!agent) return res.status(404).json({ success: false, message: "Active agent profile not found." });
    const [balances, withdrawals] = await Promise.all([
      getBalances(req, agent._id),
      AgentWithdrawal.find(mergeTenantFilter(req, { agent: agent._id }))
        .sort({ createdAt: -1 })
        .limit(30)
        .lean(),
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
    if (amount > balances.availableBalance) {
      return res.status(400).json({ success: false, message: `Insufficient withdrawable commission. Available balance: KES ${balances.availableBalance.toLocaleString()}.` });
    }

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
      .sort({ createdAt: -1 })
      .lean();
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
    const reference = String(req.body?.paymentReference || req.body?.transactionId || "").trim();
    if (!reference) return res.status(400).json({ success: false, message: "Payment reference / transaction ID is required." });
    const withdrawal = await AgentWithdrawal.findOne(mergeTenantFilter(req, { _id: req.params.id }));
    if (!withdrawal) return res.status(404).json({ success: false, message: "Withdrawal request not found." });
    if (!["approved", "processing"].includes(withdrawal.status)) return res.status(400).json({ success: false, message: "Only an approved or processing withdrawal can be completed." });

    const balances = await getBalances(req, withdrawal.agent);
    const amountWithoutThisReservation = balances.availableBalance + withdrawal.amount;
    if (withdrawal.amount > amountWithoutThisReservation) return res.status(400).json({ success: false, message: "Withdrawal can no longer be funded by the available commission balance." });

    withdrawal.status = "completed";
    withdrawal.paymentReference = reference;
    withdrawal.processedBy = req.user._id;
    withdrawal.processedAt = new Date();
    withdrawal.completedAt = new Date();
    await withdrawal.save();

    const updatedBalances = await getBalances(req, withdrawal.agent);
    const agent = await Agent.findOne(mergeTenantFilter(req, { _id: withdrawal.agent }));
    if (agent) {
      agent.walletBalance = updatedBalances.availableBalance;
      agent.paidCommission = updatedBalances.paidCommission;
      await agent.save();
    }

    return res.json({ success: true, message: "Withdrawal marked as completed and deducted from the agent wallet.", data: withdrawal, balances: updatedBalances });
  } catch (error) { next(error); }
};
