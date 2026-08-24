import SubscriptionPayment from "../models/SubscriptionPayment.js";
import { activateTenantSubscription } from "../services/tenantSubscriptionService.js";
import { mpesaCallback } from "./mpesaController.js";

export const subscriptionMpesaCallback = async (req, res) => {
  try {
    const stkCallback = req.body?.Body?.stkCallback;
    const checkoutRequestID = String(stkCallback?.CheckoutRequestID || stkCallback?.checkoutRequestID || stkCallback?.checkoutRequestId || "").trim();
    if (!checkoutRequestID) return mpesaCallback(req, res);
    const payment = await SubscriptionPayment.findOne({ checkoutRequestID });
    if (!payment) return mpesaCallback(req, res);
    if (["completed", "failed", "cancelled"].includes(payment.status)) return res.json({ ResultCode: 0, ResultDesc: "Already processed" });

    const resultCode = Number(stkCallback?.ResultCode);
    if (resultCode !== 0) {
      payment.status = "failed";
      payment.failureReason = stkCallback?.ResultDesc || "M-Pesa subscription payment failed.";
      payment.metadata = { ...(payment.metadata || {}), callbackResponse: stkCallback };
      await payment.save();
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    const items = stkCallback?.CallbackMetadata?.Item || [];
    const value = (name) => items.find((item) => item.Name === name)?.Value ?? null;
    const paidAmount = Number(value("Amount"));
    const receipt = String(value("MpesaReceiptNumber") || "").trim();
    if (!Number.isFinite(paidAmount) || Math.round(paidAmount) !== Math.round(payment.amount) || !receipt) {
      payment.status = "failed";
      payment.failureReason = !receipt ? "M-Pesa callback did not contain a receipt number." : `Payment amount mismatch. Expected ${payment.amount}, received ${paidAmount}.`;
      payment.metadata = { ...(payment.metadata || {}), callbackResponse: stkCallback };
      await payment.save();
      return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    }

    payment.mpesaReceiptNumber = receipt;
    payment.metadata = { ...(payment.metadata || {}), callbackResponse: stkCallback, amount: paidAmount, phoneNumber: value("PhoneNumber") || payment.phoneNumber };
    await activateTenantSubscription({ tenantId: payment.tenantId, plan: payment.plan, provider: "mpesa", periodDays: payment.periodDays || 30, payment, transactionReference: receipt });
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (error) {
    console.error("SUBSCRIPTION MPESA CALLBACK ERROR:", error);
    return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
};
