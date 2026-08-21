import Payment from "../models/Payment.js";
import { runWithTenant } from "../tenancy/context.js";

export async function resolveMpesaRefundTenant(req, res, next) {
  try {
    const result = req.body?.Result;
    const conversationId = String(result?.ConversationID || result?.OriginatorConversationID || "").trim();
    if (!conversationId) return next();

    const payment = await runWithTenant({ bypass: true }, () => Payment.findOne({
      refundReference: conversationId,
    }).select("_id tenantId").lean());

    if (!payment?.tenantId) return next();

    return runWithTenant({ tenantId: payment.tenantId, bypass: false }, () => {
      req.tenantId = payment.tenantId;
      next();
    });
  } catch (error) {
    next(error);
  }
}
