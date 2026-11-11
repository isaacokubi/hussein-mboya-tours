/**
 * Purpose: payment Constants server application module. Main declarations: normalizePaymentMethod.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
/*
|--------------------------------------------------------------------------
| PAYMENT CONSTANTS
|--------------------------------------------------------------------------
*/

// Declare PAYMENT_PROVIDERS for use by the surrounding module or function.
export const PAYMENT_PROVIDERS = {
  MPESA: "MPESA",
  STRIPE: "STRIPE",
  PAYPAL: "PAYPAL",
  BANK: "BANK",
  CASH: "CASH",
};


// Declare PAYMENT_METHODS_CANONICAL for use by the surrounding module or function.
export const PAYMENT_METHODS_CANONICAL = {
  MPESA: "MPESA",
  CARD: "CARD",
  PAYPAL: "PAYPAL",
  BANK_TRANSFER: "BANK_TRANSFER",
  CASH: "CASH",
};


// Declare PAYMENT_METHOD_ALIASES for use by the surrounding module or function.
export const PAYMENT_METHOD_ALIASES = {
  MPESA: "MPESA",
  M_PESA: "MPESA",
  "M-PESA": "MPESA",
  MPESA_TILL: "MPESA",
  MPESA_PAYBILL: "MPESA",

  CARD: "CARD",
  "CREDIT_CARD": "CARD",
  "DEBIT_CARD": "CARD",

  PAYPAL: "PAYPAL",

  BANK: "BANK_TRANSFER",
  BANK_TRANSFER: "BANK_TRANSFER",
  BANKTRANSFER: "BANK_TRANSFER",

  CASH: "CASH",
};


// Declare normalizePaymentMethod for use by the surrounding module or function.
export const normalizePaymentMethod = (
  method
) => {

  // Declare value for use by the surrounding module or function.
  const value =
    String(method || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

  // Return the expression shown below to the caller.
  return (
    PAYMENT_METHOD_ALIASES[value] ||
    null
  );
};
