/**
 * Purpose: Mpesa Configuration page-level UI component. Main declarations: MpesaConfiguration, update, submit, ready, PanelHeader.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useEffect, useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import { CreditCard, Banknote, Building2, Smartphone, Wifi } from "lucide-react";
// Load react-toastify so this module can use its exported dependencies.
import { toast } from "react-toastify";
// Load ../../components/admin/PaymentGatewayCenter so this module can use its exported dependencies.
import PaymentGatewayCenter from "../../components/admin/PaymentGatewayCenter";
// Load ../../api/settingsApi so this module can use its exported dependencies.
import { getSettings, updateSettings } from "../../api/settingsApi";
// Load ../../api/axios so this module can use its exported dependencies.
import api from "../../api/axios";

// Declare tabs for use by the surrounding module or function.
const tabs = [
  ["MPESA", "M-Pesa", Smartphone], ["BANK", "Bank transfer", Building2],
  ["STRIPE", "Card payments", CreditCard], ["CASH", "Cash", Banknote], ["PAYPAL", "PayPal", CreditCard],
];
// Declare defaults for use by the surrounding module or function.
const defaults = { enableBankTransfer: false, bankName: "", bankAccountName: "", bankAccountNumber: "", bankBranch: "", bankSwiftCode: "", bankInstructions: "", bankReferenceInstructions: "", enableCash: false, cashCollectionLocation: "", cashInstructions: "", cashReceiptRequired: false, enableStripe: false };

// Define MpesaConfiguration; its parameters and body implement this operation.
export default function MpesaConfiguration() {
  // Declare qc for use by the surrounding module or function.
  const qc = useQueryClient();
  // Declare [tab, setTab] for use by the surrounding module or function.
  const [tab, setTab] = useState("MPESA");
  // Declare [settings, setSettings] for use by the surrounding module or function.
  const [settings, setSettings] = useState(defaults);
  // Declare [stripeCheck, setStripeCheck] for use by the surrounding module or function.
  const [stripeCheck, setStripeCheck] = useState(null);
  // Declare query for use by the surrounding module or function.
  const query = useQuery({ queryKey: ["payment-center-settings"], queryFn: getSettings });
  // Perform the side effect or state update expressed on the following line.
  useEffect(() => { const saved = query.data?.data || query.data?.settings; if (saved) setSettings((s) => ({ ...s, ...saved })); }, [query.data]);
  // Declare save for use by the surrounding module or function.
  const save = useMutation({ mutationFn: updateSettings, onSuccess: async (r) => { const saved = r?.data || r?.settings || {}; setSettings((s) => ({ ...s, ...saved })); await qc.invalidateQueries({ queryKey: ["payment-center-settings"] }); await qc.invalidateQueries({ queryKey: ["public-system-settings"] }); toast.success("Payment settings saved for this tenant."); }, onError: (e) => toast.error(e?.response?.data?.message || "Unable to save tenant payment settings.") });
  // Declare validateStripe for use by the surrounding module or function.
  const validateStripe = useMutation({ mutationFn: async () => (await api.post("/admin/payment-gateways/STRIPE/validate")).data, onSuccess: (r) => setStripeCheck(r?.data), onError: () => setStripeCheck({ status: "unverified", message: "Stripe could not be reached. Connectivity remains unverified." }) });
  // Declare update for use by the surrounding module or function.
  const update = (key, value) => setSettings((s) => ({ ...s, [key]: value }));
  // Declare submit for use by the surrounding module or function.
  const submit = (e) => { e.preventDefault(); const fields = tab === "BANK" ? ["enableBankTransfer", "bankName", "bankAccountName", "bankAccountNumber", "bankBranch", "bankSwiftCode", "bankInstructions", "bankReferenceInstructions"] : tab === "STRIPE" ? ["enableStripe"] : ["enableCash", "cashCollectionLocation", "cashInstructions", "cashReceiptRequired"]; save.mutate(Object.fromEntries(fields.map((key) => [key, settings[key]]))); };
  // Declare ready for use by the surrounding module or function.
  const ready = (key) => {
    // Check the condition (!settings[key]) and run the matching branch.
    if (!settings[key]) return "Disabled";
    // Declare complete for use by the surrounding module or function.
    const complete = key === "enableBankTransfer"
      ? Boolean(settings.bankName?.trim() && settings.bankAccountName?.trim() && /^[A-Za-z0-9][A-Za-z0-9 -]{4,33}$/.test(String(settings.bankAccountNumber || "").trim()) && settings.bankInstructions?.trim())
      : Boolean(settings.cashCollectionLocation?.trim() && settings.cashInstructions?.trim());
    // Return the expression shown below to the caller.
    return complete ? "Configured · manual confirmation required" : "Validation required · checkout unavailable";
  };

  // Return the expression shown below to the caller.
  return <div className="mx-auto max-w-7xl space-y-5">
    <header className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-slate-200 sm:p-8"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-700">Tenant settings</p><h1 className="mt-1 text-2xl font-bold text-slate-900 sm:text-3xl">M-Pesa Configuration</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">Payment Configuration Center · settings apply to the current tenant only. Enabled does not mean provider connectivity or payment completion has been verified.</p><p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">Scope: {query.isLoading ? "Loading tenant…" : settings.companyName || "Current tenant"}</p></header>
    {query.isError && <div role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">Tenant settings could not be loaded. Check your access or connection, then <button type="button" onClick={() => query.refetch()} className="font-bold underline">retry</button>.</div>}
    <section className="rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-200 sm:p-7">
      <div role="tablist" aria-label="Payment methods" className="flex gap-2 overflow-x-auto pb-2">{tabs.map(([id, name, Icon]) => <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)} className={`inline-flex shrink-0 items-center gap-2 rounded-xl border px-4 py-3 font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-600 ${tab === id ? "border-emerald-700 bg-emerald-50 text-emerald-900" : "border-slate-200 text-slate-600 hover:bg-slate-50"}`}><Icon size={17}/>{name}</button>)}</div>
      {tab === "MPESA" && <><PaymentGatewayCenter mpesaOnly /><MpesaSandboxBookingLookup /></>}
      {tab === "BANK" && <form onSubmit={submit} className="mt-5 space-y-5"><PanelHeader title="Bank transfer" status={ready("enableBankTransfer")} detail="Customers receive these payment instructions. Transfers remain pending until authorized staff confirm receipt."/><div className="grid gap-4 sm:grid-cols-2">{[["bankName","Bank name"],["bankAccountName","Beneficiary / account name"],["bankAccountNumber","Account number"],["bankBranch","Branch"],["bankSwiftCode","SWIFT / BIC (optional)"],["bankReferenceInstructions","Reference instructions"]].map(([key,label])=><label key={key} className="text-sm font-semibold text-slate-700">{label}<input value={settings[key] || ""} onChange={(e)=>update(key,e.target.value)} required={Boolean(settings.enableBankTransfer) && key !== "bankSwiftCode" && key !== "bankBranch" && key !== "bankReferenceInstructions"} maxLength={key === "bankAccountNumber" ? 34 : 120} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"/></label>)}<label className="text-sm font-semibold text-slate-700 sm:col-span-2">Customer instructions<textarea value={settings.bankInstructions || ""} onChange={(e)=>update("bankInstructions",e.target.value)} required={Boolean(settings.enableBankTransfer)} rows={3} maxLength={1000} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"/></label></div><Toggle checked={settings.enableBankTransfer} onChange={(v)=>update("enableBankTransfer",v)} label="Offer bank transfer at checkout"/><SaveButton busy={save.isPending} disabled={query.isLoading || query.isError}/></form>}
      {tab === "STRIPE" && <form onSubmit={submit} className="mt-5 space-y-5"><PanelHeader title="Card payments · Stripe" status={stripeCheck?.status === "connected" ? "Connection verified" : settings.enableStripe ? "Enabled · validation required" : "Disabled"} detail="Stripe API credentials are deployment-managed in STRIPE_SECRET_KEY. Tenant admins cannot view or replace platform credentials."/><div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">Validation checks the Stripe account API only. It does not create a payment or verify a completed checkout.</div><Toggle checked={settings.enableStripe} onChange={(v)=>update("enableStripe",v)} label="Offer card payments at checkout"/><div className="flex flex-wrap gap-3"><SaveButton busy={save.isPending} disabled={query.isLoading || query.isError}/><button type="button" disabled={validateStripe.isPending} onClick={()=>validateStripe.mutate()} className="inline-flex items-center gap-2 rounded-xl border border-blue-300 px-5 py-3 font-semibold text-blue-900 disabled:opacity-50"><Wifi size={17}/>{validateStripe.isPending ? "Checking…" : "Validate Stripe connectivity"}</button></div>{stripeCheck && <p aria-live="polite" className="rounded-xl bg-slate-50 p-4 text-sm">{stripeCheck.message} · {stripeCheck.timestamp ? new Date(stripeCheck.timestamp).toLocaleString() : ""}</p>}</form>}
      {tab === "CASH" && <form onSubmit={submit} className="mt-5 space-y-5"><PanelHeader title="Cash payments" status={ready("enableCash")} detail="Cash is confirmed by authorized staff after they receive it. Selecting cash never marks a booking paid."/><label className="block text-sm font-semibold text-slate-700">Collection location<input value={settings.cashCollectionLocation || ""} onChange={(e)=>update("cashCollectionLocation",e.target.value)} required={Boolean(settings.enableCash)} maxLength={200} placeholder="Office or authorized collection point" className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"/></label><label className="block text-sm font-semibold text-slate-700">Customer instructions<textarea value={settings.cashInstructions || ""} onChange={(e)=>update("cashInstructions",e.target.value)} required={Boolean(settings.enableCash)} rows={3} maxLength={1000} className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2.5"/></label><Toggle checked={settings.cashReceiptRequired} onChange={(v)=>update("cashReceiptRequired",v)} label="Require a receipt/reference during staff confirmation"/><Toggle checked={settings.enableCash} onChange={(v)=>update("enableCash",v)} label="Offer cash at checkout"/><SaveButton busy={save.isPending} disabled={query.isLoading || query.isError}/></form>}
      {tab === "PAYPAL" && <div className="mt-5"><PaymentGatewayCenter providerOnly="PAYPAL" initialProvider="PAYPAL"/><p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">PayPal requires an actual Sandbox capture and verified webhook before Production checkout is allowed. PayPal's Orders API does not accept KES; no conversion is applied automatically.</p></div>}
    </section>
  </div>;
}

// Define the authenticated, read-only Sandbox booking candidate lookup.
function MpesaSandboxBookingLookup() {
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const load = async () => {
    setBusy(true);
    setError("");
    try {
      const response = await api.get("/admin/bookings/mpesa-sandbox-candidates");
      const rows = response?.data?.data?.bookings || response?.data?.bookings || [];
      setItems(Array.isArray(rows) ? rows : []);
      setLoaded(true);
    } catch (e) {
      const status = e?.response?.status;
      setError(status === 401
        ? "Your administrator session is not active. Sign in again, then retry here."
        : status === 403
          ? "This lookup is available to tenant administrators only."
          : e?.response?.data?.message || "Could not load eligible bookings. Check your connection and retry.");
    } finally {
      setBusy(false);
    }
  };
  return <section className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 sm:p-5">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h3 className="text-lg font-bold text-slate-900">Sandbox test booking</h3><p className="mt-1 max-w-2xl text-sm text-slate-600">Find an existing unpaid booking for the controlled M-Pesa Sandbox test. This lookup is read-only and does not send a payment prompt.</p></div>
      <button type="button" onClick={load} disabled={busy} className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Loading…" : loaded ? "Refresh bookings" : "Find eligible bookings"}</button>
    </div>
    {error && <p role="alert" className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    {loaded && !error && items.length === 0 && <p role="status" className="mt-4 rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700">No eligible unpaid bookings were found for this tenant.</p>}
    {items.length > 0 && <div className="mt-4 grid gap-3 md:grid-cols-2">{items.map((booking) => <article key={booking.bookingId || booking._id} className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Booking</p><p className="mt-1 break-all font-bold text-slate-900">{booking.bookingNumber || booking.bookingId || booking._id}</p></div><span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800">{booking.paymentStatus || "pending"}</span></div>
      <dl className="mt-3 grid grid-cols-2 gap-3 text-sm"><div><dt className="text-slate-500">Total</dt><dd className="font-semibold text-slate-900">KES {Number(booking.totalAmount || 0).toLocaleString()}</dd></div><div><dt className="text-slate-500">Paid</dt><dd className="font-semibold text-slate-900">KES {Number(booking.amountPaid || 0).toLocaleString()}</dd></div><div><dt className="text-slate-500">Amount due</dt><dd className="font-bold text-emerald-800">KES {Number(booking.amountDue || 0).toLocaleString()}</dd></div><div><dt className="text-slate-500">Booking status</dt><dd className="font-semibold capitalize text-slate-900">{String(booking.bookingStatus || "pending").replace(/_/g, " ")}</dd></div></dl>
      <button type="button" onClick={() => { const id = booking.bookingId || booking._id; if (id) navigator.clipboard?.writeText(String(id)).then(() => toast.success("Booking ID copied."), () => toast.error("Could not copy booking ID.")); }} className="mt-3 rounded-lg border border-slate-300 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Copy booking ID</button>
    </article>)}</div>}
    {loaded && <p className="mt-3 text-xs text-slate-500">Use the booking ID with the authorized Sandbox checkout flow. No payment has been initiated.</p>}
  </section>;
}

// Define PanelHeader; its parameters and body implement this operation.
function PanelHeader({ title, status, detail }) { return <div className="mb-5"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold text-slate-900">{title}</h2><span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">{status}</span></div><p className="mt-2 text-sm leading-6 text-slate-600">{detail}</p></div>; }
// Define Toggle; its parameters and body implement this operation.
function Toggle({ checked, onChange, label }) { return <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl border border-slate-200 p-4"><span className="font-semibold">{label}</span><input type="checkbox" checked={Boolean(checked)} onChange={(e)=>onChange(e.target.checked)} className="h-5 w-5 accent-emerald-700"/></label>; }
// Define SaveButton; its parameters and body implement this operation.
function SaveButton({ busy, disabled = false }) { return <button type="submit" disabled={busy || disabled} className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white disabled:opacity-50">{busy ? "Saving…" : "Save tenant settings"}</button>; }
