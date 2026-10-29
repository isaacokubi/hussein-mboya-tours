import Payment from "../models/Payment.js";
import SubscriptionPayment from "../models/SubscriptionPayment.js";
import { queryStkPush, classifyStkQueryResult } from "../services/mpesaQueryService.js";
import { mergeTenantFilter } from "../tenancy/context.js";
import { getTenantMpesaConfig } from "../services/paymentGatewayService.js";
import { hasLegacyMpesaConfig, mpesaConfig } from "../config/mpesa.js";
import { getCheckoutRequestId, getStkCallback, validateStkCallback } from "../services/mpesaCallbackPayload.js";

export const validateMpesaCallbackPayload = (req, res, next) => {
  const validationError = validateStkCallback(getStkCallback(req.body));
  if (validationError) return res.status(400).json({ ResultCode: 1, ResultDesc: validationError });
  return next();
};

export const createVerifyMpesaCallbackIntegrity = ({
  findPayment = (filter) => Payment.findOne(filter).select("_id providerEnvironment").lean(),
  findSubscriptionPayment = (filter) => SubscriptionPayment.findOne(filter).select("_id").lean(),
  providerQuery = queryStkPush,
  legacyConfigCheck = hasLegacyMpesaConfig,
  legacyConfig = mpesaConfig,
} = {}) => async (req, res, next) => {
  try {
    const callback = getStkCallback(req.body);
    const validationError = validateStkCallback(callback);
    if (validationError) return res.status(400).json({ ResultCode: 1, ResultDesc: validationError });

    const checkoutRequestID = getCheckoutRequestId(callback);

    const tenantId = String(req.tenantId || req.tenant?.tenantId || req.tenant?.id || "").trim();
    const payment = tenantId
      ? await findPayment(mergeTenantFilter(req, { $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }] }))
      : null;
    const subscriptionPayment = tenantId
      ? await findSubscriptionPayment({ tenantId, checkoutRequestID })
      : null;

    if (!payment && !subscriptionPayment) {
      return res.status(400).json({ ResultCode: 1, ResultDesc: "Unknown CheckoutRequestID." });
    }

    const config = subscriptionPayment && legacyConfigCheck() ? legacyConfig : undefined;
    const paymentConfig = payment?.providerEnvironment
      ? await getTenantMpesaConfig({ environment: payment.providerEnvironment, allowDisabled: true })
      : null;
    const queryResult = await providerQuery(checkoutRequestID, paymentConfig || config);
    const providerState = classifyStkQueryResult(queryResult?.ResultCode);
    const callbackState = classifyStkQueryResult(callback.ResultCode);
    if (providerState === "pending" || callbackState !== providerState) {
      return res.status(409).json({ ResultCode: 1, ResultDesc: "M-Pesa callback state could not be verified with the provider." });
    }
    return next();
  } catch (error) {
    console.error("M-Pesa callback integrity verification failed:", { code: error?.code || "CALLBACK_VERIFY_FAILED" });
    return res.status(503).json({ ResultCode: 1, ResultDesc: "Unable to verify M-Pesa callback with the provider." });
  }
};

export const verifyMpesaCallbackIntegrity = createVerifyMpesaCallbackIntegrity();

export default verifyMpesaCallbackIntegrity;
