import { useQuery } from "@tanstack/react-query";
import api from "../../../api/axios";

const money = (n) => `KES ${Number(n || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (v) => v ? new Date(v).toLocaleDateString("en-KE") : "—";
const label = (v) => String(v || "tour").replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase());

function ErrorBox({ query, name }) {
  return query.isError ? <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><b>{name} unavailable.</b> The API request failed, so fallback zeros are not presented as accounting values.</div> : null;
}
function Empty({ name }) {
  return <div className="px-4 py-10 text-center"><p className="font-semibold text-slate-700">No posted {name.toLowerCase()} activity</p><p className="mt-1 text-sm text-slate-500">No qualifying records exist for this reporting period.</p></div>;
}
function Metric({ title, value }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-slate-900">{money(value)}</p></div>;
}

export default function AccountingControlReports() {
  const year = new Date().getFullYear();
  const from = `${year}-01-01`, to = `${year}-12-31`;
  const tax = useQuery({ queryKey: ["tax-control", year], queryFn: async () => (await api.get(`/admin/finance/accounting/tax-control?from=${from}&to=${to}`)).data, staleTime: 15000 });
  const customer = useQuery({ queryKey: ["customer-ledger", year], queryFn: async () => (await api.get(`/admin/finance/accounting/customer-ledger?from=${from}&to=${to}`)).data, staleTime: 15000 });
  const supplier = useQuery({ queryKey: ["supplier-ledger", year], queryFn: async () => (await api.get(`/admin/finance/accounting/supplier-ledger?from=${from}&to=${to}`)).data, staleTime: 15000 });
  const profitability = useQuery({ queryKey: ["profitability", year], queryFn: async () => (await api.get(`/admin/finance/accounting/profitability?from=${from}&to=${to}`)).data, staleTime: 15000 });
  const loading = [tax, customer, supplier, profitability].some(q => q.isLoading);
  const td = tax.data?.data, cd = customer.data?.data, sd = supplier.data?.data;
  const taxRows = td?.rows || [], customerRows = cd?.rows || [], supplierRows = sd?.rows || [], serviceRows = profitability.data?.data || [];

  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-6">
    <header className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 p-6 text-white shadow-lg sm:p-8"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">Accounting controls</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Tax, Ledgers &amp; Profitability</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/80">Read-only controls from tenant-scoped posted journals, invoices and completed payments. A zero means there is no qualifying activity; an API failure is never represented as zero.</p><p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs">Reporting period: {from} — {to}</p></header>
    <ErrorBox query={tax} name="Tax control report"/><ErrorBox query={customer} name="Customer ledger"/><ErrorBox query={supplier} name="Supplier ledger"/><ErrorBox query={profitability} name="Service billing report"/>
    {loading && <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-800">Loading accounting controls…</div>}
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Output VAT" value={td?.outputVat}/><Metric title="Input VAT" value={td?.inputVat}/><Metric title="Net VAT" value={td?.netVat}/><Metric title="WHT payable" value={td?.withholdingTaxPayable}/></section>
    <div className="grid gap-6 xl:grid-cols-2">
      {[["Customer ledger","Accounts receivable control account 1100",cd,customerRows,"customer"],["Supplier ledger","Accounts payable control account 2000",sd,supplierRows,"supplier"]].map(([title,sub,data,rows,type]) => <section key={title} className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><div className="flex items-start justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{sub}</p></div><div className="rounded-xl bg-emerald-50 px-3 py-2 text-right"><p className="text-xs text-emerald-700">Closing balance</p><p className="font-bold text-emerald-900">{money(data?.closingBalance)}</p></div></div></div><div className="overflow-x-auto">{rows.length ? <table className="min-w-[680px] w-full text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Date","Reference","Debit","Credit","Balance"].map(h=><th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={`${r._id||r.entryNumber||r.reference||"entry"}-${i}`} className="border-t border-slate-100 hover:bg-slate-50"><td className="px-4 py-3">{date(r.entryDate)}</td><td className="px-4 py-3 font-medium">{r.reference||r.entryNumber||"Journal entry"}</td><td className="px-4 py-3 text-right">{money(r.debit)}</td><td className="px-4 py-3 text-right">{money(r.credit)}</td><td className="px-4 py-3 text-right font-semibold">{money(r.balance)}</td></tr>)}</tbody></table> : <Empty name={type}/>}</div></section>)}
    </div>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold text-slate-900">Service billing &amp; collection</h2><p className="mt-1 text-sm text-slate-500">Invoiced, completed collections, refunds and net collection rate. This is not presented as profitability because service costs are not calculated here.</p></div><div className="overflow-x-auto">{serviceRows.length ? <table className="min-w-[800px] w-full text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Service","Invoiced","Collected","Refunded","Net collected","Net collection rate"].map(h=><th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead><tbody>{serviceRows.map(r=><tr key={r.serviceType} className="border-t border-slate-100"><td className="px-4 py-3 font-semibold">{label(r.serviceType)}</td><td className="px-4 py-3 text-right">{money(r.invoiced)}</td><td className="px-4 py-3 text-right">{money(r.collected)}</td><td className="px-4 py-3 text-right">{money(r.refunded)}</td><td className="px-4 py-3 text-right font-semibold">{money(r.netCollected)}</td><td className="px-4 py-3 text-right font-semibold text-emerald-700">{r.collectionRate == null ? "—" : `${r.collectionRate}%`}</td></tr>)}</tbody></table> : <Empty name="service billing"/>}</div></section>
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"><div className="border-b border-slate-100 p-5"><h2 className="text-lg font-bold text-slate-900">Tax control accounts</h2><p className="mt-1 text-sm text-slate-500">Posted journal balances for tax and statutory liability accounts only.</p></div><div className="p-5">{taxRows.length ? <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{taxRows.map(r=><div key={r.code} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="font-semibold">{r.code} — {r.name}</p><p className="mt-2 text-xs text-slate-500">Debit {money(r.debit)} · Credit {money(r.credit)}</p><p className="mt-1 font-bold text-emerald-800">Balance {money(r.balance)}</p></div>)}</div> : <Empty name="tax"/>}</div></section>
  </div></main>;
}
