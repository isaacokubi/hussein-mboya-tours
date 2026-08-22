import React, { createContext, useContext, useEffect, useState } from "react";
import { getTenantBranding } from "../api/tenantBrandingApi";

const TenantContext = createContext();

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState({
    name: "",
    currency: "KES",
    timezone: "Africa/Nairobi",
  });

  useEffect(() => {
    let mounted = true;

    const loadTenant = async () => {
      try {
        const res = await getTenantBranding();
        if (mounted && res?.branding) {
          setTenant(res.branding);
          document.title = res.branding.name || document.title;
        }
      } catch (error) {
        console.error("Tenant branding load failed", error);
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
