import React, { createContext, useContext, useEffect, useState } from "react";
import { getTenantBranding } from "../api/tenantBrandingApi";

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

const TenantContext = createContext();

const getTenantSlugFromHost = () => {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname.toLowerCase();
  const platformHost = String(import.meta.env.VITE_PLATFORM_HOST || "globaltours.com").toLowerCase();
  const suffix = `.${platformHost}`;
  if (host.endsWith(suffix)) return host.slice(0, -suffix.length).split(".").filter(Boolean).pop() || "";
  return "";
};

const applyTenantIdentity = (tenant) => {
  if (typeof document === "undefined") return;

  document.title = tenant.name || "Tours & Travel";

  if (tenant.favicon) {
    let favicon = document.querySelector('link[rel="icon"]');
    if (!favicon) {
      favicon = document.createElement("link");
      favicon.rel = "icon";
      document.head.appendChild(favicon);
    }
    favicon.href = tenant.favicon;
  }

  const root = document.documentElement;
  const colors = tenant.brandColors || {};
  if (colors.primary) root.style.setProperty("--tenant-primary", colors.primary);
  if (colors.secondary) root.style.setProperty("--tenant-secondary", colors.secondary);
  if (colors.accent) root.style.setProperty("--tenant-accent", colors.accent);
};

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState(DEFAULT_TENANT);

  useEffect(() => {
    let mounted = true;

    const loadTenant = async () => {
      try {
        const res = await getTenantBranding();
        if (!mounted) return;

        const branding = res?.branding || {};
        const name = branding.name || branding.companyName || "";
        const legalName = branding.legalName || name;
        const hostSlug = getTenantSlugFromHost();

        const nextTenant = {
          ...DEFAULT_TENANT,
          ...branding,
          name,
          legalName,
          slug: branding.slug || hostSlug,
        };

        setTenant(nextTenant);
        applyTenantIdentity(nextTenant);
      } catch (error) {
        console.error("Public tenant branding load failed", error);
        if (mounted) document.title = "Tours & Travel";
      }
    };

    void loadTenant();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, setTenant }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  return useContext(TenantContext);
}
