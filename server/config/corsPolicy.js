// Return the list of frontend origins configured for the current environment.
export function getConfiguredOrigins(environment = process.env) {
  // Prefer the comma-separated CLIENT_ORIGINS list, with CLIENT_URL as a legacy fallback.
  return String(environment.CLIENT_ORIGINS || environment.CLIENT_URL || "")
    .split(",") // Split multiple origins stored in one environment variable.
    .map((origin) => origin.trim()) // Remove spaces around each configured URL.
    .filter(Boolean); // Ignore empty entries caused by extra commas or whitespace.
}

// Validate one configured browser origin; production origins must use HTTPS.
export function isValidConfiguredOrigin(origin, { production = false } = {}) {
  if (origin === "*") return false; // Wildcard origins are unsafe for credentialed requests.
  try {
    const parsed = new URL(origin); // Parse the value to reject malformed URLs.
    return parsed.origin === origin && parsed.hostname !== "*" && !parsed.hostname.includes("*") &&
      !parsed.username && !parsed.password && // Origins must not embed usernames or passwords.
      (!production || parsed.protocol === "https:"); // Require HTTPS whenever production mode is enabled.
  } catch {
    return false; // Invalid URL syntax is not an allowed origin.
  }
}

// Check whether the incoming Origin header exactly matches an allowed origin.
export function isConfiguredOrigin(origin, configuredOrigins) {
  return configuredOrigins.includes(origin); // Exact comparison avoids unsafe partial hostname matches.
}
