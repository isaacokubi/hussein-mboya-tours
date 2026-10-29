export const normalizeTenantPaymentMethod = (method) => {
  const value = String(method || "").trim().toUpperCase();
  if (["MPESA", "M-PESA"].includes(value)) return "MPESA";
  if (["CARD", "STRIPE"].includes(value)) return "CARD";
  if (["BANK", "BANK_TRANSFER", "BANK TRANSFER"].includes(value)) return "BANK_TRANSFER";
  if (value === "CASH") return "CASH";
  if (value === "PAYPAL") return "PAYPAL";
  return "";
};

const PAYPAL_PAYMENT_CURRENCIES = new Set(["AUD", "BRL", "CAD", "CNY", "CZK", "DKK", "EUR", "HKD", "HUF", "ILS", "JPY", "MYR", "MXN", "TWD", "NZD", "NOK", "PHP", "PLN", "GBP", "SGD", "SEK", "CHF", "THB", "USD"]);
export const isPaypalCurrencySupported = (currency) => PAYPAL_PAYMENT_CURRENCIES.has(String(currency || "").trim().toUpperCase());
export const isStripeRuntimeEnvironmentValid = (environment = process.env) => {
  const key = String(environment.STRIPE_SECRET_KEY || "").trim();
  const staging = String(environment.DEPLOYMENT_ENV || "").toLowerCase() === "staging";
  if (key.startsWith("sk_test_")) return environment.NODE_ENV !== "production" || staging;
  if (key.startsWith("sk_live_")) return environment.NODE_ENV === "production" && !staging;
  return false;
};

export const isTenantPaymentMethodAvailable = (settings = {}, method, environment = process.env) => {
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
