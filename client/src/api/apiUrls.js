// Read whether the frontend is configured to use the separate platform API.
const platformMode = String(import.meta.env.VITE_PLATFORM_MODE || "").trim().toLowerCase() === "true";
// Resolve the primary API URL, optionally falling back to the platform API URL in platform mode.
const configuredApiUrl = String(
  import.meta.env.VITE_API_URL || (platformMode ? import.meta.env.VITE_PLATFORM_API_URL : "") || "",
).trim();
// Read an explicitly configured Socket.IO endpoint, if one exists.
const configuredSocketUrl = String(import.meta.env.VITE_SOCKET_URL || "").trim();
// Detect whether Vite is producing a production build.
const productionBuild = Boolean(import.meta.env.PROD);

// Resolve the Socket.IO origin from explicit configuration, the API URL or the current page origin.
export function resolveSocketUrl(browserOrigin = "") {
  // Prefer the explicitly configured socket endpoint when it is present.
  if (configuredSocketUrl) return configuredSocketUrl.replace(/\/$/, "");
  // If an API URL is configured, try deriving the socket origin from it.
  if (configuredApiUrl) {
    try {
      // Return only the origin so API path suffixes are not used as a socket path.
      return new URL(configuredApiUrl).origin;
    } catch {
      // Relative API URLs use the same origin as the page.
    }
  }
  // Fall back to the current browser origin when no absolute API URL can be used.
  return browserOrigin;
}

// Derive a default socket origin without assuming the code always runs in a browser.
const resolvedSocketUrl = resolveSocketUrl(
  // Use an empty origin during server-side execution and window.location.origin in the browser.
  typeof window === "undefined" ? "" : window.location.origin,
);

// Validate socket URL requirements before a production frontend is allowed to use them.
function validateProductionSocketUrl(value) {
  // Preserve flexible local/test configuration outside production builds.
  if (!productionBuild) return value;
  // Declare holders for the parsed socket and API URLs.
  let socket;
  let api;
  try {
    // Parse both values so protocol, origin and path can be checked explicitly.
    socket = new URL(value);
    api = new URL(configuredApiUrl);
  } catch {
    // Fail the production build/runtime configuration if either URL is not absolute and valid.
    throw new Error("Production Socket.IO must use an absolute HTTPS origin.");
  }
  // Require HTTPS and the exact API origin, with no custom path, query, fragment or embedded credentials.
  if (socket.protocol !== "https:" || socket.origin !== api.origin || socket.pathname !== "/" || socket.search || socket.hash || socket.username || socket.password) {
    // Explain the required format without exposing any private deployment settings.
    throw new Error("Production VITE_SOCKET_URL must be the HTTPS origin of VITE_API_URL, without a path.");
  }
  // Return the normalized origin after every production check passes.
  return socket.origin;
}

// Export the validated socket origin used by Socket.IO clients.
export const socketUrl = validateProductionSocketUrl(resolvedSocketUrl);
