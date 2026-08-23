import axios from "axios";

const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
export const baseURL = configuredApiUrl || "/api";

const PUBLIC_TENANT_KEY = String(
  import.meta.env.VITE_PUBLIC_TENANT_KEY ||
    import.meta.env.VITE_PUBLIC_TENANT_SLUG ||
    ""
).trim();

function getPublicTenantSlug() {
  if (typeof window === "undefined") return "";
  const hostname = String(window.location.hostname || "").trim().toLowerCase();
  if (hostname.endsWith(".vercel.app")) {
    const label = hostname.slice(0, -".vercel.app".length).split(".").filter(Boolean).pop();
    if (label) return label;
  }
  return String(import.meta.env.VITE_TENANT_SLUG || "").trim().toLowerCase();
}

function getPublicTenantKey() {
  if (typeof window !== "undefined") {
    const stored = window.localStorage.getItem("tenantKey") || window.localStorage.getItem("tenantSlug");
    if (stored) return stored;
  }
  return PUBLIC_TENANT_KEY;
}

function getAuthenticatedTenantId() {
  if (typeof window === "undefined") return "";
  const direct = String(window.localStorage.getItem("tenantId") || "").trim();
  if (direct) return direct;

  try {
    const raw = window.localStorage.getItem("user");
    const user = raw ? JSON.parse(raw) : null;
    const tenantId = user?.tenantId?._id || user?.tenantId || "";
    return String(tenantId).trim();
  } catch {
    return "";
  }
}

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

    const token =
      localStorage.getItem("token")?.trim() ||
      localStorage.getItem("accessToken")?.trim() ||
      localStorage.getItem("authToken")?.trim();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["X-Requested-With"] = "XMLHttpRequest";
    }

    const tenantId = getAuthenticatedTenantId();
    const publicTenantSlug = getPublicTenantSlug();
    const publicTenantKey = getPublicTenantKey();

    // Every authenticated tenant dashboard request gets the tenant derived
    // from the authenticated session. Never let a stale public tenant header
    // override the user's database tenant.
    if (token) {
      if (tenantId) config.headers["X-Tenant-ID"] = tenantId;
      delete config.headers["X-Tenant-Slug"];
      delete config.headers["X-Tenant-Key"];
    } else {
      if (publicTenantSlug) config.headers["X-Tenant-Slug"] = publicTenantSlug;
      if (publicTenantKey) config.headers["X-Tenant-Key"] = publicTenantKey;
      if (/^[a-fA-F0-9]{24}$/.test(publicTenantKey) && !config.headers["X-Tenant-ID"]) {
        config.headers["X-Tenant-ID"] = publicTenantKey;
      }
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
    const url = String(error?.config?.url || "");
    const data = error?.response?.data;

    if (status === 401 && typeof window !== "undefined") {
      const isLoginRequest = /\/auth\/login(?:[/?]|$)/i.test(url);
      console.error("[AUTH 401]", {
        url,
        status,
        response: data,
        hasToken: Boolean(localStorage.getItem("token") || localStorage.getItem("accessToken") || localStorage.getItem("authToken")),
      });

      // One central session event makes auth failures behave identically on
      // customer, admin, manager, agent, guide, driver and superadmin dashboards.
      // Login failures are left to the Login page so credentials are not wiped.
      if (!isLoginRequest) {
        window.dispatchEvent(new CustomEvent("auth:session-invalid", {
          detail: { url, status, message: data?.message || "Authentication session is no longer valid." },
        }));
      }
    }

    if (error?.code === "ERR_NETWORK" && typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("api:network-error", {
        detail: { url, message: "Unable to reach the Travel Company API." },
      }));
    }

    return Promise.reject(error);
  }
);

export default api;
