import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock3, Download, ExternalLink, FileWarning, RefreshCw, ShieldAlert, WalletCards, X } from "lucide-react";
import { getPaymentReconciliation, exportPaymentsCSV } from "../../../api/admin/adminPaymentApi";

const money = (value) => `KES ${Number(value || 0).toLocaleString("en-KE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const number = (value) => Number(value || 0).toLocaleString("en-KE");
const issueDefinitions = [
  ["bookingMismatches", "Booking mismatches", "Stored booking payment totals differ from payment records.", AlertTriangle],
  ["invoiceMismatches", "Invoice mismatches", "Invoice paid or balance values do not agree with reconciled payments.", FileWarning],
  ["missingInvoices", "Missing invoices", "Bookings with qualifying payments that have no invoice record.", FileWarning],
  ["overpayments", "Overpayments", "Payments exceed booking value and require controlled review.", ShieldAlert],
  ["missingReceipts", "Missing M-Pesa receipts", "Completed M-Pesa payments without a provider receipt reference.", ShieldAlert],
  ["duplicateReferences", "Duplicate references", "Active payments share the same transaction reference.", ShieldAlert],
  ["orphanPayments", "Orphan payments", "Payments cannot be linked to a tenant booking.", FileWarning],
  ["commissionAdjustments", "Commission adjustments", "Commission net values differ from refund-adjusted expectations.", AlertTriangle],
];

export default function Reconciliation() {
  const query = useQuery({ queryKey: ["payment-reconciliation"], queryFn: getPaymentReconciliation, refetchInterval: 60000, staleTime: 30000 });
  const [selectedException, setSelectedException] = useState(null);
  const dataSet = query.data?.data || {};
  const summary = dataSet.summary || {};
  const issueCount = useMemo(() => issueDefinitions.reduce((sum, [key]) => sum + Number(summary[key] || 0), 0), [summary]);
  const generatedAt = dataSet.generatedAt ? new Date(dataSet.generatedAt) : null;

  const exceptionRows = useMemo(() => {
    const rows = [...(dataSet.mismatches || [])];
    for (const row of dataSet.missingInvoices || []) rows.push({ ...row, type: "missing_invoice", recorded: "No invoice" });
    for (const row of dataSet.overpayments || []) rows.push({ ...row, type: "overpayment", recorded: row.paidFromPayments });
    for (const row of dataSet.commissionAdjustments || []) rows.push({ ...row, type: "commission_adjustment" });
    for (const row of dataSet.missingReceipts || []) rows.push({ ...row, type: "missing_mpesa_receipt" });
    for (const row of dataSet.duplicateReferences || []) rows.push({ ...row, type: "duplicate_reference" });
    for (const row of dataSet.orphanPayments || []) rows.push({ ...row, type: "orphan_payment" });
    return rows;
  }, [dataSet]);

  if (query.isLoading) return <div className="reconciliation-page"><div className="recon-loading"><RefreshCw className="animate-spin" size={22} /> Loading payment reconciliation…</div></div>;
  if (query.isError) return <div className="reconciliation-page"><div className="recon-error"><ShieldAlert size={24} /><div><h2>Reconciliation unavailable</h2><p>{query.error?.response?.data?.message || "The reconciliation service could not be reached. No financial figures have been fabricated."}</p></div><button type="button" onClick={() => query.refetch()}><RefreshCw size={16} /> Retry</button></div></div>;

  return <div className="reconciliation-page">
    <header className="recon-hero">
      <div><p className="recon-eyebrow">Finance · Controls</p><h1>Payment Reconciliation</h1><p>Compare recorded payments with bookings, invoices and commissions. Exceptions are surfaced for controlled review rather than silently corrected.</p></div>
      <div className="recon-actions"><button type="button" onClick={() => query.refetch()} disabled={query.isFetching}><RefreshCw className={query.isFetching ? "animate-spin" : ""} size={17} /> {query.isFetching ? "Refreshing…" : "Refresh"}</button><button type="button" onClick={() => exportPaymentsCSV()}><Download size={17} /> Export CSV</button></div>
    </header>
    <section className="recon-health" aria-label="Reconciliation status"><div className={`health-icon ${issueCount ? "danger" : "good"}`}>{issueCount ? <AlertTriangle size={22} /> : <CheckCircle2 size={22} />}</div><div className="health-copy"><strong>{issueCount ? `${number(issueCount)} reconciliation exception${issueCount === 1 ? "" : "s"} require review` : "All reconciliation controls are clear"}</strong><span>Source data is tenant-scoped. The dashboard reports detected differences and does not automatically alter financial records.</span></div>{generatedAt && <div className="health-time">Last checked<br /><strong>{generatedAt.toLocaleString("en-KE")}</strong></div>}</section>
    <section className="recon-grid recon-primary"><Metric icon={WalletCards} label="Total payments" value={number(summary.totalPayments)} /><Metric icon={CheckCircle2} label="Completed" value={number(summary.completedPayments)} tone="good" /><Metric icon={Clock3} label="Pending" value={number(summary.pendingPayments)} tone="warning" /><Metric icon={AlertTriangle} label="Failed / cancelled" value={number(summary.failedPayments)} tone="danger" /><Metric icon={WalletCards} label="Refunded" value={number(summary.refundedPayments)} /><Metric label="Total collected" value={money(summary.totalCollected)} emphasis /><Metric label="Total refunded" value={money(summary.totalRefunded)} /></section>
    <section className="recon-section"><div className="recon-section-heading"><div><p className="recon-kicker">Control exceptions</p><h2>What needs attention</h2></div><span className={`recon-pill ${issueCount ? "danger" : "good"}`}>{issueCount ? `${number(issueCount)} open` : "Clear"}</span></div><div className="recon-grid recon-issues">{issueDefinitions.map(([key, title, description, Icon]) => <IssueCard key={key} icon={Icon} title={title} description={description} value={summary[key]} />)}</div></section>
    <section className="recon-section"><div className="recon-section-heading"><div><p className="recon-kicker">Exceptions register</p><h2>All detected exceptions</h2><span>Every open exception category is represented here, including commission and payment-control exceptions.</span></div><span className={`recon-pill ${exceptionRows.length ? "danger" : "good"}`}>{number(exceptionRows.length)} listed</span></div><div className="recon-table-wrap">{!exceptionRows.length ? <EmptyState text="No payment, invoice, booking or commission exceptions detected." /> : <table className="recon-table"><thead><tr><th>Type</th><th>Booking / reference</th><th>Invoice</th><th>Expected</th><th>Recorded</th><th>Status</th><th>Source</th></tr></thead><tbody>{exceptionRows.map((item, index) => <tr key={`${item.bookingId || item.paymentId || item.reference || item.invoiceNumber || "exception"}-${item.type}-${index}`}><td><span className="recon-type">{String(item.type || "exception").replaceAll("_", " ")}</span></td><td>{item.bookingNumber || item.reference || item.paymentId || "—"}</td><td>{item.invoiceNumber || "—"}</td><td>{item.expectedPaid !== undefined ? money(item.expectedPaid) : item.expectedNetCommission !== undefined ? money(item.expectedNetCommission) : item.expectedStatus || "—"}</td><td>{item.storedPaid !== undefined ? money(item.storedPaid) : item.invoicePaid !== undefined ? money(item.invoicePaid) : item.actualNetCommission !== undefined ? money(item.actualNetCommission) : item.recorded !== undefined ? (typeof item.recorded === "number" ? money(item.recorded) : item.recorded) : item.amount !== undefined ? money(item.amount) : "—"}</td><td><span className="recon-pill danger">Review</span></td><td><button type="button" className="recon-source-button" onClick={() => setSelectedException(item)}><ExternalLink size={15} /> View source</button></td></tr>)}</tbody></table>}</div></section>
    <section className="recon-section recon-two-col"><ExceptionList title="Missing invoices" rows={dataSet.missingInvoices} onOpen={setSelectedException} render={(row) => <><strong>{row.bookingNumber || "Unnumbered booking"}</strong><span>{money(row.totalAmount)}</span></>} /><ExceptionList title="Orphan payments" rows={dataSet.orphanPayments} onOpen={setSelectedException} render={(row) => <><strong>{row.transactionReference || "No reference"}</strong><span className="capitalize">{row.status || "unknown"}</span></>} /></section>
    <footer className="recon-footer"><ShieldAlert size={18} /><span>Financial exceptions should be investigated and resolved through the appropriate payment, booking, invoice or commission workflow. Reconciliation is read-only and does not manufacture receipts or silently overwrite accounting records.</span></footer>
    {selectedException && <SourceDrawer exception={selectedException} payments={dataSet.payments || []} onClose={() => setSelectedException(null)} />}
  </div>;
}

function Metric({ icon: Icon, label, value, tone = "", emphasis = false }) { return <article className={`recon-metric ${tone} ${emphasis ? "emphasis" : ""}`}><div className="metric-icon">{Icon && <Icon size={19} />}</div><div><span>{label}</span><strong>{value}</strong></div></article>; }
function IssueCard({ icon: Icon, title, description, value }) { const count = Number(value || 0); return <article className={`recon-issue ${count ? "is-danger" : "is-good"}`}><div className="issue-top"><div className="issue-icon"><Icon size={18} /></div><span className="recon-pill">{number(count)}</span></div><h3>{title}</h3><p>{description}</p></article>; }
function ExceptionList({ title, rows = [], render, onOpen }) { return <div className="exception-list"><div className="recon-list-heading"><h3>{title}</h3><span>{number(rows?.length)} detected</span></div>{rows?.length ? <div className="exception-items">{rows.slice(0, 8).map((row, index) => <button type="button" className="exception-item" key={row.bookingId || row.paymentId || index} onClick={() => onOpen(row)}>{render(row)}<ExternalLink size={15} /></button>)}</div> : <EmptyState text="No exceptions detected." compact />}</div>; }
function EmptyState({ text, compact = false }) { return <div className={`recon-empty ${compact ? "compact" : ""}`}><CheckCircle2 size={18} /><span>{text}</span></div>; }

function SourceDrawer({ exception, payments, onClose }) {
  const relatedPayments = useMemo(() => {
    const bookingId = exception.bookingId ? String(exception.bookingId) : null;
    const paymentIds = new Set((exception.paymentIds || []).map(String));
    return payments.filter((payment) => (paymentIds.size && paymentIds.has(String(payment._id))) || (bookingId && String(payment.booking || "") === bookingId));
  }, [exception, payments]);

  const entries = Object.entries(exception).filter(([key]) => !["source", "paymentIds"].includes(key));
  return <div className="recon-drawer-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}><aside className="recon-source-drawer" role="dialog" aria-modal="true" aria-label="Reconciliation source data"><div className="recon-drawer-header"><div><p className="recon-kicker">Underlying record</p><h2>Exception source data</h2><span>Live records returned by the tenant-scoped reconciliation API.</span></div><button type="button" className="recon-icon-button" onClick={onClose} aria-label="Close source data"><X size={20} /></button></div><div className="recon-drawer-body"><div className="recon-source-banner"><AlertTriangle size={18} /><div><strong>{String(exception.type || "exception").replaceAll("_", " ")}</strong><span>Review the stored values below against the reconciliation expectation.</span></div></div><div className="recon-source-grid">{entries.map(([key, value]) => <div className="recon-source-field" key={key}><span>{key.replaceAll(/([A-Z])/g, " $1").replaceAll("_", " ").trim()}</span><strong>{typeof value === "object" ? JSON.stringify(value) : value === null || value === undefined || value === "" ? "—" : typeof value === "number" && /amount|paid|balance|commission/i.test(key) ? money(value) : String(value)}</strong></div>)}</div><div className="recon-source-section"><div className="recon-source-section-heading"><h3>Related payments</h3><span>{number(relatedPayments.length)} record{relatedPayments.length === 1 ? "" : "s"}</span></div>{relatedPayments.length ? <div className="recon-payment-records">{relatedPayments.map((payment) => <div className="recon-payment-record" key={payment._id}><div><strong>{payment._id}</strong><span>{payment.transactionReference || payment.mpesaReceiptNumber || payment.transactionId || "No provider reference"}</span></div><div><strong>{money(payment.amount)}</strong><span>{payment.status || "unknown"}</span></div></div>)}</div> : <EmptyState text="No linked payment record was returned for this exception." compact />}</div></div><div className="recon-drawer-footer"><span>Read-only inspection. Use the appropriate booking, payment, invoice or commission workflow to make corrections.</span><button type="button" onClick={onClose}>Close</button></div></aside></div>;
}
