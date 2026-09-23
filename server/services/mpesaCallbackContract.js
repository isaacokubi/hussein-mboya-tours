import crypto from "node:crypto";

const itemValue = (items, name) => items.find((item) => item?.Name === name)?.Value ?? null;

export const parseMpesaStkCallback = (body) => {
  const callback = body?.Body?.stkCallback;
  if (!callback) return { present: false };
  const checkoutRequestID = String(callback.CheckoutRequestID || callback.checkoutRequestID || callback.checkoutRequestId || "").trim();
  const items = Array.isArray(callback.CallbackMetadata?.Item) ? callback.CallbackMetadata.Item : [];
  const paidAmount = Number(itemValue(items, "Amount"));
  const receipt = String(itemValue(items, "MpesaReceiptNumber") || "").trim();
  return { present: true, callback, checkoutRequestID, resultCode: Number(callback.ResultCode), resultDescription: String(callback.ResultDesc || "M-Pesa payment failed."), paidAmount, receipt, phoneNumber: String(itemValue(items, "PhoneNumber") || "").trim(), transactionDate: itemValue(items, "TransactionDate"), merchantRequestID: String(callback.MerchantRequestID || callback.merchantRequestID || "").trim() };
};

export const validateSuccessfulMpesaCallback = ({ callbackData, expectedAmount }) => {
  if (!callbackData?.present) return { ok: false, reason: "missing_callback" };
  if (!callbackData.checkoutRequestID) return { ok: false, reason: "missing_checkout_request_id" };
  if (callbackData.resultCode !== 0) return { ok: false, reason: callbackData.resultDescription || "provider_failed" };
  if (!Number.isFinite(callbackData.paidAmount) || callbackData.paidAmount <= 0) return { ok: false, reason: "invalid_paid_amount" };
  if (!Number.isFinite(Number(expectedAmount)) || Math.round(callbackData.paidAmount) !== Math.round(Number(expectedAmount))) return { ok: false, reason: "amount_mismatch" };
  if (!callbackData.receipt) return { ok: false, reason: "missing_receipt" };
  return { ok: true };
};

export const mpesaCallbackEventId = ({ checkoutRequestID, receipt, resultCode, paidAmount }) => crypto.createHash("sha256").update([checkoutRequestID, receipt, String(resultCode), String(paidAmount)].join("|")).digest("hex");
