/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { queryClient } from "../lib/queryClient";
import { getUserRole, normalizeRole } from "../utils/roleUtils";

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

const normalizePermissions = (permissions) => {
  if (!Array.isArray(permissions)) return [];
  return permissions
    .map((permission) => {
      if (typeof permission === "string") return { name: permission };
      return permission?.name ? permission : null;
    })
    .filter(Boolean);
};

const normalizeUser = (user) => {
  if (!user) return null;
  return {
    ...user,
    role: getUserRole(user),
    permissions: normalizePermissions(user.permissions || user.roleId?.permissions || []),
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
    if (!savedToken) {
      setLoading(false);
      return;
    }
    setToken(savedToken);
    fetchCurrentUser()
      .catch((error) => console.error("AUTH ME ERROR", error.response?.data || error.message))
      .finally(() => setLoading(false));
  }, []);

  const login = async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    if (!data?.token) throw new Error("Authentication response did not contain a token.");
    localStorage.setItem("token", data.token);
    setToken(data.token);
    persistUser(data.user);

    try {
      await fetchCurrentUser();
    } catch (error) {
      console.warn("AUTH REFRESH FAILED", error.response?.data || error.message);
    }

    return data;
  };

  const register = async (userData) => (await api.post("/auth/register", userData)).data;

  const permissions = user?.permissions || [];

  const hasPermission = (permission) => {
    if (!user || !permission) return false;
    if (getUserRole(user) === "superadmin") return true;
    return permissions.some((p) => p.name === permission);
  };

  const hasAnyPermission = (items = []) => items.some(hasPermission);
  const hasAllPermissions = (items = []) => items.every(hasPermission);
  const hasRole = (roleName) => getUserRole(user) === normalizeRole(roleName);
  const canAccess = hasPermission;
  const getMenuPermissions = () => permissions;

  const value = useMemo(() => ({
    user,
    setUser: (valueOrUpdater) => setUser((current) => normalizeUser(typeof valueOrUpdater === "function" ? valueOrUpdater(current) : valueOrUpdater)),
    token,
    loading,
    login,
    register,
    logout,
    fetchCurrentUser,
    permissions,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    canAccess,
    getMenuPermissions,
  }), [user, token, loading, permissions]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
