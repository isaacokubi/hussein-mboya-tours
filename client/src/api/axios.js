import axios from "axios";

const configuredApiUrl = String(import.meta.env.VITE_API_URL || "").trim();
export const baseURL = configuredApiUrl || "/api";

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

function isLocalHost() {
  if (typeof window === "undefined") return false;
  const hostname = String(window.location.hostname || "").trim().toLowerCase();
  return ["localhost", "127.0.0.1", "[::1]"].includes(hostname);
}

function getPublicTenantSlug() {
  if (typeof window === "undefined" || isLocalHost()) return "";

  const hostname = String(window.location.hostname || "").trim().toLowerCase();

  // A tenant subdomain on the configured platform host is authoritative.
  const configuredPlatformHost = String(
    import.meta.env.VITE_PLATFORM_HOST || ""
  )
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "");

  if (configuredPlatformHost && hostname.endsWith(`.${configuredPlatformHost}`)) {
    const label = hostname.slice(0, -`.${configuredPlatformHost}`.length).split(".").filter(Boolean).pop();
    if (label && label !== "www") return label;
  }

  // The Vercel project hostname is a deployment hostname, not a tenant slug.
  // Never assume that the Vercel project name identifies a tenant.
  return PUBLIC_TENANT_SLUG;
}

function getPublicTenantKey() {
  if (isLocalHost()) return "";
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

const readStoredToken = () => {
  if (typeof window === "undefined") return "";
  return String(
    localStorage.getItem("token") ||
      localStorage.getItem("accessToken") ||
      localStorage.getItem("authToken") ||
      ""
  ).trim();
};

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
    const token = publicAuthRequest ? "" : readStoredToken();
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
    const url = String(error?.config?.url || "");
    const data = error?.response?.data;

    if (status === 401 && typeof window !== "undefined") {
      const isLoginRequest = /\/auth\/login(?:[/?]|$)/i.test(url);
      const requestToken = String(error?.config?.__authToken || "").trim();
      const currentToken = readStoredToken();
      const sameCurrentSession = Boolean(requestToken && currentToken && requestToken === currentToken);
      const staleRequest = Boolean(requestToken && currentToken && requestToken !== currentToken);

      console.error("[AUTH 401]", {
        url,
        status,
        response: data,
        requestTokenPresent: Boolean(requestToken),
        currentTokenPresent: Boolean(currentToken),
        staleRequest,
      });

      if (!isLoginRequest && sameCurrentSession && !staleRequest) {
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
