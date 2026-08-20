import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";

const DEFAULT_SETTINGS = {
  companyName: "Coherent Tours",
  supportEmail: "",
  supportPhone: "",
  currency: "KES",
  currencySymbol: "KSh",
  logo: ""
};

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const refreshSettings = useCallback(async () => {
    try {
      const response = await axios.get("/settings", { params: { _t: Date.now() } });
      const data = response.data?.data || response.data || {};
      setSettings(prev => ({
        ...prev,
        ...data,
        companyName: String(data.companyName || prev.companyName || DEFAULT_SETTINGS.companyName).trim()
      }));
      return data;
    } catch (error) {
      console.error("Settings load failed:", error);
      return null;
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        await refreshSettings();
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, [refreshSettings]);

  const updateSettings = useCallback((nextSettings) => {
    setSettings(prev => ({
      ...prev,
      ...nextSettings,
      companyName: String(nextSettings?.companyName || prev.companyName || DEFAULT_SETTINGS.companyName).trim()
    }));
  }, []);

  const companyName = settings.companyName || DEFAULT_SETTINGS.companyName;
  const supportEmail = settings.supportEmail || "";
  const supportPhone = settings.supportPhone || "";

  return (
    <SettingsContext.Provider value={{
      settings,
      companyName,
      supportEmail,
      supportPhone,
      loading,
      refreshSettings,
      updateSettings
    }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
