/*
|--------------------------------------------------------------------------
| PAYMENT CONSTANTS
|--------------------------------------------------------------------------
*/

export const PAYMENT_PROVIDERS = {
  MPESA: "MPESA",
  STRIPE: "STRIPE",
  PAYPAL: "PAYPAL",
  BANK: "BANK",
  CASH: "CASH",
};


export const PAYMENT_METHODS_CANONICAL = {
  MPESA: "MPESA",
  CARD: "CARD",
  PAYPAL: "PAYPAL",
  BANK_TRANSFER: "BANK_TRANSFER",
  CASH: "CASH",
};


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


export const normalizePaymentMethod = (
  method
) => {

  const value =
    String(method || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_");

  return (
    PAYMENT_METHOD_ALIASES[value] ||
    null
  );
};
