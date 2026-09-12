import Payment from "../models/Payment.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import { queryStkPush, classifyStkQueryResult } from "../services/mpesaQueryService.js";
import { mergeTenantFilter } from "../tenancy/context.js";

const checkoutIdOf = (req) => String(req.body?.Body?.stkCallback?.CheckoutRequestID || req.body?.Body?.stkCallback?.checkoutRequestID || req.body?.Body?.stkCallback?.checkoutRequestId || "").trim();

export const verifyMpesaCallbackIntegrity = async (req, res, next) => {
  try {
    const callback = req.body?.Body?.stkCallback;
    if (!callback) return next();
    if (Number(callback.ResultCode) !== 0) return next();

    const checkoutRequestID = checkoutIdOf(req);
    if (!checkoutRequestID) return res.status(400).json({ ResultCode: 1, ResultDesc: "Missing CheckoutRequestID." });

    const tenantId = String(req.tenantId || req.tenant?.tenantId || req.tenant?.id || "").trim();
    const payment = tenantId
      ? await Payment.findOne(mergeTenantFilter(req, { $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }] })).select("_id").lean()
      : null;
    const subscriptionPayment = tenantId
      ? await SubscriptionPayment.findOne({ tenantId, checkoutRequestID }).select("_id").lean()
      : null;

    if (!payment && !subscriptionPayment) {
      return res.status(400).json({ ResultCode: 1, ResultDesc: "Unknown CheckoutRequestID." });
    }

    const config = tenantId ? undefined : null;
    const queryResult = await queryStkPush(checkoutRequestID, config);
    const providerState = classifyStkQueryResult(queryResult?.ResultCode);
    if (providerState !== "completed") {
      return res.status(409).json({ ResultCode: 1, ResultDesc: "M-Pesa provider verification did not confirm a completed payment." });
    }
    return next();
  } catch (error) {
    console.error("M-Pesa callback integrity verification failed:", error.message);
    return res.status(503).json({ ResultCode: 1, ResultDesc: "Unable to verify M-Pesa callback with the provider." });
  }
};

export default verifyMpesaCallbackIntegrity;
