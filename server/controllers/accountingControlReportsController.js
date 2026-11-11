/**
 * Purpose: accounting Control Reports Controller HTTP controller. Main declarations: money, startOfDay, startOfNextDay, bounds, before.
 * Inline comments explain the purpose of important declarations and executable blocks.
 */
import JournalEntry from "../models/JournalEntry.js";
// Load ../models/ChartOfAccount.js so this module can use its exported dependencies.
import ChartOfAccount from "../models/ChartOfAccount.js";
// Load ../models/Payment.js so this module can use its exported dependencies.
import Payment from "../models/Payment.js";
// Load ../models/Invoice.js so this module can use its exported dependencies.
import Invoice from "../models/Invoice.js";
// Load ../tenancy/context.js so this module can use its exported dependencies.
import { mergeTenantFilter, requireTenantId } from "../tenancy/context.js";

// Declare money for use by the surrounding module or function.
const money = (n) => Math.round(Number(n || 0) * 100) / 100;
// Declare TAX_ACCOUNT_CODES for use by the surrounding module or function.
const TAX_ACCOUNT_CODES = ["2100", "2110", "2120", "2130"];
// Declare STATUTORY_CONTROL_ACCOUNT_CODES for use by the surrounding module or function.
const STATUTORY_CONTROL_ACCOUNT_CODES = ["2140", "2150"];
// Declare CONTROL_ACCOUNT_CODES for use by the surrounding module or function.
const CONTROL_ACCOUNT_CODES = [...TAX_ACCOUNT_CODES, ...STATUTORY_CONTROL_ACCOUNT_CODES];
// Declare PAYMENT_STATUSES for use by the surrounding module or function.
const PAYMENT_STATUSES = ["completed", "refunded"];
// Declare DEFAULT_PAGE_SIZE for use by the surrounding module or function.
const DEFAULT_PAGE_SIZE = 15;

// Declare startOfDay for use by the surrounding module or function.
const startOfDay = (value) => value ? new Date(`${value}T00:00:00.000Z`) : null;
// Declare startOfNextDay for use by the surrounding module or function.
const startOfNextDay = (value) => {
  // Declare date for use by the surrounding module or function.
  const date = startOfDay(value);
  // Check the condition (!date || Number.isNaN(date.getTime())) and run the matching branch.
  if (!date || Number.isNaN(date.getTime())) return null;
  // Perform the side effect or state update expressed on the following line.
  date.setUTCDate(date.getUTCDate() + 1);
  // Return the value of date to the caller.
  return date;
};
// Declare bounds for use by the surrounding module or function.
const bounds = (from, to, field = "entryDate") => {
  // Declare filter for use by the surrounding module or function.
  const filter = {};
  // Declare start for use by the surrounding module or function.
  const start = startOfDay(from);
  // Declare end for use by the surrounding module or function.
  const end = startOfNextDay(to);
  // Check the condition (start && !Number.isNaN(start.getTime())) and run the matching branch.
  if (start && !Number.isNaN(start.getTime())) filter.$gte = start;
  // Check the condition (end && !Number.isNaN(end.getTime())) and run the matching branch.
  if (end && !Number.isNaN(end.getTime())) filter.$lt = end;
  // Return the expression shown below to the caller.
  return Object.keys(filter).length ? { [field]: filter } : {};
};
// Declare before for use by the surrounding module or function.
const before = (from, field = "entryDate") => {
  // Declare start for use by the surrounding module or function.
  const start = startOfDay(from);
  // Return the expression shown below to the caller.
  return start && !Number.isNaN(start.getTime()) ? { [field]: { $lt: start } } : {};
};
// Declare isWithin for use by the surrounding module or function.
const isWithin = (value, from, to) => {
  // Check the condition (!value) and run the matching branch.
  if (!value) return false;
  // Declare timestamp for use by the surrounding module or function.
  const timestamp = new Date(value).getTime();
  // Check the condition (!Number.isFinite(timestamp)) and run the matching branch.
  if (!Number.isFinite(timestamp)) return false;
  // Declare start for use by the surrounding module or function.
  const start = startOfDay(from)?.getTime();
  // Declare end for use by the surrounding module or function.
  const end = startOfNextDay(to)?.getTime();
  // Check the condition (Number.isFinite(start) && timestamp < start) and run the matching branch.
  if (Number.isFinite(start) && timestamp < start) return false;
  // Check the condition (Number.isFinite(end) && timestamp >= end) and run the matching branch.
  if (Number.isFinite(end) && timestamp >= end) return false;
  // Return the expression shown below to the caller.
  return true;
};
// Declare pagination for use by the surrounding module or function.
const pagination = (query) => {
  // Declare page for use by the surrounding module or function.
  const page = Math.max(1, Number.parseInt(query?.page, 10) || 1);
  // Return the object assembled below to the caller.
  return { page, pageSize: DEFAULT_PAGE_SIZE };
};
// Declare periodFilter for use by the surrounding module or function.
const periodFilter = (from, to) => bounds(from, to, "issueDate");

// Define journalBalances; its parameters and body implement this operation.
async function journalBalances(tenantId, from, to, codes = CONTROL_ACCOUNT_CODES) {
  // Declare accounts for use by the surrounding module or function.
  const accounts = await ChartOfAccount.find({ tenantId, code: { $in: codes }, active: true }).lean();
  // Declare ids for use by the surrounding module or function.
  const ids = new Map(accounts.map((account) => [String(account._id), account]));
  // Declare entries for use by the surrounding module or function.
  const entries = await JournalEntry.find({ tenantId, status: "posted", ...bounds(from, to) })
    .select("entryDate reference entryNumber description sourceType sourceId lines")
    .lean();
  // Declare balances for use by the surrounding module or function.
  const balances = new Map();
  // Repeat the enclosed work for each required iteration.
  for (const entry of entries) {
    // Repeat the enclosed work for each required iteration.
    for (const line of entry.lines || []) {
      // Declare account for use by the surrounding module or function.
      const account = ids.get(String(line.account));
      // Check the condition (!account) and run the matching branch.
      if (!account) continue;
      // Declare row for use by the surrounding module or function.
      const row = balances.get(account.code) || {
        code: account.code, name: account.name, type: account.type,
        subtype: account.subtype || "", debit: 0, credit: 0,
      };
      // Perform the side effect or state update expressed on the following line.
      row.debit += Number(line.debit || 0);
      // Perform the side effect or state update expressed on the following line.
      row.credit += Number(line.credit || 0);
      // Perform the side effect or state update expressed on the following line.
      balances.set(account.code, row);
    }
  }
  // Return the object assembled below to the caller.
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

// Declare getTaxControlReport for use by the surrounding module or function.
export const getTaxControlReport = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Declare tenantId for use by the surrounding module or function.
    const tenantId = requireTenantId();
    // Declare { from, to } for use by the surrounding module or function.
    const { from, to } = req.query;
    // Declare journal for use by the surrounding module or function.
    const journal = await journalBalances(tenantId, from, to);
    // Declare rows for use by the surrounding module or function.
    const rows = journal.rows;
    // Declare by for use by the surrounding module or function.
    const by = new Map(rows.map((row) => [row.code, row]));
    // Declare valueFor for use by the surrounding module or function.
    const valueFor = (code) => by.has(code) ? by.get(code).balance : null;
    // Declare outputVat for use by the surrounding module or function.
    const outputVat = valueFor("2110");
    // Declare inputVat for use by the surrounding module or function.
    const inputVat = valueFor("2120");
    // Declare wht for use by the surrounding module or function.
    const wht = valueFor("2130");
    // Declare generalTaxPayable for use by the surrounding module or function.
    const generalTaxPayable = valueFor("2100");
    // Declare invoiceFilter for use by the surrounding module or function.
    const invoiceFilter = mergeTenantFilter(req, {
      isDeleted: { $ne: true },
      status: { $nin: ["draft", "cancelled"] },
      ...periodFilter(from, to),
    });
    // Declare invoices for use by the surrounding module or function.
    const invoices = await Invoice.find(invoiceFilter)
      .select("tax taxableAmount taxType totalAmount invoiceNumber hospitalityType issueDate")
      .lean();
    // Declare invoiceVatBasis for use by the surrounding module or function.
    const invoiceVatBasis = money(invoices.reduce((sum, invoice) => sum + Math.max(0, Number(invoice.tax || 0)), 0));
    // Declare postedTaxActivity for use by the surrounding module or function.
    const postedTaxActivity = money(rows
      .filter((row) => row.category === "tax")
      .reduce((sum, row) => sum + Math.abs(Number(row.debit || 0)) + Math.abs(Number(row.credit || 0)), 0));
    // Declare invoiceOutputVatVariance for use by the surrounding module or function.
    const invoiceOutputVatVariance = outputVat == null ? null : money(invoiceVatBasis - outputVat);
    // Declare configuredTaxAccounts for use by the surrounding module or function.
    const configuredTaxAccounts = journal.accounts.filter((account) => TAX_ACCOUNT_CODES.includes(account.code));
    // Declare configuredStatutoryAccounts for use by the surrounding module or function.
    const configuredStatutoryAccounts = journal.accounts.filter((account) => STATUTORY_CONTROL_ACCOUNT_CODES.includes(account.code));
    // Return the result of res.json() to the caller.
    return res.json({
      success: true,
      data: {
        period: { from: from || null, to: to || null }, rows,
        outputVat, inputVat,
        netVat: outputVat == null || inputVat == null ? null : money(outputVat - inputVat),
        withholdingTaxPayable: wht, generalTaxPayable,
        reconciliation: {
          configuredTaxAccounts: configuredTaxAccounts.length,
          expectedTaxAccounts: TAX_ACCOUNT_CODES.length,
          availableTaxAccounts: configuredTaxAccounts.map((account) => account.code),
          configuredStatutoryAccounts: configuredStatutoryAccounts.length,
          expectedStatutoryAccounts: STATUTORY_CONTROL_ACCOUNT_CODES.length,
          availableStatutoryAccounts: configuredStatutoryAccounts.map((account) => account.code),
          invoiceCount: invoices.length, invoiceVatBasis, postedTaxActivity, outputVat,
          invoiceOutputVatVariance,
          status: invoices.length === 0 && rows.length === 0 ? "no_activity" : "reviewable",
          note: "Invoice VAT is a supporting basis only; posted tax journals remain the accounting control balance. Differences require review rather than automatic correction.",
        },
      },
    });
  } catch (error) { next(error); }
};

// Define getControlLedger; its parameters and body implement this operation.
async function getControlLedger({ tenantId, code, from, to, normalDebit, page, pageSize }) {
  // Declare account for use by the surrounding module or function.
  const account = await ChartOfAccount.findOne({ tenantId, code, active: true }).lean();
  // Check the condition (!account) and run the matching branch.
  if (!account) return { account: code, rows: [], openingBalance: null, periodDebit: null, periodCredit: null, closingBalance: null, accountFound: false, pagination: { page, pageSize, total: 0, pages: 0 } };
  // Declare openingEntries for use by the surrounding module or function.
  const openingEntries = from ? await JournalEntry.find({ tenantId, status: "posted", ...before(from) }).select("lines").lean() : [];
  // Declare openingBalance for use by the surrounding module or function.
  let openingBalance = 0;
  // Repeat the enclosed work for each required iteration.
  for (const entry of openingEntries) for (const line of entry.lines || []) if (String(line.account) === String(account._id)) openingBalance += normalDebit ? Number(line.debit || 0) - Number(line.credit || 0) : Number(line.credit || 0) - Number(line.debit || 0);
  // Declare entries for use by the surrounding module or function.
  const entries = await JournalEntry.find({ tenantId, status: "posted", ...bounds(from, to) }).select("entryDate entryNumber reference description sourceType sourceId lines").sort({ entryDate: 1, _id: 1 }).lean();
  // Declare balance, periodDebit, periodCredit for use by the surrounding module or function.
  let balance = openingBalance, periodDebit = 0, periodCredit = 0;
  // Declare rows for use by the surrounding module or function.
  const rows = [];
  // Repeat the enclosed work for each required iteration.
  for (const entry of entries) for (const line of entry.lines || []) {
    // Check the condition (String(line.account) !== String(account._id)) and run the matching branch.
    if (String(line.account) !== String(account._id)) continue;
    // Declare debit, credit for use by the surrounding module or function.
    const debit = Number(line.debit || 0), credit = Number(line.credit || 0);
    // Perform the side effect or state update expressed on the following line.
    periodDebit += debit; periodCredit += credit; balance += normalDebit ? debit - credit : credit - debit;
    // Declare reference for use by the surrounding module or function.
    const reference = String(entry.reference || entry.entryNumber || "").trim();
    // Perform the side effect or state update expressed on the following line.
    rows.push({ _id: entry._id, entryDate: entry.entryDate, entryNumber: entry.entryNumber || "", reference, description: entry.description || "", sourceType: entry.sourceType || "manual", sourceId: entry.sourceId || null, isDemoReference: /(^|[-_\s])DEMO([-_\s]|$)/i.test(reference), debit: money(debit), credit: money(credit), balance: money(balance) });
  }
  // Declare total, pages, currentPage, start for use by the surrounding module or function.
  const total = rows.length, pages = total ? Math.ceil(total / pageSize) : 0, currentPage = pages ? Math.min(page, pages) : 1, start = (currentPage - 1) * pageSize;
  // Return the object assembled below to the caller.
  return { account: code, rows: rows.slice(start, start + pageSize), openingBalance: money(openingBalance), periodDebit: money(periodDebit), periodCredit: money(periodCredit), closingBalance: money(balance), accountFound: true, pagination: { page: currentPage, pageSize, total, pages } };
}

// Declare getCustomerLedgerReport for use by the surrounding module or function.
export const getCustomerLedgerReport = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { const tenantId = requireTenantId(); const { page, pageSize } = pagination(req.query); return res.json({ success: true, data: await getControlLedger({ tenantId, code: "1100", from: req.query.from, to: req.query.to, normalDebit: true, page, pageSize }) }); }
  // Handle the error raised by the preceding protected operation.
  catch (error) { next(error); }
};
// Declare getSupplierLedgerReport for use by the surrounding module or function.
export const getSupplierLedgerReport = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try { const tenantId = requireTenantId(); const { page, pageSize } = pagination(req.query); return res.json({ success: true, data: await getControlLedger({ tenantId, code: "2000", from: req.query.from, to: req.query.to, normalDebit: false, page, pageSize }) }); }
  // Handle the error raised by the preceding protected operation.
  catch (error) { next(error); }
};

// Declare serviceForInvoice for use by the surrounding module or function.
const serviceForInvoice = (invoice) => {
  // Check the condition (invoice.hospitalityType === "hotel" || invoice.hospitalityType === "ai) and run the matching branch.
  if (invoice.hospitalityType === "hotel" || invoice.hospitalityType === "airport_transfer") return invoice.hospitalityType;
  // Check the condition (invoice.hospitalityBookingModel === "AirportTransferBooking") and run the matching branch.
  if (invoice.hospitalityBookingModel === "AirportTransferBooking") return "airport_transfer";
  // Check the condition (invoice.hospitalityBookingModel === "HotelBooking") and run the matching branch.
  if (invoice.hospitalityBookingModel === "HotelBooking") return "hotel";
  // Return the expression shown below to the caller.
  return invoice.hospitalityBooking ? "hotel" : "tour";
};
// Declare paymentServiceMatches for use by the surrounding module or function.
const paymentServiceMatches = (payment, invoice) => {
  // Check the condition (!invoice) and run the matching branch.
  if (!invoice) return false;
  // Check the condition (payment.invoiceNumber && invoice.invoiceNumber && String(payment.invoi) and run the matching branch.
  if (payment.invoiceNumber && invoice.invoiceNumber && String(payment.invoiceNumber).trim() === String(invoice.invoiceNumber).trim()) return true;
  // Check the condition (invoice.booking && payment.booking && String(invoice.booking) === Stri) and run the matching branch.
  if (invoice.booking && payment.booking && String(invoice.booking) === String(payment.booking)) return true;
  // Check the condition (invoice.hospitalityBooking && payment.hospitalityBooking && String(inv) and run the matching branch.
  if (invoice.hospitalityBooking && payment.hospitalityBooking && String(invoice.hospitalityBooking) === String(payment.hospitalityBooking)) return true;
  // Check the condition (invoice.paymentReference) and run the matching branch.
  if (invoice.paymentReference) {
    // Declare reference for use by the surrounding module or function.
    const reference = String(invoice.paymentReference).trim();
    // Check the condition (reference && [payment.transactionReference, payment.mpesaReceiptNumber) and run the matching branch.
    if (reference && [payment.transactionReference, payment.mpesaReceiptNumber, payment.transactionId].filter(Boolean).some((value) => String(value).trim() === reference)) return true;
  }
  // Return the expression shown below to the caller.
  return false;
};
// Declare paymentPeriodActivity for use by the surrounding module or function.
const paymentPeriodActivity = (payment, from, to) => ({ collected: isWithin(payment.paidAt, from, to) ? Math.max(0, Number(payment.amount || 0)) : 0, refunded: isWithin(payment.refundedAt, from, to) ? Math.max(0, Number(payment.refundedAmount || 0)) : 0 });
// Declare paymentLinkFilter for use by the surrounding module or function.
const paymentLinkFilter = (invoices) => {
  // Declare invoiceNumbers for use by the surrounding module or function.
  const invoiceNumbers = [...new Set(invoices.map((invoice) => String(invoice.invoiceNumber || "").trim()).filter(Boolean))];
  // Declare bookings for use by the surrounding module or function.
  const bookings = [...new Set(invoices.map((invoice) => invoice.booking).filter(Boolean).map(String))];
  // Declare hospitalityBookings for use by the surrounding module or function.
  const hospitalityBookings = [...new Set(invoices.map((invoice) => invoice.hospitalityBooking).filter(Boolean).map(String))];
  // Declare references for use by the surrounding module or function.
  const references = [...new Set(invoices.map((invoice) => String(invoice.paymentReference || "").trim()).filter(Boolean))];
  // Declare filters for use by the surrounding module or function.
  const filters = [];
  // Check the condition (invoiceNumbers.length) and run the matching branch.
  if (invoiceNumbers.length) filters.push({ invoiceNumber: { $in: invoiceNumbers } });
  // Check the condition (bookings.length) and run the matching branch.
  if (bookings.length) filters.push({ booking: { $in: bookings } });
  // Check the condition (hospitalityBookings.length) and run the matching branch.
  if (hospitalityBookings.length) filters.push({ hospitalityBooking: { $in: hospitalityBookings } });
  // Check the condition (references.length) and run the matching branch.
  if (references.length) filters.push({ $or: [{ transactionReference: { $in: references } }, { mpesaReceiptNumber: { $in: references } }, { transactionId: { $in: references } }] });
  // Return the value of filters to the caller.
  return filters;
};

// Declare getProfitabilityReport for use by the surrounding module or function.
export const getProfitabilityReport = async (req, res, next) => {
  // Run this operation with a dedicated error-handling path for failures.
  try {
    // Perform the side effect or state update expressed on the following line.
    requireTenantId();
    // Declare { from, to } for use by the surrounding module or function.
    const { from, to } = req.query;
    // Declare invoiceFilter for use by the surrounding module or function.
    const invoiceFilter = mergeTenantFilter(req, { isDeleted: { $ne: true }, status: { $nin: ["draft", "cancelled"] }, ...periodFilter(from, to) });
    // Declare periodPaymentFilter for use by the surrounding module or function.
    const periodPaymentFilter = mergeTenantFilter(req, { status: { $in: PAYMENT_STATUSES } });
    // Check the condition (from || to) and run the matching branch.
    if (from || to) periodPaymentFilter.$or = [bounds(from, to, "paidAt"), bounds(from, to, "refundedAt")];
    // Declare invoices for use by the surrounding module or function.
    const invoices = await Invoice.find(invoiceFilter).select("_id booking hospitalityBooking hospitalityBookingModel hospitalityType invoiceNumber paymentReference amountPaid balance paymentMethod totalAmount tax").lean();
    // Declare allLinkFilters for use by the surrounding module or function.
    const allLinkFilters = paymentLinkFilter(invoices);
    // Declare [periodPayments, linkedPayments] for use by the surrounding module or function.
    const [periodPayments, linkedPayments] = await Promise.all([
      Payment.find(periodPaymentFilter).select("_id booking hospitalityBooking hospitalityType invoiceNumber amount refundedAmount status paidAt refundedAt transactionReference transactionId mpesaReceiptNumber").lean(),
      allLinkFilters.length ? Payment.find(mergeTenantFilter(req, { status: { $in: PAYMENT_STATUSES }, $or: allLinkFilters })).select("_id booking hospitalityBooking hospitalityType invoiceNumber amount refundedAmount status paidAt refundedAt transactionReference transactionId mpesaReceiptNumber").lean() : [],
    ]);
    // Declare invoiceByNumber for use by the surrounding module or function.
    const invoiceByNumber = new Map(invoices.filter((invoice) => invoice.invoiceNumber).map((invoice) => [String(invoice.invoiceNumber).trim(), invoice]));
    // Declare invoiceByBooking for use by the surrounding module or function.
    const invoiceByBooking = new Map(invoices.filter((invoice) => invoice.booking).map((invoice) => [String(invoice.booking), invoice]));
    // Declare invoiceByHospitalityBooking for use by the surrounding module or function.
    const invoiceByHospitalityBooking = new Map(invoices.filter((invoice) => invoice.hospitalityBooking).map((invoice) => [String(invoice.hospitalityBooking), invoice]));
    // Declare invoiceByPaymentReference for use by the surrounding module or function.
    const invoiceByPaymentReference = new Map(invoices.filter((invoice) => invoice.paymentReference).map((invoice) => [String(invoice.paymentReference).trim(), invoice]));
    // Declare linkedInvoiceForPayment for use by the surrounding module or function.
    const linkedInvoiceForPayment = (payment) => (payment.invoiceNumber && invoiceByNumber.get(String(payment.invoiceNumber).trim())) || (payment.booking && invoiceByBooking.get(String(payment.booking))) || (payment.hospitalityBooking && invoiceByHospitalityBooking.get(String(payment.hospitalityBooking))) || (payment.transactionReference && invoiceByPaymentReference.get(String(payment.transactionReference).trim())) || (payment.mpesaReceiptNumber && invoiceByPaymentReference.get(String(payment.mpesaReceiptNumber).trim())) || (payment.transactionId && invoiceByPaymentReference.get(String(payment.transactionId).trim())) || null;
    // Declare linkedInvoiceIds for use by the surrounding module or function.
    const linkedInvoiceIds = new Set();
    // Repeat the enclosed work for each required iteration.
    for (const payment of linkedPayments) { const invoice = linkedInvoiceForPayment(payment); if (invoice && paymentServiceMatches(payment, invoice)) linkedInvoiceIds.add(String(invoice._id)); }
    // Declare groups for use by the surrounding module or function.
    const groups = new Map();
    // Declare createRow for use by the surrounding module or function.
    const createRow = (serviceType) => ({ serviceType, invoiced: 0, collected: 0, refunded: 0, invoiceCount: 0, linkedPaymentCount: 0, unlinkedTypedPaymentCount: 0, outsidePeriodLinkedPaymentCount: 0, recordedPaymentCount: 0, recordedPaymentAmount: 0, vat: 0 });
    // Repeat the enclosed work for each required iteration.
    for (const invoice of invoices) {
      // Declare key, row for use by the surrounding module or function.
      const key = serviceForInvoice(invoice), row = groups.get(key) || createRow(key);
      // Perform the side effect or state update expressed on the following line.
      row.invoiced += Math.max(0, Number(invoice.totalAmount || 0)); row.vat += Math.max(0, Number(invoice.tax || 0)); row.invoiceCount += 1;
      // Declare recordedPaid for use by the surrounding module or function.
      const recordedPaid = Math.max(0, Number(invoice.amountPaid || 0));
      // Check the condition (recordedPaid > 0 && !linkedInvoiceIds.has(String(invoice._id))) and run the matching branch.
      if (recordedPaid > 0 && !linkedInvoiceIds.has(String(invoice._id))) { row.recordedPaymentCount += 1; row.recordedPaymentAmount += recordedPaid; }
      // Perform the side effect or state update expressed on the following line.
      groups.set(key, row);
    }
    // Declare unmatchedPaymentCount, unmatchedPaymentAmount, outsidePeriodLinkedPaymentCount, outsidePeriodLinkedPaymentAmount for use by the surrounding module or function.
    let unmatchedPaymentCount = 0, unmatchedPaymentAmount = 0, outsidePeriodLinkedPaymentCount = 0, outsidePeriodLinkedPaymentAmount = 0;
    // Repeat the enclosed work for each required iteration.
    for (const payment of periodPayments) {
      // Declare linkedInvoice, activity, activityAmount for use by the surrounding module or function.
      const linkedInvoice = linkedInvoiceForPayment(payment), activity = paymentPeriodActivity(payment, from, to), activityAmount = activity.collected + activity.refunded;
      // Check the condition (!paymentServiceMatches(payment, linkedInvoice)) and run the matching branch.
      if (!paymentServiceMatches(payment, linkedInvoice)) {
        // Declare typedService for use by the surrounding module or function.
        const typedService = ["tour", "hotel", "airport_transfer"].includes(String(payment.hospitalityType || "")) ? String(payment.hospitalityType) : null;
        // Check the condition (typedService) and run the matching branch.
        if (typedService) { const row = groups.get(typedService) || createRow(typedService); row.collected += activity.collected; row.refunded += activity.refunded; row.unlinkedTypedPaymentCount += 1; groups.set(typedService, row); }
        // Perform the side effect or state update expressed on the following line.
        unmatchedPaymentCount += 1; unmatchedPaymentAmount += activityAmount; continue;
      }
      // Declare key, row for use by the surrounding module or function.
      const key = serviceForInvoice(linkedInvoice), row = groups.get(key) || createRow(key);
      // Perform the side effect or state update expressed on the following line.
      row.collected += activity.collected; row.refunded += activity.refunded; row.linkedPaymentCount += 1;
      // Check the condition (!invoices.some((invoice) => String(invoice._id) === String(linkedInvoi) and run the matching branch.
      if (!invoices.some((invoice) => String(invoice._id) === String(linkedInvoice._id))) { row.outsidePeriodLinkedPaymentCount += 1; outsidePeriodLinkedPaymentCount += 1; outsidePeriodLinkedPaymentAmount += activityAmount; }
      // Perform the side effect or state update expressed on the following line.
      groups.set(key, row);
    }
    // Declare data for use by the surrounding module or function.
    const data = [...groups.values()].map((row) => {
      // Declare netCollected, outstanding for use by the surrounding module or function.
      const netCollected = row.collected - row.refunded, outstanding = Math.max(0, row.invoiced - Math.max(0, netCollected));
      // Declare reconciliationStatus for use by the surrounding module or function.
      let reconciliationStatus = "linked";
      // Check the condition (row.unlinkedTypedPaymentCount) and run the matching branch.
      if (row.unlinkedTypedPaymentCount) reconciliationStatus = "typed_payment_unlinked";
      else if (row.recordedPaymentCount > 0) reconciliationStatus = "recorded_payment_unlinked";
      else if (row.linkedPaymentCount === 0 && row.invoiced > 0) reconciliationStatus = "uncollected";
      // Return the object assembled below to the caller.
      return { serviceType: row.serviceType, invoiced: money(row.invoiced), collected: money(row.collected), refunded: money(row.refunded), netCollected: money(netCollected), outstanding: money(outstanding), collectionRate: row.invoiced ? money((netCollected / row.invoiced) * 100) : null, invoiceCount: row.invoiceCount, linkedPaymentCount: row.linkedPaymentCount, unlinkedTypedPaymentCount: row.unlinkedTypedPaymentCount, outsidePeriodLinkedPaymentCount: row.outsidePeriodLinkedPaymentCount, recordedPaymentCount: row.recordedPaymentCount, recordedPaymentAmount: money(row.recordedPaymentAmount), vat: money(row.vat), reconciliationStatus };
    });
    // Return the result of res.json() to the caller.
    return res.json({ success: true, data, reconciliation: { unmatchedPaymentCount, unmatchedPaymentAmount: money(unmatchedPaymentAmount), outsidePeriodLinkedPaymentCount, outsidePeriodLinkedPaymentAmount: money(outsidePeriodLinkedPaymentAmount), recordedPaymentGapCount: data.reduce((sum, row) => sum + row.recordedPaymentCount, 0), recordedPaymentGapAmount: money(data.reduce((sum, row) => sum + row.recordedPaymentAmount, 0)), status: unmatchedPaymentCount ? "review_required" : "reconciled", note: unmatchedPaymentCount ? "Qualifying payments are linked using invoice number, booking, hospitality booking or payment reference. Unlinked payments remain flagged for review." : outsidePeriodLinkedPaymentCount ? "All qualifying period payments are linked. Collections settling invoices issued outside the reporting period remain valid and are identified separately." : "All qualifying payments are linked to qualifying invoices." } });
  } catch (error) { next(error); }
};