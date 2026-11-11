/**
 * Purpose: tenant Host server application module. Main declarations: normalizeHost, isTenantSubdomainHost.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const normalizeHost = (value = "") => String(value).split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");

// Declare isTenantSubdomainHost for use by the surrounding module or function.
export const isTenantSubdomainHost = (host, platformHost, reserved = ["www", "api", "app", "admin"]) => {
  // Declare normalizedHost for use by the surrounding module or function.
  const normalizedHost = normalizeHost(host);
  // Declare normalizedPlatformHost for use by the surrounding module or function.
  const normalizedPlatformHost = normalizeHost(platformHost);
  // Declare suffix for use by the surrounding module or function.
  const suffix = `.${normalizedPlatformHost}`;
  // Check the condition (!normalizedHost || !normalizedPlatformHost || !normalizedHost.endsWith) and run the matching branch.
  if (!normalizedHost || !normalizedPlatformHost || !normalizedHost.endsWith(suffix)) return false;
  // Declare labels for use by the surrounding module or function.
  const labels = normalizedHost.slice(0, -suffix.length).split(".").filter(Boolean);
  // Return the expression shown below to the caller.
  return labels.length === 1 && !reserved.includes(labels[0]);
};
