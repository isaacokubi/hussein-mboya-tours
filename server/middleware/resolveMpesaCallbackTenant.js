import Payment from "../models/Payment.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import { runWithTenant } from "../tenancy/context.js";

const callbackCheckoutId = (req) => {
  const callback = req.body?.Body?.stkCallback;
  return String(callback?.CheckoutRequestID || callback?.checkoutRequestID || callback?.checkoutRequestId || "").trim();
};

export async function resolveMpesaCallbackTenant(req, res, next) {
  try {
    const checkoutRequestID = callbackCheckoutId(req);
    if (!checkoutRequestID) return next();
    const lookup = { $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }] };
    const tenantId = await runWithTenant({ bypass: true }, async () => {
      const payment = await Payment.findOne(lookup).select("tenantId").lean();
      if (payment?.tenantId) return payment.tenantId;
      const subscriptionPayment = await SubscriptionPayment.findOne({ checkoutRequestID }).select("tenantId").lean();
      return subscriptionPayment?.tenantId || null;
    });
    if (!tenantId) return next();
    return runWithTenant({ tenantId, bypass: false }, () => {
      req.tenantId = tenantId;
      next();
    });
  } catch (error) { next(error); }
}
