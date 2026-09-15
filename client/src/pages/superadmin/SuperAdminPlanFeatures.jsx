import React, { useEffect, useMemo, useState } from "react";
import { Check, LockKeyhole, RefreshCw, Save, ShieldCheck, X, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { getPlatformBillingConfig, updatePlatformBillingConfig } from "../../api/platformBillingApi";

const PLAN_ORDER = ["starter", "professional", "business", "enterprise"];
const PLAN_META = {
  starter: { label: "Starter", subtitle: "Core tools for a small travel business" },
  professional: { label: "Professional", subtitle: "Operations, sales, CRM and core finance" },
  business: { label: "Business", subtitle: "Advanced operations, accounting, compliance and AI" },
  enterprise: { label: "Enterprise", subtitle: "Full platform capability" },
};
const money = (value) => value === undefined || value === null || value === "" ? "—" : `KES ${Number(value).toLocaleString("en-KE")}`;

export default function SuperAdminPlanFeatures() {
  const [billing, setBilling] = useState({ prices: {}, features: {}, featureCatalog: [] });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const load = async () => {
    try {
      setLoading(true);
      setLoadError("");
      const response = await getPlatformBillingConfig();
      setBilling({ prices: response?.prices || {}, features: response?.features || {}, featureCatalog: response?.featureCatalog || [] });
    } catch (error) {
      console.error("PLAN FEATURE LOAD ERROR", error);
      setLoadError(error?.response?.data?.message || error?.message || "Plan catalogue is currently unavailable.");
    } finally { setLoading(false); }
  };

  useEffect(() => { void load(); }, []);
  const updateFeature = (plan, featureId, enabled) => setBilling((current) => ({ ...current, features: { ...current.features, [plan]: enabled ? [...new Set([...(current.features?.[plan] || []), featureId])] : (current.features?.[plan] || []).filter((id) => id !== featureId) } }));
  const save = async () => { try { setSaving(true); const payload = { ...Object.fromEntries(PLAN_ORDER.map((plan) => [plan, Number(billing.prices?.[plan] || 0)])), features: Object.fromEntries(PLAN_ORDER.map((plan) => [plan, billing.features?.[plan] || []])) }; const response = await updatePlatformBillingConfig(payload); setBilling((current) => ({ ...current, prices: response?.prices || current.prices, features: response?.features || current.features })); setLoadError(""); toast.success("Plan pricing and feature entitlements saved successfully."); } catch (error) { toast.error(error?.response?.data?.message || "Unable to save plan features. No changes were applied."); } finally { setSaving(false); } };
  const catalog = useMemo(() => billing.featureCatalog || [], [billing.featureCatalog]);
  if (loading) return <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"><div className="flex items-center gap-3 text-sm font-semibold text-slate-600"><RefreshCw className="animate-spin text-emerald-600" size={18} />Loading plan catalogue...</div></div>;

  return <div className="space-y-5">
    <header className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Global Tours · Commercial Plans</p><h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Plan features & entitlements</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">The product catalogue tenants pay for. Active subscription plans determine protected workspace modules and APIs.</p></div><button onClick={load} className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50"><RefreshCw size={16} />Refresh catalogue</button></div></header>
    {loadError && <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950"><div className="flex items-start gap-3"><AlertTriangle className="mt-0.5 shrink-0 text-amber-600" size={19}/><div><p className="font-black">Plan catalogue unavailable</p><p className="mt-1">{loadError}</p><button onClick={load} className="mt-3 rounded-lg bg-amber-700 px-3 py-2 text-xs font-bold text-white">Retry catalogue</button></div></div></div>}
    <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">{PLAN_ORDER.map((plan) => <div key={plan} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex items-center justify-between gap-3"><div><h3 className="text-xl font-black text-slate-950">{PLAN_META[plan].label}</h3><p className="mt-1 text-xs leading-5 text-slate-500">{PLAN_META[plan].subtitle}</p></div><ShieldCheck className="text-emerald-700" size={22}/></div><p className="mt-5 text-2xl font-black text-emerald-700">{money(billing.prices?.[plan])}</p><p className="mt-1 text-xs font-semibold text-slate-500">per 30-day subscription</p><p className="mt-4 text-sm font-bold text-slate-700">{loadError ? "—" : `${(billing.features?.[plan] || []).length} included features`}</p></div>)}</section>
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm"><div className="overflow-x-auto"><table className="min-w-[1050px] w-full border-collapse"><thead><tr className="border-b bg-slate-950 text-left text-white"><th className="sticky left-0 z-10 min-w-[330px] bg-slate-950 p-4 text-sm font-black">Feature</th>{PLAN_ORDER.map((plan) => <th key={plan} className="min-w-[180px] p-4 text-center"><div className="font-black">{PLAN_META[plan].label}</div><div className="mt-1 text-xs font-medium text-slate-300">{money(billing.prices?.[plan])}</div></th>)}</tr></thead><tbody>{catalog.map((item) => <tr key={item.id} className="border-b last:border-0 hover:bg-slate-50"><td className="sticky left-0 bg-white p-4"><div className="font-bold text-slate-900">{item.name}</div><div className="mt-1 text-xs leading-5 text-slate-500">{item.description}</div></td>{PLAN_ORDER.map((plan) => { const enabled = (billing.features?.[plan] || []).includes(item.id); const locked = item.id === "billing"; return <td key={plan} className="p-4 text-center"><button type="button" disabled={locked || Boolean(loadError)} onClick={() => updateFeature(plan, item.id, !enabled)} className={`inline-flex items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-black ring-1 transition ${enabled ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-slate-50 text-slate-400 ring-slate-200"} disabled:cursor-not-allowed`} title={locked ? "Billing is mandatory so tenants can manage renewal." : enabled ? "Included in plan" : "Not included in plan"}>{enabled ? <Check size={15}/> : <X size={15}/>} {enabled ? "Included" : "Not included"}</button></td>; })}</tr>)}</tbody></table></div></section>
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 text-sm leading-6 text-amber-950"><div className="flex items-start gap-3"><LockKeyhole className="mt-0.5 shrink-0" size={19}/><div><strong>Server-side enforcement:</strong> hiding a menu item is only a usability control. The server also enforces these entitlements, so tenants cannot unlock excluded modules by typing their URL or calling the API directly. Billing remains available on every paid plan.</div></div></section>
    <div className="flex justify-end"><button disabled={saving || Boolean(loadError)} onClick={save} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-7 py-3 font-black text-white disabled:opacity-50"><Save size={17}/>{saving ? "Saving..." : "Save plan catalogue"}</button></div>
  </div>;
}
