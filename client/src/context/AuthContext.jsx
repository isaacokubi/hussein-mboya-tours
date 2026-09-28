import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import api, { advanceAuthenticationGeneration } from "../api/axios";
import { queryClient } from "../lib/queryClient";
import { getUserRole, normalizeRole } from "../utils/roleUtils";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const ADMIN_BASE_PERMISSIONS = [
  "admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage",
  "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage",
  "notifications.view", "finance.view", "customer.view", "manage_customers", "tour.view",
  "tour.create", "tour.update", "booking.view", "report.view", "guide.view", "vehicle.view",
];

const AUTH_KEYS = ["token", "accessToken", "authToken"];
const TENANT_SESSION_KEYS = ["tenantId", "tenantSlug", "tenantKey"];

const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  const seen = new Set();
  return permissions.map((permission) => {
    if (typeof permission === "string") return { name: permission.trim() };
    if (!permission?.name) return null;
    return { ...permission, name: String(permission.name).trim() };
  }).filter((permission) => {
    if (!permission?.name) return false;
    const key = permission.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
};

const extractRolePermissions = (user) => {
  const roleIdPermissions = user?.roleId && typeof user.roleId === "object" ? user.roleId.permissions || [] : [];
  const roleObjectPermissions = user?.role && typeof user.role === "object" ? user.role.permissions || [] : [];
  return [...roleIdPermissions, ...roleObjectPermissions];
};

const normalizeUser = (user) => {
  if (!user) return null;
  const role = getUserRole(user);
  const rolePermissions = extractRolePermissions(user);
  const overridePermissions = user.permissionsOverride || user.permissionOverrides || [];
  const directPermissions = user.permissions || [];
  const fallbackPermissions = ["admin", "super_admin"].includes(role) ? ADMIN_BASE_PERMISSIONS : [];
  return {
    ...user,
    role,
    permissions: normalizePermissions([...fallbackPermissions, ...rolePermissions, ...overridePermissions, ...directPermissions]),
  };
};

const readStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem("user");
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    localStorage.removeItem("user");
    return null;
  }
};

const preloadTenantSettings = async () => {
  if (typeof window === "undefined") return null;
  try {
    const response = await api.get("/settings/public", { params: { _t: Date.now() } });
    const settings = response.data?.settings || response.data?.data || response.data || {};
    const tenantId = String(localStorage.getItem("tenantId") || "").trim();
    const storageKey = tenantId ? `tenant-settings:${tenantId}` : "tenant-settings:public";
    localStorage.setItem(storageKey, JSON.stringify(settings));
    window.dispatchEvent(new CustomEvent("settings-updated", { detail: settings }));
    return settings;
  } catch (error) {
    console.warn("Tenant settings preload after login failed; SettingsProvider will retry:", error);
    return null;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(false);
  const [loading, setLoading] = useState(true);
  // Async session restoration must never clear or replace a newer login.
  const authOperation = useRef(0);

  const persistUser = (nextUser) => {
    const normalized = normalizeUser(nextUser);
    setUser(normalized);
    if (normalized) {
      localStorage.setItem("user", JSON.stringify(normalized));
      localStorage.setItem("permissions", JSON.stringify(normalized.permissions.map((p) => p.name)));
      const tenantId = normalized.tenantId?._id || normalized.tenantId || "";
      if (tenantId) localStorage.setItem("tenantId", String(tenantId));
      else localStorage.removeItem("tenantId");
      if (normalized.tenantSlug) localStorage.setItem("tenantSlug", String(normalized.tenantSlug));
      else localStorage.removeItem("tenantSlug");
    }
    return normalized;
  };

  const clearAuthStorage = () => {
    [...AUTH_KEYS, "user", "permissions", ...TENANT_SESSION_KEYS].forEach((key) => localStorage.removeItem(key));
  };

  const logout = async () => {
    authOperation.current += 1;
    advanceAuthenticationGeneration();
    try { await api.post("/auth/logout"); } catch (error) { console.warn("AUTH LOGOUT REQUEST FAILED", error?.message || error); }
    clearAuthStorage();
    queryClient.clear();
    setUser(null);
    setToken(false);
    window.location.href = "/login";
  };

  const fetchCurrentUser = async () => {
    const { data } = await api.get("/auth/me");
    const currentUser = persistUser(data.user || data);
    await preloadTenantSettings();
    return currentUser;
  };

  useEffect(() => {
    const onInvalidSession = (event) => {
      const message = event?.detail?.message || "Your authentication session is no longer valid. Please log in again.";
      console.warn("[AUTH SESSION INVALID]", message);
      clearAuthStorage();
      queryClient.clear();
      setUser(null);
      setToken(false);
      setLoading(false);
      if (window.location.pathname !== "/login") {
        window.location.replace("/login?reason=session-expired");
      }
    };

    window.addEventListener("auth:session-invalid", onInvalidSession);
    return () => window.removeEventListener("auth:session-invalid", onInvalidSession);
  }, []);

  useEffect(() => {
    const savedUser = readStoredUser();
    if (savedUser) setUser(savedUser);
    const operation = authOperation.current;

    // Capture the operation generation so an initial /me response arriving
    // after login cannot reset the freshly established session.
    api.get("/auth/me")
      .then(async ({ data }) => {
        if (authOperation.current !== operation) return;
        const currentUser = persistUser(data.user || data);
        setToken(Boolean(currentUser));
        await preloadTenantSettings();
      })
      .catch((error) => {
        if (authOperation.current !== operation) return;
        const status = error?.response?.status;
        if (status !== 401) console.error("AUTH ME NON-401 FAILURE", error);
        clearAuthStorage();
        setUser(null);
        setToken(false);
      })
      .finally(() => {
        if (authOperation.current === operation) setLoading(false);
      });
  }, []);

  const login = async (email, password) => {
    authOperation.current += 1;
    advanceAuthenticationGeneration();
    setLoading(true);
    // A new login must start from a clean authentication session. In particular,
    // never let the previous user's JWT or tenant ID be attached to /auth/login.
    AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
    ["user", "permissions", ...TENANT_SESSION_KEYS].forEach((key) => localStorage.removeItem(key));
    setToken(false);
    setUser(null);

    try {
      const { data } = await api.post("/auth/login", {
        email: String(email || "").trim().toLowerCase(),
        password,
      });
      if (data?.mfaRequired) return data;
      if (!data?.user) throw new Error("Authentication response did not contain a user.");
      if (!data?.token) throw new Error("Authentication response did not contain an access token.");
      // Keep the backend's HttpOnly cookie session and persist its returned
      // bearer token as a fallback for browsers that block cross-site cookies.
      localStorage.setItem("token", data.token);
      const normalizedUser = persistUser(data.user);
      if (!normalizedUser) throw new Error("Authentication response did not contain a user.");
      setToken(true);

      // The backend has now set the HttpOnly session cookie. Load tenant
      // settings before navigation so the dashboard uses the right tenant.
      await preloadTenantSettings();
      return { ...data, user: normalizedUser };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    if (data?.user && data?.token) {
      localStorage.setItem("token", data.token);
      setToken(true);
      persistUser(data.user);
      await preloadTenantSettings();
    }
    return data;
  };

  const permissions = user?.permissions || [];
  const hasPermission = (permission) => {
    if (!user || !permission) return false;
    const role = getUserRole(user);
    const wanted = String(permission).trim().toLowerCase();
    if (role === "super_admin") return true;
    if (role === "admin" && ADMIN_BASE_PERMISSIONS.includes(wanted)) return true;
    return permissions.some((p) => String(p?.name || "").trim().toLowerCase() === wanted && p?.enabled !== false);
  };
  const hasAnyPermission = (items = []) => items.some(hasPermission);
  const hasAllPermissions = (items = []) => items.every(hasPermission);
  const hasRole = (roleName) => getUserRole(user) === normalizeRole(roleName);
  const canAccess = hasPermission;
  const getMenuPermissions = () => permissions;

  const value = useMemo(() => ({
    user,
    setUser: (valueOrUpdater) => setUser((current) => normalizeUser(typeof valueOrUpdater === "function" ? valueOrUpdater(current) : valueOrUpdater)),
    token, loading, login, register, logout, fetchCurrentUser, permissions,
    hasPermission, hasAnyPermission, hasAllPermissions, hasRole, canAccess, getMenuPermissions,
  }), [user, token, loading, permissions]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
