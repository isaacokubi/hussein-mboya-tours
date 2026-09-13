import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getReports, getFinancialStatements, getArAging, getApAging, getCashFlow } from "../../../api/financeApi";

const money = (value) => `KES ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const Card = ({ title, value, hint }) => <div className="rounded-xl border bg-white p-5 shadow-sm"><p className="text-sm text-gray-500">{title}</p><p className="mt-1 text-2xl font-bold">{value}</p>{hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}</div>;
const Rows = ({ rows = [], empty = "No data" }) => <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-3 text-left">Code</th><th className="p-3 text-left">Account</th><th className="p-3 text-right">Amount</th></tr></thead><tbody>{rows.length ? rows.map((row) => <tr key={`${row.code}-${row.name}`} className="border-t"><td className="p-3">{row.code}</td><td className="p-3">{row.name}</td><td className="p-3 text-right font-medium">{money(row.amount)}</td></tr>) : <tr><td colSpan="3" className="p-6 text-center text-gray-500">{empty}</td></tr>}</tbody></table></div>;
const Aging = ({ buckets = {} }) => <div className="grid grid-cols-2 gap-3 md:grid-cols-5">{[["Current", "current"], ["1–30 days", "1_30"], ["31–60 days", "31_60"], ["61–90 days", "61_90"], ["90+ days", "90_plus"]].map(([label, key]) => <div key={key} className="rounded-lg border p-3"><p className="text-xs text-gray-500">{label}</p><p className="mt-1 font-semibold">{money(buckets[key])}</p></div>)}</div>;

export default function FinanceReports() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const params = { ...(from ? { from } : {}), ...(to ? { to } : {}) };
  const statements = useQuery({ queryKey: ["financialStatements", params], queryFn: () => getFinancialStatements(params) });
  const ar = useQuery({ queryKey: ["arAging", params], queryFn: () => getArAging(params) });
  const ap = useQuery({ queryKey: ["apAging", params], queryFn: () => getApAging(params) });
  const cash = useQuery({ queryKey: ["cashFlow", params], queryFn: () => getCashFlow(params) });
  const reports = useQuery({ queryKey: ["financeReports", params], queryFn: () => getReports(params) });
  const data = statements.data?.data || {};
  const pnl = data.profitAndLoss || {};
  const bs = data.balanceSheet || {};
  const cashData = cash.data?.data || {};
  const arData = ar.data?.data || {};
  const apData = ap.data?.data || {};
  const monthly = reports.data?.monthlyRevenue || reports.data?.data?.monthlyRevenue || [];
  const loading = statements.isLoading || ar.isLoading || ap.isLoading || cash.isLoading;
  const error = statements.isError || ar.isError || ap.isError || cash.isError;

  return <div className="space-y-6 p-6">
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end"><div><p className="text-sm font-medium text-green-700">Tenant-scoped accounting</p><h1 className="text-3xl font-bold">Financial Reports</h1><p className="mt-1 text-sm text-gray-500">P&L, balance sheet, cash flow, receivables and supplier liabilities.</p></div><div className="flex gap-2"><label className="text-xs text-gray-500">From<input type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="mt-1 block rounded-lg border p-2 text-sm text-gray-900" /></label><label className="text-xs text-gray-500">To<input type="date" value={to} onChange={(e) => setTo(e.target.value)} className="mt-1 block rounded-lg border p-2 text-sm text-gray-900" /></label><button onClick={() => { setFrom(""); setTo(""); }} className="self-end rounded-lg border px-3 py-2 text-sm">Clear</button></div></div>
    {loading && <div className="rounded-lg border bg-white p-4 text-sm">Loading accounting reports…</div>}
    {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">One or more accounting reports could not be loaded. Other sections remain available.</div>}
    <div className="grid gap-4 md:grid-cols-4"><Card title="Revenue" value={money(pnl.totalRevenue)} /><Card title="Expenses" value={money(pnl.totalExpenses)} /><Card title="Net profit" value={money(pnl.netProfit)} /><Card title="Cash position" value={money(data.cash?.position)} hint="Cash, bank, M-Pesa and gateway clearing" /></div>

    <section className="rounded-xl border bg-white shadow-sm"><div className="border-b p-5"><h2 className="text-xl font-semibold">Profit & Loss</h2><p className="text-sm text-gray-500">Posted accounting activity for the selected period.</p></div><div className="p-5"><Rows rows={pnl.revenue} empty="No posted revenue in this period" /><div className="my-4 border-t pt-4"><Rows rows={pnl.expenses} empty="No posted expenses in this period" /></div><div className="flex justify-end gap-8 border-t pt-4 text-sm"><span>Total revenue <b>{money(pnl.totalRevenue)}</b></span><span>Total expenses <b>{money(pnl.totalExpenses)}</b></span><span>Net profit <b>{money(pnl.netProfit)}</b></span></div></div></section>

    <section className="rounded-xl border bg-white shadow-sm"><div className="border-b p-5"><h2 className="text-xl font-semibold">Balance Sheet</h2><p className="text-sm text-gray-500">Assets, liabilities and equity including current-year result.</p></div><div className="grid gap-6 p-5 lg:grid-cols-2"><div><h3 className="mb-3 font-semibold">Assets</h3><Rows rows={bs.assets} /><p className="mt-3 text-right font-bold">Total assets: {money(bs.totalAssets)}</p></div><div><h3 className="mb-3 font-semibold">Liabilities & equity</h3><Rows rows={[...(bs.liabilities || []), ...(bs.equity || []), { code: "CURRENT", name: "Current-year result", amount: bs.currentYearResult }]} /><p className="mt-3 text-right font-bold">Liabilities + equity: {money(bs.liabilitiesAndEquity)}</p><p className={`mt-1 text-right text-sm font-semibold ${bs.balanced ? "text-green-700" : "text-red-700"}`}>{bs.balanced ? "Balanced" : "Out of balance — investigate before close"}</p></div></div></section>

    <section className="grid gap-6 lg:grid-cols-2"><div className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Accounts Receivable Aging</h2><p className="mb-4 text-sm text-gray-500">Outstanding customer and corporate invoices.</p><Aging buckets={arData.buckets} /><p className="mt-4 text-right font-bold">Outstanding: {money(arData.totalOutstanding)}</p></div><div className="rounded-xl border bg-white p-5 shadow-sm"><h2 className="text-xl font-semibold">Accounts Payable Aging</h2><p className="mb-4 text-sm text-gray-500">Outstanding supplier liabilities.</p><Aging buckets={apData.buckets} /><p className="mt-4 text-right font-bold">Outstanding: {money(apData.totalOutstanding)}</p></div></section>

    <section className="rounded-xl border bg-white shadow-sm"><div className="border-b p-5"><h2 className="text-xl font-semibold">Cash Flow</h2><p className="text-sm text-gray-500">Actual posted movements through cash, bank, M-Pesa and gateway-clearing accounts.</p></div><div className="grid gap-4 p-5 md:grid-cols-3"><Card title="Inflows" value={money(cashData.inflows)} /><Card title="Outflows" value={money(cashData.outflows)} /><Card title="Net movement" value={money(cashData.netMovement)} /></div><div className="overflow-x-auto px-5 pb-5"><table className="w-full text-sm"><thead className="bg-gray-50"><tr><th className="p-3 text-left">Date</th><th className="p-3 text-left">Account</th><th className="p-3 text-left">Description</th><th className="p-3 text-right">Movement</th></tr></thead><tbody>{(cashData.movements || []).slice(-100).reverse().map((m, i) => <tr key={`${m.date}-${i}`} className="border-t"><td className="p-3">{m.date ? new Date(m.date).toLocaleDateString() : "—"}</td><td className="p-3">{m.accountCode}</td><td className="p-3">{m.description || "—"}</td><td className={`p-3 text-right font-medium ${Number(m.amount) >= 0 ? "text-green-700" : "text-red-700"}`}>{money(m.amount)}</td></tr>)}</tbody></table></div></section>

    <section className="rounded-xl border bg-white shadow-sm"><div className="border-b p-5"><h2 className="text-xl font-semibold">Revenue trend</h2><p className="text-sm text-gray-500">Existing monthly finance reporting retained alongside the accounting statements.</p></div><div className="p-5">{monthly.length ? <div className="grid gap-3 md:grid-cols-3">{monthly.map((r, i) => <div key={i} className="rounded-lg border p-4"><p className="text-sm text-gray-500">{r?._id?.month || "—"}/{r?._id?.year || "—"}</p><p className="mt-1 text-lg font-semibold">{money(r.revenue)}</p></div>)}</div> : <p className="text-sm text-gray-500">No monthly revenue records are available.</p>}</div></section>
  </div>;
}
