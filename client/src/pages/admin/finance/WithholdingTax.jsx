/**
 * Purpose: Withholding Tax page-level UI component. Main declarations: money, display, initialForm, WithholdingTax, metricMoney.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import { useState } from "react";
// Load @tanstack/react-query so this module can use its exported dependencies.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
// Load lucide-react so this module can use its exported dependencies.
import { AlertCircle, CheckCircle2, ExternalLink, Eye, FileText, LockKeyhole, Percent, Plus, RefreshCw, ShieldCheck, X } from "lucide-react";
// Load ../../../api/axios so this module can use its exported dependencies.
import api from "../../../api/axios";

// Declare money for use by the surrounding module or function.
const money = (n) => `KES ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
// Declare display for use by the surrounding module or function.
const display = (value, fallback = "Not provided") => value === null || value === undefined || value === "" ? fallback : String(value);

// Declare initialForm for use by the surrounding module or function.
const initialForm = () => ({
  payeeName: "",
  payeePin: "",
  reference: "",
  period: new Date().toISOString().slice(0, 7),
  baseAmount: "",
  rate: "",
  sourceType: "supplier_payment",
});

// Define WithholdingTax; its parameters and body implement this operation.
export default function WithholdingTax() {
  // Declare qc for use by the surrounding module or function.
  const qc = useQueryClient();
  // Declare [selected, setSelected] for use by the surrounding module or function.
  const [selected, setSelected] = useState(null);
  // Declare [remitRef, setRemitRef] for use by the surrounding module or function.
  const [remitRef, setRemitRef] = useState({});
  // Declare [form, setForm] for use by the surrounding module or function.
  const [form, setForm] = useState(initialForm);

  // Declare q for use by the surrounding module or function.
  const q = useQuery({
    queryKey: ["wht"],
    queryFn: async () => (await api.get("/admin/finance/withholding-tax")).data,
    retry: false,
  });

  // Declare create for use by the surrounding module or function.
  const create = useMutation({
    mutationFn: () => api.post("/admin/finance/withholding-tax", {
      ...form,
      taxPeriod: form.period,
      baseAmount: Number(form.baseAmount),
      rate: Number(form.rate),
    }),
    onSuccess: () => {
      // Perform the side effect or state update expressed on the following line.
      qc.invalidateQueries({ queryKey: ["wht"] });
      // Perform the side effect or state update expressed on the following line.
      setForm(initialForm());
    },
  });

  // Declare remit for use by the surrounding module or function.
  const remit = useMutation({
    mutationFn: ({ id, reference }) => api.post(`/admin/finance/withholding-tax/${id}/remit`, { paymentReference: reference }),
    onSuccess: () => {
      // Perform the side effect or state update expressed on the following line.
      qc.invalidateQueries({ queryKey: ["wht"] });
      // Perform the side effect or state update expressed on the following line.
      setRemitRef({});
    },
  });

  // Declare rows for use by the surrounding module or function.
  const rows = q.data?.data || [];
  // Declare totals for use by the surrounding module or function.
  const totals = q.data?.totals || {};
  // Declare statusCode for use by the surrounding module or function.
  const statusCode = q.error?.response?.status;
  // Declare errorData for use by the surrounding module or function.
  const errorData = q.error?.response?.data || {};
  // Declare isLocked for use by the surrounding module or function.
  const isLocked = statusCode === 403 && errorData.code === "PLAN_FEATURE_LOCKED";
  // Declare currentPlan for use by the surrounding module or function.
  const currentPlan = String(errorData.plan || "professional").replace(/_/g, " ");
  // Declare errorMessage for use by the surrounding module or function.
  const errorMessage = errorData.message || "Unable to load withholding-tax records.";
  // Declare canSubmit for use by the surrounding module or function.
  const canSubmit = !isLocked && !create.isPending && Number(form.baseAmount) > 0 && Number(form.rate) > 0 && Number(form.rate) <= 100 && form.payeeName.trim() && form.reference.trim() && /^\d{4}-(0[1-9]|1[0-2])$/.test(form.period);
  // Declare metricValue for use by the surrounding module or function.
  const metricValue = q.isError ? "—" : rows.length;
  // Declare metricMoney for use by the surrounding module or function.
  const metricMoney = (value) => q.isError ? "—" : money(value);

  // Return the expression shown below to the caller.
  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <header className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
          <div className="relative overflow-hidden bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-950 px-5 py-7 text-white md:px-8 md:py-8">
            <div className="absolute -right-16 -top-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-2xl" />
            <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/15 shadow-inner"><ShieldCheck size={25} /></div>
                <div>
                  <p className="text-[11px] font-extrabold uppercase tracking-[0.2em] text-emerald-300">Tax control</p>
                  <h1 className="mt-1 text-2xl font-black tracking-tight md:text-3xl">Withholding Tax</h1>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-300">Tenant-scoped accrual, payable, certificate and remittance tracking. Only actual payment and remittance references are recorded.</p>
                </div>
              </div>
              <button type="button" onClick={() => q.refetch()} disabled={q.isFetching} className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/10 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-white/15 disabled:cursor-not-allowed disabled:opacity-60">
                <RefreshCw size={16} className={q.isFetching ? "animate-spin" : ""} /> {q.isFetching ? "Refreshing…" : "Refresh records"}
              </button>
            </div>
          </div>
          <div className="grid gap-4 p-5 md:grid-cols-3 md:p-6">
            <Metric icon={FileText} title="Records" value={metricValue} hint={q.isError ? "Data unavailable" : "Stored WHT entries"} />
            <Metric icon={Percent} title="Tax accrued" value={metricMoney(totals.accrued)} hint={q.isError ? "Data unavailable" : "Accrued tax liability"} />
            <Metric icon={CheckCircle2} title="Tax remitted" value={metricMoney(totals.remitted)} hint={q.isError ? "Data unavailable" : "Confirmed remittances"} />
          </div>
        </header>

        {isLocked ? (
          <section className="overflow-hidden rounded-3xl border border-amber-200 bg-white shadow-sm">
            <div className="flex flex-col gap-5 bg-gradient-to-r from-amber-50 via-white to-emerald-50 p-6 md:flex-row md:items-center md:justify-between md:p-7">
              <div className="flex gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-100 text-amber-700 ring-1 ring-amber-200"><LockKeyhole size={20} /></div>
                <div>
                  <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-amber-700">Subscription entitlement</p>
                  <h2 className="mt-1 text-xl font-black text-slate-950">Withholding Tax is locked</h2>
                  <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">Your workspace is currently on the <span className="font-bold capitalize text-slate-900">{currentPlan}</span> plan. WHT workflows are available on the Business and Enterprise plans.</p>
                </div>
              </div>
              <a href="/admin/billing" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-800">Review subscription <ExternalLink size={15} /></a>
            </div>
            <div className="border-t border-amber-100 bg-amber-50/50 px-6 py-4 text-xs leading-5 text-amber-900 md:px-7">No WHT records were queried or displayed because the API correctly rejected access at the plan-entitlement layer. The dashboard does not show fabricated zero balances for a locked feature.</div>
          </section>
        ) : q.isError ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800 shadow-sm">
            <AlertCircle className="mt-0.5 shrink-0" size={19} />
            <div><p className="font-bold">We could not load the WHT register</p><p className="mt-0.5 text-red-700">{errorMessage}</p><button type="button" onClick={() => q.refetch()} className="mt-2 font-extrabold underline underline-offset-2 hover:no-underline">Try again</button></div>
          </div>
        ) : null}

        <section className={`rounded-3xl border bg-white p-5 shadow-sm md:p-6 ${isLocked ? "border-slate-200 opacity-70" : "border-slate-200"}`}>
          <div className="mb-5 flex items-start gap-3">
            <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${isLocked ? "bg-slate-100 text-slate-400" : "bg-emerald-50 text-emerald-700"}`}><Plus size={20} /></div>
            <div><h2 className="text-lg font-black text-slate-900">Record withholding tax</h2><p className="mt-1 text-sm text-slate-500">Create a tenant-scoped accrual using the actual payee and tax values.</p></div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Field disabled={isLocked} label="Payee name" required value={form.payeeName} onChange={(v) => setForm({ ...form, payeeName: v })} placeholder="Supplier or payee name" />
            <Field disabled={isLocked} label="Payee PIN" value={form.payeePin} onChange={(v) => setForm({ ...form, payeePin: v })} placeholder="KRA PIN, if provided" />
            <Field disabled={isLocked} label="Reference" required value={form.reference} onChange={(v) => setForm({ ...form, reference: v })} placeholder="Actual internal reference" />
            <Field disabled={isLocked} label="Period" required type="month" value={form.period} onChange={(v) => setForm({ ...form, period: v })} />
            <Field disabled={isLocked} label="Taxable base" required type="number" min="0" step="0.01" value={form.baseAmount} onChange={(v) => setForm({ ...form, baseAmount: v })} placeholder="0.00" />
            <Field disabled={isLocked} label="Rate %" required type="number" min="0" max="100" step="0.01" value={form.rate} onChange={(v) => setForm({ ...form, rate: v })} placeholder="0.00" />
          </div>
          <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="text-xs font-extrabold uppercase tracking-wide text-emerald-800">Calculated tax</p><p className="mt-1 text-xl font-black text-slate-900">{isLocked ? "—" : money((Number(form.baseAmount) || 0) * ((Number(form.rate) || 0) / 100))}</p></div>
            <button type="button" onClick={() => create.mutate()} disabled={!canSubmit} className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-emerald-800 disabled:cursor-not-allowed disabled:bg-slate-300">
              {create.isPending ? <RefreshCw size={16} className="animate-spin" /> : <Plus size={16} />} {create.isPending ? "Recording…" : "Record WHT"}
            </button>
          </div>
          {create.isError && <InlineError message={create.error?.response?.data?.message || "Unable to record withholding tax."} />}
        </section>

        <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 p-5 md:flex-row md:items-center md:justify-between md:p-6">
            <div><h2 className="text-lg font-black text-slate-900">WHT register</h2><p className="mt-1 text-sm text-slate-500">Inspect stored tax, source and remittance data without modifying the underlying record.</p></div>
            <span className="inline-flex w-fit items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-extrabold text-slate-600"><FileText size={14} /> {isLocked ? "Access restricted" : `${rows.length} ${rows.length === 1 ? "record" : "records"}`}</span>
          </div>
          {q.isLoading ? <LoadingState /> : isLocked ? <RestrictedRegister /> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-sm"><thead className="bg-slate-50"><tr>{["Payee","Period","Taxable base","Rate","Tax","Status","Action"].map((h) => <th key={h} className="whitespace-nowrap p-4 text-left text-[11px] font-extrabold uppercase tracking-wider text-slate-500">{h}</th>)}</tr></thead><tbody>{rows.length ? rows.map((x) => <tr key={x._id} className="border-t border-slate-100 transition hover:bg-emerald-50/30"><td className="p-4"><p className="font-bold text-slate-900">{display(x.payeeName)}</p><p className="mt-0.5 text-xs text-slate-500">{display(x.payeePin, "No PIN provided")}</p></td><td className="p-4 font-semibold text-slate-700">{display(x.taxPeriod || x.period)}</td><td className="p-4 text-slate-700">{money(x.baseAmount)}</td><td className="p-4 text-slate-700">{display(x.rate, "0")}%</td><td className="p-4 font-black text-slate-900">{money(x.taxAmount)}</td><td className="p-4"><Status status={x.status} /></td><td className="p-4"><div className="flex min-w-[360px] flex-wrap items-center gap-2"><button type="button" onClick={() => setSelected(x)} className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800"><Eye size={14} /> View source</button>{x.status !== "remitted" && x.status !== "cancelled" && <><input aria-label={`Remittance reference for ${x.payeeName}`} placeholder="Actual remittance reference" value={remitRef[x._id] || ""} onChange={(e) => setRemitRef({ ...remitRef, [x._id]: e.target.value })} className="w-48 rounded-lg border border-slate-300 px-2.5 py-2 text-xs outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100" /><button type="button" disabled={!remitRef[x._id]?.trim() || remit.isPending} onClick={() => remit.mutate({ id: x._id, reference: remitRef[x._id].trim() })} className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-extrabold text-emerald-800 transition hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50">{remit.isPending ? "Saving…" : "Mark remitted"}</button></>}</div></td></tr>) : <EmptyState />}</tbody></table></div>}
          {remit.isError && <div className="border-t border-red-100 px-5 py-4"><InlineError message={remit.error?.response?.data?.message || "Unable to mark the WHT record as remitted."} /></div>}
        </section>
      </div>
      {selected && <SourceDrawer record={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// Define Field; its parameters and body implement this operation.
function Field({ label, required, type = "text", value, onChange, placeholder, min, max, step, disabled = false }) {
  // Return the expression shown below to the caller.
  return <label className={`block text-xs font-extrabold ${disabled ? "text-slate-400" : "text-slate-600"}`}>{label}{required && <span className="ml-1 text-emerald-700">*</span>}<input disabled={disabled} type={type} value={value} min={min} max={max} step={step} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-100/70 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400" /></label>;
}
// Define Metric; its parameters and body implement this operation.
function Metric({ icon: Icon, title, value, hint }) { return <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5"><div className="flex items-center justify-between"><span className="text-sm font-bold text-slate-600">{title}</span><span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-emerald-700 shadow-sm ring-1 ring-slate-200"><Icon size={17} /></span></div><p className="mt-3 text-2xl font-black tracking-tight text-slate-950">{value}</p><p className="mt-1 text-xs text-slate-500">{hint}</p></div>; }
// Define Status; its parameters and body implement this operation.
function Status({ status }) { const styles = status === "remitted" ? "bg-emerald-100 text-emerald-800 ring-emerald-200" : status === "cancelled" ? "bg-slate-100 text-slate-600 ring-slate-200" : "bg-amber-100 text-amber-800 ring-amber-200"; return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-extrabold capitalize ring-1 ${styles}`}>{display(status)}</span>; }
// Define InlineError; its parameters and body implement this operation.
function InlineError({ message }) { return <div className="mt-3 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-bold text-red-800"><AlertCircle size={15} /> {message}</div>; }
// Define LoadingState; its parameters and body implement this operation.
function LoadingState() { return <div className="p-12 text-center"><RefreshCw size={22} className="mx-auto animate-spin text-emerald-700" /><p className="mt-3 text-sm font-bold text-slate-700">Loading withholding-tax records…</p><p className="mt-1 text-xs text-slate-500">Checking the tenant finance ledger.</p></div>; }
// Define RestrictedRegister; its parameters and body implement this operation.
function RestrictedRegister() { return <div className="p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><LockKeyhole size={21} /></div><p className="mt-4 font-bold text-slate-700">Register unavailable on the current plan</p><p className="mx-auto mt-1 max-w-lg text-sm leading-6 text-slate-500">Upgrade the workspace subscription to Business or Enterprise to access WHT records and remittance workflows.</p></div>; }
// Define EmptyState; its parameters and body implement this operation.
function EmptyState() { return <tr><td colSpan="7" className="p-12 text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400"><FileText size={22} /></div><p className="mt-4 font-bold text-slate-700">No withholding-tax records yet</p><p className="mt-1 text-sm text-slate-500">Recorded WHT entries will appear here with their actual stored values.</p></td></tr>; }

// Define SourceDrawer; its parameters and body implement this operation.
function SourceDrawer({ record, onClose }) {
  // Return the expression shown below to the caller.
  return <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/50 backdrop-blur-[2px]" role="dialog" aria-modal="true" aria-label="Withholding tax source details" onMouseDown={(e) => e.target === e.currentTarget && onClose()}><aside className="h-full w-full max-w-xl overflow-y-auto bg-white p-5 shadow-2xl md:p-7"><div className="flex items-start justify-between border-b border-slate-200 pb-5"><div><p className="text-xs font-extrabold uppercase tracking-[0.16em] text-emerald-700">Tax control · Source data</p><h2 className="mt-1 text-2xl font-black text-slate-950">{display(record.reference)}</h2><p className="mt-1 text-sm text-slate-500">Read-only inspection of the stored withholding-tax record.</p></div><button type="button" onClick={onClose} className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900" aria-label="Close"><X size={20} /></button></div><div className="mt-5 grid gap-3 sm:grid-cols-2"><Detail label="Record ID" value={record._id} /><Detail label="Tenant ID" value={record.tenantId} /><Detail label="Payee" value={record.payeeName} /><Detail label="Payee PIN" value={record.payeePin} /><Detail label="Period" value={record.taxPeriod || record.period} /><Detail label="Reference" value={record.reference} /><Detail label="Source type" value={record.source?.type || record.sourceType} /><Detail label="Source ID" value={record.source?.id || record.sourceId} /><Detail label="Source reference" value={record.source?.reference} /><Detail label="Taxable base" value={money(record.baseAmount)} /><Detail label="Rate" value={`${display(record.rate, "0")}%`} /><Detail label="Tax amount" value={money(record.taxAmount)} /><Detail label="Status" value={record.status} /><Detail label="Payment reference" value={record.paymentReference || record.source?.paymentReference} /><Detail label="Certificate number" value={record.certificateNumber || record.source?.certificateNumber} /><Detail label="Remitted at" value={record.remittedAt ? new Date(record.remittedAt).toLocaleString() : "Not remitted"} /><Detail label="Created" value={record.createdAt ? new Date(record.createdAt).toLocaleString() : "Not available"} /></div><div className="mt-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><strong>Audit note:</strong> Values shown here come from the tenant-scoped WHT API. No KRA, payment or certificate reference is invented, and this view does not modify the record.</div><div className="mt-5"><a href={record.sourceId ? `/admin/finance/transactions?sourceId=${encodeURIComponent(record.sourceId)}` : "/admin/finance/transactions"} className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-bold text-slate-700 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-800">Open related finance transactions <ExternalLink size={15} /></a></div></aside></div>;
}
// Define Detail; its parameters and body implement this operation.
function Detail({ label, value }) { return <div className="rounded-xl border border-slate-200 bg-slate-50 p-3"><p className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500">{label}</p><p className="mt-1 break-all text-sm font-semibold text-slate-900">{display(value)}</p></div>; }
