import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getTenantBranding } from "../api/tenantBrandingApi";
import { useAuth } from "./AuthContext";
import { useSettings } from "./SettingsContext";

export const PLATFORM_BRAND_NAME = "Global Tours Platform";
const DEFAULT_TENANT = { name: "", legalName: "", currency: "KES", timezone: "Africa/Nairobi", slug: "", logoUrl: "", favicon: "", brandColors: {} };
const PLATFORM_TENANT = { ...DEFAULT_TENANT, name: PLATFORM_BRAND_NAME, legalName: PLATFORM_BRAND_NAME, slug: "global-tours-platform" };
const TenantContext = createContext();

const normalizeRole = (user) => {
  if (!user) return "";
  if (typeof user.role === "string") return user.role.toLowerCase().replace(/[\s-]/g, "_");
  if (user.role?.name) return String(user.role.name).toLowerCase().replace(/[\s-]/g, "_");
  if (Array.isArray(user.roles) && user.roles[0]?.name) return String(user.roles[0].name).toLowerCase().replace(/[\s-]/g, "_");
  return "";
};
const isSuperAdminUser = (user) => ["super_admin", "superadmin"].includes(normalizeRole(user));
const getTenantSlugFromHost = () => {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname.toLowerCase();
  const platformHost = String(import.meta.env.VITE_PLATFORM_HOST || "globaltours.com").toLowerCase();
  const suffix = `.${platformHost}`;
  return host.endsWith(suffix) ? host.slice(0, -suffix.length).split(".").filter(Boolean).pop() || "" : "";
};
const applyTenantIdentity = (tenant) => {
  if (typeof document === "undefined") return;
  document.title = tenant.name || "Tours & Travel";
  if (tenant.favicon) {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) { favicon = document.createElement("link"); favicon.rel = "icon"; document.head.appendChild(favicon); }
    favicon.href = tenant.favicon;
  }
  const root = document.documentElement;
  const colors = tenant.brandColors || {};
  if (colors.primary) root.style.setProperty("--tenant-primary", colors.primary);
  if (colors.secondary) root.style.setProperty("--tenant-secondary", colors.secondary);
  if (colors.accent) root.style.setProperty("--tenant-accent", colors.accent);
};

export function TenantProvider({ children }) {
  const { user } = useAuth();
  const { settings = {}, isPlatformScope } = useSettings() || {};
  const queryClient = useQueryClient();
  const [tenant, setTenant] = useState(DEFAULT_TENANT);

  const scopeKey = useMemo(() => {
    if (isSuperAdminUser(user) || isPlatformScope) return "platform";
    const tenantId = user?.tenantId?._id || user?.tenantId || (typeof window !== "undefined" ? localStorage.getItem("tenantId") : "") || "";
    return String(tenantId || tenant?.slug || getTenantSlugFromHost() || "public");
  }, [user, isPlatformScope, tenant?.slug]);

  useEffect(() => {
    // Cache state is not the security boundary, but it must never display the
    // previous tenant's dashboard while a new tenant is being loaded.
    queryClient.clear();
  }, [queryClient, scopeKey]);

  useEffect(() => {
    let mounted = true;
    const loadTenant = async () => {
      if (isSuperAdminUser(user)) {
        if (!mounted) return;
        const platformTenant = { ...PLATFORM_TENANT, name: settings.companyName || PLATFORM_TENANT.name, legalName: settings.companyName || PLATFORM_TENANT.legalName };
        setTenant(platformTenant); applyTenantIdentity(platformTenant); return;
      }
      try {
        const res = await getTenantBranding();
        if (!mounted) return;
        const branding = res?.branding || {};
        const name = branding.name || branding.companyName || "";
        const legalName = branding.legalName || name;
        const hostSlug = getTenantSlugFromHost();
        const nextTenant = { ...DEFAULT_TENANT, ...branding, name, legalName, slug: branding.slug || hostSlug };
        setTenant(nextTenant); applyTenantIdentity(nextTenant);
      } catch (error) {
        console.error("Public tenant branding load failed", error);
        if (mounted) { setTenant(DEFAULT_TENANT); document.title = "Tours & Travel"; }
      }
    };
    void loadTenant();
    return () => { mounted = false; };
  }, [user, settings.companyName]);

  useEffect(() => {
    if (isSuperAdminUser(user) || isPlatformScope || !settings?.companyName) return;
    setTenant((previous) => {
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
        brandColors: { ...(previous.brandColors || {}), ...(settings.primaryColor ? { primary: settings.primaryColor } : {}), ...(settings.secondaryColor ? { secondary: settings.secondaryColor } : {}), ...(settings.accentColor ? { accent: settings.accentColor } : {}) },
      };
      applyTenantIdentity(next); return next;
    });
  }, [settings, user, isPlatformScope]);

  return <TenantContext.Provider value={{ tenant, setTenant, isPlatformScope: isSuperAdminUser(user) }}>{children}</TenantContext.Provider>;
}
export function useTenant() { return useContext(TenantContext); }
