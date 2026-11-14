export function validateKenyaFinanceProductionReadiness(profile = {}) {
  const failures = [];
  const environment = String(profile.etimsEnvironment || "sandbox").toLowerCase();
  const kraPin = String(profile.kraPin || "").trim();
  if (!kraPin) failures.push("KRA PIN is required.");
  else if (profile.kraPinStatus !== "verified") failures.push("KRA PIN must be verified before production finance is enabled.");

  if (profile.vatRegistered) {
    if (!String(profile.vatNumber || "").trim()) failures.push("VAT number is required when VAT registration is enabled.");
    if (profile.vatValidationStatus !== "verified") failures.push("VAT registration must be verified before production finance is enabled.");
  }

  if (profile.etimsEnabled && environment === "production") {
    const adapterUrl = String(profile.etimsAdapterUrl || process.env.ETIMS_ADAPTER_URL || "").trim();
    if (!adapterUrl) failures.push("A certified eTIMS adapter is required for production.");
    else {
      try {
        const parsed = new URL(adapterUrl);
        if (parsed.protocol !== "https:" || parsed.username || parsed.password || parsed.search || parsed.hash) {
          failures.push("The production eTIMS adapter must be a public HTTPS URL without embedded credentials, query or fragment.");
        }
      } catch {
        failures.push("The production eTIMS adapter URL is invalid.");
      }
    }
    if (!String(profile.etimsDeviceId || "").trim()) failures.push("eTIMS device ID is required for production.");
    if (!String(profile.etimsBranchId || "").trim()) failures.push("eTIMS branch ID is required for production.");
    if (!["ONLINE", "CLIENT", "VSCU", "OSCU"].includes(String(profile.etimsSolution || "").toUpperCase())) {
      failures.push("A supported eTIMS solution must be selected for production.");
    }
  }
  return { ready: failures.length === 0, failures };
}

export function assertKenyaFinanceProductionReadiness(profile = {}) {
  const result = validateKenyaFinanceProductionReadiness(profile);
  if (!result.ready) {
    const error = new Error(`Kenya finance production configuration is incomplete: ${result.failures.join(" ")}`);
    error.statusCode = 422;
    error.code = "KENYA_FINANCE_NOT_READY";
    error.details = result.failures;
    throw error;
  }
  return result;
}
