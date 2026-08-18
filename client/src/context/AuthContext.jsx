/* eslint-disable react-refresh/only-export-components */
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
  const fallbackPermissions = ["admin", "superadmin"].includes(role) ? ADMIN_BASE_PERMISSIONS : [];
  return {
    ...user,
    role,
    permissions: normalizePermissions([...fallbackPermissions, ...rolePermissions, ...overridePermissions, ...directPermissions]),
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);

  const persistUser = (nextUser) => {
    const normalized = normalizeUser(nextUser);
    setUser(normalized);
    if (normalized) {
      localStorage.setItem("user", JSON.stringify(normalized));
      localStorage.setItem("permissions", JSON.stringify(normalized.permissions.map((p) => p.name)));
    }
    return normalized;
  };

  const logout = () => {
    ["token", "accessToken", "authToken", "user", "permissions"].forEach((key) => localStorage.removeItem(key));
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
    const savedToken = localStorage.getItem("token");
    if (!savedToken) { setLoading(false); return; }
    setToken(savedToken);
    fetchCurrentUser().catch((error) => {
      console.error("AUTH ME ERROR", error.response?.data || error.message);
      ["token", "user", "permissions"].forEach((key) => localStorage.removeItem(key));
      setToken(null);
      setUser(null);
    }).finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email: String(email || "").trim().toLowerCase(), password });
    if (data?.mfaRequired) return data;
    if (!data?.token) throw new Error("Authentication response did not contain a token.");
    localStorage.setItem("token", data.token);
    setToken(data.token);
    persistUser(data.user);
    try { await fetchCurrentUser(); } catch (error) { console.warn("AUTH REFRESH FAILED", error.response?.data || error.message); }
    return data;
  };

  const register = async (userData) => (await api.post("/auth/register", userData)).data;
  const permissions = user?.permissions || [];

  const hasPermission = (permission) => {
    if (!user || !permission) return false;
    const role = getUserRole(user);
    const wanted = String(permission).trim().toLowerCase();
    // SuperAdmin is never dependent on a Role document being populated.
    if (role === "superadmin") return true;
    // Admin navigation remains available even if its Role/Permission documents were deleted/recreated.
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
