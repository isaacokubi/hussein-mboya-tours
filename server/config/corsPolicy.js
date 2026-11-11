/**
 * Purpose: cors Policy configuration module. Main declarations: getConfiguredOrigins, isValidConfiguredOrigin, isConfiguredOrigin.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
export function getConfiguredOrigins(environment = process.env) {
  // Return the result of String(environment.CLIENT_ORIGINS || environment.CLIENT_URL || "")     .split(",")     .map((origin) => origin.trim())     .filter() to the caller.
  return String(environment.CLIENT_ORIGINS || environment.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

// Define isValidConfiguredOrigin; its parameters and body implement this operation.
export function isValidConfiguredOrigin(origin, { production = false } = {}) {
  // Check the condition (origin === "*") and run the matching branch.
  if (origin === "*") return false;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare parsed for use by the surrounding module or function.
    const parsed = new URL(origin);
    // Return the expression shown below to the caller.
    return parsed.origin === origin && parsed.hostname !== "*" && !parsed.hostname.includes("*") &&
      !parsed.username && !parsed.password &&
      (!production || parsed.protocol === "https:");
  } catch {
    // Return the expression shown below to the caller.
    return false;
  }
}

// Define isConfiguredOrigin; its parameters and body implement this operation.
export function isConfiguredOrigin(origin, configuredOrigins) {
  // Return the result of configuredOrigins.includes() to the caller.
  return configuredOrigins.includes(origin);
}
