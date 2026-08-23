import React, { createContext, useContext, useEffect, useState } from "react";
import { getTenantBranding } from "../api/tenantBrandingApi";

const DEFAULT_TENANT = {
  name: "",
  legalName: "",
  currency: "KES",
  timezone: "Africa/Nairobi",
};

const TenantContext = createContext();

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

        setTenant({
          ...DEFAULT_TENANT,
          ...branding,
          name,
          legalName,
        });

        document.title = name || "Tours & Travel";
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
