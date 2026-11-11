/**
 * Purpose: mpesa Callback Integrity request middleware. Main declarations: validateMpesaCallbackPayload, createVerifyMpesaCallbackIntegrity.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import Payment from "../models/Payment.js";
// Load ../models/SubscriptionPayment.js so this module can use its exported dependencies.
import SubscriptionPayment from "../models/SubscriptionPayment.js";
// Load ../services/mpesaQueryService.js so this module can use its exported dependencies.
import { queryStkPush, classifyStkQueryResult } from "../services/mpesaQueryService.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter } from "../tenancy/context.js";
// Load ../services/paymentGatewayService.js so this module can use its exported dependencies.
import { getTenantMpesaConfig } from "../services/paymentGatewayService.js";
// Load ../config/mpesa.js so this module can use its exported dependencies.
import { hasLegacyMpesaConfig, mpesaConfig } from "../config/mpesa.js";
// Load ../services/mpesaCallbackPayload.js so this module can use its exported dependencies.
import { getCheckoutRequestId, getStkCallback, validateStkCallback } from "../services/mpesaCallbackPayload.js";

// Declare validateMpesaCallbackPayload for use by the surrounding module or function.
export const validateMpesaCallbackPayload = (req, res, next) => {
  // Declare validationError for use by the surrounding module or function.
  const validationError = validateStkCallback(getStkCallback(req.body));
  // Check the condition (validationError) and run the matching branch.
  if (validationError) return res.status(400).json({ ResultCode: 1, ResultDesc: validationError });
  // Return the result of next() to the caller.
  return next();
};

// Declare createVerifyMpesaCallbackIntegrity for use by the surrounding module or function.
export const createVerifyMpesaCallbackIntegrity = ({
  findPayment = (filter) => Payment.findOne(filter).select("_id providerEnvironment").lean(),
  findSubscriptionPayment = (filter) => SubscriptionPayment.findOne(filter).select("_id").lean(),
  providerQuery = queryStkPush,
  legacyConfigCheck = hasLegacyMpesaConfig,
  legacyConfig = mpesaConfig,
} = {}) => async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare callback for use by the surrounding module or function.
    const callback = getStkCallback(req.body);
    // Declare validationError for use by the surrounding module or function.
    const validationError = validateStkCallback(callback);
    // Check the condition (validationError) and run the matching branch.
    if (validationError) return res.status(400).json({ ResultCode: 1, ResultDesc: validationError });

    // Declare checkoutRequestID for use by the surrounding module or function.
    const checkoutRequestID = getCheckoutRequestId(callback);

    // Declare tenantId for use by the surrounding module or function.
    const tenantId = String(req.tenantId || req.tenant?.tenantId || req.tenant?.id || "").trim();
    // Declare payment for use by the surrounding module or function.
    const payment = tenantId
      ? await findPayment(mergeTenantFilter(req, { $or: [{ checkoutRequestID }, { checkoutRequestId: checkoutRequestID }] }))
      : null;
    // Declare subscriptionPayment for use by the surrounding module or function.
    const subscriptionPayment = tenantId
      ? await findSubscriptionPayment({ tenantId, checkoutRequestID })
      : null;

    // Check the condition (!payment && !subscriptionPayment) and run the matching branch.
    if (!payment && !subscriptionPayment) {
      // Return the result of res.status(400).json() to the caller.
      return res.status(400).json({ ResultCode: 1, ResultDesc: "Unknown CheckoutRequestID." });
    }

    // Declare config for use by the surrounding module or function.
    const config = subscriptionPayment && legacyConfigCheck() ? legacyConfig : undefined;
    // Declare paymentConfig for use by the surrounding module or function.
    const paymentConfig = payment?.providerEnvironment
      ? await getTenantMpesaConfig({ environment: payment.providerEnvironment, allowDisabled: true })
      : null;
    // Declare queryResult for use by the surrounding module or function.
    const queryResult = await providerQuery(checkoutRequestID, paymentConfig || config);
    // Declare providerState for use by the surrounding module or function.
    const providerState = classifyStkQueryResult(queryResult?.ResultCode);
    // Declare callbackState for use by the surrounding module or function.
    const callbackState = classifyStkQueryResult(callback.ResultCode);
    // Check the condition (providerState === "pending" || callbackState !== providerState) and run the matching branch.
    if (providerState === "pending" || callbackState !== providerState) {
      // Return the result of res.status(409).json() to the caller.
      return res.status(409).json({ ResultCode: 1, ResultDesc: "M-Pesa callback state could not be verified with the provider." });
    }
    // Return the result of next() to the caller.
    return next();
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("M-Pesa callback integrity verification failed:", { code: error?.code || "CALLBACK_VERIFY_FAILED" });
    // Return the result of res.status(503).json() to the caller.
    return res.status(503).json({ ResultCode: 1, ResultDesc: "Unable to verify M-Pesa callback with the provider." });
  }
};

// Declare verifyMpesaCallbackIntegrity for use by the surrounding module or function.
export const verifyMpesaCallbackIntegrity = createVerifyMpesaCallbackIntegrity();

export default verifyMpesaCallbackIntegrity;
