import axios from "axios";

const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
const configuredPlatformApiUrl = String(import.meta.env.VITE_PLATFORM_API_URL || "").trim();
const productionBuild = Boolean(import.meta.env.PROD);

function isLocalHost() {
  if (typeof window === "undefined") return false;
  const hostname = String(window.location.hostname || "").trim().toLowerCase();
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
}

function isPlatformDeployment() {
  const configured = String(import.meta.env.VITE_PLATFORM_MODE || "").trim().toLowerCase();
  if (configured === "true") return true;
  if (configured === "false") return false;
  return false;
}

const PLATFORM_API_URL = configuredPlatformApiUrl || "/api";
const configuredBaseUrl = isPlatformDeployment()
  ? (configuredPlatformApiUrl || configuredApiUrl)
  : configuredApiUrl;

function validateProductionApiUrl(value) {
  if (!productionBuild) return value;
  if (!value) throw new Error("Configure VITE_API_URL (or VITE_PLATFORM_API_URL for platform mode) before building the production client.");
  let parsed;
  try { parsed = new URL(value); }
  catch { throw new Error("Production VITE_API_URL must be an absolute HTTPS URL ending in /api."); }
  const hostname = parsed.hostname.toLowerCase();
  if (parsed.protocol !== "https:" || hostname === "localhost" || hostname.endsWith(".localhost") || ["127.0.0.1", "[::1]"].includes(hostname)) {
    throw new Error("Production VITE_API_URL must use HTTPS and cannot target a local host.");
  }
  if (parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error("Production VITE_API_URL must not contain credentials, a query string, or a fragment.");
  }
  if (parsed.pathname.replace(/\/+$/, "") !== "/api") {
    throw new Error("Production VITE_API_URL must use the API base path /api exactly once.");
  }
  return value.replace(/\/+$/, "");
}
const productionApiUrl = validateProductionApiUrl(configuredBaseUrl);

// Local development must always use the local Vite proxy. This prevents a
// developer machine from silently displaying stale data from a deployed API
// when VITE_API_URL happens to contain a production URL. Deployed builds keep
// using their configured API endpoint exactly as before.
export const baseURL = isLocalHost()
  ? "/api"
  : (isPlatformDeployment()
      ? (productionApiUrl || PLATFORM_API_URL)
      : (productionApiUrl || configuredApiUrl || "/api"));

// Production deployments on a shared Vercel hostname cannot infer a tenant
// from the hostname alone. VITE_PUBLIC_TENANT_SLUG is therefore the explicit,
// deployment-level tenant selector. It is public configuration, not a secret.
const PUBLIC_TENANT_SLUG = String(
  import.meta.env.VITE_PUBLIC_TENANT_SLUG ||
    import.meta.env.VITE_TENANT_SLUG ||
    ""
).trim().toLowerCase();

const PUBLIC_TENANT_KEY = String(
  import.meta.env.VITE_PUBLIC_TENANT_KEY || ""
).trim();

function getPublicTenantSlug() {
  if (typeof window === "undefined") return "";

  const hostname = String(window.location.hostname || "").trim().toLowerCase();
  const configuredPlatformHost = String(import.meta.env.VITE_PLATFORM_HOST || "")
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  // Local development has no tenant-specific hostname, so it must use the
  // explicit public tenant slug configured by the developer.
  if (isLocalHost()) return PUBLIC_TENANT_SLUG;
  if (isPlatformDeployment()) return "";

  if (configuredPlatformHost && hostname.endsWith(`.${configuredPlatformHost}`)) {
    const label = hostname.slice(0, -`.${configuredPlatformHost}`.length).split(".").filter(Boolean).pop();
    if (label && label !== "www") return label;
  }

  return PUBLIC_TENANT_SLUG;
}

function getPublicTenantKey() {
  if (isPlatformDeployment()) return "";
  return PUBLIC_TENANT_KEY;
}

function getAuthenticatedTenantId() {
  if (typeof window === "undefined") return "";
  const direct = String(window.localStorage.getItem("tenantId") || "").trim();
  if (direct) return direct;
  try {
    const raw = window.localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    return String(user?.tenantId?._id || user?.tenantId || "").trim();
  } catch {
    return "";
  }
}

const isPublicAuthRequest = (url = "") =>
  /(?:^|\/)auth\/(?:login|register|password-reset(?:\/|$))/i.test(String(url));

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined") return config;
    config.headers = config.headers || {};

    const publicAuthRequest = isPublicAuthRequest(config.url);
    config.__cookieAuth = !publicAuthRequest;
    delete config.headers.Authorization;

    const tenantId = publicAuthRequest ? "" : getAuthenticatedTenantId();
    const csrfToken = String(document.cookie.split(";").map((item) => item.trim()).find((item) => item.startsWith("csrfToken="))?.split("=")[1] || "").trim();
    if (!publicAuthRequest && ["post", "put", "patch", "delete"].includes(String(config.method || "").toLowerCase()) && csrfToken) {
      config.headers["X-CSRF-Token"] = decodeURIComponent(csrfToken);
      config.headers["X-Requested-With"] = "XMLHttpRequest";
    }
    const publicTenantSlug = getPublicTenantSlug();
    const publicTenantKey = getPublicTenantKey();

    if (tenantId && !publicAuthRequest) {
      config.headers["X-Tenant-ID"] = tenantId;
      delete config.headers["X-Tenant-Slug"];
      delete config.headers["X-Tenant-Key"];
    } else {
      delete config.headers["X-Tenant-ID"];
      if (publicTenantSlug) config.headers["X-Tenant-Slug"] = publicTenantSlug;
      else delete config.headers["X-Tenant-Slug"];
      if (publicTenantKey) config.headers["X-Tenant-Key"] = publicTenantKey;
      else delete config.headers["X-Tenant-Key"];
      if (/^[a-fA-F0-9]{24}$/.test(publicTenantKey)) config.headers["X-Tenant-ID"] = publicTenantKey;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const method = String(response.config?.method || "").toLowerCase();
    if (typeof window !== "undefined" && ["post", "put", "patch", "delete"].includes(method)) {
      window.dispatchEvent(new CustomEvent("dashboard:data-changed", {
        detail: { method, url: response.config?.url || "" },
      }));
    }
    return response;
  },
  (error) => {
    const status = error?.response?.status;
    const url = String(error?.config?.url || baseURL);
    const data = error?.response?.data;

    if (!error?.response) {
      const target = url || baseURL;
      const isDevelopment = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
      error.networkDiagnostic = {
        target,
        code: error?.code || "NETWORK_ERROR",
        development: isDevelopment,
      };
      error.message = isDevelopment
        ? `Unable to reach the Global Tours API (${target}). Make sure the backend is running on port 5000.`
        : `Unable to reach the Global Tours API (${target}). Check the API deployment, CORS configuration, and network connection.`;
      console.error("[API NETWORK ERROR]", error.networkDiagnostic);
    }

    if (status === 401 && typeof window !== "undefined") {
      const isLoginRequest = /\/auth\/(?:login|register)(?:[/?]|$)/i.test(url);
      const hasKnownUser = Boolean(localStorage.getItem("user"));
      if (!isLoginRequest && hasKnownUser) {
        window.dispatchEvent(new CustomEvent("auth:session-invalid", {
          detail: {
            url,
            status,
            message: data?.message || "Authentication session is no longer valid.",
          },
        }));
      }
    }

    if (error?.code === "ERR_NETWORK" && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("api:network-error", {
        detail: { url, message: error.message || "Unable to reach the Global Tours API." },
      }));
    }

    return Promise.reject(error);
  }
);

export default api;
