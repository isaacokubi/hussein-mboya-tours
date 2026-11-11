/**
 * Purpose: resolve Mpesa Callback Tenant request middleware. Main declarations: callbackCheckoutId, resolveMpesaCallbackTenant.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Payment from "../models/Payment.js";
// Load ../models/SubscriptionPayment.js so this module can use its exported dependencies.
import SubscriptionPayment from "../models/SubscriptionPayment.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { runWithTenant, setTenantContext } from "../tenancy/context.js";

// Declare callbackCheckoutId for use by the surrounding module or function.
const callbackCheckoutId = (req) => {
  // Declare callback for use by the surrounding module or function.
  const callback = req.body?.Body?.stkCallback;
  // Return the result of String(callback?.CheckoutRequestID || callback?.checkoutRequestID || callback?.checkoutRequestId || "").trim() to the caller.
  return String(callback?.CheckoutRequestID || callback?.checkoutRequestID || callback?.checkoutRequestId || "").trim();
};

// Define resolveMpesaCallbackTenant; its parameters and body implement this operation.
export async function resolveMpesaCallbackTenant(req, res, next) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare checkoutRequestID for use by the surrounding module or function.
    const checkoutRequestID = callbackCheckoutId(req);
    // Check the condition (!checkoutRequestID) and run the matching branch.
    if (!checkoutRequestID) return next();

    // Declare lookup for use by the surrounding module or function.
    const lookup = {
      $or: [
        { checkoutRequestID },
        { checkoutRequestId: checkoutRequestID },
      ],
    };

    // Declare tenantId for use by the surrounding module or function.
    const tenantId = await runWithTenant({ bypass: true }, async () => {
      // Declare payment for use by the surrounding module or function.
      const payment = await Payment.findOne(lookup).select("tenantId").lean();
      // Check the condition (payment?.tenantId) and run the matching branch.
      if (payment?.tenantId) return String(payment.tenantId);

      // Declare subscriptionPayment for use by the surrounding module or function.
      const subscriptionPayment = await SubscriptionPayment.findOne({
        checkoutRequestID,
      }).select("tenantId").lean();

      // Return the expression shown below to the caller.
      return subscriptionPayment?.tenantId
        ? String(subscriptionPayment.tenantId)
        : null;
    });

    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return next();

    // Express middleware does not await next(). Using runWithTenant(..., next)
    // here would therefore end the AsyncLocalStorage scope before the downstream
    // callback controller runs. Set the request-scoped tenant explicitly so every
    // async operation triggered by the callback inherits the resolved tenant.
    // Perform the side effect or state update expressed on the following line.
    setTenantContext({ tenantId, bypass: false });
    // Perform the side effect or state update expressed on the following line.
    req.tenantId = tenantId;

    // Return the result of next() to the caller.
    return next();
  } catch (error) {
    // Return the result of next() to the caller.
    return next(error);
  }
}
