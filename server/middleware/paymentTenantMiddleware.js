import Payment from "../models/Payment.js";
import { runWithTenant, setTenantContext } from "../tenancy/context.js";
import Organization from "../models/Organization.js";

async function resolvePaymentTenant(req) {
  const checkoutRequestID = String(req.body?.Body?.stkCallback?.CheckoutRequestID || "").trim();
  const conversationId = String(req.body?.Result?.ConversationID || req.body?.Result?.OriginatorConversationID || "").trim();
  const payment = await runWithTenant({ bypass: true }, async () => {
    if (checkoutRequestID) return Payment.findOne({ $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }] }).lean();
    if (conversationId) return Payment.findOne({ refundReference: conversationId }).lean();
    return null;
  });
  if (!payment?.tenantId) return null;
  const tenant = await runWithTenant({ bypass: true }, () => Organization.findById(payment.tenantId).lean());
  if (!tenant) return null;
  setTenantContext({ tenantId: payment.tenantId, tenant, bypass: false });
  req.tenant = tenant;
  req.tenantId = payment.tenantId;
  return payment;
}

export async function resolveMpesaPaymentTenant(req, res, next) {
  try {
    await resolvePaymentTenant(req);
    next();
  } catch (error) {
    console.error("PAYMENT TENANT RESOLUTION ERROR:", error.message);
    // Unknown callbacks are still acknowledged by the provider-facing
    // controller; never expose tenant existence through this middleware.
    next();
  }
}
