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

  const hostname = String(window.location.hostname || "").trim().toLowerCase();
  if (hostname.endsWith(".vercel.app")) {
    const label = hostname.slice(0, -".vercel.app".length).split(".").filter(Boolean).pop();
    if (label) return label;
  }

  // For custom domains, use the explicitly configured public tenant.
  return String(import.meta.env.VITE_TENANT_SLUG || "").trim().toLowerCase();
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("authToken");
  config.headers = config.headers || {};
  if (token) config.headers.Authorization = `Bearer ${token}`;

  const isAuthenticated = Boolean(token);
  const publicTenantSlug = getPublicTenantSlug();
  const tenantId = localStorage.getItem("tenantId");

  if (isAuthenticated && tenantId) {
    config.headers["X-Tenant-ID"] = tenantId;
  } else if (publicTenantSlug) {
    // Never allow a stale tenantSlug from localStorage to select a public tenant.
    config.headers["X-Tenant-Slug"] = publicTenantSlug;
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
