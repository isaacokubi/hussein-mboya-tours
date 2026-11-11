/**
 * Purpose: api Urls client application module. Main declarations: resolveSocketUrl, validateProductionSocketUrl.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
const platformMode = String(import.meta.env.VITE_PLATFORM_MODE || "").trim().toLowerCase() === "true";
// Declare configuredApiUrl for use by the surrounding module or function.
const configuredApiUrl = String(
  import.meta.env.VITE_API_URL || (platformMode ? import.meta.env.VITE_PLATFORM_API_URL : "") || "",
).trim();
// Declare configuredSocketUrl for use by the surrounding module or function.
const configuredSocketUrl = String(import.meta.env.VITE_SOCKET_URL || "").trim();
// Declare productionBuild for use by the surrounding module or function.
const productionBuild = Boolean(import.meta.env.PROD);

// Define resolveSocketUrl; its parameters and body implement this operation.
export function resolveSocketUrl(browserOrigin = "") {
  // Check the condition (configuredSocketUrl) and run the matching branch.
  if (configuredSocketUrl) return configuredSocketUrl.replace(/\/$/, "");
  // Check the condition (configuredApiUrl) and run the matching branch.
  if (configuredApiUrl) {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Return the origin value to the caller.
      return new URL(configuredApiUrl).origin;
    } catch {
      // Relative API URLs use the same origin as the page.
    }
  }
  // Return the value of browserOrigin to the caller.
  return browserOrigin;
}

// Declare resolvedSocketUrl for use by the surrounding module or function.
const resolvedSocketUrl = resolveSocketUrl(
  typeof window === "undefined" ? "" : window.location.origin,
);

// Define validateProductionSocketUrl; its parameters and body implement this operation.
function validateProductionSocketUrl(value) {
  // Check the condition (!productionBuild) and run the matching branch.
  if (!productionBuild) return value;
  // Declare socket for use by the surrounding module or function.
  let socket;
  // Declare api for use by the surrounding module or function.
  let api;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    socket = new URL(value);
    // Perform the side effect or state update expressed on the following line.
    api = new URL(configuredApiUrl);
  } catch {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Production Socket.IO must use an absolute HTTPS origin.");
  }
  // Check the condition (socket.protocol !== "https:" || socket.origin !== api.origin || socket) and run the matching branch.
  if (socket.protocol !== "https:" || socket.origin !== api.origin || socket.pathname !== "/" || socket.search || socket.hash || socket.username || socket.password) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Production VITE_SOCKET_URL must be the HTTPS origin of VITE_API_URL, without a path.");
  }
  // Return the origin value to the caller.
  return socket.origin;
}

// Declare socketUrl for use by the surrounding module or function.
export const socketUrl = validateProductionSocketUrl(resolvedSocketUrl);
