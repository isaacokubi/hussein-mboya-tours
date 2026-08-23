import React, { createContext, useContext, useEffect, useState } from "react";
import { getTenantBranding } from "../api/tenantBrandingApi";

const COHERENT_TOURS_BRAND = "Coherent Tours";

const TenantContext = createContext();

export function TenantProvider({ children }) {
  const [tenant, setTenant] = useState({
    name: COHERENT_TOURS_BRAND,
    legalName: COHERENT_TOURS_BRAND,
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
          // Public website branding is canonical and must not be replaced by
          // a stale organization name returned from an old tenant record.
          name: COHERENT_TOURS_BRAND,
          legalName: COHERENT_TOURS_BRAND,
        });
        document.title = COHERENT_TOURS_BRAND;
      } catch (error) {
        console.error("Public tenant branding load failed", error);
        if (mounted) document.title = COHERENT_TOURS_BRAND;
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
