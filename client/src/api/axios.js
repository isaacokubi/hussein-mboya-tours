/**
 * Purpose: axios client application module. Main declarations: advanceAuthenticationGeneration, isLocalHost, isPlatformDeployment, validateProductionApiUrl, getPublicTenantSlug.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import axios from "axios";

// Declare configuredApiUrl for use by the surrounding module or function.
const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
// Declare configuredPlatformApiUrl for use by the surrounding module or function.
const configuredPlatformApiUrl = String(import.meta.env.VITE_PLATFORM_API_URL || "").trim();
// Declare productionBuild for use by the surrounding module or function.
const productionBuild = Boolean(import.meta.env.PROD);
// Declare authenticationGeneration for use by the surrounding module or function.
let authenticationGeneration = 0;

// Declare advanceAuthenticationGeneration for use by the surrounding module or function.
export const advanceAuthenticationGeneration = () => {
  // Perform the side effect or state update expressed on the following line.
  authenticationGeneration += 1;
  // Return the value of authenticationGeneration to the caller.
  return authenticationGeneration;
};

// Define isLocalHost; its parameters and body implement this operation.
function isLocalHost() {
  // Check the condition (typeof window === "undefined") and run the matching branch.
  if (typeof window === "undefined") return false;
  // Declare hostname for use by the surrounding module or function.
  const hostname = String(window.location.hostname || "").trim().toLowerCase();
  // Return the result of ["localhost", "127.0.0.1", "[::1]"].includes() to the caller.
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
}

// Define isPlatformDeployment; its parameters and body implement this operation.
function isPlatformDeployment() {
  // Declare configured for use by the surrounding module or function.
  const configured = String(import.meta.env.VITE_PLATFORM_MODE || "").trim().toLowerCase();
  // Check the condition (configured === "true") and run the matching branch.
  if (configured === "true") return true;
  // Check the condition (configured === "false") and run the matching branch.
  if (configured === "false") return false;
  // Return the expression shown below to the caller.
  return false;
}

// Declare PLATFORM_API_URL for use by the surrounding module or function.
const PLATFORM_API_URL = configuredPlatformApiUrl || "/api";
// Declare configuredBaseUrl for use by the surrounding module or function.
const configuredBaseUrl = isPlatformDeployment()
  ? (configuredPlatformApiUrl || configuredApiUrl)
  : configuredApiUrl;

// Define validateProductionApiUrl; its parameters and body implement this operation.
function validateProductionApiUrl(value) {
  // Check the condition (!productionBuild) and run the matching branch.
  if (!productionBuild) return value;
  // Check the condition (!value) and run the matching branch.
  if (!value) throw new Error("Configure VITE_API_URL (or VITE_PLATFORM_API_URL for platform mode) before building the production client.");
  // Declare parsed for use by the surrounding module or function.
  let parsed;
  // Run this operation with a dedicated error-handling path for failures.
  try { parsed = new URL(value); }
  // Handle the error raised by the preceding protected operation.
  catch { throw new Error("Production VITE_API_URL must be an absolute HTTPS URL ending in /api."); }
  // Declare hostname for use by the surrounding module or function.
  const hostname = parsed.hostname.toLowerCase();
  // Check the condition (parsed.protocol !== "https:" || hostname === "localhost" || hostname.e) and run the matching branch.
  if (parsed.protocol !== "https:" || hostname === "localhost" || hostname.endsWith(".localhost") || ["127.0.0.1", "[::1]"].includes(hostname)) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Production VITE_API_URL must use HTTPS and cannot target a local host.");
  }
  // Check the condition (parsed.username || parsed.password || parsed.search || parsed.hash) and run the matching branch.
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Production VITE_API_URL must not contain credentials, a query string, or a fragment.");
  }
  // Check the condition (parsed.pathname.replace(/\/+$/, "") !== "/api") and run the matching branch.
  if (parsed.pathname.replace(/\/+$/, "") !== "/api") {
    // Stop the current operation by raising a new Error instance.
    throw new Error("Production VITE_API_URL must use the API base path /api exactly once.");
  }
  // Return the result of value.replace() to the caller.
  return value.replace(/\/+$/, "");
}
// Declare productionApiUrl for use by the surrounding module or function.
const productionApiUrl = validateProductionApiUrl(configuredBaseUrl);

// Local development must always use the local Vite proxy. This prevents a
// developer machine from silently displaying stale data from a deployed API
// when VITE_API_URL happens to contain a production URL. Deployed builds keep
// using their configured API endpoint exactly as before.
// Declare baseURL for use by the surrounding module or function.
export const baseURL = isLocalHost()
  ? "/api"
  : (isPlatformDeployment()
      ? (productionApiUrl || PLATFORM_API_URL)
      : (productionApiUrl || configuredApiUrl || "/api"));

// Production deployments on a shared Vercel hostname cannot infer a tenant
// from the hostname alone. VITE_PUBLIC_TENANT_SLUG is therefore the explicit,
// deployment-level tenant selector. It is public configuration, not a secret.
// Declare PUBLIC_TENANT_SLUG for use by the surrounding module or function.
const PUBLIC_TENANT_SLUG = String(
  import.meta.env.VITE_PUBLIC_TENANT_SLUG ||
    import.meta.env.VITE_TENANT_SLUG ||
    ""
).trim().toLowerCase();

// Declare PUBLIC_TENANT_KEY for use by the surrounding module or function.
const PUBLIC_TENANT_KEY = String(
  import.meta.env.VITE_PUBLIC_TENANT_KEY || ""
).trim();

// Define getPublicTenantSlug; its parameters and body implement this operation.
function getPublicTenantSlug() {
  // Check the condition (typeof window === "undefined") and run the matching branch.
  if (typeof window === "undefined") return "";

  // A platform owner has no tenant by default. In particular, do not let a
  // legacy public-site fallback silently attach the Hussein Mboya tenant to
  // platform API requests. Tenant selection for platform users must be an
  // explicit action that supplies its own tenant selector.
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare storedUser for use by the surrounding module or function.
    const storedUser = JSON.parse(window.localStorage.getItem("user") || "null");
    // Declare storedRole for use by the surrounding module or function.
    const storedRole = String(storedUser?.role?.name || storedUser?.role || storedUser?.legacyRole || "")
      .trim().toLowerCase().replace(/[\s-]+/g, "_");
    // Check the condition (["super_admin", "superadmin"].includes(storedRole)) and run the matching branch.
    if (["super_admin", "superadmin"].includes(storedRole)) return "";
  } catch {
    // Invalid persisted user state is handled by AuthContext session restore.
  }

  // Declare hostname for use by the surrounding module or function.
  const hostname = String(window.location.hostname || "").trim().toLowerCase();
  // Declare configuredPlatformHost for use by the surrounding module or function.
  const configuredPlatformHost = String(import.meta.env.VITE_PLATFORM_HOST || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  // Local development has no tenant-specific hostname, so it must use the
  // explicit public tenant slug configured by the developer.
  // Check the condition (isLocalHost()) and run the matching branch.
  if (isLocalHost()) return PUBLIC_TENANT_SLUG;
  // Check the condition (isPlatformDeployment()) and run the matching branch.
  if (isPlatformDeployment()) return "";

  // Check the condition (configuredPlatformHost && hostname.endsWith(`.${configuredPlatformHost) and run the matching branch.
  if (configuredPlatformHost && hostname.endsWith(`.${configuredPlatformHost}`)) {
    // Declare label for use by the surrounding module or function.
    const label = hostname.slice(0, -`.${configuredPlatformHost}`.length).split(".").filter(Boolean).pop();
    // Check the condition (label && label !== "www") and run the matching branch.
    if (label && label !== "www") return label;
  }

  // The canonical Hussein Mboya Tours site is hosted on a shared Vercel
  // hostname, so neither the hostname nor a Vercel project preview can
  // identify its tenant. Keep the public selector scoped to that one
  // production hostname; other tenant sites still require explicit build
  // configuration or a tenant domain/subdomain.
  // Check the condition (hostname === "hussein-mboya-tours.vercel.app") and run the matching branch.
  if (hostname === "hussein-mboya-tours.vercel.app") return "hussein-mboya";

  // Return the value of PUBLIC_TENANT_SLUG to the caller.
  return PUBLIC_TENANT_SLUG;
}

// Define getPublicTenantKey; its parameters and body implement this operation.
function getPublicTenantKey() {
  // Check the condition (isPlatformDeployment()) and run the matching branch.
  if (isPlatformDeployment()) return "";
  // Return the value of PUBLIC_TENANT_KEY to the caller.
  return PUBLIC_TENANT_KEY;
}

// Define getAuthenticatedTenantId; its parameters and body implement this operation.
function getAuthenticatedTenantId() {
  // Check the condition (typeof window === "undefined") and run the matching branch.
  if (typeof window === "undefined") return "";
  // Declare direct for use by the surrounding module or function.
  const direct = String(window.localStorage.getItem("tenantId") || "").trim();
  // Check the condition (direct) and run the matching branch.
  if (direct) return direct;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare raw for use by the surrounding module or function.
    const raw = window.localStorage.getItem("user");
    // Declare user for use by the surrounding module or function.
    const user = raw ? JSON.parse(raw) : null;
    // Return the result of String(user?.tenantId?._id || user?.tenantId || "").trim() to the caller.
    return String(user?.tenantId?._id || user?.tenantId || "").trim();
  } catch {
    // Return a configured text value to the caller.
    return "";
  }
}

// Declare isPublicAuthRequest for use by the surrounding module or function.
const isPublicAuthRequest = (url = "") =>
  /(?:^|\/)auth\/(?:login|register|password-reset(?:\/|$))/i.test(String(url));
// Declare isPublicTenantSettingsRequest for use by the surrounding module or function.
const isPublicTenantSettingsRequest = (url = "") =>
  /(?:^|\/)settings\/public(?:[/?]|$)/i.test(String(url));

// Declare api for use by the surrounding module or function.
const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

// Perform the side effect or state update expressed on the following line.
api.interceptors.request.use(
  (config) => {
    // Check the condition (typeof window === "undefined") and run the matching branch.
    if (typeof window === "undefined") return config;
    // Perform the side effect or state update expressed on the following line.
    config.headers = config.headers || {};
    // Perform the side effect or state update expressed on the following line.
    config.__authGeneration = authenticationGeneration;

    // Declare publicAuthRequest for use by the surrounding module or function.
    const publicAuthRequest = isPublicAuthRequest(config.url);
    // Declare publicTenantSettingsRequest for use by the surrounding module or function.
    const publicTenantSettingsRequest = isPublicTenantSettingsRequest(config.url);
    // Only login/registration/reset endpoints are anonymous authentication
    // requests. The public settings endpoint also serves tenant branding, but
    // after login it must retain the authenticated user's tenant ID and bearer
    // token; otherwise the shared Vercel hostname falls back to Hussein Mboya
    // and displays the wrong company's branding throughout another tenant's UI.
    // Declare publicRequest for use by the surrounding module or function.
    const publicRequest = publicAuthRequest;
    // Perform the side effect or state update expressed on the following line.
    config.__cookieAuth = !publicRequest;
    // Check the condition (publicTenantSettingsRequest) and run the matching branch.
    if (publicTenantSettingsRequest) config.withCredentials = false;
    // Declare storedAccessToken for use by the surrounding module or function.
    const storedAccessToken = ["token", "accessToken", "authToken"]
      .map((key) => String(window.localStorage.getItem(key) || "").trim())
      .find(Boolean);
    // Check the condition (publicRequest) and run the matching branch.
    if (publicRequest) {
      // Public endpoints must not inherit credentials from an existing session.
      // Perform the side effect or state update expressed on the following line.
      delete config.headers.Authorization;
    } else if (storedAccessToken) {
      // Perform the side effect or state update expressed on the following line.
      config.headers.Authorization = `Bearer ${storedAccessToken}`;
    }

    // Declare tenantId for use by the surrounding module or function.
    const tenantId = publicRequest ? "" : getAuthenticatedTenantId();
    // Declare csrfToken for use by the surrounding module or function.
    const csrfToken = String(document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith("csrfToken="))?.split("=")[1] || "").trim();
    // Check the condition (!publicAuthRequest && ["post", "put", "patch", "delete"].includes(Stri) and run the matching branch.
    if (!publicAuthRequest && ["post", "put", "patch", "delete"].includes(String(config.method || "").toLowerCase()) && csrfToken) {
      // Perform the side effect or state update expressed on the following line.
      config.headers["X-CSRF-Token"] = decodeURIComponent(csrfToken);
      // Perform the side effect or state update expressed on the following line.
      config.headers["X-Requested-With"] = "XMLHttpRequest";
    }
    // Declare publicTenantSlug for use by the surrounding module or function.
    const publicTenantSlug = getPublicTenantSlug();
    // Declare publicTenantKey for use by the surrounding module or function.
    const publicTenantKey = getPublicTenantKey();
    // Declare publicLoginRequest for use by the surrounding module or function.
    const publicLoginRequest = /auth\/login(?:[/?]|$)/i.test(String(config.url || ""));

    // On the shared Vercel site, the public selector defaults to Hussein Mboya.
    // Do not attach that default tenant to login: the backend resolves the
    // submitted email to its unique tenant. Otherwise Amani Trails and Demo
    // Safari users are queried against Hussein Mboya and get "invalid password".
    // Check the condition (publicLoginRequest) and run the matching branch.
    if (publicLoginRequest) {
      // Perform the side effect or state update expressed on the following line.
      delete config.headers["X-Tenant-ID"];
      // Perform the side effect or state update expressed on the following line.
      delete config.headers["X-Tenant-Slug"];
      // Perform the side effect or state update expressed on the following line.
      delete config.headers["X-Tenant-Key"];
    } else if (tenantId && !publicAuthRequest) {
      // Perform the side effect or state update expressed on the following line.
      config.headers["X-Tenant-ID"] = tenantId;
      // Perform the side effect or state update expressed on the following line.
      delete config.headers["X-Tenant-Slug"];
      // Perform the side effect or state update expressed on the following line.
      delete config.headers["X-Tenant-Key"];
    } else {
      // Perform the side effect or state update expressed on the following line.
      delete config.headers["X-Tenant-ID"];
      // Check the condition (publicTenantSlug) and run the matching branch.
      if (publicTenantSlug) config.headers["X-Tenant-Slug"] = publicTenantSlug;
      else delete config.headers["X-Tenant-Slug"];
      // Check the condition (publicTenantKey) and run the matching branch.
      if (publicTenantKey) config.headers["X-Tenant-Key"] = publicTenantKey;
      else delete config.headers["X-Tenant-Key"];
      // Check the condition (/^[a-fA-F0-9]{24}$/.test(publicTenantKey)) and run the matching branch.
      if (/^[a-fA-F0-9]{24}$/.test(publicTenantKey)) config.headers["X-Tenant-ID"] = publicTenantKey;
    }

    // Return the value of config to the caller.
    return config;
  },
  (error) => Promise.reject(error)
);

// Perform the side effect or state update expressed on the following line.
api.interceptors.response.use(
  (response) => {
    // Declare method for use by the surrounding module or function.
    const method = String(response.config?.method || "").toLowerCase();
    // Check the condition (typeof window !== "undefined" && ["post", "put", "patch", "delete"].in) and run the matching branch.
    if (typeof window !== "undefined" && ["post", "put", "patch", "delete"].includes(method)) {
      // Perform the side effect or state update expressed on the following line.
      window.dispatchEvent(new CustomEvent("dashboard:data-changed", {
        detail: { method, url: response.config?.url || "" },
      }));
    }
    // Return the value of response to the caller.
    return response;
  },
  (error) => {
    // Declare status for use by the surrounding module or function.
    const status = error?.response?.status;
    // Declare url for use by the surrounding module or function.
    const url = String(error?.config?.url || baseURL);
    // Declare data for use by the surrounding module or function.
    const data = error?.response?.data;

    // Check the condition (!error?.response) and run the matching branch.
    if (!error?.response) {
      // Declare target for use by the surrounding module or function.
      const target = url || baseURL;
      // Declare isDevelopment for use by the surrounding module or function.
      const isDevelopment = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
      // Perform the side effect or state update expressed on the following line.
      error.networkDiagnostic = {
        target,
        code: error?.code || "NETWORK_ERROR",
        development: isDevelopment,
      };
      // Perform the side effect or state update expressed on the following line.
      error.message = isDevelopment
        ? `Unable to reach the Hussein Mboya Tours API (${target}). Make sure the backend is running on port 5000.`
        : `Unable to reach the Hussein Mboya Tours API (${target}). Check the API deployment, CORS configuration, and network connection.`;
      // Perform the side effect or state update expressed on the following line.
      console.error("[API NETWORK ERROR]", error.networkDiagnostic);
    }

    // Check the condition (status === 401 && typeof window !== "undefined") and run the matching branch.
    if (status === 401 && typeof window !== "undefined") {
      // Declare isLoginRequest for use by the surrounding module or function.
      const isLoginRequest = /\/auth\/(?:login|register)(?:[/?]|$)/i.test(url);
      // Declare isPublicTenantSettings for use by the surrounding module or function.
      const isPublicTenantSettings = isPublicTenantSettingsRequest(url);
      // Declare hasKnownUser for use by the surrounding module or function.
      const hasKnownUser = Boolean(localStorage.getItem("user"));
      // Declare isCurrentUserRequest for use by the surrounding module or function.
      const isCurrentUserRequest = /\/auth\/me(?:[/?]|$)/i.test(url);
      // AuthContext owns /me restoration and guards its result by operation
      // generation. A global event here could clear a newer login when an
      // older /me request finishes with 401 after login succeeds.
      // Declare requestGeneration for use by the surrounding module or function.
      const requestGeneration = error?.config?.__authGeneration;
      // Check the condition (!isLoginRequest && !isPublicTenantSettings && !isCurrentUserRequest &&) and run the matching branch.
      if (!isLoginRequest && !isPublicTenantSettings && !isCurrentUserRequest && hasKnownUser && requestGeneration === authenticationGeneration) {
        // Perform the side effect or state update expressed on the following line.
        window.dispatchEvent(new CustomEvent("auth:session-invalid", {
          detail: {
            url,
            status,
            message: data?.message || "Authentication session is no longer valid.",
          },
        }));
      }
    }

    // Check the condition (error?.code === "ERR_NETWORK" && typeof window !== "undefined") and run the matching branch.
    if (error?.code === "ERR_NETWORK" && typeof window !== "undefined") {
      // Perform the side effect or state update expressed on the following line.
      window.dispatchEvent(new CustomEvent("api:network-error", {
        detail: { url, message: error.message || "Unable to reach the Hussein Mboya Tours API." },
      }));
    }

    // Return the result of Promise.reject() to the caller.
    return Promise.reject(error);
  }
);

export default api;
