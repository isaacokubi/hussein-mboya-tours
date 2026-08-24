import { createContext, useCallback, useContext, useEffect, useState } from "react";
import api from "../api/axios";

export const PUBLIC_BRAND_NAME = "Your Travel Company";
const DEFAULT_SETTINGS = {
  companyName: PUBLIC_BRAND_NAME, websiteUrl: "", companyLogo: "", logo: "", supportEmail: "", supportPhone: "", address: "", city: "Nairobi", country: "Kenya", currency: "KES", currencySymbol: "KSh", timezone: "Africa/Nairobi", language: "en", taxRate: 0, bookingDepositPercentage: 30, defaultCommissionRate: 10, maintenanceMode: false, allowRegistrations: true, allowAgentRegistrations: true, requireEmailVerification: true, requirePhoneVerification: false, enableMpesa: true, enableStripe: false, enablePaypal: false, enableBankTransfer: true, bookingNotifications: true, paymentNotifications: true, facebook: "", instagram: "", twitter: "", youtube: "", seoTitle: "", seoDescription: "", seoKeywords: [], primaryColor: "#047857", secondaryColor: "#064e3b", accentColor: "#10b981", backgroundColor: "#f8fafc", surfaceColor: "#ffffff", textColor: "#0f172a", fontFamily: "Inter", borderRadius: "xl", buttonStyle: "rounded", heroOverlayOpacity: 50,
  homepageSections: { stats: true, tours: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true },
};

const SettingsContext = createContext(null);
const getSettingsStorageKey = () => {
  if (typeof window === "undefined") return "tenant-settings:server";
  const tenantId = String(window.localStorage.getItem("tenantId") || "").trim();
  return tenantId ? `tenant-settings:${tenantId}` : "tenant-settings:public";
};
const normalize = (next = {}, previous = DEFAULT_SETTINGS) => ({ ...DEFAULT_SETTINGS, ...previous, ...next, homepageSections: { ...DEFAULT_SETTINGS.homepageSections, ...(previous.homepageSections || {}), ...(next.homepageSections || {}) } });

function applyTenantTheme(settings) {
  const root = document.documentElement;
  const css = { "--tenant-primary": settings.primaryColor, "--tenant-secondary": settings.secondaryColor, "--tenant-accent": settings.accentColor, "--tenant-background": settings.backgroundColor, "--tenant-surface": settings.surfaceColor, "--tenant-text": settings.textColor, "--tenant-hero-overlay": `${Number(settings.heroOverlayOpacity ?? 50) / 100}` };
  Object.entries(css).forEach(([key, value]) => root.style.setProperty(key, value));
  if (settings.fontFamily) root.style.setProperty("--tenant-font-family", settings.fontFamily);
}
function applyDocumentMetadata(settings) { if (settings.seoTitle) document.title = settings.seoTitle; const description = document.querySelector('meta[name="description"]'); if (description && settings.seoDescription) description.setAttribute("content", settings.seoDescription); }

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const applySettings = useCallback((nextSettings) => setSettings((previous) => normalize(nextSettings, previous)), []);
  const refreshSettings = useCallback(async () => {
    try {
      const response = await api.get("/settings/public", { params: { _t: Date.now() } });
      const data = response.data?.settings || response.data?.data || response.data || {};
      applySettings(data);
      try { localStorage.setItem(getSettingsStorageKey(), JSON.stringify(normalize(data))); } catch (storageError) { console.warn("Tenant settings cache write failed:", storageError); }
      return data;
    } catch (error) { console.error("Public tenant settings load failed:", error); return null; }
  }, [applySettings]);

  useEffect(() => { applyTenantTheme(settings); applyDocumentMetadata(settings); }, [settings]);

  useEffect(() => {
    let mounted = true;
    const load = async () => { setLoading(true); try {
      const cached = typeof window !== "undefined" ? localStorage.getItem(getSettingsStorageKey()) : null;
      if (cached) { try { applySettings(JSON.parse(cached)); } catch (cacheError) { console.warn("Cached tenant settings are invalid:", cacheError); } }
      await refreshSettings();
    } finally { if (mounted) setLoading(false); } };
    void load();
    const handleStorage = (event) => { if (event.key !== getSettingsStorageKey() || !event.newValue) return; try { applySettings(JSON.parse(event.newValue)); } catch (storageError) { console.warn("Tenant settings storage event was invalid:", storageError); } };
    const handlePlatformSettings = (event) => applySettings(event.detail || {});
    window.addEventListener("storage", handleStorage); window.addEventListener("platform-settings-updated", handlePlatformSettings);
    return () => { mounted = false; window.removeEventListener("storage", handleStorage); window.removeEventListener("platform-settings-updated", handlePlatformSettings); };
  }, [refreshSettings, applySettings]);

  const updateSettings = useCallback((nextSettings) => {
    setSettings((previous) => normalize(nextSettings, previous));
    try { const merged = normalize(nextSettings, JSON.parse(localStorage.getItem(getSettingsStorageKey()) || "{}")); localStorage.setItem(getSettingsStorageKey(), JSON.stringify(merged)); window.dispatchEvent(new CustomEvent("platform-settings-updated", { detail: merged })); } catch (error) { console.warn("Tenant settings could not be persisted locally:", error); }
  }, []);

  return <SettingsContext.Provider value={{ settings, companyName: settings.companyName || PUBLIC_BRAND_NAME, supportEmail: settings.supportEmail || "", supportPhone: settings.supportPhone || "", loading, refreshSettings, updateSettings }}>{children}</SettingsContext.Provider>;
}
export function useSettings() { return useContext(SettingsContext); }
