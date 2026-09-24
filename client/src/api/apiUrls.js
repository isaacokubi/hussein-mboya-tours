const platformMode = String(import.meta.env.VITE_PLATFORM_MODE || "").trim().toLowerCase() === "true";
const configuredApiUrl = String(
  import.meta.env.VITE_API_URL || (platformMode ? import.meta.env.VITE_PLATFORM_API_URL : "") || "",
).trim();
const configuredSocketUrl = String(import.meta.env.VITE_SOCKET_URL || "").trim();

export function resolveSocketUrl(browserOrigin = "") {
  if (configuredSocketUrl) return configuredSocketUrl.replace(/\/$/, "");
  if (configuredApiUrl) {
    try {
      return new URL(configuredApiUrl).origin;
    } catch {
      // Relative API URLs use the same origin as the page.
    }
  }
  return browserOrigin;
}

export const socketUrl = resolveSocketUrl(
  typeof window === "undefined" ? "" : window.location.origin,
);
