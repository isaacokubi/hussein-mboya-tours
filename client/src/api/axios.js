import axios from "axios";

const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
const isLocalBrowser = typeof window !== "undefined" && ["localhost", "127.0.0.1", "::1"].includes(window.location.hostname);
const isNgrokUrl = /ngrok(-free)?\.dev/i.test(configuredApiUrl);
const baseURL = isLocalBrowser && (!configuredApiUrl || isNgrokUrl) ? "http://localhost:5000/api" : configuredApiUrl || "/api";

const api = axios.create({ baseURL, withCredentials: true, timeout: 30000, headers: { "Content-Type": "application/json" } });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("authToken");
  config.headers = config.headers || {};
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const tenantId = localStorage.getItem("tenantId");
  const tenantSlug = localStorage.getItem("tenantSlug") || import.meta.env.VITE_TENANT_SLUG;
  if (tenantId) config.headers["X-Tenant-ID"] = tenantId;
  else if (tenantSlug) config.headers["X-Tenant-Slug"] = tenantSlug;
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
