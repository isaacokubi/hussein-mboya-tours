export const normalizeTenantPaymentMethod = (method) => {
  const value = String(method || "").trim().toUpperCase();
  if (["MPESA", "M-PESA"].includes(value)) return "MPESA";
  if (["CARD", "STRIPE"].includes(value)) return "CARD";
  if (["BANK", "BANK_TRANSFER", "BANK TRANSFER"].includes(value)) return "BANK_TRANSFER";
  if (value === "CASH") return "CASH";
  if (value === "PAYPAL") return "PAYPAL";
  return "";
};

export const isTenantPaymentMethodAvailable = (settings = {}, method, environment = process.env) => {
  switch (normalizeTenantPaymentMethod(method)) {
    case "MPESA": return settings.enableMpesa === true;
    case "CARD": return settings.enableStripe === true && Boolean(environment.STRIPE_SECRET_KEY);
    case "BANK_TRANSFER": return settings.enableBankTransfer === true && Boolean(
      String(settings.bankName || "").trim() && String(settings.bankAccountName || "").trim() &&
      /^[A-Za-z0-9][A-Za-z0-9 -]{4,33}$/.test(String(settings.bankAccountNumber || "").trim()) && String(settings.bankInstructions || "").trim()
    );
    case "CASH": return settings.enableCash === true && Boolean(String(settings.cashCollectionLocation || "").trim() && String(settings.cashInstructions || "").trim());
    // No PayPal order/capture/webhook integration exists yet. Never advertise or accept it.
    case "PAYPAL": return false;
    default: return false;
  }
};
