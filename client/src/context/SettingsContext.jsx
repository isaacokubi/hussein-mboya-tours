/**
 * Purpose: Settings Context React context/provider. Main declarations: getTenantId, getSettingsStorageKey, normalize, normalizePlatformSettings, normalizeRole.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
// Load ../api/axios so this module can use its exported dependencies.
import api from "../api/axios";
// Load ./AuthContext so this module can use its exported dependencies.
import { useAuth } from "./AuthContext";

// Declare PUBLIC_BRAND_NAME for use by the surrounding module or function.
export const PUBLIC_BRAND_NAME = "Kenya Tours";
// Declare PLATFORM_BRAND_NAME for use by the surrounding module or function.
export const PLATFORM_BRAND_NAME = "Kenya Tours";

// Declare DEFAULT_SETTINGS for use by the surrounding module or function.
const DEFAULT_SETTINGS = {
  companyName: "", websiteUrl: "", companyLogo: "", logo: "", supportEmail: "", supportPhone: "", address: "", city: "Nairobi", country: "Kenya", currency: "KES", currencySymbol: "KSh", timezone: "Africa/Nairobi", language: "en", taxRate: 0, bookingDepositPercentage: 30, defaultCommissionRate: 10, maintenanceMode: false, allowRegistrations: true, allowAgentRegistrations: true, requireEmailVerification: true, requirePhoneVerification: false, enableMpesa: true, enableStripe: false, enablePaypal: false, enableBankTransfer: true, bookingNotifications: true, paymentNotifications: true, facebook: "", instagram: "", twitter: "", youtube: "", seoTitle: "", seoDescription: "", seoKeywords: [], primaryColor: "#047857", secondaryColor: "#064e3b", accentColor: "#10b981", backgroundColor: "#f8fafc", surfaceColor: "#ffffff", textColor: "#0f172a", fontFamily: "Inter", borderRadius: "xl", buttonStyle: "rounded", heroOverlayOpacity: 50,
  homepageSections: { stats: true, tours: true, packages: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true },
};
// Declare PLATFORM_SETTINGS for use by the surrounding module or function.
const PLATFORM_SETTINGS = { ...DEFAULT_SETTINGS, companyName: PLATFORM_BRAND_NAME, seoTitle: PLATFORM_BRAND_NAME };
// Declare SettingsContext for use by the surrounding module or function.
const SettingsContext = createContext(null);

// Declare getTenantId for use by the surrounding module or function.
const getTenantId = (user) => String(user?.tenantId?._id || user?.tenantId || (typeof window !== "undefined" ? window.localStorage.getItem("tenantId") : "") || "").trim();
// Declare getSettingsStorageKey for use by the surrounding module or function.
const getSettingsStorageKey = (tenantId = "") => tenantId ? `tenant-settings:${tenantId}` : "tenant-settings:public";
// Declare normalize for use by the surrounding module or function.
const normalize = (next = {}, previous = DEFAULT_SETTINGS) => ({ ...DEFAULT_SETTINGS, ...previous, ...next, companyName: String(next.companyName ?? previous.companyName ?? "").trim(), homepageSections: { ...DEFAULT_SETTINGS.homepageSections, ...(previous.homepageSections || {}), ...(next.homepageSections || {}) } });
// Declare normalizePlatformSettings for use by the surrounding module or function.
const normalizePlatformSettings = (next = {}, previous = PLATFORM_SETTINGS) => ({ ...normalize(next, previous), companyName: PLATFORM_BRAND_NAME, seoTitle: PLATFORM_BRAND_NAME });
// Define normalizeRole; its parameters and body implement this operation.
function normalizeRole(user) { if (!user) return ""; if (typeof user.role === "string") return user.role.toLowerCase().replace(/[\s-]/g, "_"); if (user.role?.name) return String(user.role.name).toLowerCase().replace(/[\s-]/g, "_"); if (Array.isArray(user.roles) && user.roles[0]?.name) return String(user.roles[0].name).toLowerCase().replace(/[\s-]/g, "_"); return ""; }
// Declare isSuperAdminUser for use by the surrounding module or function.
const isSuperAdminUser = (user) => ["super_admin", "superadmin"].includes(normalizeRole(user));
// Define applyTenantTheme; its parameters and body implement this operation.
function applyTenantTheme(settings) { const root = document.documentElement; const css = { "--tenant-primary": settings.primaryColor, "--tenant-secondary": settings.secondaryColor, "--tenant-accent": settings.accentColor, "--tenant-background": settings.backgroundColor, "--tenant-surface": settings.surfaceColor, "--tenant-text": settings.textColor, "--tenant-hero-overlay": `${Number(settings.heroOverlayOpacity ?? 50) / 100}` }; Object.entries(css).forEach(([key, value]) => root.style.setProperty(key, value)); if (settings.fontFamily) root.style.setProperty("--tenant-font-family", settings.fontFamily); }
// Define applyDocumentMetadata; its parameters and body implement this operation.
function applyDocumentMetadata(settings) { if (typeof document === "undefined") return; if (settings.seoTitle || settings.companyName) document.title = settings.seoTitle || settings.companyName; }

// Define SettingsProvider; its parameters and body implement this operation.
export function SettingsProvider({ children }) {
  // Declare { user } for use by the surrounding module or function.
  const { user } = useAuth();
  // Declare isPlatformScope for use by the surrounding module or function.
  const isPlatformScope = isSuperAdminUser(user);
  // Declare tenantId for use by the surrounding module or function.
  const tenantId = getTenantId(user);
  // Declare settingsKey for use by the surrounding module or function.
  const settingsKey = isPlatformScope ? "platform-settings:global" : getSettingsStorageKey(tenantId);

  // Declare readCachedSettings for use by the surrounding module or function.
  const readCachedSettings = useCallback(() => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Declare cached for use by the surrounding module or function.
      const cached = typeof window !== "undefined" ? localStorage.getItem(settingsKey) : null;
      // Check the condition (!cached) and run the matching branch.
      if (!cached) return isPlatformScope ? PLATFORM_SETTINGS : DEFAULT_SETTINGS;
      // Return the expression shown below to the caller.
      return isPlatformScope ? normalizePlatformSettings(JSON.parse(cached)) : normalize(JSON.parse(cached), DEFAULT_SETTINGS);
    } catch {
      // Return the expression shown below to the caller.
      return isPlatformScope ? PLATFORM_SETTINGS : DEFAULT_SETTINGS;
    }
  }, [isPlatformScope, settingsKey]);

  // Declare [settings, setSettings] for use by the surrounding module or function.
  const [settings, setSettings] = useState(() => readCachedSettings());
  // Declare [loading, setLoading] for use by the surrounding module or function.
  const [loading, setLoading] = useState(false);

  // Declare applySettings for use by the surrounding module or function.
  const applySettings = useCallback((nextSettings) => setSettings((previous) => isPlatformScope ? normalizePlatformSettings(nextSettings, previous) : normalize(nextSettings, previous)), [isPlatformScope]);

  // Declare refreshSettings for use by the surrounding module or function.
  const refreshSettings = useCallback(async () => {
    // Run this operation with a dedicated error-handling path for failures.
    try {
      // Check the condition (!isPlatformScope && !tenantId) and run the matching branch.
      if (!isPlatformScope && !tenantId) {
        // Declare fallback for use by the surrounding module or function.
        const fallback = readCachedSettings();
        // Perform the side effect or state update expressed on the following line.
        setSettings(fallback);
        // Return the value of fallback to the caller.
        return fallback;
      }
      // Declare endpoint for use by the surrounding module or function.
      const endpoint = isPlatformScope ? "/superadmin/settings" : "/settings/public";
      // Declare response for use by the surrounding module or function.
      const response = await api.get(endpoint, { params: { _t: Date.now() } });
      // Declare data for use by the surrounding module or function.
      const data = response.data?.settings || response.data?.data || response.data || {};
      // Declare normalized for use by the surrounding module or function.
      const normalized = isPlatformScope ? normalizePlatformSettings(data, PLATFORM_SETTINGS) : normalize(data, DEFAULT_SETTINGS);
      // Perform the side effect or state update expressed on the following line.
      setSettings(normalized);
      // Run this operation with a dedicated error-handling path for failures.
      try { localStorage.setItem(settingsKey, JSON.stringify(normalized)); } catch (storageError) { console.warn("Unable to cache settings:", storageError); }
      // Return the value of normalized to the caller.
      return normalized;
    } catch (error) {
      // Perform the side effect or state update expressed on the following line.
      console.error(`${isPlatformScope ? "Platform" : "Tenant"} settings load failed:`, error);
      // Return the expression shown below to the caller.
      return null;
    }
  }, [isPlatformScope, tenantId, settingsKey, readCachedSettings]);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => { setSettings(readCachedSettings()); }, [readCachedSettings]);
  // Perform the side effect or state update expressed on the following line.
  useEffect(() => { applyTenantTheme(settings); applyDocumentMetadata(settings); }, [settings]);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Declare mounted for use by the surrounding module or function.
    let mounted = true;
    // Declare load for use by the surrounding module or function.
    const load = async () => { setLoading(true); try { await refreshSettings(); } finally { if (mounted) setLoading(false); } };
    // Perform the side effect or state update expressed on the following line.
    void load();
    // Declare handleStorage for use by the surrounding module or function.
    const handleStorage = (event) => { if (event.key !== settingsKey || !event.newValue) return; try { applySettings(JSON.parse(event.newValue)); } catch (parseError) { console.warn("Unable to apply cached settings update:", parseError); } };
    // Declare handleSettingsChanged for use by the surrounding module or function.
    const handleSettingsChanged = (event) => {
      // Check the condition (event.detail && typeof event.detail === "object") and run the matching branch.
      if (event.detail && typeof event.detail === "object") {
        // Perform the side effect or state update expressed on the following line.
        applySettings(event.detail);
        // Return the result to the caller.
        return;
      }
      // Perform the side effect or state update expressed on the following line.
      void refreshSettings();
    };
    // Perform the side effect or state update expressed on the following line.
    window.addEventListener("storage", handleStorage);
    // Perform the side effect or state update expressed on the following line.
    window.addEventListener("platform-settings-updated", handleSettingsChanged);
    // Perform the side effect or state update expressed on the following line.
    window.addEventListener("settings-updated", handleSettingsChanged);
    // Return the expression shown below to the caller.
    return () => { mounted = false; window.removeEventListener("storage", handleStorage); window.removeEventListener("platform-settings-updated", handleSettingsChanged); window.removeEventListener("settings-updated", handleSettingsChanged); };
  }, [refreshSettings, applySettings, settingsKey]);

  // Declare updateSettings for use by the surrounding module or function.
  const updateSettings = useCallback((nextSettings) => {
    // Declare merged for use by the surrounding module or function.
    const merged = isPlatformScope ? normalizePlatformSettings(nextSettings, settings) : normalize(nextSettings, settings);
    // Perform the side effect or state update expressed on the following line.
    setSettings(merged);
    // Run this operation with a dedicated error-handling path for failures.
    try { localStorage.setItem(settingsKey, JSON.stringify(merged)); window.dispatchEvent(new CustomEvent(isPlatformScope ? "platform-settings-updated" : "settings-updated", { detail: merged })); } catch (error) { console.warn("Settings could not be persisted locally:", error); }
  }, [isPlatformScope, settings, settingsKey]);

  // Declare companyName for use by the surrounding module or function.
  const companyName = String(settings.companyName || (isPlatformScope ? PLATFORM_BRAND_NAME : "")).trim();
  // Declare value for use by the surrounding module or function.
  const value = useMemo(() => ({ settings: { ...settings, companyName }, companyName, supportEmail: settings.supportEmail || "", supportPhone: settings.supportPhone || "", loading, refreshSettings, updateSettings, isPlatformScope }), [settings, companyName, loading, refreshSettings, updateSettings, isPlatformScope]);
  // Return the expression shown below to the caller.
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// Define useSettings; its parameters and body implement this operation.
export function useSettings() { return useContext(SettingsContext); }
