const platformMode = String(import.meta.env.VITE_PLATFORM_MODE || "").trim().toLowerCase() === "true";
const configuredApiUrl = String(
  import.meta.env.VITE_API_URL || (platformMode ? import.meta.env.VITE_PLATFORM_API_URL : "") || "",
).trim();
const configuredSocketUrl = String(import.meta.env.VITE_SOCKET_URL || "").trim();
const productionBuild = Boolean(import.meta.env.PROD);

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

const resolvedSocketUrl = resolveSocketUrl(
  typeof window === "undefined" ? "" : window.location.origin,
);

function validateProductionSocketUrl(value) {
  if (!productionBuild) return value;
  let socket;
  let api;
  try {
    socket = new URL(value);
    api = new URL(configuredApiUrl);
  } catch {
    throw new Error("Production Socket.IO must use an absolute HTTPS origin.");
  }
  if (socket.protocol !== "https:" || socket.origin !== api.origin || socket.pathname !== "/" || socket.search || socket.hash || socket.username || socket.password) {
    throw new Error("Production VITE_SOCKET_URL must be the HTTPS origin of VITE_API_URL, without a path.");
  }
  return socket.origin;
}

export const socketUrl = validateProductionSocketUrl(resolvedSocketUrl);
