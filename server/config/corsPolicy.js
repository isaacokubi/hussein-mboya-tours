export function getConfiguredOrigins(environment = process.env) {
  return String(environment.CLIENT_ORIGINS || environment.CLIENT_URL || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function isValidConfiguredOrigin(origin, { production = false } = {}) {
  if (origin === "*") return false;
  try {
    const parsed = new URL(origin);
    return parsed.origin === origin && parsed.hostname !== "*" && !parsed.hostname.includes("*") &&
      !parsed.username && !parsed.password &&
      (!production || parsed.protocol === "https:");
  } catch {
    return false;
  }
}

export function isConfiguredOrigin(origin, configuredOrigins) {
  return configuredOrigins.includes(origin);
}
