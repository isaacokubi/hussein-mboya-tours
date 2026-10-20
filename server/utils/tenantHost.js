// Normalize a host header by taking its first value, lowercasing it and removing a port.
const normalizeHost = (value = "") => String(value).split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");

// Determine whether a hostname is a valid tenant subdomain of the platform host.
export const isTenantSubdomainHost = (host, platformHost, reserved = ["www", "api", "app", "admin"]) => {
  // Normalize the incoming host before making any hostname comparisons.
  const normalizedHost = normalizeHost(host);
  // Normalize the configured platform domain using the same rules.
  const normalizedPlatformHost = normalizeHost(platformHost);
  // Construct the suffix a tenant subdomain must end with.
  const suffix = `.${normalizedPlatformHost}`;
  // Reject missing values and hosts outside the configured platform domain.
  if (!normalizedHost || !normalizedPlatformHost || !normalizedHost.endsWith(suffix)) return false;
  // Extract the subdomain portion, split it into labels and discard empty labels.
  const labels = normalizedHost.slice(0, -suffix.length).split(".").filter(Boolean);
  // Accept exactly one non-reserved label, preventing nested or platform-reserved subdomains.
  return labels.length === 1 && !reserved.includes(labels[0]);
};
