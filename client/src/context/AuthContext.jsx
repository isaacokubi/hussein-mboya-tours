import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
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

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  return AUTH_KEYS.map((key) => localStorage.getItem(key)?.trim()).find(Boolean) || null;
};

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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => readStoredUser());
  const [token, setToken] = useState(() => getStoredToken());
  const [loading, setLoading] = useState(true);

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

  const logout = () => {
    clearAuthStorage();
    queryClient.clear();
    setUser(null);
    setToken(null);
    window.location.href = "/login";
  };

  const fetchCurrentUser = async () => {
    const { data } = await api.get("/auth/me");
    return persistUser(data.user || data);
  };

  useEffect(() => {
    const onInvalidSession = (event) => {
      const message = event?.detail?.message || "Your authentication session is no longer valid. Please log in again.";
      console.warn("[AUTH SESSION INVALID]", message);
      clearAuthStorage();
      queryClient.clear();
      setUser(null);
      setToken(null);
      setLoading(false);
      if (window.location.pathname !== "/login") {
        window.location.replace("/login?reason=session-expired");
      }
    };

    window.addEventListener("auth:session-invalid", onInvalidSession);
    return () => window.removeEventListener("auth:session-invalid", onInvalidSession);
  }, []);

  useEffect(() => {
    const savedToken = getStoredToken();
    const savedUser = readStoredUser();
    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    if (!localStorage.getItem("token")) localStorage.setItem("token", savedToken);
    setToken(savedToken);
    if (savedUser) setUser(savedUser);

    fetchCurrentUser()
      .catch((error) => {
        const status = error?.response?.status;
        console.error("AUTH ME ERROR", error.response?.data || error.message);
        if (status !== 401) console.error("AUTH ME NON-401 FAILURE", error);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    // A new login must start from a clean authentication session. In particular,
    // never let the previous user's JWT or tenant ID be attached to /auth/login.
    AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
    ["user", "permissions", ...TENANT_SESSION_KEYS].forEach((key) => localStorage.removeItem(key));
    setToken(null);
    setUser(null);

    const { data } = await api.post("/auth/login", {
      email: String(email || "").trim().toLowerCase(),
      password,
    });
    if (data?.mfaRequired) return data;
    if (!data?.token) throw new Error("Authentication response did not contain a token.");

    const nextToken = String(data.token).trim();
    if (!nextToken) throw new Error("Authentication response contained an empty token.");
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    const normalizedUser = persistUser(data.user);
    if (!normalizedUser) throw new Error("Authentication response did not contain a user.");
    return { ...data, user: normalizedUser };
  };

  const register = async (userData) => {
    const { data } = await api.post("/auth/register", userData);
    if (data?.token) {
      const nextToken = String(data.token).trim();
      localStorage.setItem("token", nextToken);
      setToken(nextToken);
      persistUser(data.user);
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
