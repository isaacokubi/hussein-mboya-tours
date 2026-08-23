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
  // Public tenant identity must come from deployment configuration/hostname,
  // never from a previous authenticated session.
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

const isPublicAuthRequest = (url = "") =>
  /(?:^|\/)auth\/(?:login|register|bootstrap|password-reset(?:\/|$))/i.test(String(url));

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
    const token = publicAuthRequest
      ? ""
      : localStorage.getItem("token")?.trim() ||
        localStorage.getItem("accessToken")?.trim() ||
        localStorage.getItem("authToken")?.trim();

    // Keep the exact credential used by this request so a delayed 401 from an
    // old request cannot invalidate a newer login session.
    config.__authToken = token || "";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      config.headers["X-Requested-With"] = "XMLHttpRequest";
    } else {
      delete config.headers.Authorization;
    }

    const tenantId = publicAuthRequest ? "" : getAuthenticatedTenantId();
    const publicTenantSlug = getPublicTenantSlug();
    const publicTenantKey = getPublicTenantKey();

    if (token && tenantId) {
      config.headers["X-Tenant-ID"] = tenantId;
      delete config.headers["X-Tenant-Slug"];
      delete config.headers["X-Tenant-Key"];
    } else {
      delete config.headers["X-Tenant-ID"];
      if (publicTenantSlug) config.headers["X-Tenant-Slug"] = publicTenantSlug;
      else delete config.headers["X-Tenant-Slug"];
      if (publicTenantKey) config.headers["X-Tenant-Key"] = publicTenantKey;
      else delete config.headers["X-Tenant-Key"];
      if (/^[a-fA-F0-9]{24}$/.test(publicTenantKey)) {
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
      const requestToken = String(error?.config?.__authToken || "").trim();
      const currentToken = String(
        localStorage.getItem("token") ||
          localStorage.getItem("accessToken") ||
          localStorage.getItem("authToken") ||
          ""
      ).trim();

      console.error("[AUTH 401]", {
        url,
        status,
        response: data,
        requestTokenPresent: Boolean(requestToken),
        currentTokenPresent: Boolean(currentToken),
        staleRequest: Boolean(requestToken && currentToken && requestToken !== currentToken),
      });

      // Do not invalidate the current session when this 401 belongs to an
      // older request/token. This closes the login -> /auth/me race that could
      // bounce a successfully authenticated user back to /login.
      if (!isLoginRequest && (!requestToken || !currentToken || requestToken === currentToken)) {
        window.dispatchEvent(new CustomEvent("auth:session-invalid", {
          detail: {
            url,
            status,
            requestToken,
            message: data?.message || "Authentication session is no longer valid.",
          },
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
