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
  const [token, setToken] = useState(() => localStorage.getItem("token")?.trim() || null);
  const [loading, setLoading] = useState(true);

  const persistUser = (nextUser) => {
    const normalized = normalizeUser(nextUser);
    setUser(normalized);

    if (normalized) {
      localStorage.setItem("user", JSON.stringify(normalized));
      localStorage.setItem("permissions", JSON.stringify(normalized.permissions.map((p) => p.name)));

      if (normalized.tenantId) {
        localStorage.setItem("tenantId", String(normalized.tenantId?._id || normalized.tenantId));
      } else {
        localStorage.removeItem("tenantId");
      }

      if (normalized.tenantSlug) {
        localStorage.setItem("tenantSlug", String(normalized.tenantSlug));
      } else {
        localStorage.removeItem("tenantSlug");
      }
    }

    return normalized;
  };

  const clearAuthStorage = () => {
    ["token", "accessToken", "authToken", "user", "permissions", "tenantId", "tenantSlug", "tenantKey"].forEach((key) => localStorage.removeItem(key));
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
    const savedToken = localStorage.getItem("token")?.trim();
    const savedUser = readStoredUser();

    if (!savedToken) {
      setUser(null);
      setToken(null);
      setLoading(false);
      return;
    }

    setToken(savedToken);
    if (savedUser) setUser(savedUser);

    // Do not make dashboard rendering depend on a second network round-trip.
    // The persisted session is authoritative enough to render immediately;
    // /auth/me refreshes it in the background and only a real 401/403 clears it.
    fetchCurrentUser()
      .catch((error) => {
        const status = error?.response?.status;
        console.error("AUTH ME ERROR", error.response?.data || error.message);

        if (status === 401 || status === 403) {
          clearAuthStorage();
          setToken(null);
          setUser(null);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", {
      email: String(email || "").trim().toLowerCase(),
      password,
    });

    if (data?.mfaRequired) return data;
    if (!data?.token) throw new Error("Authentication response did not contain a token.");

    ["accessToken", "authToken", "tenantId", "tenantSlug", "tenantKey"].forEach((key) => localStorage.removeItem(key));
    const nextToken = String(data.token).trim();
    localStorage.setItem("token", nextToken);
    setToken(nextToken);
    persistUser(data.user);

    try {
      await fetchCurrentUser();
    } catch (error) {
      const status = error?.response?.status;
      console.warn("AUTH REFRESH FAILED", error.response?.data || error.message);
      if (status === 401 || status === 403) {
        clearAuthStorage();
        setToken(null);
        setUser(null);
        throw error;
      }
    }

    return data;
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
