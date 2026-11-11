/**
 * Purpose: subscription Mpesa Callback Controller HTTP controller. Main declarations: resolvedTenantId, subscriptionMpesaCallback, value.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import SubscriptionPayment from "../models/SubscriptionPayment.js";
// Load ../services/tenantSubscriptionService.js so this module can use its exported dependencies.
import { activateTenantSubscription } from "../services/tenantSubscriptionService.js";
// Load ./mpesaController.js so this module can use its exported dependencies.
import { mpesaCallback } from "./mpesaController.js";

// Declare resolvedTenantId for use by the surrounding module or function.
const resolvedTenantId = (req) => String(req.tenantId || req.tenant?.tenantId || req.tenant?.id || "").trim();

// Declare subscriptionMpesaCallback for use by the surrounding module or function.
export const subscriptionMpesaCallback = async (req, res) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare stkCallback for use by the surrounding module or function.
    const stkCallback = req.body?.Body?.stkCallback;
    // Declare checkoutRequestID for use by the surrounding module or function.
    const checkoutRequestID = String(stkCallback?.CheckoutRequestID || stkCallback?.checkoutRequestID || stkCallback?.checkoutRequestId || "").trim();
    // Check the condition (!checkoutRequestID) and run the matching branch.
    if (!checkoutRequestID) return mpesaCallback(req, res);

    // Declare tenantId for use by the surrounding module or function.
    const tenantId = resolvedTenantId(req);
    // Check the condition (!tenantId) and run the matching branch.
    if (!tenantId) return mpesaCallback(req, res);

    // Declare payment for use by the surrounding module or function.
    const payment = await SubscriptionPayment.findOne({ tenantId, checkoutRequestID });
    // Check the condition (!payment) and run the matching branch.
    if (!payment) return mpesaCallback(req, res);
    // Check the condition (["completed", "failed", "cancelled"].includes(payment.status)) and run the matching branch.
    if (["completed", "failed", "cancelled"].includes(payment.status)) return res.json({ ResultCode: 0, ResultDesc: "Already processed" });

    // Declare resultCode for use by the surrounding module or function.
    const resultCode = Number(stkCallback?.ResultCode);
    // Check the condition (resultCode !== 0) and run the matching branch.
    if (resultCode !== 0) {
      // Perform the side effect or state update expressed on the following line.
      payment.status = "failed";
      // Perform the side effect or state update expressed on the following line.
      payment.failureReason = stkCallback?.ResultDesc || "M-Pesa subscription payment failed.";
      // Perform the side effect or state update expressed on the following line.
      payment.metadata = { ...(payment.metadata || {}), callbackResponse: stkCallback };
      // Perform the side effect or state update expressed on the following line.
      await payment.save();
      // Return the result of res.json() to the caller.
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Declare items for use by the surrounding module or function.
    const items = stkCallback?.CallbackMetadata?.Item || [];
    // Declare value for use by the surrounding module or function.
    const value = (name) => items.find((item) => item.Name === name)?.Value ?? null;
    // Declare paidAmount for use by the surrounding module or function.
    const paidAmount = Number(value("Amount"));
    // Declare receipt for use by the surrounding module or function.
    const receipt = String(value("MpesaReceiptNumber") || "").trim();
    // Check the condition (!Number.isFinite(paidAmount) || Math.round(paidAmount) !== Math.round() and run the matching branch.
    if (!Number.isFinite(paidAmount) || Math.round(paidAmount) !== Math.round(payment.amount) || !receipt) {
      // Perform the side effect or state update expressed on the following line.
      payment.status = "failed";
      // Perform the side effect or state update expressed on the following line.
      payment.failureReason = !receipt ? "M-Pesa callback did not contain a receipt number." : `Payment amount mismatch. Expected ${payment.amount}, received ${paidAmount}.`;
      // Perform the side effect or state update expressed on the following line.
      payment.metadata = { ...(payment.metadata || {}), callbackResponse: stkCallback };
      // Perform the side effect or state update expressed on the following line.
      await payment.save();
      // Return the result of res.json() to the caller.
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    // Perform the side effect or state update expressed on the following line.
    payment.mpesaReceiptNumber = receipt;
    // Perform the side effect or state update expressed on the following line.
    payment.paidAt = new Date();
    // Perform the side effect or state update expressed on the following line.
    payment.metadata = { ...(payment.metadata || {}), callbackResponse: stkCallback, amount: paidAmount, phoneNumber: value("PhoneNumber") || payment.phoneNumber };
    // Perform the side effect or state update expressed on the following line.
    await payment.save();

    // Perform the side effect or state update expressed on the following line.
    await activateTenantSubscription({
      tenantId: payment.tenantId,
      plan: payment.plan,
      provider: "mpesa",
      periodDays: payment.periodDays || 30,
      payment,
      transactionReference: receipt,
    });
    // Return the result of res.json() to the caller.
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.error("SUBSCRIPTION MPESA CALLBACK ERROR:", { code: error?.code || "CALLBACK_PROCESSING_FAILED" });
    // Return the result of res.json() to the caller.
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};
