import JournalEntry from "../models/JournalEntry.js";
import ChartOfAccount from "../models/ChartOfAccount.js";
import Payment from "../models/Payment.js";
import Invoice from "../models/Invoice.js";
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

const money = (n) => Math.round(Number(n || 0) * 100) / 100;
const TAX_ACCOUNT_CODES = ["2100", "2110", "2120", "2130"];
const STATUTORY_CONTROL_ACCOUNT_CODES = ["2140", "2150"];
const CONTROL_ACCOUNT_CODES = [...TAX_ACCOUNT_CODES, ...STATUTORY_CONTROL_ACCOUNT_CODES];
const PAYMENT_STATUSES = ["completed", "refunded"];
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;

const startOfDay = (value) => value ? new Date(`${value}T00:00:00.000Z`) : null;
const startOfNextDay = (value) => {
  const date = startOfDay(value);
  if (!date || Number.isNaN(date.getTime())) return null;
  date.setUTCDate(date.getUTCDate() + 1);
  return date;
};

const bounds = (from, to, field = "entryDate") => {
  const filter = {};
  const start = startOfDay(from);
  const end = startOfNextDay(to);
  if (start && !Number.isNaN(start.getTime())) filter.$gte = start;
  if (end && !Number.isNaN(end.getTime())) filter.$lt = end;
  return Object.keys(filter).length ? { [field]: filter } : {};
};
const before = (from, field = "entryDate") => {
  const start = startOfDay(from);
  return start && !Number.isNaN(start.getTime()) ? { [field]: { $lt: start } } : {};
};
const isWithin = (value, from, to) => {
  if (!value) return false;
  const date = new Date(value).getTime();
  if (!Number.isFinite(date)) return false;
  const start = startOfDay(from)?.getTime();
  const end = startOfNextDay(to)?.getTime();
  if (Number.isFinite(start) && date < start) return false;
  if (Number.isFinite(end) && date >= end) return false;
  return true;
};
const pagination = (query) => {
  const page = Math.max(1, Number.parseInt(query?.page, 10) || 1);
  const pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, Number.parseInt(query?.pageSize || query?.limit, 10) || DEFAULT_PAGE_SIZE));
  return { page, pageSize, skip: (page - 1) * pageSize };
};

async function journalBalances(tenantId, from, to, codes = CONTROL_ACCOUNT_CODES) {
  const accounts = await ChartOfAccount.find({ tenantId, code: { $in: codes }, active: true }).lean();
  const ids = new Map(accounts.map((a) => [String(a._id), a]));
  const entries = await JournalEntry.find({ tenantId, status: "posted", ...bounds(from, to) }).select("entryDate reference entryNumber description sourceType sourceId lines").lean();
  const balances = new Map();
  for (const entry of entries) {
    for (const line of entry.lines || []) {
      const account = ids.get(String(line.account));
      if (!account) continue;
      const row = balances.get(account.code) || { code: account.code, name: account.name, type: account.type, subtype: account.subtype || "", debit: 0, credit: 0 };
      row.debit += Number(line.debit || 0);
      row.credit += Number(line.credit || 0);
      balances.set(account.code, row);
    }
  }
  return {
    accounts,
    rows: [...balances.values()].map((row) => ({
      ...row,
      category: TAX_ACCOUNT_CODES.includes(row.code) ? "tax" : "statutory",
      debit: money(row.debit),
      credit: money(row.credit),
      balance: money(["asset", "expense"].includes(row.type) ? row.debit - row.credit : row.credit - row.debit),
    })),
  };
}

const periodFilter = (from, to) => bounds(from, to, "issueDate");

export const getTaxControlReport = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const from = req.query.from;
    const to = req.query.to;
    const journal = await journalBalances(tenantId, from, to);
    const rows = journal.rows;
    const by = new Map(rows.map((row) => [row.code, row]));
    const outputVat = by.get("2110")?.balance ?? null;
    const inputVat = by.get("2120")?.balance ?? null;
    const wht = by.get("2130")?.balance ?? null;
    const generalTaxPayable = by.get("2100")?.balance ?? null;
    const invoiceFilter = mergeTenantFilter(req, { isDeleted: { $ne: true }, status: { $nin: ["draft", "cancelled"] }, ...periodFilter(from, to) });
    const invoices = await Invoice.find(invoiceFilter).select("tax taxableAmount taxType totalAmount invoiceNumber hospitalityType issueDate").lean();
    const invoiceVatBasis = money(invoices.reduce((sum, invoice) => sum + Math.max(0, Number(invoice.tax || 0)), 0));
    const postedTaxActivity = money(rows.filter((row) => row.category === "tax").reduce((sum, row) => sum + Math.abs(Number(row.debit || 0)) + Math.abs(Number(row.credit || 0)), 0));
    const invoiceOutputVatVariance = outputVat == null ? null : money(invoiceVatBasis - outputVat);
    const configuredTaxAccounts = journal.accounts.filter((account) => TAX_ACCOUNT_CODES.includes(account.code));
    const configuredStatutoryAccounts = journal.accounts.filter((account) => STATUTORY_CONTROL_ACCOUNT_CODES.includes(account.code));
    return res.json({
      success: true,
      data: {
        period: { from: from || null, to: to || null },
        rows,
        outputVat: money(outputVat),
        inputVat: money(inputVat),
        netVat: outputVat == null || inputVat == null ? null : money(outputVat - inputVat),
        withholdingTaxPayable: money(wht),
        generalTaxPayable: money(generalTaxPayable),
        reconciliation: {
          configuredTaxAccounts: configuredTaxAccounts.length,
          expectedTaxAccounts: TAX_ACCOUNT_CODES.length,
          availableTaxAccounts: configuredTaxAccounts.map((account) => account.code),
          configuredStatutoryAccounts: configuredStatutoryAccounts.length,
          expectedStatutoryAccounts: STATUTORY_CONTROL_ACCOUNT_CODES.length,
          availableStatutoryAccounts: configuredStatutoryAccounts.map((account) => account.code),
          invoiceCount: invoices.length,
          invoiceVatBasis,
          postedTaxActivity,
          invoiceOutputVatVariance,
          status: invoices.length === 0 && rows.length === 0 ? "no_activity" : "reviewable",
          note: "Invoice VAT is a supporting basis only; posted tax journals remain the accounting control balance. The invoice VAT basis is compared with the posted Output VAT control only; differences may represent opening balances, adjustments, reversals or timing and require review rather than automatic correction.",
        },
      },
    });
  } catch (error) { next(error); }
};

async function getControlLedger({ tenantId, code, from, to, normalDebit, page, pageSize }) {
  const account = await ChartOfAccount.findOne({ tenantId, code, active: true }).lean();
  if (!account) return { account: code, rows: [], openingBalance: null, periodDebit: null, periodCredit: null, closingBalance: null, accountFound: false, pagination: { page, pageSize, total: 0, pages: 0 } };
  const openingEntries = from ? await JournalEntry.find({ tenantId, status: "posted", ...before(from) }).select("lines").lean() : [];
  let openingBalance = 0;
  for (const entry of openingEntries) for (const line of entry.lines || []) if (String(line.account) === String(account._id)) openingBalance += normalDebit ? Number(line.debit || 0) - Number(line.credit || 0) : Number(line.credit || 0) - Number(line.debit || 0);
  const entries = await JournalEntry.find({ tenantId, status: "posted", ...bounds(from, to) }).select("entryDate entryNumber reference description sourceType sourceId lines").sort({ entryDate: 1, _id: 1 }).lean();
  let balance = openingBalance;
  let periodDebit = 0;
  let periodCredit = 0;
  const rows = [];
  for (const entry of entries) for (const line of entry.lines || []) {
    if (String(line.account) !== String(account._id)) continue;
    const debit = Number(line.debit || 0);
    const credit = Number(line.credit || 0);
    periodDebit += debit;
    periodCredit += credit;
    balance += normalDebit ? debit - credit : credit - debit;
    const reference = String(entry.reference || entry.entryNumber || "").trim();
    rows.push({ _id: entry._id, entryDate: entry.entryDate, entryNumber: entry.entryNumber || "", reference, description: entry.description || "", sourceType: entry.sourceType || "manual", sourceId: entry.sourceId || null, isDemoReference: /(^|[-_\s])DEMO([-_\s]|$)/i.test(reference), debit: money(debit), credit: money(credit), balance: money(balance) });
  }
  const total = rows.length;
  const pages = total ? Math.ceil(total / pageSize) : 0;
  const currentPage = pages ? Math.min(page, pages) : 1;
  const start = (currentPage - 1) * pageSize;
  return { account: code, rows: rows.slice(start, start + pageSize), openingBalance: money(openingBalance), periodDebit: money(periodDebit), periodCredit: money(periodCredit), closingBalance: money(balance), accountFound: true, pagination: { page: currentPage, pageSize, total, pages } };
}

export const getCustomerLedgerReport = async (req, res, next) => {
  try { const tenantId = requireTenantId(); const { page, pageSize } = pagination(req.query); return res.json({ success: true, data: await getControlLedger({ tenantId, code: "1100", from: req.query.from, to: req.query.to, normalDebit: true, page, pageSize }) }); } catch (error) { next(error); }
};
export const getSupplierLedgerReport = async (req, res, next) => {
  try { const tenantId = requireTenantId(); const { page, pageSize } = pagination(req.query); return res.json({ success: true, data: await getControlLedger({ tenantId, code: "2000", from: req.query.from, to: req.query.to, normalDebit: false, page, pageSize }) }); } catch (error) { next(error); }
};

const serviceForInvoice = (invoice) => invoice.hospitalityType || (invoice.hospitalityBooking ? "hotel" : "tour");
const paymentServiceMatches = (payment, invoice) => {
  if (!invoice) return false;
  if (payment.invoiceNumber && invoice.invoiceNumber && String(payment.invoiceNumber) === String(invoice.invoiceNumber)) return true;
  if (invoice.booking && payment.booking && String(invoice.booking) === String(payment.booking)) return true;
  if (invoice.hospitalityBooking && payment.hospitalityBooking && String(invoice.hospitalityBooking) === String(payment.hospitalityBooking)) return true;
  return false;
};
const paymentPeriodActivity = (payment, from, to) => ({
  collected: isWithin(payment.paidAt, from, to) ? Math.max(0, Number(payment.amount || 0)) : 0,
  refunded: isWithin(payment.refundedAt, from, to) ? Math.max(0, Number(payment.refundedAmount || 0)) : 0,
});

export const getProfitabilityReport = async (req, res, next) => {
  try {
    const tenantId = requireTenantId();
    const from = req.query.from;
    const to = req.query.to;
    const invoiceFilter = mergeTenantFilter(req, { isDeleted: { $ne: true }, status: { $nin: ["draft", "cancelled"] }, ...periodFilter(from, to) });
    const paymentFilter = mergeTenantFilter(req, { status: { $in: PAYMENT_STATUSES } });
    const paymentDateOr = [];
    if (from || to) {
      if (from || to) paymentDateOr.push(bounds(from, to, "paidAt"));
      if (from || to) paymentDateOr.push(bounds(from, to, "refundedAt"));
      paymentFilter.$or = paymentDateOr;
    }
    const [invoices, payments] = await Promise.all([
      Invoice.find(invoiceFilter).select("_id booking hospitalityBooking hospitalityType invoiceNumber totalAmount tax taxableAmount taxType status issueDate").lean(),
      Payment.find(paymentFilter).select("_id booking hospitalityBooking hospitalityType invoiceNumber amount refundedAmount status paidAt refundedAt transactionReference transactionId mpesaReceiptNumber").lean(),
    ]);

    // The service totals use invoices issued in the selected period, but a collection can
    // legitimately settle an invoice issued before the period. Resolve those payment links
    // against the referenced invoices instead of falsely classifying them as unmatched.
    const candidateInvoiceNumbers = [...new Set(payments.map((p) => String(p.invoiceNumber || "").trim()).filter(Boolean))];
    const candidateBookings = [...new Set(payments.map((p) => p.booking).filter(Boolean).map(String))];
    const candidateHospitalityBookings = [...new Set(payments.map((p) => p.hospitalityBooking).filter(Boolean).map(String))];
    const linkFilters = [];
    if (candidateInvoiceNumbers.length) linkFilters.push({ invoiceNumber: { $in: candidateInvoiceNumbers } });
    if (candidateBookings.length) linkFilters.push({ booking: { $in: candidateBookings } });
    if (candidateHospitalityBookings.length) linkFilters.push({ hospitalityBooking: { $in: candidateHospitalityBookings } });
    const linkedInvoices = linkFilters.length ? await Invoice.find(mergeTenantFilter(req, { isDeleted: { $ne: true }, $or: linkFilters })).select("_id booking hospitalityBooking hospitalityType invoiceNumber totalAmount issueDate").lean() : [];

    const allLinkableInvoices = [...linkedInvoices, ...invoices];
    const invoiceByNumber = new Map(allLinkableInvoices.filter((i) => i.invoiceNumber).map((invoice) => [String(invoice.invoiceNumber), invoice]));
    const invoiceByBooking = new Map(allLinkableInvoices.filter((i) => i.booking).map((invoice) => [String(invoice.booking), invoice]));
    const invoiceByHospitalityBooking = new Map(allLinkableInvoices.filter((i) => i.hospitalityBooking).map((invoice) => [String(invoice.hospitalityBooking), invoice]));
    const groups = new Map();
    const createRow = (serviceType) => ({ serviceType, invoiced: 0, collected: 0, refunded: 0, invoiceCount: 0, linkedPaymentCount: 0, unlinkedTypedPaymentCount: 0, outsidePeriodLinkedPaymentCount: 0, vat: 0 });
    for (const invoice of invoices) {
      const key = serviceForInvoice(invoice);
      const row = groups.get(key) || createRow(key);
      row.invoiced += Math.max(0, Number(invoice.totalAmount || 0));
      row.vat += Math.max(0, Number(invoice.tax || 0));
      row.invoiceCount += 1;
      groups.set(key, row);
    }

    let unmatchedPaymentCount = 0;
    let unmatchedPaymentAmount = 0;
    let outsidePeriodLinkedPaymentCount = 0;
    let outsidePeriodLinkedPaymentAmount = 0;
    for (const payment of payments) {
      const linkedInvoice = (payment.invoiceNumber && invoiceByNumber.get(String(payment.invoiceNumber))) || (payment.booking && invoiceByBooking.get(String(payment.booking))) || (payment.hospitalityBooking && invoiceByHospitalityBooking.get(String(payment.hospitalityBooking))) || null;
      const activity = paymentPeriodActivity(payment, from, to);
      const activityAmount = activity.collected + activity.refunded;
      if (!paymentServiceMatches(payment, linkedInvoice)) {
        const typedService = ["tour", "hotel", "airport_transfer"].includes(String(payment.hospitalityType || "")) ? String(payment.hospitalityType) : null;
        if (typedService) {
          const row = groups.get(typedService) || createRow(typedService);
          row.collected += activity.collected;
          row.refunded += activity.refunded;
          row.unlinkedTypedPaymentCount += 1;
          groups.set(typedService, row);
        }
        unmatchedPaymentCount += 1;
        unmatchedPaymentAmount += activityAmount;
        continue;
      }
      const key = serviceForInvoice(linkedInvoice);
      const row = groups.get(key) || createRow(key);
      row.collected += activity.collected;
      row.refunded += activity.refunded;
      row.linkedPaymentCount += 1;
      if (!invoices.some((invoice) => String(invoice._id) === String(linkedInvoice._id))) {
        row.outsidePeriodLinkedPaymentCount += 1;
        outsidePeriodLinkedPaymentCount += 1;
        outsidePeriodLinkedPaymentAmount += activityAmount;
      }
      groups.set(key, row);
    }

    const data = [...groups.values()].map((row) => {
      const netCollected = row.collected - row.refunded;
      const outstanding = Math.max(0, row.invoiced - Math.max(0, netCollected));
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
        unlinkedTypedPaymentCount: row.unlinkedTypedPaymentCount,
        outsidePeriodLinkedPaymentCount: row.outsidePeriodLinkedPaymentCount,
        vat: money(row.vat),
        reconciliationStatus: row.unlinkedTypedPaymentCount ? "typed_payment_unlinked" : row.linkedPaymentCount === 0 && row.invoiced > 0 ? "uncollected_or_unlinked" : "linked",
      };
    });
    return res.json({
      success: true,
      data,
      reconciliation: {
        unmatchedPaymentCount,
        unmatchedPaymentAmount: money(unmatchedPaymentAmount),
        outsidePeriodLinkedPaymentCount,
        outsidePeriodLinkedPaymentAmount: money(outsidePeriodLinkedPaymentAmount),
        status: unmatchedPaymentCount ? "review_required" : "reconciled",
        note: unmatchedPaymentCount
          ? "Qualifying payments were linked to invoices where a reliable invoice, booking or hospitality-booking relationship exists. Unlinked payments remain flagged; payments linked to invoices issued outside the reporting period are retained as valid collections and identified separately."
          : outsidePeriodLinkedPaymentCount
            ? "All qualifying payments are linked. Some collections settle invoices issued outside the reporting period and are identified separately from period invoice billing."
            : "All qualifying payments are linked to qualifying invoices.",
      },
    });
  } catch (error) { next(error); }
};