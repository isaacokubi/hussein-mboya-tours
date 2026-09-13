import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, CheckCircle2, Clock3, Download, FileWarning, RefreshCw, ShieldAlert, WalletCards } from "lucide-react";
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
  const dataSet = query.data?.data || {};
  const summary = dataSet.summary || {};
  const issueCount = useMemo(() => issueDefinitions.reduce((sum, [key]) => sum + Number(summary[key] || 0), 0), [summary]);
  const generatedAt = dataSet.generatedAt ? new Date(dataSet.generatedAt) : null;

  const exceptionRows = useMemo(() => {
    const rows = [...(dataSet.mismatches || [])];
    for (const row of dataSet.missingInvoices || []) rows.push({ type: "missing_invoice", bookingNumber: row.bookingNumber, expectedPaid: row.paidAmount, recorded: "No invoice" });
    for (const row of dataSet.overpayments || []) rows.push({ type: "overpayment", bookingNumber: row.bookingNumber, expectedPaid: row.totalAmount, recorded: row.paidFromPayments });
    for (const row of dataSet.commissionAdjustments || []) rows.push({ type: "commission_adjustment", bookingNumber: row.bookingNumber, expectedNetCommission: row.expectedNetCommission, actualNetCommission: row.actualNetCommission });
    for (const row of dataSet.missingReceipts || []) rows.push({ type: "missing_mpesa_receipt", bookingNumber: row.bookingNumber, amount: row.amount });
    for (const row of dataSet.duplicateReferences || []) rows.push({ type: "duplicate_reference", reference: row.reference });
    for (const row of dataSet.orphanPayments || []) rows.push({ type: "orphan_payment", reference: row.transactionReference, amount: row.amount });
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
    <section className="recon-grid recon-primary" aria-label="Payment summary"><Metric icon={WalletCards} label="Total payments" value={number(summary.totalPayments)} /><Metric icon={CheckCircle2} label="Completed" value={number(summary.completedPayments)} tone="good" /><Metric icon={Clock3} label="Pending" value={number(summary.pendingPayments)} tone="warning" /><Metric icon={AlertTriangle} label="Failed / cancelled" value={number(summary.failedPayments)} tone="danger" /><Metric icon={WalletCards} label="Refunded" value={number(summary.refundedPayments)} /><Metric label="Total collected" value={money(summary.totalCollected)} emphasis /><Metric label="Total refunded" value={money(summary.totalRefunded)} /></section>
    <section className="recon-section"><div className="recon-section-heading"><div><p className="recon-kicker">Control exceptions</p><h2>What needs attention</h2></div><span className={`recon-pill ${issueCount ? "danger" : "good"}`}>{issueCount ? `${number(issueCount)} open` : "Clear"}</span></div><div className="recon-grid recon-issues">{issueDefinitions.map(([key, title, description, Icon]) => <IssueCard key={key} icon={Icon} title={title} description={description} value={summary[key]} />)}</div></section>
    <section className="recon-section"><div className="recon-section-heading"><div><p className="recon-kicker">Exceptions register</p><h2>All detected exceptions</h2><span>Every open exception category is represented here, including commission and payment-control exceptions.</span></div><span className={`recon-pill ${exceptionRows.length ? "danger" : "good"}`}>{number(exceptionRows.length)} listed</span></div><div className="recon-table-wrap">{!exceptionRows.length ? <EmptyState text="No payment, invoice, booking or commission exceptions detected." /> : <table className="recon-table"><thead><tr><th>Type</th><th>Booking / reference</th><th>Invoice</th><th>Expected</th><th>Recorded</th><th>Status</th></tr></thead><tbody>{exceptionRows.map((item, index) => <tr key={`${item.bookingId || item.paymentId || item.reference || item.invoiceNumber || "exception"}-${item.type}-${index}`}><td><span className="recon-type">{String(item.type || "exception").replaceAll("_", " ")}</span></td><td>{item.bookingNumber || item.reference || "—"}</td><td>{item.invoiceNumber || "—"}</td><td>{item.expectedPaid !== undefined ? money(item.expectedPaid) : item.expectedNetCommission !== undefined ? money(item.expectedNetCommission) : item.expectedStatus || "—"}</td><td>{item.storedPaid !== undefined ? money(item.storedPaid) : item.invoicePaid !== undefined ? money(item.invoicePaid) : item.actualNetCommission !== undefined ? money(item.actualNetCommission) : item.recorded !== undefined ? item.recorded : item.amount !== undefined ? money(item.amount) : "—"}</td><td><span className="recon-pill danger">Review</span></td></tr>)}</tbody></table>}</div></section>
    <section className="recon-section recon-two-col"><ExceptionList title="Missing invoices" rows={dataSet.missingInvoices} render={(row) => <><strong>{row.bookingNumber || "Unnumbered booking"}</strong><span>{money(row.totalAmount)}</span></>} /><ExceptionList title="Orphan payments" rows={dataSet.orphanPayments} render={(row) => <><strong>{row.transactionReference || "No reference"}</strong><span className="capitalize">{row.status || "unknown"}</span></>} /></section>
    <footer className="recon-footer"><ShieldAlert size={18} /><span>Financial exceptions should be investigated and resolved through the appropriate payment, booking, invoice or commission workflow. Reconciliation is read-only and does not manufacture receipts or silently overwrite accounting records.</span></footer>
  </div>;
}

function Metric({ icon: Icon, label, value, tone = "", emphasis = false }) { return <article className={`recon-metric ${tone} ${emphasis ? "emphasis" : ""}`}><div className="metric-icon">{Icon && <Icon size={19} />}</div><div><span>{label}</span><strong>{value}</strong></div></article>; }
function IssueCard({ icon: Icon, title, description, value }) { const count = Number(value || 0); return <article className={`recon-issue ${count ? "is-danger" : "is-good"}`}><div className="issue-top"><div className="issue-icon"><Icon size={18} /></div><span className="recon-pill">{number(count)}</span></div><h3>{title}</h3><p>{description}</p></article>; }
function ExceptionList({ title, rows = [], render }) { return <div className="exception-list"><div className="recon-list-heading"><h3>{title}</h3><span>{number(rows?.length)} detected</span></div>{rows?.length ? <div className="exception-items">{rows.slice(0, 8).map((row, index) => <div className="exception-item" key={row.bookingId || row.paymentId || index}>{render(row)}</div>)}</div> : <EmptyState text="No exceptions detected." compact />}</div>; }
function EmptyState({ text, compact = false }) { return <div className={`recon-empty ${compact ? "compact" : ""}`}><CheckCircle2 size={18} /><span>{text}</span></div>; }
