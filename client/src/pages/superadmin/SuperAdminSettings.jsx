import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { Save, RefreshCw, Shield, Database, Bell, CreditCard, Building2, Settings, CheckCircle, AlertTriangle, Percent, Smartphone, LockKeyhole } from "lucide-react";
import api from "../../api/axios";
import { getSettings, updateSettings } from "../../api/superAdminApi";
import { getPlatformBillingConfig, updatePlatformBillingConfig } from "../../api/platformBillingApi";
import { useSettings } from "../../context/SettingsContext";

const Card = ({ icon: Icon, title, children }) => <div className="space-y-5 rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center gap-3"><div className="rounded-xl bg-gray-100 p-3"><Icon size={22} /></div><h2 className="text-lg font-semibold">{title}</h2></div>{children}</div>;
const Toggle = ({ checked, onChange, label }) => <label className="flex cursor-pointer items-center justify-between rounded-xl border p-3"><span className="text-sm">{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5" /></label>;
const RateInput = ({ label, description, value, onChange }) => <div className="space-y-2"><label className="block text-sm font-medium">{label}</label><div className="relative"><input type="number" min="0" max="100" step="0.01" className="w-full rounded-xl border p-3 pr-10" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} /><span className="absolute right-3 top-3 text-gray-500">%</span></div><p className="text-xs text-gray-500">{description}</p></div>;
const PriceInput = ({ label, value, onChange }) => <label className="block text-sm font-medium">{label}<div className="mt-1 flex overflow-hidden rounded-xl border"><span className="bg-gray-50 px-3 py-3 text-gray-500">KES</span><input type="number" min="0" step="1" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} className="min-w-0 flex-1 p-3 outline-none" /></div></label>;

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({});
  const [billing, setBilling] = useState({ prices: { starter: 0, professional: 0, business: 0, enterprise: 0 }, mpesa: {} });
  const [saving, setSaving] = useState(false);
  const [savingBilling, setSavingBilling] = useState(false);
  const [loading, setLoading] = useState(true);
  const { updateSettings: updateGlobalSettings } = useSettings() || {};

  const load = async () => {
    try {
      setLoading(true);
      const [settingsResponse, billingResponse] = await Promise.all([getSettings(), getPlatformBillingConfig()]);
      const nextSettings = settingsResponse?.settings || settingsResponse?.data || settingsResponse || {};
      setSettings(nextSettings);
      setBilling({ prices: billingResponse?.prices || {}, mpesa: billingResponse?.mpesa || {} });
      updateGlobalSettings?.(nextSettings);
    } catch (err) {
      console.error("SUPERADMIN SETTINGS LOAD ERROR", err);
      toast.error(err?.response?.data?.message || "Failed to load platform settings.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);
  const update = (key, value) => setSettings((prev) => ({ ...prev, [key]: value }));
  const updatePrice = (key, value) => setBilling((prev) => ({ ...prev, prices: { ...prev.prices, [key]: value } }));

  const save = async () => {
    try {
      setSaving(true);
      const payload = { ...settings, companyName: String(settings.companyName || "Global Tours").trim(), taxRate: Number(settings.taxRate ?? 0), taxServiceType: settings.taxServiceType || "service_fee", bookingDepositPercentage: Number(settings.bookingDepositPercentage ?? 30), defaultCommissionRate: Number(settings.defaultCommissionRate ?? 10) };
      const response = await updateSettings(payload);
      const savedSettings = response?.settings || response?.data?.settings || response?.data || payload;
      updateGlobalSettings?.(savedSettings); setSettings((prev) => ({ ...prev, ...savedSettings })); toast.success("Platform settings saved successfully.");
    } catch (err) { console.error("SUPERADMIN SETTINGS SAVE ERROR", err); toast.error(err?.response?.data?.message || "Failed saving platform settings."); } finally { setSaving(false); }
  };

  const saveBilling = async () => {
    try {
      setSavingBilling(true);
      const payload = Object.fromEntries(["starter", "professional", "business", "enterprise"].map((key) => [key, Number(billing.prices?.[key] || 0)]));
      const response = await updatePlatformBillingConfig(payload);
      setBilling((prev) => ({ ...prev, prices: response?.prices || payload, mpesa: response?.mpesa || prev.mpesa }));
      toast.success("Subscription pricing saved. Tenant billing now uses these platform prices.");
    } catch (err) { console.error("PLATFORM BILLING SAVE ERROR", err); toast.error(err?.response?.data?.message || "Failed saving subscription pricing."); } finally { setSavingBilling(false); }
  };

  const runMaintenance = async (action) => {
    try {
      if (!window.confirm(action === "backup" ? "Create database backup now?" : "Clear system cache now?")) return;
      const endpoint = action === "backup" ? "/superadmin/maintenance/backup" : "/superadmin/maintenance/cache";
      const response = await api.post(endpoint); if (!response.data?.success) throw new Error(response.data?.message || "Maintenance failed");
      toast.success(action === "backup" ? "Database backup completed successfully." : "System cache cleared successfully.");
    } catch (error) { console.error(error); toast.error(error?.response?.data?.message || "Maintenance failed. Check system logs."); }
  };

  if (loading) return <div className="flex items-center gap-3 p-8"><RefreshCw className="animate-spin" /> Loading platform settings...</div>;
  const mpesaReady = Boolean(billing.mpesa?.configured && billing.mpesa?.callbackConfigured && billing.mpesa?.shortcodeConfigured);
  return (
    <div className="space-y-8 p-6">
      <div className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex items-center justify-between gap-4"><div><h1 className="text-3xl font-bold">Platform Settings</h1><p className="mt-2 text-gray-500">Global configuration, tenant subscription pricing and platform payment readiness.</p></div><button onClick={load} className="flex items-center gap-2 rounded-xl border px-4 py-2"><RefreshCw size={18} /> Refresh</button></div><div className="mt-4 flex items-center gap-2 text-sm"><CheckCircle size={16} /> SuperAdmin configuration scope is active</div></div>

      <Card icon={CreditCard} title="Tenant Subscription Pricing">
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900"><div className="flex gap-3"><LockKeyhole size={20} /><div><strong>Platform-controlled pricing</strong><p className="mt-1">These prices are stored centrally and are used by every tenant's Billing & Subscription checkout. Enter the actual commercial KES prices agreed by the platform owner; zero keeps a plan unavailable for payment.</p></div></div></div>
        <div className="grid gap-4 md:grid-cols-2"><PriceInput label="Starter — 30 days" value={billing.prices?.starter} onChange={(v) => updatePrice("starter", v)} /><PriceInput label="Professional — 30 days" value={billing.prices?.professional} onChange={(v) => updatePrice("professional", v)} /><PriceInput label="Business — 30 days" value={billing.prices?.business} onChange={(v) => updatePrice("business", v)} /><PriceInput label="Enterprise — 30 days" value={billing.prices?.enterprise} onChange={(v) => updatePrice("enterprise", v)} /></div>
        <div className="flex items-center justify-between gap-4 border-t pt-4"><p className="text-xs text-gray-500">Pricing changes apply to new subscription payment requests and do not rewrite historical payment amounts.</p><button disabled={savingBilling} onClick={saveBilling} className="flex items-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 font-semibold text-white disabled:opacity-50"><Save size={18} /> {savingBilling ? "Saving pricing..." : "Save subscription pricing"}</button></div>
      </Card>

      <Card icon={Smartphone} title="Platform M-Pesa Subscription Checkout">
        <div className={`rounded-xl border p-4 ${mpesaReady ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"}`}><div className="flex items-start gap-3"><div className="mt-1">{mpesaReady ? <CheckCircle size={22} /> : <AlertTriangle size={22} />}</div><div><p className="font-semibold">{mpesaReady ? "M-Pesa subscription gateway ready" : "M-Pesa subscription gateway requires deployment configuration"}</p><p className="mt-1 text-sm">Environment: <strong>{billing.mpesa?.environment || "sandbox"}</strong>. Credentials are intentionally never stored in or returned to the browser.</p></div></div></div>
        <div className="grid gap-3 sm:grid-cols-3 text-sm"><div className="rounded-xl border p-4"><span className="text-gray-500">Credentials</span><div className="mt-1 font-semibold">{billing.mpesa?.configured ? "Configured" : "Missing"}</div></div><div className="rounded-xl border p-4"><span className="text-gray-500">Shortcode</span><div className="mt-1 font-semibold">{billing.mpesa?.shortcodeConfigured ? "Configured" : "Missing"}</div></div><div className="rounded-xl border p-4"><span className="text-gray-500">Callback URL</span><div className="mt-1 font-semibold">{billing.mpesa?.callbackConfigured ? "Configured" : "Missing"}</div></div></div>
        {!mpesaReady && <p className="text-sm text-amber-800">Set the server deployment environment variables for the platform M-Pesa account before enabling live subscription checkout. Never paste consumer secrets or passkeys into this page.</p>}
      </Card>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><div className="flex items-start gap-3"><Percent className="mt-1 text-blue-700" size={22} /><div><h2 className="font-semibold text-blue-900">Global Business Rates</h2><p className="mt-1 text-sm text-blue-800">These rates are controlled centrally by SuperAdmin and stored as platform settings.</p></div></div></div>
      <div className="grid gap-6 lg:grid-cols-3"><Card icon={Percent} title="Agent Commission"><RateInput label="Global agent commission" description="Default rate for new agent commission calculations." value={settings.defaultCommissionRate} onChange={(v) => update("defaultCommissionRate", v)} /></Card><Card icon={CreditCard} title="Booking Deposit"><RateInput label="Default booking deposit" description="Default percentage requested as the initial deposit." value={settings.bookingDepositPercentage} onChange={(v) => update("bookingDepositPercentage", v)} /></Card><Card icon={CreditCard} title="Tax / Service Rate"><RateInput label="Global tax/service rate" description="Centrally controlled percentage for eligible calculations." value={settings.taxRate} onChange={(v) => update("taxRate", v)} /><select className="w-full rounded-xl border p-3" value={settings.taxServiceType || "service_fee"} onChange={(e) => update("taxServiceType", e.target.value)}><option value="service_fee">Service fee</option><option value="tax">Tax</option><option value="tax_and_service">Tax / service charge</option></select></Card></div>
      <div className="grid gap-6 lg:grid-cols-2"><Card icon={Building2} title="General Configuration"><input className="w-full rounded-xl border p-3" placeholder="Company Name" value={settings.companyName || ""} onChange={(e) => update("companyName", e.target.value)} /><input className="w-full rounded-xl border p-3" placeholder="Support Email" value={settings.supportEmail || ""} onChange={(e) => update("supportEmail", e.target.value)} /><input className="w-full rounded-xl border p-3" placeholder="Support Phone" value={settings.supportPhone || ""} onChange={(e) => update("supportPhone", e.target.value)} /><select className="w-full rounded-xl border p-3" value={settings.currency || "KES"} onChange={(e) => update("currency", e.target.value)}><option>KES</option><option>USD</option><option>EUR</option></select></Card><Card icon={CreditCard} title="Booking & Payments"><select className="w-full rounded-xl border p-3" value={settings.bookingStatus || "confirmed"} onChange={(e) => update("bookingStatus", e.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option></select><input className="w-full rounded-xl border p-3" placeholder="Payment Provider" value={settings.paymentProvider || ""} onChange={(e) => update("paymentProvider", e.target.value)} /></Card><Card icon={Bell} title="Notifications"><Toggle checked={settings.emailNotifications ?? true} label="Booking and payment email notifications" onChange={(v) => update("emailNotifications", v)} /><Toggle checked={settings.systemAlerts ?? true} label="System alerts" onChange={(v) => update("systemAlerts", v)} /></Card><Card icon={Shield} title="Security Controls"><Toggle checked={settings.twoFactor ?? false} label="Enable Two Factor Authentication" onChange={(v) => update("twoFactor", v)} /><div className="flex gap-2 text-sm text-gray-600"><AlertTriangle size={16} /> Security changes are recorded in audit logs</div></Card><Card icon={Database} title="System Maintenance"><button onClick={() => runMaintenance("backup")} className="w-full rounded-xl border p-3 hover:bg-gray-100">Create Database Backup</button><button onClick={() => runMaintenance("cache")} className="w-full rounded-xl border p-3 hover:bg-gray-100">Clear System Cache</button></Card><Card icon={Settings} title="System Information"><div className="space-y-2 text-sm"><p>Platform settings scope: global</p><p>Configuration management enabled</p><p>Subscription pricing controlled by SuperAdmin</p><p>Platform M-Pesa secrets remain server-side</p><p>Audit logging active</p></div></Card></div>
      <div className="flex justify-end"><button disabled={saving} onClick={save} className="flex items-center gap-2 rounded-xl bg-black px-8 py-3 text-white disabled:opacity-50"><Save size={18} /> {saving ? "Saving..." : "Save Settings"}</button></div>
    </div>
  );
}
