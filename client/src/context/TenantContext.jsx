import React, { createContext, useContext, useEffect, useState } from "react";
import { getTenantBranding } from "../api/tenantBrandingApi";

const PUBLIC_BRAND_NAME = "Your Travel Company";

const TenantContext = createContext();

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState({
    name: PUBLIC_BRAND_NAME,
    legalName: PUBLIC_BRAND_NAME,
    currency: "KES",
    timezone: "Africa/Nairobi",
  });

  useEffect(() => {
    let mounted = true;

    const loadTenant = async () => {
      try {
        const res = await getTenantBranding();
        if (!mounted) return;

        const branding = res?.branding || {};
        setTenant({
          ...branding,
          name: PUBLIC_BRAND_NAME,
          legalName: PUBLIC_BRAND_NAME,
        });
        document.title = PUBLIC_BRAND_NAME;
      } catch (error) {
        console.error("Public tenant branding load failed", error);
        if (mounted) document.title = PUBLIC_BRAND_NAME;
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
