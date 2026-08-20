import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";

const DEFAULT_SETTINGS = {
  companyName: "",
  supportEmail: "",
  supportPhone: "",
  currency: "KES",
  currencySymbol: "KSh",
  logo: ""
};

const SettingsContext = createContext(null);
const STORAGE_KEY = "platform-settings";

const normalize = (next, previous = DEFAULT_SETTINGS) => ({
  ...previous,
  ...next,
  companyName: String(next?.companyName ?? previous.companyName ?? "").trim()
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const applySettings = useCallback((nextSettings) => {
    setSettings(previous => normalize(nextSettings, previous));
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      const response = await axios.get("/settings", { params: { _t: Date.now() } });
      const data = response.data?.data || response.data || {};
      applySettings(data);
      return data;
    } catch (error) {
      console.error("Settings load failed:", error);
      return null;
    }
  }, [applySettings]);

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

    const handleStorage = event => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try { applySettings(JSON.parse(event.newValue)); } catch { /* ignore malformed cache */ }
    };
    const handlePlatformSettings = event => applySettings(event.detail || {});

    window.addEventListener("storage", handleStorage);
    window.addEventListener("platform-settings-updated", handlePlatformSettings);
    return () => {
      mounted = false;
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("platform-settings-updated", handlePlatformSettings);
    };
  }, [refreshSettings, applySettings]);

  const updateSettings = useCallback((nextSettings) => {
    setSettings(previous => normalize(nextSettings, previous));
    try {
      const next = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const merged = normalize(nextSettings, next);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      window.dispatchEvent(new CustomEvent("platform-settings-updated", { detail: merged }));
    } catch { /* settings API remains the source of truth */ }
  }, []);

  const companyName = settings.companyName || "";
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
