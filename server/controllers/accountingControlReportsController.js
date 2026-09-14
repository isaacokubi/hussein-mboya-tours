import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const TAX_ACCOUNT_CODES = ["2110", "2120", "2130", "2140", "2150"];
const PAYMENT_STATUSES = ["completed", "refunded"];

const bounds = (from, to, field = "entryDate") => {
  if (!from && !to) return {};
  return {
    [field]: {
      ...(from ? { $gte: new Date(`${from}T00:00:00.000Z`) } : {}),
      ...(to ? { $lt: new Date(`${to}T23:59:59.999Z`) } : {}),
    },
  };
};

const before = (from, field = "entryDate") => from ? { [field]: { $lt: new Date(`${from}T00:00:00.000Z`) } } : {};

async function journalBalances(tenantId, from, to, codes = TAX_ACCOUNT_CODES) {
  const accounts = await ChartOfAccount.find({ tenantId, code: { $in: codes }, active: true }).lean();
  const ids = new Map(accounts.map((a) => [String(a._id), a]));
  const filter = { tenantId, status: "posted", ...bounds(from, to) };
  const entries = await JournalEntry.find(filter).select("entryDate reference entryNumber description sourceType sourceId lines").lean();
  const balances = new Map();
  for (const entry of entries) {
    for (const line of entry.lines || []) {
      const account = ids.get(String(line.account));
      if (!account) continue;
      const row = balances.get(account.code) || { code: account.code, name: account.name, type: account.type, debit: 0, credit: 0 };
      row.debit += Number(line.debit || 0);
      row.credit += Number(line.credit || 0);
      balances.set(account.code, row);
    }
  }
  return [...balances.values()].map((row) => ({
    ...row,
    debit: money(row.debit),
    credit: money(row.credit),
    balance: money(["asset", "expense"].includes(row.type) ? row.debit - row.credit : row.credit - row.debit),
  }));
}

const periodFilter = (from, to) => bounds(from, to, "issueDate");

export const getTaxControlReport = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const from = req.query.from;
    const to = req.query.to;
    const rows = await journalBalances(tenantId, from, to);
    const by = new Map(rows.map((row) => [row.code, row]));
    const output = by.get("2110")?.balance || 0;
    const input = by.get("2120")?.balance || 0;
    const wht = by.get("2130")?.balance || 0;
    const invoiceFilter = mergeTenantFilter(req, { isDeleted: { $ne: true }, status: { $nin: ["draft", "cancelled"] }, ...periodFilter(from, to) });
    const invoices = await Invoice.find(invoiceFilter).select("tax taxableAmount taxType totalAmount invoiceNumber hospitalityType issueDate").lean();
    const invoiceVatBasis = money(invoices.reduce((sum, invoice) => sum + Math.max(0, Number(invoice.tax || 0)), 0));
    const postedTaxActivity = money(rows.reduce((sum, row) => sum + Math.abs(Number(row.debit || 0)) + Math.abs(Number(row.credit || 0)), 0));
    return res.json({
      success: true,
      data: {
        period: { from: from || null, to: to || null },
        rows,
        outputVat: money(output),
        inputVat: money(input),
        netVat: money(output - input),
        withholdingTaxPayable: money(wht),
        reconciliation: {
          invoiceCount: invoices.length,
          invoiceVatBasis,
          postedTaxActivity,
          status: invoices.length === 0 && rows.length === 0 ? "no_activity" : "reviewable",
          note: "Invoice VAT is a supporting basis only; posted tax journals remain the accounting control balance. Differences may represent opening balances, adjustments, reversals or timing and require review rather than automatic correction.",
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

async function getControlLedger({ tenantId, code, from, to, normalDebit }) {
  const account = await ChartOfAccount.findOne({ tenantId, code, active: true }).lean();
  if (!account) return { account: code, rows: [], openingBalance: 0, periodDebit: 0, periodCredit: 0, closingBalance: 0, accountFound: false };
  const openingEntries = from
    ? await JournalEntry.find({ tenantId, status: "posted", ...before(from) }).select("lines").lean()
    : [];
  let openingBalance = 0;
  for (const entry of openingEntries) {
    for (const line of entry.lines || []) {
      if (String(line.account) !== String(account._id)) continue;
      openingBalance += normalDebit ? Number(line.debit || 0) - Number(line.credit || 0) : Number(line.credit || 0) - Number(line.debit || 0);
    }
  }
  const entries = await JournalEntry.find({ tenantId, status: "posted", ...bounds(from, to) }).select("entryDate entryNumber reference description sourceType sourceId lines").lean();
  let balance = openingBalance;
  let periodDebit = 0;
  let periodCredit = 0;
  const rows = [];
  for (const entry of entries) {
    for (const line of entry.lines || []) {
      if (String(line.account) !== String(account._id)) continue;
      const debit = Number(line.debit || 0);
      const credit = Number(line.credit || 0);
      periodDebit += debit;
      periodCredit += credit;
      balance += normalDebit ? debit - credit : credit - debit;
      const reference = String(entry.reference || entry.entryNumber || "").trim();
      rows.push({
        _id: entry._id,
        entryDate: entry.entryDate,
        entryNumber: entry.entryNumber || "",
        reference,
        description: entry.description || "",
        sourceType: entry.sourceType || "manual",
        sourceId: entry.sourceId || null,
        isDemoReference: /(^|[-_\s])DEMO([-_\s]|$)/i.test(reference),
        debit: money(debit),
        credit: money(credit),
        balance: money(balance),
      });
    }
  }
  return {
    account: code,
    rows,
    openingBalance: money(openingBalance),
    periodDebit: money(periodDebit),
    periodCredit: money(periodCredit),
    closingBalance: money(balance),
    accountFound: true,
  };
}

export const getCustomerLedgerReport = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    return res.json({ success: true, data: await getControlLedger({ tenantId, code: "1100", from: req.query.from, to: req.query.to, normalDebit: true }) });
  } catch (error) {
    next(error);
  }
};

export const getSupplierLedgerReport = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    return res.json({ success: true, data: await getControlLedger({ tenantId, code: "2000", from: req.query.from, to: req.query.to, normalDebit: false }) });
  } catch (error) {
    next(error);
  }
};

const serviceForInvoice = (invoice) => invoice.hospitalityType || (invoice.hospitalityBooking ? "hotel" : "tour");
const paymentServiceMatches = (payment, invoice) => {
  if (!invoice) return false;
  if (payment.invoiceNumber && invoice.invoiceNumber && String(payment.invoiceNumber) === String(invoice.invoiceNumber)) return true;
  if (invoice.booking && payment.booking && String(invoice.booking) === String(payment.booking)) return true;
  if (invoice.hospitalityBooking && payment.hospitalityBooking && String(invoice.hospitalityBooking) === String(payment.hospitalityBooking)) return true;
  return false;
};

export const getProfitabilityReport = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const invoiceFilter = mergeTenantFilter(req, {
      isDeleted: { $ne: true },
      status: { $nin: ["draft", "cancelled"] },
      ...periodFilter(req.query.from, req.query.to),
    });
    const paymentFilter = mergeTenantFilter(req, { status: { $in: PAYMENT_STATUSES } });
    if (req.query.from || req.query.to) paymentFilter.paidAt = bounds(req.query.from, req.query.to, "paidAt").paidAt;
    const [invoices, payments] = await Promise.all([
      Invoice.find(invoiceFilter).select("_id booking hospitalityBooking hospitalityType invoiceNumber totalAmount tax taxableAmount taxType status issueDate").lean(),
      Payment.find(paymentFilter).select("_id booking hospitalityBooking hospitalityType invoiceNumber amount refundedAmount status paidAt transactionReference transactionId mpesaReceiptNumber").lean(),
    ]);
    const invoiceById = new Map(invoices.map((invoice) => [String(invoice._id), invoice]));
    const invoiceByNumber = new Map(invoices.filter((i) => i.invoiceNumber).map((invoice) => [String(invoice.invoiceNumber), invoice]));
    const invoiceByBooking = new Map(invoices.filter((i) => i.booking).map((invoice) => [String(invoice.booking), invoice]));
    const invoiceByHospitalityBooking = new Map(invoices.filter((i) => i.hospitalityBooking).map((invoice) => [String(invoice.hospitalityBooking), invoice]));
    const groups = new Map();
    for (const invoice of invoices) {
      const key = serviceForInvoice(invoice);
      const row = groups.get(key) || { serviceType: key, invoiced: 0, collected: 0, refunded: 0, invoiceCount: 0, linkedPaymentCount: 0, unmatchedPaymentCount: 0, unmatchedPaymentAmount: 0, vat: 0 };
      row.invoiced += Math.max(0, Number(invoice.totalAmount || 0));
      row.vat += Math.max(0, Number(invoice.tax || 0));
      row.invoiceCount += 1;
      groups.set(key, row);
    }
    let unmatchedPaymentCount = 0;
    let unmatchedPaymentAmount = 0;
    for (const payment of payments) {
      const linkedInvoice = (payment.invoiceNumber && invoiceByNumber.get(String(payment.invoiceNumber)))
        || (payment.booking && invoiceByBooking.get(String(payment.booking)))
        || (payment.hospitalityBooking && invoiceByHospitalityBooking.get(String(payment.hospitalityBooking)))
        || null;
      if (!paymentServiceMatches(payment, linkedInvoice)) {
        unmatchedPaymentCount += 1;
        unmatchedPaymentAmount += Math.max(0, Number(payment.amount || 0));
        continue;
      }
      const key = serviceForInvoice(linkedInvoice);
      const row = groups.get(key) || { serviceType: key, invoiced: 0, collected: 0, refunded: 0, invoiceCount: 0, linkedPaymentCount: 0, unmatchedPaymentCount: 0, unmatchedPaymentAmount: 0, vat: 0 };
      if (String(payment.status).toLowerCase() === "completed") row.collected += Math.max(0, Number(payment.amount || 0));
      row.refunded += Math.max(0, Number(payment.refundedAmount || 0));
      row.linkedPaymentCount += 1;
      groups.set(key, row);
    }
    const data = [...groups.values()].map((row) => {
      const netCollected = Math.max(0, row.collected - row.refunded);
      const outstanding = Math.max(0, row.invoiced - netCollected);
      return {
        serviceType: row.serviceType,
        invoiced: money(row.invoiced),
        collected: money(row.collected),
        refunded: money(row.refunded),
        netCollected: money(netCollected),
        outstanding: money(outstanding),
        collectionRate: row.invoiced ? money((netCollected / row.invoiced) * 100) : null,
        invoiceCount: row.invoiceCount,
        linkedPaymentCount: row.linkedPaymentCount,
        vat: money(row.vat),
        reconciliationStatus: row.linkedPaymentCount === 0 && row.invoiced > 0 ? "uncollected_or_unlinked" : "linked",
      };
    });
    return res.json({
      success: true,
      data,
      reconciliation: {
        unmatchedPaymentCount,
        unmatchedPaymentAmount: money(unmatchedPaymentAmount),
        status: unmatchedPaymentCount ? "review_required" : "reconciled",
        note: unmatchedPaymentCount ? "Completed/refunded payments in the period could not be linked to a qualifying invoice by invoice number, tour booking or hospitality booking. They are excluded from service totals to prevent misclassification." : "All qualifying payments are linked to a qualifying invoice.",
      },
    });
  } catch (error) {
    next(error);
  }
};
