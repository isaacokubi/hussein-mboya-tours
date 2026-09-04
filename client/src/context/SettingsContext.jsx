import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import { useAuth } from "./AuthContext";

export const PUBLIC_BRAND_NAME = "Global Tours";
export const PLATFORM_BRAND_NAME = "Global Tours";

const DEFAULT_SETTINGS = {
  companyName: "", websiteUrl: "", companyLogo: "", logo: "", supportEmail: "", supportPhone: "", address: "", city: "Nairobi", country: "Kenya", currency: "KES", currencySymbol: "KSh", timezone: "Africa/Nairobi", language: "en", taxRate: 0, bookingDepositPercentage: 30, defaultCommissionRate: 10, maintenanceMode: false, allowRegistrations: true, allowAgentRegistrations: true, requireEmailVerification: true, requirePhoneVerification: false, enableMpesa: true, enableStripe: false, enablePaypal: false, enableBankTransfer: true, bookingNotifications: true, paymentNotifications: true, facebook: "", instagram: "", twitter: "", youtube: "", seoTitle: "", seoDescription: "", seoKeywords: [], primaryColor: "#047857", secondaryColor: "#064e3b", accentColor: "#10b981", backgroundColor: "#020617", surfaceColor: "#0f172a", textColor: "#f1f5f9", fontFamily: "Inter", borderRadius: "xl", buttonStyle: "rounded", heroOverlayOpacity: 50,
  homepageSections: { stats: true, tours: true, destinations: true, experiences: true, services: true, testimonials: true, gallery: true, whyChooseUs: true, newsletter: true },
};
const PLATFORM_SETTINGS = { ...DEFAULT_SETTINGS, companyName: PLATFORM_BRAND_NAME, seoTitle: PLATFORM_BRAND_NAME };
const SettingsContext = createContext(null);

const getTenantId = (user) => String(user?.tenantId?._id || user?.tenantId || (typeof window !== "undefined" ? window.localStorage.getItem("tenantId") : "") || "").trim();
const getSettingsStorageKey = (tenantId = "") => tenantId ? `tenant-settings:${tenantId}` : "tenant-settings:public";
const normalize = (next = {}, previous = DEFAULT_SETTINGS) => ({ ...DEFAULT_SETTINGS, ...previous, ...next, companyName: String(next.companyName ?? previous.companyName ?? "").trim(), homepageSections: { ...DEFAULT_SETTINGS.homepageSections, ...(previous.homepageSections || {}), ...(next.homepageSections || {}) } });
const normalizePlatformSettings = (next = {}, previous = PLATFORM_SETTINGS) => {
  const normalized = normalize(next, previous);
  const companyName = String(next.companyName ?? previous.companyName ?? PLATFORM_BRAND_NAME).trim() || PLATFORM_BRAND_NAME;
  const seoTitle = String(next.seoTitle ?? previous.seoTitle ?? companyName).trim() || companyName;
  return { ...normalized, companyName, seoTitle };
};
function normalizeRole(user) { if (!user) return ""; if (typeof user.role === "string") return user.role.toLowerCase().replace(/[\s-]/g, "_"); if (user.role?.name) return String(user.role.name).toLowerCase().replace(/[\s-]/g, "_"); if (Array.isArray(user.roles) && user.roles[0]?.name) return String(user.roles[0].name).toLowerCase().replace(/[\s-]/g, "_"); return ""; }
const isSuperAdminUser = (user) => ["super_admin", "superadmin"].includes(normalizeRole(user));

const hexToRgb = (hex) => {
  const value = String(hex || "").replace("#", "").trim();
  if (![3, 6].includes(value.length) || !/^[0-9a-f]+$/i.test(value)) return null;
  const normalized = value.length === 3 ? value.split("").map((part) => part + part).join("") : value;
  return [0, 2, 4].map((index) => parseInt(normalized.slice(index, index + 2), 16));
};
const luminance = (hex) => {
  const rgb = hexToRgb(hex);
  if (!rgb) return null;
  const channels = rgb.map((channel) => {
    const value = channel / 255;
    return value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
};

function applyTenantTheme(settings) {
  const root = document.documentElement;
  const background = settings.backgroundColor || "#020617";
  const text = settings.textColor || "#f1f5f9";
  const backgroundLuminance = luminance(background);
  const textLuminance = luminance(text);
  // Prevent the broken light-background/light-text combination that makes the public site unreadable.
  const safeBackground = backgroundLuminance !== null && textLuminance !== null && backgroundLuminance > 0.65 && textLuminance > 0.65 ? "#020617" : background;
  const safeSurface = settings.surfaceColor || "#0f172a";
  const safeText = backgroundLuminance !== null && textLuminance !== null && backgroundLuminance > 0.65 && textLuminance > 0.65 ? "#f1f5f9" : text;
  const css = { "--tenant-primary": settings.primaryColor, "--tenant-secondary": settings.secondaryColor, "--tenant-accent": settings.accentColor, "--tenant-background": safeBackground, "--tenant-surface": safeSurface, "--tenant-text": safeText, "--tenant-hero-overlay": `${Number(settings.heroOverlayOpacity ?? 50) / 100}` };
  Object.entries(css).forEach(([key, value]) => root.style.setProperty(key, value));
  if (settings.fontFamily) root.style.setProperty("--tenant-font-family", settings.fontFamily);
}
function applyDocumentMetadata(settings) { if (typeof document === "undefined") return; if (settings.seoTitle || settings.companyName) document.title = settings.seoTitle || settings.companyName; }

export function SettingsProvider({ children }) {
  const { user } = useAuth();
  const isPlatformScope = isSuperAdminUser(user);
  const tenantId = getTenantId(user);
  const settingsKey = isPlatformScope ? "platform-settings:global" : getSettingsStorageKey(tenantId);

  const readCachedSettings = useCallback(() => {
    try {
      const cached = typeof window !== "undefined" ? localStorage.getItem(settingsKey) : null;
      if (!cached) return isPlatformScope ? PLATFORM_SETTINGS : DEFAULT_SETTINGS;
      return isPlatformScope ? normalizePlatformSettings(JSON.parse(cached)) : normalize(JSON.parse(cached), DEFAULT_SETTINGS);
    } catch {
      return isPlatformScope ? PLATFORM_SETTINGS : DEFAULT_SETTINGS;
    }
  }, [isPlatformScope, settingsKey]);

  const [settings, setSettings] = useState(() => readCachedSettings());
  const [loading, setLoading] = useState(false);
  const applySettings = useCallback((nextSettings) => setSettings((previous) => isPlatformScope ? normalizePlatformSettings(nextSettings, previous) : normalize(nextSettings, previous)), [isPlatformScope]);

  const refreshSettings = useCallback(async () => {
    try {
      if (!isPlatformScope && !tenantId) { const fallback = readCachedSettings(); setSettings(fallback); return fallback; }
      const endpoint = isPlatformScope ? "/admin/settings" : "/settings/public";
      const response = await api.get(endpoint, { params: { _t: Date.now() } });
      const data = response.data?.settings || response.data?.data || response.data || {};
      const normalized = isPlatformScope ? normalizePlatformSettings(data, PLATFORM_SETTINGS) : normalize(data, DEFAULT_SETTINGS);
      setSettings(normalized);
      try { localStorage.setItem(settingsKey, JSON.stringify(normalized)); } catch { return normalized; }
      return normalized;
    } catch (error) {
      console.error(`${isPlatformScope ? "Platform" : "Tenant"} settings load failed:`, error);
      return null;
    }
  }, [isPlatformScope, tenantId, settingsKey, readCachedSettings]);

  useEffect(() => { setSettings(readCachedSettings()); }, [readCachedSettings]);
  useEffect(() => { applyTenantTheme(settings); applyDocumentMetadata(settings); }, [settings]);

  useEffect(() => {
    let mounted = true;
    const load = async () => { setLoading(true); try { await refreshSettings(); } finally { if (mounted) setLoading(false); } };
    void load();
    const interval = window.setInterval(() => { void refreshSettings(); }, 60_000);
    const handleStorage = (event) => { if (event.key !== settingsKey || !event.newValue) return; try { applySettings(JSON.parse(event.newValue)); } catch { return; } };
    const handleSettingsChanged = () => { void refreshSettings(); };
    window.addEventListener("storage", handleStorage);
    window.addEventListener("platform-settings-updated", handleSettingsChanged);
    window.addEventListener("settings-updated", handleSettingsChanged);
    window.addEventListener("dashboard:data-changed", handleSettingsChanged);
    return () => { mounted = false; window.clearInterval(interval); window.removeEventListener("storage", handleStorage); window.removeEventListener("platform-settings-updated", handleSettingsChanged); window.removeEventListener("settings-updated", handleSettingsChanged); window.removeEventListener("dashboard:data-changed", handleSettingsChanged); };
  }, [refreshSettings, applySettings, settingsKey]);

  const updateSettings = useCallback((nextSettings) => {
    const merged = isPlatformScope ? normalizePlatformSettings(nextSettings, settings) : normalize(nextSettings, settings);
    setSettings(merged);
    try { localStorage.setItem(settingsKey, JSON.stringify(merged)); window.dispatchEvent(new CustomEvent(isPlatformScope ? "platform-settings-updated" : "settings-updated", { detail: merged })); } catch { return; }
  }, [isPlatformScope, settings, settingsKey]);

  const companyName = String(settings.companyName || (isPlatformScope ? PLATFORM_BRAND_NAME : "")).trim();
  const value = useMemo(() => ({ settings: { ...settings, companyName }, companyName, supportEmail: settings.supportEmail || "", supportPhone: settings.supportPhone || "", loading, refreshSettings, updateSettings, isPlatformScope }), [settings, companyName, loading, refreshSettings, updateSettings, isPlatformScope]);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() { return useContext(SettingsContext); }
