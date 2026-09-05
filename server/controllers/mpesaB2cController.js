import AgentWithdrawal from "../models/AgentWithdrawal.js";
import { mergeTenantFilter } from "../tenancy/context.js";

const resultParameter = (parameters, key) => {
  const item = (parameters || []).find((entry) => entry?.Key === key);
  return item?.Value ?? "";
};

const applyAgentWallet = async (withdrawal) => {
  // Wallet balances are calculated from paid commissions minus completed/reserved withdrawals.
  // The normal agent dashboard calculation will therefore reflect the completed payout.
  return withdrawal;
};

export const mpesaB2cResult = async (req, res) => {
  try {
    const result = req.body?.Result || {};
    const conversationId = String(result.ConversationID || "").trim();
    const originatorConversationId = String(result.OriginatorConversationID || "").trim();
    const resultCode = Number(result.ResultCode);
    const resultDescription = String(result.ResultDesc || "").trim();

    let withdrawal = null;
    if (conversationId) withdrawal = await AgentWithdrawal.findOne({ conversationId });
    if (!withdrawal && originatorConversationId) {
      withdrawal = await AgentWithdrawal.findOne({ originatorConversationId });
    }

    if (!withdrawal) {
      console.error("MPESA B2C callback could not find withdrawal", { conversationId, originatorConversationId });
      return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    withdrawal.resultCode = Number.isFinite(resultCode) ? resultCode : null;
    withdrawal.resultDescription = resultDescription;

    if (resultCode === 0) {
      const transactionId = String(resultParameter(result.ResultParameters?.ResultParameter, "TransactionID") || "").trim();
      withdrawal.status = "completed";
      withdrawal.paymentReference = transactionId || withdrawal.paymentReference || conversationId;
      withdrawal.processedAt = withdrawal.processedAt || new Date();
      withdrawal.completedAt = new Date();
      await withdrawal.save();
      await applyAgentWallet(withdrawal);
      console.log("MPESA B2C PAYOUT COMPLETED", { withdrawalId: withdrawal._id.toString(), transactionId });
    } else {
      // Failed B2C payouts must release the reservation so the agent can request again.
      withdrawal.status = "rejected";
      withdrawal.rejectionReason = resultDescription || "M-Pesa B2C payout failed.";
      withdrawal.rejectedAt = new Date();
      await withdrawal.save();
      console.error("MPESA B2C PAYOUT FAILED", { withdrawalId: withdrawal._id.toString(), resultCode, resultDescription });
    }

    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("MPESA B2C RESULT CALLBACK ERROR:", error);
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};

export const mpesaB2cTimeout = async (req, res) => {
  try {
    const result = req.body?.Result || {};
    const conversationId = String(result.ConversationID || "").trim();
    const originatorConversationId = String(result.OriginatorConversationID || "").trim();
    let withdrawal = null;
    if (conversationId) withdrawal = await AgentWithdrawal.findOne({ conversationId });
    if (!withdrawal && originatorConversationId) withdrawal = await AgentWithdrawal.findOne({ originatorConversationId });
    if (withdrawal && ["approved", "processing"].includes(withdrawal.status)) {
      withdrawal.status = "rejected";
      withdrawal.rejectionReason = "M-Pesa B2C request timed out.";
      withdrawal.rejectedAt = new Date();
      withdrawal.resultDescription = withdrawal.rejectionReason;
      await withdrawal.save();
    }
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("MPESA B2C TIMEOUT CALLBACK ERROR:", error);
    return res.status(200).json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};
