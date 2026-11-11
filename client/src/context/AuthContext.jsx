/**
 * Purpose: Auth Context React context/provider. Main declarations: useAuth, normalizePermissions, extractRolePermissions, normalizeUser, readStoredUser.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
// Load ../api/axios so this module can use its exported dependencies.
import api, { advanceAuthenticationGeneration } from "../api/axios";
// Load ../lib/queryClient so this module can use its exported dependencies.
import { queryClient } from "../lib/queryClient";
// Load ../utils/roleUtils so this module can use its exported dependencies.
import { getUserRole, normalizeRole } from "../utils/roleUtils";

// Declare AuthContext for use by the surrounding module or function.
export const AuthContext = createContext();
// Declare useAuth for use by the surrounding module or function.
export const useAuth = () => useContext(AuthContext);

// Declare ADMIN_BASE_PERMISSIONS for use by the surrounding module or function.
const ADMIN_BASE_PERMISSIONS = [
  "admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage",
  "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage",
  "notifications.view", "finance.view", "customer.view", "manage_customers", "tour.view",
  "tour.create", "tour.update", "booking.view", "report.view", "guide.view", "vehicle.view",
];

// Declare AUTH_KEYS for use by the surrounding module or function.
const AUTH_KEYS = ["token", "accessToken", "authToken"];
// Declare TENANT_SESSION_KEYS for use by the surrounding module or function.
const TENANT_SESSION_KEYS = ["tenantId", "tenantSlug", "tenantKey"];

// Declare normalizePermissions for use by the surrounding module or function.
const normalizePermissions = (permissions) => {
  // Check the condition (!Array.isArray(permissions)) and run the matching branch.
  if (!Array.isArray(permissions)) return [];
  // Declare seen for use by the surrounding module or function.
  const seen = new Set();
  // Return the result of permissions.map((permission) => {     if (typeof permission === "string") return { name: permission.trim() };     if (!permission?.name) return null;     return { ...permission, name: String(permission.name).trim() };   }).filter() to the caller.
  return permissions.map((permission) => {
    // Check the condition (typeof permission === "string") and run the matching branch.
    if (typeof permission === "string") return { name: permission.trim() };
    // Check the condition (!permission?.name) and run the matching branch.
    if (!permission?.name) return null;
    // Return the object assembled below to the caller.
    return { ...permission, name: String(permission.name).trim() };
  }).filter((permission) => {
    // Check the condition (!permission?.name) and run the matching branch.
    if (!permission?.name) return false;
    // Declare key for use by the surrounding module or function.
    const key = permission.name.toLowerCase();
    // Check the condition (seen.has(key)) and run the matching branch.
    if (seen.has(key)) return false;
    // Perform the side effect or state update expressed on the following line.
    seen.add(key);
    // Return the expression shown below to the caller.
    return true;
  });
};

// Declare extractRolePermissions for use by the surrounding module or function.
const extractRolePermissions = (user) => {
  // Declare roleIdPermissions for use by the surrounding module or function.
  const roleIdPermissions = user?.roleId && typeof user.roleId === "object" ? user.roleId.permissions || [] : [];
  // Declare roleObjectPermissions for use by the surrounding module or function.
  const roleObjectPermissions = user?.role && typeof user.role === "object" ? user.role.permissions || [] : [];
  // Return the collection assembled below to the caller.
  return [...roleIdPermissions, ...roleObjectPermissions];
};

// Declare normalizeUser for use by the surrounding module or function.
const normalizeUser = (user) => {
  // Check the condition (!user) and run the matching branch.
  if (!user) return null;
  // Declare role for use by the surrounding module or function.
  const role = getUserRole(user);
  // Declare rolePermissions for use by the surrounding module or function.
  const rolePermissions = extractRolePermissions(user);
  // Declare overridePermissions for use by the surrounding module or function.
  const overridePermissions = user.permissionsOverride || user.permissionOverrides || [];
  // Declare directPermissions for use by the surrounding module or function.
  const directPermissions = user.permissions || [];
  // Declare fallbackPermissions for use by the surrounding module or function.
  const fallbackPermissions = ["admin", "super_admin"].includes(role) ? ADMIN_BASE_PERMISSIONS : [];
  // Return the object assembled below to the caller.
  return {
    ...user,
    role,
    permissions: normalizePermissions([...fallbackPermissions, ...rolePermissions, ...overridePermissions, ...directPermissions]),
  };
};

// Declare readStoredUser for use by the surrounding module or function.
const readStoredUser = () => {
  // Check the condition (typeof window === "undefined") and run the matching branch.
  if (typeof window === "undefined") return null;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare raw for use by the surrounding module or function.
    const raw = localStorage.getItem("user");
    // Return the expression shown below to the caller.
    return raw ? normalizeUser(JSON.parse(raw)) : null;
  } catch {
    // Perform the side effect or state update expressed on the following line.
    localStorage.removeItem("user");
    // Return the expression shown below to the caller.
    return null;
  }
};

// Declare preloadTenantSettings for use by the surrounding module or function.
const preloadTenantSettings = async () => {
  // Check the condition (typeof window === "undefined") and run the matching branch.
  if (typeof window === "undefined") return null;
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare storedUser for use by the surrounding module or function.
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    // Declare role for use by the surrounding module or function.
    const role = String(storedUser?.role?.name || storedUser?.role || storedUser?.legacyRole || "")
      .trim().toLowerCase().replace(/[\s-]+/g, "_");
    // Check the condition (["super_admin", "superadmin"].includes(role)) and run the matching branch.
    if (["super_admin", "superadmin"].includes(role)) return null;
  } catch {
    // Session restore handles invalid persisted user state.
  }
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare response for use by the surrounding module or function.
    const response = await api.get("/settings/public", { params: { _t: Date.now() } });
    // Declare settings for use by the surrounding module or function.
    const settings = response.data?.settings || response.data?.data || response.data || {};
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = String(localStorage.getItem("tenantId") || "").trim();
    // Declare storageKey for use by the surrounding module or function.
    const storageKey = tenantId ? `tenant-settings:${tenantId}` : "tenant-settings:public";
    // Perform the side effect or state update expressed on the following line.
    localStorage.setItem(storageKey, JSON.stringify(settings));
    // Perform the side effect or state update expressed on the following line.
    window.dispatchEvent(new CustomEvent("settings-updated", { detail: settings }));
    // Return the value of settings to the caller.
    return settings;
  } catch (error) {
    // Perform the side effect or state update expressed on the following line.
    console.warn("Tenant settings preload after login failed; SettingsProvider will retry:", error);
    // Return the expression shown below to the caller.
    return null;
  }
};

// Define AuthProvider; its parameters and body implement this operation.
export function AuthProvider({ children }) {
  // Declare [user, setUser] for use by the surrounding module or function.
  const [user, setUser] = useState(() => readStoredUser());
  // Declare [token, setToken] for use by the surrounding module or function.
  const [token, setToken] = useState(false);
  // Declare [loading, setLoading] for use by the surrounding module or function.
  const [loading, setLoading] = useState(true);
  // Async session restoration must never clear or replace a newer login.
  // Declare authOperation for use by the surrounding module or function.
  const authOperation = useRef(0);

  // Declare persistUser for use by the surrounding module or function.
  const persistUser = (nextUser) => {
    // Declare normalized for use by the surrounding module or function.
    const normalized = normalizeUser(nextUser);
    // Perform the side effect or state update expressed on the following line.
    setUser(normalized);
    // Check the condition (normalized) and run the matching branch.
    if (normalized) {
      // Perform the side effect or state update expressed on the following line.
      localStorage.setItem("user", JSON.stringify(normalized));
      // Perform the side effect or state update expressed on the following line.
      localStorage.setItem("permissions", JSON.stringify(normalized.permissions.map((p) => p.name)));
      // Declare tenantId for use by the surrounding module or function.
      const tenantId = normalized.tenantId?._id || normalized.tenantId || "";
      // Check the condition (tenantId) and run the matching branch.
      if (tenantId) localStorage.setItem("tenantId", String(tenantId));
      else localStorage.removeItem("tenantId");
      // Check the condition (normalized.tenantSlug) and run the matching branch.
      if (normalized.tenantSlug) localStorage.setItem("tenantSlug", String(normalized.tenantSlug));
      else localStorage.removeItem("tenantSlug");
    }
    // Return the value of normalized to the caller.
    return normalized;
  };

  // Declare clearAuthStorage for use by the surrounding module or function.
  const clearAuthStorage = () => {
    // Perform the side effect or state update expressed on the following line.
    [...AUTH_KEYS, "user", "permissions", ...TENANT_SESSION_KEYS].forEach((key) => localStorage.removeItem(key));
  };

  // Declare logout for use by the surrounding module or function.
  const logout = async () => {
    // Perform the side effect or state update expressed on the following line.
    authOperation.current += 1;
    // Perform the side effect or state update expressed on the following line.
    advanceAuthenticationGeneration();
    // Run this operation with a dedicated error-handling path for failures.
    try { await api.post("/auth/logout"); } catch (error) { console.warn("AUTH LOGOUT REQUEST FAILED", error?.message || error); }
    // Perform the side effect or state update expressed on the following line.
    clearAuthStorage();
    // Perform the side effect or state update expressed on the following line.
    queryClient.clear();
    // Perform the side effect or state update expressed on the following line.
    setUser(null);
    // Perform the side effect or state update expressed on the following line.
    setToken(false);
    // Perform the side effect or state update expressed on the following line.
    window.location.href = "/login";
  };

  // Declare fetchCurrentUser for use by the surrounding module or function.
  const fetchCurrentUser = async () => {
    // Declare { data } for use by the surrounding module or function.
    const { data } = await api.get("/auth/me");
    // Declare currentUser for use by the surrounding module or function.
    const currentUser = persistUser(data.user || data);
    // Perform the side effect or state update expressed on the following line.
    await preloadTenantSettings();
    // Return the value of currentUser to the caller.
    return currentUser;
  };

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Declare onInvalidSession for use by the surrounding module or function.
    const onInvalidSession = (event) => {
      // Declare message for use by the surrounding module or function.
      const message = event?.detail?.message || "Your authentication session is no longer valid. Please log in again.";
      // Perform the side effect or state update expressed on the following line.
      console.warn("[AUTH SESSION INVALID]", message);
      // Perform the side effect or state update expressed on the following line.
      clearAuthStorage();
      // Perform the side effect or state update expressed on the following line.
      queryClient.clear();
      // Perform the side effect or state update expressed on the following line.
      setUser(null);
      // Perform the side effect or state update expressed on the following line.
      setToken(false);
      // Perform the side effect or state update expressed on the following line.
      setLoading(false);
      // Check the condition (window.location.pathname !== "/login") and run the matching branch.
      if (window.location.pathname !== "/login") {
        // Perform the side effect or state update expressed on the following line.
        window.location.replace("/login?reason=session-expired");
      }
    };

    // Perform the side effect or state update expressed on the following line.
    window.addEventListener("auth:session-invalid", onInvalidSession);
    // Return the expression shown below to the caller.
    return () => window.removeEventListener("auth:session-invalid", onInvalidSession);
  }, []);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Declare savedUser for use by the surrounding module or function.
    const savedUser = readStoredUser();
    // Check the condition (savedUser) and run the matching branch.
    if (savedUser) setUser(savedUser);
    // Declare operation for use by the surrounding module or function.
    const operation = authOperation.current;

    // Capture the operation generation so an initial /me response arriving
    // after login cannot reset the freshly established session.
    // Perform the side effect or state update expressed on the following line.
    api.get("/auth/me")
      .then(async ({ data }) => {
        // Check the condition (authOperation.current !== operation) and run the matching branch.
        if (authOperation.current !== operation) return;
        // Declare currentUser for use by the surrounding module or function.
        const currentUser = persistUser(data.user || data);
        // Perform the side effect or state update expressed on the following line.
        setToken(Boolean(currentUser));
        // Perform the side effect or state update expressed on the following line.
        await preloadTenantSettings();
      })
      .catch((error) => {
        // Check the condition (authOperation.current !== operation) and run the matching branch.
        if (authOperation.current !== operation) return;
        // Declare status for use by the surrounding module or function.
        const status = error?.response?.status;
        // Check the condition (status !== 401) and run the matching branch.
        if (status !== 401) console.error("AUTH ME NON-401 FAILURE", error);
        // Perform the side effect or state update expressed on the following line.
        clearAuthStorage();
        // Perform the side effect or state update expressed on the following line.
        setUser(null);
        // Perform the side effect or state update expressed on the following line.
        setToken(false);
      })
      .finally(() => {
        // Check the condition (authOperation.current === operation) and run the matching branch.
        if (authOperation.current === operation) setLoading(false);
      });
  }, []);

  // Declare login for use by the surrounding module or function.
  const login = async (email, password) => {
    // Perform the side effect or state update expressed on the following line.
    authOperation.current += 1;
    // Perform the side effect or state update expressed on the following line.
    advanceAuthenticationGeneration();
    // Perform the side effect or state update expressed on the following line.
    setLoading(true);
    // React Query caches are in-memory and some operational pages use generic
    // query keys. Clear every tenant's cached payload before switching sessions
    // so a direct login as another tenant cannot render the previous tenant's data.
    // Perform the side effect or state update expressed on the following line.
    queryClient.clear();
    // A new login must start from a clean authentication session. In particular,
    // never let the previous user's JWT or tenant ID be attached to /auth/login.
    // Perform the side effect or state update expressed on the following line.
    AUTH_KEYS.forEach((key) => localStorage.removeItem(key));
    // Perform the side effect or state update expressed on the following line.
    ["user", "permissions", ...TENANT_SESSION_KEYS].forEach((key) => localStorage.removeItem(key));
    // Perform the side effect or state update expressed on the following line.
    setToken(false);
    // Perform the side effect or state update expressed on the following line.
    setUser(null);

    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare { data } for use by the surrounding module or function.
      const { data } = await api.post("/auth/login", {
        email: String(email || "").trim().toLowerCase(),
        password,
      });
      // Check the condition (data?.mfaRequired) and run the matching branch.
      if (data?.mfaRequired) return data;
      // Check the condition (!data?.user) and run the matching branch.
      if (!data?.user) throw new Error("Authentication response did not contain a user.");
      // Check the condition (!data?.token) and run the matching branch.
      if (!data?.token) throw new Error("Authentication response did not contain an access token.");
      // Keep the backend's HttpOnly cookie session and persist its returned
      // bearer token as a fallback for browsers that block cross-site cookies.
      // Perform the side effect or state update expressed on the following line.
      localStorage.setItem("token", data.token);
      // Declare normalizedUser for use by the surrounding module or function.
      const normalizedUser = persistUser(data.user);
      // Check the condition (!normalizedUser) and run the matching branch.
      if (!normalizedUser) throw new Error("Authentication response did not contain a user.");
      // Perform the side effect or state update expressed on the following line.
      setToken(true);

      // The backend has now set the HttpOnly session cookie. Load tenant
      // settings before navigation so the dashboard uses the right tenant.
      // Perform the side effect or state update expressed on the following line.
      await preloadTenantSettings();
      // Return the object assembled below to the caller.
      return { ...data, user: normalizedUser };
    } finally {
      // Perform the side effect or state update expressed on the following line.
      setLoading(false);
    }
  };

  // Declare register for use by the surrounding module or function.
  const register = async (userData) => {
    // Declare { data } for use by the surrounding module or function.
    const { data } = await api.post("/auth/register", userData);
    // Check the condition (data?.user && data?.token) and run the matching branch.
    if (data?.user && data?.token) {
      // Perform the side effect or state update expressed on the following line.
      localStorage.setItem("token", data.token);
      // Perform the side effect or state update expressed on the following line.
      setToken(true);
      // Perform the side effect or state update expressed on the following line.
      persistUser(data.user);
      // Perform the side effect or state update expressed on the following line.
      await preloadTenantSettings();
    }
    // Return the value of data to the caller.
    return data;
  };

  // Declare permissions for use by the surrounding module or function.
  const permissions = user?.permissions || [];
  // Declare hasPermission for use by the surrounding module or function.
  const hasPermission = (permission) => {
    // Check the condition (!user || !permission) and run the matching branch.
    if (!user || !permission) return false;
    // Declare role for use by the surrounding module or function.
    const role = getUserRole(user);
    // Declare wanted for use by the surrounding module or function.
    const wanted = String(permission).trim().toLowerCase();
    // Check the condition (role === "super_admin") and run the matching branch.
    if (role === "super_admin") return true;
    // Check the condition (role === "admin" && ADMIN_BASE_PERMISSIONS.includes(wanted)) and run the matching branch.
    if (role === "admin" && ADMIN_BASE_PERMISSIONS.includes(wanted)) return true;
    // Return the result of permissions.some() to the caller.
    return permissions.some((p) => String(p?.name || "").trim().toLowerCase() === wanted && p?.enabled !== false);
  };
  // Declare hasAnyPermission for use by the surrounding module or function.
  const hasAnyPermission = (items = []) => items.some(hasPermission);
  // Declare hasAllPermissions for use by the surrounding module or function.
  const hasAllPermissions = (items = []) => items.every(hasPermission);
  // Declare hasRole for use by the surrounding module or function.
  const hasRole = (roleName) => getUserRole(user) === normalizeRole(roleName);
  // Declare canAccess for use by the surrounding module or function.
  const canAccess = hasPermission;
  // Declare getMenuPermissions for use by the surrounding module or function.
  const getMenuPermissions = () => permissions;

  // Declare value for use by the surrounding module or function.
  const value = useMemo(() => ({
    user,
    setUser: (valueOrUpdater) => setUser((current) => normalizeUser(typeof valueOrUpdater === "function" ? valueOrUpdater(current) : valueOrUpdater)),
    token, loading, login, register, logout, fetchCurrentUser, permissions,
    hasPermission, hasAnyPermission, hasAllPermissions, hasRole, canAccess, getMenuPermissions,
  }), [user, token, loading, permissions]);

  // Return the expression shown below to the caller.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
