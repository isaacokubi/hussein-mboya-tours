import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { Save, RefreshCw, Shield, Database, Bell, CreditCard, Building2, Settings, CheckCircle, AlertTriangle, Percent, Smartphone, LockKeyhole, Server, Palette, CircleDollarSign } from "lucide-react";
import api from "../../api/axios";
import { getSettings, updateSettings } from "../../api/superAdminApi";
import { getPlatformBillingConfig, updatePlatformBillingConfig } from "../../api/platformBillingApi";
import SuperAdminPlanFeatures from "./SuperAdminPlanFeatures";
import { useSettings } from "../../context/SettingsContext";

const Card = ({ icon: Icon, title, description, children }) => <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-start gap-3"><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-700"><Icon size={21} /></div><div><h2 className="text-lg font-black text-slate-950">{title}</h2>{description && <p className="mt-1 text-sm leading-5 text-slate-500">{description}</p>}</div></div><div className="mt-5 space-y-4">{children}</div></section>;
const Toggle = ({ checked, onChange, label }) => <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 bg-slate-50 p-3.5 transition hover:border-emerald-200"><span className="text-sm font-semibold text-slate-800">{label}</span><input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5 accent-emerald-600" /></label>;
const RateInput = ({ label, description, value, onChange }) => <div className="space-y-2"><label className="block text-sm font-bold text-slate-800">{label}</label><div className="relative"><input type="number" min="0" max="100" step="0.01" className="w-full rounded-xl border border-slate-200 bg-white p-3 pr-10 font-semibold outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} /><span className="absolute right-3 top-3 text-sm font-bold text-slate-400">%</span></div><p className="text-xs leading-5 text-slate-500">{description}</p></div>;
const PriceInput = ({ label, value, onChange }) => <label className="block text-sm font-bold text-slate-800">{label}<div className="mt-2 flex overflow-hidden rounded-xl border border-slate-200 bg-white focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-100"><span className="border-r border-slate-200 bg-slate-50 px-3 py-3 text-sm font-black text-emerald-700">KES</span><input type="number" min="0" step="1" value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} className="min-w-0 flex-1 p-3 font-semibold outline-none" /></div></label>;
const Field = ({ label, value, onChange, placeholder }) => <label className="block text-sm font-bold text-slate-800">{label}<input className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-medium outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" placeholder={placeholder} value={value ?? ""} onChange={onChange} /></label>;

export default function SuperAdminSettings() {
  const [settings, setSettings] = useState({});
  const [billing, setBilling] = useState({ prices: {}, mpesa: {} });
  const [loading, setLoading] = useState(true);
  const [settingsError, setSettingsError] = useState("");
  const [billingError, setBillingError] = useState("");
  const [saving, setSaving] = useState(false);
  const [savingBilling, setSavingBilling] = useState(false);
  const { updateSettings: updateGlobalSettings } = useSettings() || {};

  const load = async () => {
    setLoading(true);
    setSettingsError("");
    setBillingError("");
    const [settingsResult, billingResult] = await Promise.allSettled([getSettings(), getPlatformBillingConfig()]);

    if (settingsResult.status === "fulfilled") {
      const response = settingsResult.value;
      const nextSettings = response?.settings || response?.data || response || {};
      setSettings(nextSettings);
      updateGlobalSettings?.(nextSettings);
    } else {
      console.error("SUPERADMIN SETTINGS LOAD ERROR", settingsResult.reason);
      setSettingsError(settingsResult.reason?.response?.data?.message || settingsResult.reason?.message || "Platform settings are currently unavailable.");
    }

    if (billingResult.status === "fulfilled") {
      const response = billingResult.value;
      setBilling({ prices: response?.prices || {}, mpesa: response?.mpesa || {} });
    } else {
      console.error("PLATFORM BILLING CONFIG LOAD ERROR", billingResult.reason);
      setBillingError(billingResult.reason?.response?.data?.message || billingResult.reason?.message || "Subscription pricing and payment readiness are currently unavailable.");
    }

    setLoading(false);
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
      updateGlobalSettings?.(savedSettings);
      setSettings((prev) => ({ ...prev, ...savedSettings }));
      setSettingsError("");
      toast.success("Platform settings saved successfully.");
    } catch (err) { console.error("SUPERADMIN SETTINGS SAVE ERROR", err); toast.error(err?.response?.data?.message || "Unable to save platform settings. No changes were applied."); } finally { setSaving(false); }
  };

  const saveBilling = async () => {
    try {
      setSavingBilling(true);
      const payload = Object.fromEntries(["starter", "professional", "business", "enterprise"].map((key) => [key, Number(billing.prices?.[key] || 0)]));
      const response = await updatePlatformBillingConfig(payload);
      setBilling((prev) => ({ ...prev, prices: response?.prices || payload, mpesa: response?.mpesa || prev.mpesa }));
      setBillingError("");
      toast.success("Subscription pricing saved successfully. New tenant subscription requests will use the updated prices.");
    } catch (err) { console.error("PLATFORM BILLING SAVE ERROR", err); toast.error(err?.response?.data?.message || "Unable to save subscription pricing. No pricing changes were applied."); } finally { setSavingBilling(false); }
  };

  const runMaintenance = async (action) => {
    try {
      if (!window.confirm(action === "backup" ? "Create database backup now?" : "Clear system cache now?")) return;
      const endpoint = action === "backup" ? "/superadmin/maintenance/backup" : "/superadmin/maintenance/cache";
      const response = await api.post(endpoint); if (!response.data?.success) throw new Error(response.data?.message || "Maintenance action failed");
      toast.success(action === "backup" ? "Database backup completed successfully." : "System cache cleared successfully.");
    } catch (error) { console.error(error); toast.error(error?.response?.data?.message || "Maintenance action failed. No change was confirmed."); }
  };

  if (loading) return <div className="min-h-full bg-slate-50 p-6 lg:p-8"><div className="mx-auto max-w-[1600px] animate-pulse space-y-5"><div className="h-36 rounded-3xl bg-slate-200" /><div className="grid gap-5 lg:grid-cols-2"><div className="h-64 rounded-2xl bg-slate-200" /><div className="h-64 rounded-2xl bg-slate-200" /></div><div className="h-80 rounded-2xl bg-slate-200" /></div></div>;

  const mpesaReady = Boolean(billing.mpesa?.configured && billing.mpesa?.callbackConfigured && billing.mpesa?.shortcodeConfigured);
  return <div className="min-h-full bg-slate-50 p-6 lg:p-8">
    <div className="mx-auto max-w-[1600px] space-y-6">
      <section className="overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-6 text-white shadow-xl lg:p-8"><div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"><div><div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-emerald-200"><Shield size={14} />Super Admin configuration scope</div><h1 className="text-3xl font-black tracking-tight lg:text-4xl">Platform Settings</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Global configuration, tenant subscription pricing and platform payment readiness for Global Tours.</p></div><button onClick={load} disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-60"><RefreshCw size={17} className={loading ? "animate-spin" : ""} />Refresh</button></div></section>

      {settingsError && <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-900"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-rose-600" size={19} /><div><p className="font-black">Platform settings could not be loaded</p><p className="mt-1">{settingsError}</p><button onClick={load} className="mt-3 rounded-lg bg-rose-700 px-3 py-2 text-xs font-bold text-white">Retry settings</button></div></div></div>}
      {billingError && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={19} /><div><p className="font-black">Subscription billing data could not be loaded</p><p className="mt-1">{billingError}</p><button onClick={load} className="mt-3 rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white">Retry billing data</button></div></div></div>}

      <SuperAdminPlanFeatures />

      <Card icon={CircleDollarSign} title="Tenant Subscription Pricing" description="Platform-controlled commercial pricing for tenant subscriptions."><div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-950"><div className="flex gap-3"><LockKeyhole size={20} className="mt-0.5 shrink-0" /><div><strong>Central pricing authority</strong><p className="mt-1 leading-5">These KES prices are stored centrally and used by tenant Billing & Subscription checkout. A zero price keeps a plan unavailable for payment; historical payment amounts are never rewritten.</p></div></div></div><div className="grid gap-4 md:grid-cols-2">{[["starter","Starter — 30 days"],["professional","Professional — 30 days"],["business","Business — 30 days"],["enterprise","Enterprise — 30 days"]].map(([key,label]) => <PriceInput key={key} label={label} value={billing.prices?.[key]} onChange={(v) => updatePrice(key, v)} />)}</div><div className="flex flex-col gap-4 border-t border-slate-100 pt-4 sm:flex-row sm:items-center sm:justify-between"><p className="text-xs leading-5 text-slate-500">Pricing changes apply to new subscription payment requests only.</p><button disabled={savingBilling || Boolean(billingError)} onClick={saveBilling} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-6 py-3 text-sm font-black text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"><Save size={17} />{savingBilling ? "Saving pricing..." : "Save subscription pricing"}</button></div></Card>

      <Card icon={Smartphone} title="Platform M-Pesa Subscription Checkout" description="Deployment readiness for the platform subscription payment gateway."><div className={`rounded-xl border p-4 ${mpesaReady ? "border-emerald-200 bg-emerald-50 text-emerald-950" : "border-amber-200 bg-amber-50 text-amber-950"}`}><div className="flex items-start gap-3"><div className="mt-0.5">{mpesaReady ? <CheckCircle size={22} className="text-emerald-600" /> : <AlertTriangle size={22} className="text-amber-600" />}</div><div><p className="font-black">{mpesaReady ? "M-Pesa subscription gateway ready" : "M-Pesa subscription gateway requires deployment configuration"}</p><p className="mt-1 text-sm leading-5">Environment: <strong>{billing.mpesa?.environment || "—"}</strong>. Credentials are intentionally never stored in or returned to the browser.</p></div></div></div><div className="grid gap-3 sm:grid-cols-3"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Credentials</span><div className={`mt-1 font-black ${billing.mpesa?.configured ? "text-emerald-700" : "text-amber-700"}`}>{billing.mpesa?.configured ? "Configured" : billingError ? "Unavailable" : "Missing"}</div></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Shortcode</span><div className={`mt-1 font-black ${billing.mpesa?.shortcodeConfigured ? "text-emerald-700" : "text-amber-700"}`}>{billing.mpesa?.shortcodeConfigured ? "Configured" : billingError ? "Unavailable" : "Missing"}</div></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">Callback URL</span><div className={`mt-1 font-black ${billing.mpesa?.callbackConfigured ? "text-emerald-700" : "text-amber-700"}`}>{billing.mpesa?.callbackConfigured ? "Configured" : billingError ? "Unavailable" : "Missing"}</div></div></div>{!mpesaReady && !billingError && <p className="text-sm leading-5 text-amber-800">Set the server deployment environment variables for the platform M-Pesa account before enabling live subscription checkout. Never paste consumer secrets or passkeys into this page.</p>}</Card>

      <div className="rounded-2xl border border-blue-200 bg-blue-50 p-5"><div className="flex items-start gap-3"><Percent className="mt-1 text-blue-700" size={22} /><div><h2 className="font-black text-blue-950">Global Business Rates</h2><p className="mt-1 text-sm leading-5 text-blue-800">These rates are controlled centrally by SuperAdmin and stored as platform settings.</p></div></div></div>
      <div className="grid gap-6 lg:grid-cols-3"><Card icon={Percent} title="Agent Commission"><RateInput label="Global agent commission" description="Default rate for new agent commission calculations." value={settings.defaultCommissionRate} onChange={(v) => update("defaultCommissionRate", v)} /></Card><Card icon={CreditCard} title="Booking Deposit"><RateInput label="Default booking deposit" description="Default percentage requested as the initial deposit." value={settings.bookingDepositPercentage} onChange={(v) => update("bookingDepositPercentage", v)} /></Card><Card icon={CreditCard} title="Tax / Service Rate"><RateInput label="Global tax/service rate" description="Centrally controlled percentage for eligible calculations." value={settings.taxRate} onChange={(v) => update("taxRate", v)} /><select className="w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={settings.taxServiceType || "service_fee"} onChange={(e) => update("taxServiceType", e.target.value)}><option value="service_fee">Service fee</option><option value="tax">Tax</option><option value="tax_and_service">Tax / service charge</option></select></Card></div>

      <div className="grid gap-6 lg:grid-cols-2"><Card icon={Building2} title="General Configuration" description="Platform identity and support contacts."><Field label="Company Name" value={settings.companyName || "Global Tours"} onChange={(e) => update("companyName", e.target.value)} /><Field label="Support Email" value={settings.supportEmail} onChange={(e) => update("supportEmail", e.target.value)} /><Field label="Support Phone" value={settings.supportPhone} onChange={(e) => update("supportPhone", e.target.value)} /><label className="block text-sm font-bold text-slate-800">Currency<select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={settings.currency || "KES"} onChange={(e) => update("currency", e.target.value)}><option>KES</option><option>USD</option><option>EUR</option></select></label></Card><Card icon={CreditCard} title="Booking & Payments" description="Default booking and payment configuration."><label className="block text-sm font-bold text-slate-800">Booking status<select className="mt-2 w-full rounded-xl border border-slate-200 bg-white p-3 font-semibold outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" value={settings.bookingStatus || "confirmed"} onChange={(e) => update("bookingStatus", e.target.value)}><option value="pending">Pending</option><option value="confirmed">Confirmed</option></select></label><Field label="Payment Provider" value={settings.paymentProvider} onChange={(e) => update("paymentProvider", e.target.value)} placeholder="e.g. M-Pesa" /></Card><Card icon={Bell} title="Notifications" description="Platform notification defaults."><Toggle checked={settings.emailNotifications ?? true} label="Booking and payment email notifications" onChange={(v) => update("emailNotifications", v)} /><Toggle checked={settings.systemAlerts ?? true} label="System alerts" onChange={(v) => update("systemAlerts", v)} /></Card><Card icon={Shield} title="Security Controls" description="Platform-level authentication safeguards."><Toggle checked={settings.twoFactor ?? false} label="Enable Two Factor Authentication" onChange={(v) => update("twoFactor", v)} /><div className="flex gap-2 text-sm text-slate-500"><AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />Security changes are recorded in audit logs.</div></Card><Card icon={Database} title="System Maintenance" description="Operational maintenance actions."><button onClick={() => runMaintenance("backup")} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left text-sm font-bold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50">Create Database Backup</button><button onClick={() => runMaintenance("cache")} className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left text-sm font-bold text-slate-800 transition hover:border-emerald-200 hover:bg-emerald-50">Clear System Cache</button></Card><Card icon={Settings} title="System Information" description="Current governance scope and controls."><div className="space-y-2.5 text-sm">{["Platform settings scope: global","Configuration management enabled","Subscription pricing controlled by SuperAdmin","Plan feature entitlements enforced server-side","Platform M-Pesa secrets remain server-side","Audit logging active"].map((item) => <div key={item} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 text-slate-700"><CheckCircle size={15} className="text-emerald-600" />{item}</div>)}</div></Card></div>

      <div className="sticky bottom-4 z-20 flex justify-end"><button disabled={saving || Boolean(settingsError)} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-8 py-3.5 text-sm font-black text-white shadow-lg hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"><Save size={18} />{saving ? "Saving..." : "Save Platform Settings"}</button></div>
    </div>
  </div>;
}
