export const getStkCallback = (body) => body?.Body?.stkCallback || null;

export const validateStkCallback = (callback) => {
  if (!callback || typeof callback !== "object" || Array.isArray(callback)) return "Malformed STK callback.";
  if (!getCheckoutRequestId(callback)) return "Missing CheckoutRequestID.";
  if (callback.ResultCode === undefined || callback.ResultCode === null || String(callback.ResultCode).trim() === "" || !Number.isSafeInteger(Number(callback.ResultCode))) {
    return "Invalid ResultCode.";
  }
  if (Number(callback.ResultCode) === 0) {
    const items = callback.CallbackMetadata?.Item;
    if (!Array.isArray(items)) return "Missing callback metadata.";
    const hasAmount = items.some((item) => item?.Name === "Amount" && Number.isSafeInteger(Number(item.Value)) && Number(item.Value) > 0);
    const hasReceipt = items.some((item) => item?.Name === "MpesaReceiptNumber" && String(item.Value || "").trim());
    if (!hasAmount || !hasReceipt) return "Missing required payment metadata.";
  }
  return null;
};

export const getCheckoutRequestId = (callback) => String(
  callback?.CheckoutRequestID || callback?.checkoutRequestID || callback?.checkoutRequestId || "",
).trim();

export const evaluateStkPaymentCallback = (callback, expectedAmount) => {
  const resultCode = Number(callback?.ResultCode);
  const items = Array.isArray(callback?.CallbackMetadata?.Item) ? callback.CallbackMetadata.Item : [];
  const getValue = (name) => items.find((item) => item?.Name === name)?.Value ?? null;
  const paidAmount = Number(getValue("Amount"));
  const expected = Number(expectedAmount);
  const receiptNumber = String(getValue("MpesaReceiptNumber") || "").trim();
  const providerDescription = typeof callback?.ResultDesc === "string" ? callback.ResultDesc.trim().slice(0, 250) : "";

  if (resultCode !== 0) {
    return { state: "provider_failed", resultCode, reason: providerDescription || "M-Pesa payment failed.", paidAmount, expectedAmount: expected, receiptNumber };
  }
  if (!Number.isSafeInteger(paidAmount) || paidAmount <= 0) {
    return { state: "invalid_amount", resultCode, reason: "M-Pesa callback did not contain a valid paid amount.", paidAmount, expectedAmount: expected, receiptNumber };
  }
  if (!Number.isSafeInteger(expected) || paidAmount !== expected) {
    return { state: "amount_mismatch", resultCode, reason: `M-Pesa amount mismatch. Expected ${expected}, received ${paidAmount}.`, paidAmount, expectedAmount: expected, receiptNumber };
  }
  if (!receiptNumber) {
    return { state: "missing_receipt", resultCode, reason: "M-Pesa callback did not contain a receipt number.", paidAmount, expectedAmount: expected, receiptNumber };
  }
  return {
    state: "completed", resultCode, paidAmount, expectedAmount: expected, receiptNumber,
    phoneNumber: getValue("PhoneNumber") || "",
    transactionDate: getValue("TransactionDate"),
  };
};
