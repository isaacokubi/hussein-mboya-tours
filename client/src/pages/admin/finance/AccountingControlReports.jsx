import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import api from "../../../api/axios";
import Pagination from "../../../components/admin/Pagination";

const PAGE_SIZE = 15;
const TAX_CODES = ["2100", "2110", "2120", "2130"];
const STATUTORY_CODES = ["2140", "2150"];
const ACCOUNT_LABELS = {
  "2100": "VAT / Tax Payable", "2110": "Output VAT", "2120": "Input VAT",
  "2130": "Withholding Tax Payable", "2140": "Payroll Liabilities", "2150": "Customer Deposits",
};

const money = (value) => value == null ? "—" : `KES ${Number(value).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const date = (value) => value ? new Date(value).toLocaleDateString("en-KE", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";
const label = (value) => String(value || "manual").replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

const statusClass = (status) => ({
  linked: "border-emerald-200 bg-emerald-50 text-emerald-900",
  reconciled: "border-emerald-200 bg-emerald-50 text-emerald-900",
  review_required: "border-amber-200 bg-amber-50 text-amber-900",
  reviewable: "border-amber-200 bg-amber-50 text-amber-900",
  typed_payment_unlinked: "border-amber-200 bg-amber-50 text-amber-900",
  recorded_payment_unlinked: "border-amber-200 bg-amber-50 text-amber-900",
  uncollected: "border-slate-200 bg-slate-100 text-slate-700",
  no_activity: "border-slate-200 bg-slate-100 text-slate-700",
}[status] || "border-slate-200 bg-slate-50 text-slate-700");

const fetchReport = async (url, name) => {
  const response = (await api.get(url)).data;
  if (!response?.success) throw new Error(`${name} returned an invalid response.`);
  return response;
};

function Badge({ status, children }) {
  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(status)}`}>{children}</span>;
}
function ErrorBox({ query, name }) {
  if (!query.isError) return null;
  return <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert"><b>{name} unavailable.</b> The API request failed, so no fallback accounting values are displayed.</div>;
}
function LoadingBox({ name }) {
  return <div className="px-4 py-10 text-center" aria-live="polite"><div className="mx-auto h-6 w-6 animate-spin rounded-full border-2 border-emerald-200 border-t-emerald-700" /><p className="mt-3 font-semibold text-slate-700">Loading {name.toLowerCase()}…</p><p className="mt-1 text-sm text-slate-500">Reading tenant-scoped posted accounting data.</p></div>;
}
function Metric({ title, value, hint }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{title}</p><p className="mt-2 text-2xl font-bold text-slate-900">{money(value)}</p><p className="mt-1 text-xs text-slate-500">{hint}</p></div>;
}
function MissingAccount({ code, name }) {
  return <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-900"><b>{name} control account {code} is not configured.</b><p className="mt-1">This control is unavailable and is not represented as KES 0.00.</p></div>;
}

function LedgerSection({ title, sub, type, from, to }) {
  const [page, setPage] = useState(1);
  const query = useQuery({
    queryKey: [`${type}-ledger`, from, to, page],
    queryFn: () => fetchReport(`/admin/finance/accounting/${type}-ledger?from=${from}&to=${to}&page=${page}&pageSize=${PAGE_SIZE}`, `${title} report`),
    staleTime: 15000,
    placeholderData: (previous) => previous,
  });
  const data = query.data?.data;
  const rows = data?.rows || [];
  const pagination = data?.pagination || { page, pages: 0, total: 0, pageSize: PAGE_SIZE };
  return <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
    <div className="border-b border-slate-100 p-5"><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-lg font-bold text-slate-900">{title}</h2><p className="mt-1 text-sm text-slate-500">{sub}</p></div>{data?.accountFound && <div className="rounded-xl bg-emerald-50 px-3 py-2 text-right"><p className="text-xs text-emerald-700">Closing balance</p><p className="font-bold text-emerald-900">{money(data.closingBalance)}</p></div>}</div></div>
    {query.isError ? <ErrorBox query={query} name={title} /> : query.isPending && !data ? <LoadingBox name={title} /> : !data?.accountFound ? <MissingAccount code={data?.account || (type === "customer" ? "1100" : "2000")} name={type === "customer" ? "Accounts receivable" : "Accounts payable"} /> : <>
      <div className="grid gap-3 border-b border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-4">{[["Opening balance",data.openingBalance],["Period debit",data.periodDebit],["Period credit",data.periodCredit],["Closing balance",data.closingBalance]].map(([k,v]) => <div key={k}><p className="text-xs text-slate-500">{k}</p><p className="mt-1 font-bold text-slate-900">{money(v)}</p></div>)}</div>
      {rows.length ? <><div className="overflow-x-auto"><table className="min-w-[1080px] w-full text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Date","Reference","Source","Description","Debit","Credit","Balance"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead><tbody>{rows.map((row) => <tr key={`${row._id || row.entryNumber || row.reference}-${row.entryDate}`} className="border-t border-slate-100 hover:bg-emerald-50/40"><td className="whitespace-nowrap px-4 py-3">{date(row.entryDate)}</td><td className="px-4 py-3"><div className="font-medium text-slate-900">{row.reference || row.entryNumber || "Journal entry"}</div>{row.isDemoReference && <span className="mt-1 inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">TEST / DEMO</span>}</td><td className="px-4 py-3 font-medium text-slate-700">{label(row.sourceType)}{row.sourceId && <div className="max-w-[180px] truncate text-xs font-normal text-slate-400">Source ID: {String(row.sourceId)}</div>}</td><td className="max-w-[240px] truncate px-4 py-3 text-slate-600">{row.description || "—"}</td><td className="px-4 py-3 text-right">{money(row.debit)}</td><td className="px-4 py-3 text-right">{money(row.credit)}</td><td className="px-4 py-3 text-right font-semibold">{money(row.balance)}</td></tr>)}</tbody></table></div><Pagination page={pagination.page} pages={pagination.pages} total={pagination.total} pageSize={pagination.pageSize} onPageChange={(next) => setPage(next)} /></> : <div className="px-4 py-10 text-center"><p className="font-semibold text-slate-700">No posted {type} activity</p><p className="mt-1 text-sm text-slate-500">No qualifying records exist for this reporting period.</p></div>}
    </>}
  </section>;
}

function TaxAccountCards({ data }) {
  const rows = data?.rows || [];
  const byCode = new Map(rows.map((row) => [row.code, row]));
  const configured = new Set(data?.reconciliation?.availableTaxAccounts || []);
  const statutoryConfigured = new Set(data?.reconciliation?.availableStatutoryAccounts || []);
  const render = (code) => { const isConfigured = configured.has(code) || statutoryConfigured.has(code); const row = byCode.get(code); return <div key={code} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{code}</p><p className="mt-1 font-semibold text-slate-900">{ACCOUNT_LABELS[code]}</p></div><span className={`rounded-full px-2 py-1 text-[10px] font-semibold ${isConfigured ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>{isConfigured ? "Configured" : "Missing"}</span></div><p className="mt-4 text-lg font-bold text-slate-900">{isConfigured ? money(row?.balance ?? 0) : "—"}</p><p className="mt-1 text-xs text-slate-500">{isConfigured ? "Posted journal balance" : "No active control account"}</p></div>; };
  return <div className="space-y-5"><div><p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Tax controls</p><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{TAX_CODES.map(render)}</div></div><div><p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Other statutory controls</p><div className="grid gap-3 sm:grid-cols-2">{STATUTORY_CODES.map(render)}</div></div></div>;
}

export default function AccountingControlReports() {
  const year = new Date().getFullYear();
  const from = `${year}-01-01`, to = `${year}-12-31`;
  const tax = useQuery({ queryKey: ["tax-control", year], queryFn: () => fetchReport(`/admin/finance/accounting/tax-control?from=${from}&to=${to}`, "Tax control report"), staleTime: 15000 });
  const billing = useQuery({ queryKey: ["billing-control", year], queryFn: () => fetchReport(`/admin/finance/accounting/profitability?from=${from}&to=${to}`, "Service billing report"), staleTime: 15000 });
  const td = tax.data?.data;
  const billingData = billing.data;
  const serviceRows = billingData?.data || [];
  const reconciliation = billingData?.reconciliation;
  const taxReconciliation = td?.reconciliation;
  const taxAccounts = taxReconciliation?.availableTaxAccounts || [];

  return <main className="min-h-screen bg-slate-50 px-4 py-6 sm:px-6 lg:px-8"><div className="mx-auto max-w-7xl space-y-6">
    <header className="rounded-3xl bg-gradient-to-br from-emerald-950 via-emerald-900 to-slate-900 p-6 text-white shadow-lg sm:p-8"><p className="text-sm font-semibold uppercase tracking-wider text-emerald-300">Production accounting</p><h1 className="mt-2 text-2xl font-bold sm:text-3xl">Tax, Ledgers &amp; Billing Controls</h1><p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-50/80">Tenant-scoped, read-only accounting controls from posted journals, qualifying invoices and completed payments. Failed controls never fall back to zero.</p><p className="mt-4 inline-flex rounded-full bg-white/10 px-3 py-1.5 text-xs">Reporting period: {from} — {to}</p></header>
    <ErrorBox query={tax} name="Tax control report" /><ErrorBox query={billing} name="Service billing report" />
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"><Metric title="Output VAT" value={tax.isError || !taxAccounts.includes("2110") ? null : td?.outputVat} hint="Posted control account 2110" /><Metric title="Input VAT" value={tax.isError || !taxAccounts.includes("2120") ? null : td?.inputVat} hint="Posted control account 2120" /><Metric title="Net VAT" value={tax.isError || !taxAccounts.includes("2110") || !taxAccounts.includes("2120") ? null : td?.netVat} hint="Output VAT less Input VAT" /><Metric title="WHT payable" value={tax.isError || !taxAccounts.includes("2130") ? null : td?.withholdingTaxPayable} hint="Posted control account 2130" /></section>
    {tax.data && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Tax reconciliation check</h2><p className="mt-1 text-sm text-slate-500">Invoice tax is a supporting basis; posted tax journals remain the accounting control source.</p></div><Badge status={taxReconciliation?.status}>{taxReconciliation?.status === "no_activity" ? "No qualifying activity" : "Reviewable control"}</Badge></div><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{[["Tax accounts configured",`${taxReconciliation?.configuredTaxAccounts ?? "—"} / ${taxReconciliation?.expectedTaxAccounts ?? "—"}`],["Qualifying invoices",taxReconciliation?.invoiceCount ?? "—"],["Invoice VAT basis",money(taxReconciliation?.invoiceVatBasis)],["Posted Output VAT",money(taxReconciliation?.outputVat ?? td?.outputVat)]].map(([k,v]) => <div key={k} className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">{k}</p><p className="mt-1 text-lg font-bold text-slate-900">{v}</p></div>)}</div><div className="mt-3 grid gap-3 sm:grid-cols-2"><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Invoice VAT basis variance vs Output VAT</p><p className="mt-1 text-lg font-bold text-slate-900">{money(taxReconciliation?.invoiceOutputVatVariance)}</p></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs text-slate-500">Posted tax journal activity</p><p className="mt-1 text-lg font-bold text-slate-900">{money(taxReconciliation?.postedTaxActivity)}</p></div></div><p className="mt-4 text-xs leading-5 text-slate-500">{taxReconciliation?.note}</p></section>}
    {billing.data && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-slate-900">Service billing &amp; collection</h2><p className="mt-1 text-sm text-slate-500">Invoices use issue date. Collections use payment/refund date. Payment-reference reconciliation is included, and invoices recorded as paid without a reconciled payment record are explicitly flagged.</p></div><Badge status={reconciliation?.status}>{reconciliation?.status === "review_required" ? "Review required" : "Payment links reconciled"}</Badge></div>
      <div className="mt-4 overflow-x-auto"><table className="min-w-[1240px] w-full text-sm"><thead className="bg-slate-50 text-xs uppercase text-slate-500"><tr>{["Service","Invoices","Invoiced","Collected","Refunded","Net collected","Outstanding","Net collection rate","Control"].map((h) => <th key={h} className="px-4 py-3 text-left">{h}</th>)}</tr></thead><tbody>{serviceRows.map((row) => <tr key={row.serviceType} className="border-t border-slate-100"><td className="px-4 py-3 font-semibold text-slate-900">{label(row.serviceType)}</td><td className="px-4 py-3">{row.invoiceCount}</td><td className="px-4 py-3">{money(row.invoiced)}</td><td className="px-4 py-3">{money(row.collected)}</td><td className="px-4 py-3">{money(row.refunded)}</td><td className="px-4 py-3 font-semibold">{money(row.netCollected)}</td><td className="px-4 py-3">{money(row.outstanding)}</td><td className="px-4 py-3 font-semibold">{row.collectionRate == null ? "—" : `${row.collectionRate}%`}</td><td className="px-4 py-3"><Badge status={row.reconciliationStatus}>{row.unlinkedTypedPaymentCount ? `${row.unlinkedTypedPaymentCount} typed payment${row.unlinkedTypedPaymentCount === 1 ? "" : "s"} unlinked` : row.reconciliationStatus === "recorded_payment_unlinked" ? `Invoice records ${money(row.recordedPaymentAmount)}` : row.linkedPaymentCount ? `${row.linkedPaymentCount} linked` : "No collection recorded"}</Badge>{row.reconciliationStatus === "recorded_payment_unlinked" && <p className="mt-2 max-w-xs text-xs leading-5 text-amber-800">Invoice payment state is recorded, but no matching payment ledger record was reconciled. Review receipt, transaction ID or payment reference.</p>}{row.reconciliationStatus === "uncollected" && <p className="mt-2 text-xs text-slate-500">No qualifying collection has been reconciled for this service in the report.</p>}</td></tr>)}</tbody></table></div>
      {reconciliation?.recordedPaymentGapCount > 0 && <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>Payment ledger review:</b> {reconciliation.recordedPaymentGapCount} invoice{reconciliation.recordedPaymentGapCount === 1 ? "" : "s"} record payment amounts totaling {money(reconciliation.recordedPaymentGapAmount)}, but those amounts do not currently have a reconciled Payment record. This is an accounting exception, not a collection value.</div>}
      {reconciliation?.unmatchedPaymentCount > 0 && <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900"><b>Unlinked payments:</b> {reconciliation.unmatchedPaymentCount} qualifying payment{reconciliation.unmatchedPaymentCount === 1 ? "" : "s"} require reconciliation ({money(reconciliation.unmatchedPaymentAmount)}).</div>}
      {reconciliation?.outsidePeriodLinkedPaymentCount > 0 && <div className="mt-3 rounded-xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">{reconciliation.outsidePeriodLinkedPaymentCount} linked collection{reconciliation.outsidePeriodLinkedPaymentCount === 1 ? "" : "s"} settle invoice{reconciliation.outsidePeriodLinkedPaymentCount === 1 ? "" : "s"} issued outside the reporting period ({money(reconciliation.outsidePeriodLinkedPaymentAmount)}).</div>}
      <p className="mt-4 text-xs leading-5 text-slate-500">{reconciliation?.note}</p>
    </section>}
    {tax.data && <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="mb-4"><h2 className="font-bold text-slate-900">Tax &amp; statutory control accounts</h2><p className="mt-1 text-sm text-slate-500">Posted journal balances only. Configured accounts with no posted activity show KES 0.00; missing accounts remain unavailable.</p></div><TaxAccountCards data={td} /></section>}
    <section className="space-y-5"><LedgerSection title="Customer ledger" sub="Accounts receivable control account 1100" type="customer" from={from} to={to} /><LedgerSection title="Supplier ledger" sub="Accounts payable control account 2000" type="supplier" from={from} to={to} /></section>
  </div></main>;
}
