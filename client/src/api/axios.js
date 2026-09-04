import axios from "axios";

const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
const configuredPlatformApiUrl = String(import.meta.env.VITE_PLATFORM_API_URL || "").trim();

function isLocalHost() {
  if (typeof window === "undefined") return false;
  const hostname = String(window.location.hostname || "").trim().toLowerCase();
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
}

function isPlatformDeployment() {
  const configured = String(import.meta.env.VITE_PLATFORM_MODE || "").trim().toLowerCase();
  if (configured === "true") return true;
  if (configured === "false") return false;
  if (typeof window === "undefined") return false;
  return String(window.location.hostname || "").trim().toLowerCase() === "hussein-mboya-tours.vercel.app";
}

const PLATFORM_API_URL = configuredPlatformApiUrl || "https://hussein-mboya-tours.onrender.com/api";
export const baseURL = isLocalHost()
  ? "/api"
  : (isPlatformDeployment() ? PLATFORM_API_URL : (configuredApiUrl || "/api"));

const PUBLIC_TENANT_SLUG = String(import.meta.env.VITE_PUBLIC_TENANT_SLUG || import.meta.env.VITE_TENANT_SLUG || "").trim().toLowerCase();
const PUBLIC_TENANT_KEY = String(import.meta.env.VITE_PUBLIC_TENANT_KEY || "").trim();

function getPublicTenantSlug() {
  if (typeof window === "undefined" || isLocalHost() || isPlatformDeployment()) return "";
  const hostname = String(window.location.hostname || "").trim().toLowerCase();
  const configuredPlatformHost = String(import.meta.env.VITE_PLATFORM_HOST || "").trim().toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, "");
  if (configuredPlatformHost && hostname.endsWith(`.${configuredPlatformHost}`)) {
    const label = hostname.slice(0, -`.${configuredPlatformHost}`.length).split(".").filter(Boolean).pop();
    if (label && label !== "www") return label;
  }
  return PUBLIC_TENANT_SLUG;
}
function getPublicTenantKey() { if (isLocalHost() || isPlatformDeployment()) return ""; return PUBLIC_TENANT_KEY; }
function getAuthenticatedTenantId() {
  if (typeof window === "undefined") return "";
  const direct = String(window.localStorage.getItem("tenantId") || "").trim();
  if (direct) return direct;
  try { const raw = window.localStorage.getItem("user"); const user = raw ? JSON.parse(raw) : null; return String(user?.tenantId?._id || user?.tenantId || "").trim(); } catch { return ""; }
}
const isPublicAuthRequest = (url = "") => /(?:^|\/)auth\/(?:login|register|bootstrap|password-reset(?:\/|$))/i.test(String(url));
const readStoredToken = () => {
  if (typeof window === "undefined") return "";
  return String(localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("authToken") || "").trim();
};

const api = axios.create({ baseURL, withCredentials: true, timeout: 30000, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config) => {
  if (typeof window === "undefined") return config;
  config.headers = config.headers || {};
  const publicAuthRequest = isPublicAuthRequest(config.url);
  const token = publicAuthRequest ? "" : readStoredToken();
  config.__authToken = token || "";
  if (token) { config.headers.Authorization = `Bearer ${token}`; config.headers["X-Requested-With"] = "XMLHttpRequest"; } else delete config.headers.Authorization;
  const tenantId = publicAuthRequest ? "" : getAuthenticatedTenantId();
  const publicTenantSlug = getPublicTenantSlug();
  const publicTenantKey = getPublicTenantKey();
  if (token && tenantId) { config.headers["X-Tenant-ID"] = tenantId; delete config.headers["X-Tenant-Slug"]; delete config.headers["X-Tenant-Key"]; }
  else {
    delete config.headers["X-Tenant-ID"];
    if (publicTenantSlug) config.headers["X-Tenant-Slug"] = publicTenantSlug; else delete config.headers["X-Tenant-Slug"];
    if (publicTenantKey) config.headers["X-Tenant-Key"] = publicTenantKey; else delete config.headers["X-Tenant-Key"];
    if (/^[a-fA-F0-9]{24}$/.test(publicTenantKey)) config.headers["X-Tenant-ID"] = publicTenantKey;
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => {
  const method = String(response.config?.method || "").toLowerCase();
  if (typeof window !== "undefined" && ["post", "put", "patch", "delete"].includes(method)) window.dispatchEvent(new CustomEvent("dashboard:data-changed", { detail: { method, url: response.config?.url || "" } }));
  return response;
}, (error) => {
  const status = error?.response?.status;
  const url = String(error?.config?.url || baseURL);
  const data = error?.response?.data;
  if (!error?.response) {
    const target = url || baseURL;
    const isDevelopment = typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname);
    error.networkDiagnostic = { target, code: error?.code || "NETWORK_ERROR", development: isDevelopment };
    error.message = isDevelopment
      ? `Unable to reach the Global Tours API (${target}). Make sure the backend is running on port 5000.`
      : `Unable to reach the Global Tours API (${target}). Check the API deployment, CORS configuration, and network connection.`;
    console.error("[API NETWORK ERROR]", error.networkDiagnostic);
  }
  if (status === 401 && typeof window !== "undefined") {
    const isLoginRequest = /\/auth\/login(?:[/?]|$)/i.test(url);
    const requestToken = String(error?.config?.__authToken || "").trim();
    const currentToken = readStoredToken();
    const sameCurrentSession = Boolean(requestToken && currentToken && requestToken === currentToken);
    const staleRequest = Boolean(requestToken && currentToken && requestToken !== currentToken);
    console.error("[AUTH 401]", { url, status, response: data, requestTokenPresent: Boolean(requestToken), currentTokenPresent: Boolean(currentToken), staleRequest });
    if (!isLoginRequest && sameCurrentSession && !staleRequest) window.dispatchEvent(new CustomEvent("auth:session-invalid", { detail: { url, status, requestToken, message: data?.message || "Authentication session is no longer valid." } }));
  }
  if (error?.code === "ERR_NETWORK" && typeof window !== "undefined") window.dispatchEvent(new CustomEvent("api:network-error", { detail: { url, message: error.message || "Unable to reach the Global Tours API." } }));
  return Promise.reject(error);
});

export default api;
