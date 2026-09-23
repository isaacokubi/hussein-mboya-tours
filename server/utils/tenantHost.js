const normalizeHost = (value = "") => String(value).split(",")[0].trim().toLowerCase().replace(/:\d+$/, "");

export const isTenantSubdomainHost = (host, platformHost, reserved = ["www", "api", "app", "admin"]) => {
  const normalizedHost = normalizeHost(host);
  const normalizedPlatformHost = normalizeHost(platformHost);
  const suffix = `.${normalizedPlatformHost}`;
  if (!normalizedHost || !normalizedPlatformHost || !normalizedHost.endsWith(suffix)) return false;
  const labels = normalizedHost.slice(0, -suffix.length).split(".").filter(Boolean);
  return labels.length === 1 && !reserved.includes(labels[0]);
};
