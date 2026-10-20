// Provide fallback company settings used before a tenant has configured its own branding/contact details.
export const COMPANY_DEFAULTS = {
  companyName: "Global Tours", // Default display name for the application.
  companyLogo: "", // No logo is configured by default.
  supportEmail: "", // No support email is assumed.
  supportPhone: "", // No support phone is assumed.
  address: "", // No street address is assumed.
  city: "Nairobi", // Default city for the Kenyan deployment.
  country: "Kenya", // Default country for the Kenyan deployment.
  currency: "KES", // Default currency code is Kenyan shillings.
  currencySymbol: "KSh", // Display symbol associated with the default currency.
  timezone: "Africa/Nairobi", // Default timezone for dates and schedules.
  emailFromName: "Global Tours", // Default sender name for outgoing emails.
  emailFromAddress: "" // Sender address must be configured for the email provider.
};
