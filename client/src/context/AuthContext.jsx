// Import React context, lifecycle, memoization, reference and state helpers.
import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
// Use the configured API client and generation counter to prevent stale requests invalidating newer sessions.
import api, { advanceAuthenticationGeneration } from "../api/axios";
// Access the shared query cache so tenant data can be cleared when identities change.
import { queryClient } from "../lib/queryClient";
// Normalize role names consistently for permissions and role checks.
import { getUserRole, normalizeRole } from "../utils/roleUtils";

// Create the context that exposes authenticated identity and authorization helpers.
export const AuthContext = createContext();
// Provide a hook for components to read the current authentication context.
export const useAuth = () => useContext(AuthContext);

// Keep baseline admin permissions available even when a role record is missing.
const ADMIN_BASE_PERMISSIONS = [
  "admin.dashboard", "user.manage", "staff.manage", "tour.manage", "booking.manage",
  "payment.manage", "refund.manage", "analytics.view", "settings.manage", "roles.manage",
  "notifications.view", "finance.view", "customer.view", "manage_customers", "tour.view",
  "tour.create", "tour.update", "booking.view", "report.view", "guide.view", "vehicle.view",
];

// List token keys that must be removed when a session ends or changes.
const AUTH_KEYS = ["token", "accessToken", "authToken"];
// List tenant selectors that must not leak from one authenticated session into another.
const TENANT_SESSION_KEYS = ["tenantId", "tenantSlug", "tenantKey"];

// Convert permissions into a consistent, deduplicated list of named permission objects.
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

// Read permissions from either populated role representation supported by user records.
const extractRolePermissions = (user) => {
  const roleIdPermissions = user?.roleId && typeof user.roleId === "object" ? user.roleId.permissions || [] : [];
  const roleObjectPermissions = user?.role && typeof user.role === "object" ? user.role.permissions || [] : [];
  return [...roleIdPermissions, ...roleObjectPermissions];
};

// Normalize the user and merge baseline, role, override and direct permissions.
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

// Restore the cached user from browser storage without trusting malformed JSON.
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

// Fetch and cache tenant settings after authentication so the first screen has correct branding.
const preloadTenantSettings = async () => {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = JSON.parse(localStorage.getItem("user") || "null");
    const role = String(storedUser?.role?.name || storedUser?.role || storedUser?.legacyRole || "")
      .trim().toLowerCase().replace(/[\s-]+/g, "_");
    if (["super_admin", "superadmin"].includes(role)) return null;
  } catch {
    // Session restore handles invalid persisted user state.
  }
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

// Manage login/logout/session restoration and publish the result to React descendants.
export function AuthProvider({ children }) {
  // Initialize identity from the last valid browser-stored user record.
  const [user, setUser] = useState(() => readStoredUser());
  // Track whether an authenticated token/session is available.
  const [token, setToken] = useState(false);
  // Keep protected screens waiting while the existing session is restored.
  const [loading, setLoading] = useState(true);
  // Async session restoration must never clear or replace a newer login.
  const authOperation = useRef(0);

  // Normalize a user and persist only the identity/permission fields needed by the client.
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

  // Remove auth credentials and tenant selectors so sessions cannot cross tenant boundaries.
  const clearAuthStorage = () => {
    [...AUTH_KEYS, "user", "permissions", ...TENANT_SESSION_KEYS].forEach((key) => localStorage.removeItem(key));
  };

  // End the current server/browser session and clear tenant-specific client state.
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

  // Ask the backend to validate the current session and refresh the user record.
  const fetchCurrentUser = async () => {
    const { data } = await api.get("/auth/me");
    const currentUser = persistUser(data.user || data);
    await preloadTenantSettings();
    return currentUser;
  };

  // Listen for API-client signals that the current session is no longer valid.
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

  // Restore and validate the current session once when the provider mounts.
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

  // Authenticate with the backend and replace any previous user's session.
  const login = async (email, password) => {
    authOperation.current += 1;
    advanceAuthenticationGeneration();
    setLoading(true);
    // React Query caches are in-memory and some operational pages use generic
    // query keys. Clear every tenant's cached payload before switching sessions
    // so a direct login as another tenant cannot render the previous tenant's data.
    queryClient.clear();
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

  // Create an account and initialize a session if the backend returns credentials.
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

  // Expose the normalized permissions currently assigned to the user.
  const permissions = user?.permissions || [];
  // Check whether the user is allowed to perform one named action.
  const hasPermission = (permission) => {
    if (!user || !permission) return false;
    const role = getUserRole(user);
    const wanted = String(permission).trim().toLowerCase();
    if (role === "super_admin") return true;
    if (role === "admin" && ADMIN_BASE_PERMISSIONS.includes(wanted)) return true;
    return permissions.some((p) => String(p?.name || "").trim().toLowerCase() === wanted && p?.enabled !== false);
  };
  // Return true when the user has at least one permission from the supplied list.
  const hasAnyPermission = (items = []) => items.some(hasPermission);
  // Return true only when the user has every permission from the supplied list.
  const hasAllPermissions = (items = []) => items.every(hasPermission);
  // Compare the user's normalized role with the requested role name.
  const hasRole = (roleName) => getUserRole(user) === normalizeRole(roleName);
  // Preserve the legacy access-check helper name as an alias of hasPermission.
  const canAccess = hasPermission;
  // Return permissions for navigation/menu visibility checks.
  const getMenuPermissions = () => permissions;

  // Memoize the context value so consumers update when auth state/actions change.
  const value = useMemo(() => ({
    user,
    setUser: (valueOrUpdater) => setUser((current) => normalizeUser(typeof valueOrUpdater === "function" ? valueOrUpdater(current) : valueOrUpdater)),
    token, loading, login, register, logout, fetchCurrentUser, permissions,
    hasPermission, hasAnyPermission, hasAllPermissions, hasRole, canAccess, getMenuPermissions,
  }), [user, token, loading, permissions]);

  // Publish authentication state and actions to all child components.
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
