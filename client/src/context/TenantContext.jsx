import React, { createContext, useContext, useMemo } from "react";
import { useSettings } from "./SettingsContext";

const TenantContext = createContext(null);

export function TenantProvider({ children }) {

  const settingsContext = useSettings?.() || {};

  const tenant = useMemo(() => {

    const settings =
      settingsContext.settings ||
      {};

    return {
      name:
        settings.companyName ||
        settings.tenantName ||
        "Safari Adventures Kenya",

      logo:
        settings.logo ||
        settings.companyLogo ||
        "",

      phone:
        settings.supportPhone ||
        "",

      email:
        settings.supportEmail ||
        "",

      currency:
        settings.currency ||
        "KES"
    };

  }, [settingsContext.settings]);


  return (
    <TenantContext.Provider value={{tenant}}>
      {children}
    </TenantContext.Provider>
  );
}


export function useTenant(){

  return useContext(TenantContext) || {
    tenant:{
      name:"Safari Adventures Kenya"
    }
  };

}
