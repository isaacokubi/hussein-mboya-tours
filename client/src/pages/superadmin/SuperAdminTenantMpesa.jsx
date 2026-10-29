import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, CheckCircle2, KeyRound, Save, ShieldCheck, Smartphone, XCircle, Wifi } from "lucide-react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { disableSuperAdminTenantMpesa, getSuperAdminTenantMpesa, saveSuperAdminTenantMpesa, validateSuperAdminTenantMpesa } from "../../api/superAdminTenantsApi";

const emptyForm = { environment: "sandbox", enabled: false, accountName: "", shortcode: "", callbackUrl: "", consumerKey: "", consumerSecret: "", passkey: "" };
const fieldClass = "mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-50";

export default function SuperAdminTenantMpesa() {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [form, setForm] = useState(emptyForm);
  const [validation, setValidation] = useState(null);
  const query = useQuery({ queryKey: ["superadmin-tenant-mpesa", tenantId, form.environment], queryFn: () => getSuperAdminTenantMpesa(tenantId, form.environment), enabled: Boolean(tenantId) });
  const data = query.data?.data;
  const tenant = query.data?.tenant;

  useEffect(() => {
    if (!data) return;
    setForm({
      ...emptyForm,
      environment: data.environment || "sandbox",
      enabled: Boolean(data.enabled),
      accountName: data.accountName || "",
      shortcode: data.shortcode || "",
      callbackUrl: data.callbackUrl || "",
    });
  }, [data]);

  const refresh = () => queryClient.invalidateQueries({ queryKey: ["superadmin-tenant-mpesa", tenantId] });
  const save = useMutation({
    mutationFn: () => saveSuperAdminTenantMpesa(tenantId, form),
    onSuccess: (result) => {
      setForm((current) => ({ ...current, consumerKey: "", consumerSecret: "", passkey: "" }));
      refresh();
      toast.success(result.message || "Tenant M-Pesa settings saved securely.");
    },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to save tenant M-Pesa settings."),
  });
  const disable = useMutation({
    mutationFn: () => disableSuperAdminTenantMpesa(tenantId),
    onSuccess: (result) => { refresh(); setForm((current) => ({ ...current, enabled: false })); toast.success(result.message || "Tenant M-Pesa gateway disabled."); },
    onError: (error) => toast.error(error?.response?.data?.message || "Unable to disable M-Pesa."),
  });
  const check = useMutation({ mutationFn: () => validateSuperAdminTenantMpesa(tenantId, form.environment), onSuccess: (result) => { setValidation(result.data); refresh(); }, onError: (error) => setValidation({ status: "error", message: error?.response?.data?.message || "Configuration check failed.", remoteVerified: false }) });
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));

  if (query.isLoading) return <div className="rounded-2xl border border-slate-200 bg-white p-8 text-slate-600">Loading tenant payment settings…</div>;
  if (query.isError) return <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">{query.error?.response?.data?.message || "Unable to load tenant M-Pesa settings."}</div>;

  return <main className="mx-auto max-w-5xl space-y-6">
    <Link to="/superadmin" className="inline-flex items-center gap-2 text-sm font-bold text-emerald-800 hover:underline"><ArrowLeft size={16}/> Back to companies</Link>
    <header className="rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
      <p className="text-xs font-black uppercase tracking-[.18em] text-emerald-300">Platform governance · tenant payments</p>
      <h1 className="mt-2 flex items-center gap-3 text-3xl font-black"><Smartphone size={28}/> M-Pesa / Daraja settings</h1>
      <p className="mt-2 text-slate-300">{tenant?.name} <span className="text-slate-500">({tenant?.slug})</span></p>
    </header>
    <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950">
      Saving these settings changes this tenant’s payment configuration. No payment is initiated here. Use a publicly reachable HTTPS callback ending in <code>/api/mpesa/callback</code>; sandbox must use a callback host separate from the configured production callback host.
    </section>
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div><p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Tenant-specific encrypted credentials</p><h2 className="mt-1 flex items-center gap-2 text-xl font-black text-slate-900"><ShieldCheck size={20}/> Safaricom Daraja</h2></div>
        <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-black ${data?.enabled ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-600"}`}>{data?.enabled ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} {data?.enabled ? "Enabled" : "Disabled"}</span>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="text-sm font-bold text-slate-700">Environment<select value={form.environment} onChange={(event) => { setValidation(null); set("environment", event.target.value); }} className={fieldClass}><option value="sandbox">Sandbox</option><option value="production">Production</option></select></label>
        <label className="flex items-center gap-3 self-end rounded-xl border border-slate-200 p-3 text-sm font-bold text-slate-700"><input type="checkbox" checked={form.enabled} onChange={(event) => set("enabled", event.target.checked)} className="h-4 w-4 accent-emerald-700"/> Enable this tenant’s M-Pesa gateway</label>
        <label className="text-sm font-bold text-slate-700">Account / merchant name<input value={form.accountName} onChange={(event) => set("accountName", event.target.value)} className={fieldClass} autoComplete="off"/></label>
        <label className="text-sm font-bold text-slate-700">Shortcode<input value={form.shortcode} onChange={(event) => set("shortcode", event.target.value)} className={fieldClass} autoComplete="off"/></label>
        <label className="text-sm font-bold text-slate-700 md:col-span-2">Callback URL<input type="url" value={form.callbackUrl} onChange={(event) => set("callbackUrl", event.target.value)} className={fieldClass} placeholder="https://staging.example.com/api/mpesa/callback" autoComplete="url"/><span className="mt-1 block text-xs font-normal text-slate-500">Must be public HTTPS and use the application callback path. Sandbox callbacks on the production host are rejected server-side.</span></label>
      </div>
      <div className="mt-6 rounded-2xl bg-slate-50 p-4 sm:p-5">
        <h3 className="flex items-center gap-2 font-black text-slate-900"><KeyRound size={17}/> Daraja credentials</h3>
        <p className="mt-1 text-xs leading-5 text-slate-500">Secrets are encrypted before storage and never returned by the API. Leave a field blank to keep its existing value.</p>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {[["consumerKey", "Consumer Key"], ["consumerSecret", "Consumer Secret"], ["passkey", "Passkey"]].map(([key, label]) => <label key={key} className="text-sm font-bold text-slate-700">{label} {data?.secretsConfigured?.[key] && <span className="text-xs font-semibold text-emerald-700">(configured)</span>}<input type="password" autoComplete="new-password" value={form[key]} onChange={(event) => set(key, event.target.value)} placeholder={data?.secretsConfigured?.[key] ? "Saved; leave blank to retain" : "Enter secret"} className={fieldClass}/></label>)}
        </div>
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        <button type="button" disabled={save.isPending} onClick={() => save.mutate()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-black text-white disabled:opacity-50"><Save size={16}/>{save.isPending ? "Saving securely…" : "Save settings"}</button>
        <button type="button" disabled={check.isPending || !data?.configured} onClick={() => check.mutate()} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-5 py-3 text-sm font-black text-blue-800 disabled:opacity-50"><Wifi size={16}/>{check.isPending ? "Checking Daraja…" : "Validate configuration"}</button>
        {data?.configured && data.enabled && <button type="button" disabled={disable.isPending} onClick={() => disable.mutate()} className="rounded-xl border border-red-200 px-5 py-3 text-sm font-black text-red-700 disabled:opacity-50">{disable.isPending ? "Disabling…" : "Disable gateway"}</button>}
        <button type="button" onClick={() => navigate("/superadmin")} className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700">Cancel</button>
      </div>
      {validation && <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${validation.status === "connected" ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{validation.message}{validation.timestamp ? ` (${new Date(validation.timestamp).toLocaleString()})` : ""}</p>}
    </section>
  </main>;
}
