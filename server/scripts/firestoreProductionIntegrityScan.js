import * as firestore from "../config/firestore.js";

const round = (value) => Math.round(Number(value || 0) * 100) / 100;
const id = (value) => (value == null ? "" : String(value));
const active = (doc) => doc && doc.isDeleted !== true;

export async function runIntegrityScan({ database = firestore.db } = {}) {
  const collections = ["organization", "booking", "payment", "invoice", "journalEntry", "user"];
  const snaps = await Promise.all(collections.map((name) => database.collection(name).get()));
  const docs = Object.fromEntries(collections.map((name, index) => [
    name,
    snaps[index].docs.map((d) => ({ _id: d.id, ...d.data() })),
  ]));

  const issues = [];
  const pushIssue = (type, detail) => issues.push({ type, ...detail });
  const tenantIds = new Set(docs.organization.map((t) => id(t._id)));
  const usersById = new Map(docs.user.map((u) => [id(u._id), u]));
  const bookingsById = new Map(docs.booking.map((b) => [id(b._id), b]));
  const invoicesByBooking = new Map();
  const paymentsByBooking = new Map();

  for (const collection of ["booking", "payment", "invoice", "journalEntry"]) {
    for (const doc of docs[collection].filter(active)) {
      const tenantId = id(doc.tenantId);
      if (!tenantId) pushIssue("missing_tenant_id", { collection, id: doc._id });
      else if (!tenantIds.has(tenantId)) pushIssue("unknown_tenant_id", { collection, id: doc._id, tenantId });
    }
  }

  for (const user of docs.user.filter(active)) {
    if (user.tenantId && !tenantIds.has(id(user.tenantId))) {
      pushIssue("user_unknown_tenant_id", { id: user._id, tenantId: id(user.tenantId) });
    }
  }

  for (const booking of docs.booking.filter(active)) {
    const tenantId = id(booking.tenantId);
    const customerId = id(booking.customer || booking.user);
    const user = customerId ? usersById.get(customerId) : null;
    if (user?.tenantId && id(user.tenantId) !== tenantId) {
      pushIssue("booking_customer_cross_tenant", { bookingId: booking._id, tenantId, customerId, customerTenantId: id(user.tenantId) });
    }
  }

  for (const payment of docs.payment.filter(active)) {
    const bookingId = id(payment.booking);
    if (!bookingId) continue;
    const booking = bookingsById.get(bookingId);
    if (!booking) {
      pushIssue("payment_missing_booking", { paymentId: payment._id, bookingId });
      continue;
    }
    if (id(payment.tenantId) !== id(booking.tenantId)) {
      pushIssue("payment_booking_cross_tenant", { paymentId: payment._id, paymentTenantId: id(payment.tenantId), bookingId, bookingTenantId: id(booking.tenantId) });
    }
    paymentsByBooking.set(bookingId, [...(paymentsByBooking.get(bookingId) || []), payment]);
  }

  for (const invoice of docs.invoice.filter(active)) {
    const bookingId = id(invoice.booking);
    if (!bookingId) continue;
    const booking = bookingsById.get(bookingId);
    if (!booking) {
      pushIssue("invoice_missing_booking", { invoiceId: invoice._id, bookingId });
      continue;
    }
    if (id(invoice.tenantId) !== id(booking.tenantId)) {
      pushIssue("invoice_booking_cross_tenant", { invoiceId: invoice._id, invoiceTenantId: id(invoice.tenantId), bookingId, bookingTenantId: id(booking.tenantId) });
    }
    invoicesByBooking.set(bookingId, [...(invoicesByBooking.get(bookingId) || []), invoice]);
  }

  for (const [bookingId, invoices] of invoicesByBooking) {
    if (invoices.length > 1) pushIssue("duplicate_booking_invoices", { bookingId, invoiceIds: invoices.map((x) => x._id) });
  }

  for (const booking of docs.booking.filter(active)) {
    const payments = (paymentsByBooking.get(id(booking._id)) || [])
      .filter((p) => ["completed", "refunded"].includes(String(p.status || "").toLowerCase()));
    const netPaid = round(payments.reduce((sum, p) => sum + Math.max(0, Number(p.amount || 0) - Number(p.refundedAmount || 0)), 0));
    const totalRefunded = round(payments.reduce((sum, p) => sum + Math.max(0, Number(p.refundedAmount || 0)), 0));
    const total = round(booking.totalAmount);
    const expectedDeposit = round(Math.min(total, netPaid));
    const expectedBalance = round(Math.max(0, total - expectedDeposit));
    const expectedStatus = totalRefunded >= total && total > 0 ? "refunded" : expectedDeposit >= total && total > 0 ? "paid" : expectedDeposit > 0 ? "partial" : "pending";

    if (Math.abs(round(booking.depositAmount) - expectedDeposit) > 0.01) pushIssue("booking_deposit_mismatch", { bookingId: booking._id, recorded: round(booking.depositAmount), expected: expectedDeposit });
    if (Math.abs(round(booking.balanceAmount) - expectedBalance) > 0.01) pushIssue("booking_balance_mismatch", { bookingId: booking._id, recorded: round(booking.balanceAmount), expected: expectedBalance });
    if (booking.paymentStatus && booking.paymentStatus !== expectedStatus) pushIssue("booking_payment_status_mismatch", { bookingId: booking._id, recorded: booking.paymentStatus, expected: expectedStatus });

    const invoice = (invoicesByBooking.get(id(booking._id)) || [])[0];
    if (invoice) {
      const expectedPaid = round(Math.min(Number(invoice.totalAmount || 0), Math.max(0, netPaid)));
      const expectedBalance = round(Math.max(0, Number(invoice.totalAmount || 0) - expectedPaid));
      if (Math.abs(round(invoice.amountPaid) - expectedPaid) > 0.01) pushIssue("invoice_amount_paid_mismatch", { invoiceId: invoice._id, bookingId: booking._id, recorded: round(invoice.amountPaid), expected: expectedPaid });
      if (Math.abs(round(invoice.balance) - expectedBalance) > 0.01) pushIssue("invoice_balance_mismatch", { invoiceId: invoice._id, bookingId: booking._id, recorded: round(invoice.balance), expected: expectedBalance });
    }
  }

  for (const [field, requiredStatus] of [
    ["transactionReference", "completed"],
    ["checkoutRequestID", null],
    ["checkoutRequestId", null],
    ["mpesaReceiptNumber", null],
    ["callbackEventId", null],
  ]) {
    const seen = new Map();
    for (const payment of docs.payment.filter(active)) {
      if (requiredStatus && payment.status !== requiredStatus) continue;
      const value = String(payment[field] || "").trim();
      if (!value) continue;
      const key = id(payment.tenantId) + ":" + value;
      const prior = seen.get(key);
      if (prior) pushIssue("duplicate_payment_provider_reference", { field, tenantId: id(payment.tenantId), value, paymentIds: [prior, payment._id] });
      else seen.set(key, payment._id);
    }
  }

  const invoiceNumbers = new Map();
  for (const invoice of docs.invoice.filter(active)) {
    const number = String(invoice.invoiceNumber || "").trim();
    if (!number) continue;
    const key = id(invoice.tenantId) + ":" + number;
    const prior = invoiceNumbers.get(key);
    if (prior) pushIssue("duplicate_invoice_number", { tenantId: id(invoice.tenantId), invoiceNumber: number, invoiceIds: [prior, invoice._id] });
    else invoiceNumbers.set(key, invoice._id);
  }

  for (const entry of docs.journalEntry.filter(active)) {
    if (entry.status !== "posted") continue;
    const debit = round((entry.lines || []).reduce((sum, line) => sum + Number(line.debit || 0), 0));
    const credit = round((entry.lines || []).reduce((sum, line) => sum + Number(line.credit || 0), 0));
    if (debit <= 0 || Math.abs(debit - credit) > 0.01) pushIssue("unbalanced_posted_journal", { journalEntryId: entry._id, tenantId: id(entry.tenantId), debit, credit });
    if (entry.sourceType && entry.sourceId && ["invoice", "payment"].includes(entry.sourceType)) {
      const sourceCollection = entry.sourceType === "invoice" ? "invoice" : "payment";
      const source = docs[sourceCollection].find((x) => id(x._id) === id(entry.sourceId));
      if (!source) pushIssue("journal_missing_source", { journalEntryId: entry._id, sourceType: entry.sourceType, sourceId: id(entry.sourceId) });
      else if (id(source.tenantId) !== id(entry.tenantId)) pushIssue("journal_source_cross_tenant", { journalEntryId: entry._id, sourceType: entry.sourceType, sourceId: id(entry.sourceId), journalTenantId: id(entry.tenantId), sourceTenantId: id(source.tenantId) });
    }
  }

  const byTenant = {};
  for (const [collection, rows] of Object.entries(docs)) {
    for (const doc of rows.filter(active)) {
      const tenantId = id(doc.tenantId);
      if (!tenantId) continue;
      byTenant[tenantId] ||= { documents: 0, bookings: 0, payments: 0, invoices: 0, journalEntries: 0 };
      byTenant[tenantId].documents += 1;
      if (collection === "booking") byTenant[tenantId].bookings += 1;
      if (collection === "payment") byTenant[tenantId].payments += 1;
      if (collection === "invoice") byTenant[tenantId].invoices += 1;
      if (collection === "journalEntry") byTenant[tenantId].journalEntries += 1;
    }
  }

  return {
    ok: issues.length === 0,
    generatedAt: new Date().toISOString(),
    readOnly: true,
    tenants: docs.organization.length,
    collections: Object.fromEntries(collections.map((name) => [name, docs[name].length])),
    byTenant,
    issueCount: issues.length,
    issues,
  };
}

const main = async () => {
  if (!process.env.FIREBASE_PROJECT_ID && !process.env.GCLOUD_PROJECT && !process.env.GOOGLE_CLOUD_PROJECT) throw new Error("FIREBASE_PROJECT_ID, GCLOUD_PROJECT or GOOGLE_CLOUD_PROJECT is required.");
  const result = await runIntegrityScan();
  console.log(JSON.stringify(result, null, 2));
  if (!result.ok) process.exitCode = 1;
};

if (process.argv[1] && import.meta.url === new URL(process.argv[1], "file:").href) {
  main().catch((error) => {
    console.error("Firestore production integrity scan failed:", error.message);
    process.exitCode = 1;
  });
}
