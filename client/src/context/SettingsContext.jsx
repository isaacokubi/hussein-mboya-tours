import { createContext, useCallback, useContext, useEffect, useState } from "react";
import axios from "axios";

const DEFAULT_SETTINGS = {
  companyName: "",
  supportEmail: "",
  supportPhone: "",
  currency: "KES",
  currencySymbol: "KSh",
  logo: "",
  companyLogo: "",
};

const SettingsContext = createContext(null);
const STORAGE_KEY = "platform-settings";

const normalize = (next, previous = DEFAULT_SETTINGS) => ({
  ...previous,
  ...next,
  companyName: String(next?.companyName ?? previous.companyName ?? "").trim(),
});

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);

  const applySettings = useCallback((nextSettings) => {
    setSettings((previous) => normalize(nextSettings, previous));
  }, []);

  const refreshSettings = useCallback(async () => {
    try {
      // Public settings are intentionally used here. The old /settings
      // endpoint requires an authenticated settings.manage permission and
      // therefore failed on the public homepage.
      const response = await axios.get("/api/settings/public", {
        params: { _t: Date.now() },
        headers: {
          ...(localStorage.getItem("tenantId")
            ? { "X-Tenant-ID": localStorage.getItem("tenantId") }
            : {}),
          ...(localStorage.getItem("tenantSlug")
            ? { "X-Tenant-Slug": localStorage.getItem("tenantSlug") }
            : {}),
        },
      });
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
      try {
        await refreshSettings();
      } finally {
        if (mounted) setLoading(false);
      }
    };

    void load();

    const handleStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return;
      try {
        applySettings(JSON.parse(event.newValue));
      } catch {
        // Ignore malformed cache.
      }
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
    } catch {
      // Public settings API remains the source of truth.
    }
  }, []);

  const companyName = settings.companyName || "";
  const supportEmail = settings.supportEmail || "";
  const supportPhone = settings.supportPhone || "";

  return (
    <SettingsContext.Provider
      value={{
        settings,
        companyName,
        supportEmail,
        supportPhone,
        loading,
        refreshSettings,
        updateSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  return useContext(SettingsContext);
}
