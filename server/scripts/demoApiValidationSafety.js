/**
 * Purpose: demo Api Validation Safety operational script. Main declarations: getSafeDemoApiOrigin, needsLoginWindowWait, isExplicitProductionDemoMatrix.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export const LOGIN_LIMIT = 10;
// Declare LOGIN_WINDOW_MS for use by the surrounding module or function.
export const LOGIN_WINDOW_MS = 15 * 60 * 1000;

// Define getSafeDemoApiOrigin; its parameters and body implement this operation.
export function getSafeDemoApiOrigin(value = "https://hussein-mboya-tours.onrender.com") {
  // Declare parsed for use by the surrounding module or function.
  const parsed = new URL(value);
  // Check the condition (parsed.protocol !== "https:" || parsed.pathname !== "/" || parsed.sear) and run the matching branch.
  if (parsed.protocol !== "https:" || parsed.pathname !== "/" || parsed.search || parsed.hash || parsed.username || parsed.password) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("DEMO_API_BASE_URL must be an HTTPS origin without credentials or a path.");
  }
  // Return the origin value to the caller.
  return parsed.origin;
}

// Define needsLoginWindowWait; its parameters and body implement this operation.
export function needsLoginWindowWait(completedLogins, totalLogins) {
  // Return the expression shown below to the caller.
  return completedLogins > 0 && completedLogins < totalLogins && completedLogins % LOGIN_LIMIT === 0;
}

// Define isExplicitProductionDemoMatrix; its parameters and body implement this operation.
export function isExplicitProductionDemoMatrix(value = process.env.DEMO_API_BASE_URL) {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare parsed for use by the surrounding module or function.
    const parsed = new URL(value);
    // Return the expression shown below to the caller.
    return process.env.ALLOW_PRODUCTION_DEMO_MATRIX === "YES"
      && process.env.CONFIRM_PRODUCTION_DEMO_MATRIX === "YES_VERIFY_READ_ONLY_PRODUCTION_DEMO_ACCOUNTS"
      && parsed.protocol === "https:"
      && parsed.hostname.toLowerCase() === "hussein-mboya-tours.onrender.com"
      && parsed.pathname === "/" && !parsed.search && !parsed.hash
      && !parsed.username && !parsed.password;
  } catch { return false; }
}
