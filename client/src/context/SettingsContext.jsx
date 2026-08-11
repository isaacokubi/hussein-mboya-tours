import { createContext, useContext } from "react";
import { useQuery } from "@tanstack/react-query";
import { getPublicSettings } from "../api/settingsApi";

const DEFAULTS = {
  companyName: "Coherent Tours",
  supportEmail: "",
  supportPhone: "+254 733 439 362",
  currency: "KES",
  timezone: "Africa/Nairobi",
};

const SettingsContext = createContext(DEFAULTS);

export function SettingsProvider({ children }) {
  const { data } = useQuery({
    queryKey: ["public-settings"],
    queryFn: getPublicSettings,
    staleTime: 60 * 1000,
  });

  const settings = { ...DEFAULTS, ...(data?.settings || {}) };

  return <SettingsContext.Provider value={settings}>{children}</SettingsContext.Provider>;
}

export const useSettings = () => useContext(SettingsContext);
