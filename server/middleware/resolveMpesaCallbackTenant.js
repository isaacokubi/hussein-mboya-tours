import Payment from "../models/Payment.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import { runWithTenant, setTenantContext } from "../tenancy/context.js";

const callbackCheckoutId = (req) => {
  const callback = req.body?.Body?.stkCallback;
  return String(callback?.CheckoutRequestID || callback?.checkoutRequestID || callback?.checkoutRequestId || "").trim();
};

export async function resolveMpesaCallbackTenant(req, res, next) {
  try {
    const checkoutRequestID = callbackCheckoutId(req);
    if (!checkoutRequestID) return next();

    const lookup = {
      $or: [
        { checkoutRequestID },
        { checkoutRequestId: checkoutRequestID },
      ],
    };

    const tenantId = await runWithTenant({ bypass: true }, async () => {
      const payment = await Payment.findOne(lookup).select("tenantId").lean();
      if (payment?.tenantId) return String(payment.tenantId);

      const subscriptionPayment = await SubscriptionPayment.findOne({
        checkoutRequestID,
      }).select("tenantId").lean();

      return subscriptionPayment?.tenantId
        ? String(subscriptionPayment.tenantId)
        : null;
    });

    if (!tenantId) return next();

    // Express middleware does not await next(). Using runWithTenant(..., next)
    // here would therefore end the AsyncLocalStorage scope before the downstream
    // callback controller runs. Set the request-scoped tenant explicitly so every
    // async operation triggered by the callback inherits the resolved tenant.
    setTenantContext({ tenantId, bypass: false });
    req.tenantId = tenantId;

    return next();
  } catch (error) {
    return next(error);
  }
}
