/**
 * Purpose: Payment Gateway Center reusable UI component. Main declarations: PaymentGatewayCenter, selectProvider, set.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useMemo, useRef, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import { CheckCircle2, CreditCard, EyeOff, KeyRound, Save, ShieldCheck, Smartphone, Trash2, XCircle, Wifi } from "lucide-react";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../../api/paymentGatewayApi so this module can use its exported dependencies.
import { disablePaymentGateway, getPaymentGateway, listPaymentGateways, savePaymentGateway, validatePaymentGateway } from "../../api/paymentGatewayApi";

// Declare PROVIDERS for use by the surrounding module or function.
const PROVIDERS = [
  { id: "MPESA", name: "M-Pesa", icon: Smartphone, help: "Safaricom Daraja credentials, shortcode and callback configuration." },
  { id: "STRIPE", name: "Stripe", icon: CreditCard, help: "Stripe account and publishable-key configuration." },
  { id: "PAYPAL", name: "PayPal", icon: CreditCard, help: "PayPal Orders API credentials, environment and verified webhook." },
  { id: "PESAPAL", name: "Pesapal", icon: CreditCard, help: "Pesapal merchant configuration." },
  { id: "BANK", name: "Bank transfer", icon: CreditCard, help: "Bank settlement instructions for offline payment." },
];
// Declare secretFields for use by the surrounding module or function.
const secretFields = ["consumerKey", "consumerSecret", "passkey", "secretKey", "webhookSecret", "initiatorName", "securityCredential"];

// Define PaymentGatewayCenter; its parameters and body implement this operation.
export default function PaymentGatewayCenter({ mpesaOnly = false, providerOnly = "", initialProvider = "MPESA" }) {
  // Declare qc for use by the surrounding module or function.
  const qc = useQueryClient();
  // Declare [provider, setProvider] for use by the surrounding module or function.
  const [provider, setProvider] = useState(initialProvider);
  // Declare [validationResult, setValidationResult] for use by the surrounding module or function.
  const [validationResult, setValidationResult] = useState(null);
  // Declare initializedEnvironment for use by the surrounding module or function.
  const initializedEnvironment = useRef(false);
  // Declare [form, setForm] for use by the surrounding module or function.
  const [form, setForm] = useState({ environment: "sandbox", enabled: false, accountName: "", shortcode: "", publicKey: "", merchantId: "", callbackUrl: "", consumerKey: "", consumerSecret: "", passkey: "", secretKey: "", webhookSecret: "", initiatorName: "", securityCredential: "", clientId: "", clientSecret: "", webhookId: "" });
  // Declare query for use by the surrounding module or function.
  const query = useQuery({ queryKey: ["payment-gateways"], queryFn: listPaymentGateways });
  // Declare detailQuery for use by the surrounding module or function.
  const detailQuery = useQuery({ queryKey: ["payment-gateway", provider, form.environment], queryFn: () => getPaymentGateway(provider, form.environment), enabled: ["MPESA", "PAYPAL"].includes(provider) });
  // Declare configs for use by the surrounding module or function.
  const configs = Array.isArray(query.data?.data) ? query.data.data : Array.isArray(query.data) ? query.data : [];
  // Declare current for use by the surrounding module or function.
  const current = useMemo(() => configs.find((x) => String(x?.provider || "").toUpperCase() === provider), [configs, provider]);
  // Declare detail for use by the surrounding module or function.
  const detail = detailQuery.data?.data;
  // Declare isEnabled for use by the surrounding module or function.
  const isEnabled = provider === "PAYPAL" ? Boolean(detail?.checkoutAvailable) : provider === "MPESA" ? Boolean(detail?.enabled && detail?.environment === form.environment) : Boolean(current?.enabled);
  // Declare isConfigured for use by the surrounding module or function.
  const isConfigured = ["MPESA", "PAYPAL"].includes(provider) ? Boolean(detail?.configured) : Boolean(current?.configured);

  // Perform the side effect or state update expressed on the following line.
  useEffect(() => {
    // Check the condition (!["MPESA", "PAYPAL"].includes(provider) || !detailQuery.isSuccess) and run the matching branch.
    if (!["MPESA", "PAYPAL"].includes(provider) || !detailQuery.isSuccess) return;
    // Declare saved for use by the surrounding module or function.
    const saved = detailQuery.data?.data || {};
    // Check the condition (!initializedEnvironment.current && ["sandbox", "production"].includes() and run the matching branch.
    if (!initializedEnvironment.current && ["sandbox", "production"].includes(saved.activeEnvironment) && saved.activeEnvironment !== form.environment) {
      // Perform the side effect or state update expressed on the following line.
      initializedEnvironment.current = true;
      // Perform the side effect or state update expressed on the following line.
      setForm((formState) => ({ ...formState, environment: saved.activeEnvironment }));
      // Return the result to the caller.
      return;
    }
    // Perform the side effect or state update expressed on the following line.
    initializedEnvironment.current = true;
    // Perform the side effect or state update expressed on the following line.
    setForm((formState) => ({ ...formState, enabled: Boolean(saved.enabled && saved.environment === formState.environment), accountName: saved.accountName || "", shortcode: saved.shortcode || "", publicKey: saved.publicKey || "", merchantId: saved.merchantId || "", callbackUrl: saved.callbackUrl || "", webhookId: saved.webhookId || "", clientId: "", clientSecret: "", ...Object.fromEntries(secretFields.map((field) => [field, ""])) }));
  }, [provider, form.environment, detailQuery.data, detailQuery.isSuccess]);

  // Declare selectProvider for use by the surrounding module or function.
  const selectProvider = (id) => {
    // Perform the side effect or state update expressed on the following line.
    initializedEnvironment.current = false;
    // Perform the side effect or state update expressed on the following line.
    setValidationResult(null);
    // Perform the side effect or state update expressed on the following line.
    setProvider(id);
    // Declare item for use by the surrounding module or function.
    const item = configs.find((x) => String(x?.provider || "").toUpperCase() === id);
    // Perform the side effect or state update expressed on the following line.
    setForm((f) => ({ ...f, environment: item?.environment || "sandbox", enabled: Boolean(item?.enabled), accountName: item?.accountName || "", shortcode: item?.shortcode || "", publicKey: item?.publicKey || "", merchantId: item?.merchantId || "", callbackUrl: item?.callbackUrl || "", clientId: "", clientSecret: "", webhookId: "", ...Object.fromEntries(secretFields.map((k) => [k, ""])) }));
  };
  // Declare set for use by the surrounding module or function.
  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));
  // Declare save for use by the surrounding module or function.
  const save = useMutation({ mutationFn: () => savePaymentGateway(provider, form), onSuccess: () => { qc.invalidateQueries({ queryKey: ["payment-gateways"] }); qc.invalidateQueries({ queryKey: ["payment-gateway", provider, form.environment] }); toast.success(`${provider} gateway configuration saved securely.`); setForm((f) => Object.fromEntries(Object.entries(f).map(([k, v]) => [k, secretFields.includes(k) || k === "clientSecret" ? "" : v]))); }, onError: (e) => toast.error(e?.response?.data?.message || "Unable to save payment gateway.") });
  // Declare disable for use by the surrounding module or function.
  const disable = useMutation({ mutationFn: () => disablePaymentGateway(provider), onSuccess: () => { qc.invalidateQueries({ queryKey: ["payment-gateways"] }); set("enabled", false); toast.success(`${provider} gateway disabled.`); }, onError: (e) => toast.error(e?.response?.data?.message || "Unable to disable gateway.") });
  // Declare check for use by the surrounding module or function.
  const check = useMutation({ mutationFn: () => validatePaymentGateway(provider, form.environment), onSuccess: (result) => { setValidationResult(result.data || null); toast.info(result.data?.message || "Configuration check completed."); qc.invalidateQueries({ queryKey: ["payment-gateway", provider, form.environment] }); qc.invalidateQueries({ queryKey: ["payment-gateways"] }); }, onError: (e) => toast.error(e?.response?.data?.message || "Configuration check failed.") });

  // Declare visibleProviders for use by the surrounding module or function.
  const visibleProviders = mpesaOnly ? PROVIDERS.filter(({ id }) => id === "MPESA") : providerOnly ? PROVIDERS.filter(({ id }) => id === providerOnly) : PROVIDERS;
  // Return the expression shown below to the caller.
  return <section className="mt-6 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Tenant payment infrastructure</p><h2 className="mt-1 flex items-center gap-2 text-2xl font-bold"><ShieldCheck size={22}/> {mpesaOnly ? "M-Pesa Configuration" : "Payment gateways"}</h2><p className="mt-1 max-w-3xl text-sm text-slate-500">Configure encrypted, tenant-specific provider credentials. Secret values are never returned to the browser after they are saved.</p></div><div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold ${isEnabled ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-slate-100 text-slate-600"}`} aria-live="polite">{isEnabled ? <CheckCircle2 size={15}/> : <XCircle size={15}/>} {isEnabled ? "Enabled" : "Disabled"}</div></div>
    {["MPESA", "PAYPAL"].includes(provider) && detailQuery.isFetching && <p role="status" className="mt-4 rounded-xl bg-blue-50 px-4 py-3 text-sm text-blue-800">Loading saved settings for {form.environment}…</p>}
    {["MPESA", "PAYPAL"].includes(provider) && detailQuery.isError && <p role="alert" className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-900">Could not load saved settings. Check your access or connection, then retry.</p>}
    <div className="mt-6 grid gap-5 lg:grid-cols-[230px_1fr]"><div className="space-y-2">{visibleProviders.map(({ id, name, icon: Icon }) => { const item = configs.find((x) => String(x?.provider || "").toUpperCase() === id); const enabled = id === "PAYPAL" ? Boolean(detail?.checkoutAvailable) : id === "MPESA" ? Boolean(detail?.enabled && detail?.environment === form.environment) : Boolean(item?.enabled); return <button key={id} type="button" onClick={() => selectProvider(id)} className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left font-semibold ${provider === id ? "border-emerald-600 bg-emerald-50 text-emerald-800" : "border-slate-200 hover:bg-slate-50"}`}><Icon size={18}/><span className="min-w-0 flex-1">{name}</span><span className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold ${enabled ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-500"}`}>{enabled ? <CheckCircle2 size={13}/> : <XCircle size={13}/>} {enabled ? "Available" : "Unavailable"}</span></button>; })}</div>
      <div className="rounded-2xl border border-slate-200 p-5"><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-lg font-bold">{provider === "PAYPAL" ? "PayPal Orders API" : PROVIDERS.find((x) => x.id === provider)?.name}</h3><p className="text-sm text-slate-500">{PROVIDERS.find((x) => x.id === provider)?.help}</p></div><div className="flex items-center gap-2"><span className={`rounded-full px-3 py-1 text-xs font-bold ${isConfigured ? "bg-blue-50 text-blue-700" : "bg-slate-100 text-slate-500"}`}>{isConfigured ? "Configuration validated" : "Validation required"}</span><span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ${isEnabled ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"}`}>{isEnabled ? <CheckCircle2 size={14}/> : <XCircle size={14}/>} {isEnabled ? "Enabled" : "Disabled"}</span></div></div><div className="grid gap-4 md:grid-cols-2">{["MPESA", "PAYPAL"].includes(provider) && <label className="text-sm font-semibold">Environment<select value={form.environment} onChange={(e) => setForm((currentForm) => ({ ...currentForm, environment: e.target.value, enabled: false, shortcode: "", callbackUrl: "", webhookId: "", clientId: "", clientSecret: "", ...Object.fromEntries(secretFields.map((field) => [field, ""])) }))} className="mt-1 w-full rounded-xl border px-3 py-2"><option value="sandbox">Sandbox</option><option value="production">Production</option></select></label>}<label className="flex items-center gap-3 pt-6 text-sm font-semibold"><input type="checkbox" checked={form.enabled} onChange={(e) => set("enabled", e.target.checked)} className="h-4 w-4"/> Enable this gateway</label>{provider === "PAYPAL" ? <><label className="text-sm font-semibold">Merchant display name<input value={form.accountName} onChange={(e) => set("accountName", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label className="text-sm font-semibold">PayPal merchant ID (optional)<input value={form.merchantId} onChange={(e) => set("merchantId", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label className="text-sm font-semibold">Sandbox / Production Client ID {detail?.secretsConfigured?.clientId && <span className="text-emerald-700">(configured)</span>}<input value={form.clientId} onChange={(e) => set("clientId", e.target.value)} autoComplete="off" className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label className="text-sm font-semibold">Client secret {detail?.secretsConfigured?.clientSecret && <span className="text-emerald-700">(configured; blank preserves it)</span>}<div className="relative mt-1"><input type="password" autoComplete="new-password" value={form.clientSecret} onChange={(e) => set("clientSecret", e.target.value)} className="w-full rounded-xl border px-3 py-2 pr-10"/><EyeOff size={16} className="pointer-events-none absolute right-3 top-3 text-slate-400"/></div></label><label className="text-sm font-semibold md:col-span-2">PayPal Webhook ID<input value={form.webhookId} onChange={(e) => set("webhookId", e.target.value)} autoComplete="off" className="mt-1 w-full rounded-xl border px-3 py-2"/><span className="mt-1 block text-xs font-normal text-slate-500">Register the tenant webhook URL shown in the payment documentation for the selected environment.</span></label></> : <><label className="text-sm font-semibold">Account / merchant name<input value={form.accountName} onChange={(e) => set("accountName", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label className="text-sm font-semibold">Shortcode / merchant code<input value={form.shortcode} onChange={(e) => set("shortcode", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label className="text-sm font-semibold">Merchant ID<input value={form.merchantId} onChange={(e) => set("merchantId", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label className="text-sm font-semibold">Public key<input value={form.publicKey} onChange={(e) => set("publicKey", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><label className="text-sm font-semibold md:col-span-2">Callback URL<input type="url" value={form.callbackUrl} onChange={(e) => set("callbackUrl", e.target.value)} className="mt-1 w-full rounded-xl border px-3 py-2"/></label><div className="md:col-span-2 mt-5 rounded-2xl bg-slate-50 p-4"><div className="flex items-center gap-2 font-bold"><KeyRound size={17}/> Secure credentials</div><p className="mt-1 text-xs text-slate-500">Leave an existing secret blank to keep the encrypted value already stored.</p><div className="mt-3 grid gap-4 md:grid-cols-2">{secretFields.map((key) => <label key={key} className="text-sm font-semibold capitalize">{key.replace(/([A-Z])/g, " $1")} {detail?.secretsConfigured?.[key] && <span className="text-emerald-700">(configured)</span>}<div className="relative mt-1"><input type="password" autoComplete="new-password" value={form[key]} onChange={(e) => set(key, e.target.value)} className="w-full rounded-xl border px-3 py-2 pr-10"/><EyeOff size={16} className="pointer-events-none absolute right-3 top-3 text-slate-400"/></div></label>)}</div></div></>}</div>
        {provider === "PAYPAL" && <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">PayPal checkout is {detail?.checkoutAvailable ? "available for this tenant" : "not currently available"}. The selected currency is {detail?.tenantCurrency || "not configured"}. PayPal's Orders API currently requires a supported payment currency. Production checkout stays disabled until an actual successful Sandbox capture and verified webhook are recorded.</p>}
        {validationResult && <p role="status" className={`mt-4 rounded-xl p-3 text-sm ${validationResult.remoteVerified ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>{validationResult.message}</p>}
        <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={save.isPending || (["MPESA", "PAYPAL"].includes(provider) && detailQuery.isFetching)} onClick={() => save.mutate()} className="inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 font-semibold text-white disabled:opacity-50"><Save size={17}/> {save.isPending ? "Saving..." : "Save securely"}</button>{["MPESA", "PAYPAL"].includes(provider) && <button type="button" disabled={check.isPending || detailQuery.isFetching} onClick={() => check.mutate()} className="inline-flex items-center gap-2 rounded-xl border border-blue-200 px-5 py-2.5 font-semibold text-blue-800 disabled:opacity-40"><Wifi size={17}/>{check.isPending ? "Checking…" : "Validate configuration"}</button>}{isConfigured && <button type="button" disabled={disable.isPending || !isEnabled} onClick={() => disable.mutate()} className="inline-flex items-center gap-2 rounded-xl border border-red-200 px-5 py-2.5 font-semibold text-red-700 disabled:opacity-40"><Trash2 size={17}/> Disable gateway</button>}</div>
      </div></div>
  </section>;
}
