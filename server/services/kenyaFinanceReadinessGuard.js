/**
 * Purpose: kenya Finance Readiness Guard business-logic service. Main declarations: validateKenyaFinanceProductionReadiness, assertKenyaFinanceProductionReadiness.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export function validateKenyaFinanceProductionReadiness(profile = {}) {
  // Declare failures for use by the surrounding module or function.
  const failures = [];
  // Declare environment for use by the surrounding module or function.
  const environment = String(profile.etimsEnvironment || "sandbox").toLowerCase();
  // Check the condition (!String(profile.kraPin || "").trim()) and run the matching branch.
  if (!String(profile.kraPin || "").trim()) failures.push("KRA PIN is required.");
  // Check the condition (profile.vatRegistered && !String(profile.vatNumber || "").trim()) and run the matching branch.
  if (profile.vatRegistered && !String(profile.vatNumber || "").trim()) failures.push("VAT number is required when VAT registration is enabled.");
  // Check the condition (profile.etimsEnabled && environment === "production") and run the matching branch.
  if (profile.etimsEnabled && environment === "production") {
    // Check the condition (!String(profile.etimsAdapterUrl || process.env.ETIMS_ADAPTER_URL || "") and run the matching branch.
    if (!String(profile.etimsAdapterUrl || process.env.ETIMS_ADAPTER_URL || "").trim()) failures.push("A certified eTIMS adapter is required for production.");
    // Check the condition (!String(profile.etimsDeviceId || "").trim()) and run the matching branch.
    if (!String(profile.etimsDeviceId || "").trim()) failures.push("eTIMS device ID is required for production.");
    // Check the condition (!String(profile.etimsBranchId || "").trim()) and run the matching branch.
    if (!String(profile.etimsBranchId || "").trim()) failures.push("eTIMS branch ID is required for production.");
    // Check the condition (!["ONLINE", "CLIENT", "VSCU", "OSCU"].includes(String(profile.etimsSol) and run the matching branch.
    if (!["ONLINE", "CLIENT", "VSCU", "OSCU"].includes(String(profile.etimsSolution || "").toUpperCase())) failures.push("A supported eTIMS solution must be selected for production.");
  }
  // Return the object assembled below to the caller.
  return { ready: failures.length === 0, failures };
}

// Define assertKenyaFinanceProductionReadiness; its parameters and body implement this operation.
export function assertKenyaFinanceProductionReadiness(profile = {}) {
  // Declare result for use by the surrounding module or function.
  const result = validateKenyaFinanceProductionReadiness(profile);
  // Check the condition (!result.ready) and run the matching branch.
  if (!result.ready) {
    // Declare error for use by the surrounding module or function.
    const error = new Error(`Kenya finance production configuration is incomplete: ${result.failures.join(" ")}`);
    // Perform the side effect or state update expressed on the following line.
    error.statusCode = 422;
    // Perform the side effect or state update expressed on the following line.
    error.code = "KENYA_FINANCE_NOT_READY";
    // Perform the side effect or state update expressed on the following line.
    error.details = result.failures;
    // Stop the current operation by raising the value of error.
    throw error;
  }
  // Return the value of result to the caller.
  return result;
}
