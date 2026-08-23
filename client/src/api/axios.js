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
 */

const configuredApiUrl = String(
  import.meta.env.VITE_API_URL || ""
).trim();

export const baseURL = configuredApiUrl || "/api";

/**
 * Public tenant configuration.
 *
 * VITE_PUBLIC_TENANT_KEY / VITE_PUBLIC_TENANT_SLUG may be
 * supplied for deployments where the public tenant is known.
 */
const PUBLIC_TENANT_KEY = String(
  import.meta.env.VITE_PUBLIC_TENANT_KEY ||
    import.meta.env.VITE_PUBLIC_TENANT_SLUG ||
    ""
).trim();

/**
 * Resolve the public tenant slug from:
 *
 * 1. VITE_TENANT_SLUG
 * 2. Vercel hostname
 */
function getPublicTenantSlug() {
  if (typeof window === "undefined") {
    return "";
  }

  const hostname = String(
    window.location.hostname || ""
  ).trim().toLowerCase();

  /*
   * Example:
   * coherent-tours.vercel.app
   *              ^^^^^^^^^^^^^
   */
  if (hostname.endsWith(".vercel.app")) {
    const label = hostname
      .slice(0, -".vercel.app".length)
      .split(".")
      .filter(Boolean)
      .pop();

    if (label) {
      return label;
    }
  }

  return String(
    import.meta.env.VITE_TENANT_SLUG || ""
  ).trim().toLowerCase();
}

/**
 * Resolve configured/local tenant key.
 */
function getPublicTenantKey() {
  if (typeof window !== "undefined") {
    const stored =
      window.localStorage.getItem("tenantKey") ||
      window.localStorage.getItem("tenantSlug");

    if (stored) {
      return stored;
    }
  }

  return PUBLIC_TENANT_KEY;
}

/**
 * ============================================================
 * AXIOS INSTANCE
 * ============================================================
 */
const api = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

/**
 * ============================================================
 * REQUEST INTERCEPTOR
 * ============================================================
 */
api.interceptors.request.use(
  (config) => {
    if (typeof window === "undefined") {
      return config;
    }

    config.headers = config.headers || {};

    /**
     * --------------------------------------------------------
     * AUTHENTICATION
     * --------------------------------------------------------
     */
    /*
     * Canonical authentication token.
     *
     * The application stores the JWT under "token".
     * The legacy keys are retained only as compatibility fallbacks.
     */
    const token =
      localStorage.getItem("token")?.trim() ||
      localStorage.getItem("accessToken")?.trim() ||
      localStorage.getItem("authToken")?.trim();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["X-Requested-With"] = "XMLHttpRequest";
    }

    /**
     * --------------------------------------------------------
     * TENANT
     * --------------------------------------------------------
     *
     * Authenticated users:
     *   Use tenantId from localStorage.
     *
     * Public users:
     *   Use tenant slug/key.
     *
     * SuperAdmin:
     *   Backend handles super_admin as a platform/global role.
     *   We do not invent a tenant ID for SuperAdmin requests.
     */
    const isAuthenticated = Boolean(token);

    const tenantId = String(
      localStorage.getItem("tenantId") || ""
    ).trim();

    const publicTenantSlug = getPublicTenantSlug();
    const publicTenantKey = getPublicTenantKey();

    if (isAuthenticated && tenantId) {
      config.headers["X-Tenant-ID"] = tenantId;
    } else if (!isAuthenticated) {
      /*
       * Prefer the configured/public slug.
       */
      if (publicTenantSlug) {
        config.headers["X-Tenant-Slug"] = publicTenantSlug;
      }

      /*
       * Compatibility with installations that expect
       * X-Tenant-Key.
       */
      if (publicTenantKey) {
        config.headers["X-Tenant-Key"] = publicTenantKey;

        /*
         * Only provide X-Tenant-ID if there isn't already one.
         *
         * Do not overwrite an authenticated tenant ID.
         */
        if (
          !config.headers["X-Tenant-ID"] &&
          !config.headers["x-tenant-id"]
        ) {
          /*
           * Only use this compatibility behavior when the
           * configured value actually looks like an ObjectId.
           */
          if (/^[a-fA-F0-9]{24}$/.test(publicTenantKey)) {
            config.headers["X-Tenant-ID"] = publicTenantKey;
          }
        }
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * ============================================================
 * RESPONSE INTERCEPTOR
 * ============================================================
 */
api.interceptors.response.use(
  (response) => {
    const method = String(
      response.config?.method || ""
    ).toLowerCase();

    /*
     * Notify dashboards that server-side data changed.
     */
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
    const url = error?.config?.url || "";
    const data = error?.response?.data;

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

      /*
       * IMPORTANT:
       * Do NOT automatically remove the JWT here.
       *
       * A dashboard request returning 401 must not silently destroy
       * the login session before AuthContext determines the cause.
       */
    }

    return Promise.reject(error);
  }
);

/**
 * Default API client.
 *
 * All existing imports such as:
 *
 * import api from "./axios";
 *
 * continue working.
 */
export default api;
