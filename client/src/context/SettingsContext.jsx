// Import React context, state, memoization and effect helpers for shared settings.
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
// Use the configured API client so tenant and authentication headers are applied consistently.
import api from "../api/axios";
// Read the current account to decide whether settings belong to a tenant or platform.
import { useAuth } from "./AuthContext";

// Default brand label used on public pages when a tenant has not configured its own name.
export const PUBLIC_BRAND_NAME = "Kenya Tours";
// Canonical label for platform-wide settings shown to SuperAdmin users.
export const PLATFORM_BRAND_NAME = "Kenya Tours";

// Provide fallback settings for tenants before their settings API request completes.
const DEFAULT_SETTINGS = {
  companyName: "", websiteUrl: "", companyLogo: "", logo: "", supportEmail: "", supportPhone: "", address: "", city: "Nairobi", country: "Kenya", currency: "KES", currencySymbol: "KSh", timezone: "Africa/Nairobi", language: "en", taxRate: 0, bookingDepositPercentage: 30, defaultCommissionRate: 10, maintenanceMode: false, allowRegistrations: true, allowAgentRegistrations: true, requireEmailVerification: true, requirePhoneVerification: false, enableMpesa: true, enableStripe: false, enablePaypal: false, enableBankTransfer: true, bookingNotifications: true, paymentNotifications: true, facebook: "", instagram: "", twitter: "", youtube: "", seoTitle: "", seoDescription: "", seoKeywords: [], primaryColor: "#047857", secondaryColor: "#064e3b", accentColor: "#10b981", backgroundColor: "#f8fafc", surfaceColor: "#ffffff", textColor: "#0f172a", fontFamily: "Inter", borderRadius: "xl", buttonStyle: "rounded", heroOverlayOpacity: 50,
  homepageSections: { stats: true, tours: true, packages: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true },
};
// Keep platform branding fixed to the platform name while inheriting all other defaults.
const PLATFORM_SETTINGS = { ...DEFAULT_SETTINGS, companyName: PLATFORM_BRAND_NAME, seoTitle: PLATFORM_BRAND_NAME };
// Create the context used to share settings, loading state and refresh actions.
const SettingsContext = createContext(null);

// Resolve the current tenant ID from the authenticated user or browser session cache.
const getTenantId = (user) => String(user?.tenantId?._id || user?.tenantId || (typeof window !== "undefined" ? window.localStorage.getItem("tenantId") : "") || "").trim();
// Separate cached settings by tenant so one company cannot reuse another company's branding.
const getSettingsStorageKey = (tenantId = "") => tenantId ? `tenant-settings:${tenantId}` : "tenant-settings:public";
// Merge partial settings with defaults and prior state while normalizing key display fields.
const normalize = (next = {}, previous = DEFAULT_SETTINGS) => ({ ...DEFAULT_SETTINGS, ...previous, ...next, companyName: String(next.companyName ?? previous.companyName ?? "").trim(), homepageSections: { ...DEFAULT_SETTINGS.homepageSections, ...(previous.homepageSections || {}), ...(next.homepageSections || {}) } });
// Normalize platform settings but force the platform name and SEO title to remain canonical.
const normalizePlatformSettings = (next = {}, previous = PLATFORM_SETTINGS) => ({ ...normalize(next, previous), companyName: PLATFORM_BRAND_NAME, seoTitle: PLATFORM_BRAND_NAME });
// Normalize role values stored as strings, populated objects or legacy role arrays.
function normalizeRole(user) { if (!user) return ""; if (typeof user.role === "string") return user.role.toLowerCase().replace(/[\s-]/g, "_"); if (user.role?.name) return String(user.role.name).toLowerCase().replace(/[\s-]/g, "_"); if (Array.isArray(user.roles) && user.roles[0]?.name) return String(user.roles[0].name).toLowerCase().replace(/[\s-]/g, "_"); return ""; }
// Identify platform administrators whose settings should be global rather than tenant-specific.
const isSuperAdminUser = (user) => ["super_admin", "superadmin"].includes(normalizeRole(user));
// Apply configured colors and typography to CSS custom properties used by the frontend.
function applyTenantTheme(settings) { const root = document.documentElement; const css = { "--tenant-primary": settings.primaryColor, "--tenant-secondary": settings.secondaryColor, "--tenant-accent": settings.accentColor, "--tenant-background": settings.backgroundColor, "--tenant-surface": settings.surfaceColor, "--tenant-text": settings.textColor, "--tenant-hero-overlay": `${Number(settings.heroOverlayOpacity ?? 50) / 100}` }; Object.entries(css).forEach(([key, value]) => root.style.setProperty(key, value)); if (settings.fontFamily) root.style.setProperty("--tenant-font-family", settings.fontFamily); }
// Update the browser tab title from the active settings metadata.
function applyDocumentMetadata(settings) { if (typeof document === "undefined") return; if (settings.seoTitle || settings.companyName) document.title = settings.seoTitle || settings.companyName; }

// Provide cached/server settings and settings actions to the component tree.
export function SettingsProvider({ children }) {
  // Read the signed-in user from authentication context.
  const { user } = useAuth();
  // Platform administrators use platform-level settings instead of tenant settings.
  const isPlatformScope = isSuperAdminUser(user);
  // Resolve the tenant ID used for API and local-cache selection.
  const tenantId = getTenantId(user);
  // Choose an isolated storage key for the platform or the active tenant.
  const settingsKey = isPlatformScope ? "platform-settings:global" : getSettingsStorageKey(tenantId);

  // Read previously cached settings so the UI can render immediately/offline.
  const readCachedSettings = useCallback(() => {
    try {
      const cached = typeof window !== "undefined" ? localStorage.getItem(settingsKey) : null;
      if (!cached) return isPlatformScope ? PLATFORM_SETTINGS : DEFAULT_SETTINGS;
      return isPlatformScope ? normalizePlatformSettings(JSON.parse(cached)) : normalize(JSON.parse(cached), DEFAULT_SETTINGS);
    } catch {
      return isPlatformScope ? PLATFORM_SETTINGS : DEFAULT_SETTINGS;
    }
  }, [isPlatformScope, settingsKey]);

  // Initialize state from cache instead of showing an empty settings object first.
  const [settings, setSettings] = useState(() => readCachedSettings());
  // Track whether a settings refresh is currently in progress.
  const [loading, setLoading] = useState(false);

  const applySettings = useCallback((nextSettings) => setSettings((previous) => isPlatformScope ? normalizePlatformSettings(nextSettings, previous) : normalize(nextSettings, previous)), [isPlatformScope]);

  // Refresh settings from the backend and persist the normalized response locally.
  const refreshSettings = useCallback(async () => {
    try {
      if (!isPlatformScope && !tenantId) {
        const fallback = readCachedSettings();
        setSettings(fallback);
        return fallback;
      }
      const endpoint = isPlatformScope ? "/superadmin/settings" : "/settings/public";
      const response = await api.get(endpoint, { params: { _t: Date.now() } });
      const data = response.data?.settings || response.data?.data || response.data || {};
      const normalized = isPlatformScope ? normalizePlatformSettings(data, PLATFORM_SETTINGS) : normalize(data, DEFAULT_SETTINGS);
      setSettings(normalized);
      try { localStorage.setItem(settingsKey, JSON.stringify(normalized)); } catch (storageError) { console.warn("Unable to cache settings:", storageError); }
      return normalized;
    } catch (error) {
      console.error(`${isPlatformScope ? "Platform" : "Tenant"} settings load failed:`, error);
      return null;
    }
  }, [isPlatformScope, tenantId, settingsKey, readCachedSettings]);

  // Reload the correct cache whenever the tenant/platform storage key changes.
  useEffect(() => { setSettings(readCachedSettings()); }, [readCachedSettings]);
  // Apply the active settings to CSS theme variables and browser metadata.
  useEffect(() => { applyTenantTheme(settings); applyDocumentMetadata(settings); }, [settings]);

  useEffect(() => {
    let mounted = true;
    const load = async () => { setLoading(true); try { await refreshSettings(); } finally { if (mounted) setLoading(false); } };
    void load();
    const interval = window.setInterval(() => { void refreshSettings(); }, 60_000);
    const handleStorage = (event) => { if (event.key !== settingsKey || !event.newValue) return; try { applySettings(JSON.parse(event.newValue)); } catch (parseError) { console.warn("Unable to apply cached settings update:", parseError); } };
    const handleSettingsChanged = () => { void refreshSettings(); };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("platform-settings-updated", handleSettingsChanged);
    window.addEventListener("settings-updated", handleSettingsChanged);
    window.addEventListener("dashboard:data-changed", handleSettingsChanged);
    // Stop polling and remove event listeners when settings dependencies change or the provider unmounts.
  return () => { mounted = false; window.clearInterval(interval); window.removeEventListener("storage", handleStorage); window.removeEventListener("platform-settings-updated", handleSettingsChanged); window.removeEventListener("settings-updated", handleSettingsChanged); window.removeEventListener("dashboard:data-changed", handleSettingsChanged); };
  }, [refreshSettings, applySettings, settingsKey]);

  const updateSettings = useCallback((nextSettings) => {
    const merged = isPlatformScope ? normalizePlatformSettings(nextSettings, settings) : normalize(nextSettings, settings);
    setSettings(merged);
    try { localStorage.setItem(settingsKey, JSON.stringify(merged)); window.dispatchEvent(new CustomEvent(isPlatformScope ? "platform-settings-updated" : "settings-updated", { detail: merged })); } catch (error) { console.warn("Settings could not be persisted locally:", error); }
  }, [isPlatformScope, settings, settingsKey]);

  const companyName = String(settings.companyName || (isPlatformScope ? PLATFORM_BRAND_NAME : "")).trim();
  const value = useMemo(() => ({ settings: { ...settings, companyName }, companyName, supportEmail: settings.supportEmail || "", supportPhone: settings.supportPhone || "", loading, refreshSettings, updateSettings, isPlatformScope }), [settings, companyName, loading, refreshSettings, updateSettings, isPlatformScope]);
  // Publish normalized settings and the actions consumers need to refresh or update them.
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

// Provide a small hook for consuming the shared settings context.
export function useSettings() { return useContext(SettingsContext); }
