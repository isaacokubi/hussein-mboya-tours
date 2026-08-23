import axios from "axios";

/**
 * ============================================================
 * AXIOS API CLIENT
 * ============================================================
 *
 * Single Axios instance for the entire frontend.
 *
 * Responsibilities:
 * - API base URL
 * - JWT Authorization
 * - Tenant identification
 * - Public tenant resolution
 * - Credentials/cookies
 * - Central response handling
 * - Actionable network diagnostics
 */

const configuredApiUrl = String(
  import.meta.env.VITE_API_URL || ""
).trim();

// Prefer same-origin /api when no deployment-specific API URL is configured.
// Vite proxies /api to the local Express server during development.
export const baseURL = configuredApiUrl || "/api";

const PUBLIC_TENANT_KEY = String(
  import.meta.env.VITE_PUBLIC_TENANT_KEY ||
    import.meta.env.VITE_PUBLIC_TENANT_SLUG ||
    ""
).trim();

function getPublicTenantSlug() {
  if (typeof window === "undefined") return "";

  const hostname = String(
    window.location.hostname || ""
  ).trim().toLowerCase();

  if (hostname.endsWith(".vercel.app")) {
    const label = hostname
      .slice(0, -".vercel.app".length)
      .split(".")
      .filter(Boolean)
      .pop();

    if (label) return label;
  }

  return String(
    import.meta.env.VITE_TENANT_SLUG || ""
  ).trim().toLowerCase();
}

function getPublicTenantKey() {
  if (typeof window !== "undefined") {
    const stored =
      window.localStorage.getItem("tenantKey") ||
      window.localStorage.getItem("tenantSlug");

    if (stored) return stored;
  }

  return PUBLIC_TENANT_KEY;
}

const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
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

    const isAuthenticated = Boolean(token);
    const tenantId = String(
      localStorage.getItem("tenantId") || ""
    ).trim();
    const publicTenantSlug = getPublicTenantSlug();
    const publicTenantKey = getPublicTenantKey();

    if (isAuthenticated && tenantId) {
      config.headers["X-Tenant-ID"] = tenantId;
    } else if (!isAuthenticated) {
      if (publicTenantSlug) {
        config.headers["X-Tenant-Slug"] = publicTenantSlug;
      }

      if (publicTenantKey) {
        config.headers["X-Tenant-Key"] = publicTenantKey;

        if (
          !config.headers["X-Tenant-ID"] &&
          !config.headers["x-tenant-id"] &&
          /^[a-fA-F0-9]{24}$/.test(publicTenantKey)
        ) {
          config.headers["X-Tenant-ID"] = publicTenantKey;
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => {
    const method = String(
      response.config?.method || ""
    ).toLowerCase();

    if (
      typeof window !== "undefined" &&
      ["post", "put", "patch", "delete"].includes(method)
    ) {
      window.dispatchEvent(
        new CustomEvent("dashboard:data-changed", {
          detail: {
            method,
            url: response.config?.url || "",
          },
        })
      );
    }

    return response;
  },

  (error) => {
    const status = error?.response?.status;
    const url = error?.config?.url || baseURL;
    const data = error?.response?.data;

    if (!error?.response) {
      const target = String(url || baseURL).trim();
      const isDevelopment =
        typeof window !== "undefined" &&
        ["localhost", "127.0.0.1"].includes(window.location.hostname);

      error.networkDiagnostic = {
        target,
        code: error?.code || "NETWORK_ERROR",
        development: isDevelopment,
      };

      error.message = isDevelopment
        ? `Unable to reach the Coherent Tours API (${target}). Make sure the backend is running on port 5000.`
        : `Unable to reach the Coherent Tours API (${target}). Check the API deployment, CORS configuration, and network connection.`;

      console.error("[API NETWORK ERROR]", error.networkDiagnostic);
      return Promise.reject(error);
    }

    if (status === 401) {
      console.error("[AUTH 401]", {
        url,
        status,
        response: data,
        hasToken:
          typeof window !== "undefined"
            ? Boolean(
                localStorage.getItem("token") ||
                localStorage.getItem("accessToken") ||
                localStorage.getItem("authToken")
              )
            : false,
      });
    }

    return Promise.reject(error);
  }
);

export default api;
