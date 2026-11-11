/**
 * Purpose: mpesa Callback Payload business-logic service. Main declarations: getStkCallback, validateStkCallback, getCheckoutRequestId, evaluateStkPaymentCallback, getValue.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export const getStkCallback = (body) => body?.Body?.stkCallback || null;

// Declare validateStkCallback for use by the surrounding module or function.
export const validateStkCallback = (callback) => {
  // Check the condition (!callback || typeof callback !== "object" || Array.isArray(callback)) and run the matching branch.
  if (!callback || typeof callback !== "object" || Array.isArray(callback)) return "Malformed STK callback.";
  // Check the condition (!getCheckoutRequestId(callback)) and run the matching branch.
  if (!getCheckoutRequestId(callback)) return "Missing CheckoutRequestID.";
  // Check the condition (callback.ResultCode === undefined || callback.ResultCode === null || S) and run the matching branch.
  if (callback.ResultCode === undefined || callback.ResultCode === null || String(callback.ResultCode).trim() === "" || !Number.isSafeInteger(Number(callback.ResultCode))) {
    // Return a configured text value to the caller.
    return "Invalid ResultCode.";
  }
  // Check the condition (Number(callback.ResultCode) === 0) and run the matching branch.
  if (Number(callback.ResultCode) === 0) {
    // Declare items for use by the surrounding module or function.
    const items = callback.CallbackMetadata?.Item;
    // Check the condition (!Array.isArray(items)) and run the matching branch.
    if (!Array.isArray(items)) return "Missing callback metadata.";
    // Declare hasAmount for use by the surrounding module or function.
    const hasAmount = items.some((item) => item?.Name === "Amount" && Number.isSafeInteger(Number(item.Value)) && Number(item.Value) > 0);
    // Declare hasReceipt for use by the surrounding module or function.
    const hasReceipt = items.some((item) => item?.Name === "MpesaReceiptNumber" && String(item.Value || "").trim());
    // Check the condition (!hasAmount || !hasReceipt) and run the matching branch.
    if (!hasAmount || !hasReceipt) return "Missing required payment metadata.";
  }
  // Return the expression shown below to the caller.
  return null;
};

// Declare getCheckoutRequestId for use by the surrounding module or function.
export const getCheckoutRequestId = (callback) => String(
  callback?.CheckoutRequestID || callback?.checkoutRequestID || callback?.checkoutRequestId || "",
).trim();

// Declare evaluateStkPaymentCallback for use by the surrounding module or function.
export const evaluateStkPaymentCallback = (callback, expectedAmount) => {
  // Declare resultCode for use by the surrounding module or function.
  const resultCode = Number(callback?.ResultCode);
  // Declare items for use by the surrounding module or function.
  const items = Array.isArray(callback?.CallbackMetadata?.Item) ? callback.CallbackMetadata.Item : [];
  // Declare getValue for use by the surrounding module or function.
  const getValue = (name) => items.find((item) => item?.Name === name)?.Value ?? null;
  // Declare paidAmount for use by the surrounding module or function.
  const paidAmount = Number(getValue("Amount"));
  // Declare expected for use by the surrounding module or function.
  const expected = Number(expectedAmount);
  // Declare receiptNumber for use by the surrounding module or function.
  const receiptNumber = String(getValue("MpesaReceiptNumber") || "").trim();
  // Declare providerDescription for use by the surrounding module or function.
  const providerDescription = typeof callback?.ResultDesc === "string" ? callback.ResultDesc.trim().slice(0, 250) : "";

  // Check the condition (resultCode !== 0) and run the matching branch.
  if (resultCode !== 0) {
    // Return the object assembled below to the caller.
    return { state: "provider_failed", resultCode, reason: providerDescription || "M-Pesa payment failed.", paidAmount, expectedAmount: expected, receiptNumber };
  }
  // Check the condition (!Number.isSafeInteger(paidAmount) || paidAmount <= 0) and run the matching branch.
  if (!Number.isSafeInteger(paidAmount) || paidAmount <= 0) {
    // Return the object assembled below to the caller.
    return { state: "invalid_amount", resultCode, reason: "M-Pesa callback did not contain a valid paid amount.", paidAmount, expectedAmount: expected, receiptNumber };
  }
  // Check the condition (!Number.isSafeInteger(expected) || paidAmount !== expected) and run the matching branch.
  if (!Number.isSafeInteger(expected) || paidAmount !== expected) {
    // Return the object assembled below to the caller.
    return { state: "amount_mismatch", resultCode, reason: `M-Pesa amount mismatch. Expected ${expected}, received ${paidAmount}.`, paidAmount, expectedAmount: expected, receiptNumber };
  }
  // Check the condition (!receiptNumber) and run the matching branch.
  if (!receiptNumber) {
    // Return the object assembled below to the caller.
    return { state: "missing_receipt", resultCode, reason: "M-Pesa callback did not contain a receipt number.", paidAmount, expectedAmount: expected, receiptNumber };
  }
  // Return the object assembled below to the caller.
  return {
    state: "completed", resultCode, paidAmount, expectedAmount: expected, receiptNumber,
    phoneNumber: getValue("PhoneNumber") || "",
    transactionDate: getValue("TransactionDate"),
  };
};
