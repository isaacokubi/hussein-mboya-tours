import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";

export const PUBLIC_BRAND_NAME = "Coherent Tours";

const DEFAULT_SETTINGS = {
  companyName: PUBLIC_BRAND_NAME,
  supportEmail: "",
  supportPhone: "",
  currency: "KES",
  currencySymbol: "KSh",
  logo: "",
  companyLogo: "",
};

const SettingsContext = createContext(null);
const STORAGE_KEY = "platform-settings";

const normalize = (next = {}, previous = DEFAULT_SETTINGS) => ({
  ...previous,
  ...next,
  // Legacy server/localStorage settings must never reintroduce the retired
  // Hussein Mboya Tours brand into the public UI.
  companyName: PUBLIC_BRAND_NAME,
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const applySettings = useCallback((nextSettings) => {
    setSettings((previous) => normalize(nextSettings, previous));
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const response = await api.get("/settings/public", { params: { _t: Date.now() } });
      const data = response.data?.settings || response.data?.data || response.data || {};
      applySettings(data);
      return data;
    } catch (error) {
      console.error("Public tenant settings load failed:", error);
      return null;
    }
  }, [applySettings]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try { await refreshSettings(); } finally { if (mounted) setLoading(false); }
    };
    void load();

    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try { applySettings(JSON.parse(event.newValue)); } catch { /* Ignore malformed cache. */ }
    };
    const handlePlatformSettings = (event) => applySettings(event.detail || {});

    window.addEventListener("storage", handleStorage);
    window.addEventListener("platform-settings-updated", handlePlatformSettings);
    return () => {
      mounted = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("platform-settings-updated", handlePlatformSettings);
    };
  }, [refreshSettings, applySettings]);

  const updateSettings = useCallback((nextSettings) => {
    setSettings((previous) => normalize(nextSettings, previous));
    try {
      const next = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const merged = normalize(nextSettings, next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent("platform-settings-updated", { detail: merged }));
    } catch { /* Settings API remains the source of truth. */ }
  }, []);

  return (
    <SettingsContext.Provider
      value={{
        settings: { ...settings, companyName: PUBLIC_BRAND_NAME },
        companyName: PUBLIC_BRAND_NAME,
        supportEmail: settings.supportEmail || "",
        supportPhone: settings.supportPhone || "",
        loading,
        refreshSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() { return useContext(SettingsContext); }
