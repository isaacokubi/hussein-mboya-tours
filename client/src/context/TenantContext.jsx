/**
 * Purpose: Tenant Context React context/provider. Main declarations: normalizeRole, isSuperAdminUser, getTenantSlugFromHost, applyTenantIdentity, TenantProvider.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import React, { createContext, useContext, useEffect, useState } from "react";
// Load ../api/tenantBrandingApi so this module can use its exported dependencies.
import { getTenantBranding } from "../api/tenantBrandingApi";
// Load ./AuthContext so this module can use its exported dependencies.
import { useAuth } from "./AuthContext";
// Load ./SettingsContext so this module can use its exported dependencies.
import { useSettings } from "./SettingsContext";

// Declare PLATFORM_BRAND_NAME for use by the surrounding module or function.
export const PLATFORM_BRAND_NAME = "Kenya Tours";

// Declare DEFAULT_TENANT for use by the surrounding module or function.
const DEFAULT_TENANT = {
  name: "",
  legalName: "",
  currency: "KES",
  timezone: "Africa/Nairobi",
  slug: "",
  logoUrl: "",
  favicon: "",
  brandColors: {},
};

// Declare PLATFORM_TENANT for use by the surrounding module or function.
const PLATFORM_TENANT = {
  ...DEFAULT_TENANT,
  name: PLATFORM_BRAND_NAME,
  legalName: PLATFORM_BRAND_NAME,
  slug: "global-tours-platform",
};

// Declare TenantContext for use by the surrounding module or function.
const TenantContext = createContext();

// Declare normalizeRole for use by the surrounding module or function.
const normalizeRole = (user) => {
  // Check the condition (!user) and run the matching branch.
  if (!user) return "";
  // Check the condition (typeof user.role === "string") and run the matching branch.
  if (typeof user.role === "string") return user.role.toLowerCase().replace(/[\s-]/g, "_");
  // Check the condition (user.role?.name) and run the matching branch.
  if (user.role?.name) return String(user.role.name).toLowerCase().replace(/[\s-]/g, "_");
  // Check the condition (Array.isArray(user.roles) && user.roles[0]?.name) and run the matching branch.
  if (Array.isArray(user.roles) && user.roles[0]?.name) return String(user.roles[0].name).toLowerCase().replace(/[\s-]/g, "_");
  // Return a configured text value to the caller.
  return "";
};

// Declare isSuperAdminUser for use by the surrounding module or function.
const isSuperAdminUser = (user) => ["super_admin", "superadmin"].includes(normalizeRole(user));

// Declare getTenantSlugFromHost for use by the surrounding module or function.
const getTenantSlugFromHost = () => {
  // Check the condition (typeof window === "undefined") and run the matching branch.
  if (typeof window === "undefined") return "";
  // Declare host for use by the surrounding module or function.
  const host = window.location.hostname.toLowerCase();
  // Declare platformHost for use by the surrounding module or function.
  const platformHost = String(import.meta.env.VITE_PLATFORM_HOST || "").toLowerCase();
  // Declare suffix for use by the surrounding module or function.
  const suffix = `.${platformHost}`;
  // Check the condition (host.endsWith(suffix)) and run the matching branch.
  if (host.endsWith(suffix)) return host.slice(0, -suffix.length).split(".").filter(Boolean).pop() || "";
  // Return a configured text value to the caller.
  return "";
};

// Declare applyTenantIdentity for use by the surrounding module or function.
const applyTenantIdentity = (tenant) => {
  // Check the condition (typeof document === "undefined") and run the matching branch.
  if (typeof document === "undefined") return;
  // Perform the side effect or state update expressed on the following line.
  document.title = tenant.name || "Tours & Travel";

  // Check the condition (tenant.favicon) and run the matching branch.
  if (tenant.favicon) {
    // Declare favicon for use by the surrounding module or function.
    let favicon = document.querySelector('link[rel="icon"]');
    // Check the condition (!favicon) and run the matching branch.
    if (!favicon) {
      // Perform the side effect or state update expressed on the following line.
      favicon = document.createElement("link");
      // Perform the side effect or state update expressed on the following line.
      favicon.rel = "icon";
      // Perform the side effect or state update expressed on the following line.
      document.head.appendChild(favicon);
    }
    // Perform the side effect or state update expressed on the following line.
    favicon.href = tenant.favicon;
  }

  // Declare root for use by the surrounding module or function.
  const root = document.documentElement;
  // Declare colors for use by the surrounding module or function.
  const colors = tenant.brandColors || {};
  // Check the condition (colors.primary) and run the matching branch.
  if (colors.primary) root.style.setProperty("--tenant-primary", colors.primary);
  // Check the condition (colors.secondary) and run the matching branch.
  if (colors.secondary) root.style.setProperty("--tenant-secondary", colors.secondary);
  // Check the condition (colors.accent) and run the matching branch.
  if (colors.accent) root.style.setProperty("--tenant-accent", colors.accent);
};

// Define TenantProvider; its parameters and body implement this operation.
export function TenantProvider({ children }) {
  // Declare { user } for use by the surrounding module or function.
  const { user } = useAuth();
  // Declare { settings = {}, isPlatformScope } for use by the surrounding module or function.
  const { settings = {}, isPlatformScope } = useSettings() || {};
  // Declare [tenant, setTenant] for use by the surrounding module or function.
  const [tenant, setTenant] = useState(DEFAULT_TENANT);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Declare mounted for use by the surrounding module or function.
    let mounted = true;

    // Declare loadTenant for use by the surrounding module or function.
    const loadTenant = async () => {
      // Check the condition (isSuperAdminUser(user)) and run the matching branch.
      if (isSuperAdminUser(user)) {
        // Check the condition (!mounted) and run the matching branch.
        if (!mounted) return;
        // Perform the side effect or state update expressed on the following line.
        setTenant(PLATFORM_TENANT);
        // Perform the side effect or state update expressed on the following line.
        applyTenantIdentity(PLATFORM_TENANT);
        // Return the result to the caller.
        return;
      }

      // Run this operation with a dedicated error-handling path for failures.
      try {
        // Declare res for use by the surrounding module or function.
        const res = await getTenantBranding();
        // Check the condition (!mounted) and run the matching branch.
        if (!mounted) return;

        // Declare branding for use by the surrounding module or function.
        const branding = res?.branding || {};
        // Declare name for use by the surrounding module or function.
        const name = branding.name || branding.companyName || "";
        // Declare legalName for use by the surrounding module or function.
        const legalName = branding.legalName || name;
        // Declare hostSlug for use by the surrounding module or function.
        const hostSlug = getTenantSlugFromHost();
        // Declare nextTenant for use by the surrounding module or function.
        const nextTenant = {
          ...DEFAULT_TENANT,
          ...branding,
          name,
          legalName,
          slug: branding.slug || hostSlug,
        };

        // Perform the side effect or state update expressed on the following line.
        setTenant(nextTenant);
        // Perform the side effect or state update expressed on the following line.
        applyTenantIdentity(nextTenant);
      } catch (error) {
        // Perform the side effect or state update expressed on the following line.
        console.error("Public tenant branding load failed", error);
        // Check the condition (mounted) and run the matching branch.
        if (mounted) {
          // Perform the side effect or state update expressed on the following line.
          setTenant(DEFAULT_TENANT);
          // Perform the side effect or state update expressed on the following line.
          document.title = "Hussein Mboya Tours";
        }
      }
    };

    // Perform the side effect or state update expressed on the following line.
    void loadTenant();
    // Return the expression shown below to the caller.
    return () => { mounted = false; };
  }, [user]);

  // Settings are the authoritative UI representation of the active scope.
  // Keep tenant identity synchronized when an admin saves branding without
  // requiring a full page reload or a second branding request.
  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (isSuperAdminUser(user) || isPlatformScope) and run the matching branch.
    if (isSuperAdminUser(user) || isPlatformScope) return;
    // Check the condition (!settings?.companyName) and run the matching branch.
    if (!settings?.companyName) return;

    // Perform the side effect or state update expressed on the following line.
    setTenant((previous) => {
      // Declare next for use by the surrounding module or function.
      const next = {
        ...previous,
        name: settings.companyName,
        legalName: previous.legalName || settings.companyName,
        logoUrl: settings.companyLogo || previous.logoUrl || "",
        contactEmail: settings.supportEmail || previous.contactEmail || "",
        contactPhone: settings.supportPhone || previous.contactPhone || "",
        address: settings.address || previous.address || "",
        city: settings.city || previous.city || "",
        country: settings.country || previous.country || "",
        brandColors: {
          ...(previous.brandColors || {}),
          ...(settings.primaryColor ? { primary: settings.primaryColor } : {}),
          ...(settings.secondaryColor ? { secondary: settings.secondaryColor } : {}),
          ...(settings.accentColor ? { accent: settings.accentColor } : {}),
        },
      };
      // Perform the side effect or state update expressed on the following line.
      applyTenantIdentity(next);
      // Return the value of next to the caller.
      return next;
    });
  }, [settings, user, isPlatformScope]);

  // Return the expression shown below to the caller.
  return (
    <TenantContext.Provider value={{ tenant, setTenant, isPlatformScope: isSuperAdminUser(user) }}>
      {children}
    </TenantContext.Provider>
  );
}

// Define useTenant; its parameters and body implement this operation.
export function useTenant() {
  // Return the result of useContext() to the caller.
  return useContext(TenantContext);
}
