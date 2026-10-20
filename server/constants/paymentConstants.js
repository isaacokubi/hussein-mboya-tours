/*
 * Payment provider and method constants.
 * Keeping accepted names in one module prevents controllers, models and services
 * from using slightly different spellings for the same payment method.
 */

// Provider identifiers describe the system that processes or records the payment.
export const PAYMENT_PROVIDERS = {
  MPESA: "MPESA", // Safaricom M-Pesa/Daraja payment provider.
  STRIPE: "STRIPE", // Stripe card/payment processing provider.
  PAYPAL: "PAYPAL", // PayPal payment provider.
  BANK: "BANK", // Manual or integrated bank payment channel.
  CASH: "CASH", // Cash payment recorded by an authorized user.
};

// Canonical method names are the values the application should store and return.
export const PAYMENT_METHODS_CANONICAL = {
  MPESA: "MPESA", // Standard name for M-Pesa payments.
  CARD: "CARD", // Standard name for card payments regardless of card type.
  PAYPAL: "PAYPAL", // Standard name for PayPal payments.
  BANK_TRANSFER: "BANK_TRANSFER", // Standard name for transfers to a bank account.
  CASH: "CASH", // Standard name for cash payments.
};

// Map older or user-entered variants to the canonical method name.
export const PAYMENT_METHOD_ALIASES = {
  MPESA: "MPESA", // Already-canonical M-Pesa name.
  M_PESA: "MPESA", // Accept the underscore spelling used by some clients.
  "M-PESA": "MPESA", // Accept the hyphenated spelling.
  MPESA_TILL: "MPESA", // A till is still an M-Pesa payment method.
  MPESA_PAYBILL: "MPESA", // A Paybill is still an M-Pesa payment method.

  CARD: "CARD", // Accept the generic card name.
  "CREDIT_CARD": "CARD", // Normalize credit-card wording.
  "DEBIT_CARD": "CARD", // Normalize debit-card wording.

  PAYPAL: "PAYPAL", // Accept PayPal as entered.

  BANK: "BANK_TRANSFER", // Normalize the shorter bank label.
  BANK_TRANSFER: "BANK_TRANSFER", // Accept the canonical bank-transfer label.
  BANKTRANSFER: "BANK_TRANSFER", // Normalize the no-underscore spelling.

  CASH: "CASH", // Accept cash as entered.
};

// Convert a supplied method to a known canonical value, or return null if unknown.
export const normalizePaymentMethod = (
  method // The raw method supplied by a form, API client or stored record.
) => {
  // Convert missing input to an empty string, remove outer spaces and normalize case.
  const value =
    String(method || "")
      .trim()
      .toUpperCase()
      .replace(/[\s-]+/g, "_"); // Replace whitespace/hyphen runs with underscores for lookup.

  // Return the mapped canonical method; null makes unsupported values explicit.
  return (
    PAYMENT_METHOD_ALIASES[value] ||
    null
  );
};
