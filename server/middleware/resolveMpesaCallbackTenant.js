import Payment from "../models/Payment.js";
import { runWithTenant } from "../tenancy/context.js";

const callbackCheckoutId = (req) => {
  const callback = req.body?.Body?.stkCallback;
  return String(callback?.CheckoutRequestID || callback?.checkoutRequestID || callback?.checkoutRequestId || "").trim();
};

export async function resolveMpesaCallbackTenant(req, res, next) {
  try {
    const checkoutRequestID = callbackCheckoutId(req);
    if (!checkoutRequestID) return next();

    const payment = await runWithTenant({ bypass: true }, () => Payment.findOne({
      $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }],
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
