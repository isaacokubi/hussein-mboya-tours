import axios from "axios";

const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
const baseURL = configuredApiUrl || "/api";

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: { "Content-Type": "application/json" },
});

function getPublicTenantSlug() {
  if (typeof window === "undefined") return "";
  const configured = String(import.meta.env.VITE_TENANT_SLUG || "").trim().toLowerCase();
  if (configured) return configured;
  const hostname = String(window.location.hostname || "").trim().toLowerCase();
  if (hostname.endsWith(".vercel.app")) {
    const label = hostname.slice(0, -".vercel.app".length).split(".").filter(Boolean).pop();
    return label || "";
  }
  return "";
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("authToken");
  config.headers = config.headers || {};
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const isAuthenticated = Boolean(token);
  const hostnameTenantSlug = getPublicTenantSlug();
  const storedTenantSlug = String(localStorage.getItem("tenantSlug") || "").trim().toLowerCase();
  const tenantId = localStorage.getItem("tenantId");

  if (isAuthenticated && tenantId) {
    config.headers["X-Tenant-ID"] = tenantId;
  } else {
    // Public pages are bound to their deployment hostname/configuration.
    // A stale tenantSlug from another tenant session must never override it.
    const publicTenantSlug = hostnameTenantSlug || storedTenantSlug;
    if (publicTenantSlug) config.headers["X-Tenant-Slug"] = publicTenantSlug;
  }

  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => {
  const method = String(response.config?.method || "").toLowerCase();
  if (typeof window !== "undefined" && ["post", "put", "patch", "delete"].includes(method)) {
    window.dispatchEvent(new CustomEvent("dashboard:data-changed", { detail: { method, url: response.config?.url || "" } }));
  }
  return response;
}, (error) => {
  if (error.response?.status === 401) console.error("401 SERVER RESPONSE", error.response.data);
  return Promise.reject(error);
});

export { baseURL };
export default api;
