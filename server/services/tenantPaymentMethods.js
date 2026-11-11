/**
 * Purpose: tenant Payment Methods business-logic service. Main declarations: normalizeTenantPaymentMethod, isPaypalCurrencySupported, isStripeRuntimeEnvironmentValid, isTenantPaymentMethodAvailable.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export const normalizeTenantPaymentMethod = (method) => {
  // Declare value for use by the surrounding module or function.
  const value = String(method || "").trim().toUpperCase();
  // Check the condition (["MPESA", "M-PESA"].includes(value)) and run the matching branch.
  if (["MPESA", "M-PESA"].includes(value)) return "MPESA";
  // Check the condition (["CARD", "STRIPE"].includes(value)) and run the matching branch.
  if (["CARD", "STRIPE"].includes(value)) return "CARD";
  // Check the condition (["BANK", "BANK_TRANSFER", "BANK TRANSFER"].includes(value)) and run the matching branch.
  if (["BANK", "BANK_TRANSFER", "BANK TRANSFER"].includes(value)) return "BANK_TRANSFER";
  // Check the condition (value === "CASH") and run the matching branch.
  if (value === "CASH") return "CASH";
  // Check the condition (value === "PAYPAL") and run the matching branch.
  if (value === "PAYPAL") return "PAYPAL";
  // Return a configured text value to the caller.
  return "";
};

// Declare PAYPAL_PAYMENT_CURRENCIES for use by the surrounding module or function.
const PAYPAL_PAYMENT_CURRENCIES = new Set(["AUD", "BRL", "CAD", "CNY", "CZK", "DKK", "EUR", "HKD", "HUF", "ILS", "JPY", "MYR", "MXN", "TWD", "NZD", "NOK", "PHP", "PLN", "GBP", "SGD", "SEK", "CHF", "THB", "USD"]);
// Declare isPaypalCurrencySupported for use by the surrounding module or function.
export const isPaypalCurrencySupported = (currency) => PAYPAL_PAYMENT_CURRENCIES.has(String(currency || "").trim().toUpperCase());
// Declare isStripeRuntimeEnvironmentValid for use by the surrounding module or function.
export const isStripeRuntimeEnvironmentValid = (environment = process.env) => {
  // Declare key for use by the surrounding module or function.
  const key = String(environment.STRIPE_SECRET_KEY || "").trim();
  // Declare staging for use by the surrounding module or function.
  const staging = String(environment.DEPLOYMENT_ENV || "").toLowerCase() === "staging";
  // Check the condition (key.startsWith("sk_test_")) and run the matching branch.
  if (key.startsWith("sk_test_")) return environment.NODE_ENV !== "production" || staging;
  // Check the condition (key.startsWith("sk_live_")) and run the matching branch.
  if (key.startsWith("sk_live_")) return environment.NODE_ENV === "production" && !staging;
  // Return the expression shown below to the caller.
  return false;
};

// Declare isTenantPaymentMethodAvailable for use by the surrounding module or function.
export const isTenantPaymentMethodAvailable = (settings = {}, method, environment = process.env) => {
  // Select the appropriate branch based on normalizeTenantPaymentMethod(method).
  switch (normalizeTenantPaymentMethod(method)) {
    case "MPESA": return settings.enableMpesa === true;
    case "CARD": return settings.enableStripe === true && Boolean(environment.STRIPE_WEBHOOK_SECRET) && isStripeRuntimeEnvironmentValid(environment);
    case "BANK_TRANSFER": return settings.enableBankTransfer === true && Boolean(
      String(settings.bankName || "").trim() && String(settings.bankAccountName || "").trim() &&
      /^[A-Za-z0-9][A-Za-z0-9 -]{4,33}$/.test(String(settings.bankAccountNumber || "").trim()) && String(settings.bankInstructions || "").trim()
    );
    case "CASH": return settings.enableCash === true && Boolean(String(settings.cashCollectionLocation || "").trim() && String(settings.cashInstructions || "").trim());
    // The status is populated only after tenant-scoped OAuth validation; production
    // additionally remains gated until a successful sandbox lifecycle is recorded.
    case "PAYPAL": return settings.paypalAvailable === true && isPaypalCurrencySupported(settings.currency);
    default: return false;
  }
};
